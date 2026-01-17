import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { ToolAccessGuard } from "@/components/ToolAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, AlertTriangle, TrendingUp, Calendar, Save, FileText, 
  Target, Users, DollarSign, Shield, Lightbulb, BarChart3, PieChart,
  ArrowRight, Clock, Building, Briefcase, GraduationCap, Scale,
  Plus, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useWordExport } from "@/hooks/useWordExport";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, createBreadcrumbSchema, createArticleSchema } from "@/lib/seo-schemas";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'business-plan',
  toolName: 'Business Plan Generator',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Specialist. I'll help you create a PhD-level business plan following the Innovator International template for your UK Innovator Founder Visa application. Let's build something that demonstrates genuine innovation and scalability. Ready to begin?",
  questions: [
    {
      id: 'business-name',
      question: "What is the name of your business? This will be the title of your business plan.",
      hint: "Use your registered or intended company name",
      fieldKey: 'business-name',
      minLength: 3
    },
    {
      id: 'business-concept',
      question: "Describe your business concept in 2-3 sentences. What does your company do?",
      hint: "Focus on what makes your business unique and the problem it solves",
      fieldKey: 'business-concept',
      minLength: 100
    },
    {
      id: 'problem-statement',
      question: "What specific problem does your business solve? Why is this problem important?",
      hint: "Be specific about the pain points your target customers experience",
      fieldKey: 'problem-statement',
      minLength: 100
    },
    {
      id: 'solution-description',
      question: "How does your product or service solve this problem? What's your unique approach?",
      hint: "Highlight what makes your solution innovative and different from existing alternatives",
      fieldKey: 'solution-description',
      minLength: 100
    },
    {
      id: 'target-market',
      question: "Who is your target market? Define your ideal customer segments.",
      hint: "Include demographics, industry, company size, or other relevant characteristics",
      fieldKey: 'target-market',
      minLength: 80
    },
    {
      id: 'revenue-streams',
      question: "How will your business generate revenue? Describe your pricing model.",
      hint: "Include subscription models, one-time fees, licensing, or other revenue sources",
      fieldKey: 'revenue-streams',
      minLength: 80
    },
    {
      id: 'scalability',
      question: "How will your business scale in the UK market? What's your growth strategy?",
      hint: "Endorsers want to see clear plans for job creation and expansion",
      fieldKey: 'scalability',
      minLength: 100
    },
    {
      id: 'founder-background',
      question: "What relevant experience do you bring as a founder? Why are you the right person to execute this business?",
      hint: "Highlight skills, past successes, and industry expertise that qualify you",
      fieldKey: 'founder-background',
      minLength: 100
    }
  ]
};

type BusinessPlanSection = {
  id: string;
  title: string;
  description: string;
  icon: any;
  fields: {
    id: string;
    label: string;
    value: string;
    placeholder: string;
    type: 'text' | 'textarea';
    minChars: number;
  }[];
};

type GanttTask = {
  id: string;
  task: string;
  startMonth: number;
  duration: number;
  category: 'setup' | 'development' | 'marketing' | 'sales' | 'operations' | 'hiring';
  status: 'planned' | 'in-progress' | 'completed';
};

type FinancialMonth = {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  cumulative: number;
};

type RiskItem = {
  id: string;
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
  status: 'active' | 'mitigated' | 'accepted';
};

type CompetitorData = {
  id: string;
  name: string;
  marketShare: number;
  pricing: string;
  strengths: string;
  weaknesses: string;
  yourAdvantage: string;
};

const CATEGORY_COLORS = {
  setup: '#10B981',
  development: '#3B82F6',
  marketing: '#F59E0B',
  sales: '#8B5CF6',
  operations: '#EC4899',
  hiring: '#6366F1',
};

const RISK_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#7C2D12',
};

export default function BusinessPlan() {
  const { toast } = useToast();
  const { generatePdf } = usePdfExport();
  const { generateWord } = useWordExport();
  const { userTier } = useTierAccess();
  
  const isPaidUser = userTier !== 'free';
  const [showAutoSaveNotification, setShowAutoSaveNotification] = useState(false);
  const lastSaveRef = useRef<string>('');

  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('business-plan-mode');
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('business-plan-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('business-plan-mode', mode);
  }, [mode]);

  const [sections, setSections] = useState<BusinessPlanSection[]>([
    {
      id: 'executive-summary',
      title: '1. Executive Summary',
      description: 'A compelling overview of your entire business plan - the first impression for endorsers',
      icon: FileText,
      fields: [
        { id: 'business-name', label: 'Business Name', value: '', placeholder: 'Enter your registered or intended company name', type: 'text', minChars: 3 },
        { id: 'business-concept', label: 'Business Concept', value: '', placeholder: 'Describe your business in 2-3 compelling sentences that capture what you do', type: 'textarea', minChars: 100 },
        { id: 'mission-statement', label: 'Mission Statement', value: '', placeholder: 'Your core purpose: Why does your business exist? What impact will it have?', type: 'textarea', minChars: 50 },
        { id: 'key-objectives', label: 'Key Objectives (12-36 months)', value: '', placeholder: 'List 3-5 measurable objectives with specific targets and timeframes', type: 'textarea', minChars: 100 },
        { id: 'investment-required', label: 'Investment Required', value: '', placeholder: 'Total capital needed and how it will be deployed', type: 'textarea', minChars: 50 },
      ]
    },
    {
      id: 'introduction',
      title: '2. Introduction (Problem & Solution)',
      description: 'The customer pain point and your innovative solution - the heart of your value proposition',
      icon: Lightbulb,
      fields: [
        { id: 'problem-statement', label: 'Customer Pain Point', value: '', placeholder: 'What specific problem are you solving? Why is this problem significant and urgent?', type: 'textarea', minChars: 150 },
        { id: 'solution-description', label: 'Your Solution', value: '', placeholder: 'How does your product/service solve this problem? Be specific about features and benefits', type: 'textarea', minChars: 150 },
        { id: 'unique-value', label: 'Unique Value Proposition', value: '', placeholder: 'What makes your solution unique? Why is it better than existing alternatives?', type: 'textarea', minChars: 100 },
        { id: 'world-after', label: 'Customer Transformation', value: '', placeholder: 'What will the world be like for consumers once you\'ve solved their problem?', type: 'textarea', minChars: 100 },
        { id: 'major-challenges', label: 'Major Challenges', value: '', placeholder: 'What are the biggest challenges in creating your solution and how will you overcome them?', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'market-assessment',
      title: '3. Market Assessment',
      description: 'Understanding your market opportunity, clients, and competitive landscape',
      icon: BarChart3,
      fields: [
        { id: 'current-solutions', label: 'Current Market Solutions', value: '', placeholder: 'What solutions currently exist? How do competitors address the problem?', type: 'textarea', minChars: 100 },
        { id: 'market-size', label: 'Market Size (TAM/SAM/SOM)', value: '', placeholder: 'Total Addressable Market, Serviceable Market, and your realistic target with sources', type: 'textarea', minChars: 150 },
        { id: 'market-trends', label: 'Market Trends', value: '', placeholder: 'Key industry trends and how they support your business opportunity', type: 'textarea', minChars: 100 },
        { id: 'customer-engagement', label: 'Customer Engagement', value: '', placeholder: 'Who have you spoken to? What feedback have you received? Would they pay?', type: 'textarea', minChars: 100 },
        { id: 'geographic-focus', label: 'UK Market Opportunity', value: '', placeholder: 'Why is the UK specifically the right market? Regional nuances and opportunities', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'marketing-strategy',
      title: '4. Marketing Strategy',
      description: 'How you will reach and engage your target customers - achieving the Zero Moment of Truth',
      icon: Target,
      fields: [
        { id: 'customer-location', label: 'Where to Find Customers', value: '', placeholder: 'Where do your target customers "hang out"? Online platforms, events, publications?', type: 'textarea', minChars: 100 },
        { id: 'awareness-strategy', label: 'Awareness Strategy', value: '', placeholder: 'How will you make prospects aware of your solution? Content, PR, partnerships?', type: 'textarea', minChars: 100 },
        { id: 'differentiation', label: 'Differentiation Tactics', value: '', placeholder: 'Specific actions to stand out from competitors in your marketing', type: 'textarea', minChars: 80 },
        { id: 'brand-positioning', label: 'Brand Positioning', value: '', placeholder: 'How do you want to be perceived in the market? Key messages and values', type: 'textarea', minChars: 80 },
        { id: 'marketing-budget', label: 'Marketing Budget & Channels', value: '', placeholder: 'Budget allocation across channels with expected ROI', type: 'textarea', minChars: 60 },
      ]
    },
    {
      id: 'sales-strategy',
      title: '5. Sales Strategy',
      description: 'Converting interest into revenue - your sales process and capabilities',
      icon: DollarSign,
      fields: [
        { id: 'sales-process', label: 'Sales Process', value: '', placeholder: 'How do you turn client interest into a sale? Describe your sales funnel', type: 'textarea', minChars: 100 },
        { id: 'sales-skills', label: 'Sales Skills & Experience', value: '', placeholder: 'What prior sales skills and experience does your team bring?', type: 'textarea', minChars: 80 },
        { id: 'closing-methods', label: 'Closing Methods', value: '', placeholder: 'Specific methods for converting prospects to paying customers', type: 'textarea', minChars: 80 },
        { id: 'sales-targets', label: 'Sales Targets', value: '', placeholder: 'Monthly/quarterly sales targets for Year 1-3 with conversion assumptions', type: 'textarea', minChars: 80 },
        { id: 'pricing-strategy', label: 'Pricing Strategy', value: '', placeholder: 'Your pricing model, justification, and competitive positioning', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'skills-strategy',
      title: '6. Skills Strategy',
      description: 'Your capabilities to deliver and run the business - vocational (50%) and commercial (50%)',
      icon: GraduationCap,
      fields: [
        { id: 'technical-skills', label: 'Technical/Vocational Skills', value: '', placeholder: 'Skills to understand and deliver your product/service (50% of assessment)', type: 'textarea', minChars: 100 },
        { id: 'commercial-skills', label: 'Commercial/Business Skills', value: '', placeholder: 'Business management, sales, operations skills (50% of assessment)', type: 'textarea', minChars: 100 },
        { id: 'relevant-experience', label: 'Relevant Experience', value: '', placeholder: 'Previous jobs, roles, and achievements that qualify you', type: 'textarea', minChars: 100 },
        { id: 'personal-interests', label: 'Personal Interests & Networks', value: '', placeholder: 'Relevant interests, connections, and industry relationships', type: 'textarea', minChars: 60 },
        { id: 'skills-gaps', label: 'Skills to Develop', value: '', placeholder: 'What skills will you need to develop? How will you acquire them?', type: 'textarea', minChars: 60 },
      ]
    },
    {
      id: 'resource-planning',
      title: '7. Resource Planning',
      description: 'Knowledge, equipment, supply chain, and financial resources required',
      icon: Building,
      fields: [
        { id: 'knowledge-resources', label: 'Knowledge Resources', value: '', placeholder: 'What knowledge do you need? Who provides it? (may come from advisors, partners)', type: 'textarea', minChars: 80 },
        { id: 'equipment-software', label: 'Equipment & Software', value: '', placeholder: 'Physical equipment, software, tools needed to operate', type: 'textarea', minChars: 80 },
        { id: 'supply-chain', label: 'Supply Chain & Partners', value: '', placeholder: 'Key suppliers, manufacturers, delivery partners, and their roles', type: 'textarea', minChars: 80 },
        { id: 'resources-secured', label: 'Resources Already Secured', value: '', placeholder: 'What resources do you already have in place?', type: 'textarea', minChars: 60 },
        { id: 'resource-gaps', label: 'Resource Acquisition Plan', value: '', placeholder: 'How will you acquire remaining resources? Timeline and cost', type: 'textarea', minChars: 60 },
      ]
    },
    {
      id: 'project-plan',
      title: '8. Project Plan',
      description: 'Key objectives, milestones, and timeframes - typically shown in a Gantt Chart',
      icon: Calendar,
      fields: [
        { id: 'key-targets', label: 'Key Targets (12 months)', value: '', placeholder: 'Your primary business targets for the first year with measurable outcomes', type: 'textarea', minChars: 100 },
        { id: 'main-activities', label: 'Main Activities', value: '', placeholder: 'The major tasks/activities required to achieve your targets', type: 'textarea', minChars: 100 },
        { id: 'dependencies', label: 'Dependencies & Risks', value: '', placeholder: 'What activities depend on others? What could delay progress?', type: 'textarea', minChars: 80 },
        { id: 'revenue-timing', label: 'Revenue Generation Timeline', value: '', placeholder: 'When will you be in a position to generate revenue? Key prerequisites', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'scalability-strategy',
      title: '9. Scalability Strategy',
      description: 'How the business will achieve national and international growth and create UK jobs',
      icon: TrendingUp,
      fields: [
        { id: 'growth-strategy', label: 'National & International Growth', value: '', placeholder: 'How will you grow the business nationally in the UK and internationally?', type: 'textarea', minChars: 100 },
        { id: 'scaling-requirements', label: 'Scaling Requirements', value: '', placeholder: 'What do you need to achieve scale? Infrastructure, technology, partnerships?', type: 'textarea', minChars: 80 },
        { id: 'job-creation', label: 'Job Creation Plan', value: '', placeholder: 'How many UK jobs will you create? Roles, salaries, and hiring timeline', type: 'textarea', minChars: 100 },
        { id: 'expansion-model', label: 'Expansion Model', value: '', placeholder: 'Will you expand through franchising, licensing, direct growth, or acquisitions?', type: 'textarea', minChars: 80 },
        { id: 'year-3-vision', label: '3-Year Vision', value: '', placeholder: 'Where will the business be in 3 years? Revenue, team size, market position', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'innovation-strategy',
      title: '10. Innovation Strategy',
      description: 'Demonstrating genuine innovation that provides benefits not readily available in the UK',
      icon: Lightbulb,
      fields: [
        { id: 'innovation-core', label: 'Core Innovation', value: '', placeholder: 'What are you doing that competitors aren\'t? What makes this genuinely innovative?', type: 'textarea', minChars: 100 },
        { id: 'beneficiaries', label: 'Ultimate Beneficiaries', value: '', placeholder: 'Who benefits from your innovation? End users, industry, society?', type: 'textarea', minChars: 80 },
        { id: 'benefit-types', label: 'Types of Benefits', value: '', placeholder: 'In what specific ways do they benefit? Cost savings, time, quality, access?', type: 'textarea', minChars: 80 },
        { id: 'innovation-development', label: 'Innovation Development Stage', value: '', placeholder: 'How well developed is your innovation? Proof of concept, MVP, production-ready?', type: 'textarea', minChars: 80 },
        { id: 'ip-strategy', label: 'IP & Competitive Protection', value: '', placeholder: 'Patents, trademarks, trade secrets, or other protections for your innovation', type: 'textarea', minChars: 60 },
      ]
    },
    {
      id: 'financial-planning',
      title: '11. Financial Planning',
      description: 'Robust financial projections with realistic assumptions and contingency planning',
      icon: DollarSign,
      fields: [
        { id: 'pricing-structure', label: 'Pricing Structure', value: '', placeholder: 'What are you charging for products/services? Unit prices and volume discounts', type: 'textarea', minChars: 80 },
        { id: 'sales-projections', label: 'Sales Projections', value: '', placeholder: 'When do you expect sales to arrive and in what volume? Monthly for Year 1', type: 'textarea', minChars: 100 },
        { id: 'key-assumptions', label: 'Key Financial Assumptions', value: '', placeholder: 'List your key assumptions: cost per unit, conversion rates, customer lifetime value', type: 'textarea', minChars: 100 },
        { id: 'sensitivity-analysis', label: 'Sensitivity Analysis', value: '', placeholder: 'What if sales are 20-50% lower than projected? Contingency plans', type: 'textarea', minChars: 80 },
        { id: 'funding-sources', label: 'Funding Sources', value: '', placeholder: 'Where will funding come from? Personal savings, loans, investors, grants', type: 'textarea', minChars: 80 },
      ]
    },
    {
      id: 'risk-management',
      title: '12. Risk Management',
      description: 'Identifying what might go wrong and your strategies to manage risks',
      icon: Shield,
      fields: [
        { id: 'key-risks', label: 'Key Business Risks', value: '', placeholder: 'List everything that might go wrong: market, operational, financial, regulatory', type: 'textarea', minChars: 100 },
        { id: 'risk-assessment', label: 'Risk Assessment Approach', value: '', placeholder: 'How do you assess probability and impact? Your risk scoring methodology', type: 'textarea', minChars: 80 },
        { id: 'high-risks', label: 'High-Priority Risks', value: '', placeholder: 'Which risks score 10+ (probability x impact)? How will you address them?', type: 'textarea', minChars: 80 },
        { id: 'mitigation-strategies', label: 'Mitigation Strategies', value: '', placeholder: 'For each high risk: will you avoid, tolerate, or repair? Specific actions', type: 'textarea', minChars: 80 },
        { id: 'contingency-plans', label: 'Contingency Plans', value: '', placeholder: 'What\'s your backup plan if critical risks materialize?', type: 'textarea', minChars: 60 },
      ]
    },
  ]);

  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([
    { id: '1', task: 'Company Formation & Legal Setup', startMonth: 1, duration: 2, category: 'setup', status: 'planned' },
    { id: '2', task: 'Office Space & Infrastructure', startMonth: 1, duration: 3, category: 'setup', status: 'planned' },
    { id: '3', task: 'Product Development Phase 1', startMonth: 2, duration: 4, category: 'development', status: 'planned' },
    { id: '4', task: 'MVP Testing & Iteration', startMonth: 5, duration: 2, category: 'development', status: 'planned' },
    { id: '5', task: 'Brand Development & Website', startMonth: 3, duration: 3, category: 'marketing', status: 'planned' },
    { id: '6', task: 'Marketing Campaign Launch', startMonth: 6, duration: 6, category: 'marketing', status: 'planned' },
    { id: '7', task: 'First Sales & Customer Acquisition', startMonth: 6, duration: 6, category: 'sales', status: 'planned' },
    { id: '8', task: 'Operations Setup', startMonth: 4, duration: 3, category: 'operations', status: 'planned' },
    { id: '9', task: 'First Hire - Technical', startMonth: 8, duration: 2, category: 'hiring', status: 'planned' },
    { id: '10', task: 'Second Hire - Sales/Marketing', startMonth: 10, duration: 2, category: 'hiring', status: 'planned' },
  ]);

  const [financialData, setFinancialData] = useState<FinancialMonth[]>([
    { month: 'Month 1', revenue: 0, costs: 15000, profit: -15000, cumulative: -15000 },
    { month: 'Month 2', revenue: 0, costs: 12000, profit: -12000, cumulative: -27000 },
    { month: 'Month 3', revenue: 0, costs: 10000, profit: -10000, cumulative: -37000 },
    { month: 'Month 4', revenue: 2000, costs: 10000, profit: -8000, cumulative: -45000 },
    { month: 'Month 5', revenue: 5000, costs: 10000, profit: -5000, cumulative: -50000 },
    { month: 'Month 6', revenue: 8000, costs: 11000, profit: -3000, cumulative: -53000 },
    { month: 'Month 7', revenue: 12000, costs: 11000, profit: 1000, cumulative: -52000 },
    { month: 'Month 8', revenue: 18000, costs: 12000, profit: 6000, cumulative: -46000 },
    { month: 'Month 9', revenue: 25000, costs: 13000, profit: 12000, cumulative: -34000 },
    { month: 'Month 10', revenue: 32000, costs: 14000, profit: 18000, cumulative: -16000 },
    { month: 'Month 11', revenue: 40000, costs: 15000, profit: 25000, cumulative: 9000 },
    { month: 'Month 12', revenue: 50000, costs: 16000, profit: 34000, cumulative: 43000 },
  ]);

  const [risks, setRisks] = useState<RiskItem[]>([
    { id: '1', risk: 'Key team member departure', probability: 2, impact: 4, mitigation: 'Cross-training, equity incentives, succession planning', status: 'active' },
    { id: '2', risk: 'Slower than expected sales', probability: 4, impact: 4, mitigation: '6-month cash runway, flexible cost structure, pivot strategy', status: 'active' },
    { id: '3', risk: 'Technology failure/security breach', probability: 2, impact: 5, mitigation: 'Robust backup systems, security audits, insurance', status: 'active' },
    { id: '4', risk: 'Regulatory changes', probability: 2, impact: 3, mitigation: 'Legal advisors on retainer, industry association membership', status: 'active' },
    { id: '5', risk: 'Competitor launches similar product', probability: 3, impact: 3, mitigation: 'Speed to market, patent protection, customer lock-in', status: 'active' },
    { id: '6', risk: 'Supply chain disruption', probability: 2, impact: 3, mitigation: 'Multiple suppliers, buffer inventory, local alternatives', status: 'active' },
  ]);

  const [competitors, setCompetitors] = useState<CompetitorData[]>([
    { id: '1', name: 'Competitor A', marketShare: 35, pricing: 'Premium', strengths: 'Brand recognition, large customer base', weaknesses: 'Slow innovation, high prices', yourAdvantage: 'More agile, better technology' },
    { id: '2', name: 'Competitor B', marketShare: 25, pricing: 'Mid-range', strengths: 'Good product, strong sales team', weaknesses: 'Limited features, poor support', yourAdvantage: 'Superior customer service' },
    { id: '3', name: 'Competitor C', marketShare: 15, pricing: 'Budget', strengths: 'Low prices, wide availability', weaknesses: 'Quality issues, no innovation', yourAdvantage: 'Premium quality, better value' },
  ]);

  const [jobCreationPlan, setJobCreationPlan] = useState([
    { year: 'Year 1', roles: 'Founder + 2 hires', totalJobs: 3, salaryBudget: 85000 },
    { year: 'Year 2', roles: '+ 4 hires (Tech, Sales, Ops)', totalJobs: 7, salaryBudget: 210000 },
    { year: 'Year 3', roles: '+ 5 hires (Full team)', totalJobs: 12, salaryBudget: 420000 },
  ]);

  const [activeTab, setActiveTab] = useState('plan');
  const [activePlanSection, setActivePlanSection] = useState(0);
  const [savedDate, setSavedDate] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['executive-summary']));

  const autoSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleAiComplete = (answers: Record<string, any>) => {
    setSections(prevSections => {
      return prevSections.map(section => ({
        ...section,
        fields: section.fields.map(field => {
          const answer = answers[field.id];
          if (answer) {
            return { ...field, value: answer };
          }
          return field;
        })
      }));
    });
    setMode('traditional');
    toast({
      title: "AI Assessment Complete",
      description: "Your business plan has been populated based on your answers.",
    });
  };

  const updateField = (sectionId: string, fieldId: string, value: string) => {
    setSections(prevSections => {
      const newSections = prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : section
      );
      
      if (autoSaveDebounceRef.current) {
        clearTimeout(autoSaveDebounceRef.current);
      }
      autoSaveDebounceRef.current = setTimeout(() => {
        const state = getSerializedState();
        state.sections = newSections;
        localStorage.setItem('business-plan-state', JSON.stringify(state));
        setSavedDate(new Date().toLocaleString('en-GB'));
        setShowAutoSaveNotification(true);
        setTimeout(() => setShowAutoSaveNotification(false), 2000);
      }, 500);
      
      return newSections;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const calculateSectionCompletion = (section: BusinessPlanSection): number => {
    const completedFields = section.fields.filter(f => f.value.length >= f.minChars).length;
    return Math.round((completedFields / section.fields.length) * 100);
  };

  const calculateOverallCompletion = (): number => {
    const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
    const completedFields = sections.reduce((sum, s) => 
      sum + s.fields.filter(f => f.value.length >= f.minChars).length, 0
    );
    return Math.round((completedFields / totalFields) * 100);
  };

  const getRiskLevel = (probability: number, impact: number): string => {
    const score = probability * impact;
    if (score >= 20) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const overallCompletion = calculateOverallCompletion();

  const getSerializedState = () => {
    return {
      sections,
      ganttTasks,
      financialData,
      risks,
      competitors,
      jobCreationPlan,
      activeTab,
      activePlanSection,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('sections' in state) setSections(state.sections);
    if ('ganttTasks' in state) setGanttTasks(state.ganttTasks);
    if ('financialData' in state) setFinancialData(state.financialData);
    if ('risks' in state) setRisks(state.risks);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('jobCreationPlan' in state) setJobCreationPlan(state.jobCreationPlan);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('activePlanSection' in state) setActivePlanSection(state.activePlanSection);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'business-plan_handoff';
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
      const saved = localStorage.getItem('business-plan-state');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          restoreSerializedState(state);
          lastSaveRef.current = saved;
        } catch (err) {
          console.error('Failed to restore saved state:', err);
        }
      }
    }
  }, []);

  const handleSave = useCallback(() => {
    const state = getSerializedState();
    const stateString = JSON.stringify(state);
    localStorage.setItem('business-plan-state', stateString);
    setSavedDate(state.savedDate);
    lastSaveRef.current = stateString;
    return true;
  }, [sections, ganttTasks, financialData, risks, competitors, jobCreationPlan, activeTab, activePlanSection]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentState = JSON.stringify(getSerializedState());
      if (currentState !== lastSaveRef.current) {
        handleSave();
        setShowAutoSaveNotification(true);
        setTimeout(() => setShowAutoSaveNotification(false), 3000);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [handleSave]);

  const handleRestore = () => {
    const saved = localStorage.getItem('business-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const addGanttTask = () => {
    const newTask: GanttTask = {
      id: Date.now().toString(),
      task: 'New Task',
      startMonth: 1,
      duration: 2,
      category: 'operations',
      status: 'planned'
    };
    setGanttTasks([...ganttTasks, newTask]);
  };

  const updateGanttTask = (id: string, updates: Partial<GanttTask>) => {
    setGanttTasks(ganttTasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteGanttTask = (id: string) => {
    setGanttTasks(ganttTasks.filter(t => t.id !== id));
  };

  const addRisk = () => {
    const newRisk: RiskItem = {
      id: Date.now().toString(),
      risk: 'New risk',
      probability: 2,
      impact: 2,
      mitigation: '',
      status: 'active'
    };
    setRisks([...risks, newRisk]);
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    setRisks(risks.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const addCompetitor = () => {
    const newCompetitor: CompetitorData = {
      id: Date.now().toString(),
      name: 'New Competitor',
      marketShare: 10,
      pricing: 'Mid-range',
      strengths: '',
      weaknesses: '',
      yourAdvantage: ''
    };
    setCompetitors([...competitors, newCompetitor]);
  };

  const updateCompetitor = (id: string, updates: Partial<CompetitorData>) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const updateFinancialMonth = (index: number, field: keyof FinancialMonth, value: number) => {
    const newData = [...financialData];
    newData[index] = { ...newData[index], [field]: value };
    newData[index].profit = newData[index].revenue - newData[index].costs;
    
    let cumulative = 0;
    for (let i = 0; i <= index; i++) {
      cumulative += newData[i].profit;
      newData[i].cumulative = cumulative;
    }
    for (let i = index + 1; i < newData.length; i++) {
      cumulative += newData[i].profit;
      newData[i].cumulative = cumulative;
    }
    
    setFinancialData(newData);
  };

  const getExportSections = () => {
    const businessName = sections.find(s => s.id === 'executive-summary')?.fields.find(f => f.id === 'business-name')?.value || 'Business Plan';
    
    return {
      title: 'UK Innovator Founder Visa Business Plan',
      subtitle: businessName,
      filename: `business-plan-${new Date().toISOString().split('T')[0]}`,
      sections: [
        { type: 'score' as const, score: { value: overallCompletion, max: 100, label: 'Overall Completion' } },
        { type: 'divider' as const },
        
        ...sections.flatMap(section => [
          { type: 'heading' as const, content: section.title, level: 1 as const },
          { type: 'paragraph' as const, content: section.description },
          ...section.fields.map(field => ({
            type: 'paragraph' as const,
            content: `${field.label}: ${field.value || '[Not completed]'}`
          })),
          { type: 'paragraph' as const, content: `Section Completion: ${calculateSectionCompletion(section)}%` },
          { type: 'divider' as const },
        ]),
        
        { type: 'heading' as const, content: '8. Project Plan - Gantt Chart', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Task', 'Start Month', 'Duration', 'Category', 'Status'],
          rows: ganttTasks.map(t => [t.task, `Month ${t.startMonth}`, `${t.duration} months`, t.category, t.status])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: '11. Financial Planning - 12-Month Cash Flow', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Month', 'Revenue (£)', 'Costs (£)', 'Profit (£)', 'Cumulative (£)'],
          rows: financialData.map(m => [m.month, m.revenue.toLocaleString(), m.costs.toLocaleString(), m.profit.toLocaleString(), m.cumulative.toLocaleString()])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: '12. Risk Management - Risk Register', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Risk', 'Probability (1-5)', 'Impact (1-5)', 'Score', 'Level', 'Mitigation'],
          rows: risks.map(r => [r.risk, r.probability.toString(), r.impact.toString(), (r.probability * r.impact).toString(), getRiskLevel(r.probability, r.impact).toUpperCase(), r.mitigation])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'Competitor Analysis', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Competitor', 'Market Share', 'Pricing', 'Strengths', 'Weaknesses', 'Your Advantage'],
          rows: competitors.map(c => [c.name, `${c.marketShare}%`, c.pricing, c.strengths, c.weaknesses, c.yourAdvantage])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'Job Creation Plan', level: 1 as const },
        { type: 'table' as const, tableData: {
          headers: ['Period', 'Roles', 'Total Jobs', 'Salary Budget (£)'],
          rows: jobCreationPlan.map(j => [j.year, j.roles, j.totalJobs.toString(), j.salaryBudget.toLocaleString()])
        }},
        { type: 'divider' as const },
        
        { type: 'heading' as const, content: 'Innovator International Compliance Checklist', level: 1 as const },
        { type: 'list' as const, items: [
          'Executive Summary is compelling and concise (max 2 pages)',
          'Problem/Solution clearly articulates customer pain point',
          'Market Assessment includes credible TAM/SAM/SOM data',
          'Marketing Strategy shows clear route to market',
          'Sales Strategy demonstrates ability to close deals',
          'Skills Strategy covers both vocational (50%) and commercial (50%)',
          'Resource Planning identifies all knowledge, equipment, and partners',
          'Project Plan includes Gantt Chart with realistic timelines',
          'Scalability Strategy shows path to UK job creation',
          'Innovation is integral to the business, not added on',
          'Financial Planning includes 12-month cash flow with contingency',
          'Risk Management identifies high-priority risks with mitigation',
        ]},
        { type: 'divider' as const },
        
        { type: 'paragraph' as const, content: 'DISCLAIMER: This business plan template follows the Innovator International structure but does not guarantee endorsement. Consult with qualified advisors before submitting applications.' },
      ],
      metadata: {
        subject: 'UK Innovator Founder Visa Business Plan - Innovator International Format',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['visa', 'business plan', 'UK', 'innovator', 'founder', 'Innovator International'],
      }
    };
  };

  const handleExportPdf = () => {
    const exportData = getExportSections();
    generatePdf(exportData);
    
    toast({
      title: "PDF Exported Successfully",
      description: "Your business plan has been downloaded as a PDF.",
    });
  };

  const handleExportWord = async () => {
    const exportData = getExportSections();
    await generateWord(exportData);
    
    toast({
      title: "Word Document Exported Successfully",
      description: "Your business plan has been downloaded as a Word document (.docx).",
    });
  };

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "https://innovatorfoundervisaassistant.co.uk/" },
    { name: "Tools Hub", url: "https://innovatorfoundervisaassistant.co.uk/tools-hub" },
    { name: "Business Plan Generator", url: "https://innovatorfoundervisaassistant.co.uk/tools/business-plan" }
  ]);

  const articleSchema = createArticleSchema(
    "PhD-Level Business Plan Generator for UK Innovator Founder Visa",
    "Create a comprehensive, Innovator International-compliant business plan with Gantt charts, financial projections, and risk matrices for your UK Innovator Founder Visa application.",
    "2025-11-24"
  );

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema, articleSchema]
  };

  const renderGanttChart = () => {
    const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Project Timeline (Gantt Chart)
          </h3>
          <Button onClick={addGanttTask} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[200px_repeat(12,1fr)] gap-1 mb-2">
              <div className="font-medium text-sm p-2">Task</div>
              {months.map(m => (
                <div key={m} className="text-center text-xs font-medium p-2 bg-muted rounded">{m}</div>
              ))}
            </div>
            
            {ganttTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-[200px_repeat(12,1fr)] gap-1 mb-2 items-center group">
                <div className="flex items-center gap-1">
                  <Input
                    value={task.task}
                    onChange={(e) => updateGanttTask(task.id, { task: e.target.value })}
                    className="text-sm h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteGanttTask(task.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                {months.map((_, i) => {
                  const monthNum = i + 1;
                  const isInRange = monthNum >= task.startMonth && monthNum < task.startMonth + task.duration;
                  return (
                    <div
                      key={i}
                      className={`h-8 rounded cursor-pointer transition-colors ${
                        isInRange 
                          ? `opacity-90` 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                      style={{ backgroundColor: isInRange ? CATEGORY_COLORS[task.category] : undefined }}
                      onClick={() => {
                        if (!isInRange) {
                          updateGanttTask(task.id, { startMonth: monthNum });
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
            
            <div className="flex gap-4 mt-4 flex-wrap">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                  <span className="text-xs capitalize">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {ganttTasks.map((task) => (
            <Card key={task.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS[task.category] }} />
                  <span className="text-sm font-medium truncate">{task.task}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <Label className="text-xs">Start</Label>
                    <Select value={task.startMonth.toString()} onValueChange={(v) => updateGanttTask(task.id, { startMonth: parseInt(v) })}>
                      <SelectTrigger className="h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>Month {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Select value={task.duration.toString()} onValueChange={(v) => updateGanttTask(task.id, { duration: parseInt(v) })}>
                      <SelectTrigger className="h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} month{i > 0 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select value={task.category} onValueChange={(v: any) => updateGanttTask(task.id, { category: v })}>
                      <SelectTrigger className="h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(CATEGORY_COLORS).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={task.status} onValueChange={(v: any) => updateGanttTask(task.id, { status: v })}>
                      <SelectTrigger className="h-7"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderFinancialTables = () => {
    const totalRevenue = financialData.reduce((sum, m) => sum + m.revenue, 0);
    const totalCosts = financialData.reduce((sum, m) => sum + m.costs, 0);
    const totalProfit = financialData.reduce((sum, m) => sum + m.profit, 0);
    const breakEvenMonth = financialData.findIndex(m => m.cumulative >= 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
            <div className="text-sm text-muted-foreground">Total Revenue (Y1)</div>
            <div className="text-2xl font-bold text-emerald-600">£{totalRevenue.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <div className="text-sm text-muted-foreground">Total Costs (Y1)</div>
            <div className="text-2xl font-bold text-red-600">£{totalCosts.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="text-sm text-muted-foreground">Net Profit (Y1)</div>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              £{totalProfit.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <div className="text-sm text-muted-foreground">Break-Even</div>
            <div className="text-2xl font-bold text-amber-600">
              {breakEvenMonth >= 0 ? `Month ${breakEvenMonth + 1}` : 'Not Yet'}
            </div>
          </Card>
        </div>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            12-Month Cash Flow Projection
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
              <Bar dataKey="costs" name="Costs" fill="#EF4444" />
              <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#3B82F6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Monthly Cash Flow Table</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-right p-2 font-medium">Revenue (£)</th>
                  <th className="text-right p-2 font-medium">Costs (£)</th>
                  <th className="text-right p-2 font-medium">Profit (£)</th>
                  <th className="text-right p-2 font-medium">Cumulative (£)</th>
                </tr>
              </thead>
              <tbody>
                {financialData.map((month, index) => (
                  <tr key={month.month} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={month.revenue}
                        onChange={(e) => updateFinancialMonth(index, 'revenue', parseInt(e.target.value) || 0)}
                        className="h-8 w-24 text-right ml-auto"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={month.costs}
                        onChange={(e) => updateFinancialMonth(index, 'costs', parseInt(e.target.value) || 0)}
                        className="h-8 w-24 text-right ml-auto"
                      />
                    </td>
                    <td className={`p-2 text-right font-medium ${month.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {month.profit.toLocaleString()}
                    </td>
                    <td className={`p-2 text-right font-medium ${month.cumulative >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {month.cumulative.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right text-emerald-600">{totalRevenue.toLocaleString()}</td>
                  <td className="p-2 text-right text-red-600">{totalCosts.toLocaleString()}</td>
                  <td className={`p-2 text-right ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalProfit.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderRiskMatrix = () => {
    const riskData = risks.map(r => ({
      ...r,
      score: r.probability * r.impact,
      level: getRiskLevel(r.probability, r.impact)
    })).sort((a, b) => b.score - a.score);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Assessment Matrix
          </h3>
          <Button onClick={addRisk} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Risk
          </Button>
        </div>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Risk Heat Map (Probability vs Impact)</h4>
          <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
            <div></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="text-center text-xs font-medium p-1">{i}</div>
            ))}
            {[5, 4, 3, 2, 1].map(prob => (
              <>
                <div key={`p${prob}`} className="text-xs font-medium p-1 flex items-center">{prob}</div>
                {[1, 2, 3, 4, 5].map(imp => {
                  const score = prob * imp;
                  const level = score >= 20 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low';
                  const risksInCell = risks.filter(r => r.probability === prob && r.impact === imp);
                  return (
                    <div
                      key={`${prob}-${imp}`}
                      className="h-12 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: RISK_COLORS[level] }}
                      title={risksInCell.map(r => r.risk).join(', ') || `Score: ${score}`}
                    >
                      {risksInCell.length > 0 && risksInCell.length}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.low }} /> Low (1-4)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.medium }} /> Medium (5-9)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.high }} /> High (10-19)</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: RISK_COLORS.critical }} /> Critical (20-25)</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Risk Register</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Risk</th>
                  <th className="text-center p-2 w-20">Prob (1-5)</th>
                  <th className="text-center p-2 w-20">Impact (1-5)</th>
                  <th className="text-center p-2 w-16">Score</th>
                  <th className="text-center p-2 w-20">Level</th>
                  <th className="text-left p-2">Mitigation Strategy</th>
                  <th className="text-center p-2 w-24">Status</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((risk) => (
                  <tr key={risk.id} className="border-b hover:bg-muted/50 group">
                    <td className="p-2">
                      <Input
                        value={risk.risk}
                        onChange={(e) => updateRisk(risk.id, { risk: e.target.value })}
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Select value={risk.probability.toString()} onValueChange={(v) => updateRisk(risk.id, { probability: parseInt(v) })}>
                        <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Select value={risk.impact.toString()} onValueChange={(v) => updateRisk(risk.id, { impact: parseInt(v) })}>
                        <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 text-center font-bold">{risk.score}</td>
                    <td className="p-2">
                      <Badge style={{ backgroundColor: RISK_COLORS[risk.level as keyof typeof RISK_COLORS] }} className="text-white">
                        {risk.level.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Textarea
                        value={risk.mitigation}
                        onChange={(e) => updateRisk(risk.id, { mitigation: e.target.value })}
                        className="h-16 text-sm"
                        placeholder="How will you mitigate this risk?"
                      />
                    </td>
                    <td className="p-2">
                      <Select value={risk.status} onValueChange={(v: any) => updateRisk(risk.id, { status: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="mitigated">Mitigated</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteRisk(risk.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderCompetitorAnalysis = () => {
    const pieData = competitors.map(c => ({ name: c.name, value: c.marketShare }));
    pieData.push({ name: 'Your Target', value: 100 - competitors.reduce((s, c) => s + c.marketShare, 0) });
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Competitor Analysis (Pivot Table)
          </h3>
          <Button onClick={addCompetitor} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Competitor
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Market Share Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Competitive Positioning</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitors} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 50]} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="marketShare" fill="#3B82F6" name="Market Share %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Competitive Analysis Table</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Competitor</th>
                  <th className="text-center p-2 w-24">Market Share</th>
                  <th className="text-center p-2 w-24">Pricing</th>
                  <th className="text-left p-2">Strengths</th>
                  <th className="text-left p-2">Weaknesses</th>
                  <th className="text-left p-2">Your Advantage</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr key={comp.id} className="border-b hover:bg-muted/50 group">
                    <td className="p-2">
                      <Input
                        value={comp.name}
                        onChange={(e) => updateCompetitor(comp.id, { name: e.target.value })}
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={comp.marketShare}
                        onChange={(e) => updateCompetitor(comp.id, { marketShare: parseInt(e.target.value) || 0 })}
                        className="h-8 w-16 text-center"
                        max={100}
                      />
                    </td>
                    <td className="p-2">
                      <Select value={comp.pricing} onValueChange={(v) => updateCompetitor(comp.id, { pricing: v })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Budget">Budget</SelectItem>
                          <SelectItem value="Mid-range">Mid-range</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        value={comp.strengths}
                        onChange={(e) => updateCompetitor(comp.id, { strengths: e.target.value })}
                        className="h-8"
                        placeholder="Key strengths"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={comp.weaknesses}
                        onChange={(e) => updateCompetitor(comp.id, { weaknesses: e.target.value })}
                        className="h-8"
                        placeholder="Key weaknesses"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={comp.yourAdvantage}
                        onChange={(e) => updateCompetitor(comp.id, { yourAdvantage: e.target.value })}
                        className="h-8"
                        placeholder="Your competitive edge"
                      />
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteCompetitor(comp.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderScalabilityVisuals = () => {
    const jobData = jobCreationPlan.map(j => ({ name: j.year, jobs: j.totalJobs, salary: j.salaryBudget / 1000 }));
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Scalability & Job Creation Visualizations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Job Creation Timeline</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" name="Total Jobs" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Salary Budget Growth (£k)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={jobData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `£${value}k`} />
                <Area type="monotone" dataKey="salary" name="Salary Budget" fill="#3B82F6" fillOpacity={0.6} stroke="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Job Creation Plan (UK Employment)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Period</th>
                  <th className="text-left p-2">Roles to Hire</th>
                  <th className="text-center p-2">Cumulative Jobs</th>
                  <th className="text-right p-2">Annual Salary Budget (£)</th>
                </tr>
              </thead>
              <tbody>
                {jobCreationPlan.map((plan, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{plan.year}</td>
                    <td className="p-2">
                      <Input
                        value={plan.roles}
                        onChange={(e) => {
                          const updated = [...jobCreationPlan];
                          updated[index].roles = e.target.value;
                          setJobCreationPlan(updated);
                        }}
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={plan.totalJobs}
                        onChange={(e) => {
                          const updated = [...jobCreationPlan];
                          updated[index].totalJobs = parseInt(e.target.value) || 0;
                          setJobCreationPlan(updated);
                        }}
                        className="h-8 w-20 text-center mx-auto"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={plan.salaryBudget}
                        onChange={(e) => {
                          const updated = [...jobCreationPlan];
                          updated[index].salaryBudget = parseInt(e.target.value) || 0;
                          setJobCreationPlan(updated);
                        }}
                        className="h-8 w-28 text-right ml-auto"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <ToolAccessGuard requiredTier="basic" toolName="Business Plan Generator">
      <SEOHead
        title="PhD-Level Business Plan Generator | UK Innovator Founder Visa Assistant"
        description="Create a comprehensive, Innovator International-compliant business plan with Gantt charts, financial projections, and risk matrices for your UK Innovator Founder Visa application."
        schema={combinedSchema}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
        <div className="responsive-container max-w-7xl">
          <ToolUtilityBar
            toolId="business-plan"
            toolName="Business Plan Generator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
          />

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  PhD-Level Business Plan Generator
                </CardTitle>
                <CardDescription>
                  Innovator International Template - 12 Sections with Gantt Charts, Financial Tables & Risk Matrix
                </CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </CardHeader>
            <CardContent>
              {mode === 'ai' ? (
                <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
              ) : (
                <>
                  {showAutoSaveNotification && (
                    <Alert className="mb-4 bg-green-50 dark:bg-green-950/30 border-green-200">
                      <Save className="h-4 w-4" />
                      <AlertDescription>Auto-saved at {savedDate}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm font-bold text-primary">{overallCompletion}%</span>
                    </div>
                    <Progress value={overallCompletion} className="h-3" />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="plan" data-testid="tab-plan">Plan Sections</TabsTrigger>
                      <TabsTrigger value="gantt" data-testid="tab-gantt">Gantt Chart</TabsTrigger>
                      <TabsTrigger value="financials" data-testid="tab-financials">Financials</TabsTrigger>
                      <TabsTrigger value="risks" data-testid="tab-risks">Risk Matrix</TabsTrigger>
                      <TabsTrigger value="competitors" data-testid="tab-competitors">Competitors</TabsTrigger>
                      <TabsTrigger value="scalability" data-testid="tab-scalability">Scalability</TabsTrigger>
                    </TabsList>

                    <TabsContent value="plan" className="space-y-4 mt-4">
                      {sections.map((section, index) => {
                        const Icon = section.icon;
                        const completion = calculateSectionCompletion(section);
                        const isExpanded = expandedSections.has(section.id);
                        
                        return (
                          <Card key={section.id} className="overflow-hidden">
                            <div
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => toggleSection(section.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${completion === 100 ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-primary/10'}`}>
                                  <Icon className={`h-5 w-5 ${completion === 100 ? 'text-emerald-600' : 'text-primary'}`} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{section.title}</h3>
                                  <p className="text-sm text-muted-foreground">{section.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium">{completion}%</div>
                                  <Progress value={completion} className="h-2 w-24" />
                                </div>
                                {completion === 100 ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <CardContent className="border-t">
                                <div className="space-y-4 pt-4">
                                  {section.fields.map((field) => (
                                    <div key={field.id}>
                                      <Label className="font-medium">{field.label}</Label>
                                      {field.type === 'textarea' ? (
                                        <Textarea
                                          value={field.value}
                                          onChange={(e) => updateField(section.id, field.id, e.target.value)}
                                          placeholder={field.placeholder}
                                          className="min-h-[100px] mt-1"
                                          data-testid={`input-${section.id}-${field.id}`}
                                        />
                                      ) : (
                                        <Input
                                          value={field.value}
                                          onChange={(e) => updateField(section.id, field.id, e.target.value)}
                                          placeholder={field.placeholder}
                                          className="mt-1"
                                          data-testid={`input-${section.id}-${field.id}`}
                                        />
                                      )}
                                      <div className="flex justify-between mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          {field.value.length}/{field.minChars} characters minimum
                                        </p>
                                        {field.value.length >= field.minChars && (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </TabsContent>

                    <TabsContent value="gantt" className="mt-4">
                      {renderGanttChart()}
                    </TabsContent>

                    <TabsContent value="financials" className="mt-4">
                      {renderFinancialTables()}
                    </TabsContent>

                    <TabsContent value="risks" className="mt-4">
                      {renderRiskMatrix()}
                    </TabsContent>

                    <TabsContent value="competitors" className="mt-4">
                      {renderCompetitorAnalysis()}
                    </TabsContent>

                    <TabsContent value="scalability" className="mt-4">
                      {renderScalabilityVisuals()}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAccessGuard>
  );
}
