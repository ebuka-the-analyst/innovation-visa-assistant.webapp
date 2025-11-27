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
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type FundingSource = {
  name: string;
  amount: number;
  verified: boolean;
  type: 'savings' | 'investment' | 'loan' | 'grant' | 'revenue' | 'other';
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'funding-checker',
  toolName: 'Funding Compliance Checker',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Planning Specialist. I'll help you verify your funding sources meet visa requirements. Let's ensure your documentation is endorser-ready!",
  questions: [
    {
      id: 'primary-source',
      question: "What is your primary source of funding? Include the type (savings, investment, loan, etc.) and approximate amount.",
      hint: "Be specific - e.g., 'Personal savings of £35,000 in UK bank account'",
      fieldKey: 'primarySource',
      minLength: 30
    },
    {
      id: 'additional-sources',
      question: "Do you have additional funding sources? List each with type and amount.",
      hint: "Include all sources: angel investment, family loans, grants, revenue, etc.",
      fieldKey: 'additionalSources',
      minLength: 20
    },
    {
      id: 'verification-status',
      question: "What documentation do you have to verify your funding sources?",
      hint: "E.g., bank statements, investment agreements, loan contracts, grant letters",
      fieldKey: 'verificationDocs',
      minLength: 40
    },
    {
      id: 'fund-availability',
      question: "Are all your funds immediately accessible? Describe any restrictions or timelines.",
      hint: "Endorsing bodies need to know funds are readily available for business use",
      fieldKey: 'fundAvailability',
      minLength: 30
    },
    {
      id: 'fund-use',
      question: "How do you plan to use these funds in your first 12 months?",
      hint: "Provide percentage breakdown: product development, hiring, marketing, operations, etc.",
      fieldKey: 'fundUse',
      minLength: 50
    }
  ],
  completionMessage: "Your funding overview is captured! I've noted your sources - now add them to the Checker tab with specific amounts so we can verify compliance and identify any documentation gaps."
};

export default function FundingChecker() {
  const [sources, setSources] = useState<FundingSource[]>([
    { name: 'Personal Savings', amount: 0, verified: false, type: 'savings' }
  ]);
  const [activeTab, setActiveTab] = useState('checker');
  const [savedDate, setSavedDate] = useState('');
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('funding-checker-mode') as 'ai' | 'traditional') || 'ai';
  });

  useEffect(() => {
    localStorage.setItem('funding-checker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    setMode('traditional');
    setActiveTab('checker');
  };

  const addSource = () => {
    setSources([...sources, { name: '', amount: 0, verified: false, type: 'savings' }]);
  };

  const updateSource = (index: number, field: keyof FundingSource, value: any) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const totalFunding = sources.reduce((sum, s) => sum + (s.amount || 0), 0);
  const verifiedFunding = sources.filter(s => s.verified).reduce((sum, s) => sum + s.amount, 0);
  const unverifiedFunding = totalFunding - verifiedFunding;
  const meetsMinimum = totalFunding > 0;
  const verifiedMeetsMinimum = verifiedFunding > 0;
  const complianceScore = Math.min(100, Math.round((verifiedFunding / Math.max(totalFunding, 1)) * 100));

  const fundingByType = [
    { name: 'Savings', value: sources.filter(s => s.type === 'savings').reduce((sum, s) => sum + s.amount, 0), color: '#3b82f6' },
    { name: 'Investment', value: sources.filter(s => s.type === 'investment').reduce((sum, s) => sum + s.amount, 0), color: '#10b981' },
    { name: 'Loan', value: sources.filter(s => s.type === 'loan').reduce((sum, s) => sum + s.amount, 0), color: '#f59e0b' },
    { name: 'Grant', value: sources.filter(s => s.type === 'grant').reduce((sum, s) => sum + s.amount, 0), color: '#8b5cf6' },
    { name: 'Revenue', value: sources.filter(s => s.type === 'revenue').reduce((sum, s) => sum + s.amount, 0), color: '#ec4899' },
    { name: 'Other', value: sources.filter(s => s.type === 'other').reduce((sum, s) => sum + s.amount, 0), color: '#6b7280' },
  ].filter(item => item.value > 0);

  const verificationData = [
    { status: 'Verified', amount: verifiedFunding, color: '#10b981' },
    { status: 'Unverified', amount: unverifiedFunding, color: '#ef4444' },
  ].filter(item => item.amount > 0);

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
    const saved = localStorage.getItem('funding-checker-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('funding-checker-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('funding-checker-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    if (!meetsMinimum) tips.push("Add your funding sources - there's no minimum amount, but funds must be appropriate for your business plan");
    if (!verifiedMeetsMinimum && meetsMinimum) tips.push("Ensure your funding sources are properly documented with bank statements and verification");
    if (unverifiedFunding > 10000) tips.push("Prioritize verifying larger funding sources first - documentation is critical for approval");
    if (sources.length < 2) tips.push("Diversifying funding sources demonstrates financial stability to endorsing bodies");
    if (sources.some(s => s.type === 'loan' && s.amount > 25000)) tips.push("Large loans may raise concerns - ensure you have clear repayment plans documented");
    if (verifiedMeetsMinimum) tips.push("Strong funding position - focus on maintaining liquidity throughout the application process");
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Gather all bank statements and funding source documentation for the past 3-6 months", priority: "Critical" },
      { week: "Week 1-2", action: "Obtain verification letters from banks, investors, or other funding sources", priority: "Critical" },
      { week: "Week 2", action: "Organize documentation by funding source with clear audit trail", priority: "High" },
      { week: "Week 2-3", action: "Prepare evidence of fund availability and accessibility (not just ownership)", priority: "Critical" },
      { week: "Week 3", action: "Document any fund transfers between accounts with clear paper trail", priority: "High" },
      { week: "Week 3-4", action: "Have accountant review and certify funding documentation completeness", priority: "High" },
      { week: "Week 4", action: "Create funding summary document explaining each source clearly", priority: "Medium" },
      { week: "Ongoing", action: "Maintain your documented funding accessible throughout application period", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - FUNDING COMPLIANCE CHECKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

FUNDING SUMMARY
${'-'.repeat(70)}
Total Funding: £${totalFunding.toLocaleString()}
Verified Funding: £${verifiedFunding.toLocaleString()}
Unverified Funding: £${unverifiedFunding.toLocaleString()}
Minimum Requirement: No fixed minimum - must be appropriate for your plan
Status: ${meetsMinimum ? 'MEETS MINIMUM' : 'BELOW MINIMUM'}
Verified Status: ${verifiedMeetsMinimum ? 'VERIFIED MEETS MINIMUM' : 'NEEDS MORE VERIFICATION'}
Compliance Score: ${complianceScore}%

FUNDING SOURCES BREAKDOWN
${'-'.repeat(70)}
${sources.map((source, i) => `
${i + 1}. ${source.name || 'Unnamed Source'}
   Type: ${source.type.charAt(0).toUpperCase() + source.type.slice(1)}
   Amount: £${source.amount.toLocaleString()}
   Verified: ${source.verified ? 'YES' : 'NO'}
`).join('')}

FUNDING BY TYPE
${'-'.repeat(70)}
${fundingByType.map(item => `${item.name}: £${item.value.toLocaleString()}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

COMPLIANCE NOTES
${'-'.repeat(70)}
- Funds must be held in a regulated financial institution
- All funds must be freely transferable to the UK
- Source of funds must be clearly documented
- Funds must remain accessible throughout the application period
- Endorsing bodies may request additional verification
- Consider maintaining a buffer for unexpected costs

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funding-checker-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-funding-checker">Funding Checker</h1>
            <p className="text-lg text-muted-foreground">Validate your business investment funding and documentation</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="funding-checker"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Funding Checker"
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
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-funding-checker">
              <TabsTrigger value="checker" data-testid="tab-checker">Checker</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="checker" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Compliance Status</CardTitle>
                  <CardDescription>UK Innovator Founder Visa requires appropriate funding for your business plan - there is no fixed minimum</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
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
                            <span className="text-sm">{meetsMinimum ? 'Meets Minimum' : 'Below Minimum'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={verifiedMeetsMinimum ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Verified Funding</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-verified-funding">£{verifiedFunding.toLocaleString()}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {verifiedMeetsMinimum ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{verifiedMeetsMinimum ? 'Verified' : 'Needs Verification'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Compliance Score</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-compliance-score">{complianceScore}%</p>
                          <Progress value={complianceScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Add funding sources appropriate for your business plan. Endorsers will assess if funding is sufficient for your specific business.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !verifiedMeetsMinimum && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum requirement but only £{verifiedFunding.toLocaleString()} is verified. Ensure proper documentation for all funding sources.
                      </AlertDescription>
                    </Alert>
                  )}

                  {verifiedMeetsMinimum && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Your funding sources are documented. Ensure all documentation is complete, verified, and up-to-date for your endorsement meeting.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Funding Sources</h3>
                      <Button onClick={addSource} size="sm" data-testid="button-add-source">
                        Add Source
                      </Button>
                    </div>

                    {sources.map((source, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`source-name-${index}`}>Source Name</Label>
                            <Input
                              id={`source-name-${index}`}
                              value={source.name}
                              onChange={(e) => updateSource(index, 'name', e.target.value)}
                              placeholder="e.g., Personal Savings, Angel Investment"
                              data-testid={`input-source-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`source-amount-${index}`}>Amount (£)</Label>
                            <Input
                              id={`source-amount-${index}`}
                              type="number"
                              value={source.amount || ''}
                              onChange={(e) => updateSource(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-source-amount-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`source-type-${index}`}>Type</Label>
                            <select
                              id={`source-type-${index}`}
                              value={source.type}
                              onChange={(e) => updateSource(index, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-source-type-${index}`}
                            >
                              <option value="savings">Savings</option>
                              <option value="investment">Investment</option>
                              <option value="loan">Loan</option>
                              <option value="grant">Grant</option>
                              <option value="revenue">Revenue</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={source.verified}
                                onChange={(e) => updateSource(index, 'verified', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-verified-${index}`}
                              />
                              <span className="text-sm">Verified</span>
                            </label>
                            {sources.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSource(index)}
                                data-testid={`button-remove-source-${index}`}
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

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Funding by Type</CardTitle>
                    <CardDescription>Distribution of funding sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fundingByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={fundingByType}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {fundingByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add funding sources to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Verified vs unverified funding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verificationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={verificationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                          <Bar dataKey="amount" fill="#3b82f6">
                            {verificationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add funding sources to see verification status</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Requirements</CardTitle>
                  <CardDescription>UK Innovator Founder Visa funding criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Appropriate Business Investment</p>
                        <p className="text-sm text-muted-foreground">Required total accessible funds for business investment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Regulated Financial Institution</p>
                        <p className="text-sm text-muted-foreground">Funds must be held in regulated banks or investment accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Source Documentation</p>
                        <p className="text-sm text-muted-foreground">Clear evidence of where funds originated (salary, sale of assets, investment, etc.)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Freely Transferable</p>
                        <p className="text-sm text-muted-foreground">Funds must be movable to UK without restrictions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Continuous Availability</p>
                        <p className="text-sm text-muted-foreground">Maintain access throughout application period (typically 3-6 months)</p>
                      </div>
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
                  <CardDescription>Context-aware guidance based on your funding profile</CardDescription>
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
                  <CardDescription>Prioritized steps to ensure funding compliance</CardDescription>
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
