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
  basic: "£29",
  premium: "£49",
  enterprise: "£89",
  ultimate: "£129",
};

// Tool counts kept internal for access logic - user-facing messaging uses "100+ professional-level tools"
const TIER_TOOL_COUNTS: Record<UserTier, number> = {
  free: 13,
  basic: 20,
  premium: 83,
  enterprise: 109,
  ultimate: 109,
};

export function useTierAccess() {
  const { data: user, isLoading } = useQuery<{
    id: string;
    email: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const userTier: UserTier = (user?.subscriptionTier as UserTier) || "free";
  const userTierLevel = TIER_HIERARCHY[userTier];

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
  };
}
