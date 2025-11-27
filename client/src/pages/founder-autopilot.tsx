import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";

const FounderAutopilot = lazy(() => import("@/components/FounderAutopilot"));

function LoadingFallback() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </Card>
  );
}

export default function FounderAutopilotPage() {
  return (
    <ToolAccessGuard requiredTier="ultimate" toolName="Founder Autopilot">
      <SEOHead
        title="Founder Autopilot - Build My Visa | UK Innovator Founder Visa Assistant"
        description="Say 'Build my visa' and let AI orchestrate your entire UK Innovator Founder Visa application automatically."
        canonical="/tools/founder-autopilot"
      />
      
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Suspense fallback={<LoadingFallback />}>
          <FounderAutopilot />
        </Suspense>
      </div>
    </ToolAccessGuard>
  );
}
