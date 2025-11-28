import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'market-analysis',
  toolName: 'Market Analysis',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Expert. Strong market analysis is essential for demonstrating scalability to UK Innovator Founder Visa endorsers. Let's quantify your market opportunity using the TAM/SAM/SOM framework!",
  questions: [
    {
      id: 'tam',
      question: "What's your Total Addressable Market (TAM) in GBP? This is the total market demand for your product/service globally or in your target region.",
      hint: "Endorsers look for TAM of at least £50M, ideally £100M+ for strong scalability",
      fieldKey: 'tam'
    },
    {
      id: 'sam',
      question: "What's your Serviceable Addressable Market (SAM)? This is the portion of TAM you can realistically serve with your business model.",
      hint: "SAM is typically 10-50% of TAM based on your geographic and segment focus",
      fieldKey: 'sam'
    },
    {
      id: 'som',
      question: "What's your Serviceable Obtainable Market (SOM)? This is the realistic market share you can capture in the first 1-3 years.",
      hint: "SOM is typically 1-15% of SAM for early-stage businesses",
      fieldKey: 'som'
    },
    {
      id: 'growth-rate',
      question: "What's the annual growth rate (CAGR) of your market? Include the source of this data.",
      hint: "15%+ CAGR indicates a high-growth market, which strengthens your case",
      fieldKey: 'marketGrowth'
    },
    {
      id: 'competition',
      question: "How many direct competitors exist in your market? Is the market emerging, growth-stage, mature, or declining?",
      hint: "Growth-stage markets with moderate competition are ideal",
      fieldKey: 'competition'
    },
    {
      id: 'trends',
      question: "What are the key market trends driving growth? How does your innovation align with these trends?",
      hint: "Link trends to your unique value proposition and innovation",
      fieldKey: 'keyTrends',
      minLength: 50
    }
  ],
  completionMessage: "Excellent market analysis! This demonstrates the scalability potential endorsing bodies look for. I'm populating your market sizing framework now."
};

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Large addressable market demonstrates growth potential
// Viability Criterion: Market size validates business opportunity
// Innovation Criterion: Market trends support innovative solution

export default function MarketAnalysis() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('market-analysis-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  
  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('market-analysis-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const [tam, setTam] = useState(5000000000); // Total Addressable Market
  const [sam, setSam] = useState(500000000); // Serviceable Addressable Market
  const [som, setSom] = useState(50000000); // Serviceable Obtainable Market
  const [marketGrowth, setMarketGrowth] = useState(15); // % annual growth
  const [competitorCount, setCompetitorCount] = useState(25);
  const [marketMaturity, setMarketMaturity] = useState<"emerging" | "growth" | "mature" | "declining">("growth");
  const [targetSegments, setTargetSegments] = useState("SMBs, Enterprise, Startups");
  const [keyTrends, setKeyTrends] = useState("Digital transformation, AI adoption, Remote work");
  const [customerPainPoints, setCustomerPainPoints] = useState("High costs, inefficient processes, lack of automation");
  const [marketBarriers, setMarketBarriers] = useState("High switching costs, regulatory requirements");
  const [activeTab, setActiveTab] = useState('analyzer');
  const [savedDate, setSavedDate] = useState('');

  // Advanced: Market Opportunity Score
  // Formula: Based on TAM size, growth rate, and market maturity
  const getMarketOpportunity = (): { score: number; grade: string } => {
    let score = 0;
    
    // TAM size (40 points): £50M+ = excellent
    if (tam >= 1000000000) score += 40;
    else if (tam >= 100000000) score += 30;
    else if (tam >= 50000000) score += 20;
    else score += 10;
    
    // Market growth (30 points): 15%+ = excellent
    if (marketGrowth >= 20) score += 30;
    else if (marketGrowth >= 15) score += 25;
    else if (marketGrowth >= 10) score += 15;
    else score += 5;
    
    // Market maturity (30 points): Growth stage ideal
    if (marketMaturity === "growth") score += 30;
    else if (marketMaturity === "emerging") score += 25;
    else if (marketMaturity === "mature") score += 15;
    else score += 5;
    
    let grade = 'F - Poor Market';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Strong';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Weak';
    
    return { score, grade };
  };

  // Advanced: Market Sizing Validation
  // Formula: SOM should be 1-10% of SAM, SAM should be 10-50% of TAM
  const getMarketSizingHealth = (): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    let isValid = true;
    
    const samPercent = (sam / tam) * 100;
    const somPercent = (som / sam) * 100;
    
    if (samPercent > 50) {
      issues.push("SAM too high (>50% of TAM) - unrealistic market penetration");
      isValid = false;
    }
    if (samPercent < 5) {
      issues.push("SAM too low (<5% of TAM) - consider broader addressable market");
    }
    
    if (somPercent > 15) {
      issues.push("SOM too high (>15% of SAM) - unrealistic short-term capture");
      isValid = false;
    }
    if (somPercent < 1) {
      issues.push("SOM too low (<1% of SAM) - insufficient market opportunity");
    }
    
    return { isValid, issues };
  };

  const getSerializedState = () => {
    return {
      tam,
      sam,
      som,
      marketGrowth,
      competitorCount,
      marketMaturity,
      targetSegments,
      keyTrends,
      customerPainPoints,
      marketBarriers,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('tam' in state) setTam(state.tam);
    if ('sam' in state) setSam(state.sam);
    if ('som' in state) setSom(state.som);
    if ('marketGrowth' in state) setMarketGrowth(state.marketGrowth);
    if ('competitorCount' in state) setCompetitorCount(state.competitorCount);
    if ('marketMaturity' in state) setMarketMaturity(state.marketMaturity);
    if ('targetSegments' in state) setTargetSegments(state.targetSegments);
    if ('keyTrends' in state) setKeyTrends(state.keyTrends);
    if ('customerPainPoints' in state) setCustomerPainPoints(state.customerPainPoints);
    if ('marketBarriers' in state) setMarketBarriers(state.marketBarriers);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('market-analysis-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('market-analysis-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.tam) {
      const numMatch = answers.tam.match(/[\d,]+/);
      if (numMatch) setTam(parseInt(numMatch[0].replace(/,/g, '')));
    }
    if (answers.sam) {
      const numMatch = answers.sam.match(/[\d,]+/);
      if (numMatch) setSam(parseInt(numMatch[0].replace(/,/g, '')));
    }
    if (answers.som) {
      const numMatch = answers.som.match(/[\d,]+/);
      if (numMatch) setSom(parseInt(numMatch[0].replace(/,/g, '')));
    }
    if (answers.marketGrowth) {
      const rateMatch = answers.marketGrowth.match(/[\d.]+/);
      if (rateMatch) setMarketGrowth(parseFloat(rateMatch[0]));
    }
    if (answers.competition) {
      const countMatch = answers.competition.match(/(\d+)/);
      if (countMatch) setCompetitorCount(parseInt(countMatch[1]));
      if (answers.competition.toLowerCase().includes('emerging')) setMarketMaturity('emerging');
      else if (answers.competition.toLowerCase().includes('growth')) setMarketMaturity('growth');
      else if (answers.competition.toLowerCase().includes('mature')) setMarketMaturity('mature');
      else if (answers.competition.toLowerCase().includes('declining')) setMarketMaturity('declining');
    }
    if (answers.keyTrends) {
      setKeyTrends(answers.keyTrends);
    }
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('market-analysis-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('market-analysis-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const { score } = getMarketOpportunity();
    const { isValid, issues } = getMarketSizingHealth();
    
    if (tam < 50000000) {
      tips.push("CRITICAL: TAM below £50M may not demonstrate sufficient scalability for UK Innovator Founder visa. Consider broader market definition or adjacent markets.");
    }
    
    if (tam >= 50000000 && tam < 100000000) {
      tips.push("Your TAM of £" + (tam/1000000).toFixed(0) + "M meets minimum threshold, but endorsing bodies prefer £100M+ to demonstrate strong scalability potential.");
    }
    
    if (marketGrowth < 10) {
      tips.push("Market growth rate below 10% CAGR may raise viability concerns. Focus on faster-growing market segments or emphasize other growth drivers in your business model.");
    }
    
    if (marketMaturity === "declining") {
      tips.push("CRITICAL: Declining market poses significant risk to viability criterion. Demonstrate clear strategy to capture market share from competitors or pivot to growth segments.");
    }
    
    if (marketMaturity === "mature" && competitorCount > 50) {
      tips.push("Mature market with high competition requires exceptional differentiation. Strengthen your innovation narrative and unique value proposition for endorsing bodies.");
    }
    
    if (competitorCount > 50) {
      tips.push("High competitor count (" + competitorCount + "+) requires strong evidence of competitive advantage. Document specific innovations that differentiate your solution.");
    }
    
    if (!isValid && issues.length > 0) {
      tips.push("Market sizing validation failed. Endorsing bodies expect realistic TAM/SAM/SOM ratios. Review and adjust: " + issues[0]);
    }
    
    const samPercent = ((sam / tam) * 100).toFixed(1);
    if (parseFloat(samPercent) < 10) {
      tips.push("Your SAM is only " + samPercent + "% of TAM. Consider if your business model can address a broader serviceable market to strengthen scalability case.");
    }
    
    if (score >= 85) {
      tips.push("Excellent market opportunity score (" + score + "%). This demonstrates strong scalability and viability alignment with UK Innovator Founder visa criteria.");
    }
    
    if (score >= 70 && score < 85) {
      tips.push("Strong market position (" + score + "%). To achieve excellence, focus on increasing TAM (aim for £100M+) or demonstrating higher growth potential (20%+ CAGR).");
    }
    
    if (targetSegments.length < 20) {
      tips.push("Define specific customer segments with details on size, characteristics, and accessibility. Endorsing bodies look for clear market targeting strategy.");
    }
    
    if (keyTrends.length < 30) {
      tips.push("Elaborate on market trends with specific data points, industry reports, and UK-specific evidence to support your innovation and scalability narrative.");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive market research using UK-specific sources (ONS, industry reports, trade associations)", priority: "Critical" },
      { week: "Week 1", action: "Gather competitor intelligence - identify top 10-15 competitors with market positioning analysis", priority: "High" },
      { week: "Week 1-2", action: "Define TAM using bottom-up and top-down methodologies with documented assumptions", priority: "Critical" },
      { week: "Week 2", action: "Calculate SAM based on your specific business model, geographic focus, and customer targeting criteria", priority: "Critical" },
      { week: "Week 2", action: "Project realistic SOM for Years 1-3 with clear market penetration assumptions and supporting evidence", priority: "Critical" },
      { week: "Week 2-3", action: "Document market trends with citations from credible sources (Gartner, IDC, UK government reports)", priority: "High" },
      { week: "Week 3", action: "Identify and quantify customer pain points through interviews, surveys, or secondary research", priority: "High" },
      { week: "Week 3", action: "Analyze market barriers to entry and develop mitigation strategies for your business plan", priority: "Medium" },
      { week: "Week 3-4", action: "Prepare customer segmentation analysis with addressable market size per segment", priority: "High" },
      { week: "Week 4", action: "Create competitive landscape matrix comparing your innovation against key competitors", priority: "Medium" },
      { week: "Week 4", action: "Validate all market sizing figures with third-party sources and prepare evidence documentation", priority: "Critical" },
      { week: "Week 4", action: "Compile market analysis into endorsement-ready format aligned with scalability and viability criteria", priority: "High" },
    ];
  };

  const handleExportPdf = () => {
    const { score, grade } = getMarketOpportunity();
    const { isValid, issues } = getMarketSizingHealth();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    
    const tamScore = tam >= 1000000000 ? 40 : tam >= 100000000 ? 30 : tam >= 50000000 ? 20 : 10;
    const growthScore = marketGrowth >= 20 ? 30 : marketGrowth >= 15 ? 25 : marketGrowth >= 10 ? 15 : 5;
    const maturityScore = marketMaturity === "growth" ? 30 : marketMaturity === "emerging" ? 25 : marketMaturity === "mature" ? 15 : 5;
    
    const content = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE MARKET ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}

${'='.repeat(70)}
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
${'='.repeat(70)}
Market Opportunity Score: ${score}% (${grade})
Market Maturity: ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)}
Annual Market Growth (CAGR): ${marketGrowth}%
Competitor Count: ${competitorCount}
Market Sizing Validation: ${isValid ? 'VALID' : 'NEEDS ADJUSTMENT'}

${score >= 75 ? 'STRONG MARKET - Supports scalability criterion for UK Innovator Founder visa' : score >= 60 ? 'MODERATE MARKET - Strengthen for endorsement' : 'WEAK MARKET - Critical improvements needed'}

${'='.repeat(70)}
MARKET SIZING FRAMEWORK (TAM/SAM/SOM)
${'='.repeat(70)}
Total Addressable Market (TAM): £${(tam / 1000000).toFixed(1)}M
  Definition: Total demand for product/service globally or in defined geographic region
  Input Value: £${tam.toLocaleString()}

Serviceable Addressable Market (SAM): £${(sam / 1000000).toFixed(1)}M
  Definition: Portion of TAM you can realistically serve with your business model
  Input Value: £${sam.toLocaleString()}
  Calculation: (£${sam.toLocaleString()} ÷ £${tam.toLocaleString()}) × 100 = ${samPercent}% of TAM
  ${parseFloat(samPercent) >= 5 && parseFloat(samPercent) <= 50 ? 'Realistic SAM range (5-50% of TAM)' : 'SAM-to-TAM ratio outside recommended bounds'}

Serviceable Obtainable Market (SOM): £${(som / 1000000).toFixed(1)}M
  Definition: Realistic market share achievable in first 1-3 years
  Input Value: £${som.toLocaleString()}
  Calculation: (£${som.toLocaleString()} ÷ £${sam.toLocaleString()}) × 100 = ${somPercent}% of SAM
  ${parseFloat(somPercent) >= 1 && parseFloat(somPercent) <= 15 ? 'Realistic SOM range (1-15% of SAM)' : 'SOM-to-SAM ratio outside recommended bounds'}

Market Sizing Health Check:
${issues.length > 0 ? issues.map(i => `  - ${i}`).join('\n') : '  All market sizing ratios are within realistic bounds'}

${'='.repeat(70)}
MARKET OPPORTUNITY SCORE CALCULATION
${'='.repeat(70)}
Formula: Market Score = TAM Component (40pts) + Growth Component (30pts) + Maturity Component (30pts)

Component 1: TAM Size Assessment
  Input TAM: £${(tam / 1000000).toFixed(1)}M
  Scoring Thresholds:
    - £1,000M+ (£1B+): 40 points (Excellent)
    - £100M-£1,000M: 30 points (Strong)
    - £50M-£100M: 20 points (Moderate)
    - <£50M: 10 points (Weak)
  Calculation: TAM £${(tam / 1000000).toFixed(1)}M → ${tam >= 1000000000 ? '>=£1B → 40 points' : tam >= 100000000 ? '>=£100M → 30 points' : tam >= 50000000 ? '>=£50M → 20 points' : '<£50M → 10 points'}
  TAM Score: ${tamScore}/40 points
  ${tam >= 100000000 ? 'Large TAM demonstrates significant UK Innovator Founder visa scalability potential' : 'Limited TAM may restrict scalability narrative'}

Component 2: Market Growth Assessment
  Input Growth Rate: ${marketGrowth}% CAGR
  Scoring Thresholds:
    - 20%+: 30 points (High growth)
    - 15-20%: 25 points (Strong growth)
    - 10-15%: 15 points (Moderate growth)
    - <10%: 5 points (Slow growth)
  Calculation: Growth ${marketGrowth}% → ${marketGrowth >= 20 ? '>=20% → 30 points' : marketGrowth >= 15 ? '>=15% → 25 points' : marketGrowth >= 10 ? '>=10% → 15 points' : '<10% → 5 points'}
  Growth Score: ${growthScore}/30 points
  ${marketGrowth >= 15 ? 'High growth rate supports innovative solution narrative for UK Innovator Founder visa' : 'Market growth could be stronger'}

Component 3: Market Maturity Assessment
  Input Maturity: ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)}
  Scoring Thresholds:
    - Growth: 30 points (Optimal)
    - Emerging: 25 points (Good)
    - Mature: 15 points (Acceptable)
    - Declining: 5 points (Risky)
  Calculation: Maturity "${marketMaturity}" → ${marketMaturity === "growth" ? 'Growth → 30 points' : marketMaturity === "emerging" ? 'Emerging → 25 points' : marketMaturity === "mature" ? 'Mature → 15 points' : 'Declining → 5 points'}
  Maturity Score: ${maturityScore}/30 points
  ${marketMaturity === "growth" ? 'Growing market ideal for scaling business' : marketMaturity === "emerging" ? 'Emerging market offers early-mover advantage' : marketMaturity === "declining" ? 'Declining market poses viability risk' : 'Mature market requires strong differentiation'}

Final Market Opportunity Score:
  TAM Component: ${tamScore} pts
  Growth Component: ${growthScore} pts
  Maturity Component: ${maturityScore} pts
  ${'_'.repeat(40)}
  Total Score: ${score}/100 (${grade})

${'='.repeat(70)}
TARGET MARKET SEGMENTS
${'='.repeat(70)}
${targetSegments}

Competitive Landscape: ${competitorCount} competitors identified
${competitorCount > 50 ? 'High competition requires strong differentiation for innovation criterion' : competitorCount > 20 ? 'Moderate competition - focus on unique value proposition' : 'Low competition - opportunity for market leadership'}

${'='.repeat(70)}
KEY MARKET TRENDS
${'='.repeat(70)}
${keyTrends}

${'='.repeat(70)}
CUSTOMER PAIN POINTS
${'='.repeat(70)}
${customerPainPoints}

${'='.repeat(70)}
MARKET BARRIERS TO ENTRY
${'='.repeat(70)}
${marketBarriers}

${'='.repeat(70)}
5-YEAR MARKET PROJECTION
${'='.repeat(70)}
Formula: Future Value = SOM × (1 + Growth Rate)^Years
Base SOM: £${(som / 1000000).toFixed(1)}M
Growth Rate: ${marketGrowth}% CAGR

Year 1 (Baseline): £${(som / 1000000).toFixed(1)}M
Year 2: £${som.toLocaleString()} × 1.${(marketGrowth/100).toFixed(2).split('.')[1]} = £${(som * (1 + marketGrowth/100) / 1000000).toFixed(1)}M
Year 3: £${som.toLocaleString()} × (1.${(marketGrowth/100).toFixed(2).split('.')[1]})² = £${(som * Math.pow(1 + marketGrowth/100, 2) / 1000000).toFixed(1)}M
Year 4: £${som.toLocaleString()} × (1.${(marketGrowth/100).toFixed(2).split('.')[1]})³ = £${(som * Math.pow(1 + marketGrowth/100, 3) / 1000000).toFixed(1)}M
Year 5: £${som.toLocaleString()} × (1.${(marketGrowth/100).toFixed(2).split('.')[1]})⁴ = £${(som * Math.pow(1 + marketGrowth/100, 4) / 1000000).toFixed(1)}M

5-Year Total Market Opportunity: £${((som + som*(1+marketGrowth/100) + som*Math.pow(1+marketGrowth/100,2) + som*Math.pow(1+marketGrowth/100,3) + som*Math.pow(1+marketGrowth/100,4)) / 1000000).toFixed(1)}M cumulative

${'='.repeat(70)}
UK INNOVATOR FOUNDER VISA: SCALABILITY CRITERION
${'='.repeat(70)}
GOV.UK Scalability Assessment Factors:
• Significant market opportunity (TAM >£50M preferred, >£100M ideal)
• High growth potential (CAGR >15% preferred)
• Clear path to substantial market share
• Realistic revenue scaling plan
• Addressable market supports job creation (5 jobs at £25k+ OR 10 jobs for ILR)

CURRENT MARKET POSITION:
TAM: £${(tam/1000000).toFixed(1)}M ${tam >= 100000000 ? 'EXCELLENT (>£100M)' : tam >= 50000000 ? 'STRONG (>£50M)' : 'BELOW RECOMMENDED'}
Growth Rate: ${marketGrowth}% CAGR ${marketGrowth >= 20 ? 'HIGH GROWTH' : marketGrowth >= 15 ? 'STRONG GROWTH' : 'MODERATE GROWTH'}
Market Maturity: ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)} ${marketMaturity === "growth" || marketMaturity === "emerging" ? 'FAVORABLE' : 'REQUIRES STRATEGY'}
Opportunity Score: ${score}% ${score >= 75 ? 'MEETS SCALABILITY BAR' : score >= 60 ? 'NEEDS STRENGTHENING' : 'CRITICAL IMPROVEMENTS NEEDED'}

Visa Criterion Alignment:
${score >= 75 && tam >= 50000000 ? 'Strong market opportunity clearly demonstrates scalability for UK Innovator Founder visa endorsement' : score >= 60 ? 'Market opportunity is acceptable but strengthening TAM (aim for £100M+) and growth rate (aim for 20%+) would improve endorsement chances' : 'Market opportunity needs significant strengthening - consider broader TAM definition or faster-growing market segments'}

${'='.repeat(70)}
SMART RECOMMENDATIONS
${'='.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

${'='.repeat(70)}
4-WEEK ACTION PLAN
${'='.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

${'='.repeat(70)}
UK MARKET EVIDENCE REQUIREMENTS
${'='.repeat(70)}
For UK Innovator Founder visa endorsement, provide:

1. Market Size Evidence:
   - UK Office for National Statistics (ONS) data
   - Industry association reports (relevant to your sector)
   - Market research firm data (Gartner, IDC, Forrester, etc.)
   - Government sector analyses
   - Trade body statistics

2. Growth Rate Evidence:
   - Historical UK market growth data (3-5 years)
   - Industry forecasts from credible sources
   - UK-specific CAGR calculations with methodology
   - Comparison to global market growth rates

3. Competitive Analysis Evidence:
   - List of top UK competitors with market share data
   - Competitive positioning matrix
   - Your unique value proposition vs competitors
   - Barriers to entry you've overcome/will overcome

4. Customer Segment Evidence:
   - UK customer demographics and firmographics
   - Target segment size and accessibility
   - Customer pain point validation (surveys, interviews)
   - Willingness to pay evidence

5. Trend Validation:
   - UK-specific market trend data
   - Technology adoption rates in UK
   - Regulatory changes supporting your market
   - Consumer/business behavior shifts in UK

${'='.repeat(70)}
COMPLIANCE NOTES FOR ENDORSING BODIES
${'='.repeat(70)}
• Ensure all market data is UK-specific or clearly shows UK applicability
• Cite credible third-party sources for all market sizing claims
• Demonstrate realistic market capture assumptions (not overly optimistic)
• Show clear connection between market size and job creation potential
• Align market opportunity with your funding requirements (appropriate for your plan)
• Provide evidence of market validation (customer interest, partnerships, pilots)

${'='.repeat(70)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
Market Analysis Methodology: TAM/SAM/SOM framework, bottom-up and top-down analysis
${'='.repeat(70)}

© 2025 UK Innovator Founder Visa Assistant
Report generated: ${new Date().toLocaleString('en-GB')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-analysis-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const { score, grade } = getMarketOpportunity();
    const { isValid, issues } = getMarketSizingHealth();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    const tips = getSmartTips();
    const actionPlan = generateActionPlan();

    await generateWord({
      title: 'UK Innovator Founder Visa - Market Analysis',
      subtitle: `Market Opportunity Score: ${score}% (${grade})`,
      filename: `market-analysis-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Executive Summary', level: 1 },
        { type: 'score', score: { value: score, max: 100, label: 'Market Opportunity Score' } },
        { type: 'paragraph', content: `Market Maturity: ${marketMaturity.charAt(0).toUpperCase() + marketMaturity.slice(1)}` },
        { type: 'paragraph', content: `Annual Market Growth (CAGR): ${marketGrowth}%` },
        { type: 'paragraph', content: `Competitor Count: ${competitorCount}` },
        { type: 'paragraph', content: `Market Sizing Validation: ${isValid ? 'VALID' : 'NEEDS ADJUSTMENT'}` },
        { type: 'divider' },
        { type: 'heading', content: 'Market Sizing Framework (TAM/SAM/SOM)', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Metric', 'Value', 'Percentage'],
            rows: [
              ['Total Addressable Market (TAM)', `£${(tam / 1000000).toFixed(1)}M`, '100%'],
              ['Serviceable Addressable Market (SAM)', `£${(sam / 1000000).toFixed(1)}M`, `${samPercent}% of TAM`],
              ['Serviceable Obtainable Market (SOM)', `£${(som / 1000000).toFixed(1)}M`, `${somPercent}% of SAM`]
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Market Sizing Health Check', level: 1 },
        issues.length > 0
          ? { type: 'list', items: issues }
          : { type: 'paragraph', content: 'All market sizing ratios are within realistic bounds' },
        { type: 'divider' },
        { type: 'heading', content: 'Target Market Segments', level: 1 },
        { type: 'paragraph', content: targetSegments },
        { type: 'divider' },
        { type: 'heading', content: 'Key Market Trends', level: 1 },
        { type: 'paragraph', content: keyTrends },
        { type: 'divider' },
        { type: 'heading', content: 'Customer Pain Points', level: 1 },
        { type: 'paragraph', content: customerPainPoints },
        { type: 'divider' },
        { type: 'heading', content: 'Market Barriers to Entry', level: 1 },
        { type: 'paragraph', content: marketBarriers },
        { type: 'divider' },
        { type: 'heading', content: '5-Year Market Projection', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Year', 'Projected SOM'],
            rows: [
              ['Year 1 (Baseline)', `£${(som / 1000000).toFixed(1)}M`],
              ['Year 2', `£${(som * (1 + marketGrowth/100) / 1000000).toFixed(1)}M`],
              ['Year 3', `£${(som * Math.pow(1 + marketGrowth/100, 2) / 1000000).toFixed(1)}M`],
              ['Year 4', `£${(som * Math.pow(1 + marketGrowth/100, 3) / 1000000).toFixed(1)}M`],
              ['Year 5', `£${(som * Math.pow(1 + marketGrowth/100, 4) / 1000000).toFixed(1)}M`]
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Smart Recommendations', level: 1 },
        { type: 'list', items: tips },
        { type: 'divider' },
        { type: 'heading', content: '4-Week Action Plan', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Week', 'Action', 'Priority'],
            rows: actionPlan.map(a => [a.week, a.action, a.priority])
          }
        }
      ],
      metadata: {
        subject: 'Market Analysis Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['market', 'analysis', 'TAM', 'SAM', 'SOM', 'visa', 'innovator founder']
      }
    });

    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  // Chart 1: TAM/SAM/SOM Funnel
  const getMarketFunnel = () => [
    { stage: "TAM", value: tam / 1000000, fill: "#ffa536" },
    { stage: "SAM", value: sam / 1000000, fill: "#11b6e9" },
    { stage: "SOM", value: som / 1000000, fill: "#10b981" }
  ];

  // Chart 2: 5-Year Market Growth Projection
  const getGrowthProjection = () => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map(year => ({
      year: year === 0 ? 'Now' : `Y${year}`,
      TAM: tam * Math.pow(1 + marketGrowth/100, year) / 1000000,
      SAM: sam * Math.pow(1 + marketGrowth/100, year) / 1000000,
      SOM: som * Math.pow(1 + marketGrowth/100, year) / 1000000
    }));
  };

  // Chart 3: Market Opportunity Breakdown
  const getOpportunityBreakdown = () => {
    const tamScore = tam >= 1000000000 ? 40 : tam >= 100000000 ? 30 : tam >= 50000000 ? 20 : 10;
    const growthScore = marketGrowth >= 20 ? 30 : marketGrowth >= 15 ? 25 : marketGrowth >= 10 ? 15 : 5;
    const maturityScore = marketMaturity === "growth" ? 30 : marketMaturity === "emerging" ? 25 : marketMaturity === "mature" ? 15 : 5;
    
    return [
      { component: "Market Size", score: tamScore, max: 40, fill: "#ffa536" },
      { component: "Growth Rate", score: growthScore, max: 30, fill: "#11b6e9" },
      { component: "Maturity", score: maturityScore, max: 30, fill: "#10b981" }
    ];
  };

  // Chart 4: Competitive Landscape
  const getCompetitiveData = () => {
    let category = "Low";
    let color = "#10b981";
    let risk = "Low Risk";
    
    if (competitorCount > 50) {
      category = "Very High";
      color = "#ef4444";
      risk = "High Risk";
    } else if (competitorCount > 30) {
      category = "High";
      color = "#f59e0b";
      risk = "Medium-High Risk";
    } else if (competitorCount > 10) {
      category = "Moderate";
      color = "#11b6e9";
      risk = "Medium Risk";
    }
    
    return [
      { name: "Competition Level", value: competitorCount, category, color, risk }
    ];
  };

  const { score: opportunityScore, grade } = getMarketOpportunity();
  const { isValid } = getMarketSizingHealth();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-market-analysis">Market Analysis</h1>
                <p className="text-lg text-muted-foreground">Comprehensive TAM/SAM/SOM analysis for UK Innovator Founder visa scalability assessment</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
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
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Atlas, our Growth Expert, helps you define your market opportunity for visa scalability.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Calculate TAM, SAM, and SOM properly</li>
                    <li>Understand market growth dynamics</li>
                    <li>Identify competitive landscape</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the market analysis when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="market-analysis"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Market Analysis"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-market-analysis">
              <TabsTrigger value="analyzer" data-testid="tab-analyzer">Analyzer</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={opportunityScore >= 75 ? "border-green-500" : opportunityScore >= 60 ? "border-orange-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Market Opportunity</p>
                      <p className="text-3xl font-bold" data-testid="text-opportunity-score">{opportunityScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {opportunityScore >= 75 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : opportunityScore >= 60 ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-sm" data-testid="text-opportunity-grade">{grade}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Addressable Market</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-tam">£{(tam / 1000000).toFixed(0)}M</p>
                      <p className="text-xs text-muted-foreground mt-2">Global/regional demand</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Market Growth Rate</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-growth-rate">{marketGrowth}%</p>
                      <p className="text-xs text-muted-foreground mt-2">Annual CAGR</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isValid ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Sizing Validation</p>
                      <p className="text-3xl font-bold" data-testid="text-sizing-valid">{isValid ? 'VALID' : 'REVIEW'}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {isValid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-sm">{isValid ? 'Realistic ratios' : 'Needs adjustment'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {opportunityScore < 60 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription data-testid="alert-low-score">
                    Market opportunity score below 60% may not demonstrate sufficient scalability for UK Innovator Founder visa. Review TAM, growth rate, and market maturity inputs.
                  </AlertDescription>
                </Alert>
              )}

              {!isValid && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription data-testid="alert-sizing-invalid">
                    Market sizing validation failed. Endorsing bodies expect realistic TAM/SAM/SOM ratios. Review the Smart Tips tab for specific guidance.
                  </AlertDescription>
                </Alert>
              )}

              {opportunityScore >= 75 && isValid && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400" data-testid="alert-strong-market">
                    Excellent! Your market analysis demonstrates strong scalability and viability alignment with UK Innovator Founder visa criteria.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Market Sizing (TAM/SAM/SOM Framework)</CardTitle>
                  <CardDescription>Define your addressable market opportunity using industry-standard framework</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="tam" className="text-sm font-medium">Total Addressable Market (TAM) - £</Label>
                        <span className="text-sm text-muted-foreground" data-testid="text-tam-display">£{(tam / 1000000).toFixed(1)}M</span>
                      </div>
                      <Input
                        id="tam"
                        type="number"
                        value={tam}
                        onChange={(e) => setTam(parseFloat(e.target.value) || 0)}
                        placeholder="5000000000"
                        data-testid="input-tam"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Total global/regional demand for your product/service category</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="sam" className="text-sm font-medium">Serviceable Addressable Market (SAM) - £</Label>
                        <span className="text-sm text-muted-foreground" data-testid="text-sam-display">£{(sam / 1000000).toFixed(1)}M ({((sam/tam)*100).toFixed(1)}% of TAM)</span>
                      </div>
                      <Input
                        id="sam"
                        type="number"
                        value={sam}
                        onChange={(e) => setSam(parseFloat(e.target.value) || 0)}
                        placeholder="500000000"
                        data-testid="input-sam"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Portion of TAM you can realistically serve with your business model and geography</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="som" className="text-sm font-medium">Serviceable Obtainable Market (SOM) - £</Label>
                        <span className="text-sm text-muted-foreground" data-testid="text-som-display">£{(som / 1000000).toFixed(1)}M ({((som/sam)*100).toFixed(1)}% of SAM)</span>
                      </div>
                      <Input
                        id="som"
                        type="number"
                        value={som}
                        onChange={(e) => setSom(parseFloat(e.target.value) || 0)}
                        placeholder="50000000"
                        data-testid="input-som"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Realistic market share achievable in first 1-3 years</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Characteristics</CardTitle>
                  <CardDescription>Define growth rate, maturity, and competitive landscape</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="growth" className="text-sm font-medium">Annual Market Growth Rate (CAGR) - %</Label>
                      <span className="text-sm font-semibold" data-testid="text-growth-display">{marketGrowth}%</span>
                    </div>
                    <Slider
                      id="growth"
                      min={0}
                      max={50}
                      step={1}
                      value={[marketGrowth]}
                      onValueChange={(val) => setMarketGrowth(val[0])}
                      data-testid="slider-growth"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Industry growth rate (CAGR) - endorsing bodies prefer 15%+ for scalability</p>
                  </div>

                  <div>
                    <Label htmlFor="maturity" className="text-sm font-medium mb-2 block">Market Maturity Stage</Label>
                    <select
                      id="maturity"
                      value={marketMaturity}
                      onChange={(e) => setMarketMaturity(e.target.value as any)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-maturity"
                    >
                      <option value="emerging">Emerging (new market, high uncertainty)</option>
                      <option value="growth">Growth (rapid expansion, optimal for innovation visa)</option>
                      <option value="mature">Mature (established, slower growth, higher competition)</option>
                      <option value="declining">Declining (shrinking market, high risk)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Growth and emerging stages are most favorable for visa assessment</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="competitors" className="text-sm font-medium">Number of Direct Competitors</Label>
                      <span className="text-sm font-semibold" data-testid="text-competitors-display">{competitorCount}</span>
                    </div>
                    <Slider
                      id="competitors"
                      min={0}
                      max={100}
                      step={1}
                      value={[competitorCount]}
                      onValueChange={(val) => setCompetitorCount(val[0])}
                      data-testid="slider-competitors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Number of companies offering similar solutions in your target market</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Context & Evidence</CardTitle>
                  <CardDescription>Document target segments, trends, pain points, and barriers for endorsement review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="segments" className="text-sm font-medium mb-2 block">Target Customer Segments</Label>
                    <Textarea
                      id="segments"
                      value={targetSegments}
                      onChange={(e) => setTargetSegments(e.target.value)}
                      placeholder="e.g., UK SMBs (250-500 employees), Enterprise (500+ employees), specific industries..."
                      rows={3}
                      data-testid="textarea-segments"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Define specific customer segments with size and characteristics</p>
                  </div>

                  <div>
                    <Label htmlFor="trends" className="text-sm font-medium mb-2 block">Key Market Trends Supporting Your Solution</Label>
                    <Textarea
                      id="trends"
                      value={keyTrends}
                      onChange={(e) => setKeyTrends(e.target.value)}
                      placeholder="e.g., AI adoption, remote work trends, regulatory changes, consumer behavior shifts..."
                      rows={3}
                      data-testid="textarea-trends"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Cite UK-specific trends with sources (ONS, industry reports, etc.)</p>
                  </div>

                  <div>
                    <Label htmlFor="painpoints" className="text-sm font-medium mb-2 block">Customer Pain Points You Address</Label>
                    <Textarea
                      id="painpoints"
                      value={customerPainPoints}
                      onChange={(e) => setCustomerPainPoints(e.target.value)}
                      placeholder="e.g., High operational costs, manual processes, compliance challenges, lack of integration..."
                      rows={3}
                      data-testid="textarea-painpoints"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Specific problems your innovation solves with evidence of severity</p>
                  </div>

                  <div>
                    <Label htmlFor="barriers" className="text-sm font-medium mb-2 block">Market Barriers & Your Mitigation Strategy</Label>
                    <Textarea
                      id="barriers"
                      value={marketBarriers}
                      onChange={(e) => setMarketBarriers(e.target.value)}
                      placeholder="e.g., High switching costs (mitigate with seamless migration), regulatory requirements (compliance team), network effects (partnership strategy)..."
                      rows={3}
                      data-testid="textarea-barriers"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Entry barriers and how your business overcomes them</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Funnel (TAM/SAM/SOM)</CardTitle>
                    <CardDescription>Market sizing validation - funnel should narrow progressively</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMarketFunnel()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: '£ Million', position: 'insideBottom', offset: -5 }} />
                        <YAxis dataKey="stage" type="category" />
                        <Tooltip formatter={(value: number) => `£${value.toFixed(1)}M`} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {getMarketFunnel().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>5-Year Market Growth Projection</CardTitle>
                    <CardDescription>Market expansion at {marketGrowth}% CAGR</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={getGrowthProjection()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: '£M', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `£${value.toFixed(1)}M`} />
                        <Legend />
                        <Area type="monotone" dataKey="TAM" stackId="1" stroke="#ffa536" fill="#ffa536" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="SAM" stackId="2" stroke="#11b6e9" fill="#11b6e9" fillOpacity={0.5} />
                        <Area type="monotone" dataKey="SOM" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Opportunity Score Breakdown</CardTitle>
                    <CardDescription>Component scoring: TAM (40pts), Growth (30pts), Maturity (30pts)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getOpportunityBreakdown()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" />
                        <YAxis domain={[0, 40]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Your Score" radius={[8, 8, 0, 0]}>
                          {getOpportunityBreakdown().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                        <Bar dataKey="max" name="Maximum" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Landscape Analysis</CardTitle>
                    <CardDescription>{competitorCount} direct competitors identified</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Competition Level</p>
                          <p className="text-2xl font-bold mt-1" data-testid="text-competition-level">
                            {getCompetitiveData()[0].category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Competitors</p>
                          <p className="text-2xl font-bold mt-1" data-testid="text-competitor-count">{competitorCount}</p>
                        </div>
                      </div>

                      <Progress value={Math.min(100, (competitorCount / 100) * 100)} className="h-2" />

                      <Alert className={competitorCount > 50 ? "border-red-500" : competitorCount > 30 ? "border-orange-500" : "border-green-500"}>
                        <AlertDescription data-testid="text-competition-risk">
                          <strong>Risk Assessment:</strong> {getCompetitiveData()[0].risk}
                          <br />
                          {competitorCount > 50 && "High competition requires exceptional differentiation. Ensure your innovation criterion is strongly supported with unique IP, technology, or business model."}
                          {competitorCount > 30 && competitorCount <= 50 && "Moderate-high competition. Focus on clear competitive advantages and market positioning strategy."}
                          {competitorCount > 10 && competitorCount <= 30 && "Moderate competition provides validation while offering market share opportunity."}
                          {competitorCount <= 10 && "Low competition suggests either emerging market (favorable) or limited market validation (address in business plan)."}
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2 pt-4">
                        <h4 className="text-sm font-semibold">Competition Guidelines for Visa Assessment:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>0-10 competitors: Early market, requires validation evidence</li>
                          <li>10-30 competitors: Optimal - market validated, opportunity exists</li>
                          <li>30-50 competitors: High - needs strong differentiation</li>
                          <li>50+ competitors: Very high - exceptional innovation required</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Innovator Founder Visa Scalability Assessment</CardTitle>
                  <CardDescription>How your market analysis aligns with visa criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {tam >= 100000000 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : tam >= 50000000 ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Significant Market Opportunity</p>
                        <p className="text-sm text-muted-foreground">
                          Your TAM of £{(tam/1000000).toFixed(0)}M {tam >= 100000000 ? 'exceeds £100M, demonstrating excellent scalability potential' : tam >= 50000000 ? 'meets minimum £50M threshold but could be strengthened to £100M+' : 'is below recommended £50M minimum - consider broader market definition'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {marketGrowth >= 15 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : marketGrowth >= 10 ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">High Growth Potential</p>
                        <p className="text-sm text-muted-foreground">
                          Market growing at {marketGrowth}% CAGR {marketGrowth >= 15 ? 'meets endorsing body preference for 15%+ growth' : marketGrowth >= 10 ? 'shows growth but 15%+ would strengthen case' : 'is below optimal growth rate - highlight other scaling opportunities'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Realistic Market Capture</p>
                        <p className="text-sm text-muted-foreground">
                          Your TAM/SAM/SOM ratios are {isValid ? 'within realistic bounds, demonstrating credible market analysis' : 'outside recommended ranges - review Smart Tips for specific adjustments'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {(marketMaturity === "growth" || marketMaturity === "emerging") ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : marketMaturity === "mature" ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Market Maturity & Timing</p>
                        <p className="text-sm text-muted-foreground">
                          {marketMaturity === "growth" ? 'Growth stage market is optimal for scaling businesses and innovation visa applications' : marketMaturity === "emerging" ? 'Emerging market offers early-mover advantage but requires stronger validation evidence' : marketMaturity === "mature" ? 'Mature market requires exceptional differentiation to demonstrate innovation criterion' : 'CRITICAL: Declining market poses significant viability risk - consider pivot or market repositioning'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {opportunityScore >= 75 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : opportunityScore >= 60 ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Overall Market Opportunity Score</p>
                        <p className="text-sm text-muted-foreground">
                          {opportunityScore >= 75 ? 'Excellent score demonstrates strong alignment with scalability and viability criteria' : opportunityScore >= 60 ? 'Acceptable score but improvements recommended - see Smart Tips for specific actions' : 'Below threshold - critical improvements needed before endorsement application'}
                        </p>
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
                  <CardDescription>AI-powered analysis of your market opportunity with specific improvement actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`tip-${index}`}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Evidence Requirements for UK Visa</CardTitle>
                  <CardDescription>Documentation needed to support your market analysis claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Market Size Evidence</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>UK Office for National Statistics (ONS) data relevant to your sector</li>
                        <li>Industry association reports (e.g., TechUK, BEIS sector analysis)</li>
                        <li>Market research firm data (Gartner, IDC, Forrester, Statista)</li>
                        <li>Government sector analyses and forecasts</li>
                        <li>Trade body statistics showing UK market size</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. Growth Rate Evidence</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Historical UK market growth data (minimum 3-5 years)</li>
                        <li>Industry forecasts from credible third-party sources</li>
                        <li>UK-specific CAGR calculations with clear methodology</li>
                        <li>Comparison to global market growth rates</li>
                        <li>Trend analysis supporting continued growth</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. Competitive Analysis Evidence</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>List of top UK competitors with estimated market share</li>
                        <li>Competitive positioning matrix showing differentiation</li>
                        <li>Your unique value proposition vs established players</li>
                        <li>Barriers to entry and your mitigation strategies</li>
                        <li>Competitive advantages (IP, technology, partnerships)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4. Customer Validation Evidence</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>UK customer demographics and firmographics</li>
                        <li>Target segment size and accessibility data</li>
                        <li>Customer pain point validation (surveys, interviews, focus groups)</li>
                        <li>Willingness to pay evidence (pricing research, pilot customers)</li>
                        <li>Letters of intent or pilot agreements from UK customers</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">5. Trend Validation</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>UK-specific market trend data and analysis</li>
                        <li>Technology adoption rates in UK market</li>
                        <li>Regulatory changes supporting your market opportunity</li>
                        <li>Consumer/business behavior shifts backed by research</li>
                        <li>Government initiatives aligned with your sector</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Market Analysis Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline to complete comprehensive market analysis for UK Innovator Founder visa endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.priority === 'Critical' ? 'bg-destructive/10 text-destructive font-semibold' :
                              item.priority === 'High' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold' :
                              'bg-muted text-muted-foreground'
                            }`} data-testid={`priority-${index}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm" data-testid={`action-description-${index}`}>{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis Best Practices</CardTitle>
                  <CardDescription>Key principles for endorsement-ready market research</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Use Multiple Methodologies</p>
                        <p className="text-sm text-muted-foreground">Calculate TAM using both bottom-up (customer count × avg spend) and top-down (total market × penetration) approaches. Endorsing bodies value triangulated estimates.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Document All Assumptions</p>
                        <p className="text-sm text-muted-foreground">Every market sizing calculation should have clear, documented assumptions that can be defended. Include sources, methodology, and conservative vs aggressive scenarios.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Prioritize UK-Specific Data</p>
                        <p className="text-sm text-muted-foreground">While global market context is valuable, focus on UK market opportunity since your visa application is UK-specific. Use ONS, UK industry reports, and UK customer validation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Validate with Primary Research</p>
                        <p className="text-sm text-muted-foreground">Supplement third-party market data with your own customer interviews, surveys, or pilot programs. This demonstrates market validation beyond desk research.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Connect Market Size to Job Creation</p>
                        <p className="text-sm text-muted-foreground">Endorsing bodies assess whether your market opportunity supports creating 5 jobs at £25k+ salary. Explicitly link market size to your hiring plan and revenue projections.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Address Market Risks Proactively</p>
                        <p className="text-sm text-muted-foreground">Don't hide market challenges. Identify competitive threats, barriers to entry, and risks - then demonstrate your mitigation strategies. This builds credibility.</p>
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
