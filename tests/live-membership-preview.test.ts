import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Founder membership preview is visible on home and pricing and cannot initiate checkout",()=>{
 const ui=read("client/src/components/UpcomingMemberships.tsx");
 const home=read("client/src/components/PricingSection.tsx");
 const pricing=read("client/src/pages/pricing.tsx");
 assert.match(home,/<UpcomingMemberships\s*\/>/);
 assert.match(pricing,/<UpcomingMemberships\s*\/>/);
 for(const name of ["Founder","Founder Pro","90-Day Pass"])assert.ok(ui.includes(name));
 for(const price of ["£69","£119","£159"])assert.ok(ui.includes(price));
 for(const key of ["founder","founder_pro","founder_pass_90d"])assert.ok(ui.includes(key));
 assert.match(ui,/Not yet available to purchase/);
 assert.match(ui,/Preview only\. No payment or automatic enrolment/);
 assert.doesNotMatch(ui,/apiRequest|fetch\(|useMutation|checkout|window\.location|stripe\.checkout|stripe\.subscriptions|<Link|<Button/);
});

test("the existing paid catalogue and Stripe checkout flow are still present and untouched",()=>{
 const pricing=read("client/src/pages/pricing.tsx");
 const home=read("client/src/components/PricingSection.tsx");
 assert.match(pricing,/\/api\/payment\/create-checkout/);
 assert.match(pricing,/useCommercialCatalog/);
 assert.match(home,/useCommercialCatalog/);
 assert.match(ui(),/unused plan and add-on credits/);
});
function ui(){return read("client/src/components/UpcomingMemberships.tsx");}
