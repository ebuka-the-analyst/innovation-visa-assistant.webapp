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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: International expansion demonstrates growth potential
// Innovation Criterion: Novel market entry approach

export default function MarketEntryPlan() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [targetMarket, setTargetMarket] = useState("United States");
  const [entryStrategy, setEntryStrategy] = useState("Direct sales with local partnerships");
  const [regulatoryBarriers, setRegulatoryBarriers] = useState("FDA compliance, state licensing");
  const [localizationPlan, setLocalizationPlan] = useState("English only, USD pricing, US support hours");
  const [investmentRequired, setInvestmentRequired] = useState(250000);
  const [scores, setScores] = useState({ marketFit: 75, regulatory: 70, competition: 65, resources: 70, timing: 75 });

  const saveProgress = () => {
    localStorage.setItem('marketEntryFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('marketEntryData', JSON.stringify({ targetMarket, entryStrategy, regulatoryBarriers, localizationPlan, investmentRequired, scores }));
    localStorage.setItem('marketEntryDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getEntryReadiness = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.marketFit + scores.regulatory + scores.competition + scores.resources + scores.timing) / 5);
    let grade = 'F - Not Ready';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Ready';
    else if (avgScore >= 65) grade = 'C - Prepared';
    else if (avgScore >= 55) grade = 'D - Developing';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getEntryReadiness();
    const content = `UK INNOVATOR FOUNDER VISA - MARKET ENTRY PLAN
Generated: ${new Date().toLocaleDateString()}

Entry Readiness: ${score}% (${grade})

TARGET MARKET:
${targetMarket}

ENTRY STRATEGY:
${entryStrategy}

REGULATORY BARRIERS:
${regulatoryBarriers}

LOCALIZATION PLAN:
${localizationPlan}

INVESTMENT REQUIRED:
£${investmentRequired.toLocaleString()}

READINESS SCORES:
Market Fit: ${scores.marketFit}/100
Regulatory Preparedness: ${scores.regulatory}/100
Competitive Position: ${scores.competition}/100
Resource Availability: ${scores.resources}/100
Market Timing: ${scores.timing}/100

INNOVATOR FOUNDER VISA CONTEXT:
Scalability: ${score >= 70 ? `International expansion readiness (${score}%) demonstrates scaling capability` : 'Market entry plan requires strengthening for scalability criterion'}
Innovation: ${scores.marketFit >= 75 ? 'Strong product-market fit supports innovation criterion' : 'Product-market fit validation needed'}

Formula: Entry Readiness = Avg(Market Fit + Regulatory + Competition + Resources + Timing)
GOV.UK: Innovator Founder Visa scalability criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-market-entry.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.regulatory < 70) tips.push("🚨 Regulatory score <70 - address compliance gaps before market entry");
    if (scores.marketFit < 65) tips.push("⚠️ Market fit uncertain - conduct validation research");
    if (investmentRequired > 500000) tips.push("💰 High investment (>£500k) - ensure funding secured");
    if (scores.timing < 65) tips.push("📊 Market timing concerns - assess competitive window");
    const { score } = getEntryReadiness();
    if (score >= 80) tips.push("✅ Strong market entry readiness supports scaling narrative");
    return tips.length ? tips : ["✅ Market entry plan is solid"];
  };

  const getRadarData = () => [
    { metric: "Market Fit", score: scores.marketFit, target: 75 },
    { metric: "Regulatory", score: scores.regulatory, target: 75 },
    { metric: "Competition", score: scores.competition, target: 75 },
    { metric: "Resources", score: scores.resources, target: 75 },
    { metric: "Timing", score: scores.timing, target: 75 }
  ];

  const getPhaseTimeline = () => [
    { phase: "Q1", planning: 80, execution: 20 },
    { phase: "Q2", planning: 40, execution: 50 },
    { phase: "Q3", planning: 20, execution: 80 },
    { phase: "Q4", planning: 10, execution: 95 }
  ];

  const getRiskProfile = () => [
    { risk: "Regulatory", level: 100 - scores.regulatory },
    { risk: "Competition", level: 100 - scores.competition },
    { risk: "Resources", level: 100 - scores.resources },
    { risk: "Timing", level: 100 - scores.timing }
  ];

  const getInvestmentBreakdown = () => [
    { category: "Team Hiring", amount: investmentRequired * 0.4 },
    { category: "Marketing", amount: investmentRequired * 0.3 },
    { category: "Legal/Compliance", amount: investmentRequired * 0.2 },
    { category: "Infrastructure", amount: investmentRequired * 0.1 }
  ];

  useEffect(() => {
    const s = localStorage.getItem('marketEntryData');
    if (s) {
      const data = JSON.parse(s);
      setTargetMarket(data.targetMarket || "United States");
      setEntryStrategy(data.entryStrategy || "");
      setRegulatoryBarriers(data.regulatoryBarriers || "");
      setLocalizationPlan(data.localizationPlan || "");
      setInvestmentRequired(data.investmentRequired || 250000);
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('marketEntryFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('marketEntryDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: readinessScore, grade } = getEntryReadiness();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Market Entry Plan</h1>
          <p className="text-muted-foreground mb-6">Plan international expansion (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="market-entry-plan" toolName="Market Entry Plan" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, targetMarket, entryStrategy, regulatoryBarriers, localizationPlan, investmentRequired, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Entry Readiness</span>
              </div>
              <p className="text-3xl font-bold">{readinessScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Target Market</span>
              </div>
              <p className="text-lg font-bold truncate">{targetMarket}</p>
              <p className="text-xs text-muted-foreground mt-1">Primary focus</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Market Fit</span>
              </div>
              <p className="text-3xl font-bold">{scores.marketFit}</p>
              <p className="text-xs text-muted-foreground mt-1">Product-market</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Investment</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(investmentRequired / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Required</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Entry Readiness Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Execution Timeline</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPhaseTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planning" fill="#11b6e9" name="Planning" stackId="a" />
                  <Bar dataKey="execution" fill="#10b981" name="Execution" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Risk Profile</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getRiskProfile()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="risk" width={100} />
                  <Tooltip />
                  <Bar dataKey="level" fill="#ef4444" name="Risk Level">
                    {getRiskProfile().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.level < 30 ? '#10b981' : entry.level < 50 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Investment Allocation</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getInvestmentBreakdown()} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(entry) => `£${Math.round(entry.amount / 1000)}k`}>
                    {getInvestmentBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
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
            <h3 className="font-semibold mb-4">Market Entry Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Target Market</label>
                <Select value={targetMarket} onValueChange={setTargetMarket}>
                  <SelectTrigger data-testid="select-market">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="European Union">European Union</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Investment Required (£)</label>
                <Input type="number" value={investmentRequired} onChange={(e) => setInvestmentRequired(Number(e.target.value))} data-testid="input-investment" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Entry Strategy</label>
                <Textarea value={entryStrategy} onChange={(e) => setEntryStrategy(e.target.value)} placeholder="Direct sales, partnerships, acquisition..." rows={3} data-testid="textarea-strategy" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Regulatory Barriers</label>
                <Textarea value={regulatoryBarriers} onChange={(e) => setRegulatoryBarriers(e.target.value)} placeholder="Compliance requirements, licenses..." rows={3} data-testid="textarea-regulatory" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Localization Plan</label>
                <Textarea value={localizationPlan} onChange={(e) => setLocalizationPlan(e.target.value)} placeholder="Language, currency, local support..." rows={3} data-testid="textarea-localization" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">Readiness Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-2">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: {value}</label>
                  <Slider value={[value]} onValueChange={(v) => setScores({...scores, [key]: v[0]})} max={100} step={5} data-testid={`slider-${key}`} />
                </div>
              ))}
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
