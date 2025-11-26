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
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Plus, Trash2 } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type QuestionCategory = 'business-model' | 'innovation' | 'team' | 'financials' | 'market' | 'compliance' | 'endorser-dd';
type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

type FAQItem = {
  id: string;
  category: QuestionCategory;
  question: string;
  recommendedAnswer: string;
  yourAnswer: string;
  difficulty: DifficultyLevel;
  preparednessScore: number;
  isComplete: boolean;
  tags: string[];
};

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  'business-model': 'Business Model',
  'innovation': 'Innovation & IP',
  'team': 'Team & Leadership',
  'financials': 'Financial Planning',
  'market': 'Market Strategy',
  'compliance': 'Compliance & Legal',
  'endorser-dd': 'Endorser Due Diligence',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  'basic': 'Basic',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
};

const DEFAULT_FAQ_ITEMS: Omit<FAQItem, 'yourAnswer' | 'preparednessScore' | 'isComplete'>[] = [
  {
    id: 'faq-1',
    category: 'business-model',
    question: 'What is your primary revenue model and how will you generate income in the UK?',
    recommendedAnswer: 'Describe your revenue streams (SaaS subscriptions, licensing, services, etc.). Include pricing strategy, customer segments, and projected revenue timeline. For example: "We operate a B2B SaaS model with three pricing tiers (£99/£299/£999 per month). We target SMEs in healthcare with 50-500 employees. Based on market analysis, we project £250K ARR by Year 1 through direct sales and partnership channels."',
    difficulty: 'basic',
    tags: ['revenue', 'business model', 'pricing'],
  },
  {
    id: 'faq-2',
    category: 'business-model',
    question: 'What makes your business scalable and sustainable long-term?',
    recommendedAnswer: 'Explain scalability factors: low marginal costs, repeatable processes, technology leverage, network effects. Address sustainability: recurring revenue, customer retention strategy, competitive moats. Example: "Our cloud-based platform has near-zero marginal costs per additional user. We maintain 92% customer retention through continuous product innovation and dedicated support. Our proprietary AI algorithms create a technical moat that competitors cannot easily replicate."',
    difficulty: 'intermediate',
    tags: ['scalability', 'sustainability', 'competitive advantage'],
  },
  {
    id: 'faq-3',
    category: 'innovation',
    question: 'What is genuinely innovative about your product or service?',
    recommendedAnswer: 'Focus on technical innovation, novel approaches, or unique applications. Provide specific examples and differentiation. Example: "We have developed a patented machine learning algorithm that reduces data processing time by 85% compared to existing solutions. This breakthrough enables real-time analysis previously impossible in our industry. We hold 2 pending patents and have published research in peer-reviewed journals."',
    difficulty: 'basic',
    tags: ['innovation', 'technology', 'differentiation'],
  },
  {
    id: 'faq-4',
    category: 'innovation',
    question: 'How are you protecting your intellectual property?',
    recommendedAnswer: 'Detail IP protection strategy: patents, trademarks, copyrights, trade secrets, NDAs. Include current and planned IP filings. Example: "We have filed 3 patent applications (2 pending, 1 granted) covering our core algorithms. Our brand is protected by registered trademarks in UK and EU. Source code is protected under copyright and strict access controls. All employees and contractors sign comprehensive IP assignment and NDA agreements."',
    difficulty: 'advanced',
    tags: ['IP', 'patents', 'protection'],
  },
  {
    id: 'faq-5',
    category: 'team',
    question: 'Who are the key team members and what relevant experience do they bring?',
    recommendedAnswer: 'Highlight founder and executive backgrounds, domain expertise, previous successes, complementary skills. Example: "CEO: 15 years in healthtech, previously scaled startup to £10M ARR and successful exit. CTO: PhD in Computer Science, 10 years developing AI systems at Google. CFO: Former Big 4 accountant with 8 years in startup finance. Combined team has raised £50M+ previously and built products serving 1M+ users."',
    difficulty: 'basic',
    tags: ['team', 'founders', 'experience'],
  },
  {
    id: 'faq-6',
    category: 'team',
    question: 'What is your hiring plan and how will you build the team in the UK?',
    recommendedAnswer: 'Provide specific roles, timeline, locations, recruitment strategy. Show job creation commitment. Example: "Year 1: Hire 8 FTE (3 engineers, 2 sales, 1 marketing, 1 operations, 1 customer success) all UK-based. Year 2: Add 12 more (5 engineers, 4 sales, 3 support). We will recruit through UK tech networks, university partnerships, and specialist recruiters. Our London office will be the engineering and sales hub, creating 20+ high-skilled jobs by Year 2."',
    difficulty: 'intermediate',
    tags: ['hiring', 'team building', 'UK jobs'],
  },
  {
    id: 'faq-7',
    category: 'financials',
    question: 'How will you use your investment funds? Provide a detailed breakdown.',
    recommendedAnswer: 'Create itemized budget showing allocation across categories. Be specific and realistic. Example: "Product Development: £15K (2 developers, 3 months). Marketing: £10K (digital campaigns, content creation). Sales: £8K (CRM, sales tools, travel). Operations: £7K (office setup, legal, accounting). Working Capital: £10K (runway buffer). This funding enables us to reach first customer revenue within 4 months and positions us for Series A fundraising."',
    difficulty: 'basic',
    tags: ['funding', 'budget', 'allocation'],
  },
  {
    id: 'faq-8',
    category: 'financials',
    question: 'What are your financial projections for the next three years?',
    recommendedAnswer: 'Provide revenue, costs, profitability projections with key assumptions. Be conservative and data-backed. Example: "Year 1: £200K revenue, £350K costs, -£150K profit. Year 2: £800K revenue, £600K costs, £200K profit. Year 3: £2.5M revenue, £1.2M costs, £1.3M profit. Assumptions: 15% MoM growth, £5K ACV, 18-month sales cycle, 25% gross margin Year 1 improving to 70% by Year 3. Based on comparable SaaS benchmarks in our sector."',
    difficulty: 'advanced',
    tags: ['projections', 'revenue', 'profitability'],
  },
  {
    id: 'faq-9',
    category: 'market',
    question: 'Who is your target market and what is the market size?',
    recommendedAnswer: 'Define TAM, SAM, SOM with credible sources. Specify customer segments. Example: "Total Addressable Market: £15B (global healthcare SaaS). Serviceable Available Market: £3B (UK + EU enterprise healthcare). Serviceable Obtainable Market: £150M (UK SME clinics, 5,000 potential customers). Primary target: Private clinics with 10-100 staff, £1M-£20M revenue. Secondary: NHS trusts (longer sales cycle). Market growing 18% annually (Gartner 2024)."',
    difficulty: 'intermediate',
    tags: ['market size', 'TAM', 'target customer'],
  },
  {
    id: 'faq-10',
    category: 'market',
    question: 'Who are your main competitors and what is your competitive advantage?',
    recommendedAnswer: 'Name 3-5 competitors, analyze strengths/weaknesses, articulate clear differentiation. Example: "Main competitors: CompanyA (market leader, complex/expensive), CompanyB (feature-rich but poor UX), CompanyC (low-cost but basic). Our advantages: (1) 85% faster implementation, (2) 40% lower cost than CompanyA, (3) superior AI accuracy (92% vs industry 75%), (4) UK-focused compliance. We compete on ease-of-use and vertical specialization rather than breadth."',
    difficulty: 'intermediate',
    tags: ['competition', 'competitive advantage', 'differentiation'],
  },
  {
    id: 'faq-11',
    category: 'compliance',
    question: 'What regulatory requirements apply to your business and how do you ensure compliance?',
    recommendedAnswer: 'Identify relevant regulations, demonstrate understanding, show compliance measures. Example: "As a healthcare data platform, we comply with: UK GDPR, Data Protection Act 2018, NHS Data Security Standards, MHRA regulations (medical devices). Compliance measures: ISO 27001 certification (in progress), annual penetration testing, dedicated Data Protection Officer, comprehensive privacy policies, regular staff training, encrypted data storage, audit trails. Legal counsel on retainer for regulatory updates."',
    difficulty: 'advanced',
    tags: ['compliance', 'regulations', 'GDPR'],
  },
  {
    id: 'faq-12',
    category: 'compliance',
    question: 'Why have you chosen the UK for your business and what benefit will you bring?',
    recommendedAnswer: 'Show genuine UK connection and economic benefit. Be specific about UK advantages. Example: "UK selected for: (1) world-leading healthtech ecosystem and expertise, (2) access to NHS as innovation testbed, (3) favorable regulatory environment for our sector, (4) proximity to European markets. UK benefits: 20+ high-skilled jobs by Year 3, £2M+ in UK tax revenue over 5 years, partnerships with 3 UK universities for R&D, contribution to UK AI and healthtech leadership globally, knowledge transfer to local ecosystem."',
    difficulty: 'basic',
    tags: ['UK benefit', 'economic impact', 'job creation'],
  },
  {
    id: 'faq-13',
    category: 'endorser-dd',
    question: 'Can you provide evidence of customer validation or traction?',
    recommendedAnswer: 'Quantify traction with specific metrics and evidence. Example: "Customer validation: 5 paying customers (£45K ARR), 15 active pilots, 200+ trial signups. Letters of intent for £250K in annual contracts. Customer testimonials attached. Metrics: 4.8/5 satisfaction score, 90-day retention 88%, NPS score 67. Product adopted by 2 NHS trusts in pilot programs. Featured in TechCrunch and Health Tech Magazine. 2,500 waitlist signups."',
    difficulty: 'intermediate',
    tags: ['traction', 'customers', 'validation'],
  },
  {
    id: 'faq-14',
    category: 'endorser-dd',
    question: 'What are your key milestones for the next 12-24 months?',
    recommendedAnswer: 'Provide time-bound, measurable milestones. Be realistic. Example: "Q1 2025: Launch MVP to 50 beta users, achieve £10K MRR. Q2: Secure 5 enterprise customers, raise £500K seed round. Q3: Reach £50K MRR, hire 5 team members, achieve break-even. Q4: Expand to 200 customers, £100K MRR, open London office. 2026: Scale to £500K MRR, 500 customers, 20 employees, expand to EU markets, Series A fundraising."',
    difficulty: 'basic',
    tags: ['milestones', 'roadmap', 'goals'],
  },
  {
    id: 'faq-15',
    category: 'endorser-dd',
    question: 'How do you plan to fund ongoing operations beyond your initial investment?',
    recommendedAnswer: 'Show clear fundraising strategy and path to sustainability. Example: "Funding roadmap: (1) £50K investment funds initial 6 months, (2) Revenue from early customers extends runway to 12 months, (3) Raise £500K seed round at Month 9 from UK VCs and angels, (4) Achieve profitability Month 18 from revenue growth, (5) Series A (£3M-£5M) at Month 24 for scale. Alternative: Profitable growth from Month 12 if seed fundraising delayed. Strong UK investor pipeline already engaged (3 VCs in discussions)."',
    difficulty: 'advanced',
    tags: ['fundraising', 'sustainability', 'runway'],
  },
  {
    id: 'faq-16',
    category: 'endorser-dd',
    question: 'What are the main risks to your business and how will you mitigate them?',
    recommendedAnswer: 'Identify 4-6 realistic risks with specific mitigation strategies. Example: "Risk 1: Slow enterprise sales - Mitigation: Start with SME segment, pilot programs, freemium model. Risk 2: Regulatory changes - Mitigation: Legal counsel on retainer, compliance automation, flexible architecture. Risk 3: Competition from incumbents - Mitigation: Vertical focus, superior UX, aggressive IP protection. Risk 4: Key person dependency - Mitigation: Document processes, hire senior team, succession planning. Risk 5: Technology scalability - Mitigation: Cloud infrastructure, load testing, experienced CTO."',
    difficulty: 'advanced',
    tags: ['risks', 'mitigation', 'challenges'],
  },
  {
    id: 'faq-17',
    category: 'endorser-dd',
    question: 'How will you measure success and demonstrate progress to stakeholders?',
    recommendedAnswer: 'Define clear KPIs and reporting cadence. Example: "Key metrics tracked monthly: (1) Revenue & MRR growth, (2) Customer acquisition (new logos, pipeline value), (3) Customer retention & churn, (4) Product engagement (DAU/MAU, feature adoption), (5) Team growth & hiring, (6) Cash runway & burn rate, (7) Product development velocity. Quarterly reporting to endorsing body and investors includes: Financial statements, customer case studies, product updates, hiring progress, regulatory compliance status. Annual impact report on UK economic contribution."',
    difficulty: 'intermediate',
    tags: ['KPIs', 'metrics', 'reporting'],
  },
  {
    id: 'faq-18',
    category: 'endorser-dd',
    question: 'What is your exit strategy or long-term vision for the company?',
    recommendedAnswer: 'Show ambition balanced with realistic options. Example: "Primary vision: Build a £100M+ ARR category-defining company over 7-10 years, serving 10,000+ customers globally, employing 200+ in UK. Exit options considered: (1) Strategic acquisition by healthcare/tech major (3-5 year horizon), (2) IPO on London Stock Exchange (7-10 years), (3) Private equity buyout, (4) Remain independent and profitable. Benchmark exits: CompanyX acquired for £200M at 8x revenue, CompanyY IPO at £500M valuation. Regardless of exit, committed to maintaining UK headquarters and jobs."',
    difficulty: 'advanced',
    tags: ['exit strategy', 'vision', 'long-term'],
  },
];

export default function FAQGenerator() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>(
    DEFAULT_FAQ_ITEMS.map(item => ({
      ...item,
      yourAnswer: '',
      preparednessScore: 0,
      isComplete: false,
    }))
  );
  const [customFAQs, setCustomFAQs] = useState<FAQItem[]>([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [savedDate, setSavedDate] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');

  const updateFAQItem = (id: string, field: keyof FAQItem, value: any) => {
    const updateItem = (item: FAQItem) => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      if (field === 'yourAnswer') {
        const answerLength = (value as string).length;
        const recommendedLength = item.recommendedAnswer.length;
        const lengthScore = Math.min(100, (answerLength / recommendedLength) * 100);
        const hasKeyPoints = value.toLowerCase().includes('example') || value.toLowerCase().includes('£') || /\d/.test(value);
        const keyPointsScore = hasKeyPoints ? 20 : 0;
        
        updated.preparednessScore = Math.min(100, Math.round(lengthScore * 0.8 + keyPointsScore));
        updated.isComplete = updated.preparednessScore >= 70;
      }
      
      return updated;
    };

    setFaqItems(faqItems.map(updateItem));
    setCustomFAQs(customFAQs.map(updateItem));
  };

  const addCustomFAQ = () => {
    const newFAQ: FAQItem = {
      id: `custom-${Date.now()}`,
      category: 'business-model',
      question: '',
      recommendedAnswer: 'Provide a comprehensive answer with specific examples, data, and evidence.',
      yourAnswer: '',
      difficulty: 'intermediate',
      preparednessScore: 0,
      isComplete: false,
      tags: ['custom'],
    };
    setCustomFAQs([...customFAQs, newFAQ]);
  };

  const removeCustomFAQ = (id: string) => {
    setCustomFAQs(customFAQs.filter(faq => faq.id !== id));
  };

  const allFAQs = [...faqItems, ...customFAQs];

  const completedCount = allFAQs.filter(f => f.isComplete).length;
  const totalCount = allFAQs.length;
  const answeredCount = allFAQs.filter(f => f.yourAnswer.length > 50).length;
  const avgPreparedness = Math.round(
    allFAQs.reduce((sum, f) => sum + f.preparednessScore, 0) / totalCount
  );

  const completenessScore = Math.round(
    (completedCount / totalCount) * 40 +
    (answeredCount / totalCount) * 40 +
    (avgPreparedness / 100) * 20
  );

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; completed: number; score: number }> = {};
    
    Object.keys(CATEGORY_LABELS).forEach(cat => {
      const categoryFAQs = allFAQs.filter(f => f.category === cat);
      stats[cat] = {
        total: categoryFAQs.length,
        completed: categoryFAQs.filter(f => f.isComplete).length,
        score: categoryFAQs.length > 0 
          ? Math.round(categoryFAQs.reduce((sum, f) => sum + f.preparednessScore, 0) / categoryFAQs.length)
          : 0,
      };
    });
    
    return stats;
  };

  const categoryStats = getCategoryStats();

  const categoryPieData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label,
    value: categoryStats[key]?.total || 0,
    completed: categoryStats[key]?.completed || 0,
    color: getCategoryColor(key as QuestionCategory),
  })).filter(item => item.value > 0);

  const difficultyBarData = [
    {
      difficulty: 'Basic',
      total: allFAQs.filter(f => f.difficulty === 'basic').length,
      completed: allFAQs.filter(f => f.difficulty === 'basic' && f.isComplete).length,
    },
    {
      difficulty: 'Intermediate',
      total: allFAQs.filter(f => f.difficulty === 'intermediate').length,
      completed: allFAQs.filter(f => f.difficulty === 'intermediate' && f.isComplete).length,
    },
    {
      difficulty: 'Advanced',
      total: allFAQs.filter(f => f.difficulty === 'advanced').length,
      completed: allFAQs.filter(f => f.difficulty === 'advanced' && f.isComplete).length,
    },
  ];

  function getCategoryColor(category: QuestionCategory): string {
    const colors: Record<QuestionCategory, string> = {
      'business-model': '#3b82f6',
      'innovation': '#8b5cf6',
      'team': '#10b981',
      'financials': '#f59e0b',
      'market': '#ec4899',
      'compliance': '#6366f1',
      'endorser-dd': '#14b8a6',
    };
    return colors[category];
  }

  const getReadinessLevel = () => {
    if (completenessScore >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950' };
    if (completenessScore >= 75) return { label: 'Strong', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' };
    if (completenessScore >= 60) return { label: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    if (completenessScore >= 40) return { label: 'Developing', color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' };
    return { label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950' };
  };

  const readinessLevel = getReadinessLevel();

  const getSerializedState = () => {
    return {
      faqItems,
      customFAQs,
      activeTab,
      selectedCategory,
      selectedDifficulty,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('faqItems' in state) setFaqItems(state.faqItems);
    if ('customFAQs' in state) setCustomFAQs(state.customFAQs);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('selectedCategory' in state) setSelectedCategory(state.selectedCategory);
    if ('selectedDifficulty' in state) setSelectedDifficulty(state.selectedDifficulty);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'faq-generator_handoff';
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
      const saved = localStorage.getItem('faq-generator-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('faq-generator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('faq-generator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (completenessScore < 40) {
      tips.push("Start with basic questions in Business Model and Financial categories - these are asked in nearly every endorser interview");
    }

    if (answeredCount < totalCount * 0.5) {
      tips.push("Aim to prepare answers for at least 80% of questions - endorsers may ask any of these during due diligence");
    }

    const weakestCategory = Object.entries(categoryStats).reduce((min, [cat, stats]) => 
      stats.score < (min.score || 100) ? { cat, score: stats.score } : min, 
      {} as { cat: string; score: number }
    );
    
    if (weakestCategory.score < 60) {
      tips.push(`Strengthen your ${CATEGORY_LABELS[weakestCategory.cat as QuestionCategory]} answers - this category needs more development`);
    }

    if (allFAQs.some(f => f.yourAnswer.length > 0 && f.yourAnswer.length < 200)) {
      tips.push("Provide comprehensive answers with specific examples and data - aim for 300-500 words per answer with quantifiable evidence");
    }

    if (allFAQs.filter(f => f.difficulty === 'advanced' && f.isComplete).length < 3) {
      tips.push("Prepare for advanced questions - endorsers will probe deeply on financials, IP strategy, and competitive positioning");
    }

    if (completedCount < totalCount * 0.7) {
      tips.push("Practice delivering answers verbally and refine them - written preparation must translate to confident verbal responses");
    }

    if (allFAQs.some(f => f.yourAnswer.length > 0 && !(/£\d/.test(f.yourAnswer) || /\d+%/.test(f.yourAnswer)))) {
      tips.push("Include specific numbers, metrics, and financial figures in answers - quantitative evidence significantly strengthens credibility");
    }

    tips.push("Prepare physical evidence folders organized by question category to reference during investor/endorser meetings");
    tips.push("Create a one-page FAQ summary document highlighting your strongest answers for quick reference");
    tips.push("Research your specific endorsing body's recent approval decisions and tailor answers to their known priorities");

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete all Basic difficulty questions with comprehensive, evidence-backed answers", priority: "Critical" },
      { week: "Week 1", action: "Research your endorsing body's published guidance, FAQs, and recent approval/rejection patterns", priority: "High" },
      { week: "Week 1-2", action: "Draft answers to all Intermediate questions, including specific metrics and examples", priority: "Critical" },
      { week: "Week 2", action: "Gather supporting evidence documents for every claim made in your FAQ answers", priority: "Critical" },
      { week: "Week 2", action: "Complete Advanced questions on financials, IP strategy, and risk mitigation", priority: "High" },
      { week: "Week 2-3", action: "Practice verbal delivery of all answers - record and refine for clarity and confidence", priority: "High" },
      { week: "Week 3", action: "Have advisor, mentor, or immigration lawyer review and critique all answers", priority: "Critical" },
      { week: "Week 3", action: "Create organized evidence folder with documents indexed to specific questions", priority: "Medium" },
      { week: "Week 3-4", action: "Conduct mock Q&A sessions simulating endorser/investor due diligence meetings", priority: "High" },
      { week: "Week 4", action: "Finalize one-page FAQ summary and prepare printed materials for meetings", priority: "Medium" },
      { week: "Week 4", action: "Review and update all answers based on any recent business developments", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - FAQ DOCUMENT & PREPAREDNESS REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Questions Prepared: ${totalCount}
Questions Completed: ${completedCount} (${Math.round((completedCount/totalCount)*100)}%)
Questions Answered: ${answeredCount} (${Math.round((answeredCount/totalCount)*100)}%)
Overall Completeness Score: ${completenessScore}%
Readiness Level: ${readinessLevel.label}
Average Preparedness: ${avgPreparedness}%

CATEGORY BREAKDOWN
${'-'.repeat(80)}
${Object.entries(CATEGORY_LABELS).map(([key, label]) => {
  const stats = categoryStats[key];
  return `${label}: ${stats.completed}/${stats.total} complete (${stats.score}% preparedness)`;
}).join('\n')}

DIFFICULTY ANALYSIS
${'-'.repeat(80)}
${difficultyBarData.map(d => `${d.difficulty}: ${d.completed}/${d.total} complete`).join('\n')}

${'='.repeat(80)}
FREQUENTLY ASKED QUESTIONS & ANSWERS
${'='.repeat(80)}

${allFAQs.map((faq, index) => `
${'-'.repeat(80)}
QUESTION ${index + 1} [${CATEGORY_LABELS[faq.category]}] [${DIFFICULTY_LABELS[faq.difficulty]}]
${'-'.repeat(80)}
${faq.question}

RECOMMENDED ANSWER GUIDANCE:
${faq.recommendedAnswer}

YOUR PREPARED ANSWER:
${faq.yourAnswer || '[NOT YET ANSWERED - REQUIRES COMPLETION]'}

Preparedness Score: ${faq.preparednessScore}%
Status: ${faq.isComplete ? 'COMPLETE' : 'INCOMPLETE'}
Tags: ${faq.tags.join(', ')}

`).join('\n')}

${'='.repeat(80)}
SMART TIPS & RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

${'='.repeat(80)}
4-WEEK FAQ PREPARATION ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

${'='.repeat(80)}
ENDORSER DUE DILIGENCE PREPARATION CHECKLIST
${'-'.repeat(80)}

Business Model Evidence:
- Revenue model documentation with pricing strategy
- Customer contracts or letters of intent
- Financial projections spreadsheet with assumptions
- Competitive analysis document
- Market research and sizing data

Innovation & IP Evidence:
- Patent applications or granted patents
- Technical documentation of innovation
- Trademark registrations
- Publications, awards, or industry recognition
- Customer testimonials on innovation value

Team Evidence:
- Founder and executive CVs/bios
- LinkedIn profiles demonstrating expertise
- Reference letters from previous employers/investors
- Advisory board letters of support
- Hiring plan document

Financial Evidence:
- Bank statements showing £50K+ investment funds
- Source of funds documentation
- Financial projections (3-year P&L, cash flow, balance sheet)
- Budget breakdown for fund usage
- Letters from accountant/financial advisor

Market & Growth Evidence:
- Customer pipeline and sales forecast
- Partnership agreements or MOUs
- Go-to-market strategy document
- UK market entry plan
- Traction metrics (users, revenue, growth rate)

Compliance Evidence:
- Company registration documents
- Regulatory compliance plan
- Data protection and privacy policies
- Insurance policies
- Legal structure documentation

UK Benefit Evidence:
- Detailed hiring plan with UK job creation timeline
- Office location and investment in UK infrastructure
- UK partnerships (universities, accelerators, corporates)
- Projected UK tax contribution
- UK economic impact statement

BEST PRACTICES FOR FAQ DELIVERY
${'-'.repeat(80)}
1. Structure answers using framework: Context → Specifics → Evidence → Impact
2. Lead with quantifiable metrics in first sentence when possible
3. Reference physical evidence documents during verbal delivery
4. Maintain confident, enthusiastic tone while being realistic
5. Prepare 2-3 concrete examples for each major claim
6. Practice timing: 90-120 seconds per answer verbally
7. Prepare follow-up responses to likely probing questions
8. Show deep market knowledge and competitive awareness
9. Demonstrate execution capability, not just ideas
10. Emphasize UK-specific benefits and commitment

COMMON ENDORSER CONCERNS TO ADDRESS
${'-'.repeat(80)}
- Proof of genuine innovation (not incremental improvement)
- Evidence of market validation and customer demand
- Credibility of financial projections and assumptions
- Team capability to execute the business plan
- Scalability and long-term sustainability
- Sufficient funding and clear path to profitability
- Meaningful UK economic benefit and job creation
- Regulatory compliance and risk management
- Intellectual property protection strategy
- Competitive differentiation and market positioning

FINAL RECOMMENDATIONS
${'-'.repeat(80)}
- Treat FAQ preparation as seriously as your business plan - it is equally critical
- Have all evidence physically organized and indexed for quick reference
- Practice verbal delivery until answers flow naturally without notes
- Research your endorsing body's decision-making criteria thoroughly
- Prepare for worst-case scenarios: challenging questions on weak points
- Show genuine passion for your business and UK opportunity
- Be honest about challenges while demonstrating mitigation strategies
- Remember: endorsers want to approve you if you meet the criteria
- Consider mock interviews with immigration lawyers or advisors
- Update FAQs regularly as your business evolves and new evidence emerges

${'='.repeat(80)}
Document generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

This FAQ document should be reviewed and updated regularly. Ensure all information
is current and accurate before any investor or endorser meetings. Supplement with
physical evidence folders organized by category.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faq-generator-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredFAQs = allFAQs.filter(faq => {
    const categoryMatch = selectedCategory === 'all' || faq.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || faq.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-faq-generator">
              Visa Application FAQ Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Prepare comprehensive answers for investor and endorser due diligence questions
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">
                Last saved: {savedDate}
              </p>
            )}
          </div>

          <ToolUtilityBar
            toolId="faq-generator"
            toolName="FAQ Generator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
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
                  4-Week FAQ Preparation Action Plan
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
                  <p className={`text-sm mt-2 font-semibold ${readinessLevel.color}`} data-testid="text-readiness-level">
                    {readinessLevel.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Questions Completed</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-completed-count">
                    {completedCount}/{totalCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round((completedCount/totalCount)*100)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Questions Answered</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="text-answered-count">
                    {answeredCount}/{totalCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round((answeredCount/totalCount)*100)}% answered
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Avg Preparedness</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="text-avg-preparedness">{avgPreparedness}%</p>
                  <Progress value={avgPreparedness} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-faq-generator">
              <TabsTrigger value="generator" data-testid="tab-generator">Generator</TabsTrigger>
              <TabsTrigger value="custom" data-testid="tab-custom">Custom FAQs</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="guidance" data-testid="tab-guidance">Guidance</TabsTrigger>
              <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>FAQ Question Bank</CardTitle>
                  <CardDescription>
                    Prepare comprehensive answers for common investor and endorser questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category-filter">Category:</Label>
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory | 'all')}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-category-filter"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="difficulty-filter">Difficulty:</Label>
                      <select
                        id="difficulty-filter"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        data-testid="select-difficulty-filter"
                      >
                        <option value="all">All Levels</option>
                        <option value="basic">Basic</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="ml-auto text-sm text-muted-foreground">
                      Showing {filteredFAQs.length} of {totalCount} questions
                    </div>
                  </div>

                  {filteredFAQs.length === 0 ? (
                    <Alert>
                      <HelpCircle className="h-4 w-4" />
                      <AlertDescription>
                        No questions match the selected filters. Try adjusting your category or difficulty selection.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6">
                      {filteredFAQs.map((faq, index) => (
                        <Card key={faq.id} className={faq.isComplete ? 'border-green-500' : ''}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                                    {CATEGORY_LABELS[faq.category]}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                    faq.difficulty === 'basic' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                    faq.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {DIFFICULTY_LABELS[faq.difficulty]}
                                  </span>
                                  {faq.isComplete && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" data-testid={`icon-complete-${index}`} />
                                  )}
                                </div>
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                              </div>
                              <div className="text-center min-w-[80px]">
                                <p className="text-2xl font-bold text-primary" data-testid={`text-score-${index}`}>
                                  {faq.preparednessScore}%
                                </p>
                                <p className="text-xs text-muted-foreground">preparedness</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-sm font-semibold mb-2 block">
                                Recommended Answer Guidance:
                              </Label>
                              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                {faq.recommendedAnswer}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor={`answer-${faq.id}`} className="text-sm font-semibold mb-2 block">
                                Your Prepared Answer:
                              </Label>
                              <Textarea
                                id={`answer-${faq.id}`}
                                value={faq.yourAnswer}
                                onChange={(e) => updateFAQItem(faq.id, 'yourAnswer', e.target.value)}
                                placeholder="Write your comprehensive answer here with specific examples, metrics, and evidence..."
                                className="min-h-[150px]"
                                data-testid={`textarea-answer-${index}`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {faq.yourAnswer.length} characters | Target: 300-500 words
                              </p>
                            </div>

                            {faq.yourAnswer.length > 0 && faq.preparednessScore < 70 && (
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  Answer needs more detail. Include specific examples, metrics, and quantifiable evidence.
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom FAQ Questions</CardTitle>
                      <CardDescription>
                        Add questions specific to your business or endorsing body requirements
                      </CardDescription>
                    </div>
                    <Button onClick={addCustomFAQ} data-testid="button-add-custom-faq">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom FAQ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {customFAQs.length === 0 ? (
                    <Alert>
                      <HelpCircle className="h-4 w-4" />
                      <AlertDescription>
                        No custom FAQs yet. Click "Add Custom FAQ" to create questions specific to your situation.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    customFAQs.map((faq, index) => (
                      <Card key={faq.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`custom-category-${index}`}>Category</Label>
                                <select
                                  id={`custom-category-${index}`}
                                  value={faq.category}
                                  onChange={(e) => updateFAQItem(faq.id, 'category', e.target.value)}
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  data-testid={`select-custom-category-${index}`}
                                >
                                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label htmlFor={`custom-difficulty-${index}`}>Difficulty</Label>
                                <select
                                  id={`custom-difficulty-${index}`}
                                  value={faq.difficulty}
                                  onChange={(e) => updateFAQItem(faq.id, 'difficulty', e.target.value)}
                                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                  data-testid={`select-custom-difficulty-${index}`}
                                >
                                  <option value="basic">Basic</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomFAQ(faq.id)}
                              data-testid={`button-remove-custom-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <Label htmlFor={`custom-question-${index}`}>Question</Label>
                            <Input
                              id={`custom-question-${index}`}
                              value={faq.question}
                              onChange={(e) => updateFAQItem(faq.id, 'question', e.target.value)}
                              placeholder="Enter your custom question..."
                              data-testid={`input-custom-question-${index}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`custom-answer-${index}`}>Your Answer</Label>
                            <Textarea
                              id={`custom-answer-${index}`}
                              value={faq.yourAnswer}
                              onChange={(e) => updateFAQItem(faq.id, 'yourAnswer', e.target.value)}
                              placeholder="Write your answer..."
                              className="min-h-[120px]"
                              data-testid={`textarea-custom-answer-${index}`}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Preparedness: {faq.preparednessScore}%
                            </p>
                            {faq.isComplete && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Complete</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Coverage</CardTitle>
                    <CardDescription>Question distribution across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {categoryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
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
                    <CardDescription>Completion by question difficulty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={difficultyBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="difficulty" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#94a3b8" name="Total Questions" />
                        <Bar dataKey="completed" fill="#10b981" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category-wise Preparedness</CardTitle>
                  <CardDescription>Detailed breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                      const stats = categoryStats[key];
                      const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                      
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{label}</span>
                            <span className="text-sm text-muted-foreground">
                              {stats.completed}/{stats.total} complete ({percentage}%) | {stats.score}% preparedness
                            </span>
                          </div>
                          <Progress value={stats.score} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guidance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Answer Quality Guidelines</CardTitle>
                  <CardDescription>Best practices for crafting compelling FAQ answers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Be Specific and Quantifiable</p>
                        <p className="text-sm text-muted-foreground">
                          Use concrete numbers, percentages, and metrics. Replace vague statements with precise data points.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Provide Evidence and Examples</p>
                        <p className="text-sm text-muted-foreground">
                          Support every claim with customer testimonials, case studies, research data, or documented results.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Structure for Clarity</p>
                        <p className="text-sm text-muted-foreground">
                          Use Context then Specifics then Evidence then Impact framework. Lead with most important information.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Address UK Context</p>
                        <p className="text-sm text-muted-foreground">
                          Emphasize UK-specific benefits, partnerships, market opportunities, and economic contribution.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Balance Optimism with Realism</p>
                        <p className="text-sm text-muted-foreground">
                          Show ambition and confidence while acknowledging challenges and mitigation strategies.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Length and Depth</p>
                        <p className="text-sm text-muted-foreground">
                          Aim for 300-500 words per answer. Provide enough detail to be comprehensive without being verbose.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Mistakes to Avoid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Vague or Generic Answers</p>
                        <p className="text-sm text-muted-foreground">
                          Avoid: "We will grow significantly." Instead: "We project 15% MoM growth reaching £800K ARR by Year 2."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Unsupported Claims</p>
                        <p className="text-sm text-muted-foreground">
                          Never make assertions without backing evidence, market data, or customer validation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Overly Optimistic Projections</p>
                        <p className="text-sm text-muted-foreground">
                          Unrealistic financial forecasts undermine credibility. Use conservative, data-backed assumptions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Ignoring Challenges</p>
                        <p className="text-sm text-muted-foreground">
                          Address risks and challenges directly with clear mitigation strategies rather than avoiding them.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Weak Competitive Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          "No competition" is a red flag. Show deep market understanding with specific competitor analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Documentation Checklist</CardTitle>
                  <CardDescription>Organize supporting materials for your FAQ answers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Business Model Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-1" />
                          <span className="text-sm">Revenue model documentation with pricing strategy</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-2" />
                          <span className="text-sm">Customer contracts or letters of intent</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-3" />
                          <span className="text-sm">Financial projections spreadsheet with assumptions</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-4" />
                          <span className="text-sm">Competitive analysis document</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-5" />
                          <span className="text-sm">Market research and sizing data</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Innovation & IP Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-6" />
                          <span className="text-sm">Patent applications or granted patents</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-7" />
                          <span className="text-sm">Technical documentation of innovation</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-8" />
                          <span className="text-sm">Trademark registrations</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-9" />
                          <span className="text-sm">Publications, awards, or industry recognition</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-10" />
                          <span className="text-sm">Customer testimonials on innovation value</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Team Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-11" />
                          <span className="text-sm">Founder and executive CVs with key achievements</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-12" />
                          <span className="text-sm">LinkedIn profiles demonstrating expertise</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-13" />
                          <span className="text-sm">Reference letters from previous employers/investors</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-14" />
                          <span className="text-sm">Advisory board letters of support</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-15" />
                          <span className="text-sm">Detailed UK hiring plan document</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Financial Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-16" />
                          <span className="text-sm">Bank statements showing £50K+ investment funds</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-17" />
                          <span className="text-sm">Source of funds documentation</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-18" />
                          <span className="text-sm">3-year financial projections (P&L, cash flow, balance sheet)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-19" />
                          <span className="text-sm">Detailed budget breakdown for fund usage</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-20" />
                          <span className="text-sm">Letters from accountant/financial advisor</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Market & Traction Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-21" />
                          <span className="text-sm">Customer pipeline and sales forecast</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-22" />
                          <span className="text-sm">Partnership agreements or MOUs</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-23" />
                          <span className="text-sm">Go-to-market strategy document</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-24" />
                          <span className="text-sm">UK market entry plan</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-25" />
                          <span className="text-sm">Traction metrics (users, revenue, growth rates)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-primary">Compliance Evidence</h3>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-26" />
                          <span className="text-sm">Company registration documents</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-27" />
                          <span className="text-sm">Regulatory compliance plan and certifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-28" />
                          <span className="text-sm">Data protection and privacy policies</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-29" />
                          <span className="text-sm">Insurance policies (liability, professional indemnity)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" data-testid="checkbox-evidence-30" />
                          <span className="text-sm">Legal structure and governance documentation</span>
                        </label>
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
