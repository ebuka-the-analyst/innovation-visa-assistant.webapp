import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, PoundSterling } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type UKRegion = 'london' | 'southeast' | 'southwest' | 'midlands' | 'north' | 'scotland' | 'wales' | 'ni';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'salary-threshold',
  toolName: 'Salary Threshold Calculator',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your financial analyst. Let me help you understand your salary requirements for the UK Innovator Founder Visa. I'll guide you through the key financial factors that affect your visa compliance.",
  questions: [
    { id: 'salary', question: "What is your planned annual gross salary from your UK business?", hint: "This should be at least £25,600 to meet minimum visa requirements", fieldKey: 'annualSalary', fieldType: 'number' },
    { id: 'region', question: "Which UK region are you planning to live in?", hint: "London has the highest cost of living, while Northern regions are more affordable", fieldKey: 'region', fieldType: 'select', options: ['london', 'southeast', 'southwest', 'midlands', 'north', 'scotland', 'wales', 'ni'] },
    { id: 'dependents', question: "How many dependents will be relocating with you to the UK?", hint: "Each dependent adds approximately £600/month to your living costs", fieldKey: 'dependents', fieldType: 'number' },
    { id: 'additional', question: "Do you have any additional income sources beyond your salary?", hint: "Include dividends, investments, rental income, etc.", fieldKey: 'additionalIncome', fieldType: 'number' },
    { id: 'savings', question: "What are your current savings that could support the transition period?", hint: "Having 6-12 months of expenses saved is recommended", fieldKey: 'savings', fieldType: 'text' },
    { id: 'timeline', question: "When do you plan to start drawing your salary from the UK business?", hint: "Consider your runway and business cash flow projections", fieldKey: 'timeline', fieldType: 'text' },
  ],
  completionMessage: "Excellent! I've gathered all the financial details needed. Let me now show you your salary compliance analysis and recommendations."
};

const REGION_COST_OF_LIVING: Record<UKRegion, { name: string; monthlyCost: number; rentIndex: number }> = {
  london: { name: 'London', monthlyCost: 2800, rentIndex: 1.0 },
  southeast: { name: 'South East England', monthlyCost: 2200, rentIndex: 0.75 },
  southwest: { name: 'South West England', monthlyCost: 2000, rentIndex: 0.65 },
  midlands: { name: 'Midlands', monthlyCost: 1800, rentIndex: 0.60 },
  north: { name: 'North England', monthlyCost: 1700, rentIndex: 0.55 },
  scotland: { name: 'Scotland', monthlyCost: 1900, rentIndex: 0.60 },
  wales: { name: 'Wales', monthlyCost: 1750, rentIndex: 0.58 },
  ni: { name: 'Northern Ireland', monthlyCost: 1650, rentIndex: 0.52 }
};

const calculateIncomeTax = (annualIncome: number): number => {
  const personalAllowance = 12570;
  const basicRateLimit = 50270;
  const higherRateLimit = 125140;
  
  if (annualIncome <= personalAllowance) return 0;
  
  let tax = 0;
  const taxableIncome = annualIncome - personalAllowance;
  
  if (annualIncome <= basicRateLimit) {
    tax = taxableIncome * 0.20;
  } else if (annualIncome <= higherRateLimit) {
    tax = (basicRateLimit - personalAllowance) * 0.20;
    tax += (annualIncome - basicRateLimit) * 0.40;
  } else {
    tax = (basicRateLimit - personalAllowance) * 0.20;
    tax += (higherRateLimit - basicRateLimit) * 0.40;
    tax += (annualIncome - higherRateLimit) * 0.45;
  }
  
  return Math.round(tax);
};

const calculateNationalInsurance = (annualIncome: number): number => {
  const lowerLimit = 12570;
  const upperLimit = 50270;
  
  if (annualIncome <= lowerLimit) return 0;
  
  let ni = 0;
  
  if (annualIncome <= upperLimit) {
    ni = (annualIncome - lowerLimit) * 0.06;
  } else {
    ni = (upperLimit - lowerLimit) * 0.06;
    ni += (annualIncome - upperLimit) * 0.02;
  }
  
  const class2Annual = 3.45 * 52;
  if (annualIncome > 6725) {
    ni += class2Annual;
  }
  
  return Math.round(ni);
};

export default function SalaryThreshold() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('salary-threshold-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [annualSalary, setAnnualSalary] = useState(45000);
  const [region, setRegion] = useState<UKRegion>('london');
  const [dependents, setDependents] = useState(0);
  const [additionalIncome, setAdditionalIncome] = useState(0);
  const [activeTab, setActiveTab] = useState('calculator');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('salary-threshold-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('salary-threshold-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.annualSalary) setAnnualSalary(parseFloat(answers.annualSalary) || 45000);
    if (answers.region) setRegion(answers.region as UKRegion);
    if (answers.dependents) setDependents(parseInt(answers.dependents) || 0);
    if (answers.additionalIncome) setAdditionalIncome(parseFloat(answers.additionalIncome) || 0);
    setMode('traditional');
  };

  const totalIncome = annualSalary + additionalIncome;
  const incomeTax = calculateIncomeTax(totalIncome);
  const nationalInsurance = calculateNationalInsurance(totalIncome);
  const totalDeductions = incomeTax + nationalInsurance;
  const netAnnualIncome = totalIncome - totalDeductions;
  const netMonthlyIncome = Math.round(netAnnualIncome / 12);
  
  const regionData = REGION_COST_OF_LIVING[region];
  const monthlyCostOfLiving = regionData.monthlyCost + (dependents * 600);
  const annualCostOfLiving = monthlyCostOfLiving * 12;
  const monthlyDisposable = netMonthlyIncome - monthlyCostOfLiving;
  const annualDisposable = monthlyDisposable * 12;
  
  const MINIMUM_SALARY = 25600;
  const RECOMMENDED_SALARY = 35000;
  const meetsMinimum = annualSalary >= MINIMUM_SALARY;
  const meetsRecommended = annualSalary >= RECOMMENDED_SALARY;
  const hasPositiveDisposable = monthlyDisposable > 0;
  
  const complianceScore = Math.min(100, Math.round((annualSalary / RECOMMENDED_SALARY) * 100));
  const sustainabilityScore = hasPositiveDisposable ? 
    Math.min(100, Math.round((monthlyDisposable / monthlyCostOfLiving) * 100)) : 0;

  const salaryBreakdown = [
    { category: 'Net Take-Home', amount: netAnnualIncome, color: '#10b981' },
    { category: 'Income Tax', amount: incomeTax, color: '#ef4444' },
    { category: 'National Insurance', amount: nationalInsurance, color: '#f59e0b' },
  ];

  const deductionsPie = [
    { name: 'Income Tax', value: incomeTax, color: '#ef4444' },
    { name: 'National Insurance', value: nationalInsurance, color: '#f59e0b' },
  ];

  const monthlyBudget = [
    { category: 'Net Income', amount: netMonthlyIncome, color: '#10b981' },
    { category: 'Cost of Living', amount: monthlyCostOfLiving, color: '#3b82f6' },
    { category: 'Disposable', amount: Math.max(0, monthlyDisposable), color: '#8b5cf6' },
  ];

  const regionalComparison = Object.entries(REGION_COST_OF_LIVING).map(([key, data]) => ({
    region: data.name,
    monthlyCost: data.monthlyCost + (dependents * 600),
    disposable: netMonthlyIncome - (data.monthlyCost + (dependents * 600)),
  }));

  const getSerializedState = () => {
    return {
      annualSalary,
      region,
      dependents,
      additionalIncome,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('annualSalary' in state) setAnnualSalary(state.annualSalary);
    if ('region' in state) setRegion(state.region);
    if ('dependents' in state) setDependents(state.dependents);
    if ('additionalIncome' in state) setAdditionalIncome(state.additionalIncome);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('salary-threshold-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('salary-threshold-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('salary-threshold-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (!meetsMinimum) {
      tips.push("Your salary is below the £25,600 minimum threshold required for UK visa maintenance requirements. Increase your planned salary to meet compliance standards.");
    }
    
    if (meetsMinimum && !meetsRecommended) {
      tips.push("While you meet the minimum threshold, increasing to £35,000+ demonstrates stronger financial stability to endorsing bodies and Home Office assessors.");
    }
    
    if (!hasPositiveDisposable) {
      tips.push(`Critical: Your cost of living in ${regionData.name} exceeds your net income by £${Math.abs(monthlyDisposable).toLocaleString()}/month. Consider relocating to a lower-cost region or increasing salary.`);
    }
    
    if (hasPositiveDisposable && monthlyDisposable < 500) {
      tips.push("Your monthly disposable income is very tight. Aim for £500+ monthly surplus to demonstrate financial sustainability to visa assessors.");
    }
    
    if (region === 'london' && annualSalary < 40000) {
      tips.push("London's high cost of living requires approximately £40,000+ salary for comfortable sustainability. Consider other UK regions for better financial viability.");
    }
    
    if (dependents > 0) {
      tips.push(`With ${dependents} dependent(s), ensure you have documented evidence of how you'll support them financially. Budget an additional £600/month per dependent minimum.`);
    }
    
    if (totalDeductions / totalIncome > 0.35) {
      tips.push("Your tax burden exceeds 35% of gross income. Consult a UK tax advisor about legitimate tax efficiency strategies for company directors.");
    }
    
    if (meetsRecommended && hasPositiveDisposable && monthlyDisposable > 1000) {
      tips.push("Excellent financial position! Your salary and disposable income demonstrate strong financial sustainability. Document this clearly in your visa application.");
    }
    
    if (additionalIncome > annualSalary * 0.5) {
      tips.push("Significant additional income sources must be well-documented with contracts, invoices, or investment statements for visa evidence.");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Review GOV.UK salary requirements for Innovator Founder visa and validate your planned director's salary meets minimum thresholds", 
        priority: "Critical" 
      },
      { 
        week: "Week 1", 
        action: "Consult UK accountant to structure salary optimally for tax efficiency while meeting visa requirements", 
        priority: "High" 
      },
      { 
        week: "Week 1-2", 
        action: "Register company with Companies House and HMRC PAYE scheme if not already done", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Set up UK business bank account and establish payroll system for salary payments", 
        priority: "Critical" 
      },
      { 
        week: "Week 2-3", 
        action: "Prepare 12-month cash flow forecast showing how business will sustain your salary from available funding", 
        priority: "High" 
      },
      { 
        week: "Week 3", 
        action: "Research cost of living in your chosen UK region and prepare budget demonstrating financial sustainability", 
        priority: "High" 
      },
      { 
        week: "Week 3-4", 
        action: "Gather evidence of accommodation arrangements and living cost provisions for visa application", 
        priority: "Medium" 
      },
      { 
        week: "Week 4", 
        action: "Have accountant prepare letter confirming salary structure compliance with UK employment and tax law", 
        priority: "High" 
      },
      { 
        week: "Ongoing", 
        action: "Maintain detailed payroll records and tax payments as evidence of salary compliance post-approval", 
        priority: "Critical" 
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - SALARY THRESHOLD CALCULATOR
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

SALARY SUMMARY
${'-'.repeat(80)}
Annual Gross Salary: £${annualSalary.toLocaleString()}
Additional Income: £${additionalIncome.toLocaleString()}
Total Gross Income: £${totalIncome.toLocaleString()}

Minimum Threshold: £${MINIMUM_SALARY.toLocaleString()}
Recommended Threshold: £${RECOMMENDED_SALARY.toLocaleString()}
Status: ${meetsMinimum ? 'MEETS MINIMUM ✓' : 'BELOW MINIMUM ✗'}
Recommended Status: ${meetsRecommended ? 'MEETS RECOMMENDED ✓' : 'BELOW RECOMMENDED'}

DEDUCTIONS (2025 UK TAX RATES)
${'-'.repeat(80)}
Income Tax: £${incomeTax.toLocaleString()}
  - Personal Allowance: £12,570
  - Basic Rate (20%): £12,571 - £50,270
  - Higher Rate (40%): £50,271 - £125,140
  - Additional Rate (45%): Above £125,140

National Insurance: £${nationalInsurance.toLocaleString()}
  - Class 4: 6% on £12,570 - £50,270, then 2% above
  - Class 2: £3.45/week if profits exceed £6,725/year

Total Deductions: £${totalDeductions.toLocaleString()}
Effective Tax Rate: ${((totalDeductions / totalIncome) * 100).toFixed(1)}%

NET INCOME
${'-'.repeat(80)}
Annual Net Income: £${netAnnualIncome.toLocaleString()}
Monthly Net Income: £${netMonthlyIncome.toLocaleString()}

COST OF LIVING ANALYSIS
${'-'.repeat(80)}
Region: ${regionData.name}
Number of Dependents: ${dependents}
Monthly Cost of Living: £${monthlyCostOfLiving.toLocaleString()}
Annual Cost of Living: £${annualCostOfLiving.toLocaleString()}

Monthly Disposable Income: £${monthlyDisposable.toLocaleString()}
Annual Disposable Income: £${annualDisposable.toLocaleString()}

Financial Sustainability: ${hasPositiveDisposable ? 'VIABLE ✓' : 'AT RISK ✗'}
Compliance Score: ${complianceScore}%
Sustainability Score: ${sustainabilityScore}%

REGIONAL COST COMPARISON
${'-'.repeat(80)}
${regionalComparison.map(r => 
  `${r.region.padEnd(25)}: Monthly Cost £${r.monthlyCost.toLocaleString().padStart(6)} | Disposable £${r.disposable.toLocaleString().padStart(6)}`
).join('\n')}

BREAKDOWN BY PERCENTAGE
${'-'.repeat(80)}
Income Tax: ${((incomeTax / totalIncome) * 100).toFixed(1)}% of gross income
National Insurance: ${((nationalInsurance / totalIncome) * 100).toFixed(1)}% of gross income
Net Take-Home: ${((netAnnualIncome / totalIncome) * 100).toFixed(1)}% of gross income
Cost of Living: ${((annualCostOfLiving / netAnnualIncome) * 100).toFixed(1)}% of net income
Disposable: ${((annualDisposable / netAnnualIncome) * 100).toFixed(1)}% of net income

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

COMPLIANCE NOTES FOR INNOVATOR FOUNDER VISA
${'-'.repeat(80)}
- Founders must draw a salary that meets UK minimum wage requirements
- Salary must be sustainable from available business funding (as assessed by endorsing body)
- Director's salary must be registered with HMRC PAYE system
- Maintain evidence of regular salary payments via UK business bank account
- Cost of living must be covered by net income to demonstrate financial viability
- Endorsing bodies assess financial sustainability as part of endorsement criteria
- Home Office may request evidence of salary compliance during visa processing
- Salary structure should be tax-efficient but compliant with UK employment law
- Consider National Living Wage rates: £11.44/hour for age 21+ (2025)
- Document all income sources clearly with contracts and payment evidence

TAX CALCULATION METHODOLOGY
${'-'.repeat(80)}
Based on GOV.UK 2025/26 tax year rates:
- Personal Allowance: £12,570 (tax-free)
- Income Tax Basic Rate: 20% on £12,571 to £50,270
- Income Tax Higher Rate: 40% on £50,271 to £125,140
- Income Tax Additional Rate: 45% above £125,140
- NI Class 4: 6% on profits £12,570 to £50,270
- NI Class 4: 2% on profits above £50,270
- NI Class 2: £3.45 per week (£179.40/year) if profits exceed £6,725

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This calculator provides estimates based on 2025 UK tax rates. Actual tax
liability may vary based on individual circumstances, tax reliefs, and allowances.
Consult a qualified UK accountant or tax advisor for personalized advice.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-threshold-report-${Date.now()}.txt`;
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
            <h1 className="text-xl font-bold mb-2" data-testid="heading-salary-threshold">Salary Threshold Calculator</h1>
            <p className="text-lg text-muted-foreground">UK Innovator Founder visa salary compliance and cost of living analysis</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="salary-threshold"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Salary Threshold Calculator"
          />

          <div className="flex justify-end mt-4 mb-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-salary-threshold">
              <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Compliance Status</CardTitle>
                  <CardDescription>Validate salary meets UK visa requirements and financial sustainability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={meetsMinimum ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Annual Salary</p>
                          <p className="text-xl font-bold" data-testid="text-annual-salary">£{annualSalary.toLocaleString()}</p>
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

                    <Card className={hasPositiveDisposable ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Monthly Disposable</p>
                          <p className={`text-xl font-bold ${hasPositiveDisposable ? 'text-green-600' : 'text-destructive'}`} data-testid="text-monthly-disposable">
                            £{monthlyDisposable.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {hasPositiveDisposable ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="text-sm">{hasPositiveDisposable ? 'Sustainable' : 'At Risk'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Compliance Score</p>
                          <p className="text-xl font-bold text-primary" data-testid="text-compliance-score">{complianceScore}%</p>
                          <Progress value={complianceScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your salary of £{annualSalary.toLocaleString()} is £{(MINIMUM_SALARY - annualSalary).toLocaleString()} below the £{MINIMUM_SALARY.toLocaleString()} minimum threshold. Increase your planned salary to meet visa requirements.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !hasPositiveDisposable && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Critical: Your monthly expenses (£{monthlyCostOfLiving.toLocaleString()}) exceed your net income (£{netMonthlyIncome.toLocaleString()}) in {regionData.name}. Consider increasing salary or relocating to a lower-cost region.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && hasPositiveDisposable && !meetsRecommended && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum but £{RECOMMENDED_SALARY.toLocaleString()}+ is recommended for stronger financial demonstration to endorsing bodies.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsRecommended && hasPositiveDisposable && monthlyDisposable >= 500 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent financial position! Your salary and disposable income demonstrate strong sustainability for visa requirements.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Income Details</h3>
                      
                      <div>
                        <Label htmlFor="annual-salary">Annual Gross Salary (£)</Label>
                        <Input
                          id="annual-salary"
                          type="number"
                          value={annualSalary}
                          onChange={(e) => setAnnualSalary(parseFloat(e.target.value) || 0)}
                          placeholder="45000"
                          data-testid="input-annual-salary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your planned director's salary from the business</p>
                      </div>

                      <div>
                        <Label htmlFor="additional-income">Additional Annual Income (£)</Label>
                        <Input
                          id="additional-income"
                          type="number"
                          value={additionalIncome}
                          onChange={(e) => setAdditionalIncome(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          data-testid="input-additional-income"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Dividends, investments, or other income sources</p>
                      </div>

                      <div>
                        <Label htmlFor="region">UK Region</Label>
                        <select
                          id="region"
                          value={region}
                          onChange={(e) => setRegion(e.target.value as UKRegion)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          data-testid="select-region"
                        >
                          <option value="london">London</option>
                          <option value="southeast">South East England</option>
                          <option value="southwest">South West England</option>
                          <option value="midlands">Midlands</option>
                          <option value="north">North England</option>
                          <option value="scotland">Scotland</option>
                          <option value="wales">Wales</option>
                          <option value="ni">Northern Ireland</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Where you plan to live in the UK</p>
                      </div>

                      <div>
                        <Label htmlFor="dependents">Number of Dependents</Label>
                        <Input
                          id="dependents"
                          type="number"
                          min="0"
                          value={dependents}
                          onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          data-testid="input-dependents"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Spouse and children (adds £600/month each)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Tax Breakdown (2025 Rates)</h3>
                      
                      <Card className="bg-accent/5">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Gross Income</span>
                            <span className="font-semibold" data-testid="text-gross-income">£{totalIncome.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-destructive">
                            <span className="text-sm">Income Tax</span>
                            <span className="font-semibold" data-testid="text-income-tax">-£{incomeTax.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                            <span className="text-sm">National Insurance</span>
                            <span className="font-semibold" data-testid="text-national-insurance">-£{nationalInsurance.toLocaleString()}</span>
                          </div>
                          
                          <div className="pt-3 border-t flex justify-between items-center">
                            <span className="font-semibold">Annual Net Income</span>
                            <span className="font-bold text-green-600 dark:text-green-400" data-testid="text-net-annual">£{netAnnualIncome.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Monthly Net Income</span>
                            <span className="font-bold text-green-600 dark:text-green-400" data-testid="text-net-monthly">£{netMonthlyIncome.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <h3 className="text-lg font-semibold pt-2">Cost of Living</h3>
                      
                      <Card className="bg-accent/5">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Region: {regionData.name}</span>
                            <span className="font-semibold" data-testid="text-region-cost">£{regionData.monthlyCost.toLocaleString()}/mo</span>
                          </div>
                          
                          {dependents > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{dependents} Dependent(s)</span>
                              <span className="font-semibold">£{(dependents * 600).toLocaleString()}/mo</span>
                            </div>
                          )}
                          
                          <div className="pt-3 border-t flex justify-between items-center">
                            <span className="font-semibold">Monthly Cost of Living</span>
                            <span className="font-bold text-primary" data-testid="text-monthly-cost">£{monthlyCostOfLiving.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Monthly Disposable</span>
                            <span className={`font-bold ${hasPositiveDisposable ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`} data-testid="text-disposable">
                              £{monthlyDisposable.toLocaleString()}
                            </span>
                          </div>

                          <Progress value={sustainabilityScore} className="mt-2" />
                          <p className="text-xs text-center text-muted-foreground">Sustainability: {sustainabilityScore}%</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Breakdown</CardTitle>
                    <CardDescription>Annual income distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salaryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#3b82f6">
                          {salaryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Deductions</CardTitle>
                    <CardDescription>Breakdown of deductions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {totalDeductions > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={deductionsPie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {deductionsPie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Increase salary to see tax deductions</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Budget</CardTitle>
                    <CardDescription>Income vs expenses comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyBudget}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#3b82f6">
                          {monthlyBudget.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Cost Comparison</CardTitle>
                    <CardDescription>Disposable income across UK regions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={regionalComparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="region" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="disposable" fill="#8b5cf6">
                          {regionalComparison.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.disposable > 0 ? '#10b981' : '#ef4444'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Tax Rates (2025/26 Tax Year)</CardTitle>
                  <CardDescription>GOV.UK official rates for income tax and national insurance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Income Tax Bands</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <PoundSterling className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Personal Allowance: £0 - £12,570</p>
                            <p className="text-sm text-muted-foreground">0% tax on first £12,570</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <PoundSterling className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Basic Rate: £12,571 - £50,270</p>
                            <p className="text-sm text-muted-foreground">20% tax on income in this band</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <PoundSterling className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Higher Rate: £50,271 - £125,140</p>
                            <p className="text-sm text-muted-foreground">40% tax on income in this band</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <PoundSterling className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Additional Rate: Above £125,140</p>
                            <p className="text-sm text-muted-foreground">45% tax on income above £125,140</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">National Insurance (Self-Employed)</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Class 2: £3.45 per week</p>
                            <p className="text-sm text-muted-foreground">If annual profits exceed £6,725</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Class 4: 6% on £12,570 - £50,270</p>
                            <p className="text-sm text-muted-foreground">On profits in this band</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Class 4: 2% above £50,270</p>
                            <p className="text-sm text-muted-foreground">On profits above £50,270</p>
                          </div>
                        </div>
                      </div>

                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Rates shown are for self-employed company directors. PAYE employees have different NI bands. Consult HMRC or an accountant for your specific situation.
                        </AlertDescription>
                      </Alert>
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
                  <CardDescription>Context-aware guidance based on your salary profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().length > 0 ? (
                      getSmartTips().map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg" data-testid={`tip-${index}`}>
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm flex-1">{tip}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Adjust your salary details to see personalized recommendations</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visa Requirements Checklist</CardTitle>
                  <CardDescription>Innovator Founder salary compliance points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {meetsMinimum ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Meets Minimum Salary Threshold</p>
                        <p className="text-sm text-muted-foreground">£25,600 minimum annual salary for visa compliance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {hasPositiveDisposable ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">Financial Sustainability Demonstrated</p>
                        <p className="text-sm text-muted-foreground">Positive disposable income after cost of living expenses</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">HMRC PAYE Registration Required</p>
                        <p className="text-sm text-muted-foreground">Must register as employer and operate compliant payroll system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Bank Evidence Required</p>
                        <p className="text-sm text-muted-foreground">Regular salary payments through UK business bank account</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Cash Flow Sustainability</p>
                        <p className="text-sm text-muted-foreground">Must show how £50k investment will sustain salary for 12+ months</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">National Minimum Wage Compliance</p>
                        <p className="text-sm text-muted-foreground">£11.44/hour for 21+ (2025 rate). Ensure compliance if working full-time.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Step-by-step guidance for salary compliance preparation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="flex gap-4" data-testid={`action-${index}`}>
                        <div className="flex-shrink-0">
                          <div className={`
                            h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs
                            ${item.priority === 'Critical' ? 'bg-destructive text-destructive-foreground' : 
                              item.priority === 'High' ? 'bg-orange-500 text-white' : 
                              'bg-primary text-primary-foreground'}
                          `}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{item.week}</span>
                            <span className={`
                              text-xs px-2 py-0.5 rounded-full
                              ${item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' : 
                                item.priority === 'High' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 
                                'bg-primary/10 text-primary'}
                            `}>
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

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Checklist</CardTitle>
                  <CardDescription>Essential evidence for salary compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Before Visa Application</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Companies House incorporation certificate</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">HMRC PAYE registration confirmation</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Employment contract showing salary</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">12-month cash flow forecast</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">UK business bank account statements</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Accountant letter confirming compliance</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Post-Approval Maintenance</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Monthly payslips from payroll system</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Bank statements showing salary payments</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">HMRC tax and NI payment receipts</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Annual accounts and tax returns</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Updated cash flow statements</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">Evidence of continued business operation</p>
                        </div>
                      </div>
                    </div>
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
