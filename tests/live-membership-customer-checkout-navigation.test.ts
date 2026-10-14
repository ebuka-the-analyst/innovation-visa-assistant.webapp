import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {
 membershipLoginHref,membershipSignupHref,membershipPurchaseReturn,safeMembershipReturn
} from "../client/src/lib/memberPurchaseNavigation";
import {memberCheckoutEligibilityError} from "../server/phase3/memberLiveCheckoutEligibility";

const read=(path:string)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const skus=["founder","founder_pro","founder_pass_90d"] as const;

test("all three pricing offers return to the exact selected plan after login or registration",()=>{
 for(const sku of skus){
  const plan=membershipPurchaseReturn(sku);
  assert.equal(plan,"/pricing?membership_sku="+sku);
  assert.equal(safeMembershipReturn(new URL(membershipLoginHref(sku),"https://example.test").search),plan);
  assert.equal(safeMembershipReturn(new URL(membershipSignupHref(sku),"https://example.test").search),plan);
 }
});
test("login return is strictly locked to membership URL with no open redirect",()=>{
 for(const next of [
  "https://example.com","//example.com","/admin-dashboard","/pricing",
  "/pricing?membership_sku=fake","/pricing?membership_sku=founder&admin=true",
  "/pricing?membership_sku=founder#pwn","/pricing?membership_sku=founder_pro%0A",
  "/pricing?membership_sku=founder&membership_sku=founder_pro",
  "/pricing?membership_sku=founder/../admin",
 ]){
  assert.equal(safeMembershipReturn("?next="+encodeURIComponent(next)),null,next);
 }
 assert.equal(safeMembershipReturn(""),null);
 assert.throws(()=>membershipPurchaseReturn("unsafe" as any));
});
test("normal verified customer passes live eligibility while admin and anonymous cannot pay",()=>{
 const sku="founder";
 const body={acknowledgeLivePayment:true,acknowledgeNoVatPrice:true,
  acknowledgeConsumerTerms:true,consumerTermsVersion:"consumer-2026-10-v1"};
 const verdict=(user:any)=>memberCheckoutEligibilityError(user,sku,body,"consumer-2026-10-v1");
 assert.equal(verdict({id:"regular",isAdmin:false,isEmailVerified:true}),null);
 assert.equal(verdict({id:"administrator",isAdmin:true,isEmailVerified:true})?.status,403);
 assert.equal(verdict({id:"unverified",isAdmin:false,isEmailVerified:false})?.status,403);
 assert.equal(verdict(null)?.status,401);
});
test("modal checks authenticated customer before displaying payment consent or calling Stripe",()=>{
 const ui=read("client/src/components/FounderMembershipCheckout.tsx");
 assert.match(ui,/fetch\("\/api\/auth\/user",\{credentials:"include",cache:"no-store"\}\)/);
 assert.match(ui,/user\.isAdmin===true\?"admin"/);
 assert.match(ui,/user\.isEmailVerified!==true\?"verify_email"/);
 assert.match(ui,/authState==="signed_out"/);
 assert.match(ui,/authState==="admin"/);
 assert.match(ui,/authState==="verify_email"/);
 assert.match(ui,/authState==="customer"&&<>/);
 assert.match(ui,/authState!=="customer"\|\|!available/);
 assert.match(ui,/membershipLoginHref\(offer\.id\)/);
 assert.match(ui,/membershipSignupHref\(offer\.id\)/);
 assert.match(ui,/if\(response\.status===401\)/);
 assert.match(ui,/acknowledgeMonthlyRenewal/);
 assert.match(ui,/acknowledgeConsumerTerms:true/);
 const auth=read("client/src/pages/login.tsx");
 assert.match(auth,/safeMembershipReturn\(window\.location\.search\)/);
 assert.match(auth,/membershipReturn \|\| innovatorFounderPath\("\/dashboard"\)/);
 const signup=read("client/src/pages/signup.tsx");
 assert.match(signup,/safeMembershipReturn\(search\)/);
 assert.match(signup,/const loginHref=/);
});
test("hotfix does not weaken UK-only gateway or paid-entitlement webhook",()=>{
 const live=read("server/phase3/memberStripeLiveRoutes.ts");
 assert.match(live,/isMemberPublicCheckoutAllowed/);
 assert.match(live,/isVerifiedUkMembershipCheckout/);
 assert.match(live,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(live,/processSignedLiveStripeEvent/);
 assert.match(live,/memberCheckoutEligibilityError/);
 const ui=read("client/src/components/FounderMembershipCheckout.tsx");
 assert.match(ui,/body\.url\.startsWith\("https:\/\/checkout\.stripe\.com\/"/);
});
