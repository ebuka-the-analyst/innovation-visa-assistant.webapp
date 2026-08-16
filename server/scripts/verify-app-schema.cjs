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
      'business_plan_versions',
      'business_plan_version_sections',
      'business_plan_revisions',
      'business_plan_revision_sections',
      'business_plan_revision_jobs',
      'business_plan_revision_events',
      'export_analytics',
      'conversion_funnel_events',
      'hourly_activity_aggregates',
      'tool_case_contexts',
      'tool_case_context_events',
      'tool_runs',
      'tool_run_events',
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
      ['business_plan_versions', 'content_sha256'],
      ['business_plan_revisions', 'selected_section_indexes'],
      ['business_plan_revisions', 'source_version_id'],
      ['business_plan_revision_sections', 'revised_sha256'],
      ['business_plan_revision_jobs', 'lease_token'],
      ['business_plan_revision_jobs', 'lease_expires_at'],
      ['business_plan_revision_events', 'event_type'],
      ['tool_case_contexts', 'revision'],
      ['tool_case_contexts', 'context_data'],
      ['tool_case_contexts', 'evidence_refs'],
      ['tool_case_context_events', 'new_sha256'],
      ['tool_runs', 'tool_id'],
      ['tool_runs', 'registry_version'],
      ['tool_runs', 'policy_version'],
      ['tool_runs', 'case_context_revision'],
      ['tool_runs', 'input_snapshot'],
      ['tool_runs', 'evidence_refs'],
      ['tool_runs', 'result_sha256'],
      ['tool_runs', 'validation_state'],
      ['tool_run_events', 'event_type'],
      ['tool_run_events', 'payload'],
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
      'ux_business_plan_versions_plan_number',
      'ux_business_plan_versions_one_accepted',
      'ux_business_plan_version_sections_version_index',
      'ux_business_plan_revisions_plan_number',
      'ux_business_plan_revisions_user_idempotency',
      'ux_business_plan_revisions_one_active',
      'ux_business_plan_revision_sections_revision_index',
      'ux_business_plan_revision_jobs_revision',
      'idx_business_plan_revision_jobs_claim',
      'idx_business_plan_revision_events_revision',
      'ux_tool_case_context_events_user_revision',
      'idx_tool_case_context_events_user_created',
      'ux_tool_runs_user_tool_client_key',
      'idx_tool_runs_user_created',
      'idx_tool_runs_user_tool_created',
      'idx_tool_runs_status_created',
      'idx_tool_run_events_run_created',
      'idx_tool_run_events_user_created',
    ];
    const indexes = await client.query(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = ANY($1::text[])`,
      [requiredIndexes],
    );
    const presentIndexes = new Set(indexes.rows.map((row) => row.indexname));
    for (const index of requiredIndexes) if (!presentIndexes.has(index)) failures.push(`Missing required index: ${index}`);

    const requiredCascadeForeignKeys = [
      ['business_plan_version_sections', 'version_id'],
      ['business_plan_version_sections', 'plan_id'],
      ['business_plan_revisions', 'plan_id'],
      ['business_plan_revisions', 'user_id'],
      ['business_plan_revision_sections', 'revision_id'],
      ['business_plan_revision_jobs', 'revision_id'],
      ['business_plan_revision_events', 'revision_id'],
      ['business_plan_revision_events', 'plan_id'],
      ['tool_case_contexts', 'user_id'],
      ['tool_case_context_events', 'user_id'],
      ['tool_runs', 'user_id'],
      ['tool_run_events', 'run_id'],
      ['tool_run_events', 'user_id'],
    ];
    for (const [table, column] of requiredCascadeForeignKeys) {
      const fk = await client.query(
        `SELECT 1
           FROM pg_constraint c
           JOIN pg_class t ON t.oid = c.conrelid
           JOIN pg_namespace n ON n.oid = t.relnamespace
           JOIN unnest(c.conkey) WITH ORDINALITY AS key(attnum, ord) ON true
           JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = key.attnum
          WHERE n.nspname = 'public'
            AND t.relname = $1
            AND c.contype = 'f'
            AND a.attname = $2
            AND c.confdeltype = 'c'`,
        [table, column],
      );
      if (fk.rowCount < 1) failures.push(`Missing ON DELETE CASCADE foreign key: ${table}.${column}`);
    }

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

    const revisionJobs = await client.query(
      `SELECT status, COUNT(*)::int AS count
       FROM business_plan_revision_jobs
       GROUP BY status ORDER BY status`,
    );
    observations.revisionJobsByStatus = revisionJobs.rows;

    const activeRevisionDuplicates = await client.query(
      `SELECT plan_id, COUNT(*)::int AS count
       FROM business_plan_revisions
       WHERE status IN ('submitted', 'in_progress', 'ready_for_review')
       GROUP BY plan_id HAVING COUNT(*) > 1`,
    );
    if (activeRevisionDuplicates.rowCount > 0) failures.push('More than one active revision exists for a plan');

    const acceptedVersionDuplicates = await client.query(
      `SELECT plan_id, COUNT(*)::int AS count
       FROM business_plan_versions
       WHERE status = 'accepted'
       GROUP BY plan_id HAVING COUNT(*) > 1`,
    );
    if (acceptedVersionDuplicates.rowCount > 0) failures.push('More than one accepted version exists for a plan');

    const toolRuns = await client.query(
      `SELECT status, validation_state, COUNT(*)::int AS count
         FROM tool_runs
        GROUP BY status, validation_state
        ORDER BY status, validation_state`,
    );
    observations.toolRunsByStatus = toolRuns.rows;

    const caseContexts = await client.query('SELECT COUNT(*)::int AS count FROM tool_case_contexts');
    observations.toolCaseContextCount = caseContexts.rows[0]?.count || 0;

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
