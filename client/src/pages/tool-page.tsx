import { Suspense } from "react";
import { useParams } from "wouter";
import { getToolComponent, isValidTool } from "@/lib/toolRoutes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading tool...</p>
      </div>
    </div>
  );
}

function ToolNotFound({ toolId }: { toolId: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The tool "{toolId}" could not be found. It may have been moved or is no longer available.
          </p>
          <Link href="/tools-hub">
            <Button className="gap-2" data-testid="button-back-to-tools">
              <ArrowLeft className="w-4 h-4" />
              Back to Tools Hub
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default function ToolPage() {
  const params = useParams<{ toolId: string }>();
  const toolId = params.toolId || "";

  if (!isValidTool(toolId)) {
    return <ToolNotFound toolId={toolId} />;
  }

  const ToolComponent = getToolComponent(toolId);

  if (!ToolComponent) {
    return <ToolNotFound toolId={toolId} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ToolComponent />
    </Suspense>
  );
}
