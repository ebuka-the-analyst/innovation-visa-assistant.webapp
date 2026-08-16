const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[APP PREFLIGHT] DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

async function main() {
  const client = await pool.connect();
  const blockers = [];
  const warnings = [];
  const observations = {};

  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '60s'");

    const requiredTables = [
      'users',
      'business_plans',
      'credit_transactions',
      'cover_designs',
      'blog_posts',
      'floating_feedback',
    ];

    const tableResult = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [requiredTables],
    );
    const existingTables = new Set(tableResult.rows.map((row) => row.table_name));
    for (const table of requiredTables) {
      if (!existingTables.has(table)) blockers.push(`Required baseline table is missing: ${table}`);
    }

    if (existingTables.has('business_plans')) {
      const planColumns = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'business_plans'`,
      );
      const names = new Set(planColumns.rows.map((row) => row.column_name));
      for (const column of ['id', 'user_id', 'tier', 'status', 'generated_content', 'current_generation_stage']) {
        if (!names.has(column)) blockers.push(`business_plans.${column} is required`);
      }

      if (blockers.length === 0) {
        const generating = await client.query(
          `SELECT id, current_generation_stage
           FROM business_plans
           WHERE status = 'generating' AND generated_content IS NULL
           ORDER BY created_at ASC`,
        );
        observations.generatingPlansAwaitingDurableRecovery = generating.rows;
      }
    }

    if (existingTables.has('users')) {
      const userColumns = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'users'`,
      );
      const names = new Set(userColumns.rows.map((row) => row.column_name));
      for (const column of ['id', 'plan_credits', 'bonus_credits']) {
        if (!names.has(column)) blockers.push(`users.${column} is required`);
      }
    }

    if (existingTables.has('credit_transactions')) {
      const creditColumns = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'credit_transactions'`,
      );
      const names = new Set(creditColumns.rows.map((row) => row.column_name));
      for (const column of ['id', 'user_id', 'type', 'credits_change', 'credits_type', 'balance_after', 'reference_type', 'reference_id']) {
        if (!names.has(column)) blockers.push(`credit_transactions.${column} is required`);
      }

      if (['type', 'reference_type', 'reference_id'].every((column) => names.has(column))) {
        const duplicates = await client.query(
          `SELECT reference_id, COUNT(*)::int AS count
           FROM credit_transactions
           WHERE type = 'generation'
             AND reference_type = 'business_plan'
             AND reference_id IS NOT NULL
           GROUP BY reference_id
           HAVING COUNT(*) > 1
           ORDER BY COUNT(*) DESC`,
        );
        observations.duplicateGenerationChargePlans = duplicates.rows;
        if (duplicates.rowCount > 0) {
          blockers.push(
            `Billing integrity blocker: ${duplicates.rowCount} business plan(s) have duplicate generation charge records`,
          );
        }
      }
    }

    const generationTables = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('business_plan_generation_jobs', 'business_plan_generation_sections', 'app_schema_migrations')`,
    );
    observations.alreadyPresentGenerationTables = generationTables.rows.map((row) => row.table_name).sort();

    const oldRuntimeObjects = [
      ['cover_designs', 'logo_element'],
      ['business_plans', 'toc_style'],
      ['floating_feedback', 'rating'],
      ['blog_posts', 'post_status'],
    ];
    for (const [table, column] of oldRuntimeObjects) {
      if (!existingTables.has(table)) continue;
      const result = await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (result.rowCount === 0) warnings.push(`${table}.${column} will be created by the explicit app migration`);
    }

    await client.query('ROLLBACK');
    console.log(JSON.stringify({ ok: blockers.length === 0, blockers, warnings, observations }, null, 2));
    if (blockers.length > 0) process.exitCode = 1;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[APP PREFLIGHT] Failed:', error);
  process.exit(1);
});
