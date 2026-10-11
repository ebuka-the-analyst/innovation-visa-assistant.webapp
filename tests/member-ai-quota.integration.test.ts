import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test, { after, before } from "node:test";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { reserveMemberAiQuota, transitionMemberAiReservation, MembershipQuotaError } from "../server/services/memberAiQuota";

const url = process.env.QUOTA_TEST_DATABASE_URL;
if (!url) throw new Error("QUOTA_TEST_DATABASE_URL is required for isolated PostgreSQL integration tests");
const pool = new Pool({ connectionString: url, max: 8 });
const db = drizzle({ client: pool });
const userId = randomUUID();
const entitlementId = randomUUID();
const start = new Date("2026-10-01T00:00:00.000Z");
const day = 86_400_000;
const now = new Date(start.getTime() + day);

before(async () => {
  // Runs on GitHub's disposable PostgreSQL container, never on production.
  await pool.query('CREATE TABLE users (id VARCHAR PRIMARY KEY)');
  const migration = readFileSync(new URL("../migrations/app/20261011_member_ai_entitlements.sql", import.meta.url), "utf8");
  await pool.query(migration);
  // Both production migrations must execute together on the disposable DB.
  const inferenceMigration = readFileSync(
    new URL("../migrations/app/20261011_ai_inference_usage.sql", import.meta.url), "utf8",
  );
  await pool.query(inferenceMigration);
  await pool.query('INSERT INTO users (id) VALUES ($1)', [userId]);
  await pool.query(
    `INSERT INTO member_ai_entitlements
     (id, user_id, package_id, billing_kind, status, provider_reference,
      starts_at, ends_at, period_starts_at, period_ends_at)
     VALUES ($1,$2,'founder_pass_90d','pass','active',$3,$4,$5,$4,$6)`,
    [entitlementId, userId, randomUUID(), start, new Date(start.getTime() + 90 * day), new Date(start.getTime() + 30 * day)],
  );
});
after(async () => { await pool.end(); });

const reserve = (source: string, at: Date = now, operation: "generation" | "revision" = "generation") =>
  db.transaction(tx => reserveMemberAiQuota(tx, userId, "founder_pass_90d", operation, source, at));

test("three concurrent plan submissions can reserve only two generation slots", async () => {
  const plans = [randomUUID(), randomUUID(), randomUUID()];
  const outcomes = await Promise.allSettled(plans.map(source => reserve(source)));
  assert.equal(outcomes.filter(v => v.status === "fulfilled").length, 2);
  assert.equal(outcomes.filter(v => v.status === "rejected").length, 1);
  const failed = outcomes.find(v => v.status === "rejected") as PromiseRejectedResult;
  assert.ok(failed.reason instanceof MembershipQuotaError);
  assert.equal(failed.reason.code, "PERIOD_QUOTA_EXHAUSTED");
  const used = await pool.query(
    `SELECT COUNT(*)::integer AS used FROM member_ai_quota_reservations WHERE entitlement_id = $1 AND operation = 'generation' AND status <> 'released'`,
    [entitlementId],
  );
  assert.equal(used.rows[0].used, 2);
  assert.deepEqual(await reserve(plans[outcomes.findIndex(v => v.status === "fulfilled")]), { duplicate: true });
});

test("released queued requests return a slot, and the same source can retry", async () => {
  const prior = (await pool.query(`SELECT source_id FROM member_ai_quota_reservations WHERE entitlement_id=$1 LIMIT 1`, [entitlementId])).rows[0].source_id;
  await db.transaction(tx => transitionMemberAiReservation(tx, "generation", prior, "released"));
  assert.deepEqual(await reserve(prior), { duplicate: false });
});

test("90-day pass has two slots in each 30-day window, and six lifetime", async () => {
  for (const period of [1, 2]) {
    const at = new Date(start.getTime() + (period * 30 + 1) * day);
    const a = randomUUID(), b = randomUUID();
    assert.deepEqual(await reserve(a, at), { duplicate: false });
    assert.deepEqual(await reserve(b, at), { duplicate: false });
    await assert.rejects(() => reserve(randomUUID(), at), (error: any) => error?.code === "PERIOD_QUOTA_EXHAUSTED");
  }
  const used = await pool.query(
    `SELECT COUNT(*)::integer AS used FROM member_ai_quota_reservations WHERE entitlement_id=$1 AND operation='generation' AND status <> 'released'`,
    [entitlementId],
  );
  assert.equal(used.rows[0].used, 6);
  await assert.rejects(() => reserve(randomUUID(), new Date(start.getTime() + 90 * day)), (error: any) => error?.code === "ENTITLEMENT_INACTIVE");
});

test("revisions have independent monthly slots and do not affect generation usage", async () => {
  const revisions = Array.from({ length: 15 }, () => randomUUID());
  for (const revision of revisions) assert.deepEqual(await reserve(revision, now, "revision"), { duplicate: false });
  await assert.rejects(() => reserve(randomUUID(), now, "revision"), (error: any) => error?.code === "PERIOD_QUOTA_EXHAUSTED");
});

test("AI inference migration stores usage and prevents duplicate provider responses", async () => {
  const responseId = "resp_test_" + randomUUID().replaceAll("-", "");
  const write = async () => pool.query(
    `INSERT INTO ai_inference_usage (
      provider, provider_response_id, model, operation, workload, job_id,
      input_tokens, cached_input_tokens, output_tokens, reasoning_tokens,
      latency_ms, cost_usd_estimated, cost_pricing_version
    ) VALUES ('openai',$1,'gpt-6-astra','responses','business_plan_generation',
      $2,200000,10000,50000,3000,4000,4.49000000,'openai-gpt-6-astra-standard-2026-10-11')
    ON CONFLICT (provider, provider_response_id)
      WHERE provider_response_id IS NOT NULL DO NOTHING`,
    [responseId, randomUUID()],
  );
  await write();
  await write();
  const result = await pool.query(
    "SELECT COUNT(*)::integer AS total, SUM(cost_usd_estimated)::numeric AS estimated_cost FROM ai_inference_usage WHERE provider_response_id = $1",
    [responseId],
  );
  assert.equal(result.rows[0].total, 1);
  assert.equal(Number(result.rows[0].estimated_cost), 4.49);
  await assert.rejects(
    () => pool.query("INSERT INTO ai_inference_usage (provider,operation,workload,latency_ms,input_tokens) VALUES ('openai','responses','business_plan_generation',100,-1)"),
    (error: any) => error?.code === "23514",
  );
});
