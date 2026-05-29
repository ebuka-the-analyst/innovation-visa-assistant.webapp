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

// Global Founder Pricing - Effective May 2026
const TIER_PRICES: Record<UserTier, string> = {
  free: "£0",
  basic: "£9",
  premium: "£19",
  enterprise: "£35",
  ultimate: "£49",
};

const TIER_PRICE_VALUES: Record<UserTier, number> = {
  free: 0,
  basic: 9,
  premium: 19,
  enterprise: 35,
  ultimate: 49,
};

const TIER_TOOL_COUNTS: Record<UserTier, number> = {
  free: 13,
  basic: 20,
  premium: 83,
  enterprise: 109,
  ultimate: 109,
};

// 2026 PRICING - Effective January 2026
export const TIER_CREDITS: Record<UserTier, number> = {
  free: 0,
  basic: 1,
  premium: 3,
  enterprise: 6,
  ultimate: 12,
};

// Global Founder Coin Top-Ups - Effective May 2026
export const ADDON_PRICING = {
  singleCoin: { price: 5, credits: 1, name: "1 Coin" },
  doubleCoins: { price: 9, credits: 2, name: "2 Coins", savings: 1 },
  tripleCoins: { price: 12, credits: 3, name: "3 Coins", savings: 3 },
  fiveCoins: { price: 19, credits: 5, name: "5 Coins", savings: 6 },
  tenCoins: { price: 35, credits: 10, name: "10 Coins", savings: 15 },
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
  // All tiers now have finite credits - no unlimited tier exists

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
    return totalCredits > 0;
  };

  const getRemainingCredits = (): number => {
    return totalCredits;
  };

  const getUpgradePrice = (targetTier: UserTier): number => {
    const currentPrice = TIER_PRICE_VALUES[userTier];
    const targetPrice = TIER_PRICE_VALUES[targetTier];
    return Math.max(0, targetPrice - currentPrice);
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
