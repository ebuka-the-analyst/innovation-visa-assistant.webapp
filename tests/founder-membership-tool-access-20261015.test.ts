import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { effectiveMemberToolPlan,memberUpgradeDescription } from "../shared/memberToolPlan";
import { hasCurrentPaidEntitlement } from "../server/security/paidEntitlement";
import { FALLBACK_COMMERCIAL_CATALOG,hasToolAccess } from "../shared/commercialCatalog";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const now=new Date("2026-10-15T14:00:00Z");
test("newly registered users never unlock paid tools",()=>{
 assert.equal(effectiveMemberToolPlan("free",hasCurrentPaidEntitlement({subscriptionTier:"free"},now)),"free");
 assert.equal(effectiveMemberToolPlan("founder",false),"free");
 assert.equal(effectiveMemberToolPlan("founder_pro",false),"free");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",false),"free");
});
test("verified and unexpired Founder memberships access appropriate legacy tool permissions",()=>{
 const valid=(tier:string)=>hasCurrentPaidEntitlement({
  subscriptionTier:tier,subscriptionStatus:"active",tierExpiresAt:"2026-11-15T00:00:00Z",
 },now);
 assert.equal(effectiveMemberToolPlan("founder",valid("founder")),"premium");
 assert.equal(effectiveMemberToolPlan("founder_pro",valid("founder_pro")),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",valid("founder_pass_90d")),"ultimate");
 for(const sku of ["founder","founder_pro","founder_pass_90d"]){
  const tier=effectiveMemberToolPlan(sku,valid(sku));
  assert.equal(hasToolAccess(FALLBACK_COMMERCIAL_CATALOG,tier,"lawyer-finder"),true,
   "Lawyer Finder must be available to paid "+sku);
 }
});
test("expired, cancelled and fraudulent labels never grant premium tool access",()=>{
 for(const sku of ["founder","founder_pro","founder_pass_90d"]){
  for(const fake of [
   {subscriptionStatus:"cancelled",tierExpiresAt:"2026-11-15"},
   {subscriptionStatus:"active",tierExpiresAt:"2026-10-14"},
   {subscriptionStatus:"active",tierExpiresAt:null},
   {subscriptionStatus:"pending",tierExpiresAt:"2026-11-15"},
  ]){
   const user={subscriptionTier:sku,...fake};
   assert.equal(effectiveMemberToolPlan(sku,hasCurrentPaidEntitlement(user,now)),"free",JSON.stringify(user));
  }
 }
 assert.equal(effectiveMemberToolPlan("founder_pro",false),"free");
 assert.equal(effectiveMemberToolPlan("invented-vip",true),"free");
 assert.equal(effectiveMemberToolPlan(null,true),"free");
});
test("grandfathered legacy subscribers require active status and get no silent upgrade",()=>{
 assert.equal(effectiveMemberToolPlan("basic",true),"basic");
 assert.equal(effectiveMemberToolPlan("premium",true),"premium");
 assert.equal(effectiveMemberToolPlan("enterprise",true),"enterprise");
 assert.equal(effectiveMemberToolPlan("ultimate",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("ultimate",false),"free");
});
test("tool API, tool-progress API and route middleware use the same verified paid access source",()=>{
 const api=read("server/routes.ts"),middleware=read("server/middleware/requireToolAccess.ts");
 assert.equal((api.match(/effectiveMemberToolPlan\(/g)||[]).length,2);
 assert.equal((api.match(/hasCurrentPaidEntitlement\(freshUser\)/g)||[]).length,2);
 assert.match(middleware,/effectiveMemberToolPlan\(/);
 assert.match(middleware,/hasCurrentPaidEntitlement\(user\)/);
 const hook=read("client/src/hooks/useTierAccess.ts");
 assert.match(hook,/verifiedToolAccess\.data\?\.userPlanId/);
 assert.doesNotMatch(hook,/user\?\.subscriptionTier as UserTier/);
});
test("Lawyer Finder upsell uses current Founder packages without legacy sales promises",()=>{
 assert.equal(memberUpgradeDescription("basic"),"Founder, Founder Pro or 90-Day Pass");
 assert.equal(memberUpgradeDescription("premium"),"Founder, Founder Pro or 90-Day Pass");
 assert.equal(memberUpgradeDescription("ultimate"),"Founder Pro or 90-Day Pass");
 const gate=read("client/src/components/ToolAccessGuard.tsx");
 const overlay=read("client/src/components/SoftUpgradeOverlay.tsx");
 assert.match(gate,/An active paid membership is required to use this tool/);
 assert.match(gate,/memberUpgradeDescription\(effectiveRequiredTier\)/);
 assert.match(gate,/onClick=\{\(\)=>setLocation\("\/pricing"\)\}/);
 assert.doesNotMatch(gate,/PremiumUpgradeOverlay|Basic Plan|requires the <strong>/);
 assert.match(overlay,/memberUpgradeDescription\(requiredTier\)/);
 assert.doesNotMatch(overlay,/personal strategist|success guarantee|one-time payment|requiredTierPrice/i);
});
