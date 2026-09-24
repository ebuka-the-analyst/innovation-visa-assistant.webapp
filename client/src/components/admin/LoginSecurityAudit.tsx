import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type RiskLevel = "normal" | "review" | "elevated";

type AuditUser = {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  createdAt: string | null;
  lastActivityAt: string | null;
  sessionCount24h: number;
  sessionCount7d: number;
  distinctDevices7d: number;
  distinctCountries7d: number;
  failedLogins24h: number;
  failedLogins7d: number;
  successfulLogins24h: number;
  lastFailedLogin: string | null;
  lastSession: {
    startedAt: string | null;
    lastSeenAt: string | null;
    isActive: boolean;
    deviceType: string | null;
    browserName: string | null;
    osName: string | null;
    country: string | null;
  };
  risk: {
    level: RiskLevel;
    reasons: string[];
  };
};

type AuditSummary = {
  generatedAt: string;
  stats: {
    failedLogins24h: number;
    uniqueFailedSources24h: number;
    targetedAccounts24h: number;
    successfulLogins24h: number;
    accountsToReview: number;
  };
  distributedFailurePattern: boolean;
  users: AuditUser[];
  failedTargets: Array<{
    email: string;
    attempts: number;
    uniqueSources: number;
    firstAttemptAt: string | null;
    lastAttemptAt: string | null;
  }>;
};

type AuditDetail = {
  user: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
    isAdmin: boolean;
    createdAt: string | null;
    lastActivityAt: string | null;
  };
  failedSourceCount24h: number;
  sessions: Array<{
    startedAt: string | null;
    lastSeenAt: string | null;
    endedAt: string | null;
    isActive: boolean;
    deviceType: string | null;
    browserName: string | null;
    osName: string | null;
    country: string | null;
    countryCode: string | null;
    currentPage: string | null;
    pageViewCount: number;
    totalDurationSeconds: number;
    deviceChangedFromPrevious: boolean;
    countryChangedFromPrevious: boolean;
  }>;
  securityEvents: Array<{
    eventType: string;
    severity: string;
    description: string;
    isResolved: boolean;
    createdAt: string | null;
  }>;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Could not load security audit data");
  }
  return response.json();
}

function riskBadge(level: RiskLevel) {
  if (level === "elevated") return <Badge variant="destructive">Elevated</Badge>;
  if (level === "review") return <Badge variant="secondary">Review</Badge>;
  return <Badge variant="outline" className="text-green-600 border-green-500/30">Normal</Badge>;
}

function relativeTime(value: string | null) {
  if (!value) return "No record";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

function dateTime(value: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  } catch {
    return "—";
  }
}

export function LoginSecurityAudit() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const summaryQuery = useQuery<AuditSummary>({
    queryKey: ["/api/admin/security/login-audit", search],
    queryFn: () =>
      getJson<AuditSummary>(
        `/api/admin/security/login-audit?limit=150&search=${encodeURIComponent(search.trim())}`,
      ),
    refetchInterval: 30000,
  });

  const detailQuery = useQuery<AuditDetail>({
    queryKey: ["/api/admin/security/login-audit", selectedUserId],
    queryFn: () => getJson<AuditDetail>(`/api/admin/security/login-audit/${selectedUserId}`),
    enabled: Boolean(selectedUserId),
  });

  const forceLogout = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/force-logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Could not terminate sessions");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sessions terminated",
        description: `${data.sessionsTerminated ?? 0} stored session(s) were invalidated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/login-audit"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Force logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedSummary = useMemo(
    () => summaryQuery.data?.users.find((user) => user.id === selectedUserId) || null,
    [summaryQuery.data?.users, selectedUserId],
  );

  const data = summaryQuery.data;
  const loading = summaryQuery.isLoading;

  return (
    <div className="space-y-3" data-testid="login-security-audit">
      <Card className={data?.distributedFailurePattern ? "border-amber-500/40 bg-amber-500/5" : ""}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border p-2">
                {data?.distributedFailurePattern ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {data?.distributedFailurePattern
                    ? "Distributed failed-login activity detected"
                    : "Login security monitoring"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Review failed attempts, recent authenticated sessions, device changes and country changes.
                  Raw network identifiers and session secrets are deliberately excluded.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => summaryQuery.refetch()}
              disabled={summaryQuery.isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${summaryQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Failed attempts · 24h",
            value: data?.stats.failedLogins24h ?? 0,
            icon: XCircle,
          },
          {
            label: "Unique sources · 24h",
            value: data?.stats.uniqueFailedSources24h ?? 0,
            icon: Globe,
          },
          {
            label: "Targeted accounts · 24h",
            value: data?.stats.targetedAccounts24h ?? 0,
            icon: Users,
          },
          {
            label: "Successful sign-ins · 24h",
            value: data?.stats.successfulLogins24h ?? 0,
            icon: CheckCircle2,
          },
          {
            label: "Accounts to review",
            value: data?.stats.accountsToReview ?? 0,
            icon: AlertTriangle,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xl font-bold">{loading ? "—" : stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.failedTargets?.length ? (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Failed-login targets in the last 24 hours</CardTitle>
            <CardDescription>
              Source addresses are counted for correlation but are not returned to this screen.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {data.failedTargets.slice(0, 9).map((target) => (
                <div key={target.email} className="rounded-lg border p-3">
                  <p className="truncate text-xs font-semibold">{target.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant={target.attempts >= 5 ? "destructive" : "secondary"}>
                      {target.attempts} failed
                    </Badge>
                    <Badge variant="outline">{target.uniqueSources} source(s)</Badge>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Last attempt {relativeTime(target.lastAttemptAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-sm">Account login audit</CardTitle>
              <CardDescription>
                Successful sign-in auditing starts from the security hardening deployment onward.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Failed · 24h</TableHead>
                  <TableHead>Sessions · 24h</TableHead>
                  <TableHead>Devices · 7d</TableHead>
                  <TableHead>Countries · 7d</TableHead>
                  <TableHead>Last session</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      Loading login audit…
                    </TableCell>
                  </TableRow>
                ) : data?.users.length ? (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="min-w-44">
                          <p className="text-xs font-semibold">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {riskBadge(user.risk.level)}
                          <div>
                            <Badge variant="outline" className="text-[9px]">
                              {user.isEmailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={user.failedLogins24h ? "font-semibold text-amber-600" : ""}>
                        {user.failedLogins24h}
                      </TableCell>
                      <TableCell>{user.sessionCount24h}</TableCell>
                      <TableCell>{user.distinctDevices7d}</TableCell>
                      <TableCell>{user.distinctCountries7d}</TableCell>
                      <TableCell>
                        <div className="min-w-40">
                          <p className="text-[11px]">{relativeTime(user.lastSession.startedAt)}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {[user.lastSession.browserName, user.lastSession.deviceType, user.lastSession.country]
                              .filter(Boolean)
                              .join(" · ") || "No session details"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUserId(user.id)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No matching accounts.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Login & Security Review</DialogTitle>
            <DialogDescription>
              {selectedSummary?.email || detailQuery.data?.user.email || "Account security history"}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading account history…</div>
          ) : detailQuery.data ? (
            <ScrollArea className="max-h-[72vh] pr-4">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground">Failed sources · 24h</p>
                      <p className="text-lg font-bold">{detailQuery.data.failedSourceCount24h}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground">Recorded sessions</p>
                      <p className="text-lg font-bold">{detailQuery.data.sessions.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground">Security events</p>
                      <p className="text-lg font-bold">{detailQuery.data.securityEvents.length}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedSummary?.risk.reasons?.length ? (
                  <Card className="border-amber-500/30">
                    <CardContent className="p-3">
                      <p className="mb-2 text-xs font-semibold">Why this account was flagged</p>
                      <div className="space-y-1">
                        {selectedSummary.risk.reasons.map((reason) => (
                          <div key={reason} className="flex items-start gap-2 text-[11px]">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs">Recent authenticated sessions</CardTitle>
                    <CardDescription>Country-level location only. No raw network identifiers are displayed.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    {detailQuery.data.sessions.length ? (
                      <div className="space-y-2">
                        {detailQuery.data.sessions.map((session, index) => (
                          <div key={`${session.startedAt}-${index}`} className="rounded-lg border p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-2">
                                <Smartphone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-medium">
                                    {[session.browserName, session.osName, session.deviceType]
                                      .filter(Boolean)
                                      .join(" · ") || "Unknown device"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {session.country || "Country unavailable"} · {dateTime(session.startedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {session.isActive && <Badge variant="secondary">Active</Badge>}
                                {session.deviceChangedFromPrevious && <Badge variant="outline">Device change</Badge>}
                                {session.countryChangedFromPrevious && <Badge variant="outline">Country change</Badge>}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                              <span><Activity className="mr-1 inline h-3 w-3" />{session.pageViewCount} page views</span>
                              <span><Clock className="mr-1 inline h-3 w-3" />Last seen {relativeTime(session.lastSeenAt)}</span>
                              {session.currentPage ? <span>Page: {session.currentPage}</span> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-xs text-muted-foreground">No authenticated sessions recorded.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs">Authentication security events</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {detailQuery.data.securityEvents.length ? (
                      <div className="space-y-2">
                        {detailQuery.data.securityEvents.map((event, index) => (
                          <div key={`${event.createdAt}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                            <div>
                              <p className="text-xs font-medium">{event.description}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {event.eventType.replace(/_/g, " ")} · {dateTime(event.createdAt)}
                              </p>
                            </div>
                            <Badge variant={event.severity === "high" || event.severity === "critical" ? "destructive" : "outline"}>
                              {event.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-xs text-muted-foreground">No authentication security events recorded.</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold">Terminate this account's active login sessions</p>
                    <p className="text-[10px] text-muted-foreground">
                      Use this when activity is not recognised. It does not delete or ban the account.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!selectedUserId || forceLogout.isPending}
                    onClick={() => selectedUserId && forceLogout.mutate(selectedUserId)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {forceLogout.isPending ? "Terminating…" : "Force logout"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Account history could not be loaded.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
