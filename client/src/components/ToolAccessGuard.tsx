import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTierAccess, type ToolTier } from "@/hooks/useTierAccess";
import { PremiumUpgradeOverlay } from "@/components/PremiumUpgradeOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { useToolAccess } from "@/hooks/useCommercialCatalog";

interface ToolAccessGuardProps {
  children: React.ReactNode;
  requiredTier: ToolTier;
  toolName: string;
  toolId?: string;
}

const TOOL_PATH_ALIASES: Record<string, string> = {
  "document-organizer": "doc-organizer",
  "rfe-defence-lab": "rfe-defense",
};

export function ToolAccessGuard({ children, requiredTier, toolName, toolId }: ToolAccessGuardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [, setLocation] = useLocation();
  const {
    canAccessTool,
    getRequiredTierName,
    getRequiredTierPrice,
    isLoading,
    isAuthenticated,
  } = useTierAccess();
  const {
    getToolAccess,
    isLoading: isToolAccessLoading,
    isError: isToolAccessError,
  } = useToolAccess(isAuthenticated);
  const pathToolId = typeof window === "undefined"
    ? undefined
    : window.location.pathname.replace(/^\/tools\//, "").replace(/^\//, "").split("/")[0];
  const resolvedToolId = toolId ?? TOOL_PATH_ALIASES[pathToolId || ""] ?? pathToolId;
  const managedEntitlement = resolvedToolId ? getToolAccess(resolvedToolId) : undefined;
  const effectiveRequiredTier = managedEntitlement?.minimumPlanId ?? requiredTier;

  const hasAccess = resolvedToolId
    ? !isToolAccessError && managedEntitlement?.allowed === true
    : canAccessTool(effectiveRequiredTier);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`/login?redirect=${window.location.pathname}`);
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || (isAuthenticated && isToolAccessLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-primary/20">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-3">{toolName}</h2>
                  <p className="text-lg text-muted-foreground mb-2">
                    This tool requires the <strong>{getRequiredTierName(effectiveRequiredTier)} Plan</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to unlock this powerful feature and access professional-level analysis
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full max-w-sm"
                    onClick={() => setShowUpgradeModal(true)}
                    data-testid="button-unlock-tool"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock {toolName}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full max-w-sm"
                    onClick={() => setLocation("/pricing")}
                    data-testid="button-view-plans"
                  >
                    View All Plans
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLocation("/tools-hub")}
                    data-testid="button-back-hub"
                  >
                    Back to Tools Hub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <PremiumUpgradeOverlay
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          requiredTier={effectiveRequiredTier}
          requiredTierName={getRequiredTierName(effectiveRequiredTier)}
          requiredTierPrice={getRequiredTierPrice(effectiveRequiredTier)}
          toolName={toolName}
        />
      </>
    );
  }

  return <>{children}</>;
}
