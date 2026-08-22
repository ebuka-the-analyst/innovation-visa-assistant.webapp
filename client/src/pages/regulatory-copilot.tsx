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
    <ToolAccessGuard requiredTier="basic" toolName="Regulatory Copilot">
      <SEOHead
        title="Regulatory Copilot | UK Innovator Founder Visa Assistant"
        description="Official-source UK immigration updates combined with readiness signals from your saved application data."
        canonical="/regulatory-copilot"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          <RegulatoryCopilot />
        </Suspense>
      </div>
    </ToolAccessGuard>
  );
}
