import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, DollarSign, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type BreakevenInputs = {
  fixedCostsMonthly: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  initialRevenue: number;
  projectionMonths: 12 | 24 | 36;
};

export default function BreakevenCalculator() {
  const [inputs, setInputs] = useState<BreakevenInputs>({
    fixedCostsMonthly: 15000,
    variableCostPerUnit: 30,
    pricePerUnit: 100,
    initialRevenue: 5000,
    projectionMonths: 12
  });
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedDate, setSavedDate] = useState('');

  const updateInput = (field: keyof BreakevenInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  // Core calculations
  const contributionMargin = inputs.pricePerUnit - inputs.variableCostPerUnit;
  const contributionMarginPercent = inputs.pricePerUnit > 0 ? (contributionMargin / inputs.pricePerUnit) * 100 : 0;
  const breakevenUnits = contributionMargin > 0 ? Math.ceil(inputs.fixedCostsMonthly / contributionMargin) : 0;
  const breakevenRevenue = breakevenUnits * inputs.pricePerUnit;
  
  // Monthly projections
  const generateProjections = () => {
    const projections = [];
    const monthlyGrowthRate = 0.10; // 10% monthly growth assumption
    
    for (let month = 1; month <= inputs.projectionMonths; month++) {
      const growthFactor = Math.pow(1 + monthlyGrowthRate, month - 1);
      const units = Math.round((inputs.initialRevenue / inputs.pricePerUnit) * growthFactor);
      const revenue = units * inputs.pricePerUnit;
      const variableCosts = units * inputs.variableCostPerUnit;
      const totalCosts = inputs.fixedCostsMonthly + variableCosts;
      const profit = revenue - totalCosts;
      const cumulativeProfit: number = month === 1 ? profit : projections[month - 2].cumulativeProfit + profit;
      
      projections.push({
        month: `M${month}`,
        monthNum: month,
        units,
        revenue: Math.round(revenue),
        fixedCosts: inputs.fixedCostsMonthly,
        variableCosts: Math.round(variableCosts),
        totalCosts: Math.round(totalCosts),
        profit: Math.round(profit),
        cumulativeProfit: Math.round(cumulativeProfit),
        isBreakeven: revenue >= totalCosts
      });
    }
    
    return projections;
  };

  const projections = generateProjections();
  const breakevenMonth = projections.find(p => p.isBreakeven)?.monthNum || -1;
  const finalProfit = projections[projections.length - 1].cumulativeProfit;
  const profitMargin = projections[projections.length - 1].revenue > 0 
    ? (projections[projections.length - 1].profit / projections[projections.length - 1].revenue) * 100 
    : 0;
  const isViable = finalProfit > 0 && breakevenMonth !== -1 && breakevenMonth <= 18;

  // Scenario analysis
  const generateScenarios = () => {
    const scenarios = [
      { name: 'Optimistic', priceMult: 1.2, costMult: 0.85, color: '#10b981' },
      { name: 'Base', priceMult: 1.0, costMult: 1.0, color: '#3b82f6' },
      { name: 'Pessimistic', priceMult: 0.85, costMult: 1.15, color: '#ef4444' }
    ];

    return scenarios.map(scenario => {
      const price = inputs.pricePerUnit * scenario.priceMult;
      const varCost = inputs.variableCostPerUnit * scenario.costMult;
      const fixedCost = inputs.fixedCostsMonthly * scenario.costMult;
      const margin = price - varCost;
      const units = margin > 0 ? Math.ceil(fixedCost / margin) : 0;
      const revenue = units * price;

      return {
        scenario: scenario.name,
        breakevenUnits: units,
        breakevenRevenue: Math.round(revenue),
        contributionMargin: Math.round(margin),
        color: scenario.color
      };
    });
  };

  const scenarioData = generateScenarios();

  const getSerializedState = () => {
    return {
      inputs,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('inputs' in state) setInputs(state.inputs);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('breakeven-calculator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('breakeven-calculator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('breakeven-calculator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (contributionMarginPercent < 40) {
      tips.push('Low contribution margin (under 40%) indicates pricing pressure - consider value-based pricing strategies or cost reduction');
    }

    if (breakevenUnits > 500) {
      tips.push('High breakeven point requires strong distribution - endorsing bodies favor scalable market access');
    }

    if (breakevenMonth === -1 || breakevenMonth > 18) {
      tips.push('Extended breakeven timeline (18+ months) may concern endorsers - demonstrate clear path to profitability with milestone validation');
    }

    if (inputs.fixedCostsMonthly > 20000) {
      tips.push('High fixed costs increase business risk - show evidence of operational efficiency and lean startup principles');
    }

    if (contributionMargin < inputs.fixedCostsMonthly / 100) {
      tips.push('Contribution margin too low relative to fixed costs - review pricing strategy or explore higher-margin revenue streams');
    }

    if (isViable) {
      tips.push('Solid unit economics - ensure breakeven assumptions are validated with market research and customer commitments');
    } else {
      tips.push('Current model shows weak viability - revisit pricing, cost structure, or market size assumptions before submission');
    }

    tips.push('Include sensitivity analysis in business plan showing impact of 20% variance in price and volume');
    tips.push('Document competitor pricing benchmarks to justify your unit economics to endorsing bodies');
    tips.push('Show clear customer acquisition strategy with validated cost per acquisition below contribution margin');
    tips.push('Demonstrate how breakeven point aligns with funding runway and investment milestones');

    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Build detailed unit economics model with clear assumptions for price, volume, and costs", priority: "Critical" },
      { week: "Week 1", action: "Validate pricing strategy with competitor research and customer willingness-to-pay surveys", priority: "Critical" },
      { week: "Week 1-2", action: "Document all cost assumptions with supplier quotes and operational research", priority: "High" },
      { week: "Week 2", action: "Create breakeven sensitivity table testing ±20% variance in key assumptions", priority: "Critical" },
      { week: "Week 2-3", action: "Map customer acquisition funnel with conversion rates to validate unit projections", priority: "High" },
      { week: "Week 3", action: "Develop path-to-profitability roadmap with quarterly milestones and KPIs", priority: "High" },
      { week: "Week 3-4", action: "Have business advisor review unit economics for realism and market alignment", priority: "Critical" },
      { week: "Week 4", action: "Prepare visual breakeven analysis chart for business plan presentation", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE BREAKEVEN ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

BUSINESS MODEL ASSUMPTIONS
${'-'.repeat(80)}
Fixed Costs (Monthly): £${inputs.fixedCostsMonthly.toLocaleString()}
Variable Cost per Unit: £${inputs.variableCostPerUnit.toLocaleString()}
Price per Unit: £${inputs.pricePerUnit.toLocaleString()}
Initial Monthly Revenue: £${inputs.initialRevenue.toLocaleString()}
Projection Period: ${inputs.projectionMonths} months

KEY BREAKEVEN METRICS
${'-'.repeat(80)}
Contribution Margin: £${contributionMargin.toLocaleString()} per unit (${contributionMarginPercent.toFixed(1)}%)
Breakeven Point (Units): ${breakevenUnits} units per month
Breakeven Point (Revenue): £${breakevenRevenue.toLocaleString()} per month
Breakeven Month: ${breakevenMonth === -1 ? 'Not achieved in projection period' : `Month ${breakevenMonth}`}
Final Cumulative Profit: £${finalProfit.toLocaleString()}
Final Profit Margin: ${profitMargin.toFixed(1)}%
Business Viability: ${isViable ? 'VIABLE - Meets endorsing body expectations' : 'NEEDS REVISION - Review assumptions'}

MONTHLY FINANCIAL PROJECTIONS (${inputs.projectionMonths} MONTHS)
${'-'.repeat(80)}
${projections.map(p => `
Month ${p.monthNum}:
  Units Sold: ${p.units}
  Revenue: £${p.revenue.toLocaleString()}
  Fixed Costs: £${p.fixedCosts.toLocaleString()}
  Variable Costs: £${p.variableCosts.toLocaleString()}
  Total Costs: £${p.totalCosts.toLocaleString()}
  Monthly Profit: £${p.profit.toLocaleString()}
  Cumulative Profit: £${p.cumulativeProfit.toLocaleString()}
  Status: ${p.isBreakeven ? 'PROFITABLE' : 'Loss-making'}`).join('\n')}

SCENARIO ANALYSIS (STRESS TESTING)
${'-'.repeat(80)}
${scenarioData.map(s => `
${s.scenario} Scenario:
  Breakeven Units: ${s.breakevenUnits} units/month
  Breakeven Revenue: £${s.breakevenRevenue.toLocaleString()}
  Contribution Margin: £${s.contributionMargin}/unit`).join('\n')}

UNIT ECONOMICS BREAKDOWN
${'-'.repeat(80)}
Price per Unit: £${inputs.pricePerUnit.toLocaleString()}
Variable Cost per Unit: £${inputs.variableCostPerUnit.toLocaleString()}
Contribution Margin: £${contributionMargin.toLocaleString()}
Contribution Margin %: ${contributionMarginPercent.toFixed(1)}%

Fixed Costs Coverage:
  Monthly Fixed Costs: £${inputs.fixedCostsMonthly.toLocaleString()}
  Units Required to Cover: ${breakevenUnits} units
  Days to Break Even at Current Rate: ${breakevenMonth === -1 ? 'N/A' : Math.round(breakevenMonth * 30)} days

SMART RECOMMENDATIONS FOR PROFITABILITY
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN - PATH TO BREAKEVEN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSING BODY REQUIREMENTS - BUSINESS VIABILITY
${'-'.repeat(80)}
UK Innovator Founder Visa applicants must demonstrate:

1. SUSTAINABLE UNIT ECONOMICS
   - Contribution margin should exceed 30% (yours: ${contributionMarginPercent.toFixed(1)}%)
   - Clear path to profitability within 18-24 months (yours: ${breakevenMonth === -1 ? 'Not achieved' : `Month ${breakevenMonth}`})
   - Realistic pricing validated by market research

2. SCALABLE COST STRUCTURE
   - Fixed costs proportionate to market opportunity
   - Variable costs showing economies of scale potential
   - Evidence of operational efficiency

3. MARKET VALIDATION
   - Customer commitments or letters of intent
   - Competitor pricing benchmarks
   - Total Addressable Market (TAM) analysis supporting volume assumptions

4. FINANCIAL PRUDENCE
   - Breakeven assumptions stress-tested with sensitivity analysis
   - Conservative revenue projections with upside scenarios
   - Clear correlation between investment and revenue milestones

5. RISK MITIGATION
   - Identification of breakeven drivers and dependencies
   - Contingency plans if assumptions not met
   - Evidence of founder capability to execute

CRITICAL SUCCESS FACTORS
${'-'.repeat(80)}
${breakevenMonth !== -1 && breakevenMonth <= 12 ? '✓' : '✗'} Achieve breakeven within 12 months
${contributionMarginPercent >= 40 ? '✓' : '✗'} Maintain healthy contribution margin (40%+)
${breakevenUnits <= 300 ? '✓' : '✗'} Reasonable sales volume requirement (≤300 units/month)
${profitMargin >= 15 ? '✓' : '✗'} Strong profit margin at scale (15%+)
${isViable ? '✓' : '✗'} Overall business model viability

NEXT STEPS FOR VISA APPLICATION
${'-'.repeat(80)}
1. Validate all pricing assumptions with market research and competitor analysis
2. Document cost structure with supplier quotes and operational plans
3. Create detailed customer acquisition plan with projected conversion rates
4. Build financial model showing monthly cash flow for 36 months
5. Prepare sensitivity analysis testing key assumption variations
6. Have qualified UK accountant review and validate projections
7. Gather evidence of market demand (customer commitments, surveys, pilots)
8. Map breakeven milestones to funding tranches and business development phases

ASSUMPTIONS DOCUMENTATION CHECKLIST
${'-'.repeat(80)}
[ ] Market research supporting pricing strategy
[ ] Competitor pricing benchmarks
[ ] Supplier quotes for variable costs
[ ] Operational plan justifying fixed costs
[ ] Customer acquisition cost (CAC) analysis
[ ] Lifetime value (LTV) calculations
[ ] Sales funnel with conversion rates
[ ] Evidence of scalability (unit economics improve with volume)
[ ] Risk factors and mitigation strategies
[ ] Team capability to execute plan

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: Breakeven analysis based on assumptions provided. Actual results may vary.
Endorsing bodies require evidence-backed projections. Consult qualified advisors before submission.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breakeven-analysis-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-breakeven-calculator">Breakeven Calculator</h1>
            <p className="text-lg text-muted-foreground">Comprehensive unit economics and path to profitability analysis</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="breakeven-calculator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Breakeven Calculator"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-breakeven">
              <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={isViable ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Breakeven Units</p>
                      <p className="text-3xl font-bold" data-testid="text-breakeven-units">{breakevenUnits}</p>
                      <p className="text-xs text-muted-foreground mt-2">per month</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Breakeven Revenue</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-breakeven-revenue">£{breakevenRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">monthly target</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={breakevenMonth !== -1 && breakevenMonth <= 12 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Breakeven Month</p>
                      <p className="text-3xl font-bold" data-testid="text-breakeven-month">
                        {breakevenMonth === -1 ? 'N/A' : `M${breakevenMonth}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">time to profitability</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Contribution Margin</p>
                      <p className={`text-3xl font-bold ${contributionMarginPercent >= 40 ? 'text-green-600' : 'text-orange-500'}`} data-testid="text-contribution-margin">
                        {contributionMarginPercent.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">per unit sold</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!isViable && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Current unit economics show {breakevenMonth === -1 ? 'no breakeven in projection period' : `extended ${breakevenMonth}-month breakeven timeline`}. Endorsing bodies expect profitability within 18 months. Review pricing or cost structure.
                  </AlertDescription>
                </Alert>
              )}

              {isViable && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Strong unit economics with {breakevenMonth}-month breakeven. Ensure assumptions are validated with market research and customer evidence.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Unit Economics Inputs</CardTitle>
                  <CardDescription>Configure your business model assumptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fixed-costs">Fixed Costs per Month (£)</Label>
                      <Input
                        id="fixed-costs"
                        type="number"
                        value={inputs.fixedCostsMonthly}
                        onChange={(e) => updateInput('fixedCostsMonthly', parseFloat(e.target.value) || 0)}
                        placeholder="15000"
                        data-testid="input-fixed-costs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Rent, salaries, utilities, software - costs that don't vary with sales</p>
                    </div>
                    <div>
                      <Label htmlFor="variable-cost">Variable Cost per Unit (£)</Label>
                      <Input
                        id="variable-cost"
                        type="number"
                        value={inputs.variableCostPerUnit}
                        onChange={(e) => updateInput('variableCostPerUnit', parseFloat(e.target.value) || 0)}
                        placeholder="30"
                        data-testid="input-variable-cost"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Materials, shipping, commissions - costs that increase with each sale</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price-per-unit">Price per Unit (£)</Label>
                      <Input
                        id="price-per-unit"
                        type="number"
                        value={inputs.pricePerUnit}
                        onChange={(e) => updateInput('pricePerUnit', parseFloat(e.target.value) || 0)}
                        placeholder="100"
                        data-testid="input-price-per-unit"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Average selling price per product or service unit</p>
                    </div>
                    <div>
                      <Label htmlFor="initial-revenue">Initial Monthly Revenue (£)</Label>
                      <Input
                        id="initial-revenue"
                        type="number"
                        value={inputs.initialRevenue}
                        onChange={(e) => updateInput('initialRevenue', parseFloat(e.target.value) || 0)}
                        placeholder="5000"
                        data-testid="input-initial-revenue"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Starting revenue in Month 1 (model assumes 10% monthly growth)</p>
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
                    <Target className="h-5 w-5 text-primary" />
                    Unit Economics Summary
                  </CardTitle>
                  <CardDescription>Key metrics for profitability assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price per Unit</span>
                        <span className="font-semibold">£{inputs.pricePerUnit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Variable Cost per Unit</span>
                        <span className="font-semibold">£{inputs.variableCostPerUnit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-sm font-medium">Contribution Margin</span>
                        <span className="font-bold text-green-600">£{contributionMargin.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Contribution Margin %</span>
                        <span className="font-bold text-green-600">{contributionMarginPercent.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fixed Costs (Monthly)</span>
                        <span className="font-semibold">£{inputs.fixedCostsMonthly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Units to Cover Fixed Costs</span>
                        <span className="font-semibold">{breakevenUnits} units</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-sm font-medium">Breakeven Revenue</span>
                        <span className="font-bold text-primary">£{breakevenRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Profit Margin (Final)</span>
                        <span className={`font-bold ${profitMargin > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Revenue vs Costs - Path to Profitability
                  </CardTitle>
                  <CardDescription>Monthly financial trajectory showing breakeven point</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `£${value.toLocaleString()}`}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Revenue"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalCosts" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Total Costs"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Monthly Profit"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-sm text-muted-foreground text-center">
                    {breakevenMonth !== -1 ? (
                      <p>Breakeven achieved in Month {breakevenMonth} where revenue crosses total costs line</p>
                    ) : (
                      <p>Breakeven not achieved within {inputs.projectionMonths}-month projection period - review assumptions</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Scenario Comparison - Stress Testing
                  </CardTitle>
                  <CardDescription>Breakeven analysis under different market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={scenarioData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scenario" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="breakevenUnits" fill="#3b82f6" name="Breakeven Units" />
                      <Bar dataKey="contributionMargin" fill="#10b981" name="Contribution Margin (£)" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    {scenarioData.map((scenario, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <p className="font-semibold mb-2" style={{ color: scenario.color }}>{scenario.scenario}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Units:</span>
                            <span className="font-medium">{scenario.breakevenUnits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-medium">£{scenario.breakevenRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Margin:</span>
                            <span className="font-medium">£{scenario.contributionMargin}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Profitability</CardTitle>
                  <CardDescription>Total profit/loss accumulation over projection period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeProfit" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        name="Cumulative Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Final Cumulative Position:</span>
                      <span className={`text-xl font-bold ${finalProfit > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        £{finalProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips - Accelerating Path to Profitability</CardTitle>
                  <CardDescription>Context-aware recommendations for improving your breakeven analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex gap-3 p-4 border rounded-lg hover-elevate" data-testid={`tip-${index}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Visa Viability Requirements</CardTitle>
                  <CardDescription>Endorsing body expectations for business model sustainability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${contributionMarginPercent >= 30 ? 'text-green-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium">Healthy Unit Economics (30%+ contribution margin)</p>
                        <p className="text-sm text-muted-foreground">Your contribution margin: {contributionMarginPercent.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${breakevenMonth !== -1 && breakevenMonth <= 18 ? 'text-green-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium">Reasonable Time to Profitability (within 18 months)</p>
                        <p className="text-sm text-muted-foreground">Your breakeven month: {breakevenMonth === -1 ? 'Not achieved' : `Month ${breakevenMonth}`}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <div>
                        <p className="font-medium">Evidence-Based Assumptions</p>
                        <p className="text-sm text-muted-foreground">Document all pricing, cost, and volume assumptions with market research</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <div>
                        <p className="font-medium">Sensitivity Analysis Required</p>
                        <p className="text-sm text-muted-foreground">Test impact of ±20% variance in key assumptions (shown in Analysis tab)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <div>
                        <p className="font-medium">Scalability Demonstration</p>
                        <p className="text-sm text-muted-foreground">Show how unit economics improve with scale and market penetration</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan - Breakeven Validation</CardTitle>
                  <CardDescription>Systematic approach to validating and documenting your path to profitability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{item.week}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Checklist</CardTitle>
                  <CardDescription>Essential evidence for endorsing body review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Market research validating pricing strategy and competitive positioning',
                      'Competitor pricing benchmarks demonstrating market rates',
                      'Supplier quotes or contracts supporting variable cost assumptions',
                      'Operational plan justifying fixed cost requirements',
                      'Customer acquisition cost (CAC) analysis with conversion rates',
                      'Lifetime value (LTV) calculations showing long-term profitability',
                      'Sales funnel documentation with projected conversion rates',
                      'Evidence of scalability (economies of scale, operational leverage)',
                      'Risk assessment identifying key breakeven drivers and sensitivities',
                      'Team capability evidence showing execution ability'
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-sm p-2 border-l-2 border-primary/30 pl-4">
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
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
