import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export function ToolNavigation() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.history.back()}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.href = "/tools-hub"}
        data-testid="button-tools-hub"
      >
        <Home className="w-4 h-4 mr-2" />
        Tools Hub
      </Button>
    </div>
  );
}
