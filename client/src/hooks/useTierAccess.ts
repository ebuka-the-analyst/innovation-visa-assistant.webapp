import { useQuery } from "@tanstack/react-query";

export type UserTier = "free" | "basic" | "premium" | "enterprise" | "ultimate";
export type ToolTier = "free" | "basic" | "premium" | "enterprise" | "ultimate";

const TIER_HIERARCHY: Record<UserTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3,
  ultimate: 4,
};

const TIER_NAMES: Record<UserTier, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
  ultimate: "Ultimate",
};

const TIER_PRICES: Record<UserTier, string> = {
  free: "£0",
  basic: "£15",
  premium: "£29",
  enterprise: "£45",
  ultimate: "£60",
};

const TIER_PRICE_VALUES: Record<UserTier, number> = {
  free: 0,
  basic: 29,
  premium: 49,
  enterprise: 89,
  ultimate: 129,
};

const TIER_TOOL_COUNTS: Record<UserTier, number> = {
  free: 13,
  basic: 20,
  premium: 83,
  enterprise: 109,
  ultimate: 109,
};

export const TIER_CREDITS: Record<UserTier, number | "unlimited"> = {
  free: 0,
  basic: 1,
  premium: 3,
  enterprise: 6,
  ultimate: "unlimited",
};

export const ADDON_PRICING = {
  singleCredit: { price: 39, credits: 1, name: "Single Credit" },
  triplePack: { price: 99, credits: 3, name: "Triple Credit Pack", savings: 18 },
  partnerBundle: { price: 59, credits: 1, name: "Partner Bundle (2 plans)", description: "Generate plans for you and your co-founder" },
  familyPack: { price: 149, credits: 4, name: "Family Pack (5 plans)", savings: 46 },
  ultimateAssurance: { price: 99, name: "Ultimate Assurance (Annual)", description: "Unlimited business plan generations for 1 year" },
} as const;

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
  const hasUnlimitedCredits = userTier === "ultimate" || hasUltimateAssurance;

  const hasAccessToTier = (requiredTier: ToolTier): boolean => {
    const requiredLevel = TIER_HIERARCHY[requiredTier];
    return userTierLevel >= requiredLevel;
  };

  const getRequiredTierName = (toolTier: ToolTier): string => {
    return TIER_NAMES[toolTier];
  };

  const getRequiredTierPrice = (toolTier: ToolTier): string => {
    return TIER_PRICES[toolTier];
  };

  const getTierToolCount = (tier: UserTier): number => {
    return TIER_TOOL_COUNTS[tier];
  };

  const canAccessTool = (toolTier: ToolTier): boolean => {
    return hasAccessToTier(toolTier);
  };

  const canGenerateBusinessPlan = (): boolean => {
    if (hasUnlimitedCredits) return true;
    return totalCredits > 0;
  };

  const getRemainingCredits = (): number | "unlimited" => {
    if (hasUnlimitedCredits) return "unlimited";
    return totalCredits;
  };

  const getUpgradePrice = (targetTier: UserTier): number => {
    const currentPrice = TIER_PRICE_VALUES[userTier];
    const targetPrice = TIER_PRICE_VALUES[targetTier];
    return Math.max(0, targetPrice - currentPrice);
  };

  const getCreditDisplay = (): string => {
    if (hasUnlimitedCredits) return "Unlimited";
    if (totalCredits === 0) return "0 credits";
    if (totalCredits === 1) return "1 credit";
    return `${totalCredits} credits`;
  };

  const getTierCreditsDisplay = (tier: UserTier): string => {
    const credits = TIER_CREDITS[tier];
    if (credits === "unlimited") return "Unlimited";
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
    hasUnlimitedCredits,
    tierCreditLimit,
    hasUltimateAssurance,
    canGenerateBusinessPlan,
    getRemainingCredits,
    getUpgradePrice,
    getCreditDisplay,
    getTierCreditsDisplay,
  };
}
