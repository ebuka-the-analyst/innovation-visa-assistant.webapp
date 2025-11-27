import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";

const OracleSupervisor = lazy(() => import("@/components/OracleSupervisor"));

function LoadingFallback() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </Card>
  );
}

export default function OracleSupervisorPage() {
  return (
    <ToolAccessGuard requiredTier="ultimate" toolName="ORACLE AI Supervisor">
      <SEOHead
        title="ORACLE AI Supervisor - UK Innovator Founder Visa Assistant"
        description="Master AI system coordinating 4 specialist agents (Nova, Sterling, Atlas, Sage) for comprehensive UK visa application analysis."
        canonical="/tools/oracle-supervisor"
      />
      
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Suspense fallback={<LoadingFallback />}>
          <OracleSupervisor mode="consultation" />
        </Suspense>
      </div>
    </ToolAccessGuard>
  );
}
