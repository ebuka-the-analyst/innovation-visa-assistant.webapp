import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, Info, Calculator } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'income-calculator',
  toolName: 'UK Income & Tax Calculator',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Advisor. Understanding your UK income tax position is essential for demonstrating financial viability to visa endorsers. Let me help you calculate your income breakdown and tax obligations!",
  questions: [
    {
      id: 'salary',
      question: "What's your expected annual salary from your UK business? This should be at least £12,570 (personal allowance) for tax efficiency.",
      hint: "Many founders pay themselves a modest salary plus dividends for tax efficiency",
      fieldKey: 'salaryIncome'
    },
    {
      id: 'dividends',
      question: "Do you expect to receive dividends from your company? If so, what's the estimated annual amount in GBP?",
      hint: "Dividend allowance is £500 (2025/26). Tax rates: 8.75% basic, 33.75% higher",
      fieldKey: 'dividendIncome'
    },
    {
      id: 'other-income',
      question: "Do you have any other income sources? Include rental income, investments, consultancy, or income from outside the UK.",
      hint: "UK residents are taxed on worldwide income - declare all sources",
      fieldKey: 'otherIncome'
    },
    {
      id: 'expenses',
      question: "What business expenses do you expect to claim? Legitimate expenses reduce your taxable profit.",
      hint: "Common expenses: office rent, equipment, travel, professional fees, software",
      fieldKey: 'expenses'
    },
    {
      id: 'pension',
      question: "Will you contribute to a pension scheme? Pension contributions are tax-efficient and reduce your tax liability.",
      hint: "Annual allowance is £60,000 or 100% of earnings - great for tax planning",
      fieldKey: 'pensionContribution'
    },
    {
      id: 'visa-minimum',
      question: "Are you aware of the visa salary requirements? What's your strategy to meet the £25,600 minimum (or higher for some routes)?",
      hint: "Ensure your income consistently meets or exceeds visa thresholds",
      fieldKey: 'visaStrategy'
    }
  ],
  completionMessage: "Perfect! I've gathered your income details. This helps demonstrate financial stability to endorsers and ensures you meet visa requirements. I'm calculating your tax breakdown now."
};

type IncomeSource = {
  name: string;
  amount: number;
  frequency: 'annual' | 'monthly';
  type: 'salary' | 'dividends' | 'rental' | 'business' | 'investments' | 'other';
  taxable: boolean;
};

export default function IncomeCalculator() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('income-calculator-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [sources, setSources] = useState<IncomeSource[]>([
    { name: 'Employment Salary', amount: 0, frequency: 'annual', type: 'salary', taxable: true }
  ]);
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('income-calculator-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const addSource = () => {
    setSources([...sources, { name: '', amount: 0, frequency: 'annual', type: 'salary', taxable: true }]);
  };

  const updateSource = (index: number, field: keyof IncomeSource, value: any) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const annualizeAmount = (amount: number, frequency: 'annual' | 'monthly') => {
    return frequency === 'monthly' ? amount * 12 : amount;
  };

  const totalGrossIncome = sources.reduce((sum, s) => sum + annualizeAmount(s.amount || 0, s.frequency), 0);
  const totalTaxableIncome = sources.filter(s => s.taxable).reduce((sum, s) => sum + annualizeAmount(s.amount || 0, s.frequency), 0);
  const totalNonTaxableIncome = totalGrossIncome - totalTaxableIncome;

  const calculateIncomeTax = (taxableIncome: number) => {
    const personalAllowance = 12570;
    const basicRateLimit = 50270;
    const higherRateLimit = 125140;

    let tax = 0;
    let taxableAfterAllowance = Math.max(0, taxableIncome - personalAllowance);

    if (taxableAfterAllowance <= 0) return 0;

    const basicRateIncome = Math.min(taxableAfterAllowance, basicRateLimit - personalAllowance);
    tax += basicRateIncome * 0.20;

    if (taxableAfterAllowance > (basicRateLimit - personalAllowance)) {
      const higherRateIncome = Math.min(
        taxableAfterAllowance - (basicRateLimit - personalAllowance),
        higherRateLimit - basicRateLimit
      );
      tax += higherRateIncome * 0.40;
    }

    if (taxableAfterAllowance > (higherRateLimit - personalAllowance)) {
      const additionalRateIncome = taxableAfterAllowance - (higherRateLimit - personalAllowance);
      tax += additionalRateIncome * 0.45;
    }

    return tax;
  };

  const calculateNationalInsurance = (taxableIncome: number) => {
    const lowerLimit = 12570;
    const upperLimit = 50270;

    let ni = 0;

    if (taxableIncome > lowerLimit) {
      const class4Income = Math.min(taxableIncome - lowerLimit, upperLimit - lowerLimit);
      ni += class4Income * 0.06;
    }

    if (taxableIncome > upperLimit) {
      const higherIncome = taxableIncome - upperLimit;
      ni += higherIncome * 0.02;
    }

    return ni;
  };

  const incomeTax = calculateIncomeTax(totalTaxableIncome);
  const nationalInsurance = calculateNationalInsurance(totalTaxableIncome);
  const totalTax = incomeTax + nationalInsurance;
  const netIncome = totalGrossIncome - totalTax;
  const effectiveTaxRate = totalGrossIncome > 0 ? (totalTax / totalGrossIncome) * 100 : 0;

  const meetsVisaMinimum = totalGrossIncome >= 25600;
  const visaComplianceScore = Math.min(100, Math.round((totalGrossIncome / 41700) * 100));

  const incomeByType = [
    { name: 'Salary', value: sources.filter(s => s.type === 'salary').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#3b82f6' },
    { name: 'Dividends', value: sources.filter(s => s.type === 'dividends').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#10b981' },
    { name: 'Rental', value: sources.filter(s => s.type === 'rental').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#f59e0b' },
    { name: 'Business', value: sources.filter(s => s.type === 'business').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#8b5cf6' },
    { name: 'Investments', value: sources.filter(s => s.type === 'investments').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#ec4899' },
    { name: 'Other', value: sources.filter(s => s.type === 'other').reduce((sum, s) => sum + annualizeAmount(s.amount, s.frequency), 0), color: '#6b7280' },
  ].filter(item => item.value > 0);

  const grossVsNetData = [
    { category: 'Gross Income', amount: totalGrossIncome, color: '#3b82f6' },
    { category: 'Income Tax', amount: incomeTax, color: '#ef4444' },
    { category: 'National Insurance', amount: nationalInsurance, color: '#f59e0b' },
    { category: 'Net Income', amount: netIncome, color: '#10b981' },
  ];

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
    const saved = localStorage.getItem('income-calculator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('income-calculator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newSources: IncomeSource[] = [];
    if (answers.primaryIncome) {
      const amountMatch = answers.primaryIncome.match(/[\d,]+/);
      const amount = amountMatch ? parseInt(amountMatch[0].replace(/,/g, '')) : 0;
      newSources.push({
        name: 'Primary Business Income',
        amount,
        frequency: 'annual',
        type: 'business',
        taxable: true
      });
    }
    if (answers.otherIncome) {
      const amountMatch = answers.otherIncome.match(/[\d,]+/);
      const amount = amountMatch ? parseInt(amountMatch[0].replace(/,/g, '')) : 0;
      if (amount > 0) {
        newSources.push({
          name: 'Other Income',
          amount,
          frequency: 'annual',
          type: 'other',
          taxable: true
        });
      }
    }
    if (newSources.length > 0) {
      setSources(newSources);
    }
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('income-calculator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('income-calculator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (totalGrossIncome < 25600) {
      tips.push("Your income is below the £25,600 minimum salary threshold for UK visa applications - consider additional income sources or salary increases");
    }
    
    if (totalGrossIncome >= 25600 && totalGrossIncome < 41700) {
      tips.push("You meet the minimum visa salary requirement, but consider aiming for £41,700+ to demonstrate stronger financial stability");
    }
    
    if (effectiveTaxRate > 35) {
      tips.push("Your effective tax rate exceeds 35% - consult with a tax advisor to explore legal tax optimization strategies");
    }
    
    if (sources.filter(s => s.type === 'dividends').length > 0 && sources.filter(s => s.type === 'salary').length > 0) {
      tips.push("Salary and dividend mix can be tax-efficient for company directors - ensure proper documentation for visa applications");
    }
    
    if (sources.filter(s => s.type === 'rental').length > 0) {
      tips.push("Rental income strengthens your financial profile - maintain comprehensive property documentation and tax returns");
    }
    
    if (sources.length === 1) {
      tips.push("Diversifying income sources demonstrates financial resilience and strengthens your visa application profile");
    }
    
    if (totalNonTaxableIncome > totalTaxableIncome * 0.3) {
      tips.push("Significant non-taxable income may require detailed explanation in visa applications - prepare supporting documentation");
    }
    
    if (meetsVisaMinimum) {
      tips.push("Your income meets visa requirements - maintain consistent documentation including payslips, tax returns, and bank statements");
    }

    if (sources.some(s => s.type === 'business' && annualizeAmount(s.amount, s.frequency) > 30000)) {
      tips.push("Substantial business income requires comprehensive accounts and proof of trading history for visa purposes");
    }

    if (totalGrossIncome >= 100000) {
      tips.push("High earners face personal allowance tapering above £100k - consider pension contributions to optimize tax position");
    }

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Gather all income documentation: payslips, P60s, tax returns, and dividend vouchers for the past 12 months", priority: "Critical" },
      { week: "Week 1", action: "Obtain employer letter confirming salary, role, and employment dates on company letterhead", priority: "Critical" },
      { week: "Week 1-2", action: "Request bank statements showing salary deposits and other income sources for past 6 months", priority: "Critical" },
      { week: "Week 2", action: "Compile evidence of all non-salary income: rental agreements, business accounts, investment statements", priority: "High" },
      { week: "Week 2", action: "Prepare Self Assessment tax returns (SA302) and tax year overview if self-employed or have additional income", priority: "Critical" },
      { week: "Week 2-3", action: "Have accountant certify income calculations and prepare income verification letter", priority: "High" },
      { week: "Week 3", action: "Organize documents chronologically with clear labeling and index for easy reference", priority: "Medium" },
      { week: "Week 3", action: "For rental income: obtain property ownership documents and tenancy agreements", priority: "High" },
      { week: "Week 3-4", action: "For business income: prepare company accounts, corporation tax returns, and profit allocation evidence", priority: "High" },
      { week: "Week 4", action: "Create comprehensive income summary document explaining each source and calculation methodology", priority: "Medium" },
      { week: "Week 4", action: "Ensure all income meets or exceeds visa minimum salary requirements with buffer for safety", priority: "Critical" },
      { week: "Ongoing", action: "Maintain consistent income levels throughout application period to avoid discrepancies", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - INCOME & TAX CALCULATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

INCOME SUMMARY
${'-'.repeat(80)}
Total Gross Income: £${totalGrossIncome.toLocaleString()} per year
Total Taxable Income: £${totalTaxableIncome.toLocaleString()} per year
Total Non-Taxable Income: £${totalNonTaxableIncome.toLocaleString()} per year

TAX CALCULATIONS (2025/26 Tax Year)
${'-'.repeat(80)}
Income Tax: £${incomeTax.toLocaleString()}
National Insurance (Class 4): £${nationalInsurance.toLocaleString()}
Total Tax: £${totalTax.toLocaleString()}
Effective Tax Rate: ${effectiveTaxRate.toFixed(2)}%

NET INCOME
${'-'.repeat(80)}
Annual Net Income: £${netIncome.toLocaleString()}
Monthly Net Income: £${(netIncome / 12).toLocaleString()}

VISA COMPLIANCE
${'-'.repeat(80)}
Minimum Salary Requirement: £25,600
Recommended Salary Level: £41,700
Current Income: £${totalGrossIncome.toLocaleString()}
Status: ${meetsVisaMinimum ? 'MEETS MINIMUM REQUIREMENT' : 'BELOW MINIMUM REQUIREMENT'}
Compliance Score: ${visaComplianceScore}%
${!meetsVisaMinimum ? `\nShortfall: £${(25600 - totalGrossIncome).toLocaleString()}` : ''}

INCOME SOURCES BREAKDOWN
${'-'.repeat(80)}
${sources.map((source, i) => {
  const annualAmount = annualizeAmount(source.amount, source.frequency);
  return `${i + 1}. ${source.name || 'Unnamed Source'}
   Type: ${source.type.charAt(0).toUpperCase() + source.type.slice(1)}
   Amount: £${source.amount.toLocaleString()} (${source.frequency})
   Annual Equivalent: £${annualAmount.toLocaleString()}
   Taxable: ${source.taxable ? 'YES' : 'NO'}
`;
}).join('')}

INCOME BY TYPE
${'-'.repeat(80)}
${incomeByType.map(item => `${item.name}: £${item.value.toLocaleString()}`).join('\n')}

UK TAX BANDS (2025/26)
${'-'.repeat(80)}
Personal Allowance: £0 - £12,570 (0%)
Basic Rate: £12,571 - £50,270 (20%)
Higher Rate: £50,271 - £125,140 (40%)
Additional Rate: Over £125,140 (45%)

National Insurance Class 4 (Self-Employed):
6% on profits: £12,570 - £50,270
2% on profits: Over £50,270

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

VISA APPLICATION NOTES
${'-'.repeat(80)}
- All income must be evidenced with official documentation (payslips, tax returns, bank statements)
- Employer letters must be on company letterhead and signed by authorized personnel
- Self-employed income requires SA302 tax calculations and tax year overview
- Rental income requires property ownership proof and tenancy agreements
- Business income requires company accounts and corporation tax returns
- Dividend income requires dividend vouchers and shareholder documentation
- Maintain consistent income throughout the application period (typically 6 months)
- Income must meet or exceed minimum salary threshold at time of application
- Consider maintaining a buffer above minimum requirements for safety

IMPORTANT DISCLAIMER
${'-'.repeat(80)}
This calculator provides estimates based on 2025/26 UK tax rates and visa requirements.
Tax calculations are simplified and may not account for all personal circumstances.
Consult with a qualified tax advisor and immigration lawyer for personalized advice.
Visa requirements may change - always verify current GOV.UK guidance.

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income-calculator-report-${Date.now()}.txt`;
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold mb-2" data-testid="heading-income-calculator">Income Calculator</h1>
                <p className="text-lg text-muted-foreground">Calculate income, tax estimates, and net earnings for UK visa requirements</p>
                {savedDate && (
                  <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
                )}
              </div>
              <AiTraditionalToggle
                mode={mode}
                onModeChange={setMode}
                aiLabel="AI-Guided"
                traditionalLabel="Traditional Form"
                userTier={userTier}
              />
            </div>
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Why AI-Guided?</h3>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Sterling, our Financial Expert, helps you calculate income for visa requirements.</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Understand your expected income sources</li>
                    <li>Calculate UK tax obligations</li>
                    <li>Ensure you meet visa salary thresholds</li>
                    <li>Earn XP as you complete each question</li>
                  </ul>
                  <p className="pt-2">Your answers will automatically populate the calculator when complete.</p>
                </div>
              </Card>
            </div>
          ) : (
            <>
          <ToolUtilityBar
            toolId="income-calculator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Income Calculator"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-income-calculator">
              <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income & Tax Overview</CardTitle>
                  <CardDescription>UK tax calculations based on 2025/26 rates and visa salary requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={meetsVisaMinimum ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Gross Income</p>
                          <p className="text-lg font-bold" data-testid="text-gross-income">£{totalGrossIncome.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">per year</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {meetsVisaMinimum ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="text-xs">{meetsVisaMinimum ? 'Visa Eligible' : 'Below Minimum'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Tax</p>
                          <p className="text-lg font-bold text-destructive" data-testid="text-total-tax">£{totalTax.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Income Tax + NI</p>
                          <p className="text-xs text-muted-foreground mt-2">{effectiveTaxRate.toFixed(1)}% effective rate</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Net Income</p>
                          <p className="text-lg font-bold text-green-600" data-testid="text-net-income">£{netIncome.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">per year</p>
                          <p className="text-xs text-muted-foreground mt-2">£{(netIncome / 12).toLocaleString()}/month</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Visa Compliance</p>
                          <p className="text-lg font-bold text-primary" data-testid="text-visa-score">{visaComplianceScore}%</p>
                          <Progress value={visaComplianceScore} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">Min: £25,600</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsVisaMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your income is £{(25600 - totalGrossIncome).toLocaleString()} below the £25,600 minimum salary requirement for UK visa applications. Consider additional income sources.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsVisaMinimum && totalGrossIncome < 41700 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum requirement. Consider aiming for £41,700+ to demonstrate stronger financial stability for visa applications.
                      </AlertDescription>
                    </Alert>
                  )}

                  {totalGrossIncome >= 41700 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent income position for visa applications. Ensure comprehensive documentation of all income sources.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Income Sources</h3>
                      <Button onClick={addSource} size="sm" data-testid="button-add-income">
                        Add Income Source
                      </Button>
                    </div>

                    {sources.map((source, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label htmlFor={`income-name-${index}`}>Source Name</Label>
                            <Input
                              id={`income-name-${index}`}
                              value={source.name}
                              onChange={(e) => updateSource(index, 'name', e.target.value)}
                              placeholder="e.g., Software Engineer Salary"
                              data-testid={`input-income-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`income-amount-${index}`}>Amount (£)</Label>
                            <Input
                              id={`income-amount-${index}`}
                              type="number"
                              value={source.amount || ''}
                              onChange={(e) => updateSource(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              data-testid={`input-income-amount-${index}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`income-frequency-${index}`}>Frequency</Label>
                            <select
                              id={`income-frequency-${index}`}
                              value={source.frequency}
                              onChange={(e) => updateSource(index, 'frequency', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-income-frequency-${index}`}
                            >
                              <option value="annual">Annual</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`income-type-${index}`}>Type</Label>
                            <select
                              id={`income-type-${index}`}
                              value={source.type}
                              onChange={(e) => updateSource(index, 'type', e.target.value)}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              data-testid={`select-income-type-${index}`}
                            >
                              <option value="salary">Salary</option>
                              <option value="dividends">Dividends</option>
                              <option value="rental">Rental</option>
                              <option value="business">Business</option>
                              <option value="investments">Investments</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={source.taxable}
                                onChange={(e) => updateSource(index, 'taxable', e.target.checked)}
                                className="h-4 w-4"
                                data-testid={`checkbox-taxable-${index}`}
                              />
                              <span className="text-sm">Taxable</span>
                            </label>
                            {sources.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSource(index)}
                                data-testid={`button-remove-income-${index}`}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Annual equivalent: £{annualizeAmount(source.amount, source.frequency).toLocaleString()}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Breakdown</CardTitle>
                  <CardDescription>Based on UK 2025/26 tax year rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                      <span className="font-medium">Personal Allowance</span>
                      <span className="text-muted-foreground">£12,570</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                      <span className="font-medium">Taxable Income</span>
                      <span data-testid="text-taxable-income">£{totalTaxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                      <span className="font-medium">Income Tax</span>
                      <span className="text-destructive" data-testid="text-income-tax">£{incomeTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-9500/10 rounded-lg">
                      <span className="font-medium">National Insurance</span>
                      <span className="text-orange-600 dark:text-orange-400" data-testid="text-national-insurance">£{nationalInsurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border-2 border-green-500">
                      <span className="font-bold">Net Annual Income</span>
                      <span className="font-bold text-green-600 dark:text-green-400" data-testid="text-net-annual">£{netIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="font-medium">Net Monthly Income</span>
                      <span className="text-green-600 dark:text-green-400" data-testid="text-net-monthly">£{(netIncome / 12).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Income by Source</CardTitle>
                    <CardDescription>Distribution of income types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {incomeByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={incomeByType}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {incomeByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add income sources to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gross vs Net Income</CardTitle>
                    <CardDescription>Income and tax breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={grossVsNetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#3b82f6">
                          {grossVsNetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Visa Salary Requirements</CardTitle>
                  <CardDescription>GOV.UK minimum income thresholds for visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Minimum Salary: £25,600</p>
                        <p className="text-sm text-muted-foreground">Entry-level threshold for most skilled worker visa applications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Recommended Level: £41,700</p>
                        <p className="text-sm text-muted-foreground">Demonstrates strong financial stability and reduces application risk</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Income Documentation Required</p>
                        <p className="text-sm text-muted-foreground">Payslips, P60s, employment letters, tax returns (SA302), and bank statements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Consistency is Critical</p>
                        <p className="text-sm text-muted-foreground">Maintain stable income throughout 6-month application period</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Multiple Income Sources</p>
                        <p className="text-sm text-muted-foreground">Can combine employment, business, dividends, and rental income with proper documentation</p>
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
                  <CardDescription>Context-aware guidance based on your income profile</CardDescription>
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
                  <CardDescription>Prioritized steps to prepare income documentation for visa applications</CardDescription>
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
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.priority === 'Critical' ? 'bg-destructive/20 text-destructive' :
                            item.priority === 'High' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                            'bg-accent/20 text-accent-foreground'
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
