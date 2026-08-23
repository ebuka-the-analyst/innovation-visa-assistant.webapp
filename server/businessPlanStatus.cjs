const { Pool } = require("pg");

const STATUS_ROUTE = "/api/business-plan/status";
const LOG_PREFIX = "[BUSINESS PLAN STATUS]";

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function isAuthenticated(req) {
  return Boolean(req?.isAuthenticated && req.isAuthenticated() && req.user?.id);
}

function normaliseStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isActiveStatus(value) {
  return ["pending", "processing", "generating", "in_progress", "in-progress"].includes(normaliseStatus(value));
}

async function reconcileCompletedBusinessPlansForUser(userId, db = getPool()) {
  if (!userId) return { repaired: 0, planIds: [] };

  try {
    const result = await db.query(
      `UPDATE business_plans AS bp
          SET status = 'completed'
        WHERE bp.user_id = $1
          AND LOWER(COALESCE(bp.status, '')) <> 'completed'
          AND (
            EXISTS (
              SELECT 1
                FROM business_plan_versions AS bpv
               WHERE bpv.plan_id = bp.id
                 AND LOWER(COALESCE(bpv.status, '')) = 'accepted'
            )
            OR (
              EXISTS (
                SELECT 1
                  FROM business_plan_generation_jobs AS bpgj
                 WHERE bpgj.plan_id = bp.id
                   AND LOWER(COALESCE(bpgj.status, '')) = 'completed'
              )
              AND (
                NULLIF(BTRIM(COALESCE(bp.generated_content, '')), '') IS NOT NULL
                OR NULLIF(BTRIM(COALESCE(bp.pdf_url, '')), '') IS NOT NULL
              )
            )
          )
       RETURNING bp.id`,
      [userId],
    );

    if (result.rowCount > 0) {
      console.info(`${LOG_PREFIX} Reconciled ${result.rowCount} completed plan record${result.rowCount === 1 ? "" : "s"} for an authenticated account.`);
    }

    return {
      repaired: result.rowCount || 0,
      planIds: (result.rows || []).map((row) => row.id),
    };
  } catch (error) {
    // Reconciliation is a compatibility repair. It must never make the user's
    // account unavailable if an older/local schema is missing a durable table.
    console.warn(`${LOG_PREFIX} Reconciliation skipped: ${error?.message || error}`);
    return { repaired: 0, planIds: [], skipped: true };
  }
}

async function getBusinessPlanStatusForUser(userId, options = {}) {
  if (!userId) throw new Error("userId is required");
  const db = options.db || getPool();

  if (options.reconcile !== false) {
    await reconcileCompletedBusinessPlansForUser(userId, db);
  }

  const result = await db.query(
    `SELECT id, business_name, status, pdf_url, generated_content, created_at,
            monthly_projections, cac, ltv, payback_period, funding_sources, detailed_costs,
            competitors, competitive_differentiation, customer_interviews,
            willingness_to_pay, market_size
       FROM business_plans
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );

  const plans = result.rows || [];
  const completedPlans = plans.filter((row) => normaliseStatus(row.status) === "completed");
  const activePlans = plans.filter((row) => isActiveStatus(row.status));
  const latest = plans[0] || null;
  const latestCompleted = completedPlans[0] || null;

  return {
    total: plans.length,
    completed: completedPlans.length,
    active: activePlans.length,
    state: latestCompleted ? "completed" : activePlans.length ? "in_progress" : plans.length ? "recorded" : "none",
    latest: latest
      ? {
          id: latest.id,
          businessName: latest.business_name || "Unnamed business plan",
          status: latest.status || "unknown",
          pdfUrl: latest.pdf_url || null,
          createdAt: latest.created_at || null,
        }
      : null,
    latestCompleted,
    plans,
  };
}

function publicBusinessPlanStatus(status) {
  return {
    total: status.total,
    completed: status.completed,
    active: status.active,
    state: status.state,
    latest: status.latest,
    hasCompletedPlan: status.completed > 0,
  };
}

function registerBusinessPlanStatusRoutes(app) {
  if (app.__businessPlanStatusRoutesInstalled) return;
  Object.defineProperty(app, "__businessPlanStatusRoutesInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  app.get(STATUS_ROUTE, async (req, res) => {
    if (!isAuthenticated(req)) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const status = await getBusinessPlanStatusForUser(req.user.id);
      res.setHeader("Cache-Control", "no-store");
      return res.json(publicBusinessPlanStatus(status));
    } catch (error) {
      console.error(`${LOG_PREFIX} Read failed:`, error);
      return res.status(500).json({ error: "Business plan status could not be loaded" });
    }
  });
}

module.exports = {
  STATUS_ROUTE,
  getPool,
  isAuthenticated,
  normaliseStatus,
  isActiveStatus,
  reconcileCompletedBusinessPlansForUser,
  getBusinessPlanStatusForUser,
  publicBusinessPlanStatus,
  registerBusinessPlanStatusRoutes,
};
