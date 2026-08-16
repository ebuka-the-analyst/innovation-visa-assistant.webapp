const { Pool } = require("pg");

const REQUIRED_BASELINE_TABLES = ["admin_audit_logs"];

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT to_regclass($1) IS NOT NULL AS exists`,
    [`public.${tableName}`],
  );
  return result.rows[0]?.exists === true;
}

async function getColumns(client, tableName) {
  const result = await client.query(
    `SELECT column_name, data_type, udt_name, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [tableName],
  );
  return Object.fromEntries(result.rows.map((row) => [row.column_name, row]));
}

async function rowCount(client, tableName) {
  const result = await client.query(`SELECT COUNT(*)::integer AS count FROM ${tableName}`);
  return Number(result.rows[0]?.count || 0);
}

async function referringForeignKeyCount(client, tableName) {
  const result = await client.query(
    `SELECT COUNT(*)::integer AS count
       FROM pg_constraint
      WHERE contype = 'f'
        AND confrelid = to_regclass($1)`,
    [`public.${tableName}`],
  );
  return Number(result.rows[0]?.count || 0);
}

async function orphanUserSummary(client, tableName) {
  const columns = await getColumns(client, tableName);
  if (!columns.user_id) {
    return { count: 0, distinctUserCount: 0, userIdNullable: null };
  }

  const result = await client.query(
    `SELECT COUNT(*)::integer AS count,
            COUNT(DISTINCT child.user_id)::integer AS distinct_user_count
       FROM ${tableName} child
       LEFT JOIN users u ON u.id = child.user_id
      WHERE child.user_id IS NOT NULL AND u.id IS NULL`,
  );

  return {
    count: Number(result.rows[0]?.count || 0),
    distinctUserCount: Number(result.rows[0]?.distinct_user_count || 0),
    userIdNullable: columns.user_id.is_nullable === "YES",
  };
}

async function runPreflight() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the Phase-0 database preflight");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const report = {
    checkedAt: new Date().toISOString(),
    blockers: [],
    warnings: [],
    tables: {},
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");

    const uuidFunction = await client.query(
      `SELECT to_regprocedure('gen_random_uuid()') IS NOT NULL AS available`,
    );
    if (!uuidFunction.rows[0]?.available) {
      report.blockers.push("gen_random_uuid() is unavailable; UUID-backed schema changes cannot be applied safely.");
    }

    for (const tableName of REQUIRED_BASELINE_TABLES) {
      if (!(await tableExists(client, tableName))) {
        report.blockers.push(`${tableName} is missing even though it is represented in the existing formal baseline migration.`);
      }
    }

    if (await tableExists(client, "blog_generation_queue")) {
      const columns = await getColumns(client, "blog_generation_queue");
      const count = await rowCount(client, "blog_generation_queue");
      const idColumn = columns.id;
      const incomingForeignKeys = await referringForeignKeyCount(client, "blog_generation_queue");
      report.tables.blog_generation_queue = {
        exists: true,
        rowCount: count,
        idDataType: idColumn?.data_type || null,
        incomingForeignKeys,
        columns: Object.keys(columns),
      };

      if (idColumn && !["character varying", "text", "uuid"].includes(idColumn.data_type) && incomingForeignKeys > 0) {
        report.blockers.push(
          "blog_generation_queue has a legacy non-string id with foreign keys referring to it; automatic type reconciliation is unsafe.",
        );
      }

      if (!columns.target_date) {
        report.warnings.push(
          "blog_generation_queue uses the legacy runtime shape and requires additive column/backfill reconciliation.",
        );
      }
    } else {
      report.tables.blog_generation_queue = { exists: false };
    }

    if (await tableExists(client, "seo_automation_plans")) {
      const columns = await getColumns(client, "seo_automation_plans");
      const count = await rowCount(client, "seo_automation_plans");
      report.tables.seo_automation_plans = {
        exists: true,
        rowCount: count,
        hasStrategyData: Boolean(columns.strategy_data),
        columns: Object.keys(columns),
      };

      if (!columns.strategy_data && count > 0) {
        report.blockers.push(
          "seo_automation_plans contains legacy rows but has no strategy_data column. A deliberate data mapping is required; Phase-0 will not drop the table.",
        );
      }

      if (columns.strategy_data) {
        const nullStrategies = await client.query(
          `SELECT COUNT(*)::integer AS count
             FROM seo_automation_plans
            WHERE strategy_data IS NULL`,
        );
        if (Number(nullStrategies.rows[0]?.count || 0) > 0) {
          report.blockers.push(
            "seo_automation_plans contains rows with NULL strategy_data. Resolve those rows before enforcing the current schema.",
          );
        }
      }
    } else {
      report.tables.seo_automation_plans = { exists: false };
    }

    if (await tableExists(client, "api_latency_log")) {
      const count = await rowCount(client, "api_latency_log");
      const orphanSummary = await orphanUserSummary(client, "api_latency_log");
      report.tables.api_latency_log = {
        exists: true,
        rowCount: count,
        orphanUserCount: orphanSummary.count,
        distinctOrphanUserCount: orphanSummary.distinctUserCount,
        userIdNullable: orphanSummary.userIdNullable,
      };

      if (orphanSummary.count > 0) {
        if (orphanSummary.userIdNullable) {
          report.warnings.push(
            `api_latency_log contains ${orphanSummary.count} telemetry row(s) across ${orphanSummary.distinctUserCount} deleted/unknown user id(s). The controlled migration will preserve those rows, clear only the invalid user_id association to NULL, and enforce ON DELETE SET NULL for future user deletion.`,
          );
        } else {
          report.blockers.push(
            "api_latency_log contains orphan user references but user_id is not nullable; safe telemetry preservation requires a deliberate schema/data decision.",
          );
        }
      }
    } else {
      report.tables.api_latency_log = { exists: false };
    }

    if (await tableExists(client, "coins_usage_log")) {
      const count = await rowCount(client, "coins_usage_log");
      const orphanSummary = await orphanUserSummary(client, "coins_usage_log");
      report.tables.coins_usage_log = {
        exists: true,
        rowCount: count,
        orphanUserCount: orphanSummary.count,
        distinctOrphanUserCount: orphanSummary.distinctUserCount,
        userIdNullable: orphanSummary.userIdNullable,
      };
      if (orphanSummary.count > 0) {
        report.blockers.push(
          `coins_usage_log contains ${orphanSummary.count} row(s) whose user_id does not resolve to users.id. This credit/coins ledger is not nullable and will not be auto-normalised.`,
        );
      }
    } else {
      report.tables.coins_usage_log = { exists: false };
    }

    for (const tableName of ["backlink_targets", "user_notification_dismissals"]) {
      report.tables[tableName] = { exists: await tableExists(client, tableName) };
    }

    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(JSON.stringify(report, null, 2));
  if (report.blockers.length > 0) {
    process.exitCode = 1;
  }
}

runPreflight().catch((error) => {
  console.error("[PHASE-0 PREFLIGHT] Failed:", error);
  process.exitCode = 1;
});
