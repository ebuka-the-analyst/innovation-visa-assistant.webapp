import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, Users, DollarSign } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'business-model-validator',
  toolName: 'Business Model Canvas Validator',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. The Business Model Canvas is a powerful tool for validating your business against UK visa criteria - Innovation, Viability, and Scalability. Let's work through all 9 building blocks to ensure you're ready for endorsement!",
  questions: [
    {
      id: 'customer-segments',
      question: "Who are your target customers? Describe your primary customer segments and why you're focusing on them.",
      hint: "Be specific about demographics, behaviors, needs, and market size (TAM/SAM/SOM)",
      fieldKey: 'customer_segments_text',
      minLength: 100
    },
    {
      id: 'value-propositions',
      question: "What's your unique value proposition? How do you solve customer problems differently than competitors?",
      hint: "This is critical for the Innovation criterion. Focus on novel approaches and differentiation.",
      fieldKey: 'value_propositions_text',
      minLength: 100
    },
    {
      id: 'revenue-streams',
      question: "How will you make money? Describe your revenue model, pricing strategy, and expected revenue sources.",
      hint: "Subscription, one-time purchase, licensing, marketplace fees - explain why this model fits your market",
      fieldKey: 'revenue_streams_text',
      minLength: 80
    },
    {
      id: 'key-resources',
      question: "What key resources do you need to deliver your value proposition? Include technology, people, and intellectual property.",
      hint: "Technical capabilities, team expertise, patents, partnerships, or unique data",
      fieldKey: 'key_resources_text',
      minLength: 80
    },
    {
      id: 'key-partnerships',
      question: "Who are your key partners? What strategic relationships will help you succeed in the UK market?",
      hint: "Technology partners, distribution partners, industry associations, or advisors",
      fieldKey: 'key_partnerships_text',
      minLength: 80
    },
    {
      id: 'cost-structure',
      question: "What's your cost structure? Describe your major cost drivers and path to profitability.",
      hint: "Fixed vs variable costs, key investments, and how costs scale with growth",
      fieldKey: 'cost_structure_text',
      minLength: 80
    },
    {
      id: 'scalability-potential',
      question: "How will you scale this business in the UK? Describe your growth strategy and job creation potential.",
      hint: "Endorsers want to see 5+ UK jobs within 3 years and significant revenue growth",
      fieldKey: 'scalability_potential',
      minLength: 100
    }
  ],
  completionMessage: "Brilliant work! You've validated all key elements of your business model. This comprehensive analysis demonstrates strong understanding of your business across all 9 building blocks. I'm now calculating your visa readiness scores."
};

type BusinessModelScores = {
  customerSegments: number;
  valuePropositions: number;
  channels: number;
  customerRelationships: number;
  revenueStreams: number;
  keyResources: number;
  keyActivities: number;
  keyPartnerships: number;
  costStructure: number;
};

type BusinessModelInputs = {
  customerSegmentsText: string;
  valuePropositionsText: string;
  channelsText: string;
  customerRelationshipsText: string;
  revenueStreamsText: string;
  keyResourcesText: string;
  keyActivitiesText: string;
  keyPartnershipsText: string;
  costStructureText: string;
};

export default function BusinessModelValidator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('business-model-validator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('business-model-validator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [scores, setScores] = useState<BusinessModelScores>({
    customerSegments: 70,
    valuePropositions: 75,
    channels: 65,
    customerRelationships: 70,
    revenueStreams: 75,
    keyResources: 70,
    keyActivities: 65,
    keyPartnerships: 60,
    costStructure: 70
  });

  const [inputs, setInputs] = useState<BusinessModelInputs>({
    customerSegmentsText: "SMBs, mid-market companies, and enterprise organizations in UK",
    valuePropositionsText: "AI-powered innovation visa preparation with automated compliance checking",
    channelsText: "Direct B2B sales, online platform, partnerships with immigration advisors",
    customerRelationshipsText: "Self-service platform with premium advisory support options",
    revenueStreamsText: "SaaS subscriptions (Basic/Premium/Enterprise), consulting services",
    keyResourcesText: "AI models, visa compliance database, legal expertise, technology platform",
    keyActivitiesText: "Software development, compliance monitoring, customer support, content creation",
    keyPartnershipsText: "Immigration law firms, endorsing bodies, business incubators, accounting firms",
    costStructureText: "Technology infrastructure, AI/ML development, legal compliance, marketing, staff"
  });

  const [activeTab, setActiveTab] = useState('canvas');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('business-model-validator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.customer_segments_text) {
      setInputs(prev => ({ ...prev, customerSegmentsText: answers.customer_segments_text }));
      setScores(prev => ({ ...prev, customerSegments: 75 }));
    }
    if (answers.value_propositions_text) {
      setInputs(prev => ({ ...prev, valuePropositionsText: answers.value_propositions_text }));
      setScores(prev => ({ ...prev, valuePropositions: 80 }));
    }
    if (answers.revenue_streams_text) {
      setInputs(prev => ({ ...prev, revenueStreamsText: answers.revenue_streams_text }));
      setScores(prev => ({ ...prev, revenueStreams: 75 }));
    }
    if (answers.key_resources_text) {
      setInputs(prev => ({ ...prev, keyResourcesText: answers.key_resources_text }));
      setScores(prev => ({ ...prev, keyResources: 75 }));
    }
    if (answers.key_partnerships_text) {
      setInputs(prev => ({ ...prev, keyPartnershipsText: answers.key_partnerships_text }));
      setScores(prev => ({ ...prev, keyPartnerships: 70 }));
    }
    if (answers.cost_structure_text) {
      setInputs(prev => ({ ...prev, costStructureText: answers.cost_structure_text }));
      setScores(prev => ({ ...prev, costStructure: 75 }));
    }
    setMode('traditional');
  };

  const updateScore = (field: keyof BusinessModelScores, value: number) => {
    setScores({ ...scores, [field]: value });
  };

  const updateInput = (field: keyof BusinessModelInputs, value: string) => {
    setInputs({ ...inputs, [field]: value });
  };

  const calculateOverallScore = () => {
    const values = Object.values(scores);
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const calculateInnovationScore = () => {
    return Math.round((scores.valuePropositions + scores.keyActivities + scores.keyResources) / 3);
  };

  const calculateViabilityScore = () => {
    return Math.round((scores.revenueStreams + scores.costStructure + scores.customerSegments) / 3);
  };

  const calculateScalabilityScore = () => {
    return Math.round((scores.channels + scores.keyPartnerships + scores.customerRelationships) / 3);
  };

  const getGrade = (score: number): string => {
    if (score >= 85) return 'A - Excellent';
    if (score >= 75) return 'B - Strong';
    if (score >= 65) return 'C - Good';
    if (score >= 55) return 'D - Developing';
    return 'F - Weak';
  };

  const getSerializedState = () => {
    return {
      scores,
      inputs,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('scores' in state) setScores(state.scores);
    if ('inputs' in state) setInputs(state.inputs);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('business-model-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('business-model-validator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('business-model-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const overallScore = calculateOverallScore();
    const innovationScore = calculateInnovationScore();
    const viabilityScore = calculateViabilityScore();
    const scalabilityScore = calculateScalabilityScore();

    if (innovationScore < 70) tips.push("Innovation score below visa threshold - strengthen value propositions and demonstrate novel approach");
    if (viabilityScore < 70) tips.push("Viability concerns detected - validate revenue model and demonstrate financial sustainability");
    if (scalabilityScore < 70) tips.push("Scalability requires attention - show clear growth channels and partnership strategy");
    if (scores.customerSegments < 65) tips.push("Customer segments need better definition - specify target market size and addressable segments");
    if (scores.revenueStreams < 70) tips.push("Revenue streams require validation - provide evidence of pricing model and customer willingness to pay");
    if (scores.keyPartnerships < 65) tips.push("Key partnerships underdeveloped - identify strategic partners for UK market entry and growth");
    if (scores.costStructure < 70) tips.push("Cost structure needs optimization - demonstrate path to profitability and capital efficiency");
    if (overallScore >= 75) tips.push("Strong business model foundation - ready for endorsement application with minor refinements");
    if (overallScore < 60) tips.push("Critical gaps in business model - comprehensive revision needed before visa application");
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete Business Model Canvas with all 9 building blocks fully detailed", priority: "Critical" },
      { week: "Week 1", action: "Validate customer segments with market research and competitor analysis", priority: "High" },
      { week: "Week 2", action: "Document value propositions with evidence of innovation and differentiation", priority: "Critical" },
      { week: "Week 2", action: "Create detailed revenue model with pricing strategy and financial projections", priority: "Critical" },
      { week: "Week 3", action: "Map out distribution channels and go-to-market strategy for UK expansion", priority: "High" },
      { week: "Week 3", action: "Identify and document key partnerships with UK-based organizations", priority: "High" },
      { week: "Week 4", action: "Build comprehensive cost structure analysis showing path to profitability", priority: "Critical" },
      { week: "Week 4", action: "Prepare evidence package demonstrating scalability to create 5+ jobs within 3 years", priority: "Critical" },
      { week: "Ongoing", action: "Refine business model based on endorsing body feedback and market validation", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const overallScore = calculateOverallScore();
    const innovationScore = calculateInnovationScore();
    const viabilityScore = calculateViabilityScore();
    const scalabilityScore = calculateScalabilityScore();

    const report = `UK INNOVATOR FOUNDER VISA - BUSINESS MODEL CANVAS VALIDATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

EXECUTIVE SUMMARY
${'-'.repeat(70)}
Overall Business Model Score: ${overallScore}% (${getGrade(overallScore)})

UK Visa Criteria Scores:
  Innovation: ${innovationScore}% ${innovationScore >= 70 ? '(READY)' : '(NEEDS WORK)'}
  Viability: ${viabilityScore}% ${viabilityScore >= 70 ? '(READY)' : '(NEEDS WORK)'}
  Scalability: ${scalabilityScore}% ${scalabilityScore >= 70 ? '(READY)' : '(NEEDS WORK)'}

BUSINESS MODEL CANVAS - 9 BUILDING BLOCKS ASSESSMENT
${'-'.repeat(70)}

1. CUSTOMER SEGMENTS (Score: ${scores.customerSegments}/100)
${inputs.customerSegmentsText}
Assessment: ${scores.customerSegments >= 75 ? 'Well-defined target market segments' : scores.customerSegments >= 60 ? 'Adequate segmentation - needs more specificity' : 'Customer segments require significant development'}

2. VALUE PROPOSITIONS (Score: ${scores.valuePropositions}/100)
${inputs.valuePropositionsText}
Assessment: ${scores.valuePropositions >= 75 ? 'Strong differentiation and innovation demonstrated' : scores.valuePropositions >= 60 ? 'Moderate value proposition - strengthen unique elements' : 'Value proposition lacks clarity and differentiation'}

3. CHANNELS (Score: ${scores.channels}/100)
${inputs.channelsText}
Assessment: ${scores.channels >= 75 ? 'Clear distribution strategy with multiple channels' : scores.channels >= 60 ? 'Basic channel strategy - expand reach and coverage' : 'Distribution channels need strategic development'}

4. CUSTOMER RELATIONSHIPS (Score: ${scores.customerRelationships}/100)
${inputs.customerRelationshipsText}
Assessment: ${scores.customerRelationships >= 75 ? 'Effective relationship management approach' : scores.customerRelationships >= 60 ? 'Adequate relationship strategy' : 'Customer relationship model requires enhancement'}

5. REVENUE STREAMS (Score: ${scores.revenueStreams}/100)
${inputs.revenueStreamsText}
Assessment: ${scores.revenueStreams >= 75 ? 'Diversified and validated revenue model' : scores.revenueStreams >= 60 ? 'Revenue streams identified but need validation' : 'Revenue model requires fundamental development'}

6. KEY RESOURCES (Score: ${scores.keyResources}/100)
${inputs.keyResourcesText}
Assessment: ${scores.keyResources >= 75 ? 'Critical resources identified and accessible' : scores.keyResources >= 60 ? 'Key resources defined but acquisition plan needed' : 'Resource requirements unclear or insufficient'}

7. KEY ACTIVITIES (Score: ${scores.keyActivities}/100)
${inputs.keyActivitiesText}
Assessment: ${scores.keyActivities >= 75 ? 'Core activities aligned with value delivery' : scores.keyActivities >= 60 ? 'Activities identified - optimize for efficiency' : 'Key activities require strategic alignment'}

8. KEY PARTNERSHIPS (Score: ${scores.keyPartnerships}/100)
${inputs.keyPartnershipsText}
Assessment: ${scores.keyPartnerships >= 75 ? 'Strategic partnerships established or planned' : scores.keyPartnerships >= 60 ? 'Partnership opportunities identified' : 'Partnership strategy underdeveloped'}

9. COST STRUCTURE (Score: ${scores.costStructure}/100)
${inputs.costStructureText}
Assessment: ${scores.costStructure >= 75 ? 'Cost-efficient structure with clear path to profitability' : scores.costStructure >= 60 ? 'Cost structure defined - optimize for efficiency' : 'Cost model requires fundamental analysis'}

UK INNOVATOR FOUNDER VISA CRITERIA ANALYSIS
${'-'.repeat(70)}

CRITERION 1: INNOVATION (Score: ${innovationScore}%)
Components: Value Propositions, Key Activities, Key Resources
${innovationScore >= 70 ? 
'READY - Business model demonstrates clear innovation and novel approach suitable for UK Innovator Founder visa' :
'NEEDS WORK - Strengthen innovative elements and demonstrate differentiation from existing solutions'}

Key Requirements:
- Novel business model or unique approach to existing market
- Clear technological or process innovation
- Defensible competitive advantage
- Potential for intellectual property development

CRITERION 2: VIABILITY (Score: ${viabilityScore}%)
Components: Revenue Streams, Cost Structure, Customer Segments
${viabilityScore >= 70 ?
'READY - Business model demonstrates financial sustainability and market validation' :
'NEEDS WORK - Validate revenue model and demonstrate clear path to profitability'}

Key Requirements:
- Realistic revenue projections with evidence
- Sustainable cost structure
- Validated customer demand
- Clear path to profitability within 3 years

CRITERION 3: SCALABILITY (Score: ${scalabilityScore}%)
Components: Channels, Key Partnerships, Customer Relationships
${scalabilityScore >= 70 ?
'READY - Business model supports significant growth and job creation in UK' :
'NEEDS WORK - Demonstrate clear scaling strategy and employment creation plan'}

Key Requirements:
- Ability to create 5+ jobs at £25,600+ within 3 years
- Potential for £1M+ annual revenue
- Scalable distribution channels
- Strategic partnerships supporting growth

OVERALL VISA READINESS
${'-'.repeat(70)}
Business Model Score: ${overallScore}%

${overallScore >= 75 && innovationScore >= 70 && viabilityScore >= 70 && scalabilityScore >= 70 ?
'STRONG - Your business model meets all three core visa criteria (Innovation, Viability, Scalability). Ready for endorsement application with supporting documentation.' :
overallScore >= 65 ?
'VIABLE - Business model shows promise but requires strengthening in specific areas. Address gaps before applying for endorsement.' :
'WEAK - Significant improvements required across multiple components. Comprehensive business model revision needed before visa application.'}

Recommendations:
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSING BODY EXPECTATIONS
${'-'.repeat(70)}
When submitting your business model to UK endorsing bodies (Envestors, UKES, Innovator International, GEP):

1. Complete Canvas: All 9 building blocks must be thoroughly documented
2. Market Evidence: Provide research, customer interviews, competitor analysis
3. Financial Validation: Show realistic projections backed by market data
4. Innovation Proof: Demonstrate unique approach with intellectual property where applicable
5. Scalability Evidence: Clear plan for UK job creation and revenue growth
6. Partnership Letters: Obtain letters of support from key UK partners where possible

NEXT STEPS
${'-'.repeat(70)}
1. Review weak scoring areas and gather supporting evidence
2. Validate assumptions with market research and customer interviews
3. Prepare detailed financial model aligned with revenue streams and cost structure
4. Document all innovation elements with evidence of novelty
5. Create comprehensive pitch deck based on Business Model Canvas
6. Seek feedback from advisors before submitting to endorsing body

${'='.repeat(70)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Business Model Canvas Methodology: Strategyzer/Osterwalder
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-model-validator-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRadarData = () => [
    { block: "Customer Segments", score: scores.customerSegments },
    { block: "Value Props", score: scores.valuePropositions },
    { block: "Channels", score: scores.channels },
    { block: "Relationships", score: scores.customerRelationships },
    { block: "Revenue", score: scores.revenueStreams },
    { block: "Resources", score: scores.keyResources },
    { block: "Activities", score: scores.keyActivities },
    { block: "Partnerships", score: scores.keyPartnerships },
    { block: "Costs", score: scores.costStructure }
  ];

  const getRevenueVsCostData = () => {
    const revenueWeight = scores.revenueStreams;
    const costWeight = scores.costStructure;
    return [
      { name: "Revenue Streams", value: revenueWeight, color: '#10b981' },
      { name: "Cost Structure", value: costWeight, color: '#ef4444' }
    ];
  };

  const getBlockScores = () => [
    { block: "Customer Segments", score: scores.customerSegments },
    { block: "Value Propositions", score: scores.valuePropositions },
    { block: "Channels", score: scores.channels },
    { block: "Customer Relations", score: scores.customerRelationships },
    { block: "Revenue Streams", score: scores.revenueStreams },
    { block: "Key Resources", score: scores.keyResources },
    { block: "Key Activities", score: scores.keyActivities },
    { block: "Key Partnerships", score: scores.keyPartnerships },
    { block: "Cost Structure", score: scores.costStructure }
  ];

  const getVisaCriteriaData = () => [
    { criterion: "Innovation", score: calculateInnovationScore() },
    { criterion: "Viability", score: calculateViabilityScore() },
    { criterion: "Scalability", score: calculateScalabilityScore() }
  ];

  const overallScore = calculateOverallScore();
  const innovationScore = calculateInnovationScore();
  const viabilityScore = calculateViabilityScore();
  const scalabilityScore = calculateScalabilityScore();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-business-model-validator">Business Model Canvas Validator</h1>
              <p className="text-lg text-muted-foreground">Validate 9 building blocks for UK Innovator Founder Visa criteria</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="business-model-validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Business Model Canvas Validator"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-business-model">
              <TabsTrigger value="canvas" data-testid="tab-canvas">Canvas</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                      <p className="text-3xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{getGrade(overallScore)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={innovationScore >= 70 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Innovation</p>
                      <p className="text-3xl font-bold" data-testid="text-innovation-score">{innovationScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {innovationScore >= 70 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-xs">{innovationScore >= 70 ? 'Ready' : 'Needs Work'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={viabilityScore >= 70 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Viability</p>
                      <p className="text-3xl font-bold" data-testid="text-viability-score">{viabilityScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {viabilityScore >= 70 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-xs">{viabilityScore >= 70 ? 'Ready' : 'Needs Work'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={scalabilityScore >= 70 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Scalability</p>
                      <p className="text-3xl font-bold" data-testid="text-scalability-score">{scalabilityScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {scalabilityScore >= 70 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-xs">{scalabilityScore >= 70 ? 'Ready' : 'Needs Work'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {overallScore < 65 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your business model score is below the recommended threshold for visa endorsement. Focus on strengthening weak building blocks.
                  </AlertDescription>
                </Alert>
              )}

              {overallScore >= 75 && innovationScore >= 70 && viabilityScore >= 70 && scalabilityScore >= 70 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent! Your business model meets all three UK Innovator Founder visa criteria. Ready for endorsement application.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Business Model Canvas - 9 Building Blocks</CardTitle>
                  <CardDescription>Define and score each component of your business model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="customer-segments-text" className="text-base font-semibold mb-2 block">1. Customer Segments</Label>
                      <Textarea
                        id="customer-segments-text"
                        value={inputs.customerSegmentsText}
                        onChange={(e) => updateInput('customerSegmentsText', e.target.value)}
                        placeholder="Who are your target customers? Define specific segments..."
                        rows={3}
                        data-testid="textarea-customer-segments"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.customerSegments}/100</Label>
                        <Slider
                          value={[scores.customerSegments]}
                          onValueChange={(v) => updateScore('customerSegments', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-customer-segments"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="value-propositions-text" className="text-base font-semibold mb-2 block">2. Value Propositions</Label>
                      <Textarea
                        id="value-propositions-text"
                        value={inputs.valuePropositionsText}
                        onChange={(e) => updateInput('valuePropositionsText', e.target.value)}
                        placeholder="What value do you deliver? What problems do you solve?..."
                        rows={3}
                        data-testid="textarea-value-propositions"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.valuePropositions}/100</Label>
                        <Slider
                          value={[scores.valuePropositions]}
                          onValueChange={(v) => updateScore('valuePropositions', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-value-propositions"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="channels-text" className="text-base font-semibold mb-2 block">3. Channels</Label>
                      <Textarea
                        id="channels-text"
                        value={inputs.channelsText}
                        onChange={(e) => updateInput('channelsText', e.target.value)}
                        placeholder="How do you reach customers? Distribution channels..."
                        rows={3}
                        data-testid="textarea-channels"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.channels}/100</Label>
                        <Slider
                          value={[scores.channels]}
                          onValueChange={(v) => updateScore('channels', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-channels"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customer-relationships-text" className="text-base font-semibold mb-2 block">4. Customer Relationships</Label>
                      <Textarea
                        id="customer-relationships-text"
                        value={inputs.customerRelationshipsText}
                        onChange={(e) => updateInput('customerRelationshipsText', e.target.value)}
                        placeholder="How do you interact with customers? Self-service, personal, automated?..."
                        rows={3}
                        data-testid="textarea-customer-relationships"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.customerRelationships}/100</Label>
                        <Slider
                          value={[scores.customerRelationships]}
                          onValueChange={(v) => updateScore('customerRelationships', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-customer-relationships"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="revenue-streams-text" className="text-base font-semibold mb-2 block">5. Revenue Streams</Label>
                      <Textarea
                        id="revenue-streams-text"
                        value={inputs.revenueStreamsText}
                        onChange={(e) => updateInput('revenueStreamsText', e.target.value)}
                        placeholder="How do you make money? Pricing model, revenue sources..."
                        rows={3}
                        data-testid="textarea-revenue-streams"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.revenueStreams}/100</Label>
                        <Slider
                          value={[scores.revenueStreams]}
                          onValueChange={(v) => updateScore('revenueStreams', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-revenue-streams"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="key-resources-text" className="text-base font-semibold mb-2 block">6. Key Resources</Label>
                      <Textarea
                        id="key-resources-text"
                        value={inputs.keyResourcesText}
                        onChange={(e) => updateInput('keyResourcesText', e.target.value)}
                        placeholder="What resources are essential? Physical, intellectual, human, financial..."
                        rows={3}
                        data-testid="textarea-key-resources"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.keyResources}/100</Label>
                        <Slider
                          value={[scores.keyResources]}
                          onValueChange={(v) => updateScore('keyResources', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-key-resources"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="key-activities-text" className="text-base font-semibold mb-2 block">7. Key Activities</Label>
                      <Textarea
                        id="key-activities-text"
                        value={inputs.keyActivitiesText}
                        onChange={(e) => updateInput('keyActivitiesText', e.target.value)}
                        placeholder="What are your critical activities? Production, problem-solving, platform..."
                        rows={3}
                        data-testid="textarea-key-activities"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.keyActivities}/100</Label>
                        <Slider
                          value={[scores.keyActivities]}
                          onValueChange={(v) => updateScore('keyActivities', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-key-activities"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="key-partnerships-text" className="text-base font-semibold mb-2 block">8. Key Partnerships</Label>
                      <Textarea
                        id="key-partnerships-text"
                        value={inputs.keyPartnershipsText}
                        onChange={(e) => updateInput('keyPartnershipsText', e.target.value)}
                        placeholder="Who are your key partners and suppliers? Strategic alliances..."
                        rows={3}
                        data-testid="textarea-key-partnerships"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.keyPartnerships}/100</Label>
                        <Slider
                          value={[scores.keyPartnerships]}
                          onValueChange={(v) => updateScore('keyPartnerships', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-key-partnerships"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="cost-structure-text" className="text-base font-semibold mb-2 block">9. Cost Structure</Label>
                      <Textarea
                        id="cost-structure-text"
                        value={inputs.costStructureText}
                        onChange={(e) => updateInput('costStructureText', e.target.value)}
                        placeholder="What are your main costs? Fixed vs variable, economies of scale..."
                        rows={3}
                        data-testid="textarea-cost-structure"
                      />
                      <div className="mt-3">
                        <Label className="text-sm">Score: {scores.costStructure}/100</Label>
                        <Slider
                          value={[scores.costStructure]}
                          onValueChange={(v) => updateScore('costStructure', v[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                          data-testid="slider-cost-structure"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Model Radar</CardTitle>
                    <CardDescription>9 building blocks performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="block" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Score" dataKey="score" stroke="#005EB8" fill="#005EB8" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Cost Balance</CardTitle>
                    <CardDescription>Financial model strength</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={getRevenueVsCostData()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {getRevenueVsCostData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Building Block Scores</CardTitle>
                    <CardDescription>Individual component assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getBlockScores()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="block" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#005EB8">
                          {getBlockScores().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#005EB8' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>UK Visa Criteria Alignment</CardTitle>
                    <CardDescription>Innovation, Viability, Scalability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getVisaCriteriaData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="criterion" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score">
                          {getVisaCriteriaData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Readiness Assessment</CardTitle>
                  <CardDescription>UK Innovator Founder requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {innovationScore >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Innovation Criterion: {innovationScore}%</p>
                        <p className="text-sm text-muted-foreground">Novel business model with unique value propositions, activities, and resources</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {viabilityScore >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Viability Criterion: {viabilityScore}%</p>
                        <p className="text-sm text-muted-foreground">Sustainable revenue model with validated customer segments and cost structure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {scalabilityScore >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Scalability Criterion: {scalabilityScore}%</p>
                        <p className="text-sm text-muted-foreground">Clear growth through channels, partnerships, and customer relationships</p>
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
                  <CardDescription>Personalized tips based on your business model assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Building Block Improvement Guide</CardTitle>
                  <CardDescription>Specific guidance for each component</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Customer Segments</h4>
                      <p className="text-sm text-muted-foreground">Define 2-3 specific target segments with addressable market size, pain points, and willingness to pay. Provide evidence through market research and customer interviews.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Value Propositions</h4>
                      <p className="text-sm text-muted-foreground">Articulate unique innovation and competitive advantage. Demonstrate how your solution is 10x better than alternatives. Include evidence of customer validation.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Revenue Streams</h4>
                      <p className="text-sm text-muted-foreground">Detail pricing model with evidence of customer willingness to pay. Show path to £1M+ revenue within 3 years with realistic conversion rates and customer acquisition costs.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Key Partnerships</h4>
                      <p className="text-sm text-muted-foreground">Identify UK-based strategic partners that accelerate market entry and credibility. Include letters of support where possible to strengthen endorsement application.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Business Model Development Plan</CardTitle>
                  <CardDescription>Structured timeline to strengthen your business model for visa endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg hover-elevate"
                        data-testid={`action-item-${index}`}
                      >
                        <div className={`px-3 py-1 rounded text-xs font-medium ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {item.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.week}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsement Body Preparation</CardTitle>
                  <CardDescription>What endorsing bodies expect to see</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Complete Documentation</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>All 9 building blocks thoroughly detailed with supporting evidence</li>
                        <li>Market research demonstrating addressable market and competition</li>
                        <li>Financial projections aligned with revenue and cost components</li>
                        <li>Evidence of innovation through IP, technology, or unique processes</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Validation Evidence</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>Customer interviews or letters of intent from target segments</li>
                        <li>Partnership agreements or letters of support from UK organizations</li>
                        <li>Prototype, MVP, or proof of concept demonstrating value proposition</li>
                        <li>Competitive analysis showing differentiation and market gap</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Growth Demonstration</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>Clear plan to create 5+ jobs at £25,600+ within 3 years</li>
                        <li>Scalable distribution channels and go-to-market strategy</li>
                        <li>Path to £1M+ revenue with realistic milestones</li>
                        <li>Evidence of UK market opportunity and expansion potential</li>
                      </ul>
                    </div>
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
