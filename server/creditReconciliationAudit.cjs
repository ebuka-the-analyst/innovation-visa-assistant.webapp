const express = require("express");
const { Pool } = require("pg");

const AUDIT_API_PATH = "/api/admin/credit-reconciliation-audit";
const AUDIT_PAGE_PATH = "/admin/credit-audit";
const application = express.application;

let auditPool;

function getAuditPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!auditPool) {
    auditPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return auditPool;
}

async function verifyAdmin(req) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return false;
  }

  const userId = req.user.id;
  if (!userId) return false;

  const result = await getAuditPool().query(
    "SELECT is_admin FROM users WHERE id = $1 LIMIT 1",
    [userId],
  );

  return result.rows[0]?.is_admin === true;
}

const TIER_ALLOCATION = {
  basic: 1,
  premium: 3,
  enterprise: 6,
  ultimate: 12,
};

function toNumber(value) {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function classifyCandidate(row) {
  const tier = String(row.subscription_tier || "").toLowerCase();
  const allocation = TIER_ALLOCATION[tier] || 0;
  const planCredits = toNumber(row.plan_credits);
  const bonusCredits = toNumber(row.bonus_credits);
  const creditsUsed = toNumber(row.credits_used);
  const currentTotal = planCredits + bonusCredits;
  const ledgerSum = toNumber(row.ledger_sum);
  const ledgerGap = currentTotal - ledgerSum;
  const positivePlanAfterZero = toNumber(row.positive_plan_after_zero);
  const hasRecordedZero = Boolean(row.latest_zero_at);

  if (
    allocation > 0 &&
    planCredits > 0 &&
    hasRecordedZero &&
    positivePlanAfterZero === 0
  ) {
    return {
      confidence: "high",
      reason:
        "Plan credits exist after a recorded zero balance, but no positive plan-credit transaction was logged afterwards.",
      suspectedUnloggedPlanCredits: planCredits,
      suggestedPlanCredits: 0,
    };
  }

  if (
    allocation > 0 &&
    planCredits > 0 &&
    creditsUsed >= allocation &&
    ledgerGap >= allocation &&
    ledgerGap % allocation === 0
  ) {
    return {
      confidence: "review",
      reason:
        "Current balance exceeds the recorded credit ledger by one or more full tier allocations. Historical/manual adjustments should be checked before correction.",
      suspectedUnloggedPlanCredits: Math.min(planCredits, ledgerGap),
      suggestedPlanCredits: null,
    };
  }

  return null;
}

async function runCreditAudit() {
  const pool = getAuditPool();

  const usersResult = await pool.query(`
    WITH ledger AS (
      SELECT
        user_id,
        COALESCE(SUM(credits_change), 0)::integer AS ledger_sum,
        MAX(created_at) AS latest_transaction_at
      FROM credit_transactions
      GROUP BY user_id
    ),
    last_zero AS (
      SELECT DISTINCT ON (user_id)
        user_id,
        id AS latest_zero_transaction_id,
        type AS latest_zero_type,
        created_at AS latest_zero_at
      FROM credit_transactions
      WHERE balance_after = 0
        AND credits_change < 0
      ORDER BY user_id, created_at DESC
    ),
    post_zero AS (
      SELECT
        lz.user_id,
        COALESCE(SUM(ct.credits_change), 0)::integer AS logged_delta_after_zero,
        COALESCE(SUM(
          CASE
            WHEN ct.credits_change > 0 AND ct.credits_type = 'plan'
              THEN ct.credits_change
            ELSE 0
          END
        ), 0)::integer AS positive_plan_after_zero,
        COALESCE(SUM(
          CASE
            WHEN ct.credits_change > 0 AND ct.credits_type = 'bonus'
              THEN ct.credits_change
            ELSE 0
          END
        ), 0)::integer AS positive_bonus_after_zero,
        COUNT(*) FILTER (
          WHERE ct.credits_change > 0 AND ct.credits_type = 'plan'
        )::integer AS positive_plan_transactions_after_zero
      FROM last_zero lz
      LEFT JOIN credit_transactions ct
        ON ct.user_id = lz.user_id
       AND ct.created_at > lz.latest_zero_at
      GROUP BY lz.user_id
    )
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.subscription_tier,
      u.subscription_status,
      u.plan_credits,
      u.bonus_credits,
      u.credits_used,
      u.last_credit_refresh,
      u.updated_at,
      COALESCE(l.ledger_sum, 0)::integer AS ledger_sum,
      l.latest_transaction_at,
      lz.latest_zero_transaction_id,
      lz.latest_zero_type,
      lz.latest_zero_at,
      COALESCE(pz.logged_delta_after_zero, 0)::integer AS logged_delta_after_zero,
      COALESCE(pz.positive_plan_after_zero, 0)::integer AS positive_plan_after_zero,
      COALESCE(pz.positive_bonus_after_zero, 0)::integer AS positive_bonus_after_zero,
      COALESCE(pz.positive_plan_transactions_after_zero, 0)::integer AS positive_plan_transactions_after_zero
    FROM users u
    LEFT JOIN ledger l ON l.user_id = u.id
    LEFT JOIN last_zero lz ON lz.user_id = u.id
    LEFT JOIN post_zero pz ON pz.user_id = u.id
    WHERE LOWER(COALESCE(u.subscription_tier, 'free')) IN ('basic', 'premium', 'enterprise', 'ultimate')
      AND COALESCE(u.plan_credits, 0) > 0
    ORDER BY u.updated_at DESC NULLS LAST, u.email ASC
  `);

  const candidates = usersResult.rows
    .map((row) => {
      const classification = classifyCandidate(row);
      if (!classification) return null;

      const tier = String(row.subscription_tier || "").toLowerCase();
      const allocation = TIER_ALLOCATION[tier] || 0;
      const planCredits = toNumber(row.plan_credits);
      const bonusCredits = toNumber(row.bonus_credits);
      const currentTotal = planCredits + bonusCredits;
      const ledgerSum = toNumber(row.ledger_sum);

      return {
        userId: row.id,
        email: row.email,
        name: [row.first_name, row.last_name].filter(Boolean).join(" ") || null,
        tier,
        subscriptionStatus: row.subscription_status,
        tierAllocation: allocation,
        planCredits,
        bonusCredits,
        currentTotal,
        creditsUsed: toNumber(row.credits_used),
        ledgerSum,
        ledgerGap: currentTotal - ledgerSum,
        latestZeroAt: row.latest_zero_at,
        latestZeroType: row.latest_zero_type,
        latestZeroTransactionId: row.latest_zero_transaction_id,
        loggedDeltaAfterZero: toNumber(row.logged_delta_after_zero),
        positivePlanCreditsAfterZero: toNumber(row.positive_plan_after_zero),
        positiveBonusCreditsAfterZero: toNumber(row.positive_bonus_after_zero),
        positivePlanTransactionsAfterZero: toNumber(
          row.positive_plan_transactions_after_zero,
        ),
        latestTransactionAt: row.latest_transaction_at,
        lastCreditRefresh: row.last_credit_refresh,
        updatedAt: row.updated_at,
        ...classification,
      };
    })
    .filter(Boolean);

  const ids = candidates.map((candidate) => candidate.userId);
  const transactionsByUser = {};

  if (ids.length > 0) {
    const historyResult = await pool.query(
      `
        SELECT * FROM (
          SELECT
            user_id,
            type,
            credits_change,
            credits_type,
            balance_after,
            reference_id,
            reference_type,
            description,
            created_at,
            ROW_NUMBER() OVER (
              PARTITION BY user_id
              ORDER BY created_at DESC
            ) AS row_number
          FROM credit_transactions
          WHERE user_id = ANY($1::varchar[])
        ) ranked
        WHERE row_number <= 12
        ORDER BY user_id, created_at DESC
      `,
      [ids],
    );

    for (const tx of historyResult.rows) {
      if (!transactionsByUser[tx.user_id]) {
        transactionsByUser[tx.user_id] = [];
      }

      transactionsByUser[tx.user_id].push({
        type: tx.type,
        creditsChange: toNumber(tx.credits_change),
        creditsType: tx.credits_type,
        balanceAfter: toNumber(tx.balance_after),
        referenceId: tx.reference_id,
        referenceType: tx.reference_type,
        description: tx.description,
        createdAt: tx.created_at,
      });
    }
  }

  const enriched = candidates.map((candidate) => ({
    ...candidate,
    recentTransactions: transactionsByUser[candidate.userId] || [],
  }));

  return {
    generatedAt: new Date().toISOString(),
    mode: "read-only",
    mutationPerformed: false,
    detectionRule:
      "High-confidence candidates have plan credits after a recorded zero balance with no logged positive plan-credit grant afterwards. Review candidates use ledger-gap heuristics only and must not be changed without manual confirmation.",
    summary: {
      totalCandidates: enriched.length,
      highConfidence: enriched.filter((item) => item.confidence === "high").length,
      needsReview: enriched.filter((item) => item.confidence === "review").length,
    },
    candidates: enriched,
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : date.toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function renderAuditPage(audit) {
  const rows = audit.candidates
    .map((candidate) => {
      const badgeClass =
        candidate.confidence === "high" ? "badge-high" : "badge-review";
      const suggested =
        candidate.suggestedPlanCredits === null
          ? "Manual review"
          : `${candidate.planCredits} → ${candidate.suggestedPlanCredits} plan credits`;

      const history = candidate.recentTransactions
        .map(
          (tx) => `
            <tr>
              <td>${formatDate(tx.createdAt)}</td>
              <td>${escapeHtml(tx.type)}</td>
              <td>${tx.creditsChange > 0 ? "+" : ""}${escapeHtml(tx.creditsChange)}</td>
              <td>${escapeHtml(tx.creditsType)}</td>
              <td>${escapeHtml(tx.balanceAfter)}</td>
              <td>${escapeHtml(tx.description || "")}</td>
            </tr>`,
        )
        .join("");

      return `
        <tr>
          <td>
            <strong>${escapeHtml(candidate.email || "No email")}</strong>
            <div class="muted">${escapeHtml(candidate.name || candidate.userId)}</div>
          </td>
          <td>${escapeHtml(candidate.tier)}</td>
          <td>${escapeHtml(candidate.planCredits)}</td>
          <td>${escapeHtml(candidate.bonusCredits)}</td>
          <td>${escapeHtml(candidate.creditsUsed)}</td>
          <td>${formatDate(candidate.latestZeroAt)}</td>
          <td>${escapeHtml(candidate.positivePlanCreditsAfterZero)}</td>
          <td>${escapeHtml(candidate.ledgerGap)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(candidate.confidence)}</span></td>
          <td>${escapeHtml(suggested)}</td>
        </tr>
        <tr class="details-row">
          <td colspan="10">
            <details>
              <summary>Why this account was flagged and recent ledger history</summary>
              <p><strong>Reason:</strong> ${escapeHtml(candidate.reason)}</p>
              <p><strong>Tier allocation:</strong> ${escapeHtml(candidate.tierAllocation)} | <strong>Current total:</strong> ${escapeHtml(candidate.currentTotal)} | <strong>Ledger sum:</strong> ${escapeHtml(candidate.ledgerSum)} | <strong>Logged delta after zero:</strong> ${escapeHtml(candidate.loggedDeltaAfterZero)}</p>
              <table class="history">
                <thead><tr><th>Date</th><th>Type</th><th>Change</th><th>Credit type</th><th>Balance after</th><th>Description</th></tr></thead>
                <tbody>${history || '<tr><td colspan="6">No ledger rows found.</td></tr>'}</tbody>
              </table>
            </details>
          </td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Credit Reconciliation Audit</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f8fa; color: #111827; }
    .wrap { max-width: 1500px; margin: 0 auto; padding: 28px; }
    .top { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    p { line-height: 1.55; }
    .muted { color: #6b7280; font-size: 12px; margin-top: 4px; }
    .notice { padding: 14px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 10px; margin-bottom: 18px; }
    .cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
    .card strong { display: block; font-size: 26px; margin-top: 6px; }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid #e5e7eb; border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 12px 10px; border-bottom: 1px solid #eef0f3; text-align: left; vertical-align: top; white-space: nowrap; }
    th { background: #f9fafb; font-size: 12px; color: #4b5563; }
    .details-row td { padding: 0 12px 12px; white-space: normal; background: #fcfcfd; }
    details { padding: 10px 0; }
    summary { cursor: pointer; font-weight: 600; }
    .history { margin-top: 12px; border: 1px solid #e5e7eb; }
    .history td, .history th { white-space: normal; }
    .badge { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
    .badge-high { background: #fee2e2; color: #991b1b; }
    .badge-review { background: #fef3c7; color: #92400e; }
    .actions a { display: inline-block; text-decoration: none; color: #1d4ed8; font-weight: 600; margin-left: 14px; }
    .empty { padding: 36px; text-align: center; color: #4b5563; }
    @media (max-width: 800px) { .cards { grid-template-columns: 1fr; } .top { flex-direction: column; } .wrap { padding: 16px; } }
    @media (prefers-color-scheme: dark) {
      body { background: #0b0f16; color: #f3f4f6; }
      .card, .table-wrap { background: #111827; border-color: #273244; }
      th { background: #172033; color: #cbd5e1; }
      th, td { border-color: #273244; }
      .details-row td { background: #0f172a; }
      .muted { color: #94a3b8; }
      .notice { background: #052e24; border-color: #065f46; color: #a7f3d0; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="top">
      <div>
        <h1>Credit Reconciliation Audit</h1>
        <p>Read-only production audit for balances that may have been restored by the retired startup credit bug.</p>
        <div class="muted">Generated ${escapeHtml(formatDate(audit.generatedAt))}</div>
      </div>
      <div class="actions"><a href="/admin">Back to Admin</a><a href="${AUDIT_API_PATH}">JSON</a></div>
    </div>

    <div class="notice"><strong>No balances are changed on this page.</strong> High-confidence rows are candidates for correction only after review. Legitimate bonus credits are shown separately and should be preserved.</div>

    <section class="cards">
      <div class="card">Total candidates<strong>${audit.summary.totalCandidates}</strong></div>
      <div class="card">High confidence<strong>${audit.summary.highConfidence}</strong></div>
      <div class="card">Needs review<strong>${audit.summary.needsReview}</strong></div>
    </section>

    <div class="table-wrap">
      ${audit.candidates.length === 0 ? '<div class="empty">No suspicious restored-credit balances were detected by the current rules.</div>' : `
      <table>
        <thead>
          <tr><th>User</th><th>Tier</th><th>Plan credits</th><th>Bonus</th><th>Used</th><th>Last zero</th><th>Logged plan + after zero</th><th>Ledger gap</th><th>Confidence</th><th>Suggested action</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`}
    </div>
  </main>
</body>
</html>`;
}

async function handleAuditApi(req, res) {
  try {
    if (!(await verifyAdmin(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const audit = await runCreditAudit();
    res.setHeader("Cache-Control", "no-store");
    return res.json(audit);
  } catch (error) {
    console.error("[CREDIT AUDIT] Failed:", error);
    return res.status(500).json({ error: "Credit reconciliation audit failed" });
  }
}

async function handleAuditPage(req, res) {
  try {
    if (!(await verifyAdmin(req))) {
      return res.status(403).send("Admin access required");
    }

    const audit = await runCreditAudit();
    res.setHeader("Cache-Control", "no-store");
    res.type("html");
    return res.send(renderAuditPage(audit));
  } catch (error) {
    console.error("[CREDIT AUDIT] Page failed:", error);
    return res.status(500).send("Credit reconciliation audit failed");
  }
}

if (!application.__creditReconciliationAuditHookInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__creditReconciliationAuditHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function guardedGet(path, ...handlers) {
    const isRouteRegistration =
      typeof path === "string" && path.startsWith("/") && handlers.length > 0;

    if (isRouteRegistration && !this.__creditReconciliationAuditRoutesInstalled) {
      Object.defineProperty(this, "__creditReconciliationAuditRoutesInstalled", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      originalGet.call(this, AUDIT_API_PATH, handleAuditApi);
      originalGet.call(this, AUDIT_PAGE_PATH, handleAuditPage);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
