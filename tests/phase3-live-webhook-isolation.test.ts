import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";

const webhook=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");

test("Stripe account-wide events for expert bookings cannot become failed membership events",()=>{
  assert.match(webhook,/looksLikeMemberEvent=obj\.metadata\?\.ifvaMembershipLive==="true"/);
  assert.match(webhook,/looksLikeMemberEvent \|\|= subscription\.metadata\?\.ifvaMembershipLive==="true"/);
  assert.match(webhook,/customer\.metadata\?\.ifvaMembershipLive==="true"/);
  assert.match(webhook,/if\(rows\.length===0 && !looksLikeMemberEvent\)\s*return res\.json\(\{received:true,ignored:true\}\)/);
  const ignored=webhook.indexOf("if(rows.length===0 && !looksLikeMemberEvent)");
  const unmatched=webhook.indexOf("await recordUnmatchedSignedLiveEvent(pool,rawBody,signature,cfg.secret");
  assert.ok(ignored>0 && unmatched>ignored,"Unrelated event must be ignored before unmatched-event retry path");
});
test("member-tagged unmatched events are still retried, never acknowledged as paid",()=>{
  assert.match(webhook,/if\(rows\.length!==1\) \{/);
  assert.match(webhook,/Trusted live order not yet reconciled; retry/);
  assert.match(webhook,/event\.livemode!==true/);
  assert.match(webhook,/constructEvent\(rawBody,signature,cfg\.secret\)/);
});
