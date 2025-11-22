import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Award, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface AdvisorProfile {
  id: string;
  name: string;
  title: string;
  expertise: string;
  contribution: string;
}

export default function AdvisoryBoardProfiles() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [advisors, setAdvisors] = useState<AdvisorProfile[]>([{ id: "1", name: "", title: "", expertise: "", contribution: "" }]);

  const saveProgress = () => {
    localStorage.setItem('advisoryBoardFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('advisoryBoardData', JSON.stringify({ advisors }));
    localStorage.setItem('advisoryBoardDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addAdvisor = () => {
    setAdvisors([...advisors, { id: Date.now().toString(), name: "", title: "", expertise: "", contribution: "" }]);
  };

  const removeAdvisor = (id: string) => {
    setAdvisors(advisors.filter(a => a.id !== id));
  };

  const updateAdvisor = (id: string, field: string, value: string) => {
    setAdvisors(advisors.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const exportProfiles = () => {
    const content = `ADVISORY BOARD PROFILES\n\n${advisors.map(a => `${a.name}\nTitle: ${a.title}\nExpertise: ${a.expertise}\nContribution: ${a.contribution}`).join('\n\n---\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advisory-board-profiles.txt';
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, advisors, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('advisoryBoardData');
    if (s) {
      const data = JSON.parse(s);
      setAdvisors(data.advisors || [{ id: "1", name: "", title: "", expertise: "", contribution: "" }]);
    }
    const f = localStorage.getItem('advisoryBoardFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Advisory Board Profiles</h1>
          <p className="text-muted-foreground mb-6">Document your advisory board members and their expertise</p>

          <ToolUtilityBar
            toolId="advisory-board-profiles"
            toolName="Advisory Board Profiles"
            onSave={saveProgress}
            onExport={exportProfiles}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="space-y-4 mb-6">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="p-4 border-l-4 border-primary">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <Input value={advisor.name} onChange={(e) => updateAdvisor(advisor.id, "name", e.target.value)} placeholder="Full Name" />
                    <Input value={advisor.title} onChange={(e) => updateAdvisor(advisor.id, "title", e.target.value)} placeholder="Title / Position" />
                    <div>
                      <label className="text-sm font-medium">Expertise</label>
                      <Textarea value={advisor.expertise} onChange={(e) => updateAdvisor(advisor.id, "expertise", e.target.value)} placeholder="Areas of expertise" rows={2} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expected Contribution</label>
                      <Textarea value={advisor.contribution} onChange={(e) => updateAdvisor(advisor.id, "contribution", e.target.value)} placeholder="How they'll contribute to the company" rows={2} />
                    </div>
                  </div>
                  {advisors.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeAdvisor(advisor.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={addAdvisor} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Advisor
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportProfiles} data-testid="button-export-advisory-board">
            <Download className="w-4 h-4" />
            Export Advisory Board Profiles
          </Button>
        </div>
      </div>
    </>
  );
}
