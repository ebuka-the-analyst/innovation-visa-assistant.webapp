import {
  compareStrictInnovatorFounderNews,
  isCurrentCalendarYearTimestamp,
  isCurrentYearInnovatorFounderUpdate,
  titleDirectlyReferencesInnovatorFounder,
} from "./newsRelevance";

type NewsArticle = Record<string, any>;

type GovUkSearchResult = {
  title?: string;
  link?: string;
};

type GovUkChange = {
  public_timestamp?: string;
  note?: string;
};

type GovUkContent = {
  title?: string;
  description?: string;
  public_updated_at?: string;
  first_published_at?: string;
  document_type?: string;
  details?: {
    change_history?: GovUkChange[];
  };
};

let govUkCache: { expiresAt: number; items: NewsArticle[] } = {
  expiresAt: 0,
  items: [],
};

// These are durable official route pages. We never hardcode their claims or
// dates; the live GOV.UK Content API supplies the current title, update history
// and change notes on every refresh.
const OFFICIAL_ROUTE_PATHS = [
  "/guidance/immigration-rules/immigration-rules-appendix-innovator-founder",
  "/government/publications/innovator-appendix-w-workers",
  "/government/publications/endorsing-bodies-innovator-founder-and-scale-up-visas",
  "/innovator-founder-visa",
];

const SEARCH_QUERIES = [
  "Innovator Founder",
  "Innovator Founder visa",
  "Innovator Founder caseworker guidance",
  "Innovator Founder endorsing bodies",
  "Appendix Innovator Founder",
];

function govUkPathFromLink(value: unknown): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, "https://www.gov.uk");
    if (url.hostname !== "gov.uk" && url.hostname !== "www.gov.uk") return null;
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
}

async function discoverRoutePaths(): Promise<string[]> {
  const discovered = new Set<string>(OFFICIAL_ROUTE_PATHS);

  const resultSets = await Promise.allSettled(
    SEARCH_QUERIES.map(async (query) => {
      const params = new URLSearchParams({ q: query, count: "30", order: "-public_timestamp" });
      params.append("filter_organisations", "home-office");
      params.append("filter_organisations", "uk-visas-and-immigration");

      const response = await fetch(`https://www.gov.uk/api/search.json?${params.toString()}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) throw new Error(`GOV.UK Search API returned ${response.status}`);
      const payload = (await response.json()) as { results?: GovUkSearchResult[] };
      return Array.isArray(payload?.results) ? payload.results : [];
    }),
  );

  for (const result of resultSets) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (!titleDirectlyReferencesInnovatorFounder({ title: item?.title })) continue;
      const path = govUkPathFromLink(item?.link);
      if (path) discovered.add(path);
    }
  }

  return [...discovered];
}

async function fetchGovUkContent(path: string): Promise<GovUkContent | null> {
  const response = await fetch(`https://www.gov.uk/api/content${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) return null;
  return (await response.json()) as GovUkContent;
}

function normaliseContentUpdates(path: string, content: GovUkContent, now = Date.now()): NewsArticle[] {
  const title = String(content?.title || "").trim();
  if (!title || !titleDirectlyReferencesInnovatorFounder({ title })) return [];

  const url = `https://www.gov.uk${path}`;
  const description = String(content?.description || "").trim() || null;
  const changes = Array.isArray(content?.details?.change_history) ? content.details.change_history : [];
  const currentYearChanges = changes
    .map((change) => ({
      timestamp: change?.public_timestamp ? new Date(change.public_timestamp).getTime() : 0,
      rawTimestamp: change?.public_timestamp || null,
      note: String(change?.note || "").trim() || null,
    }))
    .filter((change) => isCurrentCalendarYearTimestamp(change.timestamp, now))
    .sort((a, b) => b.timestamp - a.timestamp);

  const articles: NewsArticle[] = currentYearChanges.map((change, index) => ({
    id: `govuk:${path}:${change.rawTimestamp || index}`,
    title,
    description: change.note || description,
    content: null,
    sourceName: "GOV.UK (Home Office / UKVI)",
    category: "Innovator Founder",
    url,
    publishedAt: change.rawTimestamp,
    aiSummary: null,
  }));

  // Some GOV.UK pages expose only public_updated_at rather than a populated
  // change_history. Use that official update timestamp as a fallback.
  if (!articles.length && content?.public_updated_at) {
    const fallback: NewsArticle = {
      id: `govuk:${path}:${content.public_updated_at}`,
      title,
      description,
      content: null,
      sourceName: "GOV.UK (Home Office / UKVI)",
      category: "Innovator Founder",
      url,
      publishedAt: content.public_updated_at,
      aiSummary: null,
    };
    if (isCurrentYearInnovatorFounderUpdate(fallback, now)) articles.push(fallback);
  }

  return articles.filter((article) => isCurrentYearInnovatorFounderUpdate(article, now));
}

async function fetchGovUkNews(limit = 20): Promise<NewsArticle[]> {
  if (govUkCache.expiresAt > Date.now() && govUkCache.items.length) {
    return govUkCache.items.slice(0, limit);
  }

  try {
    const paths = await discoverRoutePaths();
    const contentResults = await Promise.allSettled(paths.map((path) => fetchGovUkContent(path)));
    const deduped = new Map<string, NewsArticle>();

    contentResults.forEach((result, index) => {
      if (result.status !== "fulfilled" || !result.value) return;
      const path = paths[index];
      for (const article of normaliseContentUpdates(path, result.value)) {
        const key = [article.title, article.publishedAt, article.description].join("|").toLowerCase();
        if (!deduped.has(key)) deduped.set(key, article);
      }
    });

    const items = [...deduped.values()]
      .sort(compareStrictInnovatorFounderNews)
      .slice(0, 30);

    govUkCache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      items,
    };

    return items.slice(0, limit);
  } catch (error) {
    console.error("Current-year GOV.UK Innovator Founder update fetch failed:", error);
    return govUkCache.items
      .filter((article) => isCurrentYearInnovatorFounderUpdate(article))
      .sort(compareStrictInnovatorFounderNews)
      .slice(0, limit);
  }
}

/**
 * Returns official Innovator Founder GOV.UK changes from the current calendar
 * year. Long-lived guidance pages are included when GOV.UK says they were
 * updated this year; their old original publication date no longer hides them.
 */
export const getLatestNews = async (limit = 30) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.trunc(limit))) : 30;
  return fetchGovUkNews(safeLimit);
};

export const getOfficialNews = async (limit = 30) => getLatestNews(limit);

export const generateBreakingNews = async (limit = 10) => {
  const news = await getLatestNews(Math.max(limit, 10));
  return news.slice(0, limit);
};
