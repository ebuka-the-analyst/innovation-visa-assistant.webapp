import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

const NeuralTwin = lazy(() => import("@/components/NeuralTwin"));

function LoadingFallback() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </Card>
  );
}

export default function NeuralTwinPage() {
  return (
    <>
      <SEOHead
        title="Neural Twin Founder Model - UK Innovator Founder Visa Assistant"
        description="AI simulation of your founder persona for endorser interview practice. Practice with your digital twin."
        canonical="/tools/neural-twin"
      />
      
      <ComingSoonOverlay 
        title="Neural Twin" 
        description="AI simulation of your founder persona for endorser interview practice. Practice with your digital twin."
      >
        <div className="container max-w-5xl mx-auto py-8 px-4">
          <Suspense fallback={<LoadingFallback />}>
            <NeuralTwin mode="interview" />
          </Suspense>
        </div>
      </ComingSoonOverlay>
    </>
  );
}
