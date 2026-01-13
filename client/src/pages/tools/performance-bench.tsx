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
import { BarChart3, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight, AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "performance-bench",
  toolName: "Performance Benchmarking",
  agent: "sterling",
  greeting: "Hello! I'm Sterling, your financial performance analyst. Let's compare your business metrics against industry standards to strengthen your visa application with data-driven insights.",
  questions: [
    {
      id: "industry",
      question: "What industry is your business in? (FinTech, HealthTech, SaaS, E-Commerce, EdTech)",
      hint: "This helps us select the right benchmark comparisons",
      fieldKey: "industry"
    },
    {
      id: "mrr_growth",
      question: "What is your current monthly recurring revenue (MRR) growth rate?",
      hint: "Example: '15% month-over-month growth'",
      fieldKey: "mrrGrowth"
    },
    {
      id: "cac",
      question: "What is your customer acquisition cost (CAC)?",
      hint: "Example: '£150 per customer'",
      fieldKey: "cac"
    },
    {
      id: "ltv",
      question: "What is your customer lifetime value (LTV)?",
      hint: "Example: '£1,200 average revenue per customer over their lifetime'",
      fieldKey: "ltv"
    },
    {
      id: "churn",
      question: "What is your monthly customer churn rate?",
      hint: "Example: '3% of customers leave each month'",
      fieldKey: "churn"
    },
    {
      id: "nps",
      question: "What is your Net Promoter Score (NPS)?",
      hint: "Scale from -100 to 100, with 50+ being excellent",
      fieldKey: "nps"
    },
    {
      id: "runway",
      question: "How many months of runway do you have at current burn rate?",
      hint: "Example: '18 months of runway remaining'",
      fieldKey: "runway"
    }
  ],
  completionMessage: "Great! I've captured your metrics. Let me now compare them against industry benchmarks and provide recommendations."
};

type BenchmarkMetric = {
  id: string;
  name: string;
  yourValue: number;
  industryAvg: number;
  topPerformer: number;
  unit: string;
  higherIsBetter: boolean;
};

type Industry = "fintech" | "healthtech" | "saas" | "ecommerce" | "edtech";

const INDUSTRY_BENCHMARKS: Record<Industry, BenchmarkMetric[]> = {
  fintech: [
    { id: "mrr-growth", name: "MRR Growth Rate", yourValue: 0, industryAvg: 15, topPerformer: 35, unit: "%", higherIsBetter: true },
    { id: "cac", name: "Customer Acquisition Cost", yourValue: 0, industryAvg: 200, topPerformer: 100, unit: "£", higherIsBetter: false },
    { id: "ltv", name: "Customer Lifetime Value", yourValue: 0, industryAvg: 1500, topPerformer: 3000, unit: "£", higherIsBetter: true },
    { id: "churn", name: "Monthly Churn Rate", yourValue: 0, industryAvg: 5, topPerformer: 2, unit: "%", higherIsBetter: false },
    { id: "nps", name: "Net Promoter Score", yourValue: 0, industryAvg: 40, topPerformer: 70, unit: "", higherIsBetter: true },
    { id: "runway", name: "Runway (months)", yourValue: 0, industryAvg: 12, topPerformer: 24, unit: "", higherIsBetter: true },
  ],
  healthtech: [
    { id: "mrr-growth", name: "MRR Growth Rate", yourValue: 0, industryAvg: 12, topPerformer: 28, unit: "%", higherIsBetter: true },
    { id: "cac", name: "Customer Acquisition Cost", yourValue: 0, industryAvg: 350, topPerformer: 150, unit: "£", higherIsBetter: false },
    { id: "ltv", name: "Customer Lifetime Value", yourValue: 0, industryAvg: 2500, topPerformer: 5000, unit: "£", higherIsBetter: true },
    { id: "churn", name: "Monthly Churn Rate", yourValue: 0, industryAvg: 4, topPerformer: 1.5, unit: "%", higherIsBetter: false },
    { id: "nps", name: "Net Promoter Score", yourValue: 0, industryAvg: 45, topPerformer: 75, unit: "", higherIsBetter: true },
    { id: "runway", name: "Runway (months)", yourValue: 0, industryAvg: 15, topPerformer: 30, unit: "", higherIsBetter: true },
  ],
  saas: [
    { id: "mrr-growth", name: "MRR Growth Rate", yourValue: 0, industryAvg: 10, topPerformer: 25, unit: "%", higherIsBetter: true },
    { id: "cac", name: "Customer Acquisition Cost", yourValue: 0, industryAvg: 150, topPerformer: 80, unit: "£", higherIsBetter: false },
    { id: "ltv", name: "Customer Lifetime Value", yourValue: 0, industryAvg: 1200, topPerformer: 2500, unit: "£", higherIsBetter: true },
    { id: "churn", name: "Monthly Churn Rate", yourValue: 0, industryAvg: 6, topPerformer: 3, unit: "%", higherIsBetter: false },
    { id: "nps", name: "Net Promoter Score", yourValue: 0, industryAvg: 35, topPerformer: 65, unit: "", higherIsBetter: true },
    { id: "runway", name: "Runway (months)", yourValue: 0, industryAvg: 10, topPerformer: 20, unit: "", higherIsBetter: true },
  ],
  ecommerce: [
    { id: "mrr-growth", name: "Revenue Growth Rate", yourValue: 0, industryAvg: 20, topPerformer: 50, unit: "%", higherIsBetter: true },
    { id: "cac", name: "Customer Acquisition Cost", yourValue: 0, industryAvg: 50, topPerformer: 25, unit: "£", higherIsBetter: false },
    { id: "ltv", name: "Customer Lifetime Value", yourValue: 0, industryAvg: 300, topPerformer: 600, unit: "£", higherIsBetter: true },
    { id: "churn", name: "Customer Churn Rate", yourValue: 0, industryAvg: 8, topPerformer: 4, unit: "%", higherIsBetter: false },
    { id: "nps", name: "Net Promoter Score", yourValue: 0, industryAvg: 30, topPerformer: 55, unit: "", higherIsBetter: true },
    { id: "aov", name: "Average Order Value", yourValue: 0, industryAvg: 75, topPerformer: 150, unit: "£", higherIsBetter: true },
  ],
  edtech: [
    { id: "mrr-growth", name: "MRR Growth Rate", yourValue: 0, industryAvg: 8, topPerformer: 20, unit: "%", higherIsBetter: true },
    { id: "cac", name: "Customer Acquisition Cost", yourValue: 0, industryAvg: 80, topPerformer: 40, unit: "£", higherIsBetter: false },
    { id: "ltv", name: "Customer Lifetime Value", yourValue: 0, industryAvg: 500, topPerformer: 1000, unit: "£", higherIsBetter: true },
    { id: "churn", name: "Monthly Churn Rate", yourValue: 0, industryAvg: 7, topPerformer: 3, unit: "%", higherIsBetter: false },
    { id: "nps", name: "Net Promoter Score", yourValue: 0, industryAvg: 50, topPerformer: 80, unit: "", higherIsBetter: true },
    { id: "completion", name: "Course Completion Rate", yourValue: 0, industryAvg: 15, topPerformer: 40, unit: "%", higherIsBetter: true },
  ],
};

export default function PerformanceBench() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('performance-bench-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('performance-bench-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('performance-bench-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, string>) => {
    const extractNumber = (text: string): number => {
      const match = text.match(/[\d,]+/);
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    };
    
    if (answers.industry) {
      const industryLower = answers.industry.toLowerCase();
      const industries: Industry[] = ['fintech', 'healthtech', 'saas', 'ecommerce', 'edtech'];
      for (const ind of industries) {
        if (industryLower.includes(ind)) {
          setSelectedIndustry(ind);
          break;
        }
      }
    }
    
    const newMetrics = metrics.map(m => {
      let value = 0;
      switch (m.id) {
        case 'mrr-growth':
          value = extractNumber(answers.mrrGrowth || '');
          break;
        case 'cac':
          value = extractNumber(answers.cac || '');
          break;
        case 'ltv':
          value = extractNumber(answers.ltv || '');
          break;
        case 'churn':
          value = extractNumber(answers.churn || '');
          break;
        case 'nps':
          value = extractNumber(answers.nps || '');
          break;
        case 'runway':
          value = extractNumber(answers.runway || '');
          break;
      }
      return value > 0 ? { ...m, yourValue: value } : m;
    });
    
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics, selectedIndustry);
    setMode('traditional');
    toast({ title: "Metrics Updated", description: "Your benchmark data has been populated from your answers" });
  }, [metrics, selectedIndustry, toast]);

  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(() => {
    const saved = localStorage.getItem("performance-bench-state");
    if (saved) {
      try {
        return JSON.parse(saved).selectedIndustry || "saas";
      } catch { }
    }
    return "saas";
  });

  const [metrics, setMetrics] = useState<BenchmarkMetric[]>(() => {
    const saved = localStorage.getItem("performance-bench-state");
    if (saved) {
      try {
        return JSON.parse(saved).metrics || INDUSTRY_BENCHMARKS.saas;
      } catch { }
    }
    return INDUSTRY_BENCHMARKS.saas;
  });

  const [activeTab, setActiveTab] = useState("comparison");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback((newMetrics: BenchmarkMetric[], industry: Industry) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("performance-bench-state", JSON.stringify({ metrics: newMetrics, selectedIndustry: industry }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const handleIndustryChange = (industry: Industry) => {
    setSelectedIndustry(industry);
    const newMetrics = INDUSTRY_BENCHMARKS[industry].map(m => ({
      ...m,
      yourValue: metrics.find(existing => existing.id === m.id)?.yourValue || 0
    }));
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics, industry);
  };

  const updateMetricValue = (id: string, value: number) => {
    const newMetrics = metrics.map(m => 
      m.id === id ? { ...m, yourValue: value } : m
    );
    setMetrics(newMetrics);
    triggerAutoSave(newMetrics, selectedIndustry);
  };

  const getPerformanceStatus = (metric: BenchmarkMetric) => {
    if (metric.yourValue === 0) return "unknown";
    if (metric.higherIsBetter) {
      if (metric.yourValue >= metric.topPerformer) return "excellent";
      if (metric.yourValue >= metric.industryAvg) return "good";
      return "below";
    } else {
      if (metric.yourValue <= metric.topPerformer) return "excellent";
      if (metric.yourValue <= metric.industryAvg) return "good";
      return "below";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent": return <Badge className="bg-green-500">Top Performer</Badge>;
      case "good": return <Badge className="bg-amber-500">Above Average</Badge>;
      case "below": return <Badge variant="destructive">Below Average</Badge>;
      default: return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  const chartData = metrics.map(m => ({
    name: m.name.split(" ").slice(0, 2).join(" "),
    You: m.yourValue,
    "Industry Avg": m.industryAvg,
    "Top Performer": m.topPerformer,
  }));

  const radarData = metrics.map(m => {
    const normalize = (val: number, max: number) => Math.min(100, (val / max) * 100);
    const maxVal = Math.max(m.yourValue, m.industryAvg, m.topPerformer);
    return {
      metric: m.name.split(" ").slice(0, 2).join(" "),
      You: normalize(m.yourValue, maxVal),
      "Industry Avg": normalize(m.industryAvg, maxVal),
      "Top Performer": normalize(m.topPerformer, maxVal),
    };
  });

  const handleExportWord = () => {
    generateWord({
      title: "Performance Benchmarking Report",
      subtitle: `Industry: ${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}`,
      filename: "performance-benchmark",
      sections: [
        { type: "heading", content: "Benchmark Summary", level: 1 },
        { type: "paragraph", content: `Comparing your performance against ${selectedIndustry} industry standards` },
        { type: "divider" },
        { type: "table", tableData: {
          headers: ["Metric", "Your Value", "Industry Avg", "Top Performer", "Status"],
          rows: metrics.map(m => [
            m.name,
            `${m.unit === "£" ? "£" : ""}${m.yourValue}${m.unit === "%" ? "%" : ""}`,
            `${m.unit === "£" ? "£" : ""}${m.industryAvg}${m.unit === "%" ? "%" : ""}`,
            `${m.unit === "£" ? "£" : ""}${m.topPerformer}${m.unit === "%" ? "%" : ""}`,
            getPerformanceStatus(m)
          ])
        }},
        { type: "divider" },
        { type: "heading", content: "Recommendations", level: 2 },
        ...metrics.filter(m => getPerformanceStatus(m) === "below").map(m => ({
          type: "paragraph" as const,
          content: `${m.name}: Currently at ${m.yourValue}${m.unit}. Target improvement to reach industry average of ${m.industryAvg}${m.unit}.`
        })),
      ],
    });
    toast({ title: "Export Complete", description: "Benchmark report exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("performance-bench-state", JSON.stringify({ metrics, selectedIndustry }));
    toast({ title: "Saved", description: "Your benchmark data has been saved" });
  };

  const excellentCount = metrics.filter(m => getPerformanceStatus(m) === "excellent").length;
  const belowCount = metrics.filter(m => getPerformanceStatus(m) === "below").length;

  return (
    <ToolAccessGuard requiredTier="enterprise" toolName="Performance Benchmarking">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-6xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-2">Performance Benchmarking</h1>
            <p className="text-muted-foreground">Compare your business metrics against industry standards</p>
          </div>

          <ToolUtilityBar
            toolId="performance-bench"
            toolName="Performance Benchmarking"
            onSave={handleSave}
            onExportWord={handleExportWord}
          />

          <div className="flex justify-end mt-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {showAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Save className="w-4 h-4" />
              <span>Auto-saved</span>
            </div>
          )}

          {mode === 'ai' ? (
            <div className="mt-6">
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            </div>
          ) : (
          <>
          <div className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Industry Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label>Select Your Industry</Label>
                  <Select value={selectedIndustry} onValueChange={(v) => handleIndustryChange(v as Industry)}>
                    <SelectTrigger className="w-48" data-testid="select-industry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-500">{excellentCount}</div>
                  <div className="text-sm text-muted-foreground">Top Performer Metrics</div>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="pt-6 text-center">
                  <Target className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-amber-500">{metrics.length - excellentCount - belowCount}</div>
                  <div className="text-sm text-muted-foreground">Above Average</div>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-red-500">{belowCount}</div>
                  <div className="text-sm text-muted-foreground">Need Improvement</div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="comparison" data-testid="tab-comparison">Comparison</TabsTrigger>
                <TabsTrigger value="input" data-testid="tab-input">Enter Your Data</TabsTrigger>
                <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Benchmark Comparison</CardTitle>
                    <CardDescription>How you compare to industry standards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {metrics.map((metric) => (
                        <div key={metric.id} className="space-y-2" data-testid={`metric-${metric.id}`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{metric.name}</span>
                              {getStatusBadge(getPerformanceStatus(metric))}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                You: <strong>{metric.unit === "£" ? "£" : ""}{metric.yourValue}{metric.unit === "%" ? "%" : ""}</strong>
                              </span>
                              <span className="text-muted-foreground">
                                Avg: {metric.unit === "£" ? "£" : ""}{metric.industryAvg}{metric.unit === "%" ? "%" : ""}
                              </span>
                              <span className="text-muted-foreground">
                                Top: {metric.unit === "£" ? "£" : ""}{metric.topPerformer}{metric.unit === "%" ? "%" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full bg-muted-foreground/30" 
                              style={{ width: `${(metric.industryAvg / Math.max(metric.yourValue, metric.industryAvg, metric.topPerformer)) * 100}%` }}
                            />
                            <div 
                              className="absolute h-full bg-primary" 
                              style={{ width: `${(metric.yourValue / Math.max(metric.yourValue, metric.industryAvg, metric.topPerformer)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="input">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Your Metrics</CardTitle>
                    <CardDescription>Input your current business performance data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {metrics.map((metric) => (
                        <div key={metric.id} className="space-y-2" data-testid={`input-${metric.id}`}>
                          <Label>{metric.name}</Label>
                          <div className="flex items-center gap-2">
                            {metric.unit === "£" && <span className="text-muted-foreground">£</span>}
                            <Input
                              type="number"
                              value={metric.yourValue}
                              onChange={(e) => updateMetricValue(metric.id, parseFloat(e.target.value) || 0)}
                              data-testid={`input-value-${metric.id}`}
                            />
                            {metric.unit === "%" && <span className="text-muted-foreground">%</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Industry avg: {metric.unit === "£" ? "£" : ""}{metric.industryAvg}{metric.unit === "%" ? "%" : ""} | 
                            Top performer: {metric.unit === "£" ? "£" : ""}{metric.topPerformer}{metric.unit === "%" ? "%" : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Comparison Chart</CardTitle>
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
                            <Bar dataKey="You" fill="hsl(var(--primary))" />
                            <Bar dataKey="Industry Avg" fill="hsl(var(--muted-foreground))" />
                            <Bar dataKey="Top Performer" fill="hsl(142, 76%, 36%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Radar Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="You" dataKey="You" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                            <Radar name="Industry Avg" dataKey="Industry Avg" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          </>
          )}
        </div>
      </div>
    </ToolAccessGuard>
  );
}
