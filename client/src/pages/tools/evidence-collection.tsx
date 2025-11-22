import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  { id: "1", name: "Business Documents", items: ["Business Plan", "Financial Statements", "Articles of Association", "Company Accounts"] },
  { id: "2", name: "Founder Documents", items: ["CV/Resume", "Proof of Identity", "Education Certificates", "Previous Work Experience"] },
  { id: "3", name: "Financial Evidence", items: ["Bank Statements (28 days)", "Tax Returns", "Funding Documentation", "Investment Proof"] },
  { id: "4", name: "Product Evidence", items: ["Product Screenshots", "User Testimonials", "Market Data", "Product Demo Link"] },
  { id: "5", name: "Market Documents", items: ["Market Research", "Competitor Analysis", "TAM/SAM/SOM", "Customer Interviews"] }
];

export default function EvidenceCollection() {
  const [collected, setCollected] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");

  const total = CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const done = Object.values(collected).filter(Boolean).length;
  const progress = Math.round((done / total) * 100);

  const saveProgress = () => {
    localStorage.setItem('evidenceCollectionProgress', JSON.stringify(collected));
    localStorage.setItem('evidenceCollectionFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('evidenceCollectionDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const exportManifest = () => {
    const report = `EVIDENCE COLLECTION MANIFEST\nDate: ${new Date().toLocaleDateString()}\nProgress: ${done}/${total}\nUploaded Files: ${uploadedFiles.length}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evidence-manifest.txt';
    a.click();
  };

  const getSerializedState = () => ({
    collected,
    uploadedFiles,
    savedDate
  });

  useEffect(() => {
    const saved = localStorage.getItem('evidenceCollectionProgress');
    if (saved) setCollected(JSON.parse(saved));
    const savedFiles = localStorage.getItem('evidenceCollectionFiles');
    if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Evidence Collection</h1>
          <p className="text-muted-foreground mb-6">Organize all documents for visa submission</p>

          <ToolUtilityBar
            toolId="evidence-collection"
            toolName="Evidence Collection"
            onSave={saveProgress}
            onExport={exportManifest}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton
              config={fileUploadConfigs.evidenceCollection}
              onFileSelected={handleFileUpload}
              variant="secondary"
            />
          </div>

          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-4 mb-6 bg-primary/10">
            <div className="flex justify-between items-center">
              <span className="font-bold">Collection Progress</span>
              <span className="text-lg font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div style={{ width: `${progress}%` }} className="bg-primary h-2 rounded-full transition-all" />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">{done}/{total} items collected</p>
          </Card>

          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <Card key={cat.id} className="p-4">
                <h3 className="font-bold mb-3">{cat.name}</h3>
                <div className="space-y-2">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Checkbox
                        checked={collected[`${cat.id}-${i}`] || false}
                        onCheckedChange={() => setCollected({
                          ...collected,
                          [`${cat.id}-${i}`]: !collected[`${cat.id}-${i}`]
                        })}
                        data-testid={`checkbox-${cat.id}-${i}`}
                      />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full mt-4 gap-2 bg-primary" onClick={exportManifest} data-testid="button-export-manifest">
            <Download className="w-4 h-4" />
            Export Evidence Manifest
          </Button>
        </div>
      </div>
    </>
  );
}
