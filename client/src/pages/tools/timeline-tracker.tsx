import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, Circle, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type TimelineStage = {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  startDate: string;
  endDate: string;
  estimatedDays: number;
};

const INITIAL_STAGES: TimelineStage[] = [
  { id: "1", name: "Research & Planning", description: "Research endorsing bodies and requirements", status: "completed", startDate: "", endDate: "", estimatedDays: 14 },
  { id: "2", name: "Business Plan Development", description: "Create comprehensive business plan", status: "completed", startDate: "", endDate: "", estimatedDays: 21 },
  { id: "3", name: "Document Preparation", description: "Gather and prepare all required documents", status: "in-progress", startDate: "", endDate: "", estimatedDays: 14 },
  { id: "4", name: "Endorsement Application", description: "Submit application to endorsing body", status: "pending", startDate: "", endDate: "", estimatedDays: 7 },
  { id: "5", name: "Endorsement Review", description: "Wait for endorsement body review", status: "pending", startDate: "", endDate: "", estimatedDays: 42 },
  { id: "6", name: "Visa Application", description: "Submit visa application to UKVI", status: "pending", startDate: "", endDate: "", estimatedDays: 7 },
  { id: "7", name: "Visa Processing", description: "UKVI processing and decision", status: "pending", startDate: "", endDate: "", estimatedDays: 21 },
  { id: "8", name: "Settlement Preparation", description: "Prepare for UK relocation", status: "pending", startDate: "", endDate: "", estimatedDays: 14 },
];

const STATUS_COLORS = {
  pending: "text-muted-foreground",
  "in-progress": "text-primary",
  completed: "text-green-500",
};

const STATUS_ICONS = {
  pending: Circle,
  "in-progress": Clock,
  completed: CheckCircle2,
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'timeline-tracker',
  toolName: 'Timeline Tracker',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. I'll help you plan and track your visa application timeline - ensuring you stay on schedule for a successful endorsement. Let's map out your journey together!",
  questions: [
    {
      id: 'start-date',
      question: "When did you start (or plan to start) your visa application journey? What's your target completion date?",
      hint: "Typical timeline is 3-5 months from start to visa approval",
      fieldKey: 'journey_dates'
    },
    {
      id: 'current-stage',
      question: "What stage are you currently at? (Research, Business Plan, Document Prep, Endorsement Application, Visa Application)",
      hint: "Be honest about where you are - this helps plan next steps",
      fieldKey: 'current_stage'
    },
    {
      id: 'endorsing-body',
      question: "Which endorsing body are you targeting or have you applied to? Have you had any initial contact with them?",
      hint: "Each endorsing body has different processing times and requirements",
      fieldKey: 'endorsing_body'
    },
    {
      id: 'documents-ready',
      question: "What documents do you already have prepared? What's still outstanding?",
      hint: "Key documents include business plan, financial projections, evidence of innovation",
      fieldKey: 'documents_status'
    },
    {
      id: 'blockers',
      question: "Are there any blockers or challenges that might delay your application?",
      hint: "Identifying blockers early allows you to address them proactively",
      fieldKey: 'blockers'
    },
    {
      id: 'processing-speed',
      question: "Are you planning to use standard or priority visa processing? What's your budget for the application?",
      hint: "Priority processing is 5 working days vs 3-8 weeks for standard",
      fieldKey: 'processing_preference'
    }
  ]
};

export default function TimelineTracker() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('timeline-tracker-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('timeline-tracker-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('timeline-tracker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.journey_dates) {
      const dateMatch = answers.journey_dates.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
      if (dateMatch) {
        setStartDate(dateMatch[0]);
      }
    }
    setMode('traditional');
  };

  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [stages, setStages] = useState<TimelineStage[]>(() => {
    const saved = localStorage.getItem("timeline-tracker-state");
    if (saved) {
      try {
        return JSON.parse(saved).stages || INITIAL_STAGES;
      } catch {}
    }
    return INITIAL_STAGES;
  });

  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("timeline-tracker-state");
    if (saved) {
      try {
        return JSON.parse(saved).startDate || "";
      } catch {}
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("timeline-tracker-state", JSON.stringify({ stages, startDate }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [stages, startDate]);

  const updateStage = (id: string, updates: Partial<TimelineStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    triggerAutoSave();
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const inProgressCount = stages.filter((s) => s.status === "in-progress").length;
  const progress = (completedCount / stages.length) * 100;

  const totalEstimatedDays = stages.reduce((sum, s) => sum + s.estimatedDays, 0);
  const completedDays = stages.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.estimatedDays, 0);

  const handleSave = () => {
    localStorage.setItem("timeline-tracker-state", JSON.stringify({ stages, startDate }));
    toast({ title: "Progress Saved", description: "Your timeline has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Visa Application Timeline", level: 1 as const },
      { type: "paragraph" as const, content: `Start Date: ${startDate || "Not set"}` },
      { type: "paragraph" as const, content: `Progress: ${completedCount} of ${stages.length} stages completed (${Math.round(progress)}%)` },
      { type: "paragraph" as const, content: `Estimated Total Duration: ${totalEstimatedDays} days` },
      { type: "heading" as const, content: "Timeline Stages", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Stage", "Status", "Est. Days", "Description"],
        rows: stages.map((s) => [s.name, s.status, `${s.estimatedDays} days`, s.description]),
      }},
    ];
    generateWord({ title: "Timeline Tracker Report", filename: "timeline-tracker-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="basic" toolName="Timeline Tracker">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Calendar className="w-8 h-8 text-primary" />
                  Timeline Tracker
                </h1>
                <p className="text-muted-foreground mt-1">Track your visa application timeline stages</p>
              </div>
              <div className="flex items-center gap-2">
                {showAutoSave && (
                  <Badge variant="secondary" className="animate-pulse">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                  </Badge>
                )}
                <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
              </div>
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
            <>
            <ToolUtilityBar
              toolId="timeline-tracker"
              toolName="Timeline Tracker"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-completed-stages">{completedCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{inProgressCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stages.length - completedCount - inProgressCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Est. Days</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{totalEstimatedDays}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}% ({completedDays} of {totalEstimatedDays} days)</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <div className="space-y-2">
                  {stages.map((stage, index) => {
                    const StatusIcon = STATUS_ICONS[stage.status];
                    return (
                      <Card key={stage.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          stage.status === "completed" ? "bg-green-500" :
                          stage.status === "in-progress" ? "bg-primary" :
                          "bg-muted"
                        }`} />
                        <CardContent className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              stage.status === "completed" ? "bg-green-500/20" :
                              stage.status === "in-progress" ? "bg-primary/20" :
                              "bg-muted"
                            }`}>
                              <StatusIcon className={`w-5 h-5 ${STATUS_COLORS[stage.status]}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold" data-testid={`text-stage-name-${index}`}>{stage.name}</h3>
                                <Badge variant={
                                  stage.status === "completed" ? "default" :
                                  stage.status === "in-progress" ? "secondary" :
                                  "outline"
                                }>
                                  {stage.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">Estimated: {stage.estimatedDays} days</p>
                            </div>
                            <Select
                              value={stage.status}
                              onValueChange={(v) => updateStage(stage.id, { status: v as TimelineStage["status"] })}
                            >
                              <SelectTrigger className="w-36" data-testid={`select-status-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {index < stages.length - 1 && (
                            <div className="absolute left-[26px] bottom-0 h-2 w-[2px] bg-border" />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="list">
                <Card>
                  <CardHeader>
                    <CardTitle>All Stages</CardTitle>
                    <CardDescription>Manage your timeline stages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">#</th>
                            <th className="text-left py-2 px-2">Stage</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-left py-2 px-2">Est. Days</th>
                            <th className="text-left py-2 px-2">Start Date</th>
                            <th className="text-left py-2 px-2">End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stages.map((stage, i) => (
                            <tr key={stage.id} className="border-b">
                              <td className="py-2 px-2">{i + 1}</td>
                              <td className="py-2 px-2 font-medium">{stage.name}</td>
                              <td className="py-2 px-2">
                                <Badge variant={
                                  stage.status === "completed" ? "default" :
                                  stage.status === "in-progress" ? "secondary" :
                                  "outline"
                                }>
                                  {stage.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-2">{stage.estimatedDays}</td>
                              <td className="py-2 px-2">
                                <Input
                                  type="date"
                                  value={stage.startDate}
                                  onChange={(e) => updateStage(stage.id, { startDate: e.target.value })}
                                  className="w-32"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <Input
                                  type="date"
                                  value={stage.endDate}
                                  onChange={(e) => updateStage(stage.id, { endDate: e.target.value })}
                                  className="w-32"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Settings</CardTitle>
                    <CardDescription>Configure your timeline preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Journey Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); triggerAutoSave(); }}
                        data-testid="input-start-date"
                      />
                      <p className="text-xs text-muted-foreground">When did you start your visa application journey?</p>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-4">Typical Timeline</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4" />
                          <span>Endorsement Review: 4-8 weeks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4" />
                          <span>Visa Processing: 3-8 weeks (standard) / 5 days (priority)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4" />
                          <span>Total Average: 3-5 months</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        Important Notes
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                        <li>Processing times can vary significantly</li>
                        <li>Check current processing times on GOV.UK</li>
                        <li>Consider priority processing if time is critical</li>
                        <li>Allow buffer time for document requests</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
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
