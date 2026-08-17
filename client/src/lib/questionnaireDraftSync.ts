const DRAFT_KEY = "autosave_questionnaire-form";
const STEP_KEY = "autosave_questionnaire-step";
const OWNER_KEY = "autosave_questionnaire-owner-v1";
const META_KEY = "autosave_questionnaire-sync-meta-v1";
const POLL_MS = 1200;
const REQUEST_TIMEOUT_MS = 2500;

let pollTimer: number | null = null;
let activeUserId: string | null = null;
let lastObservedDraft = "__uninitialised__";
let writeInFlight: Promise<void> | null = null;

interface AuthUser {
  id?: string;
}

interface DraftResponse {
  revision: number;
  draftData: Record<string, unknown>;
  schemaVersion: number;
  source: "traditional_form";
  draftUpdatedAt: string | null;
  contextUpdatedAt?: string | null;
}

interface SyncMeta {
  userId: string;
  lastSyncedDraft: string;
  serverUpdatedAt: string | null;
}

function safeParseObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function canonicalDraft(value: Record<string, unknown> | null): string {
  if (!value) return "";
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) sorted[key] = value[key];
  return JSON.stringify(sorted);
}

function hasMeaningfulDraft(value: Record<string, unknown> | null): boolean {
  if (!value) return false;
  return Object.entries(value).some(([key, item]) => {
    if (key === "tier") return false;
    if (item === undefined || item === null) return false;
    if (typeof item === "string") return item.trim().length > 0;
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === "object") return Object.keys(item as Record<string, unknown>).length > 0;
    return true;
  });
}

function readMeta(): SyncMeta | null {
  const parsed = safeParseObject(localStorage.getItem(META_KEY));
  if (!parsed || typeof parsed.userId !== "string" || typeof parsed.lastSyncedDraft !== "string") return null;
  return {
    userId: parsed.userId,
    lastSyncedDraft: parsed.lastSyncedDraft,
    serverUpdatedAt: typeof parsed.serverUpdatedAt === "string" ? parsed.serverUpdatedAt : null,
  };
}

function writeMeta(meta: SyncMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function clearLocalQuestionnaireState() {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(STEP_KEY);
  localStorage.removeItem(META_KEY);
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, {
      credentials: "include",
      cache: "no-store",
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function getAuthenticatedUser(): Promise<AuthUser | null | undefined> {
  try {
    const response = await fetchWithTimeout("/api/auth/user");
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) return undefined;
    const data = await response.json();
    return data && typeof data === "object" ? data as AuthUser : undefined;
  } catch {
    // Undefined means connectivity failed; do not destroy local data merely because the network is unavailable.
    return undefined;
  }
}

async function getServerDraft(): Promise<DraftResponse | null> {
  try {
    const response = await fetchWithTimeout("/api/questionnaire/draft");
    if (!response.ok) return null;
    return await response.json() as DraftResponse;
  } catch {
    return null;
  }
}

async function putServerDraft(draftData: Record<string, unknown>, keepalive = false): Promise<void> {
  if (!activeUserId) return;
  const body = JSON.stringify({ draftData });
  const response = await fetch("/api/questionnaire/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    keepalive,
    body,
  });
  if (!response.ok) throw new Error(`Draft save failed with ${response.status}`);
  const data = await response.json() as DraftResponse;
  const canonical = canonicalDraft(draftData);
  writeMeta({
    userId: activeUserId,
    lastSyncedDraft: canonical,
    serverUpdatedAt: data.draftUpdatedAt || null,
  });
}

async function deleteServerDraft(keepalive = false): Promise<void> {
  if (!activeUserId) return;
  const response = await fetch("/api/questionnaire/draft", {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    keepalive,
  });
  if (!response.ok && response.status !== 404) throw new Error(`Draft clear failed with ${response.status}`);
  writeMeta({ userId: activeUserId, lastSyncedDraft: "", serverUpdatedAt: null });
}

function queueWrite(task: () => Promise<void>) {
  const run = async () => {
    try {
      await task();
    } catch (error) {
      console.warn("[Questionnaire draft sync] Server sync failed; local draft remains available.", error);
    }
  };
  writeInFlight = (writeInFlight || Promise.resolve()).then(run, run).finally(() => {
    writeInFlight = null;
  });
}

function flushCurrentDraft(keepalive = false) {
  if (!activeUserId) return;
  const owner = localStorage.getItem(OWNER_KEY);
  if (owner !== activeUserId) return;
  const localDraft = safeParseObject(localStorage.getItem(DRAFT_KEY));
  const canonical = canonicalDraft(localDraft);
  const meta = readMeta();
  if (meta?.userId === activeUserId && meta.lastSyncedDraft === canonical) return;
  if (!hasMeaningfulDraft(localDraft)) {
    void deleteServerDraft(keepalive).catch(() => undefined);
    return;
  }
  void putServerDraft(localDraft!, keepalive).catch(() => undefined);
}

function startPolling() {
  if (pollTimer !== null) window.clearInterval(pollTimer);
  pollTimer = window.setInterval(() => {
    if (!activeUserId || localStorage.getItem(OWNER_KEY) !== activeUserId) return;
    const raw = localStorage.getItem(DRAFT_KEY) || "";
    if (raw === lastObservedDraft) return;
    lastObservedDraft = raw;
    const parsed = safeParseObject(raw);
    if (!hasMeaningfulDraft(parsed)) {
      queueWrite(() => deleteServerDraft(false));
      return;
    }
    queueWrite(() => putServerDraft(parsed!, false));
  }, POLL_MS);
}

/**
 * Hydrates the existing browser auto-save from authenticated server storage before
 * React renders, then mirrors subsequent local questionnaire changes back to the
 * user's server-scoped case context. Legacy unowned browser drafts are deliberately
 * not migrated because their account ownership cannot be proven safely.
 */
export async function initQuestionnaireDraftSync(): Promise<void> {
  if (typeof window === "undefined") return;

  const user = await getAuthenticatedUser();
  if (user === undefined) return;
  if (!user?.id) {
    activeUserId = null;
    clearLocalQuestionnaireState();
    localStorage.removeItem(OWNER_KEY);
    return;
  }

  activeUserId = String(user.id);
  const existingOwner = localStorage.getItem(OWNER_KEY);
  const ownerMatches = existingOwner === activeUserId;

  if (!ownerMatches) {
    // Do not attach an unscoped or another account's browser draft to this user.
    clearLocalQuestionnaireState();
    localStorage.setItem(OWNER_KEY, activeUserId);
  }

  const server = await getServerDraft();
  const serverDraft = server?.draftData && typeof server.draftData === "object"
    ? server.draftData
    : {};
  const localDraft = safeParseObject(localStorage.getItem(DRAFT_KEY));
  const meta = readMeta();

  if (hasMeaningfulDraft(serverDraft)) {
    const serverCanonical = canonicalDraft(serverDraft);
    const localCanonical = canonicalDraft(localDraft);
    const localIsKnownSynced = meta?.userId === activeUserId && meta.lastSyncedDraft === localCanonical;

    // A newer server copy from another device wins over a local copy that was previously synced.
    // Unknown local data never overwrites authenticated server state automatically.
    if (!hasMeaningfulDraft(localDraft) || localIsKnownSynced || !meta) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serverDraft));
      writeMeta({
        userId: activeUserId,
        lastSyncedDraft: serverCanonical,
        serverUpdatedAt: server?.draftUpdatedAt || null,
      });
    }
  } else if (ownerMatches && hasMeaningfulDraft(localDraft)) {
    // This is a draft already tagged to the same account from a previous synced session.
    await putServerDraft(localDraft!);
  } else {
    localStorage.removeItem(DRAFT_KEY);
    writeMeta({ userId: activeUserId, lastSyncedDraft: "", serverUpdatedAt: null });
  }

  lastObservedDraft = localStorage.getItem(DRAFT_KEY) || "";
  startPolling();

  window.addEventListener("pagehide", () => flushCurrentDraft(true), { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCurrentDraft(true);
  });
}