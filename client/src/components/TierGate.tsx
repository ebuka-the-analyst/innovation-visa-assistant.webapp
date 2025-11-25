import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Zap, Crown } from "lucide-react";

type User = {
  id: string;
  email: string;
  displayName?: string;
  subscriptionTier: string;
  subscriptionStatus?: string;
};

interface TierGateProps {
  children: React.ReactNode;
  requiredTier: string;
  toolName?: string;
}

const TIER_HIERARCHY = {
  'free': 0,
  'basic': 1,
  'premium': 2,
  'enterprise': 3,
  'ultimate': 4,
};

const TIER_ICONS = {
  'basic': Sparkles,
  'premium': Zap,
  'enterprise': Crown,
  'ultimate': Crown,
};

const TIER_NAMES = {
  'free': 'Free',
  'basic': 'Basic',
  'premium': 'Premium',
  'enterprise': 'Enterprise',
  'ultimate': 'Ultimate',
};

export function TierGate({ children, requiredTier, toolName }: TierGateProps) {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  if (!user) {
    return null;
  }

  const userTierLevel = TIER_HIERARCHY[user.subscriptionTier as keyof typeof TIER_HIERARCHY] || 0;
  const requiredTierLevel = TIER_HIERARCHY[requiredTier as keyof typeof TIER_HIERARCHY] || 0;

  const hasAccess = userTierLevel >= requiredTierLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  const TierIcon = TIER_ICONS[requiredTier as keyof typeof TIER_ICONS] || Lock;
  const requiredTierName = TIER_NAMES[requiredTier as keyof typeof TIER_NAMES] || requiredTier;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <TierIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {requiredTierName} Plan Required
          </CardTitle>
          <CardDescription className="text-base">
            {toolName ? `"${toolName}" requires a ${requiredTierName} subscription or higher.` : `This tool requires a ${requiredTierName} subscription or higher.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/50 border border-accent rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Your current plan:</p>
            <p className="font-semibold text-lg">{TIER_NAMES[user.subscriptionTier as keyof typeof TIER_NAMES] || 'Free'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upgrade to {requiredTierName} to unlock:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Access to {requiredTier === 'basic' ? '30+' : requiredTier === 'premium' ? '60+' : requiredTier === 'enterprise' ? '80+' : '108'} premium tools</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Professional-level business planning assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Export reports and action plans</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1" data-testid="button-upgrade">
              <Link href="/pricing">
                Upgrade Now
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" data-testid="button-back">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
