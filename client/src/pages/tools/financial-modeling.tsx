import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, LineChart as LineChartIcon, BarChart3, DollarSign } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'financial-modeling',
  toolName: 'Financial Modeling Tool',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. A strong financial model is essential for endorsement success. I'll help you build realistic projections that demonstrate viability and growth potential. Let's model your business finances!",
  questions: [
    {
      id: 'initial-capital',
      question: "What's your initial capital or investment amount in pounds? This is the total funding available for your business operations.",
      hint: "Be accurate - endorsers verify all financial claims",
      fieldKey: 'initial_capital_info',
      minLength: 10
    },
    {
      id: 'revenue-model',
      question: "Describe your revenue model. What's your current or expected monthly revenue, and what's your realistic monthly growth rate (%)?",
      hint: "Be conservative - overoptimistic projections raise red flags",
      fieldKey: 'revenue_model_info',
      minLength: 30
    },
    {
      id: 'cost-structure',
      question: "What's your cost structure? Describe your monthly fixed costs (rent, salaries, subscriptions) and variable costs as a percentage of revenue.",
      hint: "Include all recurring business expenses",
      fieldKey: 'cost_structure_info',
      minLength: 30
    },
    {
      id: 'cash-reserves',
      question: "What cash reserves do you have access to? How many months of runway does this provide at your current burn rate?",
      hint: "Endorsers look for at least 12 months of runway",
      fieldKey: 'cash_reserves_info',
      minLength: 20
    },
    {
      id: 'projection-timeline',
      question: "What projection period do you need? Are you modeling 12 months, 24 months, or 36 months of financial projections?",
      hint: "3-year projections are typically required for endorsement",
      fieldKey: 'projection_period',
      minLength: 10
    },
    {
      id: 'scenario-preference',
      question: "Which scenario are you most interested in? Optimistic (best case), Base (realistic), or Pessimistic (worst case)? Or do you want to compare all three?",
      hint: "Presenting multiple scenarios shows thorough planning",
      fieldKey: 'scenario_preference',
      minLength: 10
    }
  ],
  completionMessage: "Great! I've captured your financial parameters. Switch to the traditional view to see detailed projections, scenario comparisons, cash flow analysis, and key metrics that endorsers look for."
};

type ScenarioType = 'optimistic' | 'base' | 'pessimistic';

type FinancialInputs = {
  initialCapital: number;
  monthlyRevenue: number;
  revenueGrowthRate: number;
  fixedCosts: number;
  variableCostPercent: number;
  cashReserves: number;
  projectionMonths: 12 | 24 | 36;
};

export default function FinancialModeling() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('financial-modeling-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [inputs, setInputs] = useState<FinancialInputs>({
    initialCapital: 50000,
    monthlyRevenue: 5000,
    revenueGrowthRate: 10,
    fixedCosts: 15000,
    variableCostPercent: 30,
    cashReserves: 50000,
    projectionMonths: 12
  });
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('base');
  const [activeTab, setActiveTab] = useState('modeling');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('financial-modeling-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('financial-modeling-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newInputs = { ...inputs };
    
    if (answers.initial_capital_info) {
      const amountMatch = answers.initial_capital_info.match(/£?(\d[\d,]*)/);
      if (amountMatch) {
        newInputs.initialCapital = parseInt(amountMatch[1].replace(/,/g, ''));
      }
    }
    
    if (answers.revenue_model_info) {
      const revenueMatch = answers.revenue_model_info.match(/£?(\d[\d,]*)/);
      if (revenueMatch) {
        newInputs.monthlyRevenue = parseInt(revenueMatch[1].replace(/,/g, ''));
      }
      const growthMatch = answers.revenue_model_info.match(/(\d+)%/);
      if (growthMatch) {
        newInputs.revenueGrowthRate = parseInt(growthMatch[1]);
      }
    }
    
    if (answers.cost_structure_info) {
      const fixedMatch = answers.cost_structure_info.match(/£?(\d[\d,]*)/);
      if (fixedMatch) {
        newInputs.fixedCosts = parseInt(fixedMatch[1].replace(/,/g, ''));
      }
      const varMatch = answers.cost_structure_info.match(/(\d+)%/);
      if (varMatch) {
        newInputs.variableCostPercent = parseInt(varMatch[1]);
      }
    }
    
    if (answers.cash_reserves_info) {
      const cashMatch = answers.cash_reserves_info.match(/£?(\d[\d,]*)/);
      if (cashMatch) {
        newInputs.cashReserves = parseInt(cashMatch[1].replace(/,/g, ''));
      }
    }
    
    if (answers.projection_period) {
      if (answers.projection_period.includes('36') || answers.projection_period.includes('3 year')) {
        newInputs.projectionMonths = 36;
      } else if (answers.projection_period.includes('24') || answers.projection_period.includes('2 year')) {
        newInputs.projectionMonths = 24;
      } else {
        newInputs.projectionMonths = 12;
      }
    }
    
    if (answers.scenario_preference) {
      const lower = answers.scenario_preference.toLowerCase();
      if (lower.includes('optimistic')) setSelectedScenario('optimistic');
      else if (lower.includes('pessimistic')) setSelectedScenario('pessimistic');
      else setSelectedScenario('base');
    }
    
    setInputs(newInputs);
    
    const date = new Date().toLocaleString('en-GB');
    localStorage.setItem('financial-modeling-state', JSON.stringify({
      inputs: newInputs,
      selectedScenario,
      activeTab: 'modeling',
      savedDate: date
    }));
    setSavedDate(date);
    
    setActiveTab('modeling');
    setMode('traditional');
  };

  const getSerializedState = () => {
    return {
      inputs,
      selectedScenario,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('inputs' in state) setInputs(state.inputs);
    if ('selectedScenario' in state) setSelectedScenario(state.selectedScenario);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('financial-modeling-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('financial-modeling-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('financial-modeling-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const updateInput = (field: keyof FinancialInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  // Generate monthly projections based on scenario
  const generateProjections = (scenario: ScenarioType = 'base') => {
    const multipliers = {
      optimistic: { revenue: 1.25, costs: 0.85, growth: 1.5 },
      base: { revenue: 1, costs: 1, growth: 1 },
      pessimistic: { revenue: 0.75, costs: 1.15, growth: 0.5 }
    };

    const mult = multipliers[scenario];
    const months = inputs.projectionMonths;
    const projections = [];

    let cash = inputs.cashReserves;
    let cumulativeRevenue = 0;
    let cumulativeCosts = 0;

    for (let month = 1; month <= months; month++) {
      const growthFactor = Math.pow(1 + (inputs.revenueGrowthRate * mult.growth / 100), month - 1);
      const revenue = inputs.monthlyRevenue * mult.revenue * growthFactor;
      const variableCosts = revenue * (inputs.variableCostPercent / 100) * mult.costs;
      const fixedCosts = inputs.fixedCosts * mult.costs;
      const totalCosts = variableCosts + fixedCosts;
      const netIncome = revenue - totalCosts;
      
      cash += netIncome;
      cumulativeRevenue += revenue;
      cumulativeCosts += totalCosts;

      projections.push({
        month: `M${month}`,
        revenue: Math.round(revenue),
        costs: Math.round(totalCosts),
        netIncome: Math.round(netIncome),
        cash: Math.round(cash),
        cumulativeRevenue: Math.round(cumulativeRevenue),
        cumulativeCosts: Math.round(cumulativeCosts)
      });
    }

    return projections;
  };

  // Generate scenario comparison data
  const generateScenarioComparison = () => {
    const scenarios: ScenarioType[] = ['optimistic', 'base', 'pessimistic'];
    const finalMonth = inputs.projectionMonths;
    
    return scenarios.map(scenario => {
      const projections = generateProjections(scenario);
      const finalData = projections[finalMonth - 1];
      
      return {
        scenario: scenario.charAt(0).toUpperCase() + scenario.slice(1),
        revenue: finalData.cumulativeRevenue,
        costs: finalData.cumulativeCosts,
        profit: finalData.cumulativeRevenue - finalData.cumulativeCosts,
        cash: finalData.cash
      };
    });
  };

  // Generate 3-statement model (simplified)
  const generate3StatementModel = () => {
    const projections = generateProjections('base');
    const finalMonth = projections[inputs.projectionMonths - 1];
    
    return {
      incomeStatement: {
        revenue: finalMonth.cumulativeRevenue,
        cogs: Math.round(finalMonth.cumulativeRevenue * (inputs.variableCostPercent / 100)),
        grossProfit: Math.round(finalMonth.cumulativeRevenue * (1 - inputs.variableCostPercent / 100)),
        operatingExpenses: inputs.fixedCosts * inputs.projectionMonths,
        netIncome: finalMonth.cumulativeRevenue - finalMonth.cumulativeCosts
      },
      balanceSheet: {
        cash: finalMonth.cash,
        assets: finalMonth.cash + inputs.initialCapital * 0.3,
        totalAssets: Math.round(finalMonth.cash + inputs.initialCapital * 0.3),
        liabilities: Math.max(0, inputs.initialCapital * 0.2),
        equity: inputs.initialCapital,
        retainedEarnings: finalMonth.cumulativeRevenue - finalMonth.cumulativeCosts
      },
      cashFlow: {
        operatingCash: finalMonth.cumulativeRevenue - finalMonth.cumulativeCosts,
        investingCash: -inputs.initialCapital * 0.3,
        financingCash: inputs.initialCapital,
        netCashFlow: finalMonth.cash - inputs.cashReserves
      }
    };
  };

  const currentProjections = generateProjections(selectedScenario);
  const scenarioComparison = generateScenarioComparison();
  const statements = generate3StatementModel();
  
  const finalCash = currentProjections[currentProjections.length - 1].cash;
  const totalRevenue = currentProjections[currentProjections.length - 1].cumulativeRevenue;
  const totalCosts = currentProjections[currentProjections.length - 1].cumulativeCosts;
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const monthsToBreakeven = currentProjections.findIndex(p => p.cash >= inputs.cashReserves);
  const isSustainable = finalCash > 0 && profitMargin > 0;

  const getSmartTips = () => {
    const tips = [];

    if (inputs.initialCapital < 10000) {
      tips.push('Consider whether initial capital is sufficient for your business plan - endorsers assess funding appropriateness');
    }

    if (finalCash < 10000) {
      tips.push('Cash position at period end is critical - consider reducing fixed costs or accelerating revenue growth');
    }

    if (profitMargin < 20) {
      tips.push('Low profit margins may signal weak unit economics - review pricing strategy and cost structure');
    }

    if (inputs.variableCostPercent > 50) {
      tips.push('Variable costs exceed 50% of revenue - explore supplier negotiations or pricing increases to improve margins');
    }

    if (inputs.revenueGrowthRate < 5) {
      tips.push('Conservative growth rate may limit scalability story - endorsing bodies favor high-growth potential ventures');
    }

    if (monthsToBreakeven > 18 && monthsToBreakeven !== -1) {
      tips.push('Extended breakeven timeline - prepare detailed justification for endorsing body review');
    }

    if (isSustainable) {
      tips.push('Strong financial model - ensure projections are backed by market research and realistic assumptions');
    } else {
      tips.push('Current model shows negative cash position - revise assumptions or secure additional funding tranches');
    }

    tips.push('Include sensitivity analysis in your business plan showing impact of 20% revenue variance');
    tips.push('Document all financial assumptions with market research, competitor benchmarks, and customer validation');

    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Build detailed 3-statement financial model in Excel with monthly granularity for 36 months", priority: "Critical" },
      { week: "Week 1", action: "Document all revenue assumptions with TAM/SAM/SOM analysis and pricing justification", priority: "Critical" },
      { week: "Week 1-2", action: "Create scenario analysis (optimistic, base, pessimistic) with clear trigger assumptions", priority: "High" },
      { week: "Week 2", action: "Develop unit economics framework showing CAC, LTV, payback period, and cohort analysis", priority: "Critical" },
      { week: "Week 2-3", action: "Build cash flow waterfall identifying key inflection points and funding requirements", priority: "High" },
      { week: "Week 3", action: "Prepare sensitivity tables testing impact of revenue, cost, and growth rate variations", priority: "High" },
      { week: "Week 3-4", action: "Have accountant review model for accuracy, consistency, and compliance with UK GAAP", priority: "Critical" },
      { week: "Week 4", action: "Create visual dashboard with key metrics (runway, burn rate, ARR, growth) for presentation", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE FINANCIAL MODEL
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

MODEL ASSUMPTIONS
${'-'.repeat(80)}
Initial Capital: £${inputs.initialCapital.toLocaleString()}
Monthly Revenue (Month 1): £${inputs.monthlyRevenue.toLocaleString()}
Revenue Growth Rate: ${inputs.revenueGrowthRate}% per month
Fixed Monthly Costs: £${inputs.fixedCosts.toLocaleString()}
Variable Costs: ${inputs.variableCostPercent}% of revenue
Starting Cash Reserves: £${inputs.cashReserves.toLocaleString()}
Projection Period: ${inputs.projectionMonths} months

KEY PERFORMANCE INDICATORS (${inputs.projectionMonths}-MONTH PERIOD)
${'-'.repeat(80)}
Total Revenue: £${totalRevenue.toLocaleString()}
Total Costs: £${totalCosts.toLocaleString()}
Net Profit: £${totalProfit.toLocaleString()}
Profit Margin: ${profitMargin.toFixed(1)}%
Final Cash Position: £${finalCash.toLocaleString()}
Months to Breakeven: ${monthsToBreakeven === -1 ? 'Not achieved' : monthsToBreakeven}
Sustainability: ${isSustainable ? 'POSITIVE' : 'REQUIRES REVISION'}

MONTHLY PROJECTIONS (${selectedScenario.toUpperCase()} SCENARIO)
${'-'.repeat(80)}
${currentProjections.map(p => `
${p.month}:
  Revenue: £${p.revenue.toLocaleString()}
  Costs: £${p.costs.toLocaleString()}
  Net Income: £${p.netIncome.toLocaleString()}
  Cash Position: £${p.cash.toLocaleString()}`).join('\n')}

3-STATEMENT MODEL (${inputs.projectionMonths}-MONTH CUMULATIVE)
${'-'.repeat(80)}

INCOME STATEMENT
  Revenue: £${statements.incomeStatement.revenue.toLocaleString()}
  Cost of Goods Sold: £${statements.incomeStatement.cogs.toLocaleString()}
  Gross Profit: £${statements.incomeStatement.grossProfit.toLocaleString()}
  Operating Expenses: £${statements.incomeStatement.operatingExpenses.toLocaleString()}
  Net Income: £${statements.incomeStatement.netIncome.toLocaleString()}

BALANCE SHEET
  Assets:
    Cash: £${statements.balanceSheet.cash.toLocaleString()}
    Other Assets: £${Math.round(inputs.initialCapital * 0.3).toLocaleString()}
    Total Assets: £${statements.balanceSheet.totalAssets.toLocaleString()}
  
  Liabilities & Equity:
    Liabilities: £${statements.balanceSheet.liabilities.toLocaleString()}
    Equity: £${statements.balanceSheet.equity.toLocaleString()}
    Retained Earnings: £${statements.balanceSheet.retainedEarnings.toLocaleString()}

CASH FLOW STATEMENT
  Operating Activities: £${statements.cashFlow.operatingCash.toLocaleString()}
  Investing Activities: £${statements.cashFlow.investingCash.toLocaleString()}
  Financing Activities: £${statements.cashFlow.financingCash.toLocaleString()}
  Net Cash Flow: £${statements.cashFlow.netCashFlow.toLocaleString()}

SCENARIO ANALYSIS COMPARISON
${'-'.repeat(80)}
${scenarioComparison.map(s => `
${s.scenario} Scenario:
  Total Revenue: £${s.revenue.toLocaleString()}
  Total Costs: £${s.costs.toLocaleString()}
  Net Profit: £${s.profit.toLocaleString()}
  Final Cash: £${s.cash.toLocaleString()}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA APPLICATION FINANCIAL REQUIREMENTS
${'-'.repeat(80)}
- Investment capital appropriate for your business plan (documented and accessible)
- Demonstrate sufficient funds to sustain business for 6-12 months minimum
- Show credible path to profitability within 24-36 months
- Include detailed assumptions with market validation
- Provide scenario analysis showing resilience to market changes
- Document unit economics and scalability potential
- Have model reviewed by qualified UK accountant
- Ensure consistency with business plan narrative
- Include cash runway analysis with funding milestones
- Show how funds will be deployed across business functions

CRITICAL FINANCIAL METRICS FOR ENDORSING BODIES
${'-'.repeat(80)}
- Monthly Burn Rate: £${inputs.fixedCosts.toLocaleString()} (fixed) + variable
- Runway: ${finalCash > 0 ? `${Math.round(finalCash / inputs.fixedCosts)} months` : 'Insufficient'}
- Unit Economics: Contribution Margin = ${100 - inputs.variableCostPercent}%
- Growth Rate: ${inputs.revenueGrowthRate}% MoM
- Profit Margin: ${profitMargin.toFixed(1)}%
- Working Capital: £${finalCash.toLocaleString()}

ASSUMPTIONS DOCUMENTATION REQUIREMENTS
${'-'.repeat(80)}
For each assumption, provide:
1. Market research supporting revenue projections
2. Competitor benchmarks for cost structures  
3. Customer validation of pricing models
4. Industry standards for growth rates
5. Evidence of team capability to execute
6. Risk factors and mitigation strategies

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This model is for planning purposes. Actual results may vary significantly.
Consult with qualified accountants and financial advisors before making business decisions.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-modeling-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-xl font-bold mb-2" data-testid="heading-financial-modeling">Financial Modeling</h1>
            <p className="text-lg text-muted-foreground">Comprehensive 3-statement model, projections, and scenario analysis</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="financial-modeling"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Financial Modeling"
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-financial-modeling">
              <TabsTrigger value="modeling" data-testid="tab-modeling">Modeling</TabsTrigger>
              <TabsTrigger value="projections" data-testid="tab-projections">Projections</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="modeling" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={finalCash > 0 ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Final Cash</p>
                      <p className="text-xl font-bold" data-testid="text-final-cash">£{finalCash.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">{inputs.projectionMonths} months</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
                      <p className="text-xl font-bold text-green-600" data-testid="text-total-revenue">£{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">Cumulative</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Profit Margin</p>
                      <p className={`text-xl font-bold ${profitMargin > 0 ? 'text-green-600' : 'text-destructive'}`} data-testid="text-profit-margin">
                        {profitMargin.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Net margin</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Breakeven</p>
                      <p className="text-xl font-bold text-primary" data-testid="text-breakeven">
                        {monthsToBreakeven === -1 ? 'N/A' : `M${monthsToBreakeven}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Months</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Model Inputs</CardTitle>
                  <CardDescription>Configure your financial assumptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="initial-capital">Initial Capital (£)</Label>
                      <Input
                        id="initial-capital"
                        type="number"
                        value={inputs.initialCapital}
                        onChange={(e) => updateInput('initialCapital', parseFloat(e.target.value) || 0)}
                        data-testid="input-initial-capital"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly-revenue">Monthly Revenue - M1 (£)</Label>
                      <Input
                        id="monthly-revenue"
                        type="number"
                        value={inputs.monthlyRevenue}
                        onChange={(e) => updateInput('monthlyRevenue', parseFloat(e.target.value) || 0)}
                        data-testid="input-monthly-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="revenue-growth">Revenue Growth Rate (%/month)</Label>
                      <Input
                        id="revenue-growth"
                        type="number"
                        value={inputs.revenueGrowthRate}
                        onChange={(e) => updateInput('revenueGrowthRate', parseFloat(e.target.value) || 0)}
                        data-testid="input-revenue-growth"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fixed-costs">Fixed Monthly Costs (£)</Label>
                      <Input
                        id="fixed-costs"
                        type="number"
                        value={inputs.fixedCosts}
                        onChange={(e) => updateInput('fixedCosts', parseFloat(e.target.value) || 0)}
                        data-testid="input-fixed-costs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="variable-costs">Variable Costs (% of revenue)</Label>
                      <Input
                        id="variable-costs"
                        type="number"
                        value={inputs.variableCostPercent}
                        onChange={(e) => updateInput('variableCostPercent', parseFloat(e.target.value) || 0)}
                        data-testid="input-variable-costs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cash-reserves">Starting Cash Reserves (£)</Label>
                      <Input
                        id="cash-reserves"
                        type="number"
                        value={inputs.cashReserves}
                        onChange={(e) => updateInput('cashReserves', parseFloat(e.target.value) || 0)}
                        data-testid="input-cash-reserves"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="projection-months">Projection Period</Label>
                    <select
                      id="projection-months"
                      value={inputs.projectionMonths}
                      onChange={(e) => updateInput('projectionMonths', parseInt(e.target.value) as 12 | 24 | 36)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-projection-months"
                    >
                      <option value={12}>12 months</option>
                      <option value={24}>24 months</option>
                      <option value={36}>36 months</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    3-Statement Model Summary
                  </CardTitle>
                  <CardDescription>{inputs.projectionMonths}-month cumulative financial statements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold border-b pb-2">Income Statement</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">£{statements.incomeStatement.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">COGS</span>
                          <span className="font-medium">£{statements.incomeStatement.cogs.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Gross Profit</span>
                          <span className="font-medium">£{statements.incomeStatement.grossProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">OpEx</span>
                          <span className="font-medium">£{statements.incomeStatement.operatingExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Net Income</span>
                          <span className={statements.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-destructive'}>
                            £{statements.incomeStatement.netIncome.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold border-b pb-2">Balance Sheet</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash</span>
                          <span className="font-medium">£{statements.balanceSheet.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other Assets</span>
                          <span className="font-medium">£{Math.round(inputs.initialCapital * 0.3).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Total Assets</span>
                          <span>£{statements.balanceSheet.totalAssets.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t">
                          <span className="text-muted-foreground">Liabilities</span>
                          <span className="font-medium">£{statements.balanceSheet.liabilities.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equity</span>
                          <span className="font-medium">£{statements.balanceSheet.equity.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retained Earnings</span>
                          <span className="font-medium">£{statements.balanceSheet.retainedEarnings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold border-b pb-2">Cash Flow</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Operating</span>
                          <span className="font-medium">£{statements.cashFlow.operatingCash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investing</span>
                          <span className="font-medium">£{statements.cashFlow.investingCash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Financing</span>
                          <span className="font-medium">£{statements.cashFlow.financingCash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Net Cash Flow</span>
                          <span className={statements.cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}>
                            £{statements.cashFlow.netCashFlow.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projections" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="h-5 w-5 text-primary" />
                        Monthly Projections
                      </CardTitle>
                      <CardDescription>{inputs.projectionMonths}-month revenue, costs, and cash flow</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {(['optimistic', 'base', 'pessimistic'] as ScenarioType[]).map(scenario => (
                        <Button
                          key={scenario}
                          variant={selectedScenario === scenario ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedScenario(scenario)}
                          data-testid={`button-scenario-${scenario}`}
                        >
                          {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={currentProjections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
                      <Line type="monotone" dataKey="cash" stroke="#3b82f6" strokeWidth={2} name="Cash Position" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Scenario Comparison
                  </CardTitle>
                  <CardDescription>Optimistic vs Base vs Pessimistic outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={scenarioComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scenario" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      <Bar dataKey="costs" fill="#ef4444" name="Costs" />
                      <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {scenarioComparison.map((scenario, idx) => (
                      <Card key={idx} className="p-4">
                        <h4 className="font-semibold mb-3">{scenario.scenario} Scenario</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium">£{scenario.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Profit</span>
                            <span className={`font-medium ${scenario.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              £{scenario.profit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Final Cash</span>
                            <span className={`font-medium ${scenario.cash >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              £{scenario.cash.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Metrics</CardTitle>
                  <CardDescription>Key performance indicators from your model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Profitability Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gross Margin</span>
                          <span className="font-medium">{100 - inputs.variableCostPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Net Margin</span>
                          <span className="font-medium">{profitMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Profit</span>
                          <span className={`font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                            £{totalProfit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Cash & Runway Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Burn</span>
                          <span className="font-medium">£{inputs.fixedCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cash Runway</span>
                          <span className="font-medium">
                            {finalCash > 0 ? `${Math.round(finalCash / inputs.fixedCosts)} months` : 'Insufficient'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Breakeven Month</span>
                          <span className="font-medium">
                            {monthsToBreakeven === -1 ? 'Not achieved' : `Month ${monthsToBreakeven}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>Context-aware guidance based on your financial model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Model Best Practices</CardTitle>
                  <CardDescription>Essential guidelines for visa application financial models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium">Conservative Assumptions</p>
                      <p className="text-sm text-muted-foreground">Use realistic, evidence-based projections. Endorsing bodies scrutinize overly optimistic models.</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium">Document Everything</p>
                      <p className="text-sm text-muted-foreground">Every assumption must be backed by market research, competitor analysis, or customer validation.</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium">Monthly Granularity</p>
                      <p className="text-sm text-muted-foreground">Show monthly projections for first 12-24 months, then quarterly or annually thereafter.</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium">Scenario Analysis</p>
                      <p className="text-sm text-muted-foreground">Include optimistic, base, and pessimistic scenarios to demonstrate risk awareness.</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-medium">Professional Review</p>
                      <p className="text-sm text-muted-foreground">Have a qualified UK accountant review your model for accuracy and compliance.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Step-by-step guide to building a professional financial model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium text-muted-foreground">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded ${
                            item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                            item.priority === 'High' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                            'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Expectations</CardTitle>
                  <CardDescription>What financial evidence endorsing bodies require</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">1</div>
                      <p>Detailed 3-statement financial model (Income Statement, Balance Sheet, Cash Flow) with monthly granularity for first 24 months</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">2</div>
                      <p>Clear documentation of all assumptions including revenue drivers, pricing strategy, cost structure, and growth projections</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">3</div>
                      <p>Evidence of investment capital appropriate for your plan with source documentation and accessibility confirmation</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">4</div>
                      <p>Scenario analysis showing business resilience under optimistic, base, and pessimistic market conditions</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">5</div>
                      <p>Unit economics analysis demonstrating viable customer acquisition costs, lifetime value, and contribution margins</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-medium">6</div>
                      <p>Professional accountant review letter confirming model accuracy and compliance with UK accounting standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
