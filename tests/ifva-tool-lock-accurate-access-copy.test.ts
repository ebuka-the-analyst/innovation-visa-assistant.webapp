import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { FALLBACK_COMMERCIAL_CATALOG,hasToolAccess } from "../shared/commercialCatalog";
import { effectiveMemberToolPlan, memberUpgradeDescription } from "../shared/memberToolPlan";
const read=(path:string)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Regulatory Copilot remains restricted to verified Founder Pro or Pass",()=>{
 const minimum=FALLBACK_COMMERCIAL_CATALOG.minimumPlanByTool["regulatory-copilot"];
 assert.equal(minimum,"enterprise");
 assert.equal(hasToolAccess(FALLBACK_COMMERCIAL_CATALOG,effectiveMemberToolPlan("founder",true),"regulatory-copilot"),false);
 assert.equal(hasToolAccess(FALLBACK_COMMERCIAL_CATALOG,effectiveMemberToolPlan("founder_pro",true),"regulatory-copilot"),true);
 assert.equal(hasToolAccess(FALLBACK_COMMERCIAL_CATALOG,effectiveMemberToolPlan("founder_pass_90d",true),"regulatory-copilot"),true);
 assert.equal(hasToolAccess(FALLBACK_COMMERCIAL_CATALOG,effectiveMemberToolPlan("founder",false),"regulatory-copilot"),false);
 assert.equal(memberUpgradeDescription(minimum),"Founder Pro or 90-Day Pass");
});

test("Locked tool messaging handles active but insufficient tiers, inactive and verification errors separately",()=>{
 const src=read("client/src/components/ToolAccessGuard.tsx");
 assert.match(src,/managedEntitlement\?\.allowed===true/);
 assert.match(src,/verifiedAccess\?\.userPlanId/);
 assert.match(src,/isToolAccessError/);
 assert.match(src,/verificationFailed \? <>/);
 assert.match(src,/hasVerifiedPaidPlan \? <>/);
 assert.match(src,/does not include this tool/);
 assert.match(src,/An active paid membership is required to use this tool/);
 assert.match(src,/No current paid entitlement/);
 assert.match(src,/We could not verify access/);
 assert.match(src,/Do not start a second checkout/);
 assert.match(src,/refetchToolAccess\(\)/);
});
test("Regulatory Copilot locked action is short, wraps and does not overlap Back link",()=>{
 const src=read("client/src/components/ToolAccessGuard.tsx");
 assert.match(src,/Review membership options/);
 assert.doesNotMatch(src,/View memberships to unlock \{toolName\}/);
 assert.match(src,/flex flex-col items-center justify-center gap-3 sm:flex-row/);
 assert.match(src,/min-w-0 whitespace-normal/);
 assert.match(src,/break-words/);
 assert.match(src,/data-testid="button-back-hub"/);
 assert.match(src,/onClick=\{\(\)=>setLocation\("\/pricing"\)\}/);
 assert.match(src,/onClick=\{\(\)=>setLocation\("\/tools-hub"\)\}/);
});
