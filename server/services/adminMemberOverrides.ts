import type { PoolClient } from "pg";
import { dbPool } from "../db";

/**
 * Restore the remaining provider-verified access when an admin override ends.
 * Stripe rows are never altered by an administrator's access grant.
 * A refunded, expired or suspended payment is not presumed to be valid.
 */
export async function restoreMembershipAfterAdminGrant(
  client: PoolClient, userId: string,
): Promise<{ packageId: string; expiresAt: Date | null }> {
  const active = await client.query<{package_id:string;ends_at:Date}>(`
    SELECT entitlement.package_id,entitlement.ends_at
    FROM member_ai_entitlements entitlement
    WHERE entitlement.user_id=$1 AND entitlement.provider='stripe'
      AND entitlement.status='active'
      AND entitlement.starts_at<=NOW() AND entitlement.ends_at>NOW()
      AND EXISTS (
        SELECT 1 FROM member_stripe_live_orders orders
        WHERE orders.user_id=entitlement.user_id
          AND orders.currently_active=true
          AND orders.paid_through>NOW()
          AND orders.sku=entitlement.package_id
          AND (orders.stripe_subscription_id=entitlement.provider_reference
            OR orders.stripe_checkout_session_id=entitlement.provider_reference)
      )
    ORDER BY entitlement.ends_at DESC LIMIT 1
  `,[userId]);
  if(active.rows[0]){
    const original=active.rows[0];
    await client.query(`
      UPDATE users SET subscription_tier=$2,subscription_status='active',
        tier_expires_at=$3,updated_at=NOW() WHERE id=$1
    `,[userId,original.package_id,original.ends_at]);
    return {packageId:original.package_id,expiresAt:original.ends_at};
  }
  // Restore an earlier grandfathered purchase if it is still within its
  // original validity window; do not delete or reset purchased legacy credits.
  const audit=await client.query<{new_value:any}>(`
    SELECT new_value FROM admin_audit_logs
    WHERE target_id=$1 AND action='manual_member_grant'
    ORDER BY created_at DESC,id DESC LIMIT 1
  `,[userId]);
  const prior=audit.rows[0]?.new_value?.originalAccountState;
  const priorExpiry=prior?.tierExpiresAt==null ? null : new Date(prior.tierExpiresAt);
  if(["basic","premium","enterprise","ultimate"].includes(prior?.subscriptionTier) &&
     prior?.subscriptionStatus==="active" &&
     (priorExpiry===null || (Number.isFinite(priorExpiry.getTime()) && priorExpiry>new Date()))) {
    await client.query(`
      UPDATE users SET subscription_tier=$2,subscription_status='active',
        tier_expires_at=$3,updated_at=NOW() WHERE id=$1
    `,[userId,prior.subscriptionTier,priorExpiry]);
    return {packageId:prior.subscriptionTier,expiresAt:priorExpiry};
  }
  await client.query(`
    UPDATE users SET subscription_tier='free',subscription_status='inactive',
      tier_expires_at=NULL,updated_at=NOW() WHERE id=$1
  `,[userId]);
  return {packageId:"free",expiresAt:null};
}

/**
 * Lazy automatic expiry: invoked on authenticated user reads. Locking the
 * account and checking the actual provider=admin rows makes this safe across
 * both production replicas. No Stripe subscription is cancelled or revived.
 */
export async function reconcileExpiredAdminMembership(userId: string): Promise<boolean> {
  const client=await dbPool.connect();
  try{
    await client.query("BEGIN");
    await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE",[userId]);
    const expired=await client.query<{id:string}>(`
      SELECT id FROM member_ai_entitlements
      WHERE user_id=$1 AND provider='admin' AND status='active'
        AND ends_at<=NOW() FOR UPDATE
    `,[userId]);
    if(!expired.rowCount){
      await client.query("COMMIT");
      return false;
    }
    await client.query(`
      UPDATE member_ai_entitlements SET status='expired',updated_at=NOW()
      WHERE user_id=$1 AND provider='admin' AND status='active' AND ends_at<=NOW()
    `,[userId]);
    const activeManual=await client.query(`
      SELECT id FROM member_ai_entitlements WHERE user_id=$1
        AND provider='admin' AND status='active'
        AND starts_at<=NOW() AND ends_at>NOW() LIMIT 1
    `,[userId]);
    if(!activeManual.rowCount){
      await restoreMembershipAfterAdminGrant(client,userId);
    }
    await client.query("COMMIT");
    return true;
  }catch(error){
    try{await client.query("ROLLBACK");}catch{}
    throw error;
  }finally{
    client.release();
  }
}
