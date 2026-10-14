/**
 * OFFLINE-ONLY decision policy for a future Stripe Managed Payments signed webhook.
 * NEVER grant an entitlement using this file by itself: callers MUST verify
 * webhook signatures, fetch all provider evidence anew, and transactionally
 * deduplicate the event before applying any decision.
 * No existing UK-only live handler imports this module.
 */
import { EXPECTED_GBP_PENCE, type CandidateSku } from "./memberStripeLiveAcceptance";
import type { ManagedPaymentEvidence } from "./memberManagedPaymentsReceipt";

export type ManagedDecisionOrder={
  sku:CandidateSku;
  livemode:boolean;
  userId:string;
  customerId:string;
  checkoutSessionId:string;
  subscriptionId?:string;
  originalPricePence:number;
  lastAppliedEventCreated?:number;
  paidThroughEpoch?:number;
  seenEventIds:ReadonlySet<string>;
  manualReviewPending:boolean;
};
export type ManagedDecision = {
  action:"activate"|"ignore"|"review";
  reason:string;
  sku?:CandidateSku;
  userId?:string;
  providerReference?:string;
  periodStartEpoch?:number;
  paidThroughEpoch?:number;
  paymentIntentId?:string;
  taxPence?:number;
  grossPence?:number;
};

type VerifiedEvent = {
 id:string; type:string; livemode:boolean; created:number;
 data?:{object?:Record<string,any>};
};
const id=(o:any):string|null=>
  typeof o==="string"?o:typeof o?.id==="string"?o.id:null;
const positive=(n:unknown):n is number=>typeof n==="number"&&Number.isSafeInteger(n)&&n>0;

/**
 * Stripe account event routing is not implied by product text or user email.
 * Event type, session, customer, amount and payment all have to agree with
 * the server-owned order and independently provider-verified receipt.
 */
export function decideManagedActivation(
  event:VerifiedEvent,order:ManagedDecisionOrder,evidence:ManagedPaymentEvidence,
):ManagedDecision {
  const review=(reason:string):ManagedDecision=>({action:"review",reason});
  const ignore=(reason:string):ManagedDecision=>({action:"ignore",reason});
  if(!event || !order || !evidence || !positive(event.created) ||
     typeof event.id!=="string" || !/^evt_[A-Za-z0-9_]+$/.test(event.id) ||
     !["checkout.session.completed","checkout.session.async_payment_succeeded","invoice.paid"].includes(event.type) ||
     event.livemode!==order.livemode)
    return review("Unsupported, malformed or cross-environment signed event");
  if(order.seenEventIds.has(event.id))return ignore("Duplicate signed provider event");
  if(order.lastAppliedEventCreated!=null&&event.created<=order.lastAppliedEventCreated)
    return ignore("Out-of-order or same-second provider event");
  if(order.manualReviewPending)return review("Unresolved refund, dispute or billing review");
  if(!Object.hasOwn(EXPECTED_GBP_PENCE,order.sku) ||
     order.originalPricePence!==EXPECTED_GBP_PENCE[order.sku] ||
     evidence.basePence!==order.originalPricePence ||
     evidence.currency!=="gbp" || !positive(evidence.grossPence) ||
     typeof evidence.taxPence!=="number" ||
     !Number.isSafeInteger(evidence.taxPence) || evidence.taxPence<0 ||
     evidence.grossPence!==evidence.basePence+evidence.taxPence)
    return review("Original price, paid tax and gross do not reconcile");
  const obj=event.data?.object;
  if(!obj||id(obj.customer)!==order.customerId)return review("Signed customer or object mismatch");
  if(evidence.providerReference!==(
    order.sku==="founder_pass_90d"?order.checkoutSessionId:order.subscriptionId))
    return review("Untrusted provider reference");
  if(typeof evidence.paymentIntentId!=="string" ||
     !/^pi_[A-Za-z0-9_]+$/.test(evidence.paymentIntentId))
    return review("Missing confirmed payment intent");
  const fromReceipt={
    action:"activate" as const,
    reason:"Verified signed provider event and independently reconciled payment",
    sku:order.sku,userId:order.userId,providerReference:evidence.providerReference,
    paymentIntentId:evidence.paymentIntentId,taxPence:evidence.taxPence,
    grossPence:evidence.grossPence,
  };
  if(order.sku==="founder_pass_90d"){
    if(event.type==="invoice.paid" || id(obj.id)!==order.checkoutSessionId ||
       obj.mode!=="payment" || obj.payment_status!=="paid" ||
       obj.currency!=="gbp" || obj.amount_total!==evidence.grossPence ||
       id(obj.payment_intent)!==evidence.paymentIntentId)
      return review("Signed pass payment differs from provider-confirmed receipt");
    if(order.paidThroughEpoch!=null)
      return ignore("Pass already activated; never extend original 90 days");
    const through=event.created+90*86400;
    if(!Number.isSafeInteger(through))return review("Invalid pass expiration time");
    return {...fromReceipt,periodStartEpoch:event.created,paidThroughEpoch:through};
  }
  // Recurring memberships only activate on an automatically settled invoice,
  // not checkout.session.completed, whose payment can still be unsettled.
  if(event.type!=="invoice.paid")
    return ignore("Subscription Checkout is not a verified paid invoice");
  const legacy=id(obj.subscription);
  const modern=id(obj.parent?.subscription_details?.subscription);
  if((legacy&&modern&&legacy!==modern) ||
     (modern||legacy)!==order.subscriptionId || id(obj.id)==null ||
     obj.currency!=="gbp" || obj.status!=="paid" ||
     obj.id!==evidence.invoiceId ||
     obj.amount_paid!==evidence.grossPence ||
     obj.amount_remaining!==0)
    return review("Signed invoice does not match paid subscription or amount");
  if(!positive(evidence.periodStartEpoch) ||
     !positive(evidence.periodEndEpoch) ||
     evidence.periodEndEpoch<=evidence.periodStartEpoch ||
     evidence.periodEndEpoch-evidence.periodStartEpoch<25*86400 ||
     evidence.periodEndEpoch-evidence.periodStartEpoch>35*86400)
    return review("Missing verified monthly paid period");
  if(order.paidThroughEpoch!=null&&evidence.periodEndEpoch<=order.paidThroughEpoch)
    return ignore("Invoice period already paid or older than current entitlement");
  return {...fromReceipt,periodStartEpoch:evidence.periodStartEpoch,
    paidThroughEpoch:evidence.periodEndEpoch};
}
