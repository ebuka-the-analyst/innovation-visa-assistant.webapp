import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Info,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useApplicationContextPrefill } from "@/hooks/useToolPlatform";

interface NewsArticle {
  id: string;
  sourceName: string;
  sourceUrl: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  category: string;
  tags: string[] | null;
  relevanceScore: number | null;
  publishedAt: string;
  fetchedAt: string;
  aiSummary: string | null;
  keyPoints: string[] | null;
  isActive: boolean;
}

type FilterCategory = "all" | "visa" | "immigration" | "business" | "tax";
type ReadinessStatus = "compliant" | "attention" | "pending";

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  fetchedAt: string;
  category: Exclude<FilterCategory, "all">;
  priority: "high" | "medium" | "info";
  affectsApplication: boolean;
}

interface ReadinessItem {
  id: string;
  requirement: string;
  status: ReadinessStatus;
  detail: string;
  destination?: string;
}

const OFFICIAL_SOURCE_NAMES = ["gov.uk", "home office", "uk visas and immigration", "ukvi", "hmrc"];

function hasValue(value: unknown) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function isOfficialArticle(article: NewsArticle) {
  const source = (article.sourceName || "").toLowerCase();
  if (OFFICIAL_SOURCE_NAMES.some((name) => source.includes(name))) return true;
  try {
    const hostname = new URL(article.url).hostname.toLowerCase();
    return hostname === "gov.uk" || hostname.endsWith(".gov.uk");
  } catch {
    return false;
  }
}

function categoriseArticle(article: NewsArticle): Exclude<FilterCategory, "all"> {
  const text = `${article.category || ""} ${article.title} ${article.description || ""}`.toLowerCase();
  if (/hmrc|tax|corporation tax|vat|payroll/.test(text)) return "tax";
  if (/business|company|companies house|employment|worker|jobs?/.test(text)) return "business";
  if (/innovator founder|visa|entry clearance|leave to remain|settlement|ilr/.test(text)) return "visa";
  return "immigration";
}

function priorityForArticle(article: NewsArticle) {
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  const published = Date.parse(article.publishedAt);
  const ageDays = Number.isFinite(published) ? Math.max(0, (Date.now() - published) / 86_400_000) : 9999;
  if (ageDays <= 45 && /innovator founder|immigration rules|statement of changes|visa/.test(text)) return "high" as const;
  if (ageDays <= 120 && /immigration|home office|ukvi|hmrc|business/.test(text)) return "medium" as const;
  return "info" as const;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function readinessStatus(signals: number, strongAt: number): ReadinessStatus {
  if (signals >= strongAt) return "compliant";
  if (signals > 0) return "attention";
  return "pending";
}

export default function RegulatoryCopilot() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");

  const newsQuery = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", "regulatory-copilot"],
    queryFn: async () => {
      const response = await fetch("/api/news?limit=60");
      if (!response.ok) throw new Error("Official update feed could not be loaded.");
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("Official update feed returned an invalid response.");
      return payload;
    },
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
    retry: 1,
  });

  const applicationQuery = useApplicationContextPrefill("regulatory-copilot");
  const application = applicationQuery.data;
  const plan = application?.businessPlan;
  const documents = application?.documents || [];

  const updates = useMemo<RegulatoryUpdate[]>(() => {
    return (newsQuery.data || [])
      .filter((article) => article.isActive !== false && isOfficialArticle(article))
      .map((article) => {
        const category = categoriseArticle(article);
        const priority = priorityForArticle(article);
        const planText = `${plan?.industry || ""} ${plan?.businessName || ""}`.toLowerCase();
        const articleText = `${article.title} ${article.description || ""}`.toLowerCase();
        const affectsApplication = /innovator founder|immigration rules|visa|endorsement|settlement|ilr/.test(articleText)
          || (Boolean(planText) && planText.split(/\s+/).filter((word) => word.length > 4).some((word) => articleText.includes(word)));
        return {
          id: article.id,
          title: article.title,
          summary: article.aiSummary || article.description || article.content || "Open the official source for the full update.",
          source: article.sourceName || "GOV.UK",
          sourceUrl: article.url,
          publishedAt: article.publishedAt,
          fetchedAt: article.fetchedAt,
          category,
          priority,
          affectsApplication,
        };
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [newsQuery.data, plan?.businessName, plan?.industry]);

  const readinessItems = useMemo<ReadinessItem[]>(() => {
    if (!application) return [];

    const innovationSignals = [plan?.uniqueness, plan?.technology, plan?.competitiveDifferentiation, plan?.supportingEvidence].filter(hasValue).length;
    const tractionSignals = [plan?.existingCustomers, plan?.tractionEvidence, plan?.customerInterviews, plan?.lettersOfIntent, plan?.willingnessToPay].filter(hasValue).length;
    const financialSignals = [plan?.monthlyProjections, plan?.detailedCosts, application.relatedToolData.financialModel].filter(hasValue).length;
    const endorserSignals = [plan?.targetEndorser, plan?.contactPointsStrategy].filter(hasValue).length;
    const complianceSignals = [plan?.regulatoryRequirements, plan?.complianceTimeline, plan?.complianceDesign].filter(hasValue).length;
    const evidenceRefs = new Set([...(application.caseContext.evidenceRefs || []), ...documents.map((doc) => doc.reference)]);

    return [
      {
        id: "plan",
        requirement: "Application business plan",
        status: plan ? "compliant" : "pending",
        detail: plan ? `Using ${plan.businessName || "your latest saved plan"} (${plan.status || "saved"}).` : "No reusable business plan is available yet.",
        destination: plan ? "/dashboard" : "/questionnaire",
      },
      {
        id: "innovation",
        requirement: "Innovation and differentiation evidence",
        status: readinessStatus(innovationSignals, 3),
        detail: innovationSignals ? `${innovationSignals} supporting plan signal${innovationSignals === 1 ? "" : "s"} found.` : "No innovation evidence is currently available in the reusable application context.",
        destination: "/evidence-graph",
      },
      {
        id: "traction",
        requirement: "Market validation and traction evidence",
        status: readinessStatus(tractionSignals, 2),
        detail: tractionSignals ? `${tractionSignals} market-validation signal${tractionSignals === 1 ? "" : "s"} found.` : "Add customer, interview, LOI or traction evidence to strengthen this area.",
        destination: "/traction-evidence",
      },
      {
        id: "financial",
        requirement: "Financial model and assumptions",
        status: readinessStatus(financialSignals, 2),
        detail: application.relatedToolData.financialModel
          ? `A completed ${application.relatedToolData.financialModel.toolId.replaceAll("-", " ")} run is linked to this business.`
          : financialSignals ? "Financial information exists in the plan, but no completed financial-tool run is linked." : "No reusable financial model or detailed projections were found.",
        destination: "/tools-hub",
      },
      {
        id: "documents",
        requirement: "Supporting document set",
        status: readinessStatus(documents.length, 3),
        detail: documents.length ? `${documents.length} uploaded document${documents.length === 1 ? "" : "s"} available to the application context.` : "No uploaded supporting documents are available yet.",
        destination: "/documents",
      },
      {
        id: "endorser",
        requirement: "Endorser and contact-point preparation",
        status: readinessStatus(endorserSignals, 2),
        detail: endorserSignals === 2 ? "Target endorser and contact-point strategy are both present." : endorserSignals ? "Part of the endorser preparation is present." : "No target endorser/contact-point strategy is currently available.",
        destination: "/endorser-comparison",
      },
      {
        id: "compliance",
        requirement: "Regulatory and compliance planning",
        status: readinessStatus(complianceSignals, 2),
        detail: complianceSignals ? `${complianceSignals} compliance-planning signal${complianceSignals === 1 ? "" : "s"} found in the plan.` : "No reusable compliance planning details were found.",
        destination: "/compliance-dashboard",
      },
      {
        id: "evidence-refs",
        requirement: "Traceable evidence references",
        status: readinessStatus(evidenceRefs.size, 2),
        detail: evidenceRefs.size ? `${evidenceRefs.size} evidence reference${evidenceRefs.size === 1 ? "" : "s"} are linked to this application context.` : "No traceable evidence references are linked yet.",
        destination: "/evidence-graph",
      },
    ];
  }, [application, documents, plan]);

  const filteredUpdates = updates.filter((update) => {
    const matchesCategory = activeCategory === "all" || update.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || `${update.title} ${update.summary} ${update.source}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const priorityCount = updates.filter((update) => update.priority === "high").length;
  const compliantCount = readinessItems.filter((item) => item.status === "compliant").length;
  const attentionCount = readinessItems.filter((item) => item.status === "attention").length;
  const pendingCount = readinessItems.filter((item) => item.status === "pending").length;
  const readinessScore = readinessItems.length
    ? Math.round((readinessItems.reduce((sum, item) => sum + (item.status === "compliant" ? 1 : item.status === "attention" ? 0.5 : 0), 0) / readinessItems.length) * 100)
    : null;

  const fetchedAt = useMemo(() => {
    const timestamps = [application?.generatedAt, ...(newsQuery.data || []).map((article) => article.fetchedAt)]
      .map((value) => value ? Date.parse(value) : NaN)
      .filter(Number.isFinite);
    if (!timestamps.length) return null;
    return new Date(Math.max(...timestamps)).toISOString();
  }, [application?.generatedAt, newsQuery.data]);

  const refreshing = newsQuery.isFetching || applicationQuery.isFetching;
  const refreshAll = () => void Promise.allSettled([newsQuery.refetch(), applicationQuery.refetch()]);

  return (
    <div className="space-y-8" data-testid="regulatory-copilot-live">
      <Card className="border-red-500/20 bg-gradient-to-r from-red-500/5 via-background to-red-500/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Regulatory Copilot</h1>
              <p className="text-muted-foreground">Official-source updates plus readiness signals from your saved application data</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-red-600 text-white hover:bg-red-600"><Bell className="mr-1 h-3.5 w-3.5" /> {priorityCount} priority update{priorityCount === 1 ? "" : "s"}</Badge>
            <Button variant="outline" onClick={refreshAll} disabled={refreshing} data-testid="button-regulatory-refresh">
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search official regulatory updates..." className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "visa", "immigration", "business", "tax"] as FilterCategory[]).map((category) => (
                <Button key={category} size="sm" variant={activeCategory === category ? "default" : "outline"} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "bg-red-600 hover:bg-red-700" : ""}>
                  {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {newsQuery.isLoading ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">Loading official-source updates...</Card>
          ) : newsQuery.isError ? (
            <Card className="border-red-500/30 bg-red-500/5 p-8 text-center">
              <AlertTriangle className="mx-auto h-7 w-7 text-red-600" />
              <h2 className="mt-3 font-semibold">Official update feed unavailable</h2>
              <p className="mt-1 text-sm text-muted-foreground">{newsQuery.error instanceof Error ? newsQuery.error.message : "The update feed could not be loaded."} No cached regulatory claims are being substituted.</p>
              <Button variant="outline" className="mt-4" onClick={() => newsQuery.refetch()}>Try Again</Button>
            </Card>
          ) : filteredUpdates.length === 0 ? (
            <Card className="p-8 text-center">
              <Info className="mx-auto h-7 w-7 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">No matching official updates</h2>
              <p className="mt-1 text-sm text-muted-foreground">The Copilot does not invent or backfill regulatory stories when the official-source feed has no matching item.</p>
            </Card>
          ) : (
            filteredUpdates.map((update) => (
              <Card key={update.id} className={`p-5 ${update.priority === "high" ? "border-l-4 border-l-red-500" : update.priority === "medium" ? "border-l-4 border-l-amber-500" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={update.priority === "high" ? "destructive" : "secondary"}>{update.priority === "high" ? "PRIORITY" : update.priority === "medium" ? "REVIEW" : "INFO"}</Badge>
                  <Badge variant="outline">{update.category}</Badge>
                  {update.affectsApplication && <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300"><AlertTriangle className="mr-1 h-3 w-3" /> Relevant to application</Badge>}
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-tight">{update.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.summary}</p>
                {update.affectsApplication && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                    <strong>Review step:</strong> Open the official source and compare the change with your current business plan, evidence and application materials before relying on it.
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Published {formatDate(update.publishedAt)}</span>
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {update.source}</span>
                  <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-red-700 hover:underline dark:text-red-300"><ExternalLink className="h-3.5 w-3.5" /> View official source</a>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-red-600" /><h2 className="text-lg font-semibold">Application Readiness</h2></div>
            {applicationQuery.isLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">Reading your saved application context...</p>
            ) : applicationQuery.isError ? (
              <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm">
                <p className="font-medium">Readiness data unavailable</p>
                <p className="mt-1 text-muted-foreground">Your saved application data could not be loaded. No score is being estimated.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => applicationQuery.refetch()}>Retry</Button>
              </div>
            ) : (
              <>
                <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-red-100 dark:border-red-950">
                  <div className="text-center"><div className="text-3xl font-bold">{readinessScore ?? "—"}{readinessScore == null ? "" : "%"}</div><div className="text-[11px] text-muted-foreground">evidence readiness</div></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-emerald-500/10 p-2"><div className="font-bold text-emerald-700 dark:text-emerald-300">{compliantCount}</div><div>Strong</div></div>
                  <div className="rounded-lg bg-amber-500/10 p-2"><div className="font-bold text-amber-700 dark:text-amber-300">{attentionCount}</div><div>Partial</div></div>
                  <div className="rounded-lg bg-muted p-2"><div className="font-bold">{pendingCount}</div><div>Missing</div></div>
                </div>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Readiness Checklist</h2>
            <p className="mt-1 text-xs text-muted-foreground">Calculated from your current business plan, documents and linked tool data.</p>
            <div className="mt-4 space-y-3">
              {readinessItems.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    {item.status === "compliant" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : item.status === "attention" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> : <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.requirement}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>{item.destination && <a href={item.destination} className="mt-2 inline-block text-xs font-medium text-red-700 hover:underline dark:text-red-300">Open related tool</a>}</div>
                  </div>
                </div>
              ))}
              {!applicationQuery.isLoading && !applicationQuery.isError && readinessItems.length === 0 && <p className="text-sm text-muted-foreground">No application context is available yet.</p>}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4 text-xs leading-5 text-muted-foreground">
        <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Updates shown here are taken from the platform news feed and restricted to recognised official UK government sources when available. Readiness is calculated only from your saved plan, documents and linked tool context. It is not a legal determination. {fetchedAt ? `Data last fetched ${formatDate(fetchedAt)}.` : "No successful data fetch has been recorded yet."}</p></div>
      </Card>
    </div>
  );
}
