import { useCallback, useEffect, useMemo, useState } from "react";
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
  Circle,
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


type StepStatus = "completed" | "in-progress" | "not-started";
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

type ProgressSource = "database" | "plan" | "synced" | "browser" | "manual" | "none";

interface JourneyStep {
  id: StepId;
  title: string;
  description: string;
  href: string;
  required: boolean;
  icon: LucideIcon;
  manualCompletion?: boolean;
}

interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
}

interface StoredProgress {
  stepId: StepId;
  completionPercent: number;
  status: string;
  progressData?: Record<string, any>;
  updatedAt?: string | null;
}

interface TrackerResponse {
  generatedAt: string;
  storedProgress: StoredProgress[];
  authoritative: {
    businessPlans: {
      total: number;
      completed: number;
      active: number;
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
      requiredTotal: number;
      completionPercent: number;
      missingRequired: string[];
    };
    interviews: {
      total: number;
      completed: number;
      active: number;
      latestStatus?: string | null;
    };
    documentReviews: {
      total: number;
      completed: number;
      active: number;
      failed: number;
      latest?: null | {
        id: string;
        documentName?: string | null;
        status?: string | null;
        overallScore?: number | null;
        completedAt?: string | null;
      };
    };
  };
}

interface StepSignal {
  percent: number;
  status: StepStatus;
  source: ProgressSource;
  detail: string;
  completed?: boolean;
}

interface ResolvedStep extends JourneyStep, StepSignal {
  updatedAt?: string | null;
}

const PHASES: JourneyPhase[] = [
  {
    id: "preparation",
    title: "1. Preparation & Assessment",
    description: "Build the factual foundation for the application before drafting endorsement material.",
    steps: [
      {
        id: "questionnaire",
        title: "Complete Business Questionnaire",
        description: "Complete the detailed founder, business, market, finance and endorsement questionnaire.",
        href: "/questionnaire",
        required: true,
        icon: ClipboardCheck,
      },
      {
        id: "innovation-score",
        title: "Innovation Score",
        description: "Assess how strongly the proposition demonstrates genuine innovation.",
        href: "/tools/innovation-score",
        required: true,
        icon: Brain,
      },
      {
        id: "eligibility",
        title: "Eligibility Validator",
        description: "Confirm all five core eligibility groups rather than relying on a partial pass.",
        href: "/tools/eligibility-validator",
        required: true,
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "business-planning",
    title: "2. Business Planning",
    description: "Turn the application evidence into a viable, scalable and financially coherent plan.",
    steps: [
      {
        id: "business-plan",
        title: "Business Plan",
        description: "Generate and complete the business plan used for endorsement preparation.",
        href: "/tools/business-plan",
        required: true,
        icon: FileText,
      },
      {
        id: "financial-projections",
        title: "Financial Projections",
        description: "Save a usable capital, burn and revenue model for the application.",
        href: "/tools/financial-projections",
        required: true,
        icon: Calculator,
      },
      {
        id: "market-research",
        title: "Market Research",
        description: "Strengthen market validation, customer evidence and competitor analysis.",
        href: "/tools/market-research",
        required: false,
        icon: BarChart3,
      },
    ],
  },
  {
    id: "endorsement-prep",
    title: "3. Endorsement Preparation",
    description: "Prepare for the endorsing body and practise the case you will present.",
    steps: [
      {
        id: "endorser-comparison",
        title: "Choose / Compare Endorser",
        description: "Research endorsing bodies and confirm the route you intend to pursue.",
        href: "/endorser-comparison",
        required: true,
        icon: Building2,
        manualCompletion: true,
      },
      {
        id: "pitch-coach",
        title: "Pitch Coach",
        description: "Build and analyse the founder pitch before an endorsement conversation.",
        href: "/tools/pitch-coach",
        required: true,
        icon: Presentation,
      },
      {
        id: "interview-prep",
        title: "Interview Preparation",
        description: "Practise interview questions and complete at least one recorded preparation session.",
        href: "/interview-prep",
        required: false,
        icon: Mic,
      },
    ],
  },
  {
    id: "documentation",
    title: "4. Documentation & Evidence",
    description: "Assemble the evidence pack and supporting documents used to substantiate the application.",
    steps: [
      {
        id: "document-organizer",
        title: "Document Organiser",
        description: "Upload all required documents. Progress is verified directly from your saved documents.",
        href: "/document-organizer",
        required: true,
        icon: FolderOpen,
      },
      {
        id: "cover-letter",
        title: "Cover Letter",
        description: "Prepare an optional supporting cover letter for the relevant recipient.",
        href: "/tools/cover-letter-builder",
        required: false,
        icon: Mail,
      },
      {
        id: "evidence-prep",
        title: "Evidence Preparation",
        description: "Collect, classify and verify evidence across business, finance, innovation, market and traction.",
        href: "/tools/evidence-collection",
        required: false,
        icon: Files,
      },
    ],
  },
  {
    id: "final-submission",
    title: "5. Final Review",
    description: "Run final quality and compliance checks before relying on the application pack.",
    steps: [
      {
        id: "final-review",
        title: "Final Document Review",
        description: "Complete at least one AI document review and address the resulting weaknesses.",
        href: "/document-review",
        required: true,
        icon: FileCheck2,
      },
      {
        id: "compliance-check",
        title: "Compliance Check",
        description: "Complete all eight compliance checks before the tracker can call the required journey ready.",
        href: "/tools/compliance-checker",
        required: true,
        icon: Scale,
      },
    ],
  },
];

const ALL_STEPS = PHASES.flatMap((phase) => phase.steps);
const OBJECTIVE_STEP_IDS = new Set<StepId>([
  "business-plan",
  "document-organizer",
  "interview-prep",
  "final-review",
]);

function clampPercent(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function statusFromPercent(percent: number, completed = false): StepStatus {
  if (completed || percent >= 100) return "completed";
  if (percent > 0) return "in-progress";
  return "not-started";
}

function readJson(key: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function readText(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return false;
}

function formatDate(value?: string | null): string {
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

function browserSignal(stepId: StepId, tracker?: TrackerResponse): StepSignal {
  const database = tracker?.authoritative;

  if (stepId === "questionnaire") {
    if ((database?.businessPlans.completed || 0) > 0) {
      return {
        percent: 100,
        status: "completed",
        source: "database",
        detail: "A completed generated business plan confirms that the questionnaire reached submission.",
        completed: true,
      };
    }

    const form = readJson("autosave_questionnaire-form");
    const currentStep = Number(readText("autosave_questionnaire-step") || 0);
    if (!form || typeof form !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No questionnaire progress recorded yet." };
    }
    const entries = Object.entries(form).filter(([key]) => key !== "tier");
    const filled = entries.filter(([, value]) => isFilled(value)).length;
    const fieldProgress = entries.length ? Math.round((filled / entries.length) * 90) : 0;
    const stepProgress = Number.isFinite(currentStep) ? Math.round(((Math.min(Math.max(currentStep, 0), 10) + 1) / 11) * 90) : 0;
    const percent = Math.min(95, Math.max(fieldProgress, stepProgress));
    return {
      percent,
      status: statusFromPercent(percent),
      source: "browser",
      detail: `${filled} questionnaire fields contain saved answers. Completion is confirmed only after submission/generation.`,
    };
  }

  if (stepId === "innovation-score") {
    const data = readJson("innovation-score-state");
    if (!data) {
      if ((database?.businessPlans.completed || 0) > 0) {
        return {
          percent: 0,
          status: "not-started",
          source: "plan",
          detail: "Innovation evidence exists in the completed business plan, but the separate innovation assessment has not been completed.",
        };
      }
      return { percent: 0, status: "not-started", source: "none", detail: "No saved innovation assessment found." };
    }
    const percent = clampPercent(data.overallCompletion ?? data.completionPercent ?? data.progress ?? 0);
    const complete = percent >= 100;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: complete ? "Innovation assessment reached its completion threshold." : `Saved innovation assessment is ${percent}% complete.`,
      completed: complete,
    };
  }

  if (stepId === "eligibility") {
    const data = readJson("eligibility-validator-state");
    const state = data?.state;
    if (!state || typeof state !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No eligibility assessment has been saved." };
    }
    const meetsAge = Number(state.age || 0) >= 18;
    const meetsEnglish = Boolean(state.hasEnglishProof) && ["B2", "C1", "C2"].includes(String(state.englishLevel || ""));
    const meetsFunding = Number(state.fundingAmount || 0) > 0 && Boolean(state.hasFundingProof);
    const meetsEntrepreneur = Boolean(state.isGenuineEntrepreneur) && Boolean(state.hasBusinessPlan) && Boolean(state.hasInnovationEvidence);
    const meetsImmigration = Boolean(state.hasNoImmigrationViolations) && !Boolean(state.hasCriminalRecord) && Boolean(state.hasValidPassport);
    const completeCount = [meetsAge, meetsEnglish, meetsFunding, meetsEntrepreneur, meetsImmigration].filter(Boolean).length;
    const percent = completeCount * 20;
    const complete = completeCount === 5;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: `${completeCount} of 5 eligibility groups are satisfied. All 5 are required for tracker completion.`,
      completed: complete,
    };
  }

  if (stepId === "business-plan") {
    const plans = database?.businessPlans;
    if ((plans?.completed || 0) > 0) {
      return {
        percent: 100,
        status: "completed",
        source: "database",
        detail: `${plans?.completed} completed business plan${plans?.completed === 1 ? "" : "s"} recorded in production.`,
        completed: true,
      };
    }
    if ((plans?.active || 0) > 0 || (plans?.total || 0) > 0) {
      return {
        percent: 60,
        status: "in-progress",
        source: "database",
        detail: "A business plan exists but has not reached completed status yet.",
      };
    }
    return { percent: 0, status: "not-started", source: "database", detail: "No generated business plan is recorded yet." };
  }

  if (stepId === "financial-projections") {
    const planFinancial = database?.businessPlans.evidence?.financial;
    if (planFinancial?.satisfied) {
      return {
        percent: 100,
        status: "completed",
        source: "plan",
        detail: "The completed business plan contains all " + planFinancial.totalSignals + " structured financial-model signals required by the tracker.",
        completed: true,
      };
    }

    const data = readJson("financialProjectionsProgress");
    if (!data || typeof data !== "object") {
      if (planFinancial && planFinancial.completedSignals > 0) {
        const percent = Math.round((planFinancial.completedSignals / planFinancial.totalSignals) * 100);
        return {
          percent,
          status: statusFromPercent(percent),
          source: "plan",
          detail: planFinancial.completedSignals + " of " + planFinancial.totalSignals + " financial-model signals are present in the completed business plan. Missing: " + planFinancial.missing.join(", ") + ".",
        };
      }
      return { percent: 0, status: "not-started", source: "none", detail: "No saved financial projection model found." };
    }
    const inputs = [data.initial, data.monthly, data.revenue];
    const validInputs = inputs.filter((value) => Number.isFinite(Number(value)) && Number(value) >= 0).length;
    const percent = Math.round((validInputs / 3) * 100);
    const complete = validInputs === 3;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: complete ? "Capital, monthly burn and monthly revenue are all saved." : `${validInputs} of 3 projection inputs are saved.`,
      completed: complete,
    };
  }

  if (stepId === "market-research") {
    const planMarket = database?.businessPlans.evidence?.market;
    const data = readJson("market-research-state");
    if (!data || typeof data !== "object") {
      if (planMarket?.satisfied) {
        return {
          percent: 100,
          status: "completed",
          source: "plan",
          detail: "The completed business plan contains " + planMarket.completedSignals + " of " + planMarket.totalSignals + " substantive market-validation signals, including a demand signal.",
          completed: true,
        };
      }
      if (planMarket && planMarket.completedSignals > 0) {
        return {
          percent: planMarket.percent,
          status: statusFromPercent(planMarket.percent),
          source: "plan",
          detail: planMarket.completedSignals + " of " + planMarket.totalSignals + " market-validation signals are present in the completed business plan. Missing: " + planMarket.missing.join(", ") + ".",
        };
      }
      return { percent: 0, status: "not-started", source: "none", detail: "No saved market research workspace found." };
    }
    const activities = Array.isArray(data.activities) ? data.activities : [];
    const competitors = Array.isArray(data.competitors) ? data.competitors : [];
    const customerSegments = Array.isArray(data.customerSegments) ? data.customerSegments : [];
    let score = 0;
    const completedActivities = activities.filter((item: any) => item?.status === "completed").length;
    score += Math.min(40, (completedActivities / Math.max(activities.length, 1)) * 40);
    score += Math.min(15, (new Set(activities.map((item: any) => item?.method).filter(Boolean)).size / 5) * 15);
    score += Math.min(15, (activities.reduce((sum: number, item: any) => sum + Number(item?.actualSampleSize || 0), 0) / 100) * 15);
    score += Math.min(10, (competitors.filter((item: any) => item?.analyzed).length / Math.max(competitors.length, 1)) * 10);
    score += Math.min(10, (customerSegments.filter((item: any) => item?.validated).length / Math.max(customerSegments.length, 1)) * 10);
    score += Math.min(10, (activities.filter((item: any) => item?.verified).length / Math.max(activities.length, 1)) * 10);
    const percent = clampPercent(score);
    const complete = percent >= 80;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: complete ? `Market research score is ${percent}%, meeting the tracker completion benchmark.` : `Market research completeness is ${percent}%.`,
      completed: complete,
    };
  }

  if (stepId === "endorser-comparison") {
    const data = readJson("endorser-comparison-state");
    if (!data || typeof data !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No durable endorser decision is recorded yet. Confirm it here after completing the comparison." };
    }
    const hasDecision = Boolean(data.completed || data.selectedEndorser || data.selectedEndorserId || data.finalSelection);
    const hasWork = hasDecision || Object.values(data).some(isFilled);
    const percent = hasDecision ? 100 : hasWork ? 50 : 0;
    return {
      percent,
      status: statusFromPercent(percent, hasDecision),
      source: "browser",
      detail: hasDecision ? "A saved endorser decision was found." : "Saved endorser comparison activity was found.",
      completed: hasDecision,
    };
  }

  if (stepId === "pitch-coach") {
    const data = readJson("pitch-coach-state");
    if (!data || typeof data !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No saved pitch coaching session found." };
    }
    const analysis = data.analysis;
    const hasAnalysis = Boolean(analysis && typeof analysis === "object" && Object.keys(analysis).length > 0);
    if (hasAnalysis) {
      return { percent: 100, status: "completed", source: "browser", detail: "A completed pitch analysis is saved.", completed: true };
    }
    let percent = 0;
    if (data.sessionStarted) percent += 20;
    if (String(data.pitchText || "").trim().length >= 100) percent += 35;
    if (data.selectedQuestion || data.selectedCategory) percent += 15;
    if (data.performanceMetrics && Object.keys(data.performanceMetrics || {}).length) percent += 20;
    if (data.currentPhase && Number(data.currentPhase) > 0) percent += 10;
    percent = Math.min(90, percent);
    return {
      percent,
      status: statusFromPercent(percent),
      source: "browser",
      detail: percent ? `Pitch coaching work is ${percent}% through the tracked preparation signals.` : "Pitch Coach was opened but no substantive session progress was detected.",
    };
  }

  if (stepId === "interview-prep") {
    const interviews = database?.interviews;
    if ((interviews?.completed || 0) > 0) {
      return {
        percent: 100,
        status: "completed",
        source: "database",
        detail: `${interviews?.completed} completed interview preparation session${interviews?.completed === 1 ? "" : "s"} recorded.`,
        completed: true,
      };
    }
    if ((interviews?.active || 0) > 0 || (interviews?.total || 0) > 0) {
      return { percent: 50, status: "in-progress", source: "database", detail: "Interview preparation activity is recorded but no completed session exists yet." };
    }
    return { percent: 0, status: "not-started", source: "database", detail: "No interview preparation sessions are recorded." };
  }

  if (stepId === "document-organizer") {
    const docs = database?.documents;
    const percent = clampPercent(docs?.completionPercent || 0);
    const complete = Boolean(docs && docs.requiredTotal > 0 && docs.requiredUploaded >= docs.requiredTotal);
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "database",
      detail: docs ? `${docs.requiredUploaded} of ${docs.requiredTotal} required documents are uploaded.` : "Required document progress is unavailable.",
      completed: complete,
    };
  }

  if (stepId === "cover-letter") {
    const data = readJson("coverLetterData");
    if (!data || typeof data !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No saved cover letter data found." };
    }
    const hasLetter = String(data.coverLetter || "").trim().length >= 100;
    if (hasLetter) return { percent: 100, status: "completed", source: "browser", detail: "A generated cover letter is saved.", completed: true };
    const fields = [data.company, data.role, data.strengths].filter(isFilled).length;
    const percent = Math.round((fields / 3) * 75);
    return { percent, status: statusFromPercent(percent), source: "browser", detail: `${fields} of 3 cover-letter inputs are saved.` };
  }

  if (stepId === "evidence-prep") {
    const data = readJson("evidence-collection-state");
    if (!data || typeof data !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No saved evidence collection workspace found." };
    }
    const documents = Array.isArray(data.documents) ? data.documents : [];
    const verified = documents.filter((item: any) => item?.status === "verified").length;
    const percent = documents.length ? Math.round((verified / documents.length) * 100) : (Array.isArray(data.uploadedFiles) && data.uploadedFiles.length ? 10 : 0);
    const complete = percent >= 80;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: documents.length ? `${verified} of ${documents.length} evidence items are verified.` : "Evidence files exist but the evidence checklist is not yet verified.",
      completed: complete,
    };
  }

  if (stepId === "final-review") {
    const reviews = database?.documentReviews;
    if ((reviews?.completed || 0) > 0) {
      return {
        percent: 100,
        status: "completed",
        source: "database",
        detail: `${reviews?.completed} completed document review${reviews?.completed === 1 ? "" : "s"} recorded.`,
        completed: true,
      };
    }
    if ((reviews?.active || 0) > 0) {
      return { percent: 60, status: "in-progress", source: "database", detail: "A document review is pending or processing." };
    }
    if ((reviews?.failed || 0) > 0) {
      return { percent: 25, status: "in-progress", source: "database", detail: "A previous document review failed. Run the review again to complete this step." };
    }
    return { percent: 0, status: "not-started", source: "database", detail: "No final document review is recorded." };
  }

  if (stepId === "compliance-check") {
    const checks = readJson("complianceCheckerProgress") || readJson("compliance-checker-state")?.checks;
    if (!checks || typeof checks !== "object") {
      return { percent: 0, status: "not-started", source: "none", detail: "No saved compliance checklist found." };
    }
    const completedCount = Object.values(checks).filter(Boolean).length;
    const percent = Math.min(100, Math.round((completedCount / 8) * 100));
    const complete = completedCount >= 8;
    return {
      percent,
      status: statusFromPercent(percent, complete),
      source: "browser",
      detail: `${Math.min(completedCount, 8)} of 8 compliance checks are complete.`,
      completed: complete,
    };
  }

  return { percent: 0, status: "not-started", source: "none", detail: "No progress source is available." };
}

function storedSignal(row?: StoredProgress): StepSignal | null {
  if (!row) return null;
  const percent = clampPercent(row.completionPercent);
  const status: StepStatus = row.status === "completed"
    ? "completed"
    : row.status === "in_progress" || row.status === "in-progress"
      ? "in-progress"
      : statusFromPercent(percent);
  const source = row.progressData?.source === "manual" ? "manual" : "synced";
  return {
    percent,
    status,
    source,
    detail: source === "manual"
      ? "Completion was confirmed from the Progress Tracker."
      : "Progress was synced to your account so it follows you between devices.",
    completed: status === "completed",
  };
}

function strongerSignal(a: StepSignal, b: StepSignal | null): StepSignal {
  if (!b) return a;
  const aScore = (a.status === "completed" ? 1000 : 0) + a.percent;
  const bScore = (b.status === "completed" ? 1000 : 0) + b.percent;
  return bScore > aScore ? b : a;
}

function statusLabel(status: StepStatus): string {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In progress";
  return "Not started";
}

function statusBadgeClass(status: StepStatus): string {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
  if (status === "in-progress") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300";
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
}

function sourceLabel(source: ProgressSource): string {
  if (source === "database") return "Verified from production records";
  if (source === "plan") return "Evidence found in completed business plan";
  if (source === "synced") return "Synced to your account";
  if (source === "browser") return "Detected from saved tool data";
  if (source === "manual") return "Confirmed by you";
  return "No progress evidence yet";
}

async function saveStepProgress(stepId: StepId, signal: StepSignal, source: "auto" | "manual") {
  const response = await fetch(`/api/progress-tracker/steps/${encodeURIComponent(stepId)}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      completionPercent: signal.percent,
      status: signal.status === "not-started" ? "not_started" : signal.status === "in-progress" ? "in_progress" : "completed",
      progressData: {
        source,
        detail: signal.detail,
        syncedAt: new Date().toISOString(),
      },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Failed to save progress (${response.status})`);
  return body;
}

export default function ProgressTracker() {
  const queryClient = useQueryClient();
  const [localRevision, setLocalRevision] = useState(0);
  const [autoSyncing, setAutoSyncing] = useState(false);

  const {
    data: tracker,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<TrackerResponse>({
    queryKey: ["/api/progress-tracker"],
    queryFn: async () => {
      const response = await fetch("/api/progress-tracker", { credentials: "include", headers: { Accept: "application/json" } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Failed to load progress (${response.status})`);
      return body;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const refreshLocal = () => setLocalRevision((value) => value + 1);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshLocal();
    };
    window.addEventListener("storage", refreshLocal);
    window.addEventListener("focus", refreshLocal);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", refreshLocal);
      window.removeEventListener("focus", refreshLocal);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const storedMap = useMemo(() => {
    const map = new Map<StepId, StoredProgress>();
    (tracker?.storedProgress || []).forEach((row) => map.set(row.stepId, row));
    return map;
  }, [tracker?.storedProgress]);

  const automaticSignals = useMemo(() => {
    const map = new Map<StepId, StepSignal>();
    ALL_STEPS.forEach((step) => map.set(step.id, browserSignal(step.id, tracker)));
    return map;
  }, [tracker, localRevision]);

  const resolvedSteps = useMemo<ResolvedStep[]>(() => {
    return ALL_STEPS.map((step) => {
      const automatic = automaticSignals.get(step.id) || { percent: 0, status: "not-started" as StepStatus, source: "none" as ProgressSource, detail: "No progress evidence yet." };
      const stored = storedSignal(storedMap.get(step.id));
      const resolved = OBJECTIVE_STEP_IDS.has(step.id) ? automatic : strongerSignal(automatic, stored);
      return {
        ...step,
        ...resolved,
        updatedAt: storedMap.get(step.id)?.updatedAt || null,
      };
    });
  }, [automaticSignals, storedMap]);

  const stepMap = useMemo(() => new Map(resolvedSteps.map((step) => [step.id, step])), [resolvedSteps]);

  useEffect(() => {
    if (!tracker || autoSyncing) return;
    const candidates = ALL_STEPS
      .map((step) => ({ step, signal: automaticSignals.get(step.id)! }))
      .filter(({ signal }) => signal && signal.source !== "none" && signal.percent > 0)
      .filter(({ step, signal }) => {
        const stored = storedMap.get(step.id);
        if (!stored) return true;
        const storedPercent = clampPercent(stored.completionPercent);
        const storedStatus = String(stored.status || "");
        const desiredStatus = signal.status === "completed" ? "completed" : signal.status === "in-progress" ? "in_progress" : "not_started";
        return storedPercent !== signal.percent || storedStatus !== desiredStatus;
      });

    if (!candidates.length) return;
    let cancelled = false;
    setAutoSyncing(true);
    Promise.allSettled(candidates.map(({ step, signal }) => saveStepProgress(step.id, signal, "auto")))
      .then((results) => {
        if (cancelled) return;
        if (results.some((result) => result.status === "fulfilled")) {
          queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] });
        }
      })
      .finally(() => {
        if (!cancelled) setAutoSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tracker, automaticSignals, storedMap, autoSyncing, queryClient]);

  const manualMutation = useMutation({
    mutationFn: async ({ step, complete }: { step: ResolvedStep; complete: boolean }) => {
      const signal: StepSignal = complete
        ? { percent: 100, status: "completed", source: "manual", detail: "You confirmed this step is complete." }
        : { percent: 0, status: "not-started", source: "manual", detail: "Manual completion was reset." };
      return saveStepProgress(step.id, signal, "manual");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] }),
  });

  const requiredSteps = resolvedSteps.filter((step) => step.required);
  const optionalSteps = resolvedSteps.filter((step) => !step.required);
  const requiredCompleted = requiredSteps.filter((step) => step.status === "completed").length;
  const optionalCompleted = optionalSteps.filter((step) => step.status === "completed").length;
  const applicationReady = requiredSteps.length > 0 && requiredCompleted === requiredSteps.length;
  const requiredReadiness = requiredSteps.length
    ? Math.round(requiredSteps.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / requiredSteps.length)
    : 0;
  const overallProgress = resolvedSteps.length
    ? Math.round(resolvedSteps.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / resolvedSteps.length)
    : 0;

  const nextRequiredStep = requiredSteps.find((step) => step.status !== "completed") || null;
  const currentPhase = PHASES.find((phase) => phase.steps.some((step) => step.required && stepMap.get(step.id)?.status !== "completed")) || PHASES[PHASES.length - 1];

  const phaseRequiredReadiness = useCallback((phase: JourneyPhase) => {
    const required = phase.steps
      .filter((step) => step.required)
      .map((step) => stepMap.get(step.id))
      .filter(Boolean) as ResolvedStep[];
    if (!required.length) return 100;
    return Math.round(required.reduce((sum, step) => sum + (step.status === "completed" ? 100 : step.percent), 0) / required.length);
  }, [stepMap]);

  const refreshEverything = async () => {
    setLocalRevision((value) => value + 1);
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="responsive-container py-10">
          <FeatureNavigation currentPage="progress" />
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 font-medium">Loading authoritative progress…</p>
              <p className="mt-1 text-sm text-muted-foreground">Checking saved journey state, plans, documents, interviews and reviews.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="responsive-container py-8 md:py-10">
        <FeatureNavigation currentPage="progress" />

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Application Progress Tracker</h1>
              <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Account-synced</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              One journey view for your questionnaire, assessments, planning, endorsement preparation, evidence and final review. Objective milestones are verified from production records; compatible saved tool progress is synced to your account.
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start" onClick={() => void refreshEverything()} disabled={isFetching || autoSyncing}>
            <RefreshCw className={`h-4 w-4 ${isFetching || autoSyncing ? "animate-spin" : ""}`} />
            Refresh progress
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The server-side progress record could not be loaded. Browser-saved signals are still shown where available, but cross-device progress cannot be verified until the server responds.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall journey</div>
              <div className="mt-2 text-3xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-3 h-2 bg-slate-200 dark:bg-slate-800" />
              <p className="mt-2 text-xs text-muted-foreground">All required and optional journey steps.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required readiness</div>
              <div className="mt-2 text-3xl font-bold">{requiredReadiness}%</div>
              <Progress value={requiredReadiness} className="mt-3 h-2 bg-slate-200 dark:bg-slate-800" />
              <p className="mt-2 text-xs text-muted-foreground">{requiredCompleted} of {requiredSteps.length} required milestones complete.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current phase</div>
              <div className="mt-2 text-xl font-bold">{currentPhase.title}</div>
              <p className="mt-2 text-xs text-muted-foreground">The first phase with an incomplete required milestone.</p>
            </CardContent>
          </Card>
          <Card className={applicationReady ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : ""}>
            <CardContent className="p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Application ready</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-bold">
                {applicationReady ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                {applicationReady ? "Required journey complete" : "Not yet"}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Readiness is only granted when every required tracker milestone is complete.</p>
            </CardContent>
          </Card>
        </div>

        {nextRequiredStep ? (
          <Card className="mb-7 border-primary/30 bg-primary/[0.03]">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><nextRequiredStep.icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">Next required step</div>
                  <h2 className="mt-1 text-lg font-bold">{nextRequiredStep.title}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{nextRequiredStep.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Current status: {statusLabel(nextRequiredStep.status)} · {nextRequiredStep.percent}%</p>
                </div>
              </div>
              <Button asChild className="shrink-0 gap-2">
                <Link href={nextRequiredStep.href}>Continue <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert className="mb-7 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertDescription>All required tracker milestones are complete. Optional preparation tasks can still be used to strengthen the application pack.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          {PHASES.map((phase) => {
            const phaseSteps = phase.steps.map((step) => stepMap.get(step.id)!).filter(Boolean);
            const phaseRequired = phaseSteps.filter((step) => step.required);
            const phaseOptional = phaseSteps.filter((step) => !step.required);
            const requiredPercent = phaseRequiredReadiness(phase);
            const phaseRequiredComplete = phaseRequired.filter((step) => step.status === "completed").length;
            const phaseOptionalComplete = phaseOptional.filter((step) => step.status === "completed").length;
            return (
              <Card key={phase.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                      <CardDescription className="mt-1">{phase.description}</CardDescription>
                    </div>
                    <div className="min-w-[170px] text-right">
                      <div className="text-sm font-bold">{requiredPercent}% required readiness</div>
                      <Progress value={requiredPercent} className="mt-2 h-2 bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {phaseRequiredComplete}/{phaseRequired.length} required complete
                        {phaseOptional.length ? " · " + phaseOptionalComplete + "/" + phaseOptional.length + " optional complete" : ""}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phaseSteps.map((step) => {
                    const Icon = step.icon;
                    const isManualCompleted = step.source === "manual" && step.status === "completed";
                    return (
                      <div key={step.id} className="rounded-xl border bg-background p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className={`mt-0.5 rounded-lg p-2 ${step.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : step.status === "in-progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{step.title}</h3>
                                <Badge variant="outline" className={statusBadgeClass(step.status)}>{statusLabel(step.status)}</Badge>
                                <Badge variant={step.required ? "default" : "secondary"}>{step.required ? "Required" : "Optional"}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                              <div className="mt-3 max-w-xl">
                                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                  <span className="font-medium">{sourceLabel(step.source)}</span>
                                  <span className="font-semibold">{step.status === "completed" ? 100 : step.percent}%</span>
                                </div>
                                <Progress value={step.status === "completed" ? 100 : step.percent} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
                                <p className="mt-1.5 text-xs text-muted-foreground">{step.detail}</p>
                                {step.updatedAt && step.source !== "database" && <p className="mt-1 text-[11px] text-muted-foreground">Account progress updated {formatDate(step.updatedAt)}</p>}
                              </div>

                              {step.id === "document-organizer" && tracker?.authoritative.documents.missingRequired?.length ? (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Missing required: {tracker.authoritative.documents.missingRequired.slice(0, 4).join(", ")}{tracker.authoritative.documents.missingRequired.length > 4 ? ` +${tracker.authoritative.documents.missingRequired.length - 4} more` : ""}
                                </div>
                              ) : null}

                              {step.id === "business-plan" && tracker?.authoritative.businessPlans.latest ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>Latest: <strong className="text-foreground">{tracker.authoritative.businessPlans.latest.businessName}</strong> · {tracker.authoritative.businessPlans.latest.status}</span>
                                  {tracker.authoritative.businessPlans.latest.pdfUrl && (
                                    <a href={tracker.authoritative.businessPlans.latest.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                                      <Download className="h-3.5 w-3.5" /> View PDF
                                    </a>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                            {step.manualCompletion && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={manualMutation.isPending}
                                onClick={() => manualMutation.mutate({ step, complete: !isManualCompleted })}
                              >
                                {isManualCompleted ? "Reset confirmation" : "Confirm completed"}
                              </Button>
                            )}
                            <Button asChild size="sm" variant={step.status === "not-started" ? "default" : "secondary"} className="gap-1.5">
                              <Link href={step.href}>{step.status === "not-started" ? "Start" : "Open"}<ArrowRight className="h-3.5 w-3.5" /></Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Info className="h-4 w-4" /> How progress is measured</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Production records</strong> are used for generated business plans, required document uploads, interview sessions and final document reviews.</p>
              <p><strong className="text-foreground">Business-plan evidence</strong> can satisfy a milestone only when the stored structured fields meet that milestone's explicit evidence rules. It does not automatically complete separate diagnostics such as Innovation Score.</p>
              <p><strong className="text-foreground">Saved tool data</strong> is interpreted using each tool's real data structure rather than a single generic completion flag.</p>
              <p><strong className="text-foreground">Account sync</strong> migrates compatible browser-only progress into the existing server-side progress store, so it can be recovered on another device after it has been synced.</p>
              <p><strong className="text-foreground">Readiness</strong> requires every required milestone to be complete. Optional tasks improve preparation but never block the next required step.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journey summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{requiredCompleted}</div><div className="text-xs text-muted-foreground">Required complete</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{requiredSteps.length - requiredCompleted}</div><div className="text-xs text-muted-foreground">Required remaining</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{optionalCompleted}</div><div className="text-xs text-muted-foreground">Optional complete</div></div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-2xl font-bold">{resolvedSteps.filter((step) => step.status === "in-progress").length}</div><div className="text-xs text-muted-foreground">In progress</div></div>
              <div className="col-span-2 text-xs text-muted-foreground sm:col-span-4">
                Last server refresh: {tracker?.generatedAt ? formatDate(tracker.generatedAt) : "Unavailable"}{autoSyncing ? " · Syncing browser progress…" : ""}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
