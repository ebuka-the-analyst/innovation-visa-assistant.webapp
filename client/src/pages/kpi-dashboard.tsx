import { useMemo } from "react";
import { useLocation } from "wouter";
import { AlertCircle, BarChart3, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";
import FeatureNavigation from "@/components/FeatureNavigation";

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function completeness(values: unknown[], expected: number) {
  const found = values.filter(hasValue).length;
  return { found, score: Math.min(100, Math.round((found / Math.max(1, expected)) * 100)) };
}

function formatGbp(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not recorded";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
}

export default function KPIDashboard() {
  const [, setLocation] = useLocation();
  const contextQuery = useApplicationContextPrefill("kpi-dashboard");
  const data = contextQuery.data;
  const plan = data?.businessPlan;
  const financialModel = data?.relatedToolData.financialModel;

  const metrics = useMemo(() => {
    if (!data || !plan) return [];
    const innovation = completeness([plan.uniqueness, plan.technology, plan.competitiveDifferentiation, plan.patentStatus], 3);
    const validation = completeness([plan.existingCustomers, plan.tractionEvidence, plan.customerInterviews, plan.lettersOfIntent, plan.willingnessToPay], 3);
    const financial = completeness([plan.monthlyProjections, plan.detailedCosts, plan.fundingSources, financialModel], 3);
    const scalability = completeness([plan.hiringPlan, plan.jobCreation, plan.expansion, plan.specificRegions, plan.internationalPlan], 3);
    const documentation = completeness([...(data.documents || []), ...(data.caseContext.evidenceRefs || [])], 4);
    return [
      { id: "innovation", label: "Innovation evidence", ...innovation },
      { id: "validation", label: "Market validation", ...validation },
      { id: "financial", label: "Financial evidence", ...financial },
      { id: "scalability", label: "Scalability planning", ...scalability },
      { id: "documentation", label: "Traceable evidence", ...documentation },
    ];
  }, [data, financialModel, plan]);

  const overallScore = metrics.length ? Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length) : null;
  const gaps = metrics.filter((metric) => metric.score < 75);

  if (contextQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (contextQuery.isError) {
    return (
      <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">KPI data could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No performance values or compliance status have been estimated.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button></Card></div>
    );
  }

  if (!plan || !data) {
    return (
      <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-3 text-xl font-bold">No saved business plan yet</h1><p className="mt-2 text-sm text-muted-foreground">The dashboard now reflects only real data from your application context. Create or save a plan before using these KPIs.</p><Button className="mt-5" onClick={() => setLocation("/questionnaire")}>Open Business Plan Builder</Button></Card></div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <FeatureNavigation currentPage="questionnaire" />
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">APPLICATION KPI DASHBOARD</span>
              <h1 className="mt-3 text-xl font-bold">Evidence & Business-Plan KPIs</h1>
              <p className="mt-2 text-muted-foreground">Current saved signals for <strong>{plan.businessName || "your business"}</strong>. No revenue, users, hires, deadlines or compliance outcomes are fabricated.</p>
            </div>
            <Button variant="outline" onClick={() => contextQuery.refetch()} disabled={contextQuery.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${contextQuery.isFetching ? "animate-spin" : ""}`} /> Refresh</Button>
          </div>

          <Card className="mb-6 border-red-500/20 bg-gradient-to-r from-red-500/5 to-background p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Application evidence completeness</p><h2 className="mt-1 text-3xl font-bold">{overallScore ?? "—"}{overallScore == null ? "" : "/100"}</h2><p className="mt-2 text-sm text-muted-foreground">A completeness indicator only. It is not a visa, endorsement or legal success score.</p></div><BarChart3 className="h-16 w-16 text-red-600/20" /></div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-5">
                <div className="flex items-start justify-between gap-2"><h2 className="text-sm font-semibold">{metric.label}</h2>{metric.score >= 75 ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />}</div>
                <p className="mt-4 text-2xl font-bold">{metric.score}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.found} reusable signal{metric.found === 1 ? "" : "s"} found</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full ${metric.score >= 75 ? "bg-emerald-600" : metric.score >= 40 ? "bg-amber-500" : "bg-red-600"}`} style={{ width: `${metric.score}%` }} /></div>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="saved" className="mt-6 space-y-5">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="saved">Saved Business Data</TabsTrigger>
              <TabsTrigger value="financial">Financial Model</TabsTrigger>
              <TabsTrigger value="gaps">Evidence Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              <Card className="p-6">
                <h2 className="font-semibold">Values currently stored in your plan</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DataPoint label="Industry" value={plan.industry || "Not recorded"} />
                  <DataPoint label="Funding" value={formatGbp(plan.funding)} />
                  <DataPoint label="Job-creation figure" value={hasValue(plan.jobCreation) ? String(plan.jobCreation) : "Not recorded"} />
                  <DataPoint label="Revenue narrative" value={plan.revenue || "Not recorded"} />
                  <DataPoint label="Product stage" value={plan.productStatus || plan.innovationStage || "Not recorded"} />
                  <DataPoint label="Uploaded documents" value={String(data.documents.length)} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">These values are displayed as saved. The dashboard does not infer that they have been achieved or independently verified.</p>
              </Card>
            </TabsContent>

            <TabsContent value="financial">
              <Card className="p-6">
                {financialModel ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Linked completed financial run</h2><p className="mt-1 text-sm text-muted-foreground">{financialModel.toolId.replaceAll("-", " ")}</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Completed tool data</span></div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3"><DataPoint label="One-time setup cost" value={formatGbp(financialModel.oneTimeSetupCostGbp)} /><DataPoint label="Monthly operating cost" value={formatGbp(financialModel.monthlyOperatingCostGbp)} /><DataPoint label="Starting monthly revenue assumption" value={formatGbp(financialModel.startingMonthlyRevenueGbp)} /></div>
                    {financialModel.assumptionsNarrative && <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm"><strong>Saved assumptions:</strong> {financialModel.assumptionsNarrative}</div>}
                  </>
                ) : (
                  <div className="text-center"><AlertCircle className="mx-auto h-7 w-7 text-amber-600" /><h2 className="mt-3 font-semibold">No completed financial tool run is linked</h2><p className="mt-1 text-sm text-muted-foreground">The dashboard will not invent financial performance. Run a financial tool for this business to populate this section.</p><Button className="mt-4" variant="outline" onClick={() => setLocation("/tools-hub")}>Open Financial Tools</Button></div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="gaps">
              <Card className="p-6">
                <h2 className="font-semibold">Current evidence alerts</h2>
                {gaps.length ? <div className="mt-4 space-y-3">{gaps.map((gap) => <div key={gap.id} className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><p className="text-sm font-medium">{gap.label}</p><p className="mt-1 text-xs text-muted-foreground">Only {gap.found} reusable signal{gap.found === 1 ? "" : "s"} found. Strengthen this area and refresh the dashboard.</p></div></div>)}</div> : <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><p className="text-sm">All tracked evidence areas currently meet this dashboard's completeness threshold. This does not constitute an endorsement or legal assessment.</p></div>}
                <div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setLocation("/evidence-graph")}>Open Evidence Graph</Button><Button variant="outline" onClick={() => setLocation("/documents")}>Manage Documents</Button></div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>;
}
