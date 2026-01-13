import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Github, Video, Briefcase, Users, Award, Link, Plus, Trash2, 
  Download, Lightbulb, ExternalLink, Code, Presentation,
  GraduationCap, Building2, Star, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GithubProject {
  id: string;
  repoName: string;
  repoUrl: string;
  description: string;
  technologies: string[];
  stars?: number;
  relevance: string;
}

interface DemoVideo {
  id: string;
  title: string;
  url: string;
  duration: string;
  description: string;
  platform: "youtube" | "vimeo" | "loom" | "other";
  type: "mvp" | "pitch" | "technical" | "walkthrough";
}

interface PastProject {
  id: string;
  projectName: string;
  clientName?: string;
  role: string;
  description: string;
  outcomes: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  referenceAvailable: boolean;
}

interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
  yearsKnown: number;
  willingToProvide: "linkedin" | "email" | "letter" | "call";
}

interface Credential {
  id: string;
  type: "degree" | "certification" | "award" | "patent" | "publication";
  title: string;
  issuer: string;
  date: string;
  url?: string;
  relevance: string;
}

export default function FounderPortfolio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("github");
  
  const [githubProjects, setGithubProjects] = useState<GithubProject[]>([]);
  const [demos, setDemos] = useState<DemoVideo[]>([]);
  const [projects, setProjects] = useState<PastProject[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const [newGithub, setNewGithub] = useState<Partial<GithubProject>>({});
  const [newDemo, setNewDemo] = useState<Partial<DemoVideo>>({ platform: "youtube", type: "mvp" });
  const [newProject, setNewProject] = useState<Partial<PastProject>>({ referenceAvailable: false, technologies: [] });
  const [newReference, setNewReference] = useState<Partial<Reference>>({ willingToProvide: "email" });
  const [newCredential, setNewCredential] = useState<Partial<Credential>>({ type: "degree" });

  const calculateFounderScore = () => {
    let score = 0;
    
    if (githubProjects.length >= 3) score += 20;
    else if (githubProjects.length >= 1) score += 10;

    if (demos.length >= 2) score += 20;
    else if (demos.length >= 1) score += 10;

    if (projects.length >= 5) score += 20;
    else if (projects.length >= 3) score += 15;
    else if (projects.length >= 1) score += 10;

    if (references.length >= 3) score += 20;
    else if (references.length >= 2) score += 15;
    else if (references.length >= 1) score += 10;

    if (credentials.length >= 3) score += 20;
    else if (credentials.length >= 1) score += 10;

    return Math.min(100, score);
  };

  const addGithubProject = () => {
    if (!newGithub.repoName || !newGithub.repoUrl) {
      toast({ title: "Missing Information", description: "Please fill in repo name and URL", variant: "destructive" });
      return;
    }
    const project: GithubProject = {
      id: Date.now().toString(),
      repoName: newGithub.repoName!,
      repoUrl: newGithub.repoUrl!,
      description: newGithub.description || "",
      technologies: newGithub.technologies || [],
      stars: newGithub.stars,
      relevance: newGithub.relevance || ""
    };
    setGithubProjects([...githubProjects, project]);
    setNewGithub({});
    toast({ title: "Added", description: "GitHub project added" });
  };

  const addDemo = () => {
    if (!newDemo.title || !newDemo.url) {
      toast({ title: "Missing Information", description: "Please fill in demo details", variant: "destructive" });
      return;
    }
    const demo: DemoVideo = {
      id: Date.now().toString(),
      title: newDemo.title!,
      url: newDemo.url!,
      duration: newDemo.duration || "",
      description: newDemo.description || "",
      platform: newDemo.platform as any || "youtube",
      type: newDemo.type as any || "mvp"
    };
    setDemos([...demos, demo]);
    setNewDemo({ platform: "youtube", type: "mvp" });
    toast({ title: "Added", description: "Demo video added" });
  };

  const addProject = () => {
    if (!newProject.projectName || !newProject.role) {
      toast({ title: "Missing Information", description: "Please fill in project details", variant: "destructive" });
      return;
    }
    const project: PastProject = {
      id: Date.now().toString(),
      projectName: newProject.projectName!,
      clientName: newProject.clientName,
      role: newProject.role!,
      description: newProject.description || "",
      outcomes: newProject.outcomes || "",
      technologies: newProject.technologies || [],
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      endDate: newProject.endDate,
      referenceAvailable: newProject.referenceAvailable || false
    };
    setProjects([...projects, project]);
    setNewProject({ referenceAvailable: false, technologies: [] });
    toast({ title: "Added", description: "Past project added" });
  };

  const addReference = () => {
    if (!newReference.name || !newReference.email) {
      toast({ title: "Missing Information", description: "Please fill in reference details", variant: "destructive" });
      return;
    }
    const reference: Reference = {
      id: Date.now().toString(),
      name: newReference.name!,
      title: newReference.title || "",
      company: newReference.company || "",
      email: newReference.email!,
      phone: newReference.phone,
      relationship: newReference.relationship || "",
      yearsKnown: newReference.yearsKnown || 1,
      willingToProvide: newReference.willingToProvide as any || "email"
    };
    setReferences([...references, reference]);
    setNewReference({ willingToProvide: "email" });
    toast({ title: "Added", description: "Reference added" });
  };

  const addCredential = () => {
    if (!newCredential.title || !newCredential.issuer) {
      toast({ title: "Missing Information", description: "Please fill in credential details", variant: "destructive" });
      return;
    }
    const credential: Credential = {
      id: Date.now().toString(),
      type: newCredential.type as any || "degree",
      title: newCredential.title!,
      issuer: newCredential.issuer!,
      date: newCredential.date || new Date().toISOString().split('T')[0],
      url: newCredential.url,
      relevance: newCredential.relevance || ""
    };
    setCredentials([...credentials, credential]);
    setNewCredential({ type: "degree" });
    toast({ title: "Added", description: "Credential added" });
  };

  const exportPortfolio = () => {
    const portfolio = {
      generatedAt: new Date().toISOString(),
      founderScore: calculateFounderScore(),
      summary: {
        githubProjects: githubProjects.length,
        demoVideos: demos.length,
        pastProjects: projects.length,
        references: references.length,
        credentials: credentials.length
      },
      githubProjects,
      demoVideos: demos,
      pastProjects: projects,
      references: references.map(r => ({...r, email: "[REDACTED]", phone: "[REDACTED]"})),
      credentials,
      endorserStatement: `This founder has demonstrated technical capability through ${githubProjects.length} open-source projects, ${demos.length} demo videos, and ${projects.length} past projects with verifiable outcomes. ${references.length} professional references are available upon request, along with ${credentials.length} relevant credentials and qualifications.`
    };

    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "founder-capability-portfolio.json";
    a.click();
    
    toast({ title: "Exported", description: "Founder portfolio downloaded" });
  };

  const founderScore = calculateFounderScore();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">Founder Capability Portfolio</h1>
        <p className="text-muted-foreground">
          Build evidence that proves you can actually deliver what you promise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className={founderScore >= 70 ? "border-green-500" : founderScore >= 40 ? "border-yellow-500" : "border-red-500"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Capability Score</span>
              <Badge variant={founderScore >= 70 ? "default" : founderScore >= 40 ? "secondary" : "destructive"}>
                {founderScore >= 70 ? "Strong" : founderScore >= 40 ? "Moderate" : "Weak"}
              </Badge>
            </div>
            <div className="text-xl font-bold mb-2">{founderScore}/100</div>
            <Progress value={founderScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Github className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium">Code</span>
            </div>
            <div className="text-lg font-bold">{githubProjects.length}</div>
            <p className="text-xs text-muted-foreground">repositories</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Demos</span>
            </div>
            <div className="text-lg font-bold">{demos.length}</div>
            <p className="text-xs text-muted-foreground">videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <div className="text-lg font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">References</span>
            </div>
            <div className="text-lg font-bold">{references.length}</div>
            <p className="text-xs text-muted-foreground">available</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="github" className="flex items-center gap-2" data-testid="tab-github">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </TabsTrigger>
          <TabsTrigger value="demos" className="flex items-center gap-2" data-testid="tab-demos">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Demos</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2" data-testid="tab-projects">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2" data-testid="tab-references">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">References</span>
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2" data-testid="tab-credentials">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Credentials</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub & Code Repositories
              </CardTitle>
              <CardDescription>
                Link to your code that demonstrates technical capability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Repository Name *</Label>
                  <Input 
                    value={newGithub.repoName || ""} 
                    onChange={(e) => setNewGithub({...newGithub, repoName: e.target.value})}
                    placeholder="my-saas-platform"
                    data-testid="input-github-name"
                  />
                </div>
                <div>
                  <Label>Repository URL *</Label>
                  <Input 
                    value={newGithub.repoUrl || ""} 
                    onChange={(e) => setNewGithub({...newGithub, repoUrl: e.target.value})}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <Label>Technologies (comma-separated)</Label>
                  <Input 
                    value={(newGithub.technologies || []).join(", ")} 
                    onChange={(e) => setNewGithub({...newGithub, technologies: e.target.value.split(",").map(t => t.trim())})}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
                <div>
                  <Label>Stars (optional)</Label>
                  <Input 
                    type="number"
                    value={newGithub.stars || ""} 
                    onChange={(e) => setNewGithub({...newGithub, stars: parseInt(e.target.value)})}
                    placeholder="42"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description & Relevance</Label>
                  <Textarea 
                    value={newGithub.description || ""} 
                    onChange={(e) => setNewGithub({...newGithub, description: e.target.value})}
                    placeholder="Describe the project and how it demonstrates relevant skills..."
                    rows={3}
                  />
                </div>
              </div>
              
              <Button onClick={addGithubProject} className="w-full" data-testid="button-add-github">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>

              {githubProjects.length > 0 && (
                <div className="space-y-3">
                  {githubProjects.map((project) => (
                    <Card key={project.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{project.repoName}</span>
                            {project.stars && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Star className="h-3 w-3" /> {project.stars}
                              </Badge>
                            )}
                          </div>
                          <a 
                            href={project.repoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            {project.repoUrl} <ExternalLink className="h-3 w-3" />
                          </a>
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                              ))}
                            </div>
                          )}
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setGithubProjects(githubProjects.filter(g => g.id !== project.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Tips for Maximum Impact</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                        <li>• Include projects that demonstrate relevant technical skills</li>
                        <li>• Public repos are stronger evidence than private</li>
                        <li>• Recent activity shows ongoing capability</li>
                        <li>• Include any open-source contributions</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Demo Videos & Presentations
              </CardTitle>
              <CardDescription>
                Visual proof of your product and capability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Video Title *</Label>
                  <Input 
                    value={newDemo.title || ""} 
                    onChange={(e) => setNewDemo({...newDemo, title: e.target.value})}
                    placeholder="MVP Demo - November 2025"
                    data-testid="input-demo-title"
                  />
                </div>
                <div>
                  <Label>Video URL *</Label>
                  <Input 
                    value={newDemo.url || ""} 
                    onChange={(e) => setNewDemo({...newDemo, url: e.target.value})}
                    placeholder="https://www.loom.com/share/..."
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input 
                    value={newDemo.duration || ""} 
                    onChange={(e) => setNewDemo({...newDemo, duration: e.target.value})}
                    placeholder="3:45"
                  />
                </div>
                <div>
                  <Label>Platform</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newDemo.platform || "youtube"}
                    onChange={(e) => setNewDemo({...newDemo, platform: e.target.value as any})}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="loom">Loom</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Video Type</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newDemo.type || "mvp"}
                    onChange={(e) => setNewDemo({...newDemo, type: e.target.value as any})}
                  >
                    <option value="mvp">MVP Demo</option>
                    <option value="pitch">Pitch Presentation</option>
                    <option value="technical">Technical Walkthrough</option>
                    <option value="walkthrough">Product Walkthrough</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newDemo.description || ""} 
                    onChange={(e) => setNewDemo({...newDemo, description: e.target.value})}
                    placeholder="What does this video demonstrate..."
                    rows={2}
                  />
                </div>
              </div>
              
              <Button onClick={addDemo} className="w-full" data-testid="button-add-demo">
                <Plus className="h-4 w-4 mr-2" />
                Add Demo Video
              </Button>

              {demos.length > 0 && (
                <div className="space-y-3">
                  {demos.map((demo) => (
                    <Card key={demo.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{demo.title}</span>
                            <Badge variant="outline">{demo.type}</Badge>
                            {demo.duration && <Badge variant="secondary">{demo.duration}</Badge>}
                          </div>
                          <a 
                            href={demo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            Watch on {demo.platform} <ExternalLink className="h-3 w-3" />
                          </a>
                          {demo.description && (
                            <p className="text-sm text-muted-foreground mt-2">{demo.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDemos(demos.filter(d => d.id !== demo.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Past Projects & Experience
              </CardTitle>
              <CardDescription>
                Previous work that demonstrates capability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Project Name *</Label>
                  <Input 
                    value={newProject.projectName || ""} 
                    onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                    placeholder="Enterprise SaaS Platform"
                    data-testid="input-project-name"
                  />
                </div>
                <div>
                  <Label>Your Role *</Label>
                  <Input 
                    value={newProject.role || ""} 
                    onChange={(e) => setNewProject({...newProject, role: e.target.value})}
                    placeholder="Lead Developer / CTO"
                  />
                </div>
                <div>
                  <Label>Client/Company</Label>
                  <Input 
                    value={newProject.clientName || ""} 
                    onChange={(e) => setNewProject({...newProject, clientName: e.target.value})}
                    placeholder="ABC Corporation"
                  />
                </div>
                <div>
                  <Label>Technologies</Label>
                  <Input 
                    value={(newProject.technologies || []).join(", ")} 
                    onChange={(e) => setNewProject({...newProject, technologies: e.target.value.split(",").map(t => t.trim())})}
                    placeholder="Python, AWS, React"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description & Outcomes</Label>
                  <Textarea 
                    value={newProject.description || ""} 
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe the project, your contribution, and measurable outcomes..."
                    rows={3}
                  />
                </div>
              </div>
              
              <Button onClick={addProject} className="w-full" data-testid="button-add-project">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>

              {projects.length > 0 && (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Card key={project.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{project.projectName}</span>
                            {project.referenceAvailable && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Reference Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.role} {project.clientName && `at ${project.clientName}`}
                          </p>
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                              ))}
                            </div>
                          )}
                          {project.description && (
                            <p className="text-sm mt-2">{project.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setProjects(projects.filter(p => p.id !== project.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professional References
              </CardTitle>
              <CardDescription>
                People who can vouch for your capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Reference Name *</Label>
                  <Input 
                    value={newReference.name || ""} 
                    onChange={(e) => setNewReference({...newReference, name: e.target.value})}
                    placeholder="John Smith"
                    data-testid="input-reference-name"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={newReference.title || ""} 
                    onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                    placeholder="CTO"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input 
                    value={newReference.company || ""} 
                    onChange={(e) => setNewReference({...newReference, company: e.target.value})}
                    placeholder="Tech Corp Ltd"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={newReference.email || ""} 
                    onChange={(e) => setNewReference({...newReference, email: e.target.value})}
                    placeholder="john@techcorp.com"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input 
                    value={newReference.relationship || ""} 
                    onChange={(e) => setNewReference({...newReference, relationship: e.target.value})}
                    placeholder="Former Manager / Business Partner"
                  />
                </div>
                <div>
                  <Label>Willing to Provide</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newReference.willingToProvide || "email"}
                    onChange={(e) => setNewReference({...newReference, willingToProvide: e.target.value as any})}
                  >
                    <option value="email">Email Reference</option>
                    <option value="linkedin">LinkedIn Recommendation</option>
                    <option value="letter">Formal Letter</option>
                    <option value="call">Phone Call</option>
                  </select>
                </div>
              </div>
              
              <Button onClick={addReference} className="w-full" data-testid="button-add-reference">
                <Plus className="h-4 w-4 mr-2" />
                Add Reference
              </Button>

              {references.length > 0 && (
                <div className="space-y-3">
                  {references.map((ref) => (
                    <Card key={ref.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{ref.name}</span>
                            <Badge variant="outline">{ref.willingToProvide}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ref.title} at {ref.company}
                          </p>
                          <p className="text-sm mt-1">{ref.relationship}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setReferences(references.filter(r => r.id !== ref.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Credentials & Qualifications
              </CardTitle>
              <CardDescription>
                Degrees, certifications, awards, and publications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Type</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newCredential.type || "degree"}
                    onChange={(e) => setNewCredential({...newCredential, type: e.target.value as any})}
                    data-testid="select-credential-type"
                  >
                    <option value="degree">Degree</option>
                    <option value="certification">Certification</option>
                    <option value="award">Award</option>
                    <option value="patent">Patent</option>
                    <option value="publication">Publication</option>
                  </select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={newCredential.title || ""} 
                    onChange={(e) => setNewCredential({...newCredential, title: e.target.value})}
                    placeholder="MSc Computer Science"
                  />
                </div>
                <div>
                  <Label>Issuer *</Label>
                  <Input 
                    value={newCredential.issuer || ""} 
                    onChange={(e) => setNewCredential({...newCredential, issuer: e.target.value})}
                    placeholder="University of Oxford"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={newCredential.date || ""} 
                    onChange={(e) => setNewCredential({...newCredential, date: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>URL (certificate/publication link)</Label>
                  <Input 
                    value={newCredential.url || ""} 
                    onChange={(e) => setNewCredential({...newCredential, url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <Button onClick={addCredential} className="w-full" data-testid="button-add-credential">
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>

              {credentials.length > 0 && (
                <div className="space-y-3">
                  {credentials.map((cred) => (
                    <Card key={cred.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {cred.type === "degree" && <GraduationCap className="h-4 w-4 text-blue-500" />}
                            {cred.type === "certification" && <Award className="h-4 w-4 text-green-500" />}
                            {cred.type === "award" && <Star className="h-4 w-4 text-yellow-500" />}
                            {cred.type === "patent" && <Building2 className="h-4 w-4 text-purple-500" />}
                            {cred.type === "publication" && <Presentation className="h-4 w-4 text-pink-500" />}
                            <span className="font-medium">{cred.title}</span>
                            <Badge variant="outline">{cred.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cred.issuer} • {cred.date}
                          </p>
                          {cred.url && (
                            <a 
                              href={cred.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              View credential <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCredentials(credentials.filter(c => c.id !== cred.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Founder Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                Download evidence package for your endorser application
              </p>
            </div>
            <Button onClick={exportPortfolio} data-testid="button-export-portfolio">
              <Download className="h-4 w-4 mr-2" />
              Export Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
