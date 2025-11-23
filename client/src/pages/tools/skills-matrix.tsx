import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Users, Target, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface SkillEntry {
  id: string;
  employee: string;
  role: string;
  skills: { [key: string]: "expert" | "proficient" | "basic" | "none" };
}

const SKILL_CATEGORIES = ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS", "Leadership", "Communication"];

export default function SkillsMatrix() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([
    { id: "1", employee: "John Doe", role: "Senior Engineer", skills: { JavaScript: "expert", Python: "proficient", React: "expert", "Node.js": "proficient", SQL: "basic", AWS: "basic", Leadership: "proficient", Communication: "proficient" } }
  ]);

  const saveProgress = () => {
    localStorage.setItem('skillsMatrixFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('skillsMatrixData', JSON.stringify({ skillEntries }));
    localStorage.setItem('skillsMatrixDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addEmployee = () => {
    const defaultSkills = SKILL_CATEGORIES.reduce((acc, skill) => ({ ...acc, [skill]: "none" }), {});
    setSkillEntries([...skillEntries, { id: Date.now().toString(), employee: "New Employee", role: "", skills: defaultSkills as any }]);
  };

  const removeEmployee = (id: string) => setSkillEntries(skillEntries.filter(e => e.id !== id));

  const updateEmployee = (id: string, field: string, value: any) => {
    setSkillEntries(skillEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateSkill = (id: string, skill: string, level: any) => {
    setSkillEntries(skillEntries.map(e => e.id === id ? { ...e, skills: { ...e.skills, [skill]: level } } : e));
  };

  const exportMatrix = () => {
    const content = `SKILLS MATRIX\nGenerated: ${new Date().toLocaleDateString()}\n\nTOTAL EMPLOYEES: ${skillEntries.length}\n\nSKILL INVENTORY\n${skillEntries.map(e => `\n${e.employee} - ${e.role}\nSkills:\n${SKILL_CATEGORIES.map(skill => `  ${skill}: ${e.skills[skill] || "none"}`).join('\n')}\n`).join('\n')}\n\nSKILL GAP ANALYSIS\n${getSmartRecommendations().join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-matrix.txt';
    a.click();
  };

  const getSmartRecommendations = (): string[] => {
    const tips: string[] = [];
    
    SKILL_CATEGORIES.forEach(skill => {
      const experts = skillEntries.filter(e => e.skills[skill] === "expert").length;
      const proficient = skillEntries.filter(e => e.skills[skill] === "proficient").length;
      
      if (experts === 0 && proficient === 0) {
        tips.push(`⚠️ ${skill}: No proficient team members - critical skill gap`);
      } else if (experts === 1) {
        tips.push(`📋 ${skill}: Single point of failure - only 1 expert`);
      }
    });
    
    return tips.length ? tips : ["✅ Skills coverage is strong across the team"];
  };

  const getSkillLevelScore = (level: string) => {
    const scores: Record<string, number> = { expert: 100, proficient: 70, basic: 40, none: 0 };
    return scores[level] || 0;
  };

  const getSkillDistribution = () => {
    return SKILL_CATEGORIES.map(skill => {
      const avgScore = skillEntries.reduce((sum, e) => sum + getSkillLevelScore(e.skills[skill] || "none"), 0) / skillEntries.length;
      return { skill: skill.substring(0, 12), avgScore: Math.round(avgScore) };
    });
  };

  const getRadarData = (entry: SkillEntry) => {
    return SKILL_CATEGORIES.slice(0, 6).map(skill => ({
      skill: skill.substring(0, 10),
      score: getSkillLevelScore(entry.skills[skill] || "none")
    }));
  };

  useEffect(() => {
    const s = localStorage.getItem('skillsMatrixData');
    if (s) setSkillEntries(JSON.parse(s).skillEntries);
    const f = localStorage.getItem('skillsMatrixFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('skillsMatrixDate');
    if (d) setSavedDate(d);
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Skills Matrix</h1>
          <p className="text-muted-foreground mb-6">Map team skills and identify gaps</p>

          <ToolUtilityBar toolId="skills-matrix" toolName="Skills Matrix" onSave={saveProgress} onExport={exportMatrix} getSerializedState={() => ({ uploadedFiles, skillEntries, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Total Employees</span><p className="text-3xl font-bold">{skillEntries.length}</p></Card>
            <Card className="p-4"><Target className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Skills Tracked</span><p className="text-3xl font-bold">{SKILL_CATEGORIES.length}</p></Card>
            <Card className="p-4"><TrendingUp className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Avg Team Level</span><p className="text-3xl font-bold">{Math.round(getSkillDistribution().reduce((sum, s) => sum + s.avgScore, 0) / SKILL_CATEGORIES.length)}%</p></Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Average Skill Levels Across Team</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getSkillDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="avgScore" fill="#ffa536" name="Average Proficiency" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Skill Gap Analysis</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => <Alert key={i} className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">{tip}</AlertDescription></Alert>)}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Team Skills Inventory</h3>
              <Button onClick={addEmployee} size="sm" data-testid="button-add-employee"><Plus className="w-4 h-4 mr-1" /> Add Employee</Button>
            </div>

            <div className="space-y-6">
              {skillEntries.map((entry) => (
                <Card key={entry.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between mb-4">
                    <Input value={entry.employee} onChange={(e) => updateEmployee(entry.id, 'employee', e.target.value)} className="font-semibold text-xl w-1/2" data-testid={`input-name-${entry.id}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeEmployee(entry.id)} data-testid={`button-remove-${entry.id}`}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-1">Role</label>
                    <Input value={entry.role} onChange={(e) => updateEmployee(entry.id, 'role', e.target.value)} data-testid={`input-role-${entry.id}`} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Skill Levels</h4>
                      <div className="space-y-3">
                        {SKILL_CATEGORIES.map(skill => (
                          <div key={skill}>
                            <label className="text-sm block mb-1">{skill}</label>
                            <Select value={entry.skills[skill] || "none"} onValueChange={(v) => updateSkill(entry.id, skill, v)}>
                              <SelectTrigger data-testid={`select-${skill}-${entry.id}`}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="expert">Expert</SelectItem>
                                <SelectItem value="proficient">Proficient</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Skill Radar (Top 6 Skills)</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={getRadarData(entry)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
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
