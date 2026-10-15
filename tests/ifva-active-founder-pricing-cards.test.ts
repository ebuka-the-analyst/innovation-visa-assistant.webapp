import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 founderMembershipCardAction,FOUNDER_SKU_NAMES,
 type MembershipCheckState,type FounderSku,
} from "../client/src/lib/founderMembershipCardAction";

const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const verified={sku:"founder",active:true,paidThrough:"2026-11-15T00:00:00Z"};
const base={
 cataloguePurchasable:true,
 accountState:"ready" as MembershipCheckState,
 offerCta:"Choose Founder",
 membership:verified,
};
test("Active Founder is visibly Current Plan, cannot re-buy Founder",()=>{
 const a=founderMembershipCardAction({...base,offerSku:"founder"});
 assert.equal(a.text,"Current Plan");
 assert.equal(a.current,true);
 assert.equal(a.disabled,true);
 assert.equal(a.canStartCheckout,false);
 assert.equal(a.help,"current");
});
test("An active Founder cannot buy Founder Pro or 90-Day Pass as duplicate subscriptions",()=>{
 for(const sku of ["founder_pro","founder_pass_90d"] as FounderSku[]){
  const a=founderMembershipCardAction({...base,offerSku:sku});
  assert.equal(a.text,"Plan change requires support");
  assert.equal(a.current,false);
  assert.equal(a.disabled,true);
  assert.equal(a.canStartCheckout,false);
  assert.equal(a.help,"change");
 }
});
test("Other paid SKUs are also blocked from buying again or activating a second package",()=>{
 for(const current of ["founder_pro","founder_pass_90d"] as FounderSku[]){
  for(const offerSku of ["founder","founder_pro","founder_pass_90d"] as FounderSku[]){
   const a=founderMembershipCardAction({...base,offerSku,membership:{...verified,sku:current}});
   assert.equal(a.disabled,true);
   assert.equal(a.canStartCheckout,false);
   assert.equal(a.current,offerSku===current);
  }
 }
});
test("Guest and verified new unpaid accounts can still select memberships",()=>{
 for(const state of ["guest","ready"] as MembershipCheckState[]){
  for(const offerSku of ["founder","founder_pro","founder_pass_90d"] as FounderSku[]){
   const a=founderMembershipCardAction({...base,offerSku,
    accountState:state,membership:state==="ready"?{...verified,active:false}:null,
    offerCta:"Choose "+FOUNDER_SKU_NAMES[offerSku]});
   assert.equal(a.disabled,false);
   assert.equal(a.canStartCheckout,true);
   assert.equal(a.text,"Choose "+FOUNDER_SKU_NAMES[offerSku]);
  }
 }
});
test("Membership query still checking or unavailable fails closed rather than double-charging",()=>{
 for(const state of ["checking","error"] as MembershipCheckState[]){
  const a=founderMembershipCardAction({...base,accountState:state,membership:null,offerSku:"founder"});
  assert.equal(a.disabled,true);
  assert.equal(a.canStartCheckout,false);
 }
 const closed=founderMembershipCardAction({...base,cataloguePurchasable:false,membership:null,offerSku:"founder"});
 assert.equal(closed.canStartCheckout,false);
});
test("Public pricing only shows checkout for genuinely eligible current-account cards",()=>{
 const plans=read("client/src/components/FounderMembershipPlans.tsx");
 const status=read("client/src/components/MyFounderMembership.tsx");
 assert.match(plans,/useAuth\(\)/);
 assert.match(plans,/queryKey:\["\/api\/member-stripe-live\/my-membership"\]/);
 assert.match(plans,/enabled:auth\.isAuthenticated/);
 assert.match(plans,/credentials:"include",cache:"no-store"/);
 assert.match(plans,/accountState==="ready"&&membershipQuery\.data\?\.membership\?\.active===true/);
 assert.match(plans,/founderMembershipCardAction\(/);
 assert.match(plans,/disabled=\{action\.disabled\}/);
 assert.match(plans,/if\(!action\.canStartCheckout\)return/);
 assert.match(plans,/chosenSku&&canPurchase\(chosenSku\)/);
 assert.match(plans,/open=\{chosenSku!==null&&canPurchase\(chosenSku\)\}/);
 assert.match(plans,/Your \{FOUNDER_SKU_NAMES\[activeMembership\.sku/);
 assert.match(plans,/You do not need to purchase again/);
 assert.match(plans,/Contact support/);
 assert.match(plans,/href="#your-founder-membership"/);
 assert.match(status,/id="your-founder-membership"/);
});
