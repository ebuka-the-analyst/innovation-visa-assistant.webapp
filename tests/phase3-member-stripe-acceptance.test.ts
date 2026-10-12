import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";
import {
  applySimulatedDecision, decideVerifiedTestMembershipEvent,
  EXPECTED_GBP_PENCE, type LedgerState, type PendingCheckout,
} from "../server/phase3/memberStripeAcceptance";

const stripe = new Stripe("sk_test_offline_pure_unit_fixture", {apiVersion:"2025-08-27.basil"});
const secret="whsec_pure_local_fixture_never_used_on_stripe";
const order = (sku: PendingCheckout["sku"]):PendingCheckout => ({
  userId:"fictional-user-only",sku,customerId:"cus_test_offline_01",
  checkoutSessionId:"cs_test_fixture_01",priceId:"price_test_fixture_exact",
  subscriptionId:sku==="founder_pass_90d"?undefined:"sub_test_offline_01",
  paymentIntentId:"pi_test_offline_01",
  expectedPence:EXPECTED_GBP_PENCE[sku],currency:"gbp",
});
const ledger=():LedgerState=>({seenEventIds:new Set()});
const signed=(type:string,obj:any,created=1800000000,eventId="evt_test_001",livemode=false)=>{
  const value={id:eventId,type,created,livemode,object:"event",data:{object:obj}};
  const payload=JSON.stringify(value);
  const sig=stripe.webhooks.generateTestHeaderString({payload,secret});
  return stripe.webhooks.constructEvent(payload,sig,secret);
};
const session=(sku:PendingCheckout["sku"],paid=true)=>({
  id:"cs_test_fixture_01",customer:"cus_test_offline_01",
  mode:sku==="founder_pass_90d"?"payment":"subscription",
  payment_status:paid?"paid":"unpaid",currency:"gbp",
  payment_intent:"pi_test_offline_01",amount_total:EXPECTED_GBP_PENCE[sku],
});
const invoice=(sku:PendingCheckout["sku"],start=1800000000)=>({
  id:"in_test_offline_01",customer:"cus_test_offline_01",
  status:"paid",currency:"gbp",amount_paid:EXPECTED_GBP_PENCE[sku],
  subscription:"sub_test_offline_01",paid_out_of_band:false,
  lines:{data:[{price:{id:"price_test_fixture_exact"},period:{start,end:start+30*86400}}]},
});

test("tampered or unsigned Stripe events fail signature verification before evaluation",()=>{
  const event=signed("checkout.session.completed",session("founder_pass_90d"));
  assert.equal(decideVerifiedTestMembershipEvent(event,order("founder_pass_90d"),ledger()).action,"activate");
  const raw=JSON.stringify(event);
  const signature=stripe.webhooks.generateTestHeaderString({payload:raw,secret});
  assert.throws(()=>stripe.webhooks.constructEvent(raw.replace("15900","100"),signature,secret),/signature/i);
  assert.throws(()=>stripe.webhooks.constructEvent(raw,"",secret),/signature/i);
});

test("paid one-time pass activates exactly 90 days with trusted order, but never from client-supplied metadata",()=>{
  const o=order("founder_pass_90d");
  const status=ledger();
  const paid=signed("checkout.session.completed",session(o.sku));
  const accepted=decideVerifiedTestMembershipEvent(paid,o,status);
  assert.equal(accepted.action,"activate");
  assert.equal(accepted.paidThroughEpoch!-accepted.periodStartEpoch!,90*86400);
  applySimulatedDecision(paid,status,accepted);
  assert.equal(decideVerifiedTestMembershipEvent(paid,o,status).action,"ignore");
  const asyncSecondEvent=signed("checkout.session.async_payment_succeeded",
    session(o.sku),1800000100,"evt_second_success");
  assert.equal(decideVerifiedTestMembershipEvent(asyncSecondEvent,o,status).action,"ignore",
    "Two different success event IDs must not extend a one-time pass");
  const unpaid=signed("checkout.session.completed",session(o.sku,false),1800000001,"evt_test_unpaid");
  assert.equal(decideVerifiedTestMembershipEvent(unpaid,o,ledger()).action,"review");
  const wrongPrice={...o,expectedPence:1};
  assert.equal(decideVerifiedTestMembershipEvent(paid,wrongPrice,ledger()).action,"review");
  const wrongCustomer=signed("checkout.session.completed",{...session(o.sku),customer:"cus_test_another"},1800000000,"evt_bad_customer");
  assert.equal(decideVerifiedTestMembershipEvent(wrongCustomer,o,ledger()).action,"review");
  assert.equal(decideVerifiedTestMembershipEvent(paid,null,ledger()).action,"review");
  assert.equal(decideVerifiedTestMembershipEvent(signed("checkout.session.completed",session(o.sku),1800000000,"evt_test_live",true),o,ledger()).action,"review");
});

test("subscription Checkout does not grant paid access; invoices must reconcile exact price and payment",()=>{
  const o=order("founder");
  const subCheckout=signed("checkout.session.completed",session(o.sku));
  assert.equal(decideVerifiedTestMembershipEvent(subCheckout,o,ledger()).action,"ignore");
  const invoicePaid=signed("invoice.paid",invoice(o.sku));
  const accepted=decideVerifiedTestMembershipEvent(invoicePaid,o,ledger());
  assert.equal(accepted.action,"activate");
  assert.equal(accepted.paidThroughEpoch!-accepted.periodStartEpoch!,30*86400);
  assert.equal(accepted.providerReference,o.subscriptionId);
  const fakePrice=signed("invoice.paid",{...invoice(o.sku),lines:{data:[{price:{id:"price_unexpected"},period:{start:1800000000,end:1802592000}}]}},1800000000,"evt_wrong_price");
  assert.equal(decideVerifiedTestMembershipEvent(fakePrice,o,ledger()).action,"review");
  for(const changed of [{amount_paid:10},{currency:"usd"},{paid_out_of_band:true},{subscription:"sub_fake"}]){
    const candidate=signed("invoice.paid",{...invoice(o.sku),...changed},1800000000,"evt_bad_"+Object.keys(changed)[0]);
    assert.equal(decideVerifiedTestMembershipEvent(candidate,o,ledger()).action,"review");
  }
  const proration=signed("invoice.paid",{...invoice(o.sku),lines:{data:[...invoice(o.sku).lines.data,...invoice(o.sku).lines.data]}},1800000000,"evt_proration");
  assert.equal(decideVerifiedTestMembershipEvent(proration,o,ledger()).action,"review");
});

test("old paid invoices never restore cancelled or refunded entitlements",()=>{
  const o=order("founder_pro"), l=ledger();
  const paid=signed("invoice.paid",invoice(o.sku),1800000010,"evt_paid");
  applySimulatedDecision(paid,l,decideVerifiedTestMembershipEvent(paid,o,l));
  assert.equal(l.currentlyActive,true);
  const ended=signed("customer.subscription.deleted",{id:o.subscriptionId,customer:o.customerId},1800000100,"evt_deleted");
  const stop=decideVerifiedTestMembershipEvent(ended,o,l);
  assert.equal(stop.action,"expire");
  applySimulatedDecision(ended,l,stop);
  assert.equal(l.currentlyActive,false);
  const retry=signed("invoice.paid",invoice(o.sku),1800000050,"evt_old_invoice");
  assert.equal(decideVerifiedTestMembershipEvent(retry,o,l).action,"ignore");
  assert.equal(l.currentlyActive,false);
});

test("failed renewal does not cancel already-paid period; refunds and disputes require precise reconciliation",()=>{
  const o=order("founder"), l=ledger();
  const paid=signed("invoice.paid",invoice(o.sku),1800000000,"evt_paid");
  applySimulatedDecision(paid,l,decideVerifiedTestMembershipEvent(paid,o,l));
  const failed=signed("invoice.payment_failed",{customer:o.customerId,subscription:o.subscriptionId},1800000200,"evt_failed");
  assert.equal(decideVerifiedTestMembershipEvent(failed,o,l).action,"ignore");
  const afterPaid=signed("invoice.payment_failed",{customer:o.customerId,subscription:o.subscriptionId},1802592100,"evt_failed_later");
  assert.equal(decideVerifiedTestMembershipEvent(afterPaid,o,l).action,"suspend");
  const partial=signed("charge.refunded",{customer:o.customerId,payment_intent:o.paymentIntentId,amount:6900,amount_refunded:100},1802592200,"evt_partial");
  assert.equal(decideVerifiedTestMembershipEvent(partial,o,l).action,"review");
  const full=signed("charge.refunded",{customer:o.customerId,payment_intent:o.paymentIntentId,amount:6900,amount_refunded:6900},1802592300,"evt_full");
  assert.equal(decideVerifiedTestMembershipEvent(full,o,l).action,"suspend");
  const unrelated=signed("charge.dispute.created",{customer:o.customerId,payment_intent:"pi_unrelated"},1802592400,"evt_unrelated");
  assert.equal(decideVerifiedTestMembershipEvent(unrelated,o,l).action,"review");
});

test("acceptance contract must not be mounted on a live Stripe payment route",async()=>{
  const {readFileSync}=await import("node:fs");
  const routes=readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
  const stripeClient=readFileSync(new URL("../server/stripeClient.ts",import.meta.url),"utf8");
  assert.doesNotMatch(routes,/memberStripeAcceptance|decideVerifiedTestMembershipEvent/);
  assert.match(stripeClient,/ENFORCE_LIVE_MODE = true/);
});
