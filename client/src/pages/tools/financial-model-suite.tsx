import { useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToolRunHistory } from "@/hooks/useToolPlatform";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TOOL_COPY: Record<string, { title: string; subtitle: string }> = {
  "financial-projections": {
    title: "36-Month Financial Projections",
    subtitle: "Build a defensible base, downside and upside cashflow model with evidence-backed assumptions.",
  },
  "budget-cost-analyzer": {
    title: "Budget & Cost Analysis",
    subtitle: "Model setup costs, operating costs, funding coverage and monthly cash requirements over 36 months.",
  },
  "breakeven-calculator": {
    title: "Break-Even & Funding Gap Analysis",
    subtitle: "Identify operating break-even, first negative-cash month and the funding needed to remain solvent in each scenario.",
  },
  "financial-modeling": {
    title: "Advanced Financial Model",
    subtitle: "Run a 36-month scenario model covering revenue, COGS, operating expenses, cash position and unit economics.",
  },
  "income-calculator": {
    title: "Income & Viability Model",
    subtitle: "Stress-test revenue growth, gross margin, costs and cash resilience across multiple scenarios.",
  },
  "cac-calculator": {
    title: "CAC & Customer Economics",
    subtitle: "Calculate customer acquisition cost, LTV:CAC, payback and churn-implied customer lifetime alongside the full cashflow model.",
  },
  "unit-economics": {
    title: "Unit Economics & Cashflow",
    subtitle: "Review ARPC, CAC, LTV, gross-profit payback and the effect of those assumptions on a 36-month financial plan.",
  },
  "revenue-forecast": {
    title: "Revenue Forecasting",
    subtitle: "Compare base, downside and upside revenue trajectories and their effect on cash and operating contribution.",
  },
  "financial-resilience": {
    title: "Financial Resilience Evidence",
    subtitle: "Measure funding coverage and cash resilience, then identify which financial assumptions still lack supporting evidence.",
  },
};

type EvidenceType =
  | "setup_cost_quote"
  | "payroll_benchmark"
  | "supplier_quote"
  | "pricing_evidence"
  | "market_research"
  | "customer_interviews"
  | "pilot_or_trial_metrics"
  | "loi_or_contract"
  | "revenue_history"
  | "gross_margin_evidence"
  | "funding_evidence"
  | "bank_statement"
  | "marketing_cost_evidence"
  | "cac_evidence"
  | "ltv_evidence"
  | "churn_evidence"
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
  startingCashGbp: string;
  committedFundingGbp: string;
  oneTimeSetupCostGbp: string;
  startingMonthlyRevenueGbp: string;
  baseMonthlyRevenueGrowthPct: string;
  downsideMonthlyRevenueGrowthPct: string;
  upsideMonthlyRevenueGrowthPct: string;
  grossMarginPct: string;
  fixedOperatingCostsMonthlyGbp: string;
  payrollMonthlyGbp: string;
  marketingMonthlyGbp: string;
  otherOperatingCostsMonthlyGbp: string;
  monthlyExpenseGrowthPct: string;
  averageRevenuePerCustomerGbp: string;
  customerAcquisitionCostGbp: string;
  lifetimeValueGbp: string;
  monthlyChurnPct: string;
  assumptionsNarrative: string;
  contingencyNarrative: string;
  evidenceItems: EvidenceItem[];
};

type MonthRow = {
  month: number;
  revenueGbp: number;
  cogsGbp: number;
  grossProfitGbp: number;
  operatingExpensesGbp: number;
  operatingContributionGbp: number;
  oneTimeSetupGbp: number;
  netCashFlowGbp: number;
  openingCashGbp: number;
  closingCashGbp: number;
};

type Scenario = {
  monthlyRevenueGrowthPct: number;
  rows: MonthRow[];
  summary: {
    operatingBreakEvenMonth: number | null;
    firstNegativeCashMonth: number | null;
    minimumCashGbp: number;
    fundingGapToStayNonNegativeGbp: number;
    closingCashMonth36Gbp: number;
    totalRevenue36MonthsGbp: number;
    totalOperatingContribution36MonthsGbp: number;
  };
};

type Assessment = {
  modelVersion: string;
  assessedAt: string;
  businessName: string;
  status: "funding_or_model_gap" | "model_complete_evidence_incomplete" | "model_complete_with_evidence";
  meaning: string;
  scenarios: { base: Scenario; downside: Scenario; upside: Scenario };
  unitEconomics: {
    averageRevenuePerCustomerGbp: number;
    customerAcquisitionCostGbp: number;
    lifetimeValueGbp: number;
    ltvCacRatio: number | null;
    cacPaybackMonths: number | null;
    monthlyChurnPct: number;
    impliedLifetimeMonthsFromChurn: number | null;
    impliedLtvFromChurnGbp: number | null;
    note: string;
  };
  assumptionEvidence: {
    checks: Array<{ id: string; label: string; met: boolean; expected: string[] }>;
    met: number;
    total: number;
    percent: number;
    gaps: Array<{ id: string; label: string; met: false; expected: string[] }>;
  };
  warnings: Array<{ severity: string; code: string; message: string }>;
  evidenceInventory: { itemCount: number; evidenceTypes: string[]; evidenceRefs: string[] };
  limitations: string[];
};

type AssessmentResponse = {
  success: true;
  runId: string;
  validationState: "validated";
  registryVersion: string;
  policyVersion: string;
  resultSha256: string;
  assessment: Assessment;
};

const EVIDENCE_OPTIONS: Array<{ value: EvidenceType; label: string }> = [
  ["setup_cost_quote", "Setup-cost quote"],
  ["payroll_benchmark", "Payroll / salary benchmark"],
  ["supplier_quote", "Supplier quote"],
  ["pricing_evidence", "Pricing evidence"],
  ["market_research", "Market research"],
  ["customer_interviews", "Customer interviews"],
  ["pilot_or_trial_metrics", "Pilot / trial metrics"],
  ["loi_or_contract", "LOI / customer contract"],
  ["revenue_history", "Revenue history"],
  ["gross_margin_evidence", "Gross-margin evidence"],
  ["funding_evidence", "Funding evidence"],
  ["bank_statement", "Bank statement"],
  ["marketing_cost_evidence", "Marketing-cost evidence"],
  ["cac_evidence", "CAC evidence"],
  ["ltv_evidence", "LTV evidence"],
  ["churn_evidence", "Churn evidence"],
  ["other", "Other evidence"],
].map(([value, label]) => ({ value: value as EvidenceType, label }));

function initialForm(): FormState {
  return {
    businessName: "",
    startingCashGbp: "",
    committedFundingGbp: "0",
    oneTimeSetupCostGbp: "",
    startingMonthlyRevenueGbp: "0",
    baseMonthlyRevenueGrowthPct: "5",
    downsideMonthlyRevenueGrowthPct: "0",
    upsideMonthlyRevenueGrowthPct: "10",
    grossMarginPct: "70",
    fixedOperatingCostsMonthlyGbp: "",
    payrollMonthlyGbp: "",
    marketingMonthlyGbp: "",
    otherOperatingCostsMonthlyGbp: "",
    monthlyExpenseGrowthPct: "0",
    averageRevenuePerCustomerGbp: "0",
    customerAcquisitionCostGbp: "0",
    lifetimeValueGbp: "0",
    monthlyChurnPct: "0",
    assumptionsNarrative: "",
    contingencyNarrative: "",
    evidenceItems: [],
  };
}

function blankEvidence(): EvidenceItem {
  return { id: crypto.randomUUID(), type: "other", title: "", summary: "", reference: "" };
}

function gbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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

function MoneyInput({ label, value, onChange, help }: { label: string; value: string; onChange: (value: string) => void; help?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" min={0} step="0.01" value={value} onChange={(event) => onChange(event.target.value)} />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function PercentInput({ label, value, onChange, help }: { label: string; value: string; onChange: (value: string) => void; help?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input type="number" step="0.1" value={value} onChange={(event) => onChange(event.target.value)} className="pr-8" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
      </div>
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function statusCopy(status: Assessment["status"]) {
  if (status === "model_complete_with_evidence") return "Model complete with evidence coverage";
  if (status === "model_complete_evidence_incomplete") return "Model complete, evidence incomplete";
  return "Funding or model gap identified";
}

function ScenarioCard({ title, scenario }: { title: string; scenario: Scenario }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold">{title}</div>
          <Badge variant="outline">{scenario.monthlyRevenueGrowthPct}% monthly revenue growth</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Operating break-even</div><div className="font-semibold">{scenario.summary.operatingBreakEvenMonth ? `Month ${scenario.summary.operatingBreakEvenMonth}` : "Not within 36 months"}</div></div>
          <div><div className="text-xs text-muted-foreground">First negative cash</div><div className="font-semibold">{scenario.summary.firstNegativeCashMonth ? `Month ${scenario.summary.firstNegativeCashMonth}` : "None"}</div></div>
          <div><div className="text-xs text-muted-foreground">Funding gap</div><div className="font-semibold">{gbp(scenario.summary.fundingGapToStayNonNegativeGbp)}</div></div>
          <div><div className="text-xs text-muted-foreground">Month 36 cash</div><div className="font-semibold">{gbp(scenario.summary.closingCashMonth36Gbp)}</div></div>
          <div><div className="text-xs text-muted-foreground">36-month revenue</div><div className="font-semibold">{gbp(scenario.summary.totalRevenue36MonthsGbp)}</div></div>
          <div><div className="text-xs text-muted-foreground">Minimum cash</div><div className="font-semibold">{gbp(scenario.summary.minimumCashGbp)}</div></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinancialModelSuite() {
  const params = useParams<{ toolId: string }>();
  const toolId = SUPPORTED_TOOLS.has(params.toolId || "") ? params.toolId! : "financial-projections";
  const copy = TOOL_COPY[toolId] || TOOL_COPY["financial-projections"];
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const runKeyRef = useRef<string | null>(null);
  const history = useToolRunHistory(toolId, true);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (): Promise<AssessmentResponse> => {
      if (!runKeyRef.current) runKeyRef.current = crypto.randomUUID();
      const numberValue = (value: string, label: string) => {
        const parsed = Number(value || 0);
        if (!Number.isFinite(parsed)) throw new Error(`Enter a valid ${label}.`);
        return parsed;
      };
      const nonNegative = (value: string, label: string) => {
        const parsed = numberValue(value, label);
        if (parsed < 0) throw new Error(`${label} cannot be negative.`);
        return parsed;
      };
      const response = await apiRequest("POST", "/api/financial-model/assess", {
        toolId,
        businessName: form.businessName,
        currency: "GBP",
        startingCashGbp: nonNegative(form.startingCashGbp, "starting cash"),
        committedFundingGbp: nonNegative(form.committedFundingGbp, "committed funding"),
        oneTimeSetupCostGbp: nonNegative(form.oneTimeSetupCostGbp, "setup cost"),
        startingMonthlyRevenueGbp: nonNegative(form.startingMonthlyRevenueGbp, "starting monthly revenue"),
        baseMonthlyRevenueGrowthPct: numberValue(form.baseMonthlyRevenueGrowthPct, "base revenue growth"),
        downsideMonthlyRevenueGrowthPct: numberValue(form.downsideMonthlyRevenueGrowthPct, "downside revenue growth"),
        upsideMonthlyRevenueGrowthPct: numberValue(form.upsideMonthlyRevenueGrowthPct, "upside revenue growth"),
        grossMarginPct: numberValue(form.grossMarginPct, "gross margin"),
        fixedOperatingCostsMonthlyGbp: nonNegative(form.fixedOperatingCostsMonthlyGbp, "fixed operating costs"),
        payrollMonthlyGbp: nonNegative(form.payrollMonthlyGbp, "monthly payroll"),
        marketingMonthlyGbp: nonNegative(form.marketingMonthlyGbp, "monthly marketing cost"),
        otherOperatingCostsMonthlyGbp: nonNegative(form.otherOperatingCostsMonthlyGbp, "other operating costs"),
        monthlyExpenseGrowthPct: numberValue(form.monthlyExpenseGrowthPct, "monthly expense growth"),
        averageRevenuePerCustomerGbp: nonNegative(form.averageRevenuePerCustomerGbp, "average revenue per customer"),
        customerAcquisitionCostGbp: nonNegative(form.customerAcquisitionCostGbp, "CAC"),
        lifetimeValueGbp: nonNegative(form.lifetimeValueGbp, "LTV"),
        monthlyChurnPct: numberValue(form.monthlyChurnPct, "monthly churn"),
        assumptionsNarrative: form.assumptionsNarrative,
        contingencyNarrative: form.contingencyNarrative,
        evidenceItems: form.evidenceItems.filter((item) => item.title.trim() || item.summary.trim()),
        clientRunKey: runKeyRef.current,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setResult(data);
      runKeyRef.current = null;
      await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", toolId] });
      window.setTimeout(() => document.getElementById("financial-model-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    },
  });

  const chartRows = useMemo(() => {
    if (!result) return [];
    return result.assessment.scenarios.base.rows.map((row, index) => ({
      month: row.month,
      base: row.closingCashGbp,
      downside: result.assessment.scenarios.downside.rows[index]?.closingCashGbp ?? 0,
      upside: result.assessment.scenarios.upside.rows[index]?.closingCashGbp ?? 0,
    }));
  }, [result]);

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Production model</Badge>
              <Badge variant="outline">36 months</Badge>
              <Badge variant="outline">3 scenarios</Badge>
              <Badge variant="outline">Evidence-backed assumptions</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-2 max-w-4xl text-muted-foreground">{copy.subtitle}</p>
          </div>
          {(history.data?.runs?.length || 0) > 0 && (
            <Card className="min-w-[210px]">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Saved models</div>
                <div className="text-2xl font-bold">{history.data!.runs.length}</div>
                <div className="text-xs text-muted-foreground">Durable account history</div>
              </CardContent>
            </Card>
          )}
        </header>

        <Alert>
          <FileSpreadsheet className="h-4 w-4" />
          <AlertTitle>Forecast assumptions remain assumptions</AlertTitle>
          <AlertDescription>
            The engine calculates the formulas deterministically and records the evidence supporting them. It does not treat a forecast as fact. Committed funding is assumed to be available at the start of Month 1, so only include funding that can genuinely be relied on for the forecast.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5 xl:grid-cols-2">
          <SectionCard title="1. Starting position & setup">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input value={form.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder="Business name" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyInput label="Starting cash" value={form.startingCashGbp} onChange={(value) => update("startingCashGbp", value)} help="Cash available to the business at the model start." />
              <MoneyInput label="Committed funding" value={form.committedFundingGbp} onChange={(value) => update("committedFundingGbp", value)} help="Modelled as available at the start of Month 1." />
              <MoneyInput label="One-time setup cost" value={form.oneTimeSetupCostGbp} onChange={(value) => update("oneTimeSetupCostGbp", value)} help="Deducted in Month 1." />
              <MoneyInput label="Starting monthly revenue" value={form.startingMonthlyRevenueGbp} onChange={(value) => update("startingMonthlyRevenueGbp", value)} />
            </div>
          </SectionCard>

          <SectionCard title="2. Revenue scenarios" description="Use assumptions you can explain and evidence. The three growth rates are compounded monthly.">
            <div className="grid gap-3 sm:grid-cols-3">
              <PercentInput label="Downside monthly growth" value={form.downsideMonthlyRevenueGrowthPct} onChange={(value) => update("downsideMonthlyRevenueGrowthPct", value)} />
              <PercentInput label="Base monthly growth" value={form.baseMonthlyRevenueGrowthPct} onChange={(value) => update("baseMonthlyRevenueGrowthPct", value)} />
              <PercentInput label="Upside monthly growth" value={form.upsideMonthlyRevenueGrowthPct} onChange={(value) => update("upsideMonthlyRevenueGrowthPct", value)} />
            </div>
            <PercentInput label="Gross margin" value={form.grossMarginPct} onChange={(value) => update("grossMarginPct", value)} help="Revenue less direct cost of delivering the product/service, before operating expenses." />
          </SectionCard>

          <SectionCard title="3. Monthly operating costs">
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyInput label="Fixed operating costs" value={form.fixedOperatingCostsMonthlyGbp} onChange={(value) => update("fixedOperatingCostsMonthlyGbp", value)} help="Rent, software, insurance and other recurring non-payroll/non-marketing costs." />
              <MoneyInput label="Payroll" value={form.payrollMonthlyGbp} onChange={(value) => update("payrollMonthlyGbp", value)} />
              <MoneyInput label="Marketing" value={form.marketingMonthlyGbp} onChange={(value) => update("marketingMonthlyGbp", value)} />
              <MoneyInput label="Other operating costs" value={form.otherOperatingCostsMonthlyGbp} onChange={(value) => update("otherOperatingCostsMonthlyGbp", value)} />
            </div>
            <PercentInput label="Monthly expense growth" value={form.monthlyExpenseGrowthPct} onChange={(value) => update("monthlyExpenseGrowthPct", value)} help="Applied to each recurring operating-cost category each month." />
          </SectionCard>

          <SectionCard title="4. Unit economics" description="Commercial planning metrics only. The platform does not present these as Home Office thresholds.">
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyInput label="Average monthly revenue per customer" value={form.averageRevenuePerCustomerGbp} onChange={(value) => update("averageRevenuePerCustomerGbp", value)} />
              <MoneyInput label="Customer acquisition cost (CAC)" value={form.customerAcquisitionCostGbp} onChange={(value) => update("customerAcquisitionCostGbp", value)} />
              <MoneyInput label="Customer lifetime value (LTV)" value={form.lifetimeValueGbp} onChange={(value) => update("lifetimeValueGbp", value)} />
              <PercentInput label="Monthly customer churn" value={form.monthlyChurnPct} onChange={(value) => update("monthlyChurnPct", value)} />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="5. Assumptions & downside response">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Assumptions and evidence basis</Label>
              <Textarea rows={5} value={form.assumptionsNarrative} onChange={(event) => update("assumptionsNarrative", event.target.value)} placeholder="Explain pricing, sales volume, gross margin, costs, hiring and growth assumptions, including where the figures came from." />
            </div>
            <div className="space-y-2">
              <Label>Contingency plan</Label>
              <Textarea rows={5} value={form.contingencyNarrative} onChange={(event) => update("contingencyNarrative", event.target.value)} placeholder="What will you cut, delay, fund or change if revenue is slower than the base case?" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="6. Financial evidence inventory" description="Evidence coverage is reported separately from the mathematical model so unsupported assumptions remain visible.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">{form.evidenceItems.length} evidence items</div>
            <Button variant="outline" onClick={() => update("evidenceItems", [...form.evidenceItems, blankEvidence()])}>
              <Plus className="h-4 w-4 mr-2" /> Add evidence
            </Button>
          </div>
          {form.evidenceItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
              Add cost quotes, salary benchmarks, pricing research, pilots, contracts, funding evidence, bank statements and unit-economics evidence.
            </div>
          ) : (
            <div className="space-y-3">
              {form.evidenceItems.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">Evidence {index + 1}</div>
                      <Button size="icon" variant="ghost" onClick={() => update("evidenceItems", form.evidenceItems.filter((entry) => entry.id !== item.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={item.type} onValueChange={(value: EvidenceType) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, type: value } : entry))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{EVIDENCE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={item.title} onChange={(event) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, title: event.target.value } : entry))} placeholder="e.g. AWS cost estimate" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>What the evidence supports</Label>
                      <Textarea rows={2} value={item.summary} onChange={(event) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, summary: event.target.value } : entry))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Stable reference (optional)</Label>
                      <Input value={item.reference} onChange={(event) => update("evidenceItems", form.evidenceItems.map((entry) => entry.id === item.id ? { ...entry, reference: event.target.value } : entry))} placeholder="document:abc123 or file/path" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </SectionCard>

        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">Run 36-month financial model</div>
              <p className="text-sm text-muted-foreground">The server calculates and saves all three scenarios with a versioned model and result fingerprint.</p>
              {mutation.error && <p className="text-sm text-destructive mt-2">{mutation.error.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setForm(initialForm()); setResult(null); runKeyRef.current = null; }} disabled={mutation.isPending}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                {mutation.isPending ? "Modelling..." : "Run model"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <section id="financial-model-results" className="scroll-mt-4 space-y-5">
            <Card>
              <CardHeader className="bg-muted/40">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={result.assessment.status === "funding_or_model_gap" ? "destructive" : result.assessment.status === "model_complete_with_evidence" ? "default" : "secondary"}>
                        {statusCopy(result.assessment.status)}
                      </Badge>
                      <Badge variant="outline">Validated calculations</Badge>
                    </div>
                    <CardTitle>Financial model results</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Run {result.runId.slice(0, 8)} • {result.assessment.modelVersion}</p>
                  </div>
                  <div className="text-sm text-muted-foreground md:text-right">36 months<br />Base + downside + upside</div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-6">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Model meaning</AlertTitle>
                  <AlertDescription>{result.assessment.meaning}</AlertDescription>
                </Alert>

                <div className="grid gap-4 xl:grid-cols-3">
                  <ScenarioCard title="Downside" scenario={result.assessment.scenarios.downside} />
                  <ScenarioCard title="Base" scenario={result.assessment.scenarios.base} />
                  <ScenarioCard title="Upside" scenario={result.assessment.scenarios.upside} />
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">Closing cash by month</CardTitle></CardHeader>
                  <CardContent className="h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickFormatter={(value) => `M${value}`} />
                        <YAxis tickFormatter={(value) => compactGbp(Number(value))} width={76} />
                        <Tooltip formatter={(value) => gbp(Number(value))} labelFormatter={(label) => `Month ${label}`} />
                        <Legend />
                        <Line type="monotone" dataKey="downside" name="Downside cash" stroke="#dc2626" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="base" name="Base cash" stroke="#005EB8" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="upside" name="Upside cash" stroke="#059669" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">LTV:CAC</div><div className="text-2xl font-bold">{result.assessment.unitEconomics.ltvCacRatio ?? "N/A"}</div><div className="text-xs text-muted-foreground">Commercial metric, not visa threshold</div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">CAC payback</div><div className="text-2xl font-bold">{result.assessment.unitEconomics.cacPaybackMonths === null ? "N/A" : `${result.assessment.unitEconomics.cacPaybackMonths} mo`}</div><div className="text-xs text-muted-foreground">Using monthly gross profit per customer</div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Churn-implied lifetime</div><div className="text-2xl font-bold">{result.assessment.unitEconomics.impliedLifetimeMonthsFromChurn === null ? "N/A" : `${result.assessment.unitEconomics.impliedLifetimeMonthsFromChurn} mo`}</div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Evidence coverage</div><div className="text-2xl font-bold">{result.assessment.assumptionEvidence.percent}%</div><Progress value={result.assessment.assumptionEvidence.percent} className="mt-2" /></CardContent></Card>
                </div>

                {result.assessment.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Model warnings</h3>
                    {result.assessment.warnings.map((warning) => (
                      <Alert key={warning.code} variant={warning.severity === "critical" ? "destructive" : "default"}>
                        {warning.severity === "critical" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        <AlertTitle>{warning.code.replaceAll("_", " ")}</AlertTitle>
                        <AlertDescription>{warning.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                <Card>
                  <CardHeader><CardTitle className="text-base">Assumption evidence checks</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {result.assessment.assumptionEvidence.checks.map((check) => (
                      <div key={check.id} className="flex items-start gap-2 rounded-lg border p-3">
                        {check.met ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />}
                        <div><div className="text-sm font-medium">{check.label}</div>{!check.met && <div className="text-xs text-muted-foreground mt-1">Expected evidence: {check.expected.join(", ")}</div>}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Base-case monthly cashflow</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full min-w-[950px] text-sm">
                        <thead className="bg-muted/50 text-left">
                          <tr><th className="p-2">Month</th><th className="p-2">Revenue</th><th className="p-2">COGS</th><th className="p-2">Gross profit</th><th className="p-2">Opex</th><th className="p-2">Operating contribution</th><th className="p-2">Setup</th><th className="p-2">Net cashflow</th><th className="p-2">Closing cash</th></tr>
                        </thead>
                        <tbody>{result.assessment.scenarios.base.rows.map((row) => <tr key={row.month} className="border-t"><td className="p-2">{row.month}</td><td className="p-2">{gbp(row.revenueGbp)}</td><td className="p-2">{gbp(row.cogsGbp)}</td><td className="p-2">{gbp(row.grossProfitGbp)}</td><td className="p-2">{gbp(row.operatingExpensesGbp)}</td><td className="p-2">{gbp(row.operatingContributionGbp)}</td><td className="p-2">{gbp(row.oneTimeSetupGbp)}</td><td className="p-2">{gbp(row.netCashFlowGbp)}</td><td className={`p-2 font-medium ${row.closingCashGbp < 0 ? "text-destructive" : ""}`}>{gbp(row.closingCashGbp)}</td></tr>)}</tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Model limitations</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">{result.assessment.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
