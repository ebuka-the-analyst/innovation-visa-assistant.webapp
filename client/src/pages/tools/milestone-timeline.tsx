import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, Plus, Trash2, Flag, Target, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "milestone-timeline",
  toolName: "Milestone Timeline Planner",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation strategist. Let's map out the key milestones for your UK Innovator Founder visa journey. I'll help you create a realistic timeline that demonstrates your business planning capabilities to endorsers.",
  questions: [
    {
      id: "first_milestone",
      question: "What is your most critical milestone that needs to be achieved first? Describe what it is, why it's important, and your target timeframe.",
      hint: "Example: 'Complete comprehensive business plan by January 2025 - this is critical for endorsement application'",
      fieldKey: "firstMilestone",
      minLength: 50
    },
    {
      id: "endorsement_milestone",
      question: "What are your key milestones related to the visa endorsement process? Include application submission, interview preparation, and expected approval timeline.",
      hint: "Example: 'Submit endorsement application by February, prepare for interview by March, expect decision by April'",
      fieldKey: "endorsementMilestone",
      minLength: 50
    },
    {
      id: "funding_milestone",
      question: "What are your funding-related milestones? Include initial capital, any planned funding rounds, and target amounts.",
      hint: "Example: 'Secure £50,000 initial investment by Q1, pursue seed funding of £250,000 by Q3'",
      fieldKey: "fundingMilestone",
      minLength: 40
    },
    {
      id: "team_milestone",
      question: "What are your key team-building milestones? When do you plan to make critical hires?",
      hint: "Example: 'Hire technical co-founder by Month 3, first developer by Month 6, operations manager by Month 9'",
      fieldKey: "teamMilestone",
      minLength: 40
    },
    {
      id: "product_milestone",
      question: "What are your product development milestones? Include MVP, beta testing, and full launch timelines.",
      hint: "Example: 'Complete MVP by Month 4, beta testing Month 5-6, public launch Month 7'",
      fieldKey: "productMilestone",
      minLength: 40
    },
    {
      id: "priority_assessment",
      question: "How would you prioritize these milestones? Which ones are critical vs nice-to-have?",
      hint: "Consider which milestones are dependencies for others and which are essential for visa endorsement",
      fieldKey: "priorityAssessment",
      minLength: 30
    }
  ],
  completionMessage: "Excellent! I've captured your milestone timeline. Let me now organize these into a structured view where you can track progress and adjust dates as needed."
};

type Milestone = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  category: "business" | "visa" | "funding" | "team" | "product";
  status: "pending" | "in-progress" | "completed" | "delayed";
  priority: "low" | "medium" | "high" | "critical";
};

const INITIAL_MILESTONES: Milestone[] = [
  { id: "1", title: "Complete Business Plan", description: "Finalize comprehensive business plan for endorsement", targetDate: "", category: "business", status: "pending", priority: "critical" },
  { id: "2", title: "Endorsement Application", description: "Submit application to endorsing body", targetDate: "", category: "visa", status: "pending", priority: "critical" },
  { id: "3", title: "Secure Initial Funding", description: "Close seed funding round", targetDate: "", category: "funding", status: "pending", priority: "high" },
  { id: "4", title: "Hire Core Team", description: "Recruit key team members", targetDate: "", category: "team", status: "pending", priority: "high" },
  { id: "5", title: "MVP Launch", description: "Launch minimum viable product", targetDate: "", category: "product", status: "pending", priority: "medium" },
];

const CATEGORY_COLORS = {
  business: "bg-blue-500",
  visa: "bg-purple-500",
  funding: "bg-green-500",
  team: "bg-orange-500",
  product: "bg-pink-500",
};

const STATUS_COLORS = {
  pending: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary",
  completed: "bg-green-500/20 text-green-700",
  delayed: "bg-red-500/20 text-red-700",
};

const PRIORITY_ICONS = {
  low: <Flag className="w-3 h-3 text-muted-foreground" />,
  medium: <Flag className="w-3 h-3 text-yellow-500" />,
  high: <Flag className="w-3 h-3 text-orange-500" />,
  critical: <Flag className="w-3 h-3 text-red-500" />,
};

export default function MilestoneTimeline() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('milestone-timeline-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('milestone-timeline-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('milestone-timeline-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, string>) => {
    const newMilestones: Milestone[] = [];
    
    if (answers.firstMilestone) {
      newMilestones.push({
        id: Date.now().toString(),
        title: "Critical First Milestone",
        description: answers.firstMilestone,
        targetDate: "",
        category: "business",
        status: "pending",
        priority: "critical"
      });
    }
    
    if (answers.endorsementMilestone) {
      newMilestones.push({
        id: (Date.now() + 1).toString(),
        title: "Endorsement Process",
        description: answers.endorsementMilestone,
        targetDate: "",
        category: "visa",
        status: "pending",
        priority: "critical"
      });
    }
    
    if (answers.fundingMilestone) {
      newMilestones.push({
        id: (Date.now() + 2).toString(),
        title: "Funding Milestone",
        description: answers.fundingMilestone,
        targetDate: "",
        category: "funding",
        status: "pending",
        priority: "high"
      });
    }
    
    if (answers.teamMilestone) {
      newMilestones.push({
        id: (Date.now() + 3).toString(),
        title: "Team Building",
        description: answers.teamMilestone,
        targetDate: "",
        category: "team",
        status: "pending",
        priority: "high"
      });
    }
    
    if (answers.productMilestone) {
      newMilestones.push({
        id: (Date.now() + 4).toString(),
        title: "Product Development",
        description: answers.productMilestone,
        targetDate: "",
        category: "product",
        status: "pending",
        priority: "medium"
      });
    }
    
    if (newMilestones.length > 0) {
      setMilestones(newMilestones);
      triggerAutoSave(newMilestones);
    }
    setMode('traditional');
    toast({ title: "Milestones Created", description: "Your milestone timeline has been populated from your answers" });
  }, [toast]);

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem("milestone-timeline-state");
    if (saved) {
      try {
        return JSON.parse(saved).milestones || INITIAL_MILESTONES;
      } catch {}
    }
    return INITIAL_MILESTONES;
  });

  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: "",
    description: "",
    targetDate: "",
    category: "business",
    status: "pending",
    priority: "medium",
  });

  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newMilestones: Milestone[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("milestone-timeline-state", JSON.stringify({ milestones: newMilestones }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const addMilestone = () => {
    if (!newMilestone.title) {
      toast({ title: "Error", description: "Please enter a milestone title", variant: "destructive" });
      return;
    }
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title || "",
      description: newMilestone.description || "",
      targetDate: newMilestone.targetDate || "",
      category: newMilestone.category as Milestone["category"],
      status: newMilestone.status as Milestone["status"],
      priority: newMilestone.priority as Milestone["priority"],
    };
    const updated = [...milestones, milestone];
    setMilestones(updated);
    triggerAutoSave(updated);
    setNewMilestone({ title: "", description: "", targetDate: "", category: "business", status: "pending", priority: "medium" });
    toast({ title: "Milestone Added", description: "New milestone has been added to your timeline" });
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const updated = milestones.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMilestones(updated);
    triggerAutoSave(updated);
  };

  const deleteMilestone = (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    setMilestones(updated);
    triggerAutoSave(updated);
    toast({ title: "Milestone Deleted", description: "Milestone has been removed from your timeline" });
  };

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const delayedCount = milestones.filter((m) => m.status === "delayed").length;

  const handleSave = () => {
    localStorage.setItem("milestone-timeline-state", JSON.stringify({ milestones }));
    toast({ title: "Progress Saved", description: "Your milestone timeline has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Milestone Timeline", level: 1 as const },
      { type: "paragraph" as const, content: `Progress: ${completedCount} of ${milestones.length} milestones completed (${Math.round(progress)}%)` },
      { type: "heading" as const, content: "All Milestones", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Title", "Category", "Status", "Priority", "Target Date"],
        rows: milestones.map((m) => [m.title, m.category, m.status, m.priority, m.targetDate || "Not set"]),
      }},
    ];
    generateWord({ title: "Milestone Timeline Report", filename: "milestone-timeline-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Milestone Timeline Planner">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Calendar className="w-8 h-8 text-primary" />
                  Milestone Timeline Planner
                </h1>
                <p className="text-muted-foreground mt-1">Plan and track your visa journey milestones</p>
              </div>
              {showAutoSave && (
                <Badge variant="secondary" className="animate-pulse">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                </Badge>
              )}
            </div>

            <ToolUtilityBar
              toolId="milestone-timeline"
              toolName="Milestone Timeline Planner"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="flex justify-end mt-4">
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>

            {mode === 'ai' ? (
              <div className="mt-6">
                <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Milestones</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-total-milestones">{milestones.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-completed-count">{completedCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{milestones.filter((m) => m.status === "in-progress").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">Delayed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-delayed-count">{delayedCount}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="add" data-testid="tab-add">Add Milestone</TabsTrigger>
                <TabsTrigger value="manage" data-testid="tab-manage">Manage All</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <div className="space-y-4">
                  {milestones.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No milestones yet. Add your first milestone to get started.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    milestones.map((milestone, index) => (
                      <Card key={milestone.id} className="relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_COLORS[milestone.category]}`} />
                        <CardContent className="pl-6 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {PRIORITY_ICONS[milestone.priority]}
                                <h3 className="font-semibold" data-testid={`text-milestone-title-${index}`}>{milestone.title}</h3>
                                <Badge className={STATUS_COLORS[milestone.status]} variant="secondary">
                                  {milestone.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="capitalize">{milestone.category}</span>
                                {milestone.targetDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {milestone.targetDate}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={milestone.status}
                                onValueChange={(value) => updateMilestone(milestone.id, { status: value as Milestone["status"] })}
                              >
                                <SelectTrigger className="w-32" data-testid={`select-status-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="delayed">Delayed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMilestone(milestone.id)}
                                data-testid={`button-delete-${index}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
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
                    <CardTitle>Add New Milestone</CardTitle>
                    <CardDescription>Create a new milestone for your visa journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Milestone Title</Label>
                        <Input
                          id="title"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                          placeholder="Enter milestone title"
                          data-testid="input-milestone-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetDate">Target Date</Label>
                        <Input
                          id="targetDate"
                          type="date"
                          value={newMilestone.targetDate}
                          onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                          data-testid="input-target-date"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        placeholder="Describe this milestone"
                        data-testid="input-description"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newMilestone.category}
                          onValueChange={(value) => setNewMilestone({ ...newMilestone, category: value as Milestone["category"] })}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="funding">Funding</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={newMilestone.priority}
                          onValueChange={(value) => setNewMilestone({ ...newMilestone, priority: value as Milestone["priority"] })}
                        >
                          <SelectTrigger data-testid="select-priority">
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
                      <div className="space-y-2">
                        <Label>Initial Status</Label>
                        <Select
                          value={newMilestone.status}
                          onValueChange={(value) => setNewMilestone({ ...newMilestone, status: value as Milestone["status"] })}
                        >
                          <SelectTrigger data-testid="select-initial-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={addMilestone} className="w-full" data-testid="button-add-milestone">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage">
                <Card>
                  <CardHeader>
                    <CardTitle>All Milestones</CardTitle>
                    <CardDescription>View and manage all your milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">Title</th>
                            <th className="text-left py-2 px-2">Category</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-left py-2 px-2">Priority</th>
                            <th className="text-left py-2 px-2">Target</th>
                            <th className="text-left py-2 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.map((m, i) => (
                            <tr key={m.id} className="border-b">
                              <td className="py-2 px-2 font-medium">{m.title}</td>
                              <td className="py-2 px-2 capitalize">{m.category}</td>
                              <td className="py-2 px-2">
                                <Badge className={STATUS_COLORS[m.status]} variant="secondary">{m.status}</Badge>
                              </td>
                              <td className="py-2 px-2 capitalize">{m.priority}</td>
                              <td className="py-2 px-2">{m.targetDate || "-"}</td>
                              <td className="py-2 px-2">
                                <Button variant="ghost" size="sm" onClick={() => deleteMilestone(m.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
