const { Pool } = require("pg");

const LOG_PREFIX = "[BUSINESS PLAN RECONCILIATION]";

function hasDatabaseUrl() {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.trim().length > 0;
}

async function reconcileCompletedBusinessPlans() {
  if (!hasDatabaseUrl()) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`${LOG_PREFIX} DATABASE_URL is not configured; skipping reconciliation.`);
    }
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  try {
    const result = await pool.query(`
      UPDATE business_plans AS bp
         SET status = 'completed'
       WHERE LOWER(COALESCE(bp.status, '')) <> 'completed'
         AND bp.user_id IS NOT NULL
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
      RETURNING bp.id
    `);

    if (result.rowCount > 0) {
      console.info(`${LOG_PREFIX} Restored ${result.rowCount} durably completed plan record${result.rowCount === 1 ? "" : "s"} to completed status.`);
    }
  } catch (error) {
    // Older/local schemas may not have the durable generation/version tables yet.
    // Do not stop the application; the schema migration/preflight remains authoritative.
    console.warn(`${LOG_PREFIX} Reconciliation skipped: ${error?.message || error}`);
  } finally {
    await pool.end().catch(() => undefined);
  }
}

// Run once per application process. The query is idempotent and only repairs records
// backed by durable server-side proof of a successfully generated/accepted plan.
void reconcileCompletedBusinessPlans();
