/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * LIVE payment event transaction ledger. Receives only Stripe live-signed
 * events and server-resolved order IDs after fresh provider reconciliation.
 * Never select a trusted order from unverified browser or event metadata.
 */
import Stripe from "stripe";
import type { Pool, PoolClient } from "pg";
import { MembershipFulfilmentReviewRequired } from "./memberLiveEntitlementFulfilment";
import type { VerifiedPaidInvoicePayment } from "./stripeLivePaidInvoiceMapping";
import {
  decideVerifiedLiveMembershipEvent,
  type CandidateSku, type LedgerState, type MemberDecision,
  type PendingCheckout,
} from "./memberStripeLiveAcceptance";

const offlineStripe = new Stripe("sk_live_offline_verification_only", { apiVersion: "2025-08-27.basil" });

export type RecordedLiveDecision = MemberDecision & {
  duplicate: boolean;
  eventId: string;
};

/** Called only after signature and trusted-order checks, within the same TX. */
export type VerifiedLiveEffect = (
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
 * Commit the event audit and effective paid membership change in ONE transaction.
 * The order lock serialises rival deliveries across worker processes. The
 * event primary key prevents double-application even after restarts.
 * This is intentionally NOT mapped to production member entitlements.
 */
export async function processSignedLiveStripeEvent(
  pool: Pool,
  trustedOrderId: string,
  rawBody: Buffer | string,
  stripeSignature: string,
  testWebhookSecret: string,
  onApplied?: VerifiedLiveEffect,
  providerPaidInvoice?: VerifiedPaidInvoicePayment,
): Promise<RecordedLiveDecision> {
  if (!/^whsec_/.test(testWebhookSecret)) {
    throw new Error("A dedicated TEST-MODE webhook signing secret is required");
  }
  // Signature verification MUST precede all database reads or writes.
  const event = offlineStripe.webhooks.constructEvent(rawBody, stripeSignature, testWebhookSecret);
  if (event.livemode !== true) {
    throw new Error("Sandbox Stripe events forbidden in live payment ledger");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<TestOrderRow>(
      "SELECT * FROM member_stripe_live_orders WHERE id = $1 FOR UPDATE",
      [trustedOrderId],
    );
    if (found.rowCount !== 1) {
      await client.query("ROLLBACK");
      return { action: "review", reason: "Missing trusted test order", duplicate: false, eventId: event.id };
    }
    const order = found.rows[0];
    const prior = await client.query<{ order_id: string; decision: MemberDecision["action"] }>(
      "SELECT order_id,decision FROM member_stripe_live_events WHERE stripe_event_id = $1",
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
    let decision = decideVerifiedLiveMembershipEvent(event, toPending(order), ledger);
    // Unresolved chargebacks/refunds or conflicting plans freeze new
    // activations. A later paid invoice must not silently bypass a dispute.
    if (decision.action === "activate") {
      const blocked = await client.query(
        "SELECT stripe_event_id FROM member_stripe_live_reviews WHERE order_id=$1 AND status='pending' LIMIT 1",
        [trustedOrderId],
      );
      if (blocked.rowCount) {
        decision = {
          action: "review",
          reason: "Unresolved billing dispute/review; do not re-activate automatically",
        };
      }
    }
    await client.query(
      `INSERT INTO member_stripe_live_events
         (stripe_event_id, order_id, event_type, event_created, decision, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [event.id, trustedOrderId, event.type, event.created, decision.action, decision.reason],
    );
    await client.query("SAVEPOINT member_effect");
    try {
      if (decision.action === "activate") {
        if (!decision.paidThroughEpoch || !decision.periodStartEpoch) {
          throw new MembershipFulfilmentReviewRequired("Activation missing validated service period");
        }
        await client.query(
          `UPDATE member_stripe_live_orders
           SET currently_active = TRUE, paid_through = to_timestamp($1),
               last_applied_event_created = $2, updated_at = NOW()
           WHERE id = $3`,
          [decision.paidThroughEpoch, event.created, trustedOrderId],
        );
      } else if (decision.action === "suspend" || decision.action === "expire") {
        await client.query(
          `UPDATE member_stripe_live_orders
           SET currently_active = FALSE, last_applied_event_created = $1,
               updated_at = NOW() WHERE id = $2`,
          [event.created, trustedOrderId],
        );
      }
      if (onApplied && ["activate","suspend","expire"].includes(decision.action)) {
        await onApplied(client, toPending(order), decision, event.created);
      }
      if (decision.action === "activate" && event.type === "invoice.paid" && providerPaidInvoice) {
        // Verified by Stripe's expanded InvoicePayment and a separate
        // succeeded PaymentIntent API lookup before entering this transaction.
        if(providerPaidInvoice.invoiceId !== (event.data.object as any)?.id ||
           providerPaidInvoice.amountPence !== order.expected_pence ||
           providerPaidInvoice.currency !== order.currency ||
           providerPaidInvoice.periodStartEpoch !== decision.periodStartEpoch ||
           providerPaidInvoice.periodEndEpoch !== decision.paidThroughEpoch) {
          throw new MembershipFulfilmentReviewRequired("Verified invoice payment differs from signed paid period");
        }
        const mapped=await client.query(`
          INSERT INTO member_stripe_live_invoice_payments (
            stripe_invoice_id,stripe_invoice_payment_id,stripe_payment_intent_id,
            order_id,amount_paid,currency,period_start,period_end
          ) VALUES ($1,$2,$3,$4,$5,'gbp',to_timestamp($6),to_timestamp($7))
          ON CONFLICT(stripe_invoice_id) DO NOTHING
          RETURNING stripe_invoice_id`,
          [providerPaidInvoice.invoiceId,providerPaidInvoice.invoicePaymentId,
            providerPaidInvoice.paymentIntentId,trustedOrderId,
            providerPaidInvoice.amountPence,providerPaidInvoice.periodStartEpoch,
            providerPaidInvoice.periodEndEpoch],
        );
        if(mapped.rowCount!==1)
          throw new MembershipFulfilmentReviewRequired("Invoice payment was already allocated; reconcile provider reference");
      }
      await client.query("RELEASE SAVEPOINT member_effect");
    } catch (error) {
      // A business-rule conflict is not a transient Stripe error. Undo
      // simulated access and user/entitlement changes, but commit the
      // review audit and queue instead of sending infinite 5xx retries.
      await client.query("ROLLBACK TO SAVEPOINT member_effect");
      await client.query("RELEASE SAVEPOINT member_effect");
      const reviewError = error instanceof MembershipFulfilmentReviewRequired ? error
        : (event.type === "invoice.paid" && providerPaidInvoice &&
           (error as any)?.code === "23505")
          ? new MembershipFulfilmentReviewRequired("Invoice/PaymentIntent already allocated to a different paid period")
          : null;
      if (!reviewError) throw error;
      decision = {action:"review",reason:reviewError.message};
      await client.query(
        "UPDATE member_stripe_live_events SET decision='review',reason=$2 WHERE stripe_event_id=$1",
        [event.id,reviewError.message],
      );
    }
    if (decision.action === "review") {
      await client.query(
        `INSERT INTO member_stripe_live_reviews
          (stripe_event_id,order_id,event_type,reason)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(stripe_event_id) DO NOTHING`,
        [event.id,trustedOrderId,event.type,decision.reason],
      );
    }
    // "review"/"ignore" never change paid access. Both are durably
    // acknowledged after this commit; admins must resolve pending reviews.
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
export async function getEffectiveLivePaidState(
  pool: Pool, trustedOrderId: string, now = new Date(),
): Promise<{ active: boolean; paidThrough: Date | null }> {
  const result = await pool.query<{ active: boolean; paid_through: Date | null }>(
    `SELECT currently_active AND paid_through > $2 AS active,
            paid_through FROM member_stripe_live_orders WHERE id = $1`,
    [trustedOrderId, now],
  );
  if (!result.rowCount) return { active: false, paidThrough: null };
  return { active: result.rows[0].active === true, paidThrough: result.rows[0].paid_through };
}
