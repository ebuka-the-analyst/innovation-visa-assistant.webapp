import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

const EconomicImpactSimulator = lazy(() => import("@/components/EconomicImpactSimulator"));

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

export default function EconomicImpactPage() {
  return (
    <>
      <SEOHead
        title="UK Economic Impact Simulator | UK Innovator Founder Visa Assistant"
        description="Calculate your business's UK economic impact including job creation, GDP contribution, and tax revenue for visa applications."
        canonical="/tools/economic-impact"
      />
      
      <ComingSoonOverlay 
        title="Economic Impact Simulator" 
        description="Calculate your business's UK economic impact including job creation, GDP contribution, and tax revenue."
      >
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <Suspense fallback={<LoadingFallback />}>
            <EconomicImpactSimulator />
          </Suspense>
        </div>
      </ComingSoonOverlay>
    </>
  );
}
