/**
 * SEO 90-Day Automation Engine
 * 
 * Takes a generated SEO strategy and automatically:
 * 1. Extracts all content items (blog posts, FAQs, keyword pages)
 * 2. Staggers them across 13 weeks (2 posts per week)
 * 3. Queues them into the blog generation pipeline
 * 4. Runs a weekly cron to queue the next batch automatically
 */

import { db } from "./db.js";
import { blogGenerationQueue, seoAutomationPlans } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { GoogleAuth } from "google-auth-library";
import {
  analyseSeoQuery,
  chooseSeoContentDecision,
  normaliseSearchConsolePath,
  type SeoContentDecision,
  type SeoIntentCluster,
  type SeoSearchIntent,
} from "./seoQueryIntelligence";

const MAX_POSTS_PER_WEEK = 2;

type SearchQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  page: string;
  path: string;
  qualified: boolean;
  qualificationReason: string;
  cluster: SeoIntentCluster;
  intent: SeoSearchIntent;
  recommendedPath: string;
  pageMatchesRecommendation: boolean;
  contentDecision: SeoContentDecision;
};

function normalizePrivateKey(value: string | undefined): string {
  if (!value) return "";
  let key = value.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n").trim();
  const begin = "-----BEGIN PRIVATE KEY-----";
  const end = "-----END PRIVATE KEY-----";
  const start = key.indexOf(begin);
  const finish = key.indexOf(end);
  return start >= 0 && finish >= start ? key.slice(start, finish + end.length) : key;
}

async function fetchCommercialSearchQueries(days = 28): Promise<SearchQueryRow[]> {
  const clientEmail = String(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || "").trim();
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  const siteUrl = String(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "").trim();

  if (!clientEmail || !privateKey || !siteUrl) {
    throw new Error("Search Console credentials are not configured");
  }

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const accessToken = typeof token === "string" ? token : token?.token;
  if (!accessToken) throw new Error("Unable to obtain Search Console access token");

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: iso(start),
        endDate: iso(end),
        dimensions: ["query", "page"],
        type: "web",
        dataState: "all",
        rowLimit: 500,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Search Console API ${response.status}: ${await response.text()}`);
  }

  const payload: any = await response.json();
  const grouped = new Map<
    string,
    {
      query: string;
      clicks: number;
      impressions: number;
      weightedPosition: number;
      bestPage: string;
      bestPageImpressions: number;
      bestPageClicks: number;
    }
  >();

  for (const row of payload.rows || []) {
    const query = String(row.keys?.[0] || "").trim();
    const page = String(row.keys?.[1] || "").trim();
    if (!query) continue;

    const clicks = Number(row.clicks || 0);
    const impressions = Number(row.impressions || 0);
    const position = Number(row.position || 0);
    const current = grouped.get(query) || {
      query,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
      bestPage: "",
      bestPageImpressions: -1,
      bestPageClicks: -1,
    };

    current.clicks += clicks;
    current.impressions += impressions;
    current.weightedPosition += position * impressions;

    if (
      page &&
      (impressions > current.bestPageImpressions ||
        (impressions === current.bestPageImpressions && clicks > current.bestPageClicks))
    ) {
      current.bestPage = page;
      current.bestPageImpressions = impressions;
      current.bestPageClicks = clicks;
    }

    grouped.set(query, current);
  }

  return Array.from(grouped.values())
    .map((row): SearchQueryRow => {
      const position = row.impressions
        ? row.weightedPosition / row.impressions
        : 0;
      const intelligence = analyseSeoQuery(row.query);
      const path = normaliseSearchConsolePath(row.bestPage);
      return {
        query: row.query,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.impressions ? row.clicks / row.impressions : 0,
        position,
        page: row.bestPage,
        path,
        ...intelligence,
        pageMatchesRecommendation: Boolean(
          path && path === intelligence.recommendedPath,
        ),
        contentDecision: chooseSeoContentDecision({
          ...intelligence,
          actualPath: path,
          position,
        }),
      };
    })
    .filter((row) => row.qualified);
}

function buildTop5Mission(rows: SearchQueryRow[]) {
  return rows
    .filter((row) => row.position > 0 && row.impressions >= 5)
    .map((row) => {
      const bucket =
        row.position <= 5 ? "top5" :
        row.position <= 10 ? "fast-win" :
        row.position <= 20 ? "page-one" :
        row.position <= 50 ? "growth" : "long-term";
      const action =
        row.position <= 5
          ? "Defend ranking with freshness, internal links and CTR monitoring."
          : row.position <= 10
            ? "Optimise the ranking page, strengthen internal links and improve title/meta CTR."
            : row.position <= 20
              ? "Expand topical depth and add supporting internal content."
              : "Build stronger dedicated content and authority before pushing for page one.";
      return { ...row, bucket, gapToTop5: Math.max(0, row.position - 5), action };
    })
    .sort((a, b) => {
      const aScore = (a.position <= 10 ? 1000 : 0) + a.impressions * 2 - a.position;
      const bScore = (b.position <= 10 ? 1000 : 0) + b.impressions * 2 - b.position;
      return bScore - aScore;
    });
}

async function queueAutopilotSupportContent(planId: string, mission: ReturnType<typeof buildTop5Mission>) {
  const candidates = mission
    .filter(
      (item) =>
        item.position > 10 &&
        item.position <= 50 &&
        item.impressions >= 10 &&
        (item.contentDecision === "support-existing" ||
          item.contentDecision === "new-content"),
    )
    .slice(0, 2);

  let queued = 0;
  for (const item of candidates) {
    const topic = `${item.query}: UK Innovator Founder Visa Guide`;
    const existing = await db
      .select({ id: blogGenerationQueue.id })
      .from(blogGenerationQueue)
      .where(eq(blogGenerationQueue.topic, topic))
      .limit(1);
    if (existing.length) continue;

    const publishDate = new Date();
    publishDate.setUTCDate(publishDate.getUTCDate() + (queued === 0 ? 1 : 4));
    publishDate.setUTCHours(9, 0, 0, 0);

    await db.insert(blogGenerationQueue).values({
      targetDate: publishDate,
      topic,
      category: "Innovator Founder Visa",
      status: "pending",
    });
    queued++;
  }
  return queued;
}


type SeoAuditCheck = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  detail: string;
};

type SeoApprovalAction = {
  id: string;
  type: "meta-refresh" | "content-review";
  risk: "medium" | "high";
  status: "pending" | "approved" | "rejected";
  keyword: string;
  path: string;
  reason: string;
  proposedTitle?: string;
  proposedDescription?: string;
  createdAt: string;
  decidedAt?: string;
};

function preferredPathForQuery(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("business plan")) return "/business-plan-template";
  if (q.includes("endors")) return "/endorsing-bodies";
  if (q.includes("eligib") || q.includes("requirement")) return "/eligibility";
  if (q.includes("guide") || q.includes("overview")) return "/guide";
  if (q.includes("support") || q.includes("assist")) return "/";
  return "/guide";
}

function titleCaseQuery(query: string): string {
  return query
    .trim()
    .replace(/["']/g, "")
    .split(/\s+/)
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function buildApprovalQueue(
  mission: ReturnType<typeof buildTop5Mission>,
  previous: SeoApprovalAction[] = [],
): SeoApprovalAction[] {
  const previousByKey = new Map(previous.map((item) => [`${item.type}:${item.keyword.toLowerCase()}`, item]));
  const candidates = mission
    .filter((item) => item.position > 5 && item.position <= 20 && item.impressions >= 15)
    .slice(0, 12);

  const next: SeoApprovalAction[] = candidates.map((item) => {
    const key = `meta-refresh:${item.query.toLowerCase()}`;
    const existing = previousByKey.get(key);
    if (existing) return existing;

    const keywordTitle = titleCaseQuery(item.query);
    const dedicatedIntent = ["business-plan", "endorsement", "eligibility"].includes(
      item.cluster,
    );
    const pageIsMisaligned =
      dedicatedIntent &&
      Boolean(item.path) &&
      Boolean(item.recommendedPath) &&
      item.path !== item.recommendedPath;
    // If Google is ranking the wrong page for a dedicated intent, optimise the
    // intended page instead of reinforcing the accidental ranking page.
    const path = pageIsMisaligned
      ? item.recommendedPath
      : item.path || item.recommendedPath || preferredPathForQuery(item.query);
    const proposedTitle = `${keywordTitle} | UK Innovator Founder Visa 2026`.slice(0, 62);
    const proposedDescription =
      `Explore ${item.query} with practical UK Innovator Founder Visa guidance, eligibility support, endorsement preparation and AI-powered application tools.`.slice(0, 158);

    return {
      id: `meta-${Buffer.from(item.query).toString("base64url").slice(0, 20)}`,
      type: "meta-refresh",
      risk: "medium",
      status: "pending",
      keyword: item.query,
      path,
      reason: pageIsMisaligned
        ? `Google currently ranks ${item.path} at position ${item.position.toFixed(1)}, but ${item.recommendedPath} is the dedicated ${item.cluster.replace(/-/g, " ")} page. Optimise the intended page rather than reinforcing the wrong URL.`
        : item.position <= 10
          ? `Position ${item.position.toFixed(1)} with ${item.impressions} impressions. A stronger search snippet may help move this query toward the Top 5.`
          : `Position ${item.position.toFixed(1)} with ${item.impressions} impressions. Improve relevance before pushing for page-one and Top 5 visibility.`,
      proposedTitle,
      proposedDescription,
      createdAt: new Date().toISOString(),
    };
  });

  // Keep previously decided actions for audit history even if they no longer qualify.
  const decided = previous.filter((item) => item.status !== "pending");
  const combined = [...next, ...decided.filter((old) => !next.some((item) => item.id === old.id))];
  return combined.slice(0, 30);
}

async function runSeoSiteAudit(): Promise<SeoAuditCheck[]> {
  const base = "https://innovatorfoundervisaassistant.co.uk";
  const checks: SeoAuditCheck[] = [];
  const pages = ["/", "/guide", "/faq", "/eligibility", "/endorsing-bodies", "/business-plan-template"];

  try {
    const response = await fetch(`${base}/sitemap.xml`, { redirect: "follow" });
    checks.push({
      id: "sitemap",
      label: "XML sitemap",
      status: response.ok ? "pass" : "fail",
      detail: response.ok ? "Sitemap is reachable." : `Sitemap returned HTTP ${response.status}.`,
    });
  } catch (error: any) {
    checks.push({ id: "sitemap", label: "XML sitemap", status: "fail", detail: error?.message || "Sitemap request failed." });
  }

  try {
    const response = await fetch(`${base}/robots.txt`, { redirect: "follow" });
    const body = await response.text();
    checks.push({
      id: "robots",
      label: "robots.txt",
      status: response.ok && !/disallow:\s*\/$/im.test(body) ? "pass" : "warning",
      detail: response.ok ? "robots.txt is reachable and the whole site is not blocked." : `robots.txt returned HTTP ${response.status}.`,
    });
  } catch (error: any) {
    checks.push({ id: "robots", label: "robots.txt", status: "fail", detail: error?.message || "robots.txt request failed." });
  }

  let canonicalPass = 0;
  let schemaPass = 0;
  let descriptionPass = 0;
  for (const path of pages) {
    try {
      const response = await fetch(`${base}${path}`, { redirect: "follow" });
      const html = await response.text();
      if (response.ok && /rel=["']canonical["']/i.test(html)) canonicalPass++;
      if (response.ok && /application\/ld\+json/i.test(html)) schemaPass++;
      if (response.ok && /name=["']description["']/i.test(html)) descriptionPass++;
    } catch {}
  }

  checks.push({
    id: "canonicals",
    label: "Canonical tags",
    status: canonicalPass === pages.length ? "pass" : canonicalPass >= pages.length - 1 ? "warning" : "fail",
    detail: `${canonicalPass}/${pages.length} priority pages returned a canonical tag.`,
  });
  checks.push({
    id: "schema",
    label: "Structured data",
    status: schemaPass >= 4 ? "pass" : schemaPass >= 2 ? "warning" : "fail",
    detail: `${schemaPass}/${pages.length} priority pages returned JSON-LD structured data.`,
  });
  checks.push({
    id: "descriptions",
    label: "Meta descriptions",
    status: descriptionPass === pages.length ? "pass" : descriptionPass >= pages.length - 1 ? "warning" : "fail",
    detail: `${descriptionPass}/${pages.length} priority pages returned a meta description.`,
  });

  return checks;
}

async function buildExecutionState(
  mission: ReturnType<typeof buildTop5Mission>,
  previousExecution: any = {},
) {
  const audit = await runSeoSiteAudit();
  const approvalQueue = buildApprovalQueue(
    mission,
    Array.isArray(previousExecution?.approvalQueue) ? previousExecution.approvalQueue : [],
  );

  const alignmentQueue = mission
    .filter(
      (item) =>
        ["business-plan", "endorsement", "eligibility"].includes(item.cluster) &&
        Boolean(item.path) &&
        item.path !== item.recommendedPath &&
        item.impressions >= 3,
    )
    .map((item) => ({
      keyword: item.query,
      cluster: item.cluster,
      currentPath: item.path,
      recommendedPath: item.recommendedPath,
      position: item.position,
      impressions: item.impressions,
      action: `Strengthen ${item.recommendedPath} and link to it contextually from ${item.path}. Do not create a competing page.`,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  const automaticActions = [
    {
      id: "daily-rank-refresh",
      label: "Refresh commercial Search Console mission",
      status: "active",
      cadence: "daily",
      lastRunAt: new Date().toISOString(),
    },
    {
      id: "technical-audit",
      label: "Check sitemap, robots, canonicals, schema and descriptions",
      status: audit.some((item) => item.status === "fail") ? "attention" : "active",
      cadence: "daily",
      lastRunAt: new Date().toISOString(),
    },
    {
      id: "internal-link-hubs",
      label: "Maintain contextual links between guide, business plan, endorsement and eligibility pages",
      status: "active",
      cadence: "daily",
      activeAlignmentIssues: alignmentQueue.length,
    },
    {
      id: "support-content",
      label: "Queue supporting content only when an existing intent page is not enough",
      status: "active",
      cadence: "weekly",
      maxPerWeek: 2,
    },
  ];

  return {
    lastAuditAt: new Date().toISOString(),
    audit,
    automaticActions,
    alignmentQueue,
    approvalQueue,
  };
}

export async function decideSeoAutopilotAction(
  planId: string,
  actionId: string,
  decision: "approve" | "reject",
): Promise<any> {
  const [plan] = await db
    .select()
    .from(seoAutomationPlans)
    .where(eq(seoAutomationPlans.id, planId))
    .limit(1);
  if (!plan) throw new Error("SEO autopilot plan not found");

  const data = (plan.strategyData || {}) as any;
  const execution = data.execution || {};
  const queue: SeoApprovalAction[] = Array.isArray(execution.approvalQueue) ? execution.approvalQueue : [];
  const action = queue.find((item) => item.id === actionId);
  if (!action) throw new Error("SEO action not found");

  action.status = decision === "approve" ? "approved" : "rejected";
  action.decidedAt = new Date().toISOString();

  const approvedOverrides = { ...(data.approvedOverrides || {}) };
  if (decision === "approve" && action.type === "meta-refresh" && action.proposedTitle && action.proposedDescription) {
    approvedOverrides[action.path] = {
      title: action.proposedTitle,
      description: action.proposedDescription,
      keyword: action.keyword,
      approvedAt: action.decidedAt,
    };
  }

  await db.update(seoAutomationPlans).set({
    strategyData: {
      ...data,
      approvedOverrides,
      execution: {
        ...execution,
        approvalQueue: queue,
      },
    },
    updatedAt: new Date(),
  }).where(eq(seoAutomationPlans.id, planId));

  return { action, overrideApplied: decision === "approve" && action.type === "meta-refresh" };
}

export async function activateLifetimeTop5Autopilot(): Promise<{ planId: string; missionCount: number; queuedNow: number }> {
  const rows = await fetchCommercialSearchQueries(28);
  const mission = buildTop5Mission(rows);

  await db
    .update(seoAutomationPlans)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(seoAutomationPlans.status, "active"));

  const execution = await buildExecutionState(mission);

  const strategyData = {
    autopilotMode: "top5-lifetime",
    perpetual: true,
    targetPosition: 5,
    lastRunAt: new Date().toISOString(),
    mission,
    execution,
    safeguards: {
      maxNewPostsPerWeek: 2,
      noAutomatedThirdPartyPosting: true,
      noPaidOrManipulativeLinks: true,
    },
  };

  const [plan] = await db.insert(seoAutomationPlans).values({
    strategyData,
    businessName: "UK Innovator Founder Visa Assistant",
    status: "active",
    totalContentItems: mission.length,
    queuedItems: 0,
    completedItems: 0,
    weekNumber: 1,
    startDate: new Date(),
    nextQueueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }).returning();

  const queuedNow = await queueAutopilotSupportContent(plan.id, mission);
  await db.update(seoAutomationPlans).set({
    queuedItems: queuedNow,
    updatedAt: new Date(),
  }).where(eq(seoAutomationPlans.id, plan.id));

  return { planId: plan.id, missionCount: mission.length, queuedNow };
}

export async function refreshLifetimeTop5Autopilot(queueContent = false): Promise<void> {
  const activePlans = await db
    .select()
    .from(seoAutomationPlans)
    .where(eq(seoAutomationPlans.status, "active"));

  for (const plan of activePlans) {
    const data = (plan.strategyData || {}) as any;
    if (data.autopilotMode !== "top5-lifetime") continue;

    const rows = await fetchCommercialSearchQueries(28);
    const mission = buildTop5Mission(rows);
    const queued = queueContent ? await queueAutopilotSupportContent(plan.id, mission) : 0;
    const execution = await buildExecutionState(mission, data.execution);

    await db.update(seoAutomationPlans).set({
      strategyData: {
        ...data,
        perpetual: true,
        targetPosition: 5,
        lastRunAt: new Date().toISOString(),
        mission,
        execution,
      },
      totalContentItems: mission.length,
      queuedItems: (plan.queuedItems || 0) + queued,
      weekNumber: (plan.weekNumber || 0) + (queueContent ? 1 : 0),
      nextQueueDate: queueContent ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : plan.nextQueueDate,
      updatedAt: new Date(),
    }).where(eq(seoAutomationPlans.id, plan.id));
  }
}


export interface AutomationContentItem {
  title: string;
  keyword: string;
  category: string;
  weekNumber: number;
  type: "blog" | "faq" | "keyword-page";
}

/**
 * Extract all content items from a strategy result and assign week numbers
 */
export function extractContentItems(strategy: Record<string, unknown>): AutomationContentItem[] {
  const items: AutomationContentItem[] = [];

  // Content calendar items (weeks 1-8, 2 per week max)
  const contentCalendar = (strategy.contentCalendar as Array<{
    title: string; targetKeyword: string; type: string; weekNumber?: number;
  }>) || [];

  contentCalendar.forEach((piece, i) => {
    if (piece.type === "blog" || piece.type === "faq") {
      items.push({
        title: piece.title,
        keyword: piece.targetKeyword,
        category: "Innovator Founder Visa",
        weekNumber: piece.weekNumber || Math.floor(i / 2) + 1,
        type: piece.type === "faq" ? "faq" : "blog",
      });
    }
  });

  // 90-day plan content items (weeks 7-13)
  const ninetyDayPlan = (strategy.ninetyDayPlan as Array<{
    category: string; action: string; effort: string;
  }>) || [];

  let week90 = 7;
  ninetyDayPlan.forEach((action) => {
    if (action.category?.includes("Content") && action.action?.includes("Publish:")) {
      const titleMatch = action.action.match(/Publish: "(.+?)"/);
      const keywordMatch = action.action.match(/targeting "(.+?)"/);
      if (titleMatch) {
        items.push({
          title: titleMatch[1],
          keyword: keywordMatch?.[1] || titleMatch[1],
          category: "Innovator Founder Visa",
          weekNumber: week90,
          type: "blog",
        });
        week90++;
      }
    }
  });

  // Keyword opportunities — create-new ones (weeks 4-13, spread out)
  const keywords = (strategy.keywordOpportunities as Array<{
    keyword: string; action: string; pageRecommendation: string;
  }>) || [];

  let kwWeek = 4;
  let kwCount = 0;
  keywords.forEach((kw) => {
    if (kw.action === "create-new" && kwCount < 10) {
      items.push({
        title: `Complete Guide to ${kw.keyword}`,
        keyword: kw.keyword,
        category: "Innovator Founder Visa",
        weekNumber: Math.min(kwWeek, 13),
        type: "keyword-page",
      });
      kwCount++;
      if (kwCount % 2 === 0) kwWeek++;
    }
  });

  // Deduplicate by title and sort by week
  const seen = new Set<string>();
  return items
    .filter(item => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.weekNumber - b.weekNumber);
}

/**
 * Queue the next batch of content items for the given week
 */
export async function queueWeekContent(
  planId: string,
  items: AutomationContentItem[],
  weekNumber: number
): Promise<number> {
  const weekItems = items
    .filter(item => item.weekNumber === weekNumber)
    .slice(0, MAX_POSTS_PER_WEEK); // Hard cap: never queue more than 2 per week
  if (weekItems.length === 0) return 0;

  // Stagger publish dates across the week (Mon + Thu for 2 posts)
  const baseDate = new Date();
  const daysOffset = (weekNumber - 1) * 7;

  let queued = 0;
  for (let i = 0; i < weekItems.length; i++) {
    const item = weekItems[i];
    const publishDate = new Date(baseDate);
    publishDate.setDate(publishDate.getDate() + daysOffset + i * 2);
    publishDate.setHours(9, 0, 0, 0);

    // Check if already queued (avoid duplicates)
    const existing = await db
      .select({ id: blogGenerationQueue.id })
      .from(blogGenerationQueue)
      .where(eq(blogGenerationQueue.topic, item.title))
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(blogGenerationQueue).values({
      targetDate: publishDate,
      topic: item.title,
      category: item.category,
      status: "pending",
    });
    queued++;
  }

  return queued;
}

/**
 * Activate a new 90-day automation plan from a strategy
 */
export async function activateAutomationPlan(
  strategy: Record<string, unknown>
): Promise<{ planId: string; totalItems: number; queuedNow: number }> {
  const businessContext = strategy.businessContext as Record<string, unknown>;
  const businessName = (businessContext?.businessName as string) || "Unknown Business";

  const items = extractContentItems(strategy);
  const totalItems = items.length;

  // Calculate next queue date (next Monday at 8am)
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(8, 0, 0, 0);

  // Deactivate any existing active plans
  await db
    .update(seoAutomationPlans)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(seoAutomationPlans.status, "active"));

  // Create new plan
  const [plan] = await db.insert(seoAutomationPlans).values({
    strategyData: strategy,
    businessName,
    status: "active",
    totalContentItems: totalItems,
    queuedItems: 0,
    completedItems: 0,
    weekNumber: 1,
    startDate: new Date(),
    nextQueueDate: nextMonday,
    updatedAt: new Date(),
  }).returning();

  // Queue week 1 and week 2 immediately
  let queuedNow = 0;
  queuedNow += await queueWeekContent(plan.id, items, 1);
  queuedNow += await queueWeekContent(plan.id, items, 2);

  // Update queued count
  await db
    .update(seoAutomationPlans)
    .set({ queuedItems: queuedNow, weekNumber: 2, updatedAt: new Date() })
    .where(eq(seoAutomationPlans.id, plan.id));

  console.log(`[SEO Automation] Plan activated: ${totalItems} total items, ${queuedNow} queued immediately`);

  return { planId: plan.id, totalItems, queuedNow };
}

/**
 * Weekly cron: advance all active plans and queue the next week's content
 */
export async function runWeeklyAutomationCron(): Promise<void> {
  console.log("[SEO Automation] Running weekly content queue cron...");

  const activePlans = await db
    .select()
    .from(seoAutomationPlans)
    .where(eq(seoAutomationPlans.status, "active"));

  for (const plan of activePlans) {
    const strategyData = (plan.strategyData || {}) as any;
    if (strategyData.autopilotMode === "top5-lifetime") {
      continue;
    }

    const currentWeek = (plan.weekNumber || 1) + 1;

    if (currentWeek > 13) {
      await db
        .update(seoAutomationPlans)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(seoAutomationPlans.id, plan.id));
      console.log(`[SEO Automation] Plan ${plan.id} completed all 13 weeks`);
      continue;
    }

    const items = extractContentItems(plan.strategyData as Record<string, unknown>);
    const queued = await queueWeekContent(plan.id, items, currentWeek);

    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + 7);
    nextMonday.setHours(8, 0, 0, 0);

    await db
      .update(seoAutomationPlans)
      .set({
        weekNumber: currentWeek,
        queuedItems: (plan.queuedItems || 0) + queued,
        nextQueueDate: nextMonday,
        updatedAt: new Date(),
      })
      .where(eq(seoAutomationPlans.id, plan.id));

    console.log(`[SEO Automation] Week ${currentWeek}: queued ${queued} items for plan ${plan.id}`);
  }

  // Lifetime Top 5 plans never complete. Refresh rankings and queue at most
  // two supporting content items per week based on current Search Console data.
  await refreshLifetimeTop5Autopilot(true);
}
