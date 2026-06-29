import { useState, useCallback, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Zap,
  TrendingUp,
  Globe,
  BookOpen,
  Building2,
  Star,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Link2,
  FileText,
  Calendar,
  Cpu,
  ChevronRight,
  Download,
  RefreshCw,
  Award,
  MapPin,
  MessageSquare,
  Camera,
  Circle,
  PlayCircle,
  ExternalLink,
  PenLine,
  ListChecks,
  Bot,
  Pause,
  Play,
  Rocket,
  CalendarDays,
  Wand2,
  Trash2,
  Copy,
  ShieldCheck,
  ShieldX,
  Filter,
  ArrowUpRight,
  Database,
  ChevronDown,
} from "lucide-react";

interface SEOAction {
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  action: string;
  impact: string;
  effort: "quick-win" | "week" | "month" | "quarter";
  metric: string;
}

interface ContentPiece {
  title: string;
  type: "blog" | "service-page" | "faq" | "location-page" | "gbp-post";
  targetKeyword: string;
  outline: string[];
  wordCount: number;
  weekNumber?: number;
}

interface KeywordOpportunity {
  keyword: string;
  intent: "ready-to-hire" | "solution-aware" | "problem-aware" | "research";
  difficulty: "low" | "medium" | "high";
  action: "optimize-existing" | "create-new";
  pageRecommendation: string;
}

interface SEOStrategyResult {
  generatedAt: string;
  executiveSummary: string;
  overallScore: {
    technical: number;
    content: number;
    authority: number;
    local: number;
    overall: number;
  };
  criticalActions: SEOAction[];
  quickWins: SEOAction[];
  thirtyDayPlan: SEOAction[];
  ninetyDayPlan: SEOAction[];
  contentCalendar: ContentPiece[];
  keywordOpportunities: KeywordOpportunity[];
  entityOptimization: {
    schemaRecommendations: string[];
    entityBuildingSteps: string[];
    knowledgePanelStrategy: string;
    citationAuditFindings: string[];
    eeaatSignals: string[];
  };
  competitorGap: {
    topicGaps: {
      topic: string;
      competitorRanking: string;
      yourAction: string;
    }[];
    contentGaps: string[];
    keywordGaps: string[];
    differentiationAngles: string[];
  };
  featuredSnippets: {
    opportunities: {
      query: string;
      snippetType: string;
      contentFormat: string;
      answer: string;
    }[];
    voiceSearchQuestions: string[];
    peopleAlsoAsk: string[];
  };
  internationalSEO: {
    countryStrategy: {
      country: string;
      language: string;
      priority: string;
      keyActions: string[];
    }[];
    hreflangRecommendations: string[];
    currencyAndLocalisation: string[];
  };
  cro: {
    landingPageRecommendations: {
      page: string;
      issue: string;
      fix: string;
      expectedImpact: string;
    }[];
    ctaOptimisation: string[];
    trustSignals: string[];
    funnelImprovements: string[];
  };
  faqLibrary: { question: string; answer: string }[];
  contentPillars: { pillar: string; supportingTopics: string[] }[];
  homepageCopy: {
    headline: string;
    subheadline: string;
    ctaText: string;
    valueProp: string;
    servicesOverview: string;
    socialProof: string;
  };
  metaTags: { page: string; titleTag: string; metaDescription: string }[];
  authorityBuilding: {
    linkBuildingOpportunities: {
      source: string;
      type: string;
      strategy: string;
    }[];
    prOpportunities: string[];
    partnershipOpportunities: string[];
    reviewRequestScript: string;
    reviewResponseTemplates: {
      fiveStar: string;
      fourStar: string;
      threeStar: string;
      oneTwo: string;
    };
  };
  technicalSEO: {
    coreWebVitals: string[];
    structuredDataGaps: string[];
    internalLinkingOpportunities: string[];
    pageSpeedRecommendations: string[];
    technicalAuditChecklist: string[];
    newPagesNeeded: {
      urlSlug: string;
      titleTag: string;
      h1: string;
      metaDescription: string;
      contentOutline: string[];
    }[];
  };
  gbpStrategy: {
    categoryRecommendations: string[];
    descriptionVersions: string[];
    postingCalendar: {
      week: number;
      topic: string;
      type: string;
      copy: string;
    }[];
    attributesToAdd: string[];
    photoStrategy: string;
  };
  verificationNotes: string;
  modelContributions: {
    gemini: string;
    openai: string;
    claude: string;
    qwen: string;
  };
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

const INTENT_COLORS: Record<string, string> = {
  "ready-to-hire":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "solution-aware":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "problem-aware":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  research:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const EFFORT_LABELS: Record<string, string> = {
  "quick-win": "Quick Win",
  week: "1 Week",
  month: "1 Month",
  quarter: "3 Months",
};

const MODEL_COLORS: Record<string, string> = {
  gemini: "text-blue-600 dark:text-blue-400",
  openai: "text-green-600 dark:text-green-400",
  claude: "text-purple-600 dark:text-purple-400",
  qwen: "text-orange-600 dark:text-orange-400",
};

function ScoreRing({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            strokeWidth="8"
            stroke="currentColor"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

type TaskStatus = "todo" | "in-progress" | "done";

function useTaskTracker(storageKey: string) {
  const load = (): Record<string, TaskStatus> => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  };
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(load);
  const cycle = useCallback(
    (id: string) => {
      setStatuses((prev) => {
        const next = { ...prev };
        const cur = next[id] || "todo";
        next[id] =
          cur === "todo"
            ? "in-progress"
            : cur === "in-progress"
              ? "done"
              : "todo";
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );
  return { statuses, cycle };
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { icon: ReactNode; label: string; cls: string }
> = {
  todo: {
    icon: <Circle className="w-4 h-4" />,
    label: "To Do",
    cls: "text-muted-foreground",
  },
  "in-progress": {
    icon: <PlayCircle className="w-4 h-4" />,
    label: "In Progress",
    cls: "text-yellow-500",
  },
  done: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Done",
    cls: "text-green-500",
  },
};

function ActionCard({
  action,
  taskId,
  status,
  onCycle,
}: {
  action: SEOAction;
  taskId: string;
  status: TaskStatus;
  onCycle: (id: string) => void;
}) {
  const st = STATUS_CONFIG[status];
  return (
    <div
      className={`flex gap-3 p-3 border rounded-md bg-card transition-opacity ${status === "done" ? "opacity-60" : ""}`}
    >
      <button
        onClick={() => onCycle(taskId)}
        className={`flex-shrink-0 mt-0.5 ${st.cls} hover:opacity-70 transition-opacity`}
        title={`Status: ${st.label} — click to advance`}
      >
        {st.icon}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <Badge
            className={PRIORITY_COLORS[action.priority]}
            style={{ fontSize: "10px" }}
          >
            {action.priority.toUpperCase()}
          </Badge>
          <Badge variant="outline" style={{ fontSize: "10px" }}>
            {action.category}
          </Badge>
          <Badge variant="outline" style={{ fontSize: "10px" }}>
            <Clock className="w-2.5 h-2.5 mr-1" />
            {EFFORT_LABELS[action.effort]}
          </Badge>
          <Badge
            variant="outline"
            style={{ fontSize: "10px" }}
            className={`${st.cls} cursor-pointer`}
            onClick={() => onCycle(taskId)}
          >
            {st.label}
          </Badge>
        </div>
        <p
          className={`text-sm font-medium mb-0.5 ${status === "done" ? "line-through" : ""}`}
        >
          {action.action}
        </p>
        <p className="text-xs text-muted-foreground">{action.impact}</p>
        {action.metric && (
          <p className="text-xs text-muted-foreground mt-0.5">
            <strong>Measure:</strong> {action.metric}
          </p>
        )}
      </div>
    </div>
  );
}

function TaskProgressBar({
  statuses,
  total,
}: {
  statuses: Record<string, TaskStatus>;
  total: number;
}) {
  const done = Object.values(statuses).filter((s) => s === "done").length;
  const inProgress = Object.values(statuses).filter(
    (s) => s === "in-progress",
  ).length;
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
      <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>
            {done} done · {inProgress} in progress · {total - done - inProgress}{" "}
            to do
          </span>
          <span>{Math.round((done / total) * 100)}% complete</span>
        </div>
        <Progress value={(done / total) * 100} className="h-1.5" />
      </div>
    </div>
  );
}

function KeywordCard({
  kw,
  onGenerateBlog,
}: {
  kw: KeywordOpportunity;
  onGenerateBlog: (keyword: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-md bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{kw.keyword}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {kw.pageRecommendation}
        </p>
      </div>
      <div className="flex flex-col gap-1 items-end flex-shrink-0">
        <Badge
          className={INTENT_COLORS[kw.intent]}
          style={{ fontSize: "10px" }}
        >
          {kw.intent.replace("-", " ")}
        </Badge>
        <Badge variant="outline" style={{ fontSize: "10px" }}>
          {kw.difficulty} difficulty
        </Badge>
        <Badge variant="outline" style={{ fontSize: "10px" }}>
          {kw.action === "create-new" ? "New Page" : "Optimise"}
        </Badge>
        {kw.action === "create-new" && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2 mt-0.5"
            onClick={() => onGenerateBlog(kw.keyword)}
          >
            <PenLine className="w-3 h-3 mr-1" />
            Blog
          </Button>
        )}
      </div>
    </div>
  );
}

interface AutomationPlan {
  id: string;
  businessName: string;
  status: "active" | "paused" | "completed";
  totalContentItems: number;
  queuedItems: number;
  completedItems: number;
  weekNumber: number;
  startDate: string;
  nextQueueDate: string | null;
  progressPct: number;
}

// ─── Backlink Intelligence Engine Component ─────────────────────────────────

type BLTarget = {
  id: string;
  name: string;
  url: string;
  submissionUrl?: string;
  category: string;
  platform?: string;
  domainAuthority?: number;
  status: string;
  priority: string;
  effort: string;
  expectedImpact: string;
  strategy?: string;
  aiGeneratedContent?: string;
  contentGeneratedAt?: string;
  notes?: string;
  anchorText?: string;
  linkType?: string;
  isLive?: boolean;
  liveCheckedAt?: string;
  submittedAt?: string;
  liveUrl?: string;
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  submitted: {
    label: "Submitted",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  live: {
    label: "Live",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};
const PRIORITY_CFG: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const CAT_ICONS: Record<string, string> = {
  forum: "💬",
  directory: "📂",
  community: "👥",
  press: "📰",
  blog: "✍️",
  "tool-directory": "🛠️",
  social: "🌐",
  podcast: "🎙️",
  academic: "🎓",
};

function BacklinkEngine() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});

  const {
    data: targets = [],
    isLoading,
    refetch,
  } = useQuery<BLTarget[]>({
    queryKey: ["/api/seo/backlink-targets"],
    refetchInterval: 30000,
  });

  const discoverMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/seo/backlink-discover").then((r) => r.json()),
    onSuccess: (data) => {
      toast({
        title: "AI Discovery Complete",
        description: `Found ${data.discovered} new targets (${data.skipped} already known).`,
      });
      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] });
    },
    onError: (e: Error) =>
      toast({
        title: "Discovery Failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const contentMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/seo/backlink-content/${id}`).then((r) =>
        r.json(),
      ),
    onSuccess: (data) => {
      const generatedTarget = data?.target as BLTarget | undefined;

      toast({
        title: "Content Generated",
        description: "Exact submission content is ready to copy.",
      });

      if (generatedTarget?.id) {
        qc.setQueryData<BLTarget[]>(
          ["/api/seo/backlink-targets"],
          (oldTargets = []) =>
            oldTargets.map((target) =>
              target.id === generatedTarget.id
                ? { ...target, ...generatedTarget }
                : target,
            ),
        );

        setExpandedId(generatedTarget.id);
      }

      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] });
    },
    onError: (e: Error) =>
      toast({
        title: "Generation Failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BLTarget> }) =>
      apiRequest("PATCH", `/api/seo/backlink-targets/${id}`, updates).then(
        (r) => r.json(),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] }),
    onError: (e: Error) =>
      toast({
        title: "Update Failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/seo/backlink-targets/${id}`).then((r) =>
        r.json(),
      ),
    onSuccess: () => {
      toast({ title: "Target removed" });
      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] });
    },
    onError: (e: Error) =>
      toast({
        title: "Delete Failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const checkMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/seo/backlink-check/${id}`).then((r) => r.json()),
    onSuccess: (data) => {
      toast({
        title: data.isLive ? "Link is Live!" : "Not Live Yet",
        description: `Status code: ${data.statusCode}`,
        variant: data.isLive ? "default" : "destructive",
      });
      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] });
    },
  });

  const checkAllMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/seo/backlink-check-all").then((r) => r.json()),
    onSuccess: (data) => {
      const live = data.results.filter((r: any) => r.isLive).length;
      toast({
        title: `Bulk Check Complete`,
        description: `${live} of ${data.checked} submitted links confirmed live.`,
      });
      qc.invalidateQueries({ queryKey: ["/api/seo/backlink-targets"] });
    },
  });

  // Stats
  const total = targets.length;
  const live = targets.filter((t) => t.status === "live").length;
  const submitted = targets.filter((t) => t.status === "submitted").length;
  const pending = targets.filter((t) => t.status === "pending").length;
  const avgDA =
    targets.length > 0
      ? Math.round(
          targets
            .filter((t) => t.domainAuthority)
            .reduce((s, t) => s + (t.domainAuthority || 0), 0) /
            Math.max(targets.filter((t) => t.domainAuthority).length, 1),
        )
      : 0;
  const criticalCount = targets.filter(
    (t) => t.priority === "critical" && t.status === "pending",
  ).length;

  // Filtered targets
  const filtered = targets.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (
      search &&
      !t.name.toLowerCase().includes(search.toLowerCase()) &&
      !t.url.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const categories = Array.from(new Set(targets.map((t) => t.category)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-500" />
            Backlink Intelligence Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-powered authority building — discover targets, generate exact
            submission content, track live links
          </p>
        </div>
        <div className="flex items-center gap-2">
          {submitted > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkAllMutation.mutate()}
              disabled={checkAllMutation.isPending}
              data-testid="button-check-all-backlinks"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              {checkAllMutation.isPending
                ? "Checking..."
                : `Check ${submitted} Submitted`}
            </Button>
          )}
          <Button
            onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending}
            size="sm"
            data-testid="button-discover-backlinks"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            {discoverMutation.isPending
              ? "AI Discovering..."
              : "AI Discover Targets"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            label: "Total Targets",
            value: total,
            color: "text-foreground",
            sub: "discovered",
          },
          {
            label: "Live Backlinks",
            value: live,
            color: "text-green-600",
            sub: "confirmed live",
          },
          {
            label: "Submitted",
            value: submitted,
            color: "text-yellow-600",
            sub: "awaiting",
          },
          {
            label: "Pending",
            value: pending,
            color: "text-blue-600",
            sub: "to do",
          },
          {
            label: "Avg. DA Score",
            value: avgDA || "—",
            color: "text-purple-600",
            sub: "domain authority",
          },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-3 pb-3">
              <div className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs font-medium text-foreground mt-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {criticalCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">
            {criticalCount} critical-priority targets are still pending — these
            are your highest-impact backlinks.
          </span>
        </div>
      )}

      {total === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Database className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No backlink targets yet
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click "AI Discover Targets" to generate 40 real, specific
              opportunities using Gemini AI
            </p>
            <Button
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              data-testid="button-discover-backlinks-empty"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {discoverMutation.isPending
                ? "AI is generating targets..."
                : "Discover 40 Backlink Opportunities"}
            </Button>
          </CardContent>
        </Card>
      )}

      {total > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search by name or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm max-w-xs"
                data-testid="input-backlink-search"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 text-sm border rounded-md px-2 bg-background"
                data-testid="select-backlink-status"
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_CFG).map(([v, c]) => (
                  <option key={v} value={v}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-8 text-sm border rounded-md px-2 bg-background"
                data-testid="select-backlink-category"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CAT_ICONS[c] || "•"} {c}
                  </option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-8 text-sm border rounded-md px-2 bg-background"
                data-testid="select-backlink-priority"
              >
                <option value="all">All Priorities</option>
                {["critical", "high", "medium", "low"].map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground self-center ml-1">
                {filtered.length} of {total}
              </span>
            </div>

            {/* Table */}
            <div className="space-y-2">
              {filtered.map((t) => (
                <div key={t.id} className="border rounded-md overflow-hidden">
                  {/* Row */}
                  <div className="flex flex-wrap items-center gap-2 p-3">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">
                          {CAT_ICONS[t.category] || "•"} {t.name}
                        </span>
                        {t.domainAuthority && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0"
                          >
                            DA {t.domainAuthority}
                          </Badge>
                        )}
                        <Badge
                          className={`text-xs px-1.5 py-0 ${PRIORITY_CFG[t.priority]}`}
                        >
                          {t.priority}
                        </Badge>
                        <Badge
                          className={`text-xs px-1.5 py-0 ${STATUS_CFG[t.status]?.color}`}
                        >
                          {STATUS_CFG[t.status]?.label}
                        </Badge>
                        {t.isLive === true && (
                          <Badge className="text-xs px-1.5 py-0 bg-green-100 text-green-700">
                            ✓ Live
                          </Badge>
                        )}
                        {t.isLive === false && t.liveCheckedAt && (
                          <Badge className="text-xs px-1.5 py-0 bg-red-100 text-red-700">
                            ✗ Not live
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {t.url}
                      </div>
                      {t.strategy && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {t.strategy}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Status change */}
                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: t.id,
                            updates: { status: e.target.value },
                          })
                        }
                        className="h-7 text-xs border rounded px-1.5 bg-background"
                        data-testid={`select-status-${t.id}`}
                      >
                        {Object.entries(STATUS_CFG).map(([v, c]) => (
                          <option key={v} value={v}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      {/* Generate content */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => contentMutation.mutate(t.id)}
                        disabled={contentMutation.isPending}
                        title="Generate AI submission content"
                        data-testid={`button-generate-content-${t.id}`}
                        className="h-7 px-2"
                      >
                        <Wand2 className="w-3 h-3" />
                      </Button>

                      {/* Check live */}
                      {t.status === "submitted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkMutation.mutate(t.id)}
                          disabled={checkMutation.isPending}
                          title="Check if backlink is live"
                          data-testid={`button-check-${t.id}`}
                          className="h-7 px-2"
                        >
                          <ShieldCheck className="w-3 h-3" />
                        </Button>
                      )}

                      {/* Open URL */}
                      <a
                        href={t.submissionUrl || t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          title="Open submission URL"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </a>

                      {/* Expand */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(expandedId === t.id ? null : t.id)
                        }
                        className="h-7 px-2"
                        data-testid={`button-expand-${t.id}`}
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${expandedId === t.id ? "rotate-180" : ""}`}
                        />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(t.id)}
                        disabled={deleteMutation.isPending}
                        className="h-7 px-2 text-red-500 hover:text-red-600"
                        title="Remove target"
                        data-testid={`button-delete-${t.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded section */}
                  {expandedId === t.id && (
                    <div className="border-t bg-muted/30 p-3 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Category
                          </span>
                          <div>{t.category}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Effort
                          </span>
                          <div>{t.effort}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Expected Impact
                          </span>
                          <div>{t.expectedImpact}</div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Link Type
                          </span>
                          <div>{t.linkType || "dofollow"}</div>
                        </div>
                        {t.anchorText && (
                          <div className="col-span-2">
                            <span className="font-medium text-muted-foreground">
                              Anchor Text
                            </span>
                            <div>"{t.anchorText}"</div>
                          </div>
                        )}
                        {t.submissionUrl && (
                          <div className="col-span-2">
                            <span className="font-medium text-muted-foreground">
                              Submission URL
                            </span>
                            <a
                              href={t.submissionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline break-all"
                            >
                              {t.submissionUrl}
                            </a>
                          </div>
                        )}
                        {t.submittedAt && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Submitted
                            </span>
                            <div>
                              {new Date(t.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {t.liveCheckedAt && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Last Checked
                            </span>
                            <div>
                              {new Date(t.liveCheckedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {t.strategy && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Strategy
                          </p>
                          <p className="text-sm">{t.strategy}</p>
                        </div>
                      )}

                      {/* AI Generated Content */}
                      {t.aiGeneratedContent ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                              AI Submission Content — Copy and post on this
                              website
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => contentMutation.mutate(t.id)}
                              disabled={contentMutation.isPending}
                              className="h-6 text-xs px-2"
                              data-testid={`button-regen-content-${t.id}`}
                            >
                              <Wand2 className="w-3 h-3 mr-1" />
                              {contentMutation.isPending
                                ? "Generating..."
                                : "Regenerate"}
                            </Button>
                          </div>
                          {(() => {
                            const raw = t.aiGeneratedContent!;
                            const parts = raw
                              .split(/===VARIATION \d+===/g)
                              .map((s) => s.replace(/===END===/g, "").trim())
                              .filter(Boolean);
                            if (parts.length < 2) {
                              return (
                                <div>
                                  <div className="flex justify-end mb-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={() => {
                                        navigator.clipboard.writeText(raw);
                                        toast({ title: "Copied!" });
                                      }}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <pre className="text-xs bg-background border rounded p-3 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                                    {raw}
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <div className="space-y-2">
                                {parts.map((variation, idx) => (
                                  <div
                                    key={idx}
                                    className="border rounded bg-background"
                                  >
                                    <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/40">
                                      <span className="text-xs font-semibold text-muted-foreground">
                                        Variation {idx + 1} — Account {idx + 1}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-xs px-2"
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            variation,
                                          );
                                          toast({
                                            title: `Variation ${idx + 1} copied!`,
                                          });
                                        }}
                                        data-testid={`button-copy-variation-${t.id}-${idx}`}
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copy
                                      </Button>
                                    </div>
                                    <pre className="text-xs p-3 whitespace-pre-wrap font-mono leading-relaxed max-h-36 overflow-y-auto">
                                      {variation}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                          <p className="text-xs text-muted-foreground">
                            Generated{" "}
                            {t.contentGeneratedAt
                              ? new Date(t.contentGeneratedAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => contentMutation.mutate(t.id)}
                          disabled={contentMutation.isPending}
                          data-testid={`button-gen-content-expanded-${t.id}`}
                        >
                          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                          {contentMutation.isPending
                            ? "Generating submission content..."
                            : "Generate AI Submission Content"}
                        </Button>
                      )}

                      {/* Notes */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Notes
                        </p>
                        <div className="flex gap-2">
                          <Textarea
                            value={
                              editNotes[t.id] !== undefined
                                ? editNotes[t.id]
                                : t.notes || ""
                            }
                            onChange={(e) =>
                              setEditNotes((n) => ({
                                ...n,
                                [t.id]: e.target.value,
                              }))
                            }
                            placeholder="Add notes about submission status, contact made, etc."
                            className="text-xs min-h-[60px]"
                            data-testid={`textarea-notes-${t.id}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="self-end"
                            onClick={() => {
                              updateMutation.mutate({
                                id: t.id,
                                updates: { notes: editNotes[t.id] },
                              });
                              toast({ title: "Notes saved" });
                            }}
                            data-testid={`button-save-notes-${t.id}`}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main SEO Strategy Page ─────────────────────────────────────────────────

export default function SeoStrategy() {
  const { toast } = useToast();
  const [result, setResult] = useState<SEOStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { statuses, cycle } = useTaskTracker("seo-strategy-tasks");

  // Automation status polling
  const { data: automationData, refetch: refetchAutomation } = useQuery<{
    active: boolean;
    plan?: AutomationPlan;
  }>({
    queryKey: ["/api/seo/automation-status"],
    refetchInterval: 15000,
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!result) throw new Error("No strategy to activate");
      const res = await apiRequest(
        "POST",
        "/api/seo/activate-automation",
        result,
      );
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "90-Day Automation Activated",
        description: `${data.queuedNow} posts queued immediately. ${data.totalItems} total planned across 13 weeks.`,
      });
      refetchAutomation();
    },
    onError: (err: Error) => {
      toast({
        title: "Activation Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      planId,
      action,
    }: {
      planId: string;
      action: "pause" | "resume";
    }) => {
      const res = await apiRequest("POST", "/api/seo/automation-toggle", {
        planId,
        action,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchAutomation();
      toast({ title: "Automation updated" });
    },
  });

  const handleGenerateBlog = (keyword: string) => {
    const url = `/admin/blog?prefill=${encodeURIComponent(keyword)}`;
    window.open(url, "_blank");
    toast({
      title: "Opening Blog Creator",
      description: `Pre-filling blog post for: "${keyword}"`,
    });
  };

  const makeTaskId = (prefix: string, i: number, action: string) =>
    `${prefix}-${i}-${action.slice(0, 30).replace(/\s/g, "-")}`;

  const [form, setForm] = useState({
    businessName: "UK Innovator Founder Visa Assistant",
    websiteUrl: "https://innovatorfoundervisaassistant.co.uk",
    primaryService:
      "UK Innovator Founder Visa guidance and AI-powered visa application tools",
    targetKeywords:
      "UK Innovator Founder Visa, UK entrepreneur visa, UK business visa, endorsing body UK, UK visa for entrepreneurs",
    targetAudience:
      "International entrepreneurs and founders seeking to live and work in the UK through the Innovator Founder Visa route",
    competitors:
      "ukbf.com, bizadvice.co.uk, sableinternational.com, workpermit.com",
    targetLocations: "London, UK, Global",
    currentMonthlyTraffic: "5000",
    googleReviewCount: "24",
    averageRating: "4.8",
    currentRankingKeywords:
      "UK Innovator Founder Visa, innovator founder visa assistant",
    biggestSEOProblem:
      "Low organic traffic despite strong tool offering — need to establish topical authority in the UK visa niche",
    // Extended fields
    domainAuthority: "",
    estimatedBacklinks: "",
    topPerformingPages:
      "/tools/compliance-checker, /blog/uk-innovator-visa-guide, /business-plan-generator",
    publishingFrequency: "weekly",
    uniqueSellingProposition:
      "109 AI-powered tools, quad-AI verification, 100% UK visa compliance accuracy",
    businessStage: "growing",
    socialMediaChannels: "LinkedIn, Twitter/X, YouTube",
    knownTechnicalIssues: "",
    targetCountries: "UK, India, Nigeria, UAE, USA",
    conversionGoal: "Free trial sign-up leading to premium subscription",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const ctx = {
        businessName: form.businessName,
        websiteUrl: form.websiteUrl,
        primaryService: form.primaryService,
        targetKeywords: form.targetKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        targetAudience: form.targetAudience,
        competitors: form.competitors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        targetLocations: form.targetLocations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        currentMonthlyTraffic: form.currentMonthlyTraffic
          ? Number(form.currentMonthlyTraffic)
          : undefined,
        googleReviewCount: form.googleReviewCount
          ? Number(form.googleReviewCount)
          : undefined,
        averageRating: form.averageRating
          ? Number(form.averageRating)
          : undefined,
        currentRankingKeywords: form.currentRankingKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        biggestSEOProblem: form.biggestSEOProblem,
        domainAuthority: form.domainAuthority
          ? Number(form.domainAuthority)
          : undefined,
        estimatedBacklinks: form.estimatedBacklinks
          ? Number(form.estimatedBacklinks)
          : undefined,
        topPerformingPages: form.topPerformingPages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        publishingFrequency: form.publishingFrequency,
        uniqueSellingProposition: form.uniqueSellingProposition,
        businessStage: form.businessStage,
        socialMediaChannels: form.socialMediaChannels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        knownTechnicalIssues: form.knownTechnicalIssues
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        targetCountries: form.targetCountries
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        conversionGoal: form.conversionGoal,
      };
      const res = await apiRequest("POST", "/api/seo/strategy", ctx);
      const data = await res.json();
      return data as SEOStrategyResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setActiveTab("overview");
      toast({
        title: "SEO Strategy Ready",
        description:
          "Quad-AI analysis complete. Your PhD-level SEO strategy has been generated.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const downloadStrategy = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-strategy-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            PhD-Level SEO Strategy Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Quad-AI analysis: Gemini + GPT-4o + Claude + Qwen working in
            parallel across all 4 SEO pillars
          </p>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button
                variant="outline"
                onClick={downloadStrategy}
                data-testid="button-download-strategy"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => setResult(null)}
                data-testid="button-new-analysis"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Model Legend */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              {
                model: "gemini",
                icon: Globe,
                label: "Gemini",
                role: "Local SEO + GBP strategy",
              },
              {
                model: "openai",
                icon: BarChart3,
                label: "GPT-4o",
                role: "Technical SEO + Keywords",
              },
              {
                model: "claude",
                icon: Award,
                label: "Claude",
                role: "Content + Entity + Authority",
              },
              {
                model: "qwen",
                icon: FileText,
                label: "Qwen",
                role: "Content production + GBP posts",
              },
            ].map(({ model, icon: Icon, label, role }) => (
              <div key={model} className="flex items-center gap-2">
                <Cpu className={`w-3.5 h-3.5 ${MODEL_COLORS[model]}`} />
                <span
                  className={`text-sm font-semibold ${MODEL_COLORS[model]}`}
                >
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Backlink Intelligence Engine — always visible ── */}
      <BacklinkEngine />

      {!result ? (
        /* Input Form */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Context</CardTitle>
            <CardDescription className="text-xs">
              Pre-filled with platform defaults — adjust as needed. More context
              = more actionable strategy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Business Name
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, businessName: e.target.value }))
                  }
                  data-testid="input-business-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Website URL
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                  }
                  data-testid="input-website-url"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Primary Service
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.primaryService}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryService: e.target.value }))
                  }
                  data-testid="input-primary-service"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Target Audience
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.targetAudience}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetAudience: e.target.value }))
                  }
                  data-testid="input-target-audience"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Target Keywords (comma-separated)
              </label>
              <Input
                className="h-8 text-sm"
                value={form.targetKeywords}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetKeywords: e.target.value }))
                }
                data-testid="input-target-keywords"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Competitors (comma-separated)
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.competitors}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, competitors: e.target.value }))
                  }
                  data-testid="input-competitors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Target Locations (comma-separated)
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.targetLocations}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetLocations: e.target.value }))
                  }
                  data-testid="input-locations"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Ranking Keywords (comma-separated)
                </label>
                <Input
                  className="h-8 text-sm"
                  value={form.currentRankingKeywords}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      currentRankingKeywords: e.target.value,
                    }))
                  }
                  data-testid="input-current-rankings"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Monthly Traffic
                  </label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    placeholder="5000"
                    value={form.currentMonthlyTraffic}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        currentMonthlyTraffic: e.target.value,
                      }))
                    }
                    data-testid="input-monthly-traffic"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Review Count
                  </label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    placeholder="24"
                    value={form.googleReviewCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        googleReviewCount: e.target.value,
                      }))
                    }
                    data-testid="input-review-count"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Avg Rating
                  </label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.8"
                    value={form.averageRating}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, averageRating: e.target.value }))
                    }
                    data-testid="input-avg-rating"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Biggest SEO Problem Right Now
              </label>
              <Input
                className="h-8 text-sm"
                value={form.biggestSEOProblem}
                onChange={(e) =>
                  setForm((f) => ({ ...f, biggestSEOProblem: e.target.value }))
                }
                data-testid="input-seo-problem"
              />
            </div>

            {/* Extended context fields */}
            <div className="pt-1 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Extended Context (for richer report)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Unique Selling Proposition
                  </label>
                  <Input
                    className="h-8 text-sm"
                    value={form.uniqueSellingProposition}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        uniqueSellingProposition: e.target.value,
                      }))
                    }
                    data-testid="input-usp"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Conversion Goal
                  </label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="e.g. Free trial → paid subscription"
                    value={form.conversionGoal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, conversionGoal: e.target.value }))
                    }
                    data-testid="input-conversion-goal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Target Countries (comma-sep)
                  </label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="UK, India, Nigeria, UAE"
                    value={form.targetCountries}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetCountries: e.target.value,
                      }))
                    }
                    data-testid="input-target-countries"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Social Media Channels
                  </label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="LinkedIn, Twitter/X, YouTube"
                    value={form.socialMediaChannels}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        socialMediaChannels: e.target.value,
                      }))
                    }
                    data-testid="input-social-channels"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Top Performing Pages
                  </label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="/blog/guide, /tools/checker"
                    value={form.topPerformingPages}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        topPerformingPages: e.target.value,
                      }))
                    }
                    data-testid="input-top-pages"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Known Technical Issues
                  </label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="slow mobile, no schema, missing alt tags"
                    value={form.knownTechnicalIssues}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        knownTechnicalIssues: e.target.value,
                      }))
                    }
                    data-testid="input-tech-issues"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Domain Authority
                  </label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="25"
                    value={form.domainAuthority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        domainAuthority: e.target.value,
                      }))
                    }
                    data-testid="input-da"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Backlinks
                  </label>
                  <Input
                    className="h-8 text-sm"
                    type="number"
                    placeholder="500"
                    value={form.estimatedBacklinks}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        estimatedBacklinks: e.target.value,
                      }))
                    }
                    data-testid="input-backlinks"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Publishing Freq.
                  </label>
                  <select
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={form.publishingFrequency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        publishingFrequency: e.target.value,
                      }))
                    }
                    data-testid="select-publish-freq"
                  >
                    <option value="daily">Daily</option>
                    <option value="2x-week">2x / week</option>
                    <option value="weekly">Weekly</option>
                    <option value="2x-month">2x / month</option>
                    <option value="monthly">Monthly</option>
                    <option value="rarely">Rarely</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Business Stage
                  </label>
                  <select
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    value={form.businessStage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, businessStage: e.target.value }))
                    }
                    data-testid="select-business-stage"
                  >
                    <option value="startup">Startup</option>
                    <option value="growing">Growing</option>
                    <option value="established">Established</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              data-testid="button-generate-strategy"
            >
              {mutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Quad-AI Analysis (60–90 seconds)…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Generate PhD-Level SEO Strategy
                </>
              )}
            </Button>

            {mutation.isPending && (
              <div className="flex items-center justify-center gap-6 p-3 bg-muted/50 rounded-md">
                {[
                  { label: "Gemini", color: "text-blue-600" },
                  { label: "GPT-4o", color: "text-green-600" },
                  { label: "Claude", color: "text-purple-600" },
                  { label: "Qwen", color: "text-orange-600" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <Cpu className={`w-3.5 h-3.5 animate-pulse ${m.color}`} />
                    <span className={`text-xs font-semibold ${m.color}`}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Results Dashboard */
        <div className="space-y-4">
          {/* Score Overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>SEO Health Scores</CardTitle>
                  <CardDescription>
                    Generated {new Date(result.generatedAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-4xl font-black text-primary">
                    {result.overallScore.overall}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    /100
                    <br />
                    Overall
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap justify-around gap-6">
                <ScoreRing
                  score={result.overallScore.technical}
                  label="Technical"
                  color="text-green-500"
                />
                <ScoreRing
                  score={result.overallScore.content}
                  label="Content"
                  color="text-blue-500"
                />
                <ScoreRing
                  score={result.overallScore.authority}
                  label="Authority"
                  color="text-purple-500"
                />
                <ScoreRing
                  score={result.overallScore.local}
                  label="Local SEO"
                  color="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Technical",
                    value: result.overallScore.technical,
                    color: "bg-green-500",
                  },
                  {
                    label: "Content",
                    value: result.overallScore.content,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Authority",
                    value: result.overallScore.authority,
                    color: "bg-purple-500",
                  },
                  {
                    label: "Local SEO",
                    value: result.overallScore.local,
                    color: "bg-orange-500",
                  },
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium">{s.value}%</span>
                    </div>
                    <Progress value={s.value} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm">{result.executiveSummary}</p>
              </div>
            </CardContent>
          </Card>

          {/* 90-Day Automation Panel */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        90-Day Content Automation
                      </span>
                      {automationData?.plan && (
                        <Badge
                          variant="outline"
                          className={
                            automationData.plan.status === "active"
                              ? "border-green-500 text-green-600"
                              : automationData.plan.status === "paused"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-muted-foreground text-muted-foreground"
                          }
                        >
                          {automationData.plan.status === "active"
                            ? "Active"
                            : automationData.plan.status === "paused"
                              ? "Paused"
                              : "Completed"}
                        </Badge>
                      )}
                    </div>
                    {automationData?.plan ? (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Week {automationData.plan.weekNumber} of 13 —{" "}
                          {automationData.plan.queuedItems} of{" "}
                          {automationData.plan.totalContentItems} posts queued
                          {automationData.plan.nextQueueDate &&
                            automationData.plan.status === "active" && (
                              <>
                                {" "}
                                — next batch{" "}
                                {new Date(
                                  automationData.plan.nextQueueDate,
                                ).toLocaleDateString()}
                              </>
                            )}
                        </p>
                        <Progress
                          value={automationData.plan.progressPct}
                          className="h-1.5 w-64"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Auto-queue content calendar into the blog pipeline — 2-3
                        posts per week for 13 weeks
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {automationData?.plan &&
                  automationData.plan.status !== "completed" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleMutation.mutate({
                            planId: automationData.plan!.id,
                            action:
                              automationData.plan!.status === "active"
                                ? "pause"
                                : "resume",
                          })
                        }
                        disabled={toggleMutation.isPending}
                        data-testid="button-automation-toggle"
                      >
                        {automationData.plan.status === "active" ? (
                          <>
                            <Pause className="w-3.5 h-3.5 mr-1.5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 mr-1.5" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => activateMutation.mutate()}
                        disabled={activateMutation.isPending}
                        data-testid="button-reactivate-automation"
                        title="Replace with new strategy"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-1.5 ${activateMutation.isPending ? "animate-spin" : ""}`}
                        />
                        Replace Plan
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => activateMutation.mutate()}
                      disabled={activateMutation.isPending}
                      data-testid="button-activate-automation"
                    >
                      {activateMutation.isPending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Activating…
                        </>
                      ) : (
                        <>
                          <Rocket className="w-3.5 h-3.5 mr-1.5" />
                          Activate 90-Day Automation
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open("/admin/blog-pipeline", "_blank")
                    }
                    data-testid="button-view-pipeline"
                  >
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                    View Pipeline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="quickwins" className="text-xs">
                Quick Wins
              </TabsTrigger>
              <TabsTrigger value="30day" className="text-xs">
                30-Day
              </TabsTrigger>
              <TabsTrigger value="90day" className="text-xs">
                90-Day
              </TabsTrigger>
              <TabsTrigger value="keywords" className="text-xs">
                Keywords
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs">
                Content
              </TabsTrigger>
              <TabsTrigger value="gbp" className="text-xs">
                GBP
              </TabsTrigger>
              <TabsTrigger value="entity" className="text-xs">
                Entity
              </TabsTrigger>
              <TabsTrigger value="competitor" className="text-xs">
                Competitor Gap
              </TabsTrigger>
              <TabsTrigger value="snippets" className="text-xs">
                Snippets
              </TabsTrigger>
              <TabsTrigger value="international" className="text-xs">
                International
              </TabsTrigger>
              <TabsTrigger value="cro" className="text-xs">
                CRO
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-xs">
                FAQ Library
              </TabsTrigger>
              <TabsTrigger value="copy" className="text-xs">
                Copy
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Critical Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.criticalActions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No critical actions — great baseline!
                      </p>
                    ) : (
                      result.criticalActions.slice(0, 5).map((action, i) => {
                        const id = makeTaskId("critical", i, action.action);
                        return (
                          <ActionCard
                            key={i}
                            action={action}
                            taskId={id}
                            status={statuses[id] || "todo"}
                            onCycle={cycle}
                          />
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Technical SEO Fixes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.technicalSEO.structuredDataGaps
                      .slice(0, 6)
                      .map((fix, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{fix}</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>

              {/* Authority Building Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-purple-500" />
                    Authority Building Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.authorityBuilding.linkBuildingOpportunities
                      .slice(0, 6)
                      .map((opp, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded-md space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {opp.source}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs flex-shrink-0"
                            >
                              {opp.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opp.strategy}
                          </p>
                        </div>
                      ))}
                  </div>
                  {result.authorityBuilding.prOpportunities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">
                        PR Opportunities
                      </p>
                      <div className="space-y-1">
                        {result.authorityBuilding.prOpportunities
                          .slice(0, 4)
                          .map((pr, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                            >
                              <Star className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                              <span>{pr}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Model Contributions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    Model Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.modelContributions).map(
                      ([model, contribution]) => (
                        <div key={model} className="p-3 border rounded-md">
                          <p
                            className={`text-sm font-bold mb-1 capitalize ${MODEL_COLORS[model]}`}
                          >
                            {model === "openai"
                              ? "GPT-4o"
                              : model.charAt(0).toUpperCase() + model.slice(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contribution}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Wins Tab */}
            <TabsContent value="quickwins" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Quick Wins — Implement This Week
                  </CardTitle>
                  <CardDescription>
                    High-impact actions that can be completed within days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(
                      result.quickWins.map((a, i) => {
                        const id = makeTaskId("qw", i, a.action);
                        return [id, statuses[id] || "todo"];
                      }),
                    )}
                    total={result.quickWins.length}
                  />
                  {result.quickWins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No page-2 quick wins identified — baseline ranking data
                      needed for this section.
                    </p>
                  ) : (
                    result.quickWins.map((action, i) => {
                      const id = makeTaskId("qw", i, action.action);
                      return (
                        <ActionCard
                          key={i}
                          action={action}
                          taskId={id}
                          status={statuses[id] || "todo"}
                          onCycle={cycle}
                        />
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 30-Day Plan */}
            <TabsContent value="30day" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    30-Day SEO Sprint
                  </CardTitle>
                  <CardDescription>
                    Week-by-week technical and content priorities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(
                      result.thirtyDayPlan.map((a, i) => {
                        const id = makeTaskId("30d", i, a.action);
                        return [id, statuses[id] || "todo"];
                      }),
                    )}
                    total={result.thirtyDayPlan.length}
                  />
                  {result.thirtyDayPlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      30-day plan not yet generated — regenerate to populate
                      this section.
                    </p>
                  ) : (
                    result.thirtyDayPlan.map((action, i) => {
                      const id = makeTaskId("30d", i, action.action);
                      return (
                        <ActionCard
                          key={i}
                          action={action}
                          taskId={id}
                          status={statuses[id] || "todo"}
                          onCycle={cycle}
                        />
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 90-Day Plan */}
            <TabsContent value="90day" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    90-Day Authority Building Plan
                  </CardTitle>
                  <CardDescription>
                    Content publishing, entity building, link acquisition, and
                    PR — for long-term compounding growth
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(
                      result.ninetyDayPlan.map((a, i) => {
                        const id = makeTaskId("90d", i, a.action);
                        return [id, statuses[id] || "todo"];
                      }),
                    )}
                    total={result.ninetyDayPlan.length}
                  />
                  {result.ninetyDayPlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      90-day plan will populate after Gemini and Claude complete
                      successfully. Regenerate to refresh.
                    </p>
                  ) : (
                    result.ninetyDayPlan.map((action, i) => {
                      const id = makeTaskId("90d", i, action.action);
                      return (
                        <ActionCard
                          key={i}
                          action={action}
                          taskId={id}
                          status={statuses[id] || "todo"}
                          onCycle={cycle}
                        />
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        Keyword Opportunities
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Badge
                            className={INTENT_COLORS["ready-to-hire"]}
                            style={{ fontSize: "10px" }}
                          >
                            ready-to-hire
                          </Badge>{" "}
                          = highest conversion
                        </span>
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Badge
                            className={INTENT_COLORS["solution-aware"]}
                            style={{ fontSize: "10px" }}
                          >
                            solution-aware
                          </Badge>{" "}
                          = evaluation stage
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Badge
                            className={INTENT_COLORS["problem-aware"]}
                            style={{ fontSize: "10px" }}
                          >
                            problem-aware
                          </Badge>{" "}
                          = awareness stage
                        </span>
                      </CardDescription>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Click Blog button to create post
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keywordOpportunities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No keyword opportunities yet — regenerate for full
                        results.
                      </p>
                    ) : (
                      result.keywordOpportunities.map((kw, i) => (
                        <KeywordCard
                          key={i}
                          kw={kw}
                          onGenerateBlog={handleGenerateBlog}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Calendar Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Content Calendar
                  </CardTitle>
                  <CardDescription>
                    Prioritised content production plan from Qwen + Claude —
                    click "Generate" to create each post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.contentCalendar.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Content calendar will populate after Claude and Qwen
                      complete. Regenerate to refresh.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {result.contentCalendar.map((piece, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded-md bg-card space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {piece.weekNumber && (
                                <Badge
                                  variant="outline"
                                  style={{ fontSize: "10px" }}
                                >
                                  Week {piece.weekNumber}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                style={{ fontSize: "10px" }}
                                className="capitalize"
                              >
                                {piece.type.replace("-", " ")}
                              </Badge>
                              <Badge
                                variant="outline"
                                style={{ fontSize: "10px" }}
                              >
                                {piece.wordCount} words
                              </Badge>
                            </div>
                            {(piece.type === "blog" ||
                              piece.type === "faq") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2"
                                onClick={() =>
                                  handleGenerateBlog(piece.targetKeyword)
                                }
                              >
                                <PenLine className="w-3 h-3 mr-1" />
                                Generate
                              </Button>
                            )}
                          </div>
                          <p className="text-sm font-medium">{piece.title}</p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Target keyword:</strong>{" "}
                            {piece.targetKeyword}
                          </p>
                          {piece.outline.length > 0 && (
                            <div className="space-y-1">
                              {piece.outline.slice(0, 4).map((section, j) => (
                                <div
                                  key={j}
                                  className="flex items-start gap-2 text-xs text-muted-foreground"
                                >
                                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{section}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* GBP Strategy Tab */}
            <TabsContent value="gbp" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      GBP Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.gbpStrategy.categoryRecommendations.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Requires Gemini — will populate after next regeneration.
                      </p>
                    ) : (
                      result.gbpStrategy.categoryRecommendations.map(
                        (cat, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                          >
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-500" />
                            <span>{cat}</span>
                          </div>
                        ),
                      )
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Attributes to Add
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.gbpStrategy.attributesToAdd.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Requires Gemini — will populate after next regeneration.
                      </p>
                    ) : (
                      result.gbpStrategy.attributesToAdd.map((attr, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-500" />
                          <span>{attr}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* GBP Descriptions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    GBP Description Versions (A/B test these)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.gbpStrategy.descriptionVersions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Gemini writes these — will populate after next
                      regeneration with the fixed model.
                    </p>
                  ) : (
                    result.gbpStrategy.descriptionVersions.map((desc, i) => (
                      <div key={i} className="p-3 border rounded-md bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">Version {i + 1}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {desc.length} chars
                          </span>
                        </div>
                        <p className="text-sm">{desc}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Photo Strategy */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-500" />
                    Photo Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{result.gbpStrategy.photoStrategy}</p>
                </CardContent>
              </Card>

              {/* GBP Posting Calendar */}
              {result.gbpStrategy.postingCalendar.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      GBP Posting Calendar (8 weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.gbpStrategy.postingCalendar
                      .slice(0, 12)
                      .map((post, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded-md bg-card space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Week {post.week}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {post.type}
                            </Badge>
                            <span className="text-xs font-medium">
                              {post.topic}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {post.copy}
                          </p>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Entity Tab */}
            <TabsContent value="entity" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Schema Markup Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.entityOptimization.schemaRecommendations.map(
                      (rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{rec}</span>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Citation Audit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.entityOptimization.citationAuditFindings.map(
                      (finding, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                          <span>{finding}</span>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    Knowledge Panel Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {result.entityOptimization.knowledgePanelStrategy}
                  </p>
                  <div className="mt-3 space-y-2">
                    {result.entityOptimization.entityBuildingSteps.map(
                      (step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                        >
                          <span className="w-5 h-5 flex-shrink-0 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Verification Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {result.verificationNotes}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competitor Gap Tab */}
            <TabsContent value="competitor" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-500" />
                      Content Gaps vs Competitors
                    </CardTitle>
                    <CardDescription>
                      Topics competitors rank for that you should create
                      immediately
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(result.competitorGap?.topicGaps || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Regenerate to populate competitor gap analysis.
                      </p>
                    ) : (
                      (result.competitorGap?.topicGaps || []).map((gap, i) => (
                        <div
                          key={i}
                          className="p-2 border rounded-md space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              {gap.topic}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              {gap.competitorRanking}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {gap.yourAction}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs px-2"
                            onClick={() => handleGenerateBlog(gap.topic)}
                            data-testid={`button-blog-gap-${i}`}
                          >
                            <PenLine className="w-3 h-3 mr-1" />
                            Write This
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Differentiation Angles
                      </CardTitle>
                      <CardDescription>
                        Unique positions your competitors don't own
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(result.competitorGap?.differentiationAngles || []).map(
                        (angle, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            <span>{angle}</span>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Keyword Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5">
                      {(result.competitorGap?.keywordGaps || []).map(
                        (kw, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs cursor-pointer"
                            onClick={() => handleGenerateBlog(kw)}
                            data-testid={`badge-kw-gap-${i}`}
                          >
                            {kw}
                          </Badge>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Featured Snippets Tab */}
            <TabsContent value="snippets" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Position Zero Opportunities
                    </CardTitle>
                    <CardDescription>
                      Specific queries to target for featured snippet capture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(result.featuredSnippets?.opportunities || []).length ===
                    0 ? (
                      <p className="text-sm text-muted-foreground">
                        Regenerate to populate featured snippet opportunities.
                      </p>
                    ) : (
                      (result.featuredSnippets?.opportunities || []).map(
                        (opp, i) => (
                          <div
                            key={i}
                            className="p-2 border rounded-md space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {opp.snippetType}
                              </Badge>
                              <span className="text-sm font-medium">
                                {opp.query}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {opp.contentFormat}
                            </p>
                            {opp.answer && (
                              <p className="text-xs p-1.5 bg-muted/50 rounded italic">
                                "{opp.answer}"
                              </p>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => handleGenerateBlog(opp.query)}
                              data-testid={`button-snippet-${i}`}
                            >
                              <PenLine className="w-3 h-3 mr-1" />
                              Create Content
                            </Button>
                          </div>
                        ),
                      )
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Voice & AI Search Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {(
                        result.featuredSnippets?.voiceSearchQuestions || []
                      ).map((q, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-1.5 bg-muted/50 rounded text-sm"
                        >
                          <span className="text-muted-foreground shrink-0">
                            Q:
                          </span>
                          <span className="flex-1">{q}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs px-1.5 shrink-0"
                            onClick={() => handleGenerateBlog(q)}
                            data-testid={`button-voice-${i}`}
                          >
                            <PenLine className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        People Also Ask
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {(result.featuredSnippets?.peopleAlsoAsk || []).map(
                        (q, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-1.5 border rounded text-sm"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="flex-1">{q}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-1.5 shrink-0"
                              onClick={() => handleGenerateBlog(q)}
                              data-testid={`button-paa-${i}`}
                            >
                              <PenLine className="w-3 h-3" />
                            </Button>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* International SEO Tab */}
            <TabsContent value="international" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Country Strategy
                    </CardTitle>
                    <CardDescription>
                      Priority markets and localisation actions per country
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(result.internationalSEO?.countryStrategy || []).length ===
                    0 ? (
                      <p className="text-sm text-muted-foreground">
                        Populate Target Countries in the form and regenerate.
                      </p>
                    ) : (
                      (result.internationalSEO?.countryStrategy || []).map(
                        (cs, i) => (
                          <div key={i} className="p-2 border rounded-md">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span className="font-semibold text-sm">
                                {cs.country}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {cs.language}
                              </Badge>
                              <Badge
                                className={`text-xs ${cs.priority === "high" ? "bg-red-100 text-red-700" : cs.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}
                              >
                                {cs.priority}
                              </Badge>
                            </div>
                            <ul className="space-y-0.5">
                              {(cs.keyActions || []).map((action, j) => (
                                <li
                                  key={j}
                                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ),
                      )
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Hreflang Implementation
                    </CardTitle>
                    <CardDescription>
                      Technical setup for international targeting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(
                      result.internationalSEO?.hreflangRecommendations || []
                    ).map((rec, i) => (
                      <div
                        key={i}
                        className="p-2 bg-muted/50 rounded text-xs font-mono"
                      >
                        {rec}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CRO Tab */}
            <TabsContent value="cro" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Landing Page CRO
                    </CardTitle>
                    <CardDescription>
                      Specific conversion improvements per page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(result.cro?.landingPageRecommendations || []).length ===
                    0 ? (
                      <p className="text-sm text-muted-foreground">
                        Add Top Performing Pages to the form and regenerate.
                      </p>
                    ) : (
                      (result.cro?.landingPageRecommendations || []).map(
                        (rec, i) => (
                          <div
                            key={i}
                            className="p-2 border rounded-md space-y-1"
                          >
                            <span className="text-xs font-medium text-primary">
                              {rec.page}
                            </span>
                            <p className="text-xs text-red-600">
                              <strong>Issue:</strong> {rec.issue}
                            </p>
                            <p className="text-xs text-green-700">
                              <strong>Fix:</strong> {rec.fix}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>Impact:</strong> {rec.expectedImpact}
                            </p>
                          </div>
                        ),
                      )
                    )}
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        CTA Optimisation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {(result.cro?.ctaOptimisation || []).map((cta, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-1.5 bg-muted/50 rounded text-sm"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                          <span>{cta}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Trust Signals to Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {(result.cro?.trustSignals || []).map((ts, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-1.5 bg-muted/50 rounded text-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          <span>{ts}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Funnel Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5">
                      {(result.cro?.funnelImprovements || []).map((fi, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-1.5 border rounded text-sm"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span>{fi}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* FAQ Library Tab */}
            <TabsContent value="faq" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      FAQ Library ({(result.faqLibrary || []).length} questions)
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Schema-ready answers
                    </Badge>
                  </div>
                  <CardDescription>
                    Production-ready Q&As — copy into your FAQ pages with
                    JSON-LD schema markup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(result.faqLibrary || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Regenerate to populate the FAQ library from Claude.
                    </p>
                  ) : (
                    (result.faqLibrary || []).map((faq, i) => (
                      <div key={i} className="p-2 border rounded-md">
                        <p className="text-sm font-medium text-primary mb-1">
                          Q: {faq.question}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          A: {faq.answer}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1.5 h-6 text-xs px-2"
                          onClick={() => handleGenerateBlog(faq.question)}
                          data-testid={`button-faq-blog-${i}`}
                        >
                          <PenLine className="w-3 h-3 mr-1" />
                          Expand into post
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Copy Tab (Homepage + Meta Tags) */}
            <TabsContent value="copy" className="space-y-4 mt-4">
              {result.homepageCopy?.headline && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Homepage Copy (Rewrite)
                    </CardTitle>
                    <CardDescription>
                      Production-ready copy generated by Qwen — paste directly
                      into your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Headline
                        </p>
                        <p className="text-sm font-bold">
                          {result.homepageCopy.headline}
                        </p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Subheadline
                        </p>
                        <p className="text-sm">
                          {result.homepageCopy.subheadline}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 border rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        CTA Text
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {result.homepageCopy.ctaText}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Value Proposition
                      </p>
                      <p className="text-sm">{result.homepageCopy.valueProp}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Services Overview
                      </p>
                      <p className="text-sm">
                        {result.homepageCopy.servicesOverview}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Social Proof
                      </p>
                      <p className="text-sm">
                        {result.homepageCopy.socialProof}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(result.metaTags || []).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" />
                      Optimised Meta Tags ({result.metaTags.length} pages)
                    </CardTitle>
                    <CardDescription>
                      Ready-to-deploy title tags and meta descriptions for your
                      top pages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.metaTags.map((mt, i) => (
                      <div key={i} className="p-2 border rounded-md space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {mt.page}
                        </span>
                        <p className="text-sm font-medium">{mt.titleTag}</p>
                        <p className="text-xs text-muted-foreground">
                          {mt.metaDescription}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.authorityBuilding?.reviewRequestScript && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Review Request Script
                    </CardTitle>
                    <CardDescription>
                      Send this to clients after service delivery to build
                      keyword-rich reviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-muted/50 rounded text-sm whitespace-pre-wrap">
                      {result.authorityBuilding.reviewRequestScript}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.authorityBuilding?.reviewResponseTemplates?.fiveStar && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Review Response Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        label: "5-Star Response",
                        text: result.authorityBuilding.reviewResponseTemplates
                          .fiveStar,
                        color: "text-green-600",
                      },
                      {
                        label: "4-Star Response",
                        text: result.authorityBuilding.reviewResponseTemplates
                          .fourStar,
                        color: "text-blue-600",
                      },
                      {
                        label: "3-Star Response",
                        text: result.authorityBuilding.reviewResponseTemplates
                          .threeStar,
                        color: "text-yellow-600",
                      },
                      {
                        label: "1-2 Star Response",
                        text: result.authorityBuilding.reviewResponseTemplates
                          .oneTwo,
                        color: "text-red-600",
                      },
                    ].map(({ label, text, color }) =>
                      text ? (
                        <div key={label}>
                          <p className={`text-xs font-semibold ${color} mb-1`}>
                            {label}
                          </p>
                          <div className="p-2 bg-muted/50 rounded text-sm">
                            {text}
                          </div>
                        </div>
                      ) : null,
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
