import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'market-research',
  toolName: 'Market Research Tracker',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Strong market research is crucial evidence for your visa application - it demonstrates you understand your market. Let me help you plan and track your research activities. Ready?",
  questions: [
    {
      id: 'research-title',
      question: "What market research are you planning or conducting? Give it a descriptive title.",
      hint: "E.g., 'UK SME Pain Point Survey', 'Competitor Feature Analysis'",
      fieldKey: 'researchTitle',
      required: true
    },
    {
      id: 'research-type',
      question: "Is this primary research (you collect data) or secondary research (existing data/reports)?",
      hint: "Primary research is more valuable for visa evidence but requires more effort",
      fieldKey: 'researchType'
    },
    {
      id: 'research-method',
      question: "What research method are you using? (survey, interview, focus group, industry report analysis, etc.)",
      hint: "Multiple methods provide stronger evidence",
      fieldKey: 'researchMethod'
    },
    {
      id: 'sample-size',
      question: "What is your target sample size for this research?",
      hint: "For surveys, aim for 50-100+; for interviews, 10-20 is valuable",
      fieldKey: 'sampleSize'
    },
    {
      id: 'key-questions',
      question: "What are the 3 key questions you want to answer with this research?",
      hint: "Focus on questions that validate your business assumptions",
      fieldKey: 'keyQuestions'
    },
    {
      id: 'data-sources',
      question: "What are your data sources? (For secondary research, name specific reports or databases)",
      hint: "Credible sources like ONS, Tech Nation, or industry associations strengthen evidence",
      fieldKey: 'dataSources'
    }
  ],
  completionMessage: "Perfect! I've captured your research activity. I'm now adding it to your research tracker. You can add more activities and log findings as you complete them."
};

type ResearchType = 'primary' | 'secondary' | 'competitor' | 'customer-discovery';
type ResearchMethod = 'survey' | 'interview' | 'focus-group' | 'observation' | 'industry-report' | 'academic-paper' | 'market-data' | 'competitor-analysis' | 'customer-interview' | 'user-testing' | 'other';
type ResearchStatus = 'planned' | 'in-progress' | 'completed' | 'on-hold';

type ResearchActivity = {
  id: string;
  type: ResearchType;
  method: ResearchMethod;
  title: string;
  description: string;
  targetSampleSize: number;
  actualSampleSize: number;
  startDate: string;
  completionDate: string;
  status: ResearchStatus;
  budget: number;
  keyFindings: string;
  dataSource: string;
  verified: boolean;
};

type CompetitorProfile = {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
  marketShare: number;
  analyzed: boolean;
};

type CustomerSegment = {
  id: string;
  segmentName: string;
  size: number;
  painPoints: string;
  validated: boolean;
};

export default function MarketResearch() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('market-research-mode') as 'ai' | 'traditional') || 'ai';
  });
  const [activities, setActivities] = useState<ResearchActivity[]>([
    {
      id: '1',
      type: 'primary',
      method: 'survey',
      title: '',
      description: '',
      targetSampleSize: 0,
      actualSampleSize: 0,
      startDate: '',
      completionDate: '',
      status: 'planned',
      budget: 0,
      keyFindings: '',
      dataSource: '',
      verified: false
    }
  ]);

  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([
    {
      id: '1',
      name: '',
      strengths: '',
      weaknesses: '',
      marketShare: 0,
      analyzed: false
    }
  ]);

  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([
    {
      id: '1',
      segmentName: '',
      size: 0,
      painPoints: '',
      validated: false
    }
  ]);

  const [marketContext, setMarketContext] = useState({
    totalMarketSize: 0,
    targetMarketSize: 0,
    growthRate: 0,
    keyTrends: '',
    regulatoryFactors: '',
    barriers: ''
  });

  const [activeTab, setActiveTab] = useState('research');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('market-research-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.researchTitle) {
      const newActivity: ResearchActivity = {
        id: Date.now().toString(),
        type: answers.researchType?.toLowerCase().includes('primary') ? 'primary' : 'secondary',
        method: answers.researchMethod?.toLowerCase().includes('survey') ? 'survey' : 
                answers.researchMethod?.toLowerCase().includes('interview') ? 'interview' : 'other',
        title: answers.researchTitle || '',
        description: answers.keyQuestions || '',
        targetSampleSize: answers.sampleSize ? parseInt(answers.sampleSize) || 50 : 50,
        actualSampleSize: 0,
        startDate: '',
        completionDate: '',
        status: 'planned',
        budget: 0,
        keyFindings: '',
        dataSource: answers.dataSources || '',
        verified: false
      };
      setActivities(prev => prev.length === 1 && !prev[0].title ? [newActivity] : [...prev, newActivity]);
    }
    setMode('traditional');
  };

  const addActivity = () => {
    setActivities([...activities, {
      id: Date.now().toString(),
      type: 'primary',
      method: 'survey',
      title: '',
      description: '',
      targetSampleSize: 0,
      actualSampleSize: 0,
      startDate: '',
      completionDate: '',
      status: 'planned',
      budget: 0,
      keyFindings: '',
      dataSource: '',
      verified: false
    }]);
  };

  const updateActivity = (id: string, field: keyof ResearchActivity, value: any) => {
    setActivities(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, {
      id: Date.now().toString(),
      name: '',
      strengths: '',
      weaknesses: '',
      marketShare: 0,
      analyzed: false
    }]);
  };

  const updateCompetitor = (id: string, field: keyof CompetitorProfile, value: any) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const addCustomerSegment = () => {
    setCustomerSegments([...customerSegments, {
      id: Date.now().toString(),
      segmentName: '',
      size: 0,
      painPoints: '',
      validated: false
    }]);
  };

  const updateCustomerSegment = (id: string, field: keyof CustomerSegment, value: any) => {
    setCustomerSegments(customerSegments.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeCustomerSegment = (id: string) => {
    setCustomerSegments(customerSegments.filter(s => s.id !== id));
  };

  const calculateCompletenessScore = () => {
    let score = 0;

    // Research activities completion (40 points)
    const completedActivities = activities.filter(a => a.status === 'completed').length;
    const activitiesScore = Math.min(40, (completedActivities / Math.max(activities.length, 1)) * 40);
    score += activitiesScore;

    // Research diversity (15 points)
    const uniqueMethods = new Set(activities.map(a => a.method)).size;
    const methodsScore = Math.min(15, (uniqueMethods / 5) * 15);
    score += methodsScore;

    // Sample size adequacy (15 points)
    const totalSample = activities.reduce((sum, a) => sum + a.actualSampleSize, 0);
    const sampleScore = Math.min(15, (totalSample / 100) * 15);
    score += sampleScore;

    // Competitor analysis (10 points)
    const analyzedCompetitors = competitors.filter(c => c.analyzed).length;
    const competitorScore = Math.min(10, (analyzedCompetitors / Math.max(competitors.length, 1)) * 10);
    score += competitorScore;

    // Customer segments validation (10 points)
    const validatedSegments = customerSegments.filter(s => s.validated).length;
    const segmentScore = Math.min(10, (validatedSegments / Math.max(customerSegments.length, 1)) * 10);
    score += segmentScore;

    // Verification status (10 points)
    const verifiedActivities = activities.filter(a => a.verified).length;
    const verificationScore = Math.min(10, (verifiedActivities / Math.max(activities.length, 1)) * 10);
    score += verificationScore;

    return Math.round(score);
  };

  const completenessScore = calculateCompletenessScore();
  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const totalSampleSize = activities.reduce((sum, a) => sum + a.actualSampleSize, 0);
  const totalBudget = activities.reduce((sum, a) => sum + a.budget, 0);
  const verifiedActivities = activities.filter(a => a.verified).length;
  const analyzedCompetitors = competitors.filter(c => c.analyzed).length;
  const validatedSegments = customerSegments.filter(s => s.validated).length;

  const getResearchTimeline = () => {
    const dated = activities.filter(a => a.startDate || a.completionDate);
    const timeline = dated.map(a => {
      const date = a.completionDate || a.startDate;
      const month = date.substring(0, 7);
      return { month, activity: a.type, status: a.status };
    }).sort((a, b) => a.month.localeCompare(b.month));

    const grouped = timeline.reduce((acc, item) => {
      if (!acc[item.month]) {
        acc[item.month] = { month: item.month, planned: 0, inProgress: 0, completed: 0 };
      }
      if (item.status === 'planned') acc[item.month].planned++;
      else if (item.status === 'in-progress') acc[item.month].inProgress++;
      else if (item.status === 'completed') acc[item.month].completed++;
      return acc;
    }, {} as Record<string, { month: string; planned: number; inProgress: number; completed: number }>);

    return Object.values(grouped);
  };

  const getResearchTypeDistribution = () => {
    const types = [
      { name: 'Primary Research', value: activities.filter(a => a.type === 'primary').length, color: '#3b82f6' },
      { name: 'Secondary Research', value: activities.filter(a => a.type === 'secondary').length, color: '#10b981' },
      { name: 'Competitor Analysis', value: activities.filter(a => a.type === 'competitor').length, color: '#f59e0b' },
      { name: 'Customer Discovery', value: activities.filter(a => a.type === 'customer-discovery').length, color: '#8b5cf6' },
    ].filter(item => item.value > 0);
    return types;
  };

  const getMethodDistribution = () => {
    const methods = activities.reduce((acc, a) => {
      const methodName = a.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      acc[methodName] = (acc[methodName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methods).map(([name, count]) => ({ name, count }));
  };

  const getSerializedState = () => {
    return {
      activities,
      competitors,
      customerSegments,
      marketContext,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('activities' in state) setActivities(state.activities);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('customerSegments' in state) setCustomerSegments(state.customerSegments);
    if ('marketContext' in state) setMarketContext(state.marketContext);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('market-research-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('market-research-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('market-research-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (completenessScore < 50) {
      tips.push("Your research completeness score is below 50%. Endorsing bodies require comprehensive market research demonstrating thorough understanding of your target market, competition, and customer needs.");
    }

    if (completedActivities < 5) {
      tips.push("Aim to complete at least 5-7 distinct research activities across primary and secondary research. This demonstrates systematic market validation rather than ad-hoc investigation.");
    }

    if (totalSampleSize < 50) {
      tips.push("Your total sample size across all research is below 50. Endorsers look for statistically meaningful sample sizes - target 50-100+ for surveys and 15-25+ for in-depth interviews.");
    }

    const primaryResearch = activities.filter(a => a.type === 'primary').length;
    if (primaryResearch < 2) {
      tips.push("Conduct at least 2-3 primary research activities (surveys, interviews, user testing). Primary research demonstrates direct market engagement and validates assumptions with real data.");
    }

    const secondaryResearch = activities.filter(a => a.type === 'secondary').length;
    if (secondaryResearch < 2) {
      tips.push("Include at least 2-3 secondary research sources (industry reports, market data, academic papers). This provides credible third-party validation of market size and trends.");
    }

    if (analyzedCompetitors < 3) {
      tips.push("Analyze at least 3-5 key competitors in depth. Endorsers want to see you understand the competitive landscape and have identified specific gaps your innovation addresses.");
    }

    if (validatedSegments < customerSegments.length * 0.7) {
      tips.push("Validate at least 70% of your customer segments with real market data. Unvalidated segments may be dismissed as assumptions rather than evidence-based insights.");
    }

    if (verifiedActivities < activities.length * 0.6) {
      tips.push("Document and verify at least 60% of your research activities with evidence (survey exports, interview transcripts, report citations). Endorsers may request proof of research claims.");
    }

    const uniqueMethods = new Set(activities.map(a => a.method)).size;
    if (uniqueMethods < 4) {
      tips.push("Diversify your research methods beyond " + uniqueMethods + " approaches. Use a mix of surveys, interviews, industry reports, and competitor analysis to triangulate findings and reduce bias.");
    }

    if (!marketContext.totalMarketSize || !marketContext.targetMarketSize) {
      tips.push("Define both total addressable market (TAM) and serviceable obtainable market (SOM) with credible data sources. Market size quantification is critical for demonstrating scalability.");
    }

    if (activities.some(a => a.status === 'completed' && !a.keyFindings)) {
      tips.push("Document key findings for all completed research activities. Endorsers need to see what insights you gained and how research informed your business model and strategy.");
    }

    if (marketContext.growthRate === 0) {
      tips.push("Research and document your target market's growth rate with credible sources. High-growth markets (>10% annually) strengthen your innovation and scalability claims.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Compile all existing market research materials, customer interview notes, survey data, and industry reports into organized folders by research type",
        priority: "Critical"
      },
      { 
        week: "Week 1", 
        action: "Identify gaps in current research coverage - which customer segments, competitors, or market aspects need deeper investigation",
        priority: "High"
      },
      { 
        week: "Week 1-2", 
        action: "Conduct 10-15 customer discovery interviews with target users to validate problem-solution fit and gather qualitative insights",
        priority: "Critical"
      },
      { 
        week: "Week 2", 
        action: "Deploy quantitative survey to 50-100+ respondents to validate market assumptions, pricing sensitivity, and feature priorities",
        priority: "Critical"
      },
      { 
        week: "Week 2", 
        action: "Purchase or access 2-3 credible industry reports from recognized sources (Gartner, Forrester, IBISWorld, Statista) for market size validation",
        priority: "High"
      },
      { 
        week: "Week 2-3", 
        action: "Conduct detailed competitive analysis of 3-5 key competitors: feature comparison, pricing, market positioning, strengths/weaknesses",
        priority: "Critical"
      },
      { 
        week: "Week 3", 
        action: "Analyze customer segments: define personas, quantify segment sizes, identify pain points, and validate with real data (not assumptions)",
        priority: "High"
      },
      { 
        week: "Week 3", 
        action: "Document market trends, regulatory factors, and entry barriers with specific evidence and citations from credible sources",
        priority: "High"
      },
      { 
        week: "Week 3-4", 
        action: "Create evidence repository for all research: survey exports, interview transcripts, report excerpts, competitive screenshots, analytics data",
        priority: "Critical"
      },
      { 
        week: "Week 4", 
        action: "Write comprehensive market research summary synthesizing all findings into clear narrative with quantified insights for endorser review",
        priority: "Critical"
      },
      { 
        week: "Week 4", 
        action: "Have industry expert or advisor review research methodology and findings for credibility and completeness before endorser submission",
        priority: "High"
      },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - MARKET RESEARCH REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

RESEARCH COMPLETENESS SUMMARY
${'-'.repeat(80)}
Overall Completeness Score: ${completenessScore}%
Total Research Activities: ${totalActivities}
Completed Activities: ${completedActivities} (${Math.round((completedActivities / totalActivities) * 100)}%)
Total Sample Size: ${totalSampleSize} participants
Total Research Budget: £${totalBudget.toLocaleString()}
Verified Activities: ${verifiedActivities} of ${totalActivities}
Competitors Analyzed: ${analyzedCompetitors} of ${competitors.length}
Customer Segments Validated: ${validatedSegments} of ${customerSegments.length}

Status: ${completenessScore >= 70 ? 'COMPREHENSIVE RESEARCH' : completenessScore >= 50 ? 'MODERATE RESEARCH' : 'NEEDS EXPANSION'}

MARKET CONTEXT
${'-'.repeat(80)}
Total Addressable Market: £${marketContext.totalMarketSize.toLocaleString()}
Target Market Size: £${marketContext.targetMarketSize.toLocaleString()}
Market Growth Rate: ${marketContext.growthRate}% annually
Key Market Trends: ${marketContext.keyTrends || 'Not documented'}
Regulatory Factors: ${marketContext.regulatoryFactors || 'Not documented'}
Market Entry Barriers: ${marketContext.barriers || 'Not documented'}

RESEARCH ACTIVITIES BREAKDOWN
${'-'.repeat(80)}
${activities.map((a, i) => `
${i + 1}. ${a.title || 'Untitled Research Activity'}
   Type: ${a.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
   Method: ${a.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
   Status: ${a.status.toUpperCase()}
   Sample Size: ${a.actualSampleSize} of ${a.targetSampleSize} (${a.targetSampleSize > 0 ? Math.round((a.actualSampleSize / a.targetSampleSize) * 100) : 0}%)
   Timeline: ${a.startDate || 'Not started'} to ${a.completionDate || 'Ongoing'}
   Budget: £${a.budget.toLocaleString()}
   Data Source: ${a.dataSource || 'Not specified'}
   Verified: ${a.verified ? 'YES' : 'NO'}
   Description: ${a.description || 'No description provided'}
   Key Findings: ${a.keyFindings || 'Not documented'}
`).join('')}

COMPETITOR ANALYSIS
${'-'.repeat(80)}
${competitors.map((c, i) => `
${i + 1}. ${c.name || 'Unnamed Competitor'}
   Market Share: ${c.marketShare}%
   Analysis Complete: ${c.analyzed ? 'YES' : 'NO'}
   Strengths: ${c.strengths || 'Not analyzed'}
   Weaknesses: ${c.weaknesses || 'Not analyzed'}
`).join('')}

CUSTOMER SEGMENTS
${'-'.repeat(80)}
${customerSegments.map((s, i) => `
${i + 1}. ${s.segmentName || 'Unnamed Segment'}
   Estimated Size: ${s.size.toLocaleString()} potential customers
   Validated: ${s.validated ? 'YES' : 'NO'}
   Key Pain Points: ${s.painPoints || 'Not documented'}
`).join('')}

RESEARCH TYPE DISTRIBUTION
${'-'.repeat(80)}
Primary Research Activities: ${activities.filter(a => a.type === 'primary').length}
Secondary Research Activities: ${activities.filter(a => a.type === 'secondary').length}
Competitor Analysis Activities: ${activities.filter(a => a.type === 'competitor').length}
Customer Discovery Activities: ${activities.filter(a => a.type === 'customer-discovery').length}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

ENDORSER EVIDENCE REQUIREMENTS
${'-'.repeat(80)}
To satisfy endorsing body requirements for market research, ensure you provide:

1. PRIMARY RESEARCH EVIDENCE
   - Customer interview transcripts or detailed notes (minimum 15-20 interviews)
   - Survey results with response data exports (minimum 50-100 responses)
   - User testing session recordings or summaries showing validation
   - Focus group findings with participant demographics
   - Direct quotes and insights from target customers

2. SECONDARY RESEARCH DOCUMENTATION
   - Industry reports from credible sources (Gartner, Forrester, IBISWorld, etc.)
   - Market size data with clear methodology and sources cited
   - Academic papers or whitepapers supporting market opportunity
   - Government statistical data relevant to your market
   - Trade association research and benchmarks

3. COMPETITIVE ANALYSIS
   - Detailed competitor profiles (minimum 3-5 key competitors)
   - Feature comparison matrices showing differentiation
   - Competitive pricing analysis with evidence
   - Market positioning maps showing your innovation gap
   - Screenshots, product reviews, and public information sources

4. CUSTOMER SEGMENTATION
   - Clearly defined customer personas with demographics
   - Segment size quantification with data sources
   - Pain point validation from primary research
   - Willingness-to-pay analysis from surveys
   - Early adopter identification and engagement evidence

5. MARKET VALIDATION METRICS
   - Total Addressable Market (TAM) with credible sources
   - Serviceable Addressable Market (SAM) calculation
   - Serviceable Obtainable Market (SOM) projection
   - Market growth rate data from industry reports
   - Market trends analysis with supporting evidence

6. METHODOLOGY DOCUMENTATION
   - Clear explanation of research approach and rationale
   - Sample selection criteria and recruitment methods
   - Data collection instruments (survey questions, interview guides)
   - Analysis methodology and frameworks used
   - Limitations and biases acknowledged

CREDIBILITY CHECKLIST
${'-'.repeat(80)}
[ ] All research activities have documented methodologies
[ ] Sample sizes are statistically meaningful (50+ for quantitative, 15+ for qualitative)
[ ] Data sources are credible and cited properly
[ ] Research findings are specific, not generic observations
[ ] Competitive analysis is objective and evidence-based
[ ] Customer segments are validated with real market data
[ ] Market size figures have clear calculation methodology
[ ] All claims can be substantiated with documentary evidence
[ ] Research timeline demonstrates systematic approach over time
[ ] Key findings directly inform business strategy and innovation claims

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

IMPORTANT NOTE: This report is for preparation purposes only. Ensure all research
can be substantiated with documentary evidence before submission to endorsers.
Endorsing bodies may request raw data, transcripts, and source documentation.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-research-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const sections = [];
    
    sections.push({ type: 'heading' as const, content: 'Research Completeness Summary', level: 1 as const });
    sections.push({ type: 'paragraph' as const, content: `Overall Completeness Score: ${completenessScore}%` });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Research Activities', totalActivities.toString()],
          ['Completed Activities', `${completedActivities} (${Math.round((completedActivities / totalActivities) * 100)}%)`],
          ['Total Sample Size', `${totalSampleSize} participants`],
          ['Total Research Budget', `£${totalBudget.toLocaleString()}`],
          ['Verified Activities', `${verifiedActivities} of ${totalActivities}`],
          ['Competitors Analyzed', `${analyzedCompetitors} of ${competitors.length}`],
          ['Customer Segments Validated', `${validatedSegments} of ${customerSegments.length}`]
        ]
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Market Context', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Addressable Market', `£${marketContext.totalMarketSize.toLocaleString()}`],
          ['Target Market Size', `£${marketContext.targetMarketSize.toLocaleString()}`],
          ['Market Growth Rate', `${marketContext.growthRate}% annually`],
          ['Key Market Trends', marketContext.keyTrends || 'Not documented'],
          ['Regulatory Factors', marketContext.regulatoryFactors || 'Not documented'],
          ['Market Entry Barriers', marketContext.barriers || 'Not documented']
        ]
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Research Activities', level: 1 as const });
    activities.forEach((a, i) => {
      sections.push({ type: 'heading' as const, content: `${i + 1}. ${a.title || 'Untitled Research Activity'}`, level: 2 as const });
      sections.push({ type: 'paragraph' as const, content: `Type: ${a.type} | Method: ${a.method} | Status: ${a.status.toUpperCase()}` });
      sections.push({ type: 'paragraph' as const, content: `Sample Size: ${a.actualSampleSize} of ${a.targetSampleSize} | Budget: £${a.budget.toLocaleString()}` });
      if (a.keyFindings) sections.push({ type: 'paragraph' as const, content: `Key Findings: ${a.keyFindings}` });
    });
    
    sections.push({ type: 'heading' as const, content: 'Competitor Analysis', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Competitor', 'Market Share', 'Strengths', 'Weaknesses', 'Analyzed'],
        rows: competitors.map(c => [c.name || 'Unnamed', `${c.marketShare}%`, c.strengths || 'N/A', c.weaknesses || 'N/A', c.analyzed ? 'Yes' : 'No'])
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Customer Segments', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Segment', 'Size', 'Pain Points', 'Validated'],
        rows: customerSegments.map(s => [s.segmentName || 'Unnamed', s.size.toLocaleString(), s.painPoints || 'N/A', s.validated ? 'Yes' : 'No'])
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Smart Recommendations', level: 1 as const });
    sections.push({ type: 'list' as const, items: getSmartTips() });
    
    sections.push({ type: 'heading' as const, content: '4-Week Action Plan', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Week', 'Action', 'Priority'],
        rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
      }
    });

    await generateWord({
      title: 'UK Innovator Founder Visa - Market Research Report',
      subtitle: `Completeness Score: ${completenessScore}%`,
      filename: `market-research-report-${Date.now()}.docx`,
      sections,
      metadata: {
        subject: 'Market Research Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['market research', 'Innovator Founder Visa', 'UK visa', 'competitive analysis']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-market-research">Market Research Planner</h1>
                <p className="text-lg text-muted-foreground">Comprehensive market research planning and evidence tracker</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </div>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="market-research"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Market Research Planner"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-market-research">
              <TabsTrigger value="research" data-testid="tab-research">Research Plan</TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-competitors">Competitors</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Completeness Status</CardTitle>
                  <CardDescription>Track your market research activities and overall completion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={completenessScore >= 70 ? "border-green-500" : completenessScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completeness Score</p>
                          <p className="text-3xl font-bold" data-testid="text-completeness-score">{completenessScore}%</p>
                          <Progress value={completenessScore} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {completenessScore >= 70 ? 'Comprehensive' : completenessScore >= 50 ? 'Moderate' : 'Needs Expansion'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Activities</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-activities">{completedActivities}/{totalActivities}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {completedActivities >= 5 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">{completedActivities >= 5 ? 'Good Coverage' : 'More Needed'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Sample Size</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-sample-size">{totalSampleSize}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {totalSampleSize >= 50 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-xs">{totalSampleSize >= 50 ? 'Adequate' : 'Too Small'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Verified</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-verified-activities">{verifiedActivities}/{totalActivities}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {verifiedActivities / totalActivities >= 0.6 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">{Math.round((verifiedActivities / totalActivities) * 100)}% Verified</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {completenessScore < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your research completeness is below 50%. Endorsing bodies require comprehensive market research demonstrating thorough market understanding and validation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {completenessScore >= 50 && completenessScore < 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Good progress. To strengthen your application, complete more research activities, increase sample sizes, and verify all findings with documentary evidence.
                      </AlertDescription>
                    </Alert>
                  )}

                  {completenessScore >= 70 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent research coverage! Your comprehensive market research provides strong evidence for endorser review. Ensure all documentation is complete and accessible.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Research Activities</h3>
                      <Button onClick={addActivity} size="sm" data-testid="button-add-activity">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>

                    {activities.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`title-${activity.id}`}>Activity Title</Label>
                              <Input
                                id={`title-${activity.id}`}
                                value={activity.title}
                                onChange={(e) => updateActivity(activity.id, 'title', e.target.value)}
                                placeholder="e.g., Customer Survey - Product Validation"
                                data-testid={`input-title-${activity.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`type-${activity.id}`}>Research Type</Label>
                              <select
                                id={`type-${activity.id}`}
                                value={activity.type}
                                onChange={(e) => updateActivity(activity.id, 'type', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-type-${activity.id}`}
                              >
                                <option value="primary">Primary Research</option>
                                <option value="secondary">Secondary Research</option>
                                <option value="competitor">Competitor Analysis</option>
                                <option value="customer-discovery">Customer Discovery</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`method-${activity.id}`}>Research Method</Label>
                              <select
                                id={`method-${activity.id}`}
                                value={activity.method}
                                onChange={(e) => updateActivity(activity.id, 'method', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-method-${activity.id}`}
                              >
                                <option value="survey">Survey</option>
                                <option value="interview">Interview</option>
                                <option value="focus-group">Focus Group</option>
                                <option value="observation">Observation</option>
                                <option value="industry-report">Industry Report</option>
                                <option value="academic-paper">Academic Paper</option>
                                <option value="market-data">Market Data</option>
                                <option value="competitor-analysis">Competitor Analysis</option>
                                <option value="customer-interview">Customer Interview</option>
                                <option value="user-testing">User Testing</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`description-${activity.id}`}>Description</Label>
                            <Textarea
                              id={`description-${activity.id}`}
                              value={activity.description}
                              onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                              placeholder="Describe the research objectives and approach"
                              rows={2}
                              data-testid={`textarea-description-${activity.id}`}
                            />
                          </div>

                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`target-${activity.id}`}>Target Sample</Label>
                              <Input
                                id={`target-${activity.id}`}
                                type="number"
                                value={activity.targetSampleSize || ''}
                                onChange={(e) => updateActivity(activity.id, 'targetSampleSize', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-target-sample-${activity.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`actual-${activity.id}`}>Actual Sample</Label>
                              <Input
                                id={`actual-${activity.id}`}
                                type="number"
                                value={activity.actualSampleSize || ''}
                                onChange={(e) => updateActivity(activity.id, 'actualSampleSize', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-actual-sample-${activity.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`budget-${activity.id}`}>Budget (£)</Label>
                              <Input
                                id={`budget-${activity.id}`}
                                type="number"
                                value={activity.budget || ''}
                                onChange={(e) => updateActivity(activity.id, 'budget', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-budget-${activity.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`status-${activity.id}`}>Status</Label>
                              <select
                                id={`status-${activity.id}`}
                                value={activity.status}
                                onChange={(e) => updateActivity(activity.id, 'status', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-status-${activity.id}`}
                              >
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`start-${activity.id}`}>Start Date</Label>
                              <Input
                                id={`start-${activity.id}`}
                                type="date"
                                value={activity.startDate}
                                onChange={(e) => updateActivity(activity.id, 'startDate', e.target.value)}
                                data-testid={`input-start-date-${activity.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`completion-${activity.id}`}>Completion Date</Label>
                              <Input
                                id={`completion-${activity.id}`}
                                type="date"
                                value={activity.completionDate}
                                onChange={(e) => updateActivity(activity.id, 'completionDate', e.target.value)}
                                data-testid={`input-completion-date-${activity.id}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`source-${activity.id}`}>Data Source / Documentation</Label>
                            <Input
                              id={`source-${activity.id}`}
                              value={activity.dataSource}
                              onChange={(e) => updateActivity(activity.id, 'dataSource', e.target.value)}
                              placeholder="e.g., Qualtrics survey export, interview transcripts folder"
                              data-testid={`input-data-source-${activity.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`findings-${activity.id}`}>Key Findings</Label>
                            <Textarea
                              id={`findings-${activity.id}`}
                              value={activity.keyFindings}
                              onChange={(e) => updateActivity(activity.id, 'keyFindings', e.target.value)}
                              placeholder="Document the main insights and conclusions from this research"
                              rows={3}
                              data-testid={`textarea-findings-${activity.id}`}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={activity.verified}
                                onChange={(e) => updateActivity(activity.id, 'verified', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-verified-${activity.id}`}
                              />
                              <span className="text-sm">Research verified with documentary evidence</span>
                            </label>
                            {activities.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeActivity(activity.id)}
                                data-testid={`button-remove-activity-${activity.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Context</CardTitle>
                  <CardDescription>Define overall market size, trends, and dynamics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="total-market">Total Market Size (£)</Label>
                      <Input
                        id="total-market"
                        type="number"
                        value={marketContext.totalMarketSize || ''}
                        onChange={(e) => setMarketContext({ ...marketContext, totalMarketSize: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-total-market-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-market">Target Market Size (£)</Label>
                      <Input
                        id="target-market"
                        type="number"
                        value={marketContext.targetMarketSize || ''}
                        onChange={(e) => setMarketContext({ ...marketContext, targetMarketSize: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-target-market-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="growth-rate">Annual Growth Rate (%)</Label>
                      <Input
                        id="growth-rate"
                        type="number"
                        step="0.1"
                        value={marketContext.growthRate || ''}
                        onChange={(e) => setMarketContext({ ...marketContext, growthRate: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-growth-rate"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="trends">Key Market Trends</Label>
                    <Textarea
                      id="trends"
                      value={marketContext.keyTrends}
                      onChange={(e) => setMarketContext({ ...marketContext, keyTrends: e.target.value })}
                      placeholder="Describe major trends shaping your market (technology, consumer behavior, regulation)"
                      rows={3}
                      data-testid="textarea-key-trends"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regulatory">Regulatory Factors</Label>
                    <Textarea
                      id="regulatory"
                      value={marketContext.regulatoryFactors}
                      onChange={(e) => setMarketContext({ ...marketContext, regulatoryFactors: e.target.value })}
                      placeholder="Relevant regulations, compliance requirements, or policy changes"
                      rows={2}
                      data-testid="textarea-regulatory-factors"
                    />
                  </div>

                  <div>
                    <Label htmlFor="barriers">Market Entry Barriers</Label>
                    <Textarea
                      id="barriers"
                      value={marketContext.barriers}
                      onChange={(e) => setMarketContext({ ...marketContext, barriers: e.target.value })}
                      placeholder="Capital requirements, regulatory hurdles, network effects, etc."
                      rows={2}
                      data-testid="textarea-barriers"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Customer Segments</CardTitle>
                      <CardDescription>Define and validate target customer segments</CardDescription>
                    </div>
                    <Button onClick={addCustomerSegment} size="sm" data-testid="button-add-segment">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Segment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerSegments.map((segment) => (
                      <Card key={segment.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`segment-name-${segment.id}`}>Segment Name</Label>
                              <Input
                                id={`segment-name-${segment.id}`}
                                value={segment.segmentName}
                                onChange={(e) => updateCustomerSegment(segment.id, 'segmentName', e.target.value)}
                                placeholder="e.g., Enterprise IT Managers, SMB Owners"
                                data-testid={`input-segment-name-${segment.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`segment-size-${segment.id}`}>Estimated Size</Label>
                              <Input
                                id={`segment-size-${segment.id}`}
                                type="number"
                                value={segment.size || ''}
                                onChange={(e) => updateCustomerSegment(segment.id, 'size', parseInt(e.target.value) || 0)}
                                placeholder="Number of potential customers"
                                data-testid={`input-segment-size-${segment.id}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`pain-points-${segment.id}`}>Key Pain Points</Label>
                            <Textarea
                              id={`pain-points-${segment.id}`}
                              value={segment.painPoints}
                              onChange={(e) => updateCustomerSegment(segment.id, 'painPoints', e.target.value)}
                              placeholder="What problems does this segment face that your solution addresses?"
                              rows={2}
                              data-testid={`textarea-pain-points-${segment.id}`}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={segment.validated}
                                onChange={(e) => updateCustomerSegment(segment.id, 'validated', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-validated-${segment.id}`}
                              />
                              <span className="text-sm">Segment validated with market data</span>
                            </label>
                            {customerSegments.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomerSegment(segment.id)}
                                data-testid={`button-remove-segment-${segment.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Competitive Analysis</CardTitle>
                      <CardDescription>Analyze key competitors and identify your competitive advantages</CardDescription>
                    </div>
                    <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Competitor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitors.map((competitor) => (
                      <Card key={competitor.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`comp-name-${competitor.id}`}>Competitor Name</Label>
                              <Input
                                id={`comp-name-${competitor.id}`}
                                value={competitor.name}
                                onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                                placeholder="Company or product name"
                                data-testid={`input-competitor-name-${competitor.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`market-share-${competitor.id}`}>Est. Market Share (%)</Label>
                              <Input
                                id={`market-share-${competitor.id}`}
                                type="number"
                                step="0.1"
                                value={competitor.marketShare || ''}
                                onChange={(e) => updateCompetitor(competitor.id, 'marketShare', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-market-share-${competitor.id}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`strengths-${competitor.id}`}>Key Strengths</Label>
                            <Textarea
                              id={`strengths-${competitor.id}`}
                              value={competitor.strengths}
                              onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value)}
                              placeholder="What does this competitor do well? (brand, features, pricing, distribution)"
                              rows={2}
                              data-testid={`textarea-strengths-${competitor.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`weaknesses-${competitor.id}`}>Key Weaknesses / Gaps</Label>
                            <Textarea
                              id={`weaknesses-${competitor.id}`}
                              value={competitor.weaknesses}
                              onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value)}
                              placeholder="Where does this competitor fall short? How does your innovation address these gaps?"
                              rows={2}
                              data-testid={`textarea-weaknesses-${competitor.id}`}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={competitor.analyzed}
                                onChange={(e) => updateCompetitor(competitor.id, 'analyzed', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-analyzed-${competitor.id}`}
                              />
                              <span className="text-sm">In-depth analysis completed</span>
                            </label>
                            {competitors.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCompetitor(competitor.id)}
                                data-testid={`button-remove-competitor-${competitor.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Summary</CardTitle>
                  <CardDescription>Overview of competitive landscape analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Competitors Tracked</p>
                          <p className="text-3xl font-bold text-primary">{competitors.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Analyzed</p>
                          <p className="text-3xl font-bold text-primary">{analyzedCompetitors}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {analyzedCompetitors >= 3 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-xs">{analyzedCompetitors >= 3 ? 'Good Coverage' : 'More Needed'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Market Share</p>
                          <p className="text-3xl font-bold text-primary">{competitors.reduce((sum, c) => sum + c.marketShare, 0).toFixed(1)}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Research Activity Timeline</CardTitle>
                    <CardDescription>Research progress over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getResearchTimeline().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getResearchTimeline()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="planned" fill="#f59e0b" name="Planned" />
                          <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-timeline">Add dates to research activities to see timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Research Type Distribution</CardTitle>
                    <CardDescription>Breakdown by research category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getResearchTypeDistribution().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getResearchTypeDistribution()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {getResearchTypeDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-distribution">Add research activities to see distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Research Method Breakdown</CardTitle>
                  <CardDescription>Distribution of research methodologies used</CardDescription>
                </CardHeader>
                <CardContent>
                  {getMethodDistribution().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMethodDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" name="Activities" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12" data-testid="text-no-methods">Add research activities to see method distribution</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Requirements Checklist</CardTitle>
                  <CardDescription>Endorsing body documentation requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {activities.filter(a => a.type === 'primary' && a.status === 'completed').length >= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Primary Research Completed</p>
                        <p className="text-sm text-muted-foreground">At least 2-3 primary research activities (surveys, interviews) with real customers</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {totalSampleSize >= 50 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Adequate Sample Size</p>
                        <p className="text-sm text-muted-foreground">Minimum 50-100 total participants across all research activities</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {activities.filter(a => a.type === 'secondary' && a.status === 'completed').length >= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Secondary Research Sources</p>
                        <p className="text-sm text-muted-foreground">At least 2-3 credible industry reports or market data sources</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {analyzedCompetitors >= 3 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Competitive Analysis</p>
                        <p className="text-sm text-muted-foreground">In-depth analysis of 3-5 key competitors with documented strengths and weaknesses</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {validatedSegments >= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Customer Segments Validated</p>
                        <p className="text-sm text-muted-foreground">At least 2-3 customer segments validated with market data and pain point analysis</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {marketContext.totalMarketSize > 0 && marketContext.targetMarketSize > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Market Size Quantified</p>
                        <p className="text-sm text-muted-foreground">Total addressable market (TAM) and target market size documented with sources</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {verifiedActivities / totalActivities >= 0.6 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Research Documentation</p>
                        <p className="text-sm text-muted-foreground">At least 60% of research activities have verified documentary evidence</p>
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
                  <CardDescription>Tailored advice to strengthen your market research evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to complete comprehensive market research</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                              item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                              item.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-primary/10 text-primary'
                            }`} data-testid={`priority-${index}`}>
                              {item.priority}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1" data-testid={`week-${index}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`action-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
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
