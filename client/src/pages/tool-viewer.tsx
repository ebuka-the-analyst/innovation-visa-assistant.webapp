import { Suspense } from "react";
import { useParams } from "wouter";
import { getToolComponent, isValidTool } from "@/lib/toolRoutes";
import { Card } from "@/components/ui/card";
import NotFound from "./not-found";

export default function ToolViewer() {
  const params = useParams();
  const toolId = params.id as string;

  if (!isValidTool(toolId)) {
    return <NotFound />;
  }

  const ToolComponent = getToolComponent(toolId);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8"><p>Loading tool...</p></Card>
      </div>
    }>
      <ToolComponent />
    </Suspense>
  );
}
