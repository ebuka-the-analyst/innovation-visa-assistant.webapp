import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {memberCheckoutEligibilityError} from "../server/phase3/memberLiveCheckoutEligibility";

const customer={id:"customer-verified",isEmailVerified:true,isAdmin:false};
const good={
  acknowledgeLivePayment:true,
  acknowledgeNoVatPrice:true,
  acknowledgeConsumerTerms:true,
  consumerTermsVersion:"consumer-2026-10-v1",
};
const validate=(user:any=customer,sku:any="founder",body:any=good,terms="consumer-2026-10-v1")=>
 memberCheckoutEligibilityError(user,sku,body,terms);

test("verified regular buyer with acknowledged current terms can proceed",()=>{
 assert.equal(validate(),null);
 assert.equal(validate(customer,"founder_pass_90d"),null);
});
test("administrators cannot buy an ordinary customer membership even after confirming terms",()=>{
 const result=validate({...customer,isAdmin:true});
 assert.equal(result?.status,403);
 assert.match(result?.error||"",/administrator accounts cannot purchase/i);
 assert.doesNotMatch(result?.error||"",/VAT/i);
});
test("unverified email explains required action separately from consent",()=>{
 const result=validate({...customer,isEmailVerified:false});
 assert.equal(result?.status,403);
 assert.match(result?.error||"",/verify.*email/i);
});
test("missing or invalid consent fails closed without referencing VAT on-screen",()=>{
 assert.equal(validate(customer,null)?.status,400);
 assert.equal(validate(customer,"founder",{...good,acknowledgeConsumerTerms:false})?.status,400);
 assert.equal(validate(customer,"founder",{...good,acknowledgeNoVatPrice:false})?.status,400);
 assert.doesNotMatch(validate(customer,null)?.error||"",/VAT/i);
});
test("outdated consumer terms trigger a refresh, not a misleading eligibility rejection",()=>{
 const result=validate(customer,"founder",{...good,consumerTermsVersion:"old"});
 assert.equal(result?.status,409);
 assert.match(result?.error||"",/terms have changed/i);
});
test("live route checks eligibility before creating any Stripe customer or Checkout session",()=>{
 const src=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 const guard=src.indexOf("memberCheckoutEligibilityError(");
 const customerCreate=src.indexOf("cfg.stripe.customers.create(");
 assert.ok(guard>0&&customerCreate>guard);
 assert.match(src,/if\(eligibility\)return res\.status\(eligibility\.status\)/);
});
