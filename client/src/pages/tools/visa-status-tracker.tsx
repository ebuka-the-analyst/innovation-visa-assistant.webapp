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
import { Clock, CheckCircle2, Circle, AlertTriangle, Calendar, FileText, Send, Eye, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "visa-status-tracker",
  agentId: "sage",
  agentName: "Sage",
  agentTitle: "Compliance & Documentation Expert",
  greeting: "Hello! I'm Sage, your compliance specialist. I'll help you track your visa application status effectively. Let's set up your application tracking details.",
  questions: [
    {
      id: "applicationId",
      text: "What is your application reference number or tracking ID from the endorsing body?",
      fieldKey: "applicationId",
      minLength: 50,
      placeholder: "Describe your application reference, when you received it, and any secondary tracking numbers..."
    },
    {
      id: "endorsingBody",
      text: "Which endorsing body is processing your application? (e.g., Tech Nation, Innovator International, UK universities)",
      fieldKey: "endorsingBody",
      minLength: 50,
      placeholder: "Name the endorsing body and describe why you chose them..."
    },
    {
      id: "submissionDate",
      text: "When did you submit your application to the endorsing body? What documents were included?",
      fieldKey: "submissionDate",
      minLength: 60,
      placeholder: "Provide the submission date and list the key documents you submitted..."
    },
    {
      id: "currentStatus",
      text: "What is the current status of your application? (draft, submitted, under review, additional info requested, decision pending, approved, rejected)",
      fieldKey: "currentStatus",
      minLength: 50,
      placeholder: "Describe the current status and any recent communications..."
    },
    {
      id: "lastUpdate",
      text: "When was the last update you received? What did it say?",
      fieldKey: "lastUpdate",
      minLength: 60,
      placeholder: "Describe the most recent communication and its contents..."
    },
    {
      id: "nextSteps",
      text: "What are your expected next steps or pending actions?",
      fieldKey: "nextSteps",
      minLength: 50,
      placeholder: "Describe any pending actions, upcoming deadlines, or expected milestones..."
    },
    {
      id: "notes",
      text: "Are there any additional notes or concerns about your application status?",
      fieldKey: "notes",
      minLength: 50,
      placeholder: "Share any concerns, questions for the endorsing body, or observations..."
    }
  ]
};

type StatusUpdate = {
  id: string;
  date: string;
  status: string;
  notes: string;
};

type ApplicationData = {
  applicationId: string;
  endorsingBody: string;
  submissionDate: string;
  visaType: string;
  currentStatus: "draft" | "submitted" | "under-review" | "additional-info" | "decision-pending" | "approved" | "rejected";
  lastUpdated: string;
  updates: StatusUpdate[];
  notes: string;
};

const STATUS_INFO = {
  draft: { label: "Draft", color: "bg-gray-500", icon: FileText, description: "Application not yet submitted" },
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Send, description: "Application submitted, awaiting review" },
  "under-review": { label: "Under Review", color: "bg-yellow-500", icon: Eye, description: "Application being reviewed" },
  "additional-info": { label: "Additional Info Requested", color: "bg-orange-500", icon: AlertTriangle, description: "Endorser requested more information" },
  "decision-pending": { label: "Decision Pending", color: "bg-purple-500", icon: Timer, description: "Review complete, awaiting decision" },
  approved: { label: "Approved", color: "bg-green-500", icon: CheckCircle2, description: "Application approved!" },
  rejected: { label: "Rejected", color: "bg-red-500", icon: AlertTriangle, description: "Application was not successful" },
};

const INITIAL_DATA: ApplicationData = {
  applicationId: "",
  endorsingBody: "",
  submissionDate: "",
  visaType: "innovator-founder",
  currentStatus: "draft",
  lastUpdated: "",
  updates: [],
  notes: "",
};

export default function VisaStatusTracker() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('visa-status-tracker-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('visa-status-tracker-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, string>) => {
    const newData = { ...data };
    if (answers.applicationId) newData.applicationId = answers.applicationId;
    if (answers.endorsingBody) newData.endorsingBody = answers.endorsingBody;
    if (answers.notes) newData.notes = answers.notes;
    setData(newData);
    setMode('traditional');
    toast({
      title: "AI Guidance Complete",
      description: "Your responses have been captured. Review and refine your tracking details."
    });
  }, [data, toast]);

  const [data, setData] = useState<ApplicationData>(() => {
    const saved = localStorage.getItem("visa-status-tracker-state");
    if (saved) {
      try {
        return JSON.parse(saved).data || INITIAL_DATA;
      } catch {}
    }
    return INITIAL_DATA;
  });

  const [newUpdate, setNewUpdate] = useState({ status: "", notes: "" });
  const [activeTab, setActiveTab] = useState("status");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newData: ApplicationData) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("visa-status-tracker-state", JSON.stringify({ data: newData }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateData = (updates: Partial<ApplicationData>) => {
    const newData = { ...data, ...updates, lastUpdated: new Date().toISOString() };
    setData(newData);
    triggerAutoSave(newData);
  };

  const addStatusUpdate = () => {
    if (!newUpdate.status) {
      toast({ title: "Error", description: "Please select a status", variant: "destructive" });
      return;
    }
    const update: StatusUpdate = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: newUpdate.status,
      notes: newUpdate.notes,
    };
    const newData = {
      ...data,
      currentStatus: newUpdate.status as ApplicationData["currentStatus"],
      updates: [update, ...data.updates],
      lastUpdated: new Date().toISOString(),
    };
    setData(newData);
    triggerAutoSave(newData);
    setNewUpdate({ status: "", notes: "" });
    toast({ title: "Status Updated", description: "Application status has been updated" });
  };

  const getProgress = () => {
    const statusOrder = ["draft", "submitted", "under-review", "additional-info", "decision-pending", "approved"];
    const index = statusOrder.indexOf(data.currentStatus);
    if (data.currentStatus === "rejected") return 100;
    return ((index + 1) / statusOrder.length) * 100;
  };

  const getDaysSinceSubmission = () => {
    if (!data.submissionDate) return null;
    const start = new Date(data.submissionDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceSubmission = getDaysSinceSubmission();
  const statusInfo = STATUS_INFO[data.currentStatus];
  const StatusIcon = statusInfo.icon;

  const handleSave = () => {
    localStorage.setItem("visa-status-tracker-state", JSON.stringify({ data }));
    toast({ title: "Progress Saved", description: "Your tracker has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Visa Status Report", level: 1 as const },
      { type: "paragraph" as const, content: `Application ID: ${data.applicationId || "Not set"}` },
      { type: "paragraph" as const, content: `Endorsing Body: ${data.endorsingBody || "Not set"}` },
      { type: "paragraph" as const, content: `Submission Date: ${data.submissionDate || "Not set"}` },
      { type: "paragraph" as const, content: `Current Status: ${statusInfo.label}` },
      { type: "heading" as const, content: "Status History", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Date", "Status", "Notes"],
        rows: data.updates.map((u) => [
          new Date(u.date).toLocaleDateString("en-GB"),
          u.status,
          u.notes || "-",
        ]),
      }},
    ];
    generateWord({ title: "Visa Status Report", filename: "visa-status-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Visa Status Tracker">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Clock className="w-8 h-8 text-primary" />
                  Visa Status Tracker
                </h1>
                <p className="text-muted-foreground mt-1">Track your visa application status in real-time</p>
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
                />
              </div>
            </div>

            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
            ) : (
              <>
            <ToolUtilityBar
              toolId="visa-status-tracker"
              toolName="Visa Status Tracker"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color.replace("bg-", "text-")}`} />
                    <span className="text-sm text-muted-foreground">Current Status</span>
                  </div>
                  <p className="text-xl font-bold mt-1" data-testid="text-current-status">{statusInfo.label}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Days Tracking</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{daysSinceSubmission ?? "-"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Updates</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{data.updates.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Progress</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{Math.round(getProgress())}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Application Progress</span>
                  <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </CardContent>
            </Card>

            {data.currentStatus === "additional-info" && (
              <Alert className="mb-6 border-orange-500">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Additional information has been requested. Please respond promptly to avoid delays.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="status" data-testid="tab-status">Status</TabsTrigger>
                <TabsTrigger value="update" data-testid="tab-update">Add Update</TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="status">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                      <CardDescription>Your application status at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className={`w-16 h-16 rounded-full ${statusInfo.color} flex items-center justify-center`}>
                          <StatusIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{statusInfo.label}</h3>
                          <p className="text-muted-foreground">{statusInfo.description}</p>
                          {data.lastUpdated && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Last updated: {new Date(data.lastUpdated).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <h4 className="font-semibold">Status Journey</h4>
                        <div className="flex items-center justify-between">
                          {Object.entries(STATUS_INFO).slice(0, -1).map(([key, info], i) => {
                            const Icon = info.icon;
                            const isActive = data.currentStatus === key;
                            const isPast = Object.keys(STATUS_INFO).indexOf(data.currentStatus) > i;
                            return (
                              <div key={key} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isActive ? info.color : isPast ? "bg-green-500" : "bg-muted"
                                }`}>
                                  {isPast ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                                  )}
                                </div>
                                <span className="text-xs mt-1 text-center max-w-16">{info.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>Key metrics for your application</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Application ID</span>
                        <Badge variant="outline">{data.applicationId || "Not set"}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Endorsing Body</span>
                        <Badge variant="outline">{data.endorsingBody || "Not set"}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Visa Type</span>
                        <Badge variant="outline">{data.visaType === "innovator-founder" ? "Innovator Founder" : data.visaType}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>Days Since Submission</span>
                        <Badge variant="outline">{daysSinceSubmission ?? "N/A"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="update">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Status Update</CardTitle>
                    <CardDescription>Record a new status update for your application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>New Status</Label>
                      <Select value={newUpdate.status} onValueChange={(v) => setNewUpdate({ ...newUpdate, status: v })}>
                        <SelectTrigger data-testid="select-new-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_INFO).map(([key, info]) => (
                            <SelectItem key={key} value={key}>{info.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={newUpdate.notes}
                        onChange={(e) => setNewUpdate({ ...newUpdate, notes: e.target.value })}
                        placeholder="Add any relevant notes..."
                        data-testid="textarea-update-notes"
                      />
                    </div>
                    <Button onClick={addStatusUpdate} className="w-full" data-testid="button-add-update">
                      Add Update
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Status History</CardTitle>
                    <CardDescription>Timeline of all status updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.updates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No status updates yet. Add your first update to start tracking.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.updates.map((update, index) => {
                          const info = STATUS_INFO[update.status as keyof typeof STATUS_INFO];
                          const Icon = info?.icon || Circle;
                          return (
                            <div key={update.id} className="flex gap-4 items-start">
                              <div className={`w-10 h-10 rounded-full ${info?.color || "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{info?.label || update.status}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(update.date).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                {update.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Enter your application information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Application ID</Label>
                        <Input
                          value={data.applicationId}
                          onChange={(e) => updateData({ applicationId: e.target.value })}
                          placeholder="e.g., GWF000000000"
                          data-testid="input-application-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Endorsing Body</Label>
                        <Select value={data.endorsingBody} onValueChange={(v) => updateData({ endorsingBody: v })}>
                          <SelectTrigger data-testid="select-endorsing-body">
                            <SelectValue placeholder="Select endorsing body" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tech Nation">Tech Nation</SelectItem>
                            <SelectItem value="Entrepreneur First">Entrepreneur First</SelectItem>
                            <SelectItem value="Seedcamp">Seedcamp</SelectItem>
                            <SelectItem value="Founders Factory">Founders Factory</SelectItem>
                            <SelectItem value="Bethnal Green Ventures">Bethnal Green Ventures</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Submission Date</Label>
                        <Input
                          type="date"
                          value={data.submissionDate}
                          onChange={(e) => updateData({ submissionDate: e.target.value })}
                          data-testid="input-submission-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Visa Type</Label>
                        <Select value={data.visaType} onValueChange={(v) => updateData({ visaType: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="innovator-founder">Innovator Founder</SelectItem>
                            <SelectItem value="scale-up">Scale-up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={data.notes}
                        onChange={(e) => updateData({ notes: e.target.value })}
                        placeholder="Any additional notes about your application..."
                        data-testid="textarea-notes"
                      />
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
