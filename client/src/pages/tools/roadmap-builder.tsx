import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Rocket, Calendar, Target, AlertCircle, Award, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Product roadmap demonstrates continuous innovation
// Scalability Criterion: Clear growth plan supports scaling narrative

export default function ProductRoadmap() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [q1Milestones, setQ1Milestones] = useState("MVP launch, first 10 customers");
  const [q2Milestones, setQ2Milestones] = useState("Feature expansion, 50 customers");
  const [q3Milestones, setQ3Milestones] = useState("Enterprise features, 100 customers");
  const [q4Milestones, setQ4Milestones] = useState("International expansion, 250 customers");
  const [scores, setScores] = useState({ innovation: 75, feasibility: 70, impact: 80, alignment: 75 });

  const saveProgress = () => {
    localStorage.setItem('roadmapFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('roadmapData', JSON.stringify({ q1Milestones, q2Milestones, q3Milestones, q4Milestones, scores }));
    localStorage.setItem('roadmapDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const getRoadmapHealth = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.innovation + scores.feasibility + scores.impact + scores.alignment) / 4);
    let grade = 'F - Weak';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Good';
    else if (avgScore >= 55) grade = 'D - Fair';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getRoadmapHealth();
    const content = `UK INNOVATOR FOUNDER VISA - PRODUCT ROADMAP (12-MONTH)
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Roadmap Health Score: ${score}% (${grade})

Assessment Components:
  Innovation Strength: ${scores.innovation}/100
  Technical Feasibility: ${scores.feasibility}/100
  Business Impact: ${scores.impact}/100
  Strategic Alignment: ${scores.alignment}/100

${score >= 75 ? '✓ STRONG ROADMAP - Supports innovation and scalability criteria for UK Innovator Founder visa' : score >= 65 ? '⚠ VIABLE ROADMAP - Strengthen for endorsement' : '✗ WEAK ROADMAP - Critical improvements needed'}

═══════════════════════════════════════════════════════════
12-MONTH PRODUCT ROADMAP
═══════════════════════════════════════════════════════════

Q1 MILESTONES (Months 1-3):
${q1Milestones}

Q2 MILESTONES (Months 4-6):
${q2Milestones}

Q3 MILESTONES (Months 7-9):
${q3Milestones}

Q4 MILESTONES (Months 10-12):
${q4Milestones}

═══════════════════════════════════════════════════════════
ROADMAP HEALTH SCORE CALCULATION
═══════════════════════════════════════════════════════════
Formula: Roadmap Health = (Innovation + Feasibility + Impact + Alignment) / 4

Component Assessment:
  Innovation Strength: ${scores.innovation}/100
    ${scores.innovation >= 75 ? '✓ Strong innovative features planned' : scores.innovation >= 60 ? '⚠ Moderate innovation - add breakthrough features' : '✗ Limited innovation in roadmap'}
    
  Technical Feasibility: ${scores.feasibility}/100
    ${scores.feasibility >= 75 ? '✓ Realistic delivery timeline' : scores.feasibility >= 60 ? '⚠ Feasibility concerns exist' : '✗ Unrealistic roadmap timeline'}
    
  Business Impact: ${scores.impact}/100
    ${scores.impact >= 75 ? '✓ High-value features for growth' : scores.impact >= 60 ? '⚠ Limited business impact' : '✗ Low-impact feature set'}
    
  Strategic Alignment: ${scores.alignment}/100
    ${scores.alignment >= 75 ? '✓ Features align with business goals' : scores.alignment >= 60 ? '⚠ Partial strategic alignment' : '✗ Poor strategic alignment'}

Calculation:
  Total Points = ${scores.innovation} + ${scores.feasibility} + ${scores.impact} + ${scores.alignment}
  Total Points = ${scores.innovation + scores.feasibility + scores.impact + scores.alignment}
  Roadmap Health = ${scores.innovation + scores.feasibility + scores.impact + scores.alignment} / 4 = ${score}% (${grade})

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: INNOVATION CRITERION
═══════════════════════════════════════════════════════════
GOV.UK Innovation Assessment Factors:
• Novel features and functionality
• Continuous product improvement trajectory
• Clear differentiation from existing solutions
• Technical innovation and IP development
• Market-driven feature prioritization

CURRENT ROADMAP STATUS:
Innovation Strength: ${scores.innovation}/100
  ${scores.innovation >= 75 ? '✓ STRONG - Roadmap demonstrates continuous innovation for UK Innovator Founder visa' : scores.innovation >= 60 ? '⚠ MODERATE - Add more innovative features' : '✗ WEAK - Innovation trajectory needs strengthening'}

Business Impact: ${scores.impact}/100
  ${scores.impact >= 75 ? '✓ HIGH-IMPACT - Features drive scalability and growth' : scores.impact >= 60 ? '⚠ MODERATE-IMPACT - Prioritize high-value features' : '✗ LOW-IMPACT - Roadmap lacks growth drivers'}

Feasibility: ${scores.feasibility}/100
  ${scores.feasibility >= 75 ? '✓ REALISTIC - Achievable within timeline' : scores.feasibility >= 60 ? '⚠ AMBITIOUS - Validate resource availability' : '✗ UNREALISTIC - Revise timeline or scope'}

Overall Roadmap Health: ${score}%
  ${score >= 75 ? '✓ STRONG - Product roadmap demonstrates innovation and scalability' : score >= 65 ? '⚠ VIABLE - Roadmap acceptable but needs strengthening' : '✗ WEAK - Roadmap requires significant improvement'}

Visa Criterion Alignment:
${score >= 75 && scores.innovation >= 70 ? '✓ Product roadmap demonstrates clear innovation trajectory and business impact for UK Innovator Founder visa endorsement. ${score}% health score shows realistic execution plan.' : score >= 65 ? '⚠ Roadmap is viable but strengthening innovation component (aim for 75+) and adding more breakthrough features would improve endorsement case.' : '✗ Product roadmap needs significant work - focus on innovative features, realistic timelines, and high-impact deliverables that demonstrate differentiation.'}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Innovation Criterion: Novel approach and continuous improvement
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
Roadmap Methodology: Quarterly milestone planning framework
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-product-roadmap.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.innovation < 70) tips.push("🚨 Innovation score <70 - strengthen innovative features for visa criterion");
    if (scores.feasibility < 65) tips.push("⚠️ Feasibility concerns - ensure realistic timelines");
    if (scores.impact < 70) tips.push("📊 Business impact low - focus on high-value features");
    if (scores.alignment < 70) tips.push("💡 Strategic alignment weak - tie features to business goals");
    const { score } = getRoadmapHealth();
    if (score >= 80) tips.push("✅ Strong product roadmap supports innovation and scalability criteria");
    return tips.length ? tips : ["✅ Product roadmap is healthy"];
  };

  const getQuarterlyProgress = () => [
    { quarter: "Q1", planned: 8, delivered: 7, innovation: scores.innovation * 0.8 },
    { quarter: "Q2", planned: 10, delivered: 8, innovation: scores.innovation * 0.9 },
    { quarter: "Q3", planned: 12, delivered: 0, innovation: scores.innovation },
    { quarter: "Q4", planned: 15, delivered: 0, innovation: scores.innovation * 1.1 }
  ];

  const getFeatureDistribution = () => [
    { category: "Innovation", count: 35 },
    { category: "Scalability", count: 25 },
    { category: "Customer Value", count: 30 },
    { category: "Technical Debt", count: 10 }
  ];

  const getImpactFeasibilityMatrix = () => [
    { name: "Q1 Features", impact: scores.impact * 0.8, feasibility: scores.feasibility * 0.9, z: 60 },
    { name: "Q2 Features", impact: scores.impact * 0.9, feasibility: scores.feasibility * 0.85, z: 80 },
    { name: "Q3 Features", impact: scores.impact, feasibility: scores.feasibility * 0.75, z: 100 },
    { name: "Q4 Features", impact: scores.impact * 1.1, feasibility: scores.feasibility * 0.7, z: 120 }
  ];

  const getInnovationTrend = () => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    return quarters.map((q, i) => ({
      quarter: q,
      innovation: scores.innovation + (i * 5),
      target: 75
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('roadmapData');
    if (s) {
      const data = JSON.parse(s);
      setQ1Milestones(data.q1Milestones || "");
      setQ2Milestones(data.q2Milestones || "");
      setQ3Milestones(data.q3Milestones || "");
      setQ4Milestones(data.q4Milestones || "");
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('roadmapFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('roadmapDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: healthScore, grade } = getRoadmapHealth();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Product Roadmap</h1>
          <p className="text-muted-foreground mb-6">Plan innovation trajectory (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="roadmap-builder" toolName="Product Roadmap" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, q1Milestones, q2Milestones, q3Milestones, q4Milestones, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Roadmap Health</span>
              </div>
              <p className="text-3xl font-bold">{healthScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Innovation</span>
              </div>
              <p className="text-3xl font-bold">{scores.innovation}</p>
              <p className="text-xs text-muted-foreground mt-1">Visa criterion</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Impact</span>
              </div>
              <p className="text-3xl font-bold">{scores.impact}</p>
              <p className="text-xs text-muted-foreground mt-1">Business value</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Feasibility</span>
              </div>
              <p className="text-3xl font-bold">{scores.feasibility}</p>
              <p className="text-xs text-muted-foreground mt-1">Execution risk</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quarterly Progress</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getQuarterlyProgress()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis label={{ value: 'Features', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#11b6e9" name="Planned" />
                  <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Innovation Trajectory</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getInnovationTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis label={{ value: 'Innovation Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="innovation" stroke="#ffa536" strokeWidth={2} name="Innovation" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Feature Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getFeatureDistribution()} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry.count}%`}>
                    {getFeatureDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Impact vs Feasibility</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="feasibility" name="Feasibility" domain={[0, 100]} label={{ value: 'Feasibility', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="number" dataKey="impact" name="Impact" domain={[0, 100]} label={{ value: 'Impact', angle: -90, position: 'insideLeft' }} />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Features" data={getImpactFeasibilityMatrix()} fill="#ffa536" />
                </ScatterChart>
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
            <h3 className="font-semibold mb-4">Quarterly Milestones</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Q1 Milestones</label>
                <Textarea value={q1Milestones} onChange={(e) => setQ1Milestones(e.target.value)} placeholder="Key deliverables for Q1..." rows={3} data-testid="textarea-q1" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Q2 Milestones</label>
                <Textarea value={q2Milestones} onChange={(e) => setQ2Milestones(e.target.value)} placeholder="Key deliverables for Q2..." rows={3} data-testid="textarea-q2" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Q3 Milestones</label>
                <Textarea value={q3Milestones} onChange={(e) => setQ3Milestones(e.target.value)} placeholder="Key deliverables for Q3..." rows={3} data-testid="textarea-q3" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Q4 Milestones</label>
                <Textarea value={q4Milestones} onChange={(e) => setQ4Milestones(e.target.value)} placeholder="Key deliverables for Q4..." rows={3} data-testid="textarea-q4" />
              </div>
            </div>

            <h4 className="font-semibold mb-3 mt-6">Roadmap Assessment</h4>
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
            <h3 className="font-semibold mb-4">Upload Roadmap Documents</h3>
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
