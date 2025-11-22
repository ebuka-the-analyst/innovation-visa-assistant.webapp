import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const QUALITY_ITEMS = [
  { category: "Code Quality", items: ["Unit tests >80% coverage", "Code review process established", "Automated testing pipeline", "Linting & formatting enforced"] },
  { category: "Product Quality", items: ["User acceptance testing complete", "Performance benchmarks met", "Security audit passed", "Accessibility compliance verified"] },
  { category: "Documentation", items: ["API documentation complete", "User guide published", "Code documentation up-to-date", "Deployment procedures documented"] },
  { category: "Release Readiness", items: ["Release notes prepared", "Rollback plan documented", "Monitoring alerts configured", "Support team trained"] }
];

export default function QualityChecklist() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const saveProgress = () => {
    localStorage.setItem('qualityChecklistFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('qualityChecklistData', JSON.stringify({ checked }));
    localStorage.setItem('qualityChecklistDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const toggleItem = (item: string) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const exportChecklist = () => {
    const content = `QUALITY ASSURANCE CHECKLIST\n\n${QUALITY_ITEMS.map(cat => `${cat.category}:\n${cat.items.map(item => `${checked[item] ? '✓' : '○'} ${item}`).join('\n')}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quality-checklist.txt';
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, checked, savedDate });

  const totalItems = QUALITY_ITEMS.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = Object.values(checked).filter(Boolean).length;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  useEffect(() => {
    const s = localStorage.getItem('qualityChecklistData');
    if (s) {
      const data = JSON.parse(s);
      setChecked(data.checked || {});
    }
    const f = localStorage.getItem('qualityChecklistFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Quality Checklist</h1>
          <p className="text-muted-foreground mb-6">Verify quality assurance requirements before release</p>

          <ToolUtilityBar
            toolId="quality-checklist"
            toolName="Quality Checklist"
            onSave={saveProgress}
            onExport={exportChecklist}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-4 mb-6 bg-green-50">
            <div className="flex justify-between items-center">
              <span className="font-bold">Quality Readiness</span>
              <span className="text-lg font-bold text-green-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
              <div style={{ width: `${progressPercent}%` }} className="bg-green-600 h-3 rounded-full transition-all" />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">{completedItems}/{totalItems} items completed</p>
          </Card>

          <div className="space-y-6">
            {QUALITY_ITEMS.map((category) => (
              <div key={category.category}>
                <h3 className="font-bold mb-3 text-lg">{category.category}</h3>
                <div className="space-y-2 ml-2">
                  {category.items.map((item) => (
                    <div key={item} className="flex gap-3 items-center cursor-pointer p-2 hover:bg-secondary rounded-md" onClick={() => toggleItem(item)}>
                      <Checkbox checked={checked[item] || false} onCheckedChange={() => toggleItem(item)} data-testid={`checkbox-${item}`} />
                      <span className="text-sm flex-1">{item}</span>
                      {checked[item] && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full gap-2 bg-primary mt-6" onClick={exportChecklist} data-testid="button-export-checklist">
            <Download className="w-4 h-4" />
            Export Quality Checklist
          </Button>
        </div>
      </div>
    </>
  );
}
