import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Target, DollarSign, Users, AlertCircle, Award, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation + Viability + Scalability = Complete business model assessment

export default function BusinessModelValidator() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [valueProps, setValueProps] = useState("Solve customer pain points with innovative AI-powered solution");
  const [revenueStreams, setRevenueStreams] = useState("SaaS subscriptions, Enterprise licenses, API access");
  const [customerSegments, setCustomerSegments] = useState("SMBs, Mid-market, Enterprise");
  const [channels, setChannels] = useState("Direct sales, Partners, Online marketing");
  const [scores, setScores] = useState({ innovation: 75, viability: 70, scalability: 80, differentiation: 75, marketFit: 70 });

  const saveProgress = () => {
    localStorage.setItem('businessModelFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('businessModelData', JSON.stringify({ valueProps, revenueStreams, customerSegments, channels, scores }));
    localStorage.setItem('businessModelDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getBusinessModelScore = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.innovation + scores.viability + scores.scalability + scores.differentiation + scores.marketFit) / 5);
    let grade = 'F - Weak';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Good';
    else if (avgScore >= 55) grade = 'D - Developing';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getBusinessModelScore();
    const content = `UK INNOVATOR FOUNDER VISA - BUSINESS MODEL CANVAS
Generated: ${new Date().toLocaleDateString()}

Overall Score: ${score}% (${grade})

VALUE PROPOSITION:
${valueProps}

REVENUE STREAMS:
${revenueStreams}

CUSTOMER SEGMENTS:
${customerSegments}

CHANNELS:
${channels}

ASSESSMENT SCORES:
Innovation: ${scores.innovation}/100
Viability: ${scores.viability}/100
Scalability: ${scores.scalability}/100
Differentiation: ${scores.differentiation}/100
Market Fit: ${scores.marketFit}/100

INNOVATOR FOUNDER VISA CONTEXT:
Innovation: ${scores.innovation >= 75 ? 'Strong innovation score supports visa criterion' : 'Innovation needs strengthening'}
Viability: ${scores.viability >= 70 ? 'Business model demonstrates viability' : 'Viability requires improvement'}
Scalability: ${scores.scalability >= 75 ? 'Scalable business model' : 'Scaling challenges identified'}

Formula: Overall Score = Avg(Innovation + Viability + Scalability + Differentiation + Market Fit)
GOV.UK: Innovator Founder Visa criteria (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-business-model.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.innovation < 70) tips.push("🚨 Innovation score <70 - strengthen innovative elements for visa criterion");
    if (scores.viability < 65) tips.push("⚠️ Viability score needs improvement for business sustainability");
    if (scores.scalability < 70) tips.push("📊 Scalability concerns - address growth barriers");
    if (scores.marketFit < 65) tips.push("💡 Product-market fit requires validation");
    const { score } = getBusinessModelScore();
    if (score >= 80) tips.push("✅ Strong business model supports all visa criteria");
    return tips.length ? tips : ["✅ Business model is solid"];
  };

  const getRadarData = () => [
    { metric: "Innovation", score: scores.innovation, target: 75 },
    { metric: "Viability", score: scores.viability, target: 75 },
    { metric: "Scalability", score: scores.scalability, target: 75 },
    { metric: "Differentiation", score: scores.differentiation, target: 75 },
    { metric: "Market Fit", score: scores.marketFit, target: 75 }
  ];

  const getScoreBreakdown = () => Object.entries(scores).map(([key, value]) => ({
    component: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  const getVisaCriteriaAlignment = () => [
    { criterion: "Innovation", score: scores.innovation },
    { criterion: "Viability", score: scores.viability },
    { criterion: "Scalability", score: scores.scalability }
  ];

  const getStrengthDistribution = () => {
    const strong = Object.values(scores).filter(s => s >= 75).length;
    const moderate = Object.values(scores).filter(s => s >= 60 && s < 75).length;
    const weak = Object.values(scores).filter(s => s < 60).length;
    return [
      { level: "Strong (75+)", count: strong },
      { level: "Moderate (60-74)", count: moderate },
      { level: "Weak (<60)", count: weak }
    ].filter(d => d.count > 0);
  };

  useEffect(() => {
    const s = localStorage.getItem('businessModelData');
    if (s) {
      const data = JSON.parse(s);
      setValueProps(data.valueProps || "");
      setRevenueStreams(data.revenueStreams || "");
      setCustomerSegments(data.customerSegments || "");
      setChannels(data.channels || "");
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('businessModelFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('businessModelDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: overallScore, grade } = getBusinessModelScore();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Business Model Canvas</h1>
          <p className="text-muted-foreground mb-6">Validate business model for visa criteria (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="business-model-validator" toolName="Business Model Canvas" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, valueProps, revenueStreams, customerSegments, channels, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Overall Score</span>
              </div>
              <p className="text-3xl font-bold">{overallScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Innovation</span>
              </div>
              <p className="text-3xl font-bold">{scores.innovation}</p>
              <p className="text-xs text-muted-foreground mt-1">Visa criterion</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Viability</span>
              </div>
              <p className="text-3xl font-bold">{scores.viability}</p>
              <p className="text-xs text-muted-foreground mt-1">Visa criterion</p>
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
              <h3 className="font-semibold mb-4">Business Model Radar</h3>
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
                <BarChart data={getScoreBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="component" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Visa Criteria Alignment</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getVisaCriteriaAlignment()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="criterion" />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536">
                    {getVisaCriteriaAlignment().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Strength Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getStrengthDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getStrengthDistribution().map((entry, index) => (
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
            <h3 className="font-semibold mb-4">Business Model Canvas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Value Propositions</label>
                <Textarea value={valueProps} onChange={(e) => setValueProps(e.target.value)} placeholder="How do you create value..." rows={3} data-testid="textarea-value-props" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Revenue Streams</label>
                <Textarea value={revenueStreams} onChange={(e) => setRevenueStreams(e.target.value)} placeholder="How do you make money..." rows={3} data-testid="textarea-revenue" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Customer Segments</label>
                <Textarea value={customerSegments} onChange={(e) => setCustomerSegments(e.target.value)} placeholder="Who are your customers..." rows={3} data-testid="textarea-customers" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Channels</label>
                <Textarea value={channels} onChange={(e) => setChannels(e.target.value)} placeholder="How do you reach customers..." rows={3} data-testid="textarea-channels" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">Assessment Scores</h4>
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
            <h3 className="font-semibold mb-4">Upload Business Model Documents</h3>
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
