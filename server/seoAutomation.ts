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

const MAX_POSTS_PER_WEEK = 2;

type SearchQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

const COMMERCIAL_TERMS = [
  "innovator",
  "founder",
  "visa",
  "business plan",
  "endorsement",
  "endorsing",
  "application",
  "support",
  "assistance",
  "requirements",
  "eligibility",
  "interview",
];

function isCommercialQuery(query: string): boolean {
  const value = query.toLowerCase().trim();
  if (!value || value.length < 4) return false;
  return COMMERCIAL_TERMS.some((term) => value.includes(term));
}

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
        dimensions: ["query"],
        type: "web",
        dataState: "all",
        rowLimit: 250,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Search Console API ${response.status}: ${await response.text()}`);
  }

  const payload: any = await response.json();
  return (payload.rows || [])
    .map((row: any) => ({
      query: String(row.keys?.[0] || "").trim(),
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    }))
    .filter((row: SearchQueryRow) => isCommercialQuery(row.query));
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
    .filter((item) => item.position > 10 && item.position <= 50 && item.impressions >= 10)
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

export async function activateLifetimeTop5Autopilot(): Promise<{ planId: string; missionCount: number; queuedNow: number }> {
  const rows = await fetchCommercialSearchQueries(28);
  const mission = buildTop5Mission(rows);

  await db
    .update(seoAutomationPlans)
    .set({ status: "paused", updatedAt: new Date() })
    .where(eq(seoAutomationPlans.status, "active"));

  const strategyData = {
    autopilotMode: "top5-lifetime",
    perpetual: true,
    targetPosition: 5,
    lastRunAt: new Date().toISOString(),
    mission,
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

    await db.update(seoAutomationPlans).set({
      strategyData: {
        ...data,
        perpetual: true,
        targetPosition: 5,
        lastRunAt: new Date().toISOString(),
        mission,
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
