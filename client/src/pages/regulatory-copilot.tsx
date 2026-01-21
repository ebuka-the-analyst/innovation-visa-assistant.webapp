import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

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
    <>
      <SEOHead
        title="Regulatory Copilot - UK Immigration Law Monitoring | UK Innovator Founder Visa Assistant"
        description="Real-time UK immigration law monitoring and compliance alerts. Stay updated with Home Office requirements."
        canonical="/tools/regulatory-copilot"
      />
      
      <ComingSoonOverlay 
        title="Regulatory Copilot" 
        description="Real-time UK immigration law monitoring and compliance alerts. Stay updated with Home Office requirements."
      >
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <Suspense fallback={<LoadingFallback />}>
            <RegulatoryCopilot />
          </Suspense>
        </div>
      </ComingSoonOverlay>
    </>
  );
}
