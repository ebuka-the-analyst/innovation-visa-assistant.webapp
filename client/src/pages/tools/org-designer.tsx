import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, X, Layers, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RoleDefinition {
  id: string;
  roleName: string;
  level: string;
  keyResponsibilities: string;
  requiredCompetencies: string;
  kpis: string;
  reportingTo: string;
}

export default function OrgDesigner() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [roles, setRoles] = useState<RoleDefinition[]>([
    { id: "1", roleName: "CEO", level: "C-Level", keyResponsibilities: "Strategic direction, P&L", requiredCompetencies: "Leadership, Vision, Execution", kpis: "Revenue growth, team satisfaction", reportingTo: "Board" }
  ]);
  const [designScore, setDesignScore] = useState(0);

  const calculateDesignScore = (roleList: RoleDefinition[]) => {
    let score = 50;
    if (roleList.length >= 5) score += 15;
    const withKPIs = roleList.filter(r => r.kpis.length > 10).length;
    if (withKPIs > roleList.length * 0.7) score += 20;
    const withCompetencies = roleList.filter(r => r.requiredCompetencies.length > 10).length;
    if (withCompetencies === roleList.length) score += 15;
    return Math.min(100, score);
  };

  const saveProgress = () => {
    localStorage.setItem('orgDesignerFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('orgDesignerData', JSON.stringify({ roles }));
    localStorage.setItem('orgDesignerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
    setDesignScore(calculateDesignScore(roles));
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, { id: Date.now().toString(), roleName: "New Role", level: "Manager", keyResponsibilities: "", requiredCompetencies: "", kpis: "", reportingTo: "1" }]);
  };

  const removeRole = (id: string) => {
    if (id === "1") return;
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, field: string, value: string) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const exportDesign = () => {
    const content = `ORGANIZATIONAL ROLE DESIGN\n\nTotal Roles: ${roles.length}\nDesign Completeness Score: ${designScore}/100\n\nRoles:\n${roles.map(r => `${r.roleName} (${r.level})\nReports To: ${r.reportingTo}\nKey Responsibilities: ${r.keyResponsibilities}\nRequired Competencies: ${r.requiredCompetencies}\nSuccess Metrics (KPIs): ${r.kpis}`).join('\n\n---\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-design.txt';
    a.click();
  };

  const getLevelDistribution = () => {
    const dist: Record<string, number> = {};
    roles.forEach(r => {
      dist[r.level] = (dist[r.level] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  };

  const getSerializedState = () => ({ uploadedFiles, roles, savedDate, designScore });

  useEffect(() => {
    const s = localStorage.getItem('orgDesignerData');
    if (s) {
      const data = JSON.parse(s);
      setRoles(data.roles);
      setDesignScore(calculateDesignScore(data.roles));
    }
    const f = localStorage.getItem('orgDesignerFiles');
    if (f) setUploadedFiles(JSON.parse(f));
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
            toolId="org-designer"
            toolName="Role Designer"
            onSave={saveProgress}
            onExport={exportDesign}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50"><p className="text-sm text-muted-foreground">Total Roles</p><p className="text-3xl font-bold text-primary">{roles.length}</p></Card>
            <Card className="p-4 bg-green-50"><p className="text-sm text-muted-foreground">Completeness</p><p className="text-3xl font-bold text-green-600">{designScore}%</p></Card>
            <Card className="p-4 bg-purple-50"><p className="text-sm text-muted-foreground">Levels Defined</p><p className="text-3xl font-bold text-purple-600">{new Set(roles.map(r => r.level)).size}</p></Card>
          </div>

          <Card className="p-4 mb-6"><h3 className="font-bold mb-4">Role Distribution</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={getLevelDistribution()} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#ffa536" dataKey="value"><Cell fill="#ffa536"/><Cell fill="#11b6e9"/></Pie></PieChart></ResponsiveContainer></Card>

          <h3 className="font-bold text-lg mb-4">Role Definitions</h3>
          <div className="space-y-3 mb-6">
            {roles.map(role => (
              <Card key={role.id} className="p-4 border-l-4 border-primary">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Input value={role.roleName} onChange={(e) => updateRole(role.id, "roleName", e.target.value)} placeholder="Role Name" className="font-bold" />
                  <select value={role.level} onChange={(e) => updateRole(role.id, "level", e.target.value)} className="border rounded px-2">
                    <option value="C-Level">C-Level</option>
                    <option value="Director">Director</option>
                    <option value="Manager">Manager</option>
                    <option value="Individual Contributor">Individual Contributor</option>
                  </select>
                </div>
                <Textarea value={role.keyResponsibilities} onChange={(e) => updateRole(role.id, "keyResponsibilities", e.target.value)} placeholder="Key responsibilities" rows={2} className="mb-2" />
                <Textarea value={role.requiredCompetencies} onChange={(e) => updateRole(role.id, "requiredCompetencies", e.target.value)} placeholder="Required competencies" rows={2} className="mb-2" />
                <Textarea value={role.kpis} onChange={(e) => updateRole(role.id, "kpis", e.target.value)} placeholder="Success metrics / KPIs" rows={2} />
                {role.id !== "1" && (
                  <Button variant="ghost" size="icon" className="mt-2" onClick={() => removeRole(role.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>

          <Button onClick={addRole} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Role
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportDesign} data-testid="button-export-org-design">
            <Download className="w-4 h-4" />
            Export Role Design
          </Button>
        </div>
      </div>
    </>
  );
}
