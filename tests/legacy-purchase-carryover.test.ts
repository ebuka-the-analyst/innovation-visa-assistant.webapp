import test from "node:test";
import assert from "node:assert/strict";
import {assessLegacyPurchaseCarryover} from "../server/services/legacyPurchaseCarryover";

const now=new Date("2026-10-12T12:00:00.000Z");
const account={
 userId:"legacy_test_1",subscriptionTier:"premium",subscriptionStatus:"active",
 tierExpiresAt:null,planCredits:2,bonusCredits:4,creditsUsed:1,
 stripeSubscriptionId:null,tierOverrideBy:null,
};
const payment={id:"pay_legacy_paid_1",tier:"premium",type:"one_time",
 status:"succeeded",amount:8900,currency:"GBP",createdAt:"2026-09-01T12:00:00Z"};

test("existing one-time plan remains grandfathered without a new recurring price or Stripe subscription",()=>{
 const result=assessLegacyPurchaseCarryover(account,[payment],now);
 assert.deepEqual(result,{action:"grandfather",tier:"premium",paidThrough:null,
  planCredits:2,bonusCredits:4,creditsUsed:1,sourcePaymentId:"pay_legacy_paid_1"});
 assert.equal(Object.hasOwn(result,"newSubscriptionId"),false);
});

test("preserve recorded expiry and unused coins without resetting to a new membership quota",()=>{
 const result=assessLegacyPurchaseCarryover({...account,subscriptionTier:"ultimate",
  tierExpiresAt:"2026-12-31T18:00:00Z",planCredits:8,bonusCredits:0,creditsUsed:4},
  [{...payment,tier:"ultimate"}],now);
 assert.equal(result.action,"grandfather");
 if(result.action!=="grandfather")return;
 assert.equal(result.planCredits,8);
 assert.equal(result.bonusCredits,0);
 assert.equal(result.creditsUsed,4);
 assert.equal(result.paidThrough,"2026-12-31T18:00:00.000Z");
});

test("legacy recurring Stripe subscriptions require provider reconciliation before conversion",()=>{
 assert.deepEqual(assessLegacyPurchaseCarryover({...account,
  stripeSubscriptionId:"sub_existing_legacy"},[payment],now),{
   action:"review",reason:"Existing Stripe subscription requires live-provider reconciliation",
 });
});

test("do not infer paid access from free or non-active status or unsupported tiers",()=>{
 assert.equal(assessLegacyPurchaseCarryover({...account,subscriptionTier:"free"},[payment],now).action,"skip");
 assert.equal(assessLegacyPurchaseCarryover({...account,subscriptionStatus:"past_due"},[payment],now).action,"review");
 assert.equal(assessLegacyPurchaseCarryover({...account,subscriptionTier:"founder"},[payment],now).action,"review");
 assert.equal(assessLegacyPurchaseCarryover({...account,tierOverrideBy:"admin_1"},[payment],now).action,"review");
});

test("failed, refunded, unmatched, subscription and free-value payment records never authorise conversion",()=>{
 for(const changes of [
  {status:"pending"},{status:"failed"},{status:"refunded"},
  {tier:"basic"},{type:"subscription"},{type:"refund"},{amount:0},
  {currency:"USD"},{createdAt:"2028-01-01T00:00:00Z"},
 ]){
   assert.equal(assessLegacyPurchaseCarryover(account,[{...payment,...changes}],now).action,"review",
     JSON.stringify(changes));
 }
 assert.equal(assessLegacyPurchaseCarryover(account,[],now).action,"review");
});

test("invalid balances or expired legacy rights cannot be silently converted",()=>{
 assert.equal(assessLegacyPurchaseCarryover({...account,planCredits:-1},[payment],now).action,"review");
 assert.equal(assessLegacyPurchaseCarryover({...account,bonusCredits:1.5},[payment],now).action,"review");
 assert.equal(assessLegacyPurchaseCarryover({...account,tierExpiresAt:"2025-01-01"},[payment],now).action,"review");
 assert.equal(assessLegacyPurchaseCarryover({...account,tierExpiresAt:"not-a-date"},[payment],now).action,"review");
});
