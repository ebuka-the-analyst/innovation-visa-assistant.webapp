import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureNavProps {
  currentPage: "questionnaire" | "endorser-comparison" | "document-organizer" | "interview-prep" | "expert-booking" | "rejection-analysis" | "settlement-planning";
}

const featureFlow = [
  { key: "questionnaire", label: "Business Plan", route: "/questionnaire", phase: 1 },
  { key: "endorser-comparison", label: "Choose Endorser", route: "/endorser-comparison", phase: 1 },
  { key: "document-organizer", label: "Organize Documents", route: "/document-organizer", phase: 2 },
  { key: "interview-prep", label: "Interview Prep", route: "/interview-prep", phase: 3 },
  { key: "expert-booking", label: "Book Expert", route: "/expert-booking", phase: 3 },
  { key: "rejection-analysis", label: "Rejection Analysis", route: "/rejection-analysis", phase: 4 },
  { key: "settlement-planning", label: "Settlement Plan", route: "/settlement-planning", phase: 5 },
];

export default function FeatureNavigation({ currentPage }: FeatureNavProps) {
  const currentIndex = featureFlow.findIndex(f => f.key === currentPage);
  const currentPhase = featureFlow[currentIndex]?.phase || 1;

  return (
    <div className="mb-8 space-y-4">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">{featureFlow[currentIndex]?.label}</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {featureFlow.map((feature, idx) => (
          <div key={feature.key} className="flex items-center gap-2 flex-shrink-0">
            <Link href={feature.route}>
              <Button
                variant={idx === currentIndex ? "default" : idx < currentIndex ? "outline" : "ghost"}
                size="sm"
                className="whitespace-nowrap"
                data-testid={`button-nav-${feature.key}`}
              >
                {idx < currentIndex && "✓ "}
                {feature.label}
              </Button>
            </Link>
            {idx < featureFlow.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Phase Indicator */}
      <div className="text-xs text-muted-foreground">
        Phase {currentPhase} of 5: {
          currentPhase === 1 ? "Planning & Assessment" :
          currentPhase === 2 ? "Preparation" :
          currentPhase === 3 ? "Interview Ready" :
          currentPhase === 4 ? "Reapplication (if needed)" :
          "Post-Visa Settlement"
        }
      </div>
    </div>
  );
}
