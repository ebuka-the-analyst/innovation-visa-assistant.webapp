/**
 * Recover a customer's existing LIVE Stripe Checkout rather than creating
 * another chargeable Session when they leave Stripe or close the tab.
 *
 * Critical safety rules:
 * - Call only for a signed-in, eligible user; never take account IDs from
 *   the browser.
 * - Query EVERY prior order for the account, not just the last hour.
 * - Only provider-confirmed OPEN+UNPAID Sessions may be resumed, only for
 *   the same SKU and owner, with the original checkout URL.
 * - Provider-confirmed EXPIRED+UNPAID Sessions with no payment/subscription,
 *   paid ledger activity or reviews may be skipped when creating a new order.
 * - COMPLETE, ACTIVE, unknown, placeholder and inconsistent orders block
 *   new checkout. Never expire a real Session automatically.
 * - The DB reservation re-checks under the user row lock, preventing races.
 */
import type Stripe from "stripe";
import type {Pool} from "pg";
import type {CandidateSku} from "./memberStripeLiveAcceptance";

export type ClosedOrderId = string & {readonly __stripeExpiredConfirmed:unique symbol};
type PriorOrder = {
 id:string;user_id:string;sku:CandidateSku;
 stripe_customer_id:string;stripe_checkout_session_id:string;
 stripe_subscription_id:string|null;stripe_payment_intent_id:string|null;
 stripe_price_id:string;expected_pence:number;currency:string;
 currently_active:boolean;paid_through:Date|null;
};
export type ResumeDecision =
 | {kind:"resume";orderId:string;sessionId:string;url:string}
 | {kind:"new";verifiedExpiredIds:readonly ClosedOrderId[]};

export class PendingCheckoutNeedsReview extends Error {
 constructor(message:string){super(message);this.name="PendingCheckoutNeedsReview";}
}
const blocked=(reason:string):never=>{throw new PendingCheckoutNeedsReview(reason);};
const checkoutHost=(value:unknown):value is string=>{
 if(typeof value!=="string")return false;
 try{
  const u=new URL(value);
  return u.protocol==="https:"&&u.hostname==="checkout.stripe.com"&&
   u.username===""&&u.password===""&&u.pathname.startsWith("/c/pay/");
 }catch{return false;}
};
const providerId=(o:unknown):string|null=>
 typeof o==="string"?o:
 o&&typeof o==="object"&&typeof (o as {id?:unknown}).id==="string"?
 (o as {id:string}).id:null;
export function isTrustedOldLiveCheckout(
 order:PriorOrder, session:Stripe.Checkout.Session,
 item:Stripe.LineItem,
):boolean {
 return session.id===order.stripe_checkout_session_id &&
  session.livemode===true &&
  session.client_reference_id===order.user_id &&
  providerId(session.customer)===order.stripe_customer_id &&
  session.metadata?.ifvaLiveOrderId===order.id &&
  session.metadata?.ifvaMembershipLive==="true" &&
  session.mode===(order.sku==="founder_pass_90d"?"payment":"subscription") &&
  session.currency==="gbp" && order.currency==="gbp" &&
  session.amount_total===order.expected_pence &&
  session.amount_subtotal===order.expected_pence &&
  session.total_details?.amount_discount===0 &&
  session.total_details?.amount_tax===0 &&
  session.automatic_tax?.enabled===false &&
  session.shipping_address_collection?.allowed_countries?.length===1 &&
  session.shipping_address_collection.allowed_countries[0]==="GB" &&
  item.quantity===1 &&
  providerId(item.price)===order.stripe_price_id &&
  item.amount_subtotal===order.expected_pence;
}

export async function inspectPriorLiveCheckout(
 pool:Pool, stripe:Stripe, userId:string, chosenSku:CandidateSku,
):Promise<ResumeDecision> {
 const rows=await pool.query<PriorOrder>(`
   SELECT id,user_id,sku,stripe_customer_id,stripe_checkout_session_id,
      stripe_subscription_id,stripe_payment_intent_id,stripe_price_id,
      expected_pence,currency,currently_active,paid_through
   FROM member_stripe_live_orders WHERE user_id=$1
   ORDER BY created_at DESC,id DESC`,[userId]);
 const expired:ClosedOrderId[]=[];
 let resumable:{kind:"resume";orderId:string;sessionId:string;url:string}|null=null;
 for(const order of rows.rows){
   if(order.user_id!==userId || order.currently_active || order.paid_through!==null ||
      order.stripe_subscription_id!==null || order.stripe_payment_intent_id!==null)
     blocked("An existing membership/payment requires verification before another checkout. Contact billing support.");
   if(!/^cs_live_[A-Za-z0-9_]+$/.test(order.stripe_checkout_session_id))
     blocked("A previous checkout is still being prepared. Please try again shortly or contact support.");
   const session=await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
   // Always retrieve the line items from the provider, not browser metadata.
   const lineItems=await stripe.checkout.sessions.listLineItems(session.id,{limit:2});
   if(lineItems.data.length!==1 || lineItems.has_more ||
       !isTrustedOldLiveCheckout(order,session,lineItems.data[0]))
     blocked("The existing checkout details require billing verification. Contact support; do not pay again.");
   const reviews=await pool.query(`
     SELECT 1 FROM member_stripe_live_reviews WHERE order_id=$1 AND status='pending'
     UNION ALL
     SELECT 1 FROM member_stripe_live_events WHERE order_id=$1 AND decision <> 'ignore'
     LIMIT 1`,[order.id]);
   if(reviews.rowCount)
     blocked("A previous payment is being reconciled. Do not pay again; contact billing support.");
   if(session.status==="open"&&session.payment_status==="unpaid" &&
      !session.subscription && !session.payment_intent){
     if(order.sku!==chosenSku)
       blocked("You have an unfinished "+order.sku.replaceAll("_"," ")+" checkout. Select that package to resume it, or contact billing support to change packages.");
     if(!checkoutHost(session.url))
       blocked("Stripe did not provide a secure link for the previous checkout. Contact support.");
     if(resumable)blocked("Multiple unpaid checkout sessions require billing review before another payment.");
     resumable={kind:"resume",orderId:order.id,sessionId:session.id,url:session.url};
     continue;
   }
   if(session.status==="expired"&&session.payment_status==="unpaid"&&
      !session.subscription&&!session.payment_intent){
     expired.push(order.id as ClosedOrderId);
     continue;
   }
   blocked("Your earlier checkout has reached payment processing. Do not start another payment until its status is verified.");
 }
 if(resumable)return resumable;
 return {kind:"new",verifiedExpiredIds:expired};
}
