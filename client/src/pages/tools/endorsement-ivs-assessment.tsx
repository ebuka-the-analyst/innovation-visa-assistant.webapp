import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Loader2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  useApplicationContextPrefill,
  useToolRunHistory,
  type ApplicationBusinessPlan,
  type ApplicationFinancialModelPrefill,
} from "@/hooks/useToolPlatform";
import { FieldEnhancer } from "@/components/FieldEnhancer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPPORTED_TOOLS = new Set([
  "endorsement-readiness",
  "criteria-scorer",
  "innovation-score",
  "innovation-validation",
  "business-model-validator",
  "viability-checker",
]);

const TOOL_COPY: Record<string, { title: string; subtitle: string }> = {
  "endorsement-readiness": {
    title: "Endorsement Readiness & IVS Evidence Review",
    subtitle: "Assess how well your current evidence addresses the Innovation, Viability and Scalability principles used by endorsing bodies.",
  },
  "criteria-scorer": {
    title: "Innovation, Viability & Scalability Criteria Review",
    subtitle: "Run a transparent criterion-by-criterion evidence coverage review without inventing a visa success score.",
  },
  "innovation-score": {
    title: "Innovation Evidence Assessment",
    subtitle: "Test your USP, defensibility, internal ownership and technical evidence against the official innovation principles.",
  },
  "innovation-validation": {
    title: "Innovation Validation & Endorser Challenge Lab",
    subtitle: "Identify evidence gaps and the questions an assessor is likely to ask about the claimed innovation.",
  },
  "business-model-validator": {
    title: "Business Model & Endorsement Readiness Review",
    subtitle: "Stress-test the business model across innovation, resources, demand, founder capability and scale.",
  },
  "viability-checker": {
    title: "Viability Evidence Assessment",
    subtitle: "Check whether funding, cost assumptions, market demand and founder capability are evidenced strongly enough for endorser review.",
  },
};

type EvidenceType =
  | "competitor_analysis"
  | "market_research"
  | "customer_interviews"
  | "loi_or_contract"
  | "waitlist_or_preorders"
  | "pilot_or_trial_metrics"
  | "revenue_or_customer_metrics"
  | "technical_architecture"
  | "prototype_or_demo"
  | "research_and_development"
  | "ip_or_patent_material"
  | "founder_cv_or_credentials"
  | "team_capability"
  | "cost_research_or_quotes"
  | "financial_model"
  | "funding_evidence"
  | "hiring_plan"
  | "national_expansion_plan"
  | "international_expansion_plan"
  | "operational_scaling_plan"
  | "partnership_evidence"
  | "other";

type EvidenceItem = {
  id: string;
  type: EvidenceType;
  title: string;
  summary: string;
  reference: string;
};

type FormState = {
  businessName: string;
  businessSummary: string;
  marketNeed: string;
  targetCustomers: string;
  uniqueSellingProposition: string;
  competitorDifferentiation: string;
  replicationBarriers: string;
  innovationCoreToBusiness: boolean;
  innovationDeliveryModel: "" | "primarily_in_house" | "mixed" | "primarily_outsourced";
  internalInnovationOwnership: string;
  founderCapability: string;
  fundingAvailableGbp: string;
  minimumSetupCostGbp: string;
  monthlyOperatingCostGbp: string;
  forecastMonthlyRevenueGbp: string;
  financialAssumptions: string;
  demandEvidenceSummary: string;
  growthPlan: string;
  skilledJobsPlannedThreeYears: string;
  nationalGrowthPlan: string;
  internationalGrowthPlan: string;
  scalingOperations: string;
  projectionsResearchBasis: string;
  evidenceItems: EvidenceItem[];
};

type SavedBusinessPlan = ApplicationBusinessPlan & {
  isDemoData?: boolean;
};

type CheckResult = {
  id: string;
  label: string;
  met: boolean;
  critical: boolean;
  explanation: string;
  evidenceTypes: string[];
  ruleRefs: string[];
};

type CriterionResult = {
  id: "innovation" | "viability" | "scalability";
  name: string;
  status: "critical_gap" | "needs_strengthening" | "evidence_ready_for_endorser_review";
  coverage: { met: number; total: number; percent: number };
  criticalGapCount: number;
  checks: CheckResult[];
  sourceRefs: string[];
};

type Assessment = {
  policyVersion: string;
  assessedAt: string;
  overallStatus: "critical_gaps" | "needs_strengthening" | "evidence_ready_for_endorser_review";
  assessmentMeaning: string;
  criteria: CriterionResult[];
  criticalGaps: Array<{ criterion: string; checkId: string; label: string; explanation: string }>;
  evidenceGaps: Array<{ criterion: string; checkId: string; label: string; expectedEvidenceTypes: string[] }>;
  assessorChallengeQuestions: Array<{ criterion: string; checkId: string; question: string }>;
  evidenceInventory: { itemCount: number; evidenceTypes: string[]; referencedEvidenceCount: number; evidenceRefs: string[] };
  financialRealityCheck: {
    fundingAvailableGbp: number;
    minimumSetupCostGbp: number;
    setupFundingGapGbp: number;
    remainingFundsAfterSetupGbp: number;
    monthlyOperatingCostGbp: number;
    runwayMonthsAfterSetup: number | null;
    forecastMonthlyRevenueGbp: number;
    note: string;
  };
  redFlags: string[];
  sources: Array<{ id: string; title: string; url: string }>;
};

type AssessmentResponse = {
  success: true;
  runId: string;
  validationState: "validated";
  policyVersion: string;
  registryVersion: string;
  resultSha256: string;
  assessment: Assessment;
};

type AutofillSummary = {
  businessName: string | null;
  reusableFieldCount: number;
  restoredPreviousReview: boolean;
  previousReviewSkippedForDifferentBusiness: boolean;
  availableDocumentCount: number;
  reusedFinancialModel: boolean;
};

const EVIDENCE_OPTIONS: Array<{ value: EvidenceType; label: string }> = [
  ["competitor_analysis", "Competitor analysis"],
  ["market_research", "Market research"],
  ["customer_interviews", "Customer interviews"],
  ["loi_or_contract", "LOI / customer contract"],
  ["waitlist_or_preorders", "Waitlist / pre-orders"],
  ["pilot_or_trial_metrics", "Pilot / trial metrics"],
  ["revenue_or_customer_metrics", "Revenue / customer metrics"],
  ["technical_architecture", "Technical architecture"],
  ["prototype_or_demo", "Prototype / demo"],
  ["research_and_development", "R&D evidence"],
  ["ip_or_patent_material", "IP / patent material"],
  ["founder_cv_or_credentials", "Founder CV / credentials"],
  ["team_capability", "Team capability evidence"],
  ["cost_research_or_quotes", "Cost research / supplier quotes"],
  ["financial_model", "Financial model"],
  ["funding_evidence", "Funding evidence"],
  ["hiring_plan", "Hiring plan"],
  ["national_expansion_plan", "National expansion plan"],
  ["international_expansion_plan", "International expansion plan"],
  ["operational_scaling_plan", "Operational scaling plan"],
  ["partnership_evidence", "Partnership evidence"],
  ["other", "Other evidence"],
].map(([value, label]) => ({ value: value as EvidenceType, label }));

const EVIDENCE_TYPES = new Set(EVIDENCE_OPTIONS.map((option) => option.value));

function blankEvidence(): EvidenceItem {
  return { id: crypto.randomUUID(), type: "other", title: "", summary: "", reference: "" };
}

function initialForm(): FormState {
  return {
    businessName: "",
    businessSummary: "",
    marketNeed: "",
    targetCustomers: "",
    uniqueSellingProposition: "",
    competitorDifferentiation: "",
    replicationBarriers: "",
    innovationCoreToBusiness: false,
    innovationDeliveryModel: "",
    internalInnovationOwnership: "",
    founderCapability: "",
    fundingAvailableGbp: "",
    minimumSetupCostGbp: "",
    monthlyOperatingCostGbp: "",
    forecastMonthlyRevenueGbp: "",
    financialAssumptions: "",
    demandEvidenceSummary: "",
    growthPlan: "",
    skilledJobsPlannedThreeYears: "0",
    nationalGrowthPlan: "",
    internationalGrowthPlan: "",
    scalingOperations: "",
    projectionsResearchBasis: "",
    evidenceItems: [],
  };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function limited(value: string, maxLength: number): string {
  const cleaned = value.trim();
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength).trimEnd();
}

function joined(parts: Array<[string, unknown]>, maxLength: number): string {
  const value = parts
    .map(([label, raw]) => [label, text(raw)] as const)
    .filter(([, raw]) => raw.length > 0)
    .map(([label, raw]) => `${label}: ${raw}`)
    .join("\n\n");
  return limited(value, maxLength);
}

function buildBusinessPlanPrefill(plan: ApplicationBusinessPlan): Partial<FormState> {
  return {
    businessName: limited(text(plan.businessName), 160),
    businessSummary: joined([
      ["Industry", plan.industry],
      ["Product / technology", plan.technology],
      ["Current product status", plan.productStatus],
      ["Business vision", plan.vision],
    ], 5000),
    marketNeed: limited(text(plan.problem), 4000),
    targetCustomers: joined([
      ["Market sizing / customer segments", plan.marketSize],
      ["Customer discovery segments", plan.customerInterviews],
      ["Existing customers / users", plan.existingCustomers],
      ["Willingness-to-pay segments", plan.willingnessToPay],
    ], 2500),
    uniqueSellingProposition: limited(text(plan.uniqueness), 3000),
    competitorDifferentiation: joined([
      ["Named competitors / alternatives", plan.competitors],
      ["Competitive differentiation", plan.competitiveDifferentiation],
    ], 3000),
    replicationBarriers: joined([
      ["IP / patent status", plan.patentStatus],
      ["Data architecture", plan.dataArchitecture],
      ["AI / technical methodology", plan.aiMethodology],
      ["Technology stack", plan.techStack],
    ], 3000),
    internalInnovationOwnership: joined([
      ["Existing IP / ownership statements", plan.patentStatus],
      ["Founder delivery projects", plan.relevantProjects],
      ["Architecture decisions", plan.dataArchitecture],
      ["Technical methodology", plan.aiMethodology],
    ], 3000),
    founderCapability: joined([
      ["Relevant experience", plan.experience],
      ["Education", plan.founderEducation],
      ["Work history", plan.founderWorkHistory],
      ["Achievements", plan.founderAchievements],
      ["Relevant projects", plan.relevantProjects],
    ], 3500),
    fundingAvailableGbp: Number.isFinite(plan.funding) ? String(Math.max(0, plan.funding)) : "",
    financialAssumptions: joined([
      ["Monthly projections", plan.monthlyProjections],
      ["Funding sources", plan.fundingSources],
      ["Detailed costs", plan.detailedCosts],
      ["Customer acquisition cost", Number.isFinite(plan.customerAcquisitionCost) ? `£${plan.customerAcquisitionCost}` : ""],
      ["Lifetime value", Number.isFinite(plan.lifetimeValue) ? `£${plan.lifetimeValue}` : ""],
      ["Payback period", Number.isFinite(plan.paybackPeriod) ? String(plan.paybackPeriod) : ""],
    ], 4000),
    demandEvidenceSummary: joined([
      ["Existing customers", plan.existingCustomers],
      ["Beta testers", plan.betaTesters],
      ["Traction evidence", plan.tractionEvidence],
      ["Customer interviews", plan.customerInterviews],
      ["Letters of intent", plan.lettersOfIntent],
      ["Willingness-to-pay evidence", plan.willingnessToPay],
    ], 3500),
    growthPlan: joined([
      ["Expansion strategy", plan.expansion],
      ["Business vision", plan.vision],
      ["Hiring plan", plan.hiringPlan],
    ], 4000),
    skilledJobsPlannedThreeYears: Number.isFinite(plan.jobCreation) ? String(Math.max(0, plan.jobCreation)) : "0",
    nationalGrowthPlan: joined([
      ["Target UK regions", plan.specificRegions],
      ["Expansion strategy", plan.expansion],
    ], 3000),
    internationalGrowthPlan: limited(text(plan.internationalPlan), 3000),
    scalingOperations: joined([
      ["Hiring plan", plan.hiringPlan],
      ["Technology stack", plan.techStack],
      ["Data architecture", plan.dataArchitecture],
      ["Compliance design", plan.complianceDesign],
    ], 3000),
    projectionsResearchBasis: joined([
      ["Market-size research", plan.marketSize],
      ["Customer interviews", plan.customerInterviews],
      ["Willingness-to-pay evidence", plan.willingnessToPay],
    ], 3500),
  };
}

function buildFinancialModelPrefill(financialModel: ApplicationFinancialModelPrefill | null): Partial<FormState> {
  if (!financialModel) return {};
  return {
    minimumSetupCostGbp: Number.isFinite(financialModel.oneTimeSetupCostGbp)
      ? String(financialModel.oneTimeSetupCostGbp)
      : "",
    monthlyOperatingCostGbp: Number.isFinite(financialModel.monthlyOperatingCostGbp)
      ? String(financialModel.monthlyOperatingCostGbp)
      : "",
    forecastMonthlyRevenueGbp: Number.isFinite(financialModel.startingMonthlyRevenueGbp)
      ? String(financialModel.startingMonthlyRevenueGbp)
      : "",
  };
}

function validEvidenceItems(value: unknown): EvidenceItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const item = raw as Record<string, unknown>;
    const type = typeof item.type === "string" && EVIDENCE_TYPES.has(item.type as EvidenceType)
      ? item.type as EvidenceType
      : null;
    if (!type || typeof item.id !== "string" || typeof item.title !== "string" || typeof item.summary !== "string") return [];
    return [{
      id: item.id,
      type,
      title: item.title,
      summary: item.summary,
      reference: typeof item.reference === "string" ? item.reference : "",
    }];
  });
}

function buildPreviousReviewPrefill(snapshot: Record<string, unknown>): Partial<FormState> {
  const result: Partial<FormState> = {};
  const target = result as Record<string, unknown>;
  const stringKeys = [
    "businessName",
    "businessSummary",
    "marketNeed",
    "targetCustomers",
    "uniqueSellingProposition",
    "competitorDifferentiation",
    "replicationBarriers",
    "internalInnovationOwnership",
    "founderCapability",
    "financialAssumptions",
    "demandEvidenceSummary",
    "growthPlan",
    "nationalGrowthPlan",
    "internationalGrowthPlan",
    "scalingOperations",
    "projectionsResearchBasis",
  ];
  for (const key of stringKeys) {
    if (typeof snapshot[key] === "string") target[key] = snapshot[key];
  }

  for (const key of [
    "fundingAvailableGbp",
    "minimumSetupCostGbp",
    "monthlyOperatingCostGbp",
    "forecastMonthlyRevenueGbp",
    "skilledJobsPlannedThreeYears",
  ]) {
    const value = snapshot[key];
    if (typeof value === "number" && Number.isFinite(value)) target[key] = String(value);
    if (typeof value === "string" && value.trim()) target[key] = value;
  }

  if (typeof snapshot.innovationCoreToBusiness === "boolean") {
    result.innovationCoreToBusiness = snapshot.innovationCoreToBusiness;
  }
  if (["primarily_in_house", "mixed", "primarily_outsourced"].includes(String(snapshot.innovationDeliveryModel || ""))) {
    result.innovationDeliveryModel = snapshot.innovationDeliveryModel as FormState["innovationDeliveryModel"];
  }

  const evidenceItems = validEvidenceItems(snapshot.evidenceItems);
  if (evidenceItems.length > 0) result.evidenceItems = evidenceItems;
  return result;
}

function previousReviewMatchesPlan(snapshot: Record<string, unknown>, plan: ApplicationBusinessPlan | null): boolean {
  if (!plan) return true;
  const previousName = text(snapshot.businessName).toLocaleLowerCase("en-GB");
  const planName = text(plan.businessName).toLocaleLowerCase("en-GB");
  return Boolean(previousName && planName && previousName === planName);
}

function meaningfulCandidateValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}

function mergeIntoUntouchedForm(current: FormState, candidate: Partial<FormState>): FormState {
  const baseline = initialForm();
  const next = { ...current };
  const nextRecord = next as unknown as Record<string, unknown>;
  const currentRecord = current as unknown as Record<string, unknown>;
  const baselineRecord = baseline as unknown as Record<string, unknown>;

  for (const [key, value] of Object.entries(candidate)) {
    if (!meaningfulCandidateValue(value)) continue;
    const currentValue = currentRecord[key];
    const baselineValue = baselineRecord[key];
    const untouched = Array.isArray(currentValue)
      ? currentValue.length === 0
      : currentValue === baselineValue || (typeof currentValue === "string" && currentValue.trim() === "");
    if (untouched) nextRecord[key] = value;
  }
  return next;
}

function FieldCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function safeFieldName(label: string): string {
  return `ivs-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  fieldName,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fieldName?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <FieldEnhancer
        fieldName={fieldName || safeFieldName(label)}
        fieldLabel={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={rows <= 2 ? "min-h-[100px]" : "min-h-[150px]"}
      />
    </div>
  );
}

function statusLabel(status: CriterionResult["status"] | Assessment["overallStatus"]) {
  if (status === "evidence_ready_for_endorser_review") return "Evidence ready for endorser review";
  if (status === "critical_gap" || status === "critical_gaps") return "Critical gaps";
  return "Needs strengthening";
}

function badgeVariant(status: CriterionResult["status"] | Assessment["overallStatus"]): "default" | "secondary" | "destructive" {
  if (status === "evidence_ready_for_endorser_review") return "default";
  if (status === "critical_gap" || status === "critical_gaps") return "destructive";
  return "secondary";
}

export default function EndorsementIVSAssessment() {
  const params = useParams<{ toolId: string }>();
  const toolId = SUPPORTED_TOOLS.has(params.toolId || "") ? params.toolId! : "endorsement-readiness";
  const copy = TOOL_COPY[toolId] || TOOL_COPY["endorsement-readiness"];
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [autofillSummary, setAutofillSummary] = useState<AutofillSummary | null>(null);
  const [selectedBusinessPlanId, setSelectedBusinessPlanId] = useState("");
  const runKey = useRef<string | null>(null);
  const autofillAppliedForTool = useRef<string | null>(null);
  const history = useToolRunHistory(toolId, true);
  const applicationPrefill = useApplicationContextPrefill(toolId, true);
  const savedPlansQuery = useQuery<SavedBusinessPlan[]>({
    queryKey: ["/api/business-plans", "ivs-plan-picker"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/business-plans");
      return response.json();
    },
    staleTime: 30_000,
    retry: false,
  });

  const savedBusinessPlans = useMemo(() => {
    return (savedPlansQuery.data || [])
      .filter((plan) => plan && plan.id && text(plan.businessName) && String(plan.status || "").toLowerCase() === "completed" && !plan.isDemoData)
      .sort((left, right) => {
        const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0;
        const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0;
        return rightTime - leftTime;
      });
  }, [savedPlansQuery.data]);

  useEffect(() => {
    const currentPlanId = applicationPrefill.data?.businessPlan?.id;
    if (!currentPlanId || selectedBusinessPlanId) return;
    if (savedBusinessPlans.some((plan) => plan.id === currentPlanId)) {
      setSelectedBusinessPlanId(currentPlanId);
    }
  }, [applicationPrefill.data?.businessPlan?.id, savedBusinessPlans, selectedBusinessPlanId]);

  useEffect(() => {
    const data = applicationPrefill.data;
    if (!data || autofillAppliedForTool.current === toolId) return;

    const plan = data.businessPlan;
    const planPrefill = plan ? buildBusinessPlanPrefill(plan) : {};
    const financialPrefill = buildFinancialModelPrefill(data.relatedToolData?.financialModel || null);
    const previousSnapshot = data.previousToolRun?.inputSnapshot || null;
    const previousMatches = previousSnapshot ? previousReviewMatchesPlan(previousSnapshot, plan) : false;
    const previousPrefill = previousSnapshot && previousMatches
      ? buildPreviousReviewPrefill(previousSnapshot)
      : {};
    const combinedPrefill: Partial<FormState> = { ...planPrefill, ...financialPrefill, ...previousPrefill };

    setForm((current) => mergeIntoUntouchedForm(current, combinedPrefill));
    autofillAppliedForTool.current = toolId;
    setAutofillSummary({
      businessName: plan?.businessName || null,
      reusableFieldCount: Object.values(combinedPrefill).filter(meaningfulCandidateValue).length,
      restoredPreviousReview: Boolean(previousSnapshot && previousMatches),
      previousReviewSkippedForDifferentBusiness: Boolean(previousSnapshot && plan && !previousMatches),
      availableDocumentCount: data.documents.length,
      reusedFinancialModel: Object.values(financialPrefill).some(meaningfulCandidateValue),
    });
  }, [applicationPrefill.data, toolId]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadSelectedBusinessPlan = () => {
    const selectedPlan = savedBusinessPlans.find((plan) => plan.id === selectedBusinessPlanId);
    if (!selectedPlan) return;

    const data = applicationPrefill.data;
    const isCurrentContextPlan = Boolean(data?.businessPlan?.id && data.businessPlan.id === selectedPlan.id);
    const planPrefill = buildBusinessPlanPrefill(selectedPlan);
    const financialPrefill = isCurrentContextPlan
      ? buildFinancialModelPrefill(data?.relatedToolData?.financialModel || null)
      : {};
    const previousSnapshot = isCurrentContextPlan ? data?.previousToolRun?.inputSnapshot || null : null;
    const previousMatches = previousSnapshot ? previousReviewMatchesPlan(previousSnapshot, selectedPlan) : false;
    const previousPrefill = previousSnapshot && previousMatches
      ? buildPreviousReviewPrefill(previousSnapshot)
      : {};
    const combinedPrefill: Partial<FormState> = { ...planPrefill, ...financialPrefill, ...previousPrefill };

    setForm(mergeIntoUntouchedForm(initialForm(), combinedPrefill));
    setResult(null);
    runKey.current = null;
    setAutofillSummary({
      businessName: selectedPlan.businessName,
      reusableFieldCount: Object.values(combinedPrefill).filter(meaningfulCandidateValue).length,
      restoredPreviousReview: Boolean(previousSnapshot && previousMatches),
      previousReviewSkippedForDifferentBusiness: false,
      availableDocumentCount: data?.documents.length || 0,
      reusedFinancialModel: Object.values(financialPrefill).some(meaningfulCandidateValue),
    });
  };

  const mutation = useMutation({
    mutationFn: async (): Promise<AssessmentResponse> => {
      if (!runKey.current) runKey.current = crypto.randomUUID();
      const numberValue = (value: string, label: string, integer = false) => {
        const cleaned = value.trim();
        if (!cleaned) throw new Error(`Enter a valid ${label}.`);
        const parsed = Number(cleaned);
        if (!Number.isFinite(parsed) || parsed < 0 || (integer && !Number.isInteger(parsed))) throw new Error(`Enter a valid ${label}.`);
        return parsed;
      };
      if (!form.innovationDeliveryModel) {
        throw new Error("Select how the core innovation is delivered.");
      }
      const cleanEvidence = form.evidenceItems.filter((item) => item.title.trim() || item.summary.trim());
      const response = await apiRequest("POST", "/api/endorsement/ivs-assess", {
        ...form,
        toolId,
        innovationDeliveryModel: form.innovationDeliveryModel,
        fundingAvailableGbp: numberValue(form.fundingAvailableGbp, "funding amount"),
        minimumSetupCostGbp: numberValue(form.minimumSetupCostGbp, "minimum setup cost"),
        monthlyOperatingCostGbp: numberValue(form.monthlyOperatingCostGbp, "monthly operating cost"),
        forecastMonthlyRevenueGbp: numberValue(form.forecastMonthlyRevenueGbp, "forecast monthly revenue"),
        skilledJobsPlannedThreeYears: numberValue(form.skilledJobsPlannedThreeYears, "three-year skilled job target", true),
        evidenceItems: cleanEvidence,
        clientRunKey: runKey.current,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setResult(data);
      runKey.current = null;
      await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", toolId] });
      window.setTimeout(() => document.getElementById("ivs-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    },
  });

  const referencedEvidence = useMemo(
    () => form.evidenceItems.filter((item) => item.reference.trim()).length,
    [form.evidenceItems],
  );

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Production evidence engine</Badge>
              <Badge variant="outline">Official IVS criteria</Badge>
              <Badge variant="outline">No invented success probability</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-2 max-w-4xl text-muted-foreground">{copy.subtitle}</p>
          </div>
          {(history.data?.runs?.length || 0) > 0 && (
            <Card className="min-w-[210px]"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Saved reviews</div><div className="text-2xl font-bold">{history.data!.runs.length}</div><div className="text-xs text-muted-foreground">Durable account history</div></CardContent></Card>
          )}
        </header>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>What this tool can and cannot tell you</AlertTitle>
          <AlertDescription>
            It measures declared evidence coverage against official endorsement principles and identifies gaps, red flags and assessor questions. Only an authorised endorsing body can decide whether a business is Innovative, Viable and Scalable.
          </AlertDescription>
        </Alert>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Load saved business plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose one of your completed business plans to repopulate this working assessment. Loading a plan replaces the current form values but does not change the saved business plan itself.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label>Saved business plan</Label>
                <Select value={selectedBusinessPlanId} onValueChange={setSelectedBusinessPlanId} disabled={savedPlansQuery.isLoading || savedBusinessPlans.length === 0}>
                  <SelectTrigger data-testid="select-ivs-business-plan"><SelectValue placeholder={savedPlansQuery.isLoading ? "Loading saved plans..." : "Select a completed business plan"} /></SelectTrigger>
                  <SelectContent>
                    {savedBusinessPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.businessName}{plan.industry ? ` · ${plan.industry}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" onClick={loadSelectedBusinessPlan} disabled={!selectedBusinessPlanId || savedPlansQuery.isLoading} data-testid="btn-load-ivs-business-plan">
                <RefreshCcw className="h-4 w-4 mr-2" />Load this business plan
              </Button>
            </div>
            {savedPlansQuery.isError && <p className="mt-3 text-sm text-destructive">Saved business plans could not be loaded. Your current assessment is unaffected.</p>}
            {!savedPlansQuery.isLoading && !savedPlansQuery.isError && savedBusinessPlans.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No completed saved business plans are available yet.</p>}
          </CardContent>
        </Card>

        {autofillSummary && autofillSummary.reusableFieldCount > 0 && (
          <Alert className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>Application data reused automatically</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                {autofillSummary.restoredPreviousReview
                  ? "Your most recent saved review was restored, with remaining gaps filled from your saved application data."
                  : `Relevant fields were filled from ${autofillSummary.businessName ? `${autofillSummary.businessName}'s` : "your"} completed business plan.`}
                {" "}Only fields with a reliable saved source are reused; unsupported answers remain for you to confirm.
              </p>
              {autofillSummary.reusedFinancialModel && (
                <p>Exact setup-cost, operating-cost and starting-revenue inputs were also reused from your latest completed financial tool for this same business.</p>
              )}
              {autofillSummary.availableDocumentCount > 0 && (
                <p>
                  {autofillSummary.availableDocumentCount} uploaded document{autofillSummary.availableDocumentCount === 1 ? " is" : "s are"} available in your account. They are not automatically counted as evidence until their contents are mapped to a specific claim.
                </p>
              )}
              {autofillSummary.previousReviewSkippedForDifferentBusiness && (
                <p>A previous review for a different business was deliberately not restored.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {applicationPrefill.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Automatic application reuse is temporarily unavailable</AlertTitle>
            <AlertDescription>You can still complete and run the assessment manually. No saved application data has been overwritten.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-5 xl:grid-cols-2">
          <FieldCard title="1. Business and market foundation">
            <div className="space-y-2"><Label>Business name</Label><Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Business name" /></div>
            <TextField label="Business summary" value={form.businessSummary} onChange={(v) => update("businessSummary", v)} placeholder="What you are building, for whom, and how it works." />
            <TextField label="Market need" value={form.marketNeed} onChange={(v) => update("marketNeed", v)} placeholder="What specific unmet or underserved need exists?" />
            <TextField label="Target customers" value={form.targetCustomers} onChange={(v) => update("targetCustomers", v)} placeholder="Specific customer segments, buyer and user." />
          </FieldCard>

          <FieldCard title="2. Innovation" description="The guidance focuses on a compelling USP, defensibility, core innovation and internal delivery capability.">
            <TextField label="Unique selling proposition" value={form.uniqueSellingProposition} onChange={(v) => update("uniqueSellingProposition", v)} placeholder="What is genuinely different?" />
            <TextField label="Differentiation from named competitors" value={form.competitorDifferentiation} onChange={(v) => update("competitorDifferentiation", v)} placeholder="Compare against real alternatives, not generic claims." />
            <TextField label="Barriers to replication" value={form.replicationBarriers} onChange={(v) => update("replicationBarriers", v)} placeholder="IP, proprietary data, R&D, know-how, integrations, network effects or other barriers." />
            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer"><Checkbox checked={form.innovationCoreToBusiness} onCheckedChange={(v) => update("innovationCoreToBusiness", v === true)} /><span><span className="block text-sm font-medium">Innovation is core to the business proposition</span><span className="block text-xs text-muted-foreground mt-1">The business would materially change if the innovation were removed.</span></span></label>
            <div className="space-y-2"><Label>How is the core innovation delivered?</Label><Select value={form.innovationDeliveryModel} onValueChange={(v: FormState["innovationDeliveryModel"]) => update("innovationDeliveryModel", v)}><SelectTrigger><SelectValue placeholder="Select delivery model" /></SelectTrigger><SelectContent><SelectItem value="primarily_in_house">Primarily within the founding business</SelectItem><SelectItem value="mixed">Mixed internal and specialist external delivery</SelectItem><SelectItem value="primarily_outsourced">Primarily outsourced to a third party</SelectItem></SelectContent></Select></div>
            <TextField label="Internal ownership of the innovation" value={form.internalInnovationOwnership} onChange={(v) => update("internalInnovationOwnership", v)} placeholder="Who owns product, R&D, architecture, technical decisions and implementation?" />
          </FieldCard>

          <FieldCard title="3. Viability" description="Resources, defensible financials, founder capability and credible demand are assessed separately.">
            <TextField label="Founder/team capability" value={form.founderCapability} onChange={(v) => update("founderCapability", v)} placeholder="Relevant expertise, achievements, qualifications and execution evidence." />
            <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Available business funding (£)</Label><Input type="number" min={0} value={form.fundingAvailableGbp} onChange={(e) => update("fundingAvailableGbp", e.target.value)} /></div><div className="space-y-2"><Label>Researched minimum setup cost (£)</Label><Input type="number" min={0} value={form.minimumSetupCostGbp} onChange={(e) => update("minimumSetupCostGbp", e.target.value)} /></div><div className="space-y-2"><Label>Monthly operating cost (£)</Label><Input type="number" min={0} value={form.monthlyOperatingCostGbp} onChange={(e) => update("monthlyOperatingCostGbp", e.target.value)} /></div><div className="space-y-2"><Label>Forecast monthly revenue (£)</Label><Input type="number" min={0} value={form.forecastMonthlyRevenueGbp} onChange={(e) => update("forecastMonthlyRevenueGbp", e.target.value)} /></div></div>
            <TextField label="Financial assumptions and evidence basis" value={form.financialAssumptions} onChange={(v) => update("financialAssumptions", v)} placeholder="Explain pricing, volumes, costs, growth and where each assumption comes from." />
            <TextField label="Customer demand evidence summary" value={form.demandEvidenceSummary} onChange={(v) => update("demandEvidenceSummary", v)} placeholder="Interviews, LOIs, pilots, waitlists, pre-orders, revenue or other traction." />
          </FieldCard>

          <FieldCard title="4. Scalability" description="Structured growth, skilled jobs, national/international markets and research-backed projections.">
            <TextField label="Structured growth plan" value={form.growthPlan} onChange={(v) => update("growthPlan", v)} placeholder="Sequenced milestones, resources, capacity and growth constraints." />
            <div className="space-y-2"><Label>Skilled jobs planned within 3 years</Label><Input type="number" min={0} value={form.skilledJobsPlannedThreeYears} onChange={(e) => update("skilledJobsPlannedThreeYears", e.target.value)} /></div>
            <TextField label="National growth plan" value={form.nationalGrowthPlan} onChange={(v) => update("nationalGrowthPlan", v)} placeholder="UK regions, customer segments, channels and timing." />
            <TextField label="International growth plan" value={form.internationalGrowthPlan} onChange={(v) => update("internationalGrowthPlan", v)} placeholder="Target countries, rationale, market entry and evidence." />
            <TextField label="How operations will scale" value={form.scalingOperations} onChange={(v) => update("scalingOperations", v)} placeholder="Technology, operations, support, supply, management and delivery capacity." />
            <TextField label="Research basis for projections" value={form.projectionsResearchBasis} onChange={(v) => update("projectionsResearchBasis", v)} placeholder="Market sources, comparable businesses, pilots or validated assumptions." />
          </FieldCard>
        </div>

        <FieldCard title="5. Evidence inventory" description="Add the actual evidence you can produce. The engine evaluates coverage by evidence type, not by how persuasive the title sounds.">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-muted-foreground">{form.evidenceItems.length} evidence items • {referencedEvidence} with stable references</div><Button variant="outline" onClick={() => update("evidenceItems", [...form.evidenceItems, blankEvidence()])}><Plus className="h-4 w-4 mr-2" />Add evidence</Button></div>
          {form.evidenceItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"><FileSearch className="h-8 w-8 mx-auto mb-2" />Add evidence such as competitor analysis, prototype, customer interviews, financial model, founder CV and expansion plans.</div>
          ) : (
            <div className="space-y-3">{form.evidenceItems.map((item, index) => (
              <Card key={item.id}><CardContent className="p-4 space-y-3"><div className="flex items-center justify-between"><div className="font-medium text-sm">Evidence {index + 1}</div><Button size="icon" variant="ghost" onClick={() => update("evidenceItems", form.evidenceItems.filter((entry) => entry.id !== item.id))}><Trash2 className="h-4 w-4" /></Button></div><div className="grid gap-3 md:grid-cols-2"><div className="space-y-2"><Label>Evidence type</Label><Select value={item.type} onValueChange={(value: EvidenceType) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, type: value } : entry))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVIDENCE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Title</Label><Input value={item.title} onChange={(e) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, title: e.target.value } : entry))} placeholder="e.g. Competitor feature matrix" /></div></div><TextField fieldName={`ivs-evidence-${index + 1}-summary`} label="What this evidence proves" value={item.summary} onChange={(value) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, summary: value } : entry))} rows={2} /><div className="space-y-2"><Label>Stable reference (optional)</Label><Input value={item.reference} onChange={(e) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, reference: e.target.value } : entry))} placeholder="document:abc123 or file/path" /><p className="text-xs text-muted-foreground">Use a document ID/path, not confidential content.</p></div></CardContent></Card>
            ))}</div>
          )}
        </FieldCard>

        <Card className="border-2 border-primary/20"><CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">Run endorser-readiness assessment</div><p className="text-sm text-muted-foreground">Server-side, durable and versioned. The result shows evidence coverage, not a fabricated visa success percentage.</p>{mutation.error && <p className="text-sm text-destructive mt-2">{mutation.error.message}</p>}</div><div className="flex gap-2"><Button variant="outline" onClick={() => { setForm(initialForm()); setResult(null); setAutofillSummary(null); runKey.current = null; }} disabled={mutation.isPending} data-testid="btn-clear-ivs-form"><RefreshCcw className="h-4 w-4 mr-2" />Clear form</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}{mutation.isPending ? "Assessing..." : "Assess readiness"}</Button></div></CardContent></Card>

        {result && (
          <section id="ivs-results" className="scroll-mt-4 space-y-5">
            <Card><CardHeader className="bg-muted/40"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="flex gap-2 mb-2"><Badge variant={badgeVariant(result.assessment.overallStatus)}>{statusLabel(result.assessment.overallStatus)}</Badge><Badge variant="outline">Validated evidence calculation</Badge></div><CardTitle>Endorsement evidence review</CardTitle><p className="text-sm text-muted-foreground mt-1">Run {result.runId.slice(0, 8)} • {result.assessment.policyVersion}</p></div><div className="text-sm text-muted-foreground md:text-right">{result.assessment.evidenceInventory.itemCount} evidence items<br />{result.assessment.evidenceInventory.referencedEvidenceCount} referenced</div></div></CardHeader><CardContent className="p-5 md:p-6 space-y-5">
              <Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>Result meaning</AlertTitle><AlertDescription>{result.assessment.assessmentMeaning}</AlertDescription></Alert>
              <div className="grid gap-4 lg:grid-cols-3">{result.assessment.criteria.map((criterion) => (
                <Card key={criterion.id} className={criterion.status === "critical_gap" ? "border-destructive/40" : criterion.status === "evidence_ready_for_endorser_review" ? "border-emerald-300" : "border-amber-300"}><CardContent className="p-4 space-y-3"><div className="flex items-center justify-between gap-2"><div className="font-semibold">{criterion.name}</div><Badge variant={badgeVariant(criterion.status)}>{criterion.coverage.percent}% coverage</Badge></div><Progress value={criterion.coverage.percent} /><div className="text-xs text-muted-foreground">{criterion.coverage.met} of {criterion.coverage.total} evidence checks covered</div><div className="space-y-2">{criterion.checks.map((check) => <div key={check.id} className="flex gap-2 text-sm">{check.met ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" /> : <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${check.critical ? "text-destructive" : "text-amber-600"}`} />}<div><div className="font-medium text-xs">{check.label}</div>{!check.met && <div className="text-xs text-muted-foreground mt-0.5">{check.explanation}</div>}</div></div>)}</div></CardContent></Card>
              ))}</div>

              <div className="grid gap-4 lg:grid-cols-4"><Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Available funding</div><div className="text-xl font-bold">£{result.assessment.financialRealityCheck.fundingAvailableGbp.toLocaleString("en-GB")}</div></CardContent></Card><Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Setup cost</div><div className="text-xl font-bold">£{result.assessment.financialRealityCheck.minimumSetupCostGbp.toLocaleString("en-GB")}</div></CardContent></Card><Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Funding gap</div><div className="text-xl font-bold">£{result.assessment.financialRealityCheck.setupFundingGapGbp.toLocaleString("en-GB")}</div></CardContent></Card><Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Implied runway after setup</div><div className="text-xl font-bold">{result.assessment.financialRealityCheck.runwayMonthsAfterSetup === null ? "N/A" : `${result.assessment.financialRealityCheck.runwayMonthsAfterSetup} mo`}</div></CardContent></Card></div>

              {result.assessment.redFlags.length > 0 && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Red flags requiring attention</AlertTitle><AlertDescription><ul className="list-disc pl-5 mt-2 space-y-1">{result.assessment.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></AlertDescription></Alert>}

              {result.assessment.assessorChallengeQuestions.length > 0 && <Card><CardHeader><CardTitle className="text-base">Assessor challenge questions</CardTitle></CardHeader><CardContent><ol className="space-y-2 list-decimal pl-5 text-sm">{result.assessment.assessorChallengeQuestions.map((item, index) => <li key={`${item.checkId}-${index}`}>{item.question}</li>)}</ol></CardContent></Card>}

              <Card><CardHeader><CardTitle className="text-base">Official sources</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">{result.assessment.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" />{source.title}</a>)}</CardContent></Card>
            </CardContent></Card>
          </section>
        )}
      </div>
    </div>
  );
}
