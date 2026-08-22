import { storage } from "./storage";

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

/**
 * Compatibility service for older callers. News is read from the persisted news
 * store populated by the platform fetch workflow; no regulatory claims are
 * embedded in application source code.
 */
export const getLatestNews = async (limit = 50) => {
  return storage.getLatestNews(limit);
};

export const getOfficialNews = async (limit = 50) => {
  const news = await storage.getLatestNews(limit);
  return news.filter(isOfficialGovernmentSource);
};

/**
 * Historical name retained for compatibility. This no longer fabricates or
 * "generates" breaking news; it returns recent persisted official-source items.
 */
export const generateBreakingNews = async (limit = 10) => {
  const news = await getOfficialNews(Math.max(limit, 20));
  return news.slice(0, limit);
};
