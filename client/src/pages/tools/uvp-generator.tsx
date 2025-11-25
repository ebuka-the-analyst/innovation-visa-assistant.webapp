import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, Target, TrendingUp, Award, Lightbulb } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';

type CompetitorPosition = {
  name: string;
  innovation: number;
  marketFit: number;
};

type ValueComponent = {
  customerSegment: string;
  painPoint: string;
  solution: string;
  benefit: string;
  differentiation: string;
  quantifiableOutcome: string;
};

export default function UVPGenerator() {
  const [valueComponent, setValueComponent] = useState<ValueComponent>({
    customerSegment: '',
    painPoint: '',
    solution: '',
    benefit: '',
    differentiation: '',
    quantifiableOutcome: ''
  });
  const [generatedUVP, setGeneratedUVP] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorPosition[]>([
    { name: 'Your Solution', innovation: 75, marketFit: 80 }
  ]);
  const [scores, setScores] = useState({
    painSeverity: 70,
    solutionFit: 75,
    quantifiableBenefit: 65,
    emotionalAppeal: 70,
    competitiveDifferentiation: 70,
    innovationClarity: 75
  });
  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: '', innovation: 50, marketFit: 50 }]);
  };

  const updateCompetitor = (index: number, field: keyof CompetitorPosition, value: any) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
    setCompetitors(updated);
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const updateComponent = (field: keyof ValueComponent, value: string) => {
    setValueComponent(prev => ({ ...prev, [field]: value }));
  };

  const updateScore = (field: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [field]: value }));
  };

  const calculateUVPStrength = (): number => {
    const avgScore = Object.values(scores).reduce((sum, val) => sum + val, 0) / Object.keys(scores).length;
    return Math.round(avgScore);
  };

  const getUVPGrade = (score: number): string => {
    if (score >= 85) return 'A - Excellent';
    if (score >= 75) return 'B - Strong';
    if (score >= 65) return 'C - Good';
    if (score >= 55) return 'D - Fair';
    return 'F - Weak';
  };

  const generateUVP = () => {
    const { customerSegment, painPoint, solution, benefit, differentiation, quantifiableOutcome } = valueComponent;
    
    if (!customerSegment || !painPoint || !solution || !benefit) {
      setGeneratedUVP('Please fill in all required fields to generate your value proposition.');
      return;
    }

    const uvp = `For ${customerSegment} struggling with ${painPoint}, our ${solution} ${differentiation ? `uniquely ${differentiation}` : ''} helps you ${benefit}${quantifiableOutcome ? `, achieving ${quantifiableOutcome}` : ''}.`;
    setGeneratedUVP(uvp);
  };

  const getSerializedState = () => {
    return {
      valueComponent,
      generatedUVP,
      competitors,
      scores,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('valueComponent' in state) setValueComponent(state.valueComponent);
    if ('generatedUVP' in state) setGeneratedUVP(state.generatedUVP);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('scores' in state) setScores(state.scores);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('uvp-generator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('uvp-generator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('uvp-generator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const uvpStrength = calculateUVPStrength();
    
    if (scores.painSeverity < 70) {
      tips.push("Pain severity below 70 indicates weak market need. Endorsing bodies require evidence of critical customer pain points that validate genuine market demand. Conduct customer interviews to validate urgency and willingness to pay.");
    }
    
    if (scores.solutionFit < 70) {
      tips.push("Solution fit below 70 suggests weak problem-solution alignment. UK Innovator Founder visa requires demonstrable innovation that directly addresses customer needs. Strengthen the connection between your solution and the specific pain point.");
    }
    
    if (scores.quantifiableBenefit < 65) {
      tips.push("Quantifiable benefit lacks specificity. Endorsers prioritize measurable outcomes with concrete metrics. Replace vague benefits with specific numbers: percentage improvements, time savings, cost reductions, or revenue increases.");
    }
    
    if (scores.emotionalAppeal < 65) {
      tips.push("Emotional appeal is insufficient for customer connection. Strong value propositions resonate emotionally while delivering functional benefits. Identify customer aspirations, fears, or desires that your solution addresses.");
    }
    
    if (scores.competitiveDifferentiation < 70) {
      tips.push("Competitive differentiation is weak. Innovation criterion requires clear distinction from existing solutions. Articulate what makes your approach novel, defensible, or significantly superior to alternatives.");
    }
    
    if (scores.innovationClarity < 70) {
      tips.push("Innovation clarity needs improvement. Endorsing bodies must immediately grasp your innovation. Simplify technical language, use analogies, and clearly state what is new versus what exists in the market.");
    }
    
    if (!valueComponent.quantifiableOutcome || valueComponent.quantifiableOutcome.length < 20) {
      tips.push("Quantifiable outcome is missing or too brief. Add specific metrics with timeframes. Example: Reduce compliance errors by 80% within 3 months, saving applicants 40 hours and £5,000 in rejected application costs.");
    }
    
    if (!valueComponent.differentiation || valueComponent.differentiation.length < 20) {
      tips.push("Competitive differentiation is underdeveloped. Specify exactly how your solution differs from alternatives. Consider technology approach, delivery model, target market focus, or unique intellectual property.");
    }
    
    if (uvpStrength >= 80 && scores.painSeverity >= 75 && scores.quantifiableBenefit >= 70) {
      tips.push("Strong value proposition foundation. Focus on gathering customer validation evidence: testimonials, pilot results, letters of intent, or early adoption metrics to support endorsement application.");
    }
    
    if (competitors.length < 3) {
      tips.push("Add more competitors to competitive positioning analysis. Endorsers assess market landscape awareness. Include direct competitors, indirect alternatives, and emerging solutions to demonstrate comprehensive market understanding.");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Conduct 10-15 customer discovery interviews to validate pain severity and willingness to pay for your solution", 
        priority: "Critical" 
      },
      { 
        week: "Week 1", 
        action: "Document specific customer pain points with direct quotes, frequency data, and quantified impact on their business", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Research and document 5-10 competitive solutions (direct and indirect) with feature comparison matrix", 
        priority: "High" 
      },
      { 
        week: "Week 2", 
        action: "Quantify your solution benefits with specific metrics: time savings, cost reduction, revenue increase, or efficiency gains", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Articulate your unique differentiation: technology approach, delivery model, target market, or intellectual property", 
        priority: "Critical" 
      },
      { 
        week: "Week 2-3", 
        action: "Create evidence package: customer testimonials, pilot results, early traction metrics, or letters of intent", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Refine value proposition with specific customer segments, avoiding overly broad market definitions", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Test value proposition messaging with target customers and iterate based on clarity and resonance feedback", 
        priority: "High" 
      },
      { 
        week: "Week 3-4", 
        action: "Prepare market validation evidence: addressable market size with credible sources, growth trends, regulatory tailwinds", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Align value proposition with endorser evaluation criteria: innovation, viability, scalability, and team capability", 
        priority: "Critical" 
      },
      { 
        week: "Week 4", 
        action: "Create supporting materials: pitch deck, one-pager, FAQ document addressing common endorser questions", 
        priority: "Medium" 
      },
      { 
        week: "Ongoing", 
        action: "Update value proposition as you gather customer feedback, traction metrics, or competitive intelligence", 
        priority: "Medium" 
      }
    ];
  };

  const handleExport = () => {
    const uvpStrength = calculateUVPStrength();
    const grade = getUVPGrade(uvpStrength);
    
    const report = `UK INNOVATOR FOUNDER VISA - UNIQUE VALUE PROPOSITION GENERATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

UVP STRENGTH ASSESSMENT
${'-'.repeat(70)}
Overall UVP Strength: ${uvpStrength}% (${grade})
Status: ${uvpStrength >= 75 ? 'STRONG - Ready for endorsement pitch' : uvpStrength >= 65 ? 'GOOD - Strengthen key areas before submission' : 'WEAK - Critical improvements needed'}

COMPONENT SCORES
${'-'.repeat(70)}
Pain Severity: ${scores.painSeverity}/100
  ${scores.painSeverity >= 75 ? 'STRONG - Critical customer pain validates market need' : scores.painSeverity >= 60 ? 'MODERATE - Validate pain urgency with customer research' : 'WEAK - Insufficient evidence of critical pain point'}

Solution Fit: ${scores.solutionFit}/100
  ${scores.solutionFit >= 75 ? 'STRONG - Solution directly addresses customer pain' : scores.solutionFit >= 60 ? 'MODERATE - Strengthen problem-solution alignment' : 'WEAK - Solution may not effectively solve pain'}

Quantifiable Benefit: ${scores.quantifiableBenefit}/100
  ${scores.quantifiableBenefit >= 75 ? 'STRONG - Specific metrics demonstrate measurable value' : scores.quantifiableBenefit >= 60 ? 'MODERATE - Add more concrete quantification' : 'WEAK - Benefits too vague without metrics'}

Emotional Appeal: ${scores.emotionalAppeal}/100
  ${scores.emotionalAppeal >= 75 ? 'STRONG - Resonates with customer aspirations' : scores.emotionalAppeal >= 60 ? 'MODERATE - Strengthen emotional connection' : 'WEAK - Lacks compelling emotional narrative'}

Competitive Differentiation: ${scores.competitiveDifferentiation}/100
  ${scores.competitiveDifferentiation >= 75 ? 'STRONG - Clear distinction from alternatives' : scores.competitiveDifferentiation >= 60 ? 'MODERATE - Articulate unique advantages more clearly' : 'WEAK - Insufficient differentiation from competitors'}

Innovation Clarity: ${scores.innovationClarity}/100
  ${scores.innovationClarity >= 75 ? 'STRONG - Innovation immediately understandable' : scores.innovationClarity >= 60 ? 'MODERATE - Simplify innovation explanation' : 'WEAK - Innovation unclear or overly complex'}

GENERATED VALUE PROPOSITION
${'-'.repeat(70)}
${generatedUVP || 'VALUE PROPOSITION NOT YET GENERATED'}

VALUE PROPOSITION COMPONENTS
${'-'.repeat(70)}
Customer Segment:
${valueComponent.customerSegment || 'NOT SPECIFIED'}

Pain Point:
${valueComponent.painPoint || 'NOT SPECIFIED'}

Solution:
${valueComponent.solution || 'NOT SPECIFIED'}

Benefit:
${valueComponent.benefit || 'NOT SPECIFIED'}

Differentiation:
${valueComponent.differentiation || 'NOT SPECIFIED'}

Quantifiable Outcome:
${valueComponent.quantifiableOutcome || 'NOT SPECIFIED'}

COMPETITIVE POSITIONING
${'-'.repeat(70)}
${competitors.map((comp, i) => `
${i + 1}. ${comp.name || 'Unnamed Competitor'}
   Innovation Score: ${comp.innovation}/100
   Market Fit Score: ${comp.marketFit}/100
`).join('')}

UVP STRENGTH CALCULATION
${'-'.repeat(70)}
Formula: UVP Strength = Average of (Pain Severity + Solution Fit + Quantifiable Benefit + Emotional Appeal + Competitive Differentiation + Innovation Clarity)

Calculation:
  Sum = ${scores.painSeverity} + ${scores.solutionFit} + ${scores.quantifiableBenefit} + ${scores.emotionalAppeal} + ${scores.competitiveDifferentiation} + ${scores.innovationClarity}
  Sum = ${Object.values(scores).reduce((sum, val) => sum + val, 0)}
  UVP Strength = ${Object.values(scores).reduce((sum, val) => sum + val, 0)} / ${Object.keys(scores).length} = ${uvpStrength}% (${grade})

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(70)}
INNOVATION CRITERION ASSESSMENT:
${scores.innovationClarity >= 70 && scores.competitiveDifferentiation >= 70 
  ? `STRONG ALIGNMENT - Innovation clarity (${scores.innovationClarity}/100) and competitive differentiation (${scores.competitiveDifferentiation}/100) demonstrate novel approach to validated customer problem. Clear innovation narrative supports endorsement case.`
  : `MODERATE ALIGNMENT - Strengthen innovation clarity (currently ${scores.innovationClarity}/100) and competitive differentiation (${scores.competitiveDifferentiation}/100). Endorsers require immediate understanding of what is new and why it matters.`}

VIABILITY CRITERION ASSESSMENT:
${scores.painSeverity >= 70 && scores.quantifiableBenefit >= 70
  ? `STRONG ALIGNMENT - Pain severity (${scores.painSeverity}/100) validates genuine market need. Quantifiable benefits (${scores.quantifiableBenefit}/100) support customer acquisition and revenue potential.`
  : `MODERATE ALIGNMENT - Validate pain severity (currently ${scores.painSeverity}/100) with customer research. Quantify benefits (currently ${scores.quantifiableBenefit}/100) with specific metrics to demonstrate viability.`}

SCALABILITY CRITERION ASSESSMENT:
${scores.solutionFit >= 70 && scores.emotionalAppeal >= 65
  ? `STRONG ALIGNMENT - Solution fit (${scores.solutionFit}/100) and emotional appeal (${scores.emotionalAppeal}/100) suggest strong product-market fit enabling growth and customer retention.`
  : `MODERATE ALIGNMENT - Strengthen solution-problem alignment (currently ${scores.solutionFit}/100) and emotional appeal (${scores.emotionalAppeal}/100) to demonstrate scalability potential.`}

OVERALL VISA READINESS:
${uvpStrength >= 75 && scores.painSeverity >= 70 && scores.quantifiableBenefit >= 70
  ? `READY FOR ENDORSEMENT - Strong value proposition (${uvpStrength}%) with validated pain (${scores.painSeverity}/100) and quantified benefits (${scores.quantifiableBenefit}/100) demonstrates innovation, viability, and scalability for UK Innovator Founder visa.`
  : uvpStrength >= 65
  ? `NEARLY READY - Value proposition (${uvpStrength}%) is viable but strengthening pain validation (${scores.painSeverity}/100) and benefit quantification (${scores.quantifiableBenefit}/100) would improve endorsement case.`
  : `NOT YET READY - Value proposition (${uvpStrength}%) needs significant improvement. Focus on validating critical customer pain, demonstrating innovative solution approach, and quantifying specific measurable benefits before endorsement application.`}

ENDORSER PITCH REQUIREMENTS
${'-'.repeat(70)}
When presenting your value proposition to endorsing bodies:

1. CUSTOMER PAIN VALIDATION
   - Provide evidence of pain severity: customer interviews, survey data, industry reports
   - Quantify pain impact: costs incurred, time wasted, revenue lost, opportunities missed
   - Demonstrate urgency: why customers need solution now versus later

2. SOLUTION INNOVATION
   - Articulate what is new: technology, approach, business model, or target market
   - Explain why alternatives fall short: limitations of existing solutions
   - Show defensibility: intellectual property, technical moats, network effects

3. BENEFIT QUANTIFICATION
   - Specify measurable outcomes: percentage improvements, absolute numbers, timeframes
   - Provide evidence: pilot results, testimonials, early traction metrics
   - Compare to status quo: how much better versus current alternatives

4. COMPETITIVE DIFFERENTIATION
   - Name specific competitors or alternatives customers currently use
   - Explain unique advantages: features, performance, cost, experience, accessibility
   - Demonstrate sustainable differentiation: not easily replicable by competitors

5. MARKET VALIDATION
   - Show customer interest: letters of intent, pilot agreements, early revenue
   - Prove addressable market: size, growth rate, regulatory trends
   - Demonstrate team capability: relevant expertise, track record, advisors

VALUE PROPOSITION FORMULA
${'-'.repeat(70)}
For [specific customer segment with defined characteristics]
struggling with [critical pain point with quantified impact],
our [innovative solution with novel approach]
uniquely [key differentiation from alternatives]
helps you [primary benefit with emotional appeal],
achieving [specific quantifiable outcome with timeframe].

EXAMPLE - UK INNOVATOR FOUNDER VISA APPLICATION:
For UK Innovator Founder visa applicants (250-300 annually)
struggling with compliance errors causing 30-40% rejection rates and £50k+ resubmission costs,
our AI-powered real-time compliance verification platform
uniquely leverages natural language processing trained on 5 years of Home Office immigration rules
helps you submit error-free applications with confidence and peace of mind,
achieving 95% compliance accuracy, 40-hour time savings per application, and 80% rejection risk reduction validated across 100+ pilot users.

${'='.repeat(70)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Endorsing Bodies: Envestors, UKES, Innovator International, GEP, TechNation
Innovation Criterion: Novel solution addressing validated market need
Viability Criterion: Scalable business model with customer acquisition capability
Scalability Criterion: Significant growth potential in UK market
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uvp-generator-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uvpStrength = calculateUVPStrength();
  const grade = getUVPGrade(uvpStrength);

  const radarData = [
    { metric: 'Pain Severity', score: scores.painSeverity, target: 75 },
    { metric: 'Solution Fit', score: scores.solutionFit, target: 75 },
    { metric: 'Quantifiable', score: scores.quantifiableBenefit, target: 75 },
    { metric: 'Emotional', score: scores.emotionalAppeal, target: 75 },
    { metric: 'Differentiation', score: scores.competitiveDifferentiation, target: 75 },
    { metric: 'Clarity', score: scores.innovationClarity, target: 75 }
  ];

  const componentData = Object.entries(scores).map(([key, value]) => ({
    component: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    score: value,
    target: 75
  }));

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    awareness: Math.min(100, (scores.emotionalAppeal / 100) * (i + 1) * 9),
    conversion: Math.min(100, (scores.solutionFit / 100) * (i + 1) * 7),
    retention: Math.min(100, (scores.quantifiableBenefit / 100) * (i + 1) * 8)
  }));

  const competitivePositionData = competitors.map(comp => ({
    name: comp.name || 'Unnamed',
    innovation: comp.innovation,
    marketFit: comp.marketFit,
    size: comp.name === 'Your Solution' ? 300 : 150
  }));

  const CHART_COLORS = {
    primary: '#ffa536',
    success: '#10b981',
    info: '#11b6e9',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-uvp-generator">Unique Value Proposition Generator</h1>
            <p className="text-lg text-muted-foreground">Create compelling value proposition demonstrating innovation and viability</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="uvp-generator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="UVP Generator"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-uvp-generator">
              <TabsTrigger value="builder" data-testid="tab-builder">Builder</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="competitive" data-testid="tab-competitive">Competitive</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={uvpStrength >= 75 ? "border-green-500" : uvpStrength >= 65 ? "border-orange-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">UVP Strength</p>
                      <p className="text-3xl font-bold" data-testid="text-uvp-strength">{uvpStrength}%</p>
                      <p className="text-sm mt-1">{grade}</p>
                      <Progress value={uvpStrength} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-1">Pain Severity</p>
                      <p className="text-2xl font-bold" data-testid="text-pain-severity">{scores.painSeverity}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Lightbulb className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-1">Solution Fit</p>
                      <p className="text-2xl font-bold" data-testid="text-solution-fit">{scores.solutionFit}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-1">Quantifiable</p>
                      <p className="text-2xl font-bold" data-testid="text-quantifiable">{scores.quantifiableBenefit}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {uvpStrength < 65 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    UVP strength below 65% indicates significant gaps. Endorsing bodies require clear, compelling value propositions. Strengthen pain validation, solution innovation, and benefit quantification before submission.
                  </AlertDescription>
                </Alert>
              )}

              {uvpStrength >= 65 && uvpStrength < 75 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    UVP is viable but could be stronger. Aim for 75%+ by improving weaker components. Review Smart Tips for specific recommendations.
                  </AlertDescription>
                </Alert>
              )}

              {uvpStrength >= 75 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Strong value proposition foundation. Focus on gathering customer validation evidence to support endorsement application.
                  </AlertDescription>
                </Alert>
              )}

              {generatedUVP && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <Award className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Generated Value Proposition</h3>
                        <p className="text-lg leading-relaxed" data-testid="text-generated-uvp">{generatedUVP}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Value Proposition Builder</CardTitle>
                  <CardDescription>Define your unique value proposition components for UK Innovator Founder visa endorsement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer-segment">Target Customer Segment (Who are you serving?)</Label>
                    <Textarea
                      id="customer-segment"
                      value={valueComponent.customerSegment}
                      onChange={(e) => updateComponent('customerSegment', e.target.value)}
                      placeholder="e.g., UK Innovator Founder visa applicants seeking endorsement approval"
                      rows={2}
                      data-testid="textarea-customer-segment"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pain-point">Critical Pain Point (What problem do they face?)</Label>
                    <Textarea
                      id="pain-point"
                      value={valueComponent.painPoint}
                      onChange={(e) => updateComponent('painPoint', e.target.value)}
                      placeholder="e.g., High compliance error rates causing 30-40% application rejections and £50k+ resubmission costs"
                      rows={2}
                      data-testid="textarea-pain-point"
                    />
                  </div>

                  <div>
                    <Label htmlFor="solution">Your Innovative Solution (How do you solve it?)</Label>
                    <Textarea
                      id="solution"
                      value={valueComponent.solution}
                      onChange={(e) => updateComponent('solution', e.target.value)}
                      placeholder="e.g., AI-powered real-time compliance verification platform"
                      rows={2}
                      data-testid="textarea-solution"
                    />
                  </div>

                  <div>
                    <Label htmlFor="benefit">Primary Benefit (What value do they get?)</Label>
                    <Textarea
                      id="benefit"
                      value={valueComponent.benefit}
                      onChange={(e) => updateComponent('benefit', e.target.value)}
                      placeholder="e.g., Submit error-free applications with confidence and peace of mind"
                      rows={2}
                      data-testid="textarea-benefit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="differentiation">Competitive Differentiation (What makes you unique?)</Label>
                    <Textarea
                      id="differentiation"
                      value={valueComponent.differentiation}
                      onChange={(e) => updateComponent('differentiation', e.target.value)}
                      placeholder="e.g., Leverages NLP trained on 5 years of Home Office immigration rules, unlike generic compliance tools"
                      rows={2}
                      data-testid="textarea-differentiation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantifiable-outcome">Quantifiable Outcome (What measurable results?)</Label>
                    <Textarea
                      id="quantifiable-outcome"
                      value={valueComponent.quantifiableOutcome}
                      onChange={(e) => updateComponent('quantifiableOutcome', e.target.value)}
                      placeholder="e.g., 95% compliance accuracy, 40-hour time savings, 80% rejection risk reduction across 100+ users"
                      rows={2}
                      data-testid="textarea-quantifiable-outcome"
                    />
                  </div>

                  <Button 
                    onClick={generateUVP} 
                    className="w-full" 
                    size="lg"
                    data-testid="button-generate-uvp"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Generate Value Proposition
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UVP Component Scores</CardTitle>
                  <CardDescription>Rate each component based on customer feedback and market validation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="pain-severity-slider">Pain Severity: {scores.painSeverity}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.painSeverity >= 75 ? 'Critical' : scores.painSeverity >= 60 ? 'Moderate' : 'Low'}
                      </span>
                    </div>
                    <Slider
                      id="pain-severity-slider"
                      value={[scores.painSeverity]}
                      onValueChange={(v) => updateScore('painSeverity', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-pain-severity"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="solution-fit-slider">Solution Fit: {scores.solutionFit}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.solutionFit >= 75 ? 'Excellent' : scores.solutionFit >= 60 ? 'Good' : 'Weak'}
                      </span>
                    </div>
                    <Slider
                      id="solution-fit-slider"
                      value={[scores.solutionFit]}
                      onValueChange={(v) => updateScore('solutionFit', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-solution-fit"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="quantifiable-benefit-slider">Quantifiable Benefit: {scores.quantifiableBenefit}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.quantifiableBenefit >= 75 ? 'Strong' : scores.quantifiableBenefit >= 60 ? 'Moderate' : 'Weak'}
                      </span>
                    </div>
                    <Slider
                      id="quantifiable-benefit-slider"
                      value={[scores.quantifiableBenefit]}
                      onValueChange={(v) => updateScore('quantifiableBenefit', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-quantifiable-benefit"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="emotional-appeal-slider">Emotional Appeal: {scores.emotionalAppeal}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.emotionalAppeal >= 75 ? 'High' : scores.emotionalAppeal >= 60 ? 'Moderate' : 'Low'}
                      </span>
                    </div>
                    <Slider
                      id="emotional-appeal-slider"
                      value={[scores.emotionalAppeal]}
                      onValueChange={(v) => updateScore('emotionalAppeal', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-emotional-appeal"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="competitive-differentiation-slider">Competitive Differentiation: {scores.competitiveDifferentiation}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.competitiveDifferentiation >= 75 ? 'Strong' : scores.competitiveDifferentiation >= 60 ? 'Moderate' : 'Weak'}
                      </span>
                    </div>
                    <Slider
                      id="competitive-differentiation-slider"
                      value={[scores.competitiveDifferentiation]}
                      onValueChange={(v) => updateScore('competitiveDifferentiation', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-competitive-differentiation"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="innovation-clarity-slider">Innovation Clarity: {scores.innovationClarity}</Label>
                      <span className="text-sm text-muted-foreground">
                        {scores.innovationClarity >= 75 ? 'Clear' : scores.innovationClarity >= 60 ? 'Moderate' : 'Unclear'}
                      </span>
                    </div>
                    <Slider
                      id="innovation-clarity-slider"
                      value={[scores.innovationClarity]}
                      onValueChange={(v) => updateScore('innovationClarity', v[0])}
                      max={100}
                      step={5}
                      data-testid="slider-innovation-clarity"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>UVP Component Analysis</CardTitle>
                    <CardDescription>Breakdown of value proposition strength by component</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                          name="Current Score" 
                          dataKey="score" 
                          stroke={CHART_COLORS.primary} 
                          fill={CHART_COLORS.primary} 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Target" 
                          dataKey="target" 
                          stroke={CHART_COLORS.success} 
                          fill={CHART_COLORS.success} 
                          fillOpacity={0.3} 
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Score Comparison</CardTitle>
                    <CardDescription>Visual comparison against 75% target threshold</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={componentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="component" 
                          angle={-45} 
                          textAnchor="end" 
                          height={120}
                          interval={0}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Current Score" fill={CHART_COLORS.primary}>
                          {componentData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.score >= 75 ? CHART_COLORS.success : entry.score >= 60 ? CHART_COLORS.warning : CHART_COLORS.danger} 
                            />
                          ))}
                        </Bar>
                        <Bar dataKey="target" name="Target (75%)" fill={CHART_COLORS.success} opacity={0.3} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Value Proposition Impact Projection</CardTitle>
                  <CardDescription>Projected customer awareness, conversion, and retention over 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="awareness" 
                        name="Brand Awareness" 
                        stroke={CHART_COLORS.info} 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="conversion" 
                        name="Customer Conversion" 
                        stroke={CHART_COLORS.success} 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="retention" 
                        name="Customer Retention" 
                        stroke={CHART_COLORS.purple} 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Criterion Alignment</CardTitle>
                  <CardDescription>How your value proposition supports UK Innovator Founder visa criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {scores.innovationClarity >= 70 && scores.competitiveDifferentiation >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Innovation Criterion</p>
                        <p className="text-sm text-muted-foreground">
                          {scores.innovationClarity >= 70 && scores.competitiveDifferentiation >= 70
                            ? `Strong alignment - Innovation clarity (${scores.innovationClarity}) and differentiation (${scores.competitiveDifferentiation}) demonstrate novel approach`
                            : `Strengthen innovation clarity (${scores.innovationClarity}) and differentiation (${scores.competitiveDifferentiation}) to demonstrate novelty`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {scores.painSeverity >= 70 && scores.quantifiableBenefit >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Viability Criterion</p>
                        <p className="text-sm text-muted-foreground">
                          {scores.painSeverity >= 70 && scores.quantifiableBenefit >= 70
                            ? `Strong alignment - Pain severity (${scores.painSeverity}) validates market need. Benefits (${scores.quantifiableBenefit}) support revenue potential`
                            : `Validate pain severity (${scores.painSeverity}) and quantify benefits (${scores.quantifiableBenefit}) to demonstrate viability`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {scores.solutionFit >= 70 && scores.emotionalAppeal >= 65 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Scalability Criterion</p>
                        <p className="text-sm text-muted-foreground">
                          {scores.solutionFit >= 70 && scores.emotionalAppeal >= 65
                            ? `Strong alignment - Solution fit (${scores.solutionFit}) and emotional appeal (${scores.emotionalAppeal}) suggest strong PMF for growth`
                            : `Strengthen solution fit (${scores.solutionFit}) and emotional appeal (${scores.emotionalAppeal}) to demonstrate scalability`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Positioning Matrix</CardTitle>
                  <CardDescription>Map your solution against competitors on innovation and market fit dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="innovation" 
                        name="Innovation Score" 
                        domain={[0, 100]}
                        label={{ value: 'Innovation Score', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="marketFit" 
                        name="Market Fit Score" 
                        domain={[0, 100]}
                        label={{ value: 'Market Fit Score', angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis type="number" dataKey="size" range={[100, 400]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm">Innovation: {data.innovation}</p>
                                <p className="text-sm">Market Fit: {data.marketFit}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Solutions" data={competitivePositionData} fill={CHART_COLORS.primary}>
                        {competitivePositionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Your Solution' ? CHART_COLORS.success : CHART_COLORS.info} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                      Add Competitor
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {competitors.map((competitor, index) => (
                      <Card key={index} className={competitor.name === 'Your Solution' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div>
                              <Label htmlFor={`competitor-name-${index}`}>
                                {competitor.name === 'Your Solution' ? 'Your Solution Name' : 'Competitor Name'}
                              </Label>
                              <Input
                                id={`competitor-name-${index}`}
                                value={competitor.name}
                                onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                                placeholder="e.g., Manual compliance review services"
                                data-testid={`input-competitor-name-${index}`}
                                disabled={competitor.name === 'Your Solution'}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`competitor-innovation-${index}`}>Innovation Score: {competitor.innovation}</Label>
                              <Slider
                                id={`competitor-innovation-${index}`}
                                value={[competitor.innovation]}
                                onValueChange={(v) => updateCompetitor(index, 'innovation', v[0])}
                                max={100}
                                step={5}
                                data-testid={`slider-competitor-innovation-${index}`}
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <Label htmlFor={`competitor-marketfit-${index}`}>Market Fit: {competitor.marketFit}</Label>
                                <Slider
                                  id={`competitor-marketfit-${index}`}
                                  value={[competitor.marketFit]}
                                  onValueChange={(v) => updateCompetitor(index, 'marketFit', v[0])}
                                  max={100}
                                  step={5}
                                  data-testid={`slider-competitor-marketfit-${index}`}
                                />
                              </div>
                              {competitor.name !== 'Your Solution' && competitors.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCompetitor(index)}
                                  data-testid={`button-remove-competitor-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Differentiation Assessment</CardTitle>
                  <CardDescription>Key factors distinguishing your solution from alternatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Novel Technology or Approach</p>
                        <p className="text-sm text-muted-foreground">
                          Your solution uses innovative methods not employed by competitors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Specific Target Market Focus</p>
                        <p className="text-sm text-muted-foreground">
                          Specialized positioning in underserved segment versus broad market approach
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Superior User Experience or Accessibility</p>
                        <p className="text-sm text-muted-foreground">
                          Significantly easier, faster, or more intuitive than alternatives
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Intellectual Property Protection</p>
                        <p className="text-sm text-muted-foreground">
                          Patents, proprietary algorithms, or trade secrets creating defensible moat
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Cost or Performance Advantage</p>
                        <p className="text-sm text-muted-foreground">
                          Demonstrably better outcomes or significantly lower costs versus alternatives
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips - UVP Optimization</CardTitle>
                  <CardDescription>AI-powered recommendations based on your current value proposition assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, i) => (
                      <Alert key={i}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Value Proposition Best Practices</CardTitle>
                  <CardDescription>Essential elements for endorsing body evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Specific Customer Segment</p>
                        <p className="text-sm text-muted-foreground">
                          Narrow, well-defined target with clear characteristics versus broad market claims
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Validated Critical Pain</p>
                        <p className="text-sm text-muted-foreground">
                          Evidence-based pain point with customer quotes, survey data, or market research
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Innovative Solution Clarity</p>
                        <p className="text-sm text-muted-foreground">
                          Non-technical explanation of what is new and why it matters to customers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Measurable Outcomes</p>
                        <p className="text-sm text-muted-foreground">
                          Specific metrics with timeframes: percentages, absolutes, comparisons to status quo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">5</span>
                      </div>
                      <div>
                        <p className="font-medium">Competitive Context</p>
                        <p className="text-sm text-muted-foreground">
                          Named alternatives and clear explanation of unique advantages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <span className="text-lg font-bold text-primary">6</span>
                      </div>
                      <div>
                        <p className="font-medium">Customer Validation</p>
                        <p className="text-sm text-muted-foreground">
                          Early adopters, pilot results, testimonials, or letters of intent
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Value Proposition Development Plan</CardTitle>
                  <CardDescription>Structured timeline for validating and strengthening your UVP for endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-lg border ${
                          item.priority === 'Critical' 
                            ? 'border-red-200 bg-red-50 dark:bg-red-950' 
                            : item.priority === 'High'
                            ? 'border-orange-200 bg-orange-50 dark:bg-orange-950'
                            : 'border-blue-200 bg-blue-50 dark:bg-blue-950'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical'
                              ? 'bg-red-500 text-white'
                              : item.priority === 'High'
                              ? 'bg-orange-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorser Presentation Checklist</CardTitle>
                  <CardDescription>Critical elements for value proposition pitch to endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Customer Pain Evidence Package</p>
                        <p className="text-sm text-muted-foreground">
                          Interview transcripts, survey results, or industry reports validating pain severity
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Innovation Demonstration</p>
                        <p className="text-sm text-muted-foreground">
                          Visual mockups, demos, or technical documentation showing novel approach
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Quantified Outcome Evidence</p>
                        <p className="text-sm text-muted-foreground">
                          Pilot results, beta user metrics, or calculated projections with assumptions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Competitive Analysis Matrix</p>
                        <p className="text-sm text-muted-foreground">
                          Side-by-side comparison showing clear advantages versus named alternatives
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Customer Testimonials or Letters of Intent</p>
                        <p className="text-sm text-muted-foreground">
                          Direct customer validation showing willingness to adopt or pay
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Size and Growth Data</p>
                        <p className="text-sm text-muted-foreground">
                          UK-specific addressable market with credible sources and growth projections
                        </p>
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
