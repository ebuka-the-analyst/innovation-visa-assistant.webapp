/**
 * Legacy paid plans remain valid until their recorded entitlement expires.
 * Future recurring products must set an explicit expiry/paid-through value and
 * update subscriptionStatus from verified Stripe lifecycle events.
 */
export interface PaidEntitlementSnapshot {
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
  tierExpiresAt?: Date | string | null;
}

export function hasCurrentPaidEntitlement(user: PaidEntitlementSnapshot, now = new Date()): boolean {
  const tier = String(user.subscriptionTier || "free").toLowerCase();
  if (tier === "free") return true;
  if (String(user.subscriptionStatus || "").toLowerCase() !== "active") return false;

  if (user.tierExpiresAt != null) {
    const expiry = new Date(user.tierExpiresAt);
    if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= now.getTime()) return false;
  }
  return true;
}
