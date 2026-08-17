import { useEffect, useMemo, useState } from "react";
import {
  Github,
  Video,
  Briefcase,
  Users,
  Award,
  Plus,
  Trash2,
  Download,
  Lightbulb,
  ExternalLink,
  Code,
  Star,
  Loader2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface EvidenceSource {
  source?: string;
}

interface GithubProject extends EvidenceSource {
  id: string;
  repoName: string;
  repoUrl: string;
  description: string;
  technologies: string[];
  stars?: number;
  relevance: string;
}

interface DemoVideo extends EvidenceSource {
  id: string;
  title: string;
  url: string;
  duration: string;
  description: string;
  platform: "youtube" | "vimeo" | "loom" | "other";
  type: "mvp" | "pitch" | "technical" | "walkthrough";
}

interface PastProject extends EvidenceSource {
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

interface Reference extends EvidenceSource {
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

interface Credential extends EvidenceSource {
  id: string;
  type: "degree" | "certification" | "award" | "patent" | "publication";
  title: string;
  issuer: string;
  date: string;
  url?: string;
  relevance: string;
}

interface PortfolioState {
  githubUsername: string;
  githubProjects: GithubProject[];
  demos: DemoVideo[];
  projects: PastProject[];
  references: Reference[];
  credentials: Credential[];
}

interface AccountEvidence {
  latestCompletedPlan: null | {
    id: string;
    businessName: string;
    founderEducation: string;
    founderWorkHistory: string;
    founderAchievements: string;
    relevantProjects: string;
    techStack: string;
    createdAt?: string | null;
  };
  documents: Array<{
    id: string;
    name: string;
    category: string;
    status?: string;
    createdAt?: string;
  }>;
  suggestions: {
    githubProjects: GithubProject[];
    projects: PastProject[];
    educationLines: string[];
    credentialDocuments: Array<{ id: string; name: string; category: string }>;
  };
}

interface PortfolioResponse {
  portfolio: PortfolioState;
  score: number;
  status?: string;
  updatedAt?: string | null;
  accountEvidence?: AccountEvidence;
  imported?: number | { githubProjects?: number; projects?: number };
}

const EMPTY_PORTFOLIO: PortfolioState = {
  githubUsername: "",
  githubProjects: [],
  demos: [],
  projects: [],
  references: [],
  credentials: [],
};

function calculateFounderScore(portfolio: PortfolioState) {
  let score = 0;

  if (portfolio.githubProjects.length >= 3) score += 20;
  else if (portfolio.githubProjects.length >= 1) score += 10;

  if (portfolio.demos.length >= 2) score += 20;
  else if (portfolio.demos.length >= 1) score += 10;

  if (portfolio.projects.length >= 5) score += 20;
  else if (portfolio.projects.length >= 3) score += 15;
  else if (portfolio.projects.length >= 1) score += 10;

  if (portfolio.references.length >= 3) score += 20;
  else if (portfolio.references.length >= 2) score += 15;
  else if (portfolio.references.length >= 1) score += 10;

  if (portfolio.credentials.length >= 3) score += 20;
  else if (portfolio.credentials.length >= 1) score += 10;

  return Math.min(100, score);
}

function sourceLabel(source?: string) {
  if (source === "business-plan") return "Imported from business plan";
  if (source === "github-public-api") return "Imported from public GitHub";
  return source ? source.replace(/-/g, " ") : "Added by you";
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body as T;
}

function EvidenceBadge({ source }: { source?: string }) {
  return (
    <Badge variant="outline" className="text-[11px]">
      {sourceLabel(source)}
    </Badge>
  );
}

export default function FounderPortfolio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("github");
  const [portfolio, setPortfolio] = useState<PortfolioState>(EMPTY_PORTFOLIO);
  const [accountEvidence, setAccountEvidence] = useState<AccountEvidence | undefined>();
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingAccount, setIsImportingAccount] = useState(false);
  const [isImportingGithub, setIsImportingGithub] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  const [newGithub, setNewGithub] = useState<Partial<GithubProject>>({ technologies: [] });
  const [newDemo, setNewDemo] = useState<Partial<DemoVideo>>({ platform: "youtube", type: "mvp" });
  const [newProject, setNewProject] = useState<Partial<PastProject>>({ referenceAvailable: false, technologies: [] });
  const [newReference, setNewReference] = useState<Partial<Reference>>({ willingToProvide: "email", yearsKnown: 1 });
  const [newCredential, setNewCredential] = useState<Partial<Credential>>({ type: "degree" });

  const founderScore = useMemo(() => calculateFounderScore(portfolio), [portfolio]);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const data = await requestJson<PortfolioResponse>("/api/founder-portfolio");
      const next = data.portfolio || EMPTY_PORTFOLIO;
      setPortfolio(next);
      setAccountEvidence(data.accountEvidence);
      setUpdatedAt(data.updatedAt || null);
      setGithubUsername(next.githubUsername || "");
    } catch (error) {
      toast({
        title: "Could not load founder evidence",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPortfolio();
  }, []);

  const savePortfolio = async (next: PortfolioState, successMessage?: string) => {
    setIsSaving(true);
    try {
      const data = await requestJson<PortfolioResponse>("/api/founder-portfolio", {
        method: "PUT",
        body: JSON.stringify({ portfolio: next }),
      });
      setPortfolio(data.portfolio || next);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      if (successMessage) {
        toast({ title: "Saved", description: successMessage });
      }
      return data.portfolio || next;
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const addGithubProject = async () => {
    if (!newGithub.repoName?.trim() || !newGithub.repoUrl?.trim()) {
      toast({ title: "Missing information", description: "Please fill in the repository name and URL.", variant: "destructive" });
      return;
    }
    const item: GithubProject = {
      id: `${Date.now()}`,
      repoName: newGithub.repoName.trim(),
      repoUrl: newGithub.repoUrl.trim(),
      description: newGithub.description?.trim() || "",
      technologies: newGithub.technologies || [],
      stars: newGithub.stars,
      relevance: newGithub.relevance?.trim() || "",
      source: "manual",
    };
    const saved = await savePortfolio({ ...portfolio, githubProjects: [...portfolio.githubProjects, item] }, "Repository added to your account-backed portfolio.");
    if (saved) setNewGithub({ technologies: [] });
  };

  const addDemo = async () => {
    if (!newDemo.title?.trim() || !newDemo.url?.trim()) {
      toast({ title: "Missing information", description: "Please fill in the demo title and URL.", variant: "destructive" });
      return;
    }
    const item: DemoVideo = {
      id: `${Date.now()}`,
      title: newDemo.title.trim(),
      url: newDemo.url.trim(),
      duration: newDemo.duration?.trim() || "",
      description: newDemo.description?.trim() || "",
      platform: (newDemo.platform as DemoVideo["platform"]) || "youtube",
      type: (newDemo.type as DemoVideo["type"]) || "mvp",
      source: "manual",
    };
    const saved = await savePortfolio({ ...portfolio, demos: [...portfolio.demos, item] }, "Demo evidence added to your account-backed portfolio.");
    if (saved) setNewDemo({ platform: "youtube", type: "mvp" });
  };

  const addProject = async () => {
    if (!newProject.projectName?.trim() || !newProject.role?.trim()) {
      toast({ title: "Missing information", description: "Please fill in the project name and your role.", variant: "destructive" });
      return;
    }
    const item: PastProject = {
      id: `${Date.now()}`,
      projectName: newProject.projectName.trim(),
      clientName: newProject.clientName?.trim(),
      role: newProject.role.trim(),
      description: newProject.description?.trim() || "",
      outcomes: newProject.outcomes?.trim() || "",
      technologies: newProject.technologies || [],
      startDate: newProject.startDate || new Date().toISOString().slice(0, 10),
      endDate: newProject.endDate,
      referenceAvailable: Boolean(newProject.referenceAvailable),
      source: "manual",
    };
    const saved = await savePortfolio({ ...portfolio, projects: [...portfolio.projects, item] }, "Project evidence added to your account-backed portfolio.");
    if (saved) setNewProject({ referenceAvailable: false, technologies: [] });
  };

  const addReference = async () => {
    if (!newReference.name?.trim() || !newReference.email?.trim()) {
      toast({ title: "Missing information", description: "Please fill in the reference name and email.", variant: "destructive" });
      return;
    }
    const item: Reference = {
      id: `${Date.now()}`,
      name: newReference.name.trim(),
      title: newReference.title?.trim() || "",
      company: newReference.company?.trim() || "",
      email: newReference.email.trim(),
      phone: newReference.phone?.trim(),
      relationship: newReference.relationship?.trim() || "",
      yearsKnown: Number(newReference.yearsKnown || 1),
      willingToProvide: (newReference.willingToProvide as Reference["willingToProvide"]) || "email",
      source: "manual",
    };
    const saved = await savePortfolio({ ...portfolio, references: [...portfolio.references, item] }, "Reference added to your account-backed portfolio.");
    if (saved) setNewReference({ willingToProvide: "email", yearsKnown: 1 });
  };

  const addCredential = async () => {
    if (!newCredential.title?.trim() || !newCredential.issuer?.trim()) {
      toast({ title: "Missing information", description: "Please fill in the credential title and issuer.", variant: "destructive" });
      return;
    }
    const item: Credential = {
      id: `${Date.now()}`,
      type: (newCredential.type as Credential["type"]) || "degree",
      title: newCredential.title.trim(),
      issuer: newCredential.issuer.trim(),
      date: newCredential.date || new Date().toISOString().slice(0, 10),
      url: newCredential.url?.trim(),
      relevance: newCredential.relevance?.trim() || "",
      source: "manual",
    };
    const saved = await savePortfolio({ ...portfolio, credentials: [...portfolio.credentials, item] }, "Credential added to your account-backed portfolio.");
    if (saved) setNewCredential({ type: "degree" });
  };

  const removeItem = async (key: keyof Pick<PortfolioState, "githubProjects" | "demos" | "projects" | "references" | "credentials">, itemId: string) => {
    const current = portfolio[key] as Array<{ id: string }>;
    const next = { ...portfolio, [key]: current.filter((item) => item.id !== itemId) } as PortfolioState;
    await savePortfolio(next, "Evidence item removed.");
  };

  const importAccountEvidence = async () => {
    setIsImportingAccount(true);
    try {
      const data = await requestJson<PortfolioResponse>("/api/founder-portfolio/import-account", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setPortfolio(data.portfolio || portfolio);
      setAccountEvidence(data.accountEvidence || accountEvidence);
      const imported = typeof data.imported === "object" && data.imported
        ? Number(data.imported.githubProjects || 0) + Number(data.imported.projects || 0)
        : 0;
      toast({
        title: "Account evidence synced",
        description: imported
          ? `${imported} evidence item${imported === 1 ? "" : "s"} imported from your completed application records.`
          : "No new structured project or GitHub evidence was available to import. Existing entries were preserved.",
      });
    } catch (error) {
      toast({ title: "Import failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsImportingAccount(false);
    }
  };

  const importGithub = async () => {
    const username = githubUsername.trim();
    if (!username) {
      toast({ title: "GitHub username required", description: "Enter the founder's public GitHub username first.", variant: "destructive" });
      return;
    }
    setIsImportingGithub(true);
    try {
      const data = await requestJson<PortfolioResponse>("/api/founder-portfolio/import-github", {
        method: "POST",
        body: JSON.stringify({ username }),
      });
      setPortfolio(data.portfolio || portfolio);
      setGithubUsername(data.portfolio?.githubUsername || username);
      const count = typeof data.imported === "number" ? data.imported : 0;
      toast({
        title: "GitHub evidence imported",
        description: `${count} public non-fork repositor${count === 1 ? "y" : "ies"} checked. Existing entries were de-duplicated.`,
      });
    } catch (error) {
      toast({ title: "GitHub import failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsImportingGithub(false);
    }
  };

  const exportPortfolio = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      founderScore,
      summary: {
        githubProjects: portfolio.githubProjects.length,
        demoVideos: portfolio.demos.length,
        pastProjects: portfolio.projects.length,
        references: portfolio.references.length,
        credentials: portfolio.credentials.length,
      },
      githubProjects: portfolio.githubProjects,
      demoVideos: portfolio.demos,
      pastProjects: portfolio.projects,
      references: portfolio.references.map((reference) => ({ ...reference, email: "[REDACTED]", phone: "[REDACTED]" })),
      credentials: portfolio.credentials,
      evidenceNote: "Imported account evidence should be reviewed against its source before it is relied upon for endorsement.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "founder-capability-portfolio.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Founder portfolio downloaded." });
  };

  const credentialSuggestions = accountEvidence?.suggestions?.educationLines || [];
  const accountProjectSuggestions = accountEvidence?.suggestions?.projects?.length || 0;
  const accountGithubSuggestions = accountEvidence?.suggestions?.githubProjects?.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading account-backed founder evidence…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold">Founder Capability Portfolio</h1>
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" /> Account-synced
            </Badge>
          </div>
          <p className="text-muted-foreground">Build evidence that proves you can actually deliver what you promise.</p>
          <p className="text-xs text-muted-foreground mt-2">
            {updatedAt ? `Last account save: ${new Date(updatedAt).toLocaleString("en-GB")}` : "No previous account-backed portfolio save found."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void loadPortfolio()} disabled={isSaving}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={exportPortfolio}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" /> Existing account evidence
          </CardTitle>
          <CardDescription>
            This page now reads your completed application records instead of starting as five empty browser-only arrays on every load.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4 text-sm">
            <div className="rounded-md bg-background p-3 border">
              <div className="text-muted-foreground text-xs">Completed plan</div>
              <div className="font-medium mt-1">{accountEvidence?.latestCompletedPlan?.businessName || "None found"}</div>
            </div>
            <div className="rounded-md bg-background p-3 border">
              <div className="text-muted-foreground text-xs">Saved documents</div>
              <div className="font-medium mt-1">{accountEvidence?.documents?.length || 0}</div>
            </div>
            <div className="rounded-md bg-background p-3 border">
              <div className="text-muted-foreground text-xs">Project suggestions</div>
              <div className="font-medium mt-1">{accountProjectSuggestions}</div>
            </div>
            <div className="rounded-md bg-background p-3 border">
              <div className="text-muted-foreground text-xs">GitHub links in plan</div>
              <div className="font-medium mt-1">{accountGithubSuggestions}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={importAccountEvidence} disabled={isImportingAccount || !accountEvidence?.latestCompletedPlan}>
              {isImportingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Import saved application evidence
            </Button>
            <div className="flex flex-1 gap-2">
              <Input
                value={githubUsername}
                onChange={(event) => setGithubUsername(event.target.value)}
                placeholder="Public GitHub username"
                aria-label="Public GitHub username"
              />
              <Button variant="outline" onClick={importGithub} disabled={isImportingGithub}>
                {isImportingGithub ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Github className="h-4 w-4 mr-2" />}
                Import GitHub
              </Button>
            </div>
          </div>
          {(credentialSuggestions.length > 0 || (accountEvidence?.suggestions?.credentialDocuments?.length || 0) > 0) && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Education or credential evidence is present in the account, but it is not converted into scored credentials automatically. Confirm the exact award, issuer and date in the Credentials tab so the portfolio does not turn unverified text into evidence.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Github className="h-4 w-4" /><span className="text-sm font-medium">Code</span></div><div className="text-lg font-bold">{portfolio.githubProjects.length}</div><p className="text-xs text-muted-foreground">repositories</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Video className="h-4 w-4 text-red-500" /><span className="text-sm font-medium">Demos</span></div><div className="text-lg font-bold">{portfolio.demos.length}</div><p className="text-xs text-muted-foreground">videos</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium">Projects</span></div><div className="text-lg font-bold">{portfolio.projects.length}</div><p className="text-xs text-muted-foreground">completed</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-green-500" /><span className="text-sm font-medium">References</span></div><div className="text-lg font-bold">{portfolio.references.length}</div><p className="text-xs text-muted-foreground">available</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="github" className="flex items-center gap-2" data-testid="tab-github"><Github className="h-4 w-4" /><span className="hidden sm:inline">GitHub</span></TabsTrigger>
          <TabsTrigger value="demos" className="flex items-center gap-2" data-testid="tab-demos"><Video className="h-4 w-4" /><span className="hidden sm:inline">Demos</span></TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2" data-testid="tab-projects"><Briefcase className="h-4 w-4" /><span className="hidden sm:inline">Projects</span></TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2" data-testid="tab-references"><Users className="h-4 w-4" /><span className="hidden sm:inline">References</span></TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2" data-testid="tab-credentials"><Award className="h-4 w-4" /><span className="hidden sm:inline">Credentials</span></TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> GitHub & Code Repositories</CardTitle><CardDescription>Link code that demonstrates technical capability. Public GitHub repositories can now be imported in one step.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label>Repository Name *</Label><Input value={newGithub.repoName || ""} onChange={(e) => setNewGithub({ ...newGithub, repoName: e.target.value })} placeholder="my-saas-platform" data-testid="input-github-name" /></div>
                <div><Label>Repository URL *</Label><Input value={newGithub.repoUrl || ""} onChange={(e) => setNewGithub({ ...newGithub, repoUrl: e.target.value })} placeholder="https://github.com/username/repo" /></div>
                <div><Label>Technologies</Label><Input value={(newGithub.technologies || []).join(", ")} onChange={(e) => setNewGithub({ ...newGithub, technologies: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} placeholder="React, Node.js, PostgreSQL" /></div>
                <div><Label>Stars (optional)</Label><Input type="number" value={newGithub.stars ?? ""} onChange={(e) => setNewGithub({ ...newGithub, stars: e.target.value ? Number(e.target.value) : undefined })} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={newGithub.description || ""} onChange={(e) => setNewGithub({ ...newGithub, description: e.target.value })} rows={3} placeholder="What did you build and what does it prove?" /></div>
                <div className="md:col-span-2"><Label>Relevance to this venture</Label><Textarea value={newGithub.relevance || ""} onChange={(e) => setNewGithub({ ...newGithub, relevance: e.target.value })} rows={2} placeholder="Explain why this repository supports founder capability." /></div>
              </div>
              <Button onClick={addGithubProject} disabled={isSaving} className="w-full" data-testid="button-add-github">{isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add Repository</Button>
              <div className="space-y-3">
                {portfolio.githubProjects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><Code className="h-4 w-4" /><span className="font-medium">{project.repoName}</span>{project.stars ? <Badge variant="outline"><Star className="h-3 w-3 mr-1" />{project.stars}</Badge> : null}<EvidenceBadge source={project.source} /></div>
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1 break-all">{project.repoUrl}<ExternalLink className="h-3 w-3 shrink-0" /></a>
                        {project.technologies.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{project.technologies.map((tech) => <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>)}</div>}
                        {project.description && <p className="text-sm text-muted-foreground mt-2">{project.description}</p>}
                        {project.relevance && <p className="text-sm mt-2"><span className="font-medium">Relevance:</span> {project.relevance}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => void removeItem("githubProjects", project.id)} disabled={isSaving}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))}
                {portfolio.githubProjects.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No repository evidence has been saved yet.</p>}
              </div>
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"><CardContent className="pt-4"><div className="flex items-start gap-2"><Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" /><div><h4 className="font-medium">Evidence quality matters more than count</h4><p className="text-sm text-muted-foreground mt-1">Use repositories you can genuinely link to your own contribution. Add a short relevance statement and avoid presenting another person's code as founder evidence.</p></div></div></CardContent></Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demos">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Demo Videos & Presentations</CardTitle><CardDescription>Visual proof should link to a genuine recording or presentation. The system does not invent demo evidence.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label>Video Title *</Label><Input value={newDemo.title || ""} onChange={(e) => setNewDemo({ ...newDemo, title: e.target.value })} placeholder="Product walkthrough" data-testid="input-demo-title" /></div>
                <div><Label>Video URL *</Label><Input value={newDemo.url || ""} onChange={(e) => setNewDemo({ ...newDemo, url: e.target.value })} placeholder="https://www.loom.com/share/..." /></div>
                <div><Label>Duration</Label><Input value={newDemo.duration || ""} onChange={(e) => setNewDemo({ ...newDemo, duration: e.target.value })} placeholder="3:45" /></div>
                <div><Label>Platform</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3" value={newDemo.platform || "youtube"} onChange={(e) => setNewDemo({ ...newDemo, platform: e.target.value as DemoVideo["platform"] })}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="loom">Loom</option><option value="other">Other</option></select></div>
                <div><Label>Video Type</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3" value={newDemo.type || "mvp"} onChange={(e) => setNewDemo({ ...newDemo, type: e.target.value as DemoVideo["type"] })}><option value="mvp">MVP Demo</option><option value="pitch">Pitch Presentation</option><option value="technical">Technical Walkthrough</option><option value="walkthrough">Product Walkthrough</option></select></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={newDemo.description || ""} onChange={(e) => setNewDemo({ ...newDemo, description: e.target.value })} rows={2} placeholder="What does this recording demonstrate?" /></div>
              </div>
              <Button onClick={addDemo} disabled={isSaving} className="w-full" data-testid="button-add-demo"><Plus className="h-4 w-4 mr-2" /> Add Demo Video</Button>
              <div className="space-y-3">
                {portfolio.demos.map((demo) => <Card key={demo.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Video className="h-4 w-4 text-red-500" /><span className="font-medium">{demo.title}</span><Badge variant="outline">{demo.type}</Badge>{demo.duration && <Badge variant="secondary">{demo.duration}</Badge>}<EvidenceBadge source={demo.source} /></div><a href={demo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">Watch on {demo.platform}<ExternalLink className="h-3 w-3" /></a>{demo.description && <p className="text-sm text-muted-foreground mt-2">{demo.description}</p>}</div><Button variant="ghost" size="sm" onClick={() => void removeItem("demos", demo.id)} disabled={isSaving}><Trash2 className="h-4 w-4" /></Button></div></Card>)}
                {portfolio.demos.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No genuine demo video has been added yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Past Projects & Experience</CardTitle><CardDescription>Project evidence can be imported from your completed business-plan record and then strengthened with URLs, outcomes and references.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label>Project Name *</Label><Input value={newProject.projectName || ""} onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })} placeholder="Enterprise SaaS Platform" data-testid="input-project-name" /></div>
                <div><Label>Your Role *</Label><Input value={newProject.role || ""} onChange={(e) => setNewProject({ ...newProject, role: e.target.value })} placeholder="Founder / Lead Developer" /></div>
                <div><Label>Client / Company</Label><Input value={newProject.clientName || ""} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} /></div>
                <div><Label>Technologies</Label><Input value={(newProject.technologies || []).join(", ")} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></div>
                <div><Label>Start Date</Label><Input type="date" value={newProject.startDate || ""} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} /></div>
                <div><Label>End Date</Label><Input type="date" value={newProject.endDate || ""} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={newProject.description || ""} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} /></div>
                <div className="md:col-span-2"><Label>Outcomes / Evidence</Label><Textarea value={newProject.outcomes || ""} onChange={(e) => setNewProject({ ...newProject, outcomes: e.target.value })} rows={2} placeholder="State measurable outcomes only where you can substantiate them." /></div>
                <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(newProject.referenceAvailable)} onChange={(e) => setNewProject({ ...newProject, referenceAvailable: e.target.checked })} /> A genuine reference can verify this project</label>
              </div>
              <Button onClick={addProject} disabled={isSaving} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Project</Button>
              <div className="space-y-3">
                {portfolio.projects.map((project) => <Card key={project.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Briefcase className="h-4 w-4 text-blue-500" /><span className="font-medium">{project.projectName}</span><EvidenceBadge source={project.source} />{project.referenceAvailable && <Badge variant="secondary">Reference available</Badge>}</div><p className="text-sm mt-1"><span className="font-medium">Role:</span> {project.role}{project.clientName ? ` · ${project.clientName}` : ""}</p>{project.description && <p className="text-sm text-muted-foreground mt-2">{project.description}</p>}{project.outcomes && <p className="text-sm mt-2"><span className="font-medium">Outcomes:</span> {project.outcomes}</p>}{project.technologies.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{project.technologies.map((tech) => <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>)}</div>}</div><Button variant="ghost" size="sm" onClick={() => void removeItem("projects", project.id)} disabled={isSaving}><Trash2 className="h-4 w-4" /></Button></div></Card>)}
                {portfolio.projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No structured project evidence saved yet. Use “Import saved application evidence” above to reuse relevant projects from the completed plan.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Professional References</CardTitle><CardDescription>Only add real people who have agreed, or are genuinely available, to verify your work.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label>Name *</Label><Input value={newReference.name || ""} onChange={(e) => setNewReference({ ...newReference, name: e.target.value })} /></div>
                <div><Label>Email *</Label><Input type="email" value={newReference.email || ""} onChange={(e) => setNewReference({ ...newReference, email: e.target.value })} /></div>
                <div><Label>Title</Label><Input value={newReference.title || ""} onChange={(e) => setNewReference({ ...newReference, title: e.target.value })} /></div>
                <div><Label>Company</Label><Input value={newReference.company || ""} onChange={(e) => setNewReference({ ...newReference, company: e.target.value })} /></div>
                <div><Label>Relationship</Label><Input value={newReference.relationship || ""} onChange={(e) => setNewReference({ ...newReference, relationship: e.target.value })} placeholder="Client, manager, collaborator…" /></div>
                <div><Label>Years Known</Label><Input type="number" min="0" value={newReference.yearsKnown ?? 1} onChange={(e) => setNewReference({ ...newReference, yearsKnown: Number(e.target.value) })} /></div>
                <div><Label>Phone (optional)</Label><Input value={newReference.phone || ""} onChange={(e) => setNewReference({ ...newReference, phone: e.target.value })} /></div>
                <div><Label>Verification method</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3" value={newReference.willingToProvide || "email"} onChange={(e) => setNewReference({ ...newReference, willingToProvide: e.target.value as Reference["willingToProvide"] })}><option value="email">Email</option><option value="linkedin">LinkedIn</option><option value="letter">Letter</option><option value="call">Call</option></select></div>
              </div>
              <Button onClick={addReference} disabled={isSaving} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Reference</Button>
              <div className="space-y-3">
                {portfolio.references.map((reference) => <Card key={reference.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Users className="h-4 w-4 text-green-600" /><span className="font-medium">{reference.name}</span><EvidenceBadge source={reference.source} /></div><p className="text-sm text-muted-foreground mt-1">{[reference.title, reference.company].filter(Boolean).join(" · ")}</p><p className="text-sm mt-2">{reference.relationship || "Professional reference"} · {reference.yearsKnown} year{reference.yearsKnown === 1 ? "" : "s"} known · {reference.willingToProvide}</p></div><Button variant="ghost" size="sm" onClick={() => void removeItem("references", reference.id)} disabled={isSaving}><Trash2 className="h-4 w-4" /></Button></div></Card>)}
                {portfolio.references.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No references saved. They are intentionally not auto-generated from a CV or business plan.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Credentials & Qualifications</CardTitle><CardDescription>Confirm the exact issuer and date. Account education text is shown as a source, but does not score until you create a verifiable credential record.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {credentialSuggestions.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <p className="text-sm font-medium mb-2">Education text found in the completed business plan</p>
                  <div className="space-y-2">{credentialSuggestions.map((line, index) => <div key={`${index}-${line}`} className="text-sm flex items-start justify-between gap-3"><span>{line}</span><Button variant="outline" size="sm" onClick={() => { setNewCredential((current) => ({ ...current, title: line, type: "degree" })); setActiveTab("credentials"); }}>Use as draft</Button></div>)}</div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label>Type</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3" value={newCredential.type || "degree"} onChange={(e) => setNewCredential({ ...newCredential, type: e.target.value as Credential["type"] })}><option value="degree">Degree</option><option value="certification">Certification</option><option value="award">Award</option><option value="patent">Patent</option><option value="publication">Publication</option></select></div>
                <div><Label>Date</Label><Input type="date" value={newCredential.date || ""} onChange={(e) => setNewCredential({ ...newCredential, date: e.target.value })} /></div>
                <div><Label>Title *</Label><Input value={newCredential.title || ""} onChange={(e) => setNewCredential({ ...newCredential, title: e.target.value })} placeholder="MSc Data Science" /></div>
                <div><Label>Issuer *</Label><Input value={newCredential.issuer || ""} onChange={(e) => setNewCredential({ ...newCredential, issuer: e.target.value })} placeholder="University / awarding body" /></div>
                <div className="md:col-span-2"><Label>Verification URL (optional)</Label><Input value={newCredential.url || ""} onChange={(e) => setNewCredential({ ...newCredential, url: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Relevance</Label><Textarea value={newCredential.relevance || ""} onChange={(e) => setNewCredential({ ...newCredential, relevance: e.target.value })} rows={2} placeholder="How does this credential support your capability to deliver the venture?" /></div>
              </div>
              <Button onClick={addCredential} disabled={isSaving} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Credential</Button>
              <div className="space-y-3">
                {portfolio.credentials.map((credential) => <Card key={credential.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Award className="h-4 w-4 text-amber-600" /><span className="font-medium">{credential.title}</span><Badge variant="outline">{credential.type}</Badge><EvidenceBadge source={credential.source} /></div><p className="text-sm text-muted-foreground mt-1">{credential.issuer}{credential.date ? ` · ${credential.date}` : ""}</p>{credential.relevance && <p className="text-sm mt-2">{credential.relevance}</p>}{credential.url && <a href={credential.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">Verify credential<ExternalLink className="h-3 w-3" /></a>}</div><Button variant="ghost" size="sm" onClick={() => void removeItem("credentials", credential.id)} disabled={isSaving}><Trash2 className="h-4 w-4" /></Button></div></Card>)}
                {portfolio.credentials.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No verified credential records have been added yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">How this affects the wider application</p>
        <p>
          Founder Portfolio evidence strengthens the application file, but it does not silently complete separate required diagnostics such as Innovation Score, Final Document Review or Compliance Check. Those milestones still need their own real completed records in the Progress Tracker.
        </p>
      </div>
    </div>
  );
}
