import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";

const RegulatoryCopilot = lazy(() => import("@/components/RegulatoryCopilot"));

function LoadingFallback() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    </Card>
  );
}

export default function RegulatoryCopilotPage() {
  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Autonomous Regulatory Copilot">
      <SEOHead
        title="Regulatory Copilot - UK Immigration Law Monitoring | UK Innovator Founder Visa Assistant"
        description="Real-time UK immigration law monitoring and compliance alerts. Stay updated with Home Office requirements."
        canonical="/tools/regulatory-copilot"
      />
      
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Suspense fallback={<LoadingFallback />}>
          <RegulatoryCopilot />
        </Suspense>
      </div>
    </ToolAccessGuard>
  );
}
