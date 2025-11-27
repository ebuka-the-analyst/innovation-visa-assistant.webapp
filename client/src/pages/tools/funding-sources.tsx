import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, TrendingUp, Plus, Trash2 } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

type FundingSourceAnalysis = {
  id: string;
  name: string;
  category: 'personal' | 'angel' | 'vc' | 'grant' | 'loan' | 'revenue' | 'other';
  amount: number;
  availability: 'immediate' | '1-3mo' | '3-6mo' | '6-12mo';
  verified: boolean;
  visaApproved: boolean;
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'funding-sources',
  toolName: 'Funding Sources Analysis',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Planning Specialist. I'll help you document and analyze all your funding sources to ensure they meet visa requirements and demonstrate financial stability.",
  questions: [
    {
      id: 'personal-funds',
      question: "How much personal savings or investment are you contributing? Where are these funds held?",
      hint: "Personal investment shows commitment - include bank name and currency if relevant",
      fieldKey: 'personalFunds',
      minLength: 30
    },
    {
      id: 'external-investment',
      question: "Have you secured any external investment? If so, from whom and how much?",
      hint: "Include angels, VCs, family/friends, and whether investment is committed or in discussion",
      fieldKey: 'externalInvestment',
      minLength: 30
    },
    {
      id: 'grants-loans',
      question: "Do you have any grants, loans, or other non-equity funding sources?",
      hint: "Include government grants, startup loans, accelerator funding, etc.",
      fieldKey: 'grantsLoans',
      minLength: 20
    },
    {
      id: 'revenue-funding',
      question: "If you're generating revenue, how much can you reinvest in the business?",
      hint: "Include current MRR/ARR and projected revenue reinvestment over 12 months",
      fieldKey: 'revenueFunding',
      minLength: 20
    },
    {
      id: 'fund-timeline',
      question: "When will each funding source be available? Note any conditions or dependencies.",
      hint: "E.g., 'Angel round closing in 6 weeks pending due diligence'",
      fieldKey: 'fundTimeline',
      minLength: 40
    }
  ],
  completionMessage: "Your funding landscape is mapped out! Head to the Sources tab to add each funding source with specific amounts and verification status for a complete analysis."
};

export default function FundingSources() {
  const [sources, setSources] = useState<FundingSourceAnalysis[]>([
    { id: '1', name: 'Personal Savings', category: 'personal', amount: 50000, availability: 'immediate', verified: false, visaApproved: true }
  ]);
  const [activeTab, setActiveTab] = useState('sources');
  const [savedDate, setSavedDate] = useState('');
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('funding-sources-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('funding-sources-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    setMode('traditional');
    setActiveTab('sources');
  };

  const addSource = () => {
    const newId = (Math.max(...sources.map(s => parseInt(s.id)), 0) + 1).toString();
    setSources([...sources, {
      id: newId,
      name: '',
      category: 'personal',
      amount: 0,
      availability: 'immediate',
      verified: false,
      visaApproved: true
    }]);
  };

  const updateSource = (id: string, field: keyof FundingSourceAnalysis, value: any) => {
    setSources(sources.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSource = (id: string) => {
    if (sources.length > 1) {
      setSources(sources.filter(s => s.id !== id));
    }
  };

  const totalFunding = sources.reduce((sum, s) => sum + (s.amount || 0), 0);
  const verifiedFunding = sources.filter(s => s.verified).reduce((sum, s) => sum + s.amount, 0);
  const visaApprovedFunding = sources.filter(s => s.visaApproved).reduce((sum, s) => sum + s.amount, 0);
  const meetsMinimum = totalFunding >= 50000;
  const verifiedMeetsMinimum = verifiedFunding >= 50000;

  const categoryData = [
    { name: 'Personal', value: sources.filter(s => s.category === 'personal').reduce((sum, s) => sum + s.amount, 0), color: '#3b82f6' },
    { name: 'Angel', value: sources.filter(s => s.category === 'angel').reduce((sum, s) => sum + s.amount, 0), color: '#10b981' },
    { name: 'VC', value: sources.filter(s => s.category === 'vc').reduce((sum, s) => sum + s.amount, 0), color: '#8b5cf6' },
    { name: 'Grant', value: sources.filter(s => s.category === 'grant').reduce((sum, s) => sum + s.amount, 0), color: '#f59e0b' },
    { name: 'Loan', value: sources.filter(s => s.category === 'loan').reduce((sum, s) => sum + s.amount, 0), color: '#ef4444' },
    { name: 'Revenue', value: sources.filter(s => s.category === 'revenue').reduce((sum, s) => sum + s.amount, 0), color: '#ec4899' },
    { name: 'Other', value: sources.filter(s => s.category === 'other').reduce((sum, s) => sum + s.amount, 0), color: '#6b7280' },
  ].filter(item => item.value > 0);

  const getSerializedState = () => {
    return {
      sources,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('sources' in state) setSources(state.sources);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('funding-sources-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('funding-sources-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('funding-sources-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (!meetsMinimum) {
      tips.push('Consider if total funding is appropriate for your business plan - endorsers assess funding adequacy');
    }
    
    if (meetsMinimum && !verifiedMeetsMinimum) {
      tips.push('Get documentation for all funding sources - verification is critical for visa approval');
    }
    
    const loanHeavy = sources.filter(s => s.category === 'loan').reduce((sum, s) => sum + s.amount, 0);
    if (loanHeavy > totalFunding * 0.5) {
      tips.push('Over 50% loan funding may concern endorsers - balance with equity or personal investment');
    }
    
    if (sources.length === 1) {
      tips.push('Consider diversifying funding sources - reduces risk and demonstrates financial stability');
    }
    
    const immediateAccess = sources.filter(s => s.availability === 'immediate').reduce((sum, s) => sum + s.amount, 0);
    if (immediateAccess < totalFunding * 0.5) {
      tips.push('Ensure most of your funding is immediately accessible - visa applications can be time-sensitive');
    }
    
    if (visaApprovedFunding < totalFunding) {
      tips.push('Some sources may not meet visa criteria - consult with endorsing body on acceptable funding types');
    }
    
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Document each funding source with bank statements or investment agreements", priority: "Critical" },
      { week: "Week 1-2", action: "Obtain verification letters from banks and investors confirming fund availability", priority: "Critical" },
      { week: "Week 2", action: "Prepare source-of-funds documentation showing origin of each amount", priority: "High" },
      { week: "Week 2-3", action: "Review each source against visa eligibility criteria with endorsing body", priority: "Critical" },
      { week: "Week 3", action: "Consolidate funds into accessible UK account if coming from international sources", priority: "High" },
      { week: "Week 3-4", action: "Create comprehensive funding narrative explaining diversification strategy", priority: "Medium" },
      { week: "Week 4", action: "Prepare backup sources in case primary sources face verification delays", priority: "High" },
      { week: "Ongoing", action: "Monitor and maintain all funding relationships throughout application period", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - FUNDING SOURCES ANALYSIS
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

FUNDING OVERVIEW
${'-'.repeat(70)}
Total Funding: £${totalFunding.toLocaleString()}
Verified Funding: £${verifiedFunding.toLocaleString()}
Visa-Approved Funding: £${visaApprovedFunding.toLocaleString()}
Number of Sources: ${sources.length}
Meets Minimum (£50k): ${meetsMinimum ? 'YES' : 'NO'}
Verified Meets Minimum: ${verifiedMeetsMinimum ? 'YES' : 'NO'}

DETAILED SOURCE BREAKDOWN
${'-'.repeat(70)}
${sources.map((source, i) => `
${i + 1}. ${source.name || 'Unnamed Source'}
   Category: ${source.category.charAt(0).toUpperCase() + source.category.slice(1)}
   Amount: £${source.amount.toLocaleString()}
   Availability: ${source.availability}
   Verified: ${source.verified ? 'YES' : 'NO'}
   Visa Approved: ${source.visaApproved ? 'YES' : 'NO'}
`).join('')}

FUNDING BY CATEGORY
${'-'.repeat(70)}
${categoryData.map(cat => `${cat.name}: £${cat.value.toLocaleString()}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA COMPLIANCE NOTES
${'-'.repeat(70)}
- All funding sources must be verifiable and documented
- Funds must be freely transferable to the UK
- Endorsing bodies prefer low-risk, diverse funding portfolios
- Maintain continuous access to funds throughout 3-6 month application
- Personal investment demonstrates commitment (highly valued)
- Avoid excessive debt - signals financial instability

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funding-sources-analysis-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-funding-sources">Funding Sources</h1>
            <p className="text-lg text-muted-foreground">Analyze and document all investment sources</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="funding-sources"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Funding Sources"
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
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-funding-sources">
              <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className={meetsMinimum ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Total Funding</p>
                      <p className="text-3xl font-bold" data-testid="text-total-funding">£{totalFunding.toLocaleString()}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {meetsMinimum ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Verified</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-verified">£{verifiedFunding.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">{sources.filter(s => s.verified).length} of {sources.length} sources</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Visa Approved</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-visa-approved">£{visaApprovedFunding.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">{sources.filter(s => s.visaApproved).length} of {sources.length} sources</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Funding Sources</CardTitle>
                      <CardDescription>Document all sources of investment capital</CardDescription>
                    </div>
                    <Button onClick={addSource} size="sm" data-testid="button-add-source">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Source
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sources.map((source) => (
                      <Card key={source.id} className="p-4">
                        <div className="grid md:grid-cols-6 gap-4 items-end">
                          <div>
                            <Label htmlFor={`name-${source.id}`}>Source Name</Label>
                            <Input
                              id={`name-${source.id}`}
                              value={source.name}
                              onChange={(e) => updateSource(source.id, 'name', e.target.value)}
                              placeholder="e.g., Personal Savings"
                              data-testid={`input-name-${source.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`category-${source.id}`}>Category</Label>
                            <select
                              id={`category-${source.id}`}
                              value={source.category}
                              onChange={(e) => updateSource(source.id, 'category', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-category-${source.id}`}
                            >
                              <option value="personal">Personal</option>
                              <option value="angel">Angel</option>
                              <option value="vc">VC</option>
                              <option value="grant">Grant</option>
                              <option value="loan">Loan</option>
                              <option value="revenue">Revenue</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`amount-${source.id}`}>Amount (£)</Label>
                            <Input
                              id={`amount-${source.id}`}
                              type="number"
                              value={source.amount || ''}
                              onChange={(e) => updateSource(source.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-amount-${source.id}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`avail-${source.id}`}>Availability</Label>
                            <select
                              id={`avail-${source.id}`}
                              value={source.availability}
                              onChange={(e) => updateSource(source.id, 'availability', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-availability-${source.id}`}
                            >
                              <option value="immediate">Immediate</option>
                              <option value="1-3mo">1-3 Months</option>
                              <option value="3-6mo">3-6 Months</option>
                              <option value="6-12mo">6-12 Months</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={source.verified}
                                onChange={(e) => updateSource(source.id, 'verified', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-verified-${source.id}`}
                              />
                              <span className="text-sm">Verified</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={source.visaApproved}
                                onChange={(e) => updateSource(source.id, 'visaApproved', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-visa-${source.id}`}
                              />
                              <span className="text-sm">Visa OK</span>
                            </label>
                            {sources.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSource(source.id)}
                                data-testid={`button-remove-${source.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Distribution by Category</CardTitle>
                  <CardDescription>Visual breakdown of your funding portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add funding sources to see distribution analysis</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Category Guidelines</CardTitle>
                  <CardDescription>Understanding different funding types for visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium">Personal / Savings</p>
                      <p className="text-sm text-muted-foreground">Own funds from savings, asset sales, or inheritance. Highest approval rate, demonstrates commitment.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="font-medium">Angel Investment</p>
                      <p className="text-sm text-muted-foreground">Individual investors providing equity funding. Well-regarded, shows external validation.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="font-medium">Venture Capital</p>
                      <p className="text-sm text-muted-foreground">Institutional investment for scaling businesses. Strong signal but requires traction.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-medium">Grants / Competitions</p>
                      <p className="text-sm text-muted-foreground">Non-dilutive awards from government or organizations. Excellent validation, but may have spending restrictions.</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className="font-medium">Loans</p>
                      <p className="text-sm text-muted-foreground">Debt financing from banks or lenders. Use sparingly - heavy debt raises stability concerns.</p>
                    </div>
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
                  <CardDescription>Context-aware guidance for your funding portfolio</CardDescription>
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
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Steps to document and verify all funding sources</CardDescription>
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
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
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
          )}
        </div>
      </div>
    </>
  );
}
