import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "quality-checklist",
  toolName: "Quality Checklist",
  agent: "sage",
  greeting: "Hello! I'm Sage, your compliance specialist. Let's verify your quality assurance practices to ensure your product meets the standards expected by UK endorsing bodies.",
  questions: [
    {
      id: "codeQuality",
      question: "Describe your code quality practices - testing, reviews, and automation.",
      hint: "Include test coverage, code review process, linting, automated testing",
      fieldKey: "codeQuality",
      minLength: 80
    },
    {
      id: "productQuality",
      question: "How do you ensure product quality before release?",
      hint: "Include UAT, performance testing, security audits, accessibility",
      fieldKey: "productQuality",
      minLength: 80
    },
    {
      id: "documentation",
      question: "What documentation do you maintain for your product and processes?",
      hint: "Include API docs, user guides, code documentation, deployment procedures",
      fieldKey: "documentation",
      minLength: 60
    },
    {
      id: "releaseProcess",
      question: "Describe your release process and rollback procedures.",
      hint: "Include release notes, rollback plan, monitoring, support training",
      fieldKey: "releaseProcess",
      minLength: 80
    },
    {
      id: "compliance",
      question: "What compliance and regulatory requirements do you meet?",
      hint: "Include data protection, accessibility, industry-specific requirements",
      fieldKey: "compliance",
      minLength: 60
    }
  ],
  completionMessage: "Excellent! Your quality assurance practices have been documented. This demonstrates the operational maturity endorsers expect."
};

const QUALITY_ITEMS = [
  { category: "Code Quality", items: ["Unit tests >80% coverage", "Code review process established", "Automated testing pipeline", "Linting & formatting enforced"] },
  { category: "Product Quality", items: ["User acceptance testing complete", "Performance benchmarks met", "Security audit passed", "Accessibility compliance verified"] },
  { category: "Documentation", items: ["API documentation complete", "User guide published", "Code documentation up-to-date", "Deployment procedures documented"] },
  { category: "Release Readiness", items: ["Release notes prepared", "Rollback plan documented", "Monitoring alerts configured", "Support team trained"] }
];

export default function QualityChecklist() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('quality-checklist-mode') as 'ai' | 'traditional') || 'ai';
  });
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
    localStorage.setItem('quality-checklist-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newChecked = { ...checked };
    if (answers.codeQuality?.length > 80) {
      QUALITY_ITEMS[0].items.forEach(item => newChecked[item] = true);
    }
    if (answers.productQuality?.length > 80) {
      QUALITY_ITEMS[1].items.forEach(item => newChecked[item] = true);
    }
    if (answers.documentation?.length > 60) {
      QUALITY_ITEMS[2].items.slice(0, 2).forEach(item => newChecked[item] = true);
    }
    if (answers.releaseProcess?.length > 80) {
      QUALITY_ITEMS[3].items.forEach(item => newChecked[item] = true);
    }
    setChecked(newChecked);
    setMode('traditional');
  };

  useEffect(() => {
    const s = localStorage.getItem('qualityChecklistData');
    if (s) {
      const data = JSON.parse(s);
      setChecked(data.checked || {});
    }
    const f = localStorage.getItem('qualityChecklistFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  const traditionalContent = (
    <>
      <div className="mb-4">
        <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
      </div>
      <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
      {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

      <Card className="p-4 mb-6 bg-green-50 dark:bg-green-950">
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
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold" data-testid="heading-quality-checklist">Quality Checklist</h1>
              <p className="text-muted-foreground">Verify quality assurance requirements before release</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          <ToolUtilityBar
            toolId="quality-checklist"
            toolName="Quality Checklist"
            onSave={saveProgress}
            onExport={exportChecklist}
            getSerializedState={getSerializedState}
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : traditionalContent}
        </div>
      </div>
    </>
  );
}
