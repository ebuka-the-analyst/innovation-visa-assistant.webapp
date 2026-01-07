import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Wallet, Building, TrendingUp, FileText, Plus, Trash2 } from "lucide-react";
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'financial-resilience',
  toolName: 'Financial Resilience Evidence',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. Building robust financial evidence is essential for demonstrating viability to endorsers. Let me guide you through documenting your runway, bank statements, and funding sources systematically.",
  questions: [
    {
      id: 'monthly-burn',
      question: "What is your current monthly burn rate? Include all operational costs, salaries, and overhead expenses.",
      hint: "Be comprehensive - endorsers want to see you understand your cost structure",
      fieldKey: 'monthly_burn',
      fieldType: 'number',
      minLength: 1
    },
    {
      id: 'current-cash',
      question: "How much cash do you currently have in your business accounts? Provide the total across all business accounts.",
      hint: "This should match what's shown in your recent bank statements",
      fieldKey: 'current_cash',
      fieldType: 'number',
      minLength: 1
    },
    {
      id: 'personal-savings',
      question: "What personal savings do you have available? Remember the UK visa requires £1,270 minimum held for 28 consecutive days.",
      hint: "Endorsers want to see you have personal financial stability",
      fieldKey: 'personal_savings',
      fieldType: 'number',
      minLength: 1
    },
    {
      id: 'bank-accounts',
      question: "Which banks hold your business and personal accounts? List them with approximate balances and account types.",
      hint: "Include all accounts you'll use as evidence - business current, savings, etc.",
      fieldKey: 'bank_accounts',
      minLength: 30
    },
    {
      id: 'funding-sources',
      question: "What are your funding sources? Include personal investment, angel investors, grants, or any committed capital.",
      hint: "Document each source with amounts and status (received, committed, pending)",
      fieldKey: 'funding_sources',
      minLength: 30
    },
    {
      id: 'funding-documentation',
      question: "What documentation do you have for each funding source? List the types of proof available.",
      hint: "Investment agreements, bank transfers, grant letters, commitment letters",
      fieldKey: 'funding_docs',
      minLength: 20
    }
  ]
};

interface BankStatement {
  id: string;
  bankName: string;
  accountType: string;
  currentBalance: number;
  averageBalance: number;
  monthsCovered: number;
}

interface FundingSource {
  id: string;
  source: string;
  amount: number;
  status: string;
  documentation: string;
}

export default function FinancialResilience() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [activeTab, setActiveTab] = useState('runway');
  const [savedDate, setSavedDate] = useState('');
  
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('financial-resilience-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('financial-resilience-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('financial-resilience-mode', mode);
  }, [mode]);

  const handleAiComplete = useCallback((answers: Record<string, any>) => {
    if (answers.monthly_burn) {
      const burnValue = parseInt(answers.monthly_burn) || 0;
      setRunway(prev => ({ ...prev, monthlyBurn: burnValue }));
    }
    if (answers.current_cash) {
      const cashValue = parseInt(answers.current_cash) || 0;
      setRunway(prev => ({ ...prev, currentCash: cashValue }));
    }
    if (answers.personal_savings) {
      const savingsValue = parseInt(answers.personal_savings) || 0;
      setRunway(prev => ({ ...prev, personalSavings: savingsValue }));
    }
    setMode('traditional');
    toast({ title: "AI Guide Complete", description: "Your answers have been applied to the form" });
  }, [toast]);

  const [runway, setRunway] = useState({
    monthlyBurn: 0,
    currentCash: 0,
    personalSavings: 0,
    monthsRunway: 0
  });

  const [bankStatements, setBankStatements] = useState<BankStatement[]>([
    { id: '1', bankName: '', accountType: '', currentBalance: 0, averageBalance: 0, monthsCovered: 0 }
  ]);

  const [fundingSources, setFundingSources] = useState<FundingSource[]>([
    { id: '1', source: '', amount: 0, status: '', documentation: '' }
  ]);

  const [checklist, setChecklist] = useState({
    has28DayStatements: false,
    meetsPersonalMaintenance: false,
    businessAccountSeparate: false,
    fundingDocumented: false,
    runwayOver12Months: false,
    noOverdraftReliance: false,
    consistentDeposits: false,
    taxReserves: false
  });

  const personalMaintenanceRequired = 1270;

  const getSerializedState = () => ({
    runway, bankStatements, fundingSources, checklist, activeTab,
    savedDate: new Date().toLocaleString('en-GB')
  });

  const restoreSerializedState = (state: any) => {
    if (state.runway) setRunway(state.runway);
    if (state.bankStatements) setBankStatements(state.bankStatements);
    if (state.fundingSources) setFundingSources(state.fundingSources);
    if (state.checklist) setChecklist(state.checklist);
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.savedDate) setSavedDate(state.savedDate);
  };

  useEffect(() => {
    const saved = localStorage.getItem('financial-resilience-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (runway.monthlyBurn > 0 && runway.currentCash > 0) {
      setRunway(prev => ({
        ...prev,
        monthsRunway: Math.round((prev.currentCash + prev.personalSavings) / prev.monthlyBurn)
      }));
    }
  }, [runway.monthlyBurn, runway.currentCash, runway.personalSavings]);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('financial-resilience-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
    toast({ title: "Progress saved", description: "Your financial data has been saved" });
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('financial-resilience-state');
    if (saved) restoreSerializedState(JSON.parse(saved));
  };

  const calculateResilienceScore = () => {
    let score = 0;
    const checklistValues = Object.values(checklist);
    const checkedItems = checklistValues.filter(v => v).length;
    score += (checkedItems / checklistValues.length) * 40;
    
    if (runway.monthsRunway >= 12) score += 30;
    else if (runway.monthsRunway >= 6) score += 15;
    
    if (runway.personalSavings >= personalMaintenanceRequired) score += 15;
    
    const totalFunding = fundingSources.reduce((sum, f) => sum + f.amount, 0);
    if (totalFunding > 0) score += 15;
    
    return Math.min(Math.round(score), 100);
  };

  const getRunwayStatus = () => {
    if (runway.monthsRunway >= 18) return { status: 'Excellent', color: 'bg-green-500' };
    if (runway.monthsRunway >= 12) return { status: 'Strong', color: 'bg-green-400' };
    if (runway.monthsRunway >= 6) return { status: 'Adequate', color: 'bg-yellow-500' };
    return { status: 'At Risk', color: 'bg-red-500' };
  };

  const checklistItems = [
    { key: 'has28DayStatements', label: '28 consecutive days bank statements available', description: 'Required for personal maintenance proof' },
    { key: 'meetsPersonalMaintenance', label: `Personal maintenance funds (£${personalMaintenanceRequired}+) documented`, description: 'Must be held for 28 consecutive days' },
    { key: 'businessAccountSeparate', label: 'Business and personal accounts separate', description: 'Clear separation of finances' },
    { key: 'fundingDocumented', label: 'All funding sources documented with proof', description: 'Investment letters, contracts, etc.' },
    { key: 'runwayOver12Months', label: 'Runway exceeds 12 months', description: 'Demonstrates financial stability' },
    { key: 'noOverdraftReliance', label: 'No reliance on overdraft facilities', description: 'Genuine available funds' },
    { key: 'consistentDeposits', label: 'Consistent income/deposit history', description: 'Shows reliable cash flow' },
    { key: 'taxReserves', label: 'Tax reserves set aside', description: 'Planning for tax obligations' }
  ];

  const getSmartTips = () => [
    "Keep £1,270 minimum in your account for 28 consecutive days before applying",
    "Document all funding sources with official letters or contracts",
    "Separate personal and business finances for clear evidence",
    "Show 12+ months runway to demonstrate business viability",
    "Avoid overdraft usage in the months before application",
    "Include recent bank statements (within 31 days of application)"
  ];

  const generateActionPlan = () => [
    { week: "Week 1", action: "Ensure personal savings meet £1,270 threshold", priority: "Critical" },
    { week: "Week 1", action: "Request bank statements for last 3 months", priority: "High" },
    { week: "Week 2", action: "Document all funding sources with formal letters", priority: "Critical" },
    { week: "Week 2", action: "Create separate business account if not already done", priority: "High" },
    { week: "Week 3", action: "Calculate and document 12+ month runway", priority: "High" },
    { week: "Week 4", action: "Compile all financial evidence into organized folder", priority: "Medium" }
  ];

  const handleExportWord = async () => {
    await generateWord({
      title: 'Financial Resilience Evidence',
      subtitle: `Resilience Score: ${calculateResilienceScore()}/100`,
      filename: `financial-resilience-${Date.now()}.docx`,
      sections: [
        { type: 'heading', content: 'Financial Runway', level: 1 },
        { type: 'paragraph', content: `Monthly Burn Rate: £${runway.monthlyBurn.toLocaleString()}` },
        { type: 'paragraph', content: `Current Cash: £${runway.currentCash.toLocaleString()}` },
        { type: 'paragraph', content: `Personal Savings: £${runway.personalSavings.toLocaleString()}` },
        { type: 'paragraph', content: `Runway: ${runway.monthsRunway} months (${getRunwayStatus().status})` },
        { type: 'divider' },
        { type: 'heading', content: 'Bank Statements', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Bank', 'Account Type', 'Current Balance', 'Average Balance', 'Months'],
            rows: bankStatements.filter(b => b.bankName).map(b => [b.bankName, b.accountType, `£${b.currentBalance.toLocaleString()}`, `£${b.averageBalance.toLocaleString()}`, b.monthsCovered.toString()])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Funding Sources', level: 1 },
        {
          type: 'table',
          tableData: {
            headers: ['Source', 'Amount', 'Status', 'Documentation'],
            rows: fundingSources.filter(f => f.source).map(f => [f.source, `£${f.amount.toLocaleString()}`, f.status, f.documentation])
          }
        },
        { type: 'divider' },
        { type: 'heading', content: 'Compliance Checklist', level: 1 },
        ...checklistItems.map(item => ({ type: 'paragraph' as const, content: `${checklist[item.key as keyof typeof checklist] ? '[PASS]' : '[FAIL]'} ${item.label}` }))
      ]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="responsive-container max-w-6xl">
        <ToolUtilityBar
          toolId="financial-resilience"
          toolName="Financial Resilience Evidence"
          onSave={handleSave}
          onRestore={handleRestore}
          onExportWord={handleExportWord}
          getSerializedState={getSerializedState}
        />

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-primary" />
                  Financial Resilience Evidence
                </CardTitle>
                <CardDescription>
                  Document runway, bank statements & investment readiness
                </CardDescription>
              </div>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'ai' ? (
              <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
            ) : (
              <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Financial Resilience Score</span>
                <Badge className={getRunwayStatus().color}>{getRunwayStatus().status}</Badge>
              </div>
              <Progress value={calculateResilienceScore()} className="h-3" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="runway" data-testid="tab-runway">
                  <TrendingUp className="h-4 w-4 mr-2" />Runway
                </TabsTrigger>
                <TabsTrigger value="statements" data-testid="tab-statements">
                  <Building className="h-4 w-4 mr-2" />Statements
                </TabsTrigger>
                <TabsTrigger value="funding" data-testid="tab-funding">
                  <Wallet className="h-4 w-4 mr-2" />Funding
                </TabsTrigger>
                <TabsTrigger value="checklist" data-testid="tab-checklist">
                  <FileText className="h-4 w-4 mr-2" />Checklist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="runway" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Financial Runway Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Burn Rate (£)</Label>
                    <Input
                      type="number"
                      value={runway.monthlyBurn || ''}
                      onChange={(e) => setRunway({...runway, monthlyBurn: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 5000"
                      data-testid="input-burn-rate"
                    />
                  </div>
                  <div>
                    <Label>Current Business Cash (£)</Label>
                    <Input
                      type="number"
                      value={runway.currentCash || ''}
                      onChange={(e) => setRunway({...runway, currentCash: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 50000"
                      data-testid="input-current-cash"
                    />
                  </div>
                  <div>
                    <Label>Personal Savings (£)</Label>
                    <Input
                      type="number"
                      value={runway.personalSavings || ''}
                      onChange={(e) => setRunway({...runway, personalSavings: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 10000"
                      data-testid="input-personal-savings"
                    />
                  </div>
                  <div>
                    <Label>Calculated Runway</Label>
                    <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted">
                      <span className="font-semibold">{runway.monthsRunway} months</span>
                    </div>
                  </div>
                </div>

                <Card className={`p-4 ${runway.personalSavings >= personalMaintenanceRequired ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : 'border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/10'}`}>
                  <h4 className="font-semibold mb-2">Personal Maintenance Requirement</h4>
                  <p className="text-sm text-muted-foreground">
                    UK Innovator Founder Visa requires £{personalMaintenanceRequired.toLocaleString()} held for 28 consecutive days.
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Your Status: {runway.personalSavings >= personalMaintenanceRequired ? 
                      <span className="text-green-600">Meets Requirement</span> : 
                      <span className="text-yellow-600">Below Requirement (need £{(personalMaintenanceRequired - runway.personalSavings).toLocaleString()} more)</span>}
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="statements" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Bank Statements</h3>
                {bankStatements.map((statement, index) => (
                  <Card key={statement.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          value={statement.bankName}
                          onChange={(e) => {
                            const updated = [...bankStatements];
                            updated[index].bankName = e.target.value;
                            setBankStatements(updated);
                          }}
                          placeholder="e.g., Barclays"
                          data-testid={`input-bank-name-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Account Type</Label>
                        <Input
                          value={statement.accountType}
                          onChange={(e) => {
                            const updated = [...bankStatements];
                            updated[index].accountType = e.target.value;
                            setBankStatements(updated);
                          }}
                          placeholder="e.g., Business Current"
                          data-testid={`input-account-type-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Months Covered</Label>
                        <Input
                          type="number"
                          value={statement.monthsCovered || ''}
                          onChange={(e) => {
                            const updated = [...bankStatements];
                            updated[index].monthsCovered = parseInt(e.target.value) || 0;
                            setBankStatements(updated);
                          }}
                          placeholder="e.g., 3"
                          data-testid={`input-months-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Current Balance (£)</Label>
                        <Input
                          type="number"
                          value={statement.currentBalance || ''}
                          onChange={(e) => {
                            const updated = [...bankStatements];
                            updated[index].currentBalance = parseInt(e.target.value) || 0;
                            setBankStatements(updated);
                          }}
                          placeholder="0"
                          data-testid={`input-current-balance-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Average Balance (£)</Label>
                        <Input
                          type="number"
                          value={statement.averageBalance || ''}
                          onChange={(e) => {
                            const updated = [...bankStatements];
                            updated[index].averageBalance = parseInt(e.target.value) || 0;
                            setBankStatements(updated);
                          }}
                          placeholder="0"
                          data-testid={`input-avg-balance-${index}`}
                        />
                      </div>
                    </div>
                    {bankStatements.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setBankStatements(bankStatements.filter((_, i) => i !== index))}
                        data-testid={`button-remove-statement-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setBankStatements([...bankStatements, { id: Date.now().toString(), bankName: '', accountType: '', currentBalance: 0, averageBalance: 0, monthsCovered: 0 }])}
                  data-testid="button-add-statement"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Bank Statement
                </Button>
              </TabsContent>

              <TabsContent value="funding" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Funding Sources</h3>
                {fundingSources.map((source, index) => (
                  <Card key={source.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Funding Source</Label>
                        <Input
                          value={source.source}
                          onChange={(e) => {
                            const updated = [...fundingSources];
                            updated[index].source = e.target.value;
                            setFundingSources(updated);
                          }}
                          placeholder="e.g., Angel Investment, Personal Savings"
                          data-testid={`input-funding-source-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Amount (£)</Label>
                        <Input
                          type="number"
                          value={source.amount || ''}
                          onChange={(e) => {
                            const updated = [...fundingSources];
                            updated[index].amount = parseInt(e.target.value) || 0;
                            setFundingSources(updated);
                          }}
                          placeholder="0"
                          data-testid={`input-funding-amount-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Input
                          value={source.status}
                          onChange={(e) => {
                            const updated = [...fundingSources];
                            updated[index].status = e.target.value;
                            setFundingSources(updated);
                          }}
                          placeholder="e.g., Received, Committed, Pending"
                          data-testid={`input-funding-status-${index}`}
                        />
                      </div>
                      <div>
                        <Label>Documentation</Label>
                        <Input
                          value={source.documentation}
                          onChange={(e) => {
                            const updated = [...fundingSources];
                            updated[index].documentation = e.target.value;
                            setFundingSources(updated);
                          }}
                          placeholder="e.g., Investment agreement, Bank transfer"
                          data-testid={`input-funding-doc-${index}`}
                        />
                      </div>
                    </div>
                    {fundingSources.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setFundingSources(fundingSources.filter((_, i) => i !== index))}
                        data-testid={`button-remove-funding-${index}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Remove
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setFundingSources([...fundingSources, { id: Date.now().toString(), source: '', amount: 0, status: '', documentation: '' }])}
                  data-testid="button-add-funding"
                >
                  <Plus className="h-4 w-4 mr-2" />Add Funding Source
                </Button>
              </TabsContent>

              <TabsContent value="checklist" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Financial Evidence Checklist</h3>
                <div className="space-y-4">
                  {checklistItems.map((item) => (
                    <Card key={item.key} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={item.key}
                          checked={checklist[item.key as keyof typeof checklist]}
                          onCheckedChange={(checked) => {
                            setChecklist({...checklist, [item.key]: checked === true});
                          }}
                          data-testid={`checkbox-${item.key}`}
                        />
                        <div className="flex-1">
                          <Label htmlFor={item.key} className="font-medium cursor-pointer">
                            {item.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
