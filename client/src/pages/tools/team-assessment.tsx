import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
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
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

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

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'team-assessment',
  toolName: 'Team Talent Assessment',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. I'll help you assess your team's capabilities across key dimensions - demonstrating you have the talent to execute your vision, which is critical for endorsing body approval. Let's evaluate your team together!",
  questions: [
    {
      id: 'team-size',
      question: "How many people are currently on your team? Include co-founders, employees, and key contractors.",
      hint: "Endorsers want to see a capable team that can deliver on your business plan",
      fieldKey: 'team_size'
    },
    {
      id: 'key-member',
      question: "Tell me about your most experienced team member. What is their role, background, and what unique skills do they bring?",
      hint: "Highlight relevant experience and achievements",
      fieldKey: 'key_member',
      minLength: 50
    },
    {
      id: 'technical-capabilities',
      question: "Rate your team's overall technical capabilities on a scale of 1-10. What technical skills are strongest?",
      hint: "Consider development, design, data analysis, and other technical competencies",
      fieldKey: 'technical_rating'
    },
    {
      id: 'leadership-experience',
      question: "What leadership and management experience does your team have? Include previous startup or corporate leadership roles.",
      hint: "Prior leadership experience strengthens your application",
      fieldKey: 'leadership_experience'
    },
    {
      id: 'skill-gaps',
      question: "What skill gaps exist in your current team? How do you plan to address them?",
      hint: "Being honest about gaps shows self-awareness and planning ability",
      fieldKey: 'skill_gaps'
    },
    {
      id: 'team-culture',
      question: "How would you describe your team culture and collaboration style? What values drive your team?",
      hint: "Strong culture indicates a cohesive, effective team",
      fieldKey: 'team_culture'
    }
  ]
};

export default function TeamAssessment() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('team-assessment-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('team-assessment-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('team-assessment-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.key_member) {
      const parts = answers.key_member.split(' ');
      const name = parts.slice(0, 2).join(' ') || 'Key Member';
      const role = parts.slice(2, 4).join(' ') || 'Team Lead';
      setMembers([{
        id: Date.now().toString(),
        name,
        role,
        technicalSkill: 8,
        leadership: 7,
        collaboration: 8,
        innovation: 7,
        reliability: 8,
        notes: answers.key_member
      }]);
    }
    setMode('traditional');
  };

  const { generateWord } = useWordExport();
  const { toast } = useToast();
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

  const handleExportPdf = () => {
    const content = `TEAM ASSESSMENT REPORT\n\nTeam Size: ${members.length}\nTeam Health Score: ${teamScore}/100\n\nMember Assessments:\n${members.map(m => `${m.name} (${m.role})\nTechnical: ${m.technicalSkill}/10 | Leadership: ${m.leadership}/10 | Collaboration: ${m.collaboration}/10 | Innovation: ${m.innovation}/10 | Reliability: ${m.reliability}/10\nNotes: ${m.notes}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-assessment.txt';
    a.click();
  };

  const handleExportWord = async () => {
    await generateWord({
      title: 'Team Assessment Report',
      subtitle: `Team Size: ${members.length} | Health Score: ${teamScore}/100`,
      filename: `team-assessment-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Overview', level: 1 },
        { type: 'score', score: { value: teamScore, max: 100, label: 'Team Health Score' } },
        { type: 'paragraph', content: `Total Team Members: ${members.length}` },
        { type: 'divider' },
        { type: 'heading', content: 'Team Capabilities Summary', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Capability', 'Average Score'],
            rows: [
              ['Technical', `${(members.reduce((sum, m) => sum + m.technicalSkill, 0) / members.length).toFixed(1)}/10`],
              ['Leadership', `${(members.reduce((sum, m) => sum + m.leadership, 0) / members.length).toFixed(1)}/10`],
              ['Collaboration', `${(members.reduce((sum, m) => sum + m.collaboration, 0) / members.length).toFixed(1)}/10`],
              ['Innovation', `${(members.reduce((sum, m) => sum + m.innovation, 0) / members.length).toFixed(1)}/10`],
              ['Reliability', `${(members.reduce((sum, m) => sum + m.reliability, 0) / members.length).toFixed(1)}/10`]
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Individual Member Assessments', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Name', 'Role', 'Technical', 'Leadership', 'Collaboration', 'Innovation', 'Reliability'],
            rows: members.map(m => [
              m.name,
              m.role,
              `${m.technicalSkill}/10`,
              `${m.leadership}/10`,
              `${m.collaboration}/10`,
              `${m.innovation}/10`,
              `${m.reliability}/10`
            ])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Member Notes', level: 1 },
        ...members.filter(m => m.notes).map(m => ({
          type: 'paragraph' as const,
          content: `${m.name} (${m.role}): ${m.notes}`
        }))
      ],
      metadata: {
        subject: 'Team Assessment Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['team', 'assessment', 'visa', 'innovator founder']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
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
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Team Talent Assessment</h1>
              <p className="text-muted-foreground">Evaluate team capabilities across multiple dimensions</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="team-assessment"
            toolName="Team Assessment"
            onSave={saveProgress}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
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

          <Button className="w-full gap-2 bg-primary" onClick={handleExportPdf} data-testid="button-export-assessment">
            <Download className="w-4 h-4" />
            Export Assessment Report
          </Button>
          </>
          )}
        </div>
      </div>
    </>
  );
}
