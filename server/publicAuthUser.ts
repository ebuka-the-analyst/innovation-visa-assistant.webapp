/**
 * Explicit response contract for registration and password login.
 * Never serialise the database user row: it contains email verification,
 * password reset and internal account-management fields.
 */
export type PublicAuthUserSource = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  isAdmin?: boolean | null;
  isEmailVerified?: boolean | null;
  hasCompletedOnboarding?: boolean | null;
  subscriptionTier?: string | null;
  subscriptionStatus?: string | null;
};

export function toPublicAuthUser(user: PublicAuthUserSource) {
  return {
    id: user.id,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    displayName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "",
    profileImageUrl: user.profileImageUrl ?? null,
    isAdmin: user.isAdmin === true,
    isEmailVerified: user.isEmailVerified === true,
    hasCompletedOnboarding: user.hasCompletedOnboarding === true,
    subscriptionTier: user.subscriptionTier || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
  };
}
