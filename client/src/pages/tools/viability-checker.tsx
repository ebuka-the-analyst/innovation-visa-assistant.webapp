import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "viability-checker",
  toolName: "Viability Checker",
  agent: 'sage',
  greeting: "I'm Sage, your business viability assessment specialist. Let's evaluate your business against the UK Innovator Founder visa viability criteria to ensure you meet endorsement requirements.",
  questions: [
    {
      id: 'market-demand',
      question: "Describe your market demand evidence. What is your total addressable market size, who are your target customers, and what validation proves they need your solution?",
      hint: "Include TAM, target customers, and validation evidence",
      fieldKey: 'marketDemand',
      minLength: 100
    },
    {
      id: 'competitive-advantage',
      question: "What is your competitive advantage? Describe your IP protection, proprietary technology, or unique capabilities that differentiate you from existing UK market solutions.",
      hint: "Focus on IP protection, proprietary technology, and unique capabilities",
      fieldKey: 'competitiveAdvantage',
      minLength: 100
    },
    {
      id: 'financial-health',
      question: "Describe your financial sustainability. Include annual revenue, monthly burn rate, cash runway, funding sources, and path to profitability.",
      hint: "Include revenue, burn rate, runway, funding, and profitability path",
      fieldKey: 'financialHealth',
      minLength: 100
    },
    {
      id: 'team-strength',
      question: "Assess your team's capabilities. Describe founder expertise, relevant industry experience, key team members, and advisory board composition.",
      hint: "Include founder expertise, industry experience, and advisory board",
      fieldKey: 'teamStrength',
      minLength: 75
    },
    {
      id: 'scalability',
      question: "What is your scalability potential? Describe your growth roadmap, job creation plan (minimum 2 FTE by Year 3), and technology/infrastructure that supports scaling.",
      hint: "Include growth roadmap, job creation plan, and scaling infrastructure",
      fieldKey: 'scalability',
      minLength: 100
    },
    {
      id: 'customer-traction',
      question: "What customer traction can you demonstrate? Include customer count, gross margin, customer acquisition cost, and any revenue or engagement metrics.",
      hint: "Include customer count, margins, CAC, and engagement metrics",
      fieldKey: 'customerTraction',
      minLength: 75
    },
    {
      id: 'viability-evidence',
      question: "What documentation supports your viability claims? List financial statements, customer contracts, market research reports, and third-party validation you can provide.",
      hint: "List financial statements, contracts, research, and validation",
      fieldKey: 'viabilityEvidence',
      minLength: 75
    }
  ],
  completionMessage: "Your viability assessment is complete. This evaluation helps identify areas to strengthen before endorsement submission."
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Award, Target, DollarSign } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

type ViabilityMetrics = {
  marketDemand: number;
  competitiveAdvantage: number;
  financialSustainability: number;
  teamCapability: number;
  scalabilityPotential: number;
};

type FinancialData = {
  annualRevenue: number;
  monthlyBurn: number;
  cashRunway: number;
  grossMargin: number;
  customerCount: number;
};

export default function ViabilityChecker() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('viability-checker-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('viability-checker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newMetrics = { ...metrics };
    if (answers.marketDemand && answers.marketDemand.length > 100) {
      newMetrics.marketDemand = Math.min(100, 70 + Math.floor(answers.marketDemand.length / 50));
    }
    if (answers.competitiveAdvantage && answers.competitiveAdvantage.length > 100) {
      newMetrics.competitiveAdvantage = Math.min(100, 65 + Math.floor(answers.competitiveAdvantage.length / 50));
    }
    if (answers.financialHealth && answers.financialHealth.length > 100) {
      newMetrics.financialSustainability = Math.min(100, 70 + Math.floor(answers.financialHealth.length / 50));
    }
    if (answers.teamStrength && answers.teamStrength.length > 75) {
      newMetrics.teamCapability = Math.min(100, 70 + Math.floor(answers.teamStrength.length / 50));
    }
    if (answers.scalability && answers.scalability.length > 100) {
      newMetrics.scalabilityPotential = Math.min(100, 65 + Math.floor(answers.scalability.length / 50));
    }
    setMetrics(newMetrics);
  };

  const [metrics, setMetrics] = useState<ViabilityMetrics>({
    marketDemand: 75,
    competitiveAdvantage: 70,
    financialSustainability: 80,
    teamCapability: 75,
    scalabilityPotential: 70
  });

  const [financials, setFinancials] = useState<FinancialData>({
    annualRevenue: 150000,
    monthlyBurn: 12000,
    cashRunway: 18,
    grossMargin: 65,
    customerCount: 50
  });

  const [activeTab, setActiveTab] = useState('assessment');
  const [savedDate, setSavedDate] = useState('');

  const updateMetric = (key: keyof ViabilityMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const updateFinancial = (key: keyof FinancialData, value: number) => {
    setFinancials(prev => ({ ...prev, [key]: value }));
  };

  const calculateViabilityScore = (): number => {
    const metricScores = Object.values(metrics);
    const avgMetricScore = metricScores.reduce((a, b) => a + b, 0) / metricScores.length;
    
    const revenueBonus = financials.annualRevenue >= 100000 ? 5 : 0;
    const runwayBonus = financials.cashRunway >= 12 ? 5 : financials.cashRunway >= 6 ? 3 : 0;
    const marginBonus = financials.grossMargin >= 60 ? 5 : financials.grossMargin >= 40 ? 3 : 0;
    
    return Math.min(100, Math.round(avgMetricScore + revenueBonus + runwayBonus + marginBonus));
  };

  const viabilityScore = calculateViabilityScore();
  const isViable = viabilityScore >= 65;
  const isStrongViable = viabilityScore >= 75;

  const getViabilityGrade = (): string => {
    if (viabilityScore >= 85) return 'A - Excellent Viability';
    if (viabilityScore >= 75) return 'B - Strong Viability';
    if (viabilityScore >= 65) return 'C - Viable';
    if (viabilityScore >= 55) return 'D - Developing';
    return 'F - Not Viable';
  };

  const radarData = [
    { factor: 'Market Demand', score: metrics.marketDemand, benchmark: 75, fullMark: 100 },
    { factor: 'Competitive Edge', score: metrics.competitiveAdvantage, benchmark: 70, fullMark: 100 },
    { factor: 'Financial Health', score: metrics.financialSustainability, benchmark: 75, fullMark: 100 },
    { factor: 'Team Strength', score: metrics.teamCapability, benchmark: 75, fullMark: 100 },
    { factor: 'Scalability', score: metrics.scalabilityPotential, benchmark: 70, fullMark: 100 },
  ];

  const benchmarkData = [
    { factor: 'Market Demand', yourScore: metrics.marketDemand, industry: 70, topQuartile: 85 },
    { factor: 'Competitive Edge', yourScore: metrics.competitiveAdvantage, industry: 65, topQuartile: 80 },
    { factor: 'Financial Health', yourScore: metrics.financialSustainability, industry: 70, topQuartile: 85 },
    { factor: 'Team Strength', yourScore: metrics.teamCapability, industry: 68, topQuartile: 82 },
    { factor: 'Scalability', yourScore: metrics.scalabilityPotential, industry: 65, topQuartile: 80 },
  ];

  const visaCriteriaData = [
    { criterion: 'Innovation', score: metrics.competitiveAdvantage, required: 70 },
    { criterion: 'Viability', score: metrics.financialSustainability, required: 70 },
    { criterion: 'Scalability', score: metrics.scalabilityPotential, required: 70 },
  ];

  const financialTrendData = [
    { month: 'M1', revenue: financials.annualRevenue / 12, burn: financials.monthlyBurn, runway: financials.cashRunway },
    { month: 'M3', revenue: financials.annualRevenue / 12 * 1.05, burn: financials.monthlyBurn, runway: financials.cashRunway - 2 },
    { month: 'M6', revenue: financials.annualRevenue / 12 * 1.12, burn: financials.monthlyBurn * 0.95, runway: financials.cashRunway - 5 },
    { month: 'M9', revenue: financials.annualRevenue / 12 * 1.18, burn: financials.monthlyBurn * 0.92, runway: Math.max(0, financials.cashRunway - 8) },
    { month: 'M12', revenue: financials.annualRevenue / 12 * 1.25, burn: financials.monthlyBurn * 0.9, runway: Math.max(0, financials.cashRunway - 11) },
  ];

  const getSerializedState = () => {
    return {
      metrics,
      financials,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('metrics' in state) setMetrics(state.metrics);
    if ('financials' in state) setFinancials(state.financials);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'viability-checker_handoff';
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
      const saved = localStorage.getItem('viability-checker-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('viability-checker-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('viability-checker-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (viabilityScore < 65) {
      tips.push("Critical: Overall viability score below 65% threshold - address weakest criteria immediately to meet UK Innovator Founder visa requirements");
    }
    
    if (metrics.marketDemand < 70) {
      tips.push("Market demand validation needed - conduct customer interviews, gather letters of intent, and document market size with third-party research reports");
    }
    
    if (metrics.competitiveAdvantage < 70) {
      tips.push("Competitive advantage insufficient - strengthen IP protection, document proprietary technology, and clearly articulate your unique value proposition versus competitors");
    }
    
    if (metrics.financialSustainability < 70) {
      tips.push("Financial sustainability concerns - extend cash runway to minimum 12 months, verify all funding sources with bank statements, and create detailed 3-year projections");
    }
    
    if (metrics.teamCapability < 70) {
      tips.push("Team capability gaps identified - recruit key technical or commercial roles, document founder expertise with CV and track record, consider advisory board");
    }
    
    if (metrics.scalabilityPotential < 70) {
      tips.push("Scalability limitations detected - develop clear growth roadmap, demonstrate technology can scale without proportional cost increases, plan for geographic expansion");
    }
    
    if (financials.cashRunway < 12) {
      tips.push("Cash runway below 12 months is risky - endorsing bodies require demonstrated financial stability throughout application period (typically 3-6 months)");
    }
    
    if (financials.annualRevenue < 100000 && metrics.financialSustainability >= 70) {
      tips.push("Revenue under £100k - while viability is strong, consider increasing to £100k+ to strengthen endorsement case and demonstrate market traction");
    }
    
    if (financials.grossMargin < 40) {
      tips.push("Gross margin below 40% raises sustainability concerns - review pricing strategy, optimize cost structure, or justify with strategic market entry reasoning");
    }
    
    if (viabilityScore >= 75) {
      tips.push("Strong viability profile - ensure comprehensive documentation ready: financial statements, market research, customer testimonials, IP filings, and team CVs");
    }
    
    if (metrics.marketDemand >= 80 && metrics.scalabilityPotential >= 80) {
      tips.push("Excellent market opportunity and scalability - emphasize job creation potential (minimum 2 FTE by Year 3) and international expansion plans in your endorsement application");
    }
    
    const allMetricsAbove75 = Object.values(metrics).every(m => m >= 75);
    if (allMetricsAbove75) {
      tips.push("All viability factors exceed 75% - you have a strong foundation for endorsement. Focus on evidence quality and clear narrative in your application materials");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    const actions = [];
    
    actions.push({
      week: "Week 1",
      action: "Complete comprehensive viability assessment across all five factors - market demand, competitive advantage, financial sustainability, team capability, and scalability potential",
      priority: "Critical"
    });
    
    if (metrics.marketDemand < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Conduct market validation - gather 10+ customer interviews, obtain letters of intent, commission third-party market research report showing TAM >£100M",
        priority: "Critical"
      });
    }
    
    if (metrics.competitiveAdvantage < 70) {
      actions.push({
        week: "Week 1-2",
        action: "Strengthen competitive position - file provisional patents, document proprietary algorithms, create detailed competitor analysis matrix with clear differentiation",
        priority: "Critical"
      });
    }
    
    if (metrics.financialSustainability < 70) {
      actions.push({
        week: "Week 2",
        action: "Secure financial sustainability - verify all funding sources with bank statements, extend runway to 12+ months, create detailed 36-month cashflow projections",
        priority: "Critical"
      });
    }
    
    if (metrics.teamCapability < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Build team credibility - recruit technical co-founder or CTO, form advisory board with industry experts, document founder track record with case studies",
        priority: "High"
      });
    }
    
    if (metrics.scalabilityPotential < 70) {
      actions.push({
        week: "Week 2-3",
        action: "Develop scalability roadmap - create hiring plan with 10+ jobs by Year 3, design technology architecture for 10x scale, plan international expansion to 3+ markets",
        priority: "High"
      });
    }
    
    actions.push({
      week: "Week 3",
      action: "Prepare comprehensive evidence portfolio - financial statements (certified by accountant), market research reports, customer testimonials, IP documentation, team CVs",
      priority: "High"
    });
    
    actions.push({
      week: "Week 3-4",
      action: "Create clear business narrative - executive summary linking innovation, viability, and scalability; 3-year milestones; job creation timeline; UK market contribution",
      priority: "High"
    });
    
    actions.push({
      week: "Week 4",
      action: "Practice endorsement interview preparation - defend each viability metric with specific evidence, prepare responses to common challenges, rehearse 5-minute pitch",
      priority: "Medium"
    });
    
    actions.push({
      week: "Ongoing",
      action: "Monitor viability metrics monthly - track revenue growth, customer acquisition, competitive positioning, team expansion, and maintain evidence documentation",
      priority: "Medium"
    });
    
    return actions.slice(0, 8);
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - BUSINESS VIABILITY ASSESSMENT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Overall Viability Score: ${viabilityScore}/100
Grade: ${getViabilityGrade()}
Status: ${isViable ? (isStrongViable ? 'STRONG VIABILITY' : 'VIABLE') : 'NEEDS IMPROVEMENT'}
Visa Readiness: ${viabilityScore >= 70 ? 'READY FOR APPLICATION' : 'STRENGTHEN BEFORE APPLYING'}

VIABILITY FACTORS ASSESSMENT
${'-'.repeat(80)}
1. Market Demand: ${metrics.marketDemand}/100
   ${metrics.marketDemand >= 75 ? 'STRONG - Large addressable market with clear customer need' : metrics.marketDemand >= 65 ? 'ADEQUATE - Market opportunity identified, strengthen validation' : 'WEAK - Insufficient market demand evidence'}

2. Competitive Advantage: ${metrics.competitiveAdvantage}/100
   ${metrics.competitiveAdvantage >= 75 ? 'STRONG - Clear differentiation with IP protection' : metrics.competitiveAdvantage >= 65 ? 'ADEQUATE - Some differentiation, strengthen IP' : 'WEAK - Limited competitive moat'}

3. Financial Sustainability: ${metrics.financialSustainability}/100
   ${metrics.financialSustainability >= 75 ? 'STRONG - Solid financial foundation with proven revenue model' : metrics.financialSustainability >= 65 ? 'ADEQUATE - Financial model viable, improve metrics' : 'WEAK - Financial sustainability concerns'}

4. Team Capability: ${metrics.teamCapability}/100
   ${metrics.teamCapability >= 75 ? 'STRONG - Experienced team with relevant track record' : metrics.teamCapability >= 65 ? 'ADEQUATE - Competent team, add key expertise' : 'WEAK - Team capability gaps'}

5. Scalability Potential: ${metrics.scalabilityPotential}/100
   ${metrics.scalabilityPotential >= 75 ? 'STRONG - Clear path to significant growth and job creation' : metrics.scalabilityPotential >= 65 ? 'ADEQUATE - Growth potential exists, strengthen plan' : 'WEAK - Limited scalability'}

FINANCIAL METRICS
${'-'.repeat(80)}
Annual Revenue: £${financials.annualRevenue.toLocaleString()}
${financials.annualRevenue >= 1000000 ? 'EXCELLENT - Revenue ≥£1M qualifies for ILR achievement criterion' : financials.annualRevenue >= 100000 ? 'GOOD - Demonstrates market traction' : 'DEVELOPING - Build revenue to £100k+ for stronger case'}

Monthly Burn Rate: £${financials.monthlyBurn.toLocaleString()}
Cash Runway: ${financials.cashRunway} months
${financials.cashRunway >= 18 ? 'EXCELLENT - 18+ months runway provides strong buffer' : financials.cashRunway >= 12 ? 'GOOD - 12+ months meets endorser expectations' : financials.cashRunway >= 6 ? 'ADEQUATE - Extend to 12+ months for safety' : 'CRITICAL - Runway below 6 months is high risk'}

Gross Margin: ${financials.grossMargin}%
${financials.grossMargin >= 60 ? 'EXCELLENT - Strong unit economics' : financials.grossMargin >= 40 ? 'GOOD - Healthy margin structure' : 'CONCERN - Review pricing and cost structure'}

Customer Count: ${financials.customerCount}
${financials.customerCount >= 50 ? 'STRONG - Proven market demand' : financials.customerCount >= 20 ? 'ADEQUATE - Growing customer base' : 'DEVELOPING - Increase customer acquisition'}

UK INNOVATOR FOUNDER VISA CRITERIA ALIGNMENT
${'-'.repeat(80)}

CRITERION 1: INNOVATION
Your Score: ${metrics.competitiveAdvantage}/100
${metrics.competitiveAdvantage >= 70 ? 'MEETS REQUIREMENT - Clear innovation with competitive differentiation' : 'NEEDS WORK - Strengthen innovation documentation and IP protection'}

CRITERION 2: VIABILITY
Your Score: ${metrics.financialSustainability}/100
${metrics.financialSustainability >= 70 ? 'MEETS REQUIREMENT - Sustainable business model demonstrated' : 'NEEDS WORK - Improve financial projections and funding verification'}
Annual Revenue: £${financials.annualRevenue.toLocaleString()}
Cash Runway: ${financials.cashRunway} months
${financials.annualRevenue >= 50000 && financials.cashRunway >= 12 ? 'Financial metrics support viability narrative' : 'Strengthen revenue or extend runway'}

CRITERION 3: SCALABILITY
Your Score: ${metrics.scalabilityPotential}/100
${metrics.scalabilityPotential >= 70 ? 'MEETS REQUIREMENT - Clear growth potential with job creation plan' : 'NEEDS WORK - Develop detailed scalability roadmap and hiring plan'}

OVERALL VISA READINESS
${'-'.repeat(80)}
${viabilityScore >= 75 && metrics.competitiveAdvantage >= 70 && metrics.financialSustainability >= 70 && metrics.scalabilityPotential >= 70 ?
`STRONG READINESS - Your business demonstrates excellent viability across all criteria.
All three core visa requirements (Innovation, Viability, Scalability) are met.
Proceed with endorsing body application with comprehensive evidence documentation.` :
viabilityScore >= 65 ?
`ADEQUATE READINESS - Your business is viable but needs strengthening:
${metrics.competitiveAdvantage < 70 ? '- Innovation: Enhance IP protection and differentiation' : ''}
${metrics.financialSustainability < 70 ? '- Viability: Strengthen financial sustainability and funding' : ''}
${metrics.scalabilityPotential < 70 ? '- Scalability: Develop clear growth and job creation plan' : ''}
${financials.cashRunway < 12 ? '- Cash Runway: Extend to 12+ months' : ''}
Address these areas before formal application.` :
`NOT READY - Significant improvements needed:
Your business requires strengthening across multiple viability factors.
Focus on raising scores above 70% for innovation, viability, and scalability.
Consider working with endorsement preparation consultant.`}

BENCHMARKING ANALYSIS
${'-'.repeat(80)}
vs. Industry Average:
${benchmarkData.map(b => {
  const diff = b.yourScore - b.industry;
  return `  ${b.factor}: ${diff >= 0 ? '+' : ''}${diff} points ${diff >= 10 ? '(Well Above)' : diff >= 0 ? '(Above)' : diff >= -10 ? '(Below)' : '(Well Below)'}`;
}).join('\n')}

vs. Top Quartile:
${benchmarkData.map(b => {
  const diff = b.yourScore - b.topQuartile;
  return `  ${b.factor}: ${diff >= 0 ? '+' : ''}${diff} points ${diff >= 0 ? '(Top Performer)' : diff >= -10 ? '(Approaching)' : '(Gap Exists)'}`;
}).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

VIABILITY METHODOLOGY
${'-'.repeat(80)}
This assessment evaluates business viability across five critical factors:

1. Market Demand (20%): Addressable market size, customer validation, demand evidence
2. Competitive Advantage (20%): IP protection, differentiation, barriers to entry
3. Financial Sustainability (20%): Revenue model, funding, unit economics, cash management
4. Team Capability (20%): Founder expertise, team completeness, advisory support
5. Scalability Potential (20%): Growth roadmap, job creation, international expansion

Scoring incorporates:
- Factor assessments (0-100 scale)
- Financial performance bonuses
- Endorsing body requirements alignment

Benchmarks based on:
- UK Innovator Founder visa endorsement data
- Tech startup viability research
- Endorsing body published criteria

COMPLIANCE NOTES
${'-'.repeat(80)}
- All three criteria (Innovation, Viability, Scalability) must be met for endorsement
- Endorsing bodies conduct detailed technical interviews to validate scores
- Evidence documentation must support all viability claims
- Financial projections must be realistic and based on market data
- Maintain viability metrics throughout application period (3-6 months)
- Consider engaging endorsement preparation consultant if score <70%

SOURCES
${'-'.repeat(80)}
- GOV.UK Innovator Founder Visa Guidance (2025)
- Immigration Rules Appendix Innovator Founder
- Endorsing Bodies: Tech Nation, Innovator International, UK Endorsing Services
- UK Visa & Immigration Policy Guidance
- Industry benchmarks: Startup Genome, CB Insights

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viability-assessment-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const tips = getSmartTips();
    const actionPlan = generateActionPlan();

    await generateWord({
      title: 'UK Innovator Founder Visa - Business Viability Assessment',
      subtitle: `Viability Score: ${viabilityScore}/100 (${getViabilityGrade()})`,
      filename: `viability-assessment-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Executive Summary', level: 1 },
        { type: 'score', score: { value: viabilityScore, max: 100, label: 'Overall Viability Score' } },
        { type: 'paragraph', content: `Grade: ${getViabilityGrade()}` },
        { type: 'paragraph', content: `Status: ${isViable ? (isStrongViable ? 'STRONG VIABILITY' : 'VIABLE') : 'NEEDS IMPROVEMENT'}` },
        { type: 'paragraph', content: `Visa Readiness: ${viabilityScore >= 70 ? 'READY FOR APPLICATION' : 'STRENGTHEN BEFORE APPLYING'}` },
        { type: 'divider' },
        { type: 'heading', content: 'Viability Factors Assessment', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Factor', 'Score', 'Status'],
            rows: [
              ['Market Demand', `${metrics.marketDemand}/100`, metrics.marketDemand >= 75 ? 'STRONG' : metrics.marketDemand >= 65 ? 'ADEQUATE' : 'WEAK'],
              ['Competitive Advantage', `${metrics.competitiveAdvantage}/100`, metrics.competitiveAdvantage >= 75 ? 'STRONG' : metrics.competitiveAdvantage >= 65 ? 'ADEQUATE' : 'WEAK'],
              ['Financial Sustainability', `${metrics.financialSustainability}/100`, metrics.financialSustainability >= 75 ? 'STRONG' : metrics.financialSustainability >= 65 ? 'ADEQUATE' : 'WEAK'],
              ['Team Capability', `${metrics.teamCapability}/100`, metrics.teamCapability >= 75 ? 'STRONG' : metrics.teamCapability >= 65 ? 'ADEQUATE' : 'WEAK'],
              ['Scalability Potential', `${metrics.scalabilityPotential}/100`, metrics.scalabilityPotential >= 75 ? 'STRONG' : metrics.scalabilityPotential >= 65 ? 'ADEQUATE' : 'WEAK']
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Financial Metrics', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Metric', 'Value', 'Assessment'],
            rows: [
              ['Annual Revenue', `£${financials.annualRevenue.toLocaleString()}`, financials.annualRevenue >= 1000000 ? 'EXCELLENT' : financials.annualRevenue >= 100000 ? 'GOOD' : 'DEVELOPING'],
              ['Monthly Burn Rate', `£${financials.monthlyBurn.toLocaleString()}`, '-'],
              ['Cash Runway', `${financials.cashRunway} months`, financials.cashRunway >= 18 ? 'EXCELLENT' : financials.cashRunway >= 12 ? 'GOOD' : financials.cashRunway >= 6 ? 'ADEQUATE' : 'CRITICAL'],
              ['Gross Margin', `${financials.grossMargin}%`, financials.grossMargin >= 60 ? 'EXCELLENT' : financials.grossMargin >= 40 ? 'GOOD' : 'CONCERN'],
              ['Customer Count', `${financials.customerCount}`, financials.customerCount >= 50 ? 'STRONG' : financials.customerCount >= 20 ? 'ADEQUATE' : 'DEVELOPING']
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'UK Innovator Founder Visa Criteria Alignment', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Criterion', 'Your Score', 'Status'],
            rows: [
              ['Innovation', `${metrics.competitiveAdvantage}/100`, metrics.competitiveAdvantage >= 70 ? 'MEETS REQUIREMENT' : 'NEEDS WORK'],
              ['Viability', `${metrics.financialSustainability}/100`, metrics.financialSustainability >= 70 ? 'MEETS REQUIREMENT' : 'NEEDS WORK'],
              ['Scalability', `${metrics.scalabilityPotential}/100`, metrics.scalabilityPotential >= 70 ? 'MEETS REQUIREMENT' : 'NEEDS WORK']
            ]
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Benchmarking Analysis', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Factor', 'Your Score', 'Industry Avg', 'Top Quartile'],
            rows: benchmarkData.map(b => [b.factor, `${b.yourScore}`, `${b.industry}`, `${b.topQuartile}`])
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
        subject: 'Business Viability Assessment Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['viability', 'assessment', 'visa', 'innovator founder']
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-viability-checker">Business Viability Checker</h1>
                <p className="text-lg text-muted-foreground">Comprehensive viability assessment for UK Innovator Founder visa</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Traditional Form"
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
            <>
          <ToolUtilityBar
            toolId="viability-checker"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Business Viability Checker"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-viability-checker">
              <TabsTrigger value="assessment" data-testid="tab-assessment">Assessment</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="benchmarks" data-testid="tab-benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Viability Status</CardTitle>
                  <CardDescription>Your business viability score across all critical factors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={isStrongViable ? "border-green-500" : isViable ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Viability Score</p>
                          <p className="text-4xl font-bold" data-testid="text-viability-score">{viabilityScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {isStrongViable ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : isViable ? (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm" data-testid="text-viability-status">
                              {isStrongViable ? 'Strong Viability' : isViable ? 'Viable' : 'Needs Work'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Grade</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-viability-grade">{getViabilityGrade()}</p>
                          <Progress value={viabilityScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Visa Readiness</p>
                          <p className="text-lg font-bold" data-testid="text-visa-readiness">
                            {viabilityScore >= 70 ? 'Ready' : 'Not Ready'}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {viabilityScore >= 70 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm">
                              {viabilityScore >= 70 ? 'Proceed with Application' : 'Strengthen First'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!isViable && (
                    <Alert variant="destructive" data-testid="alert-not-viable">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Viability score below 65% threshold. Address weakest factors before visa application. Focus on raising innovation, viability, and scalability scores above 70%.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isViable && !isStrongViable && (
                    <Alert data-testid="alert-viable-strengthen">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your business is viable but strengthening to 75+ will significantly improve endorsement chances. Review smart tips for specific improvements.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isStrongViable && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-strong-viable">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent viability profile! Your business demonstrates strong market demand, competitive advantage, financial sustainability, team capability, and scalability potential. Ensure comprehensive evidence documentation is ready.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Viability Factors</h3>
                    <p className="text-sm text-muted-foreground">Adjust each factor based on your business assessment (0-100 scale)</p>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="market-demand">Market Demand</Label>
                          <span className="text-sm font-medium" data-testid="text-market-demand">{metrics.marketDemand}/100</span>
                        </div>
                        <Slider
                          id="market-demand"
                          value={[metrics.marketDemand]}
                          onValueChange={(v) => updateMetric('marketDemand', v[0])}
                          max={100}
                          step={5}
                          data-testid="slider-market-demand"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Addressable market size, customer validation, demand evidence
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="competitive-advantage">Competitive Advantage</Label>
                          <span className="text-sm font-medium" data-testid="text-competitive-advantage">{metrics.competitiveAdvantage}/100</span>
                        </div>
                        <Slider
                          id="competitive-advantage"
                          value={[metrics.competitiveAdvantage]}
                          onValueChange={(v) => updateMetric('competitiveAdvantage', v[0])}
                          max={100}
                          step={5}
                          data-testid="slider-competitive-advantage"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          IP protection, differentiation, barriers to entry
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="financial-sustainability">Financial Sustainability</Label>
                          <span className="text-sm font-medium" data-testid="text-financial-sustainability">{metrics.financialSustainability}/100</span>
                        </div>
                        <Slider
                          id="financial-sustainability"
                          value={[metrics.financialSustainability]}
                          onValueChange={(v) => updateMetric('financialSustainability', v[0])}
                          max={100}
                          step={5}
                          data-testid="slider-financial-sustainability"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenue model, funding sources, unit economics, cash management
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="team-capability">Team Capability</Label>
                          <span className="text-sm font-medium" data-testid="text-team-capability">{metrics.teamCapability}/100</span>
                        </div>
                        <Slider
                          id="team-capability"
                          value={[metrics.teamCapability]}
                          onValueChange={(v) => updateMetric('teamCapability', v[0])}
                          max={100}
                          step={5}
                          data-testid="slider-team-capability"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Founder expertise, team completeness, advisory support
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="scalability-potential">Scalability Potential</Label>
                          <span className="text-sm font-medium" data-testid="text-scalability-potential">{metrics.scalabilityPotential}/100</span>
                        </div>
                        <Slider
                          id="scalability-potential"
                          value={[metrics.scalabilityPotential]}
                          onValueChange={(v) => updateMetric('scalabilityPotential', v[0])}
                          max={100}
                          step={5}
                          data-testid="slider-scalability-potential"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Growth roadmap, job creation, international expansion
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">Financial Metrics</h3>
                    <p className="text-sm text-muted-foreground">Key financial indicators supporting viability assessment</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="annual-revenue">Annual Revenue (£)</Label>
                        <Input
                          id="annual-revenue"
                          type="number"
                          value={financials.annualRevenue}
                          onChange={(e) => updateFinancial('annualRevenue', parseFloat(e.target.value) || 0)}
                          data-testid="input-annual-revenue"
                        />
                      </div>

                      <div>
                        <Label htmlFor="monthly-burn">Monthly Burn Rate (£)</Label>
                        <Input
                          id="monthly-burn"
                          type="number"
                          value={financials.monthlyBurn}
                          onChange={(e) => updateFinancial('monthlyBurn', parseFloat(e.target.value) || 0)}
                          data-testid="input-monthly-burn"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cash-runway">Cash Runway (months)</Label>
                        <Input
                          id="cash-runway"
                          type="number"
                          value={financials.cashRunway}
                          onChange={(e) => updateFinancial('cashRunway', parseFloat(e.target.value) || 0)}
                          data-testid="input-cash-runway"
                        />
                      </div>

                      <div>
                        <Label htmlFor="gross-margin">Gross Margin (%)</Label>
                        <Input
                          id="gross-margin"
                          type="number"
                          value={financials.grossMargin}
                          onChange={(e) => updateFinancial('grossMargin', parseFloat(e.target.value) || 0)}
                          data-testid="input-gross-margin"
                        />
                      </div>

                      <div>
                        <Label htmlFor="customer-count">Customer Count</Label>
                        <Input
                          id="customer-count"
                          type="number"
                          value={financials.customerCount}
                          onChange={(e) => updateFinancial('customerCount', parseFloat(e.target.value) || 0)}
                          data-testid="input-customer-count"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Viability Radar</CardTitle>
                    <CardDescription>Your scores vs. target benchmarks across five factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="factor" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Your Score" dataKey="score" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                        <Radar name="Target" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>UK Visa Criteria</CardTitle>
                    <CardDescription>Alignment with Innovation, Viability, Scalability requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={visaCriteriaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="criterion" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Your Score" fill="#ffa536" />
                        <Bar dataKey="required" name="Required (70%)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Trend Projection</CardTitle>
                    <CardDescription>12-month revenue and burn rate forecast</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={financialTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" label={{ value: 'Revenue/Burn (£)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Runway (mo)', angle: 90, position: 'insideRight' }} />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                        <Line yAxisId="left" type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} name="Burn Rate" />
                        <Line yAxisId="right" type="monotone" dataKey="runway" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Runway" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Financial Indicators</CardTitle>
                    <CardDescription>Critical metrics for viability assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="font-medium">Annual Revenue</span>
                        </div>
                        <span className="font-bold" data-testid="text-display-revenue">£{financials.annualRevenue.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">Monthly Burn</span>
                        </div>
                        <span className="font-bold" data-testid="text-display-burn">£{financials.monthlyBurn.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="font-medium">Cash Runway</span>
                        </div>
                        <span className="font-bold" data-testid="text-display-runway">{financials.cashRunway} months</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="font-medium">Gross Margin</span>
                        </div>
                        <span className="font-bold" data-testid="text-display-margin">{financials.grossMargin}%</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <span className="font-medium">Customer Count</span>
                        </div>
                        <span className="font-bold" data-testid="text-display-customers">{financials.customerCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">Burn Coverage</span>
                        </div>
                        <span className="font-bold" data-testid="text-burn-coverage">
                          {(financials.annualRevenue / 12 / financials.monthlyBurn).toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                  <CardDescription>Your performance vs. industry average and top quartile</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="factor" angle={-15} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yourScore" name="Your Score" fill="#ffa536" />
                      <Bar dataKey="industry" name="Industry Avg" fill="#3b82f6" />
                      <Bar dataKey="topQuartile" name="Top 25%" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Benchmark Analysis</CardTitle>
                    <CardDescription>Detailed comparison across viability factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {benchmarkData.map((item, index) => {
                        const vsIndustry = item.yourScore - item.industry;
                        const vsTopQuartile = item.yourScore - item.topQuartile;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{item.factor}</span>
                              <span className="text-sm text-muted-foreground">Your Score: {item.yourScore}/100</span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground w-32">vs. Industry:</span>
                                <span className={vsIndustry >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                  {vsIndustry >= 0 ? '+' : ''}{vsIndustry} points
                                </span>
                                {vsIndustry >= 10 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {vsIndustry < 0 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground w-32">vs. Top 25%:</span>
                                <span className={vsTopQuartile >= 0 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}>
                                  {vsTopQuartile >= 0 ? '+' : ''}{vsTopQuartile} points
                                </span>
                                {vsTopQuartile >= 0 && <Award className="h-4 w-4 text-green-500" />}
                              </div>
                            </div>
                            
                            {index < benchmarkData.length - 1 && <div className="border-t pt-2 mt-4" />}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Benchmark Interpretation</CardTitle>
                    <CardDescription>What these comparisons mean for your application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/20 rounded-md">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Above Industry Average
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Factors where you score above industry average demonstrate competitive strength. Highlight these in your endorsement application.
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/20 rounded-md">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Award className="h-5 w-5 text-green-500" />
                          Top Quartile Performance
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Scores in the top 25% signal exceptional viability. Use these as proof points of your business strength with specific metrics and evidence.
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/20 rounded-md">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Below Industry Average
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Factors below average require immediate attention. Endorsing bodies compare applicants, so closing these gaps improves competitive positioning.
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/20 rounded-md">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Strategic Priority
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Focus on bringing all factors to at least industry average (70+). One weak factor can jeopardize endorsement even if others are strong.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Actionable insights to strengthen your viability profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => {
                      const isCritical = tip.toLowerCase().includes('critical');
                      const isHigh = tip.toLowerCase().includes('needed') || tip.toLowerCase().includes('insufficient') || tip.toLowerCase().includes('concerns');
                      
                      return (
                        <Alert
                          key={index}
                          variant={isCritical ? "destructive" : "default"}
                          className={!isCritical && isHigh ? "border-orange-500 bg-orange-50 dark:bg-orange-950" : ""}
                          data-testid={`alert-tip-${index}`}
                        >
                          {isCritical ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : isHigh ? (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          <AlertDescription className={isHigh && !isCritical ? "text-orange-700 dark:text-orange-300" : ""}>
                            <span className="font-medium">Tip {index + 1}:</span> {tip}
                          </AlertDescription>
                        </Alert>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Viability Improvement Priorities</CardTitle>
                  <CardDescription>Focus areas based on your current assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics)
                      .sort(([, a], [, b]) => a - b)
                      .map(([factor, score], index) => {
                        const factorName = factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const priority = score < 60 ? 'Critical' : score < 70 ? 'High' : score < 80 ? 'Medium' : 'Low';
                        const priorityColor = 
                          priority === 'Critical' ? 'text-red-600 dark:text-red-400' :
                          priority === 'High' ? 'text-orange-600 dark:text-orange-400' :
                          priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400';
                        
                        return (
                          <div key={factor} className="flex items-center justify-between p-3 bg-secondary/20 rounded-md">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-lg">{index + 1}</span>
                              <div>
                                <p className="font-medium">{factorName}</p>
                                <p className="text-sm text-muted-foreground">Current: {score}/100</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${priorityColor}`} data-testid={`text-priority-${factor}`}>{priority}</p>
                              <p className="text-sm text-muted-foreground">
                                {score < 70 ? `Need +${70 - score}` : 'On Track'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Structured roadmap to strengthen viability for endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => {
                      const priorityColor = 
                        item.priority === 'Critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                        item.priority === 'High' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-950';
                      
                      const priorityTextColor = 
                        item.priority === 'Critical' ? 'text-red-700 dark:text-red-300' :
                        item.priority === 'High' ? 'text-orange-700 dark:text-orange-300' :
                        'text-blue-700 dark:text-blue-300';
                      
                      return (
                        <Card key={index} className={priorityColor} data-testid={`action-item-${index}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${priorityTextColor}`}>
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`font-medium ${priorityTextColor}`}>{item.week}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                                    {item.priority}
                                  </span>
                                </div>
                                <p className={priorityTextColor}>{item.action}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Guidelines</CardTitle>
                  <CardDescription>Best practices for executing your action plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Prioritize Critical Actions</p>
                        <p className="text-sm text-muted-foreground">
                          Address critical priority items in Weeks 1-2 before proceeding to high/medium priorities. One weak criterion can block endorsement.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Document Everything</p>
                        <p className="text-sm text-muted-foreground">
                          Maintain evidence folder with dated files. Endorsing bodies require proof for all viability claims: market research, financial statements, customer testimonials, IP filings.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Track Progress Weekly</p>
                        <p className="text-sm text-muted-foreground">
                          Re-assess viability scores weekly using this tool. Aim for all factors 70+ before submitting endorsement application.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Seek Expert Review</p>
                        <p className="text-sm text-muted-foreground">
                          If score remains below 70% after 4 weeks, consider engaging endorsement preparation consultant or immigration lawyer for targeted guidance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Prepare for Interview</p>
                        <p className="text-sm text-muted-foreground">
                          Endorsing bodies conduct technical interviews. Practice defending each viability factor with specific evidence, metrics, and examples from your business.
                        </p>
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
