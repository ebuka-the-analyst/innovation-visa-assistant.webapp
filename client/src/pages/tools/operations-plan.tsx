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
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Plus, Trash2, Target, Users, Zap, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

type ProcessCategory = 'core-operations' | 'customer-service' | 'finance' | 'hr' | 'product' | 'quality';
type ProcessStatus = 'not-started' | 'in-progress' | 'documented' | 'optimized';

type OperationalProcess = {
  id: string;
  name: string;
  category: ProcessCategory;
  description: string;
  owner: string;
  status: ProcessStatus;
  efficiency: number;
  completeness: number;
};

type ResourceRequirement = {
  id: string;
  type: 'staff' | 'equipment' | 'technology' | 'facilities' | 'suppliers';
  description: string;
  quantity: number;
  unitCost: number;
  timing: string;
};

type KPI = {
  id: string;
  name: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  critical: boolean;
};

const PROCESS_CATEGORIES = {
  'core-operations': { label: 'Core Operations', color: '#3b82f6' },
  'customer-service': { label: 'Customer Service', color: '#10b981' },
  'finance': { label: 'Finance', color: '#8b5cf6' },
  'hr': { label: 'Human Resources', color: '#f59e0b' },
  'product': { label: 'Product Development', color: '#ec4899' },
  'quality': { label: 'Quality Assurance', color: '#6b7280' },
};

const INITIAL_PROCESSES: OperationalProcess[] = [
  { id: 'p1', name: 'Customer Onboarding', category: 'core-operations', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
  { id: 'p2', name: 'Order Fulfillment', category: 'core-operations', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
  { id: 'p3', name: 'Quality Control', category: 'quality', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
  { id: 'p4', name: 'Customer Support', category: 'customer-service', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
  { id: 'p5', name: 'Financial Reporting', category: 'finance', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
  { id: 'p6', name: 'Employee Onboarding', category: 'hr', description: '', owner: '', status: 'not-started', efficiency: 0, completeness: 0 },
];

const INITIAL_RESOURCES: ResourceRequirement[] = [
  { id: 'r1', type: 'staff', description: 'Operations Manager', quantity: 1, unitCost: 45000, timing: 'Month 1' },
];

const INITIAL_KPIS: KPI[] = [
  { id: 'k1', name: 'Customer Acquisition Cost', category: 'Sales', target: 100, current: 0, unit: 'GBP', critical: true },
  { id: 'k2', name: 'Customer Satisfaction Score', category: 'Service', target: 90, current: 0, unit: '%', critical: true },
  { id: 'k3', name: 'Order Fulfillment Time', category: 'Operations', target: 24, current: 0, unit: 'hours', critical: true },
  { id: 'k4', name: 'Revenue Growth Rate', category: 'Finance', target: 20, current: 0, unit: '%', critical: true },
];

export default function OperationsPlan() {
  const [processes, setProcesses] = useState<OperationalProcess[]>(INITIAL_PROCESSES);
  const [resources, setResources] = useState<ResourceRequirement[]>(INITIAL_RESOURCES);
  const [kpis, setKPIs] = useState<KPI[]>(INITIAL_KPIS);
  const [activeTab, setActiveTab] = useState('processes');
  const [savedDate, setSavedDate] = useState('');

  // Calculations
  const totalProcesses = processes.length;
  const documentedProcesses = processes.filter(p => p.status === 'documented' || p.status === 'optimized').length;
  const optimizedProcesses = processes.filter(p => p.status === 'optimized').length;
  const avgEfficiency = processes.length > 0 ? Math.round(processes.reduce((sum, p) => sum + p.efficiency, 0) / processes.length) : 0;
  const avgCompleteness = processes.length > 0 ? Math.round(processes.reduce((sum, p) => sum + p.completeness, 0) / processes.length) : 0;
  
  const totalResourceCost = resources.reduce((sum, r) => sum + (r.quantity * r.unitCost), 0);
  const criticalKPIs = kpis.filter(k => k.critical);
  const kpisOnTarget = kpis.filter(k => k.current >= k.target).length;
  const kpiAchievementRate = kpis.length > 0 ? Math.round((kpisOnTarget / kpis.length) * 100) : 0;

  // Operational Readiness Score (0-100)
  const processScore = (documentedProcesses / totalProcesses) * 30;
  const efficiencyScore = (avgEfficiency / 100) * 25;
  const resourceScore = resources.length >= 5 ? 20 : (resources.length / 5) * 20;
  const kpiScore = (kpiAchievementRate / 100) * 25;
  const operationalReadinessScore = Math.round(processScore + efficiencyScore + resourceScore + kpiScore);

  // Chart data
  const processCategoryData = Object.entries(PROCESS_CATEGORIES).map(([key, value]) => {
    const categoryProcesses = processes.filter(p => p.category === key);
    const documented = categoryProcesses.filter(p => p.status === 'documented' || p.status === 'optimized').length;
    const avgEff = categoryProcesses.length > 0 
      ? categoryProcesses.reduce((sum, p) => sum + p.efficiency, 0) / categoryProcesses.length 
      : 0;
    
    return {
      category: value.label,
      total: categoryProcesses.length,
      documented,
      efficiency: Math.round(avgEff),
      color: value.color,
    };
  }).filter(item => item.total > 0);

  const processEfficiencyData = processes.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    efficiency: p.efficiency,
    completeness: p.completeness,
    color: PROCESS_CATEGORIES[p.category].color,
  }));

  const kpiDashboardData = kpis.map(k => ({
    name: k.name.length > 25 ? k.name.substring(0, 25) + '...' : k.name,
    target: k.target,
    current: k.current,
    achievement: k.target > 0 ? Math.round((k.current / k.target) * 100) : 0,
  }));

  // Capacity Timeline Data (12 months projection)
  const capacityTimelineData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const baseCapacity = 100;
    const growth = (month - 1) * 8.33; // Linear growth to reach 200% by month 12
    const staffCount = resources.filter(r => r.type === 'staff' && parseInt(r.timing.replace(/\D/g, '') || '1') <= month).reduce((sum, r) => sum + r.quantity, 0);
    
    return {
      month: `M${month}`,
      capacity: Math.round(baseCapacity + growth),
      utilization: Math.min(100, Math.round(baseCapacity + growth * 0.7)),
      staff: staffCount,
    };
  });

  // Resource Allocation Stacked Bar Chart Data
  const resourceAllocationStackedData = [
    {
      period: 'Q1',
      staff: resources.filter(r => r.type === 'staff' && ['Month 1', 'Month 2', 'Month 3'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      equipment: resources.filter(r => r.type === 'equipment' && ['Month 1', 'Month 2', 'Month 3'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      technology: resources.filter(r => r.type === 'technology' && ['Month 1', 'Month 2', 'Month 3'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      facilities: resources.filter(r => r.type === 'facilities' && ['Month 1', 'Month 2', 'Month 3'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      suppliers: resources.filter(r => r.type === 'suppliers' && ['Month 1', 'Month 2', 'Month 3'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
    },
    {
      period: 'Q2',
      staff: resources.filter(r => r.type === 'staff' && ['Month 4', 'Month 5', 'Month 6'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      equipment: resources.filter(r => r.type === 'equipment' && ['Month 4', 'Month 5', 'Month 6'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      technology: resources.filter(r => r.type === 'technology' && ['Month 4', 'Month 5', 'Month 6'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      facilities: resources.filter(r => r.type === 'facilities' && ['Month 4', 'Month 5', 'Month 6'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      suppliers: resources.filter(r => r.type === 'suppliers' && ['Month 4', 'Month 5', 'Month 6'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
    },
    {
      period: 'Q3',
      staff: resources.filter(r => r.type === 'staff' && ['Month 7', 'Month 8', 'Month 9'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      equipment: resources.filter(r => r.type === 'equipment' && ['Month 7', 'Month 8', 'Month 9'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      technology: resources.filter(r => r.type === 'technology' && ['Month 7', 'Month 8', 'Month 9'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      facilities: resources.filter(r => r.type === 'facilities' && ['Month 7', 'Month 8', 'Month 9'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      suppliers: resources.filter(r => r.type === 'suppliers' && ['Month 7', 'Month 8', 'Month 9'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
    },
    {
      period: 'Q4',
      staff: resources.filter(r => r.type === 'staff' && ['Month 10', 'Month 11', 'Month 12'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      equipment: resources.filter(r => r.type === 'equipment' && ['Month 10', 'Month 11', 'Month 12'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      technology: resources.filter(r => r.type === 'technology' && ['Month 10', 'Month 11', 'Month 12'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      facilities: resources.filter(r => r.type === 'facilities' && ['Month 10', 'Month 11', 'Month 12'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
      suppliers: resources.filter(r => r.type === 'suppliers' && ['Month 10', 'Month 11', 'Month 12'].includes(r.timing)).reduce((sum, r) => sum + (r.quantity * r.unitCost), 0),
    },
  ];

  const readinessRadarData = [
    { metric: 'Process\nDocumentation', score: (documentedProcesses / totalProcesses) * 100, fullMark: 100 },
    { metric: 'Operational\nEfficiency', score: avgEfficiency, fullMark: 100 },
    { metric: 'Resource\nPlanning', score: resources.length >= 5 ? 100 : (resources.length / 5) * 100, fullMark: 100 },
    { metric: 'KPI\nAchievement', score: kpiAchievementRate, fullMark: 100 },
    { metric: 'Process\nOptimization', score: totalProcesses > 0 ? (optimizedProcesses / totalProcesses) * 100 : 0, fullMark: 100 },
  ];

  // CRUD operations
  const addProcess = () => {
    setProcesses([...processes, {
      id: `p${Date.now()}`,
      name: 'New Process',
      category: 'core-operations',
      description: '',
      owner: '',
      status: 'not-started',
      efficiency: 0,
      completeness: 0,
    }]);
  };

  const updateProcess = (id: string, field: keyof OperationalProcess, value: any) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const addResource = () => {
    setResources([...resources, {
      id: `r${Date.now()}`,
      type: 'staff',
      description: '',
      quantity: 1,
      unitCost: 0,
      timing: 'Month 1',
    }]);
  };

  const updateResource = (id: string, field: keyof ResourceRequirement, value: any) => {
    setResources(resources.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const addKPI = () => {
    setKPIs([...kpis, {
      id: `k${Date.now()}`,
      name: '',
      category: 'Operations',
      target: 0,
      current: 0,
      unit: '',
      critical: false,
    }]);
  };

  const updateKPI = (id: string, field: keyof KPI, value: any) => {
    setKPIs(kpis.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const removeKPI = (id: string) => {
    setKPIs(kpis.filter(k => k.id !== id));
  };

  // Save/Restore
  const getSerializedState = () => {
    return {
      processes,
      resources,
      kpis,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('processes' in state) setProcesses(state.processes);
    if ('resources' in state) setResources(state.resources);
    if ('kpis' in state) setKPIs(state.kpis);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'operations-plan_handoff';
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
      const saved = localStorage.getItem('operations-plan-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('operations-plan-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('operations-plan-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (documentedProcesses < totalProcesses * 0.7) {
      tips.push("Document at least 70% of operational processes before endorser submission - comprehensive process documentation demonstrates operational capability and business scalability to UK visa assessors");
    }
    
    if (avgEfficiency < 70) {
      tips.push("Target minimum 70% efficiency across all processes - endorsing bodies assess operational maturity and your ability to execute business plans effectively in UK market conditions");
    }
    
    if (resources.length < 5) {
      tips.push("Detail at least 5 key resource requirements (staff, equipment, technology) showing you have thought through operational needs for first 6-12 months of UK operations");
    }
    
    if (resources.filter(r => r.type === 'staff').length < 2) {
      tips.push("Specify staff requirements for key roles with UK resident hiring plans - this supports your job creation claims and demonstrates scalability plans critical for Innovator Founder visa approval");
    }
    
    if (kpis.filter(k => k.critical).length < 3) {
      tips.push("Define at least 3 critical KPIs aligned with your business model - measurable targets show professional management approach and operational accountability expected by endorsing bodies");
    }
    
    if (processes.some(p => !p.owner && (p.status === 'documented' || p.status === 'optimized'))) {
      tips.push("Assign process owners to all documented procedures - clear accountability demonstrates strong organizational structure and governance frameworks expected by UK visa endorsing bodies");
    }
    
    if (operationalReadinessScore >= 80) {
      tips.push("Excellent operational readiness score - prepare detailed documentation explaining how these processes support your innovation claims, job creation commitments, and scalability in UK market");
    }
    
    if (totalResourceCost < 10000) {
      tips.push("Ensure resource planning is appropriate for your business plan - demonstrate how capital will be strategically deployed across operational needs to achieve business milestones");
    }
    
    if (processes.filter(p => p.category === 'core-operations').every(p => p.status === 'not-started')) {
      tips.push("Prioritize Core Operations processes first - customer onboarding, order fulfillment, and quality control are fundamental to demonstrating business viability and operational readiness to endorsers");
    }
    
    if (kpiAchievementRate < 50 && kpis.some(k => k.current > 0)) {
      tips.push("Set realistic KPI targets based on UK market benchmarks and your business stage - overly ambitious targets without supporting data may raise credibility concerns with endorsing bodies");
    }
    
    if (resources.filter(r => r.type === 'staff').reduce((sum, r) => sum + r.quantity, 0) < 2) {
      tips.push("Plan for at least 2 UK resident hires within 12 months - demonstrable job creation is a key criterion for Innovator Founder visa and strengthens your application significantly");
    }
    
    if (!processes.some(p => p.category === 'quality')) {
      tips.push("Include Quality Assurance processes - demonstrating commitment to quality control and continuous improvement shows operational maturity valued by UK visa endorsing bodies");
    }

    return tips;
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Document all Core Operations processes with detailed step-by-step workflows - customer onboarding procedure, order fulfillment process, quality control checklist with acceptance criteria",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Create professional process flowcharts for all critical operational workflows using Lucidchart, Miro, or Microsoft Visio - include decision points, handoffs, and timelines",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Assign clear process owners with defined responsibilities and document current efficiency baseline metrics for each core business process",
        priority: "High"
      },
      {
        week: "Week 2",
        action: "Define comprehensive resource requirements - staff roles with job descriptions, equipment specifications, technology stack, facilities needs, and strategic supplier relationships for first 12 months of UK operations",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Establish 5-10 critical KPIs aligned with business model and industry benchmarks - include operational efficiency, customer satisfaction, financial performance, growth metrics, and quality indicators",
        priority: "Critical"
      },
      {
        week: "Week 2-3",
        action: "Document Customer Service and HR processes in detail - support escalation procedures, complaint resolution workflow, employee onboarding checklist, performance management framework, training plans",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Create detailed operational budget showing quarterly resource allocation across staff, equipment, technology, facilities - demonstrate strategic alignment with your investment and financial projections",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Develop specific efficiency improvement initiatives for each process category with measurable targets - show continuous improvement mindset and operational excellence culture",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Document Product Development and Quality Assurance processes if applicable - requirements gathering, design review, testing procedures, deployment workflows, incident response protocols",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Create comprehensive KPI measurement and tracking system - design dashboards, define reporting frequency and formats, establish accountability structure with regular review meetings",
        priority: "Medium"
      },
      {
        week: "Week 4",
        action: "Prepare operational capability narrative document (3-5 pages) explaining how your processes, resource plan, and KPI framework demonstrate business scalability and UK job creation potential",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Have external business advisor, mentor, or sector expert review complete operations plan for credibility, completeness, realism, and alignment with UK Innovator Founder visa endorser expectations",
        priority: "High"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - OPERATIONAL PLAN
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

OPERATIONAL READINESS SUMMARY
${'-'.repeat(80)}
Overall Readiness Score: ${operationalReadinessScore}/100
Status: ${operationalReadinessScore >= 80 ? 'VISA-READY' : operationalReadinessScore >= 60 ? 'GOOD PROGRESS' : 'MORE WORK NEEDED'}

Total Processes Defined: ${totalProcesses}
Documented Processes: ${documentedProcesses} (${Math.round((documentedProcesses/totalProcesses)*100)}%)
Optimized Processes: ${optimizedProcesses}
Average Efficiency: ${avgEfficiency}%
Average Completeness: ${avgCompleteness}%

Total Resource Requirements: ${resources.length}
Total Resource Investment: £${totalResourceCost.toLocaleString()}

Total KPIs Defined: ${kpis.length}
Critical KPIs: ${criticalKPIs.length}
KPIs On Target: ${kpisOnTarget}
KPI Achievement Rate: ${kpiAchievementRate}%

OPERATIONAL PROCESSES
${'-'.repeat(80)}

${Object.entries(PROCESS_CATEGORIES).map(([key, value]) => {
  const categoryProcesses = processes.filter(p => p.category === key);
  if (categoryProcesses.length === 0) return '';
  
  return `
${value.label}
${'─'.repeat(40)}
${categoryProcesses.map(proc => `
[${proc.status === 'optimized' ? '★★' : proc.status === 'documented' ? '★' : proc.status === 'in-progress' ? '◐' : '○'}] ${proc.name}
Status: ${proc.status} | Efficiency: ${proc.efficiency}% | Completeness: ${proc.completeness}%
Owner: ${proc.owner || 'Unassigned'}
${proc.description ? `Description: ${proc.description}` : ''}
`).join('')}`;
}).filter(Boolean).join('\n')}

RESOURCE REQUIREMENTS
${'-'.repeat(80)}
${resources.map((res, i) => `
${i + 1}. ${res.description || 'Unnamed Resource'}
   Type: ${res.type.charAt(0).toUpperCase() + res.type.slice(1)}
   Quantity: ${res.quantity}
   Unit Cost: £${res.unitCost.toLocaleString()}
   Total Cost: £${(res.quantity * res.unitCost).toLocaleString()}
   Timing: ${res.timing}
`).join('')}

Total Resource Investment: £${totalResourceCost.toLocaleString()}

Resource Allocation by Type:
Staff: £${resources.filter(r => r.type === 'staff').reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toLocaleString()}
Equipment: £${resources.filter(r => r.type === 'equipment').reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toLocaleString()}
Technology: £${resources.filter(r => r.type === 'technology').reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toLocaleString()}
Facilities: £${resources.filter(r => r.type === 'facilities').reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toLocaleString()}
Suppliers: £${resources.filter(r => r.type === 'suppliers').reduce((sum, r) => sum + (r.quantity * r.unitCost), 0).toLocaleString()}

KEY PERFORMANCE INDICATORS (KPIs)
${'-'.repeat(80)}
${kpis.map((kpi, i) => `
${i + 1}. ${kpi.name}${kpi.critical ? ' [CRITICAL]' : ''}
   Category: ${kpi.category}
   Target: ${kpi.target} ${kpi.unit}
   Current: ${kpi.current} ${kpi.unit}
   Achievement: ${kpi.target > 0 ? Math.round((kpi.current/kpi.target)*100) : 0}%
   Status: ${kpi.current >= kpi.target ? 'ON TARGET' : 'BELOW TARGET'}
`).join('')}

PROCESS CATEGORY ANALYSIS
${'-'.repeat(80)}
${processCategoryData.map(cat => `
${cat.category}
  Total Processes: ${cat.total}
  Documented: ${cat.documented} (${Math.round((cat.documented/cat.total)*100)}%)
  Average Efficiency: ${cat.efficiency}%
`).join('')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

OPERATIONAL CAPABILITY EVIDENCE FOR UK VISA
${'-'.repeat(80)}

Process Documentation Requirements:
□ Core Operations - Customer onboarding, order fulfillment, quality control
□ Customer Service - Support procedures, complaint resolution, feedback loops
□ Financial Management - Invoicing, expense approval, financial reporting
□ Human Resources - Recruitment, onboarding, performance management
□ Product Development - Requirements, testing, deployment (if applicable)
□ Quality Assurance - Testing procedures, incident response

Resource Planning Evidence:
□ Detailed staff requirements with roles, responsibilities, and UK salary bands
□ Equipment and technology needs with specifications and costs
□ Facilities requirements (office space, manufacturing, storage)
□ Supplier and vendor relationships for key operational dependencies
□ Total resource budget aligned with your investment plan
□ Timeline showing when resources will be acquired (Month 1-12)

KPI Framework Requirements:
□ 5-10 critical KPIs covering operations, finance, customer, and growth
□ Clear target values based on UK market benchmarks or business model
□ Measurement methodology and tracking frequency defined
□ Accountability structure showing who monitors each KPI
□ Link between KPIs and business plan projections
□ Realistic achievement timeline

Operational Maturity Indicators:
□ Process efficiency targets of 70%+ demonstrating professional operations
□ Clear process ownership showing organizational accountability
□ Continuous improvement initiatives for each process category
□ Quality control and assurance procedures
□ Customer satisfaction and retention mechanisms
□ Scalability evidence - processes designed for growth

UK Job Creation Support:
□ Staff requirements showing planned UK resident hires
□ Org chart indicating reporting lines and team structure
□ Salary budget allocation demonstrating genuine employment
□ Timeline for hiring aligned with business growth milestones
□ Job descriptions for key roles supporting innovation claims

Innovation Integration:
□ How operational processes support innovative business model
□ Technology and systems enabling competitive advantage
□ Quality assurance ensuring innovation delivers value
□ Continuous improvement mechanisms for ongoing innovation

Endorser Presentation Package:
□ Operations plan summary document (2-3 pages)
□ Process flowcharts for critical workflows
□ Resource requirements spreadsheet with costs and timing
□ KPI dashboard template showing measurement approach
□ Process documentation samples (SOPs, templates)
□ Organizational chart with process ownership mapped
□ Operational budget aligned with financial projections

NEXT STEPS FOR VISA APPLICATION
${'-'.repeat(80)}
1. Complete documentation of all Core Operations processes (Target: 100%)
2. Define staff requirements for at least 2 UK resident roles within 12 months
3. Create process efficiency metrics dashboard with baseline measurements
4. Document quality control and customer satisfaction procedures
5. Prepare operational capability narrative linking processes to innovation claims
6. Have accountant verify resource budget aligns with funding evidence
7. Obtain advisor review confirming operational plan credibility and completeness

COMPLIANCE CHECKLIST
${'-'.repeat(80)}
□ Operations plan demonstrates business scalability
□ Resource requirements show job creation potential (2+ UK roles)
□ KPIs aligned with financial projections in business plan
□ Process documentation shows professional operational capability
□ Resource budget consistent with your investment plan
□ Efficiency targets demonstrate competitive operational performance
□ Quality assurance procedures ensure innovation delivers value
□ Org structure and accountability framework clearly defined

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operations-plan-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-operations-plan">Operations Plan</h1>
            <p className="text-lg text-muted-foreground" data-testid="text-subtitle">Define operational processes, resources, and KPIs to demonstrate business scalability</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="operations-plan"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Operations Plan"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-operations-plan">
              <TabsTrigger value="processes" data-testid="tab-processes">Processes</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
              <TabsTrigger value="kpis" data-testid="tab-kpis">KPIs</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="processes" className="space-y-6" data-testid="content-processes">
              <Card data-testid="card-readiness-summary">
                <CardHeader>
                  <CardTitle data-testid="title-readiness">Operational Readiness Score</CardTitle>
                  <CardDescription data-testid="description-readiness">Overall operational capability assessment for UK visa application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={operationalReadinessScore >= 80 ? "border-green-500" : operationalReadinessScore >= 60 ? "border-orange-500" : "border-destructive"} data-testid="card-readiness-score">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-readiness-score">Readiness Score</p>
                          <p className="text-3xl font-bold" data-testid="text-readiness-score">{operationalReadinessScore}/100</p>
                          <Progress value={operationalReadinessScore} className="mt-2" data-testid="progress-readiness" />
                          <p className="text-xs text-muted-foreground mt-2" data-testid="text-readiness-status">
                            {operationalReadinessScore >= 80 ? 'Visa-Ready' : operationalReadinessScore >= 60 ? 'Good Progress' : 'More Work Needed'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-documentation">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Target className="h-6 w-6 mx-auto mb-2 text-primary" data-testid="icon-documentation" />
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-documentation">Documentation</p>
                          <p className="text-2xl font-bold" data-testid="text-documentation-rate">{documentedProcesses}/{totalProcesses}</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-documentation-percent">{Math.round((documentedProcesses/totalProcesses)*100)}% Documented</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-efficiency">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Zap className="h-6 w-6 mx-auto mb-2 text-primary" data-testid="icon-efficiency" />
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-efficiency">Avg Efficiency</p>
                          <p className="text-2xl font-bold text-primary" data-testid="text-avg-efficiency">{avgEfficiency}%</p>
                          <Progress value={avgEfficiency} className="mt-2" data-testid="progress-efficiency" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-kpi-summary">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" data-testid="icon-kpi" />
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-kpi-achievement">KPI Achievement</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-kpi-achievement">{kpiAchievementRate}%</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-kpi-count">{kpisOnTarget}/{kpis.length} on target</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {operationalReadinessScore < 60 && (
                    <Alert variant="destructive" data-testid="alert-low-readiness">
                      <AlertTriangle className="h-4 w-4" data-testid="icon-warning" />
                      <AlertDescription data-testid="text-warning">
                        Your operational readiness score needs improvement. Focus on documenting processes, defining resources, and establishing measurable KPIs.
                      </AlertDescription>
                    </Alert>
                  )}

                  {operationalReadinessScore >= 80 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-high-readiness">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" data-testid="icon-success" />
                      <AlertDescription className="text-green-600 dark:text-green-400" data-testid="text-success">
                        Excellent operational readiness! Your plan demonstrates strong operational capability and scalability for visa endorsers.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" data-testid="heading-processes">Operational Processes</h3>
                      <Button onClick={addProcess} size="sm" data-testid="button-add-process">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Process
                      </Button>
                    </div>

                    {processes.map((process) => (
                      <Card key={process.id} className="p-4" data-testid={`card-process-${process.id}`}>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`process-name-${process.id}`} data-testid={`label-process-name-${process.id}`}>Process Name</Label>
                              <Input
                                id={`process-name-${process.id}`}
                                value={process.name}
                                onChange={(e) => updateProcess(process.id, 'name', e.target.value)}
                                placeholder="e.g., Customer Onboarding"
                                data-testid={`input-process-name-${process.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`process-category-${process.id}`} data-testid={`label-process-category-${process.id}`}>Category</Label>
                              <select
                                id={`process-category-${process.id}`}
                                value={process.category}
                                onChange={(e) => updateProcess(process.id, 'category', e.target.value as ProcessCategory)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-process-category-${process.id}`}
                              >
                                {Object.entries(PROCESS_CATEGORIES).map(([key, value]) => (
                                  <option key={key} value={key}>{value.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`process-description-${process.id}`} data-testid={`label-process-description-${process.id}`}>Description</Label>
                            <Textarea
                              id={`process-description-${process.id}`}
                              value={process.description}
                              onChange={(e) => updateProcess(process.id, 'description', e.target.value)}
                              placeholder="Describe the process, key steps, and objectives"
                              className="h-20"
                              data-testid={`textarea-process-description-${process.id}`}
                            />
                          </div>

                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`process-owner-${process.id}`} data-testid={`label-process-owner-${process.id}`}>Process Owner</Label>
                              <Input
                                id={`process-owner-${process.id}`}
                                value={process.owner}
                                onChange={(e) => updateProcess(process.id, 'owner', e.target.value)}
                                placeholder="Role/Name"
                                data-testid={`input-process-owner-${process.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`process-status-${process.id}`} data-testid={`label-process-status-${process.id}`}>Status</Label>
                              <select
                                id={`process-status-${process.id}`}
                                value={process.status}
                                onChange={(e) => updateProcess(process.id, 'status', e.target.value as ProcessStatus)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-process-status-${process.id}`}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="documented">Documented</option>
                                <option value="optimized">Optimized</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`process-efficiency-${process.id}`} data-testid={`label-process-efficiency-${process.id}`}>Efficiency (%)</Label>
                              <Input
                                id={`process-efficiency-${process.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={process.efficiency}
                                onChange={(e) => updateProcess(process.id, 'efficiency', parseInt(e.target.value) || 0)}
                                data-testid={`input-process-efficiency-${process.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`process-completeness-${process.id}`} data-testid={`label-process-completeness-${process.id}`}>Completeness (%)</Label>
                              <Input
                                id={`process-completeness-${process.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={process.completeness}
                                onChange={(e) => updateProcess(process.id, 'completeness', parseInt(e.target.value) || 0)}
                                data-testid={`input-process-completeness-${process.id}`}
                              />
                            </div>
                          </div>

                          {processes.length > 1 && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProcess(process.id)}
                                data-testid={`button-remove-process-${process.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6" data-testid="content-resources">
              <Card data-testid="card-resource-requirements">
                <CardHeader>
                  <CardTitle data-testid="title-resources">Resource Requirements</CardTitle>
                  <CardDescription data-testid="description-resources">Define staff, equipment, technology, and facility needs for first 12 months</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card data-testid="card-total-resources">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-2 text-primary" data-testid="icon-resources" />
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-total-resources">Total Resources</p>
                          <p className="text-3xl font-bold" data-testid="text-total-resources">{resources.length}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-resource-cost">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-resource-cost">Total Investment</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-resource-cost">£{totalResourceCost.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1" data-testid="text-cost-note">Annual cost estimate</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" data-testid="heading-resource-list">Resource List</h3>
                      <Button onClick={addResource} size="sm" data-testid="button-add-resource">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </div>

                    {resources.map((resource) => (
                      <Card key={resource.id} className="p-4" data-testid={`card-resource-${resource.id}`}>
                        <div className="grid md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`resource-description-${resource.id}`} data-testid={`label-resource-description-${resource.id}`}>Description</Label>
                            <Input
                              id={`resource-description-${resource.id}`}
                              value={resource.description}
                              onChange={(e) => updateResource(resource.id, 'description', e.target.value)}
                              placeholder="e.g., Operations Manager"
                              data-testid={`input-resource-description-${resource.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`resource-type-${resource.id}`} data-testid={`label-resource-type-${resource.id}`}>Type</Label>
                            <select
                              id={`resource-type-${resource.id}`}
                              value={resource.type}
                              onChange={(e) => updateResource(resource.id, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-resource-type-${resource.id}`}
                            >
                              <option value="staff">Staff</option>
                              <option value="equipment">Equipment</option>
                              <option value="technology">Technology</option>
                              <option value="facilities">Facilities</option>
                              <option value="suppliers">Suppliers</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`resource-quantity-${resource.id}`} data-testid={`label-resource-quantity-${resource.id}`}>Quantity</Label>
                            <Input
                              id={`resource-quantity-${resource.id}`}
                              type="number"
                              min="1"
                              value={resource.quantity}
                              onChange={(e) => updateResource(resource.id, 'quantity', parseInt(e.target.value) || 1)}
                              data-testid={`input-resource-quantity-${resource.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`resource-cost-${resource.id}`} data-testid={`label-resource-cost-${resource.id}`}>Unit Cost (£)</Label>
                            <Input
                              id={`resource-cost-${resource.id}`}
                              type="number"
                              min="0"
                              value={resource.unitCost}
                              onChange={(e) => updateResource(resource.id, 'unitCost', parseFloat(e.target.value) || 0)}
                              data-testid={`input-resource-cost-${resource.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`resource-timing-${resource.id}`} data-testid={`label-resource-timing-${resource.id}`}>Timing</Label>
                            <Input
                              id={`resource-timing-${resource.id}`}
                              value={resource.timing}
                              onChange={(e) => updateResource(resource.id, 'timing', e.target.value)}
                              placeholder="Month 1"
                              data-testid={`input-resource-timing-${resource.id}`}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground" data-testid={`text-resource-total-${resource.id}`}>
                            Total: £{(resource.quantity * resource.unitCost).toLocaleString()}
                          </p>
                          {resources.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                              data-testid={`button-remove-resource-${resource.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kpis" className="space-y-6" data-testid="content-kpis">
              <Card data-testid="card-kpis">
                <CardHeader>
                  <CardTitle data-testid="title-kpis">Key Performance Indicators</CardTitle>
                  <CardDescription data-testid="description-kpis">Define measurable targets to track operational success</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card data-testid="card-kpi-total">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-kpi-total">Total KPIs</p>
                          <p className="text-3xl font-bold" data-testid="text-total-kpis">{kpis.length}</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-critical-kpis">{criticalKPIs.length} critical</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-kpi-on-target">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-kpi-on-target">On Target</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-kpis-on-target">{kpisOnTarget}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-kpi-achievement-rate">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2" data-testid="label-kpi-rate">Achievement Rate</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-kpi-rate">{kpiAchievementRate}%</p>
                          <Progress value={kpiAchievementRate} className="mt-2" data-testid="progress-kpi-rate" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" data-testid="heading-kpi-list">KPI List</h3>
                      <Button onClick={addKPI} size="sm" data-testid="button-add-kpi">
                        <Plus className="h-4 w-4 mr-2" />
                        Add KPI
                      </Button>
                    </div>

                    {kpis.map((kpi) => (
                      <Card key={kpi.id} className="p-4" data-testid={`card-kpi-${kpi.id}`}>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`kpi-name-${kpi.id}`} data-testid={`label-kpi-name-${kpi.id}`}>KPI Name</Label>
                              <Input
                                id={`kpi-name-${kpi.id}`}
                                value={kpi.name}
                                onChange={(e) => updateKPI(kpi.id, 'name', e.target.value)}
                                placeholder="e.g., Customer Satisfaction"
                                data-testid={`input-kpi-name-${kpi.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`kpi-category-${kpi.id}`} data-testid={`label-kpi-category-${kpi.id}`}>Category</Label>
                              <Input
                                id={`kpi-category-${kpi.id}`}
                                value={kpi.category}
                                onChange={(e) => updateKPI(kpi.id, 'category', e.target.value)}
                                placeholder="e.g., Sales, Operations"
                                data-testid={`input-kpi-category-${kpi.id}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor={`kpi-target-${kpi.id}`} data-testid={`label-kpi-target-${kpi.id}`}>Target</Label>
                              <Input
                                id={`kpi-target-${kpi.id}`}
                                type="number"
                                value={kpi.target}
                                onChange={(e) => updateKPI(kpi.id, 'target', parseFloat(e.target.value) || 0)}
                                data-testid={`input-kpi-target-${kpi.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`kpi-current-${kpi.id}`} data-testid={`label-kpi-current-${kpi.id}`}>Current</Label>
                              <Input
                                id={`kpi-current-${kpi.id}`}
                                type="number"
                                value={kpi.current}
                                onChange={(e) => updateKPI(kpi.id, 'current', parseFloat(e.target.value) || 0)}
                                data-testid={`input-kpi-current-${kpi.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`kpi-unit-${kpi.id}`} data-testid={`label-kpi-unit-${kpi.id}`}>Unit</Label>
                              <Input
                                id={`kpi-unit-${kpi.id}`}
                                value={kpi.unit}
                                onChange={(e) => updateKPI(kpi.id, 'unit', e.target.value)}
                                placeholder="%, GBP, hours"
                                data-testid={`input-kpi-unit-${kpi.id}`}
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer h-9">
                                <input
                                  type="checkbox"
                                  checked={kpi.critical}
                                  onChange={(e) => updateKPI(kpi.id, 'critical', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-kpi-critical-${kpi.id}`}
                                />
                                <span className="text-sm">Critical</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {kpi.current >= kpi.target ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" data-testid={`icon-kpi-success-${kpi.id}`} />
                              ) : (
                                <XCircle className="h-5 w-5 text-orange-500" data-testid={`icon-kpi-warning-${kpi.id}`} />
                              )}
                              <span className="text-sm text-muted-foreground" data-testid={`text-kpi-achievement-${kpi.id}`}>
                                Achievement: {kpi.target > 0 ? Math.round((kpi.current/kpi.target)*100) : 0}%
                              </span>
                            </div>
                            {kpis.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeKPI(kpi.id)}
                                data-testid={`button-remove-kpi-${kpi.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6" data-testid="content-analysis">
              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-capacity-timeline">
                  <CardHeader>
                    <CardTitle data-testid="title-capacity-timeline">Operational Capacity Timeline</CardTitle>
                    <CardDescription data-testid="description-capacity-timeline">12-month capacity and utilization projection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={capacityTimelineData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="capacity" 
                          stroke="#3b82f6" 
                          name="Capacity %" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="utilization" 
                          stroke="#10b981" 
                          name="Utilization %" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card data-testid="card-resource-allocation-stacked">
                  <CardHeader>
                    <CardTitle data-testid="title-resource-allocation">Resource Allocation by Quarter</CardTitle>
                    <CardDescription data-testid="description-resource-allocation">Quarterly investment breakdown by resource type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={resourceAllocationStackedData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="period" 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                          formatter={(value: number) => `£${value.toLocaleString()}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="staff" stackId="a" fill="#3b82f6" name="Staff" />
                        <Bar dataKey="equipment" stackId="a" fill="#10b981" name="Equipment" />
                        <Bar dataKey="technology" stackId="a" fill="#8b5cf6" name="Technology" />
                        <Bar dataKey="facilities" stackId="a" fill="#f59e0b" name="Facilities" />
                        <Bar dataKey="suppliers" stackId="a" fill="#ec4899" name="Suppliers" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card data-testid="card-process-efficiency">
                  <CardHeader>
                    <CardTitle data-testid="title-process-efficiency">Process Efficiency by Category</CardTitle>
                    <CardDescription data-testid="description-process-efficiency">Average efficiency across process categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {processCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="category" 
                            angle={-45} 
                            textAnchor="end" 
                            height={100}
                            className="text-muted-foreground"
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                          />
                          <YAxis 
                            className="text-muted-foreground"
                            tick={{ fill: 'currentColor' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))' 
                            }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="efficiency" name="Efficiency %" fill="#3b82f6">
                            {processCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12" data-testid="text-no-process-data">Add processes to see efficiency analysis</p>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-readiness-radar">
                  <CardHeader>
                    <CardTitle data-testid="title-readiness-radar">Operational Readiness Radar</CardTitle>
                    <CardDescription data-testid="description-readiness-radar">Multi-dimensional readiness assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={readinessRadarData}>
                        <PolarGrid className="stroke-muted" />
                        <PolarAngleAxis 
                          dataKey="metric" 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor', fontSize: 11 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Radar 
                          name="Score" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-kpi-dashboard-chart">
                <CardHeader>
                  <CardTitle data-testid="title-kpi-dashboard">KPI Performance Dashboard</CardTitle>
                  <CardDescription data-testid="description-kpi-dashboard">Target vs current performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  {kpiDashboardData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={kpiDashboardData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor', fontSize: 11 }}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))' 
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="target" name="Target" fill="#8b5cf6" />
                        <Bar dataKey="current" name="Current" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12" data-testid="text-no-kpi-data">Add KPIs to see dashboard</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6" data-testid="content-tips">
              <Card data-testid="card-smart-tips">
                <CardHeader>
                  <CardTitle data-testid="title-smart-tips">Smart Recommendations</CardTitle>
                  <CardDescription data-testid="description-smart-tips">AI-powered operational planning guidance for UK visa success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <TrendingUp className="h-4 w-4" data-testid={`icon-tip-${index}`} />
                        <AlertDescription data-testid={`text-tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-action-plan">
                <CardHeader>
                  <CardTitle data-testid="title-action-plan">4-Week Action Plan</CardTitle>
                  <CardDescription data-testid="description-action-plan">Prioritized timeline for operational planning completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg border hover-elevate" data-testid={`item-action-${index}`}>
                        <div className="flex-shrink-0">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' :
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`} data-testid={`badge-priority-${index}`}>
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1" data-testid={`text-week-${index}`}>{item.week}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-action-${index}`}>{item.action}</p>
                        </div>
                      </div>
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
