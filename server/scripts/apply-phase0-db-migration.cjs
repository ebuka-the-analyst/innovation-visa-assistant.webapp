const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const CONFIRMATION = "APPLY_20260816_PHASE0_SCHEMA";
const MIGRATION_PATHS = [
  "migrations/controlled/20260816_phase0_runtime_schema.sql",
  "migrations/controlled/20260816_phase0_startup_bootstrap.sql",
].map((relativePath) => path.resolve(process.cwd(), relativePath));

async function applyMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the Phase-0 database migration");
  }

  if (process.env.PHASE0_MIGRATION_CONFIRM !== CONFIRMATION) {
    throw new Error(
      `Explicit confirmation required. Set PHASE0_MIGRATION_CONFIRM=${CONFIRMATION} only after the read-only preflights have passed.`,
    );
  }

  const migrations = MIGRATION_PATHS.map((migrationPath) => {
    const sqlText = fs.readFileSync(migrationPath, "utf8");
    return {
      migrationPath,
      sqlText,
      sha256: crypto.createHash("sha256").update(sqlText).digest("hex"),
    };
  });

  console.log(
    "[PHASE-0 MIGRATION] Starting explicit schema migration set",
    migrations.map(({ migrationPath, sha256 }) => ({
      file: path.relative(process.cwd(), migrationPath),
      sha256,
    })),
  );

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '5min'");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      ["innovation-visa-assistant:phase0-schema:20260816"],
    );

    for (const migration of migrations) {
      console.log("[PHASE-0 MIGRATION] Applying", {
        file: path.relative(process.cwd(), migration.migrationPath),
        sha256: migration.sha256,
      });
      await client.query(migration.sqlText);
    }

    await client.query("COMMIT");

    console.log(
      "[PHASE-0 MIGRATION] Completed successfully",
      migrations.map(({ migrationPath, sha256 }) => ({
        file: path.relative(process.cwd(), migrationPath),
        sha256,
      })),
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[PHASE-0 MIGRATION] Rolled back; no partial migration was committed", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(() => {
  process.exitCode = 1;
});
