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
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Business must demonstrate sustainable revenue model
// ALL 3 Criteria: Innovation + Viability + Scalability assessment

export default function BusinessViabilityScorecard() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [currentRevenue, setCurrentRevenue] = useState(150000);
  const [monthlyBurn, setMonthlyBurn] = useState(12000);
  const [runway, setRunway] = useState(18);
  const [scores, setScores] = useState({ innovation: 75, viability: 70, scalability: 80, market: 75, execution: 70 });

  const saveProgress = () => {
    localStorage.setItem('viabilityFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('viabilityData', JSON.stringify({ currentRevenue, monthlyBurn, runway, scores }));
    localStorage.setItem('viabilityDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getViabilityScore = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.innovation + scores.viability + scores.scalability + scores.market + scores.execution) / 5);
    let grade = 'F - Not Viable';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Viable';
    else if (avgScore >= 55) grade = 'D - Developing';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getViabilityScore();
    const burnMonths = currentRevenue / monthlyBurn;
    
    const content = `UK INNOVATOR FOUNDER VISA - BUSINESS VIABILITY SCORECARD
Generated: ${new Date().toLocaleDateString()}

Overall Viability: ${score}% (${grade})

FINANCIAL METRICS:
Current Revenue: £${currentRevenue.toLocaleString()}
Monthly Burn: £${monthlyBurn.toLocaleString()}
Runway: ${runway} months
Burn Coverage: ${burnMonths.toFixed(1)} months

VISA CRITERIA ASSESSMENT:
Innovation: ${scores.innovation}/100
Viability: ${scores.viability}/100
Scalability: ${scores.scalability}/100
Market Opportunity: ${scores.market}/100
Execution Capability: ${scores.execution}/100

INNOVATOR FOUNDER VISA CONTEXT:
Innovation: ${scores.innovation >= 75 ? 'Strong innovation score supports visa criterion' : 'Innovation needs strengthening'}
Viability: ${scores.viability >= 70 ? 'Business model demonstrates viability' : 'Viability requires improvement'}
Scalability: ${scores.scalability >= 75 ? 'Scalable business model' : 'Scaling challenges identified'}

${score >= 75 ? '✅ Business demonstrates strong viability for visa assessment' : '⚠️ Viability scorecard requires improvement'}

Formula: Overall Viability = Avg(Innovation + Viability + Scalability + Market + Execution)
GOV.UK: Innovator Founder Visa viability criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-viability-scorecard.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    const burnMonths = currentRevenue / monthlyBurn;
    
    if (scores.viability < 70) tips.push("🚨 Viability score <70 - critical for visa criterion");
    if (burnMonths < 12) tips.push("⚠️ Runway <12 months - address cash flow urgently");
    if (scores.innovation < 70) tips.push("📊 Innovation score needs improvement");
    if (scores.scalability < 70) tips.push("💡 Scalability concerns - strengthen growth plan");
    
    const { score } = getViabilityScore();
    if (score >= 80) tips.push("✅ Strong viability scorecard supports all visa criteria");
    
    return tips.length ? tips : ["✅ Business viability is strong"];
  };

  const getRadarData = () => [
    { metric: "Innovation", score: scores.innovation, target: 75 },
    { metric: "Viability", score: scores.viability, target: 75 },
    { metric: "Scalability", score: scores.scalability, target: 75 },
    { metric: "Market", score: scores.market, target: 75 },
    { metric: "Execution", score: scores.execution, target: 75 }
  ];

  const getVisaCriteriaBreakdown = () => [
    { criterion: "Innovation", score: scores.innovation },
    { criterion: "Viability", score: scores.viability },
    { criterion: "Scalability", score: scores.scalability }
  ];

  const getRunwayProjection = () => {
    const months = Array.from({ length: Math.min(runway, 24) }, (_, i) => i + 1);
    return months.map(month => ({
      month: `M${month}`,
      cash: Math.max(0, currentRevenue - (monthlyBurn * month)),
      burn: monthlyBurn * month
    }));
  };

  const getScoreDistribution = () => {
    const excellent = Object.values(scores).filter(s => s >= 80).length;
    const good = Object.values(scores).filter(s => s >= 70 && s < 80).length;
    const fair = Object.values(scores).filter(s => s >= 60 && s < 70).length;
    const poor = Object.values(scores).filter(s => s < 60).length;
    
    return [
      { level: "Excellent (80+)", count: excellent },
      { level: "Good (70-79)", count: good },
      { level: "Fair (60-69)", count: fair },
      { level: "Poor (<60)", count: poor }
    ].filter(d => d.count > 0);
  };

  useEffect(() => {
    const s = localStorage.getItem('viabilityData');
    if (s) {
      const data = JSON.parse(s);
      setCurrentRevenue(data.currentRevenue || 150000);
      setMonthlyBurn(data.monthlyBurn || 12000);
      setRunway(data.runway || 18);
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('viabilityFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('viabilityDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: viabilityScore, grade } = getViabilityScore();
  const burnMonths = currentRevenue / monthlyBurn;
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Business Viability Scorecard</h1>
          <p className="text-muted-foreground mb-6">Assess all 3 visa criteria (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="viability-checker" toolName="Business Viability Scorecard" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, currentRevenue, monthlyBurn, runway, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Viability Score</span>
              </div>
              <p className="text-3xl font-bold">{viabilityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(currentRevenue / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Annual</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Runway</span>
              </div>
              <p className="text-3xl font-bold">{Math.round(burnMonths)}mo</p>
              <p className="text-xs text-muted-foreground mt-1">Cash runway</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Burn Rate</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(monthlyBurn / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Per month</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Viability Radar</h3>
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
              <h3 className="font-semibold mb-4">Visa Criteria Assessment</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getVisaCriteriaBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="criterion" />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536">
                    {getVisaCriteriaBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Cash Runway Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getRunwayProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Cash £', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2} name="Available Cash" />
                  <Line type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Cumulative Burn" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getScoreDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getScoreDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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
            <h3 className="font-semibold mb-4">Financial Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Annual Revenue (£)</label>
                <Input type="number" value={currentRevenue} onChange={(e) => setCurrentRevenue(Number(e.target.value))} data-testid="input-revenue" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Monthly Burn (£)</label>
                <Input type="number" value={monthlyBurn} onChange={(e) => setMonthlyBurn(Number(e.target.value))} data-testid="input-burn" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Runway (months)</label>
                <Input type="number" value={runway} onChange={(e) => setRunway(Number(e.target.value))} data-testid="input-runway" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">Viability Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</label>
                  <Slider value={[value]} onValueChange={(v) => setScores({...scores, [key]: v[0]})} max={100} step={5} data-testid={`slider-${key}`} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Financial Documents</h3>
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
