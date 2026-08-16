import { useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
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
import { useToolRunHistory } from "@/hooks/useToolPlatform";
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
import { Textarea } from "@/components/ui/textarea";

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
  innovationDeliveryModel: "primarily_in_house" | "mixed" | "primarily_outsourced";
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
    innovationCoreToBusiness: true,
    innovationDeliveryModel: "primarily_in_house",
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

function TextField({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} />
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
  const runKey = useRef<string | null>(null);
  const history = useToolRunHistory(toolId, true);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (): Promise<AssessmentResponse> => {
      if (!runKey.current) runKey.current = crypto.randomUUID();
      const numberValue = (value: string, label: string, integer = false) => {
        const parsed = Number(value || 0);
        if (!Number.isFinite(parsed) || parsed < 0 || (integer && !Number.isInteger(parsed))) throw new Error(`Enter a valid ${label}.`);
        return parsed;
      };
      const cleanEvidence = form.evidenceItems.filter((item) => item.title.trim() || item.summary.trim());
      const response = await apiRequest("POST", "/api/endorsement/ivs-assess", {
        ...form,
        toolId,
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
            <div className="space-y-2"><Label>How is the core innovation delivered?</Label><Select value={form.innovationDeliveryModel} onValueChange={(v: FormState["innovationDeliveryModel"]) => update("innovationDeliveryModel", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primarily_in_house">Primarily within the founding business</SelectItem><SelectItem value="mixed">Mixed internal and specialist external delivery</SelectItem><SelectItem value="primarily_outsourced">Primarily outsourced to a third party</SelectItem></SelectContent></Select></div>
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
              <Card key={item.id}><CardContent className="p-4 space-y-3"><div className="flex items-center justify-between"><div className="font-medium text-sm">Evidence {index + 1}</div><Button size="icon" variant="ghost" onClick={() => update("evidenceItems", form.evidenceItems.filter((entry) => entry.id !== item.id))}><Trash2 className="h-4 w-4" /></Button></div><div className="grid gap-3 md:grid-cols-2"><div className="space-y-2"><Label>Evidence type</Label><Select value={item.type} onValueChange={(value: EvidenceType) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, type: value } : entry))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVIDENCE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Title</Label><Input value={item.title} onChange={(e) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, title: e.target.value } : entry))} placeholder="e.g. Competitor feature matrix" /></div></div><TextField label="What this evidence proves" value={item.summary} onChange={(value) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, summary: value } : entry))} rows={2} /><div className="space-y-2"><Label>Stable reference (optional)</Label><Input value={item.reference} onChange={(e) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, reference: e.target.value } : entry))} placeholder="document:abc123 or file/path" /><p className="text-xs text-muted-foreground">Use a document ID/path, not confidential content.</p></div></CardContent></Card>
            ))}</div>
          )}
        </FieldCard>

        <Card className="border-2 border-primary/20"><CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">Run endorser-readiness assessment</div><p className="text-sm text-muted-foreground">Server-side, durable and versioned. The result shows evidence coverage, not a fabricated visa success percentage.</p>{mutation.error && <p className="text-sm text-destructive mt-2">{mutation.error.message}</p>}</div><div className="flex gap-2"><Button variant="outline" onClick={() => { setForm(initialForm()); setResult(null); runKey.current = null; }} disabled={mutation.isPending}><RefreshCcw className="h-4 w-4 mr-2" />Reset</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}{mutation.isPending ? "Assessing..." : "Assess readiness"}</Button></div></CardContent></Card>

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
