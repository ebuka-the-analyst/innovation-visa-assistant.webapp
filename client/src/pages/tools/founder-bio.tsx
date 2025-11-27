import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, User, Award, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'founder-bio',
  toolName: 'Founder Biography Builder',
  agent: 'nova',
  greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you craft a compelling founder biography that showcases your expertise and credibility to endorsing bodies. Let's tell your story!",
  questions: [
    {
      id: 'name-role',
      question: "What's your full name and your role/title in the company?",
      hint: "Include any relevant suffixes or titles (e.g., Dr., PhD, MBA)",
      fieldKey: 'nameRole',
      minLength: 10
    },
    {
      id: 'education',
      question: "What's your educational background? Include degrees, institutions, and any relevant certifications.",
      hint: "List degrees chronologically, including field of study and institution name",
      fieldKey: 'education',
      minLength: 50
    },
    {
      id: 'experience',
      question: "Describe your professional experience. What relevant roles have you held and at which companies?",
      hint: "Focus on experience relevant to your current venture - highlight leadership roles, industry expertise, and achievements",
      fieldKey: 'experience',
      minLength: 100
    },
    {
      id: 'achievements',
      question: "What are your key achievements and recognitions? Include awards, publications, patents, or notable accomplishments.",
      hint: "Be specific with numbers and outcomes - e.g., 'Grew revenue by 300%' or 'Led team of 50 engineers'",
      fieldKey: 'achievements',
      minLength: 80
    },
    {
      id: 'uk-connection',
      question: "What's your connection to the UK and why are you committed to building your business here?",
      hint: "Include UK education, work experience, partnerships, or strategic reasons for UK expansion",
      fieldKey: 'ukConnection',
      minLength: 50
    }
  ],
  completionMessage: "Great work! Your founder biography details are complete. I've populated the form fields - click 'Generate Biography' to create your formatted bio, then export it for your visa application."
};

export default function FounderBio() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState("");
  const [bio, setBio] = useState("");
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('founder-bio-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('founder-bio-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.nameRole) {
      const parts = answers.nameRole.split(',');
      setName(parts[0]?.trim() || '');
      setRole(parts[1]?.trim() || parts.length > 1 ? parts.slice(1).join(',').trim() : '');
    }
    if (answers.education) setEducation(answers.education);
    if (answers.experience) setExperience(answers.experience);
    if (answers.achievements) setAchievements(answers.achievements);
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('founderBioFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('founderBioData', JSON.stringify({ name, role, education, experience, achievements }));
    localStorage.setItem('founderBioDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generateBio = () => {
    const biography = `FOUNDER BIOGRAPHY\n\n${name}\n${role}\n\nBackground:\n${education}\n\nProfessional Experience:\n${experience}\n\nAchievements:\n${achievements}\n\nLeadership Philosophy:\n${name} brings a wealth of experience and proven track record of success to the organization.`;
    setBio(biography);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportBio = () => {
    const blob = new Blob([bio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founder-bio-${name}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, name, role, education, experience, achievements, bio, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('founderBioData');
    if (s) {
      const data = JSON.parse(s);
      setName(data.name || "");
      setRole(data.role || "");
      setEducation(data.education || "");
      setExperience(data.experience || "");
      setAchievements(data.achievements || "");
    }
    const f = localStorage.getItem('founderBioFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Founder Biography</h1>
          <p className="text-muted-foreground mb-6">Create a compelling founder biography for investors</p>

          <ToolUtilityBar
            toolId="founder-bio"
            toolName="Founder Biography"
            onSave={saveProgress}
            onExport={exportBio}
            getSerializedState={getSerializedState}
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
            />
          ) : (
          <>
          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4 flex gap-2"><User className="w-5 h-5" />Founder Information</h3>
            <div className="space-y-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Founder Title (e.g., CEO & Co-Founder)" />
              <div>
                <label className="text-sm font-medium">Education</label>
                <Textarea value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Degrees and certifications" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Professional Experience</label>
                <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Previous roles and companies" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Key Achievements</label>
                <Textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Awards, recognitions, notable accomplishments" rows={3} />
              </div>
              <Button onClick={generateBio} className="w-full gap-2 bg-secondary">
                <Award className="w-4 h-4" />
                Generate Biography
              </Button>
            </div>
          </Card>

          {bio && <Card className="p-6 mb-6 bg-purple-50 dark:bg-purple-950"><p className="text-sm whitespace-pre-wrap">{bio}</p></Card>}

          <Button className="w-full gap-2 bg-primary" onClick={exportBio} data-testid="button-export-bio">
            <Download className="w-4 h-4" />
            Export Founder Biography
          </Button>
          </>
          )}
        </div>
      </div>
    </>
  );
}
