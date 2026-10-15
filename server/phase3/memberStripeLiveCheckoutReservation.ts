/**
 * PRODUCTION MEMBERSHIP ADAPTER, independent of the QA tables and Stripe sandbox.
 * Feature gated; never expose live Checkout before independent release approval.
 */
/**
 * QA-only pre-checkout reservation. Locks the account row before creating a
 * Stripe Checkout Session, so rapid retries and parallel requests cannot
 * produce two chargeable sessions for one founder. No live customer use.
 */
import type { Pool } from "pg";
import type { PendingCheckout } from "./memberStripeLiveAcceptance";
import type { ClosedOrderId } from "./memberStripeLiveCheckoutRecovery";

export class LiveCheckoutConflict extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveCheckoutConflict";
  }
}
export type NewCheckoutOrder = Omit<PendingCheckout, "checkoutSessionId"|"subscriptionId"|"paymentIntentId"> & {orderId:string};

export async function reserveLiveCheckout(
  pool: Pool, order: NewCheckoutOrder, verifiedExpiredIds:readonly ClosedOrderId[] = [],
): Promise<void> {
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    const user=await client.query<{subscription_tier:string|null;subscription_status:string|null}>(`
      SELECT subscription_tier,subscription_status
      FROM users WHERE id=$1 FOR UPDATE`,[order.userId]);
    if(user.rowCount!==1)throw new LiveCheckoutConflict("User account does not exist");
    const tier=user.rows[0].subscription_tier||"free";
    const status=user.rows[0].subscription_status||"inactive";
    if(tier!=="free" || status==="active"){
      throw new LiveCheckoutConflict("Existing membership must be reconciled before another checkout");
    }
    const pending=await client.query(`
      SELECT id FROM member_stripe_live_orders WHERE user_id=$1
        AND (currently_active OR id <> ALL($2::uuid[]))
      LIMIT 1 FOR UPDATE`,[order.userId,verifiedExpiredIds]);
    if(pending.rowCount)throw new LiveCheckoutConflict("A previous checkout is active or awaiting verification. Resume it instead of making another payment.");
    await client.query(`
      INSERT INTO member_stripe_live_orders
       (id,user_id,sku,stripe_customer_id,stripe_checkout_session_id,
        stripe_price_id,expected_pence,currency)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [order.orderId,order.userId,order.sku,order.customerId,
        "cs_pending_"+order.orderId,order.priceId,order.expectedPence,order.currency]);
    await client.query("COMMIT");
  }catch(error){
    await client.query("ROLLBACK").catch(()=>{});
    throw error;
  }finally{client.release();}
}
export async function recordCreatedLiveCheckout(
  pool: Pool, orderId: string, sessionId: string,
): Promise<void> {
  if(!/^cs_live_[a-zA-Z0-9_]+$/.test(sessionId)){
    throw new Error("Expected Stripe LIVE Checkout Session ID");
  }
  const updated=await pool.query(`
    UPDATE member_stripe_live_orders SET stripe_checkout_session_id=$2,
      updated_at=NOW()
    WHERE id=$1 AND stripe_checkout_session_id=$3`,
    [orderId,sessionId,"cs_pending_"+orderId]);
  if(updated.rowCount!==1)throw new Error("Trusted pending checkout could not be bound");
}
