import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
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

export default function TeamBios() {
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
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Team Bios</h1>
          <p className="text-muted-foreground mb-6">Create team member profiles and biographies</p>

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
        </div>
      </div>
    </>
  );
}
