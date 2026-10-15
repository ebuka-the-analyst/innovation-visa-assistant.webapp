import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const source=read("client/src/pages/tools-hub.tsx");
const main=source.slice(source.indexOf("filteredTools.map((tool) => {"));

test("Tool actions and original tool icon have distinct non-overlapping positions",()=>{
  assert.ok(main.includes('data-testid={`tool-icon-row-${tool.id}`}'));
  assert.ok(main.includes('data-testid={`tool-icon-${tool.id}`}'));
  assert.ok(main.includes('data-testid={`tool-actions-${tool.id}`}'));
  assert.ok(main.includes('mb-4 flex w-full min-w-0 items-center justify-between gap-3'));
  assert.ok(main.includes('flex shrink-0 items-center gap-2'));
  assert.doesNotMatch(main,/absolute top-3 right-3 flex items-center gap-1/);
  assert.equal((main.match(/<GetIconComponent name={tool.icon} \/>/g)||[]).length,1);
});
test("Favourite heart is always visible, including keyboard focus and phone/touch use",()=>{
  assert.ok(main.includes('data-testid={`favorite-button-${tool.id}`}'));
  assert.match(main,/aria-pressed=\{isFavorite\(tool.id\)\}/);
  assert.match(main,/opacity-100 transition-colors/);
  assert.match(main,/focus-visible:ring-2 focus-visible:ring-primary/);
  assert.doesNotMatch(source,/opacity-0 group-hover:opacity-100/);
  assert.match(source,/event\.stopPropagation\(\)/);
  assert.match(main,/fill-red-600 text-red-600/);
});
test("Locked status uses red and verified accessible status remains green",()=>{
  assert.ok(main.includes('data-testid={`lock-${tool.id}`}'));
  assert.ok(main.includes('data-testid={`unlocked-${tool.id}`}'));
  assert.match(main,/rounded-full bg-red-600 text-white/);
  assert.match(main,/rounded-full bg-green-600 text-white/);
  assert.doesNotMatch(main,/bg-orange-500 text-white/);
  assert.match(main,/const hasAccess = canAccessManagedTool\(tool\)/);
});
test("Footer remains on one aligned, unwrapped bottom row",()=>{
  assert.match(main,/flex h-full min-w-0 flex-col p-6/);
  assert.match(main,/flex min-h-0 min-w-0 flex-1 flex-col/);
  assert.match(main,/mt-auto flex min-w-0 flex-nowrap items-center gap-2 border-t pt-3/);
  assert.match(main,/min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg/);
  assert.ok(main.includes('data-testid={`tool-footer-${tool.id}`}'));
  assert.ok(main.includes("Free · Founder · Founder Pro · 90-Day Pass"));
  assert.match(main,/toolMembershipAvailability\(effectiveTier\)/);
});
