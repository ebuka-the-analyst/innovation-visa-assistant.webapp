import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "validation-report",
  toolName: "Validation Report",
  agent: 'nova',
  greeting: "I'm Nova, your innovation validation specialist. Let's build a comprehensive evidence portfolio that demonstrates genuine market validation and customer demand for your Innovator Founder visa application.",
  questions: [
    {
      id: 'validation-methods',
      question: "What validation methods have you used to test your business idea? Describe any customer interviews, surveys, MVP testing, pilot programs, or beta testing you've conducted.",
      hint: "Describe customer interviews, surveys, MVP testing, pilot programs, or beta testing",
      fieldKey: 'validationMethods',
      minLength: 100
    },
    {
      id: 'participants',
      question: "How many people have participated in your validation activities? Include numbers for each method (e.g., 25 customer interviews, 150 survey responses, 40 beta users).",
      hint: "Include specific numbers for each validation method",
      fieldKey: 'participants',
      minLength: 50
    },
    {
      id: 'key-findings',
      question: "What were your most important findings from customer validation? What pain points did customers confirm, and what feedback shaped your product development?",
      hint: "Focus on pain points confirmed and feedback that shaped your product",
      fieldKey: 'keyFindings',
      minLength: 100
    },
    {
      id: 'traction-metrics',
      question: "What traction metrics can you demonstrate? Include active users, revenue, engagement rates, customer retention, or growth metrics with specific numbers.",
      hint: "Include active users, revenue, engagement rates, retention, and growth metrics",
      fieldKey: 'tractionMetrics',
      minLength: 75
    },
    {
      id: 'mvp-status',
      question: "Describe your MVP or prototype status. When was it launched, how many iterations have you completed, and what key learnings emerged from real user feedback?",
      hint: "Include launch date, iterations completed, and key learnings",
      fieldKey: 'mvpStatus',
      minLength: 75
    },
    {
      id: 'product-market-fit',
      question: "What evidence suggests product-market fit? Include customer retention rates, NPS scores, organic referrals, or testimonials demonstrating sustained demand.",
      hint: "Include retention rates, NPS scores, referrals, and testimonials",
      fieldKey: 'productMarketFit',
      minLength: 75
    },
    {
      id: 'documentation',
      question: "What documentation do you have to support your validation claims? List available evidence like interview transcripts, survey data, analytics exports, or customer testimonials.",
      hint: "List interview transcripts, survey data, analytics, and testimonials",
      fieldKey: 'documentation',
      minLength: 75
    }
  ],
  completionMessage: "Your validation evidence has been captured. This comprehensive portfolio will demonstrate genuine market demand to endorsers."
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ValidationMethod = 'customer-interviews' | 'surveys' | 'mvp-testing' | 'pilot-program' | 'beta-users' | 'market-research' | 'other';

type ValidationEvidence = {
  id: string;
  method: ValidationMethod;
  description: string;
  date: string;
  participants: number;
  findings: string;
  evidenceType: string;
  documentationComplete: boolean;
};

type TractionMetric = {
  id: string;
  metric: string;
  value: number;
  unit: string;
  date: string;
  verified: boolean;
};

export default function ValidationReport() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('validation-report-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('validation-report-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('validation-report-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.validationMethods) {
      setEvidence(prev => [{
        ...prev[0],
        description: answers.validationMethods,
        findings: answers.keyFindings || ''
      }]);
    }
    if (answers.tractionMetrics) {
      setTraction(prev => [{
        ...prev[0],
        metric: 'Key Metrics',
        value: 0,
        unit: 'various'
      }]);
    }
    if (answers.mvpStatus) {
      setMvpDetails(prev => ({
        ...prev,
        launched: true,
        keyLearnings: answers.mvpStatus
      }));
    }
    if (answers.productMarketFit) {
      setProductMarketFit(prev => ({
        ...prev,
        uniqueValue: answers.productMarketFit
      }));
    }
  };

  const [evidence, setEvidence] = useState<ValidationEvidence[]>([
    {
      id: '1',
      method: 'customer-interviews',
      description: '',
      date: '',
      participants: 0,
      findings: '',
      evidenceType: '',
      documentationComplete: false
    }
  ]);

  const [traction, setTraction] = useState<TractionMetric[]>([
    {
      id: '1',
      metric: 'Active Users',
      value: 0,
      unit: 'users',
      date: '',
      verified: false
    }
  ]);

  const [mvpDetails, setMvpDetails] = useState({
    launched: false,
    launchDate: '',
    userFeedback: '',
    iterations: 0,
    keyLearnings: ''
  });

  const [productMarketFit, setProductMarketFit] = useState({
    targetMarket: '',
    problemSolved: '',
    uniqueValue: '',
    competitiveAdvantage: '',
    customerRetention: 0,
    npsScore: 0
  });

  const [activeTab, setActiveTab] = useState('validation');
  const [savedDate, setSavedDate] = useState('');

  const addEvidence = () => {
    setEvidence([...evidence, {
      id: Date.now().toString(),
      method: 'customer-interviews',
      description: '',
      date: '',
      participants: 0,
      findings: '',
      evidenceType: '',
      documentationComplete: false
    }]);
  };

  const updateEvidence = (id: string, field: keyof ValidationEvidence, value: any) => {
    setEvidence(evidence.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvidence = (id: string) => {
    setEvidence(evidence.filter(e => e.id !== id));
  };

  const addTraction = () => {
    setTraction([...traction, {
      id: Date.now().toString(),
      metric: '',
      value: 0,
      unit: '',
      date: '',
      verified: false
    }]);
  };

  const updateTraction = (id: string, field: keyof TractionMetric, value: any) => {
    setTraction(traction.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTraction = (id: string) => {
    setTraction(traction.filter(t => t.id !== id));
  };

  const calculateValidationScore = () => {
    let score = 0;
    
    // Evidence quality (40 points)
    const completedEvidence = evidence.filter(e => e.documentationComplete).length;
    const evidenceScore = Math.min(40, (completedEvidence / Math.max(evidence.length, 1)) * 40);
    score += evidenceScore;

    // Diversity of methods (20 points)
    const uniqueMethods = new Set(evidence.map(e => e.method)).size;
    const methodScore = Math.min(20, (uniqueMethods / 6) * 20);
    score += methodScore;

    // Traction metrics (20 points)
    const verifiedTraction = traction.filter(t => t.verified).length;
    const tractionScore = Math.min(20, (verifiedTraction / Math.max(traction.length, 1)) * 20);
    score += tractionScore;

    // MVP maturity (10 points)
    if (mvpDetails.launched) score += 5;
    if (mvpDetails.iterations > 0) score += 5;

    // Product-market fit indicators (10 points)
    if (productMarketFit.customerRetention > 60) score += 5;
    if (productMarketFit.npsScore > 30) score += 5;

    return Math.round(score);
  };

  const validationScore = calculateValidationScore();
  const totalParticipants = evidence.reduce((sum, e) => sum + (e.participants || 0), 0);
  const methodsUsed = new Set(evidence.map(e => e.method)).size;
  const documentedEvidence = evidence.filter(e => e.documentationComplete).length;
  const verifiedMetrics = traction.filter(t => t.verified).length;

  const getValidationTimeline = () => {
    const allDates = [
      ...evidence.filter(e => e.date).map(e => ({ date: e.date, type: 'Evidence', count: 1 })),
      ...traction.filter(t => t.date).map(t => ({ date: t.date, type: 'Metric', count: 1 }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const grouped = allDates.reduce((acc, item) => {
      const month = item.date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { month, evidence: 0, metrics: 0 };
      }
      if (item.type === 'Evidence') acc[month].evidence++;
      else acc[month].metrics++;
      return acc;
    }, {} as Record<string, { month: string; evidence: number; metrics: number }>);

    return Object.values(grouped);
  };

  const getMethodDistribution = () => {
    const methodCounts = evidence.reduce((acc, e) => {
      const methodName = e.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      acc[methodName] = (acc[methodName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([name, count]) => ({ name, count }));
  };

  const getSerializedState = () => {
    return {
      evidence,
      traction,
      mvpDetails,
      productMarketFit,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('evidence' in state) setEvidence(state.evidence);
    if ('traction' in state) setTraction(state.traction);
    if ('mvpDetails' in state) setMvpDetails(state.mvpDetails);
    if ('productMarketFit' in state) setProductMarketFit(state.productMarketFit);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('validation-report-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('validation-report-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('validation-report-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (validationScore < 50) {
      tips.push("Your validation score is below 50%. Focus on documenting comprehensive evidence of market validation and customer discovery to strengthen your endorsement application.");
    }
    
    if (methodsUsed < 3) {
      tips.push("Endorsing bodies value diverse validation methods. Aim to use at least 3-4 different approaches (interviews, surveys, MVP testing, pilot programs) to demonstrate thorough market research.");
    }
    
    if (totalParticipants < 50) {
      tips.push("Increase your sample size to at least 50-100 participants across all validation activities. Larger sample sizes provide more credible evidence for endorsers.");
    }
    
    if (documentedEvidence < evidence.length * 0.7) {
      tips.push("Less than 70% of your evidence is fully documented. Ensure all validation activities have complete records, transcripts, or data exports that can be reviewed by endorsers.");
    }
    
    if (!mvpDetails.launched) {
      tips.push("Launching an MVP significantly strengthens your application. Even a basic prototype with real user feedback demonstrates innovation and market testing.");
    }
    
    if (verifiedMetrics < traction.length * 0.5) {
      tips.push("Verify your traction metrics with screenshots, analytics exports, or third-party confirmation. Unverified metrics may be questioned during the endorsement process.");
    }
    
    if (productMarketFit.customerRetention < 60) {
      tips.push("Customer retention below 60% may indicate weak product-market fit. Focus on improving user experience and addressing feedback to demonstrate sustainable demand.");
    }
    
    if (traction.length < 5) {
      tips.push("Track at least 5-7 key metrics (users, revenue, engagement, growth rate, etc.) to provide a comprehensive picture of your business traction and market validation.");
    }
    
    if (evidence.some(e => !e.date)) {
      tips.push("Date all validation activities precisely. A clear timeline demonstrates systematic market research and helps endorsers understand your validation journey.");
    }
    
    if (!productMarketFit.competitiveAdvantage) {
      tips.push("Clearly articulate your competitive advantage based on validation findings. Endorsers need to see that your solution addresses a gap that competitors haven't solved.");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Compile all existing customer interview transcripts, survey responses, and feedback documentation into organized folders by validation method",
        priority: "Critical"
      },
      { 
        week: "Week 1-2", 
        action: "Create summary reports for each validation activity showing key findings, participant demographics, and insights gained",
        priority: "Critical"
      },
      { 
        week: "Week 2", 
        action: "Export all traction metrics from analytics platforms (Google Analytics, app dashboards, CRM) with screenshots and date ranges",
        priority: "High"
      },
      { 
        week: "Week 2", 
        action: "Document MVP development timeline, iterations, and how user feedback influenced product changes",
        priority: "High"
      },
      { 
        week: "Week 2-3", 
        action: "Gather third-party verification for key metrics (letters of support from pilot customers, testimonials, partnership confirmations)",
        priority: "Critical"
      },
      { 
        week: "Week 3", 
        action: "Create visual timeline showing progression from initial customer discovery through MVP launch to current traction",
        priority: "Medium"
      },
      { 
        week: "Week 3", 
        action: "Prepare evidence of product-market fit: retention cohorts, NPS survey results, customer success stories with quantified outcomes",
        priority: "High"
      },
      { 
        week: "Week 3-4", 
        action: "Draft comprehensive validation narrative explaining how each piece of evidence supports your innovation claim and market opportunity",
        priority: "High"
      },
      { 
        week: "Week 4", 
        action: "Have technical advisor or mentor review validation documentation for completeness and credibility",
        priority: "Medium"
      },
      { 
        week: "Week 4", 
        action: "Create executive summary of validation findings (2-3 pages) highlighting strongest evidence for endorser review",
        priority: "Critical"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - MARKET VALIDATION REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

VALIDATION SUMMARY
${'-'.repeat(80)}
Overall Validation Score: ${validationScore}%
Total Validation Activities: ${evidence.length}
Documented Evidence: ${documentedEvidence} (${Math.round((documentedEvidence / evidence.length) * 100)}%)
Methods Used: ${methodsUsed} different approaches
Total Participants: ${totalParticipants}
Verified Traction Metrics: ${verifiedMetrics} of ${traction.length}

Status: ${validationScore >= 70 ? 'STRONG VALIDATION' : validationScore >= 50 ? 'MODERATE VALIDATION' : 'NEEDS STRENGTHENING'}

VALIDATION EVIDENCE BREAKDOWN
${'-'.repeat(80)}
${evidence.map((e, i) => `
${i + 1}. ${e.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
   Date: ${e.date || 'Not specified'}
   Participants: ${e.participants}
   Description: ${e.description || 'No description provided'}
   Key Findings: ${e.findings || 'Not documented'}
   Evidence Type: ${e.evidenceType || 'Not specified'}
   Documentation: ${e.documentationComplete ? 'COMPLETE' : 'INCOMPLETE'}
`).join('')}

TRACTION METRICS
${'-'.repeat(80)}
${traction.map((t, i) => `
${i + 1}. ${t.metric}
   Value: ${t.value} ${t.unit}
   Date: ${t.date || 'Not specified'}
   Verified: ${t.verified ? 'YES' : 'NO'}
`).join('')}

MVP DEVELOPMENT STATUS
${'-'.repeat(80)}
MVP Launched: ${mvpDetails.launched ? 'YES' : 'NO'}
${mvpDetails.launched ? `Launch Date: ${mvpDetails.launchDate}` : ''}
Iterations Completed: ${mvpDetails.iterations}
Key Learnings: ${mvpDetails.keyLearnings || 'Not documented'}
User Feedback Summary: ${mvpDetails.userFeedback || 'Not provided'}

PRODUCT-MARKET FIT INDICATORS
${'-'.repeat(80)}
Target Market: ${productMarketFit.targetMarket || 'Not defined'}
Problem Solved: ${productMarketFit.problemSolved || 'Not articulated'}
Unique Value Proposition: ${productMarketFit.uniqueValue || 'Not specified'}
Competitive Advantage: ${productMarketFit.competitiveAdvantage || 'Not documented'}
Customer Retention Rate: ${productMarketFit.customerRetention}%
Net Promoter Score: ${productMarketFit.npsScore}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

ENDORSER EVIDENCE REQUIREMENTS
${'-'.repeat(80)}
To satisfy endorsing body requirements, ensure you have:

1. CUSTOMER DISCOVERY EVIDENCE
   - Minimum 20-30 documented customer interviews with transcripts or detailed notes
   - Survey data from 50+ potential customers showing demand validation
   - Problem-solution fit analysis with supporting data

2. MARKET VALIDATION DOCUMENTATION
   - Market size analysis with credible sources (industry reports, government data)
   - Competitive landscape assessment showing innovation gap
   - Target customer segment profiles with specific demographics and pain points

3. MVP TESTING RESULTS
   - Beta user feedback from at least 10-20 early adopters
   - Usage analytics showing engagement patterns and feature adoption
   - Iteration log demonstrating product improvements based on feedback

4. TRACTION METRICS (if available)
   - User acquisition data showing growth trajectory
   - Revenue or conversion metrics (even if pre-revenue, show intent/waiting list)
   - Engagement metrics (DAU/MAU, session duration, feature usage)
   - Customer testimonials or case studies with measurable outcomes

5. PRODUCT-MARKET FIT EVIDENCE
   - Retention cohort analysis showing users continue using product
   - NPS or satisfaction scores above industry averages
   - Evidence of organic growth or word-of-mouth referrals
   - Letters of intent, pilot agreements, or customer commitments

CREDIBILITY CHECKLIST
${'-'.repeat(80)}
[ ] All validation activities have specific dates
[ ] Participant counts are realistic and verifiable
[ ] Key findings are specific, not generic statements
[ ] Evidence types are clearly identified (transcripts, screenshots, analytics)
[ ] Traction metrics can be verified with third-party sources
[ ] MVP development timeline is documented with proof points
[ ] Product-market fit claims are supported by quantitative data
[ ] Competitive advantage is based on validation insights, not assumptions

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

IMPORTANT NOTE: This report is for preparation purposes only. Ensure all claims
can be substantiated with documentary evidence before submission to endorsers.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${Date.now()}.txt`;
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-validation-report">Validation Report</h1>
                <p className="text-lg text-muted-foreground">Comprehensive market validation and traction evidence generator</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Traditional Form"
                userTier={userTier}
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
          <ToolUtilityBar
            toolId="validation-report"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Validation Report"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-validation-report">
              <TabsTrigger value="validation" data-testid="tab-validation">Validation</TabsTrigger>
              <TabsTrigger value="traction" data-testid="tab-traction">Traction</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="validation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Score Overview</CardTitle>
                  <CardDescription>Overall strength of your market validation evidence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={validationScore >= 70 ? "border-green-500" : validationScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Validation Score</p>
                          <p className="text-3xl font-bold" data-testid="text-validation-score">{validationScore}%</p>
                          <Progress value={validationScore} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {validationScore >= 70 ? 'Strong' : validationScore >= 50 ? 'Moderate' : 'Needs Work'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Participants</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-participants">{totalParticipants}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {totalParticipants >= 50 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">{totalParticipants >= 50 ? 'Good Sample' : 'Small Sample'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Methods Used</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-methods-used">{methodsUsed}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {methodsUsed >= 3 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">{methodsUsed >= 3 ? 'Diverse' : 'Limited'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Documented</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-documented-evidence">{documentedEvidence}/{evidence.length}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {documentedEvidence === evidence.length ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-xs">{Math.round((documentedEvidence / evidence.length) * 100)}% Complete</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {validationScore < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your validation score is below 50%. Focus on conducting more comprehensive market research and documenting all evidence thoroughly before approaching endorsers.
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationScore >= 50 && validationScore < 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Good progress! To strengthen your application, increase evidence documentation, diversify validation methods, and verify all traction metrics.
                      </AlertDescription>
                    </Alert>
                  )}

                  {validationScore >= 70 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent validation evidence! Your comprehensive market research and traction metrics provide strong support for your endorsement application.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Validation Evidence</CardTitle>
                      <CardDescription>Customer discovery, market research, and validation activities</CardDescription>
                    </div>
                    <Button onClick={addEvidence} size="sm" data-testid="button-add-evidence">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Evidence
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evidence.map((e, index) => (
                      <Card key={e.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`method-${e.id}`}>Validation Method</Label>
                              <select
                                id={`method-${e.id}`}
                                value={e.method}
                                onChange={(ev) => updateEvidence(e.id, 'method', ev.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-method-${index}`}
                              >
                                <option value="customer-interviews">Customer Interviews</option>
                                <option value="surveys">Surveys</option>
                                <option value="mvp-testing">MVP Testing</option>
                                <option value="pilot-program">Pilot Program</option>
                                <option value="beta-users">Beta Users</option>
                                <option value="market-research">Market Research</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`date-${e.id}`}>Date</Label>
                              <Input
                                id={`date-${e.id}`}
                                type="date"
                                value={e.date}
                                onChange={(ev) => updateEvidence(e.id, 'date', ev.target.value)}
                                data-testid={`input-date-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`participants-${e.id}`}>Participants</Label>
                              <Input
                                id={`participants-${e.id}`}
                                type="number"
                                value={e.participants || ''}
                                onChange={(ev) => updateEvidence(e.id, 'participants', parseInt(ev.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-participants-${index}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`description-${e.id}`}>Description</Label>
                            <Input
                              id={`description-${e.id}`}
                              value={e.description}
                              onChange={(ev) => updateEvidence(e.id, 'description', ev.target.value)}
                              placeholder="e.g., Conducted in-depth interviews with healthcare professionals"
                              data-testid={`input-description-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`findings-${e.id}`}>Key Findings</Label>
                            <Textarea
                              id={`findings-${e.id}`}
                              value={e.findings}
                              onChange={(ev) => updateEvidence(e.id, 'findings', ev.target.value)}
                              placeholder="Summarize the key insights, pain points discovered, or validation outcomes"
                              rows={3}
                              data-testid={`textarea-findings-${index}`}
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`evidence-type-${e.id}`}>Evidence Type</Label>
                              <Input
                                id={`evidence-type-${e.id}`}
                                value={e.evidenceType}
                                onChange={(ev) => updateEvidence(e.id, 'evidenceType', ev.target.value)}
                                placeholder="e.g., Interview transcripts, survey data, analytics"
                                data-testid={`input-evidence-type-${index}`}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={e.documentationComplete}
                                  onChange={(ev) => updateEvidence(e.id, 'documentationComplete', ev.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-documented-${index}`}
                                />
                                <span className="text-sm">Documentation Complete</span>
                              </label>
                              {evidence.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEvidence(e.id)}
                                  data-testid={`button-remove-evidence-${index}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MVP Development Status</CardTitle>
                  <CardDescription>Minimum viable product testing and iteration details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mvpDetails.launched}
                        onChange={(e) => setMvpDetails({ ...mvpDetails, launched: e.target.checked })}
                        className="h-4 w-4"
                        data-testid="checkbox-mvp-launched"
                      />
                      <span className="text-sm font-medium">MVP Launched</span>
                    </label>
                  </div>

                  {mvpDetails.launched && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="launch-date">Launch Date</Label>
                          <Input
                            id="launch-date"
                            type="date"
                            value={mvpDetails.launchDate}
                            onChange={(e) => setMvpDetails({ ...mvpDetails, launchDate: e.target.value })}
                            data-testid="input-launch-date"
                          />
                        </div>
                        <div>
                          <Label htmlFor="iterations">Number of Iterations</Label>
                          <Input
                            id="iterations"
                            type="number"
                            value={mvpDetails.iterations || ''}
                            onChange={(e) => setMvpDetails({ ...mvpDetails, iterations: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            data-testid="input-iterations"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="user-feedback">User Feedback Summary</Label>
                        <Textarea
                          id="user-feedback"
                          value={mvpDetails.userFeedback}
                          onChange={(e) => setMvpDetails({ ...mvpDetails, userFeedback: e.target.value })}
                          placeholder="Summarize key feedback from MVP users"
                          rows={3}
                          data-testid="textarea-user-feedback"
                        />
                      </div>

                      <div>
                        <Label htmlFor="key-learnings">Key Learnings</Label>
                        <Textarea
                          id="key-learnings"
                          value={mvpDetails.keyLearnings}
                          onChange={(e) => setMvpDetails({ ...mvpDetails, keyLearnings: e.target.value })}
                          placeholder="What did you learn from MVP testing? How did it influence product direction?"
                          rows={3}
                          data-testid="textarea-key-learnings"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product-Market Fit Indicators</CardTitle>
                  <CardDescription>Evidence of strong alignment between product and market demand</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="target-market">Target Market</Label>
                    <Input
                      id="target-market"
                      value={productMarketFit.targetMarket}
                      onChange={(e) => setProductMarketFit({ ...productMarketFit, targetMarket: e.target.value })}
                      placeholder="e.g., Small healthcare clinics in UK with 5-20 staff"
                      data-testid="input-target-market"
                    />
                  </div>

                  <div>
                    <Label htmlFor="problem-solved">Problem Solved</Label>
                    <Textarea
                      id="problem-solved"
                      value={productMarketFit.problemSolved}
                      onChange={(e) => setProductMarketFit({ ...productMarketFit, problemSolved: e.target.value })}
                      placeholder="Describe the specific problem your solution addresses"
                      rows={3}
                      data-testid="textarea-problem-solved"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unique-value">Unique Value Proposition</Label>
                    <Textarea
                      id="unique-value"
                      value={productMarketFit.uniqueValue}
                      onChange={(e) => setProductMarketFit({ ...productMarketFit, uniqueValue: e.target.value })}
                      placeholder="What makes your solution uniquely valuable?"
                      rows={3}
                      data-testid="textarea-unique-value"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitive-advantage">Competitive Advantage</Label>
                    <Textarea
                      id="competitive-advantage"
                      value={productMarketFit.competitiveAdvantage}
                      onChange={(e) => setProductMarketFit({ ...productMarketFit, competitiveAdvantage: e.target.value })}
                      placeholder="Based on validation, how do you outperform competitors?"
                      rows={3}
                      data-testid="textarea-competitive-advantage"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="retention">Customer Retention Rate (%)</Label>
                      <Input
                        id="retention"
                        type="number"
                        value={productMarketFit.customerRetention || ''}
                        onChange={(e) => setProductMarketFit({ ...productMarketFit, customerRetention: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        max="100"
                        data-testid="input-retention"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nps">Net Promoter Score (NPS)</Label>
                      <Input
                        id="nps"
                        type="number"
                        value={productMarketFit.npsScore || ''}
                        onChange={(e) => setProductMarketFit({ ...productMarketFit, npsScore: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        min="-100"
                        max="100"
                        data-testid="input-nps"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traction" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Traction Metrics</CardTitle>
                      <CardDescription>Key performance indicators demonstrating market adoption</CardDescription>
                    </div>
                    <Button onClick={addTraction} size="sm" data-testid="button-add-traction">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Metric
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {traction.map((t, index) => (
                      <Card key={t.id} className="p-4">
                        <div className="grid md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`metric-${t.id}`}>Metric Name</Label>
                            <Input
                              id={`metric-${t.id}`}
                              value={t.metric}
                              onChange={(e) => updateTraction(t.id, 'metric', e.target.value)}
                              placeholder="e.g., Monthly Active Users, Revenue"
                              data-testid={`input-metric-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`value-${t.id}`}>Value</Label>
                            <Input
                              id={`value-${t.id}`}
                              type="number"
                              value={t.value || ''}
                              onChange={(e) => updateTraction(t.id, 'value', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-value-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`unit-${t.id}`}>Unit</Label>
                            <Input
                              id={`unit-${t.id}`}
                              value={t.unit}
                              onChange={(e) => updateTraction(t.id, 'unit', e.target.value)}
                              placeholder="e.g., users, GBP, %"
                              data-testid={`input-unit-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`metric-date-${t.id}`}>Date</Label>
                            <Input
                              id={`metric-date-${t.id}`}
                              type="date"
                              value={t.date}
                              onChange={(e) => updateTraction(t.id, 'date', e.target.value)}
                              data-testid={`input-metric-date-${index}`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={t.verified}
                              onChange={(e) => updateTraction(t.id, 'verified', e.target.checked)}
                              className="h-4 w-4"
                              data-testid={`checkbox-verified-${index}`}
                            />
                            <span className="text-sm">Verified with evidence</span>
                          </label>
                          {traction.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTraction(t.id)}
                              className="ml-auto"
                              data-testid={`button-remove-traction-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traction Summary</CardTitle>
                  <CardDescription>Overview of your business metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Metrics Tracked</p>
                      <p className="text-2xl font-bold" data-testid="text-total-metrics">{traction.length}</p>
                    </div>
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Verified Metrics</p>
                      <p className="text-2xl font-bold" data-testid="text-verified-metrics">{verifiedMetrics}</p>
                    </div>
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Verification Rate</p>
                      <p className="text-2xl font-bold" data-testid="text-verification-rate">
                        {Math.round((verifiedMetrics / traction.length) * 100)}%
                      </p>
                    </div>
                  </div>

                  {verifiedMetrics < traction.length * 0.7 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Aim to verify at least 70% of your metrics with screenshots, analytics exports, or third-party confirmation to strengthen credibility.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Timeline</CardTitle>
                    <CardDescription>Evidence and metrics collected over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getValidationTimeline().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getValidationTimeline()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="evidence" stroke="#3b82f6" strokeWidth={2} name="Evidence Items" />
                          <Line type="monotone" dataKey="metrics" stroke="#10b981" strokeWidth={2} name="Traction Metrics" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add dates to evidence and metrics to see timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Validation Methods Used</CardTitle>
                    <CardDescription>Distribution of research approaches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getMethodDistribution().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getMethodDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" name="Activities" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add validation evidence to see method distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Validation Strength Breakdown</CardTitle>
                  <CardDescription>Score components and improvement areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Evidence Quality</span>
                        <span className="text-sm text-muted-foreground">40 points possible</span>
                      </div>
                      <Progress value={Math.min(100, (documentedEvidence / Math.max(evidence.length, 1)) * 100)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {documentedEvidence} of {evidence.length} evidence items fully documented
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Method Diversity</span>
                        <span className="text-sm text-muted-foreground">20 points possible</span>
                      </div>
                      <Progress value={(methodsUsed / 6) * 100} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {methodsUsed} of 6 validation methods used
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Traction Verification</span>
                        <span className="text-sm text-muted-foreground">20 points possible</span>
                      </div>
                      <Progress value={(verifiedMetrics / Math.max(traction.length, 1)) * 100} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {verifiedMetrics} of {traction.length} metrics verified
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">MVP Maturity</span>
                        <span className="text-sm text-muted-foreground">10 points possible</span>
                      </div>
                      <Progress value={((mvpDetails.launched ? 5 : 0) + (mvpDetails.iterations > 0 ? 5 : 0)) * 10} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {mvpDetails.launched ? 'Launched' : 'Not launched'} · {mvpDetails.iterations} iterations
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Product-Market Fit</span>
                        <span className="text-sm text-muted-foreground">10 points possible</span>
                      </div>
                      <Progress value={((productMarketFit.customerRetention > 60 ? 5 : 0) + (productMarketFit.npsScore > 30 ? 5 : 0)) * 10} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {productMarketFit.customerRetention}% retention · {productMarketFit.npsScore} NPS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Evidence Requirements</CardTitle>
                  <CardDescription>What endorsing bodies expect to see</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${documentedEvidence >= evidence.length * 0.8 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {documentedEvidence >= evidence.length * 0.8 ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Comprehensive Documentation</p>
                        <p className="text-sm text-muted-foreground">All validation activities must have complete records, transcripts, or data exports that can be independently reviewed</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${totalParticipants >= 50 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {totalParticipants >= 50 ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Sufficient Sample Size</p>
                        <p className="text-sm text-muted-foreground">Minimum 50-100 participants across all validation activities to demonstrate credible market research</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${methodsUsed >= 3 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {methodsUsed >= 3 ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Diverse Validation Methods</p>
                        <p className="text-sm text-muted-foreground">Use multiple approaches (interviews, surveys, MVP testing) to triangulate findings and reduce bias</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${verifiedMetrics >= traction.length * 0.7 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {verifiedMetrics >= traction.length * 0.7 ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Verifiable Traction Metrics</p>
                        <p className="text-sm text-muted-foreground">All metrics must be supported by screenshots, analytics exports, or third-party confirmation</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${mvpDetails.launched ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {mvpDetails.launched ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">MVP Evidence</p>
                        <p className="text-sm text-muted-foreground">Demonstrable product with real user feedback shows you've moved beyond theory to practical market testing</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${productMarketFit.competitiveAdvantage ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {productMarketFit.competitiveAdvantage ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Validated Competitive Advantage</p>
                        <p className="text-sm text-muted-foreground">Your unique value must be based on validation insights, not assumptions, proving you solve problems competitors don't</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>Context-aware guidance based on your validation profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Practices for Market Validation</CardTitle>
                  <CardDescription>Proven strategies to strengthen your evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Customer Discovery Interviews</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Conduct 20-30 structured interviews with target customers</li>
                        <li>Record or take detailed notes for every interview</li>
                        <li>Ask open-ended questions about pain points, not leading questions</li>
                        <li>Look for patterns across multiple interviews, not individual opinions</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Survey Design</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Target 50+ responses for statistical relevance</li>
                        <li>Include both quantitative (scale ratings) and qualitative (open text) questions</li>
                        <li>Export full data and summary statistics as evidence</li>
                        <li>Avoid bias by testing hypotheses, not seeking confirmation</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">MVP Testing</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Launch with core features only, iterate based on feedback</li>
                        <li>Set up analytics to track user behavior and engagement</li>
                        <li>Conduct user testing sessions and document findings</li>
                        <li>Show how feedback led to product improvements</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Traction Metrics</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                        <li>Track growth metrics consistently over time (weekly or monthly)</li>
                        <li>Capture screenshots from analytics platforms as proof</li>
                        <li>Focus on quality metrics (retention, engagement) not just vanity metrics</li>
                        <li>Get customer testimonials or letters of support for credibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized steps to strengthen your validation evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium text-muted-foreground">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.priority === 'Critical' ? 'bg-destructive/20 text-destructive' :
                              item.priority === 'High' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                              'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Checklist</CardTitle>
                  <CardDescription>Ensure you have all required evidence prepared</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Customer interview transcripts or detailed notes',
                      'Survey results with full data export and analysis',
                      'MVP testing feedback and user testimonials',
                      'Analytics screenshots showing traction metrics',
                      'Letters of support from pilot customers or partners',
                      'Product-market fit analysis with supporting data',
                      'Competitive analysis showing your unique position',
                      'Timeline showing validation progression',
                      'Executive summary of validation findings',
                      'Evidence index mapping claims to documentation'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 hover-elevate rounded">
                        <input type="checkbox" className="mt-1" data-testid={`checklist-${index}`} />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </div>
    </>
  );
}
