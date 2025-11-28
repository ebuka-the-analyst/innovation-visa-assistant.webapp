import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'revenue-forecast',
  toolName: 'Revenue Forecast',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. A credible revenue forecast is essential for demonstrating business viability to endorsing bodies. Let's build a comprehensive 3-year projection that aligns with UK Innovator Founder Visa requirements.",
  questions: [
    {
      id: 'current-revenue',
      question: "What is your current Monthly Recurring Revenue (MRR) and how many paying customers do you have?",
      hint: "If pre-revenue, describe your current traction (beta users, waitlist, LOIs).",
      fieldKey: 'currentRevenue',
      minLength: 10
    },
    {
      id: 'pricing-model',
      question: "What is your pricing model and what are your key revenue streams?",
      hint: "Describe subscription tiers, one-time fees, usage-based pricing, or other revenue models.",
      fieldKey: 'pricingModel',
      minLength: 30
    },
    {
      id: 'growth-assumptions',
      question: "What are your key growth assumptions for the next 3 years?",
      hint: "Include expected customer acquisition rate, churn rate, and pricing changes.",
      fieldKey: 'growthAssumptions',
      minLength: 30
    },
    {
      id: 'customer-acquisition',
      question: "What is your Customer Acquisition Cost (CAC) and expected Lifetime Value (LTV)?",
      hint: "If not calculated yet, describe your acquisition channels and expected customer tenure.",
      fieldKey: 'customerAcquisition',
      minLength: 20
    },
    {
      id: 'market-validation',
      question: "What market validation evidence supports your revenue projections?",
      hint: "Include customer interviews, pilot results, letters of intent, or competitor benchmarks.",
      fieldKey: 'marketValidation',
      minLength: 30
    },
    {
      id: 'ilr-target',
      question: "Are you targeting the £1M ARR ILR criterion? What's your timeline to achieve this?",
      hint: "The £1M ARR is one of seven ILR achievement criteria (need 2 for settlement).",
      fieldKey: 'ilrTarget',
      minLength: 15
    }
  ],
  completionMessage: "Excellent financial insights! I've captured your revenue model and growth assumptions. I'm now populating your forecast with revenue streams and projections aligned with UK visa requirements."
};
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

type RevenueStream = {
  name: string;
  monthlyRevenue: number;
  growthRate: number;
  pricingModel: 'subscription' | 'one-time' | 'usage-based' | 'freemium' | 'tiered';
  customers: number;
  seasonalityFactor: number;
};

type GrowthScenario = 'conservative' | 'base' | 'optimistic';

export default function RevenueForecast() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('revenue-forecast-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  const [streams, setStreams] = useState<RevenueStream[]>([
    { 
      name: 'SaaS Subscriptions', 
      monthlyRevenue: 8000, 
      growthRate: 30, 
      pricingModel: 'subscription',
      customers: 40,
      seasonalityFactor: 1.0
    }
  ]);
  const [scenario, setScenario] = useState<GrowthScenario>('base');
  const [cac, setCAC] = useState(500);
  const [ltv, setLTV] = useState(3000);
  const [activeTab, setActiveTab] = useState('forecast');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('revenue-forecast-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('revenue-forecast-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.currentRevenue) {
      const revenueMatch = answers.currentRevenue.match(/\d+/);
      if (revenueMatch) {
        setStreams([{
          name: 'Primary Revenue',
          monthlyRevenue: parseInt(revenueMatch[0]) || 8000,
          growthRate: 30,
          pricingModel: 'subscription',
          customers: 40,
          seasonalityFactor: 1.0
        }]);
      }
    }
    setMode('traditional');
  };

  const addStream = () => {
    setStreams([...streams, { 
      name: '', 
      monthlyRevenue: 0, 
      growthRate: 20, 
      pricingModel: 'subscription',
      customers: 0,
      seasonalityFactor: 1.0
    }]);
  };

  const updateStream = (index: number, field: keyof RevenueStream, value: any) => {
    const updated = [...streams];
    updated[index] = { ...updated[index], [field]: value };
    setStreams(updated);
  };

  const removeStream = (index: number) => {
    setStreams(streams.filter((_, i) => i !== index));
  };

  const getScenarioMultiplier = (scenario: GrowthScenario) => {
    const multipliers = {
      conservative: { revenue: 0.7, growth: 0.6, customers: 0.75 },
      base: { revenue: 1.0, growth: 1.0, customers: 1.0 },
      optimistic: { revenue: 1.3, growth: 1.5, customers: 1.4 }
    };
    return multipliers[scenario];
  };

  const getSeasonalityMultiplier = (month: number, baseFactor: number) => {
    const seasonalPattern = [
      0.85, 0.88, 0.95, 1.0, 1.05, 1.08,
      1.1, 1.12, 1.08, 1.05, 1.15, 1.25
    ];
    return baseFactor * seasonalPattern[month % 12];
  };

  const generateMonthlyProjections = (selectedScenario: GrowthScenario = scenario) => {
    const months = 36;
    const mult = getScenarioMultiplier(selectedScenario);
    const projections = [];

    for (let month = 0; month <= months; month++) {
      let totalRevenue = 0;
      let totalCustomers = 0;
      const streamData: { [key: string]: number } = {};

      streams.forEach((stream, idx) => {
        const adjustedGrowth = stream.growthRate * mult.growth / 100;
        const monthlyGrowth = Math.pow(1 + adjustedGrowth, 1 / 12) - 1;
        const growthFactor = Math.pow(1 + monthlyGrowth, month);
        const seasonality = getSeasonalityMultiplier(month, stream.seasonalityFactor);
        
        const revenue = stream.monthlyRevenue * mult.revenue * growthFactor * seasonality;
        const customers = Math.round(stream.customers * mult.customers * growthFactor);

        totalRevenue += revenue;
        totalCustomers += customers;
        streamData[`stream${idx}`] = Math.round(revenue);
      });

      projections.push({
        month: `M${month}`,
        monthIndex: month,
        totalRevenue: Math.round(totalRevenue),
        totalCustomers,
        ...streamData,
        quarter: Math.floor(month / 3),
        year: Math.floor(month / 12)
      });
    }

    return projections;
  };

  const generateQuarterlyProjections = () => {
    const monthly = generateMonthlyProjections();
    const quarterly = [];
    
    for (let q = 0; q <= 11; q++) {
      const quarterMonths = monthly.slice(q * 3, q * 3 + 3);
      if (quarterMonths.length === 0) break;
      
      const revenue = quarterMonths.reduce((sum, m) => sum + m.totalRevenue, 0);
      const customers = Math.round(
        quarterMonths.reduce((sum, m) => sum + m.totalCustomers, 0) / quarterMonths.length
      );

      quarterly.push({
        quarter: `Q${q + 1}`,
        quarterIndex: q,
        revenue: Math.round(revenue),
        customers,
        year: Math.floor(q / 4)
      });
    }

    return quarterly;
  };

  const generateAnnualProjections = () => {
    const monthly = generateMonthlyProjections();
    const annual = [];

    for (let year = 0; year <= 3; year++) {
      const yearMonths = monthly.slice(year * 12, year * 12 + 12);
      if (yearMonths.length === 0) break;

      const revenue = yearMonths.reduce((sum, m) => sum + m.totalRevenue, 0);
      const customers = Math.round(
        yearMonths.reduce((sum, m) => sum + m.totalCustomers, 0) / yearMonths.length
      );

      annual.push({
        year: year === 0 ? 'Current' : `Year ${year}`,
        yearIndex: year,
        revenue: Math.round(revenue),
        customers,
        mrr: Math.round(revenue / 12),
        arr: Math.round(revenue)
      });
    }

    return annual;
  };

  const generateScenarioComparison = () => {
    const scenarios: GrowthScenario[] = ['conservative', 'base', 'optimistic'];
    return scenarios.map(scen => {
      const projections = generateMonthlyProjections(scen);
      const year3 = projections.slice(36, 37)[0] || projections[projections.length - 1];
      const totalRevenue = projections.slice(0, 37).reduce((sum, p) => sum + p.totalRevenue, 0);

      return {
        scenario: scen.charAt(0).toUpperCase() + scen.slice(1),
        year3Revenue: year3.totalRevenue,
        totalRevenue,
        customers: year3.totalCustomers,
        arr: Math.round(year3.totalRevenue * 12)
      };
    });
  };

  const getMetrics = () => {
    const monthly = generateMonthlyProjections();
    const current = monthly[0];
    const year1 = monthly[12];
    const year2 = monthly[24];
    const year3 = monthly[36];
    
    const totalRevenue3Years = monthly.slice(0, 37).reduce((sum, p) => sum + p.totalRevenue, 0);
    const currentARR = current.totalRevenue * 12;
    const year3ARR = year3.totalRevenue * 12;
    const revenueMultiple = year3ARR / currentARR;
    const cagr = (Math.pow(year3ARR / currentARR, 1/3) - 1) * 100;

    const customerAcquisitionCost = cac;
    const lifetimeValue = ltv;
    const ltvCacRatio = lifetimeValue / customerAcquisitionCost;
    const paybackMonths = customerAcquisitionCost / (currentARR / 12 / current.totalCustomers);

    return {
      current,
      year1,
      year2,
      year3,
      totalRevenue3Years,
      currentARR,
      year3ARR,
      revenueMultiple,
      cagr,
      ltvCacRatio,
      paybackMonths,
      currentMRR: current.totalRevenue,
      year3MRR: year3.totalRevenue
    };
  };

  const getViabilityScore = () => {
    const metrics = getMetrics();
    let score = 0;

    if (metrics.cagr >= 100) score += 25;
    else if (metrics.cagr >= 50) score += 20;
    else if (metrics.cagr >= 30) score += 15;
    else if (metrics.cagr >= 20) score += 10;
    else score += 5;

    if (metrics.year3ARR >= 1000000) score += 25;
    else if (metrics.year3ARR >= 500000) score += 20;
    else if (metrics.year3ARR >= 250000) score += 15;
    else score += 5;

    if (metrics.ltvCacRatio >= 5) score += 25;
    else if (metrics.ltvCacRatio >= 3) score += 20;
    else if (metrics.ltvCacRatio >= 2) score += 10;
    else score += 5;

    if (streams.length >= 3) score += 15;
    else if (streams.length >= 2) score += 10;
    else score += 5;

    if (metrics.revenueMultiple >= 5) score += 10;
    else if (metrics.revenueMultiple >= 3) score += 7;
    else if (metrics.revenueMultiple >= 2) score += 5;
    else score += 2;

    let grade = 'F - Poor';
    if (score >= 85) grade = 'A - Excellent';
    else if (score >= 70) grade = 'B - Strong';
    else if (score >= 55) grade = 'C - Moderate';
    else if (score >= 40) grade = 'D - Weak';

    return { score, grade };
  };

  const getSerializedState = () => {
    return {
      streams,
      scenario,
      cac,
      ltv,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('streams' in state) setStreams(state.streams);
    if ('scenario' in state) setScenario(state.scenario);
    if ('cac' in state) setCAC(state.cac);
    if ('ltv' in state) setLTV(state.ltv);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('revenue-forecast-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('revenue-forecast-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('revenue-forecast-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    const metrics = getMetrics();

    if (metrics.year3ARR < 1000000) {
      tips.push("Target £1M ARR by Year 3 to meet one of seven ILR achievement criteria for UK Innovator Founder visa settlement");
    }

    if (metrics.cagr < 30) {
      tips.push("Revenue growth below 30% CAGR may not demonstrate sufficient scalability - endorsing bodies favor high-growth ventures");
    }

    if (metrics.ltvCacRatio < 3) {
      tips.push("LTV:CAC ratio below 3:1 signals inefficient customer economics - optimize pricing or reduce acquisition costs");
    }

    if (streams.length < 2) {
      tips.push("Diversify revenue streams to demonstrate business resilience and multiple paths to scale");
    }

    if (metrics.paybackMonths > 12) {
      tips.push("Customer payback period exceeds 12 months - consider improving unit economics or pricing strategy");
    }

    if (streams.some(s => s.pricingModel === 'one-time')) {
      tips.push("One-time revenue models lack predictability - highlight recurring revenue streams for stronger viability case");
    }

    if (metrics.revenueMultiple < 3) {
      tips.push("Revenue growth multiple below 3x over 3 years may signal limited scaling potential - strengthen growth drivers");
    }

    if (streams.some(s => s.seasonalityFactor > 1.3 || s.seasonalityFactor < 0.7)) {
      tips.push("High seasonality can impact cash flow - document mitigation strategies and maintain adequate reserves");
    }

    if (metrics.year3ARR >= 1000000 && metrics.cagr >= 50) {
      tips.push("Exceptional revenue trajectory - ensure projections are backed by market validation and realistic assumptions");
    }

    tips.push("Document all revenue assumptions with customer interviews, market sizing, and competitor benchmarks");
    tips.push("Include sensitivity analysis showing impact of 20-30% variance in growth rates and customer acquisition");
    tips.push("Prepare detailed cohort analysis demonstrating improving unit economics and customer retention over time");

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Build detailed revenue model with monthly granularity for 36 months across all revenue streams", priority: "Critical" },
      { week: "Week 1", action: "Document pricing strategy with market comparisons and willingness-to-pay research", priority: "Critical" },
      { week: "Week 1-2", action: "Create customer acquisition plan with CAC calculations by channel and cohort analysis", priority: "Critical" },
      { week: "Week 2", action: "Develop three-scenario forecast (conservative, base, optimistic) with clear assumption triggers", priority: "High" },
      { week: "Week 2", action: "Calculate and validate key metrics: LTV, CAC, payback period, churn rate, expansion revenue", priority: "Critical" },
      { week: "Week 2-3", action: "Build seasonality model based on industry benchmarks or early traction data", priority: "High" },
      { week: "Week 3", action: "Prepare revenue bridge analysis showing month-over-month drivers of growth", priority: "High" },
      { week: "Week 3", action: "Document evidence supporting each revenue assumption (LOIs, pilot customers, market research)", priority: "Critical" },
      { week: "Week 3-4", action: "Create sensitivity tables testing impact of growth rate, pricing, and churn variations", priority: "High" },
      { week: "Week 4", action: "Have financial advisor or accountant review model for realism and compliance with UK GAAP", priority: "Critical" },
      { week: "Week 4", action: "Build visual dashboard highlighting path to £1M ARR and key inflection points", priority: "Medium" },
      { week: "Ongoing", action: "Update model monthly with actual results and refine projections based on traction", priority: "High" },
    ];
  };

  const handleExportPdf = () => {
    const metrics = getMetrics();
    const { score, grade } = getViabilityScore();
    const monthly = generateMonthlyProjections();
    const quarterly = generateQuarterlyProjections();
    const annual = generateAnnualProjections();
    const scenarioComp = generateScenarioComparison();

    const report = `UK INNOVATOR FOUNDER VISA - COMPREHENSIVE REVENUE FORECAST
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Viability Score: ${score}/100 (${grade})
Selected Scenario: ${scenario.charAt(0).toUpperCase() + scenario.slice(1)}

Current ARR: £${metrics.currentARR.toLocaleString()}
Year 3 ARR: £${metrics.year3ARR.toLocaleString()}
3-Year CAGR: ${metrics.cagr.toFixed(1)}%
Revenue Multiple: ${metrics.revenueMultiple.toFixed(1)}x

Total 3-Year Revenue: £${metrics.totalRevenue3Years.toLocaleString()}
LTV:CAC Ratio: ${metrics.ltvCacRatio.toFixed(1)}:1
Customer Payback Period: ${metrics.paybackMonths.toFixed(1)} months

${score >= 70 ? 'STRONG REVENUE FORECAST - Demonstrates viability and scalability for UK Innovator Founder visa' : 
  score >= 55 ? 'MODERATE FORECAST - Strengthen growth metrics and diversify revenue streams' :
  'WEAK FORECAST - Significant improvements needed in revenue projections and unit economics'}

REVENUE STREAMS BREAKDOWN
${'-'.repeat(80)}
${streams.map((stream, i) => `
Stream ${i + 1}: ${stream.name || 'Unnamed Stream'}
  Pricing Model: ${stream.pricingModel}
  Monthly Revenue: £${stream.monthlyRevenue.toLocaleString()}
  Growth Rate: ${stream.growthRate}% CAGR
  Current Customers: ${stream.customers}
  Seasonality Factor: ${stream.seasonalityFactor.toFixed(2)}x
`).join('')}

ANNUAL PROJECTIONS (${scenario.toUpperCase()} SCENARIO)
${'-'.repeat(80)}
${annual.map(a => `
${a.year}:
  ARR: £${a.arr.toLocaleString()}
  MRR: £${a.mrr.toLocaleString()}
  Customers: ${a.customers}
  ${a.yearIndex > 0 ? `YoY Growth: ${(((a.arr / annual[a.yearIndex - 1].arr) - 1) * 100).toFixed(1)}%` : ''}
`).join('')}

QUARTERLY BREAKDOWN (FIRST 12 QUARTERS)
${'-'.repeat(80)}
${quarterly.map(q => `
${q.quarter} (Year ${q.year + 1}):
  Revenue: £${q.revenue.toLocaleString()}
  Customers: ${q.customers}
  QoQ Growth: ${q.quarterIndex > 0 ? `${(((q.revenue / quarterly[q.quarterIndex - 1].revenue) - 1) * 100).toFixed(1)}%` : 'N/A'}
`).join('')}

MONTHLY PROJECTIONS (FIRST 12 MONTHS)
${'-'.repeat(80)}
${monthly.slice(0, 13).map(m => `
${m.month}:
  Total Revenue: £${m.totalRevenue.toLocaleString()}
  Customers: ${m.totalCustomers}
  ${m.monthIndex > 0 ? `MoM Growth: ${(((m.totalRevenue / monthly[m.monthIndex - 1].totalRevenue) - 1) * 100).toFixed(1)}%` : ''}
`).join('')}

SCENARIO ANALYSIS COMPARISON
${'-'.repeat(80)}
${scenarioComp.map(s => `
${s.scenario} Scenario:
  Year 3 MRR: £${(s.year3Revenue).toLocaleString()}
  Year 3 ARR: £${s.arr.toLocaleString()}
  3-Year Total: £${s.totalRevenue.toLocaleString()}
  Year 3 Customers: ${s.customers}
`).join('')}

UNIT ECONOMICS ANALYSIS
${'-'.repeat(80)}
Customer Acquisition Cost (CAC): £${cac.toLocaleString()}
Customer Lifetime Value (LTV): £${ltv.toLocaleString()}
LTV:CAC Ratio: ${metrics.ltvCacRatio.toFixed(2)}:1
Payback Period: ${metrics.paybackMonths.toFixed(1)} months

Current ARPU (Annual): £${metrics.currentARR > 0 && metrics.current.totalCustomers > 0 ? 
  (metrics.currentARR / metrics.current.totalCustomers).toFixed(0) : '0'}
Year 3 ARPU (Annual): £${metrics.year3ARR > 0 && metrics.year3.totalCustomers > 0 ? 
  (metrics.year3ARR / metrics.year3.totalCustomers).toFixed(0) : '0'}

VIABILITY SCORE CALCULATION
${'-'.repeat(80)}
Formula: Score = CAGR (25pts) + Year 3 ARR (25pts) + Unit Economics (25pts) + 
         Diversification (15pts) + Growth Multiple (10pts)

CAGR Assessment (${metrics.cagr.toFixed(1)}%):
  >= 100%: 25 points | 50-100%: 20 points | 30-50%: 15 points | 20-30%: 10 points | <20%: 5 points
  ${metrics.cagr >= 100 ? '25/25 points' : metrics.cagr >= 50 ? '20/25 points' : 
    metrics.cagr >= 30 ? '15/25 points' : metrics.cagr >= 20 ? '10/25 points' : '5/25 points'}

Year 3 ARR Target (£${metrics.year3ARR.toLocaleString()}):
  >= £1M: 25 points | £500k-£1M: 20 points | £250k-£500k: 15 points | <£250k: 5 points
  ${metrics.year3ARR >= 1000000 ? '25/25 points (ILR criterion met)' : 
    metrics.year3ARR >= 500000 ? '20/25 points' :
    metrics.year3ARR >= 250000 ? '15/25 points' : '5/25 points'}

LTV:CAC Ratio (${metrics.ltvCacRatio.toFixed(1)}:1):
  >= 5:1: 25 points | 3-5:1: 20 points | 2-3:1: 10 points | <2:1: 5 points
  ${metrics.ltvCacRatio >= 5 ? '25/25 points' : metrics.ltvCacRatio >= 3 ? '20/25 points' :
    metrics.ltvCacRatio >= 2 ? '10/25 points' : '5/25 points'}

Revenue Streams (${streams.length}):
  >= 3 streams: 15 points | 2 streams: 10 points | 1 stream: 5 points
  ${streams.length >= 3 ? '15/15 points' : streams.length >= 2 ? '10/15 points' : '5/15 points'}

Growth Multiple (${metrics.revenueMultiple.toFixed(1)}x):
  >= 5x: 10 points | 3-5x: 7 points | 2-3x: 5 points | <2x: 2 points
  ${metrics.revenueMultiple >= 5 ? '10/10 points' : metrics.revenueMultiple >= 3 ? '7/10 points' :
    metrics.revenueMultiple >= 2 ? '5/10 points' : '2/10 points'}

Final Viability Score: ${score}/100 (${grade})

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(80)}

GOV.UK Viability Criterion:
${metrics.year3ARR >= 250000 && metrics.cagr >= 20 ? 
  '✓ Revenue forecast demonstrates realistic path to sustainable business with positive unit economics' :
  '⚠ Strengthen revenue projections and validate assumptions with market evidence'}

GOV.UK Scalability Criterion:
${metrics.cagr >= 30 && metrics.year3ARR >= 500000 ?
  '✓ High growth trajectory (${metrics.cagr.toFixed(1)}% CAGR) demonstrates clear scalability potential' :
  '⚠ Growth rate or revenue scale may not meet endorsing body expectations for high-growth venture'}

ILR Achievement Criteria (£1M ARR):
${metrics.year3ARR >= 1000000 ?
  '✓ CRITERION MET - £1M+ ARR achieved (1 of 7 ILR criteria, need 2 total for settlement)' :
  `Current projection: £${metrics.year3ARR.toLocaleString()} ARR - £${(1000000 - metrics.year3ARR).toLocaleString()} short of £1M criterion`}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

CRITICAL ASSUMPTIONS TO VALIDATE
${'-'.repeat(80)}
1. Customer acquisition channels and conversion rates by channel
2. Pricing validation through willingness-to-pay research and competitor analysis
3. Churn rate assumptions based on industry benchmarks or early cohort data
4. Seasonality patterns validated against sector norms or pilot data
5. Market size sufficient to support projected customer acquisition targets
6. Competitive positioning enabling sustained growth at projected rates
7. Operational capacity to deliver and support at projected scale
8. Capital requirements to fund growth before achieving cash flow breakeven

ENDORSING BODY PRESENTATION NOTES
${'-'.repeat(80)}
- Emphasize ${metrics.cagr.toFixed(1)}% CAGR demonstrating high-growth potential
- Highlight path to £${metrics.year3ARR >= 1000000 ? '1M+' : (metrics.year3ARR/1000).toFixed(0) + 'k'} ARR within 3-year visa period
- Present ${streams.length} revenue stream${streams.length > 1 ? 's' : ''} showing business model resilience
- Document LTV:CAC ratio of ${metrics.ltvCacRatio.toFixed(1)}:1 demonstrating sustainable economics
- Include scenario analysis showing business viability even in conservative case
- Back all projections with market research, customer validation, and realistic assumptions
- Prepare sensitivity analysis for key variables (growth rate, pricing, CAC, churn)
- Show month-over-month revenue bridge explaining growth drivers

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
www.innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-forecast-${scenario}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const exportMetrics = getMetrics();
    const { score: exportScore, grade: exportGrade } = getViabilityScore();
    const annual = generateAnnualProjections();
    const scenarioComp = generateScenarioComparison();

    await generateWord({
      title: "Comprehensive Revenue Forecast",
      subtitle: "UK Innovator Founder Visa - Financial Viability Assessment",
      filename: `revenue-forecast-${scenario}`,
      sections: [
        { type: 'heading', level: 1, content: 'Executive Summary' },
        { type: 'score', score: { value: exportScore, max: 100, label: `Viability Score (${exportGrade})` } },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Selected Scenario', scenario.charAt(0).toUpperCase() + scenario.slice(1)],
            ['Current ARR', `£${exportMetrics.currentARR.toLocaleString()}`],
            ['Year 3 ARR', `£${exportMetrics.year3ARR.toLocaleString()}`],
            ['3-Year CAGR', `${exportMetrics.cagr.toFixed(1)}%`],
            ['Revenue Multiple', `${exportMetrics.revenueMultiple.toFixed(1)}x`],
            ['Total 3-Year Revenue', `£${exportMetrics.totalRevenue3Years.toLocaleString()}`],
            ['LTV:CAC Ratio', `${exportMetrics.ltvCacRatio.toFixed(1)}:1`],
            ['Customer Payback Period', `${exportMetrics.paybackMonths.toFixed(1)} months`]
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Revenue Streams' },
        { type: 'table', tableData: {
          headers: ['Stream', 'Monthly Revenue', 'Growth Rate', 'Pricing Model', 'Customers'],
          rows: streams.map(s => [
            s.name || 'Unnamed',
            `£${s.monthlyRevenue.toLocaleString()}`,
            `${s.growthRate}%`,
            s.pricingModel,
            s.customers.toString()
          ])
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Annual Projections' },
        { type: 'table', tableData: {
          headers: ['Year', 'ARR', 'MRR', 'Customers'],
          rows: annual.map(a => [
            a.year,
            `£${a.arr.toLocaleString()}`,
            `£${a.mrr.toLocaleString()}`,
            a.customers.toString()
          ])
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Scenario Comparison' },
        { type: 'table', tableData: {
          headers: ['Scenario', 'Year 3 ARR', '3-Year Total', 'Customers'],
          rows: scenarioComp.map(s => [
            s.scenario,
            `£${s.arr.toLocaleString()}`,
            `£${s.totalRevenue.toLocaleString()}`,
            s.customers.toString()
          ])
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Unit Economics' },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Customer Acquisition Cost (CAC)', `£${cac.toLocaleString()}`],
            ['Customer Lifetime Value (LTV)', `£${ltv.toLocaleString()}`],
            ['LTV:CAC Ratio', `${exportMetrics.ltvCacRatio.toFixed(2)}:1`],
            ['Payback Period', `${exportMetrics.paybackMonths.toFixed(1)} months`]
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'UK Visa Alignment' },
        { type: 'paragraph', content: exportMetrics.year3ARR >= 1000000 
          ? 'CRITERION MET - £1M+ ARR achieved (1 of 7 ILR criteria)' 
          : `Current projection: £${exportMetrics.year3ARR.toLocaleString()} ARR - £${(1000000 - exportMetrics.year3ARR).toLocaleString()} short of £1M criterion` },
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Smart Recommendations' },
        { type: 'list', items: getSmartTips() },
        { type: 'divider' },
        { type: 'heading', level: 1, content: '4-Week Action Plan' },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
        }}
      ],
      metadata: {
        subject: 'Revenue Forecast',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['revenue', 'forecast', 'UK visa', 'financial projections']
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const metrics = getMetrics();
  const { score, grade } = getViabilityScore();
  const monthlyData = generateMonthlyProjections();
  const quarterlyData = generateQuarterlyProjections();
  const annualData = generateAnnualProjections();
  const scenarioData = generateScenarioComparison();

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold" data-testid="heading-revenue-forecast">Revenue Forecast</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
            <p className="text-lg text-muted-foreground">Multi-stream revenue projections with growth scenarios and unit economics</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="revenue-forecast"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Revenue Forecast"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-revenue-forecast">
              <TabsTrigger value="forecast" data-testid="tab-forecast">Forecast</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={score >= 70 ? "border-green-500" : score >= 55 ? "border-orange-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Viability Score</p>
                      <p className="text-3xl font-bold" data-testid="text-viability-score">{score}%</p>
                      <p className="text-sm mt-2">{grade}</p>
                      <Progress value={score} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Current ARR</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-current-arr">£{(metrics.currentARR/1000).toFixed(0)}k</p>
                      <p className="text-sm mt-2">MRR: £{(metrics.currentMRR/1000).toFixed(1)}k</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Year 3 ARR</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-year3-arr">£{(metrics.year3ARR/1000).toFixed(0)}k</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {metrics.year3ARR >= 1000000 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm">{metrics.year3ARR >= 1000000 ? '£1M+ Target Met' : 'Below £1M Target'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">3-Year CAGR</p>
                      <p className="text-3xl font-bold" data-testid="text-cagr">{metrics.cagr.toFixed(1)}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{metrics.revenueMultiple.toFixed(1)}x Multiple</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {metrics.year3ARR >= 1000000 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent! Your Year 3 ARR projection meets the £1M revenue criterion for ILR (1 of 7 achievement criteria).
                  </AlertDescription>
                </Alert>
              )}

              {score < 55 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Revenue forecast needs strengthening. Current projections may not demonstrate sufficient viability and scalability for endorsement.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Growth Scenario</CardTitle>
                      <CardDescription>Select projection scenario</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {(['conservative', 'base', 'optimistic'] as GrowthScenario[]).map(scen => (
                        <Button
                          key={scen}
                          variant={scenario === scen ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setScenario(scen)}
                          data-testid={`button-scenario-${scen}`}
                        >
                          {scen.charAt(0).toUpperCase() + scen.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cac">Customer Acquisition Cost (CAC)</Label>
                        <Input
                          id="cac"
                          type="number"
                          value={cac}
                          onChange={(e) => setCAC(parseFloat(e.target.value) || 0)}
                          data-testid="input-cac"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ltv">Customer Lifetime Value (LTV)</Label>
                        <Input
                          id="ltv"
                          type="number"
                          value={ltv}
                          onChange={(e) => setLTV(parseFloat(e.target.value) || 0)}
                          data-testid="input-ltv"
                        />
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Unit Economics</p>
                        <div className="space-y-1 text-sm">
                          <p>LTV:CAC Ratio: <span className="font-bold">{metrics.ltvCacRatio.toFixed(2)}:1</span></p>
                          <p>Payback Period: <span className="font-bold">{metrics.paybackMonths.toFixed(1)} months</span></p>
                          <div className="flex items-center gap-2 mt-2">
                            {metrics.ltvCacRatio >= 3 ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {metrics.ltvCacRatio >= 3 ? 'Healthy unit economics' : 'Improve CAC or LTV'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-4">Scenario Multipliers</p>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="font-medium">Conservative</p>
                          <p className="text-xs text-muted-foreground">70% revenue, 60% growth, 75% customers</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded border border-primary">
                          <p className="font-medium">Base (Realistic)</p>
                          <p className="text-xs text-muted-foreground">100% revenue, 100% growth, 100% customers</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <p className="font-medium">Optimistic</p>
                          <p className="text-xs text-muted-foreground">130% revenue, 150% growth, 140% customers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Revenue Streams</CardTitle>
                    <Button onClick={addStream} size="sm" data-testid="button-add-stream">
                      Add Stream
                    </Button>
                  </div>
                  <CardDescription>Configure multiple revenue sources with different growth rates and pricing models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {streams.map((stream, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`stream-name-${index}`}>Stream Name</Label>
                            <Input
                              id={`stream-name-${index}`}
                              value={stream.name}
                              onChange={(e) => updateStream(index, 'name', e.target.value)}
                              placeholder="e.g., SaaS Subscriptions"
                              data-testid={`input-stream-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`stream-revenue-${index}`}>Monthly Revenue (£)</Label>
                            <Input
                              id={`stream-revenue-${index}`}
                              type="number"
                              value={stream.monthlyRevenue || ''}
                              onChange={(e) => updateStream(index, 'monthlyRevenue', parseFloat(e.target.value) || 0)}
                              data-testid={`input-stream-revenue-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`stream-customers-${index}`}>Customers</Label>
                            <Input
                              id={`stream-customers-${index}`}
                              type="number"
                              value={stream.customers || ''}
                              onChange={(e) => updateStream(index, 'customers', parseInt(e.target.value) || 0)}
                              data-testid={`input-stream-customers-${index}`}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`stream-growth-${index}`}>Growth Rate (% CAGR)</Label>
                            <div className="space-y-2">
                              <Slider
                                id={`stream-growth-${index}`}
                                min={0}
                                max={200}
                                step={5}
                                value={[stream.growthRate]}
                                onValueChange={(val) => updateStream(index, 'growthRate', val[0])}
                                data-testid={`slider-stream-growth-${index}`}
                              />
                              <p className="text-sm text-center font-medium">{stream.growthRate}%</p>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`stream-pricing-${index}`}>Pricing Model</Label>
                            <select
                              id={`stream-pricing-${index}`}
                              value={stream.pricingModel}
                              onChange={(e) => updateStream(index, 'pricingModel', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-stream-pricing-${index}`}
                            >
                              <option value="subscription">Subscription</option>
                              <option value="one-time">One-time</option>
                              <option value="usage-based">Usage-based</option>
                              <option value="freemium">Freemium</option>
                              <option value="tiered">Tiered</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`stream-seasonality-${index}`}>Seasonality Factor</Label>
                            <div className="space-y-2">
                              <Slider
                                id={`stream-seasonality-${index}`}
                                min={0.5}
                                max={1.5}
                                step={0.1}
                                value={[stream.seasonalityFactor]}
                                onValueChange={(val) => updateStream(index, 'seasonalityFactor', val[0])}
                                data-testid={`slider-stream-seasonality-${index}`}
                              />
                              <p className="text-sm text-center font-medium">{stream.seasonalityFactor.toFixed(1)}x</p>
                            </div>
                          </div>
                        </div>
                        {streams.length > 1 && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStream(index)}
                              data-testid={`button-remove-stream-${index}`}
                            >
                              Remove Stream
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (36 Months)</CardTitle>
                  <CardDescription>Monthly revenue progression with seasonality</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(val) => `£${(val/1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`£${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalRevenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Total Revenue"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams Breakdown</CardTitle>
                  <CardDescription>Stacked area chart showing contribution by stream</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(val) => `£${(val/1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => `£${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      {streams.map((stream, idx) => (
                        <Area
                          key={idx}
                          type="monotone"
                          dataKey={`stream${idx}`}
                          stackId="1"
                          stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                          fill={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                          fillOpacity={0.6}
                          name={stream.name || `Stream ${idx + 1}`}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quarterly Revenue</CardTitle>
                    <CardDescription>Quarter-over-quarter performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={quarterlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="quarter" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(val) => `£${(val/1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: number) => [`£${value.toLocaleString()}`, 'Revenue']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scenario Comparison</CardTitle>
                    <CardDescription>Year 3 ARR across scenarios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scenarioData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="scenario" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(val) => `£${(val/1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: number) => [`£${value.toLocaleString()}`, 'ARR']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="arr" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Annual Summary</CardTitle>
                  <CardDescription>Year-over-year revenue and customer growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {annualData.map((year, idx) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Period</p>
                            <p className="text-lg font-bold">{year.year}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ARR</p>
                            <p className="text-lg font-bold" data-testid={`text-arr-year-${idx}`}>£{year.arr.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">MRR</p>
                            <p className="text-lg font-bold">£{year.mrr.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Customers</p>
                            <p className="text-lg font-bold">{year.customers}</p>
                          </div>
                        </div>
                        {idx > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>YoY Growth: {(((year.arr / annualData[idx - 1].arr) - 1) * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips for strengthening your revenue forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <p className="text-sm flex-1" data-testid={`text-tip-${idx}`}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                  <CardDescription>Critical KPIs for endorsing body review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Current ARR</span>
                        <span className="font-bold">£{metrics.currentARR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Year 3 ARR</span>
                        <span className="font-bold">£{metrics.year3ARR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">3-Year CAGR</span>
                        <span className="font-bold">{metrics.cagr.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Revenue Multiple</span>
                        <span className="font-bold">{metrics.revenueMultiple.toFixed(1)}x</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">LTV:CAC Ratio</span>
                        <span className="font-bold">{metrics.ltvCacRatio.toFixed(2)}:1</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Payback Period</span>
                        <span className="font-bold">{metrics.paybackMonths.toFixed(1)} mo</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Revenue Streams</span>
                        <span className="font-bold">{streams.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <span className="text-sm">Year 3 Customers</span>
                        <span className="font-bold">{metrics.year3.totalCustomers}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for revenue model development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="flex-shrink-0">
                          <div className={`px-2 py-1 rounded text-xs font-bold ${
                            item.priority === 'Critical' ? 'bg-red-500 text-white' :
                            item.priority === 'High' ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{item.week}</span>
                          </div>
                          <p className="text-sm" data-testid={`text-action-${idx}`}>{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Requirements</CardTitle>
                  <CardDescription>Evidence needed to support revenue projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Detailed financial model (Excel/Google Sheets) with monthly granularity',
                      'Market research validating TAM, SAM, SOM assumptions',
                      'Customer acquisition plan with CAC by channel',
                      'Pricing strategy with competitor analysis and willingness-to-pay research',
                      'Cohort analysis showing customer retention and expansion revenue',
                      'Sensitivity analysis testing key variables (growth, pricing, CAC, churn)',
                      'Letters of intent or pilot customer commitments',
                      'Revenue bridge analysis explaining month-over-month drivers',
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{req}</p>
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
