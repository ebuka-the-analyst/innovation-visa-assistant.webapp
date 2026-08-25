export type StrictNewsCandidate = {
  title?: string | null;
  url?: string | null;
  publishedAt?: string | null;
};

export const STRICT_NEWS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 730; // two years
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

/**
 * Homepage ticker policy: only show directly named Innovator Founder items from
 * GOV.UK with an auditable, current timestamp. We intentionally do not infer
 * relevance from body text, generic visa words, country guidance, sponsor lists
 * or other immigration material.
 */
export function isStrictInnovatorFounderNews(
  article: StrictNewsCandidate,
  now = Date.now(),
): boolean {
  if (!titleDirectlyReferencesInnovatorFounder(article)) return false;
  if (!isOfficialGovUkUrl(article?.url)) return false;

  const timestamp = strictNewsTimestamp(article);
  if (!timestamp) return false;
  if (timestamp < now - STRICT_NEWS_MAX_AGE_MS) return false;
  if (timestamp > now + MAX_FUTURE_SKEW_MS) return false;

  return true;
}

export function compareStrictInnovatorFounderNews(
  a: StrictNewsCandidate,
  b: StrictNewsCandidate,
): number {
  return strictNewsTimestamp(b) - strictNewsTimestamp(a);
}
