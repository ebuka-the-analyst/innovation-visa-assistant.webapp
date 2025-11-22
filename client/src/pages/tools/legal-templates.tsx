import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TEMPLATES = [
  {id:"1",name:"Articles of Association",category:"Legal",pages:4,desc:"Company governance document"},
  {id:"2",name:"Founder Agreement",category:"Legal",pages:3,desc:"Equity & IP assignment"},
  {id:"3",name:"Employment Contract",category:"HR",pages:2,desc:"Team member agreements"},
  {id:"4",name:"NDA Template",category:"Legal",pages:2,desc:"Confidentiality agreement"},
  {id:"5",name:"Privacy Policy",category:"Legal",pages:5,desc:"Data protection policy"},
  {id:"6",name:"Terms of Service",category:"Legal",pages:4,desc:"User terms agreement"}
];

export default function LegalTemplates() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const saveProgress = () => {
    localStorage.setItem('legalTemplatesFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('legalTemplatesDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportTemplate = () => {
    const t = TEMPLATES.find(x => x.id === selected);
    if (!t) return;
    const content = `LEGAL TEMPLATE: ${t.name}\n\nCategory: ${t.category}\nPages: ${t.pages}\nDescription: ${t.desc}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, selected, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('legalTemplatesFiles');
    if (s) setUploadedFiles(JSON.parse(s));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Legal Templates</h1>
          <p className="text-muted-foreground mb-6">Professional templates for your business</p>

          <ToolUtilityBar
            toolId="legal-templates"
            toolName="Legal Templates"
            onSave={saveProgress}
            onExport={exportTemplate}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Tabs defaultValue="templates" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="templates">
              <div className="grid gap-3">
                {TEMPLATES.map(t => (
                  <Card key={t.id} className="p-4 cursor-pointer hover-elevate" onClick={() => setSelected(t.id)}>
                    <div className="flex gap-3">
                      <FileText className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.category} • {t.pages} pages • {t.desc}</p>
                      </div>
                      {selected === t.id && <span className="text-primary">✓</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="guide">
              <Card className="p-4"><h3 className="font-bold mb-2">How to Use Legal Templates</h3><ul className="space-y-2 text-sm"><li>1. Select a template from the list</li><li>2. Download and customize for your needs</li><li>3. Have legal counsel review</li><li>4. Upload signed copies for storage</li><li>5. Share with stakeholders</li></ul></Card>
            </TabsContent>
          </Tabs>

          <Button className="w-full gap-2 bg-primary" onClick={exportTemplate} data-testid="button-export-template">
            <Download className="w-4 h-4" />
            Export Selected Template
          </Button>
        </div>
      </div>
    </>
  );
}
