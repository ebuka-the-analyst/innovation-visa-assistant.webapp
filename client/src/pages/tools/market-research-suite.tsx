import { useMemo, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToolRunHistory } from "@/hooks/useToolPlatform";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SUPPORTED_TOOLS = new Set([
  "market-analysis",
  "market-data-verifier",
  "market-research",
  "market-size",
  "market-gap",
  "competitor-bench",
  "pmf-validator",
]);

const TOOL_COPY: Record<string, { title: string; subtitle: string }> = {
  "market-analysis": {
    title: "Live Market Analysis",
    subtitle: "Research the market, competitors, demand signals and sizing assumptions using current web sources with auditable provenance.",
  },
  "market-data-verifier": {
    title: "Market Data Verifier",
    subtitle: "Verify externally sourced market claims against the live web and separate sourced facts from inference and user assumptions.",
  },
  "market-research": {
    title: "Market Research Compiler",
    subtitle: "Build a source register, competitor view, customer signals and evidence-backed research narrative in one durable research run.",
  },
  "market-size": {
    title: "TAM / SAM / SOM Research",
    subtitle: "Find and calculate market-sizing evidence without inventing unsupported market numbers.",
  },
  "market-gap": {
    title: "Market Gap Analysis",
    subtitle: "Identify potential market gaps and show the sources and uncertainty behind each conclusion.",
  },
  "competitor-bench": {
    title: "Competitor Benchmarking",
    subtitle: "Research named and discovered competitors, positioning, strengths and gaps with traceable source evidence.",
  },
  "pmf-validator": {
    title: "Product-Market Fit Research",
    subtitle: "Combine market evidence, customer signals and explicit assumptions to identify where demand evidence is strong or still missing.",
  },
};

type UserAssumption = { id: string; label: string; value: string };
type FormState = {
  businessName: string;
  businessSummary: string;
  targetGeography: string;
  targetCustomers: string;
  problemStatement: string;
  proposedSolution: string;
  knownCompetitors: string[];
  researchQuestions: string[];
  userAssumptions: UserAssumption[];
};

type MarketSizingItem = {
  status: "sourced" | "calculated_from_sourced_inputs" | "user_assumption" | "unavailable";
  value: number | null;
  currency: string | null;
  period: string | null;
  methodology: string;
  sourceIds: string[];
  assumptionIds: string[];
};

type SourceEntry = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedDate: string | null;
  notes: string;
  normalizedUrl: string | null;
  verifiedBySearchTool: boolean;
  quality: "authoritative" | "strong" | "contextual";
  category: string;
  accessedAt: string;
  publishedAgeDays: number | null;
  freshness: "recent" | "older" | "stale_review_recommended" | "unknown";
};

type ResearchResult = {
  researchVersion: string;
  providerModel: string;
  accessedAt: string;
  researchSummary: string;
  marketDefinition: string;
  marketSizing: { tam: MarketSizingItem; sam: MarketSizingItem; som: MarketSizingItem };
  competitors: Array<{
    name: string;
    positioning: string;
    strengths: string[];
    weaknessesOrGaps: string[];
    sourceIds: string[];
  }>;
  marketGaps: Array<{ gap: string; evidence: string; sourceIds: string[]; confidence: "high" | "medium" | "low" }>;
  customerSignals: Array<{ signal: string; sourceIds: string[]; confidence: "high" | "medium" | "low" }>;
  risksAndUnknowns: string[];
  claims: Array<{
    id: string;
    claim: string;
    claimType: "sourced_fact" | "inference" | "user_assumption";
    sourceIds: string[];
    assumptionIds: string[];
    confidence: "high" | "medium" | "low";
  }>;
  sourceRegister: SourceEntry[];
  recommendations: string[];
  provenance: {
    searchToolSourceCount: number;
    registeredSourceCount: number;
    verifiedRegisteredSourceCount: number;
    unusedSearchToolSourceCount: number;
    sourcedFactCount: number;
    authoritativeClaimCount: number;
    userAssumptionCount: number;
    validationAttempts: number;
  };
  disclaimer: string;
};

type ResearchResponse = {
  success: true;
  runId: string;
  validationState: "validated";
  registryVersion: string;
  policyVersion: string;
  resultSha256: string;
  research: ResearchResult;
};

function initialForm(): FormState {
  return {
    businessName: "",
    businessSummary: "",
    targetGeography: "United Kingdom",
    targetCustomers: "",
    problemStatement: "",
    proposedSolution: "",
    knownCompetitors: [],
    researchQuestions: [],
    userAssumptions: [],
  };
}

function assumptionRow(): UserAssumption {
  return { id: `assumption-${crypto.randomUUID().slice(0, 8)}`, label: "", value: "" };
}

function formatMarketValue(item: MarketSizingItem) {
  if (item.status === "unavailable" || item.value === null) return "Unavailable";
  if (!item.currency) return new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 2 }).format(item.value);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: item.currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(item.value);
  } catch {
    return `${item.currency} ${new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 2 }).format(item.value)}`;
  }
}

function confidenceVariant(confidence: string): "default" | "secondary" | "outline" {
  if (confidence === "high") return "default";
  if (confidence === "medium") return "secondary";
  return "outline";
}

function sourceQualityVariant(quality: SourceEntry["quality"]): "default" | "secondary" | "outline" {
  if (quality === "authoritative") return "default";
  if (quality === "strong") return "secondary";
  return "outline";
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

function sourceLabels(ids: string[], sources: SourceEntry[]) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return ids.map((id) => byId.get(id)).filter((source): source is SourceEntry => Boolean(source));
}

export default function MarketResearchSuite() {
  const params = useParams<{ toolId: string }>();
  const toolId = SUPPORTED_TOOLS.has(params.toolId || "") ? params.toolId! : "market-analysis";
  const copy = TOOL_COPY[toolId] || TOOL_COPY["market-analysis"];
  const [form, setForm] = useState<FormState>(initialForm);
  const [competitorDraft, setCompetitorDraft] = useState("");
  const [questionDraft, setQuestionDraft] = useState("");
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const runKeyRef = useRef<string | null>(null);
  const history = useToolRunHistory(toolId, true);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: async (): Promise<ResearchResponse> => {
      if (!runKeyRef.current) runKeyRef.current = crypto.randomUUID();
      const response = await apiRequest("POST", "/api/market-research/run", {
        ...form,
        knownCompetitors: form.knownCompetitors.filter((item) => item.trim()),
        researchQuestions: form.researchQuestions.filter((item) => item.trim()),
        userAssumptions: form.userAssumptions.filter((item) => item.label.trim() && item.value.trim()),
        toolId,
        clientRunKey: runKeyRef.current,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      setResult(data);
      runKeyRef.current = null;
      await queryClient.invalidateQueries({ queryKey: ["/api/tool-platform/runs", toolId] });
      window.setTimeout(() => document.getElementById("market-research-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    },
  });

  const staleSources = useMemo(
    () => result?.research.sourceRegister.filter((source) => source.freshness === "stale_review_recommended") ?? [],
    [result],
  );

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">Live web research</Badge>
              <Badge variant="outline">Source provenance validated</Badge>
              <Badge variant="outline">No unsupported market numbers</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{copy.title}</h1>
            <p className="mt-2 max-w-4xl text-muted-foreground">{copy.subtitle}</p>
          </div>
          {(history.data?.runs?.length || 0) > 0 && (
            <Card className="min-w-[210px]">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">Saved research runs</div>
                <div className="text-2xl font-bold">{history.data!.runs.length}</div>
                <div className="text-xs text-muted-foreground">Auditable account history</div>
              </CardContent>
            </Card>
          )}
        </header>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Every sourced fact must survive provenance validation</AlertTitle>
          <AlertDescription>
            The server keeps the web-search tool's actual source set and rejects a research result if a claimed source was not returned by that search. User assumptions remain labelled as assumptions rather than being converted into external facts.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5 xl:grid-cols-2">
          <SectionCard title="1. Business & market scope">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input value={form.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder="Business name" />
            </div>
            <div className="space-y-2">
              <Label>Business summary</Label>
              <Textarea rows={4} value={form.businessSummary} onChange={(event) => update("businessSummary", event.target.value)} placeholder="What the business does and how the product/service works." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Target geography</Label>
                <Input value={form.targetGeography} onChange={(event) => update("targetGeography", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target customers</Label>
                <Input value={form.targetCustomers} onChange={(event) => update("targetCustomers", event.target.value)} placeholder="e.g. UK independent pharmacies" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Problem statement</Label>
              <Textarea rows={3} value={form.problemStatement} onChange={(event) => update("problemStatement", event.target.value)} placeholder="The specific customer/market problem." />
            </div>
            <div className="space-y-2">
              <Label>Proposed solution</Label>
              <Textarea rows={3} value={form.proposedSolution} onChange={(event) => update("proposedSolution", event.target.value)} placeholder="How the solution addresses the problem." />
            </div>
          </SectionCard>

          <SectionCard title="2. Competitors & research questions" description="Known competitors guide the search but do not limit discovery.">
            <div className="space-y-2">
              <Label>Add a known competitor</Label>
              <div className="flex gap-2">
                <Input value={competitorDraft} onChange={(event) => setCompetitorDraft(event.target.value)} placeholder="Competitor name" />
                <Button type="button" variant="outline" onClick={() => {
                  const value = competitorDraft.trim();
                  if (!value) return;
                  update("knownCompetitors", Array.from(new Set([...form.knownCompetitors, value])).slice(0, 20));
                  setCompetitorDraft("");
                }}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.knownCompetitors.map((competitor) => (
                  <Badge key={competitor} variant="secondary" className="gap-1">
                    {competitor}
                    <button type="button" onClick={() => update("knownCompetitors", form.knownCompetitors.filter((item) => item !== competitor))} aria-label={`Remove ${competitor}`}><Trash2 className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Add a research question</Label>
              <div className="flex gap-2">
                <Input value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} placeholder="e.g. How large is the addressable UK market?" />
                <Button type="button" variant="outline" onClick={() => {
                  const value = questionDraft.trim();
                  if (value.length < 10) return;
                  update("researchQuestions", [...form.researchQuestions, value].slice(0, 12));
                  setQuestionDraft("");
                }}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2">
                {form.researchQuestions.map((question, index) => (
                  <div key={`${question}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                    <span>{question}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => update("researchQuestions", form.researchQuestions.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="3. User assumptions" description="Optional. Assumptions are carried into calculations only when explicitly referenced and remain labelled as user assumptions.">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Use this for internal inputs such as an assumed conversion rate or serviceable share.</div>
            <Button variant="outline" onClick={() => update("userAssumptions", [...form.userAssumptions, assumptionRow()].slice(0, 30))}>
              <Plus className="h-4 w-4 mr-2" /> Add assumption
            </Button>
          </div>
          <div className="space-y-3">
            {form.userAssumptions.map((assumption) => (
              <div key={assumption.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-2"><Label>Assumption</Label><Input value={assumption.label} onChange={(event) => update("userAssumptions", form.userAssumptions.map((item) => item.id === assumption.id ? { ...item, label: event.target.value } : item))} placeholder="e.g. Target achievable market share" /></div>
                <div className="space-y-2"><Label>Value</Label><Input value={assumption.value} onChange={(event) => update("userAssumptions", form.userAssumptions.map((item) => item.id === assumption.id ? { ...item, value: event.target.value } : item))} placeholder="e.g. 1% within 3 years" /></div>
                <Button size="icon" variant="ghost" className="self-end" onClick={() => update("userAssumptions", form.userAssumptions.filter((item) => item.id !== assumption.id))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </SectionCard>

        <Card className="border-2 border-primary/20">
          <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">Run live, source-backed research</div>
              <p className="text-sm text-muted-foreground">This may take longer than a normal tool because the server performs live web research and rejects results that fail source-provenance checks.</p>
              {mutation.error && <p className="text-sm text-destructive mt-2">{mutation.error.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setForm(initialForm()); setCompetitorDraft(""); setQuestionDraft(""); setResult(null); runKeyRef.current = null; }} disabled={mutation.isPending}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {mutation.isPending ? "Researching & validating..." : "Research market"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <section id="market-research-results" className="scroll-mt-4 space-y-5">
            <Card>
              <CardHeader className="bg-muted/40">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">Sources validated</Badge>
                      <Badge variant="outline">{result.research.provenance.registeredSourceCount} registered sources</Badge>
                      <Badge variant="outline">{result.research.provenance.sourcedFactCount} sourced facts</Badge>
                    </div>
                    <CardTitle>Market research result</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Run {result.runId.slice(0, 8)} • accessed {new Date(result.research.accessedAt).toLocaleString("en-GB")}</p>
                  </div>
                  <div className="text-sm text-muted-foreground md:text-right">Model: {result.research.providerModel}<br />Validation attempts: {result.research.provenance.validationAttempts}</div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-6">
                <Alert><ShieldCheck className="h-4 w-4" /><AlertTitle>Research provenance</AlertTitle><AlertDescription>{result.research.provenance.verifiedRegisteredSourceCount} of {result.research.provenance.registeredSourceCount} registered sources were found in the web-search tool's actual source set. Sourced facts cannot reference unverified URLs.</AlertDescription></Alert>

                {staleSources.length > 0 && (
                  <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30"><AlertTriangle className="h-4 w-4 text-amber-600" /><AlertTitle>Older sources need review</AlertTitle><AlertDescription>{staleSources.length} source(s) appear more than two years old. Older evidence is not automatically wrong, but check whether newer data exists before using time-sensitive figures.</AlertDescription></Alert>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Research summary</CardTitle></CardHeader><CardContent className="text-sm leading-6 whitespace-pre-wrap">{result.research.researchSummary}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Market definition</CardTitle></CardHeader><CardContent className="text-sm leading-6 whitespace-pre-wrap">{result.research.marketDefinition}</CardContent></Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {(["tam", "sam", "som"] as const).map((key) => {
                    const item = result.research.marketSizing[key];
                    return (
                      <Card key={key}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between"><div className="font-semibold uppercase">{key}</div><Badge variant="outline">{item.status.replaceAll("_", " ")}</Badge></div>
                          <div className="text-2xl font-bold">{formatMarketValue(item)}</div>
                          {item.period && <div className="text-xs text-muted-foreground">Period: {item.period}</div>}
                          <p className="text-xs text-muted-foreground leading-5">{item.methodology}</p>
                          <div className="flex flex-wrap gap-1">{sourceLabels(item.sourceIds, result.research.sourceRegister).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><Badge variant="secondary" className="cursor-pointer">{source.id}</Badge></a>)}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {result.research.competitors.length > 0 && (
                  <Card><CardHeader><CardTitle className="text-base">Competitor intelligence</CardTitle></CardHeader><CardContent className="grid gap-3 lg:grid-cols-2">{result.research.competitors.map((competitor) => (
                    <div key={competitor.name} className="rounded-lg border p-4 space-y-2"><div className="flex items-start justify-between gap-2"><div className="font-semibold">{competitor.name}</div><div className="flex gap-1">{sourceLabels(competitor.sourceIds, result.research.sourceRegister).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><Badge variant="outline">{source.id}</Badge></a>)}</div></div><p className="text-sm text-muted-foreground">{competitor.positioning}</p><div className="grid gap-3 sm:grid-cols-2 text-xs"><div><div className="font-semibold mb-1 text-emerald-700 dark:text-emerald-400">Strengths</div><ul className="list-disc pl-4 space-y-1">{competitor.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><div className="font-semibold mb-1 text-amber-700 dark:text-amber-400">Weaknesses / gaps</div><ul className="list-disc pl-4 space-y-1">{competitor.weaknessesOrGaps.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div>
                  ))}</CardContent></Card>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Market gaps</CardTitle></CardHeader><CardContent className="space-y-3">{result.research.marketGaps.length === 0 ? <p className="text-sm text-muted-foreground">No sufficiently supported market gap was identified.</p> : result.research.marketGaps.map((gap, index) => <div key={`${gap.gap}-${index}`} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-2"><div className="font-medium text-sm">{gap.gap}</div><Badge variant={confidenceVariant(gap.confidence)}>{gap.confidence}</Badge></div><p className="text-xs text-muted-foreground mt-2 leading-5">{gap.evidence}</p><div className="flex gap-1 mt-2">{sourceLabels(gap.sourceIds, result.research.sourceRegister).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><Badge variant="outline">{source.id}</Badge></a>)}</div></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Customer & demand signals</CardTitle></CardHeader><CardContent className="space-y-3">{result.research.customerSignals.length === 0 ? <p className="text-sm text-muted-foreground">No sufficiently supported demand signal was identified.</p> : result.research.customerSignals.map((signal, index) => <div key={`${signal.signal}-${index}`} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-2"><div className="text-sm">{signal.signal}</div><Badge variant={confidenceVariant(signal.confidence)}>{signal.confidence}</Badge></div><div className="flex gap-1 mt-2">{sourceLabels(signal.sourceIds, result.research.sourceRegister).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><Badge variant="outline">{source.id}</Badge></a>)}</div></div>)}</CardContent></Card>
                </div>

                <Card><CardHeader><CardTitle className="text-base">Claim register</CardTitle></CardHeader><CardContent className="space-y-2">{result.research.claims.map((claim) => <div key={claim.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center gap-2 mb-1"><Badge variant={claim.claimType === "sourced_fact" ? "default" : claim.claimType === "inference" ? "secondary" : "outline"}>{claim.claimType.replaceAll("_", " ")}</Badge><Badge variant={confidenceVariant(claim.confidence)}>{claim.confidence}</Badge>{claim.sourceIds.map((id) => { const source = result.research.sourceRegister.find((item) => item.id === id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer"><Badge variant="outline">{id}</Badge></a> : null; })}</div><div className="text-sm leading-6">{claim.claim}</div>{claim.assumptionIds.length > 0 && <div className="text-xs text-muted-foreground mt-1">Assumptions: {claim.assumptionIds.join(", ")}</div>}</div>)}</CardContent></Card>

                <Card><CardHeader><CardTitle className="text-base">Source register</CardTitle></CardHeader><CardContent className="space-y-3">{result.research.sourceRegister.map((source) => (
                  <div key={source.id} className="rounded-lg border p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-sm">{source.id}</span><Badge variant={sourceQualityVariant(source.quality)}>{source.quality}</Badge><Badge variant="outline">{source.freshness.replaceAll("_", " ")}</Badge>{source.verifiedBySearchTool && <Badge className="bg-emerald-600 hover:bg-emerald-600">search-source verified</Badge>}</div><div className="font-medium mt-2">{source.title}</div><div className="text-xs text-muted-foreground mt-1">{source.publisher || new URL(source.url).hostname}{source.publishedDate ? ` • ${source.publishedDate}` : ""}</div><p className="text-xs text-muted-foreground mt-2 leading-5">{source.notes}</p></div><a href={source.url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-2" />Open source</Button></a></div></div>
                ))}</CardContent></Card>

                <div className="grid gap-4 xl:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Risks & unknowns</CardTitle></CardHeader><CardContent><ul className="list-disc pl-5 space-y-2 text-sm">{result.research.risksAndUnknowns.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Recommended next evidence</CardTitle></CardHeader><CardContent><ol className="list-decimal pl-5 space-y-2 text-sm">{result.research.recommendations.map((item) => <li key={item}>{item}</li>)}</ol></CardContent></Card>
                </div>

                <Alert><Globe2 className="h-4 w-4" /><AlertTitle>Research limitation</AlertTitle><AlertDescription>{result.research.disclaimer}</AlertDescription></Alert>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
