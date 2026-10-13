import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";

const read=(path:string)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("public pricing has one three-card plan list and no duplicated second pricing grid",()=>{
 const plans=read("client/src/components/FounderMembershipPlans.tsx");
 const checkout=read("client/src/components/FounderMembershipCheckout.tsx");
 assert.match(plans,/data\.offers\.map\(/);
 assert.equal((plans.match(/data\.offers\.map\(/g)||[]).length,1);
 assert.match(plans,/FounderMembershipCheckout/);
 assert.match(plans,/setChosenSku\(offer\.id\)/);
 assert.match(checkout,/<Dialog open=\{open&&!!offer\}/);
 assert.doesNotMatch(checkout,/products\.map|displayedProducts|grid-cols-3|Founder memberships<\/h2>/);
 assert.match(checkout,/Confirm \{offer\.name\}/);
 assert.match(checkout,/Continue to Stripe/);
});
test("checkout dialog keeps payment and monthly renewal consent but no UK-only checkbox",()=>{
 const checkout=read("client/src/components/FounderMembershipCheckout.tsx");
 const routes=read("server/phase3/memberStripeLiveRoutes.ts");
 assert.match(checkout,/acknowledgeNewPayment:true/);
 assert.match(checkout,/acknowledgeLivePayment:true/);
 assert.match(checkout,/acknowledgeMonthlyRenewal:/);
 assert.match(checkout,/acknowledgeConsumerTerms:true/);
 assert.doesNotMatch(checkout,/No VAT charged/);
 assert.doesNotMatch(checkout,/acknowledgeUkOnly|setUkOnly|No physical product is shipped|available to UK customers only|United Kingdom/i);
 assert.doesNotMatch(routes,/acknowledgeUkOnly/);
 assert.match(routes,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
});
