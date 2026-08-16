import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ACTIVE_STATUSES = new Set(["submitted", "in_progress", "ready_for_review"]);

const REQUEST_TYPES = [
  {
    value: "factual_correction",
    label: "Factual correction",
    description: "Correct an inaccurate fact, figure, date or statement.",
  },
  {
    value: "updated_information",
    label: "Updated information",
    description: "Add new evidence, traction, funding, hiring or market information.",
  },
  {
    value: "content_improvement",
    label: "Content improvement",
    description: "Strengthen clarity, reasoning, evidence framing or professional wording.",
  },
  {
    value: "section_regeneration",
    label: "Regenerate selected section",
    description: "Rebuild selected sections from the saved business-plan facts and your instructions.",
  },
] as const;

type RevisionSectionSummary = {
  index: number;
  title: string;
};

type RevisionSummary = {
  id: string;
  revisionNumber: number;
  requestType: string;
  instructions: string;
  selectedSectionIndexes: number[];
  status: string;
  sourceVersionId: string;
  targetVersionId?: string | null;
  consistencyReport?: unknown;
  lastError?: string | null;
  submittedAt?: string;
  completedAt?: string | null;
  acceptedAt?: string | null;
  cancelledAt?: string | null;
  updatedAt?: string;
};

type VersionSummary = {
  id: string;
  versionNumber: number;
  status: string;
  createdAt?: string;
  acceptedAt?: string | null;
  contentSha256?: string;
};

type RevisionContext = {
  plan: { id: string; businessName: string; tier: string };
  acceptedVersion: { id: string; versionNumber: number };
  sections: RevisionSectionSummary[];
  revisions: RevisionSummary[];
  versions: VersionSummary[];
};

type RevisionDetail = {
  id: string;
  revisionNumber: number;
  status: string;
  requestType: string;
  instructions: string;
  selectedSectionIndexes: number[];
  sourceVersionNumber: number;
  targetVersionNumber?: number | null;
  consistencyReport?: unknown;
  lastError?: string | null;
  submittedAt?: string;
  completedAt?: string | null;
  acceptedAt?: string | null;
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
    eventType: string;
    payload?: unknown;
    createdAt?: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Queued";
    case "in_progress":
      return "Revision in progress";
    case "ready_for_review":
      return "Ready for your review";
    case "accepted":
      return "Accepted";
    case "cancelled":
      return "Discarded";
    case "failed":
      return "Needs attention";
    default:
      return status.replace(/_/g, " ");
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "ready_for_review":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";
    case "accepted":
      return "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300";
    case "failed":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";
    case "cancelled":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
    default:
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";
  }
}

async function readApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return String(data?.error || data?.message || `Request failed (${response.status})`);
  } catch {
    return `Request failed (${response.status})`;
  }
}

export default function BusinessPlanRevisionDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<RevisionContext | null>(null);
  const [detail, setDetail] = useState<RevisionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestType, setRequestType] = useState("factual_correction");
  const [instructions, setInstructions] = useState("");
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const activeRevision = useMemo(
    () => context?.revisions.find((revision) => ACTIVE_STATUSES.has(revision.status)) || null,
    [context],
  );

  const selectedRequestType = REQUEST_TYPES.find((item) => item.value === requestType) || REQUEST_TYPES[0];

  const loadDetail = async (revisionId: string) => {
    const response = await fetch(`/api/business-plans/${planId}/revisions/${revisionId}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(await readApiError(response));
    const data = (await response.json()) as RevisionDetail;
    setDetail(data);
    return data;
  };

  const loadContext = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/business-plans/${planId}/revisions`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const data = (await response.json()) as RevisionContext;
      setContext(data);
      const active = data.revisions.find((revision) => ACTIVE_STATUSES.has(revision.status));
      if (active) {
        await loadDetail(active.id);
      } else {
        setDetail(null);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load revision information.";
      setError(message);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }

    void loadContext();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
    // planId intentionally resets the dialog to the currently displayed plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, planId]);

  useEffect(() => {
    if (!open || !activeRevision || !["submitted", "in_progress"].includes(activeRevision.status)) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      void loadContext(false);
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeRevision?.id, activeRevision?.status]);

  const toggleSection = (sectionIndex: number, checked: boolean) => {
    setSelectedSections((current) => {
      const next = new Set(current);
      if (checked) next.add(sectionIndex);
      else next.delete(sectionIndex);
      return next;
    });
  };

  const submitRevision = async () => {
    if (selectedSections.size === 0) {
      setError("Select at least one section to revise.");
      return;
    }
    if (instructions.trim().length < 10) {
      setError("Explain the requested change in at least 10 characters.");
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch(`/api/business-plans/${planId}/revisions`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          requestType,
          instructions: instructions.trim(),
          sectionIndexes: Array.from(selectedSections).sort((a, b) => a - b),
          idempotencyKey,
        }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const created = await response.json();
      toast({
        title: `Revision ${created.revisionNumber} submitted`,
        description: "Your current business plan remains unchanged while the revised version is prepared.",
      });
      setInstructions("");
      setSelectedSections(new Set());
      await loadContext(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit revision.");
    } finally {
      setActionLoading(false);
    }
  };

  const performRevisionAction = async (revisionId: string, action: "accept" | "cancel") => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/business-plans/${planId}/revisions/${revisionId}/${action}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));
      await response.json();
      toast({
        title: action === "accept" ? "Revised plan accepted" : "Revision discarded",
        description:
          action === "accept"
            ? "The accepted revision is now the current business plan. The previous version remains in version history."
            : "The revision was discarded. Your current business plan was not changed.",
      });
      await loadContext(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update revision.");
    } finally {
      setActionLoading(false);
    }
  };

  const openPreview = (revisionId: string) => {
    window.open(
      `/api/business-plans/${planId}/revisions/${revisionId}/preview`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const renderActiveRevision = () => {
    if (!activeRevision) return null;
    const status = detail?.status || activeRevision.status;

    return (
      <div className="space-y-5">
        <div className={`rounded-xl border p-4 ${statusClasses(status)}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Revision {activeRevision.revisionNumber}</p>
              <p className="mt-1 text-sm">{statusLabel(status)}</p>
            </div>
            <span className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium">
              Version {detail?.sourceVersionNumber || context?.acceptedVersion.versionNumber}
              {detail?.targetVersionNumber ? ` → ${detail.targetVersionNumber}` : ""}
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4">
          <p className="text-sm font-semibold">Requested change</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {REQUEST_TYPES.find((item) => item.value === activeRevision.requestType)?.label || activeRevision.requestType}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{activeRevision.instructions}</p>
        </div>

        {status === "submitted" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="font-medium">Queued securely</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The revision is stored in the durable queue. You may close this page and return later.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "in_progress" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <div className="flex gap-3">
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-blue-600" />
              <div>
                <p className="font-medium">Revising selected sections</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Each revised section is checkpointed. A deployment or process restart will not lose completed revision work.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "ready_for_review" && detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">Candidate version ready</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your current plan is still unchanged. Review the revised sections and the full preview before accepting.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Section comparison</p>
              {detail.sections.map((section) => (
                <details key={section.index} className="group rounded-xl border bg-background">
                  <summary className="cursor-pointer list-none px-4 py-3 font-medium">
                    <span className="flex items-center justify-between gap-3">
                      <span>{section.title}</span>
                      <span className="text-xs text-muted-foreground">Compare</span>
                    </span>
                  </summary>
                  <div className="grid gap-3 border-t p-4 lg:grid-cols-2">
                    <div className="min-w-0 rounded-lg bg-muted/40 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current version</p>
                      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-6">
                        {section.originalContent}
                      </div>
                    </div>
                    <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900 dark:bg-emerald-950/10">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Revised candidate</p>
                      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-6">
                        {section.revisedContent || "Revision output unavailable."}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="outline" onClick={() => openPreview(activeRevision.id)} disabled={actionLoading}>
                <Eye className="mr-2 h-4 w-4" />
                Preview full plan
              </Button>
              <Button
                variant="outline"
                onClick={() => performRevisionAction(activeRevision.id, "cancel")}
                disabled={actionLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Discard revision
              </Button>
              <Button
                onClick={() => performRevisionAction(activeRevision.id, "accept")}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Accept revision
              </Button>
            </div>
          </div>
        )}

        {status === "submitted" && (
          <Button
            variant="outline"
            onClick={() => performRevisionAction(activeRevision.id, "cancel")}
            disabled={actionLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel queued revision
          </Button>
        )}
      </div>
    );
  };

  const renderNewRevisionForm = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <div>
            <p className="font-medium">Version-safe revision</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your current plan remains untouched. The platform creates a separate candidate version and only replaces the live plan after you explicitly accept it.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Revision type</label>
        <Select value={requestType} onValueChange={setRequestType}>
          <SelectTrigger>
            <SelectValue placeholder="Choose revision type" />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{selectedRequestType.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold">Sections to revise</label>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setSelectedSections(new Set(context?.sections.map((section) => section.index) || []))}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:underline"
              onClick={() => setSelectedSections(new Set())}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border p-3">
          {context?.sections.map((section) => {
            const checked = selectedSections.has(section.index);
            return (
              <label
                key={section.index}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggleSection(section.index, value === true)}
                  className="mt-0.5"
                />
                <span className="min-w-0 text-sm">
                  <span className="font-medium">Section {section.index + 1}</span>
                  <span className="ml-2 text-muted-foreground">{section.title.replace(/^\d+\.\s*/, "")}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedSections.size} section{selectedSections.size === 1 ? "" : "s"} selected. Unselected sections are copied unchanged into the candidate version.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="revision-instructions" className="text-sm font-semibold">
          What should change?
        </label>
        <textarea
          id="revision-instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          maxLength={5000}
          rows={6}
          placeholder="Be specific. State the corrected facts, new evidence, updated figures, wording concerns or exact outcome you want. The AI is instructed not to invent missing evidence."
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minimum 10 characters</span>
          <span>{instructions.length}/5000</span>
        </div>
      </div>

      <Button className="w-full" onClick={submitRevision} disabled={actionLoading}>
        {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Create revision candidate
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" data-testid="button-request-revision">
          <RefreshCw className="mr-2 h-4 w-4" />
          Request Revision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Business Plan Revision Centre
          </DialogTitle>
          <DialogDescription>
            Revise selected sections safely, compare the candidate with the current plan, and accept only when you are satisfied.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : error && !context ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        ) : context ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3">
              <div>
                <p className="font-semibold">{context.plan.businessName}</p>
                <p className="text-xs text-muted-foreground">
                  Current accepted version: {context.acceptedVersion.versionNumber}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <History className="h-4 w-4" />
                {context.versions.length} saved version{context.versions.length === 1 ? "" : "s"}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </div>
            )}

            {activeRevision ? renderActiveRevision() : renderNewRevisionForm()}

            {context.revisions.length > 0 && !activeRevision && (
              <div className="space-y-3 border-t pt-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <History className="h-4 w-4" />
                  Revision history
                </p>
                <div className="space-y-2">
                  {context.revisions.slice(0, 10).map((revision) => (
                    <div key={revision.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">Revision {revision.revisionNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {REQUEST_TYPES.find((item) => item.value === revision.requestType)?.label || revision.requestType}
                          {revision.submittedAt ? ` • ${formatDate(revision.submittedAt)}` : ""}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(revision.status)}`}>
                        {statusLabel(revision.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
