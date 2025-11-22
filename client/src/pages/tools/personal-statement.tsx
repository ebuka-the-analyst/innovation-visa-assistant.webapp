import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PersonalStatement() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [name, setName] = useState("");
  const [background, setBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [vision, setVision] = useState("");
  const [statement, setStatement] = useState("");

  const saveProgress = () => {
    localStorage.setItem('personalStatementFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('personalStatementData', JSON.stringify({ name, background, achievements, vision }));
    localStorage.setItem('personalStatementDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generateStatement = () => {
    const ps = `Personal Statement - ${name}\n\nBackground:\n${background}\n\nKey Achievements:\n${achievements}\n\nMy Vision:\n${vision}\n\nThis experience has shaped my commitment to excellence and innovation.`;
    setStatement(ps);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportStatement = () => {
    const blob = new Blob([statement], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-statement-${name}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, name, background, achievements, vision, statement, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('personalStatementData');
    if (s) {
      const data = JSON.parse(s);
      setName(data.name || "");
      setBackground(data.background || "");
      setAchievements(data.achievements || "");
      setVision(data.vision || "");
    }
    const f = localStorage.getItem('personalStatementFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Personal Statement Builder</h1>
          <p className="text-muted-foreground mb-6">Create a compelling personal profile and statement</p>

          <ToolUtilityBar
            toolId="personal-statement"
            toolName="Personal Statement"
            onSave={saveProgress}
            onExport={exportStatement}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Build Your Statement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Background & Experience</label>
                <Textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Your educational & professional background" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Key Achievements</label>
                <Textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Major accomplishments & milestones" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Your Vision</label>
                <Textarea value={vision} onChange={(e) => setVision(e.target.value)} placeholder="Your future goals & aspirations" rows={3} />
              </div>
              <Button onClick={generateStatement} className="w-full gap-2 bg-secondary">
                <Sparkles className="w-4 h-4" />
                Generate Statement
              </Button>
            </div>
          </Card>

          {statement && (
            <Card className="p-6 mb-6 bg-green-50">
              <h3 className="font-bold mb-3">Your Personal Statement</h3>
              <p className="text-sm whitespace-pre-wrap">{statement}</p>
            </Card>
          )}

          <Button className="w-full gap-2 bg-primary" onClick={exportStatement} data-testid="button-export-statement">
            <Download className="w-4 h-4" />
            Export Personal Statement
          </Button>
        </div>
      </div>
    </>
  );
}
