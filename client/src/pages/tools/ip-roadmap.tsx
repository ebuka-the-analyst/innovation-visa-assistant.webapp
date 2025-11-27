import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Calendar, TrendingUp, Shield, FileText, Copyright, Lock, Palette, Clock } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type IPType = 'patent' | 'trademark' | 'copyright' | 'trade-secret' | 'design';
type MilestoneStatus = 'planned' | 'in-progress' | 'completed' | 'delayed';

type IPMilestone = {
  name: string;
  type: IPType;
  targetDate: string;
  completionDate: string;
  estimatedCost: number;
  actualCost: number;
  status: MilestoneStatus;
  jurisdiction: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string;
  notes: string;
};

const IP_TYPE_LABELS: Record<IPType, string> = {
  'patent': 'Patent',
  'trademark': 'Trademark',
  'copyright': 'Copyright',
  'trade-secret': 'Trade Secret',
  'design': 'Design',
};

const IP_TYPE_COLORS: Record<IPType, string> = {
  'patent': '#3b82f6',
  'trademark': '#10b981',
  'copyright': '#f59e0b',
  'trade-secret': '#8b5cf6',
  'design': '#ec4899',
};

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  'planned': '#6b7280',
  'in-progress': '#3b82f6',
  'completed': '#10b981',
  'delayed': '#ef4444',
};

const UK_IPO_TIMELINES = {
  patent: { min: 12, max: 36, typical: 18, unit: 'months' },
  trademark: { min: 4, max: 6, typical: 5, unit: 'months' },
  copyright: { min: 0, max: 0, typical: 0, unit: 'immediate' },
  design: { min: 1, max: 2, typical: 1.5, unit: 'months' },
  'trade-secret': { min: 0, max: 0, typical: 0, unit: 'ongoing' },
};

const UK_IPO_COSTS = {
  patent: { filing: 4000, professional: 4000, total: 8000 },
  trademark: { filing: 170, professional: 1000, total: 1500 },
  copyright: { filing: 0, professional: 0, total: 0 },
  design: { filing: 50, professional: 1000, total: 1200 },
  'trade-secret': { filing: 0, professional: 500, total: 500 },
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'ip-roadmap',
  toolName: 'IP Filing Roadmap',
  agent: 'nova',
  greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you create a strategic IP filing roadmap with realistic timelines and budgets. A clear IP plan shows endorsing bodies you're serious about protection!",
  questions: [
    {
      id: 'business-info',
      question: "What's your business name and what's your overall IP filing strategy?",
      hint: "E.g., 'TechCorp - prioritizing UK patents first, then international expansion'",
      fieldKey: 'businessFilingStrategy',
      minLength: 30
    },
    {
      id: 'priority-filings',
      question: "What are your most critical IP filings planned for the next 12 months?",
      hint: "List patents, trademarks, or other IP with target dates and priority level",
      fieldKey: 'priorityFilings',
      minLength: 60
    },
    {
      id: 'ip-budget',
      question: "What's your estimated budget for IP protection over the next 12-24 months?",
      hint: "UK patents: £4-8K, trademarks: £1-2K, designs: £1K. Include professional fees",
      fieldKey: 'ipBudget',
      minLength: 30
    },
    {
      id: 'jurisdictions',
      question: "Which jurisdictions are most important for your IP protection?",
      hint: "E.g., UK first, then EU, US, or specific markets based on business strategy",
      fieldKey: 'jurisdictions',
      minLength: 40
    },
    {
      id: 'dependencies',
      question: "Are there any dependencies or milestones that affect your IP timeline?",
      hint: "E.g., product launch, funding round, market entry, prior art searches",
      fieldKey: 'dependencies',
      minLength: 40
    }
  ],
  completionMessage: "Your IP roadmap framework is ready! Add specific milestones to the Roadmap tab with dates and costs to create a visual timeline and budget tracker."
};

export default function IPRoadmap() {
  const [milestones, setMilestones] = useState<IPMilestone[]>([
    {
      name: '',
      type: 'patent',
      targetDate: '',
      completionDate: '',
      estimatedCost: 8000,
      actualCost: 0,
      status: 'planned',
      jurisdiction: 'UK',
      priority: 'high',
      dependencies: '',
      notes: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [savedDate, setSavedDate] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [filingStrategy, setFilingStrategy] = useState('');
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('ip-roadmap-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('ip-roadmap-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.businessFilingStrategy) {
      const parts = answers.businessFilingStrategy.split('-');
      setBusinessName(parts[0]?.trim() || '');
      setFilingStrategy(parts[1]?.trim() || answers.businessFilingStrategy);
    }
    setMode('traditional');
    setActiveTab('roadmap');
  };

  const addMilestone = () => {
    setMilestones([...milestones, {
      name: '',
      type: 'patent',
      targetDate: '',
      completionDate: '',
      estimatedCost: 8000,
      actualCost: 0,
      status: 'planned',
      jurisdiction: 'UK',
      priority: 'medium',
      dependencies: '',
      notes: ''
    }]);
  };

  const updateMilestone = (index: number, field: keyof IPMilestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'type') {
      updated[index].estimatedCost = UK_IPO_COSTS[value as IPType].total;
    }
    
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalEstimatedCost = milestones.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
  const totalActualCost = milestones.reduce((sum, m) => sum + (m.actualCost || 0), 0);
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const delayedMilestones = milestones.filter(m => m.status === 'delayed').length;
  const criticalMilestones = milestones.filter(m => m.priority === 'critical').length;

  const calculateRoadmapCompleteness = () => {
    let score = 0;
    
    if (milestones.length > 0 && milestones.some(m => m.name)) score += 15;
    if (milestones.length >= 3) score += 10;
    if (milestones.some(m => m.type === 'patent')) score += 20;
    if (milestones.some(m => m.type === 'trademark')) score += 15;
    if (milestones.some(m => m.targetDate)) score += 15;
    if (completedMilestones > 0) score += 10;
    if (totalEstimatedCost >= 5000) score += 10;
    if (criticalMilestones >= 2) score += 5;
    
    return Math.min(100, score);
  };

  const roadmapCompleteness = calculateRoadmapCompleteness();

  const milestonesByType = [
    { name: 'Patents', value: milestones.filter(m => m.type === 'patent').length, color: IP_TYPE_COLORS['patent'] },
    { name: 'Trademarks', value: milestones.filter(m => m.type === 'trademark').length, color: IP_TYPE_COLORS['trademark'] },
    { name: 'Copyright', value: milestones.filter(m => m.type === 'copyright').length, color: IP_TYPE_COLORS['copyright'] },
    { name: 'Trade Secrets', value: milestones.filter(m => m.type === 'trade-secret').length, color: IP_TYPE_COLORS['trade-secret'] },
    { name: 'Designs', value: milestones.filter(m => m.type === 'design').length, color: IP_TYPE_COLORS['design'] },
  ].filter(item => item.value > 0);

  const costByType = [
    { type: 'Patents', cost: milestones.filter(m => m.type === 'patent').reduce((sum, m) => sum + m.estimatedCost, 0) },
    { type: 'Trademarks', cost: milestones.filter(m => m.type === 'trademark').reduce((sum, m) => sum + m.estimatedCost, 0) },
    { type: 'Copyright', cost: milestones.filter(m => m.type === 'copyright').reduce((sum, m) => sum + m.estimatedCost, 0) },
    { type: 'Trade Secrets', cost: milestones.filter(m => m.type === 'trade-secret').reduce((sum, m) => sum + m.estimatedCost, 0) },
    { type: 'Designs', cost: milestones.filter(m => m.type === 'design').reduce((sum, m) => sum + m.estimatedCost, 0) },
  ].filter(item => item.cost > 0);

  const timelineData = milestones
    .filter(m => m.targetDate)
    .map(m => {
      const date = new Date(m.targetDate);
      return {
        name: m.name || 'Unnamed',
        type: IP_TYPE_LABELS[m.type],
        month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        monthNum: date.getMonth() + 1,
        year: date.getFullYear(),
        timestamp: date.getTime(),
        cost: m.estimatedCost,
        status: m.status,
        priority: m.priority,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  const ganttData = timelineData.map((item, index) => ({
    ...item,
    start: index,
    duration: 1,
    color: IP_TYPE_COLORS[milestones.find(m => m.name === item.name)?.type || 'patent'],
  }));

  const monthlyBudget = timelineData.reduce((acc, item) => {
    const key = item.month;
    if (!acc[key]) {
      acc[key] = { month: key, cost: 0, count: 0 };
    }
    acc[key].cost += item.cost;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { month: string; cost: number; count: number }>);

  const budgetData = Object.values(monthlyBudget).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
  });

  const statusDistribution = [
    { status: 'Planned', count: milestones.filter(m => m.status === 'planned').length, color: STATUS_COLORS['planned'] },
    { status: 'In Progress', count: milestones.filter(m => m.status === 'in-progress').length, color: STATUS_COLORS['in-progress'] },
    { status: 'Completed', count: milestones.filter(m => m.status === 'completed').length, color: STATUS_COLORS['completed'] },
    { status: 'Delayed', count: milestones.filter(m => m.status === 'delayed').length, color: STATUS_COLORS['delayed'] },
  ].filter(item => item.count > 0);

  const getSerializedState = () => {
    return {
      milestones,
      activeTab,
      businessName,
      filingStrategy,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('milestones' in state) setMilestones(state.milestones);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('businessName' in state) setBusinessName(state.businessName);
    if ('filingStrategy' in state) setFilingStrategy(state.filingStrategy);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ip-roadmap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('ip-roadmap-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('ip-roadmap-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (milestones.length === 0 || !milestones.some(m => m.name)) {
      tips.push("Create a comprehensive IP roadmap covering the next 12-24 months - endorsing bodies assess strategic planning capability");
    }

    if (!milestones.some(m => m.type === 'trademark')) {
      tips.push("File trademark applications 3-6 months before visa submission - registered trademarks strengthen your application significantly");
    }

    if (!milestones.some(m => m.type === 'patent')) {
      tips.push("Patent-pending status demonstrates innovation - file priority applications in UK to establish earliest filing date");
    }

    if (totalEstimatedCost < 5000) {
      tips.push("Budget at least £5,000-£10,000 for IP protection - demonstrates serious commitment to protecting competitive advantage");
    }

    if (milestones.some(m => !m.targetDate)) {
      tips.push("Set realistic target dates for all IP milestones - shows project management capability and planning rigor");
    }

    if (delayedMilestones > 0) {
      tips.push("Address delayed milestones immediately - update timelines and document reasons to maintain credibility with endorsing bodies");
    }

    if (!milestones.some(m => m.type === 'trade-secret')) {
      tips.push("Document trade secret protection protocols - NDAs, access controls, and confidentiality measures are valuable IP assets");
    }

    if (criticalMilestones < 2) {
      tips.push("Identify at least 2-3 critical IP protection milestones - these form the foundation of your competitive moat");
    }

    if (milestones.some(m => m.type === 'patent' && !m.dependencies)) {
      tips.push("Document patent dependencies - prior art searches, provisional applications, and international filing strategy");
    }

    if (timelineData.length > 0) {
      const avgMonthsBetween = timelineData.length > 1 ? 
        (timelineData[timelineData.length - 1].timestamp - timelineData[0].timestamp) / (1000 * 60 * 60 * 24 * 30) / (timelineData.length - 1) : 0;
      if (avgMonthsBetween > 6) {
        tips.push("Consider more frequent IP filing milestones - demonstrates sustained innovation and systematic protection approach");
      }
    }

    if (milestones.some(m => m.jurisdiction !== 'UK')) {
      tips.push("International IP protection shows global ambition - budget for PCT applications if planning international expansion");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Conduct comprehensive IP audit - identify all innovations, branding elements, designs, and confidential processes requiring protection", priority: "Critical" },
      { week: "Week 1", action: "Research UK IPO requirements for each IP type - understand filing procedures, fees, and timelines", priority: "Critical" },
      { week: "Week 1-2", action: "Engage IP attorney or patent agent for professional guidance on patent and trademark strategy", priority: "Critical" },
      { week: "Week 2", action: "Conduct prior art searches for patent applications - identify potential conflicts and assess patentability", priority: "Critical" },
      { week: "Week 2", action: "Draft detailed IP roadmap with specific milestones, target dates, and budget allocations for next 24 months", priority: "Critical" },
      { week: "Week 2-3", action: "File trademark applications with UK IPO for company name, logo, product names, and key branding elements", priority: "High" },
      { week: "Week 3", action: "Prepare patent applications for core innovations - include detailed specifications, claims, and technical drawings", priority: "Critical" },
      { week: "Week 3", action: "Implement trade secret protection framework - NDAs, employee IP assignment agreements, access controls", priority: "High" },
      { week: "Week 3-4", action: "File priority patent applications in UK to establish earliest possible priority date", priority: "Critical" },
      { week: "Week 4", action: "Register design rights for product designs, user interfaces, and visual elements with UK IPO", priority: "Medium" },
      { week: "Week 4", action: "Document IP roadmap in business plan with clear timeline, budget breakdown, and strategic rationale", priority: "Critical" },
      { week: "Week 4", action: "Create IP portfolio summary for endorsing body showing systematic protection of competitive advantages", priority: "Critical" },
      { week: "Ongoing", action: "Monitor IP application status, respond to examiner objections, and maintain IP register with renewal dates", priority: "High" },
      { week: "Ongoing", action: "Review competitor IP filings quarterly and adjust protection strategy to maintain competitive position", priority: "Medium" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - IP DEVELOPMENT ROADMAP
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Business Name: ${businessName || 'Not specified'}
Filing Strategy: ${filingStrategy || 'Not specified'}
Roadmap Completeness: ${roadmapCompleteness}%
Total Milestones: ${milestones.filter(m => m.name).length}
Total Estimated Budget: £${totalEstimatedCost.toLocaleString()}
Total Actual Spend: £${totalActualCost.toLocaleString()}
Completed Milestones: ${completedMilestones}
Delayed Milestones: ${delayedMilestones}
Critical Milestones: ${criticalMilestones}

ROADMAP ASSESSMENT
${'-'.repeat(80)}
${roadmapCompleteness >= 80 ? 'EXCELLENT - Comprehensive IP roadmap with strategic planning and execution' :
  roadmapCompleteness >= 60 ? 'GOOD - Solid IP protection plan with room for enhancement' :
  roadmapCompleteness >= 40 ? 'DEVELOPING - Basic framework established but needs strategic development' :
  'INSUFFICIENT - Immediate action required to build credible IP development roadmap'}

IP PROTECTION MILESTONES
${'-'.repeat(80)}
${milestones.filter(m => m.name).map((milestone, i) => `
${i + 1}. ${milestone.name}
   Type: ${IP_TYPE_LABELS[milestone.type]}
   Target Date: ${milestone.targetDate || 'Not set'}
   Completion Date: ${milestone.completionDate || 'Not completed'}
   Status: ${milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
   Priority: ${milestone.priority.charAt(0).toUpperCase() + milestone.priority.slice(1)}
   Jurisdiction: ${milestone.jurisdiction}
   Estimated Cost: £${milestone.estimatedCost.toLocaleString()}
   Actual Cost: £${milestone.actualCost.toLocaleString()}
   Dependencies: ${milestone.dependencies || 'None'}
   Notes: ${milestone.notes || 'None'}
`).join('')}

MILESTONES BY TYPE
${'-'.repeat(80)}
${milestonesByType.map(item => `${item.name}: ${item.value} milestone(s)`).join('\n')}

COST BREAKDOWN BY TYPE
${'-'.repeat(80)}
${costByType.map(item => `${item.type}: £${item.cost.toLocaleString()}`).join('\n')}
Total Budget: £${totalEstimatedCost.toLocaleString()}
Total Spent: £${totalActualCost.toLocaleString()}
Remaining: £${(totalEstimatedCost - totalActualCost).toLocaleString()}
Budget Variance: ${totalActualCost > 0 ? ((totalActualCost / totalEstimatedCost * 100) - 100).toFixed(1) : '0.0'}%

STATUS DISTRIBUTION
${'-'.repeat(80)}
${statusDistribution.map(item => `${item.status}: ${item.count} milestone(s)`).join('\n')}

FILING TIMELINE
${'-'.repeat(80)}
${timelineData.length > 0 ? timelineData.map(item =>
  `${item.month}: ${item.name} (${item.type}) - £${item.cost.toLocaleString()} [${item.status.toUpperCase()}]`
).join('\n') : 'No target dates set - establish timeline for strategic IP protection'}

MONTHLY BUDGET FORECAST
${'-'.repeat(80)}
${budgetData.length > 0 ? budgetData.map(item =>
  `${item.month}: £${item.cost.toLocaleString()} (${item.count} filing(s))`
).join('\n') : 'No monthly budget forecast available'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK IPO FILING TIMELINES & COSTS
${'-'.repeat(80)}

PATENTS (UK Patent Office)
Filing to Grant Timeline: ${UK_IPO_TIMELINES.patent.min}-${UK_IPO_TIMELINES.patent.max} months (typical: ${UK_IPO_TIMELINES.patent.typical} months)
Official Fees: £60-£80 (filing) + £100-£200 (examination/grant)
Professional Fees: £3,000-£6,000 (drafting and prosecution)
Total Typical Cost: £${UK_IPO_COSTS.patent.total.toLocaleString()}
Renewal Fees: £50-£600 annually (increasing with age)
Key Requirements: Novel, inventive step, industrial application
Note: Fast Track available for innovative businesses (6-12 months to grant)

TRADEMARKS (UK Intellectual Property Office)
Filing to Registration Timeline: ${UK_IPO_TIMELINES.trademark.min}-${UK_IPO_TIMELINES.trademark.max} months (typical: ${UK_IPO_TIMELINES.trademark.typical} months)
Official Fees: £170 (one class) + £50 per additional class
Professional Fees: £500-£1,500 (search, filing, prosecution)
Total Typical Cost: £${UK_IPO_COSTS.trademark.total.toLocaleString()}
Renewal: Every 10 years (£200)
Key Requirements: Distinctive mark not conflicting with existing trademarks
Note: Madrid Protocol available for international protection

COPYRIGHT
Protection: Automatic upon creation (no registration required in UK)
Optional Registration: Copyright Hub or Copyright Licensing Agency
Cost: Minimal to free
Duration: Life of author + 70 years (literary works)
Key Requirements: Original creative work fixed in tangible medium
Note: Document creation date and authorship for evidence

REGISTERED DESIGNS (UK IPO)
Filing to Registration Timeline: ${UK_IPO_TIMELINES.design.min}-${UK_IPO_TIMELINES.design.max} months (typical: ${UK_IPO_TIMELINES.design.typical} months)
Official Fees: £50 (first design) + £20 per additional design
Professional Fees: £500-£1,500 (preparation and filing)
Total Typical Cost: £${UK_IPO_COSTS.design.total.toLocaleString()}
Protection Period: Up to 25 years (renewable every 5 years)
Key Requirements: New design with individual character
Note: Unregistered design rights also available (automatic, 3 years)

TRADE SECRETS
Protection: Ongoing through confidentiality measures
Implementation Costs: Legal fees for NDAs, contracts, policies
Typical Cost: £${UK_IPO_COSTS['trade-secret'].total.toLocaleString()}-£2,000 (initial setup)
Maintenance: Ongoing security and training costs
Key Requirements: Commercial value, confidentiality, reasonable protection steps
Note: No time limit on protection if secrecy maintained

VISA APPLICATION STRATEGIC GUIDANCE
${'-'.repeat(80)}

Endorsing Body Assessment Criteria:
1. Strategic IP Protection Plan
   - Comprehensive roadmap covering 12-24 months
   - Clear rationale for each IP type selected
   - Budget allocation demonstrating financial commitment

2. Evidence of Innovation
   - Patent-pending status for technical innovations
   - Trademark applications for brand protection
   - Design registrations for product differentiation

3. Competitive Advantage
   - IP portfolio creating defensible market position
   - Trade secrets protecting proprietary processes
   - International protection strategy if applicable

4. Execution Capability
   - Realistic timelines with milestone tracking
   - Professional advisors engaged (patent attorney, IP counsel)
   - Budget adequacy for planned IP protection

5. Business Integration
   - IP strategy aligned with business model
   - Clear ownership structure (founder vs company)
   - Freedom to operate analysis (no infringement risks)

Critical Success Factors:
- File trademark applications BEFORE visa submission
- Demonstrate patent-pending status for core innovations
- Document trade secret protection framework
- Show IP budget in financial projections (£5,000-£20,000 typical)
- Provide detailed IP roadmap in business plan
- Evidence systematic approach to IP management

Common Pitfalls to Avoid:
- Generic IP claims without specific filing plans
- Unrealistic timelines not aligned with UK IPO procedures
- Insufficient budget allocation for professional fees
- Missing trademark registrations for business name/logo
- No trade secret documentation
- Failing to address international protection strategy
- Unclear IP ownership (especially for team companies)

Documentation Requirements for Endorsement:
- Detailed IP roadmap with milestones and dates
- Budget breakdown by IP type
- Filing confirmations or application numbers (if already filed)
- Professional advisor engagement letters
- Prior art search results (for patents)
- Trade secret protection policies and NDAs
- International filing strategy (if applicable)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This report provides strategic planning guidance only. Consult
qualified IP attorney or patent agent for professional advice on specific IP
filing and protection matters. UK IPO requirements and fees subject to change.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-roadmap-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-ip-roadmap">IP Development Roadmap</h1>
            <p className="text-lg text-muted-foreground">Strategic intellectual property filing and protection timeline for UK Innovator Founder visa</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="ip-roadmap"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="IP Development Roadmap"
          />

          <div className="mb-6">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
            />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-ip-roadmap">
              <TabsTrigger value="roadmap" data-testid="tab-roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Roadmap Status</CardTitle>
                  <CardDescription>Plan and track intellectual property filings and protection milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={roadmapCompleteness >= 60 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Roadmap Completeness</p>
                          <p className="text-3xl font-bold" data-testid="text-roadmap-completeness">{roadmapCompleteness}%</p>
                          <Progress value={roadmapCompleteness} className="mt-2" />
                          <p className="text-xs mt-2">
                            {roadmapCompleteness >= 80 ? 'Excellent' : roadmapCompleteness >= 60 ? 'Good' : roadmapCompleteness >= 40 ? 'Developing' : 'Needs Work'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-total-budget">£{totalEstimatedCost.toLocaleString()}</p>
                          <p className="text-xs mt-2">Estimated IP costs</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completed</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-completed-milestones">{completedMilestones}</p>
                          <p className="text-xs mt-2">of {milestones.filter(m => m.name).length} milestones</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Items</p>
                          <p className="text-3xl font-bold text-orange-600" data-testid="text-critical-milestones">{criticalMilestones}</p>
                          <p className="text-xs mt-2">High priority</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {roadmapCompleteness < 40 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your IP roadmap needs significant development. Endorsing bodies expect comprehensive IP protection planning with clear milestones and timelines.
                      </AlertDescription>
                    </Alert>
                  )}

                  {roadmapCompleteness >= 40 && roadmapCompleteness < 60 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Good foundation but strengthen your IP roadmap with more milestones, specific dates, and comprehensive coverage of all IP types relevant to your innovation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {roadmapCompleteness >= 60 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent IP roadmap! Ensure all documentation is ready and continue tracking progress against milestones for endorsing body review.
                      </AlertDescription>
                    </Alert>
                  )}

                  {delayedMilestones > 0 && (
                    <Alert variant="destructive">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        You have {delayedMilestones} delayed milestone{delayedMilestones > 1 ? 's' : ''}. Update timelines and document mitigation plans to maintain credibility.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g., TechInnovate Ltd"
                        data-testid="input-business-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="filing-strategy">Filing Strategy</Label>
                      <Input
                        id="filing-strategy"
                        value={filingStrategy}
                        onChange={(e) => setFilingStrategy(e.target.value)}
                        placeholder="e.g., UK first, then PCT international"
                        data-testid="input-filing-strategy"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">IP Protection Milestones</h3>
                      <Button onClick={addMilestone} size="sm" data-testid="button-add-milestone">
                        Add Milestone
                      </Button>
                    </div>

                    {milestones.map((milestone, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="md:col-span-2">
                            <Label htmlFor={`milestone-name-${index}`}>Milestone Name</Label>
                            <Input
                              id={`milestone-name-${index}`}
                              value={milestone.name}
                              onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                              placeholder="e.g., File UK patent for AI algorithm"
                              data-testid={`input-milestone-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-type-${index}`}>IP Type</Label>
                            <select
                              id={`milestone-type-${index}`}
                              value={milestone.type}
                              onChange={(e) => updateMilestone(index, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-milestone-type-${index}`}
                            >
                              <option value="patent">Patent</option>
                              <option value="trademark">Trademark</option>
                              <option value="copyright">Copyright</option>
                              <option value="trade-secret">Trade Secret</option>
                              <option value="design">Design</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`milestone-target-date-${index}`}>Target Date</Label>
                            <Input
                              id={`milestone-target-date-${index}`}
                              type="date"
                              value={milestone.targetDate}
                              onChange={(e) => updateMilestone(index, 'targetDate', e.target.value)}
                              data-testid={`input-target-date-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-estimated-cost-${index}`}>Estimated Cost (£)</Label>
                            <Input
                              id={`milestone-estimated-cost-${index}`}
                              type="number"
                              value={milestone.estimatedCost || ''}
                              onChange={(e) => updateMilestone(index, 'estimatedCost', parseFloat(e.target.value) || 0)}
                              data-testid={`input-estimated-cost-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-status-${index}`}>Status</Label>
                            <select
                              id={`milestone-status-${index}`}
                              value={milestone.status}
                              onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-status-${index}`}
                            >
                              <option value="planned">Planned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="delayed">Delayed</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`milestone-priority-${index}`}>Priority</Label>
                            <select
                              id={`milestone-priority-${index}`}
                              value={milestone.priority}
                              onChange={(e) => updateMilestone(index, 'priority', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-priority-${index}`}
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`milestone-jurisdiction-${index}`}>Jurisdiction</Label>
                            <Input
                              id={`milestone-jurisdiction-${index}`}
                              value={milestone.jurisdiction}
                              onChange={(e) => updateMilestone(index, 'jurisdiction', e.target.value)}
                              placeholder="UK, EU, US, etc."
                              data-testid={`input-jurisdiction-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-completion-date-${index}`}>Completion Date</Label>
                            <Input
                              id={`milestone-completion-date-${index}`}
                              type="date"
                              value={milestone.completionDate}
                              onChange={(e) => updateMilestone(index, 'completionDate', e.target.value)}
                              data-testid={`input-completion-date-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-actual-cost-${index}`}>Actual Cost (£)</Label>
                            <Input
                              id={`milestone-actual-cost-${index}`}
                              type="number"
                              value={milestone.actualCost || ''}
                              onChange={(e) => updateMilestone(index, 'actualCost', parseFloat(e.target.value) || 0)}
                              data-testid={`input-actual-cost-${index}`}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`milestone-dependencies-${index}`}>Dependencies</Label>
                            <Input
                              id={`milestone-dependencies-${index}`}
                              value={milestone.dependencies}
                              onChange={(e) => updateMilestone(index, 'dependencies', e.target.value)}
                              placeholder="e.g., Prior art search, provisional filing"
                              data-testid={`input-dependencies-${index}`}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`milestone-notes-${index}`}>Notes</Label>
                              <Input
                                id={`milestone-notes-${index}`}
                                value={milestone.notes}
                                onChange={(e) => updateMilestone(index, 'notes', e.target.value)}
                                placeholder="Additional context"
                                data-testid={`input-notes-${index}`}
                              />
                            </div>
                            {milestones.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                                data-testid={`button-remove-milestone-${index}`}
                              >
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

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Filing Timeline</CardTitle>
                  <CardDescription>Visual timeline of planned IP protection milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={timelineData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, timelineData.length]} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border border-border p-3 rounded-md shadow-lg">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="text-sm">Type: {data.type}</p>
                                  <p className="text-sm">Date: {data.month}</p>
                                  <p className="text-sm">Cost: £{data.cost.toLocaleString()}</p>
                                  <p className="text-sm">Status: {data.status}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="duration" stackId="a" fill="#3b82f6">
                          {ganttData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add milestones with target dates to see timeline visualization</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Budget Forecast</CardTitle>
                  <CardDescription>IP filing costs distributed across timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  {budgetData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => `£${value.toLocaleString()}`}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="cost" fill="#3b82f6" name="Estimated Cost" />
                        <Bar dataKey="count" fill="#10b981" name="Number of Filings" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add milestones with dates to see monthly budget forecast</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>UK IPO Processing Times</CardTitle>
                    <CardDescription>Typical timelines for different IP types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(UK_IPO_TIMELINES).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center gap-3">
                            {type === 'patent' && <Shield className="h-5 w-5 text-blue-500" />}
                            {type === 'trademark' && <FileText className="h-5 w-5 text-green-500" />}
                            {type === 'copyright' && <Copyright className="h-5 w-5 text-orange-500" />}
                            {type === 'design' && <Palette className="h-5 w-5 text-pink-500" />}
                            {type === 'trade-secret' && <Lock className="h-5 w-5 text-purple-500" />}
                            <span className="font-medium capitalize">{type === 'trade-secret' ? 'Trade Secret' : type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {data.unit === 'immediate' ? 'Immediate' :
                              data.unit === 'ongoing' ? 'Ongoing' :
                                `${data.typical} ${data.unit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typical Filing Costs (UK)</CardTitle>
                    <CardDescription>Budget guidance for IP protection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(UK_IPO_COSTS).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between py-2 border-b">
                          <span className="font-medium capitalize">{type === 'trade-secret' ? 'Trade Secret' : type}</span>
                          <span className="text-sm font-semibold">£{data.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestones by Type</CardTitle>
                    <CardDescription>Distribution of IP protection activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {milestonesByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={milestonesByType}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {milestonesByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones to see type distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown by Type</CardTitle>
                    <CardDescription>Budget allocation across IP categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {costByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={costByType}
                            dataKey="cost"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.type}: £${entry.cost.toLocaleString()}`}
                          >
                            {costByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={IP_TYPE_COLORS[Object.keys(IP_TYPE_COLORS)[index] as IPType]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones with costs to see budget breakdown</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Current progress across milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={statusDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6">
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones to see status distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget vs Actual Spend</CardTitle>
                    <CardDescription>Financial tracking and variance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Total Estimated</span>
                          <span className="text-lg font-bold">£{totalEstimatedCost.toLocaleString()}</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Total Actual</span>
                          <span className="text-lg font-bold text-blue-600">£{totalActualCost.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={totalEstimatedCost > 0 ? (totalActualCost / totalEstimatedCost * 100) : 0}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Remaining Budget</span>
                          <span className="text-lg font-bold text-green-600">£{(totalEstimatedCost - totalActualCost).toLocaleString()}</span>
                        </div>
                        <Progress
                          value={totalEstimatedCost > 0 ? ((totalEstimatedCost - totalActualCost) / totalEstimatedCost * 100) : 0}
                          className="h-2"
                        />
                      </div>
                      {totalActualCost > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Budget Variance: {totalActualCost > totalEstimatedCost ? '+' : ''}
                            {((totalActualCost / totalEstimatedCost * 100) - 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic IP Planning Guidance</CardTitle>
                  <CardDescription>Best practices for UK Innovator Founder visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Early Trademark Filing</p>
                        <p className="text-sm text-muted-foreground">File trademark applications 3-6 months before visa submission for registered status</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Patent-Pending Strategy</p>
                        <p className="text-sm text-muted-foreground">File priority applications in UK to demonstrate innovation - grants take 12-36 months</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Trade Secret Documentation</p>
                        <p className="text-sm text-muted-foreground">Implement NDAs, access controls, and confidentiality measures - no registration required</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Realistic Budgeting</p>
                        <p className="text-sm text-muted-foreground">Allocate £5,000-£20,000 for comprehensive IP protection - demonstrates commitment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Professional Advisors</p>
                        <p className="text-sm text-muted-foreground">Engage IP attorney or patent agent early - critical for patent applications and prior art searches</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">International Protection</p>
                        <p className="text-sm text-muted-foreground">Consider PCT route for patents and Madrid Protocol for trademarks if planning global expansion</p>
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
                  <CardDescription>Strategic guidance for IP roadmap development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Structured implementation roadmap for IP protection strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {item.priority === 'Critical' && (
                              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                            {item.priority === 'High' && (
                              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-orange-600" />
                              </div>
                            )}
                            {item.priority === 'Medium' && (
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{item.week}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' :
                                  item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400' :
                                    'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                }`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
