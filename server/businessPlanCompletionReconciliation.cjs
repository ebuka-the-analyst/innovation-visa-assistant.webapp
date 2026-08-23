const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/progress-tracker";
const LOG_PREFIX = "[BUSINESS PLAN RECONCILIATION]";
const application = express.application;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return pool;
}

function isAuthenticated(req) {
  return Boolean(
    req.isAuthenticated &&
      req.isAuthenticated() &&
      req.user &&
      req.user.id,
  );
}

async function reconcileCompletedBusinessPlansForUser(userId) {
  const db = getPool();
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
    console.info(
      `${LOG_PREFIX} Restored ${result.rowCount} durably completed plan record${result.rowCount === 1 ? "" : "s"} for the authenticated account.`,
    );
  }
}

async function reconcileBeforeProgress(req, _res, next) {
  if (!isAuthenticated(req)) {
    next();
    return;
  }

  try {
    await reconcileCompletedBusinessPlansForUser(req.user.id);
  } catch (error) {
    // Reconciliation must never make Progress Tracker unavailable. Older/local
    // schemas may not yet contain the durable generation/version tables.
    console.warn(`${LOG_PREFIX} Request reconciliation skipped: ${error?.message || error}`);
  }

  next();
}

if (!application.__businessPlanCompletionRequestHookInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__businessPlanCompletionRequestHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function businessPlanCompletionGet(path, ...handlers) {
    const isProgressRoute =
      path === ROUTE &&
      handlers.length > 0;

    if (isProgressRoute) {
      return originalGet.call(this, path, reconcileBeforeProgress, ...handlers);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
