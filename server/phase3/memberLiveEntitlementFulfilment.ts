/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * LIVE fulfilment callback. The only caller is the LIVE signed-event ledger
 * inside a single PostgreSQL transaction; it never accepts browser claims.
 * Checkout remains disabled until release checks are independently approved.
 *
 * This writes the same entitlement and user columns consumed by the app, so
 * test checkout can prove actual paid access without mutating live customers.
 */
import type { PoolClient } from "pg";
import type { MemberDecision, PendingCheckout } from "./memberStripeLiveAcceptance";

const DAY = 86400;
export class MembershipFulfilmentReviewRequired extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "MembershipFulfilmentReviewRequired";
  }
}
function epochDate(value: number | undefined, label: string): Date {
  if (value == null || !Number.isSafeInteger(value) || value <= 0) {
    throw new MembershipFulfilmentReviewRequired("Missing validated " + label);
  }
  const d = new Date(value * 1000);
  if (!Number.isFinite(d.getTime())) {
    throw new MembershipFulfilmentReviewRequired("Invalid " + label);
  }
  return d;
}
function providerRef(order: PendingCheckout): string {
  const ref = order.sku === "founder_pass_90d"
    ? order.checkoutSessionId : order.subscriptionId;
  if (typeof ref !== "string" || ref.length < 5) {
    throw new MembershipFulfilmentReviewRequired("Unverified provider reference");
  }
  return ref;
}

export async function applyVerifiedLiveMembershipEntitlement(
  client: PoolClient,
  order: PendingCheckout,
  decision: MemberDecision,
  eventCreated: number,
): Promise<void> {
  if (decision.action === "ignore" || decision.action === "review") return;
  if (decision.userId !== order.userId || decision.sku !== order.sku) {
    throw new MembershipFulfilmentReviewRequired("Decision/account mismatch");
  }
  const ref = providerRef(order);
  if (decision.providerReference !== ref) {
    throw new MembershipFulfilmentReviewRequired("Decision/provider mismatch");
  }
  if (!Number.isSafeInteger(eventCreated)) {
    throw new MembershipFulfilmentReviewRequired("Invalid provider event time");
  }
  const userResult = await client.query<{
    id:string; subscription_tier:string | null; subscription_status:string | null;
  }>(`SELECT id, subscription_tier, subscription_status
      FROM users WHERE id = $1 FOR UPDATE`, [order.userId]);
  if (userResult.rowCount !== 1) throw new MembershipFulfilmentReviewRequired("Founder account not found");
  const user = userResult.rows[0];

  if (decision.action === "activate") {
    // Never silently upgrade a customer's existing legacy or independent
    // active plan. Manual migration/downgrade is a separate explicit flow.
    if (!["free", order.sku].includes(user.subscription_tier || "free")) {
      throw new MembershipFulfilmentReviewRequired("Existing customer tier needs review");
    }
    const others = await client.query(`
      SELECT id FROM member_ai_entitlements WHERE user_id=$1
        AND status='active' AND ends_at > to_timestamp($2)
        AND NOT (provider='stripe' AND provider_reference=$3)
      FOR UPDATE`, [order.userId,eventCreated,ref]);
    if (others.rowCount) throw new MembershipFulfilmentReviewRequired("Conflicting active membership");

    const start=epochDate(decision.periodStartEpoch,"paid period start");
    const end=epochDate(decision.paidThroughEpoch,"paid period end");
    if (end.getTime() <= start.getTime()) throw new MembershipFulfilmentReviewRequired("Invalid paid service period");
    const isPass=order.sku==="founder_pass_90d";
    if (isPass && end.getTime()-start.getTime() !== 90*DAY*1000) {
      throw new MembershipFulfilmentReviewRequired("Pass must have exact 90-day duration");
    }
    const quotaPeriodEnd=isPass?new Date(start.getTime()+30*DAY*1000):end;
    const upsert=await client.query(`
      INSERT INTO member_ai_entitlements
        (user_id,package_id,billing_kind,status,provider,provider_reference,
          starts_at,ends_at,period_starts_at,period_ends_at)
      VALUES ($1,$2,$3,'active','stripe',$4,$5,$6,$5,$7)
      ON CONFLICT (provider,provider_reference) DO UPDATE
      SET status='active',
          ends_at=EXCLUDED.ends_at,
          period_starts_at=EXCLUDED.period_starts_at,
          period_ends_at=EXCLUDED.period_ends_at,
          updated_at=NOW()
      WHERE member_ai_entitlements.user_id=EXCLUDED.user_id
        AND member_ai_entitlements.package_id=EXCLUDED.package_id
        AND EXCLUDED.ends_at > member_ai_entitlements.ends_at
      RETURNING id`,
      [order.userId,order.sku,isPass?"pass":"subscription",ref,start,end,quotaPeriodEnd]);
    if (upsert.rowCount!==1) {
      throw new MembershipFulfilmentReviewRequired("Payment is not a newer verified paid period");
    }
    await client.query(`
      UPDATE users SET subscription_tier=$2,
        subscription_status='active',tier_expires_at=$3 WHERE id=$1`,
      [order.userId,order.sku,end]);
    return;
  }

  const status=decision.action==="expire"?"expired":"past_due";
  const ent=await client.query<{id:string;ends_at:Date}>(`
    UPDATE member_ai_entitlements
      SET status=$4,updated_at=NOW()
    WHERE user_id=$1 AND package_id=$2
      AND provider='stripe' AND provider_reference=$3
    RETURNING id,ends_at`,[order.userId,order.sku,ref,status]);
  if (ent.rowCount!==1) {
    throw new MembershipFulfilmentReviewRequired("Cannot revoke unknown paid membership");
  }
  // If this account has a different active entitlement, keep its access.
  const others=await client.query(`
    SELECT id FROM member_ai_entitlements
    WHERE user_id=$1 AND status='active'
      AND ends_at > to_timestamp($2)
      AND NOT (provider='stripe' AND provider_reference=$3)
    LIMIT 1`,[order.userId,eventCreated,ref]);
  if (!others.rowCount && user.subscription_tier===order.sku) {
    await client.query(`
      UPDATE users SET subscription_status=$2
      WHERE id=$1 AND subscription_tier=$3`,
      [order.userId,decision.action==="expire"?"cancelled":"past_due",order.sku]);
  }
  // Existing tier expiry is intentionally retained for dispute/receipt audit.
}
