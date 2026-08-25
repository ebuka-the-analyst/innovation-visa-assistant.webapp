import {
  compareStrictInnovatorFounderNews,
  isStrictInnovatorFounderNews,
} from "./newsRelevance";

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

function normaliseGovUkResult(item: GovUkSearchResult): NewsArticle | null {
  const title = String(item?.title || "").trim();
  const link = String(item?.link || "").trim();
  if (!title || !link) return null;

  const url = link.startsWith("http") ? link : `https://www.gov.uk${link}`;
  const publishedAt = item?.public_timestamp || null;

  const article: NewsArticle = {
    id: `govuk:${link}`,
    title,
    description: String(item?.description || "").trim() || null,
    content: null,
    sourceName: "GOV.UK (Home Office / UKVI)",
    category: "Innovator Founder",
    url,
    publishedAt,
    aiSummary: null,
  };

  return isStrictInnovatorFounderNews(article) ? article : null;
}

async function fetchGovUkNews(limit = 20): Promise<NewsArticle[]> {
  if (govUkCache.expiresAt > Date.now()) {
    return govUkCache.items.slice(0, limit);
  }

  // Queries stay route-specific. Search ranking is never trusted on its own:
  // every returned result must also pass the strict headline + GOV.UK + date gate.
  const queries = [
    "Innovator Founder",
    "Innovator Founder visa",
    "Innovator Founder endorsing bodies",
    "Appendix Innovator Founder",
  ];

  try {
    const resultSets = await Promise.all(
      queries.map(async (query) => {
        const params = new URLSearchParams({
          q: query,
          count: "30",
          order: "-public_timestamp",
        });

        // Restrict publisher discovery to the two authoritative government owners
        // of this visa route. Relevance is then enforced again by headline.
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
      if (!article) continue;
      if (!deduped.has(article.url)) deduped.set(article.url, article);
    }

    const items = [...deduped.values()]
      .filter(isStrictInnovatorFounderNews)
      .sort(compareStrictInnovatorFounderNews)
      .slice(0, 30);

    govUkCache = {
      expiresAt: Date.now() + 10 * 60 * 1000,
      items,
    };

    return items.slice(0, limit);
  } catch (error) {
    console.error("Strict GOV.UK Innovator Founder news fetch failed:", error);

    // Accuracy takes precedence over filling the ticker. Only a previously
    // validated official cache may be reused; otherwise the feed stays empty.
    return govUkCache.items
      .filter(isStrictInnovatorFounderNews)
      .sort(compareStrictInnovatorFounderNews)
      .slice(0, limit);
  }
}

/**
 * Returns only current, directly named Innovator Founder updates discovered from
 * GOV.UK and restricted to Home Office / UKVI publishers. We deliberately do not
 * mix persisted, AI-summarised, general immigration or sponsor-list content into
 * the homepage feed. If no strict item is available, the feed is empty.
 */
export const getLatestNews = async (limit = 30) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.trunc(limit))) : 30;
  return fetchGovUkNews(safeLimit);
};

export const getOfficialNews = async (limit = 30) => {
  return getLatestNews(limit);
};

/**
 * Historical name retained for compatibility. This never fabricates breaking
 * news; it returns the same strict official Innovator Founder feed.
 */
export const generateBreakingNews = async (limit = 10) => {
  const news = await getLatestNews(Math.max(limit, 10));
  return news.slice(0, limit);
};
