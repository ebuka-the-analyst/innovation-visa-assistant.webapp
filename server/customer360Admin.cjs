const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/admin/customer-360";
const application = express.application;
let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function verifyAdmin(req) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.id) return false;
  const result = await getPool().query(
    "SELECT is_admin FROM users WHERE id = $1 LIMIT 1",
    [req.user.id],
  );
  return result.rows[0]?.is_admin === true;
}

async function safeQuery(client, text, params = [], fallback = []) {
  try {
    const result = await client.query(text, params);
    return result.rows || fallback;
  } catch (error) {
    console.warn("[CUSTOMER 360] Optional query skipped:", error?.message || error);
    return fallback;
  }
}

function number(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function iso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function successfulPayment(row) {
  return ["succeeded", "completed", "paid"].includes(String(row?.status || "").toLowerCase());
}

function paymentAmount(row) {
  return number(row?.amount);
}

function paymentTier(row) {
  const value = row?.tier || row?.subscription_tier || row?.plan_tier || null;
  return value ? String(value).toLowerCase() : null;
}

function deriveTierHistory(user, payments) {
  const currentTier = String(user.subscription_tier || "free").toLowerCase();
  const successful = payments
    .filter(successfulPayment)
    .map((payment) => ({
      tier: paymentTier(payment),
      at: iso(payment.completed_at || payment.created_at),
      type: payment.type || "payment",
    }))
    .filter((event) => event.tier && event.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const observed = [];
  for (const event of successful) {
    const existing = observed.find((item) => item.tier === event.tier);
    if (existing) {
      existing.lastSeenAt = event.at;
      existing.transactions += 1;
    } else {
      observed.push({
        tier: event.tier,
        firstSeenAt: event.at,
        lastSeenAt: event.at,
        transactions: 1,
        source: "payment_history",
      });
    }
  }

  const recordedPrevious = user.previous_tier ? String(user.previous_tier).toLowerCase() : null;
  let derivedPrevious = null;
  for (let index = successful.length - 1; index >= 0; index -= 1) {
    const tier = successful[index].tier;
    if (tier && tier !== currentTier) {
      derivedPrevious = tier;
      break;
    }
  }

  const previousTier = recordedPrevious || derivedPrevious || null;
  const previousTierSource = recordedPrevious
    ? "account_record"
    : derivedPrevious
      ? "payment_history"
      : null;

  return { currentTier, previousTier, previousTierSource, recordedPrevious, observed };
}

function buildHealth({ user, stats, credits }) {
  let score = 100;
  const flags = [];
  const paidTier = !["", "free"].includes(String(user.subscription_tier || "free").toLowerCase());
  const totalCredits = number(user.plan_credits) + number(user.bonus_credits);
  const activeSessions = number(stats.active_sessions);
  const failedPlans = number(stats.failed_plans);
  const failedPayments = number(stats.failed_payments);

  if (user.is_banned) {
    score -= 50;
    flags.push({ severity: "critical", code: "banned", label: "Account is banned" });
  }
  if (user.suspended_until && new Date(user.suspended_until).getTime() > Date.now()) {
    score -= 35;
    flags.push({ severity: "critical", code: "suspended", label: "Account is currently suspended" });
  }
  if (!user.is_email_verified) {
    score -= 10;
    flags.push({ severity: "warning", code: "email_unverified", label: "Email address is not verified" });
  }
  if (paidTier && !["active", "succeeded", "completed"].includes(String(user.subscription_status || "").toLowerCase())) {
    score -= 15;
    flags.push({ severity: "warning", code: "subscription_status", label: `Subscription status is ${user.subscription_status || "unknown"}` });
  }
  if (paidTier && totalCredits === 0) {
    flags.push({ severity: "info", code: "no_credits", label: "No credits remaining" });
  }
  if (paidTier && number(stats.total_plans) === 0) {
    flags.push({ severity: "info", code: "no_plans", label: "Paid account has not created a business plan yet" });
  }
  if (failedPlans > 0) {
    score -= Math.min(20, failedPlans * 5);
    flags.push({ severity: "warning", code: "failed_plans", label: `${failedPlans} failed plan generation${failedPlans === 1 ? "" : "s"}` });
  }
  if (failedPayments > 0) {
    score -= Math.min(20, failedPayments * 5);
    flags.push({ severity: "warning", code: "failed_payments", label: `${failedPayments} failed or overdue payment record${failedPayments === 1 ? "" : "s"}` });
  }
  if (activeSessions > 3) {
    score -= 5;
    flags.push({ severity: "info", code: "many_sessions", label: `${activeSessions} concurrent active sessions` });
  }
  if (user.last_activity_at) {
    const inactivityDays = Math.floor((Date.now() - new Date(user.last_activity_at).getTime()) / 86400000);
    if (inactivityDays >= 30) {
      score -= 10;
      flags.push({ severity: "info", code: "inactive", label: `No recorded activity for ${inactivityDays} days` });
    }
  }

  const latestCreditBalance = credits[0]?.balance_after;
  if (latestCreditBalance !== undefined && latestCreditBalance !== null) {
    if (number(latestCreditBalance) !== totalCredits) {
      flags.push({ severity: "warning", code: "credit_ledger_mismatch", label: "Current credit balance differs from the latest ledger balance" });
      score -= 15;
    }
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 85 ? "good" : score >= 65 ? "attention" : "critical";
  return { score, status, flags };
}

async function handleCustomer360(req, res) {
  try {
    if (!(await verifyAdmin(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const email = String(req.query.email || "").trim();
    if (!email || email.length > 320 || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email query parameter is required" });
    }

    const client = getPool();
    const userResult = await client.query(
      `SELECT
         id, email, first_name, last_name, profile_image_url,
         is_email_verified, is_admin, has_completed_onboarding, onboarding_completed_at,
         plan_credits, bonus_credits, credits_used, last_credit_refresh,
         has_ultimate_assurance, previous_tier, tier_upgraded_at, total_spent,
         subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id,
         is_banned, suspended_until, suspended_reason, admin_notes, last_activity_at,
         tier_expires_at, tier_override_by, tier_override_reason, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email],
    );

    if (userResult.rowCount !== 1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];
    const userId = user.id;

    const [plans, toolUsage, toolEvents, sessions, pages, credits, paymentRows, activityRows, securityRows, statsRows] = await Promise.all([
      safeQuery(client, `
        SELECT id, business_name, industry, tier, status, current_generation_stage,
               CASE WHEN pdf_url IS NOT NULL AND pdf_url <> '' THEN true ELSE false END AS has_pdf,
               CASE WHEN generated_content IS NOT NULL AND generated_content <> '' THEN true ELSE false END AS has_generated_content,
               COALESCE(LENGTH(generated_content), 0)::integer AS generated_content_chars,
               stripe_session_id, is_demo_data, target_endorser, innovation_stage,
               product_status, created_at
        FROM business_plans
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100`, [userId]),
      safeQuery(client, `
        SELECT tool_id, COALESCE(tool_category, 'Uncategorised') AS tool_category,
               COUNT(*)::integer AS uses, MIN(occurred_at) AS first_used,
               MAX(occurred_at) AS last_used
        FROM activity_events
        WHERE user_id = $1 AND tool_id IS NOT NULL
        GROUP BY tool_id, tool_category
        ORDER BY uses DESC, last_used DESC
        LIMIT 200`, [userId]),
      safeQuery(client, `
        SELECT id, session_id, event_type, event_category, event_action, event_label,
               event_value, page_path, tool_id, tool_category, occurred_at
        FROM activity_events
        WHERE user_id = $1 AND tool_id IS NOT NULL
        ORDER BY occurred_at DESC
        LIMIT 100`, [userId]),
      safeQuery(client, `
        SELECT id, session_started_at, last_seen_at, session_ended_at, is_active,
               user_agent, device_type, browser_name, browser_version, os_name, os_version,
               screen_resolution, ip_address, country, country_code, region, city,
               connection_type, page_view_count, event_count, total_duration_seconds,
               entry_page, current_page, exit_page, created_at
        FROM user_sessions
        WHERE user_id = $1
        ORDER BY session_started_at DESC
        LIMIT 200`, [userId]),
      safeQuery(client, `
        SELECT id, session_id, page_path, page_title, page_url, referrer_path,
               navigation_type, view_started_at, view_ended_at, time_on_page_seconds,
               scroll_depth_percent, click_count
        FROM page_views
        WHERE user_id = $1
        ORDER BY view_started_at DESC
        LIMIT 300`, [userId]),
      safeQuery(client, `
        SELECT id, type, credits_change, credits_type, balance_after,
               reference_id, reference_type, description, metadata, created_at
        FROM credit_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 200`, [userId]),
      safeQuery(client, `
        SELECT to_jsonb(pt) AS data
        FROM payment_transactions pt
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100`, [userId]),
      safeQuery(client, `
        SELECT to_jsonb(ual) AS data
        FROM user_activity_logs ual
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100`, [userId]),
      safeQuery(client, `
        SELECT to_jsonb(se) AS data
        FROM security_events se
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50`, [userId]),
      safeQuery(client, `
        SELECT
          (SELECT COUNT(*) FROM business_plans WHERE user_id = $1)::integer AS total_plans,
          (SELECT COUNT(*) FROM business_plans WHERE user_id = $1 AND LOWER(COALESCE(status, '')) = 'completed')::integer AS completed_plans,
          (SELECT COUNT(*) FROM business_plans WHERE user_id = $1 AND LOWER(COALESCE(status, '')) = 'failed')::integer AS failed_plans,
          (SELECT COUNT(*) FROM user_sessions WHERE user_id = $1)::integer AS total_sessions,
          (SELECT COUNT(*) FROM user_sessions WHERE user_id = $1 AND is_active = true)::integer AS active_sessions,
          (SELECT COALESCE(SUM(total_duration_seconds), 0) FROM user_sessions WHERE user_id = $1)::bigint AS total_session_seconds,
          (SELECT COUNT(*) FROM page_views WHERE user_id = $1)::integer AS total_page_views,
          (SELECT COALESCE(SUM(time_on_page_seconds), 0) FROM page_views WHERE user_id = $1)::bigint AS total_page_seconds,
          (SELECT COALESCE(SUM(click_count), 0) FROM page_views WHERE user_id = $1)::bigint AS total_clicks,
          (SELECT COUNT(DISTINCT tool_id) FROM activity_events WHERE user_id = $1 AND tool_id IS NOT NULL)::integer AS unique_tools,
          (SELECT COUNT(*) FROM activity_events WHERE user_id = $1 AND tool_id IS NOT NULL)::integer AS total_tool_uses,
          (SELECT COUNT(*) FROM credit_transactions WHERE user_id = $1)::integer AS total_credit_transactions,
          (SELECT COALESCE(SUM(CASE WHEN credits_change > 0 THEN credits_change ELSE 0 END), 0) FROM credit_transactions WHERE user_id = $1)::bigint AS lifetime_granted,
          (SELECT COALESCE(SUM(CASE WHEN credits_change < 0 THEN ABS(credits_change) ELSE 0 END), 0) FROM credit_transactions WHERE user_id = $1)::bigint AS lifetime_consumed,
          (SELECT COUNT(*) FROM payment_transactions WHERE user_id = $1)::integer AS total_payments,
          (SELECT COUNT(*) FROM payment_transactions WHERE user_id = $1 AND LOWER(COALESCE(status, '')) IN ('succeeded','completed','paid'))::integer AS successful_payments,
          (SELECT COUNT(*) FROM payment_transactions WHERE user_id = $1 AND LOWER(COALESCE(status, '')) IN ('failed','past_due'))::integer AS failed_payments,
          (SELECT COALESCE(SUM(CASE WHEN LOWER(COALESCE(status, '')) IN ('succeeded','completed','paid') THEN COALESCE(amount, 0) ELSE 0 END), 0) FROM payment_transactions WHERE user_id = $1)::bigint AS payment_total,
          (SELECT MAX(created_at) FROM payment_transactions WHERE user_id = $1 AND LOWER(COALESCE(status, '')) IN ('succeeded','completed','paid')) AS last_successful_payment_at
      `, [userId]),
    ]);

    const payments = paymentRows.map((row) => row.data || row).filter(Boolean);
    const activity = activityRows.map((row) => row.data || row).filter(Boolean);
    const security = securityRows.map((row) => row.data || row).filter(Boolean);
    const fallbackSuccessfulPayments = payments.filter(successfulPayment);
    const fallbackFailedPayments = payments.filter((payment) => ["failed", "past_due"].includes(String(payment.status || "").toLowerCase()));
    const fallbackPaymentTotal = fallbackSuccessfulPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);

    const fallbackStats = {
      total_plans: plans.length,
      completed_plans: plans.filter((plan) => String(plan.status || "").toLowerCase() === "completed").length,
      failed_plans: plans.filter((plan) => String(plan.status || "").toLowerCase() === "failed").length,
      total_sessions: sessions.length,
      active_sessions: sessions.filter((session) => session.is_active).length,
      total_session_seconds: sessions.reduce((sum, session) => sum + number(session.total_duration_seconds), 0),
      total_page_views: pages.length,
      total_page_seconds: pages.reduce((sum, page) => sum + number(page.time_on_page_seconds), 0),
      total_clicks: pages.reduce((sum, page) => sum + number(page.click_count), 0),
      unique_tools: toolUsage.length,
      total_tool_uses: toolUsage.reduce((sum, tool) => sum + number(tool.uses), 0),
      total_credit_transactions: credits.length,
      lifetime_granted: credits.filter((tx) => number(tx.credits_change) > 0).reduce((sum, tx) => sum + number(tx.credits_change), 0),
      lifetime_consumed: credits.filter((tx) => number(tx.credits_change) < 0).reduce((sum, tx) => sum + Math.abs(number(tx.credits_change)), 0),
      total_payments: payments.length,
      successful_payments: fallbackSuccessfulPayments.length,
      failed_payments: fallbackFailedPayments.length,
      payment_total: fallbackPaymentTotal,
      last_successful_payment_at: fallbackSuccessfulPayments[0]?.created_at || null,
    };
    const stats = statsRows[0] || fallbackStats;
    const tierHistory = deriveTierHistory(user, payments);
    const health = buildHealth({ user, stats, credits });

    const response = {
      generatedAt: new Date().toISOString(),
      mode: "read-only",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImageUrl: user.profile_image_url,
        emailVerified: Boolean(user.is_email_verified),
        isAdmin: Boolean(user.is_admin),
        onboardingComplete: Boolean(user.has_completed_onboarding),
        onboardingCompletedAt: iso(user.onboarding_completed_at),
        subscriptionTier: user.subscription_tier || "free",
        subscriptionStatus: user.subscription_status || "inactive",
        previousTier: tierHistory.previousTier,
        previousTierRecorded: tierHistory.recordedPrevious,
        previousTierSource: tierHistory.previousTierSource,
        tierHistory: tierHistory.observed,
        tierUpgradedAt: iso(user.tier_upgraded_at),
        tierExpiresAt: iso(user.tier_expires_at),
        stripeCustomerId: user.stripe_customer_id,
        stripeSubscriptionId: user.stripe_subscription_id,
        isBanned: Boolean(user.is_banned),
        suspendedUntil: iso(user.suspended_until),
        suspendedReason: user.suspended_reason,
        adminNotes: user.admin_notes,
        lastActivityAt: iso(user.last_activity_at),
        createdAt: iso(user.created_at),
        updatedAt: iso(user.updated_at),
      },
      overview: {
        health,
        currentPage: sessions.find((session) => session.is_active)?.current_page || sessions[0]?.current_page || null,
        lastSeenAt: iso(sessions[0]?.last_seen_at || user.last_activity_at),
        activeSessions: number(stats.active_sessions),
        totalSessions: number(stats.total_sessions),
        totalPlans: number(stats.total_plans),
        completedPlans: number(stats.completed_plans),
        failedPlans: number(stats.failed_plans),
        uniqueToolsUsed: number(stats.unique_tools),
        totalToolUses: number(stats.total_tool_uses),
        pageViewsTracked: number(stats.total_page_views),
        totalTrackedSessionSeconds: number(stats.total_session_seconds),
        totalTrackedPageSeconds: number(stats.total_page_seconds),
        totalClicks: number(stats.total_clicks),
      },
      coverage: {
        plans: { returned: plans.length, total: number(stats.total_plans), limit: 100 },
        tools: { returned: toolUsage.length, total: number(stats.unique_tools), limit: 200 },
        sessions: { returned: sessions.length, total: number(stats.total_sessions), limit: 200 },
        pages: { returned: pages.length, total: number(stats.total_page_views), limit: 300 },
        credits: { returned: credits.length, total: number(stats.total_credit_transactions), limit: 200 },
        payments: { returned: payments.length, total: number(stats.total_payments), limit: 100 },
      },
      plans: plans.map((plan) => ({
        id: plan.id,
        businessName: plan.business_name,
        industry: plan.industry,
        tier: plan.tier,
        status: plan.status,
        currentGenerationStage: plan.current_generation_stage,
        hasPdf: Boolean(plan.has_pdf),
        hasGeneratedContent: Boolean(plan.has_generated_content),
        generatedContentChars: number(plan.generated_content_chars),
        stripeSessionId: plan.stripe_session_id,
        isDemoData: Boolean(plan.is_demo_data),
        targetEndorser: plan.target_endorser,
        innovationStage: plan.innovation_stage,
        productStatus: plan.product_status,
        createdAt: iso(plan.created_at),
      })),
      tools: {
        uniqueToolsUsed: number(stats.unique_tools),
        totalUses: number(stats.total_tool_uses),
        usage: toolUsage.map((tool) => ({
          toolId: tool.tool_id,
          category: tool.tool_category,
          uses: number(tool.uses),
          firstUsedAt: iso(tool.first_used),
          lastUsedAt: iso(tool.last_used),
        })),
        recentEvents: toolEvents.map((event) => ({
          id: event.id,
          sessionId: event.session_id,
          eventType: event.event_type,
          category: event.event_category,
          action: event.event_action,
          label: event.event_label,
          value: event.event_value,
          pagePath: event.page_path,
          toolId: event.tool_id,
          toolCategory: event.tool_category,
          occurredAt: iso(event.occurred_at),
        })),
      },
      sessions: sessions.map((session) => {
        const locationParts = [session.city, session.region, session.country].filter(Boolean);
        const locationLabel = locationParts.length
          ? `${locationParts.join(", ")}${session.country_code && !String(locationParts.join(" ")).includes(String(session.country_code)) ? ` (${session.country_code})` : ""}`
          : "Location not captured for this session";
        return {
          id: session.id,
          startedAt: iso(session.session_started_at),
          lastSeenAt: iso(session.last_seen_at),
          endedAt: iso(session.session_ended_at),
          isActive: Boolean(session.is_active),
          userAgent: session.user_agent,
          deviceType: session.device_type,
          browserName: session.browser_name,
          browserVersion: session.browser_version,
          osName: session.os_name,
          osVersion: session.os_version,
          screenResolution: session.screen_resolution,
          ipAddress: session.ip_address,
          country: session.country,
          countryCode: session.country_code,
          region: session.region,
          city: session.city,
          locationCaptured: locationParts.length > 0,
          locationLabel,
          connectionType: session.connection_type,
          pageViewCount: number(session.page_view_count),
          eventCount: number(session.event_count),
          totalDurationSeconds: number(session.total_duration_seconds),
          entryPage: session.entry_page,
          currentPage: session.current_page,
          exitPage: session.exit_page,
        };
      }),
      pages: pages.map((page) => ({
        id: page.id,
        sessionId: page.session_id,
        path: page.page_path,
        title: page.page_title,
        url: page.page_url,
        referrerPath: page.referrer_path,
        navigationType: page.navigation_type,
        startedAt: iso(page.view_started_at),
        endedAt: iso(page.view_ended_at),
        timeOnPageSeconds: number(page.time_on_page_seconds),
        scrollDepthPercent: number(page.scroll_depth_percent),
        clickCount: number(page.click_count),
      })),
      billing: {
        subscriptionTier: user.subscription_tier || "free",
        subscriptionStatus: user.subscription_status || "inactive",
        planCredits: number(user.plan_credits),
        bonusCredits: number(user.bonus_credits),
        totalCredits: number(user.plan_credits) + number(user.bonus_credits),
        creditsUsed: number(user.credits_used),
        lifetimeGranted: number(stats.lifetime_granted),
        lifetimeConsumed: number(stats.lifetime_consumed),
        lastCreditRefresh: iso(user.last_credit_refresh),
        hasUltimateAssurance: Boolean(user.has_ultimate_assurance),
        totalSpentPence: number(stats.payment_total) || number(user.total_spent),
        successfulPaymentCount: number(stats.successful_payments),
        failedPaymentCount: number(stats.failed_payments),
        totalPaymentCount: number(stats.total_payments),
        totalCreditTransactionCount: number(stats.total_credit_transactions),
        lastPaymentAt: iso(stats.last_successful_payment_at || fallbackSuccessfulPayments[0]?.created_at),
        payments,
        creditTransactions: credits.map((tx) => ({
          id: tx.id,
          type: tx.type,
          creditsChange: number(tx.credits_change),
          creditsType: tx.credits_type,
          balanceAfter: number(tx.balance_after),
          referenceId: tx.reference_id,
          referenceType: tx.reference_type,
          description: tx.description,
          metadata: tx.metadata,
          createdAt: iso(tx.created_at),
        })),
      },
      recentActivity: activity,
      security,
    };

    res.setHeader("Cache-Control", "no-store");
    return res.json(response);
  } catch (error) {
    console.error("[CUSTOMER 360] Failed:", error);
    return res.status(500).json({ error: "Failed to load customer 360 account data" });
  }
}

if (!application.__customer360HookInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__customer360HookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function customer360Get(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;

    if (isRouteRegistration && !this.__customer360RouteInstalled) {
      Object.defineProperty(this, "__customer360RouteInstalled", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });
      originalGet.call(this, ROUTE, handleCustomer360);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
