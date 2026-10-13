import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Customer return never grants or claims membership access from query parameters",()=>{
 const s=readFileSync(new URL("../client/src/components/FounderMembershipPaymentReturn.tsx",import.meta.url),"utf8");
 assert.match(s,/orderId/);
 assert.match(s,/fetch\("\/api\/member-stripe-live\/order\//);
 assert.match(s,/payload\.active===true/);
 assert.match(s,/payload\?\.liveMode===true/);
 assert.match(s,/payload\?\.orderId===orderId/);
 assert.match(s,/Do not pay again/);
 assert.match(s,/response\.status===404\|\|response\.status===401/);
});
test("Stripe success and cancellation redirect to pricing and show verification",()=>{
 const routes=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 const client=readFileSync(new URL("../client/src/components/FounderMembershipCheckout.tsx",import.meta.url),"utf8");
 assert.match(routes,/\/pricing\?membership_order=/);
 assert.doesNotMatch(routes,/\/uk\/innovatorfoundervisaassistant\/dashboard\?membership_order=/);
 assert.match(client,/FounderMembershipPaymentReturn/);
});
