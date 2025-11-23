import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Globe, Users, TrendingUp, AlertCircle, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Large market opportunity demonstrates growth potential
// Viability Criterion: Addressable market supports business sustainability

export default function MarketSizing() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [tam, setTam] = useState(5000000000); // Total Addressable Market
  const [sam, setSam] = useState(500000000); // Serviceable Addressable Market
  const [som, setSom] = useState(50000000); // Serviceable Obtainable Market
  const [targetSegment, setTargetSegment] = useState("UK SMBs using cloud software");
  const [growthRate, setGrowthRate] = useState(25);

  const saveProgress = () => {
    localStorage.setItem('marketSizingFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('marketSizingData', JSON.stringify({ tam, sam, som, targetSegment, growthRate }));
    localStorage.setItem('marketSizingDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getMarketHealth = (): { score: number; grade: string } => {
    let score = 0;
    
    if (tam >= 1000000000) score += 30;
    else if (tam >= 500000000) score += 20;
    else score += 10;
    
    const samRatio = sam / tam;
    if (samRatio >= 0.1) score += 25;
    else if (samRatio >= 0.05) score += 15;
    else score += 5;
    
    const somRatio = som / sam;
    if (somRatio >= 0.1) score += 25;
    else if (somRatio >= 0.05) score += 15;
    else score += 5;
    
    if (growthRate >= 30) score += 20;
    else if (growthRate >= 20) score += 15;
    else score += 5;
    
    let grade = 'F - Small';
    if (score >= 85) grade = 'A - Huge';
    else if (score >= 70) grade = 'B - Large';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Limited';
    
    return { score, grade };
  };

  const exportReport = () => {
    const { score, grade } = getMarketHealth();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    
    const content = `UK INNOVATOR FOUNDER VISA - MARKET SIZING ANALYSIS
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Market Opportunity Score: ${score}% (${grade})

Market Size (TAM/SAM/SOM):
  Total Addressable Market: £${(tam / 1000000000).toFixed(2)}B
  Serviceable Addressable: £${(sam / 1000000).toFixed(0)}M
  Serviceable Obtainable: £${(som / 1000000).toFixed(0)}M

Market Growth: ${growthRate}% annually

${score >= 75 ? '✓ LARGE MARKET - Strong scalability potential for UK Innovator Founder visa' : score >= 60 ? '⚠ MODERATE MARKET - Strengthen for endorsement' : '✗ LIMITED MARKET - Expand addressable opportunity'}

═══════════════════════════════════════════════════════════
MARKET SIZING FRAMEWORK (TAM/SAM/SOM)
═══════════════════════════════════════════════════════════

TOTAL ADDRESSABLE MARKET (TAM):
£${(tam / 1000000000).toFixed(2)}B (£${tam.toLocaleString()})
Definition: Total market demand if 100% market share achieved globally
${tam >= 5000000000 ? '✓ Very large TAM (£5B+) - excellent scalability narrative' : tam >= 1000000000 ? '✓ Large TAM (£1B-5B) - good market size' : '⚠ TAM <£1B - consider broader market definition'}

SERVICEABLE ADDRESSABLE MARKET (SAM):
£${(sam / 1000000).toFixed(0)}M (£${sam.toLocaleString()})
Definition: Portion of TAM you can realistically target with your product/service
SAM as % of TAM: ${samPercent}%
${sam >= 500000000 ? '✓ Large SAM (£500M+) - strong addressable market' : sam >= 100000000 ? '✓ Moderate SAM (£100M-500M) - viable market' : '⚠ SAM <£100M - validate addressable market size'}

SERVICEABLE OBTAINABLE MARKET (SOM):
£${(som / 1000000).toFixed(0)}M (£${som.toLocaleString()})
Definition: Realistic market share you can capture in 3-5 years
SOM as % of SAM: ${somPercent}%
${som >= 50000000 ? '✓ Large SOM (£50M+) - ambitious but achievable target' : som >= 10000000 ? '✓ Moderate SOM (£10M-50M) - realistic target' : '⚠ SOM <£10M - increase obtainable market estimate'}

TARGET SEGMENT:
${targetSegment}

═══════════════════════════════════════════════════════════
MARKET OPPORTUNITY SCORE CALCULATION
═══════════════════════════════════════════════════════════
Formula: Market Health = TAM Size (30pts) + SAM Ratio (25pts) + SOM Ratio (25pts) + Growth Rate (20pts)

COMPONENT 1: TAM SIZE (Maximum 30 points)
Scoring Criteria:
  • TAM ≥£10B: 30 points
  • TAM £5B-10B: 25 points
  • TAM £1B-5B: 20 points
  • TAM <£1B: 10 points

Your TAM: £${(tam / 1000000000).toFixed(2)}B
${tam >= 10000000000 ? 'Points Earned: 30/30 (TAM ≥£10B)' : tam >= 5000000000 ? 'Points Earned: 25/30 (TAM £5B-10B)' : tam >= 1000000000 ? 'Points Earned: 20/30 (TAM £1B-5B)' : 'Points Earned: 10/30 (TAM <£1B)'}

COMPONENT 2: SAM RATIO (Maximum 25 points)
Scoring Criteria:
  • SAM/TAM ≥10%: 25 points
  • SAM/TAM 5-10%: 15 points
  • SAM/TAM <5%: 5 points

Your SAM/TAM Ratio: ${samPercent}%
Calculation: £${(sam / 1000000).toFixed(0)}M / £${(tam / 1000000000).toFixed(2)}B = ${samPercent}%
${(sam / tam) >= 0.1 ? 'Points Earned: 25/25 (Ratio ≥10%)' : (sam / tam) >= 0.05 ? 'Points Earned: 15/25 (Ratio 5-10%)' : 'Points Earned: 5/25 (Ratio <5%)'}

COMPONENT 3: SOM RATIO (Maximum 25 points)
Scoring Criteria:
  • SOM/SAM ≥10%: 25 points
  • SOM/SAM 5-10%: 15 points
  • SOM/SAM <5%: 5 points

Your SOM/SAM Ratio: ${somPercent}%
Calculation: £${(som / 1000000).toFixed(0)}M / £${(sam / 1000000).toFixed(0)}M = ${somPercent}%
${(som / sam) >= 0.1 ? 'Points Earned: 25/25 (Ratio ≥10%)' : (som / sam) >= 0.05 ? 'Points Earned: 15/25 (Ratio 5-10%)' : 'Points Earned: 5/25 (Ratio <5%)'}

COMPONENT 4: MARKET GROWTH RATE (Maximum 20 points)
Scoring Criteria:
  • Growth ≥30% annually: 20 points
  • Growth 20-30% annually: 15 points
  • Growth <20% annually: 5 points

Your Annual Growth Rate: ${growthRate}%
${growthRate >= 30 ? 'Points Earned: 20/20 (Growth ≥30%)' : growthRate >= 20 ? 'Points Earned: 15/20 (Growth 20-30%)' : 'Points Earned: 5/20 (Growth <20%)'}

FINAL CALCULATION:
Total Score: ${score}/100 (${grade})
Market Opportunity: ${score >= 75 ? 'LARGE - Excellent scalability potential' : score >= 60 ? 'MODERATE - Viable but strengthen' : 'LIMITED - Expand market definition'}

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: SCALABILITY CRITERION
═══════════════════════════════════════════════════════════
GOV.UK Scalability Assessment Factors:
• Significant market size to support growth
• Clear path to substantial revenue and job creation
• International expansion potential
• Market growth rate validates opportunity
• Realistic market share capture assumptions

CURRENT MARKET ASSESSMENT:
TAM: £${(tam / 1000000000).toFixed(2)}B
${tam >= 1000000000 ? '✓ TAM ≥£1B demonstrates significant total market' : '⚠ TAM <£1B - consider broader market definition for scalability'}

SAM: £${(sam / 1000000).toFixed(0)}M
${sam >= 500000000 ? '✓ SAM ≥£500M supports strong scalability narrative' : sam >= 100000000 ? '✓ SAM ≥£100M viable for sustainable growth' : '⚠ SAM <£100M - validate addressable market for viability'}

SOM: £${(som / 1000000).toFixed(0)}M (${somPercent}% of SAM)
${som >= 50000000 ? '✓ SOM ≥£50M shows ambitious growth target' : som >= 10000000 ? '✓ SOM ≥£10M realistic for 3-5 year horizon' : '⚠ SOM <£10M - increase obtainable market estimate'}

Growth Rate: ${growthRate}% annually
${growthRate >= 20 ? '✓ High growth market (≥20%) validates opportunity' : '⚠ Growth <20% - highlight faster-growing segments'}

Overall Market Opportunity: ${score}%
${score >= 75 && sam >= 100000000 ? `✓ Large market opportunity (${score}%) with £${(sam / 1000000).toFixed(0)}M SAM strongly supports UK Innovator Founder visa scalability criterion. Market size demonstrates significant growth potential and sustainable revenue opportunity.` : score >= 60 ? '⚠ Market opportunity is viable but strengthening SAM (aim for £500M+) or TAM (aim for £5B+) would improve scalability narrative for endorsement.' : '✗ Market opportunity needs expansion - focus on larger TAM definition, broader addressable market (SAM), or higher growth rate to demonstrate scalability potential.'}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Scalability Criterion: Significant market size and growth potential
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
TAM/SAM/SOM Methodology: Market sizing framework for growth planning
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-market-sizing.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (tam < 1000000000) tips.push("⚠️ TAM <£1B - consider broader market definition for scalability");
    if (sam < 100000000) tips.push("📊 SAM <£100M - validate addressable market size");
    if (som < 10000000) tips.push("💡 SOM <£10M - increase obtainable market estimate");
    if (growthRate < 20) tips.push("🚨 Growth rate <20% - highlight faster-growing segments");
    const { score } = getMarketHealth();
    if (score >= 80) tips.push("✅ Strong market opportunity supports scalability criterion");
    return tips.length ? tips : ["✅ Market sizing is solid"];
  };

  const getMarketFunnel = () => [
    { stage: "TAM", value: tam / 1000000, description: "Total Market" },
    { stage: "SAM", value: sam / 1000000, description: "Addressable" },
    { stage: "SOM", value: som / 1000000, description: "Obtainable" }
  ];

  const getGrowthProjection = () => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map(year => ({
      year: year === 0 ? 'Today' : `Year ${year}`,
      sam: Math.round((sam / 1000000) * Math.pow(1 + growthRate / 100, year)),
      som: Math.round((som / 1000000) * Math.pow(1 + growthRate / 100, year))
    }));
  };

  const getMarketSegments = () => [
    { segment: "UK", size: sam * 0.3 },
    { segment: "EU", size: sam * 0.4 },
    { segment: "US", size: sam * 0.2 },
    { segment: "Rest of World", size: sam * 0.1 }
  ];

  const getCaptureRate = () => {
    const years = Array.from({ length: 5 }, (_, i) => i + 1);
    return years.map(year => ({
      year: `Year ${year}`,
      target: (som / sam) * 100 * (1 + year * 0.5),
      actual: (som / sam) * 100 * (0.8 + year * 0.4)
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('marketSizingData');
    if (s) {
      const data = JSON.parse(s);
      setTam(data.tam || 5000000000);
      setSam(data.sam || 500000000);
      setSom(data.som || 50000000);
      setTargetSegment(data.targetSegment || "");
      setGrowthRate(data.growthRate || 25);
    }
    const f = localStorage.getItem('marketSizingFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('marketSizingDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: opportunityScore, grade } = getMarketHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Market Sizing</h1>
          <p className="text-muted-foreground mb-6">Quantify market opportunity (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="market-size" toolName="Market Sizing" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, tam, sam, som, targetSegment, growthRate, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Market Opportunity</span>
              </div>
              <p className="text-3xl font-bold">{opportunityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">TAM</span>
              </div>
              <p className="text-3xl font-bold">£{(tam / 1000000000).toFixed(1)}B</p>
              <p className="text-xs text-muted-foreground mt-1">Total market</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">SAM</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(sam / 1000000)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Addressable</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">SOM</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(som / 1000000)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Obtainable</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Funnel (TAM/SAM/SOM)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMarketFunnel()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: '£ Millions', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="stage" width={60} />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}M`} />
                  <Bar dataKey="value" fill="#ffa536">
                    {getMarketFunnel().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">5-Year Growth Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getGrowthProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '£ Millions', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="sam" stackId="1" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} name="SAM" />
                  <Area type="monotone" dataKey="som" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="SOM" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Geographic Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getMarketSegments()} dataKey="size" nameKey="segment" cx="50%" cy="50%" outerRadius={80} label={(entry) => `£${Math.round(entry.size / 1000000)}M`}>
                    {getMarketSegments().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `£${Math.round(value / 1000000)}M`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Capture Rate</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getCaptureRate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '% of SAM', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="target" stroke="#ffa536" strokeWidth={2} name="Target" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Realistic" />
                </LineChart>
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
            <h3 className="font-semibold mb-4">Market Sizing Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">TAM - Total Addressable Market (£)</label>
                <Input type="number" value={tam} onChange={(e) => setTam(Number(e.target.value))} data-testid="input-tam" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">SAM - Serviceable Addressable Market (£)</label>
                <Input type="number" value={sam} onChange={(e) => setSam(Number(e.target.value))} data-testid="input-sam" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">SOM - Serviceable Obtainable Market (£)</label>
                <Input type="number" value={som} onChange={(e) => setSom(Number(e.target.value))} data-testid="input-som" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Target Segment Description</label>
                <Textarea value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} placeholder="Define your ideal customer segment..." rows={3} data-testid="textarea-segment" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Annual Market Growth Rate: {growthRate}%</label>
              <Slider value={[growthRate]} onValueChange={(v) => setGrowthRate(v[0])} max={100} step={5} data-testid="slider-growth" />
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Market Research</h3>
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
