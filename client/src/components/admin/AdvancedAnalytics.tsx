import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, Clock, Globe, 
  Monitor, RefreshCw, Server, Users, Zap, Filter, TrendingUp,
  Eye, FileCheck, Shield, CreditCard, CheckCircle, XCircle, Database
} from "lucide-react";
import { format, formatDistance } from "date-fns";

interface RealtimeMonitorProps {
  isActive: boolean;
}

interface RealtimeData {
  activeUsers: any[];
  recentViews: any[];
  activePages: any[];
  activeByCountry: any[];
  activeCount: number;
  timestamp: string;
}

interface HeatmapData {
  heatmapData: any[];
  peakHours: any[];
  dailyActivity: any[];
  hourlyAggregates: any[];
  period: { days: number; since: string };
}

interface JourneyData {
  pageFlows: any[];
  entryPoints: any[];
  exitPoints: any[];
  popularPaths: any[];
  period: { days: number; since: string };
}

interface FunnelData {
  signupToPurchase: any;
  funnelTiming: any;
  dropOffByDevice: any[];
  dailyConversions: any[];
  period: { days: number; since: string };
}

interface ApiPerformanceData {
  latencyByRoute: any[];
  latencyOverTime: any[];
  slowestEndpoints: any[];
  errorBreakdown: any[];
  period: { hours: number; since: string };
}

interface ExportData {
  exportsByType: any[];
  chartSuccess: any[];
  failures: any[];
  period: { days: number; since: string };
}

interface AuditData {
  logs: any[];
  total: number;
  limit: number;
  offset: number;
}

interface CoinsData {
  usageSummary: any[];
  topConsumers: any[];
  dailyTrend: any[];
  period: { days: number; since: string };
}

export function RealtimeMonitor({ isActive }: RealtimeMonitorProps) {
  const { data: realtimeData, isLoading, refetch } = useQuery<RealtimeData>({
    queryKey: ["/api/admin/analytics/realtime"],
    enabled: isActive,
    refetchInterval: isActive ? 10000 : false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const activeUsers = realtimeData?.activeUsers || [];
  const recentViews = realtimeData?.recentViews || [];
  const activePages = realtimeData?.activePages || [];
  const activeByCountry = realtimeData?.activeByCountry || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-6 w-6 text-green-500" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Real-Time Monitor</h2>
            <p className="text-sm text-muted-foreground">
              Live activity as it happens - updates every 10 seconds
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-realtime">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Right Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-green-500">{realtimeData?.activeCount || 0}</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Users active in last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{recentViews.length}</span>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 30 seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Active Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {activePages[0]?.current_page || "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activePages[0]?.active_users || 0} users viewing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Countries Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{activeByCountry.length}</span>
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Top: {activeByCountry[0]?.country || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Page</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Session Duration</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No active users right now
                    </TableCell>
                  </TableRow>
                ) : (
                  activeUsers.map((user: any) => (
                    <TableRow key={user.session_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                          {user.email || "Anonymous"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-40 truncate">{user.current_page || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Monitor className="h-3 w-3 mr-1" />
                          {user.device_type || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.city && user.country 
                          ? `${user.city}, ${user.country}`
                          : user.country || "—"
                        }
                      </TableCell>
                      <TableCell>
                        {user.session_duration_sec 
                          ? `${Math.round(user.session_duration_sec / 60)}m` 
                          : "—"
                        }
                      </TableCell>
                      <TableCell>
                        {user.last_seen_at 
                          ? formatDistance(new Date(user.last_seen_at), new Date(), { addSuffix: true })
                          : "—"
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Active Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active pages</p>
              ) : (
                activePages.map((page: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-60">{page.current_page}</span>
                    <Badge>{page.active_users} users</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Users by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeByCountry.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No geographic data</p>
              ) : (
                activeByCountry.map((country: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{country.country}</span>
                    <Badge variant="secondary">{country.active_users} active</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface HeatmapViewProps {
  isActive: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapView({ isActive }: HeatmapViewProps) {
  const [days, setDays] = useState("7");
  
  const { data, isLoading } = useQuery<HeatmapData>({
    queryKey: ["/api/admin/analytics/heatmap", days],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const heatmapData = data?.heatmapData || [];
  const peakHours = data?.peakHours || [];
  const dailyActivity = data?.dailyActivity || [];

  const maxValue = Math.max(...heatmapData.map((d: any) => parseInt(d.page_views) || 0), 1);

  const getHeatmapValue = (day: number, hour: number) => {
    const match = heatmapData.find((d: any) => 
      parseInt(d.day_of_week) === day && parseInt(d.hour_of_day) === hour
    );
    return match ? parseInt(match.page_views) : 0;
  };

  const getHeatColor = (value: number) => {
    if (value === 0) return "bg-muted";
    const intensity = value / maxValue;
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Behavior Heatmaps</h2>
          <p className="text-sm text-muted-foreground">
            Visualize when users are most active on your platform
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32" data-testid="select-heatmap-days">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity by Day & Hour</CardTitle>
          <CardDescription>Page views distributed across the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex mb-2">
                <div className="w-16" />
                {HOURS.map(hour => (
                  <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                    {hour}
                  </div>
                ))}
              </div>
              {DAYS.map((day, dayIdx) => (
                <div key={day} className="flex mb-1">
                  <div className="w-16 text-sm font-medium flex items-center">{day}</div>
                  {HOURS.map(hour => {
                    const value = getHeatmapValue(dayIdx, hour);
                    return (
                      <TooltipProvider key={`${day}-${hour}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`flex-1 h-6 mx-0.5 rounded ${getHeatColor(value)} cursor-pointer hover:ring-2 ring-primary transition-all`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{day} at {hour}:00</p>
                            <p className="font-bold">{value} page views</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900" />
              <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700" />
              <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-500" />
              <div className="w-4 h-4 rounded bg-green-800 dark:bg-green-300" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>When your users are most active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakHours.map((peak: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <Badge variant={idx === 0 ? "default" : "secondary"}>
                    {peak.hour}:00
                  </Badge>
                  <div className="flex-1">
                    <Progress value={(peak.activity_count / peakHours[0]?.activity_count) * 100} />
                  </div>
                  <span className="text-sm font-medium">{peak.activity_count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => format(new Date(val), "MMM d")}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Area 
                  type="monotone" 
                  dataKey="page_views" 
                  name="Page Views"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="unique_users" 
                  name="Unique Users"
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2) / 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface UserJourneyViewProps {
  isActive: boolean;
}

export function UserJourneyView({ isActive }: UserJourneyViewProps) {
  const [days, setDays] = useState("7");
  
  const { data, isLoading } = useQuery<JourneyData>({
    queryKey: ["/api/admin/analytics/user-journeys", days],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const pageFlows = data?.pageFlows || [];
  const entryPoints = data?.entryPoints || [];
  const exitPoints = data?.exitPoints || [];
  const popularPaths = data?.popularPaths || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Journey Flow</h2>
          <p className="text-sm text-muted-foreground">
            Understand how users navigate through your platform
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32" data-testid="select-journey-days">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-500" />
              Entry Points
            </CardTitle>
            <CardDescription>Where users start their journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entryPoints.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No entry data</p>
              ) : (
                entryPoints.slice(0, 10).map((entry: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-40">{entry.page}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{entry.sessions} sessions</Badge>
                      <Badge variant="outline">{entry.unique_users} users</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              Exit Points
            </CardTitle>
            <CardDescription>Where users leave your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exitPoints.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No exit data</p>
              ) : (
                exitPoints.slice(0, 10).map((exit: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-40">{exit.page}</span>
                    <Badge variant="destructive">{exit.sessions} exits</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Flow Transitions</CardTitle>
          <CardDescription>Most common page-to-page navigations</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From Page</TableHead>
                  <TableHead className="text-center">Direction</TableHead>
                  <TableHead>To Page</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageFlows.slice(0, 20).map((flow: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="max-w-40 truncate">{flow.source}</TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto" />
                    </TableCell>
                    <TableCell className="max-w-40 truncate">{flow.target}</TableCell>
                    <TableCell className="text-right font-medium">{flow.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular User Paths</CardTitle>
          <CardDescription>Complete journeys users commonly take</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularPaths.slice(0, 10).map((path: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge>#{idx + 1}</Badge>
                  <span className="text-sm font-medium">{path.occurrences} users</span>
                </div>
                <p className="text-sm text-muted-foreground break-all">{path.path}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ConversionFunnelViewProps {
  isActive: boolean;
}

export function ConversionFunnelView({ isActive }: ConversionFunnelViewProps) {
  const [days, setDays] = useState("30");
  
  const { data, isLoading } = useQuery<FunnelData>({
    queryKey: ["/api/admin/analytics/conversion-funnel", days],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const funnel = data?.signupToPurchase || {};
  const timing = data?.funnelTiming || {};
  const dailyConversions = data?.dailyConversions || [];
  const dropOffByDevice = data?.dropOffByDevice || [];

  const funnelSteps = [
    { name: "Signups", value: parseInt(funnel.total_signups) || 0, rate: 100 },
    { name: "Created Plan", value: parseInt(funnel.created_plan) || 0, rate: parseFloat(funnel.plan_rate) || 0 },
    { name: "Completed Plan", value: parseInt(funnel.completed_plan) || 0, rate: parseFloat(funnel.completion_rate) || 0 },
    { name: "Made Purchase", value: parseInt(funnel.made_purchase) || 0, rate: parseFloat(funnel.purchase_rate) || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversion Funnel Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Track user progression from signup to purchase
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32" data-testid="select-funnel-days">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signup to Purchase Funnel</CardTitle>
          <CardDescription>Conversion rates through each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelSteps.map((step, idx) => (
              <div key={step.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{step.value}</span>
                    {idx > 0 && (
                      <Badge variant={step.rate > 50 ? "default" : step.rate > 20 ? "secondary" : "destructive"}>
                        {step.rate.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={idx === 0 ? 100 : (step.value / funnelSteps[0].value) * 100} 
                  className="h-3"
                />
                {idx < funnelSteps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time to Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Avg. Time to First Plan</p>
                <p className="text-2xl font-bold">
                  {timing.avg_hours_to_plan 
                    ? `${Math.round(parseFloat(timing.avg_hours_to_plan))} hours` 
                    : "—"
                  }
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Avg. Time to Purchase</p>
                <p className="text-2xl font-bold">
                  {timing.avg_hours_to_purchase 
                    ? `${Math.round(parseFloat(timing.avg_hours_to_purchase))} hours` 
                    : "—"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Conversions</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyConversions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => format(new Date(val), "MMM d")}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" />
                <Bar dataKey="paid_users" name="Paid Users" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ApiPerformanceViewProps {
  isActive: boolean;
}

export function ApiPerformanceView({ isActive }: ApiPerformanceViewProps) {
  const [hours, setHours] = useState("24");
  
  const { data, isLoading, refetch } = useQuery<ApiPerformanceData>({
    queryKey: ["/api/admin/analytics/api-performance", hours],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const latencyByRoute = data?.latencyByRoute || [];
  const latencyOverTime = data?.latencyOverTime || [];
  const slowestEndpoints = data?.slowestEndpoints || [];
  const errorBreakdown = data?.errorBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Performance Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Track API latency, errors, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className="w-32" data-testid="select-api-hours">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last hour</SelectItem>
              <SelectItem value="6">Last 6 hours</SelectItem>
              <SelectItem value="24">Last 24 hours</SelectItem>
              <SelectItem value="72">Last 3 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-api">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latency Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => format(new Date(val), "HH:mm")}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip 
                labelFormatter={(val) => format(new Date(val), "MMM d, HH:mm")}
              />
              <Line 
                type="monotone" 
                dataKey="avg_latency" 
                name="Avg Latency (ms)"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="errors" 
                name="Errors"
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
          <CardDescription>Latency statistics by API route</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Avg (ms)</TableHead>
                  <TableHead className="text-right">P95 (ms)</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latencyByRoute.map((route: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="max-w-60 truncate font-mono text-xs">
                      {route.route}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {route.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{route.request_count}</TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(route.avg_latency) > 500 ? "text-yellow-500" : ""}>
                        {route.avg_latency}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(route.p95) > 1000 ? "text-red-500" : ""}>
                        {route.p95 || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {parseInt(route.errors) > 0 ? (
                        <Badge variant="destructive">{route.errors}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Slowest Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {slowestEndpoints.slice(0, 10).map((req: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-muted/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono truncate max-w-40">{req.route}</span>
                      <Badge variant={req.status_code >= 500 ? "destructive" : "secondary"}>
                        {req.duration_ms}ms
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {format(new Date(req.timestamp), "MMM d, HH:mm:ss")}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Error Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {errorBreakdown.map((err: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-muted/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono truncate max-w-40">{err.route}</span>
                      <Badge variant="destructive">{err.status_code}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-muted-foreground">{err.error_type || "Unknown"}</span>
                      <span className="font-medium">{err.count} occurrences</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ExportAnalyticsViewProps {
  isActive: boolean;
}

export function ExportAnalyticsView({ isActive }: ExportAnalyticsViewProps) {
  const { data, isLoading } = useQuery<ExportData>({
    queryKey: ["/api/admin/analytics/export-performance"],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const exportsByType = data?.exportsByType || [];
  const chartSuccess = data?.chartSuccess || [];
  const failures = data?.failures || [];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track PDF and Word export success rates and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Export Success by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportsByType.map((exp: any, idx: number) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{exp.export_type}</span>
                    <Badge variant={parseFloat(exp.success_rate) > 90 ? "default" : "destructive"}>
                      {exp.success_rate}% success
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50 text-center">
                      <p className="text-lg font-bold">{exp.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-2 rounded bg-green-500/10 text-center">
                      <p className="text-lg font-bold text-green-500">{exp.successful}</p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div className="p-2 rounded bg-red-500/10 text-center">
                      <p className="text-lg font-bold text-red-500">{exp.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart Embedding Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartSuccess.map((chart: any, idx: number) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{chart.export_type}</span>
                    <span className="text-sm text-muted-foreground">
                      {chart.total_embedded}/{chart.total_expected} charts
                    </span>
                  </div>
                  <Progress value={parseFloat(chart.embed_rate) || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {chart.embed_rate}% embedded
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Export Failures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export Type</TableHead>
                <TableHead>Failure Stage</TableHead>
                <TableHead>Error Code</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failures.map((fail: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{fail.export_type}</TableCell>
                  <TableCell>{fail.failure_stage || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{fail.error_code || "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{fail.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuditLogViewProps {
  isActive: boolean;
}

export function AuditLogView({ isActive }: AuditLogViewProps) {
  const [page, setPage] = useState(0);
  const limit = 50;
  
  const { data, isLoading, refetch } = useQuery<AuditData>({
    queryKey: ["/api/admin/analytics/audit-log", page * limit, limit],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Complete record of administrative actions for compliance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-audit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell>{log.admin_email || "System"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="max-w-40 truncate">
                        {log.target_type}: {log.target_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.ip_address || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            data-testid="button-audit-prev"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage(p => p + 1)}
            data-testid="button-audit-next"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CoinsUsageViewProps {
  isActive: boolean;
}

export function CoinsUsageView({ isActive }: CoinsUsageViewProps) {
  const [days, setDays] = useState("30");
  
  const { data, isLoading } = useQuery<CoinsData>({
    queryKey: ["/api/admin/analytics/coins-usage", days],
    enabled: isActive,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const usageSummary = data?.usageSummary || [];
  const topConsumers = data?.topConsumers || [];
  const dailyTrend = data?.dailyTrend || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Credits Usage Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track how users spend and earn credits across the platform
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32" data-testid="select-coins-days">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usageSummary.map((summary: any, idx: number) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                {summary.change_type === "add" ? "Credits Added" : 
                 summary.change_type === "deduct" ? "Credits Spent" : summary.change_type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary.change_type === "add" ? "+" : "-"}{summary.total_amount}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary.transaction_count} transactions by {summary.unique_users} users
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Credit Flow</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => format(new Date(val), "MMM d")}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="added" 
                name="Credits Added"
                stroke="hsl(var(--chart-2))" 
                fill="hsl(var(--chart-2) / 0.2)" 
              />
              <Area 
                type="monotone" 
                dataKey="spent" 
                name="Credits Spent"
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Credit Consumers</CardTitle>
          <CardDescription>Users who have spent the most credits</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Credits Spent</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topConsumers.map((consumer: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant={idx < 3 ? "default" : "secondary"}>
                      #{idx + 1}
                    </Badge>
                  </TableCell>
                  <TableCell>{consumer.email || "Unknown"}</TableCell>
                  <TableCell className="text-right font-bold">{consumer.total_spent}</TableCell>
                  <TableCell className="text-right">{consumer.transactions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
