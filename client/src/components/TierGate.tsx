import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useTierAccess, type ToolTier } from "@/hooks/useTierAccess";
import { memberUpgradeDescription } from "@shared/memberToolPlan";

interface TierGateProps {
  children: React.ReactNode;
  requiredTier: string;
  toolName?: string;
}

/** Retained for older tools; the server-verified access plan is authoritative. */
export function TierGate({ children, requiredTier, toolName }: TierGateProps) {
  const { isAuthenticated, isLoading, hasAccessToTier } = useTierAccess();
  const eligible = ["free","basic","premium","enterprise","ultimate"].includes(requiredTier)
    && hasAccessToTier(requiredTier as ToolTier);
  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>;
  if (!isAuthenticated) return <Card className="mx-auto max-w-lg p-6 text-center">
    <p className="mb-4">Sign in to verify your membership access.</p>
    <Button asChild><Link href="/login">Sign in</Link></Button>
  </Card>;
  if (eligible) return <>{children}</>;
  const options=memberUpgradeDescription(requiredTier as any);
  return <div className="flex min-h-[50vh] items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7"/>
        </div>
        <CardTitle>{toolName || "Member tool"} requires additional access</CardTitle>
        <CardDescription>
          {options}. Access depends on verified payment and the included tools in your active membership.
          Existing customers should contact support before changing plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-auto min-h-11 flex-1 whitespace-normal text-center" data-testid="button-upgrade">
          <Link href="/pricing">Review memberships</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto min-h-11 flex-1 whitespace-normal" data-testid="button-back">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  </div>;
}
