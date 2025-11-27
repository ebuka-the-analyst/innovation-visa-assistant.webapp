import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, AlertTriangle, TrendingDown, Target, DollarSign, Award, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'retention-strategy',
  toolName: 'Retention Strategy',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Employee retention is crucial for demonstrating business viability and scalability to endorsing bodies. Let's build a comprehensive retention strategy that supports your UK Innovator Founder Visa application.",
  questions: [
    {
      id: 'team-size',
      question: "What is your current team size and how many employees are you planning to have in 12 months?",
      hint: "Include both UK-based and any remote team members.",
      fieldKey: 'teamSize',
      fieldType: 'number'
    },
    {
      id: 'current-turnover',
      question: "What is your current annual employee turnover rate, and what's your target rate?",
      hint: "UK tech average is around 13-15%. Express as a percentage.",
      fieldKey: 'currentTurnover',
      minLength: 5
    },
    {
      id: 'at-risk-employees',
      question: "Which key employees or roles do you consider at highest risk of leaving, and why?",
      hint: "Consider factors like limited growth opportunities, compensation gaps, or workload issues.",
      fieldKey: 'atRiskEmployees',
      minLength: 30
    },
    {
      id: 'retention-challenges',
      question: "What are the main challenges you face in retaining top talent in your industry?",
      hint: "Consider competition for talent, remote work policies, career development, etc.",
      fieldKey: 'retentionChallenges',
      minLength: 30
    },
    {
      id: 'current-interventions',
      question: "What retention initiatives do you currently have in place?",
      hint: "Include career development programs, equity schemes, flexible working, mentorship, etc.",
      fieldKey: 'currentInterventions',
      minLength: 20
    },
    {
      id: 'budget-allocation',
      question: "What annual budget do you allocate for employee development and retention activities?",
      hint: "Include training, team events, benefits, and retention bonuses.",
      fieldKey: 'budgetAllocation',
      minLength: 10
    }
  ],
  completionMessage: "Great insights! I've captured your retention landscape. I'm now populating your strategy form with at-risk employee profiles and recommended interventions to strengthen your team stability."
};

// UK Innovator Founder Visa Context (November 2025)
// Viability Criterion: Low turnover demonstrates stable, well-managed team
// Scalability Criterion: Retention critical for maintaining growth momentum

interface RetentionRisk {
  id: string;
  employee: string;
  role: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  turnoverLikelihood: number;
  keyReasons: string;
  interventions: string;
  estimatedSalary: number;
}

export default function RetentionStrategy() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('retention-strategy-mode') as 'ai' | 'traditional') || 'ai';
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [currentTurnoverRate, setCurrentTurnoverRate] = useState(15);
  const [targetTurnoverRate, setTargetTurnoverRate] = useState(8);
  const [teamSize, setTeamSize] = useState(12);
  const [risks, setRisks] = useState<RetentionRisk[]>([
    { id: "1", employee: "Senior Engineer A", role: "Software Engineer", riskLevel: "high", turnoverLikelihood: 75, keyReasons: "Limited growth opportunities", interventions: "Career development plan, mentorship", estimatedSalary: 75000 }
  ]);

  useEffect(() => {
    localStorage.setItem('retention-strategy-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.teamSize) setTeamSize(parseInt(answers.teamSize) || 12);
    if (answers.atRiskEmployees) {
      setRisks([{
        id: "1",
        employee: "At-Risk Employee",
        role: "Key Role",
        riskLevel: "high",
        turnoverLikelihood: 70,
        keyReasons: answers.atRiskEmployees,
        interventions: answers.currentInterventions || "",
        estimatedSalary: 65000
      }]);
    }
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('retentionStrategyFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('retentionStrategyData', JSON.stringify({ currentTurnoverRate, targetTurnoverRate, teamSize, risks }));
    localStorage.setItem('retentionStrategyDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRisk = () => {
    setRisks([...risks, { id: Date.now().toString(), employee: "Employee Name", role: "", riskLevel: "medium", turnoverLikelihood: 50, keyReasons: "", interventions: "", estimatedSalary: 60000 }]);
  };

  const removeRisk = (id: string) => setRisks(risks.filter(r => r.id !== id));

  const updateRisk = (id: string, field: string, value: any) => {
    setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Advanced: Retention Health Score
  // Formula: Based on turnover rate vs industry benchmarks
  const getRetentionHealth = (): { score: number; grade: string } => {
    // UK tech industry average: 12-15% turnover
    const industryAvg = 13.5;
    const deviation = Math.abs(currentTurnoverRate - targetTurnoverRate);
    
    let score = 100;
    if (currentTurnoverRate > industryAvg) {
      score -= (currentTurnoverRate - industryAvg) * 5;
    }
    score -= deviation * 3;
    score = Math.max(0, Math.round(score));
    
    let grade = 'F - Critical';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Good';
    else if (score >= 55) grade = 'C - Needs Work';
    else if (score >= 40) grade = 'D - Poor';
    
    return { score, grade };
  };

  // Advanced: Turnover Cost Analysis
  // Formula: UK industry standard = 1.5x annual salary replacement cost
  const getTurnoverCost = (): { annualCost: number; potentialSavings: number; atRiskCost: number } => {
    const avgSalary = risks.length > 0 ? risks.reduce((sum, r) => sum + r.estimatedSalary, 0) / risks.length : 60000;
    const replacementCostMultiplier = 1.5;
    const replacementCost = avgSalary * replacementCostMultiplier;
    
    const annualTurnovers = Math.round((currentTurnoverRate / 100) * teamSize);
    const annualCost = annualTurnovers * replacementCost;
    
    const targetTurnovers = Math.round((targetTurnoverRate / 100) * teamSize);
    const potentialSavings = (annualTurnovers - targetTurnovers) * replacementCost;
    
    const atRiskEmployees = risks.filter(r => r.turnoverLikelihood >= 60).length;
    const atRiskCost = atRiskEmployees * replacementCost;
    
    return { annualCost: Math.round(annualCost), potentialSavings: Math.max(0, Math.round(potentialSavings)), atRiskCost: Math.round(atRiskCost) };
  };

  const exportStrategy = () => {
    const { score, grade } = getRetentionHealth();
    const { annualCost, potentialSavings, atRiskCost } = getTurnoverCost();
    const criticalCount = risks.filter(r => r.riskLevel === "critical").length;
    const highCount = risks.filter(r => r.riskLevel === "high").length;
    
    const content = `UK INNOVATOR FOUNDER VISA - RETENTION STRATEGY
Generated: ${new Date().toLocaleDateString()}

Retention Health: ${score}% (${grade})
Current Turnover: ${currentTurnoverRate}%
Target Turnover: ${targetTurnoverRate}%
Team Size: ${teamSize}
At-Risk Employees: ${risks.length} (${criticalCount} critical, ${highCount} high)

FINANCIAL IMPACT:
Annual Turnover Cost: £${annualCost.toLocaleString()}
Potential Savings: £${potentialSavings.toLocaleString()}
At-Risk Employee Cost: £${atRiskCost.toLocaleString()}

INNOVATOR FOUNDER VISA CONTEXT:
Viability: ${score >= 70 ? 'Strong retention demonstrates stable team management' : 'High turnover risks viability assessment'}
Scalability: Retention critical for maintaining growth momentum
Cost Impact: £${potentialSavings.toLocaleString()} savings improve business viability

AT-RISK EMPLOYEES:
${risks.map(r => `
${r.employee} (${r.role})
Risk: ${r.riskLevel.toUpperCase()} (${r.turnoverLikelihood}% likelihood)
Reasons: ${r.keyReasons}
Interventions: ${r.interventions}
Replacement Cost: £${Math.round(r.estimatedSalary * 1.5).toLocaleString()}
`).join('\n')}

Source: UK tech industry turnover benchmarks (13.5% average)
Formula: Replacement cost = Salary × 1.5
GOV.UK: Innovator Founder Visa viability criterion
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-retention-strategy.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const criticalCount = risks.filter(r => r.riskLevel === "critical").length;
    const { score } = getRetentionHealth();
    const { potentialSavings } = getTurnoverCost();
    
    if (criticalCount > 0) tips.push(`🚨 ${criticalCount} critical retention risk(s) - immediate intervention required`);
    if (currentTurnoverRate > 15) tips.push(`⚠️ Turnover rate ${currentTurnoverRate}% exceeds industry average (13.5%)`);
    if (score < 60) tips.push(`💡 Retention health ${score}% impacts business viability assessment`);
    if (potentialSavings > 50000) tips.push(`✅ Improving retention saves £${Math.round(potentialSavings / 1000)}k annually`);
    
    const noInterventions = risks.filter(r => !r.interventions || r.interventions.trim().length === 0);
    if (noInterventions.length > 0) {
      tips.push(`📋 ${noInterventions.length} at-risk employee(s) without retention plan`);
    }
    
    return tips.length ? tips : ["✅ Retention strategy supports business viability"];
  };

  const getSerializedState = () => ({ uploadedFiles, currentTurnoverRate, targetTurnoverRate, teamSize, risks, savedDate });

  // Chart 1: Turnover Trend Projection
  const getTurnoverProjection = () => {
    const months = 12;
    const data = [];
    for (let i = 0; i <= months; i++) {
      const current = currentTurnoverRate;
      const target = targetTurnoverRate;
      const projected = current - ((current - target) / months) * i;
      data.push({
        month: i,
        current: i === 0 ? current : null,
        projected: projected,
        target: target
      });
    }
    return data;
  };

  // Chart 2: Risk Distribution
  const getRiskDistribution = () => [
    { level: "Critical", count: risks.filter(r => r.riskLevel === "critical").length },
    { level: "High", count: risks.filter(r => r.riskLevel === "high").length },
    { level: "Medium", count: risks.filter(r => r.riskLevel === "medium").length },
    { level: "Low", count: risks.filter(r => r.riskLevel === "low").length }
  ].filter(d => d.count > 0);

  // Chart 3: Cost Impact by Employee
  const getCostImpact = () => {
    return risks.map(r => ({
      employee: r.employee.substring(0, 12),
      likelihood: r.turnoverLikelihood,
      cost: Math.round(r.estimatedSalary * 1.5)
    })).sort((a, b) => b.cost - a.cost).slice(0, 8);
  };

  // Chart 4: Risk vs Salary Scatter
  const getRiskScatter = () => {
    return risks.map(r => ({
      x: r.estimatedSalary,
      y: r.turnoverLikelihood,
      name: r.employee.substring(0, 10),
      risk: r.riskLevel
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('retentionStrategyData');
    if (s) {
      const data = JSON.parse(s);
      setCurrentTurnoverRate(data.currentTurnoverRate || 15);
      setTargetTurnoverRate(data.targetTurnoverRate || 8);
      setTeamSize(data.teamSize || 12);
      setRisks(data.risks || []);
    }
    const f = localStorage.getItem('retentionStrategyFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('retentionStrategyDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: retentionScore, grade } = getRetentionHealth();
  const { annualCost, potentialSavings, atRiskCost } = getTurnoverCost();
  const COLORS = ['#ef4444', '#ffa536', '#11b6e9', '#10b981'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">Retention Strategy</h1>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>
          <p className="text-muted-foreground mb-6">Reduce turnover for viability and scalability (Innovator Founder Visa)</p>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <>
          <ToolUtilityBar toolId="retention-strategy" toolName="Retention Strategy" onSave={saveProgress} onExport={exportStrategy} getSerializedState={getSerializedState} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Retention Health</span>
              </div>
              <p className="text-3xl font-bold">{retentionScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{grade}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Current Turnover</span>
              </div>
              <p className="text-3xl font-bold">{currentTurnoverRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Target: {targetTurnoverRate}%</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Potential Savings</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(potentialSavings / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">Annual opportunity</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">At-Risk Cost</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(atRiskCost / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">{risks.filter(r => r.turnoverLikelihood >= 60).length} employees</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Turnover Reduction Plan</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getTurnoverProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Turnover %', angle: -90, position: 'insideLeft' }} domain={[0, Math.max(currentTurnoverRate + 5, 20)]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#ef4444" strokeWidth={2} name="Current" dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="projected" stroke="#ffa536" strokeWidth={2} name="Projected" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getRiskDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getRiskDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Replacement Cost Impact</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCostImpact()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Replacement Cost £', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="employee" type="category" width={100} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Bar dataKey="cost" fill="#ffa536" name="Replacement Cost" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Turnover Risk vs Salary</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Salary" unit="£" label={{ value: 'Salary £', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="y" name="Risk" unit="%" label={{ value: 'Turnover Likelihood %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">Salary: £{data.x.toLocaleString()}</p>
                          <p className="text-sm">Risk: {data.y}%</p>
                          <p className="text-sm">Level: {data.risk}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Scatter name="Employees" data={getRiskScatter()} fill="#ffa536">
                    {getRiskScatter().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.risk === 'critical' ? '#ef4444' : entry.risk === 'high' ? '#ffa536' : '#11b6e9'} />
                    ))}
                  </Scatter>
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
            <h3 className="font-semibold mb-4">Team Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Current Turnover Rate (%)</label>
                <Slider value={[currentTurnoverRate]} onValueChange={(v) => setCurrentTurnoverRate(v[0])} max={40} step={1} data-testid="slider-current" />
                <p className="text-sm text-muted-foreground mt-1">{currentTurnoverRate}%</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Target Turnover Rate (%)</label>
                <Slider value={[targetTurnoverRate]} onValueChange={(v) => setTargetTurnoverRate(v[0])} max={20} step={1} data-testid="slider-target" />
                <p className="text-sm text-muted-foreground mt-1">{targetTurnoverRate}%</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Team Size</label>
                <Input type="number" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} data-testid="input-team-size" />
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">At-Risk Employees</h3>
              <Button onClick={addRisk} size="sm" data-testid="button-add-risk">
                <Plus className="w-4 h-4 mr-1" /> Add Employee
              </Button>
            </div>

            <div className="space-y-6">
              {risks.map((risk) => (
                <Card key={risk.id} className={`p-6 border-l-4 ${
                  risk.riskLevel === 'critical' ? 'border-l-red-500' :
                  risk.riskLevel === 'high' ? 'border-l-orange-500' :
                  risk.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input value={risk.employee} onChange={(e) => updateRisk(risk.id, 'employee', e.target.value)} placeholder="Employee Name" data-testid={`input-employee-${risk.id}`} />
                      <Input value={risk.role} onChange={(e) => updateRisk(risk.id, 'role', e.target.value)} placeholder="Role" data-testid={`input-role-${risk.id}`} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeRisk(risk.id)} data-testid={`button-remove-${risk.id}`}>
                      <X className="w-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Risk Level</label>
                      <Select value={risk.riskLevel} onValueChange={(v) => updateRisk(risk.id, 'riskLevel', v)}>
                        <SelectTrigger data-testid={`select-risk-${risk.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Turnover Likelihood: {risk.turnoverLikelihood}%</label>
                      <Slider value={[risk.turnoverLikelihood]} onValueChange={(v) => updateRisk(risk.id, 'turnoverLikelihood', v[0])} max={100} step={5} data-testid={`slider-likelihood-${risk.id}`} />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Estimated Salary (£)</label>
                      <Input type="number" value={risk.estimatedSalary} onChange={(e) => updateRisk(risk.id, 'estimatedSalary', Number(e.target.value))} data-testid={`input-salary-${risk.id}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Key Reasons for Risk</label>
                      <Textarea value={risk.keyReasons} onChange={(e) => updateRisk(risk.id, 'keyReasons', e.target.value)} placeholder="Why might they leave..." rows={2} data-testid={`textarea-reasons-${risk.id}`} />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Retention Interventions</label>
                      <Textarea value={risk.interventions} onChange={(e) => updateRisk(risk.id, 'interventions', e.target.value)} placeholder="Actions to retain..." rows={2} data-testid={`textarea-interventions-${risk.id}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
          </>
          )}
        </div>
      </div>
    </>
  );
}
