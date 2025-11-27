import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "question-bank",
  toolName: "Question Bank",
  agent: "sage",
  greeting: "Hello! I'm Sage, your compliance specialist. Let's prepare you for endorsing body interviews by practicing the most common and challenging questions assessors ask.",
  questions: [
    {
      id: "innovation",
      question: "How would you explain what makes your business genuinely innovative to an assessor?",
      hint: "Prepare for the most common interview question - what's genuinely innovative",
      fieldKey: "innovationExplanation",
      minLength: 100
    },
    {
      id: "viability",
      question: "How will you demonstrate your business is commercially viable?",
      hint: "Include revenue projections, unit economics, and market validation",
      fieldKey: "viabilityEvidence",
      minLength: 100
    },
    {
      id: "scalability",
      question: "Explain how your business will create UK jobs and scale nationally/internationally.",
      hint: "Include specific hiring plans and growth milestones",
      fieldKey: "scalabilityPlan",
      minLength: 100
    },
    {
      id: "whyUK",
      question: "Why is the UK specifically important for your business?",
      hint: "Demonstrate genuine commitment to the UK market",
      fieldKey: "ukRationale",
      minLength: 80
    },
    {
      id: "competition",
      question: "Who are your competitors and why will customers choose you?",
      hint: "Show market awareness and clear positioning",
      fieldKey: "competitivePosition",
      minLength: 80
    },
    {
      id: "experience",
      question: "What qualifies you to execute this business plan successfully?",
      hint: "Highlight relevant experience and past successes",
      fieldKey: "founderQualifications",
      minLength: 80
    }
  ],
  completionMessage: "Excellent! Your interview preparation is taking shape. Practice these answers until they feel natural and confident."
};

type QuestionCategory = 
  | 'visa-interview' 
  | 'endorser-evaluation' 
  | 'investor-pitch' 
  | 'business-model' 
  | 'innovation' 
  | 'financials' 
  | 'team' 
  | 'market'
  | 'uk-impact';

type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

type PreparationStatus = 'not-started' | 'in-progress' | 'prepared' | 'mastered';

type Question = {
  id: string;
  category: QuestionCategory;
  subcategory: string;
  question: string;
  difficulty: DifficultyLevel;
  status: PreparationStatus;
  answer: string;
  keyPoints: string[];
  evidence: string;
  practiceCount: number;
  lastPracticed: string;
  notes: string;
};

const QUESTION_BANK: Omit<Question, 'status' | 'answer' | 'keyPoints' | 'evidence' | 'practiceCount' | 'lastPracticed' | 'notes'>[] = [
  // Visa Interview Questions
  {
    id: 'vi1',
    category: 'visa-interview',
    subcategory: 'Eligibility',
    question: 'Why are you applying for the UK Innovator Founder visa instead of another visa type?',
    difficulty: 'basic',
  },
  {
    id: 'vi2',
    category: 'visa-interview',
    subcategory: 'Business Viability',
    question: 'Explain your business model and how it will generate revenue in the UK market.',
    difficulty: 'intermediate',
  },
  {
    id: 'vi3',
    category: 'visa-interview',
    subcategory: 'UK Benefit',
    question: 'What specific benefit will your business bring to the UK economy?',
    difficulty: 'intermediate',
  },
  {
    id: 'vi4',
    category: 'visa-interview',
    subcategory: 'Funding',
    question: 'Where is your funding coming from and can you prove it is available now?',
    difficulty: 'advanced',
  },
  {
    id: 'vi5',
    category: 'visa-interview',
    subcategory: 'Timeline',
    question: 'What are your plans for the first 12 months after visa approval?',
    difficulty: 'basic',
  },
  {
    id: 'vi6',
    category: 'visa-interview',
    subcategory: 'Commitment',
    question: 'How will you support yourself and your family while building this business in the UK?',
    difficulty: 'intermediate',
  },
  {
    id: 'vi7',
    category: 'visa-interview',
    subcategory: 'Scalability',
    question: 'What is your plan to scale this business beyond the initial phase?',
    difficulty: 'advanced',
  },
  {
    id: 'vi8',
    category: 'visa-interview',
    subcategory: 'Previous Experience',
    question: 'What experience do you have that qualifies you to run this business successfully?',
    difficulty: 'basic',
  },

  // Endorser Evaluation Questions
  {
    id: 'ee1',
    category: 'endorser-evaluation',
    subcategory: 'Innovation Criteria',
    question: 'Demonstrate that your business idea is genuinely innovative or significantly different from existing UK market offerings.',
    difficulty: 'advanced',
  },
  {
    id: 'ee2',
    category: 'endorser-evaluation',
    subcategory: 'Viability Assessment',
    question: 'Provide evidence that your business is viable with realistic revenue projections and market validation.',
    difficulty: 'advanced',
  },
  {
    id: 'ee3',
    category: 'endorser-evaluation',
    subcategory: 'Scalability Potential',
    question: 'Explain how your business can achieve significant growth and create jobs in the UK within 3 years.',
    difficulty: 'advanced',
  },
  {
    id: 'ee4',
    category: 'endorser-evaluation',
    subcategory: 'Founder Capability',
    question: 'What makes you the right person to execute this business plan successfully?',
    difficulty: 'intermediate',
  },
  {
    id: 'ee5',
    category: 'endorser-evaluation',
    subcategory: 'Market Research',
    question: 'What market research have you conducted to validate demand for your product or service in the UK?',
    difficulty: 'intermediate',
  },
  {
    id: 'ee6',
    category: 'endorser-evaluation',
    subcategory: 'Competitive Advantage',
    question: 'Who are your main competitors and what is your sustainable competitive advantage?',
    difficulty: 'advanced',
  },
  {
    id: 'ee7',
    category: 'endorser-evaluation',
    subcategory: 'IP Protection',
    question: 'Do you have intellectual property, and if so, how are you protecting it?',
    difficulty: 'intermediate',
  },
  {
    id: 'ee8',
    category: 'endorser-evaluation',
    subcategory: 'Risk Mitigation',
    question: 'What are the major risks to your business and how will you mitigate them?',
    difficulty: 'advanced',
  },

  // Investor Pitch Questions
  {
    id: 'ip1',
    category: 'investor-pitch',
    subcategory: 'Problem Statement',
    question: 'What specific problem are you solving and how big is this problem?',
    difficulty: 'basic',
  },
  {
    id: 'ip2',
    category: 'investor-pitch',
    subcategory: 'Solution',
    question: 'Why is your solution better than existing alternatives?',
    difficulty: 'intermediate',
  },
  {
    id: 'ip3',
    category: 'investor-pitch',
    subcategory: 'Market Size',
    question: 'What is the total addressable market (TAM) and serviceable addressable market (SAM) for your business?',
    difficulty: 'advanced',
  },
  {
    id: 'ip4',
    category: 'investor-pitch',
    subcategory: 'Revenue Model',
    question: 'How exactly will you make money? Walk through your unit economics.',
    difficulty: 'advanced',
  },
  {
    id: 'ip5',
    category: 'investor-pitch',
    subcategory: 'Traction',
    question: 'What traction have you achieved so far? (customers, revenue, partnerships, etc.)',
    difficulty: 'intermediate',
  },
  {
    id: 'ip6',
    category: 'investor-pitch',
    subcategory: 'Use of Funds',
    question: 'How will you deploy your investment funds? Provide a detailed breakdown.',
    difficulty: 'advanced',
  },
  {
    id: 'ip7',
    category: 'investor-pitch',
    subcategory: 'Exit Strategy',
    question: 'What is your long-term vision and potential exit strategy?',
    difficulty: 'advanced',
  },
  {
    id: 'ip8',
    category: 'investor-pitch',
    subcategory: 'Team Strength',
    question: 'Why is your team uniquely positioned to execute this business plan?',
    difficulty: 'intermediate',
  },

  // Business Model Questions
  {
    id: 'bm1',
    category: 'business-model',
    subcategory: 'Customer Segments',
    question: 'Who are your target customers and how will you reach them?',
    difficulty: 'basic',
  },
  {
    id: 'bm2',
    category: 'business-model',
    subcategory: 'Value Proposition',
    question: 'What unique value do you provide that customers cannot get elsewhere?',
    difficulty: 'intermediate',
  },
  {
    id: 'bm3',
    category: 'business-model',
    subcategory: 'Revenue Streams',
    question: 'What are all your revenue streams and which will be most significant?',
    difficulty: 'intermediate',
  },
  {
    id: 'bm4',
    category: 'business-model',
    subcategory: 'Cost Structure',
    question: 'What are your main cost drivers and how will you control them as you scale?',
    difficulty: 'advanced',
  },

  // Innovation Questions
  {
    id: 'in1',
    category: 'innovation',
    subcategory: 'Novel Approach',
    question: 'What makes your approach genuinely innovative rather than incremental?',
    difficulty: 'advanced',
  },
  {
    id: 'in2',
    category: 'innovation',
    subcategory: 'Technology',
    question: 'What technology or methodology differentiates you from competitors?',
    difficulty: 'intermediate',
  },
  {
    id: 'in3',
    category: 'innovation',
    subcategory: 'Validation',
    question: 'How have you validated that your innovation solves a real problem effectively?',
    difficulty: 'advanced',
  },
  {
    id: 'in4',
    category: 'innovation',
    subcategory: 'Industry Impact',
    question: 'How will your innovation impact or disrupt your target industry?',
    difficulty: 'advanced',
  },

  // Financial Questions
  {
    id: 'fi1',
    category: 'financials',
    subcategory: 'Projections',
    question: 'Walk through your financial projections for the next 3 years. What are your key assumptions?',
    difficulty: 'advanced',
  },
  {
    id: 'fi2',
    category: 'financials',
    subcategory: 'Profitability',
    question: 'When do you expect to reach profitability and what needs to happen for that?',
    difficulty: 'advanced',
  },
  {
    id: 'fi3',
    category: 'financials',
    subcategory: 'Burn Rate',
    question: 'What is your monthly burn rate and how long will your funding last?',
    difficulty: 'intermediate',
  },
  {
    id: 'fi4',
    category: 'financials',
    subcategory: 'Pricing Strategy',
    question: 'How did you determine your pricing and is it competitive in the UK market?',
    difficulty: 'intermediate',
  },

  // Team Questions
  {
    id: 'tm1',
    category: 'team',
    subcategory: 'Founder Background',
    question: 'Describe your professional background and how it prepares you for this venture.',
    difficulty: 'basic',
  },
  {
    id: 'tm2',
    category: 'team',
    subcategory: 'Team Composition',
    question: 'Who else is on your team and what critical skills do they bring?',
    difficulty: 'intermediate',
  },
  {
    id: 'tm3',
    category: 'team',
    subcategory: 'Hiring Plan',
    question: 'What roles do you plan to hire in the UK and when?',
    difficulty: 'intermediate',
  },
  {
    id: 'tm4',
    category: 'team',
    subcategory: 'Skill Gaps',
    question: 'What skill gaps exist in your current team and how will you address them?',
    difficulty: 'advanced',
  },

  // Market Questions
  {
    id: 'mk1',
    category: 'market',
    subcategory: 'Market Analysis',
    question: 'How large is your target market in the UK and how fast is it growing?',
    difficulty: 'intermediate',
  },
  {
    id: 'mk2',
    category: 'market',
    subcategory: 'Customer Acquisition',
    question: 'What is your customer acquisition strategy and what will it cost per customer?',
    difficulty: 'advanced',
  },
  {
    id: 'mk3',
    category: 'market',
    subcategory: 'Go-to-Market',
    question: 'Describe your go-to-market strategy for launching in the UK.',
    difficulty: 'intermediate',
  },
  {
    id: 'mk4',
    category: 'market',
    subcategory: 'Market Validation',
    question: 'What evidence do you have of market demand? (pre-orders, letters of intent, pilots, etc.)',
    difficulty: 'advanced',
  },

  // UK Impact Questions
  {
    id: 'uk1',
    category: 'uk-impact',
    subcategory: 'Job Creation',
    question: 'How many jobs do you expect to create in the UK within 3 years?',
    difficulty: 'intermediate',
  },
  {
    id: 'uk2',
    category: 'uk-impact',
    subcategory: 'Economic Contribution',
    question: 'What is the projected economic impact of your business on the UK economy?',
    difficulty: 'advanced',
  },
  {
    id: 'uk3',
    category: 'uk-impact',
    subcategory: 'UK Location',
    question: 'Why specifically the UK? Why not launch in another country?',
    difficulty: 'intermediate',
  },
  {
    id: 'uk4',
    category: 'uk-impact',
    subcategory: 'Local Ecosystem',
    question: 'How will you engage with the UK business ecosystem? (partnerships, suppliers, etc.)',
    difficulty: 'intermediate',
  },
];

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  'visa-interview': 'Visa Interview',
  'endorser-evaluation': 'Endorser Evaluation',
  'investor-pitch': 'Investor Pitch',
  'business-model': 'Business Model',
  'innovation': 'Innovation',
  'financials': 'Financials',
  'team': 'Team',
  'market': 'Market',
  'uk-impact': 'UK Impact',
};

const DIFFICULTY_COLORS = {
  basic: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const STATUS_COLORS = {
  'not-started': '#94a3b8',
  'in-progress': '#3b82f6',
  'prepared': '#10b981',
  'mastered': '#8b5cf6',
};

export default function QuestionBank() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('question-bank-mode') as 'ai' | 'traditional') || 'ai';
  });
  const [questions, setQuestions] = useState<Question[]>(
    QUESTION_BANK.map(q => ({
      ...q,
      status: 'not-started' as PreparationStatus,
      answer: '',
      keyPoints: [],
      evidence: '',
      practiceCount: 0,
      lastPracticed: '',
      notes: '',
    }))
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addKeyPoint = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      updateQuestion(id, { keyPoints: [...question.keyPoints, ''] });
    }
  };

  const updateKeyPoint = (id: string, index: number, value: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const newPoints = [...question.keyPoints];
      newPoints[index] = value;
      updateQuestion(id, { keyPoints: newPoints });
    }
  };

  const removeKeyPoint = (id: string, index: number) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      updateQuestion(id, { keyPoints: question.keyPoints.filter((_, i) => i !== index) });
    }
  };

  const incrementPractice = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      updateQuestion(id, {
        practiceCount: question.practiceCount + 1,
        lastPracticed: new Date().toLocaleDateString('en-GB'),
      });
    }
  };

  // Analytics
  const totalQuestions = questions.length;
  const notStarted = questions.filter(q => q.status === 'not-started').length;
  const inProgress = questions.filter(q => q.status === 'in-progress').length;
  const prepared = questions.filter(q => q.status === 'prepared').length;
  const mastered = questions.filter(q => q.status === 'mastered').length;

  const questionsWithAnswers = questions.filter(q => q.answer.length > 100).length;
  const questionsWithEvidence = questions.filter(q => q.evidence.length > 50).length;
  const questionsWithKeyPoints = questions.filter(q => q.keyPoints.length >= 3).length;
  const questionsPracticed = questions.filter(q => q.practiceCount > 0).length;

  const completenessScore = Math.round(
    ((mastered * 4 + prepared * 3 + inProgress * 1.5) / (totalQuestions * 4)) * 100
  );

  const readinessScore = Math.round(
    ((questionsWithAnswers / totalQuestions) * 30) +
    ((questionsWithEvidence / totalQuestions) * 25) +
    ((questionsWithKeyPoints / totalQuestions) * 20) +
    ((questionsPracticed / totalQuestions) * 15) +
    ((mastered / totalQuestions) * 10)
  );

  // Category Coverage Data
  const categoryCoverage = Object.keys(CATEGORY_LABELS).map(cat => {
    const categoryQuestions = questions.filter(q => q.category === cat);
    const preparedInCategory = categoryQuestions.filter(
      q => q.status === 'prepared' || q.status === 'mastered'
    ).length;
    const coverage = categoryQuestions.length > 0
      ? Math.round((preparedInCategory / categoryQuestions.length) * 100)
      : 0;
    
    return {
      name: CATEGORY_LABELS[cat as QuestionCategory],
      value: coverage,
      total: categoryQuestions.length,
      prepared: preparedInCategory,
    };
  });

  // Difficulty Distribution
  const difficultyDistribution = [
    {
      name: 'Basic',
      total: questions.filter(q => q.difficulty === 'basic').length,
      prepared: questions.filter(q => q.difficulty === 'basic' && (q.status === 'prepared' || q.status === 'mastered')).length,
      color: DIFFICULTY_COLORS.basic,
    },
    {
      name: 'Intermediate',
      total: questions.filter(q => q.difficulty === 'intermediate').length,
      prepared: questions.filter(q => q.difficulty === 'intermediate' && (q.status === 'prepared' || q.status === 'mastered')).length,
      color: DIFFICULTY_COLORS.intermediate,
    },
    {
      name: 'Advanced',
      total: questions.filter(q => q.difficulty === 'advanced').length,
      prepared: questions.filter(q => q.difficulty === 'advanced' && (q.status === 'prepared' || q.status === 'mastered')).length,
      color: DIFFICULTY_COLORS.advanced,
    },
  ];

  // Status Pie Data
  const statusPieData = [
    { name: 'Not Started', value: notStarted, color: STATUS_COLORS['not-started'] },
    { name: 'In Progress', value: inProgress, color: STATUS_COLORS['in-progress'] },
    { name: 'Prepared', value: prepared, color: STATUS_COLORS.prepared },
    { name: 'Mastered', value: mastered, color: STATUS_COLORS.mastered },
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      questions,
      activeTab,
      selectedCategory,
      selectedDifficulty,
      selectedQuestion,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('questions' in state) setQuestions(state.questions);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedCategory' in state) setSelectedCategory(state.selectedCategory);
    if ('selectedDifficulty' in state) setSelectedDifficulty(state.selectedDifficulty);
    if ('selectedQuestion' in state) setSelectedQuestion(state.selectedQuestion);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('question-bank-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newQuestions = [...questions];
    if (answers.innovationExplanation) {
      const innovationQ = newQuestions.find(q => q.category === 'innovation' && q.status === 'not-started');
      if (innovationQ) {
        innovationQ.answer = answers.innovationExplanation;
        innovationQ.status = 'in-progress';
      }
    }
    if (answers.viabilityEvidence) {
      const viabilityQ = newQuestions.find(q => q.category === 'business-model' && q.status === 'not-started');
      if (viabilityQ) {
        viabilityQ.answer = answers.viabilityEvidence;
        viabilityQ.status = 'in-progress';
      }
    }
    if (answers.scalabilityPlan) {
      const scaleQ = newQuestions.find(q => q.category === 'uk-impact' && q.status === 'not-started');
      if (scaleQ) {
        scaleQ.answer = answers.scalabilityPlan;
        scaleQ.status = 'in-progress';
      }
    }
    if (answers.ukRationale) {
      const ukQ = newQuestions.find(q => q.subcategory === 'UK Location' && q.status === 'not-started');
      if (ukQ) {
        ukQ.answer = answers.ukRationale;
        ukQ.status = 'in-progress';
      }
    }
    if (answers.competitivePosition) {
      const compQ = newQuestions.find(q => q.category === 'market' && q.status === 'not-started');
      if (compQ) {
        compQ.answer = answers.competitivePosition;
        compQ.status = 'in-progress';
      }
    }
    if (answers.founderQualifications) {
      const teamQ = newQuestions.find(q => q.category === 'team' && q.status === 'not-started');
      if (teamQ) {
        teamQ.answer = answers.founderQualifications;
        teamQ.status = 'in-progress';
      }
    }
    setQuestions(newQuestions);
    setMode('traditional');
  };

  useEffect(() => {
    const handoffKey = 'question-bank_handoff';
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
      const saved = localStorage.getItem('question-bank-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('question-bank-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('question-bank-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (completenessScore < 30) {
      tips.push("Start with basic-level questions in each category to build foundational confidence");
    }

    if (questionsWithAnswers < totalQuestions * 0.5) {
      tips.push("Aim for 200-400 word answers that are comprehensive yet concise - quality over quantity");
    }

    if (questionsWithKeyPoints < totalQuestions * 0.6) {
      tips.push("Identify 3-5 key points for each question to structure your thinking and ensure you cover all critical aspects");
    }

    if (questionsWithEvidence < totalQuestions * 0.7) {
      tips.push("Support every significant claim with specific evidence: metrics, testimonials, documents, or third-party validation");
    }

    if (questionsPracticed < 10) {
      tips.push("Practice answering questions out loud and record yourself - verbal delivery is very different from written responses");
    }

    const weakCategory = categoryCoverage.reduce((min, cat) => cat.value < min.value ? cat : min);
    if (weakCategory.value < 50 && categoryCoverage.length > 0) {
      tips.push(`Focus on ${weakCategory.name} questions - this is your weakest category at ${weakCategory.value}% prepared`);
    }

    const advancedPrepared = questions.filter(q => q.difficulty === 'advanced' && (q.status === 'prepared' || q.status === 'mastered')).length;
    const advancedTotal = questions.filter(q => q.difficulty === 'advanced').length;
    if (advancedPrepared < advancedTotal * 0.6) {
      tips.push("Advanced questions require deeper preparation - allocate extra time for complex topics like financials and scalability");
    }

    if (readinessScore >= 80) {
      tips.push("Excellent preparation level - now focus on delivery, confidence, and adapting answers to different audiences");
    }

    tips.push("Research your specific audience (visa officer, endorser panel, investor) and tailor answers to their priorities");
    tips.push("Prepare follow-up responses for each question - anticipate deeper probing on any topic you mention");
    tips.push("Create a master document linking each answer to specific supporting evidence you can provide on request");

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete answers to all basic-level questions across all categories", priority: "Critical" },
      { week: "Week 1", action: "Identify 3-5 key points for every question to structure your responses", priority: "High" },
      { week: "Week 1-2", action: "Draft comprehensive answers (200-400 words) for all intermediate questions", priority: "Critical" },
      { week: "Week 2", action: "Gather and organize supporting evidence for every major claim in your answers", priority: "Critical" },
      { week: "Week 2", action: "Focus on weak categories - aim for 70%+ coverage in all question types", priority: "High" },
      { week: "Week 2-3", action: "Complete advanced question preparation with detailed financial and technical answers", priority: "Critical" },
      { week: "Week 3", action: "Practice answering random questions out loud - simulate interview pressure", priority: "High" },
      { week: "Week 3", action: "Conduct mock interviews with advisors for visa, endorser, and investor scenarios", priority: "Critical" },
      { week: "Week 3-4", action: "Refine answers based on feedback and practice delivery timing (2-3 min per answer)", priority: "High" },
      { week: "Week 4", action: "Create quick reference cards for complex topics (financials, market size, etc.)", priority: "Medium" },
      { week: "Week 4", action: "Review all evidence documents and ensure immediate accessibility during interviews", priority: "Critical" },
      { week: "Week 4", action: "Final rehearsal of top 20 most likely questions for your specific situation", priority: "High" },
    ];
  };

  const handleExport = () => {
    const report = `COMPREHENSIVE INTERVIEW QUESTION BANK REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(100)}

PREPARATION SUMMARY
${'-'.repeat(100)}
Total Questions: ${totalQuestions}
Completeness Score: ${completenessScore}%
Readiness Score: ${readinessScore}%

Status Breakdown:
- Not Started: ${notStarted} questions (${Math.round((notStarted/totalQuestions)*100)}%)
- In Progress: ${inProgress} questions (${Math.round((inProgress/totalQuestions)*100)}%)
- Prepared: ${prepared} questions (${Math.round((prepared/totalQuestions)*100)}%)
- Mastered: ${mastered} questions (${Math.round((mastered/totalQuestions)*100)}%)

Preparation Metrics:
- Questions with complete answers (100+ words): ${questionsWithAnswers}/${totalQuestions}
- Questions with evidence: ${questionsWithEvidence}/${totalQuestions}
- Questions with key points identified: ${questionsWithKeyPoints}/${totalQuestions}
- Questions practiced: ${questionsPracticed}/${totalQuestions}

CATEGORY COVERAGE ANALYSIS
${'-'.repeat(100)}
${categoryCoverage.map(cat => 
  `${cat.name}: ${cat.value}% prepared (${cat.prepared}/${cat.total} questions)`
).join('\n')}

DIFFICULTY DISTRIBUTION
${'-'.repeat(100)}
${difficultyDistribution.map(d => 
  `${d.name}: ${d.prepared}/${d.total} prepared (${Math.round((d.prepared/d.total)*100)}%)`
).join('\n')}

DETAILED QUESTION PREPARATION
${'-'.repeat(100)}
${questions.map((q, i) => `
${i + 1}. [${CATEGORY_LABELS[q.category]}] [${q.difficulty.toUpperCase()}] ${q.question}
   Subcategory: ${q.subcategory}
   Status: ${q.status.toUpperCase().replace('-', ' ')}
   Practice Count: ${q.practiceCount} times
   Last Practiced: ${q.lastPracticed || 'Never'}
   
   ${q.answer ? `ANSWER:\n   ${q.answer.split('\n').join('\n   ')}` : 'Answer not yet prepared'}
   
   ${q.keyPoints.length > 0 ? `KEY POINTS:\n${q.keyPoints.map((p, idx) => `   ${idx + 1}. ${p}`).join('\n')}` : 'Key points not identified'}
   
   ${q.evidence ? `SUPPORTING EVIDENCE:\n   ${q.evidence.split('\n').join('\n   ')}` : 'Evidence not documented'}
   
   ${q.notes ? `NOTES:\n   ${q.notes.split('\n').join('\n   ')}` : ''}
`).join('\n' + '-'.repeat(100) + '\n')}

QUESTION PREPARATION FRAMEWORK
${'-'.repeat(100)}
For Each Question:

1. UNDERSTAND THE INTENT
   - What is the interviewer really asking?
   - What concerns are they trying to address?
   - What evidence would satisfy them?

2. STRUCTURE YOUR ANSWER
   - Opening: Direct response to the question
   - Body: Supporting details, evidence, examples
   - Conclusion: Reinforce key message
   - Target length: 200-400 words (2-3 minutes spoken)

3. IDENTIFY KEY POINTS (3-5 per question)
   - Main arguments or facts
   - Critical supporting data
   - Examples or anecdotes
   - Transition to related topics if asked follow-ups

4. GATHER EVIDENCE
   - Quantitative data and metrics
   - Documents and verification
   - Third-party validation
   - Customer testimonials or letters
   - Market research citations

5. PRACTICE DELIVERY
   - Say it out loud multiple times
   - Record and review yourself
   - Time your response
   - Practice with different phrasing
   - Prepare for follow-up questions

AUDIENCE-SPECIFIC GUIDANCE
${'-'.repeat(100)}
VISA INTERVIEW OFFICERS:
- Focus: Eligibility, compliance, genuine intention
- Tone: Professional, straightforward, evidence-based
- Key: Demonstrate you meet all requirements and have genuine plans

ENDORSER EVALUATION PANELS:
- Focus: Innovation, viability, scalability, UK benefit
- Tone: Confident, visionary, data-driven
- Key: Prove your business is innovative AND commercially viable

INVESTOR PRESENTATIONS:
- Focus: ROI, market opportunity, team execution ability
- Tone: Compelling, ambitious, realistic
- Key: Show traction and clear path to significant returns

SMART TIPS & RECOMMENDATIONS
${'-'.repeat(100)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(100)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ANSWER QUALITY CHECKLIST
${'-'.repeat(100)}
For each answer, ensure:
□ Directly addresses the question asked
□ 200-400 words (2-3 minutes spoken)
□ Structured with clear beginning, middle, end
□ Supported by specific evidence or data
□ Includes concrete examples
□ Demonstrates subject matter expertise
□ Anticipates likely follow-up questions
□ Tailored to specific audience (visa/endorser/investor)
□ Practiced out loud at least 3 times
□ Evidence documents ready to present

INTERVIEW PREPARATION BEST PRACTICES
${'-'.repeat(100)}
Before the Interview:
- Review all prepared answers day before
- Organize evidence documents in order of likelihood needed
- Research your interviewer/panel if possible
- Prepare 3-5 questions to ask them
- Get good rest - mental clarity is critical
- Arrive 15 minutes early

During the Interview:
- Listen carefully to each question
- Take brief pause before answering (shows thoughtfulness)
- Speak clearly and at moderate pace
- Reference specific evidence when making claims
- Watch for non-verbal cues of interest or concern
- Be honest about what you don't know
- Ask for clarification if question is unclear
- Maintain confident, professional body language

After Each Answer:
- Check if they want more detail
- Offer to provide supporting documentation
- Note any surprised reactions for follow-up
- Be ready to dive deeper on any point

Handling Difficult Questions:
- Stay calm and professional
- Buy time: "That's an excellent question, let me think..."
- Break complex questions into parts
- If you don't know, say so and offer to follow up
- Turn challenges into opportunities to demonstrate preparation
- Have backup plans for every major concern

${'='.repeat(100)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-bank-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredQuestions = questions.filter(q => {
    const categoryMatch = selectedCategory === 'all' || q.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getReadinessLevel = () => {
    if (readinessScore >= 90) return { label: 'Interview Ready', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' };
    if (readinessScore >= 75) return { label: 'Strong Preparation', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' };
    if (readinessScore >= 60) return { label: 'Good Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    if (readinessScore >= 40) return { label: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' };
    return { label: 'Getting Started', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' };
  };

  const readinessLevel = getReadinessLevel();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-question-bank">
                Comprehensive Interview Question Bank
              </h1>
              <p className="text-lg text-muted-foreground">
                Master visa interviews, endorser evaluations, and investor pitches
              </p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">
                  Last saved: {savedDate}
                </p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          <ToolUtilityBar
            toolId="question-bank"
            toolName="Question Bank"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={() => setShowTips(!showTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
            <>
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
                  <p className="text-sm text-muted-foreground mb-2">Completeness Score</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-completeness-score">{completenessScore}%</p>
                  <Progress value={completenessScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Readiness Score</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-readiness-score">{readinessScore}%</p>
                  <p className={`text-sm mt-2 font-semibold ${readinessLevel.color}`} data-testid="text-readiness-level">
                    {readinessLevel.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Questions Mastered</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-mastered-count">{mastered}</p>
                  <p className="text-sm text-muted-foreground mt-2">of {totalQuestions} total</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Practice Sessions</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="text-practice-count">{questionsPracticed}</p>
                  <p className="text-sm text-muted-foreground mt-2">questions practiced</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-question-bank">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="questions" data-testid="tab-questions">Questions</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="practice" data-testid="tab-practice">Practice</TabsTrigger>
              <TabsTrigger value="guide" data-testid="tab-guide">Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preparation Status Distribution</CardTitle>
                    <CardDescription>Question readiness breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Distribution</CardTitle>
                    <CardDescription>Preparation by question difficulty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={difficultyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name="Total" fill="#94a3b8" />
                        <Bar dataKey="prepared" name="Prepared" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Coverage</CardTitle>
                  <CardDescription>Preparation progress across question categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryCoverage.map((cat, index) => (
                      <div key={index} className="space-y-2" data-testid={`category-progress-${index}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {cat.prepared}/{cat.total} ({cat.value}%)
                          </span>
                        </div>
                        <Progress value={cat.value} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={readinessLevel.bgColor}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {readinessScore >= 75 ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : readinessScore >= 40 ? (
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                    Readiness Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-lg font-semibold ${readinessLevel.color} mb-4`}>
                    Status: {readinessLevel.label}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complete Answers</span>
                      <span className="text-sm font-medium">{questionsWithAnswers}/{totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Evidence Documented</span>
                      <span className="text-sm font-medium">{questionsWithEvidence}/{totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Key Points Identified</span>
                      <span className="text-sm font-medium">{questionsWithKeyPoints}/{totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Practiced</span>
                      <span className="text-sm font-medium">{questionsPracticed}/{totalQuestions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filter Questions</CardTitle>
                  <CardDescription>Narrow down by category and difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category-filter">Category</Label>
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                        data-testid="select-category-filter"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty-filter">Difficulty</Label>
                      <select
                        id="difficulty-filter"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                        data-testid="select-difficulty-filter"
                      >
                        <option value="all">All Difficulties</option>
                        <option value="basic">Basic</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4" data-testid="text-filtered-count">
                    Showing {filteredQuestions.length} questions
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <Card key={q.id} className="hover-elevate" data-testid={`question-card-${q.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" data-testid={`badge-category-${q.id}`}>
                              {CATEGORY_LABELS[q.category]}
                            </Badge>
                            <Badge variant="outline" data-testid={`badge-subcategory-${q.id}`}>
                              {q.subcategory}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              style={{ borderColor: DIFFICULTY_COLORS[q.difficulty], color: DIFFICULTY_COLORS[q.difficulty] }}
                              data-testid={`badge-difficulty-${q.id}`}
                            >
                              {q.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{q.question}</CardTitle>
                        </div>
                        <div className="flex flex-col gap-2">
                          <select
                            value={q.status}
                            onChange={(e) => updateQuestion(q.id, { status: e.target.value as PreparationStatus })}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-status-${q.id}`}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="prepared">Prepared</option>
                            <option value="mastered">Mastered</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    {selectedQuestion === q.id && (
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`answer-${q.id}`}>Your Answer</Label>
                          <Textarea
                            id={`answer-${q.id}`}
                            value={q.answer}
                            onChange={(e) => updateQuestion(q.id, { answer: e.target.value })}
                            placeholder="Write your comprehensive answer (200-400 words recommended)"
                            className="min-h-32 mt-1"
                            data-testid={`textarea-answer-${q.id}`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.answer.length} characters ({Math.round(q.answer.split(' ').length)} words)
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Key Points</Label>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => addKeyPoint(q.id)}
                              data-testid={`button-add-keypoint-${q.id}`}
                            >
                              Add Point
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {q.keyPoints.map((point, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={point}
                                  onChange={(e) => updateKeyPoint(q.id, index, e.target.value)}
                                  placeholder={`Key point ${index + 1}`}
                                  data-testid={`input-keypoint-${q.id}-${index}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeKeyPoint(q.id, index)}
                                  data-testid={`button-remove-keypoint-${q.id}-${index}`}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            {q.keyPoints.length === 0 && (
                              <p className="text-sm text-muted-foreground">No key points added yet</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`evidence-${q.id}`}>Supporting Evidence</Label>
                          <Textarea
                            id={`evidence-${q.id}`}
                            value={q.evidence}
                            onChange={(e) => updateQuestion(q.id, { evidence: e.target.value })}
                            placeholder="Document specific evidence: data, metrics, testimonials, documents you can reference"
                            className="min-h-20 mt-1"
                            data-testid={`textarea-evidence-${q.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`notes-${q.id}`}>Additional Notes</Label>
                          <Textarea
                            id={`notes-${q.id}`}
                            value={q.notes}
                            onChange={(e) => updateQuestion(q.id, { notes: e.target.value })}
                            placeholder="Practice notes, feedback, areas to improve"
                            className="min-h-20 mt-1"
                            data-testid={`textarea-notes-${q.id}`}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Practice Count:</span>
                              <span className="ml-2 font-medium" data-testid={`text-practice-count-${q.id}`}>{q.practiceCount}</span>
                            </div>
                            {q.lastPracticed && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Last Practiced:</span>
                                <span className="ml-2 font-medium" data-testid={`text-last-practiced-${q.id}`}>{q.lastPracticed}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => incrementPractice(q.id)}
                              data-testid={`button-practice-${q.id}`}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Log Practice
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedQuestion(null)}
                              data-testid={`button-collapse-${q.id}`}
                            >
                              Collapse
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                    {selectedQuestion !== q.id && (
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {q.answer.length > 0 && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                            {q.practiceCount > 0 && (
                              <span className="text-sm text-muted-foreground">
                                Practiced {q.practiceCount}x
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedQuestion(q.id)}
                            data-testid={`button-expand-${q.id}`}
                          >
                            Prepare Answer
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Coverage Pie Chart</CardTitle>
                    <CardDescription>Preparation completeness by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={categoryCoverage}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={(entry) => `${entry.name.split(' ')[0]}: ${entry.value}%`}
                        >
                          {categoryCoverage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${value}% (${props.payload.prepared}/${props.payload.total})`,
                            name
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Progress Bar Chart</CardTitle>
                    <CardDescription>Prepared vs total by difficulty level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={difficultyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name="Total Questions" fill="#94a3b8" />
                        <Bar dataKey="prepared" name="Prepared" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics</CardTitle>
                  <CardDescription>Comprehensive preparation statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Status Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Not Started:</span>
                          <span className="font-medium">{notStarted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>In Progress:</span>
                          <span className="font-medium">{inProgress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prepared:</span>
                          <span className="font-medium">{prepared}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mastered:</span>
                          <span className="font-medium">{mastered}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Quality Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Complete Answers:</span>
                          <span className="font-medium">{questionsWithAnswers}/{totalQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With Evidence:</span>
                          <span className="font-medium">{questionsWithEvidence}/{totalQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With Key Points:</span>
                          <span className="font-medium">{questionsWithKeyPoints}/{totalQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Practiced:</span>
                          <span className="font-medium">{questionsPracticed}/{totalQuestions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Score Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Completeness:</span>
                          <span className="font-medium">{completenessScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Readiness:</span>
                          <span className="font-medium">{readinessScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overall Level:</span>
                          <span className={`font-medium ${readinessLevel.color}`}>{readinessLevel.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Mode</CardTitle>
                  <CardDescription>Simulate real interview scenarios and track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Practice is essential for interview success. Aim to practice each question 3-5 times out loud before your actual interview.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Most Practiced Questions</h4>
                    {questions
                      .filter(q => q.practiceCount > 0)
                      .sort((a, b) => b.practiceCount - a.practiceCount)
                      .slice(0, 10)
                      .map((q, index) => (
                        <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid={`practice-item-${index}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {CATEGORY_LABELS[q.category]} • {q.difficulty}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold">{q.practiceCount}x</p>
                              {q.lastPracticed && (
                                <p className="text-xs text-muted-foreground">{q.lastPracticed}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => incrementPractice(q.id)}
                              data-testid={`button-practice-item-${index}`}
                            >
                              Practice Again
                            </Button>
                          </div>
                        </div>
                      ))}
                    {questions.filter(q => q.practiceCount > 0).length === 0 && (
                      <p className="text-center text-muted-foreground py-6">
                        No practice sessions logged yet. Start practicing questions to track your progress.
                      </p>
                    )}
                  </div>

                  <div className="mt-8 space-y-4">
                    <h4 className="font-semibold">Questions Needing Practice</h4>
                    <p className="text-sm text-muted-foreground">
                      These questions have answers prepared but little or no practice
                    </p>
                    {questions
                      .filter(q => q.answer.length > 100 && q.practiceCount < 3)
                      .slice(0, 10)
                      .map((q, index) => (
                        <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`needs-practice-item-${index}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {CATEGORY_LABELS[q.category]} • {q.difficulty}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(q.id);
                              setActiveTab('questions');
                            }}
                            data-testid={`button-practice-needed-${index}`}
                          >
                            Practice Now
                          </Button>
                        </div>
                      ))}
                    {questions.filter(q => q.answer.length > 100 && q.practiceCount < 3).length === 0 && (
                      <p className="text-center text-muted-foreground py-6">
                        All prepared questions have been practiced. Great work!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guide" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Preparation Framework</CardTitle>
                  <CardDescription>Best practices for answering different question types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">For Visa Interview Officers</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Focus on eligibility, compliance, and genuine intention to build a business in the UK.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Be direct and factual - demonstrate you meet all requirements</li>
                      <li>Have documentation ready to support every claim</li>
                      <li>Show genuine commitment to the UK and your business</li>
                      <li>Explain why the UK specifically, not just any country</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">For Endorser Evaluation Panels</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Prove innovation, viability, scalability, and UK economic benefit.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Clearly articulate what makes you genuinely innovative</li>
                      <li>Back viability claims with market research and customer validation</li>
                      <li>Show realistic path to significant job creation and growth</li>
                      <li>Demonstrate deep understanding of UK market dynamics</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">For Investor Presentations</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Emphasize market opportunity, traction, team strength, and ROI potential.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Lead with the problem and market size - make it compelling</li>
                      <li>Show concrete traction: revenue, customers, partnerships</li>
                      <li>Explain unit economics and path to profitability clearly</li>
                      <li>Demonstrate why your team can execute this specific vision</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Answer Structure Template</h4>
                    <div className="space-y-3 mt-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">1. Direct Answer (10-15 seconds)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Immediately address the question - give them the answer they are looking for
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">2. Supporting Evidence (60-90 seconds)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide 2-4 key points with specific data, examples, or proof
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">3. Reinforce & Connect (15-30 seconds)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Circle back to your main point and connect to broader business success
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Practice Best Practices</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Say answers out loud - reading silently is not practice</li>
                      <li>Record yourself and review objectively</li>
                      <li>Time yourself - aim for 2-3 minute answers</li>
                      <li>Practice in front of a mirror or with a friend</li>
                      <li>Simulate pressure - practice when tired or distracted</li>
                      <li>Prepare for follow-up questions on every topic</li>
                    </ul>
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
