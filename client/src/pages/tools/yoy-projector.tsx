import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Calendar, Target, Users, DollarSign } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

type MetricInputs = {
  currentRevenue: number;
  currentCustomers: number;
  currentARR: number;
  revenueGrowthRate: number;
  customerGrowthRate: number;
  arrGrowthRate: number;
  projectionYears: 3 | 4 | 5;
};

type YearProjection = {
  year: number;
  yearLabel: string;
  revenue: number;
  customers: number;
  arr: number;
  revenueGrowth: number;
  customerGrowth: number;
  arrGrowth: number;
  averageRevenuePerCustomer: number;
};

type Milestone = {
  metric: string;
  targetValue: number;
  achievedYear: number;
  currentValue: number;
  projectedValue: number;
};

export default function YoYProjector() {
  const [inputs, setInputs] = useState<MetricInputs>({
    currentRevenue: 100000,
    currentCustomers: 50,
    currentARR: 80000,
    revenueGrowthRate: 30,
    customerGrowthRate: 25,
    arrGrowthRate: 35,
    projectionYears: 5
  });
  const [activeTab, setActiveTab] = useState('projector');
  const [savedDate, setSavedDate] = useState('');

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
    const saved = localStorage.getItem('yoy-projector-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('yoy-projector-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('yoy-projector-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const updateInput = (field: keyof MetricInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  // Generate year-over-year projections with compound growth
  const generateProjections = (): YearProjection[] => {
    const projections: YearProjection[] = [];
    
    for (let year = 0; year <= inputs.projectionYears; year++) {
      const revenueMultiplier = Math.pow(1 + inputs.revenueGrowthRate / 100, year);
      const customerMultiplier = Math.pow(1 + inputs.customerGrowthRate / 100, year);
      const arrMultiplier = Math.pow(1 + inputs.arrGrowthRate / 100, year);

      const revenue = Math.round(inputs.currentRevenue * revenueMultiplier);
      const customers = Math.round(inputs.currentCustomers * customerMultiplier);
      const arr = Math.round(inputs.currentARR * arrMultiplier);

      const prevRevenue = year > 0 ? Math.round(inputs.currentRevenue * Math.pow(1 + inputs.revenueGrowthRate / 100, year - 1)) : inputs.currentRevenue;
      const prevCustomers = year > 0 ? Math.round(inputs.currentCustomers * Math.pow(1 + inputs.customerGrowthRate / 100, year - 1)) : inputs.currentCustomers;
      const prevARR = year > 0 ? Math.round(inputs.currentARR * Math.pow(1 + inputs.arrGrowthRate / 100, year - 1)) : inputs.currentARR;

      projections.push({
        year: year,
        yearLabel: year === 0 ? 'Current' : `Year ${year}`,
        revenue,
        customers,
        arr,
        revenueGrowth: year === 0 ? 0 : Math.round(((revenue - prevRevenue) / prevRevenue) * 100),
        customerGrowth: year === 0 ? 0 : Math.round(((customers - prevCustomers) / prevCustomers) * 100),
        arrGrowth: year === 0 ? 0 : Math.round(((arr - prevARR) / prevARR) * 100),
        averageRevenuePerCustomer: customers > 0 ? Math.round(revenue / customers) : 0
      });
    }

    return projections;
  };

  // Calculate compound annual growth rate (CAGR)
  const calculateCAGR = (startValue: number, endValue: number, years: number): number => {
    if (startValue === 0 || years === 0) return 0;
    return Math.round(((Math.pow(endValue / startValue, 1 / years) - 1) * 100) * 10) / 10;
  };

  // Predict when milestones will be achieved
  const predictMilestones = (): Milestone[] => {
    const milestones: Milestone[] = [];
    const projections = generateProjections();
    const finalYear = projections[projections.length - 1];

    const revenueTargets = [250000, 500000, 1000000, 5000000];
    const customerTargets = [100, 500, 1000, 5000];
    const arrTargets = [200000, 500000, 1000000, 5000000];

    // Revenue milestones
    revenueTargets.forEach(target => {
      const achievedProjection = projections.find(p => p.revenue >= target);
      if (achievedProjection) {
        milestones.push({
          metric: 'Revenue',
          targetValue: target,
          achievedYear: achievedProjection.year,
          currentValue: inputs.currentRevenue,
          projectedValue: achievedProjection.revenue
        });
      }
    });

    // Customer milestones
    customerTargets.forEach(target => {
      const achievedProjection = projections.find(p => p.customers >= target);
      if (achievedProjection) {
        milestones.push({
          metric: 'Customers',
          targetValue: target,
          achievedYear: achievedProjection.year,
          currentValue: inputs.currentCustomers,
          projectedValue: achievedProjection.customers
        });
      }
    });

    // ARR milestones
    arrTargets.forEach(target => {
      const achievedProjection = projections.find(p => p.arr >= target);
      if (achievedProjection) {
        milestones.push({
          metric: 'ARR',
          targetValue: target,
          achievedYear: achievedProjection.year,
          currentValue: inputs.currentARR,
          projectedValue: achievedProjection.arr
        });
      }
    });

    return milestones.filter(m => m.achievedYear > 0 && m.achievedYear <= inputs.projectionYears);
  };

  const projections = generateProjections();
  const finalProjection = projections[projections.length - 1];
  const milestones = predictMilestones();

  const revenueCAGR = calculateCAGR(inputs.currentRevenue, finalProjection.revenue, inputs.projectionYears);
  const customerCAGR = calculateCAGR(inputs.currentCustomers, finalProjection.customers, inputs.projectionYears);
  const arrCAGR = calculateCAGR(inputs.currentARR, finalProjection.arr, inputs.projectionYears);

  const totalRevenueGrowth = finalProjection.revenue - inputs.currentRevenue;
  const totalCustomerGrowth = finalProjection.customers - inputs.currentCustomers;
  const totalARRGrowth = finalProjection.arr - inputs.currentARR;

  const isHighGrowth = revenueCAGR >= 30;
  const isScalable = customerCAGR >= 25;

  const getSmartTips = () => {
    const tips = [];

    if (inputs.revenueGrowthRate < 20) {
      tips.push('Revenue growth rate below 20% may not demonstrate sufficient scalability for UK Innovator Founder Visa endorsement - consider strategies to accelerate growth');
    }

    if (inputs.customerGrowthRate < 15) {
      tips.push('Customer acquisition rate below 15% annually suggests limited market traction - strengthen your go-to-market strategy');
    }

    if (inputs.currentARR / inputs.currentRevenue < 0.6) {
      tips.push('ARR represents less than 60% of revenue - consider transitioning to recurring revenue model for more predictable growth');
    }

    if (inputs.arrGrowthRate > inputs.revenueGrowthRate + 10) {
      tips.push('Strong ARR growth relative to total revenue indicates successful transition to subscription model - highlight this in your business plan');
    }

    if (isHighGrowth && isScalable) {
      tips.push('Excellent growth trajectory across all metrics - ensure projections are backed by market research and realistic assumptions');
    }

    if (finalProjection.averageRevenuePerCustomer < 1000) {
      tips.push('Low average revenue per customer may indicate need for pricing optimization or upselling strategies to improve unit economics');
    }

    if (milestones.length < 3) {
      tips.push('Limited milestone achievements within projection period - consider extending timeline or adjusting growth assumptions to show scalability');
    }

    if (inputs.projectionYears === 3 && revenueCAGR > 50) {
      tips.push('Very aggressive 3-year growth projections - ensure you have evidence of market capacity and team capability to execute');
    }

    if (inputs.currentCustomers < 10) {
      tips.push('Limited current customer base - endorsing bodies will look for evidence of product-market fit and early traction');
    }

    tips.push('Document all growth assumptions with market research, competitor benchmarks, and customer validation data for endorsing body review');
    tips.push('Include sensitivity analysis showing impact of 20-30% variance in growth rates to demonstrate financial planning rigor');
    tips.push('Highlight compound growth effects in your business plan narrative - exponential growth is key selling point for innovation scalability');

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Validate all current metrics with actual data - revenue reports, customer counts, ARR calculations", priority: "Critical" },
      { week: "Week 1", action: "Research market growth rates in your sector to benchmark your projections against industry standards", priority: "Critical" },
      { week: "Week 1-2", action: "Document assumptions behind each growth rate with supporting market research and competitor analysis", priority: "Critical" },
      { week: "Week 2", action: "Create detailed quarter-by-quarter breakdown showing how you'll achieve annual growth targets", priority: "High" },
      { week: "Week 2-3", action: "Identify specific initiatives driving each metric (marketing campaigns, product launches, partnerships)", priority: "High" },
      { week: "Week 3", action: "Build financial model showing how revenue growth translates to profitability and cash flow", priority: "Critical" },
      { week: "Week 3", action: "Map growth projections to hiring plan - show team expansion needed to support customer growth", priority: "High" },
      { week: "Week 3-4", action: "Create milestone timeline highlighting key achievements that de-risk the business for investors", priority: "High" },
      { week: "Week 4", action: "Prepare sensitivity scenarios (optimistic, base, pessimistic) to show range of outcomes", priority: "Medium" },
      { week: "Week 4", action: "Have financial advisor review projections for realism and consistency with business plan narrative", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - YEAR-OVER-YEAR GROWTH PROJECTIONS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

CURRENT METRICS (BASELINE)
${'-'.repeat(80)}
Annual Revenue: £${inputs.currentRevenue.toLocaleString()}
Customer Count: ${inputs.currentCustomers.toLocaleString()}
Annual Recurring Revenue (ARR): £${inputs.currentARR.toLocaleString()}
Average Revenue per Customer: £${(inputs.currentRevenue / inputs.currentCustomers).toLocaleString()}
ARR as % of Total Revenue: ${Math.round((inputs.currentARR / inputs.currentRevenue) * 100)}%

GROWTH ASSUMPTIONS
${'-'.repeat(80)}
Revenue Growth Rate: ${inputs.revenueGrowthRate}% per year
Customer Growth Rate: ${inputs.customerGrowthRate}% per year
ARR Growth Rate: ${inputs.arrGrowthRate}% per year
Projection Period: ${inputs.projectionYears} years

COMPOUND ANNUAL GROWTH RATES (CAGR)
${'-'.repeat(80)}
Revenue CAGR: ${revenueCAGR}%
Customer CAGR: ${customerCAGR}%
ARR CAGR: ${arrCAGR}%

YEAR-BY-YEAR PROJECTIONS
${'-'.repeat(80)}
${projections.map(p => `
${p.yearLabel}:
  Revenue: £${p.revenue.toLocaleString()} ${p.year > 0 ? `(+${p.revenueGrowth}% YoY)` : ''}
  Customers: ${p.customers.toLocaleString()} ${p.year > 0 ? `(+${p.customerGrowth}% YoY)` : ''}
  ARR: £${p.arr.toLocaleString()} ${p.year > 0 ? `(+${p.arrGrowth}% YoY)` : ''}
  Avg Revenue/Customer: £${p.averageRevenuePerCustomer.toLocaleString()}
`).join('')}

${inputs.projectionYears}-YEAR CUMULATIVE GROWTH
${'-'.repeat(80)}
Total Revenue Growth: £${totalRevenueGrowth.toLocaleString()} (+${Math.round((totalRevenueGrowth / inputs.currentRevenue) * 100)}%)
Total Customer Growth: ${totalCustomerGrowth.toLocaleString()} (+${Math.round((totalCustomerGrowth / inputs.currentCustomers) * 100)}%)
Total ARR Growth: £${totalARRGrowth.toLocaleString()} (+${Math.round((totalARRGrowth / inputs.currentARR) * 100)}%)

Final Year Revenue: £${finalProjection.revenue.toLocaleString()}
Final Year Customers: ${finalProjection.customers.toLocaleString()}
Final Year ARR: £${finalProjection.arr.toLocaleString()}

MILESTONE PREDICTIONS
${'-'.repeat(80)}
${milestones.length > 0 ? milestones.map(m => `
${m.metric} - ${m.metric === 'Revenue' || m.metric === 'ARR' ? '£' : ''}${m.targetValue.toLocaleString()}:
  Current: ${m.metric === 'Revenue' || m.metric === 'ARR' ? '£' : ''}${m.currentValue.toLocaleString()}
  Achievement: Year ${m.achievedYear} (${m.metric === 'Revenue' || m.metric === 'ARR' ? '£' : ''}${m.projectedValue.toLocaleString()})
  Growth Required: ${Math.round(((m.projectedValue - m.currentValue) / m.currentValue) * 100)}%
`).join('') : 'No major milestones achieved within projection period - consider adjusting growth assumptions'}

GROWTH TRAJECTORY ASSESSMENT
${'-'.repeat(80)}
Revenue Growth Classification: ${revenueCAGR >= 30 ? 'HIGH GROWTH' : revenueCAGR >= 15 ? 'MODERATE GROWTH' : 'LOW GROWTH'}
Customer Acquisition: ${customerCAGR >= 25 ? 'SCALABLE' : customerCAGR >= 15 ? 'STEADY' : 'LIMITED'}
Recurring Revenue Model: ${inputs.currentARR / inputs.currentRevenue >= 0.7 ? 'STRONG' : inputs.currentARR / inputs.currentRevenue >= 0.4 ? 'DEVELOPING' : 'EARLY STAGE'}

Unit Economics Trend: ${finalProjection.averageRevenuePerCustomer > (inputs.currentRevenue / inputs.currentCustomers) ? 'IMPROVING' : 'DECLINING'}
  Current ARPC: £${Math.round(inputs.currentRevenue / inputs.currentCustomers).toLocaleString()}
  Year ${inputs.projectionYears} ARPC: £${finalProjection.averageRevenuePerCustomer.toLocaleString()}
  Change: ${Math.round(((finalProjection.averageRevenuePerCustomer - (inputs.currentRevenue / inputs.currentCustomers)) / (inputs.currentRevenue / inputs.currentCustomers)) * 100)}%

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSING BODY CONSIDERATIONS
${'-'.repeat(80)}
For UK Innovator Founder Visa applications, endorsing bodies evaluate:

1. SCALABILITY EVIDENCE
   - Your ${revenueCAGR}% revenue CAGR ${revenueCAGR >= 30 ? 'demonstrates strong' : 'may need strengthening for'} scalability case
   - Customer growth of ${customerCAGR}% annually shows ${customerCAGR >= 25 ? 'excellent' : customerCAGR >= 15 ? 'moderate' : 'limited'} market traction
   - Ensure projections are backed by addressable market analysis (TAM/SAM/SOM)

2. INNOVATION POTENTIAL
   - High growth rates suggest disruptive innovation or unique value proposition
   - Document competitive advantages enabling superior growth vs. incumbents
   - Show how technology/process innovation drives efficiency gains

3. JOB CREATION
   - ${finalProjection.customers} customers by Year ${inputs.projectionYears} implies need for expanded team
   - Map customer growth to hiring plan (typically 1 employee per 20-50 customers for SaaS)
   - Show progression from current team to ${Math.round(finalProjection.customers / 30)} estimated employees

4. FINANCIAL VIABILITY
   - ARR growth of ${arrCAGR}% demonstrates recurring revenue model strength
   - Ensure cash flow projections show path to profitability within 24-36 months
   - Maintain buffer capital to sustain operations during growth phase

5. MARKET VALIDATION
   - Current ${inputs.currentCustomers} customers serves as proof of product-market fit
   - Growth assumptions must be validated with pilot programs, LOIs, or early sales
   - Include customer testimonials and case studies supporting projections

ASSUMPTIONS DOCUMENTATION CHECKLIST
${'-'.repeat(80)}
For each growth assumption, provide supporting evidence:

Revenue Growth Rate (${inputs.revenueGrowthRate}%):
  [ ] Market research showing sector growth rates
  [ ] Competitor benchmarks and market share analysis
  [ ] Sales pipeline and conversion rate data
  [ ] Pricing strategy and customer LTV calculations
  [ ] Marketing spend and CAC assumptions
  [ ] Product roadmap and expansion plans

Customer Growth Rate (${inputs.customerGrowthRate}%):
  [ ] Go-to-market strategy with acquisition channels
  [ ] Historical conversion rates and sales cycle data
  [ ] Market size analysis (TAM/SAM/SOM)
  [ ] Customer acquisition cost and payback period
  [ ] Retention and churn rate assumptions
  [ ] Partnership and distribution agreements

ARR Growth Rate (${inputs.arrGrowthRate}%):
  [ ] Subscription model design and pricing tiers
  [ ] Upsell and cross-sell strategies
  [ ] Customer lifetime value projections
  [ ] Churn mitigation strategies
  [ ] Expansion revenue from existing customers
  [ ] New product line revenue streams

SENSITIVITY ANALYSIS
${'-'.repeat(80)}
Test impact of growth rate variations on final outcomes:

Conservative Scenario (-10% growth rates):
  Revenue: £${Math.round(inputs.currentRevenue * Math.pow(1 + (inputs.revenueGrowthRate - 10) / 100, inputs.projectionYears)).toLocaleString()}
  Customers: ${Math.round(inputs.currentCustomers * Math.pow(1 + (inputs.customerGrowthRate - 10) / 100, inputs.projectionYears)).toLocaleString()}
  ARR: £${Math.round(inputs.currentARR * Math.pow(1 + (inputs.arrGrowthRate - 10) / 100, inputs.projectionYears)).toLocaleString()}

Aggressive Scenario (+10% growth rates):
  Revenue: £${Math.round(inputs.currentRevenue * Math.pow(1 + (inputs.revenueGrowthRate + 10) / 100, inputs.projectionYears)).toLocaleString()}
  Customers: ${Math.round(inputs.currentCustomers * Math.pow(1 + (inputs.customerGrowthRate + 10) / 100, inputs.projectionYears)).toLocaleString()}
  ARR: £${Math.round(inputs.currentARR * Math.pow(1 + (inputs.arrGrowthRate + 10) / 100, inputs.projectionYears)).toLocaleString()}

NEXT STEPS FOR VISA APPLICATION
${'-'.repeat(80)}
1. Validate all current baseline metrics with financial statements
2. Document growth assumptions with market research and competitor analysis
3. Create detailed quarterly breakdown of projections
4. Map projections to operational plan (hiring, marketing, product)
5. Build financial model connecting revenue to profitability
6. Prepare evidence portfolio supporting each assumption
7. Have accountant review and certify projections
8. Integrate projections into business plan narrative
9. Prepare presentation highlighting compound growth potential
10. Be ready to defend assumptions in endorsing body interview

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: Projections are estimates based on provided growth assumptions.
Actual results may vary significantly. Consult with financial advisors and
ensure all assumptions are defensible with market evidence.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoy-projections-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-yoy-projector">Year-over-Year Growth Projector</h1>
            <p className="text-lg text-muted-foreground">Multi-year compound growth modeling with milestone predictions</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="yoy-projector"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Year-over-Year Growth Projector"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-yoy-projector">
              <TabsTrigger value="projector" data-testid="tab-projector">Projector</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="projector" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={isHighGrowth ? "border-green-500" : ""}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Revenue CAGR</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-revenue-cagr">{revenueCAGR}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isHighGrowth ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-xs">{isHighGrowth ? 'High Growth' : 'Moderate'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isScalable ? "border-green-500" : ""}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Customer CAGR</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-customer-cagr">{customerCAGR}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isScalable ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-xs">{isScalable ? 'Scalable' : 'Steady'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">ARR CAGR</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-arr-cagr">{arrCAGR}%</p>
                      <p className="text-xs text-muted-foreground mt-2">{inputs.projectionYears} years</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Milestones</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-milestones-count">{milestones.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">Achieved</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Metrics (Baseline)</CardTitle>
                  <CardDescription>Enter your current business metrics to generate projections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current-revenue">Current Annual Revenue (£)</Label>
                      <Input
                        id="current-revenue"
                        type="number"
                        value={inputs.currentRevenue}
                        onChange={(e) => updateInput('currentRevenue', parseFloat(e.target.value) || 0)}
                        data-testid="input-current-revenue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-customers">Current Customer Count</Label>
                      <Input
                        id="current-customers"
                        type="number"
                        value={inputs.currentCustomers}
                        onChange={(e) => updateInput('currentCustomers', parseFloat(e.target.value) || 0)}
                        data-testid="input-current-customers"
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-arr">Current ARR (£)</Label>
                      <Input
                        id="current-arr"
                        type="number"
                        value={inputs.currentARR}
                        onChange={(e) => updateInput('currentARR', parseFloat(e.target.value) || 0)}
                        data-testid="input-current-arr"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="revenue-growth">Revenue Growth Rate (%/year)</Label>
                      <Input
                        id="revenue-growth"
                        type="number"
                        value={inputs.revenueGrowthRate}
                        onChange={(e) => updateInput('revenueGrowthRate', parseFloat(e.target.value) || 0)}
                        data-testid="input-revenue-growth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer-growth">Customer Growth Rate (%/year)</Label>
                      <Input
                        id="customer-growth"
                        type="number"
                        value={inputs.customerGrowthRate}
                        onChange={(e) => updateInput('customerGrowthRate', parseFloat(e.target.value) || 0)}
                        data-testid="input-customer-growth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="arr-growth">ARR Growth Rate (%/year)</Label>
                      <Input
                        id="arr-growth"
                        type="number"
                        value={inputs.arrGrowthRate}
                        onChange={(e) => updateInput('arrGrowthRate', parseFloat(e.target.value) || 0)}
                        data-testid="input-arr-growth"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projection-years">Projection Years</Label>
                      <select
                        id="projection-years"
                        value={inputs.projectionYears}
                        onChange={(e) => updateInput('projectionYears', parseInt(e.target.value) as 3 | 4 | 5)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-projection-years"
                      >
                        <option value={3}>3 years</option>
                        <option value={4}>4 years</option>
                        <option value={5}>5 years</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isHighGrowth && (
                <Alert>
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription>
                    Revenue CAGR of {revenueCAGR}% may not demonstrate sufficient scalability for endorsing body approval. Consider strategies to accelerate growth or extend projection period.
                  </AlertDescription>
                </Alert>
              )}

              {isHighGrowth && isScalable && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent growth trajectory! Revenue CAGR of {revenueCAGR}% and customer CAGR of {customerCAGR}% demonstrate strong scalability potential. Ensure projections are backed by market research.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Revenue Growth Trajectory
                  </CardTitle>
                  <CardDescription>Multi-year revenue compound growth projection</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={projections}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="yearLabel" className="text-sm" />
                      <YAxis className="text-sm" tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`£${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Customer Growth
                    </CardTitle>
                    <CardDescription>Year-over-year customer acquisition</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={projections}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="yearLabel" className="text-sm" />
                        <YAxis className="text-sm" />
                        <Tooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Customers']}
                          contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="customers" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      ARR Evolution
                    </CardTitle>
                    <CardDescription>Annual recurring revenue growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={projections}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="yearLabel" className="text-sm" />
                        <YAxis className="text-sm" tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: number) => [`£${value.toLocaleString()}`, 'ARR']}
                          contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="arr" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Year-by-Year Breakdown</CardTitle>
                  <CardDescription>Detailed annual metrics with growth rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2" data-testid="header-year">Year</th>
                          <th className="text-right p-2" data-testid="header-revenue">Revenue</th>
                          <th className="text-right p-2" data-testid="header-revenue-growth">YoY %</th>
                          <th className="text-right p-2" data-testid="header-customers">Customers</th>
                          <th className="text-right p-2" data-testid="header-customer-growth">YoY %</th>
                          <th className="text-right p-2" data-testid="header-arr">ARR</th>
                          <th className="text-right p-2" data-testid="header-arr-growth">YoY %</th>
                          <th className="text-right p-2" data-testid="header-arpc">ARPC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projections.map((proj, index) => (
                          <tr key={proj.year} className="border-b" data-testid={`row-year-${proj.year}`}>
                            <td className="p-2 font-medium">{proj.yearLabel}</td>
                            <td className="text-right p-2">£{proj.revenue.toLocaleString()}</td>
                            <td className="text-right p-2">
                              {proj.year > 0 ? (
                                <span className="text-green-600">+{proj.revenueGrowth}%</span>
                              ) : '-'}
                            </td>
                            <td className="text-right p-2">{proj.customers.toLocaleString()}</td>
                            <td className="text-right p-2">
                              {proj.year > 0 ? (
                                <span className="text-green-600">+{proj.customerGrowth}%</span>
                              ) : '-'}
                            </td>
                            <td className="text-right p-2">£{proj.arr.toLocaleString()}</td>
                            <td className="text-right p-2">
                              {proj.year > 0 ? (
                                <span className="text-green-600">+{proj.arrGrowth}%</span>
                              ) : '-'}
                            </td>
                            <td className="text-right p-2">£{proj.averageRevenuePerCustomer.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year Growth Comparison</CardTitle>
                  <CardDescription>Annual percentage growth by metric</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={projections.filter(p => p.year > 0)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="yearLabel" className="text-sm" />
                      <YAxis className="text-sm" label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      <Bar dataKey="revenueGrowth" fill="hsl(var(--primary))" name="Revenue Growth %" />
                      <Bar dataKey="customerGrowth" fill="hsl(var(--accent))" name="Customer Growth %" />
                      <Bar dataKey="arrGrowth" fill="hsl(142, 76%, 36%)" name="ARR Growth %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Milestone Predictions
                  </CardTitle>
                  <CardDescription>Key achievements within {inputs.projectionYears}-year projection period</CardDescription>
                </CardHeader>
                <CardContent>
                  {milestones.length > 0 ? (
                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`milestone-${index}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{milestone.metric}</span>
                              <span className="text-2xl font-bold text-primary">
                                {milestone.metric === 'Revenue' || milestone.metric === 'ARR' ? '£' : ''}{milestone.targetValue.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Achieved in Year {milestone.achievedYear} 
                              ({Math.round(((milestone.projectedValue - milestone.currentValue) / milestone.currentValue) * 100)}% growth from current {milestone.metric === 'Revenue' || milestone.metric === 'ARR' ? '£' : ''}{milestone.currentValue.toLocaleString()})
                            </p>
                          </div>
                          <div className="text-right">
                            <Calendar className="h-8 w-8 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No major milestones achieved within {inputs.projectionYears}-year period. Consider adjusting growth rates or extending projection timeline to demonstrate scalability.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compound Growth Summary</CardTitle>
                  <CardDescription>{inputs.projectionYears}-year cumulative analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Revenue</h4>
                      <p className="text-2xl font-bold">£{finalProjection.revenue.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+£{totalRevenueGrowth.toLocaleString()} ({Math.round((totalRevenueGrowth / inputs.currentRevenue) * 100)}%)</p>
                      <p className="text-xs text-muted-foreground">CAGR: {revenueCAGR}%</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Customers</h4>
                      <p className="text-2xl font-bold">{finalProjection.customers.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+{totalCustomerGrowth.toLocaleString()} ({Math.round((totalCustomerGrowth / inputs.currentCustomers) * 100)}%)</p>
                      <p className="text-xs text-muted-foreground">CAGR: {customerCAGR}%</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">ARR</h4>
                      <p className="text-2xl font-bold">£{finalProjection.arr.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+£{totalARRGrowth.toLocaleString()} ({Math.round((totalARRGrowth / inputs.currentARR) * 100)}%)</p>
                      <p className="text-xs text-muted-foreground">CAGR: {arrCAGR}%</p>
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
                    Smart Growth Recommendations
                  </CardTitle>
                  <CardDescription>AI-powered insights for your year-over-year projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover-elevate" data-testid={`tip-${index}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    4-Week Growth Validation Action Plan
                  </CardTitle>
                  <CardDescription>Prioritized timeline for documenting and validating your projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                        data-testid={`action-${index}`}
                      >
                        <div className="flex-shrink-0">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.priority}
                          </span>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
