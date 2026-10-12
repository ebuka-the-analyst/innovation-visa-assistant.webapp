/**
 * Phase 3 acceptance HARNESS ONLY. No HTTP route or live entitlement mutation.
 * Requires a signature-verified Stripe TEST MODE event, an order ID selected
 * by trusted server code, and a disposable PostgreSQL database.
 *
 * Never derive trustedOrderId from webhook metadata, the browser, or a request.
 * Production must separately reconcile live Stripe API records and entitlements.
 */
import Stripe from "stripe";
import type { Pool, PoolClient } from "pg";
import {
  decideVerifiedTestMembershipEvent,
  type CandidateSku, type LedgerState, type MemberDecision,
  type PendingCheckout,
} from "./memberStripeAcceptance";

const offlineStripe = new Stripe("sk_test_offline_verification_only", { apiVersion: "2025-08-27.basil" });

export type RecordedTestDecision = MemberDecision & {
  duplicate: boolean;
  eventId: string;
};

/** Called only after signature and trusted-order checks, within the same TX. */
export type VerifiedTestEffect = (
  client: PoolClient, trustedOrder: PendingCheckout,
  decision: MemberDecision, eventCreated: number,
) => Promise<void>;

type TestOrderRow = {
  id: string;
  user_id: string;
  sku: CandidateSku;
  stripe_customer_id: string;
  stripe_checkout_session_id: string;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_price_id: string;
  expected_pence: number;
  currency: "gbp";
  last_applied_event_created: string | null;
  currently_active: boolean;
  paid_through: Date | null;
};

function toPending(order: TestOrderRow): PendingCheckout {
  return {
    userId: order.user_id,
    sku: order.sku,
    customerId: order.stripe_customer_id,
    checkoutSessionId: order.stripe_checkout_session_id,
    subscriptionId: order.stripe_subscription_id ?? undefined,
    paymentIntentId: order.stripe_payment_intent_id ?? undefined,
    priceId: order.stripe_price_id,
    expectedPence: order.expected_pence,
    currency: order.currency,
  };
}

/**
 * Commit the event audit and simulated state change in ONE transaction.
 * The order lock serialises rival deliveries across worker processes. The
 * event primary key prevents double-application even after restarts.
 * This is intentionally NOT mapped to production member entitlements.
 */
export async function processSignedTestStripeEvent(
  pool: Pool,
  trustedOrderId: string,
  rawBody: Buffer | string,
  stripeSignature: string,
  testWebhookSecret: string,
  onApplied?: VerifiedTestEffect,
): Promise<RecordedTestDecision> {
  if (!/^whsec_/.test(testWebhookSecret)) {
    throw new Error("A dedicated TEST-MODE webhook signing secret is required");
  }
  // Signature verification MUST precede all database reads or writes.
  const event = offlineStripe.webhooks.constructEvent(rawBody, stripeSignature, testWebhookSecret);
  if (event.livemode !== false) {
    throw new Error("Live Stripe events forbidden in test-only acceptance harness");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<TestOrderRow>(
      "SELECT * FROM member_stripe_test_orders WHERE id = $1 FOR UPDATE",
      [trustedOrderId],
    );
    if (found.rowCount !== 1) {
      await client.query("ROLLBACK");
      return { action: "review", reason: "Missing trusted test order", duplicate: false, eventId: event.id };
    }
    const order = found.rows[0];
    const prior = await client.query<{ order_id: string; decision: MemberDecision["action"] }>(
      "SELECT order_id,decision FROM member_stripe_test_events WHERE stripe_event_id = $1",
      [event.id],
    );
    if (prior.rowCount) {
      await client.query("COMMIT");
      const sameOrder=prior.rows[0].order_id===trustedOrderId;
      return {
        action: sameOrder && prior.rows[0].decision !== "review" ? "ignore" : "review",
        reason: !sameOrder ? "Event ID belongs to a different order"
          : prior.rows[0].decision === "review" ? "Requires manual provider reconciliation"
          : "Already processed (durable event ID)",
        duplicate: true,
        eventId: event.id,
      };
    }
    const paidThroughEpoch = order.paid_through == null
      ? undefined : Math.floor(new Date(order.paid_through).getTime() / 1000);
    const priorCreated = order.last_applied_event_created == null
      ? undefined : Number(order.last_applied_event_created);
    const ledger: LedgerState = {
      seenEventIds: new Set(),
      lastAppliedEventCreated: priorCreated,
      currentlyActive: order.currently_active,
      paidThroughEpoch,
    };
    const decision = decideVerifiedTestMembershipEvent(event, toPending(order), ledger);
    await client.query(
      `INSERT INTO member_stripe_test_events
         (stripe_event_id, order_id, event_type, event_created, decision, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.id, trustedOrderId, event.type, event.created, decision.action, decision.reason],
    );
    if (decision.action === "activate") {
      if (!decision.paidThroughEpoch || !decision.periodStartEpoch) {
        throw new Error("Activation missing signed, verified service period");
      }
      await client.query(
        `UPDATE member_stripe_test_orders
         SET currently_active = TRUE, paid_through = to_timestamp($1),
             last_applied_event_created = $2, updated_at = NOW()
         WHERE id = $3`,
        [decision.paidThroughEpoch, event.created, trustedOrderId],
      );
    } else if (decision.action === "suspend" || decision.action === "expire") {
      await client.query(
        `UPDATE member_stripe_test_orders
         SET currently_active = FALSE, last_applied_event_created = $1,
             updated_at = NOW() WHERE id = $2`,
        [event.created, trustedOrderId],
      );
    }
    // A second effect can write to QA member entitlement/users tables, but
    // only inside the SAME transaction. An exception rolls back event ID,
    // simulated state AND any account changes; Stripe can safely retry.
    if (onApplied && (decision.action === "activate" ||
        decision.action === "suspend" || decision.action === "expire")) {
      await onApplied(client, toPending(order), decision, event.created);
    }
    // "review"/"ignore" remain recorded, but NEVER change paid membership.
    await client.query("COMMIT");
    return { ...decision, duplicate: false, eventId: event.id };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Billing access is always bounded by the paid-through time, not a stale flag. */
export async function getEffectiveTestPaidState(
  pool: Pool, trustedOrderId: string, now = new Date(),
): Promise<{ active: boolean; paidThrough: Date | null }> {
  const result = await pool.query<{ active: boolean; paid_through: Date | null }>(
    `SELECT currently_active AND paid_through > $2 AS active,
            paid_through FROM member_stripe_test_orders WHERE id = $1`,
    [trustedOrderId, now],
  );
  if (!result.rowCount) return { active: false, paidThrough: null };
  return { active: result.rows[0].active === true, paidThrough: result.rows[0].paid_through };
}
