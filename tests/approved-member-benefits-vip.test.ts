import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { effectiveMemberToolPlan } from "../shared/memberToolPlan";
import { hasCurrentPaidEntitlement } from "../server/security/paidEntitlement";

const read=(path:string)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const future=new Date("2027-01-01T00:00:00Z");
const past=new Date("2026-01-01T00:00:00Z");

test("new membership tier mapping grants only the approved tools and fails closed",()=>{
 assert.equal(effectiveMemberToolPlan("founder",true),"premium");
 assert.equal(effectiveMemberToolPlan("founder_pro",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pro",false),"free");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",false),"free");
 assert.equal(effectiveMemberToolPlan("unknown",true),"free");
 assert.equal(effectiveMemberToolPlan("basic",true),"basic");
});

test("paid-through enforcement blocks stale, disputed, and cancelled memberships",()=>{
 const now=new Date("2026-10-14T00:00:00Z");
 assert.equal(hasCurrentPaidEntitlement({subscriptionTier:"founder_pro",subscriptionStatus:"active",tierExpiresAt:future},now),true);
 for(const status of ["cancelled","past_due","inactive"]){
  assert.equal(hasCurrentPaidEntitlement({subscriptionTier:"founder_pro",subscriptionStatus:status,tierExpiresAt:future},now),false);
 }
 assert.equal(hasCurrentPaidEntitlement({subscriptionTier:"founder_pro",subscriptionStatus:"active",tierExpiresAt:past},now),false);
 assert.equal(hasCurrentPaidEntitlement({subscriptionTier:"founder_pro",subscriptionStatus:"active"},now),false);
});

test("server tool-list and run guard share paid-entitlement mapping",()=>{
 const routes=read("server/routes.ts");
 const gate=read("server/middleware/requireToolAccess.ts");
 assert.match(routes,/effectiveMemberToolPlan\(\s*freshUser.subscriptionTier, hasCurrentPaidEntitlement\(freshUser\)/);
 assert.match(gate,/effectiveMemberToolPlan\(\s*user.subscriptionTier, hasCurrentPaidEntitlement\(user\)/);
 const hook=read("client/src/hooks/useTierAccess.ts");
 assert.match(hook,/verifiedToolAccess\.data\?\.userPlanId/);
});

test("VIP support uses verified entitlement and a genuine priority-backed queue",()=>{
 const routes=read("server/routes.ts");
 const storage=read("server/storage.ts");
 assert.match(routes,/freshSupportUser.subscriptionTier === "founder_pro"/);
 assert.match(routes,/hasCurrentPaidEntitlement\(freshSupportUser\)/);
 assert.match(routes,/priority: isVip \? "high" : "normal"/);
 assert.match(routes,/\[VIP PRIORITY\]/);
 assert.match(storage,/supportTickets.priority/);
 assert.match(storage,/supportTickets.status/);
});

test("approved server-owned sales copy includes all 3 complete offers",()=>{
 const offer=read("server/services/memberOfferCatalogue.ts");
 const pricing=read("client/src/components/FounderMembershipPlans.tsx");
 const css=read("client/src/styles/ifvaMembershipPricing.css");
 for(const fragment of [
  "pricePence:6900","pricePence:11900","pricePence:15900",
  "VIP priority customer support","Full access to all available premium AI preparation tools",
  "Up to 6 business plans and 45 revisions over 90 days",
  "Start Building My Future","Unlock My Full Potential","Begin My 90-Day Journey",
 ]) assert.ok(offer.includes(fragment),fragment);
 assert.match(offer,/APPROVED_MEMBER_PRESENTATION\[o.id\]/);
 assert.match(pricing,/className="ifva-cards"/);
 assert.match(pricing,/data\.offers\.map\(/);
 assert.match(pricing,/disabled=\{!data.purchasable\}/);
 assert.match(pricing,/FounderMembershipCheckout/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.doesNotMatch(pricing,/No VAT charged|Free Plan|Ultimate Plan/);
});

test("real checkout remains behind legal/tax gates; presentation cannot trigger payment",()=>{
 const c=read("server/phase3/memberStripeLiveRoutes.ts");
 assert.match(c,/isMemberPublicCheckoutAllowed\(\)/);
 assert.match(c,/IFVA_MEMBER_LIVE_TAX_SIGNOFF/);
 assert.match(c,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
});
