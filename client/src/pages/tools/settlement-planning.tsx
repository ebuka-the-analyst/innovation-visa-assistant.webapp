import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Home, CheckCircle2, MapPin, Building, Users, Briefcase, Car, GraduationCap, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type SettlementTask = {
  id: string;
  category: string;
  task: string;
  completed: boolean;
  notes: string;
  priority: "low" | "medium" | "high";
  timeline: string;
};

const INITIAL_TASKS: SettlementTask[] = [
  { id: "1", category: "housing", task: "Research housing options in target area", completed: false, notes: "", priority: "high", timeline: "Week 1-2" },
  { id: "2", category: "housing", task: "Set up UK bank account", completed: false, notes: "", priority: "high", timeline: "Week 1" },
  { id: "3", category: "housing", task: "Arrange temporary accommodation", completed: false, notes: "", priority: "high", timeline: "Week 1" },
  { id: "4", category: "legal", task: "Register with local council", completed: false, notes: "", priority: "medium", timeline: "Week 2-3" },
  { id: "5", category: "legal", task: "Register for National Insurance", completed: false, notes: "", priority: "high", timeline: "Week 2" },
  { id: "6", category: "health", task: "Register with GP surgery", completed: false, notes: "", priority: "medium", timeline: "Week 2-3" },
  { id: "7", category: "health", task: "Arrange health insurance if needed", completed: false, notes: "", priority: "medium", timeline: "Week 1-2" },
  { id: "8", category: "business", task: "Set up business bank account", completed: false, notes: "", priority: "high", timeline: "Week 2" },
  { id: "9", category: "business", task: "Register company address", completed: false, notes: "", priority: "high", timeline: "Week 1" },
  { id: "10", category: "family", task: "Research schools (if applicable)", completed: false, notes: "", priority: "medium", timeline: "Month 1" },
  { id: "11", category: "transport", task: "Obtain UK driving licence or convert", completed: false, notes: "", priority: "low", timeline: "Month 1-2" },
  { id: "12", category: "utilities", task: "Set up mobile phone contract", completed: false, notes: "", priority: "medium", timeline: "Week 1" },
];

const CATEGORY_INFO: Record<string, { label: string; icon: any; color: string }> = {
  housing: { label: "Housing", icon: Home, color: "bg-blue-500" },
  legal: { label: "Legal & Admin", icon: Building, color: "bg-purple-500" },
  health: { label: "Healthcare", icon: Heart, color: "bg-red-500" },
  business: { label: "Business Setup", icon: Briefcase, color: "bg-green-500" },
  family: { label: "Family", icon: Users, color: "bg-orange-500" },
  transport: { label: "Transport", icon: Car, color: "bg-yellow-500" },
  utilities: { label: "Utilities", icon: Building, color: "bg-gray-500" },
  education: { label: "Education", icon: GraduationCap, color: "bg-pink-500" },
};

export default function SettlementPlanning() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [tasks, setTasks] = useState<SettlementTask[]>(() => {
    const saved = localStorage.getItem("settlement-planning-state");
    if (saved) {
      try {
        return JSON.parse(saved).tasks || INITIAL_TASKS;
      } catch {}
    }
    return INITIAL_TASKS;
  });

  const [targetCity, setTargetCity] = useState(() => {
    const saved = localStorage.getItem("settlement-planning-state");
    if (saved) {
      try {
        return JSON.parse(saved).targetCity || "London";
      } catch {}
    }
    return "London";
  });

  const [arrivalDate, setArrivalDate] = useState(() => {
    const saved = localStorage.getItem("settlement-planning-state");
    if (saved) {
      try {
        return JSON.parse(saved).arrivalDate || "";
      } catch {}
    }
    return "";
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("settlement-planning-state", JSON.stringify({ tasks, targetCity, arrivalDate }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [tasks, targetCity, arrivalDate]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    triggerAutoSave();
  };

  const updateTaskNotes = (id: string, notes: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, notes } : t)));
    triggerAutoSave();
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  const tasksByCategory = Object.keys(CATEGORY_INFO).map((cat) => ({
    category: cat,
    ...CATEGORY_INFO[cat],
    tasks: tasks.filter((t) => t.category === cat),
    completed: tasks.filter((t) => t.category === cat && t.completed).length,
    total: tasks.filter((t) => t.category === cat).length,
  }));

  const handleSave = () => {
    localStorage.setItem("settlement-planning-state", JSON.stringify({ tasks, targetCity, arrivalDate }));
    toast({ title: "Progress Saved", description: "Your settlement plan has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "UK Settlement Plan", level: 1 as const },
      { type: "paragraph" as const, content: `Target City: ${targetCity}` },
      { type: "paragraph" as const, content: `Planned Arrival: ${arrivalDate || "Not set"}` },
      { type: "paragraph" as const, content: `Progress: ${completedCount} of ${tasks.length} tasks completed (${Math.round(progress)}%)` },
      { type: "heading" as const, content: "Tasks by Category", level: 2 as const },
      ...tasksByCategory.filter((c) => c.total > 0).map((cat) => [
        { type: "heading" as const, content: cat.label, level: 3 as const },
        { type: "list" as const, items: cat.tasks.map((t) => `[${t.completed ? "X" : " "}] ${t.task} (${t.timeline})${t.notes ? ` - ${t.notes}` : ""}`) },
      ]).flat(),
    ];
    generateWord({ title: "UK Settlement Plan", filename: "settlement-plan", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Settlement Planning">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Home className="w-8 h-8 text-primary" />
                  Settlement Planning
                </h1>
                <p className="text-muted-foreground mt-1">Plan your post-visa UK settlement journey</p>
              </div>
              {showAutoSave && (
                <Badge variant="secondary" className="animate-pulse">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                </Badge>
              )}
            </div>

            <ToolUtilityBar
              toolId="settlement-planning"
              toolName="Settlement Planning"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Target City</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-target-city">{targetCity}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-completed-tasks">{completedCount} / {tasks.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Categories</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{tasksByCategory.filter((c) => c.total > 0).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{Math.round(progress)}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Settlement Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks" data-testid="tab-tasks">All Tasks</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksByCategory.filter((c) => c.total > 0).map((cat) => {
                    const Icon = cat.icon;
                    const catProgress = (cat.completed / cat.total) * 100;
                    return (
                      <Card
                        key={cat.category}
                        className="cursor-pointer hover-elevate"
                        onClick={() => { setSelectedCategory(cat.category); setActiveTab("tasks"); }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{cat.label}</h3>
                              <p className="text-sm text-muted-foreground">
                                {cat.completed} of {cat.total} tasks
                              </p>
                            </div>
                          </div>
                          <Progress value={catProgress} className="h-2" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="space-y-4">
                  {selectedCategory && (
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                        All Categories
                      </Button>
                      <span className="text-muted-foreground">/</span>
                      <Badge>{CATEGORY_INFO[selectedCategory]?.label}</Badge>
                    </div>
                  )}

                  {(selectedCategory
                    ? tasks.filter((t) => t.category === selectedCategory)
                    : tasks
                  ).map((task, index) => {
                    const catInfo = CATEGORY_INFO[task.category];
                    const Icon = catInfo?.icon || Building;
                    return (
                      <Card key={task.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(task.id)}
                              data-testid={`checkbox-task-${index}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-6 h-6 rounded ${catInfo?.color || "bg-gray-500"} flex items-center justify-center`}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {task.task}
                                </span>
                                <Badge variant="outline" className="text-xs">{task.timeline}</Badge>
                              </div>
                              <Input
                                value={task.notes}
                                onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                                placeholder="Add notes..."
                                className="mt-2 text-sm"
                                data-testid={`input-notes-${index}`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settlement Details</CardTitle>
                    <CardDescription>Configure your settlement preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetCity">Target City</Label>
                        <Select value={targetCity} onValueChange={(v) => { setTargetCity(v); triggerAutoSave(); }}>
                          <SelectTrigger data-testid="select-target-city">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="London">London</SelectItem>
                            <SelectItem value="Manchester">Manchester</SelectItem>
                            <SelectItem value="Birmingham">Birmingham</SelectItem>
                            <SelectItem value="Edinburgh">Edinburgh</SelectItem>
                            <SelectItem value="Bristol">Bristol</SelectItem>
                            <SelectItem value="Leeds">Leeds</SelectItem>
                            <SelectItem value="Glasgow">Glasgow</SelectItem>
                            <SelectItem value="Cambridge">Cambridge</SelectItem>
                            <SelectItem value="Oxford">Oxford</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="arrivalDate">Planned Arrival Date</Label>
                        <Input
                          id="arrivalDate"
                          type="date"
                          value={arrivalDate}
                          onChange={(e) => { setArrivalDate(e.target.value); triggerAutoSave(); }}
                          data-testid="input-arrival-date"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-4">Quick Tips for {targetCity}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          Research average rental costs in your target area
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          Consider transport links when choosing accommodation
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          Join local entrepreneur and business networking groups
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                          Open bank account as soon as possible after arrival
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
