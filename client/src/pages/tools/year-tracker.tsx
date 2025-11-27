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
import { Calendar, CheckCircle2, TrendingUp, Target, Plus, Trash2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "year-tracker",
  agentId: "atlas",
  agentName: "Atlas",
  agentTitle: "Growth & Strategy Expert",
  greeting: "Hello! I'm Atlas, your growth strategy specialist. Let me help you plan your year-by-year business growth trajectory and key milestones.",
  questions: [
    {
      id: "currentYear",
      text: "What is your current business status? Describe your revenue, team size, and customer base today.",
      fieldKey: "currentYear",
      minLength: 70,
      placeholder: "Share current revenue, employee count, customer numbers, and operational status..."
    },
    {
      id: "year1Goals",
      text: "What are your Year 1 goals in the UK? Include revenue, hiring, and customer targets.",
      fieldKey: "year1Goals",
      minLength: 70,
      placeholder: "Describe Year 1 targets for revenue, team growth, customers, and key milestones..."
    },
    {
      id: "year2Goals",
      text: "What growth do you expect in Year 2? How will your metrics evolve?",
      fieldKey: "year2Goals",
      minLength: 60,
      placeholder: "Share Year 2 projections for revenue, employees, customers, and strategic milestones..."
    },
    {
      id: "year3Goals",
      text: "What does Year 3 success look like? What major milestones will you achieve?",
      fieldKey: "year3Goals",
      minLength: 60,
      placeholder: "Describe Year 3 targets, profitability goals, and ILR eligibility milestones..."
    },
    {
      id: "keyMilestones",
      text: "What are your most critical milestones across the 3-5 year period?",
      fieldKey: "keyMilestones",
      minLength: 70,
      placeholder: "List key milestones: funding rounds, product launches, market entries, team expansions..."
    },
    {
      id: "growthStrategy",
      text: "What is your growth strategy? How will you achieve these year-over-year improvements?",
      fieldKey: "growthStrategy",
      minLength: 70,
      placeholder: "Describe your growth levers: marketing, sales, partnerships, product development, geographic expansion..."
    }
  ]
};

type YearData = {
  year: number;
  revenue: number;
  employees: number;
  customers: number;
  milestones: string[];
  notes: string;
  status: "planned" | "current" | "completed";
};

const INITIAL_YEARS: YearData[] = [
  { year: 2024, revenue: 0, employees: 2, customers: 0, milestones: ["Company founded", "MVP development"], notes: "", status: "completed" },
  { year: 2025, revenue: 50000, employees: 5, customers: 50, milestones: ["Visa approval", "First customers", "Seed funding"], notes: "", status: "current" },
  { year: 2026, revenue: 200000, employees: 12, customers: 200, milestones: ["Series A", "Team expansion"], notes: "", status: "planned" },
  { year: 2027, revenue: 500000, employees: 25, customers: 500, milestones: ["International expansion", "Product v2"], notes: "", status: "planned" },
  { year: 2028, revenue: 1000000, employees: 50, customers: 1000, milestones: ["Profitability", "ILR eligibility"], notes: "", status: "planned" },
];

const STATUS_COLORS = {
  completed: "bg-green-500/20 text-green-700",
  current: "bg-primary/20 text-primary",
  planned: "bg-muted text-muted-foreground",
};

export default function YearTracker() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('year-tracker-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('year-tracker-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((_answers: Record<string, string>) => {
    setMode('traditional');
    toast({
      title: "AI Guidance Complete",
      description: "Your year-by-year growth plan has been captured. Now refine your milestones."
    });
  }, [toast]);

  const [years, setYears] = useState<YearData[]>(() => {
    const saved = localStorage.getItem("year-tracker-state");
    if (saved) {
      try {
        return JSON.parse(saved).years || INITIAL_YEARS;
      } catch {}
    }
    return INITIAL_YEARS;
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newYears: YearData[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("year-tracker-state", JSON.stringify({ years: newYears }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateYear = (year: number, updates: Partial<YearData>) => {
    const newYears = years.map((y) => (y.year === year ? { ...y, ...updates } : y));
    setYears(newYears);
    triggerAutoSave(newYears);
  };

  const addMilestone = (year: number) => {
    if (!newMilestone.trim()) return;
    const yearData = years.find((y) => y.year === year);
    if (yearData) {
      updateYear(year, { milestones: [...yearData.milestones, newMilestone.trim()] });
      setNewMilestone("");
      toast({ title: "Milestone Added", description: `Added milestone to ${year}` });
    }
  };

  const removeMilestone = (year: number, index: number) => {
    const yearData = years.find((y) => y.year === year);
    if (yearData) {
      const newMilestones = yearData.milestones.filter((_, i) => i !== index);
      updateYear(year, { milestones: newMilestones });
    }
  };

  const currentYear = years.find((y) => y.status === "current");
  const completedYears = years.filter((y) => y.status === "completed").length;

  const chartData = years.map((y) => ({
    year: y.year.toString(),
    revenue: y.revenue,
    employees: y.employees,
    customers: y.customers,
  }));

  const growthData = years.slice(1).map((y, i) => {
    const prev = years[i];
    return {
      year: y.year.toString(),
      revenueGrowth: prev.revenue > 0 ? Math.round(((y.revenue - prev.revenue) / prev.revenue) * 100) : 0,
      employeeGrowth: prev.employees > 0 ? Math.round(((y.employees - prev.employees) / prev.employees) * 100) : 0,
    };
  });

  const handleSave = () => {
    localStorage.setItem("year-tracker-state", JSON.stringify({ years }));
    toast({ title: "Progress Saved", description: "Your year-by-year tracker has been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Year-by-Year Progress Report", level: 1 as const },
      { type: "paragraph" as const, content: `Current Year: ${currentYear?.year || "N/A"}` },
      { type: "heading" as const, content: "Financial Overview", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Year", "Revenue", "Employees", "Customers", "Status"],
        rows: years.map((y) => [
          y.year.toString(),
          `£${y.revenue.toLocaleString()}`,
          y.employees.toString(),
          y.customers.toString(),
          y.status,
        ]),
      }},
      { type: "heading" as const, content: "Key Milestones", level: 2 as const },
      ...years.map((y) => [
        { type: "heading" as const, content: y.year.toString(), level: 3 as const },
        { type: "list" as const, items: y.milestones },
      ]).flat(),
    ];
    generateWord({ title: "Year-by-Year Progress Report", filename: "year-progress-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Year-by-Year Progress Tracker">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Calendar className="w-8 h-8 text-primary" />
                  Year-by-Year Progress Tracker
                </h1>
                <p className="text-muted-foreground mt-1">Track yearly progress and milestones</p>
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
              toolId="year-tracker"
              toolName="Year-by-Year Progress Tracker"
              onSave={handleSave}
              onExportWord={handleExportWord}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Current Year</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-current-year">{currentYear?.year || "-"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Target Revenue</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">£{currentYear?.revenue.toLocaleString() || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Target Employees</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{currentYear?.employees || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Years Tracked</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{years.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="details" data-testid="tab-details">Year Details</TabsTrigger>
                <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {years.map((year) => (
                    <Card
                      key={year.year}
                      className={`cursor-pointer hover-elevate ${selectedYear === year.year ? "ring-2 ring-primary" : ""}`}
                      onClick={() => { setSelectedYear(year.year); setActiveTab("details"); }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold">{year.year}</h3>
                          <Badge className={STATUS_COLORS[year.status]}>{year.status}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium">£{year.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Employees</span>
                            <span className="font-medium">{year.employees}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Customers</span>
                            <span className="font-medium">{year.customers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Milestones</span>
                            <span className="font-medium">{year.milestones.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Year</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {years.map((year) => (
                          <Button
                            key={year.year}
                            variant={selectedYear === year.year ? "default" : "outline"}
                            className="w-full justify-between"
                            onClick={() => setSelectedYear(year.year)}
                            data-testid={`button-year-${year.year}`}
                          >
                            {year.year}
                            <Badge variant="secondary" className={STATUS_COLORS[year.status]}>{year.status}</Badge>
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2">
                    {selectedYear ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{selectedYear} Details</span>
                            <Select
                              value={years.find((y) => y.year === selectedYear)?.status}
                              onValueChange={(v) => updateYear(selectedYear, { status: v as YearData["status"] })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Revenue (£)</Label>
                              <Input
                                type="number"
                                value={years.find((y) => y.year === selectedYear)?.revenue || 0}
                                onChange={(e) => updateYear(selectedYear, { revenue: parseInt(e.target.value) || 0 })}
                                data-testid="input-revenue"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Employees</Label>
                              <Input
                                type="number"
                                value={years.find((y) => y.year === selectedYear)?.employees || 0}
                                onChange={(e) => updateYear(selectedYear, { employees: parseInt(e.target.value) || 0 })}
                                data-testid="input-employees"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Customers</Label>
                              <Input
                                type="number"
                                value={years.find((y) => y.year === selectedYear)?.customers || 0}
                                onChange={(e) => updateYear(selectedYear, { customers: parseInt(e.target.value) || 0 })}
                                data-testid="input-customers"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={years.find((y) => y.year === selectedYear)?.notes || ""}
                              onChange={(e) => updateYear(selectedYear, { notes: e.target.value })}
                              placeholder="Add notes for this year..."
                              data-testid="textarea-notes"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Milestones</Label>
                            <div className="flex gap-2">
                              <Input
                                value={newMilestone}
                                onChange={(e) => setNewMilestone(e.target.value)}
                                placeholder="Add a milestone..."
                                data-testid="input-new-milestone"
                              />
                              <Button onClick={() => addMilestone(selectedYear)} data-testid="button-add-milestone">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-2 mt-2">
                              {years.find((y) => y.year === selectedYear)?.milestones.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                  <span className="text-sm">{m}</span>
                                  <Button variant="ghost" size="sm" onClick={() => removeMilestone(selectedYear, i)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          Select a year to view and edit details
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue & Team Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis yAxisId="left" tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip formatter={(value: number, name: string) =>
                            name === "revenue" ? `£${value.toLocaleString()}` : value
                          } />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#ffa536" name="Revenue" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="employees" stroke="#11b6e9" name="Employees" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="customers" fill="#10B981" name="Customers" />
                        </BarChart>
                      </ResponsiveContainer>
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
