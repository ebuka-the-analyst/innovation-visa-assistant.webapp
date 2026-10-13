import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
test("customer billing actions are authenticated and ownership checked",()=>{
 assert.match(src,/app\.post\("\/api\/member-stripe-live\/cancel",isAuthenticated/);
 assert.match(src,/app\.get\("\/api\/member-stripe-live\/my-membership",isAuthenticated/);
 assert.match(src,/WHERE id=\$1 AND user_id=\$2 AND currently_active=true/);
 assert.match(src,/cancel_at_period_end:true,proration_behavior:"none"/);
 assert.match(src,/sub\.livemode!==true/);
 assert.match(src,/asId\(sub\.customer\)!==order\.stripe_customer_id/);
 assert.match(src,/if\(!isMemberLiveGatewayAllowed\(\)\)/);
 assert.match(src,/app\.post\("\/api\/member-stripe-live\/cancel",unavailable\)/);
 assert.match(src,/app\.get\("\/api\/member-stripe-live\/my-membership",unavailable\)/);
});
test("customer UI cannot charge when release disabled, and requires explicit recurring consent",()=>{
 const s=readFileSync(new URL("../client/src/components/FounderMembershipCheckout.tsx",import.meta.url),"utf8");
 assert.match(s,/!available\|\|!termsVersion\|\|!acknowledge/);
 assert.match(s,/acknowledgeMonthlyRenewal:/);
 assert.match(s,/acknowledgeLivePayment:true/);
 assert.match(s,/acknowledgeConsumerTerms:true/);
 assert.match(s,/consumerTermsVersion:termsVersion/);
 assert.match(s,/Not yet available/);
});
test("customer cancellation UI needs explicit confirmation and does not promise refunds",()=>{
 const s=readFileSync(new URL("../client/src/components/MyFounderMembership.tsx",import.meta.url),"utf8");
 assert.match(s,/window\.confirm/);
 assert.match(s,/membership\.canCancel/);
 assert.match(s,/Cancellation does not automatically refund a paid period/);
});
