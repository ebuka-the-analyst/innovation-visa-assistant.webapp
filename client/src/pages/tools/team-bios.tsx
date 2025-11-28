import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Users, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  background: string;
}

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'team-bios',
  toolName: 'Team Bios',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. I'll help you craft compelling team biographies that showcase your team's expertise and credibility - essential for demonstrating capability to endorsing bodies. Let's build your team profiles together!",
  questions: [
    {
      id: 'founder-name',
      question: "What is the full name and title of your lead founder or CEO?",
      hint: "This will be the primary contact for your visa application",
      fieldKey: 'founder_name'
    },
    {
      id: 'founder-background',
      question: "Describe the founder's professional background, including education, previous roles, and key achievements. What makes them uniquely qualified to lead this venture?",
      hint: "Include degrees, certifications, notable companies, and specific accomplishments",
      fieldKey: 'founder_background',
      minLength: 100
    },
    {
      id: 'cofounder-info',
      question: "Do you have co-founders? If so, provide their names, roles, and brief backgrounds.",
      hint: "Complementary skills among co-founders strengthen your team profile",
      fieldKey: 'cofounder_info'
    },
    {
      id: 'key-team-members',
      question: "List any other key team members (employees or advisors) with their roles and relevant expertise.",
      hint: "Include anyone who significantly contributes to your business success",
      fieldKey: 'key_team'
    },
    {
      id: 'industry-experience',
      question: "What collective industry experience does your team have? How many years in your target market or related sectors?",
      hint: "Domain expertise demonstrates credibility and reduces execution risk",
      fieldKey: 'industry_experience'
    },
    {
      id: 'uk-connections',
      question: "Does anyone on your team have UK business experience, education, or professional connections?",
      hint: "UK ties strengthen your application and demonstrate market understanding",
      fieldKey: 'uk_connections'
    }
  ]
};

export default function TeamBios() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('team-bios-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('team-bios-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('team-bios-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newTeam: TeamMember[] = [];
    if (answers.founder_name && answers.founder_background) {
      newTeam.push({
        id: Date.now().toString(),
        name: answers.founder_name,
        role: 'Founder & CEO',
        background: answers.founder_background
      });
    }
    if (answers.cofounder_info) {
      newTeam.push({
        id: (Date.now() + 1).toString(),
        name: 'Co-Founder',
        role: 'Co-Founder',
        background: answers.cofounder_info
      });
    }
    if (newTeam.length > 0) {
      setTeam(newTeam);
    }
    setMode('traditional');
  };

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([{ id: "1", name: "", role: "", background: "" }]);

  const saveProgress = () => {
    localStorage.setItem('teamBiosFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('teamBiosData', JSON.stringify({ team }));
    localStorage.setItem('teamBiosDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addTeamMember = () => {
    setTeam([...team, { id: Date.now().toString(), name: "", role: "", background: "" }]);
  };

  const removeTeamMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const updateTeamMember = (id: string, field: string, value: string) => {
    setTeam(team.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const exportBios = () => {
    const content = `TEAM BIOS\n\n${team.map(m => `${m.name} - ${m.role}\n${m.background}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-bios.txt';
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, team, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('teamBiosData');
    if (s) {
      const data = JSON.parse(s);
      setTeam(data.team || [{ id: "1", name: "", role: "", background: "" }]);
    }
    const f = localStorage.getItem('teamBiosFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Team Bios</h1>
              <p className="text-muted-foreground">Create team member profiles and biographies</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="team-bios"
            toolName="Team Bios"
            onSave={saveProgress}
            onExport={exportBios}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="space-y-4 mb-6">
            {team.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <Input value={member.name} onChange={(e) => updateTeamMember(member.id, "name", e.target.value)} placeholder="Name" />
                    <Input value={member.role} onChange={(e) => updateTeamMember(member.id, "role", e.target.value)} placeholder="Role / Title" />
                    <Textarea value={member.background} onChange={(e) => updateTeamMember(member.id, "background", e.target.value)} placeholder="Background and expertise" rows={3} />
                  </div>
                  {team.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeTeamMember(member.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={addTeamMember} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Team Member
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportBios} data-testid="button-export-team-bios">
            <Download className="w-4 h-4" />
            Export Team Bios
          </Button>
          </>
          )}
        </div>
      </div>
    </>
  );
}
