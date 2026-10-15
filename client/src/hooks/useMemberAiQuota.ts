import { useQuery } from "@tanstack/react-query";

/** Only the server may decide whether a paid entitlement is active. */
export interface MemberAiQuotaSnapshot {
  packageId: "founder" | "founder_pro" | "founder_pass_90d";
  active: boolean;
  generationLimit: number;
  generationsUsed: number;
  remainingGenerations: number;
  revisionLimit: number;
  revisionsUsed: number;
  remainingRevisions: number;
  periodEndsAt: string | null;
  paidThrough: string | null;
}
export function useMemberAiQuota() {
  const { data: user, isLoading: isUserLoading } = useQuery<{
    subscriptionTier?: string;
  }>({ queryKey: ["/api/auth/user"], retry: false });
  const isMembershipUser = ["founder", "founder_pro", "founder_pass_90d"].includes(
    user?.subscriptionTier || "",
  );
  const quotaQuery = useQuery<MemberAiQuotaSnapshot>({
    queryKey: ["/api/member-ai/quota"],
    enabled: !!user && isMembershipUser,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  return {
    isMembershipUser,
    quota: quotaQuery.data,
    isLoading: isUserLoading || (isMembershipUser && quotaQuery.isLoading),
    isError: isMembershipUser && quotaQuery.isError,
  };
}
