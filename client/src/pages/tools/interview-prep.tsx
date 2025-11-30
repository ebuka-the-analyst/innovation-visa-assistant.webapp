import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, MessageSquare } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'interview-prep',
  toolName: 'Endorsement Interview Prep',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Expert. The endorsement interview is your opportunity to demonstrate innovation, viability, and scalability. Let me help you prepare compelling answers to the questions endorsing bodies typically ask!",
  questions: [
    {
      id: 'business-pitch',
      question: "Can you give me your 60-second business pitch? Explain what your business does, the problem it solves, and why it's innovative.",
      hint: "Practice until this flows naturally. Cover: problem, solution, innovation, market",
      fieldKey: 'businessPitch',
      minLength: 100
    },
    {
      id: 'innovation',
      question: "What makes your business genuinely innovative? How is it different from existing solutions in the market?",
      hint: "Be specific about your unique technology, approach, or business model",
      fieldKey: 'innovationAnswer',
      minLength: 80
    },
    {
      id: 'market-validation',
      question: "How have you validated market demand? What evidence do you have that customers want your solution?",
      hint: "Include customer interviews, letters of intent, pilot results, or early sales",
      fieldKey: 'marketValidation',
      minLength: 80
    },
    {
      id: 'scalability',
      question: "How will you scale this business? Describe your growth strategy and key milestones.",
      hint: "Demonstrate the scalability endorsers look for - think big but realistic",
      fieldKey: 'scalabilityAnswer',
      minLength: 80
    },
    {
      id: 'uk-benefit',
      question: "Why the UK? What specific benefit will your business bring to the UK economy and how many UK jobs will you create?",
      hint: "Endorsers need to see genuine UK benefit - be specific about jobs and impact",
      fieldKey: 'ukBenefit',
      minLength: 80
    },
    {
      id: 'financial-plan',
      question: "Walk me through your financial plan. How will you fund the business and when do you expect to reach profitability?",
      hint: "Show you understand your numbers and have realistic financial projections",
      fieldKey: 'financialPlan',
      minLength: 80
    },
    {
      id: 'team-gaps',
      question: "What are the current gaps in your team and how do you plan to address them?",
      hint: "Show self-awareness and a concrete hiring plan",
      fieldKey: 'teamGaps',
      minLength: 50
    }
  ],
  completionMessage: "Excellent preparation! You've crafted strong answers covering the key areas endorsers will assess. I'm populating your interview preparation guide now so you can practice and refine your responses."
};

type QuestionCategory = 'business-model' | 'innovation' | 'scalability' | 'team' | 'financials' | 'uk-impact';

type InterviewQuestion = {
  id: string;
  category: QuestionCategory;
  question: string;
  prepared: boolean;
  answer: string;
  evidence: string;
  framework: 'STAR' | 'CAR' | 'PAR' | 'SOAR' | 'None';
};

type PracticeScenario = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  scenario: string;
  keyPoints: string[];
};

const INTERVIEW_QUESTIONS: Omit<InterviewQuestion, 'prepared' | 'answer' | 'evidence' | 'framework'>[] = [
  {
    id: 'q1',
    category: 'business-model',
    question: 'Explain your business model and how you will generate revenue in the UK market.',
  },
  {
    id: 'q2',
    category: 'business-model',
    question: 'What makes your business viable and sustainable in the long term?',
  },
  {
    id: 'q3',
    category: 'innovation',
    question: 'What is innovative about your product or service? How does it differ from existing solutions?',
  },
  {
    id: 'q4',
    category: 'innovation',
    question: 'How have you validated your innovation with customers or the market?',
  },
  {
    id: 'q5',
    category: 'scalability',
    question: 'Describe your growth strategy and how you plan to scale the business.',
  },
  {
    id: 'q6',
    category: 'scalability',
    question: 'What are your key milestones for the next 12-24 months?',
  },
  {
    id: 'q7',
    category: 'team',
    question: 'Tell us about your team and their relevant experience for this venture.',
  },
  {
    id: 'q8',
    category: 'team',
    question: 'What is your plan for hiring and building the team in the UK?',
  },
  {
    id: 'q9',
    category: 'financials',
    question: 'How will you use your investment funds? Provide a breakdown.',
  },
  {
    id: 'q10',
    category: 'financials',
    question: 'What are your financial projections for the first three years?',
  },
  {
    id: 'q11',
    category: 'uk-impact',
    question: 'Why have you chosen the UK for your business? What benefit will you bring to the UK economy?',
  },
  {
    id: 'q12',
    category: 'uk-impact',
    question: 'How many jobs do you expect to create in the UK in the first 3 years?',
  },
  {
    id: 'q13',
    category: 'business-model',
    question: 'Who are your main competitors and what is your competitive advantage?',
  },
  {
    id: 'q14',
    category: 'innovation',
    question: 'Do you have any intellectual property? If so, how are you protecting it?',
  },
  {
    id: 'q15',
    category: 'scalability',
    question: 'What are the key risks to your business and how will you mitigate them?',
  },
  {
    id: 'q16',
    category: 'team',
    question: 'What gaps currently exist in your team and how do you plan to address them?',
  },
  {
    id: 'q17',
    category: 'financials',
    question: 'When do you expect to reach profitability? What are your assumptions?',
  },
  {
    id: 'q18',
    category: 'uk-impact',
    question: 'How will your business contribute to innovation in the UK?',
  },
];

const PRACTICE_SCENARIOS: Omit<PracticeScenario, 'completed'>[] = [
  {
    id: 's1',
    title: 'Challenging Financial Questions',
    difficulty: 'hard',
    scenario: 'The interviewer questions your financial projections as too optimistic and asks you to justify your growth assumptions.',
    keyPoints: [
      'Remain calm and professional',
      'Provide specific market data supporting your assumptions',
      'Reference comparable company growth rates',
      'Acknowledge risks while maintaining confidence',
      'Have backup conservative scenarios ready',
    ],
  },
  {
    id: 's2',
    title: 'Team Capability Concerns',
    difficulty: 'medium',
    scenario: 'The panel expresses concern that your team lacks certain critical skills or experience for the business.',
    keyPoints: [
      'Acknowledge the gap honestly',
      'Present your hiring plan with specific roles',
      'Highlight advisory board or mentors who fill gaps',
      'Demonstrate awareness of what is needed',
      'Show commitment to building the right team',
    ],
  },
  {
    id: 's3',
    title: 'Innovation Validation',
    difficulty: 'medium',
    scenario: 'You are asked to prove that your innovation is genuinely novel and not just an incremental improvement.',
    keyPoints: [
      'Explain technical differences clearly',
      'Provide customer testimonials or letters of intent',
      'Reference patents or IP if applicable',
      'Show market research validating the need',
      'Demonstrate competitive analysis',
    ],
  },
  {
    id: 's4',
    title: 'UK Market Justification',
    difficulty: 'easy',
    scenario: 'The interviewer asks why you could not launch this business in your home country instead of the UK.',
    keyPoints: [
      'Highlight UK-specific opportunities',
      'Reference access to UK talent or expertise',
      'Mention regulatory advantages or market maturity',
      'Show understanding of UK business ecosystem',
      'Demonstrate UK market research',
    ],
  },
  {
    id: 's5',
    title: 'Scalability Pressure Test',
    difficulty: 'hard',
    scenario: 'You are challenged on whether your business can actually scale as quickly as you claim.',
    keyPoints: [
      'Provide concrete milestones with timelines',
      'Reference successful scaling examples in your industry',
      'Explain your distribution or growth channels',
      'Show evidence of demand or market size',
      'Present clear operational scaling plan',
    ],
  },
  {
    id: 's6',
    title: 'Funding Source Scrutiny',
    difficulty: 'medium',
    scenario: 'The panel questions the source of your investment funds and asks for detailed documentation.',
    keyPoints: [
      'Have all documentation readily available',
      'Explain fund sources clearly and transparently',
      'Show bank verification letters',
      'Demonstrate funds are accessible and transferable',
      'Maintain composure under scrutiny',
    ],
  },
];

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  'business-model': 'Business Model',
  'innovation': 'Innovation',
  'scalability': 'Scalability',
  'team': 'Team & Talent',
  'financials': 'Financials',
  'uk-impact': 'UK Impact',
};

export default function InterviewPrep() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('interview-prep-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('interview-prep-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(
    INTERVIEW_QUESTIONS.map(q => ({
      ...q,
      prepared: false,
      answer: '',
      evidence: '',
      framework: 'None' as const,
    }))
  );
  const [scenarios, setScenarios] = useState<PracticeScenario[]>(
    PRACTICE_SCENARIOS.map(s => ({ ...s, completed: false }))
  );
  const [activeTab, setActiveTab] = useState('questions');
  const [savedDate, setSavedDate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');

  const updateQuestion = (id: string, field: keyof InterviewQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const toggleScenario = (id: string) => {
    setScenarios(scenarios.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const preparedQuestions = questions.filter(q => q.prepared).length;
  const totalQuestions = questions.length;
  const questionsWithAnswers = questions.filter(q => q.answer.length > 50).length;
  const questionsWithEvidence = questions.filter(q => q.evidence.length > 20).length;
  const questionsWithFramework = questions.filter(q => q.framework !== 'None').length;
  const completedScenarios = scenarios.filter(s => s.completed).length;
  const totalScenarios = scenarios.length;

  const preparednessScore = Math.round(
    ((preparedQuestions / totalQuestions) * 30) +
    ((questionsWithAnswers / totalQuestions) * 30) +
    ((questionsWithEvidence / totalQuestions) * 20) +
    ((questionsWithFramework / totalQuestions) * 10) +
    ((completedScenarios / totalScenarios) * 10)
  );

  const getCategoryScore = (category: QuestionCategory) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const prepared = categoryQuestions.filter(q => q.prepared).length;
    const withAnswers = categoryQuestions.filter(q => q.answer.length > 50).length;
    return Math.round(((prepared + withAnswers) / (categoryQuestions.length * 2)) * 100);
  };

  const radarData = [
    { category: 'Business Model', score: getCategoryScore('business-model') },
    { category: 'Innovation', score: getCategoryScore('innovation') },
    { category: 'Scalability', score: getCategoryScore('scalability') },
    { category: 'Team', score: getCategoryScore('team') },
    { category: 'Financials', score: getCategoryScore('financials') },
    { category: 'UK Impact', score: getCategoryScore('uk-impact') },
  ];

  const pieData = [
    { name: 'Fully Prepared', value: questions.filter(q => q.prepared && q.answer.length > 50 && q.evidence.length > 20).length, color: '#10b981' },
    { name: 'Partially Prepared', value: questions.filter(q => q.prepared && (q.answer.length < 50 || q.evidence.length < 20)).length, color: '#f59e0b' },
    { name: 'Not Prepared', value: questions.filter(q => !q.prepared).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getReadinessLevel = () => {
    if (preparednessScore >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' };
    if (preparednessScore >= 75) return { label: 'Strong', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' };
    if (preparednessScore >= 60) return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    if (preparednessScore >= 40) return { label: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' };
    return { label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' };
  };

  const readinessLevel = getReadinessLevel();

  const getSerializedState = () => {
    return {
      questions,
      scenarios,
      activeTab,
      selectedCategory,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('questions' in state) setQuestions(state.questions);
    if ('scenarios' in state) setScenarios(state.scenarios);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedCategory' in state) setSelectedCategory(state.selectedCategory);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('interview-prep-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const updatedQuestions = [...questions];
    if (answers.businessPitch) {
      const q = updatedQuestions.find(q => q.id === 'q1');
      if (q) {
        q.answer = answers.businessPitch;
        q.prepared = true;
      }
    }
    if (answers.innovation) {
      const q = updatedQuestions.find(q => q.id === 'q3');
      if (q) {
        q.answer = answers.innovation;
        q.prepared = true;
      }
    }
    if (answers.scalability) {
      const q = updatedQuestions.find(q => q.id === 'q8');
      if (q) {
        q.answer = answers.scalability;
        q.prepared = true;
      }
    }
    if (answers.ukImpact) {
      const q = updatedQuestions.find(q => q.id === 'q18');
      if (q) {
        q.answer = answers.ukImpact;
        q.prepared = true;
      }
    }
    if (answers.challengeResponse) {
      const q = updatedQuestions.find(q => q.id === 'q5');
      if (q) {
        q.answer = answers.challengeResponse;
        q.prepared = true;
      }
    }
    setQuestions(updatedQuestions);
    setMode('traditional');
  };

  useEffect(() => {
    const handoffKey = 'interview-prep_handoff';
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
      const saved = localStorage.getItem('interview-prep-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('interview-prep-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('interview-prep-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (preparednessScore < 40) {
      tips.push("Start with the most common questions in the Business Model and Financials categories");
    }

    if (questionsWithFramework < totalQuestions * 0.5) {
      tips.push("Use structured frameworks like STAR (Situation, Task, Action, Result) to organize your answers");
    }

    if (questionsWithEvidence < totalQuestions * 0.7) {
      tips.push("Support every claim with specific evidence - data, testimonials, documents, or metrics");
    }

    if (completedScenarios < 3) {
      tips.push("Practice challenging scenarios repeatedly until you can handle them confidently under pressure");
    }

    const weakCategory = radarData.reduce((min, item) => item.score < min.score ? item : min);
    if (weakCategory.score < 60) {
      tips.push(`Focus on strengthening your ${weakCategory.category} answers - this is your weakest area`);
    }

    if (questions.some(q => q.answer.length > 0 && q.answer.length < 100)) {
      tips.push("Aim for 200-300 word answers that are detailed but concise - practice timing yourself");
    }

    if (preparednessScore >= 75) {
      tips.push("Strong preparation - now practice delivering answers out loud and record yourself to improve");
    }

    tips.push("Research your specific endorsing body's recent approval patterns and tailor your answers accordingly");
    tips.push("Prepare 2-3 success stories that demonstrate your capabilities and can be adapted to multiple questions");
    tips.push("Have physical copies of all evidence documents organized in a folder during the interview");

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete answers to all Business Model and UK Impact questions with evidence", priority: "Critical" },
      { week: "Week 1", action: "Research your endorsing body's interview format and recent decision patterns", priority: "High" },
      { week: "Week 1-2", action: "Draft answers using STAR/CAR frameworks for all remaining questions", priority: "Critical" },
      { week: "Week 2", action: "Gather and organize evidence documents for every claim in your answers", priority: "Critical" },
      { week: "Week 2", action: "Practice all 6 scenarios until you can handle them confidently", priority: "High" },
      { week: "Week 2-3", action: "Conduct mock interviews with advisor, mentor, or immigration lawyer", priority: "Critical" },
      { week: "Week 3", action: "Refine answers based on mock interview feedback and timing", priority: "High" },
      { week: "Week 3", action: "Prepare visual aids or charts to support complex answers if allowed", priority: "Medium" },
      { week: "Week 3-4", action: "Practice difficult questions daily - record and review your delivery", priority: "High" },
      { week: "Week 4", action: "Final review of all materials, evidence, and answers day before interview", priority: "Critical" },
      { week: "Week 4", action: "Rest well, arrive early, and project confidence during the interview", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `ENDORSEMENT INTERVIEW PREPARATION REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

PREPAREDNESS SUMMARY
${'-'.repeat(80)}
Overall Preparedness Score: ${preparednessScore}%
Readiness Level: ${readinessLevel.label}
Questions Prepared: ${preparedQuestions}/${totalQuestions}
Questions with Complete Answers: ${questionsWithAnswers}/${totalQuestions}
Questions with Evidence: ${questionsWithEvidence}/${totalQuestions}
Questions with Framework: ${questionsWithFramework}/${totalQuestions}
Practice Scenarios Completed: ${completedScenarios}/${totalScenarios}

CATEGORY READINESS BREAKDOWN
${'-'.repeat(80)}
${radarData.map(item => `${item.category}: ${item.score}%`).join('\n')}

QUESTION PREPARATION DETAILS
${'-'.repeat(80)}
${questions.map((q, i) => `
${i + 1}. [${q.category.toUpperCase()}] ${q.question}
   Status: ${q.prepared ? 'PREPARED' : 'NOT PREPARED'}
   Framework: ${q.framework}
   Answer Length: ${q.answer.length} characters
   Evidence: ${q.evidence.length > 0 ? 'PROVIDED' : 'MISSING'}
   
   ${q.answer ? `ANSWER:\n   ${q.answer.split('\n').join('\n   ')}` : 'Answer not yet prepared'}
   
   ${q.evidence ? `EVIDENCE:\n   ${q.evidence.split('\n').join('\n   ')}` : 'Evidence not yet documented'}
`).join('\n' + '-'.repeat(80) + '\n')}

PRACTICE SCENARIOS STATUS
${'-'.repeat(80)}
${scenarios.map((s, i) => `
${i + 1}. ${s.title} [${s.difficulty.toUpperCase()}]
   Status: ${s.completed ? 'COMPLETED' : 'NOT COMPLETED'}
   Scenario: ${s.scenario}
   Key Points to Address:
${s.keyPoints.map(p => `   - ${p}`).join('\n')}
`).join('\n' + '-'.repeat(80) + '\n')}

ANSWER FRAMEWORKS GUIDE
${'-'.repeat(80)}
STAR Framework (Situation, Task, Action, Result):
- Situation: Describe the context and background
- Task: Explain what needed to be accomplished
- Action: Detail the specific steps you took
- Result: Share the outcomes and impact

CAR Framework (Context, Action, Result):
- Context: Set the scene and provide background
- Action: Describe what you did
- Result: Explain the outcomes achieved

EVIDENCE PRESENTATION STRATEGIES
${'-'.repeat(80)}
1. Quantify Everything: Use specific numbers, percentages, and metrics
2. Show Documentation: Reference specific documents you have available
3. Customer Validation: Include testimonials, letters of intent, or contracts
4. Third-Party Verification: Cite independent sources that validate claims
5. Timeline Evidence: Show progression and momentum over time
6. Competitive Benchmarks: Compare against industry standards
7. Visual Support: Prepare charts/graphs if presentation is allowed

SMART TIPS & RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

INTERVIEW DAY CHECKLIST
${'-'.repeat(80)}
Physical Materials:
□ All evidence documents organized in folders
□ Business plan printed copy
□ Financial projections printed
□ Team CVs and credentials
□ Letters of support or testimonials
□ IP documentation if applicable
□ Company registration documents
□ Funding verification documents

Mental Preparation:
□ Reviewed all prepared answers
□ Practiced delivery out loud
□ Researched panel members if known
□ Prepared questions to ask them
□ Rested well night before
□ Professional attire ready
□ Route and timing confirmed

During Interview:
□ Arrive 15 minutes early
□ Greet panel professionally
□ Listen carefully to each question
□ Take brief pause before answering
□ Reference evidence when making claims
□ Maintain confident body language
□ Ask for clarification if needed
□ Thank panel at conclusion

FINAL RECOMMENDATIONS
${'-'.repeat(80)}
- Project genuine enthusiasm for your business and the UK opportunity
- Be honest about challenges while showing how you will overcome them
- Demonstrate deep knowledge of your market and competitors
- Show evidence of execution ability, not just ideas
- Emphasize UK economic benefit and job creation potential
- Have specific examples ready for every major claim
- Practice until answers feel natural, not rehearsed
- Remember: they want to approve you if you meet the criteria

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-prep-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const sections = [];
    
    sections.push({ type: 'heading' as const, content: 'Preparedness Summary', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Metric', 'Value'],
        rows: [
          ['Overall Preparedness Score', `${preparednessScore}%`],
          ['Readiness Level', readinessLevel.label],
          ['Questions Prepared', `${preparedQuestions}/${totalQuestions}`],
          ['Questions with Complete Answers', `${questionsWithAnswers}/${totalQuestions}`],
          ['Questions with Evidence', `${questionsWithEvidence}/${totalQuestions}`],
          ['Questions with Framework', `${questionsWithFramework}/${totalQuestions}`],
          ['Practice Scenarios Completed', `${completedScenarios}/${totalScenarios}`]
        ]
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Category Readiness', level: 1 as const });
    sections.push({ 
      type: 'table' as const, 
      tableData: {
        headers: ['Category', 'Score'],
        rows: radarData.map(item => [item.category, `${item.score}%`])
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Question Preparation Details', level: 1 as const });
    questions.forEach((q, i) => {
      sections.push({ type: 'heading' as const, content: `${i + 1}. ${q.question}`, level: 2 as const });
      sections.push({ type: 'paragraph' as const, content: `Category: ${q.category} | Status: ${q.prepared ? 'Prepared' : 'Not Prepared'} | Framework: ${q.framework}` });
      if (q.answer) {
        sections.push({ type: 'heading' as const, content: 'Answer:', level: 3 as const });
        sections.push({ type: 'paragraph' as const, content: q.answer });
      }
      if (q.evidence) {
        sections.push({ type: 'heading' as const, content: 'Evidence:', level: 3 as const });
        sections.push({ type: 'paragraph' as const, content: q.evidence });
      }
    });
    
    sections.push({ type: 'heading' as const, content: 'Practice Scenarios', level: 1 as const });
    scenarios.forEach((s, i) => {
      sections.push({ type: 'heading' as const, content: `${i + 1}. ${s.title} [${s.difficulty}]`, level: 2 as const });
      sections.push({ type: 'paragraph' as const, content: `Status: ${s.completed ? 'Completed' : 'Not Completed'}` });
      sections.push({ type: 'paragraph' as const, content: s.scenario });
      sections.push({ type: 'list' as const, items: s.keyPoints });
    });
    
    sections.push({ type: 'heading' as const, content: 'Smart Tips & Recommendations', level: 1 as const });
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
      title: 'Endorsement Interview Preparation Report',
      subtitle: `Preparedness Score: ${preparednessScore}% | Readiness: ${readinessLevel.label}`,
      filename: `interview-prep-report-${Date.now()}.docx`,
      sections,
      metadata: {
        subject: 'Interview Preparation Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['interview prep', 'Innovator Founder Visa', 'UK visa', 'endorsement']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-interview-prep">
                  Endorsement Interview Preparation
                </h1>
                <p className="text-lg text-muted-foreground">
                  Comprehensive interview readiness for endorsing body assessment
                </p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">
                    Last saved: {savedDate}
                  </p>
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
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Nova, our Innovation Expert, helps you prepare for your endorsement interview.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Practice your business pitch and value proposition</li>
                    <li>Prepare innovation and scalability answers</li>
                    <li>Understand how to handle challenging questions</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the interview prep when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="interview-prep"
            toolName="Interview Preparation"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setShowTips(!showTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {showTips && (
            <Card className="mb-6 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Smart Tips & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSmartTips().map((tip, index) => (
                    <div key={index} className="flex items-start gap-3" data-testid={`tip-${index}`}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <p className="text-sm text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showActionPlan && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  4-Week Interview Preparation Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateActionPlan().map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50" data-testid={`action-${index}`}>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.week}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Preparedness Score</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-preparedness-score">{preparednessScore}%</p>
                  <Progress value={preparednessScore} className="mt-2" />
                  <p className={`text-sm mt-2 font-semibold ${readinessLevel.color}`} data-testid="text-readiness-level">
                    {readinessLevel.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Questions Prepared</p>
                  <p className="text-3xl font-bold" data-testid="text-questions-prepared">{preparedQuestions}/{totalQuestions}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {preparedQuestions === totalQuestions ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Complete Answers</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-complete-answers">{questionsWithAnswers}/{totalQuestions}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {questionsWithAnswers >= totalQuestions * 0.8 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Scenarios Practiced</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="text-scenarios-completed">{completedScenarios}/{totalScenarios}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {completedScenarios >= totalScenarios * 0.7 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {preparednessScore < 60 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your interview preparedness is below recommended level. Focus on completing answers with evidence for all key questions.
              </AlertDescription>
            </Alert>
          )}

          {preparednessScore >= 90 && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Excellent preparation! You are well-positioned for a successful interview. Focus on confident delivery.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-interview-prep">
              <TabsTrigger value="questions" data-testid="tab-questions">Questions</TabsTrigger>
              <TabsTrigger value="scenarios" data-testid="tab-scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="frameworks" data-testid="tab-frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="evidence" data-testid="tab-evidence">Evidence</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Interview Questions Bank</CardTitle>
                      <CardDescription>Prepare answers for common endorsing body interview questions</CardDescription>
                    </div>
                    <div>
                      <Label htmlFor="category-filter">Filter by Category</Label>
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory | 'all')}
                        className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-category-filter"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredQuestions.map((q) => (
                    <Card key={q.id} className={`p-4 ${q.prepared ? 'border-green-500' : ''}`}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">
                                {CATEGORY_LABELS[q.category]}
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={q.prepared}
                                  onChange={(e) => updateQuestion(q.id, 'prepared', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-prepared-${q.id}`}
                                />
                                <span className="text-sm font-medium">Mark as Prepared</span>
                              </label>
                            </div>
                            <p className="font-semibold mb-3">{q.question}</p>

                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label htmlFor={`framework-${q.id}`}>Answer Framework</Label>
                                </div>
                                <select
                                  id={`framework-${q.id}`}
                                  value={q.framework}
                                  onChange={(e) => updateQuestion(q.id, 'framework', e.target.value)}
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  data-testid={`select-framework-${q.id}`}
                                >
                                  <option value="None">None</option>
                                  <option value="STAR">STAR (Situation, Task, Action, Result)</option>
                                  <option value="CAR">CAR (Context, Action, Result)</option>
                                  <option value="PAR">PAR (Problem, Action, Result)</option>
                                  <option value="SOAR">SOAR (Situation, Obstacle, Action, Result)</option>
                                </select>
                              </div>

                              <div>
                                <Label htmlFor={`answer-${q.id}`}>Your Answer</Label>
                                <Textarea
                                  id={`answer-${q.id}`}
                                  value={q.answer}
                                  onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                                  placeholder="Write your prepared answer here (aim for 200-300 words)..."
                                  className="min-h-[120px] mt-1"
                                  data-testid={`textarea-answer-${q.id}`}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {q.answer.length} characters {q.answer.length >= 200 && q.answer.length <= 400 ? '(Good length)' : q.answer.length < 200 ? '(Too short - add more detail)' : '(Consider condensing)'}
                                </p>
                              </div>

                              <div>
                                <Label htmlFor={`evidence-${q.id}`}>Supporting Evidence</Label>
                                <Textarea
                                  id={`evidence-${q.id}`}
                                  value={q.evidence}
                                  onChange={(e) => updateQuestion(q.id, 'evidence', e.target.value)}
                                  placeholder="List specific evidence you will reference (data, documents, testimonials, metrics)..."
                                  className="min-h-[80px] mt-1"
                                  data-testid={`textarea-evidence-${q.id}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Scenarios</CardTitle>
                  <CardDescription>Challenging interview situations to prepare for</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scenarios.map((s) => (
                    <Card key={s.id} className={`p-4 ${s.completed ? 'border-green-500' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{s.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                                s.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                s.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {s.difficulty.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{s.scenario}</p>
                            
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm font-medium mb-2">Key Points to Address:</p>
                              <ul className="space-y-1">
                                {s.keyPoints.map((point, idx) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={s.completed}
                              onChange={() => toggleScenario(s.id)}
                              className="h-4 w-4"
                              data-testid={`checkbox-scenario-${s.id}`}
                            />
                            <span className="text-sm font-medium">Practiced and Confident</span>
                          </label>
                          {s.completed && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="frameworks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Answer Frameworks Guide</CardTitle>
                  <CardDescription>Structured approaches to answering interview questions effectively</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">STAR Framework</h3>
                      <p className="text-sm mb-3">Best for behavioral and experience-based questions</p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-sm">S - Situation</p>
                          <p className="text-sm text-muted-foreground">Describe the context and background of the situation</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">T - Task</p>
                          <p className="text-sm text-muted-foreground">Explain what needed to be accomplished or the challenge faced</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">A - Action</p>
                          <p className="text-sm text-muted-foreground">Detail the specific steps you took and why</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">R - Result</p>
                          <p className="text-sm text-muted-foreground">Share the outcomes, impact, and what you learned</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">CAR Framework</h3>
                      <p className="text-sm mb-3">Simpler format for straightforward questions</p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-sm">C - Context</p>
                          <p className="text-sm text-muted-foreground">Set the scene and provide necessary background</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">A - Action</p>
                          <p className="text-sm text-muted-foreground">Describe what you did, focusing on your role</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">R - Result</p>
                          <p className="text-sm text-muted-foreground">Explain the positive outcomes achieved</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">PAR Framework</h3>
                      <p className="text-sm mb-3">Effective for problem-solving questions</p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-sm">P - Problem</p>
                          <p className="text-sm text-muted-foreground">Clearly define the problem or challenge</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">A - Action</p>
                          <p className="text-sm text-muted-foreground">Detail your approach to solving it</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">R - Result</p>
                          <p className="text-sm text-muted-foreground">Quantify the solution impact</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">SOAR Framework</h3>
                      <p className="text-sm mb-3">Great for demonstrating resilience and problem-solving</p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-sm">S - Situation</p>
                          <p className="text-sm text-muted-foreground">Describe the initial situation</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">O - Obstacle</p>
                          <p className="text-sm text-muted-foreground">Highlight the specific challenge or barrier</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">A - Action</p>
                          <p className="text-sm text-muted-foreground">Explain how you overcame the obstacle</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">R - Result</p>
                          <p className="text-sm text-muted-foreground">Share successful outcomes despite challenges</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Presentation Strategies</CardTitle>
                  <CardDescription>How to effectively support your answers with documentation and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Quantify Everything</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Use specific numbers, percentages, and metrics whenever possible. Instead of "significant growth", say "127% revenue increase over 6 months"
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "Our customer base grew from 150 to 340 users in Q1, representing 127% growth, with 89% retention rate"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Reference Specific Documentation</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Have physical copies organized and reference them specifically during your answers
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "As you can see in the bank verification letter dated March 15th, the full investment amount is accessible..."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Customer Validation</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Include direct customer testimonials, letters of intent, or signed contracts
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "We have 3 letters of intent totaling £45,000 in first-year contracts, including one from NHS trust..."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Third-Party Verification</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cite independent sources, industry reports, or expert opinions
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "According to Gartner's 2025 report, our market is expected to grow to £2.3B by 2028..."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        5
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Timeline Evidence</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Show progression and momentum with dated milestones
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "Beta launch November 2025, first paying customer December, 50 customers by February 2026, 340 by May..."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        6
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Competitive Benchmarks</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Compare your performance against industry standards or competitors
                        </p>
                        <p className="text-sm font-medium">Example:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "Industry average customer acquisition cost is £150; ours is £87, giving us 42% better economics"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        7
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Visual Support (if allowed)</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Prepare simple charts or graphs to illustrate complex points
                        </p>
                        <p className="text-sm font-medium">Tip:</p>
                        <p className="text-sm text-muted-foreground italic">
                          Check with your endorsing body if visual aids are permitted during the interview
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Critical Reminder:</strong> Every factual claim you make should be backed by specific evidence you can produce if requested. Never exaggerate or misrepresent data.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Readiness Radar</CardTitle>
                    <CardDescription>Preparedness across question categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Readiness"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Question Preparation Status</CardTitle>
                    <CardDescription>Distribution of preparation levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Start preparing questions to see distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Preparation Metrics</CardTitle>
                  <CardDescription>Comprehensive breakdown of your interview readiness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Questions Marked Prepared</p>
                          <p className="text-sm font-bold">{preparedQuestions}/{totalQuestions}</p>
                        </div>
                        <Progress value={(preparedQuestions / totalQuestions) * 100} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Complete Answers (200+ chars)</p>
                          <p className="text-sm font-bold">{questionsWithAnswers}/{totalQuestions}</p>
                        </div>
                        <Progress value={(questionsWithAnswers / totalQuestions) * 100} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Evidence Documented</p>
                          <p className="text-sm font-bold">{questionsWithEvidence}/{totalQuestions}</p>
                        </div>
                        <Progress value={(questionsWithEvidence / totalQuestions) * 100} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Structured Frameworks Used</p>
                          <p className="text-sm font-bold">{questionsWithFramework}/{totalQuestions}</p>
                        </div>
                        <Progress value={(questionsWithFramework / totalQuestions) * 100} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Practice Scenarios Completed</p>
                          <p className="text-sm font-bold">{completedScenarios}/{totalScenarios}</p>
                        </div>
                        <Progress value={(completedScenarios / totalScenarios) * 100} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Overall Preparedness</p>
                          <p className="text-sm font-bold">{preparednessScore}%</p>
                        </div>
                        <Progress value={preparednessScore} />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">Category-Specific Scores</h4>
                      <div className="space-y-2">
                        {radarData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={item.score} className="w-32" />
                              <span className="text-sm font-bold w-12 text-right">{item.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
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
