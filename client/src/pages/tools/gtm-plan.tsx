import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Target, Users, TrendingUp, AlertCircle, Award, Rocket } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: GTM strategy demonstrates growth execution capability
// Viability Criterion: Clear customer acquisition plan supports business sustainability

export default function GoToMarketStrategy() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [targetMarket, setTargetMarket] = useState("SMB SaaS buyers in UK, US, EU markets");
  const [valueProposition, setValueProposition] = useState("10x faster workflow automation");
  const [channels, setChannels] = useState("Direct sales, Content marketing, Partners");
  const [pricing, setPricing] = useState("£99/mo starter, £299/mo pro, £999/mo enterprise");
  const [scores, setScores] = useState({ messaging: 75, channels: 70, positioning: 80, execution: 75, scalability: 70 });

  const saveProgress = () => {
    localStorage.setItem('gtmPlanFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('gtmPlanData', JSON.stringify({ targetMarket, valueProposition, channels, pricing, scores }));
    localStorage.setItem('gtmPlanDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getGTMReadiness = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.messaging + scores.channels + scores.positioning + scores.execution + scores.scalability) / 5);
    let grade = 'F - Unprepared';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Ready';
    else if (avgScore >= 55) grade = 'D - Developing';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getGTMReadiness();
    const content = `UK INNOVATOR FOUNDER VISA - GO-TO-MARKET STRATEGY
Generated: ${new Date().toLocaleDateString()}

GTM Readiness: ${score}% (${grade})

TARGET MARKET:
${targetMarket}

VALUE PROPOSITION:
${valueProposition}

CHANNELS:
${channels}

PRICING STRATEGY:
${pricing}

GTM ASSESSMENT SCORES:
Messaging Clarity: ${scores.messaging}/100
Channel Strategy: ${scores.channels}/100
Market Positioning: ${scores.positioning}/100
Execution Plan: ${scores.execution}/100
Scalability: ${scores.scalability}/100

INNOVATOR FOUNDER VISA CONTEXT:
Scalability: ${scores.scalability >= 70 ? `Strong GTM scalability (${scores.scalability}) supports growth criterion` : 'GTM scalability needs strengthening'}
Viability: ${scores.execution >= 70 ? 'Clear execution plan demonstrates business viability' : 'Execution plan requires improvement'}
${score >= 75 ? '✅ GTM strategy supports visa criteria' : '⚠️ GTM strategy needs optimization'}

Formula: GTM Readiness = Avg(Messaging + Channels + Positioning + Execution + Scalability)
GOV.UK: Innovator Founder Visa scalability criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-gtm-strategy.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.scalability < 70) tips.push("🚨 Scalability score <70 - strengthen GTM scaling plan for visa criterion");
    if (scores.messaging < 65) tips.push("⚠️ Messaging clarity needs improvement for market penetration");
    if (scores.channels < 65) tips.push("📊 Channel strategy requires diversification");
    if (scores.execution < 70) tips.push("💡 Execution plan needs more detail for credibility");
    const { score } = getGTMReadiness();
    if (score >= 80) tips.push("✅ Strong GTM strategy supports scalability and viability criteria");
    return tips.length ? tips : ["✅ GTM strategy is solid"];
  };

  const getRadarData = () => [
    { metric: "Messaging", score: scores.messaging, target: 75 },
    { metric: "Channels", score: scores.channels, target: 75 },
    { metric: "Positioning", score: scores.positioning, target: 75 },
    { metric: "Execution", score: scores.execution, target: 75 },
    { metric: "Scalability", score: scores.scalability, target: 75 }
  ];

  const getComponentBreakdown = () => Object.entries(scores).map(([key, value]) => ({
    component: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  const getChannelAllocation = () => [
    { channel: "Direct Sales", allocation: 40 },
    { channel: "Content Marketing", allocation: 30 },
    { channel: "Partnerships", allocation: 20 },
    { channel: "Paid Ads", allocation: 10 }
  ];

  const getPhaseTimeline = () => [
    { phase: "Month 1-3", activities: 5, launched: 4 },
    { phase: "Month 4-6", activities: 8, launched: 6 },
    { phase: "Month 7-9", activities: 6, launched: 4 },
    { phase: "Month 10-12", activities: 10, launched: 7 }
  ];

  useEffect(() => {
    const s = localStorage.getItem('gtmPlanData');
    if (s) {
      const data = JSON.parse(s);
      setTargetMarket(data.targetMarket || "");
      setValueProposition(data.valueProposition || "");
      setChannels(data.channels || "");
      setPricing(data.pricing || "");
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('gtmPlanFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('gtmPlanDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: readinessScore, grade } = getGTMReadiness();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Go-to-Market Strategy</h1>
          <p className="text-muted-foreground mb-6">Build scalable GTM plan (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="gtm-plan" toolName="Go-to-Market Strategy" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, targetMarket, valueProposition, channels, pricing, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">GTM Readiness</span>
              </div>
              <p className="text-3xl font-bold">{readinessScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Positioning</span>
              </div>
              <p className="text-3xl font-bold">{scores.positioning}</p>
              <p className="text-xs text-muted-foreground mt-1">Market clarity</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Execution</span>
              </div>
              <p className="text-3xl font-bold">{scores.execution}</p>
              <p className="text-xs text-muted-foreground mt-1">Action readiness</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Scalability</span>
              </div>
              <p className="text-3xl font-bold">{scores.scalability}</p>
              <p className="text-xs text-muted-foreground mt-1">Visa criterion</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">GTM Strategy Radar</h3>
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
              <h3 className="font-semibold mb-4">Component Scores</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getComponentBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="component" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536">
                    {getComponentBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Channel Allocation</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getChannelAllocation()} dataKey="allocation" nameKey="channel" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.allocation}%`}>
                    {getChannelAllocation().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Execution Timeline</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getPhaseTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis label={{ value: 'Activities', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activities" fill="#11b6e9" name="Planned" />
                  <Bar dataKey="launched" fill="#10b981" name="Launched" />
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
            <h3 className="font-semibold mb-4">GTM Strategy Details</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Target Market</label>
                <Textarea value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Define your ideal customer segments..." rows={3} data-testid="textarea-market" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Value Proposition</label>
                <Textarea value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} placeholder="What unique value do you deliver..." rows={3} data-testid="textarea-value" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Distribution Channels</label>
                <Textarea value={channels} onChange={(e) => setChannels(e.target.value)} placeholder="How will you reach customers..." rows={3} data-testid="textarea-channels" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Pricing Strategy</label>
                <Textarea value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="Pricing tiers and packages..." rows={3} data-testid="textarea-pricing" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">Strategy Assessment</h4>
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
            <h3 className="font-semibold mb-4">Upload GTM Documentation</h3>
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
