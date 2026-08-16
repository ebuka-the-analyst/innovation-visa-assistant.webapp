const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[APP VERIFY] DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
const migrationDir = path.resolve(process.cwd(), 'migrations', 'app');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function main() {
  const client = await pool.connect();
  const failures = [];
  const observations = {};

  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '60s'");

    const requiredTables = [
      'app_schema_migrations',
      'business_plan_generation_jobs',
      'business_plan_generation_sections',
      'export_analytics',
      'conversion_funnel_events',
      'hourly_activity_aggregates',
    ];
    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [requiredTables],
    );
    const present = new Set(tables.rows.map((row) => row.table_name));
    for (const table of requiredTables) if (!present.has(table)) failures.push(`Missing required table: ${table}`);

    const requiredColumns = [
      ['cover_designs', 'logo_element'],
      ['business_plans', 'toc_style'],
      ['floating_feedback', 'rating'],
      ['blog_posts', 'post_status'],
      ['business_plan_generation_jobs', 'lease_token'],
      ['business_plan_generation_jobs', 'lease_expires_at'],
      ['business_plan_generation_jobs', 'heartbeat_at'],
      ['business_plan_generation_sections', 'content_sha256'],
      ['business_plan_generation_sections', 'generator_version'],
    ];
    for (const [table, column] of requiredColumns) {
      const result = await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (result.rowCount !== 1) failures.push(`Missing required column: ${table}.${column}`);
    }

    const requiredIndexes = [
      'ux_business_plan_generation_jobs_plan',
      'idx_business_plan_generation_jobs_claim',
      'ux_business_plan_generation_sections_plan_index',
      'idx_business_plan_generation_sections_plan',
      'ux_credit_transactions_generation_plan_once',
    ];
    const indexes = await client.query(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = ANY($1::text[])`,
      [requiredIndexes],
    );
    const presentIndexes = new Set(indexes.rows.map((row) => row.indexname));
    for (const index of requiredIndexes) if (!presentIndexes.has(index)) failures.push(`Missing required index: ${index}`);

    const duplicateCharges = await client.query(
      `SELECT reference_id, COUNT(*)::int AS count
       FROM credit_transactions
       WHERE type = 'generation'
         AND reference_type = 'business_plan'
         AND reference_id IS NOT NULL
       GROUP BY reference_id
       HAVING COUNT(*) > 1`,
    );
    if (duplicateCharges.rowCount > 0) failures.push('Duplicate generation charge records exist after migration');

    const unqueued = await client.query(
      `SELECT bp.id
       FROM business_plans bp
       LEFT JOIN business_plan_generation_jobs job ON job.plan_id = bp.id
       WHERE bp.status = 'generating'
         AND bp.generated_content IS NULL
         AND job.id IS NULL`,
    );
    observations.generatingPlansWithoutDurableJob = unqueued.rows;
    if (unqueued.rowCount > 0) failures.push(`${unqueued.rowCount} generating plan(s) have no durable generation job`);

    const migrationFiles = fs.existsSync(migrationDir)
      ? fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()
      : [];
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      const checksum = sha256(sql);
      const row = await client.query(
        'SELECT checksum_sha256 FROM app_schema_migrations WHERE id = $1',
        [file],
      );
      if (row.rowCount !== 1) {
        failures.push(`Migration is not recorded as applied: ${file}`);
      } else if (row.rows[0].checksum_sha256 !== checksum) {
        failures.push(`Migration checksum mismatch: ${file}`);
      }
    }

    const jobs = await client.query(
      `SELECT status, COUNT(*)::int AS count
       FROM business_plan_generation_jobs
       GROUP BY status ORDER BY status`,
    );
    observations.generationJobsByStatus = jobs.rows;

    await client.query('ROLLBACK');
    console.log(JSON.stringify({ ok: failures.length === 0, failures, observations }, null, 2));
    if (failures.length > 0) process.exitCode = 1;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[APP VERIFY] Failed:', error);
  process.exit(1);
});
