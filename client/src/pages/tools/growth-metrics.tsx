import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'growth-metrics',
  toolName: 'Growth Metrics Dashboard',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Expert. I'll help you define and track the key growth metrics that endorsing bodies look for in UK Innovator Founder Visa applications. Let's quantify your business traction and growth trajectory!",
  questions: [
    {
      id: 'mrr',
      question: "What's your current Monthly Recurring Revenue (MRR) in GBP? If you're pre-revenue, enter 0.",
      hint: "This shows revenue predictability - a key indicator endorsers look for",
      fieldKey: 'currentMRR'
    },
    {
      id: 'growth-rate',
      question: "What's your month-over-month growth rate percentage? Consider your average over the past 3-6 months.",
      hint: "15-20% monthly growth is typical for high-growth startups. Be realistic.",
      fieldKey: 'monthlyGrowthRate'
    },
    {
      id: 'cac-ltv',
      question: "What's your Customer Acquisition Cost (CAC) and estimated Customer Lifetime Value (LTV)? Provide both in GBP.",
      hint: "A healthy LTV:CAC ratio is 3:1 or higher. Format: CAC £X, LTV £Y",
      fieldKey: 'cacLtv'
    },
    {
      id: 'churn',
      question: "What's your monthly customer churn rate? This is the percentage of customers who stop using your service each month.",
      hint: "For SaaS, under 5% monthly churn is considered healthy",
      fieldKey: 'churnRate'
    },
    {
      id: 'users',
      question: "How many total users/customers do you have, and how many are active monthly? Also, how many new users did you acquire this month?",
      hint: "Active users demonstrate product-market fit",
      fieldKey: 'userMetrics'
    },
    {
      id: 'activation',
      question: "What's your activation rate - the percentage of new users who complete a key action that indicates they've found value?",
      hint: "This could be completing onboarding, making first purchase, etc. Target 60%+",
      fieldKey: 'activationRate'
    }
  ],
  completionMessage: "Excellent! You've provided comprehensive growth metrics. These demonstrate your business traction and will help endorsing bodies assess your scalability potential. I'm now populating your metrics dashboard."
};

type MonthlyMetrics = {
  month: string;
  mrr: number;
  cac: number;
  ltv: number;
  churnRate: number;
  userAcquisition: number;
  activationRate: number;
  engagement: number;
};

type CohortData = {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
};

export default function GrowthMetrics() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('growth-metrics-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('growth-metrics-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  // Current Month Metrics
  const [currentMRR, setCurrentMRR] = useState(25000);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(15);
  const [cac, setCAC] = useState(350);
  const [ltv, setLTV] = useState(2400);
  const [churnRate, setChurnRate] = useState(5);
  const [totalUsers, setTotalUsers] = useState(500);
  const [activeUsers, setActiveUsers] = useState(380);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(75);
  const [activationRate, setActivationRate] = useState(68);
  const [avgRevenuePerUser, setAvgRevenuePerUser] = useState(50);
  const [customerLifetime, setCustomerLifetime] = useState(48);

  // Growth Metrics
  const [marketingSpend, setMarketingSpend] = useState(26250);
  const [salesConversionRate, setSalesConversionRate] = useState(22);
  const [avgDealSize, setAvgDealSize] = useState(600);
  const [paybackPeriod, setPaybackPeriod] = useState(7);

  // Engagement Metrics
  const [dailyActiveUsers, setDailyActiveUsers] = useState(180);
  const [weeklyActiveUsers, setWeeklyActiveUsers] = useState(320);
  const [avgSessionDuration, setAvgSessionDuration] = useState(12);
  const [featureAdoptionRate, setFeatureAdoptionRate] = useState(45);

  // Historical Data (last 6 months)
  const [metricsHistory, setMetricsHistory] = useState<MonthlyMetrics[]>([
    { month: 'Month 1', mrr: 15000, cac: 400, ltv: 1800, churnRate: 8, userAcquisition: 38, activationRate: 58, engagement: 55 },
    { month: 'Month 2', mrr: 17250, cac: 380, ltv: 2000, churnRate: 7, userAcquisition: 46, activationRate: 62, engagement: 60 },
    { month: 'Month 3', mrr: 19837, cac: 370, ltv: 2100, churnRate: 6.5, userAcquisition: 54, activationRate: 64, engagement: 63 },
    { month: 'Month 4', mrr: 22813, cac: 360, ltv: 2200, churnRate: 6, userAcquisition: 62, activationRate: 65, engagement: 65 },
    { month: 'Month 5', mrr: 23654, cac: 355, ltv: 2300, churnRate: 5.5, userAcquisition: 68, activationRate: 67, engagement: 67 },
    { month: 'Month 6', mrr: 25000, cac: 350, ltv: 2400, churnRate: 5, userAcquisition: 75, activationRate: 68, engagement: 70 },
  ]);

  // Cohort Retention Data
  const [cohortData, setCohortData] = useState<CohortData[]>([
    { cohort: 'Jan 2025', month0: 100, month1: 85, month2: 78, month3: 72, month6: 65 },
    { cohort: 'Feb 2025', month0: 100, month1: 87, month2: 80, month3: 75, month6: 68 },
    { cohort: 'Mar 2025', month0: 100, month1: 88, month2: 82, month3: 77, month6: 70 },
    { cohort: 'Apr 2025', month0: 100, month1: 90, month2: 84, month3: 79, month6: 72 },
    { cohort: 'May 2025', month0: 100, month1: 91, month2: 85, month3: 80, month6: 73 },
    { cohort: 'Jun 2025', month0: 100, month1: 92, month2: 86, month3: 82, month6: 75 },
  ]);

  const calculateHealthScore = () => {
    let score = 0;
    
    // LTV:CAC Ratio (25 points) - Target 3:1 or better
    const ltvCacRatio = ltv / cac;
    if (ltvCacRatio >= 5) score += 25;
    else if (ltvCacRatio >= 3) score += 20;
    else if (ltvCacRatio >= 2) score += 12;
    else if (ltvCacRatio >= 1) score += 5;
    
    // Churn Rate (20 points) - Lower is better
    if (churnRate <= 3) score += 20;
    else if (churnRate <= 5) score += 15;
    else if (churnRate <= 7) score += 10;
    else if (churnRate <= 10) score += 5;
    
    // Monthly Growth Rate (20 points)
    if (monthlyGrowthRate >= 20) score += 20;
    else if (monthlyGrowthRate >= 15) score += 15;
    else if (monthlyGrowthRate >= 10) score += 10;
    else if (monthlyGrowthRate >= 5) score += 5;
    
    // Activation Rate (15 points)
    if (activationRate >= 75) score += 15;
    else if (activationRate >= 65) score += 12;
    else if (activationRate >= 55) score += 8;
    else if (activationRate >= 45) score += 4;
    
    // Engagement (DAU/MAU) (10 points)
    const dauMau = (dailyActiveUsers / (activeUsers || 1)) * 100;
    if (dauMau >= 50) score += 10;
    else if (dauMau >= 40) score += 7;
    else if (dauMau >= 30) score += 4;
    else if (dauMau >= 20) score += 2;
    
    // Payback Period (10 points) - Lower is better
    if (paybackPeriod <= 6) score += 10;
    else if (paybackPeriod <= 12) score += 7;
    else if (paybackPeriod <= 18) score += 4;
    else if (paybackPeriod <= 24) score += 2;
    
    return Math.min(100, Math.round(score));
  };

  const healthScore = calculateHealthScore();

  const getHealthGrade = () => {
    if (healthScore >= 85) return { grade: 'A', label: 'Excellent Growth', color: 'text-green-600' };
    if (healthScore >= 70) return { grade: 'B', label: 'Strong Growth', color: 'text-green-500' };
    if (healthScore >= 55) return { grade: 'C', label: 'Moderate Growth', color: 'text-yellow-600' };
    if (healthScore >= 40) return { grade: 'D', label: 'Weak Growth', color: 'text-orange-600' };
    return { grade: 'F', label: 'Poor Growth', color: 'text-red-600' };
  };

  const healthGrade = getHealthGrade();

  const ltvCacRatio = ltv / cac;
  const dauMauRatio = (dailyActiveUsers / (activeUsers || 1)) * 100;
  const wauMauRatio = (weeklyActiveUsers / (activeUsers || 1)) * 100;

  const getKPITrendData = () => {
    return metricsHistory.map(m => ({
      month: m.month,
      'MRR Growth': ((m.mrr - 15000) / 15000) * 100,
      'LTV:CAC Ratio': (m.ltv / m.cac),
      'Churn Rate': m.churnRate,
      'Activation Rate': m.activationRate,
    }));
  };

  const getRadarData = () => [
    { metric: 'LTV:CAC', score: Math.min(100, (ltvCacRatio / 5) * 100), target: 100 },
    { metric: 'Retention', score: Math.max(0, 100 - churnRate * 10), target: 100 },
    { metric: 'Growth Rate', score: Math.min(100, (monthlyGrowthRate / 20) * 100), target: 100 },
    { metric: 'Activation', score: activationRate, target: 100 },
    { metric: 'Engagement', score: dauMauRatio, target: 100 },
    { metric: 'Payback', score: Math.max(0, 100 - (paybackPeriod / 24) * 100), target: 100 },
  ];

  const getRevenueProjection = () => {
    const projection = [];
    let mrr = currentMRR;
    for (let i = 0; i <= 12; i++) {
      projection.push({
        month: i === 0 ? 'Current' : `+${i}M`,
        mrr: Math.round(mrr),
        arr: Math.round(mrr * 12),
      });
      mrr = mrr * (1 + monthlyGrowthRate / 100);
    }
    return projection;
  };

  const getCohortRetentionChart = () => {
    return cohortData.map(c => ({
      cohort: c.cohort,
      'Month 0': c.month0,
      'Month 1': c.month1,
      'Month 2': c.month2,
      'Month 3': c.month3,
      'Month 6': c.month6,
    }));
  };

  const getSerializedState = () => {
    return {
      currentMRR,
      monthlyGrowthRate,
      cac,
      ltv,
      churnRate,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      activationRate,
      avgRevenuePerUser,
      customerLifetime,
      marketingSpend,
      salesConversionRate,
      avgDealSize,
      paybackPeriod,
      dailyActiveUsers,
      weeklyActiveUsers,
      avgSessionDuration,
      featureAdoptionRate,
      metricsHistory,
      cohortData,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('currentMRR' in state) setCurrentMRR(state.currentMRR);
    if ('monthlyGrowthRate' in state) setMonthlyGrowthRate(state.monthlyGrowthRate);
    if ('cac' in state) setCAC(state.cac);
    if ('ltv' in state) setLTV(state.ltv);
    if ('churnRate' in state) setChurnRate(state.churnRate);
    if ('totalUsers' in state) setTotalUsers(state.totalUsers);
    if ('activeUsers' in state) setActiveUsers(state.activeUsers);
    if ('newUsersThisMonth' in state) setNewUsersThisMonth(state.newUsersThisMonth);
    if ('activationRate' in state) setActivationRate(state.activationRate);
    if ('avgRevenuePerUser' in state) setAvgRevenuePerUser(state.avgRevenuePerUser);
    if ('customerLifetime' in state) setCustomerLifetime(state.customerLifetime);
    if ('marketingSpend' in state) setMarketingSpend(state.marketingSpend);
    if ('salesConversionRate' in state) setSalesConversionRate(state.salesConversionRate);
    if ('avgDealSize' in state) setAvgDealSize(state.avgDealSize);
    if ('paybackPeriod' in state) setPaybackPeriod(state.paybackPeriod);
    if ('dailyActiveUsers' in state) setDailyActiveUsers(state.dailyActiveUsers);
    if ('weeklyActiveUsers' in state) setWeeklyActiveUsers(state.weeklyActiveUsers);
    if ('avgSessionDuration' in state) setAvgSessionDuration(state.avgSessionDuration);
    if ('featureAdoptionRate' in state) setFeatureAdoptionRate(state.featureAdoptionRate);
    if ('metricsHistory' in state) setMetricsHistory(state.metricsHistory);
    if ('cohortData' in state) setCohortData(state.cohortData);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('growth-metrics-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('growth-metrics-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.currentMRR) {
      const mrrMatch = answers.currentMRR.match(/[\d,]+/);
      if (mrrMatch) setCurrentMRR(parseInt(mrrMatch[0].replace(/,/g, '')));
    }
    if (answers.monthlyGrowthRate) {
      const rateMatch = answers.monthlyGrowthRate.match(/[\d.]+/);
      if (rateMatch) setMonthlyGrowthRate(parseFloat(rateMatch[0]));
    }
    if (answers.cacLtv) {
      const cacMatch = answers.cacLtv.match(/cac[^\d]*(\d[\d,]*)/i);
      const ltvMatch = answers.cacLtv.match(/ltv[^\d]*(\d[\d,]*)/i);
      if (cacMatch) setCAC(parseInt(cacMatch[1].replace(/,/g, '')));
      if (ltvMatch) setLTV(parseInt(ltvMatch[1].replace(/,/g, '')));
    }
    if (answers.churnRate) {
      const churnMatch = answers.churnRate.match(/[\d.]+/);
      if (churnMatch) setChurnRate(parseFloat(churnMatch[0]));
    }
    if (answers.userMetrics) {
      const totalMatch = answers.userMetrics.match(/total[^\d]*(\d[\d,]*)/i);
      const activeMatch = answers.userMetrics.match(/active[^\d]*(\d[\d,]*)/i);
      const newMatch = answers.userMetrics.match(/new[^\d]*(\d[\d,]*)/i);
      if (totalMatch) setTotalUsers(parseInt(totalMatch[1].replace(/,/g, '')));
      if (activeMatch) setActiveUsers(parseInt(activeMatch[1].replace(/,/g, '')));
      if (newMatch) setNewUsersThisMonth(parseInt(newMatch[1].replace(/,/g, '')));
    }
    if (answers.activationRate) {
      const rateMatch = answers.activationRate.match(/[\d.]+/);
      if (rateMatch) setActivationRate(parseFloat(rateMatch[0]));
    }
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('growth-metrics-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('growth-metrics-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (ltvCacRatio < 3) {
      tips.push(`LTV:CAC ratio of ${ltvCacRatio.toFixed(2)}:1 is below healthy 3:1 threshold. Focus on increasing customer lifetime value through upsells and reducing churn, or optimize customer acquisition cost through more efficient marketing channels.`);
    }
    
    if (churnRate > 5) {
      tips.push(`Monthly churn rate of ${churnRate}% exceeds SaaS benchmark of 5%. Implement proactive retention strategies, improve onboarding, and conduct exit interviews to understand why customers leave. Each 1% reduction in churn significantly improves LTV.`);
    }
    
    if (activationRate < 70) {
      tips.push(`Activation rate of ${activationRate}% indicates friction in onboarding. Map the user journey to identify drop-off points, implement progress indicators, and create activation checklists to guide new users to their first value moment faster.`);
    }
    
    if (dauMauRatio < 40) {
      tips.push(`DAU/MAU ratio of ${dauMauRatio.toFixed(1)}% suggests low daily engagement. Build habit-forming features, implement daily use cases, and use push notifications strategically to increase stickiness. Target 40%+ for sticky products.`);
    }
    
    if (paybackPeriod > 12) {
      tips.push(`CAC payback period of ${paybackPeriod} months is lengthy. Accelerate cash recovery by optimizing pricing tiers, implementing annual billing incentives, or improving sales conversion rates to reduce customer acquisition costs.`);
    }
    
    if (monthlyGrowthRate < 10) {
      tips.push(`Monthly growth rate of ${monthlyGrowthRate}% is below VC-backed startup benchmark of 15-20%. Validate product-market fit, identify scalable acquisition channels, and ensure sales/marketing efficiency before raising next funding round.`);
    }
    
    if (salesConversionRate < 20) {
      tips.push(`Sales conversion rate of ${salesConversionRate}% indicates room for optimization. A/B test messaging, improve lead qualification, shorten sales cycles, and provide better product demonstrations to increase conversion efficiency.`);
    }
    
    if (featureAdoptionRate < 50) {
      tips.push(`Feature adoption rate of ${featureAdoptionRate}% suggests users aren't experiencing full product value. Use in-app guides, feature spotlights, and usage analytics to drive adoption of high-value features that correlate with retention.`);
    }
    
    if (ltvCacRatio >= 3 && churnRate <= 5 && monthlyGrowthRate >= 15) {
      tips.push(`Excellent unit economics with ${ltvCacRatio.toFixed(1)}:1 LTV:CAC, ${churnRate}% churn, and ${monthlyGrowthRate}% growth. Document these metrics for visa endorsement as evidence of scalable, viable business model with strong market validation.`);
    }
    
    if (healthScore >= 70) {
      tips.push(`Strong growth health score of ${healthScore}% demonstrates sustainable scaling trajectory. Focus on maintaining quality growth while documenting traction evidence for UK Innovator Founder visa application.`);
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Audit current metrics tracking infrastructure - ensure accurate CAC calculation (total marketing + sales costs / new customers), LTV methodology (ARPU × customer lifetime), and cohort retention tracking systems are in place",
        priority: "Critical"
      },
      { 
        week: "Week 1", 
        action: "Set up automated dashboards tracking North Star metric, growth rate, retention cohorts, and unit economics. Use tools like Mixpanel, Amplitude, or custom analytics to monitor daily/weekly trends",
        priority: "Critical"
      },
      { 
        week: "Week 1-2", 
        action: "Conduct retention analysis - identify at-risk customer segments, analyze churn reasons through exit surveys, and implement early warning system for accounts showing disengagement patterns",
        priority: "High"
      },
      { 
        week: "Week 2", 
        action: "Optimize onboarding flow to improve activation rate - implement progress bars, interactive walkthroughs, and time-to-value reduction strategies. Target 70%+ activation within first week",
        priority: "High"
      },
      { 
        week: "Week 2-3", 
        action: "Launch retention initiatives: create customer success playbook, implement health scoring, introduce quarterly business reviews for key accounts, and build community engagement programs",
        priority: "Critical"
      },
      { 
        week: "Week 3", 
        action: "Analyze and optimize customer acquisition channels - calculate CAC by channel, identify most profitable sources, double down on efficient channels, and cut underperforming spend",
        priority: "High"
      },
      { 
        week: "Week 3", 
        action: "Implement cohort-based product improvements - analyze feature usage patterns by retention cohort, prioritize features that drive long-term engagement, and sunset low-value features",
        priority: "Medium"
      },
      { 
        week: "Week 3-4", 
        action: "Develop growth experiments pipeline: test pricing optimization, referral programs, product-led growth tactics, and expansion revenue opportunities to improve unit economics",
        priority: "High"
      },
      { 
        week: "Week 4", 
        action: "Build investor-grade metrics deck documenting: cohort retention curves, LTV:CAC trends, revenue growth trajectory, market expansion strategy. Prepare for endorsing body review",
        priority: "Critical"
      },
      { 
        week: "Week 4", 
        action: "Create scalability evidence package: document repeatable acquisition playbook, demonstrate improving unit economics over time, show cohort retention improvements, and quantify total addressable market penetration",
        priority: "Critical"
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - GROWTH METRICS DASHBOARD
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Growth Health Score: ${healthScore}% (Grade: ${healthGrade.grade} - ${healthGrade.label})

${healthScore >= 70 ? 'STRONG GROWTH METRICS - Unit economics and scaling trajectory demonstrate viable, scalable business model for UK Innovator Founder visa endorsement' : healthScore >= 55 ? 'MODERATE GROWTH - Viable foundation but optimize key metrics before endorsement application' : 'WEAK GROWTH - Significant optimization needed to demonstrate scalability for visa requirements'}

CORE UNIT ECONOMICS
${'-'.repeat(80)}
LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}:1
${ltvCacRatio >= 3 ? 'HEALTHY - Sustainable unit economics (Target: 3:1 minimum)' : ltvCacRatio >= 2 ? 'MODERATE - Improve to 3:1 for strong endorsement case' : 'WEAK - Critical optimization needed'}
Benchmark: SaaS 3:1 minimum, 5:1+ excellent

Customer Lifetime Value (LTV): £${ltv.toLocaleString()}
Customer Acquisition Cost (CAC): £${cac.toLocaleString()}
CAC Payback Period: ${paybackPeriod} months
${paybackPeriod <= 12 ? 'EFFICIENT - Fast cash recovery' : 'LENGTHY - Optimize for faster payback'}

Monthly Churn Rate: ${churnRate}%
${churnRate <= 5 ? 'EXCELLENT - Strong retention' : churnRate <= 7 ? 'ACCEPTABLE - Monitor closely' : 'HIGH - Critical retention issues'}
Benchmark: SaaS 5% or lower = healthy

Monthly Recurring Revenue (MRR): £${currentMRR.toLocaleString()}
Annual Run Rate (ARR): £${(currentMRR * 12).toLocaleString()}
Monthly Growth Rate: ${monthlyGrowthRate}%
${monthlyGrowthRate >= 15 ? 'STRONG - Rapid scaling' : monthlyGrowthRate >= 10 ? 'MODERATE - Steady growth' : 'SLOW - Acceleration needed'}

CUSTOMER METRICS
${'-'.repeat(80)}
Total Customers: ${totalUsers.toLocaleString()}
Active Users: ${activeUsers.toLocaleString()}
New Users This Month: ${newUsersThisMonth.toLocaleString()}
Activation Rate: ${activationRate}%
${activationRate >= 70 ? 'HIGH - Effective onboarding' : activationRate >= 60 ? 'MODERATE - Room for improvement' : 'LOW - Optimize activation'}

Average Revenue Per User (ARPU): £${avgRevenuePerUser.toLocaleString()}/month
Customer Lifetime: ${customerLifetime} months
Average Deal Size: £${avgDealSize.toLocaleString()}

ENGAGEMENT METRICS
${'-'.repeat(80)}
Daily Active Users (DAU): ${dailyActiveUsers.toLocaleString()}
Weekly Active Users (WAU): ${weeklyActiveUsers.toLocaleString()}
Monthly Active Users (MAU): ${activeUsers.toLocaleString()}

DAU/MAU Ratio: ${dauMauRatio.toFixed(1)}%
${dauMauRatio >= 40 ? 'STICKY - High daily engagement' : dauMauRatio >= 30 ? 'MODERATE - Regular usage' : 'LOW - Limited stickiness'}
Benchmark: 40%+ = sticky product, 20-40% = moderate engagement

WAU/MAU Ratio: ${wauMauRatio.toFixed(1)}%
Average Session Duration: ${avgSessionDuration} minutes
Feature Adoption Rate: ${featureAdoptionRate}%

ACQUISITION METRICS
${'-'.repeat(80)}
Monthly Marketing Spend: £${marketingSpend.toLocaleString()}
Sales Conversion Rate: ${salesConversionRate}%
Cost Per Acquisition: £${cac.toLocaleString()}
New Customer Acquisition: ${newUsersThisMonth} users/month

GROWTH HEALTH SCORE CALCULATION
${'-'.repeat(80)}
Formula: Weighted evaluation across 6 critical growth dimensions

Component Breakdown:
  LTV:CAC Ratio (25% weight): ${ltvCacRatio >= 5 ? '25/25' : ltvCacRatio >= 3 ? '20/25' : ltvCacRatio >= 2 ? '12/25' : '5/25'} points
  Churn Rate (20% weight): ${churnRate <= 3 ? '20/20' : churnRate <= 5 ? '15/20' : churnRate <= 7 ? '10/20' : '5/20'} points
  Growth Rate (20% weight): ${monthlyGrowthRate >= 20 ? '20/20' : monthlyGrowthRate >= 15 ? '15/20' : monthlyGrowthRate >= 10 ? '10/20' : '5/20'} points
  Activation Rate (15% weight): ${activationRate >= 75 ? '15/15' : activationRate >= 65 ? '12/15' : activationRate >= 55 ? '8/15' : '4/15'} points
  Engagement DAU/MAU (10% weight): ${dauMauRatio >= 50 ? '10/10' : dauMauRatio >= 40 ? '7/10' : dauMauRatio >= 30 ? '4/10' : '2/10'} points
  Payback Period (10% weight): ${paybackPeriod <= 6 ? '10/10' : paybackPeriod <= 12 ? '7/10' : paybackPeriod <= 18 ? '4/10' : '2/10'} points

Total Growth Health Score: ${healthScore}/100 (${healthGrade.grade} - ${healthGrade.label})

METRICS TRENDS (Last 6 Months)
${'-'.repeat(80)}
${metricsHistory.map((m, i) => {
  const growth = i > 0 ? ((m.mrr - metricsHistory[i-1].mrr) / metricsHistory[i-1].mrr * 100).toFixed(1) : '0.0';
  return m.month + ': MRR £' + m.mrr.toLocaleString() + ' (+' + growth + '%), LTV:CAC ' + (m.ltv/m.cac).toFixed(1) + ':1, Churn ' + m.churnRate + '%, Activation ' + m.activationRate + '%, Engagement ' + m.engagement + '%';
}).join('\n')}

Revenue Growth: ${metricsHistory.length > 0 ? ((metricsHistory[5].mrr - metricsHistory[0].mrr) / metricsHistory[0].mrr * 100).toFixed(1) : '0'}% over 6 months
Trajectory: ${metricsHistory.length > 0 && metricsHistory[5].mrr > metricsHistory[0].mrr ? 'POSITIVE GROWTH' : 'FLAT/DECLINING'}

COHORT RETENTION ANALYSIS
${'-'.repeat(80)}
${cohortData.map(c => c.cohort + ': M0 ' + c.month0 + '% → M1 ' + c.month1 + '% → M2 ' + c.month2 + '% → M3 ' + c.month3 + '% → M6 ' + c.month6 + '%').join('\n')}

Average Month 3 Retention: ${(cohortData.reduce((sum, c) => sum + c.month3, 0) / cohortData.length).toFixed(1)}%
Average Month 6 Retention: ${(cohortData.reduce((sum, c) => sum + c.month6, 0) / cohortData.length).toFixed(1)}%
${cohortData[cohortData.length - 1].month6 > cohortData[0].month6 ? 'IMPROVING - Retention getting better over time' : 'STABLE/DECLINING - Focus on retention initiatives'}

12-MONTH REVENUE PROJECTION
${'-'.repeat(80)}
${getRevenueProjection().slice(0, 13).map(p => p.month + ': MRR £' + p.mrr.toLocaleString() + ', ARR £' + p.arr.toLocaleString()).join('\n')}

Projected ARR in 12 months: £${getRevenueProjection()[12].arr.toLocaleString()}
Growth Multiple: ${(getRevenueProjection()[12].arr / (currentMRR * 12)).toFixed(2)}x

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(80)}
GOV.UK Scalability Assessment Factors:
• Unit economics demonstrate sustainable business model (Viability Criterion)
• Growth trajectory shows market validation and scaling potential
• Cohort retention proves product-market fit and customer satisfaction
• Revenue growth validates commercial viability
• Engagement metrics demonstrate product stickiness and defensibility

SCALABILITY EVIDENCE STRENGTH:

LTV:CAC Ratio: ${ltvCacRatio.toFixed(2)}:1
${ltvCacRatio >= 3 ? 'STRONG - Healthy unit economics prove business can profitably acquire customers at scale. Document CAC calculation methodology and LTV assumptions for endorsing body.' : 'NEEDS IMPROVEMENT - Optimize to 3:1 minimum before application. Weak unit economics raise viability concerns.'}

Cohort Retention: Month 6 average ${(cohortData.reduce((sum, c) => sum + c.month6, 0) / cohortData.length).toFixed(1)}%
${cohortData.reduce((sum, c) => sum + c.month6, 0) / cohortData.length >= 70 ? 'STRONG - High retention validates product-market fit and sticky customer base. Scalability indicator for endorsement.' : 'MODERATE - Improve retention to demonstrate sustainable growth potential and reduce churn concerns.'}

Revenue Growth: ${monthlyGrowthRate}% monthly (${(((1 + monthlyGrowthRate/100) ** 12 - 1) * 100).toFixed(1)}}% annualized
${monthlyGrowthRate >= 15 ? 'STRONG - ' + monthlyGrowthRate + '% monthly growth demonstrates market demand and scaling ability. Provide detailed channel breakdown for endorsement.' : monthlyGrowthRate >= 10 ? 'MODERATE - Steady growth but accelerate to demonstrate high-growth potential required for visa approval.' : 'WEAK - Growth below investor/endorser expectations. Validate product-market fit and optimize acquisition before application.'}

Overall Scalability Assessment: ${healthScore >= 70 && ltvCacRatio >= 3 && churnRate <= 5 ? 'READY - Strong metrics support scalability criterion for endorsement application' : healthScore >= 55 ? 'NEARLY READY - Strengthen key metrics before endorsement submission' : 'NOT READY - Significant optimization needed to demonstrate scalability'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => (i + 1) + '. ' + tip).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => '[' + item.priority + '] ' + item.week + ': ' + item.action).join('\n')}

KEY GROWTH METRICS DEFINITIONS
${'-'.repeat(80)}
Customer Lifetime Value (LTV): Total revenue expected from a customer over their lifetime
Formula: ARPU × Customer Lifetime (months)

Customer Acquisition Cost (CAC): Total cost to acquire one new customer
Formula: (Marketing Spend + Sales Costs) / New Customers Acquired

LTV:CAC Ratio: Measure of unit economics efficiency
Benchmark: 3:1 minimum for healthy SaaS, 5:1+ excellent

CAC Payback Period: Months to recover customer acquisition cost
Formula: CAC / (ARPU × Gross Margin)
Benchmark: 12 months or less for efficient growth

Monthly Churn Rate: Percentage of customers lost each month
Formula: (Customers Lost This Month / Customers at Start of Month) × 100
Benchmark: SaaS 5% or lower

DAU/MAU Ratio: Daily engagement intensity
Formula: (Daily Active Users / Monthly Active Users) × 100
Benchmark: 40%+ = sticky product, 20-40% = moderate

Activation Rate: Percentage of new users reaching "aha moment"
Formula: (Activated Users / Total New Users) × 100
Benchmark: 70%+ for well-optimized onboarding

SOURCES & REFERENCES
${'-'.repeat(80)}
GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder

Scalability Criterion: Business model demonstrates potential to create jobs and grow into national or international markets

Unit Economics Benchmarks:
- SaaS Capital: LTV:CAC 3:1+, Churn <5%, CAC Payback <12 months
- David Skok (Matrix Partners): Rule of 40 (Growth % + Profit % ≥ 40%)
- Andreessen Horowitz: DAU/MAU 40%+ for consumer, 20%+ for B2B

Growth Metrics Framework:
- Dave McClure (500 Startups): AARRR Pirate Metrics
- Sean Ellis: PMF Survey + Retention Cohorts
- Brian Balfour (Reforge): Product-Market Fit + Market-Channel Fit

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-metrics-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2" data-testid="heading-growth-metrics">Growth Metrics Dashboard</h1>
                <p className="text-lg text-muted-foreground">Track CAC, LTV, churn, MRR growth, and unit economics for scalability validation</p>
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
                  <p>Atlas, our Growth Expert, helps you track the metrics that matter for your visa application.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Get guidance on key SaaS metrics like MRR, CAC, LTV</li>
                    <li>Understand unit economics benchmarks</li>
                    <li>Track growth rates that demonstrate scalability</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the dashboard when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="growth-metrics"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Growth Metrics Dashboard"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-growth-metrics">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics Input</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Health Score</CardTitle>
                  <CardDescription>Comprehensive assessment of unit economics and scaling trajectory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={healthScore >= 70 ? "border-green-500" : healthScore >= 55 ? "border-yellow-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Health Score</p>
                          <p className={`text-4xl font-bold ${healthGrade.color}`} data-testid="text-health-score">{healthScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {healthScore >= 70 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : healthScore >= 55 ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm font-medium">{healthGrade.grade} - {healthGrade.label}</span>
                          </div>
                          <Progress value={healthScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={ltvCacRatio >= 3 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">LTV:CAC Ratio</p>
                          <p className="text-4xl font-bold text-primary" data-testid="text-ltv-cac-ratio">{ltvCacRatio.toFixed(2)}:1</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {ltvCacRatio >= 3 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{ltvCacRatio >= 3 ? 'Healthy' : 'Needs Improvement'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Target: 3:1 minimum</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={churnRate <= 5 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Monthly Churn</p>
                          <p className="text-4xl font-bold" data-testid="text-churn-rate">{churnRate}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {churnRate <= 5 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{churnRate <= 5 ? 'Excellent' : 'High'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Target: 5% or lower</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">MRR</p>
                          <p className="text-2xl font-bold" data-testid="text-current-mrr">£{currentMRR.toLocaleString()}</p>
                          <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {monthlyGrowthRate}%/month
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">CAC</p>
                          <p className="text-2xl font-bold" data-testid="text-cac">£{cac.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Payback: {paybackPeriod}mo</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">LTV</p>
                          <p className="text-2xl font-bold" data-testid="text-ltv">£{ltv.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">{customerLifetime} months</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">DAU/MAU</p>
                          <p className="text-2xl font-bold" data-testid="text-dau-mau">{dauMauRatio.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{dauMauRatio >= 40 ? 'Sticky' : 'Moderate'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {healthScore >= 70 && ltvCacRatio >= 3 && churnRate <= 5 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent growth metrics! Your unit economics and retention validate a scalable business model. Document these metrics for UK Innovator Founder visa endorsement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {ltvCacRatio < 3 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        LTV:CAC ratio of {ltvCacRatio.toFixed(2)}:1 is below the healthy 3:1 threshold. Focus on increasing customer lifetime value or reducing acquisition costs.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Health Radar</CardTitle>
                    <CardDescription>Multi-dimensional growth assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Current" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Projection</CardTitle>
                    <CardDescription>12-month MRR and ARR forecast at {monthlyGrowthRate}% monthly growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={getRevenueProjection().slice(0, 7)}>
                        <defs>
                          <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Area type="monotone" dataKey="mrr" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMRR)" name="MRR" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Projected ARR in 12 months: £{getRevenueProjection()[12].arr.toLocaleString()} ({(getRevenueProjection()[12].arr / (currentMRR * 12)).toFixed(1)}x current)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Monthly recurring revenue and growth rates</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current-mrr">Current MRR (£)</Label>
                    <Input
                      id="current-mrr"
                      type="number"
                      value={currentMRR}
                      onChange={(e) => setCurrentMRR(parseFloat(e.target.value) || 0)}
                      data-testid="input-current-mrr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthly-growth">Monthly Growth Rate (%)</Label>
                    <Input
                      id="monthly-growth"
                      type="number"
                      value={monthlyGrowthRate}
                      onChange={(e) => setMonthlyGrowthRate(parseFloat(e.target.value) || 0)}
                      data-testid="input-monthly-growth"
                    />
                  </div>
                  <div>
                    <Label htmlFor="arpu">Avg Revenue Per User (£)</Label>
                    <Input
                      id="arpu"
                      type="number"
                      value={avgRevenuePerUser}
                      onChange={(e) => setAvgRevenuePerUser(parseFloat(e.target.value) || 0)}
                      data-testid="input-arpu"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unit Economics</CardTitle>
                  <CardDescription>Customer acquisition cost and lifetime value</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cac">Customer Acquisition Cost (£)</Label>
                    <Input
                      id="cac"
                      type="number"
                      value={cac}
                      onChange={(e) => setCAC(parseFloat(e.target.value) || 0)}
                      data-testid="input-cac"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ltv">Customer Lifetime Value (£)</Label>
                    <Input
                      id="ltv"
                      type="number"
                      value={ltv}
                      onChange={(e) => setLTV(parseFloat(e.target.value) || 0)}
                      data-testid="input-ltv"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-lifetime">Customer Lifetime (months)</Label>
                    <Input
                      id="customer-lifetime"
                      type="number"
                      value={customerLifetime}
                      onChange={(e) => setCustomerLifetime(parseFloat(e.target.value) || 0)}
                      data-testid="input-customer-lifetime"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payback-period">CAC Payback Period (months)</Label>
                    <Input
                      id="payback-period"
                      type="number"
                      value={paybackPeriod}
                      onChange={(e) => setPaybackPeriod(parseFloat(e.target.value) || 0)}
                      data-testid="input-payback-period"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                  <CardDescription>User acquisition, activation, and retention</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="total-users">Total Customers</Label>
                    <Input
                      id="total-users"
                      type="number"
                      value={totalUsers}
                      onChange={(e) => setTotalUsers(parseFloat(e.target.value) || 0)}
                      data-testid="input-total-users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="active-users">Active Users (MAU)</Label>
                    <Input
                      id="active-users"
                      type="number"
                      value={activeUsers}
                      onChange={(e) => setActiveUsers(parseFloat(e.target.value) || 0)}
                      data-testid="input-active-users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-users">New Users This Month</Label>
                    <Input
                      id="new-users"
                      type="number"
                      value={newUsersThisMonth}
                      onChange={(e) => setNewUsersThisMonth(parseFloat(e.target.value) || 0)}
                      data-testid="input-new-users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activation-rate">Activation Rate (%)</Label>
                    <Input
                      id="activation-rate"
                      type="number"
                      value={activationRate}
                      onChange={(e) => setActivationRate(parseFloat(e.target.value) || 0)}
                      data-testid="input-activation-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="churn-rate">Monthly Churn Rate (%)</Label>
                    <Input
                      id="churn-rate"
                      type="number"
                      value={churnRate}
                      onChange={(e) => setChurnRate(parseFloat(e.target.value) || 0)}
                      data-testid="input-churn-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketing-spend">Monthly Marketing Spend (£)</Label>
                    <Input
                      id="marketing-spend"
                      type="number"
                      value={marketingSpend}
                      onChange={(e) => setMarketingSpend(parseFloat(e.target.value) || 0)}
                      data-testid="input-marketing-spend"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversion-rate">Sales Conversion Rate (%)</Label>
                    <Input
                      id="conversion-rate"
                      type="number"
                      value={salesConversionRate}
                      onChange={(e) => setSalesConversionRate(parseFloat(e.target.value) || 0)}
                      data-testid="input-conversion-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deal-size">Avg Deal Size (£)</Label>
                    <Input
                      id="deal-size"
                      type="number"
                      value={avgDealSize}
                      onChange={(e) => setAvgDealSize(parseFloat(e.target.value) || 0)}
                      data-testid="input-deal-size"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Daily, weekly, and monthly active user tracking</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="dau">Daily Active Users</Label>
                    <Input
                      id="dau"
                      type="number"
                      value={dailyActiveUsers}
                      onChange={(e) => setDailyActiveUsers(parseFloat(e.target.value) || 0)}
                      data-testid="input-dau"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wau">Weekly Active Users</Label>
                    <Input
                      id="wau"
                      type="number"
                      value={weeklyActiveUsers}
                      onChange={(e) => setWeeklyActiveUsers(parseFloat(e.target.value) || 0)}
                      data-testid="input-wau"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-duration">Avg Session Duration (min)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      value={avgSessionDuration}
                      onChange={(e) => setAvgSessionDuration(parseFloat(e.target.value) || 0)}
                      data-testid="input-session-duration"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature-adoption">Feature Adoption Rate (%)</Label>
                    <Input
                      id="feature-adoption"
                      type="number"
                      value={featureAdoptionRate}
                      onChange={(e) => setFeatureAdoptionRate(parseFloat(e.target.value) || 0)}
                      data-testid="input-feature-adoption"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>KPI Trends Over Time</CardTitle>
                  <CardDescription>Multi-line chart tracking key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getKPITrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="MRR Growth" stroke="#3b82f6" strokeWidth={2} name="MRR Growth %" />
                      <Line yAxisId="right" type="monotone" dataKey="LTV:CAC Ratio" stroke="#10b981" strokeWidth={2} />
                      <Line yAxisId="left" type="monotone" dataKey="Churn Rate" stroke="#ef4444" strokeWidth={2} name="Churn %" />
                      <Line yAxisId="left" type="monotone" dataKey="Activation Rate" stroke="#8b5cf6" strokeWidth={2} name="Activation %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cohort Retention Analysis</CardTitle>
                  <CardDescription>Customer retention by cohort over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getCohortRetentionChart()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cohort" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="Month 0" fill="#3b82f6" />
                      <Bar dataKey="Month 1" fill="#10b981" />
                      <Bar dataKey="Month 2" fill="#f59e0b" />
                      <Bar dataKey="Month 3" fill="#8b5cf6" />
                      <Bar dataKey="Month 6" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Cohort Analysis:</strong> Track retention rates for customer cohorts over time. Month 6 retention of {(cohortData.reduce((sum, c) => sum + c.month6, 0) / cohortData.length).toFixed(1)}% indicates {cohortData.reduce((sum, c) => sum + c.month6, 0) / cohortData.length >= 70 ? 'strong product-market fit' : 'room for retention improvement'}. Upward trend in newer cohorts shows product improvements working.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Ratios</CardTitle>
                    <CardDescription>Critical business health indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">LTV:CAC Ratio</span>
                      <span className={`text-lg font-bold ${ltvCacRatio >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                        {ltvCacRatio.toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">DAU/MAU Ratio</span>
                      <span className={`text-lg font-bold ${dauMauRatio >= 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {dauMauRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">WAU/MAU Ratio</span>
                      <span className="text-lg font-bold text-primary">
                        {wauMauRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Gross Margin (est.)</span>
                      <span className="text-lg font-bold text-primary">
                        {Math.round((1 - (avgRevenuePerUser * 0.2) / avgRevenuePerUser) * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scalability Indicators</CardTitle>
                    <CardDescription>Metrics for UK visa endorsement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      {ltvCacRatio >= 3 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Profitable Unit Economics</p>
                        <p className="text-sm text-muted-foreground">LTV:CAC {ltvCacRatio >= 3 ? 'exceeds' : 'below'} 3:1 threshold</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {churnRate <= 5 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Sustainable Retention</p>
                        <p className="text-sm text-muted-foreground">Churn rate {churnRate <= 5 ? 'within' : 'exceeds'} 5% target</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {monthlyGrowthRate >= 15 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">High Growth Trajectory</p>
                        <p className="text-sm text-muted-foreground">{monthlyGrowthRate}% monthly growth {monthlyGrowthRate >= 15 ? 'demonstrates' : 'approaching'} scaling potential</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {cohortData[cohortData.length - 1].month6 >= 70 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Product-Market Fit</p>
                        <p className="text-sm text-muted-foreground">M6 retention {cohortData[cohortData.length - 1].month6 >= 70 ? 'validates' : 'improving towards'} PMF</p>
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
                  <CardDescription>AI-powered insights based on your growth metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getSmartTips().map((tip, index) => (
                    <Alert key={index} data-testid={`tip-${index}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{tip}</AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benchmark Guidance</CardTitle>
                  <CardDescription>Industry standards for SaaS growth metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">LTV:CAC Ratio</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>5:1+ = Excellent</li>
                        <li>3:1 = Good (minimum healthy)</li>
                        <li>1:1 = Break-even</li>
                        <li>Less than 1:1 = Unsustainable</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Monthly Churn</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>Less than 3% = Excellent</li>
                        <li>3-5% = Good</li>
                        <li>5-7% = Acceptable</li>
                        <li>Above 7% = High risk</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">CAC Payback</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>6 months or less = Excellent</li>
                        <li>6-12 months = Good</li>
                        <li>12-18 months = Acceptable</li>
                        <li>18+ months = Slow</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">DAU/MAU Ratio</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>50%+ = Very sticky</li>
                        <li>40-50% = Sticky</li>
                        <li>20-40% = Moderate</li>
                        <li>Less than 20% = Low engagement</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to optimize growth metrics and demonstrate scalability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg hover-elevate" data-testid={`action-item-${index}`}>
                        <div className={`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center font-bold text-sm ${
                          item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                          item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                          'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}>
                          {item.week}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                              item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                              'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scalability Evidence Checklist</CardTitle>
                  <CardDescription>Documentation required for UK Innovator Founder visa endorsement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Unit Economics Documentation</p>
                      <p className="text-xs text-muted-foreground">CAC calculation methodology, LTV assumptions, cohort retention curves</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Revenue Growth Evidence</p>
                      <p className="text-xs text-muted-foreground">MRR trend over 6+ months, revenue growth percentage, ARR projections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Customer Retention Analysis</p>
                      <p className="text-xs text-muted-foreground">Cohort retention tables, churn rate trends, customer satisfaction metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Acquisition Channel Breakdown</p>
                      <p className="text-xs text-muted-foreground">CAC by channel, scalable acquisition playbook, marketing efficiency metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Market Expansion Plan</p>
                      <p className="text-xs text-muted-foreground">Total addressable market, geographic expansion strategy, scaling roadmap</p>
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
