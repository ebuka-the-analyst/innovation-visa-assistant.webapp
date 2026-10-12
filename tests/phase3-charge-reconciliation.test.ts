import assert from "node:assert/strict";
import test from "node:test";
import {
  chargeIdForSignedEvent,
  reconcileSignedChargeToProvider,ProviderChargeMismatch,
} from "../server/phase3/stripeChargeReconciliationQa";

const fresh={
  id:"ch_test_qa_payment", customer:"cus_qa_verified",
  payment_intent:"pi_qa_verified",livemode:false,
  currency:"gbp",amount:15900,amount_refunded:15900,refunded:true,
};
test("customerless dispute is matched only by verified Stripe test Charge, then held for manual review",()=>{
  const signed={id:"du_test_dispute",charge:fresh.id,amount:15900,currency:"gbp"};
  assert.equal(chargeIdForSignedEvent("charge.dispute.created",signed),fresh.id);
  assert.deepEqual(reconcileSignedChargeToProvider("charge.dispute.created",signed,fresh),{
    chargeId:fresh.id,customerId:fresh.customer,paymentIntentId:fresh.payment_intent,
  });
});
test("full refund requires provider-confirmed charged identity and state",()=>{
  const signed={id:fresh.id,customer:fresh.customer,payment_intent:fresh.payment_intent,
    currency:"gbp",amount:15900,amount_refunded:15900};
  assert.equal(reconcileSignedChargeToProvider("charge.refunded",signed,fresh).paymentIntentId,
    fresh.payment_intent);
  for(const bad of [
    {...fresh,refunded:false},
    {...fresh,amount_refunded:100},
    {...fresh,livemode:true},
    {...fresh,customer:"cus_other"},
    {...fresh,payment_intent:"pi_other"},
    {...fresh,currency:"usd"},
  ])assert.throws(()=>reconcileSignedChargeToProvider("charge.refunded",signed,bad),
    ProviderChargeMismatch);
  assert.throws(()=>reconcileSignedChargeToProvider("charge.refunded",
    {...signed,customer:"cus_other"},fresh),ProviderChargeMismatch);
  assert.throws(()=>reconcileSignedChargeToProvider("charge.refunded",
    {...signed,amount_refunded:15900},{...fresh,amount_refunded:100,refunded:false}),
    ProviderChargeMismatch);
  const partialSigned={...signed,amount_refunded:100};
  const partialFresh={...fresh,amount_refunded:100,refunded:false};
  assert.equal(reconcileSignedChargeToProvider("charge.refunded",
    partialSigned,partialFresh).paymentIntentId,fresh.payment_intent,
    "Real partial refunds are reconciled and forwarded for manual review");
});
test("missing charge and provider payment references fail shut",()=>{
  assert.throws(()=>chargeIdForSignedEvent("charge.dispute.created",{id:"du_1"}),
    ProviderChargeMismatch);
  assert.throws(()=>chargeIdForSignedEvent("invoice.paid",{id:"in_1"}),
    ProviderChargeMismatch);
  assert.throws(()=>reconcileSignedChargeToProvider("charge.dispute.created",
    {charge:fresh.id},{...fresh,payment_intent:null}),ProviderChargeMismatch);
});
