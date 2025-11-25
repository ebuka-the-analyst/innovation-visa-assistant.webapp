import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type CriteriaScores = {
  innovation: number;
  viability: number;
  scalability: number;
};

type SubCriteria = {
  novelty: number;
  ipStrength: number;
  differentiation: number;
  marketSize: number;
  revenue: number;
  teamExperience: number;
  growthPotential: number;
  jobCreation: number;
  internationalReach: number;
};

type EndorserProfile = {
  name: string;
  innovationWeight: number;
  viabilityWeight: number;
  scalabilityWeight: number;
  minScore: number;
};

const ENDORSERS: EndorserProfile[] = [
  { name: "Tech Nation", innovationWeight: 0.4, viabilityWeight: 0.35, scalabilityWeight: 0.25, minScore: 70 },
  { name: "Innovator International", innovationWeight: 0.35, viabilityWeight: 0.4, scalabilityWeight: 0.25, minScore: 65 },
  { name: "UK University Routes", innovationWeight: 0.5, viabilityWeight: 0.25, scalabilityWeight: 0.25, minScore: 75 },
  { name: "Envestors", innovationWeight: 0.3, viabilityWeight: 0.35, scalabilityWeight: 0.35, minScore: 68 },
];

export default function CriteriaScorer() {
  const [scores, setScores] = useState<CriteriaScores>({
    innovation: 50,
    viability: 50,
    scalability: 50
  });

  const [subCriteria, setSubCriteria] = useState<SubCriteria>({
    novelty: 50,
    ipStrength: 50,
    differentiation: 50,
    marketSize: 50,
    revenue: 50,
    teamExperience: 50,
    growthPotential: 50,
    jobCreation: 50,
    internationalReach: 50
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const updateScore = (criterion: keyof CriteriaScores, value: number) => {
    setScores(prev => ({ ...prev, [criterion]: value }));
  };

  const updateSubCriteria = (field: keyof SubCriteria, value: number) => {
    setSubCriteria(prev => ({ ...prev, [field]: value }));
    
    if (['novelty', 'ipStrength', 'differentiation'].includes(field)) {
      const innovationScore = Math.round((subCriteria.novelty + subCriteria.ipStrength + subCriteria.differentiation + (field === 'novelty' ? value : subCriteria.novelty)) / 3);
      updateScore('innovation', innovationScore);
    } else if (['marketSize', 'revenue', 'teamExperience'].includes(field)) {
      const viabilityScore = Math.round((subCriteria.marketSize + subCriteria.revenue + subCriteria.teamExperience + (field === 'marketSize' ? value : subCriteria.marketSize)) / 3);
      updateScore('viability', viabilityScore);
    } else if (['growthPotential', 'jobCreation', 'internationalReach'].includes(field)) {
      const scalabilityScore = Math.round((subCriteria.growthPotential + subCriteria.jobCreation + subCriteria.internationalReach + (field === 'growthPotential' ? value : subCriteria.growthPotential)) / 3);
      updateScore('scalability', scalabilityScore);
    }
  };

  const overallScore = Math.round((scores.innovation + scores.viability + scores.scalability) / 3);
  const passThreshold = 65;
  const strongThreshold = 75;
  const meetsMinimum = overallScore >= passThreshold;
  const isStrongCandidate = overallScore >= strongThreshold;

  const radarData = [
    { criteria: 'Innovation', value: scores.innovation, fullMark: 100 },
    { criteria: 'Viability', value: scores.viability, fullMark: 100 },
    { criteria: 'Scalability', value: scores.scalability, fullMark: 100 },
  ];

  const endorserComparison = ENDORSERS.map(endorser => {
    const weightedScore = Math.round(
      (scores.innovation * endorser.innovationWeight) +
      (scores.viability * endorser.viabilityWeight) +
      (scores.scalability * endorser.scalabilityWeight)
    );
    return {
      name: endorser.name,
      yourScore: weightedScore,
      required: endorser.minScore,
      meets: weightedScore >= endorser.minScore
    };
  });

  const getSerializedState = () => {
    return {
      scores,
      subCriteria,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('scores' in state) setScores(state.scores);
    if ('subCriteria' in state) setSubCriteria(state.subCriteria);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'criteria-scorer_handoff';
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
      const saved = localStorage.getItem('criteria-scorer-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('criteria-scorer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('criteria-scorer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (scores.innovation < 65) {
      tips.push("Innovation Score Below Target: Strengthen your IP strategy with patent applications or trade secret documentation. GOV.UK guidance emphasizes 'genuine innovation' not available in the UK market.");
    }
    if (scores.innovation >= 75) {
      tips.push("Strong Innovation Profile: Document your innovation thoroughly with technical specifications, IP filings, and third-party validation from industry experts.");
    }
    if (scores.viability < 65) {
      tips.push("Viability Concerns: Your financial projections need strengthening. Endorsing bodies require detailed 3-year cashflow, verified funding sources, and realistic revenue assumptions based on market data.");
    }
    if (scores.viability >= 75) {
      tips.push("Solid Viability Score: Ensure all funding sources are documented with bank statements. Include letters of intent from potential customers to demonstrate market demand.");
    }
    if (scores.scalability < 65) {
      tips.push("Scalability Gap: Your growth plan should include specific job creation targets (minimum 2 FTE equivalents by Year 3), geographic expansion strategy, and infrastructure scaling roadmap.");
    }
    if (scores.scalability >= 75) {
      tips.push("Excellent Scalability Plan: Highlight your international expansion strategy and technology infrastructure that supports rapid scaling without proportional cost increases.");
    }
    if (overallScore < passThreshold) {
      tips.push("Overall Score Below Pass Threshold: Focus on your weakest criterion first. Most rejections occur when one criterion scores below 50% even if overall average is acceptable.");
    }
    if (overallScore >= strongThreshold) {
      tips.push("Strong Overall Profile: You meet or exceed requirements for most endorsing bodies. Prepare for detailed technical interviews and ensure your evidence documentation is comprehensive.");
    }
    if (Math.abs(scores.innovation - scores.viability) > 30) {
      tips.push("Imbalanced Profile: Large gaps between criteria scores can raise concerns. Endorsers prefer well-rounded businesses. Address your weakest area urgently.");
    }
    if (subCriteria.ipStrength < 50) {
      tips.push("IP Weakness Critical: Without strong IP protection (patents pending, trade secrets, proprietary technology), innovation claims are difficult to substantiate. File provisional patents immediately.");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Complete comprehensive self-assessment across all three criteria using GOV.UK Innovator Founder guidance document",
      priority: "Critical"
    });
    
    if (scores.innovation < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Conduct IP audit - identify patentable innovations, file provisional patents, document proprietary methodologies",
        priority: "Critical"
      });
    }
    
    if (scores.viability < 70) {
      actions.push({
        week: "Week 2",
        action: "Strengthen financial model - obtain accountant certification, verify all funding sources with bank statements, create detailed 36-month cashflow",
        priority: "Critical"
      });
    }
    
    if (scores.scalability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Develop detailed scaling plan - hiring roadmap with specific roles, technology infrastructure diagram, geographic expansion timeline",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3",
      action: "Gather third-party validation - customer letters of intent, industry expert endorsements, market research reports",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3-4",
      action: "Prepare evidence portfolio organized by criterion - innovation proofs, viability documentation, scalability roadmaps",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Practice technical interview responses - prepare to defend scoring across all criteria with specific evidence and data",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor endorsing body-specific requirements - Tech Nation vs Innovator International have different emphasis weightings",
      priority: "Medium"
    });
    
    return actions.slice(0, 8);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - CRITERIA SCORING ASSESSMENT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OVERALL ASSESSMENT
${'-'.repeat(80)}
Overall Score: ${overallScore}/100
Status: ${meetsMinimum ? (isStrongCandidate ? 'STRONG CANDIDATE' : 'MEETS MINIMUM') : 'BELOW THRESHOLD'}
Pass Threshold: ${passThreshold}/100
Strong Candidate Threshold: ${strongThreshold}/100

CORE CRITERIA SCORES (GOV.UK 2025 Requirements)
${'-'.repeat(80)}
1. INNOVATION: ${scores.innovation}/100
   - Novelty of Business Idea: ${subCriteria.novelty}/100
   - IP Strength & Protection: ${subCriteria.ipStrength}/100
   - Market Differentiation: ${subCriteria.differentiation}/100
   ${scores.innovation >= 65 ? 'MEETS REQUIREMENT' : 'NEEDS IMPROVEMENT'}

2. VIABILITY: ${scores.viability}/100
   - Market Size & Opportunity: ${subCriteria.marketSize}/100
   - Revenue Model & Projections: ${subCriteria.revenue}/100
   - Team Experience & Capability: ${subCriteria.teamExperience}/100
   ${scores.viability >= 65 ? 'MEETS REQUIREMENT' : 'NEEDS IMPROVEMENT'}

3. SCALABILITY: ${scores.scalability}/100
   - Growth Potential & Market Expansion: ${subCriteria.growthPotential}/100
   - Job Creation Plan (min 2 FTE by Year 3): ${subCriteria.jobCreation}/100
   - International Reach & Expansion: ${subCriteria.internationalReach}/100
   ${scores.scalability >= 65 ? 'MEETS REQUIREMENT' : 'NEEDS IMPROVEMENT'}

ENDORSING BODY COMPATIBILITY ANALYSIS
${'-'.repeat(80)}
${endorserComparison.map(e => `
${e.name}:
  Your Weighted Score: ${e.yourScore}/100
  Required Score: ${e.required}/100
  Status: ${e.meets ? 'COMPATIBLE' : 'BELOW REQUIREMENT'}
  Recommendation: ${e.meets ? 'Proceed with application' : 'Strengthen criteria before applying'}
`).join('')}

CRITICAL SUCCESS FACTORS (2025 GUIDANCE)
${'-'.repeat(80)}
${scores.innovation >= 65 ? '[PASS]' : '[FAIL]'} Innovation must demonstrate genuine novelty not available in UK market
${scores.viability >= 65 ? '[PASS]' : '[FAIL]'} Business must be viable with credible financial projections
${scores.scalability >= 65 ? '[PASS]' : '[FAIL]'} Must show potential for job creation and growth
${subCriteria.ipStrength >= 50 ? '[PASS]' : '[FAIL]'} Strong IP protection or proprietary technology required
${overallScore >= 65 ? '[PASS]' : '[FAIL]'} Overall score must meet endorsing body minimum threshold

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

EVIDENCE REQUIREMENTS CHECKLIST
${'-'.repeat(80)}
Innovation Evidence:
  [ ] Patent applications or provisional patents filed
  [ ] Technical specifications and architecture diagrams
  [ ] Third-party expert validation of innovation claims
  [ ] Competitive analysis demonstrating differentiation
  [ ] IP strategy document and protection roadmap

Viability Evidence:
  [ ] Detailed 36-month financial projections certified by accountant
  [ ] Bank statements verifying minimum £50,000 investment funds
  [ ] Customer letters of intent or signed contracts
  [ ] Market research reports with TAM/SAM/SOM analysis
  [ ] Team CVs highlighting relevant industry experience

Scalability Evidence:
  [ ] Detailed hiring plan with specific roles and timelines
  [ ] Job creation targets (minimum 2 FTE equivalent by Year 3)
  [ ] Technology infrastructure scaling roadmap
  [ ] Geographic expansion strategy with target markets
  [ ] Partnership agreements supporting growth objectives

NEXT STEPS
${'-'.repeat(80)}
1. Review GOV.UK Innovator Founder visa guidance (November 2025 update)
2. Address criterion gaps identified in assessment above
3. Prepare comprehensive evidence portfolio organized by criteria
4. Select most compatible endorsing body based on weighted scores
5. Schedule mock interview preparation with visa advisor
6. Ensure all documentation meets endorsing body specific requirements
7. Maintain £50,000 minimum investment funds throughout process

IMPORTANT NOTES
${'-'.repeat(80)}
- Endorsing bodies conduct detailed technical interviews
- All evidence must be independently verifiable
- Scores are self-assessed - endorsers may evaluate differently
- Minimum score thresholds vary by endorsing body (65-75 range)
- Single criterion scoring below 50% often results in rejection
- Process typically takes 3-6 months from initial application

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
Based on GOV.UK guidance updated November 2025
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `criteria-scorer-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-criteria-scorer">UK Innovator Founder Visa Criteria Scorer</h1>
            <p className="text-lg text-muted-foreground">Comprehensive assessment of Innovation, Viability, and Scalability criteria</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="criteria-scorer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Criteria Scorer"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-criteria-scorer">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Eligibility Status</CardTitle>
                  <CardDescription>UK Innovator Founder Visa - GOV.UK 2025 Criteria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={meetsMinimum ? (isStrongCandidate ? "border-green-500" : "border-blue-500") : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                          <p className="text-4xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {isStrongCandidate ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : meetsMinimum ? (
                              <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm font-medium">
                              {isStrongCandidate ? 'Strong Candidate' : meetsMinimum ? 'Meets Minimum' : 'Below Threshold'}
                            </span>
                          </div>
                          <Progress value={overallScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={scores.innovation >= 65 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Innovation</p>
                          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-innovation-score">{scores.innovation}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {scores.innovation >= 65 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{scores.innovation >= 65 ? 'Meets Requirement' : 'Needs Improvement'}</span>
                          </div>
                          <Progress value={scores.innovation} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={scores.viability >= 65 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Viability</p>
                          <p className="text-4xl font-bold text-green-600 dark:text-green-400" data-testid="text-viability-score">{scores.viability}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {scores.viability >= 65 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{scores.viability >= 65 ? 'Meets Requirement' : 'Needs Improvement'}</span>
                          </div>
                          <Progress value={scores.viability} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-1 gap-4">
                    <Card className={scores.scalability >= 65 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Scalability</p>
                          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-scalability-score">{scores.scalability}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {scores.scalability >= 65 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{scores.scalability >= 65 ? 'Meets Requirement' : 'Needs Improvement'}</span>
                          </div>
                          <Progress value={scores.scalability} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your overall score of {overallScore}% is below the minimum threshold of {passThreshold}%. Focus on strengthening your weakest criteria to improve your endorsement prospects.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !isStrongCandidate && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum threshold, but scores above {strongThreshold}% significantly improve approval chances. Consider strengthening all three criteria before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isStrongCandidate && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your scores indicate a strong candidate profile. Ensure comprehensive evidence documentation across all criteria for your endorsing body application.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Three Core Criteria - Radar Analysis</CardTitle>
                  <CardDescription>Visual assessment of your profile balance across Innovation, Viability, and Scalability</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="criteria" tick={{ fill: 'hsl(var(--foreground))' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar name="Your Scores" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Pass Threshold (65%)" dataKey={() => 65} stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Criteria Assessment</CardTitle>
                  <CardDescription>Score each of the three core visa requirements (0-100%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="innovation-slider" className="text-base font-semibold">Innovation Score</Label>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="value-innovation">{scores.innovation}%</span>
                      </div>
                      <Slider
                        id="innovation-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[scores.innovation]}
                        onValueChange={(v) => updateScore('innovation', v[0])}
                        data-testid="slider-innovation"
                        className="mb-1"
                      />
                      <p className="text-sm text-muted-foreground">Novelty, IP strength, market differentiation, genuine innovation not available in UK</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="viability-slider" className="text-base font-semibold">Viability Score</Label>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="value-viability">{scores.viability}%</span>
                      </div>
                      <Slider
                        id="viability-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[scores.viability]}
                        onValueChange={(v) => updateScore('viability', v[0])}
                        data-testid="slider-viability"
                        className="mb-1"
                      />
                      <p className="text-sm text-muted-foreground">Market size, credible financial projections, experienced team, revenue model validation</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="scalability-slider" className="text-base font-semibold">Scalability Score</Label>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="value-scalability">{scores.scalability}%</span>
                      </div>
                      <Slider
                        id="scalability-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[scores.scalability]}
                        onValueChange={(v) => updateScore('scalability', v[0])}
                        data-testid="slider-scalability"
                        className="mb-1"
                      />
                      <p className="text-sm text-muted-foreground">Growth potential, job creation plan (min 2 FTE by Year 3), international expansion strategy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Sub-Criteria Assessment</CardTitle>
                  <CardDescription>Granular scoring for comprehensive evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Innovation Components</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="novelty-slider" className="text-sm">Novelty of Business Idea</Label>
                          <span className="text-sm font-bold" data-testid="value-novelty">{subCriteria.novelty}%</span>
                        </div>
                        <Slider
                          id="novelty-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.novelty]}
                          onValueChange={(v) => updateSubCriteria('novelty', v[0])}
                          data-testid="slider-novelty"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="ip-slider" className="text-sm">IP Strength & Protection</Label>
                          <span className="text-sm font-bold" data-testid="value-ip">{subCriteria.ipStrength}%</span>
                        </div>
                        <Slider
                          id="ip-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.ipStrength]}
                          onValueChange={(v) => updateSubCriteria('ipStrength', v[0])}
                          data-testid="slider-ip"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="differentiation-slider" className="text-sm">Market Differentiation</Label>
                          <span className="text-sm font-bold" data-testid="value-differentiation">{subCriteria.differentiation}%</span>
                        </div>
                        <Slider
                          id="differentiation-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.differentiation]}
                          onValueChange={(v) => updateSubCriteria('differentiation', v[0])}
                          data-testid="slider-differentiation"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Viability Components</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="market-slider" className="text-sm">Market Size & Opportunity</Label>
                          <span className="text-sm font-bold" data-testid="value-market">{subCriteria.marketSize}%</span>
                        </div>
                        <Slider
                          id="market-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.marketSize]}
                          onValueChange={(v) => updateSubCriteria('marketSize', v[0])}
                          data-testid="slider-market"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="revenue-slider" className="text-sm">Revenue Model & Projections</Label>
                          <span className="text-sm font-bold" data-testid="value-revenue">{subCriteria.revenue}%</span>
                        </div>
                        <Slider
                          id="revenue-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.revenue]}
                          onValueChange={(v) => updateSubCriteria('revenue', v[0])}
                          data-testid="slider-revenue"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="team-slider" className="text-sm">Team Experience & Capability</Label>
                          <span className="text-sm font-bold" data-testid="value-team">{subCriteria.teamExperience}%</span>
                        </div>
                        <Slider
                          id="team-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.teamExperience]}
                          onValueChange={(v) => updateSubCriteria('teamExperience', v[0])}
                          data-testid="slider-team"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Scalability Components</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="growth-slider" className="text-sm">Growth Potential</Label>
                          <span className="text-sm font-bold" data-testid="value-growth">{subCriteria.growthPotential}%</span>
                        </div>
                        <Slider
                          id="growth-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.growthPotential]}
                          onValueChange={(v) => updateSubCriteria('growthPotential', v[0])}
                          data-testid="slider-growth"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="jobs-slider" className="text-sm">Job Creation Plan (min 2 FTE by Year 3)</Label>
                          <span className="text-sm font-bold" data-testid="value-jobs">{subCriteria.jobCreation}%</span>
                        </div>
                        <Slider
                          id="jobs-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.jobCreation]}
                          onValueChange={(v) => updateSubCriteria('jobCreation', v[0])}
                          data-testid="slider-jobs"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="international-slider" className="text-sm">International Reach & Expansion</Label>
                          <span className="text-sm font-bold" data-testid="value-international">{subCriteria.internationalReach}%</span>
                        </div>
                        <Slider
                          id="international-slider"
                          min={0}
                          max={100}
                          step={1}
                          value={[subCriteria.internationalReach]}
                          onValueChange={(v) => updateSubCriteria('internationalReach', v[0])}
                          data-testid="slider-international"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Compatibility</CardTitle>
                  <CardDescription>Your weighted scores vs. endorser-specific requirements (2025 data)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={endorserComparison} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--foreground))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="yourScore" fill="#3b82f6" name="Your Weighted Score">
                        {endorserComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.meets ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                      <Bar dataKey="required" fill="#fbbf24" name="Required Score" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 space-y-3">
                    {endorserComparison.map((endorser, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${endorser.meets ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold" data-testid={`text-endorser-name-${idx}`}>{endorser.name}</p>
                            <p className="text-sm text-muted-foreground">Weighted Score: {endorser.yourScore}% | Required: {endorser.required}%</p>
                          </div>
                          <div className="text-right">
                            {endorser.meets ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Compatible</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">Below Requirement</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criteria Balance Analysis</CardTitle>
                    <CardDescription>Identify imbalanced scores that may raise concerns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Innovation vs Viability Gap</span>
                        <span className={`font-bold ${Math.abs(scores.innovation - scores.viability) > 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(scores.innovation - scores.viability)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Innovation vs Scalability Gap</span>
                        <span className={`font-bold ${Math.abs(scores.innovation - scores.scalability) > 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(scores.innovation - scores.scalability)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Viability vs Scalability Gap</span>
                        <span className={`font-bold ${Math.abs(scores.viability - scores.scalability) > 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(scores.viability - scores.scalability)}%
                        </span>
                      </div>
                      {Math.max(Math.abs(scores.innovation - scores.viability), Math.abs(scores.innovation - scores.scalability), Math.abs(scores.viability - scores.scalability)) > 30 && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Large gaps between criteria can raise concerns. Endorsers prefer well-balanced business profiles.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Critical Thresholds</CardTitle>
                    <CardDescription>GOV.UK 2025 pass/fail requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {overallScore >= 65 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Overall Score 65%+</p>
                          <p className="text-xs text-muted-foreground">Minimum threshold for most endorsing bodies</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {scores.innovation >= 50 && scores.viability >= 50 && scores.scalability >= 50 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">All Criteria 50%+</p>
                          <p className="text-xs text-muted-foreground">No single criterion below 50% (common rejection trigger)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {subCriteria.ipStrength >= 50 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">IP Strength 50%+</p>
                          <p className="text-xs text-muted-foreground">Patent/proprietary technology strongly preferred</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {subCriteria.jobCreation >= 65 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Job Creation Plan 65%+</p>
                          <p className="text-xs text-muted-foreground">Minimum 2 FTE equivalent by Year 3 required</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {overallScore >= 75 ? (
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Overall Score 75%+</p>
                          <p className="text-xs text-muted-foreground">Strong candidate - significantly better approval odds</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips based on your current scores and GOV.UK 2025 guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950" data-testid={`tip-${index}`}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-6 w-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white dark:text-black flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">{tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to strengthen your visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className={`p-4 border-l-4 rounded-lg ${
                        item.priority === 'Critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                        item.priority === 'High' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950' :
                        'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                      }`} data-testid={`action-${index}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-white dark:bg-black">
                              {item.week}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">{item.action}</p>
                            <span className={`text-xs font-bold ${
                              item.priority === 'Critical' ? 'text-red-600 dark:text-red-400' :
                              item.priority === 'High' ? 'text-orange-600 dark:text-orange-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              Priority: {item.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
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
