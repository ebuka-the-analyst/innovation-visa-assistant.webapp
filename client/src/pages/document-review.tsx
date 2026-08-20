import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  History,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import type { BusinessPlan } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@/components/SEOHead";
import { DocumentReviewWaitStatus } from "@/components/DocumentReviewWaitStatus";

interface DocumentReview {
  id: string;
  userId?: string;
  documentId?: string | null;
  documentName: string;
  documentType: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt: string | null;
  overallScore: number | null;
  innovationScore: number | null;
  viabilityScore: number | null;
  scalabilityScore: number | null;
  endorserAlignment: number | null;
  strengthsFound: string[] | null;
  weaknessesFound: string[] | null;
  suggestions: { priority: string; suggestion: string }[] | null;
}

interface ReviewStats {
  totalReviews: number;
  completedReviews: number;
  averageScore: number;
  averageInnovation: number;
  averageViability: number;
  averageScalability: number;
}

interface ReviewResponse {
  reviews: DocumentReview[];
  stats: ReviewStats;
}

const MANUAL_DOCUMENT_TYPES = [
  { value: "business_plan", label: "Business Plan" },
  { value: "personal_statement", label: "Personal Statement" },
  { value: "evidence", label: "Evidence Document" },
  { value: "financial", label: "Financial Document" },
  { value: "other", label: "Other" },
];

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

function wordCount(value?: string | null): number {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function scoreClass(score: number | null | undefined): string {
  const value = Number(score || 0);
  if (value >= 80) return "border-green-300 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300";
  if (value >= 60) return "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300";
  return "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300";
}

function reviewStatusBadge(status: DocumentReview["status"]) {
  if (status === "completed") {
    return <Badge className="border border-green-200 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Completed</Badge>;
  }
  if (status === "failed") {
    return <Badge className="border border-red-200 bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"><XCircle className="mr-1 h-3.5 w-3.5" />Failed</Badge>;
  }
  return <Badge className="border border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"><Clock3 className="mr-1 h-3.5 w-3.5" />{status === "processing" ? "Reviewing" : "Queued"}</Badge>;
}

function ReviewResultsDialog({
  review,
  open,
  onOpenChange,
}: {
  review: DocumentReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!review || review.status !== "completed") return null;

  const suggestions = Array.isArray(review.suggestions) ? review.suggestions : [];
  const strengths = Array.isArray(review.strengthsFound) ? review.strengthsFound : [];
  const weaknesses = Array.isArray(review.weaknessesFound) ? review.weaknessesFound : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            Final review: {review.documentName}
          </DialogTitle>
          <DialogDescription>
            Completed {formatDate(review.completedAt)}. Scores assess document preparation quality; they are not a visa-success probability and do not verify external evidence.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[67vh] pr-4">
          <div className="space-y-6 py-1">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Overall", review.overallScore],
                ["Innovation", review.innovationScore],
                ["Viability", review.viabilityScore],
                ["Scalability", review.scalabilityScore],
                ["Endorser fit", review.endorserAlignment],
              ].map(([label, score]) => (
                <div key={String(label)} className={`rounded-lg border p-4 text-center ${scoreClass(Number(score || 0))}`}>
                  <div className="text-2xl font-bold">{Number(score || 0)}</div>
                  <div className="mt-1 text-xs font-medium">{label}</div>
                </div>
              ))}
            </div>

            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4" /> Strengths
              </h3>
              {strengths.length ? (
                <div className="space-y-2">
                  {strengths.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-md border border-green-100 bg-green-50/50 p-3 text-sm leading-relaxed dark:border-green-900 dark:bg-green-950/20">
                      {item}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No strengths were returned by the review.</p>}
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" /> Weaknesses to address
              </h3>
              {weaknesses.length ? (
                <div className="space-y-2">
                  {weaknesses.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-md border border-amber-100 bg-amber-50/50 p-3 text-sm leading-relaxed dark:border-amber-900 dark:bg-amber-950/20">
                      {item}
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No weaknesses were returned by the review.</p>}
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                <Lightbulb className="h-4 w-4" /> Improvement actions
              </h3>
              {suggestions.length ? (
                <div className="space-y-2">
                  {suggestions.map((item, index) => (
                    <div key={`${index}-${item.suggestion}`} className="flex items-start gap-3 rounded-md border p-3">
                      <Badge variant="outline" className="shrink-0 capitalize">{item.priority || "medium"}</Badge>
                      <p className="text-sm leading-relaxed">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No improvement actions were returned by the review.</p>}
            </section>
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button asChild>
            <Link href="/tools/compliance-checker">
              Continue to Compliance Check <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryCard({ review, onOpen }: { review: DocumentReview; onOpen: () => void }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{review.documentName}</h3>
              {reviewStatusBadge(review.status)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {review.documentType.replaceAll("_", " ")} • created {formatDate(review.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {review.status === "completed" && (
              <div className={`rounded-md border px-3 py-2 text-center ${scoreClass(review.overallScore)}`}>
                <div className="text-lg font-bold leading-none">{review.overallScore ?? 0}</div>
                <div className="mt-1 text-[10px] font-medium">Overall</div>
              </div>
            )}
            {review.status === "completed" && (
              <Button variant="outline" onClick={onOpen}>
                View results <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentReview() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("final");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedReview, setSelectedReview] = useState<DocumentReview | null>(null);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualType, setManualType] = useState("");
  const [manualContent, setManualContent] = useState("");
  const lastCompletedCountRef = useRef(0);

  const plansQuery = useQuery<BusinessPlan[]>({
    queryKey: ["/api/dashboard/plans"],
    enabled: Boolean(user),
  });

  const reviewsQuery = useQuery<ReviewResponse>({
    queryKey: ["/api/document-reviews"],
    enabled: Boolean(user),
    refetchInterval: 4000,
  });

  const ownCompletedPlans = useMemo(() => {
    const userId = String((user as any)?.id || "");
    return (plansQuery.data || [])
      .filter((plan) =>
        plan.status === "completed" &&
        !plan.isDemoData &&
        String(plan.userId || "") === userId &&
        String(plan.generatedContent || "").trim().length >= 100,
      )
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [plansQuery.data, user]);

  useEffect(() => {
    if (!selectedPlanId && ownCompletedPlans[0]?.id) {
      setSelectedPlanId(ownCompletedPlans[0].id);
    }
  }, [ownCompletedPlans, selectedPlanId]);

  const selectedPlan = ownCompletedPlans.find((plan) => plan.id === selectedPlanId) || ownCompletedPlans[0] || null;
  const reviews = useMemo(
    () => [...(reviewsQuery.data?.reviews || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviewsQuery.data?.reviews],
  );

  const planReviews = useMemo(
    () => selectedPlan ? reviews.filter((review) => review.documentId === selectedPlan.id && review.documentType === "business_plan") : [],
    [reviews, selectedPlan],
  );
  const latestPlanReview = planReviews[0] || null;
  const activePlanReview = planReviews.find((review) => review.status === "pending" || review.status === "processing") || null;
  const completedPlanReview = planReviews.find((review) => review.status === "completed") || null;
  const latestFailedPlanReview = planReviews.find((review) => review.status === "failed") || null;

  useEffect(() => {
    const completedCount = reviews.filter((review) => review.status === "completed").length;
    if (completedCount > lastCompletedCountRef.current) {
      void queryClient.invalidateQueries({ queryKey: ["/api/progress-tracker"] });
    }
    lastCompletedCountRef.current = completedCount;
  }, [reviews]);

  const finalReviewMutation = useMutation({
    mutationFn: async (plan: BusinessPlan) => {
      const content = String(plan.generatedContent || "").trim();
      if (content.length < 100) throw new Error("The completed business plan does not contain enough generated content to review.");
      const response = await apiRequest("POST", "/api/document-reviews", {
        documentName: `${plan.businessName || "Business Plan"} – Final Business Plan`,
        documentType: "business_plan",
        documentContent: content,
        documentId: plan.id,
      });
      return response.json() as Promise<DocumentReview>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/document-reviews"] });
      toast({
        title: "Final review started",
        description: "The complete saved business plan is being reviewed. This page will update automatically.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Could not start final review", description: error.message, variant: "destructive" });
    },
  });

  const manualReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/document-reviews", {
        documentName: manualName.trim(),
        documentType: manualType,
        documentContent: manualContent.trim(),
      });
      return response.json() as Promise<DocumentReview>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/document-reviews"] });
      setManualName("");
      setManualType("");
      setManualContent("");
      toast({ title: "Review started", description: "Your document is being analysed." });
    },
    onError: (error: Error) => {
      toast({ title: "Could not start review", description: error.message, variant: "destructive" });
    },
  });

  const openResults = (review: DocumentReview) => {
    setSelectedReview(review);
    setResultsOpen(true);
  };

  const handleFinalReview = () => {
    if (!selectedPlan) return;
    if (activePlanReview) {
      toast({ title: "Review already in progress", description: "There is no need to submit the same business plan twice." });
      return;
    }
    if (completedPlanReview) {
      openResults(completedPlanReview);
      return;
    }
    finalReviewMutation.mutate(selectedPlan);
  };

  const manualCanSubmit = manualName.trim().length > 0 && manualType.length > 0 && manualContent.trim().length >= 100;
  const isLoading = authLoading || plansQuery.isLoading || reviewsQuery.isLoading;
  const finalStatus = completedPlanReview ? "completed" : activePlanReview ? "active" : latestFailedPlanReview ? "failed" : selectedPlan ? "ready" : "missing";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-72 rounded bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-80 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <FileCheck2 className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold">Sign in to run your final document review</h1>
        <p className="mt-3 text-muted-foreground">Your final review is linked to the business plan and evidence in your own account.</p>
        <Button asChild className="mt-6"><Link href="/login">Sign in</Link></Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Final Document Review | UK Innovator Founder Visa Assistant"
        description="Run an account-synced final quality review of your saved Innovator Founder business plan and supporting application material."
      />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6">
        <header>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Account-synced</Badge>
            <Badge variant="outline">Whole-document review</Badge>
            <Badge variant="outline">Phase 5</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Final Document Review</h1>
          <p className="mt-2 max-w-4xl text-muted-foreground">
            You should not have to copy and paste a business plan the platform already created. The recommended review below uses the latest completed, non-demo business plan saved in your account and links the completed review back to Progress Tracker.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className={selectedPlan ? "border-green-200" : "border-red-200"}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selectedPlan ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>1</div>
              <div>
                <div className="font-semibold">Select source</div>
                <div className="mt-1 text-xs text-muted-foreground">{selectedPlan ? "Completed business plan found" : "Completed business plan required"}</div>
              </div>
            </CardContent>
          </Card>
          <Card className={completedPlanReview ? "border-green-200" : activePlanReview ? "border-amber-200" : "border-border"}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${completedPlanReview ? "bg-green-100 text-green-700" : activePlanReview ? "bg-amber-100 text-amber-700" : "bg-muted"}`}>2</div>
              <div>
                <div className="font-semibold">Run final review</div>
                <div className="mt-1 text-xs text-muted-foreground">{completedPlanReview ? "Review completed" : activePlanReview ? "AI review in progress" : "One action when ready"}</div>
              </div>
            </CardContent>
          </Card>
          <Card className={completedPlanReview ? "border-blue-200" : "border-border"}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${completedPlanReview ? "bg-blue-100 text-blue-700" : "bg-muted"}`}>3</div>
              <div>
                <div className="font-semibold">Continue to compliance</div>
                <div className="mt-1 text-xs text-muted-foreground">Final required check after review</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {completedPlanReview && (
          <Alert className="border-green-300 bg-green-50/70 dark:border-green-900 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-700" />
            <AlertTitle>Final Document Review milestone completed</AlertTitle>
            <AlertDescription className="mt-1">
              The completed review is now part of your account history and Progress Tracker can count this milestone. Review the weaknesses below before relying on the pack, then continue to the Compliance Check.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="final"><FileCheck2 className="mr-2 h-4 w-4" />Final Review</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History ({reviews.length})</TabsTrigger>
            <TabsTrigger value="manual"><Upload className="mr-2 h-4 w-4" />Other Document</TabsTrigger>
          </TabsList>

          <TabsContent value="final" className="space-y-5">
            {!selectedPlan ? (
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <h2 className="font-semibold">No completed account-owned business plan is available</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Demo plans are deliberately excluded. Complete your own generated business plan first so the final review is tied to the correct application.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild><Link href="/questionnaire">Generate / complete plan</Link></Button>
                        <Button variant="outline" asChild><Link href="/documents">Open My Documents</Link></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={completedPlanReview ? "border-green-300" : activePlanReview ? "border-amber-300" : latestFailedPlanReview ? "border-red-300" : "border-primary/25"}>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Recommended source: saved Business Plan
                      </CardTitle>
                      <CardDescription className="mt-2">
                        The full generated text is supplied directly from your account. You do not need to paste it into a blank box.
                      </CardDescription>
                    </div>
                    <div>
                      {finalStatus === "completed" && reviewStatusBadge("completed")}
                      {finalStatus === "active" && reviewStatusBadge(activePlanReview?.status || "processing")}
                      {finalStatus === "failed" && reviewStatusBadge("failed")}
                      {finalStatus === "ready" && <Badge className="border border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100">Ready to review</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {ownCompletedPlans.length > 1 && (
                    <div className="max-w-xl">
                      <Label htmlFor="plan-source">Business plan version</Label>
                      <Select value={selectedPlan.id} onValueChange={setSelectedPlanId}>
                        <SelectTrigger id="plan-source"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ownCompletedPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.businessName || "Business Plan"} • {formatDate(plan.createdAt)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Business</div>
                      <div className="mt-1 font-semibold">{selectedPlan.businessName || "Business Plan"}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Plan status</div>
                      <div className="mt-1 font-semibold capitalize">{selectedPlan.status}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Generated content</div>
                      <div className="mt-1 font-semibold">{wordCount(selectedPlan.generatedContent).toLocaleString("en-GB")} words</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="mt-1 font-semibold">{formatDate(selectedPlan.createdAt)}</div>
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      This is a document-quality review. AI-generated text, scores and suggestions are not independent proof of customers, revenue, funding, contracts, qualifications, patents or other external evidence. Those claims still need genuine supporting records.
                    </AlertDescription>
                  </Alert>

                  {activePlanReview && (
                    <DocumentReviewWaitStatus
                      review={{ status: activePlanReview.status as "pending" | "processing", createdAt: activePlanReview.createdAt }}
                      documentContent={String(selectedPlan.generatedContent || "")}
                    />
                  )}

                  {latestFailedPlanReview && !activePlanReview && !completedPlanReview && (
                    <Alert variant="destructive" data-testid="document-review-failed-state">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>The previous review attempt has ended</AlertTitle>
                      <AlertDescription>
                        This attempt is not still running. It was submitted {formatDate(latestFailedPlanReview.createdAt)} and ended unsuccessfully. Retry the same saved plan below; you do not need to copy or paste its content again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {completedPlanReview ? (
                    <div className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/20 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-green-800 dark:text-green-300">
                          <CheckCircle2 className="h-5 w-5" /> Review completed
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Overall document-preparation score: <strong>{completedPlanReview.overallScore ?? 0}/100</strong>. Open the results to see strengths, weaknesses and improvement actions.
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button variant="outline" onClick={() => openResults(completedPlanReview)}>View full results</Button>
                        <Button asChild>
                          <Link href="/tools/compliance-checker">Continue to Compliance Check <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={handleFinalReview}
                      disabled={Boolean(activePlanReview) || finalReviewMutation.isPending}
                      data-testid="button-run-account-final-review"
                    >
                      {finalReviewMutation.isPending || activePlanReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {activePlanReview ? "Review in progress" : latestFailedPlanReview ? "Retry final review" : "Review my latest business plan"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {latestPlanReview && latestPlanReview.status === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens next?</CardTitle>
                  <CardDescription>Keep the final phase simple: review weaknesses, then run the remaining compliance check.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <button type="button" onClick={() => openResults(latestPlanReview)} className="rounded-lg border p-4 text-left transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4" />1. Review weaknesses</div>
                    <p className="mt-2 text-sm text-muted-foreground">Check that every proposed improvement remains consistent with the underlying evidence and business-plan facts.</p>
                  </button>
                  <Link href="/tools/compliance-checker" className="rounded-lg border border-blue-200 p-4 transition-colors hover:bg-blue-50/50 dark:border-blue-900 dark:hover:bg-blue-950/20">
                    <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" />2. Compliance Check</div>
                    <p className="mt-2 text-sm text-muted-foreground">Complete the remaining required compliance milestone and return to Progress Tracker.</p>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Review history</h2>
                <p className="text-sm text-muted-foreground">All document reviews saved to this account.</p>
              </div>
              <Button variant="outline" onClick={() => reviewsQuery.refetch()} disabled={reviewsQuery.isFetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${reviewsQuery.isFetching ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>

            {reviews.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No document reviews have been created yet.</CardContent></Card>
            ) : reviews.map((review) => (
              <HistoryCard key={review.id} review={review} onOpen={() => openResults(review)} />
            ))}
          </TabsContent>

          <TabsContent value="manual" className="space-y-5">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertTitle>Manual review is a fallback, not the default</AlertTitle>
              <AlertDescription>
                Use this only for a different document that is not already available as the completed business plan in your account. The Final Review tab is the recommended route for the Progress Tracker milestone.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Review another document</CardTitle>
                <CardDescription>Paste at least 100 characters from a separate document.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="manual-document-name">Document name</Label>
                    <Input id="manual-document-name" value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="e.g. Founder personal statement" />
                  </div>
                  <div>
                    <Label htmlFor="manual-document-type">Document type</Label>
                    <Select value={manualType} onValueChange={setManualType}>
                      <SelectTrigger id="manual-document-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {MANUAL_DOCUMENT_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="manual-document-content">Document content</Label>
                  <Textarea id="manual-document-content" rows={14} value={manualContent} onChange={(event) => setManualContent(event.target.value)} placeholder="Paste the separate document content here..." />
                  <p className="mt-1 text-xs text-muted-foreground">{manualContent.trim().length.toLocaleString("en-GB")} characters</p>
                </div>
                <Button onClick={() => manualReviewMutation.mutate()} disabled={!manualCanSubmit || manualReviewMutation.isPending}>
                  {manualReviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}
                  Start review
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ReviewResultsDialog review={selectedReview} open={resultsOpen} onOpenChange={setResultsOpen} />
    </>
  );
}
