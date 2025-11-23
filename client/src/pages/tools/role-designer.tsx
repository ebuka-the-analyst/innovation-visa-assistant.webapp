import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Target, Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface RoleDefinition {
  id: string;
  title: string;
  department: string;
  responsibilities: string[];
  kpis: string[];
  skills: string[];
  reportingTo: string;
}

export default function RoleDesigner() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: "1",
      title: "Product Manager",
      department: "Product",
      responsibilities: ["Define product roadmap", "Gather user requirements", "Coordinate with engineering"],
      kpis: ["Feature delivery rate", "User satisfaction score", "Sprint completion %"],
      skills: ["Product strategy", "Stakeholder management", "Data analysis"],
      reportingTo: "VP Product"
    }
  ]);

  const saveProgress = () => {
    localStorage.setItem('roleDesignerFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('roleDesignerData', JSON.stringify({ roles }));
    localStorage.setItem('roleDesignerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      title: "New Role",
      department: "",
      responsibilities: [""],
      kpis: [""],
      skills: [""],
      reportingTo: ""
    }]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills') => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: [...r[field], ""] } : r));
  };

  const updateArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills', index: number, value: string) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        const newArray = [...r[field]];
        newArray[index] = value;
        return { ...r, [field]: newArray };
      }
      return r;
    }));
  };

  const removeArrayItem = (id: string, field: 'responsibilities' | 'kpis' | 'skills', index: number) => {
    setRoles(roles.map(r => {
      if (r.id === id) {
        return { ...r, [field]: r[field].filter((_, i) => i !== index) };
      }
      return r;
    }));
  };

  const exportPlan = () => {
    const content = `ROLE & RESPONSIBILITY DESIGN
Generated: ${new Date().toLocaleDateString()}

ORGANIZATION OVERVIEW
Total Roles: ${roles.length}
Total Departments: ${new Set(roles.map(r => r.department)).size}

${roles.map(r => `
═══════════════════════════════════════
ROLE: ${r.title}
Department: ${r.department}
Reports To: ${r.reportingTo}

KEY RESPONSIBILITIES:
${r.responsibilities.filter(x => x).map((resp, i) => `${i + 1}. ${resp}`).join('\n')}

KEY PERFORMANCE INDICATORS (KPIs):
${r.kpis.filter(x => x).map((kpi, i) => `${i + 1}. ${kpi}`).join('\n')}

REQUIRED SKILLS:
${r.skills.filter(x => x).map((skill, i) => `• ${skill}`).join('\n')}
`).join('\n')}

RECOMMENDATIONS:
${getSmartRecommendations().join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'role-design.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    
    const avgResponsibilities = roles.reduce((sum, r) => sum + r.responsibilities.filter(x => x).length, 0) / roles.length;
    if (avgResponsibilities > 8) {
      tips.push("⚠️ Average responsibilities per role exceeds 8 - consider role specialization");
    }
    
    const avgKPIs = roles.reduce((sum, r) => sum + r.kpis.filter(x => x).length, 0) / roles.length;
    if (avgKPIs < 3) {
      tips.push("📊 Low KPI count - add measurable performance indicators to each role");
    }
    
    const rolesWithoutReporting = roles.filter(r => !r.reportingTo).length;
    if (rolesWithoutReporting > 1) {
      tips.push("🔗 Multiple roles without reporting structure - define clear hierarchy");
    }
    
    const departments = new Set(roles.map(r => r.department));
    if (departments.size > roles.length / 2) {
      tips.push("🏢 High department fragmentation - consider consolidating teams");
    }
    
    return tips.length ? tips : ["✅ Role definitions are well-structured and clear"];
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate });

  const getRoleDistribution = () => {
    const deptCount = roles.reduce((acc, r) => {
      if (r.department) {
        acc[r.department] = (acc[r.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deptCount).map(([dept, count]) => ({
      department: dept,
      count
    }));
  };

  const getComplexityScore = (role: RoleDefinition) => {
    return {
      role: role.title.substring(0, 15),
      responsibilities: role.responsibilities.filter(x => x).length,
      kpis: role.kpis.filter(x => x).length,
      skills: role.skills.filter(x => x).length
    };
  };

  useEffect(() => {
    const s = localStorage.getItem('roleDesignerData');
    if (s) {
      const data = JSON.parse(s);
      setRoles(data.roles);
    }
    const f = localStorage.getItem('roleDesignerFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    
    const d = localStorage.getItem('roleDesignerDate');
    if (d) setSavedDate(d);
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Role & Responsibility Designer</h1>
          <p className="text-muted-foreground mb-6">Define clear roles with KPIs and competencies</p>

          <ToolUtilityBar
            toolId="role-designer"
            toolName="Role & Responsibility Designer"
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
                <span className="font-semibold">Total Roles</span>
              </div>
              <p className="text-3xl font-bold">{roles.length}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Departments</span>
              </div>
              <p className="text-3xl font-bold">{new Set(roles.map(r => r.department).filter(d => d)).size}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-semibold">Avg KPIs/Role</span>
              </div>
              <p className="text-3xl font-bold">
                {(roles.reduce((sum, r) => sum + r.kpis.filter(x => x).length, 0) / roles.length).toFixed(1)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Roles by Department</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getRoleDistribution()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffa536" name="Roles" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Role Complexity Analysis</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={roles.slice(0, 5).map(getComplexityScore)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="role" />
                  <PolarRadiusAxis />
                  <Radar name="Responsibilities" dataKey="responsibilities" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                  <Radar name="KPIs" dataKey="kpis" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
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
              <h3 className="font-semibold">Role Definitions</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => (
                <Card key={role.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <Input
                      value={role.title}
                      onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                      className="font-semibold text-xl w-2/3"
                      placeholder="Role Title"
                      data-testid={`input-title-${role.id}`}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Department</label>
                      <Input
                        value={role.department}
                        onChange={(e) => updateRole(role.id, 'department', e.target.value)}
                        placeholder="e.g., Engineering, Product"
                        data-testid={`input-department-${role.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Reports To</label>
                      <Input
                        value={role.reportingTo}
                        onChange={(e) => updateRole(role.id, 'reportingTo', e.target.value)}
                        placeholder="e.g., VP Engineering"
                        data-testid={`input-reporting-${role.id}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Key Responsibilities</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(role.id, 'responsibilities')}
                          data-testid={`button-add-responsibility-${role.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {role.responsibilities.map((resp, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input
                            value={resp}
                            onChange={(e) => updateArrayItem(role.id, 'responsibilities', idx, e.target.value)}
                            placeholder="Responsibility"
                            data-testid={`input-responsibility-${role.id}-${idx}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem(role.id, 'responsibilities', idx)}
                            data-testid={`button-remove-responsibility-${role.id}-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Key Performance Indicators</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(role.id, 'kpis')}
                          data-testid={`button-add-kpi-${role.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {role.kpis.map((kpi, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input
                            value={kpi}
                            onChange={(e) => updateArrayItem(role.id, 'kpis', idx, e.target.value)}
                            placeholder="KPI"
                            data-testid={`input-kpi-${role.id}-${idx}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem(role.id, 'kpis', idx)}
                            data-testid={`button-remove-kpi-${role.id}-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Required Skills</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem(role.id, 'skills')}
                          data-testid={`button-add-skill-${role.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {role.skills.map((skill, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input
                            value={skill}
                            onChange={(e) => updateArrayItem(role.id, 'skills', idx, e.target.value)}
                            placeholder="Skill"
                            data-testid={`input-skill-${role.id}-${idx}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem(role.id, 'skills', idx)}
                            data-testid={`button-remove-skill-${role.id}-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
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
