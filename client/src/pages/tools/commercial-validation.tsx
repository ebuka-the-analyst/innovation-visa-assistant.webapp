import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Users, BarChart3, FileText, Plus, Trash2 } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

interface Competitor {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
  pricing: string;
  marketShare: string;
}

interface Interview {
  id: string;
  intervieweeName: string;
  role: string;
  company: string;
  date: string;
  keyInsights: string;
  painPoints: string;
  willingnessToPay: string;
}

interface CaseStudy {
  id: string;
  title: string;
  customer: string;
  problem: string;
  solution: string;
  results: string;
}

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'commercial-validation',
  toolName: 'Commercial Validation Suite',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. Commercial validation is essential for proving your business viability to endorsers. Let me guide you through competitor analysis, user interviews, and building case studies that demonstrate market demand and innovation potential.",
  questions: [
    {
      id: 'target-market',
      question: "Who is your target market? Define your ideal customer segments with specifics.",
      hint: "Include demographics, industry, company size, and geographic focus",
      fieldKey: 'target_market',
      minLength: 50
    },
    {
      id: 'market-size',
      question: "What is the size of your target market? Provide market size data with sources.",
      hint: "Use TAM, SAM, SOM figures with credible sources like Statista or ONS",
      fieldKey: 'market_size',
      minLength: 30
    },
    {
      id: 'main-competitors',
      question: "Who are your main competitors? List 3-5 competitors and briefly describe what they do.",
      hint: "Include both direct competitors and alternative solutions",
      fieldKey: 'main_competitors',
      minLength: 50
    },
    {
      id: 'competitive-advantage',
      question: "What is your competitive advantage? Why will customers choose you over alternatives?",
      hint: "Be specific about unique features, pricing, technology, or approach",
      fieldKey: 'competitive_advantage',
      minLength: 80
    },
    {
      id: 'user-interviews',
      question: "Have you conducted user interviews? How many and what were the key pain points identified?",
      hint: "5-10 interviews provide meaningful qualitative validation",
      fieldKey: 'user_interviews',
      minLength: 50
    },
    {
      id: 'willingness-to-pay',
      question: "What have potential customers indicated they would pay for your solution?",
      hint: "Include price points from interviews or survey responses",
      fieldKey: 'willingness_to_pay',
      minLength: 20
    }
  ]
};

export default function CommercialValidation() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [activeTab, setActiveTab] = useState('competitors');
  const [savedDate, setSavedDate] = useState('');

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('commercial-validation-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('commercial-validation-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('commercial-validation-mode', mode);
  }, [mode]);

  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: '1', name: '', strengths: '', weaknesses: '', pricing: '', marketShare: '' }
  ]);
  const [interviews, setInterviews] = useState<Interview[]>([
    { id: '1', intervieweeName: '', role: '', company: '', date: '', keyInsights: '', painPoints: '', willingnessToPay: '' }
  ]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([
    { id: '1', title: '', customer: '', problem: '', solution: '', results: '' }
  ]);
  const [marketSummary, setMarketSummary] = useState({
    targetMarket: '',
    marketSize: '',
    growthRate: '',
    keyTrends: ''
  });

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.target_market) {
      setMarketSummary(prev => ({ ...prev, targetMarket: answers.target_market }));
    }
    if (answers.market_size) {
      setMarketSummary(prev => ({ ...prev, marketSize: answers.market_size }));
    }
    if (answers.main_competitors) {
      const competitorNames = answers.main_competitors.split(',').map((c: string) => c.trim()).slice(0, 3);
      setCompetitors(competitorNames.map((name: string, index: number) => ({
        id: (index + 1).toString(),
        name,
        strengths: '',
        weaknesses: '',
        pricing: '',
        marketShare: ''
      })));
    }
    if (answers.user_interviews) {
      setInterviews([{
        id: '1',
        intervieweeName: '',
        role: '',
        company: '',
        date: '',
        keyInsights: answers.user_interviews,
        painPoints: '',
        willingnessToPay: answers.willingness_to_pay || ''
      }]);
    }
    setMode('traditional');
    toast({
      title: "AI Assessment Complete",
      description: "Your commercial validation has been populated based on your answers.",
    });
  };

  const getSerializedState = () => ({
    competitors, interviews, caseStudies, marketSummary, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.competitors) setCompetitors(state.competitors);
    if (state.interviews) setInterviews(state.interviews);
    if (state.caseStudies) setCaseStudies(state.caseStudies);
    if (state.marketSummary) setMarketSummary(state.marketSummary);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const handoffKey = 'commercial-validation_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        restoreSerializedState(payload);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      const saved = localStorage.getItem('commercial-validation-state');
      if (saved) restoreSerializedState(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('commercial-validation-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your validation data has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('commercial-validation-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateValidationScore = () => {
    let score = 0;
    const validCompetitors = competitors.filter(c => c.name && c.strengths);
    const validInterviews = interviews.filter(i => i.intervieweeName && i.keyInsights);
    const validCaseStudies = caseStudies.filter(cs => cs.title && cs.results);
    
    score += Math.min(validCompetitors.length * 15, 30);
    score += Math.min(validInterviews.length * 10, 40);
    score += Math.min(validCaseStudies.length * 15, 30);
    
    return Math.min(score, 100);
  };

  const getSmartTips = () => {
    const tips = [];
    if (competitors.filter(c => c.name).length < 3) tips.push("Analyze at least 3-5 competitors to demonstrate market awareness");
    if (interviews.filter(i => i.intervieweeName).length < 5) tips.push("Conduct 5-10 user interviews for meaningful validation");
    if (caseStudies.filter(cs => cs.title).length === 0) tips.push("Create at least one case study showing problem-solution-results");
    tips.push("Include both direct and indirect competitors in your analysis");
    tips.push("Document interview insights with specific quotes and pain points");
    tips.push("Quantify results in case studies wherever possible");
    return tips;
  };

  const generateActionPlan = () => [
    { week: "Week 1", action: "Identify and research 5 key competitors", priority: "Critical" },
    { week: "Week 1-2", action: "Create competitor comparison matrix", priority: "High" },
    { week: "Week 2-3", action: "Schedule and conduct 5-10 customer interviews", priority: "Critical" },
    { week: "Week 3", action: "Synthesize interview findings into key themes", priority: "High" },
    { week: "Week 4", action: "Develop 1-2 case studies from pilot customers", priority: "High" },
    { week: "Week 4", action: "Compile all validation evidence into report", priority: "Medium" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Commercial Validation Report',
      subtitle: `Validation Score: ${calculateValidationScore()}/100`,
      filename: `commercial-validation-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Market Overview', level: 1 },
        { type: 'paragraph', content: `Target Market: ${marketSummary.targetMarket}` },
        { type: 'paragraph', content: `Market Size: ${marketSummary.marketSize}` },
        { type: 'paragraph', content: `Growth Rate: ${marketSummary.growthRate}` },
        { type: 'paragraph', content: `Key Trends: ${marketSummary.keyTrends}` },
        { type: 'divider' },
        { type: 'heading', content: 'Competitor Analysis', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Competitor', 'Strengths', 'Weaknesses', 'Pricing', 'Market Share'],
            rows: competitors.filter(c => c.name).map(c => [c.name, c.strengths, c.weaknesses, c.pricing, c.marketShare])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'User Interview Insights', level: 1 },
        ...interviews.filter(i => i.intervieweeName).map(i => ({ type: 'paragraph' as const, content: `${i.intervieweeName} (${i.role} at ${i.company}): ${i.keyInsights} | Pain Points: ${i.painPoints}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Case Studies', level: 1 },
        ...caseStudies.filter(cs => cs.title).map(cs => ({ type: 'paragraph' as const, content: `${cs.title} (${cs.customer}): Problem - ${cs.problem} | Solution - ${cs.solution} | Results - ${cs.results}` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <ToolUtilityBar
          toolId="commercial-validation"
          toolName="Commercial Validation Suite"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Commercial Validation Suite
              </CardTitle>
              <CardDescription>
                Competitor analysis, user interviews, and case study builder
              </CardDescription>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Validation Score</span>
                    <span className="text-sm font-bold text-primary">{calculateValidationScore()}/100</span>
                  </div>
                  <Progress value={calculateValidationScore()} className="h-3" />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="competitors" data-testid="tab-competitors">
                      <BarChart3 className="h-4 w-4 mr-2" />Competitors
                    </TabsTrigger>
                    <TabsTrigger value="interviews" data-testid="tab-interviews">
                      <Users className="h-4 w-4 mr-2" />Interviews
                    </TabsTrigger>
                    <TabsTrigger value="casestudies" data-testid="tab-casestudies">
                      <FileText className="h-4 w-4 mr-2" />Case Studies
                    </TabsTrigger>
                    <TabsTrigger value="market" data-testid="tab-market">
                      <Target className="h-4 w-4 mr-2" />Market
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="competitors" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Competitor Analysis</h3>
                    {competitors.map((comp, index) => (
                      <Card key={comp.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Competitor Name</Label>
                            <Input
                              value={comp.name}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[index].name = e.target.value;
                                setCompetitors(updated);
                              }}
                              placeholder="Company name"
                              data-testid={`input-competitor-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Market Share</Label>
                            <Input
                              value={comp.marketShare}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[index].marketShare = e.target.value;
                                setCompetitors(updated);
                              }}
                              placeholder="e.g., 15%"
                              data-testid={`input-competitor-share-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Strengths</Label>
                            <Textarea
                              value={comp.strengths}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[index].strengths = e.target.value;
                                setCompetitors(updated);
                              }}
                              placeholder="Key strengths"
                              data-testid={`input-competitor-strengths-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Weaknesses</Label>
                            <Textarea
                              value={comp.weaknesses}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[index].weaknesses = e.target.value;
                                setCompetitors(updated);
                              }}
                              placeholder="Key weaknesses"
                              data-testid={`input-competitor-weaknesses-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Pricing</Label>
                            <Input
                              value={comp.pricing}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[index].pricing = e.target.value;
                                setCompetitors(updated);
                              }}
                              placeholder="Pricing model/range"
                              data-testid={`input-competitor-pricing-${index}`}
                            />
                          </div>
                        </div>
                        {competitors.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setCompetitors(competitors.filter((_, i) => i !== index))}
                            data-testid={`button-remove-competitor-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setCompetitors([...competitors, { id: Date.now().toString(), name: '', strengths: '', weaknesses: '', pricing: '', marketShare: '' }])}
                      data-testid="button-add-competitor"
                    >
                      <Plus className="h-4 w-4 mr-2" />Add Competitor
                    </Button>
                  </TabsContent>

                  <TabsContent value="interviews" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">User Interviews</h3>
                    {interviews.map((interview, index) => (
                      <Card key={interview.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Interviewee Name</Label>
                            <Input
                              value={interview.intervieweeName}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].intervieweeName = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="Name"
                              data-testid={`input-interview-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Input
                              value={interview.role}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].role = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="Job title"
                              data-testid={`input-interview-role-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={interview.company}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].company = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="Company name"
                              data-testid={`input-interview-company-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={interview.date}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].date = e.target.value;
                                setInterviews(updated);
                              }}
                              data-testid={`input-interview-date-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Key Insights</Label>
                            <Textarea
                              value={interview.keyInsights}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].keyInsights = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="Main takeaways from the interview"
                              data-testid={`input-interview-insights-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Pain Points Identified</Label>
                            <Textarea
                              value={interview.painPoints}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].painPoints = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="What problems did they describe?"
                              data-testid={`input-interview-pain-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Willingness to Pay</Label>
                            <Input
                              value={interview.willingnessToPay}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[index].willingnessToPay = e.target.value;
                                setInterviews(updated);
                              }}
                              placeholder="e.g., £50-100/month"
                              data-testid={`input-interview-wtp-${index}`}
                            />
                          </div>
                        </div>
                        {interviews.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setInterviews(interviews.filter((_, i) => i !== index))}
                            data-testid={`button-remove-interview-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setInterviews([...interviews, { id: Date.now().toString(), intervieweeName: '', role: '', company: '', date: '', keyInsights: '', painPoints: '', willingnessToPay: '' }])}
                      data-testid="button-add-interview"
                    >
                      <Plus className="h-4 w-4 mr-2" />Add Interview
                    </Button>
                  </TabsContent>

                  <TabsContent value="casestudies" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Case Studies</h3>
                    {caseStudies.map((cs, index) => (
                      <Card key={cs.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Case Study Title</Label>
                            <Input
                              value={cs.title}
                              onChange={(e) => {
                                const updated = [...caseStudies];
                                updated[index].title = e.target.value;
                                setCaseStudies(updated);
                              }}
                              placeholder="Descriptive title"
                              data-testid={`input-cs-title-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Customer</Label>
                            <Input
                              value={cs.customer}
                              onChange={(e) => {
                                const updated = [...caseStudies];
                                updated[index].customer = e.target.value;
                                setCaseStudies(updated);
                              }}
                              placeholder="Customer name/type"
                              data-testid={`input-cs-customer-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Problem</Label>
                            <Textarea
                              value={cs.problem}
                              onChange={(e) => {
                                const updated = [...caseStudies];
                                updated[index].problem = e.target.value;
                                setCaseStudies(updated);
                              }}
                              placeholder="What problem did the customer face?"
                              data-testid={`input-cs-problem-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Solution</Label>
                            <Textarea
                              value={cs.solution}
                              onChange={(e) => {
                                const updated = [...caseStudies];
                                updated[index].solution = e.target.value;
                                setCaseStudies(updated);
                              }}
                              placeholder="How did your solution help?"
                              data-testid={`input-cs-solution-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Results</Label>
                            <Textarea
                              value={cs.results}
                              onChange={(e) => {
                                const updated = [...caseStudies];
                                updated[index].results = e.target.value;
                                setCaseStudies(updated);
                              }}
                              placeholder="Quantifiable outcomes and benefits"
                              data-testid={`input-cs-results-${index}`}
                            />
                          </div>
                        </div>
                        {caseStudies.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setCaseStudies(caseStudies.filter((_, i) => i !== index))}
                            data-testid={`button-remove-cs-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setCaseStudies([...caseStudies, { id: Date.now().toString(), title: '', customer: '', problem: '', solution: '', results: '' }])}
                      data-testid="button-add-casestudy"
                    >
                      <Plus className="h-4 w-4 mr-2" />Add Case Study
                    </Button>
                  </TabsContent>

                  <TabsContent value="market" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Market Summary</h3>
                    <Card className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Target Market</Label>
                          <Textarea
                            value={marketSummary.targetMarket}
                            onChange={(e) => setMarketSummary({...marketSummary, targetMarket: e.target.value})}
                            placeholder="Define your ideal customer segments"
                            data-testid="input-market-target"
                          />
                        </div>
                        <div>
                          <Label>Market Size</Label>
                          <Input
                            value={marketSummary.marketSize}
                            onChange={(e) => setMarketSummary({...marketSummary, marketSize: e.target.value})}
                            placeholder="e.g., £500M TAM"
                            data-testid="input-market-size"
                          />
                        </div>
                        <div>
                          <Label>Growth Rate</Label>
                          <Input
                            value={marketSummary.growthRate}
                            onChange={(e) => setMarketSummary({...marketSummary, growthRate: e.target.value})}
                            placeholder="e.g., 15% CAGR"
                            data-testid="input-market-growth"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Key Market Trends</Label>
                          <Textarea
                            value={marketSummary.keyTrends}
                            onChange={(e) => setMarketSummary({...marketSummary, keyTrends: e.target.value})}
                            placeholder="Describe key industry trends supporting your business"
                            data-testid="input-market-trends"
                          />
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
