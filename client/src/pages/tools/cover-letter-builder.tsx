import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CoverLetterBuilder() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [strengths, setStrengths] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const saveProgress = () => {
    localStorage.setItem('coverLetterFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('coverLetterData', JSON.stringify({ company, role, strengths }));
    localStorage.setItem('coverLetterDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generateCoverLetter = () => {
    const letter = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${role} position at ${company}.\n\nMy Key Strengths:\n${strengths}\n\nI am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my background aligns with your needs.\n\nBest regards`;
    setCoverLetter(letter);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${company}-${role}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, company, role, strengths, coverLetter, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('coverLetterData');
    if (s) {
      const data = JSON.parse(s);
      setCompany(data.company || "");
      setRole(data.role || "");
      setStrengths(data.strengths || "");
    }
    const f = localStorage.getItem('coverLetterFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Cover Letter Builder</h1>
          <p className="text-muted-foreground mb-6">Create professional cover letters tailored to specific roles</p>

          <ToolUtilityBar
            toolId="cover-letter-builder"
            toolName="Cover Letter Builder"
            onSave={saveProgress}
            onExport={exportLetter}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Build Your Letter</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google, Stripe, OpenAI" />
              </div>
              <div>
                <label className="text-sm font-medium">Role Title</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Senior Engineer, Product Manager" />
              </div>
              <div>
                <label className="text-sm font-medium">Your Key Strengths (bullet points)</label>
                <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="• Experience with X\n• Track record in Y" rows={4} />
              </div>
              <Button onClick={generateCoverLetter} className="w-full gap-2 bg-secondary">
                <Lightbulb className="w-4 h-4" />
                Generate Cover Letter
              </Button>
            </div>
          </Card>

          {coverLetter && (
            <Card className="p-6 mb-6 bg-blue-50">
              <h3 className="font-bold mb-3">Your Cover Letter</h3>
              <p className="text-sm whitespace-pre-wrap">{coverLetter}</p>
            </Card>
          )}

          <Button className="w-full gap-2 bg-primary" onClick={exportLetter} data-testid="button-export-letter">
            <Download className="w-4 h-4" />
            Export Cover Letter
          </Button>
        </div>
      </div>
    </>
  );
}
