const { Pool } = require("pg");

const REQUIRED_COLUMNS = {
  blog_posts: ["post_status"],
  blog_generation_queue: [
    "id",
    "target_date",
    "topic",
    "category",
    "status",
    "generated_post_id",
    "generation_started_at",
    "generation_completed_at",
    "error",
    "created_at",
  ],
  api_latency_log: [
    "id",
    "route",
    "method",
    "status_code",
    "duration_ms",
    "user_id",
    "request_size",
    "response_size",
    "error_type",
    "error_message",
    "timestamp",
  ],
  coins_usage_log: [
    "id",
    "user_id",
    "change_type",
    "amount_changed",
    "previous_balance",
    "new_balance",
    "reason",
    "tool_id",
    "plan_id",
    "order_id",
    "timestamp",
  ],
  seo_automation_plans: [
    "id",
    "strategy_data",
    "business_name",
    "status",
    "total_content_items",
    "queued_items",
    "completed_items",
    "week_number",
    "start_date",
    "next_queue_date",
    "created_at",
    "updated_at",
  ],
  backlink_targets: [
    "id",
    "name",
    "url",
    "submission_url",
    "category",
    "platform",
    "domain_authority",
    "status",
    "priority",
    "effort",
    "expected_impact",
    "strategy",
    "ai_generated_content",
    "content_generated_at",
    "notes",
    "contact_email",
    "anchor_text",
    "link_type",
    "submitted_at",
    "live_checked_at",
    "is_live",
    "live_url",
    "created_at",
    "updated_at",
  ],
  user_notification_dismissals: [
    "id",
    "user_id",
    "notification_id",
    "dismissed_at",
  ],
  admin_audit_logs: ["id"],
};

const REQUIRED_INDEXES = [
  "idx_blog_status",
  "idx_blog_queue_date",
  "idx_blog_queue_status",
  "idx_api_latency_route",
  "idx_api_latency_timestamp",
  "idx_api_latency_status",
  "idx_coins_user",
  "idx_coins_type",
  "idx_coins_timestamp",
];

async function getColumns(client, tableName) {
  const result = await client.query(
    `SELECT column_name, is_nullable, data_type
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return Object.fromEntries(result.rows.map((row) => [row.column_name, row]));
}

async function verifyMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Phase-0 migration verification");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const failures = [];
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");

    for (const [tableName, requiredColumns] of Object.entries(REQUIRED_COLUMNS)) {
      const columns = await getColumns(client, tableName);
      if (Object.keys(columns).length === 0) {
        failures.push(`Missing required table: ${tableName}`);
        continue;
      }
      for (const columnName of requiredColumns) {
        if (!columns[columnName]) {
          failures.push(`Missing required column: ${tableName}.${columnName}`);
        }
      }
    }

    const queueColumns = await getColumns(client, "blog_generation_queue");
    if (queueColumns.target_date?.is_nullable !== "NO") {
      failures.push("blog_generation_queue.target_date must be NOT NULL");
    }

    const seoColumns = await getColumns(client, "seo_automation_plans");
    if (seoColumns.strategy_data?.is_nullable !== "NO") {
      failures.push("seo_automation_plans.strategy_data must be NOT NULL");
    }

    const indexResult = await client.query(
      `SELECT indexname
         FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = ANY($1::text[])`,
      [REQUIRED_INDEXES],
    );
    const presentIndexes = new Set(indexResult.rows.map((row) => row.indexname));
    for (const indexName of REQUIRED_INDEXES) {
      if (!presentIndexes.has(indexName)) failures.push(`Missing required index: ${indexName}`);
    }

    for (const constraintName of [
      "api_latency_log_user_id_users_id_fk",
      "coins_usage_log_user_id_users_id_fk",
    ]) {
      const result = await client.query(
        `SELECT convalidated
           FROM pg_constraint
          WHERE conname = $1
            AND connamespace = 'public'::regnamespace`,
        [constraintName],
      );
      if (result.rowCount !== 1 || result.rows[0]?.convalidated !== true) {
        failures.push(`Missing or unvalidated constraint: ${constraintName}`);
      }
    }

    const dismissalUnique = await client.query(
      `SELECT 1
         FROM pg_constraint c
         JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'user_notification_dismissals'
          AND c.contype = 'u'
          AND (
            SELECT array_agg(a.attname ORDER BY key_position.ordinality)
              FROM unnest(c.conkey) WITH ORDINALITY AS key_position(attnum, ordinality)
              JOIN pg_attribute a
                ON a.attrelid = c.conrelid
               AND a.attnum = key_position.attnum
          ) = ARRAY['user_id', 'notification_id']::name[]`,
    );
    if (dismissalUnique.rowCount !== 1) {
      failures.push(
        "user_notification_dismissals must have a unique constraint on (user_id, notification_id)",
      );
    }

    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  if (failures.length > 0) {
    console.error("[PHASE-0 VERIFY] Verification failed", failures);
    process.exitCode = 1;
    return;
  }

  console.log("[PHASE-0 VERIFY] Controlled schema migration verified successfully");
}

verifyMigration().catch((error) => {
  console.error("[PHASE-0 VERIFY] Failed:", error);
  process.exitCode = 1;
});
