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
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, FileText, TrendingUp, Scale, Shield } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type RejectionIssue = {
  id: string;
  category: 'innovation' | 'viability' | 'scalability' | 'genuineness' | 'english' | 'maintenance' | 'endorsement' | 'documentation' | 'other';
  description: string;
  homeOfficeReference: string;
  severity: number;
  remediationStatus: 'not_started' | 'in_progress' | 'completed';
};

type RemediationAction = {
  id: string;
  issueId: string;
  action: string;
  evidenceRequired: string;
  timeline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number;
  responsible: string;
};

type CriteriaMapping = {
  id: string;
  criteriaName: string;
  homeOfficeRequirement: string;
  deficiency: string;
  currentEvidence: string;
  requiredEvidence: string;
  complianceLevel: number;
};

type ReapplicationPlan = {
  id: string;
  milestone: string;
  description: string;
  week: number;
  status: 'pending' | 'active' | 'completed';
  blockers: string;
};

const ISSUE_CATEGORIES = {
  innovation: 'Innovation Requirement',
  viability: 'Business Viability',
  scalability: 'Scalability Potential',
  genuineness: 'Genuineness Test',
  english: 'English Language',
  maintenance: 'Maintenance Funds',
  endorsement: 'Endorsement Issues',
  documentation: 'Documentation Quality',
  other: 'Other Grounds'
};

const SEVERITY_LEVELS = {
  1: 'Minor - Easy Fix',
  2: 'Minor - Quick Resolution',
  3: 'Moderate - Standard',
  4: 'Moderate - Requires Work',
  5: 'Moderate - Time Investment',
  6: 'Serious - Major Effort',
  7: 'Serious - Significant Changes',
  8: 'Critical - Fundamental Restructure',
  9: 'Critical - Business Model Change',
  10: 'Critical - May Need Different Route'
};

const COMMON_REJECTION_PATTERNS_2025 = [
  {
    pattern: 'Insufficient Innovation Evidence',
    frequency: 'Very Common (35%)',
    resolution: 'Obtain technical expert assessments, patent searches, competitive analysis showing clear differentiation',
    avgRemediationTime: '4-8 weeks'
  },
  {
    pattern: 'Weak Market Validation',
    frequency: 'Very Common (32%)',
    resolution: 'Secure LOIs, pilot customers, pre-orders, market research data from credible sources',
    avgRemediationTime: '6-12 weeks'
  },
  {
    pattern: 'Scalability Concerns',
    frequency: 'Common (28%)',
    resolution: 'Detailed scaling roadmap, unit economics, infrastructure plan, hiring timeline',
    avgRemediationTime: '3-6 weeks'
  },
  {
    pattern: 'Genuineness Doubts',
    frequency: 'Common (25%)',
    resolution: 'Trading history, business premises evidence, operational costs documentation, ongoing activities',
    avgRemediationTime: '2-4 weeks'
  },
  {
    pattern: 'Endorsement Body Concerns',
    frequency: 'Moderate (18%)',
    resolution: 'Switch endorsing body, address specific technical concerns, strengthen business case',
    avgRemediationTime: '8-16 weeks'
  },
  {
    pattern: 'Financial Projections Unrealistic',
    frequency: 'Moderate (15%)',
    resolution: 'Conservative reforecast with industry benchmarks, accountant validation, sensitivity analysis',
    avgRemediationTime: '2-3 weeks'
  },
  {
    pattern: 'Team Capability Questions',
    frequency: 'Less Common (12%)',
    resolution: 'Advisory board formation, key hires, consultant agreements, founder CV enhancement',
    avgRemediationTime: '4-8 weeks'
  },
  {
    pattern: 'IP Strategy Weak',
    frequency: 'Less Common (10%)',
    resolution: 'File provisional patents, strengthen trade secrets, formalize IP ownership documentation',
    avgRemediationTime: '8-12 weeks'
  }
];

export default function RejectionAnalysis() {
  const [rejectionIssues, setRejectionIssues] = useState<RejectionIssue[]>([
    { id: '1', category: 'innovation', description: '', homeOfficeReference: '', severity: 5, remediationStatus: 'not_started' }
  ]);
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>([
    { id: '1', issueId: '1', action: '', evidenceRequired: '', timeline: '', priority: 'high', progress: 0, responsible: '' }
  ]);
  const [criteriaMappings, setCriteriaMappings] = useState<CriteriaMapping[]>([
    { id: '1', criteriaName: '', homeOfficeRequirement: '', deficiency: '', currentEvidence: '', requiredEvidence: '', complianceLevel: 0 }
  ]);
  const [reapplicationPlan, setReapplicationPlan] = useState<ReapplicationPlan[]>([
    { id: '1', milestone: '', description: '', week: 1, status: 'pending', blockers: '' }
  ]);

  const [applicationReference, setApplicationReference] = useState('');
  const [refusalDate, setRefusalDate] = useState('');
  const [endorsingBody, setEndorsingBody] = useState('');
  const [reapplicationTarget, setReapplicationTarget] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [savedDate, setSavedDate] = useState('');

  const addRejectionIssue = () => {
    setRejectionIssues([...rejectionIssues, {
      id: Date.now().toString(),
      category: 'innovation',
      description: '',
      homeOfficeReference: '',
      severity: 5,
      remediationStatus: 'not_started'
    }]);
  };

  const updateRejectionIssue = (id: string, field: keyof RejectionIssue, value: any) => {
    setRejectionIssues(rejectionIssues.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeRejectionIssue = (id: string) => {
    if (rejectionIssues.length > 1) {
      setRejectionIssues(rejectionIssues.filter(i => i.id !== id));
      setRemediationActions(remediationActions.filter(a => a.issueId !== id));
    }
  };

  const addRemediationAction = () => {
    setRemediationActions([...remediationActions, {
      id: Date.now().toString(),
      issueId: rejectionIssues[0]?.id || '1',
      action: '',
      evidenceRequired: '',
      timeline: '',
      priority: 'medium',
      progress: 0,
      responsible: ''
    }]);
  };

  const updateRemediationAction = (id: string, field: keyof RemediationAction, value: any) => {
    setRemediationActions(remediationActions.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeRemediationAction = (id: string) => {
    if (remediationActions.length > 1) {
      setRemediationActions(remediationActions.filter(a => a.id !== id));
    }
  };

  const addCriteriaMapping = () => {
    setCriteriaMappings([...criteriaMappings, {
      id: Date.now().toString(),
      criteriaName: '',
      homeOfficeRequirement: '',
      deficiency: '',
      currentEvidence: '',
      requiredEvidence: '',
      complianceLevel: 0
    }]);
  };

  const updateCriteriaMapping = (id: string, field: keyof CriteriaMapping, value: any) => {
    setCriteriaMappings(criteriaMappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeCriteriaMapping = (id: string) => {
    if (criteriaMappings.length > 1) {
      setCriteriaMappings(criteriaMappings.filter(m => m.id !== id));
    }
  };

  const addReapplicationMilestone = () => {
    setReapplicationPlan([...reapplicationPlan, {
      id: Date.now().toString(),
      milestone: '',
      description: '',
      week: reapplicationPlan.length + 1,
      status: 'pending',
      blockers: ''
    }]);
  };

  const updateReapplicationMilestone = (id: string, field: keyof ReapplicationPlan, value: any) => {
    setReapplicationPlan(reapplicationPlan.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeReapplicationMilestone = (id: string) => {
    if (reapplicationPlan.length > 1) {
      setReapplicationPlan(reapplicationPlan.filter(p => p.id !== id));
    }
  };

  const calculateReapplicationReadiness = (): number => {
    const criticalIssues = rejectionIssues.filter(i => i.severity >= 8).length;
    const unresolvedIssues = rejectionIssues.filter(i => i.remediationStatus !== 'completed').length;
    const avgRemediationProgress = remediationActions.reduce((sum, a) => sum + a.progress, 0) / Math.max(remediationActions.length, 1);
    const avgComplianceLevel = criteriaMappings.reduce((sum, m) => sum + m.complianceLevel, 0) / Math.max(criteriaMappings.length, 1);
    
    let score = 100;
    score -= criticalIssues * 15;
    score -= unresolvedIssues * 8;
    score += avgRemediationProgress * 0.3;
    score += avgComplianceLevel * 0.3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const readinessScore = calculateReapplicationReadiness();

  const getReadinessLevel = (score: number): { label: string; color: string; recommendation: string } => {
    if (score >= 80) return { 
      label: 'Ready to Reapply', 
      color: '#10b981',
      recommendation: 'Strong position - proceed with new application'
    };
    if (score >= 60) return { 
      label: 'Nearly Ready', 
      color: '#3b82f6',
      recommendation: 'Address remaining minor issues within 2-4 weeks'
    };
    if (score >= 40) return { 
      label: 'Moderate Progress', 
      color: '#f59e0b',
      recommendation: 'Significant work needed - 6-8 weeks minimum'
    };
    if (score >= 20) return { 
      label: 'Early Stage', 
      color: '#ef4444',
      recommendation: 'Major remediation required - 10-16 weeks'
    };
    return { 
      label: 'Not Ready', 
      color: '#dc2626',
      recommendation: 'Consider alternative visa routes or fundamental business pivot'
    };
  };

  const readinessLevel = getReadinessLevel(readinessScore);

  const issueByCategoryData = Object.keys(ISSUE_CATEGORIES).map(key => ({
    name: ISSUE_CATEGORIES[key as keyof typeof ISSUE_CATEGORIES],
    value: rejectionIssues.filter(i => i.category === key).length,
    avgSeverity: rejectionIssues.filter(i => i.category === key).length > 0
      ? Math.round(rejectionIssues.filter(i => i.category === key).reduce((sum, i) => sum + i.severity, 0) / rejectionIssues.filter(i => i.category === key).length)
      : 0
  })).filter(d => d.value > 0);

  const CATEGORY_COLORS: { [key: string]: string } = {
    'Innovation Requirement': '#3b82f6',
    'Business Viability': '#10b981',
    'Scalability Potential': '#f59e0b',
    'Genuineness Test': '#8b5cf6',
    'English Language': '#ec4899',
    'Maintenance Funds': '#06b6d4',
    'Endorsement Issues': '#ef4444',
    'Documentation Quality': '#6b7280',
    'Other Grounds': '#a855f7'
  };

  const remediationProgressData = remediationActions.map(a => ({
    action: a.action.substring(0, 25) + (a.action.length > 25 ? '...' : ''),
    progress: a.progress,
    priority: a.priority
  }));

  const severityDistribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => ({
    severity: `Level ${level}`,
    count: rejectionIssues.filter(i => i.severity === level).length,
    label: SEVERITY_LEVELS[level as keyof typeof SEVERITY_LEVELS]
  })).filter(d => d.count > 0);

  const criticalIssuesCount = rejectionIssues.filter(i => i.severity >= 8).length;
  const completedRemediations = remediationActions.filter(a => a.progress >= 100).length;
  const avgComplianceLevel = criteriaMappings.length > 0
    ? Math.round(criteriaMappings.reduce((sum, m) => sum + m.complianceLevel, 0) / criteriaMappings.length)
    : 0;

  const getSerializedState = () => {
    return {
      rejectionIssues,
      remediationActions,
      criteriaMappings,
      reapplicationPlan,
      applicationReference,
      refusalDate,
      endorsingBody,
      reapplicationTarget,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('rejectionIssues' in state) setRejectionIssues(state.rejectionIssues);
    if ('remediationActions' in state) setRemediationActions(state.remediationActions);
    if ('criteriaMappings' in state) setCriteriaMappings(state.criteriaMappings);
    if ('reapplicationPlan' in state) setReapplicationPlan(state.reapplicationPlan);
    if ('applicationReference' in state) setApplicationReference(state.applicationReference);
    if ('refusalDate' in state) setRefusalDate(state.refusalDate);
    if ('endorsingBody' in state) setEndorsingBody(state.endorsingBody);
    if ('reapplicationTarget' in state) setReapplicationTarget(state.reapplicationTarget);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('rejection-analysis-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('rejection-analysis-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('rejection-analysis-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (criticalIssuesCount >= 3) {
      tips.push("WARNING: Multiple critical issues detected - consider engaging specialized immigration lawyer before reapplying to avoid second refusal");
    }

    if (readinessScore < 40) {
      tips.push("Your reapplication readiness is below 40% - rushing reapplication risks another refusal. Take time to address fundamental issues systematically");
    }

    if (rejectionIssues.some(i => i.category === 'genuineness')) {
      tips.push("Genuineness refusals are serious red flags - provide comprehensive trading history, business premises evidence, operational costs, and ongoing activity proof");
    }

    if (rejectionIssues.some(i => i.category === 'innovation' && i.severity >= 7)) {
      tips.push("Severe innovation deficiency - obtain independent technical expert assessment, conduct thorough patent/prior art search, commission competitive differentiation analysis");
    }

    if (rejectionIssues.some(i => i.category === 'endorsement')) {
      tips.push("Endorsement-related refusals may require switching to different endorsing body - research alternative endorsers' track records and technical focus areas");
    }

    if (avgComplianceLevel < 50) {
      tips.push("Low average compliance level indicates fundamental business model issues - consider whether Innovator Founder is the right route or if alternative visas (Skilled Worker, Global Talent) are more appropriate");
    }

    if (remediationActions.some(a => a.priority === 'critical' && a.progress < 50)) {
      tips.push("Critical remediation actions are incomplete - these MUST be addressed before reapplication or second refusal becomes highly likely");
    }

    if (rejectionIssues.some(i => i.category === 'viability' || i.category === 'scalability')) {
      tips.push("Business viability/scalability concerns require credible market validation - secure Letters of Intent, pilot customers, pre-orders, or independent market research from recognized firms");
    }

    if (completedRemediations < remediationActions.length * 0.5) {
      tips.push("Less than 50% of remediation actions completed - premature reapplication will likely result in second refusal. Focus on systematic completion of all actions");
    }

    if (!endorsingBody || endorsingBody.trim() === '') {
      tips.push("Endorsing body selection is critical - research each endorser's approval rates, technical expertise alignment, and typical feedback timelines before choosing");
    }

    if (rejectionIssues.filter(i => i.remediationStatus === 'not_started').length > 3) {
      tips.push("Multiple issues with no remediation started - create detailed project plan with ownership, deadlines, and dependencies to avoid overwhelming yourself");
    }

    tips.push("UK Home Office caseworkers expect clear, direct evidence addressing each refusal ground - vague improvements won't suffice. Document everything systematically");

    tips.push("Second refusals are significantly harder to overcome - if readiness score is below 70%, strongly consider 3-6 month remediation period before reapplying");

    return tips.slice(0, 14);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Comprehensive refusal analysis - map each rejection ground to specific Immigration Rules paragraphs and Home Office policy guidance",
        priority: "Critical",
        ukContext: "Understanding exact technical deficiencies prevents repeating same errors"
      },
      {
        week: "Week 1",
        action: "Consult specialized immigration lawyer for case review and remediation strategy - essential for complex or multiple-ground refusals",
        priority: "Critical",
        ukContext: "OISC Level 3 advisors or barristers can identify subtle legal issues missed by applicants"
      },
      {
        week: "Week 1-2",
        action: "Assess whether to switch endorsing bodies - research alternative endorsers' approval rates, technical expertise, and processing times",
        priority: "High",
        ukContext: "Different endorsing bodies have varying standards and industry focuses"
      },
      {
        week: "Week 2",
        action: "For innovation deficiencies: commission independent technical expert assessment from PhD-level specialist or industry authority",
        priority: "Critical",
        ukContext: "Expert opinions carry significant weight if expert has strong credentials and independence"
      },
      {
        week: "Week 2-3",
        action: "For market validation issues: secure Letters of Intent, pilot customers, pre-orders, or commission market research from credible firms (Gartner, IDC, etc.)",
        priority: "Critical",
        ukContext: "Home Office expects concrete commercial evidence, not just business plan projections"
      },
      {
        week: "Week 3",
        action: "For scalability concerns: develop detailed scaling roadmap with unit economics, infrastructure plan, hiring timeline, and geographic expansion strategy",
        priority: "High",
        ukContext: "Scalability must be credible and resource-realistic for UK market context"
      },
      {
        week: "Week 3-4",
        action: "For genuineness doubts: compile comprehensive trading history, business premises evidence, operational costs, supplier/customer documentation",
        priority: "Critical",
        ukContext: "Genuineness is proved through ongoing operational activity, not future intentions"
      },
      {
        week: "Week 4",
        action: "For financial projection issues: engage chartered accountant to validate forecasts, provide sensitivity analysis, and benchmark against industry norms",
        priority: "High",
        ukContext: "Accountant certification adds credibility but projections must still be conservative and evidence-based"
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - REJECTION ANALYSIS & REMEDIATION REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(90)}

CASE INFORMATION
${'-'.repeat(90)}
Application Reference: ${applicationReference || 'Not provided'}
Refusal Date: ${refusalDate || 'Not provided'}
Endorsing Body: ${endorsingBody || 'Not specified'}
Target Reapplication Date: ${reapplicationTarget || 'Not set'}

REAPPLICATION READINESS ASSESSMENT
${'-'.repeat(90)}
Overall Readiness Score: ${readinessScore}/100
Readiness Level: ${readinessLevel.label}
Recommendation: ${readinessLevel.recommendation}

Key Metrics:
- Total Rejection Issues Identified: ${rejectionIssues.length}
- Critical Issues (Severity 8-10): ${criticalIssuesCount}
- Remediation Actions Defined: ${remediationActions.length}
- Completed Remediation Actions: ${completedRemediations}
- Average Criteria Compliance: ${avgComplianceLevel}%

REJECTION ISSUES BREAKDOWN
${'-'.repeat(90)}
${rejectionIssues.map((issue, i) => `
ISSUE ${i + 1}: ${ISSUE_CATEGORIES[issue.category]}
Severity: ${issue.severity}/10 (${SEVERITY_LEVELS[issue.severity as keyof typeof SEVERITY_LEVELS]})
Home Office Reference: ${issue.homeOfficeReference || 'Not specified'}
Description: ${issue.description || 'Not detailed'}
Remediation Status: ${issue.remediationStatus === 'completed' ? 'COMPLETED' : 
                     issue.remediationStatus === 'in_progress' ? 'IN PROGRESS' : 
                     'NOT STARTED'}
`).join('')}

REMEDIATION ACTION PLAN
${'-'.repeat(90)}
${remediationActions.map((action, i) => `
ACTION ${i + 1}
Priority: ${action.priority.toUpperCase()}
Action Required: ${action.action || 'Not specified'}
Evidence to Gather: ${action.evidenceRequired || 'Not detailed'}
Timeline: ${action.timeline || 'Not set'}
Progress: ${action.progress}%
Responsible: ${action.responsible || 'Not assigned'}
`).join('')}

SMART RECOMMENDATIONS
${'-'.repeat(90)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

ACTION PLAN
${'-'.repeat(90)}
${generateActionPlan().map(item => `
[${item.priority}] ${item.week}: ${item.action}
UK Context: ${item.ukContext}
`).join('\n')}

COMMON UK INNOVATOR FOUNDER REJECTION PATTERNS 2025
${'-'.repeat(90)}
${COMMON_REJECTION_PATTERNS_2025.map((pattern, i) => `
${i + 1}. ${pattern.pattern}
   Frequency: ${pattern.frequency}
   Resolution Strategy: ${pattern.resolution}
   Average Remediation Time: ${pattern.avgRemediationTime}
`).join('\n')}

${'='.repeat(90)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rejection-analysis-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-rejection-analysis">Rejection Analysis</h1>
            <p className="text-lg text-muted-foreground">Systematic refusal remediation and reapplication readiness assessment</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="rejection-analysis"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Rejection Analysis"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-rejection-analysis">
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="remediation" data-testid="tab-remediation">Remediation</TabsTrigger>
              <TabsTrigger value="criteria" data-testid="tab-criteria">Criteria Map</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reapplication Readiness Assessment</CardTitle>
                  <CardDescription>Overall preparedness for new visa application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={readinessScore >= 70 ? "border-green-500" : readinessScore >= 50 ? "border-blue-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Readiness Score</p>
                          <p className="text-4xl font-bold" data-testid="text-readiness-score">{readinessScore}%</p>
                          <Badge 
                            className="mt-2" 
                            style={{ backgroundColor: readinessLevel.color, color: 'white' }}
                            data-testid="badge-readiness-level"
                          >
                            {readinessLevel.label}
                          </Badge>
                          <Progress value={readinessScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Issues</p>
                          <p className="text-3xl font-bold" data-testid="text-total-issues">{rejectionIssues.length}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Identified</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalIssuesCount > 0 ? "border-red-500" : "border-green-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Issues</p>
                          <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-critical-issues">{criticalIssuesCount}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {criticalIssuesCount > 0 ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm">{criticalIssuesCount > 0 ? 'Urgent' : 'None'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Compliance Avg</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-compliance">{avgComplianceLevel}%</p>
                          <Progress value={avgComplianceLevel} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription data-testid="alert-recommendation">
                      <strong>Recommendation:</strong> {readinessLevel.recommendation}
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="app-reference">Application Reference</Label>
                      <Input
                        id="app-reference"
                        value={applicationReference}
                        onChange={(e) => setApplicationReference(e.target.value)}
                        placeholder="e.g., GWF1234567"
                        data-testid="input-app-reference"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refusal-date">Refusal Date</Label>
                      <Input
                        id="refusal-date"
                        type="date"
                        value={refusalDate}
                        onChange={(e) => setRefusalDate(e.target.value)}
                        data-testid="input-refusal-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endorsing-body">Endorsing Body</Label>
                      <Input
                        id="endorsing-body"
                        value={endorsingBody}
                        onChange={(e) => setEndorsingBody(e.target.value)}
                        placeholder="e.g., Tech Nation, Innovator International"
                        data-testid="input-endorsing-body"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reapplication-target">Target Reapplication Date</Label>
                    <Input
                      id="reapplication-target"
                      type="date"
                      value={reapplicationTarget}
                      onChange={(e) => setReapplicationTarget(e.target.value)}
                      data-testid="input-reapplication-target"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                    <CardDescription>Distribution of rejection grounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {issueByCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={issueByCategoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name.split(' ')[0]}: ${entry.value}`}
                          >
                            {issueByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-16">Add rejection issues to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Severity Distribution</CardTitle>
                    <CardDescription>Issue severity breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {severityDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={severityDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="severity" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number, name: string, props: any) => [value, props.payload.label]}
                          />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-16">Add rejection issues to see severity distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rejection Issues Detail</CardTitle>
                      <CardDescription>Systematic breakdown of refusal grounds</CardDescription>
                    </div>
                    <Button onClick={addRejectionIssue} size="sm" data-testid="button-add-issue">
                      Add Issue
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rejectionIssues.map((issue, index) => (
                    <Card key={issue.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`issue-category-${index}`}>Category</Label>
                            <select
                              id={`issue-category-${index}`}
                              value={issue.category}
                              onChange={(e) => updateRejectionIssue(issue.id, 'category', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-issue-category-${index}`}
                            >
                              {Object.keys(ISSUE_CATEGORIES).map(key => (
                                <option key={key} value={key}>
                                  {ISSUE_CATEGORIES[key as keyof typeof ISSUE_CATEGORIES]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`issue-reference-${index}`}>Home Office Reference</Label>
                            <Input
                              id={`issue-reference-${index}`}
                              value={issue.homeOfficeReference}
                              onChange={(e) => updateRejectionIssue(issue.id, 'homeOfficeReference', e.target.value)}
                              placeholder="e.g., Para 3.2, Page 5"
                              data-testid={`input-issue-reference-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`issue-status-${index}`}>Remediation Status</Label>
                            <select
                              id={`issue-status-${index}`}
                              value={issue.remediationStatus}
                              onChange={(e) => updateRejectionIssue(issue.id, 'remediationStatus', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-issue-status-${index}`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`issue-description-${index}`}>Issue Description</Label>
                          <Textarea
                            id={`issue-description-${index}`}
                            value={issue.description}
                            onChange={(e) => updateRejectionIssue(issue.id, 'description', e.target.value)}
                            placeholder="Describe the specific rejection ground from the refusal letter..."
                            className="min-h-[80px]"
                            data-testid={`textarea-issue-description-${index}`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Severity: {issue.severity}/10 ({SEVERITY_LEVELS[issue.severity as keyof typeof SEVERITY_LEVELS]})</Label>
                            {rejectionIssues.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRejectionIssue(issue.id)}
                                data-testid={`button-remove-issue-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[issue.severity]}
                            onValueChange={(v) => updateRejectionIssue(issue.id, 'severity', v[0])}
                            data-testid={`slider-severity-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Remediation Progress Overview</CardTitle>
                  <CardDescription>Track progress on addressing each deficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Actions</p>
                          <p className="text-3xl font-bold" data-testid="text-total-actions">{remediationActions.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-500">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completed</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-completed-actions">{completedRemediations}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Average Progress</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-progress">
                            {Math.round(remediationActions.reduce((sum, a) => sum + a.progress, 0) / Math.max(remediationActions.length, 1))}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {remediationProgressData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={remediationProgressData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="action" width={150} />
                        <Tooltip />
                        <Bar dataKey="progress" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Remediation Actions</CardTitle>
                      <CardDescription>Specific steps to address each rejection ground</CardDescription>
                    </div>
                    <Button onClick={addRemediationAction} size="sm" data-testid="button-add-action">
                      Add Action
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {remediationActions.map((action, index) => (
                    <Card key={action.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`action-issue-${index}`}>Linked Issue</Label>
                            <select
                              id={`action-issue-${index}`}
                              value={action.issueId}
                              onChange={(e) => updateRemediationAction(action.id, 'issueId', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-action-issue-${index}`}
                            >
                              {rejectionIssues.map(issue => (
                                <option key={issue.id} value={issue.id}>
                                  {ISSUE_CATEGORIES[issue.category]} ({issue.id})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`action-priority-${index}`}>Priority</Label>
                            <select
                              id={`action-priority-${index}`}
                              value={action.priority}
                              onChange={(e) => updateRemediationAction(action.id, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-action-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`action-timeline-${index}`}>Timeline</Label>
                            <Input
                              id={`action-timeline-${index}`}
                              value={action.timeline}
                              onChange={(e) => updateRemediationAction(action.id, 'timeline', e.target.value)}
                              placeholder="e.g., 2-4 weeks"
                              data-testid={`input-action-timeline-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`action-description-${index}`}>Action Required</Label>
                          <Textarea
                            id={`action-description-${index}`}
                            value={action.action}
                            onChange={(e) => updateRemediationAction(action.id, 'action', e.target.value)}
                            placeholder="Specific action to address the deficiency..."
                            data-testid={`textarea-action-description-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`action-evidence-${index}`}>Evidence Required</Label>
                          <Textarea
                            id={`action-evidence-${index}`}
                            value={action.evidenceRequired}
                            onChange={(e) => updateRemediationAction(action.id, 'evidenceRequired', e.target.value)}
                            placeholder="What evidence needs to be gathered..."
                            data-testid={`textarea-action-evidence-${index}`}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`action-responsible-${index}`}>Responsible</Label>
                            <Input
                              id={`action-responsible-${index}`}
                              value={action.responsible}
                              onChange={(e) => updateRemediationAction(action.id, 'responsible', e.target.value)}
                              placeholder="Who owns this action"
                              data-testid={`input-action-responsible-${index}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Progress: {action.progress}%</Label>
                              {remediationActions.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRemediationAction(action.id)}
                                  data-testid={`button-remove-action-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Slider
                              min={0}
                              max={100}
                              step={10}
                              value={[action.progress]}
                              onValueChange={(v) => updateRemediationAction(action.id, 'progress', v[0])}
                              data-testid={`slider-action-progress-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Criteria Compliance Mapping</CardTitle>
                      <CardDescription>Map deficiencies to specific Immigration Rules requirements</CardDescription>
                    </div>
                    <Button onClick={addCriteriaMapping} size="sm" data-testid="button-add-criteria">
                      Add Criteria
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                      Average Compliance Level: <span className="font-bold">{avgComplianceLevel}%</span>
                    </p>
                    <Progress value={avgComplianceLevel} className="mt-2" />
                  </div>

                  {criteriaMappings.map((mapping, index) => (
                    <Card key={mapping.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`criteria-name-${index}`}>Criteria Name</Label>
                            <Input
                              id={`criteria-name-${index}`}
                              value={mapping.criteriaName}
                              onChange={(e) => updateCriteriaMapping(mapping.id, 'criteriaName', e.target.value)}
                              placeholder="e.g., Innovation Requirement"
                              data-testid={`input-criteria-name-${index}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Compliance: {mapping.complianceLevel}%</Label>
                              {criteriaMappings.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCriteriaMapping(mapping.id)}
                                  data-testid={`button-remove-criteria-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Slider
                              min={0}
                              max={100}
                              step={10}
                              value={[mapping.complianceLevel]}
                              onValueChange={(v) => updateCriteriaMapping(mapping.id, 'complianceLevel', v[0])}
                              data-testid={`slider-compliance-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`criteria-requirement-${index}`}>Home Office Requirement</Label>
                          <Textarea
                            id={`criteria-requirement-${index}`}
                            value={mapping.homeOfficeRequirement}
                            onChange={(e) => updateCriteriaMapping(mapping.id, 'homeOfficeRequirement', e.target.value)}
                            placeholder="Exact requirement from Immigration Rules..."
                            data-testid={`textarea-criteria-requirement-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`criteria-deficiency-${index}`}>Identified Deficiency</Label>
                          <Textarea
                            id={`criteria-deficiency-${index}`}
                            value={mapping.deficiency}
                            onChange={(e) => updateCriteriaMapping(mapping.id, 'deficiency', e.target.value)}
                            placeholder="What was missing or inadequate..."
                            data-testid={`textarea-criteria-deficiency-${index}`}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`criteria-current-${index}`}>Current Evidence</Label>
                            <Textarea
                              id={`criteria-current-${index}`}
                              value={mapping.currentEvidence}
                              onChange={(e) => updateCriteriaMapping(mapping.id, 'currentEvidence', e.target.value)}
                              placeholder="What you currently have..."
                              data-testid={`textarea-criteria-current-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`criteria-required-${index}`}>Required Evidence</Label>
                            <Textarea
                              id={`criteria-required-${index}`}
                              value={mapping.requiredEvidence}
                              onChange={(e) => updateCriteriaMapping(mapping.id, 'requiredEvidence', e.target.value)}
                              placeholder="What you need to obtain..."
                              data-testid={`textarea-criteria-required-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reapplication Project Plan</CardTitle>
                      <CardDescription>Timeline and milestones for reapplication preparation</CardDescription>
                    </div>
                    <Button onClick={addReapplicationMilestone} size="sm" data-testid="button-add-milestone">
                      Add Milestone
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reapplicationPlan.map((milestone, index) => (
                    <Card key={milestone.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`milestone-name-${index}`}>Milestone</Label>
                            <Input
                              id={`milestone-name-${index}`}
                              value={milestone.milestone}
                              onChange={(e) => updateReapplicationMilestone(milestone.id, 'milestone', e.target.value)}
                              placeholder="e.g., Complete Market Validation"
                              data-testid={`input-milestone-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-week-${index}`}>Week Number</Label>
                            <Input
                              id={`milestone-week-${index}`}
                              type="number"
                              min={1}
                              value={milestone.week}
                              onChange={(e) => updateReapplicationMilestone(milestone.id, 'week', parseInt(e.target.value) || 1)}
                              data-testid={`input-milestone-week-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-status-${index}`}>Status</Label>
                            <select
                              id={`milestone-status-${index}`}
                              value={milestone.status}
                              onChange={(e) => updateReapplicationMilestone(milestone.id, 'status', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-milestone-status-${index}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`milestone-description-${index}`}>Description</Label>
                          <Textarea
                            id={`milestone-description-${index}`}
                            value={milestone.description}
                            onChange={(e) => updateReapplicationMilestone(milestone.id, 'description', e.target.value)}
                            placeholder="Detailed description of milestone..."
                            data-testid={`textarea-milestone-description-${index}`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`milestone-blockers-${index}`}>Blockers/Risks</Label>
                            {reapplicationPlan.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReapplicationMilestone(milestone.id)}
                                data-testid={`button-remove-milestone-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id={`milestone-blockers-${index}`}
                            value={milestone.blockers}
                            onChange={(e) => updateReapplicationMilestone(milestone.id, 'blockers', e.target.value)}
                            placeholder="Any blockers or risks..."
                            data-testid={`textarea-milestone-blockers-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips based on your rejection analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Rejection Patterns 2025</CardTitle>
                  <CardDescription>Most frequent refusal grounds and resolution strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMMON_REJECTION_PATTERNS_2025.map((pattern, index) => (
                      <Card key={index} className="p-4" data-testid={`card-pattern-${index}`}>
                        <h4 className="font-semibold text-sm mb-2">{pattern.pattern}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium min-w-[80px]">Frequency:</span>
                            <span>{pattern.frequency}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium min-w-[80px]">Resolution:</span>
                            <span className="text-muted-foreground">{pattern.resolution}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium min-w-[80px]">Timeline:</span>
                            <span className="text-blue-600 dark:text-blue-400">{pattern.avgRemediationTime}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>8-Week Remediation Action Plan</CardTitle>
                  <CardDescription>Systematic approach to addressing rejection and reapplying successfully</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4" data-testid={`card-action-plan-${index}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <Badge 
                              variant={item.priority === 'Critical' ? 'destructive' : 'default'}
                              data-testid={`badge-priority-${index}`}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-sm">{item.week}</span>
                            </div>
                            <p className="text-sm mb-2">{item.action}</p>
                            <p className="text-xs text-muted-foreground">
                              <strong>UK Context:</strong> {item.ukContext}
                            </p>
                          </div>
                        </div>
                      </Card>
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
