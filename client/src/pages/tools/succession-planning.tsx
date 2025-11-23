import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, AlertCircle, TrendingUp, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface SuccessionRole {
  id: string;
  criticalRole: string;
  currentHolder: string;
  riskLevel: "high" | "medium" | "low";
  successors: string[];
  readinessLevel: number;
  developmentPlan: string;
}

export default function SuccessionPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<SuccessionRole[]>([
    {
      id: "1",
      criticalRole: "CTO",
      currentHolder: "Jane Smith",
      riskLevel: "high",
      successors: ["Lead Engineer", "VP Engineering"],
      readinessLevel: 65,
      developmentPlan: "Technical leadership training, strategic planning workshops"
    }
  ]);

  const saveProgress = () => {
    localStorage.setItem('successionPlanningFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('successionPlanningData', JSON.stringify({ roles }));
    localStorage.setItem('successionPlanningDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      criticalRole: "New Role",
      currentHolder: "",
      riskLevel: "medium",
      successors: [""],
      readinessLevel: 50,
      developmentPlan: ""
    }]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addSuccessor = (id: string) => {
    setRoles(roles.map(r => r.id === id ? { ...r, successors: [...r.successors, ""] } : r));
  };

  const updateSuccessor = (id: string, index: number, value: string) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newSuccessors = [...r.successors];
        newSuccessors[index] = value;
        return { ...r, successors: newSuccessors };
      }
      return r;
    }));
  };

  const removeSuccessor = (id: string, index: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        return { ...r, successors: r.successors.filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  const exportPlan = () => {
    const highRiskCount = roles.filter(r => r.riskLevel === "high").length;
    const avgReadiness = (roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length).toFixed(0);
    
    const content = `SUCCESSION PLANNING REPORT
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Critical Roles: ${roles.length}
High Risk Roles: ${highRiskCount}
Average Readiness Level: ${avgReadiness}%

CRITICAL ROLE SUCCESSION PLANS
${roles.map(r => `
══════════════════════════════════════
Critical Role: ${r.criticalRole}
Current Holder: ${r.currentHolder}
Risk Level: ${r.riskLevel.toUpperCase()}
Readiness Level: ${r.readinessLevel}%

Identified Successors:
${r.successors.filter(s => s).map((s, i) => `${i + 1}. ${s}`).join('\n')}

Development Plan:
${r.developmentPlan}
`).join('\n')}

RECOMMENDATIONS
${getSmartRecommendations().join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'succession-plan.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const highRiskCount = roles.filter(r => r.riskLevel === "high").length;
    const avgReadiness = roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length;
    
    if (highRiskCount > roles.length * 0.4) {
      tips.push("🚨 Over 40% of critical roles at high risk - prioritize succession planning");
    }
    
    if (avgReadiness < 60) {
      tips.push("⚠️ Average readiness below 60% - accelerate development programs");
    }
    
    const rolesWithoutSuccessors = roles.filter(r => r.successors.filter(s => s).length === 0).length;
    if (rolesWithoutSuccessors > 0) {
      tips.push(`📋 ${rolesWithoutSuccessors} roles lack identified successors - immediate action required`);
    }
    
    const rolesWithoutPlans = roles.filter(r => !r.developmentPlan).length;
    if (rolesWithoutPlans > 0) {
      tips.push(`📝 ${rolesWithoutPlans} roles missing development plans - create training roadmaps`);
    }
    
    return tips.length ? tips : ["✅ Succession planning is comprehensive and well-structured"];
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  const getRiskDistribution = () => {
    const riskCount = roles.reduce((acc, r) => {
      acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { risk: "High", count: riskCount.high || 0 },
      { risk: "Medium", count: riskCount.medium || 0 },
      { risk: "Low", count: riskCount.low || 0 }
    ];
  };

  const getReadinessLevels = () => {
    return roles.map(r => ({
      role: r.criticalRole.substring(0, 15),
      readiness: r.readinessLevel
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('successionPlanningData');
    if (s) {
      const data = JSON.parse(s);
      setRoles(data.roles);
    }
    const f = localStorage.getItem('successionPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    
    const d = localStorage.getItem('successionPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const highRiskCount = roles.filter(r => r.riskLevel === "high").length;
  const avgReadiness = roles.length ? (roles.reduce((sum, r) => sum + r.readinessLevel, 0) / roles.length).toFixed(0) : 0;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Succession Planning</h1>
          <p className="text-muted-foreground mb-6">Build leadership pipeline and succession strategies</p>

          <ToolUtilityBar
            toolId="succession-planning"
            toolName="Succession Planning"
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
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold">Critical Roles</span>
              </div>
              <p className="text-3xl font-bold">{roles.length}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold">High Risk Roles</span>
              </div>
              <p className="text-3xl font-bold">{highRiskCount}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-semibold">Avg Readiness</span>
              </div>
              <p className="text-3xl font-bold">{avgReadiness}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getRiskDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="risk" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffa536" name="Roles" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Successor Readiness Levels</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getReadinessLevels()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="readiness" fill="#11b6e9" name="Readiness %" />
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
              <h3 className="font-semibold">Succession Plans</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Critical Role
              </Button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <Card key={role.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={role.criticalRole}
                      onChange={(e) => updateRole(role.id, 'criticalRole', e.target.value)}
                      className="font-semibold text-xl w-2/3"
                      placeholder="Critical Role Title"
                      data-testid={`input-role-${role.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRole(role.id)}
                      data-testid={`button-remove-${role.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Current Holder</label>
                      <Input
                        value={role.currentHolder}
                        onChange={(e) => updateRole(role.id, 'currentHolder', e.target.value)}
                        placeholder="Name"
                        data-testid={`input-holder-${role.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Risk Level</label>
                      <Select value={role.riskLevel} onValueChange={(v) => updateRole(role.id, 'riskLevel', v)}>
                        <SelectTrigger data-testid={`select-risk-${role.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Readiness Level (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={role.readinessLevel}
                        onChange={(e) => updateRole(role.id, 'readinessLevel', Number(e.target.value))}
                        data-testid={`input-readiness-${role.id}`}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Identified Successors</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSuccessor(role.id)}
                        data-testid={`button-add-successor-${role.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {role.successors.map((successor, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input
                          value={successor}
                          onChange={(e) => updateSuccessor(role.id, idx, e.target.value)}
                          placeholder="Successor name or role"
                          data-testid={`input-successor-${role.id}-${idx}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSuccessor(role.id, idx)}
                          data-testid={`button-remove-successor-${role.id}-${idx}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Development Plan</label>
                    <Textarea
                      value={role.developmentPlan}
                      onChange={(e) => updateRole(role.id, 'developmentPlan', e.target.value)}
                      placeholder="Outline training, mentoring, and development activities..."
                      rows={3}
                      data-testid={`textarea-plan-${role.id}`}
                    />
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
