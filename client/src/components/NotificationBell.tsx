import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Bell, Inbox, Settings, X, CheckCheck,
  Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone,
  ArrowLeft, ExternalLink,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  action_text?: string;
  sent_at?: string;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; bar: string; icon: React.ElementType }> = {
  info:         { color: "text-blue-400",    bg: "bg-blue-500/20",    bar: "bg-blue-500",    icon: Info },
  success:      { color: "text-emerald-400", bg: "bg-emerald-500/20", bar: "bg-emerald-500", icon: CheckCircle },
  warning:      { color: "text-amber-400",   bg: "bg-amber-500/20",   bar: "bg-amber-500",   icon: AlertTriangle },
  urgent:       { color: "text-red-400",     bg: "bg-red-500/20",     bar: "bg-red-500",     icon: AlertCircle },
  announcement: { color: "text-purple-400",  bg: "bg-purple-500/20",  bar: "bg-purple-500",  icon: Megaphone },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<AppNotification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [, setLocation] = useLocation();

  const { data } = useQuery<{ notifications: AppNotification[] }>({
    queryKey: ["/api/notifications"],
    refetchInterval: 60_000,
    retry: false,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.length;

  const readMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest("POST", `/api/notifications/${id}/read`, {}),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAllRead = () => {
    notifications.forEach(n => readMutation.mutate(n.id));
  };

  const openNotification = (n: AppNotification) => {
    setExpanded(n);
    readMutation.mutate(n.id);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setExpanded(null);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSettingsClick = () => {
    setOpen(false);
    setExpanded(null);
    setLocation("/settings?tab=notifications");
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => { setOpen(v => !v); setExpanded(null); }}
        className="relative flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Notifications"
        data-testid="button-notification-bell"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] z-50 rounded-xl border border-border/60 bg-[#0f1117] text-white shadow-2xl overflow-hidden"
          data-testid="notification-panel"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            {expanded ? (
              <button
                onClick={() => setExpanded(null)}
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
                data-testid="button-back-to-list"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              {!expanded && unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded transition-colors"
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => { setOpen(false); setExpanded(null); }}
                className="flex items-center justify-center h-6 w-6 rounded text-white/40 hover:text-white/80 transition-colors"
                data-testid="button-close-notifications"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded notification detail view */}
          {expanded ? (
            <ExpandedView n={expanded} onAction={() => { setOpen(false); setExpanded(null); }} />
          ) : (
            /* Notification list */
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/5">
                    <Inbox className="h-7 w-7 text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">No notifications yet</p>
                    <p className="text-xs text-white/35 mt-1 leading-relaxed">
                      When you have project updates,<br />ticket responses, or important<br />alerts, they'll appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(n => {
                    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                    const Icon = cfg.icon;
                    const ts = n.sent_at || n.created_at;
                    return (
                      <button
                        key={n.id}
                        onClick={() => openNotification(n)}
                        className="w-full text-left px-4 py-3.5 hover:bg-white/5 transition-colors flex gap-3 items-start group"
                        data-testid={`notification-item-${n.id}`}
                      >
                        <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${cfg.bg}`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-white/90 leading-tight">{n.title}</p>
                            <span className="text-[10px] text-white/35 whitespace-nowrap flex-shrink-0 mt-0.5">{timeAgo(ts)}</span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-2 leading-relaxed">
                            {stripHtml(n.message)}
                          </p>
                          <span className="inline-block mt-1.5 text-[11px] font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to read →
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/10 transition-colors"
              data-testid="button-notification-settings"
            >
              <Settings className="h-4 w-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedView({ n, onAction }: { n: AppNotification; onAction: () => void }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
  const ts = n.sent_at || n.created_at;
  const hasHtml = /<[a-z][\s\S]*>/i.test(n.message);

  const handleAction = () => {
    if (n.action_url) {
      if (n.action_url.startsWith("http")) {
        window.open(n.action_url, "_blank");
      } else {
        window.location.href = n.action_url;
      }
    }
    onAction();
  };

  return (
    <div className="max-h-[460px] overflow-y-auto">
      {/* Type bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="px-5 py-4 space-y-4">
        {/* Title & time */}
        <div>
          <p className="text-xs text-white/40 mb-1">{new Date(ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
          <h3 className="text-base font-bold text-white leading-snug">{n.title}</h3>
        </div>

        {/* Message body */}
        <div className="text-sm text-white/75 leading-relaxed">
          {hasHtml ? (
            <div
              className="prose prose-invert prose-sm max-w-none
                [&_p]:mb-3 [&_p]:text-white/75
                [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white
                [&_strong]:text-white/90
                [&_table]:w-full [&_table]:border-collapse
                [&_th]:text-left [&_th]:py-1.5 [&_th]:px-3 [&_th]:text-white/60 [&_th]:text-xs [&_th]:border-b [&_th]:border-white/10
                [&_td]:py-1.5 [&_td]:px-3 [&_td]:text-white/75 [&_td]:text-sm [&_td]:border-b [&_td]:border-white/5
                [&_a]:text-blue-400 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: n.message }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{n.message}</div>
          )}
        </div>

        {/* Action button */}
        {(n.action_url || n.action_text) && (
          <button
            onClick={handleAction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            data-testid="button-notification-action"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {n.action_text || "View details"}
          </button>
        )}
      </div>
    </div>
  );
}
