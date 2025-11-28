import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, Lightbulb } from "lucide-react";
import {
  BarChart, Bar, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// UK Innovator Founder Visa Context (November 2025)
// Innovation Criterion: Market gaps demonstrate clear innovation opportunity
// Viability Criterion: Addressing underserved segments validates business model
// Scalability Criterion: White space opportunities show growth potential

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'market-gap',
  toolName: 'Market Gap Analysis',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Identifying market gaps is essential for demonstrating innovation to endorsers. Let me help you analyze opportunities in your market. Ready to uncover white space?",
  questions: [
    {
      id: 'gap-name',
      question: "What is the main market gap you've identified? Give it a clear, descriptive name.",
      hint: "E.g., 'SME Digital Transformation Gap', 'Affordable Legal Tech Gap'",
      fieldKey: 'gapName',
      required: true
    },
    {
      id: 'gap-description',
      question: "Describe this market gap in detail. What need is currently unmet or underserved?",
      hint: "Be specific about who is affected and why current solutions fall short",
      fieldKey: 'gapDescription'
    },
    {
      id: 'gap-severity',
      question: "How severe is this gap? Rate from 1 (minor inconvenience) to 10 (critical pain point).",
      hint: "Higher severity gaps often indicate better opportunities",
      fieldKey: 'gapSeverity'
    },
    {
      id: 'opportunity-size',
      question: "What is the estimated market opportunity in millions GBP?",
      hint: "Use industry reports, government statistics, or bottom-up calculations",
      fieldKey: 'opportunitySize'
    },
    {
      id: 'competitive-intensity',
      question: "How competitive is addressing this gap? Rate 1 (no competition) to 10 (highly competitive).",
      hint: "Lower competition may indicate an overlooked opportunity",
      fieldKey: 'competitiveIntensity'
    },
    {
      id: 'your-differentiator',
      question: "What is your unique approach to addressing this gap?",
      hint: "This is your competitive advantage - be specific",
      fieldKey: 'yourDifferentiator'
    },
    {
      id: 'underserved-segments',
      question: "Which customer segments are most underserved by current solutions?",
      hint: "Specific segments help focus your go-to-market strategy",
      fieldKey: 'underservedSegments'
    }
  ],
  completionMessage: "Great analysis! I've captured your market gap insights. I'm now populating the gap analyzer with your data. You can add more gaps and adjust the competitive landscape metrics."
};

type MarketGap = {
  id: string;
  name: string;
  description: string;
  severity: number; // 1-10 scale: how critical is this gap
  opportunitySize: number; // £ value in millions
  competitiveIntensity: number; // 1-10 scale: how competitive is addressing this gap
  innovationPotential: number; // 1-10 scale: innovation opportunity
};

export default function MarketGap() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('market-gap-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [gaps, setGaps] = useState<MarketGap[]>([
    { 
      id: '1', 
      name: 'SME Digital Transformation Gap', 
      description: 'Small businesses lack affordable, integrated digital solutions',
      severity: 8, 
      opportunitySize: 150, 
      competitiveIntensity: 5,
      innovationPotential: 7
    }
  ]);
  
  // Competitive landscape inputs
  const [marketLeaderShare, setMarketLeaderShare] = useState(25); // % market share
  const [top5CombinedShare, setTop5CombinedShare] = useState(60); // % market share
  const [averageProductAge, setAverageProductAge] = useState(5); // years
  const [customerSatisfaction, setCustomerSatisfaction] = useState(60); // % satisfaction
  
  // Market positioning
  const [yourDifferentiator, setYourDifferentiator] = useState("AI-powered automation, SMB-focused pricing, no-code interface");
  const [unmetNeeds, setUnmetNeeds] = useState("Affordable enterprise features, easy integration, UK compliance");
  const [underservedSegments, setUnderservedSegments] = useState("UK SMBs 10-50 employees, non-tech savvy founders, regulated industries");
  const [whiteSpaceOpportunity, setWhiteSpaceOpportunity] = useState("AI-enabled workflow automation for UK SMBs with built-in compliance");
  
  const [activeTab, setActiveTab] = useState('analyzer');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('market-gap-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('market-gap-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.gapName || answers.gapDescription) {
      const newGap: MarketGap = {
        id: Date.now().toString(),
        name: answers.gapName || 'New Gap',
        description: answers.gapDescription || '',
        severity: answers.gapSeverity ? parseInt(answers.gapSeverity) || 7 : 7,
        opportunitySize: answers.opportunitySize ? parseInt(answers.opportunitySize) || 100 : 100,
        competitiveIntensity: answers.competitiveIntensity ? parseInt(answers.competitiveIntensity) || 5 : 5,
        innovationPotential: 7
      };
      setGaps(prev => prev.length === 1 && prev[0].name === 'SME Digital Transformation Gap' ? [newGap] : [...prev, newGap]);
    }
    if (answers.yourDifferentiator) setYourDifferentiator(answers.yourDifferentiator);
    if (answers.underservedSegments) setUnderservedSegments(answers.underservedSegments);
    setMode('traditional');
  };

  // Advanced: Market Gap Opportunity Score
  // Formula: Weighted average of gap severity, opportunity size, and innovation potential
  const getGapOpportunityScore = (): { score: number; grade: string } => {
    if (gaps.length === 0) return { score: 0, grade: 'F - No Gaps Identified' };
    
    // Total opportunity size (in millions)
    const totalOpportunity = gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0);
    
    // Average severity (weighted by opportunity size)
    const weightedSeverity = gaps.reduce((sum, gap) => 
      sum + (gap.severity * gap.opportunitySize), 0) / totalOpportunity;
    
    // Average innovation potential (weighted by opportunity size)
    const weightedInnovation = gaps.reduce((sum, gap) => 
      sum + (gap.innovationPotential * gap.opportunitySize), 0) / totalOpportunity;
    
    // Market fragmentation score (100 - top 5 share = more opportunity)
    const fragmentationScore = (100 - top5CombinedShare) * 0.8;
    
    // Product aging score (older products = more opportunity to innovate)
    const agingScore = Math.min(averageProductAge * 15, 100);
    
    // Customer dissatisfaction score (lower satisfaction = more opportunity)
    const dissatisfactionScore = (100 - customerSatisfaction) * 0.9;
    
    // Final score calculation (0-100)
    let score = (
      (weightedSeverity / 10 * 25) +  // Gap severity: 25%
      (Math.min(totalOpportunity / 10, 100) * 0.25) +  // Opportunity size: 25%
      (weightedInnovation / 10 * 20) +  // Innovation potential: 20%
      (fragmentationScore * 0.15) +  // Market fragmentation: 15%
      (agingScore * 0.08) +  // Product aging: 8%
      (dissatisfactionScore * 0.07)  // Customer dissatisfaction: 7%
    );
    
    score = Math.min(Math.round(score), 100);
    
    let grade = 'F - Poor Opportunity';
    if (score >= 80) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Strong';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Weak';
    
    return { score, grade };
  };

  // Advanced: Innovation Criterion Alignment
  const getInnovationAlignment = (): { aligned: boolean; strengths: string[]; weaknesses: string[] } => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    const totalOpportunity = gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0);
    const avgInnovation = gaps.length > 0 
      ? gaps.reduce((sum, gap) => sum + gap.innovationPotential, 0) / gaps.length 
      : 0;
    
    if (totalOpportunity >= 50) {
      strengths.push("Significant market opportunity (£" + totalOpportunity + "M) demonstrates clear innovation potential");
    } else {
      weaknesses.push("Total opportunity below £50M may not demonstrate sufficient innovation impact");
    }
    
    if (avgInnovation >= 7) {
      strengths.push("High innovation potential across identified gaps - strong UK Innovator Founder criterion alignment");
    } else if (avgInnovation >= 5) {
      strengths.push("Moderate innovation potential - enhance differentiation for stronger endorsement case");
    } else {
      weaknesses.push("Low innovation scores - focus on breakthrough solutions to meet innovation criterion");
    }
    
    if (top5CombinedShare < 50) {
      strengths.push("Fragmented market with no dominant player - opportunity for innovative disruption");
    }
    
    if (averageProductAge >= 5) {
      strengths.push("Aging competitor products (" + averageProductAge + " years avg) create innovation opportunity");
    }
    
    if (customerSatisfaction < 70) {
      strengths.push("Low customer satisfaction (" + customerSatisfaction + "%) validates need for innovative solution");
    }
    
    if (gaps.length >= 3) {
      strengths.push("Multiple market gaps identified - demonstrates comprehensive market understanding");
    } else if (gaps.length < 2) {
      weaknesses.push("Limited gaps identified - conduct deeper market research to find additional opportunities");
    }
    
    const aligned = strengths.length >= 3 && totalOpportunity >= 30;
    return { aligned, strengths, weaknesses };
  };

  const addGap = () => {
    const newId = (gaps.length + 1).toString();
    setGaps([...gaps, { 
      id: newId,
      name: '', 
      description: '',
      severity: 5, 
      opportunitySize: 10, 
      competitiveIntensity: 5,
      innovationPotential: 5
    }]);
  };

  const updateGap = (id: string, field: keyof MarketGap, value: any) => {
    const updated = gaps.map(gap => 
      gap.id === id ? { ...gap, [field]: value } : gap
    );
    setGaps(updated);
  };

  const removeGap = (id: string) => {
    setGaps(gaps.filter(gap => gap.id !== id));
  };

  const getSerializedState = () => {
    return {
      gaps,
      marketLeaderShare,
      top5CombinedShare,
      averageProductAge,
      customerSatisfaction,
      yourDifferentiator,
      unmetNeeds,
      underservedSegments,
      whiteSpaceOpportunity,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('gaps' in state) setGaps(state.gaps);
    if ('marketLeaderShare' in state) setMarketLeaderShare(state.marketLeaderShare);
    if ('top5CombinedShare' in state) setTop5CombinedShare(state.top5CombinedShare);
    if ('averageProductAge' in state) setAverageProductAge(state.averageProductAge);
    if ('customerSatisfaction' in state) setCustomerSatisfaction(state.customerSatisfaction);
    if ('yourDifferentiator' in state) setYourDifferentiator(state.yourDifferentiator);
    if ('unmetNeeds' in state) setUnmetNeeds(state.unmetNeeds);
    if ('underservedSegments' in state) setUnderservedSegments(state.underservedSegments);
    if ('whiteSpaceOpportunity' in state) setWhiteSpaceOpportunity(state.whiteSpaceOpportunity);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('market-gap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('market-gap-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('market-gap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const { score } = getGapOpportunityScore();
    const { aligned, weaknesses } = getInnovationAlignment();
    const totalOpportunity = gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0);
    
    if (gaps.length === 0) {
      tips.push("CRITICAL: No market gaps identified. Conduct comprehensive competitor and customer research to discover unmet needs, underserved segments, and white space opportunities.");
      return tips;
    }
    
    if (gaps.length === 1) {
      tips.push("Single market gap identified. Strengthen your case by identifying 3-5 distinct gaps to demonstrate comprehensive market understanding for UK Innovator Founder endorsement.");
    }
    
    if (totalOpportunity < 50) {
      tips.push("Total opportunity (£" + totalOpportunity.toFixed(0) + "M) is below recommended £50M minimum. Identify larger gaps or expand scope to demonstrate scalability potential.");
    }
    
    if (totalOpportunity >= 100) {
      tips.push("Excellent total opportunity (£" + totalOpportunity.toFixed(0) + "M). This strongly supports the scalability criterion for UK Innovator Founder visa endorsement.");
    }
    
    const highSeverityGaps = gaps.filter(g => g.severity >= 7);
    if (highSeverityGaps.length === 0) {
      tips.push("No high-severity gaps (7+/10) identified. Focus on critical market pain points that create urgent demand for innovative solutions.");
    } else if (highSeverityGaps.length >= 2) {
      tips.push("Multiple high-severity gaps identified - this demonstrates strong market need and validates your innovation's urgency.");
    }
    
    const avgInnovation = gaps.reduce((sum, gap) => sum + gap.innovationPotential, 0) / gaps.length;
    if (avgInnovation < 6) {
      tips.push("Average innovation potential is " + avgInnovation.toFixed(1) + "/10. Emphasize breakthrough features, novel technology, or unique approaches to strengthen innovation criterion.");
    }
    
    if (top5CombinedShare > 70) {
      tips.push("Market concentration is high (" + top5CombinedShare + "% held by top 5). Document clear differentiation strategy and barriers to entry you've overcome for endorsing bodies.");
    }
    
    if (top5CombinedShare < 40) {
      tips.push("Highly fragmented market (" + top5CombinedShare + "% top 5 share) presents excellent opportunity for consolidation through innovative platform.");
    }
    
    if (averageProductAge >= 7) {
      tips.push("Competitor products averaging " + averageProductAge + " years old creates strong modernization opportunity. Highlight next-generation features in your innovation narrative.");
    }
    
    if (customerSatisfaction < 60) {
      tips.push("Low customer satisfaction (" + customerSatisfaction + "%) is strong market signal. Document specific pain points you're solving for endorsement evidence.");
    }
    
    if (!aligned) {
      tips.push("Innovation criterion alignment needs strengthening. " + (weaknesses.length > 0 ? weaknesses[0] : "Review gaps and increase opportunity sizing."));
    }
    
    if (score >= 75) {
      tips.push("Strong gap opportunity score (" + score + "%). This demonstrates clear market positioning for UK Innovator Founder visa innovation and viability criteria.");
    }
    
    if (unmetNeeds.length < 30) {
      tips.push("Elaborate on unmet needs with specific customer research, survey data, or interview quotes. Endorsing bodies expect evidence-based gap analysis.");
    }
    
    if (underservedSegments.length < 30) {
      tips.push("Define underserved segments with demographic, firmographic, and psychographic details. Include addressable market size per segment.");
    }
    
    const highCompetitionGaps = gaps.filter(g => g.competitiveIntensity >= 7);
    if (highCompetitionGaps.length > gaps.length / 2) {
      tips.push("Over half your identified gaps face high competition (7+/10). Consider pivoting to less contested white space opportunities.");
    }
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct competitor product teardown - analyze top 5-10 competitors' features, pricing, customer complaints", priority: "Critical" },
      { week: "Week 1", action: "Survey or interview 15-25 potential customers to identify pain points and unmet needs", priority: "Critical" },
      { week: "Week 1-2", action: "Analyze customer review data (G2, Capterra, Trustpilot) to identify recurring complaints and gaps", priority: "High" },
      { week: "Week 2", action: "Map competitive landscape - create positioning matrix showing competitors' strengths and gaps", priority: "Critical" },
      { week: "Week 2", action: "Identify 3-5 distinct market gaps with severity ratings and opportunity sizing", priority: "Critical" },
      { week: "Week 2-3", action: "Document underserved segments with demographics, size, and accessibility analysis", priority: "High" },
      { week: "Week 3", action: "Define white space opportunities where no adequate solution exists today", priority: "High" },
      { week: "Week 3", action: "Calculate addressable opportunity size (£) for each identified gap using TAM/SAM methodology", priority: "Critical" },
      { week: "Week 3-4", action: "Validate gaps with industry experts, advisors, or potential customers (minimum 10 conversations)", priority: "High" },
      { week: "Week 4", action: "Prepare innovation differentiation narrative - how your solution uniquely fills identified gaps", priority: "Critical" },
      { week: "Week 4", action: "Compile gap analysis evidence pack for endorsing bodies (research citations, customer quotes, data)", priority: "High" },
      { week: "Week 4", action: "Create competitive positioning document showing clear white space your innovation occupies", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const { score, grade } = getGapOpportunityScore();
    const { aligned, strengths, weaknesses } = getInnovationAlignment();
    const totalOpportunity = gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0);
    const avgSeverity = gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap.severity, 0) / gaps.length : 0;
    const avgInnovation = gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap.innovationPotential, 0) / gaps.length : 0;
    
    const content = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE MARKET GAP ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}

${'='.repeat(70)}
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
${'='.repeat(70)}
Gap Opportunity Score: ${score}/100 (${grade})
Total Market Opportunity: £${totalOpportunity.toFixed(0)}M
Identified Market Gaps: ${gaps.length}
Average Gap Severity: ${avgSeverity.toFixed(1)}/10
Average Innovation Potential: ${avgInnovation.toFixed(1)}/10
Innovation Criterion Alignment: ${aligned ? 'STRONG' : 'NEEDS STRENGTHENING'}

${score >= 75 ? 'EXCELLENT GAP ANALYSIS - Strong innovation and viability case for UK Innovator Founder visa' : score >= 60 ? 'GOOD GAP ANALYSIS - Strengthen opportunity sizing and innovation potential' : 'GAP ANALYSIS NEEDS IMPROVEMENT - Conduct deeper market research'}

${'='.repeat(70)}
MARKET GAP OPPORTUNITY SCORE CALCULATION
${'='.repeat(70)}
Formula: Score = Severity (25%) + Opportunity Size (25%) + Innovation (20%) + 
         Fragmentation (15%) + Product Aging (8%) + Dissatisfaction (7%)

Component 1: Weighted Gap Severity
  Input: ${gaps.length} gaps with average severity ${avgSeverity.toFixed(1)}/10
  Calculation: (Weighted Severity / 10) × 25
  Component Score: ${((avgSeverity / 10) * 25).toFixed(1)}/25 points
  ${avgSeverity >= 7 ? 'High-severity gaps demonstrate urgent market need' : 'Consider focusing on more critical pain points'}

Component 2: Total Opportunity Size
  Input: £${totalOpportunity.toFixed(0)}M total addressable opportunity
  Calculation: min(£${totalOpportunity.toFixed(0)}M / £10M, 100) × 0.25
  Component Score: ${(Math.min(totalOpportunity / 10, 100) * 0.25).toFixed(1)}/25 points
  ${totalOpportunity >= 100 ? 'Large opportunity demonstrates strong scalability' : 'Opportunity sizing could be expanded'}

Component 3: Weighted Innovation Potential
  Input: Average innovation potential ${avgInnovation.toFixed(1)}/10
  Calculation: (Weighted Innovation / 10) × 20
  Component Score: ${((avgInnovation / 10) * 20).toFixed(1)}/20 points
  ${avgInnovation >= 7 ? 'Strong innovation alignment with UK Innovator Founder criterion' : 'Enhance innovation differentiation'}

Component 4: Market Fragmentation Score
  Input: Top 5 competitors hold ${top5CombinedShare}% market share
  Calculation: (100 - ${top5CombinedShare}) × 0.8 × 0.15
  Component Score: ${(((100 - top5CombinedShare) * 0.8) * 0.15).toFixed(1)}/15 points
  ${top5CombinedShare < 50 ? 'Fragmented market offers disruption opportunity' : 'Concentrated market requires strong differentiation'}

Component 5: Product Aging Score
  Input: Competitor products average ${averageProductAge} years old
  Calculation: min(${averageProductAge} × 15, 100) × 0.08
  Component Score: ${(Math.min(averageProductAge * 15, 100) * 0.08).toFixed(1)}/8 points
  ${averageProductAge >= 5 ? 'Aging products create modernization opportunity' : 'Market has recent solutions'}

Component 6: Customer Dissatisfaction Score
  Input: Average customer satisfaction ${customerSatisfaction}%
  Calculation: (100 - ${customerSatisfaction}) × 0.9 × 0.07
  Component Score: ${(((100 - customerSatisfaction) * 0.9) * 0.07).toFixed(1)}/7 points
  ${customerSatisfaction < 70 ? 'Low satisfaction validates innovation need' : 'Market is moderately satisfied'}

Final Gap Opportunity Score: ${score}/100 (${grade})

${'='.repeat(70)}
IDENTIFIED MARKET GAPS
${'='.repeat(70)}
${gaps.map((gap, i) => `
Gap ${i + 1}: ${gap.name || 'Unnamed Gap'}
Description: ${gap.description || 'No description provided'}
Severity: ${gap.severity}/10 ${gap.severity >= 7 ? '(High - Critical pain point)' : gap.severity >= 5 ? '(Medium - Significant issue)' : '(Low - Minor inconvenience)'}
Opportunity Size: £${gap.opportunitySize}M
Competitive Intensity: ${gap.competitiveIntensity}/10 ${gap.competitiveIntensity >= 7 ? '(High competition)' : gap.competitiveIntensity >= 5 ? '(Moderate competition)' : '(Low competition - white space)'}
Innovation Potential: ${gap.innovationPotential}/10 ${gap.innovationPotential >= 7 ? '(Breakthrough opportunity)' : gap.innovationPotential >= 5 ? '(Incremental innovation)' : '(Limited innovation)'}
${'_'.repeat(70)}
`).join('')}

Total Opportunity Across All Gaps: £${totalOpportunity.toFixed(0)}M

${'='.repeat(70)}
COMPETITIVE LANDSCAPE ANALYSIS
${'='.repeat(70)}
Market Leader Share: ${marketLeaderShare}%
${marketLeaderShare > 40 ? 'Dominant market leader - requires strong differentiation strategy' : marketLeaderShare > 25 ? 'Clear leader but not dominant - opportunity for disruption' : 'No dominant leader - fragmented market'}

Top 5 Combined Market Share: ${top5CombinedShare}%
${top5CombinedShare > 70 ? 'Concentrated market - high barriers to entry' : top5CombinedShare > 50 ? 'Moderately concentrated - focus on niche segments' : 'Fragmented market - consolidation opportunity'}

Average Competitor Product Age: ${averageProductAge} years
${averageProductAge >= 7 ? 'Aging legacy products - strong modernization opportunity' : averageProductAge >= 4 ? 'Moderate product aging - incremental innovation opportunity' : 'Recent products - requires breakthrough innovation'}

Average Customer Satisfaction: ${customerSatisfaction}%
${customerSatisfaction < 60 ? 'Widespread dissatisfaction - clear need for better solution' : customerSatisfaction < 75 ? 'Moderate satisfaction - room for improvement' : 'High satisfaction - must demonstrate significant value-add'}

Market Fragmentation Index: ${((100 - top5CombinedShare) * 0.8).toFixed(0)}/80
${(100 - top5CombinedShare) > 50 ? 'Highly fragmented - platform/consolidation play viable' : 'Moderately concentrated - focus on differentiation'}

${'='.repeat(70)}
UNMET NEEDS ANALYSIS
${'='.repeat(70)}
${unmetNeeds}

Evidence Required for Endorsement:
- Customer interview quotes highlighting these needs
- Survey data showing % of market experiencing these pain points
- Analysis of competitor product gaps against customer requirements
- Third-party research reports validating unmet needs
- Social media sentiment analysis or review site data

${'='.repeat(70)}
UNDERSERVED SEGMENTS
${'='.repeat(70)}
${underservedSegments}

Segment Analysis Requirements:
- Demographic/firmographic profile of each segment
- Addressable market size per segment (number + £ value)
- Current solutions available (if any) and their limitations
- Willingness to pay and budget availability
- Accessibility and go-to-market strategy per segment

${'='.repeat(70)}
WHITE SPACE OPPORTUNITY
${'='.repeat(70)}
${whiteSpaceOpportunity}

Innovation Differentiation:
${yourDifferentiator}

Competitive Moat Analysis:
${gaps.filter(g => g.competitiveIntensity <= 4).length > 0 ? 
  'Low-competition gaps identified:\n' + 
  gaps.filter(g => g.competitiveIntensity <= 4).map(g => '  - ' + g.name + ' (Competition: ' + g.competitiveIntensity + '/10)').join('\n') 
  : 'No clear white space gaps with low competition identified - strengthen differentiation'}

${'='.repeat(70)}
UK INNOVATOR FOUNDER VISA: INNOVATION CRITERION ALIGNMENT
${'='.repeat(70)}
GOV.UK Innovation Assessment Factors:
• Genuine innovation in products, services, or business models
• Competitive advantage over existing UK market players
• Scalable business concept with growth potential
• Clear evidence of innovation (patents, novel technology, unique approach)

INNOVATION ALIGNMENT STATUS: ${aligned ? 'ALIGNED' : 'NEEDS STRENGTHENING'}

Strengths:
${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${weaknesses.length > 0 ? 'Areas for Improvement:\n' + weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n') : ''}

Gap Analysis Supporting Innovation:
- ${gaps.length} distinct market gaps identified
- £${totalOpportunity.toFixed(0)}M total addressable opportunity
- Average innovation potential: ${avgInnovation.toFixed(1)}/10
- ${gaps.filter(g => g.innovationPotential >= 7).length} high-innovation gaps (7+/10)

Visa Criterion Alignment:
${aligned && totalOpportunity >= 50 ? 
  'Strong market gap analysis clearly demonstrates innovation opportunity and competitive advantage for UK Innovator Founder visa endorsement' : 
  aligned ? 
  'Market gaps support innovation case but expand opportunity sizing (aim for £100M+ total) to strengthen scalability narrative' :
  'Gap analysis needs strengthening - identify larger opportunities, increase innovation differentiation, and provide market evidence'}

${'='.repeat(70)}
SMART RECOMMENDATIONS
${'='.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

${'='.repeat(70)}
4-WEEK ACTION PLAN
${'='.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

${'='.repeat(70)}
GAP VALIDATION EVIDENCE REQUIREMENTS
${'='.repeat(70)}
For UK Innovator Founder visa endorsement, provide:

1. Customer Research Evidence:
   - Interview transcripts or survey data (minimum 15-20 respondents)
   - Customer pain point validation with quotes
   - Willingness to pay analysis
   - Segment-specific needs assessment

2. Competitive Gap Evidence:
   - Competitor feature comparison matrix
   - Product teardown analysis showing missing capabilities
   - Customer review sentiment analysis (G2, Capterra, Trustpilot)
   - Third-party analyst reports on market gaps

3. Opportunity Sizing Evidence:
   - TAM/SAM calculation methodology for each gap
   - Market research firm data (Gartner, IDC, Forrester)
   - Industry association statistics
   - UK-specific market size validation

4. Innovation Differentiation Evidence:
   - Patent applications or granted patents (if applicable)
   - Novel technology or methodology documentation
   - Prototype or MVP demonstrating innovation
   - Expert endorsements or advisor testimonials

5. White Space Validation:
   - Competitive positioning map showing your unique position
   - Search analysis showing lack of adequate solutions
   - Customer validation of unmet needs (letters of intent, pilots)
   - Market trend analysis supporting timing

${'='.repeat(70)}
COMPETITIVE POSITIONING STRATEGY
${'='.repeat(70)}
Market Position: ${top5CombinedShare < 50 ? 'Fragmented market - consolidation opportunity' : 'Concentrated market - differentiation required'}

Key Differentiators:
${yourDifferentiator}

Competitive Advantages:
- Addressing ${gaps.length} distinct market gaps
- ${gaps.filter(g => g.competitiveIntensity <= 4).length} low-competition opportunities identified
- £${totalOpportunity.toFixed(0)}M addressable opportunity across gaps
- Innovation potential: ${avgInnovation.toFixed(1)}/10 average

Barriers to Entry for Competitors:
${gaps.filter(g => g.innovationPotential >= 7).length > 0 ? 
  '- High innovation requirements in ' + gaps.filter(g => g.innovationPotential >= 7).length + ' gaps\n' : ''}${gaps.filter(g => g.severity >= 8).length > 0 ? 
  '- Critical pain points requiring deep domain expertise\n' : ''}- First-mover advantage in identified white space
- UK market specialization and compliance knowledge

${'='.repeat(70)}
COMPLIANCE NOTES FOR ENDORSING BODIES
${'='.repeat(70)}
• Gap analysis based on comprehensive market research (competitor analysis, customer interviews, industry data)
• All opportunity sizing calculations use TAM/SAM/SOM methodology with documented assumptions
• Innovation potential assessed against UK market competitive landscape
• Underserved segments defined with specific demographics and addressable market size
• White space opportunities validated through customer research and competitive gap analysis
• Differentiation strategy clearly articulated with competitive moat analysis

${'='.repeat(70)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
Gap Analysis Methodology: Competitor teardown, customer research, market sizing
${'='.repeat(70)}

© 2025 UK Innovator Founder Visa Assistant
Report generated: ${new Date().toLocaleString('en-GB')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-gap-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart Data Generators
  
  // Chart 1: Gap Severity vs Opportunity Size Matrix (Scatter Plot)
  const getGapMatrix = () => {
    return gaps.map(gap => ({
      name: gap.name || 'Unnamed',
      severity: gap.severity,
      opportunity: gap.opportunitySize,
      innovation: gap.innovationPotential,
      competition: gap.competitiveIntensity
    }));
  };

  // Chart 2: Opportunity Size by Gap (Bar Chart)
  const getOpportunityChart = () => {
    return gaps
      .sort((a, b) => b.opportunitySize - a.opportunitySize)
      .map(gap => ({
        name: gap.name || 'Unnamed',
        opportunity: gap.opportunitySize,
        fill: gap.innovationPotential >= 7 ? '#10b981' : gap.innovationPotential >= 5 ? '#11b6e9' : '#ffa536'
      }));
  };

  // Chart 3: Gap Characteristics Radar
  const getGapRadar = () => {
    if (gaps.length === 0) return [];
    
    const avgSeverity = gaps.reduce((sum, gap) => sum + gap.severity, 0) / gaps.length;
    const avgInnovation = gaps.reduce((sum, gap) => sum + gap.innovationPotential, 0) / gaps.length;
    const avgCompetition = gaps.reduce((sum, gap) => sum + gap.competitiveIntensity, 0) / gaps.length;
    const opportunityIndex = Math.min(gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0) / 20, 10);
    
    return [
      { characteristic: 'Severity', value: avgSeverity, fullMark: 10 },
      { characteristic: 'Innovation', value: avgInnovation, fullMark: 10 },
      { characteristic: 'Opportunity', value: opportunityIndex, fullMark: 10 },
      { characteristic: 'Competition', value: 10 - avgCompetition, fullMark: 10 }, // Inverted - less competition is better
      { characteristic: 'Market Gap', value: (100 - top5CombinedShare) / 10, fullMark: 10 }
    ];
  };

  // Chart 4: Market Concentration Analysis
  const getMarketConcentration = () => {
    return [
      { segment: 'Market Leader', share: marketLeaderShare, fill: '#ef4444' },
      { segment: 'Top 5 (excl. leader)', share: top5CombinedShare - marketLeaderShare, fill: '#f59e0b' },
      { segment: 'Others', share: 100 - top5CombinedShare, fill: '#10b981' }
    ];
  };

  const { score: opportunityScore, grade } = getGapOpportunityScore();
  const { aligned } = getInnovationAlignment();
  const totalOpportunity = gaps.reduce((sum, gap) => sum + gap.opportunitySize, 0);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-market-gap">Market Gap Analysis</h1>
                <p className="text-lg text-muted-foreground">Identify unmet needs, underserved segments, and white space opportunities for UK Innovator Founder visa innovation criterion</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="market-gap"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Market Gap Analysis"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-market-gap">
              <TabsTrigger value="analyzer" data-testid="tab-analyzer">Analyzer</TabsTrigger>
              <TabsTrigger value="positioning" data-testid="tab-positioning">Positioning</TabsTrigger>
              <TabsTrigger value="visualization" data-testid="tab-visualization">Visualization</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gap Opportunity Assessment</CardTitle>
                  <CardDescription>UK Innovator Founder Visa innovation criterion evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={opportunityScore >= 70 ? "border-green-500" : opportunityScore >= 55 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Gap Opportunity Score</p>
                          <p className="text-3xl font-bold" data-testid="text-opportunity-score">{opportunityScore}%</p>
                          <p className="text-sm mt-2">{grade}</p>
                          <Progress value={opportunityScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={totalOpportunity >= 100 ? "border-green-500" : totalOpportunity >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Opportunity</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-opportunity">£{totalOpportunity.toFixed(0)}M</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {totalOpportunity >= 50 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">{totalOpportunity >= 100 ? 'Excellent' : totalOpportunity >= 50 ? 'Good' : 'Below Target'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={aligned ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Innovation Alignment</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-innovation-aligned">{aligned ? 'STRONG' : 'MODERATE'}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {aligned ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{gaps.length} gaps identified</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {gaps.length === 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No market gaps identified. Add gaps below to analyze innovation opportunities and competitive positioning.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!aligned && gaps.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Innovation criterion alignment needs strengthening. Increase opportunity sizing, add more high-innovation gaps, or enhance differentiation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {aligned && totalOpportunity >= 100 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent gap analysis. £{totalOpportunity.toFixed(0)}M opportunity with strong innovation alignment supports UK Innovator Founder visa endorsement.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Market Gaps</h3>
                      <Button onClick={addGap} size="sm" data-testid="button-add-gap">
                        Add Gap
                      </Button>
                    </div>

                    {gaps.map((gap, index) => (
                      <Card key={gap.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`gap-name-${gap.id}`}>Gap Name</Label>
                              <Input
                                id={`gap-name-${gap.id}`}
                                value={gap.name}
                                onChange={(e) => updateGap(gap.id, 'name', e.target.value)}
                                placeholder="e.g., SMB Automation Gap"
                                data-testid={`input-gap-name-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`gap-opportunity-${gap.id}`}>Opportunity Size (£M)</Label>
                              <Input
                                id={`gap-opportunity-${gap.id}`}
                                type="number"
                                value={gap.opportunitySize || ''}
                                onChange={(e) => updateGap(gap.id, 'opportunitySize', parseFloat(e.target.value) || 0)}
                                placeholder="10"
                                data-testid={`input-gap-opportunity-${index}`}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`gap-description-${gap.id}`}>Description</Label>
                            <Textarea
                              id={`gap-description-${gap.id}`}
                              value={gap.description}
                              onChange={(e) => updateGap(gap.id, 'description', e.target.value)}
                              placeholder="Describe the market gap, unmet needs, and customer pain points..."
                              rows={2}
                              data-testid={`textarea-gap-description-${index}`}
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`gap-severity-${gap.id}`}>Severity: {gap.severity}/10</Label>
                              <Slider
                                id={`gap-severity-${gap.id}`}
                                min={1}
                                max={10}
                                step={1}
                                value={[gap.severity]}
                                onValueChange={(v) => updateGap(gap.id, 'severity', v[0])}
                                className="mt-2"
                                data-testid={`slider-gap-severity-${index}`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">How critical is this pain point</p>
                            </div>
                            <div>
                              <Label htmlFor={`gap-innovation-${gap.id}`}>Innovation Potential: {gap.innovationPotential}/10</Label>
                              <Slider
                                id={`gap-innovation-${gap.id}`}
                                min={1}
                                max={10}
                                step={1}
                                value={[gap.innovationPotential]}
                                onValueChange={(v) => updateGap(gap.id, 'innovationPotential', v[0])}
                                className="mt-2"
                                data-testid={`slider-gap-innovation-${index}`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">Innovation opportunity</p>
                            </div>
                            <div>
                              <Label htmlFor={`gap-competition-${gap.id}`}>Competitive Intensity: {gap.competitiveIntensity}/10</Label>
                              <Slider
                                id={`gap-competition-${gap.id}`}
                                min={1}
                                max={10}
                                step={1}
                                value={[gap.competitiveIntensity]}
                                onValueChange={(v) => updateGap(gap.id, 'competitiveIntensity', v[0])}
                                className="mt-2"
                                data-testid={`slider-gap-competition-${index}`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">How competitive is this space</p>
                            </div>
                          </div>

                          {gaps.length > 1 && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGap(gap.id)}
                                data-testid={`button-remove-gap-${index}`}
                              >
                                Remove Gap
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Landscape Inputs</CardTitle>
                  <CardDescription>Market structure and competitive dynamics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="market-leader-share">Market Leader Share: {marketLeaderShare}%</Label>
                      <Slider
                        id="market-leader-share"
                        min={0}
                        max={100}
                        step={1}
                        value={[marketLeaderShare]}
                        onValueChange={(v) => setMarketLeaderShare(v[0])}
                        className="mt-2"
                        data-testid="slider-market-leader"
                      />
                      <p className="text-sm text-muted-foreground mt-1">Largest competitor's market share</p>
                    </div>
                    <div>
                      <Label htmlFor="top5-share">Top 5 Combined Share: {top5CombinedShare}%</Label>
                      <Slider
                        id="top5-share"
                        min={0}
                        max={100}
                        step={1}
                        value={[top5CombinedShare]}
                        onValueChange={(v) => setTop5CombinedShare(v[0])}
                        className="mt-2"
                        data-testid="slider-top5-share"
                      />
                      <p className="text-sm text-muted-foreground mt-1">Top 5 competitors' combined market share</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="product-age">Average Product Age: {averageProductAge} years</Label>
                      <Slider
                        id="product-age"
                        min={0}
                        max={15}
                        step={1}
                        value={[averageProductAge]}
                        onValueChange={(v) => setAverageProductAge(v[0])}
                        className="mt-2"
                        data-testid="slider-product-age"
                      />
                      <p className="text-sm text-muted-foreground mt-1">How old are competitor products</p>
                    </div>
                    <div>
                      <Label htmlFor="customer-satisfaction">Customer Satisfaction: {customerSatisfaction}%</Label>
                      <Slider
                        id="customer-satisfaction"
                        min={0}
                        max={100}
                        step={1}
                        value={[customerSatisfaction]}
                        onValueChange={(v) => setCustomerSatisfaction(v[0])}
                        className="mt-2"
                        data-testid="slider-customer-satisfaction"
                      />
                      <p className="text-sm text-muted-foreground mt-1">Average satisfaction with existing solutions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positioning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Positioning Strategy</CardTitle>
                  <CardDescription>Define your unique position and competitive advantages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="unmet-needs">Unmet Needs</Label>
                    <Textarea
                      id="unmet-needs"
                      value={unmetNeeds}
                      onChange={(e) => setUnmetNeeds(e.target.value)}
                      placeholder="List specific unmet customer needs that existing solutions fail to address..."
                      rows={3}
                      data-testid="textarea-unmet-needs"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Document specific pain points from customer research, surveys, or interviews
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="underserved-segments">Underserved Segments</Label>
                    <Textarea
                      id="underserved-segments"
                      value={underservedSegments}
                      onChange={(e) => setUnderservedSegments(e.target.value)}
                      placeholder="Define customer segments that are poorly served by current market solutions..."
                      rows={3}
                      data-testid="textarea-underserved-segments"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Include demographics, firmographics, size, and accessibility of each segment
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="white-space">White Space Opportunity</Label>
                    <Textarea
                      id="white-space"
                      value={whiteSpaceOpportunity}
                      onChange={(e) => setWhiteSpaceOpportunity(e.target.value)}
                      placeholder="Describe the white space where no adequate solution currently exists..."
                      rows={3}
                      data-testid="textarea-white-space"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Articulate the unique market position you occupy that competitors don't address
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="differentiator">Your Key Differentiators</Label>
                    <Textarea
                      id="differentiator"
                      value={yourDifferentiator}
                      onChange={(e) => setYourDifferentiator(e.target.value)}
                      placeholder="List your unique features, technology, approach, or business model innovations..."
                      rows={3}
                      data-testid="textarea-differentiator"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      How does your solution uniquely address the identified market gaps
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Criterion Alignment</CardTitle>
                  <CardDescription>UK Innovator Founder visa innovation assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getInnovationAlignment().strengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm" data-testid={`text-strength-${i}`}>{strength}</p>
                      </div>
                    ))}
                    
                    {getInnovationAlignment().weaknesses.length > 0 && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <p className="font-medium text-sm mb-3">Areas for Improvement:</p>
                        </div>
                        {getInnovationAlignment().weaknesses.map((weakness, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm" data-testid={`text-weakness-${i}`}>{weakness}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gap Severity vs Opportunity Matrix</CardTitle>
                    <CardDescription>Scatter plot showing gap priority (higher-right is best)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gaps.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="severity" name="Severity" domain={[0, 10]} label={{ value: 'Gap Severity', position: 'insideBottom', offset: -5 }} />
                          <YAxis type="number" dataKey="opportunity" name="Opportunity" label={{ value: 'Opportunity (£M)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded p-2 shadow-lg">
                                    <p className="font-semibold">{data.name}</p>
                                    <p className="text-sm">Severity: {data.severity}/10</p>
                                    <p className="text-sm">Opportunity: £{data.opportunity}M</p>
                                    <p className="text-sm">Innovation: {data.innovation}/10</p>
                                    <p className="text-sm">Competition: {data.competition}/10</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter 
                            data={getGapMatrix()} 
                            fill="#11b6e9" 
                            shape={(props: any) => {
                              const { cx, cy, payload } = props;
                              const size = payload.innovation >= 7 ? 12 : 8;
                              const color = payload.competition <= 4 ? '#10b981' : payload.competition >= 7 ? '#ef4444' : '#11b6e9';
                              return <circle cx={cx} cy={cy} r={size} fill={color} stroke="#fff" strokeWidth={2} />;
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-gaps-chart">Add market gaps to see visualization</p>
                    )}
                    {gaps.length > 0 && (
                      <div className="mt-4 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                          <span>Low competition (white space)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#11b6e9]"></div>
                          <span>Moderate competition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                          <span>High competition</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Opportunity Size by Gap</CardTitle>
                    <CardDescription>Bar chart showing market opportunity value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gaps.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getOpportunityChart()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                          <YAxis label={{ value: 'Opportunity (£M)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value: number) => `£${value}M`} />
                          <Bar dataKey="opportunity">
                            {getOpportunityChart().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add market gaps to see opportunity sizing</p>
                    )}
                    {gaps.length > 0 && (
                      <div className="mt-4 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-[#10b981]"></div>
                          <span>High innovation (7+/10)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-[#11b6e9]"></div>
                          <span>Medium innovation (5-7/10)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-[#ffa536]"></div>
                          <span>Lower innovation</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gap Characteristics Profile</CardTitle>
                    <CardDescription>Radar chart showing average gap attributes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gaps.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getGapRadar()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="characteristic" />
                          <PolarRadiusAxis angle={90} domain={[0, 10]} />
                          <Radar name="Gap Profile" dataKey="value" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add market gaps to see profile</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Concentration</CardTitle>
                    <CardDescription>Competitive landscape structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getMarketConcentration()}
                          dataKey="share"
                          nameKey="segment"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.segment}: ${entry.share}%`}
                        >
                          {getMarketConcentration().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium">
                        {top5CombinedShare < 50 ? 'Fragmented Market' : top5CombinedShare < 70 ? 'Moderately Concentrated' : 'Highly Concentrated'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {100 - top5CombinedShare}% opportunity outside top 5
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights for UK Innovator Founder visa success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                        <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm" data-testid={`text-tip-${index}`}>{tip}</p>
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
                  <CardDescription>Structured roadmap for comprehensive market gap analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg border">
                        <div className="flex-shrink-0">
                          {item.priority === 'Critical' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                          {item.priority === 'High' && <TrendingUp className="h-5 w-5 text-orange-500" />}
                          {item.priority === 'Medium' && <Target className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-accent" data-testid={`badge-priority-${index}`}>
                              {item.priority}
                            </span>
                            <span className="text-xs text-muted-foreground" data-testid={`text-week-${index}`}>{item.week}</span>
                          </div>
                          <p className="text-sm" data-testid={`text-action-${index}`}>{item.action}</p>
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
