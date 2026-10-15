import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTierAccess } from "@/hooks/useTierAccess";
import { useMemberAiQuota } from "@/hooks/useMemberAiQuota";

interface CreditBalanceResponse {
  planCredits: number;
  bonusCredits: number;
  totalCredits: number;
  subscriptionTier: string;
}

interface CreditBalanceDisplayProps {
  variant?: "compact" | "full";
  showUpgradeButton?: boolean;
}

const membershipName: Record<string, string> = {
  founder: "Founder",
  founder_pro: "Founder Pro",
  founder_pass_90d: "90-Day Pass",
};

export function CreditBalanceDisplay({ variant = "compact", showUpgradeButton = true }: CreditBalanceDisplayProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, userTier } = useTierAccess();
  const { isMembershipUser, quota, isLoading: quotaLoading, isError: quotaError } = useMemberAiQuota();
  const { data: creditBalance, isLoading: legacyLoading } = useQuery<CreditBalanceResponse>({
    queryKey: ["/api/credits/balance"],
    enabled: isAuthenticated && !isMembershipUser,
  });

  if (!isAuthenticated) return null;
  if (quotaLoading || (!isMembershipUser && legacyLoading)) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />Checking plan allowance...
    </div>;
  }

  // New paid memberships are NOT purchased coin packs. Never show legacy
  // 'Get Credits' or 'Upgrade Plan' to current members.
  if (isMembershipUser) {
    const active = quota?.active === true && !quotaError;
    const remaining = active ? quota.remainingGenerations : 0;
    const allowanceText = quotaError
      ? "Unable to verify your membership allowance. Please refresh."
      : !active
        ? "Membership generation access is inactive. Check your membership."
        : remaining === 0
          ? "Your generation allowance for this period has been used."
          : `${remaining} of ${quota.generationLimit} plan generations remaining`;
    if (variant === "compact") {
      return <Badge variant={active && remaining > 0 ? "secondary" : "destructive"}
        className="gap-1" data-testid="display-credit-balance-compact">
        {active && remaining > 0 ? <Coins className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {active ? `${remaining} generations remaining` : "Membership access unavailable"}
      </Badge>;
    }
    return <Card className="p-4" data-testid="display-credit-balance-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${active && remaining > 0 ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
            {active && remaining > 0
              ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              : <AlertCircle className="h-5 w-5 text-destructive" />}
          </div>
          <div>
            <p className="text-lg font-semibold" data-testid="membership-generation-balance">{allowanceText}</p>
            <p className="text-sm text-muted-foreground">
              {membershipName[quota?.packageId || ""] || "Founder membership"}
              {active && ` · ${quota.remainingRevisions} of ${quota.revisionLimit} revisions remaining`}
              {active && quota.periodEndsAt && ` · Current period ends ${new Date(quota.periodEndsAt).toLocaleDateString("en-GB")}`}
            </p>
          </div>
        </div>
        {!active && showUpgradeButton && <Button variant="outline" size="sm"
          onClick={() => setLocation("/pricing")} data-testid="button-review-membership">
          Review Membership
        </Button>}
      </div>
    </Card>;
  }

  if (!creditBalance) return null;
  const { totalCredits, planCredits, bonusCredits } = creditBalance;
  if (variant === "compact") {
    return <div className="flex items-center gap-2" data-testid="display-credit-balance-compact">
      <Badge variant={totalCredits > 0 ? "secondary" : "destructive"} className="gap-1">
        {totalCredits > 0 ? <Coins className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {totalCredits > 0 ? `${totalCredits} Credit${totalCredits !== 1 ? "s" : ""}` : "No Credits"}
      </Badge>
    </div>;
  }
  return <Card className="p-4" data-testid="display-credit-balance-full">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Coins className="h-5 w-5" />
        <div>
          <p className="font-semibold text-lg">{totalCredits} Business Plan Credit{totalCredits !== 1 ? "s" : ""}</p>
          <p className="text-sm text-muted-foreground">
            {planCredits > 0 && `${planCredits} plan`}
            {planCredits > 0 && bonusCredits > 0 && " + "}
            {bonusCredits > 0 && `${bonusCredits} bonus`}
            {totalCredits === 0 && "No remaining legacy plan credits"}
          </p>
        </div>
      </div>
      {showUpgradeButton && <div className="flex gap-2">
        {totalCredits === 0 && <Button size="sm" onClick={() => setLocation("/pricing")} data-testid="button-get-credits">Review Memberships</Button>}
        {userTier !== "ultimate" && <Button size="sm" variant="outline" onClick={() => setLocation("/pricing")} data-testid="button-upgrade-tier">Membership Options</Button>}
      </div>}
    </div>
  </Card>;
}
