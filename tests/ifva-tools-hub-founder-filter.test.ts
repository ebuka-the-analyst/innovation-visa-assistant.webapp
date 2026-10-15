import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PLAN_IDS,PLAN_RANK,type PlanId } from "../shared/commercialCatalog";
import { MEMBER_TOOL_PLAN } from "../shared/memberToolPlan";
import { PUBLIC_MEMBER_FILTERS,membershipIncludesMinimumPlan,toolMembershipAvailability } from "../shared/memberToolVisibility";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const allLegacy=PLAN_IDS;

test("Public Tools Hub contains only the current four membership options",()=>{
 assert.deepEqual(PUBLIC_MEMBER_FILTERS.map(x=>x.id),[
  "free","founder","founder_pro","founder_pass_90d"]);
 assert.deepEqual(PUBLIC_MEMBER_FILTERS.map(x=>x.label),[
  "Free","Founder","Founder Pro","90-Day Pass"]);
 const src=read("client/src/pages/tools-hub.tsx");
 assert.match(src,/Membership<\/label>/);
 assert.match(src,/All Memberships/);
 assert.match(src,/PUBLIC_MEMBER_FILTERS\.map/);
 assert.doesNotMatch(src,/<SelectItem value="basic"|<SelectItem value="premium"/);
 assert.doesNotMatch(src,/const tiers: ToolTier\[\]/);
 assert.doesNotMatch(src,/const tierLabels\s*=/);
 assert.match(src,/setMembershipFilter\\(""/);
});

test("For each legacy minimum plan, correct paid memberships include it, with no access grants",()=>{
 for(const minimum of allLegacy){
  const rank=PLAN_RANK[minimum];
  assert.equal(membershipIncludesMinimumPlan(minimum,"free"),rank<=PLAN_RANK.free);
  assert.equal(membershipIncludesMinimumPlan(minimum,"founder"),rank<=PLAN_RANK[MEMBER_TOOL_PLAN.founder]);
  assert.equal(membershipIncludesMinimumPlan(minimum,"founder_pro"),rank<=PLAN_RANK[MEMBER_TOOL_PLAN.founder_pro]);
  assert.equal(membershipIncludesMinimumPlan(minimum,"founder_pass_90d"),rank<=PLAN_RANK[MEMBER_TOOL_PLAN.founder_pass_90d]);
 }
 assert.equal(membershipIncludesMinimumPlan(undefined,"founder"),false);
 assert.equal(membershipIncludesMinimumPlan("unknown" as PlanId,"founder"),false);
 assert.equal(membershipIncludesMinimumPlan("basic","fake" as any),false);
});

test("Specific tool badges name only eligible current IFVA membership packages",()=>{
 assert.equal(toolMembershipAvailability("free"),"Free · Founder · Founder Pro · 90-Day Pass");
 assert.equal(toolMembershipAvailability("basic"),"Founder · Founder Pro · 90-Day Pass");
 assert.equal(toolMembershipAvailability("premium"),"Founder · Founder Pro · 90-Day Pass");
 assert.equal(toolMembershipAvailability("enterprise"),"Founder Pro · 90-Day Pass");
 assert.equal(toolMembershipAvailability("ultimate"),"Founder Pro · 90-Day Pass");
 assert.equal(toolMembershipAvailability(undefined),"Check membership access");
});

test("Tools filter reads each tool minimum from server access, not tool metadata or user plan label",()=>{
 const src=read("client/src/pages/tools-hub.tsx");
 assert.match(src,/const entitlement = getToolAccess\(tool\.id\)/);
 assert.match(src,/membershipIncludesMinimumPlan\(entitlement\.minimumPlanId,membershipFilter\)/);
 assert.match(src,/entitlement\.available !== false/);
 assert.match(src,/entitlement\.listed !== false/);
 assert.match(src,/const hasAccess = canAccessManagedTool\(tool\)/);
 assert.match(src,/getToolAccess\(tool\.id\)\?\.allowed === true/);
 assert.match(src,/setLockedToolInfo\(/);
 assert.match(src,/toolMembershipAvailability\(effectiveTier\)/);
 assert.doesNotMatch(src,/setLocation\(\x60\/checkout/);
});
