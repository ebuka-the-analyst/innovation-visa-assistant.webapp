import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Calendar, Milestone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'company-history',
  toolName: 'Company History',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you document your company's founding story and key milestones - essential for demonstrating your business experience and track record to endorsing bodies. A compelling company history shows you have the experience to execute your vision. Let's get started!",
  questions: [
    {
      id: 'company-name',
      question: "What is your company name? This will be used throughout your documentation.",
      hint: "Use your registered company name or the name you plan to register in the UK",
      fieldKey: 'companyName',
      minLength: 2
    },
    {
      id: 'founding-story',
      question: "Tell me the founding story of your company. What inspired you to start this business? What problem were you trying to solve?",
      hint: "Include personal motivation, the 'aha moment', and what gap in the market you identified",
      fieldKey: 'story',
      minLength: 100
    },
    {
      id: 'milestone-1',
      question: "What was your first major milestone? When did it happen and why was it significant?",
      hint: "This could be incorporation, first customer, MVP launch, or initial funding",
      fieldKey: 'milestone1',
      minLength: 50
    },
    {
      id: 'milestone-2',
      question: "What was your next key achievement? Describe the second milestone in your journey.",
      hint: "Think about product launches, funding rounds, key hires, or market expansion",
      fieldKey: 'milestone2',
      minLength: 50
    },
    {
      id: 'milestone-3',
      question: "What's another significant milestone? This helps show progression and growth.",
      hint: "Revenue targets, team growth, partnerships, or technology breakthroughs",
      fieldKey: 'milestone3',
      minLength: 50
    },
    {
      id: 'milestone-4',
      question: "What's your most recent achievement or where are you now in your journey?",
      hint: "Current status, recent wins, and what brings you to pursue the UK Innovator Founder visa",
      fieldKey: 'milestone4',
      minLength: 50
    }
  ],
  completionMessage: "Excellent! You've documented a compelling company history. This narrative demonstrates your entrepreneurial journey and business acumen - key factors endorsing bodies look for. I'm now populating your timeline with these milestones."
};

const DEFAULT_MILESTONES = [
  { year: "2020", event: "Company Founded", description: "Initial launch" },
  { year: "2021", event: "Series A Funding", description: "Raised $1M from investors" },
  { year: "2022", event: "First Product Launch", description: "MVP released to market" },
  { year: "2023", event: "Team Expansion", description: "Grew from 5 to 15 employees" }
];

export default function CompanyHistory() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('company-history-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [companyName, setCompanyName] = useState("");
  const [story, setStory] = useState("");

  useEffect(() => {
    localStorage.setItem('company-history-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.companyName) {
      setCompanyName(answers.companyName);
    }
    if (answers.story) {
      setStory(answers.story);
    }
    
    const newMilestones = [];
    
    if (answers.milestone1) {
      const yearMatch = answers.milestone1.match(/\b(19|20)\d{2}\b/);
      newMilestones.push({
        year: yearMatch ? yearMatch[0] : "2020",
        event: "First Milestone",
        description: answers.milestone1.substring(0, 100)
      });
    }
    
    if (answers.milestone2) {
      const yearMatch = answers.milestone2.match(/\b(19|20)\d{2}\b/);
      newMilestones.push({
        year: yearMatch ? yearMatch[0] : "2021",
        event: "Second Milestone",
        description: answers.milestone2.substring(0, 100)
      });
    }
    
    if (answers.milestone3) {
      const yearMatch = answers.milestone3.match(/\b(19|20)\d{2}\b/);
      newMilestones.push({
        year: yearMatch ? yearMatch[0] : "2022",
        event: "Third Milestone",
        description: answers.milestone3.substring(0, 100)
      });
    }
    
    if (answers.milestone4) {
      const yearMatch = answers.milestone4.match(/\b(19|20)\d{2}\b/);
      newMilestones.push({
        year: yearMatch ? yearMatch[0] : "2023",
        event: "Current Status",
        description: answers.milestone4.substring(0, 100)
      });
    }
    
    if (newMilestones.length > 0) {
      setMilestones(newMilestones);
    }
    
    setMode('traditional');
  };

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
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Company History</h1>
              <p className="text-muted-foreground">Document your company's founding story and milestones</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Why Company History Matters</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Endorsing bodies want to see your track record and entrepreneurial journey. A well-documented company history demonstrates:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Your ability to execute and achieve milestones</li>
                      <li>Business experience relevant to your new venture</li>
                      <li>Pattern of growth and progression</li>
                      <li>Lessons learned that inform your UK plans</li>
                    </ul>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Current Progress</h3>
                  {companyName && <p className="text-sm"><strong>Company:</strong> {companyName}</p>}
                  <p className="text-sm"><strong>Milestones Documented:</strong> {milestones.length}</p>
                  {story && <p className="text-sm mt-2 text-muted-foreground">{story.substring(0, 100)}...</p>}
                </Card>
              </div>
            </div>
          ) : (
            <>
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
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="mb-4" data-testid="input-company-name" />
                <label className="text-sm font-medium">Our Story</label>
                <Textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="The founding story and vision of your company" rows={4} data-testid="textarea-story" />
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
