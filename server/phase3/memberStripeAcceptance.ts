/**
 * Phase 3, REVIEW-ONLY: deterministic acceptance contract for membership
 * webhook events. Not mounted in routes, never calls Stripe, and never
 * grants a live customer entitlement. Every event MUST first be verified by
 * stripe.webhooks.constructEvent(rawBody, signature, webhookSecret).
 *
 * Pending orders are created server-side and authoritative: event metadata,
 * client user IDs, product text or price alone are never sufficient.
 */
export type CandidateSku = "founder" | "founder_pro" | "founder_pass_90d";
export type MemberAction = "activate" | "suspend" | "expire" | "ignore" | "review";
export type MemberDecision = {
  action: MemberAction;
  reason: string;
  userId?: string;
  sku?: CandidateSku;
  providerReference?: string;
  paidThroughEpoch?: number;
  periodStartEpoch?: number;
};
export type PendingCheckout = {
  userId: string;
  sku: CandidateSku;
  customerId: string;
  checkoutSessionId: string;
  subscriptionId?: string;
  paymentIntentId?: string;
  priceId: string;
  expectedPence: number;
  currency: "gbp";
};
export type LedgerState = {
  lastAppliedEventCreated?: number;
  currentlyActive?: boolean;
  paidThroughEpoch?: number;
  seenEventIds: Set<string>;
};

export const EXPECTED_GBP_PENCE: Record<CandidateSku, number> = {
  founder: 6900,
  founder_pro: 11900,
  founder_pass_90d: 15900,
};
const THIRTY_DAYS = 30 * 86400;
const NINETY_DAYS = 90 * 86400;
const allowedEvents = new Set([
  "checkout.session.completed", "checkout.session.async_payment_succeeded",
  "invoice.paid", "invoice.payment_failed",
  "customer.subscription.deleted", "charge.refunded", "charge.dispute.created",
]);
const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.length > 3 && value.length < 255;
const number = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const stripeId = (value: any): string | undefined =>
  typeof value === "string" ? value : typeof value?.id === "string" ? value.id : undefined;

/**
 * Stripe 2025-03-31.basil+ moved invoice.subscription to
 * parent.subscription_details.subscription and line price to
 * pricing.price_details.price. If both shapes appear but conflict, fail shut.
 */
function invoiceSubscriptionId(invoice: any): string | null {
  const legacy = stripeId(invoice?.subscription);
  const modern = stripeId(invoice?.parent?.subscription_details?.subscription);
  if (legacy && modern && legacy !== modern) return null;
  return legacy || modern || null;
}
function invoicePriceId(line: any): string | null {
  const legacy = stripeId(line?.price);
  const modern = stripeId(line?.pricing?.price_details?.price);
  if (legacy && modern && legacy !== modern) return null;
  return legacy || modern || null;
}

export function decideVerifiedTestMembershipEvent(
  event: any,
  pending: PendingCheckout | null,
  ledger: LedgerState,
): MemberDecision {
  const ignore = (reason: string): MemberDecision => ({action:"ignore",reason});
  const review = (reason: string): MemberDecision => ({action:"review",reason});
  if (!event || event.livemode !== false ||
      !nonempty(event.id) || !number(event.created) ||
      typeof event.type !== "string" || !allowedEvents.has(event.type)) {
    return review("Unsupported event, malformed metadata or live-mode event");
  }
  if (ledger.seenEventIds.has(event.id)) return ignore("Duplicate event ID");
  if (!pending || !nonempty(pending.userId) || !nonempty(pending.checkoutSessionId) ||
      !nonempty(pending.customerId) || !nonempty(pending.priceId) ||
      pending.currency !== "gbp" || pending.expectedPence !== EXPECTED_GBP_PENCE[pending.sku]) {
    return review("No matching, server-authorised order or invalid price mapping");
  }
  const obj = event.data?.object;
  if (!obj || typeof obj !== "object") return review("Missing provider event object");
  const customer = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
  if (customer !== pending.customerId) return review("Stripe customer mismatch");
  if (ledger.lastAppliedEventCreated != null && event.created <= ledger.lastAppliedEventCreated) {
    // Stripe timestamps are second-granularity: two distinct events at the
    // same timestamp have no guaranteed order. Fail closed and reconcile
    // against fresh provider state rather than reactivating revoked access.
    return ignore("Out-of-order or same-second event; reconcile authoritative provider state");
  }

  const base = {userId:pending.userId,sku:pending.sku};
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      if (obj.id !== pending.checkoutSessionId) return review("Checkout ID mismatch");
      if (pending.sku !== "founder_pass_90d") {
        return ignore("Subscription checkout alone is not verified renewal payment");
      }
      if (obj.mode !== "payment" || obj.payment_status !== "paid" ||
          obj.currency !== "gbp" || obj.amount_total !== pending.expectedPence) {
        return review("One-time pass has no matching fully paid GBP checkout");
      }
      const intent = typeof obj.payment_intent === "string"
        ? obj.payment_intent : obj.payment_intent?.id;
      if (!nonempty(intent) || intent !== pending.paymentIntentId) {
        return review("PaymentIntent does not match server purchase ledger");
      }
      // Stripe may deliver both completed and async_payment_succeeded for one
      // checkout. A second event ID MUST NOT start another 90-day period.
      // Keep paidThrough after a refund/cancellation to prevent resurrection.
      if (ledger.paidThroughEpoch != null) {
        return ignore("One-time pass already fulfilled; never extend a paid period twice");
      }
      return {action:"activate",reason:"Paid one-time pass with verified server-side purchase",
        ...base,providerReference:pending.checkoutSessionId,
        periodStartEpoch:event.created,paidThroughEpoch:event.created+NINETY_DAYS};
    }
    case "invoice.paid": {
      if (pending.sku === "founder_pass_90d") return review("One-time pass cannot renew by invoice");
      if (obj.status !== "paid" || obj.paid_out_of_band === true ||
          obj.collection_method !== "charge_automatically" ||
          obj.amount_remaining !== 0 ||
          obj.currency !== "gbp" || obj.amount_paid !== pending.expectedPence) {
        return review("Subscription renewal requires an automatically charged, fully paid GBP invoice");
      }
      // Subscription status must additionally be verified via Stripe API by
      // the future production adapter; this offline contract never grants access.
      const subscription = invoiceSubscriptionId(obj);
      if (!nonempty(subscription) || subscription !== pending.subscriptionId) {
        return review("Invoice subscription does not match server-created purchase");
      }
      const items = obj.lines?.data;
      if (!Array.isArray(items) || items.length !== 1 ||
          obj.lines?.has_more === true ||
          (typeof obj.lines?.total_count === "number" && obj.lines.total_count !== 1) ||
          invoicePriceId(items[0]) !== pending.priceId ||
          (items[0]?.parent?.invoice_item_details?.proration === true ||
           items[0]?.parent?.subscription_item_details?.proration === true)) {
        return review("Expected one complete matching membership price; prorations require review");
      }
      const start = items[0]?.period?.start;
      const end = items[0]?.period?.end;
      if (!number(start) || !number(end) || end <= start ||
          end-start < 25*86400 || end-start > 35*86400) {
        return review("Missing or invalid paid service period");
      }
      if (ledger.paidThroughEpoch != null && end <= ledger.paidThroughEpoch) {
        return ignore("Old/duplicate paid period cannot advance entitlements");
      }
      return {action:"activate",reason:"Verified invoice settled for exact billed period",
        ...base,providerReference:subscription,
        periodStartEpoch:start,paidThroughEpoch:end};
    }
    case "invoice.payment_failed": {
      if (pending.sku === "founder_pass_90d") return ignore("Pass is not recurring");
      const subscription = invoiceSubscriptionId(obj);
      if (subscription !== pending.subscriptionId) return review("Failed invoice subscription mismatch");
      return ledger.paidThroughEpoch != null && ledger.paidThroughEpoch > event.created
        ? ignore("Preserve an already paid-through period; do not create new quota")
        : {action:"suspend",reason:"Invoice failure with no remaining paid service period",
          ...base,providerReference:subscription};
    }
    case "customer.subscription.deleted": {
      if (pending.sku === "founder_pass_90d" || obj.id !== pending.subscriptionId) {
        return review("Subscription deletion does not match a recurring purchase");
      }
      return {action:"expire",reason:"Subscription ended; preserve history, no new quotas",
        ...base,providerReference:pending.subscriptionId};
    }
    case "charge.refunded":
    case "charge.dispute.created": {
      if (!nonempty(pending.paymentIntentId) ||
          obj.payment_intent !== pending.paymentIntentId) {
        return review("Refund/dispute does not match the purchase payment");
      }
      if (event.type === "charge.refunded" &&
          (!number(obj.amount_refunded) || !number(obj.amount) ||
           obj.amount_refunded < obj.amount)) {
        return review("Partial refund needs explicit commercial/manual decision");
      }
      return {action:"suspend",reason:"Verified full refund or charge dispute",
        ...base,providerReference:pending.sku === "founder_pass_90d"
          ? pending.checkoutSessionId : pending.subscriptionId};
    }
  }
  return ignore("Unreachable type");
}

/**
 * In-memory event simulation only; production must replace this with atomic
 * Stripe event-ID unique indexes, serialisable DB transitions, and a durable
 * provider-reconciliation queue. No DB mutation is performed here.
 */
export function applySimulatedDecision(
  event: any, ledger: LedgerState, decision: MemberDecision,
): void {
  if (decision.action === "review") return;
  ledger.seenEventIds.add(event.id);
  if (decision.action === "ignore") return;
  ledger.lastAppliedEventCreated = event.created;
  ledger.currentlyActive = decision.action === "activate";
  if (decision.action === "activate") ledger.paidThroughEpoch = decision.paidThroughEpoch;
}
