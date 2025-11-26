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
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Shield, Sparkles } from "lucide-react";
import {
  ScatterChart, Scatter, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig, type ToolQuestion } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'contingency-plan',
  toolName: 'Contingency Plan & Risk Register',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you build a comprehensive risk register and contingency plan - a critical component for your UK Innovator Founder Visa application. Endorsers want to see you've identified potential risks and have clear mitigation strategies. Let's work through this together!",
  questions: [
    {
      id: 'risk1-desc',
      question: "Let's start with your biggest financial risk. What's the most significant financial challenge your business might face in the first 2 years?",
      hint: "Think about funding gaps, cash flow issues, currency fluctuations, or unexpected costs",
      fieldKey: 'risk_financial_description',
      minLength: 50
    },
    {
      id: 'risk1-impact',
      question: "On a scale of 1-10, how severe would this financial risk be if it occurred? And what's the probability (1-10) that it might happen?",
      hint: "Be realistic - endorsers prefer honest assessments over overly optimistic ones",
      fieldKey: 'risk_financial_scores'
    },
    {
      id: 'risk1-mitigation',
      question: "What's your mitigation strategy for this financial risk? How will you prevent it or minimize its impact?",
      hint: "Include specific actions, timelines, and responsible parties",
      fieldKey: 'risk_financial_mitigation',
      minLength: 100
    },
    {
      id: 'risk2-desc',
      question: "Now let's discuss operational risks. What's your main concern about day-to-day business operations?",
      hint: "Consider supply chain issues, technology failures, key person dependencies, or process bottlenecks",
      fieldKey: 'risk_operational_description',
      minLength: 50
    },
    {
      id: 'risk2-mitigation',
      question: "How will you mitigate this operational risk? What contingency plans do you have?",
      hint: "Include backup systems, alternative suppliers, or redundancy measures",
      fieldKey: 'risk_operational_mitigation',
      minLength: 100
    },
    {
      id: 'risk3-desc',
      question: "What market or competitive risks could threaten your business? Think about competitors, market changes, or customer behavior shifts.",
      hint: "New competitors entering, market saturation, changing regulations, or economic downturns",
      fieldKey: 'risk_market_description',
      minLength: 50
    },
    {
      id: 'risk3-mitigation',
      question: "How will you stay ahead of these market risks? What's your competitive response strategy?",
      hint: "Diversification, innovation pipeline, customer retention strategies, market monitoring",
      fieldKey: 'risk_market_mitigation',
      minLength: 100
    },
    {
      id: 'risk4-desc',
      question: "Regulatory compliance is crucial for UK businesses. What regulatory or compliance risks have you identified?",
      hint: "GDPR, industry-specific regulations, visa compliance, employment law, tax obligations",
      fieldKey: 'risk_regulatory_description',
      minLength: 50
    },
    {
      id: 'risk4-mitigation',
      question: "How will you ensure ongoing regulatory compliance? What systems and processes will you put in place?",
      hint: "Regular audits, legal counsel, compliance training, automated monitoring",
      fieldKey: 'risk_regulatory_mitigation',
      minLength: 100
    },
    {
      id: 'overall-review',
      question: "Finally, how often will you review and update this risk register? Who will be responsible for risk oversight?",
      hint: "Best practice is quarterly reviews with board-level sign-off on critical risks",
      fieldKey: 'review_schedule',
      minLength: 30
    }
  ],
  completionMessage: "Excellent work! You've built a comprehensive risk analysis. This level of preparedness will impress endorsing bodies - they want to see founders who think ahead and plan for challenges. I'm now populating your risk register with these insights. You can fine-tune the details in the form view."
};

type RiskCategory = 'financial' | 'operational' | 'market' | 'regulatory' | 'team';

type Risk = {
  id: string;
  category: RiskCategory;
  description: string;
  impact: number;
  probability: number;
  mitigation: string;
  actionPlan: string;
  owner: string;
  deadline: string;
};

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  financial: 'Financial',
  operational: 'Operational',
  market: 'Market',
  regulatory: 'Regulatory',
  team: 'Team'
};

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  financial: '#3b82f6',
  operational: '#10b981',
  market: '#f59e0b',
  regulatory: '#8b5cf6',
  team: '#ec4899'
};

export default function ContingencyPlan() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('contingency-plan-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [risks, setRisks] = useState<Risk[]>([
    {
      id: '1',
      category: 'financial',
      description: '',
      impact: 5,
      probability: 5,
      mitigation: '',
      actionPlan: '',
      owner: '',
      deadline: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState('planning');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('contingency-plan-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newRisks: Risk[] = [];
    
    if (answers.risk_financial_description) {
      newRisks.push({
        id: 'ai-financial',
        category: 'financial',
        description: answers.risk_financial_description || '',
        impact: 7,
        probability: 5,
        mitigation: answers.risk_financial_mitigation || '',
        actionPlan: '',
        owner: '',
        deadline: ''
      });
    }
    
    if (answers.risk_operational_description) {
      newRisks.push({
        id: 'ai-operational',
        category: 'operational',
        description: answers.risk_operational_description || '',
        impact: 6,
        probability: 5,
        mitigation: answers.risk_operational_mitigation || '',
        actionPlan: '',
        owner: '',
        deadline: ''
      });
    }
    
    if (answers.risk_market_description) {
      newRisks.push({
        id: 'ai-market',
        category: 'market',
        description: answers.risk_market_description || '',
        impact: 6,
        probability: 6,
        mitigation: answers.risk_market_mitigation || '',
        actionPlan: '',
        owner: '',
        deadline: ''
      });
    }
    
    if (answers.risk_regulatory_description) {
      newRisks.push({
        id: 'ai-regulatory',
        category: 'regulatory',
        description: answers.risk_regulatory_description || '',
        impact: 8,
        probability: 4,
        mitigation: answers.risk_regulatory_mitigation || '',
        actionPlan: answers.review_schedule || '',
        owner: '',
        deadline: ''
      });
    }
    
    if (newRisks.length > 0) {
      setRisks(newRisks);
    }
  };

  const addRisk = (category: RiskCategory) => {
    const newRisk: Risk = {
      id: Date.now().toString(),
      category,
      description: '',
      impact: 5,
      probability: 5,
      mitigation: '',
      actionPlan: '',
      owner: '',
      deadline: ''
    };
    setRisks([...risks, newRisk]);
  };

  const updateRisk = (id: string, field: keyof Risk, value: any) => {
    setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRisk = (id: string) => {
    if (risks.length > 1) {
      setRisks(risks.filter(r => r.id !== id));
    }
  };

  const calculateRiskScore = (impact: number, probability: number): number => {
    return impact * probability;
  };

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 20) return { label: 'Critical', color: '#dc2626' };
    if (score >= 12) return { label: 'High', color: '#ea580c' };
    if (score >= 6) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'Low', color: '#10b981' };
  };

  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => calculateRiskScore(r.impact, r.probability) >= 20).length;
  const highRisks = risks.filter(r => {
    const score = calculateRiskScore(r.impact, r.probability);
    return score >= 12 && score < 20;
  }).length;
  const mitigatedRisks = risks.filter(r => r.mitigation.length > 20).length;
  const readinessScore = Math.round((mitigatedRisks / totalRisks) * 100);

  const risksByCategoryData = Object.keys(CATEGORY_LABELS).map(category => ({
    category: CATEGORY_LABELS[category as RiskCategory],
    count: risks.filter(r => r.category === category).length,
    avgScore: risks.filter(r => r.category === category).length > 0
      ? Math.round(
          risks.filter(r => r.category === category)
            .reduce((sum, r) => sum + calculateRiskScore(r.impact, r.probability), 0) /
          risks.filter(r => r.category === category).length
        )
      : 0,
    color: CATEGORY_COLORS[category as RiskCategory]
  })).filter(d => d.count > 0);

  const riskMatrixData = risks.map(risk => ({
    x: risk.probability,
    y: risk.impact,
    name: risk.description.substring(0, 30) + (risk.description.length > 30 ? '...' : ''),
    category: risk.category,
    score: calculateRiskScore(risk.impact, risk.probability)
  }));

  const getSerializedState = () => {
    return {
      risks,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('risks' in state) setRisks(state.risks);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('contingency-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('contingency-plan-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('contingency-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalRisks > 0) {
      tips.push(`You have ${criticalRisks} critical risk${criticalRisks > 1 ? 's' : ''} - these require immediate attention and board-level oversight for UK business continuity compliance`);
    }
    
    if (mitigatedRisks < totalRisks * 0.5) {
      tips.push("Less than 50% of identified risks have mitigation strategies - UK regulators expect comprehensive risk management documentation");
    }
    
    if (!risks.some(r => r.category === 'regulatory')) {
      tips.push("Consider adding regulatory risks - UK Innovator Founder Visa applications must demonstrate awareness of compliance obligations");
    }
    
    if (!risks.some(r => r.category === 'financial')) {
      tips.push("Financial risk assessment is critical - include scenarios like funding gaps, cash flow disruptions, or currency fluctuations");
    }
    
    if (risks.some(r => r.actionPlan.length === 0)) {
      tips.push("Every risk should have a specific action plan - vague mitigation strategies won't satisfy endorsing bodies or investors");
    }
    
    if (risks.some(r => !r.owner)) {
      tips.push("Assign ownership for each risk - demonstrates organizational accountability and management capability");
    }
    
    if (risks.some(r => !r.deadline)) {
      tips.push("Set realistic deadlines for risk mitigation actions - shows proactive planning and operational maturity");
    }
    
    if (risksByCategoryData.length < 3) {
      tips.push("Broaden your risk assessment across more categories - comprehensive planning demonstrates strategic thinking to endorsing bodies");
    }
    
    if (readinessScore > 75) {
      tips.push("Strong contingency planning - ensure you document this thoroughly in your business plan and maintain regular review cycles");
    }
    
    tips.push("UK business continuity best practice: Review and update your contingency plan quarterly, with board sign-off on critical risks");
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Conduct comprehensive risk identification workshop with all key stakeholders and department heads",
        priority: "Critical",
        ukRequirement: "Essential for demonstrating management team capability to endorsing bodies"
      },
      { 
        week: "Week 1-2", 
        action: "Assess and score each identified risk for impact and probability using consistent methodology",
        priority: "Critical",
        ukRequirement: "Quantified risk assessment required for credible business planning"
      },
      { 
        week: "Week 2", 
        action: "Develop detailed mitigation strategies for all critical and high-priority risks",
        priority: "Critical",
        ukRequirement: "UK endorsers expect evidence-based risk management strategies"
      },
      { 
        week: "Week 2-3", 
        action: "Assign risk owners and establish clear accountability framework with reporting lines",
        priority: "High",
        ukRequirement: "Demonstrates organizational structure and governance for visa application"
      },
      { 
        week: "Week 3", 
        action: "Create specific action plans with measurable milestones and realistic timelines for each risk",
        priority: "High",
        ukRequirement: "Detailed planning shows operational capability to Home Office assessors"
      },
      { 
        week: "Week 3-4", 
        action: "Document business continuity procedures for critical operations including data backup and recovery",
        priority: "Critical",
        ukRequirement: "UK regulations require evidence of business resilience planning"
      },
      { 
        week: "Week 4", 
        action: "Establish risk monitoring dashboard and schedule quarterly review cycles with board",
        priority: "High",
        ukRequirement: "Ongoing risk management demonstrates sustainable business operations"
      },
      { 
        week: "Week 4", 
        action: "Prepare risk management summary for business plan highlighting UK-specific regulatory compliance",
        priority: "Critical",
        ukRequirement: "Essential component of Innovator Founder Visa business plan documentation"
      },
      { 
        week: "Ongoing", 
        action: "Maintain risk register updates monthly and conduct full contingency plan review quarterly",
        priority: "High",
        ukRequirement: "Continuous improvement expected by UK endorsing bodies and investors"
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - BUSINESS CONTINGENCY PLAN
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Risks Identified: ${totalRisks}
Critical Risks: ${criticalRisks}
High Priority Risks: ${highRisks}
Risks with Mitigation Strategies: ${mitigatedRisks}
Contingency Readiness Score: ${readinessScore}%

RISK OVERVIEW BY CATEGORY
${'-'.repeat(80)}
${risksByCategoryData.map(cat => `${cat.category}: ${cat.count} risk${cat.count > 1 ? 's' : ''} (Avg Score: ${cat.avgScore})`).join('\n')}

DETAILED RISK REGISTER
${'-'.repeat(80)}
${risks.map((risk, i) => {
  const score = calculateRiskScore(risk.impact, risk.probability);
  const level = getRiskLevel(score);
  return `
RISK ${i + 1}: ${risk.description || 'Unnamed Risk'}
${'-'.repeat(80)}
Category: ${CATEGORY_LABELS[risk.category]}
Impact: ${risk.impact}/10
Probability: ${risk.probability}/10
Risk Score: ${score}/100
Risk Level: ${level.label}
Owner: ${risk.owner || 'Not assigned'}
Deadline: ${risk.deadline || 'Not set'}

Mitigation Strategy:
${risk.mitigation || 'Not defined'}

Action Plan:
${risk.actionPlan || 'Not defined'}
`;
}).join('\n')}

RISK MATRIX ANALYSIS
${'-'.repeat(80)}
Critical Risks (Score >= 20):
${risks.filter(r => calculateRiskScore(r.impact, r.probability) >= 20)
  .map(r => `- ${r.description || 'Unnamed'} (${CATEGORY_LABELS[r.category]}): Score ${calculateRiskScore(r.impact, r.probability)}`)
  .join('\n') || 'None identified'}

High Priority Risks (Score 12-19):
${risks.filter(r => {
  const score = calculateRiskScore(r.impact, r.probability);
  return score >= 12 && score < 20;
}).map(r => `- ${r.description || 'Unnamed'} (${CATEGORY_LABELS[r.category]}): Score ${calculateRiskScore(r.impact, r.probability)}`)
  .join('\n') || 'None identified'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `
[${item.priority}] ${item.week}: ${item.action}
UK Requirement: ${item.ukRequirement}
`).join('\n')}

UK BUSINESS CONTINUITY REQUIREMENTS
${'-'.repeat(80)}
1. Risk Management Framework
   - Documented risk assessment methodology
   - Regular review and update cycles (minimum quarterly)
   - Board-level oversight and accountability

2. Business Continuity Planning
   - Critical operation identification and prioritization
   - Backup and recovery procedures for key systems
   - Alternative supplier and resource arrangements

3. Regulatory Compliance
   - Industry-specific regulatory risk assessment
   - Data protection and GDPR compliance measures
   - Health and safety risk management

4. Financial Resilience
   - Cash flow scenario planning (best/worst/most likely)
   - Insurance coverage review and adequacy assessment
   - Emergency funding arrangements and credit facilities

5. Operational Resilience
   - Key person dependency analysis and succession planning
   - Supply chain risk assessment and diversification
   - Technology infrastructure redundancy and cybersecurity

6. Stakeholder Communication
   - Crisis communication protocols and responsibilities
   - Stakeholder notification procedures (investors, customers, regulators)
   - Media handling and reputation management plans

COMPLIANCE CERTIFICATION
${'-'.repeat(80)}
This contingency plan has been prepared in accordance with:
- UK Corporate Governance Code requirements
- Home Office Innovator Founder Visa business planning standards
- ISO 22301 Business Continuity Management principles
- FCA/industry-specific regulatory guidance (where applicable)

The plan should be reviewed and approved by the board of directors and updated
quarterly or following any significant business changes.

NEXT STEPS
${'-'.repeat(80)}
1. Board review and formal approval of contingency plan
2. Integration with business plan for visa application
3. Implementation of high-priority mitigation actions
4. Establishment of risk monitoring and reporting framework
5. Schedule first quarterly review (recommended: 90 days from approval)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This contingency plan template is for guidance purposes. Applicants
should seek professional advice from qualified risk management consultants and
legal advisors to ensure compliance with all applicable UK regulations and
industry-specific requirements.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contingency-plan-${Date.now()}.txt`;
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
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-contingency-plan">Business Contingency Plan</h1>
                <p className="text-lg text-muted-foreground">Comprehensive risk management and business continuity planning</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Traditional Form"
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Sage, our Compliance Expert, helps you build a comprehensive risk register through natural conversation.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Get real-time feedback on your risk assessments</li>
                    <li>Ensure you cover all critical risk categories</li>
                    <li>Receive guidance aligned with UK visa requirements</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the risk register form when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
              <ToolUtilityBar
                toolId="contingency-plan"
                onSave={handleSave}
                onRestore={handleRestore}
                onExport={handleExport}
                getSerializedState={getSerializedState}
                toolName="Contingency Plan"
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5" data-testid="tabs-contingency-plan">
                  <TabsTrigger value="planning" data-testid="tab-planning">Planning</TabsTrigger>
                  <TabsTrigger value="matrix" data-testid="tab-matrix">Risk Matrix</TabsTrigger>
                  <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
                  <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="planning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Contingency Readiness Overview
                  </CardTitle>
                  <CardDescription>UK business continuity and risk management status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Risks</p>
                          <p className="text-3xl font-bold" data-testid="text-total-risks">{totalRisks}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalRisks > 0 ? "border-destructive" : "border-green-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Risks</p>
                          <p className="text-3xl font-bold text-destructive" data-testid="text-critical-risks">{criticalRisks}</p>
                          {criticalRisks > 0 && (
                            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mt-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Mitigated</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-mitigated-risks">{mitigatedRisks}</p>
                          <p className="text-sm text-muted-foreground mt-1">of {totalRisks}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={readinessScore >= 75 ? "border-green-500" : readinessScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Readiness Score</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-readiness-score">{readinessScore}%</p>
                          <Progress value={readinessScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {criticalRisks > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have {criticalRisks} critical risk{criticalRisks > 1 ? 's' : ''} requiring immediate attention. UK endorsing bodies expect comprehensive mitigation strategies for high-impact risks.
                      </AlertDescription>
                    </Alert>
                  )}

                  {readinessScore >= 75 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Strong contingency planning position. Ensure all documentation is complete and regularly reviewed for visa application.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Risk Categories</h3>
                    </div>

                    <div className="grid md:grid-cols-5 gap-2">
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => addRisk(key as RiskCategory)}
                          data-testid={`button-add-${key}`}
                          style={{ borderColor: CATEGORY_COLORS[key as RiskCategory] }}
                        >
                          Add {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Risk Register</h3>
                    
                    {risks.map((risk, index) => {
                      const score = calculateRiskScore(risk.impact, risk.probability);
                      const level = getRiskLevel(score);
                      
                      return (
                        <Card key={risk.id} className="p-4" style={{ borderLeftWidth: '4px', borderLeftColor: CATEGORY_COLORS[risk.category] }}>
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge style={{ backgroundColor: CATEGORY_COLORS[risk.category] }}>
                                    {CATEGORY_LABELS[risk.category]}
                                  </Badge>
                                  <Badge variant="outline" style={{ borderColor: level.color, color: level.color }}>
                                    {level.label} Risk (Score: {score})
                                  </Badge>
                                </div>
                              </div>
                              {risks.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRisk(risk.id)}
                                  data-testid={`button-remove-risk-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <Label htmlFor={`risk-desc-${risk.id}`}>Risk Description</Label>
                                <Textarea
                                  id={`risk-desc-${risk.id}`}
                                  value={risk.description}
                                  onChange={(e) => updateRisk(risk.id, 'description', e.target.value)}
                                  placeholder="Describe the specific risk to your business operations..."
                                  rows={2}
                                  data-testid={`textarea-description-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`risk-impact-${risk.id}`}>Impact (1-10)</Label>
                                <div className="flex items-center gap-4">
                                  <input
                                    id={`risk-impact-${risk.id}`}
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={risk.impact}
                                    onChange={(e) => updateRisk(risk.id, 'impact', parseInt(e.target.value))}
                                    className="flex-1"
                                    data-testid={`slider-impact-${index}`}
                                  />
                                  <span className="font-bold w-8 text-center">{risk.impact}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  How severe would this risk be if it occurred?
                                </p>
                              </div>

                              <div>
                                <Label htmlFor={`risk-probability-${risk.id}`}>Probability (1-10)</Label>
                                <div className="flex items-center gap-4">
                                  <input
                                    id={`risk-probability-${risk.id}`}
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={risk.probability}
                                    onChange={(e) => updateRisk(risk.id, 'probability', parseInt(e.target.value))}
                                    className="flex-1"
                                    data-testid={`slider-probability-${index}`}
                                  />
                                  <span className="font-bold w-8 text-center">{risk.probability}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  How likely is this risk to occur?
                                </p>
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor={`risk-mitigation-${risk.id}`}>Mitigation Strategy</Label>
                                <Textarea
                                  id={`risk-mitigation-${risk.id}`}
                                  value={risk.mitigation}
                                  onChange={(e) => updateRisk(risk.id, 'mitigation', e.target.value)}
                                  placeholder="Describe how you will prevent or minimize this risk..."
                                  rows={2}
                                  data-testid={`textarea-mitigation-${index}`}
                                />
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor={`risk-action-${risk.id}`}>Action Plan</Label>
                                <Textarea
                                  id={`risk-action-${risk.id}`}
                                  value={risk.actionPlan}
                                  onChange={(e) => updateRisk(risk.id, 'actionPlan', e.target.value)}
                                  placeholder="Specific steps to implement the mitigation strategy..."
                                  rows={2}
                                  data-testid={`textarea-action-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`risk-owner-${risk.id}`}>Risk Owner</Label>
                                <Input
                                  id={`risk-owner-${risk.id}`}
                                  value={risk.owner}
                                  onChange={(e) => updateRisk(risk.id, 'owner', e.target.value)}
                                  placeholder="Person responsible"
                                  data-testid={`input-owner-${index}`}
                                />
                              </div>

                              <div>
                                <Label htmlFor={`risk-deadline-${risk.id}`}>Mitigation Deadline</Label>
                                <Input
                                  id={`risk-deadline-${risk.id}`}
                                  type="date"
                                  value={risk.deadline}
                                  onChange={(e) => updateRisk(risk.id, 'deadline', e.target.value)}
                                  data-testid={`input-deadline-${index}`}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matrix" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Matrix</CardTitle>
                  <CardDescription>Impact vs Probability analysis of all identified risks</CardDescription>
                </CardHeader>
                <CardContent>
                  {riskMatrixData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={500}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name="Probability" 
                          domain={[0, 11]}
                          label={{ value: 'Probability', position: 'bottom', offset: 40 }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Impact" 
                          domain={[0, 11]}
                          label={{ value: 'Impact', angle: -90, position: 'left', offset: 40 }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="text-sm">Category: {CATEGORY_LABELS[data.category as RiskCategory]}</p>
                                  <p className="text-sm">Impact: {data.y}</p>
                                  <p className="text-sm">Probability: {data.x}</p>
                                  <p className="text-sm font-bold">Risk Score: {data.score}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Risks" data={riskMatrixData} fill="#3b82f6">
                          {riskMatrixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as RiskCategory]} />
                          ))}
                        </Scatter>
                        <rect x="0" y="0" width="100" height="100" fill="#10b981" opacity="0.1" />
                        <rect x="100" y="0" width="200" height="100" fill="#f59e0b" opacity="0.1" />
                        <rect x="300" y="0" width="200" height="100" fill="#dc2626" opacity="0.1" />
                        <rect x="0" y="100" width="100" height="200" fill="#f59e0b" opacity="0.1" />
                        <rect x="100" y="100" width="200" height="200" fill="#dc2626" opacity="0.1" />
                        <rect x="300" y="100" width="200" height="200" fill="#dc2626" opacity="0.1" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add risks to see the risk matrix</p>
                  )}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Low Risk (Score 1-5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-50 dark:bg-orange-9500 rounded"></div>
                      <span className="text-sm">Medium Risk (Score 6-11)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      <span className="text-sm">High/Critical (Score 12+)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risks by Category</CardTitle>
                    <CardDescription>Distribution and severity of risks across business areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {risksByCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={risksByCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Risk Count" fill="#3b82f6">
                            {risksByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add risks to see category distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Risk Scores</CardTitle>
                    <CardDescription>Average severity by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {risksByCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={risksByCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="avgScore" name="Avg Risk Score" fill="#8b5cf6">
                            {risksByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add risks to see average scores</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Business Continuity Framework</CardTitle>
                  <CardDescription>Essential components for Innovator Founder Visa compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Risk Management Governance</p>
                        <p className="text-sm text-muted-foreground">Board oversight, risk committee, and clear accountability structure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Business Impact Analysis</p>
                        <p className="text-sm text-muted-foreground">Identify critical operations and maximum tolerable downtime periods</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Recovery Strategies</p>
                        <p className="text-sm text-muted-foreground">Documented procedures for restoring operations after disruption</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Regulatory Compliance</p>
                        <p className="text-sm text-muted-foreground">Industry-specific regulations, data protection, and health & safety</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Testing and Exercises</p>
                        <p className="text-sm text-muted-foreground">Regular simulation of scenarios to validate contingency plans</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Continuous Improvement</p>
                        <p className="text-sm text-muted-foreground">Quarterly reviews, lessons learned, and plan updates</p>
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
                  <CardDescription>Context-aware guidance for comprehensive contingency planning</CardDescription>
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
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Structured implementation roadmap for comprehensive contingency planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <Badge 
                            variant="outline"
                            className={
                              item.priority === 'Critical' ? 'border-destructive text-destructive' :
                              item.priority === 'High' ? 'border-orange-500 text-orange-500' :
                              'border-primary text-primary'
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1">{item.week}</p>
                          <p className="text-sm mb-2">{item.action}</p>
                          <p className="text-xs text-muted-foreground italic">
                            UK Requirement: {item.ukRequirement}
                          </p>
                        </div>
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
