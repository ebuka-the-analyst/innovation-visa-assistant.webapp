import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { Pool } from "pg";

const connection = process.env.QUOTA_TEST_DATABASE_URL;
if (!connection) throw new Error("QUOTA_TEST_DATABASE_URL must reference disposable CI PostgreSQL");
const pool = new Pool({ connectionString: connection, max: 1 });
const identifier = "phase2_rollback_" + randomUUID().replaceAll("-", "");

test("phase 2 migrations can be applied, rolled back and replayed in an isolated transaction", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CREATE SCHEMA " + identifier);
    await client.query("SET LOCAL search_path TO " + identifier + ", public");
    await client.query("CREATE TABLE users(id VARCHAR PRIMARY KEY)");
    await client.query("SAVEPOINT before_phase2");

    const sqlFiles = [
      "../migrations/app/20261011_ai_inference_usage.sql",
      "../migrations/app/20261011_member_ai_entitlements.sql",
    ];
    for (const path of sqlFiles) {
      await client.query(readFileSync(new URL(path, import.meta.url), "utf8"));
    }
    const names = [
      "ai_inference_usage",
      "member_ai_entitlements",
      "member_ai_quota_reservations",
    ];
    for (const name of names) {
      const exists = await client.query("SELECT to_regclass($1) AS id", [identifier + "." + name]);
      assert.ok(exists.rows[0].id, "Expected migration table " + name);
    }

    await client.query("ROLLBACK TO SAVEPOINT before_phase2");
    for (const name of names) {
      const exists = await client.query("SELECT to_regclass($1) AS id", [identifier + "." + name]);
      assert.equal(exists.rows[0].id, null, "Rollback must remove table " + name);
    }

    for (const path of sqlFiles) {
      const sql = readFileSync(new URL(path, import.meta.url), "utf8");
      await client.query(sql);
      await client.query(sql); // Replay is idempotent
    }
    for (const name of names) {
      const exists = await client.query("SELECT to_regclass($1) AS id", [identifier + "." + name]);
      assert.ok(exists.rows[0].id, "Expected replayed table " + name);
    }
    await client.query("ROLLBACK");

    const leaked = await client.query("SELECT to_regnamespace($1) AS id", [identifier]);
    assert.equal(leaked.rows[0].id, null, "Staging rehearsal schema must not persist");
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
});

test.after(async () => { await pool.end(); });
