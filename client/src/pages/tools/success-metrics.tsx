import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, TrendingUp, CheckCircle2, Plus, Trash2, Save, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

type SuccessMetric = {
  id: string;
  name: string;
  description: string;
  category: "revenue" | "growth" | "product" | "team" | "customer";
  currentValue: number;
  targetValue: number;
  timeframe: string;
  priority: "high" | "medium" | "low";
  unit: string;
};

const DEFAULT_METRICS: SuccessMetric[] = [
  { id: "1", name: "Monthly Recurring Revenue", description: "Target MRR within first year", category: "revenue", currentValue: 0, targetValue: 10000, timeframe: "12 months", priority: "high", unit: "£" },
  { id: "2", name: "Customer Count", description: "Total paying customers", category: "customer", currentValue: 0, targetValue: 100, timeframe: "12 months", priority: "high", unit: "" },
  { id: "3", name: "Customer Satisfaction (NPS)", description: "Net Promoter Score", category: "customer", currentValue: 0, targetValue: 50, timeframe: "6 months", priority: "medium", unit: "" },
  { id: "4", name: "Team Size", description: "Full-time employees", category: "team", currentValue: 1, targetValue: 5, timeframe: "12 months", priority: "medium", unit: "" },
  { id: "5", name: "Product Market Fit Score", description: "PMF survey score", category: "product", currentValue: 0, targetValue: 40, timeframe: "6 months", priority: "high", unit: "%" },
];

export default function SuccessMetrics() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [metrics, setMetrics] = useState<SuccessMetric[]>(() => {
    const saved = localStorage.getItem("success-metrics-state");
    if (saved) {
      try {
        return JSON.parse(saved).metrics || DEFAULT_METRICS;
      } catch { }
    }
    return DEFAULT_METRICS;
  });

  const [newMetric, setNewMetric] = useState<Partial<SuccessMetric>>({
    name: "",
    description: "",
    category: "revenue",
    currentValue: 0,
    targetValue: 0,
    timeframe: "12 months",
    priority: "medium",
    unit: "",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newMetrics: SuccessMetric[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("success-metrics-state", JSON.stringify({ metrics: newMetrics }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateMetric = (id: string, updates: Partial<SuccessMetric>) => {
    const newMetrics = metrics.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics);
  };

  const addMetric = () => {
    if (!newMetric.name) {
      toast({ title: "Error", description: "Please enter a metric name", variant: "destructive" });
      return;
    }
    const metric: SuccessMetric = {
      id: Date.now().toString(),
      name: newMetric.name || "",
      description: newMetric.description || "",
      category: (newMetric.category as SuccessMetric["category"]) || "revenue",
      currentValue: newMetric.currentValue || 0,
      targetValue: newMetric.targetValue || 0,
      timeframe: newMetric.timeframe || "12 months",
      priority: (newMetric.priority as SuccessMetric["priority"]) || "medium",
      unit: newMetric.unit || "",
    };
    const newMetrics = [...metrics, metric];
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics);
    setNewMetric({ name: "", description: "", category: "revenue", currentValue: 0, targetValue: 0, timeframe: "12 months", priority: "medium", unit: "" });
    setShowAddForm(false);
    toast({ title: "Added", description: "Success metric added" });
  };

  const deleteMetric = (id: string) => {
    const newMetrics = metrics.filter(m => m.id !== id);
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics);
    toast({ title: "Deleted", description: "Metric removed" });
  };

  const getProgress = (metric: SuccessMetric) => {
    if (metric.targetValue === 0) return 0;
    return Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 100));
  };

  const getPriorityBadge = (priority: SuccessMetric["priority"]) => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High Priority</Badge>;
      case "medium": return <Badge className="bg-amber-500">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getCategoryBadge = (category: SuccessMetric["category"]) => {
    const colors: Record<string, string> = {
      revenue: "bg-green-500",
      growth: "bg-blue-500",
      product: "bg-purple-500",
      team: "bg-amber-500",
      customer: "bg-pink-500",
    };
    return <Badge className={colors[category]}>{category}</Badge>;
  };

  const chartData = metrics.map(m => ({
    name: m.name.split(" ").slice(0, 2).join(" "),
    Current: m.currentValue,
    Target: m.targetValue,
    Progress: getProgress(m),
  }));

  const radarData = metrics.map(m => ({
    metric: m.name.split(" ").slice(0, 2).join(" "),
    Progress: getProgress(m),
  }));

  const handleExportWord = () => {
    generateWord({
      title: "Success Metrics Plan",
      subtitle: "Key Performance Indicators and Targets",
      filename: "success-metrics",
      sections: [
        { type: "heading", content: "Metrics Overview", level: 1 },
        { type: "table", tableData: {
          headers: ["Metric", "Current", "Target", "Progress", "Priority"],
          rows: metrics.map(m => [
            m.name,
            `${m.unit}${m.currentValue}`,
            `${m.unit}${m.targetValue}`,
            `${getProgress(m)}%`,
            m.priority
          ])
        }},
        { type: "divider" },
        { type: "heading", content: "Detailed Metrics", level: 2 },
        ...metrics.map(m => ({
          type: "paragraph" as const,
          content: `${m.name}: ${m.description}. Current: ${m.unit}${m.currentValue}, Target: ${m.unit}${m.targetValue} within ${m.timeframe}`
        })),
      ],
    });
    toast({ title: "Export Complete", description: "Success metrics exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("success-metrics-state", JSON.stringify({ metrics }));
    toast({ title: "Saved", description: "Your metrics have been saved" });
  };

  const highPriorityMetrics = metrics.filter(m => m.priority === "high");
  const avgProgress = Math.round(metrics.reduce((acc, m) => acc + getProgress(m), 0) / metrics.length) || 0;

  return (
    <ToolAccessGuard requiredTier="premium" toolName="Success Metrics Planner">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Success Metrics Planner</h1>
            <p className="text-muted-foreground">Define and track your key success metrics and targets</p>
          </div>

          <ToolUtilityBar
            toolId="success-metrics"
            toolName="Success Metrics Planner"
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
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{metrics.length}</div>
                  <div className="text-sm text-muted-foreground">Total Metrics</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{avgProgress}%</div>
                  <div className="text-sm text-muted-foreground">Avg Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{highPriorityMetrics.length}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="manage" data-testid="tab-manage">Manage Metrics</TabsTrigger>
                <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <Card key={metric.id} data-testid={`metric-${metric.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{metric.name}</h3>
                              {getCategoryBadge(metric.category)}
                              {getPriorityBadge(metric.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {metric.unit}{metric.currentValue.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              of {metric.unit}{metric.targetValue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{getProgress(metric)}%</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${getProgress(metric)}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Timeframe: {metric.timeframe}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="manage">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Metric</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showAddForm ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Metric Name</Label>
                            <Input
                              value={newMetric.name}
                              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                              placeholder="e.g., Monthly Active Users"
                              data-testid="input-new-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={newMetric.category}
                              onValueChange={(v) => setNewMetric({ ...newMetric, category: v as SuccessMetric["category"] })}
                            >
                              <SelectTrigger data-testid="select-new-category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="growth">Growth</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="team">Team</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newMetric.description}
                            onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                            placeholder="Describe what this metric measures..."
                            data-testid="input-new-description"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Current Value</Label>
                            <Input
                              type="number"
                              value={newMetric.currentValue}
                              onChange={(e) => setNewMetric({ ...newMetric, currentValue: parseFloat(e.target.value) || 0 })}
                              data-testid="input-new-current"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Target Value</Label>
                            <Input
                              type="number"
                              value={newMetric.targetValue}
                              onChange={(e) => setNewMetric({ ...newMetric, targetValue: parseFloat(e.target.value) || 0 })}
                              data-testid="input-new-target"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit (optional)</Label>
                            <Input
                              value={newMetric.unit}
                              onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                              placeholder="£, %, etc."
                              data-testid="input-new-unit"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                              value={newMetric.priority}
                              onValueChange={(v) => setNewMetric({ ...newMetric, priority: v as SuccessMetric["priority"] })}
                            >
                              <SelectTrigger data-testid="select-new-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={addMetric} data-testid="button-add-metric">Add Metric</Button>
                          <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => setShowAddForm(true)} data-testid="button-show-add-form">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Metric
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <Card key={metric.id} data-testid={`manage-metric-${metric.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{metric.name}</span>
                              {getCategoryBadge(metric.category)}
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label className="text-xs">Current Value</Label>
                                <Input
                                  type="number"
                                  value={metric.currentValue}
                                  onChange={(e) => updateMetric(metric.id, { currentValue: parseFloat(e.target.value) || 0 })}
                                  data-testid={`input-current-${metric.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Target Value</Label>
                                <Input
                                  type="number"
                                  value={metric.targetValue}
                                  onChange={(e) => updateMetric(metric.id, { targetValue: parseFloat(e.target.value) || 0 })}
                                  data-testid={`input-target-${metric.id}`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Priority</Label>
                                <Select
                                  value={metric.priority}
                                  onValueChange={(v) => updateMetric(metric.id, { priority: v as SuccessMetric["priority"] })}
                                >
                                  <SelectTrigger data-testid={`select-priority-${metric.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMetric(metric.id)}
                            className="text-red-500"
                            data-testid={`button-delete-${metric.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Progress Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Current" fill="hsl(var(--primary))" />
                            <Bar dataKey="Target" fill="hsl(var(--muted-foreground))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Progress" dataKey="Progress" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
