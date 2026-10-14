import assert from "node:assert/strict";
import test from "node:test";
import {decideManagedActivation} from "../server/phase3/memberManagedPaymentsDecision";
import {readFileSync} from "node:fs";

const id="00000000-0000-4000-8000-000000000001";
const pass={
 sku:"founder_pass_90d" as const,livemode:false,userId:"account_test_user",
 customerId:"cus_test123",checkoutSessionId:"cs_test_123456",
 originalPricePence:15900,seenEventIds:new Set<string>(),
 manualReviewPending:false,
};
const passReceipt={
 basePence:15900,taxPence:3021,grossPence:18921,
 currency:"gbp" as const,billingCountry:"FR",
 paymentIntentId:"pi_test123",providerReference:pass.checkoutSessionId,
};
const passEvent={
 id:"evt_12345",type:"checkout.session.completed",livemode:false,created:1790000000,
 data:{object:{id:pass.checkoutSessionId,customer:pass.customerId,mode:"payment",
  payment_status:"paid",currency:"gbp",amount_total:18921,payment_intent:"pi_test123"}},
};
const recurring={...pass,sku:"founder_pro" as const,originalPricePence:11900,
 subscriptionId:"sub_test123"};
const invoiceEvidence={...passReceipt,basePence:11900,taxPence:2380,grossPence:14280,
 providerReference:"sub_test123",invoiceId:"in_test123",
 periodStartEpoch:1790000000,periodEndEpoch:1792592000};
const invoiceEvent={
 id:"evt_invoice123",type:"invoice.paid",livemode:false,created:1790000022,
 data:{object:{id:"in_test123",customer:"cus_test123",status:"paid",
  amount_paid:14280,amount_remaining:0,currency:"gbp",
  parent:{subscription_details:{subscription:"sub_test123"}}}},
};
test("paid one-time pass activates exactly once for 90 days, never renews on replay",()=>{
 const accepted=decideManagedActivation(passEvent,pass,passReceipt);
 assert.deepEqual({action:accepted.action,from:accepted.periodStartEpoch,to:accepted.paidThroughEpoch},
 {action:"activate",from:passEvent.created,to:passEvent.created+90*86400});
 assert.equal(decideManagedActivation(passEvent,{...pass,seenEventIds:new Set(["evt_12345"])},passReceipt).action,"ignore");
 assert.equal(decideManagedActivation({...passEvent,id:"evt_second_123"},
  {...pass,paidThroughEpoch:accepted.paidThroughEpoch},passReceipt).action,"ignore");
});
test("subscription is activated ONLY after matching signed paid invoice, with correct new paid-through",()=>{
 const decision=decideManagedActivation(invoiceEvent,recurring,invoiceEvidence);
 assert.equal(decision.action,"activate");
 assert.equal(decision.periodStartEpoch,invoiceEvidence.periodStartEpoch);
 assert.equal(decision.paidThroughEpoch,invoiceEvidence.periodEndEpoch);
 assert.equal(decision.taxPence,2380);
 assert.equal(decideManagedActivation({...passEvent,data:{object:{...passEvent.data.object,customer:recurring.customerId}}},recurring,invoiceEvidence).action,"ignore");
 assert.equal(decideManagedActivation(invoiceEvent,
  {...recurring,paidThroughEpoch:invoiceEvidence.periodEndEpoch},invoiceEvidence).action,"ignore");
 assert.equal(decideManagedActivation(invoiceEvent,
  {...recurring,lastAppliedEventCreated:invoiceEvent.created},invoiceEvidence).action,"ignore");
});
test("altered invoice IDs, pricing, tax and payment intent references NEVER activate",()=>{
 const broken=[
  [invoiceEvent,recurring,{...invoiceEvidence,invoiceId:"in_wrong"}],
  [invoiceEvent,recurring,{...invoiceEvidence,providerReference:"sub_wrong"}],
  [invoiceEvent,recurring,{...invoiceEvidence,grossPence:11900}],
  [invoiceEvent,recurring,{...invoiceEvidence,taxPence:0}],
  [invoiceEvent,{...recurring,originalPricePence:15900},invoiceEvidence],
  [{...invoiceEvent,livemode:true},recurring,invoiceEvidence],
  [{...invoiceEvent,data:{object:{...invoiceEvent.data.object,amount_paid:11900}}},recurring,invoiceEvidence],
  [{...invoiceEvent,data:{object:{...invoiceEvent.data.object,id:"in_fake"}}},recurring,invoiceEvidence],
  [{...invoiceEvent,data:{object:{...invoiceEvent.data.object,customer:"cus_other"}}},recurring,invoiceEvidence],
  [invoiceEvent,{...recurring,manualReviewPending:true},invoiceEvidence],
  [invoiceEvent,recurring,{...invoiceEvidence,periodEndEpoch:invoiceEvidence.periodStartEpoch}],
  [invoiceEvent,recurring,{...invoiceEvidence,periodEndEpoch:invoiceEvidence.periodStartEpoch+12*86400}],
 ] as const;
 for(const [e,o,receipt] of broken){
  const response=decideManagedActivation(e as any,o as any,receipt as any);
  assert.notEqual(response.action,"activate",response.reason);
 }
});
test("client metadata, invoice previews, failed payments and unsanctioned events cannot grant access",()=>{
 for(const variant of [
  {...passEvent,id:"fake-event"},
  {...passEvent,type:"checkout.session.expired"},
  {...passEvent,type:"charge.refunded"},
  {...passEvent,data:{object:{...passEvent.data.object,payment_status:"unpaid"}}},
  {...passEvent,data:{object:{...passEvent.data.object,payment_intent:"pi_bad"}}},
  {...passEvent,data:{object:{...passEvent.data.object,customer:"cus_bad"}}},
 ]){
  const out=decideManagedActivation(variant,pass,passReceipt);
  assert.notEqual(out.action,"activate",out.reason);
 }
});
test("pure Managed Payments decisions are not imported into the existing live checkout",()=>{
 const live=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 assert.doesNotMatch(live,/memberManagedPaymentsDecision|decideManagedActivation/);
 assert.match(live,/isVerifiedUkMembershipCheckout/);
 assert.match(live,/processSignedLiveStripeEvent/);
});
