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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, CheckCircle2, PoundSterling, TrendingUp, AlertTriangle, Info, Target, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWordExport } from "@/hooks/useWordExport";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "min-investment-calc",
  toolName: "Investment Calculator",
  agent: "sterling",
  greeting: "Hello! I'm Sterling, your financial planning advisor. Let's work through your investment requirements for the UK Innovator Founder visa. I'll help you calculate realistic budget allocations that demonstrate sound financial planning to endorsers.",
  questions: [
    {
      id: "product_budget",
      question: "How much do you estimate needing for product development? Include MVP development, technology infrastructure, and ongoing development costs.",
      hint: "Example: '£50,000 for MVP development including tech stack setup and first 6 months of development'",
      fieldKey: "productBudget",
      minLength: 30
    },
    {
      id: "marketing_budget",
      question: "What is your marketing and sales budget? Include initial campaigns, sales setup, and customer acquisition costs.",
      hint: "Example: '£25,000 for initial marketing campaigns, website, and sales infrastructure'",
      fieldKey: "marketingBudget",
      minLength: 30
    },
    {
      id: "operations_budget",
      question: "What are your operational costs? Include office space, equipment, and administrative expenses.",
      hint: "Example: '£15,000 for co-working space, equipment, and admin costs for first year'",
      fieldKey: "operationsBudget",
      minLength: 30
    },
    {
      id: "team_budget",
      question: "What is your team and salary budget? Include founder salaries and planned hires.",
      hint: "Example: '£35,000 for initial team including minimal founder salary and first hire'",
      fieldKey: "teamBudget",
      minLength: 30
    },
    {
      id: "legal_budget",
      question: "What are your legal and compliance costs? Include company formation, visa fees, and legal advice.",
      hint: "Example: '£10,000 for legal setup, visa application fees, and compliance'",
      fieldKey: "legalBudget",
      minLength: 20
    },
    {
      id: "funding_source",
      question: "What is your primary funding source? (Self-funded, angel investment, VC, grants, or mixed)",
      hint: "Endorsers want to see realistic and verified funding sources",
      fieldKey: "fundingSource"
    },
    {
      id: "runway_months",
      question: "How many months of runway do you need? (6, 12, 18, or 24 months recommended)",
      hint: "12-18 months is typically recommended for visa applications",
      fieldKey: "runwayMonths"
    }
  ],
  completionMessage: "Excellent! I've captured your investment details. Let me now calculate your total investment requirements and provide recommendations to strengthen your financial plan."
};

type InvestmentCategory = {
  id: string;
  name: string;
  amount: number;
  description: string;
};

const INITIAL_CATEGORIES: InvestmentCategory[] = [
  { id: "1", name: "Product Development", amount: 50000, description: "MVP development, tech infrastructure" },
  { id: "2", name: "Marketing & Sales", amount: 25000, description: "Initial marketing campaigns, sales setup" },
  { id: "3", name: "Operations", amount: 15000, description: "Office, equipment, admin costs" },
  { id: "4", name: "Team & Salaries", amount: 35000, description: "Initial team hiring and salaries" },
  { id: "5", name: "Legal & Compliance", amount: 10000, description: "Company formation, visa fees, legal" },
  { id: "6", name: "Contingency", amount: 15000, description: "Emergency buffer (10-15% recommended)" },
];

const CHART_COLORS = ["#ffa536", "#11b6e9", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];

export default function MinInvestmentCalc() {
  const { toast } = useToast();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const hideIndicatorRef = useRef<NodeJS.Timeout | null>(null);

  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('min-investment-calc-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('min-investment-calc-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('min-investment-calc-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, string>) => {
    const extractAmount = (text: string): number => {
      const match = text.match(/£?([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    };
    
    const newCategories: InvestmentCategory[] = [
      { id: "1", name: "Product Development", amount: extractAmount(answers.productBudget) || 50000, description: answers.productBudget || "MVP development, tech infrastructure" },
      { id: "2", name: "Marketing & Sales", amount: extractAmount(answers.marketingBudget) || 25000, description: answers.marketingBudget || "Initial marketing campaigns, sales setup" },
      { id: "3", name: "Operations", amount: extractAmount(answers.operationsBudget) || 15000, description: answers.operationsBudget || "Office, equipment, admin costs" },
      { id: "4", name: "Team & Salaries", amount: extractAmount(answers.teamBudget) || 35000, description: answers.teamBudget || "Initial team hiring and salaries" },
      { id: "5", name: "Legal & Compliance", amount: extractAmount(answers.legalBudget) || 10000, description: answers.legalBudget || "Company formation, visa fees, legal" },
      { id: "6", name: "Contingency", amount: 15000, description: "Emergency buffer (10-15% recommended)" },
    ];
    
    setCategories(newCategories);
    
    if (answers.fundingSource) {
      const sourceMap: Record<string, string> = {
        'self': 'self-funded',
        'angel': 'angel',
        'vc': 'vc',
        'grant': 'grants',
        'mix': 'mixed'
      };
      const sourceLower = answers.fundingSource.toLowerCase();
      for (const [key, value] of Object.entries(sourceMap)) {
        if (sourceLower.includes(key)) {
          setFundingSource(value);
          break;
        }
      }
    }
    
    if (answers.runwayMonths) {
      const months = parseInt(answers.runwayMonths.match(/\d+/)?.[0] || '12');
      if ([6, 12, 18, 24].includes(months)) {
        setRunwayMonths(months);
      }
    }
    
    triggerAutoSave();
    setMode('traditional');
    toast({ title: "Investment Plan Created", description: "Your investment breakdown has been populated from your answers" });
  }, [toast]);

  const [categories, setCategories] = useState<InvestmentCategory[]>(() => {
    const saved = localStorage.getItem("min-investment-calc-state");
    if (saved) {
      try {
        return JSON.parse(saved).categories || INITIAL_CATEGORIES;
      } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  const [fundingSource, setFundingSource] = useState(() => {
    const saved = localStorage.getItem("min-investment-calc-state");
    if (saved) {
      try {
        return JSON.parse(saved).fundingSource || "self-funded";
      } catch {}
    }
    return "self-funded";
  });

  const [runwayMonths, setRunwayMonths] = useState(() => {
    const saved = localStorage.getItem("min-investment-calc-state");
    if (saved) {
      try {
        return JSON.parse(saved).runwayMonths || 12;
      } catch {}
    }
    return 12;
  });

  const [activeTab, setActiveTab] = useState("calculator");

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
    };
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem("min-investment-calc-state", JSON.stringify({ categories, fundingSource, runwayMonths }));
      setShowAutoSave(true);
      if (hideIndicatorRef.current) clearTimeout(hideIndicatorRef.current);
      hideIndicatorRef.current = setTimeout(() => setShowAutoSave(false), 2000);
    }, 500);
  }, [categories, fundingSource, runwayMonths]);

  const updateCategory = (id: string, amount: number) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, amount } : c)));
    triggerAutoSave();
  };

  const totalInvestment = categories.reduce((sum, c) => sum + c.amount, 0);
  const monthlyBurn = totalInvestment / runwayMonths;
  const contingencyPercent = ((categories.find((c) => c.name === "Contingency")?.amount || 0) / totalInvestment) * 100;

  const pieData = categories.map((c) => ({ name: c.name, value: c.amount }));
  const barData = categories.map((c) => ({ name: c.name.split(" ")[0], amount: c.amount }));

  const getRecommendation = () => {
    if (totalInvestment < 20000) {
      return { level: "low", message: "Consider if this covers your business needs. There's no minimum requirement - focus on what you need to execute your plan." };
    }
    if (totalInvestment >= 20000 && totalInvestment < 75000) {
      return { level: "medium", message: "Reasonable starting investment. Ensure runway covers at least 12 months of operations." };
    }
    return { level: "high", message: "Strong investment level. This demonstrates commitment and provides good runway." };
  };

  const recommendation = getRecommendation();

  const handleSave = () => {
    localStorage.setItem("min-investment-calc-state", JSON.stringify({ categories, fundingSource, runwayMonths }));
    toast({ title: "Progress Saved", description: "Your investment calculations have been saved" });
  };

  const handleExportWord = () => {
    const sections = [
      { type: "heading" as const, content: "Investment Calculation Report", level: 1 as const },
      { type: "paragraph" as const, content: `Total Investment Required: £${totalInvestment.toLocaleString()}` },
      { type: "paragraph" as const, content: `Monthly Burn Rate: £${Math.round(monthlyBurn).toLocaleString()}` },
      { type: "paragraph" as const, content: `Runway: ${runwayMonths} months` },
      { type: "heading" as const, content: "Investment Breakdown", level: 2 as const },
      { type: "table" as const, tableData: {
        headers: ["Category", "Amount", "% of Total"],
        rows: categories.map((c) => [c.name, `£${c.amount.toLocaleString()}`, `${((c.amount / totalInvestment) * 100).toFixed(1)}%`]),
      }},
      { type: "heading" as const, content: "Recommendation", level: 2 as const },
      { type: "paragraph" as const, content: recommendation.message },
    ];
    generateWord({ title: "Investment Calculation Report", filename: "investment-calculation-report", sections });
    toast({ title: "Export Complete", description: "Your report has been downloaded" });
  };

  return (
    <ToolAccessGuard requiredTier="basic" toolName="Investment Calculator">
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-tool-title">
                  <Calculator className="w-8 h-8 text-primary" />
                  Investment Calculator
                </h1>
                <p className="text-muted-foreground mt-1">Calculate minimum investment required for your UK visa journey</p>
              </div>
              {showAutoSave && (
                <Badge variant="secondary" className="animate-pulse">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Auto-saved
                </Badge>
              )}
            </div>

            <ToolUtilityBar
              toolId="min-investment-calc"
              toolName="Investment Calculator"
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
                    <PoundSterling className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Investment</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-total-investment">£{totalInvestment.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Monthly Burn</span>
                  </div>
                  <p className="text-2xl font-bold mt-1" data-testid="text-monthly-burn">£{Math.round(monthlyBurn).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Runway</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{runwayMonths} months</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Contingency</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{contingencyPercent.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <Alert className={`mb-6 ${recommendation.level === "low" ? "border-red-500" : recommendation.level === "medium" ? "border-yellow-500" : "border-green-500"}`}>
              <Info className="w-4 h-4" />
              <AlertDescription>{recommendation.message}</AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
                <TabsTrigger value="breakdown" data-testid="tab-breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="calculator">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Categories</CardTitle>
                      <CardDescription>Adjust amounts for each category</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor={category.id}>{category.name}</Label>
                            <span className="text-sm text-muted-foreground">
                              {((category.amount / totalInvestment) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">£</span>
                            <Input
                              id={category.id}
                              type="number"
                              value={category.amount}
                              onChange={(e) => updateCategory(category.id, parseInt(e.target.value) || 0)}
                              data-testid={`input-${category.id}`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>Configure your investment parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Funding Source</Label>
                        <Select value={fundingSource} onValueChange={(v) => { setFundingSource(v); triggerAutoSave(); }}>
                          <SelectTrigger data-testid="select-funding-source">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self-funded">Self-Funded</SelectItem>
                            <SelectItem value="angel">Angel Investment</SelectItem>
                            <SelectItem value="vc">Venture Capital</SelectItem>
                            <SelectItem value="grants">Grants & Awards</SelectItem>
                            <SelectItem value="mixed">Mixed Sources</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Target Runway (Months)</Label>
                        <Select value={runwayMonths.toString()} onValueChange={(v) => { setRunwayMonths(parseInt(v)); triggerAutoSave(); }}>
                          <SelectTrigger data-testid="select-runway">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="18">18 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-4">Investment Distribution</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="breakdown">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                    <CardDescription>Detailed view of your investment allocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#ffa536" name="Amount" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">Category</th>
                            <th className="text-right py-2 px-2">Amount</th>
                            <th className="text-right py-2 px-2">% of Total</th>
                            <th className="text-right py-2 px-2">Monthly</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((c) => (
                            <tr key={c.id} className="border-b">
                              <td className="py-2 px-2">{c.name}</td>
                              <td className="py-2 px-2 text-right font-mono">£{c.amount.toLocaleString()}</td>
                              <td className="py-2 px-2 text-right">{((c.amount / totalInvestment) * 100).toFixed(1)}%</td>
                              <td className="py-2 px-2 text-right font-mono">£{Math.round(c.amount / runwayMonths).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-2 px-2">Total</td>
                            <td className="py-2 px-2 text-right font-mono">£{totalInvestment.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right">100%</td>
                            <td className="py-2 px-2 text-right font-mono">£{Math.round(monthlyBurn).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>UK Visa Requirements</CardTitle>
                      <CardDescription>How your investment compares to requirements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Minimum Personal Savings</span>
                          <Badge variant="outline">£1,270</Badge>
                        </div>
                        <Progress value={100} className="h-2" />
                        <p className="text-xs text-muted-foreground">Required for 28 consecutive days</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Recommended Investment</span>
                          <Badge variant="outline">£50,000+</Badge>
                        </div>
                        <Progress value={Math.min((totalInvestment / 50000) * 100, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground">Your investment: £{totalInvestment.toLocaleString()}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Contingency Buffer</span>
                          <Badge variant={contingencyPercent >= 10 ? "default" : "destructive"}>
                            {contingencyPercent >= 10 ? "Good" : "Low"}
                          </Badge>
                        </div>
                        <Progress value={Math.min(contingencyPercent * 10, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground">Recommended: 10-15% of total</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Tips to strengthen your application</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">Document all funding sources with official bank statements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">Maintain £1,270 for 28 consecutive days before application</span>
                        </li>
                        <li className="flex items-start gap-2">
                          {contingencyPercent >= 10 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                          )}
                          <span className="text-sm">Keep contingency fund of at least 10-15% of total budget</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">Prepare detailed financial projections for 3-5 years</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">Consider phased investment approach with clear milestones</span>
                        </li>
                      </ul>
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
