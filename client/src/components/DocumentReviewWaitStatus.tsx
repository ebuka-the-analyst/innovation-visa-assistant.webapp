import { useEffect, useMemo, useState } from "react";
import { Clock3, FileSearch, Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ActiveReview {
  status: "pending" | "processing";
  createdAt: string;
}

function durationLabel(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  if (minutes < 1) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function estimateWindow(documentContent: string) {
  const characters = Math.max(1, documentContent.trim().length);
  // The server reviews long documents in roughly 18k-character sections, then synthesises them.
  const estimatedSections = Math.max(1, Math.ceil(characters / 18_000));
  const lowMinutes = Math.max(2, Math.ceil(estimatedSections * 0.45 + 1));
  const highMinutes = Math.max(lowMinutes + 2, Math.ceil(estimatedSections * 1.2 + 2));
  return { estimatedSections, lowMinutes, highMinutes };
}

function stageFor(progress: number, status: ActiveReview["status"]): string {
  if (status === "pending" || progress < 10) return "Preparing your review";
  if (progress < 72) return "Reviewing the business plan section by section";
  if (progress < 90) return "Combining findings across the full plan";
  return "Finalising scores and recommendations";
}

export function DocumentReviewWaitStatus({
  review,
  documentContent,
}: {
  review: ActiveReview;
  documentContent: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startedAt = new Date(review.createdAt).getTime();
  const elapsedSeconds = Number.isFinite(startedAt)
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;
  const elapsedMinutes = elapsedSeconds / 60;

  const estimate = useMemo(() => estimateWindow(documentContent), [documentContent]);
  const estimatedProgress = Math.min(
    92,
    Math.max(review.status === "processing" ? 8 : 3, Math.round((elapsedMinutes / estimate.highMinutes) * 90)),
  );
  const stage = stageFor(estimatedProgress, review.status);

  const remainingLow = Math.max(0, Math.ceil(estimate.lowMinutes - elapsedMinutes));
  const remainingHigh = Math.max(0, Math.ceil(estimate.highMinutes - elapsedMinutes));
  const takingLonger = elapsedMinutes > estimate.highMinutes;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20" data-testid="document-review-wait-status">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {stage}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We are checking the full saved plan automatically. You do not need to submit it again or refresh the page.
          </p>
        </div>
        <div className="shrink-0 rounded-md border bg-background/70 px-3 py-2 text-sm">
          <div className="flex items-center gap-2 font-medium"><Clock3 className="h-4 w-4" />Elapsed {durationLabel(elapsedSeconds)}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Plan size</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold"><FileSearch className="h-4 w-4" />~{estimate.estimatedSections} review sections</div>
        </div>
        <div className="rounded-md border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Estimated total time</div>
          <div className="mt-1 text-sm font-semibold">{estimate.lowMinutes}–{estimate.highMinutes} minutes</div>
        </div>
        <div className="rounded-md border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Estimated time remaining</div>
          <div className="mt-1 text-sm font-semibold">
            {takingLonger ? "Taking longer than usual" : remainingHigh <= 1 ? "About a minute" : `${remainingLow}–${remainingHigh} minutes`}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Estimated progress</span>
          <span>{estimatedProgress}%</span>
        </div>
        <Progress value={estimatedProgress} />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          This percentage is a time-based estimate, not a live token counter. Completion is confirmed only when the finished review is saved to your account.
        </p>
      </div>

      {takingLonger && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-100/50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          This review has passed the normal estimate for a plan of this size. The page is still checking its status automatically. If the attempt ends unsuccessfully, you will see a clear failed state and can retry without pasting the plan again.
        </div>
      )}
    </div>
  );
}
