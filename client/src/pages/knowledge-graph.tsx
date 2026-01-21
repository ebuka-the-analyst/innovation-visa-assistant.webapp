import { lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

const KnowledgeGraph = lazy(() => import("@/components/KnowledgeGraph"));

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

export default function KnowledgeGraphPage() {
  return (
    <>
      <SEOHead
        title="Immigration Knowledge Graph - UK Visa Requirements Map | UK Innovator Founder Visa Assistant"
        description="Visual map of UK Innovator Founder Visa requirements showing connections between criteria, documents, and processes."
        canonical="/tools/knowledge-graph"
      />
      
      <ComingSoonOverlay 
        title="Knowledge Graph" 
        description="Visual map of UK Innovator Founder Visa requirements showing connections between criteria, documents, and processes."
      >
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <Suspense fallback={<LoadingFallback />}>
            <KnowledgeGraph />
          </Suspense>
        </div>
      </ComingSoonOverlay>
    </>
  );
}
