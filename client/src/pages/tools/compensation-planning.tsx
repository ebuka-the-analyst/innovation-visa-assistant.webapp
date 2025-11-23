import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Plus, X, TrendingUp, AlertCircle, Briefcase, DollarSign, Award, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// UK Innovator Founder Visa Context (November 2025)
// Scalability Criterion: Job creation potential is KEY to endorsement
// Viability Criterion: Realistic team costs and budget planning
// Settlement (ILR): Creating 5 jobs at £25k+ OR 10 jobs at any salary = achievement criterion

interface TeamRole {
  id: string;
  role: string;
  level: string; // Junior, Mid, Senior, Lead
  minSalary: number;
  maxSalary: number;
  equity: number; // %
  bonusTarget: number; // %
  hiringMonth: number; // Month 1-36 (3-year visa period)
  isFullTime: boolean;
  costPerHire: number; // Recruitment costs
}

export default function CompensationPlanning() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [fundingAvailable, setFundingAvailable] = useState(150000); // £ available for team building
  const [roles, setRoles] = useState<TeamRole[]>([
    { id: "1", role: "Lead Engineer", level: "Senior", minSalary: 70000, maxSalary: 90000, equity: 0.5, bonusTarget: 10, hiringMonth: 1, isFullTime: true, costPerHire: 8000 },
    { id: "2", role: "Product Designer", level: "Mid", minSalary: 55000, maxSalary: 70000, equity: 0.3, bonusTarget: 8, hiringMonth: 3, isFullTime: true, costPerHire: 6000 }
  ]);

  const saveProgress = () => {
    localStorage.setItem('compensationPlanningFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('compensationPlanningData', JSON.stringify({ fundingAvailable, roles }));
    localStorage.setItem('compensationPlanningDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const addRole = () => {
    setRoles([...roles, { 
      id: Date.now().toString(), 
      role: "New Role", 
      level: "Mid", 
      minSalary: 50000, 
      maxSalary: 65000, 
      equity: 0.2, 
      bonusTarget: 10,
      hiringMonth: 6,
      isFullTime: true,
      costPerHire: 5000
    }]);
  };

  const removeRole = (id: string) => setRoles(roles.filter(r => r.id !== id));

  const updateRole = (id: string, field: string, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // PhD-Level: Scalability Score (Job Creation for Innovator Founder Visa)
  // Formula: Based on GOV.UK ILR achievement criteria
  // - 5 full-time jobs at £25k+ = ILR criterion met
  // - 10 full-time jobs at any salary = ILR criterion met
  const getScalabilityScore = (): { score: number; jobsCreated: number; meetsILRCriterion: boolean; criterionMet: string } => {
    const fullTimeRoles = roles.filter(r => r.isFullTime);
    const jobsCreated = fullTimeRoles.length;
    const jobsAbove25k = fullTimeRoles.filter(r => r.minSalary >= 25000).length;
    
    let score = 0;
    let criterionMet = "Not yet";
    let meetsILRCriterion = false;
    
    // Scoring based on job creation milestones
    if (jobsAbove25k >= 5) {
      score = 100;
      criterionMet = "5 jobs at £25k+ (ILR ready)";
      meetsILRCriterion = true;
    } else if (jobsCreated >= 10) {
      score = 100;
      criterionMet = "10 jobs at any salary (ILR ready)";
      meetsILRCriterion = true;
    } else if (jobsAbove25k >= 3) {
      score = 70;
      criterionMet = `${jobsAbove25k}/5 jobs (Strong)`;
    } else if (jobsCreated >= 3) {
      score = 50;
      criterionMet = `${jobsCreated} jobs (Growing)`;
    } else {
      score = Math.min(30, jobsCreated * 15);
      criterionMet = `${jobsCreated} jobs (Early stage)`;
    }
    
    return { score, jobsCreated, meetsILRCriterion, criterionMet };
  };

  // PhD-Level: Team Budget Viability Analysis
  // Formula: Total 36-month team costs vs available funding
  // Includes: salaries, recruitment costs, employer NI (13.8%), pension (3%)
  const getTeamBudgetAnalysis = (): { totalCost36Mo: number; monthlyBurnRate: number; fundingGap: number; viabilityScore: number } => {
    let totalCost36Mo = 0;
    
    roles.forEach(role => {
      const avgSalary = (role.minSalary + role.maxSalary) / 2;
      const monthsEmployed = 36 - role.hiringMonth + 1; // Months until end of 3-year visa
      const bonus = avgSalary * (role.bonusTarget / 100);
      const employerNI = avgSalary * 0.138; // UK Employer National Insurance 13.8%
      const pension = avgSalary * 0.03; // 3% pension contribution
      
      const annualCost = avgSalary + bonus + employerNI + pension;
      const roleTotal = (annualCost / 12) * monthsEmployed + role.costPerHire;
      
      totalCost36Mo += roleTotal;
    });
    
    const monthlyBurnRate = totalCost36Mo / 36;
    const fundingGap = totalCost36Mo - fundingAvailable;
    
    // Viability score: Can you afford this team?
    let viabilityScore = 0;
    if (fundingGap <= 0) {
      viabilityScore = 100; // Fully funded
    } else if (fundingGap < fundingAvailable * 0.2) {
      viabilityScore = 85; // Minor gap (manageable)
    } else if (fundingGap < fundingAvailable * 0.5) {
      viabilityScore = 60; // Moderate gap (needs attention)
    } else {
      viabilityScore = 30; // Significant gap (critical)
    }
    
    return { totalCost36Mo, monthlyBurnRate, fundingGap, viabilityScore };
  };

  // PhD-Level: Total Compensation Calculator
  // Formula: Base + Bonus + Equity Value (4-year vesting, startup valuation assumptions)
  const getTotalCompensation = (role: TeamRole): number => {
    const baseSalary = (role.minSalary + role.maxSalary) / 2;
    const bonus = baseSalary * (role.bonusTarget / 100);
    // Equity valuation: Assume £500k startup valuation, 4-year vesting
    const equityValue = (500000 * (role.equity / 100)) / 4; // Annual equity value
    return baseSalary + bonus + equityValue;
  };

  // PhD-Level: Recruitment ROI Analysis
  const getRecruitmentAnalysis = (): { totalRecruitmentCost: number; avgCostPerHire: number; costAsPercentOfSalary: number } => {
    const totalRecruitmentCost = roles.reduce((sum, r) => sum + r.costPerHire, 0);
    const avgCostPerHire = roles.length > 0 ? totalRecruitmentCost / roles.length : 0;
    const totalAnnualSalaries = roles.reduce((sum, r) => sum + (r.minSalary + r.maxSalary) / 2, 0);
    const costAsPercentOfSalary = totalAnnualSalaries > 0 ? (totalRecruitmentCost / totalAnnualSalaries) * 100 : 0;
    
    return { totalRecruitmentCost, avgCostPerHire, costAsPercentOfSalary };
  };

  const exportPlan = () => {
    const { score: scalabilityScore, jobsCreated, meetsILRCriterion, criterionMet } = getScalabilityScore();
    const { totalCost36Mo, monthlyBurnRate, fundingGap, viabilityScore } = getTeamBudgetAnalysis();
    const { totalRecruitmentCost, avgCostPerHire } = getRecruitmentAnalysis();
    
    const content = `UK INNOVATOR FOUNDER VISA - TEAM COMPENSATION PLAN
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY (Innovator Founder Visa Context)
═══════════════════════════════════════════════════════════
Total Team Roles: ${roles.length}
Full-Time Jobs Created: ${jobsCreated}
Scalability Score: ${scalabilityScore}%
ILR Job Creation Criterion: ${meetsILRCriterion ? '✓ MET' : '✗ NOT YET MET'}
Status: ${criterionMet}

36-Month Team Budget: £${totalCost36Mo.toLocaleString()}
Available Funding: £${fundingAvailable.toLocaleString()}
Funding Gap: £${fundingGap.toLocaleString()} ${fundingGap > 0 ? '⚠ SHORTFALL' : '✓ SURPLUS'}
Budget Viability Score: ${viabilityScore}%
Monthly Burn Rate: £${Math.round(monthlyBurnRate).toLocaleString()}

Total Recruitment Cost: £${totalRecruitmentCost.toLocaleString()}
Avg Cost Per Hire: £${Math.round(avgCostPerHire).toLocaleString()}

═══════════════════════════════════════════════════════════
UK INNOVATOR FOUNDER VISA: SCALABILITY CRITERION
═══════════════════════════════════════════════════════════
GOV.UK ILR Achievement Criteria (Choose 2 of 7):
• Create 5 full-time jobs at £25,000+ salary
• Create 10 full-time jobs at any salary
• £50,000 actively invested in business
• £1 million annual revenue
• Significant IP development
• Participation in recognized accelerators

CURRENT STATUS:
Full-time jobs: ${jobsCreated}
Jobs at £25k+: ${roles.filter(r => r.isFullTime && r.minSalary >= 25000).length}
${meetsILRCriterion ? '✓ JOB CREATION CRITERION MET - Ready for ILR in 3 years' : `⚠ Need ${Math.max(0, 5 - roles.filter(r => r.isFullTime && r.minSalary >= 25000).length)} more jobs at £25k+ OR ${Math.max(0, 10 - jobsCreated)} more jobs total`}

${roles.map((r, idx) => {
  const avgSalary = (r.minSalary + r.maxSalary) / 2;
  const totalComp = getTotalCompensation(r);
  const monthsEmployed = 36 - r.hiringMonth + 1;
  const annualCost = avgSalary + (avgSalary * (r.bonusTarget / 100)) + (avgSalary * 0.138) + (avgSalary * 0.03);
  const totalCost = (annualCost / 12) * monthsEmployed + r.costPerHire;
  
  return `
═══════════════════════════════════════════════════════════
ROLE ${idx + 1}: ${r.role}
═══════════════════════════════════════════════════════════
Level: ${r.level}
Employment Type: ${r.isFullTime ? 'Full-Time' : 'Part-Time'}
Hiring Timeline: Month ${r.hiringMonth} of 36-month visa period

COMPENSATION PACKAGE:
Salary Range: £${r.minSalary.toLocaleString()} - £${r.maxSalary.toLocaleString()}
Midpoint: £${avgSalary.toLocaleString()}
Equity: ${r.equity}%
Bonus Target: ${r.bonusTarget}%
Total Compensation (Annual): £${Math.round(totalComp).toLocaleString()}

COST ANALYSIS (Full 36-Month Visa Period):
Base Salary (${monthsEmployed} months): £${Math.round((avgSalary / 12) * monthsEmployed).toLocaleString()}
Bonus (${monthsEmployed} months): £${Math.round(((avgSalary * r.bonusTarget / 100) / 12) * monthsEmployed).toLocaleString()}
Employer NI 13.8% (${monthsEmployed} months): £${Math.round(((avgSalary * 0.138) / 12) * monthsEmployed).toLocaleString()}
Pension 3% (${monthsEmployed} months): £${Math.round(((avgSalary * 0.03) / 12) * monthsEmployed).toLocaleString()}
Recruitment Cost: £${r.costPerHire.toLocaleString()}
TOTAL COST: £${Math.round(totalCost).toLocaleString()}

SCALABILITY CONTRIBUTION:
${r.isFullTime && r.minSalary >= 25000 ? '✓ Counts toward ILR job creation criterion (full-time, £25k+)' :
  r.isFullTime ? '✓ Counts toward ILR (full-time job created)' :
  '⚠ Part-time - does not count toward ILR criterion'}
`}).join('\n')}

═══════════════════════════════════════════════════════════
BUDGET VIABILITY ANALYSIS (GOV.UK Viability Criterion)
═══════════════════════════════════════════════════════════
${getViabilityRecommendations().join('\n')}

═══════════════════════════════════════════════════════════
TEAM BUILDING ROADMAP (3-Year Visa Period)
═══════════════════════════════════════════════════════════
${getHiringTimeline().join('\n')}

Source: GOV.UK Innovator Founder Visa Guidance (November 2025)
ILR Criteria: Immigration Rules Appendix Innovator Founder
Budget Formula: Salary + Bonus + Employer NI (13.8%) + Pension (3%) + Recruitment
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-compensation-plan.txt';
    a.click();
  };

  // GOV.UK-Aligned Recommendations
  const getViabilityRecommendations = (): string[] => {
    const tips: string[] = [];
    const { totalCost36Mo, fundingGap, viabilityScore } = getTeamBudgetAnalysis();
    const { jobsCreated, meetsILRCriterion } = getScalabilityScore();
    
    if (fundingGap > 0) {
      tips.push(`🚨 CRITICAL: Funding shortfall of £${Math.round(fundingGap).toLocaleString()} over 3-year visa period`);
      tips.push(`   Your planned team costs £${Math.round(totalCost36Mo).toLocaleString()} but you have £${fundingAvailable.toLocaleString()} available`);
      tips.push(`   Risk: Endorsing body may question business viability (core visa criterion)`);
      tips.push(`   Action: Reduce team size, adjust hiring timeline, or secure additional funding`);
    }
    
    if (viabilityScore < 70) {
      tips.push(`⚠️ WARNING: Budget viability score ${viabilityScore}% below recommended 70% threshold`);
      tips.push(`   Endorsing bodies assess financial realism during application review`);
    }
    
    if (!meetsILRCriterion && jobsCreated < 5) {
      tips.push(`📋 SCALABILITY: Currently ${jobsCreated} jobs planned - aim for 5 jobs at £25k+ for ILR eligibility`);
      tips.push(`   Creating qualifying jobs = one of 7 ILR achievement criteria (need 2 total)`);
    }
    
    if (meetsILRCriterion) {
      tips.push(`✅ EXCELLENT: Job creation criterion MET - ${jobsCreated} jobs demonstrate scalability`);
      tips.push(`   This satisfies 1 of 2 required ILR achievement criteria for settlement after 3 years`);
    }
    
    const avgEquity = roles.reduce((sum, r) => sum + r.equity, 0) / (roles.length || 1);
    if (avgEquity < 0.2) {
      tips.push(`💡 Consider increasing equity allocation (current avg: ${avgEquity.toFixed(2)}%) to attract talent cost-effectively`);
      tips.push(`   Early-stage startups typically offer 0.25-1.0% equity to reduce cash compensation pressure`);
    }
    
    return tips.length > 0 ? tips : ['✅ Team compensation plan is realistic and demonstrates business viability'];
  };

  // Hiring Timeline Visualization
  const getHiringTimeline = (): string[] => {
    const timeline: string[] = [];
    const sortedRoles = [...roles].sort((a, b) => a.hiringMonth - b.hiringMonth);
    
    let cumulativeCost = 0;
    sortedRoles.forEach((role, idx) => {
      const avgSalary = (role.minSalary + role.maxSalary) / 2;
      const monthsEmployed = 36 - role.hiringMonth + 1;
      const annualCost = avgSalary + (avgSalary * (role.bonusTarget / 100)) + (avgSalary * 0.138) + (avgSalary * 0.03);
      const roleCost = (annualCost / 12) * monthsEmployed + role.costPerHire;
      cumulativeCost += roleCost;
      
      timeline.push(`Month ${role.hiringMonth}: Hire ${role.role} (${role.level}) - ${role.isFullTime ? 'Full-Time' : 'Part-Time'}`);
      timeline.push(`   Salary: £${avgSalary.toLocaleString()}, 36-mo cost: £${Math.round(roleCost).toLocaleString()}`);
      timeline.push(`   Cumulative team cost: £${Math.round(cumulativeCost).toLocaleString()}`);
      if (idx < sortedRoles.length - 1) timeline.push('');
    });
    
    return timeline;
  };

  const getSerializedState = () => ({ uploadedFiles, fundingAvailable, roles, savedDate });

  // Chart 1: Job Creation Timeline (Scalability)
  const getJobCreationTimeline = () => {
    const monthlyData: { month: number; jobs: number; jobsAt25k: number }[] = [];
    for (let month = 1; month <= 36; month++) {
      const jobsByMonth = roles.filter(r => r.hiringMonth <= month && r.isFullTime).length;
      const jobsAt25kByMonth = roles.filter(r => r.hiringMonth <= month && r.isFullTime && r.minSalary >= 25000).length;
      monthlyData.push({ month, jobs: jobsByMonth, jobsAt25k: jobsAt25kByMonth });
    }
    return monthlyData.filter((_, idx) => idx % 3 === 0); // Show every 3 months
  };

  // Chart 2: Budget Burn Rate by Quarter
  const getBudgetBurnRate = () => {
    const quarterlyData: { quarter: string; cost: number; cumulative: number }[] = [];
    let cumulative = 0;
    
    for (let q = 1; q <= 12; q++) {
      const quarterStartMonth = (q - 1) * 3 + 1;
      const quarterEndMonth = q * 3;
      
      let quarterCost = 0;
      roles.forEach(role => {
        if (role.hiringMonth <= quarterEndMonth) {
          const avgSalary = (role.minSalary + role.maxSalary) / 2;
          const monthlyTotal = (avgSalary + (avgSalary * (role.bonusTarget / 100)) + (avgSalary * 0.138) + (avgSalary * 0.03)) / 12;
          const monthsInQuarter = Math.min(3, Math.max(0, quarterEndMonth - Math.max(quarterStartMonth - 1, role.hiringMonth - 1)));
          quarterCost += monthlyTotal * monthsInQuarter;
        }
      });
      
      cumulative += quarterCost;
      quarterlyData.push({ quarter: `Q${q}`, cost: Math.round(quarterCost), cumulative: Math.round(cumulative) });
    }
    
    return quarterlyData;
  };

  // Chart 3: Compensation Mix by Role
  const getCompensationMix = () => {
    return roles.map(r => {
      const baseSalary = (r.minSalary + r.maxSalary) / 2;
      const bonus = baseSalary * (r.bonusTarget / 100);
      const equityValue = (500000 * (r.equity / 100)) / 4;
      
      return {
        role: r.role.substring(0, 12),
        base: Math.round(baseSalary),
        bonus: Math.round(bonus),
        equity: Math.round(equityValue)
      };
    });
  };

  // Chart 4: Team Level Distribution
  const getTeamLevelDistribution = () => {
    const levels = roles.reduce((acc, r) => {
      acc[r.level] = (acc[r.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(levels).map(([level, count]) => ({ level, count }));
  };

  useEffect(() => {
    const s = localStorage.getItem('compensationPlanningData');
    if (s) {
      const data = JSON.parse(s);
      setFundingAvailable(data.fundingAvailable || 150000);
      setRoles(data.roles || []);
    }
    const f = localStorage.getItem('compensationPlanningFiles');
    if (f) setUploadedFiles(JSON.parse(f));
    const d = localStorage.getItem('compensationPlanningDate');
    if (d) setSavedDate(d);
  }, []);

  const { score: scalabilityScore, jobsCreated, meetsILRCriterion } = getScalabilityScore();
  const { totalCost36Mo, monthlyBurnRate, viabilityScore } = getTeamBudgetAnalysis();
  const { totalRecruitmentCost } = getRecruitmentAnalysis();

  const COLORS = ['#ffa536', '#11b6e9', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Team Compensation Planning</h1>
          <p className="text-muted-foreground mb-6">Job creation for scalability & budget planning for viability (Innovator Founder Visa)</p>

          <ToolUtilityBar
            toolId="compensation-planning"
            toolName="Team Compensation Planning"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          {savedDate && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">Last saved: {savedDate}</AlertDescription>
            </Alert>
          )}

          {/* PhD-Level KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Scalability Score</span>
              </div>
              <p className="text-3xl font-bold">{scalabilityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">{jobsCreated} jobs created</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">ILR Criterion</span>
              </div>
              <p className="text-3xl font-bold">{meetsILRCriterion ? '✓' : '✗'}</p>
              <p className="text-xs text-muted-foreground mt-1">{meetsILRCriterion ? 'Ready for settlement' : 'Not yet met'}</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Budget Viability</span>
              </div>
              <p className="text-3xl font-bold">{viabilityScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">£{Math.round(monthlyBurnRate / 1000)}k/month burn</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">36-Mo Cost</span>
              </div>
              <p className="text-3xl font-bold">£{Math.round(totalCost36Mo / 1000)}k</p>
              <p className="text-xs text-muted-foreground mt-1">+£{Math.round(totalRecruitmentCost / 1000)}k recruitment</p>
            </Card>
          </div>

          {/* Budget Configuration */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Available Funding (3-Year Visa Period)</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Total Funding Available (£)</label>
              <Input
                type="number"
                value={fundingAvailable}
                onChange={(e) => setFundingAvailable(Number(e.target.value))}
                className="w-48"
                data-testid="input-funding"
              />
              <span className="text-sm text-muted-foreground">
                {totalCost36Mo > fundingAvailable ? 
                  `⚠ Shortfall: £${Math.round(totalCost36Mo - fundingAvailable).toLocaleString()}` : 
                  `✓ Surplus: £${Math.round(fundingAvailable - totalCost36Mo).toLocaleString()}`}
              </span>
            </div>
          </Card>

          {/* PhD-Level: 4-Chart Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Job Creation Timeline (Scalability)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={getJobCreationTimeline()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Jobs Created', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="jobs" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} name="Total Jobs" />
                  <Area type="monotone" dataKey="jobsAt25k" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Jobs £25k+" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Budget Burn Rate by Quarter (Viability)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={getBudgetBurnRate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis yAxisId="left" label={{ value: 'Quarterly £', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Cumulative £', angle: 90, position: 'insideRight' }} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#11b6e9" name="Quarterly Cost" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#ef4444" name="Cumulative Cost" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Compensation Mix by Role</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getCompensationMix()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Annual £', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="base" stackId="a" fill="#ffa536" name="Base Salary" />
                  <Bar dataKey="bonus" stackId="a" fill="#11b6e9" name="Bonus" />
                  <Bar dataKey="equity" stackId="a" fill="#8b5cf6" name="Equity (Annual)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Team Level Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getTeamLevelDistribution()} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={80} label>
                    {getTeamLevelDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* GOV.UK-Aligned Recommendations */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Viability & Scalability Recommendations</h3>
            <div className="space-y-3">
              {getViabilityRecommendations().map((tip, i) => {
                const isCritical = tip.includes('CRITICAL');
                const isWarning = tip.includes('WARNING');
                return (
                  <Alert key={i} className={isCritical ? "border-red-200 bg-red-50 dark:bg-red-950" : isWarning ? "border-orange-200 bg-orange-50 dark:bg-orange-950" : "border-blue-200 bg-blue-50 dark:bg-blue-950"}>
                    <AlertDescription className={isCritical ? "text-red-700 dark:text-red-300" : isWarning ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"}>{tip}</AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </Card>

          {/* Team Roles Editor */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Team Roles & Compensation</h3>
              <Button onClick={addRole} size="sm" data-testid="button-add-role">
                <Plus className="w-4 h-4 mr-1" /> Add Role
              </Button>
            </div>

            <div className="space-y-6">
              {roles.map((role) => {
                const avgSalary = (role.minSalary + role.maxSalary) / 2;
                const totalComp = getTotalCompensation(role);
                const countsForILR = role.isFullTime && role.minSalary >= 25000;
                
                return (
                  <Card key={role.id} className={`p-6 border-l-4 ${countsForILR ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <Input
                        value={role.role}
                        onChange={(e) => updateRole(role.id, 'role', e.target.value)}
                        className="font-semibold text-xl w-2/3"
                        placeholder="Role Title"
                        data-testid={`input-role-${role.id}`}
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)} data-testid={`button-remove-${role.id}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Level</label>
                        <Select value={role.level} onValueChange={(v) => updateRole(role.id, 'level', v)}>
                          <SelectTrigger data-testid={`select-level-${role.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Min Salary (£)</label>
                        <Input type="number" value={role.minSalary} onChange={(e) => updateRole(role.id, 'minSalary', Number(e.target.value))} data-testid={`input-min-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Max Salary (£)</label>
                        <Input type="number" value={role.maxSalary} onChange={(e) => updateRole(role.id, 'maxSalary', Number(e.target.value))} data-testid={`input-max-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Equity (%)</label>
                        <Input type="number" step="0.1" value={role.equity} onChange={(e) => updateRole(role.id, 'equity', Number(e.target.value))} data-testid={`input-equity-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Bonus Target (%)</label>
                        <Input type="number" value={role.bonusTarget} onChange={(e) => updateRole(role.id, 'bonusTarget', Number(e.target.value))} data-testid={`input-bonus-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Hiring Month (1-36)</label>
                        <Input type="number" min="1" max="36" value={role.hiringMonth} onChange={(e) => updateRole(role.id, 'hiringMonth', Number(e.target.value))} data-testid={`input-month-${role.id}`} />
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Cost Per Hire (£)</label>
                        <Input type="number" value={role.costPerHire} onChange={(e) => updateRole(role.id, 'costPerHire', Number(e.target.value))} data-testid={`input-cost-${role.id}`} />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={role.isFullTime}
                          onCheckedChange={(checked) => updateRole(role.id, 'isFullTime', checked)}
                          data-testid={`checkbox-fulltime-${role.id}`}
                        />
                        <label className="text-sm">Full-Time</label>
                      </div>
                    </div>

                    {/* Live ILR Eligibility Feedback */}
                    <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">ILR Eligibility</span>
                        <span className={`text-lg font-bold ${countsForILR ? 'text-green-600' : 'text-orange-600'}`}>
                          {countsForILR ? '✓ Counts' : '✗ Does not count'}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          {role.isFullTime ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                          <span>Full-time employment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {role.minSalary >= 25000 ? <span className="text-green-600">✓</span> : <span className="text-orange-600">⚠</span>}
                          <span>Salary £25,000+ (avg: £{avgSalary.toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Total Compensation: £{Math.round(totalComp).toLocaleString()}/year (Base + Bonus + Equity)
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Upload Supporting Documents</h3>
            <FileUploadButton onFileSelected={handleFileUpload} config={fileUploadConfigs.companyDocuments} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
