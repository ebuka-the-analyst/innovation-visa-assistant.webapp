const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[APPLICATION CONTEXT VERIFY] DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

const REQUIRED_COLUMNS = {
  business_plans: ['id', 'user_id', 'status', 'business_name', 'is_demo_data', 'created_at'],
  tool_case_contexts: ['user_id', 'revision', 'context_data', 'evidence_refs', 'created_at', 'updated_at'],
  tool_runs: ['id', 'user_id', 'tool_id', 'status', 'input_snapshot', 'evidence_refs', 'completed_at', 'created_at'],
  user_documents: ['id', 'user_id', 'name', 'category', 'status', 'created_at', 'updated_at'],
  document_extractions: ['id', 'user_id', 'document_ids', 'status', 'extracted_data', 'confidence', 'created_at'],
};

async function main() {
  const client = await pool.connect();
  const failures = [];

  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '30s'");

    for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
      const tableResult = await client.query(
        `SELECT 1
           FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = $1`,
        [table],
      );
      if (tableResult.rowCount !== 1) {
        failures.push(`Missing required application-context table: ${table}`);
        continue;
      }

      const columnResult = await client.query(
        `SELECT column_name
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = $1
            AND column_name = ANY($2::text[])`,
        [table, columns],
      );
      const present = new Set(columnResult.rows.map((row) => row.column_name));
      for (const column of columns) {
        if (!present.has(column)) failures.push(`Missing required application-context column: ${table}.${column}`);
      }
    }

    await client.query('ROLLBACK');

    console.log(JSON.stringify({
      ok: failures.length === 0,
      failures,
      checkedTables: Object.keys(REQUIRED_COLUMNS),
    }, null, 2));

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
  console.error('[APPLICATION CONTEXT VERIFY] Failed:', error);
  process.exit(1);
});
