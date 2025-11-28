import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag, CheckCircle2, Circle, Clock, Plus, Calendar, Trophy, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type MilestoneStatus = "completed" | "in-progress" | "pending" | "at-risk";

type Milestone = {
  id: string;
  title: string;
  description: string;
  category: "product" | "business" | "funding" | "team" | "visa";
  targetDate: string;
  completedDate: string;
  status: MilestoneStatus;
  evidence: string;
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", title: "Complete MVP Development", description: "Finish minimum viable product with core features", category: "product", targetDate: "", completedDate: "", status: "pending", evidence: "" },
  { id: "2", title: "First Paying Customer", description: "Acquire first paying customer or client", category: "business", targetDate: "", completedDate: "", status: "pending", evidence: "" },
  { id: "3", title: "Secure Endorsement", description: "Obtain endorsement from approved body", category: "visa", targetDate: "", completedDate: "", status: "pending", evidence: "" },
  { id: "4", title: "Initial Funding Round", description: "Complete first funding round or investment", category: "funding", targetDate: "", completedDate: "", status: "pending", evidence: "" },
  { id: "5", title: "Hire First Employee", description: "Make first full-time hire", category: "team", targetDate: "", completedDate: "", status: "pending", evidence: "" },
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'milestones-tracker',
  toolName: 'Milestones Tracker',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. Tracking milestones is essential for demonstrating progress to endorsers and meeting visa requirements. Let me help you define key milestones for your business. Ready to plan your journey?",
  questions: [
    {
      id: 'next-milestone',
      question: "What is the next major milestone you're working toward?",
      hint: "E.g., 'Launch MVP', 'First 10 customers', 'Secure seed funding'",
      fieldKey: 'nextMilestone',
      required: true
    },
    {
      id: 'milestone-category',
      question: "What category does this milestone fall under? (product, business, funding, team, visa)",
      hint: "Endorsers look for progress across multiple areas",
      fieldKey: 'milestoneCategory'
    },
    {
      id: 'target-date',
      question: "What is your target date for achieving this milestone?",
      hint: "Be realistic - missed deadlines can raise concerns with endorsers",
      fieldKey: 'targetDate'
    },
    {
      id: 'milestone-evidence',
      question: "What evidence will you have when this milestone is complete?",
      hint: "E.g., 'Screenshot of live product', 'Signed customer contract', 'Bank statement showing investment'",
      fieldKey: 'milestoneEvidence'
    },
    {
      id: 'blockers',
      question: "What are the main obstacles or risks to achieving this milestone?",
      hint: "Identifying risks shows maturity and planning capability",
      fieldKey: 'blockers'
    },
    {
      id: 'support-needed',
      question: "What support or resources do you need to achieve this milestone?",
      hint: "Consider team, funding, partnerships, or expertise needed",
      fieldKey: 'supportNeeded'
    }
  ],
  completionMessage: "Great! I've captured your milestone details. I'm now adding it to your tracker. You can add more milestones and update their status as you make progress."
};

export default function MilestonesTracker() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('milestones-tracker-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('milestones-tracker-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem("milestones-tracker-state");
    if (saved) {
      try {
        return JSON.parse(saved).milestones || DEFAULT_MILESTONES;
      } catch { }
    }
    return DEFAULT_MILESTONES;
  });

  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: "",
    description: "",
    category: "business",
    targetDate: "",
    status: "pending",
  });

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('milestones-tracker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.nextMilestone) {
      const categoryMap: Record<string, Milestone['category']> = {
        product: 'product', business: 'business', funding: 'funding', team: 'team', visa: 'visa'
      };
      const category = answers.milestoneCategory?.toLowerCase() || 'business';
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        title: answers.nextMilestone,
        description: answers.blockers ? `Risks: ${answers.blockers}` : '',
        category: categoryMap[category] || 'business',
        targetDate: answers.targetDate || '',
        completedDate: '',
        status: 'pending',
        evidence: answers.milestoneEvidence || ''
      };
      setMilestones(prev => [...prev, newMilestone]);
      triggerAutoSave([...milestones, newMilestone]);
    }
    setMode('traditional');
  };

  const triggerAutoSave = useCallback((newMilestones: Milestone[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("milestones-tracker-state", JSON.stringify({ milestones: newMilestones }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const newMilestones = milestones.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    setMilestones(newMilestones);
    triggerAutoSave(newMilestones);
  };

  const addMilestone = () => {
    if (!newMilestone.title) {
      toast({ title: "Error", description: "Please enter a milestone title", variant: "destructive" });
      return;
    }
    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title || "",
      description: newMilestone.description || "",
      category: (newMilestone.category as Milestone["category"]) || "business",
      targetDate: newMilestone.targetDate || "",
      completedDate: "",
      status: "pending",
      evidence: "",
    };
    const newMilestones = [...milestones, milestone];
    setMilestones(newMilestones);
    triggerAutoSave(newMilestones);
    setNewMilestone({ title: "", description: "", category: "business", targetDate: "", status: "pending" });
    setDialogOpen(false);
    toast({ title: "Added", description: "Milestone added successfully" });
  };

  const deleteMilestone = (id: string) => {
    const newMilestones = milestones.filter(m => m.id !== id);
    setMilestones(newMilestones);
    triggerAutoSave(newMilestones);
    toast({ title: "Deleted", description: "Milestone removed" });
  };

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress": return <Clock className="w-5 h-5 text-amber-500" />;
      case "at-risk": return <Flag className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress": return <Badge className="bg-amber-500">In Progress</Badge>;
      case "at-risk": return <Badge variant="destructive">At Risk</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCategoryBadge = (category: Milestone["category"]) => {
    const colors: Record<string, string> = {
      product: "bg-blue-500",
      business: "bg-purple-500",
      funding: "bg-green-500",
      team: "bg-amber-500",
      visa: "bg-red-500",
    };
    return <Badge className={colors[category]}>{category}</Badge>;
  };

  const filteredMilestones = activeTab === "all" 
    ? milestones 
    : milestones.filter(m => m.category === activeTab);

  const handleExportWord = () => {
    generateWord({
      title: "Key Milestones Tracker",
      subtitle: "Business Milestone Progress Report",
      filename: "milestones-tracker",
      sections: [
        { type: "heading", content: "Milestone Summary", level: 1 },
        { type: "paragraph", content: `Overall Progress: ${progressPercent}% complete (${completedCount}/${milestones.length} milestones)` },
        { type: "divider" },
        { type: "heading", content: "All Milestones", level: 2 },
        { type: "table", tableData: {
          headers: ["Milestone", "Category", "Status", "Target Date"],
          rows: milestones.map(m => [
            m.title,
            m.category,
            m.status,
            m.targetDate || "Not set"
          ])
        }},
      ],
    });
    toast({ title: "Export Complete", description: "Milestones exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("milestones-tracker-state", JSON.stringify({ milestones }));
    toast({ title: "Saved", description: "Your milestones have been saved" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Key Milestones Tracker">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Key Milestones Tracker</h1>
                <p className="text-muted-foreground">Track and document your business achievements and progress</p>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="milestones-tracker"
            toolName="Key Milestones Tracker"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          <div className="mt-6">
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{milestones.filter(m => m.status === "in-progress").length}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Flag className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{milestones.filter(m => m.status === "at-risk").length}</div>
                  <div className="text-sm text-muted-foreground">At Risk</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-2">Overall Progress</div>
                  <Progress value={progressPercent} className="h-3 mb-1" />
                  <div className="text-right text-sm font-medium">{progressPercent}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="product" data-testid="tab-product">Product</TabsTrigger>
                  <TabsTrigger value="business" data-testid="tab-business">Business</TabsTrigger>
                  <TabsTrigger value="funding" data-testid="tab-funding">Funding</TabsTrigger>
                  <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
                  <TabsTrigger value="visa" data-testid="tab-visa">Visa</TabsTrigger>
                </TabsList>
              </Tabs>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-milestone">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Milestone</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        placeholder="Enter milestone title"
                        data-testid="input-new-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                        placeholder="Describe the milestone"
                        data-testid="input-new-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newMilestone.category}
                          onValueChange={(v) => setNewMilestone({ ...newMilestone, category: v as Milestone["category"] })}
                        >
                          <SelectTrigger data-testid="select-new-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="funding">Funding</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="visa">Visa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Date</Label>
                        <Input
                          type="date"
                          value={newMilestone.targetDate}
                          onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                          data-testid="input-new-target-date"
                        />
                      </div>
                    </div>
                    <Button onClick={addMilestone} className="w-full" data-testid="button-save-milestone">
                      Add Milestone
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {filteredMilestones.map((milestone) => (
                <Card key={milestone.id} className={milestone.status === "at-risk" ? "border-red-500 border-2" : ""} data-testid={`milestone-${milestone.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="shrink-0">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          {getCategoryBadge(milestone.category)}
                          {getStatusBadge(milestone.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                        
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Status</Label>
                            <Select
                              value={milestone.status}
                              onValueChange={(v) => updateMilestone(milestone.id, { status: v as MilestoneStatus })}
                            >
                              <SelectTrigger data-testid={`select-status-${milestone.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="at-risk">At Risk</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Target Date</Label>
                            <Input
                              type="date"
                              value={milestone.targetDate}
                              onChange={(e) => updateMilestone(milestone.id, { targetDate: e.target.value })}
                              data-testid={`input-target-${milestone.id}`}
                            />
                          </div>
                          {milestone.status === "completed" && (
                            <div className="space-y-2">
                              <Label className="text-xs">Completed Date</Label>
                              <Input
                                type="date"
                                value={milestone.completedDate}
                                onChange={(e) => updateMilestone(milestone.id, { completedDate: e.target.value })}
                                data-testid={`input-completed-${milestone.id}`}
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label className="text-xs">Evidence/Notes</Label>
                          <Textarea
                            value={milestone.evidence}
                            onChange={(e) => updateMilestone(milestone.id, { evidence: e.target.value })}
                            placeholder="Document evidence or notes for this milestone..."
                            className="min-h-[80px]"
                            data-testid={`textarea-evidence-${milestone.id}`}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${milestone.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMilestones.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No milestones in this category</h3>
                    <p className="text-sm text-muted-foreground">Add a new milestone to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
