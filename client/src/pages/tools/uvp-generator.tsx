import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Lightbulb, Heart, Award, AlertCircle, Target, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Unique value proposition demonstrates innovative solution
// Viability Criterion: Clear value communication supports market traction

export default function ValuePropositionGenerator() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [customerPain, setCustomerPain] = useState("UK Innovator Founder visa applications rejected due to compliance errors");
  const [solution, setSolution] = useState("AI-powered real-time compliance checker");
  const [benefit, setBenefit] = useState("Reduce rejection risk by 80%, save 40 hours per application");
  const [generatedUVP, setGeneratedUVP] = useState("");
  const [scores, setScores] = useState({ painSeverity: 75, solutionFit: 80, quantifiableBenefit: 70, emotionalAppeal: 75 });

  const saveProgress = () => {
    localStorage.setItem('uvpFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('uvpData', JSON.stringify({ customerPain, solution, benefit, generatedUVP, scores }));
    localStorage.setItem('uvpDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const generateUVP = () => {
    const uvp = `For ${customerPain.toLowerCase()}, our ${solution.toLowerCase()} helps you ${benefit.toLowerCase()}.`;
    setGeneratedUVP(uvp);
  };

  const getUVPQuality = (): { score: number; grade: string } => {
    const avgScore = Math.round((scores.painSeverity + scores.solutionFit + scores.quantifiableBenefit + scores.emotionalAppeal) / 4);
    let grade = 'F - Weak';
    if (avgScore >= 85) grade = 'A - Excellent';
    else if (avgScore >= 75) grade = 'B - Strong';
    else if (avgScore >= 65) grade = 'C - Good';
    else if (avgScore >= 55) grade = 'D - Fair';
    return { score: avgScore, grade };
  };

  const exportReport = () => {
    const { score, grade } = getUVPQuality();
    const content = `UK INNOVATOR FOUNDER VISA - UNIQUE VALUE PROPOSITION GENERATOR
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
UVP Quality Score: ${score}% (${grade})

Component Scores:
  Pain Severity: ${scores.painSeverity}/100
  Solution Fit: ${scores.solutionFit}/100
  Quantifiable Benefit: ${scores.quantifiableBenefit}/100
  Emotional Appeal: ${scores.emotionalAppeal}/100

${score >= 75 ? '✓ STRONG VALUE PROPOSITION - Clear innovation and customer value for UK Innovator Founder visa' : score >= 65 ? '⚠ GOOD VALUE PROPOSITION - Strengthen for endorsement' : '✗ WEAK VALUE PROPOSITION - Critical improvements needed'}

═══════════════════════════════════════════════════════════
GENERATED VALUE PROPOSITION
═══════════════════════════════════════════════════════════

${generatedUVP || "CLICK GENERATE BUTTON TO CREATE YOUR UNIQUE VALUE PROPOSITION"}

═══════════════════════════════════════════════════════════
VALUE PROPOSITION COMPONENTS
═══════════════════════════════════════════════════════════

CUSTOMER PAIN POINT:
${customerPain}
${scores.painSeverity >= 75 ? '✓ Critical pain - high urgency to solve' : scores.painSeverity >= 60 ? '⚠ Moderate pain - validate severity' : '✗ Low pain - may not be urgent enough'}

YOUR SOLUTION:
${solution}
${scores.solutionFit >= 75 ? '✓ Excellent solution fit - directly addresses pain' : scores.solutionFit >= 60 ? '⚠ Adequate solution - strengthen problem-solution match' : '✗ Weak solution fit - solution may not solve pain'}

QUANTIFIABLE BENEFIT:
${benefit}
${scores.quantifiableBenefit >= 75 ? '✓ Strong quantification - specific metrics and outcomes' : scores.quantifiableBenefit >= 60 ? '⚠ Some quantification - add more specific numbers' : '✗ Weak quantification - benefits too vague'}

═══════════════════════════════════════════════════════════
UVP QUALITY SCORE CALCULATION
═══════════════════════════════════════════════════════════
Formula: UVP Quality = (Pain Severity + Solution Fit + Quantifiable Benefit + Emotional Appeal) / 4

Component Assessment:
  Pain Severity: ${scores.painSeverity}/100
    ${scores.painSeverity >= 75 ? '✓ Critical customer pain - high urgency and willingness to pay' : scores.painSeverity >= 60 ? '⚠ Moderate pain - validate with customer research' : '✗ Low severity - problem may not be urgent enough'}
    
  Solution Fit: ${scores.solutionFit}/100
    ${scores.solutionFit >= 75 ? '✓ Excellent match - solution directly solves customer pain' : scores.solutionFit >= 60 ? '⚠ Good fit - strengthen problem-solution alignment' : '✗ Weak fit - solution may not effectively address pain'}
    
  Quantifiable Benefit: ${scores.quantifiableBenefit}/100
    ${scores.quantifiableBenefit >= 75 ? '✓ Strong quantification - specific metrics, timeframes, outcomes' : scores.quantifiableBenefit >= 60 ? '⚠ Some quantification - add more specificity and numbers' : '✗ Vague benefits - lacks concrete metrics and outcomes'}
    
  Emotional Appeal: ${scores.emotionalAppeal}/100
    ${scores.emotionalAppeal >= 75 ? '✓ High emotional resonance - connects to customer aspirations' : scores.emotionalAppeal >= 60 ? '⚠ Moderate appeal - strengthen emotional connection' : '✗ Low emotional appeal - lacks compelling narrative'}

Calculation:
  Total Points = ${scores.painSeverity} + ${scores.solutionFit} + ${scores.quantifiableBenefit} + ${scores.emotionalAppeal}
  Total Points = ${scores.painSeverity + scores.solutionFit + scores.quantifiableBenefit + scores.emotionalAppeal}
  UVP Quality = ${scores.painSeverity + scores.solutionFit + scores.quantifiableBenefit + scores.emotionalAppeal} / 4 = ${score}% (${grade})

VALUE PROPOSITION FORMULA:
For [target customer with specific pain], our [unique solution] helps you [achieve quantifiable benefit with emotional appeal].

Example:
For UK Innovator Founder visa applicants struggling with compliance errors, our AI-powered real-time compliance checker helps you reduce rejection risk by 80% and save 40 hours per application, giving you peace of mind and confidence in your visa journey.

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: INNOVATION & VIABILITY
═══════════════════════════════════════════════════════════
GOV.UK Assessment Factors:
• Clear customer pain point validates market need
• Innovative solution demonstrates novel approach
• Quantifiable benefits support market traction
• Strong value proposition enables customer acquisition
• Emotional appeal drives customer loyalty and retention

CURRENT VALUE PROPOSITION STATUS:
Solution Fit: ${scores.solutionFit}/100
  ${scores.solutionFit >= 75 ? '✓ STRONG - Solution demonstrates innovative approach to customer pain for UK Innovator Founder visa' : scores.solutionFit >= 60 ? '⚠ MODERATE - Strengthen innovation narrative' : '✗ WEAK - Insufficient innovation differentiation'}

Pain Severity: ${scores.painSeverity}/100
  ${scores.painSeverity >= 75 ? '✓ CRITICAL PAIN - High market need validates viability' : scores.painSeverity >= 60 ? '⚠ MODERATE PAIN - Validate with customer research' : '✗ LOW PAIN - May not support viable business model'}

Quantifiable Benefit: ${scores.quantifiableBenefit}/100
  ${scores.quantifiableBenefit >= 75 ? '✓ STRONG QUANTIFICATION - Specific metrics support market traction narrative' : scores.quantifiableBenefit >= 60 ? '⚠ SOME QUANTIFICATION - Add more concrete numbers' : '✗ VAGUE BENEFITS - Lacks credibility without metrics'}

Emotional Appeal: ${scores.emotionalAppeal}/100
  ${scores.emotionalAppeal >= 70 ? '✓ COMPELLING - Emotional connection drives customer loyalty' : '⚠ MODERATE - Strengthen emotional narrative'}

Overall UVP Quality: ${score}%
  ${score >= 75 ? '✓ STRONG - Value proposition demonstrates innovation and market viability' : score >= 65 ? '⚠ GOOD - UVP viable but strengthen quantification and emotional appeal' : '✗ WEAK - UVP needs significant improvement'}

Visa Criterion Alignment:
${score >= 75 && scores.solutionFit >= 70 && scores.quantifiableBenefit >= 70 ? `✓ Strong value proposition (${score}%) with ${scores.solutionFit}/100 solution fit and ${scores.quantifiableBenefit}/100 quantifiable benefits demonstrates clear innovation and viability for UK Innovator Founder visa. Pain severity (${scores.painSeverity}/100) validates genuine market need.` : score >= 65 ? '⚠ Value proposition is viable but strengthening solution innovation (aim for 75+) and adding specific quantifiable metrics would improve endorsement case.' : '✗ Value proposition needs significant work - validate critical customer pain, demonstrate innovative solution approach, and quantify specific benefits with metrics before visa application.'}

═══════════════════════════════════════════════════════════
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Innovation Criterion: Novel solution to customer problem
Viability Criterion: Market need and customer acquisition capability
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
UVP Framework: Pain + Solution + Benefit + Emotion
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-value-proposition.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips: string[] = [];
    if (scores.painSeverity < 70) tips.push("🚨 Pain severity <70 - ensure you're addressing critical customer problem");
    if (scores.solutionFit < 70) tips.push("⚠️ Solution fit weak - validate problem-solution match");
    if (scores.quantifiableBenefit < 65) tips.push("📊 Benefits not quantified - add specific metrics and numbers");
    if (scores.emotionalAppeal < 70) tips.push("💡 Emotional appeal low - connect to customer aspirations");
    const { score } = getUVPQuality();
    if (score >= 80) tips.push("✅ Strong value proposition ready for market communication");
    return tips.length ? tips : ["✅ Value proposition is strong"];
  };

  const getRadarData = () => [
    { metric: "Pain Severity", score: scores.painSeverity, target: 75 },
    { metric: "Solution Fit", score: scores.solutionFit, target: 75 },
    { metric: "Quantifiable", score: scores.quantifiableBenefit, target: 75 },
    { metric: "Emotional", score: scores.emotionalAppeal, target: 75 }
  ];

  const getComponentBreakdown = () => Object.entries(scores).map(([key, value]) => ({
    component: key.replace(/([A-Z])/g, ' $1').trim(),
    score: value
  }));

  const getValueLayers = () => [
    { layer: "Functional Value", score: scores.quantifiableBenefit },
    { layer: "Emotional Value", score: scores.emotionalAppeal },
    { layer: "Problem Alignment", score: scores.painSeverity },
    { layer: "Solution Fit", score: scores.solutionFit }
  ];

  const getMarketingImpact = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(month => ({
      month: `M${month}`,
      conversion: Math.min(100, (scores.solutionFit / 100) * month * 8),
      awareness: Math.min(100, (scores.emotionalAppeal / 100) * month * 10)
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('uvpData');
    if (s) {
      const data = JSON.parse(s);
      setCustomerPain(data.customerPain || "");
      setSolution(data.solution || "");
      setBenefit(data.benefit || "");
      setGeneratedUVP(data.generatedUVP || "");
      setScores(data.scores || scores);
    }
    const f = localStorage.getItem('uvpFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('uvpDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: qualityScore, grade } = getUVPQuality();
  const COLORS = ['#ffa536', '#11b6e9', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Value Proposition Generator</h1>
          <p className="text-muted-foreground mb-6">Create compelling UVP (Innovator Founder Visa)</p>

          <ToolUtilityBar toolId="uvp-generator" toolName="Value Proposition Generator" onSave={saveProgress} onExport={exportReport} getSerializedState={() => ({ uploadedFiles, customerPain, solution, benefit, generatedUVP, scores, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">UVP Quality</span>
              </div>
              <p className="text-3xl font-bold">{qualityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Pain Severity</span>
              </div>
              <p className="text-3xl font-bold">{scores.painSeverity}</p>
              <p className="text-xs text-muted-foreground mt-1">Problem urgency</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Solution Fit</span>
              </div>
              <p className="text-3xl font-bold">{scores.solutionFit}</p>
              <p className="text-xs text-muted-foreground mt-1">Innovation match</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Quantifiable</span>
              </div>
              <p className="text-3xl font-bold">{scores.quantifiableBenefit}</p>
              <p className="text-xs text-muted-foreground mt-1">Measurable value</p>
            </Card>
          </div>

          {generatedUVP && (
            <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Generated Value Proposition
              </h3>
              <p className="text-lg font-medium text-blue-900 dark:text-blue-100">{generatedUVP}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">UVP Quality Radar</h3>
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
              <h3 className="font-semibold mb-4">Value Layers</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getValueLayers()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="layer" width={140} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ffa536" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Marketing Impact Projection</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getMarketingImpact()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="conversion" stroke="#10b981" strokeWidth={2} name="Conversion" />
                  <Line type="monotone" dataKey="awareness" stroke="#11b6e9" strokeWidth={2} name="Awareness" />
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
            <h3 className="font-semibold mb-4">Value Proposition Builder</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-2">Customer Pain Point</label>
                <Textarea value={customerPain} onChange={(e) => setCustomerPain(e.target.value)} placeholder="What problem do customers face..." rows={3} data-testid="textarea-pain" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Your Solution</label>
                <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="How do you solve it..." rows={3} data-testid="textarea-solution" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Quantifiable Benefit</label>
                <Textarea value={benefit} onChange={(e) => setBenefit(e.target.value)} placeholder="What measurable results do they get..." rows={3} data-testid="textarea-benefit" />
              </div>
            </div>

            <Button onClick={generateUVP} className="w-full bg-primary gap-2 mb-6" data-testid="button-generate">
              <Lightbulb className="w-4 h-4" />
              Generate Value Proposition
            </Button>

            <h4 className="font-semibold mb-3 mt-6">UVP Quality Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}: {value}</label>
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
