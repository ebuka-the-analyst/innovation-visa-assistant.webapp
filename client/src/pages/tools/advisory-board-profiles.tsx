import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, Award, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'advisory-board-profiles',
  toolName: 'Advisory Board Profiles',
  agent: 'atlas',
  greeting: "Hi! I'm Atlas, your Growth Strategist. Let's create compelling advisor profiles for your UK Innovator Founder Visa application. Endorsers carefully evaluate your advisory board's credentials - strong profiles demonstrate you've attracted quality mentors. Let's document your advisors!",
  questions: [
    {
      id: 'advisor-name-title',
      question: "Tell me about your first advisor. What's their full name, current title, and company?",
      hint: "Include their current position and any notable past roles or achievements",
      fieldKey: 'advisor1_name_title',
      minLength: 30
    },
    {
      id: 'advisor-expertise',
      question: "What are this advisor's key areas of expertise? What makes them uniquely qualified to advise your business?",
      hint: "Specific skills, industry knowledge, technical expertise, or network connections",
      fieldKey: 'advisor1_expertise',
      minLength: 80
    },
    {
      id: 'advisor-contribution',
      question: "How will this advisor contribute to your business? What specific value will they bring?",
      hint: "Strategic guidance, introductions, technical validation, fundraising support, industry insights",
      fieldKey: 'advisor1_contribution',
      minLength: 100
    },
    {
      id: 'advisor-credentials',
      question: "What credentials, achievements, or experience make this advisor credible for visa purposes?",
      hint: "Years of experience, notable companies, board positions, investments, or industry recognition",
      fieldKey: 'advisor1_credentials',
      minLength: 80
    },
    {
      id: 'additional-advisors',
      question: "Do you have additional advisors to document? Briefly describe any other advisory board members.",
      hint: "Name, title, expertise, and key contribution for each additional advisor",
      fieldKey: 'additional_advisors',
      minLength: 50
    }
  ],
  completionMessage: "Excellent profiles! You've documented compelling advisor credentials that will strengthen your visa application. Endorsers will appreciate seeing the caliber of expertise supporting your venture. I'm now creating your advisor profile cards."
};

interface AdvisorProfile {
  id: string;
  name: string;
  title: string;
  expertise: string;
  contribution: string;
}

export default function AdvisoryBoardProfiles() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('advisory-board-profiles-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('advisory-board-profiles-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [advisors, setAdvisors] = useState<AdvisorProfile[]>([{ id: "1", name: "", title: "", expertise: "", contribution: "" }]);

  const saveProgress = () => {
    localStorage.setItem('advisoryBoardFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('advisoryBoardData', JSON.stringify({ advisors }));
    localStorage.setItem('advisoryBoardDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addAdvisor = () => {
    setAdvisors([...advisors, { id: Date.now().toString(), name: "", title: "", expertise: "", contribution: "" }]);
  };

  const removeAdvisor = (id: string) => {
    setAdvisors(advisors.filter(a => a.id !== id));
  };

  const updateAdvisor = (id: string, field: string, value: string) => {
    setAdvisors(advisors.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const exportProfiles = () => {
    const content = `ADVISORY BOARD PROFILES\n\n${advisors.map(a => `${a.name}\nTitle: ${a.title}\nExpertise: ${a.expertise}\nContribution: ${a.contribution}`).join('\n\n---\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advisory-board-profiles.txt';
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, advisors, savedDate });

  useEffect(() => {
    localStorage.setItem('advisory-board-profiles-mode', mode);
  }, [mode]);

  useEffect(() => {
    const s = localStorage.getItem('advisoryBoardData');
    if (s) {
      const data = JSON.parse(s);
      setAdvisors(data.advisors || [{ id: "1", name: "", title: "", expertise: "", contribution: "" }]);
    }
    const f = localStorage.getItem('advisoryBoardFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newAdvisors: AdvisorProfile[] = [];
    if (answers.advisor1_name_title) {
      newAdvisors.push({
        id: 'ai-1-' + Date.now(),
        name: answers.advisor1_name_title?.split(',')[0]?.trim() || 'Advisor 1',
        title: answers.advisor1_name_title?.split(',')[1]?.trim() || 'Industry Expert',
        expertise: answers.advisor1_expertise || '',
        contribution: answers.advisor1_contribution || ''
      });
    }
    if (answers.additional_advisors) {
      const additionalNames = answers.additional_advisors.split(',');
      additionalNames.forEach((name: string, idx: number) => {
        if (name.trim()) {
          newAdvisors.push({
            id: `ai-${idx + 2}-` + Date.now(),
            name: name.trim(),
            title: 'Advisory Board Member',
            expertise: '',
            contribution: ''
          });
        }
      });
    }
    if (newAdvisors.length > 0) {
      setAdvisors(newAdvisors);
    }
    setMode('traditional');
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold mb-2">Advisory Board Profiles</h1>
              <p className="text-muted-foreground">Document your advisory board members and their expertise</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="advisory-board-profiles"
            toolName="Advisory Board Profiles"
            onSave={saveProgress}
            onExport={exportProfiles}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <div className="space-y-4 mb-6">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="p-4 border-l-4 border-primary">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <Input value={advisor.name} onChange={(e) => updateAdvisor(advisor.id, "name", e.target.value)} placeholder="Full Name" />
                    <Input value={advisor.title} onChange={(e) => updateAdvisor(advisor.id, "title", e.target.value)} placeholder="Title / Position" />
                    <div>
                      <label className="text-sm font-medium">Expertise</label>
                      <Textarea value={advisor.expertise} onChange={(e) => updateAdvisor(advisor.id, "expertise", e.target.value)} placeholder="Areas of expertise" rows={2} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expected Contribution</label>
                      <Textarea value={advisor.contribution} onChange={(e) => updateAdvisor(advisor.id, "contribution", e.target.value)} placeholder="How they'll contribute to the company" rows={2} />
                    </div>
                  </div>
                  {advisors.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeAdvisor(advisor.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={addAdvisor} className="w-full gap-2 mb-4 bg-secondary">
            <Plus className="w-4 h-4" />
            Add Advisor
          </Button>

          <Button className="w-full gap-2 bg-primary" onClick={exportProfiles} data-testid="button-export-advisory-board">
            <Download className="w-4 h-4" />
            Export Advisory Board Profiles
          </Button>
          </>
          )}
        </div>
      </div>
    </>
  );
}
