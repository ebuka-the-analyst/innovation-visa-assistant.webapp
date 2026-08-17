const TAB_PARAM = "tab";

function normaliseTabLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requestedTab(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(TAB_PARAM);
  if (!value) return null;
  return normaliseTabLabel(value) || null;
}

function tabKey(tab: HTMLElement): string | null {
  const testId = tab.getAttribute("data-testid") || "";
  if (testId.startsWith("tab-")) {
    const fromTestId = normaliseTabLabel(testId.slice(4));
    if (fromTestId) return fromTestId;
  }
  return normaliseTabLabel(tab.textContent || "") || null;
}

function activateRequestedTab() {
  const requested = requestedTab();
  if (!requested) return;

  const tabs = Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'));
  const tab = tabs.find((candidate) => tabKey(candidate) === requested);
  if (!tab) return;

  const selected = tab.getAttribute("aria-selected") === "true" || tab.getAttribute("data-state") === "active";
  if (!selected) tab.click();
}

let activationTimer: number | null = null;
let activationRetryTimer: number | null = null;

function scheduleTabActivation() {
  if (activationTimer !== null) window.clearTimeout(activationTimer);
  if (activationRetryTimer !== null) window.clearTimeout(activationRetryTimer);
  activationTimer = window.setTimeout(activateRequestedTab, 20);
  activationRetryTimer = window.setTimeout(activateRequestedTab, 180);
}

function persistCurrentTab(tab: HTMLElement) {
  const key = tabKey(tab);
  if (!key) return;

  const url = new URL(window.location.href);
  if (url.searchParams.get(TAB_PARAM) === key) return;
  url.searchParams.set(TAB_PARAM, key);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function navigateWithinApp(href: string) {
  window.history.pushState(window.history.state, "", href);
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  scheduleTabActivation();
}

function workspaceContextHref(anchor: HTMLAnchorElement): string | null {
  const artefact = anchor.closest<HTMLElement>("[data-testid^='application-artefact-']");
  const testId = artefact?.getAttribute("data-testid");
  if (testId === "application-artefact-market-research") return "/tools/market-research?tab=research";
  if (testId === "application-artefact-competitor-analysis") return "/tools/market-research?tab=competitors";
  return null;
}

function previewShell(title: string) {
  const shell = document.createElement("section");
  shell.id = "contextual-business-plan-preview";
  shell.className = "scroll-mt-24 overflow-hidden rounded-xl border border-emerald-200 bg-background shadow-sm dark:border-emerald-900";
  shell.setAttribute("aria-label", "Business Plan preview");

  const header = document.createElement("div");
  header.className = "flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between";

  const copy = document.createElement("div");
  copy.className = "min-w-0";
  copy.innerHTML = `<div class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Business Plan</div><h3 class="text-lg font-semibold">${title}</h3><p class="text-sm text-muted-foreground">Opened inside My Documents so your workspace and navigation remain available.</p>`;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  close.textContent = "Close preview";
  close.addEventListener("click", () => shell.remove());

  header.append(copy, close);

  const body = document.createElement("div");
  body.className = "flex min-h-[420px] items-center justify-center p-4 text-sm text-muted-foreground";
  body.textContent = "Loading business plan…";

  shell.append(header, body);
  return { shell, body };
}

async function openBusinessPlanInsideWorkspace(anchor: HTMLAnchorElement) {
  const workspace = anchor.closest<HTMLElement>("#application-workspace");
  const group = anchor.closest<HTMLElement>("section");
  if (!workspace || !group || !group.parentElement) return false;

  document.getElementById("contextual-business-plan-preview")?.remove();

  const { shell, body } = previewShell("Generated Business Plan");
  group.parentElement.insertBefore(shell, group);
  shell.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const response = await fetch(anchor.href, { credentials: "include", headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error(`Unable to load the business plan (${response.status}).`);
    const html = await response.text();

    body.className = "block min-h-[72vh] p-0";
    body.textContent = "";
    const frame = document.createElement("iframe");
    frame.title = "Generated Business Plan";
    frame.className = "block min-h-[72vh] w-full bg-white";
    frame.setAttribute("sandbox", "allow-downloads");
    frame.setAttribute("data-testid", "embedded-business-plan-frame");
    frame.srcdoc = html;
    body.appendChild(frame);
  } catch (error) {
    body.className = "m-4 min-h-0 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";
    body.textContent = error instanceof Error ? error.message : "Unable to load the business plan.";
  }

  return true;
}

export function initContextualNavigation() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const tab = target.closest<HTMLElement>('[role="tab"]');
    if (tab) {
      window.setTimeout(() => persistCurrentTab(tab), 0);
      return;
    }

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }

    const normalClick = !isModifiedClick(event);
    const inWorkspace = Boolean(anchor.closest("#application-workspace"));

    if (normalClick && inWorkspace && url.origin === window.location.origin && url.pathname.startsWith("/api/view/html/")) {
      event.preventDefault();
      event.stopPropagation();
      void openBusinessPlanInsideWorkspace(anchor);
      return;
    }

    const contextualHref = normalClick && inWorkspace ? workspaceContextHref(anchor) : null;
    if (contextualHref) {
      event.preventDefault();
      event.stopPropagation();
      navigateWithinApp(contextualHref);
      return;
    }

    const isSameOrigin = url.origin === window.location.origin;
    const isDownload = anchor.hasAttribute("download") || url.pathname.startsWith("/api/");

    // Normal internal application navigation remains in the current browser tab.
    // Downloads and raw API document resources retain their native behaviour.
    if (normalClick && isSameOrigin && !isDownload && anchor.target === "_blank") {
      anchor.target = "_self";
    }

    if (isSameOrigin && url.searchParams.has(TAB_PARAM)) scheduleTabActivation();
  };

  const observer = new MutationObserver(() => {
    if (requestedTab()) scheduleTabActivation();
  });

  document.addEventListener("click", onClick, true);
  window.addEventListener("popstate", scheduleTabActivation);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleTabActivation();

  return () => {
    document.removeEventListener("click", onClick, true);
    window.removeEventListener("popstate", scheduleTabActivation);
    observer.disconnect();
    if (activationTimer !== null) window.clearTimeout(activationTimer);
    if (activationRetryTimer !== null) window.clearTimeout(activationRetryTimer);
  };
}
