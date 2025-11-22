import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, X, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface OrgPosition {
  id: string;
  title: string;
  level: number;
  reportsTo: string | null;
  salary: number;
  headcount: number;
  responsibilities: string;
  requiredSkills: string;
}

const COLORS = ['#ffa536', '#11b6e9', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b'];

export default function OrgChart() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [positions, setPositions] = useState<OrgPosition[]>([
    { id: "1", title: "CEO", level: 1, reportsTo: null, salary: 150000, headcount: 1, responsibilities: "Overall company strategy and execution", requiredSkills: "Leadership, Vision, Execution" }
  ]);
  const [orgHealth, setOrgHealth] = useState(0);

  const calculateOrgHealth = (pos: OrgPosition[]) => {
    let score = 50;
    score += pos.length * 5;
    const avgHeadcount = pos.reduce((sum, p) => sum + p.headcount, 0) / pos.length;
    if (avgHeadcount >= 3) score += 20;
    const totalSalary = pos.reduce((sum, p) => sum + p.salary, 0);
    if (totalSalary > 500000) score += 15;
    const withSkills = pos.filter(p => p.requiredSkills.length > 10).length;
    if (withSkills > pos.length * 0.7) score += 15;
    return Math.min(100, score);
  };

  const saveProgress = () => {
    localStorage.setItem('orgChartFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('orgChartData', JSON.stringify({ positions }));
    localStorage.setItem('orgChartDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
    setOrgHealth(calculateOrgHealth(positions));
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addPosition = () => {
    setPositions([...positions, { 
      id: Date.now().toString(), 
      title: "New Position", 
      level: 2, 
      reportsTo: "1", 
      salary: 80000, 
      headcount: 1, 
      responsibilities: "", 
      requiredSkills: "" 
    }]);
  };

  const removePosition = (id: string) => {
    if (id === "1") return;
    setPositions(positions.filter(p => p.id !== id));
  };

  const updatePosition = (id: string, field: string, value: any) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const exportOrgChart = () => {
    const totalSalary = positions.reduce((sum, p) => sum + p.salary * p.headcount, 0);
    const totalHeadcount = positions.reduce((sum, p) => sum + p.headcount, 0);
    const content = `ORGANIZATIONAL CHART ANALYSIS\n\nTotal Positions: ${positions.length}\nTotal Headcount: ${totalHeadcount}\nTotal Annual Salary Cost: £${totalSalary.toLocaleString()}\nOrg Health Score: ${orgHealth}/100\n\nPositions:\n${positions.map(p => `${p.title} (Level ${p.level}): £${p.salary.toLocaleString()} x ${p.headcount}\nResponsibilities: ${p.responsibilities}\nRequired Skills: ${p.requiredSkills}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-chart.txt';
    a.click();
  };

  const getSmartTips = () => {
    const tips = [];
    const avgHeadcount = positions.reduce((sum, p) => sum + p.headcount, 0) / positions.length;
    if (avgHeadcount < 2) tips.push("Consider increasing team sizes - typical high-performing teams have 3-5 members");
    const totalSalary = positions.reduce((sum, p) => sum + p.salary * p.headcount, 0);
    if (totalSalary > 5000000) tips.push("You're at significant payroll cost - focus on high-impact roles");
    const withoutSkills = positions.filter(p => p.requiredSkills.length < 10).length;
    if (withoutSkills > 0) tips.push(`${withoutSkills} positions lack defined skill requirements`);
    if (positions.length < 5) tips.push("Growing team - define clear career progression paths");
    return tips.length ? tips : ["Organization structure is well-defined"];
  };

  const getSerializedState = () => ({ uploadedFiles, positions, savedDate, orgHealth });

  const getChartData = () => {
    return positions.map(p => ({ name: p.title.substring(0, 10), headcount: p.headcount, salary: p.salary / 1000 }));
  };

  const getSkillsDistribution = () => {
    const skills: Record<string, number> = {};
    positions.forEach(p => {
      p.requiredSkills.split(',').forEach(s => {
        const skill = s.trim();
        skills[skill] = (skills[skill] || 0) + 1;
      });
    });
    return Object.entries(skills).slice(0, 5).map(([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    const s = localStorage.getItem('orgChartData');
    if (s) {
      const data = JSON.parse(s);
      setPositions(data.positions);
      setOrgHealth(calculateOrgHealth(data.positions));
    }
    const f = localStorage.getItem('orgChartFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Organization Chart Designer</h1>
          <p className="text-muted-foreground mb-6">Build and analyze your optimal organizational structure</p>

          <ToolUtilityBar
            toolId="org-chart"
            toolName="Organization Chart"
            onSave={saveProgress}
            onExport={exportOrgChart}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-blue-50"><p className="text-sm text-muted-foreground">Positions</p><p className="text-3xl font-bold text-primary">{positions.length}</p></Card>
            <Card className="p-4 bg-green-50"><p className="text-sm text-muted-foreground">Headcount</p><p className="text-3xl font-bold text-green-600">{positions.reduce((sum, p) => sum + p.headcount, 0)}</p></Card>
            <Card className="p-4 bg-purple-50"><p className="text-sm text-muted-foreground">Payroll</p><p className="text-3xl font-bold text-purple-600">£{(positions.reduce((sum, p) => sum + p.salary * p.headcount, 0) / 1000000).toFixed(1)}M</p></Card>
            <Card className="p-4 bg-orange-50"><p className="text-sm text-muted-foreground">Org Health</p><p className="text-3xl font-bold text-primary">{orgHealth}%</p></Card>
          </div>

          {getSmartTips().length > 0 && (
            <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
              <h3 className="font-bold mb-2 flex gap-2"><AlertCircle className="w-5 h-5" />Smart Recommendations</h3>
              <ul className="space-y-1">{getSmartTips().map((tip, i) => <li key={i} className="text-sm">• {tip}</li>)}</ul>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-4"><h3 className="font-bold mb-4">Headcount by Position</h3><ResponsiveContainer width="100%" height={300}><BarChart data={getChartData()}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="headcount" fill="#ffa536"/></BarChart></ResponsiveContainer></Card>
            <Card className="p-4"><h3 className="font-bold mb-4">Top Required Skills</h3><ResponsiveContainer width="100%" height={300}><BarChart data={getSkillsDistribution()}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" fill="#11b6e9"/></BarChart></ResponsiveContainer></Card>
          </div>

          <h3 className="font-bold text-lg mb-4">Organization Structure</h3>
          <div className="space-y-3 mb-6">
            {positions.map(pos => (
              <Card key={pos.id} className="p-4 border-l-4 border-primary">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <Input value={pos.title} onChange={(e) => updatePosition(pos.id, "title", e.target.value)} placeholder="Position Title" />
                  <div className="flex gap-2">
                    <Input type="number" value={pos.salary} onChange={(e) => updatePosition(pos.id, "salary", parseInt(e.target.value))} placeholder="Salary" />
                    <Input type="number" value={pos.headcount} onChange={(e) => updatePosition(pos.id, "headcount", parseInt(e.target.value))} placeholder="Headcount" min="1" max="20" />
                  </div>
                  {pos.id !== "1" && <Button variant="ghost" size="icon" onClick={() => removePosition(pos.id)}><X className="w-4 h-4" /></Button>}
                </div>
                <Textarea value={pos.responsibilities} onChange={(e) => updatePosition(pos.id, "responsibilities", e.target.value)} placeholder="Key responsibilities" rows={2} className="mb-2" />
                <Textarea value={pos.requiredSkills} onChange={(e) => updatePosition(pos.id, "requiredSkills", e.target.value)} placeholder="Required skills (comma-separated)" rows={2} />
              </Card>
            ))}
          </div>

          <Button onClick={addPosition} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Position
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportOrgChart} data-testid="button-export-org">
            <Download className="w-4 h-4" />
            Export Organization Chart
          </Button>
        </div>
      </div>
    </>
  );
}
