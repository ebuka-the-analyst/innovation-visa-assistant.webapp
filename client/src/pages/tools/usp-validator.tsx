import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Target, Shield, Star, AlertCircle, Award, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Strong USP demonstrates unique innovative approach
// Scalability Criterion: Defensible USP enables sustainable competitive advantage

export default function USPValidator() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [uspStatement, setUspStatement] = useState("Only AI platform offering real-time compliance monitoring for UK Innovator Founder visa applications");
  const [targetCustomer, setTargetCustomer] = useState("UK Innovator Founder visa applicants and immigration lawyers");
  const [keyDifferentiators, setKeyDifferentiators] = useState("Real-time updates, 100% GOV.UK accuracy, AI-powered predictions");
  const [scores, setScores] = useState({ uniqueness: 75, relevance: 80, defensibility: 70, clarity: 75 });

  const saveProgress = () => {
    localStorage.setItem('uspFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('uspData', JSON.stringify({ uspStatement, targetCustomer, keyDifferentiators, scores }));
    localStorage.setItem('uspDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getUSPStrength = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.uniqueness + scores.relevance + scores.defensibility + scores.clarity) / 4);
    let grade = 'F - Weak';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Good';
    else if (avgScore >= 55) grade = 'D - Fair';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getUSPStrength();
    const content = `UK INNOVATOR FOUNDER VISA - USP VALIDATOR
Generated: ${new Date().toLocaleDateString()}

USP Strength: ${score}% (${grade})

USP STATEMENT:
${uspStatement}

TARGET CUSTOMER:
${targetCustomer}

KEY DIFFERENTIATORS:
${keyDifferentiators}

USP ASSESSMENT:
Uniqueness: ${scores.uniqueness}/100
Customer Relevance: ${scores.relevance}/100
Defensibility: ${scores.defensibility}/100
Message Clarity: ${scores.clarity}/100

INNOVATOR FOUNDER VISA CONTEXT:
Innovation: ${scores.uniqueness >= 75 ? `Strong uniqueness (${scores.uniqueness}) demonstrates innovative approach` : 'Uniqueness needs strengthening for innovation criterion'}
Scalability: ${scores.defensibility >= 70 ? 'Defensible USP enables sustainable competitive advantage' : 'Defensibility requires improvement for scaling'}

${score >= 75 ? '✅ Strong USP supports innovation and scalability criteria' : '⚠️ USP needs strengthening'}

Formula: USP Strength = Avg(Uniqueness + Relevance + Defensibility + Clarity)
GOV.UK: Innovator Founder Visa innovation criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-usp-validation.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.uniqueness < 70) tips.push("🚨 Uniqueness <70 - strengthen differentiators for innovation criterion");
    if (scores.relevance < 70) tips.push("⚠️ Customer relevance low - validate with target audience");
    if (scores.defensibility < 65) tips.push("📊 Defensibility weak - create barriers to entry");
    if (scores.clarity < 70) tips.push("💡 Message clarity needs improvement for market communication");
    const { score } = getUSPStrength();
    if (score >= 80) tips.push("✅ Strong USP supports competitive positioning");
    return tips.length ? tips : ["✅ USP is strong"];
  };

  const getRadarData = () => [
    { metric: "Uniqueness", score: scores.uniqueness, target: 75 },
    { metric: "Relevance", score: scores.relevance, target: 75 },
    { metric: "Defensibility", score: scores.defensibility, target: 75 },
    { metric: "Clarity", score: scores.clarity, target: 75 }
  ];

  const getCompetitivePosition = () => Object.entries(scores).map(([key, value]) => ({
    dimension: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  }));

  const getDifferentiatorStrength = () => {
    const diffs = keyDifferentiators.split(',').slice(0, 4);
    return diffs.map((diff, i) => ({
      differentiator: diff.trim().substring(0, 20) + (diff.length > 20 ? '...' : ''),
      strength: scores.uniqueness - (i * 5)
    }));
  };

  const getUSPComponents = () => [
    { component: "Unique Value", weight: 40 },
    { component: "Customer Fit", weight: 30 },
    { component: "Defensibility", weight: 20 },
    { component: "Clarity", weight: 10 }
  ];

  useEffect(() => {
    const s = localStorage.getItem('uspData');
    if (s) {
      const data = JSON.parse(s);
      setUspStatement(data.uspStatement || "");
      setTargetCustomer(data.targetCustomer || "");
      setKeyDifferentiators(data.keyDifferentiators || "");
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('uspFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('uspDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: uspScore, grade } = getUSPStrength();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">USP Validator</h1>
          <p className="text-muted-foreground mb-6">Validate unique selling proposition (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="usp-validator" toolName="USP Validator" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, uspStatement, targetCustomer, keyDifferentiators, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">USP Strength</span>
              </div>
              <p className="text-3xl font-bold">{uspScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Uniqueness</span>
              </div>
              <p className="text-3xl font-bold">{scores.uniqueness}</p>
              <p className="text-xs text-muted-foreground mt-1">Innovation</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Relevance</span>
              </div>
              <p className="text-3xl font-bold">{scores.relevance}</p>
              <p className="text-xs text-muted-foreground mt-1">Customer fit</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Defensibility</span>
              </div>
              <p className="text-3xl font-bold">{scores.defensibility}</p>
              <p className="text-xs text-muted-foreground mt-1">Barrier to entry</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">USP Strength Radar</h3>
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
              <h3 className="font-semibold mb-4">Competitive Position</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCompetitivePosition()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536">
                    {getCompetitivePosition().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Differentiator Strength</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getDifferentiatorStrength()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="differentiator" width={120} />
                  <Tooltip />
                  <Bar dataKey="strength" fill="#ffa536" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">USP Components</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getUSPComponents()} dataKey="weight" nameKey="component" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.weight}%`}>
                    {getUSPComponents().map((entry, index) => (
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
            <h3 className="font-semibold mb-4">USP Definition</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">USP Statement</label>
                <Textarea value={uspStatement} onChange={(e) => setUspStatement(e.target.value)} placeholder="Your unique selling proposition in one sentence..." rows={3} data-testid="textarea-usp" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Target Customer</label>
                <Textarea value={targetCustomer} onChange={(e) => setTargetCustomer(e.target.value)} placeholder="Who is your ideal customer..." rows={2} data-testid="textarea-customer" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Key Differentiators (comma-separated)</label>
                <Textarea value={keyDifferentiators} onChange={(e) => setKeyDifferentiators(e.target.value)} placeholder="What makes you unique..." rows={3} data-testid="textarea-differentiators" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">USP Assessment</h4>
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
            <h3 className="font-semibold mb-4">Upload Positioning Materials</h3>
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
