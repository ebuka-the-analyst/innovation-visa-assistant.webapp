import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type RFEQuestion = {
  id: string;
  category: 'innovation' | 'viability' | 'scalability' | 'evidence' | 'compliance' | 'other';
  question: string;
  yourResponse: string;
  evidenceProvided: string[];
  evidenceRequired: string[];
  responseDeadline: string;
  responseStatus: 'not-started' | 'in-progress' | 'completed' | 'submitted';
  strengthScore: number;
  homeOfficeNotes: string;
};

const COMMON_RFE_CATEGORIES = {
  innovation: {
    name: 'Innovation Evidence',
    color: '#11b6e9',
    description: 'Questions about your innovation, IP, and technical differentiation'
  },
  viability: {
    name: 'Business Viability',
    color: '#10b981',
    description: 'Questions about market validation, revenue, and business model'
  },
  scalability: {
    name: 'Scalability Plans',
    color: '#8b5cf6',
    description: 'Questions about growth strategy, team expansion, and market expansion'
  },
  evidence: {
    name: 'Supporting Evidence',
    color: '#f59e0b',
    description: 'Requests for additional documentation and verification'
  },
  compliance: {
    name: 'Compliance Matters',
    color: '#ef4444',
    description: 'Legal, regulatory, and eligibility clarifications'
  },
  other: {
    name: 'Other Queries',
    color: '#6b7280',
    description: 'Miscellaneous questions and clarifications'
  }
};

const TYPICAL_RFE_QUESTIONS = [
  {
    category: 'innovation' as const,
    question: 'Provide detailed technical documentation demonstrating how your innovation differs from existing market solutions',
    evidenceRequired: ['Technical architecture diagrams', 'Competitive analysis document', 'Patent or IP documentation', 'Third-party technical validation'],
    homeOfficeNotes: 'Must clearly demonstrate genuine innovation beyond existing solutions. Include quantifiable technical advantages.'
  },
  {
    category: 'innovation' as const,
    question: 'Clarify the intellectual property protection strategy for your core technology',
    evidenceRequired: ['Patent application receipts', 'Trademark registrations', 'Copyright documentation', 'IP lawyer verification letter'],
    homeOfficeNotes: 'IP protection is critical for innovation criteria. Provide evidence of active protection measures.'
  },
  {
    category: 'viability' as const,
    question: 'Provide evidence of customer validation and market demand for your product/service',
    evidenceRequired: ['Customer letters of intent', 'Sales contracts', 'Revenue statements', 'Market research data', 'Customer testimonials'],
    homeOfficeNotes: 'Need concrete evidence of market demand, not just projections. Actual customers and revenue are strongest proof.'
  },
  {
    category: 'viability' as const,
    question: 'Explain how your revenue model will generate sustainable income within 3 years',
    evidenceRequired: ['Detailed financial projections', 'Unit economics breakdown', 'Customer acquisition cost analysis', 'Revenue timeline chart'],
    homeOfficeNotes: 'Must show realistic path to profitability. Include assumptions and risk mitigation strategies.'
  },
  {
    category: 'scalability' as const,
    question: 'Detail your plans for UK job creation and team expansion over the next 3 years',
    evidenceRequired: ['Hiring plan with timeline', 'Job descriptions for planned roles', 'Budget allocation for salaries', 'Skills matrix'],
    homeOfficeNotes: 'UK job creation is a key criterion. Must show concrete plans with realistic timelines and budgets.'
  },
  {
    category: 'scalability' as const,
    question: 'Provide evidence of scalable business model and growth strategy beyond initial market',
    evidenceRequired: ['Market expansion plan', 'Scalability analysis', 'Infrastructure roadmap', 'Partnership strategies'],
    homeOfficeNotes: 'Demonstrate business can scale significantly. Include geographic and product expansion plans.'
  },
  {
    category: 'evidence' as const,
    question: 'The bank statements provided are incomplete - provide statements for all accounts showing £50,000 availability',
    evidenceRequired: ['Complete bank statements (last 3 months)', 'Account verification letters', 'Fund source documentation', 'Transfer records'],
    homeOfficeNotes: 'All pages of statements required. Funds must be accessible and properly documented.'
  },
  {
    category: 'evidence' as const,
    question: 'Provide certified English translations for all non-English documents submitted',
    evidenceRequired: ['Certified translations', 'Translator credentials', 'Original documents', 'Translation certification'],
    homeOfficeNotes: 'Translations must be by certified translators. Include translator qualifications and certification.'
  },
  {
    category: 'compliance' as const,
    question: 'Clarify your eligibility for Innovator Founder route given previous UK visa refusal',
    evidenceRequired: ['Previous visa refusal letter', 'Explanation of circumstances', 'Evidence of changed circumstances', 'Legal opinion if applicable'],
    homeOfficeNotes: 'Address previous refusal directly. Explain what has changed and why current application should succeed.'
  },
  {
    category: 'compliance' as const,
    question: 'Verify that endorsing body followed proper due diligence procedures in your endorsement',
    evidenceRequired: ['Endorsement letter', 'Due diligence evidence', 'Endorser communication records', 'Assessment documentation'],
    homeOfficeNotes: 'Home Office may verify endorsement process. Ensure endorser can substantiate their assessment.'
  }
];

export default function RFEQADefense() {
  const [questions, setQuestions] = useState<RFEQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [responseDeadlineDate, setResponseDeadlineDate] = useState('');

  const addQuestion = (templateIndex?: number) => {
    const template = templateIndex !== undefined ? TYPICAL_RFE_QUESTIONS[templateIndex] : null;
    
    setQuestions([...questions, {
      id: Date.now().toString(),
      category: template?.category || 'other',
      question: template?.question || '',
      yourResponse: '',
      evidenceProvided: [],
      evidenceRequired: template?.evidenceRequired || [],
      responseDeadline: '',
      responseStatus: 'not-started',
      strengthScore: 0,
      homeOfficeNotes: template?.homeOfficeNotes || ''
    }]);
  };

  const updateQuestion = (id: string, field: keyof RFEQuestion, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addEvidence = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, evidenceProvided: [...q.evidenceProvided, ''] } : q
    ));
  };

  const updateEvidence = (id: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated = [...q.evidenceProvided];
        updated[index] = value;
        return { ...q, evidenceProvided: updated };
      }
      return q;
    }));
  };

  const removeEvidence = (id: string, index: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, evidenceProvided: q.evidenceProvided.filter((_, i) => i !== index) } : q
    ));
  };

  const calculateQuestionStrength = (q: RFEQuestion): number => {
    let score = 0;
    
    if (q.yourResponse.length > 100) score += 25;
    else if (q.yourResponse.length > 50) score += 15;
    else if (q.yourResponse.length > 0) score += 5;
    
    const evidenceRatio = q.evidenceProvided.filter(e => e.trim()).length / Math.max(1, q.evidenceRequired.length);
    score += Math.min(35, evidenceRatio * 35);
    
    if (q.responseStatus === 'completed') score += 20;
    else if (q.responseStatus === 'in-progress') score += 10;
    else if (q.responseStatus === 'submitted') score += 40;
    
    if (q.responseDeadline) {
      const daysUntil = Math.ceil((new Date(q.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 10) score += 20;
      else if (daysUntil > 5) score += 10;
      else if (daysUntil > 0) score += 5;
    }
    
    return Math.min(100, Math.round(score));
  };

  const getOverallStrength = (): number => {
    if (questions.length === 0) return 0;
    const scores = questions.map(q => calculateQuestionStrength(q));
    return Math.round(scores.reduce((sum, s) => sum + s, 0) / questions.length);
  };

  const getCategoryDistribution = () => {
    return Object.entries(COMMON_RFE_CATEGORIES).map(([key, cat]) => ({
      name: cat.name,
      value: questions.filter(q => q.category === key).length,
      color: cat.color
    })).filter(item => item.value > 0);
  };

  const getCompletenessData = () => {
    const statusCounts = {
      'Not Started': questions.filter(q => q.responseStatus === 'not-started').length,
      'In Progress': questions.filter(q => q.responseStatus === 'in-progress').length,
      'Completed': questions.filter(q => q.responseStatus === 'completed').length,
      'Submitted': questions.filter(q => q.responseStatus === 'submitted').length
    };

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        color: status === 'Submitted' ? '#10b981' : status === 'Completed' ? '#3b82f6' : status === 'In Progress' ? '#f59e0b' : '#ef4444'
      }));
  };

  const overallStrength = getOverallStrength();
  const completedQuestions = questions.filter(q => q.responseStatus === 'completed' || q.responseStatus === 'submitted').length;
  const submissionReady = completedQuestions === questions.length && questions.length > 0 && overallStrength >= 80;
  
  const urgentQuestions = questions.filter(q => {
    if (!q.responseDeadline) return false;
    const daysUntil = Math.ceil((new Date(q.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  }).length;

  const getSerializedState = () => {
    return {
      questions,
      activeTab,
      responseDeadlineDate,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('questions' in state) setQuestions(state.questions);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('responseDeadlineDate' in state) setResponseDeadlineDate(state.responseDeadlineDate);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'rfe-qa_handoff';
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
      const saved = localStorage.getItem('rfe-qa-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('rfe-qa-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('rfe-qa-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (questions.length === 0) {
      tips.push("Add RFE questions received from Home Office to begin tracking your response strategy");
    }
    
    if (urgentQuestions > 0) {
      tips.push(`${urgentQuestions} question(s) have deadlines within 7 days - prioritize these responses immediately`);
    }
    
    const lowStrength = questions.filter(q => calculateQuestionStrength(q) < 50).length;
    if (lowStrength > 0) {
      tips.push(`${lowStrength} question(s) have weak responses - strengthen with more evidence and detailed explanations`);
    }
    
    const missingEvidence = questions.filter(q => 
      q.evidenceProvided.filter(e => e.trim()).length < q.evidenceRequired.length
    ).length;
    if (missingEvidence > 0) {
      tips.push(`${missingEvidence} question(s) missing required evidence - gather all documents before submission`);
    }
    
    const innovationQuestions = questions.filter(q => q.category === 'innovation').length;
    if (innovationQuestions > 2) {
      tips.push("Multiple innovation questions suggest concerns about your core differentiator - consider technical expert review");
    }
    
    const viabilityQuestions = questions.filter(q => q.category === 'viability').length;
    if (viabilityQuestions > 2) {
      tips.push("Viability concerns raised - strengthen with customer validation, revenue proof, and market evidence");
    }
    
    if (overallStrength >= 85) {
      tips.push("Excellent response strength - ensure all evidence is organized and submission-ready");
    } else if (overallStrength < 60) {
      tips.push("Response strength below recommended threshold - allocate more time to strengthen each answer");
    }
    
    const noDeadlines = questions.filter(q => !q.responseDeadline).length;
    if (noDeadlines > 0) {
      tips.push("Set response deadlines for all questions to ensure timely submission (typically 28 days from RFE date)");
    }
    
    if (questions.some(q => q.category === 'compliance')) {
      tips.push("Compliance questions are critical - consider immigration lawyer review before submission");
    }
    
    if (submissionReady) {
      tips.push("All responses complete and strong - final review recommended before Home Office submission");
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1 (Days 1-7)",
        action: "Analyze all RFE questions, categorize by urgency, and identify evidence gaps for each question",
        priority: "Critical"
      },
      {
        week: "Week 1 (Days 1-7)",
        action: "Contact endorsing body to discuss RFE concerns and gather their recommended response approach",
        priority: "Critical"
      },
      {
        week: "Week 1-2 (Days 5-10)",
        action: "Draft comprehensive responses to all questions - focus on direct answers with specific evidence citations",
        priority: "Critical"
      },
      {
        week: "Week 2 (Days 8-14)",
        action: "Gather all required evidence documents - obtain updated letters, certifications, and third-party validations",
        priority: "Critical"
      },
      {
        week: "Week 2 (Days 10-14)",
        action: "Have technical expert or lawyer review responses for accuracy and completeness",
        priority: "High"
      },
      {
        week: "Week 3 (Days 15-21)",
        action: "Revise responses based on expert feedback - strengthen weak areas identified in strength analysis",
        priority: "High"
      },
      {
        week: "Week 3 (Days 18-21)",
        action: "Organize all evidence documents with clear indexing and cross-references to questions",
        priority: "High"
      },
      {
        week: "Week 4 (Days 22-25)",
        action: "Final quality review - ensure all questions answered, evidence complete, formatting professional",
        priority: "Critical"
      },
      {
        week: "Week 4 (Days 26-28)",
        action: "Submit RFE response through proper channels - retain submission confirmation and copies of all documents",
        priority: "Critical"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - RFE RESPONSE TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

RESPONSE SUMMARY
${'-'.repeat(80)}
Total RFE Questions: ${questions.length}
Overall Response Strength: ${overallStrength}%
Completed Questions: ${completedQuestions}/${questions.length}
Urgent Questions (Within 7 Days): ${urgentQuestions}
Submission Ready: ${submissionReady ? 'YES' : 'NO - Further Work Required'}
${responseDeadlineDate ? `Official Response Deadline: ${responseDeadlineDate}` : ''}

CATEGORY BREAKDOWN
${'-'.repeat(80)}
${Object.entries(COMMON_RFE_CATEGORIES).map(([key, cat]) => 
  `${cat.name}: ${questions.filter(q => q.category === key).length} question(s)`
).join('\n')}

DETAILED QUESTION-BY-QUESTION ANALYSIS
${'-'.repeat(80)}
${questions.map((q, i) => `
Question ${i + 1}: [${COMMON_RFE_CATEGORIES[q.category].name}]
${'-'.repeat(80)}
Home Office Question:
${q.question}

Your Response:
${q.yourResponse || '[NOT YET ANSWERED]'}

Evidence Required by Home Office:
${q.evidenceRequired.map((e, idx) => `  ${idx + 1}. ${e}`).join('\n') || 'None specified'}

Evidence You Will Provide:
${q.evidenceProvided.filter(e => e.trim()).map((e, idx) => `  ${idx + 1}. ${e}`).join('\n') || '[NO EVIDENCE ADDED YET]'}

Response Status: ${q.responseStatus.toUpperCase().replace('-', ' ')}
Response Deadline: ${q.responseDeadline || 'Not set'}
Strength Score: ${calculateQuestionStrength(q)}%

Home Office Notes/Context:
${q.homeOfficeNotes || 'None'}

`).join('\n')}

COMPLETION STATUS BREAKDOWN
${'-'.repeat(80)}
${getCompletenessData().map(item => `${item.status}: ${item.count} question(s)`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK RFE RESPONSE ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}
   ${item.action}`).join('\n\n')}

HOME OFFICE RFE RESPONSE BEST PRACTICES 2025
${'-'.repeat(80)}
1. DIRECT ANSWERS: Address each question specifically without evasion
2. EVIDENCE-BASED: Support every claim with documented evidence
3. PROFESSIONAL TONE: Formal, respectful language throughout
4. COMPLETE RESPONSE: Answer ALL questions - partial responses may be rejected
5. ORGANIZED FORMAT: Clear structure with question numbers and evidence index
6. TIMELY SUBMISSION: Submit well before deadline (typically 28 days from RFE date)
7. ENDORSER COORDINATION: Align responses with your endorsing body
8. LEGAL REVIEW: Have immigration lawyer review if compliance questions raised
9. ORIGINAL DOCUMENTS: Provide originals or certified copies as specified
10. SUBMISSION PROOF: Retain confirmation of submission and all document copies

CRITICAL COMPLIANCE NOTES
${'-'.repeat(80)}
- RFE responses are your opportunity to address Home Office concerns
- Failure to respond adequately may result in visa refusal
- Quality of response matters more than speed - be thorough
- Home Office may request further clarification after RFE response
- Keep all communication professional and well-documented
- Consult immigration lawyer for complex compliance questions
- Coordinate with endorsing body - they may need to provide supporting letters
- Ensure all evidence is recent (typically within 3 months for financial docs)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfe-qa-defense-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-rfe-qa">RFE Q&A Defense</h1>
            <p className="text-lg text-muted-foreground">Request for Evidence response tracker with strength analysis and Home Office compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="rfe-qa"
            toolName="RFE Q&A Defense"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-rfe-qa">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="questions" data-testid="tab-questions">Questions</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>RFE Response Status</CardTitle>
                  <CardDescription>Overall readiness and compliance assessment for Home Office RFE submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={overallStrength >= 80 ? "border-green-500 dark:border-green-500" : overallStrength >= 60 ? "border-orange-500 dark:border-orange-500" : "border-destructive dark:border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Response Strength</p>
                          <p className="text-3xl font-bold" data-testid="text-overall-strength">{overallStrength}%</p>
                          <Progress value={overallStrength} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Questions</p>
                          <p className="text-3xl font-bold" data-testid="text-total-questions">{questions.length}</p>
                          <p className="text-xs text-muted-foreground mt-2">Received from Home Office</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={completedQuestions === questions.length && questions.length > 0 ? "border-green-500 dark:border-green-500" : "border-orange-500 dark:border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completed</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-completed-questions">{completedQuestions}/{questions.length}</p>
                          <p className="text-xs text-muted-foreground mt-2">Questions answered</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={urgentQuestions === 0 ? "border-green-500 dark:border-green-500" : "border-destructive dark:border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Urgent</p>
                          <p className="text-3xl font-bold text-destructive" data-testid="text-urgent-questions">{urgentQuestions}</p>
                          <p className="text-xs text-muted-foreground mt-2">Within 7 days</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="response-deadline">Official RFE Response Deadline</Label>
                      <Input
                        id="response-deadline"
                        type="date"
                        value={responseDeadlineDate}
                        onChange={(e) => setResponseDeadlineDate(e.target.value)}
                        data-testid="input-response-deadline"
                      />
                      {responseDeadlineDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {Math.ceil((new Date(responseDeadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                        </p>
                      )}
                    </div>
                  </div>

                  {urgentQuestions > 0 && (
                    <Alert variant="destructive">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        {urgentQuestions} question(s) have deadlines within 7 days. Prioritize these responses immediately to avoid missing submission deadline.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!submissionReady && questions.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {completedQuestions < questions.length && `${questions.length - completedQuestions} question(s) still need responses. `}
                        {overallStrength < 80 && "Response strength below recommended 80% threshold. "}
                        Review recommendations to strengthen your RFE response.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submissionReady && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! All questions answered with strong evidence. Conduct final review and submit to Home Office before deadline.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common RFE Question Templates</CardTitle>
                  <CardDescription>Click to add typical Home Office RFE questions to your tracker</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {TYPICAL_RFE_QUESTIONS.map((template, index) => (
                      <Card key={index} className="p-3 hover-elevate active-elevate-2 cursor-pointer" onClick={() => addQuestion(index)} data-testid={`template-question-${index}`}>
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                            style={{ backgroundColor: COMMON_RFE_CATEGORIES[template.category].color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{template.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">{COMMON_RFE_CATEGORIES[template.category].name}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={() => addQuestion()}
                    data-testid="button-add-custom-question"
                  >
                    Add Custom Question
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>RFE Questions & Responses</CardTitle>
                  <CardDescription>Track each Home Office question, your response, and required evidence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No RFE questions added yet</p>
                      <Button onClick={() => addQuestion()} data-testid="button-add-first-question">
                        Add First Question
                      </Button>
                    </div>
                  )}

                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-6" data-testid={`question-card-${index}`}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: COMMON_RFE_CATEGORIES[question.category].color }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">Question {index + 1}</h3>
                                <span className="text-xs px-2 py-1 rounded-md bg-muted">
                                  {COMMON_RFE_CATEGORIES[question.category].name}
                                </span>
                                <span 
                                  className={`text-xs px-2 py-1 rounded-md ${
                                    calculateQuestionStrength(question) >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                                    calculateQuestionStrength(question) >= 60 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                                    calculateQuestionStrength(question) >= 40 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                                    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                  }`}
                                  data-testid={`strength-badge-${index}`}
                                >
                                  Strength: {calculateQuestionStrength(question)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            data-testid={`button-remove-question-${index}`}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`question-text-${question.id}`}>Home Office Question</Label>
                            <Textarea
                              id={`question-text-${question.id}`}
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                              placeholder="Enter the exact question from the RFE letter..."
                              rows={3}
                              data-testid={`textarea-question-${index}`}
                            />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`question-category-${question.id}`}>Category</Label>
                              <select
                                id={`question-category-${question.id}`}
                                value={question.category}
                                onChange={(e) => updateQuestion(question.id, 'category', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-category-${index}`}
                              >
                                {Object.entries(COMMON_RFE_CATEGORIES).map(([key, cat]) => (
                                  <option key={key} value={key}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`question-status-${question.id}`}>Status</Label>
                              <select
                                id={`question-status-${question.id}`}
                                value={question.responseStatus}
                                onChange={(e) => updateQuestion(question.id, 'responseStatus', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-status-${index}`}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="submitted">Submitted</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`question-deadline-${question.id}`}>Deadline</Label>
                              <Input
                                id={`question-deadline-${question.id}`}
                                type="date"
                                value={question.responseDeadline}
                                onChange={(e) => updateQuestion(question.id, 'responseDeadline', e.target.value)}
                                data-testid={`input-deadline-${index}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`question-response-${question.id}`}>Your Response</Label>
                          <Textarea
                            id={`question-response-${question.id}`}
                            value={question.yourResponse}
                            onChange={(e) => updateQuestion(question.id, 'yourResponse', e.target.value)}
                            placeholder="Draft your detailed response to this question. Be specific, provide evidence citations, and address all aspects of the question..."
                            rows={5}
                            data-testid={`textarea-response-${index}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {question.yourResponse.length} characters (recommended: 200+ for comprehensive answers)
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Evidence Required by Home Office</Label>
                            <div className="space-y-2 mt-2">
                              {question.evidenceRequired.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No specific evidence requirements listed</p>
                              ) : (
                                question.evidenceRequired.map((req, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{req}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Evidence You Will Provide</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addEvidence(question.id)}
                                data-testid={`button-add-evidence-${index}`}
                              >
                                Add
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {question.evidenceProvided.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No evidence added yet</p>
                              ) : (
                                question.evidenceProvided.map((evidence, evidenceIdx) => (
                                  <div key={evidenceIdx} className="flex items-center gap-2">
                                    <Input
                                      value={evidence}
                                      onChange={(e) => updateEvidence(question.id, evidenceIdx, e.target.value)}
                                      placeholder="e.g., Patent Application GB123456"
                                      data-testid={`input-evidence-${index}-${evidenceIdx}`}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeEvidence(question.id, evidenceIdx)}
                                      data-testid={`button-remove-evidence-${index}-${evidenceIdx}`}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {question.homeOfficeNotes && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-medium mb-1">Home Office Context Notes:</p>
                              <p className="text-sm">{question.homeOfficeNotes}</p>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </Card>
                  ))}

                  {questions.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => addQuestion()}
                      data-testid="button-add-another-question"
                    >
                      Add Another Question
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Question Categories</CardTitle>
                    <CardDescription>Distribution of RFE questions by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCategoryDistribution().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getCategoryDistribution()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {getCategoryDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add questions to see category distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Completeness</CardTitle>
                    <CardDescription>Progress tracking by status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getCompletenessData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getCompletenessData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count">
                            {getCompletenessData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add questions to see completion status</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Individual Question Strength Analysis</CardTitle>
                  <CardDescription>Detailed strength assessment for each RFE question</CardDescription>
                </CardHeader>
                <CardContent>
                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((q, index) => {
                        const strength = calculateQuestionStrength(q);
                        return (
                          <div key={q.id} className="flex items-center gap-4" data-testid={`strength-row-${index}`}>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium line-clamp-1">
                                  Q{index + 1}: {q.question || 'Untitled question'}
                                </p>
                                <span className="text-sm font-bold">{strength}%</span>
                              </div>
                              <Progress value={strength} />
                            </div>
                            <div 
                              className="w-16 text-center px-2 py-1 rounded-md text-xs font-medium"
                              style={{
                                backgroundColor: strength >= 80 ? '#10b981' : strength >= 60 ? '#3b82f6' : strength >= 40 ? '#f59e0b' : '#ef4444',
                                color: '#ffffff'
                              }}
                            >
                              {strength >= 80 ? 'Strong' : strength >= 60 ? 'Good' : strength >= 40 ? 'Fair' : 'Weak'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add questions to see strength analysis</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Home Office RFE Response Standards 2025</CardTitle>
                  <CardDescription>Key compliance criteria for successful RFE responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Direct and Complete Answers</p>
                        <p className="text-sm text-muted-foreground">Address every aspect of each question without evasion or deflection</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Evidence-Based Responses</p>
                        <p className="text-sm text-muted-foreground">Support all claims with documented evidence, not assertions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Timely Submission</p>
                        <p className="text-sm text-muted-foreground">Respond within 28 days (or specified deadline) - late responses may be rejected</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Professional Organization</p>
                        <p className="text-sm text-muted-foreground">Clear indexing, numbered responses matching questions, complete documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Endorser Coordination</p>
                        <p className="text-sm text-muted-foreground">Align responses with endorsing body - they may need to provide supporting letters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Legal Review for Compliance Questions</p>
                        <p className="text-sm text-muted-foreground">Immigration lawyer review recommended for eligibility or regulatory questions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Personalized tips based on your RFE response analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RFE Response Best Practices</CardTitle>
                  <CardDescription>Proven strategies for successful Home Office RFE submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Understand the Underlying Concern</h4>
                      <p className="text-sm text-muted-foreground">
                        RFE questions reveal Home Office concerns. Address the root issue, not just the surface question. If they ask about innovation evidence, they are concerned about your genuineness.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Quality Over Speed</h4>
                      <p className="text-sm text-muted-foreground">
                        While timely response is important, a thorough, well-evidenced response is more valuable than a rushed submission. Use the full response period wisely.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Evidence Indexing System</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a clear evidence index. Number each document and reference them in your responses (e.g., "See Evidence Doc 3.2 - Customer Contract with ABC Ltd").
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">4. Third-Party Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Letters from customers, investors, technical experts, or your endorsing body carry more weight than your own assertions. Obtain supporting letters on official letterhead.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">5. Consistency Check</h4>
                      <p className="text-sm text-muted-foreground">
                        Ensure your RFE responses align with your original application and endorsement letter. Inconsistencies raise red flags.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">6. Professional Tone Throughout</h4>
                      <p className="text-sm text-muted-foreground">
                        Maintain formal, respectful language. Avoid defensive or emotional responses. Focus on facts and evidence.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">7. Submission Proof</h4>
                      <p className="text-sm text-muted-foreground">
                        Retain submission confirmation, tracking information, and complete copies of all documents sent. This is critical if questions arise later.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">8. Follow-Up Preparation</h4>
                      <p className="text-sm text-muted-foreground">
                        Home Office may request further clarification after RFE response. Be prepared for additional questions and maintain document availability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week RFE Response Action Plan</CardTitle>
                  <CardDescription>Structured timeline for comprehensive RFE response preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className={`px-3 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                              item.priority === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                              item.priority === 'High' ? 'bg-orange-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.week}</h4>
                            <p className="text-sm text-muted-foreground" data-testid={`action-item-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Deadlines & Milestones</CardTitle>
                  <CardDescription>Key dates to track for successful RFE response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">RFE Received Date</p>
                        <p className="text-sm text-muted-foreground">Document when you received the RFE letter</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Response Deadline (Typically 28 Days)</p>
                        <p className="text-sm text-muted-foreground">
                          {responseDeadlineDate 
                            ? `Set for ${new Date(responseDeadlineDate).toLocaleDateString('en-GB')} - ${Math.ceil((new Date(responseDeadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining`
                            : 'Set your deadline in the Overview tab'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Week 1 Milestone: Question Analysis Complete</p>
                        <p className="text-sm text-muted-foreground">All questions categorized and evidence gaps identified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Week 2 Milestone: Draft Responses Ready</p>
                        <p className="text-sm text-muted-foreground">All responses drafted and evidence gathering in progress</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Week 3 Milestone: Expert Review Complete</p>
                        <p className="text-sm text-muted-foreground">Technical/legal review done, revisions incorporated</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Week 4 Milestone: Submission Ready</p>
                        <p className="text-sm text-muted-foreground">Final review complete, documents organized, ready to submit</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
