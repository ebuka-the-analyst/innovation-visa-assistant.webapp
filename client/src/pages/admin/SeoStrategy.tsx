import { useState, useCallback, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Zap, TrendingUp, Globe, BookOpen, Building2, Star,
  Target, AlertTriangle, CheckCircle2, Clock, BarChart3, Link2,
  FileText, Calendar, Cpu, ChevronRight, Download, RefreshCw,
  Award, MapPin, MessageSquare, Camera, Circle, PlayCircle, ExternalLink,
  PenLine, ListChecks, Bot, Pause, Play, Rocket, CalendarDays
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
  overallScore: { technical: number; content: number; authority: number; local: number; overall: number };
  criticalActions: SEOAction[];
  quickWins: SEOAction[];
  thirtyDayPlan: SEOAction[];
  ninetyDayPlan: SEOAction[];
  contentCalendar: ContentPiece[];
  keywordOpportunities: KeywordOpportunity[];
  entityOptimization: { schemaRecommendations: string[]; entityBuildingSteps: string[]; knowledgePanelStrategy: string; citationAuditFindings: string[] };
  gbpStrategy: { categoryRecommendations: string[]; descriptionVersions: string[]; postingCalendar: { week: number; topic: string; type: string; copy: string }[]; attributesToAdd: string[]; photoStrategy: string };
  technicalSEO: { coreWebVitals: string[]; structuredDataGaps: string[]; internalLinkingOpportunities: string[]; pageSpeedRecommendations: string[] };
  authorityBuilding: { linkBuildingOpportunities: { source: string; type: string; strategy: string }[]; prOpportunities: string[]; partnershipOpportunities: string[] };
  verificationNotes: string;
  modelContributions: { gemini: string; openai: string; claude: string; qwen: string };
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

const INTENT_COLORS: Record<string, string> = {
  "ready-to-hire": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "solution-aware": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "problem-aware": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "research": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const EFFORT_LABELS: Record<string, string> = {
  "quick-win": "Quick Win",
  "week": "1 Week",
  "month": "1 Month",
  "quarter": "3 Months",
};

const MODEL_COLORS: Record<string, string> = {
  gemini: "text-blue-600 dark:text-blue-400",
  openai: "text-green-600 dark:text-green-400",
  claude: "text-purple-600 dark:text-purple-400",
  qwen: "text-orange-600 dark:text-orange-400",
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
          <circle
            cx="40" cy="40" r="34" fill="none" strokeWidth="8"
            stroke="currentColor"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{score}</span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

type TaskStatus = "todo" | "in-progress" | "done";

function useTaskTracker(storageKey: string) {
  const load = (): Record<string, TaskStatus> => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  };
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>(load);
  const cycle = useCallback((id: string) => {
    setStatuses(prev => {
      const next = { ...prev };
      const cur = next[id] || "todo";
      next[id] = cur === "todo" ? "in-progress" : cur === "in-progress" ? "done" : "todo";
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);
  return { statuses, cycle };
}

const STATUS_CONFIG: Record<TaskStatus, { icon: ReactNode; label: string; cls: string }> = {
  "todo":        { icon: <Circle className="w-4 h-4" />,       label: "To Do",       cls: "text-muted-foreground" },
  "in-progress": { icon: <PlayCircle className="w-4 h-4" />,   label: "In Progress", cls: "text-yellow-500" },
  "done":        { icon: <CheckCircle2 className="w-4 h-4" />, label: "Done",        cls: "text-green-500" },
};

function ActionCard({ action, taskId, status, onCycle }: {
  action: SEOAction;
  taskId: string;
  status: TaskStatus;
  onCycle: (id: string) => void;
}) {
  const st = STATUS_CONFIG[status];
  return (
    <div className={`flex gap-3 p-3 border rounded-md bg-card transition-opacity ${status === "done" ? "opacity-60" : ""}`}>
      <button
        onClick={() => onCycle(taskId)}
        className={`flex-shrink-0 mt-0.5 ${st.cls} hover:opacity-70 transition-opacity`}
        title={`Status: ${st.label} — click to advance`}
      >
        {st.icon}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <Badge className={PRIORITY_COLORS[action.priority]} style={{fontSize:"10px"}}>{action.priority.toUpperCase()}</Badge>
          <Badge variant="outline" style={{fontSize:"10px"}}>{action.category}</Badge>
          <Badge variant="outline" style={{fontSize:"10px"}}>
            <Clock className="w-2.5 h-2.5 mr-1" />{EFFORT_LABELS[action.effort]}
          </Badge>
          <Badge
            variant="outline"
            style={{fontSize:"10px"}}
            className={`${st.cls} cursor-pointer`}
            onClick={() => onCycle(taskId)}
          >
            {st.label}
          </Badge>
        </div>
        <p className={`text-sm font-medium mb-0.5 ${status === "done" ? "line-through" : ""}`}>{action.action}</p>
        <p className="text-xs text-muted-foreground">{action.impact}</p>
        {action.metric && <p className="text-xs text-muted-foreground mt-0.5"><strong>Measure:</strong> {action.metric}</p>}
      </div>
    </div>
  );
}

function TaskProgressBar({ statuses, total }: { statuses: Record<string, TaskStatus>; total: number }) {
  const done = Object.values(statuses).filter(s => s === "done").length;
  const inProgress = Object.values(statuses).filter(s => s === "in-progress").length;
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
      <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{done} done · {inProgress} in progress · {total - done - inProgress} to do</span>
          <span>{Math.round((done / total) * 100)}% complete</span>
        </div>
        <Progress value={(done / total) * 100} className="h-1.5" />
      </div>
    </div>
  );
}

function KeywordCard({ kw, onGenerateBlog }: { kw: KeywordOpportunity; onGenerateBlog: (keyword: string) => void }) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-md bg-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{kw.keyword}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{kw.pageRecommendation}</p>
      </div>
      <div className="flex flex-col gap-1 items-end flex-shrink-0">
        <Badge className={INTENT_COLORS[kw.intent]} style={{fontSize:"10px"}}>{kw.intent.replace("-", " ")}</Badge>
        <Badge variant="outline" style={{fontSize:"10px"}}>{kw.difficulty} difficulty</Badge>
        <Badge variant="outline" style={{fontSize:"10px"}}>{kw.action === "create-new" ? "New Page" : "Optimise"}</Badge>
        {kw.action === "create-new" && (
          <Button size="sm" variant="outline" className="h-6 text-xs px-2 mt-0.5" onClick={() => onGenerateBlog(kw.keyword)}>
            <PenLine className="w-3 h-3 mr-1" />Blog
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

export default function SeoStrategy() {
  const { toast } = useToast();
  const [result, setResult] = useState<SEOStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { statuses, cycle } = useTaskTracker("seo-strategy-tasks");

  // Automation status polling
  const { data: automationData, refetch: refetchAutomation } = useQuery<{
    active: boolean; plan?: AutomationPlan;
  }>({
    queryKey: ["/api/seo/automation-status"],
    refetchInterval: 15000,
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!result) throw new Error("No strategy to activate");
      const res = await apiRequest("POST", "/api/seo/activate-automation", result);
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
      toast({ title: "Activation Failed", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ planId, action }: { planId: string; action: "pause" | "resume" }) => {
      const res = await apiRequest("POST", "/api/seo/automation-toggle", { planId, action });
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
    toast({ title: "Opening Blog Creator", description: `Pre-filling blog post for: "${keyword}"` });
  };

  const makeTaskId = (prefix: string, i: number, action: string) =>
    `${prefix}-${i}-${action.slice(0, 30).replace(/\s/g, "-")}`;

  const [form, setForm] = useState({
    businessName: "UK Innovator Founder Visa Assistant",
    websiteUrl: "https://innovatorfoundervisaassistant.co.uk",
    primaryService: "UK Innovator Founder Visa guidance and AI-powered visa application tools",
    targetKeywords: "UK Innovator Founder Visa, UK entrepreneur visa, UK business visa, endorsing body UK, UK visa for entrepreneurs",
    targetAudience: "International entrepreneurs and founders seeking to live and work in the UK through the Innovator Founder Visa route",
    competitors: "ukbf.com, bizadvice.co.uk, sableinternational.com, workpermit.com",
    targetLocations: "London, UK, Global",
    currentMonthlyTraffic: "",
    googleReviewCount: "",
    averageRating: "",
    currentRankingKeywords: "UK Innovator Founder Visa, innovator founder visa assistant",
    biggestSEOProblem: "Low organic traffic despite strong tool offering — need to establish topical authority in the UK visa niche",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const ctx = {
        businessName: form.businessName,
        websiteUrl: form.websiteUrl,
        primaryService: form.primaryService,
        targetKeywords: form.targetKeywords.split(",").map(s => s.trim()).filter(Boolean),
        targetAudience: form.targetAudience,
        competitors: form.competitors.split(",").map(s => s.trim()).filter(Boolean),
        targetLocations: form.targetLocations.split(",").map(s => s.trim()).filter(Boolean),
        currentMonthlyTraffic: form.currentMonthlyTraffic ? Number(form.currentMonthlyTraffic) : undefined,
        googleReviewCount: form.googleReviewCount ? Number(form.googleReviewCount) : undefined,
        averageRating: form.averageRating ? Number(form.averageRating) : undefined,
        currentRankingKeywords: form.currentRankingKeywords.split(",").map(s => s.trim()).filter(Boolean),
        biggestSEOProblem: form.biggestSEOProblem,
      };
      const res = await apiRequest("POST", "/api/seo/strategy", ctx);
      const data = await res.json();
      return data as SEOStrategyResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setActiveTab("overview");
      toast({ title: "SEO Strategy Ready", description: "Quad-AI analysis complete. Your PhD-level SEO strategy has been generated." });
    },
    onError: (err: Error) => {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
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
            Quad-AI analysis: Gemini + GPT-4o + Claude + Qwen working in parallel across all 4 SEO pillars
          </p>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button variant="outline" onClick={downloadStrategy} data-testid="button-download-strategy">
                <Download className="w-4 h-4 mr-2" />Export JSON
              </Button>
              <Button variant="outline" onClick={() => setResult(null)} data-testid="button-new-analysis">
                <RefreshCw className="w-4 h-4 mr-2" />New Analysis
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
              { model: "gemini", icon: Globe, label: "Gemini", role: "Local SEO + GBP strategy" },
              { model: "openai", icon: BarChart3, label: "GPT-4o", role: "Technical SEO + Keywords" },
              { model: "claude", icon: Award, label: "Claude", role: "Content + Entity + Authority" },
              { model: "qwen", icon: FileText, label: "Qwen", role: "Content production + GBP posts" },
            ].map(({ model, icon: Icon, label, role }) => (
              <div key={model} className="flex items-center gap-2">
                <Cpu className={`w-3.5 h-3.5 ${MODEL_COLORS[model]}`} />
                <span className={`text-sm font-semibold ${MODEL_COLORS[model]}`}>{label}</span>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!result ? (
        /* Input Form */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Context</CardTitle>
            <CardDescription className="text-xs">
              Pre-filled with platform defaults — adjust as needed. More context = more actionable strategy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Business Name</label>
                <Input className="h-8 text-sm" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} data-testid="input-business-name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Website URL</label>
                <Input className="h-8 text-sm" value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} data-testid="input-website-url" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Primary Service</label>
                <Input className="h-8 text-sm" value={form.primaryService} onChange={e => setForm(f => ({ ...f, primaryService: e.target.value }))} data-testid="input-primary-service" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
                <Input className="h-8 text-sm" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))} data-testid="input-target-audience" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Target Keywords (comma-separated)</label>
              <Input className="h-8 text-sm" value={form.targetKeywords} onChange={e => setForm(f => ({ ...f, targetKeywords: e.target.value }))} data-testid="input-target-keywords" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Competitors (comma-separated)</label>
                <Input className="h-8 text-sm" value={form.competitors} onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))} data-testid="input-competitors" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Target Locations (comma-separated)</label>
                <Input className="h-8 text-sm" value={form.targetLocations} onChange={e => setForm(f => ({ ...f, targetLocations: e.target.value }))} data-testid="input-locations" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Ranking Keywords (comma-separated)</label>
                <Input className="h-8 text-sm" value={form.currentRankingKeywords} onChange={e => setForm(f => ({ ...f, currentRankingKeywords: e.target.value }))} data-testid="input-current-rankings" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Monthly Traffic</label>
                  <Input className="h-8 text-sm" type="number" placeholder="5000" value={form.currentMonthlyTraffic} onChange={e => setForm(f => ({ ...f, currentMonthlyTraffic: e.target.value }))} data-testid="input-monthly-traffic" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Review Count</label>
                  <Input className="h-8 text-sm" type="number" placeholder="24" value={form.googleReviewCount} onChange={e => setForm(f => ({ ...f, googleReviewCount: e.target.value }))} data-testid="input-review-count" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Avg Rating</label>
                  <Input className="h-8 text-sm" type="number" step="0.1" min="1" max="5" placeholder="4.8" value={form.averageRating} onChange={e => setForm(f => ({ ...f, averageRating: e.target.value }))} data-testid="input-avg-rating" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Biggest SEO Problem Right Now</label>
              <Input className="h-8 text-sm" value={form.biggestSEOProblem} onChange={e => setForm(f => ({ ...f, biggestSEOProblem: e.target.value }))} data-testid="input-seo-problem" />
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
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <Cpu className={`w-3.5 h-3.5 animate-pulse ${m.color}`} />
                    <span className={`text-xs font-semibold ${m.color}`}>{m.label}</span>
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
                  <CardDescription>Generated {new Date(result.generatedAt).toLocaleString()}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-4xl font-black text-primary">{result.overallScore.overall}</div>
                  <div className="text-sm text-muted-foreground">/100<br/>Overall</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap justify-around gap-6">
                <ScoreRing score={result.overallScore.technical} label="Technical" color="text-green-500" />
                <ScoreRing score={result.overallScore.content} label="Content" color="text-blue-500" />
                <ScoreRing score={result.overallScore.authority} label="Authority" color="text-purple-500" />
                <ScoreRing score={result.overallScore.local} label="Local SEO" color="text-orange-500" />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Technical", value: result.overallScore.technical, color: "bg-green-500" },
                  { label: "Content", value: result.overallScore.content, color: "bg-blue-500" },
                  { label: "Authority", value: result.overallScore.authority, color: "bg-purple-500" },
                  { label: "Local SEO", value: result.overallScore.local, color: "bg-orange-500" },
                ].map(s => (
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
                      <span className="font-semibold text-sm">90-Day Content Automation</span>
                      {automationData?.plan && (
                        <Badge variant="outline" className={
                          automationData.plan.status === "active" ? "border-green-500 text-green-600" :
                          automationData.plan.status === "paused" ? "border-yellow-500 text-yellow-600" :
                          "border-muted-foreground text-muted-foreground"
                        }>
                          {automationData.plan.status === "active" ? "Active" :
                           automationData.plan.status === "paused" ? "Paused" : "Completed"}
                        </Badge>
                      )}
                    </div>
                    {automationData?.plan ? (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Week {automationData.plan.weekNumber} of 13 — {automationData.plan.queuedItems} of {automationData.plan.totalContentItems} posts queued
                          {automationData.plan.nextQueueDate && automationData.plan.status === "active" && (
                            <> — next batch {new Date(automationData.plan.nextQueueDate).toLocaleDateString()}</>
                          )}
                        </p>
                        <Progress value={automationData.plan.progressPct} className="h-1.5 w-64" />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Auto-queue content calendar into the blog pipeline — 2-3 posts per week for 13 weeks
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {automationData?.plan && automationData.plan.status !== "completed" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMutation.mutate({
                          planId: automationData.plan!.id,
                          action: automationData.plan!.status === "active" ? "pause" : "resume",
                        })}
                        disabled={toggleMutation.isPending}
                        data-testid="button-automation-toggle"
                      >
                        {automationData.plan.status === "active" ? (
                          <><Pause className="w-3.5 h-3.5 mr-1.5" />Pause</>
                        ) : (
                          <><Play className="w-3.5 h-3.5 mr-1.5" />Resume</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => activateMutation.mutate()}
                        disabled={activateMutation.isPending}
                        data-testid="button-reactivate-automation"
                        title="Replace with new strategy"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${activateMutation.isPending ? "animate-spin" : ""}`} />
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
                        <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Activating…</>
                      ) : (
                        <><Rocket className="w-3.5 h-3.5 mr-1.5" />Activate 90-Day Automation</>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("/admin/blog-pipeline", "_blank")}
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
            <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="quickwins" className="text-xs">Quick Wins</TabsTrigger>
              <TabsTrigger value="30day" className="text-xs">30-Day Plan</TabsTrigger>
              <TabsTrigger value="90day" className="text-xs">90-Day Plan</TabsTrigger>
              <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
              <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
              <TabsTrigger value="gbp" className="text-xs">GBP</TabsTrigger>
              <TabsTrigger value="entity" className="text-xs">Entity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />Critical Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.criticalActions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No critical actions — great baseline!</p>
                    ) : result.criticalActions.slice(0, 5).map((action, i) => {
                      const id = makeTaskId("critical", i, action.action);
                      return <ActionCard key={i} action={action} taskId={id} status={statuses[id] || "todo"} onCycle={cycle} />;
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />Technical SEO Fixes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.technicalSEO.structuredDataGaps.slice(0, 6).map((fix, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
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
                    <Link2 className="w-4 h-4 text-purple-500" />Authority Building Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.authorityBuilding.linkBuildingOpportunities.slice(0, 6).map((opp, i) => (
                      <div key={i} className="p-3 border rounded-md space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{opp.source}</p>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{opp.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{opp.strategy}</p>
                      </div>
                    ))}
                  </div>
                  {result.authorityBuilding.prOpportunities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">PR Opportunities</p>
                      <div className="space-y-1">
                        {result.authorityBuilding.prOpportunities.slice(0, 4).map((pr, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
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
                    <Cpu className="w-4 h-4 text-primary" />Model Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.modelContributions).map(([model, contribution]) => (
                      <div key={model} className="p-3 border rounded-md">
                        <p className={`text-sm font-bold mb-1 capitalize ${MODEL_COLORS[model]}`}>{model === "openai" ? "GPT-4o" : model.charAt(0).toUpperCase() + model.slice(1)}</p>
                        <p className="text-xs text-muted-foreground">{contribution}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Wins Tab */}
            <TabsContent value="quickwins" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />Quick Wins — Implement This Week
                  </CardTitle>
                  <CardDescription>High-impact actions that can be completed within days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(result.quickWins.map((a, i) => {
                      const id = makeTaskId("qw", i, a.action);
                      return [id, statuses[id] || "todo"];
                    }))}
                    total={result.quickWins.length}
                  />
                  {result.quickWins.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No page-2 quick wins identified — baseline ranking data needed for this section.</p>
                  ) : result.quickWins.map((action, i) => {
                    const id = makeTaskId("qw", i, action.action);
                    return <ActionCard key={i} action={action} taskId={id} status={statuses[id] || "todo"} onCycle={cycle} />;
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 30-Day Plan */}
            <TabsContent value="30day" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />30-Day SEO Sprint
                  </CardTitle>
                  <CardDescription>Week-by-week technical and content priorities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(result.thirtyDayPlan.map((a, i) => {
                      const id = makeTaskId("30d", i, a.action);
                      return [id, statuses[id] || "todo"];
                    }))}
                    total={result.thirtyDayPlan.length}
                  />
                  {result.thirtyDayPlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">30-day plan not yet generated — regenerate to populate this section.</p>
                  ) : result.thirtyDayPlan.map((action, i) => {
                    const id = makeTaskId("30d", i, action.action);
                    return <ActionCard key={i} action={action} taskId={id} status={statuses[id] || "todo"} onCycle={cycle} />;
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 90-Day Plan */}
            <TabsContent value="90day" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />90-Day Authority Building Plan
                  </CardTitle>
                  <CardDescription>Content publishing, entity building, link acquisition, and PR — for long-term compounding growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskProgressBar
                    statuses={Object.fromEntries(result.ninetyDayPlan.map((a, i) => {
                      const id = makeTaskId("90d", i, a.action);
                      return [id, statuses[id] || "todo"];
                    }))}
                    total={result.ninetyDayPlan.length}
                  />
                  {result.ninetyDayPlan.length === 0 ? (
                    <p className="text-sm text-muted-foreground">90-day plan will populate after Gemini and Claude complete successfully. Regenerate to refresh.</p>
                  ) : result.ninetyDayPlan.map((action, i) => {
                    const id = makeTaskId("90d", i, action.action);
                    return <ActionCard key={i} action={action} taskId={id} status={statuses[id] || "todo"} onCycle={cycle} />;
                  })}
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
                        <Target className="w-4 h-4 text-green-500" />Keyword Opportunities
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <span className="inline-flex items-center gap-1 mr-3"><Badge className={INTENT_COLORS["ready-to-hire"]} style={{fontSize:"10px"}}>ready-to-hire</Badge> = highest conversion</span>
                        <span className="inline-flex items-center gap-1 mr-3"><Badge className={INTENT_COLORS["solution-aware"]} style={{fontSize:"10px"}}>solution-aware</Badge> = evaluation stage</span>
                        <span className="inline-flex items-center gap-1"><Badge className={INTENT_COLORS["problem-aware"]} style={{fontSize:"10px"}}>problem-aware</Badge> = awareness stage</span>
                      </CardDescription>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">Click Blog button to create post</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.keywordOpportunities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No keyword opportunities yet — regenerate for full results.</p>
                    ) : result.keywordOpportunities.map((kw, i) => (
                      <KeywordCard key={i} kw={kw} onGenerateBlog={handleGenerateBlog} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Calendar Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />Content Calendar
                  </CardTitle>
                  <CardDescription>Prioritised content production plan from Qwen + Claude — click "Generate" to create each post</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.contentCalendar.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Content calendar will populate after Claude and Qwen complete. Regenerate to refresh.</p>
                  ) : (
                  <div className="space-y-3">
                    {result.contentCalendar.map((piece, i) => (
                      <div key={i} className="p-3 border rounded-md bg-card space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {piece.weekNumber && <Badge variant="outline" style={{fontSize:"10px"}}>Week {piece.weekNumber}</Badge>}
                            <Badge variant="outline" style={{fontSize:"10px"}} className="capitalize">{piece.type.replace("-", " ")}</Badge>
                            <Badge variant="outline" style={{fontSize:"10px"}}>{piece.wordCount} words</Badge>
                          </div>
                          {(piece.type === "blog" || piece.type === "faq") && (
                            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleGenerateBlog(piece.targetKeyword)}>
                              <PenLine className="w-3 h-3 mr-1" />Generate
                            </Button>
                          )}
                        </div>
                        <p className="text-sm font-medium">{piece.title}</p>
                        <p className="text-xs text-muted-foreground"><strong>Target keyword:</strong> {piece.targetKeyword}</p>
                        {piece.outline.length > 0 && (
                          <div className="space-y-1">
                            {piece.outline.slice(0, 4).map((section, j) => (
                              <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
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
                      <Building2 className="w-4 h-4 text-blue-500" />GBP Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.gbpStrategy.categoryRecommendations.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Requires Gemini — will populate after next regeneration.</p>
                    ) : result.gbpStrategy.categoryRecommendations.map((cat, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-500" />
                        <span>{cat}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />Attributes to Add
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.gbpStrategy.attributesToAdd.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Requires Gemini — will populate after next regeneration.</p>
                    ) : result.gbpStrategy.attributesToAdd.map((attr, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-500" />
                        <span>{attr}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* GBP Descriptions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-500" />GBP Description Versions (A/B test these)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.gbpStrategy.descriptionVersions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Gemini writes these — will populate after next regeneration with the fixed model.</p>
                  ) : result.gbpStrategy.descriptionVersions.map((desc, i) => (
                    <div key={i} className="p-3 border rounded-md bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Version {i + 1}</Badge>
                        <span className="text-xs text-muted-foreground">{desc.length} chars</span>
                      </div>
                      <p className="text-sm">{desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Photo Strategy */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-500" />Photo Strategy
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
                      <Calendar className="w-4 h-4 text-green-500" />GBP Posting Calendar (8 weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.gbpStrategy.postingCalendar.slice(0, 12).map((post, i) => (
                      <div key={i} className="p-3 border rounded-md bg-card space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Week {post.week}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                          <span className="text-xs font-medium">{post.topic}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{post.copy}</p>
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
                      <Globe className="w-4 h-4 text-blue-500" />Schema Markup Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.entityOptimization.schemaRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />Citation Audit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.entityOptimization.citationAuditFindings.map((finding, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{finding}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />Knowledge Panel Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{result.entityOptimization.knowledgePanelStrategy}</p>
                  <div className="mt-3 space-y-2">
                    {result.entityOptimization.entityBuildingSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />Verification Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{result.verificationNotes}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
