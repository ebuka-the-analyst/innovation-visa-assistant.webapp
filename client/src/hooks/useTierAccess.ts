import { useQuery } from "@tanstack/react-query";
import { useCommercialCatalog } from "@/hooks/useCommercialCatalog";

export type UserTier = "free" | "basic" | "premium" | "enterprise" | "ultimate";
export type ToolTier = "free" | "basic" | "premium" | "enterprise" | "ultimate";

const TIER_HIERARCHY: Record<UserTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
  ultimate: 4,
};

const FALLBACK_TIER_NAMES: Record<UserTier, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
  ultimate: "Ultimate",
};

// 2026 PRICING - Effective January 2026
export const TIER_CREDITS: Record<UserTier, number> = {
  free: 0,
  basic: 1,
  premium: 3,
  enterprise: 6,
  ultimate: 12,
};

export const REFERRAL_REWARDS = {
  creditsPerReferral: 1,
  description: "Earn 1 credit for each friend who signs up and subscribes",
} as const;

interface UserWithCredits {
  id: string;
  email: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  planCredits?: number;
  bonusCredits?: number;
  creditsUsed?: number;
  hasUltimateAssurance?: boolean;
  lastCreditRefresh?: string;
}

export function useTierAccess() {
  const { getUpgradePlan, toolCounts, formatPrice } = useCommercialCatalog();
  const { data: user, isLoading } = useQuery<UserWithCredits>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const userTier: UserTier = (user?.subscriptionTier as UserTier) || "free";
  const userTierLevel = TIER_HIERARCHY[userTier];
  
  const planCredits = user?.planCredits ?? 0;
  const bonusCredits = user?.bonusCredits ?? 0;
  const totalCredits = planCredits + bonusCredits;
  const creditsUsed = user?.creditsUsed ?? 0;
  const hasUltimateAssurance = user?.hasUltimateAssurance ?? false;
  
  const tierCreditLimit = TIER_CREDITS[userTier];
  // All tiers now have finite credits - no unlimited tier exists

  const hasAccessToTier = (requiredTier: ToolTier): boolean => {
    const requiredLevel = TIER_HIERARCHY[requiredTier];
    return userTierLevel >= requiredLevel;
  };

  const getRequiredTierName = (toolTier: ToolTier): string => {
    return getUpgradePlan(toolTier)?.displayName.replace(/\s+Plan$/i, "") ?? FALLBACK_TIER_NAMES[toolTier];
  };

  const getRequiredTierPrice = (toolTier: ToolTier): string => {
    const plan = getUpgradePlan(toolTier);
    return plan ? formatPrice(plan.pricePence) : "";
  };

  const getTierToolCount = (tier: UserTier): number => {
    return toolCounts[tier] ?? 0;
  };

  const canAccessTool = (toolTier: ToolTier): boolean => {
    return hasAccessToTier(toolTier);
  };

  const canGenerateBusinessPlan = (): boolean => {
    return totalCredits > 0;
  };

  const getRemainingCredits = (): number => {
    return totalCredits;
  };

  const getUpgradePrice = (targetTier: UserTier): number => {
    const targetPrice = getUpgradePlan(targetTier)?.pricePence ?? 0;
    return targetPrice / 100;
  };

  const getCreditDisplay = (): string => {
    if (totalCredits === 0) return "0 coins";
    if (totalCredits === 1) return "1 coin";
    return `${totalCredits} coins`;
  };

  const getTierCreditsDisplay = (tier: UserTier): string => {
    const credits = TIER_CREDITS[tier];
    if (credits === 0) return "0";
    return `${credits}`;
  };

  return {
    user,
    userTier,
    isLoading,
    hasAccessToTier,
    canAccessTool,
    getRequiredTierName,
    getRequiredTierPrice,
    getTierToolCount,
    isAuthenticated: !!user,
    planCredits,
    bonusCredits,
    totalCredits,
    creditsUsed,
    tierCreditLimit,
    canGenerateBusinessPlan,
    getRemainingCredits,
    getUpgradePrice,
    getCreditDisplay,
    getTierCreditsDisplay,
  };
}
