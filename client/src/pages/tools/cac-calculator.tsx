import { Card } from "@/components/ui/card";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { DollarSign, Users, TrendingUp, AlertCircle, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'cac-calculator',
  toolName: 'Customer Acquisition Cost Calculator',
  agent: 'sterling',
  greeting: "Hi! I'm Sterling, your Financial Analyst. Understanding your Customer Acquisition Cost (CAC) and Lifetime Value (LTV) is essential for demonstrating business viability. Endorsers want to see healthy unit economics. Let's analyze your customer acquisition strategy!",
  questions: [
    {
      id: 'marketing-spend',
      question: "What's your total marketing spend for customer acquisition? Break down your channels and investments.",
      hint: "Include digital ads, content marketing, events, PR, and any paid acquisition channels",
      fieldKey: 'marketing_spend_description',
      minLength: 80
    },
    {
      id: 'sales-spend',
      question: "What's your total sales spend? Include sales team costs, tools, and outbound activities.",
      hint: "Salaries, commissions, CRM tools, travel, and any direct sales expenses",
      fieldKey: 'sales_spend_description',
      minLength: 60
    },
    {
      id: 'customer-acquisition',
      question: "How many new customers do you acquire monthly? Describe your typical conversion funnel.",
      hint: "Be specific about sources, conversion rates, and what defines a 'customer'",
      fieldKey: 'customer_acquisition_description',
      minLength: 80
    },
    {
      id: 'customer-value',
      question: "What's your average customer value? Describe typical spending patterns and contract length.",
      hint: "Annual contract value, monthly recurring revenue, or average order value",
      fieldKey: 'customer_value_description',
      minLength: 60
    },
    {
      id: 'retention-metrics',
      question: "What's your customer retention like? Describe your churn rate and retention strategies.",
      hint: "Monthly churn percentage, reasons for churn, and what you're doing to improve retention",
      fieldKey: 'retention_metrics_description',
      minLength: 80
    },
    {
      id: 'ltv-improvement',
      question: "How do you plan to improve your LTV:CAC ratio over time? What optimizations are planned?",
      hint: "Reduce acquisition costs, improve retention, increase ARPU, or expand product offerings",
      fieldKey: 'ltv_improvement_plan',
      minLength: 100
    }
  ],
  completionMessage: "Excellent analysis! You've demonstrated clear understanding of your unit economics. A healthy LTV:CAC ratio (3x+) is exactly what endorsers want to see for viability. I'm now calculating your acquisition metrics."
};

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Healthy CAC/LTV ratio demonstrates business sustainability
// Scalability Criterion: Efficient customer acquisition enables growth

export default function CACCalculator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('cac-calculator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [marketingSpend, setMarketingSpend] = useState(50000);
  const [salesSpend, setSalesSpend] = useState(30000);
  const [newCustomers, setNewCustomers] = useState(100);
  const [avgRevenue, setAvgRevenue] = useState(5000);
  const [churnRate, setChurnRate] = useState(5);
  const [grossMargin, setGrossMargin] = useState(75);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('cac-calculator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const saveProgress = () => {
    localStorage.setItem('cacCalculatorFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('cacCalculatorData', JSON.stringify({ marketingSpend, salesSpend, newCustomers, avgRevenue, churnRate, grossMargin }));
    localStorage.setItem('cacCalculatorDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getMetrics = () => {
    const cac = (marketingSpend + salesSpend) / (newCustomers || 1);
    const ltv = (avgRevenue * (grossMargin / 100)) / ((churnRate / 100) / 12 || 0.01);
    const ltvCacRatio = ltv / cac;
    const paybackMonths = cac / ((avgRevenue * (grossMargin / 100)) || 1);
    
    return { cac, ltv, ltvCacRatio, paybackMonths };
  };

  const getUnitEconomicsHealth = (): { score: number; grade: string } => {
    const { ltvCacRatio, paybackMonths } = getMetrics();
    let score = 0;
    
    if (ltvCacRatio >= 3) score += 50;
    else if (ltvCacRatio >= 2) score += 35;
    else if (ltvCacRatio >= 1) score += 15;
    
    if (paybackMonths <= 12) score += 50;
    else if (paybackMonths <= 18) score += 35;
    else if (paybackMonths <= 24) score += 15;
    
    let grade = 'F - Unsustainable';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Healthy';
    else if (score >= 50) grade = 'C - Viable';
    else if (score >= 30) grade = 'D - Weak';
    
    return { score, grade };
  };

  const exportReport = () => {
    const { cac, ltv, ltvCacRatio, paybackMonths } = getMetrics();
    const { score, grade } = getUnitEconomicsHealth();
    const monthlyGrossProfit = (avgRevenue * (grossMargin / 100));
    
    const content = `UK INNOVATOR FOUNDER VISA - CUSTOMER ACQUISITION COST (CAC) ANALYSIS
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Unit Economics Health Score: ${score}% (${grade})

Key Metrics:
  Customer Acquisition Cost (CAC): £${cac.toFixed(2)}
  Customer Lifetime Value (LTV): £${ltv.toFixed(2)}
  LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}x ${ltvCacRatio >= 3 ? '✓ EXCELLENT' : ltvCacRatio >= 2 ? '✓ GOOD' : ltvCacRatio >= 1 ? '⚠ VIABLE' : '✗ UNSUSTAINABLE'}
  Payback Period: ${paybackMonths.toFixed(1)} months ${paybackMonths <= 12 ? '✓ FAST' : paybackMonths <= 18 ? '⚠ MODERATE' : '✗ SLOW'}

${score >= 70 ? '✓ HEALTHY UNIT ECONOMICS - Supports viability criterion for UK Innovator Founder visa' : score >= 50 ? '⚠ VIABLE BUT NEEDS IMPROVEMENT' : '✗ UNSUSTAINABLE - Critical improvements needed'}

═══════════════════════════════════════════════════════════
INPUT PARAMETERS
═══════════════════════════════════════════════════════════
Acquisition Costs:
  Marketing Spend: £${marketingSpend.toLocaleString()}
  Sales Spend: £${salesSpend.toLocaleString()}
  Total Acquisition Investment: £${(marketingSpend + salesSpend).toLocaleString()}

Customer Metrics:
  New Customers Acquired: ${newCustomers}
  Average Revenue per Customer (Annual): £${avgRevenue.toLocaleString()}
  Monthly Churn Rate: ${churnRate}%
  Gross Margin: ${grossMargin}%

═══════════════════════════════════════════════════════════
CAC CALCULATION (Customer Acquisition Cost)
═══════════════════════════════════════════════════════════
Formula: CAC = (Marketing Spend + Sales Spend) / New Customers

Step-by-Step Calculation:
  Marketing Spend: £${marketingSpend.toLocaleString()}
  Sales Spend: £${salesSpend.toLocaleString()}
  ────────────────────────────
  Total Acquisition Cost: £${(marketingSpend + salesSpend).toLocaleString()}
  
  New Customers: ${newCustomers}
  
  CAC = £${(marketingSpend + salesSpend).toLocaleString()} ÷ ${newCustomers}
  CAC = £${cac.toFixed(2)}

Benchmark Analysis:
${cac <= 500 ? '✓ CAC £' + cac.toFixed(2) + ' is efficient (under £500 per customer)' : 
  cac <= 1000 ? '⚠ CAC £' + cac.toFixed(2) + ' is moderate (£500-£1,000 range)' : 
  '✗ CAC £' + cac.toFixed(2) + ' is high (over £1,000) - optimize acquisition channels'}

═══════════════════════════════════════════════════════════
LTV CALCULATION (Customer Lifetime Value)
═══════════════════════════════════════════════════════════
Formula: LTV = (Average Revenue × Gross Margin) / Monthly Churn Rate

Step-by-Step Calculation:
  Average Annual Revenue per Customer: £${avgRevenue.toLocaleString()}
  Gross Margin: ${grossMargin}%
  
  Annual Gross Profit = £${avgRevenue.toLocaleString()} × ${grossMargin}%
  Annual Gross Profit = £${(avgRevenue * (grossMargin / 100)).toFixed(2)}
  
  Monthly Gross Profit = £${(avgRevenue * (grossMargin / 100)).toFixed(2)} ÷ 12
  Monthly Gross Profit = £${monthlyGrossProfit.toFixed(2)}
  
  Monthly Churn Rate: ${churnRate}%
  
  LTV = £${monthlyGrossProfit.toFixed(2)} ÷ ${churnRate}%
  LTV = £${monthlyGrossProfit.toFixed(2)} ÷ ${(churnRate / 100).toFixed(3)}
  LTV = £${ltv.toFixed(2)}

Benchmark Analysis:
${ltv >= cac * 3 ? '✓ LTV £' + ltv.toFixed(2) + ' is healthy (>3x CAC)' : 
  ltv >= cac * 2 ? '⚠ LTV £' + ltv.toFixed(2) + ' is acceptable (2-3x CAC) - optimize retention' : 
  ltv >= cac ? '⚠ LTV £' + ltv.toFixed(2) + ' is marginal (<2x CAC) - critical to improve' :
  '✗ LTV £' + ltv.toFixed(2) + ' < CAC - business model unsustainable'}

═══════════════════════════════════════════════════════════
LTV:CAC RATIO ANALYSIS
═══════════════════════════════════════════════════════════
Formula: LTV:CAC Ratio = LTV / CAC

Calculation:
  LTV: £${ltv.toFixed(2)}
  CAC: £${cac.toFixed(2)}
  
  LTV:CAC Ratio = £${ltv.toFixed(2)} ÷ £${cac.toFixed(2)}
  LTV:CAC Ratio = ${ltvCacRatio.toFixed(2)}x

Industry Benchmarks:
  >3.0x = Excellent unit economics
  2.0-3.0x = Good unit economics
  1.0-2.0x = Viable but needs improvement
  <1.0x = Unsustainable (CAC exceeds LTV)

Your Ratio: ${ltvCacRatio.toFixed(2)}x
${ltvCacRatio >= 3 ? '✓ EXCELLENT - Each customer generates 3x+ their acquisition cost' :
  ltvCacRatio >= 2 ? '✓ GOOD - Healthy return on acquisition investment' :
  ltvCacRatio >= 1 ? '⚠ VIABLE - But needs optimization to reach 3x benchmark' :
  '✗ UNSUSTAINABLE - Losing money on each customer acquired'}

═══════════════════════════════════════════════════════════
PAYBACK PERIOD CALCULATION
═══════════════════════════════════════════════════════════
Formula: Payback Period (Months) = CAC / Monthly Gross Profit

Calculation:
  CAC: £${cac.toFixed(2)}
  Monthly Gross Profit per Customer: £${monthlyGrossProfit.toFixed(2)}
  
  Payback Period = £${cac.toFixed(2)} ÷ £${monthlyGrossProfit.toFixed(2)}
  Payback Period = ${paybackMonths.toFixed(1)} months

Industry Benchmarks:
  ≤12 months = Fast payback (ideal for scaling)
  12-18 months = Moderate payback (acceptable)
  18-24 months = Slow payback (limits cash flow)
  >24 months = Very slow (challenges scalability)

Your Payback: ${paybackMonths.toFixed(1)} months
${paybackMonths <= 12 ? '✓ FAST PAYBACK - Enables efficient capital recycling for growth' :
  paybackMonths <= 18 ? '⚠ MODERATE PAYBACK - Acceptable but consider reducing CAC or increasing ARPU' :
  paybackMonths <= 24 ? '⚠ SLOW PAYBACK - May limit scaling speed and cash flow' :
  '✗ VERY SLOW PAYBACK - Critical challenge for business viability and scalability'}

═══════════════════════════════════════════════════════════
UNIT ECONOMICS HEALTH SCORE
═══════════════════════════════════════════════════════════
Formula: Score = LTV:CAC Component (50pts) + Payback Component (50pts)

Component 1: LTV:CAC Ratio Assessment
  Your Ratio: ${ltvCacRatio.toFixed(2)}x
  ${ltvCacRatio >= 3 ? '50/50 points (Ratio ≥3x)' :
    ltvCacRatio >= 2 ? '35/50 points (Ratio 2-3x)' :
    ltvCacRatio >= 1 ? '15/50 points (Ratio 1-2x)' :
    '0/50 points (Ratio <1x)'}

Component 2: Payback Period Assessment
  Your Payback: ${paybackMonths.toFixed(1)} months
  ${paybackMonths <= 12 ? '50/50 points (Payback ≤12 months)' :
    paybackMonths <= 18 ? '35/50 points (Payback 12-18 months)' :
    paybackMonths <= 24 ? '15/50 points (Payback 18-24 months)' :
    '0/50 points (Payback >24 months)'}

Final Score: ${score}/100 (${grade})

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: VIABILITY CRITERION
═══════════════════════════════════════════════════════════
GOV.UK Viability Assessment Factors:
• Sustainable unit economics (LTV must exceed CAC)
• Realistic customer acquisition strategy
• Evidence of repeatable sales process
• Profitable path to growth
• Financial model demonstrates business sustainability

CURRENT UNIT ECONOMICS STATUS:
LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}x
  ${ltvCacRatio >= 3 ? '✓ EXCELLENT - Strong unit economics clearly demonstrate business viability for UK Innovator Founder visa' :
    ltvCacRatio >= 2 ? '✓ GOOD - Healthy economics support viability criterion' :
    ltvCacRatio >= 1 ? '⚠ VIABLE - But needs improvement to reach 3x benchmark for strong endorsement case' :
    '✗ UNSUSTAINABLE - CAC exceeds LTV, critical viability concern for visa application'}

Payback Period: ${paybackMonths.toFixed(1)} months
  ${paybackMonths <= 12 ? '✓ FAST - Supports efficient scaling and capital recycling' :
    paybackMonths <= 18 ? '⚠ MODERATE - Acceptable but slows growth velocity' :
    '✗ SLOW - Long payback restricts cash flow and limits scalability potential'}

Overall Health: ${score}%
  ${score >= 70 ? '✓ STRONG UNIT ECONOMICS - Demonstrates clear path to profitability and business viability' :
    score >= 50 ? '⚠ VIABLE - But needs optimization in acquisition efficiency or retention' :
    '✗ WEAK ECONOMICS - Requires fundamental improvements to demonstrate viability'}

Visa Criterion Alignment:
${score >= 70 && ltvCacRatio >= 2 ? '✓ Unit economics analysis demonstrates strong business viability for UK Innovator Founder visa endorsement. The ${ltvCacRatio.toFixed(1)}x LTV:CAC ratio and ${paybackMonths.toFixed(0)}-month payback show sustainable customer acquisition model.' :
  score >= 50 ? '⚠ Unit economics are viable but strengthening LTV:CAC ratio (aim for 3x+) and reducing payback period (aim for <12 months) would improve endorsement prospects.' :
  '✗ Unit economics show viability concerns - focus on reducing CAC through more efficient channels OR increasing LTV through better retention/upsells before visa application.'}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Viability Criterion: Sustainable business model with realistic financials
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
CAC/LTV Methodology: SaaS metrics, unit economics framework
Industry Benchmarks: LTV:CAC >3x, Payback <12 months (David Skok, SaaS Metrics)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-cac-analysis.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    const { cac, ltv, ltvCacRatio, paybackMonths } = getMetrics();
    
    if (ltvCacRatio < 1) tips.push("🚨 LTV < CAC - business model unsustainable, critical for viability criterion");
    else if (ltvCacRatio < 3) tips.push("⚠️ LTV:CAC ratio below 3x benchmark - optimize acquisition or increase LTV");
    
    if (paybackMonths > 24) tips.push("🚨 Payback period >24 months - limits cash flow and scalability");
    else if (paybackMonths > 12) tips.push("📊 Payback period >12 months - consider reducing CAC or increasing ARPU");
    
    if (churnRate > 10) tips.push("⚠️ High churn rate (>10%) - prioritize retention to improve LTV");
    
    const { score } = getUnitEconomicsHealth();
    if (score >= 80) tips.push("✅ Strong unit economics support business viability for visa assessment");
    
    return tips.length ? tips : ["✅ Unit economics are healthy"];
  };

  const getCACBreakdown = () => [
    { category: "Marketing", spend: marketingSpend },
    { category: "Sales", spend: salesSpend }
  ];

  const getLTVCACTrend = () => {
    const months = [1, 3, 6, 12, 18, 24];
    return months.map(month => {
      const { cac, ltv } = getMetrics();
      return {
        month: `M${month}`,
        ltv: ltv,
        cac: cac,
        target: cac * 3
      };
    });
  };

  const getPaybackProjection = () => {
    const months = Array.from({ length: 24 }, (_, i) => i + 1);
    const monthlyProfit = (avgRevenue * (grossMargin / 100));
    return months.map(month => ({
      month,
      revenue: monthlyProfit * month,
      cac: (marketingSpend + salesSpend) / (newCustomers || 1),
      breakeven: (marketingSpend + salesSpend) / (newCustomers || 1)
    }));
  };

  const getMetricsComparison = () => {
    const { cac, ltv, ltvCacRatio } = getMetrics();
    return [
      { metric: "CAC", actual: Math.round(cac), benchmark: 1000 },
      { metric: "LTV", actual: Math.round(ltv), benchmark: 3000 },
      { metric: "LTV:CAC", actual: Math.round(ltvCacRatio), benchmark: 3 }
    ];
  };

  useEffect(() => {
    localStorage.setItem('cac-calculator-mode', mode);
  }, [mode]);

  useEffect(() => {
    const s = localStorage.getItem('cacCalculatorData');
    if (s) {
      const data = JSON.parse(s);
      setMarketingSpend(data.marketingSpend || 50000);
      setSalesSpend(data.salesSpend || 30000);
      setNewCustomers(data.newCustomers || 100);
      setAvgRevenue(data.avgRevenue || 5000);
      setChurnRate(data.churnRate || 5);
      setGrossMargin(data.grossMargin || 75);
    }
    const f = localStorage.getItem('cacCalculatorFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('cacCalculatorDate');
    if (d) setSavedDate(d);
  }, []);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.marketing_spend_description) {
      const spendMatch = answers.marketing_spend_description.match(/(\d+[\d,]*)/);
      if (spendMatch) {
        setMarketingSpend(parseInt(spendMatch[1].replace(/,/g, '')) || 50000);
      }
    }
    if (answers.sales_spend_description) {
      const salesMatch = answers.sales_spend_description.match(/(\d+[\d,]*)/);
      if (salesMatch) {
        setSalesSpend(parseInt(salesMatch[1].replace(/,/g, '')) || 30000);
      }
    }
    if (answers.customer_acquisition_description) {
      const customersMatch = answers.customer_acquisition_description.match(/(\d+)/);
      if (customersMatch) {
        setNewCustomers(parseInt(customersMatch[1]) || 100);
      }
    }
    if (answers.customer_value_description) {
      const valueMatch = answers.customer_value_description.match(/(\d+[\d,]*)/);
      if (valueMatch) {
        setAvgRevenue(parseInt(valueMatch[1].replace(/,/g, '')) || 5000);
      }
    }
    if (answers.retention_metrics_description) {
      const churnMatch = answers.retention_metrics_description.match(/(\d+)/);
      if (churnMatch) {
        setChurnRate(parseInt(churnMatch[1]) || 5);
      }
    }
    setMode('traditional');
  };

  const { cac, ltv, ltvCacRatio, paybackMonths } = getMetrics();
  const { score: healthScore, grade } = getUnitEconomicsHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#8b5cf6'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Customer Acquisition Cost (CAC)</h1>
              <p className="text-muted-foreground">Analyze unit economics for viability (Innovator Founder Visa)</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar toolId="cac-calculator" toolName="CAC Calculator" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, marketingSpend, salesSpend, newCustomers, avgRevenue, churnRate, grossMargin, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Unit Economics</span>
              </div>
              <p className="text-3xl font-bold">{healthScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">CAC</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(cac)}</p>
              <p className="text-xs text-muted-foreground mt-1">Per customer</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">LTV:CAC Ratio</span>
              </div>
              <p className="text-3xl font-bold">{ltvCacRatio.toFixed(1)}x</p>
              <p className="text-xs text-muted-foreground mt-1">Target: 3x</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Payback</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(paybackMonths)}mo</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {'<'}12mo</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">CAC Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getCACBreakdown()} dataKey="spend" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(entry) => `£${(entry.spend / 1000).toFixed(0)}k`}>
                    {getCACBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">LTV vs CAC Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getLTVCACTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: '£', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="ltv" stroke="#10b981" strokeWidth={2} name="LTV" />
                  <Line type="monotone" dataKey="cac" stroke="#ef4444" strokeWidth={2} name="CAC" />
                  <Line type="monotone" dataKey="target" stroke="#ffa536" strokeWidth={2} strokeDasharray="5 5" name="Target (3x CAC)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Payback Period</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getPaybackProjection().slice(0, 24)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: '£', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Cumulative Revenue" />
                  <Line type="monotone" dataKey="breakeven" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Breakeven Point" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Benchmark Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMetricsComparison()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actual" fill="#ffa536" name="Your Metrics" />
                  <Bar dataKey="benchmark" fill="#10b981" fillOpacity={0.3} name="Industry Benchmark" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isCritical = tip.includes('🚨');
                const isWarning = tip.includes('⚠️');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Input Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Marketing Spend (£)</label>
                <Input type="number" value={marketingSpend} onChange={(e) => setMarketingSpend(Number(e.target.value))} data-testid="input-marketing" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Sales Spend (£)</label>
                <Input type="number" value={salesSpend} onChange={(e) => setSalesSpend(Number(e.target.value))} data-testid="input-sales" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">New Customers Acquired</label>
                <Input type="number" value={newCustomers} onChange={(e) => setNewCustomers(Number(e.target.value))} data-testid="input-customers" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Average Revenue per Customer (£)</label>
                <Input type="number" value={avgRevenue} onChange={(e) => setAvgRevenue(Number(e.target.value))} data-testid="input-revenue" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Monthly Churn Rate: {churnRate}%</label>
                <Slider value={[churnRate]} onValueChange={(v) => setChurnRate(v[0])} max={30} step={1} data-testid="slider-churn" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Gross Margin: {grossMargin}%</label>
                <Slider value={[grossMargin]} onValueChange={(v) => setGrossMargin(v[0])} max={100} step={5} data-testid="slider-margin" />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Financial Data</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
          </>
          )}
        </div>
      </div>
    </>
  );
}
