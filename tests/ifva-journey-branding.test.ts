import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { IFVA_JOURNEY_PHASES, IFVA_JOURNEY_ADDITIONAL } from "../client/src/lib/ifvaJourney";
import { innovatorFounderPath } from "../client/src/lib/innovator-founder-routes";
import { MANAGED_TOOL_DEFINITIONS } from "../shared/commercialCatalog";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const all=[...IFVA_JOURNEY_PHASES.flatMap(p=>p.items),...IFVA_JOURNEY_ADDITIONAL];

test("IFVA journey has five ordered, meaningful preparation phases",()=>{
 assert.deepEqual(IFVA_JOURNEY_PHASES.map(p=>p.number),[1,2,3,4,5]);
 assert.equal(all.length,10);
 assert.equal(new Set(all.map(i=>i.id)).size,all.length);
 assert.equal(new Set(all.map(i=>i.route)).size,all.length);
 assert.ok(IFVA_JOURNEY_PHASES.every(p=>p.title.length>5&&p.description.length>10&&p.items.length>0));
});
test("No legacy vendors, unverified outcomes, included human consultations or invented metrics",()=>{
 const combined=JSON.stringify(IFVA_JOURNEY_PHASES)+JSON.stringify(IFVA_JOURNEY_ADDITIONAL)+read("client/src/pages/features-dashboard.tsx");
 for(const stale of ["TorlyAI","UKInnovator.online","Launchpad","success guarantee","guaranteed endorsement","guaranteed visa","expert coaching and consultants","RFE Defence Lab","real-time visa compliance tracking"]){
   assert.equal(combined.toLowerCase().includes(stale.toLowerCase()),false,stale);
 }
 assert.match(combined,/not included in any IFVA software membership/);
 assert.match(combined,/does not guarantee endorsement or visa approval/);
 assert.match(combined,/not regulated immigration advice/);
 assert.match(combined,/not an immigration-compliance score/);
});
test("Every journey destination resolves to an internal App route (no off-site link)",()=>{
 const app=read("client/src/App.tsx");
 for(const item of all){
  assert.match(item.route,/^\/[a-z0-9/-]+$/);
  assert.ok(!item.route.startsWith("//"));
  assert.ok(app.includes(`innovatorFounderPath("${item.route}")`),
   `App route absent: ${item.route}`);
  assert.equal(innovatorFounderPath(item.route),
   "/uk/innovatorfoundervisaassistant"+item.route);
 }
});
test("Paid tool access indicators match server-maintained managed tool IDs",()=>{
 const known=new Set(MANAGED_TOOL_DEFINITIONS.map(t=>t.id));
 for(const item of all.filter(item=>item.access==="tool")){
  assert.ok(item.toolId,`Missing tool ID for ${item.title}`);
  assert.ok(known.has(item.toolId!),`Unknown tool for access API: ${item.toolId}`);
 }
 const booking=all.find(i=>i.id==="expert-booking")!;
 assert.equal(booking.access,"independent_booking");
 assert.equal(booking.toolId,undefined);
 const builder=all.find(i=>i.id==="business-plan")!;
 assert.equal(builder.access,"plan_credits");
});
test("Frontend fetches actual membership access, never invents plan eligibility",()=>{
 const page=read("client/src/pages/features-dashboard.tsx");
 assert.match(page,/useToolAccess\(auth\.isAuthenticated\)/);
 assert.match(page,/access\.getToolAccess\(item\.toolId\)/);
 assert.match(page,/row\.allowed/);
 assert.match(page,/memberUpgradeDescription\(row\.minimumPlanId\)/);
 assert.match(page,/innovatorFounderPath\(item\.route\)/);
 assert.match(page,/View memberships/);
 assert.match(page,/Separate booking, if available/);
 assert.match(page,/Software memberships do not include individual business-plan consultations/);
 assert.doesNotMatch(page,/window\.location\.href\s*=|window\.open\(/);
});
