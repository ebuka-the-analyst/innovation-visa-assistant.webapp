import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { TrendingUp, Target, DollarSign, AlertCircle, Award, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Large addressable market demonstrates growth potential
// Viability Criterion: Market size validates business opportunity
// Innovation Criterion: Market trends support innovative solution

export default function MarketAnalysis() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [tam, setTam] = useState(5000000000); // Total Addressable Market
  const [sam, setSam] = useState(500000000); // Serviceable Addressable Market
  const [som, setSom] = useState(50000000); // Serviceable Obtainable Market
  const [marketGrowth, setMarketGrowth] = useState(15); // % annual growth
  const [competitorCount, setCompetitorCount] = useState(25);
  const [marketMaturity, setMarketMaturity] = useState<"emerging" | "growth" | "mature" | "declining">("growth");
  const [targetSegments, setTargetSegments] = useState("SMBs, Enterprise, Startups");
  const [keyTrends, setKeyTrends] = useState("Digital transformation, AI adoption, Remote work");

  const saveProgress = () => {
    localStorage.setItem('marketAnalysisFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('marketAnalysisData', JSON.stringify({ tam, sam, som, marketGrowth, competitorCount, marketMaturity, targetSegments, keyTrends }));
    localStorage.setItem('marketAnalysisDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  // PhD-Level: Market Opportunity Score
  // Formula: Based on TAM size, growth rate, and market maturity
  const getMarketOpportunity = (): { score: number; grade: string } => {
    let score = 0;
    
    // TAM size (40 points): £50M+ = excellent
    if (tam >= 1000000000) score += 40;
    else if (tam >= 100000000) score += 30;
    else if (tam >= 50000000) score += 20;
    else score += 10;
    
    // Market growth (30 points): 15%+ = excellent
    if (marketGrowth >= 20) score += 30;
    else if (marketGrowth >= 15) score += 25;
    else if (marketGrowth >= 10) score += 15;
    else score += 5;
    
    // Market maturity (30 points): Growth stage ideal
    if (marketMaturity === "growth") score += 30;
    else if (marketMaturity === "emerging") score += 25;
    else if (marketMaturity === "mature") score += 15;
    else score += 5;
    
    let grade = 'F - Poor Market';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Strong';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Weak';
    
    return { score, grade };
  };

  // PhD-Level: Market Sizing Validation
  // Formula: SOM should be 1-10% of SAM, SAM should be 10-50% of TAM
  const getMarketSizingHealth = (): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    let isValid = true;
    
    const samPercent = (sam / tam) * 100;
    const somPercent = (som / sam) * 100;
    
    if (samPercent > 50) {
      issues.push("SAM too high (>50% of TAM) - unrealistic market penetration");
      isValid = false;
    }
    if (samPercent < 5) {
      issues.push("SAM too low (<5% of TAM) - consider broader addressable market");
    }
    
    if (somPercent > 15) {
      issues.push("SOM too high (>15% of SAM) - unrealistic short-term capture");
      isValid = false;
    }
    if (somPercent < 1) {
      issues.push("SOM too low (<1% of SAM) - insufficient market opportunity");
    }
    
    return { isValid, issues };
  };

  const exportReport = () => {
    const { score, grade } = getMarketOpportunity();
    const { isValid, issues } = getMarketSizingHealth();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    
    const content = `UK INNOVATOR FOUNDER VISA - MARKET ANALYSIS
Generated: ${new Date().toLocaleDateString()}

Market Opportunity Score: ${score}% (${grade})
Market Maturity: ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)}
Annual Market Growth: ${marketGrowth}%
Competitor Count: ${competitorCount}

MARKET SIZING (TAM/SAM/SOM):
Total Addressable Market (TAM): £${(tam / 1000000).toFixed(1)}M
Serviceable Addressable Market (SAM): £${(sam / 1000000).toFixed(1)}M (${samPercent}% of TAM)
Serviceable Obtainable Market (SOM): £${(som / 1000000).toFixed(1)}M (${somPercent}% of SAM)

Market Sizing Validation: ${isValid ? '✅ VALID' : '⚠️ NEEDS ADJUSTMENT'}
${issues.length > 0 ? issues.map(i => `- ${i}`).join('\n') : '✅ Market sizing ratios are realistic'}

TARGET SEGMENTS:
${targetSegments}

KEY MARKET TRENDS:
${keyTrends}

INNOVATOR FOUNDER VISA CONTEXT:
Scalability: ${tam >= 100000000 ? `Large TAM (£${(tam / 1000000).toFixed(0)}M) demonstrates significant growth potential` : 'Limited TAM may restrict scalability assessment'}
Viability: ${score >= 70 ? 'Strong market opportunity validates business viability' : 'Market opportunity needs strengthening for viability criterion'}
Innovation: ${marketGrowth >= 15 ? `High growth rate (${marketGrowth}%) supports innovative solution narrative` : 'Market growth supports innovation but could be stronger'}

5-YEAR MARKET PROJECTION:
Year 1: £${(som / 1000000).toFixed(1)}M (baseline SOM)
Year 2: £${(som * (1 + marketGrowth/100) / 1000000).toFixed(1)}M
Year 3: £${(som * Math.pow(1 + marketGrowth/100, 2) / 1000000).toFixed(1)}M
Year 4: £${(som * Math.pow(1 + marketGrowth/100, 3) / 1000000).toFixed(1)}M
Year 5: £${(som * Math.pow(1 + marketGrowth/100, 4) / 1000000).toFixed(1)}M

Source: Industry market research, GOV.UK Innovator Founder visa criteria
Formula: Market Score = TAM Size (40pts) + Growth (30pts) + Maturity (30pts)
GOV.UK: Innovator Founder Visa scalability criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-market-analysis.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    const { score } = getMarketOpportunity();
    const { issues } = getMarketSizingHealth();
    
    if (tam < 100000000) tips.push("⚠️ TAM below £100M - may limit scalability assessment for Innovator Founder visa");
    if (marketGrowth < 10) tips.push("📊 Market growth <10% - consider focusing on faster-growing segments");
    if (marketMaturity === "declining") tips.push("🚨 Declining market - critical risk to viability criterion");
    if (competitorCount > 50) tips.push("💡 High competition (50+) - ensure strong differentiation for innovation criterion");
    
    issues.forEach(issue => tips.push(`⚠️ ${issue}`));
    
    if (score >= 75 && issues.length === 0) {
      tips.push("✅ Strong market opportunity demonstrates scalability and viability for visa assessment");
    }
    
    return tips.length ? tips : ["✅ Market analysis supports Innovator Founder visa criteria"];
  };

  // Chart 1: TAM/SAM/SOM Funnel
  const getMarketFunnel = () => [
    { stage: "TAM", value: tam / 1000000, label: `£${(tam / 1000000).toFixed(0)}M` },
    { stage: "SAM", value: sam / 1000000, label: `£${(sam / 1000000).toFixed(0)}M` },
    { stage: "SOM", value: som / 1000000, label: `£${(som / 1000000).toFixed(0)}M` }
  ];

  // Chart 2: 5-Year Market Growth Projection
  const getGrowthProjection = () => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map(year => ({
      year: year === 0 ? 'Now' : `Y${year}`,
      tam: tam * Math.pow(1 + marketGrowth/100, year) / 1000000,
      sam: sam * Math.pow(1 + marketGrowth/100, year) / 1000000,
      som: som * Math.pow(1 + marketGrowth/100, year) / 1000000
    }));
  };

  // Chart 3: Market Maturity Distribution
  const getMaturityData = () => {
    const stages = {
      emerging: { weight: 25, color: '#11b6e9' },
      growth: { weight: 30, color: '#10b981' },
      mature: { weight: 15, color: '#ffa536' },
      declining: { weight: 5, color: '#ef4444' }
    };
    
    return [
      { stage: "Emerging", score: marketMaturity === "emerging" ? 100 : 30, ideal: stages.emerging.weight },
      { stage: "Growth", score: marketMaturity === "growth" ? 100 : 30, ideal: stages.growth.weight },
      { stage: "Mature", score: marketMaturity === "mature" ? 100 : 20, ideal: stages.mature.weight },
      { stage: "Declining", score: marketMaturity === "declining" ? 100 : 5, ideal: stages.declining.weight }
    ];
  };

  // Chart 4: Market Opportunity Breakdown
  const getOpportunityBreakdown = () => {
    const tamScore = tam >= 1000000000 ? 40 : tam >= 100000000 ? 30 : 20;
    const growthScore = marketGrowth >= 20 ? 30 : marketGrowth >= 15 ? 25 : 15;
    const maturityScore = marketMaturity === "growth" ? 30 : marketMaturity === "emerging" ? 25 : 15;
    
    return [
      { component: "Market Size", score: tamScore, max: 40 },
      { component: "Growth Rate", score: growthScore, max: 30 },
      { component: "Maturity Stage", score: maturityScore, max: 30 }
    ];
  };

  useEffect(() => {
    const s = localStorage.getItem('marketAnalysisData');
    if (s) {
      const data = JSON.parse(s);
      setTam(data.tam || 5000000000);
      setSam(data.sam || 500000000);
      setSom(data.som || 50000000);
      setMarketGrowth(data.marketGrowth || 15);
      setCompetitorCount(data.competitorCount || 25);
      setMarketMaturity(data.marketMaturity || "growth");
      setTargetSegments(data.targetSegments || "");
      setKeyTrends(data.keyTrends || "");
    }
    const f = localStorage.getItem('marketAnalysisFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('marketAnalysisDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: opportunityScore, grade } = getMarketOpportunity();
  const { isValid } = getMarketSizingHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#8b5cf6'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Market Analysis</h1>
          <p className="text-muted-foreground mb-6">Validate market opportunity for scalability (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="market-analysis" toolName="Market Analysis" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, tam, sam, som, marketGrowth, competitorCount, marketMaturity, targetSegments, keyTrends, savedDate })} />

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
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">TAM</span>
              </div>
              <p className="text-3xl font-bold">£{(tam / 1000000).toFixed(0)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Total market</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Market Growth</span>
              </div>
              <p className="text-3xl font-bold">{marketGrowth}%</p>
              <p className="text-xs text-muted-foreground mt-1">Annual CAGR</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className={`w-5 h-5 ${isValid ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-sm font-medium">Sizing Valid</span>
              </div>
              <p className="text-3xl font-bold">{isValid ? '✓' : '✗'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isValid ? 'Realistic' : 'Needs fix'}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">TAM → SAM → SOM Funnel</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMarketFunnel()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: '£ Million', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}M`} />
                  <Bar dataKey="value" fill="#ffa536" label={{ position: 'right', formatter: (val: any) => `£${val.toFixed(0)}M` }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">5-Year Growth Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getGrowthProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: '£ Million', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toFixed(0)}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="tam" stackId="1" stroke="#ffa536" fill="#ffa536" fillOpacity={0.3} name="TAM" />
                  <Area type="monotone" dataKey="sam" stackId="2" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.5} name="SAM" />
                  <Area type="monotone" dataKey="som" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="SOM" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Maturity Assessment</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMaturityData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#ffa536" name="Your Market" />
                  <Bar dataKey="ideal" fill="#10b981" fillOpacity={0.3} name="Ideal for Visa" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Opportunity Score Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getOpportunityBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="component" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Points', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#ffa536" name="Your Score" />
                  <Bar dataKey="max" fill="#10b981" fillOpacity={0.3} name="Maximum" />
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
            <h3 className="font-semibold mb-4">Market Sizing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Total Addressable Market (£)</label>
                <Input type="number" value={tam} onChange={(e) => setTam(Number(e.target.value))} data-testid="input-tam" />
                <p className="text-xs text-muted-foreground mt-1">£{(tam / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Serviceable Addressable Market (£)</label>
                <Input type="number" value={sam} onChange={(e) => setSam(Number(e.target.value))} data-testid="input-sam" />
                <p className="text-xs text-muted-foreground mt-1">£{(sam / 1000000).toFixed(1)}M ({((sam/tam)*100).toFixed(1)}% of TAM)</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Serviceable Obtainable Market (£)</label>
                <Input type="number" value={som} onChange={(e) => setSom(Number(e.target.value))} data-testid="input-som" />
                <p className="text-xs text-muted-foreground mt-1">£{(som / 1000000).toFixed(1)}M ({((som/sam)*100).toFixed(1)}% of SAM)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Annual Market Growth: {marketGrowth}%</label>
                <Slider value={[marketGrowth]} onValueChange={(v) => setMarketGrowth(v[0])} max={50} step={1} data-testid="slider-growth" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Competitor Count</label>
                <Input type="number" value={competitorCount} onChange={(e) => setCompetitorCount(Number(e.target.value))} data-testid="input-competitors" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Market Maturity</label>
                <select className="w-full h-10 px-3 border rounded-md" value={marketMaturity} onChange={(e) => setMarketMaturity(e.target.value as any)} data-testid="select-maturity">
                  <option value="emerging">Emerging</option>
                  <option value="growth">Growth</option>
                  <option value="mature">Mature</option>
                  <option value="declining">Declining</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Target Customer Segments</label>
                <Textarea value={targetSegments} onChange={(e) => setTargetSegments(e.target.value)} placeholder="SMBs, Enterprise..." rows={2} data-testid="textarea-segments" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Key Market Trends</label>
                <Textarea value={keyTrends} onChange={(e) => setKeyTrends(e.target.value)} placeholder="Digital transformation..." rows={2} data-testid="textarea-trends" />
              </div>
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
