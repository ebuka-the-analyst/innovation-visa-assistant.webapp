import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {isMemberLiveGatewayAllowed} from "../server/phase3/memberStripeLiveRoutes";
const base={
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
};
test("live membership is off by default and fails closed without any independent approval",()=>{
 assert.equal(isMemberLiveGatewayAllowed({} as any),false);
 for(const key of Object.keys(base)){
  assert.equal(isMemberLiveGatewayAllowed({...base,[key]:undefined} as any),false,"Missing "+key+" must disable live Checkout");
 }
 assert.equal(isMemberLiveGatewayAllowed({...base,RAILWAY_PROJECT_ID:"dbec1752-9b2a-4473-8fab-ddae38310c26"} as any),false);
 assert.equal(isMemberLiveGatewayAllowed({...base,RAILWAY_ENVIRONMENT_NAME:"staging"} as any),false);
 assert.equal(isMemberLiveGatewayAllowed({...base,RAILWAY_SERVICE_ID:"af33a267-7266-4893-b310-5f63c6275dbe"} as any),false);
 assert.equal(isMemberLiveGatewayAllowed(base as any),true);
});
test("live route uses separate production tables, keys, verified customer consent and live signature",()=>{
 const source=readFileSync(new URL("../server/phase3/memberStripeLiveRoutes.ts",import.meta.url),"utf8");
 assert.match(source,/\(\?:sk\|rk\)_live_/);
 const preflight=readFileSync(new URL("../server/scripts/check-live-membership-readiness.cjs",import.meta.url),"utf8");
 assert.match(preflight,/\(\?:sk\|rk\)_live_/);
 assert.match(source,/IFVA_MEMBER_STRIPE_LIVE_WEBHOOK_SECRET/);
 assert.match(source,/IFVA_MEMBER_STRIPE_LIVE_FOUNDER_PRICE_ID/);
 assert.match(source,/IFVA_MEMBER_STRIPE_LIVE_PRO_PRICE_ID/);
 assert.match(source,/IFVA_MEMBER_STRIPE_LIVE_PASS_PRICE_ID/);
 assert.match(source,/isVerifiedMemberLegalSeller\(account\)/);
 assert.match(source,/req\.body\?\.acknowledgeLivePayment !== true/);
 assert.match(source,/req\.body\?\.acknowledgeNoVatPrice !== true/);
 assert.match(source,/req\.body\?\.acknowledgeConsumerTerms !== true/);
 assert.match(source,/price\.tax_behavior!=="unspecified"/);
 assert.match(source,/automatic_tax:\{enabled:false\}/);
 assert.match(source,/shipping_address_collection:\{allowed_countries:\["GB"\]\}/);
 assert.match(source,/acknowledgeUkOnly/);
 assert.match(source,/customer_update:\{address:"auto"\}/);
 assert.match(source,/constructEvent\(rawBody,signature,cfg\.secret\)/);
 assert.match(source,/event\.livemode!==true/);
 assert.match(source,/member_stripe_live_orders/);
 assert.doesNotMatch(source,/member_stripe_test_|\/api\/member-stripe-test\/|sandboxOnly:true/);
});
test("SQL introduces isolated empty live-only order and webhook ledgers",()=>{
 const migration=readFileSync(new URL("../migrations/app/20261013_member_stripe_live_ledger.sql",import.meta.url),"utf8");
 assert.match(migration,/CREATE TABLE IF NOT EXISTS member_stripe_live_orders/);
 assert.match(migration,/CREATE TABLE IF NOT EXISTS member_stripe_live_events/);
 assert.match(migration,/CREATE TABLE IF NOT EXISTS member_stripe_live_invoice_payments/);
 assert.match(migration,/CREATE TABLE IF NOT EXISTS member_stripe_live_reviews/);
 assert.doesNotMatch(migration,/member_stripe_test_/);
});
