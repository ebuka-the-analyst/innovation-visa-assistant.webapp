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
import { CheckCircle2, AlertTriangle, TrendingUp, Target, Calendar, Users, DollarSign, Zap } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';

type Milestone = {
  id: string;
  quarter: string;
  name: string;
  deliverables: string;
  resourceAllocation: string;
  successMetrics: string;
  status: 'planned' | 'in-progress' | 'completed' | 'at-risk';
  ukImpact: string;
  budget: number;
};

type QuarterlyMetrics = {
  quarter: string;
  revenue: number;
  customers: number;
  teamSize: number;
  innovation: number;
};

export default function RoadmapBuilder() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      quarter: 'Q1',
      name: '',
      deliverables: '',
      resourceAllocation: '',
      successMetrics: '',
      status: 'planned',
      ukImpact: '',
      budget: 0
    }
  ]);
  
  const [quarterlyMetrics, setQuarterlyMetrics] = useState<QuarterlyMetrics[]>([
    { quarter: 'Q1', revenue: 0, customers: 0, teamSize: 0, innovation: 0 },
    { quarter: 'Q2', revenue: 0, customers: 0, teamSize: 0, innovation: 0 },
    { quarter: 'Q3', revenue: 0, customers: 0, teamSize: 0, innovation: 0 },
    { quarter: 'Q4', revenue: 0, customers: 0, teamSize: 0, innovation: 0 }
  ]);

  const [businessContext, setBusinessContext] = useState({
    companyName: '',
    industry: '',
    vision: '',
    ukMarketStrategy: ''
  });

  const [activeTab, setActiveTab] = useState('builder');
  const [savedDate, setSavedDate] = useState('');

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now().toString(),
      quarter: 'Q1',
      name: '',
      deliverables: '',
      resourceAllocation: '',
      successMetrics: '',
      status: 'planned',
      ukImpact: '',
      budget: 0
    }]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateQuarterlyMetric = (quarter: string, field: keyof QuarterlyMetrics, value: number) => {
    setQuarterlyMetrics(quarterlyMetrics.map(q => 
      q.quarter === quarter ? { ...q, [field]: value } : q
    ));
  };

  const calculateCompletenessScore = (): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Business context (20 points)
    const contextFields = Object.values(businessContext).filter(v => v && v.length > 10);
    totalFields += 4;
    completedFields += contextFields.length;

    // Milestones (40 points)
    milestones.forEach(m => {
      const fields = [m.name, m.deliverables, m.resourceAllocation, m.successMetrics, m.ukImpact];
      const filled = fields.filter(f => f && f.length > 10).length;
      totalFields += 5;
      completedFields += filled;
      if (m.budget > 0) completedFields += 1;
      totalFields += 1;
    });

    // Quarterly metrics (40 points)
    quarterlyMetrics.forEach(q => {
      if (q.revenue > 0) completedFields += 1;
      if (q.customers > 0) completedFields += 1;
      if (q.teamSize > 0) completedFields += 1;
      if (q.innovation > 0) completedFields += 1;
      totalFields += 4;
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const completenessScore = calculateCompletenessScore();

  const getInnovationTrajectory = () => {
    return quarterlyMetrics.map(q => ({
      quarter: q.quarter,
      innovation: q.innovation,
      target: 75
    }));
  };

  const getGrowthMetrics = () => {
    return quarterlyMetrics.map(q => ({
      quarter: q.quarter,
      revenue: q.revenue,
      customers: q.customers,
      teamSize: q.teamSize
    }));
  };

  const getMilestoneTimeline = () => {
    const quarterOrder: { [key: string]: number } = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
    return milestones
      .filter(m => m.name && m.quarter)
      .sort((a, b) => (quarterOrder[a.quarter] || 0) - (quarterOrder[b.quarter] || 0))
      .map((m, index) => ({
        name: m.name.substring(0, 25) + (m.name.length > 25 ? '...' : ''),
        quarter: m.quarter,
        index: index + 1,
        planned: m.status === 'planned' ? 1 : 0,
        inProgress: m.status === 'in-progress' ? 1 : 0,
        completed: m.status === 'completed' ? 1 : 0,
        atRisk: m.status === 'at-risk' ? 1 : 0,
        budget: m.budget
      }));
  };

  const getResourceAllocation = () => {
    const byQuarter: { [key: string]: number } = {};
    milestones.forEach(m => {
      if (m.quarter && m.budget > 0) {
        byQuarter[m.quarter] = (byQuarter[m.quarter] || 0) + m.budget;
      }
    });
    return Object.entries(byQuarter).map(([quarter, budget]) => ({
      quarter,
      budget
    }));
  };

  const getSerializedState = () => {
    return {
      milestones,
      quarterlyMetrics,
      businessContext,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('milestones' in state) setMilestones(state.milestones);
    if ('quarterlyMetrics' in state) setQuarterlyMetrics(state.quarterlyMetrics);
    if ('businessContext' in state) setBusinessContext(state.businessContext);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('roadmap-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('roadmap-builder-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('roadmap-builder-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (completenessScore < 40) {
      tips.push("Critical: Roadmap completeness below 40%. Add detailed milestones, deliverables, and success metrics to demonstrate strategic planning capability required for UK Innovator Founder visa endorsement");
    }

    if (milestones.filter(m => m.ukImpact && m.ukImpact.length > 20).length < 3) {
      tips.push("Each milestone must explicitly demonstrate UK market impact. Endorsing bodies evaluate how your business creates jobs, drives innovation, and contributes to UK economy");
    }

    const avgInnovation = quarterlyMetrics.reduce((sum, q) => sum + q.innovation, 0) / 4;
    if (avgInnovation < 70) {
      tips.push("Innovation trajectory below 70/100. Strengthen innovative features in your roadmap - this directly supports the Innovation Criterion assessed by endorsing bodies");
    }

    const totalBudget = milestones.reduce((sum, m) => sum + m.budget, 0);
    if (totalBudget < 50000) {
      tips.push("Total budget allocation appears low. Ensure your roadmap demonstrates how you will deploy the minimum £50,000 investment requirement strategically across quarters");
    }

    if (quarterlyMetrics.some(q => q.teamSize === 0)) {
      tips.push("Missing team growth projections. Show how hiring plans support scalability - job creation in UK is a key visa criterion that strengthens endorsement applications");
    }

    if (milestones.filter(m => m.successMetrics && m.successMetrics.length > 20).length < milestones.length / 2) {
      tips.push("Define quantifiable success metrics for each milestone. Measurable KPIs demonstrate business acumen and make your growth trajectory credible to endorsers");
    }

    const hasQ4Innovation = quarterlyMetrics[3]?.innovation > quarterlyMetrics[0]?.innovation;
    if (!hasQ4Innovation && quarterlyMetrics[0]?.innovation > 0) {
      tips.push("Innovation score should increase over time. Show continuous product improvement and R&D commitment - static innovation suggests lack of competitive differentiation");
    }

    const revenueGrowth = quarterlyMetrics[3]?.revenue > quarterlyMetrics[0]?.revenue;
    if (!revenueGrowth && quarterlyMetrics[0]?.revenue > 0) {
      tips.push("Revenue projections must show clear growth trajectory. Flat revenue signals scaling concerns that may weaken your viability assessment during endorsement review");
    }

    if (!businessContext.ukMarketStrategy || businessContext.ukMarketStrategy.length < 50) {
      tips.push("Articulate comprehensive UK market strategy. Endorsers assess whether your business genuinely targets UK market vs using visa as immigration pathway without economic contribution");
    }

    if (milestones.filter(m => m.resourceAllocation && m.resourceAllocation.length > 20).length < 2) {
      tips.push("Detail resource allocation plans (team, technology, marketing) for major milestones. This demonstrates operational readiness and realistic execution capability to endorsing bodies");
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Define comprehensive business vision and UK market entry strategy with specific geographic targets and competitive positioning", priority: "Critical" },
      { week: "Week 1-2", action: "Map all quarterly milestones with specific deliverables, resource requirements, and measurable success criteria", priority: "Critical" },
      { week: "Week 2", action: "Detail resource allocation plans showing how £50k+ investment deploys across team hiring, technology, and market entry activities", priority: "Critical" },
      { week: "Week 2-3", action: "Quantify UK economic impact for each milestone (jobs created, revenue generated, innovation delivered) to support endorsement criteria", priority: "High" },
      { week: "Week 3", action: "Establish quarterly innovation metrics demonstrating continuous R&D and product differentiation trajectory", priority: "High" },
      { week: "Week 3-4", action: "Build financial projections linking roadmap execution to revenue growth, customer acquisition, and team scaling", priority: "High" },
      { week: "Week 4", action: "Document risk mitigation strategies for each major milestone to show operational maturity and contingency planning", priority: "Medium" },
      { week: "Ongoing", action: "Maintain alignment between roadmap, business plan, and endorsement body requirements - update quarterly as business evolves", priority: "High" },
    ];
  };

  const handleExport = () => {
    const totalBudget = milestones.reduce((sum, m) => sum + m.budget, 0);
    const avgInnovation = quarterlyMetrics.reduce((sum, q) => sum + q.innovation, 0) / 4;
    const totalRevenue = quarterlyMetrics.reduce((sum, q) => sum + q.revenue, 0);
    const totalCustomers = quarterlyMetrics[3]?.customers || 0;
    const totalTeam = quarterlyMetrics[3]?.teamSize || 0;

    const report = `UK INNOVATOR FOUNDER VISA - BUSINESS ROADMAP BUILDER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ROADMAP OVERVIEW
${'-'.repeat(80)}
Company: ${businessContext.companyName || 'Not specified'}
Industry: ${businessContext.industry || 'Not specified'}
Completeness Score: ${completenessScore}%
Total Milestones: ${milestones.length}
Total Budget Allocation: £${totalBudget.toLocaleString()}
Average Innovation Score: ${avgInnovation.toFixed(1)}/100

${completenessScore >= 75 ? 'STRONG - Roadmap demonstrates strategic planning and execution capability' : completenessScore >= 60 ? 'VIABLE - Roadmap acceptable but needs strengthening in key areas' : 'WEAK - Significant improvements needed to support endorsement application'}

BUSINESS VISION & UK MARKET STRATEGY
${'-'.repeat(80)}
Vision: ${businessContext.vision || 'Not defined'}

UK Market Strategy: ${businessContext.ukMarketStrategy || 'Not defined'}

QUARTERLY MILESTONES
${'-'.repeat(80)}
${milestones.map((m, i) => `
${i + 1}. [${m.quarter}] ${m.name || 'Unnamed Milestone'}
   Status: ${m.status.toUpperCase()}
   Budget: £${m.budget.toLocaleString()}
   
   Deliverables:
   ${m.deliverables || 'Not specified'}
   
   Resource Allocation:
   ${m.resourceAllocation || 'Not specified'}
   
   Success Metrics:
   ${m.successMetrics || 'Not specified'}
   
   UK Market Impact:
   ${m.ukImpact || 'Not specified'}
`).join('\n')}

QUARTERLY GROWTH PROJECTIONS
${'-'.repeat(80)}
${quarterlyMetrics.map(q => `
${q.quarter}:
  Revenue: £${q.revenue.toLocaleString()}
  Customers: ${q.customers}
  Team Size: ${q.teamSize} people
  Innovation Score: ${q.innovation}/100
`).join('')}

Year 1 Totals:
  Total Revenue: £${totalRevenue.toLocaleString()}
  Total Customers: ${totalCustomers}
  Total Team: ${totalTeam} people
  Average Innovation: ${avgInnovation.toFixed(1)}/100

ROADMAP COMPLETENESS ANALYSIS
${'-'.repeat(80)}
Overall Score: ${completenessScore}%

${completenessScore >= 80 ? 'EXCELLENT - Comprehensive roadmap with detailed milestones, metrics, and UK impact' : completenessScore >= 60 ? 'GOOD - Solid foundation but could add more detail on resource allocation and success metrics' : completenessScore >= 40 ? 'FAIR - Basic structure present but needs significant detail on deliverables and UK market impact' : 'NEEDS WORK - Critical gaps in milestone definition, metrics, and strategic planning'}

Strengths:
${milestones.filter(m => m.ukImpact && m.ukImpact.length > 30).length > 2 ? '- Strong articulation of UK market impact across milestones' : '- [IMPROVE] UK market impact needs more detail'}
${avgInnovation >= 70 ? '- Solid innovation trajectory supporting visa Innovation Criterion' : '- [IMPROVE] Innovation metrics need strengthening'}
${totalBudget >= 50000 ? '- Budget allocation meets minimum investment requirement' : '- [CRITICAL] Budget allocation below £50k minimum requirement'}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n\n')}

UK INNOVATOR FOUNDER VISA ALIGNMENT
${'-'.repeat(80)}
Innovation Criterion:
  ${avgInnovation >= 75 ? 'STRONG - Roadmap demonstrates continuous innovation and R&D commitment' : avgInnovation >= 60 ? 'ACCEPTABLE - Innovation present but could be strengthened with more breakthrough features' : 'WEAK - Limited innovation trajectory may concern endorsing bodies'}

Viability Criterion:
  ${completenessScore >= 70 && totalBudget >= 50000 ? 'STRONG - Detailed planning and adequate funding demonstrate business viability' : completenessScore >= 50 ? 'ACCEPTABLE - Basic viability shown but needs more comprehensive financial planning' : 'WEAK - Insufficient detail on execution and resource deployment'}

Scalability Criterion:
  ${totalRevenue > 100000 && totalTeam >= 5 ? 'STRONG - Clear growth trajectory with team expansion and revenue scaling' : totalRevenue > 0 ? 'ACCEPTABLE - Growth shown but could strengthen hiring and revenue projections' : 'WEAK - Limited evidence of scalability and market traction'}

ENDORSEMENT READINESS ASSESSMENT
${'-'.repeat(80)}
Based on this roadmap, your endorsement readiness is: ${completenessScore >= 75 ? 'HIGH - Strong strategic planning and execution roadmap' : completenessScore >= 60 ? 'MODERATE - Viable roadmap but strengthen detail and UK impact' : 'LOW - Significant improvements needed before endorsement application'}

Next Steps:
1. ${completenessScore < 70 ? 'Complete all milestone details with specific deliverables and metrics' : 'Maintain detailed documentation of milestone progress'}
2. ${avgInnovation < 70 ? 'Strengthen innovation metrics and R&D roadmap' : 'Continue tracking innovation KPIs'}
3. ${totalBudget < 50000 ? 'CRITICAL: Ensure budget allocation meets £50k minimum requirement' : 'Document evidence of fund availability'}
4. Align this roadmap with your business plan and endorsement application narrative

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This roadmap builder is a planning tool. Actual endorsement decisions are made by 
approved endorsing bodies based on their specific criteria. Consult with immigration advisors 
for personalized guidance on your UK Innovator Founder visa application.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-builder-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-roadmap-builder">Business Roadmap Builder</h1>
            <p className="text-lg text-muted-foreground">Strategic quarterly planning demonstrating innovation and scalability for UK visa endorsement</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="roadmap-builder"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Roadmap Builder"
          />

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Completeness</p>
                  <p className="text-3xl font-bold" data-testid="text-completeness-score">{completenessScore}%</p>
                  <Progress value={completenessScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Milestones</p>
                  <p className="text-3xl font-bold" data-testid="text-total-milestones">{milestones.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Total Budget</p>
                  <p className="text-3xl font-bold" data-testid="text-total-budget">£{milestones.reduce((sum, m) => sum + m.budget, 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-2">Avg Innovation</p>
                  <p className="text-3xl font-bold" data-testid="text-avg-innovation">{(quarterlyMetrics.reduce((sum, q) => sum + q.innovation, 0) / 4).toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {completenessScore < 50 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Roadmap completeness is below 50%. Add detailed milestones, deliverables, success metrics, and UK market impact to strengthen your endorsement application.
              </AlertDescription>
            </Alert>
          )}

          {milestones.reduce((sum, m) => sum + m.budget, 0) < 50000 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Total budget allocation is below £50,000 minimum investment requirement. Ensure your roadmap demonstrates strategic deployment of required funding.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-roadmap-builder">
              <TabsTrigger value="builder" data-testid="tab-builder">Builder</TabsTrigger>
              <TabsTrigger value="metrics" data-testid="tab-metrics">Metrics</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Context</CardTitle>
                  <CardDescription>Define your vision and UK market strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={businessContext.companyName}
                        onChange={(e) => setBusinessContext({...businessContext, companyName: e.target.value})}
                        placeholder="Your company name"
                        data-testid="input-company-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={businessContext.industry}
                        onChange={(e) => setBusinessContext({...businessContext, industry: e.target.value})}
                        placeholder="e.g., FinTech, HealthTech, AI/ML"
                        data-testid="input-industry"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vision">Business Vision</Label>
                    <Textarea
                      id="vision"
                      value={businessContext.vision}
                      onChange={(e) => setBusinessContext({...businessContext, vision: e.target.value})}
                      placeholder="Describe your long-term vision and how your business solves a significant problem..."
                      rows={3}
                      data-testid="textarea-vision"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uk-strategy">UK Market Strategy</Label>
                    <Textarea
                      id="uk-strategy"
                      value={businessContext.ukMarketStrategy}
                      onChange={(e) => setBusinessContext({...businessContext, ukMarketStrategy: e.target.value})}
                      placeholder="Detail your UK market entry strategy, target cities, partnerships, and economic contribution..."
                      rows={3}
                      data-testid="textarea-uk-strategy"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quarterly Milestones</CardTitle>
                      <CardDescription>Define key deliverables, resources, and success metrics for each quarter</CardDescription>
                    </div>
                    <Button onClick={addMilestone} size="sm" data-testid="button-add-milestone">
                      Add Milestone
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="p-4 bg-muted/30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Milestone {index + 1}</h4>
                          {milestones.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(milestone.id)}
                              data-testid={`button-remove-milestone-${index}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`quarter-${milestone.id}`}>Quarter</Label>
                            <select
                              id={`quarter-${milestone.id}`}
                              value={milestone.quarter}
                              onChange={(e) => updateMilestone(milestone.id, 'quarter', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-quarter-${index}`}
                            >
                              <option value="Q1">Q1</option>
                              <option value="Q2">Q2</option>
                              <option value="Q3">Q3</option>
                              <option value="Q4">Q4</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`status-${milestone.id}`}>Status</Label>
                            <select
                              id={`status-${milestone.id}`}
                              value={milestone.status}
                              onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value as any)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-status-${index}`}
                            >
                              <option value="planned">Planned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="at-risk">At Risk</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`budget-${milestone.id}`}>Budget (£)</Label>
                            <Input
                              id={`budget-${milestone.id}`}
                              type="number"
                              value={milestone.budget || ''}
                              onChange={(e) => updateMilestone(milestone.id, 'budget', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-budget-${index}`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`name-${milestone.id}`}>Milestone Name</Label>
                          <Input
                            id={`name-${milestone.id}`}
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                            placeholder="e.g., Launch MVP, Secure First Enterprise Client"
                            data-testid={`input-milestone-name-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`deliverables-${milestone.id}`}>Key Deliverables</Label>
                          <Textarea
                            id={`deliverables-${milestone.id}`}
                            value={milestone.deliverables}
                            onChange={(e) => updateMilestone(milestone.id, 'deliverables', e.target.value)}
                            placeholder="List specific outputs: products launched, features shipped, partnerships established..."
                            rows={2}
                            data-testid={`textarea-deliverables-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`resources-${milestone.id}`}>Resource Allocation</Label>
                          <Textarea
                            id={`resources-${milestone.id}`}
                            value={milestone.resourceAllocation}
                            onChange={(e) => updateMilestone(milestone.id, 'resourceAllocation', e.target.value)}
                            placeholder="Detail team, technology, marketing, and operational resources required..."
                            rows={2}
                            data-testid={`textarea-resources-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`metrics-${milestone.id}`}>Success Metrics</Label>
                          <Textarea
                            id={`metrics-${milestone.id}`}
                            value={milestone.successMetrics}
                            onChange={(e) => updateMilestone(milestone.id, 'successMetrics', e.target.value)}
                            placeholder="Define measurable KPIs: revenue targets, user acquisition, product metrics..."
                            rows={2}
                            data-testid={`textarea-metrics-${index}`}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`uk-impact-${milestone.id}`}>UK Market Impact</Label>
                          <Textarea
                            id={`uk-impact-${milestone.id}`}
                            value={milestone.ukImpact}
                            onChange={(e) => updateMilestone(milestone.id, 'ukImpact', e.target.value)}
                            placeholder="Explain impact on UK economy: jobs created, revenue generated, innovation delivered, partnerships formed..."
                            rows={2}
                            data-testid={`textarea-uk-impact-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Growth Projections</CardTitle>
                  <CardDescription>Define revenue, customer, team, and innovation metrics for each quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {quarterlyMetrics.map((quarter, index) => (
                      <div key={quarter.quarter} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-4">{quarter.quarter}</h4>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`revenue-${quarter.quarter}`}>Revenue (£)</Label>
                            <Input
                              id={`revenue-${quarter.quarter}`}
                              type="number"
                              value={quarter.revenue || ''}
                              onChange={(e) => updateQuarterlyMetric(quarter.quarter, 'revenue', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-revenue-${quarter.quarter}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`customers-${quarter.quarter}`}>Customers</Label>
                            <Input
                              id={`customers-${quarter.quarter}`}
                              type="number"
                              value={quarter.customers || ''}
                              onChange={(e) => updateQuarterlyMetric(quarter.quarter, 'customers', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-customers-${quarter.quarter}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`team-${quarter.quarter}`}>Team Size</Label>
                            <Input
                              id={`team-${quarter.quarter}`}
                              type="number"
                              value={quarter.teamSize || ''}
                              onChange={(e) => updateQuarterlyMetric(quarter.quarter, 'teamSize', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-team-${quarter.quarter}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`innovation-${quarter.quarter}`}>Innovation (0-100)</Label>
                            <Input
                              id={`innovation-${quarter.quarter}`}
                              type="number"
                              value={quarter.innovation || ''}
                              onChange={(e) => updateQuarterlyMetric(quarter.quarter, 'innovation', Math.min(100, parseFloat(e.target.value) || 0))}
                              placeholder="0"
                              max={100}
                              data-testid={`input-innovation-${quarter.quarter}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Timeline</CardTitle>
                    <CardDescription>Quarterly roadmap progress tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getMilestoneTimeline().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getMilestoneTimeline()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                          <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                          <Bar dataKey="planned" stackId="a" fill="#6b7280" name="Planned" />
                          <Bar dataKey="atRisk" stackId="a" fill="#ef4444" name="At Risk" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestones to visualize timeline</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Innovation Trajectory</CardTitle>
                    <CardDescription>Quarterly innovation score trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getInnovationTrajectory()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="innovation" stroke="#ffa536" strokeWidth={3} name="Innovation" />
                        <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target (75)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Metrics</CardTitle>
                    <CardDescription>Revenue, customers, and team growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={getGrowthMetrics()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} name="Revenue (£)" />
                        <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} name="Customers" />
                        <Line yAxisId="right" type="monotone" dataKey="teamSize" stroke="#ffa536" strokeWidth={2} name="Team Size" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Allocation</CardTitle>
                    <CardDescription>Budget distribution across quarters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getResourceAllocation().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getResourceAllocation()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Bar dataKey="budget" fill="#8b5cf6" name="Budget (£)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add milestone budgets to see allocation</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Roadmap Completeness Assessment</CardTitle>
                  <CardDescription>Current roadmap quality and gaps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Completeness</span>
                        <span className="text-sm font-medium">{completenessScore}%</span>
                      </div>
                      <Progress value={completenessScore} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="flex items-start gap-3">
                        {businessContext.vision && businessContext.ukMarketStrategy ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Business Context</p>
                          <p className="text-xs text-muted-foreground">Vision and UK strategy</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        {milestones.filter(m => m.deliverables && m.successMetrics).length >= 3 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Milestone Detail</p>
                          <p className="text-xs text-muted-foreground">Deliverables and metrics</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        {quarterlyMetrics.every(q => q.revenue > 0 && q.innovation > 0) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-sm">Growth Projections</p>
                          <p className="text-xs text-muted-foreground">Quarterly metrics</p>
                        </div>
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
                  <CardDescription>AI-powered guidance to strengthen your roadmap for endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                    {getSmartTips().length === 0 && (
                      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600 dark:text-green-400">
                          Excellent work! Your roadmap is comprehensive and demonstrates strong strategic planning.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap development timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                        data-testid={`action-item-${index}`}
                      >
                        <div className="flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.week}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                              item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                              'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            }`}>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
