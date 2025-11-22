import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Plus, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PROCESS_TEMPLATES = [
  { id: "1", title: "Onboarding Process", steps: ["Welcome", "IT Setup", "Role Training", "First Project"] },
  { id: "2", title: "Development Process", steps: ["Planning", "Design", "Development", "Review", "Deploy"] },
  { id: "3", title: "Hiring Process", steps: ["Job Posting", "Screening", "Interview", "Offer", "Onboard"] },
  { id: "4", title: "Release Process", steps: ["Freeze", "Testing", "QA", "Deployment", "Monitor"] }
];

export default function ProcessDocs() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [processes, setProcesses] = useState(PROCESS_TEMPLATES);
  const [newProcess, setNewProcess] = useState("");

  const saveProgress = () => {
    localStorage.setItem('processDocsFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('processDocsDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportDocs = () => {
    const content = `PROCESS DOCUMENTATION\n\n${processes.map(p => `${p.title}:\n${p.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-documentation.txt';
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, processes, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('processDocsFiles');
    if (s) setUploadedFiles(JSON.parse(s));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Process Documentation</h1>
          <p className="text-muted-foreground mb-6">Document and organize your business processes</p>

          <ToolUtilityBar
            toolId="process-docs"
            toolName="Process Documentation"
            onSave={saveProgress}
            onExport={exportDocs}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="space-y-4 mb-6">
            {processes.map(p => (
              <Card key={p.id} className="p-4">
                <h3 className="font-bold mb-3">{p.title}</h3>
                <div className="space-y-2">
                  {p.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm">{i + 1}. {step}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full gap-2 bg-primary" onClick={exportDocs} data-testid="button-export-docs">
            <Download className="w-4 h-4" />
            Export Process Documentation
          </Button>
        </div>
      </div>
    </>
  );
}
