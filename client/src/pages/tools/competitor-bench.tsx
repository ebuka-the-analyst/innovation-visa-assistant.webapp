import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, Plus, X, Target, TrendingUp, Shield, Award } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  innovation: number;
  pricing: number;
  customerSat: number;
  funding: number;
  features: number;
  strengths: string;
  weaknesses: string;
}

interface YourBusiness {
  innovation: number;
  pricing: number;
  customerSat: number;
  marketShare: number;
  funding: number;
  features: number;
}

export default function CompetitorBench() {
  const [yourBusiness, setYourBusiness] = useState<YourBusiness>({
    innovation: 80,
    pricing: 70,
    customerSat: 75,
    marketShare: 5,
    funding: 50,
    features: 85
  });

  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "1",
      name: "Competitor A",
      marketShare: 25,
      innovation: 60,
      pricing: 65,
      customerSat: 70,
      funding: 85,
      features: 70,
      strengths: "Market leader with strong brand recognition and established customer base",
      weaknesses: "Slow innovation cycle, legacy tech stack, higher pricing"
    }
  ]);

  const [activeTab, setActiveTab] = useState('benchmark');
  const [savedDate, setSavedDate] = useState('');

  const updateYourBusiness = (field: keyof YourBusiness, value: number) => {
    setYourBusiness(prev => ({ ...prev, [field]: value }));
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, {
      id: Date.now().toString(),
      name: "New Competitor",
      marketShare: 10,
      innovation: 50,
      pricing: 50,
      customerSat: 50,
      funding: 50,
      features: 50,
      strengths: "",
      weaknesses: ""
    }]);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: any) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const getCompetitiveAdvantage = (): { score: number; grade: string; advantages: number } => {
    if (competitors.length === 0) {
      return { score: 50, grade: 'C - No Comparison Data', advantages: 0 };
    }

    let advantages = 0;
    const avgCompetitor = {
      innovation: competitors.reduce((s, c) => s + c.innovation, 0) / competitors.length,
      pricing: competitors.reduce((s, c) => s + c.pricing, 0) / competitors.length,
      customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / competitors.length,
      features: competitors.reduce((s, c) => s + c.features, 0) / competitors.length
    };

    if (yourBusiness.innovation > avgCompetitor.innovation) advantages++;
    if (yourBusiness.pricing > avgCompetitor.pricing) advantages++;
    if (yourBusiness.customerSat > avgCompetitor.customerSat) advantages++;
    if (yourBusiness.features > avgCompetitor.features) advantages++;

    const innovationGap = yourBusiness.innovation - avgCompetitor.innovation;
    const pricingGap = yourBusiness.pricing - avgCompetitor.pricing;
    const satisfactionGap = yourBusiness.customerSat - avgCompetitor.customerSat;
    const featuresGap = yourBusiness.features - avgCompetitor.features;

    const score = Math.min(100, Math.max(0, Math.round(50 + (innovationGap + pricingGap + satisfactionGap + featuresGap) / 4)));

    let grade = 'F - Weak Position';
    if (score >= 85) grade = 'A - Strong Lead';
    else if (score >= 70) grade = 'B - Competitive';
    else if (score >= 55) grade = 'C - At Par';
    else if (score >= 40) grade = 'D - Behind';

    return { score, grade, advantages };
  };

  const { score: competitiveScore, grade: competitiveGrade, advantages: competitiveAdvantages } = getCompetitiveAdvantage();

  const avgCompetitor = competitors.length > 0 ? {
    innovation: competitors.reduce((s, c) => s + c.innovation, 0) / competitors.length,
    pricing: competitors.reduce((s, c) => s + c.pricing, 0) / competitors.length,
    customerSat: competitors.reduce((s, c) => s + c.customerSat, 0) / competitors.length,
    funding: competitors.reduce((s, c) => s + c.funding, 0) / competitors.length,
    features: competitors.reduce((s, c) => s + c.features, 0) / competitors.length,
    marketShare: competitors.reduce((s, c) => s + c.marketShare, 0) / competitors.length
  } : null;

  const radarData = avgCompetitor ? [
    { metric: 'Innovation', you: yourBusiness.innovation, market: avgCompetitor.innovation },
    { metric: 'Pricing', you: yourBusiness.pricing, market: avgCompetitor.pricing },
    { metric: 'Customer Sat', you: yourBusiness.customerSat, market: avgCompetitor.customerSat },
    { metric: 'Features', you: yourBusiness.features, market: avgCompetitor.features }
  ] : [];

  const pricingComparisonData = [
    { name: 'Your Business', value: yourBusiness.pricing },
    ...competitors.map(c => ({ name: c.name || 'Unnamed', value: c.pricing }))
  ];

  const marketPositionData = [
    { name: 'Your Business', marketShare: yourBusiness.marketShare, innovation: yourBusiness.innovation, type: 'you' },
    ...competitors.map(c => ({ name: c.name || 'Unnamed', marketShare: c.marketShare, innovation: c.innovation, type: 'competitor' }))
  ];

  const featureComparisonData = [
    { feature: 'Features', you: yourBusiness.features, avg: avgCompetitor?.features || 0 },
    { feature: 'Innovation', you: yourBusiness.innovation, avg: avgCompetitor?.innovation || 0 },
    { feature: 'Customer Sat', you: yourBusiness.customerSat, avg: avgCompetitor?.customerSat || 0 },
    { feature: 'Pricing', you: yourBusiness.pricing, avg: avgCompetitor?.pricing || 0 }
  ];

  const getSerializedState = () => {
    return {
      yourBusiness,
      competitors,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('yourBusiness' in state) setYourBusiness(state.yourBusiness);
    if ('competitors' in state) setCompetitors(state.competitors);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'competitor-bench_handoff';
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
      const saved = localStorage.getItem('competitor-bench-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('competitor-bench-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('competitor-bench-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (competitiveScore < 55) {
      tips.push("Critical: Competitive position below 55% indicates weak market position. UK Innovator Founder visa requires demonstrable competitive advantage - strengthen innovation and differentiation urgently.");
    }

    if (avgCompetitor && yourBusiness.innovation <= avgCompetitor.innovation) {
      tips.push("Innovation score at or below market average. Innovation criterion is central to UK Innovator Founder visa - document unique technology, patents, or novel approaches that clearly differentiate from competitors.");
    }

    if (avgCompetitor && yourBusiness.features < avgCompetitor.features) {
      tips.push("Feature set trailing competitors. Build and document feature advantages: unique capabilities, superior user experience, or technology that competitors lack. Evidence of differentiation strengthens innovation criterion.");
    }

    if (competitors.length < 3) {
      tips.push("Analyzing fewer than 3 competitors provides incomplete market view. Identify 3-5 direct competitors to demonstrate thorough market understanding for viability criterion.");
    }

    if (yourBusiness.marketShare < 5) {
      tips.push("Market share below 5% suggests early-stage or limited traction. Document growth trajectory, customer acquisition strategy, and evidence of scalability to address viability and scalability criteria.");
    }

    if (avgCompetitor && yourBusiness.pricing < avgCompetitor.pricing - 10) {
      tips.push("Pricing significantly below market average may signal weak value proposition or unsustainable economics. Justify pricing strategy with cost structure analysis and demonstrate path to profitability.");
    }

    if (avgCompetitor && yourBusiness.customerSat < avgCompetitor.customerSat) {
      tips.push("Customer satisfaction below market average. Gather customer testimonials, case studies, and NPS scores to demonstrate product-market fit and validate viability criterion.");
    }

    if (competitiveAdvantages >= 3) {
      tips.push("Strong competitive position with 3+ advantages. Document specific evidence: customer feedback, performance metrics, technical specifications that quantify your lead over competitors.");
    }

    const innovationGap = avgCompetitor ? yourBusiness.innovation - avgCompetitor.innovation : 0;
    if (innovationGap > 20) {
      tips.push("Exceptional innovation lead (20+ points). Leverage this for endorsement: patent filings, technical publications, industry recognition, or novel IP that creates defensible competitive moat.");
    }

    if (competitors.some(c => !c.strengths || !c.weaknesses)) {
      tips.push("Incomplete competitor analysis. Document specific strengths and weaknesses for each competitor - demonstrates market expertise and identifies strategic opportunities for differentiation.");
    }

    const totalMarketShare = yourBusiness.marketShare + competitors.reduce((s, c) => s + c.marketShare, 0);
    if (totalMarketShare < 50) {
      tips.push("Fragmented market with high growth potential. Position this as scalability opportunity - large addressable market with room for multiple successful players supports growth projections.");
    }

    if (avgCompetitor && yourBusiness.funding < avgCompetitor.funding - 20) {
      tips.push("Funding significantly below competitors. While not disqualifying, document capital efficiency: how you achieve competitive results with less funding. Demonstrates lean operations and strong unit economics.");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete comprehensive competitive analysis - identify top 5 direct competitors with detailed profiles including market share, pricing, features, and strategic positioning", priority: "Critical" },
      { week: "Week 1", action: "Document your unique competitive advantages with quantifiable evidence - feature comparisons, performance benchmarks, customer testimonials, or technical superiority metrics", priority: "Critical" },
      { week: "Week 1-2", action: "Conduct SWOT analysis for each major competitor - identify their strengths, weaknesses, opportunities, and threats relative to your business", priority: "High" },
      { week: "Week 2", action: "Create competitive positioning map showing market landscape - demonstrate clear differentiation and strategic market position for endorsing body", priority: "Critical" },
      { week: "Week 2", action: "Gather evidence of innovation differentiation: patents, proprietary technology, novel processes, or unique IP that competitors cannot easily replicate", priority: "Critical" },
      { week: "Week 2-3", action: "Build competitive moat documentation - barriers to entry that protect your position: network effects, switching costs, regulatory advantages, data assets, or technical complexity", priority: "High" },
      { week: "Week 3", action: "Compile customer validation evidence showing preference over competitors - win/loss analysis, NPS scores, testimonials comparing you to alternatives", priority: "Critical" },
      { week: "Week 3", action: "Document pricing strategy and competitive pricing analysis - justify your pricing relative to value delivered and market positioning", priority: "High" },
      { week: "Week 3-4", action: "Create competitive advantage narrative for visa application - clear story of how innovation creates defensible competitive position", priority: "Critical" },
      { week: "Week 4", action: "Prepare competitive intelligence updates - system for tracking competitor moves and maintaining competitive advantage throughout visa period", priority: "Medium" },
      { week: "Week 4", action: "Review all competitive analysis with advisors or mentors - validate assumptions and strengthen weak areas before endorsement submission", priority: "High" },
      { week: "Ongoing", action: "Monitor competitive landscape monthly - track new entrants, competitor feature releases, pricing changes, and market shifts to maintain strategic advantage", priority: "Medium" }
    ];
  };

  const handleExport = () => {
    const innovationGap = avgCompetitor ? yourBusiness.innovation - avgCompetitor.innovation : 0;
    const pricingGap = avgCompetitor ? yourBusiness.pricing - avgCompetitor.pricing : 0;
    const satisfactionGap = avgCompetitor ? yourBusiness.customerSat - avgCompetitor.customerSat : 0;
    const featuresGap = avgCompetitor ? yourBusiness.features - avgCompetitor.features : 0;
    const totalMarketShare = yourBusiness.marketShare + competitors.reduce((s, c) => s + c.marketShare, 0);

    const report = `UK INNOVATOR FOUNDER VISA - COMPETITIVE BENCHMARKING ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Competitive Advantage Score: ${competitiveScore}% (${competitiveGrade})
Competitive Advantages: ${competitiveAdvantages}/4 dimensions
Your Market Share: ${yourBusiness.marketShare}%
Competitors Analyzed: ${competitors.length}

Status: ${competitiveScore >= 70 ? 'STRONG - Supports innovation criterion for UK Innovator Founder visa' : competitiveScore >= 55 ? 'COMPETITIVE - Strengthen differentiation for endorsement' : 'WEAK - Critical improvements needed'}

${competitiveScore >= 70 ? 'Your competitive position demonstrates clear differentiation and innovation advantage suitable for UK Innovator Founder visa endorsement.' : competitiveScore >= 55 ? 'Competitive position is acceptable but strengthening innovation differentiation would improve endorsement prospects.' : 'Competitive position requires significant strengthening - demonstrate unique innovation that differentiates from existing market solutions.'}

${'='.repeat(80)}
YOUR COMPETITIVE PROFILE
${'-'.repeat(80)}
Innovation Score: ${yourBusiness.innovation}/100
  ${yourBusiness.innovation >= 75 ? 'STRONG innovation capability - clear differentiation from market' : yourBusiness.innovation >= 60 ? 'MODERATE innovation - strengthen unique elements' : 'WEAK innovation - insufficient differentiation'}
  ${avgCompetitor ? `Market Average: ${Math.round(avgCompetitor.innovation)}/100 (You are ${innovationGap > 0 ? '+' : ''}${innovationGap.toFixed(1)} points ${innovationGap > 0 ? 'AHEAD' : 'BEHIND'})` : ''}

Features Score: ${yourBusiness.features}/100
  ${yourBusiness.features >= 75 ? 'STRONG feature set - comprehensive capabilities' : yourBusiness.features >= 60 ? 'MODERATE features - expand differentiated capabilities' : 'LIMITED features - build unique feature advantages'}
  ${avgCompetitor ? `Market Average: ${Math.round(avgCompetitor.features)}/100 (You are ${featuresGap > 0 ? '+' : ''}${featuresGap.toFixed(1)} points ${featuresGap > 0 ? 'AHEAD' : 'BEHIND'})` : ''}

Pricing Competitiveness: ${yourBusiness.pricing}/100
  ${yourBusiness.pricing >= 75 ? 'STRONG pricing advantage - superior value proposition' : yourBusiness.pricing >= 60 ? 'COMPETITIVE pricing' : 'PRICING disadvantage - justify value or improve efficiency'}
  ${avgCompetitor ? `Market Average: ${Math.round(avgCompetitor.pricing)}/100 (You are ${pricingGap > 0 ? '+' : ''}${pricingGap.toFixed(1)} points ${pricingGap > 0 ? 'AHEAD' : 'BEHIND'})` : ''}

Customer Satisfaction: ${yourBusiness.customerSat}/100
  ${yourBusiness.customerSat >= 75 ? 'HIGH customer satisfaction - strong product-market fit' : yourBusiness.customerSat >= 60 ? 'MODERATE satisfaction' : 'LOW satisfaction - address customer pain points'}
  ${avgCompetitor ? `Market Average: ${Math.round(avgCompetitor.customerSat)}/100 (You are ${satisfactionGap > 0 ? '+' : ''}${satisfactionGap.toFixed(1)} points ${satisfactionGap > 0 ? 'AHEAD' : 'BEHIND'})` : ''}

Funding Level: ${yourBusiness.funding}/100
  ${yourBusiness.funding >= 75 ? 'WELL-FUNDED - strong financial position' : yourBusiness.funding >= 60 ? 'MODERATE funding - monitor runway' : 'LIMITED funding - secure additional capital or demonstrate capital efficiency'}
  ${avgCompetitor ? `Market Average: ${Math.round(avgCompetitor.funding)}/100` : ''}

Market Share: ${yourBusiness.marketShare}%
  ${yourBusiness.marketShare >= 10 ? 'SIGNIFICANT market presence - established player' : yourBusiness.marketShare >= 5 ? 'GROWING market position - early traction' : 'LIMITED penetration - focus on customer acquisition'}

${'='.repeat(80)}
COMPETITIVE LANDSCAPE ANALYSIS
${'-'.repeat(80)}
Total Competitors Tracked: ${competitors.length}
Combined Market Share (You + Competitors): ${totalMarketShare.toFixed(1)}%
Remaining Market Opportunity: ${(100 - totalMarketShare).toFixed(1)}%

${avgCompetitor ? `Average Competitor Metrics:
  Innovation: ${Math.round(avgCompetitor.innovation)}/100
  Features: ${Math.round(avgCompetitor.features)}/100
  Pricing: ${Math.round(avgCompetitor.pricing)}/100
  Customer Satisfaction: ${Math.round(avgCompetitor.customerSat)}/100
  Funding: ${Math.round(avgCompetitor.funding)}/100
  Market Share: ${avgCompetitor.marketShare.toFixed(1)}%` : 'No competitor data available'}

${competitors.map((c, idx) => `
${'='.repeat(80)}
COMPETITOR ${idx + 1}: ${c.name}
${'-'.repeat(80)}
Market Share: ${c.marketShare}%
Innovation Score: ${c.innovation}/100 ${c.innovation > yourBusiness.innovation ? 'AHEAD of you' : 'Behind you'}
Features Score: ${c.features}/100 ${c.features > yourBusiness.features ? 'AHEAD of you' : 'Behind you'}
Pricing Score: ${c.pricing}/100 ${c.pricing > yourBusiness.pricing ? 'AHEAD of you' : 'Behind you'}
Customer Satisfaction: ${c.customerSat}/100 ${c.customerSat > yourBusiness.customerSat ? 'AHEAD of you' : 'Behind you'}
Funding Level: ${c.funding}/100 ${c.funding > yourBusiness.funding ? 'AHEAD of you' : 'Behind you'}

Key Strengths:
${c.strengths || 'Not documented'}

Key Weaknesses:
${c.weaknesses || 'Not documented'}

Competitive Gaps You Can Exploit:
${c.innovation < yourBusiness.innovation ? `- Innovation gap: You lead by ${(yourBusiness.innovation - c.innovation).toFixed(1)} points` : ''}
${c.features < yourBusiness.features ? `- Features gap: You lead by ${(yourBusiness.features - c.features).toFixed(1)} points` : ''}
${c.pricing < yourBusiness.pricing ? `- Pricing gap: You lead by ${(yourBusiness.pricing - c.pricing).toFixed(1)} points` : ''}
${c.customerSat < yourBusiness.customerSat ? `- Satisfaction gap: You lead by ${(yourBusiness.customerSat - c.customerSat).toFixed(1)} points` : ''}
${!c.innovation && !c.features && !c.pricing && !c.customerSat ? '- No clear competitive advantages identified' : ''}
`).join('\n')}

${'='.repeat(80)}
COMPETITIVE ADVANTAGE SCORE CALCULATION
${'-'.repeat(80)}
Formula: Advantage Score = 50 (baseline) + Average(Innovation Gap + Features Gap + Pricing Gap + Satisfaction Gap) / 4

${avgCompetitor ? `Step 1: Calculate Performance Gaps vs Market Average
  Innovation Gap: Your ${yourBusiness.innovation} - Market Avg ${Math.round(avgCompetitor.innovation)} = ${innovationGap.toFixed(1)} points
  ${innovationGap > 0 ? 'You LEAD in innovation' : 'You LAG in innovation'}

  Features Gap: Your ${yourBusiness.features} - Market Avg ${Math.round(avgCompetitor.features)} = ${featuresGap.toFixed(1)} points
  ${featuresGap > 0 ? 'You LEAD in features' : 'You LAG in features'}

  Pricing Gap: Your ${yourBusiness.pricing} - Market Avg ${Math.round(avgCompetitor.pricing)} = ${pricingGap.toFixed(1)} points
  ${pricingGap > 0 ? 'You LEAD in pricing' : 'You LAG in pricing'}

  Satisfaction Gap: Your ${yourBusiness.customerSat} - Market Avg ${Math.round(avgCompetitor.customerSat)} = ${satisfactionGap.toFixed(1)} points
  ${satisfactionGap > 0 ? 'You LEAD in customer satisfaction' : 'You LAG in customer satisfaction'}

Step 2: Calculate Average Gap
  Average Gap = (${innovationGap.toFixed(1)} + ${featuresGap.toFixed(1)} + ${pricingGap.toFixed(1)} + ${satisfactionGap.toFixed(1)}) / 4
  Average Gap = ${((innovationGap + featuresGap + pricingGap + satisfactionGap) / 4).toFixed(1)} points

Step 3: Calculate Final Score
  Final Score = 50 (baseline) + ${((innovationGap + featuresGap + pricingGap + satisfactionGap) / 4).toFixed(1)}
  Final Score = ${competitiveScore}% (${competitiveGrade})` : 'Insufficient competitor data for calculation'}

Competitive Advantages Summary:
${avgCompetitor ? `${innovationGap > 0 ? 'YES' : 'NO'} - Innovation Advantage
${featuresGap > 0 ? 'YES' : 'NO'} - Features Advantage
${pricingGap > 0 ? 'YES' : 'NO'} - Pricing Advantage
${satisfactionGap > 0 ? 'YES' : 'NO'} - Satisfaction Advantage
${'-'.repeat(40)}
Total Competitive Advantages: ${competitiveAdvantages}/4` : 'No competitor data available'}

${'='.repeat(80)}
UK INNOVATOR FOUNDER VISA - INNOVATION CRITERION ALIGNMENT
${'-'.repeat(80)}
GOV.UK Innovation Assessment Factors:
- Demonstrated differentiation from existing market solutions
- Novel approach or significant improvement over competitors
- Clear competitive advantages in product/service delivery
- Evidence of unique value proposition
- Defensible market position through innovation

CURRENT COMPETITIVE STATUS:
${avgCompetitor ? `Innovation vs Market: ${innovationGap > 0 ? `+${innovationGap.toFixed(1)} points AHEAD` : `${innovationGap.toFixed(1)} points BEHIND`}
  ${innovationGap >= 10 ? 'STRONG innovation differentiation for UK Innovator Founder visa' : innovationGap > 0 ? 'Moderate innovation lead - strengthen for endorsement' : 'Innovation below market average - CRITICAL to address'}

Features vs Market: ${featuresGap > 0 ? `+${featuresGap.toFixed(1)} points AHEAD` : `${featuresGap.toFixed(1)} points BEHIND`}
  ${featuresGap >= 10 ? 'Superior feature set demonstrates clear differentiation' : featuresGap > 0 ? 'Moderate feature advantage' : 'Feature parity or deficit - build unique capabilities'}` : 'No market comparison available'}

Competitive Advantages: ${competitiveAdvantages}/4
  ${competitiveAdvantages >= 3 ? 'Multiple advantages demonstrate strong competitive position' : competitiveAdvantages >= 2 ? 'Moderate competitive position - strengthen differentiation' : 'Limited advantages - critical to improve'}

Market Position: ${yourBusiness.marketShare}% share
  ${yourBusiness.marketShare >= 10 ? 'Significant market validation' : yourBusiness.marketShare >= 5 ? 'Growing traction - document growth trajectory' : 'Early stage - focus on customer acquisition evidence'}

Overall Competitive Score: ${competitiveScore}%
  ${competitiveScore >= 70 ? 'Strong competitive position supports innovation and viability criteria for endorsement' : competitiveScore >= 55 ? 'Competitive but needs strengthening for strong endorsement case' : 'Weak competitive position - focus on differentiation and innovation'}

VISA CRITERION ALIGNMENT:
${competitiveScore >= 70 && innovationGap > 0 ? 'Competitive analysis demonstrates clear innovation and differentiation for UK Innovator Founder visa endorsement. Document specific evidence of unique technology, features, or approaches that create defensible competitive advantage.' : competitiveScore >= 55 ? 'Competitive position is acceptable but strengthening innovation differentiation (aim for 10+ point lead) and documenting unique capabilities would improve endorsement prospects significantly.' : 'Competitive position needs significant strengthening. Demonstrate unique innovation that clearly differentiates from existing market solutions with quantifiable evidence of superiority.'}

${'='.repeat(80)}
SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

${'='.repeat(80)}
4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

${'='.repeat(80)}
COMPETITIVE DIFFERENTIATION EVIDENCE CHECKLIST
${'-'.repeat(80)}
For UK Innovator Founder visa endorsement, gather the following evidence:

Innovation Evidence:
[ ] Patent applications or granted patents
[ ] Proprietary technology documentation
[ ] Technical publications or research papers
[ ] Novel algorithms or methodologies
[ ] Unique IP or trade secrets

Market Differentiation:
[ ] Competitive feature comparison matrix
[ ] Customer testimonials comparing you to competitors
[ ] Win/loss analysis showing why customers chose you
[ ] Market positioning analysis from industry reports
[ ] Analyst or expert recognition of your innovation

Performance Metrics:
[ ] Benchmark tests showing superior performance
[ ] Customer satisfaction scores (NPS, CSAT) vs competitors
[ ] Time-to-value or efficiency metrics
[ ] Cost savings or ROI data vs alternatives
[ ] Quality or reliability metrics

Competitive Moat:
[ ] Barriers to entry documentation
[ ] Network effects or data advantages
[ ] Switching costs or lock-in mechanisms
[ ] Regulatory advantages or certifications
[ ] Strategic partnerships or exclusive relationships

Market Validation:
[ ] Customer acquisition and retention metrics
[ ] Growth trajectory vs competitors
[ ] Market share gains or losses
[ ] Customer case studies
[ ] Revenue or usage growth data

${'='.repeat(80)}
NEXT STEPS
${'-'.repeat(80)}
1. Complete all competitor profiles with detailed strengths/weaknesses analysis
2. Gather quantifiable evidence of competitive advantages (metrics, testimonials, benchmarks)
3. Document innovation differentiation with technical specifications and unique IP
4. Prepare competitive positioning narrative for visa application
5. Validate analysis with industry experts or advisors
6. Maintain competitive intelligence system for ongoing monitoring

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
https://innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-benchmark-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-competitor-bench">Competitor Benchmarking</h1>
            <p className="text-lg text-muted-foreground">
              Compare features, pricing, and positioning to demonstrate competitive advantage
            </p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="competitor-bench"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Competitor Benchmarking"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-competitor-bench">
              <TabsTrigger value="benchmark" data-testid="tab-benchmark">Benchmark</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="benchmark" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Advantage Score</CardTitle>
                  <CardDescription>Overall competitive positioning vs market average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className={competitiveScore >= 70 ? "border-green-500" : competitiveScore >= 55 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Competitive Score</p>
                          <p className="text-3xl font-bold" data-testid="text-competitive-score">{competitiveScore}%</p>
                          <p className="text-sm mt-2" data-testid="text-competitive-grade">{competitiveGrade}</p>
                          <Progress value={competitiveScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Competitive Advantages</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-advantages">{competitiveAdvantages}/4</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {competitiveAdvantages >= 3 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : competitiveAdvantages >= 2 ? (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">
                              {competitiveAdvantages >= 3 ? 'Strong Position' : competitiveAdvantages >= 2 ? 'Moderate Position' : 'Weak Position'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Market Share</p>
                          <p className="text-3xl font-bold" data-testid="text-market-share">{yourBusiness.marketShare}%</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {competitors.length} competitors tracked
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {competitiveScore >= 70 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950 mb-6">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Strong competitive position. Your business demonstrates clear advantages that support the innovation criterion for UK Innovator Founder visa.
                      </AlertDescription>
                    </Alert>
                  )}

                  {competitiveScore >= 55 && competitiveScore < 70 && (
                    <Alert className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Competitive position is acceptable but strengthening innovation differentiation would improve endorsement prospects.
                      </AlertDescription>
                    </Alert>
                  )}

                  {competitiveScore < 55 && (
                    <Alert variant="destructive" className="mb-6">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Weak competitive position. Focus on demonstrating unique innovation that clearly differentiates from existing market solutions.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Business Performance</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="your-innovation">Innovation Score (0-100)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="your-innovation"
                              value={[yourBusiness.innovation]}
                              onValueChange={(val) => updateYourBusiness('innovation', val[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-your-innovation"
                            />
                            <span className="text-sm font-medium w-12 text-right">{yourBusiness.innovation}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="your-features">Features Score (0-100)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="your-features"
                              value={[yourBusiness.features]}
                              onValueChange={(val) => updateYourBusiness('features', val[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-your-features"
                            />
                            <span className="text-sm font-medium w-12 text-right">{yourBusiness.features}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="your-pricing">Pricing Competitiveness (0-100)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="your-pricing"
                              value={[yourBusiness.pricing]}
                              onValueChange={(val) => updateYourBusiness('pricing', val[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-your-pricing"
                            />
                            <span className="text-sm font-medium w-12 text-right">{yourBusiness.pricing}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="your-customersat">Customer Satisfaction (0-100)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="your-customersat"
                              value={[yourBusiness.customerSat]}
                              onValueChange={(val) => updateYourBusiness('customerSat', val[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-your-customersat"
                            />
                            <span className="text-sm font-medium w-12 text-right">{yourBusiness.customerSat}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="your-funding">Funding Level (0-100)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider
                              id="your-funding"
                              value={[yourBusiness.funding]}
                              onValueChange={(val) => updateYourBusiness('funding', val[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-your-funding"
                            />
                            <span className="text-sm font-medium w-12 text-right">{yourBusiness.funding}</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="your-marketshare">Market Share (%)</Label>
                          <Input
                            id="your-marketshare"
                            type="number"
                            value={yourBusiness.marketShare}
                            onChange={(e) => updateYourBusiness('marketShare', parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            step={0.1}
                            data-testid="input-your-marketshare"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Competitor Analysis</h3>
                        <Button onClick={addCompetitor} size="sm" data-testid="button-add-competitor">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Competitor
                        </Button>
                      </div>

                      {competitors.map((competitor, index) => (
                        <Card key={competitor.id} className="p-4 mb-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Input
                                value={competitor.name}
                                onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                                placeholder="Competitor Name"
                                className="font-semibold"
                                data-testid={`input-competitor-name-${index}`}
                              />
                              {competitors.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCompetitor(competitor.id)}
                                  data-testid={`button-remove-competitor-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label>Innovation Score</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Slider
                                    value={[competitor.innovation]}
                                    onValueChange={(val) => updateCompetitor(competitor.id, 'innovation', val[0])}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                    data-testid={`slider-competitor-innovation-${index}`}
                                  />
                                  <span className="text-sm w-12 text-right">{competitor.innovation}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Features Score</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Slider
                                    value={[competitor.features]}
                                    onValueChange={(val) => updateCompetitor(competitor.id, 'features', val[0])}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                    data-testid={`slider-competitor-features-${index}`}
                                  />
                                  <span className="text-sm w-12 text-right">{competitor.features}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Pricing Score</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Slider
                                    value={[competitor.pricing]}
                                    onValueChange={(val) => updateCompetitor(competitor.id, 'pricing', val[0])}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                    data-testid={`slider-competitor-pricing-${index}`}
                                  />
                                  <span className="text-sm w-12 text-right">{competitor.pricing}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Customer Satisfaction</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Slider
                                    value={[competitor.customerSat]}
                                    onValueChange={(val) => updateCompetitor(competitor.id, 'customerSat', val[0])}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                    data-testid={`slider-competitor-customersat-${index}`}
                                  />
                                  <span className="text-sm w-12 text-right">{competitor.customerSat}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Funding Level</Label>
                                <div className="flex items-center gap-2 mt-2">
                                  <Slider
                                    value={[competitor.funding]}
                                    onValueChange={(val) => updateCompetitor(competitor.id, 'funding', val[0])}
                                    max={100}
                                    step={1}
                                    className="flex-1"
                                    data-testid={`slider-competitor-funding-${index}`}
                                  />
                                  <span className="text-sm w-12 text-right">{competitor.funding}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Market Share (%)</Label>
                                <Input
                                  type="number"
                                  value={competitor.marketShare}
                                  onChange={(e) => updateCompetitor(competitor.id, 'marketShare', parseFloat(e.target.value) || 0)}
                                  min={0}
                                  max={100}
                                  step={0.1}
                                  data-testid={`input-competitor-marketshare-${index}`}
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Key Strengths</Label>
                              <Textarea
                                value={competitor.strengths}
                                onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value)}
                                placeholder="e.g., Market leader with strong brand recognition..."
                                rows={2}
                                data-testid={`textarea-competitor-strengths-${index}`}
                              />
                            </div>

                            <div>
                              <Label>Key Weaknesses</Label>
                              <Textarea
                                value={competitor.weaknesses}
                                onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value)}
                                placeholder="e.g., Slow innovation cycle, legacy tech stack..."
                                rows={2}
                                data-testid={`textarea-competitor-weaknesses-${index}`}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Positioning Radar</CardTitle>
                    <CardDescription>Your performance vs market average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar name="Your Business" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          <Radar name="Market Average" dataKey="market" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add competitors to see radar chart</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Comparison</CardTitle>
                    <CardDescription>Pricing competitiveness vs competitors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pricingComparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pricingComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6">
                            {pricingComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Position Map</CardTitle>
                    <CardDescription>Market share vs innovation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {marketPositionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="marketShare" name="Market Share" unit="%" domain={[0, 100]} />
                          <YAxis type="number" dataKey="innovation" name="Innovation" domain={[0, 100]} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Legend />
                          <Scatter name="Your Business" data={marketPositionData.filter(d => d.type === 'you')} fill="#3b82f6" shape="star" />
                          <Scatter name="Competitors" data={marketPositionData.filter(d => d.type === 'competitor')} fill="#94a3b8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Comparison</CardTitle>
                    <CardDescription>Your features vs market average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {featureComparisonData.length > 0 && avgCompetitor ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={featureComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="feature" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="you" name="Your Business" fill="#3b82f6" />
                          <Bar dataKey="avg" name="Market Average" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add competitors to see feature comparison</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Competitive Differentiation Evidence</CardTitle>
                  <CardDescription>UK Innovator Founder visa innovation criterion requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Innovation Differentiation</p>
                        <p className="text-sm text-muted-foreground">
                          Document unique technology, patents, or novel approaches that clearly differentiate from competitors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Market Positioning</p>
                        <p className="text-sm text-muted-foreground">
                          Demonstrate clear market position with competitive advantages in features, pricing, or customer satisfaction
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Competitive Advantages</p>
                        <p className="text-sm text-muted-foreground">
                          Provide evidence of measurable superiority: customer testimonials, performance benchmarks, or market share gains
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Scalability Potential</p>
                        <p className="text-sm text-muted-foreground">
                          Show how competitive advantages enable growth: defensible moat, network effects, or economies of scale
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
                  <CardDescription>AI-powered insights based on your competitive analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
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
                  <CardDescription>Prioritized timeline to strengthen competitive position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                            item.priority === 'High' ? 'bg-orange-500 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
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
