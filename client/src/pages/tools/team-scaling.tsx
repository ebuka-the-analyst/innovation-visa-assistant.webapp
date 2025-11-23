import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, TrendingUp, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface ScalingPhase {
  id: string;
  quarter: string;
  newHires: number;
  totalHeadcount: number;
  budgetRequired: number;
  keyRoles: string;
  risks: string;
}

export default function TeamScaling() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [currentHeadcount, setCurrentHeadcount] = useState(15);
  const [targetHeadcount, setTargetHeadcount] = useState(50);
  const [avgSalary, setAvgSalary] = useState(75000);
  const [phases, setPhases] = useState<ScalingPhase[]>([
    { id: "1", quarter: "Q1 2025", newHires: 8, totalHeadcount: 23, budgetRequired: 600000, keyRoles: "Engineers, Product Manager", risks: "Market competition for talent" },
    { id: "2", quarter: "Q2 2025", newHires: 10, totalHeadcount: 33, budgetRequired: 750000, keyRoles: "Sales, Marketing, Support", risks: "Onboarding capacity constraints" }
  ]);

  const saveProgress = () => {
    localStorage.setItem('teamScalingFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('teamScalingData', JSON.stringify({ currentHeadcount, targetHeadcount, avgSalary, phases }));
    localStorage.setItem('teamScalingDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addPhase = () => {
    setPhases([...phases, {
      id: Date.now().toString(),
      quarter: `Q${phases.length + 1}`,
      newHires: 5,
      totalHeadcount: currentHeadcount + 5,
      budgetRequired: avgSalary * 5,
      keyRoles: "",
      risks: ""
    }]);
  };

  const removePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const updatePhase = (id: string, field: string, value: any) => {
    setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const exportPlan = () => {
    const totalNewHires = phases.reduce((sum, p) => sum + p.newHires, 0);
    const totalBudget = phases.reduce((sum, p) => sum + p.budgetRequired, 0);
    
    const content = `TEAM SCALING STRATEGY
Generated: ${new Date().toLocaleDateString()}

OVERVIEW
Current Headcount: ${currentHeadcount}
Target Headcount: ${targetHeadcount}
Total New Hires Planned: ${totalNewHires}
Total Budget Required: £${totalBudget.toLocaleString()}
Average Salary: £${avgSalary.toLocaleString()}

SCALING PHASES
${phases.map((p, i) => `
Phase ${i + 1}: ${p.quarter}
New Hires: ${p.newHires}
Total Headcount: ${p.totalHeadcount}
Budget: £${p.budgetRequired.toLocaleString()}
Key Roles: ${p.keyRoles}
Risks: ${p.risks}
`).join('\n')}

RECOMMENDATIONS
${getSmartRecommendations().join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-scaling-strategy.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const totalNewHires = phases.reduce((sum, p) => sum + p.newHires, 0);
    const totalBudget = phases.reduce((sum, p) => sum + p.budgetRequired, 0);
    
    if (totalNewHires > 30) {
      tips.push("⚠️ High hiring volume - ensure robust recruitment infrastructure");
    }
    
    const maxPhaseHires = Math.max(...phases.map(p => p.newHires));
    if (maxPhaseHires > 15) {
      tips.push("🚨 Peak hiring phase exceeds 15 people - stagger hiring to maintain quality");
    }
    
    const growthRate = ((targetHeadcount - currentHeadcount) / currentHeadcount) * 100;
    if (growthRate > 200) {
      tips.push("📈 Growth rate exceeds 200% - high risk of culture dilution");
    }
    
    if (totalBudget / totalNewHires > avgSalary * 1.2) {
      tips.push("💰 Budget allocation suggests senior hires - verify compensation market data");
    }
    
    return tips.length ? tips : ["✅ Scaling plan is balanced and achievable"];
  };

  const getSerializedState = () => ({ uploadedFiles, currentHeadcount, targetHeadcount, avgSalary, phases, savedDate });

  const getGrowthProjection = () => {
    let runningTotal = currentHeadcount;
    return [
      { quarter: "Current", headcount: currentHeadcount },
      ...phases.map(p => {
        runningTotal = p.totalHeadcount;
        return {
          quarter: p.quarter,
          headcount: p.totalHeadcount,
          newHires: p.newHires
        };
      })
    ];
  };

  const getBudgetProjection = () => {
    return phases.map(p => ({
      quarter: p.quarter,
      budget: p.budgetRequired / 1000
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('teamScalingData');
    if (s) {
      const data = JSON.parse(s);
      setCurrentHeadcount(data.currentHeadcount);
      setTargetHeadcount(data.targetHeadcount);
      setAvgSalary(data.avgSalary);
      setPhases(data.phases);
    }
    const f = localStorage.getItem('teamScalingFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    
    const d = localStorage.getItem('teamScalingDate');
    if (d) setSavedDate(d);
  }, []);

  const totalNewHires = phases.reduce((sum, p) => sum + p.newHires, 0);
  const totalBudget = phases.reduce((sum, p) => sum + p.budgetRequired, 0);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Team Scaling Strategy</h1>
          <p className="text-muted-foreground mb-6">Plan strategic team growth with budget forecasting</p>

          <ToolUtilityBar
            toolId="team-scaling"
            toolName="Team Scaling Strategy"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Last saved: {savedDate}
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Baseline Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Current Headcount</label>
                <Input
                  type="number"
                  value={currentHeadcount}
                  onChange={(e) => setCurrentHeadcount(Number(e.target.value))}
                  data-testid="input-current-headcount"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Target Headcount</label>
                <Input
                  type="number"
                  value={targetHeadcount}
                  onChange={(e) => setTargetHeadcount(Number(e.target.value))}
                  data-testid="input-target-headcount"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Average Salary (£)</label>
                <Input
                  type="number"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                  data-testid="input-avg-salary"
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">Total New Hires</span>
              </div>
              <p className="text-3xl font-bold">{totalNewHires}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold">Total Budget</span>
              </div>
              <p className="text-3xl font-bold">£{(totalBudget / 1000).toFixed(0)}k</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Growth Rate</span>
              </div>
              <p className="text-3xl font-bold">
                {(((targetHeadcount - currentHeadcount) / currentHeadcount) * 100).toFixed(0)}%
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Headcount Growth Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={getGrowthProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="headcount" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} name="Total Headcount" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quarterly Budget Forecast</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getBudgetProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip formatter={(value) => `£${value}k`} />
                  <Bar dataKey="budget" fill="#11b6e9" name="Budget (£k)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => (
                <Alert key={i} className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">{tip}</AlertDescription>
                </Alert>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Scaling Phases</h3>
              <Button onClick={addPhase} size="sm" data-testid="button-add-phase">
                <Plus className="w-4 h-4 mr-1" /> Add Phase
              </Button>
            </div>

            <div className="space-y-4">
              {phases.map((phase) => (
                <Card key={phase.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <Input
                        value={phase.quarter}
                        onChange={(e) => updatePhase(phase.id, 'quarter', e.target.value)}
                        className="font-semibold w-32"
                        placeholder="Q1 2025"
                        data-testid={`input-quarter-${phase.id}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhase(phase.id)}
                      data-testid={`button-remove-${phase.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">New Hires</label>
                      <Input
                        type="number"
                        value={phase.newHires}
                        onChange={(e) => updatePhase(phase.id, 'newHires', Number(e.target.value))}
                        data-testid={`input-new-hires-${phase.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Total Headcount</label>
                      <Input
                        type="number"
                        value={phase.totalHeadcount}
                        onChange={(e) => updatePhase(phase.id, 'totalHeadcount', Number(e.target.value))}
                        data-testid={`input-total-headcount-${phase.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Budget (£)</label>
                      <Input
                        type="number"
                        value={phase.budgetRequired}
                        onChange={(e) => updatePhase(phase.id, 'budgetRequired', Number(e.target.value))}
                        data-testid={`input-budget-${phase.id}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Key Roles to Hire</label>
                      <Input
                        value={phase.keyRoles}
                        onChange={(e) => updatePhase(phase.id, 'keyRoles', e.target.value)}
                        placeholder="e.g., Software Engineers, Product Managers"
                        data-testid={`input-key-roles-${phase.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Key Risks</label>
                      <Input
                        value={phase.risks}
                        onChange={(e) => updatePhase(phase.id, 'risks', e.target.value)}
                        placeholder="e.g., Market competition, Budget constraints"
                        data-testid={`input-risks-${phase.id}`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton
              onFileSelected={handleFileUpload}
              config={fileUploadConfigs.companyDocuments}
            />
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
