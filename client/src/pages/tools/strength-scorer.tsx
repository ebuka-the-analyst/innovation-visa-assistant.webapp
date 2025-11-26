import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Info, TrendingUp } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type StrengthScores = {
  innovation: number;
  viability: number;
  scalability: number;
  evidence: number;
  presentation: number;
};

type EndorserProfile = {
  name: string;
  approvalThreshold: number;
  innovationWeight: number;
  viabilityWeight: number;
  scalabilityWeight: number;
  evidenceWeight: number;
  presentationWeight: number;
};

const ENDORSERS: EndorserProfile[] = [
  {
    name: "Tech Nation",
    approvalThreshold: 75,
    innovationWeight: 0.35,
    viabilityWeight: 0.25,
    scalabilityWeight: 0.20,
    evidenceWeight: 0.15,
    presentationWeight: 0.05
  },
  {
    name: "Innovator International",
    approvalThreshold: 70,
    innovationWeight: 0.30,
    viabilityWeight: 0.30,
    scalabilityWeight: 0.20,
    evidenceWeight: 0.15,
    presentationWeight: 0.05
  },
  {
    name: "UK University Routes",
    approvalThreshold: 78,
    innovationWeight: 0.40,
    viabilityWeight: 0.20,
    scalabilityWeight: 0.15,
    evidenceWeight: 0.20,
    presentationWeight: 0.05
  },
  {
    name: "Envestors",
    approvalThreshold: 72,
    innovationWeight: 0.25,
    viabilityWeight: 0.35,
    scalabilityWeight: 0.25,
    evidenceWeight: 0.10,
    presentationWeight: 0.05
  },
];

export default function StrengthScorer() {
  const [scores, setScores] = useState<StrengthScores>({
    innovation: 50,
    viability: 50,
    scalability: 50,
    evidence: 50,
    presentation: 50
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const updateScore = (field: keyof StrengthScores, value: number) => {
    setScores(prev => ({ ...prev, [field]: value }));
  };

  const overallScore = Math.round(
    (scores.innovation * 0.30) +
    (scores.viability * 0.25) +
    (scores.scalability * 0.20) +
    (scores.evidence * 0.15) +
    (scores.presentation * 0.10)
  );

  const strongThreshold = 75;
  const passThreshold = 65;
  const isStrong = overallScore >= strongThreshold;
  const meetsMinimum = overallScore >= passThreshold;

  const radarData = [
    { area: 'Innovation', value: scores.innovation, fullMark: 100 },
    { area: 'Viability', value: scores.viability, fullMark: 100 },
    { area: 'Scalability', value: scores.scalability, fullMark: 100 },
    { area: 'Evidence', value: scores.evidence, fullMark: 100 },
    { area: 'Presentation', value: scores.presentation, fullMark: 100 },
  ];

  const requirementsData = [
    { criterion: 'Innovation', yourScore: scores.innovation, required: 65 },
    { criterion: 'Viability', yourScore: scores.viability, required: 65 },
    { criterion: 'Scalability', yourScore: scores.scalability, required: 65 },
    { criterion: 'Evidence', yourScore: scores.evidence, required: 60 },
    { criterion: 'Presentation', yourScore: scores.presentation, required: 55 },
  ];

  const endorserProbability = ENDORSERS.map(endorser => {
    const weightedScore = Math.round(
      (scores.innovation * endorser.innovationWeight) +
      (scores.viability * endorser.viabilityWeight) +
      (scores.scalability * endorser.scalabilityWeight) +
      (scores.evidence * endorser.evidenceWeight) +
      (scores.presentation * endorser.presentationWeight)
    );
    
    const probability = Math.min(100, Math.max(0, 
      ((weightedScore - endorser.approvalThreshold + 20) / 30) * 100
    ));

    return {
      name: endorser.name,
      weightedScore,
      threshold: endorser.approvalThreshold,
      probability: Math.round(probability),
      likely: weightedScore >= endorser.approvalThreshold
    };
  });

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
    const handoffKey = 'strength-scorer_handoff';
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
      const saved = localStorage.getItem('strength-scorer-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('strength-scorer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('strength-scorer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (scores.innovation < 65) {
      tips.push("Innovation Strength Critical Gap: Your innovation score is below endorser requirements. Strengthen with patent filings, technical specifications, and third-party expert validation. GOV.UK guidance requires demonstrable genuine innovation not available in UK market.");
    }
    if (scores.innovation >= 75) {
      tips.push("Exceptional Innovation Strength: Your innovation profile is strong. Ensure all IP documentation is comprehensive including patent applications, proprietary technology descriptions, and competitive differentiation analysis.");
    }
    if (scores.viability < 65) {
      tips.push("Viability Weakness Identified: Financial projections need strengthening. Endorsers require detailed 3-year cashflow models, verified funding sources with bank statements, realistic revenue assumptions based on market data, and credible path to profitability.");
    }
    if (scores.viability >= 75) {
      tips.push("Robust Viability Score: Financial model is strong. Ensure all assumptions are documented with market research, include sensitivity analysis, and have accountant certification for credibility with endorsing bodies.");
    }
    if (scores.scalability < 65) {
      tips.push("Scalability Gap Detected: Growth plan requires enhancement. Include specific job creation targets (minimum 2 FTE by Year 3), geographic expansion roadmap, technology infrastructure scaling strategy, and evidence of market demand supporting growth assumptions.");
    }
    if (scores.scalability >= 75) {
      tips.push("Strong Scalability Plan: Growth strategy well-developed. Highlight international expansion potential, technology leverage for non-linear scaling, and partnership strategies that enable rapid market penetration without proportional cost increases.");
    }
    if (scores.evidence < 60) {
      tips.push("Evidence Quality Below Standard: Documentation is your application foundation. Each claim requires independent verification - customer contracts, letters of intent, market research reports, expert testimonials, financial statements, and technical validation from credible third parties.");
    }
    if (scores.evidence >= 75) {
      tips.push("Exemplary Evidence Portfolio: Documentation quality is excellent. Organize evidence by criterion (Innovation, Viability, Scalability) with clear index, ensure all documents are recent (within 6 months), and include executive summary explaining how each piece supports endorsement criteria.");
    }
    if (scores.presentation < 55) {
      tips.push("Presentation Quality Needs Improvement: Professional presentation significantly impacts endorser perception. Use consistent formatting, clear section headers, executive summaries, visual data representation (charts/graphs), proper grammar, and logical flow that makes complex information accessible.");
    }
    if (overallScore < passThreshold) {
      tips.push("Overall Application Strength Below Threshold: Your weighted score of " + overallScore + "% is below minimum acceptance range. Focus urgently on weakest criteria - most rejections occur when single criterion scores below 50% even if overall average appears acceptable. Prioritize evidence gathering and financial model strengthening.");
    }
    if (isStrong) {
      tips.push("Outstanding Application Strength: Your profile exceeds endorser requirements. Focus final preparation on interview readiness - practice defending each criterion with specific evidence, prepare for technical deep-dives, and ensure you can articulate your innovation clearly to non-technical assessors.");
    }
    if (Math.abs(scores.innovation - scores.viability) > 30 || Math.abs(scores.viability - scores.scalability) > 30) {
      tips.push("Imbalanced Strength Profile: Large disparities between criteria raise red flags for endorsers who prefer well-rounded businesses. A 70-40-70 profile is weaker than 65-65-65. Address your weakest area urgently before submission - imbalance suggests fundamental business gaps.");
    }
    if (scores.evidence < scores.innovation - 15) {
      tips.push("Evidence-Claims Gap Warning: Your innovation claims outpace supporting evidence by " + Math.abs(scores.evidence - scores.innovation) + " points. This is a critical weakness - endorsers will not accept strong claims without proportional verification. Prioritize gathering independent validation immediately.");
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Conduct comprehensive self-assessment across all five strength areas using official GOV.UK Innovator Founder criteria as benchmark",
      priority: "Critical"
    });
    
    if (scores.innovation < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Strengthen innovation documentation - file provisional patents, create detailed technical specifications, obtain expert validation letters from industry authorities",
        priority: "Critical"
      });
    }
    
    if (scores.viability < 70) {
      actions.push({
        week: "Week 2",
        action: "Enhance financial model - create detailed 36-month cashflow projections, obtain accountant certification, gather market size validation from credible research firms",
        priority: "Critical"
      });
    }
    
    if (scores.scalability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Develop comprehensive scaling strategy - specific hiring plan with roles and timelines, technology infrastructure roadmap, geographic expansion targets with market entry strategies",
        priority: "High"
      });
    }
    
    if (scores.evidence < 65) {
      actions.push({
        week: "Week 1-3",
        action: "Build evidence portfolio - customer letters of intent, market research reports, financial verification documents, IP filings, team credentials, third-party technical validation",
        priority: "Critical"
      });
    }
    
    if (scores.presentation < 60) {
      actions.push({
        week: "Week 3",
        action: "Professional document preparation - engage technical writer for business plan, create visual data representations, ensure consistent formatting, develop executive summary",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3-4",
      action: "Organize complete application package by criterion with clear evidence mapping - Innovation proofs, Viability documentation, Scalability roadmaps, all cross-referenced",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Interview preparation - practice defending each criterion with specific evidence, prepare technical explanations for non-technical audience, rehearse common endorser questions",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Final quality review - have external reviewer assess application strength, verify all documentation is current and properly verified, ensure no gaps in evidence chain",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor endorsing body requirements - criteria emphasis varies (Tech Nation weights innovation 40%, Envestors weights viability 35%), select best-fit endorser for your profile",
      priority: "Medium"
    });
    
    return actions.slice(0, 10);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - APPLICATION STRENGTH SCORER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL APPLICATION STRENGTH ASSESSMENT
${'-'.repeat(80)}
Overall Strength Score: ${overallScore}/100
Status: ${isStrong ? 'STRONG CANDIDATE' : meetsMinimum ? 'MEETS MINIMUM THRESHOLD' : 'BELOW ACCEPTANCE RANGE'}
Pass Threshold: ${passThreshold}/100
Strong Candidate Threshold: ${strongThreshold}/100

WEIGHTED SCORING MODEL
${'-'.repeat(80)}
Innovation Strength:    30% weight × ${scores.innovation}/100 = ${Math.round(scores.innovation * 0.30)}/30
Viability Strength:     25% weight × ${scores.viability}/100 = ${Math.round(scores.viability * 0.25)}/25
Scalability Strength:   20% weight × ${scores.scalability}/100 = ${Math.round(scores.scalability * 0.20)}/20
Evidence Quality:       15% weight × ${scores.evidence}/100 = ${Math.round(scores.evidence * 0.15)}/15
Presentation Quality:   10% weight × ${scores.presentation}/100 = ${Math.round(scores.presentation * 0.10)}/10
                                                Total: ${overallScore}/100

DETAILED STRENGTH BREAKDOWN
${'-'.repeat(80)}

1. INNOVATION STRENGTH: ${scores.innovation}/100
   ${scores.innovation >= 65 ? '[MEETS REQUIREMENT]' : '[NEEDS IMPROVEMENT]'}
   
   Measures: Genuine novelty, IP protection, market differentiation, technical advancement
   
   Key Evidence Required:
   - Patent applications or provisional patents filed
   - Technical specifications demonstrating innovation
   - Expert validation from industry authorities
   - Competitive analysis proving differentiation
   - Technology architecture documentation
   
   Current Assessment:
   ${scores.innovation >= 75 ? 'Exceptional - innovation clearly demonstrated with strong IP protection' :
     scores.innovation >= 65 ? 'Adequate - meets minimum requirements but could strengthen IP documentation' :
     'Insufficient - requires urgent strengthening of innovation claims and IP protection'}

2. VIABILITY STRENGTH: ${scores.viability}/100
   ${scores.viability >= 65 ? '[MEETS REQUIREMENT]' : '[NEEDS IMPROVEMENT]'}
   
   Measures: Financial sustainability, market demand, revenue model, team capability
   
   Key Evidence Required:
   - Detailed 36-month financial projections
   - Verified investment funds appropriate for plan
   - Market size validation (TAM/SAM/SOM)
   - Customer letters of intent or contracts
   - Team credentials and relevant experience
   
   Current Assessment:
   ${scores.viability >= 75 ? 'Strong - financial model credible with verified funding sources' :
     scores.viability >= 65 ? 'Acceptable - meets baseline but requires stronger market validation' :
     'Weak - critical gaps in financial projections or funding verification'}

3. SCALABILITY STRENGTH: ${scores.scalability}/100
   ${scores.scalability >= 65 ? '[MEETS REQUIREMENT]' : '[NEEDS IMPROVEMENT]'}
   
   Measures: Growth potential, job creation, geographic expansion, technology leverage
   
   Key Evidence Required:
   - Hiring plan with minimum 2 FTE by Year 3
   - Geographic expansion strategy
   - Technology infrastructure scaling roadmap
   - Partnership agreements supporting growth
   - Market demand evidence for scaling assumptions
   
   Current Assessment:
   ${scores.scalability >= 75 ? 'Excellent - clear scaling path with realistic job creation targets' :
     scores.scalability >= 65 ? 'Sufficient - basic scaling plan in place, enhance with specific milestones' :
     'Inadequate - scaling strategy lacks detail or credibility'}

4. EVIDENCE QUALITY: ${scores.evidence}/100
   ${scores.evidence >= 60 ? '[MEETS REQUIREMENT]' : '[NEEDS IMPROVEMENT]'}
   
   Measures: Documentation completeness, third-party validation, recency, verifiability
   
   Key Documentation Required:
   - All claims supported by independent verification
   - Recent documents (within 6 months preferred)
   - Bank statements for funding sources
   - Letters of intent from customers
   - Market research from credible sources
   - Expert endorsements and testimonials
   
   Current Assessment:
   ${scores.evidence >= 75 ? 'Outstanding - comprehensive evidence portfolio with strong third-party validation' :
     scores.evidence >= 60 ? 'Adequate - core documentation present, could strengthen with additional validation' :
     'Insufficient - critical evidence gaps that will undermine application credibility'}

5. PRESENTATION QUALITY: ${scores.presentation}/100
   ${scores.presentation >= 55 ? '[MEETS REQUIREMENT]' : '[NEEDS IMPROVEMENT]'}
   
   Measures: Professional formatting, clarity, logical structure, visual communication
   
   Quality Standards:
   - Consistent formatting and typography
   - Clear section organization with headers
   - Executive summaries for complex sections
   - Visual data representation (charts, graphs)
   - Proper grammar and professional language
   - Logical flow making information accessible
   
   Current Assessment:
   ${scores.presentation >= 70 ? 'Professional - polished presentation enhances application credibility' :
     scores.presentation >= 55 ? 'Acceptable - meets minimum standards, minor improvements beneficial' :
     'Poor - presentation quality detracts from content, requires professional editing'}

ENDORSER APPROVAL PROBABILITY ANALYSIS
${'-'.repeat(80)}
${endorserProbability.map(e => `
${e.name}:
  Weighted Score: ${e.weightedScore}/100
  Approval Threshold: ${e.threshold}/100
  Approval Probability: ${e.probability}%
  Assessment: ${e.likely ? 'LIKELY APPROVAL' : 'UNLIKELY - STRENGTHEN APPLICATION'}
  Gap Analysis: ${e.weightedScore >= e.threshold ? 
    `Exceeds threshold by ${e.weightedScore - e.threshold} points` : 
    `Falls short by ${e.threshold - e.weightedScore} points - focus on strengthening weak areas`}
`).join('')}

ENDORSER SELECTION RECOMMENDATION
${'-'.repeat(80)}
Best Match Endorser: ${endorserProbability.reduce((best, current) => 
  current.probability > best.probability ? current : best
).name}

Reasoning:
${endorserProbability.sort((a, b) => b.probability - a.probability).map((e, i) => 
  `${i + 1}. ${e.name} (${e.probability}% probability) - ${
    e.probability >= 70 ? 'Strong match - proceed with application' :
    e.probability >= 50 ? 'Moderate match - strengthen application before submission' :
    'Poor match - significant gaps, consider different endorser or strengthen profile'
  }`
).join('\n')}

CRITICAL SUCCESS FACTORS
${'-'.repeat(80)}
${scores.innovation >= 65 ? '[PASS]' : '[FAIL]'} Innovation demonstrates genuine novelty unavailable in UK market
${scores.viability >= 65 ? '[PASS]' : '[FAIL]'} Business model financially viable with credible projections
${scores.scalability >= 65 ? '[PASS]' : '[FAIL]'} Clear potential for job creation and growth
${scores.evidence >= 60 ? '[PASS]' : '[FAIL]'} All claims supported by independent verification
${scores.presentation >= 55 ? '[PASS]' : '[FAIL]'} Professional presentation quality
${overallScore >= passThreshold ? '[PASS]' : '[FAIL]'} Overall weighted score meets endorser minimum

SMART RECOMMENDATIONS (Prioritized)
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK INTENSIVE ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

STRENGTH BALANCING ANALYSIS
${'-'.repeat(80)}
Profile Balance Score: ${100 - Math.max(
  Math.abs(scores.innovation - scores.viability),
  Math.abs(scores.viability - scores.scalability),
  Math.abs(scores.scalability - scores.evidence)
)}%

${Math.max(
  Math.abs(scores.innovation - scores.viability),
  Math.abs(scores.viability - scores.scalability),
  Math.abs(scores.scalability - scores.evidence)
) > 30 ? 
`WARNING: Significant imbalance detected. Endorsers prefer well-rounded profiles.
Your current gaps:
- Innovation vs Viability: ${Math.abs(scores.innovation - scores.viability)} point difference
- Viability vs Scalability: ${Math.abs(scores.viability - scores.scalability)} point difference
- Scalability vs Evidence: ${Math.abs(scores.scalability - scores.evidence)} point difference

Recommendation: Address weakest area urgently. A balanced 65-65-65 profile is stronger
than an imbalanced 80-50-70 profile as imbalance suggests fundamental business gaps.`
:
`Profile shows good balance across criteria. This demonstrates well-rounded business
planning and increases endorser confidence in overall application quality.`}

NEXT STEPS
${'-'.repeat(80)}
1. Review each strength area scoring below 65 as URGENT priority
2. Gather missing evidence for weak areas using action plan timeline
3. Consider engaging specialist advisor for weakest criterion
4. Select endorsing body best matched to your strength profile
5. Prepare for technical interview focusing on defending weak areas
6. Ensure all documentation is recent, verified, and professionally presented
7. Maintain evidence of continuous business development throughout process

IMPORTANT REMINDERS
${'-'.repeat(80)}
- Single criterion scoring below 50% often results in rejection regardless of overall score
- Evidence quality directly impacts credibility of all other strength claims
- Endorsers conduct detailed technical interviews - be prepared to defend every score
- Most successful applications score 70+ across all criteria with balanced profiles
- Application process typically takes 3-6 months - maintain business momentum throughout
- Scores are self-assessed - endorsers may evaluate differently with more stringent criteria

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
Based on GOV.UK guidance and endorsing body requirements (2025)

This assessment provides guidance only. Consult qualified immigration advisor for
application-specific advice. Endorser criteria and requirements may change.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strength-scorer-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-strength-scorer">Application Strength Scorer</h1>
            <p className="text-lg text-muted-foreground">Comprehensive assessment of visa application readiness across five critical strength areas</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="strength-scorer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Strength Scorer"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-strength-scorer">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="probability" data-testid="tab-probability">Probability</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Application Strength</CardTitle>
                  <CardDescription>Weighted composite score across all five strength areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={isStrong ? "border-green-500" : meetsMinimum ? "border-blue-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Strength</p>
                          <p className="text-4xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {isStrong ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : meetsMinimum ? (
                              <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm font-medium">
                              {isStrong ? 'Strong Candidate' : meetsMinimum ? 'Meets Threshold' : 'Below Threshold'}
                            </span>
                          </div>
                          <Progress value={overallScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Pass Threshold</p>
                          <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{passThreshold}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm">Minimum Required</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Strong Threshold</p>
                          <p className="text-4xl font-bold text-green-600 dark:text-green-400">{strongThreshold}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-sm">Competitive Target</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your overall strength score of {overallScore}% is below the minimum threshold of {passThreshold}%. Focus urgently on strengthening your weakest areas to improve endorsement prospects.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !isStrong && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum threshold, but scores above {strongThreshold}% significantly improve approval chances. Consider strengthening all areas before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isStrong && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your application strength indicates a competitive profile. Focus on maintaining evidence quality and interview preparation.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Five-Dimension Strength Radar</CardTitle>
                  <CardDescription>Visual assessment of your application strength profile balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="area" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar name="Your Strengths" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Pass Threshold" dataKey={() => 65} stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Readiness vs Requirements</CardTitle>
                  <CardDescription>Your scores compared to minimum endorser requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={requirementsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="criterion" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yourScore" fill="#3b82f6" name="Your Score" />
                      <Bar dataKey="required" fill="#10b981" name="Required Minimum" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Strength Assessment</CardTitle>
                  <CardDescription>Rate each area from 0 (weakest) to 100 (strongest)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="innovation-slider" className="text-base font-semibold">
                          Innovation Strength (30% weight)
                        </Label>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-innovation-score">
                          {scores.innovation}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Genuine novelty, IP protection, market differentiation, technical advancement
                      </p>
                      <Slider
                        id="innovation-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[scores.innovation]}
                        onValueChange={(v) => updateScore('innovation', v[0])}
                        data-testid="slider-innovation"
                      />
                      <Progress value={scores.innovation} className="h-2" />
                      {scores.innovation < 65 && (
                        <p className="text-sm text-destructive">Below minimum requirement - strengthen IP and innovation documentation</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="viability-slider" className="text-base font-semibold">
                          Viability Strength (25% weight)
                        </Label>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-viability-score">
                          {scores.viability}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Financial sustainability, market demand, revenue model, team capability
                      </p>
                      <Slider
                        id="viability-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[scores.viability]}
                        onValueChange={(v) => updateScore('viability', v[0])}
                        data-testid="slider-viability"
                      />
                      <Progress value={scores.viability} className="h-2" />
                      {scores.viability < 65 && (
                        <p className="text-sm text-destructive">Below minimum requirement - strengthen financial projections and funding verification</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="scalability-slider" className="text-base font-semibold">
                          Scalability Strength (20% weight)
                        </Label>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-scalability-score">
                          {scores.scalability}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Growth potential, job creation, geographic expansion, technology leverage
                      </p>
                      <Slider
                        id="scalability-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[scores.scalability]}
                        onValueChange={(v) => updateScore('scalability', v[0])}
                        data-testid="slider-scalability"
                      />
                      <Progress value={scores.scalability} className="h-2" />
                      {scores.scalability < 65 && (
                        <p className="text-sm text-destructive">Below minimum requirement - enhance growth plan and job creation targets</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="evidence-slider" className="text-base font-semibold">
                          Evidence Quality (15% weight)
                        </Label>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-evidence-score">
                          {scores.evidence}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Documentation completeness, third-party validation, recency, verifiability
                      </p>
                      <Slider
                        id="evidence-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[scores.evidence]}
                        onValueChange={(v) => updateScore('evidence', v[0])}
                        data-testid="slider-evidence"
                      />
                      <Progress value={scores.evidence} className="h-2" />
                      {scores.evidence < 60 && (
                        <p className="text-sm text-destructive">Below minimum requirement - gather independent verification for all claims</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="presentation-slider" className="text-base font-semibold">
                          Presentation Quality (10% weight)
                        </Label>
                        <span className="text-2xl font-bold text-pink-600 dark:text-pink-400" data-testid="text-presentation-score">
                          {scores.presentation}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional formatting, clarity, logical structure, visual communication
                      </p>
                      <Slider
                        id="presentation-slider"
                        min={0}
                        max={100}
                        step={5}
                        value={[scores.presentation]}
                        onValueChange={(v) => updateScore('presentation', v[0])}
                        data-testid="slider-presentation"
                      />
                      <Progress value={scores.presentation} className="h-2" />
                      {scores.presentation < 55 && (
                        <p className="text-sm text-destructive">Below minimum requirement - improve professional presentation and formatting</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scoring Guidelines</CardTitle>
                  <CardDescription>How to accurately assess each strength area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Innovation Strength (0-100)</h4>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>0-25: Basic business idea with no IP protection or clear differentiation</li>
                        <li>26-50: Some novelty but limited IP, common in market, incremental improvement</li>
                        <li>51-65: Genuine innovation with provisional patents, clear differentiation, technical merit</li>
                        <li>66-85: Strong IP portfolio, significant technical advancement, expert validation</li>
                        <li>86-100: Breakthrough innovation, multiple patents, industry recognition, unique technology</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Viability Strength (0-100)</h4>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>0-25: Concept stage with no revenue model or funding sources</li>
                        <li>26-50: Basic financial model but unrealistic projections or unverified funding</li>
                        <li>51-65: Credible 3-year projections, £50k+ verified funding, some customer validation</li>
                        <li>66-85: Strong financials with accountant certification, active customers, proven team</li>
                        <li>86-100: Revenue generating, multiple funding sources, strong market traction</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Scalability Strength (0-100)</h4>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>0-25: No clear growth plan or job creation strategy</li>
                        <li>26-50: Basic growth ideas but limited infrastructure or market evidence</li>
                        <li>51-65: Detailed hiring plan (2+ FTE Year 3), geographic strategy, technology leverage</li>
                        <li>66-85: Strong scaling roadmap with partnerships, international expansion plan</li>
                        <li>86-100: Proven scalability with existing multi-market presence and rapid growth trajectory</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Evidence Quality (0-100)</h4>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>0-25: Minimal documentation, mostly self-generated claims without verification</li>
                        <li>26-50: Some evidence but gaps in verification or outdated documents</li>
                        <li>51-65: Core evidence present with third-party validation, recent bank statements</li>
                        <li>66-85: Comprehensive portfolio with customer contracts, expert endorsements, research reports</li>
                        <li>86-100: Exceptional documentation with independent verification for every claim, professionally organized</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Presentation Quality (0-100)</h4>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>0-25: Poor formatting, grammar errors, disorganized, difficult to follow</li>
                        <li>26-50: Basic presentation but inconsistent formatting or unclear structure</li>
                        <li>51-65: Professional appearance with consistent formatting, clear sections, good grammar</li>
                        <li>66-85: Polished document with executive summaries, visual data, logical flow</li>
                        <li>86-100: Exceptional professional quality with data visualization, clear narrative, compelling presentation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="probability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endorser Approval Probability</CardTitle>
                  <CardDescription>Likelihood of approval by each endorsing body based on your strength profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endorserProbability.map((endorser, index) => (
                    <Card key={index} className={endorser.likely ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{endorser.name}</h3>
                            <div className="flex items-center gap-2">
                              {endorser.likely ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                              )}
                              <span className={`text-2xl font-bold ${endorser.likely ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {endorser.probability}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Your Weighted Score</p>
                              <p className="text-xl font-semibold">{endorser.weightedScore}/100</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Required Threshold</p>
                              <p className="text-xl font-semibold">{endorser.threshold}/100</p>
                            </div>
                          </div>

                          <Progress value={endorser.probability} className="h-3" />
                          
                          <p className="text-sm">
                            {endorser.weightedScore >= endorser.threshold ? (
                              <span className="text-green-600 dark:text-green-400">
                                Your profile exceeds this endorser's threshold by {endorser.weightedScore - endorser.threshold} points. Strong likelihood of approval if evidence supports claims.
                              </span>
                            ) : (
                              <span className="text-orange-600 dark:text-orange-400">
                                Your profile falls {endorser.threshold - endorser.weightedScore} points short of this endorser's threshold. Strengthen application before submission.
                              </span>
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Weighting Comparison</CardTitle>
                  <CardDescription>How each endorsing body weights the five strength criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ENDORSERS.map((endorser, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-semibold">{endorser.name}</h4>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div className="text-center">
                            <p className="text-muted-foreground mb-1">Innovation</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">{(endorser.innovationWeight * 100).toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground mb-1">Viability</p>
                            <p className="font-bold text-green-600 dark:text-green-400">{(endorser.viabilityWeight * 100).toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground mb-1">Scalability</p>
                            <p className="font-bold text-purple-600 dark:text-purple-400">{(endorser.scalabilityWeight * 100).toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground mb-1">Evidence</p>
                            <p className="font-bold text-orange-600 dark:text-orange-400">{(endorser.evidenceWeight * 100).toFixed(0)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground mb-1">Presentation</p>
                            <p className="font-bold text-pink-600 dark:text-pink-400">{(endorser.presentationWeight * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Endorser Selection</CardTitle>
                  <CardDescription>Recommendations based on your strength profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-600 dark:text-blue-400">
                        <strong>Best Match:</strong> {endorserProbability.reduce((best, current) => 
                          current.probability > best.probability ? current : best
                        ).name} ({endorserProbability.reduce((best, current) => 
                          current.probability > best.probability ? current : best
                        ).probability}% approval probability)
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2 text-sm">
                      <h4 className="font-semibold">Selection Strategy:</h4>
                      <ul className="space-y-2 ml-4 text-muted-foreground">
                        <li>Choose endorser whose weighting aligns with your strongest areas</li>
                        <li>If innovation is your strength, prioritize UK University Routes (40% weight) or Tech Nation (35% weight)</li>
                        <li>If viability is strongest, consider Envestors (35% weight) or Innovator International (30% weight)</li>
                        <li>Ensure your weighted score exceeds endorser's threshold by minimum 5-10 points for safety margin</li>
                        <li>Consider endorser interview style and technical requirements - some conduct more rigorous technical interviews</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered analysis of your strength profile with prioritized improvement actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription className="ml-2" data-testid={`tip-${index}`}>
                          <strong>Tip {index + 1}:</strong> {tip}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Strength Gaps</CardTitle>
                  <CardDescription>Frequent weaknesses in visa applications and how to address them</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Innovation Gap: Weak IP Protection</h4>
                      <p className="text-muted-foreground mb-2">
                        Many applicants claim innovation but lack proper IP documentation. File provisional patents immediately, document proprietary methodologies, and obtain expert validation letters.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Viability Gap: Unrealistic Financial Projections</h4>
                      <p className="text-muted-foreground mb-2">
                        Overly optimistic revenue projections without market validation raise red flags. Base assumptions on market research, include conservative scenarios, and have accountant certification.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Scalability Gap: Vague Growth Plans</h4>
                      <p className="text-muted-foreground mb-2">
                        Generic scaling statements without specific milestones are insufficient. Include exact hiring timelines, technology infrastructure details, and geographic expansion specifics with market entry dates.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Evidence Gap: Self-Generated Claims</h4>
                      <p className="text-muted-foreground mb-2">
                        All claims require independent third-party verification. Customer letters, expert testimonials, market research reports, and financial statements from regulated institutions are essential.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Presentation Gap: Poor Document Quality</h4>
                      <p className="text-muted-foreground mb-2">
                        Inconsistent formatting and unclear structure undermine credibility. Use professional templates, create executive summaries, visualize data with charts, and ensure consistent typography throughout.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Intensive Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for strengthening your application across all five areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`px-3 py-1 rounded-md text-xs font-semibold ${
                            item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`action-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Gathering Checklist</CardTitle>
                  <CardDescription>Comprehensive documentation requirements by strength area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Innovation Strength Evidence</h4>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>Patent applications or provisional patents (with filing receipts)</li>
                        <li>Technical specifications and architecture diagrams</li>
                        <li>Third-party expert validation letters from industry authorities</li>
                        <li>Competitive analysis demonstrating clear differentiation</li>
                        <li>IP strategy document outlining protection roadmap</li>
                        <li>Technology demonstration or prototype evidence</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Viability Strength Evidence</h4>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>Detailed 36-month financial projections (certified by accountant)</li>
                        <li>Bank statements verifying investment funds appropriate for plan</li>
                        <li>Market research reports with TAM/SAM/SOM analysis</li>
                        <li>Customer letters of intent or signed contracts</li>
                        <li>Team CVs highlighting relevant industry experience</li>
                        <li>Revenue evidence if already trading (invoices, bank statements)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Scalability Strength Evidence</h4>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>Detailed hiring plan with specific roles and timelines (minimum 2 FTE Year 3)</li>
                        <li>Technology infrastructure scaling roadmap</li>
                        <li>Geographic expansion strategy with target markets</li>
                        <li>Partnership agreements supporting growth objectives</li>
                        <li>Market demand evidence for scaling assumptions</li>
                        <li>Capital efficiency metrics and unit economics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Evidence Quality Standards</h4>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>All documents recent (within 6 months preferred)</li>
                        <li>Third-party verification for all major claims</li>
                        <li>Documents from regulated institutions or credible sources</li>
                        <li>Clear provenance and authenticity for all evidence</li>
                        <li>Organized portfolio with clear indexing by criterion</li>
                        <li>Executive summary explaining evidence relevance</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Presentation Quality Requirements</h4>
                      <ul className="space-y-1 ml-4 text-muted-foreground">
                        <li>Consistent formatting and typography throughout</li>
                        <li>Clear section organization with descriptive headers</li>
                        <li>Executive summaries for complex sections</li>
                        <li>Visual data representation (charts, graphs, infographics)</li>
                        <li>Professional language with proper grammar</li>
                        <li>Logical flow making technical information accessible</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Success Factors</CardTitle>
                  <CardDescription>Essential requirements for successful endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {scores.innovation >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Innovation demonstrates genuine novelty not available in UK market</p>
                        <p className="text-sm text-muted-foreground">Current score: {scores.innovation}/100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {scores.viability >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Business model financially viable with credible projections</p>
                        <p className="text-sm text-muted-foreground">Current score: {scores.viability}/100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {scores.scalability >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Clear potential for job creation and market expansion</p>
                        <p className="text-sm text-muted-foreground">Current score: {scores.scalability}/100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {scores.evidence >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">All claims supported by independent third-party verification</p>
                        <p className="text-sm text-muted-foreground">Current score: {scores.evidence}/100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {scores.presentation >= 55 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Professional presentation quality throughout application</p>
                        <p className="text-sm text-muted-foreground">Current score: {scores.presentation}/100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {overallScore >= passThreshold ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Overall weighted score meets endorser minimum threshold</p>
                        <p className="text-sm text-muted-foreground">Current score: {overallScore}/100 (Required: {passThreshold}/100)</p>
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
