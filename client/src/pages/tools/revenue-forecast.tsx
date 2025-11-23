import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, AlertCircle, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Revenue growth demonstrates business sustainability

export default function RevenueForecast() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [currentRevenue, setCurrentRevenue] = useState(100000);
  const [growthRate, setGrowthRate] = useState(30);
  const [customers, setCustomers] = useState(50);
  const [arpu, setArpu] = useState(2000);

  const saveProgress = () => {
    localStorage.setItem('revenueForecastFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('revenueForecastData', JSON.stringify({ currentRevenue, growthRate, customers, arpu }));
    localStorage.setItem('revenueForecastDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getProjections = () => {
    const months = 36;
    const monthlyGrowth = Math.pow(1 + growthRate / 100, 1 / 12) - 1;
    return Array.from({ length: months + 1 }, (_, i) => {
      const revenue = currentRevenue * Math.pow(1 + monthlyGrowth, i);
      return {
        month: i,
        revenue: Math.round(revenue),
        customers: Math.round(customers * Math.pow(1 + monthlyGrowth, i)),
        year: `M${i}`
      };
    });
  };

  const getYearlyProjections = () => {
    const years = [0, 1, 2, 3];
    return years.map(year => {
      const revenue = currentRevenue * Math.pow(1 + growthRate / 100, year);
      return {
        year: year === 0 ? 'Current' : `Year ${year}`,
        revenue: Math.round(revenue / 1000),
        target: Math.round((currentRevenue * 2 * year) / 1000) || currentRevenue / 1000
      };
    });
  };

  const getGrowthHealth = (): { score: number; grade: string } => {
    let score = 0;
    if (growthRate >= 50) score += 50;
    else if (growthRate >= 30) score += 40;
    else if (growthRate >= 20) score += 25;
    else score += 10;

    const year3Revenue = currentRevenue * Math.pow(1 + growthRate / 100, 3);
    if (year3Revenue >= 1000000) score += 50;
    else if (year3Revenue >= 500000) score += 35;
    else score += 15;

    let grade = 'F - Poor';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Strong';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Weak';

    return { score, grade };
  };

  const exportReport = () => {
    const projections = getProjections();
    const year1 = projections[12];
    const year2 = projections[24];
    const year3 = projections[36];
    const { score, grade } = getGrowthHealth();
    const totalRevenue3Years = projections.slice(0, 37).reduce((sum, p) => sum + p.revenue, 0);

    const content = `UK INNOVATOR FOUNDER VISA - REVENUE FORECAST (3-YEAR)
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Revenue Growth Health Score: ${score}% (${grade})
Annual Growth Rate (CAGR): ${growthRate}%

Current Revenue: £${currentRevenue.toLocaleString()}
Year 3 Projection: £${year3.revenue.toLocaleString()}
3-Year Total Revenue: £${totalRevenue3Years.toLocaleString()}
Revenue Multiple: ${(year3.revenue / currentRevenue).toFixed(1)}x

${score >= 70 ? '✓ STRONG REVENUE GROWTH - Supports viability and scalability criteria for UK Innovator Founder visa' : score >= 55 ? '⚠ MODERATE GROWTH - Strengthen for endorsement' : '✗ WEAK GROWTH - Critical improvements needed'}

═══════════════════════════════════════════════════════════
CURRENT STATE (BASELINE)
═══════════════════════════════════════════════════════════
Monthly Recurring Revenue (MRR): £${(currentRevenue / 12).toFixed(2).toLocaleString()}
Annual Recurring Revenue (ARR): £${currentRevenue.toLocaleString()}
Customer Base: ${customers} customers
Average Revenue Per User (ARPU): £${arpu.toLocaleString()} per customer per year
Monthly ARPU: £${(arpu / 12).toFixed(2).toLocaleString()}

═══════════════════════════════════════════════════════════
3-YEAR REVENUE PROJECTION
═══════════════════════════════════════════════════════════
Formula: Future Revenue = Current Revenue × (1 + Growth Rate)^Years
Growth Rate: ${growthRate}% CAGR

YEAR 1 PROJECTION (Month 12):
  Calculation: £${currentRevenue.toLocaleString()} × (1 + ${growthRate}%)¹
  Calculation: £${currentRevenue.toLocaleString()} × ${(1 + growthRate / 100).toFixed(3)}
  Year 1 Revenue: £${year1.revenue.toLocaleString()}
  Year 1 Customers: ${year1.customers}
  YoY Growth: £${(year1.revenue - currentRevenue).toLocaleString()} (+${growthRate}%)

YEAR 2 PROJECTION (Month 24):
  Calculation: £${currentRevenue.toLocaleString()} × (1 + ${growthRate}%)²
  Calculation: £${currentRevenue.toLocaleString()} × ${Math.pow(1 + growthRate / 100, 2).toFixed(3)}
  Year 2 Revenue: £${year2.revenue.toLocaleString()}
  Year 2 Customers: ${year2.customers}
  YoY Growth: £${(year2.revenue - year1.revenue).toLocaleString()} (+${growthRate}%)

YEAR 3 PROJECTION (Month 36 - End of Visa Period):
  Calculation: £${currentRevenue.toLocaleString()} × (1 + ${growthRate}%)³
  Calculation: £${currentRevenue.toLocaleString()} × ${Math.pow(1 + growthRate / 100, 3).toFixed(3)}
  Year 3 Revenue: £${year3.revenue.toLocaleString()}
  Year 3 Customers: ${year3.customers}
  YoY Growth: £${(year3.revenue - year2.revenue).toLocaleString()} (+${growthRate}%)

3-YEAR CUMULATIVE REVENUE:
  Year 1: £${year1.revenue.toLocaleString()}
  Year 2: £${year2.revenue.toLocaleString()}
  Year 3: £${year3.revenue.toLocaleString()}
  ────────────────────────────
  Total 3-Year Revenue: £${totalRevenue3Years.toLocaleString()}

Revenue Growth Multiple:
  End-to-End Growth: ${(year3.revenue / currentRevenue).toFixed(1)}x in 3 years
  ${(year3.revenue / currentRevenue) >= 2 ? '✓ Strong revenue multiplication' : '⚠ Limited revenue growth'}

═══════════════════════════════════════════════════════════
QUARTERLY REVENUE BREAKDOWN (12 Quarters)
═══════════════════════════════════════════════════════════
${[0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33].map((month, i) => {
  const quarter = projections[month];
  return `Q${i + 1} (Month ${month}):
  Revenue: £${quarter.revenue.toLocaleString()}
  Customers: ${quarter.customers}
  MRR: £${(quarter.revenue / 12).toFixed(0).toLocaleString()}`;
}).join('\n\n')}

═══════════════════════════════════════════════════════════
REVENUE GROWTH HEALTH SCORE CALCULATION
═══════════════════════════════════════════════════════════
Formula: Score = Growth Rate Component (50pts) + Year 3 Revenue Component (50pts)

Component 1: Annual Growth Rate Assessment
  Your Growth Rate: ${growthRate}% CAGR
  Scoring:
    - ≥50% CAGR: 50 points (Hypergrowth)
    - 30-50% CAGR: 40 points (High growth)
    - 20-30% CAGR: 25 points (Moderate growth)
    - <20% CAGR: 10 points (Slow growth)
  ${growthRate >= 50 ? '50/50 points (Hypergrowth)' :
    growthRate >= 30 ? '40/50 points (High growth)' :
    growthRate >= 20 ? '25/50 points (Moderate growth)' :
    '10/50 points (Slow growth)'}

Component 2: Year 3 Revenue Target Assessment
  Your Year 3 Revenue: £${year3.revenue.toLocaleString()}
  Scoring:
    - ≥£1M: 50 points (Excellent scale)
    - £500k-£1M: 35 points (Good scale)
    - <£500k: 15 points (Limited scale)
  ${year3.revenue >= 1000000 ? '50/50 points (£1M+ revenue achieved)' :
    year3.revenue >= 500000 ? '35/50 points (£500k-£1M revenue)' :
    '15/50 points (Revenue <£500k)'}

Final Growth Health Score: ${score}/100 (${grade})

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: VIABILITY & SCALABILITY CRITERIA
═══════════════════════════════════════════════════════════

GOV.UK Viability Assessment Factors:
• Realistic revenue projections based on current traction
• Sustainable growth rate supported by market opportunity
• Path to profitability and financial independence
• Evidence validating revenue assumptions

GOV.UK Scalability Assessment Factors:
• High growth potential (>30% CAGR preferred)
• Clear path to £1M+ annual revenue within 3 years
• Revenue model supports job creation (5 jobs at £25k+ OR 10 jobs)
• Addressable market sufficient for continued expansion

CURRENT REVENUE GROWTH STATUS:

Growth Rate: ${growthRate}% CAGR
  ${growthRate >= 50 ? '✓ HYPERGROWTH (50%+) - Exceptional scalability for UK Innovator Founder visa' :
    growthRate >= 30 ? '✓ HIGH GROWTH (30%+) - Strong scalability narrative' :
    growthRate >= 20 ? '⚠ MODERATE GROWTH (20-30%) - Acceptable but strengthen for strong endorsement' :
    '✗ SLOW GROWTH (<20%) - Insufficient for scalability criterion'}

Year 3 Revenue Target: £${year3.revenue.toLocaleString()}
  ${year3.revenue >= 1000000 ? '✓ EXCELLENT (£1M+) - Meets ILR revenue criterion (1 of 7 achievement criteria)' :
    year3.revenue >= 500000 ? '✓ GOOD (£500k-£1M) - Strong viability demonstration' :
    '⚠ LIMITED (<£500k) - May not demonstrate sufficient scalability'}

Revenue Multiple: ${(year3.revenue / currentRevenue).toFixed(1)}x growth
  ${(year3.revenue / currentRevenue) >= 5 ? '✓ EXCEPTIONAL (5x+) - Demonstrates hypergrowth potential' :
    (year3.revenue / currentRevenue) >= 3 ? '✓ STRONG (3-5x) - Clear scaling trajectory' :
    (year3.revenue / currentRevenue) >= 2 ? '⚠ MODERATE (2-3x) - Viable but could be stronger' :
    '✗ WEAK (<2x) - Limited growth demonstrates scaling challenges'}

Overall Growth Health: ${score}%
  ${score >= 70 ? '✓ STRONG REVENUE FORECAST - Demonstrates clear viability and scalability' :
    score >= 55 ? '⚠ MODERATE FORECAST - Viable but strengthening growth rate would improve case' :
    '✗ WEAK FORECAST - Requires fundamental improvements to revenue projections'}

GOV.UK ILR Achievement Criteria:
${year3.revenue >= 1000000 ? 
`✓ REVENUE CRITERION MET - Achieving £1M+ annual revenue is one of 7 ILR achievement criteria
  (Applicants must meet 2 of 7 criteria for settlement after 3 years)` :
`⚠ Revenue projection £${year3.revenue.toLocaleString()} falls short of £1M ILR criterion
  Consider other ILR pathways: job creation (5 jobs at £25k+), investment (£50k), or IP development`}

Visa Criterion Alignment:
${score >= 70 && year3.revenue >= 500000 ? 
`✓ Revenue forecast demonstrates strong viability and scalability for UK Innovator Founder visa endorsement. ${growthRate}% CAGR and £${year3.revenue.toLocaleString()} Year 3 projection show realistic path to significant scale${year3.revenue >= 1000000 ? ' and meet the £1M revenue ILR criterion' : ''}.` :
score >= 55 ?
`⚠ Revenue forecast is acceptable but strengthening growth rate (aim for 30%+ CAGR) and Year 3 target (aim for £1M+) would create stronger endorsement case. Focus on demonstrating traction and market validation to support projections.` :
`✗ Revenue forecast needs significant strengthening. Current ${growthRate}% growth and £${year3.revenue.toLocaleString()} Year 3 projection may not demonstrate sufficient viability and scalability. Revisit market opportunity, pricing strategy, and customer acquisition plan.`}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Viability Criterion: Realistic financial projections and sustainable growth
Scalability Criterion: High growth potential and path to significant revenue
ILR Achievement Criteria: £1M annual revenue (1 of 7 criteria, need 2 total)
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
Revenue Forecasting Methodology: Compound annual growth rate (CAGR) modeling
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-revenue-forecast.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (growthRate < 20) tips.push("⚠️ Growth rate <20% - consider strategies to accelerate revenue");
    if (currentRevenue < 50000) tips.push("📊 Low current revenue - focus on customer acquisition");
    const { score } = getGrowthHealth();
    if (score >= 75) tips.push("✅ Strong revenue growth supports viability criterion");
    return tips.length ? tips : ["✅ Revenue forecast is healthy"];
  };

  const getMonthlyTrend = () => getProjections().slice(0, 36);

  const getQuarterlyBreakdown = () => {
    const projections = getProjections();
    return [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33].map((month, i) => ({
      quarter: `Q${i + 1}`,
      revenue: Math.round(projections[month].revenue / 1000),
      customers: projections[month].customers
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('revenueForecastData');
    if (s) {
      const data = JSON.parse(s);
      setCurrentRevenue(data.currentRevenue || 100000);
      setGrowthRate(data.growthRate || 30);
      setCustomers(data.customers || 50);
      setArpu(data.arpu || 2000);
    }
    const f = localStorage.getItem('revenueForecastFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('revenueForecastDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: healthScore, grade } = getGrowthHealth();
  const year3Revenue = currentRevenue * Math.pow(1 + growthRate / 100, 3);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Revenue Forecast</h1>
          <p className="text-muted-foreground mb-6">Project revenue growth for viability (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="revenue-forecast" toolName="Revenue Forecast" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, currentRevenue, growthRate, customers, arpu, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Growth Health</span>
              </div>
              <p className="text-3xl font-bold">{healthScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Current Revenue</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(currentRevenue / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Annual</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Growth Rate</span>
              </div>
              <p className="text-3xl font-bold">{growthRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Annual</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Year 3</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(year3Revenue / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Projected</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">3-Year Revenue Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getMonthlyTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Revenue £', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Yearly Growth Trajectory</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getYearlyProjections()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '£ Thousands', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value}k`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ffa536" name="Projected Revenue" />
                  <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} name="Conservative Target" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quarterly Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getQuarterlyBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis label={{ value: '£ Thousands', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value}k`} />
                  <Bar dataKey="revenue" fill="#ffa536" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getMonthlyTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Customers', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="customers" stroke="#11b6e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Recommendations</h3>
            <div className="space-y-3">
              {getSmartRecommendations().map((tip, i) => {
                const isWarning = tip.includes('⚠️');
                return (
                  <Alert key={i} className={isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Forecast Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Current Annual Revenue (£)</label>
                <Input type="number" value={currentRevenue} onChange={(e) => setCurrentRevenue(Number(e.target.value))} data-testid="input-revenue" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Current Customers</label>
                <Input type="number" value={customers} onChange={(e) => setCustomers(Number(e.target.value))} data-testid="input-customers" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Annual Growth Rate: {growthRate}%</label>
                <Slider value={[growthRate]} onValueChange={(v) => setGrowthRate(v[0])} max={100} step={5} data-testid="slider-growth" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">ARPU (£)</label>
                <Input type="number" value={arpu} onChange={(e) => setArpu(Number(e.target.value))} data-testid="input-arpu" />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Financial Projections</h3>
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
