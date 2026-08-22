import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertTriangle, ExternalLink, Info, Loader2, RefreshCw, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";
import FeatureNavigation from "@/components/FeatureNavigation";

type EndorserResult = {
  endorserId: string;
  endorserName: string;
  totalScore: number;
  breakdown?: {
    innovationScore?: number;
    viabilityScore?: number;
    scalabilityScore?: number;
  };
  sectorFit?: boolean;
  riskLevel?: string;
  recommendation?: string;
  feedback?: string;
};

type SimulationResponse = {
  endorsers?: EndorserResult[];
  scores?: unknown[];
};

type NewsArticle = {
  id: string;
  title: string;
  description?: string | null;
  sourceName?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  isActive?: boolean;
};

function isOfficial(article: NewsArticle) {
  const source = String(article.sourceName || "").toLowerCase();
  if (/gov\.uk|home office|uk visas and immigration|ukvi/.test(source)) return true;
  try {
    const host = new URL(String(article.url || "")).hostname.toLowerCase();
    return host === "gov.uk" || host.endsWith(".gov.uk");
  } catch {
    return false;
  }
}

function scoreTone(value: number) {
  if (value >= 75) return "text-emerald-700 dark:text-emerald-300";
  if (value >= 50) return "text-amber-700 dark:text-amber-300";
  return "text-red-700 dark:text-red-300";
}

export default function EndorserComparison() {
  const [, setLocation] = useLocation();
  const contextQuery = useApplicationContextPrefill("endorser-comparison");
  const plan = contextQuery.data?.businessPlan;

  const simulationQuery = useQuery<SimulationResponse>({
    queryKey: ["/api/endorser/simulate", plan?.id],
    queryFn: async () => {
      const response = await fetch(`/api/endorser/simulate/${encodeURIComponent(plan!.id)}`, { credentials: "include" });
      if (!response.ok) throw new Error(`Endorser diagnostic failed (${response.status}).`);
      return response.json();
    },
    enabled: Boolean(plan?.id),
    staleTime: 0,
    retry: 1,
  });

  const newsQuery = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", "endorser-comparison"],
    queryFn: async () => {
      const response = await fetch("/api/news?limit=100");
      if (!response.ok) throw new Error("Official-source update feed unavailable.");
      const body = await response.json();
      return Array.isArray(body) ? body : [];
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const officialEndorserUpdates = useMemo(() => (newsQuery.data || []).filter((article) => {
    const text = `${article.title} ${article.description || ""}`.toLowerCase();
    return article.isActive !== false && isOfficial(article) && /endorser|endorsing body|endorsement/.test(text);
  }).slice(0, 8), [newsQuery.data]);

  const results = Array.isArray(simulationQuery.data?.endorsers) ? simulationQuery.data!.endorsers! : [];
  const sortedResults = [...results].sort((a, b) => Number(b.totalScore || 0) - Number(a.totalScore || 0));
  const refreshing = contextQuery.isFetching || simulationQuery.isFetching || newsQuery.isFetching;
  const refreshAll = () => void Promise.allSettled([contextQuery.refetch(), simulationQuery.refetch(), newsQuery.refetch()]);

  if (contextQuery.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (contextQuery.isError) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertTriangle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Application context unavailable</h1><p className="mt-2 text-sm text-muted-foreground">No endorser fit has been guessed.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}>Retry</Button></Card></div>;
  if (!plan) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl p-8 text-center"><Target className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Choose a business plan first</h1><p className="mt-2 text-sm text-muted-foreground">Endorser comparison now analyses your saved business profile instead of displaying fixed success rates, fees or processing times.</p><Button className="mt-5" onClick={() => setLocation("/questionnaire")}>Open Business Plan Builder</Button></Card></div>;

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <FeatureNavigation currentPage="endorser-comparison" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">ENDORSER COMPARISON</span><h1 className="mt-3 text-xl font-bold">Endorser Fit Diagnostic</h1><p className="mt-2 max-w-3xl text-muted-foreground">Compare the platform's current diagnostic output for <strong>{plan.businessName || "your saved business plan"}</strong>. Scores describe fit against the model, not an endorsing body's acceptance probability.</p></div>
            <Button variant="outline" onClick={refreshAll} disabled={refreshing}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</Button>
          </div>

          <Alert className="mt-6 border-amber-500/30 bg-amber-500/5"><AlertTriangle className="h-4 w-4 text-amber-600" /><AlertDescription><strong>No fixed success rates or timelines:</strong> availability, sector policies, fees and assessment processes can change. Verify the current approved endorsing-body list and each body's terms before applying.</AlertDescription></Alert>

          {plan.targetEndorser && <Card className="mt-6 border-red-500/20 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target currently saved in your plan</p><p className="mt-1 text-lg font-semibold">{plan.targetEndorser}</p></Card>}

          <div className="mt-6">
            {simulationQuery.isLoading ? <Card className="p-10 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin" /><p className="mt-3 text-sm text-muted-foreground">Running plan-specific endorser diagnostic...</p></Card> : simulationQuery.isError ? <Card className="border-red-500/30 p-8 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-red-600" /><h2 className="mt-3 font-semibold">Diagnostic unavailable</h2><p className="mt-1 text-sm text-muted-foreground">{simulationQuery.error instanceof Error ? simulationQuery.error.message : "The diagnostic service could not be loaded."} No fallback scores are shown.</p><Button className="mt-4" variant="outline" onClick={() => simulationQuery.refetch()}>Try Again</Button></Card> : sortedResults.length === 0 ? <Card className="p-8 text-center"><Info className="mx-auto h-7 w-7 text-muted-foreground" /><h2 className="mt-3 font-semibold">No comparison results returned</h2><p className="mt-1 text-sm text-muted-foreground">Complete more of your business plan and retry. The app will not populate generic endorser rankings.</p></Card> : <div className="grid gap-4 md:grid-cols-2">{sortedResults.map((endorser) => <Card key={endorser.endorserId || endorser.endorserName}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{endorser.endorserName}</CardTitle>{endorser.riskLevel && <Badge variant="outline" className="mt-2">Model risk: {endorser.riskLevel}</Badge>}</div><div className={`text-2xl font-bold ${scoreTone(Number(endorser.totalScore || 0))}`}>{Math.round(Number(endorser.totalScore || 0))}/100</div></div></CardHeader><CardContent><div className="grid grid-cols-3 gap-2 text-center text-xs"><Metric label="Innovation" value={endorser.breakdown?.innovationScore} /><Metric label="Viability" value={endorser.breakdown?.viabilityScore} /><Metric label="Scalability" value={endorser.breakdown?.scalabilityScore} /></div>{endorser.recommendation && <p className="mt-4 text-sm"><strong>Model recommendation:</strong> {endorser.recommendation}</p>}{endorser.feedback && <p className="mt-2 text-sm text-muted-foreground">{endorser.feedback}</p>}<p className="mt-4 text-xs text-muted-foreground">Diagnostic only. It does not represent this organisation's own published assessment or a probability of endorsement.</p></CardContent></Card>)}</div>}
          </div>

          <Card className="mt-6 p-6"><div className="flex items-center gap-2"><ExternalLink className="h-5 w-5 text-red-600" /><h2 className="font-semibold">Official-source endorsement updates</h2></div>{newsQuery.isError ? <p className="mt-3 text-sm text-muted-foreground">Official-source news could not be loaded. No cached claims are substituted.</p> : officialEndorserUpdates.length ? <div className="mt-4 space-y-3">{officialEndorserUpdates.map((article) => <a key={article.id} href={article.url || undefined} target="_blank" rel="noopener noreferrer" className="block rounded-lg border p-4 hover:bg-muted/40"><p className="text-sm font-medium">{article.title}</p><p className="mt-1 text-xs text-muted-foreground">{article.sourceName || "Official source"}{article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString("en-GB")}` : ""}</p></a>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No current official-source endorser update is stored in the platform feed.</p>}<a href="https://www.gov.uk/government/publications/endorsing-bodies-innovator-founder-and-scale-up-visas" target="_blank" rel="noopener noreferrer"><Button variant="outline" className="mt-4">Open GOV.UK endorsing-body list <ExternalLink className="ml-2 h-4 w-4" /></Button></a></Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return <div className="rounded-lg border p-2"><p className="font-bold">{typeof value === "number" ? Math.round(value) : "—"}</p><p className="mt-1 text-muted-foreground">{label}</p></div>;
}
