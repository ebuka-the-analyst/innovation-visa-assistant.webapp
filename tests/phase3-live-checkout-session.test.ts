import assert from "node:assert/strict";
import test from "node:test";
import { recordCreatedLiveCheckout } from "../server/phase3/memberStripeLiveCheckoutReservation";
test("live Stripe checkout session is bound to pre-authorised server order",async()=>{
  const calls:any[]=[];
  const pool={query:async(text:string,args:unknown[])=>{calls.push({text,args});return {rowCount:1}}};
  await recordCreatedLiveCheckout(pool as any,"0ba697ad-ad50-4d5e-a6d0-c6125a72b79e","cs_live_ABC123def456");
  assert.equal(calls.length,1);
  assert.match(calls[0].text,/UPDATE member_stripe_live_orders/);
  assert.equal(calls[0].args[1],"cs_live_ABC123def456");
  assert.equal(calls[0].args[2],"cs_pending_0ba697ad-ad50-4d5e-a6d0-c6125a72b79e");
});
test("sandbox, random, empty or malformed IDs can never bind a live order",async()=>{
  const pool={query:async()=>{throw Error("DB must not be touched by invalid session")}};
  for(const id of ["cs_test_abc123","cs_abc123","","cs_live_","cs_live_<script>"])
    await assert.rejects(recordCreatedLiveCheckout(pool as any,"0ba697ad-ad50-4d5e-a6d0-c6125a72b79e",id),/Expected Stripe LIVE Checkout Session ID/);
});
test("missing trusted order binding always fails closed",async()=>{
  const pool={query:async()=>({rowCount:0})};
  await assert.rejects(recordCreatedLiveCheckout(pool as any,"0ba697ad-ad50-4d5e-a6d0-c6125a72b79e","cs_live_abc123"),/Trusted pending checkout could not be bound/);
});