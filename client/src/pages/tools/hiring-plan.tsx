import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, X, Users, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface HiringPosition {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium";
  quantity: number;
  timeline: string;
  targetSalary: number;
  requirements: string;
  sourcing: string;
}

export default function HiringPlan() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [positions, setPositions] = useState<HiringPosition[]>([
    { id: "1", title: "Software Engineer", priority: "critical", quantity: 3, timeline: "Q1", targetSalary: 85000, requirements: "5+ years experience", sourcing: "LinkedIn, Tech Communities" }
  ]);
  const [hiringSummary, setHiringSummary] = useState({ totalPositions: 0, totalCost: 0, timelineMonths: 0 });

  const calculateHiringSummary = (pos: HiringPosition[]) => {
    const totalQuantity = pos.reduce((sum, p) => sum + p.quantity, 0);
    const totalCost = pos.reduce((sum, p) => sum + p.targetSalary * p.quantity, 0);
    return { totalPositions: pos.length, totalCost, timelineMonths: 6 };
  };

  const saveProgress = () => {
    localStorage.setItem('hiringPlanFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('hiringPlanData', JSON.stringify({ positions }));
    localStorage.setItem('hiringPlanDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
    setHiringSummary(calculateHiringSummary(positions));
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addPosition = () => {
    setPositions([...positions, { id: Date.now().toString(), title: "New Position", priority: "high", quantity: 1, timeline: "Q2", targetSalary: 70000, requirements: "", sourcing: "" }]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const updatePosition = (id: string, field: string, value: any) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const exportPlan = () => {
    const totalCost = positions.reduce((sum, p) => sum + p.targetSalary * p.quantity, 0);
    const content = `HIRING PLAN\n\nTotal Positions: ${positions.length}\nTotal Headcount to Hire: ${positions.reduce((sum, p) => sum + p.quantity, 0)}\nEstimated Annual Cost: £${totalCost.toLocaleString()}\n\nPositions:\n${positions.map(p => `${p.title} (${p.priority.toUpperCase()})\nQuantity: ${p.quantity} | Target Salary: £${p.targetSalary.toLocaleString()}\nTimeline: ${p.timeline}\nRequirements: ${p.requirements}\nSourcing Strategy: ${p.sourcing}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hiring-plan.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    const totalQuantity = positions.reduce((sum, p) => sum + p.quantity, 0);
    if (totalQuantity > 10) tips.push("Consider staggering hiring across quarters to manage onboarding");
    const criticalCount = positions.filter(p => p.priority === "critical").length;
    if (criticalCount === 0) tips.push("No critical positions defined - review hiring priorities");
    const avgSalary = positions.reduce((sum, p) => sum + p.targetSalary, 0) / positions.length;
    if (avgSalary > 120000) tips.push("Budget high - ensure competitive compensation packages");
    return tips.length ? tips : ["Hiring plan looks balanced"];
  };

  const getSerializedState = () => ({ uploadedFiles, positions, savedDate });

  const getQuarterlyData = () => {
    const quarters = { "Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0 };
    positions.forEach(p => {
      if (quarters.hasOwnProperty(p.timeline)) quarters[p.timeline as keyof typeof quarters] += p.quantity;
    });
    return Object.entries(quarters).map(([q, count]) => ({ quarter: q, hires: count }));
  };

  useEffect(() => {
    const s = localStorage.getItem('hiringPlanData');
    if (s) {
      const data = JSON.parse(s);
      setPositions(data.positions);
      setHiringSummary(calculateHiringSummary(data.positions));
    }
    const f = localStorage.getItem('hiringPlanFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  const totalHeadcount = positions.reduce((sum, p) => sum + p.quantity, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.targetSalary * p.quantity, 0);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Hiring Plan</h1>
          <p className="text-muted-foreground mb-6">Strategic recruitment planning for team growth</p>

          <ToolUtilityBar
            toolId="hiring-plan"
            toolName="Hiring Plan"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-blue-50"><p className="text-sm text-muted-foreground">Total Headcount</p><p className="text-3xl font-bold text-primary">{totalHeadcount}</p></Card>
            <Card className="p-4 bg-green-50"><p className="text-sm text-muted-foreground">Annual Cost</p><p className="text-3xl font-bold text-green-600">£{(totalCost / 1000000).toFixed(1)}M</p></Card>
            <Card className="p-4 bg-purple-50"><p className="text-sm text-muted-foreground">Positions</p><p className="text-3xl font-bold text-purple-600">{positions.length}</p></Card>
          </div>

          {getSmartRecommendations().length > 0 && (
            <Card className="p-4 mb-6 bg-amber-50">
              <h3 className="font-bold mb-2 flex gap-2"><AlertCircle className="w-5 h-5" />Smart Recommendations</h3>
              <ul className="space-y-1">{getSmartRecommendations().map((tip, i) => <li key={i} className="text-sm">• {tip}</li>)}</ul>
            </Card>
          )}

          <Card className="p-4 mb-6"><h3 className="font-bold mb-4">Hiring Timeline</h3><ResponsiveContainer width="100%" height={300}><BarChart data={getQuarterlyData()}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="quarter"/><YAxis/><Tooltip/><Bar dataKey="hires" fill="#ffa536"/></BarChart></ResponsiveContainer></Card>

          <h3 className="font-bold text-lg mb-4">Positions to Hire</h3>
          <div className="space-y-3 mb-6">
            {positions.map(pos => (
              <Card key={pos.id} className="p-4 border-l-4 border-primary">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <Input value={pos.title} onChange={(e) => updatePosition(pos.id, "title", e.target.value)} placeholder="Position Title" />
                  <div className="flex gap-2">
                    <select value={pos.priority} onChange={(e) => updatePosition(pos.id, "priority", e.target.value)} className="border rounded px-2">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                    </select>
                    <Input type="number" value={pos.quantity} onChange={(e) => updatePosition(pos.id, "quantity", parseInt(e.target.value))} placeholder="Qty" min="1" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePosition(pos.id)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Input value={pos.timeline} onChange={(e) => updatePosition(pos.id, "timeline", e.target.value)} placeholder="Timeline (e.g., Q1)" />
                  <Input type="number" value={pos.targetSalary} onChange={(e) => updatePosition(pos.id, "targetSalary", parseInt(e.target.value))} placeholder="Target Salary" />
                </div>
                <Textarea value={pos.requirements} onChange={(e) => updatePosition(pos.id, "requirements", e.target.value)} placeholder="Job requirements" rows={2} className="mb-2" />
                <Textarea value={pos.sourcing} onChange={(e) => updatePosition(pos.id, "sourcing", e.target.value)} placeholder="Sourcing strategy" rows={2} />
              </Card>
            ))}
          </div>

          <Button onClick={addPosition} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Position
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportPlan} data-testid="button-export-hiring">
            <Download className="w-4 h-4" />
            Export Hiring Plan
          </Button>
        </div>
      </div>
    </>
  );
}
