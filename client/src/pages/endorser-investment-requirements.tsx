import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, PoundSterling, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";

type NewsArticle = {
  id: string;
  title: string;
  description?: string | null;
  sourceName?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  isActive?: boolean;
};

function formatGbp(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) return "Not recorded";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(number);
}

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

export default function EndorserInvestmentRequirements() {
  const [, setLocation] = useLocation();
  const contextQuery = useApplicationContextPrefill("investment-requirements");
  const data = contextQuery.data;
  const plan = data?.businessPlan;
  const financialModel = data?.relatedToolData.financialModel;

  const newsQuery = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", "financial-requirements"],
    queryFn: async () => {
      const response = await fetch("/api/news?limit=100");
      if (!response.ok) throw new Error("Official-source feed unavailable.");
      const body = await response.json();
      return Array.isArray(body) ? body : [];
    },
    retry: 1,
    staleTime: 5 * 60_000,
  });

  const financeUpdates = useMemo(() => (newsQuery.data || []).filter((article) => {
    const text = `${article.title} ${article.description || ""}`.toLowerCase();
    return article.isActive !== false && isOfficial(article) && /fund|financial|maintenance|saving|investment|fee|money/.test(text);
  }).slice(0, 8), [newsQuery.data]);

  if (contextQuery.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (contextQuery.isError) return <div className="responsive-container py-16"><Card className="mx-auto max-w-2xl border-red-500/30 p-8 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-600" /><h1 className="mt-3 text-xl font-bold">Financial context could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">No funding requirement has been assumed.</p><Button className="mt-5" variant="outline" onClick={() => contextQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button></Card></div>;

  const evidenceItems = [
    { label: "Funding amount in business plan", value: plan ? formatGbp(plan.funding) : "No saved plan" },
    { label: "Funding sources", value: plan?.fundingSources || "Not recorded" },
    { label: "Detailed cost assumptions", value: plan?.detailedCosts || "Not recorded" },
    { label: "Monthly projections", value: plan?.monthlyProjections || "Not recorded" },
    { label: "Linked financial model", value: financialModel ? `${financialModel.toolId.replaceAll("-", " ")} · completed` : "No completed financial tool run linked" },
    { label: "Uploaded supporting documents", value: `${data?.documents.length || 0} document${data?.documents.length === 1 ? "" : "s"} in application context` },
  ];

  return (
    <div className="min-h-screen">
      <div className="responsive-container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">FINANCIAL EVIDENCE</span><h1 className="mt-3 text-xl font-bold">Funding & Financial Requirements Planner</h1><p className="mt-2 max-w-3xl text-muted-foreground">Prepare the financial evidence behind your business plan and separately verify the current immigration financial requirements from official sources.</p></div><Button variant="outline" onClick={() => void Promise.allSettled([contextQuery.refetch(), newsQuery.refetch()])} disabled={contextQuery.isFetching || newsQuery.isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${(contextQuery.isFetching || newsQuery.isFetching) ? "animate-spin" : ""}`} />Refresh</Button></div>

          <Alert className="mt-6 border-amber-500/30 bg-amber-500/5"><AlertCircle className="h-4 w-4 text-amber-600" /><AlertDescription><strong>No embedded legal figures:</strong> this page no longer hardcodes maintenance amounts, team-funding thresholds, points, visa duration, endorsement-letter validity or fees. Those rules can change and may depend on your circumstances. Use the current Immigration Rules/GOV.UK guidance when you are ready to apply.</AlertDescription></Alert>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{evidenceItems.map((item) => <Card key={item.label}><CardContent className="p-5"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p><p className="mt-2 break-words text-sm font-semibold">{item.value}</p></CardContent></Card>)}</div>

          <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><PoundSterling className="h-5 w-5 text-red-600" />Business funding evidence to prepare</CardTitle></CardHeader><CardContent className="space-y-3">{[
            "Explain what funding the business actually needs and how the amount follows from your cost and growth assumptions.",
            "Identify the source of funds and keep traceable documents that support the source and availability of those funds.",
            "Keep projections internally consistent with pricing, customer acquisition, staffing, technology and operating costs.",
            "Separate business-finance assumptions from any personal immigration maintenance requirement that applies to you.",
            "If there are multiple founders, verify the current rules and the relevant endorsing body's current policy instead of assuming one threshold applies to everyone.",
          ].map((item) => <div key={item} className="flex items-start gap-3 rounded-lg border p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><p className="text-sm leading-6">{item}</p></div>)}<div className="flex flex-wrap gap-2 pt-2"><Button variant="outline" onClick={() => setLocation("/tools-hub")}>Open Financial Tools</Button><Button variant="outline" onClick={() => setLocation("/documents")}>Manage Evidence</Button></div></CardContent></Card>

          <Card className="mt-6"><CardHeader><CardTitle>Current official-source financial updates</CardTitle></CardHeader><CardContent>{newsQuery.isError ? <p className="text-sm text-muted-foreground">The official-source feed could not be loaded. No cached financial requirements are substituted.</p> : financeUpdates.length ? <div className="space-y-3">{financeUpdates.map((article) => <a key={article.id} href={article.url || undefined} target="_blank" rel="noopener noreferrer" className="block rounded-lg border p-4 hover:bg-muted/40"><p className="text-sm font-medium">{article.title}</p><p className="mt-1 text-xs text-muted-foreground">{article.sourceName || "Official source"}{article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString("en-GB")}` : ""}</p></a>)}</div> : <p className="text-sm text-muted-foreground">No relevant official-source update is currently stored in the platform feed.</p>}<div className="mt-4 flex flex-wrap gap-2"><a href="https://www.gov.uk/innovator-founder-visa" target="_blank" rel="noopener noreferrer"><Button variant="outline">GOV.UK route guidance <ExternalLink className="ml-2 h-4 w-4" /></Button></a><a href="https://www.gov.uk/guidance/immigration-rules" target="_blank" rel="noopener noreferrer"><Button variant="outline">Immigration Rules <ExternalLink className="ml-2 h-4 w-4" /></Button></a></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
