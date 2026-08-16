import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  ["all", "All revisions"],
  ["failed", "Failed"],
  ["submitted", "Queued"],
  ["in_progress", "In progress"],
  ["ready_for_review", "Ready for customer"],
  ["accepted", "Accepted"],
  ["cancelled", "Discarded"],
] as const;

type RevisionRow = {
  id: string;
  planId: string;
  userId: string;
  revisionNumber: number;
  requestType: string;
  instructions: string;
  selectedSectionIndexes: number[];
  status: string;
  sourceVersionNumber: number;
  targetVersionNumber?: number | null;
  assignedAdminId?: string | null;
  assignedAdminEmail?: string | null;
  lastError?: string | null;
  submittedAt?: string;
  updatedAt?: string;
  businessName: string;
  tier: string;
  userEmail: string;
  userName?: string | null;
  job?: {
    status: string;
    claimCount: number;
    failureCount: number;
    heartbeatAt?: string | null;
    leaseExpiresAt?: string | null;
    lastError?: string | null;
  } | null;
};

type QueuePayload = {
  revisions: RevisionRow[];
  total: number;
  limit: number;
  offset: number;
  counts: Record<string, number>;
};

type RevisionDetail = RevisionRow & {
  sourceVersionId: string;
  targetVersionId?: string | null;
  consistencyReport?: unknown;
  sections: Array<{
    index: number;
    title: string;
    originalContent: string;
    revisedContent?: string | null;
    status: string;
    changeSummary?: string | null;
    updatedAt?: string;
  }>;
  events: Array<{
    actorType: string;
    actorUserId?: string | null;
    actorEmail?: string | null;
    eventType: string;
    payload?: unknown;
    createdAt?: string;
  }>;
};

function statusLabel(status: string) {
  return (
    {
      submitted: "Queued",
      in_progress: "In progress",
      ready_for_review: "Ready for customer",
      accepted: "Accepted",
      cancelled: "Discarded",
      failed: "Failed",
    } as Record<string, string>
  )[status] || status.replace(/_/g, " ");
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "failed") return "destructive";
  if (status === "accepted") return "default";
  if (status === "cancelled") return "outline";
  return "secondary";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function requestTypeLabel(value: string) {
  return (
    {
      factual_correction: "Factual correction",
      updated_information: "Updated information",
      content_improvement: "Content improvement",
      section_regeneration: "Section regeneration",
    } as Record<string, string>
  )[value] || value.replace(/_/g, " ");
}

async function apiError(response: Response) {
  try {
    const body = await response.json();
    return String(body?.error || body?.message || `Request failed (${response.status})`);
  } catch {
    return `Request failed (${response.status})`;
  }
}

export function AdminRevisionQueue() {
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [payload, setPayload] = useState<QueuePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RevisionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const loadQueue = useCallback(
    async (quiet = false) => {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "100", offset: "0" });
        if (status !== "all") params.set("status", status);
        if (search) params.set("search", search);
        const response = await fetch(`/api/admin/business-plan-revisions?${params.toString()}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) throw new Error(await apiError(response));
        setPayload((await response.json()) as QueuePayload);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load revision queue.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status],
  );

  const loadDetail = useCallback(async (revisionId: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/business-plan-revisions/${revisionId}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await apiError(response));
      setDetail((await response.json()) as RevisionDetail);
    } catch (caught) {
      toast({
        title: "Unable to load revision",
        description: caught instanceof Error ? caught.message : "Please try again.",
        variant: "destructive",
      });
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const timer = setInterval(() => void loadQueue(true), 15000);
    return () => clearInterval(timer);
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const activeCount = useMemo(
    () =>
      (payload?.counts.submitted || 0) +
      (payload?.counts.in_progress || 0) +
      (payload?.counts.ready_for_review || 0),
    [payload],
  );

  const performAdminAction = async (revisionId: string, action: "assign-to-me" | "retry") => {
    setActionLoading(action);
    try {
      const response = await fetch(`/api/admin/business-plan-revisions/${revisionId}/${action}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error(await apiError(response));
      await response.json();
      toast({
        title: action === "retry" ? "Revision requeued" : "Revision assigned",
        description:
          action === "retry"
            ? "The durable worker will resume from completed revision checkpoints where possible."
            : "The revision is now assigned to your admin account.",
      });
      await loadQueue(true);
      await loadDetail(revisionId);
    } catch (caught) {
      toast({
        title: action === "retry" ? "Retry failed" : "Assignment failed",
        description: caught instanceof Error ? caught.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    { label: "Active", value: activeCount, icon: Clock3 },
    { label: "Failed", value: payload?.counts.failed || 0, icon: AlertTriangle },
    { label: "Ready for customer", value: payload?.counts.ready_for_review || 0, icon: Eye },
    { label: "Accepted", value: payload?.counts.accepted || 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Business Plan Revision Queue</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational oversight for durable customer revisions. Customers retain final acceptance authority.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadQueue(true)} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSearch(searchInput.trim());
                }}
                placeholder="Search business, customer email, plan ID or revision ID"
                className="pl-9"
              />
            </div>
            <Button onClick={() => setSearch(searchInput.trim())}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3 text-base">
            <span>{payload?.total || 0} revision{payload?.total === 1 ? "" : "s"}</span>
            {refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : !payload?.revisions.length ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No revisions match the current filters.</div>
          ) : (
            <div className="divide-y">
              {payload.revisions.map((revision) => (
                <button
                  key={revision.id}
                  type="button"
                  onClick={() => setSelectedId(revision.id)}
                  className="grid w-full gap-3 p-4 text-left transition-colors hover:bg-muted/40 lg:grid-cols-[minmax(180px,1.3fr)_minmax(180px,1fr)_140px_150px_170px] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{revision.businessName}</p>
                    <p className="truncate text-xs text-muted-foreground">{revision.userEmail}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Revision {revision.revisionNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{requestTypeLabel(revision.requestType)}</p>
                  </div>
                  <Badge variant={statusBadgeVariant(revision.status)} className="w-fit">
                    {statusLabel(revision.status)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    <p>V{revision.sourceVersionNumber}{revision.targetVersionNumber ? ` → V${revision.targetVersionNumber}` : ""}</p>
                    <p>{revision.selectedSectionIndexes.length} section{revision.selectedSectionIndexes.length === 1 ? "" : "s"}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>{formatDate(revision.updatedAt)}</p>
                    <p className="truncate">{revision.assignedAdminEmail || "Unassigned"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedId)} onOpenChange={(value) => !value && setSelectedId(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Revision operational detail</DialogTitle>
            <DialogDescription>
              Audit the request, durable job state, section checkpoints and event history. Acceptance remains customer-controlled.
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="mt-1 truncate font-medium">{detail.userName || detail.userEmail}</p>
                  <p className="truncate text-xs text-muted-foreground">{detail.userEmail}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="mt-1 truncate font-medium">{detail.businessName}</p>
                  <p className="text-xs text-muted-foreground">{detail.tier} • Revision {detail.revisionNumber}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Revision status</p>
                  <Badge variant={statusBadgeVariant(detail.status)} className="mt-2">
                    {statusLabel(detail.status)}
                  </Badge>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Assignment</p>
                  <p className="mt-1 truncate font-medium">{detail.assignedAdminEmail || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">Updated {formatDate(detail.updatedAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold">Customer instructions</p>
                <p className="mt-1 text-xs text-muted-foreground">{requestTypeLabel(detail.requestType)}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{detail.instructions}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">Durable worker</p>
                  {detail.job ? (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>Status: <span className="font-medium text-foreground">{detail.job.status}</span></p>
                      <p>Claims: {detail.job.claimCount} • Failures: {detail.job.failureCount}</p>
                      <p>Heartbeat: {formatDate(detail.job.heartbeatAt)}</p>
                      <p>Lease expiry: {formatDate(detail.job.leaseExpiresAt)}</p>
                      {(detail.job.lastError || detail.lastError) && (
                        <p className="mt-2 whitespace-pre-wrap text-red-600 dark:text-red-400">
                          {detail.job.lastError || detail.lastError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">No job record.</p>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold">Version control</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Source: Version {detail.sourceVersionNumber}</p>
                    <p>Candidate: {detail.targetVersionNumber ? `Version ${detail.targetVersionNumber}` : "Not created yet"}</p>
                    <p>Selected sections: {detail.selectedSectionIndexes.map((index) => index + 1).join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => performAdminAction(detail.id, "assign-to-me")}
                  disabled={Boolean(actionLoading)}
                >
                  {actionLoading === "assign-to-me" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  Assign to me
                </Button>
                {detail.status === "failed" && (
                  <Button
                    onClick={() => performAdminAction(detail.id, "retry")}
                    disabled={Boolean(actionLoading)}
                  >
                    {actionLoading === "retry" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                    Retry failed revision
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(`/api/view/html/${detail.planId}`, "_blank", "noopener,noreferrer")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Current accepted plan
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Revision checkpoints</p>
                {detail.sections.map((section) => (
                  <details key={section.index} className="rounded-lg border">
                    <summary className="cursor-pointer list-none px-4 py-3">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-medium">{section.title}</span>
                        <Badge variant={section.status === "completed" ? "default" : section.status === "failed" ? "destructive" : "secondary"}>
                          {section.status}
                        </Badge>
                      </span>
                    </summary>
                    <div className="grid gap-3 border-t p-4 lg:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Original</p>
                        <div className="max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-6">{section.originalContent}</div>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-900 dark:bg-emerald-950/10">
                        <p className="mb-2 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">Revised checkpoint</p>
                        <div className="max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-6">
                          {section.revisedContent || "Not generated yet."}
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Audit timeline</p>
                <div className="space-y-2">
                  {detail.events.map((event, index) => (
                    <div key={`${event.eventType}-${index}`} className="flex gap-3 rounded-lg border p-3 text-sm">
                      <FileClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium">{event.eventType.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.actorEmail || event.actorType} • {formatDate(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/20">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium">Customer-controlled acceptance</p>
                    <p className="mt-1 text-muted-foreground">
                      Admins can inspect, assign and retry failed processing. The candidate only becomes the live business plan when the customer accepts it from their Revision Centre.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminRevisionQueue;
