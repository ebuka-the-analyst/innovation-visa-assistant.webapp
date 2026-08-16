const { Pool } = require("pg");

const REQUIRED_COLUMNS = {
  business_plans: [
    "chart_data",
    "theme_id",
    "theme_primary_color",
    "theme_secondary_color",
    "theme_font",
    "theme_applied_at",
    "background_image",
    "use_full_cover_image",
    "text_elements",
  ],
  cover_designs: [
    "id",
    "user_id",
    "theme_id",
    "primary_color",
    "secondary_color",
    "font",
    "background_image",
    "use_full_cover_image",
    "text_elements",
    "logo_element",
    "palette_id",
    "palette_colors",
    "is_default",
    "name",
    "created_at",
    "updated_at",
  ],
  premium_cover_purchases: [
    "id",
    "user_id",
    "template_id",
    "price",
    "stripe_payment_intent_id",
    "stripe_session_id",
    "status",
    "purchased_at",
  ],
  blog_posts: ["id"],
};

const REQUIRED_INDEXES = [
  "idx_cover_user",
  "idx_cover_default",
  "idx_premium_cover_user",
  "idx_premium_cover_template",
  "idx_premium_cover_stripe",
];

async function getColumns(client, tableName) {
  const result = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return new Set(result.rows.map((row) => row.column_name));
}

async function orphanUserCount(client, tableName) {
  const result = await client.query(
    `SELECT COUNT(*)::integer AS count
       FROM ${tableName} child
       LEFT JOIN users u ON u.id = child.user_id
      WHERE child.user_id IS NOT NULL AND u.id IS NULL`,
  );
  return Number(result.rows[0]?.count || 0);
}

async function verify() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Phase-0 startup bootstrap verification");
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
      if (columns.size === 0) {
        failures.push(`Missing required table: ${tableName}`);
        continue;
      }
      for (const columnName of requiredColumns) {
        if (!columns.has(columnName)) {
          failures.push(`Missing required column: ${tableName}.${columnName}`);
        }
      }
    }

    for (const tableName of ["cover_designs", "premium_cover_purchases"]) {
      const columns = await getColumns(client, tableName);
      if (columns.has("user_id")) {
        const orphanCount = await orphanUserCount(client, tableName);
        if (orphanCount > 0) {
          failures.push(`${tableName} still contains ${orphanCount} orphan user reference(s)`);
        }
      }
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

    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  if (failures.length > 0) {
    console.error("[PHASE-0 STARTUP BOOTSTRAP VERIFY] Verification failed", failures);
    process.exitCode = 1;
    return;
  }

  console.log("[PHASE-0 STARTUP BOOTSTRAP VERIFY] Verified successfully");
}

verify().catch((error) => {
  console.error("[PHASE-0 STARTUP BOOTSTRAP VERIFY] Failed:", error);
  process.exitCode = 1;
});
