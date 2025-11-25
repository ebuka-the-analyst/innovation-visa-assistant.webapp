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
import { CheckCircle2, AlertTriangle, TrendingUp, Users, Calendar, DollarSign, Target, MapPin, Briefcase } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

type HiringPosition = {
  id: string;
  title: string;
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  quantity: number;
  timeline: string;
  quarterTarget: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  yearTarget: number;
  targetSalary: number;
  requirements: string;
  sourcing: string;
  ukBased: boolean;
  visaSponsorship: boolean;
  startDate: string;
  completionDate: string;
  fte: number;
};

type TeamStructure = {
  currentHeadcount: number;
  targetHeadcount: number;
  ukJobsCreated: number;
  internationalHires: number;
  contractorsPlanned: number;
  diversityTargets: string;
  retentionStrategy: string;
  year1FTE: number;
  year2FTE: number;
  year3FTE: number;
};

type RecruitmentStrategy = {
  primaryChannels: string;
  employerBranding: string;
  candidateExperience: string;
  assessmentProcess: string;
  timeToHire: string;
  offerAcceptanceRate: string;
};

type BudgetAllocation = {
  totalBudget: number;
  salariesBudget: number;
  recruitmentCosts: number;
  trainingBudget: number;
  relocationBudget: number;
  contingency: number;
};

export default function HiringPlan() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planning');
  const [savedDate, setSavedDate] = useState('');

  const [positions, setPositions] = useState<HiringPosition[]>([
    {
      id: '1',
      title: '',
      department: '',
      priority: 'high',
      quantity: 1,
      timeline: '',
      quarterTarget: 'Q1',
      yearTarget: 1,
      targetSalary: 0,
      requirements: '',
      sourcing: '',
      ukBased: true,
      visaSponsorship: false,
      startDate: '',
      completionDate: '',
      fte: 1
    }
  ]);

  const [teamStructure, setTeamStructure] = useState<TeamStructure>({
    currentHeadcount: 0,
    targetHeadcount: 0,
    ukJobsCreated: 0,
    internationalHires: 0,
    contractorsPlanned: 0,
    diversityTargets: '',
    retentionStrategy: '',
    year1FTE: 0,
    year2FTE: 0,
    year3FTE: 0
  });

  const [recruitmentStrategy, setRecruitmentStrategy] = useState<RecruitmentStrategy>({
    primaryChannels: '',
    employerBranding: '',
    candidateExperience: '',
    assessmentProcess: '',
    timeToHire: '',
    offerAcceptanceRate: ''
  });

  const [budgetAllocation, setBudgetAllocation] = useState<BudgetAllocation>({
    totalBudget: 0,
    salariesBudget: 0,
    recruitmentCosts: 0,
    trainingBudget: 0,
    relocationBudget: 0,
    contingency: 0
  });

  const [ukJobCreationNotes, setUkJobCreationNotes] = useState({
    jobCreationJustification: '',
    skillGapsAddressed: '',
    economicImpact: '',
    longTermGrowthPlan: ''
  });

  const addPosition = () => {
    setPositions([...positions, {
      id: Date.now().toString(),
      title: '',
      department: '',
      priority: 'high',
      quantity: 1,
      timeline: '',
      quarterTarget: 'Q1',
      yearTarget: 1,
      targetSalary: 0,
      requirements: '',
      sourcing: '',
      ukBased: true,
      visaSponsorship: false,
      startDate: '',
      completionDate: '',
      fte: 1
    }]);
  };

  const updatePosition = (id: string, field: keyof HiringPosition, value: any) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const calculateHiringReadiness = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    const positionFields = positions.reduce((sum, p) => {
      const filled = [p.title, p.department, p.timeline, p.requirements, p.sourcing, p.startDate, p.completionDate]
        .filter(v => v && v.length > 0).length;
      totalFields += 7;
      if (p.targetSalary > 0) completedFields += 1;
      totalFields += 1;
      return sum + filled;
    }, 0);
    completedFields += positionFields;

    const teamFields = [
      teamStructure.diversityTargets,
      teamStructure.retentionStrategy
    ].filter(v => v && v.length > 0).length;
    totalFields += 2;
    completedFields += teamFields;
    if (teamStructure.currentHeadcount > 0) completedFields += 1;
    if (teamStructure.targetHeadcount > 0) completedFields += 1;
    if (teamStructure.ukJobsCreated > 0) completedFields += 1;
    if (teamStructure.year3FTE >= 2) completedFields += 1;
    totalFields += 4;

    const strategyFields = [
      recruitmentStrategy.primaryChannels,
      recruitmentStrategy.employerBranding,
      recruitmentStrategy.candidateExperience,
      recruitmentStrategy.assessmentProcess,
      recruitmentStrategy.timeToHire,
      recruitmentStrategy.offerAcceptanceRate
    ].filter(v => v && v.length > 0).length;
    totalFields += 6;
    completedFields += strategyFields;

    if (budgetAllocation.totalBudget > 0) completedFields += 1;
    if (budgetAllocation.salariesBudget > 0) completedFields += 1;
    if (budgetAllocation.recruitmentCosts > 0) completedFields += 1;
    if (budgetAllocation.trainingBudget > 0) completedFields += 1;
    totalFields += 4;

    const ukNotesFields = [
      ukJobCreationNotes.jobCreationJustification,
      ukJobCreationNotes.skillGapsAddressed,
      ukJobCreationNotes.economicImpact,
      ukJobCreationNotes.longTermGrowthPlan
    ].filter(v => v && v.length > 0).length;
    totalFields += 4;
    completedFields += ukNotesFields;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const calculateJobCreationScore = (): number => {
    let score = 0;
    const year3FTE = teamStructure.year3FTE;
    const ukJobs = positions.filter(p => p.ukBased).reduce((sum, p) => sum + (p.quantity * p.fte), 0);
    
    if (year3FTE >= 10) score += 40;
    else if (year3FTE >= 5) score += 25;
    else if (year3FTE >= 2) score += 15;
    
    if (ukJobs >= 10) score += 30;
    else if (ukJobs >= 5) score += 15;
    
    if (ukJobCreationNotes.economicImpact && ukJobCreationNotes.economicImpact.length > 100) score += 15;
    else if (ukJobCreationNotes.economicImpact && ukJobCreationNotes.economicImpact.length > 50) score += 10;
    
    if (teamStructure.retentionStrategy && teamStructure.retentionStrategy.length > 100) score += 15;
    else if (teamStructure.retentionStrategy && teamStructure.retentionStrategy.length > 50) score += 10;
    
    return Math.min(100, score);
  };

  const hiringReadiness = calculateHiringReadiness();
  const jobCreationScore = calculateJobCreationScore();
  const totalHeadcount = positions.reduce((sum, p) => sum + p.quantity, 0);
  const totalSalaryCost = positions.reduce((sum, p) => sum + (p.targetSalary * p.quantity), 0);
  const ukJobsCount = positions.filter(p => p.ukBased).reduce((sum, p) => sum + p.quantity, 0);
  const totalFTE = positions.filter(p => p.ukBased).reduce((sum, p) => sum + (p.quantity * p.fte), 0);

  const getQuarterlyHiringData = () => {
    const quarters = { 'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0 };
    positions.forEach(p => {
      quarters[p.quarterTarget] += p.quantity;
    });
    return Object.entries(quarters).map(([quarter, hires]) => ({
      quarter,
      hires,
      cumulative: Object.keys(quarters)
        .slice(0, Object.keys(quarters).indexOf(quarter) + 1)
        .reduce((sum, q) => sum + quarters[q as keyof typeof quarters], 0)
    }));
  };

  const getHeadcountGrowthData = () => {
    const yearlyData = [
      { year: 'Current', headcount: teamStructure.currentHeadcount, ukJobs: 0, target: teamStructure.currentHeadcount },
      { year: 'Year 1', headcount: teamStructure.currentHeadcount + teamStructure.year1FTE, ukJobs: teamStructure.year1FTE, target: teamStructure.currentHeadcount + teamStructure.year1FTE },
      { year: 'Year 2', headcount: teamStructure.currentHeadcount + teamStructure.year1FTE + teamStructure.year2FTE, ukJobs: teamStructure.year1FTE + teamStructure.year2FTE, target: teamStructure.currentHeadcount + teamStructure.year1FTE + teamStructure.year2FTE },
      { year: 'Year 3', headcount: teamStructure.currentHeadcount + teamStructure.year1FTE + teamStructure.year2FTE + teamStructure.year3FTE, ukJobs: teamStructure.year1FTE + teamStructure.year2FTE + teamStructure.year3FTE, target: teamStructure.targetHeadcount }
    ];
    return yearlyData;
  };

  const getBudgetAllocationData = () => {
    return [
      { category: 'Salaries', value: budgetAllocation.salariesBudget, color: '#3b82f6', percentage: budgetAllocation.totalBudget > 0 ? Math.round((budgetAllocation.salariesBudget / budgetAllocation.totalBudget) * 100) : 0 },
      { category: 'Recruitment', value: budgetAllocation.recruitmentCosts, color: '#10b981', percentage: budgetAllocation.totalBudget > 0 ? Math.round((budgetAllocation.recruitmentCosts / budgetAllocation.totalBudget) * 100) : 0 },
      { category: 'Training', value: budgetAllocation.trainingBudget, color: '#f59e0b', percentage: budgetAllocation.totalBudget > 0 ? Math.round((budgetAllocation.trainingBudget / budgetAllocation.totalBudget) * 100) : 0 },
      { category: 'Relocation', value: budgetAllocation.relocationBudget, color: '#8b5cf6', percentage: budgetAllocation.totalBudget > 0 ? Math.round((budgetAllocation.relocationBudget / budgetAllocation.totalBudget) * 100) : 0 },
      { category: 'Contingency', value: budgetAllocation.contingency, color: '#6b7280', percentage: budgetAllocation.totalBudget > 0 ? Math.round((budgetAllocation.contingency / budgetAllocation.totalBudget) * 100) : 0 },
    ].filter(item => item.value > 0);
  };

  const getDepartmentDistribution = () => {
    const deptMap: Record<string, number> = {};
    positions.forEach(p => {
      if (p.department) {
        deptMap[p.department] = (deptMap[p.department] || 0) + p.quantity;
      }
    });
    return Object.entries(deptMap).map(([department, count]) => ({
      department: department || 'Unassigned',
      count,
      percentage: totalHeadcount > 0 ? Math.round((count / totalHeadcount) * 100) : 0
    }));
  };

  const getHiringTimelineData = () => {
    return positions
      .filter(p => p.title && p.startDate)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((p, index) => ({
        name: p.title.substring(0, 20),
        role: p.title,
        department: p.department,
        start: new Date(p.startDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        end: p.completionDate ? new Date(p.completionDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'Ongoing',
        duration: p.completionDate ? 
          Math.round((new Date(p.completionDate).getTime() - new Date(p.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 4,
        priority: p.priority,
        index: index + 1,
        ukBased: p.ukBased
      }));
  };

  const getSerializedState = () => {
    return {
      positions,
      teamStructure,
      recruitmentStrategy,
      budgetAllocation,
      ukJobCreationNotes,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('positions' in state) setPositions(state.positions);
    if ('teamStructure' in state) setTeamStructure(state.teamStructure);
    if ('recruitmentStrategy' in state) setRecruitmentStrategy(state.recruitmentStrategy);
    if ('budgetAllocation' in state) setBudgetAllocation(state.budgetAllocation);
    if ('ukJobCreationNotes' in state) setUkJobCreationNotes(state.ukJobCreationNotes);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('hiring-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('hiring-plan-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('hiring-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (hiringReadiness < 30) {
      tips.push("Begin with detailed role definitions and timelines - this demonstrates strategic workforce planning to endorsing bodies");
    }

    if (teamStructure.year3FTE < 2) {
      tips.push("CRITICAL: UK Innovation Visa requires at least 2 FTE UK jobs by Year 3. Your current plan shows " + teamStructure.year3FTE.toFixed(1) + " FTE - this does not meet the mandatory criterion");
    }

    if (ukJobsCount < 10) {
      tips.push("IMPORTANT: While 2 FTE is the minimum, endorsing bodies favour plans showing 10+ UK jobs within 3 years to demonstrate genuine job creation");
    }

    if (positions.filter(p => p.priority === 'critical').length === 0) {
      tips.push("Define critical roles - show endorsing bodies which positions are essential for achieving your business plan milestones");
    }

    if (!recruitmentStrategy.primaryChannels || recruitmentStrategy.primaryChannels.length < 20) {
      tips.push("Document your recruitment channels and sourcing strategy - demonstrates operational maturity and market understanding");
    }

    if (totalSalaryCost > 0 && budgetAllocation.salariesBudget === 0) {
      tips.push("Align your salary budget with planned positions - financial coherence is critical for visa application credibility");
    }

    if (totalSalaryCost > 0 && budgetAllocation.salariesBudget > 0 && Math.abs(totalSalaryCost - budgetAllocation.salariesBudget) > budgetAllocation.salariesBudget * 0.2) {
      tips.push("Your salary budget (£" + budgetAllocation.salariesBudget.toLocaleString() + ") differs significantly from position costs (£" + totalSalaryCost.toLocaleString() + ") - ensure these align");
    }

    if (positions.filter(p => !p.requirements || p.requirements.length < 30).length > positions.length / 2) {
      tips.push("Define detailed requirements for each role - specificity demonstrates genuine job creation rather than theoretical planning");
    }

    if (!teamStructure.retentionStrategy || teamStructure.retentionStrategy.length < 50) {
      tips.push("Document retention strategies - high turnover undermines job creation claims and visa compliance");
    }

    if (positions.filter(p => p.visaSponsorship).length > positions.length * 0.3) {
      tips.push("Over 30% of roles require visa sponsorship - ensure you have Sponsor License plans and justify international hiring needs");
    }

    if (!ukJobCreationNotes.economicImpact || ukJobCreationNotes.economicImpact.length < 50) {
      tips.push("Articulate the UK economic impact of your hiring plan - link job creation to innovation, tax revenue, and market growth");
    }

    if (budgetAllocation.trainingBudget === 0 && totalHeadcount > 5) {
      tips.push("Allocate training budget - demonstrates commitment to skill development and long-term employee investment");
    }

    if (!teamStructure.diversityTargets || teamStructure.diversityTargets.length < 30) {
      tips.push("Define diversity and inclusion targets - modern employers demonstrate commitment to equitable hiring practices");
    }

    if (positions.some(p => p.targetSalary > 0 && p.targetSalary < 25000 && p.ukBased)) {
      tips.push("Review salary levels - UK roles below £25,000 may not meet skilled worker visa thresholds if sponsorship is required");
    }

    if (jobCreationScore >= 80 && teamStructure.year3FTE >= 2) {
      tips.push("Excellent job creation plan - ensure all claims are backed by detailed financial projections and role justifications");
    }

    if (positions.filter(p => p.yearTarget === 3).reduce((sum, p) => sum + (p.ukBased ? p.quantity * p.fte : 0), 0) < 2) {
      tips.push("Your Year 3 hiring plan must include at least 2 FTE UK-based roles to meet visa requirements - currently below threshold");
    }

    if (budgetAllocation.recruitmentCosts === 0 && totalHeadcount > 3) {
      tips.push("Account for recruitment costs - hiring agencies, job board fees, and interview expenses typically represent 10-20% of annual salaries");
    }

    if (positions.length > 0 && positions.every(p => !p.startDate || !p.completionDate)) {
      tips.push("Set realistic start and completion dates for each role - timeline credibility is essential for visa officer assessment");
    }

    if (!ukJobCreationNotes.skillGapsAddressed || ukJobCreationNotes.skillGapsAddressed.length < 30) {
      tips.push("Document specific UK skill gaps your hiring addresses - aligning with national priorities strengthens your application");
    }

    if (teamStructure.currentHeadcount === 0 && positions.length > 10) {
      tips.push("Large team expansion from zero requires exceptional justification - ensure business case demonstrates clear revenue and operational capacity");
    }

    if (!ukJobCreationNotes.longTermGrowthPlan || ukJobCreationNotes.longTermGrowthPlan.length < 50) {
      tips.push("Articulate job growth beyond Year 3 - endorsers want to see sustainable long-term UK employment, not temporary positions");
    }

    if (positions.filter(p => p.ukBased && p.department === 'Engineering').length > 0 && !recruitmentStrategy.employerBranding) {
      tips.push("Engineering talent is highly competitive in the UK - strong employer branding is essential for attracting skilled developers");
    }

    return tips;
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Define all critical roles with detailed job descriptions, requirements, and salary bands aligned to UK market rates", priority: "Critical" },
      { week: "Week 1", action: "Calculate total hiring budget including salaries, recruitment fees, relocation, and training costs with 15% contingency", priority: "Critical" },
      { week: "Week 1-2", action: "Map hiring timeline to business milestones showing when each role becomes necessary for achieving growth targets", priority: "Critical" },
      { week: "Week 2", action: "Document UK job creation numbers ensuring at least 2 FTE in Year 3 and link to visa application requirements", priority: "Critical" },
      { week: "Week 2", action: "Identify recruitment channels and sourcing strategies for each role type (LinkedIn, agencies, referrals, job boards)", priority: "High" },
      { week: "Week 2-3", action: "Develop employer branding and candidate attraction strategy to compete for talent in competitive UK market", priority: "High" },
      { week: "Week 3", action: "Create retention strategy showing how you'll maintain headcount throughout visa period with specific initiatives", priority: "High" },
      { week: "Week 3", action: "Plan onboarding and training programs demonstrating long-term employee investment with measurable outcomes", priority: "Medium" },
      { week: "Week 3-4", action: "If hiring internationally, prepare Sponsor License application and compliance framework (£1,476 + legal fees)", priority: "High" },
      { week: "Week 4", action: "Document economic impact: UK tax revenue, skill development, market growth from your team with quantified projections", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - STRATEGIC HIRING PLAN
Generated: ${new Date().toLocaleString('en-GB')}
Hiring Readiness Score: ${hiringReadiness}%
Job Creation Score: ${jobCreationScore}%
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Positions Planned: ${totalHeadcount}
UK-Based Roles: ${ukJobsCount} (${totalHeadcount > 0 ? Math.round((ukJobsCount / totalHeadcount) * 100) : 0}%)
Total UK FTE: ${totalFTE.toFixed(1)}
Year 3 FTE: ${teamStructure.year3FTE.toFixed(1)} ${teamStructure.year3FTE >= 2 ? '(MEETS VISA REQUIREMENT)' : '(BELOW 2 FTE REQUIREMENT)'}
Total Annual Salary Cost: £${totalSalaryCost.toLocaleString()}
Hiring Readiness: ${hiringReadiness >= 70 ? 'Strong Plan' : hiringReadiness >= 40 ? 'Moderate Plan' : 'Early Stage'}
Job Creation Compliance: ${jobCreationScore >= 70 ? 'Strong' : jobCreationScore >= 40 ? 'Moderate' : 'Needs Improvement'}

UK JOB CREATION (VISA CRITICAL)
${'-'.repeat(80)}
Total UK Jobs Created: ${ukJobsCount}
Total UK FTE Created: ${totalFTE.toFixed(1)}
Year 1 FTE: ${teamStructure.year1FTE.toFixed(1)}
Year 2 FTE: ${teamStructure.year2FTE.toFixed(1)}
Year 3 FTE: ${teamStructure.year3FTE.toFixed(1)}

VISA COMPLIANCE CHECK:
Minimum 2 FTE by Year 3: ${teamStructure.year3FTE >= 2 ? 'PASS' : 'FAIL - CRITICAL ISSUE'}

Job Creation Justification:
${ukJobCreationNotes.jobCreationJustification || '[Not specified - CRITICAL for visa application]'}

Skill Gaps Addressed:
${ukJobCreationNotes.skillGapsAddressed || '[Not specified]'}

UK Economic Impact:
${ukJobCreationNotes.economicImpact || '[Not specified - CRITICAL for visa application]'}

Long-Term Growth Plan:
${ukJobCreationNotes.longTermGrowthPlan || '[Not specified]'}

POSITIONS BREAKDOWN
${'-'.repeat(80)}
${positions.map((p, i) => `
${i + 1}. ${p.title || 'Untitled Position'} (${p.quantity} position${p.quantity > 1 ? 's' : ''})
   Department: ${p.department || 'Not specified'}
   Priority: ${p.priority.toUpperCase()}
   Target Quarter: ${p.quarterTarget} Year ${p.yearTarget}
   FTE per Position: ${p.fte}
   Total FTE: ${(p.quantity * p.fte).toFixed(1)}
   Salary: £${p.targetSalary.toLocaleString()} per position
   Total Cost: £${(p.targetSalary * p.quantity).toLocaleString()}
   UK-Based: ${p.ukBased ? 'YES' : 'NO'}
   Visa Sponsorship: ${p.visaSponsorship ? 'YES' : 'NO'}
   Timeline: ${p.timeline || 'Not specified'}
   Start Date: ${p.startDate || 'Not specified'}
   Completion: ${p.completionDate || 'Not specified'}
   
   Requirements:
   ${p.requirements || 'Not specified'}
   
   Sourcing Strategy:
   ${p.sourcing || 'Not specified'}
`).join('\n')}

QUARTERLY HIRING PLAN
${'-'.repeat(80)}
${getQuarterlyHiringData().map(q => `${q.quarter}: ${q.hires} hires (Cumulative: ${q.cumulative})`).join('\n')}

HEADCOUNT GROWTH PROJECTION
${'-'.repeat(80)}
${getHeadcountGrowthData().map(d => `${d.year}: ${d.headcount} total (${d.ukJobs} UK jobs created)`).join('\n')}

DEPARTMENT DISTRIBUTION
${'-'.repeat(80)}
${getDepartmentDistribution().map(d => `${d.department}: ${d.count} (${d.percentage}%)`).join('\n')}

TEAM STRUCTURE DETAILS
${'-'.repeat(80)}
Current Headcount: ${teamStructure.currentHeadcount}
Target Headcount: ${teamStructure.targetHeadcount}
Growth Rate: ${teamStructure.currentHeadcount > 0 ? Math.round(((teamStructure.targetHeadcount - teamStructure.currentHeadcount) / teamStructure.currentHeadcount) * 100) : 0}%
UK Jobs Created: ${teamStructure.ukJobsCreated}
International Hires: ${teamStructure.internationalHires}
Contractors Planned: ${teamStructure.contractorsPlanned}

Diversity & Inclusion Targets:
${teamStructure.diversityTargets || 'Not specified'}

Retention Strategy:
${teamStructure.retentionStrategy || 'Not specified'}

RECRUITMENT STRATEGY
${'-'.repeat(80)}
Primary Channels:
${recruitmentStrategy.primaryChannels || 'Not specified'}

Employer Branding:
${recruitmentStrategy.employerBranding || 'Not specified'}

Candidate Experience:
${recruitmentStrategy.candidateExperience || 'Not specified'}

Assessment Process:
${recruitmentStrategy.assessmentProcess || 'Not specified'}

Average Time to Hire: ${recruitmentStrategy.timeToHire || 'Not specified'}
Offer Acceptance Rate: ${recruitmentStrategy.offerAcceptanceRate || 'Not specified'}

BUDGET ALLOCATION
${'-'.repeat(80)}
Total Hiring Budget: £${budgetAllocation.totalBudget.toLocaleString()}
Salaries Budget: £${budgetAllocation.salariesBudget.toLocaleString()} (${getBudgetAllocationData().find(d => d.category === 'Salaries')?.percentage || 0}%)
Recruitment Costs: £${budgetAllocation.recruitmentCosts.toLocaleString()} (${getBudgetAllocationData().find(d => d.category === 'Recruitment')?.percentage || 0}%)
Training Budget: £${budgetAllocation.trainingBudget.toLocaleString()} (${getBudgetAllocationData().find(d => d.category === 'Training')?.percentage || 0}%)
Relocation Budget: £${budgetAllocation.relocationBudget.toLocaleString()} (${getBudgetAllocationData().find(d => d.category === 'Relocation')?.percentage || 0}%)
Contingency: £${budgetAllocation.contingency.toLocaleString()} (${getBudgetAllocationData().find(d => d.category === 'Contingency')?.percentage || 0}%)

Planned Position Costs: £${totalSalaryCost.toLocaleString()}
Budget vs Actual: ${totalSalaryCost > 0 && budgetAllocation.salariesBudget > 0 ? 
  ((budgetAllocation.salariesBudget / totalSalaryCost) * 100).toFixed(1) + '% coverage' : 'N/A'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA COMPLIANCE NOTES
${'-'.repeat(80)}
- UK job creation is a core criterion for Innovator Founder visa approval
- MANDATORY: At least 2 FTE UK jobs must be created by end of Year 3
- FTE = Full-Time Equivalent (1.0 FTE = full-time, 0.5 FTE = part-time)
- Demonstrate genuine, sustainable employment opportunities in the UK
- Link hiring plan to business milestones and revenue growth projections
- Show competitive salaries meeting skilled worker thresholds where applicable
- Document retention strategies to prove long-term job sustainability
- If sponsoring international talent, prepare Sponsor License compliance (£1,476 fee)
- Endorsing bodies assess job quality, not just quantity
- Provide evidence of genuine need for each role with clear justification
- Higher job creation numbers (10+ FTE) significantly strengthen applications
- Part-time roles accepted if FTE calculation meets 2.0 threshold

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hiring-plan-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    await generateWord({
      title: "Strategic Hiring Plan",
      subtitle: "UK Innovator Founder Visa - Workforce Planning & Job Creation Strategy",
      filename: "hiring-plan-report",
      sections: [
        { type: 'heading', level: 1, content: 'Executive Summary' },
        { type: 'score', score: { value: hiringReadiness, max: 100, label: 'Hiring Readiness' } },
        { type: 'score', score: { value: jobCreationScore, max: 100, label: 'Job Creation Score' } },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Positions Planned', totalHeadcount.toString()],
            ['UK-Based Roles', `${ukJobsCount} (${totalHeadcount > 0 ? Math.round((ukJobsCount / totalHeadcount) * 100) : 0}%)`],
            ['Total UK FTE', totalFTE.toFixed(1)],
            ['Year 3 FTE', `${teamStructure.year3FTE.toFixed(1)} ${teamStructure.year3FTE >= 2 ? '(MEETS VISA REQUIREMENT)' : '(BELOW 2 FTE REQUIREMENT)'}`],
            ['Total Annual Salary Cost', `£${totalSalaryCost.toLocaleString()}`]
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'UK Job Creation (Visa Critical)' },
        { type: 'paragraph', content: `Minimum 2 FTE by Year 3: ${teamStructure.year3FTE >= 2 ? 'PASS' : 'FAIL - CRITICAL ISSUE'}` },
        { type: 'table', tableData: {
          headers: ['Year', 'FTE'],
          rows: [
            ['Year 1', teamStructure.year1FTE.toFixed(1)],
            ['Year 2', teamStructure.year2FTE.toFixed(1)],
            ['Year 3', teamStructure.year3FTE.toFixed(1)]
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Positions Breakdown' },
        { type: 'table', tableData: {
          headers: ['Position', 'Qty', 'Department', 'Priority', 'UK Based', 'Salary'],
          rows: positions.map(p => [
            p.title || 'Untitled',
            p.quantity.toString(),
            p.department || 'N/A',
            p.priority.toUpperCase(),
            p.ukBased ? 'Yes' : 'No',
            `£${p.targetSalary.toLocaleString()}`
          ])
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Budget Allocation' },
        { type: 'table', tableData: {
          headers: ['Category', 'Budget'],
          rows: [
            ['Total Hiring Budget', `£${budgetAllocation.totalBudget.toLocaleString()}`],
            ['Salaries Budget', `£${budgetAllocation.salariesBudget.toLocaleString()}`],
            ['Recruitment Costs', `£${budgetAllocation.recruitmentCosts.toLocaleString()}`],
            ['Training Budget', `£${budgetAllocation.trainingBudget.toLocaleString()}`],
            ['Relocation Budget', `£${budgetAllocation.relocationBudget.toLocaleString()}`],
            ['Contingency', `£${budgetAllocation.contingency.toLocaleString()}`]
          ]
        }},
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
        subject: 'Strategic Hiring Plan',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['hiring plan', 'job creation', 'UK visa', 'workforce planning']
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-hiring-plan">Strategic Hiring Plan</h1>
            <p className="text-lg text-muted-foreground">Workforce planning and UK job creation strategy</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="hiring-plan"
            toolName="Hiring Plan"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
          />

          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-1">Total Hires</p>
                  <p className="text-3xl font-bold" data-testid="text-total-hires">{totalHeadcount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={teamStructure.year3FTE >= 2 ? "border-green-500/20" : "border-destructive/20"}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground mb-1">Year 3 FTE</p>
                  <p className={`text-3xl font-bold ${teamStructure.year3FTE >= 2 ? 'text-green-600' : 'text-destructive'}`} data-testid="text-year3-fte">
                    {teamStructure.year3FTE.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Min: 2.0 FTE</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground mb-1">UK Jobs</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-uk-jobs">{ukJobsCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">{totalFTE.toFixed(1)} FTE</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-muted-foreground mb-1">Salary Cost</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="text-salary-cost">£{(totalSalaryCost / 1000).toFixed(0)}K</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-muted-foreground mb-1">Job Score</p>
                  <p className="text-3xl font-bold text-purple-600" data-testid="text-job-creation-score">{jobCreationScore}%</p>
                  <Progress value={jobCreationScore} className="mt-2" data-testid="progress-job-score" />
                </div>
              </CardContent>
            </Card>
          </div>

          {teamStructure.year3FTE < 2 && (
            <Alert variant="destructive" className="mb-6" data-testid="alert-year3-fte-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                CRITICAL: Your Year 3 plan shows {teamStructure.year3FTE.toFixed(1)} FTE. Innovation Visa REQUIRES at least 2.0 FTE UK jobs by Year 3. Update your Year 1-3 FTE targets.
              </AlertDescription>
            </Alert>
          )}

          {ukJobsCount < 10 && teamStructure.year3FTE >= 2 && (
            <Alert className="mb-6" data-testid="alert-uk-jobs-low">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your plan shows {ukJobsCount} UK jobs ({totalFTE.toFixed(1)} FTE). While you meet the minimum 2 FTE, endorsing bodies favour 10+ jobs for stronger applications.
              </AlertDescription>
            </Alert>
          )}

          {hiringReadiness >= 70 && teamStructure.year3FTE >= 2 && ukJobsCount >= 10 && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-strong-plan">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Excellent hiring plan with {ukJobsCount} UK jobs ({totalFTE.toFixed(1)} FTE) and {teamStructure.year3FTE.toFixed(1)} FTE by Year 3. This demonstrates genuine job creation commitment.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-hiring-plan">
              <TabsTrigger value="planning" data-testid="tab-planning">Planning</TabsTrigger>
              <TabsTrigger value="budget" data-testid="tab-budget">Budget</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="planning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Positions</CardTitle>
                  <CardDescription>Define roles, timelines, and budgets for your growing team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {positions.map((pos) => (
                    <Card key={pos.id} className="p-4 border-l-4 border-primary">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`title-${pos.id}`}>Position Title</Label>
                            <Input
                              id={`title-${pos.id}`}
                              value={pos.title}
                              onChange={(e) => updatePosition(pos.id, 'title', e.target.value)}
                              placeholder="e.g., Senior Software Engineer"
                              data-testid={`input-title-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`department-${pos.id}`}>Department</Label>
                            <Input
                              id={`department-${pos.id}`}
                              value={pos.department}
                              onChange={(e) => updatePosition(pos.id, 'department', e.target.value)}
                              placeholder="e.g., Engineering"
                              data-testid={`input-department-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`priority-${pos.id}`}>Priority</Label>
                            <select
                              id={`priority-${pos.id}`}
                              value={pos.priority}
                              onChange={(e) => updatePosition(pos.id, 'priority', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-priority-${pos.id}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-4">
                          <div>
                            <Label htmlFor={`quantity-${pos.id}`}>Quantity</Label>
                            <Input
                              id={`quantity-${pos.id}`}
                              type="number"
                              min="1"
                              value={pos.quantity}
                              onChange={(e) => updatePosition(pos.id, 'quantity', parseInt(e.target.value) || 1)}
                              data-testid={`input-quantity-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`fte-${pos.id}`}>FTE</Label>
                            <Input
                              id={`fte-${pos.id}`}
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="1"
                              value={pos.fte}
                              onChange={(e) => updatePosition(pos.id, 'fte', parseFloat(e.target.value) || 1)}
                              data-testid={`input-fte-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`quarter-${pos.id}`}>Quarter</Label>
                            <select
                              id={`quarter-${pos.id}`}
                              value={pos.quarterTarget}
                              onChange={(e) => updatePosition(pos.id, 'quarterTarget', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-quarter-${pos.id}`}
                            >
                              <option value="Q1">Q1</option>
                              <option value="Q2">Q2</option>
                              <option value="Q3">Q3</option>
                              <option value="Q4">Q4</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`year-${pos.id}`}>Year</Label>
                            <Input
                              id={`year-${pos.id}`}
                              type="number"
                              min="1"
                              max="5"
                              value={pos.yearTarget}
                              onChange={(e) => updatePosition(pos.id, 'yearTarget', parseInt(e.target.value) || 1)}
                              data-testid={`input-year-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`salary-${pos.id}`}>Salary (£)</Label>
                            <Input
                              id={`salary-${pos.id}`}
                              type="number"
                              value={pos.targetSalary || ''}
                              onChange={(e) => updatePosition(pos.id, 'targetSalary', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-salary-${pos.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`timeline-${pos.id}`}>Hiring Timeline</Label>
                            <Input
                              id={`timeline-${pos.id}`}
                              value={pos.timeline}
                              onChange={(e) => updatePosition(pos.id, 'timeline', e.target.value)}
                              placeholder="e.g., 8 weeks"
                              data-testid={`input-timeline-${pos.id}`}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pos.ukBased}
                                onChange={(e) => updatePosition(pos.id, 'ukBased', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-uk-${pos.id}`}
                              />
                              <span className="text-sm">UK-Based</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pos.visaSponsorship}
                                onChange={(e) => updatePosition(pos.id, 'visaSponsorship', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-visa-${pos.id}`}
                              />
                              <span className="text-sm">Visa Req.</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`start-${pos.id}`}>Start Date</Label>
                            <Input
                              id={`start-${pos.id}`}
                              type="date"
                              value={pos.startDate}
                              onChange={(e) => updatePosition(pos.id, 'startDate', e.target.value)}
                              data-testid={`input-start-${pos.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`completion-${pos.id}`}>Completion Date</Label>
                            <Input
                              id={`completion-${pos.id}`}
                              type="date"
                              value={pos.completionDate}
                              onChange={(e) => updatePosition(pos.id, 'completionDate', e.target.value)}
                              data-testid={`input-completion-${pos.id}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`requirements-${pos.id}`}>Requirements & Qualifications</Label>
                          <Textarea
                            id={`requirements-${pos.id}`}
                            value={pos.requirements}
                            onChange={(e) => updatePosition(pos.id, 'requirements', e.target.value)}
                            placeholder="List key skills, experience, and qualifications"
                            rows={3}
                            data-testid={`textarea-requirements-${pos.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`sourcing-${pos.id}`}>Sourcing Strategy</Label>
                          <Textarea
                            id={`sourcing-${pos.id}`}
                            value={pos.sourcing}
                            onChange={(e) => updatePosition(pos.id, 'sourcing', e.target.value)}
                            placeholder="Where and how will you source candidates?"
                            rows={2}
                            data-testid={`textarea-sourcing-${pos.id}`}
                          />
                        </div>

                        {positions.length > 1 && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePosition(pos.id)}
                              data-testid={`button-remove-${pos.id}`}
                            >
                              Remove Position
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}

                  <Button onClick={addPosition} className="w-full" data-testid="button-add-position">
                    Add Position
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Structure & Growth</CardTitle>
                  <CardDescription>Overall team composition and scaling targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current-headcount">Current Headcount</Label>
                      <Input
                        id="current-headcount"
                        type="number"
                        value={teamStructure.currentHeadcount || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, currentHeadcount: parseInt(e.target.value) || 0})}
                        data-testid="input-current-headcount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-headcount">Target Headcount</Label>
                      <Input
                        id="target-headcount"
                        type="number"
                        value={teamStructure.targetHeadcount || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, targetHeadcount: parseInt(e.target.value) || 0})}
                        data-testid="input-target-headcount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uk-jobs">UK Jobs Created</Label>
                      <Input
                        id="uk-jobs"
                        type="number"
                        value={teamStructure.ukJobsCreated || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, ukJobsCreated: parseInt(e.target.value) || 0})}
                        data-testid="input-uk-jobs-created"
                      />
                    </div>
                  </div>

                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertDescription className="text-sm">
                      <strong>CRITICAL:</strong> Year 3 FTE must be at least 2.0 for visa compliance. Specify UK job FTE targets by year below.
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year1-fte">Year 1 UK FTE</Label>
                      <Input
                        id="year1-fte"
                        type="number"
                        step="0.1"
                        value={teamStructure.year1FTE || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, year1FTE: parseFloat(e.target.value) || 0})}
                        data-testid="input-year1-fte"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year2-fte">Year 2 UK FTE</Label>
                      <Input
                        id="year2-fte"
                        type="number"
                        step="0.1"
                        value={teamStructure.year2FTE || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, year2FTE: parseFloat(e.target.value) || 0})}
                        data-testid="input-year2-fte"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year3-fte" className={teamStructure.year3FTE < 2 ? "text-destructive" : ""}>
                        Year 3 UK FTE {teamStructure.year3FTE < 2 ? "(Min: 2.0)" : ""}
                      </Label>
                      <Input
                        id="year3-fte"
                        type="number"
                        step="0.1"
                        value={teamStructure.year3FTE || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, year3FTE: parseFloat(e.target.value) || 0})}
                        className={teamStructure.year3FTE < 2 ? "border-destructive" : ""}
                        data-testid="input-year3-fte"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="international-hires">International Hires</Label>
                      <Input
                        id="international-hires"
                        type="number"
                        value={teamStructure.internationalHires || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, internationalHires: parseInt(e.target.value) || 0})}
                        data-testid="input-international-hires"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contractors">Contractors Planned</Label>
                      <Input
                        id="contractors"
                        type="number"
                        value={teamStructure.contractorsPlanned || ''}
                        onChange={(e) => setTeamStructure({...teamStructure, contractorsPlanned: parseInt(e.target.value) || 0})}
                        data-testid="input-contractors"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="diversity-targets">Diversity & Inclusion Targets</Label>
                    <Textarea
                      id="diversity-targets"
                      value={teamStructure.diversityTargets}
                      onChange={(e) => setTeamStructure({...teamStructure, diversityTargets: e.target.value})}
                      placeholder="Describe your approach to building a diverse and inclusive team"
                      rows={3}
                      data-testid="textarea-diversity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retention-strategy">Retention Strategy</Label>
                    <Textarea
                      id="retention-strategy"
                      value={teamStructure.retentionStrategy}
                      onChange={(e) => setTeamStructure({...teamStructure, retentionStrategy: e.target.value})}
                      placeholder="How will you retain top talent and maintain job sustainability?"
                      rows={3}
                      data-testid="textarea-retention"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Job Creation - Visa Critical</CardTitle>
                  <CardDescription>Demonstrate genuine UK economic impact through job creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-justification">Job Creation Justification</Label>
                    <Textarea
                      id="job-justification"
                      value={ukJobCreationNotes.jobCreationJustification}
                      onChange={(e) => setUkJobCreationNotes({...ukJobCreationNotes, jobCreationJustification: e.target.value})}
                      placeholder="Explain why these roles are necessary and how they support business growth"
                      rows={4}
                      data-testid="textarea-job-justification"
                    />
                  </div>

                  <div>
                    <Label htmlFor="skill-gaps">Skill Gaps Addressed</Label>
                    <Textarea
                      id="skill-gaps"
                      value={ukJobCreationNotes.skillGapsAddressed}
                      onChange={(e) => setUkJobCreationNotes({...ukJobCreationNotes, skillGapsAddressed: e.target.value})}
                      placeholder="What skill gaps in the UK market are you addressing?"
                      rows={3}
                      data-testid="textarea-skill-gaps"
                    />
                  </div>

                  <div>
                    <Label htmlFor="economic-impact">UK Economic Impact</Label>
                    <Textarea
                      id="economic-impact"
                      value={ukJobCreationNotes.economicImpact}
                      onChange={(e) => setUkJobCreationNotes({...ukJobCreationNotes, economicImpact: e.target.value})}
                      placeholder="Quantify tax revenue, skill development, and economic benefits to UK"
                      rows={4}
                      data-testid="textarea-economic-impact"
                    />
                  </div>

                  <div>
                    <Label htmlFor="growth-plan">Long-Term Growth Plan</Label>
                    <Textarea
                      id="growth-plan"
                      value={ukJobCreationNotes.longTermGrowthPlan}
                      onChange={(e) => setUkJobCreationNotes({...ukJobCreationNotes, longTermGrowthPlan: e.target.value})}
                      placeholder="How will job creation scale beyond year 1-3?"
                      rows={3}
                      data-testid="textarea-growth-plan"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Strategy</CardTitle>
                  <CardDescription>Define your talent attraction and hiring process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="channels">Primary Recruitment Channels</Label>
                    <Textarea
                      id="channels"
                      value={recruitmentStrategy.primaryChannels}
                      onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, primaryChannels: e.target.value})}
                      placeholder="LinkedIn, job boards, recruitment agencies, referrals, etc."
                      rows={3}
                      data-testid="textarea-channels"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branding">Employer Branding Strategy</Label>
                    <Textarea
                      id="branding"
                      value={recruitmentStrategy.employerBranding}
                      onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, employerBranding: e.target.value})}
                      placeholder="How will you position your company to attract top talent?"
                      rows={3}
                      data-testid="textarea-branding"
                    />
                  </div>

                  <div>
                    <Label htmlFor="candidate-exp">Candidate Experience</Label>
                    <Textarea
                      id="candidate-exp"
                      value={recruitmentStrategy.candidateExperience}
                      onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, candidateExperience: e.target.value})}
                      placeholder="Describe your hiring process from application to offer"
                      rows={3}
                      data-testid="textarea-candidate-exp"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assessment">Assessment Process</Label>
                    <Textarea
                      id="assessment"
                      value={recruitmentStrategy.assessmentProcess}
                      onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, assessmentProcess: e.target.value})}
                      placeholder="How will you evaluate candidate fit?"
                      rows={3}
                      data-testid="textarea-assessment"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time-to-hire">Average Time to Hire</Label>
                      <Input
                        id="time-to-hire"
                        value={recruitmentStrategy.timeToHire}
                        onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, timeToHire: e.target.value})}
                        placeholder="e.g., 6-8 weeks"
                        data-testid="input-time-to-hire"
                      />
                    </div>
                    <div>
                      <Label htmlFor="acceptance-rate">Offer Acceptance Rate</Label>
                      <Input
                        id="acceptance-rate"
                        value={recruitmentStrategy.offerAcceptanceRate}
                        onChange={(e) => setRecruitmentStrategy({...recruitmentStrategy, offerAcceptanceRate: e.target.value})}
                        placeholder="e.g., 80%"
                        data-testid="input-acceptance-rate"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>Comprehensive hiring budget breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="total-budget">Total Hiring Budget (£)</Label>
                    <Input
                      id="total-budget"
                      type="number"
                      value={budgetAllocation.totalBudget || ''}
                      onChange={(e) => setBudgetAllocation({...budgetAllocation, totalBudget: parseFloat(e.target.value) || 0})}
                      data-testid="input-total-budget"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaries-budget">Salaries Budget (£)</Label>
                      <Input
                        id="salaries-budget"
                        type="number"
                        value={budgetAllocation.salariesBudget || ''}
                        onChange={(e) => setBudgetAllocation({...budgetAllocation, salariesBudget: parseFloat(e.target.value) || 0})}
                        data-testid="input-salaries-budget"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Position costs: £{totalSalaryCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label htmlFor="recruitment-costs">Recruitment Costs (£)</Label>
                      <Input
                        id="recruitment-costs"
                        type="number"
                        value={budgetAllocation.recruitmentCosts || ''}
                        onChange={(e) => setBudgetAllocation({...budgetAllocation, recruitmentCosts: parseFloat(e.target.value) || 0})}
                        data-testid="input-recruitment-costs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Typical: 10-20% of salaries</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="training-budget">Training Budget (£)</Label>
                      <Input
                        id="training-budget"
                        type="number"
                        value={budgetAllocation.trainingBudget || ''}
                        onChange={(e) => setBudgetAllocation({...budgetAllocation, trainingBudget: parseFloat(e.target.value) || 0})}
                        data-testid="input-training-budget"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relocation-budget">Relocation Budget (£)</Label>
                      <Input
                        id="relocation-budget"
                        type="number"
                        value={budgetAllocation.relocationBudget || ''}
                        onChange={(e) => setBudgetAllocation({...budgetAllocation, relocationBudget: parseFloat(e.target.value) || 0})}
                        data-testid="input-relocation-budget"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contingency">Contingency (£)</Label>
                      <Input
                        id="contingency"
                        type="number"
                        value={budgetAllocation.contingency || ''}
                        onChange={(e) => setBudgetAllocation({...budgetAllocation, contingency: parseFloat(e.target.value) || 0})}
                        data-testid="input-contingency"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recommend: 15% of total</p>
                    </div>
                  </div>

                  {totalSalaryCost > 0 && budgetAllocation.salariesBudget > 0 && Math.abs(totalSalaryCost - budgetAllocation.salariesBudget) > budgetAllocation.salariesBudget * 0.2 && (
                    <Alert variant="destructive" data-testid="alert-budget-mismatch">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Budget mismatch: Your salary budget (£{budgetAllocation.salariesBudget.toLocaleString()}) differs from position costs (£{totalSalaryCost.toLocaleString()}) by {Math.round(Math.abs(totalSalaryCost - budgetAllocation.salariesBudget) / budgetAllocation.salariesBudget * 100)}%
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Distribution</CardTitle>
                    <CardDescription>Allocation by category</CardDescription>
                  </CardHeader>
                  <CardContent data-testid="chart-budget-distribution">
                    {getBudgetAllocationData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getBudgetAllocationData()}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            paddingAngle={2}
                            label={(entry) => `${entry.category}: ${entry.percentage}%`}
                            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                          >
                            {getBudgetAllocationData().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `£${value.toLocaleString()}`}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value, entry: any) => `${value}: £${entry.payload.value.toLocaleString()} (${entry.payload.percentage}%)`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-budget-data">Add budget allocations to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Summary</CardTitle>
                    <CardDescription>Financial overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Total Budget</span>
                      <span className="font-semibold" data-testid="text-budget-total">£{budgetAllocation.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Allocated</span>
                      <span className="font-semibold" data-testid="text-budget-allocated">
                        £{(budgetAllocation.salariesBudget + budgetAllocation.recruitmentCosts + budgetAllocation.trainingBudget + budgetAllocation.relocationBudget + budgetAllocation.contingency).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm">Remaining</span>
                      <span className={`font-semibold ${budgetAllocation.totalBudget - (budgetAllocation.salariesBudget + budgetAllocation.recruitmentCosts + budgetAllocation.trainingBudget + budgetAllocation.relocationBudget + budgetAllocation.contingency) < 0 ? 'text-destructive' : ''}`} data-testid="text-budget-remaining">
                        £{(budgetAllocation.totalBudget - (budgetAllocation.salariesBudget + budgetAllocation.recruitmentCosts + budgetAllocation.trainingBudget + budgetAllocation.relocationBudget + budgetAllocation.contingency)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm">Utilization</span>
                      <span className="font-semibold" data-testid="text-budget-utilization">
                        {budgetAllocation.totalBudget > 0 ? Math.round(((budgetAllocation.salariesBudget + budgetAllocation.recruitmentCosts + budgetAllocation.trainingBudget + budgetAllocation.relocationBudget + budgetAllocation.contingency) / budgetAllocation.totalBudget) * 100) : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quarterly Hiring Trend</CardTitle>
                    <CardDescription>Hiring volume by quarter</CardDescription>
                  </CardHeader>
                  <CardContent data-testid="chart-quarterly-hiring">
                    {getQuarterlyHiringData().some(d => d.hires > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={getQuarterlyHiringData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis 
                            dataKey="quarter" 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="hires" fill="#3b82f6" name="New Hires" radius={[4, 4, 0, 0]} />
                          <Line 
                            dataKey="cumulative" 
                            stroke="#10b981" 
                            name="Cumulative" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-quarterly-data">Add positions with quarters to see trend</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Headcount Growth Projection</CardTitle>
                    <CardDescription>3-year team growth trajectory</CardDescription>
                  </CardHeader>
                  <CardContent data-testid="chart-headcount-growth">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getHeadcountGrowthData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="year" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                          dataKey="headcount" 
                          stroke="#3b82f6" 
                          name="Total Headcount" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          dataKey="ukJobs" 
                          stroke="#10b981" 
                          name="UK Jobs Created" 
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          dataKey="target" 
                          stroke="#f59e0b" 
                          name="Target" 
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={{ fill: '#f59e0b', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Timeline (Gantt Chart)</CardTitle>
                  <CardDescription>Role-by-role hiring schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  {getHiringTimelineData().length > 0 ? (
                    <div className="space-y-2" data-testid="gantt-chart">
                      {getHiringTimelineData().map((item, index) => (
                        <div key={index} className="flex items-center gap-4 py-2 border-b">
                          <div className="w-1/4 text-sm font-medium truncate" data-testid={`gantt-role-${index}`}>
                            {item.role}
                          </div>
                          <div className="w-1/6 text-xs text-muted-foreground" data-testid={`gantt-dept-${index}`}>
                            {item.department}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className={`h-6 rounded px-2 flex items-center text-xs text-white ${item.priority === 'critical' ? 'bg-red-500' : item.priority === 'high' ? 'bg-orange-500' : item.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'}`} style={{width: `${item.duration * 10}%`, minWidth: '80px'}} data-testid={`gantt-bar-${index}`}>
                              {item.start} - {item.end}
                            </div>
                          </div>
                          <div className="w-16 text-xs text-right">
                            {item.ukBased ? <span className="text-green-600 font-medium">UK</span> : <span className="text-gray-400">Intl</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-12" data-testid="text-no-timeline-data">Add positions with start dates to see hiring timeline</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Team allocation by function</CardDescription>
                </CardHeader>
                <CardContent data-testid="chart-department-distribution">
                  {getDepartmentDistribution().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDepartmentDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="department"
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          angle={-15}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                          formatter={(value: number, name: string, props: any) => [
                            `${value} (${props.payload.percentage}%)`,
                            'Headcount'
                          ]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar 
                          dataKey="count" 
                          fill="#8b5cf6" 
                          name="Headcount"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12" data-testid="text-no-dept-data">Add departments to positions to see distribution</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips & Recommendations</CardTitle>
                  <CardDescription>AI-powered guidance for your hiring plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50" data-testid={`tip-${index}`}>
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm leading-relaxed">{tip}</p>
                        </div>
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
                  <CardDescription>Prioritized timeline for hiring plan execution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{item.week}</span>
                            <span className={`text-xs px-2 py-1 rounded ${item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Compliance Checklist</CardTitle>
                  <CardDescription>Critical requirements for job creation criterion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {teamStructure.year3FTE >= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="check-year3-fte" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" data-testid="alert-year3-fte" />
                      )}
                      <div>
                        <p className="font-medium">At least 2 FTE UK jobs by Year 3</p>
                        <p className="text-sm text-muted-foreground">Current: {teamStructure.year3FTE.toFixed(1)} FTE {teamStructure.year3FTE >= 2 ? '(PASS)' : '(FAIL)'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {ukJobCreationNotes.economicImpact && ukJobCreationNotes.economicImpact.length > 50 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="check-economic-impact" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="alert-economic-impact" />
                      )}
                      <div>
                        <p className="font-medium">Documented UK economic impact</p>
                        <p className="text-sm text-muted-foreground">Tax revenue, skill development, market growth quantified</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {positions.filter(p => p.requirements && p.requirements.length > 30).length >= positions.length * 0.7 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="check-detailed-roles" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="alert-detailed-roles" />
                      )}
                      <div>
                        <p className="font-medium">Detailed role requirements defined</p>
                        <p className="text-sm text-muted-foreground">Demonstrates genuine job creation vs. theoretical planning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {teamStructure.retentionStrategy && teamStructure.retentionStrategy.length > 50 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="check-retention" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="alert-retention" />
                      )}
                      <div>
                        <p className="font-medium">Retention strategy documented</p>
                        <p className="text-sm text-muted-foreground">Proves long-term sustainability of job creation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {totalSalaryCost > 0 && budgetAllocation.salariesBudget > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="check-budget-aligned" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="alert-budget-aligned" />
                      )}
                      <div>
                        <p className="font-medium">Salary budget aligned with position costs</p>
                        <p className="text-sm text-muted-foreground">Financial coherence critical for credibility</p>
                      </div>
                    </div>
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
