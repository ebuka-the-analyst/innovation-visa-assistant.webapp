const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const text=fs.readFileSync(require.resolve("../server/scripts/check-member-live-checkout-nocharge.cjs"),"utf8");
test("no-charge live Checkout test is one-time opt-in and leaves all payments unpaid",()=>{
 assert.match(text,/IFVA_MEMBER_NOCHARGE_SMOKE_RUN!=="true"/);
 assert.match(text,/stripe\.checkout\.sessions\.create\(/);
 assert.match(text,/stripe\.checkout\.sessions\.expire\(/);
 assert.match(text,/stripe\.customers\.del\(/);
 assert.match(text,/session\.payment_status!=="unpaid"/);
 assert.doesNotMatch(text,/stripe\.paymentIntents\.create\(/);
 assert.doesNotMatch(text,/stripe\.charges\.create\(/);
 assert.doesNotMatch(text,/completeCheckout|applyVerifiedLiveMembershipEntitlement/);
 assert.doesNotMatch(text,/IFVA_MEMBER_LIVE_ENABLED\s*=/);
});
test("no-charge test covers both payment and subscription Checkout",()=>{
 assert.match(text,/\["founder","IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID","subscription"\]/);
 assert.match(text,/\["founder_pass_90d","IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID","payment"\]/);
 assert.match(text,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(text,/billing_address_collection:"required"/);
});
