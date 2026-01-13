import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "personal-statement",
  toolName: "Personal Statement Builder",
  agent: "sage",
  greeting: "Hello! I'm Sage, your compliance and documentation specialist. Let's craft a compelling personal statement that demonstrates your qualifications and vision for your UK business venture.",
  questions: [
    {
      id: "full_name",
      question: "What is your full legal name?",
      hint: "As it appears on your official documents",
      fieldKey: "fullName"
    },
    {
      id: "background",
      question: "Tell me about your educational and professional background. What experiences have prepared you for this venture?",
      hint: "Include degrees, work experience, relevant achievements",
      fieldKey: "background",
      minLength: 100
    },
    {
      id: "achievements",
      question: "What are your key achievements and accomplishments? Include specific metrics where possible.",
      hint: "Example: 'Led a team of 15, grew revenue by 200%, launched products used by 50,000 users'",
      fieldKey: "achievements",
      minLength: 80
    },
    {
      id: "skills",
      question: "What unique skills and expertise do you bring to this business?",
      hint: "Technical skills, leadership abilities, industry knowledge",
      fieldKey: "skills",
      minLength: 50
    },
    {
      id: "vision",
      question: "What is your vision for your business in the UK? Why are you passionate about this venture?",
      hint: "Describe your long-term goals and personal motivation",
      fieldKey: "vision",
      minLength: 80
    },
    {
      id: "uk_commitment",
      question: "Why the UK specifically? What commitment are you making to building your business here?",
      hint: "Endorsers want to see genuine commitment to the UK market",
      fieldKey: "ukCommitment",
      minLength: 50
    }
  ],
  completionMessage: "Wonderful! I've captured the key elements of your personal statement. Let me now help you format this into a compelling narrative."
};

export default function PersonalStatement() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('personal-statement-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('personal-statement-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('personal-statement-mode', mode);
  }, [mode]);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [name, setName] = useState("");
  const [background, setBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [vision, setVision] = useState("");
  const [statement, setStatement] = useState("");

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.fullName) setName(answers.fullName);
    if (answers.background) setBackground(answers.background);
    if (answers.achievements) setAchievements(answers.achievements);
    if (answers.vision) setVision(answers.vision + (answers.ukCommitment ? '\n\n' + answers.ukCommitment : ''));
    if (answers.skills) {
      setAchievements(prev => prev + '\n\nKey Skills:\n' + answers.skills);
    }
    setMode('traditional');
  };

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

  const handleExportPdf = () => {
    const blob = new Blob([statement], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-statement-${name}.txt`;
    a.click();
  };

  const handleExportWord = async () => {
    const achievementsList = achievements.split('\n').filter(a => a.trim());
    await generateWord({
      title: 'Personal Statement',
      subtitle: name || 'Personal Profile',
      filename: `personal-statement-${name || 'document'}-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Personal Information', level: 1 },
        { type: 'table', tableData: {
          headers: ['Field', 'Value'],
          rows: [
            ['Name', name || 'Not specified'],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Background & Experience', level: 1 },
        { type: 'paragraph', content: background || 'No background information provided.' },
        { type: 'divider' },
        { type: 'heading', content: 'Key Achievements', level: 1 },
        { type: 'list', items: achievementsList.length > 0 ? achievementsList : ['No achievements listed'] },
        { type: 'divider' },
        { type: 'heading', content: 'Vision & Aspirations', level: 1 },
        { type: 'paragraph', content: vision || 'No vision statement provided.' },
        { type: 'divider' },
        { type: 'heading', content: 'Full Personal Statement', level: 1 },
        { type: 'paragraph', content: statement || 'No personal statement generated yet.' },
      ],
      metadata: {
        subject: 'Personal Statement',
        keywords: ['personal statement', 'profile', name],
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
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
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Personal Statement Builder</h1>
          <p className="text-muted-foreground mb-6">Create a compelling personal profile and statement</p>

          <ToolUtilityBar
            toolId="personal-statement"
            toolName="Personal Statement"
            onSave={saveProgress}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
          />

          <div className="flex justify-end mt-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <div className="mt-6">
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            </div>
          ) : (
          <>
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
          </>
          )}
        </div>
      </div>
    </>
  );
}
