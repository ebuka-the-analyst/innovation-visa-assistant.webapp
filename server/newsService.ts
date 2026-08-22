import { storage } from "./storage";

type NewsArticle = Record<string, any>;

type GovUkSearchResult = {
  title?: string;
  description?: string;
  link?: string;
  public_timestamp?: string;
  format?: string;
  content_store_document_type?: string;
};

let govUkCache: { expiresAt: number; items: NewsArticle[] } = {
  expiresAt: 0,
  items: [],
};

function isOfficialGovernmentSource(article: any) {
  const source = String(article?.sourceName || "").toLowerCase();
  if (/gov\.uk|home office|uk visas and immigration|ukvi|hmrc/.test(source)) return true;
  try {
    const hostname = new URL(String(article?.url || "")).hostname.toLowerCase();
    return hostname === "gov.uk" || hostname.endsWith(".gov.uk");
  } catch {
    return false;
  }
}

function articleTimestamp(article: NewsArticle): number {
  const value = article?.publishedAt || article?.createdAt || article?.updatedAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normaliseGovUkResult(item: GovUkSearchResult): NewsArticle | null {
  const title = String(item?.title || "").trim();
  const link = String(item?.link || "").trim();
  if (!title || !link) return null;

  const url = link.startsWith("http") ? link : `https://www.gov.uk${link}`;
  const category = String(
    item?.format || item?.content_store_document_type || "GOV.UK update",
  )
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return {
    id: `govuk:${link}`,
    title,
    description: String(item?.description || "").trim() || null,
    content: null,
    sourceName: "GOV.UK",
    category,
    url,
    publishedAt: item?.public_timestamp || null,
    aiSummary: null,
  };
}

async function fetchGovUkNews(limit = 30): Promise<NewsArticle[]> {
  if (govUkCache.expiresAt > Date.now() && govUkCache.items.length) {
    return govUkCache.items.slice(0, limit);
  }

  const queries = [
    "innovator founder visa",
    "innovator founder endorsement",
    "immigration rules innovator founder",
  ];

  try {
    const resultSets = await Promise.all(
      queries.map(async (query) => {
        const params = new URLSearchParams({
          q: query,
          count: "12",
          order: "-public_timestamp",
        });
        const response = await fetch(`https://www.gov.uk/api/search.json?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(7000),
        });
        if (!response.ok) {
          throw new Error(`GOV.UK Search API returned ${response.status}`);
        }
        const payload = (await response.json()) as { results?: GovUkSearchResult[] };
        return Array.isArray(payload?.results) ? payload.results : [];
      }),
    );

    const deduped = new Map<string, NewsArticle>();
    for (const raw of resultSets.flat()) {
      const article = normaliseGovUkResult(raw);
      if (article && !deduped.has(article.url)) deduped.set(article.url, article);
    }

    const items = [...deduped.values()]
      .sort((a, b) => articleTimestamp(b) - articleTimestamp(a))
      .slice(0, 50);

    govUkCache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      items,
    };

    return items.slice(0, limit);
  } catch (error) {
    console.error("GOV.UK news fallback failed:", error);
    return govUkCache.items.slice(0, limit);
  }
}

/**
 * Returns current stored news plus live official GOV.UK search results. This keeps
 * the public ticker populated even when the persisted news table is empty, while
 * avoiding embedded or fabricated regulatory headlines in application source.
 */
export const getLatestNews = async (limit = 50) => {
  const [persistedResult, govUkResult] = await Promise.allSettled([
    storage.getLatestNews(limit),
    fetchGovUkNews(Math.min(limit, 30)),
  ]);

  const persisted = persistedResult.status === "fulfilled" ? (persistedResult.value as NewsArticle[]) : [];
  const govUk = govUkResult.status === "fulfilled" ? govUkResult.value : [];
  const deduped = new Map<string, NewsArticle>();

  for (const article of [...persisted, ...govUk]) {
    const key = String(article?.url || article?.id || article?.title || "").trim();
    if (key && !deduped.has(key)) deduped.set(key, article);
  }

  return [...deduped.values()]
    .sort((a, b) => articleTimestamp(b) - articleTimestamp(a))
    .slice(0, limit);
};

export const getOfficialNews = async (limit = 50) => {
  const news = await getLatestNews(limit);
  return news.filter(isOfficialGovernmentSource);
};

/**
 * Historical name retained for compatibility. This does not fabricate breaking
 * news; it returns recent current official-source items.
 */
export const generateBreakingNews = async (limit = 10) => {
  const news = await getOfficialNews(Math.max(limit, 20));
  return news.slice(0, limit);
};
