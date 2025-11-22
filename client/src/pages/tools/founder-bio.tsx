import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, User, Award, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function FounderBio() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState("");
  const [bio, setBio] = useState("");

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
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
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

          {bio && <Card className="p-6 mb-6 bg-purple-50"><p className="text-sm whitespace-pre-wrap">{bio}</p></Card>}

          <Button className="w-full gap-2 bg-primary" onClick={exportBio} data-testid="button-export-bio">
            <Download className="w-4 h-4" />
            Export Founder Biography
          </Button>
        </div>
      </div>
    </>
  );
}
