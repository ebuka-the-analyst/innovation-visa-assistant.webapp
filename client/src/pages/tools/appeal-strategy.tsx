import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Scale, FileText, Calendar, Shield } from "lucide-react";
import {
  BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line
} from 'recharts';

type RejectionReason = {
  id: string;
  category: 'innovation' | 'viability' | 'scalability' | 'english' | 'maintenance' | 'genuineness' | 'other';
  description: string;
  homeOfficeReference: string;
};

type AppealGround = {
  id: string;
  type: 'factual_error' | 'law_misapplied' | 'discretion_error' | 'procedural_unfairness' | 'new_evidence';
  description: string;
  legalBasis: string;
  strength: number;
};

type Evidence = {
  id: string;
  type: 'documentary' | 'expert_opinion' | 'financial' | 'commercial' | 'legal' | 'testimonial';
  description: string;
  availability: number;
  impact: number;
  collectionDeadline: string;
};

type LegalArgument = {
  id: string;
  ground: string;
  argument: string;
  caselaw: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type TimelineTask = {
  id: string;
  task: string;
  startWeek: number;
  endWeek: number;
  status: 'not_started' | 'in_progress' | 'completed';
  responsible: string;
};

const REJECTION_CATEGORIES = {
  innovation: 'Innovation Requirement',
  viability: 'Business Viability',
  scalability: 'Scalability Potential',
  english: 'English Language',
  maintenance: 'Maintenance Funds',
  genuineness: 'Genuineness',
  other: 'Other Grounds'
};

const APPEAL_GROUND_TYPES = {
  factual_error: 'Factual Error',
  law_misapplied: 'Law Misapplied',
  discretion_error: 'Discretion Exercised Incorrectly',
  procedural_unfairness: 'Procedural Unfairness',
  new_evidence: 'Material New Evidence'
};

const EVIDENCE_TYPES = {
  documentary: 'Documentary Evidence',
  expert_opinion: 'Expert Opinion',
  financial: 'Financial Records',
  commercial: 'Commercial Contracts',
  legal: 'Legal Documentation',
  testimonial: 'Witness Statements'
};

export default function AppealStrategy() {
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([
    { id: '1', category: 'innovation', description: '', homeOfficeReference: '' }
  ]);
  const [appealGrounds, setAppealGrounds] = useState<AppealGround[]>([
    { id: '1', type: 'factual_error', description: '', legalBasis: '', strength: 5 }
  ]);
  const [evidence, setEvidence] = useState<Evidence[]>([
    { id: '1', type: 'documentary', description: '', availability: 5, impact: 5, collectionDeadline: '' }
  ]);
  const [legalArguments, setLegalArguments] = useState<LegalArgument[]>([
    { id: '1', ground: '', argument: '', caselaw: '', priority: 'high' }
  ]);
  const [timelineTasks, setTimelineTasks] = useState<TimelineTask[]>([
    { id: '1', task: '', startWeek: 1, endWeek: 2, status: 'not_started', responsible: '' }
  ]);
  
  const [applicationReference, setApplicationReference] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [appealDeadline, setAppealDeadline] = useState('');
  const [legalRepresentation, setLegalRepresentation] = useState(false);
  const [activeTab, setActiveTab] = useState('assessment');
  const [savedDate, setSavedDate] = useState('');

  // Rejection Reasons Management
  const addRejectionReason = () => {
    setRejectionReasons([...rejectionReasons, { 
      id: Date.now().toString(), 
      category: 'innovation', 
      description: '', 
      homeOfficeReference: '' 
    }]);
  };

  const updateRejectionReason = (id: string, field: keyof RejectionReason, value: any) => {
    setRejectionReasons(rejectionReasons.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRejectionReason = (id: string) => {
    if (rejectionReasons.length > 1) {
      setRejectionReasons(rejectionReasons.filter(r => r.id !== id));
    }
  };

  // Appeal Grounds Management
  const addAppealGround = () => {
    setAppealGrounds([...appealGrounds, { 
      id: Date.now().toString(), 
      type: 'factual_error', 
      description: '', 
      legalBasis: '', 
      strength: 5 
    }]);
  };

  const updateAppealGround = (id: string, field: keyof AppealGround, value: any) => {
    setAppealGrounds(appealGrounds.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeAppealGround = (id: string) => {
    if (appealGrounds.length > 1) {
      setAppealGrounds(appealGrounds.filter(g => g.id !== id));
    }
  };

  // Evidence Management
  const addEvidence = () => {
    setEvidence([...evidence, { 
      id: Date.now().toString(), 
      type: 'documentary', 
      description: '', 
      availability: 5, 
      impact: 5, 
      collectionDeadline: '' 
    }]);
  };

  const updateEvidence = (id: string, field: keyof Evidence, value: any) => {
    setEvidence(evidence.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvidence = (id: string) => {
    if (evidence.length > 1) {
      setEvidence(evidence.filter(e => e.id !== id));
    }
  };

  // Legal Arguments Management
  const addLegalArgument = () => {
    setLegalArguments([...legalArguments, { 
      id: Date.now().toString(), 
      ground: '', 
      argument: '', 
      caselaw: '', 
      priority: 'medium' 
    }]);
  };

  const updateLegalArgument = (id: string, field: keyof LegalArgument, value: any) => {
    setLegalArguments(legalArguments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeLegalArgument = (id: string) => {
    if (legalArguments.length > 1) {
      setLegalArguments(legalArguments.filter(a => a.id !== id));
    }
  };

  // Timeline Tasks Management
  const addTimelineTask = () => {
    setTimelineTasks([...timelineTasks, { 
      id: Date.now().toString(), 
      task: '', 
      startWeek: 1, 
      endWeek: 2, 
      status: 'not_started', 
      responsible: '' 
    }]);
  };

  const updateTimelineTask = (id: string, field: keyof TimelineTask, value: any) => {
    setTimelineTasks(timelineTasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTimelineTask = (id: string) => {
    if (timelineTasks.length > 1) {
      setTimelineTasks(timelineTasks.filter(t => t.id !== id));
    }
  };

  // Calculations
  const calculateAppealStrength = (): number => {
    const groundsScore = appealGrounds.reduce((sum, g) => sum + g.strength, 0) / appealGrounds.length;
    const evidenceScore = evidence.reduce((sum, e) => sum + ((e.availability + e.impact) / 2), 0) / evidence.length;
    const legalRepScore = legalRepresentation ? 15 : 0;
    const timelinessScore = appealDeadline && new Date(appealDeadline) > new Date() ? 10 : 0;
    
    return Math.round((groundsScore * 4) + (evidenceScore * 4) + legalRepScore + timelinessScore);
  };

  const appealStrength = calculateAppealStrength();

  const getStrengthLevel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Very Strong', color: '#10b981' };
    if (score >= 65) return { label: 'Strong', color: '#3b82f6' };
    if (score >= 50) return { label: 'Moderate', color: '#f59e0b' };
    if (score >= 35) return { label: 'Weak', color: '#ef4444' };
    return { label: 'Very Weak', color: '#dc2626' };
  };

  const strengthLevel = getStrengthLevel(appealStrength);

  const strongGrounds = appealGrounds.filter(g => g.strength >= 7).length;
  const criticalEvidence = evidence.filter(e => e.impact >= 8).length;
  const completedTasks = timelineTasks.filter(t => t.status === 'completed').length;
  const totalTasks = timelineTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Evidence Strength Data for Bar Chart
  const evidenceStrengthData = evidence.map(e => ({
    name: e.description.substring(0, 20) + (e.description.length > 20 ? '...' : ''),
    availability: e.availability,
    impact: e.impact,
    combined: (e.availability + e.impact) / 2,
    type: EVIDENCE_TYPES[e.type]
  }));

  // Timeline Gantt Data
  const timelineGanttData = timelineTasks.map(t => ({
    task: t.task.substring(0, 30) + (t.task.length > 30 ? '...' : ''),
    start: t.startWeek,
    duration: t.endWeek - t.startWeek + 1,
    status: t.status,
    responsible: t.responsible
  }));

  // Appeal Grounds Distribution
  const groundsDistribution = Object.keys(APPEAL_GROUND_TYPES).map(key => ({
    type: APPEAL_GROUND_TYPES[key as keyof typeof APPEAL_GROUND_TYPES],
    count: appealGrounds.filter(g => g.type === key).length,
    avgStrength: appealGrounds.filter(g => g.type === key).length > 0
      ? Math.round(appealGrounds.filter(g => g.type === key).reduce((sum, g) => sum + g.strength, 0) / appealGrounds.filter(g => g.type === key).length)
      : 0
  })).filter(d => d.count > 0);

  const getSerializedState = () => {
    return {
      rejectionReasons,
      appealGrounds,
      evidence,
      legalArguments,
      timelineTasks,
      applicationReference,
      decisionDate,
      appealDeadline,
      legalRepresentation,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('rejectionReasons' in state) setRejectionReasons(state.rejectionReasons);
    if ('appealGrounds' in state) setAppealGrounds(state.appealGrounds);
    if ('evidence' in state) setEvidence(state.evidence);
    if ('legalArguments' in state) setLegalArguments(state.legalArguments);
    if ('timelineTasks' in state) setTimelineTasks(state.timelineTasks);
    if ('applicationReference' in state) setApplicationReference(state.applicationReference);
    if ('decisionDate' in state) setDecisionDate(state.decisionDate);
    if ('appealDeadline' in state) setAppealDeadline(state.appealDeadline);
    if ('legalRepresentation' in state) setLegalRepresentation(state.legalRepresentation);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('appeal-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('appeal-strategy-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('appeal-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (appealStrength < 50) {
      tips.push("Your appeal strength is below 50% - consider seeking specialized immigration legal advice before proceeding");
    }
    
    if (!legalRepresentation) {
      tips.push("Legal representation increases appeal success rates by 40-60% - consider instructing an OISC Level 3 advisor or immigration barrister");
    }
    
    if (appealDeadline && new Date(appealDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      tips.push("URGENT: Your appeal deadline is within 7 days - file immediately to preserve your appeal rights");
    }
    
    if (strongGrounds < 2) {
      tips.push("Aim for at least 2-3 strong grounds (strength 7+) - quality over quantity is critical in UK immigration appeals");
    }
    
    if (criticalEvidence < 1) {
      tips.push("You need high-impact evidence (impact 8+) - focus on obtaining expert opinions, commercial contracts, or independent endorsements");
    }
    
    if (!evidence.some(e => e.type === 'expert_opinion')) {
      tips.push("Expert opinions carry significant weight - consider obtaining assessments from industry specialists or academic researchers");
    }
    
    if (!appealGrounds.some(g => g.type === 'factual_error')) {
      tips.push("Review the refusal notice for factual errors - these are often the strongest grounds as they require minimal legal interpretation");
    }
    
    if (rejectionReasons.some(r => r.category === 'genuineness')) {
      tips.push("Genuineness refusals are serious - gather comprehensive evidence of business activities, premises, customers, and operational history");
    }
    
    if (taskCompletionRate < 40) {
      tips.push("Less than 40% of timeline tasks completed - prioritize critical evidence gathering and legal argument development");
    }
    
    if (appealGrounds.some(g => g.legalBasis.length === 0)) {
      tips.push("Every appeal ground must cite specific Immigration Rules, case law, or statutory provisions - vague grounds will be dismissed");
    }
    
    tips.push("UK First-tier Tribunal (Immigration and Asylum Chamber) expects detailed skeleton arguments - prepare comprehensive written submissions with all evidence indexed");
    
    tips.push("Consider applying for reconsideration/administrative review first if the refusal contains clear caseworker errors - it's faster and cheaper than a full appeal");
    
    return tips.slice(0, 12);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Obtain full refusal notice and prepare detailed analysis of each rejection ground with Home Office references",
        priority: "Critical",
        ukRequirement: "14-day deadline to lodge notice of appeal for in-country appeals"
      },
      { 
        week: "Week 1", 
        action: "Instruct OISC Level 3 immigration advisor or barrister - obtain initial case assessment and appeal prospects evaluation",
        priority: "Critical",
        ukRequirement: "Legal representation significantly improves success rates and ensures procedural compliance"
      },
      { 
        week: "Week 1-2", 
        action: "Complete Notice of Appeal (Form IAFT-6) with clear identification of all appeal grounds and lodge with First-tier Tribunal",
        priority: "Critical",
        ukRequirement: "Must be received within statutory deadline - late appeals require permission to appeal out of time"
      },
      { 
        week: "Week 2", 
        action: "Begin systematic evidence collection for each appeal ground - prioritize documentary evidence and expert opinions",
        priority: "Critical",
        ukRequirement: "Tribunal expects comprehensive evidence bundles with all documents indexed and paginated"
      },
      { 
        week: "Week 2-3", 
        action: "Draft detailed witness statements addressing each refusal ground with specific factual corrections and explanations",
        priority: "High",
        ukRequirement: "Statements must comply with CPR Practice Direction 32 - truth declaration and chronological narrative"
      },
      { 
        week: "Week 3", 
        action: "Obtain expert reports on innovation/viability/scalability if these were refusal grounds - ensure experts have relevant credentials",
        priority: "High",
        ukRequirement: "Expert evidence must be independent, impartial, and address specific Home Office concerns"
      },
      { 
        week: "Week 3-4", 
        action: "Prepare comprehensive skeleton argument citing relevant case law (Patel, Balajigari, Ahmed precedents) and Immigration Rules",
        priority: "Critical",
        ukRequirement: "Skeleton arguments required 5 working days before hearing - must identify legal issues and authorities"
      },
      { 
        week: "Week 4", 
        action: "Assemble and serve appellant's bundle on Home Office Presenting Officer - ensure all evidence properly indexed with witness statements",
        priority: "Critical",
        ukRequirement: "Bundle must be served 5 working days before hearing - failure to comply may result in evidence exclusion"
      },
      { 
        week: "Week 4+", 
        action: "Prepare for hearing with legal team - conduct witness preparation, review cross-examination strategy, and prepare oral submissions",
        priority: "High",
        ukRequirement: "Tribunal hearings are formal court proceedings - thorough preparation essential for credible testimony"
      },
      { 
        week: "Ongoing", 
        action: "Monitor Home Office review bundle and any new evidence they disclose - prepare rebuttal arguments for their submissions",
        priority: "High",
        ukRequirement: "Home Office may introduce new evidence - appellant has right to respond and cross-examine their witnesses"
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - APPEAL STRATEGY ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

CASE REFERENCE INFORMATION
${'-'.repeat(80)}
Application Reference: ${applicationReference || 'Not provided'}
Decision Date: ${decisionDate || 'Not provided'}
Appeal Deadline: ${appealDeadline || 'Not provided'}
Legal Representation: ${legalRepresentation ? 'YES - Instructed' : 'NO - Self-represented'}

APPEAL STRENGTH ASSESSMENT
${'-'.repeat(80)}
Overall Appeal Strength Score: ${appealStrength}/100
Strength Level: ${strengthLevel.label}
Strong Grounds (7+ strength): ${strongGrounds}
Critical Evidence Items: ${criticalEvidence}
Timeline Task Completion: ${taskCompletionRate}%

${appealStrength >= 65 ? 'ASSESSMENT: Strong prospects of success - proceed with appeal' : 
  appealStrength >= 50 ? 'ASSESSMENT: Moderate prospects - seek expert legal advice' :
  'ASSESSMENT: Weak prospects - consider alternative routes or application resubmission'}

REJECTION REASONS IDENTIFIED
${'-'.repeat(80)}
${rejectionReasons.map((reason, i) => `
${i + 1}. Category: ${REJECTION_CATEGORIES[reason.category]}
   Home Office Reference: ${reason.homeOfficeReference || 'Not specified'}
   Description: ${reason.description || 'Not detailed'}
`).join('')}

APPEAL GROUNDS ANALYSIS
${'-'.repeat(80)}
${appealGrounds.map((ground, i) => `
GROUND ${i + 1}: ${APPEAL_GROUND_TYPES[ground.type]}
Strength Rating: ${ground.strength}/10 (${ground.strength >= 7 ? 'STRONG' : ground.strength >= 5 ? 'MODERATE' : 'WEAK'})
Description: ${ground.description || 'Not detailed'}
Legal Basis: ${ground.legalBasis || 'Not specified'}
`).join('')}

GROUNDS DISTRIBUTION
${'-'.repeat(80)}
${groundsDistribution.map(d => `${d.type}: ${d.count} ground${d.count > 1 ? 's' : ''} (Avg Strength: ${d.avgStrength}/10)`).join('\n')}

EVIDENCE PORTFOLIO
${'-'.repeat(80)}
${evidence.map((item, i) => `
EVIDENCE ${i + 1}: ${EVIDENCE_TYPES[item.type]}
Description: ${item.description || 'Not detailed'}
Availability Score: ${item.availability}/10
Impact Score: ${item.impact}/10
Combined Strength: ${((item.availability + item.impact) / 2).toFixed(1)}/10
Collection Deadline: ${item.collectionDeadline || 'Not set'}
Status: ${item.availability >= 8 ? 'READY' : item.availability >= 5 ? 'IN PROGRESS' : 'NEEDS ATTENTION'}
`).join('')}

EVIDENCE STRENGTH ANALYSIS
${'-'.repeat(80)}
Total Evidence Items: ${evidence.length}
High Impact Evidence (8+): ${evidence.filter(e => e.impact >= 8).length}
Readily Available Evidence (8+): ${evidence.filter(e => e.availability >= 8).length}
Evidence Gaps Requiring Urgent Action: ${evidence.filter(e => e.availability < 5 || e.impact < 5).length}

LEGAL ARGUMENTS FRAMEWORK
${'-'.repeat(80)}
${legalArguments.map((arg, i) => `
ARGUMENT ${i + 1}
Priority: ${arg.priority.toUpperCase()}
Ground: ${arg.ground || 'Not specified'}
Legal Argument: ${arg.argument || 'Not detailed'}
Supporting Case Law: ${arg.caselaw || 'Not cited'}
`).join('')}

APPEAL TIMELINE & PROJECT PLAN
${'-'.repeat(80)}
${timelineTasks.map((task, i) => `
TASK ${i + 1}: ${task.task || 'Unnamed task'}
Timeline: Week ${task.startWeek} to Week ${task.endWeek}
Status: ${task.status === 'completed' ? 'COMPLETED' : task.status === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED'}
Responsible: ${task.responsible || 'Not assigned'}
`).join('')}

Task Completion Summary:
- Completed: ${completedTasks}/${totalTasks} (${taskCompletionRate}%)
- In Progress: ${timelineTasks.filter(t => t.status === 'in_progress').length}
- Not Started: ${timelineTasks.filter(t => t.status === 'not_started').length}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK CRITICAL ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `
[${item.priority}] ${item.week}: ${item.action}
UK Legal Requirement: ${item.ukRequirement}
`).join('\n')}

UK IMMIGRATION APPEAL PROCESS 2025 - KEY REQUIREMENTS
${'-'.repeat(80)}

1. APPEAL DEADLINES
   - In-country refusals: 14 calendar days from receipt of decision
   - Out-of-country refusals: 28 calendar days from receipt of decision
   - Late appeals: Require application for permission to appeal out of time with explanation
   - Time limits are strictly enforced - missing deadline may forfeit appeal rights

2. APPEAL JURISDICTION
   - First-tier Tribunal (Immigration and Asylum Chamber)
   - Limited grounds: Points-based system refusals generally not appealable
   - Innovator Founder refusals: Usually Human Rights (Article 8) or Protection grounds only
   - Administrative Review may be available for caseworker errors

3. LEGAL REPRESENTATION
   - OISC Level 3 advisor or immigration barrister strongly recommended
   - Self-representation permitted but significantly reduces success rates
   - Legal aid not available for immigration appeals (except asylum/human rights)
   - Average legal fees: £3,000-£10,000 depending on case complexity

4. EVIDENCE REQUIREMENTS
   - Comprehensive evidence bundle with all documents indexed and paginated
   - Witness statements complying with CPR Practice Direction 32
   - Expert reports from qualified professionals with CV and credentials
   - All evidence must be disclosed to Home Office 5 working days before hearing
   - Late evidence requires tribunal permission and may be excluded

5. SKELETON ARGUMENTS
   - Required 5 working days before hearing
   - Must identify legal issues, cite relevant authorities, and cross-reference evidence
   - Typical length: 10-20 pages for complex business immigration appeals
   - Failure to file may result in adverse costs or case dismissal

6. HEARING PROCEDURE
   - Formal court proceeding before Immigration Judge
   - Appellant gives evidence under oath and may be cross-examined
   - Home Office Presenting Officer represents Secretary of State
   - Hearing duration: 2-4 hours for standard business immigration appeals
   - Decision: Promulgated within 10 working days (written determination)

7. APPEAL OUTCOMES
   - Allowed: Original decision set aside, Home Office must reconsider application
   - Dismissed: Original refusal upheld, application definitively rejected
   - Further appeal: Permission to appeal to Upper Tribunal on points of law only
   - Success rates: Approximately 30-40% for business immigration appeals

8. COSTS AND FEES
   - Appeal fee: £140 (as of 2025, subject to change)
   - No tribunal costs awards unless case deemed totally without merit
   - Applicant bears own legal costs regardless of outcome
   - Consider cost-benefit analysis before proceeding with weak cases

9. ALTERNATIVE REMEDIES
   - Administrative Review: £80 fee, available for caseworker errors only
   - Judicial Review: High Court challenge, strict time limits, expensive
   - Fresh application: May be more cost-effective if circumstances changed
   - Pre-action protocol letter: May prompt Home Office reconsideration

10. POST-DECISION OPTIONS
    - If appeal allowed: Home Office reconsiders within 28 days
    - If appeal dismissed: No further appeal on facts, only Upper Tribunal on law
    - Deportation concerns: Separate appeal rights if deportation order made
    - Voluntary departure: Consider if appeal prospects weak to avoid enforcement

CASE LAW PRECEDENTS RELEVANT TO INNOVATOR FOUNDER APPEALS
${'-'.repeat(80)}
- Patel & Others v SSHD [2013]: Standard of proof in business immigration
- Balajigari v SSHD [2019]: Assessment of business viability and scalability
- Ahmed (benefits: proof of receipt) Pakistan [2010]: Evidence standards
- Mahad (Ethiopian Passports) [2009]: Document authentication principles
- SM and Qadir (ETS: TOEIC testing) [2016]: English language evidence
- Devaseelan (second appeals) [2002]: Principles for subsequent applications

COMPLIANCE CERTIFICATION
${'-'.repeat(80)}
This appeal strategy analysis has been prepared in accordance with:
- Tribunal Procedure (First-tier Tribunal) (Immigration and Asylum Chamber) Rules 2014
- Practice Directions of the Immigration and Asylum Chambers
- Civil Procedure Rules (CPR) Part 32 (Evidence)
- Immigration Rules Appendix Innovator Founder
- Home Office Caseworker Guidance on Innovator Founder applications

This is a working document and should be reviewed by qualified legal representation
before finalizing appeal submissions. The analysis is based on information provided
and may not reflect all case-specific circumstances.

NEXT STEPS
${'-'.repeat(80)}
1. Urgent: Verify appeal deadline and lodge notice of appeal if within deadline
2. Instruct qualified legal representation (OISC Level 3/immigration barrister)
3. Begin systematic evidence collection prioritizing high-impact items
4. Draft comprehensive witness statements addressing all refusal grounds
5. Obtain expert reports on innovation/viability if these were refusal reasons
6. Prepare detailed skeleton argument with case law citations
7. Assemble and serve evidence bundle on Home Office 5 days before hearing
8. Conduct thorough hearing preparation with legal team

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This is a strategic planning tool only and does not constitute legal advice.
Immigration appeals are complex legal proceedings requiring specialized expertise. You
must seek advice from a qualified immigration lawyer (OISC Level 3 or barrister) before
proceeding with an appeal. The analysis is based on publicly available information and
general UK immigration law principles current as of 2025. Individual case outcomes depend
on specific facts and circumstances. No guarantee of success is provided or implied.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appeal-strategy-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-appeal-strategy">Visa Appeal Strategy Planner</h1>
            <p className="text-lg text-muted-foreground">UK Immigration Appeal preparation and strength assessment for Innovator Founder refusals</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="appeal-strategy"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Appeal Strategy Planner"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-appeal-strategy">
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="grounds" data-testid="tab-grounds">Appeal Grounds</TabsTrigger>
              <TabsTrigger value="evidence" data-testid="tab-evidence">Evidence</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Appeal Strength Assessment
                  </CardTitle>
                  <CardDescription>Comprehensive analysis of your appeal prospects under UK Immigration Rules 2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="border-primary">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Appeal Strength</p>
                          <p className="text-4xl font-bold" style={{ color: strengthLevel.color }} data-testid="text-appeal-strength">{appealStrength}%</p>
                          <Badge className="mt-2" style={{ backgroundColor: strengthLevel.color }}>{strengthLevel.label}</Badge>
                          <Progress value={appealStrength} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Strong Grounds</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-strong-grounds">{strongGrounds}</p>
                          <p className="text-xs text-muted-foreground mt-1">of {appealGrounds.length} total</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Evidence</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-critical-evidence">{criticalEvidence}</p>
                          <p className="text-xs text-muted-foreground mt-1">high-impact items</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Timeline Progress</p>
                          <p className="text-3xl font-bold text-blue-600" data-testid="text-timeline-progress">{taskCompletionRate}%</p>
                          <Progress value={taskCompletionRate} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {appealStrength < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your appeal strength is below 50% - serious concerns about prospects of success. Strongly recommend obtaining expert legal advice from an OISC Level 3 advisor or immigration barrister before proceeding.
                      </AlertDescription>
                    </Alert>
                  )}

                  {appealStrength >= 65 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Strong appeal prospects - your case has solid grounds and supporting evidence. Ensure all procedural requirements are met and consider professional representation to maximize success.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Case Information</h3>
                      
                      <div>
                        <Label htmlFor="application-reference">Application Reference Number</Label>
                        <Input
                          id="application-reference"
                          value={applicationReference}
                          onChange={(e) => setApplicationReference(e.target.value)}
                          placeholder="GWF-12345678/2025"
                          data-testid="input-application-reference"
                        />
                      </div>

                      <div>
                        <Label htmlFor="decision-date">Decision Date</Label>
                        <Input
                          id="decision-date"
                          type="date"
                          value={decisionDate}
                          onChange={(e) => setDecisionDate(e.target.value)}
                          data-testid="input-decision-date"
                        />
                      </div>

                      <div>
                        <Label htmlFor="appeal-deadline">Appeal Deadline</Label>
                        <Input
                          id="appeal-deadline"
                          type="date"
                          value={appealDeadline}
                          onChange={(e) => setAppealDeadline(e.target.value)}
                          data-testid="input-appeal-deadline"
                        />
                        {appealDeadline && new Date(appealDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            URGENT: Deadline approaching - act immediately
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="legal-representation"
                          type="checkbox"
                          checked={legalRepresentation}
                          onChange={(e) => setLegalRepresentation(e.target.checked)}
                          className="h-4 w-4"
                          data-testid="checkbox-legal-representation"
                        />
                        <Label htmlFor="legal-representation" className="cursor-pointer">
                          Legal representation instructed (OISC Level 3/Barrister)
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Rejection Reasons</h3>
                      <Button onClick={addRejectionReason} size="sm" data-testid="button-add-rejection">
                        Add Rejection Reason
                      </Button>

                      {rejectionReasons.map((reason, index) => (
                        <Card key={reason.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Category</Label>
                              {rejectionReasons.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRejectionReason(reason.id)}
                                  data-testid={`button-remove-rejection-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <select
                              value={reason.category}
                              onChange={(e) => updateRejectionReason(reason.id, 'category', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-rejection-category-${index}`}
                            >
                              {Object.entries(REJECTION_CATEGORIES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>

                            <div>
                              <Label htmlFor={`rejection-desc-${reason.id}`}>Description</Label>
                              <Textarea
                                id={`rejection-desc-${reason.id}`}
                                value={reason.description}
                                onChange={(e) => updateRejectionReason(reason.id, 'description', e.target.value)}
                                placeholder="Describe the specific rejection reason..."
                                rows={2}
                                data-testid={`textarea-rejection-description-${index}`}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`rejection-ref-${reason.id}`}>Home Office Reference</Label>
                              <Input
                                id={`rejection-ref-${reason.id}`}
                                value={reason.homeOfficeReference}
                                onChange={(e) => updateRejectionReason(reason.id, 'homeOfficeReference', e.target.value)}
                                placeholder="Paragraph/page reference in refusal notice"
                                data-testid={`input-rejection-reference-${index}`}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grounds" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Appeal Grounds & Legal Arguments
                  </CardTitle>
                  <CardDescription>Identify and develop grounds for appealing the refusal decision</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Appeal Grounds</h3>
                    <Button onClick={addAppealGround} size="sm" data-testid="button-add-appeal-ground">
                      Add Ground
                    </Button>
                  </div>

                  {appealGrounds.map((ground, index) => (
                    <Card key={ground.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Ground {index + 1}</Badge>
                          {appealGrounds.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAppealGround(ground.id)}
                              data-testid={`button-remove-ground-${index}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`ground-type-${ground.id}`}>Ground Type</Label>
                          <select
                            id={`ground-type-${ground.id}`}
                            value={ground.type}
                            onChange={(e) => updateAppealGround(ground.id, 'type', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-ground-type-${index}`}
                          >
                            {Object.entries(APPEAL_GROUND_TYPES).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor={`ground-desc-${ground.id}`}>Ground Description</Label>
                          <Textarea
                            id={`ground-desc-${ground.id}`}
                            value={ground.description}
                            onChange={(e) => updateAppealGround(ground.id, 'description', e.target.value)}
                            placeholder="Detailed description of the appeal ground..."
                            rows={3}
                            data-testid={`textarea-ground-description-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`ground-legal-${ground.id}`}>Legal Basis (Immigration Rules, Case Law, Statute)</Label>
                          <Textarea
                            id={`ground-legal-${ground.id}`}
                            value={ground.legalBasis}
                            onChange={(e) => updateAppealGround(ground.id, 'legalBasis', e.target.value)}
                            placeholder="Cite specific Immigration Rules paragraphs, case law precedents, or statutory provisions..."
                            rows={2}
                            data-testid={`textarea-ground-legal-basis-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`ground-strength-${ground.id}`}>Ground Strength (1-10)</Label>
                          <div className="flex items-center gap-4">
                            <input
                              id={`ground-strength-${ground.id}`}
                              type="range"
                              min="1"
                              max="10"
                              value={ground.strength}
                              onChange={(e) => updateAppealGround(ground.id, 'strength', parseInt(e.target.value))}
                              className="flex-1"
                              data-testid={`slider-ground-strength-${index}`}
                            />
                            <Badge 
                              className="w-16 justify-center"
                              variant={ground.strength >= 7 ? "default" : ground.strength >= 5 ? "secondary" : "outline"}
                            >
                              {ground.strength}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ground.strength >= 7 ? 'Strong ground - high prospects' : 
                             ground.strength >= 5 ? 'Moderate ground - arguable' : 
                             'Weak ground - requires strengthening'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {groundsDistribution.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Grounds Distribution Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={groundsDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Avg Strength', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Number of Grounds" />
                            <Bar yAxisId="right" dataKey="avgStrength" fill="#10b981" name="Average Strength" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Legal Arguments</h3>
                      <Button onClick={addLegalArgument} size="sm" data-testid="button-add-legal-argument">
                        Add Argument
                      </Button>
                    </div>

                    {legalArguments.map((arg, index) => (
                      <Card key={arg.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant={arg.priority === 'critical' ? 'destructive' : arg.priority === 'high' ? 'default' : 'secondary'}>
                              {arg.priority.toUpperCase()}
                            </Badge>
                            {legalArguments.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLegalArgument(arg.id)}
                                data-testid={`button-remove-argument-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`arg-priority-${arg.id}`}>Priority Level</Label>
                            <select
                              id={`arg-priority-${arg.id}`}
                              value={arg.priority}
                              onChange={(e) => updateLegalArgument(arg.id, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-argument-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor={`arg-ground-${arg.id}`}>Related Appeal Ground</Label>
                            <Input
                              id={`arg-ground-${arg.id}`}
                              value={arg.ground}
                              onChange={(e) => updateLegalArgument(arg.id, 'ground', e.target.value)}
                              placeholder="Which appeal ground does this argument support?"
                              data-testid={`input-argument-ground-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`arg-argument-${arg.id}`}>Legal Argument</Label>
                            <Textarea
                              id={`arg-argument-${arg.id}`}
                              value={arg.argument}
                              onChange={(e) => updateLegalArgument(arg.id, 'argument', e.target.value)}
                              placeholder="Detailed legal argument with reasoning..."
                              rows={3}
                              data-testid={`textarea-argument-text-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`arg-caselaw-${arg.id}`}>Supporting Case Law & Authorities</Label>
                            <Textarea
                              id={`arg-caselaw-${arg.id}`}
                              value={arg.caselaw}
                              onChange={(e) => updateLegalArgument(arg.id, 'caselaw', e.target.value)}
                              placeholder="Cite relevant case law: e.g., Patel & Others v SSHD [2013] UKUT 00368..."
                              rows={2}
                              data-testid={`textarea-argument-caselaw-${index}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Evidence Portfolio
                  </CardTitle>
                  <CardDescription>Catalog and assess evidence to support your appeal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Evidence Items</h3>
                    <Button onClick={addEvidence} size="sm" data-testid="button-add-evidence">
                      Add Evidence
                    </Button>
                  </div>

                  {evidence.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge style={{ backgroundColor: item.impact >= 8 ? '#10b981' : item.impact >= 5 ? '#3b82f6' : '#6b7280' }}>
                            {EVIDENCE_TYPES[item.type]}
                          </Badge>
                          {evidence.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEvidence(item.id)}
                              data-testid={`button-remove-evidence-${index}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`evidence-type-${item.id}`}>Evidence Type</Label>
                          <select
                            id={`evidence-type-${item.id}`}
                            value={item.type}
                            onChange={(e) => updateEvidence(item.id, 'type', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-evidence-type-${index}`}
                          >
                            {Object.entries(EVIDENCE_TYPES).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor={`evidence-desc-${item.id}`}>Evidence Description</Label>
                          <Textarea
                            id={`evidence-desc-${item.id}`}
                            value={item.description}
                            onChange={(e) => updateEvidence(item.id, 'description', e.target.value)}
                            placeholder="Describe the evidence item..."
                            rows={2}
                            data-testid={`textarea-evidence-description-${index}`}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`evidence-availability-${item.id}`}>Availability Score (1-10)</Label>
                            <div className="flex items-center gap-4">
                              <input
                                id={`evidence-availability-${item.id}`}
                                type="range"
                                min="1"
                                max="10"
                                value={item.availability}
                                onChange={(e) => updateEvidence(item.id, 'availability', parseInt(e.target.value))}
                                className="flex-1"
                                data-testid={`slider-evidence-availability-${index}`}
                              />
                              <span className="font-bold w-8 text-center">{item.availability}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              How readily available is this evidence?
                            </p>
                          </div>

                          <div>
                            <Label htmlFor={`evidence-impact-${item.id}`}>Impact Score (1-10)</Label>
                            <div className="flex items-center gap-4">
                              <input
                                id={`evidence-impact-${item.id}`}
                                type="range"
                                min="1"
                                max="10"
                                value={item.impact}
                                onChange={(e) => updateEvidence(item.id, 'impact', parseInt(e.target.value))}
                                className="flex-1"
                                data-testid={`slider-evidence-impact-${index}`}
                              />
                              <span className="font-bold w-8 text-center">{item.impact}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              How impactful will this evidence be?
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`evidence-deadline-${item.id}`}>Collection Deadline</Label>
                          <Input
                            id={`evidence-deadline-${item.id}`}
                            type="date"
                            value={item.collectionDeadline}
                            onChange={(e) => updateEvidence(item.id, 'collectionDeadline', e.target.value)}
                            data-testid={`input-evidence-deadline-${index}`}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Combined Strength:</span>
                          <Badge variant={((item.availability + item.impact) / 2) >= 7 ? "default" : "secondary"}>
                            {((item.availability + item.impact) / 2).toFixed(1)}/10
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {evidenceStrengthData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Evidence Strength Analysis</CardTitle>
                        <CardDescription>Availability and impact assessment for each evidence item</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={evidenceStrengthData} layout="vertical" margin={{ left: 150 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 10]} />
                            <YAxis dataKey="name" type="category" width={140} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="availability" fill="#3b82f6" name="Availability" />
                            <Bar dataKey="impact" fill="#10b981" name="Impact" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Appeal Timeline & Task Management
                  </CardTitle>
                  <CardDescription>Plan and track critical tasks with deadlines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Timeline Tasks</h3>
                    <Button onClick={addTimelineTask} size="sm" data-testid="button-add-timeline-task">
                      Add Task
                    </Button>
                  </div>

                  {timelineTasks.map((task, index) => (
                    <Card key={task.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </Badge>
                          {timelineTasks.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimelineTask(task.id)}
                              data-testid={`button-remove-task-${index}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`task-desc-${task.id}`}>Task Description</Label>
                          <Textarea
                            id={`task-desc-${task.id}`}
                            value={task.task}
                            onChange={(e) => updateTimelineTask(task.id, 'task', e.target.value)}
                            placeholder="Describe the task..."
                            rows={2}
                            data-testid={`textarea-task-description-${index}`}
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`task-start-${task.id}`}>Start Week</Label>
                            <Input
                              id={`task-start-${task.id}`}
                              type="number"
                              min="1"
                              max="12"
                              value={task.startWeek}
                              onChange={(e) => updateTimelineTask(task.id, 'startWeek', parseInt(e.target.value) || 1)}
                              data-testid={`input-task-start-week-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`task-end-${task.id}`}>End Week</Label>
                            <Input
                              id={`task-end-${task.id}`}
                              type="number"
                              min="1"
                              max="12"
                              value={task.endWeek}
                              onChange={(e) => updateTimelineTask(task.id, 'endWeek', parseInt(e.target.value) || 2)}
                              data-testid={`input-task-end-week-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`task-status-${task.id}`}>Status</Label>
                            <select
                              id={`task-status-${task.id}`}
                              value={task.status}
                              onChange={(e) => updateTimelineTask(task.id, 'status', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-task-status-${index}`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`task-responsible-${task.id}`}>Responsible Person/Team</Label>
                          <Input
                            id={`task-responsible-${task.id}`}
                            value={task.responsible}
                            onChange={(e) => updateTimelineTask(task.id, 'responsible', e.target.value)}
                            placeholder="Who is responsible for this task?"
                            data-testid={`input-task-responsible-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {timelineGanttData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline Gantt Chart</CardTitle>
                        <CardDescription>Visual representation of task schedule (weeks 1-12)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={Math.max(300, timelineGanttData.length * 40)}>
                          <ComposedChart 
                            data={timelineGanttData} 
                            layout="vertical"
                            margin={{ left: 200, right: 20, top: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 12]} label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                            <YAxis dataKey="task" type="category" width={180} />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold">{data.task}</p>
                                      <p className="text-sm">Week {data.start} - {data.start + data.duration - 1}</p>
                                      <p className="text-sm">Duration: {data.duration} week{data.duration > 1 ? 's' : ''}</p>
                                      <p className="text-sm">Status: {data.status.replace('_', ' ')}</p>
                                      <p className="text-sm">Responsible: {data.responsible || 'Not assigned'}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="duration" stackId="a" fill="#3b82f6">
                              {timelineGanttData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.status === 'completed' ? '#10b981' : entry.status === 'in_progress' ? '#f59e0b' : '#6b7280'}
                                />
                              ))}
                            </Bar>
                            <Line 
                              dataKey="start" 
                              stroke="#dc2626" 
                              strokeWidth={0}
                              dot={{ r: 0 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span>Completed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span>In Progress</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-500 rounded"></div>
                            <span>Not Started</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Smart Tips & Recommendations
                  </CardTitle>
                  <CardDescription>Expert guidance for strengthening your appeal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    4-Week Critical Action Plan
                  </CardTitle>
                  <CardDescription>Prioritized timeline for appeal preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.priority === 'Critical' ? 'destructive' : 'default'}>
                              {item.priority}
                            </Badge>
                            <span className="font-semibold">{item.week}</span>
                          </div>
                          <p className="text-sm">{item.action}</p>
                          <div className="flex items-start gap-2 pt-2 border-t">
                            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">{item.ukRequirement}</p>
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
