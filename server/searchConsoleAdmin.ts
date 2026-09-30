import type { Express } from "express";
import { GoogleAuth } from "google-auth-library";
import { requireAdmin } from "./auth";

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];
const DEFAULT_SITE_URL = "https://innovatorfoundervisaassistant.co.uk/";

function normalisePrivateKey(value: string | undefined) {
  return value?.replace(/\\n/g, "\n");
}

function getSearchConsoleConfig() {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = normalisePrivateKey(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || DEFAULT_SITE_URL;

  return {
    configured: Boolean(clientEmail && privateKey && siteUrl),
    clientEmail,
    privateKey,
    siteUrl,
  };
}

async function getAccessToken() {
  const config = getSearchConsoleConfig();
  if (!config.configured || !config.clientEmail || !config.privateKey) {
    throw new Error("Google Search Console credentials are not configured");
  }

  const auth = new GoogleAuth({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const accessToken = typeof token === "string" ? token : token?.token;
  if (!accessToken) throw new Error("Unable to obtain Google Search Console access token");
  return accessToken;
}

async function querySearchConsole(
  siteUrl: string,
  accessToken: string,
  body: Record<string, unknown>,
): Promise<SearchAnalyticsResponse> {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Search Console API ${response.status}: ${text.slice(0, 500)}`);
  }

  return (await response.json()) as SearchAnalyticsResponse;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(days: number, offsetDays = 0) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - offsetDays - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

function aggregate(rows: SearchAnalyticsRow[] = []) {
  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  let weightedCtr = 0;

  for (const row of rows) {
    const rowImpressions = Number(row.impressions || 0);
    clicks += Number(row.clicks || 0);
    impressions += rowImpressions;
    weightedPosition += Number(row.position || 0) * rowImpressions;
    weightedCtr += Number(row.ctr || 0) * rowImpressions;
  }

  return {
    clicks,
    impressions,
    ctr: impressions ? weightedCtr / impressions : 0,
    position: impressions ? weightedPosition / impressions : 0,
  };
}

function pctChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function registerSearchConsoleAdminRoutes(app: Express) {
  app.get("/api/admin/seo/search-console/status", requireAdmin, async (_req, res) => {
    const config = getSearchConsoleConfig();
    res.json({
      configured: config.configured,
      siteUrl: config.siteUrl,
      requiredEnvironmentVariables: config.configured
        ? []
        : [
            "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
            "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
            "GOOGLE_SEARCH_CONSOLE_SITE_URL",
          ],
    });
  });

  app.get("/api/admin/seo/search-console", requireAdmin, async (req, res) => {
    try {
      const parsedDays = Number(req.query.days || 28);
      const days = [7, 28, 90, 180].includes(parsedDays) ? parsedDays : 28;
      const config = getSearchConsoleConfig();

      if (!config.configured) {
        return res.status(503).json({
          configured: false,
          siteUrl: config.siteUrl,
          message: "Google Search Console is not connected yet.",
          requiredEnvironmentVariables: [
            "GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL",
            "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
            "GOOGLE_SEARCH_CONSOLE_SITE_URL",
          ],
        });
      }

      const accessToken = await getAccessToken();
      const current = getDateRange(days, 0);
      const previous = getDateRange(days, days);

      const base = {
        type: "web",
        dataState: "all",
        rowLimit: 250,
      };

      const [summaryRows, previousRows, daily, queries, pages, devices, countries] =
        await Promise.all([
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["date"],
            rowLimit: Math.min(days + 5, 250),
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...previous,
            dimensions: ["date"],
            rowLimit: Math.min(days + 5, 250),
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["date"],
            rowLimit: Math.min(days + 5, 250),
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["query"],
            rowLimit: 100,
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["page"],
            rowLimit: 100,
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["device"],
            rowLimit: 10,
          }),
          querySearchConsole(config.siteUrl, accessToken, {
            ...base,
            ...current,
            dimensions: ["country"],
            rowLimit: 25,
          }),
        ]);

      const currentMetrics = aggregate(summaryRows.rows);
      const previousMetrics = aggregate(previousRows.rows);

      const keywordRows = (queries.rows || []).map((row) => ({
        query: row.keys?.[0] || "",
        clicks: Number(row.clicks || 0),
        impressions: Number(row.impressions || 0),
        ctr: Number(row.ctr || 0),
        position: Number(row.position || 0),
      }));

      const opportunities = keywordRows
        .filter((row) => row.impressions >= 10 && row.position >= 4 && row.position <= 20)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 12);

      res.set("Cache-Control", "private, max-age=300");
      return res.json({
        configured: true,
        siteUrl: config.siteUrl,
        range: { days, ...current },
        summary: {
          ...currentMetrics,
          changes: {
            clicks: pctChange(currentMetrics.clicks, previousMetrics.clicks),
            impressions: pctChange(currentMetrics.impressions, previousMetrics.impressions),
            ctr: pctChange(currentMetrics.ctr, previousMetrics.ctr),
            position: previousMetrics.position - currentMetrics.position,
          },
        },
        daily: (daily.rows || []).map((row) => ({
          date: row.keys?.[0] || "",
          clicks: Number(row.clicks || 0),
          impressions: Number(row.impressions || 0),
          ctr: Number(row.ctr || 0),
          position: Number(row.position || 0),
        })),
        queries: keywordRows,
        pages: (pages.rows || []).map((row) => ({
          page: row.keys?.[0] || "",
          clicks: Number(row.clicks || 0),
          impressions: Number(row.impressions || 0),
          ctr: Number(row.ctr || 0),
          position: Number(row.position || 0),
        })),
        devices: (devices.rows || []).map((row) => ({
          device: row.keys?.[0] || "",
          clicks: Number(row.clicks || 0),
          impressions: Number(row.impressions || 0),
          ctr: Number(row.ctr || 0),
          position: Number(row.position || 0),
        })),
        countries: (countries.rows || []).map((row) => ({
          country: row.keys?.[0] || "",
          clicks: Number(row.clicks || 0),
          impressions: Number(row.impressions || 0),
          ctr: Number(row.ctr || 0),
          position: Number(row.position || 0),
        })),
        opportunities,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Search Console] Failed to fetch ranking data:", error);
      res.status(502).json({
        configured: true,
        error: "Unable to fetch Google Search Console data",
        detail: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  });
}
