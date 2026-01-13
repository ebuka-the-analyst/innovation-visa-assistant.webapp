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
import { CheckCircle2, AlertTriangle, TrendingUp, Target, Users, Rocket, DollarSign, Calendar, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart, Area
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'gtm-plan',
  toolName: 'Go-to-Market Strategy',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Expert. A strong Go-to-Market strategy is essential for demonstrating viability and scalability to UK Innovator Founder Visa endorsers. Let's build your market entry plan together!",
  questions: [
    {
      id: 'business-name',
      question: "What's the name of your business and what product or service are you bringing to market?",
      hint: "Provide a brief description of your offering",
      fieldKey: 'businessName'
    },
    {
      id: 'target-market',
      question: "Who is your target market in the UK? Describe the customer segments you'll focus on initially.",
      hint: "Be specific: B2B/B2C, industry, company size, demographics, geographic focus",
      fieldKey: 'targetMarket',
      minLength: 50
    },
    {
      id: 'value-proposition',
      question: "What's your unique value proposition? Why will UK customers choose you over alternatives?",
      hint: "Focus on the specific problem you solve and the benefits you deliver",
      fieldKey: 'valueProposition',
      minLength: 50
    },
    {
      id: 'competitive-advantage',
      question: "What's your competitive advantage and how is it defensible? How do you differentiate from competitors?",
      hint: "Consider IP, technology, expertise, network effects, brand, pricing",
      fieldKey: 'competitiveAdvantage',
      minLength: 50
    },
    {
      id: 'pricing-distribution',
      question: "What's your pricing strategy and how will you distribute your product/service? List your main channels.",
      hint: "Include pricing tiers if applicable, and specify sales/distribution channels",
      fieldKey: 'pricingDistribution',
      minLength: 30
    },
    {
      id: 'launch-timeline',
      question: "What's your launch timeline? Describe your key milestones for the first 6 months.",
      hint: "Include pre-launch, soft launch, and full market entry phases",
      fieldKey: 'launchTimeline',
      minLength: 50
    },
    {
      id: 'success-metrics',
      question: "How will you measure success? What are your key performance indicators for the first year?",
      hint: "Include revenue targets, customer acquisition goals, market share objectives",
      fieldKey: 'successMetrics',
      minLength: 30
    }
  ],
  completionMessage: "Excellent! You've crafted a comprehensive go-to-market strategy. This demonstrates market readiness and execution capability to endorsing bodies. I'm populating your GTM plan now."
};

type ChannelStrategy = {
  channel: string;
  investment: number;
  expectedROI: number;
  timeline: string;
};

type LaunchPhase = {
  phase: string;
  startWeek: number;
  duration: number;
  activities: string[];
  status: 'planned' | 'in-progress' | 'completed';
};

export default function GoToMarketStrategy() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('gtm-plan-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('gtm-plan-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  // Core GTM Strategy Fields
  const [businessName, setBusinessName] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState('');
  const [pricingStrategy, setPricingStrategy] = useState('');
  const [customerSegments, setCustomerSegments] = useState('');
  const [distributionChannels, setDistributionChannels] = useState('');
  const [launchTimeline, setLaunchTimeline] = useState('');
  const [successMetrics, setSuccessMetrics] = useState('');
  const [marketingBudget, setMarketingBudget] = useState('');
  
  // Advanced GTM Components
  const [channels, setChannels] = useState<ChannelStrategy[]>([
    { channel: 'Direct Sales', investment: 0, expectedROI: 0, timeline: 'Month 1-3' },
    { channel: 'Content Marketing', investment: 0, expectedROI: 0, timeline: 'Month 1-6' },
    { channel: 'Partnerships', investment: 0, expectedROI: 0, timeline: 'Month 2-4' },
  ]);

  const [launchPhases, setLaunchPhases] = useState<LaunchPhase[]>([
    { phase: 'Pre-Launch', startWeek: 0, duration: 4, activities: ['Market validation', 'Beta testing', 'Partner recruitment'], status: 'planned' },
    { phase: 'Soft Launch', startWeek: 4, duration: 4, activities: ['Limited release', 'Early adopter program', 'Feedback collection'], status: 'planned' },
    { phase: 'Market Entry', startWeek: 8, duration: 8, activities: ['Full product launch', 'Marketing campaigns', 'Channel activation'], status: 'planned' },
    { phase: 'Scale & Optimize', startWeek: 16, duration: 12, activities: ['Performance optimization', 'Market expansion', 'Revenue scaling'], status: 'planned' },
  ]);

  // Scoring Metrics (0-100 scale)
  const [messagingClarity, setMessagingClarity] = useState(70);
  const [channelFit, setChannelFit] = useState(65);
  const [marketPositioning, setMarketPositioning] = useState(75);
  const [executionReadiness, setExecutionReadiness] = useState(70);
  const [scalabilityPotential, setScalabilityPotential] = useState(68);
  const [competitiveStrength, setCompetitiveStrength] = useState(72);

  const [activeTab, setActiveTab] = useState('strategy');
  const [savedDate, setSavedDate] = useState('');

  // Calculate GTM Readiness Score
  const calculateGTMReadiness = (): number => {
    return Math.round((messagingClarity + channelFit + marketPositioning + executionReadiness + scalabilityPotential + competitiveStrength) / 6);
  };

  const getReadinessGrade = (score: number): string => {
    if (score >= 85) return 'A - Market Ready';
    if (score >= 75) return 'B - Strong Position';
    if (score >= 65) return 'C - Viable Strategy';
    if (score >= 55) return 'D - Needs Improvement';
    return 'F - Critical Gaps';
  };

  const gtmReadiness = calculateGTMReadiness();
  const readinessGrade = getReadinessGrade(gtmReadiness);

  // State Management Functions with 'if (field in state)' pattern
  const getSerializedState = () => {
    return {
      businessName,
      targetMarket,
      valueProposition,
      competitiveAdvantage,
      pricingStrategy,
      customerSegments,
      distributionChannels,
      launchTimeline,
      successMetrics,
      marketingBudget,
      channels,
      launchPhases,
      messagingClarity,
      channelFit,
      marketPositioning,
      executionReadiness,
      scalabilityPotential,
      competitiveStrength,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('businessName' in state) setBusinessName(state.businessName);
    if ('targetMarket' in state) setTargetMarket(state.targetMarket);
    if ('valueProposition' in state) setValueProposition(state.valueProposition);
    if ('competitiveAdvantage' in state) setCompetitiveAdvantage(state.competitiveAdvantage);
    if ('pricingStrategy' in state) setPricingStrategy(state.pricingStrategy);
    if ('customerSegments' in state) setCustomerSegments(state.customerSegments);
    if ('distributionChannels' in state) setDistributionChannels(state.distributionChannels);
    if ('launchTimeline' in state) setLaunchTimeline(state.launchTimeline);
    if ('successMetrics' in state) setSuccessMetrics(state.successMetrics);
    if ('marketingBudget' in state) setMarketingBudget(state.marketingBudget);
    if ('channels' in state) setChannels(state.channels);
    if ('launchPhases' in state) setLaunchPhases(state.launchPhases);
    if ('messagingClarity' in state) setMessagingClarity(state.messagingClarity);
    if ('channelFit' in state) setChannelFit(state.channelFit);
    if ('marketPositioning' in state) setMarketPositioning(state.marketPositioning);
    if ('executionReadiness' in state) setExecutionReadiness(state.executionReadiness);
    if ('scalabilityPotential' in state) setScalabilityPotential(state.scalabilityPotential);
    if ('competitiveStrength' in state) setCompetitiveStrength(state.competitiveStrength);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('gtm-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gtm-plan-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.businessName) setBusinessName(answers.businessName);
    if (answers.targetMarket) setTargetMarket(answers.targetMarket);
    if (answers.valueProposition) setValueProposition(answers.valueProposition);
    if (answers.competitiveAdvantage) setCompetitiveAdvantage(answers.competitiveAdvantage);
    if (answers.pricingDistribution) {
      setPricingStrategy(answers.pricingDistribution);
      setDistributionChannels(answers.pricingDistribution);
    }
    if (answers.launchTimeline) setLaunchTimeline(answers.launchTimeline);
    if (answers.successMetrics) setSuccessMetrics(answers.successMetrics);
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('gtm-plan-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('gtm-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  // Channel Management
  const updateChannel = (index: number, field: keyof ChannelStrategy, value: any) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], [field]: value };
    setChannels(updated);
  };

  const addChannel = () => {
    setChannels([...channels, { channel: '', investment: 0, expectedROI: 0, timeline: 'Month 1-3' }]);
  };

  const removeChannel = (index: number) => {
    if (channels.length > 1) {
      setChannels(channels.filter((_, i) => i !== index));
    }
  };

  // Smart Tips (6+ recommendations without emojis)
  const getSmartTips = () => {
    const tips = [];
    
    if (gtmReadiness < 65) {
      tips.push("GTM readiness below 65 percent - strengthen core strategy components before market entry");
    }
    
    if (messagingClarity < 70) {
      tips.push("Messaging clarity needs improvement - ensure value proposition is immediately understood by target customers");
    }
    
    if (channelFit < 65) {
      tips.push("Channel strategy requires optimization - align distribution channels with customer acquisition costs and segment preferences");
    }
    
    if (scalabilityPotential < 70) {
      tips.push("CRITICAL: Scalability score below 70 percent - UK Innovator Founder Visa emphasizes growth potential in assessment criteria");
    }
    
    if (executionReadiness < 70) {
      tips.push("Execution readiness needs strengthening - develop detailed implementation roadmap with measurable milestones");
    }
    
    if (competitiveStrength < 70) {
      tips.push("Competitive positioning requires reinforcement - clearly articulate differentiation and defensible advantages");
    }
    
    if (!targetMarket || targetMarket.length < 50) {
      tips.push("Target market definition insufficient - specify customer segments, geographic focus, and total addressable market size");
    }
    
    if (!valueProposition || valueProposition.length < 50) {
      tips.push("Value proposition underdeveloped - articulate specific customer problems solved and quantifiable benefits delivered");
    }
    
    if (channels.filter(c => c.investment > 0).length < 2) {
      tips.push("Diversify distribution channels - multi-channel strategy demonstrates market reach and reduces dependency risk");
    }
    
    if (gtmReadiness >= 75 && scalabilityPotential >= 70) {
      tips.push("Strong GTM foundation - focus on execution metrics and early traction evidence to support visa scalability criterion");
    }
    
    if (marketingBudget && parseFloat(marketingBudget) < 10000) {
      tips.push("Marketing budget may be insufficient for UK market entry - endorsing bodies assess resource adequacy for growth plans");
    }
    
    tips.push("GOV.UK guidance emphasizes realistic market entry strategy - ensure timeline and resource allocation are evidence-based and achievable");
    
    return tips.slice(0, 8);
  };

  // 4-Week Action Plan
  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Finalize target customer segments with specific demographics, pain points, and buying behaviors", priority: "Critical", responsible: "Founder/Marketing Lead" },
      { week: "Week 1", action: "Complete competitive analysis and positioning strategy with differentiation framework", priority: "Critical", responsible: "Founder/Strategy" },
      { week: "Week 1-2", action: "Develop messaging framework including value proposition, key messages, and proof points", priority: "Critical", responsible: "Marketing Lead" },
      { week: "Week 2", action: "Define distribution channel strategy with investment allocation and ROI projections", priority: "High", responsible: "Sales/Marketing Lead" },
      { week: "Week 2", action: "Create pricing strategy with tier structure, competitive benchmarking, and margin analysis", priority: "High", responsible: "Founder/Finance" },
      { week: "Week 2-3", action: "Build launch timeline with phase gates, milestones, and resource requirements", priority: "High", responsible: "Operations Lead" },
      { week: "Week 3", action: "Establish success metrics and KPI framework for measuring GTM performance", priority: "High", responsible: "Founder/Analytics" },
      { week: "Week 3", action: "Develop customer acquisition playbook with tactics, scripts, and conversion funnels", priority: "Medium", responsible: "Sales Lead" },
      { week: "Week 3-4", action: "Create marketing collateral including website copy, sales deck, and campaign assets", priority: "Medium", responsible: "Marketing/Design" },
      { week: "Week 4", action: "Conduct pre-launch validation with target customers and iterate based on feedback", priority: "High", responsible: "Product/Marketing" },
      { week: "Week 4", action: "Finalize partnership strategy and initiate outreach to strategic channel partners", priority: "Medium", responsible: "Business Development" },
      { week: "Ongoing", action: "Document GTM strategy comprehensively for UK Innovator Founder Visa endorsement submission", priority: "Critical", responsible: "Founder" },
    ];
  };

  // Export Report (Comprehensive)
  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - GO-TO-MARKET STRATEGY
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Business: ${businessName || 'Not specified'}
GTM Readiness Score: ${gtmReadiness}% (${readinessGrade})

Component Scores:
  Messaging Clarity: ${messagingClarity}/100
  Channel Fit: ${channelFit}/100
  Market Positioning: ${marketPositioning}/100
  Execution Readiness: ${executionReadiness}/100
  Scalability Potential: ${scalabilityPotential}/100
  Competitive Strength: ${competitiveStrength}/100

${gtmReadiness >= 75 ? 'ASSESSMENT: Strong GTM strategy supporting UK visa scalability criterion' : gtmReadiness >= 65 ? 'ASSESSMENT: Viable GTM strategy with improvement opportunities' : 'ASSESSMENT: GTM strategy requires significant strengthening'}

MARKET ENTRY STRATEGY
${'-'.repeat(80)}

Target Market:
${targetMarket || 'Not defined'}

Customer Segments:
${customerSegments || 'Not defined'}

Value Proposition:
${valueProposition || 'Not defined'}

Competitive Advantage:
${competitiveAdvantage || 'Not defined'}

DISTRIBUTION & PRICING STRATEGY
${'-'.repeat(80)}

Distribution Channels:
${distributionChannels || 'Not defined'}

Channel Investment Allocation:
${channels.map((c, i) => `  ${i + 1}. ${c.channel || 'Unnamed Channel'}
     Investment: £${c.investment.toLocaleString()}
     Expected ROI: ${c.expectedROI}%
     Timeline: ${c.timeline}`).join('\n')}

Pricing Strategy:
${pricingStrategy || 'Not defined'}

Marketing Budget:
${marketingBudget ? `£${parseFloat(marketingBudget).toLocaleString()}` : 'Not specified'}

LAUNCH TIMELINE & PHASES
${'-'.repeat(80)}
${launchPhases.map(phase => `
${phase.phase} (Week ${phase.startWeek + 1}-${phase.startWeek + phase.duration})
Status: ${phase.status.toUpperCase()}
Key Activities:
${phase.activities.map(a => `  - ${a}`).join('\n')}
`).join('')}

Launch Timeline Overview:
${launchTimeline || 'Not defined'}

SUCCESS METRICS & KPIs
${'-'.repeat(80)}
${successMetrics || 'Not defined'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map((item, i) => `
${i + 1}. [${item.priority}] ${item.week}
   Action: ${item.action}
   Responsible: ${item.responsible}
`).join('')}

GTM READINESS ASSESSMENT
${'-'.repeat(80)}
Formula: GTM Readiness = (Messaging + Channel + Positioning + Execution + Scalability + Competitive) / 6

Detailed Component Analysis:

1. Messaging Clarity (${messagingClarity}/100):
   ${messagingClarity >= 75 ? 'STRONG - Value proposition clearly articulated' : messagingClarity >= 60 ? 'MODERATE - Messaging needs refinement for target audience' : 'WEAK - Value communication requires significant improvement'}

2. Channel Fit (${channelFit}/100):
   ${channelFit >= 75 ? 'STRONG - Distribution strategy well-aligned with market segments' : channelFit >= 60 ? 'MODERATE - Channel strategy needs optimization' : 'WEAK - Distribution approach misaligned with customer preferences'}

3. Market Positioning (${marketPositioning}/100):
   ${marketPositioning >= 75 ? 'STRONG - Clear competitive differentiation established' : marketPositioning >= 60 ? 'MODERATE - Positioning requires strengthening' : 'WEAK - Unclear market position and competitive advantage'}

4. Execution Readiness (${executionReadiness}/100):
   ${executionReadiness >= 75 ? 'STRONG - Detailed implementation roadmap with resources allocated' : executionReadiness >= 60 ? 'MODERATE - Execution plan needs more detail and milestones' : 'WEAK - Insufficient execution planning and resource definition'}

5. Scalability Potential (${scalabilityPotential}/100):
   ${scalabilityPotential >= 75 ? 'STRONG - Clear growth path supporting UK visa scalability criterion' : scalabilityPotential >= 60 ? 'MODERATE - Scalability plan needs strengthening for endorsement' : 'WEAK - Limited evidence of scaling capability - CRITICAL for visa'}

6. Competitive Strength (${competitiveStrength}/100):
   ${competitiveStrength >= 75 ? 'STRONG - Defensible competitive advantages identified' : competitiveStrength >= 60 ? 'MODERATE - Competitive position needs reinforcement' : 'WEAK - Insufficient competitive differentiation'}

Overall GTM Readiness: ${gtmReadiness}%
${gtmReadiness >= 75 ? 'VERDICT: Market-ready GTM strategy demonstrating execution capability and scalability for UK Innovator Founder Visa' : gtmReadiness >= 65 ? 'VERDICT: Viable GTM strategy requiring optimization before market entry' : 'VERDICT: GTM strategy needs substantial development before endorsement submission'}

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(80)}
Scalability Criterion Assessment:
${scalabilityPotential >= 70 && gtmReadiness >= 70 ? 
`MEETS REQUIREMENTS - GTM strategy demonstrates:
  - Clear path to market penetration
  - Scalable customer acquisition approach
  - Multi-channel distribution strategy
  - Evidence-based growth projections
  - Realistic execution timeline` :
`NEEDS IMPROVEMENT - Strengthen:
  - Market penetration strategy detail
  - Scalability evidence and projections
  - Resource allocation and timeline realism
  - Customer acquisition cost assumptions`}

Viability Criterion Assessment:
${executionReadiness >= 70 && channelFit >= 65 ?
`MEETS REQUIREMENTS - GTM plan demonstrates:
  - Viable customer acquisition strategy
  - Resource-appropriate channel selection
  - Realistic budget and timeline
  - Measurable success metrics` :
`NEEDS IMPROVEMENT - Address:
  - Execution plan detail and milestones
  - Channel strategy optimization
  - Budget adequacy for market entry
  - Success metric definition`}

ENDORSING BODY CONSIDERATIONS
${'-'.repeat(80)}
Endorsing bodies (Envestors, UKES, Innovator International, GEP) assess:

1. Market Understanding:
   - Target customer segments clearly defined
   - Market size and growth potential quantified
   - Competitive landscape thoroughly analyzed

2. Go-to-Market Execution:
   - Distribution channels appropriate for market
   - Pricing strategy competitive and sustainable
   - Marketing budget adequate for customer acquisition

3. Scalability Evidence:
   - Clear path from launch to scale
   - Resource requirements mapped to growth phases
   - Metrics for measuring success defined

4. Competitive Position:
   - Unique value proposition articulated
   - Defensible competitive advantages identified
   - Market positioning strategy coherent

Current Status: ${gtmReadiness >= 75 ? 'STRONG position for endorsement' : gtmReadiness >= 65 ? 'VIABLE with optimization needed' : 'REQUIRES significant strengthening'}

NEXT STEPS
${'-'.repeat(80)}
1. Address any critical gaps identified in Smart Recommendations
2. Complete 4-week action plan to strengthen GTM components
3. Gather supporting evidence: market research, customer validation, pilot results
4. Document assumptions and validate with UK market data
5. Prepare GTM section of business plan for endorsement submission
6. Consider advisor review for market entry strategy validation

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 - For endorsement application preparation
Reference: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtm-strategy-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart Data Generators
  const getRadarData = () => [
    { metric: 'Messaging', score: messagingClarity, fullMark: 100 },
    { metric: 'Channels', score: channelFit, fullMark: 100 },
    { metric: 'Positioning', score: marketPositioning, fullMark: 100 },
    { metric: 'Execution', score: executionReadiness, fullMark: 100 },
    { metric: 'Scalability', score: scalabilityPotential, fullMark: 100 },
    { metric: 'Competitive', score: competitiveStrength, fullMark: 100 },
  ];

  const getComponentScores = () => [
    { component: 'Messaging', score: messagingClarity },
    { component: 'Channels', score: channelFit },
    { component: 'Positioning', score: marketPositioning },
    { component: 'Execution', score: executionReadiness },
    { component: 'Scalability', score: scalabilityPotential },
    { component: 'Competitive', score: competitiveStrength },
  ];

  const getTimelineGanttData = () => {
    return launchPhases.map(phase => ({
      phase: phase.phase,
      start: phase.startWeek,
      duration: phase.duration,
      end: phase.startWeek + phase.duration,
    }));
  };

  const getRevenueProjection = () => [
    { month: 'Month 1', revenue: 5000, customers: 10, target: 8000 },
    { month: 'Month 2', revenue: 12000, customers: 24, target: 15000 },
    { month: 'Month 3', revenue: 22000, customers: 45, target: 25000 },
    { month: 'Month 4', revenue: 35000, customers: 68, target: 40000 },
    { month: 'Month 5', revenue: 52000, customers: 95, target: 60000 },
    { month: 'Month 6', revenue: 75000, customers: 130, target: 85000 },
    { month: 'Month 7', revenue: 98000, customers: 165, target: 110000 },
    { month: 'Month 8', revenue: 125000, customers: 205, target: 140000 },
    { month: 'Month 9', revenue: 158000, customers: 250, target: 175000 },
    { month: 'Month 10', revenue: 195000, customers: 300, target: 215000 },
    { month: 'Month 11', revenue: 238000, customers: 355, target: 260000 },
    { month: 'Month 12', revenue: 285000, customers: 415, target: 310000 },
  ];

  const COLORS = {
    primary: '#005EB8',
    secondary: '#41B6E6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold mb-2" data-testid="heading-gtm-plan">Go-to-Market Strategy</h1>
                <p className="text-lg text-muted-foreground">Build scalable market entry plan for UK Innovator Founder Visa</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
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
                  <Rocket className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Atlas, our Growth Expert, helps you build a compelling go-to-market strategy for your visa application.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Define your target market and value proposition</li>
                    <li>Plan pricing and distribution channels</li>
                    <li>Set launch timeline and success metrics</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the GTM form when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="gtm-plan"
            toolName="Go-to-Market Strategy"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
          />

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">GTM Readiness</span>
                </div>
                <p className="text-xl font-bold" data-testid="text-gtm-readiness">{gtmReadiness}%</p>
                <p className="text-xs text-muted-foreground mt-1">{readinessGrade}</p>
                <Progress value={gtmReadiness} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Scalability</span>
                </div>
                <p className="text-xl font-bold" data-testid="text-scalability-score">{scalabilityPotential}</p>
                <p className="text-xs text-muted-foreground mt-1">Visa criterion</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Execution</span>
                </div>
                <p className="text-xl font-bold" data-testid="text-execution-score">{executionReadiness}</p>
                <p className="text-xs text-muted-foreground mt-1">Implementation readiness</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Positioning</span>
                </div>
                <p className="text-xl font-bold" data-testid="text-positioning-score">{marketPositioning}</p>
                <p className="text-xs text-muted-foreground mt-1">Market clarity</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Alerts */}
          {gtmReadiness < 65 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription data-testid="alert-low-readiness">
                GTM readiness below 65% - strengthen strategy components before market entry. Focus on scalability criterion for visa approval.
              </AlertDescription>
            </Alert>
          )}

          {scalabilityPotential < 70 && gtmReadiness >= 65 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription data-testid="alert-scalability-warning">
                Scalability score below 70% - UK Innovator Founder Visa emphasizes growth potential. Strengthen market expansion strategy.
              </AlertDescription>
            </Alert>
          )}

          {gtmReadiness >= 75 && scalabilityPotential >= 70 && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400" data-testid="alert-strong-gtm">
                Strong GTM strategy supporting scalability and viability criteria for UK Innovator Founder Visa endorsement.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-gtm-plan">
              <TabsTrigger value="strategy" data-testid="tab-strategy">Strategy</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            {/* Tab 1: Strategy Definition */}
            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Entry Strategy</CardTitle>
                  <CardDescription>Define your go-to-market approach for UK Innovator Founder Visa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your registered business name"
                        data-testid="input-business-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketing-budget">Marketing Budget (£)</Label>
                      <Input
                        id="marketing-budget"
                        type="number"
                        value={marketingBudget}
                        onChange={(e) => setMarketingBudget(e.target.value)}
                        placeholder="e.g., 50000"
                        data-testid="input-marketing-budget"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-market">Target Market</Label>
                    <Textarea
                      id="target-market"
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      placeholder="Define your primary target market, geographic focus, and total addressable market (TAM)"
                      rows={3}
                      data-testid="textarea-target-market"
                    />
                    <p className="text-xs text-muted-foreground">{targetMarket.length} characters (recommended: 100+)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-segments">Customer Segments</Label>
                    <Textarea
                      id="customer-segments"
                      value={customerSegments}
                      onChange={(e) => setCustomerSegments(e.target.value)}
                      placeholder="Describe specific customer segments: demographics, pain points, buying behaviors"
                      rows={3}
                      data-testid="textarea-customer-segments"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value-proposition">Value Proposition</Label>
                    <Textarea
                      id="value-proposition"
                      value={valueProposition}
                      onChange={(e) => setValueProposition(e.target.value)}
                      placeholder="What unique value do you deliver? What problem do you solve better than alternatives?"
                      rows={3}
                      data-testid="textarea-value-proposition"
                    />
                    <p className="text-xs text-muted-foreground">{valueProposition.length} characters (recommended: 100+)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competitive-advantage">Competitive Advantage</Label>
                    <Textarea
                      id="competitive-advantage"
                      value={competitiveAdvantage}
                      onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                      placeholder="What defensible advantages differentiate you from competitors? Technology, IP, partnerships, expertise?"
                      rows={3}
                      data-testid="textarea-competitive-advantage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distribution-channels">Distribution Channels</Label>
                    <Textarea
                      id="distribution-channels"
                      value={distributionChannels}
                      onChange={(e) => setDistributionChannels(e.target.value)}
                      placeholder="How will you reach customers? Direct sales, online, partners, marketplaces, retail?"
                      rows={3}
                      data-testid="textarea-distribution-channels"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricing-strategy">Pricing Strategy</Label>
                    <Textarea
                      id="pricing-strategy"
                      value={pricingStrategy}
                      onChange={(e) => setPricingStrategy(e.target.value)}
                      placeholder="Define pricing model, tiers, and competitive positioning (e.g., premium, value, freemium)"
                      rows={3}
                      data-testid="textarea-pricing-strategy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="success-metrics">Success Metrics & KPIs</Label>
                    <Textarea
                      id="success-metrics"
                      value={successMetrics}
                      onChange={(e) => setSuccessMetrics(e.target.value)}
                      placeholder="Define measurable success criteria: customer acquisition cost, lifetime value, conversion rates, revenue targets"
                      rows={3}
                      data-testid="textarea-success-metrics"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launch-timeline">Launch Timeline Overview</Label>
                    <Textarea
                      id="launch-timeline"
                      value={launchTimeline}
                      onChange={(e) => setLaunchTimeline(e.target.value)}
                      placeholder="High-level timeline from pre-launch to market entry to scaling phase"
                      rows={3}
                      data-testid="textarea-launch-timeline"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Channel Investment Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Investment Strategy</CardTitle>
                  <CardDescription>Allocate resources across distribution channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Define investment and expected ROI for each channel</p>
                    <Button onClick={addChannel} size="sm" data-testid="button-add-channel">
                      Add Channel
                    </Button>
                  </div>

                  {channels.map((channel, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`channel-name-${index}`}>Channel Name</Label>
                          <Input
                            id={`channel-name-${index}`}
                            value={channel.channel}
                            onChange={(e) => updateChannel(index, 'channel', e.target.value)}
                            placeholder="e.g., Direct Sales"
                            data-testid={`input-channel-name-${index}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`channel-investment-${index}`}>Investment (£)</Label>
                          <Input
                            id={`channel-investment-${index}`}
                            type="number"
                            value={channel.investment}
                            onChange={(e) => updateChannel(index, 'investment', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-channel-investment-${index}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`channel-roi-${index}`}>Expected ROI (%)</Label>
                          <Input
                            id={`channel-roi-${index}`}
                            type="number"
                            value={channel.expectedROI}
                            onChange={(e) => updateChannel(index, 'expectedROI', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            data-testid={`input-channel-roi-${index}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`channel-timeline-${index}`}>Timeline</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`channel-timeline-${index}`}
                              value={channel.timeline}
                              onChange={(e) => updateChannel(index, 'timeline', e.target.value)}
                              placeholder="Month 1-3"
                              data-testid={`input-channel-timeline-${index}`}
                            />
                            {channels.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChannel(index)}
                                data-testid={`button-remove-channel-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium">Total Channel Investment: £{channels.reduce((sum, c) => sum + c.investment, 0).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* GTM Component Scoring */}
              <Card>
                <CardHeader>
                  <CardTitle>GTM Component Assessment</CardTitle>
                  <CardDescription>Rate each component of your go-to-market strategy (0-100)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Messaging Clarity</Label>
                        <span className="text-sm font-medium" data-testid="text-messaging-clarity">{messagingClarity}</span>
                      </div>
                      <Slider
                        value={[messagingClarity]}
                        onValueChange={(value) => setMessagingClarity(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-messaging-clarity"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How clear and compelling is your value message to target customers?</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Channel Fit</Label>
                        <span className="text-sm font-medium" data-testid="text-channel-fit">{channelFit}</span>
                      </div>
                      <Slider
                        value={[channelFit]}
                        onValueChange={(value) => setChannelFit(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-channel-fit"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How well do your distribution channels align with customer preferences?</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Market Positioning</Label>
                        <span className="text-sm font-medium" data-testid="text-market-positioning">{marketPositioning}</span>
                      </div>
                      <Slider
                        value={[marketPositioning]}
                        onValueChange={(value) => setMarketPositioning(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-market-positioning"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How clearly differentiated is your competitive position?</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Execution Readiness</Label>
                        <span className="text-sm font-medium" data-testid="text-execution-readiness">{executionReadiness}</span>
                      </div>
                      <Slider
                        value={[executionReadiness]}
                        onValueChange={(value) => setExecutionReadiness(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-execution-readiness"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How detailed and actionable is your implementation roadmap?</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Scalability Potential</Label>
                        <span className="text-sm font-medium" data-testid="text-scalability-potential">{scalabilityPotential}</span>
                      </div>
                      <Slider
                        value={[scalabilityPotential]}
                        onValueChange={(value) => setScalabilityPotential(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-scalability-potential"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How clear is your path to scaling customer acquisition and revenue?</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Competitive Strength</Label>
                        <span className="text-sm font-medium" data-testid="text-competitive-strength">{competitiveStrength}</span>
                      </div>
                      <Slider
                        value={[competitiveStrength]}
                        onValueChange={(value) => setCompetitiveStrength(value[0])}
                        max={100}
                        step={1}
                        data-testid="slider-competitive-strength"
                      />
                      <p className="text-xs text-muted-foreground mt-1">How defensible are your competitive advantages?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Analysis & Charts */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>GTM Strategy Radar</CardTitle>
                    <CardDescription>Multi-dimensional strategy assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Current Score"
                          dataKey="score"
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                          fillOpacity={0.5}
                        />
                        <Radar
                          name="Target (75)"
                          dataKey="fullMark"
                          stroke={COLORS.secondary}
                          fill={COLORS.secondary}
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Scores</CardTitle>
                    <CardDescription>Individual GTM element performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getComponentScores()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill={COLORS.primary}>
                          {getComponentScores().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 75 ? COLORS.success : entry.score >= 60 ? COLORS.warning : COLORS.danger} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Gantt Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Launch Timeline (Gantt Chart)</CardTitle>
                  <CardDescription>Market entry phases and duration</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={getTimelineGanttData()}
                      layout="horizontal"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 28]} label={{ value: 'Weeks', position: 'insideBottom', offset: -5 }} />
                      <YAxis type="category" dataKey="phase" width={100} />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name === 'start') return [`Week ${value}`, 'Start'];
                          if (name === 'duration') return [`${value} weeks`, 'Duration'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="start" stackId="a" fill="transparent" />
                      <Bar dataKey="duration" stackId="a" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {launchPhases.map((phase, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{phase.phase}:</span> {phase.activities.join(', ')}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Projection Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>12-Month Revenue Projection</CardTitle>
                  <CardDescription>Expected revenue growth trajectory with targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={getRevenueProjection()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" label={{ value: 'Revenue (£)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Customers', angle: 90, position: 'insideRight' }} />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="target"
                        fill={COLORS.secondary}
                        stroke={COLORS.secondary}
                        fillOpacity={0.2}
                        name="Target Revenue"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        name="Projected Revenue"
                        dot={{ fill: COLORS.primary, r: 4 }}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="customers"
                        fill={COLORS.success}
                        fillOpacity={0.6}
                        name="Customer Count"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Channel Investment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Investment Distribution</CardTitle>
                  <CardDescription>Budget allocation across distribution channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {channels.filter(c => c.investment > 0).map((channel, index) => {
                      const totalInvestment = channels.reduce((sum, c) => sum + c.investment, 0);
                      const percentage = totalInvestment > 0 ? (channel.investment / totalInvestment * 100) : 0;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{channel.channel || 'Unnamed Channel'}</span>
                            <span className="text-sm text-muted-foreground">
                              £{channel.investment.toLocaleString()} ({percentage.toFixed(1)}%) - ROI: {channel.expectedROI}%
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Smart Tips */}
            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights to strengthen your GTM strategy for UK visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} className={index === 0 && gtmReadiness < 70 ? "border-orange-500" : ""}>
                        <div className="flex items-start gap-3">
                          {tip.includes('CRITICAL') || tip.includes('GTM readiness below') ? (
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          ) : gtmReadiness >= 75 && tip.includes('Strong GTM') ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">Recommendation {index + 1}</p>
                            <p className="text-sm text-muted-foreground mt-1" data-testid={`tip-${index}`}>{tip}</p>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Innovator Founder Visa - Scalability Criterion</CardTitle>
                  <CardDescription>How your GTM strategy aligns with visa requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clear Path to Market Penetration</p>
                        <p className="text-sm text-muted-foreground">GTM strategy must demonstrate realistic route to significant market share</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Your Status: </span>
                          {marketPositioning >= 70 ? 'Strong positioning evidence' : 'Strengthen market positioning strategy'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Scalable Customer Acquisition</p>
                        <p className="text-sm text-muted-foreground">Demonstrate ability to acquire customers efficiently at scale</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Your Status: </span>
                          {channelFit >= 70 ? 'Strong channel strategy' : 'Optimize distribution channels for scalability'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Multi-Channel Distribution</p>
                        <p className="text-sm text-muted-foreground">Diversified channels reduce risk and demonstrate market reach</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Your Status: </span>
                          {channels.filter(c => c.investment > 0).length >= 2 ? `${channels.filter(c => c.investment > 0).length} active channels` : 'Add more distribution channels'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Evidence-Based Timeline</p>
                        <p className="text-sm text-muted-foreground">Realistic execution timeline with measurable milestones</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Your Status: </span>
                          {executionReadiness >= 70 ? 'Detailed execution roadmap' : 'Add more implementation detail'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Measurable Success Criteria</p>
                        <p className="text-sm text-muted-foreground">Clear KPIs and metrics to track market entry progress</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Your Status: </span>
                          {successMetrics && successMetrics.length > 50 ? 'KPIs defined' : 'Define specific success metrics'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="font-medium mb-2">Overall Visa Alignment</p>
                      <Progress value={gtmReadiness} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {gtmReadiness >= 75 && scalabilityPotential >= 70 ? (
                          'Your GTM strategy demonstrates strong alignment with UK Innovator Founder Visa scalability criterion. Focus on documenting evidence and early traction.'
                        ) : gtmReadiness >= 65 ? (
                          'Your GTM strategy meets basic viability requirements. Strengthen scalability components (aim for 75+) to improve endorsement prospects.'
                        ) : (
                          'Your GTM strategy needs significant development. Focus on clear market positioning, scalable channels, and detailed execution roadmap.'
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Action Plan */}
            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week GTM Action Plan</CardTitle>
                  <CardDescription>Prioritized implementation roadmap for market entry preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover-elevate"
                        data-testid={`action-item-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{item.week}</span>
                            </div>
                            <p className="text-sm mb-1">{item.action}</p>
                            <p className="text-xs text-muted-foreground">Responsible: {item.responsible}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Implementation Notes</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Complete all Critical priority actions in Weeks 1-2 for strong foundation</li>
                      <li>High priority actions strengthen GTM credibility for endorsing bodies</li>
                      <li>Document all strategy decisions and assumptions for visa application</li>
                      <li>Maintain evidence trail: market research, customer validation, pilot results</li>
                      <li>Review with business advisor or mentor before endorsement submission</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Milestones</CardTitle>
                  <CardDescription>Key achievements to target during GTM execution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Pre-Launch Validation (Month 0-1)</p>
                        <p className="text-sm text-muted-foreground">Complete customer discovery, validate value proposition, finalize positioning</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Soft Launch (Month 1-2)</p>
                        <p className="text-sm text-muted-foreground">Acquire first 10-20 customers, validate pricing, refine messaging</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Market Entry (Month 2-4)</p>
                        <p className="text-sm text-muted-foreground">Full product launch, activate all channels, achieve £10k+ MRR</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Scale & Optimize (Month 4-6)</p>
                        <p className="text-sm text-muted-foreground">Optimize conversion funnels, scale winning channels, expand customer base</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">5</span>
                      </div>
                      <div>
                        <p className="font-medium">Growth Phase (Month 6-12)</p>
                        <p className="text-sm text-muted-foreground">Achieve profitability, demonstrate scalability, prepare for expansion</p>
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
