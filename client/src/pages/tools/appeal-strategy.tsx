import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Scale, FileText, Calendar, Shield } from "lucide-react";
import {
  BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

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

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'appeal-strategy',
  toolName: 'Appeal Strategy Planner',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I understand facing a visa refusal is challenging. Let me help you build a strong appeal strategy that addresses each rejection ground systematically with proper legal compliance. We'll create a comprehensive plan together.",
  questions: [
    {
      id: 'application-ref',
      question: "What is your application reference number from the Home Office decision letter?",
      hint: "This is typically a combination of letters and numbers on your refusal notice",
      fieldKey: 'application_reference',
      minLength: 5
    },
    {
      id: 'decision-date',
      question: "When was your application refused? What is the date on your decision letter?",
      hint: "This is important for calculating appeal deadlines",
      fieldKey: 'decision_date'
    },
    {
      id: 'primary-rejection',
      question: "What was the primary reason given for your refusal? Please describe the main rejection ground from your decision letter.",
      hint: "Quote directly from the refusal letter if possible",
      fieldKey: 'primary_rejection',
      minLength: 50
    },
    {
      id: 'factual-errors',
      question: "Were there any factual errors in the decision? Did the Home Office misunderstand or misstate any facts about your application?",
      hint: "Factual errors are often the strongest grounds for appeal",
      fieldKey: 'factual_errors',
      minLength: 30
    },
    {
      id: 'new-evidence',
      question: "Do you have any new evidence that wasn't in your original application? What additional documentation can you now provide?",
      hint: "This could include contracts signed after submission, new partnerships, or additional financial proof",
      fieldKey: 'new_evidence',
      minLength: 30
    },
    {
      id: 'legal-rep',
      question: "Do you have legal representation for your appeal? Have you instructed an OISC-registered adviser or immigration barrister?",
      hint: "Legal representation significantly improves success rates",
      fieldKey: 'legal_representation'
    }
  ]
};

export default function AppealStrategy() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('appeal-strategy-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('appeal-strategy-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('appeal-strategy-mode', mode);
  }, [mode]);

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

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.application_reference) setApplicationReference(answers.application_reference);
    if (answers.decision_date) setDecisionDate(answers.decision_date);
    if (answers.primary_rejection) {
      setRejectionReasons([{
        id: '1',
        category: 'innovation',
        description: answers.primary_rejection,
        homeOfficeReference: ''
      }]);
    }
    if (answers.factual_errors) {
      setAppealGrounds([{
        id: '1',
        type: 'factual_error',
        description: answers.factual_errors,
        legalBasis: '',
        strength: 7
      }]);
    }
    if (answers.new_evidence) {
      setEvidence([{
        id: '1',
        type: 'documentary',
        description: answers.new_evidence,
        availability: 5,
        impact: 7,
        collectionDeadline: ''
      }]);
    }
    if (answers.legal_representation?.toLowerCase().includes('yes')) {
      setLegalRepresentation(true);
    }
    setMode('traditional');
    toast({
      title: "AI Assessment Complete",
      description: "Your appeal strategy has been populated based on your answers.",
    });
  };

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

  const evidenceStrengthData = evidence.map(e => ({
    name: e.description.substring(0, 20) + (e.description.length > 20 ? '...' : ''),
    availability: e.availability,
    impact: e.impact,
    combined: (e.availability + e.impact) / 2,
    type: EVIDENCE_TYPES[e.type]
  }));

  const timelineGanttData = timelineTasks.map(t => ({
    task: t.task.substring(0, 30) + (t.task.length > 30 ? '...' : ''),
    start: t.startWeek,
    duration: t.endWeek - t.startWeek + 1,
    status: t.status,
    responsible: t.responsible
  }));

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
    const handoffKey = 'appeal-strategy_handoff';
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
      const saved = localStorage.getItem('appeal-strategy-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
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

  const handleExportWord = async () => {
    await generateWord({
      title: 'Appeal Strategy Analysis',
      subtitle: `Appeal Strength: ${appealStrength}%`,
      filename: `appeal-strategy-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Case Overview', level: 1 },
        { type: 'paragraph', content: `Application Reference: ${applicationReference}` },
        { type: 'paragraph', content: `Decision Date: ${decisionDate}` },
        { type: 'paragraph', content: `Appeal Deadline: ${appealDeadline}` },
        { type: 'paragraph', content: `Legal Representation: ${legalRepresentation ? 'Yes' : 'No'}` },
        { type: 'divider' },
        { type: 'heading', content: 'Appeal Strength Assessment', level: 1 },
        { type: 'score', score: { value: appealStrength, max: 100, label: 'Appeal Strength' } },
        { type: 'paragraph', content: `Strength Level: ${strengthLevel.label}` },
        { type: 'divider' },
        { type: 'heading', content: 'Rejection Reasons', level: 1 },
        ...rejectionReasons.map(r => ({ type: 'paragraph' as const, content: `${REJECTION_CATEGORIES[r.category]}: ${r.description}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Appeal Grounds', level: 1 },
        ...appealGrounds.map(g => ({ type: 'paragraph' as const, content: `${APPEAL_GROUND_TYPES[g.type]} (Strength: ${g.strength}/10): ${g.description}` })),
        { type: 'divider' },
        { type: 'heading', content: 'Evidence Portfolio', level: 1 },
        ...evidence.map(e => ({ type: 'paragraph' as const, content: `${EVIDENCE_TYPES[e.type]}: ${e.description} (Impact: ${e.impact}/10)` })),
        { type: 'divider' },
        { type: 'heading', content: 'Smart Recommendations', level: 1 },
        { type: 'list', items: getSmartTips() }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <ToolUtilityBar
          toolId="appeal-strategy"
          toolName="Appeal Strategy Planner"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Appeal Strategy Planner
              </CardTitle>
              <CardDescription>
                Build a comprehensive appeal strategy for visa refusals
              </CardDescription>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Appeal Strength</span>
                    <Badge style={{ backgroundColor: strengthLevel.color }}>{strengthLevel.label}</Badge>
                  </div>
                  <Progress value={appealStrength} className="h-3" />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="grounds" data-testid="tab-grounds">Grounds</TabsTrigger>
                    <TabsTrigger value="evidence" data-testid="tab-evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="arguments" data-testid="tab-arguments">Arguments</TabsTrigger>
                    <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assessment" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Application Reference</Label>
                        <Input
                          value={applicationReference}
                          onChange={(e) => setApplicationReference(e.target.value)}
                          placeholder="e.g., GWF123456789"
                          data-testid="input-app-reference"
                        />
                      </div>
                      <div>
                        <Label>Decision Date</Label>
                        <Input
                          type="date"
                          value={decisionDate}
                          onChange={(e) => setDecisionDate(e.target.value)}
                          data-testid="input-decision-date"
                        />
                      </div>
                      <div>
                        <Label>Appeal Deadline</Label>
                        <Input
                          type="date"
                          value={appealDeadline}
                          onChange={(e) => setAppealDeadline(e.target.value)}
                          data-testid="input-appeal-deadline"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="legal-rep"
                          checked={legalRepresentation}
                          onChange={(e) => setLegalRepresentation(e.target.checked)}
                          className="rounded border-gray-300"
                          data-testid="checkbox-legal-rep"
                        />
                        <Label htmlFor="legal-rep">Legal Representation Instructed</Label>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-6">Rejection Reasons</h3>
                    {rejectionReasons.map((reason, index) => (
                      <Card key={reason.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <select
                              value={reason.category}
                              onChange={(e) => updateRejectionReason(reason.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-rejection-category-${index}`}
                            >
                              {Object.entries(REJECTION_CATEGORIES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Home Office Reference</Label>
                            <Input
                              value={reason.homeOfficeReference}
                              onChange={(e) => updateRejectionReason(reason.id, 'homeOfficeReference', e.target.value)}
                              placeholder="Paragraph/section reference"
                              data-testid={`input-rejection-ref-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              value={reason.description}
                              onChange={(e) => updateRejectionReason(reason.id, 'description', e.target.value)}
                              placeholder="Describe the rejection reason in detail"
                              data-testid={`input-rejection-desc-${index}`}
                            />
                          </div>
                        </div>
                        {rejectionReasons.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeRejectionReason(reason.id)}
                            data-testid={`button-remove-rejection-${index}`}
                          >
                            Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addRejectionReason} data-testid="button-add-rejection">
                      Add Rejection Reason
                    </Button>
                  </TabsContent>

                  <TabsContent value="grounds" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Appeal Grounds</h3>
                    {appealGrounds.map((ground, index) => (
                      <Card key={ground.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Ground Type</Label>
                            <select
                              value={ground.type}
                              onChange={(e) => updateAppealGround(ground.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-ground-type-${index}`}
                            >
                              {Object.entries(APPEAL_GROUND_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Strength (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={ground.strength}
                              onChange={(e) => updateAppealGround(ground.id, 'strength', parseInt(e.target.value) || 5)}
                              data-testid={`input-ground-strength-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              value={ground.description}
                              onChange={(e) => updateAppealGround(ground.id, 'description', e.target.value)}
                              placeholder="Describe this appeal ground"
                              data-testid={`input-ground-desc-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Legal Basis</Label>
                            <Textarea
                              value={ground.legalBasis}
                              onChange={(e) => updateAppealGround(ground.id, 'legalBasis', e.target.value)}
                              placeholder="Cite Immigration Rules, case law, or statutory provisions"
                              data-testid={`input-ground-legal-${index}`}
                            />
                          </div>
                        </div>
                        {appealGrounds.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeAppealGround(ground.id)}
                            data-testid={`button-remove-ground-${index}`}
                          >
                            Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addAppealGround} data-testid="button-add-ground">
                      Add Appeal Ground
                    </Button>
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Evidence Portfolio</h3>
                    {evidence.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Evidence Type</Label>
                            <select
                              value={item.type}
                              onChange={(e) => updateEvidence(item.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-evidence-type-${index}`}
                            >
                              {Object.entries(EVIDENCE_TYPES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Collection Deadline</Label>
                            <Input
                              type="date"
                              value={item.collectionDeadline}
                              onChange={(e) => updateEvidence(item.id, 'collectionDeadline', e.target.value)}
                              data-testid={`input-evidence-deadline-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Availability (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={item.availability}
                              onChange={(e) => updateEvidence(item.id, 'availability', parseInt(e.target.value) || 5)}
                              data-testid={`input-evidence-availability-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Impact (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={item.impact}
                              onChange={(e) => updateEvidence(item.id, 'impact', parseInt(e.target.value) || 5)}
                              data-testid={`input-evidence-impact-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateEvidence(item.id, 'description', e.target.value)}
                              placeholder="Describe this evidence and its relevance"
                              data-testid={`input-evidence-desc-${index}`}
                            />
                          </div>
                        </div>
                        {evidence.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeEvidence(item.id)}
                            data-testid={`button-remove-evidence-${index}`}
                          >
                            Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addEvidence} data-testid="button-add-evidence">
                      Add Evidence
                    </Button>
                  </TabsContent>

                  <TabsContent value="arguments" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Legal Arguments</h3>
                    {legalArguments.map((arg, index) => (
                      <Card key={arg.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Related Ground</Label>
                            <Input
                              value={arg.ground}
                              onChange={(e) => updateLegalArgument(arg.id, 'ground', e.target.value)}
                              placeholder="Which appeal ground does this support?"
                              data-testid={`input-arg-ground-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <select
                              value={arg.priority}
                              onChange={(e) => updateLegalArgument(arg.id, 'priority', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-arg-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Argument</Label>
                            <Textarea
                              value={arg.argument}
                              onChange={(e) => updateLegalArgument(arg.id, 'argument', e.target.value)}
                              placeholder="State your legal argument"
                              data-testid={`input-arg-argument-${index}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Supporting Case Law</Label>
                            <Textarea
                              value={arg.caselaw}
                              onChange={(e) => updateLegalArgument(arg.id, 'caselaw', e.target.value)}
                              placeholder="Cite relevant case law and precedents"
                              data-testid={`input-arg-caselaw-${index}`}
                            />
                          </div>
                        </div>
                        {legalArguments.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeLegalArgument(arg.id)}
                            data-testid={`button-remove-arg-${index}`}
                          >
                            Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addLegalArgument} data-testid="button-add-argument">
                      Add Legal Argument
                    </Button>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4 mt-4">
                    <h3 className="text-lg font-semibold">Appeal Timeline</h3>
                    {timelineTasks.map((task, index) => (
                      <Card key={task.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Label>Task</Label>
                            <Input
                              value={task.task}
                              onChange={(e) => updateTimelineTask(task.id, 'task', e.target.value)}
                              placeholder="Describe the task"
                              data-testid={`input-task-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <select
                              value={task.status}
                              onChange={(e) => updateTimelineTask(task.id, 'status', e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              data-testid={`select-task-status-${index}`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <div>
                            <Label>Start Week</Label>
                            <Input
                              type="number"
                              min="1"
                              value={task.startWeek}
                              onChange={(e) => updateTimelineTask(task.id, 'startWeek', parseInt(e.target.value) || 1)}
                              data-testid={`input-task-start-${index}`}
                            />
                          </div>
                          <div>
                            <Label>End Week</Label>
                            <Input
                              type="number"
                              min="1"
                              value={task.endWeek}
                              onChange={(e) => updateTimelineTask(task.id, 'endWeek', parseInt(e.target.value) || 2)}
                              data-testid={`input-task-end-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Responsible</Label>
                            <Input
                              value={task.responsible}
                              onChange={(e) => updateTimelineTask(task.id, 'responsible', e.target.value)}
                              placeholder="Who is responsible?"
                              data-testid={`input-task-responsible-${index}`}
                            />
                          </div>
                        </div>
                        {timelineTasks.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => removeTimelineTask(task.id)}
                            data-testid={`button-remove-task-${index}`}
                          >
                            Remove
                          </Button>
                        )}
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addTimelineTask} data-testid="button-add-task">
                      Add Timeline Task
                    </Button>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
