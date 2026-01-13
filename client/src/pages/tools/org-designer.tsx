import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Users, Building2, TrendingUp, Target, Plus, Trash2, DollarSign } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ComposedChart, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "org-designer",
  toolName: "Organization Designer",
  agent: "nova",
  greeting: "Hello! I'm Nova, your organizational architect. Let's design a scalable team structure that demonstrates your UK job creation commitment and organizational maturity to endorsers.",
  questions: [
    {
      id: "company_overview",
      question: "Tell me about your company. What's the name and what stage of development are you at?",
      hint: "Example: 'TechStartup Ltd, currently in MVP stage with 2 founders'",
      fieldKey: "companyOverview",
      minLength: 20
    },
    {
      id: "departments",
      question: "What departments will your organization have? Describe each department's purpose.",
      hint: "Example: 'Product (build our solution), Sales (acquire customers), Operations (run the business)'",
      fieldKey: "departments",
      minLength: 50
    },
    {
      id: "key_roles",
      question: "What are the key roles you need to fill? Include job titles, levels, and whether they'll be UK-based.",
      hint: "Focus on roles critical for business execution and visa compliance",
      fieldKey: "keyRoles",
      minLength: 60
    },
    {
      id: "growth_phases",
      question: "Describe your 3-year growth plan in phases. What are your team size targets for each year?",
      hint: "Example: 'Year 1: 5 people, Year 2: 15 people, Year 3: 30 people'",
      fieldKey: "growthPhases",
      minLength: 50
    },
    {
      id: "culture_values",
      question: "What are your organizational values and culture principles?",
      hint: "Describe the type of workplace culture you want to build",
      fieldKey: "cultureValues",
      minLength: 40
    },
    {
      id: "reporting_structure",
      question: "How will your reporting structure work? Describe the hierarchy and management approach.",
      hint: "Example: 'Flat structure initially, CTO and COO report to CEO, team leads per department'",
      fieldKey: "reportingStructure",
      minLength: 40
    }
  ],
  completionMessage: "Excellent! I've captured your organizational design. Let me now create a structured view of your departments, roles, and growth plan."
};

type Department = {
  id: string;
  name: string;
  purpose: string;
  headcount: number;
  budget: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type RoleDefinition = {
  id: string;
  title: string;
  department: string;
  level: 'executive' | 'director' | 'manager' | 'senior' | 'mid' | 'junior';
  reportsTo: string;
  salary: number;
  headcount: number;
  ukBased: boolean;
  fte: number;
  responsibilities: string;
  requiredSkills: string;
  growthPhase: 1 | 2 | 3;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type GrowthPhase = {
  phase: number;
  timeline: string;
  objectives: string;
  keyHires: string;
  teamSize: number;
  budget: number;
};

type OrgStructure = {
  companyName: string;
  currentSize: number;
  targetSize: number;
  managementLevels: number;
  spanOfControl: string;
  reportingStructure: string;
  cultureValues: string;
};

const CHART_COLORS = ['#41B6E6', '#005EB8', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#06b6d4'];

export default function OrgDesigner() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('org-designer-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('org-designer-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('org-designer-mode', mode);
  }, [mode]);

  const [activeTab, setActiveTab] = useState('structure');
  const [savedDate, setSavedDate] = useState('');

  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Executive', purpose: 'Strategic leadership and overall direction', headcount: 1, budget: 150000, priority: 'critical' }
  ]);

  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: '1',
      title: 'Chief Executive Officer',
      department: 'Executive',
      level: 'executive',
      reportsTo: 'Board',
      salary: 120000,
      headcount: 1,
      ukBased: true,
      fte: 1,
      responsibilities: 'Overall company strategy, P&L ownership, stakeholder management',
      requiredSkills: 'Leadership, Strategy, Execution, Vision',
      growthPhase: 1,
      priority: 'critical'
    }
  ]);

  const [growthPhases, setGrowthPhases] = useState<GrowthPhase[]>([
    { phase: 1, timeline: 'Months 1-12', objectives: 'Establish core team and MVP', keyHires: 'CEO, CTO, initial engineers', teamSize: 5, budget: 300000 },
    { phase: 2, timeline: 'Months 13-24', objectives: 'Scale operations and expand market reach', keyHires: 'Sales, Marketing, Operations leads', teamSize: 15, budget: 900000 },
    { phase: 3, timeline: 'Months 25-36', objectives: 'Full-scale growth and market leadership', keyHires: 'Department heads, senior specialists', teamSize: 30, budget: 2000000 }
  ]);

  const [orgStructure, setOrgStructure] = useState<OrgStructure>({
    companyName: '',
    currentSize: 1,
    targetSize: 30,
    managementLevels: 3,
    spanOfControl: 'Average 5-7 direct reports per manager',
    reportingStructure: '',
    cultureValues: ''
  });

  const addDepartment = () => {
    setDepartments([...departments, {
      id: Date.now().toString(),
      name: '',
      purpose: '',
      headcount: 0,
      budget: 0,
      priority: 'medium'
    }]);
  };

  const updateDepartment = (id: string, field: keyof Department, value: any) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDepartment = (id: string) => {
    if (id === '1') return;
    setDepartments(departments.filter(d => d.id !== id));
    setRoles(roles.map(r => r.department === departments.find(d => d.id === id)?.name ? { ...r, department: 'Executive' } : r));
  };

  const addRole = () => {
    setRoles([...roles, {
      id: Date.now().toString(),
      title: '',
      department: departments[0]?.name || 'Executive',
      level: 'mid',
      reportsTo: '1',
      salary: 50000,
      headcount: 1,
      ukBased: true,
      fte: 1,
      responsibilities: '',
      requiredSkills: '',
      growthPhase: 1,
      priority: 'medium'
    }]);
  };

  const updateRole = (id: string, field: keyof RoleDefinition, value: any) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRole = (id: string) => {
    if (id === '1') return;
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateGrowthPhase = (phase: number, field: keyof GrowthPhase, value: any) => {
    setGrowthPhases(growthPhases.map(gp => gp.phase === phase ? { ...gp, [field]: value } : gp));
  };

  const calculateDesignScore = (): number => {
    let score = 0;

    const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);
    const ukFTE = roles.filter(r => r.ukBased).reduce((sum, r) => sum + (r.headcount * r.fte), 0);
    if (ukFTE >= 10) score += 20;
    else if (ukFTE >= 5) score += 15;
    else if (ukFTE >= 2) score += 10;

    const rolesWithDetails = roles.filter(r =>
      r.title && r.responsibilities.length > 50 && r.requiredSkills.length > 20
    ).length;
    if (rolesWithDetails >= roles.length * 0.8) score += 20;
    else if (rolesWithDetails >= roles.length * 0.5) score += 10;

    if (departments.length >= 5) score += 15;
    else if (departments.length >= 3) score += 10;

    const deptsWithPurpose = departments.filter(d => d.purpose.length > 30).length;
    if (deptsWithPurpose === departments.length) score += 10;
    else if (deptsWithPurpose >= departments.length * 0.7) score += 5;

    const clearHierarchy = roles.filter(r => r.reportsTo && r.reportsTo.length > 0).length;
    if (clearHierarchy === roles.length) score += 10;
    else if (clearHierarchy >= roles.length * 0.8) score += 5;

    if (orgStructure.reportingStructure.length > 100) score += 10;
    if (orgStructure.cultureValues.length > 80) score += 5;

    const phasesComplete = growthPhases.filter(gp =>
      gp.objectives.length > 50 && gp.keyHires.length > 30
    ).length;
    if (phasesComplete === 3) score += 10;
    else if (phasesComplete >= 2) score += 5;

    if (totalHeadcount >= 20) score += 5;
    if (roles.length >= 10) score += 5;

    return Math.min(100, score);
  };

  const designScore = calculateDesignScore();
  const totalHeadcount = roles.reduce((sum, r) => sum + r.headcount, 0);
  const totalSalaryCost = roles.reduce((sum, r) => sum + (r.salary * r.headcount), 0);
  const ukHeadcount = roles.filter(r => r.ukBased).reduce((sum, r) => sum + r.headcount, 0);
  const totalUkFTE = roles.filter(r => r.ukBased).reduce((sum, r) => sum + (r.headcount * r.fte), 0);
  const totalBudget = departments.reduce((sum, d) => sum + d.budget, 0);

  const getDepartmentData = () => {
    return departments.map(dept => ({
      name: dept.name.substring(0, 20) || 'Unnamed',
      headcount: roles.filter(r => r.department === dept.name).reduce((sum, r) => sum + r.headcount, 0),
      budget: Math.round(dept.budget / 1000),
      allocated: Math.round(roles.filter(r => r.department === dept.name).reduce((sum, r) => sum + (r.salary * r.headcount), 0) / 1000)
    }));
  };

  const getResourceAllocationData = () => {
    const deptMap: Record<string, number> = {};
    roles.forEach(r => {
      const dept = r.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + (r.salary * r.headcount);
    });
    return Object.entries(deptMap).map(([name, value]) => ({
      name: name.substring(0, 15),
      value: Math.round(value)
    }));
  };

  const getGrowthProjectionData = () => {
    return growthPhases.map(gp => ({
      phase: `Phase ${gp.phase}`,
      teamSize: gp.teamSize,
      budget: Math.round(gp.budget / 1000),
      roles: roles.filter(r => r.growthPhase === gp.phase).reduce((sum, r) => sum + r.headcount, 0)
    }));
  };

  const getHierarchyData = () => {
    const levelMap: Record<string, number> = {};
    roles.forEach(r => {
      levelMap[r.level] = (levelMap[r.level] || 0) + r.headcount;
    });
    return [
      { level: 'Executive', count: levelMap['executive'] || 0 },
      { level: 'Director', count: levelMap['director'] || 0 },
      { level: 'Manager', count: levelMap['manager'] || 0 },
      { level: 'Senior', count: levelMap['senior'] || 0 },
      { level: 'Mid', count: levelMap['mid'] || 0 },
      { level: 'Junior', count: levelMap['junior'] || 0 }
    ].filter(item => item.count > 0);
  };

  const getStructureComplexityData = () => {
    return growthPhases.map((gp, idx) => {
      const phaseRoles = roles.filter(r => r.growthPhase <= gp.phase);
      const phaseDepts = new Set(phaseRoles.map(r => r.department)).size;
      const phaseHeadcount = phaseRoles.reduce((sum, r) => sum + r.headcount, 0);
      const avgSalary = phaseHeadcount > 0 
        ? Math.round(phaseRoles.reduce((sum, r) => sum + (r.salary * r.headcount), 0) / phaseHeadcount / 1000)
        : 0;
      
      return {
        phase: `Phase ${gp.phase}`,
        departments: phaseDepts,
        roles: phaseRoles.length,
        headcount: phaseHeadcount,
        avgSalary,
        complexity: Math.round((phaseDepts * 10 + phaseRoles.length * 5 + phaseHeadcount) / 3)
      };
    });
  };

  const getRoleDistributionData = () => {
    const deptMap: Record<string, Record<string, number>> = {};
    
    roles.forEach(r => {
      const dept = r.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { executive: 0, director: 0, manager: 0, senior: 0, mid: 0, junior: 0 };
      }
      deptMap[dept][r.level] += r.headcount;
    });

    return Object.entries(deptMap).map(([dept, levels]) => ({
      department: dept.substring(0, 12),
      Executive: levels.executive,
      Director: levels.director,
      Manager: levels.manager,
      Senior: levels.senior,
      Mid: levels.mid,
      Junior: levels.junior
    }));
  };

  const getSerializedState = () => {
    return {
      departments,
      roles,
      growthPhases,
      orgStructure,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('departments' in state) setDepartments(state.departments);
    if ('roles' in state) setRoles(state.roles);
    if ('growthPhases' in state) setGrowthPhases(state.growthPhases);
    if ('orgStructure' in state) setOrgStructure(state.orgStructure);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('org-designer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('org-designer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('org-designer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const handleSmartTips = () => {
    setActiveTab('tips');
  };

  const handleActionPlan = () => {
    setActiveTab('action');
  };

  const getSmartTips = () => {
    const tips = [];

    if (totalUkFTE < 2) {
      tips.push("CRITICAL: UK Innovation Visa requires minimum 2 FTE UK jobs. Your current plan shows " + totalUkFTE.toFixed(1) + " FTE - this does not meet mandatory requirements");
    }

    if (ukHeadcount < 10 && totalUkFTE >= 2) {
      tips.push("While 2 FTE meets minimum requirements, endorsing bodies favour plans demonstrating 10+ UK jobs within 3 years to show genuine job creation commitment");
    }

    const rolesWithoutDetails = roles.filter(r => !r.responsibilities || r.responsibilities.length < 50).length;
    if (rolesWithoutDetails > roles.length * 0.3) {
      tips.push("Define detailed responsibilities for all roles - specificity demonstrates genuine job creation rather than theoretical planning");
    }

    if (roles.filter(r => !r.requiredSkills || r.requiredSkills.length < 20).length > roles.length / 2) {
      tips.push("Document required skills for each position - this proves you're creating skilled roles eligible for visa sponsorship if needed");
    }

    if (departments.length < 3) {
      tips.push("Develop cross-functional team structure with at least 3-4 departments - demonstrates operational maturity and scalability");
    }

    const deptsWithoutPurpose = departments.filter(d => !d.purpose || d.purpose.length < 30).length;
    if (deptsWithoutPurpose > 0) {
      tips.push("Define clear purpose for each department - shows strategic thinking about organizational structure and functional needs");
    }

    if (!orgStructure.reportingStructure || orgStructure.reportingStructure.length < 50) {
      tips.push("Document clear reporting lines and organizational hierarchy - essential for demonstrating structured growth to endorsing bodies");
    }

    if (totalSalaryCost > totalBudget && totalBudget > 0) {
      tips.push("Salary costs exceed department budgets - ensure resource allocation is realistic and financially sustainable");
    }

    if (roles.some(r => r.ukBased && r.salary > 0 && r.salary < 25600)) {
      tips.push("Some UK roles fall below £25,600 minimum - this may not meet Skilled Worker visa thresholds if sponsorship is required");
    }

    if (growthPhases.some(gp => !gp.objectives || gp.objectives.length < 50)) {
      tips.push("Complete all growth phase objectives - detailed 3-year planning demonstrates strategic thinking and execution capability");
    }

    if (orgStructure.managementLevels < 2) {
      tips.push("Consider defining multiple management levels - demonstrates career progression paths which enhance retention and attraction");
    }

    if (!orgStructure.cultureValues || orgStructure.cultureValues.length < 50) {
      tips.push("Articulate organizational culture and values - shows you're building a sustainable company, not just filling positions");
    }

    const phase3Roles = roles.filter(r => r.growthPhase === 3).reduce((sum, r) => sum + r.headcount, 0);
    if (phase3Roles < 5) {
      tips.push("Add more Phase 3 roles to demonstrate long-term growth vision - endorsers want to see scalability beyond initial team");
    }

    if (roles.filter(r => r.priority === 'critical').length === 0) {
      tips.push("Identify critical roles essential for business plan execution - helps endorsing bodies understand which hires are make-or-break");
    }

    if (designScore >= 70 && totalUkFTE >= 2) {
      tips.push("Strong organizational design - ensure this aligns with your financial projections and business plan milestones");
    }

    if (!orgStructure.companyName || orgStructure.companyName.length === 0) {
      tips.push("Add your company name to personalize the organizational structure and demonstrate professionalism");
    }

    const lowSalaryRoles = roles.filter(r => r.salary > 0 && r.salary < 30000).length;
    if (lowSalaryRoles > roles.length * 0.5) {
      tips.push("Over half your roles have salaries below £30,000 - ensure compensation is competitive to attract and retain talent in the UK market");
    }

    const noReportingRoles = roles.filter(r => !r.reportsTo || r.reportsTo.length === 0).length;
    if (noReportingRoles > 2) {
      tips.push("Multiple roles lack reporting structure - define clear reporting lines for all positions to demonstrate organizational clarity");
    }

    if (departments.length > 0 && departments.filter(d => d.budget === 0).length > departments.length * 0.3) {
      tips.push("Many departments have no budget allocated - establish realistic budget allocations to demonstrate financial planning capability");
    }

    const executiveCount = roles.filter(r => r.level === 'executive').reduce((sum, r) => sum + r.headcount, 0);
    if (totalHeadcount > 10 && executiveCount === 1) {
      tips.push("Consider adding senior leadership positions as you scale - distributed leadership reduces founder dependency and demonstrates succession planning");
    }

    if (roles.length > 5 && roles.filter(r => r.growthPhase === 1).length === roles.length) {
      tips.push("Distribute hires across all three growth phases - shows phased scaling approach rather than immediate over-hiring");
    }

    return tips.slice(0, 20);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Map current organizational structure and identify gaps between current state and 3-year vision", priority: "Critical" },
      { week: "Week 1", action: "Define all departments with clear purposes, budgets, and headcount requirements", priority: "Critical" },
      { week: "Week 1-2", action: "Create detailed job descriptions for all roles with responsibilities, skills, and KPIs", priority: "Critical" },
      { week: "Week 2", action: "Ensure minimum 2 FTE UK jobs by Year 3 requirement is met and clearly documented", priority: "Critical" },
      { week: "Week 2", action: "Establish clear reporting lines and hierarchical structure across all levels", priority: "High" },
      { week: "Week 2-3", action: "Link each role to specific business plan milestones showing why each hire is essential", priority: "High" },
      { week: "Week 3", action: "Calculate full-loaded costs including salaries, benefits, NI, and overhead for all positions", priority: "High" },
      { week: "Week 3", action: "Document recruitment strategy, timelines, and sourcing channels for each critical position", priority: "Medium" },
      { week: "Week 3-4", action: "Define organizational culture, values, and employee value proposition", priority: "High" },
      { week: "Week 4", action: "Create retention and career development framework demonstrating long-term people strategy", priority: "Medium" },
      { week: "Week 4", action: "Align organizational design with financial projections - ensure revenue supports team growth", priority: "Critical" },
      { week: "Ongoing", action: "Update organizational structure as business evolves - maintain consistency across visa documents", priority: "High" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ORGANIZATIONAL DESIGN PLAN
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ORGANIZATION SUMMARY
${'-'.repeat(80)}
Company: ${orgStructure.companyName || 'Not specified'}
Current Team Size: ${orgStructure.currentSize || totalHeadcount}
Target Team Size (Year 3): ${orgStructure.targetSize || totalHeadcount}
Total Planned Headcount: ${totalHeadcount}
UK-Based Headcount: ${ukHeadcount}
Total UK FTE: ${totalUkFTE.toFixed(1)}
Total Department Budgets: £${totalBudget.toLocaleString()}
Total Salary Costs: £${totalSalaryCost.toLocaleString()}
Management Levels: ${orgStructure.managementLevels}
Design Effectiveness Score: ${designScore}/100

UK JOB CREATION STATUS
${'-'.repeat(80)}
UK Full-Time Equivalent (FTE): ${totalUkFTE.toFixed(1)}
Minimum Requirement: 2 FTE by Year 3
Status: ${totalUkFTE >= 2 ? 'MEETS REQUIREMENT' : 'BELOW REQUIREMENT'}

DEPARTMENTS
${'-'.repeat(80)}
${departments.map((dept, i) => `
${i + 1}. ${dept.name || 'Unnamed Department'}
   Purpose: ${dept.purpose || 'Not defined'}
   Target Headcount: ${dept.headcount}
   Budget: £${dept.budget.toLocaleString()}
   Priority: ${dept.priority.charAt(0).toUpperCase() + dept.priority.slice(1)}
   Allocated Salary: £${roles.filter(r => r.department === dept.name).reduce((sum, r) => sum + (r.salary * r.headcount), 0).toLocaleString()}
`).join('')}

ORGANIZATIONAL ROLES
${'-'.repeat(80)}
${roles.map((role, i) => `
${i + 1}. ${role.title || 'Untitled Position'}
   Department: ${role.department}
   Level: ${role.level.charAt(0).toUpperCase() + role.level.slice(1)}
   Reports To: ${role.reportsTo}
   Headcount: ${role.headcount}
   UK-Based: ${role.ukBased ? 'Yes' : 'No'}
   FTE: ${role.fte}
   Salary: £${role.salary.toLocaleString()} per person (Total: £${(role.salary * role.headcount).toLocaleString()})
   Growth Phase: Phase ${role.growthPhase}
   Priority: ${role.priority.charAt(0).toUpperCase() + role.priority.slice(1)}
   
   Responsibilities:
   ${role.responsibilities || 'Not defined'}
   
   Required Skills:
   ${role.requiredSkills || 'Not defined'}
`).join('')}

GROWTH PHASES
${'-'.repeat(80)}
${growthPhases.map(gp => `
Phase ${gp.phase}: ${gp.timeline}
Team Size Target: ${gp.teamSize}
Budget: £${gp.budget.toLocaleString()}

Objectives:
${gp.objectives || 'Not defined'}

Key Hires:
${gp.keyHires || 'Not defined'}

Planned Roles: ${roles.filter(r => r.growthPhase === gp.phase).reduce((sum, r) => sum + r.headcount, 0)}
`).join('')}

ORGANIZATIONAL STRUCTURE
${'-'.repeat(80)}
Management Levels: ${orgStructure.managementLevels}
Span of Control: ${orgStructure.spanOfControl}

Reporting Structure:
${orgStructure.reportingStructure || 'Not documented'}

Culture & Values:
${orgStructure.cultureValues || 'Not documented'}

RESOURCE ALLOCATION BY DEPARTMENT
${'-'.repeat(80)}
${getDepartmentData().map(dept => 
  `${dept.name}: ${dept.headcount} people, £${(dept.allocated * 1000).toLocaleString()} allocated / £${(dept.budget * 1000).toLocaleString()} budgeted`
).join('\n')}

HIERARCHY DISTRIBUTION
${'-'.repeat(80)}
${getHierarchyData().map(item => `${item.level}: ${item.count} people`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA COMPLIANCE NOTES
${'-'.repeat(80)}
- Minimum 2 FTE UK jobs required by Year 3 (mandatory criterion)
- Endorsing bodies favour 10+ UK jobs within 3 years
- All roles must be genuine skilled positions with clear justification
- Salary levels should meet Skilled Worker visa thresholds (£25,600+)
- Link organizational growth to business plan milestones and revenue projections
- Document recruitment strategy, retention plans, and career development
- Demonstrate diversity, inclusion, and culture-building commitments
- Ensure financial projections support planned team growth
- Show clear reporting lines and organizational hierarchy
- Maintain consistency across all visa application documents

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `org-designer-report-${Date.now()}.txt`;
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
            <h1 className="text-xl font-bold mb-2" data-testid="heading-org-designer">Organization Designer</h1>
            <p className="text-lg text-muted-foreground">Design scalable team structure with departments, roles, and growth phases</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="org-designer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={handleSmartTips}
            onActionPlan={handleActionPlan}
            getSerializedState={getSerializedState}
            toolName="Organization Designer"
          />

          <div className="flex justify-end mt-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <div className="mt-6">
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={(answers) => {
                if (answers.companyOverview) {
                  setOrgStructure(prev => ({ ...prev, companyName: answers.companyOverview.split(',')[0] || '' }));
                }
                if (answers.departments) {
                  const deptLines = answers.departments.split('\n').filter(l => l.trim());
                  if (deptLines.length > 0) {
                    const newDepts = deptLines.map((line, i) => ({
                      id: (Date.now() + i).toString(),
                      name: line.split('(')[0]?.trim() || line,
                      purpose: line.includes('(') ? line.split('(')[1]?.replace(')', '') || '' : '',
                      headcount: 0,
                      budget: 0,
                      priority: 'medium' as const
                    }));
                    setDepartments([departments[0], ...newDepts]);
                  }
                }
                if (answers.cultureValues) {
                  setOrgStructure(prev => ({ ...prev, cultureValues: answers.cultureValues }));
                }
                if (answers.reportingStructure) {
                  setOrgStructure(prev => ({ ...prev, reportingStructure: answers.reportingStructure }));
                }
                setMode('traditional');
              }} userTier={userTier} />
            </div>
          ) : (
          <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-org-designer">
              <TabsTrigger value="structure" data-testid="tab-structure">Structure</TabsTrigger>
              <TabsTrigger value="roles" data-testid="tab-roles">Roles</TabsTrigger>
              <TabsTrigger value="growth" data-testid="tab-growth">Growth Phases</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">Total Headcount</p>
                      <p className="text-xl font-bold" data-testid="text-total-headcount">{totalHeadcount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={totalUkFTE >= 2 ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-muted-foreground mb-2">UK FTE</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-uk-fte">{totalUkFTE.toFixed(1)}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {totalUkFTE >= 2 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                        <span className="text-sm">{totalUkFTE >= 2 ? 'Meets Requirement' : 'Below Requirement'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                      <p className="text-sm text-muted-foreground mb-2">Salary Cost</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-salary-cost">£{Math.round(totalSalaryCost / 1000)}k</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">Design Score</p>
                      <p className="text-xl font-bold text-primary" data-testid="text-design-score">{designScore}%</p>
                      <Progress value={designScore} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {totalUkFTE < 2 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    CRITICAL: Your plan shows {totalUkFTE.toFixed(1)} UK FTE, but the UK Innovation Visa requires minimum 2 FTE UK jobs by Year 3. Add more UK-based roles to meet requirements.
                  </AlertDescription>
                </Alert>
              )}

              {totalUkFTE >= 2 && totalUkFTE < 10 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You meet the 2 FTE minimum, but endorsing bodies favour plans demonstrating 10+ UK jobs within 3 years. Consider expanding UK job creation.
                  </AlertDescription>
                </Alert>
              )}

              {totalUkFTE >= 10 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent! Your plan demonstrates {totalUkFTE.toFixed(1)} UK FTE jobs - well above the 2 FTE minimum and showing strong job creation commitment.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Core organizational details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={orgStructure.companyName}
                        onChange={(e) => setOrgStructure({ ...orgStructure, companyName: e.target.value })}
                        placeholder="Your company name"
                        data-testid="input-company-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-size">Current Team Size</Label>
                      <Input
                        id="current-size"
                        type="number"
                        value={orgStructure.currentSize || ''}
                        onChange={(e) => setOrgStructure({ ...orgStructure, currentSize: parseInt(e.target.value) || 0 })}
                        placeholder="Current headcount"
                        data-testid="input-current-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-size">Target Size (Year 3)</Label>
                      <Input
                        id="target-size"
                        type="number"
                        value={orgStructure.targetSize || ''}
                        onChange={(e) => setOrgStructure({ ...orgStructure, targetSize: parseInt(e.target.value) || 0 })}
                        placeholder="3-year target headcount"
                        data-testid="input-target-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="management-levels">Management Levels</Label>
                      <Input
                        id="management-levels"
                        type="number"
                        value={orgStructure.managementLevels || ''}
                        onChange={(e) => setOrgStructure({ ...orgStructure, managementLevels: parseInt(e.target.value) || 0 })}
                        placeholder="Number of levels"
                        data-testid="input-management-levels"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="span-of-control">Span of Control</Label>
                    <Input
                      id="span-of-control"
                      value={orgStructure.spanOfControl}
                      onChange={(e) => setOrgStructure({ ...orgStructure, spanOfControl: e.target.value })}
                      placeholder="e.g., Average 5-7 direct reports per manager"
                      data-testid="input-span-of-control"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reporting-structure">Reporting Structure & Hierarchy</Label>
                    <Textarea
                      id="reporting-structure"
                      value={orgStructure.reportingStructure}
                      onChange={(e) => setOrgStructure({ ...orgStructure, reportingStructure: e.target.value })}
                      placeholder="Describe reporting lines, decision-making flow, and organizational hierarchy..."
                      rows={4}
                      data-testid="textarea-reporting-structure"
                    />
                  </div>

                  <div>
                    <Label htmlFor="culture-values">Culture & Values</Label>
                    <Textarea
                      id="culture-values"
                      value={orgStructure.cultureValues}
                      onChange={(e) => setOrgStructure({ ...orgStructure, cultureValues: e.target.value })}
                      placeholder="Define company culture, core values, and employee value proposition..."
                      rows={4}
                      data-testid="textarea-culture-values"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Departments</CardTitle>
                      <CardDescription>Functional areas and resource allocation</CardDescription>
                    </div>
                    <Button onClick={addDepartment} size="sm" data-testid="button-add-department">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departments.map((dept, index) => (
                    <Card key={dept.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`dept-name-${index}`}>Department Name</Label>
                            <Input
                              id={`dept-name-${index}`}
                              value={dept.name}
                              onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                              placeholder="e.g., Engineering, Sales"
                              data-testid={`input-dept-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`dept-headcount-${index}`}>Target Headcount</Label>
                            <Input
                              id={`dept-headcount-${index}`}
                              type="number"
                              value={dept.headcount || ''}
                              onChange={(e) => updateDepartment(dept.id, 'headcount', parseInt(e.target.value) || 0)}
                              data-testid={`input-dept-headcount-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`dept-budget-${index}`}>Budget (£)</Label>
                            <Input
                              id={`dept-budget-${index}`}
                              type="number"
                              value={dept.budget || ''}
                              onChange={(e) => updateDepartment(dept.id, 'budget', parseInt(e.target.value) || 0)}
                              data-testid={`input-dept-budget-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`dept-priority-${index}`}>Priority</Label>
                            <select
                              id={`dept-priority-${index}`}
                              value={dept.priority}
                              onChange={(e) => updateDepartment(dept.id, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-dept-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`dept-purpose-${index}`}>Purpose & Strategic Importance</Label>
                          <Textarea
                            id={`dept-purpose-${index}`}
                            value={dept.purpose}
                            onChange={(e) => updateDepartment(dept.id, 'purpose', e.target.value)}
                            placeholder="Define department purpose, key functions, and strategic contribution..."
                            rows={2}
                            data-testid={`textarea-dept-purpose-${index}`}
                          />
                        </div>

                        {dept.id !== '1' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeDepartment(dept.id)}
                            data-testid={`button-remove-dept-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Department
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Resource Distribution</CardTitle>
                  <CardDescription>Headcount and budget allocation across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  {getDepartmentData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDepartmentData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number, name: string) => {
                            if (name === 'budget' || name === 'allocated') return [`£${value}k`, name === 'budget' ? 'Budget' : 'Allocated'];
                            return [value, 'Headcount'];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="headcount" fill="#41B6E6" name="Headcount" />
                        <Bar yAxisId="right" dataKey="budget" fill="#10b981" name="Budget (£k)" />
                        <Bar yAxisId="right" dataKey="allocated" fill="#005EB8" name="Allocated (£k)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add departments and roles to see distribution</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Role Definitions</CardTitle>
                      <CardDescription>Detailed position specifications and requirements</CardDescription>
                    </div>
                    <Button onClick={addRole} size="sm" data-testid="button-add-role">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roles.map((role, index) => (
                    <Card key={role.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`role-title-${index}`}>Job Title</Label>
                            <Input
                              id={`role-title-${index}`}
                              value={role.title}
                              onChange={(e) => updateRole(role.id, 'title', e.target.value)}
                              placeholder="e.g., Senior Software Engineer"
                              data-testid={`input-role-title-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-department-${index}`}>Department</Label>
                            <select
                              id={`role-department-${index}`}
                              value={role.department}
                              onChange={(e) => updateRole(role.id, 'department', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-role-department-${index}`}
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`role-level-${index}`}>Level</Label>
                            <select
                              id={`role-level-${index}`}
                              value={role.level}
                              onChange={(e) => updateRole(role.id, 'level', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-role-level-${index}`}
                            >
                              <option value="executive">Executive</option>
                              <option value="director">Director</option>
                              <option value="manager">Manager</option>
                              <option value="senior">Senior</option>
                              <option value="mid">Mid</option>
                              <option value="junior">Junior</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-4">
                          <div>
                            <Label htmlFor={`role-reports-${index}`}>Reports To</Label>
                            <Input
                              id={`role-reports-${index}`}
                              value={role.reportsTo}
                              onChange={(e) => updateRole(role.id, 'reportsTo', e.target.value)}
                              placeholder="Position/Name"
                              data-testid={`input-role-reports-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-salary-${index}`}>Salary (£)</Label>
                            <Input
                              id={`role-salary-${index}`}
                              type="number"
                              value={role.salary || ''}
                              onChange={(e) => updateRole(role.id, 'salary', parseInt(e.target.value) || 0)}
                              data-testid={`input-role-salary-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-headcount-${index}`}>Headcount</Label>
                            <Input
                              id={`role-headcount-${index}`}
                              type="number"
                              value={role.headcount || ''}
                              onChange={(e) => updateRole(role.id, 'headcount', parseInt(e.target.value) || 0)}
                              data-testid={`input-role-headcount-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-fte-${index}`}>FTE</Label>
                            <Input
                              id={`role-fte-${index}`}
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={role.fte || ''}
                              onChange={(e) => updateRole(role.id, 'fte', parseFloat(e.target.value) || 0)}
                              data-testid={`input-role-fte-${index}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={role.ukBased}
                                onChange={(e) => updateRole(role.id, 'ukBased', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-uk-based-${index}`}
                              />
                              <span className="text-sm">UK-Based</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`role-phase-${index}`}>Growth Phase</Label>
                            <select
                              id={`role-phase-${index}`}
                              value={role.growthPhase}
                              onChange={(e) => updateRole(role.id, 'growthPhase', parseInt(e.target.value) as 1 | 2 | 3)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-role-phase-${index}`}
                            >
                              <option value="1">Phase 1</option>
                              <option value="2">Phase 2</option>
                              <option value="3">Phase 3</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`role-priority-${index}`}>Priority</Label>
                            <select
                              id={`role-priority-${index}`}
                              value={role.priority}
                              onChange={(e) => updateRole(role.id, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-role-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`role-responsibilities-${index}`}>Key Responsibilities</Label>
                          <Textarea
                            id={`role-responsibilities-${index}`}
                            value={role.responsibilities}
                            onChange={(e) => updateRole(role.id, 'responsibilities', e.target.value)}
                            placeholder="Define core responsibilities, deliverables, and success metrics for this role..."
                            rows={3}
                            data-testid={`textarea-role-responsibilities-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`role-skills-${index}`}>Required Skills & Qualifications</Label>
                          <Textarea
                            id={`role-skills-${index}`}
                            value={role.requiredSkills}
                            onChange={(e) => updateRole(role.id, 'requiredSkills', e.target.value)}
                            placeholder="List required technical skills, experience, qualifications, and competencies..."
                            rows={2}
                            data-testid={`textarea-role-skills-${index}`}
                          />
                        </div>

                        {role.id !== '1' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRole(role.id)}
                            data-testid={`button-remove-role-${index}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Role
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organizational Hierarchy</CardTitle>
                  <CardDescription>Distribution across seniority levels</CardDescription>
                </CardHeader>
                <CardContent>
                  {getHierarchyData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getHierarchyData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="level" className="text-xs" width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number) => [value, 'Headcount']}
                        />
                        <Bar dataKey="count" fill="#41B6E6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add roles to see hierarchy distribution</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Phase Planning</CardTitle>
                  <CardDescription>3-year scaling roadmap with hiring and budget milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {growthPhases.map((phase, index) => (
                    <Card key={phase.phase} className="p-4 border-l-4" style={{ borderColor: CHART_COLORS[index] }}>
                      <h3 className="font-bold text-lg mb-4">Phase {phase.phase}: {phase.timeline}</h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`phase-timeline-${index}`}>Timeline</Label>
                            <Input
                              id={`phase-timeline-${index}`}
                              value={phase.timeline}
                              onChange={(e) => updateGrowthPhase(phase.phase, 'timeline', e.target.value)}
                              placeholder="e.g., Months 1-12"
                              data-testid={`input-phase-timeline-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-size-${index}`}>Team Size Target</Label>
                            <Input
                              id={`phase-size-${index}`}
                              type="number"
                              value={phase.teamSize || ''}
                              onChange={(e) => updateGrowthPhase(phase.phase, 'teamSize', parseInt(e.target.value) || 0)}
                              data-testid={`input-phase-size-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`phase-budget-${index}`}>Budget (£)</Label>
                            <Input
                              id={`phase-budget-${index}`}
                              type="number"
                              value={phase.budget || ''}
                              onChange={(e) => updateGrowthPhase(phase.phase, 'budget', parseInt(e.target.value) || 0)}
                              data-testid={`input-phase-budget-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`phase-objectives-${index}`}>Objectives & Milestones</Label>
                          <Textarea
                            id={`phase-objectives-${index}`}
                            value={phase.objectives}
                            onChange={(e) => updateGrowthPhase(phase.phase, 'objectives', e.target.value)}
                            placeholder="Define key business objectives, product milestones, and success criteria for this phase..."
                            rows={3}
                            data-testid={`textarea-phase-objectives-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`phase-hires-${index}`}>Key Hires & Roles</Label>
                          <Textarea
                            id={`phase-hires-${index}`}
                            value={phase.keyHires}
                            onChange={(e) => updateGrowthPhase(phase.phase, 'keyHires', e.target.value)}
                            placeholder="List critical positions to hire, their timing, and strategic importance..."
                            rows={2}
                            data-testid={`textarea-phase-hires-${index}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 bg-accent/10 dark:bg-accent/5 rounded">
                          <div>
                            <p className="text-sm text-muted-foreground">Planned Roles</p>
                            <p className="text-lg font-bold" data-testid={`text-phase-roles-${index}`}>
                              {roles.filter(r => r.growthPhase === phase.phase).reduce((sum, r) => sum + r.headcount, 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Planned Cost</p>
                            <p className="text-lg font-bold" data-testid={`text-phase-cost-${index}`}>
                              £{Math.round(roles.filter(r => r.growthPhase === phase.phase).reduce((sum, r) => sum + (r.salary * r.headcount), 0) / 1000)}k
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Trajectory</CardTitle>
                  <CardDescription>Team size and budget evolution across phases</CardDescription>
                </CardHeader>
                <CardContent>
                  {getGrowthProjectionData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={getGrowthProjectionData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="phase" className="text-xs" />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          formatter={(value: number, name: string) => {
                            if (name === 'budget') return [`£${value}k`, 'Budget'];
                            return [value, name === 'teamSize' ? 'Target Size' : 'Planned Roles'];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="roles" fill="#41B6E6" name="Planned Roles" />
                        <Line yAxisId="left" dataKey="teamSize" stroke="#10b981" strokeWidth={2} name="Target Size" />
                        <Line yAxisId="right" dataKey="budget" stroke="#005EB8" strokeWidth={2} name="Budget (£k)" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Configure growth phases to see trajectory</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Structure Complexity Timeline</CardTitle>
                    <CardDescription>Organizational complexity evolution across growth phases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getStructureComplexityData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={getStructureComplexityData()}>
                          <defs>
                            <linearGradient id="complexityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#41B6E6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#41B6E6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="phase" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number, name: string) => {
                              if (name === 'avgSalary') return [`£${value}k`, 'Avg Salary'];
                              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="complexity" stroke="#41B6E6" fillOpacity={1} fill="url(#complexityGradient)" name="Complexity Score" />
                          <Area type="monotone" dataKey="departments" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Departments" />
                          <Area type="monotone" dataKey="roles" stroke="#005EB8" fill="#005EB8" fillOpacity={0.3} name="Roles" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add roles to see complexity evolution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Distribution by Department</CardTitle>
                    <CardDescription>Seniority levels across departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getRoleDistributionData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getRoleDistributionData()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="department" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Bar dataKey="Executive" stackId="a" fill={CHART_COLORS[0]} />
                          <Bar dataKey="Director" stackId="a" fill={CHART_COLORS[1]} />
                          <Bar dataKey="Manager" stackId="a" fill={CHART_COLORS[2]} />
                          <Bar dataKey="Senior" stackId="a" fill={CHART_COLORS[3]} />
                          <Bar dataKey="Mid" stackId="a" fill={CHART_COLORS[4]} />
                          <Bar dataKey="Junior" stackId="a" fill={CHART_COLORS[5]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add roles to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>Salary budget distribution by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getResourceAllocationData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getResourceAllocationData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${(entry.value / 1000).toFixed(0)}k`}
                          >
                            {getResourceAllocationData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [`£${value.toLocaleString()}`, 'Allocation']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add roles to see resource allocation</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Headcount Growth Projection</CardTitle>
                    <CardDescription>Cumulative team growth over 3 years</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getStructureComplexityData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getStructureComplexityData()}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="phase" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="headcount" stroke="#41B6E6" strokeWidth={3} name="Total Headcount" dot={{ r: 6 }} />
                          <Line type="monotone" dataKey="roles" stroke="#10b981" strokeWidth={2} name="Unique Roles" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add roles to see growth projection</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Design Completeness Metrics</CardTitle>
                  <CardDescription>Track organizational design quality across key dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/10 dark:bg-accent/5 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Roles with Full Details</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">
                          {roles.filter(r => r.title && r.responsibilities.length > 50 && r.requiredSkills.length > 20).length}/{roles.length}
                        </p>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {roles.length > 0 ? Math.round((roles.filter(r => r.title && r.responsibilities.length > 50 && r.requiredSkills.length > 20).length / roles.length) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={roles.length > 0 ? (roles.filter(r => r.title && r.responsibilities.length > 50 && r.requiredSkills.length > 20).length / roles.length) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>

                    <div className="p-4 bg-accent/10 dark:bg-accent/5 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Departments with Purpose</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">
                          {departments.filter(d => d.purpose.length > 30).length}/{departments.length}
                        </p>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {departments.length > 0 ? Math.round((departments.filter(d => d.purpose.length > 30).length / departments.length) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={departments.length > 0 ? (departments.filter(d => d.purpose.length > 30).length / departments.length) * 100 : 0} 
                        className="mt-2" 
                      />
                    </div>

                    <div className="p-4 bg-accent/10 dark:bg-accent/5 rounded">
                      <p className="text-sm text-muted-foreground mb-2">Growth Phases Completed</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">
                          {growthPhases.filter(gp => gp.objectives.length > 50 && gp.keyHires.length > 30).length}/3
                        </p>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.round((growthPhases.filter(gp => gp.objectives.length > 50 && gp.keyHires.length > 30).length / 3) * 100)}%
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={(growthPhases.filter(gp => gp.objectives.length > 50 && gp.keyHires.length > 30).length / 3) * 100} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights to strengthen your organizational design</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} className={tip.includes('CRITICAL') ? 'border-destructive' : ''}>
                        <AlertTriangle className={`h-4 w-4 ${tip.includes('CRITICAL') ? 'text-destructive' : ''}`} />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Compliance Requirements</CardTitle>
                  <CardDescription>UK Innovator Founder Visa organizational criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Minimum 2 FTE UK Jobs by Year 3</p>
                        <p className="text-sm text-muted-foreground">Mandatory requirement - must demonstrate genuine UK job creation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Skilled Positions Only</p>
                        <p className="text-sm text-muted-foreground">All roles must meet minimum skill level requirements (RQF Level 3+)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Clear Role Definitions</p>
                        <p className="text-sm text-muted-foreground">Detailed job descriptions with responsibilities and required qualifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Financial Viability</p>
                        <p className="text-sm text-muted-foreground">Team costs must align with revenue projections and funding</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Organizational Structure</p>
                        <p className="text-sm text-muted-foreground">Clear reporting lines and management hierarchy</p>
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
                  <CardDescription>Structured implementation roadmap for organizational design</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`px-3 py-1 rounded text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-destructive/10 text-destructive dark:bg-destructive/20' :
                            item.priority === 'High' ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' :
                            'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1" data-testid={`action-week-${index}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`action-task-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
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
