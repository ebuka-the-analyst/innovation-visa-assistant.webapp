import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, Target, Shield, Star, Award, TrendingUp, Lightbulb } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type USPDimension = {
  name: string;
  score: number;
  evidenceProvided: boolean;
  evidenceNotes: string;
};

type CompetitorComparison = {
  competitor: string;
  uniquenessGap: number;
  sustainabilityThreat: number;
};

export default function USPValidator() {
  const [uspStatement, setUspStatement] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [keyDifferentiators, setKeyDifferentiators] = useState('');
  const [competitiveMoat, setCompetitiveMoat] = useState('');
  const [innovationEvidence, setInnovationEvidence] = useState('');
  
  const [dimensions, setDimensions] = useState<USPDimension[]>([
    { name: 'Uniqueness', score: 70, evidenceProvided: false, evidenceNotes: '' },
    { name: 'Relevance', score: 75, evidenceProvided: false, evidenceNotes: '' },
    { name: 'Defensibility', score: 65, evidenceProvided: false, evidenceNotes: '' },
    { name: 'Clarity', score: 80, evidenceProvided: false, evidenceNotes: '' },
    { name: 'Sustainability', score: 70, evidenceProvided: false, evidenceNotes: '' },
    { name: 'Market Validation', score: 60, evidenceProvided: false, evidenceNotes: '' }
  ]);

  const [competitors, setCompetitors] = useState<CompetitorComparison[]>([
    { competitor: 'Competitor A', uniquenessGap: 25, sustainabilityThreat: 15 },
    { competitor: 'Competitor B', uniquenessGap: 35, sustainabilityThreat: 20 }
  ]);

  const [activeTab, setActiveTab] = useState('validator');
  const [savedDate, setSavedDate] = useState('');

  const uspStrengthScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
  const evidenceCompleteness = Math.round((dimensions.filter(d => d.evidenceProvided).length / dimensions.length) * 100);
  const innovationReadiness = uspStrengthScore >= 75 && evidenceCompleteness >= 70;

  const getUSPGrade = (): string => {
    if (uspStrengthScore >= 85) return 'A - Excellent';
    if (uspStrengthScore >= 75) return 'B - Strong';
    if (uspStrengthScore >= 65) return 'C - Good';
    if (uspStrengthScore >= 55) return 'D - Fair';
    return 'F - Weak';
  };

  const updateDimension = (index: number, field: keyof USPDimension, value: any) => {
    const updated = [...dimensions];
    updated[index] = { ...updated[index], [field]: value };
    setDimensions(updated);
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, { competitor: '', uniquenessGap: 0, sustainabilityThreat: 0 }]);
  };

  const updateCompetitor = (index: number, field: keyof CompetitorComparison, value: any) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
    setCompetitors(updated);
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const radarData = dimensions.map(d => ({
    dimension: d.name,
    score: d.score,
    target: 75
  }));

  const competitiveAnalysisData = competitors.map(c => ({
    name: c.competitor || 'Unnamed',
    uniquenessGap: c.uniquenessGap,
    threat: c.sustainabilityThreat
  }));

  const evidenceByDimension = dimensions.map(d => ({
    dimension: d.name,
    provided: d.evidenceProvided ? 100 : 0,
    missing: d.evidenceProvided ? 0 : 100
  }));

  const uspTrendData = [
    { month: 'Month 1', strength: Math.max(40, uspStrengthScore - 30) },
    { month: 'Month 2', strength: Math.max(50, uspStrengthScore - 20) },
    { month: 'Month 3', strength: Math.max(60, uspStrengthScore - 10) },
    { month: 'Current', strength: uspStrengthScore },
    { month: 'Target', strength: 85 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const getSerializedState = () => {
    return {
      uspStatement,
      targetCustomer,
      keyDifferentiators,
      competitiveMoat,
      innovationEvidence,
      dimensions,
      competitors,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('uspStatement' in state) setUspStatement(state.uspStatement);
    if ('targetCustomer' in state) setTargetCustomer(state.targetCustomer);
    if ('keyDifferentiators' in state) setKeyDifferentiators(state.keyDifferentiators);
    if ('competitiveMoat' in state) setCompetitiveMoat(state.competitiveMoat);
    if ('innovationEvidence' in state) setInnovationEvidence(state.innovationEvidence);
    if ('dimensions' in state) setDimensions(state.dimensions);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'usp-validator_handoff';
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
      const saved = localStorage.getItem('usp-validator-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('usp-validator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('usp-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (uspStrengthScore < 65) {
      tips.push("Critical: USP strength below 65% - endorsing bodies require clear differentiation for innovation criterion. Focus on strengthening uniqueness and defensibility dimensions.");
    }
    
    const uniqueness = dimensions.find(d => d.name === 'Uniqueness');
    if (uniqueness && uniqueness.score < 70) {
      tips.push("Uniqueness score below 70 indicates insufficient differentiation. Document specific novel features, patents, or proprietary technology that competitors cannot easily replicate.");
    }
    
    const defensibility = dimensions.find(d => d.name === 'Defensibility');
    if (defensibility && defensibility.score < 65) {
      tips.push("Weak competitive moat (defensibility <65). Build barriers to entry through: IP protection, network effects, regulatory advantages, or proprietary data/technology assets.");
    }
    
    if (evidenceCompleteness < 50) {
      tips.push("Evidence completeness below 50% is insufficient for visa endorsement. Provide concrete proof for each USP dimension: customer testimonials, market research, technical specifications, competitive analysis.");
    }
    
    const marketValidation = dimensions.find(d => d.name === 'Market Validation');
    if (marketValidation && marketValidation.score < 60) {
      tips.push("Market validation score low - conduct customer interviews, surveys, or pilot programs to demonstrate real market demand for your unique offering.");
    }
    
    if (!innovationEvidence || innovationEvidence.length < 100) {
      tips.push("Innovation evidence insufficient. Document technical innovations, research publications, patent applications, or novel methodologies that demonstrate genuine innovation beyond incremental improvements.");
    }
    
    const avgGap = competitors.reduce((sum, c) => sum + c.uniquenessGap, 0) / Math.max(competitors.length, 1);
    if (avgGap < 30) {
      tips.push("Competitive differentiation gap averaging below 30% suggests weak positioning. Articulate clear advantages that create 40%+ value gap versus established alternatives.");
    }
    
    const clarity = dimensions.find(d => d.name === 'Clarity');
    if (clarity && clarity.score < 75) {
      tips.push("USP clarity below 75 makes it difficult for endorsers and customers to understand your value. Simplify messaging to one clear sentence that non-experts can immediately grasp.");
    }
    
    if (uspStrengthScore >= 80 && evidenceCompleteness >= 70) {
      tips.push("Strong USP foundation (80%+) with solid evidence. Focus on maintaining defensibility and expanding market validation through customer traction metrics.");
    }
    
    if (!competitiveMoat || competitiveMoat.length < 50) {
      tips.push("Competitive moat description missing or insufficient. Detail specific barriers preventing competitors from copying your approach: technology complexity, regulatory approvals, network effects, switching costs.");
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Document all unique features and innovations - create detailed comparison matrix showing clear differentiation from top 3 competitors", priority: "Critical" },
      { week: "Week 1", action: "Gather innovation evidence: technical specifications, patent applications, research publications, or novel methodology documentation", priority: "Critical" },
      { week: "Week 1-2", action: "Conduct competitive analysis - identify exact gaps where your solution delivers 30%+ superior value", priority: "High" },
      { week: "Week 2", action: "Validate market need - conduct minimum 10 customer interviews, gather testimonials, or secure letters of intent", priority: "Critical" },
      { week: "Week 2", action: "Assess and document competitive moat - identify barriers to entry (IP, network effects, data advantages, regulatory protection)", priority: "Critical" },
      { week: "Week 2-3", action: "Strengthen weak USP dimensions scoring below 70 - gather specific evidence and refine positioning", priority: "High" },
      { week: "Week 3", action: "Create clear, jargon-free USP statement that non-experts can understand in 10 seconds", priority: "High" },
      { week: "Week 3", action: "Document sustainability plan - how will you maintain competitive advantage over 3-5 years as market evolves", priority: "High" },
      { week: "Week 3-4", action: "Compile comprehensive evidence package for each USP dimension with tangible proof points", priority: "Critical" },
      { week: "Week 4", action: "Test USP messaging with target customers and endorser-type stakeholders for clarity and impact", priority: "High" },
      { week: "Week 4", action: "Review and refine all dimensions to achieve 75%+ scores with complete evidence documentation", priority: "Critical" },
      { week: "Ongoing", action: "Track competitive landscape monthly - monitor new entrants and evolving customer needs to maintain differentiation", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - USP VALIDATOR REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
USP Strength Score: ${uspStrengthScore}% (${getUSPGrade()})
Evidence Completeness: ${evidenceCompleteness}%
Innovation Readiness: ${innovationReadiness ? 'READY' : 'NEEDS IMPROVEMENT'}

Status: ${uspStrengthScore >= 75 && evidenceCompleteness >= 70 ? 'STRONG - Ready for endorsement submission' : uspStrengthScore >= 65 ? 'GOOD - Strengthen evidence and weak dimensions' : 'WEAK - Significant improvements required'}

USP STATEMENT
${'-'.repeat(80)}
${uspStatement || 'Not provided'}

TARGET CUSTOMER
${'-'.repeat(80)}
${targetCustomer || 'Not specified'}

KEY DIFFERENTIATORS
${'-'.repeat(80)}
${keyDifferentiators || 'Not documented'}

COMPETITIVE MOAT
${'-'.repeat(80)}
${competitiveMoat || 'Not defined'}

INNOVATION EVIDENCE
${'-'.repeat(80)}
${innovationEvidence || 'Not provided'}

USP DIMENSION ANALYSIS
${'-'.repeat(80)}
${dimensions.map((d, i) => `
${i + 1}. ${d.name}: ${d.score}/100
   Evidence Provided: ${d.evidenceProvided ? 'YES' : 'NO'}
   Evidence Notes: ${d.evidenceNotes || 'None'}
   Status: ${d.score >= 75 ? 'Strong' : d.score >= 65 ? 'Good' : d.score >= 55 ? 'Fair' : 'Weak'}
`).join('')}

USP STRENGTH CALCULATION
${'-'.repeat(80)}
Formula: Average of all dimension scores
Calculation: (${dimensions.map(d => d.score).join(' + ')}) / ${dimensions.length} = ${uspStrengthScore}%

Component Breakdown:
${dimensions.map(d => `  ${d.name}: ${d.score}/100`).join('\n')}

Evidence Completeness: ${dimensions.filter(d => d.evidenceProvided).length}/${dimensions.length} dimensions = ${evidenceCompleteness}%

COMPETITIVE ANALYSIS
${'-'.repeat(80)}
${competitors.map((c, i) => `
${i + 1}. ${c.competitor || 'Unnamed Competitor'}
   Uniqueness Gap: ${c.uniquenessGap}%
   Sustainability Threat: ${c.sustainabilityThreat}%
   Assessment: ${c.uniquenessGap >= 40 ? 'Strong differentiation' : c.uniquenessGap >= 25 ? 'Moderate differentiation' : 'Weak differentiation - strengthen positioning'}
`).join('')}

Average Uniqueness Gap: ${Math.round(competitors.reduce((sum, c) => sum + c.uniquenessGap, 0) / Math.max(competitors.length, 1))}%
Average Sustainability Threat: ${Math.round(competitors.reduce((sum, c) => sum + c.sustainabilityThreat, 0) / Math.max(competitors.length, 1))}%

UK INNOVATOR FOUNDER VISA - INNOVATION CRITERION ALIGNMENT
${'-'.repeat(80)}
GOV.UK Innovation Assessment Requirements:
1. Clear differentiation from existing market solutions
2. Novel approach to solving customer problems
3. Sustainable competitive advantage
4. Defensible market position
5. Evidence of genuine innovation

Current Alignment:
Uniqueness Score: ${dimensions.find(d => d.name === 'Uniqueness')?.score || 0}/100
  ${(dimensions.find(d => d.name === 'Uniqueness')?.score || 0) >= 75 ? 'STRONG - Clear innovation and differentiation demonstrated' : (dimensions.find(d => d.name === 'Uniqueness')?.score || 0) >= 60 ? 'MODERATE - Strengthen unique elements and evidence' : 'WEAK - Insufficient differentiation for innovation criterion'}

Defensibility Score: ${dimensions.find(d => d.name === 'Defensibility')?.score || 0}/100
  ${(dimensions.find(d => d.name === 'Defensibility')?.score || 0) >= 75 ? 'STRONG - Sustainable competitive advantage established' : (dimensions.find(d => d.name === 'Defensibility')?.score || 0) >= 60 ? 'MODERATE - Build stronger barriers to entry' : 'WEAK - Easily copied by competitors'}

Market Validation: ${dimensions.find(d => d.name === 'Market Validation')?.score || 0}/100
  ${(dimensions.find(d => d.name === 'Market Validation')?.score || 0) >= 75 ? 'STRONG - Proven market demand' : (dimensions.find(d => d.name === 'Market Validation')?.score || 0) >= 60 ? 'MODERATE - Gather more customer evidence' : 'WEAK - Insufficient market validation'}

Innovation Evidence: ${innovationEvidence ? 'Provided' : 'Missing'}
  ${innovationEvidence && innovationEvidence.length >= 100 ? 'Comprehensive innovation documentation supports visa application' : 'Insufficient - provide detailed technical specifications, patents, or novel methodology evidence'}

Overall Innovation Readiness: ${innovationReadiness ? 'READY FOR ENDORSEMENT' : 'NEEDS IMPROVEMENT'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSER SUBMISSION READINESS
${'-'.repeat(80)}
Minimum Requirements for Strong Application:
- USP Strength Score: 75%+ (Current: ${uspStrengthScore}%) ${uspStrengthScore >= 75 ? 'MEETS' : 'BELOW'}
- Evidence Completeness: 70%+ (Current: ${evidenceCompleteness}%) ${evidenceCompleteness >= 70 ? 'MEETS' : 'BELOW'}
- Innovation Evidence: Comprehensive documentation ${innovationEvidence && innovationEvidence.length >= 100 ? 'MEETS' : 'INSUFFICIENT'}
- Competitive Differentiation: 30%+ average gap ${Math.round(competitors.reduce((sum, c) => sum + c.uniquenessGap, 0) / Math.max(competitors.length, 1)) >= 30 ? 'MEETS' : 'BELOW'}

Overall Readiness: ${uspStrengthScore >= 75 && evidenceCompleteness >= 70 ? 'READY - Strong application' : uspStrengthScore >= 65 ? 'NEAR READY - Address weak areas' : 'NOT READY - Significant work required'}

KEY FOCUS AREAS
${'-'.repeat(80)}
${dimensions.filter(d => d.score < 70).length > 0 ? `
Low-Scoring Dimensions (Priority Focus):
${dimensions.filter(d => d.score < 70).map(d => `- ${d.name}: ${d.score}/100 - Strengthen with evidence and improvements`).join('\n')}
` : 'All dimensions meet minimum thresholds'}

${dimensions.filter(d => !d.evidenceProvided).length > 0 ? `
Missing Evidence (Urgent):
${dimensions.filter(d => !d.evidenceProvided).map(d => `- ${d.name}: Provide supporting documentation`).join('\n')}
` : 'Evidence complete for all dimensions'}

NEXT STEPS
${'-'.repeat(80)}
1. Address all dimensions scoring below 70/100
2. Gather concrete evidence for dimensions lacking proof
3. Strengthen competitive moat and barriers to entry
4. Validate market need with customer testimonials/data
5. Document innovation evidence comprehensively
6. Review and refine USP clarity for non-expert understanding

${'='.repeat(80)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Innovation Criterion: Novel approach with clear differentiation
Scalability Criterion: Defensible competitive advantage
Endorsing Bodies: Envestors, UKES, Innovator International, GEP

Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usp-validator-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-usp-validator">USP Validator</h1>
            <p className="text-lg text-muted-foreground">Assess unique selling proposition strength and innovation evidence</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="usp-validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="USP Validator"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-usp-validator">
              <TabsTrigger value="validator" data-testid="tab-validator">Validator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="competitive" data-testid="tab-competitive">Competitive</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="validator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>USP Strength Assessment</CardTitle>
                  <CardDescription>UK Innovator Founder Visa requires demonstrable innovation and competitive differentiation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={uspStrengthScore >= 75 ? "border-green-500" : uspStrengthScore >= 65 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">USP Strength</p>
                          <p className="text-3xl font-bold" data-testid="text-usp-strength">{uspStrengthScore}%</p>
                          <p className="text-sm mt-2">{getUSPGrade()}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {uspStrengthScore >= 75 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : uspStrengthScore >= 65 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{uspStrengthScore >= 75 ? 'Strong' : uspStrengthScore >= 65 ? 'Good' : 'Weak'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={evidenceCompleteness >= 70 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Evidence Completeness</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-evidence-completeness">{evidenceCompleteness}%</p>
                          <Progress value={evidenceCompleteness} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">{dimensions.filter(d => d.evidenceProvided).length}/{dimensions.length} dimensions</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={innovationReadiness ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Innovation Readiness</p>
                          <div className="flex items-center justify-center my-3">
                            {innovationReadiness ? (
                              <CheckCircle2 className="h-12 w-12 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-12 w-12 text-orange-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium">{innovationReadiness ? 'Ready for Endorsement' : 'Needs Improvement'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {uspStrengthScore < 65 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        USP strength below 65% is insufficient for innovation criterion. Strengthen differentiation, defensibility, and market validation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {evidenceCompleteness < 50 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Evidence completeness below 50% - endorsers require concrete proof for each USP dimension. Provide documentation, testimonials, and validation data.
                      </AlertDescription>
                    </Alert>
                  )}

                  {innovationReadiness && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! USP demonstrates strong innovation with solid evidence. Focus on maintaining defensibility and gathering customer traction data.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="usp-statement">USP Statement</Label>
                      <Textarea
                        id="usp-statement"
                        value={uspStatement}
                        onChange={(e) => setUspStatement(e.target.value)}
                        placeholder="One clear sentence describing your unique selling proposition..."
                        rows={3}
                        data-testid="textarea-usp-statement"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Make it clear enough for non-experts to understand in 10 seconds
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="target-customer">Target Customer</Label>
                      <Textarea
                        id="target-customer"
                        value={targetCustomer}
                        onChange={(e) => setTargetCustomer(e.target.value)}
                        placeholder="Who is your ideal customer? Be specific..."
                        rows={2}
                        data-testid="textarea-target-customer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="key-differentiators">Key Differentiators</Label>
                      <Textarea
                        id="key-differentiators"
                        value={keyDifferentiators}
                        onChange={(e) => setKeyDifferentiators(e.target.value)}
                        placeholder="What makes you different from competitors? List specific features, capabilities, or approaches..."
                        rows={3}
                        data-testid="textarea-key-differentiators"
                      />
                    </div>

                    <div>
                      <Label htmlFor="competitive-moat">Competitive Moat</Label>
                      <Textarea
                        id="competitive-moat"
                        value={competitiveMoat}
                        onChange={(e) => setCompetitiveMoat(e.target.value)}
                        placeholder="What barriers prevent competitors from copying you? (IP, network effects, regulatory advantages, proprietary technology, etc.)"
                        rows={3}
                        data-testid="textarea-competitive-moat"
                      />
                    </div>

                    <div>
                      <Label htmlFor="innovation-evidence">Innovation Evidence</Label>
                      <Textarea
                        id="innovation-evidence"
                        value={innovationEvidence}
                        onChange={(e) => setInnovationEvidence(e.target.value)}
                        placeholder="Describe technical innovations, patents, research, or novel methodologies that demonstrate genuine innovation..."
                        rows={4}
                        data-testid="textarea-innovation-evidence"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Provide specific technical details, patent numbers, or research publications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">USP Dimension Scores</h3>
                    <p className="text-sm text-muted-foreground">Rate each dimension and provide evidence</p>
                    
                    {dimensions.map((dimension, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">{dimension.name}</Label>
                            <span className="text-2xl font-bold">{dimension.score}</span>
                          </div>
                          <Slider
                            value={[dimension.score]}
                            onValueChange={(v) => updateDimension(index, 'score', v[0])}
                            max={100}
                            step={5}
                            data-testid={`slider-${dimension.name.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={dimension.evidenceProvided}
                              onChange={(e) => updateDimension(index, 'evidenceProvided', e.target.checked)}
                              className="h-4 w-4"
                              id={`evidence-${index}`}
                              data-testid={`checkbox-evidence-${index}`}
                            />
                            <Label htmlFor={`evidence-${index}`} className="text-sm font-normal">Evidence provided</Label>
                          </div>
                          <Textarea
                            value={dimension.evidenceNotes}
                            onChange={(e) => updateDimension(index, 'evidenceNotes', e.target.value)}
                            placeholder="Describe evidence (customer testimonials, market data, technical specs, etc.)"
                            rows={2}
                            data-testid={`textarea-evidence-${index}`}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>USP Dimension Radar</CardTitle>
                    <CardDescription>All dimensions should be 75+ for strong positioning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Current Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name="Target (75)" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evidence Status by Dimension</CardTitle>
                    <CardDescription>Evidence completeness for visa submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={evidenceByDimension} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="dimension" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="provided" stackId="a" fill="#10b981" name="Evidence Provided" />
                        <Bar dataKey="missing" stackId="a" fill="#ef4444" name="Evidence Missing" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>USP Strength Trend</CardTitle>
                    <CardDescription>Progress toward 85% target strength</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={uspTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="strength" stroke="#3b82f6" strokeWidth={2} name="USP Strength %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimension Distribution</CardTitle>
                    <CardDescription>Score distribution across USP dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dimensions}
                          dataKey="score"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.score}`}
                        >
                          {dimensions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Analysis</CardTitle>
                  <CardDescription>Assess differentiation gap and sustainability threats from competitors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Competitor Comparisons</h3>
                    <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                      Add Competitor
                    </Button>
                  </div>

                  {competitors.map((competitor, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Input
                            value={competitor.competitor}
                            onChange={(e) => updateCompetitor(index, 'competitor', e.target.value)}
                            placeholder="Competitor name"
                            data-testid={`input-competitor-name-${index}`}
                          />
                          {competitors.length > 1 && (
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
                        
                        <div>
                          <Label>Uniqueness Gap (how much better are you): {competitor.uniquenessGap}%</Label>
                          <Slider
                            value={[competitor.uniquenessGap]}
                            onValueChange={(v) => updateCompetitor(index, 'uniquenessGap', v[0])}
                            max={100}
                            step={5}
                            data-testid={`slider-uniqueness-gap-${index}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target 40%+ gap for strong differentiation
                          </p>
                        </div>

                        <div>
                          <Label>Sustainability Threat (risk they catch up): {competitor.sustainabilityThreat}%</Label>
                          <Slider
                            value={[competitor.sustainabilityThreat]}
                            onValueChange={(v) => updateCompetitor(index, 'sustainabilityThreat', v[0])}
                            max={100}
                            step={5}
                            data-testid={`slider-sustainability-threat-${index}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Lower is better - build moats to reduce this risk
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {competitiveAnalysisData.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Competitive Position Chart</CardTitle>
                        <CardDescription>Uniqueness gap vs sustainability threat analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={competitiveAnalysisData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="uniquenessGap" fill="#10b981" name="Uniqueness Gap %" />
                            <Bar dataKey="threat" fill="#ef4444" name="Sustainability Threat %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered guidance for strengthening your USP</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => {
                      const isCritical = tip.toLowerCase().includes('critical');
                      const isWarning = tip.toLowerCase().includes('weak') || tip.toLowerCase().includes('insufficient') || tip.toLowerCase().includes('low');
                      return (
                        <Alert 
                          key={index}
                          className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}
                        >
                          <Lightbulb className={`h-4 w-4 ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-blue-600'}`} />
                          <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>
                            {tip}
                          </AlertDescription>
                        </Alert>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Criterion Requirements</CardTitle>
                  <CardDescription>GOV.UK Innovator Founder Visa innovation assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clear Differentiation</p>
                        <p className="text-sm text-muted-foreground">Your solution must be genuinely different from existing alternatives - not just incrementally better</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Novel Approach</p>
                        <p className="text-sm text-muted-foreground">Demonstrate unique methodology, technology, or business model innovation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Sustainable Advantage</p>
                        <p className="text-sm text-muted-foreground">Build defensible moats: IP protection, network effects, or proprietary technology</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Validation</p>
                        <p className="text-sm text-muted-foreground">Provide evidence of real customer demand through testimonials, pilots, or traction data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Innovation Evidence</p>
                        <p className="text-sm text-muted-foreground">Document technical specifications, patents, research publications, or expert endorsements</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to strengthen USP for visa endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.week}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Focus Areas</CardTitle>
                  <CardDescription>Immediate actions for maximum impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dimensions.filter(d => d.score < 70).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Low-Scoring Dimensions (Priority)
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {dimensions.filter(d => d.score < 70).map((d, i) => (
                            <li key={i}>{d.name}: {d.score}/100 - Strengthen with evidence and improvements</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {dimensions.filter(d => !d.evidenceProvided).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Missing Evidence (Urgent)
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {dimensions.filter(d => !d.evidenceProvided).map((d, i) => (
                            <li key={i}>{d.name}: Provide supporting documentation</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(!innovationEvidence || innovationEvidence.length < 100) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Innovation Evidence Required
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Document technical innovations, patents, research, or novel methodologies comprehensively
                        </p>
                      </div>
                    )}

                    {uspStrengthScore >= 75 && evidenceCompleteness >= 70 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Strong Foundation
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          USP meets endorsement thresholds. Focus on gathering customer traction data and maintaining competitive moat.
                        </p>
                      </div>
                    )}
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
