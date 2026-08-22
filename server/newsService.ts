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

const MAX_NEWS_AGE_MS = 1000 * 60 * 60 * 24 * 730; // two years

function isOfficialGovernmentSource(article: any) {
  const source = String(article?.sourceName || "").toLowerCase();
  if (/gov\.uk|home office|uk visas and immigration|ukvi/.test(source)) return true;
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

function articleText(article: NewsArticle): string {
  return [
    article?.title,
    article?.description,
    article?.aiSummary,
    article?.content,
    article?.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function immigrationRelevanceTier(article: NewsArticle): number {
  const text = articleText(article);

  // Tier 3: directly about the Innovator Founder route or its endorsement process.
  if (
    /\binnovator founder\b/.test(text) ||
    /\binnovator visa\b/.test(text) ||
    (/\bendorsement\b|\bendorsing bod(?:y|ies)\b/.test(text) && /\binnovator\b|\bfounder\b/.test(text))
  ) {
    return 3;
  }

  // Tier 2: changes that can directly affect a UK visa application or Immigration Rules.
  if (
    /\bimmigration rules\b/.test(text) ||
    /\buk visas and immigration\b|\bukvi\b/.test(text) ||
    /\bvisa application\b|\bvisa applications\b|\bvisa route\b|\bvisa routes\b/.test(text) ||
    /\bevisa\b|\bentry clearance\b|\bleave to remain\b|\bindefinite leave\b/.test(text) ||
    /\bbusiness immigration\b|\bskilled worker visa\b/.test(text)
  ) {
    return 2;
  }

  // Tier 1: broader UK immigration / visa material. This can fill the ticker only
  // after stronger route-specific items, but unrelated government content is rejected.
  if (/\bimmigration\b|\bvisa\b|\bvisas\b/.test(text)) {
    return 1;
  }

  return 0;
}

function isRecentEnough(article: NewsArticle): boolean {
  const timestamp = articleTimestamp(article);
  if (!timestamp) return true;
  return timestamp >= Date.now() - MAX_NEWS_AGE_MS;
}

function isRelevantImmigrationNews(article: NewsArticle): boolean {
  return immigrationRelevanceTier(article) > 0 && isRecentEnough(article);
}

function compareRelevantNews(a: NewsArticle, b: NewsArticle): number {
  const tierDifference = immigrationRelevanceTier(b) - immigrationRelevanceTier(a);
  if (tierDifference !== 0) return tierDifference;
  return articleTimestamp(b) - articleTimestamp(a);
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
    sourceName: "GOV.UK / Home Office",
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
    "immigration rules business visa",
    "UK visa immigration rules",
  ];

  try {
    const resultSets = await Promise.all(
      queries.map(async (query) => {
        const params = new URLSearchParams({
          q: query,
          count: "20",
          order: "-public_timestamp",
        });

        // GOV.UK supports repeated organisation filters as an OR group. Restricting
        // results to these publishers prevents court cases, animal movement notices,
        // pollution guidance and other unrelated GOV.UK matches entering the ticker.
        params.append("filter_organisations", "home-office");
        params.append("filter_organisations", "uk-visas-and-immigration");

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
      if (!article || !isRelevantImmigrationNews(article)) continue;
      if (!deduped.has(article.url)) deduped.set(article.url, article);
    }

    const items = [...deduped.values()]
      .sort(compareRelevantNews)
      .slice(0, 50);

    govUkCache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      items,
    };

    return items.slice(0, limit);
  } catch (error) {
    console.error("GOV.UK immigration news fallback failed:", error);
    return govUkCache.items.filter(isRelevantImmigrationNews).slice(0, limit);
  }
}

/**
 * Returns only current immigration-relevant stored news plus official Home Office /
 * UKVI GOV.UK results. Innovator Founder-specific items are ranked ahead of broader
 * immigration updates, and unrelated government content is never used to fill space.
 */
export const getLatestNews = async (limit = 50) => {
  const [persistedResult, govUkResult] = await Promise.allSettled([
    storage.getLatestNews(Math.max(limit, 100)),
    fetchGovUkNews(Math.min(Math.max(limit, 30), 50)),
  ]);

  const persisted = persistedResult.status === "fulfilled"
    ? (persistedResult.value as NewsArticle[]).filter(isRelevantImmigrationNews)
    : [];
  const govUk = govUkResult.status === "fulfilled"
    ? govUkResult.value.filter(isRelevantImmigrationNews)
    : [];
  const deduped = new Map<string, NewsArticle>();

  for (const article of [...persisted, ...govUk]) {
    const key = String(article?.url || article?.id || article?.title || "").trim();
    if (key && !deduped.has(key)) deduped.set(key, article);
  }

  return [...deduped.values()]
    .sort(compareRelevantNews)
    .slice(0, limit);
};

export const getOfficialNews = async (limit = 50) => {
  const news = await getLatestNews(limit);
  return news.filter(isOfficialGovernmentSource);
};

/**
 * Historical name retained for compatibility. This does not fabricate breaking
 * news; it returns recent current official-source immigration items.
 */
export const generateBreakingNews = async (limit = 10) => {
  const news = await getOfficialNews(Math.max(limit, 20));
  return news.slice(0, limit);
};
