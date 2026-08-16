const { Pool } = require("pg");

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT to_regclass($1) IS NOT NULL AS exists`,
    [`public.${tableName}`],
  );
  return result.rows[0]?.exists === true;
}

async function getColumns(client, tableName) {
  const result = await client.query(
    `SELECT column_name, data_type, is_nullable
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

async function orphanUserCount(client, tableName) {
  const columns = await getColumns(client, tableName);
  if (!columns.user_id) return 0;
  const result = await client.query(
    `SELECT COUNT(*)::integer AS count
       FROM ${tableName} child
       LEFT JOIN users u ON u.id = child.user_id
      WHERE child.user_id IS NOT NULL AND u.id IS NULL`,
  );
  return Number(result.rows[0]?.count || 0);
}

async function runPreflight() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the Phase-0 startup bootstrap preflight");
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

    for (const tableName of ["users", "business_plans", "blog_posts"]) {
      const exists = await tableExists(client, tableName);
      report.tables[tableName] = { exists };
      if (!exists) {
        report.blockers.push(
          `${tableName} is missing from the existing production baseline; the legacy startup bootstrap must not be retired until this is investigated.`,
        );
      }
    }

    if (await tableExists(client, "business_plans")) {
      const columns = await getColumns(client, "business_plans");
      const managedColumns = [
        "chart_data",
        "theme_id",
        "theme_primary_color",
        "theme_secondary_color",
        "theme_font",
        "theme_applied_at",
        "background_image",
        "use_full_cover_image",
        "text_elements",
      ];
      const missingColumns = managedColumns.filter((column) => !columns[column]);
      report.tables.business_plans = {
        exists: true,
        rowCount: await rowCount(client, "business_plans"),
        missingLegacyBootstrapColumns: missingColumns,
      };
      if (missingColumns.length > 0) {
        report.warnings.push(
          `business_plans is missing ${missingColumns.join(", ")}; the controlled migration will add these columns additively.`,
        );
      }
    }

    for (const tableName of ["cover_designs", "premium_cover_purchases"]) {
      const exists = await tableExists(client, tableName);
      if (!exists) {
        report.tables[tableName] = { exists: false };
        report.warnings.push(`${tableName} is absent; the controlled migration will create it explicitly.`);
        continue;
      }

      const columns = await getColumns(client, tableName);
      const orphanUsers = await orphanUserCount(client, tableName);
      report.tables[tableName] = {
        exists: true,
        rowCount: await rowCount(client, tableName),
        orphanUserCount: orphanUsers,
        columns: Object.keys(columns),
      };

      if (orphanUsers > 0) {
        report.blockers.push(
          `${tableName} contains ${orphanUsers} row(s) whose user_id no longer resolves to users.id; the controlled migration will not guess ownership.`,
        );
      }
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
  if (report.blockers.length > 0) process.exitCode = 1;
}

runPreflight().catch((error) => {
  console.error("[PHASE-0 STARTUP BOOTSTRAP PREFLIGHT] Failed:", error);
  process.exitCode = 1;
});
