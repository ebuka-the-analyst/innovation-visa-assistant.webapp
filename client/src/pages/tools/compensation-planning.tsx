import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, X, TrendingUp, AlertCircle, Briefcase, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface CompensationBand {
  id: string;
  role: string;
  level: string;
  minSalary: number;
  maxSalary: number;
  equity: number;
  bonusTarget: number;
}

export default function CompensationPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [bands, setBands] = useState<CompensationBand[]>([
    { id: "1", role: "Software Engineer", level: "Mid-level", minSalary: 70000, maxSalary: 95000, equity: 0.15, bonusTarget: 10 },
    { id: "2", role: "Product Manager", level: "Senior", minSalary: 95000, maxSalary: 130000, equity: 0.25, bonusTarget: 15 }
  ]);

  const saveProgress = () => {
    localStorage.setItem('compensationPlanningFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('compensationPlanningData', JSON.stringify({ bands }));
    localStorage.setItem('compensationPlanningDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addBand = () => {
    setBands([...bands, { 
      id: Date.now().toString(), 
      role: "New Role", 
      level: "Mid-level", 
      minSalary: 60000, 
      maxSalary: 80000, 
      equity: 0.1, 
      bonusTarget: 10 
    }]);
  };

  const removeBand = (id: string) => {
    setBands(bands.filter(b => b.id !== id));
  };

  const updateBand = (id: string, field: string, value: any) => {
    setBands(bands.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const exportPlan = () => {
    const avgEquity = (bands.reduce((sum, b) => sum + b.equity, 0) / bands.length).toFixed(2);
    const totalBudget = bands.reduce((sum, b) => sum + (b.minSalary + b.maxSalary) / 2, 0);
    
    const content = `COMPENSATION PLANNING REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Roles: ${bands.length}
Average Equity: ${avgEquity}%
Estimated Annual Budget: £${totalBudget.toLocaleString()}

COMPENSATION BANDS
${bands.map(b => `
${b.role} (${b.level})
Salary Range: £${b.minSalary.toLocaleString()} - £${b.maxSalary.toLocaleString()}
Equity: ${b.equity}%
Bonus Target: ${b.bonusTarget}%
Total Comp (Mid-point): £${((b.minSalary + b.maxSalary) / 2 * (1 + b.bonusTarget / 100)).toLocaleString()}
`).join('\n')}

MARKET COMPETITIVENESS
${getMarketAnalysis().join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compensation-plan.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const avgEquity = bands.reduce((sum, b) => sum + b.equity, 0) / bands.length;
    
    if (avgEquity < 0.1) tips.push("⚠️ Equity allocations below market average - may struggle to attract top talent");
    if (avgEquity > 0.5) tips.push("💡 High equity allocations - ensure sufficient option pool for future hires");
    
    const highSalaryRoles = bands.filter(b => b.maxSalary > 120000).length;
    if (highSalaryRoles > bands.length / 2) {
      tips.push("💰 Over 50% of roles above £120k - verify budget sustainability");
    }
    
    const lowBonusRoles = bands.filter(b => b.bonusTarget < 10).length;
    if (lowBonusRoles > 0) {
      tips.push("📊 Some roles have low bonus targets - consider performance incentives");
    }
    
    return tips.length ? tips : ["✅ Compensation structure looks competitive and balanced"];
  };

  const getMarketAnalysis = (): string[] => {
    const analysis: string[] = [];
    bands.forEach(b => {
      const midpoint = (b.minSalary + b.maxSalary) / 2;
      if (midpoint < 60000) analysis.push(`${b.role}: Below UK median - risk of low acceptance rates`);
      if (midpoint > 150000) analysis.push(`${b.role}: Premium tier - excellent for attracting senior talent`);
      if (b.equity < 0.05) analysis.push(`${b.role}: Low equity - consider increasing to 0.1-0.3%`);
    });
    return analysis.length ? analysis : ["All roles within competitive market ranges"];
  };

  const getSerializedState = () => ({ uploadedFiles, bands, savedDate });

  const getSalaryDistribution = () => {
    return bands.map(b => ({
      role: b.role.substring(0, 15),
      min: b.minSalary,
      max: b.maxSalary,
      mid: (b.minSalary + b.maxSalary) / 2
    }));
  };

  const getEquityAllocation = () => {
    return bands.map(b => ({
      name: b.role.substring(0, 20),
      equity: b.equity
    }));
  };

  const getLevelDistribution = () => {
    const levels = bands.reduce((acc, b) => {
      acc[b.level] = (acc[b.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(levels).map(([level, count]) => ({
      level,
      count
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('compensationPlanningData');
    if (s) {
      const data = JSON.parse(s);
      setBands(data.bands);
    }
    const f = localStorage.getItem('compensationPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    
    const d = localStorage.getItem('compensationPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const COLORS = ['#ffa536', '#11b6e9', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compensation Planning</h1>
          <p className="text-muted-foreground mb-6">Design competitive salary bands and equity allocations</p>

          <ToolUtilityBar
            toolId="compensation-planning"
            toolName="Compensation Planning"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="font-semibold">Total Roles</span>
              </div>
              <p className="text-3xl font-bold">{bands.length}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold">Avg. Equity</span>
              </div>
              <p className="text-3xl font-bold">{(bands.reduce((sum, b) => sum + b.equity, 0) / bands.length).toFixed(2)}%</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold">Annual Budget</span>
              </div>
              <p className="text-3xl font-bold">
                £{(bands.reduce((sum, b) => sum + (b.minSalary + b.maxSalary) / 2, 0) / 1000).toFixed(0)}k
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Salary Bands by Role</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getSalaryDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip formatter={(value) => `£${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="min" fill="#11b6e9" name="Min Salary" />
                  <Bar dataKey="max" fill="#ffa536" name="Max Salary" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Equity Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getEquityAllocation()}
                    dataKey="equity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.equity}%`}
                  >
                    {getEquityAllocation().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
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
              <h3 className="font-semibold">Compensation Bands</h3>
              <Button onClick={addBand} size="sm" data-testid="button-add-band">
                <Plus className="w-4 h-4 mr-1" /> Add Band
              </Button>
            </div>

            <div className="space-y-4">
              {bands.map((band) => (
                <Card key={band.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-3">
                    <Input
                      value={band.role}
                      onChange={(e) => updateBand(band.id, 'role', e.target.value)}
                      className="font-semibold text-lg w-1/3"
                      placeholder="Role Title"
                      data-testid={`input-role-${band.id}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeBand(band.id)}
                      data-testid={`button-remove-${band.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Level</label>
                      <Select value={band.level} onValueChange={(v) => updateBand(band.id, 'level', v)}>
                        <SelectTrigger data-testid={`select-level-${band.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Mid-level">Mid-level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Min Salary (£)</label>
                      <Input
                        type="number"
                        value={band.minSalary}
                        onChange={(e) => updateBand(band.id, 'minSalary', Number(e.target.value))}
                        data-testid={`input-min-salary-${band.id}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Max Salary (£)</label>
                      <Input
                        type="number"
                        value={band.maxSalary}
                        onChange={(e) => updateBand(band.id, 'maxSalary', Number(e.target.value))}
                        data-testid={`input-max-salary-${band.id}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Equity (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={band.equity}
                        onChange={(e) => updateBand(band.id, 'equity', Number(e.target.value))}
                        data-testid={`input-equity-${band.id}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Bonus Target (%)</label>
                      <Input
                        type="number"
                        value={band.bonusTarget}
                        onChange={(e) => updateBand(band.id, 'bonusTarget', Number(e.target.value))}
                        data-testid={`input-bonus-${band.id}`}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      Total Comp (Mid-point): <span className="font-semibold text-foreground">
                        £{((band.minSalary + band.maxSalary) / 2 * (1 + band.bonusTarget / 100)).toLocaleString()}
                      </span>
                    </span>
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
