import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, TrendingUp, AlertCircle, Award, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Cell } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Competitive differentiation demonstrates innovative approach
// Viability Criterion: Competitive position validates market opportunity
// Scalability Criterion: Competitive advantages enable growth

interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  innovation: number;
  pricing: number;
  customerSat: number;
  funding: number;
  weaknesses: string;
}

export default function CompetitorBench() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [yourScores, setYourScores] = useState({ innovation: 80, pricing: 70, customerSat: 75, marketShare: 5, funding: 50 });
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: "1", name: "Competitor A", marketShare: 25, innovation: 60, pricing: 65, customerSat: 70, funding: 85, weaknesses: "Slow innovation cycle, legacy tech stack" }
  ]);

  const saveProgress = () => {
    localStorage.setItem('competitorBenchFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('competitorBenchData', JSON.stringify({ yourScores, competitors }));
    localStorage.setItem('competitorBenchDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addCompetitor = () => {
    setCompetitors([...competitors, { id: Date.now().toString(), name: "New Competitor", marketShare: 10, innovation: 50, pricing: 50, customerSat: 50, funding: 50, weaknesses: "" }]);
  };

  const removeCompetitor = (id: string) => setCompetitors(competitors.filter(c => c.id !== id));

  const updateCompetitor = (id: string, field: string, value: any) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // PhD-Level: Competitive Advantage Score
  const getCompetitiveAdvantage = (): { score: number; grade: string; advantages: number } => {
    let advantages = 0;
    const avgCompetitor = {
      innovation: competitors.reduce((s, c) => s + c.innovation, 0) / (competitors.length || 1),
      pricing: competitors.reduce((s, c) => s + c.pricing, 0) / (competitors.length || 1),
      customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / (competitors.length || 1)
    };

    if (yourScores.innovation > avgCompetitor.innovation) advantages++;
    if (yourScores.pricing > avgCompetitor.pricing) advantages++;
    if (yourScores.customerSat > avgCompetitor.customerSat) advantages++;

    const innovationGap = yourScores.innovation - avgCompetitor.innovation;
    const pricingGap = yourScores.pricing - avgCompetitor.pricing;
    const satisfactionGap = yourScores.customerSat - avgCompetitor.customerSat;

    const score = Math.min(100, Math.round(50 + (innovationGap + pricingGap + satisfactionGap) / 3));

    let grade = 'F - Weak Position';
    if (score >= 85) grade = 'A - Strong Lead';
    else if (score >= 70) grade = 'B - Competitive';
    else if (score >= 55) grade = 'C - At Par';
    else if (score >= 40) grade = 'D - Behind';

    return { score, grade, advantages };
  };

  const exportReport = () => {
    const { score, grade, advantages } = getCompetitiveAdvantage();
    const avgComp = {
      innovation: competitors.reduce((s, c) => s + c.innovation, 0) / (competitors.length || 1),
      pricing: competitors.reduce((s, c) => s + c.pricing, 0) / (competitors.length || 1),
      customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / (competitors.length || 1),
      funding: competitors.reduce((s, c) => s + c.funding, 0) / (competitors.length || 1)
    };
    
    const innovationGap = yourScores.innovation - avgComp.innovation;
    const pricingGap = yourScores.pricing - avgComp.pricing;
    const satisfactionGap = yourScores.customerSat - avgComp.customerSat;
    const totalMarketShare = yourScores.marketShare + competitors.reduce((s, c) => s + c.marketShare, 0);

    const content = `UK INNOVATOR FOUNDER VISA - COMPETITIVE POSITIONING
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Competitive Advantage Score: ${score}% (${grade})
Competitive Advantages Identified: ${advantages}/3 dimensions
Your Market Position: ${yourScores.marketShare}% market share
Competitors Analyzed: ${competitors.length}

${score >= 70 ? '✓ STRONG COMPETITIVE POSITION - Supports innovation criterion for UK Innovator Founder visa' : score >= 55 ? '⚠ COMPETITIVE POSITION - Strengthen differentiation for endorsement' : '✗ WEAK POSITION - Critical improvements needed'}

═══════════════════════════════════════════════════════════
YOUR COMPETITIVE PROFILE
═══════════════════════════════════════════════════════════
Innovation Score: ${yourScores.innovation}/100
  ${yourScores.innovation >= 75 ? '✓ Strong innovation capability' : yourScores.innovation >= 60 ? '⚠ Moderate innovation' : '✗ Innovation needs strengthening'}
  
Pricing Competitiveness: ${yourScores.pricing}/100
  ${yourScores.pricing >= 75 ? '✓ Strong pricing advantage' : yourScores.pricing >= 60 ? '⚠ Competitive pricing' : '✗ Pricing disadvantage'}
  
Customer Satisfaction: ${yourScores.customerSat}/100
  ${yourScores.customerSat >= 75 ? '✓ High customer satisfaction' : yourScores.customerSat >= 60 ? '⚠ Moderate satisfaction' : '✗ Customer satisfaction needs improvement'}
  
Funding Level: ${yourScores.funding}/100
  ${yourScores.funding >= 75 ? '✓ Well-funded position' : yourScores.funding >= 60 ? '⚠ Moderate funding' : '✗ Limited funding'}
  
Market Share: ${yourScores.marketShare}%
  ${yourScores.marketShare >= 10 ? '✓ Significant market presence' : yourScores.marketShare >= 5 ? '⚠ Growing market position' : '✗ Limited market penetration'}

═══════════════════════════════════════════════════════════
COMPETITIVE LANDSCAPE ANALYSIS
═══════════════════════════════════════════════════════════
Total Competitors Tracked: ${competitors.length}
Combined Market Share (You + Competitors): ${totalMarketShare.toFixed(1)}%
Remaining Market Opportunity: ${(100 - totalMarketShare).toFixed(1)}%

Average Competitor Metrics:
  Innovation: ${Math.round(avgComp.innovation)}/100
  Pricing: ${Math.round(avgComp.pricing)}/100
  Customer Satisfaction: ${Math.round(avgComp.customerSat)}/100
  Funding: ${Math.round(avgComp.funding)}/100

${competitors.map((c, idx) => `
═══════════════════════════════════════════════════════════
COMPETITOR ${idx + 1}: ${c.name}
═══════════════════════════════════════════════════════════
Market Share: ${c.marketShare}%
Innovation Score: ${c.innovation}/100 ${c.innovation > yourScores.innovation ? '⚠ AHEAD of you' : '✓ Behind you'}
Pricing Score: ${c.pricing}/100 ${c.pricing > yourScores.pricing ? '⚠ AHEAD of you' : '✓ Behind you'}
Customer Satisfaction: ${c.customerSat}/100 ${c.customerSat > yourScores.customerSat ? '⚠ AHEAD of you' : '✓ Behind you'}
Funding Level: ${c.funding}/100 ${c.funding > yourScores.funding ? '⚠ AHEAD of you' : '✓ Behind you'}

Key Weaknesses Identified:
${c.weaknesses}

Competitive Gaps You Can Exploit:
${c.innovation < yourScores.innovation ? `✓ Innovation gap: You lead by ${yourScores.innovation - c.innovation} points` : ''}
${c.pricing < yourScores.pricing ? `✓ Pricing gap: You lead by ${yourScores.pricing - c.pricing} points` : ''}
${c.customerSat < yourScores.customerSat ? `✓ Satisfaction gap: You lead by ${yourScores.customerSat - c.customerSat} points` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════════
COMPETITIVE ADVANTAGE SCORE CALCULATION
═══════════════════════════════════════════════════════════
Formula: Advantage Score = 50 (baseline) + Average(Innovation Gap + Pricing Gap + Satisfaction Gap) / 3

Step 1: Calculate Performance Gaps vs Market Average
  Innovation Gap: Your ${yourScores.innovation} - Market Avg ${Math.round(avgComp.innovation)} = ${innovationGap.toFixed(1)} points
  ${innovationGap > 0 ? '✓ You LEAD in innovation' : '✗ You LAG in innovation'}
  
  Pricing Gap: Your ${yourScores.pricing} - Market Avg ${Math.round(avgComp.pricing)} = ${pricingGap.toFixed(1)} points
  ${pricingGap > 0 ? '✓ You LEAD in pricing' : '✗ You LAG in pricing'}
  
  Satisfaction Gap: Your ${yourScores.customerSat} - Market Avg ${Math.round(avgComp.customerSat)} = ${satisfactionGap.toFixed(1)} points
  ${satisfactionGap > 0 ? '✓ You LEAD in customer satisfaction' : '✗ You LAG in customer satisfaction'}

Step 2: Calculate Average Gap
  Average Gap = (${innovationGap.toFixed(1)} + ${pricingGap.toFixed(1)} + ${satisfactionGap.toFixed(1)}) / 3
  Average Gap = ${((innovationGap + pricingGap + satisfactionGap) / 3).toFixed(1)} points

Step 3: Calculate Final Score
  Final Score = 50 (baseline) + ${((innovationGap + pricingGap + satisfactionGap) / 3).toFixed(1)}
  Final Score = ${score}% (${grade})

Competitive Advantages Summary:
${innovationGap > 0 ? '✓' : '✗'} Innovation Advantage: ${innovationGap > 0 ? 'YES' : 'NO'}
${pricingGap > 0 ? '✓' : '✗'} Pricing Advantage: ${pricingGap > 0 ? 'YES' : 'NO'}
${satisfactionGap > 0 ? '✓' : '✗'} Satisfaction Advantage: ${satisfactionGap > 0 ? 'YES' : 'NO'}
────────────────────────────
Total Competitive Advantages: ${advantages}/3

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: INNOVATION CRITERION
═══════════════════════════════════════════════════════════
GOV.UK Innovation Assessment Factors:
• Demonstrated differentiation from existing market solutions
• Novel approach or significant improvement over competitors
• Clear competitive advantages in product/service delivery
• Evidence of unique value proposition
• Defensible market position through innovation

CURRENT COMPETITIVE STATUS:
Innovation vs Market: ${innovationGap > 0 ? `+${innovationGap.toFixed(1)} points AHEAD` : `${innovationGap.toFixed(1)} points BEHIND`}
  ${innovationGap >= 10 ? '✓ STRONG innovation differentiation for UK Innovator Founder visa' : innovationGap > 0 ? '⚠ Moderate innovation lead - strengthen for endorsement' : '✗ Innovation below market average - CRITICAL to address'}

Competitive Advantages: ${advantages}/3
  ${advantages >= 2 ? '✓ Multiple advantages demonstrate viable competitive position' : '⚠ Limited advantages - strengthen differentiation'}

Market Position: ${yourScores.marketShare}% share
  ${yourScores.marketShare >= 10 ? '✓ Significant market validation' : yourScores.marketShare >= 5 ? '⚠ Growing traction' : '✗ Limited market penetration'}

Overall Competitive Score: ${score}%
  ${score >= 70 ? '✓ Strong competitive position supports innovation and viability criteria' : score >= 55 ? '⚠ Competitive but needs strengthening for strong endorsement case' : '✗ Weak competitive position - focus on differentiation and innovation'}

Visa Criterion Alignment:
${score >= 70 && innovationGap > 0 ? '✓ Competitive analysis demonstrates clear innovation and differentiation for UK Innovator Founder visa endorsement' : score >= 55 ? '⚠ Competitive position is acceptable but strengthening innovation differentiation (aim for 10+ point lead) would improve endorsement prospects' : '✗ Competitive position needs significant strengthening - demonstrate unique innovation that differentiates from existing market solutions'}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Innovation Criterion: Demonstrated differentiation and novel approach
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
Competitive Analysis Methodology: Market research, competitor benchmarking
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-competitive-positioning.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    const { advantages, score } = getCompetitiveAdvantage();
    const avgInnovation = competitors.reduce((s, c) => s + c.innovation, 0) / (competitors.length || 1);

    if (yourScores.innovation <= avgInnovation) {
      tips.push("🚨 Innovation score at/below competitor average - critical for Innovator Founder visa");
    }
    if (advantages === 0) {
      tips.push("⚠️ No competitive advantages identified - strengthen differentiation for viability");
    }
    if (yourScores.marketShare < 5) {
      tips.push("📊 Market share <5% - demonstrate traction for credibility");
    }
    if (score >= 75) {
      tips.push("✅ Strong competitive position supports innovation and viability criteria");
    }

    return tips.length ? tips : ["✅ Competitive analysis supports visa application"];
  };

  // Chart 1: Competitive Radar
  const getCompetitiveRadar = () => {
    const avgComp = {
      innovation: competitors.reduce((s, c) => s + c.innovation, 0) / (competitors.length || 1),
      pricing: competitors.reduce((s, c) => s + c.pricing, 0) / (competitors.length || 1),
      customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / (competitors.length || 1),
      funding: competitors.reduce((s, c) => s + c.funding, 0) / (competitors.length || 1)
    };

    return [
      { metric: "Innovation", you: yourScores.innovation, market: Math.round(avgComp.innovation) },
      { metric: "Pricing", you: yourScores.pricing, market: Math.round(avgComp.pricing) },
      { metric: "Customer Sat", you: yourScores.customerSat, market: Math.round(avgComp.customerSat) },
      { metric: "Funding", you: yourScores.funding, market: Math.round(avgComp.funding) }
    ];
  };

  // Chart 2: Market Share Distribution
  const getMarketShareData = () => {
    const yourShare = { name: "You", value: yourScores.marketShare };
    const compShares = competitors.map(c => ({ name: c.name.substring(0, 12), value: c.marketShare }));
    const othersShare = Math.max(0, 100 - yourScores.marketShare - competitors.reduce((s, c) => s + c.marketShare, 0));
    
    return [...[yourShare], ...compShares, { name: "Others", value: othersShare }].filter(d => d.value > 0);
  };

  // Chart 3: Innovation vs Market Share Scatter
  const getInnovationScatter = () => {
    const yourData = { x: yourScores.marketShare, y: yourScores.innovation, name: "You", isYou: true };
    const compData = competitors.map(c => ({ x: c.marketShare, y: c.innovation, name: c.name.substring(0, 10), isYou: false }));
    return [yourData, ...compData];
  };

  // Chart 4: Competitive Scoring Comparison
  const getScoringComparison = () => {
    return competitors.slice(0, 5).map(c => ({
      name: c.name.substring(0, 12),
      innovation: c.innovation,
      pricing: c.pricing,
      customerSat: c.customerSat,
      yourAvg: Math.round((yourScores.innovation + yourScores.pricing + yourScores.customerSat) / 3)
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('competitorBenchData');
    if (s) {
      const data = JSON.parse(s);
      setYourScores(data.yourScores || yourScores);
      setCompetitors(data.competitors || []);
    }
    const f = localStorage.getItem('competitorBenchFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('competitorBenchDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: advantageScore, grade, advantages } = getCompetitiveAdvantage();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Competitive Positioning</h1>
          <p className="text-muted-foreground mb-6">Benchmark against competitors for innovation criterion (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="competitor-bench" toolName="Competitive Positioning" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, yourScores, competitors, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Advantage Score</span>
              </div>
              <p className="text-3xl font-bold">{advantageScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Advantages</span>
              </div>
              <p className="text-3xl font-bold">{advantages}/3</p>
              <p className="text-xs text-muted-foreground mt-1">vs competitors</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Market Share</span>
              </div>
              <p className="text-3xl font-bold">{yourScores.marketShare}%</p>
              <p className="text-xs text-muted-foreground mt-1">Current position</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Innovation</span>
              </div>
              <p className="text-3xl font-bold">{yourScores.innovation}</p>
              <p className="text-xs text-muted-foreground mt-1">Your score /100</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Competitive Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getCompetitiveRadar()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="You" dataKey="you" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Radar name="Market Avg" dataKey="market" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Share Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getMarketShareData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Market Share %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Market Share">
                    {getMarketShareData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "You" ? '#ffa536' : COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Innovation vs Market Share</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Market Share" unit="%" label={{ value: 'Market Share %', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="y" name="Innovation" label={{ value: 'Innovation Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">Innovation: {data.y}</p>
                          <p className="text-sm">Market Share: {data.x}%</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Scatter name="Competitors" data={getInnovationScatter()}>
                    {getInnovationScatter().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isYou ? '#ffa536' : '#11b6e9'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Competitive Scoring (Top 5)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getScoringComparison()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="innovation" fill="#ffa536" name="Innovation" />
                  <Bar dataKey="pricing" fill="#11b6e9" name="Pricing" />
                  <Bar dataKey="customerSat" fill="#10b981" name="Customer Sat" />
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
            <h3 className="font-semibold mb-4">Your Positioning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Innovation Score: {yourScores.innovation}</label>
                <Slider value={[yourScores.innovation]} onValueChange={(v) => setYourScores({...yourScores, innovation: v[0]})} max={100} step={5} data-testid="slider-innovation" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Pricing Competitiveness: {yourScores.pricing}</label>
                <Slider value={[yourScores.pricing]} onValueChange={(v) => setYourScores({...yourScores, pricing: v[0]})} max={100} step={5} data-testid="slider-pricing" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Customer Satisfaction: {yourScores.customerSat}</label>
                <Slider value={[yourScores.customerSat]} onValueChange={(v) => setYourScores({...yourScores, customerSat: v[0]})} max={100} step={5} data-testid="slider-satisfaction" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Market Share: {yourScores.marketShare}%</label>
                <Slider value={[yourScores.marketShare]} onValueChange={(v) => setYourScores({...yourScores, marketShare: v[0]})} max={50} step={1} data-testid="slider-market-share" />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Competitors</h3>
              <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                <Plus className="w-4 h-4 mr-1" /> Add Competitor
              </Button>
            </div>

            <div className="space-y-6">
              {competitors.map((comp) => (
                <Card key={comp.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Input value={comp.name} onChange={(e) => updateCompetitor(comp.id, 'name', e.target.value)} placeholder="Competitor Name" className="max-w-xs" data-testid={`input-name-${comp.id}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeCompetitor(comp.id)} data-testid={`button-remove-${comp.id}`}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium block mb-2">Innovation: {comp.innovation}</label>
                      <Slider value={[comp.innovation]} onValueChange={(v) => updateCompetitor(comp.id, 'innovation', v[0])} max={100} step={5} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-2">Pricing: {comp.pricing}</label>
                      <Slider value={[comp.pricing]} onValueChange={(v) => updateCompetitor(comp.id, 'pricing', v[0])} max={100} step={5} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-2">Customer Sat: {comp.customerSat}</label>
                      <Slider value={[comp.customerSat]} onValueChange={(v) => updateCompetitor(comp.id, 'customerSat', v[0])} max={100} step={5} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-2">Market Share: {comp.marketShare}%</label>
                      <Slider value={[comp.marketShare]} onValueChange={(v) => updateCompetitor(comp.id, 'marketShare', v[0])} max={50} step={1} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-2">Funding: {comp.funding}</label>
                      <Slider value={[comp.funding]} onValueChange={(v) => updateCompetitor(comp.id, 'funding', v[0])} max={100} step={5} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Key Weaknesses</label>
                    <Textarea value={comp.weaknesses} onChange={(e) => updateCompetitor(comp.id, 'weaknesses', e.target.value)} placeholder="What are their weaknesses..." rows={2} data-testid={`textarea-weaknesses-${comp.id}`} />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Competitive Analysis</h3>
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
