import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { memberUpgradeDescription, effectiveMemberToolPlan } from "../shared/memberToolPlan";
import { safeDefaultMemberOffers } from "../server/services/memberOfferCatalogue";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("new purchases advertise only approved current Founder membership packages",()=>{
 const offers=safeDefaultMemberOffers().offers;
 assert.deepEqual(offers.map(x=>x.id),["founder","founder_pro","founder_pass_90d"]);
 assert.deepEqual(offers.map(x=>x.pricePence),[6900,11900,15900]);
 assert.equal(memberUpgradeDescription("ultimate"),"Founder Pro or 90-Day Pass");
 assert.equal(effectiveMemberToolPlan("founder_pro",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pro",false),"free");
});

test("questionnaire industry templates respect server-verified Pro and Pass tool entitlement",()=>{
 const file=read("client/src/components/QuestionnaireForm.tsx");
 assert.match(file,/hasAccessToTier\('ultimate'\)/);
 assert.match(file,/memberUpgradeDescription\('ultimate'\)/);
 assert.doesNotMatch(file,/Ultimate Plan Required/);
 assert.doesNotMatch(file,/These templates are available on the <strong>Ultimate/);
 assert.doesNotMatch(file,/View Ultimate Plan|Upgrade to Ultimate/);
 assert.doesNotMatch(file,/isTemplatesUnlocked = user\?\.subscriptionTier === 'ultimate'/);
 assert.doesNotMatch(file,/handleEbukaUltimatePlanAutoFill/);
 assert.doesNotMatch(file,/£15 one-time|£29 one-time|£45 one-time|£60 one-time|5-Tier Access Control/);
 assert.match(file,/Only neutral structure was applied|Only neutral structure was applied/);
});

test("main marketing feature comparisons reuse one live server-priced catalogue",()=>{
 for(const path of [
   "client/src/components/EverythingWeOfferSection.tsx",
   "client/src/pages/features-showcase.tsx",
 ]) {
   const code=read(path);
   assert.match(code,/FounderMembershipPlans/);
   assert.doesNotMatch(code,/5 Pricing Tiers|Free to Ultimate access|£9|£19|£35|£49/);
   assert.doesNotMatch(code,/PRICING_PRESENTATION|pricingTiers\.map/);
 }
});

test("other customer access badges show current package names, not legacy plan promos",()=>{
 const premium=read("client/src/pages/premium-features.tsx");
 const documents=read("client/src/pages/documents.tsx");
 const templates=read("client/src/pages/template-library.tsx");
 assert.match(premium,/MINIMUM_MEMBERSHIP\(feature\.tier\)/);
 assert.match(premium,/PACKAGE_NAMES/);
 assert.match(premium,/memberUpgradeDescription/);
 assert.match(documents,/hasAccessToTier\('ultimate'\)/);
 assert.match(documents,/memberUpgradeDescription\('ultimate'\)/);
 assert.doesNotMatch(documents,/available on Ultimate plan/);
 assert.match(templates,/memberUpgradeDescription\(template\.requiredTier as ToolTier\)/);
 assert.doesNotMatch(templates,/\{template\.requiredTier\}\s*<\/Badge>/);
});

test("live checkout and prices remain in one server-owned membership catalogue",()=>{
 const shop=read("client/src/components/FounderMembershipPlans.tsx");
 const offer=read("server/services/memberOfferCatalogue.ts");
 assert.match(shop,/\/api\/member-offers/);
 assert.match(shop,/\/api\/member-stripe-live\/my-membership/);
 assert.match(offer,/founder_pass_90d/);
 // Internal legacy catalogues may still exist for grandfathered access.
 // The checks above only prohibit showing them as purchasable new packages.
});
