import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasCurrentPaidEntitlement } from "../server/security/paidEntitlement";
import { gatewayUsageEvent, gatewayWorkload } from "../server/aiGatewayUsage";
import { getSectionsForTier } from "../server/aiPrompts";
import { BUSINESS_PLAN_MODEL } from "../server/aiModelConfig";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("paid access checks status, expiry and legacy nonexpiring entitlements", () => {
  const now = new Date("2026-10-11T17:00:00Z");
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active" }, now), true);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "2026-10-11T17:00:01Z" }, now), true);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "2026-10-11T17:00:00Z" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "cancelled" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "bad-date" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "free", subscriptionStatus: "inactive" }, now), true);
});

test("gateway usage metadata excludes inputs and uses reported tokens", () => {
  const example = {
    model: "gpt-6-astra",
    provider: "openai",
    usage: {
      input_tokens: 10000,
      output_tokens: 2000,
      output_tokens_details: { reasoning_tokens: 650 },
    },
    output_text: "CONFIDENTIAL CUSTOMER DOCUMENT",
  };
  const event = gatewayUsageEvent(example, "responses", gatewayWorkload("business_plan_generation"), 450, "12345678-1234-1234-1234-123456789abc");
  assert.equal(event.jobId, "12345678-1234-1234-1234-123456789abc");
  assert.equal(event.inputTokens, 10000);
  assert.equal(event.outputTokens, 2000);
  assert.equal(event.reasoningTokens, 650);
  assert.equal(event.costGbp, null);
  assert.doesNotMatch(JSON.stringify(event), /CONFIDENTIAL|output_text|apiKey|prompt/i);
  assert.equal(gatewayWorkload("some-other-user-input"), "other");
  assert.equal(gatewayUsageEvent(example, "responses", "other", 5, "bad value").jobId, null);
});

test("Free tier uses a limited preview template instead of Enterprise sections", () => {
  const free = getSectionsForTier("free");
  const enterprise = getSectionsForTier("enterprise");
  assert.ok(free.length > 0 && free.length < enterprise.length);
  assert.ok(free.reduce((sum, section) => sum + section.maxTokens, 0) <= 10000);
  assert.ok(free.every((section) => section.pageTarget && section.requirements.length > 0));
});

test("business-plan inference is pinned to flagship without silently falling back", () => {
  assert.equal(BUSINESS_PLAN_MODEL, "gpt-6-astra");
  const gateway = read("../server/aiProviderGateway.ts");
  assert.match(gateway, /strictPrimary[\s\S]*?provider === "openai"/);
  assert.match(gateway, /model: BUSINESS_PLAN_MODEL/);
  assert.match(gateway, /strictPrimary \? settings\.slice\(0, 1\) : settings/);
  const generator = read("../server/services/businessPlanGenerationService.ts");
  const revision = read("../server/services/businessPlanRevisionService.ts");
  assert.match(generator, /"x-ai-quality-policy": "strict-primary"/);
  assert.match(revision, /"x-ai-quality-policy": "strict-primary"/);
  assert.match(generator, /"x-ai-job-id": jobId/);
  assert.match(revision, /"x-ai-job-id": jobId/);
});

test("legacy self-granted referral credits cannot be minted by a user-provided ID", () => {
  const routes = read("../server/routes.ts");
  const start = routes.indexOf('app.post("/api/credits/award-referral"');
  const end = routes.indexOf("// Grant initial plan credits", start);
  assert.ok(start >= 0 && end > start);
  const handler = routes.slice(start, end);
  assert.match(handler, /res\.status\(410\)/);
  assert.doesNotMatch(handler, /bonusCredits|credit_transactions|creditsChange|update\(users\)/);
});

test("paid tools and revisions check the current entitlement", () => {
  assert.match(read("../server/middleware/requireToolAccess.ts"), /hasCurrentPaidEntitlement\(user\)/);
  assert.match(read("../server/services/businessPlanRevisionService.ts"), /hasCurrentPaidEntitlement\(currentUser\)/);
});
