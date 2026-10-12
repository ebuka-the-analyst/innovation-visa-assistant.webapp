import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { confirmedNewTestMembershipPurchase } from "../server/phase3/memberStripeCheckoutIntentQa";

const plans=[
  ["founder",6900,true],
  ["founder_pro",11900,true],
  ["founder_pass_90d",15900,false],
] as const;

test("a new Stripe test checkout requires an explicit purchase, exact GBP pence and renewal acknowledgement",()=>{
  for(const [sku,confirmedPricePence,monthly] of plans) {
    const valid={sku,confirmedPricePence,acknowledgeNewPayment:true,
      ...(monthly?{acknowledgeMonthlyRenewal:true}:{})};
    assert.equal(confirmedNewTestMembershipPurchase(valid),sku);
    assert.equal(confirmedNewTestMembershipPurchase({...valid,acknowledgeNewPayment:false}),null);
    assert.equal(confirmedNewTestMembershipPurchase({...valid,acknowledgeNewPayment:"true"}),null);
    assert.equal(confirmedNewTestMembershipPurchase({...valid,confirmedPricePence:confirmedPricePence-1}),null);
    assert.equal(confirmedNewTestMembershipPurchase({...valid,confirmedPricePence:String(confirmedPricePence)}),null);
    assert.equal(confirmedNewTestMembershipPurchase({sku,confirmedPricePence}),null);
    if(monthly){
      assert.equal(confirmedNewTestMembershipPurchase({...valid,acknowledgeMonthlyRenewal:false}),null);
      assert.equal(confirmedNewTestMembershipPurchase({...valid,acknowledgeMonthlyRenewal:"true"}),null);
    }
  }
  for(const bad of [null,undefined,{},[],true,0,
    {sku:"premium",confirmedPricePence:6900,acknowledgeNewPayment:true},
    {sku:"founder",confirmedPricePence:11900,acknowledgeNewPayment:true,acknowledgeMonthlyRenewal:true},
  ]) assert.equal(confirmedNewTestMembershipPurchase(bad),null);
});

test("Stripe test Checkout route enforces consent before provider price retrieval/customer creation",()=>{
  const source=readFileSync(new URL("../server/phase3/memberStripeProviderTestRoutes.ts",import.meta.url),"utf8");
  const pos=source.indexOf('app.post("/api/member-stripe-test/checkout"');
  const checkout=source.slice(pos,source.indexOf('app.get("/api/member-stripe-test/order/',pos));
  assert.ok(pos>=0);
  const intent=checkout.indexOf("confirmedNewTestMembershipPurchase(req.body)");
  const provider=checkout.indexOf("cfg.stripe.prices.retrieve");
  const customer=checkout.indexOf("cfg.stripe.customers.create");
  assert.ok(intent>=0 && intent<provider && intent<customer);
  assert.match(checkout,/reserveTestCheckout\(pool/);
  assert.match(checkout,/checkout\.sessions\.create/);
  assert.ok(checkout.indexOf("reserveTestCheckout(pool")<checkout.indexOf("checkout.sessions.create"),
    "Server checkout reservation must be durable before a payable session is created");
  assert.doesNotMatch(checkout,/subscriptionSchedules\.create|subscriptions\.create/);
});
