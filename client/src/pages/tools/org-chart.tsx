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
import { CheckCircle2, AlertTriangle, TrendingUp, Users, Building2, DollarSign, Target, Plus, Trash2, Calendar } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type OrgPosition = {
  id: string;
  title: string;
  department: string;
  level: number;
  reportsTo: string;
  salary: number;
  headcount: number;
  ukBased: boolean;
  fte: number;
  responsibilities: string;
  requiredSkills: string;
  growthYear: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

type OrgStructure = {
  companyName: string;
  currentTeamSize: number;
  targetTeamSize: number;
  year1UkJobs: number;
  year2UkJobs: number;
  year3UkJobs: number;
  reportingStructure: string;
  managementLevels: number;
  spanOfControl: string;
};

type GrowthPlan = {
  year1Headcount: number;
  year2Headcount: number;
  year3Headcount: number;
  scalingStrategy: string;
  retentionPlan: string;
  successionPlanning: string;
  diversityGoals: string;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

export default function OrgChart() {
  const [activeTab, setActiveTab] = useState('structure');
  const [savedDate, setSavedDate] = useState('');

  const [positions, setPositions] = useState<OrgPosition[]>([
    {
      id: '1',
      title: 'Chief Executive Officer',
      department: 'Executive',
      level: 1,
      reportsTo: 'Board',
      salary: 120000,
      headcount: 1,
      ukBased: true,
      fte: 1,
      responsibilities: 'Overall company strategy and execution',
      requiredSkills: 'Leadership, Vision, Strategy',
      growthYear: 0,
      priority: 'critical'
    }
  ]);

  const [orgStructure, setOrgStructure] = useState<OrgStructure>({
    companyName: '',
    currentTeamSize: 1,
    targetTeamSize: 0,
    year1UkJobs: 0,
    year2UkJobs: 0,
    year3UkJobs: 0,
    reportingStructure: '',
    managementLevels: 3,
    spanOfControl: ''
  });

  const [growthPlan, setGrowthPlan] = useState<GrowthPlan>({
    year1Headcount: 0,
    year2Headcount: 0,
    year3Headcount: 0,
    scalingStrategy: '',
    retentionPlan: '',
    successionPlanning: '',
    diversityGoals: ''
  });

  const addPosition = () => {
    setPositions([...positions, {
      id: Date.now().toString(),
      title: '',
      department: '',
      level: 2,
      reportsTo: '1',
      salary: 60000,
      headcount: 1,
      ukBased: true,
      fte: 1,
      responsibilities: '',
      requiredSkills: '',
      growthYear: 1,
      priority: 'high'
    }]);
  };

  const updatePosition = (id: string, field: keyof OrgPosition, value: any) => {
    setPositions(positions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePosition = (id: string) => {
    if (id === '1') return;
    setPositions(positions.filter(p => p.id !== id));
  };

  const calculateOrgScore = (): number => {
    let score = 0;

    const totalUkFTE = positions.filter(p => p.ukBased).reduce((sum, p) => sum + (p.headcount * p.fte), 0);
    if (totalUkFTE >= 10) score += 25;
    else if (totalUkFTE >= 5) score += 15;
    else if (totalUkFTE >= 2) score += 10;

    const positionsWithDetails = positions.filter(p => 
      p.title && p.responsibilities.length > 50 && p.requiredSkills.length > 20
    ).length;
    if (positionsWithDetails >= positions.length * 0.8) score += 20;
    else if (positionsWithDetails >= positions.length * 0.5) score += 10;

    const departments = new Set(positions.filter(p => p.department).map(p => p.department));
    if (departments.size >= 5) score += 15;
    else if (departments.size >= 3) score += 10;

    const totalSalary = positions.reduce((sum, p) => sum + (p.salary * p.headcount), 0);
    if (totalSalary >= 500000) score += 10;
    else if (totalSalary >= 250000) score += 5;

    if (orgStructure.reportingStructure.length > 100) score += 10;
    if (orgStructure.spanOfControl.length > 50) score += 5;

    if (growthPlan.scalingStrategy.length > 100) score += 10;
    if (growthPlan.retentionPlan.length > 100) score += 10;
    if (growthPlan.successionPlanning.length > 80) score += 5;

    const year3FTE = orgStructure.year3UkJobs || totalUkFTE;
    if (year3FTE >= 2) score += 10;

    return Math.min(100, score);
  };

  const orgScore = calculateOrgScore();
  const totalHeadcount = positions.reduce((sum, p) => sum + p.headcount, 0);
  const totalSalaryCost = positions.reduce((sum, p) => sum + (p.salary * p.headcount), 0);
  const ukHeadcount = positions.filter(p => p.ukBased).reduce((sum, p) => sum + p.headcount, 0);
  const totalUkFTE = positions.filter(p => p.ukBased).reduce((sum, p) => sum + (p.headcount * p.fte), 0);

  const getDepartmentData = () => {
    const deptMap: Record<string, { headcount: number; salary: number }> = {};
    positions.forEach(p => {
      const dept = p.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { headcount: 0, salary: 0 };
      }
      deptMap[dept].headcount += p.headcount;
      deptMap[dept].salary += p.salary * p.headcount;
    });
    return Object.entries(deptMap).map(([name, data]) => ({
      name: name.substring(0, 15),
      headcount: data.headcount,
      salary: Math.round(data.salary / 1000)
    }));
  };

  const getDepartmentPieData = () => {
    const deptMap: Record<string, number> = {};
    positions.forEach(p => {
      const dept = p.department || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + p.headcount;
    });
    return Object.entries(deptMap).map(([name, value]) => ({
      name: name.substring(0, 20),
      value
    }));
  };

  const getHierarchyTreeData = () => {
    const deptMap: Record<string, { name: string; size: number; salary: number; ukJobs: number }> = {};
    positions.forEach(p => {
      const dept = p.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, size: 0, salary: 0, ukJobs: 0 };
      }
      deptMap[dept].size += p.headcount;
      deptMap[dept].salary += p.salary * p.headcount;
      if (p.ukBased) {
        deptMap[dept].ukJobs += p.headcount * p.fte;
      }
    });
    return Object.values(deptMap);
  };

  const getGrowthProjectionData = () => {
    const currentFTE = totalUkFTE;
    return [
      { year: 'Current', headcount: orgStructure.currentTeamSize || totalHeadcount, ukJobs: currentFTE, target: orgStructure.currentTeamSize || totalHeadcount },
      { year: 'Year 1', headcount: growthPlan.year1Headcount || (totalHeadcount + 2), ukJobs: orgStructure.year1UkJobs || (currentFTE + 1), target: growthPlan.year1Headcount || (totalHeadcount + 2) },
      { year: 'Year 2', headcount: growthPlan.year2Headcount || (totalHeadcount + 5), ukJobs: orgStructure.year2UkJobs || (currentFTE + 2), target: growthPlan.year2Headcount || (totalHeadcount + 5) },
      { year: 'Year 3', headcount: growthPlan.year3Headcount || (totalHeadcount + 10), ukJobs: orgStructure.year3UkJobs || (currentFTE + 3), target: orgStructure.targetTeamSize || (totalHeadcount + 10) }
    ];
  };

  const getLevelDistributionData = () => {
    const levelMap: Record<number, number> = {};
    positions.forEach(p => {
      levelMap[p.level] = (levelMap[p.level] || 0) + p.headcount;
    });
    return Object.entries(levelMap)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([level, count]) => ({
        level: `Level ${level}`,
        count,
        percentage: totalHeadcount > 0 ? Math.round((count / totalHeadcount) * 100) : 0
      }));
  };

  const getSerializedState = () => {
    return {
      positions,
      orgStructure,
      growthPlan,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('positions' in state) setPositions(state.positions);
    if ('orgStructure' in state) setOrgStructure(state.orgStructure);
    if ('growthPlan' in state) setGrowthPlan(state.growthPlan);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('org-chart-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('org-chart-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('org-chart-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    const year3FTE = orgStructure.year3UkJobs || totalUkFTE;
    if (year3FTE < 2) {
      tips.push("CRITICAL: UK Innovation Visa requires minimum 2 FTE UK jobs by Year 3. Your current plan shows " + year3FTE.toFixed(1) + " FTE - this does not meet mandatory requirements");
    }

    if (ukHeadcount < 10) {
      tips.push("While 2 FTE is the minimum, endorsing bodies favour plans demonstrating 10+ UK jobs within 3 years to show genuine job creation commitment");
    }

    const positionsWithoutDetails = positions.filter(p => !p.responsibilities || p.responsibilities.length < 50).length;
    if (positionsWithoutDetails > positions.length * 0.3) {
      tips.push("Define detailed responsibilities for all roles - specificity demonstrates genuine job creation rather than theoretical planning");
    }

    if (positions.filter(p => !p.requiredSkills || p.requiredSkills.length < 20).length > positions.length / 2) {
      tips.push("Document required skills for each position - this proves you're creating skilled roles eligible for visa sponsorship if needed");
    }

    const departments = new Set(positions.filter(p => p.department).map(p => p.department));
    if (departments.size < 3) {
      tips.push("Develop cross-functional team structure with at least 3-4 departments - demonstrates operational maturity and scalability");
    }

    if (!orgStructure.reportingStructure || orgStructure.reportingStructure.length < 50) {
      tips.push("Document clear reporting lines and organizational hierarchy - essential for demonstrating structured growth to endorsing bodies");
    }

    if (!growthPlan.scalingStrategy || growthPlan.scalingStrategy.length < 100) {
      tips.push("Create detailed 3-year scaling strategy - show endorsers how team growth aligns with business milestones and revenue targets");
    }

    if (!growthPlan.retentionPlan || growthPlan.retentionPlan.length < 80) {
      tips.push("Define employee retention strategies - high turnover undermines job creation claims and visa compliance requirements");
    }

    if (totalSalaryCost > 0 && totalSalaryCost < 150000) {
      tips.push("Current salary budget may be insufficient - ensure compensation is competitive to attract skilled workers and meets visa sponsor thresholds");
    }

    if (positions.some(p => p.ukBased && p.salary > 0 && p.salary < 25000)) {
      tips.push("Some UK roles fall below £25,000 minimum - this may not meet Skilled Worker visa thresholds if sponsorship is required");
    }

    if (orgStructure.managementLevels < 2) {
      tips.push("Consider defining multiple management levels - flat structures are great but demonstrating career progression enhances retention evidence");
    }

    if (!growthPlan.successionPlanning || growthPlan.successionPlanning.length < 50) {
      tips.push("Document succession planning for key roles - demonstrates long-term thinking and reduces founder dependency concerns");
    }

    if (!growthPlan.diversityGoals || growthPlan.diversityGoals.length < 40) {
      tips.push("Articulate diversity and inclusion commitments - modern employers demonstrate equitable hiring practices to attract top talent");
    }

    if (positions.filter(p => p.priority === 'critical').length === 0) {
      tips.push("Identify critical roles essential for business plan execution - helps endorsing bodies understand which hires are make-or-break");
    }

    if (year3FTE >= 2 && orgScore >= 70) {
      tips.push("Strong organizational plan - ensure your financial projections support this team growth and demonstrate sustainable unit economics");
    }

    if (positions.filter(p => p.ukBased).length < 3) {
      tips.push("Demonstrate commitment to UK job market by creating multiple UK-based positions across different skill levels and departments");
    }

    if (!orgStructure.spanOfControl || orgStructure.spanOfControl.length < 30) {
      tips.push("Define span of control principles - shows you've thought through management ratios and operational efficiency at scale");
    }

    if (totalSalaryCost > 0 && totalSalaryCost > 1000000 && growthPlan.retentionPlan.length < 100) {
      tips.push("High salary budget without documented retention plan is a red flag - show endorsers how you'll keep this expensive talent engaged");
    }

    if (departments.size > 0 && positions.filter(p => p.reportsTo && p.reportsTo.length > 0).length < positions.length * 0.7) {
      tips.push("Most positions lack clear reporting lines - endorsing bodies need to see structured organizational hierarchy, not flat chaos");
    }

    if (growthPlan.year1Headcount === 0 && growthPlan.year2Headcount === 0 && growthPlan.year3Headcount === 0) {
      tips.push("Define year-by-year headcount targets - generic 'we'll hire when we need to' doesn't demonstrate strategic workforce planning");
    }

    if (positions.filter(p => p.growthYear === 0).length > 3) {
      tips.push("Too many 'Year 0' positions suggests you're already fully staffed - endorsing bodies want to see job creation over the 3-year period");
    }

    return tips.slice(0, 20);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Define all roles required for Year 1-3 growth with detailed job descriptions and reporting lines", priority: "Critical" },
      { week: "Week 1-2", action: "Document organizational structure showing clear hierarchy, departments, and management levels", priority: "Critical" },
      { week: "Week 2", action: "Calculate full-loaded salary costs including NI, pension, and benefits for all planned positions", priority: "High" },
      { week: "Week 2", action: "Ensure minimum 2 FTE UK jobs by Year 3 requirement is met and clearly documented", priority: "Critical" },
      { week: "Week 2-3", action: "Link each role to specific business plan milestones showing why each hire is essential", priority: "High" },
      { week: "Week 3", action: "Prepare skills requirements for each role demonstrating these are genuinely skilled positions", priority: "High" },
      { week: "Week 3", action: "Document recruitment strategy, timelines, and sourcing channels for each position", priority: "Medium" },
      { week: "Week 3-4", action: "Create retention plan with compensation benchmarks, career progression, and culture initiatives", priority: "High" },
      { week: "Week 4", action: "Develop diversity and inclusion targets aligned with modern UK employment best practices", priority: "Medium" },
      { week: "Week 4", action: "Prepare succession planning for critical roles to demonstrate business continuity", priority: "High" },
      { week: "Ongoing", action: "Review organizational chart against actual hiring progress and update projections quarterly", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - ORGANIZATIONAL CHART & TEAM STRUCTURE ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(90)}

ORGANIZATIONAL MATURITY SCORE: ${orgScore}%
${'-'.repeat(90)}

COMPANY OVERVIEW
${'-'.repeat(90)}
Company Name: ${orgStructure.companyName || 'Not specified'}
Current Team Size: ${orgStructure.currentTeamSize || totalHeadcount} people
Target Team Size (Year 3): ${orgStructure.targetTeamSize || 'Not specified'}
Management Levels: ${orgStructure.managementLevels}

TEAM COMPOSITION
${'-'.repeat(90)}
Total Headcount: ${totalHeadcount}
UK-Based Employees: ${ukHeadcount}
Total UK FTE: ${totalUkFTE.toFixed(1)}
Total Salary Cost: £${totalSalaryCost.toLocaleString()}

UK JOB CREATION PROJECTION
${'-'.repeat(90)}
Year 1 UK Jobs: ${orgStructure.year1UkJobs || 'Not specified'}
Year 2 UK Jobs: ${orgStructure.year2UkJobs || 'Not specified'}
Year 3 UK Jobs: ${orgStructure.year3UkJobs || totalUkFTE.toFixed(1)} FTE
Visa Requirement Status: ${(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? 'MEETS REQUIREMENT (2+ FTE)' : 'BELOW REQUIREMENT'}

POSITIONS BREAKDOWN
${'-'.repeat(90)}
${positions.map((pos, i) => `
${i + 1}. ${pos.title || 'Untitled Position'}
   Department: ${pos.department || 'Unassigned'}
   Level: ${pos.level} | Reports To: ${pos.reportsTo}
   Headcount: ${pos.headcount} | UK-Based: ${pos.ukBased ? 'YES' : 'NO'} | FTE: ${pos.fte}
   Salary: £${pos.salary.toLocaleString()} | Priority: ${pos.priority.toUpperCase()}
   Growth Year: Year ${pos.growthYear}
   Responsibilities: ${pos.responsibilities || 'Not defined'}
   Required Skills: ${pos.requiredSkills || 'Not defined'}
`).join('')}

DEPARTMENT DISTRIBUTION
${'-'.repeat(90)}
${getDepartmentData().map(dept => `${dept.name}: ${dept.headcount} people (£${dept.salary}k salary budget)`).join('\n')}

ORGANIZATIONAL STRUCTURE
${'-'.repeat(90)}
Reporting Structure:
${orgStructure.reportingStructure || 'Not documented'}

Span of Control Guidelines:
${orgStructure.spanOfControl || 'Not documented'}

GROWTH PLAN
${'-'.repeat(90)}
Year 1 Headcount Target: ${growthPlan.year1Headcount || 'Not specified'}
Year 2 Headcount Target: ${growthPlan.year2Headcount || 'Not specified'}
Year 3 Headcount Target: ${growthPlan.year3Headcount || 'Not specified'}

Scaling Strategy:
${growthPlan.scalingStrategy || 'Not documented'}

Retention Plan:
${growthPlan.retentionPlan || 'Not documented'}

Succession Planning:
${growthPlan.successionPlanning || 'Not documented'}

Diversity & Inclusion Goals:
${growthPlan.diversityGoals || 'Not documented'}

SMART RECOMMENDATIONS (${getSmartTips().length} Tips)
${'-'.repeat(90)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(90)}
${generateActionPlan().map(item => `[${item.priority.toUpperCase()}] ${item.week}: ${item.action}`).join('\n\n')}

UK VISA COMPLIANCE NOTES
${'-'.repeat(90)}
- Innovator Founder Visa requires creation of at least 2 FTE UK jobs by Year 3
- FTE = Full-Time Equivalent (0.5 = part-time, 1.0 = full-time)
- Endorsing bodies favour 10+ UK jobs to demonstrate genuine job creation commitment
- All UK roles should be genuinely skilled positions with clear responsibilities
- Salary levels must meet Skilled Worker visa thresholds if sponsorship required (typically £25,600+)
- Document clear reporting lines and organizational hierarchy
- Link each role to specific business milestones in your business plan
- Demonstrate structured growth aligned with revenue projections
- Include retention strategies to show sustainable job creation
- Consider succession planning for key roles

ORGANIZATIONAL MATURITY SCORING CRITERIA
${'-'.repeat(90)}
- UK FTE Jobs (up to 25 points): ${totalUkFTE.toFixed(1)} FTE UK jobs
- Position Details (up to 20 points): ${positions.filter(p => p.title && p.responsibilities.length > 50 && p.requiredSkills.length > 20).length}/${positions.length} positions fully documented
- Department Diversity (up to 15 points): ${new Set(positions.filter(p => p.department).map(p => p.department)).size} unique departments
- Salary Budget (up to 10 points): £${totalSalaryCost.toLocaleString()} total compensation
- Documentation Quality (up to 35 points): Based on reporting structure, scaling strategy, retention plan, succession planning

${'='.repeat(90)}
Report generated by UK Innovator Founder Visa Assistant
This organizational chart demonstrates your commitment to UK job creation and structured business growth.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `org-chart-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, size, salary, ukJobs } = props;
    if (width < 40 || height < 30) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[Math.floor(Math.random() * COLORS.length)],
            stroke: '#fff',
            strokeWidth: 2,
            opacity: 0.8
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 8, 14)}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 5}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 10, 11)}
        >
          {size} people
        </text>
        {ukJobs > 0 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 18}
            textAnchor="middle"
            fill="#fff"
            fontSize={Math.min(width / 11, 10)}
          >
            UK: {ukJobs.toFixed(1)} FTE
          </text>
        )}
      </g>
    );
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-org-chart">Organizational Chart Builder</h1>
            <p className="text-lg text-muted-foreground">Design your team structure and demonstrate UK job creation commitment</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="org-chart"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Organizational Chart Builder"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6" data-testid="tabs-org-chart">
              <TabsTrigger value="structure" data-testid="tab-structure">Structure</TabsTrigger>
              <TabsTrigger value="positions" data-testid="tab-positions">Positions</TabsTrigger>
              <TabsTrigger value="growth" data-testid="tab-growth">Growth Plan</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organizational Maturity Score</CardTitle>
                  <CardDescription>Overall assessment of your organizational planning quality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={orgScore >= 70 ? "border-green-500" : orgScore >= 40 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Maturity Score</p>
                          <p className="text-4xl font-bold" data-testid="text-maturity-score">{orgScore}%</p>
                          <Progress value={orgScore} className="mt-3" data-testid="progress-maturity-score" />
                          <p className="text-sm mt-2">
                            {orgScore >= 70 ? 'Strong Plan' : orgScore >= 40 ? 'Needs Improvement' : 'Critical Gaps'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Year 3 UK FTE</p>
                          <p className="text-4xl font-bold text-primary" data-testid="text-year3-fte">
                            {(orgStructure.year3UkJobs || totalUkFTE).toFixed(1)}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-meets-requirement" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-destructive" data-testid="icon-below-requirement" />
                            )}
                            <span className="text-sm">{(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? 'Meets Requirement' : 'Below Minimum'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Team Size</p>
                          <p className="text-4xl font-bold" data-testid="text-total-headcount">{totalHeadcount}</p>
                          <p className="text-sm text-muted-foreground mt-2">UK: {ukHeadcount} ({totalUkFTE.toFixed(1)} FTE)</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {(orgStructure.year3UkJobs || totalUkFTE) < 2 && (
                    <Alert variant="destructive" data-testid="alert-uk-jobs-requirement">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        CRITICAL: UK Innovation Visa requires minimum 2 FTE UK jobs by Year 3. Your current plan shows {(orgStructure.year3UkJobs || totalUkFTE).toFixed(1)} FTE.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(orgStructure.year3UkJobs || totalUkFTE) >= 2 && ukHeadcount < 10 && (
                    <Alert data-testid="alert-uk-jobs-suggestion">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        While you meet the 2 FTE minimum, endorsing bodies favour plans showing 10+ UK jobs to demonstrate genuine commitment to UK job creation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {(orgStructure.year3UkJobs || totalUkFTE) >= 10 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-strong-plan">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your plan shows {(orgStructure.year3UkJobs || totalUkFTE).toFixed(1)} UK FTE jobs, demonstrating strong commitment to UK job creation.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Company Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          value={orgStructure.companyName}
                          onChange={(e) => setOrgStructure({ ...orgStructure, companyName: e.target.value })}
                          placeholder="Enter company name"
                          data-testid="input-company-name"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="current-team-size">Current Team Size</Label>
                          <Input
                            id="current-team-size"
                            type="number"
                            value={orgStructure.currentTeamSize || ''}
                            onChange={(e) => setOrgStructure({ ...orgStructure, currentTeamSize: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            data-testid="input-current-team-size"
                          />
                        </div>

                        <div>
                          <Label htmlFor="target-team-size">Target Team Size (Year 3)</Label>
                          <Input
                            id="target-team-size"
                            type="number"
                            value={orgStructure.targetTeamSize || ''}
                            onChange={(e) => setOrgStructure({ ...orgStructure, targetTeamSize: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            data-testid="input-target-team-size"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="year1-uk-jobs">Year 1 UK Jobs (FTE)</Label>
                          <Input
                            id="year1-uk-jobs"
                            type="number"
                            step="0.1"
                            value={orgStructure.year1UkJobs || ''}
                            onChange={(e) => setOrgStructure({ ...orgStructure, year1UkJobs: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            data-testid="input-year1-uk-jobs"
                          />
                        </div>

                        <div>
                          <Label htmlFor="year2-uk-jobs">Year 2 UK Jobs (FTE)</Label>
                          <Input
                            id="year2-uk-jobs"
                            type="number"
                            step="0.1"
                            value={orgStructure.year2UkJobs || ''}
                            onChange={(e) => setOrgStructure({ ...orgStructure, year2UkJobs: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            data-testid="input-year2-uk-jobs"
                          />
                        </div>

                        <div>
                          <Label htmlFor="year3-uk-jobs">Year 3 UK Jobs (FTE)</Label>
                          <Input
                            id="year3-uk-jobs"
                            type="number"
                            step="0.1"
                            value={orgStructure.year3UkJobs || ''}
                            onChange={(e) => setOrgStructure({ ...orgStructure, year3UkJobs: parseFloat(e.target.value) || 0 })}
                            placeholder="2"
                            data-testid="input-year3-uk-jobs"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Minimum: 2 FTE required</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="management-levels">Management Levels</Label>
                        <Input
                          id="management-levels"
                          type="number"
                          value={orgStructure.managementLevels}
                          onChange={(e) => setOrgStructure({ ...orgStructure, managementLevels: parseInt(e.target.value) || 1 })}
                          placeholder="3"
                          data-testid="input-management-levels"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reporting-structure">Reporting Structure</Label>
                        <Textarea
                          id="reporting-structure"
                          value={orgStructure.reportingStructure}
                          onChange={(e) => setOrgStructure({ ...orgStructure, reportingStructure: e.target.value })}
                          placeholder="Describe your organizational hierarchy and reporting lines (e.g., CEO to Department Heads to Team Leads to Individual Contributors)"
                          rows={4}
                          data-testid="textarea-reporting-structure"
                        />
                      </div>

                      <div>
                        <Label htmlFor="span-of-control">Span of Control Guidelines</Label>
                        <Textarea
                          id="span-of-control"
                          value={orgStructure.spanOfControl}
                          onChange={(e) => setOrgStructure({ ...orgStructure, spanOfControl: e.target.value })}
                          placeholder="Define management ratios and team size guidelines (e.g., 1 manager per 5-7 team members)"
                          rows={3}
                          data-testid="textarea-span-of-control"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Positions</CardTitle>
                      <CardDescription>Define all roles in your organization</CardDescription>
                    </div>
                    <Button onClick={addPosition} data-testid="button-add-position">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Position
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold" data-testid="text-positions-count">{positions.length}</p>
                      <p className="text-sm text-muted-foreground">Total Positions</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold" data-testid="text-departments-count">
                        {new Set(positions.filter(p => p.department).map(p => p.department)).size}
                      </p>
                      <p className="text-sm text-muted-foreground">Departments</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold" data-testid="text-total-salary">£{Math.round(totalSalaryCost / 1000)}k</p>
                      <p className="text-sm text-muted-foreground">Annual Salary Budget</p>
                    </div>
                  </div>

                  {positions.map((position) => (
                    <Card key={position.id} className="p-4" data-testid={`card-position-${position.id}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{position.title || 'Untitled Position'}</h4>
                          {position.id !== '1' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePosition(position.id)}
                              data-testid={`button-remove-position-${position.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${position.id}`}>Job Title</Label>
                            <Input
                              id={`title-${position.id}`}
                              value={position.title}
                              onChange={(e) => updatePosition(position.id, 'title', e.target.value)}
                              placeholder="e.g., Chief Technology Officer"
                              data-testid={`input-title-${position.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`department-${position.id}`}>Department</Label>
                            <Input
                              id={`department-${position.id}`}
                              value={position.department}
                              onChange={(e) => updatePosition(position.id, 'department', e.target.value)}
                              placeholder="e.g., Engineering, Sales, Operations"
                              data-testid={`input-department-${position.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`level-${position.id}`}>Level</Label>
                            <Input
                              id={`level-${position.id}`}
                              type="number"
                              value={position.level}
                              onChange={(e) => updatePosition(position.id, 'level', parseInt(e.target.value) || 1)}
                              placeholder="1"
                              data-testid={`input-level-${position.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`headcount-${position.id}`}>Headcount</Label>
                            <Input
                              id={`headcount-${position.id}`}
                              type="number"
                              value={position.headcount}
                              onChange={(e) => updatePosition(position.id, 'headcount', parseInt(e.target.value) || 1)}
                              placeholder="1"
                              data-testid={`input-headcount-${position.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`fte-${position.id}`}>FTE</Label>
                            <Input
                              id={`fte-${position.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={position.fte}
                              onChange={(e) => updatePosition(position.id, 'fte', parseFloat(e.target.value) || 1)}
                              placeholder="1.0"
                              data-testid={`input-fte-${position.id}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`salary-${position.id}`}>Salary (£)</Label>
                            <Input
                              id={`salary-${position.id}`}
                              type="number"
                              value={position.salary || ''}
                              onChange={(e) => updatePosition(position.id, 'salary', parseInt(e.target.value) || 0)}
                              placeholder="60000"
                              data-testid={`input-salary-${position.id}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`priority-${position.id}`}>Priority</Label>
                            <select
                              id={`priority-${position.id}`}
                              value={position.priority}
                              onChange={(e) => updatePosition(position.id, 'priority', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-priority-${position.id}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor={`growth-year-${position.id}`}>Growth Year</Label>
                            <Input
                              id={`growth-year-${position.id}`}
                              type="number"
                              min="0"
                              max="3"
                              value={position.growthYear}
                              onChange={(e) => updatePosition(position.id, 'growthYear', parseInt(e.target.value) || 0)}
                              placeholder="1"
                              data-testid={`input-growth-year-${position.id}`}
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={position.ukBased}
                                onChange={(e) => updatePosition(position.id, 'ukBased', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-uk-based-${position.id}`}
                              />
                              <span className="text-sm">UK-Based</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`responsibilities-${position.id}`}>Responsibilities</Label>
                          <Textarea
                            id={`responsibilities-${position.id}`}
                            value={position.responsibilities}
                            onChange={(e) => updatePosition(position.id, 'responsibilities', e.target.value)}
                            placeholder="Describe key responsibilities and accountabilities for this role"
                            rows={3}
                            data-testid={`textarea-responsibilities-${position.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`skills-${position.id}`}>Required Skills</Label>
                          <Textarea
                            id={`skills-${position.id}`}
                            value={position.requiredSkills}
                            onChange={(e) => updatePosition(position.id, 'requiredSkills', e.target.value)}
                            placeholder="List technical skills, experience, qualifications required"
                            rows={2}
                            data-testid={`textarea-skills-${position.id}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`reports-to-${position.id}`}>Reports To</Label>
                          <Input
                            id={`reports-to-${position.id}`}
                            value={position.reportsTo}
                            onChange={(e) => updatePosition(position.id, 'reportsTo', e.target.value)}
                            placeholder="e.g., CEO, CTO, VP Engineering"
                            data-testid={`input-reports-to-${position.id}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>3-Year Growth Plan</CardTitle>
                  <CardDescription>Document your team scaling strategy and retention initiatives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year1-headcount">Year 1 Target Headcount</Label>
                      <Input
                        id="year1-headcount"
                        type="number"
                        value={growthPlan.year1Headcount || ''}
                        onChange={(e) => setGrowthPlan({ ...growthPlan, year1Headcount: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-year1-headcount"
                      />
                    </div>

                    <div>
                      <Label htmlFor="year2-headcount">Year 2 Target Headcount</Label>
                      <Input
                        id="year2-headcount"
                        type="number"
                        value={growthPlan.year2Headcount || ''}
                        onChange={(e) => setGrowthPlan({ ...growthPlan, year2Headcount: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-year2-headcount"
                      />
                    </div>

                    <div>
                      <Label htmlFor="year3-headcount">Year 3 Target Headcount</Label>
                      <Input
                        id="year3-headcount"
                        type="number"
                        value={growthPlan.year3Headcount || ''}
                        onChange={(e) => setGrowthPlan({ ...growthPlan, year3Headcount: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-year3-headcount"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scaling-strategy">Scaling Strategy</Label>
                    <Textarea
                      id="scaling-strategy"
                      value={growthPlan.scalingStrategy}
                      onChange={(e) => setGrowthPlan({ ...growthPlan, scalingStrategy: e.target.value })}
                      placeholder="Describe how team growth aligns with business milestones, revenue targets, and market expansion plans"
                      rows={4}
                      data-testid="textarea-scaling-strategy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retention-plan">Retention Plan</Label>
                    <Textarea
                      id="retention-plan"
                      value={growthPlan.retentionPlan}
                      onChange={(e) => setGrowthPlan({ ...growthPlan, retentionPlan: e.target.value })}
                      placeholder="Detail employee retention strategies including compensation, career development, company culture, and benefits"
                      rows={4}
                      data-testid="textarea-retention-plan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="succession-planning">Succession Planning</Label>
                    <Textarea
                      id="succession-planning"
                      value={growthPlan.successionPlanning}
                      onChange={(e) => setGrowthPlan({ ...growthPlan, successionPlanning: e.target.value })}
                      placeholder="Document succession plans for critical roles to ensure business continuity"
                      rows={3}
                      data-testid="textarea-succession-planning"
                    />
                  </div>

                  <div>
                    <Label htmlFor="diversity-goals">Diversity and Inclusion Goals</Label>
                    <Textarea
                      id="diversity-goals"
                      value={growthPlan.diversityGoals}
                      onChange={(e) => setGrowthPlan({ ...growthPlan, diversityGoals: e.target.value })}
                      placeholder="Describe diversity targets and inclusive hiring practices"
                      rows={3}
                      data-testid="textarea-diversity-goals"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Organizational Hierarchy Map</CardTitle>
                    <CardDescription>Department structure visualization by headcount and UK jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getHierarchyTreeData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={350} data-testid="chart-hierarchy-treemap">
                        <Treemap
                          data={getHierarchyTreeData()}
                          dataKey="size"
                          aspectRatio={4/3}
                          stroke="#fff"
                          fill="#3b82f6"
                          content={<CustomTreemapContent />}
                        />
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground py-12" data-testid="text-no-hierarchy-data">
                        Add positions with departments to see organizational hierarchy
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Department Size Distribution</CardTitle>
                    <CardDescription>Headcount and salary budget by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getDepartmentData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={350} data-testid="chart-department-distribution">
                        <ComposedChart data={getDepartmentData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                          <YAxis yAxisId="left" label={{ value: 'Headcount', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Salary (£k)', angle: 90, position: 'insideRight' }} />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="headcount" fill="#3b82f6" name="Headcount" />
                          <Line yAxisId="right" type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={2} name="Salary Budget (£k)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground py-12" data-testid="text-no-department-data">
                        Add positions to see department distribution
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3-Year Headcount Growth</CardTitle>
                    <CardDescription>Team size and UK job creation projection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300} data-testid="chart-growth-projection">
                      <ComposedChart data={getGrowthProjectionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="headcount" fill="#3b82f6" name="Total Headcount" />
                        <Line type="monotone" dataKey="ukJobs" stroke="#10b981" strokeWidth={3} name="UK FTE Jobs" />
                        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Management Level Distribution</CardTitle>
                    <CardDescription>Team structure by organizational level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getLevelDistributionData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300} data-testid="chart-level-distribution">
                        <PieChart>
                          <Pie
                            data={getLevelDistributionData()}
                            dataKey="count"
                            nameKey="level"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.level}: ${entry.count} (${entry.percentage}%)`}
                          >
                            {getLevelDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground py-12" data-testid="text-no-level-data">
                        Add positions to see level distribution
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Team Structure Evidence</CardTitle>
                  <CardDescription>Key compliance factors for Innovation Visa job creation requirement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-requirement-met" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" data-testid="icon-requirement-not-met" />
                      )}
                      <div>
                        <p className="font-medium">Minimum 2 FTE UK Jobs by Year 3</p>
                        <p className="text-sm text-muted-foreground">
                          Your plan shows {(orgStructure.year3UkJobs || totalUkFTE).toFixed(1)} FTE UK jobs by Year 3.
                          {(orgStructure.year3UkJobs || totalUkFTE) >= 2 ? ' Requirement met.' : ' This does not meet the mandatory 2 FTE minimum.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {ukHeadcount >= 10 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-target-met" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="icon-target-suggested" />
                      )}
                      <div>
                        <p className="font-medium">Target: 10+ UK Jobs for Strong Application</p>
                        <p className="text-sm text-muted-foreground">
                          Current plan: {ukHeadcount} UK-based employees. Endorsing bodies favour applicants demonstrating significant UK job creation (10+ roles).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {positions.filter(p => p.ukBased && p.responsibilities.length > 50).length >= positions.filter(p => p.ukBased).length * 0.8 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-roles-defined" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="icon-roles-need-detail" />
                      )}
                      <div>
                        <p className="font-medium">Skilled Roles with Clear Responsibilities</p>
                        <p className="text-sm text-muted-foreground">
                          {positions.filter(p => p.ukBased && p.responsibilities.length > 50).length} of {positions.filter(p => p.ukBased).length} UK positions have detailed responsibility descriptions.
                          All UK roles must be genuinely skilled positions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {positions.filter(p => p.ukBased && p.salary >= 25000).length >= positions.filter(p => p.ukBased).length * 0.9 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-salary-compliant" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="icon-salary-concern" />
                      )}
                      <div>
                        <p className="font-medium">Salary Thresholds for Skilled Worker Sponsorship</p>
                        <p className="text-sm text-muted-foreground">
                          {positions.filter(p => p.ukBased && p.salary >= 25000).length} of {positions.filter(p => p.ukBased).length} UK roles meet the £25,000+ threshold typically required for Skilled Worker visa sponsorship.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {orgStructure.reportingStructure.length > 100 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-structure-documented" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="icon-structure-needs-work" />
                      )}
                      <div>
                        <p className="font-medium">Clear Organizational Hierarchy</p>
                        <p className="text-sm text-muted-foreground">
                          {orgStructure.reportingStructure.length > 100 ? 'Well-documented' : 'Needs more detail on'} reporting structure and management levels.
                          Endorsing bodies assess organizational maturity through clear hierarchy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {growthPlan.retentionPlan.length > 100 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" data-testid="icon-retention-strong" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" data-testid="icon-retention-weak" />
                      )}
                      <div>
                        <p className="font-medium">Employee Retention Strategy</p>
                        <p className="text-sm text-muted-foreground">
                          {growthPlan.retentionPlan.length > 100 ? 'Comprehensive' : 'Limited'} retention planning documented.
                          High turnover undermines job creation claims - demonstrate long-term employment stability.
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
                  <CardDescription>AI-powered insights to strengthen your organizational plan</CardDescription>
                </CardHeader>
                <CardContent>
                  {getSmartTips().length > 0 ? (
                    <div className="space-y-4">
                      {getSmartTips().map((tip, index) => (
                        <Alert key={index} data-testid={`alert-tip-${index}`}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{tip}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12" data-testid="text-no-tips">
                      Complete your organizational plan to receive personalized recommendations
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for completing your organizational documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4" data-testid={`card-action-${index}`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold" data-testid={`text-action-week-${index}`}>{item.week}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                                item.priority === 'High' ? 'bg-orange-500/10 text-orange-600' :
                                'bg-blue-500/10 text-blue-600'
                              }`} data-testid={`badge-priority-${index}`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid={`text-action-description-${index}`}>{item.action}</p>
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
