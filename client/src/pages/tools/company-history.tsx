import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Calendar, Milestone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const DEFAULT_MILESTONES = [
  { year: "2020", event: "Company Founded", description: "Initial launch" },
  { year: "2021", event: "Series A Funding", description: "Raised $1M from investors" },
  { year: "2022", event: "First Product Launch", description: "MVP released to market" },
  { year: "2023", event: "Team Expansion", description: "Grew from 5 to 15 employees" }
];

export default function CompanyHistory() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [companyName, setCompanyName] = useState("");
  const [story, setStory] = useState("");

  const saveProgress = () => {
    localStorage.setItem('companyHistoryFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('companyHistoryData', JSON.stringify({ companyName, milestones, story }));
    localStorage.setItem('companyHistoryDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportHistory = () => {
    const content = `COMPANY HISTORY - ${companyName}\n\n${story}\n\nMilestones:\n${milestones.map(m => `${m.year}: ${m.event} - ${m.description}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-history-${companyName}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, companyName, milestones, story, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('companyHistoryData');
    if (s) {
      const data = JSON.parse(s);
      setCompanyName(data.companyName || "");
      setMilestones(data.milestones || DEFAULT_MILESTONES);
      setStory(data.story || "");
    }
    const f = localStorage.getItem('companyHistoryFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Company History</h1>
          <p className="text-muted-foreground mb-6">Document your company's founding story and milestones</p>

          <ToolUtilityBar
            toolId="company-history"
            toolName="Company History"
            onSave={saveProgress}
            onExport={exportHistory}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">Company Background</h3>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="mb-4" />
            <label className="text-sm font-medium">Our Story</label>
            <Textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="The founding story and vision of your company" rows={4} />
          </Card>

          <h3 className="font-bold mb-4">Key Milestones</h3>
          <div className="space-y-3 mb-6">
            {milestones.map((m, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-primary">{m.year}</p>
                    <p className="font-semibold">{m.event}</p>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full gap-2 bg-primary" onClick={exportHistory} data-testid="button-export-history">
            <Download className="w-4 h-4" />
            Export Company History
          </Button>
        </div>
      </div>
    </>
  );
}
