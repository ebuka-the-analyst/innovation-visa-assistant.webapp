import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Map, CheckCircle2, Circle, ArrowRight, Rocket, Target, Calendar, Clock, FileText, Users, PoundSterling, Shield, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "zero-approved",
  toolName: "Zero to Approved",
  agent: "sterling",
  greeting: "Hello! I'm Sterling, your financial planning specialist. Let me help you navigate the complete journey from zero to approved Innovator Founder visa status.",
  questions: [
    {
      id: "currentPhase",
      question: "Which phase are you currently in? (Foundation, Business Planning, Endorsement Prep, Endorsement Application, Visa Application, Settlement)",
      hint: "Describe your current phase and what tasks you've already completed",
      fieldKey: "currentPhase",
      minLength: 50
    },
    {
      id: "businessIdea",
      question: "Describe your innovative business idea. What problem does it solve and how is it innovative?",
      hint: "Share your business concept, target market, innovation elements, and competitive advantage",
      fieldKey: "businessIdea",
      minLength: 80
    },
    {
      id: "financialReadiness",
      question: "What is your financial readiness? Do you have the required maintenance funds (£1,270) and initial capital?",
      hint: "Describe your financial situation, available funds, and investment plans",
      fieldKey: "financialReadiness",
      minLength: 60
    },
    {
      id: "documentationStatus",
      question: "What business documentation have you prepared? (Business plan, financial projections, market research)",
      hint: "List prepared documents and identify what still needs to be completed",
      fieldKey: "documentationStatus",
      minLength: 60
    },
    {
      id: "endorserSelection",
      question: "Have you selected an endorsing body? Which one and why?",
      hint: "Name your target endorser and explain why they're the right fit for your business",
      fieldKey: "endorserSelection",
      minLength: 50
    },
    {
      id: "timeline",
      question: "What is your target timeline for visa approval? When do you need to be in the UK?",
      hint: "Share your target approval date and any deadline constraints",
      fieldKey: "timeline",
      minLength: 50
    },
    {
      id: "blockers",
      question: "What are your current blockers or concerns about completing the visa journey?",
      hint: "Describe any challenges, uncertainties, or areas where you need guidance",
      fieldKey: "blockers",
      minLength: 60
    }
  ],
  completionMessage: "Great! Your visa journey roadmap is now clear. Let's work through each phase systematically to get you approved."
};

type Phase = {
  id: string;
  name: string;
  description: string;
  duration: string;
  tasks: { id: string; task: string; completed: boolean; critical: boolean }[];
};

const ROADMAP_PHASES: Phase[] = [
  {
    id: "1",
    name: "Foundation",
    description: "Build your business foundation and validate your idea",
    duration: "2-4 weeks",
    tasks: [
      { id: "1-1", task: "Define your innovative business idea", completed: false, critical: true },
      { id: "1-2", task: "Research UK market opportunity", completed: false, critical: true },
      { id: "1-3", task: "Identify target customer segment", completed: false, critical: false },
      { id: "1-4", task: "Analyze competitor landscape", completed: false, critical: false },
      { id: "1-5", task: "Draft initial business model", completed: false, critical: true },
    ],
  },
  {
    id: "2",
    name: "Business Planning",
    description: "Create comprehensive business documentation",
    duration: "3-4 weeks",
    tasks: [
      { id: "2-1", task: "Complete detailed business plan", completed: false, critical: true },
      { id: "2-2", task: "Develop financial projections (3-5 years)", completed: false, critical: true },
      { id: "2-3", task: "Create market analysis report", completed: false, critical: true },
      { id: "2-4", task: "Define scalability strategy", completed: false, critical: true },
      { id: "2-5", task: "Document innovation evidence", completed: false, critical: true },
      { id: "2-6", task: "Prepare team/founder credentials", completed: false, critical: false },
    ],
  },
  {
    id: "3",
    name: "Endorsement Prep",
    description: "Prepare for endorsement body application",
    duration: "2-3 weeks",
    tasks: [
      { id: "3-1", task: "Research and select endorsing body", completed: false, critical: true },
      { id: "3-2", task: "Review endorsement criteria", completed: false, critical: true },
      { id: "3-3", task: "Gather all required documents", completed: false, critical: true },
      { id: "3-4", task: "Prepare pitch/presentation", completed: false, critical: false },
      { id: "3-5", task: "Practice interview responses", completed: false, critical: false },
    ],
  },
  {
    id: "4",
    name: "Endorsement Application",
    description: "Submit and track endorsement application",
    duration: "6-8 weeks",
    tasks: [
      { id: "4-1", task: "Submit endorsement application", completed: false, critical: true },
      { id: "4-2", task: "Complete endorser interview", completed: false, critical: true },
      { id: "4-3", task: "Respond to any queries", completed: false, critical: false },
      { id: "4-4", task: "Receive endorsement letter", completed: false, critical: true },
    ],
  },
  {
    id: "5",
    name: "Visa Application",
    description: "Apply for the Innovator Founder visa",
    duration: "3-8 weeks",
    tasks: [
      { id: "5-1", task: "Complete visa application form", completed: false, critical: true },
      { id: "5-2", task: "Pay visa fees (£1,191 + IHS)", completed: false, critical: true },
      { id: "5-3", task: "Book biometrics appointment", completed: false, critical: true },
      { id: "5-4", task: "Attend biometrics appointment", completed: false, critical: true },
      { id: "5-5", task: "Submit supporting documents", completed: false, critical: true },
      { id: "5-6", task: "Receive visa decision", completed: false, critical: true },
    ],
  },
  {
    id: "6",
    name: "Settlement",
    description: "Prepare for UK relocation and business setup",
    duration: "2-4 weeks",
    tasks: [
      { id: "6-1", task: "Arrange UK accommodation", completed: false, critical: true },
      { id: "6-2", task: "Set up UK bank account", completed: false, critical: true },
      { id: "6-3", task: "Register company (if not done)", completed: false, critical: true },
      { id: "6-4", task: "Obtain National Insurance number", completed: false, critical: false },
      { id: "6-5", task: "Register with GP", completed: false, critical: false },
      { id: "6-6", task: "Launch business operations", completed: false, critical: true },
    ],
  },
];

const PHASE_ICONS = [Rocket, FileText, Target, Award, Shield, Map];

export default function ZeroApproved() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('zero-approved-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('zero-approved-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('zero-approved-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((_answers: Record<string, string>) => {
    setMode('traditional');
    toast({
      title: "AI Guidance Complete",
      description: "Your visa journey roadmap has been initialized. Start tracking your progress."
    });
  }, [toast]);

  const [phases, setPhases] = useState<Phase[]>(() => {
    const saved = localStorage.getItem("zero-approved-state");
    if (saved) {
      try {
        return JSON.parse(saved).phases || ROADMAP_PHASES;
      } catch {}
    }
    return ROADMAP_PHASES;
  });

  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("zero-approved-state");
    if (saved) {
      try {
        return JSON.parse(saved).startDate || "";
      } catch {}
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState("roadmap");
  const [expandedPhase, setExpandedPhase] = useState<string | null>("1");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("zero-approved-state", JSON.stringify({ phases, startDate }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [phases, startDate]);

  const toggleTask = (phaseId: string, taskId: string) => {
    const newPhases = phases.map((phase) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      }
      return phase;
    });
    setPhases(newPhases);
    triggerAutoSave();
  };

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = phases.reduce((sum, p) => sum + p.tasks.filter((t) => t.completed).length, 0);
  const progress = (completedTasks / totalTasks) * 100;

  const criticalTasks = phases.flatMap((p) => p.tasks.filter((t) => t.critical && !t.completed));
  const currentPhase = phases.find((p) => p.tasks.some((t) => !t.completed)) || phases[phases.length - 1];

  const handleSave = () => {
    localStorage.setItem("zero-approved-state", JSON.stringify({ phases, startDate }));
    toast({ title: "Progress Saved", description: "Your roadmap has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Zero-to-Approved Roadmap", level: 1 as const },
      { type: "paragraph" as const, content: `Start Date: ${startDate || "Not set"}` },
      { type: "paragraph" as const, content: `Progress: ${completedTasks} of ${totalTasks} tasks completed (${Math.round(progress)}%)` },
      { type: "heading" as const, content: "Phases Overview", level: 2 as const },
      ...phases.map((phase, i) => {
        const phaseComplete = phase.tasks.filter((t) => t.completed).length;
        return [
          { type: "heading" as const, content: `Phase ${i + 1}: ${phase.name}`, level: 3 as const },
          { type: "paragraph" as const, content: `Duration: ${phase.duration} | Progress: ${phaseComplete}/${phase.tasks.length}` },
          { type: "list" as const, items: phase.tasks.map((t) => `[${t.completed ? "X" : " "}] ${t.task}${t.critical ? " (Critical)" : ""}`) },
        ];
      }).flat(),
    ];
    generateWord({ title: "Zero-to-Approved Roadmap", filename: "zero-to-approved-roadmap", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Zero-to-Approved Roadmap">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Map className="w-8 h-8 text-primary" />
                  Zero-to-Approved Roadmap
                </h1>
                <p className="text-muted-foreground mt-1">Complete roadmap from zero to visa approved</p>
              </div>
              <div className="flex items-center gap-3">
                {showAutoSave && (
                  <Badge variant="secondary" className="animate-pulse">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                  </Badge>
                )}
                <AiTraditionalToggle
                  mode={mode}
                  onModeChange={setMode}
                  aiLabel="AI-Guided"
                  traditionalLabel="Traditional Form"
                  userTier={userTier}
                />
              </div>
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
            <ToolUtilityBar
              toolId="zero-approved"
              toolName="Zero-to-Approved Roadmap"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Current Phase</span>
                  </div>
                  <p className="text-xl font-bold mt-1" data-testid="text-current-phase">{currentPhase.name}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Tasks Done</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{completedTasks} / {totalTasks}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Critical Left</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-critical-left">{criticalTasks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{Math.round(progress)}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress to Approval</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-3" />
              </CardContent>
            </Card>

            {criticalTasks.length > 0 && (
              <Alert className="mb-6 border-orange-500">
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  {criticalTasks.length} critical task(s) remaining. Focus on these for visa success.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="roadmap" data-testid="tab-roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
                <TabsTrigger value="critical" data-testid="tab-critical">Critical Path</TabsTrigger>
              </TabsList>

              <TabsContent value="roadmap">
                <div className="space-y-4">
                  {phases.map((phase, index) => {
                    const Icon = PHASE_ICONS[index] || Target;
                    const phaseComplete = phase.tasks.filter((t) => t.completed).length;
                    const phaseProgress = (phaseComplete / phase.tasks.length) * 100;
                    const isExpanded = expandedPhase === phase.id;

                    return (
                      <Card key={phase.id} className="overflow-hidden">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              phaseProgress === 100 ? "bg-green-500" :
                              phaseProgress > 0 ? "bg-primary" : "bg-muted"
                            }`}>
                              {phaseProgress === 100 ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              ) : (
                                <Icon className={`w-6 h-6 ${phaseProgress > 0 ? "text-white" : "text-muted-foreground"}`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Phase {index + 1}: {phase.name}</h3>
                                <Badge variant="outline">{phase.duration}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{phase.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={phaseProgress} className="h-1 flex-1" />
                                <span className="text-xs text-muted-foreground">{phaseComplete}/{phase.tasks.length}</span>
                              </div>
                            </div>
                            <ArrowRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </div>
                        </div>

                        {isExpanded && (
                          <CardContent className="pt-0 pb-4">
                            <div className="border-t pt-4 space-y-2">
                              {phase.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(phase.id, task.id)}
                                    data-testid={`checkbox-${task.id}`}
                                  />
                                  <span className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {task.task}
                                  </span>
                                  {task.critical && (
                                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Timeline</CardTitle>
                    <CardDescription>Plan your journey from start to approval</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Journey Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); triggerAutoSave(); }}
                        data-testid="input-start-date"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-4">Phase Durations</h4>
                      <div className="space-y-4">
                        {phases.map((phase, i) => (
                          <div key={phase.id} className="flex items-center gap-4">
                            <div className="w-8 text-center font-bold text-muted-foreground">{i + 1}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{phase.name}</span>
                                <Badge variant="outline">{phase.duration}</Badge>
                              </div>
                              <Progress
                                value={(phase.tasks.filter((t) => t.completed).length / phase.tasks.length) * 100}
                                className="h-1 mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Estimated Duration</span>
                          <Badge>18-31 weeks</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Actual timeline varies based on endorser processing times and UKVI queue
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="critical">
                <Card>
                  <CardHeader>
                    <CardTitle>Critical Path Tasks</CardTitle>
                    <CardDescription>These tasks are essential for visa approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {criticalTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">All critical tasks completed!</p>
                        <p className="text-muted-foreground">Great job on your visa journey progress.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {phases.map((phase) => {
                          const phaseCritical = phase.tasks.filter((t) => t.critical && !t.completed);
                          if (phaseCritical.length === 0) return null;
                          return (
                            <div key={phase.id}>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">{phase.name}</h4>
                              {phaseCritical.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg mb-2">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(phase.id, task.id)}
                                  />
                                  <span>{task.task}</span>
                                  <Badge variant="destructive" className="ml-auto text-xs">Critical</Badge>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
