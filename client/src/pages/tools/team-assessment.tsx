import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, X, Users, TrendingUp, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  technicalSkill: number;
  leadership: number;
  collaboration: number;
  innovation: number;
  reliability: number;
  notes: string;
}

export default function TeamAssessment() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "Alice Johnson", role: "Engineer", technicalSkill: 8, leadership: 7, collaboration: 8, innovation: 8, reliability: 9, notes: "Strong performer, ready for leadership" }
  ]);
  const [teamScore, setTeamScore] = useState(0);

  const calculateTeamScore = (memberList: TeamMember[]) => {
    if (memberList.length === 0) return 0;
    const avgScores = {
      tech: memberList.reduce((sum, m) => sum + m.technicalSkill, 0) / memberList.length,
      lead: memberList.reduce((sum, m) => sum + m.leadership, 0) / memberList.length,
      collab: memberList.reduce((sum, m) => sum + m.collaboration, 0) / memberList.length,
      innov: memberList.reduce((sum, m) => sum + m.innovation, 0) / memberList.length,
      reliable: memberList.reduce((sum, m) => sum + m.reliability, 0) / memberList.length,
    };
    return Math.round((Object.values(avgScores).reduce((a, b) => a + b, 0) / 5) * 10);
  };

  const saveProgress = () => {
    localStorage.setItem('teamAssessmentFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('teamAssessmentData', JSON.stringify({ members }));
    localStorage.setItem('teamAssessmentDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
    setTeamScore(calculateTeamScore(members));
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addMember = () => {
    setMembers([...members, { id: Date.now().toString(), name: "New Member", role: "Team Member", technicalSkill: 5, leadership: 5, collaboration: 5, innovation: 5, reliability: 5, notes: "" }]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateMember = (id: string, field: string, value: any) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const exportAssessment = () => {
    const content = `TEAM ASSESSMENT REPORT\n\nTeam Size: ${members.length}\nTeam Health Score: ${teamScore}/100\n\nMember Assessments:\n${members.map(m => `${m.name} (${m.role})\nTechnical: ${m.technicalSkill}/10 | Leadership: ${m.leadership}/10 | Collaboration: ${m.collaboration}/10 | Innovation: ${m.innovation}/10 | Reliability: ${m.reliability}/10\nNotes: ${m.notes}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-assessment.txt';
    a.click();
  };

  const getRadarData = () => {
    if (members.length === 0) return [];
    return [
      { category: "Technical", value: Math.round(members.reduce((sum, m) => sum + m.technicalSkill, 0) / members.length * 10) },
      { category: "Leadership", value: Math.round(members.reduce((sum, m) => sum + m.leadership, 0) / members.length * 10) },
      { category: "Collaboration", value: Math.round(members.reduce((sum, m) => sum + m.collaboration, 0) / members.length * 10) },
      { category: "Innovation", value: Math.round(members.reduce((sum, m) => sum + m.innovation, 0) / members.length * 10) },
      { category: "Reliability", value: Math.round(members.reduce((sum, m) => sum + m.reliability, 0) / members.length * 10) },
    ];
  };

  const getSerializedState = () => ({ uploadedFiles, members, savedDate, teamScore });

  useEffect(() => {
    const s = localStorage.getItem('teamAssessmentData');
    if (s) {
      const data = JSON.parse(s);
      setMembers(data.members);
      setTeamScore(calculateTeamScore(data.members));
    }
    const f = localStorage.getItem('teamAssessmentFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Team Talent Assessment</h1>
          <p className="text-muted-foreground mb-6">Evaluate team capabilities across multiple dimensions</p>

          <ToolUtilityBar
            toolId="team-assessment"
            toolName="Team Assessment"
            onSave={saveProgress}
            onExport={exportAssessment}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-blue-50"><p className="text-sm text-muted-foreground">Team Size</p><p className="text-3xl font-bold text-primary">{members.length}</p></Card>
            <Card className="p-4 bg-green-50"><p className="text-sm text-muted-foreground">Health Score</p><p className="text-3xl font-bold text-green-600">{teamScore}/100</p></Card>
          </div>

          {getRadarData().length > 0 && (
            <Card className="p-4 mb-6"><h3 className="font-bold mb-4">Team Capabilities</h3><ResponsiveContainer width="100%" height={400}><RadarChart data={getRadarData()}><PolarGrid/><PolarAngleAxis dataKey="category"/><PolarRadiusAxis/><Radar name="Avg Score" dataKey="value" stroke="#ffa536" fill="#ffa536" fillOpacity={0.5}/></RadarChart></ResponsiveContainer></Card>
          )}

          <h3 className="font-bold text-lg mb-4">Team Members</h3>
          <div className="space-y-3 mb-6">
            {members.map(member => (
              <Card key={member.id} className="p-4 border-l-4 border-primary">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Input value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} placeholder="Name" className="font-bold" />
                  <Input value={member.role} onChange={(e) => updateMember(member.id, "role", e.target.value)} placeholder="Role" />
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {["technicalSkill", "leadership", "collaboration", "innovation", "reliability"].map(skill => (
                    <div key={skill}>
                      <label className="text-xs font-semibold">{skill.split(/(?=[A-Z])/).slice(0, 1).join('')}</label>
                      <input type="range" min="0" max="10" value={member[skill as keyof TeamMember]} onChange={(e) => updateMember(member.id, skill, parseInt(e.target.value))} className="w-full" />
                      <span className="text-xs">{member[skill as keyof TeamMember]}/10</span>
                    </div>
                  ))}
                </div>
                <Textarea value={member.notes} onChange={(e) => updateMember(member.id, "notes", e.target.value)} placeholder="Notes and observations" rows={2} className="mb-2" />
                <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)}><X className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>

          <Button onClick={addMember} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Team Member
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportAssessment} data-testid="button-export-assessment">
            <Download className="w-4 h-4" />
            Export Assessment Report
          </Button>
        </div>
      </div>
    </>
  );
}
