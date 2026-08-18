import { useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  CircleDashed,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Files,
  FolderKanban,
  Handshake,
  Landmark,
  ListChecks,
  MessageSquareText,
  Presentation,
  Scale,
  ShieldCheck,
  Target,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToolRunHistory } from "@/hooks/useToolPlatform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessPlan, UserDocument } from "@shared/schema";

type ArtefactStatus = "ready" | "in-progress" | "not-started";

type TrackerSnapshot = {
  storedProgress?: Array<{ stepId: string; completionPercent?: number; status?: string }>;
  authoritative?: {
    businessPlans?: {
      evidence?: {
        financial?: { satisfied?: boolean };
        market?: { satisfied?: boolean };
      } | null;
    };
    documents?: { completionPercent?: number; requiredUploaded?: number; requiredTotal?: number };
    interviews?: { completed?: number; total?: number };
    documentReviews?: { completed?: number; total?: number };
  };
};

type Artefact = {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: ArtefactStatus;
  source: string;
};

const FINANCIAL_TOOL_IDS = [
  "financial-projections",
  "budget-cost-analyzer",
  "breakeven-calculator",
  "financial-modeling",
  "income-calculator",
  "cac-calculator",
  "unit-economics",
  "revenue-forecast",
  "financial-resilience",
];

const IVS_TOOL_IDS = [
  "endorsement-readiness",
  "criteria-scorer",
  "innovation-score",
  "innovation-validation",
  "business-model-validator",
  "viability-checker",
];

function statusBadge(status: ArtefactStatus) {
  if (status === "ready") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Ready
      </Badge>
    );
  }

  if (status === "in-progress") {
    return (
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
      >
        <CircleDashed className="mr-1 h-3 w-3" />
        In progress
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      <Circle className="mr-1 h-3 w-3" />
      Not started
    </Badge>
  );
}

function cardStatusClass(status: ArtefactStatus) {
  if (status === "ready") {
    return "border-emerald-200/90 dark:border-emerald-900/80";
  }
  if (status === "in-progress") {
    return "border-amber-200/90 dark:border-amber-900/80";
  }
  return "border-red-200/90 dark:border-red-900/80";
}

function actionLabel(status: ArtefactStatus) {
  if (status === "ready") return "Open";
  if (status === "in-progress") return "Continue";
  return "Start";
}

async function getTracker(): Promise<TrackerSnapshot> {
  const response = await apiRequest("GET", "/api/progress-tracker");
  return response.json();
}

async function getBusinessPlans(): Promise<BusinessPlan[]> {
  const response = await apiRequest("GET", "/api/dashboard/plans");
  return response.json();
}

async function getUploadedDocuments(): Promise<UserDocument[]> {
  const response = await apiRequest("GET", "/api/documents");
  return response.json();
}

export function ApplicationDocumentWorkspace({
  businessPlans,
  uploadedDocuments,
}: {
  businessPlans: BusinessPlan[];
  uploadedDocuments: UserDocument[];
}) {
  const { data: runHistory } = useToolRunHistory(undefined, true);
  const { data: tracker } = useQuery<TrackerSnapshot>({
    queryKey: ["/api/progress-tracker", "document-workspace"],
    queryFn: getTracker,
    retry: false,
    staleTime: 15_000,
  });

  const completedRuns = useMemo(
    () => new Set((runHistory?.runs || []).filter((run) => run.status === "completed").map((run) => run.tool_id)),
    [runHistory?.runs],
  );

  const hasRun = (...toolIds: string[]) => toolIds.some((toolId) => completedRuns.has(toolId));
  const latestCompletedPlan = businessPlans.find((plan) => plan.status === "completed") || null;
  const completedPlan = Boolean(latestCompletedPlan);
  const hasAnyPlan = businessPlans.length > 0;
  const businessPlanHref = latestCompletedPlan?.id
    ? `/api/view/html/${encodeURIComponent(String(latestCompletedPlan.id))}`
    : "/questionnaire";

  const financialReady = hasRun(...FINANCIAL_TOOL_IDS) || Boolean(tracker?.authoritative?.businessPlans?.evidence?.financial?.satisfied);
  const ivsReady = hasRun(...IVS_TOOL_IDS);
  const marketReady = hasRun("market-research") || Boolean(tracker?.authoritative?.businessPlans?.evidence?.market?.satisfied);
  const pitchReady = hasRun("pitch-coach");
  const complianceReady = hasRun("compliance-checker");
  const eligibilityReady = hasRun("eligibility-validator", "app-req-checker", "points-calculator", "jurisdiction-checker");
  const uploadedEvidence = uploadedDocuments.length > 0;
  const founderEvidence = uploadedDocuments.some(
    (doc) => ["education", "employment"].includes(doc.category) && doc.status === "verified",
  );
  const founderEvidenceStarted = uploadedDocuments.some((doc) => ["education", "employment"].includes(doc.category));
  const tractionEvidenceStarted = uploadedDocuments.some((doc) => ["endorsement", "other"].includes(doc.category));
  const interviewsReady = Number(tracker?.authoritative?.interviews?.completed || 0) > 0;
  const reviewReady = Number(tracker?.authoritative?.documentReviews?.completed || 0) > 0;
  const requiredDocumentsComplete = Number(tracker?.authoritative?.documents?.completionPercent || 0) >= 100;
  const progressById = new Map((tracker?.storedProgress || []).map((step) => [step.stepId, step]));
  const endorserReady = Number(progressById.get("endorser-comparison")?.completionPercent || 0) >= 100;

  const evidenceRegisterStatus: ArtefactStatus = uploadedEvidence || hasAnyPlan || completedRuns.size > 0 ? "ready" : "not-started";
  const dossierReady = completedPlan && ivsReady && financialReady;
  const dossierStarted = hasAnyPlan || ivsReady || financialReady || uploadedEvidence;
  const finalPackReady = dossierReady && requiredDocumentsComplete && reviewReady && complianceReady;

  const artefacts: Artefact[] = [
    {
      id: "business-plan",
      category: "Business & Strategy",
      title: "Business Plan",
      description: "The live generated plan, including its accepted revisions and exportable PDF.",
      href: businessPlanHref,
      icon: FileText,
      status: completedPlan ? "ready" : hasAnyPlan ? "in-progress" : "not-started",
      source: completedPlan ? "Generated business plan" : "Business Plan workflow",
    },
    {
      id: "market-research",
      category: "Business & Strategy",
      title: "Market Research",
      description: "Market size, customer evidence and demand signals used across the application.",
      href: "/tools/market-research",
      icon: BarChart3,
      status: marketReady ? "ready" : completedPlan ? "in-progress" : "not-started",
      source: marketReady ? "Structured market evidence" : completedPlan ? "Plan exists; market evidence still needs verification" : "Market Research tool",
    },
    {
      id: "competitor-analysis",
      category: "Business & Strategy",
      title: "Competitor Analysis",
      description: "Named competitors, differentiation and defensibility evidence.",
      href: "/tools/market-research",
      icon: Target,
      status: marketReady ? "ready" : completedPlan ? "in-progress" : "not-started",
      source: marketReady ? "Structured market evidence" : "Market Research tool",
    },
    {
      id: "financial-model",
      category: "Financial",
      title: "36-Month Financial Model",
      description: "Base, downside and upside cashflow scenarios with break-even and funding-gap analysis.",
      href: "/tools/financial-projections",
      icon: FileSpreadsheet,
      status: financialReady ? "ready" : "not-started",
      source: financialReady ? "Saved server-side financial model" : "Financial Projections tool",
    },
    {
      id: "financial-assumptions",
      category: "Financial",
      title: "Financial Assumptions & Projections",
      description: "The assumptions, unit economics and supporting evidence behind the 36-month model.",
      href: "/tools/financial-projections",
      icon: Landmark,
      status: financialReady ? "ready" : "not-started",
      source: financialReady ? "Saved financial model inputs" : "Financial Projections tool",
    },
    {
      id: "innovation-assessment",
      category: "AI Analysis & Diagnostics",
      title: "Innovation Assessment",
      description: "Innovation evidence coverage, gaps, red flags and assessor-style challenge questions.",
      href: "/tools/innovation-score",
      icon: Brain,
      status: ivsReady ? "ready" : "not-started",
      source: ivsReady ? "Saved IVS assessment" : "Innovation Score tool",
    },
    {
      id: "viability-assessment",
      category: "AI Analysis & Diagnostics",
      title: "Viability Assessment",
      description: "Founder capability, finance, customer demand and delivery evidence in one place.",
      href: "/tools/viability-checker",
      icon: BriefcaseBusiness,
      status: ivsReady ? "ready" : "not-started",
      source: ivsReady ? "Saved IVS assessment" : "Viability Checker",
    },
    {
      id: "scalability-assessment",
      category: "AI Analysis & Diagnostics",
      title: "Scalability Assessment",
      description: "Growth, skilled job creation, national expansion and international scaling evidence.",
      href: "/tools/endorsement-readiness",
      icon: Presentation,
      status: ivsReady ? "ready" : "not-started",
      source: ivsReady ? "Saved IVS assessment" : "Endorsement Readiness tool",
    },
    {
      id: "evidence-register",
      category: "Evidence",
      title: "Evidence Register",
      description: "A live index connecting uploaded evidence, saved assessments and application milestones without treating an upload alone as proof.",
      href: "/progress",
      icon: ListChecks,
      status: evidenceRegisterStatus,
      source: evidenceRegisterStatus === "ready" ? "Live application workspace" : "Progress Tracker",
    },
    {
      id: "founder-evidence",
      category: "Evidence",
      title: "Founder Capability & CV Evidence",
      description: "Qualifications, employment history, founder achievements and delivery capability evidence.",
      href: "/founder-portfolio",
      icon: UserRoundCheck,
      status: founderEvidence ? "ready" : founderEvidenceStarted || completedPlan ? "in-progress" : "not-started",
      source: founderEvidence ? "Verified founder documents" : founderEvidenceStarted ? "Uploaded documents require verification" : completedPlan ? "Founder profile exists; external evidence still required" : "Founder Portfolio",
    },
    {
      id: "customer-validation",
      category: "Evidence",
      title: "Customer Validation",
      description: "Customer interviews, willingness-to-pay, pilots and other real demand evidence.",
      href: "/commercial-validation",
      icon: MessageSquareText,
      status: marketReady ? "ready" : completedPlan ? "in-progress" : "not-started",
      source: marketReady ? "Structured demand evidence" : completedPlan ? "Plan claims require supporting customer evidence" : "Commercial Validation",
    },
    {
      id: "traction",
      category: "Evidence",
      title: "LOIs, Contracts & Traction Evidence",
      description: "External proof such as signed LOIs, contracts, pilot metrics and transaction evidence. Uploaded files are not automatically counted as verified evidence.",
      href: "/traction-evidence",
      icon: Handshake,
      status: tractionEvidenceStarted ? "in-progress" : "not-started",
      source: tractionEvidenceStarted ? "Uploaded candidates require evidence mapping/verification" : "Traction Evidence",
    },
    {
      id: "master-dossier",
      category: "Endorsement",
      title: "Master Endorsement Evidence Dossier",
      description: "The master pack that brings the plan, IVS analysis, financials and evidence gaps together.",
      href: "/progress",
      icon: FolderKanban,
      status: dossierReady ? "ready" : dossierStarted ? "in-progress" : "not-started",
      source: dossierReady ? "Core platform-generated components available" : "Built progressively from your workspace",
    },
    {
      id: "pitch-material",
      category: "Endorsement",
      title: "Pitch & Endorsement Material",
      description: "Pitch preparation and supporting material for endorsement conversations.",
      href: "/tools/pitch-coach",
      icon: Presentation,
      status: pitchReady ? "ready" : "not-started",
      source: pitchReady ? "Saved Pitch Coach run" : "Pitch Coach",
    },
    {
      id: "endorser-prep",
      category: "Endorsement",
      title: "Endorser Preparation",
      description: "Chosen endorser, comparison work and endorser-specific preparation.",
      href: "/endorser-comparison",
      icon: ShieldCheck,
      status: endorserReady ? "ready" : "not-started",
      source: endorserReady ? "Progress Tracker selection" : "Choose / Compare Endorser",
    },
    {
      id: "interview-prep",
      category: "Application Preparation",
      title: "Interview Preparation",
      description: "Recorded interview preparation and practice material linked to the application.",
      href: "/interview-prep",
      icon: MessageSquareText,
      status: interviewsReady ? "ready" : "not-started",
      source: interviewsReady ? "Completed interview session" : "Interview Prep",
    },
    {
      id: "final-review",
      category: "Application Preparation",
      title: "Final Document Review",
      description: "The latest completed document review and the weaknesses that still need attention.",
      href: "/document-review",
      icon: FileCheck2,
      status: reviewReady ? "ready" : "not-started",
      source: reviewReady ? "Completed document review" : "Final Document Review",
    },
    {
      id: "eligibility-compliance",
      category: "Application Preparation",
      title: "Eligibility & Compliance Checks",
      description: "Saved eligibility and final compliance results kept distinct from endorsement evidence.",
      href: complianceReady ? "/tools/compliance-checker" : "/tools/eligibility-validator",
      icon: Scale,
      status: complianceReady && eligibilityReady ? "ready" : complianceReady || eligibilityReady ? "in-progress" : "not-started",
      source: complianceReady || eligibilityReady ? "Saved rules-engine assessment" : "Eligibility / Compliance tools",
    },
    {
      id: "final-pack",
      category: "Final Pack",
      title: "Final Application Pack",
      description: "The consolidated final-stage view of the business plan, dossier, financials and supporting evidence.",
      href: "/progress",
      icon: Files,
      status: finalPackReady ? "ready" : dossierStarted ? "in-progress" : "not-started",
      source: finalPackReady ? "Required preparation checks complete" : "Assembled from verified workspace components",
    },
    {
      id: "read-me",
      category: "Final Pack",
      title: "Read Me First",
      description: "Explains what is platform-generated, what must come from a genuine external source and what remains missing.",
      href: "/progress",
      icon: FileText,
      status: "ready",
      source: "Application workspace guidance",
    },
  ];

  const groups = [...new Set(artefacts.map((artefact) => artefact.category))];
  const readyCount = artefacts.filter((artefact) => artefact.status === "ready").length;
  const inProgressCount = artefacts.filter((artefact) => artefact.status === "in-progress").length;
  const notStartedCount = artefacts.filter((artefact) => artefact.status === "not-started").length;

  return (
    <Card id="application-workspace" className="mb-8 border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Files className="h-5 w-5 text-primary" />
              Application Document Workspace
            </CardTitle>
            <CardDescription className="mt-1 max-w-3xl leading-relaxed">
              Platform-generated outputs are organised here by purpose. The same information remains available inside the tool or workflow that created it, so My Documents is the master library rather than a duplicate file dump.
            </CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2" aria-label="Document workspace status summary">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {readyCount} ready
            </Badge>
            <Badge variant="outline" className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              {inProgressCount} in progress
            </Badge>
            <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {notStartedCount} not started
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-7">
        {groups.map((group) => {
          const groupId = group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const groupArtefacts = artefacts.filter((item) => item.category === group);
          const groupReady = groupArtefacts.filter((item) => item.status === "ready").length;

          return (
            <section key={group} id={groupId} className="scroll-mt-24" aria-labelledby={`${groupId}-heading`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 id={`${groupId}-heading`} className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {groupReady}/{groupArtefacts.length} ready
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {groupArtefacts.map((artefact) => {
                  const Icon = artefact.icon;
                  const label = actionLabel(artefact.status);
                  const isServerDocument = artefact.href.startsWith("/api/");

                  return (
                    <article
                      key={artefact.id}
                      className={`flex min-h-[176px] flex-col rounded-lg border bg-card p-4 ${cardStatusClass(artefact.status)}`}
                      data-testid={`application-artefact-${artefact.id}`}
                      data-app-status={artefact.status}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        {statusBadge(artefact.status)}
                      </div>

                      <h4 className="mt-3 font-semibold">{artefact.title}</h4>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{artefact.description}</p>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <span className="max-w-[70%] text-[11px] leading-snug text-muted-foreground">{artefact.source}</span>
                        <Button
                          asChild
                          size="sm"
                          variant={artefact.status === "ready" ? "outline" : "default"}
                          className="shrink-0"
                        >
                          {isServerDocument ? (
                            <a href={artefact.href} aria-label={`${label} ${artefact.title}`}>
                              {label}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <Link href={artefact.href} aria-label={`${label} ${artefact.title}`}>
                              {label}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function ApplicationDocumentWorkspaceContainer() {
  const { data: businessPlans = [] } = useQuery<BusinessPlan[]>({
    queryKey: ["/api/dashboard/plans"],
    queryFn: getBusinessPlans,
    retry: false,
    staleTime: 15_000,
  });
  const { data: uploadedDocuments = [] } = useQuery<UserDocument[]>({
    queryKey: ["/api/documents"],
    queryFn: getUploadedDocuments,
    retry: false,
    staleTime: 15_000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
      <ApplicationDocumentWorkspace businessPlans={businessPlans} uploadedDocuments={uploadedDocuments} />
    </div>
  );
}
