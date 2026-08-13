import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { AlertCircle, Loader2 } from "lucide-react";
import { ALL_TOOLS } from "@shared/tools-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { useAuth } from "@/hooks/useAuth";
import { useToolAccess } from "@/hooks/useCommercialCatalog";

interface ToolEntitlementGuardProps {
  toolId: string;
  children: ReactNode;
}

function readableToolName(toolId: string) {
  return ALL_TOOLS.find((tool) => tool.id === toolId)?.name
    ?? toolId.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function ToolEntitlementGuard({ toolId, children }: ToolEntitlementGuardProps) {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const access = useToolAccess(auth.isAuthenticated);
  const entitlement = access.getToolAccess(toolId);
  const toolName = readableToolName(toolId);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      setLocation(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [auth.isAuthenticated, auth.isLoading, setLocation]);

  if (auth.isLoading || (auth.isAuthenticated && access.isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth.isAuthenticated) return null;

  if (access.isError || !entitlement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-2 border-destructive/20">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Unable to verify access</h2>
              <p className="text-muted-foreground mb-6">
                {toolName} is temporarily unavailable because your current plan access could not be verified.
              </p>
              <Button onClick={() => setLocation("/tools-hub")}>Back to Tools Hub</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!entitlement.allowed) {
    return (
      <ToolAccessGuard
        requiredTier={entitlement.minimumPlanId}
        toolName={toolName}
        toolId={toolId}
      >
        {children}
      </ToolAccessGuard>
    );
  }

  return <>{children}</>;
}
