import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Coins, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useTierAccess } from "@/hooks/useTierAccess";

interface CreditBalanceResponse {
  planCredits: number;
  bonusCredits: number;
  totalCredits: number;
  creditsUsed: number;
  hasUnlimitedCredits: boolean;
  tierCreditLimit: number;
  hasUltimateAssurance: boolean;
  lastCreditRefresh: string | null;
  subscriptionTier: string;
}

interface CreditBalanceDisplayProps {
  variant?: "compact" | "full";
  showUpgradeButton?: boolean;
}

export function CreditBalanceDisplay({ variant = "compact", showUpgradeButton = true }: CreditBalanceDisplayProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, userTier } = useTierAccess();
  
  const { data: creditBalance, isLoading } = useQuery<CreditBalanceResponse>({
    queryKey: ['/api/credits/balance'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading credits...
      </div>
    );
  }

  if (!creditBalance) return null;

  // PhD-Level: ALL TIERS HAVE FINITE CREDITS - no unlimited display
  const { totalCredits, planCredits, bonusCredits, tierCreditLimit, subscriptionTier } = creditBalance;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2" data-testid="display-credit-balance-compact">
        {totalCredits > 0 ? (
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3 w-3 text-yellow-500" />
            {totalCredits} Credit{totalCredits !== 1 ? 's' : ''}
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            No Credits
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="p-4" data-testid="display-credit-balance-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${totalCredits > 0 ? 'bg-yellow-500/10' : 'bg-destructive/10'}`}>
              <Coins className={`h-5 w-5 ${totalCredits > 0 ? 'text-yellow-500' : 'text-destructive'}`} />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {totalCredits} Business Plan Credit{totalCredits !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {planCredits > 0 && `${planCredits} plan`}
                {planCredits > 0 && bonusCredits > 0 && " + "}
                {bonusCredits > 0 && `${bonusCredits} bonus`}
                {totalCredits === 0 && "Purchase credits to generate plans"}
                {subscriptionTier && subscriptionTier !== 'free' && ` (${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} tier)`}
              </p>
            </div>
          </div>
        </div>
        
        {showUpgradeButton && (
          <div className="flex gap-2">
            {totalCredits === 0 && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setLocation('/pricing')}
                data-testid="button-get-credits"
              >
                Get Credits
              </Button>
            )}
            {userTier !== 'ultimate' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/pricing')}
                data-testid="button-upgrade-tier"
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
