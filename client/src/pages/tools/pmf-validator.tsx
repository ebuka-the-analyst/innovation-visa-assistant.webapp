import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown, Target } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "pmf-validator",
  toolName: "PMF Validator",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation strategist. Let's validate your product-market fit using the Sean Ellis test and comprehensive PMF metrics to demonstrate genuine market demand for your visa application.",
  questions: [
    {
      id: "customers",
      question: "How many customers/users do you have and what is your monthly retention rate?",
      hint: "Include total customers, active users, and retention percentages",
      fieldKey: "customerMetrics",
      minLength: 50
    },
    {
      id: "seanEllis",
      question: "What percentage of users would be 'very disappointed' if they could no longer use your product?",
      hint: "40%+ is the threshold for strong PMF. Describe your survey methodology",
      fieldKey: "seanEllisData",
      minLength: 80
    },
    {
      id: "feedback",
      question: "What do customers love most about your product? Include specific testimonials or feedback.",
      hint: "Include direct quotes and specific benefits customers mention",
      fieldKey: "customerFeedback",
      minLength: 100
    },
    {
      id: "nps",
      question: "What is your Net Promoter Score (NPS) and how do you track customer satisfaction?",
      hint: "NPS 50+ is world-class, 30-50 is good, 0-30 needs improvement",
      fieldKey: "npsScore",
      minLength: 60
    },
    {
      id: "growth",
      question: "What is your month-over-month growth rate and referral rate?",
      hint: "Strong PMF typically shows 15-20%+ monthly growth",
      fieldKey: "growthMetrics",
      minLength: 60
    },
    {
      id: "competition",
      question: "What is your competitive advantage and why do customers choose you over alternatives?",
      hint: "Focus on unique value that competitors cannot easily replicate",
      fieldKey: "competitiveAdvantage",
      minLength: 80
    }
  ],
  completionMessage: "Great work! Your product-market fit evidence has been captured. Strong PMF indicators are crucial for endorsement approval."
};

type PMFMetric = {
  month: string;
  nps: number;
  retention: number;
  engagement: number;
  revenue: number;
  referrals: number;
};

type CustomerSegment = {
  id: string;
  name: string;
  size: number;
  veryDisappointed: number;
  retention: number;
  nps: number;
};

export default function PMFValidator() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('pmf-validator-mode') as 'ai' | 'traditional') || 'ai';
  });
  const [activeTab, setActiveTab] = useState('metrics');
  const [savedDate, setSavedDate] = useState('');

  // Core PMF Metrics
  const [nps, setNps] = useState(45);
  const [retentionRate, setRetentionRate] = useState(75);
  const [engagementScore, setEngagementScore] = useState(65);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(15);
  const [referralRate, setReferralRate] = useState(25);
  const [seanEllisScore, setSeanEllisScore] = useState(38);

  // Additional Context
  const [totalCustomers, setTotalCustomers] = useState(250);
  const [activeUsers, setActiveUsers] = useState(180);
  const [monthlyRevenue, setMonthlyRevenue] = useState(12500);
  const [avgRevenuePerUser, setAvgRevenuePerUser] = useState(50);
  const [churnRate, setChurnRate] = useState(8);
  const [timeToValue, setTimeToValue] = useState(7);

  // Customer Segments
  const [segments, setSegments] = useState<CustomerSegment[]>([
    { 
      id: '1', 
      name: 'Early Adopters', 
      size: 100, 
      veryDisappointed: 55, 
      retention: 85, 
      nps: 60 
    }
  ]);

  // Historical Metrics (last 6 months)
  const [metricsHistory, setMetricsHistory] = useState<PMFMetric[]>([
    { month: 'Month 1', nps: 30, retention: 60, engagement: 50, revenue: 8000, referrals: 15 },
    { month: 'Month 2', nps: 35, retention: 65, engagement: 55, revenue: 9000, referrals: 18 },
    { month: 'Month 3', nps: 38, retention: 68, engagement: 58, revenue: 10000, referrals: 20 },
    { month: 'Month 4', nps: 42, retention: 72, engagement: 62, revenue: 11000, referrals: 22 },
    { month: 'Month 5', nps: 44, retention: 74, engagement: 64, revenue: 11500, referrals: 24 },
    { month: 'Month 6', nps: 45, retention: 75, engagement: 65, revenue: 12500, referrals: 25 },
  ]);

  // Qualitative Feedback
  const [customerFeedback, setCustomerFeedback] = useState("Customers appreciate the intuitive interface and time-saving automation. Main pain point addressed is manual data entry. 40% would be 'very disappointed' if product disappeared.");
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState("10x faster onboarding compared to competitors, AI-powered insights unique to market");
  const [productIterations, setProductIterations] = useState(12);

  const addSegment = () => {
    setSegments([...segments, {
      id: Date.now().toString(),
      name: '',
      size: 0,
      veryDisappointed: 0,
      retention: 0,
      nps: 0
    }]);
  };

  const updateSegment = (id: string, field: keyof CustomerSegment, value: any) => {
    setSegments(segments.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
  };

  const calculatePMFScore = () => {
    // Comprehensive PMF scoring algorithm
    let score = 0;
    
    // Sean Ellis Test (30 points) - PRIMARY INDICATOR
    const seanEllisWeight = (seanEllisScore / 40) * 30;
    score += Math.min(30, seanEllisWeight);
    
    // Retention Rate (20 points)
    const retentionWeight = (retentionRate / 80) * 20;
    score += Math.min(20, retentionWeight);
    
    // NPS Score (15 points)
    const npsNormalized = Math.max(0, nps + 100) / 200; // Normalize -100 to 100 => 0 to 1
    score += npsNormalized * 15;
    
    // Engagement (10 points)
    score += (engagementScore / 100) * 10;
    
    // Growth Rate (10 points)
    const growthNormalized = Math.min(monthlyGrowthRate / 20, 1);
    score += growthNormalized * 10;
    
    // Referral Rate (10 points)
    score += (referralRate / 40) * 10;
    
    // Churn Rate penalty (5 points) - lower is better
    const churnPenalty = Math.max(0, (15 - churnRate) / 15) * 5;
    score += churnPenalty;
    
    return Math.min(100, Math.round(score));
  };

  const pmfScore = calculatePMFScore();

  const getPMFGrade = () => {
    if (pmfScore >= 85) return { grade: 'A', label: 'Strong PMF', color: 'text-green-600' };
    if (pmfScore >= 70) return { grade: 'B', label: 'Good PMF', color: 'text-green-500' };
    if (pmfScore >= 55) return { grade: 'C', label: 'Emerging PMF', color: 'text-yellow-600' };
    if (pmfScore >= 40) return { grade: 'D', label: 'Weak PMF', color: 'text-orange-600' };
    return { grade: 'F', label: 'No PMF', color: 'text-red-600' };
  };

  const pmfGrade = getPMFGrade();

  const getRadarData = () => [
    { metric: 'Sean Ellis', score: (seanEllisScore / 40) * 100, target: 100 },
    { metric: 'Retention', score: (retentionRate / 80) * 100, target: 100 },
    { metric: 'NPS', score: ((nps + 100) / 200) * 100, target: 100 },
    { metric: 'Engagement', score: engagementScore, target: 100 },
    { metric: 'Growth', score: (Math.min(monthlyGrowthRate, 20) / 20) * 100, target: 100 },
    { metric: 'Referrals', score: (referralRate / 40) * 100, target: 100 }
  ];

  const getSegmentDistribution = () => {
    return segments
      .filter(s => s.size > 0)
      .map(s => ({
        name: s.name || 'Unnamed Segment',
        value: s.size,
        veryDisappointed: s.veryDisappointed
      }));
  };

  const getNPSDistribution = () => {
    const promoters = Math.round(Math.max(0, nps + 50) * 0.6);
    const passives = Math.round(30);
    const detractors = 100 - promoters - passives;
    
    return [
      { category: 'Promoters (9-10)', count: promoters, color: '#10b981' },
      { category: 'Passives (7-8)', count: passives, color: '#f59e0b' },
      { category: 'Detractors (0-6)', count: detractors, color: '#ef4444' }
    ];
  };

  const getRetentionCohort = () => {
    const months = Array.from({ length: 6 }, (_, i) => i + 1);
    return months.map(month => ({
      month: `M${month}`,
      retention: Math.max(0, retentionRate - (month - 1) * 3.5),
      target: 70,
      churn: Math.min(100, churnRate * month)
    }));
  };

  const getSerializedState = () => {
    return {
      nps,
      retentionRate,
      engagementScore,
      monthlyGrowthRate,
      referralRate,
      seanEllisScore,
      totalCustomers,
      activeUsers,
      monthlyRevenue,
      avgRevenuePerUser,
      churnRate,
      timeToValue,
      segments,
      metricsHistory,
      customerFeedback,
      competitiveAdvantage,
      productIterations,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('nps' in state) setNps(state.nps);
    if ('retentionRate' in state) setRetentionRate(state.retentionRate);
    if ('engagementScore' in state) setEngagementScore(state.engagementScore);
    if ('monthlyGrowthRate' in state) setMonthlyGrowthRate(state.monthlyGrowthRate);
    if ('referralRate' in state) setReferralRate(state.referralRate);
    if ('seanEllisScore' in state) setSeanEllisScore(state.seanEllisScore);
    if ('totalCustomers' in state) setTotalCustomers(state.totalCustomers);
    if ('activeUsers' in state) setActiveUsers(state.activeUsers);
    if ('monthlyRevenue' in state) setMonthlyRevenue(state.monthlyRevenue);
    if ('avgRevenuePerUser' in state) setAvgRevenuePerUser(state.avgRevenuePerUser);
    if ('churnRate' in state) setChurnRate(state.churnRate);
    if ('timeToValue' in state) setTimeToValue(state.timeToValue);
    if ('segments' in state) setSegments(state.segments);
    if ('metricsHistory' in state) setMetricsHistory(state.metricsHistory);
    if ('customerFeedback' in state) setCustomerFeedback(state.customerFeedback);
    if ('competitiveAdvantage' in state) setCompetitiveAdvantage(state.competitiveAdvantage);
    if ('productIterations' in state) setProductIterations(state.productIterations);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('pmf-validator-mode', mode);
  }, [mode]);

  useEffect(() => {
    const saved = localStorage.getItem('pmf-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.customerFeedback) {
      setCustomerFeedback(answers.customerFeedback);
    }
    if (answers.competitiveAdvantage) {
      setCompetitiveAdvantage(answers.competitiveAdvantage);
    }
    if (answers.customerMetrics) {
      const match = answers.customerMetrics.match(/(\d+)\s*customers/i);
      if (match) setTotalCustomers(parseInt(match[1]));
      const retMatch = answers.customerMetrics.match(/(\d+)%?\s*retention/i);
      if (retMatch) setRetentionRate(parseInt(retMatch[1]));
    }
    if (answers.seanEllisData) {
      const match = answers.seanEllisData.match(/(\d+)%/);
      if (match) setSeanEllisScore(parseInt(match[1]));
    }
    if (answers.npsScore) {
      const match = answers.npsScore.match(/NPS\s*(?:is\s*)?(\d+)/i);
      if (match) setNps(parseInt(match[1]));
    }
    if (answers.growthMetrics) {
      const match = answers.growthMetrics.match(/(\d+)%?\s*monthly/i);
      if (match) setMonthlyGrowthRate(parseInt(match[1]));
      const refMatch = answers.growthMetrics.match(/(\d+)%?\s*(?:from\s*)?referrals/i);
      if (refMatch) setReferralRate(parseInt(refMatch[1]));
    }
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('pmf-validator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('pmf-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (seanEllisScore < 40) {
      tips.push("Sean Ellis score below 40% threshold - conduct structured customer surveys to measure how disappointed users would be if product disappeared. This is the PRIMARY PMF indicator.");
    }
    
    if (retentionRate < 70) {
      tips.push("Retention below 70% indicates weak PMF - analyze churn reasons and improve onboarding experience. Target 80%+ retention for strong PMF signal.");
    }
    
    if (nps < 30) {
      tips.push("NPS below 30 suggests customer satisfaction issues - prioritize user feedback and address top pain points to improve product-market fit.");
    }
    
    if (churnRate > 10) {
      tips.push("Monthly churn above 10% is unsustainable - identify early warning signals and implement proactive retention strategies. Strong PMF products maintain <5% churn.");
    }
    
    if (referralRate < 20) {
      tips.push("Low referral rate (<20%) indicates weak viral coefficient - customers aren't enthusiastic enough to recommend. Focus on delivering exceptional value to drive organic growth.");
    }
    
    if (monthlyGrowthRate < 10) {
      tips.push("Growth rate below 10% monthly suggests limited market demand - validate product-market fit before scaling acquisition. Strong PMF drives 15-20%+ monthly growth.");
    }
    
    if (engagementScore < 60) {
      tips.push("Engagement below 60% indicates shallow product usage - implement activation sequences and habit-forming features to increase daily active usage.");
    }
    
    if (timeToValue > 14) {
      tips.push("Time-to-value exceeds 2 weeks - reduce friction in onboarding to help users experience core value faster. Target <7 days for SaaS products.");
    }
    
    if (pmfScore >= 70 && seanEllisScore >= 40) {
      tips.push("Strong PMF validated - focus on scaling acquisition channels and optimizing unit economics. Document customer validation evidence for visa endorsement.");
    }

    if (segments.some(s => s.veryDisappointed < 40)) {
      tips.push("Some customer segments show weak PMF (<40% very disappointed) - consider focusing on high-conviction segments and refining value proposition for others.");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Deploy Sean Ellis PMF survey to all active customers - ask 'How would you feel if you could no longer use this product?' Target 40%+ 'very disappointed' responses",
        priority: "Critical"
      },
      { 
        week: "Week 1", 
        action: "Set up retention cohort tracking - analyze Week 1, Week 4, and Month 3 retention by customer segment to identify drop-off patterns",
        priority: "Critical"
      },
      { 
        week: "Week 1-2", 
        action: "Conduct 10+ customer interviews with high-retention users to understand what makes product indispensable and document specific value delivered",
        priority: "High"
      },
      { 
        week: "Week 2", 
        action: "Implement NPS survey at key touchpoints - gather quantitative satisfaction data and qualitative feedback on product improvements",
        priority: "High"
      },
      { 
        week: "Week 2-3", 
        action: "Analyze churn reasons for last 20 churned customers - categorize issues and prioritize retention initiatives based on impact",
        priority: "Critical"
      },
      { 
        week: "Week 3", 
        action: "Create customer segmentation model - identify which segments show strongest PMF (>40% very disappointed, >80% retention) and focus growth efforts",
        priority: "High"
      },
      { 
        week: "Week 3", 
        action: "Optimize onboarding flow to reduce time-to-value - implement activation checklists and in-app guidance to reach 'aha moment' faster",
        priority: "Medium"
      },
      { 
        week: "Week 3-4", 
        action: "Build referral tracking system - measure viral coefficient and identify power users who drive word-of-mouth growth",
        priority: "Medium"
      },
      { 
        week: "Week 4", 
        action: "Document PMF evidence for endorsement: survey results, retention cohorts, customer testimonials, usage analytics showing engagement depth",
        priority: "Critical"
      },
      { 
        week: "Week 4", 
        action: "Create PMF dashboard tracking Sean Ellis score, retention, NPS, engagement, and growth - establish baseline and monitor trends monthly",
        priority: "High"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - PRODUCT-MARKET FIT VALIDATION
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Product-Market Fit Score: ${pmfScore}% (Grade: ${pmfGrade.grade} - ${pmfGrade.label})

${pmfScore >= 70 ? 'STRONG PMF VALIDATED - Customer validation demonstrates innovation and market viability for UK Innovator Founder visa endorsement' : pmfScore >= 55 ? 'EMERGING PMF - Viable foundation but strengthen validation before endorsement application' : 'WEAK PMF - Significant validation work needed before visa application'}

CORE PMF METRICS
${'-'.repeat(80)}
Sean Ellis Test Score: ${seanEllisScore}% (Target: 40%+)
${seanEllisScore >= 40 ? 'PASS - Primary PMF indicator met' : 'FAIL - Below 40% threshold, not enough customers would be very disappointed'}
Benchmark: 40%+ "very disappointed" = strong PMF

Customer Retention Rate: ${retentionRate}%
${retentionRate >= 80 ? 'EXCELLENT - Strong product stickiness' : retentionRate >= 70 ? 'GOOD - Healthy retention' : retentionRate >= 60 ? 'MODERATE - Address churn drivers' : 'WEAK - Critical retention issues'}
Benchmark: SaaS 80%+ = excellent, 70-80% = good, <70% = concerns

Net Promoter Score (NPS): ${nps}
${nps >= 50 ? 'WORLD-CLASS - Exceptional customer satisfaction' : nps >= 30 ? 'GOOD - Positive customer sentiment' : nps >= 0 ? 'MODERATE - Room for improvement' : 'POOR - Critical satisfaction issues'}
Benchmark: 50+ = world-class, 30-50 = good, 0-30 = needs improvement

Engagement Score: ${engagementScore}%
${engagementScore >= 70 ? 'HIGH - Deep product usage' : engagementScore >= 60 ? 'MODERATE - Regular usage' : 'LOW - Shallow engagement'}

Monthly Growth Rate: ${monthlyGrowthRate}%
${monthlyGrowthRate >= 15 ? 'STRONG - Rapid expansion' : monthlyGrowthRate >= 10 ? 'HEALTHY - Steady growth' : 'SLOW - Limited market demand'}

Referral/Viral Rate: ${referralRate}%
${referralRate >= 40 ? 'VIRAL - Strong word-of-mouth' : referralRate >= 25 ? 'HEALTHY - Organic referrals' : 'LIMITED - Weak viral coefficient'}

Monthly Churn Rate: ${churnRate}%
${churnRate <= 5 ? 'EXCELLENT - Sustainable retention' : churnRate <= 10 ? 'ACCEPTABLE - Monitor closely' : 'HIGH - Unsustainable churn'}

BUSINESS METRICS
${'-'.repeat(80)}
Total Customers: ${totalCustomers.toLocaleString()}
Active Users: ${activeUsers.toLocaleString()} (${Math.round((activeUsers/totalCustomers)*100)}% activation)
Monthly Recurring Revenue: £${monthlyRevenue.toLocaleString()}
Average Revenue Per User: £${avgRevenuePerUser.toLocaleString()}
Time to Value: ${timeToValue} days

PMF SCORE CALCULATION
${'-'.repeat(80)}
Formula: Weighted average of 6 core PMF dimensions

Component Breakdown:
  Sean Ellis Test (30% weight): ${Math.min(30, (seanEllisScore / 40) * 30).toFixed(1)}/30 points
  Retention Rate (20% weight): ${Math.min(20, (retentionRate / 80) * 20).toFixed(1)}/20 points
  NPS Score (15% weight): ${(((nps + 100) / 200) * 15).toFixed(1)}/15 points
  Engagement (10% weight): ${((engagementScore / 100) * 10).toFixed(1)}/10 points
  Growth Rate (10% weight): ${((Math.min(monthlyGrowthRate, 20) / 20) * 10).toFixed(1)}/10 points
  Referral Rate (10% weight): ${((referralRate / 40) * 10).toFixed(1)}/10 points
  Churn Penalty (5% weight): ${(Math.max(0, (15 - churnRate) / 15) * 5).toFixed(1)}/5 points

Total PMF Score: ${pmfScore}/100 (${pmfGrade.grade} - ${pmfGrade.label})

CUSTOMER SEGMENTS ANALYSIS
${'-'.repeat(80)}
${segments.map((seg, i) => `
${i + 1}. ${seg.name || 'Unnamed Segment'}
   Segment Size: ${seg.size} customers
   "Very Disappointed" Score: ${seg.veryDisappointed}%
   Retention Rate: ${seg.retention}%
   NPS: ${seg.nps}
   PMF Status: ${seg.veryDisappointed >= 40 && seg.retention >= 70 ? 'STRONG PMF' : seg.veryDisappointed >= 30 ? 'EMERGING PMF' : 'WEAK PMF'}
`).join('')}

QUALITATIVE VALIDATION
${'-'.repeat(80)}
Customer Feedback:
${customerFeedback}

Competitive Advantage:
${competitiveAdvantage}

Product Iterations: ${productIterations} major releases

METRICS TREND (Last 6 Months)
${'-'.repeat(80)}
${metricsHistory.map((m, i) => `${m.month}: NPS ${m.nps}, Retention ${m.retention}%, Engagement ${m.engagement}%, Revenue £${m.revenue.toLocaleString()}, Referrals ${m.referrals}%`).join('\n')}

Growth Trajectory: ${metricsHistory[5].revenue > metricsHistory[0].revenue ? 'POSITIVE' : 'FLAT/DECLINING'}
Revenue Growth: ${Math.round(((metricsHistory[5].revenue - metricsHistory[0].revenue) / metricsHistory[0].revenue) * 100)}%

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(80)}
GOV.UK Assessment Factors:
• Customer validation demonstrates genuine market need (Innovation Criterion)
• Strong retention proves sustainable business model (Viability Criterion)
• Product iterations show continuous innovation
• Revenue growth validates commercial viability
• Customer segments provide scalability evidence

CURRENT VALIDATION STATUS:

Sean Ellis PMF Test: ${seanEllisScore}%
${seanEllisScore >= 40 ? 'PASS - Meets 40% threshold for strong product-market fit. Primary PMF indicator validated.' : 'FAIL - Below 40% threshold. Insufficient customers would be very disappointed if product disappeared. Conduct customer surveys to strengthen validation.'}

Customer Retention: ${retentionRate}%
${retentionRate >= 70 ? 'STRONG - High retention validates sustainable customer base and viable business model for visa assessment' : 'MODERATE - Retention needs improvement to demonstrate viability. Target 80%+ for strongest endorsement case.'}

Net Promoter Score: ${nps}
${nps >= 30 ? 'POSITIVE - Customer satisfaction supports innovation and viability criteria' : 'NEEDS IMPROVEMENT - Address customer satisfaction issues before endorsement application'}

Overall PMF Score: ${pmfScore}%
${pmfScore >= 70 ? `STRONG VALIDATION - PMF score of ${pmfScore}% with ${seanEllisScore}% Sean Ellis score and ${retentionRate}% retention demonstrates clear product-market fit. Customer validation evidence supports both Innovation and Viability criteria for UK Innovator Founder visa.` : pmfScore >= 55 ? `EMERGING PMF - Score of ${pmfScore}% shows viable foundation but strengthen Sean Ellis score (target 40%+) and retention (target 80%+) before endorsement application.` : `INSUFFICIENT PMF - Score of ${pmfScore}% indicates validation gaps. Conduct customer research, improve retention, and validate problem-solution fit before visa application.`}

ENDORSEMENT READINESS:
${pmfScore >= 70 && seanEllisScore >= 40 && retentionRate >= 70 ? 'READY - Strong PMF validation ready for endorsement application' : pmfScore >= 55 ? 'NEARLY READY - Strengthen key metrics before application' : 'NOT READY - Significant validation work required'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

PMF VALIDATION METHODOLOGY
${'-'.repeat(80)}
Sean Ellis Test: Survey asking "How would you feel if you could no longer use this product?"
- Very disappointed
- Somewhat disappointed
- Not disappointed
- N/A - no longer using product

Target: 40%+ responding "very disappointed" = strong PMF

Retention Cohorts: Track percentage of users still active after 1, 4, 12 weeks
Target: 80%+ retention at Month 3 = strong PMF

NPS Survey: "On scale 0-10, how likely are you to recommend this product?"
- Promoters (9-10): Enthusiastic advocates
- Passives (7-8): Satisfied but unenthusiastic
- Detractors (0-6): Unhappy customers
NPS = % Promoters - % Detractors

Engagement: Measure DAU/MAU, feature adoption, session frequency
Target: 60%+ DAU/MAU = strong engagement

SOURCES & REFERENCES
${'-'.repeat(80)}
GOV.UK Innovator Founder Visa Guidance (November 2025)
https://www.gov.uk/innovator-founder-visa
Immigration Rules Appendix Innovator Founder

Innovation Criterion: Customer validation and market need evidence
Viability Criterion: Sustainable customer base, retention, revenue growth

PMF Methodology:
- Sean Ellis Test (40% threshold): Superhuman, Rahul Vohra
- Retention Benchmarks: SaaS industry standards (80%+ excellent)
- NPS Benchmarks: Bain & Company, Fred Reichheld
- Product-Market Fit Framework: Marc Andreessen, Ben Horowitz

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmf-validator-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-pmf-validator">Product-Market Fit Validator</h1>
              <p className="text-lg text-muted-foreground">Measure customer validation with Sean Ellis test and PMF metrics</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          <ToolUtilityBar
            toolId="pmf-validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Product-Market Fit Validator"
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
            <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-pmf-validator">
              <TabsTrigger value="metrics" data-testid="tab-metrics">Core Metrics</TabsTrigger>
              <TabsTrigger value="segments" data-testid="tab-segments">Segments</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PMF Score Dashboard</CardTitle>
                  <CardDescription>Overall product-market fit assessment based on 6 key dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={pmfScore >= 70 ? "border-green-500" : pmfScore >= 55 ? "border-yellow-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">PMF Score</p>
                          <p className={`text-4xl font-bold ${pmfGrade.color}`} data-testid="text-pmf-score">{pmfScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {pmfScore >= 70 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : pmfScore >= 55 ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="text-sm font-medium">{pmfGrade.grade} - {pmfGrade.label}</span>
                          </div>
                          <Progress value={pmfScore} className="mt-3" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={seanEllisScore >= 40 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Sean Ellis Test</p>
                          <p className="text-3xl font-bold" data-testid="text-sean-ellis">{seanEllisScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {seanEllisScore >= 40 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{seanEllisScore >= 40 ? 'Strong PMF' : 'Below 40% Threshold'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={retentionRate >= 70 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Retention Rate</p>
                          <p className="text-3xl font-bold" data-testid="text-retention">{retentionRate}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {retentionRate >= 80 ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : retentionRate >= 70 ? (
                              <Target className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{retentionRate >= 80 ? 'Excellent' : retentionRate >= 70 ? 'Good' : 'Needs Work'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {pmfScore < 55 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription data-testid="alert-weak-pmf">
                        PMF score below 55% indicates insufficient product-market fit. Strengthen Sean Ellis score (target 40%+) and retention (target 70%+) before visa application.
                      </AlertDescription>
                    </Alert>
                  )}

                  {pmfScore >= 55 && pmfScore < 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription data-testid="alert-emerging-pmf">
                        Emerging PMF detected. Continue improving retention and customer satisfaction to reach 70%+ for strong endorsement case.
                      </AlertDescription>
                    </Alert>
                  )}

                  {pmfScore >= 70 && seanEllisScore >= 40 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400" data-testid="alert-strong-pmf">
                        Strong product-market fit validated! PMF score {pmfScore}% with {seanEllisScore}% Sean Ellis score demonstrates clear customer validation for visa endorsement.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="sean-ellis" className="font-semibold">Sean Ellis Test: Very Disappointed %</Label>
                          <span className="text-sm font-medium" data-testid="text-sean-ellis-value">{seanEllisScore}%</span>
                        </div>
                        <Slider
                          id="sean-ellis"
                          value={[seanEllisScore]}
                          onValueChange={([value]) => setSeanEllisScore(value)}
                          max={100}
                          step={1}
                          className="mb-1"
                          data-testid="slider-sean-ellis"
                        />
                        <p className="text-xs text-muted-foreground">Target: 40%+ = Strong PMF</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="retention" className="font-semibold">Customer Retention Rate</Label>
                          <span className="text-sm font-medium" data-testid="text-retention-value">{retentionRate}%</span>
                        </div>
                        <Slider
                          id="retention"
                          value={[retentionRate]}
                          onValueChange={([value]) => setRetentionRate(value)}
                          max={100}
                          step={1}
                          className="mb-1"
                          data-testid="slider-retention"
                        />
                        <p className="text-xs text-muted-foreground">Target: 80%+ = Excellent</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="nps" className="font-semibold">Net Promoter Score (NPS)</Label>
                          <span className="text-sm font-medium" data-testid="text-nps-value">{nps}</span>
                        </div>
                        <Slider
                          id="nps"
                          value={[nps]}
                          onValueChange={([value]) => setNps(value)}
                          min={-100}
                          max={100}
                          step={1}
                          className="mb-1"
                          data-testid="slider-nps"
                        />
                        <p className="text-xs text-muted-foreground">Target: 50+ = World-class</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="engagement" className="font-semibold">Engagement Score (DAU/MAU)</Label>
                          <span className="text-sm font-medium" data-testid="text-engagement-value">{engagementScore}%</span>
                        </div>
                        <Slider
                          id="engagement"
                          value={[engagementScore]}
                          onValueChange={([value]) => setEngagementScore(value)}
                          max={100}
                          step={1}
                          className="mb-1"
                          data-testid="slider-engagement"
                        />
                        <p className="text-xs text-muted-foreground">Target: 60%+ = Strong engagement</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="growth" className="font-semibold">Monthly Growth Rate</Label>
                          <span className="text-sm font-medium" data-testid="text-growth-value">{monthlyGrowthRate}%</span>
                        </div>
                        <Slider
                          id="growth"
                          value={[monthlyGrowthRate]}
                          onValueChange={([value]) => setMonthlyGrowthRate(value)}
                          max={50}
                          step={1}
                          className="mb-1"
                          data-testid="slider-growth"
                        />
                        <p className="text-xs text-muted-foreground">Target: 15%+ = Strong growth</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="referral" className="font-semibold">Referral Rate</Label>
                          <span className="text-sm font-medium" data-testid="text-referral-value">{referralRate}%</span>
                        </div>
                        <Slider
                          id="referral"
                          value={[referralRate]}
                          onValueChange={([value]) => setReferralRate(value)}
                          max={100}
                          step={1}
                          className="mb-1"
                          data-testid="slider-referral"
                        />
                        <p className="text-xs text-muted-foreground">Target: 25%+ = Healthy viral growth</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="total-customers">Total Customers</Label>
                          <Input
                            id="total-customers"
                            type="number"
                            value={totalCustomers}
                            onChange={(e) => setTotalCustomers(parseInt(e.target.value) || 0)}
                            data-testid="input-total-customers"
                          />
                        </div>
                        <div>
                          <Label htmlFor="active-users">Active Users</Label>
                          <Input
                            id="active-users"
                            type="number"
                            value={activeUsers}
                            onChange={(e) => setActiveUsers(parseInt(e.target.value) || 0)}
                            data-testid="input-active-users"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="monthly-revenue">Monthly Revenue (£)</Label>
                          <Input
                            id="monthly-revenue"
                            type="number"
                            value={monthlyRevenue}
                            onChange={(e) => setMonthlyRevenue(parseInt(e.target.value) || 0)}
                            data-testid="input-monthly-revenue"
                          />
                        </div>
                        <div>
                          <Label htmlFor="arpu">Avg Revenue Per User (£)</Label>
                          <Input
                            id="arpu"
                            type="number"
                            value={avgRevenuePerUser}
                            onChange={(e) => setAvgRevenuePerUser(parseInt(e.target.value) || 0)}
                            data-testid="input-arpu"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="churn">Monthly Churn Rate (%)</Label>
                          <Input
                            id="churn"
                            type="number"
                            value={churnRate}
                            onChange={(e) => setChurnRate(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            data-testid="input-churn"
                          />
                        </div>
                        <div>
                          <Label htmlFor="time-to-value">Time to Value (days)</Label>
                          <Input
                            id="time-to-value"
                            type="number"
                            value={timeToValue}
                            onChange={(e) => setTimeToValue(parseInt(e.target.value) || 0)}
                            data-testid="input-time-to-value"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="iterations">Product Iterations</Label>
                        <Input
                          id="iterations"
                          type="number"
                          value={productIterations}
                          onChange={(e) => setProductIterations(parseInt(e.target.value) || 0)}
                          data-testid="input-iterations"
                        />
                      </div>

                      <div>
                        <Label htmlFor="feedback">Customer Feedback Summary</Label>
                        <Textarea
                          id="feedback"
                          value={customerFeedback}
                          onChange={(e) => setCustomerFeedback(e.target.value)}
                          rows={3}
                          placeholder="Summarize key customer feedback and pain points addressed"
                          data-testid="textarea-feedback"
                        />
                      </div>

                      <div>
                        <Label htmlFor="advantage">Competitive Advantage</Label>
                        <Textarea
                          id="advantage"
                          value={competitiveAdvantage}
                          onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                          rows={2}
                          placeholder="What makes your product uniquely valuable vs competitors?"
                          data-testid="textarea-advantage"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="segments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments Analysis</CardTitle>
                  <CardDescription>Measure PMF by customer cohort - identify high-conviction segments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Track different customer segments to identify where PMF is strongest</p>
                    <Button onClick={addSegment} size="sm" data-testid="button-add-segment">
                      Add Segment
                    </Button>
                  </div>

                  {segments.map((segment) => (
                    <Card key={segment.id} className="p-4">
                      <div className="grid md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`segment-name-${segment.id}`}>Segment Name</Label>
                          <Input
                            id={`segment-name-${segment.id}`}
                            value={segment.name}
                            onChange={(e) => updateSegment(segment.id, 'name', e.target.value)}
                            placeholder="e.g., Early Adopters, Enterprise"
                            data-testid={`input-segment-name-${segment.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment-size-${segment.id}`}>Size</Label>
                          <Input
                            id={`segment-size-${segment.id}`}
                            type="number"
                            value={segment.size}
                            onChange={(e) => updateSegment(segment.id, 'size', parseInt(e.target.value) || 0)}
                            data-testid={`input-segment-size-${segment.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment-disappointed-${segment.id}`}>Very Disappointed %</Label>
                          <Input
                            id={`segment-disappointed-${segment.id}`}
                            type="number"
                            value={segment.veryDisappointed}
                            onChange={(e) => updateSegment(segment.id, 'veryDisappointed', parseInt(e.target.value) || 0)}
                            data-testid={`input-segment-disappointed-${segment.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment-retention-${segment.id}`}>Retention %</Label>
                          <Input
                            id={`segment-retention-${segment.id}`}
                            type="number"
                            value={segment.retention}
                            onChange={(e) => updateSegment(segment.id, 'retention', parseInt(e.target.value) || 0)}
                            data-testid={`input-segment-retention-${segment.id}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`segment-nps-${segment.id}`}>NPS</Label>
                            <Input
                              id={`segment-nps-${segment.id}`}
                              type="number"
                              value={segment.nps}
                              onChange={(e) => updateSegment(segment.id, 'nps', parseInt(e.target.value) || 0)}
                              data-testid={`input-segment-nps-${segment.id}`}
                            />
                          </div>
                          {segments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSegment(segment.id)}
                              className="mt-auto"
                              data-testid={`button-remove-segment-${segment.id}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className={segment.veryDisappointed >= 40 && segment.retention >= 70 ? 'text-green-600 font-medium' : segment.veryDisappointed >= 30 ? 'text-yellow-600' : 'text-muted-foreground'}>
                          {segment.veryDisappointed >= 40 && segment.retention >= 70 ? 'Strong PMF in this segment' : segment.veryDisappointed >= 30 ? 'Emerging PMF' : 'Weak PMF - consider refinement'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>PMF Dimensions Radar</CardTitle>
                    <CardDescription>6-factor product-market fit assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Current Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Metrics Trend (6 Months)</CardTitle>
                    <CardDescription>PMF evolution over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={metricsHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="nps" stroke="#3b82f6" name="NPS" />
                        <Line type="monotone" dataKey="retention" stroke="#10b981" name="Retention %" />
                        <Line type="monotone" dataKey="engagement" stroke="#f59e0b" name="Engagement %" />
                        <Line type="monotone" dataKey="referrals" stroke="#8b5cf6" name="Referrals %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>NPS Distribution</CardTitle>
                    <CardDescription>Customer satisfaction breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getNPSDistribution()}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.category}: ${entry.count}%`}
                        >
                          {getNPSDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Retention Cohort</CardTitle>
                    <CardDescription>Customer retention by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getRetentionCohort()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="retention" stroke="#10b981" name="Retention %" strokeWidth={2} />
                        <Line type="monotone" dataKey="target" stroke="#94a3b8" name="Target 70%" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {getSegmentDistribution().length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Customer Segments Distribution</CardTitle>
                      <CardDescription>Segment size and PMF strength</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getSegmentDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Customers" />
                          <Bar yAxisId="right" dataKey="veryDisappointed" fill="#10b981" name="Very Disappointed %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sean Ellis PMF Test</CardTitle>
                  <CardDescription>The gold standard for measuring product-market fit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className={seanEllisScore >= 40 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500"}>
                      <Target className="h-4 w-4" />
                      <AlertDescription className={seanEllisScore >= 40 ? "text-green-600 dark:text-green-400" : ""}>
                        <strong>Survey Question:</strong> "How would you feel if you could no longer use this product?"
                        <br />
                        <strong>Target:</strong> 40%+ responding "Very disappointed" indicates strong product-market fit
                        <br />
                        <strong>Your Score:</strong> {seanEllisScore}% {seanEllisScore >= 40 ? '(PASS - Strong PMF)' : '(BELOW THRESHOLD - Strengthen validation)'}
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-1">Very disappointed</p>
                        <p className="text-2xl font-bold text-green-600">{seanEllisScore}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Strong PMF signal</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-1">Somewhat disappointed</p>
                        <p className="text-2xl font-bold text-yellow-600">{Math.round((100 - seanEllisScore) * 0.4)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Moderate interest</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-1">Not disappointed</p>
                        <p className="text-2xl font-bold text-orange-600">{Math.round((100 - seanEllisScore) * 0.4)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Weak fit</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-1">N/A - no longer use</p>
                        <p className="text-2xl font-bold text-muted-foreground">{Math.round((100 - seanEllisScore) * 0.2)}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Churned users</p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium mb-2">Methodology</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Survey all active users with the question above</li>
                        <li>Calculate percentage who answer "Very disappointed"</li>
                        <li>40%+ indicates you have achieved product-market fit</li>
                        <li>Focus growth efforts on segments where PMF is strongest</li>
                        <li>For visa endorsement: document survey methodology and results</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly recurring revenue growth trajectory</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metricsHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Monthly Revenue (£)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Current MRR</p>
                      <p className="text-xl font-bold">£{monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">6-Month Growth</p>
                      <p className="text-xl font-bold text-green-600">
                        {Math.round(((metricsHistory[5].revenue - metricsHistory[0].revenue) / metricsHistory[0].revenue) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ARPU</p>
                      <p className="text-xl font-bold">£{avgRevenuePerUser}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights based on your PMF metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PMF Benchmarks</CardTitle>
                  <CardDescription>Industry standards for product-market fit indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Sean Ellis Test: 40%+ Very Disappointed</p>
                        <p className="text-sm text-muted-foreground">Gold standard PMF indicator. Superhuman achieved 58%, indicating exceptional PMF.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Retention: 80%+ at Month 3</p>
                        <p className="text-sm text-muted-foreground">SaaS benchmark. World-class products retain 85%+ of cohort after 90 days.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">NPS: 50+ World-Class, 30-50 Good</p>
                        <p className="text-sm text-muted-foreground">Net Promoter Score benchmarks: Apple 72, Tesla 97, Netflix 68</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Engagement (DAU/MAU): 60%+</p>
                        <p className="text-sm text-muted-foreground">Strong engagement indicates habit formation. Facebook 65%, WhatsApp 80%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Monthly Churn: Under 5%</p>
                        <p className="text-sm text-muted-foreground">SaaS churn benchmarks: 3-5% = good, 5-7% = acceptable, 7%+ = concerning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Referral Rate: 25%+</p>
                        <p className="text-sm text-muted-foreground">Indicates organic growth potential. Dropbox achieved 35% through referral program.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week PMF Validation Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to strengthen product-market fit evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`action-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsement Documentation Checklist</CardTitle>
                  <CardDescription>Evidence to compile for UK Innovator Founder visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Sean Ellis survey results with methodology, sample size, and response distribution</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Retention cohort analysis showing Week 1, Week 4, Month 3 retention by segment</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">NPS survey results with promoter/passive/detractor breakdown and qualitative feedback</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Customer testimonials and case studies demonstrating value delivered</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Usage analytics showing engagement metrics (DAU/MAU, session frequency, feature adoption)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Revenue growth trajectory with month-over-month trends and customer acquisition metrics</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Customer segment analysis identifying high-conviction cohorts with strongest PMF</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">Product iteration log showing how customer feedback influenced development roadmap</p>
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
