import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type BudgetCategory = {
  name: string;
  budgeted: number;
  actual: number;
  category: 'personnel' | 'technology' | 'marketing' | 'operations' | 'legal' | 'facilities';
};

export default function BudgetCostAnalyzer() {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: 'Salaries & Wages', budgeted: 20000, actual: 18500, category: 'personnel' },
    { name: 'Software & Tools', budgeted: 5000, actual: 5200, category: 'technology' },
    { name: 'Digital Marketing', budgeted: 8000, actual: 9100, category: 'marketing' },
    { name: 'Office Supplies', budgeted: 2000, actual: 1800, category: 'operations' },
    { name: 'Legal & Compliance', budgeted: 3000, actual: 3500, category: 'legal' },
    { name: 'Rent & Utilities', budgeted: 4000, actual: 4000, category: 'facilities' }
  ]);
  const [activeTab, setActiveTab] = useState('budget');
  const [savedDate, setSavedDate] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState(25000);

  const addCategory = () => {
    setCategories([...categories, { name: '', budgeted: 0, actual: 0, category: 'operations' }]);
  };

  const updateCategory = (index: number, field: keyof BudgetCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const totalBudgeted = categories.reduce((sum, c) => sum + (c.budgeted || 0), 0);
  const totalActual = categories.reduce((sum, c) => sum + (c.actual || 0), 0);
  const totalVariance = totalActual - totalBudgeted;
  const variancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;
  const monthlyBurnRate = totalActual;
  const netCashFlow = monthlyRevenue - totalActual;
  const runway = netCashFlow > 0 ? Infinity : (monthlyRevenue > 0 ? Math.floor(50000 / (totalActual - monthlyRevenue)) : 0);
  const budgetHealth = variancePercent <= 5 ? 'Excellent' : variancePercent <= 15 ? 'Good' : variancePercent <= 25 ? 'Concerning' : 'Critical';

  const categoryColors: Record<string, string> = {
    personnel: '#3b82f6',
    technology: '#10b981',
    marketing: '#f59e0b',
    operations: '#8b5cf6',
    legal: '#ec4899',
    facilities: '#6b7280'
  };

  const budgetByCategory = [
    { name: 'Personnel', value: categories.filter(c => c.category === 'personnel').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.personnel },
    { name: 'Technology', value: categories.filter(c => c.category === 'technology').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.technology },
    { name: 'Marketing', value: categories.filter(c => c.category === 'marketing').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.marketing },
    { name: 'Operations', value: categories.filter(c => c.category === 'operations').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.operations },
    { name: 'Legal/Compliance', value: categories.filter(c => c.category === 'legal').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.legal },
    { name: 'Office/Facilities', value: categories.filter(c => c.category === 'facilities').reduce((sum, c) => sum + c.budgeted, 0), color: categoryColors.facilities },
  ].filter(item => item.value > 0);

  const budgetVsActual = categories.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    budgeted: c.budgeted,
    actual: c.actual,
    variance: c.actual - c.budgeted
  }));

  const monthlyBurnTrend = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const projectedBurn = totalActual * (1 + (variancePercent / 100) * (month / 12));
    return {
      month: `M${month}`,
      budgeted: totalBudgeted,
      actual: Math.round(projectedBurn),
      revenue: monthlyRevenue
    };
  });

  const getSerializedState = () => {
    return {
      categories,
      activeTab,
      monthlyRevenue,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('categories' in state) setCategories(state.categories);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('monthlyRevenue' in state) setMonthlyRevenue(state.monthlyRevenue);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('budget-cost-analyzer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('budget-cost-analyzer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('budget-cost-analyzer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (variancePercent > 20) {
      tips.push('Budget variance exceeds 20% - conduct immediate cost review and implement tighter spending controls');
    }

    if (totalActual > monthlyRevenue) {
      tips.push('Monthly costs exceed revenue - prioritize revenue growth or reduce burn rate to achieve sustainability');
    }

    const personnelCost = categories.filter(c => c.category === 'personnel').reduce((sum, c) => sum + c.actual, 0);
    if (personnelCost > totalActual * 0.6) {
      tips.push('Personnel costs exceed 60% of total budget - consider operational efficiency improvements or revenue acceleration');
    }

    const marketingCost = categories.filter(c => c.category === 'marketing').reduce((sum, c) => sum + c.actual, 0);
    if (marketingCost < totalActual * 0.1) {
      tips.push('Marketing spend below 10% of budget - consider increasing investment to accelerate growth');
    }

    const overBudgetItems = categories.filter(c => c.actual > c.budgeted * 1.1).length;
    if (overBudgetItems > 0) {
      tips.push(`${overBudgetItems} categories exceed budget by 10%+ - implement approval workflows for unplanned expenses`);
    }

    if (runway < 6 && runway !== Infinity) {
      tips.push('Runway below 6 months - secure additional funding or implement aggressive cost reduction measures immediately');
    }

    if (budgetHealth === 'Excellent' || budgetHealth === 'Good') {
      tips.push('Strong budget discipline - document and replicate these controls across all business functions');
    }

    tips.push('Track unit economics (CAC, LTV) alongside budget metrics to ensure spending drives profitable growth');
    tips.push('Implement zero-based budgeting quarterly to eliminate legacy costs and optimize resource allocation');
    tips.push('Build 15-20% contingency buffer for unexpected costs - critical for visa application credibility');

    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Implement monthly budget review meetings with finance and department heads to track variance", priority: "Critical" },
      { week: "Week 1", action: "Set up automated expense tracking system with real-time budget alerts and approval workflows", priority: "High" },
      { week: "Week 1-2", action: "Conduct line-by-line cost audit identifying discretionary vs essential spending", priority: "Critical" },
      { week: "Week 2", action: "Negotiate vendor contracts and consolidate suppliers to achieve 10-15% cost savings", priority: "High" },
      { week: "Week 2-3", action: "Establish KPI dashboard linking spend to business outcomes (revenue per employee, CAC, etc.)", priority: "High" },
      { week: "Week 3", action: "Create scenario models for 10%, 20%, and 30% cost reduction plans with impact analysis", priority: "Medium" },
      { week: "Week 3-4", action: "Document budget controls and financial policies for endorsing body review", priority: "Critical" },
      { week: "Week 4", action: "Build 12-month rolling forecast with sensitivity analysis for key assumptions", priority: "High" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE BUDGET & COST ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Budgeted Monthly Costs: £${totalBudgeted.toLocaleString()}
Total Actual Monthly Costs: £${totalActual.toLocaleString()}
Total Variance: £${totalVariance.toLocaleString()} (${variancePercent >= 0 ? '+' : ''}${variancePercent.toFixed(1)}%)
Monthly Revenue: £${monthlyRevenue.toLocaleString()}
Monthly Burn Rate: £${monthlyBurnRate.toLocaleString()}
Net Monthly Cash Flow: £${netCashFlow.toLocaleString()}
Budget Health Rating: ${budgetHealth}
Estimated Runway: ${runway === Infinity ? 'Positive (sustainable)' : `${runway} months`}

COST BREAKDOWN BY CATEGORY
${'-'.repeat(80)}
${categories.map((cat, i) => {
  const variance = cat.actual - cat.budgeted;
  const variancePct = cat.budgeted > 0 ? (variance / cat.budgeted) * 100 : 0;
  return `
${i + 1}. ${cat.name || 'Unnamed Category'}
   Category Type: ${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
   Budgeted: £${cat.budgeted.toLocaleString()}
   Actual: £${cat.actual.toLocaleString()}
   Variance: £${variance.toLocaleString()} (${variancePct >= 0 ? '+' : ''}${variancePct.toFixed(1)}%)
   Status: ${Math.abs(variancePct) <= 5 ? 'On Track' : Math.abs(variancePct) <= 15 ? 'Minor Variance' : 'Significant Variance'}`;
}).join('\n')}

BUDGET ALLOCATION BY MAJOR CATEGORY
${'-'.repeat(80)}
${budgetByCategory.map(item => {
  const pct = (item.value / totalBudgeted) * 100;
  return `${item.name}: £${item.value.toLocaleString()} (${pct.toFixed(1)}%)`;
}).join('\n')}

12-MONTH BURN RATE PROJECTION
${'-'.repeat(80)}
${monthlyBurnTrend.map(m => `
${m.month}:
  Projected Monthly Burn: £${m.actual.toLocaleString()}
  Monthly Revenue: £${m.revenue.toLocaleString()}
  Net Cash Flow: £${(m.revenue - m.actual).toLocaleString()}`).join('\n')}

VARIANCE ANALYSIS
${'-'.repeat(80)}
Over Budget Categories:
${categories.filter(c => c.actual > c.budgeted).map(c => {
  const variance = c.actual - c.budgeted;
  const pct = (variance / c.budgeted) * 100;
  return `  - ${c.name}: +£${variance.toLocaleString()} (+${pct.toFixed(1)}%)`;
}).join('\n') || '  None - all categories at or under budget'}

Under Budget Categories:
${categories.filter(c => c.actual < c.budgeted).map(c => {
  const variance = c.budgeted - c.actual;
  const pct = (variance / c.budgeted) * 100;
  return `  - ${c.name}: -£${variance.toLocaleString()} (-${pct.toFixed(1)}%)`;
}).join('\n') || '  None - all categories at or over budget'}

KEY FINANCIAL RATIOS
${'-'.repeat(80)}
Personnel Cost Ratio: ${totalActual > 0 ? ((categories.filter(c => c.category === 'personnel').reduce((sum, c) => sum + c.actual, 0) / totalActual) * 100).toFixed(1) : 0}%
Marketing Efficiency: ${totalActual > 0 ? ((categories.filter(c => c.category === 'marketing').reduce((sum, c) => sum + c.actual, 0) / totalActual) * 100).toFixed(1) : 0}%
Operating Margin: ${monthlyRevenue > 0 ? ((netCashFlow / monthlyRevenue) * 100).toFixed(1) : 0}%
Burn Multiple: ${netCashFlow > 0 ? (monthlyBurnRate / netCashFlow).toFixed(2) : 'N/A (negative cash flow)'}
Budget Variance: ${variancePercent.toFixed(1)}%

SMART COST OPTIMIZATION RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK BUDGET CONTROL ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA APPLICATION BUDGET REQUIREMENTS
${'-'.repeat(80)}
For UK Innovator Founder Visa applications, budget documentation should demonstrate:

1. Financial Discipline & Controls
   - Clear budget allocation across all business functions
   - Variance tracking and corrective action processes
   - Approval hierarchies for significant expenses
   - Monthly reconciliation and reporting procedures

2. Cost Structure Optimization
   - Personnel costs appropriate for stage (typically 50-70% for early-stage startups)
   - Technology investment supporting scalability (10-20% of budget)
   - Marketing spend aligned with growth strategy (15-25% for B2C, 10-15% for B2B)
   - Operational efficiency metrics tracked and improved quarterly

3. Financial Sustainability Evidence
   - Path to profitability clearly documented
   - Runway calculations with sensitivity analysis
   - Contingency planning for 20-30% cost increases
   - Revenue growth assumptions validated by market data

4. Budget Documentation Best Practices
   - 12-24 month detailed budget with monthly granularity
   - Assumptions documented for all major cost categories
   - Variance analysis from any historical periods
   - Comparison to industry benchmarks (SaaS, marketplace, hardware, etc.)
   - Board-approved budget demonstrating governance

CRITICAL BUDGET METRICS FOR ENDORSING BODIES
${'-'.repeat(80)}
Monthly Burn Rate: £${monthlyBurnRate.toLocaleString()}
Runway at Current Burn: ${runway === Infinity ? 'Sustainable (positive cash flow)' : `${runway} months`}
Budget Variance: ${variancePercent.toFixed(1)}% ${Math.abs(variancePercent) <= 10 ? '(Excellent)' : Math.abs(variancePercent) <= 20 ? '(Good)' : '(Needs Improvement)'}
Operating Efficiency: ${monthlyRevenue > 0 ? `£${(monthlyRevenue / (totalActual > 0 ? totalActual : 1)).toFixed(2)} revenue per £1 cost` : 'Pre-revenue'}
Cost Per Employee: ${categories.filter(c => c.category === 'personnel').length > 0 ? `£${(categories.filter(c => c.category === 'personnel').reduce((sum, c) => sum + c.actual, 0) / categories.filter(c => c.category === 'personnel').length).toLocaleString()}` : 'N/A'}

INDUSTRY BENCHMARK COMPARISON
${'-'.repeat(80)}
Compare your budget allocation to industry standards:

SaaS Startups (Typical):
- Personnel: 50-60%
- Technology: 15-20%
- Marketing: 20-30%
- Operations: 5-10%
- Legal/Compliance: 2-5%
- Facilities: 3-8%

Hardware/Manufacturing:
- Personnel: 30-40%
- Technology: 10-15%
- Marketing: 15-20%
- Operations: 30-40%
- Legal/Compliance: 3-5%
- Facilities: 5-10%

Service/Consulting:
- Personnel: 60-75%
- Technology: 5-10%
- Marketing: 10-15%
- Operations: 3-8%
- Legal/Compliance: 2-5%
- Facilities: 5-10%

BUDGET RISK FACTORS & MITIGATION
${'-'.repeat(80)}
Identified Risks:
${variancePercent > 15 ? '- High budget variance suggests weak cost controls or unrealistic planning' : ''}
${totalActual > monthlyRevenue ? '- Negative cash flow requires immediate action or additional funding' : ''}
${runway < 12 && runway !== Infinity ? '- Limited runway creates urgency for revenue acceleration or fundraising' : ''}
${categories.filter(c => c.actual > c.budgeted * 1.2).length > 0 ? `- ${categories.filter(c => c.actual > c.budgeted * 1.2).length} categories exceed budget by 20%+ indicating control gaps` : ''}

Mitigation Strategies:
- Implement monthly budget reviews with variance analysis
- Establish approval thresholds for unbudgeted expenses
- Build scenario models for revenue shortfalls
- Maintain 15-20% contingency reserve
- Track leading indicators (pipeline, engagement) to predict revenue
- Negotiate flexible contracts with key vendors
- Cross-train team to enable resource reallocation

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This analysis is for planning purposes. Consult qualified accountants
and financial advisors for business decisions. Budget projections are estimates
and actual results may vary significantly based on market conditions and execution.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-cost-analyzer-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-budget-cost-analyzer">Budget & Cost Analyzer</h1>
            <p className="text-lg text-muted-foreground">Comprehensive budget tracking, variance analysis, and cost optimization</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="budget-cost-analyzer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Budget & Cost Analyzer"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-budget-cost-analyzer">
              <TabsTrigger value="budget" data-testid="tab-budget">Budget</TabsTrigger>
              <TabsTrigger value="variance" data-testid="tab-variance">Variance</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={variancePercent <= 10 ? "border-green-500" : variancePercent <= 20 ? "border-orange-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Budgeted</p>
                      <p className="text-3xl font-bold" data-testid="text-total-budgeted">£{totalBudgeted.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">Monthly</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Actual</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-total-actual">£{totalActual.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">Monthly</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Variance</p>
                      <div className="flex items-center justify-center gap-2">
                        {totalVariance > 0 ? (
                          <TrendingUp className="h-5 w-5 text-destructive" />
                        ) : totalVariance < 0 ? (
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        ) : null}
                        <p className={`text-3xl font-bold ${totalVariance > 0 ? 'text-destructive' : totalVariance < 0 ? 'text-green-600' : ''}`} data-testid="text-variance">
                          {totalVariance >= 0 ? '+' : ''}£{totalVariance.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Runway</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-runway">
                        {runway === Infinity ? 'Positive' : `${runway}mo`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">At current burn</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {variancePercent > 20 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Budget variance of {variancePercent.toFixed(1)}% exceeds acceptable range. Immediate cost review and corrective actions required.
                  </AlertDescription>
                </Alert>
              )}

              {totalActual > monthlyRevenue && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Monthly costs (£{totalActual.toLocaleString()}) exceed revenue (£{monthlyRevenue.toLocaleString()}). Negative cash flow of £{(monthlyRevenue - totalActual).toLocaleString()} per month requires immediate attention.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Burn Rate</CardTitle>
                  <CardDescription>Monthly revenue input for cash flow analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="monthly-revenue">Monthly Revenue (£)</Label>
                      <Input
                        id="monthly-revenue"
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(parseFloat(e.target.value) || 0)}
                        placeholder="25000"
                        data-testid="input-monthly-revenue"
                      />
                    </div>
                    <div>
                      <Label>Net Monthly Cash Flow</Label>
                      <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`} data-testid="text-net-cash-flow">
                        {netCashFlow >= 0 ? '+' : ''}£{netCashFlow.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Revenue minus costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Cost Categories</CardTitle>
                      <CardDescription>Track budgeted vs actual spending by category</CardDescription>
                    </div>
                    <Button onClick={addCategory} size="sm" data-testid="button-add-category">
                      Add Category
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.map((category, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`category-name-${index}`}>Category Name</Label>
                          <Input
                            id={`category-name-${index}`}
                            value={category.name}
                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                            placeholder="e.g., Salaries & Wages"
                            data-testid={`input-category-name-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`category-budgeted-${index}`}>Budgeted (£)</Label>
                          <Input
                            id={`category-budgeted-${index}`}
                            type="number"
                            value={category.budgeted || ''}
                            onChange={(e) => updateCategory(index, 'budgeted', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-category-budgeted-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`category-actual-${index}`}>Actual (£)</Label>
                          <Input
                            id={`category-actual-${index}`}
                            type="number"
                            value={category.actual || ''}
                            onChange={(e) => updateCategory(index, 'actual', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-category-actual-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`category-type-${index}`}>Type</Label>
                          <select
                            id={`category-type-${index}`}
                            value={category.category}
                            onChange={(e) => updateCategory(index, 'category', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-category-type-${index}`}
                          >
                            <option value="personnel">Personnel</option>
                            <option value="technology">Technology</option>
                            <option value="marketing">Marketing</option>
                            <option value="operations">Operations</option>
                            <option value="legal">Legal/Compliance</option>
                            <option value="facilities">Office/Facilities</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <Label>Variance</Label>
                            <div className={`text-sm font-medium ${category.actual > category.budgeted ? 'text-destructive' : category.actual < category.budgeted ? 'text-green-600' : ''}`}>
                              {category.actual - category.budgeted >= 0 ? '+' : ''}£{(category.actual - category.budgeted).toLocaleString()}
                            </div>
                          </div>
                          {categories.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCategory(index)}
                              className="mt-5"
                              data-testid={`button-remove-category-${index}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variance" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Budget Allocation
                    </CardTitle>
                    <CardDescription>Distribution across cost categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {budgetByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={budgetByCategory}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {budgetByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add budget categories to see allocation</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budgeted vs Actual</CardTitle>
                    <CardDescription>Category-by-category comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {budgetVsActual.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={budgetVsActual}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                          <Bar dataKey="actual" fill="#10b981" name="Actual" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add budget categories to see comparison</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>12-Month Burn Rate Projection</CardTitle>
                  <CardDescription>Projected monthly costs with current variance trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyBurnTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="budgeted" stroke="#3b82f6" strokeWidth={2} name="Budgeted" />
                      <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="Projected Actual" />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variance Analysis Summary</CardTitle>
                  <CardDescription>Performance against budget targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-accent/20 rounded-md">
                      <span className="font-medium">Overall Budget Health</span>
                      <span className={`font-bold ${
                        budgetHealth === 'Excellent' ? 'text-green-600' : 
                        budgetHealth === 'Good' ? 'text-blue-600' : 
                        budgetHealth === 'Concerning' ? 'text-orange-600' : 
                        'text-destructive'
                      }`} data-testid="text-budget-health">
                        {budgetHealth}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-md">
                        <p className="text-sm text-muted-foreground">Categories Over Budget</p>
                        <p className="text-2xl font-bold text-destructive" data-testid="text-over-budget-count">
                          {categories.filter(c => c.actual > c.budgeted).length}
                        </p>
                      </div>
                      <div className="p-3 border rounded-md">
                        <p className="text-sm text-muted-foreground">Categories Under Budget</p>
                        <p className="text-2xl font-bold text-green-600" data-testid="text-under-budget-count">
                          {categories.filter(c => c.actual < c.budgeted).length}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Top Variance Contributors</h4>
                      <div className="space-y-2">
                        {categories
                          .map(c => ({ ...c, varianceAbs: Math.abs(c.actual - c.budgeted) }))
                          .sort((a, b) => b.varianceAbs - a.varianceAbs)
                          .slice(0, 3)
                          .map((cat, i) => {
                            const variance = cat.actual - cat.budgeted;
                            const variancePct = cat.budgeted > 0 ? (variance / cat.budgeted) * 100 : 0;
                            return (
                              <div key={i} className="flex items-center justify-between p-2 bg-accent/10 rounded">
                                <span className="text-sm font-medium">{cat.name}</span>
                                <span className={`text-sm font-bold ${variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                  {variance >= 0 ? '+' : ''}£{variance.toLocaleString()} ({variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%)
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Cost Optimization Tips</CardTitle>
                  <CardDescription>AI-powered recommendations based on your budget data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Best Practices for Startups</CardTitle>
                  <CardDescription>Essential financial management principles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Monthly Budget Reviews</p>
                        <p className="text-sm text-muted-foreground">Conduct detailed variance analysis monthly with all department heads to identify issues early</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Zero-Based Budgeting</p>
                        <p className="text-sm text-muted-foreground">Rebuild budget from zero quarterly rather than incrementing previous period - eliminates legacy waste</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Contingency Reserves</p>
                        <p className="text-sm text-muted-foreground">Maintain 15-20% unallocated buffer for unexpected costs and opportunities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Approval Workflows</p>
                        <p className="text-sm text-muted-foreground">Implement spend thresholds requiring CFO/CEO approval to prevent budget overruns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">5</span>
                      </div>
                      <div>
                        <p className="font-medium">KPI Linkage</p>
                        <p className="text-sm text-muted-foreground">Tie budget to business outcomes - track revenue per employee, CAC payback, etc.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">6</span>
                      </div>
                      <div>
                        <p className="font-medium">Rolling Forecasts</p>
                        <p className="text-sm text-muted-foreground">Maintain 12-month forward-looking budget that updates monthly based on actual performance</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Budget Control Action Plan</CardTitle>
                  <CardDescription>Structured roadmap to implement financial discipline and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
                            <span className="font-bold text-primary text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-primary">{item.week}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                                item.priority === 'High' ? 'bg-orange-500/10 text-orange-600' :
                                'bg-blue-500/10 text-blue-600'
                              }`} data-testid={`priority-${index}`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-sm" data-testid={`action-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Application Budget Documentation</CardTitle>
                  <CardDescription>Requirements for endorsing body submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Endorsing bodies scrutinize budget discipline as evidence of management capability. Demonstrate controls, not just aspirations.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="p-3 bg-accent/20 rounded-md">
                        <p className="font-medium mb-1">Required Documentation</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                          <li>12-24 month detailed budget with monthly granularity</li>
                          <li>Assumptions document explaining all major cost categories</li>
                          <li>Variance analysis if you have trading history</li>
                          <li>Comparison to industry benchmarks with sources</li>
                          <li>Board/advisor approval of budget (governance evidence)</li>
                          <li>Scenario analysis showing 20-30% cost variance impact</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-accent/20 rounded-md">
                        <p className="font-medium mb-1">Cost Optimization Evidence</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                          <li>Vendor negotiation outcomes and cost savings achieved</li>
                          <li>Efficiency metrics (revenue per employee, cost per customer, etc.)</li>
                          <li>Technology leveraging manual work automation</li>
                          <li>Outsourcing decisions with cost-benefit analysis</li>
                          <li>Monthly spending controls and approval hierarchies</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-accent/20 rounded-md">
                        <p className="font-medium mb-1">Sustainability Demonstration</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                          <li>Path to profitability timeline with milestones</li>
                          <li>Runway calculation with buffer assumptions</li>
                          <li>Revenue growth plan supporting cost structure</li>
                          <li>Unit economics showing scalability</li>
                          <li>Contingency plans for revenue shortfalls</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
