import { Suspense } from "react";
import { useParams, useLocation } from "wouter";
import { getToolComponent, isValidTool } from "@/lib/toolRoutes";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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
        <ToolNavigation />
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
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  if (!isValidTool(toolId)) {
    return (
      <>
        {user && <AuthHeader />}
        <ToolNotFound toolId={toolId} />
      </>
    );
  }

  const ToolComponent = getToolComponent(toolId);

  if (!ToolComponent) {
    return (
      <>
        {user && <AuthHeader />}
        <ToolNotFound toolId={toolId} />
      </>
    );
  }

  return (
    <>
      {user && <AuthHeader />}
      <Suspense fallback={<LoadingFallback />}>
        <ToolComponent />
      </Suspense>
    </>
  );
}
