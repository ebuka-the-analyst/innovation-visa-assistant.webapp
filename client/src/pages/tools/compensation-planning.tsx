import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


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
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'compensation-planning',
  toolName: 'Team Compensation Planning',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. I'll help you plan your team compensation strategy - a critical component for demonstrating business viability and scalability. Proper compensation planning shows endorsers you understand the true cost of building a team and can create jobs in the UK. Let's design a competitive package!",
  questions: [
    {
      id: 'funding-available',
      question: "What's your total funding available for team building over the 3-year visa period? This helps us assess viability.",
      hint: "Include confirmed funding, projected revenue, and any committed investments in GBP",
      fieldKey: 'fundingAvailable',
      minLength: 10
    },
    {
      id: 'first-hire',
      question: "Who is your first key hire? Describe the role, level (Junior/Mid/Senior/Lead), and expected salary range.",
      hint: "UK tech salaries: Junior £35-50k, Mid £50-70k, Senior £70-100k, Lead £90-130k",
      fieldKey: 'firstHire',
      minLength: 50
    },
    {
      id: 'second-hire',
      question: "What's your second critical role? Include the role title, level, and compensation expectations.",
      hint: "Consider what skills you need to complement your founding team",
      fieldKey: 'secondHire',
      minLength: 50
    },
    {
      id: 'equity-strategy',
      question: "What's your equity compensation strategy? How much equity will you allocate to early employees?",
      hint: "Typical startup equity: First 10 employees get 0.25-1.5% each, vesting over 4 years",
      fieldKey: 'equityStrategy',
      minLength: 30
    },
    {
      id: 'hiring-timeline',
      question: "When do you plan to make these hires? Describe your hiring timeline over the 3-year visa period.",
      hint: "Earlier hires show faster job creation - a key ILR criterion",
      fieldKey: 'hiringTimeline',
      minLength: 50
    },
    {
      id: 'job-creation-plan',
      question: "How many full-time jobs do you plan to create? Remember: 5 jobs at £25k+ or 10 jobs at any salary meets the ILR job creation criterion.",
      hint: "Be realistic but ambitious - this directly impacts your settlement eligibility",
      fieldKey: 'jobCreationPlan',
      minLength: 40
    }
  ],
  completionMessage: "Excellent work! You've created a solid compensation strategy that demonstrates both viability and scalability. Your hiring plan shows clear job creation potential - a key factor for ILR. I'm now populating your team roles with these details."
};

interface TeamRole {
  id: string;
  role: string;
  level: string;
  minSalary: number;
  maxSalary: number;
  equity: number;
  bonusTarget: number;
  hiringMonth: number;
  isFullTime: boolean;
  costPerHire: number;
}

export default function CompensationPlanning() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('compensation-planning-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [fundingAvailable, setFundingAvailable] = useState(150000);
  const [roles, setRoles] = useState<TeamRole[]>([
    { id: "1", role: "Lead Engineer", level: "Senior", minSalary: 70000, maxSalary: 90000, equity: 0.5, bonusTarget: 10, hiringMonth: 1, isFullTime: true, costPerHire: 8000 },
    { id: "2", role: "Product Designer", level: "Mid", minSalary: 55000, maxSalary: 70000, equity: 0.3, bonusTarget: 8, hiringMonth: 3, isFullTime: true, costPerHire: 6000 }
  ]);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('compensation-planning-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('compensation-planning-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.fundingAvailable) {
      const fundingMatch = answers.fundingAvailable.match(/[\d,]+/g);
      if (fundingMatch) {
        const fundingValue = parseInt(fundingMatch[0].replace(/,/g, ''));
        if (fundingValue > 0) setFundingAvailable(fundingValue);
      }
    }
    
    const newRoles: TeamRole[] = [];
    
    if (answers.firstHire) {
      const salaryMatch = answers.firstHire.match(/£?(\d{2,3}),?(\d{3})?k?/i);
      let salary = 65000;
      if (salaryMatch) {
        salary = parseInt(salaryMatch[1]) * (salaryMatch[2] ? 1 : 1000);
      }
      
      const levelMatch = answers.firstHire.match(/(junior|mid|senior|lead)/i);
      const level = levelMatch ? levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1).toLowerCase() : 'Mid';
      
      newRoles.push({
        id: 'ai-1-' + Date.now(),
        role: answers.firstHire.split(/[,.\n]/)[0].substring(0, 30) || 'Key Hire 1',
        level,
        minSalary: Math.round(salary * 0.9),
        maxSalary: Math.round(salary * 1.1),
        equity: 0.5,
        bonusTarget: 10,
        hiringMonth: 1,
        isFullTime: true,
        costPerHire: 7000
      });
    }
    
    if (answers.secondHire) {
      const salaryMatch = answers.secondHire.match(/£?(\d{2,3}),?(\d{3})?k?/i);
      let salary = 55000;
      if (salaryMatch) {
        salary = parseInt(salaryMatch[1]) * (salaryMatch[2] ? 1 : 1000);
      }
      
      const levelMatch = answers.secondHire.match(/(junior|mid|senior|lead)/i);
      const level = levelMatch ? levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1).toLowerCase() : 'Mid';
      
      newRoles.push({
        id: 'ai-2-' + Date.now(),
        role: answers.secondHire.split(/[,.\n]/)[0].substring(0, 30) || 'Key Hire 2',
        level,
        minSalary: Math.round(salary * 0.9),
        maxSalary: Math.round(salary * 1.1),
        equity: 0.3,
        bonusTarget: 8,
        hiringMonth: 3,
        isFullTime: true,
        costPerHire: 5000
      });
    }
    
    if (newRoles.length > 0) {
      setRoles(newRoles);
    }
    
    setMode('traditional');
  };

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

  const getScalabilityScore = (): { score: number; jobsCreated: number; meetsILRCriterion: boolean; criterionMet: string } => {
    const fullTimeRoles = roles.filter(r => r.isFullTime);
    const jobsCreated = fullTimeRoles.length;
    const jobsAbove25k = fullTimeRoles.filter(r => r.minSalary >= 25000).length;
    
    let score = 0;
    let criterionMet = "Not yet";
    let meetsILRCriterion = false;
    
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

  const getTeamBudgetAnalysis = (): { totalCost36Mo: number; monthlyBurnRate: number; fundingGap: number; viabilityScore: number } => {
    let totalCost36Mo = 0;
    
    roles.forEach(role => {
      const avgSalary = (role.minSalary + role.maxSalary) / 2;
      const monthsEmployed = 36 - role.hiringMonth + 1;
      const bonus = avgSalary * (role.bonusTarget / 100);
      const employerNI = avgSalary * 0.138;
      const pension = avgSalary * 0.03;
      
      const annualCost = avgSalary + bonus + employerNI + pension;
      const roleTotal = (annualCost / 12) * monthsEmployed + role.costPerHire;
      
      totalCost36Mo += roleTotal;
    });
    
    const monthlyBurnRate = totalCost36Mo / 36;
    const fundingGap = totalCost36Mo - fundingAvailable;
    
    let viabilityScore = 0;
    if (fundingGap <= 0) {
      viabilityScore = 100;
    } else if (fundingGap < fundingAvailable * 0.2) {
      viabilityScore = 85;
    } else if (fundingGap < fundingAvailable * 0.5) {
      viabilityScore = 60;
    } else {
      viabilityScore = 30;
    }
    
    return { totalCost36Mo, monthlyBurnRate, fundingGap, viabilityScore };
  };

  const getTotalCompensation = (role: TeamRole): number => {
    const baseSalary = (role.minSalary + role.maxSalary) / 2;
    const bonus = baseSalary * (role.bonusTarget / 100);
    const equityValue = (500000 * (role.equity / 100)) / 4;
    return baseSalary + bonus + equityValue;
  };

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

EXECUTIVE SUMMARY
Total Team Roles: ${roles.length}
Full-Time Jobs Created: ${jobsCreated}
Scalability Score: ${scalabilityScore}%
ILR Job Creation Criterion: ${meetsILRCriterion ? 'MET' : 'NOT YET MET'}
Status: ${criterionMet}

36-Month Team Budget: £${totalCost36Mo.toLocaleString()}
Available Funding: £${fundingAvailable.toLocaleString()}
Funding Gap: £${fundingGap.toLocaleString()}
Budget Viability Score: ${viabilityScore}%
Monthly Burn Rate: £${Math.round(monthlyBurnRate).toLocaleString()}

Total Recruitment Cost: £${totalRecruitmentCost.toLocaleString()}
Avg Cost Per Hire: £${Math.round(avgCostPerHire).toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'innovator-founder-compensation-plan.txt';
    a.click();
  };

  const getViabilityRecommendations = (): string[] => {
    const tips: string[] = [];
    const { totalCost36Mo, fundingGap, viabilityScore } = getTeamBudgetAnalysis();
    const { jobsCreated, meetsILRCriterion } = getScalabilityScore();
    
    if (fundingGap > 0) {
      tips.push(`CRITICAL: Funding shortfall of £${Math.round(fundingGap).toLocaleString()} over 3-year visa period`);
    }
    
    if (viabilityScore < 70) {
      tips.push(`WARNING: Budget viability score ${viabilityScore}% below recommended 70% threshold`);
    }
    
    if (!meetsILRCriterion && jobsCreated < 5) {
      tips.push(`SCALABILITY: Currently ${jobsCreated} jobs planned - aim for 5 jobs at £25k+ for ILR eligibility`);
    }
    
    if (meetsILRCriterion) {
      tips.push(`EXCELLENT: Job creation criterion MET - ${jobsCreated} jobs demonstrate scalability`);
    }
    
    return tips.length > 0 ? tips : ['Team compensation plan is realistic and demonstrates business viability'];
  };

  const getHiringTimeline = (): string[] => {
    const timeline: string[] = [];
    const sortedRoles = [...roles].sort((a, b) => a.hiringMonth - b.hiringMonth);
    
    sortedRoles.forEach((role) => {
      const avgSalary = (role.minSalary + role.maxSalary) / 2;
      timeline.push(`Month ${role.hiringMonth}: Hire ${role.role} (${role.level}) - £${avgSalary.toLocaleString()}`);
    });
    
    return timeline;
  };

  const getSerializedState = () => ({ uploadedFiles, fundingAvailable, roles, savedDate });

  const getJobCreationTimeline = () => {
    const monthlyData: { month: number; jobs: number; jobsAt25k: number }[] = [];
    for (let month = 1; month <= 36; month++) {
      const jobsByMonth = roles.filter(r => r.hiringMonth <= month && r.isFullTime).length;
      const jobsAt25kByMonth = roles.filter(r => r.hiringMonth <= month && r.isFullTime && r.minSalary >= 25000).length;
      monthlyData.push({ month, jobs: jobsByMonth, jobsAt25k: jobsAt25kByMonth });
    }
    return monthlyData.filter((_, idx) => idx % 3 === 0);
  };

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

  const COLORS = ['#005EB8', '#41B6E6', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold mb-2">Team Compensation Planning</h1>
              <p className="text-muted-foreground">Job creation for scalability & budget planning for viability (Innovator Founder Visa)</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">ILR Job Creation Criteria</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>To qualify for settlement (ILR) after 3 years, you need to achieve 2 of 7 criteria. Job creation options:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Option A:</strong> Create 5 full-time jobs at £25,000+ salary</li>
                      <li><strong>Option B:</strong> Create 10 full-time jobs at any salary level</li>
                    </ul>
                    <p className="mt-3">Your compensation plan directly impacts your ILR eligibility.</p>
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Scalability</span>
                    </div>
                    <p className="text-lg font-bold">{scalabilityScore}%</p>
                    <p className="text-xs text-muted-foreground">{jobsCreated} jobs planned</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Viability</span>
                    </div>
                    <p className="text-lg font-bold">{viabilityScore}%</p>
                    <p className="text-xs text-muted-foreground">Budget health</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Scalability Score</span>
                  </div>
                  <p className="text-xl font-bold">{scalabilityScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{jobsCreated} jobs created</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">ILR Criterion</span>
                  </div>
                  <p className="text-xl font-bold">{meetsILRCriterion ? '✓' : '✗'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{meetsILRCriterion ? 'Ready for settlement' : 'Not yet met'}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Budget Viability</span>
                  </div>
                  <p className="text-xl font-bold">{viabilityScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">£{Math.round(monthlyBurnRate / 1000)}k/month burn</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">36-Mo Cost</span>
                  </div>
                  <p className="text-xl font-bold">£{Math.round(totalCost36Mo / 1000)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">+£{Math.round(totalRecruitmentCost / 1000)}k recruitment</p>
                </Card>
              </div>

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
                      `Shortfall: £${Math.round(totalCost36Mo - fundingAvailable).toLocaleString()}` : 
                      `Surplus: £${Math.round(fundingAvailable - totalCost36Mo).toLocaleString()}`}
                  </span>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Job Creation Timeline</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={getJobCreationTimeline()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Jobs', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="jobs" stackId="1" stroke="#005EB8" fill="#005EB8" name="Total Jobs" />
                      <Area type="monotone" dataKey="jobsAt25k" stackId="2" stroke="#22c55e" fill="#22c55e" name="Jobs £25k+" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Budget Burn Rate by Quarter</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={getBudgetBurnRate()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis label={{ value: '£', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="cost" stroke="#005EB8" name="Quarterly Cost" />
                      <Line type="monotone" dataKey="cumulative" stroke="#41B6E6" name="Cumulative" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Compensation Mix by Role</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={getCompensationMix()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" angle={-15} textAnchor="end" height={60} />
                      <YAxis label={{ value: '£', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="base" stackId="a" fill="#005EB8" name="Base Salary" />
                      <Bar dataKey="bonus" stackId="a" fill="#41B6E6" name="Bonus" />
                      <Bar dataKey="equity" stackId="a" fill="#8b5cf6" name="Equity Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Team Level Distribution</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={getTeamLevelDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ level, count }) => `${level}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getTeamLevelDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4">Recommendations</h3>
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

              <Card className="p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Team Roles</h3>
                  <Button onClick={addRole} size="sm" data-testid="button-add-role">
                    <Plus className="w-4 h-4 mr-1" /> Add Role
                  </Button>
                </div>

                <div className="space-y-4">
                  {roles.map((role) => (
                    <Card key={role.id} className="p-4 border-l-4 border-l-primary">
                      <div className="flex justify-between items-start mb-4">
                        <Input
                          value={role.role}
                          onChange={(e) => updateRole(role.id, 'role', e.target.value)}
                          className="font-semibold w-2/3"
                          placeholder="Role Title"
                          data-testid={`input-role-${role.id}`}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeRole(role.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1">Level</label>
                          <Select value={role.level} onValueChange={(v) => updateRole(role.id, 'level', v)}>
                            <SelectTrigger data-testid={`select-level-${role.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Junior">Junior</SelectItem>
                              <SelectItem value="Mid">Mid</SelectItem>
                              <SelectItem value="Senior">Senior</SelectItem>
                              <SelectItem value="Lead">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Min Salary (£)</label>
                          <Input
                            type="number"
                            value={role.minSalary}
                            onChange={(e) => updateRole(role.id, 'minSalary', Number(e.target.value))}
                            data-testid={`input-min-salary-${role.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Max Salary (£)</label>
                          <Input
                            type="number"
                            value={role.maxSalary}
                            onChange={(e) => updateRole(role.id, 'maxSalary', Number(e.target.value))}
                            data-testid={`input-max-salary-${role.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Hiring Month</label>
                          <Input
                            type="number"
                            min="1"
                            max="36"
                            value={role.hiringMonth}
                            onChange={(e) => updateRole(role.id, 'hiringMonth', Number(e.target.value))}
                            data-testid={`input-hiring-month-${role.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Equity (%)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={role.equity}
                            onChange={(e) => updateRole(role.id, 'equity', Number(e.target.value))}
                            data-testid={`input-equity-${role.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Bonus Target (%)</label>
                          <Input
                            type="number"
                            value={role.bonusTarget}
                            onChange={(e) => updateRole(role.id, 'bonusTarget', Number(e.target.value))}
                            data-testid={`input-bonus-${role.id}`}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-1">Recruitment Cost (£)</label>
                          <Input
                            type="number"
                            value={role.costPerHire}
                            onChange={(e) => updateRole(role.id, 'costPerHire', Number(e.target.value))}
                            data-testid={`input-recruitment-${role.id}`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={role.isFullTime}
                            onCheckedChange={(v) => updateRole(role.id, 'isFullTime', v)}
                            data-testid={`checkbox-fulltime-${role.id}`}
                          />
                          <label className="text-sm">Full-Time</label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
