import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info, Sparkles, Shield } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'criteria-scorer',
  toolName: 'Visa Criteria Scorer',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. I'll help you assess your readiness against the three key visa criteria: Innovation, Viability, and Scalability. Understanding where you stand is essential for a successful endorsement application. Let's evaluate your position!",
  questions: [
    {
      id: 'innovation-description',
      question: "Describe what makes your business innovative. What's genuinely new or different about your solution?",
      hint: "Consider: novel technology, unique approach, significant improvement, new market creation",
      fieldKey: 'innovationDescription',
      minLength: 80
    },
    {
      id: 'ip-strength',
      question: "What intellectual property do you have? Describe patents, trademarks, trade secrets, or proprietary technology.",
      hint: "IP protection is critical - even pending applications strengthen your case",
      fieldKey: 'ipStrength',
      minLength: 50
    },
    {
      id: 'viability-funding',
      question: "What's your funding situation? Do you have 18+ months runway or clear path to profitability?",
      hint: "Include confirmed funding, revenue projections, and financial reserves",
      fieldKey: 'viabilityFunding',
      minLength: 50
    },
    {
      id: 'viability-team',
      question: "Describe your team's capability. What relevant experience do the founders and key hires bring?",
      hint: "Previous exits, domain expertise, technical skills, advisory board",
      fieldKey: 'viabilityTeam',
      minLength: 60
    },
    {
      id: 'scalability-market',
      question: "What's your total addressable market (TAM)? Describe your market size opportunity.",
      hint: "Include market research sources and your SAM/SOM estimates",
      fieldKey: 'scalabilityMarket',
      minLength: 50
    },
    {
      id: 'scalability-plan',
      question: "What's your growth plan? How will you achieve significant scale over the next 3-5 years?",
      hint: "Geographic expansion, product extensions, market penetration strategy",
      fieldKey: 'scalabilityPlan',
      minLength: 60
    },
    {
      id: 'job-creation',
      question: "How many UK jobs do you plan to create? Remember: 5 jobs at £25k+ or 10 jobs meets ILR criterion.",
      hint: "Be realistic but ambitious - job creation is a key success metric for ILR",
      fieldKey: 'jobCreation',
      minLength: 30
    }
  ],
  completionMessage: "Excellent! You've provided comprehensive information across all three criteria. I can see your strengths and areas for improvement. I'm now calculating your scores and populating the assessment with your responses."
};

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
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('criteria-scorer-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('criteria-scorer-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

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

  useEffect(() => {
    localStorage.setItem('criteria-scorer-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    let innovationScore = 50;
    let viabilityScore = 50;
    let scalabilityScore = 50;
    let newSubCriteria = { ...subCriteria };
    
    if (answers.innovationDescription && answers.innovationDescription.length > 60) {
      innovationScore += 15;
      newSubCriteria.novelty = 70;
      newSubCriteria.differentiation = 70;
    }
    if (answers.ipStrength && answers.ipStrength.length > 40) {
      innovationScore += 15;
      newSubCriteria.ipStrength = 75;
    }
    
    if (answers.viabilityFunding && answers.viabilityFunding.length > 40) {
      viabilityScore += 15;
      newSubCriteria.revenue = 70;
      if (answers.viabilityFunding.toLowerCase().includes('18') || 
          answers.viabilityFunding.toLowerCase().includes('profitab')) {
        viabilityScore += 10;
        newSubCriteria.revenue = 80;
      }
    }
    if (answers.viabilityTeam && answers.viabilityTeam.length > 50) {
      viabilityScore += 15;
      newSubCriteria.teamExperience = 75;
    }
    
    if (answers.scalabilityMarket && answers.scalabilityMarket.length > 40) {
      scalabilityScore += 15;
      newSubCriteria.marketSize = 70;
    }
    if (answers.scalabilityPlan && answers.scalabilityPlan.length > 50) {
      scalabilityScore += 10;
      newSubCriteria.growthPotential = 75;
      newSubCriteria.internationalReach = 70;
    }
    if (answers.jobCreation) {
      const jobMatch = answers.jobCreation.match(/\d+/);
      if (jobMatch) {
        const jobs = parseInt(jobMatch[0]);
        if (jobs >= 10) {
          scalabilityScore += 15;
          newSubCriteria.jobCreation = 90;
        } else if (jobs >= 5) {
          scalabilityScore += 10;
          newSubCriteria.jobCreation = 75;
        }
      }
    }
    
    setScores({
      innovation: Math.min(100, innovationScore),
      viability: Math.min(100, viabilityScore),
      scalability: Math.min(100, scalabilityScore)
    });
    
    setSubCriteria(newSubCriteria);
    setMode('traditional');
  };

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
      tips.push("Innovation Score Below Target: Strengthen your IP strategy with patent applications or trade secret documentation.");
    }
    if (scores.innovation >= 75) {
      tips.push("Strong Innovation Profile: Document your innovation thoroughly with technical specifications and IP filings.");
    }
    if (scores.viability < 65) {
      tips.push("Viability Concerns: Your financial projections need strengthening. Endorsing bodies require detailed 3-year cashflow.");
    }
    if (scores.viability >= 75) {
      tips.push("Solid Viability Score: Ensure all funding sources are documented with bank statements.");
    }
    if (scores.scalability < 65) {
      tips.push("Scalability Gap: Your growth plan should include specific job creation targets and geographic expansion strategy.");
    }
    if (scores.scalability >= 75) {
      tips.push("Excellent Scalability Plan: Highlight your international expansion strategy and technology infrastructure.");
    }
    if (overallScore < passThreshold) {
      tips.push("Overall Score Below Pass Threshold: Focus on your weakest criterion first.");
    }
    if (overallScore >= strongThreshold) {
      tips.push("Strong Overall Profile: You meet or exceed requirements for most endorsing bodies.");
    }
    
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Complete comprehensive self-assessment across all three criteria",
      priority: "Critical"
    });
    
    if (scores.innovation < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Conduct IP audit - identify patentable innovations, file provisional patents",
        priority: "Critical"
      });
    }
    
    if (scores.viability < 70) {
      actions.push({
        week: "Week 2",
        action: "Strengthen financial model - obtain accountant certification, verify funding sources",
        priority: "Critical"
      });
    }
    
    if (scores.scalability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Develop detailed scaling plan - hiring roadmap, technology infrastructure",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3-4",
      action: "Prepare evidence portfolio organized by criterion",
      priority: "High"
    });
    
    return actions.slice(0, 6);
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - CRITERIA SCORING ASSESSMENT
Generated: ${new Date().toLocaleString('en-GB')}

OVERALL ASSESSMENT
Overall Score: ${overallScore}/100
Status: ${meetsMinimum ? (isStrongCandidate ? 'STRONG CANDIDATE' : 'MEETS MINIMUM') : 'BELOW THRESHOLD'}

CORE CRITERIA SCORES
1. INNOVATION: ${scores.innovation}/100
2. VIABILITY: ${scores.viability}/100
3. SCALABILITY: ${scores.scalability}/100

ENDORSING BODY COMPATIBILITY
${endorserComparison.map(e => `${e.name}: ${e.yourScore}/${e.required} - ${e.meets ? 'COMPATIBLE' : 'BELOW REQUIREMENT'}`).join('\n')}
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
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-criteria-scorer">UK Innovator Founder Visa Criteria Scorer</h1>
              <p className="text-lg text-muted-foreground">Comprehensive assessment of Innovation, Viability, and Scalability criteria</p>
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

          {mode === 'ai' ? (
            <AiToolGuide
              config={AI_TOOL_CONFIG}
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
              sidePanel={() => (
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="font-bold mb-4">The Three Criteria</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold">Innovation</p>
                          <p className="text-muted-foreground">Genuinely innovative, new, or different solution</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold">Viability</p>
                          <p className="text-muted-foreground">Capability, skills, and resources to deliver</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold">Scalability</p>
                          <p className="text-muted-foreground">Potential for growth and job creation</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{scores.innovation}%</p>
                      <p className="text-xs text-muted-foreground">Innovation</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{scores.viability}%</p>
                      <p className="text-xs text-muted-foreground">Viability</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">{scores.scalability}%</p>
                      <p className="text-xs text-muted-foreground">Scalability</p>
                    </Card>
                  </div>
                </div>
              )}
            />
          ) : (
            <>
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
                            Your overall score of {overallScore}% is below the minimum threshold of {passThreshold}%.
                          </AlertDescription>
                        </Alert>
                      )}

                      {isStrongCandidate && (
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 dark:text-green-300">
                            Excellent! Your scores indicate strong endorsement readiness.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-6">Adjust Your Scores</h3>
                    <div className="space-y-6">
                      <div>
                        <Label>Innovation: {scores.innovation}%</Label>
                        <Slider
                          value={[scores.innovation]}
                          onValueChange={([v]) => updateScore('innovation', v)}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-innovation"
                        />
                      </div>
                      <div>
                        <Label>Viability: {scores.viability}%</Label>
                        <Slider
                          value={[scores.viability]}
                          onValueChange={([v]) => updateScore('viability', v)}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-viability"
                        />
                      </div>
                      <div>
                        <Label>Scalability: {scores.scalability}%</Label>
                        <Slider
                          value={[scores.scalability]}
                          onValueChange={([v]) => updateScore('scalability', v)}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-scalability"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Criteria Radar</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="criteria" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Your Score" dataKey="value" stroke="#ffa536" fill="#ffa536" fillOpacity={0.5} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Endorsing Body Compatibility</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={endorserComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="yourScore" fill="#ffa536" name="Your Score" />
                        <Bar dataKey="required" fill="#22c55e" name="Required" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Compatibility Summary</h3>
                    <div className="space-y-3">
                      {endorserComparison.map((e, i) => (
                        <div key={i} className={`p-3 rounded border-l-4 ${e.meets ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
                          <p className="font-semibold">{e.name}</p>
                          <p className="text-sm">Your Score: {e.yourScore} / Required: {e.required}</p>
                          <p className={`text-sm ${e.meets ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {e.meets ? 'Compatible' : 'Below Requirement'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="tips" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Smart Recommendations</h3>
                    <div className="space-y-3">
                      {getSmartTips().map((tip, i) => {
                        const isPositive = tip.toLowerCase().includes('strong') || tip.toLowerCase().includes('excellent') || tip.toLowerCase().includes('solid');
                        return (
                          <Alert key={i} className={isPositive ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                            <AlertDescription className={isPositive ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                          </Alert>
                        );
                      })}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="action" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Action Plan</h3>
                    <div className="space-y-4">
                      {generateActionPlan().map((item, i) => (
                        <div key={i} className="flex gap-4 p-3 border rounded">
                          <span className="font-bold text-sm whitespace-nowrap">{item.week}</span>
                          <div>
                            <p className="text-sm">{item.action}</p>
                            <span className={`text-xs ${item.priority === 'Critical' ? 'text-red-600' : 'text-yellow-600'}`}>{item.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
