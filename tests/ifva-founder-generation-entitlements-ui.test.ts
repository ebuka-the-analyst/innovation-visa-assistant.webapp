import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  currentQuotaWindow,
  MEMBERSHIP_QUOTAS,
} from "../server/services/memberAiQuota";

const read = (name: string) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("Founder, Founder Pro and 90-Day Pass have separate finite quotas", () => {
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder, { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: null });
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder_pro, { generationsPerPeriod: 4, revisionsPerPeriod: 30, lifetimeGenerations: null });
  assert.deepEqual(MEMBERSHIP_QUOTAS.founder_pass_90d, { generationsPerPeriod: 2, revisionsPerPeriod: 15, lifetimeGenerations: 6 });
});

test("Revoked or expired membership never opens a quota window", () => {
  const ent = {
    package_id: "founder", billing_kind: "subscription", status: "active",
    starts_at: new Date("2026-10-15"), ends_at: new Date("2026-11-15"),
    period_starts_at: new Date("2026-10-15"), period_ends_at: new Date("2026-11-15"),
  };
  assert.ok(currentQuotaWindow(ent, new Date("2026-10-20")));
  assert.equal(currentQuotaWindow({ ...ent, status: "past_due" }, new Date("2026-10-20")), null);
  assert.equal(currentQuotaWindow({ ...ent, status: "expired" }, new Date("2026-10-20")), null);
  assert.equal(currentQuotaWindow(ent, new Date("2026-11-16")), null);
});

test("The display uses membership reservations, never legacy coin balances", () => {
  const quota = read("server/services/memberAiQuota.ts");
  const balance = read("client/src/components/CreditBalanceDisplay.tsx");
  assert.match(quota, /getMemberAiQuotaSnapshot/);
  assert.match(quota, /member_ai_entitlements/);
  assert.match(quota, /member_ai_quota_reservations/);
  assert.match(quota, /status <> 'released'/);
  assert.match(quota, /lifetime_generations_used/);
  assert.match(balance, /isMembershipUser/);
  assert.match(balance, /quota\.remainingGenerations/);
  assert.match(balance, /remainingRevisions/);
  assert.match(balance, /!isMembershipUser/);
});

test("Customer generation gate checks verified membership instead of old credits", () => {
  const routes = read("server/routes.ts");
  const page = read("client/src/pages/questionnaire.tsx");
  assert.match(routes, /app\.get\("\/api\/member-ai\/quota", isAuthenticated/);
  assert.match(routes, /getMemberAiQuotaSnapshot\(user\.id, user\.subscriptionTier\)/);
  assert.match(routes, /getMemberAiQuotaSnapshot\(userId, userTier\)/);
  assert.match(page, /memberQuota\?\.active === true/);
  assert.match(page, /memberQuota\.remainingGenerations > 0/);
  assert.match(page, /Review Membership/);
  assert.match(page, /enabled: isAuthenticated && !isMembershipUser/);
});

test("Existing Founder membership bypasses retired one-time Checkout, but cannot bypass quota", () => {
  const routes = read("server/routes.ts");
  const checkout = routes.slice(routes.indexOf('"/api/payment/create-checkout"'));
  const quotaCheck = checkout.indexOf("getMemberAiQuotaSnapshot(user.id, currentAccount.subscriptionTier)");
  const retiredGate = checkout.indexOf("IFVA_LEGACY_NEW_PURCHASES_DISABLED");
  assert.ok(quotaCheck > 0 && retiredGate > quotaCheck);
  assert.match(checkout, /MEMBERSHIP_GENERATION_UNAVAILABLE/);
  assert.match(checkout, /remainingGenerations < 1/);
  assert.match(checkout, /effectiveMemberToolPlan\(currentAccount\.subscriptionTier, true\)/);
  assert.match(checkout, /skipCheckout: true/);
  assert.match(checkout, /status: "paid"/);
  const form = read("client/src/components/QuestionnaireForm.tsx");
  assert.match(form, /isMembershipUser && memberQuota\?\.active === true/);
  assert.match(form, /isMembershipUser \? tier :/);
});
