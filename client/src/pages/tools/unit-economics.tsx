import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type UnitEconomicsInputs = {
  customerAcquisitionSpend: number;
  customersAcquired: number;
  monthlyRevenuePerCustomer: number;
  averageCustomerLifetimeMonths: number;
  cogsPerCustomer: number;
};

export default function UnitEconomics() {
  const [inputs, setInputs] = useState<UnitEconomicsInputs>({
    customerAcquisitionSpend: 10000,
    customersAcquired: 50,
    monthlyRevenuePerCustomer: 99,
    averageCustomerLifetimeMonths: 24,
    cogsPerCustomer: 30
  });
  const [activeTab, setActiveTab] = useState('economics');
  const [savedDate, setSavedDate] = useState('');

  const updateInput = (field: keyof UnitEconomicsInputs, value: number) => {
    setInputs({ ...inputs, [field]: value });
  };

  // Calculate core metrics
  const cac = inputs.customersAcquired > 0 
    ? inputs.customerAcquisitionSpend / inputs.customersAcquired 
    : 0;
  
  const monthlyGrossMarginPerCustomer = inputs.monthlyRevenuePerCustomer - inputs.cogsPerCustomer;
  const grossMarginPercent = inputs.monthlyRevenuePerCustomer > 0
    ? (monthlyGrossMarginPerCustomer / inputs.monthlyRevenuePerCustomer) * 100
    : 0;
  
  const ltv = monthlyGrossMarginPerCustomer * inputs.averageCustomerLifetimeMonths;
  
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  
  const monthsToRecoverCAC = monthlyGrossMarginPerCustomer > 0 
    ? cac / monthlyGrossMarginPerCustomer 
    : 0;
  
  const annualChurnRate = inputs.averageCustomerLifetimeMonths > 0
    ? (12 / inputs.averageCustomerLifetimeMonths) * 100
    : 0;
  
  const monthlyChurnRate = annualChurnRate / 12;
  
  const arpu = inputs.monthlyRevenuePerCustomer;
  
  const unitProfitability = ltv - cac;
  
  // Health indicators
  const isHealthyLTVCAC = ltvCacRatio >= 3;
  const isHealthyPayback = monthsToRecoverCAC <= 12;
  const isHealthyGrossMargin = grossMarginPercent >= 70;
  const isHealthyChurn = annualChurnRate <= 15;
  const isProfitable = unitProfitability > 0;
  
  const healthScore = [
    isHealthyLTVCAC,
    isHealthyPayback,
    isHealthyGrossMargin,
    isHealthyChurn,
    isProfitable
  ].filter(Boolean).length * 20;

  // Generate cumulative customer value over time
  const generateCustomerValueTimeline = () => {
    const months = Math.min(inputs.averageCustomerLifetimeMonths, 36);
    const timeline = [];
    let cumulativeValue = 0;
    
    for (let month = 0; month <= months; month++) {
      if (month === 0) {
        cumulativeValue = -cac;
      } else {
        cumulativeValue += monthlyGrossMarginPerCustomer;
      }
      
      timeline.push({
        month: `M${month}`,
        value: Math.round(cumulativeValue),
        breakeven: 0
      });
    }
    
    return timeline;
  };

  const customerValueTimeline = generateCustomerValueTimeline();

  // CAC vs LTV comparison data
  const cacLtvComparison = [
    { metric: 'CAC', value: Math.round(cac), color: '#ef4444' },
    { metric: 'LTV', value: Math.round(ltv), color: '#10b981' }
  ];

  // Revenue breakdown pie chart
  const revenueBreakdown = [
    { name: 'Gross Profit', value: Math.round(monthlyGrossMarginPerCustomer * inputs.averageCustomerLifetimeMonths), color: '#10b981' },
    { name: 'COGS', value: Math.round(inputs.cogsPerCustomer * inputs.averageCustomerLifetimeMonths), color: '#f59e0b' },
    { name: 'CAC', value: Math.round(cac), color: '#ef4444' }
  ].filter(item => item.value > 0);

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
    const saved = localStorage.getItem('unit-economics-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('unit-economics-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('unit-economics-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    // LTV:CAC ratio analysis
    if (ltvCacRatio < 1) {
      tips.push("Critical: LTV:CAC ratio below 1 means each customer loses money. Immediately reduce acquisition costs or increase customer lifetime value");
    } else if (ltvCacRatio < 3) {
      tips.push("LTV:CAC ratio is below the SaaS benchmark of 3:1. Focus on either reducing CAC through more efficient marketing or increasing LTV through better retention and upsells");
    } else if (ltvCacRatio >= 3 && ltvCacRatio < 5) {
      tips.push("Good LTV:CAC ratio of " + ltvCacRatio.toFixed(1) + ":1 meets industry standards. Consider strategic growth investments while maintaining this healthy ratio");
    } else {
      tips.push("Excellent LTV:CAC ratio of " + ltvCacRatio.toFixed(1) + ":1 suggests opportunity to invest more aggressively in customer acquisition while maintaining profitability");
    }

    // Payback period analysis
    if (monthsToRecoverCAC > 18) {
      tips.push("CAC payback period of " + monthsToRecoverCAC.toFixed(1) + " months is concerning. Best-in-class SaaS companies recover CAC within 12 months - optimize pricing or reduce acquisition costs");
    } else if (monthsToRecoverCAC > 12) {
      tips.push("CAC payback period of " + monthsToRecoverCAC.toFixed(1) + " months exceeds the 12-month benchmark. Accelerate payback through annual billing discounts or usage-based upsells");
    } else if (monthsToRecoverCAC <= 12) {
      tips.push("Strong CAC payback of " + monthsToRecoverCAC.toFixed(1) + " months provides good cash flow efficiency. This positions you well for sustainable growth");
    }

    // Gross margin analysis
    if (grossMarginPercent < 60) {
      tips.push("Gross margin of " + grossMarginPercent.toFixed(1) + "% is below SaaS standard (70-90%). Review infrastructure costs, hosting efficiency, and pricing to improve margins");
    } else if (grossMarginPercent >= 80) {
      tips.push("Excellent gross margin of " + grossMarginPercent.toFixed(1) + "% demonstrates scalable unit economics. Document this efficiency for investor and endorsing body presentations");
    }

    // Churn analysis
    if (annualChurnRate > 20) {
      tips.push("Annual churn rate of " + annualChurnRate.toFixed(1) + "% is high for SaaS (target: <10-15%). Invest in customer success, onboarding, and product stickiness to improve retention");
    } else if (annualChurnRate <= 10) {
      tips.push("Low churn rate of " + annualChurnRate.toFixed(1) + "% indicates strong product-market fit and customer satisfaction. Leverage this in your growth narrative");
    }

    // ARPU analysis
    if (arpu < 50) {
      tips.push("Low ARPU of £" + arpu.toFixed(0) + "/month may limit scalability. Consider value-based pricing, feature tiers, or usage-based models to increase revenue per customer");
    } else if (arpu >= 100) {
      tips.push("Healthy ARPU of £" + arpu.toFixed(0) + "/month supports strong unit economics. Document pricing strategy and willingness-to-pay research for business plan");
    }

    // Overall health
    if (healthScore >= 80) {
      tips.push("Outstanding unit economics (score: " + healthScore + "/100). These metrics strongly support your scalability and innovation narrative for visa endorsement");
    } else if (healthScore < 40) {
      tips.push("Unit economics need significant improvement (score: " + healthScore + "/100). Address CAC, retention, and margins before scaling or presenting to endorsing bodies");
    }

    // Strategic recommendations
    if (isHealthyLTVCAC && isHealthyPayback) {
      tips.push("Strong economics enable aggressive growth. Document your customer acquisition channels, conversion funnels, and retention strategies for the business plan");
    }

    if (!isProfitable) {
      tips.push("Negative unit profitability (LTV < CAC) is unsustainable. This must be addressed before visa application as endorsers require viable economic models");
    }

    // Benchmarking tip
    tips.push("Include cohort analysis in your business plan showing how unit economics improve over time as you optimize CAC and increase customer lifetime value");

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Build comprehensive cohort analysis spreadsheet tracking customer acquisition costs, retention, and revenue by monthly cohorts", priority: "Critical" },
      { week: "Week 1", action: "Document all customer acquisition channels with CAC breakdown (paid ads, content, partnerships, sales) and conversion metrics", priority: "Critical" },
      { week: "Week 1-2", action: "Analyze top 20% of customers to identify high-LTV patterns (industry, use case, company size) for targeting", priority: "High" },
      { week: "Week 2", action: "Calculate gross margin by product tier/feature set to identify most profitable offerings", priority: "High" },
      { week: "Week 2", action: "Interview churned customers to understand retention issues and create improvement roadmap", priority: "High" },
      { week: "Week 2-3", action: "Build sensitivity analysis showing how changes in pricing, CAC, or churn impact unit economics", priority: "Critical" },
      { week: "Week 3", action: "Create visual dashboard comparing your unit economics to SaaS benchmarks by stage/sector", priority: "Medium" },
      { week: "Week 3", action: "Document pricing strategy with willingness-to-pay research and competitive positioning", priority: "High" },
      { week: "Week 3-4", action: "Develop 12-month plan showing how unit economics will improve as you optimize CAC and retention", priority: "Critical" },
      { week: "Week 4", action: "Have financial advisor review unit economics model for accuracy and investor/endorser readiness", priority: "High" },
      { week: "Week 4", action: "Create case study of 2-3 successful customers demonstrating value delivery and low churn risk", priority: "Medium" },
      { week: "Ongoing", action: "Track metrics monthly: CAC by channel, MRR, churn rate, LTV cohorts, gross margin", priority: "Critical" }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - SAAS UNIT ECONOMICS ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
This unit economics analysis demonstrates the scalability and viability of our
SaaS business model for UK Innovator Founder Visa endorsement purposes.

Overall Health Score: ${healthScore}/100
Unit Profitability: ${isProfitable ? 'PROFITABLE' : 'NEEDS IMPROVEMENT'}
LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}:1 (Benchmark: 3:1+)
Payback Period: ${monthsToRecoverCAC.toFixed(1)} months (Benchmark: <12 months)

INPUT ASSUMPTIONS
${'-'.repeat(80)}
Customer Acquisition Spend: £${inputs.customerAcquisitionSpend.toLocaleString()}
Customers Acquired: ${inputs.customersAcquired.toLocaleString()}
Monthly Revenue per Customer (ARPU): £${inputs.monthlyRevenuePerCustomer.toFixed(2)}
Average Customer Lifetime: ${inputs.averageCustomerLifetimeMonths} months
Cost of Goods Sold per Customer (Monthly): £${inputs.cogsPerCustomer.toFixed(2)}

CORE UNIT ECONOMICS METRICS
${'-'.repeat(80)}

1. Customer Acquisition Cost (CAC)
   Value: £${cac.toFixed(2)}
   Calculation: Total Acquisition Spend / Customers Acquired
   Status: ${cac <= 200 ? 'EXCELLENT' : cac <= 500 ? 'GOOD' : 'NEEDS OPTIMIZATION'}
   Benchmark: <£500 for SMB SaaS, <£2,000 for Enterprise
   
2. Lifetime Value (LTV)
   Value: £${ltv.toFixed(2)}
   Calculation: Monthly Gross Margin × Average Lifetime (months)
   Status: ${ltv >= 1000 ? 'STRONG' : ltv >= 500 ? 'MODERATE' : 'IMPROVING'}
   Benchmark: >£1,000 for sustainable SaaS
   
3. LTV:CAC Ratio
   Value: ${ltvCacRatio.toFixed(2)}:1
   Status: ${isHealthyLTVCAC ? 'HEALTHY ✓' : 'NEEDS IMPROVEMENT ✗'}
   Benchmark: 3:1 (acceptable), 5:1+ (excellent)
   Implication: ${ltvCacRatio >= 3 ? 'Unit economics support scalable growth' : 'Current economics limit growth potential'}

4. CAC Payback Period
   Value: ${monthsToRecoverCAC.toFixed(1)} months
   Calculation: CAC / Monthly Gross Margin per Customer
   Status: ${isHealthyPayback ? 'HEALTHY ✓' : 'NEEDS IMPROVEMENT ✗'}
   Benchmark: <12 months (best-in-class), <18 months (acceptable)
   Cash Flow Impact: ${isHealthyPayback ? 'Positive cash flow efficiency' : 'Extended working capital requirements'}

5. Gross Margin
   Monthly Gross Margin: £${monthlyGrossMarginPerCustomer.toFixed(2)}
   Gross Margin %: ${grossMarginPercent.toFixed(1)}%
   Status: ${isHealthyGrossMargin ? 'EXCELLENT ✓' : grossMarginPercent >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT ✗'}
   Benchmark: 70-90% for SaaS
   Components:
     - Monthly Revenue (ARPU): £${inputs.monthlyRevenuePerCustomer.toFixed(2)}
     - Monthly COGS: £${inputs.cogsPerCustomer.toFixed(2)}

6. Churn Rate
   Monthly Churn: ${monthlyChurnRate.toFixed(2)}%
   Annual Churn: ${annualChurnRate.toFixed(1)}%
   Status: ${isHealthyChurn ? 'HEALTHY ✓' : 'NEEDS IMPROVEMENT ✗'}
   Benchmark: <5-10% annual for SMB, <2-5% for Enterprise
   Retention Rate: ${(100 - annualChurnRate).toFixed(1)}%
   
7. Average Revenue Per User (ARPU)
   Value: £${arpu.toFixed(2)}/month
   Annual Contract Value: £${(arpu * 12).toFixed(2)}
   Status: ${arpu >= 100 ? 'STRONG' : arpu >= 50 ? 'MODERATE' : 'LOW'}
   Benchmark: £50-200/month (SMB), £500+ (mid-market)

8. Unit Profitability
   Value: £${unitProfitability.toFixed(2)} per customer
   Calculation: LTV - CAC
   Status: ${isProfitable ? 'PROFITABLE ✓' : 'UNPROFITABLE ✗'}
   Implication: ${isProfitable ? 'Each customer generates positive lifetime profit' : 'Current model is unsustainable without optimization'}

COHORT PERFORMANCE VISUALIZATION
${'-'.repeat(80)}
Customer Value Timeline (First ${Math.min(inputs.averageCustomerLifetimeMonths, 36)} Months):

${customerValueTimeline.map(d => {
  const monthNum = parseInt(d.month.substring(1));
  const bar = monthNum === 0 ? '' : '█'.repeat(Math.max(0, Math.min(50, Math.floor(d.value / 10))));
  const status = d.value >= 0 ? '+' : '-';
  return `${d.month.padEnd(4)} ${status} £${Math.abs(d.value).toFixed(0).padStart(6)} ${bar}`;
}).join('\n')}

Breakeven Point: Month ${customerValueTimeline.findIndex(d => d.value >= 0)} (when cumulative value turns positive)

INDUSTRY BENCHMARKS COMPARISON
${'-'.repeat(80)}

Metric                          Your Value        SaaS Benchmark       Status
LTV:CAC Ratio                  ${ltvCacRatio.toFixed(1)}:1            3:1 - 5:1          ${ltvCacRatio >= 3 ? '✓ Pass' : '✗ Below'}
CAC Payback Period             ${monthsToRecoverCAC.toFixed(1)} months       <12 months         ${monthsToRecoverCAC <= 12 ? '✓ Pass' : '✗ Above'}
Gross Margin                   ${grossMarginPercent.toFixed(0)}%              70-90%             ${grossMarginPercent >= 70 ? '✓ Pass' : '◐ Fair'}
Annual Churn Rate              ${annualChurnRate.toFixed(1)}%             <10-15%            ${annualChurnRate <= 15 ? '✓ Pass' : '✗ High'}
Monthly ARPU                   £${arpu.toFixed(0)}             £50-200            ${arpu >= 50 ? '✓ Pass' : '◐ Fair'}

Overall Benchmarking Score: ${healthScore}/100

FINANCIAL IMPLICATIONS FOR SCALING
${'-'.repeat(80)}

If you acquire 100 customers per month at current unit economics:

Monthly Investment Required:
- Customer Acquisition: £${((cac * 100)).toLocaleString()}
- Initial COGS: £${(inputs.cogsPerCustomer * 100).toLocaleString()}
- Total Monthly Investment: £${((cac * 100) + (inputs.cogsPerCustomer * 100)).toLocaleString()}

Monthly Returns (after payback period):
- Gross Profit per Cohort: £${(monthlyGrossMarginPerCustomer * 100).toLocaleString()}/month
- Lifetime Value of Cohort: £${(ltv * 100).toLocaleString()}

Capital Efficiency:
- Working Capital Required: £${(cac * monthsToRecoverCAC * 100).toLocaleString()} (to fund growth before payback)
- Annual Revenue Potential (100 cust/mo): £${(arpu * 100 * 12).toLocaleString()}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN FOR OPTIMIZATION
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}
   ${item.action}`).join('\n\n')}

STRATEGIC INSIGHTS FOR VISA APPLICATION
${'-'.repeat(80)}

For UK Innovator Founder Visa Endorsement:

1. SCALABILITY NARRATIVE
   ${ltvCacRatio >= 3 
     ? '✓ Strong LTV:CAC ratio demonstrates efficient customer economics that scale profitably'
     : '✗ Current LTV:CAC ratio requires optimization before demonstrating scalability'}
   
2. MARKET OPPORTUNITY
   - With ${inputs.customersAcquired} customers acquired at £${cac.toFixed(0)} CAC
   - Path to £1M ARR requires: ${Math.ceil(1000000 / (arpu * 12))} customers
   - Total CAC investment needed: £${Math.ceil((1000000 / (arpu * 12)) * cac).toLocaleString()}
   - Time to profitability: ${monthsToRecoverCAC.toFixed(0)} months per customer cohort

3. CAPITAL EFFICIENCY
   ${isHealthyPayback 
     ? '✓ CAC payback under 12 months enables capital-efficient growth'
     : '◐ Longer payback period requires more working capital for growth'}

4. RETENTION & PRODUCT-MARKET FIT
   ${isHealthyChurn
     ? '✓ Low churn rate demonstrates strong product-market fit and customer value'
     : '✗ High churn rate indicates need for product/market improvements'}

5. COMPETITIVE POSITIONING
   Gross margin of ${grossMarginPercent.toFixed(0)}% ${grossMarginPercent >= 70 ? 'demonstrates' : 'requires improvement to demonstrate'} 
   scalable SaaS economics vs. traditional service businesses

RISK FACTORS & MITIGATION
${'-'.repeat(80)}

${!isHealthyLTVCAC ? `
RISK: Low LTV:CAC Ratio
Impact: Limits growth potential and raises concerns about sustainable unit economics
Mitigation: 
  - Reduce CAC through content marketing, SEO, and partner channels
  - Increase LTV through improved onboarding, customer success, and upsell programs
  - Test pricing increases with value-based positioning
` : ''}

${!isHealthyPayback ? `
RISK: Extended CAC Payback Period
Impact: Higher working capital requirements and cash flow pressure during growth
Mitigation:
  - Offer annual billing with discount to accelerate cash collection
  - Implement usage-based upsells to increase early revenue
  - Optimize sales cycle length and conversion rates
` : ''}

${!isHealthyGrossMargin ? `
RISK: Low Gross Margins
Impact: Limited contribution to cover fixed costs and achieve profitability
Mitigation:
  - Review infrastructure costs and optimize hosting/delivery
  - Increase prices based on value delivered to customers
  - Reduce manual service components through automation
` : ''}

${!isHealthyChurn ? `
RISK: High Customer Churn
Impact: Reduces LTV and requires continuous high-cost acquisition to maintain revenue
Mitigation:
  - Implement customer success program with health scoring
  - Improve onboarding and time-to-value
  - Add features that increase product stickiness
  - Conduct churn interviews to address root causes
` : ''}

APPENDIX: CALCULATION METHODOLOGY
${'-'.repeat(80)}

CAC (Customer Acquisition Cost):
  CAC = Total Marketing & Sales Spend / Number of Customers Acquired
  = £${inputs.customerAcquisitionSpend} / ${inputs.customersAcquired}
  = £${cac.toFixed(2)}

LTV (Lifetime Value):
  LTV = Monthly Gross Margin × Average Customer Lifetime
  Monthly Gross Margin = ARPU - Monthly COGS
  = £${inputs.monthlyRevenuePerCustomer} - £${inputs.cogsPerCustomer}
  = £${monthlyGrossMarginPerCustomer.toFixed(2)}
  
  LTV = £${monthlyGrossMarginPerCustomer.toFixed(2)} × ${inputs.averageCustomerLifetimeMonths} months
  = £${ltv.toFixed(2)}

LTV:CAC Ratio:
  Ratio = LTV / CAC
  = £${ltv.toFixed(2)} / £${cac.toFixed(2)}
  = ${ltvCacRatio.toFixed(2)}:1

CAC Payback Period:
  Months = CAC / Monthly Gross Margin
  = £${cac.toFixed(2)} / £${monthlyGrossMarginPerCustomer.toFixed(2)}
  = ${monthsToRecoverCAC.toFixed(1)} months

Churn Rate:
  Annual Churn % = (1 / Average Lifetime in Years) × 100
  = (12 / ${inputs.averageCustomerLifetimeMonths}) × 100
  = ${annualChurnRate.toFixed(1)}%
  
  Monthly Churn % = Annual Churn / 12
  = ${monthlyChurnRate.toFixed(2)}%

Gross Margin %:
  Gross Margin % = (ARPU - COGS) / ARPU × 100
  = (£${inputs.monthlyRevenuePerCustomer} - £${inputs.cogsPerCustomer}) / £${inputs.monthlyRevenuePerCustomer} × 100
  = ${grossMarginPercent.toFixed(1)}%

DATA SOURCES & VALIDATION
${'-'.repeat(80)}
- Customer acquisition data should be validated with marketing platform analytics
- Revenue figures should match payment processor or accounting system records
- COGS should include: hosting, payment processing, support costs (exclude: R&D, sales)
- Customer lifetime calculated from cohort retention curves, not individual predictions
- All metrics should be tracked monthly and trended over time

RECOMMENDATIONS FOR BUSINESS PLAN
${'-'.repeat(80)}
1. Include detailed cohort analysis showing improving unit economics over time
2. Benchmark against public SaaS companies in your sector/stage
3. Show sensitivity analysis: impact of ±20% changes in CAC, ARPU, churn
4. Document customer acquisition strategy with CAC by channel
5. Explain retention programs and expected churn rate improvements
6. Provide 3-year projections showing path to profitability at scale
7. Compare unit economics to competitors (if data available)
8. Highlight any unique advantages (viral growth, low CAC channels, high switching costs)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: Unit economics analysis is based on inputs provided and should be
validated with actual financial data. Projections are estimates and actual results
may vary. Consult with qualified financial advisors and accountants before making
business decisions or visa applications.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-economics-analysis-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-unit-economics">Unit Economics</h1>
            <p className="text-lg text-muted-foreground">SaaS subscription business metrics: CAC, LTV, churn, and profitability analysis</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="unit-economics"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Unit Economics"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-unit-economics">
              <TabsTrigger value="economics" data-testid="tab-economics">Economics</TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="economics" className="space-y-6">
              <div className="grid md:grid-cols-5 gap-4">
                <Card className={isHealthyLTVCAC ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">LTV:CAC Ratio</p>
                      <p className="text-3xl font-bold" data-testid="text-ltv-cac-ratio">
                        {ltvCacRatio.toFixed(1)}:1
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isHealthyLTVCAC ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-xs">{isHealthyLTVCAC ? 'Healthy' : 'Needs Work'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isHealthyPayback ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">CAC Payback</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-payback-period">
                        {monthsToRecoverCAC.toFixed(1)}mo
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isHealthyPayback ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-xs">{isHealthyPayback ? '<12mo' : '>12mo'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isHealthyGrossMargin ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Gross Margin</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-gross-margin">
                        {grossMarginPercent.toFixed(0)}%
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isHealthyGrossMargin ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-xs">Target: 70%+</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isHealthyChurn ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Annual Churn</p>
                      <p className="text-3xl font-bold" data-testid="text-churn-rate">
                        {annualChurnRate.toFixed(1)}%
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isHealthyChurn ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-xs">Target: &lt;15%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Health Score</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-health-score">
                        {healthScore}%
                      </p>
                      <Progress value={healthScore} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {healthScore < 60 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Unit economics health score is below 60%. Review metrics and optimize CAC, LTV, margins, or churn before scaling or presenting to endorsing bodies.
                  </AlertDescription>
                </Alert>
              )}

              {healthScore >= 80 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent unit economics! These metrics demonstrate strong scalability for your visa application. Document thoroughly in your business plan.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Unit Economics Inputs</CardTitle>
                  <CardDescription>Enter your SaaS business metrics to calculate key indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acquisition-spend">Customer Acquisition Spend (£)</Label>
                      <Input
                        id="acquisition-spend"
                        type="number"
                        value={inputs.customerAcquisitionSpend}
                        onChange={(e) => updateInput('customerAcquisitionSpend', parseFloat(e.target.value) || 0)}
                        placeholder="10000"
                        data-testid="input-acquisition-spend"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Total marketing and sales spend in period</p>
                    </div>

                    <div>
                      <Label htmlFor="customers-acquired">Customers Acquired</Label>
                      <Input
                        id="customers-acquired"
                        type="number"
                        value={inputs.customersAcquired}
                        onChange={(e) => updateInput('customersAcquired', parseFloat(e.target.value) || 0)}
                        placeholder="50"
                        data-testid="input-customers-acquired"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Number of new paying customers</p>
                    </div>

                    <div>
                      <Label htmlFor="monthly-revenue">Monthly Revenue per Customer (£)</Label>
                      <Input
                        id="monthly-revenue"
                        type="number"
                        value={inputs.monthlyRevenuePerCustomer}
                        onChange={(e) => updateInput('monthlyRevenuePerCustomer', parseFloat(e.target.value) || 0)}
                        placeholder="99"
                        data-testid="input-monthly-revenue"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Average monthly subscription price (ARPU)</p>
                    </div>

                    <div>
                      <Label htmlFor="customer-lifetime">Average Customer Lifetime (months)</Label>
                      <Input
                        id="customer-lifetime"
                        type="number"
                        value={inputs.averageCustomerLifetimeMonths}
                        onChange={(e) => updateInput('averageCustomerLifetimeMonths', parseFloat(e.target.value) || 0)}
                        placeholder="24"
                        data-testid="input-customer-lifetime"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How long customers stay subscribed on average</p>
                    </div>

                    <div>
                      <Label htmlFor="cogs">Cost of Goods Sold per Customer (£/month)</Label>
                      <Input
                        id="cogs"
                        type="number"
                        value={inputs.cogsPerCustomer}
                        onChange={(e) => updateInput('cogsPerCustomer', parseFloat(e.target.value) || 0)}
                        placeholder="30"
                        data-testid="input-cogs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Monthly hosting, support, delivery costs per customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">CAC</span>
                        <span className="text-lg font-semibold" data-testid="text-cac">£{cac.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">LTV</span>
                        <span className="text-lg font-semibold text-green-600" data-testid="text-ltv">£{ltv.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Unit Profit</span>
                        <span className={`text-lg font-bold ${isProfitable ? 'text-green-600' : 'text-destructive'}`} data-testid="text-unit-profit">
                          £{unitProfitability.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">ARPU</span>
                        <span className="text-lg font-semibold" data-testid="text-arpu">£{arpu.toFixed(2)}/mo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Gross Margin</span>
                        <span className="text-lg font-semibold text-green-600">£{monthlyGrossMarginPerCustomer.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium">Monthly Churn</span>
                        <span className="text-lg font-bold">{monthlyChurnRate.toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      CAC vs LTV Comparison
                    </CardTitle>
                    <CardDescription>Customer acquisition cost vs lifetime value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cacLtvComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="value">
                          {cacLtvComparison.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Ideal ratio: LTV should be 3-5x higher than CAC
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Revenue Breakdown
                    </CardTitle>
                    <CardDescription>Lifetime value composition per customer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {revenueBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={revenueBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {revenueBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Configure inputs to see breakdown</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Value Timeline</CardTitle>
                  <CardDescription>Cumulative value per customer from acquisition through lifetime</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={customerValueTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Cumulative Value"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="breakeven" 
                        stroke="#6b7280" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="Breakeven"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Initial Investment</p>
                      <p className="text-lg font-semibold text-destructive">-£{cac.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Contribution</p>
                      <p className="text-lg font-semibold text-green-600">+£{monthlyGrossMarginPerCustomer.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lifetime Profit</p>
                      <p className={`text-lg font-semibold ${isProfitable ? 'text-green-600' : 'text-destructive'}`}>
                        £{unitProfitability.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SaaS Industry Benchmarks</CardTitle>
                  <CardDescription>Compare your metrics against industry standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">LTV:CAC Ratio</p>
                        <p className="text-sm text-muted-foreground">Your ratio: {ltvCacRatio.toFixed(1)}:1</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Benchmark: 3:1 to 5:1</p>
                        <p className="text-xs text-muted-foreground">Best-in-class SaaS</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">CAC Payback Period</p>
                        <p className="text-sm text-muted-foreground">Your payback: {monthsToRecoverCAC.toFixed(1)} months</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Benchmark: &lt;12 months</p>
                        <p className="text-xs text-muted-foreground">Efficient SaaS</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Gross Margin</p>
                        <p className="text-sm text-muted-foreground">Your margin: {grossMarginPercent.toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Benchmark: 70-90%</p>
                        <p className="text-xs text-muted-foreground">SaaS standard</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Annual Churn Rate</p>
                        <p className="text-sm text-muted-foreground">Your churn: {annualChurnRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Benchmark: &lt;10-15%</p>
                        <p className="text-xs text-muted-foreground">SMB SaaS target</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Monthly ARPU</p>
                        <p className="text-sm text-muted-foreground">Your ARPU: £{arpu.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Benchmark: £50-£200</p>
                        <p className="text-xs text-muted-foreground">SMB SaaS range</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Context-aware insights to improve your unit economics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50" data-testid={`tip-${index}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                  <CardDescription>Quick reference for your unit economics health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">LTV:CAC Ratio</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ltvCacRatio.toFixed(1)}:1</span>
                          {isHealthyLTVCAC ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CAC Payback</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{monthsToRecoverCAC.toFixed(1)}mo</span>
                          {isHealthyPayback ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gross Margin</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{grossMarginPercent.toFixed(0)}%</span>
                          {isHealthyGrossMargin ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Annual Churn</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{annualChurnRate.toFixed(1)}%</span>
                          {isHealthyChurn ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Unit Profitability</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">£{unitProfitability.toFixed(0)}</span>
                          {isProfitable ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Health</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{healthScore}%</span>
                          {healthScore >= 80 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : healthScore >= 60 ? (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Strategic roadmap to optimize and document your unit economics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg border"
                        data-testid={`action-${index}`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' : ''}
                            ${item.priority === 'High' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : ''}
                            ${item.priority === 'Medium' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
                          `}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{item.week}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Checklist for Visa Application</CardTitle>
                  <CardDescription>Essential unit economics evidence for endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Cohort Analysis Spreadsheet</p>
                        <p className="text-sm text-muted-foreground">Monthly customer cohorts showing acquisition cost, retention, and revenue progression</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">CAC Breakdown by Channel</p>
                        <p className="text-sm text-muted-foreground">Detailed customer acquisition cost for each marketing/sales channel with conversion metrics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Revenue Analytics Dashboard</p>
                        <p className="text-sm text-muted-foreground">MRR, ARPU, expansion revenue, and churn trends from payment processor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Gross Margin Analysis</p>
                        <p className="text-sm text-muted-foreground">COGS breakdown including hosting, support, payment processing costs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Benchmark Comparison</p>
                        <p className="text-sm text-muted-foreground">Your metrics vs industry standards (public SaaS companies, sector reports)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Sensitivity Analysis</p>
                        <p className="text-sm text-muted-foreground">Impact of ±20% changes in CAC, ARPU, churn on profitability and scale</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Customer Evidence</p>
                        <p className="text-sm text-muted-foreground">Case studies demonstrating value delivery, retention reasons, and expansion patterns</p>
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
