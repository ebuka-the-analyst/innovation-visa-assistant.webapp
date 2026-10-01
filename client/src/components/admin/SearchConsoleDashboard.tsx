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
  queries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
  pages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
  opportunities: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
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

  const top5Count = data.queries.filter((row) => row.position > 0 && row.position <= 5).length;
  const top10Count = data.queries.filter((row) => row.position > 5 && row.position <= 10).length;
  const top20Count = data.queries.filter((row) => row.position > 10 && row.position <= 20).length;
  const top50Count = data.queries.filter((row) => row.position > 20 && row.position <= 50).length;

  const top5Mission = data.queries
    .filter((row) => row.position > 5 && row.position <= 20 && row.impressions >= 5)
    .sort((a, b) => {
      const positionPriority = a.position - b.position;
      if (Math.abs(positionPriority) >= 2) return positionPriority;
      return b.impressions - a.impressions;
    })
    .slice(0, 15);

  const missionAction = (position: number, ctr: number, impressions: number) => {
    if (position <= 8) {
      if (ctr < 0.03 && impressions >= 20) return "Improve title/meta CTR + strengthen internal links";
      return "Strengthen on-page relevance + internal links";
    }
    if (position <= 12) return "Expand page depth + add supporting content";
    return "Build dedicated supporting content + authority links";
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
              <Badge variant="outline" className="w-fit">Target: Top 5</Badge>
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
              <div className="text-[11px] text-muted-foreground">queries already achieved</div>
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
                    <td>{row.position.toFixed(1)}</td>
                    <td>5.0</td>
                    <td>{Math.max(0, row.position - 5).toFixed(1)}</td>
                    <td>{row.impressions.toLocaleString()}</td>
                    <td>{row.clicks.toLocaleString()}</td>
                    <td>{formatPercent(row.ctr)}</td>
                    <td className="min-w-[260px] text-muted-foreground">{missionAction(row.position, row.ctr, row.impressions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {top5Mission.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No queries between positions 6 and 20 met the current impression threshold in this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <CardDescription>Queries currently generating visibility for the site.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Query</th><th>Position</th><th>Clicks</th><th>Impressions</th><th>CTR</th></tr></thead>
                <tbody>
                  {data.queries.slice(0, 50).map((row) => (
                    <tr key={row.query} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.query || "(not provided)"}</td>
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
