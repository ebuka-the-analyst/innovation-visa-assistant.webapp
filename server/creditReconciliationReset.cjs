const { Pool } = require("pg");

const RECONCILIATION_REFERENCE = "startup-refill-fix-2026-08-15";
const TARGETS = [
  { email: "prompttoprofithq1@gmail.com", expectedPlanCredits: 1, expectedBonusCredits: 0 },
  { email: "benedict9211@gmail.com", expectedPlanCredits: 6, expectedBonusCredits: 0 },
  { email: "bandanakauruk@gmail.com", expectedPlanCredits: 3, expectedBonusCredits: 0 },
];

async function reconcileAccount(client, target) {
  const userResult = await client.query(
    `
      SELECT id, email, plan_credits, bonus_credits
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      FOR UPDATE
    `,
    [target.email],
  );

  if (userResult.rowCount !== 1) {
    return { email: target.email, action: "skipped", reason: "user_not_found" };
  }

  const user = userResult.rows[0];
  const planCredits = Number(user.plan_credits || 0);
  const bonusCredits = Number(user.bonus_credits || 0);

  const existingMarker = await client.query(
    `
      SELECT id
      FROM credit_transactions
      WHERE user_id = $1
        AND reference_type = 'credit_reconciliation'
        AND reference_id = $2
      LIMIT 1
    `,
    [user.id, RECONCILIATION_REFERENCE],
  );

  if (existingMarker.rowCount > 0) {
    return { email: target.email, action: "skipped", reason: "already_reconciled" };
  }

  if (
    planCredits !== target.expectedPlanCredits ||
    bonusCredits !== target.expectedBonusCredits
  ) {
    return {
      email: target.email,
      action: "skipped",
      reason: "balance_changed_since_audit",
      currentPlanCredits: planCredits,
      currentBonusCredits: bonusCredits,
    };
  }

  const latestZeroResult = await client.query(
    `
      SELECT created_at
      FROM credit_transactions
      WHERE user_id = $1
        AND balance_after = 0
        AND credits_change < 0
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [user.id],
  );

  if (latestZeroResult.rowCount !== 1) {
    return { email: target.email, action: "skipped", reason: "no_recorded_zero_balance" };
  }

  const latestZeroAt = latestZeroResult.rows[0].created_at;
  const legitimatePlanGrantResult = await client.query(
    `
      SELECT COUNT(*)::integer AS count
      FROM credit_transactions
      WHERE user_id = $1
        AND created_at > $2
        AND credits_change > 0
        AND credits_type = 'plan'
    `,
    [user.id, latestZeroAt],
  );

  const legitimatePlanGrants = Number(legitimatePlanGrantResult.rows[0]?.count || 0);
  if (legitimatePlanGrants > 0) {
    return {
      email: target.email,
      action: "skipped",
      reason: "legitimate_plan_grant_after_zero",
      legitimatePlanGrants,
    };
  }

  await client.query(
    `
      UPDATE users
      SET plan_credits = 0,
          updated_at = NOW()
      WHERE id = $1
    `,
    [user.id],
  );

  await client.query(
    `
      INSERT INTO credit_transactions (
        id,
        user_id,
        type,
        credits_change,
        credits_type,
        balance_after,
        reference_id,
        reference_type,
        description,
        metadata,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        'admin_adjustment',
        $2,
        'plan',
        $3,
        $4,
        'credit_reconciliation',
        $5,
        $6::jsonb,
        NOW()
      )
    `,
    [
      user.id,
      -planCredits,
      bonusCredits,
      RECONCILIATION_REFERENCE,
      `One-time correction: removed ${planCredits} plan credit${planCredits === 1 ? "" : "s"} restored by the retired startup refill bug. Bonus credits preserved.`,
      JSON.stringify({
        source: "credit-reconciliation-audit",
        reason: "retired_startup_credit_refill_bug",
        auditedEmail: target.email,
        removedPlanCredits: planCredits,
        preservedBonusCredits: bonusCredits,
      }),
    ],
  );

  return {
    email: target.email,
    action: "reset",
    removedPlanCredits: planCredits,
    preservedBonusCredits: bonusCredits,
  };
}

async function runReconciliation() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[CREDIT RECONCILIATION] Skipped outside production");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("[CREDIT RECONCILIATION] DATABASE_URL is not configured");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const results = [];
  try {
    for (const target of TARGETS) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await reconcileAccount(client, target);
        await client.query("COMMIT");
        results.push(result);
      } catch (error) {
        await client.query("ROLLBACK");
        results.push({
          email: target.email,
          action: "error",
          reason: error instanceof Error ? error.message : String(error),
        });
      } finally {
        client.release();
      }
    }

    console.log("[CREDIT RECONCILIATION] Completed", results);
  } catch (error) {
    console.error("[CREDIT RECONCILIATION] Failed", error);
  } finally {
    await pool.end().catch(() => {});
  }
}

if (require.main === module) {
  void runReconciliation();
}

module.exports = { runReconciliation };
