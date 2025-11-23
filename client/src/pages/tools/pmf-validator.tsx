import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Users, Heart, TrendingUp, AlertCircle, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Strong PMF validates innovative solution
// Viability Criterion: Customer validation demonstrates business sustainability

export default function CustomerValidation() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState("40% say they'd be 'very disappointed' if product disappeared");
  const [nps, setNps] = useState(45);
  const [retentionRate, setRetentionRate] = useState(85);
  const [referralRate, setReferralRate] = useState(30);
  const [scores, setScores] = useState({ problemFit: 75, solutionFit: 70, channels: 65, retention: 80, willingness: 75 });

  const saveProgress = () => {
    localStorage.setItem('pmfFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('pmfData', JSON.stringify({ customerFeedback, nps, retentionRate, referralRate, scores }));
    localStorage.setItem('pmfDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getPMFScore = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.problemFit + scores.solutionFit + scores.channels + scores.retention + scores.willingness) / 5);
    let grade = 'F - No PMF';
    if (avgScore >= 85) grade = 'A - Strong PMF';
    else if (avgScore >= 75) grade = 'B - Good PMF';
    else if (avgScore >= 65) grade = 'C - Emerging PMF';
    else if (avgScore >= 55) grade = 'D - Weak PMF';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getPMFScore();
    const content = `UK INNOVATOR FOUNDER VISA - CUSTOMER VALIDATION (PMF)
Generated: ${new Date().toLocaleDateString()}

Product-Market Fit: ${score}% (${grade})

CUSTOMER FEEDBACK:
${customerFeedback}

PMF METRICS:
Net Promoter Score (NPS): ${nps}
Retention Rate: ${retentionRate}%
Referral Rate: ${referralRate}%

PMF ASSESSMENT SCORES:
Problem-Solution Fit: ${scores.problemFit}/100
Solution Quality: ${scores.solutionFit}/100
Channel Effectiveness: ${scores.channels}/100
Customer Retention: ${scores.retention}/100
Willingness to Pay: ${scores.willingness}/100

INNOVATOR FOUNDER VISA CONTEXT:
Innovation: ${scores.problemFit >= 75 ? 'Strong problem-solution fit validates innovative approach' : 'Problem-solution fit needs validation'}
Viability: ${scores.retention >= 75 ? `High retention (${scores.retention}%) demonstrates sustainable customer base` : 'Customer retention requires improvement for viability'}

${score >= 75 ? '✅ Strong PMF supports innovation and viability criteria' : '⚠️ PMF validation needs strengthening'}

Formula: PMF Score = Avg(Problem Fit + Solution Fit + Channels + Retention + Willingness to Pay)
Benchmark: 40% "very disappointed" = strong PMF (Sean Ellis test)
GOV.UK: Innovator Founder Visa innovation criterion (November 2025)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-customer-validation.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.problemFit < 70) tips.push("🚨 Problem-solution fit <70 - validate customer pain points");
    if (retentionRate < 70) tips.push("⚠️ Retention <70% - address churn drivers");
    if (nps < 30) tips.push("📊 NPS <30 - improve customer satisfaction");
    if (scores.willingness < 70) tips.push("💡 Low willingness to pay - strengthen value proposition");
    const { score } = getPMFScore();
    if (score >= 80) tips.push("✅ Strong PMF validates product-market fit for visa assessment");
    return tips.length ? tips : ["✅ Product-market fit is strong"];
  };

  const getRadarData = () => [
    { metric: "Problem Fit", score: scores.problemFit, target: 75 },
    { metric: "Solution Fit", score: scores.solutionFit, target: 75 },
    { metric: "Channels", score: scores.channels, target: 75 },
    { metric: "Retention", score: scores.retention, target: 75 },
    { metric: "Willingness", score: scores.willingness, target: 75 }
  ];

  const getRetentionCohort = () => {
    const months = [1, 2, 3, 4, 5, 6];
    return months.map(month => ({
      month: `M${month}`,
      retention: Math.max(0, retentionRate - (month - 1) * 5),
      target: 70
    }));
  };

  const getNPSDistribution = () => {
    const promoters = Math.round(nps * 0.6);
    const passives = Math.round((100 - nps) * 0.4);
    const detractors = 100 - promoters - passives;
    
    return [
      { category: "Promoters (9-10)", count: promoters },
      { category: "Passives (7-8)", count: passives },
      { category: "Detractors (0-6)", count: detractors }
    ];
  };

  const getCustomerJourney = () => [
    { stage: "Awareness", score: scores.channels },
    { stage: "Consideration", score: scores.problemFit },
    { stage: "Purchase", score: scores.willingness },
    { stage: "Retention", score: scores.retention },
    { stage: "Advocacy", score: referralRate }
  ];

  useEffect(() => {
    const s = localStorage.getItem('pmfData');
    if (s) {
      const data = JSON.parse(s);
      setCustomerFeedback(data.customerFeedback || "");
      setNps(data.nps || 45);
      setRetentionRate(data.retentionRate || 85);
      setReferralRate(data.referralRate || 30);
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('pmfFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('pmfDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: pmfScore, grade } = getPMFScore();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Customer Validation</h1>
          <p className="text-muted-foreground mb-6">Validate product-market fit (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="pmf-validator" toolName="Customer Validation" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, customerFeedback, nps, retentionRate, referralRate, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">PMF Score</span>
              </div>
              <p className="text-3xl font-bold">{pmfScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">NPS</span>
              </div>
              <p className="text-3xl font-bold">{nps}</p>
              <p className="text-xs text-muted-foreground mt-1">Net Promoter</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Retention</span>
              </div>
              <p className="text-3xl font-bold">{retentionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Customer loyalty</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Referral Rate</span>
              </div>
              <p className="text-3xl font-bold">{referralRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Word of mouth</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Product-Market Fit Radar</h3>
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
              <h3 className="font-semibold mb-4">Retention Cohort</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getRetentionCohort()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="retention" stroke="#ffa536" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">NPS Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getNPSDistribution()} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.count}%`}>
                    {getNPSDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Customer Journey</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCustomerJourney()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536">
                    {getCustomerJourney().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#ffa536' : '#ef4444'} />
                    ))}
                  </Bar>
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
            <h3 className="font-semibold mb-4">PMF Validation Inputs</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Customer Feedback (Sean Ellis Test)</label>
                <Textarea value={customerFeedback} onChange={(e) => setCustomerFeedback(e.target.value)} placeholder="% who would be 'very disappointed' if product disappeared..." rows={3} data-testid="textarea-feedback" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Net Promoter Score (NPS): {nps}</label>
                <Slider value={[nps]} onValueChange={(v) => setNps(v[0])} max={100} step={5} data-testid="slider-nps" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Retention Rate: {retentionRate}%</label>
                <Slider value={[retentionRate]} onValueChange={(v) => setRetentionRate(v[0])} max={100} step={5} data-testid="slider-retention" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Referral Rate: {referralRate}%</label>
                <Slider value={[referralRate]} onValueChange={(v) => setReferralRate(v[0])} max={100} step={5} data-testid="slider-referral" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">PMF Assessment Scores</h4>
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
            <h3 className="font-semibold mb-4">Upload Customer Research</h3>
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
