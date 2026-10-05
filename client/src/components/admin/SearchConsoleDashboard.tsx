import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  Eye,
  MousePointerClick,
  Search,
  Target,
  Trophy,
  Rocket,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings2,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MetricChange = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SearchConsoleQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  qualified: boolean;
  qualificationReason: string;
  cluster: string;
  intent: string;
  recommendedPath: string;
  page: string;
  path: string;
  pageMatchesRecommendation: boolean;
  contentDecision: "ignore" | "optimise-existing" | "support-existing" | "new-content";
};

type SearchConsoleData = {
  configured: boolean;
  siteUrl: string;
  range: { days: number; startDate: string; endDate: string };
  summary: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    changes: MetricChange;
  };
  daily: Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>;
  queries: SearchConsoleQueryRow[];
  queryQuality?: {
    qualified: number;
    excluded: number;
    top5Qualified: number;
    top10Qualified: number;
    top20Qualified: number;
  };
  pages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  opportunities: SearchConsoleQueryRow[];
  alignmentIssues?: Array<{
    query: string;
    cluster: string;
    currentPath: string;
    recommendedPath: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
    priorityScore: number;
    reason: string;
  }>;
  internalLinkSuggestions?: Array<{
    fromPath: string;
    toPath: string;
    anchorText: string;
    cluster: string;
    query: string;
    reason: string;
  }>;
  top5ActionQueue?: Array<{
    query: string;
    cluster: string;
    path: string;
    recommendedPath: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
    actionType: "landing-page-alignment" | "snippet-ctr" | "internal-links" | "content-depth";
    action: string;
    priorityScore: number;
    approvalRequired: boolean;
  }>;
  fetchedAt: string;
};

function changeLabel(value: number, inverse = false) {
  const positive = inverse ? value > 0 : value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function shortPage(page: string) {
  try {
    const url = new URL(page);
    return url.pathname || "/";
  } catch {
    return page;
  }
}

export default function SearchConsoleDashboard() {
  const [days, setDays] = useState(28);
  const queryClient = useQueryClient();

  const { data: autopilotStatus } = useQuery<any>({
    queryKey: ["/api/seo/automation-status"],
    queryFn: async () => {
      const response = await fetch("/api/seo/automation-status", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load SEO automation status");
      return response.json();
    },
    refetchInterval: 30000,
    retry: false,
  });

  const activateAutopilot = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/seo/autopilot/activate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to activate SEO autopilot");
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo/automation-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo/search-console"] });
    },
  });

  const lifetimeActive =
    autopilotStatus?.active === true &&
    autopilotStatus?.plan?.mode === "top5-lifetime" &&
    autopilotStatus?.plan?.perpetual === true;

  const { data: executionData, refetch: refetchExecution } = useQuery<any>({
    queryKey: ["/api/seo/autopilot/execution"],
    queryFn: async () => {
      const response = await fetch("/api/seo/autopilot/execution", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load SEO execution state");
      return response.json();
    },
    enabled: lifetimeActive,
    refetchInterval: 60000,
    retry: false,
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ actionId, decision }: { actionId: string; decision: "approve" | "reject" }) => {
      const response = await fetch(`/api/seo/autopilot/actions/${encodeURIComponent(actionId)}/decision`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to update SEO action");
      return payload;
    },
    onSuccess: () => {
      refetchExecution();
      queryClient.invalidateQueries({ queryKey: ["/api/seo/automation-status"] });
    },
  });
  const { data, isLoading, error, refetch, isFetching } = useQuery<SearchConsoleData>({
    queryKey: ["/api/admin/seo/search-console", days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/seo/search-console?days=${days}`, {
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok) throw Object.assign(new Error(payload?.message || payload?.error || "Failed to load Search Console data"), { payload });
      return payload;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const configPayload = (error as any)?.payload;

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading Google Search Console rankings…</div>;
  }

  if (error) {
    const notConfigured = configPayload?.configured === false;
    return (
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-base">{notConfigured ? "Connect Google Search Console" : "Search Console connection issue"}</CardTitle>
          <CardDescription>
            {notConfigured
              ? "The dashboard is built and ready. Add the Search Console service-account credentials to Railway to start pulling live Google ranking data."
              : configPayload?.diagnostic || "The app could not fetch live Search Console data. Check the service-account access and configured site URL."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {notConfigured && (
            <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs space-y-1">
              <div>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</div>
              <div>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</div>
              <div>GOOGLE_SEARCH_CONSOLE_SITE_URL=https://innovatorfoundervisaassistant.co.uk/</div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry connection</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const summary = data.summary;

  const qualifiedQueries = data.queries.filter((row) => row.qualified);
  const excludedQueryCount = data.queryQuality?.excluded ?? data.queries.length - qualifiedQueries.length;
  const top5Count = qualifiedQueries.filter((row) => row.position > 0 && row.position <= 5).length;
  const top10Count = qualifiedQueries.filter((row) => row.position > 5 && row.position <= 10).length;
  const top20Count = qualifiedQueries.filter((row) => row.position > 10 && row.position <= 20).length;
  const top50Count = qualifiedQueries.filter((row) => row.position > 20 && row.position <= 50).length;

  const top5Mission = qualifiedQueries
    .filter((row) => row.position > 5 && row.position <= 20 && row.impressions >= 5)
    .sort((a, b) => {
      const positionPriority = a.position - b.position;
      if (Math.abs(positionPriority) >= 2) return positionPriority;
      return b.impressions - a.impressions;
    })
    .slice(0, 15);

  const missionAction = (row: SearchConsoleQueryRow) => {
    const dedicatedIntent = ["business-plan", "endorsement", "eligibility"].includes(
      row.cluster,
    );
    const misaligned =
      dedicatedIntent &&
      Boolean(row.path) &&
      Boolean(row.recommendedPath) &&
      row.path !== row.recommendedPath;

    if (misaligned) {
      return `Strengthen ${row.recommendedPath} and link to it from ${row.path}. Do not reinforce the wrong landing page.`;
    }

    if (row.contentDecision === "optimise-existing") {
      if (row.position <= 8 && row.ctr < 0.03 && row.impressions >= 20) {
        return "Optimise the ranking page: improve snippet CTR, relevance and internal links. Do not create a competing article.";
      }
      return "Optimise the existing ranking page and strengthen internal links. Do not create a competing article.";
    }
    if (row.contentDecision === "support-existing") {
      return "Strengthen the ranking page and add one distinct supporting content item for this intent cluster.";
    }
    if (row.contentDecision === "new-content") {
      return "Create a distinct page only if the intent is not already served by an existing public route.";
    }
    return "Exclude from the Top 5 mission.";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Google Search Performance</h2>
          <p className="text-sm text-muted-foreground">
            Live Search Console data for {data.siteUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[7, 28, 90, 180].map((range) => (
            <Button
              key={range}
              size="sm"
              variant={days === range ? "default" : "outline"}
              onClick={() => setDays(range)}
              className="h-8"
            >
              {range}d
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-8">
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><MousePointerClick className="h-4 w-4" />Clicks</CardDescription>
            <CardTitle className="text-2xl">{summary.clicks.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>{changeLabel(summary.changes.clicks)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Eye className="h-4 w-4" />Impressions</CardDescription>
            <CardTitle className="text-2xl">{summary.impressions.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>{changeLabel(summary.changes.impressions)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Target className="h-4 w-4" />Average position</CardDescription>
            <CardTitle className="text-2xl">{summary.position ? summary.position.toFixed(1) : "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-[11px] ${summary.changes.position >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {summary.changes.position >= 0 ? "↑" : "↓"} {Math.abs(summary.changes.position).toFixed(1)} positions vs previous period
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />CTR</CardDescription>
            <CardTitle className="text-2xl">{formatPercent(summary.ctr)}</CardTitle>
          </CardHeader>
          <CardContent>{changeLabel(summary.changes.ctr)}</CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-5 w-5" />
                Top 5 Mission
              </CardTitle>
              <CardDescription>
                Prioritise live Search Console queries already close enough to move into positions 1–5.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="w-fit">Target: Top 5 qualified queries</Badge>
              <Badge variant="secondary" className="w-fit">{excludedQueryCount} noise queries excluded</Badge>
              {lifetimeActive ? (
                <Badge className="w-fit">Lifetime Autopilot Active</Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => activateAutopilot.mutate()}
                  disabled={activateAutopilot.isPending}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  {activateAutopilot.isPending ? "Activating…" : "Enable Lifetime Autopilot"}
                </Button>
              )}
            </div>
          </div>
          {activateAutopilot.isError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600">
              {activateAutopilot.error instanceof Error ? activateAutopilot.error.message : "Could not activate SEO autopilot."}
            </div>
          )}
          {lifetimeActive && (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Daily ranking monitoring is active. Weekly content support is capped at two items to avoid keyword cannibalisation. The plan does not expire automatically.
              {autopilotStatus?.plan?.lastRunAt ? ` Last refreshed ${new Date(autopilotStatus.plan.lastRunAt).toLocaleString("en-GB")}.` : ""}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-4 w-4" />Top 5</div>
              <div className="mt-1 text-2xl font-semibold">{top5Count}</div>
              <div className="text-[11px] text-muted-foreground">qualified queries already achieved</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Rocket className="h-4 w-4" />Positions 6–10</div>
              <div className="mt-1 text-2xl font-semibold">{top10Count}</div>
              <div className="text-[11px] text-muted-foreground">fastest Top 5 candidates</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Target className="h-4 w-4" />Positions 11–20</div>
              <div className="mt-1 text-2xl font-semibold">{top20Count}</div>
              <div className="text-[11px] text-muted-foreground">page-one opportunities</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4" />Positions 21–50</div>
              <div className="mt-1 text-2xl font-semibold">{top50Count}</div>
              <div className="text-[11px] text-muted-foreground">longer-term growth pool</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Keyword</th>
                  <th>Cluster</th>
                  <th>Ranking page</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>Gap</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>CTR</th>
                  <th>Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {top5Mission.map((row) => (
                  <tr key={row.query} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.query || "(not provided)"}</td>
                    <td><Badge variant="outline">{row.cluster.replace(/-/g, " ")}</Badge></td>
                    <td className="min-w-[150px]">
                      <span className="font-medium">{row.path || row.recommendedPath}</span>
                      {row.path && row.path !== row.recommendedPath && (
                        <div className="text-[10px] text-amber-600">Intent target: {row.recommendedPath}</div>
                      )}
                    </td>
                    <td>{row.position.toFixed(1)}</td>
                    <td>5.0</td>
                    <td>{Math.max(0, row.position - 5).toFixed(1)}</td>
                    <td>{row.impressions.toLocaleString()}</td>
                    <td>{row.clicks.toLocaleString()}</td>
                    <td>{formatPercent(row.ctr)}</td>
                    <td className="min-w-[320px] text-muted-foreground">{missionAction(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {top5Mission.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No qualified Innovator Founder queries between positions 6 and 20 met the current impression threshold in this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-5 w-5" />
                Landing Page Alignment & Top-5 Actions
              </CardTitle>
              <CardDescription>
                Uses the page Google is actually ranking, the intended topic page, CTR and impressions to decide the next SEO action.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{data.alignmentIssues?.length || 0} alignment issues</Badge>
              <Badge variant="outline">{data.internalLinkSuggestions?.length || 0} link actions</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(data.alignmentIssues?.length || 0) > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium">Highest-impact alignment issues</div>
              <div className="grid gap-2 lg:grid-cols-2">
                {(data.alignmentIssues || []).slice(0, 6).map((item) => (
                  <div key={`${item.query}-${item.currentPath}`} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{item.query}</span>
                      <Badge variant="outline">#{item.position.toFixed(1)}</Badge>
                      <Badge variant="secondary">{item.impressions} impressions</Badge>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Google ranks:</span>{" "}
                      <span className="font-medium">{item.currentPath}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="text-muted-foreground">Intent page:</span>{" "}
                      <span className="font-medium text-primary">{item.recommendedPath}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-sm font-medium">Prioritised action queue</div>
            <div className="space-y-2">
              {(data.top5ActionQueue || []).slice(0, 8).map((item, index) => (
                <div key={`${item.query}-${item.actionType}`} className="rounded-lg border p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{index + 1}</Badge>
                        <span className="text-sm font-semibold">{item.query}</span>
                        <Badge variant="outline">{item.actionType.replace(/-/g, " ")}</Badge>
                        {item.approvalRequired && <Badge variant="secondary">approval required</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.action}</p>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                      <div>Position {item.position.toFixed(1)}</div>
                      <div>{item.impressions} impressions · {formatPercent(item.ctr)} CTR</div>
                    </div>
                  </div>
                </div>
              ))}
              {(data.top5ActionQueue?.length || 0) === 0 && (
                <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No qualified Top-5 actions meet the current thresholds in this period.
                </div>
              )}
            </div>
          </div>

          {(data.internalLinkSuggestions?.length || 0) > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium">Internal-link actions</div>
              <div className="grid gap-2 md:grid-cols-2">
                {(data.internalLinkSuggestions || []).slice(0, 8).map((item) => (
                  <div key={`${item.fromPath}-${item.toPath}`} className="rounded-lg border bg-muted/20 p-3 text-xs">
                    <div>
                      <span className="font-medium">{item.fromPath}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium text-primary">{item.toPath}</span>
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      Anchor: “{item.anchorText}”
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {lifetimeActive && (
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5" />
              SEO Autopilot Execution
            </CardTitle>
            <CardDescription>
              Low-risk SEO work runs automatically. Search-snippet and higher-impact changes wait for your approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!executionData?.execution ? (
              <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                Initial site audit is being prepared. The autopilot refreshes shortly after deployment and then daily.
              </div>
            ) : (
              <>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Settings2 className="h-4 w-4" />
                    Automatic actions
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {(executionData.execution.automaticActions || []).map((item: any) => (
                      <div key={item.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">{item.label}</span>
                          <Badge variant="outline">{item.cadence}</Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {item.status === "attention" ? "Needs attention from the technical audit." : "Running automatically."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4" />
                      Daily technical audit
                    </div>
                    {executionData.execution.lastAuditAt && (
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(executionData.execution.lastAuditAt).toLocaleString("en-GB")}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {(executionData.execution.audit || []).map((check: any) => (
                      <div key={check.id} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {check.status === "pass" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : check.status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          {check.label}
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{check.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">Approval queue</div>
                      <p className="text-[11px] text-muted-foreground">
                        Approving a metadata action applies the proposed title and description to the mapped live route. Rejected items are retained for audit history.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {(executionData.execution.approvalQueue || []).filter((item: any) => item.status === "pending").length} pending
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {(executionData.execution.approvalQueue || [])
                      .filter((item: any) => item.status === "pending")
                      .slice(0, 10)
                      .map((item: any) => (
                        <div key={item.id} className="rounded-lg border p-3">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold">{item.keyword}</span>
                                <Badge variant="outline">{item.path}</Badge>
                                <Badge variant="secondary">{item.risk} risk</Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                              {item.proposedTitle && (
                                <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs">
                                  <div><span className="font-medium">Title:</span> {item.proposedTitle}</div>
                                  <div className="mt-1"><span className="font-medium">Description:</span> {item.proposedDescription}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={decisionMutation.isPending}
                                onClick={() => decisionMutation.mutate({ actionId: item.id, decision: "reject" })}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                disabled={decisionMutation.isPending}
                                onClick={() => decisionMutation.mutate({ actionId: item.id, decision: "approve" })}
                              >
                                Approve & Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {(executionData.execution.approvalQueue || []).filter((item: any) => item.status === "pending").length === 0 && (
                      <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                        No higher-impact changes are waiting for approval right now.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Organic search trend</CardTitle>
          <CardDescription>{data.range.startDate} to {data.range.endDate}</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={28} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area yAxisId="right" type="monotone" dataKey="impressions" fillOpacity={0.12} strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="clicks" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="queries">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="queries">Keywords</TabsTrigger>
          <TabsTrigger value="pages">Top pages</TabsTrigger>
          <TabsTrigger value="opportunities">SEO opportunities</TabsTrigger>
          <TabsTrigger value="positions">Position trend</TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top Google queries</CardTitle>
              <CardDescription>
                Queries currently generating visibility for the site. Qualified mission terms are separated from low-signal noise.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Query</th><th>Mission</th><th>Cluster</th><th>Landing page</th><th>Position</th><th>Clicks</th><th>Impressions</th><th>CTR</th></tr></thead>
                <tbody>
                  {data.queries.slice(0, 50).map((row) => (
                    <tr key={row.query} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.query || "(not provided)"}</td>
                      <td>
                        <Badge variant={row.qualified ? "default" : "secondary"}>
                          {row.qualified ? "Qualified" : "Excluded"}
                        </Badge>
                      </td>
                      <td>{row.qualified ? row.cluster.replace(/-/g, " ") : "—"}</td>
                      <td className="min-w-[160px]">{row.path || "—"}</td>
                      <td>{row.position.toFixed(1)}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.impressions.toLocaleString()}</td>
                      <td>{formatPercent(row.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Top pages in Google Search</CardTitle>
              <CardDescription>Landing pages receiving organic impressions and clicks.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Page</th><th>Position</th><th>Clicks</th><th>Impressions</th><th>CTR</th></tr></thead>
                <tbody>
                  {data.pages.slice(0, 50).map((row) => (
                    <tr key={row.page} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <a href={row.page} target="_blank" rel="noreferrer" className="font-medium hover:underline inline-flex items-center gap-1">
                          {shortPage(row.page)} <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td>{row.position.toFixed(1)}</td>
                      <td>{row.clicks.toLocaleString()}</td>
                      <td>{row.impressions.toLocaleString()}</td>
                      <td>{formatPercent(row.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-3">
          <div className="grid gap-3 md:grid-cols-2">
            {data.opportunities.map((row) => (
              <Card key={row.query}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" />{row.query}</CardTitle>
                    <Badge variant="outline">#{row.position.toFixed(1)}</Badge>
                  </div>
                  <CardDescription>{row.impressions.toLocaleString()} impressions · {row.clicks.toLocaleString()} clicks</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {row.position <= 10
                    ? "Already on page one. Improve title/meta CTR, internal links and content depth to push toward the top 3."
                    : "Ranking on page two. This is a high-value optimisation target for stronger internal links, on-page relevance and supporting content."}
                </CardContent>
              </Card>
            ))}
            {data.opportunities.length === 0 && <p className="text-sm text-muted-foreground">No page-one/page-two opportunities met the minimum impression threshold in this period.</p>}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Average Google position</CardTitle>
              <CardDescription>Lower numbers are better. Position 1 is the top organic result.</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={28} />
                  <YAxis reversed tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="position" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-[11px] text-muted-foreground">
        Search Console data can be delayed by Google. Last fetched {new Date(data.fetchedAt).toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
