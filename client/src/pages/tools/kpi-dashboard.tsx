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
import { Gauge, TrendingUp, TrendingDown, Users, DollarSign, Target, BarChart3, ArrowUpRight, ArrowDownRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'kpi-dashboard',
  toolName: 'KPI Dashboard',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Advisor. Key Performance Indicators (KPIs) are essential for tracking your business progress and demonstrating traction to endorsing bodies. Let me help you set up meaningful KPIs for your visa application!",
  questions: [
    {
      id: 'mrr',
      question: "What's your current Monthly Recurring Revenue (MRR) and your 12-month target? If pre-revenue, what's your projected MRR at launch?",
      hint: "MRR demonstrates predictable revenue - a key indicator endorsers look for",
      fieldKey: 'mrrTarget'
    },
    {
      id: 'customers',
      question: "How many paying customers do you have, and what's your target for the next 12 months?",
      hint: "Customer count validates market demand and product-market fit",
      fieldKey: 'customerTarget'
    },
    {
      id: 'cac-ltv',
      question: "What's your Customer Acquisition Cost (CAC) and estimated Customer Lifetime Value (LTV)? What ratio are you targeting?",
      hint: "A healthy LTV:CAC ratio of 3:1 or higher demonstrates efficient growth",
      fieldKey: 'cacLtvTarget'
    },
    {
      id: 'churn',
      question: "What's your current monthly churn rate, and what's your target to reduce it to?",
      hint: "Lower churn indicates product satisfaction. Target under 5% for SaaS.",
      fieldKey: 'churnTarget'
    },
    {
      id: 'runway',
      question: "What's your current runway in months? How long can you operate with your existing funds?",
      hint: "12-18 months runway provides security. Endorsers want to see financial stability.",
      fieldKey: 'runwayTarget'
    },
    {
      id: 'key-metric',
      question: "What's your North Star metric - the single most important indicator of your business success?",
      hint: "This should be the metric that best captures customer value",
      fieldKey: 'northStarMetric'
    }
  ],
  completionMessage: "Excellent! You've defined key performance indicators that will help you track progress and demonstrate traction. I'm populating your KPI dashboard now."
};

type KPI = {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  category: "revenue" | "growth" | "customers" | "operations";
  trend: "up" | "down" | "stable";
};

const DEFAULT_KPIS: KPI[] = [
  { id: "mrr", name: "Monthly Recurring Revenue", value: 0, target: 10000, unit: "£", category: "revenue", trend: "up" },
  { id: "arr", name: "Annual Recurring Revenue", value: 0, target: 120000, unit: "£", category: "revenue", trend: "up" },
  { id: "customers", name: "Total Customers", value: 0, target: 100, unit: "", category: "customers", trend: "up" },
  { id: "cac", name: "Customer Acquisition Cost", value: 0, target: 50, unit: "£", category: "revenue", trend: "down" },
  { id: "ltv", name: "Customer Lifetime Value", value: 0, target: 500, unit: "£", category: "revenue", trend: "up" },
  { id: "churn", name: "Monthly Churn Rate", value: 0, target: 5, unit: "%", category: "customers", trend: "down" },
  { id: "nps", name: "Net Promoter Score", value: 0, target: 50, unit: "", category: "customers", trend: "up" },
  { id: "runway", name: "Runway (months)", value: 0, target: 18, unit: "months", category: "operations", trend: "up" },
];

export default function KPIDashboard() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('kpi-dashboard-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('kpi-dashboard-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  const [kpis, setKpis] = useState<KPI[]>(() => {
    const saved = localStorage.getItem("kpi-dashboard-state");
    if (saved) {
      try {
        return JSON.parse(saved).kpis || DEFAULT_KPIS;
      } catch { }
    }
    return DEFAULT_KPIS;
  });

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kpi-dashboard-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const updatedKpis = [...kpis];
    if (answers.revenue) {
      const match = answers.revenue.match(/[\d,]+/);
      if (match) {
        const kpi = updatedKpis.find(k => k.id === 'mrr');
        if (kpi) kpi.value = parseInt(match[0].replace(/,/g, ''));
      }
    }
    if (answers.customers) {
      const match = answers.customers.match(/[\d,]+/);
      if (match) {
        const kpi = updatedKpis.find(k => k.id === 'customers');
        if (kpi) kpi.value = parseInt(match[0].replace(/,/g, ''));
      }
    }
    if (answers.churnRate) {
      const match = answers.churnRate.match(/[\d.]+/);
      if (match) {
        const kpi = updatedKpis.find(k => k.id === 'churn');
        if (kpi) kpi.value = parseFloat(match[0]);
      }
    }
    if (answers.runway) {
      const match = answers.runway.match(/(\d+)/);
      if (match) {
        const kpi = updatedKpis.find(k => k.id === 'runway');
        if (kpi) kpi.value = parseInt(match[1]);
      }
    }
    if (answers.nps) {
      const match = answers.nps.match(/-?[\d]+/);
      if (match) {
        const kpi = updatedKpis.find(k => k.id === 'nps');
        if (kpi) kpi.value = parseInt(match[0]);
      }
    }
    setKpis(updatedKpis);
    setMode('traditional');
  };

  const triggerAutoSave = useCallback((newKpis: KPI[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("kpi-dashboard-state", JSON.stringify({ kpis: newKpis }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, []);

  const updateKPI = (id: string, field: "value" | "target", value: number) => {
    const newKpis = kpis.map(kpi => 
      kpi.id === id ? { ...kpi, [field]: value } : kpi
    );
    setKpis(newKpis);
    triggerAutoSave(newKpis);
  };

  const getProgressPercent = (kpi: KPI) => {
    if (kpi.trend === "down") {
      return kpi.value <= kpi.target ? 100 : Math.max(0, 100 - ((kpi.value - kpi.target) / kpi.target * 100));
    }
    return Math.min(100, (kpi.value / kpi.target) * 100);
  };

  const getProgressColor = (kpi: KPI) => {
    const percent = getProgressPercent(kpi);
    if (percent >= 80) return "bg-green-500";
    if (percent >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (category: KPI["category"]) => {
    switch (category) {
      case "revenue": return <DollarSign className="w-4 h-4" />;
      case "growth": return <TrendingUp className="w-4 h-4" />;
      case "customers": return <Users className="w-4 h-4" />;
      case "operations": return <Target className="w-4 h-4" />;
    }
  };

  const chartData = kpis.map(kpi => ({
    name: kpi.name.split(" ").slice(0, 2).join(" "),
    value: kpi.value,
    target: kpi.target,
    progress: getProgressPercent(kpi),
  }));

  const handleExportWord = () => {
    generateWord({
      title: "KPI Dashboard Report",
      subtitle: "Business Performance Metrics",
      filename: "kpi-dashboard",
      sections: [
        { type: "heading", content: "KPI Summary", level: 1 },
        { type: "table", tableData: {
          headers: ["KPI", "Current Value", "Target", "Progress"],
          rows: kpis.map(kpi => [
            kpi.name,
            `${kpi.unit}${kpi.value}`,
            `${kpi.unit}${kpi.target}`,
            `${Math.round(getProgressPercent(kpi))}%`
          ])
        }},
        { type: "divider" },
        { type: "heading", content: "Recommendations", level: 2 },
        ...kpis.filter(kpi => getProgressPercent(kpi) < 50).map(kpi => ({
          type: "paragraph" as const,
          content: `${kpi.name}: Currently at ${Math.round(getProgressPercent(kpi))}% of target. Focus needed to improve this metric.`
        })),
      ],
    });
    toast({ title: "Export Complete", description: "KPI Dashboard exported to Word document" });
  };

  const handleSave = () => {
    localStorage.setItem("kpi-dashboard-state", JSON.stringify({ kpis }));
    toast({ title: "Saved", description: "Your KPIs have been saved" });
  };

  const revenueKpis = kpis.filter(k => k.category === "revenue");
  const customerKpis = kpis.filter(k => k.category === "customers");
  const operationsKpis = kpis.filter(k => k.category === "operations");

  return (
    <ToolAccessGuard requiredTier="premium" toolName="KPI Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-6xl">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold mb-2">KPI Dashboard</h1>
                <p className="text-muted-foreground">Monitor and track your key business performance indicators</p>
              </div>
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
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Sterling, our Financial Expert, helps you set up key performance indicators.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Define revenue and customer metrics</li>
                    <li>Set growth and churn targets</li>
                    <li>Track operational KPIs like runway</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the dashboard when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="kpi-dashboard"
            toolName="KPI Dashboard"
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
              {kpis.slice(0, 4).map((kpi) => (
                <Card key={kpi.id} className="hover-elevate">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{kpi.name}</span>
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      {kpi.unit === "£" ? "£" : ""}{kpi.value.toLocaleString()}{kpi.unit === "%" ? "%" : ""}
                    </div>
                    <Progress value={getProgressPercent(kpi)} className={`h-2 mt-2 ${getProgressColor(kpi)}`} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {kpi.unit === "£" ? "£" : ""}{kpi.target.toLocaleString()}{kpi.unit === "%" ? "%" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="configure" data-testid="tab-configure">Configure KPIs</TabsTrigger>
                <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Revenue Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {revenueKpis.map((kpi) => (
                        <div key={kpi.id} className="space-y-2" data-testid={`kpi-${kpi.id}`}>
                          <div className="flex justify-between text-sm">
                            <span>{kpi.name}</span>
                            <span className="font-medium">
                              {kpi.unit === "£" ? "£" : ""}{kpi.value.toLocaleString()}{kpi.unit === "%" ? "%" : ""}
                            </span>
                          </div>
                          <Progress value={getProgressPercent(kpi)} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Customer Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customerKpis.map((kpi) => (
                        <div key={kpi.id} className="space-y-2" data-testid={`kpi-${kpi.id}`}>
                          <div className="flex justify-between text-sm">
                            <span>{kpi.name}</span>
                            <span className="font-medium">
                              {kpi.unit === "£" ? "£" : ""}{kpi.value.toLocaleString()}{kpi.unit === "%" ? "%" : ""}
                            </span>
                          </div>
                          <Progress value={getProgressPercent(kpi)} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Operations Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {operationsKpis.map((kpi) => (
                        <div key={kpi.id} className="space-y-2" data-testid={`kpi-${kpi.id}`}>
                          <div className="flex justify-between text-sm">
                            <span>{kpi.name}</span>
                            <span className="font-medium">
                              {kpi.value} {kpi.unit}
                            </span>
                          </div>
                          <Progress value={getProgressPercent(kpi)} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="configure">
                <Card>
                  <CardHeader>
                    <CardTitle>Configure Your KPIs</CardTitle>
                    <CardDescription>Set your current values and targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {kpis.map((kpi) => (
                        <div key={kpi.id} className="p-4 border rounded-lg space-y-4" data-testid={`config-${kpi.id}`}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(kpi.category)}
                            <span className="font-medium">{kpi.name}</span>
                            <Badge variant="secondary">{kpi.category}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Current Value</Label>
                              <Input
                                type="number"
                                value={kpi.value}
                                onChange={(e) => updateKPI(kpi.id, "value", parseFloat(e.target.value) || 0)}
                                data-testid={`input-value-${kpi.id}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Target</Label>
                              <Input
                                type="number"
                                value={kpi.target}
                                onChange={(e) => updateKPI(kpi.id, "target", parseFloat(e.target.value) || 0)}
                                data-testid={`input-target-${kpi.id}`}
                              />
                            </div>
                          </div>
                          <Progress value={getProgressPercent(kpi)} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {Math.round(getProgressPercent(kpi))}% of target
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
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        KPI Progress Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="hsl(var(--primary))" name="Current" />
                            <Bar dataKey="target" fill="hsl(var(--muted-foreground))" name="Target" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Progress by KPI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                            <Tooltip />
                            <Bar dataKey="progress" fill="hsl(var(--primary))" name="Progress %" />
                          </BarChart>
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
