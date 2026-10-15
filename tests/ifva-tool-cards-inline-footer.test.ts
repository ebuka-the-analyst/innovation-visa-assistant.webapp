import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(path:string)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const hub=read("client/src/pages/tools-hub.tsx");

test("Tool cards align footer at bottom and stage and membership on the same row",()=>{
  assert.match(hub,/grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6/);
  assert.match(hub,/flex h-full min-w-0 flex-col p-6 hover-elevate/);
  assert.match(hub,/flex min-h-0 min-w-0 flex-1 flex-col/);
  assert.match(hub,/flex flex-1 items-start justify-between gap-3 pb-5/);
  assert.match(hub,/mt-auto flex min-w-0 flex-nowrap items-center gap-2 border-t pt-3/);
  assert.match(hub,/data-testid={`tool-footer-${tool.id}`}/);
  assert.match(hub,/inline-flex shrink-0 items-center whitespace-nowrap/);
});

test("All full membership labels remain one line and accessible on narrow widths",()=>{
  assert.match(hub,/min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg/);
  assert.match(hub,/title={membershipLabel}/);
  assert.match(hub,/aria-label={membershipLabel}/);
  assert.match(hub,/Free · Founder · Founder Pro · 90-Day Pass/);
  assert.match(hub,/toolMembershipAvailability\(effectiveTier\)/);
  assert.match(hub,/data-testid={`badge-tier-${tool.id}`}/);
  assert.doesNotMatch(hub,/whitespace-normal leading-5/);
  assert.doesNotMatch(hub,/flex flex-wrap gap-2 pt-3 border-t/);
});

test("The cosmetic footer change preserves verified tool permissions and public routes",()=>{
  assert.match(hub,/const hasAccess = canAccessManagedTool\(tool\)/);
  assert.match(hub,/OPEN_ACCESS_TOOL_IDS\.has\(tool\.id\) \|\| getToolAccess\(tool\.id\)\?\.allowed === true/);
  assert.match(hub,/membershipIncludesMinimumPlan\(entitlement\.minimumPlanId,membershipFilter\)/);
  assert.match(hub,/const openRoute = OPEN_ACCESS_ROUTES\[tool\.id\]/);
  assert.match(hub,/setLockedToolInfo\(/);
});
