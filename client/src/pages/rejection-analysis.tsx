import { useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";

const commonRejectionReasons = [
  "Innovation or differentiation concerns",
  "Market validation concerns",
  "Financial viability concerns",
  "Founder capability concerns",
  "Scalability or growth-plan concerns",
  "Team or delivery-capability concerns",
  "Funding or financial-resilience concerns",
  "Intellectual property or defensibility concerns",
  "Go-to-market concerns",
  "Evidence or document-quality concerns",
];

export default function RejectionAnalysis() {
  const [, setLocation] = useLocation();
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const contextQuery = useApplicationContextPrefill("rejection-analysis");
  const plan = contextQuery.data?.businessPlan;

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) => current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]);
  };

  const handleAnalyze = async () => {
    if (!rejectionReason.trim() && selectedReasons.length === 0) {
      toast({ title: "Add the refusal feedback", description: "Paste the relevant wording from the decision or select the areas it addressed.", variant: "destructive" });
      return;
    }

    const applicationContext = plan ? {
      businessName: plan.businessName || null,
      industry: plan.industry || null,
      innovation: {
        uniqueness: plan.uniqueness || null,
        technology: plan.technology || null,
        competitiveDifferentiation: plan.competitiveDifferentiation || null,
      },
      marketValidation: {
        existingCustomers: plan.existingCustomers || null,
        tractionEvidence: plan.tractionEvidence || null,
        customerInterviews: plan.customerInterviews || null,
        lettersOfIntent: plan.lettersOfIntent || null,
      },
      financial: {
        funding: plan.funding || null,
        revenue: plan.revenue || null,
        monthlyProjections: plan.monthlyProjections || null,
        detailedCosts: plan.detailedCosts || null,
      },
      scalability: {
        hiringPlan: plan.hiringPlan || null,
        jobCreation: plan.jobCreation || null,
        expansion: plan.expansion || null,
      },
      founder: {
        education: plan.founderEducation || null,
        workHistory: plan.founderWorkHistory || null,
        achievements: plan.founderAchievements || null,
      },
    } : null;

    setIsLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: [
            "Analyse the following UK Innovator Founder refusal/negative feedback as a preparation aid, not legal advice.",
            `Decision/feedback supplied by the user: ${rejectionReason.trim() || "No verbatim text supplied."}`,
            `User-selected concern categories: ${selectedReasons.join(", ") || "None selected."}`,
            `Current saved application context: ${JSON.stringify(applicationContext)}`,
            "Return a structured response with: (1) what the decision actually appears to criticise, distinguishing quoted/supplied facts from inference; (2) evidence gaps visible in the current saved plan; (3) specific amendments and evidence to gather; (4) issues that require checking against the current official GOV.UK/Immigration Rules or a regulated professional; (5) a prioritised reapplication/review checklist.",
            "Do not invent facts, do not claim a percentage probability of success, do not guarantee an outcome, and do not present generic criticism as if the decision maker actually said it.",
          ].join("\n\n"),
          conversationHistory: [],
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body?.error === "string" ? body.error : `Analysis request failed (${response.status}).`);
      }
      const body = await response.json();
      if (typeof body?.response !== "string" || !body.response.trim()) throw new Error("The analysis service returned no usable response.");
      setAnalysis(body.response.trim());
    } catch (error) {
      toast({ title: "Analysis could not be completed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">REFUSAL ANALYSIS</span>
            <h1 className="mt-3 text-xl font-bold">Refusal Feedback & Reapplication Analysis</h1>
            <p className="mt-2 text-muted-foreground">Analyse the decision wording you provide against your current saved application material. The tool identifies evidence gaps and next steps without predicting or guaranteeing a visa outcome.</p>
          </div>

          {contextQuery.isLoading && <Card className="mb-6 flex items-center gap-3 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your saved application context...</Card>}
          {contextQuery.isError && <Card className="mb-6 border-amber-500/30 bg-amber-500/5 p-4 text-sm"><strong>Saved plan context is currently unavailable.</strong> You can still analyse the decision wording, but the result cannot compare it with your saved plan until the context service is available.</Card>}
          {plan && <Card className="mb-6 p-4 text-sm"><strong>Plan context:</strong> {plan.businessName || "Current saved plan"}{plan.industry ? ` · ${plan.industry}` : ""}</Card>}

          <div className="space-y-6">
            <Card className="border-amber-500/20 bg-amber-500/5 p-6">
              <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><h2 className="font-semibold">Use the actual decision wording where possible</h2><p className="mt-1 text-sm text-muted-foreground">A refusal or negative endorsement decision can turn on precise facts. Paste the relevant wording rather than relying only on generic categories. Verify deadlines, review rights and current legal requirements from the decision itself and official sources.</p></div></div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold">1. Concern areas mentioned in the decision</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {commonRejectionReasons.map((reason) => (
                  <label key={reason} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                    <input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => toggleReason(reason)} data-testid={`checkbox-reason-${reason.replace(/\s+/g, "-").toLowerCase()}`} className="h-4 w-4" />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 border-t pt-6">
                <h2 className="font-semibold">2. Paste the refusal / assessment feedback</h2>
                <Textarea placeholder="Paste the relevant wording from the refusal or assessment decision here..." value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="mt-3 min-h-[180px]" data-testid="textarea-rejection-details" />
              </div>

              <Button onClick={handleAnalyze} disabled={isLoading || (!rejectionReason.trim() && selectedReasons.length === 0)} className="mt-6 w-full gap-2 bg-red-600 py-6 text-base hover:bg-red-700" data-testid="button-analyze-rejection"><TrendingUp className="h-5 w-5" />{isLoading ? "Analysing supplied evidence..." : "Analyse Feedback & Build Actions"}</Button>
            </Card>

            {analysis && (
              <Card className="p-6">
                <div className="mb-5 flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" /><div><h2 className="font-semibold">Preparation analysis</h2><p className="mt-1 text-xs text-muted-foreground">AI-assisted review of the information supplied in this tool. Verify legal and procedural points independently.</p></div></div>
                <div className="prose prose-sm max-w-none dark:prose-invert"><p className="whitespace-pre-wrap text-foreground">{analysis}</p></div>
                <div className="mt-6 flex flex-wrap gap-2"><Button onClick={() => setLocation("/evidence-graph")}>Open Evidence Graph</Button><Button variant="outline" onClick={() => setLocation("/rfe-defence-lab")}>Build Mitigation Plan</Button><Button variant="outline" onClick={() => setLocation("/expert-booking")} data-testid="button-book-expert-review">Book Expert Review</Button></div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
