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
  Users, Mail, FileText, Handshake, BarChart3, CheckCircle2, 
  Plus, Trash2, Download, Lightbulb, AlertTriangle, Target,
  TrendingUp, Calendar, Link, Building2, UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  company?: string;
  role?: string;
  signupDate: string;
  source: string;
  notes?: string;
}

interface LetterOfInterest {
  id: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  interestType: "pilot" | "partnership" | "investment" | "customer" | "advisor";
  description: string;
  dateReceived: string;
  status: "draft" | "sent" | "received" | "confirmed";
  letterContent?: string;
}

interface Partnership {
  id: string;
  partnerName: string;
  partnerType: "technology" | "distribution" | "strategic" | "research" | "integration";
  description: string;
  status: "exploring" | "negotiating" | "agreed" | "active";
  contactName: string;
  contactEmail: string;
  startDate?: string;
  benefits: string;
  evidence?: string;
}

interface SurveyResult {
  id: string;
  surveyName: string;
  totalResponses: number;
  targetMarket: string;
  keyFindings: string[];
  willingnessToPay: string;
  painPointValidation: string;
  conductedDate: string;
  methodology: string;
}

export default function TractionEvidence() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("waitlist");
  
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [letters, setLetters] = useState<LetterOfInterest[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [surveys, setSurveys] = useState<SurveyResult[]>([]);

  const [newWaitlistEntry, setNewWaitlistEntry] = useState<Partial<WaitlistEntry>>({
    source: "website"
  });
  const [newLetter, setNewLetter] = useState<Partial<LetterOfInterest>>({
    interestType: "pilot",
    status: "draft"
  });
  const [newPartnership, setNewPartnership] = useState<Partial<Partnership>>({
    partnerType: "strategic",
    status: "exploring"
  });
  const [newSurvey, setNewSurvey] = useState<Partial<SurveyResult>>({
    keyFindings: []
  });

  const calculateTractionScore = () => {
    let score = 0;
    
    if (waitlist.length >= 100) score += 25;
    else if (waitlist.length >= 50) score += 20;
    else if (waitlist.length >= 20) score += 15;
    else if (waitlist.length >= 10) score += 10;
    else if (waitlist.length >= 5) score += 5;

    const confirmedLetters = letters.filter(l => l.status === "received" || l.status === "confirmed").length;
    if (confirmedLetters >= 5) score += 25;
    else if (confirmedLetters >= 3) score += 20;
    else if (confirmedLetters >= 2) score += 15;
    else if (confirmedLetters >= 1) score += 10;

    const activePartnerships = partnerships.filter(p => p.status === "agreed" || p.status === "active").length;
    if (activePartnerships >= 3) score += 25;
    else if (activePartnerships >= 2) score += 20;
    else if (activePartnerships >= 1) score += 15;

    if (surveys.length >= 2) score += 25;
    else if (surveys.length >= 1) score += 15;

    return Math.min(100, score);
  };

  const addWaitlistEntry = () => {
    if (!newWaitlistEntry.email || !newWaitlistEntry.name) {
      toast({ title: "Missing Information", description: "Please fill in name and email", variant: "destructive" });
      return;
    }
    const entry: WaitlistEntry = {
      id: Date.now().toString(),
      email: newWaitlistEntry.email!,
      name: newWaitlistEntry.name!,
      company: newWaitlistEntry.company,
      role: newWaitlistEntry.role,
      signupDate: new Date().toISOString().split('T')[0],
      source: newWaitlistEntry.source || "website",
      notes: newWaitlistEntry.notes
    };
    setWaitlist([...waitlist, entry]);
    setNewWaitlistEntry({ source: "website" });
    toast({ title: "Added", description: "Waitlist entry added successfully" });
  };

  const addLetter = () => {
    if (!newLetter.companyName || !newLetter.contactName) {
      toast({ title: "Missing Information", description: "Please fill in company and contact details", variant: "destructive" });
      return;
    }
    const letter: LetterOfInterest = {
      id: Date.now().toString(),
      companyName: newLetter.companyName!,
      contactName: newLetter.contactName!,
      contactRole: newLetter.contactRole || "",
      contactEmail: newLetter.contactEmail || "",
      interestType: newLetter.interestType as any || "pilot",
      description: newLetter.description || "",
      dateReceived: new Date().toISOString().split('T')[0],
      status: newLetter.status as any || "draft",
      letterContent: newLetter.letterContent
    };
    setLetters([...letters, letter]);
    setNewLetter({ interestType: "pilot", status: "draft" });
    toast({ title: "Added", description: "Letter of Interest added successfully" });
  };

  const addPartnership = () => {
    if (!newPartnership.partnerName) {
      toast({ title: "Missing Information", description: "Please fill in partner details", variant: "destructive" });
      return;
    }
    const partnership: Partnership = {
      id: Date.now().toString(),
      partnerName: newPartnership.partnerName!,
      partnerType: newPartnership.partnerType as any || "strategic",
      description: newPartnership.description || "",
      status: newPartnership.status as any || "exploring",
      contactName: newPartnership.contactName || "",
      contactEmail: newPartnership.contactEmail || "",
      startDate: newPartnership.startDate,
      benefits: newPartnership.benefits || "",
      evidence: newPartnership.evidence
    };
    setPartnerships([...partnerships, partnership]);
    setNewPartnership({ partnerType: "strategic", status: "exploring" });
    toast({ title: "Added", description: "Partnership added successfully" });
  };

  const addSurvey = () => {
    if (!newSurvey.surveyName || !newSurvey.totalResponses) {
      toast({ title: "Missing Information", description: "Please fill in survey details", variant: "destructive" });
      return;
    }
    const survey: SurveyResult = {
      id: Date.now().toString(),
      surveyName: newSurvey.surveyName!,
      totalResponses: newSurvey.totalResponses!,
      targetMarket: newSurvey.targetMarket || "",
      keyFindings: newSurvey.keyFindings || [],
      willingnessToPay: newSurvey.willingnessToPay || "",
      painPointValidation: newSurvey.painPointValidation || "",
      conductedDate: new Date().toISOString().split('T')[0],
      methodology: newSurvey.methodology || ""
    };
    setSurveys([...surveys, survey]);
    setNewSurvey({ keyFindings: [] });
    toast({ title: "Added", description: "Survey results added successfully" });
  };

  const generateLoiTemplate = (type: string) => {
    const templates: Record<string, string> = {
      pilot: `Dear [Your Name],

I am writing to express [Company Name]'s strong interest in participating as a pilot customer for [Your Product/Service].

After reviewing your innovative approach to [problem domain], we believe there is significant potential for [specific benefit] within our organisation.

We would be interested in:
- Participating in a 3-month pilot programme
- Providing feedback on product development
- Exploring a commercial relationship upon successful completion

We look forward to discussing this opportunity further.

Best regards,
[Contact Name]
[Contact Role]
[Company Name]`,
      partnership: `Dear [Your Name],

[Company Name] is pleased to express our interest in forming a strategic partnership with [Your Company] to explore opportunities in [market/domain].

We see synergies in:
- [Synergy 1]
- [Synergy 2]
- [Synergy 3]

We are committed to exploring how our combined capabilities could create value for both organisations and the market.

Best regards,
[Contact Name]`,
      investment: `Dear [Your Name],

Following our review of [Your Company]'s proposition, [Investment Firm] would like to express preliminary interest in exploring investment opportunities.

Your approach to [market/problem] aligns with our investment thesis in [sector], and we believe there is potential for significant growth.

We would welcome the opportunity to discuss this further in a formal meeting.

Best regards,
[Contact Name]`,
      customer: `Dear [Your Name],

I am writing to confirm [Company Name]'s interest in becoming an early customer of [Your Product/Service].

We have evaluated your solution against our requirements and believe it addresses our key pain points around [specific challenges].

Subject to final terms, we would be interested in:
- Annual subscription for [X] users
- Implementation support
- Priority feature requests

Best regards,
[Contact Name]`,
      advisor: `Dear [Your Name],

I would be honoured to serve as an advisor to [Your Company].

My experience in [relevant domain] and network in [industry] could provide valuable guidance as you scale your innovative solution.

I am committed to supporting your growth through:
- Strategic advice on [specific area]
- Introductions to potential [customers/investors/partners]
- Regular mentoring sessions

Best regards,
[Contact Name]`
    };
    return templates[type] || templates.pilot;
  };

  const exportEvidence = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      tractionScore: calculateTractionScore(),
      summary: {
        totalWaitlistSignups: waitlist.length,
        lettersOfInterest: letters.length,
        confirmedLetters: letters.filter(l => l.status === "received" || l.status === "confirmed").length,
        partnerships: partnerships.length,
        activePartnerships: partnerships.filter(p => p.status === "agreed" || p.status === "active").length,
        surveysCompleted: surveys.length,
        totalSurveyResponses: surveys.reduce((acc, s) => acc + s.totalResponses, 0)
      },
      waitlist,
      lettersOfInterest: letters,
      partnerships,
      surveys,
      endorserNotes: `This traction evidence package demonstrates real-world validation of the business concept through ${waitlist.length} waitlist signups, ${letters.filter(l => l.status === "received" || l.status === "confirmed").length} confirmed letters of interest, ${partnerships.filter(p => p.status === "agreed" || p.status === "active").length} active partnerships, and market research from ${surveys.reduce((acc, s) => acc + s.totalResponses, 0)} survey respondents.`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traction-evidence-report.json";
    a.click();
    
    toast({ title: "Exported", description: "Traction evidence report downloaded" });
  };

  const tractionScore = calculateTractionScore();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Traction Evidence Builder</h1>
        <p className="text-muted-foreground">
          Build compelling proof of market demand - the #1 factor endorsers evaluate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={tractionScore >= 70 ? "border-green-500" : tractionScore >= 40 ? "border-yellow-500" : "border-red-500"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Traction Score</span>
              <Badge variant={tractionScore >= 70 ? "default" : tractionScore >= 40 ? "secondary" : "destructive"}>
                {tractionScore >= 70 ? "Strong" : tractionScore >= 40 ? "Moderate" : "Weak"}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-2">{tractionScore}/100</div>
            <Progress value={tractionScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Waitlist</span>
            </div>
            <div className="text-2xl font-bold">{waitlist.length}</div>
            <p className="text-xs text-muted-foreground">signups collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Letters of Interest</span>
            </div>
            <div className="text-2xl font-bold">{letters.filter(l => l.status === "received" || l.status === "confirmed").length}/{letters.length}</div>
            <p className="text-xs text-muted-foreground">confirmed / total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Partnerships</span>
            </div>
            <div className="text-2xl font-bold">{partnerships.filter(p => p.status === "agreed" || p.status === "active").length}/{partnerships.length}</div>
            <p className="text-xs text-muted-foreground">active / total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Why Traction Matters</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Endorsers reject 80-90% of applicants with "zero traction." They want PROOF people want your product, 
                not just a good idea. Each piece of evidence below directly addresses this critical weakness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="waitlist" className="flex items-center gap-2" data-testid="tab-waitlist">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Waitlist</span>
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2" data-testid="tab-letters">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Letters</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2" data-testid="tab-partnerships">
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Partners</span>
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2" data-testid="tab-surveys">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Surveys</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waitlist Management
              </CardTitle>
              <CardDescription>
                Track interested users who signed up before product launch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={newWaitlistEntry.name || ""} 
                    onChange={(e) => setNewWaitlistEntry({...newWaitlistEntry, name: e.target.value})}
                    placeholder="John Smith"
                    data-testid="input-waitlist-name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={newWaitlistEntry.email || ""} 
                    onChange={(e) => setNewWaitlistEntry({...newWaitlistEntry, email: e.target.value})}
                    placeholder="john@company.com"
                    data-testid="input-waitlist-email"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input 
                    value={newWaitlistEntry.company || ""} 
                    onChange={(e) => setNewWaitlistEntry({...newWaitlistEntry, company: e.target.value})}
                    placeholder="Company Ltd"
                  />
                </div>
                <div>
                  <Label>Source</Label>
                  <Input 
                    value={newWaitlistEntry.source || ""} 
                    onChange={(e) => setNewWaitlistEntry({...newWaitlistEntry, source: e.target.value})}
                    placeholder="Website, LinkedIn, etc."
                  />
                </div>
              </div>
              <Button onClick={addWaitlistEntry} className="w-full" data-testid="button-add-waitlist">
                <Plus className="h-4 w-4 mr-2" />
                Add to Waitlist
              </Button>

              {waitlist.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium">Name</th>
                        <th className="p-3 text-left text-sm font-medium">Email</th>
                        <th className="p-3 text-left text-sm font-medium">Company</th>
                        <th className="p-3 text-left text-sm font-medium">Source</th>
                        <th className="p-3 text-left text-sm font-medium">Date</th>
                        <th className="p-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map((entry) => (
                        <tr key={entry.id} className="border-t">
                          <td className="p-3 text-sm">{entry.name}</td>
                          <td className="p-3 text-sm">{entry.email}</td>
                          <td className="p-3 text-sm">{entry.company || "-"}</td>
                          <td className="p-3 text-sm">{entry.source}</td>
                          <td className="p-3 text-sm">{entry.signupDate}</td>
                          <td className="p-3">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setWaitlist(waitlist.filter(w => w.id !== entry.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Endorser Tips</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                        <li>• Aim for 50+ waitlist signups minimum</li>
                        <li>• Include company names to show B2B interest</li>
                        <li>• Diverse sources (website, LinkedIn, events) show broad demand</li>
                        <li>• Export as evidence for your endorsement application</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Letters of Interest
              </CardTitle>
              <CardDescription>
                Formal expressions of interest from potential customers, partners, or investors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Company Name *</Label>
                  <Input 
                    value={newLetter.companyName || ""} 
                    onChange={(e) => setNewLetter({...newLetter, companyName: e.target.value})}
                    placeholder="Acme Corporation"
                    data-testid="input-loi-company"
                  />
                </div>
                <div>
                  <Label>Contact Name *</Label>
                  <Input 
                    value={newLetter.contactName || ""} 
                    onChange={(e) => setNewLetter({...newLetter, contactName: e.target.value})}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label>Contact Role</Label>
                  <Input 
                    value={newLetter.contactRole || ""} 
                    onChange={(e) => setNewLetter({...newLetter, contactRole: e.target.value})}
                    placeholder="Head of Innovation"
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={newLetter.contactEmail || ""} 
                    onChange={(e) => setNewLetter({...newLetter, contactEmail: e.target.value})}
                    placeholder="jane@acme.com"
                  />
                </div>
                <div>
                  <Label>Type of Interest</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newLetter.interestType || "pilot"}
                    onChange={(e) => setNewLetter({...newLetter, interestType: e.target.value as any})}
                    data-testid="select-loi-type"
                  >
                    <option value="pilot">Pilot Customer</option>
                    <option value="partnership">Partnership</option>
                    <option value="investment">Investment Interest</option>
                    <option value="customer">Commercial Customer</option>
                    <option value="advisor">Advisory Role</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newLetter.status || "draft"}
                    onChange={(e) => setNewLetter({...newLetter, status: e.target.value as any})}
                  >
                    <option value="draft">Draft Requested</option>
                    <option value="sent">Sent for Signature</option>
                    <option value="received">Received</option>
                    <option value="confirmed">Confirmed & Verified</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newLetter.description || ""} 
                    onChange={(e) => setNewLetter({...newLetter, description: e.target.value})}
                    placeholder="Describe the nature of interest and potential value..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addLetter} className="flex-1" data-testid="button-add-loi">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Letter of Interest
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const template = generateLoiTemplate(newLetter.interestType || "pilot");
                    setNewLetter({...newLetter, letterContent: template});
                    toast({ title: "Template Generated", description: "LOI template added to form" });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Template
                </Button>
              </div>

              {newLetter.letterContent && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="mb-2 block">Letter Template</Label>
                  <Textarea 
                    value={newLetter.letterContent}
                    onChange={(e) => setNewLetter({...newLetter, letterContent: e.target.value})}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Customise this template and send to your contact for signature
                  </p>
                </div>
              )}

              {letters.length > 0 && (
                <div className="space-y-3">
                  {letters.map((letter) => (
                    <Card key={letter.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{letter.companyName}</span>
                            <Badge variant={
                              letter.status === "confirmed" ? "default" :
                              letter.status === "received" ? "secondary" :
                              "outline"
                            }>
                              {letter.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {letter.contactName} ({letter.contactRole}) - {letter.interestType}
                          </p>
                          {letter.description && (
                            <p className="text-sm mt-2">{letter.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLetters(letters.filter(l => l.id !== letter.id))}
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

        <TabsContent value="partnerships">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Partnership Tracker
              </CardTitle>
              <CardDescription>
                Strategic partnerships that validate your business model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Partner Name *</Label>
                  <Input 
                    value={newPartnership.partnerName || ""} 
                    onChange={(e) => setNewPartnership({...newPartnership, partnerName: e.target.value})}
                    placeholder="Tech Partner Ltd"
                    data-testid="input-partner-name"
                  />
                </div>
                <div>
                  <Label>Partnership Type</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newPartnership.partnerType || "strategic"}
                    onChange={(e) => setNewPartnership({...newPartnership, partnerType: e.target.value as any})}
                  >
                    <option value="technology">Technology Integration</option>
                    <option value="distribution">Distribution/Channel</option>
                    <option value="strategic">Strategic Alliance</option>
                    <option value="research">Research/Academic</option>
                    <option value="integration">API/Platform Integration</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newPartnership.status || "exploring"}
                    onChange={(e) => setNewPartnership({...newPartnership, status: e.target.value as any})}
                  >
                    <option value="exploring">Exploring</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="agreed">Agreed (MOU Signed)</option>
                    <option value="active">Active & Operating</option>
                  </select>
                </div>
                <div>
                  <Label>Contact Name</Label>
                  <Input 
                    value={newPartnership.contactName || ""} 
                    onChange={(e) => setNewPartnership({...newPartnership, contactName: e.target.value})}
                    placeholder="Partner contact"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Benefits & Value</Label>
                  <Textarea 
                    value={newPartnership.benefits || ""} 
                    onChange={(e) => setNewPartnership({...newPartnership, benefits: e.target.value})}
                    placeholder="Describe the mutual benefits and value of this partnership..."
                    rows={3}
                  />
                </div>
              </div>
              
              <Button onClick={addPartnership} className="w-full" data-testid="button-add-partnership">
                <Plus className="h-4 w-4 mr-2" />
                Add Partnership
              </Button>

              {partnerships.length > 0 && (
                <div className="space-y-3">
                  {partnerships.map((partnership) => (
                    <Card key={partnership.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{partnership.partnerName}</span>
                            <Badge variant={
                              partnership.status === "active" ? "default" :
                              partnership.status === "agreed" ? "secondary" :
                              "outline"
                            }>
                              {partnership.status}
                            </Badge>
                            <Badge variant="outline">{partnership.partnerType}</Badge>
                          </div>
                          {partnership.benefits && (
                            <p className="text-sm text-muted-foreground mt-2">{partnership.benefits}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setPartnerships(partnerships.filter(p => p.id !== partnership.id))}
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

        <TabsContent value="surveys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Research & Surveys
              </CardTitle>
              <CardDescription>
                Document market research that validates demand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Survey Name *</Label>
                  <Input 
                    value={newSurvey.surveyName || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, surveyName: e.target.value})}
                    placeholder="Market Validation Survey Q4 2024"
                    data-testid="input-survey-name"
                  />
                </div>
                <div>
                  <Label>Total Responses *</Label>
                  <Input 
                    type="number"
                    value={newSurvey.totalResponses || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, totalResponses: parseInt(e.target.value)})}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label>Target Market</Label>
                  <Input 
                    value={newSurvey.targetMarket || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, targetMarket: e.target.value})}
                    placeholder="UK SMEs in tech sector"
                  />
                </div>
                <div>
                  <Label>Methodology</Label>
                  <Input 
                    value={newSurvey.methodology || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, methodology: e.target.value})}
                    placeholder="Online survey via LinkedIn, email outreach"
                  />
                </div>
                <div>
                  <Label>Willingness to Pay</Label>
                  <Input 
                    value={newSurvey.willingnessToPay || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, willingnessToPay: e.target.value})}
                    placeholder="72% would pay £50-100/month"
                  />
                </div>
                <div>
                  <Label>Pain Point Validation</Label>
                  <Input 
                    value={newSurvey.painPointValidation || ""} 
                    onChange={(e) => setNewSurvey({...newSurvey, painPointValidation: e.target.value})}
                    placeholder="85% confirmed this is a significant problem"
                  />
                </div>
              </div>
              
              <Button onClick={addSurvey} className="w-full" data-testid="button-add-survey">
                <Plus className="h-4 w-4 mr-2" />
                Add Survey Results
              </Button>

              {surveys.length > 0 && (
                <div className="space-y-3">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{survey.surveyName}</span>
                            <Badge>{survey.totalResponses} responses</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Target: {survey.targetMarket} | Method: {survey.methodology}
                          </p>
                          {survey.willingnessToPay && (
                            <p className="text-sm mt-2">
                              <strong>WTP:</strong> {survey.willingnessToPay}
                            </p>
                          )}
                          {survey.painPointValidation && (
                            <p className="text-sm">
                              <strong>Validation:</strong> {survey.painPointValidation}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSurveys(surveys.filter(s => s.id !== survey.id))}
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
              <h3 className="font-semibold">Export Evidence Package</h3>
              <p className="text-sm text-muted-foreground">
                Download a complete traction evidence report for your endorser application
              </p>
            </div>
            <Button onClick={exportEvidence} data-testid="button-export-evidence">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
