import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {isMemberPublicCheckoutAllowed} from "../server/phase3/memberStripeLiveRoutes";
import {canStartLiveMembershipCheckout} from "../server/services/memberOfferCatalogue";

const flags={
  IFVA_MEMBER_LIVE_ENABLED:"true",
  IFVA_MEMBER_UK_ONLY_ENABLED:"true",
  IFVA_MEMBER_LIVE_RELEASE_APPROVED:"true",
  IFVA_MEMBER_LIVE_TAX_SIGNOFF:"approved",
  IFVA_MEMBER_LIVE_TAX_BASIS:"uk_not_vat_registered",
  IFVA_MEMBER_LIVE_CONSUMER_TERMS_SIGNOFF:"approved",
  IFVA_MEMBER_LIVE_TERMS_VERSION:"consumer-2026-10-v1",
  RAILWAY_PROJECT_ID:"22a033f9-9732-4499-ae97-b509b17354d9",
  RAILWAY_ENVIRONMENT_ID:"3a9754e3-575c-4e29-b9a3-8af50a5ef823",
  RAILWAY_SERVICE_ID:"a1aa2612-9af3-481a-8e67-4ddb488c56a0",
  RAILWAY_ENVIRONMENT_NAME:"production",
  NODE_ENV:"production",
  IFVA_MEMBERSHIP_PAYMENTS_LIVE_ENABLED:"true",
  IFVA_MEMBERSHIP_LIVE_WEBHOOK_VERIFIED:"true",
  IFVA_MEMBERSHIP_LIVE_FULFILMENT_VERIFIED:"true",
};
test("public paid checkout is independently blocked without verified webhook and entitlement",()=>{
 assert.equal(isMemberPublicCheckoutAllowed({} as any),false);
 for(const flag of Object.keys(flags)){
  const values={...flags,[flag]:undefined};
  assert.equal(isMemberPublicCheckoutAllowed(values as any),false,"Must fail closed without "+flag);
  assert.equal(canStartLiveMembershipCheckout(values as any),false,"Offers cannot announce payability without "+flag);
 }
 assert.equal(isMemberPublicCheckoutAllowed(flags as any),true);
 assert.equal(canStartLiveMembershipCheckout(flags as any),true);
});
test("public availability and server checkout both enforce operational flags",()=>{
 const source=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 assert.match(source,/available:isMemberPublicCheckoutAllowed\(\)/);
 assert.match(source,/if\(!isMemberPublicCheckoutAllowed\(\)\)return res\.status\(503\)/);
 assert.match(source,/app\.post\("\/api\/member-stripe-live\/webhook",async\(req,res\)=>/);
});
