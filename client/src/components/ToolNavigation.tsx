import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

export function ToolNavigation() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex items-center gap-3 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLocation("/tools-hub")}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLocation("/")}
        data-testid="button-home"
      >
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLocation("/tools-hub")}
        data-testid="button-tools-hub"
      >
        <Home className="w-4 h-4 mr-2" />
        Tools Hub
      </Button>
    </div>
  );
}
