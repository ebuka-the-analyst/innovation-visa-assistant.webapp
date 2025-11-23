import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
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

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Healthy CAC/LTV ratio demonstrates business sustainability
// Scalability Criterion: Efficient customer acquisition enables growth

export default function CACCalculator() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [marketingSpend, setMarketingSpend] = useState(50000);
  const [salesSpend, setSalesSpend] = useState(30000);
  const [newCustomers, setNewCustomers] = useState(100);
  const [avgRevenue, setAvgRevenue] = useState(5000);
  const [churnRate, setChurnRate] = useState(5);
  const [grossMargin, setGrossMargin] = useState(75);

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
    
    const content = `UK INNOVATOR FOUNDER VISA - CUSTOMER ACQUISITION COST (CAC)
Generated: ${new Date().toLocaleDateString()}

Unit Economics Health: ${score}% (${grade})

KEY METRICS:
Customer Acquisition Cost (CAC): £${cac.toFixed(2)}
Customer Lifetime Value (LTV): £${ltv.toFixed(2)}
LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}x
Payback Period: ${paybackMonths.toFixed(1)} months

INPUTS:
Marketing Spend: £${marketingSpend.toLocaleString()}
Sales Spend: £${salesSpend.toLocaleString()}
New Customers Acquired: ${newCustomers}
Average Revenue per Customer: £${avgRevenue.toLocaleString()}
Monthly Churn Rate: ${churnRate}%
Gross Margin: ${grossMargin}%

INNOVATOR FOUNDER VISA CONTEXT:
Viability: ${ltvCacRatio >= 3 ? `Strong LTV:CAC ratio (${ltvCacRatio.toFixed(1)}x) demonstrates business viability` : ltvCacRatio >= 1 ? 'Unit economics viable but need improvement' : 'CAC exceeds LTV - viability concern'}
Scalability: ${paybackMonths <= 12 ? `Fast payback (${paybackMonths.toFixed(0)} months) enables efficient scaling` : 'Long payback period may limit scaling speed'}
${score >= 70 ? '✅ Healthy unit economics support visa criteria' : '⚠️ Unit economics need optimization for visa assessment'}

FORMULAS:
CAC = (Marketing Spend + Sales Spend) / New Customers
LTV = (Avg Revenue × Gross Margin) / (Monthly Churn Rate)
LTV:CAC Ratio = LTV / CAC
Payback Period = CAC / (Monthly Gross Profit per Customer)

Benchmarks: LTV:CAC >3x ideal, Payback <12 months ideal
GOV.UK: Innovator Founder Visa viability criterion (November 2025)
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

  const { cac, ltv, ltvCacRatio, paybackMonths } = getMetrics();
  const { score: healthScore, grade } = getUnitEconomicsHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#8b5cf6'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Customer Acquisition Cost (CAC)</h1>
          <p className="text-muted-foreground mb-6">Analyze unit economics for viability (Innovator Founder Visa)</p>

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
        </div>
      </div>
    </>
  );
}
