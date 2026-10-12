import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { isMemberTestGatewayAllowed } from "../server/phase3/memberStripeProviderTestRoutes";

const isolatedQA={
  IFVA_MEMBER_STRIPE_QA_ENABLED:"true",
  RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",
  RAILWAY_ENVIRONMENT_NAME:"staging",
  NODE_ENV:"production",
};
test("real Stripe membership QA gateway activates only in the dedicated staging project",()=>{
  assert.equal(isMemberTestGatewayAllowed(isolatedQA as any),true);
  for(const change of [
    {IFVA_MEMBER_STRIPE_QA_ENABLED:"false"},
    {RAILWAY_PROJECT_NAME:"Innovator-Founder-visa-Assistant"},
    {RAILWAY_ENVIRONMENT_NAME:"production"},
    {NODE_ENV:"development"},
    {RAILWAY_PROJECT_NAME:"IFVA Phase 2 Isolated QA",RAILWAY_ENVIRONMENT_NAME:"production"},
  ]) {
    assert.equal(isMemberTestGatewayAllowed({...isolatedQA,...change} as any),false,
      "Production or other environments must never mount billing test routes");
  }
  assert.equal(isMemberTestGatewayAllowed({} as any),false);
});

test("QA integration requires dedicated test Stripe credentials, server-side prices and raw signature",()=>{
  const source=readFileSync(new URL("../server/phase3/memberStripeProviderTestRoutes.ts",import.meta.url),"utf8");
  const index=readFileSync(new URL("../server/index.ts",import.meta.url),"utf8");
  const routes=readFileSync(new URL("../server/routes.ts",import.meta.url),"utf8");
  assert.match(source,/IFVA_MEMBER_STRIPE_TEST_SECRET_KEY/);
  assert.match(source,/IFVA_MEMBER_STRIPE_TEST_WEBHOOK_SECRET/);
  assert.match(source,/sk_test_/);
  assert.match(source,/constructEvent\(rawBody,signature,cfg.secret\)/);
  assert.match(source,/stripe\.checkout\.sessions\.create/);
  assert.match(source,/stripe\.prices\.retrieve/);
  assert.match(source,/processSignedTestStripeEvent/);
  assert.match(source,/\/api\/member-stripe-test\/webhook/);
  assert.match(source,/sandboxOnly:true/);
  assert.doesNotMatch(source,/getUncachableStripeClient|STRIPE_SECRET_KEY[^_]/);
  assert.match(index,/req\.rawBody = buf/);
  assert.match(routes,/registerMemberStripeTestRoutes\(app, isAuthenticated, dbPool as PgPool, requireAdmin\)/);
  assert.match(source,/isAuthenticated,requireAdmin,async\(_req,res\)=>/);
  assert.match(source,/\/api\/member-stripe-test\/reviews/);
  assert.match(source,/manualReviewRequired:decision\.action==="review"/);
  const legacy=readFileSync(new URL("../server/stripeClient.ts",import.meta.url),"utf8");
  assert.match(legacy,/ENFORCE_LIVE_MODE = true/);
});

test("test order schema stays outside automatic production app migrations",()=>{
  const route=readFileSync(new URL("../server/phase3/memberStripeProviderTestRoutes.ts",import.meta.url),"utf8");
  assert.match(route,/member_stripe_test_orders/);
  assert.doesNotMatch(route,/UPDATE users|INSERT INTO member_ai_entitlements|stripe\.subscriptions\.create/);
  const schema=readFileSync(new URL("../migrations/qa/20261012_member_stripe_test_ledger.sql",import.meta.url),"utf8");
  assert.match(schema,/CREATE TABLE IF NOT EXISTS member_stripe_test_events/);
  assert.match(schema,/stripe_event_id VARCHAR\(255\) PRIMARY KEY/);
  assert.match(schema,/CREATE TABLE IF NOT EXISTS member_stripe_test_reviews/);
});
