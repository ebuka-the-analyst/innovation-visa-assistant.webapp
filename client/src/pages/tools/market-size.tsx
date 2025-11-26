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
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Target, Globe, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Large market opportunity demonstrates growth potential
// Viability Criterion: Addressable market supports business sustainability
// Evidence Requirement: UK-specific market sizing with credible sources

type MarketApproach = 'top-down' | 'bottom-up' | 'both';

export default function MarketSizing() {
  const [tam, setTam] = useState(5000000000);
  const [sam, setSam] = useState(500000000);
  const [som, setSom] = useState(50000000);
  const [targetSegment, setTargetSegment] = useState("UK SMBs using cloud-based business software");
  const [growthRate, setGrowthRate] = useState(25);
  const [marketApproach, setMarketApproach] = useState<MarketApproach>('both');
  const [ukMarketShare, setUkMarketShare] = useState(30);
  const [targetCustomers, setTargetCustomers] = useState(50000);
  const [avgRevenue, setAvgRevenue] = useState(10000);
  const [evidenceSources, setEvidenceSources] = useState("ONS Digital Economy Survey 2024, Tech Nation Report, UK SaaS Market Analysis");
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedDate, setSavedDate] = useState('');

  // Advanced: Market Sizing Confidence Score
  // Formula: Based on approach, evidence quality, and ratio validation
  const getConfidenceScore = (): { score: number; grade: string } => {
    let score = 0;
    
    // Approach validation (30 points)
    if (marketApproach === 'both') score += 30;
    else if (marketApproach === 'top-down') score += 20;
    else score += 15;
    
    // TAM/SAM/SOM ratio validation (40 points)
    const samRatio = sam / tam;
    const somRatio = som / sam;
    
    if (samRatio >= 0.05 && samRatio <= 0.5) score += 20;
    else if (samRatio >= 0.02 && samRatio <= 0.7) score += 10;
    else score += 5;
    
    if (somRatio >= 0.01 && somRatio <= 0.15) score += 20;
    else if (somRatio >= 0.005 && somRatio <= 0.25) score += 10;
    else score += 5;
    
    // Evidence quality (30 points)
    const sourceCount = evidenceSources.split(',').length;
    if (sourceCount >= 3) score += 30;
    else if (sourceCount >= 2) score += 20;
    else score += 10;
    
    let grade = 'F - Unreliable';
    if (score >= 85) grade = 'A - High Confidence';
    else if (score >= 70) grade = 'B - Good Confidence';
    else if (score >= 55) grade = 'C - Moderate Confidence';
    else if (score >= 40) grade = 'D - Low Confidence';
    
    return { score, grade };
  };

  // Advanced: Market Health Assessment
  const getMarketHealth = (): { score: number; grade: string } => {
    let score = 0;
    
    if (tam >= 1000000000) score += 30;
    else if (tam >= 500000000) score += 20;
    else score += 10;
    
    const samRatio = sam / tam;
    if (samRatio >= 0.1) score += 25;
    else if (samRatio >= 0.05) score += 15;
    else score += 5;
    
    const somRatio = som / sam;
    if (somRatio >= 0.1) score += 25;
    else if (somRatio >= 0.05) score += 15;
    else score += 5;
    
    if (growthRate >= 30) score += 20;
    else if (growthRate >= 20) score += 15;
    else score += 5;
    
    let grade = 'F - Small Market';
    if (score >= 85) grade = 'A - Huge Market';
    else if (score >= 70) grade = 'B - Large Market';
    else if (score >= 55) grade = 'C - Moderate Market';
    else if (score >= 40) grade = 'D - Limited Market';
    
    return { score, grade };
  };

  const getSerializedState = () => {
    return {
      tam,
      sam,
      som,
      targetSegment,
      growthRate,
      marketApproach,
      ukMarketShare,
      targetCustomers,
      avgRevenue,
      evidenceSources,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('tam' in state) setTam(state.tam);
    if ('sam' in state) setSam(state.sam);
    if ('som' in state) setSom(state.som);
    if ('targetSegment' in state) setTargetSegment(state.targetSegment);
    if ('growthRate' in state) setGrowthRate(state.growthRate);
    if ('marketApproach' in state) setMarketApproach(state.marketApproach);
    if ('ukMarketShare' in state) setUkMarketShare(state.ukMarketShare);
    if ('targetCustomers' in state) setTargetCustomers(state.targetCustomers);
    if ('avgRevenue' in state) setAvgRevenue(state.avgRevenue);
    if ('evidenceSources' in state) setEvidenceSources(state.evidenceSources);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('market-size-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('market-size-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('market-size-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const { score: healthScore } = getMarketHealth();
    const { score: confidenceScore } = getConfidenceScore();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    
    if (tam < 1000000000) {
      tips.push("TAM below £1B may limit scalability narrative. Consider broader market definition or include adjacent markets to strengthen UK Innovator Founder visa case.");
    }
    
    if (tam >= 1000000000 && tam < 5000000000) {
      tips.push("TAM of £" + (tam/1000000000).toFixed(1) + "B is good but endorsing bodies prefer £5B+ for exceptional scalability. Document path to larger total market opportunity.");
    }
    
    if (parseFloat(samPercent) < 5) {
      tips.push("SAM is only " + samPercent + "% of TAM. This may indicate overly narrow targeting. Consider if your business model can serve a broader serviceable market.");
    }
    
    if (parseFloat(samPercent) > 50) {
      tips.push("SAM exceeds 50% of TAM which appears unrealistic. Endorsing bodies expect conservative assumptions. Review serviceable market definition and constraints.");
    }
    
    if (parseFloat(somPercent) < 1) {
      tips.push("SOM is less than 1% of SAM (" + somPercent + "%). While conservative, this may appear too pessimistic. Document realistic market capture strategy for Years 1-3.");
    }
    
    if (parseFloat(somPercent) > 15) {
      tips.push("SOM exceeds 15% of SAM which may appear overly optimistic to endorsing bodies. Provide strong evidence for market penetration assumptions.");
    }
    
    if (growthRate < 15) {
      tips.push("Market growth rate below 15% CAGR. Focus on identifying faster-growing segments or document how your innovation accelerates market growth.");
    }
    
    if (marketApproach !== 'both') {
      tips.push("Using only " + marketApproach + " approach reduces credibility. Best practice: validate with both top-down (TAM from industry data) and bottom-up (customers x revenue) methods.");
    }
    
    if (evidenceSources.length < 30 || evidenceSources.split(',').length < 2) {
      tips.push("Limited evidence sources documented. Endorsing bodies require UK-specific data from credible sources: ONS, Gartner, industry reports, trade associations.");
    }
    
    if (confidenceScore < 70) {
      tips.push("Market sizing confidence score is " + confidenceScore + "% (below target). Strengthen by: using both methodologies, citing 3+ credible sources, validating TAM/SAM/SOM ratios.");
    }
    
    if (healthScore >= 85) {
      tips.push("Excellent market opportunity (" + healthScore + "%). This strongly supports UK Innovator Founder visa scalability criterion. Ensure all figures are well-documented with UK evidence.");
    }
    
    const bottomUpSOM = (targetCustomers * avgRevenue);
    const variance = Math.abs((som - bottomUpSOM) / som) * 100;
    if (variance > 20) {
      tips.push("Top-down SOM (£" + (som/1000000).toFixed(1) + "M) differs significantly from bottom-up (£" + (bottomUpSOM/1000000).toFixed(1) + "M). Reconcile these estimates or document reasons for variance.");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Research UK market size using ONS data, industry reports (Gartner, IDC), and trade association statistics for your sector", priority: "Critical" },
      { week: "Week 1", action: "Define TAM using top-down approach: identify total UK/global market value from credible third-party sources", priority: "Critical" },
      { week: "Week 1-2", action: "Calculate bottom-up TAM: estimate total potential customers multiplied by average revenue per customer", priority: "High" },
      { week: "Week 2", action: "Define SAM by applying realistic constraints: geography (UK focus), customer segments you can serve, distribution channels available", priority: "Critical" },
      { week: "Week 2", action: "Calculate SOM for Years 1-3 based on realistic market penetration: consider go-to-market strategy, sales cycle, competitive position", priority: "Critical" },
      { week: "Week 2-3", action: "Document market growth rate (CAGR) with evidence from industry forecasts and historical UK market data", priority: "High" },
      { week: "Week 3", action: "Validate all figures using both top-down and bottom-up methodologies - reconcile any significant differences", priority: "Critical" },
      { week: "Week 3", action: "Gather and cite specific evidence sources: exact report names, publication dates, page numbers, URLs", priority: "High" },
      { week: "Week 3-4", action: "Create market segmentation analysis showing breakdown of SAM by customer type, region, or industry vertical", priority: "Medium" },
      { week: "Week 4", action: "Prepare competitor analysis showing market share distribution and your path to capturing SOM", priority: "High" },
      { week: "Week 4", action: "Document assumptions clearly: why SAM is X% of TAM, why you can capture Y% of SAM in 3 years", priority: "Critical" },
      { week: "Week 4", action: "Compile market sizing into endorsement-ready format with all evidence citations and methodology explanation", priority: "High" },
    ];
  };

  const handleExport = () => {
    const { score: healthScore, grade: healthGrade } = getMarketHealth();
    const { score: confidenceScore, grade: confidenceGrade } = getConfidenceScore();
    const samPercent = ((sam / tam) * 100).toFixed(1);
    const somPercent = ((som / sam) * 100).toFixed(1);
    const bottomUpSOM = (targetCustomers * avgRevenue);
    
    const content = `UK INNOVATOR FOUNDER VISA - MARKET SIZING ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}

${'='.repeat(70)}
EXECUTIVE SUMMARY (UK Innovator Founder Visa Context)
${'='.repeat(70)}
Market Opportunity Score: ${healthScore}% (${healthGrade})
Sizing Confidence Score: ${confidenceScore}% (${confidenceGrade})
Methodology: ${marketApproach === 'both' ? 'Both Top-Down and Bottom-Up' : marketApproach === 'top-down' ? 'Top-Down Only' : 'Bottom-Up Only'}

Market Size (TAM/SAM/SOM):
  Total Addressable Market: £${(tam / 1000000000).toFixed(2)}B
  Serviceable Addressable: £${(sam / 1000000).toFixed(0)}M
  Serviceable Obtainable: £${(som / 1000000).toFixed(0)}M

Market Growth: ${growthRate}% annually (CAGR)

${healthScore >= 75 ? 'LARGE MARKET - Strong scalability potential for UK Innovator Founder visa' : healthScore >= 60 ? 'MODERATE MARKET - Strengthen for endorsement' : 'LIMITED MARKET - Expand addressable opportunity'}

${'='.repeat(70)}
MARKET SIZING METHODOLOGY
${'='.repeat(70)}

APPROACH USED: ${marketApproach.toUpperCase()}
${marketApproach === 'both' ? 'Using both methodologies provides highest credibility with endorsing bodies' : 'Consider validating with ' + (marketApproach === 'top-down' ? 'bottom-up' : 'top-down') + ' approach for stronger evidence'}

TOP-DOWN METHODOLOGY:
Definition: Start with total market size from industry data, then narrow down
Data Sources: ${evidenceSources}
Calculation Chain:
  1. TAM: £${tam.toLocaleString()} (Total market from industry reports)
  2. SAM: £${sam.toLocaleString()} = ${samPercent}% of TAM
     (Apply constraints: geography, channels, segments you can serve)
  3. SOM: £${som.toLocaleString()} = ${somPercent}% of SAM
     (Realistic market share achievable in 3-5 years)

BOTTOM-UP METHODOLOGY:
Definition: Build up from unit economics and target customer base
Calculation:
  Target Customers: ${targetCustomers.toLocaleString()} UK businesses/consumers
  Average Revenue per Customer: £${avgRevenue.toLocaleString()} annually
  Bottom-Up SOM = ${targetCustomers.toLocaleString()} × £${avgRevenue.toLocaleString()} = £${bottomUpSOM.toLocaleString()}
  Bottom-Up SOM (Millions): £${(bottomUpSOM / 1000000).toFixed(1)}M

METHODOLOGY VALIDATION:
Top-Down SOM: £${(som / 1000000).toFixed(1)}M
Bottom-Up SOM: £${(bottomUpSOM / 1000000).toFixed(1)}M
Variance: ${Math.abs(((som - bottomUpSOM) / som) * 100).toFixed(1)}%
${Math.abs(((som - bottomUpSOM) / som) * 100) < 20 ? 'Low variance - estimates align well' : 'High variance - review assumptions and reconcile differences'}

${'='.repeat(70)}
DETAILED MARKET SIZING FRAMEWORK (TAM/SAM/SOM)
${'='.repeat(70)}

TOTAL ADDRESSABLE MARKET (TAM):
£${(tam / 1000000000).toFixed(2)}B (£${tam.toLocaleString()})
Definition: Total market demand if 100% market share achieved globally or in defined region
UK Market Component: Approximately ${ukMarketShare}% of global TAM
UK TAM Estimate: £${((tam * ukMarketShare / 100) / 1000000).toFixed(0)}M

Sizing Assessment:
${tam >= 5000000000 ? 'EXCELLENT: Very large TAM (£5B+) demonstrates exceptional scalability narrative' : tam >= 1000000000 ? 'STRONG: Large TAM (£1B-5B) shows good market size for scaling' : tam >= 100000000 ? 'MODERATE: TAM (£100M-1B) is viable but consider broader definition' : 'WEAK: TAM <£100M may not demonstrate sufficient scalability for visa'}

SERVICEABLE ADDRESSABLE MARKET (SAM):
£${(sam / 1000000).toFixed(0)}M (£${sam.toLocaleString()})
Definition: Portion of TAM you can realistically target with your product/service and business model
SAM as % of TAM: ${samPercent}%

Calculation Methodology:
TAM × Geographic Reach × Target Segments × Channel Capability
Example: £${(tam/1000000).toFixed(0)}M × (UK focus) × (target segments) × (direct sales + partners)

Ratio Assessment:
${parseFloat(samPercent) >= 10 && parseFloat(samPercent) <= 30 ? 'OPTIMAL: SAM/TAM ratio (10-30%) shows realistic addressable market' : parseFloat(samPercent) >= 5 && parseFloat(samPercent) <= 50 ? 'ACCEPTABLE: SAM/TAM ratio (5-50%) is within reasonable bounds' : parseFloat(samPercent) < 5 ? 'LOW: Consider if business model can serve broader market' : 'HIGH: Ratio >50% may appear unrealistic to endorsing bodies'}

${sam >= 500000000 ? 'EXCELLENT: Large SAM (£500M+) supports strong scalability narrative' : sam >= 100000000 ? 'STRONG: Moderate SAM (£100M-500M) demonstrates viable market opportunity' : 'LIMITED: SAM <£100M - validate addressable market size for viability criterion'}

SERVICEABLE OBTAINABLE MARKET (SOM):
£${(som / 1000000).toFixed(0)}M (£${som.toLocaleString()})
Definition: Realistic market share you can capture in first 3-5 years
SOM as % of SAM: ${somPercent}%

Calculation Factors:
- Go-to-market strategy effectiveness
- Sales cycle and customer acquisition rate
- Competitive positioning and differentiation
- Resource constraints (team, funding, time)
- Market penetration timeline

Ratio Assessment:
${parseFloat(somPercent) >= 5 && parseFloat(somPercent) <= 15 ? 'OPTIMAL: SOM/SAM ratio (5-15%) shows ambitious but achievable target' : parseFloat(somPercent) >= 1 && parseFloat(somPercent) <= 20 ? 'ACCEPTABLE: SOM/SAM ratio (1-20%) is within reasonable bounds' : parseFloat(somPercent) < 1 ? 'CONSERVATIVE: Very low SOM may appear pessimistic' : 'AGGRESSIVE: Ratio >20% requires very strong justification'}

${som >= 50000000 ? 'EXCELLENT: Large SOM (£50M+) shows ambitious revenue target' : som >= 10000000 ? 'STRONG: Moderate SOM (£10M-50M) demonstrates realistic 3-5 year goal' : 'LIMITED: SOM <£10M - consider if this supports job creation requirements'}

TARGET SEGMENT:
${targetSegment}

${'='.repeat(70)}
MARKET OPPORTUNITY SCORE CALCULATION
${'='.repeat(70)}
Formula: Market Health = TAM Size (30pts) + SAM Ratio (25pts) + SOM Ratio (25pts) + Growth Rate (20pts)

COMPONENT 1: TAM SIZE (Maximum 30 points)
Scoring Criteria:
  TAM ≥£10B: 30 points (Exceptional)
  TAM £5B-10B: 25 points (Excellent)
  TAM £1B-5B: 20 points (Strong)
  TAM <£1B: 10 points (Limited)

Your TAM: £${(tam / 1000000000).toFixed(2)}B
${tam >= 10000000000 ? 'Points Earned: 30/30 (TAM ≥£10B - Exceptional market size)' : tam >= 5000000000 ? 'Points Earned: 25/30 (TAM £5B-10B - Excellent market)' : tam >= 1000000000 ? 'Points Earned: 20/30 (TAM £1B-5B - Strong market)' : 'Points Earned: 10/30 (TAM <£1B - Limited market)'}

COMPONENT 2: SAM RATIO (Maximum 25 points)
Scoring Criteria:
  SAM/TAM ≥10%: 25 points (Optimal addressable market)
  SAM/TAM 5-10%: 15 points (Acceptable)
  SAM/TAM <5%: 5 points (Narrow targeting)

Your SAM/TAM Ratio: ${samPercent}%
Calculation: £${(sam / 1000000).toFixed(0)}M ÷ £${(tam / 1000000000).toFixed(2)}B × 100 = ${samPercent}%
${(sam / tam) >= 0.1 ? 'Points Earned: 25/25 (Ratio ≥10% - Optimal)' : (sam / tam) >= 0.05 ? 'Points Earned: 15/25 (Ratio 5-10% - Acceptable)' : 'Points Earned: 5/25 (Ratio <5% - Narrow)'}

COMPONENT 3: SOM RATIO (Maximum 25 points)
Scoring Criteria:
  SOM/SAM ≥10%: 25 points (Ambitious target)
  SOM/SAM 5-10%: 15 points (Realistic)
  SOM/SAM <5%: 5 points (Conservative)

Your SOM/SAM Ratio: ${somPercent}%
Calculation: £${(som / 1000000).toFixed(0)}M ÷ £${(sam / 1000000).toFixed(0)}M × 100 = ${somPercent}%
${(som / sam) >= 0.1 ? 'Points Earned: 25/25 (Ratio ≥10% - Ambitious)' : (som / sam) >= 0.05 ? 'Points Earned: 15/25 (Ratio 5-10% - Realistic)' : 'Points Earned: 5/25 (Ratio <5% - Conservative)'}

COMPONENT 4: MARKET GROWTH RATE (Maximum 20 points)
Scoring Criteria:
  Growth ≥30% annually: 20 points (High growth)
  Growth 20-30% annually: 15 points (Strong growth)
  Growth <20% annually: 5 points (Moderate growth)

Your Annual Growth Rate: ${growthRate}% CAGR
${growthRate >= 30 ? 'Points Earned: 20/20 (Growth ≥30% - High growth market)' : growthRate >= 20 ? 'Points Earned: 15/20 (Growth 20-30% - Strong growth)' : 'Points Earned: 5/20 (Growth <20% - Moderate growth)'}

FINAL CALCULATION:
Total Score: ${healthScore}/100 (${healthGrade})
Market Opportunity Assessment: ${healthScore >= 75 ? 'LARGE - Excellent scalability potential' : healthScore >= 60 ? 'MODERATE - Viable but strengthen' : 'LIMITED - Expand market definition'}

${'='.repeat(70)}
SIZING CONFIDENCE SCORE CALCULATION
${'='.repeat(70)}
Formula: Confidence = Methodology (30pts) + Ratio Validation (40pts) + Evidence Quality (30pts)

COMPONENT 1: METHODOLOGY (Maximum 30 points)
${marketApproach === 'both' ? 'Using Both Top-Down and Bottom-Up: 30 points (Best practice)' : marketApproach === 'top-down' ? 'Using Top-Down Only: 20 points (Good but validate with bottom-up)' : 'Using Bottom-Up Only: 15 points (Validate with industry data)'}

COMPONENT 2: RATIO VALIDATION (Maximum 40 points)
SAM/TAM Ratio: ${samPercent}% ${parseFloat(samPercent) >= 5 && parseFloat(samPercent) <= 50 ? '(Valid range 5-50%): 20 points' : '(Outside optimal range): 10 points'}
SOM/SAM Ratio: ${somPercent}% ${parseFloat(somPercent) >= 1 && parseFloat(somPercent) <= 15 ? '(Valid range 1-15%): 20 points' : '(Outside optimal range): 10 points'}

COMPONENT 3: EVIDENCE QUALITY (Maximum 30 points)
Number of Sources: ${evidenceSources.split(',').length}
${evidenceSources.split(',').length >= 3 ? '3+ credible sources: 30 points (Excellent documentation)' : evidenceSources.split(',').length >= 2 ? '2 sources: 20 points (Good but add more)' : '1 source: 10 points (Insufficient - need multiple sources)'}

FINAL CONFIDENCE SCORE: ${confidenceScore}/100 (${confidenceGrade})
${confidenceScore >= 85 ? 'HIGH CONFIDENCE - Market sizing well-supported for endorsement' : confidenceScore >= 70 ? 'GOOD CONFIDENCE - Sizing is credible with documented evidence' : confidenceScore >= 55 ? 'MODERATE CONFIDENCE - Strengthen methodology and evidence' : 'LOW CONFIDENCE - Significant improvements needed'}

${'='.repeat(70)}
5-YEAR MARKET GROWTH PROJECTION
${'='.repeat(70)}
Base Year SOM: £${(som / 1000000).toFixed(1)}M
Annual Growth Rate: ${growthRate}% CAGR
Projection Formula: SOM(year) = Base SOM × (1 + Growth Rate)^years

Year 1: £${(som / 1000000).toFixed(1)}M (baseline)
Year 2: £${(som * (1 + growthRate/100) / 1000000).toFixed(1)}M
Year 3: £${(som * Math.pow(1 + growthRate/100, 2) / 1000000).toFixed(1)}M
Year 4: £${(som * Math.pow(1 + growthRate/100, 3) / 1000000).toFixed(1)}M
Year 5: £${(som * Math.pow(1 + growthRate/100, 4) / 1000000).toFixed(1)}M

Cumulative 5-Year Opportunity: £${((som + som*(1+growthRate/100) + som*Math.pow(1+growthRate/100,2) + som*Math.pow(1+growthRate/100,3) + som*Math.pow(1+growthRate/100,4)) / 1000000).toFixed(1)}M

${'='.repeat(70)}
UK INNOVATOR FOUNDER VISA: SCALABILITY CRITERION
${'='.repeat(70)}
GOV.UK Scalability Assessment Factors:
• Significant market size to support growth (TAM >£100M ideal)
• Clear path to substantial revenue and job creation
• International expansion potential documented
• Market growth rate validates opportunity (15%+ CAGR preferred)
• Realistic market share capture assumptions

CURRENT MARKET ASSESSMENT:
TAM: £${(tam / 1000000000).toFixed(2)}B
${tam >= 1000000000 ? 'STRONG: TAM ≥£1B demonstrates significant total market opportunity' : tam >= 100000000 ? 'ACCEPTABLE: TAM ≥£100M shows viable market' : 'WEAK: TAM <£100M - consider broader market definition for scalability'}

SAM: £${(sam / 1000000).toFixed(0)}M
${sam >= 500000000 ? 'EXCELLENT: SAM ≥£500M supports strong scalability narrative' : sam >= 100000000 ? 'STRONG: SAM ≥£100M demonstrates viable growth opportunity' : 'LIMITED: SAM <£100M - validate addressable market for viability'}

SOM: £${(som / 1000000).toFixed(0)}M (${somPercent}% of SAM)
${som >= 50000000 ? 'EXCELLENT: SOM ≥£50M shows ambitious growth target for 3-5 years' : som >= 10000000 ? 'STRONG: SOM ≥£10M realistic for sustainable scaling' : 'LIMITED: SOM <£10M - may not demonstrate sufficient job creation potential'}

Growth Rate: ${growthRate}% annually
${growthRate >= 20 ? 'HIGH GROWTH: ≥20% CAGR validates strong market opportunity' : growthRate >= 15 ? 'STRONG GROWTH: 15-20% CAGR supports scaling narrative' : 'MODERATE GROWTH: <15% CAGR - highlight segments with faster growth'}

Overall Market Opportunity: ${healthScore}%
${healthScore >= 75 && sam >= 100000000 ? `STRONG ENDORSEMENT CASE: Market opportunity score ${healthScore}% with £${(sam / 1000000).toFixed(0)}M SAM strongly supports UK Innovator Founder visa scalability criterion. Market size demonstrates significant growth potential and sustainable revenue opportunity for job creation.` : healthScore >= 60 ? 'MODERATE ENDORSEMENT CASE: Market opportunity is viable but strengthening SAM (aim for £500M+) or TAM (aim for £5B+) would improve scalability narrative for endorsement.' : 'WEAK ENDORSEMENT CASE: Market opportunity needs expansion - focus on larger TAM definition, broader addressable market (SAM), or higher growth rate to demonstrate scalability potential.'}

${'='.repeat(70)}
UK MARKET EVIDENCE REQUIREMENTS
${'='.repeat(70)}
For UK Innovator Founder visa endorsement, provide:

MARKET SIZE EVIDENCE:
Current Sources Documented:
${evidenceSources.split(',').map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}

Additional Sources to Strengthen Case:
• UK Office for National Statistics (ONS) - Digital Economy, E-commerce, or sector-specific data
• Tech Nation Reports - UK tech sector analysis and forecasts
• Industry Association Reports - relevant trade body statistics and market surveys
• Market Research Firms - Gartner, IDC, Forrester, or sector-specific analysts
• Government Sector Analyses - DCMS, Innovate UK, or departmental reports
• UK-specific CAGR data with 3-5 year historical growth rates

EVIDENCE CITATION FORMAT:
For each source, document:
- Exact report title and publication date
- Organization/publisher name and credibility
- Specific page numbers or sections referenced
- Methodology used to derive market size
- URL or access information for verification
- UK-specific data vs global estimates

CALCULATION TRANSPARENCY:
Document all assumptions:
- How you narrowed TAM to SAM (geographic, segment, channel constraints)
- How you calculated realistic SOM (market penetration rate, timeline)
- Why your UK market share estimate (${ukMarketShare}%) is achievable
- Evidence for growth rate (${growthRate}% CAGR) from credible sources

${'='.repeat(70)}
SMART RECOMMENDATIONS
${'='.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

${'='.repeat(70)}
4-WEEK ACTION PLAN
${'='.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

${'='.repeat(70)}
COMPLIANCE NOTES FOR ENDORSING BODIES
${'='.repeat(70)}
• All market data must be UK-specific or clearly show UK applicability
• Cite credible third-party sources for all market sizing claims (avoid self-published estimates)
• Demonstrate realistic market capture assumptions (avoid overly optimistic projections)
• Show clear connection between market size and job creation potential (5 jobs at £25,694+ salary)
• Align market opportunity with your funding requirements (minimum £50,000 investment)
• Provide evidence of market validation (customer letters of intent, pilot programs, partnerships)
• Document methodology transparency (show both top-down and bottom-up calculations)
• UK focus: Explain how UK market supports initial growth before international expansion

${'='.repeat(70)}
Sources: GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder
Scalability Criterion: Significant market size and growth potential
Endorsing Bodies: Envestors, UKES, Innovator International, GEP
TAM/SAM/SOM Methodology: Market sizing framework for growth planning
Evidence Standards: UK-specific data from credible third-party sources
${'='.repeat(70)}

© 2025 UK Innovator Founder Visa Assistant
Report generated: ${new Date().toLocaleString('en-GB')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-sizing-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart 1: TAM/SAM/SOM Market Funnel (Waterfall/Funnel)
  const getMarketFunnel = () => [
    { stage: "TAM", value: tam / 1000000, fill: "#ffa536" },
    { stage: "SAM", value: sam / 1000000, fill: "#11b6e9" },
    { stage: "SOM", value: som / 1000000, fill: "#10b981" }
  ];

  // Chart 2: 5-Year Growth Projection (Line Chart)
  const getGrowthProjection = () => {
    const years = [0, 1, 2, 3, 4, 5];
    return years.map(year => ({
      year: year === 0 ? 'Now' : `Y${year}`,
      SAM: Math.round((sam / 1000000) * Math.pow(1 + growthRate / 100, year)),
      SOM: Math.round((som / 1000000) * Math.pow(1 + growthRate / 100, year))
    }));
  };

  // Chart 3: Geographic Market Distribution
  const getGeographicDistribution = () => [
    { region: "UK", value: sam * (ukMarketShare / 100), fill: "#ffa536" },
    { region: "EU", value: sam * 0.35, fill: "#11b6e9" },
    { region: "US", value: sam * 0.25, fill: "#10b981" },
    { region: "Other", value: sam * (1 - ukMarketShare/100 - 0.35 - 0.25), fill: "#8b5cf6" }
  ];

  // Chart 4: Top-Down vs Bottom-Up Comparison
  const getMethodologyComparison = () => {
    const bottomUpSOM = targetCustomers * avgRevenue;
    return [
      { method: "Top-Down", value: som / 1000000, fill: "#ffa536" },
      { method: "Bottom-Up", value: bottomUpSOM / 1000000, fill: "#11b6e9" }
    ];
  };

  // Chart 5: Market Opportunity Score Breakdown
  const getOpportunityBreakdown = () => {
    const tamScore = tam >= 1000000000 ? 30 : tam >= 500000000 ? 20 : 10;
    const samRatioScore = (sam / tam) >= 0.1 ? 25 : (sam / tam) >= 0.05 ? 15 : 5;
    const somRatioScore = (som / sam) >= 0.1 ? 25 : (som / sam) >= 0.05 ? 15 : 5;
    const growthScore = growthRate >= 30 ? 20 : growthRate >= 20 ? 15 : 5;
    
    return [
      { component: "TAM Size", score: tamScore, max: 30, fill: "#ffa536" },
      { component: "SAM Ratio", score: samRatioScore, max: 25, fill: "#11b6e9" },
      { component: "SOM Ratio", score: somRatioScore, max: 25, fill: "#10b981" },
      { component: "Growth", score: growthScore, max: 20, fill: "#8b5cf6" }
    ];
  };

  // Chart 6: Confidence Score Components
  const getConfidenceBreakdown = () => {
    const methodScore = marketApproach === 'both' ? 30 : marketApproach === 'top-down' ? 20 : 15;
    const samRatio = sam / tam;
    const somRatio = som / sam;
    const ratioScore = ((samRatio >= 0.05 && samRatio <= 0.5 ? 20 : 10) + (somRatio >= 0.01 && somRatio <= 0.15 ? 20 : 10));
    const evidenceScore = evidenceSources.split(',').length >= 3 ? 30 : evidenceSources.split(',').length >= 2 ? 20 : 10;
    
    return [
      { component: "Methodology", score: methodScore, max: 30, fill: "#ffa536" },
      { component: "Ratio Validation", score: ratioScore, max: 40, fill: "#11b6e9" },
      { component: "Evidence Quality", score: evidenceScore, max: 30, fill: "#10b981" }
    ];
  };

  const { score: healthScore, grade: healthGrade } = getMarketHealth();
  const { score: confidenceScore, grade: confidenceGrade } = getConfidenceScore();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-market-sizing">Market Sizing</h1>
            <p className="text-lg text-muted-foreground">Calculate TAM/SAM/SOM with UK evidence (Innovator Founder Visa)</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="market-size"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Market Sizing"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-market-sizing">
              <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="methodology" data-testid="tab-methodology">Methodology</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={healthScore >= 75 ? "border-green-500" : healthScore >= 60 ? "border-orange-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Market Opportunity</p>
                      <p className="text-3xl font-bold" data-testid="text-health-score">{healthScore}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{healthGrade}</p>
                      <Progress value={healthScore} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">TAM</p>
                      </div>
                      <p className="text-3xl font-bold" data-testid="text-tam">£{(tam / 1000000000).toFixed(1)}B</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Market</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">SAM</p>
                      </div>
                      <p className="text-3xl font-bold" data-testid="text-sam">£{(sam / 1000000).toFixed(0)}M</p>
                      <p className="text-xs text-muted-foreground mt-1">Addressable</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">SOM</p>
                      </div>
                      <p className="text-3xl font-bold" data-testid="text-som">£{(som / 1000000).toFixed(0)}M</p>
                      <p className="text-xs text-muted-foreground mt-1">Obtainable</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top-Down Market Sizing</CardTitle>
                  <CardDescription>Start with total market size from industry data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tam">Total Addressable Market (TAM) £</Label>
                      <Input
                        id="tam"
                        type="number"
                        value={tam}
                        onChange={(e) => setTam(parseFloat(e.target.value) || 0)}
                        placeholder="5000000000"
                        data-testid="input-tam"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Total market if 100% share achieved</p>
                    </div>
                    <div>
                      <Label htmlFor="sam">Serviceable Addressable Market (SAM) £</Label>
                      <Input
                        id="sam"
                        type="number"
                        value={sam}
                        onChange={(e) => setSam(parseFloat(e.target.value) || 0)}
                        placeholder="500000000"
                        data-testid="input-sam"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Market you can realistically serve ({((sam / tam) * 100).toFixed(1)}% of TAM)</p>
                    </div>
                    <div>
                      <Label htmlFor="som">Serviceable Obtainable Market (SOM) £</Label>
                      <Input
                        id="som"
                        type="number"
                        value={som}
                        onChange={(e) => setSom(parseFloat(e.target.value) || 0)}
                        placeholder="50000000"
                        data-testid="input-som"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Realistic 3-5 year capture ({((som / sam) * 100).toFixed(1)}% of SAM)</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="growth">Annual Market Growth Rate: {growthRate}%</Label>
                      <Slider
                        id="growth"
                        value={[growthRate]}
                        onValueChange={(v) => setGrowthRate(v[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                        data-testid="slider-growth"
                      />
                      <p className="text-xs text-muted-foreground mt-1">CAGR from industry forecasts</p>
                    </div>
                    <div>
                      <Label htmlFor="uk-share">UK Share of Global TAM: {ukMarketShare}%</Label>
                      <Slider
                        id="uk-share"
                        value={[ukMarketShare]}
                        onValueChange={(v) => setUkMarketShare(v[0])}
                        max={100}
                        step={5}
                        className="mt-2"
                        data-testid="slider-uk-share"
                      />
                      <p className="text-xs text-muted-foreground mt-1">UK TAM: £{((tam * ukMarketShare / 100) / 1000000).toFixed(0)}M</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="segment">Target Customer Segment</Label>
                    <Textarea
                      id="segment"
                      value={targetSegment}
                      onChange={(e) => setTargetSegment(e.target.value)}
                      placeholder="e.g., UK SMBs (10-250 employees) in professional services using cloud software..."
                      rows={2}
                      data-testid="textarea-segment"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bottom-Up Validation</CardTitle>
                  <CardDescription>Build up from target customers and unit economics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="customers">Target Customers (Year 3)</Label>
                      <Input
                        id="customers"
                        type="number"
                        value={targetCustomers}
                        onChange={(e) => setTargetCustomers(parseFloat(e.target.value) || 0)}
                        placeholder="50000"
                        data-testid="input-customers"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Number of customers you can acquire</p>
                    </div>
                    <div>
                      <Label htmlFor="revenue">Average Revenue per Customer £</Label>
                      <Input
                        id="revenue"
                        type="number"
                        value={avgRevenue}
                        onChange={(e) => setAvgRevenue(parseFloat(e.target.value) || 0)}
                        placeholder="10000"
                        data-testid="input-revenue"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Annual contract value or LTV</p>
                    </div>
                    <div>
                      <Label>Bottom-Up SOM</Label>
                      <Input
                        value={`£${((targetCustomers * avgRevenue) / 1000000).toFixed(1)}M`}
                        disabled
                        data-testid="text-bottom-up-som"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100).toFixed(0)}% variance from top-down
                      </p>
                    </div>
                  </div>

                  <Alert className={Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) < 20 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}>
                    <AlertDescription className={Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) < 20 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
                      {Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) < 20
                        ? "Low variance between methodologies - estimates align well and strengthen credibility"
                        : "High variance between top-down and bottom-up approaches - review assumptions and reconcile differences"}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Market Evidence Sources</CardTitle>
                  <CardDescription>Document credible sources for all market sizing claims</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="evidence">Evidence Sources (comma-separated)</Label>
                    <Textarea
                      id="evidence"
                      value={evidenceSources}
                      onChange={(e) => setEvidenceSources(e.target.value)}
                      placeholder="e.g., ONS Digital Economy Survey 2024, Tech Nation Report 2025, Gartner UK SaaS Market Forecast..."
                      rows={3}
                      data-testid="textarea-evidence"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {evidenceSources.split(',').length} source(s) documented (3+ recommended)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="approach">Market Sizing Methodology</Label>
                    <select
                      id="approach"
                      value={marketApproach}
                      onChange={(e) => setMarketApproach(e.target.value as MarketApproach)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-approach"
                    >
                      <option value="top-down">Top-Down Only (from industry data)</option>
                      <option value="bottom-up">Bottom-Up Only (from unit economics)</option>
                      <option value="both">Both Top-Down and Bottom-Up (recommended)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {marketApproach === 'both'
                        ? "Best practice: Using both methodologies for validation"
                        : "Consider validating with " + (marketApproach === 'top-down' ? 'bottom-up' : 'top-down') + " approach"}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className={confidenceScore >= 75 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Sizing Confidence</p>
                          <p className="text-3xl font-bold" data-testid="text-confidence-score">{confidenceScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{confidenceGrade}</p>
                          <Progress value={confidenceScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Methodology:</span>
                          <span className="font-medium">{marketApproach === 'both' ? '30/30' : marketApproach === 'top-down' ? '20/30' : '15/30'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ratio Validation:</span>
                          <span className="font-medium">
                            {((sam/tam >= 0.05 && sam/tam <= 0.5 ? 20 : 10) + (som/sam >= 0.01 && som/sam <= 0.15 ? 20 : 10))}/40
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Evidence Quality:</span>
                          <span className="font-medium">
                            {evidenceSources.split(',').length >= 3 ? '30/30' : evidenceSources.split(',').length >= 2 ? '20/30' : '10/30'}
                          </span>
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
                    <CardTitle>Market Funnel (TAM/SAM/SOM)</CardTitle>
                    <CardDescription>Waterfall view of addressable market</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMarketFunnel()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: 'Market Size (£M)', position: 'insideBottom', offset: -5 }} />
                        <YAxis type="category" dataKey="stage" width={60} />
                        <Tooltip formatter={(value: number) => `£${value.toFixed(0)}M`} />
                        <Bar dataKey="value">
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
                    <CardTitle>5-Year Growth Projection</CardTitle>
                    <CardDescription>Market opportunity at {growthRate}% CAGR</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getGrowthProjection()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: '£ Millions', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `£${value}M`} />
                        <Legend />
                        <Line type="monotone" dataKey="SAM" stroke="#ffa536" strokeWidth={2} name="SAM Growth" />
                        <Line type="monotone" dataKey="SOM" stroke="#10b981" strokeWidth={2} name="SOM Growth" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Market Distribution</CardTitle>
                    <CardDescription>SAM breakdown by region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getGeographicDistribution()}
                          dataKey="value"
                          nameKey="region"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.region}: £${(entry.value / 1000000).toFixed(0)}M`}
                        >
                          {getGeographicDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `£${(value / 1000000).toFixed(1)}M`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top-Down vs Bottom-Up</CardTitle>
                    <CardDescription>SOM methodology comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMethodologyComparison()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" />
                        <YAxis label={{ value: '£ Millions', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number) => `£${value.toFixed(1)}M`} />
                        <Bar dataKey="value">
                          {getMethodologyComparison().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-center text-muted-foreground mt-2">
                      Variance: {Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Opportunity Score</CardTitle>
                    <CardDescription>Component breakdown of {healthScore}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getOpportunityBreakdown()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" angle={-15} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number, name: string) => [`${value} points`, name === 'score' ? 'Earned' : 'Maximum']} />
                        <Legend />
                        <Bar dataKey="score" name="Earned" stackId="a">
                          {getOpportunityBreakdown().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                        <Bar dataKey="max" name="Maximum" stackId="a" fill="#e5e7eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sizing Confidence Score</CardTitle>
                    <CardDescription>Component breakdown of {confidenceScore}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getConfidenceBreakdown()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="component" angle={-15} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number, name: string) => [`${value} points`, name === 'score' ? 'Earned' : 'Maximum']} />
                        <Legend />
                        <Bar dataKey="score" name="Earned" stackId="a">
                          {getConfidenceBreakdown().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                        <Bar dataKey="max" name="Maximum" stackId="a" fill="#e5e7eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Criterion Alignment</CardTitle>
                  <CardDescription>UK Innovator Founder visa scalability assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {tam >= 1000000000 ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-medium">Total Addressable Market: £{(tam / 1000000000).toFixed(2)}B</p>
                        <p className="text-sm text-muted-foreground">
                          {tam >= 1000000000 ? 'Large TAM (≥£1B) demonstrates significant scalability potential' : 'TAM <£1B may limit scalability narrative - consider broader market definition'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {sam >= 100000000 ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-medium">Serviceable Market: £{(sam / 1000000).toFixed(0)}M ({((sam / tam) * 100).toFixed(1)}% of TAM)</p>
                        <p className="text-sm text-muted-foreground">
                          {sam >= 100000000 ? 'Sufficient addressable market for sustainable UK growth' : 'SAM <£100M - validate addressable market size supports viability'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {som >= 10000000 ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-medium">Obtainable Market: £{(som / 1000000).toFixed(0)}M ({((som / sam) * 100).toFixed(1)}% of SAM)</p>
                        <p className="text-sm text-muted-foreground">
                          {som >= 10000000 ? 'Realistic 3-5 year target supports job creation requirements' : 'SOM <£10M may not demonstrate sufficient scaling potential'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {growthRate >= 15 ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-medium">Market Growth Rate: {growthRate}% CAGR</p>
                        <p className="text-sm text-muted-foreground">
                          {growthRate >= 15 ? 'Strong growth rate validates market opportunity' : 'Growth <15% - focus on faster-growing segments or innovation impact'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {confidenceScore >= 70 ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-medium">Evidence Quality: {confidenceScore}% confidence</p>
                        <p className="text-sm text-muted-foreground">
                          {confidenceScore >= 70 ? 'Well-documented sizing with credible UK sources' : 'Strengthen evidence: use both methodologies, cite 3+ sources, validate ratios'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Sizing Methodology Guide</CardTitle>
                  <CardDescription>Best practices for UK Innovator Founder visa evidence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Top-Down Approach</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Start with total market size from credible industry data, then narrow down to your specific opportunity.
                    </p>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Identify TAM from industry reports (Gartner, IDC, ONS, trade associations)</li>
                      <li>Calculate UK TAM portion (typically 5-15% of global market)</li>
                      <li>Define SAM by applying constraints: geography, segments, channels you can serve</li>
                      <li>Estimate realistic SOM based on market penetration rate over 3-5 years</li>
                      <li>Document all sources and methodology clearly</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Bottom-Up Approach</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Build up from unit economics and target customer acquisition.
                    </p>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Identify total number of potential customers in UK market</li>
                      <li>Estimate average revenue per customer (annual contract value or LTV)</li>
                      <li>Calculate: Total Customers × Average Revenue = Bottom-Up Market Size</li>
                      <li>Apply realistic acquisition rate over time (e.g., 1% of market in Year 1, 3% by Year 3)</li>
                      <li>Validate assumptions with customer interviews or pilot data</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommended UK Data Sources</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium">Government Sources:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Office for National Statistics (ONS)</li>
                          <li>Department for Digital, Culture, Media & Sport</li>
                          <li>UK Trade & Investment sector reports</li>
                          <li>Innovate UK market analyses</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Industry Sources:</p>
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Gartner, IDC, Forrester reports</li>
                          <li>Tech Nation UK tech sector data</li>
                          <li>Trade association statistics</li>
                          <li>UK market research firms</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Validation Ratios</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>SAM / TAM:</span>
                        <span className="font-medium">{((sam / tam) * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${(sam/tam >= 0.05 && sam/tam <= 0.5) ? 'text-green-600' : 'text-orange-600'}`}>
                          {(sam/tam >= 0.05 && sam/tam <= 0.5) ? 'Valid (5-50%)' : 'Outside range'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>SOM / SAM:</span>
                        <span className="font-medium">{((som / sam) * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${(som/sam >= 0.01 && som/sam <= 0.15) ? 'text-green-600' : 'text-orange-600'}`}>
                          {(som/sam >= 0.01 && som/sam <= 0.15) ? 'Valid (1-15%)' : 'Outside range'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>Methodology Variance:</span>
                        <span className="font-medium">{Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) < 20 ? 'text-green-600' : 'text-orange-600'}`}>
                          {Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) < 20 ? 'Low variance' : 'High - reconcile'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Key for Endorsing Bodies:</strong> Use both top-down and bottom-up approaches, cite 3+ credible UK-specific sources, document all assumptions clearly, and ensure ratios are realistic. Avoid overly optimistic projections that reduce credibility.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Context-aware tips based on your market sizing inputs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, i) => (
                      <Alert key={i} className="border-primary/20 bg-primary/5">
                        <AlertDescription className="text-sm">{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Market Evidence Checklist</CardTitle>
                  <CardDescription>Required documentation for endorsing bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">TAM Evidence</p>
                        <p className="text-xs text-muted-foreground">
                          Cite specific industry report with publication date, page number, and methodology. Prefer UK-specific data over global estimates.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">SAM Calculation</p>
                        <p className="text-xs text-muted-foreground">
                          Document how you narrowed TAM to SAM: geographic constraints, target segments, distribution channels available.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">SOM Justification</p>
                        <p className="text-xs text-muted-foreground">
                          Explain realistic market penetration: customer acquisition rate, sales cycle, competitive position, go-to-market strategy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Growth Rate Evidence</p>
                        <p className="text-xs text-muted-foreground">
                          Cite CAGR from industry forecasts with 3-5 year historical data and UK-specific growth drivers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Methodology Documentation</p>
                        <p className="text-xs text-muted-foreground">
                          Show both top-down (industry data) and bottom-up (unit economics) calculations. Reconcile any variance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Competitive Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Include market share distribution, top competitors, and your differentiation strategy to capture target SOM.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Market Sizing Action Plan</CardTitle>
                  <CardDescription>Structured roadmap to complete comprehensive market analysis with UK evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {item.priority}
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

              <Card>
                <CardHeader>
                  <CardTitle>Priority Actions Based on Your Data</CardTitle>
                  <CardDescription>Immediate next steps to strengthen your market sizing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthScore < 75 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Priority 1:</strong> Market opportunity score ({healthScore}%) below target. Focus on increasing TAM to £1B+ or demonstrating stronger growth rate (20%+ CAGR).
                        </AlertDescription>
                      </Alert>
                    )}

                    {confidenceScore < 70 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Priority 2:</strong> Sizing confidence ({confidenceScore}%) needs improvement. {marketApproach !== 'both' && 'Use both top-down and bottom-up methodologies. '}{evidenceSources.split(',').length < 3 && 'Cite 3+ credible UK sources.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {((sam / tam) < 0.05 || (sam / tam) > 0.5) && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Priority 3:</strong> SAM/TAM ratio ({((sam / tam) * 100).toFixed(1)}%) outside optimal range (5-50%). Review serviceable market definition.
                        </AlertDescription>
                      </Alert>
                    )}

                    {((som / sam) < 0.01 || (som / sam) > 0.15) && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Priority 4:</strong> SOM/SAM ratio ({((som / sam) * 100).toFixed(1)}%) outside optimal range (1-15%). Adjust market capture assumptions for realism.
                        </AlertDescription>
                      </Alert>
                    )}

                    {Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100) > 20 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Priority 5:</strong> High variance ({Math.abs(((som - (targetCustomers * avgRevenue)) / som) * 100).toFixed(0)}%) between top-down and bottom-up estimates. Reconcile differences and document rationale.
                        </AlertDescription>
                      </Alert>
                    )}

                    {healthScore >= 75 && confidenceScore >= 70 && (
                      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-600 dark:text-green-400">
                          <strong>Excellent progress!</strong> Your market sizing is strong. Final step: compile all evidence into endorsement-ready format with clear citations and methodology documentation.
                        </AlertDescription>
                      </Alert>
                    )}
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
