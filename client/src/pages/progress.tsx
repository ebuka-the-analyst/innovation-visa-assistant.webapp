import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Files,
  FolderOpen,
  Info,
  Mail,
  Mic,
  Presentation,
  RefreshCw,
  Scale,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FeatureNavigation from "@/components/FeatureNavigation";

type StepId =
  | "questionnaire"
  | "innovation-score"
  | "eligibility"
  | "business-plan"
  | "financial-projections"
  | "market-research"
  | "endorser-comparison"
  | "pitch-coach"
  | "interview-prep"
  | "document-organizer"
  | "cover-letter"
  | "evidence-prep"
  | "final-review"
  | "compliance-check";

type ServerStatus = "completed" | "in_progress" | "not_started";

type Audit = {
  rulesetVersion?: string | null;
  recordId?: string | null;
  recordType?: string | null;
  runId?: string | null;
  toolId?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
  registryVersion?: string | null;
  policyVersion?: string | null;
  validationState?: string | null;
  resultSha256?: string | null;
  hasDurableResult?: boolean;
  freshness?: "current" | "stale" | "unknown" | null;
  ageDays?: number | null;
  maxAgeDays?: number | null;
};

type Milestone = {
  id: StepId;
  required: boolean;
  completionPercent: number;
  status: ServerStatus;
  source: string;
  detail: string;
  updatedAt?: string | null;
  needsRevalidation: boolean;
  evidencePolicy?: string | null;
  audit?: Audit;
};

type TrackerResponse = {
  generatedAt: string;
  readinessRulesetVersion: string;
  requiredEvidencePolicy: Partial<Record<StepId, string>>;
  milestones: Milestone[];
  summary: {
    requiredCompleted: number;
    requiredTotal: number;
    requiredRemaining: number;
    requiredReadiness: number;
    optionalCompleted: number;
    optionalTotal: number;
    overallPreparation: number;
    applicationReady: boolean;
    revalidationRequired: StepId[];
  };
  authoritative: {
    businessPlans: {
      total: number;
      completed: number;
      active: number;
      state: string;
      latest: null | {
        id: string;
        businessName: string;
        status: string;
        pdfUrl?: string | null;
        createdAt?: string | null;
      };
      evidence: null | {
        planId: string;
        financial: { satisfied: boolean; completedSignals: number; totalSignals: number; missing: string[] };
        market: { satisfied: boolean; percent: number; completedSignals: number; totalSignals: number; missing: string[] };
      };
    };
    documents: {
      totalUploaded: number;
      requiredUploaded: number;
      requiredSatisfied: number;
      requiredTotal: number;
      completionPercent: number;
      uploadedRequiredNames: string[];
      generatedRequiredNames: string[];
      missingRequired: string[];
    };
    documentReviews: {
      total: number;
      completed: number;
      active: number;
      failed: number;
      latest?: null | { id: string; documentName?: string | null; status?: string | null; overallScore?: number | null; completedAt?: string | null };
    };
  };
};

type StepDefinition = {
  id: StepId;
  title: string;
  description: string;
  href: string;
  required: boolean;
  icon: LucideIcon;
  manualCompletion?: boolean;
};

type Phase = {
  id: string;
  title: string;
  description: string;
  steps: StepDefinition[];
};

const PHASES: Phase[] = [
  {
    id: "preparation",
    title: "1. Preparation & Assessment",
    description: "Build the factual foundation for the application before drafting endorsement material.",
    steps: [
      { id: "questionnaire", title: "Complete Business Questionnaire", description: "Complete the detailed founder, business, market, finance and endorsement questionnaire.", href: "/questionnaire", required: true, icon: ClipboardCheck },
      { id: "innovation-score", title: "Innovation Score", description: "Assess how strongly the proposition demonstrates genuine innovation.", href: "/tools/innovation-score", required: true, icon: Brain },
      { id: "eligibility", title: "Eligibility Validator", description: "Confirm all five core eligibility groups using a current saved result.", href: "/tools/eligibility-validator", required: true, icon: ShieldCheck },
    ],
  },
  {
    id: "business-planning",
    title: "2. Business Planning",
    description: "Turn the application evidence into a viable, scalable and financially coherent plan.",
    steps: [
      { id: "business-plan", title: "Business Plan", description: "Generate and complete the business plan used for endorsement preparation.", href: "/tools/business-plan", required: true, icon: FileText },
      { id: "financial-projections", title: "Financial Projections", description: "Save a usable capital, burn and revenue model for the application.", href: "/tools/financial-projections", required: true, icon: Calculator },
      { id: "market-research", title: "Market Research", description: "Strengthen market validation, customer evidence and competitor analysis.", href: "/tools/market-research", required: false, icon: BarChart3 },
    ],
  },
  {
    id: "endorsement-prep",
    title: "3. Endorsement Preparation",
    description: "Prepare for the endorsing body and practise the case you will present.",
    steps: [
      { id: "endorser-comparison", title: "Choose / Compare Endorser", description: "Research endorsing bodies and explicitly confirm the route you intend to pursue.", href: "/endorser-comparison", required: true, icon: Building2, manualCompletion: true },
      { id: "pitch-coach", title: "Pitch Coach", description: "Build and analyse the founder pitch before an endorsement conversation.", href: "/tools/pitch-coach", required: true, icon: Presentation },
      { id: "interview-prep", title: "Interview Preparation", description: "Practise interview questions and complete at least one recorded preparation session.", href: "/interview-prep", required: false, icon: Mic },
    ],
  },
  {
    id: "documentation",
    title: "4. Documentation & Evidence",
    description: "Assemble the evidence pack and supporting documents used to substantiate the application.",
    steps: [
      { id: "document-organizer", title: "Document Organiser", description: "Satisfy every required document requirement using uploaded or accepted generated artefacts.", href: "/document-organizer", required: true, icon: FolderOpen },
      { id: "cover-letter", title: "Cover Letter", description: "Prepare an optional supporting cover letter for the relevant recipient.", href: "/tools/cover-letter-builder", required: false, icon: Mail },
      { id: "evidence-prep", title: "Evidence Preparation", description: "Collect, classify and verify evidence across business, finance, innovation, market and traction.", href: "/tools/evidence-collection", required: false, icon: Files },
    ],
  },
  {
    id: "final-submission",
    title: "5. Final Review",
    description: "Run final quality and compliance checks before relying on the application pack.",
    steps: [
      { id: "final-review", title: "Final Document Review", description: "Complete at least one AI document review and address the resulting weaknesses.", href: "/document-review", required: true, icon: FileCheck2 },
      { id: "compliance-check", title: "Compliance Check", description: "Complete a current compliance run before the tracker can call the required journey ready.", href: "/tools/compliance-checker", required: true, icon: Scale },
    ],
  },
];

const ALL_DEFINITIONS = PHASES.flatMap((phase) => phase.steps);

function statusLabel(status: ServerStatus, revalidation = false) {
  if (revalidation) return "Needs revalidation";
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusBadgeClass(status: ServerStatus, revalidation = false) {
  if (revalidation || status === "in_progress") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300";
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
}

function sourceLabel(source: string) {
  if (source === "database") return "Verified from production records";
  if (source === "tool-run") return "Verified from durable tool run";
  if (source === "plan") return "Verified from completed business plan";
  if (source === "manual") return "Explicitly confirmed by you";
  if (source === "synced") return "Previous account-synced progress";
  return "No qualifying evidence yet";
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function AuditDetails({ milestone }: { milestone: Milestone }) {
  const audit = milestone.audit || {};
  return (
    <details className="group mt-2 text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none font-medium text-foreground/75 hover:text-foreground">Why this status?</summary>
      <div className="mt-2 space-y-1.5 leading-relaxed">
        <p>{milestone.detail}</p>
        {milestone.evidencePolicy && <p><strong className="text-foreground">Required evidence:</strong> {milestone.evidencePolicy}</p>}
        <p><strong className="text-foreground">Evidence source:</strong> {sourceLabel(milestone.source)}</p>
        {(audit.runId || audit.recordId) && <p><strong className="text-foreground">Record:</strong> {audit.runId || audit.recordId}</p>}
        {audit.toolId && <p><strong className="text-foreground">Tool:</strong> {audit.toolId}</p>}
        {(audit.completedAt || milestone.updatedAt) && <p><strong className="text-foreground">Recorded:</strong> {formatDate(audit.completedAt || milestone.updatedAt)}</p>}
        {audit.policyVersion && <p><strong className="text-foreground">Tool policy version:</strong> {audit.policyVersion}</p>}
        {audit.registryVersion && <p><strong className="text-foreground">Tool registry version:</strong> {audit.registryVersion}</p>}
        {audit.rulesetVersion && <p><strong className="text-foreground">Readiness ruleset:</strong> {audit.rulesetVersion}</p>}
        {audit.validationState && <p><strong className="text-foreground">Validation state:</strong> {audit.validationState}</p>}
        {audit.resultSha256 && <p className="break-all"><strong className="text-foreground">Result fingerprint:</strong> {audit.resultSha256}</p>}
        {audit.freshness && (
          <p>
            <strong className="text-foreground">Freshness:</strong> {audit.freshness === "current" ? "Current" : audit.freshness === "stale" ? "Stale, revalidation required" : "Unknown, revalidation required"}
            {typeof audit.ageDays === "number" ? ` · ${audit.ageDays} day${audit.ageDays === 1 ? "" : "s"} old` : ""}
            {typeof audit.maxAgeDays === "number" ? ` · ${audit.maxAgeDays}-day window` : ""}
          </p>
        )}
      </div>
    </details>
  );
}

async function loadTracker(): Promise<TrackerResponse> {
  const response = await fetch("/api/progress-tracker", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Failed to load progress (${response.status})`);
  return body;
}

async function setEndorserConfirmation(complete: boolean) {
  const response = await fetch("/api/progress-tracker/steps/endorser-comparison", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      completionPercent: complete ? 100 : 0,
      status: complete ? "completed" : "not_started",
      progressData: {
        source: "manual",
        detail: complete ? "You explicitly confirmed the endorser decision." : "Endorser confirmation was reset.",
      },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Failed to save confirmation (${response.status})`);
  return body;
}

export default function ProgressTracker() {
  const queryClient = useQueryClient();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(["preparation"]));
  const { data: tracker, isLoading, isFetching, error, refetch } = useQuery<TrackerResponse>({
    queryKey: ["/api/progress-tracker"],
    queryFn: loadTracker,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const milestoneMap = useMemo(
    () => new Map<StepId, Milestone>((tracker?.milestones || []).map((item) => [item.id, item])),
    [tracker?.milestones],
  );

  const steps = useMemo(
    () => ALL_DEFINITIONS.map((definition) => ({
      ...definition,
      milestone: milestoneMap.get(definition.id) || {
        id: definition.id,
        required: definition.required,
        completionPercent: 0,
        status: "not_started" as ServerStatus,
        source: "none",
        detail: "No qualifying evidence is available.",
        needsRevalidation: false,
      },
    })),
    [milestoneMap],
  );

  const stepMap = useMemo(() => new Map(steps.map((step) => [step.id, step])), [steps]);
  const nextRequiredStep = steps.find((step) => step.required && step.milestone.status !== "completed") || null;
  const currentPhase = PHASES.find((phase) => phase.steps.some((definition) => stepMap.get(definition.id)?.milestone.status !== "completed" && definition.required)) || PHASES[PHASES.length - 1];
  const currentPhaseNumber = PHASES.findIndex((phase) => phase.id === currentPhase.id) + 1;
  const currentPhaseName = currentPhase.title.replace(/^\d+\.\s*/, "");
  const summary = tracker?.summary;

  const manualMutation = useMutation({
    mutationFn: setEndorserConfirmation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] }),
  });

  const refreshEverything = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/business-plan/status"] });
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="responsive-container py-10">
          <FeatureNavigation currentPage="progress" showJourneyStrip={false} />
          <div className="flex min-h-[420px] items-center justify-center text-center">
            <div>
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 font-medium">Loading verified progress…</p>
              <p className="mt-1 text-sm text-muted-foreground">Checking business plans, tool runs, documents, interviews and reviews.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="responsive-container pb-24 pt-6 md:pb-28 md:pt-8 [&_.text-muted-foreground]:text-slate-600 dark:[&_.text-muted-foreground]:text-slate-300">
        <FeatureNavigation currentPage="progress" showJourneyStrip={false} />

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Application Progress Tracker</h1>
              <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Server verified</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Required readiness is calculated from durable account evidence. Browser-only or old synced completion cannot make a required milestone complete.
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start" onClick={() => void refreshEverything()} disabled={isFetching} data-testid="refresh-progress">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh progress"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6" role="alert" data-testid="progress-load-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We could not verify your latest server-side progress. Do not rely on the readiness score until the server connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {(summary?.revalidationRequired?.length || 0) > 0 && (
          <Alert className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20" data-testid="revalidation-warning">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertDescription>
              {summary?.revalidationRequired.length} required milestone{summary?.revalidationRequired.length === 1 ? "" : "s"} need revalidation under readiness ruleset {tracker?.readinessRulesetVersion}. Their previous progress is preserved but does not count as complete yet.
            </AlertDescription>
          </Alert>
        )}

        {nextRequiredStep ? (
          <Card className="mb-6 overflow-hidden border-primary/40 bg-primary/[0.035] shadow-sm" data-testid="next-required-step">
            <CardContent className="p-0">
              <div className="border-b border-primary/15 bg-primary/[0.055] px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Next required step</div>
                  <Badge variant="outline" className="border-primary/20 bg-background/80 text-primary">Phase {currentPhaseNumber} of {PHASES.length}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><nextRequiredStep.icon className="h-6 w-6" /></div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight md:text-2xl">{nextRequiredStep.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">{nextRequiredStep.description}</p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {statusLabel(nextRequiredStep.milestone.status, nextRequiredStep.milestone.needsRevalidation)} · {nextRequiredStep.milestone.completionPercent}% · {summary?.requiredRemaining ?? 0} required milestone{summary?.requiredRemaining === 1 ? "" : "s"} remaining
                    </div>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full shrink-0 gap-2 bg-emerald-800 text-white hover:bg-emerald-900 sm:w-auto" data-testid="next-required-step-action">
                  <Link href={nextRequiredStep.href}>{nextRequiredStep.milestone.needsRevalidation ? "Revalidate" : "Continue"}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20" data-testid="all-required-complete">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription>All required milestones are verified complete under readiness ruleset {tracker?.readinessRulesetVersion}. Optional preparation can still strengthen the evidence pack.</AlertDescription>
          </Alert>
        )}

        <section className="mb-7 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <Card className={summary?.applicationReady ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/15" : ""}>
            <CardContent className="p-5 sm:p-6" data-testid="required-readiness">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Required application readiness</div>
                  <div className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">{summary?.requiredReadiness ?? 0}%</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">{summary?.requiredCompleted ?? 0} of {summary?.requiredTotal ?? 10} required complete</div>
                  <div className="text-muted-foreground">{summary?.applicationReady ? "Required journey complete" : "Verified evidence required"}</div>
                </div>
              </div>
              <Progress value={summary?.requiredReadiness ?? 0} className="mt-4 h-3 bg-slate-200 dark:bg-slate-800" />
              <p className="mt-3 text-xs text-muted-foreground">This is the primary readiness measure. Required completion is server-authoritative and cannot be awarded by a browser/localStorage flag.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card data-testid="overall-journey-summary">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall preparation</div>
                    <div className="text-2xl font-bold">{summary?.overallPreparation ?? 0}%</div>
                    <div className="text-xs text-muted-foreground">Required + optional preparation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="current-phase-summary">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Current phase</div>
                    <div className="text-lg font-bold">Phase {currentPhaseNumber} of {PHASES.length}</div>
                    <div className="text-xs text-muted-foreground">{currentPhaseName}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="space-y-4">
          {PHASES.map((phase) => {
            const phaseSteps = phase.steps.map((definition) => stepMap.get(definition.id)!).filter(Boolean);
            const required = phaseSteps.filter((step) => step.required);
            const optional = phaseSteps.filter((step) => !step.required);
            const requiredComplete = required.filter((step) => step.milestone.status === "completed").length;
            const optionalComplete = optional.filter((step) => step.milestone.status === "completed").length;
            const requiredPercent = required.length
              ? Math.round(required.reduce((sum, step) => sum + (step.milestone.status === "completed" ? 100 : step.milestone.completionPercent), 0) / required.length)
              : 100;
            const isExpanded = expandedPhases.has(phase.id);
            const phaseName = phase.title.replace(/^\d+\.\s*/, "");

            return (
              <Card key={phase.id} data-testid={`phase-card-${phase.id}`}>
                <CardHeader className="p-0">
                  <button
                    type="button"
                    className="w-full rounded-xl p-5 text-left hover:bg-muted/30 sm:p-6"
                    onClick={() => setExpandedPhases((previous) => {
                      const next = new Set(previous);
                      if (next.has(phase.id)) next.delete(phase.id); else next.add(phase.id);
                      return next;
                    })}
                    aria-expanded={isExpanded}
                    aria-controls={`phase-content-${phase.id}`}
                    data-testid={`phase-toggle-${phase.id}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-lg">{phase.title}</CardTitle>
                        <CardDescription className="mt-1">{phase.description}</CardDescription>
                        <div className="mt-2 text-xs text-muted-foreground">{requiredComplete}/{required.length} required complete{optional.length ? ` · ${optionalComplete}/${optional.length} optional complete` : ""}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 md:min-w-[220px] md:justify-end">
                        <div className="min-w-[150px] flex-1 md:flex-none">
                          <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold">Required readiness</span><span className="font-bold">{requiredPercent}%</span></div>
                          <Progress value={requiredPercent} className="mt-2 h-2 bg-slate-200 dark:bg-slate-800" aria-label={`${phaseName} required readiness ${requiredPercent}%`} />
                        </div>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent id={`phase-content-${phase.id}`} className="space-y-3 border-t bg-muted/[0.12] p-4 sm:p-5">
                    {phaseSteps.map((step) => {
                      const Icon = step.icon;
                      const milestone = step.milestone;
                      const questionnaireReviewPlanId = step.id === "questionnaire" && milestone.status === "completed" ? tracker?.authoritative.businessPlans.evidence?.planId || null : null;
                      const actionHref = questionnaireReviewPlanId ? `/api/view/html/${encodeURIComponent(questionnaireReviewPlanId)}` : step.href;
                      const actionLabel = milestone.needsRevalidation ? "Revalidate" : milestone.status === "completed" ? "Review" : milestone.status === "in_progress" ? "Continue" : "Start";
                      const manualCompleted = step.id === "endorser-comparison" && milestone.source === "manual" && milestone.status === "completed";

                      return (
                        <div key={step.id} className={`rounded-xl border bg-background p-4 ${step.id === nextRequiredStep?.id ? "border-primary/30 ring-1 ring-primary/10" : ""}`} data-testid={`progress-step-${step.id}`}>
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <div className={`mt-0.5 rounded-lg p-2 ${milestone.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : milestone.status === "in_progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold">{step.title}</h3>
                                  <Badge variant="outline" className={statusBadgeClass(milestone.status, milestone.needsRevalidation)}>{statusLabel(milestone.status, milestone.needsRevalidation)}</Badge>
                                  <Badge variant={step.required ? "default" : "secondary"}>{step.required ? "Required" : "Optional"}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                                <div className="mt-3 max-w-2xl">
                                  <div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-muted-foreground">{sourceLabel(milestone.source)}</span><span className="font-semibold">{milestone.completionPercent}%</span></div>
                                  <Progress value={milestone.completionPercent} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
                                  <AuditDetails milestone={milestone} />
                                </div>

                                {step.id === "document-organizer" && tracker?.authoritative.documents.missingRequired?.length ? (
                                  <div className="mt-2 text-xs text-muted-foreground">Missing required: {tracker.authoritative.documents.missingRequired.slice(0, 4).join(", ")}{tracker.authoritative.documents.missingRequired.length > 4 ? ` +${tracker.authoritative.documents.missingRequired.length - 4} more` : ""}</div>
                                ) : null}

                                {step.id === "business-plan" && tracker?.authoritative.businessPlans.latest ? (
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>Latest: <strong className="text-foreground">{tracker.authoritative.businessPlans.latest.businessName}</strong> · {tracker.authoritative.businessPlans.latest.status}</span>
                                    {tracker.authoritative.businessPlans.latest.pdfUrl && <a href={tracker.authoritative.businessPlans.latest.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><Download className="h-3.5 w-3.5" /> View PDF</a>}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto lg:justify-end">
                              {step.manualCompletion && (
                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none" disabled={manualMutation.isPending} onClick={() => manualMutation.mutate(!manualCompleted)}>
                                  {manualCompleted ? "Reset confirmation" : "Confirm completed"}
                                </Button>
                              )}
                              <Button asChild size="sm" variant={milestone.status === "completed" && !milestone.needsRevalidation ? "outline" : "default"} className={`flex-1 gap-1.5 sm:flex-none ${milestone.status === "completed" && !milestone.needsRevalidation ? "" : "bg-emerald-800 text-white hover:bg-emerald-900"}`}>
                                {questionnaireReviewPlanId ? <a href={actionHref} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></a> : <Link href={actionHref} aria-label={`${actionLabel} ${step.title}`}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Info className="h-4 w-4" /> How readiness is measured</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Required readiness is server-authoritative.</strong> Browser/localStorage or legacy synced completion can preserve progress, but cannot independently create a green required milestone.</p>
              <p><strong className="text-foreground">Durable tool runs</strong> require a completed run, saved result payload and result fingerprint. Eligibility additionally needs a positive saved eligibility result.</p>
              <p><strong className="text-foreground">Freshness windows</strong> prevent old compliance and assessment runs from remaining valid forever. Stale records remain visible and are marked for revalidation.</p>
              <p><strong className="text-foreground">Business-plan status</strong> is reconciled through the same account service used by the questionnaire notice and this tracker.</p>
              <p><strong className="text-foreground">Overall preparation</strong> includes optional work. It is not the application-readiness percentage.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Journey summary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{summary?.requiredCompleted ?? 0}</div><div className="text-xs text-muted-foreground">Required complete</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{summary?.requiredRemaining ?? 0}</div><div className="text-xs text-muted-foreground">Required remaining</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{summary?.optionalCompleted ?? 0}</div><div className="text-xs text-muted-foreground">Optional complete</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{summary?.revalidationRequired?.length ?? 0}</div><div className="text-xs text-muted-foreground">Need revalidation</div></div>
              <div className="col-span-2 text-xs text-muted-foreground sm:col-span-4">Last server refresh: {tracker?.generatedAt ? formatDate(tracker.generatedAt) : "Unavailable"} · Ruleset {tracker?.readinessRulesetVersion || "unavailable"}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
