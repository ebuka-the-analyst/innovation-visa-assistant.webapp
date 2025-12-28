import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, Users, Zap } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "win-predictor",
  toolName: "Win Predictor",
  agent: "atlas",
  greeting: "Hello! I'm Atlas, your growth strategy specialist. Let me help you predict your endorsement success rate by evaluating your application strength across key criteria.",
  questions: [
    {
      id: "innovation",
      question: "Describe your business innovation. What makes your solution genuinely new, improved, or different from existing alternatives?",
      hint: "Describe your unique technology, novel approach, or market-first solution",
      fieldKey: "innovation",
      minLength: 80
    },
    {
      id: "viability",
      question: "What evidence demonstrates your business viability? Include revenue, customers, partnerships, or validation data.",
      hint: "Share your traction metrics, revenue figures, customer count, partnerships, and market validation",
      fieldKey: "viability",
      minLength: 80
    },
    {
      id: "scalability",
      question: "How will your business scale? What's your growth strategy and expansion potential?",
      hint: "Describe your scaling strategy, target markets, growth projections, and expansion plans",
      fieldKey: "scalability",
      minLength: 70
    },
    {
      id: "evidence",
      question: "What supporting evidence and documentation do you have ready for your application?",
      hint: "List your prepared documents: business plan, financial projections, market research, IP filings, testimonials",
      fieldKey: "evidence",
      minLength: 60
    },
    {
      id: "team",
      question: "Describe your team's relevant experience and capabilities for executing your business plan.",
      hint: "Detail your team's background, industry experience, technical skills, and track record",
      fieldKey: "team",
      minLength: 60
    },
    {
      id: "market",
      question: "What UK market opportunity are you addressing? Why is the UK the right market for your business?",
      hint: "Describe your target UK market, addressable opportunity, and why the UK is strategically important",
      fieldKey: "market",
      minLength: 70
    },
    {
      id: "endorser",
      question: "Which endorsing body are you targeting and why? How does your business align with their focus area?",
      hint: "Name your target endorser and explain the alignment with their criteria and focus areas",
      fieldKey: "endorser",
      minLength: 60
    }
  ],
  completionMessage: "Your application strength has been assessed. Use these insights to optimize your endorsement strategy."
};

type CriteriaScores = {
  innovation: number;
  viability: number;
  scalability: number;
  evidence: number;
  team: number;
  market: number;
};

type EndorserProfile = {
  name: string;
  approvalThreshold: number;
  innovationWeight: number;
  viabilityWeight: number;
  scalabilityWeight: number;
  evidenceWeight: number;
  teamWeight: number;
  marketWeight: number;
  focusArea: string;
  processingTime: string;
  successRate: number;
};

const ENDORSERS: EndorserProfile[] = [
  {
    name: "Envestors",
    approvalThreshold: 72,
    innovationWeight: 0.30,
    viabilityWeight: 0.35,
    scalabilityWeight: 0.20,
    evidenceWeight: 0.05,
    teamWeight: 0.05,
    marketWeight: 0.05,
    focusArea: "Investment Readiness",
    processingTime: "6-12 weeks",
    successRate: 70
  },
  {
    name: "Innovator International",
    approvalThreshold: 70,
    innovationWeight: 0.25,
    viabilityWeight: 0.30,
    scalabilityWeight: 0.20,
    evidenceWeight: 0.10,
    teamWeight: 0.10,
    marketWeight: 0.05,
    focusArea: "Business Viability",
    processingTime: "6-10 weeks",
    successRate: 72
  },
  {
    name: "UK University Routes",
    approvalThreshold: 78,
    innovationWeight: 0.40,
    viabilityWeight: 0.15,
    scalabilityWeight: 0.15,
    evidenceWeight: 0.20,
    teamWeight: 0.05,
    marketWeight: 0.05,
    focusArea: "Academic Excellence",
    processingTime: "10-14 weeks",
    successRate: 64
  },
  {
    name: "Envestors",
    approvalThreshold: 72,
    innovationWeight: 0.20,
    viabilityWeight: 0.35,
    scalabilityWeight: 0.25,
    evidenceWeight: 0.10,
    teamWeight: 0.05,
    marketWeight: 0.05,
    focusArea: "Investment Readiness",
    processingTime: "8-12 weeks",
    successRate: 70
  },
  {
    name: "The Global Entrepreneurs Programme",
    approvalThreshold: 73,
    innovationWeight: 0.30,
    viabilityWeight: 0.25,
    scalabilityWeight: 0.20,
    evidenceWeight: 0.10,
    teamWeight: 0.10,
    marketWeight: 0.05,
    focusArea: "Global Scaling",
    processingTime: "6-10 weeks",
    successRate: 71
  },
];

export default function WinPredictor() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('win-predictor-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('win-predictor-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('win-predictor-mode', mode);
  }, [mode]);

  const [scores, setScores] = useState<CriteriaScores>({
    innovation: 50,
    viability: 50,
    scalability: 50,
    evidence: 50,
    team: 50,
    market: 50
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const handleAiComplete = useCallback((_answers: Record<string, string>) => {
    setMode('traditional');
  }, []);

  const updateScore = (field: keyof CriteriaScores, value: number) => {
    setScores(prev => ({ ...prev, [field]: value }));
  };

  const overallScore = Math.round(
    (scores.innovation * 0.30) +
    (scores.viability * 0.25) +
    (scores.scalability * 0.20) +
    (scores.evidence * 0.10) +
    (scores.team * 0.10) +
    (scores.market * 0.05)
  );

  const approvalProbability = Math.min(100, Math.max(0, 
    ((overallScore - 50) / 40) * 100
  ));

  const strongThreshold = 80;
  const goodThreshold = 70;
  const moderateThreshold = 60;

  const getProbabilityStatus = () => {
    if (approvalProbability >= 85) return { text: 'Excellent', color: 'text-green-600', icon: CheckCircle2 };
    if (approvalProbability >= 70) return { text: 'Strong', color: 'text-blue-600', icon: TrendingUp };
    if (approvalProbability >= 50) return { text: 'Moderate', color: 'text-orange-600', icon: AlertTriangle };
    return { text: 'Weak', color: 'text-red-600', icon: XCircle };
  };

  const radarData = [
    { criterion: 'Innovation', value: scores.innovation, fullMark: 100 },
    { criterion: 'Viability', value: scores.viability, fullMark: 100 },
    { criterion: 'Scalability', value: scores.scalability, fullMark: 100 },
    { criterion: 'Evidence', value: scores.evidence, fullMark: 100 },
    { criterion: 'Team', value: scores.team, fullMark: 100 },
    { criterion: 'Market', value: scores.market, fullMark: 100 },
  ];

  const criteriaBreakdown = [
    { name: 'Innovation', score: scores.innovation, weight: 30, weightedScore: Math.round(scores.innovation * 0.30) },
    { name: 'Viability', score: scores.viability, weight: 25, weightedScore: Math.round(scores.viability * 0.25) },
    { name: 'Scalability', score: scores.scalability, weight: 20, weightedScore: Math.round(scores.scalability * 0.20) },
    { name: 'Evidence', score: scores.evidence, weight: 10, weightedScore: Math.round(scores.evidence * 0.10) },
    { name: 'Team', score: scores.team, weight: 10, weightedScore: Math.round(scores.team * 0.10) },
    { name: 'Market', score: scores.market, weight: 5, weightedScore: Math.round(scores.market * 0.05) },
  ];

  const endorserAnalysis = ENDORSERS.map(endorser => {
    const weightedScore = Math.round(
      (scores.innovation * endorser.innovationWeight) +
      (scores.viability * endorser.viabilityWeight) +
      (scores.scalability * endorser.scalabilityWeight) +
      (scores.evidence * endorser.evidenceWeight) +
      (scores.team * endorser.teamWeight) +
      (scores.market * endorser.marketWeight)
    );
    
    const probability = Math.min(100, Math.max(0, 
      ((weightedScore - endorser.approvalThreshold + 20) / 30) * 100
    ));

    const adjustedProbability = Math.round(probability * (endorser.successRate / 100));

    return {
      name: endorser.name,
      weightedScore,
      threshold: endorser.approvalThreshold,
      probability: adjustedProbability,
      focusArea: endorser.focusArea,
      processingTime: endorser.processingTime,
      successRate: endorser.successRate,
      gap: weightedScore - endorser.approvalThreshold,
      likely: weightedScore >= endorser.approvalThreshold
    };
  }).sort((a, b) => b.probability - a.probability);

  const getSerializedState = () => {
    return {
      scores,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('scores' in state) setScores(state.scores);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'win-predictor_handoff';
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
      const saved = localStorage.getItem('win-predictor-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('win-predictor-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('win-predictor-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (scores.innovation < 60) {
      tips.push("Critical Innovation Gap: Your innovation score is below endorser expectations. Strengthen with patent applications, technical specifications demonstrating novelty, and expert validation letters from industry authorities. GOV.UK requires genuine innovation unavailable in UK market.");
    }
    
    if (scores.innovation >= 80) {
      tips.push("Exceptional Innovation Profile: Your innovation strength is outstanding. Ensure all IP documentation is comprehensive with patent applications, proprietary technology descriptions, and competitive differentiation analysis clearly documented.");
    }
    
    if (scores.viability < 60) {
      tips.push("Viability Concerns Detected: Financial model needs strengthening. Endorsers require detailed 3-year projections with verified funding, realistic revenue assumptions backed by market data, and credible path to profitability with sensitivity analysis.");
    }
    
    if (scores.viability >= 80) {
      tips.push("Strong Business Viability: Your financial foundation is solid. Highlight verified funding sources with bank statements, conservative revenue projections with market validation, and clear unit economics demonstrating sustainable business model.");
    }
    
    if (scores.scalability < 60) {
      tips.push("Scalability Strategy Weak: Growth plan requires significant enhancement. Include specific job creation targets (minimum 2 FTE by Year 3), technology infrastructure scaling roadmap, geographic expansion strategy, and evidence of market demand supporting growth assumptions.");
    }
    
    if (scores.scalability >= 80) {
      tips.push("Excellent Growth Potential: Scaling strategy well-developed. Emphasize international expansion plans, technology leverage enabling non-linear growth, partnership strategies for rapid market penetration, and documented evidence of scalable market demand.");
    }
    
    if (scores.evidence < 55) {
      tips.push("Evidence Portfolio Insufficient: Documentation quality is critical weakness. Each claim needs independent verification - customer contracts, letters of intent, market research from credible sources, expert testimonials, financial statements, and technical validation from recognized authorities.");
    }
    
    if (scores.evidence >= 75) {
      tips.push("Superior Evidence Quality: Documentation portfolio is comprehensive. Organize by criterion (Innovation, Viability, Scalability) with clear evidence mapping, ensure all documents are recent (within 6 months), and include executive summary explaining validation chain.");
    }
    
    if (scores.team < 55) {
      tips.push("Team Capability Concerns: Founding team credentials need strengthening. Include detailed CVs highlighting relevant expertise, advisory board members with industry credibility, evidence of successful track record in relevant domains, and clear demonstration of complementary skill sets.");
    }
    
    if (scores.team >= 75) {
      tips.push("Strong Team Foundation: Leadership capability well-documented. Highlight specific achievements demonstrating domain expertise, advisory board quality with recognized industry authorities, and clear evidence of team's ability to execute the business plan successfully.");
    }
    
    if (scores.market < 50) {
      tips.push("Market Understanding Weak: Market analysis requires significant enhancement. Provide credible TAM/SAM/SOM analysis from recognized research firms, evidence of market gap your innovation addresses, competitive landscape analysis, and validation of customer demand through surveys or commitments.");
    }
    
    if (scores.market >= 75) {
      tips.push("Excellent Market Validation: Market opportunity well-substantiated. Include detailed competitive positioning, evidence of market gap with independent validation, customer demand verification through contracts or letters of intent, and clear differentiation strategy.");
    }
    
    if (overallScore < 60) {
      tips.push("Overall Application Below Acceptance Range: Your weighted score of " + overallScore + "% is concerning. Focus urgently on weakest criteria - endorsers reject applications when single criterion scores below 50% regardless of overall average. Prioritize Innovation and Viability improvements immediately.");
    }
    
    if (approvalProbability >= 70) {
      tips.push("Strong Approval Likelihood: Your profile shows " + Math.round(approvalProbability) + "% approval probability. Focus final preparation on interview readiness - practice defending each criterion with specific evidence, prepare technical explanations for non-technical assessors, rehearse common endorser questions.");
    }
    
    const imbalance = Math.max(
      Math.abs(scores.innovation - scores.viability),
      Math.abs(scores.viability - scores.scalability),
      Math.abs(scores.scalability - scores.evidence)
    );
    
    if (imbalance > 30) {
      tips.push("Profile Imbalance Warning: Large disparities between criteria (" + imbalance + " point gap) raise concerns. Endorsers prefer balanced applications - 65-65-65 profile stronger than 85-45-75. Address weakest areas urgently as imbalance suggests fundamental business gaps.");
    }
    
    if (scores.evidence < scores.innovation - 20) {
      tips.push("Evidence-Claims Gap Critical: Innovation claims exceed supporting documentation by " + Math.abs(scores.evidence - scores.innovation) + " points. This is major weakness - endorsers reject strong claims without proportional verification. Gather independent validation immediately.");
    }
    
    const bestEndorser = endorserAnalysis[0];
    if (bestEndorser.probability >= 60) {
      tips.push("Optimal Endorser Match: " + bestEndorser.name + " shows " + bestEndorser.probability + "% approval likelihood with focus on " + bestEndorser.focusArea + ". This endorser's criteria weighting aligns well with your strength profile - prioritize this application route.");
    }
    
    if (endorserAnalysis.every(e => e.probability < 50)) {
      tips.push("Multi-Endorser Concerns: All endorsers show less than 50% approval probability. This indicates fundamental application weaknesses requiring comprehensive strengthening before submission. Consider engaging specialist immigration advisor for targeted guidance.");
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Conduct comprehensive self-assessment across all six criteria using official GOV.UK Innovator Founder requirements as benchmark - Innovation, Viability, Scalability, Evidence Quality, Team Capability, Market Validation",
      priority: "Critical"
    });
    
    if (scores.innovation < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Strengthen innovation documentation urgently - file provisional patents or patent applications, create detailed technical specifications demonstrating novelty, obtain expert validation letters from recognized industry authorities with specific technical assessment",
        priority: "Critical"
      });
    }
    
    if (scores.viability < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Enhance financial model comprehensively - create detailed 36-month cashflow projections with sensitivity analysis, obtain accountant certification, gather independent market size validation, verify all funding sources with bank statements showing accessibility",
        priority: "Critical"
      });
    }
    
    if (scores.scalability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Develop comprehensive scaling strategy - specific hiring plan with roles, timelines and minimum 2 FTE by Year 3, technology infrastructure scaling roadmap, geographic expansion targets with market entry strategies, partnership agreements supporting growth",
        priority: "High"
      });
    }
    
    if (scores.evidence < 65) {
      actions.push({
        week: "Week 1-3",
        action: "Build comprehensive evidence portfolio - customer letters of intent with specific commitment details, independent market research reports, complete financial verification documents, IP filing confirmations, team credentials with achievement evidence, third-party technical validation",
        priority: "Critical"
      });
    }
    
    if (scores.team < 65) {
      actions.push({
        week: "Week 2-3",
        action: "Strengthen team credentials - prepare detailed CVs highlighting relevant domain expertise and achievements, recruit advisory board members with recognized industry authority, document successful track record in relevant sectors, demonstrate complementary skill coverage",
        priority: "High"
      });
    }
    
    if (scores.market < 60) {
      actions.push({
        week: "Week 2",
        action: "Enhance market analysis - obtain credible TAM/SAM/SOM research from recognized firms, document market gap with independent validation, create detailed competitive landscape analysis, gather customer demand evidence through surveys or signed commitments",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3",
      action: "Organize complete application package by criterion with clear evidence mapping - Innovation proofs, Viability documentation, Scalability roadmaps, Evidence portfolio, Team credentials, Market validation - all cross-referenced with index and executive summary",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3-4",
      action: "Select optimal endorsing body based on probability analysis - " + endorserAnalysis[0].name + " shows highest match (" + endorserAnalysis[0].probability + "% probability) with focus on " + endorserAnalysis[0].focusArea + ". Review their specific requirements and align application emphasis accordingly",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Interview preparation intensive - practice defending each criterion with specific evidence references, prepare technical explanations accessible to non-technical assessors, rehearse common endorser challenge questions, conduct mock interview with external reviewer",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Final quality assurance review - engage external expert to assess application completeness and strength, verify all documentation is current (within 6 months), ensure no evidence gaps, confirm all claims have independent verification, check professional presentation quality",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor endorsing body requirement changes - criteria emphasis varies significantly (UKES weights Innovation 35%, Envestors weights Viability 35%), track policy updates, maintain business momentum to demonstrate ongoing progress throughout application period",
      priority: "Medium"
    });
    
    return actions.slice(0, 12);
  };

  const handleExport = () => {
    const status = getProbabilityStatus();
    const report = `UK INNOVATOR FOUNDER VISA - APPROVAL PROBABILITY PREDICTOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL APPROVAL ASSESSMENT
${'-'.repeat(80)}
Overall Weighted Score: ${overallScore}/100
Approval Probability: ${Math.round(approvalProbability)}%
Status: ${status.text.toUpperCase()}
Confidence Level: ${approvalProbability >= 85 ? 'Very High' : approvalProbability >= 70 ? 'High' : approvalProbability >= 50 ? 'Moderate' : 'Low'}

WEIGHTED SCORING MODEL
${'-'.repeat(80)}
Innovation Strength:    30% weight × ${scores.innovation}/100 = ${Math.round(scores.innovation * 0.30)}/30
Viability Strength:     25% weight × ${scores.viability}/100 = ${Math.round(scores.viability * 0.25)}/25
Scalability Potential:  20% weight × ${scores.scalability}/100 = ${Math.round(scores.scalability * 0.20)}/20
Evidence Quality:       10% weight × ${scores.evidence}/100 = ${Math.round(scores.evidence * 0.10)}/10
Team Capability:        10% weight × ${scores.team}/100 = ${Math.round(scores.team * 0.10)}/10
Market Validation:       5% weight × ${scores.market}/100 = ${Math.round(scores.market * 0.05)}/5
                                                Total: ${overallScore}/100

ENDORSING BODY APPROVAL PROBABILITY
${'-'.repeat(80)}
${endorserAnalysis.map((e, i) => `${i + 1}. ${e.name}: ${e.probability}% (${e.focusArea})`).join('\n')}

Best Match: ${endorserAnalysis[0].name} - ${endorserAnalysis[0].probability}% probability

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map((item, i) => `${i + 1}. [${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `win-predictor-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const probabilityStatus = getProbabilityStatus();
  const StatusIcon = probabilityStatus.icon;

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-win-predictor">Visa Approval Win Predictor</h1>
                <p className="text-lg text-muted-foreground">Comprehensive assessment of visa approval probability across all criteria with endorsing body analysis</p>
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
            toolId="win-predictor"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Win Predictor"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-win-predictor">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="probability" data-testid="tab-probability">Probability</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Overall Approval Probability
                    </CardTitle>
                    <CardDescription>Comprehensive assessment based on all criteria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-64 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Probability', value: approvalProbability },
                                { name: 'Gap', value: 100 - approvalProbability }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                            >
                              <Cell fill={approvalProbability >= 85 ? '#10b981' : approvalProbability >= 70 ? '#3b82f6' : approvalProbability >= 50 ? '#f59e0b' : '#ef4444'} />
                              <Cell fill="#e5e7eb" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-5xl font-bold" data-testid="text-approval-probability">{Math.round(approvalProbability)}%</p>
                          <p className="text-sm text-muted-foreground mt-1">Approval Probability</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <StatusIcon className={`h-6 w-6 ${probabilityStatus.color}`} />
                      <span className={`text-lg font-semibold ${probabilityStatus.color}`} data-testid="text-probability-status">
                        {probabilityStatus.text}
                      </span>
                    </div>

                    <Alert className={
                      approvalProbability >= 85 ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                      approvalProbability >= 70 ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
                      approvalProbability >= 50 ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
                      'border-red-500 bg-red-50 dark:bg-red-950'
                    }>
                      <AlertDescription>
                        {approvalProbability >= 85 ? 
                          'Excellent approval likelihood. Your profile exceeds endorser requirements with strong performance across all criteria. Focus on interview preparation and maintaining documentation quality.' :
                          approvalProbability >= 70 ?
                          'Strong approval probability. Your application shows good potential. Continue strengthening weak areas and ensure all evidence is comprehensive and current.' :
                          approvalProbability >= 50 ?
                          'Moderate approval probability. Your application has potential but requires significant strengthening before submission. Prioritize critical gaps in weak criteria immediately.' :
                          'Low approval probability. Your application currently falls below acceptable thresholds. Comprehensive strengthening across multiple criteria is urgently required before proceeding.'}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weighted Score</CardTitle>
                    <CardDescription>Overall application strength</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-primary" data-testid="text-overall-score">{overallScore}/100</p>
                      <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                    </div>
                    <Progress value={overallScore} className="mb-4" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Strong Threshold:</span>
                        <span className="font-medium">{strongThreshold}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Good Threshold:</span>
                        <span className="font-medium">{goodThreshold}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Minimum Threshold:</span>
                        <span className="font-medium">{moderateThreshold}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        {overallScore >= strongThreshold ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : overallScore >= goodThreshold ? (
                          <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        ) : overallScore >= moderateThreshold ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="text-sm">
                          {overallScore >= strongThreshold ? 'Exceeds strong threshold' :
                           overallScore >= goodThreshold ? 'Meets good threshold' :
                           overallScore >= moderateThreshold ? 'Meets minimum threshold' :
                           'Below minimum threshold'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Criteria Strength Profile</CardTitle>
                  <CardDescription>Six-dimensional assessment of application strength</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="criterion" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Your Score" dataKey="value" stroke="#005EB8" fill="#005EB8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weighted Criteria Breakdown</CardTitle>
                  <CardDescription>How each criterion contributes to your overall score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={criteriaBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="weightedScore" fill="#005EB8" name="Weighted Score" />
                      <Bar dataKey="weight" fill="#3b82f6" name="Maximum Weight" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assess Your Application Strength</CardTitle>
                  <CardDescription>Rate each criterion honestly from 0-100 based on your current preparation level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Innovation Strength (30% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Genuine novelty, IP protection, technological advancement, market differentiation
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-innovation-score">{scores.innovation}</span>
                      </div>
                      <Slider
                        value={[scores.innovation]}
                        onValueChange={(v) => updateScore('innovation', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-innovation"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>No innovation</span>
                        <span>Weak</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                        <span>Exceptional</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Viability Strength (25% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Financial sustainability, verified funding, market demand proof, revenue model credibility
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-viability-score">{scores.viability}</span>
                      </div>
                      <Slider
                        value={[scores.viability]}
                        onValueChange={(v) => updateScore('viability', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-viability"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Unviable</span>
                        <span>Weak</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Scalability Potential (20% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Growth trajectory, job creation plans (2+ FTE by Year 3), geographic expansion, technology leverage
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-scalability-score">{scores.scalability}</span>
                      </div>
                      <Slider
                        value={[scores.scalability]}
                        onValueChange={(v) => updateScore('scalability', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-scalability"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Limited</span>
                        <span>Weak</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                        <span>Outstanding</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Evidence Quality (10% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Documentation completeness, third-party validation, recency, independent verification of all claims
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-evidence-score">{scores.evidence}</span>
                      </div>
                      <Slider
                        value={[scores.evidence]}
                        onValueChange={(v) => updateScore('evidence', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-evidence"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Poor</span>
                        <span>Weak</span>
                        <span>Adequate</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Team Capability (10% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Founder credentials, relevant expertise, advisory board quality, proven track record
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-team-score">{scores.team}</span>
                      </div>
                      <Slider
                        value={[scores.team]}
                        onValueChange={(v) => updateScore('team', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-team"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Weak</span>
                        <span>Limited</span>
                        <span>Adequate</span>
                        <span>Strong</span>
                        <span>Exceptional</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-base font-semibold">Market Validation (5% weight)</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Market size substantiation (TAM/SAM/SOM), competitive analysis, customer demand evidence
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary min-w-[60px] text-right" data-testid="text-market-score">{scores.market}</span>
                      </div>
                      <Slider
                        value={[scores.market]}
                        onValueChange={(v) => updateScore('market', v[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="mb-2"
                        data-testid="slider-market"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Unproven</span>
                        <span>Weak</span>
                        <span>Adequate</span>
                        <span>Strong</span>
                        <span>Comprehensive</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                        <p className="text-2xl font-bold text-primary">{overallScore}/100</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Approval Probability</p>
                        <p className="text-2xl font-bold text-primary">{Math.round(approvalProbability)}%</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg col-span-2 md:col-span-1">
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <p className={`text-xl font-bold ${probabilityStatus.color}`}>{probabilityStatus.text}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="probability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Approval Probability Analysis</CardTitle>
                  <CardDescription>How your profile matches with different endorsing bodies based on their criteria weights and approval patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {endorserAnalysis.map((endorser, index) => (
                      <Card key={index} className={endorser.likely ? 'border-green-500' : 'border-orange-500'}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-1" data-testid={`text-endorser-name-${index}`}>{endorser.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">Focus: {endorser.focusArea}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-muted rounded">Processing: {endorser.processingTime}</span>
                                <span className="px-2 py-1 bg-muted rounded">Success Rate: {endorser.successRate}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary mb-1" data-testid={`text-endorser-probability-${index}`}>{endorser.probability}%</p>
                              <p className="text-sm text-muted-foreground">Approval Probability</p>
                            </div>
                          </div>

                          <Progress value={endorser.probability} className="mb-3" />

                          <div className="grid md:grid-cols-2 gap-3 mb-4">
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Your Weighted Score</p>
                              <p className="text-lg font-semibold" data-testid={`text-weighted-score-${index}`}>{endorser.weightedScore}/100</p>
                            </div>
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Their Approval Threshold</p>
                              <p className="text-lg font-semibold">{endorser.threshold}/100</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            {endorser.gap >= 0 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                            )}
                            <p className="text-sm">
                              {endorser.gap >= 0 
                                ? `Exceeds threshold by ${endorser.gap} points - ${endorser.probability >= 70 ? 'Strong match for application' : 'Likely approval'}`
                                : `Falls short by ${Math.abs(endorser.gap)} points - ${endorser.probability >= 50 ? 'Strengthen before submission' : 'Significant gaps exist'}`
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert className="mt-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                      <p className="font-semibold mb-1">Recommended Endorser: {endorserAnalysis[0].name}</p>
                      <p>Best match with {endorserAnalysis[0].probability}% approval probability. Their focus on {endorserAnalysis[0].focusArea} aligns well with your strength profile.</p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Comparison</CardTitle>
                  <CardDescription>Approval probability across all endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={endorserAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-20} textAnchor="end" height={100} />
                      <YAxis label={{ value: 'Approval Probability %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="probability" name="Approval Probability">
                        {endorserAnalysis.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.probability >= 70 ? '#10b981' : entry.probability >= 50 ? '#3b82f6' : '#f59e0b'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>Contextual guidance based on your assessment scores and gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertDescription className="text-sm" data-testid={`text-smart-tip-${index}`}>
                          <span className="font-semibold">Tip {index + 1}:</span> {tip}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {getSmartTips().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Complete your assessment to receive personalized recommendations
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Criteria Priority Matrix</CardTitle>
                  <CardDescription>Which criteria need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criteriaBreakdown
                      .sort((a, b) => a.score - b.score)
                      .map((criterion, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-32">
                            <p className="font-medium text-sm">{criterion.name}</p>
                            <p className="text-xs text-muted-foreground">{criterion.weight}% weight</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Progress value={criterion.score} className="flex-1" />
                              <span className="text-sm font-semibold min-w-[45px] text-right">{criterion.score}%</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 w-24 text-right">
                            {criterion.score >= 70 ? (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">Strong</span>
                            ) : criterion.score >= 60 ? (
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">Good</span>
                            ) : criterion.score >= 50 ? (
                              <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">Needs Work</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">Urgent</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    4-Week Intensive Action Plan
                  </CardTitle>
                  <CardDescription>Prioritized timeline to strengthen your application before submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={
                        item.priority === 'Critical' ? 'border-red-500' :
                        item.priority === 'High' ? 'border-orange-500' :
                        'border-blue-500'
                      }>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${
                                item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                                item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              }`} data-testid={`badge-priority-${index}`}>
                                {item.priority}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold mb-1" data-testid={`text-week-${index}`}>{item.week}</p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-action-${index}`}>{item.action}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {generateActionPlan().length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Complete your assessment to generate a personalized action plan
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps Summary</CardTitle>
                  <CardDescription>Immediate actions to improve your approval probability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overallScore < 60 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          URGENT: Overall score below minimum threshold. Address all criteria scoring below 60 before proceeding with endorser application.
                        </AlertDescription>
                      </Alert>
                    )}

                    {scores.evidence < 65 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          CRITICAL: Evidence quality is foundational. Build comprehensive documentation portfolio with third-party validation for all claims.
                        </AlertDescription>
                      </Alert>
                    )}

                    {endorserAnalysis[0].probability < 60 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          IMPORTANT: Even best-match endorser shows less than 60% probability. Consider delaying application until probability exceeds 65% after strengthening efforts.
                        </AlertDescription>
                      </Alert>
                    )}

                    {endorserAnalysis[0].probability >= 70 && (
                      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600 dark:text-green-400">
                          STRONG POSITION: Your profile shows excellent approval probability with {endorserAnalysis[0].name}. Focus on interview preparation and maintaining documentation quality.
                        </AlertDescription>
                      </Alert>
                    )}
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
