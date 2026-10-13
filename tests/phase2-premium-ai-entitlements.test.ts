import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasCurrentPaidEntitlement } from "../server/security/paidEntitlement";
import { gatewayUsageEvent, gatewayWorkload } from "../server/aiGatewayUsage";
import { getSectionsForTier } from "../server/aiPrompts";
import { BUSINESS_PLAN_MODEL } from "../server/aiModelConfig";
import { currentQuotaWindow, MEMBERSHIP_QUOTAS, isMembershipSku } from "../server/services/memberAiQuota";
import { ASTRA_PRICE_VERSION, estimateStandardAstraUsd } from "../server/aiInferencePricing";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("paid access checks status, expiry and legacy nonexpiring entitlements", () => {
  const now = new Date("2026-10-11T17:00:00Z");
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active" }, now), true);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "2026-10-11T17:00:01Z" }, now), true);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "2026-10-11T17:00:00Z" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "cancelled" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "premium", subscriptionStatus: "active", tierExpiresAt: "bad-date" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "free", subscriptionStatus: "inactive" }, now), true);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "founder", subscriptionStatus: "active" }, now), false);
  assert.equal(hasCurrentPaidEntitlement({ subscriptionTier: "founder", subscriptionStatus: "active", tierExpiresAt: "2026-11-11T00:00:00Z" }, now), true);
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
  assert.equal(getSectionsForTier("founder").length, getSectionsForTier("premium").length);
  assert.equal(getSectionsForTier("founder_pro").length, getSectionsForTier("enterprise").length);
  assert.equal(getSectionsForTier("founder_pass_90d").length, getSectionsForTier("enterprise").length);
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

test("membership quota limits match the proposed price packages", () => {
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder, { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: null });
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder_pro, { generationsPerPeriod: 4, revisionsPerPeriod: 30, lifetimeGenerations: null });
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder_pass_90d, { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: 6 });
  assert.equal(isMembershipSku("founder_pass_90d"), true);
  assert.equal(isMembershipSku("ultimate"), false);
});

test("90-day pass advances at 30 days and never opens a fourth period", () => {
  const start = new Date("2026-10-01T12:00:00Z");
  const end = new Date(start.getTime() + 90 * 86400_000);
  const pass = {
    package_id: "founder_pass_90d",
    billing_kind: "pass",
    status: "active",
    starts_at: start,
    ends_at: end,
    period_starts_at: start,
    period_ends_at: new Date(start.getTime() + 30 * 86400_000),
  };
  assert.equal(currentQuotaWindow(pass, start)?.periodStartsAt.toISOString(), start.toISOString());
  assert.equal(currentQuotaWindow(pass, new Date(start.getTime() + 30 * 86400_000))?.periodStartsAt.toISOString(), new Date(start.getTime() + 30 * 86400_000).toISOString());
  assert.equal(currentQuotaWindow(pass, new Date(end.getTime() - 1))?.periodStartsAt.toISOString(), new Date(start.getTime() + 60 * 86400_000).toISOString());
  assert.equal(currentQuotaWindow(pass, end), null);
  assert.equal(currentQuotaWindow({ ...pass, status: "cancelled" }, start), null);
});

test("recurring memberships do not renew quotas without an actual billing period update", () => {
  const monthly = {
    package_id: "founder",
    billing_kind: "subscription",
    status: "active",
    starts_at: new Date("2026-10-01T00:00:00Z"),
    ends_at: new Date("2026-12-01T00:00:00Z"),
    period_starts_at: new Date("2026-10-01T00:00:00Z"),
    period_ends_at: new Date("2026-11-01T00:00:00Z"),
  };
  assert.ok(currentQuotaWindow(monthly, new Date("2026-10-31T23:59:59Z")));
  assert.equal(currentQuotaWindow(monthly, new Date("2026-11-01T00:00:00Z")), null);
  assert.equal(currentQuotaWindow({ ...monthly, period_starts_at: new Date("2026-11-01T00:00:00Z"), period_ends_at: new Date("2026-12-01T00:00:00Z") }, new Date("2026-11-01T00:00:00Z"))?.periodStartsAt.toISOString(), "2026-11-01T00:00:00.000Z");
});

test("published Astra standard rates distinguish cached input and long context", () => {
  const estimate = (i: number, o: number, c = 0) => estimateStandardAstraUsd({
    provider: "openai", model: "gpt-6-astra", inputTokens: i, cachedInputTokens: c, outputTokens: o,
    apiBaseUrl: "https://api.openai.com/v1", serviceTier: "default",
  });
  assert.equal(estimate(250_000, 120_000).costUsdEstimated, 8.5);
  assert.equal(estimate(100_000, 50_000, 50_000).costUsdEstimated, 3.05);
  assert.equal(estimate(300_000, 100_000).costUsdEstimated, 13.5);
  assert.equal(estimate(250_000, 120_000).costPricingVersion, ASTRA_PRICE_VERSION);
  assert.equal(estimateStandardAstraUsd({ provider: "openai", model: "gpt-6-astra", inputTokens: 10, outputTokens: 10, cachedInputTokens: 0, apiBaseUrl: "https://proxy.example.com/v1" }).costUsdEstimated, null);
  assert.equal(estimateStandardAstraUsd({ provider: "openai", model: "gpt-6-astra", inputTokens: 10, outputTokens: 10, cachedInputTokens: 0, serviceTier: "fast" }).costUsdEstimated, null);
  assert.equal(estimateStandardAstraUsd({ provider: "openai", model: "unknown", inputTokens: 10, outputTokens: 10, cachedInputTokens: 0 }).costUsdEstimated, null);
});

test("atomic membership usage reservations are wired inside job transactions", () => {
  const generation = read("../server/services/businessPlanGenerationService.ts");
  const revision = read("../server/services/businessPlanRevisionService.ts");
  const quota = read("../server/services/memberAiQuota.ts");
  assert.match(generation, /reserveMemberAiQuota\(tx, userId/);
  assert.match(revision, /reserveMemberAiQuota\(tx, userId/);
  assert.match(generation, /transitionMemberAiReservation\(tx, "generation"/);
  assert.match(revision, /transitionMemberAiReservation\(tx, "revision"/);
  assert.match(quota, /FOR UPDATE/);
  assert.match(quota, /status <> 'released'/);
});
