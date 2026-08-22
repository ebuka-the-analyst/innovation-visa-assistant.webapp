import { useMemo } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useApplicationContextPrefill,
  useUpdateToolCaseContext,
} from "@/hooks/useToolPlatform";
import FeatureNavigation from "@/components/FeatureNavigation";

type ClaimStatus = "strong" | "moderate" | "weak";

type EvidenceClaim = {
  id: string;
  claim: string;
  status: ClaimStatus;
  evidence: string[];
  supportScore: number;
  gap?: string;
};

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function buildClaim(
  id: string,
  claim: string,
  signals: Array<[string, unknown]>,
  requiredSignals: number,
  gap: string,
): EvidenceClaim {
  const evidence = signals.filter(([, value]) => hasValue(value)).map(([label]) => label);
  const score = Math.min(100, Math.round((evidence.length / Math.max(1, requiredSignals)) * 100));
  const status: ClaimStatus = score >= 75 ? "strong" : score >= 40 ? "moderate" : "weak";
  return {
    id,
    claim,
    status,
    evidence,
    supportScore: score,
    gap: status === "strong" ? undefined : gap,
  };
}

export default function EvidenceGraph() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const contextQuery = useApplicationContextPrefill("evidence-graph");
  const updateContext = useUpdateToolCaseContext();
  const data = contextQuery.data;
  const plan = data?.businessPlan;

  const claims = useMemo<EvidenceClaim[]>(() => {
    if (!data || !plan) return [];
    const financialModel = data.relatedToolData.financialModel;
    const documents = data.documents || [];
    const documentEvidence = documents.length ? `${documents.length} uploaded supporting document${documents.length === 1 ? "" : "s"}` : null;

    return [
      buildClaim(
        "innovation",
        "Innovation and meaningful differentiation",
        [
          ["Uniqueness statement", plan.uniqueness],
          ["Technology explanation", plan.technology],
          ["Competitive differentiation", plan.competitiveDifferentiation],
          ["Technical architecture / method", plan.techStack || plan.dataArchitecture || plan.aiMethodology],
          ["IP or defensibility information", plan.patentStatus],
          ["Uploaded supporting documents", documentEvidence],
        ],
        4,
        "Strengthen the differentiation claim with specific competitor comparisons, technical evidence and traceable supporting documents.",
      ),
      buildClaim(
        "market-validation",
        "Market demand and customer validation",
        [
          ["Existing customers", plan.existingCustomers],
          ["Traction evidence", plan.tractionEvidence],
          ["Customer interviews", plan.customerInterviews],
          ["Letters of intent", plan.lettersOfIntent],
          ["Willingness-to-pay evidence", plan.willingnessToPay],
          ["Market sizing", plan.marketSize],
        ],
        4,
        "Add verifiable customer discovery, LOIs, usage, sales or other market evidence instead of relying only on narrative claims.",
      ),
      buildClaim(
        "financial-viability",
        "Financial viability and credible assumptions",
        [
          ["Monthly projections", plan.monthlyProjections],
          ["Detailed costs", plan.detailedCosts],
          ["Funding sources", plan.fundingSources],
          ["CAC / LTV / payback assumptions", hasValue(plan.customerAcquisitionCost) || hasValue(plan.lifetimeValue) || hasValue(plan.paybackPeriod)],
          ["Completed financial tool run", financialModel],
        ],
        4,
        "Build an evidence-backed financial model with transparent assumptions, costs, revenue logic and sensitivity to downside scenarios.",
      ),
      buildClaim(
        "scalability",
        "Scalability and UK growth plan",
        [
          ["Hiring plan", plan.hiringPlan],
          ["Job-creation plan", plan.jobCreation],
          ["Expansion strategy", plan.expansion],
          ["Target regions", plan.specificRegions],
          ["International plan", plan.internationalPlan],
        ],
        4,
        "Clarify how growth is achieved, what resources are required and how hiring or expansion follows from realistic business milestones.",
      ),
      buildClaim(
        "founder-fit",
        "Founder capability and delivery credibility",
        [
          ["Founder education", plan.founderEducation],
          ["Relevant work history", plan.founderWorkHistory],
          ["Founder achievements", plan.founderAchievements],
          ["Relevant projects", plan.relevantProjects],
          ["Supporting documents", documentEvidence],
        ],
        4,
        "Connect the founder's experience and achievements directly to the skills needed to execute this specific business plan.",
      ),
    ];
  }, [data, plan]);

  const strongCount = claims.filter((claim) => claim.status === "strong").length;
  const moderateCount = claims.filter((claim) => claim.status === "moderate").length;
  const weakCount = claims.filter((claim) => claim.status === "weak").length;
  const overallScore = claims.length
    ? Math.round(claims.reduce((sum, claim) => sum + claim.supportScore, 0) / claims.length)
    : null;

  const createActionPlan = async () => {
    if (!data) return;
    const gaps = claims
      .filter((claim) => claim.status !== "strong" && claim.gap)
      .map((claim) => ({
        claimId: claim.id,
        claim: claim.claim,
        gap: claim.gap,
        evidenceCompletenessScore: claim.supportScore,
      }));

    try {
      await updateContext.mutateAsync({
        expectedRevision: data.caseContext.revision,
        contextData: {
          ...data.caseContext.contextData,
          evidenceGraphActionPlan: {
            generatedAt: new Date().toISOString(),
            businessPlanId: plan?.id || null,
            gaps,
          },
        },
        evidenceRefs: data.caseContext.evidenceRefs,
      });
      toast({
        title: "Action plan saved",
        description: gaps.length
          ? `${gaps.length} evidence gap${gaps.length === 1 ? "" : "s"} saved to your application context.`
          : "No incomplete evidence areas were found in this completeness check.",
      });
    } catch (error) {
      toast({
        title: "Could not save action plan",
        description: error instanceof Error ? error.message : "Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  if (contextQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (contextQuery.isError) {
    return (
      <div className="responsive-container py-16">
        <Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-3 text-xl font-bold">Evidence data could not be loaded</h1>
          <p className="mt-2 text-sm text-muted-foreground">No evidence score has been estimated. Your saved application data remains unchanged.</p>
          <Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="responsive-container py-16">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
          <h1 className="mt-3 text-xl font-bold">Add a business plan first</h1>
          <p className="mt-2 text-sm text-muted-foreground">Evidence Graph only scores the completeness of evidence that actually exists in your saved application context. It will not invent claims or documents.</p>
          <Button className="mt-5" onClick={() => setLocation("/questionnaire")}>Open Business Plan Builder</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <FeatureNavigation currentPage="document-organizer" />
          <div className="mb-8">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">EVIDENCE GRAPH</span>
            <h1 className="mt-3 text-xl font-bold">Claim-to-Proof Evidence Mapping</h1>
            <p className="mt-2 text-muted-foreground">Completeness analysis for <strong>{plan.businessName || "your current plan"}</strong>, based only on your saved plan fields, uploaded documents and linked tool data.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="p-4"><p className="text-xs text-muted-foreground">Completeness score</p><p className="mt-1 text-2xl font-bold">{overallScore ?? "—"}{overallScore == null ? "" : "%"}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Strong</p><p className="mt-1 text-2xl font-bold text-emerald-600">{strongCount}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Partial</p><p className="mt-1 text-2xl font-bold text-amber-600">{moderateCount}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Weak</p><p className="mt-1 text-2xl font-bold text-red-600">{weakCount}</p></Card>
          </div>

          <div className="mt-6 space-y-4">
            {claims.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start gap-4">
                  {item.status === "strong" ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" /> : <AlertCircle className={`mt-0.5 h-6 w-6 shrink-0 ${item.status === "moderate" ? "text-amber-600" : "text-red-600"}`} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{item.claim}</h2><span className="text-sm font-bold">{item.supportScore}% complete</span></div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${item.status === "strong" ? "bg-emerald-600" : item.status === "moderate" ? "bg-amber-500" : "bg-red-600"}`} style={{ width: `${item.supportScore}%` }} /></div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signals found</p>
                      {item.evidence.length ? <div className="mt-2 flex flex-wrap gap-2">{item.evidence.map((evidence) => <span key={evidence} className="rounded-full bg-muted px-2.5 py-1 text-xs">{evidence}</span>)}</div> : <p className="mt-2 text-sm text-muted-foreground">No supporting signal was found for this area.</p>}
                    </div>
                    {item.gap && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100"><strong>Gap to address:</strong> {item.gap}</div>}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-red-500/20 bg-red-500/5 p-6">
            <h2 className="font-semibold">Next actions</h2>
            <p className="mt-2 text-sm text-muted-foreground">This score measures evidence completeness, not endorsement likelihood. Save the identified gaps to your shared application context so other tools can reuse them.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={createActionPlan} disabled={updateContext.isPending} className="bg-red-600 hover:bg-red-700" data-testid="button-create-action-plan">{updateContext.isPending ? "Saving..." : "Save Evidence Action Plan"}</Button>
              <Button variant="outline" onClick={() => setLocation("/documents")}>Manage Documents</Button>
              <Button variant="outline" onClick={() => setLocation("/traction-evidence")}>Strengthen Traction</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
