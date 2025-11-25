import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, Clock, Calendar, AlertTriangle, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";

type MilestoneStatus = "completed" | "in-progress" | "pending";

type Milestone = {
  id: string;
  title: string;
  description: string;
  targetWeek: string;
  status: MilestoneStatus;
  dueDate: string;
};

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", title: "Initial Research & Preparation", description: "Research visa requirements, endorsement bodies, and eligibility criteria", targetWeek: "W1-2", status: "pending", dueDate: "" },
  { id: "2", title: "Business Plan Development", description: "Create comprehensive business plan demonstrating innovation and viability", targetWeek: "W3-4", status: "pending", dueDate: "" },
  { id: "3", title: "Evidence Collection", description: "Gather supporting documents, market research, and financial projections", targetWeek: "W5-8", status: "pending", dueDate: "" },
  { id: "4", title: "Endorsement Application", description: "Apply to approved endorsement body and attend interview", targetWeek: "W9-12", status: "pending", dueDate: "" },
  { id: "5", title: "Visa Application Submission", description: "Submit visa application with endorsement letter and supporting documents", targetWeek: "W13-14", status: "pending", dueDate: "" },
  { id: "6", title: "Biometrics & Interview", description: "Complete biometrics appointment and visa interview if required", targetWeek: "W15-16", status: "pending", dueDate: "" },
  { id: "7", title: "Decision & Collection", description: "Receive visa decision and collect BRP card", targetWeek: "W17-20", status: "pending", dueDate: "" },
];

export default function VisaTimeline() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem("visa-timeline-state");
    if (saved) {
      try {
        return JSON.parse(saved).milestones || DEFAULT_MILESTONES;
      } catch { }
    }
    return DEFAULT_MILESTONES;
  });

  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem("visa-timeline-state");
    if (saved) {
      try {
        return JSON.parse(saved).startDate || "";
      } catch { }
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

  const triggerAutoSave = useCallback((newMilestones: Milestone[], newStartDate: string) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const state = { milestones: newMilestones, startDate: newStartDate };
      localStorage.setItem("visa-timeline-state", JSON.stringify(state));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateMilestoneStatus = (id: string, status: MilestoneStatus) => {
    const newMilestones = milestones.map(m => m.id === id ? { ...m, status } : m);
    setMilestones(newMilestones);
    triggerAutoSave(newMilestones, startDate);
  };

  const updateMilestoneDueDate = (id: string, dueDate: string) => {
    const newMilestones = milestones.map(m => m.id === id ? { ...m, dueDate } : m);
    setMilestones(newMilestones);
    triggerAutoSave(newMilestones, startDate);
  };

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in-progress": return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case "completed": return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "in-progress": return <Badge variant="default" className="bg-amber-500">In Progress</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleExportWord = () => {
    generateWord({
      title: "Visa Journey Timeline",
      subtitle: "UK Innovator Founder Visa Application Timeline",
      filename: "visa-timeline",
      sections: [
        { type: "heading", content: "Timeline Overview", level: 1 },
        { type: "paragraph", content: `Overall Progress: ${progressPercent}% complete (${completedCount}/${milestones.length} milestones)` },
        { type: "paragraph", content: `Start Date: ${startDate || "Not set"}` },
        { type: "divider" },
        { type: "heading", content: "Milestones", level: 2 },
        ...milestones.map(m => ({
          type: "paragraph" as const,
          content: `${m.title} (${m.targetWeek}): ${m.status.toUpperCase()} - ${m.description}${m.dueDate ? ` | Due: ${m.dueDate}` : ""}`
        })),
      ],
    });
    toast({ title: "Export Complete", description: "Timeline exported to Word document" });
  };

  const handleSave = () => {
    const state = { milestones, startDate };
    localStorage.setItem("visa-timeline-state", JSON.stringify(state));
    toast({ title: "Saved", description: "Your timeline has been saved" });
  };

  return (
    <ToolAccessGuard requiredTier="free" toolName="Visa Journey Timeline Planner">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Visa Journey Timeline Planner</h1>
            <p className="text-muted-foreground">Plan and track your UK Innovator Founder Visa application milestones</p>
          </div>

          <ToolUtilityBar
            toolId="visa-timeline"
            toolName="Visa Journey Timeline Planner"
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Timeline Progress
                </CardTitle>
                <CardDescription>Track your visa application journey from start to finish</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="start-date">Journey Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        triggerAutoSave(milestones, e.target.value);
                      }}
                      className="w-48"
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {completedCount} of {milestones.length} milestones completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="list" data-testid="tab-list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <Card>
                  <CardContent className="pt-6">
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                          <div key={milestone.id} className="relative pl-14" data-testid={`milestone-${milestone.id}`}>
                            <div className="absolute left-4 -translate-x-1/2 bg-background p-1">
                              {getStatusIcon(milestone.status)}
                            </div>
                            <Card className={milestone.status === "in-progress" ? "border-amber-500 border-2" : ""}>
                              <CardContent className="pt-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="font-semibold">{milestone.title}</h3>
                                      {getStatusBadge(milestone.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                      <span className="text-muted-foreground">Target: <strong>{milestone.targetWeek}</strong></span>
                                      {milestone.dueDate && (
                                        <span className="text-muted-foreground">Due: <strong>{milestone.dueDate}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Select
                                      value={milestone.status}
                                      onValueChange={(value) => updateMilestoneStatus(milestone.id, value as MilestoneStatus)}
                                    >
                                      <SelectTrigger className="w-36" data-testid={`select-status-${milestone.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="date"
                                      value={milestone.dueDate}
                                      onChange={(e) => updateMilestoneDueDate(milestone.id, e.target.value)}
                                      className="w-36"
                                      data-testid={`input-due-date-${milestone.id}`}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            {index < milestones.length - 1 && (
                              <div className="absolute left-4 -translate-x-1/2 mt-2">
                                <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex flex-wrap items-center gap-4 p-4 border rounded-lg"
                          data-testid={`list-milestone-${milestone.id}`}
                        >
                          {getStatusIcon(milestone.status)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.targetWeek}</p>
                          </div>
                          {getStatusBadge(milestone.status)}
                          <Select
                            value={milestone.status}
                            onValueChange={(value) => updateMilestoneStatus(milestone.id, value as MilestoneStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Important Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                    <span>Ensure all documents are certified and translated if not in English</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                    <span>Book biometrics appointment as soon as you receive confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                    <span>Keep copies of all submitted documents for your records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                    <span>Typical processing time is 3-8 weeks after submission</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
