export type StrictNewsCandidate = {
  title?: string | null;
  url?: string | null;
  publishedAt?: string | null;
};

const MAX_FUTURE_SKEW_MS = 1000 * 60 * 60 * 24;

function normaliseTitle(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function titleDirectlyReferencesInnovatorFounder(article: StrictNewsCandidate): boolean {
  return /\binnovator[\s-]+founder\b/i.test(normaliseTitle(article?.title));
}

export function isOfficialGovUkUrl(value: unknown): boolean {
  try {
    const hostname = new URL(String(value || "")).hostname.toLowerCase();
    return hostname === "gov.uk" || hostname === "www.gov.uk";
  } catch {
    return false;
  }
}

export function strictNewsTimestamp(article: StrictNewsCandidate): number {
  const value = article?.publishedAt;
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function isCurrentCalendarYearTimestamp(timestamp: number, now = Date.now()): boolean {
  if (!timestamp || !Number.isFinite(timestamp)) return false;
  const currentYear = new Date(now).getUTCFullYear();
  const yearStart = Date.UTC(currentYear, 0, 1, 0, 0, 0, 0);
  return timestamp >= yearStart && timestamp <= now + MAX_FUTURE_SKEW_MS;
}

/**
 * Homepage ticker policy: show only official GOV.UK updates from the current
 * calendar year whose page title directly names the Innovator Founder route.
 * `publishedAt` represents the GOV.UK page's update/change timestamp, not the
 * page's original publication date. This lets long-lived official guidance that
 * was genuinely updated this year appear without admitting generic immigration
 * material.
 */
export function isCurrentYearInnovatorFounderUpdate(
  article: StrictNewsCandidate,
  now = Date.now(),
): boolean {
  if (!titleDirectlyReferencesInnovatorFounder(article)) return false;
  if (!isOfficialGovUkUrl(article?.url)) return false;
  return isCurrentCalendarYearTimestamp(strictNewsTimestamp(article), now);
}

// Compatibility name retained for existing callers. The semantics are now
// stricter and current-year based rather than a rolling two-year publication age.
export const isStrictInnovatorFounderNews = isCurrentYearInnovatorFounderUpdate;

export function compareStrictInnovatorFounderNews(
  a: StrictNewsCandidate,
  b: StrictNewsCandidate,
): number {
  return strictNewsTimestamp(b) - strictNewsTimestamp(a);
}
