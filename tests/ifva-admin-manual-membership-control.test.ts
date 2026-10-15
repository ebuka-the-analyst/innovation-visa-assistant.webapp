import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import { currentQuotaWindow, MEMBERSHIP_QUOTAS } from "../server/services/memberAiQuota";
const read=(p:string)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Manual grants use the same 30/90-day quota windows and allowances as member generation",()=>{
  const begin = new Date("2026-10-15T21:00:00Z");
  const end = new Date(begin.getTime() + 90*86400000);
  const pass = {
    package_id:"founder_pass_90d",billing_kind:"pass",status:"active",
    starts_at:begin,ends_at:end,period_starts_at:begin,
    period_ends_at:new Date(begin.getTime()+30*86400000),
  };
  assert.equal(currentQuotaWindow(pass,new Date(begin.getTime()+31*86400000))?.periodStartsAt.toISOString(),
    new Date(begin.getTime()+30*86400000).toISOString());
  assert.equal(currentQuotaWindow(pass,new Date(begin.getTime()+90*86400000)),null);
  assert.equal(MEMBERSHIP_QUOTAS.founder.generationsPerPeriod,2);
  assert.equal(MEMBERSHIP_QUOTAS.founder_pro.generationsPerPeriod,4);
  assert.equal(MEMBERSHIP_QUOTAS.founder_pass_90d.lifetimeGenerations,6);
});
test("Only admin with reason and explicit no-charge confirmation may grant, reassign or revoke",()=>{
  const server=read("server/routes.ts");
  assert.match(server,/app\.post\("\/api\/admin\/users\/:userId\/manual-membership", requireAdmin/);
  assert.match(server,/z\.enum\(\["grant", "revoke"\]\)/);
  assert.match(server,/z\.enum\(\["founder", "founder_pro", "founder_pass_90d"\]\)/);
  assert.match(server,/z\.string\(\)\.trim\(\)\.min\(10\)\.max\(500\)/);
  assert.match(server,/z\.literal\("MANUAL_ACCESS_NO_CHARGE"\)/);
  assert.match(server,/selfChange:admin.id===customer.id/);
  assert.match(server,/administratorAccount:customer.is_admin/);
  assert.doesNotMatch(server,/An administrator cannot change their own membership/);
  assert.doesNotMatch(server,/Admin membership grants are only available for customer accounts/);
  assert.match(server,/await client\.query\("BEGIN"\)/);
  assert.match(server,/await client\.query\("COMMIT"\)/);
  assert.match(server,/await client\.query\("ROLLBACK"\)/);
  assert.match(server,/INSERT INTO admin_audit_logs/);
  assert.match(server,/manual_member_grant/);
  assert.match(server,/manual_member_revoke/);
});
test("Manual membership emits a real quota entitlement but cannot fake a Stripe payment",()=>{
  const routes=read("server/routes.ts");
  const pos=routes.indexOf('app.post("/api/admin/users/:userId/manual-membership"');
  const implementation=routes.slice(pos,routes.indexOf("// Admin: Add/Remove/Set credits",pos));
  assert.match(implementation,/member_ai_entitlements/);
  assert.match(implementation,/provider='stripe'/);
  assert.match(implementation,/overridesExistingStripe/);
  assert.match(implementation,/provider='admin'/);
  assert.match(implementation,/\(user_id,package_id,billing_kind,status,provider,provider_reference/);
  assert.match(implementation,/'active','admin'/);
  assert.match(implementation,/subscription_tier=\$2,subscription_status='active'/);
  assert.match(implementation,/restoreMembershipAfterAdminGrant\(client,customer.id\)/);
  assert.match(implementation,/const days=sku==="founder_pass_90d"\?90:30/);
  assert.match(implementation,/chargeCreated:false/);
  assert.doesNotMatch(implementation,/stripe\.checkout\.sessions\.create|stripe\.subscriptions\.create/);
  assert.doesNotMatch(implementation,/LIVE_STRIPE_MEMBERSHIP_REQUIRES_BILLING_REVIEW/);
  assert.doesNotMatch(implementation,/ACTIVE_LEGACY_PURCHASE/);
  assert.match(implementation,/originalAccountState/);
  assert.match(implementation,/chargeCreated:false/);
});
test("Admin customer row offers actual change action with reason and confirmation",()=>{
  const screen=read("client/src/pages/admin-dashboard.tsx");
  const form=read("client/src/components/admin/AdminManualMembershipControls.tsx");
  assert.match(screen,/Change Membership/);
  assert.match(screen,/<AdminManualMembershipControls/);
  assert.match(form,/admin-select-membership/);
  assert.match(form,/admin-member-reason/);
  assert.match(form,/admin-member-confirm/);
  assert.match(form,/button-save-manual-membership/);
  assert.match(form,/reason\.trim\(\)\.length<10\|\|!confirmed/);
  assert.match(form,/No payment or renewal created/);
  assert.match(form,/including administrators/);
  assert.match(form,/Stripe billing continues separately/);
});
test("Customer pricing shows manual access without paid subscription or duplicate checkout",()=>{
 const routes=read("server/phase3/memberStripeLiveRoutes.ts");
 const plan=read("client/src/components/FounderMembershipPlans.tsx");
 const status=read("client/src/components/MyFounderMembership.tsx");
 assert.match(routes,/ADMIN_GRANTED_MEMBERSHIP_ACTIVE/);
 assert.match(routes,/source:"admin_grant"/);
 assert.match(routes,/accessThrough:manual\.rows\[0\]\.ends_at/);
 assert.match(routes,/canCancel:false/);
 assert.match(plan,/activeMembership\.source==="admin_grant"/);
 assert.match(status,/Administrator-granted access/);
 assert.match(status,/does not renew automatically/);
});

test("Manual expiry restores verified Stripe or valid legacy tiers, not refunded or inactive ones",()=>{
 const file=read("server/services/adminMemberOverrides.ts");
 const storage=read("server/storage.ts");
 const quota=read("server/services/memberAiQuota.ts");
 assert.match(file,/orders.currently_active=true/);
 assert.match(file,/orders.paid_through>NOW\(\)/);
 assert.match(file,/entitlement.provider='stripe'/);
 assert.match(file,/orders.sku=entitlement.package_id/);
 assert.match(file,/originalAccountState/);
 assert.match(file,/\["basic","premium","enterprise","ultimate"\]/);
 assert.match(file,/subscription_tier='free',subscription_status='inactive'/);
 assert.match(file,/provider='admin' AND status='active'/);
 assert.match(file,/ends_at<=NOW\(\)/);
 assert.match(file,/UPDATE member_ai_entitlements SET status='expired'/);
 assert.match(storage,/reconcileExpiredAdminMembership\(id\)/);
 assert.equal((quota.match(/ORDER BY CASE WHEN provider='admin' THEN 0 ELSE 1 END/g)||[]).length,2);
});

test("Signed live Stripe events preserve admin grants while still updating payment ledger",()=>{
 const ful=read("server/phase3/memberLiveEntitlementFulfilment.ts");
 assert.match(ful,/const manualActive=Boolean\(manual.rowCount\)/);
 assert.match(ful,/!manualActive && !\["free", order.sku\]/);
 assert.match(ful,/provider<>'admin'/);
 assert.match(ful,/if\(!manualActive\)/);
 assert.match(ful,/!manualActive && !others.rowCount/);
 assert.match(ful,/INSERT INTO member_ai_entitlements/);
 assert.match(ful,/provider='stripe'/);
});
