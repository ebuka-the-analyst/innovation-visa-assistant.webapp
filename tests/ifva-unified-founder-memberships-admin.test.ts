import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { safeDefaultMemberOffers } from "../server/services/memberOfferCatalogue";
import { MEMBERSHIP_QUOTAS } from "../server/services/memberAiQuota";
import { effectiveMemberToolPlan } from "../shared/memberToolPlan";
const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Single three-product commercial catalogue agrees with server-enforced allowance caps",()=>{
 const offers=safeDefaultMemberOffers().offers;
 assert.deepEqual(offers.map(o=>o.id),["founder","founder_pro","founder_pass_90d"]);
 assert.deepEqual(offers.map(o=>o.pricePence),[6900,11900,15900]);
 for(const o of offers) {
  assert.equal(o.generationsPerPeriod,MEMBERSHIP_QUOTAS[o.id].generationsPerPeriod);
  assert.equal(o.revisionsPerPeriod,MEMBERSHIP_QUOTAS[o.id].revisionsPerPeriod);
  assert.equal(o.maximumGenerations,MEMBERSHIP_QUOTAS[o.id].lifetimeGenerations);
 }
 assert.equal(effectiveMemberToolPlan("founder",true),"premium");
 assert.equal(effectiveMemberToolPlan("founder_pro",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder_pass_90d",true),"ultimate");
 assert.equal(effectiveMemberToolPlan("founder",false),"free");
});

test("Admin User membership and Pricing & Access show current server-owned packages",()=>{
 const admin=read("client/src/pages/admin-dashboard.tsx");
 const display=read("client/src/components/admin/FounderMembershipAdministration.tsx");
 assert.match(admin,/<FounderMembershipAdministration \/>/);
 assert.match(admin,/<AdminVerifiedMembershipStatus userId=/);
 assert.match(admin,/View Membership/);
 assert.match(admin,/Legacy Credits/);
 assert.match(admin,/Subscription Tier/); // only the read-only profile heading may remain
 assert.doesNotMatch(admin,/<SelectItem value="premium">Premium \(3 coins\)<\/SelectItem>/);
 assert.doesNotMatch(admin,/<SelectItem value="ultimate">Ultimate \(12 coins\)<\/SelectItem>/);
 assert.doesNotMatch(admin,/Set to Basic/);
 assert.doesNotMatch(admin,/Set to Ultimate/);
 assert.match(display,/\/api\/member-offers/);
 assert.match(display,/No payment or access changes|payment-controlled|payment-controlled|payment-controlled|payment-controlled|payment-controlled/i);
 assert.match(display,/Existing Basic, Premium, Enterprise and\s+Ultimate/);
});

test("Admin reads validated membership ledger and cannot bulk mint paid access",()=>{
 const routes=read("server/routes.ts");
 assert.match(routes,/app\.get\("\/api\/admin\/users\/:userId\/member-entitlement", requireAdmin/);
 assert.match(routes,/getMemberAiQuotaSnapshot\(current\.id, current\.subscriptionTier\)/);
 assert.match(routes,/MEMBERSHIP_LEDGER_REQUIRED/);
 assert.match(routes,/LEGACY_CREDIT_RESET_RETIRED/);
 assert.match(routes,/MEMBERSHIP_QUOTA_IS_SEPARATE/);
 const bulk=routes.slice(routes.indexOf('app.patch("/api/admin/users/bulk"'));
 assert.match(bulk,/if \(updates && \("subscriptionTier" in updates \|\| "subscriptionStatus" in updates\)\)/);
 assert.match(routes,/Bulk membership changes are disabled/);
 assert.match(routes,/Direct tier overrides are retired/);
});

test("Retired customer-facing purchase components cannot advertise old one-time deals",()=>{
 const modal=read("client/src/components/PricingModal.tsx");
 const overlay=read("client/src/components/PremiumUpgradeOverlay.tsx");
 const gate=read("client/src/components/TierGate.tsx");
 assert.match(modal,/<FounderMembershipPlans\/>/);
 assert.doesNotMatch(modal,/£9|£19|£35|£49|Basic Plan|Ultimate Plan|one-time payment/);
 assert.match(overlay,/SoftUpgradeOverlay/);
 assert.doesNotMatch(overlay,/Success guarantee|Unlimited revisions|one-time payment/i);
 assert.match(gate,/useTierAccess/);
 assert.match(gate,/hasAccessToTier\(/);
 assert.match(gate,/memberUpgradeDescription/);
});
