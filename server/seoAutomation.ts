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
import { eq, and } from "drizzle-orm";

const MAX_POSTS_PER_WEEK = 2;

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
    const currentWeek = (plan.weekNumber || 1) + 1;

    if (currentWeek > 13) {
      // Plan complete
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
}
