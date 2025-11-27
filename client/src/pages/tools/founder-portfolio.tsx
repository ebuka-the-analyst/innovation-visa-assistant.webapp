import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { User, Github, Video, Briefcase, Award, Plus, Trash2 } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
  year: string;
}

interface Credential {
  id: string;
  title: string;
  issuer: string;
  year: string;
  url: string;
}

interface Reference {
  id: string;
  name: string;
  role: string;
  company: string;
  relationship: string;
  email: string;
}

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'founder-portfolio',
  toolName: 'Founder Capability Portfolio',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Your founder portfolio demonstrates your capability to execute your business plan. Let me help you compile your professional background, projects, credentials, and references in a compelling way.",
  questions: [
    {
      id: 'full-name',
      question: "What is your full name as it appears on official documents?",
      hint: "This should match your passport and visa application",
      fieldKey: 'full_name',
      minLength: 3
    },
    {
      id: 'professional-title',
      question: "What is your professional title or role? How do you describe yourself professionally?",
      hint: "Examples: CEO & Founder, CTO, Technical Director",
      fieldKey: 'professional_title',
      minLength: 3
    },
    {
      id: 'years-experience',
      question: "How many years of relevant professional experience do you have?",
      hint: "Focus on experience relevant to your visa business",
      fieldKey: 'years_experience'
    },
    {
      id: 'key-projects',
      question: "Describe 2-3 of your most impressive past projects. What were the outcomes?",
      hint: "Include quantifiable results and technologies used",
      fieldKey: 'key_projects',
      minLength: 100
    },
    {
      id: 'credentials',
      question: "What certifications, degrees, or credentials do you hold that are relevant to your business?",
      hint: "Include university degrees, professional certifications, and relevant training",
      fieldKey: 'credentials',
      minLength: 30
    },
    {
      id: 'linkedin-url',
      question: "What is your LinkedIn profile URL? Endorsers often verify founder backgrounds online.",
      hint: "Ensure your LinkedIn is up-to-date and professional",
      fieldKey: 'linkedin_url'
    },
    {
      id: 'references',
      question: "Who can vouch for your professional capabilities? List 2-3 references with their roles and companies.",
      hint: "Include people who can speak to your business and technical abilities",
      fieldKey: 'references',
      minLength: 50
    }
  ]
};

export default function FounderPortfolio() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedDate, setSavedDate] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    title: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    summary: '',
    yearsExperience: '',
    specializations: ''
  });

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: '', description: '', technologies: '', url: '', year: '' }
  ]);

  const [credentials, setCredentials] = useState<Credential[]>([
    { id: '1', title: '', issuer: '', year: '', url: '' }
  ]);

  const [references, setReferences] = useState<Reference[]>([
    { id: '1', name: '', role: '', company: '', relationship: '', email: '' }
  ]);

  const [demos, setDemos] = useState({
    demoUrl: '',
    demoDescription: '',
    mvpUrl: '',
    mvpDescription: ''
  });

  const getSerializedState = () => ({
    profile, projects, credentials, references, demos, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.profile) setProfile(state.profile);
    if (state.projects) setProjects(state.projects);
    if (state.credentials) setCredentials(state.credentials);
    if (state.references) setReferences(state.references);
    if (state.demos) setDemos(state.demos);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('founder-portfolio-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('founder-portfolio-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your portfolio has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('founder-portfolio-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculatePortfolioScore = () => {
    let score = 0;
    if (profile.fullName && profile.summary) score += 15;
    if (profile.linkedIn) score += 10;
    if (profile.github) score += 10;
    score += Math.min(projects.filter(p => p.name && p.description).length * 10, 30);
    score += Math.min(credentials.filter(c => c.title).length * 5, 15);
    score += Math.min(references.filter(r => r.name && r.email).length * 5, 15);
    if (demos.demoUrl || demos.mvpUrl) score += 5;
    return Math.min(score, 100);
  };

  const getSmartTips = () => {
    const tips = [];
    if (!profile.linkedIn) tips.push("Add your LinkedIn profile - endorsers often verify founder backgrounds");
    if (!profile.github) tips.push("Include GitHub to demonstrate technical capability");
    if (projects.filter(p => p.name).length < 3) tips.push("Showcase 3+ relevant past projects to demonstrate experience");
    if (credentials.filter(c => c.title).length === 0) tips.push("Add certifications or qualifications relevant to your business");
    if (references.filter(r => r.name).length < 2) tips.push("Include 2-3 professional references who can vouch for your capabilities");
    tips.push("Ensure all URLs are working and publicly accessible");
    tips.push("Tailor your portfolio to highlight experience relevant to your visa business");
    return tips;
  };

  const generateActionPlan = () => [
    { week: "Week 1", action: "Update LinkedIn profile with comprehensive work history", priority: "High" },
    { week: "Week 1", action: "Organize GitHub repositories and add READMEs", priority: "High" },
    { week: "Week 2", action: "Document 3-5 most relevant past projects with outcomes", priority: "Critical" },
    { week: "Week 2-3", action: "Gather credentials and certifications documentation", priority: "Medium" },
    { week: "Week 3", action: "Contact references and confirm their availability", priority: "High" },
    { week: "Week 4", action: "Create demo video or MVP walkthrough", priority: "High" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Founder Capability Portfolio',
      subtitle: `Portfolio Score: ${calculatePortfolioScore()}/100`,
      filename: `founder-portfolio-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Founder Profile', level: 1 },
        { type: 'paragraph', content: `Name: ${profile.fullName}` },
        { type: 'paragraph', content: `Title: ${profile.title}` },
        { type: 'paragraph', content: `Years Experience: ${profile.yearsExperience}` },
        { type: 'paragraph', content: `Specializations: ${profile.specializations}` },
        { type: 'paragraph', content: `LinkedIn: ${profile.linkedIn}` },
        { type: 'paragraph', content: `GitHub: ${profile.github}` },
        { type: 'paragraph', content: profile.summary },
        { type: 'divider' },
        { type: 'heading', content: 'Past Projects', level: 1 },
        ...projects.filter(p => p.name).map(p => ({ type: 'paragraph' as const, content: `${p.name} (${p.year}): ${p.description} | Technologies: ${p.technologies}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Credentials & Certifications', level: 1 },
        ...credentials.filter(c => c.title).map(c => ({ type: 'paragraph' as const, content: `${c.title} - ${c.issuer} (${c.year})` })),
        { type: 'divider' },
        { type: 'heading', content: 'Professional References', level: 1 },
        ...references.filter(r => r.name).map(r => ({ type: 'paragraph' as const, content: `${r.name}, ${r.role} at ${r.company}` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <ToolUtilityBar
          toolId="founder-portfolio"
          toolName="Founder Capability Portfolio"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Founder Capability Portfolio
            </CardTitle>
            <CardDescription>
              Showcase GitHub, demos, past projects, references & credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Portfolio Completeness</span>
                <span className="text-sm font-bold text-primary">{calculatePortfolioScore()}/100</span>
              </div>
              <Progress value={calculatePortfolioScore()} className="h-3" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" data-testid="tab-profile">
                  <User className="h-4 w-4 mr-2" />Profile
                </TabsTrigger>
                <TabsTrigger value="projects" data-testid="tab-projects">
                  <Briefcase className="h-4 w-4 mr-2" />Projects
                </TabsTrigger>
                <TabsTrigger value="credentials" data-testid="tab-credentials">
                  <Award className="h-4 w-4 mr-2" />Credentials
                </TabsTrigger>
                <TabsTrigger value="references" data-testid="tab-references">
                  <User className="h-4 w-4 mr-2" />References
                </TabsTrigger>
                <TabsTrigger value="demos" data-testid="tab-demos">
                  <Video className="h-4 w-4 mr-2" />Demos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      placeholder="Enter your full name"
                      data-testid="input-profile-name"
                    />
                  </div>
                  <div>
                    <Label>Professional Title</Label>
                    <Input
                      value={profile.title}
                      onChange={(e) => setProfile({...profile, title: e.target.value})}
                      placeholder="e.g., CEO & Founder, CTO"
                      data-testid="input-profile-title"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={profile.linkedIn}
                      onChange={(e) => setProfile({...profile, linkedIn: e.target.value})}
                      placeholder="https://linkedin.com/in/..."
                      data-testid="input-profile-linkedin"
                    />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input
                      value={profile.github}
                      onChange={(e) => setProfile({...profile, github: e.target.value})}
                      placeholder="https://github.com/..."
                      data-testid="input-profile-github"
                    />
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      value={profile.yearsExperience}
                      onChange={(e) => setProfile({...profile, yearsExperience: e.target.value})}
                      placeholder="e.g., 7+"
                      data-testid="input-profile-experience"
                    />
                  </div>
                  <div>
                    <Label>Key Specializations</Label>
                    <Input
                      value={profile.specializations}
                      onChange={(e) => setProfile({...profile, specializations: e.target.value})}
                      placeholder="e.g., Full-Stack Development, AI/ML"
                      data-testid="input-profile-specializations"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Professional Summary</Label>
                    <Textarea
                      value={profile.summary}
                      onChange={(e) => setProfile({...profile, summary: e.target.value})}
                      placeholder="Write a compelling summary of your background, expertise, and why you're qualified to execute this business..."
                      className="min-h-[120px]"
                      data-testid="input-profile-summary"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Past Projects & Achievements</h3>
                {projects.map((project, index) => (
                  <Card key={project.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].name = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Project name"
                          data-testid={`input-project-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Input
                          value={project.year}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].year = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="e.g., 2023"
                          data-testid={`input-project-year-${index}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description & Outcomes</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].description = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="Describe the project, your role, and measurable outcomes"
                          data-testid={`input-project-description-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Technologies Used</Label>
                        <Input
                          value={project.technologies}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].technologies = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="e.g., React, Node.js, PostgreSQL"
                          data-testid={`input-project-tech-${index}`}
                        />
                      </div>
                      <div>
                        <Label>URL (if available)</Label>
                        <Input
                          value={project.url}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[index].url = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="https://..."
                          data-testid={`input-project-url-${index}`}
                        />
                      </div>
                    </div>
                    {projects.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                        data-testid={`button-remove-project-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setProjects([...projects, { id: Date.now().toString(), name: '', description: '', technologies: '', url: '', year: '' }])}
                  data-testid="button-add-project"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Project
                </Button>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Credentials & Certifications</h3>
                {credentials.map((cred, index) => (
                  <Card key={cred.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Certification/Degree Title</Label>
                        <Input
                          value={cred.title}
                          onChange={(e) => {
                            const updated = [...credentials];
                            updated[index].title = e.target.value;
                            setCredentials(updated);
                          }}
                          placeholder="e.g., MSc Data Science, AWS Certified"
                          data-testid={`input-cred-title-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Issuing Organization</Label>
                        <Input
                          value={cred.issuer}
                          onChange={(e) => {
                            const updated = [...credentials];
                            updated[index].issuer = e.target.value;
                            setCredentials(updated);
                          }}
                          placeholder="e.g., University, AWS"
                          data-testid={`input-cred-issuer-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Year Obtained</Label>
                        <Input
                          value={cred.year}
                          onChange={(e) => {
                            const updated = [...credentials];
                            updated[index].year = e.target.value;
                            setCredentials(updated);
                          }}
                          placeholder="e.g., 2023"
                          data-testid={`input-cred-year-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Verification URL</Label>
                        <Input
                          value={cred.url}
                          onChange={(e) => {
                            const updated = [...credentials];
                            updated[index].url = e.target.value;
                            setCredentials(updated);
                          }}
                          placeholder="https://..."
                          data-testid={`input-cred-url-${index}`}
                        />
                      </div>
                    </div>
                    {credentials.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setCredentials(credentials.filter((_, i) => i !== index))}
                        data-testid={`button-remove-cred-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCredentials([...credentials, { id: Date.now().toString(), title: '', issuer: '', year: '', url: '' }])}
                  data-testid="button-add-credential"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Credential
                </Button>
              </TabsContent>

              <TabsContent value="references" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Professional References</h3>
                {references.map((ref, index) => (
                  <Card key={ref.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Reference Name</Label>
                        <Input
                          value={ref.name}
                          onChange={(e) => {
                            const updated = [...references];
                            updated[index].name = e.target.value;
                            setReferences(updated);
                          }}
                          placeholder="Full name"
                          data-testid={`input-ref-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Role/Title</Label>
                        <Input
                          value={ref.role}
                          onChange={(e) => {
                            const updated = [...references];
                            updated[index].role = e.target.value;
                            setReferences(updated);
                          }}
                          placeholder="e.g., CTO, Director"
                          data-testid={`input-ref-role-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={ref.company}
                          onChange={(e) => {
                            const updated = [...references];
                            updated[index].company = e.target.value;
                            setReferences(updated);
                          }}
                          placeholder="Company name"
                          data-testid={`input-ref-company-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={ref.email}
                          onChange={(e) => {
                            const updated = [...references];
                            updated[index].email = e.target.value;
                            setReferences(updated);
                          }}
                          placeholder="email@example.com"
                          data-testid={`input-ref-email-${index}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Relationship</Label>
                        <Input
                          value={ref.relationship}
                          onChange={(e) => {
                            const updated = [...references];
                            updated[index].relationship = e.target.value;
                            setReferences(updated);
                          }}
                          placeholder="e.g., Former Manager, Mentor, Co-founder"
                          data-testid={`input-ref-relationship-${index}`}
                        />
                      </div>
                    </div>
                    {references.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setReferences(references.filter((_, i) => i !== index))}
                        data-testid={`button-remove-ref-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setReferences([...references, { id: Date.now().toString(), name: '', role: '', company: '', relationship: '', email: '' }])}
                  data-testid="button-add-reference"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Reference
                </Button>
              </TabsContent>

              <TabsContent value="demos" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Demos & Prototypes</h3>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Demo Video URL</Label>
                      <Input
                        value={demos.demoUrl}
                        onChange={(e) => setDemos({...demos, demoUrl: e.target.value})}
                        placeholder="https://youtube.com/... or https://loom.com/..."
                        data-testid="input-demo-url"
                      />
                    </div>
                    <div>
                      <Label>Demo Description</Label>
                      <Textarea
                        value={demos.demoDescription}
                        onChange={(e) => setDemos({...demos, demoDescription: e.target.value})}
                        placeholder="Describe what the demo shows and key features"
                        data-testid="input-demo-description"
                      />
                    </div>
                    <div>
                      <Label>MVP/Prototype URL</Label>
                      <Input
                        value={demos.mvpUrl}
                        onChange={(e) => setDemos({...demos, mvpUrl: e.target.value})}
                        placeholder="https://..."
                        data-testid="input-mvp-url"
                      />
                    </div>
                    <div>
                      <Label>MVP Description</Label>
                      <Textarea
                        value={demos.mvpDescription}
                        onChange={(e) => setDemos({...demos, mvpDescription: e.target.value})}
                        placeholder="Describe the MVP functionality and current status"
                        data-testid="input-mvp-description"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
