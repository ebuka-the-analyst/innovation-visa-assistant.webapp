import React, { useEffect, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  FileText,
  Globe2,
  MapPin,
  Monitor,
  Receipt,
  RefreshCw,
  Route,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

type Customer360Data = any;

type TabId = "overview" | "plans" | "tools" | "sessions" | "pages" | "billing";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "plans", label: "Business Plans", icon: FileText },
  { id: "tools", label: "Tool Usage", icon: Wrench },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "pages", label: "Recent Pages", icon: Route },
  { id: "billing", label: "Billing & Credits", icon: CreditCard },
];

function formatDate(value?: string | null, includeTime = true) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function formatRelative(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return "Unknown";
  const seconds = Math.max(0, Math.round((Date.now() - date) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatDuration(seconds?: number | null) {
  const total = Math.max(0, Number(seconds || 0));
  if (total < 60) return `${total}s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}

function formatMoney(pence?: number | null, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(Number(pence || 0) / 100);
}

function maskIp(value?: string | null) {
  if (!value) return "Not recorded";
  if (value.includes(":")) {
    const parts = value.split(":");
    return `${parts.slice(0, 2).join(":")}:••••:••••`;
  }
  const parts = value.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.•••.•••` : value;
}

function readablePath(path?: string | null) {
  if (!path) return "Unknown page";
  if (path === "/") return "Home";
  return path
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" › ") || "Home";
}

function statusClass(status?: string | null) {
  const value = String(status || "").toLowerCase();
  if (["active", "completed", "succeeded", "good", "verified"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (["failed", "critical", "banned", "past_due"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }
  if (["attention", "pending", "processing", "warning", "inactive"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
}

function StatusBadge({ value, label }: { value?: string | null; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(value)}`}>
      {label || value || "Unknown"}
    </span>
  );
}

function Metric({ label, value, hint, icon: Icon }: { label: string; value: React.ReactNode; hint?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value ?? "—"}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {text}
    </div>
  );
}

function OverviewTab({ data }: { data: Customer360Data }) {
  const user = data.user || {};
  const overview = data.overview || {};
  const billing = data.billing || {};
  const health = overview.health || { score: 100, status: "good", flags: [] };
  const latestPlan = data.plans?.[0];
  const latestPayment = billing.payments?.[0];
  const latestSession = data.sessions?.[0];
  const latestCredit = billing.creditTransactions?.[0];

  const signals = [
    user.createdAt && { title: "Account created", detail: formatDate(user.createdAt), icon: UserRound },
    latestPayment && { title: "Latest payment", detail: `${latestPayment.type || "Payment"} · ${latestPayment.status || "unknown"} · ${formatDate(latestPayment.created_at)}`, icon: Receipt },
    latestPlan && { title: "Latest business plan", detail: `${latestPlan.businessName || "Unnamed"} · ${latestPlan.status || "unknown"} · ${formatDate(latestPlan.createdAt)}`, icon: FileText },
    latestCredit && { title: "Latest credit movement", detail: `${latestCredit.creditsChange > 0 ? "+" : ""}${latestCredit.creditsChange} ${latestCredit.creditsType || "credit"} · ${latestCredit.description || latestCredit.type}`, icon: Coins },
    latestSession && { title: latestSession.isActive ? "Active session" : "Latest session", detail: `${latestSession.browserName || "Browser"} on ${latestSession.osName || "Unknown OS"} · ${formatRelative(latestSession.lastSeenAt)}`, icon: Monitor },
  ].filter(Boolean) as Array<{ title: string; detail: string; icon: React.ComponentType<{ className?: string }> }>;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Account Health" value={`${health.score ?? 0}/100`} hint={String(health.status || "unknown").toUpperCase()} icon={ShieldCheck} />
        <Metric label="Current Plan" value={String(user.subscriptionTier || "free").replace(/\b\w/g, (c) => c.toUpperCase())} hint={user.subscriptionStatus || "inactive"} icon={CreditCard} />
        <Metric label="Credits" value={billing.totalCredits ?? 0} hint={`${billing.planCredits ?? 0} plan · ${billing.bonusCredits ?? 0} bonus`} icon={Coins} />
        <Metric label="Business Plans" value={overview.totalPlans ?? 0} hint={`${overview.completedPlans ?? 0} completed · ${overview.failedPlans ?? 0} failed`} icon={FileText} />
        <Metric label="Tools Used" value={overview.uniqueToolsUsed ?? 0} hint={`${overview.totalToolUses ?? 0} tracked uses`} icon={Wrench} />
        <Metric label="Lifetime Spend" value={formatMoney(billing.totalSpentPence)} hint={`${billing.successfulPaymentCount ?? 0} successful payments`} icon={Receipt} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account profile</h3>
              <p className="text-xs text-slate-500">Identity, lifecycle and current state</p>
            </div>
            <StatusBadge value={health.status} label={health.status === "good" ? "Healthy" : health.status === "attention" ? "Attention" : "Critical"} />
          </div>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name" value={[user.firstName, user.lastName].filter(Boolean).join(" ") || "Not supplied"} />
            <Field label="Email" value={user.email} />
            <Field label="Email verification" value={user.emailVerified ? "Verified" : "Not verified"} />
            <Field label="Joined" value={formatDate(user.createdAt)} />
            <Field label="Last activity" value={`${formatDate(user.lastActivityAt)} · ${formatRelative(user.lastActivityAt)}`} />
            <Field label="Current page" value={overview.currentPage ? `${readablePath(overview.currentPage)} (${overview.currentPage})` : "No active page"} />
            <Field label="Onboarding" value={user.onboardingComplete ? `Completed ${formatDate(user.onboardingCompletedAt)}` : "Not completed"} />
            <Field label="Previous tier" value={user.previousTier || "None"} />
            <Field label="Tier expiry" value={formatDate(user.tierExpiresAt)} />
            <Field label="Active sessions" value={`${overview.activeSessions ?? 0} of ${overview.totalSessions ?? 0} tracked`} />
            <Field label="Page views tracked" value={overview.pageViewsTracked ?? 0} />
            <Field label="Tracked session time" value={formatDuration(overview.totalTrackedSessionSeconds)} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account health checks</h3>
          <p className="mb-4 text-xs text-slate-500">Signals derived only from recorded production data</p>
          {health.flags?.length ? (
            <div className="space-y-2">
              {health.flags.map((flag: any, index: number) => (
                <div key={`${flag.code}-${index}`} className={`flex gap-3 rounded-lg border p-3 ${flag.severity === "critical" ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" : flag.severity === "warning" ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"}`}>
                  {flag.severity === "critical" || flag.severity === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> : <Activity className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{flag.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> No account-health warnings detected.
            </div>
          )}
          {(user.isBanned || user.suspendedUntil) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Banned" value={user.isBanned ? "Yes" : "No"} />
              <Field label="Suspended until" value={formatDate(user.suspendedUntil)} />
              <div className="sm:col-span-2"><Field label="Suspension reason" value={user.suspendedReason || "—"} /></div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent account signals</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <div key={`${signal.title}-${index}`} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900"><Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" /></div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{signal.title}</div>
                  <div className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{signal.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {data.security?.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent security signals</h3>
          <div className="mt-3 space-y-2">
            {data.security.slice(0, 5).map((event: any, index: number) => (
              <div key={event.id || index} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
                <div><span className="font-semibold">{event.event_type || "Security event"}</span>{event.severity ? ` · ${event.severity}` : ""}</div>
                <div className="text-slate-500">{formatDate(event.created_at || event.timestamp)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PlansTab({ data }: { data: Customer360Data }) {
  const plans = data.plans || [];
  if (!plans.length) return <EmptyState text="No business plans are associated with this account." />;
  return (
    <div className="space-y-3">
      {plans.map((plan: any) => {
        const matchingCredit = data.billing?.creditTransactions?.find((tx: any) => tx.referenceId === plan.id);
        return (
          <article key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words text-base font-bold text-slate-900 dark:text-white">{plan.businessName || "Unnamed business plan"}</h3>
                  <StatusBadge value={plan.status} />
                  {plan.isDemoData && <StatusBadge value="info" label="Demo data" />}
                </div>
                <div className="mt-1 text-xs text-slate-500">{plan.industry || "Industry not recorded"} · {plan.tier || "free"} tier · Created {formatDate(plan.createdAt)}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div className="font-mono">{plan.id}</div>
                <div className="mt-1">{plan.hasPdf ? "PDF available" : "No PDF"} · {plan.hasGeneratedContent ? "Content generated" : "No generated content"}</div>
              </div>
            </div>
            <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Generation stage" value={plan.currentGenerationStage || "Not recorded"} />
              <Field label="Innovation stage" value={plan.innovationStage || "Not recorded"} />
              <Field label="Target endorser" value={plan.targetEndorser || "Not recorded"} />
              <Field label="Generated content" value={plan.hasGeneratedContent ? `${Number(plan.generatedContentChars || 0).toLocaleString()} characters` : "No"} />
              <Field label="Credit movement" value={matchingCredit ? `${matchingCredit.creditsChange} ${matchingCredit.creditsType} · ${matchingCredit.type}` : "No directly linked ledger row"} />
              <Field label="Credit transaction date" value={matchingCredit ? formatDate(matchingCredit.createdAt) : "—"} />
              <Field label="Stripe session" value={plan.stripeSessionId ? `${String(plan.stripeSessionId).slice(0, 14)}…` : "Not linked"} />
              <Field label="Product status detail" value={plan.productStatus || "Not recorded"} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ToolsTab({ data }: { data: Customer360Data }) {
  const tools = data.tools || {};
  const usage = tools.usage || [];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Unique tools used" value={tools.uniqueToolsUsed || 0} hint="Tools with tracked activity" icon={Wrench} />
        <Metric label="Total tracked uses" value={tools.totalUses || 0} hint="Across all recorded tool events" icon={Activity} />
        <Metric label="Last tool activity" value={usage[0]?.lastUsedAt ? formatRelative(usage[0].lastUsedAt) : "Never"} hint={usage[0]?.toolId || "No tool activity"} icon={Clock} />
      </div>

      {!usage.length ? <EmptyState text="No tracked tool usage exists for this account." /> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                <tr><th className="px-4 py-3">Tool</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Uses</th><th className="px-4 py-3">First used</th><th className="px-4 py-3">Last used</th></tr>
              </thead>
              <tbody>
                {usage.map((tool: any) => (
                  <tr key={`${tool.toolId}-${tool.category}`} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{tool.toolId}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{tool.category || "Uncategorised"}</td>
                    <td className="px-4 py-3 font-semibold">{tool.uses}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(tool.firstUsedAt)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(tool.lastUsedAt)} · {formatRelative(tool.lastUsedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tools.recentEvents?.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-sm font-bold">Recent tool events</h3>
          <div className="mt-3 space-y-2">
            {tools.recentEvents.slice(0, 20).map((event: any) => (
              <div key={event.id} className="grid gap-1 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900 sm:grid-cols-[1fr_auto]">
                <div><span className="font-semibold">{event.toolId || "Tool"}</span> · {event.action || event.eventType || "activity"}{event.pagePath ? ` · ${event.pagePath}` : ""}</div>
                <div className="text-slate-500">{formatDate(event.occurredAt)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DeviceIcon({ type }: { type?: string | null }) {
  const value = String(type || "desktop").toLowerCase();
  if (value === "mobile") return <Smartphone className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function SessionsTab({ data }: { data: Customer360Data }) {
  const sessions = data.sessions || [];
  if (!sessions.length) return <EmptyState text="No tracked sessions exist for this account." />;
  return (
    <div className="space-y-3">
      {sessions.map((session: any) => (
        <article key={session.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-900 dark:text-slate-300"><DeviceIcon type={session.deviceType} /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <span className="capitalize">{session.deviceType || "Device"}</span>
                  <span>·</span>
                  <span>{session.browserName || "Unknown browser"}{session.browserVersion ? ` ${session.browserVersion}` : ""}</span>
                  <span>·</span>
                  <span>{session.osName || "Unknown OS"}{session.osVersion ? ` ${session.osVersion}` : ""}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{formatDate(session.startedAt)}</span>
                  <span>Last seen {formatRelative(session.lastSeenAt)}</span>
                </div>
              </div>
            </div>
            <StatusBadge value={session.isActive ? "active" : "ended"} label={session.isActive ? "Active now" : "Ended"} />
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Location" value={<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {[session.city, session.region, session.country].filter(Boolean).join(", ") || "Not recorded"}</span>} />
            <Field label="IP address" value={maskIp(session.ipAddress)} />
            <Field label="Screen" value={session.screenResolution || "Not recorded"} />
            <Field label="Connection" value={session.connectionType || "Not recorded"} />
            <Field label="Duration" value={formatDuration(session.totalDurationSeconds)} />
            <Field label="Page views" value={session.pageViewCount ?? 0} />
            <Field label="Events" value={session.eventCount ?? 0} />
            <Field label="Ended" value={session.endedAt ? formatDate(session.endedAt) : session.isActive ? "Still active" : "Not recorded"} />
          </div>

          <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-900 lg:grid-cols-3">
            <div><div className="font-semibold text-slate-500">Entry page</div><div className="mt-1 break-all text-slate-800 dark:text-slate-100">{session.entryPage || "—"}</div></div>
            <div><div className="font-semibold text-slate-500">Current / last page</div><div className="mt-1 break-all text-slate-800 dark:text-slate-100">{session.currentPage || "—"}</div></div>
            <div><div className="font-semibold text-slate-500">Exit page</div><div className="mt-1 break-all text-slate-800 dark:text-slate-100">{session.exitPage || (session.isActive ? "Session active" : "—")}</div></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PagesTab({ data }: { data: Customer360Data }) {
  const pages = data.pages || [];
  const topPaths = useMemo(() => {
    const counts = new Map<string, { count: number; seconds: number }>();
    pages.forEach((page: any) => {
      const key = page.path || "Unknown";
      const current = counts.get(key) || { count: 0, seconds: 0 };
      current.count += 1;
      current.seconds += Number(page.timeOnPageSeconds || 0);
      counts.set(key, current);
    });
    return Array.from(counts.entries()).map(([path, metrics]) => ({ path, ...metrics })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [pages]);

  if (!pages.length) return <EmptyState text="No page-view journey data exists for this account." />;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Tracked page views" value={pages.length} hint="Most recent 300 retained here" icon={Route} />
        <Metric label="Unique page paths" value={new Set(pages.map((page: any) => page.path)).size} hint="Distinct routes visited" icon={Globe2} />
        <Metric label="Tracked time on pages" value={formatDuration(pages.reduce((sum: number, page: any) => sum + Number(page.timeOnPageSeconds || 0), 0))} hint="Only completed timing records" icon={Clock} />
        <Metric label="Recorded clicks" value={pages.reduce((sum: number, page: any) => sum + Number(page.clickCount || 0), 0)} hint="Across retained page views" icon={Activity} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-bold">Most visited pages</h3>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {topPaths.map((item) => (
            <div key={item.path} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
              <div className="min-w-0"><div className="truncate font-semibold">{readablePath(item.path)}</div><div className="truncate text-slate-500">{item.path}</div></div>
              <div className="shrink-0 text-right"><div className="font-bold">{item.count} visits</div><div className="text-slate-500">{formatDuration(item.seconds)}</div></div>
            </div>
          ))}
        </div>
      </section>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr><th className="px-4 py-3">Page</th><th className="px-4 py-3">Visited</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Scroll</th><th className="px-4 py-3">Clicks</th><th className="px-4 py-3">Referrer</th><th className="px-4 py-3">Navigation</th></tr>
            </thead>
            <tbody>
              {pages.map((page: any) => (
                <tr key={page.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                  <td className="max-w-[300px] px-4 py-3"><div className="font-semibold text-slate-800 dark:text-slate-100">{page.title || readablePath(page.path)}</div><div className="mt-1 break-all text-slate-500">{page.path}</div></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(page.startedAt)}</td>
                  <td className="px-4 py-3 font-medium">{formatDuration(page.timeOnPageSeconds)}</td>
                  <td className="px-4 py-3">{page.scrollDepthPercent || 0}%</td>
                  <td className="px-4 py-3">{page.clickCount || 0}</td>
                  <td className="max-w-[220px] break-all px-4 py-3 text-slate-500">{page.referrerPath || "Direct / unknown"}</td>
                  <td className="px-4 py-3 text-slate-500">{page.navigationType || "navigate"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillingTab({ data }: { data: Customer360Data }) {
  const billing = data.billing || {};
  const payments = billing.payments || [];
  const credits = billing.creditTransactions || [];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Plan credits" value={billing.planCredits || 0} hint="Current plan allocation balance" icon={Coins} />
        <Metric label="Bonus credits" value={billing.bonusCredits || 0} hint="Add-ons, referrals and promos" icon={Coins} />
        <Metric label="Credits used" value={billing.creditsUsed || 0} hint="User-level consumption counter" icon={Activity} />
        <Metric label="Lifetime granted" value={billing.lifetimeGranted || 0} hint="Positive ledger movements retained" icon={CheckCircle2} />
        <Metric label="Lifetime consumed" value={billing.lifetimeConsumed || 0} hint="Negative ledger movements retained" icon={Activity} />
        <Metric label="Lifetime spend" value={formatMoney(billing.totalSpentPence)} hint={`${billing.successfulPaymentCount || 0} successful payments`} icon={Receipt} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Subscription tier" value={<StatusBadge value="active" label={String(billing.subscriptionTier || "free").toUpperCase()} />} />
          <Field label="Subscription status" value={<StatusBadge value={billing.subscriptionStatus} />} />
          <Field label="Last payment" value={formatDate(billing.lastPaymentAt)} />
          <Field label="Failed payments" value={billing.failedPaymentCount || 0} />
          <Field label="Last credit refresh" value={formatDate(billing.lastCreditRefresh)} />
          <Field label="Ultimate Assurance" value={billing.hasUltimateAssurance ? "Active" : "Not active"} />
          <Field label="Stripe customer" value={data.user?.stripeCustomerId ? `${String(data.user.stripeCustomerId).slice(0, 16)}…` : "Not linked"} />
          <Field label="Stripe subscription" value={data.user?.stripeSubscriptionId ? `${String(data.user.stripeSubscriptionId).slice(0, 16)}…` : "Not linked"} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Credit ledger</h3>
        {!credits.length ? <EmptyState text="No credit transactions are recorded for this account." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Credit type</th><th className="px-4 py-3">Balance after</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Description</th></tr></thead>
                <tbody>
                  {credits.map((tx: any) => (
                    <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 text-slate-500">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3 font-semibold">{tx.type}</td>
                      <td className={`px-4 py-3 font-bold ${tx.creditsChange > 0 ? "text-emerald-600" : tx.creditsChange < 0 ? "text-red-600" : ""}`}>{tx.creditsChange > 0 ? "+" : ""}{tx.creditsChange}</td>
                      <td className="px-4 py-3">{tx.creditsType}</td>
                      <td className="px-4 py-3">{tx.balanceAfter}</td>
                      <td className="max-w-[180px] break-all px-4 py-3 text-slate-500">{tx.referenceType || "—"}{tx.referenceId ? ` · ${tx.referenceId}` : ""}</td>
                      <td className="max-w-[340px] px-4 py-3 text-slate-600 dark:text-slate-300">{tx.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold">Payment history</h3>
        {!payments.length ? <EmptyState text="No payment transaction records exist for this account." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Stripe reference</th></tr></thead>
                <tbody>
                  {payments.map((payment: any, index: number) => (
                    <tr key={payment.id || index} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 text-slate-500">{formatDate(payment.created_at)}</td>
                      <td className="px-4 py-3 font-semibold">{payment.type || "payment"}</td>
                      <td className="px-4 py-3">{payment.tier || "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatMoney(payment.amount, payment.currency || "GBP")}</td>
                      <td className="px-4 py-3"><StatusBadge value={payment.status} /></td>
                      <td className="px-4 py-3">{payment.discount_amount ? formatMoney(payment.discount_amount, payment.currency || "GBP") : "—"}</td>
                      <td className="max-w-[220px] break-all px-4 py-3 font-mono text-[10px] text-slate-500">{payment.stripe_payment_id || payment.stripe_invoice_id || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Customer360Overlay({ email, onClose }: { email: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/customer-360?email=${encodeURIComponent(email)}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
      setData(body);
    } catch (loadError: any) {
      setError(loadError?.message || "Failed to load account data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [email]);

  const copyUserId = async () => {
    if (!data?.user?.id) return;
    try { await navigator.clipboard.writeText(data.user.id); } catch { /* clipboard may be unavailable */ }
  };

  const counts: Record<TabId, number | null> = {
    overview: null,
    plans: data?.plans?.length ?? 0,
    tools: data?.tools?.uniqueToolsUsed ?? 0,
    sessions: data?.sessions?.length ?? 0,
    pages: data?.pages?.length ?? 0,
    billing: data?.billing?.creditTransactions?.length ?? 0,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-3 backdrop-blur-[1px] sm:p-4" style={{ zIndex: 2147483000 }}>
      <div role="dialog" aria-modal="true" aria-label={`Customer 360 account view for ${email}`} className="flex h-[min(940px,calc(100vh-24px))] w-[min(1540px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><UserRound className="h-5 w-5" /></div>
                <div>
                  <h2 className="break-words text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Customer 360 — {email}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Detailed read-only support intelligence. No actions are performed on behalf of the user.</p>
                </div>
              </div>
              {data?.user && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{[data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || "Name not supplied"}</span>
                  <span>·</span>
                  <StatusBadge value={data.user.subscriptionStatus} label={`${String(data.user.subscriptionTier || "free").toUpperCase()} · ${data.user.subscriptionStatus || "inactive"}`} />
                  <span>·</span>
                  <button onClick={copyUserId} className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-900" title="Copy user ID"><Copy className="h-3 w-3" /> {String(data.user.id).slice(0, 12)}…</button>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
              <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800" aria-label="Close Customer 360"><X className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <nav className="shrink-0 overflow-x-auto border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 sm:px-5">
          <div className="flex min-w-max gap-1 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
                  <Icon className="h-4 w-4" /> {tab.label}{count !== null ? <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-slate-800"}`}>{count}</span> : null}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          {loading && !data ? (
            <div className="flex h-full min-h-[360px] items-center justify-center">
              <div className="text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-600" /><div className="mt-3 text-sm font-semibold">Loading full account intelligence…</div><div className="mt-1 text-xs text-slate-500">Plans, tools, sessions, journey, payments and credits</div></div>
            </div>
          ) : error ? (
            <div className="mx-auto mt-16 max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30"><AlertTriangle className="mx-auto h-7 w-7 text-red-600" /><h3 className="mt-3 font-bold text-red-800 dark:text-red-300">Could not load Customer 360</h3><p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p><button onClick={() => void load()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white">Try again</button></div>
          ) : data ? (
            <>
              {activeTab === "overview" && <OverviewTab data={data} />}
              {activeTab === "plans" && <PlansTab data={data} />}
              {activeTab === "tools" && <ToolsTab data={data} />}
              {activeTab === "sessions" && <SessionsTab data={data} />}
              {activeTab === "pages" && <PagesTab data={data} />}
              {activeTab === "billing" && <BillingTab data={data} />}
            </>
          ) : null}
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-2"><span>Read-only admin support view · Production data only</span><span>Data refreshed {data?.generatedAt ? formatDate(data.generatedAt) : "—"}</span></div>
        </footer>
      </div>
    </div>
  );
}

function extractAccountEmail(dialog: HTMLElement) {
  const titleText = dialog.textContent || "";
  const match = titleText.match(/Account View\s+—\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  return match?.[1] || null;
}

function closeOriginalDialog(dialog: HTMLElement) {
  dialog.style.visibility = "";
  const buttons = Array.from(dialog.querySelectorAll("button"));
  const labelledClose = buttons.find((button) => button.textContent?.trim() === "Close");
  if (labelledClose) {
    labelledClose.click();
    return;
  }
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
}

export function initCustomer360AdminEnhancer() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const stateWindow = window as any;
  if (stateWindow.__customer360AdminEnhancerStarted) return;
  stateWindow.__customer360AdminEnhancerStarted = true;

  const mount = document.createElement("div");
  mount.id = "customer-360-admin-enhancer-root";
  document.body.appendChild(mount);
  const root: Root = createRoot(mount);

  let activeDialog: HTMLElement | null = null;
  let activeEmail: string | null = null;
  let previousVisibility = "";

  const clear = () => {
    if (activeDialog?.isConnected) activeDialog.style.visibility = previousVisibility;
    activeDialog = null;
    activeEmail = null;
    previousVisibility = "";
    root.render(<></>);
  };

  const scan = () => {
    if (!window.location.pathname.startsWith("/admin")) {
      if (activeDialog) clear();
      return;
    }

    const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
    const accountDialog = dialogs.find((dialog) => /Account View\s+—/i.test(dialog.textContent || ""));

    if (!accountDialog) {
      if (activeDialog) clear();
      return;
    }

    const email = extractAccountEmail(accountDialog);
    if (!email) return;
    if (activeDialog === accountDialog && activeEmail === email) return;

    if (activeDialog?.isConnected) activeDialog.style.visibility = previousVisibility;
    activeDialog = accountDialog;
    activeEmail = email;
    previousVisibility = accountDialog.style.visibility;
    accountDialog.style.visibility = "hidden";

    root.render(
      <Customer360Overlay
        email={email}
        onClose={() => {
          const current = activeDialog;
          root.render(<></>);
          if (current) closeOriginalDialog(current);
        }}
      />,
    );
  };

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("hashchange", scan);
  window.addEventListener("popstate", scan);
  scan();
}
