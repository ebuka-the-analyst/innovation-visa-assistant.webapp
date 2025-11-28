import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'cover-letter-builder',
  toolName: 'Cover Letter Builder',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you craft a compelling cover letter that positions your application strongly. A well-written cover letter can make the difference between approval and rejection. Let's create something impressive!",
  questions: [
    {
      id: 'company-name',
      question: "What company or organization are you addressing this cover letter to?",
      hint: "For visa applications, this might be the endorsing body. For jobs, use the company name.",
      fieldKey: 'company',
      minLength: 2
    },
    {
      id: 'role-title',
      question: "What role or position are you applying for, or what is the purpose of this letter?",
      hint: "Be specific about the role, visa category, or application purpose",
      fieldKey: 'role',
      minLength: 5
    },
    {
      id: 'background',
      question: "Tell me about your professional background. What's your experience and expertise?",
      hint: "Include years of experience, key achievements, and relevant qualifications",
      fieldKey: 'background',
      minLength: 80
    },
    {
      id: 'key-strengths',
      question: "What are your 3-5 key strengths or achievements that make you an excellent candidate?",
      hint: "Use bullet points or list format. Include measurable achievements where possible.",
      fieldKey: 'strengths',
      minLength: 100
    },
    {
      id: 'why-this-role',
      question: "Why are you interested in this specific opportunity? What excites you about it?",
      hint: "Show you've researched and understand what you're applying for",
      fieldKey: 'whyRole',
      minLength: 60
    },
    {
      id: 'value-proposition',
      question: "What unique value will you bring? How will you contribute to their success?",
      hint: "Focus on outcomes and impact, not just what you'll do",
      fieldKey: 'valueProposition',
      minLength: 60
    }
  ],
  completionMessage: "Excellent! You've provided great material for a compelling cover letter. I've captured your professional background, key strengths, and value proposition. I'm now generating your personalized cover letter."
};

export default function CoverLetterBuilder() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('cover-letter-builder-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [strengths, setStrengths] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('cover-letter-builder-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('cover-letter-builder-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.company) setCompany(answers.company);
    if (answers.role) setRole(answers.role);
    
    const strengthsList = [];
    if (answers.strengths) strengthsList.push(answers.strengths);
    if (answers.background) strengthsList.push(`Background: ${answers.background}`);
    setStrengths(strengthsList.join('\n\n'));
    
    const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${answers.role || role} position at ${answers.company || company}.

${answers.background ? `Professional Background:\n${answers.background}\n\n` : ''}${answers.whyRole ? `My Motivation:\n${answers.whyRole}\n\n` : ''}My Key Strengths and Achievements:
${answers.strengths || strengths}

${answers.valueProposition ? `What I Will Bring:\n${answers.valueProposition}\n\n` : ''}I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my background aligns with your needs.

Best regards`;

    setCoverLetter(letter);
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('coverLetterFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('coverLetterData', JSON.stringify({ company, role, strengths, coverLetter }));
    localStorage.setItem('coverLetterDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generateCoverLetter = () => {
    const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}.

My Key Strengths:
${strengths}

I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my background aligns with your needs.

Best regards`;
    setCoverLetter(letter);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const handleExportPdf = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${company}-${role}.txt`;
    a.click();
  };

  const handleExportWord = async () => {
    const strengthsList = strengths.split('\n').filter(s => s.trim());
    await generateWord({
      title: 'Cover Letter',
      subtitle: `${role} Position at ${company}`,
      filename: `cover-letter-${company}-${role}-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'heading', content: 'Application Details', level: 1 },
        { type: 'table', tableData: {
          headers: ['Field', 'Value'],
          rows: [
            ['Company', company || 'Not specified'],
            ['Role', role || 'Not specified'],
          ]
        }},
        { type: 'divider' },
        { type: 'heading', content: 'Key Strengths', level: 1 },
        { type: 'list', items: strengthsList.length > 0 ? strengthsList : ['No strengths listed'] },
        { type: 'divider' },
        { type: 'heading', content: 'Cover Letter', level: 1 },
        { type: 'paragraph', content: coverLetter || 'No cover letter generated yet.' },
      ],
      metadata: {
        subject: 'Cover Letter for Job Application',
        keywords: ['cover letter', 'job application', company, role],
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const getSerializedState = () => ({ uploadedFiles, company, role, strengths, coverLetter, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('coverLetterData');
    if (s) {
      const data = JSON.parse(s);
      setCompany(data.company || "");
      setRole(data.role || "");
      setStrengths(data.strengths || "");
      setCoverLetter(data.coverLetter || "");
    }
    const f = localStorage.getItem('coverLetterFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Cover Letter Builder</h1>
              <p className="text-muted-foreground">Create professional cover letters tailored to specific roles</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Cover Letter Best Practices</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>A compelling cover letter should:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Be tailored to the specific role/application</li>
                      <li>Highlight your most relevant achievements</li>
                      <li>Show you understand what they're looking for</li>
                      <li>Include measurable results and outcomes</li>
                      <li>Be concise - ideally one page</li>
                    </ul>
                  </div>
                </Card>
                {coverLetter && (
                  <Card className="p-6">
                    <h3 className="font-bold mb-3">Preview</h3>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{coverLetter.substring(0, 200)}...</p>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="cover-letter-builder"
                toolName="Cover Letter Builder"
                onSave={saveProgress}
                onExportPdf={handleExportPdf}
                onExportWord={handleExportWord}
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
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google, Stripe, OpenAI" data-testid="input-company" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role Title</label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Senior Engineer, Product Manager" data-testid="input-role" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Your Key Strengths (bullet points)</label>
                    <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="• Experience with X&#10;• Track record in Y" rows={4} data-testid="textarea-strengths" />
                  </div>
                  <Button onClick={generateCoverLetter} className="w-full gap-2 bg-secondary" data-testid="button-generate">
                    <Lightbulb className="w-4 h-4" />
                    Generate Cover Letter
                  </Button>
                </div>
              </Card>

              {coverLetter && (
                <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-bold mb-3">Your Cover Letter</h3>
                  <p className="text-sm whitespace-pre-wrap">{coverLetter}</p>
                </Card>
              )}

              <Button className="w-full gap-2 bg-primary" onClick={handleExportPdf} data-testid="button-export-letter">
                <Download className="w-4 h-4" />
                Export Cover Letter
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
