import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FileText, Files, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationDocumentWorkspaceContainer } from "@/components/ApplicationDocumentWorkspace";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessPlan } from "@shared/schema";

const FINANCIAL_TOOLS = new Set([
  "financial-projections",
  "budget-cost-analyzer",
  "breakeven-calculator",
  "financial-modeling",
  "income-calculator",
  "cac-calculator",
  "unit-economics",
  "revenue-forecast",
  "financial-resilience",
]);

const IVS_TOOLS = new Set([
  "endorsement-readiness",
  "criteria-scorer",
  "innovation-score",
  "innovation-validation",
  "business-model-validator",
  "viability-checker",
]);

type Notice = {
  title: string;
  description: string;
  libraryAnchor: string;
};

async function getBusinessPlans(): Promise<BusinessPlan[]> {
  const response = await apiRequest("GET", "/api/dashboard/plans");
  return response.json();
}

function businessPlanNotice(plans: BusinessPlan[], isLoading: boolean): Notice {
  if (isLoading) {
    return {
      title: "Business Plan",
      description: "Checking your saved business plan status…",
      libraryAnchor: "business-strategy",
    };
  }

  const completedPlan = plans.find(
    (plan) => String(plan.status || "").toLowerCase() === "completed",
  );

  if (completedPlan) {
    return {
      title: "Business Plan ready",
      description: "Your completed generated business plan is available and is also filed under Business & Strategy in My Documents.",
      libraryAnchor: "business-strategy",
    };
  }

  if (plans.length > 0) {
    return {
      title: "Business Plan in progress",
      description: "A business plan record exists for your account but has not yet reached completed status. Continue the workflow to finish it.",
      libraryAnchor: "business-strategy",
    };
  }

  return {
    title: "Business Plan workspace",
    description: "Complete the questionnaire to create your business plan. Generated outputs will be filed under Business & Strategy in My Documents.",
    libraryAnchor: "business-strategy",
  };
}

function noticeForLocation(location: string): Notice | null {
  if (location === "/dashboard") {
    return {
      title: "Your application documents stay organised in My Documents",
      description: "The dashboard stays action-focused; generated outputs, evidence and final-pack items are kept in their relevant workspace sections.",
      libraryAnchor: "application-workspace",
    };
  }

  if (location === "/progress") {
    return {
      title: "Progress Tracker connects the whole evidence pack",
      description: "Milestones are linked to the real plan, assessments, financial model and uploaded evidence. My Documents remains the master library.",
      libraryAnchor: "application-workspace",
    };
  }

  if (location === "/endorser-comparison" || location === "/endorser-cover-letter") {
    return {
      title: "Endorser Preparation",
      description: "Your endorser-specific work is part of the Endorsement section of the application workspace.",
      libraryAnchor: "endorsement",
    };
  }

  if (location === "/interview-prep") {
    return {
      title: "Interview Preparation",
      description: "Completed preparation sessions remain accessible here and are also indexed under Application Preparation in My Documents.",
      libraryAnchor: "application-preparation",
    };
  }

  if (["/document-organizer", "/evidence-graph", "/traction-evidence", "/founder-portfolio", "/commercial-validation"].includes(location)) {
    return {
      title: "Evidence Register",
      description: "Evidence stays connected to the workflow that created or uploaded it and is also indexed centrally in My Documents.",
      libraryAnchor: "evidence",
    };
  }

  if (location === "/document-review" || location === "/compliance-dashboard") {
    return {
      title: "Final Application Preparation",
      description: "Final review and compliance outputs feed the Final Pack while remaining visible in this workflow.",
      libraryAnchor: "application-preparation",
    };
  }

  if (location.startsWith("/tools/")) {
    const toolId = location.slice("/tools/".length).split("/")[0];

    if (FINANCIAL_TOOLS.has(toolId)) {
      return {
        title: "36-Month Financial Model",
        description: "Saved financial runs stay available in this financial workflow and are indexed under Financial in My Documents.",
        libraryAnchor: "financial",
      };
    }

    if (IVS_TOOLS.has(toolId)) {
      return {
        title: "Innovation, Viability & Scalability Analysis",
        description: "Saved IVS assessments stay available in the analysis tool and are indexed under AI Analysis & Diagnostics in My Documents.",
        libraryAnchor: "ai-analysis-diagnostics",
      };
    }

    if (["market-research", "evidence-collection"].includes(toolId)) {
      return {
        title: "Market & Evidence Workspace",
        description: "These outputs feed the live Evidence Register and the Business & Strategy section of My Documents.",
        libraryAnchor: "evidence",
      };
    }

    if (["pitch-coach", "cover-letter-builder"].includes(toolId)) {
      return {
        title: "Endorsement Material",
        description: "Saved preparation from this tool is also indexed under Endorsement in My Documents.",
        libraryAnchor: "endorsement",
      };
    }

    if (["eligibility-validator", "app-req-checker", "points-calculator", "jurisdiction-checker", "compliance-checker"].includes(toolId)) {
      return {
        title: "Eligibility & Compliance Record",
        description: "Saved rules-engine checks remain separate from endorsement evidence and are indexed under Application Preparation.",
        libraryAnchor: "application-preparation",
      };
    }
  }

  return null;
}

export function ContextualDocumentNotice() {
  const [location] = useLocation();
  const isBusinessPlanRoute = ["/questionnaire", "/generation"].includes(location);
  const { data: businessPlans = [], isLoading: businessPlansLoading } = useQuery<BusinessPlan[]>({
    queryKey: ["/api/dashboard/plans"],
    queryFn: getBusinessPlans,
    enabled: isBusinessPlanRoute,
    staleTime: 10_000,
  });

  if (location === "/documents") {
    return <ApplicationDocumentWorkspaceContainer />;
  }

  const notice = isBusinessPlanRoute
    ? businessPlanNotice(businessPlans, businessPlansLoading)
    : noticeForLocation(location);
  if (!notice) return null;

  return (
    <div className="border-b bg-muted/30 px-4 py-2.5 md:px-6" data-testid="contextual-document-notice">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-primary/10">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{notice.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{notice.description}</p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 flex-none gap-1.5">
          <Link href={`/documents#${notice.libraryAnchor}`}>
            {location === "/dashboard" ? <FolderOpen className="h-3.5 w-3.5" /> : <Files className="h-3.5 w-3.5" />}
            Open My Documents
          </Link>
        </Button>
      </div>
    </div>
  );
}
