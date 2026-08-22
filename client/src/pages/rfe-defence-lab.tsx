import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useApplicationContextPrefill,
  useUpdateToolCaseContext,
} from "@/hooks/useToolPlatform";
import FeatureNavigation from "@/components/FeatureNavigation";

type PreparationLevel = "high" | "medium" | "low";

type PreparationRisk = {
  id: string;
  title: string;
  level: PreparationLevel;
  basis: string;
  mitigation: string;
  complete: boolean;
};

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function makeRisk(
  id: string,
  title: string,
  signals: unknown[],
  strongAt: number,
  basis: string,
  mitigation: string,
): PreparationRisk {
  const count = signals.filter(hasValue).length;
  const complete = count >= strongAt;
  return {
    id,
    title,
    level: complete ? "low" : count > 0 ? "medium" : "high",
    basis: complete ? `The current application context contains ${count} supporting signal${count === 1 ? "" : "s"} for this area.` : basis,
    mitigation,
    complete,
  };
}

export default function RFEDefenceLab() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const contextQuery = useApplicationContextPrefill("rfe-defense");
  const updateContext = useUpdateToolCaseContext();
  const data = contextQuery.data;
  const plan = data?.businessPlan;

  const risks = useMemo<PreparationRisk[]>(() => {
    if (!data || !plan) return [];
    const financialModel = data.relatedToolData.financialModel;
    return [
      makeRisk(
        "market-validation",
        "Market validation may be under-evidenced",
        [plan.existingCustomers, plan.tractionEvidence, plan.customerInterviews, plan.lettersOfIntent, plan.willingnessToPay],
        2,
        "The saved plan does not currently contain enough customer or traction signals for a robust evidence-led explanation of demand.",
        "Add verifiable customer discovery, traction, LOIs, usage, sales or willingness-to-pay evidence and connect each item to the relevant business-plan claim.",
      ),
      makeRisk(
        "differentiation",
        "Differentiation may need stronger proof",
        [plan.uniqueness, plan.competitiveDifferentiation, plan.technology, plan.patentStatus],
        3,
        "The current plan has limited reusable differentiation evidence.",
        "Use a competitor comparison, explain the defensible technical or commercial difference, and attach evidence that supports the claim rather than relying on adjectives.",
      ),
      makeRisk(
        "financial-viability",
        "Financial assumptions may need more support",
        [plan.monthlyProjections, plan.detailedCosts, plan.fundingSources, financialModel],
        3,
        "The application context does not yet contain a sufficiently complete set of financial assumptions and supporting model data.",
        "Document revenue assumptions, cost drivers, funding sources and downside scenarios. Use a completed financial tool run where possible so the assumptions are traceable.",
      ),
      makeRisk(
        "scalability",
        "Growth and scalability plan may be incomplete",
        [plan.hiringPlan, plan.jobCreation, plan.expansion, plan.specificRegions, plan.internationalPlan],
        3,
        "The saved plan has limited evidence explaining how the business scales operationally and commercially.",
        "Tie hiring and expansion to measurable business milestones, resources, customer demand and realistic timelines. Do not add arbitrary job numbers just to satisfy a perceived threshold.",
      ),
      makeRisk(
        "founder-capability",
        "Founder capability may need clearer linkage",
        [plan.founderEducation, plan.founderWorkHistory, plan.founderAchievements, plan.relevantProjects],
        3,
        "The reusable plan does not yet show a strong chain from founder background to the skills required to execute this business.",
        "Connect relevant experience, achievements and projects directly to delivery responsibilities, sector knowledge and identified execution risks.",
      ),
      makeRisk(
        "compliance",
        "Compliance planning may need more detail",
        [plan.regulatoryRequirements, plan.complianceTimeline, plan.complianceDesign],
        2,
        "The plan currently contains limited reusable regulatory/compliance planning detail.",
        "Identify only the regulations that genuinely apply to the business, explain ownership and timing, and verify legal/regulatory requirements with authoritative sources or a qualified adviser where needed.",
      ),
    ];
  }, [data, plan]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRisk = risks.find((risk) => risk.id === selectedId) || risks[0] || null;
  const highCount = risks.filter((risk) => risk.level === "high").length;
  const mediumCount = risks.filter((risk) => risk.level === "medium").length;
  const mitigatedCount = risks.filter((risk) => risk.complete).length;

  const saveMitigationPlan = async () => {
    if (!data || !selectedRisk) return;
    const existing = Array.isArray((data.caseContext.contextData as any)?.rfeMitigationPlan?.items)
      ? (data.caseContext.contextData as any).rfeMitigationPlan.items
      : [];
    const items = [
      ...existing.filter((item: any) => item?.id !== selectedRisk.id),
      {
        id: selectedRisk.id,
        title: selectedRisk.title,
        level: selectedRisk.level,
        mitigation: selectedRisk.mitigation,
        businessPlanId: plan?.id || null,
        savedAt: new Date().toISOString(),
      },
    ];

    try {
      await updateContext.mutateAsync({
        expectedRevision: data.caseContext.revision,
        contextData: {
          ...data.caseContext.contextData,
          rfeMitigationPlan: { items, updatedAt: new Date().toISOString() },
        },
        evidenceRefs: data.caseContext.evidenceRefs,
      });
      toast({ title: "Mitigation saved", description: "This preparation item is now stored in your shared application context." });
    } catch (error) {
      toast({ title: "Could not save mitigation", description: error instanceof Error ? error.message : "Please refresh and try again.", variant: "destructive" });
    }
  };

  if (contextQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (contextQuery.isError) {
    return (
      <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Risk preparation data could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No refusal risk has been guessed or substituted.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button></Card></div>
    );
  }

  if (!plan) {
    return (
      <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl p-8 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-amber-600" /><h1 className="mt-3 text-xl font-bold">A saved plan is required</h1><p className="mt-2 text-sm text-muted-foreground">RFE Defence now analyses gaps in your actual application context. It will not display generic refusal scenarios as if they apply to you.</p><Button className="mt-5" onClick={() => setLocation("/questionnaire")}>Open Business Plan Builder</Button></Card></div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <FeatureNavigation currentPage="rejection-analysis" />
          <div className="mb-8">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">RFE DEFENCE LAB</span>
            <h1 className="mt-3 text-xl font-bold">Refusal-Risk Preparation</h1>
            <p className="mt-2 text-muted-foreground">Preparation gaps for <strong>{plan.businessName || "your current plan"}</strong>, generated from the data that actually exists in your saved application. These are not predictions that a refusal will occur.</p>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <Card className="border-red-500/20 bg-red-500/5 p-5"><p className="text-sm text-muted-foreground">Missing / high-priority gaps</p><p className="mt-1 text-2xl font-bold text-red-600">{highCount}</p></Card>
            <Card className="border-amber-500/20 bg-amber-500/5 p-5"><p className="text-sm text-muted-foreground">Partially evidenced</p><p className="mt-1 text-2xl font-bold text-amber-600">{mediumCount}</p></Card>
            <Card className="border-emerald-500/20 bg-emerald-500/5 p-5"><p className="text-sm text-muted-foreground">Strongly evidenced</p><p className="mt-1 text-2xl font-bold text-emerald-600">{mitigatedCount}</p></Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {risks.map((risk) => (
                <Card key={risk.id} className={`cursor-pointer p-4 transition-all ${selectedRisk?.id === risk.id ? "border-red-500 bg-red-500/5" : "hover:bg-muted/40"}`} onClick={() => setSelectedId(risk.id)}>
                  <div className="flex items-start gap-3">
                    {risk.complete ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${risk.level === "high" ? "text-red-600" : "text-amber-600"}`} />}
                    <div className="min-w-0"><p className="text-sm font-medium">{risk.title}</p><span className={`mt-2 inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${risk.complete ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : risk.level === "high" ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{risk.complete ? "STRONG EVIDENCE" : risk.level === "high" ? "MISSING" : "PARTIAL"}</span></div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedRisk && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold">{selectedRisk.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedRisk.basis}</p>
                <div className="mt-5 rounded-lg border bg-muted/30 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preparation action</p><p className="mt-2 text-sm leading-6">{selectedRisk.mitigation}</p></div>
                <Button className="mt-5 w-full bg-red-600 hover:bg-red-700" onClick={saveMitigationPlan} disabled={updateContext.isPending} data-testid="button-add-to-action-plan">{updateContext.isPending ? "Saving..." : "Save to Mitigation Plan"}</Button>
              </Card>
            )}
          </div>

          <Card className="mt-6 border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-start gap-4"><AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" /><div><h2 className="font-semibold">Practice the weak areas</h2><p className="mt-2 text-sm text-muted-foreground">Use Interview Prep to rehearse explanations against the exact gaps you have identified. The tool should help you explain evidence, not invent evidence.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setLocation("/interview-prep")} data-testid="button-start-mock-interview">Open Interview Prep</Button><Button variant="outline" onClick={() => setLocation("/evidence-graph")}>Open Evidence Graph</Button></div></div></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
