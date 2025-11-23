import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, Award, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface LeaderProfile {
  id: string;
  name: string;
  currentRole: string;
  skillScores: { strategic: number; communication: number; technical: number; peopleManagement: number; innovation: number };
  developmentGoals: string;
  mentor: string;
}

export default function LeadershipDevelopment() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [leaders, setLeaders] = useState<LeaderProfile[]>([
    { id: "1", name: "John Doe", currentRole: "Engineering Manager", skillScores: { strategic: 70, communication: 85, technical: 90, peopleManagement: 75, innovation: 80 }, developmentGoals: "Improve strategic planning and business acumen", mentor: "VP Engineering" }
  ]);

  const saveProgress = () => {
    localStorage.setItem('leadershipDevFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('leadershipDevData', JSON.stringify({ leaders }));
    localStorage.setItem('leadershipDevDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addLeader = () => {
    setLeaders([...leaders, { id: Date.now().toString(), name: "New Leader", currentRole: "", skillScores: { strategic: 50, communication: 50, technical: 50, peopleManagement: 50, innovation: 50 }, developmentGoals: "", mentor: "" }]);
  };

  const removeLeader = (id: string) => setLeaders(leaders.filter(l => l.id !== id));

  const updateLeader = (id: string, field: string, value: any) => {
    setLeaders(leaders.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const updateSkillScore = (id: string, skill: string, value: number) => {
    setLeaders(leaders.map(l => l.id === id ? { ...l, skillScores: { ...l.skillScores, [skill]: value } } : l));
  };

  const exportPlan = () => {
    const avgOverallScore = leaders.reduce((sum, l) => sum + Object.values(l.skillScores).reduce((s, v) => s + v, 0) / 5, 0) / leaders.length;
    
    const content = `LEADERSHIP DEVELOPMENT PLAN\nGenerated: ${new Date().toLocaleDateString()}\n\nOVERVIEW\nTotal Leaders: ${leaders.length}\nAverage Overall Score: ${avgOverallScore.toFixed(0)}%\n\nLEADER PROFILES\n${leaders.map(l => `\n${l.name} - ${l.currentRole}\nSkill Assessment:\n  Strategic Thinking: ${l.skillScores.strategic}%\n  Communication: ${l.skillScores.communication}%\n  Technical Expertise: ${l.skillScores.technical}%\n  People Management: ${l.skillScores.peopleManagement}%\n  Innovation: ${l.skillScores.innovation}%\n\nDevelopment Goals: ${l.developmentGoals}\nMentor: ${l.mentor}\n`).join('\n')}\n\nRECOMMENDATIONS\n${getSmartRecommendations().join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadership-development.txt';
    a.click();
  };

  const getSmartRecommendations = () => {
    const tips = [];
    leaders.forEach(l => {
      const scores = Object.values(l.skillScores);
      const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;
      if (avgScore < 60) tips.push(`⚠️ ${l.name} needs intensive development - consider external coaching`);
      if (!l.mentor) tips.push(`📋 ${l.name} lacks mentor - assign senior leader`);
    });
    return tips.length ? tips : ["✅ Leadership pipeline is strong"];
  };

  const getSkillComparison = () => {
    return leaders.slice(0, 3).map(l => ({
      name: l.name.substring(0, 15),
      strategic: l.skillScores.strategic,
      communication: l.skillScores.communication,
      technical: l.skillScores.technical,
      peopleManagement: l.skillScores.peopleManagement,
      innovation: l.skillScores.innovation
    }));
  };

  const getRadarData = (leader: LeaderProfile) => [
    { skill: "Strategic", score: leader.skillScores.strategic },
    { skill: "Communication", score: leader.skillScores.communication },
    { skill: "Technical", score: leader.skillScores.technical },
    { skill: "People Mgmt", score: leader.skillScores.peopleManagement },
    { skill: "Innovation", score: leader.skillScores.innovation }
  ];

  useEffect(() => {
    const s = localStorage.getItem('leadershipDevData');
    if (s) setLeaders(JSON.parse(s).leaders);
    const f = localStorage.getItem('leadershipDevFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('leadershipDevDate');
    if (d) setSavedDate(d);
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Leadership Development</h1>
          <p className="text-muted-foreground mb-6">Assess skills and create development roadmaps</p>

          <ToolUtilityBar toolId="leadership-development" toolName="Leadership Development" onSave={saveProgress} onExport={exportPlan} getSerializedState={() => ({ uploadedFiles, leaders, savedDate })} />

          {savedDate && <Alert className="mb-6 border-green-200 bg-green-50"><AlertCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-700">Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Total Leaders</span><p className="text-3xl font-bold">{leaders.length}</p></Card>
            <Card className="p-4"><Award className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">With Mentors</span><p className="text-3xl font-bold">{leaders.filter(l => l.mentor).length}</p></Card>
            <Card className="p-4"><TrendingUp className="w-5 h-5 text-primary mb-2" /><span className="font-semibold block">Avg Overall Score</span><p className="text-3xl font-bold">{leaders.length ? (leaders.reduce((sum, l) => sum + Object.values(l.skillScores).reduce((s, v) => s + v, 0) / 5, 0) / leaders.length).toFixed(0) : 0}%</p></Card>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Skill Comparison (Top 3 Leaders)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getSkillComparison()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="strategic" fill="#ffa536" name="Strategic" />
                <Bar dataKey="communication" fill="#11b6e9" name="Communication" />
                <Bar dataKey="technical" fill="#8b5cf6" name="Technical" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Smart Recommendations</h3>
            <div className="space-y-2">
              {getSmartRecommendations().map((tip, i) => <Alert key={i} className="border-blue-200 bg-blue-50"><AlertDescription className="text-blue-700">{tip}</AlertDescription></Alert>)}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Leader Profiles</h3>
              <Button onClick={addLeader} size="sm" data-testid="button-add-leader"><Plus className="w-4 h-4 mr-1" /> Add Leader</Button>
            </div>

            <div className="space-y-6">
              {leaders.map((leader) => (
                <Card key={leader.id} className="p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between mb-4">
                    <Input value={leader.name} onChange={(e) => updateLeader(leader.id, 'name', e.target.value)} className="font-semibold text-xl w-1/2" data-testid={`input-name-${leader.id}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeLeader(leader.id)} data-testid={`button-remove-${leader.id}`}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="text-sm font-medium block mb-1">Current Role</label><Input value={leader.currentRole} onChange={(e) => updateLeader(leader.id, 'currentRole', e.target.value)} data-testid={`input-role-${leader.id}`} /></div>
                    <div><label className="text-sm font-medium block mb-1">Mentor</label><Input value={leader.mentor} onChange={(e) => updateLeader(leader.id, 'mentor', e.target.value)} placeholder="e.g., VP Engineering" data-testid={`input-mentor-${leader.id}`} /></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium mb-3">Skill Assessment</h4>
                      {Object.entries(leader.skillScores).map(([skill, score]) => (
                        <div key={skill} className="mb-3">
                          <div className="flex justify-between mb-1">
                            <label className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <span className="text-sm font-medium">{score}%</span>
                          </div>
                          <input type="range" min="0" max="100" step="5" value={score} onChange={(e) => updateSkillScore(leader.id, skill, Number(e.target.value))} className="w-full" data-testid={`slider-${skill}-${leader.id}`} />
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Skill Radar</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={getRadarData(leader)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Development Goals</label>
                    <Textarea value={leader.developmentGoals} onChange={(e) => updateLeader(leader.id, 'developmentGoals', e.target.value)} placeholder="What skills or competencies should this leader develop?" rows={3} data-testid={`textarea-goals-${leader.id}`} />
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
