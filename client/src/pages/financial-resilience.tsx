import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Wallet, AlertTriangle, CheckCircle2, FileText, Download,
  Lightbulb, TrendingUp, Building2, PoundSterling, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FundingSource {
  id: string;
  type: "personal" | "investors" | "grants" | "loans" | "revenue" | "other";
  description: string;
  amount: number;
  currency: string;
  secured: boolean;
  evidenceType: string;
}

interface Expense {
  id: string;
  category: string;
  monthlyAmount: number;
  essential: boolean;
}

export default function FinancialResilience() {
  const { toast } = useToast();
  
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", category: "Salary/Living expenses", monthlyAmount: 2500, essential: true },
    { id: "2", category: "Office/Workspace", monthlyAmount: 300, essential: false },
    { id: "3", category: "Cloud hosting/SaaS tools", monthlyAmount: 200, essential: true },
    { id: "4", category: "Marketing", monthlyAmount: 500, essential: false },
    { id: "5", category: "Legal/Accounting", monthlyAmount: 200, essential: false },
  ]);
  
  const [newFunding, setNewFunding] = useState<Partial<FundingSource>>({
    type: "personal",
    currency: "GBP",
    secured: false
  });

  const [runwayChecklist] = useState([
    { id: "1", label: "Have 12+ months runway documented", essential: true },
    { id: "2", label: "Bank statements showing consistent savings for 28+ days (min £1,270)", essential: true },
    { id: "3", label: "Can explain source of all funds", essential: true },
    { id: "4", label: "No unexplained large deposits in bank statements", essential: true },
    { id: "5", label: "Evidence of investment readiness (pitch deck, term sheet interest)", essential: false },
    { id: "6", label: "Clear cost breakdown for first 12 months", essential: true },
    { id: "7", label: "Contingency plan if funding falls through", essential: false },
    { id: "8", label: "Proof of any claimed grants or investments", essential: true },
  ]);

  const [completedChecks, setCompletedChecks] = useState<string[]>([]);

  const calculateTotalFunding = () => {
    return fundingSources.filter(f => f.secured).reduce((acc, f) => acc + f.amount, 0);
  };

  const calculateMonthlyBurn = () => {
    return expenses.reduce((acc, e) => acc + e.monthlyAmount, 0);
  };

  const calculateRunwayMonths = () => {
    const monthlyBurn = calculateMonthlyBurn();
    if (monthlyBurn === 0) return 0;
    return Math.floor(calculateTotalFunding() / monthlyBurn);
  };

  const calculateResilienceScore = () => {
    let score = 0;
    
    const runway = calculateRunwayMonths();
    if (runway >= 18) score += 40;
    else if (runway >= 12) score += 30;
    else if (runway >= 6) score += 20;
    else if (runway >= 3) score += 10;

    const essentialChecks = runwayChecklist.filter(c => c.essential);
    const completedEssential = essentialChecks.filter(c => completedChecks.includes(c.id)).length;
    score += (completedEssential / essentialChecks.length) * 40;

    const securedFunding = fundingSources.filter(f => f.secured).length;
    const totalFunding = fundingSources.length;
    if (totalFunding > 0) {
      score += (securedFunding / totalFunding) * 20;
    }

    return Math.round(score);
  };

  const toggleCheck = (id: string) => {
    if (completedChecks.includes(id)) {
      setCompletedChecks(completedChecks.filter(c => c !== id));
    } else {
      setCompletedChecks([...completedChecks, id]);
    }
  };

  const addFundingSource = () => {
    if (!newFunding.description || !newFunding.amount) {
      toast({ title: "Missing Information", description: "Please fill in funding details", variant: "destructive" });
      return;
    }
    const funding: FundingSource = {
      id: Date.now().toString(),
      type: newFunding.type as any || "personal",
      description: newFunding.description!,
      amount: newFunding.amount!,
      currency: newFunding.currency || "GBP",
      secured: newFunding.secured || false,
      evidenceType: newFunding.evidenceType || ""
    };
    setFundingSources([...fundingSources, funding]);
    setNewFunding({ type: "personal", currency: "GBP", secured: false });
    toast({ title: "Added", description: "Funding source added" });
  };

  const updateExpense = (id: string, amount: number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, monthlyAmount: amount } : e));
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      resilienceScore: calculateResilienceScore(),
      summary: {
        totalSecuredFunding: calculateTotalFunding(),
        monthlyBurnRate: calculateMonthlyBurn(),
        runwayMonths: calculateRunwayMonths(),
        fundingSources: fundingSources.length,
        securedSources: fundingSources.filter(f => f.secured).length
      },
      fundingSources,
      monthlyExpenses: expenses,
      checklistCompleted: completedChecks.length,
      checklistTotal: runwayChecklist.length,
      endorserStatement: `Financial resilience is demonstrated through ${calculateRunwayMonths()} months of runway based on £${calculateTotalFunding().toLocaleString()} in secured funding against £${calculateMonthlyBurn().toLocaleString()} monthly burn rate. ${fundingSources.filter(f => f.secured).length} funding sources are secured with documented evidence.`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-resilience-report.json";
    a.click();
    
    toast({ title: "Exported", description: "Financial resilience report downloaded" });
  };

  const resilienceScore = calculateResilienceScore();
  const runwayMonths = calculateRunwayMonths();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">Financial Resilience Evidence</h1>
        <p className="text-muted-foreground">
          Document your runway, funding sources, and financial readiness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className={resilienceScore >= 70 ? "border-green-500" : resilienceScore >= 40 ? "border-yellow-500" : "border-red-500"} data-testid="card-resilience-score">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Resilience Score</span>
              <Badge variant={resilienceScore >= 70 ? "default" : resilienceScore >= 40 ? "secondary" : "destructive"} data-testid="badge-resilience-status">
                {resilienceScore >= 70 ? "Strong" : resilienceScore >= 40 ? "Moderate" : "Weak"}
              </Badge>
            </div>
            <div className="text-xl font-bold mb-2" data-testid="text-resilience-score">{resilienceScore}%</div>
            <Progress value={resilienceScore} className="h-2" data-testid="progress-resilience-score" />
          </CardContent>
        </Card>

        <Card className={runwayMonths >= 12 ? "border-green-500" : runwayMonths >= 6 ? "border-yellow-500" : "border-red-500"} data-testid="card-runway">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Runway</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-runway-months">{runwayMonths} months</div>
            <p className="text-xs text-muted-foreground" data-testid="text-runway-status">
              {runwayMonths >= 12 ? "Excellent" : runwayMonths >= 6 ? "Acceptable" : "Too short"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-funding">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Funding</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-total-funding">£{calculateTotalFunding().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">secured</p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-burn">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Monthly Burn</span>
            </div>
            <div className="text-lg font-bold" data-testid="text-monthly-burn">£{calculateMonthlyBurn().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Financial Viability Requirements</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Endorsers must be confident you can sustain your business without external employment. 
                You don't need millions, but you need a <strong>credible runway plan</strong>. 
                The minimum requirement is £1,270 savings for 28 consecutive days, but endorsers prefer 12+ months runway.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Funding Sources
          </CardTitle>
          <CardDescription>
            Document all sources of funding with evidence types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Funding Type</Label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={newFunding.type || "personal"}
                onChange={(e) => setNewFunding({...newFunding, type: e.target.value as any})}
                data-testid="select-funding-type"
              >
                <option value="personal">Personal Savings</option>
                <option value="investors">Angel/VC Investment</option>
                <option value="grants">Government Grants</option>
                <option value="loans">Business Loans</option>
                <option value="revenue">Business Revenue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Amount (GBP) *</Label>
              <Input 
                type="number"
                value={newFunding.amount || ""} 
                onChange={(e) => setNewFunding({...newFunding, amount: parseFloat(e.target.value)})}
                placeholder="50000"
                data-testid="input-funding-amount"
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Input 
                value={newFunding.description || ""} 
                onChange={(e) => setNewFunding({...newFunding, description: e.target.value})}
                placeholder="Personal savings from previous employment"
                data-testid="input-funding-description"
              />
            </div>
            <div>
              <Label>Evidence Type</Label>
              <Input 
                value={newFunding.evidenceType || ""} 
                onChange={(e) => setNewFunding({...newFunding, evidenceType: e.target.value})}
                placeholder="Bank statement, Term sheet, Grant letter"
                data-testid="input-funding-evidence"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="secured"
                checked={newFunding.secured}
                onCheckedChange={(checked) => setNewFunding({...newFunding, secured: !!checked})}
                data-testid="checkbox-funding-secured"
              />
              <label htmlFor="secured" className="text-sm cursor-pointer">
                Funding is secured/confirmed
              </label>
            </div>
          </div>

          <Button onClick={addFundingSource} className="w-full" data-testid="button-add-funding">
            Add Funding Source
          </Button>

          {fundingSources.length > 0 && (
            <div className="space-y-2">
              {fundingSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`card-funding-${source.id}`}>
                  <div className="flex items-center gap-3">
                    {source.secured ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" data-testid={`icon-funding-secured-${source.id}`} />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <div>
                      <span className="font-medium" data-testid={`text-funding-amount-${source.id}`}>£{source.amount.toLocaleString()}</span>
                      <Badge variant="outline" className="ml-2" data-testid={`badge-funding-type-${source.id}`}>{source.type}</Badge>
                      <p className="text-sm text-muted-foreground" data-testid={`text-funding-description-${source.id}`}>{source.description}</p>
                      {source.evidenceType && (
                        <p className="text-xs text-muted-foreground" data-testid={`text-funding-evidence-${source.id}`}>Evidence: {source.evidenceType}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFundingSources(fundingSources.filter(f => f.id !== source.id))}
                    data-testid={`button-remove-funding-${source.id}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Expenses (Burn Rate)
          </CardTitle>
          <CardDescription>
            Adjust your expected monthly costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg" data-testid={`card-expense-${expense.id}`}>
                <div className="flex-1">
                  <span className="font-medium" data-testid={`text-expense-category-${expense.id}`}>{expense.category}</span>
                  {expense.essential && <Badge variant="outline" className="ml-2 text-xs" data-testid={`badge-expense-essential-${expense.id}`}>Essential</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">£</span>
                  <Input 
                    type="number"
                    value={expense.monthlyAmount}
                    onChange={(e) => updateExpense(expense.id, parseFloat(e.target.value) || 0)}
                    className="w-24"
                    data-testid={`input-expense-amount-${expense.id}`}
                  />
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg font-semibold" data-testid="card-total-burn">
              <span>Total Monthly Burn</span>
              <span data-testid="text-total-burn">£{calculateMonthlyBurn().toLocaleString()}/month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Financial Evidence Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {runwayChecklist.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox 
                  id={item.id}
                  checked={completedChecks.includes(item.id)}
                  onCheckedChange={() => toggleCheck(item.id)}
                  data-testid={`checkbox-financial-${item.id}`}
                />
                <div className="flex-1">
                  <label htmlFor={item.id} className="text-sm cursor-pointer">
                    {item.label}
                  </label>
                  {item.essential && <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Bank Statement Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">What Endorsers Want to See</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Minimum £1,270 for 28 consecutive days (visa requirement)</li>
                <li>• Consistent balance showing financial stability</li>
                <li>• Clear source of funds (salary, investments, savings)</li>
                <li>• No suspicious large deposits without explanation</li>
                <li>• Ideally 6-12 months of statements</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Red Flags to Avoid</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Large unexplained deposits right before application</li>
                <li>• Money moving in and out quickly (suggests borrowed funds)</li>
                <li>• Inconsistent income patterns without explanation</li>
                <li>• Cryptocurrency or gambling transactions</li>
                <li>• Statements from multiple accounts without clear trail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Financial Evidence Report</h3>
              <p className="text-sm text-muted-foreground">
                Download runway and funding documentation
              </p>
            </div>
            <Button onClick={exportReport} data-testid="button-export-financial">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
