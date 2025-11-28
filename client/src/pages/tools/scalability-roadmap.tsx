import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, Server, Users, Zap, Calendar, Database } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'scalability-roadmap',
  toolName: 'Scalability Roadmap',
  agent: 'atlas',
  greeting: "Hello! I'm Atlas, your Growth Strategist. Demonstrating clear scalability plans is essential for your UK Innovator Founder Visa. Let's build a comprehensive roadmap covering infrastructure, team growth, and process automation.",
  questions: [
    {
      id: 'current-scale',
      question: "What is your current operational scale? (Users, transactions, team size)",
      hint: "Include active users, monthly transactions, and current team headcount.",
      fieldKey: 'currentScale',
      minLength: 20
    },
    {
      id: 'target-scale',
      question: "What scale are you targeting in 3 years? (Users, revenue, team)",
      hint: "Be specific about growth multiples - endorsing bodies look for 10x potential.",
      fieldKey: 'targetScale',
      minLength: 30
    },
    {
      id: 'infrastructure-plan',
      question: "How will you scale your technical infrastructure to handle growth?",
      hint: "Include cloud strategy, capacity planning, and redundancy measures.",
      fieldKey: 'infrastructurePlan',
      minLength: 40
    },
    {
      id: 'team-scaling',
      question: "What is your team scaling plan? How many UK jobs will you create?",
      hint: "Job creation is a key ILR criterion. Include hiring timeline and key roles.",
      fieldKey: 'teamScaling',
      minLength: 40
    },
    {
      id: 'process-automation',
      question: "What processes will you automate to enable scaling without proportional headcount growth?",
      hint: "Include customer onboarding, support, operations, and back-office processes.",
      fieldKey: 'processAutomation',
      minLength: 30
    },
    {
      id: 'scalability-risks',
      question: "What are the main risks to your scalability plans, and how will you mitigate them?",
      hint: "Consider technical debt, talent acquisition, funding gaps, and market changes.",
      fieldKey: 'scalabilityRisks',
      minLength: 30
    }
  ],
  completionMessage: "Excellent scalability vision! I've captured your growth strategy. I'm now populating your roadmap with milestones, infrastructure plans, and team growth projections."
};

type Milestone = {
  id: string;
  name: string;
  category: 'infrastructure' | 'team' | 'process' | 'technology' | 'capacity';
  targetDate: string;
  status: 'planned' | 'in-progress' | 'completed';
  description: string;
  resourcesRequired: string;
  ukImpact: string;
};

type InfrastructureScale = {
  currentCapacity: string;
  targetCapacity: string;
  scalingStrategy: string;
  estimatedCost: number;
  timeline: string;
  cloudProvider: string;
  redundancy: string;
};

type TeamGrowth = {
  currentHeadcount: number;
  targetHeadcount: number;
  hiringTimeline: string;
  keyRoles: string;
  ukJobsCreated: number;
  trainingPlan: string;
  retentionStrategy: string;
};

type ProcessAutomation = {
  id: string;
  processName: string;
  currentState: string;
  automationPlan: string;
  toolsRequired: string;
  efficiencyGain: string;
  implementationTime: string;
};

type TechnologyUpgrade = {
  id: string;
  component: string;
  currentTech: string;
  targetTech: string;
  rationale: string;
  migrationPlan: string;
  riskMitigation: string;
};

type CapacityPlan = {
  currentUsers: number;
  targetUsers: number;
  peakLoadCapacity: string;
  scalabilityMetrics: string;
  bottlenecks: string;
  mitigationPlan: string;
};

export default function ScalabilityRoadmap() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('scalability-roadmap-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  const [activeTab, setActiveTab] = useState('roadmap');
  const [savedDate, setSavedDate] = useState('');

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      name: '',
      category: 'infrastructure',
      targetDate: '',
      status: 'planned',
      description: '',
      resourcesRequired: '',
      ukImpact: ''
    }
  ]);

  const [infrastructure, setInfrastructure] = useState<InfrastructureScale>({
    currentCapacity: '',
    targetCapacity: '',
    scalingStrategy: '',
    estimatedCost: 0,
    timeline: '',
    cloudProvider: '',
    redundancy: ''
  });

  const [teamGrowth, setTeamGrowth] = useState<TeamGrowth>({
    currentHeadcount: 0,
    targetHeadcount: 0,
    hiringTimeline: '',
    keyRoles: '',
    ukJobsCreated: 0,
    trainingPlan: '',
    retentionStrategy: ''
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('scalability-roadmap-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('scalability-roadmap-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    if (answers.currentScale) {
      setInfrastructure(prev => ({
        ...prev,
        currentCapacity: answers.currentScale,
        targetCapacity: answers.targetScale || '',
        scalingStrategy: answers.infrastructurePlan || ''
      }));
    }
    if (answers.teamScaling) {
      setTeamGrowth(prev => ({
        ...prev,
        hiringTimeline: answers.teamScaling,
        retentionStrategy: ''
      }));
    }
    if (answers.processAutomation) {
      setMilestones([{
        id: '1',
        name: 'Process Automation',
        category: 'process',
        targetDate: '',
        status: 'planned',
        description: answers.processAutomation,
        resourcesRequired: '',
        ukImpact: ''
      }]);
    }
    setMode('traditional');
  };

  const [processAutomation, setProcessAutomation] = useState<ProcessAutomation[]>([
    {
      id: '1',
      processName: '',
      currentState: '',
      automationPlan: '',
      toolsRequired: '',
      efficiencyGain: '',
      implementationTime: ''
    }
  ]);

  const [technologyUpgrades, setTechnologyUpgrades] = useState<TechnologyUpgrade[]>([
    {
      id: '1',
      component: '',
      currentTech: '',
      targetTech: '',
      rationale: '',
      migrationPlan: '',
      riskMitigation: ''
    }
  ]);

  const [capacityPlan, setCapacityPlan] = useState<CapacityPlan>({
    currentUsers: 0,
    targetUsers: 0,
    peakLoadCapacity: '',
    scalabilityMetrics: '',
    bottlenecks: '',
    mitigationPlan: ''
  });

  const [ukScalabilityNotes, setUkScalabilityNotes] = useState({
    jobCreationJustification: '',
    marketGrowthPotential: '',
    competitivePositioning: '',
    sustainabilityPlan: ''
  });

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now().toString(),
      name: '',
      category: 'infrastructure',
      targetDate: '',
      status: 'planned',
      description: '',
      resourcesRequired: '',
      ukImpact: ''
    }]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const addProcessAutomation = () => {
    setProcessAutomation([...processAutomation, {
      id: Date.now().toString(),
      processName: '',
      currentState: '',
      automationPlan: '',
      toolsRequired: '',
      efficiencyGain: '',
      implementationTime: ''
    }]);
  };

  const updateProcessAutomation = (id: string, field: keyof ProcessAutomation, value: string) => {
    setProcessAutomation(processAutomation.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProcessAutomation = (id: string) => {
    setProcessAutomation(processAutomation.filter(p => p.id !== id));
  };

  const addTechnologyUpgrade = () => {
    setTechnologyUpgrades([...technologyUpgrades, {
      id: Date.now().toString(),
      component: '',
      currentTech: '',
      targetTech: '',
      rationale: '',
      migrationPlan: '',
      riskMitigation: ''
    }]);
  };

  const updateTechnologyUpgrade = (id: string, field: keyof TechnologyUpgrade, value: string) => {
    setTechnologyUpgrades(technologyUpgrades.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTechnologyUpgrade = (id: string) => {
    setTechnologyUpgrades(technologyUpgrades.filter(t => t.id !== id));
  };

  const calculateScalabilityReadiness = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Infrastructure scaling (25 points)
    const infraFields = [
      infrastructure.currentCapacity,
      infrastructure.targetCapacity,
      infrastructure.scalingStrategy,
      infrastructure.timeline,
      infrastructure.cloudProvider,
      infrastructure.redundancy
    ].filter(v => v && v.length > 0).length;
    totalFields += 6;
    completedFields += infraFields;
    if (infrastructure.estimatedCost > 0) completedFields += 1;
    totalFields += 1;

    // Team growth (20 points)
    const teamFields = [
      teamGrowth.hiringTimeline,
      teamGrowth.keyRoles,
      teamGrowth.trainingPlan,
      teamGrowth.retentionStrategy
    ].filter(v => v && v.length > 0).length;
    totalFields += 4;
    completedFields += teamFields;
    if (teamGrowth.currentHeadcount > 0) completedFields += 1;
    if (teamGrowth.targetHeadcount > 0) completedFields += 1;
    if (teamGrowth.ukJobsCreated > 0) completedFields += 1;
    totalFields += 3;

    // Process automation (15 points)
    const processFields = processAutomation.reduce((sum, p) => {
      const filled = [p.processName, p.currentState, p.automationPlan, p.toolsRequired, p.efficiencyGain, p.implementationTime]
        .filter(v => v && v.length > 0).length;
      totalFields += 6;
      return sum + filled;
    }, 0);
    completedFields += processFields;

    // Technology upgrades (15 points)
    const techFields = technologyUpgrades.reduce((sum, t) => {
      const filled = [t.component, t.currentTech, t.targetTech, t.rationale, t.migrationPlan, t.riskMitigation]
        .filter(v => v && v.length > 0).length;
      totalFields += 6;
      return sum + filled;
    }, 0);
    completedFields += techFields;

    // Capacity planning (15 points)
    const capacityFields = [
      capacityPlan.peakLoadCapacity,
      capacityPlan.scalabilityMetrics,
      capacityPlan.bottlenecks,
      capacityPlan.mitigationPlan
    ].filter(v => v && v.length > 0).length;
    totalFields += 4;
    completedFields += capacityFields;
    if (capacityPlan.currentUsers > 0) completedFields += 1;
    if (capacityPlan.targetUsers > 0) completedFields += 1;
    totalFields += 2;

    // Milestones (10 points)
    const milestoneFields = milestones.reduce((sum, m) => {
      const filled = [m.name, m.targetDate, m.description, m.resourcesRequired, m.ukImpact]
        .filter(v => v && v.length > 0).length;
      totalFields += 5;
      return sum + filled;
    }, 0);
    completedFields += milestoneFields;

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const scalabilityReadiness = calculateScalabilityReadiness();

  const getMilestoneTimelineData = () => {
    return milestones
      .filter(m => m.targetDate && m.name)
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      .map((m, index) => ({
        name: m.name.substring(0, 20) + (m.name.length > 20 ? '...' : ''),
        date: new Date(m.targetDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        week: index + 1,
        category: m.category,
        status: m.status === 'completed' ? 3 : m.status === 'in-progress' ? 2 : 1
      }));
  };

  const getResourceAllocationData = () => {
    const categoryMap: Record<string, number> = {
      infrastructure: infrastructure.estimatedCost || 0,
      team: teamGrowth.ukJobsCreated * 40000 || 0, // Estimate £40k per role
      process: processAutomation.length * 5000 || 0, // Estimate £5k per automation
      technology: technologyUpgrades.length * 10000 || 0, // Estimate £10k per upgrade
      capacity: 0
    };

    return Object.entries(categoryMap)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        budget: value,
        percentage: 0
      }));
  };

  const getSerializedState = () => {
    return {
      milestones,
      infrastructure,
      teamGrowth,
      processAutomation,
      technologyUpgrades,
      capacityPlan,
      ukScalabilityNotes,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('milestones' in state) setMilestones(state.milestones);
    if ('infrastructure' in state) setInfrastructure(state.infrastructure);
    if ('teamGrowth' in state) setTeamGrowth(state.teamGrowth);
    if ('processAutomation' in state) setProcessAutomation(state.processAutomation);
    if ('technologyUpgrades' in state) setTechnologyUpgrades(state.technologyUpgrades);
    if ('capacityPlan' in state) setCapacityPlan(state.capacityPlan);
    if ('ukScalabilityNotes' in state) setUkScalabilityNotes(state.ukScalabilityNotes);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('scalability-roadmap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('scalability-roadmap-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('scalability-roadmap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (scalabilityReadiness < 30) {
      tips.push("Begin with a clear infrastructure scaling strategy - this demonstrates technical sophistication to endorsing bodies");
    }

    if (teamGrowth.ukJobsCreated < 5) {
      tips.push("CRITICAL: UK Innovation Visa requires demonstrable job creation. Plan for at least 10+ UK roles within 3 years to strengthen your application");
    }

    if (!infrastructure.redundancy || infrastructure.redundancy.length < 20) {
      tips.push("Document redundancy and disaster recovery plans - this shows business maturity and risk management capability");
    }

    if (processAutomation.length < 2) {
      tips.push("Identify more automation opportunities - operational efficiency is a key scalability indicator for visa criteria");
    }

    if (technologyUpgrades.length === 0) {
      tips.push("Plan strategic technology upgrades - this demonstrates innovation and commitment to staying competitive");
    }

    if (!capacityPlan.bottlenecks || capacityPlan.bottlenecks.length < 30) {
      tips.push("Identify and document current bottlenecks - showing awareness of limitations and mitigation plans demonstrates strategic thinking");
    }

    if (milestones.filter(m => m.ukImpact && m.ukImpact.length > 20).length < 3) {
      tips.push("Explicitly link each milestone to UK market impact - endorsing bodies want to see genuine UK economic benefit");
    }

    if (infrastructure.cloudProvider && !infrastructure.cloudProvider.toLowerCase().includes('uk')) {
      tips.push("Consider using UK-based cloud regions or providers - this demonstrates commitment to UK infrastructure and data sovereignty");
    }

    if (capacityPlan.targetUsers > capacityPlan.currentUsers * 10 && !capacityPlan.scalabilityMetrics) {
      tips.push("Your aggressive growth targets require detailed scalability metrics - document load testing, performance benchmarks, and scaling triggers");
    }

    if (teamGrowth.targetHeadcount > teamGrowth.currentHeadcount * 5 && !teamGrowth.retentionStrategy) {
      tips.push("Rapid hiring plans need retention strategies - high turnover undermines scalability and visa compliance");
    }

    if (scalabilityReadiness > 70) {
      tips.push("Strong scalability plan - ensure all claims are backed by technical documentation and financial projections");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct infrastructure audit - document current capacity, bottlenecks, and scaling triggers", priority: "Critical" },
      { week: "Week 1", action: "Define target scale metrics - users, transactions, data volume, geographic expansion", priority: "Critical" },
      { week: "Week 1-2", action: "Map team growth plan to revenue milestones showing UK job creation timeline", priority: "Critical" },
      { week: "Week 2", action: "Identify critical processes for automation and estimate efficiency gains", priority: "High" },
      { week: "Week 2", action: "Document current technology stack with scalability limitations and upgrade paths", priority: "High" },
      { week: "Week 2-3", action: "Create detailed capacity planning model with load testing results", priority: "Critical" },
      { week: "Week 3", action: "Develop infrastructure scaling timeline with costs and cloud architecture diagrams", priority: "High" },
      { week: "Week 3", action: "Plan technology migrations with risk mitigation and rollback strategies", priority: "High" },
      { week: "Week 4", action: "Link all scaling initiatives to UK market impact and job creation", priority: "Critical" },
      { week: "Week 4", action: "Compile evidence package: technical documentation, load tests, architecture diagrams, financial models", priority: "Critical" },
    ];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - SCALABILITY ROADMAP
Generated: ${new Date().toLocaleString('en-GB')}
Scalability Readiness Score: ${scalabilityReadiness}%
${'='.repeat(80)}

SCALABILITY OVERVIEW
${'-'.repeat(80)}
Current Status: ${scalabilityReadiness >= 70 ? 'Ready to Scale' : scalabilityReadiness >= 40 ? 'Moderate Readiness' : 'Early Stage'}
Infrastructure Investment: £${infrastructure.estimatedCost?.toLocaleString() || '0'}
UK Jobs Planned: ${teamGrowth.ukJobsCreated}
Team Growth: ${teamGrowth.currentHeadcount} → ${teamGrowth.targetHeadcount} (${teamGrowth.targetHeadcount > 0 ? Math.round(((teamGrowth.targetHeadcount - teamGrowth.currentHeadcount) / Math.max(teamGrowth.currentHeadcount, 1)) * 100) : 0}% increase)
User Capacity: ${capacityPlan.currentUsers} → ${capacityPlan.targetUsers} (${capacityPlan.targetUsers > 0 ? Math.round(((capacityPlan.targetUsers - capacityPlan.currentUsers) / Math.max(capacityPlan.currentUsers, 1)) * 100) : 0}% increase)

INFRASTRUCTURE SCALING PLAN
${'-'.repeat(80)}
Current Capacity: ${infrastructure.currentCapacity || '[Not Specified]'}
Target Capacity: ${infrastructure.targetCapacity || '[Not Specified]'}
Scaling Strategy: ${infrastructure.scalingStrategy || '[Not Specified]'}
Cloud Provider: ${infrastructure.cloudProvider || '[Not Specified]'}
Estimated Investment: £${infrastructure.estimatedCost?.toLocaleString() || '0'}
Timeline: ${infrastructure.timeline || '[Not Specified]'}
Redundancy & DR: ${infrastructure.redundancy || '[Not Specified]'}

TEAM GROWTH & UK JOB CREATION
${'-'.repeat(80)}
Current Headcount: ${teamGrowth.currentHeadcount}
Target Headcount: ${teamGrowth.targetHeadcount}
UK Jobs Created: ${teamGrowth.ukJobsCreated}
Hiring Timeline: ${teamGrowth.hiringTimeline || '[Not Specified]'}

Key Roles to Hire:
${teamGrowth.keyRoles || '[Not Specified]'}

Training Plan:
${teamGrowth.trainingPlan || '[Not Specified]'}

Retention Strategy:
${teamGrowth.retentionStrategy || '[Not Specified]'}

PROCESS AUTOMATION INITIATIVES
${'-'.repeat(80)}
${processAutomation.map((p, i) => `
${i + 1}. ${p.processName || '[Unnamed Process]'}
   Current State: ${p.currentState || '[Not Specified]'}
   Automation Plan: ${p.automationPlan || '[Not Specified]'}
   Tools Required: ${p.toolsRequired || '[Not Specified]'}
   Efficiency Gain: ${p.efficiencyGain || '[Not Specified]'}
   Implementation Time: ${p.implementationTime || '[Not Specified]'}
`).join('')}

TECHNOLOGY UPGRADES
${'-'.repeat(80)}
${technologyUpgrades.map((t, i) => `
${i + 1}. ${t.component || '[Unnamed Component]'}
   Current: ${t.currentTech || '[Not Specified]'}
   Target: ${t.targetTech || '[Not Specified]'}
   Rationale: ${t.rationale || '[Not Specified]'}
   Migration Plan: ${t.migrationPlan || '[Not Specified]'}
   Risk Mitigation: ${t.riskMitigation || '[Not Specified]'}
`).join('')}

CAPACITY PLANNING
${'-'.repeat(80)}
Current Users: ${capacityPlan.currentUsers.toLocaleString()}
Target Users: ${capacityPlan.targetUsers.toLocaleString()}
Growth Multiple: ${capacityPlan.currentUsers > 0 ? (capacityPlan.targetUsers / capacityPlan.currentUsers).toFixed(1) : 'N/A'}x

Peak Load Capacity:
${capacityPlan.peakLoadCapacity || '[Not Specified]'}

Scalability Metrics:
${capacityPlan.scalabilityMetrics || '[Not Specified]'}

Current Bottlenecks:
${capacityPlan.bottlenecks || '[Not Specified]'}

Mitigation Plan:
${capacityPlan.mitigationPlan || '[Not Specified]'}

MILESTONE TIMELINE
${'-'.repeat(80)}
${milestones.map((m, i) => `
${i + 1}. ${m.name || '[Unnamed Milestone]'}
   Category: ${m.category.charAt(0).toUpperCase() + m.category.slice(1)}
   Target Date: ${m.targetDate || '[Not Specified]'}
   Status: ${m.status.charAt(0).toUpperCase() + m.status.slice(1).replace('-', ' ')}
   Description: ${m.description || '[Not Specified]'}
   Resources Required: ${m.resourcesRequired || '[Not Specified]'}
   UK Market Impact: ${m.ukImpact || '[Not Specified]'}
`).join('')}

UK SCALABILITY ALIGNMENT
${'-'.repeat(80)}
Job Creation Justification:
${ukScalabilityNotes.jobCreationJustification || '[Not Specified]'}

UK Market Growth Potential:
${ukScalabilityNotes.marketGrowthPotential || '[Not Specified]'}

Competitive Positioning:
${ukScalabilityNotes.competitivePositioning || '[Not Specified]'}

Long-term Sustainability:
${ukScalabilityNotes.sustainabilityPlan || '[Not Specified]'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

UK INNOVATION VISA - SCALABILITY CHECKLIST
${'-'.repeat(80)}
[ ] Clear infrastructure scaling plan with technical architecture
[ ] Documented capacity planning with load testing results
[ ] UK job creation timeline with specific roles and salaries
[ ] Process automation roadmap showing operational efficiency
[ ] Technology upgrade strategy demonstrating innovation
[ ] Redundancy and disaster recovery plans
[ ] Scalability metrics and KPIs defined
[ ] Financial model linking scaling to revenue growth
[ ] Evidence of technical feasibility (architecture diagrams, prototypes)
[ ] Competitive analysis showing sustainable advantage

TECHNICAL EVIDENCE REQUIREMENTS
${'-'.repeat(80)}
1. System Architecture Diagrams (current and target state)
2. Load Testing Results & Performance Benchmarks
3. Cloud Infrastructure Cost Projections
4. Technology Stack Documentation
5. API Documentation & Integration Plans
6. Security & Compliance Frameworks
7. Data Migration Strategies
8. Monitoring & Alerting Setup
9. Incident Response Procedures
10. Backup & Recovery Procedures

NEXT STEPS
${'-'.repeat(80)}
1. Complete technical infrastructure documentation
2. Conduct load testing and document results
3. Create detailed hiring plan with job descriptions
4. Map automation initiatives to efficiency gains
5. Document all technology decisions with rationale
6. Prepare capacity planning model with scenarios
7. Link all scaling plans to UK economic impact
8. Compile evidence package for endorsing body
9. Have technical architecture reviewed by UK-based expert
10. Ensure all claims are backed by data and evidence

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This scalability roadmap is for planning purposes only. Consult with 
technical architects, financial advisors, and immigration specialists before 
submitting visa applications.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scalability-roadmap-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    await generateWord({
      title: "Scalability Roadmap",
      subtitle: "UK Innovator Founder Visa - Infrastructure, Team & Technology Scaling Plan",
      filename: "scalability-roadmap",
      sections: [
        { type: 'heading', level: 1, content: 'Scalability Overview' },
        { type: 'score', score: { value: scalabilityReadiness, max: 100, label: 'Scalability Readiness' } },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Current Status', scalabilityReadiness >= 70 ? 'Ready to Scale' : scalabilityReadiness >= 40 ? 'Moderate Readiness' : 'Early Stage'],
            ['Infrastructure Investment', `£${infrastructure.estimatedCost?.toLocaleString() || '0'}`],
            ['UK Jobs Planned', teamGrowth.ukJobsCreated.toString()],
            ['Team Growth', `${teamGrowth.currentHeadcount} → ${teamGrowth.targetHeadcount}`],
            ['User Capacity', `${capacityPlan.currentUsers} → ${capacityPlan.targetUsers}`]
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Infrastructure Scaling Plan' },
        { type: 'table', tableData: {
          headers: ['Attribute', 'Details'],
          rows: [
            ['Current Capacity', infrastructure.currentCapacity || 'Not Specified'],
            ['Target Capacity', infrastructure.targetCapacity || 'Not Specified'],
            ['Scaling Strategy', infrastructure.scalingStrategy || 'Not Specified'],
            ['Cloud Provider', infrastructure.cloudProvider || 'Not Specified'],
            ['Estimated Investment', `£${infrastructure.estimatedCost?.toLocaleString() || '0'}`],
            ['Timeline', infrastructure.timeline || 'Not Specified'],
            ['Redundancy & DR', infrastructure.redundancy || 'Not Specified']
          ]
        }},
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Team Growth & UK Job Creation' },
        { type: 'table', tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Current Headcount', teamGrowth.currentHeadcount.toString()],
            ['Target Headcount', teamGrowth.targetHeadcount.toString()],
            ['UK Jobs Created', teamGrowth.ukJobsCreated.toString()],
            ['Hiring Timeline', teamGrowth.hiringTimeline || 'Not Specified']
          ]
        }},
        { type: 'paragraph', content: `Key Roles: ${teamGrowth.keyRoles || 'Not Specified'}` },
        { type: 'paragraph', content: `Training Plan: ${teamGrowth.trainingPlan || 'Not Specified'}` },
        { type: 'paragraph', content: `Retention Strategy: ${teamGrowth.retentionStrategy || 'Not Specified'}` },
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Milestone Timeline' },
        { type: 'table', tableData: {
          headers: ['Milestone', 'Category', 'Target Date', 'Status'],
          rows: milestones.map(m => [
            m.name || 'Unnamed',
            m.category.charAt(0).toUpperCase() + m.category.slice(1),
            m.targetDate || 'Not Set',
            m.status.charAt(0).toUpperCase() + m.status.slice(1).replace('-', ' ')
          ])
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
        subject: 'Scalability Roadmap',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['scalability', 'infrastructure', 'UK visa', 'growth planning']
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
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold" data-testid="heading-scalability-roadmap">Scalability Roadmap</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
            <p className="text-lg text-muted-foreground">Infrastructure, team, and technology scaling plan for UK visa compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="scalability-roadmap"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            onSmartTips={() => setActiveTab('tips')}
            onActionPlan={() => setActiveTab('action')}
            getSerializedState={getSerializedState}
            toolName="Scalability Roadmap"
          />

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Scalability Readiness Score</h3>
                    <p className="text-sm text-muted-foreground">Complete all sections for comprehensive roadmap</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" data-testid="text-readiness-score">{scalabilityReadiness}%</p>
                  </div>
                </div>
                <Progress value={scalabilityReadiness} className="h-3" data-testid="progress-readiness" />
                
                {scalabilityReadiness < 40 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your scalability plan needs more detail. Focus on infrastructure, team growth, and UK job creation.
                    </AlertDescription>
                  </Alert>
                )}
                
                {scalabilityReadiness >= 70 && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Strong scalability plan! Ensure all technical claims are backed by documentation and evidence.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-scalability">
              <TabsTrigger value="roadmap" data-testid="tab-roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Scalability Milestones</CardTitle>
                  </div>
                  <CardDescription>Define key milestones across infrastructure, team, and technology</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addMilestone} size="sm" data-testid="button-add-milestone">
                    Add Milestone
                  </Button>

                  {milestones.map((milestone) => (
                    <Card key={milestone.id} className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`milestone-name-${milestone.id}`}>Milestone Name</Label>
                          <Input
                            id={`milestone-name-${milestone.id}`}
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                            placeholder="e.g., Deploy multi-region infrastructure"
                            data-testid={`input-milestone-name-${milestone.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`milestone-date-${milestone.id}`}>Target Date</Label>
                          <Input
                            id={`milestone-date-${milestone.id}`}
                            type="date"
                            value={milestone.targetDate}
                            onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                            data-testid={`input-milestone-date-${milestone.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`milestone-category-${milestone.id}`}>Category</Label>
                          <select
                            id={`milestone-category-${milestone.id}`}
                            value={milestone.category}
                            onChange={(e) => updateMilestone(milestone.id, 'category', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-milestone-category-${milestone.id}`}
                          >
                            <option value="infrastructure">Infrastructure</option>
                            <option value="team">Team Growth</option>
                            <option value="process">Process Automation</option>
                            <option value="technology">Technology Upgrade</option>
                            <option value="capacity">Capacity Planning</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`milestone-status-${milestone.id}`}>Status</Label>
                          <select
                            id={`milestone-status-${milestone.id}`}
                            value={milestone.status}
                            onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-milestone-status-${milestone.id}`}
                          >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`milestone-desc-${milestone.id}`}>Description</Label>
                          <Textarea
                            id={`milestone-desc-${milestone.id}`}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                            placeholder="Detailed description of what will be achieved"
                            className="h-20"
                            data-testid={`textarea-milestone-desc-${milestone.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`milestone-resources-${milestone.id}`}>Resources Required</Label>
                          <Input
                            id={`milestone-resources-${milestone.id}`}
                            value={milestone.resourcesRequired}
                            onChange={(e) => updateMilestone(milestone.id, 'resourcesRequired', e.target.value)}
                            placeholder="e.g., 2 DevOps engineers, £50k budget"
                            data-testid={`input-milestone-resources-${milestone.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`milestone-uk-${milestone.id}`}>UK Market Impact</Label>
                          <Input
                            id={`milestone-uk-${milestone.id}`}
                            value={milestone.ukImpact}
                            onChange={(e) => updateMilestone(milestone.id, 'ukImpact', e.target.value)}
                            placeholder="e.g., Creates 3 UK jobs, serves 10k UK users"
                            data-testid={`input-milestone-uk-${milestone.id}`}
                          />
                        </div>
                        {milestones.length > 1 && (
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(milestone.id)}
                              data-testid={`button-remove-milestone-${milestone.id}`}
                            >
                              Remove Milestone
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Team Growth Plan</CardTitle>
                  </div>
                  <CardDescription>UK job creation is critical for visa approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current-headcount">Current Headcount</Label>
                      <Input
                        id="current-headcount"
                        type="number"
                        value={teamGrowth.currentHeadcount || ''}
                        onChange={(e) => setTeamGrowth({ ...teamGrowth, currentHeadcount: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-current-headcount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-headcount">Target Headcount (24 months)</Label>
                      <Input
                        id="target-headcount"
                        type="number"
                        value={teamGrowth.targetHeadcount || ''}
                        onChange={(e) => setTeamGrowth({ ...teamGrowth, targetHeadcount: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-target-headcount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uk-jobs">UK Jobs Created</Label>
                      <Input
                        id="uk-jobs"
                        type="number"
                        value={teamGrowth.ukJobsCreated || ''}
                        onChange={(e) => setTeamGrowth({ ...teamGrowth, ukJobsCreated: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-uk-jobs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hiring-timeline">Hiring Timeline</Label>
                    <Textarea
                      id="hiring-timeline"
                      value={teamGrowth.hiringTimeline}
                      onChange={(e) => setTeamGrowth({ ...teamGrowth, hiringTimeline: e.target.value })}
                      placeholder="Q1: 2 engineers, Q2: 1 product manager, Q3: 3 sales reps..."
                      className="h-20"
                      data-testid="textarea-hiring-timeline"
                    />
                  </div>

                  <div>
                    <Label htmlFor="key-roles">Key Roles to Hire</Label>
                    <Textarea
                      id="key-roles"
                      value={teamGrowth.keyRoles}
                      onChange={(e) => setTeamGrowth({ ...teamGrowth, keyRoles: e.target.value })}
                      placeholder="Senior Backend Engineer, Product Designer, Head of Sales (UK), Customer Success Manager..."
                      className="h-20"
                      data-testid="textarea-key-roles"
                    />
                  </div>

                  <div>
                    <Label htmlFor="training-plan">Training & Development Plan</Label>
                    <Textarea
                      id="training-plan"
                      value={teamGrowth.trainingPlan}
                      onChange={(e) => setTeamGrowth({ ...teamGrowth, trainingPlan: e.target.value })}
                      placeholder="Onboarding process, technical training, professional development budget..."
                      className="h-20"
                      data-testid="textarea-training-plan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retention-strategy">Retention Strategy</Label>
                    <Textarea
                      id="retention-strategy"
                      value={teamGrowth.retentionStrategy}
                      onChange={(e) => setTeamGrowth({ ...teamGrowth, retentionStrategy: e.target.value })}
                      placeholder="Competitive salaries, equity options, career progression, flexible working..."
                      className="h-20"
                      data-testid="textarea-retention-strategy"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle>Capacity Planning</CardTitle>
                  </div>
                  <CardDescription>User growth and system capacity targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="current-users">Current Users</Label>
                      <Input
                        id="current-users"
                        type="number"
                        value={capacityPlan.currentUsers || ''}
                        onChange={(e) => setCapacityPlan({ ...capacityPlan, currentUsers: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-current-users"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-users">Target Users (24 months)</Label>
                      <Input
                        id="target-users"
                        type="number"
                        value={capacityPlan.targetUsers || ''}
                        onChange={(e) => setCapacityPlan({ ...capacityPlan, targetUsers: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-target-users"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="peak-load">Peak Load Capacity</Label>
                    <Textarea
                      id="peak-load"
                      value={capacityPlan.peakLoadCapacity}
                      onChange={(e) => setCapacityPlan({ ...capacityPlan, peakLoadCapacity: e.target.value })}
                      placeholder="Current: 1000 req/sec, Target: 10000 req/sec with auto-scaling..."
                      className="h-20"
                      data-testid="textarea-peak-load"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scalability-metrics">Scalability Metrics & KPIs</Label>
                    <Textarea
                      id="scalability-metrics"
                      value={capacityPlan.scalabilityMetrics}
                      onChange={(e) => setCapacityPlan({ ...capacityPlan, scalabilityMetrics: e.target.value })}
                      placeholder="Response time p95 < 200ms, 99.9% uptime, horizontal scaling to 100 instances..."
                      className="h-20"
                      data-testid="textarea-scalability-metrics"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bottlenecks">Current Bottlenecks</Label>
                    <Textarea
                      id="bottlenecks"
                      value={capacityPlan.bottlenecks}
                      onChange={(e) => setCapacityPlan({ ...capacityPlan, bottlenecks: e.target.value })}
                      placeholder="Database queries, single-region deployment, monolithic architecture..."
                      className="h-20"
                      data-testid="textarea-bottlenecks"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mitigation-plan">Bottleneck Mitigation Plan</Label>
                    <Textarea
                      id="mitigation-plan"
                      value={capacityPlan.mitigationPlan}
                      onChange={(e) => setCapacityPlan({ ...capacityPlan, mitigationPlan: e.target.value })}
                      placeholder="Implement caching, migrate to microservices, deploy to multiple regions..."
                      className="h-20"
                      data-testid="textarea-mitigation-plan"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="infrastructure" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    <CardTitle>Infrastructure Scaling</CardTitle>
                  </div>
                  <CardDescription>Cloud infrastructure and deployment strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="current-capacity">Current Capacity</Label>
                      <Input
                        id="current-capacity"
                        value={infrastructure.currentCapacity}
                        onChange={(e) => setInfrastructure({ ...infrastructure, currentCapacity: e.target.value })}
                        placeholder="e.g., Single region, 4 instances, 100GB storage"
                        data-testid="input-current-capacity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target-capacity">Target Capacity</Label>
                      <Input
                        id="target-capacity"
                        value={infrastructure.targetCapacity}
                        onChange={(e) => setInfrastructure({ ...infrastructure, targetCapacity: e.target.value })}
                        placeholder="e.g., Multi-region, 50 instances, 2TB storage"
                        data-testid="input-target-capacity"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scaling-strategy">Scaling Strategy</Label>
                    <Textarea
                      id="scaling-strategy"
                      value={infrastructure.scalingStrategy}
                      onChange={(e) => setInfrastructure({ ...infrastructure, scalingStrategy: e.target.value })}
                      placeholder="Horizontal auto-scaling based on CPU/memory, containerized microservices, CDN for static assets..."
                      className="h-24"
                      data-testid="textarea-scaling-strategy"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cloud-provider">Cloud Provider</Label>
                      <Input
                        id="cloud-provider"
                        value={infrastructure.cloudProvider}
                        onChange={(e) => setInfrastructure({ ...infrastructure, cloudProvider: e.target.value })}
                        placeholder="e.g., AWS (London region), Google Cloud UK"
                        data-testid="input-cloud-provider"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimated-cost">Estimated Annual Cost (£)</Label>
                      <Input
                        id="estimated-cost"
                        type="number"
                        value={infrastructure.estimatedCost || ''}
                        onChange={(e) => setInfrastructure({ ...infrastructure, estimatedCost: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-estimated-cost"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timeline">Implementation Timeline</Label>
                    <Input
                      id="timeline"
                      value={infrastructure.timeline}
                      onChange={(e) => setInfrastructure({ ...infrastructure, timeline: e.target.value })}
                      placeholder="e.g., Q1 2025 - Q2 2026"
                      data-testid="input-timeline"
                    />
                  </div>

                  <div>
                    <Label htmlFor="redundancy">Redundancy & Disaster Recovery</Label>
                    <Textarea
                      id="redundancy"
                      value={infrastructure.redundancy}
                      onChange={(e) => setInfrastructure({ ...infrastructure, redundancy: e.target.value })}
                      placeholder="Multi-AZ deployment, automated backups every 4 hours, cross-region replication, RTO < 1 hour..."
                      className="h-24"
                      data-testid="textarea-redundancy"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle>Process Automation</CardTitle>
                  </div>
                  <CardDescription>Operational efficiency through automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addProcessAutomation} size="sm" data-testid="button-add-process">
                    Add Process Automation
                  </Button>

                  {processAutomation.map((process) => (
                    <Card key={process.id} className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`process-name-${process.id}`}>Process Name</Label>
                          <Input
                            id={`process-name-${process.id}`}
                            value={process.processName}
                            onChange={(e) => updateProcessAutomation(process.id, 'processName', e.target.value)}
                            placeholder="e.g., Customer onboarding workflow"
                            data-testid={`input-process-name-${process.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`process-current-${process.id}`}>Current State</Label>
                          <Input
                            id={`process-current-${process.id}`}
                            value={process.currentState}
                            onChange={(e) => updateProcessAutomation(process.id, 'currentState', e.target.value)}
                            placeholder="e.g., Manual, 30 mins per customer"
                            data-testid={`input-process-current-${process.id}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`process-automation-${process.id}`}>Automation Plan</Label>
                          <Textarea
                            id={`process-automation-${process.id}`}
                            value={process.automationPlan}
                            onChange={(e) => updateProcessAutomation(process.id, 'automationPlan', e.target.value)}
                            placeholder="Automated email sequences, self-service portal, API integrations..."
                            className="h-20"
                            data-testid={`textarea-process-automation-${process.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`process-tools-${process.id}`}>Tools Required</Label>
                          <Input
                            id={`process-tools-${process.id}`}
                            value={process.toolsRequired}
                            onChange={(e) => updateProcessAutomation(process.id, 'toolsRequired', e.target.value)}
                            placeholder="e.g., Zapier, HubSpot, Custom API"
                            data-testid={`input-process-tools-${process.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`process-efficiency-${process.id}`}>Efficiency Gain</Label>
                          <Input
                            id={`process-efficiency-${process.id}`}
                            value={process.efficiencyGain}
                            onChange={(e) => updateProcessAutomation(process.id, 'efficiencyGain', e.target.value)}
                            placeholder="e.g., 90% time reduction, 5x throughput"
                            data-testid={`input-process-efficiency-${process.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`process-time-${process.id}`}>Implementation Time</Label>
                          <Input
                            id={`process-time-${process.id}`}
                            value={process.implementationTime}
                            onChange={(e) => updateProcessAutomation(process.id, 'implementationTime', e.target.value)}
                            placeholder="e.g., 6 weeks"
                            data-testid={`input-process-time-${process.id}`}
                          />
                        </div>
                        {processAutomation.length > 1 && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProcessAutomation(process.id)}
                              data-testid={`button-remove-process-${process.id}`}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Technology Upgrades</CardTitle>
                  </div>
                  <CardDescription>Strategic technology improvements and migrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addTechnologyUpgrade} size="sm" data-testid="button-add-tech">
                    Add Technology Upgrade
                  </Button>

                  {technologyUpgrades.map((tech) => (
                    <Card key={tech.id} className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`tech-component-${tech.id}`}>Component</Label>
                          <Input
                            id={`tech-component-${tech.id}`}
                            value={tech.component}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'component', e.target.value)}
                            placeholder="e.g., Database, Frontend Framework"
                            data-testid={`input-tech-component-${tech.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tech-current-${tech.id}`}>Current Technology</Label>
                          <Input
                            id={`tech-current-${tech.id}`}
                            value={tech.currentTech}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'currentTech', e.target.value)}
                            placeholder="e.g., PostgreSQL 12"
                            data-testid={`input-tech-current-${tech.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tech-target-${tech.id}`}>Target Technology</Label>
                          <Input
                            id={`tech-target-${tech.id}`}
                            value={tech.targetTech}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'targetTech', e.target.value)}
                            placeholder="e.g., PostgreSQL 15 with read replicas"
                            data-testid={`input-tech-target-${tech.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tech-rationale-${tech.id}`}>Rationale</Label>
                          <Input
                            id={`tech-rationale-${tech.id}`}
                            value={tech.rationale}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'rationale', e.target.value)}
                            placeholder="e.g., Better performance, lower costs, improved reliability"
                            data-testid={`input-tech-rationale-${tech.id}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`tech-migration-${tech.id}`}>Migration Plan</Label>
                          <Textarea
                            id={`tech-migration-${tech.id}`}
                            value={tech.migrationPlan}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'migrationPlan', e.target.value)}
                            placeholder="Phased rollout, blue-green deployment, data migration strategy..."
                            className="h-20"
                            data-testid={`textarea-tech-migration-${tech.id}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`tech-risk-${tech.id}`}>Risk Mitigation</Label>
                          <Textarea
                            id={`tech-risk-${tech.id}`}
                            value={tech.riskMitigation}
                            onChange={(e) => updateTechnologyUpgrade(tech.id, 'riskMitigation', e.target.value)}
                            placeholder="Rollback plan, comprehensive testing, staged deployment..."
                            className="h-20"
                            data-testid={`textarea-tech-risk-${tech.id}`}
                          />
                        </div>
                        {technologyUpgrades.length > 1 && (
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTechnologyUpgrade(tech.id)}
                              data-testid={`button-remove-tech-${tech.id}`}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>UK Scalability Alignment</CardTitle>
                  <CardDescription>Demonstrate UK market impact and economic benefit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job-creation-justification">Job Creation Justification</Label>
                    <Textarea
                      id="job-creation-justification"
                      value={ukScalabilityNotes.jobCreationJustification}
                      onChange={(e) => setUkScalabilityNotes({ ...ukScalabilityNotes, jobCreationJustification: e.target.value })}
                      placeholder="Explain how scaling creates UK employment opportunities and why roles must be UK-based..."
                      className="h-24"
                      data-testid="textarea-job-creation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="market-growth">UK Market Growth Potential</Label>
                    <Textarea
                      id="market-growth"
                      value={ukScalabilityNotes.marketGrowthPotential}
                      onChange={(e) => setUkScalabilityNotes({ ...ukScalabilityNotes, marketGrowthPotential: e.target.value })}
                      placeholder="UK market size, growth rate, total addressable market, competitive landscape..."
                      className="h-24"
                      data-testid="textarea-market-growth"
                    />
                  </div>

                  <div>
                    <Label htmlFor="competitive-positioning">Competitive Positioning in UK</Label>
                    <Textarea
                      id="competitive-positioning"
                      value={ukScalabilityNotes.competitivePositioning}
                      onChange={(e) => setUkScalabilityNotes({ ...ukScalabilityNotes, competitivePositioning: e.target.value })}
                      placeholder="Key UK competitors, your unique advantages, barriers to entry you create..."
                      className="h-24"
                      data-testid="textarea-competitive-positioning"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sustainability-plan">Long-term Sustainability Plan</Label>
                    <Textarea
                      id="sustainability-plan"
                      value={ukScalabilityNotes.sustainabilityPlan}
                      onChange={(e) => setUkScalabilityNotes({ ...ukScalabilityNotes, sustainabilityPlan: e.target.value })}
                      placeholder="Revenue model, path to profitability, sustainable competitive advantages..."
                      className="h-24"
                      data-testid="textarea-sustainability-plan"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Timeline</CardTitle>
                    <CardDescription>Roadmap visualization by target date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getMilestoneTimelineData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getMilestoneTimelineData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="status" fill="#3b82f6" name="Status (1=Planned, 2=In Progress, 3=Done)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones with target dates to see timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>Budget distribution across scaling categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getResourceAllocationData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getResourceAllocationData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Bar dataKey="budget" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add cost estimates to see resource allocation</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Trajectory</CardTitle>
                  <CardDescription>User and team growth projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Current', users: capacityPlan.currentUsers, team: teamGrowth.currentHeadcount },
                      { month: 'M12', users: Math.round(capacityPlan.currentUsers + (capacityPlan.targetUsers - capacityPlan.currentUsers) * 0.5), team: Math.round(teamGrowth.currentHeadcount + (teamGrowth.targetHeadcount - teamGrowth.currentHeadcount) * 0.5) },
                      { month: 'M24', users: capacityPlan.targetUsers, team: teamGrowth.targetHeadcount }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" name="Users" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="team" stroke="#10b981" name="Team Size" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scalability Metrics Summary</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">User Growth</p>
                      <p className="text-2xl font-bold" data-testid="text-user-growth">
                        {capacityPlan.currentUsers > 0 ? `${Math.round(((capacityPlan.targetUsers - capacityPlan.currentUsers) / capacityPlan.currentUsers) * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Team Growth</p>
                      <p className="text-2xl font-bold" data-testid="text-team-growth">
                        {teamGrowth.currentHeadcount > 0 ? `${Math.round(((teamGrowth.targetHeadcount - teamGrowth.currentHeadcount) / teamGrowth.currentHeadcount) * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">UK Jobs</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-uk-jobs">{teamGrowth.ukJobsCreated}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Infrastructure Spend</p>
                      <p className="text-2xl font-bold" data-testid="text-infra-spend">£{(infrastructure.estimatedCost || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered insights based on your scalability plan</CardDescription>
                </CardHeader>
                <CardContent>
                  {getSmartTips().length > 0 ? (
                    <div className="space-y-4">
                      {getSmartTips().map((tip, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Complete more sections to receive personalized recommendations</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Implementation Plan</CardTitle>
                  <CardDescription>Structured action plan to complete your scalability roadmap</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 border rounded-lg" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0">
                          <div className={`w-20 h-20 rounded-lg flex items-center justify-center text-sm font-bold ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {item.week}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                              item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </div>
    </>
  );
}
