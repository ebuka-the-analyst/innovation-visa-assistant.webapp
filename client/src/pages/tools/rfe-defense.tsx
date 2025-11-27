import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, AlertTriangle, Plus, Trash2, FileText, Target, Lightbulb, Scale } from "lucide-react";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'rfe-defense',
  toolName: 'RFE Defence Lab',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Receiving a Request for Evidence (RFE) is an opportunity to strengthen your application. Let's build comprehensive defenses for each concern raised by the Home Office.",
  questions: [
    {
      id: 'rfe-overview',
      question: "What is the primary concern raised in your RFE, and which visa criterion does it relate to?",
      hint: "Identify if it's about Innovation, Viability, or Scalability.",
      fieldKey: 'rfeOverview',
      minLength: 30
    },
    {
      id: 'innovation-issue',
      question: "If innovation-related: What specific aspect of your innovation is being questioned?",
      hint: "Is it about technical differentiation, IP protection, or novel approach?",
      fieldKey: 'innovationIssue',
      minLength: 20
    },
    {
      id: 'viability-issue',
      question: "If viability-related: What evidence is being requested about your business model?",
      hint: "Consider market validation, revenue proof, or customer evidence requests.",
      fieldKey: 'viabilityIssue',
      minLength: 20
    },
    {
      id: 'available-evidence',
      question: "What evidence do you currently have available to address these concerns?",
      hint: "List documents, testimonials, data, or expert opinions you can provide.",
      fieldKey: 'availableEvidence',
      minLength: 30
    },
    {
      id: 'defense-strategy',
      question: "What is your initial defense strategy for the most critical RFE point?",
      hint: "How will you demonstrate that you meet the requirement in question?",
      fieldKey: 'defenseStrategy',
      minLength: 30
    },
    {
      id: 'response-deadline',
      question: "What is your RFE response deadline and what additional evidence can you gather?",
      hint: "Consider expert letters, updated financials, customer testimonials, or technical assessments.",
      fieldKey: 'responseDeadline',
      minLength: 15
    }
  ],
  completionMessage: "Excellent! I've captured the key RFE concerns and your defense approach. I'm now populating your defense strategy with structured responses and evidence requirements for each issue."
};
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type RFEIssue = {
  id: string;
  category: "innovation" | "viability" | "scalability" | "team" | "market" | "other";
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  defense: string;
  evidence: string;
  status: "pending" | "addressed" | "resolved";
};

const INITIAL_ISSUES: RFEIssue[] = [
  { id: "1", category: "innovation", issue: "Insufficient evidence of innovation", severity: "high", defense: "", evidence: "", status: "pending" },
  { id: "2", category: "viability", issue: "Business model viability questioned", severity: "medium", defense: "", evidence: "", status: "pending" },
  { id: "3", category: "scalability", issue: "Scalability plan needs clarification", severity: "medium", defense: "", evidence: "", status: "pending" },
];

const CATEGORY_INFO = {
  innovation: { label: "Innovation", color: "bg-blue-500" },
  viability: { label: "Viability", color: "bg-green-500" },
  scalability: { label: "Scalability", color: "bg-purple-500" },
  team: { label: "Team", color: "bg-orange-500" },
  market: { label: "Market", color: "bg-pink-500" },
  other: { label: "Other", color: "bg-gray-500" },
};

const SEVERITY_COLORS = {
  low: "bg-green-500/20 text-green-700",
  medium: "bg-yellow-500/20 text-yellow-700",
  high: "bg-orange-500/20 text-orange-700",
  critical: "bg-red-500/20 text-red-700",
};

const DEFENSE_TEMPLATES = {
  innovation: [
    "Our solution introduces a novel approach to [problem] by leveraging [technology/method]",
    "Unlike existing solutions, our product uniquely addresses [specific pain point]",
    "We have filed/received patent application for [innovation aspect]",
  ],
  viability: [
    "Our revenue model has been validated through [specific evidence]",
    "We have achieved [milestone] demonstrating market demand",
    "Our unit economics show positive trajectory with [specific metrics]",
  ],
  scalability: [
    "Our technology architecture supports [X] users without infrastructure changes",
    "We have a clear expansion strategy targeting [markets/segments]",
    "Our team has experience scaling similar businesses from [X] to [Y]",
  ],
  team: [
    "Our founding team has [X] years of combined experience in [industry]",
    "We have secured advisory support from [notable advisors]",
    "Our team has previously built and scaled [relevant companies/products]",
  ],
  market: [
    "Market research indicates a £[X] billion opportunity in [market]",
    "We have validated demand through [customer interviews/pilots/sales]",
    "Industry trends support our growth thesis due to [specific trends]",
  ],
  other: [
    "Additional supporting evidence includes [documentation]",
    "We can provide further clarification on [specific aspect]",
  ],
};

export default function RFEDefense() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('rfe-defense-mode') as 'ai' | 'traditional') || 'ai';
  });

  const [issues, setIssues] = useState<RFEIssue[]>(() => {
    const saved = localStorage.getItem("rfe-defense-state");
    if (saved) {
      try {
        return JSON.parse(saved).issues || INITIAL_ISSUES;
      } catch {}
    }
    return INITIAL_ISSUES;
  });

  const [newIssue, setNewIssue] = useState<Partial<RFEIssue>>({
    category: "innovation",
    issue: "",
    severity: "medium",
    defense: "",
    evidence: "",
    status: "pending",
  });

  const [activeTab, setActiveTab] = useState("issues");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rfe-defense-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.rfeOverview) {
      setNewIssue(prev => ({
        ...prev,
        issue: answers.rfeOverview,
        category: answers.innovationIssue ? 'innovation' : answers.viabilityIssue ? 'viability' : 'innovation'
      }));
    }
    if (answers.defenseStrategy) {
      setNewIssue(prev => ({ ...prev, defense: answers.defenseStrategy }));
    }
    if (answers.availableEvidence) {
      setNewIssue(prev => ({ ...prev, evidence: answers.availableEvidence }));
    }
    setMode('traditional');
  };

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newIssues: RFEIssue[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("rfe-defense-state", JSON.stringify({ issues: newIssues }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const addIssue = () => {
    if (!newIssue.issue) {
      toast({ title: "Error", description: "Please describe the RFE issue", variant: "destructive" });
      return;
    }
    const issue: RFEIssue = {
      id: Date.now().toString(),
      category: newIssue.category as RFEIssue["category"],
      issue: newIssue.issue || "",
      severity: newIssue.severity as RFEIssue["severity"],
      defense: newIssue.defense || "",
      evidence: newIssue.evidence || "",
      status: "pending",
    };
    const updated = [...issues, issue];
    setIssues(updated);
    triggerAutoSave(updated);
    setNewIssue({ category: "innovation", issue: "", severity: "medium", defense: "", evidence: "", status: "pending" });
    toast({ title: "Issue Added", description: "RFE issue has been added to your defense list" });
  };

  const updateIssue = (id: string, updates: Partial<RFEIssue>) => {
    const updated = issues.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setIssues(updated);
    triggerAutoSave(updated);
  };

  const deleteIssue = (id: string) => {
    const updated = issues.filter((i) => i.id !== id);
    setIssues(updated);
    triggerAutoSave(updated);
    toast({ title: "Issue Removed", description: "RFE issue has been removed" });
  };

  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const addressedCount = issues.filter((i) => i.status === "addressed").length;
  const progress = issues.length > 0 ? ((resolvedCount + addressedCount) / issues.length) * 100 : 0;
  const criticalCount = issues.filter((i) => i.severity === "critical" && i.status !== "resolved").length;

  const radarData = Object.keys(CATEGORY_INFO).map((cat) => {
    const catIssues = issues.filter((i) => i.category === cat);
    const resolved = catIssues.filter((i) => i.status === "resolved").length;
    const score = catIssues.length > 0 ? (resolved / catIssues.length) * 100 : 100;
    return { category: CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].label, score, fullMark: 100 };
  });

  const handleSave = () => {
    localStorage.setItem("rfe-defense-state", JSON.stringify({ issues }));
    toast({ title: "Progress Saved", description: "Your RFE defense has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "RFE Defense Report", level: 1 as const },
      { type: "paragraph" as const, content: `Defense Progress: ${Math.round(progress)}% complete (${resolvedCount} resolved, ${addressedCount} addressed)` },
      { type: "heading" as const, content: "Issues & Defenses", level: 2 as const },
      ...issues.map((issue) => [
        { type: "heading" as const, content: `${CATEGORY_INFO[issue.category].label}: ${issue.issue}`, level: 3 as const },
        { type: "paragraph" as const, content: `Severity: ${issue.severity} | Status: ${issue.status}` },
        { type: "paragraph" as const, content: `Defense: ${issue.defense || "Not yet prepared"}` },
        { type: "paragraph" as const, content: `Evidence: ${issue.evidence || "Not yet documented"}` },
      ]).flat(),
    ];
    generateWord({ title: "RFE Defense Report", filename: "rfe-defense-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="RFE Defence Lab">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Shield className="w-8 h-8 text-primary" />
                  RFE Defence Lab
                </h1>
                <p className="text-muted-foreground mt-1">Build comprehensive defenses against RFE challenges</p>
              </div>
              <div className="flex items-center gap-3">
                <AiTraditionalToggle mode={mode} onModeChange={setMode} />
                {showAutoSave && (
                  <Badge variant="secondary" className="animate-pulse">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                  </Badge>
                )}
              </div>
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
            <>
            <ToolUtilityBar
              toolId="rfe-defense"
              toolName="RFE Defence Lab"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Issues</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-total-issues">{issues.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Resolved</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-resolved-count">{resolvedCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Addressed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{addressedCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">Critical</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-critical-count">{criticalCount}</p>
                </CardContent>
              </Card>
            </div>

            {criticalCount > 0 && (
              <Alert className="mb-6 border-red-500">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  You have {criticalCount} critical issue(s) requiring immediate attention.
                </AlertDescription>
              </Alert>
            )}

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Defense Preparation Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="issues" data-testid="tab-issues">RFE Issues</TabsTrigger>
                <TabsTrigger value="add" data-testid="tab-add">Add Issue</TabsTrigger>
                <TabsTrigger value="templates" data-testid="tab-templates">Defense Templates</TabsTrigger>
                <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="issues">
                <div className="space-y-4">
                  {issues.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No RFE issues documented yet. Add issues to build your defense strategy.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    issues.map((issue, index) => (
                      <Card key={issue.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_INFO[issue.category].color}`} />
                        <CardContent className="pl-6 py-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{CATEGORY_INFO[issue.category].label}</Badge>
                                  <Badge className={SEVERITY_COLORS[issue.severity]}>{issue.severity}</Badge>
                                  <Badge variant={issue.status === "resolved" ? "default" : "secondary"}>{issue.status}</Badge>
                                </div>
                                <h3 className="font-semibold" data-testid={`text-issue-${index}`}>{issue.issue}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={issue.status}
                                  onValueChange={(v) => updateIssue(issue.id, { status: v as RFEIssue["status"] })}
                                >
                                  <SelectTrigger className="w-32" data-testid={`select-status-${index}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="addressed">Addressed</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => deleteIssue(issue.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Defense Argument</Label>
                                <Textarea
                                  value={issue.defense}
                                  onChange={(e) => updateIssue(issue.id, { defense: e.target.value })}
                                  placeholder="Enter your defense argument..."
                                  className="mt-1"
                                  data-testid={`textarea-defense-${index}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Supporting Evidence</Label>
                                <Textarea
                                  value={issue.evidence}
                                  onChange={(e) => updateIssue(issue.id, { evidence: e.target.value })}
                                  placeholder="List supporting evidence..."
                                  className="mt-1"
                                  data-testid={`textarea-evidence-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New RFE Issue</CardTitle>
                    <CardDescription>Document a potential or actual RFE concern</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newIssue.category}
                          onValueChange={(v) => setNewIssue({ ...newIssue, category: v as RFEIssue["category"] })}
                        >
                          <SelectTrigger data-testid="select-new-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                              <SelectItem key={key} value={key}>{info.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select
                          value={newIssue.severity}
                          onValueChange={(v) => setNewIssue({ ...newIssue, severity: v as RFEIssue["severity"] })}
                        >
                          <SelectTrigger data-testid="select-new-severity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Description</Label>
                      <Textarea
                        value={newIssue.issue}
                        onChange={(e) => setNewIssue({ ...newIssue, issue: e.target.value })}
                        placeholder="Describe the RFE issue or concern..."
                        data-testid="textarea-new-issue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Defense (Optional)</Label>
                      <Textarea
                        value={newIssue.defense}
                        onChange={(e) => setNewIssue({ ...newIssue, defense: e.target.value })}
                        placeholder="Enter initial defense argument..."
                        data-testid="textarea-new-defense"
                      />
                    </div>
                    <Button onClick={addIssue} className="w-full" data-testid="button-add-issue">
                      <Plus className="w-4 h-4 mr-2" />
                      Add RFE Issue
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(DEFENSE_TEMPLATES).map(([category, templates]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          {CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].label} Defenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {templates.map((template, i) => (
                            <li key={i} className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
                              {template}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Defense Coverage</CardTitle>
                      <CardDescription>Resolution status by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Resolution %"
                            dataKey="score"
                            stroke="#ffa536"
                            fill="#ffa536"
                            fillOpacity={0.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Summary & Recommendations</CardTitle>
                      <CardDescription>Strategic overview of your RFE defense</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="w-4 h-4 text-primary" />
                            <span className="font-medium">Overall Readiness</span>
                          </div>
                          <Progress value={progress} className="h-2 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {progress < 50 ? "Significant work needed on defense preparation" :
                             progress < 80 ? "Good progress, continue building defenses" :
                             "Strong defense preparation complete"}
                          </p>
                        </div>

                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            {criticalCount === 0 ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            )}
                            <span className="text-sm">
                              {criticalCount === 0 ? "No critical issues pending" : `${criticalCount} critical issue(s) need attention`}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                            <span className="text-sm">{resolvedCount} of {issues.length} issues fully resolved</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span className="text-sm">Use defense templates to strengthen arguments</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            </>
            )}
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
