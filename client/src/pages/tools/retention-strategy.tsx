import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, AlertTriangle, TrendingDown, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface RetentionRisk {
  id: string;
  employee: string;
  role: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  turnoverLikelihood: number;
  keyReasons: string;
  interventions: string;
}

export default function RetentionStrategy() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [currentTurnoverRate, setCurrentTurnoverRate] = useState(15);
  const [targetTurnoverRate, setTargetTurnoverRate] = useState(8);
  const [risks, setRisks] = useState<RetentionRisk[]>([
    { id: "1", employee: "Senior Engineer A", role: "Software Engineer", riskLevel: "high", turnoverLikelihood: 75, keyReasons: "Limited growth opportunities", interventions: "Career development plan, mentorship program" }
  ]);

  const saveProgress = () => {
    localStorage.setItem('retentionStrategyFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('retentionStrategyData', JSON.stringify({ currentTurnoverRate, targetTurnoverRate, risks }));
    localStorage.setItem('retentionStrategyDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRisk = () => {
    setRisks([...risks, { id: Date.now().toString(), employee: "Employee Name", role: "", riskLevel: "medium", turnoverLikelihood: 50, keyReasons: "", interventions: "" }]);
  };

  const removeRisk = (id: string) => setRisks(risks.filter(r => r.id !== id));

  const updateRisk = (id: string, field: string, value: any) => {
    setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const exportStrategy = () => {
    const criticalCount = risks.filter(r => r.riskLevel === "critical").length;
    const highCount = risks.filter(r => r.riskLevel === "high").length;
    
    const content = `RETENTION STRATEGY\nGenerated: ${new Date().toLocaleDateString()}\n\nOVERVIEW\nCurrent Turnover Rate: ${currentTurnoverRate}%\nTarget Turnover Rate: ${targetTurnoverRate}%\nTotal At-Risk Employees: ${risks.length}\nCritical Risk: ${criticalCount}\nHigh Risk: ${highCount}\n\nAT-RISK EMPLOYEES\n${risks.map(r => `\n${r.employee} (${r.role})\nRisk Level: ${r.riskLevel.toUpperCase()}\nTurnover Likelihood: ${r.turnoverLikelihood}%\nKey Reasons: ${r.keyReasons}\nPlanned Interventions: ${r.interventions}\n`).join('\n')}\n\nRECOMMENDATIONS\n${getSmartRecommendations().join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retention-strategy.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const criticalCount = risks.filter(r => r.riskLevel === "critical").length;
    const avgLikelihood = risks.reduce((sum, r) => sum + r.turnoverLikelihood, 0) / risks.length;
    
    if (criticalCount > 0) tips.push(`🚨 ${criticalCount} critical retention risks - immediate intervention required`);
    if (avgLikelihood > 60) tips.push("⚠️ High average turnover likelihood - review compensation and culture");
    if (currentTurnoverRate > 20) tips.push("📊 Turnover rate exceeds industry average - conduct exit interviews");
    const risksWithoutPlan = risks.filter(r => !r.interventions).length;
    if (risksWithoutPlan > 0) tips.push(`📝 ${risksWithoutPlan} at-risk employees lack intervention plans`);
    
    return tips.length ? tips : ["✅ Retention strategy is comprehensive"];
  };

  const getRiskDistribution = () => {
    const dist = risks.reduce((acc, r) => { acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1; return acc; }, {} as Record<string, number>);
    return [
      { level: "Critical", count: dist.critical || 0 },
      { level: "High", count: dist.high || 0 },
      { level: "Medium", count: dist.medium || 0 },
      { level: "Low", count: dist.low || 0 }
    ];
  };

  const getTurnoverProjection = () => [
    { quarter: "Current", rate: currentTurnoverRate },
    { quarter: "Q1", rate: currentTurnoverRate - 2 },
    { quarter: "Q2", rate: currentTurnoverRate - 4 },
    { quarter: "Q3", rate: currentTurnoverRate - 6 },
    { quarter: "Q4", rate: targetTurnoverRate }
  ];

  useEffect(() => {
    const s = localStorage.getItem('retentionStrategyData');
    if (s) {
      const data = JSON.parse(s);
      setCurrentTurnoverRate(data.currentTurnoverRate);
      setTargetTurnoverRate(data.targetTurnoverRate);
      setRisks(data.risks);
    }
    const f = localStorage.getItem('retentionStrategyFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('retentionStrategyDate');
    if (d) setSavedDate(d);
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#fbbf24', '#10b981'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Retention Strategy</h1>
          <p className="text-muted-foreground mb-6">Identify turnover risks and plan interventions</p>

          <ToolUtilityBar toolId="retention-strategy" toolName="Retention Strategy" onSave={saveProgress} onExport={exportStrategy} getSerializedState={() => ({ uploadedFiles, currentTurnoverRate, targetTurnoverRate, risks, savedDate })} />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Last saved: {savedDate}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Turnover Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Current Turnover Rate (%)</label>
                <Input type="number" value={currentTurnoverRate} onChange={(e) => setCurrentTurnoverRate(Number(e.target.value))} data-testid="input-current-turnover" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Target Turnover Rate (%)</label>
                <Input type="number" value={targetTurnoverRate} onChange={(e) => setTargetTurnoverRate(Number(e.target.value))} data-testid="input-target-turnover" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block mb-1">At-Risk Employees</span><p className="text-3xl font-bold">{risks.length}</p></Card>
            <Card className="p-4"><TrendingDown className="w-5 h-5 text-red-600 mb-2" /><span className="font-semibold block mb-1">Critical Risks</span><p className="text-3xl font-bold">{risks.filter(r => r.riskLevel === "critical").length}</p></Card>
            <Card className="p-4"><Target className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block mb-1">Reduction Target</span><p className="text-3xl font-bold">{currentTurnoverRate - targetTurnoverRate}%</p></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={getRiskDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getRiskDistribution().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Turnover Reduction Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getTurnoverProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, Math.max(currentTurnoverRate + 5, 25)]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#ffa536" strokeWidth={3} name="Turnover Rate" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => (
                <Alert key={i} className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">{tip}</AlertDescription></Alert>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">At-Risk Employees</h3>
              <Button onClick={addRisk} size="sm" data-testid="button-add-risk"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
            </div>

            <div className="space-y-4">
              {risks.map((risk) => (
                <Card key={risk.id} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex justify-between mb-3">
                    <Input value={risk.employee} onChange={(e) => updateRisk(risk.id, 'employee', e.target.value)} className="font-semibold w-1/3" placeholder="Employee Name" data-testid={`input-employee-${risk.id}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeRisk(risk.id)} data-testid={`button-remove-${risk.id}`}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div><label className="text-xs text-muted-foreground block mb-1">Role</label><Input value={risk.role} onChange={(e) => updateRisk(risk.id, 'role', e.target.value)} data-testid={`input-role-${risk.id}`} /></div>
                    <div><label className="text-xs text-muted-foreground block mb-1">Risk Level</label>
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
                    <div><label className="text-xs text-muted-foreground block mb-1">Turnover Likelihood (%)</label><Input type="number" min="0" max="100" value={risk.turnoverLikelihood} onChange={(e) => updateRisk(risk.id, 'turnoverLikelihood', Number(e.target.value))} data-testid={`input-likelihood-${risk.id}`} /></div>
                  </div>

                  <div className="space-y-2">
                    <div><label className="text-xs text-muted-foreground block mb-1">Key Reasons for Risk</label><Textarea value={risk.keyReasons} onChange={(e) => updateRisk(risk.id, 'keyReasons', e.target.value)} placeholder="Compensation concerns, lack of growth, work-life balance..." rows={2} data-testid={`textarea-reasons-${risk.id}`} /></div>
                    <div><label className="text-xs text-muted-foreground block mb-1">Planned Interventions</label><Textarea value={risk.interventions} onChange={(e) => updateRisk(risk.id, 'interventions', e.target.value)} placeholder="Salary adjustment, new project assignment, flexible schedule..." rows={2} data-testid={`textarea-interventions-${risk.id}`} /></div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && <div className="mt-4"><FileList files={uploadedFiles} onRemove={handleRemoveFile} /></div>}
          </Card>
        </div>
      </div>
    </>
  );
}
