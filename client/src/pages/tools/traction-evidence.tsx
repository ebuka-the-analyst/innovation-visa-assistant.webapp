import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, FileText, Handshake, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  source: string;
  count: number;
  dateAdded: string;
  verified: boolean;
}

interface LOI {
  id: string;
  companyName: string;
  contactPerson: string;
  value: string;
  status: 'draft' | 'sent' | 'signed';
  dateIssued: string;
}

interface Partnership {
  id: string;
  partnerName: string;
  type: string;
  description: string;
  formalized: boolean;
}

interface Survey {
  id: string;
  title: string;
  respondents: number;
  keyFindings: string;
  source: string;
}

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'traction-evidence',
  toolName: 'Traction Evidence Builder',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Building traction evidence is crucial for demonstrating market validation to endorsers. Let me guide you through documenting your waitlists, letters of intent, partnerships, and customer surveys systematically.",
  questions: [
    {
      id: 'waitlist-source',
      question: "Have you built a waitlist? If so, what platform or source did you use to collect signups?",
      hint: "Examples: Landing page, Product Hunt, social media campaigns",
      fieldKey: 'waitlist_source',
      minLength: 10
    },
    {
      id: 'waitlist-count',
      question: "How many people are on your waitlist? Provide the total number of signups across all sources.",
      hint: "Aim for 100+ signups to demonstrate meaningful market interest",
      fieldKey: 'waitlist_count',
      fieldType: 'number'
    },
    {
      id: 'loi-companies',
      question: "Have you secured any Letters of Intent from potential customers? List the company names and their potential contract values.",
      hint: "LOIs are powerful evidence of commercial viability",
      fieldKey: 'loi_companies',
      minLength: 20
    },
    {
      id: 'partnerships',
      question: "Do you have any strategic partnerships in place? Describe your key partnerships and what value they bring.",
      hint: "Include distribution partners, technology partners, or referral agreements",
      fieldKey: 'partnerships',
      minLength: 20
    },
    {
      id: 'survey-insights',
      question: "Have you conducted customer validation surveys? What were the key findings and how many people responded?",
      hint: "Surveys with 50+ respondents provide quantitative validation",
      fieldKey: 'survey_insights',
      minLength: 30
    },
    {
      id: 'evidence-docs',
      question: "What documentation do you have to verify your traction? List the types of evidence you can provide.",
      hint: "Screenshots, signed agreements, email confirmations, analytics dashboards",
      fieldKey: 'evidence_docs',
      minLength: 20
    }
  ]
};

export default function TractionEvidence() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('waitlists');
  const [savedDate, setSavedDate] = useState('');

  const [waitlists, setWaitlists] = useState<WaitlistEntry[]>([
    { id: '1', source: '', count: 0, dateAdded: '', verified: false }
  ]);
  const [lois, setLois] = useState<LOI[]>([
    { id: '1', companyName: '', contactPerson: '', value: '', status: 'draft', dateIssued: '' }
  ]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    { id: '1', partnerName: '', type: '', description: '', formalized: false }
  ]);
  const [surveys, setSurveys] = useState<Survey[]>([
    { id: '1', title: '', respondents: 0, keyFindings: '', source: '' }
  ]);

  const getSerializedState = () => ({
    waitlists, lois, partnerships, surveys, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.waitlists) setWaitlists(state.waitlists);
    if (state.lois) setLois(state.lois);
    if (state.partnerships) setPartnerships(state.partnerships);
    if (state.surveys) setSurveys(state.surveys);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('traction-evidence-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('traction-evidence-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your traction evidence has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('traction-evidence-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateTractionScore = () => {
    let score = 0;
    const validWaitlists = waitlists.filter(w => w.count > 0);
    const signedLois = lois.filter(l => l.status === 'signed');
    const formalPartnerships = partnerships.filter(p => p.formalized && p.partnerName);
    const validSurveys = surveys.filter(s => s.respondents >= 50);

    score += Math.min(validWaitlists.length * 15, 30);
    score += Math.min(signedLois.length * 20, 40);
    score += Math.min(formalPartnerships.length * 10, 20);
    score += Math.min(validSurveys.length * 5, 10);
    
    return Math.min(score, 100);
  };

  const getSmartTips = () => {
    const tips = [];
    const totalWaitlist = waitlists.reduce((sum, w) => sum + w.count, 0);
    
    if (totalWaitlist < 100) tips.push("Aim for 100+ waitlist signups to demonstrate meaningful market interest");
    if (lois.filter(l => l.status === 'signed').length === 0) tips.push("Letters of Intent from potential customers significantly strengthen your application");
    if (partnerships.filter(p => p.formalized).length === 0) tips.push("Formal partnerships show ecosystem integration and market validation");
    if (surveys.filter(s => s.respondents >= 50).length === 0) tips.push("Customer surveys with 50+ respondents provide quantitative validation");
    tips.push("Document all evidence with dates, screenshots, and verifiable sources");
    tips.push("Include diversity of evidence types - endorsers value multiple validation methods");
    
    return tips;
  };

  const generateActionPlan = () => [
    { week: "Week 1", action: "Set up landing page with waitlist signup functionality", priority: "Critical" },
    { week: "Week 1-2", action: "Launch targeted ads or social campaigns to drive waitlist signups", priority: "High" },
    { week: "Week 2-3", action: "Identify and reach out to 5-10 potential LOI partners", priority: "Critical" },
    { week: "Week 3-4", action: "Design and distribute customer validation survey", priority: "High" },
    { week: "Week 4", action: "Follow up on LOI requests and formalize partnerships", priority: "High" },
    { week: "Ongoing", action: "Document all traction metrics with timestamps and evidence", priority: "Medium" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Traction Evidence Report',
      subtitle: `Traction Score: ${calculateTractionScore()}/100`,
      filename: `traction-evidence-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Waitlist Signups', level: 1 },
        ...waitlists.filter(w => w.count > 0).map(w => ({ type: 'paragraph' as const, content: `${w.source}: ${w.count} signups (${w.dateAdded})` })),
        { type: 'divider' },
        { type: 'heading', content: 'Letters of Intent', level: 1 },
        ...lois.filter(l => l.companyName).map(l => ({ type: 'paragraph' as const, content: `${l.companyName}: ${l.value} (${l.status})` })),
        { type: 'divider' },
        { type: 'heading', content: 'Partnerships', level: 1 },
        ...partnerships.filter(p => p.partnerName).map(p => ({ type: 'paragraph' as const, content: `${p.partnerName}: ${p.type} - ${p.formalized ? 'Formalized' : 'Informal'}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Survey Results', level: 1 },
        ...surveys.filter(s => s.title).map(s => ({ type: 'paragraph' as const, content: `${s.title}: ${s.respondents} respondents` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <ToolUtilityBar
          toolId="traction-evidence"
          toolName="Traction Evidence Builder"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Traction Evidence Builder
            </CardTitle>
            <CardDescription>
              Build proof of market demand with waitlists, LOIs, partnerships & surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Traction Score</span>
                <span className="text-sm font-bold text-primary">{calculateTractionScore()}/100</span>
              </div>
              <Progress value={calculateTractionScore()} className="h-3" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="waitlists" data-testid="tab-waitlists">
                  <Users className="h-4 w-4 mr-2" />Waitlists
                </TabsTrigger>
                <TabsTrigger value="lois" data-testid="tab-lois">
                  <FileText className="h-4 w-4 mr-2" />LOIs
                </TabsTrigger>
                <TabsTrigger value="partnerships" data-testid="tab-partnerships">
                  <Handshake className="h-4 w-4 mr-2" />Partnerships
                </TabsTrigger>
                <TabsTrigger value="surveys" data-testid="tab-surveys">
                  <CheckCircle className="h-4 w-4 mr-2" />Surveys
                </TabsTrigger>
              </TabsList>

              <TabsContent value="waitlists" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Waitlist Signups</h3>
                {waitlists.map((entry, index) => (
                  <Card key={entry.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Source/Platform</Label>
                        <Input
                          value={entry.source}
                          onChange={(e) => {
                            const updated = [...waitlists];
                            updated[index].source = e.target.value;
                            setWaitlists(updated);
                          }}
                          placeholder="e.g., Landing page, Product Hunt"
                          data-testid={`input-waitlist-source-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Signup Count</Label>
                        <Input
                          type="number"
                          value={entry.count || ''}
                          onChange={(e) => {
                            const updated = [...waitlists];
                            updated[index].count = parseInt(e.target.value) || 0;
                            setWaitlists(updated);
                          }}
                          placeholder="0"
                          data-testid={`input-waitlist-count-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Date Added</Label>
                        <Input
                          type="date"
                          value={entry.dateAdded}
                          onChange={(e) => {
                            const updated = [...waitlists];
                            updated[index].dateAdded = e.target.value;
                            setWaitlists(updated);
                          }}
                          data-testid={`input-waitlist-date-${index}`}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={entry.verified}
                            onCheckedChange={(checked) => {
                              const updated = [...waitlists];
                              updated[index].verified = checked === true;
                              setWaitlists(updated);
                            }}
                            data-testid={`checkbox-waitlist-verified-${index}`}
                          />
                          <Label>Verified</Label>
                        </div>
                        {waitlists.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setWaitlists(waitlists.filter((_, i) => i !== index))}
                            data-testid={`button-remove-waitlist-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setWaitlists([...waitlists, { id: Date.now().toString(), source: '', count: 0, dateAdded: '', verified: false }])}
                  data-testid="button-add-waitlist"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Waitlist Source
                </Button>
              </TabsContent>

              <TabsContent value="lois" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Letters of Intent</h3>
                {lois.map((loi, index) => (
                  <Card key={loi.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company Name</Label>
                        <Input
                          value={loi.companyName}
                          onChange={(e) => {
                            const updated = [...lois];
                            updated[index].companyName = e.target.value;
                            setLois(updated);
                          }}
                          placeholder="Enter company name"
                          data-testid={`input-loi-company-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Contact Person</Label>
                        <Input
                          value={loi.contactPerson}
                          onChange={(e) => {
                            const updated = [...lois];
                            updated[index].contactPerson = e.target.value;
                            setLois(updated);
                          }}
                          placeholder="Enter contact name"
                          data-testid={`input-loi-contact-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Potential Value</Label>
                        <Input
                          value={loi.value}
                          onChange={(e) => {
                            const updated = [...lois];
                            updated[index].value = e.target.value;
                            setLois(updated);
                          }}
                          placeholder="e.g., £10,000/year"
                          data-testid={`input-loi-value-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={loi.status}
                          onChange={(e) => {
                            const updated = [...lois];
                            updated[index].status = e.target.value as LOI['status'];
                            setLois(updated);
                          }}
                          data-testid={`select-loi-status-${index}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="signed">Signed</option>
                        </select>
                      </div>
                    </div>
                    {lois.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setLois(lois.filter((_, i) => i !== index))}
                        data-testid={`button-remove-loi-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setLois([...lois, { id: Date.now().toString(), companyName: '', contactPerson: '', value: '', status: 'draft', dateIssued: '' }])}
                  data-testid="button-add-loi"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Letter of Intent
                </Button>
              </TabsContent>

              <TabsContent value="partnerships" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Strategic Partnerships</h3>
                {partnerships.map((partnership, index) => (
                  <Card key={partnership.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Partner Name</Label>
                        <Input
                          value={partnership.partnerName}
                          onChange={(e) => {
                            const updated = [...partnerships];
                            updated[index].partnerName = e.target.value;
                            setPartnerships(updated);
                          }}
                          placeholder="Enter partner organization"
                          data-testid={`input-partnership-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Partnership Type</Label>
                        <Input
                          value={partnership.type}
                          onChange={(e) => {
                            const updated = [...partnerships];
                            updated[index].type = e.target.value;
                            setPartnerships(updated);
                          }}
                          placeholder="e.g., Distribution, Technology, Referral"
                          data-testid={`input-partnership-type-${index}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={partnership.description}
                          onChange={(e) => {
                            const updated = [...partnerships];
                            updated[index].description = e.target.value;
                            setPartnerships(updated);
                          }}
                          placeholder="Describe the partnership arrangement"
                          data-testid={`input-partnership-description-${index}`}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={partnership.formalized}
                          onCheckedChange={(checked) => {
                            const updated = [...partnerships];
                            updated[index].formalized = checked === true;
                            setPartnerships(updated);
                          }}
                          data-testid={`checkbox-partnership-formalized-${index}`}
                        />
                        <Label>Formalized Agreement</Label>
                      </div>
                    </div>
                    {partnerships.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setPartnerships(partnerships.filter((_, i) => i !== index))}
                        data-testid={`button-remove-partnership-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setPartnerships([...partnerships, { id: Date.now().toString(), partnerName: '', type: '', description: '', formalized: false }])}
                  data-testid="button-add-partnership"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Partnership
                </Button>
              </TabsContent>

              <TabsContent value="surveys" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Customer Surveys & Research</h3>
                {surveys.map((survey, index) => (
                  <Card key={survey.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Survey Title</Label>
                        <Input
                          value={survey.title}
                          onChange={(e) => {
                            const updated = [...surveys];
                            updated[index].title = e.target.value;
                            setSurveys(updated);
                          }}
                          placeholder="e.g., Customer Needs Assessment"
                          data-testid={`input-survey-title-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Number of Respondents</Label>
                        <Input
                          type="number"
                          value={survey.respondents || ''}
                          onChange={(e) => {
                            const updated = [...surveys];
                            updated[index].respondents = parseInt(e.target.value) || 0;
                            setSurveys(updated);
                          }}
                          placeholder="0"
                          data-testid={`input-survey-respondents-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Source/Platform</Label>
                        <Input
                          value={survey.source}
                          onChange={(e) => {
                            const updated = [...surveys];
                            updated[index].source = e.target.value;
                            setSurveys(updated);
                          }}
                          placeholder="e.g., Google Forms, Typeform"
                          data-testid={`input-survey-source-${index}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Key Findings</Label>
                        <Textarea
                          value={survey.keyFindings}
                          onChange={(e) => {
                            const updated = [...surveys];
                            updated[index].keyFindings = e.target.value;
                            setSurveys(updated);
                          }}
                          placeholder="Summarize the main insights from this survey"
                          data-testid={`input-survey-findings-${index}`}
                        />
                      </div>
                    </div>
                    {surveys.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setSurveys(surveys.filter((_, i) => i !== index))}
                        data-testid={`button-remove-survey-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setSurveys([...surveys, { id: Date.now().toString(), title: '', respondents: 0, keyFindings: '', source: '' }])}
                  data-testid="button-add-survey"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Survey
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
