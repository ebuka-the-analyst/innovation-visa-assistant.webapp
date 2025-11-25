import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

export default function FundingStrategy() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const [fundingGoal, setFundingGoal] = useState(50000);
  const [businessStage, setBusinessStage] = useState<'idea' | 'mvp' | 'early-revenue' | 'scaling'>('idea');
  const [timeframe, setTimeframe] = useState<'3' | '6' | '12'>('6');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeTab, setActiveTab] = useState('strategy');
  const [savedDate, setSavedDate] = useState('');

  const getSerializedState = () => {
    return {
      fundingGoal,
      businessStage,
      timeframe,
      riskTolerance,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('fundingGoal' in state) setFundingGoal(state.fundingGoal);
    if ('businessStage' in state) setBusinessStage(state.businessStage);
    if ('timeframe' in state) setTimeframe(state.timeframe);
    if ('riskTolerance' in state) setRiskTolerance(state.riskTolerance);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('funding-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('funding-strategy-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('funding-strategy-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getRecommendedSources = () => {
    const sources = [];
    
    if (businessStage === 'idea') {
      sources.push({
        type: 'Personal Savings',
        description: 'Use personal funds for initial £50k investment requirement',
        suitability: 'High',
        timeline: '0-1 months',
        pros: 'Full control, no dilution, meets visa requirement immediately',
        cons: 'Personal financial risk, limited working capital beyond minimum'
      });
      sources.push({
        type: 'Friends & Family',
        description: 'Raise funds from close network as investment or loan',
        suitability: 'Medium',
        timeline: '1-3 months',
        pros: 'Flexible terms, supportive investors, quick access',
        cons: 'Can strain relationships, limited amounts, less professional structure'
      });
    }
    
    if (businessStage === 'mvp' || businessStage === 'early-revenue') {
      sources.push({
        type: 'Angel Investors',
        description: 'Individual investors providing capital for equity',
        suitability: 'High',
        timeline: '3-6 months',
        pros: 'Expertise and network access, higher amounts possible (£50k-£500k)',
        cons: 'Equity dilution, time-intensive pitching, needs traction'
      });
      sources.push({
        type: 'Grants & Competitions',
        description: 'Non-dilutive funding from government or private competitions',
        suitability: 'Medium',
        timeline: '2-6 months',
        pros: 'No equity given up, validation from award, free money',
        cons: 'Highly competitive, specific eligibility, time-consuming applications'
      });
    }
    
    if (businessStage === 'scaling') {
      sources.push({
        type: 'Venture Capital',
        description: 'Institutional investment for high-growth ventures',
        suitability: 'High',
        timeline: '6-12 months',
        pros: 'Large funding rounds (£500k+), strategic support, credibility',
        cons: 'Significant dilution, loss of control, high growth expectations'
      });
    }
    
    sources.push({
      type: 'Revenue/Bootstrapping',
      description: 'Self-fund from business revenue and minimal external capital',
      suitability: businessStage === 'early-revenue' || businessStage === 'scaling' ? 'High' : 'Low',
      timeline: 'Ongoing',
      pros: 'Full ownership retained, sustainable growth, prove business model',
      cons: 'Slower growth, requires existing revenue, limited resources'
    });
    
    return sources;
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (fundingGoal < 50000) {
      tips.push('You need minimum £50,000 for the Innovator Founder Visa - increase your funding goal to meet requirement');
    }
    
    if (businessStage === 'idea' && riskTolerance === 'low') {
      tips.push('Consider using personal savings or low-risk sources for idea stage - minimizes external dependencies during visa application');
    }
    
    if (businessStage === 'scaling' && timeframe === '3') {
      tips.push('VC funding typically takes 6-12 months - adjust timeframe or consider bridge financing');
    }
    
    if (riskTolerance === 'high' && businessStage !== 'scaling') {
      tips.push('High-risk funding strategies (VC, loans) work best with proven traction - focus on grants and angels first');
    }
    
    if (fundingGoal >= 100000 && businessStage !== 'idea') {
      tips.push('For funding goals above £100k, focus on institutional investors (angels, VCs) - they provide larger ticket sizes and strategic value');
    }
    
    if (timeframe === '3' && businessStage === 'idea') {
      tips.push('3-month timeframe is tight for early-stage funding - prioritize grants and personal network to meet deadlines');
    }
    
    tips.push('Diversify funding sources to reduce dependency - blend 2-3 complementary sources when possible');
    tips.push('Document all funding sources clearly for your endorsing body - transparency is critical for approval');
    tips.push('SEIS/EIS tax reliefs offer 50% and 30% tax relief respectively - structure your raise to maximize investor incentives');
    tips.push('Show endorsing bodies your funding runway covers 12+ months - demonstrates financial stability and business viability');
    tips.push('Keep 15-20% equity buffer for future fundraising rounds - avoid over-dilution in your initial raise');
    tips.push('Consider convertible notes or SAFEs for bridge funding - faster legal process and defers valuation discussions');
    
    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    const stages = {
      'idea': [
        { week: "Week 1", action: "Assess personal savings and liquid assets available for £50k minimum", priority: "Critical" },
        { week: "Week 1-2", action: "Prepare pitch deck and executive summary for friends/family round", priority: "High" },
        { week: "Week 2-3", action: "Research UK government grants and startup competitions in your sector", priority: "Medium" },
        { week: "Week 3-4", action: "Set up investment structure (SEIS/EIS if applicable) and legal documentation", priority: "High" },
      ],
      'mvp': [
        { week: "Week 1", action: "Build comprehensive pitch deck with MVP screenshots and user feedback", priority: "Critical" },
        { week: "Week 1-2", action: "Research and target 20-30 relevant angel investors and angel networks", priority: "Critical" },
        { week: "Week 2-3", action: "Apply for Innovate UK grants and sector-specific funding competitions", priority: "High" },
        { week: "Week 3-4", action: "Prepare financial model showing 3-year projections and ROI scenarios", priority: "High" },
      ],
      'early-revenue': [
        { week: "Week 1", action: "Compile traction metrics (MRR, users, growth rate) for investor presentations", priority: "Critical" },
        { week: "Week 1-3", action: "Attend pitch events and secure meetings with angel groups and micro-VCs", priority: "Critical" },
        { week: "Week 2-4", action: "Optimize unit economics and demonstrate clear path to profitability", priority: "High" },
        { week: "Week 3-4", action: "Negotiate term sheets and legal review with solicitor", priority: "High" },
      ],
      'scaling': [
        { week: "Week 1-2", action: "Prepare comprehensive data room with all financial and legal documentation", priority: "Critical" },
        { week: "Week 1-4", action: "Engage with VC firms through warm introductions and referrals", priority: "Critical" },
        { week: "Week 2-4", action: "Conduct due diligence preparation and ensure all corporate governance is current", priority: "High" },
        { week: "Week 3-4", action: "Negotiate valuation and terms with lead investor and syndicate", priority: "Critical" },
      ]
    };
    
    return stages[businessStage];
  };

  const getFundingMixData = () => {
    const baseData = [
      { source: 'Bootstrapping', amount: 0, color: '#3b82f6' },
      { source: 'Grants', amount: 0, color: '#8b5cf6' },
      { source: 'Equity', amount: 0, color: '#10b981' },
      { source: 'Debt', amount: 0, color: '#f59e0b' },
      { source: 'Crowdfunding', amount: 0, color: '#ec4899' },
    ];

    if (businessStage === 'idea') {
      return [
        { source: 'Bootstrapping', amount: 35000, color: '#3b82f6' },
        { source: 'Grants', amount: 5000, color: '#8b5cf6' },
        { source: 'Equity', amount: 10000, color: '#10b981' },
        { source: 'Debt', amount: 0, color: '#f59e0b' },
        { source: 'Crowdfunding', amount: 0, color: '#ec4899' },
      ];
    } else if (businessStage === 'mvp') {
      return [
        { source: 'Bootstrapping', amount: 20000, color: '#3b82f6' },
        { source: 'Grants', amount: 15000, color: '#8b5cf6' },
        { source: 'Equity', amount: 40000, color: '#10b981' },
        { source: 'Debt', amount: 0, color: '#f59e0b' },
        { source: 'Crowdfunding', amount: 0, color: '#ec4899' },
      ];
    } else if (businessStage === 'early-revenue') {
      return [
        { source: 'Bootstrapping', amount: 25000, color: '#3b82f6' },
        { source: 'Grants', amount: 10000, color: '#8b5cf6' },
        { source: 'Equity', amount: 60000, color: '#10b981' },
        { source: 'Debt', amount: 10000, color: '#f59e0b' },
        { source: 'Crowdfunding', amount: 5000, color: '#ec4899' },
      ];
    } else {
      return [
        { source: 'Bootstrapping', amount: 50000, color: '#3b82f6' },
        { source: 'Grants', amount: 10000, color: '#8b5cf6' },
        { source: 'Equity', amount: 150000, color: '#10b981' },
        { source: 'Debt', amount: 20000, color: '#f59e0b' },
        { source: 'Crowdfunding', amount: 5000, color: '#ec4899' },
      ];
    }
  };

  const getFundingTimelineData = () => {
    const timelineByStage = {
      'idea': [
        { month: 'Month 0', amount: 10000, stage: 'Personal Savings' },
        { month: 'Month 1', amount: 20000, stage: 'Friends & Family' },
        { month: 'Month 2', amount: 30000, stage: 'Pre-seed Round' },
        { month: 'Month 3', amount: 50000, stage: 'Target Met' },
        { month: 'Month 6', amount: 75000, stage: 'Growth Buffer' },
        { month: 'Month 12', amount: 100000, stage: 'Working Capital' },
      ],
      'mvp': [
        { month: 'Month 0', amount: 15000, stage: 'Initial Funds' },
        { month: 'Month 2', amount: 35000, stage: 'Angel Network' },
        { month: 'Month 4', amount: 50000, stage: 'Target Met' },
        { month: 'Month 6', amount: 75000, stage: 'Grants Awarded' },
        { month: 'Month 9', amount: 120000, stage: 'Seed Round' },
        { month: 'Month 12', amount: 150000, stage: 'Growth Capital' },
      ],
      'early-revenue': [
        { month: 'Month 0', amount: 25000, stage: 'Revenue + Savings' },
        { month: 'Month 2', amount: 50000, stage: 'Target Met' },
        { month: 'Month 4', amount: 80000, stage: 'Angel Round' },
        { month: 'Month 6', amount: 110000, stage: 'Revenue Growth' },
        { month: 'Month 9', amount: 180000, stage: 'Series A Prep' },
        { month: 'Month 12', amount: 250000, stage: 'Scaling Funds' },
      ],
      'scaling': [
        { month: 'Month 0', amount: 50000, stage: 'Existing Capital' },
        { month: 'Month 2', amount: 100000, stage: 'Bridge Round' },
        { month: 'Month 4', amount: 200000, stage: 'Pre-Series A' },
        { month: 'Month 6', amount: 350000, stage: 'Series A Close' },
        { month: 'Month 9', amount: 500000, stage: 'Growth Phase' },
        { month: 'Month 12', amount: 750000, stage: 'Expansion Ready' },
      ],
    };

    return timelineByStage[businessStage];
  };

  const handleExportPdf = () => {
    const report = `UK INNOVATOR FOUNDER VISA - FUNDING STRATEGY
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

YOUR PROFILE
${'-'.repeat(70)}
Funding Goal: £${fundingGoal.toLocaleString()}
Business Stage: ${businessStage.charAt(0).toUpperCase() + businessStage.slice(1).replace('-', ' ')}
Timeframe: ${timeframe} months
Risk Tolerance: ${riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1)}

RECOMMENDED FUNDING SOURCES
${'-'.repeat(70)}
${getRecommendedSources().map((source, i) => `
${i + 1}. ${source.type}
   Description: ${source.description}
   Suitability: ${source.suitability}
   Timeline: ${source.timeline}
   
   Pros: ${source.pros}
   Cons: ${source.cons}
`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

KEY CONSIDERATIONS FOR VISA APPLICATION
${'-'.repeat(70)}
- Ensure all £50k+ is documented with clear source verification
- Maintain liquid access to funds throughout application period (3-6 months)
- Endorsing bodies prefer diverse, stable funding sources
- Avoid heavy debt financing - can signal financial instability
- Document any equity investments with shareholder agreements
- Keep 20% buffer above minimum to handle delays or requirements

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funding-strategy-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = async () => {
    const sources = getRecommendedSources();
    const tips = getSmartTips();
    const actionPlan = generateActionPlan();

    await generateWord({
      title: 'UK Innovator Founder Visa - Funding Strategy',
      subtitle: `Business Stage: ${businessStage.charAt(0).toUpperCase() + businessStage.slice(1).replace('-', ' ')}`,
      filename: `funding-strategy-report-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Your Profile', level: 1 },
        { type: 'paragraph', content: `Funding Goal: £${fundingGoal.toLocaleString()}` },
        { type: 'paragraph', content: `Business Stage: ${businessStage.charAt(0).toUpperCase() + businessStage.slice(1).replace('-', ' ')}` },
        { type: 'paragraph', content: `Timeframe: ${timeframe} months` },
        { type: 'paragraph', content: `Risk Tolerance: ${riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1)}` },
        { type: 'divider' },
        { type: 'heading', content: 'Recommended Funding Sources', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Source', 'Description', 'Suitability', 'Timeline'],
            rows: sources.map(s => [s.type, s.description, s.suitability, s.timeline])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Smart Recommendations', level: 1 },
        { type: 'list', items: tips },
        { type: 'divider' },
        { type: 'heading', content: '4-Week Action Plan', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Week', 'Action', 'Priority'],
            rows: actionPlan.map(a => [a.week, a.action, a.priority])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Key Considerations for Visa Application', level: 1 },
        {
          type: 'list',
          items: [
            'Ensure all £50k+ is documented with clear source verification',
            'Maintain liquid access to funds throughout application period (3-6 months)',
            'Endorsing bodies prefer diverse, stable funding sources',
            'Avoid heavy debt financing - can signal financial instability',
            'Document any equity investments with shareholder agreements',
            'Keep 20% buffer above minimum to handle delays or requirements'
          ]
        }
      ],
      metadata: {
        subject: 'Funding Strategy Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['funding', 'strategy', 'visa', 'innovator founder']
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-funding-strategy">Funding Strategy</h1>
            <p className="text-lg text-muted-foreground">Identify optimal funding sources for your visa application</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="funding-strategy"
            onSave={handleSave}
            onRestore={handleRestore}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
            getSerializedState={getSerializedState}
            toolName="Funding Strategy"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-funding-strategy">
              <TabsTrigger value="strategy" data-testid="tab-strategy">Strategy</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Business Profile</CardTitle>
                  <CardDescription>Tell us about your business to get personalized funding recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="funding-goal" className="text-base font-medium mb-3 block">
                      Funding Goal (£)
                    </Label>
                    <select
                      id="funding-goal"
                      value={fundingGoal}
                      onChange={(e) => setFundingGoal(parseInt(e.target.value))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      data-testid="select-funding-goal"
                    >
                      <option value={50000}>£50,000 (Minimum)</option>
                      <option value={75000}>£75,000</option>
                      <option value={100000}>£100,000</option>
                      <option value={150000}>£150,000</option>
                      <option value={250000}>£250,000</option>
                      <option value={500000}>£500,000+</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Business Stage</Label>
                    <RadioGroup value={businessStage} onValueChange={(val: any) => setBusinessStage(val)}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="idea" id="idea" data-testid="radio-stage-idea" />
                        <Label htmlFor="idea" className="cursor-pointer">Idea Stage - Concept development, no MVP yet</Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="mvp" id="mvp" data-testid="radio-stage-mvp" />
                        <Label htmlFor="mvp" className="cursor-pointer">MVP - Product built, early testing phase</Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="early-revenue" id="early-revenue" data-testid="radio-stage-early" />
                        <Label htmlFor="early-revenue" className="cursor-pointer">Early Revenue - Paying customers, proving model</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scaling" id="scaling" data-testid="radio-stage-scaling" />
                        <Label htmlFor="scaling" className="cursor-pointer">Scaling - Established revenue, ready for growth</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Funding Timeframe</Label>
                    <RadioGroup value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="3" id="3months" data-testid="radio-timeframe-3" />
                        <Label htmlFor="3months" className="cursor-pointer">3 months - Urgent need</Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="6" id="6months" data-testid="radio-timeframe-6" />
                        <Label htmlFor="6months" className="cursor-pointer">6 months - Standard timeline</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="12months" data-testid="radio-timeframe-12" />
                        <Label htmlFor="12months" className="cursor-pointer">12 months - Long-term planning</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Risk Tolerance</Label>
                    <RadioGroup value={riskTolerance} onValueChange={(val: any) => setRiskTolerance(val)}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="low" id="low-risk" data-testid="radio-risk-low" />
                        <Label htmlFor="low-risk" className="cursor-pointer">Low - Prefer bootstrapping and grants</Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="medium" id="med-risk" data-testid="radio-risk-medium" />
                        <Label htmlFor="med-risk" className="cursor-pointer">Medium - Open to angel investment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high-risk" data-testid="radio-risk-high" />
                        <Label htmlFor="high-risk" className="cursor-pointer">High - Willing to pursue VC and aggressive growth</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Recommended Funding Mix Breakdown
                    </CardTitle>
                    <CardDescription>Optimal funding source allocation for {businessStage.replace('-', ' ')} stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80" data-testid="chart-funding-mix">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getFundingMixData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="source" 
                            className="text-sm"
                            tick={{ fill: 'currentColor' }}
                          />
                          <YAxis 
                            className="text-sm"
                            tick={{ fill: 'currentColor' }}
                            tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              color: 'hsl(var(--foreground))'
                            }}
                            formatter={(value: any) => [`£${value.toLocaleString()}`, 'Amount']}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                          <Bar 
                            dataKey="amount" 
                            fill="#3b82f6" 
                            name="Recommended Amount"
                            radius={[8, 8, 0, 0]}
                          >
                            {getFundingMixData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Funding Timeline Projection
                    </CardTitle>
                    <CardDescription>12-month funding accumulation roadmap for {businessStage.replace('-', ' ')} stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80" data-testid="chart-funding-timeline">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getFundingTimelineData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="month" 
                            className="text-sm"
                            tick={{ fill: 'currentColor' }}
                          />
                          <YAxis 
                            className="text-sm"
                            tick={{ fill: 'currentColor' }}
                            tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              color: 'hsl(var(--foreground))'
                            }}
                            formatter={(value: any, name: string, props: any) => [
                              `£${value.toLocaleString()}`,
                              props.payload.stage
                            ]}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            name="Cumulative Funding"
                            dot={{ fill: '#10b981', r: 6 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Recommended Funding Sources
                  </CardTitle>
                  <CardDescription>Based on your business stage and risk profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {getRecommendedSources().map((source, index) => (
                      <div key={index} className="border rounded-lg p-4" data-testid={`source-${index}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{source.type}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            source.suitability === 'High' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' :
                            source.suitability === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {source.suitability} Suitability
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                            <p className="text-sm font-medium">{source.timeline}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Pros</p>
                            <p className="text-sm">{source.pros}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Cons</p>
                            <p className="text-sm">{source.cons}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>Personalized guidance for your funding journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    4-Week Action Plan
                  </CardTitle>
                  <CardDescription>Stage-specific steps for {businessStage.replace('-', ' ')} businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0 w-24">
                          <span className="text-sm font-medium text-muted-foreground">{item.week}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{item.action}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded ${
                            item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </span>
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
