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
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, FileText, Building2, Calendar } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type SavingsAccount = {
  accountName: string;
  bankName: string;
  balance: number;
  verified: boolean;
  monthsOfStatements: number;
  sourceDocumented: boolean;
  accountType: 'current' | 'savings' | 'investment' | 'business' | 'other';
};

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'savings-validator',
  toolName: 'Personal Savings Validator',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your compliance expert. I'll help you verify that your personal savings meet the UK Innovator Founder Visa requirements. Let's review your financial documentation together.",
  questions: [
    { id: 'total', question: "What is the total balance across all your savings accounts?", hint: "UK requires at least £1,270 held for 28 consecutive days", fieldKey: 'totalSavings', fieldType: 'number' },
    { id: 'accounts', question: "How many bank accounts do you have that hold these savings?", hint: "List all accounts that will be used to demonstrate financial capacity", fieldKey: 'accountCount', fieldType: 'number' },
    { id: 'statements', question: "Do you have 6 months of consecutive bank statements for each account?", hint: "GOV.UK requires unbroken statement history with no gaps", fieldKey: 'hasStatements', fieldType: 'text' },
    { id: 'verified', question: "Have you obtained official bank letters confirming your balances?", hint: "Letters must be on bank letterhead and dated within 1 month", fieldKey: 'hasVerification', fieldType: 'text' },
    { id: 'source', question: "Can you document the source of funds for deposits over £5,000?", hint: "Salary slips, sale agreements, inheritance letters, gift documentation", fieldKey: 'sourceDocumented', fieldType: 'text' },
    { id: 'accessibility', question: "Are all your savings immediately accessible without penalties?", hint: "Fixed deposits or locked investments may not qualify", fieldKey: 'accessibility', fieldType: 'text' },
  ],
  completionMessage: "I've gathered your savings information. Let me analyze your documentation compliance and identify any gaps."
};

export default function SavingsValidator() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    return (localStorage.getItem('savings-validator-mode') as 'ai' | 'traditional') || 'ai';
  });
  const [accounts, setAccounts] = useState<SavingsAccount[]>([
    { accountName: '', bankName: '', balance: 0, verified: false, monthsOfStatements: 0, sourceDocumented: false, accountType: 'savings' }
  ]);
  const [activeTab, setActiveTab] = useState('validator');
  const [savedDate, setSavedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('savings-validator-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.totalSavings && accounts.length > 0) {
      const balance = parseFloat(answers.totalSavings) || 0;
      setAccounts([{ ...accounts[0], balance }]);
    }
    setMode('traditional');
  };

  const addAccount = () => {
    setAccounts([...accounts, { accountName: '', bankName: '', balance: 0, verified: false, monthsOfStatements: 0, sourceDocumented: false, accountType: 'savings' }]);
  };

  const updateAccount = (index: number, field: keyof SavingsAccount, value: any) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    setAccounts(updated);
  };

  const removeAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const totalSavings = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const verifiedSavings = accounts.filter(acc => acc.verified).reduce((sum, acc) => sum + acc.balance, 0);
  const unverifiedSavings = totalSavings - verifiedSavings;
  const meetsMinimum = totalSavings >= 1270;
  const verifiedMeetsMinimum = verifiedSavings >= 1270;
  
  const accountsWithFullStatements = accounts.filter(acc => acc.monthsOfStatements >= 6).length;
  const accountsWithSourceDocs = accounts.filter(acc => acc.sourceDocumented).length;
  const totalAccounts = accounts.length;
  
  const documentationScore = Math.min(100, Math.round(
    ((Math.min(verifiedSavings, totalSavings) / Math.max(totalSavings, 1270)) * 40) +
    ((accountsWithFullStatements / totalAccounts) * 30) +
    ((accountsWithSourceDocs / totalAccounts) * 30)
  ));

  const savingsByType = [
    { name: 'Current Account', value: accounts.filter(a => a.accountType === 'current').reduce((sum, a) => sum + a.balance, 0), color: '#3b82f6' },
    { name: 'Savings Account', value: accounts.filter(a => a.accountType === 'savings').reduce((sum, a) => sum + a.balance, 0), color: '#10b981' },
    { name: 'Investment Account', value: accounts.filter(a => a.accountType === 'investment').reduce((sum, a) => sum + a.balance, 0), color: '#f59e0b' },
    { name: 'Business Account', value: accounts.filter(a => a.accountType === 'business').reduce((sum, a) => sum + a.balance, 0), color: '#8b5cf6' },
    { name: 'Other', value: accounts.filter(a => a.accountType === 'other').reduce((sum, a) => sum + a.balance, 0), color: '#6b7280' },
  ].filter(item => item.value > 0);

  const verificationData = [
    { status: 'Verified', amount: verifiedSavings, color: '#10b981' },
    { status: 'Unverified', amount: unverifiedSavings, color: '#ef4444' },
  ].filter(item => item.amount > 0);

  const statementCoverageData = accounts.map((acc, index) => ({
    name: acc.accountName || `Account ${index + 1}`,
    months: acc.monthsOfStatements,
    target: 6
  }));

  const getSerializedState = () => {
    return {
      accounts,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('accounts' in state) setAccounts(state.accounts);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const saved = localStorage.getItem('savings-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('savings-validator-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('savings-validator-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    if (!meetsMinimum) tips.push("You need at least £1,270 in personal savings held for 28 consecutive days to meet the UK Innovator Founder Visa maintenance requirement");
    if (!verifiedMeetsMinimum && meetsMinimum) tips.push("Ensure all savings accounts are verified with official bank letterhead confirming balances and accessibility");
    if (accounts.some(a => a.monthsOfStatements < 6)) tips.push("GOV.UK requires 6 months of consecutive bank statements for all accounts - gaps will raise red flags");
    if (accounts.some(a => !a.sourceDocumented && a.balance > 10000)) tips.push("Document the source of all large deposits (salary slips, sale of property, inheritance letters, etc.)");
    if (accounts.filter(a => a.verified).length < accounts.length) tips.push("Request official bank letters on letterhead confirming account ownership, balance, and accessibility");
    if (totalAccounts === 1 && totalSavings >= 5000) tips.push("Having savings spread across 2-3 accounts demonstrates financial stability and reduces single-point-of-failure risk");
    if (documentationScore >= 80) tips.push("Excellent documentation status - ensure all statements are recent (within 31 days of submission)");
    if (accounts.some(a => a.accountType === 'investment')) tips.push("Investment accounts must show liquid accessible funds - provide evidence of withdrawal capability without penalties");
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Contact all banks and request 6 months of official statements (PDF/paper with bank letterhead)", priority: "Critical" },
      { week: "Week 1", action: "Request official bank letters confirming current balance, account ownership, and fund accessibility", priority: "Critical" },
      { week: "Week 1-2", action: "Gather source of funds documentation: salary slips, tax returns, sale agreements, gift letters", priority: "Critical" },
      { week: "Week 2", action: "Organize statements chronologically by account - ensure no gaps in the 6-month period", priority: "High" },
      { week: "Week 2-3", action: "Highlight or annotate large deposits (over £5,000) with source evidence attached", priority: "High" },
      { week: "Week 3", action: "For foreign currency accounts, provide exchange rate evidence and conversion calculations", priority: "Medium" },
      { week: "Week 3", action: "Verify all statements show your name, address, and account details clearly visible", priority: "High" },
      { week: "Week 4", action: "Create summary spreadsheet listing all accounts, balances, and documentation status", priority: "Medium" },
      { week: "Week 4", action: "Have accountant certify the total savings figure and confirm fund accessibility", priority: "High" },
      { week: "Ongoing", action: "Monitor balances - do not drop below £1,270 from now until visa decision", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - PERSONAL SAVINGS VALIDATION REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

EXECUTIVE SUMMARY
${'-'.repeat(80)}
Total Personal Savings: £${totalSavings.toLocaleString()}
Verified Savings: £${verifiedSavings.toLocaleString()}
Unverified Savings: £${unverifiedSavings.toLocaleString()}
Minimum Requirement: £1,270 (personal maintenance)
Status: ${meetsMinimum ? 'MEETS MINIMUM' : 'BELOW MINIMUM'}
Verified Status: ${verifiedMeetsMinimum ? 'VERIFIED MEETS MINIMUM' : 'NEEDS MORE VERIFICATION'}
Documentation Compliance Score: ${documentationScore}%

Accounts with Full Statements (6+ months): ${accountsWithFullStatements} of ${totalAccounts}
Accounts with Source Documentation: ${accountsWithSourceDocs} of ${totalAccounts}

ACCOUNT BREAKDOWN
${'-'.repeat(80)}
${accounts.map((acc, i) => `
${i + 1}. ${acc.accountName || 'Unnamed Account'}
   Bank: ${acc.bankName || 'Not specified'}
   Account Type: ${acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1)}
   Current Balance: £${acc.balance.toLocaleString()}
   Verified: ${acc.verified ? 'YES' : 'NO'}
   Bank Statements: ${acc.monthsOfStatements} months ${acc.monthsOfStatements >= 6 ? '(COMPLIANT)' : '(INSUFFICIENT - need 6 months)'}
   Source Documented: ${acc.sourceDocumented ? 'YES' : 'NO'}
`).join('')}

SAVINGS BY ACCOUNT TYPE
${'-'.repeat(80)}
${savingsByType.map(item => `${item.name}: £${item.value.toLocaleString()}`).join('\n')}

GOV.UK COMPLIANCE CHECKLIST
${'-'.repeat(80)}
${meetsMinimum ? '[✓]' : '[ ]'} Minimum £1,270 personal maintenance savings
${verifiedMeetsMinimum ? '[✓]' : '[ ]'} Verified with official bank letters
${accountsWithFullStatements === totalAccounts ? '[✓]' : '[ ]'} 6 months consecutive statements for all accounts
${accountsWithSourceDocs === totalAccounts ? '[✓]' : '[ ]'} Source of funds documented for all accounts
${accounts.every(a => a.verified) ? '[✓]' : '[ ]'} All accounts verified with bank letterhead
${accounts.every(a => a.monthsOfStatements >= 6) ? '[✓]' : '[ ]'} No gaps in statement coverage

DOCUMENTATION REQUIREMENTS
${'-'.repeat(80)}
For Each Account, You Must Provide:

1. BANK STATEMENTS (6 months consecutive)
   - Official statements on bank letterhead
   - OR certified PDF downloads with bank logo/watermark
   - Must show: your name, account number, dates, transactions, balances
   - No gaps allowed - must be consecutive months
   - Statements must be recent (within 31 days of application)

2. BANK LETTER (current, dated within 1 month)
   - On official bank letterhead
   - Confirming: account holder name, account type, current balance
   - Stating funds are "freely accessible" without restrictions
   - Signed by bank official with contact details

3. SOURCE OF FUNDS EVIDENCE
   Required for all deposits over £5,000:
   - Salary: payslips + employment contract
   - Business income: tax returns + accounts
   - Sale of property: completion statement + land registry
   - Inheritance: probate letter + executor statement
   - Gift: donor's bank statement + signed gift letter
   - Investment returns: broker statements + sale confirmations
   - Loan: loan agreement + lender's bank statement

4. ACCESSIBILITY PROOF
   - Funds must be liquid (not tied up in fixed deposits ending after visa decision)
   - For investment accounts: evidence of withdrawal terms
   - For foreign accounts: confirmation of transferability to UK
   - For joint accounts: co-holder consent letter

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

RED FLAGS TO AVOID
${'-'.repeat(80)}
- Sudden large deposits in the month before application (looks suspicious)
- Borrowing money temporarily to meet £50k threshold (fraud)
- Statements with transactions redacted or pages missing
- Round-number transfers without explanation (e.g., exactly £10,000)
- Funds in accounts you don't personally control
- Currency from high-risk countries without credible source evidence
- Balance dropping below £50k between application and decision

CRITICAL NOTES
${'-'.repeat(80)}
- All documents must be in English or professionally translated
- Use consistent name format across all documents (match passport exactly)
- Keep original documents - may need to present at visa appointment
- Endorsing bodies conduct thorough financial due diligence
- False information = automatic refusal + 10-year ban
- Maintain accessibility throughout 3-6 month application period

NEXT STEPS
${'-'.repeat(80)}
1. Complete the checklist above for each account
2. Cross-reference with endorsing body's specific requirements
3. Have an immigration lawyer review your documentation package
4. Prepare a cover letter explaining your savings accumulation journey
5. Keep funds accessible and monitor balances weekly

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This report is for guidance only and does not constitute legal advice.
Consult with a qualified immigration lawyer before submitting your application.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savings-validator-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-savings-validator">Personal Savings Validator</h1>
            <p className="text-lg text-muted-foreground">Verify your personal savings meet the £1,270 maintenance requirement with proper documentation</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="savings-validator"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Savings Validator"
          />

          <div className="flex justify-end mt-4 mb-4">
            <AiTraditionalToggle mode={mode} onModeChange={setMode} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-savings-validator">
              <TabsTrigger value="validator" data-testid="tab-validator">Validator</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="validator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Savings Documentation Status</CardTitle>
                  <CardDescription>UK Innovator Founder Visa requires £1,270 in personal savings held for 28 consecutive days. Additional savings strengthen your application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={meetsMinimum ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Total Savings</p>
                          <p className="text-3xl font-bold" data-testid="text-total-savings">£{totalSavings.toLocaleString()}</p>
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
                          <p className="text-sm text-muted-foreground mb-2">Verified Savings</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-verified-savings">£{verifiedSavings.toLocaleString()}</p>
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
                          <p className="text-sm text-muted-foreground mb-2">Documentation Score</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-documentation-score">{documentationScore}%</p>
                          <Progress value={documentationScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {!meetsMinimum && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You are £{(1270 - totalSavings).toLocaleString()} short of the £1,270 minimum personal savings requirement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && !verifiedMeetsMinimum && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You meet the minimum but only £{verifiedSavings.toLocaleString()} is verified. Get official bank letters confirming balances and accessibility.
                      </AlertDescription>
                    </Alert>
                  )}

                  {meetsMinimum && accountsWithFullStatements < totalAccounts && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Only {accountsWithFullStatements} of {totalAccounts} accounts have 6 months of statements. GOV.UK requires complete coverage.
                      </AlertDescription>
                    </Alert>
                  )}

                  {verifiedMeetsMinimum && accountsWithFullStatements === totalAccounts && accountsWithSourceDocs === totalAccounts && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent! Your savings are verified with complete documentation. Ensure statements are recent (within 31 days).
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Savings Accounts</h3>
                      <Button onClick={addAccount} size="sm" data-testid="button-add-account">
                        Add Account
                      </Button>
                    </div>

                    {accounts.map((account, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`account-name-${index}`}>Account Name</Label>
                              <Input
                                id={`account-name-${index}`}
                                value={account.accountName}
                                onChange={(e) => updateAccount(index, 'accountName', e.target.value)}
                                placeholder="e.g., Personal Savings Account"
                                data-testid={`input-account-name-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`bank-name-${index}`}>Bank Name</Label>
                              <Input
                                id={`bank-name-${index}`}
                                value={account.bankName}
                                onChange={(e) => updateAccount(index, 'bankName', e.target.value)}
                                placeholder="e.g., Barclays, HSBC"
                                data-testid={`input-bank-name-${index}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`balance-${index}`}>Current Balance (£)</Label>
                              <Input
                                id={`balance-${index}`}
                                type="number"
                                value={account.balance || ''}
                                onChange={(e) => updateAccount(index, 'balance', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-balance-${index}`}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 items-end">
                            <div>
                              <Label htmlFor={`account-type-${index}`}>Account Type</Label>
                              <select
                                id={`account-type-${index}`}
                                value={account.accountType}
                                onChange={(e) => updateAccount(index, 'accountType', e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                data-testid={`select-account-type-${index}`}
                              >
                                <option value="current">Current Account</option>
                                <option value="savings">Savings Account</option>
                                <option value="investment">Investment Account</option>
                                <option value="business">Business Account</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`months-${index}`}>Months of Statements</Label>
                              <Input
                                id={`months-${index}`}
                                type="number"
                                min="0"
                                max="12"
                                value={account.monthsOfStatements || ''}
                                onChange={(e) => updateAccount(index, 'monthsOfStatements', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                data-testid={`input-months-${index}`}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={account.verified}
                                  onChange={(e) => updateAccount(index, 'verified', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-verified-${index}`}
                                />
                                <span className="text-sm">Bank Letter</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={account.sourceDocumented}
                                  onChange={(e) => updateAccount(index, 'sourceDocumented', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-source-${index}`}
                                />
                                <span className="text-sm">Source Docs</span>
                              </label>
                            </div>
                            <div className="flex items-center justify-end">
                              {accounts.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAccount(index)}
                                  data-testid={`button-remove-account-${index}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>

                          {account.monthsOfStatements < 6 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                              <Calendar className="h-4 w-4" />
                              <span>Need {6 - account.monthsOfStatements} more months of statements</span>
                            </div>
                          )}
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
                    <CardTitle>Savings by Account Type</CardTitle>
                    <CardDescription>Distribution across different account types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savingsByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={savingsByType}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: £${entry.value.toLocaleString()}`}
                          >
                            {savingsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Add accounts to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Verified vs unverified savings</CardDescription>
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
                      <p className="text-center text-muted-foreground py-12">Add accounts to see verification status</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bank Statement Coverage</CardTitle>
                  <CardDescription>Months of statements per account (6 months required)</CardDescription>
                </CardHeader>
                <CardContent>
                  {statementCoverageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statementCoverageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 6]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="months" name="Months Available" fill="#3b82f6" />
                        <Bar dataKey="target" name="Required (6 months)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Add accounts to see statement coverage</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GOV.UK Documentation Requirements</CardTitle>
                  <CardDescription>Official requirements for personal savings evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">6 Months Consecutive Bank Statements</p>
                        <p className="text-sm text-muted-foreground">Official statements on bank letterhead showing all transactions and balances</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Official Bank Letter (Current)</p>
                        <p className="text-sm text-muted-foreground">Confirming account ownership, current balance, and fund accessibility</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Source of Funds Documentation</p>
                        <p className="text-sm text-muted-foreground">Evidence of where savings originated (payslips, sale contracts, tax returns)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Accessibility Proof</p>
                        <p className="text-sm text-muted-foreground">Funds must be freely transferable to UK without restrictions or penalties</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Regulated Financial Institution</p>
                        <p className="text-sm text-muted-foreground">All funds must be held in properly regulated banks or investment accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">English Translation</p>
                        <p className="text-sm text-muted-foreground">All foreign language documents must be professionally translated and certified</p>
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
                    Smart Documentation Tips
                  </CardTitle>
                  <CardDescription>Context-aware guidance for your savings documentation</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>Common Documentation Mistakes</CardTitle>
                  <CardDescription>Avoid these critical errors that cause rejections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Gaps in bank statements</p>
                        <p className="text-xs text-muted-foreground">Missing even one month raises red flags - ensure consecutive coverage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Sudden large unexplained deposits</p>
                        <p className="text-xs text-muted-foreground">Always document source of deposits over £5,000</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Borrowed funds to meet threshold</p>
                        <p className="text-xs text-muted-foreground">Temporary loans are fraud - funds must be genuinely yours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Using screenshots instead of official statements</p>
                        <p className="text-xs text-muted-foreground">Only bank-issued statements on letterhead are acceptable</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Documentation Action Plan</CardTitle>
                  <CardDescription>Prioritized steps to gather complete savings evidence</CardDescription>
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
                            item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Checklist Template</CardTitle>
                  <CardDescription>Use this checklist for each account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 font-mono text-sm bg-muted p-4 rounded-lg">
                    <div className="space-y-2">
                      <p className="font-bold">ACCOUNT: [Account Name] - [Bank Name]</p>
                      <p>Current Balance: £[Amount]</p>
                      <p className="mt-4 font-bold">DOCUMENTATION STATUS:</p>
                      <div className="pl-4 space-y-1">
                        <p>[ ] 6 months consecutive statements (Month 1 to Month 6)</p>
                        <p>[ ] Official bank letter (dated within 31 days)</p>
                        <p>[ ] Source documentation for all deposits over £5,000</p>
                        <p>[ ] Accessibility confirmation letter</p>
                        <p>[ ] All pages numbered and account holder name visible</p>
                        <p>[ ] Translation certificate (if non-English)</p>
                        <p>[ ] Photocopy of original documents kept</p>
                      </div>
                      <p className="mt-4 font-bold">LARGE DEPOSITS TO DOCUMENT:</p>
                      <div className="pl-4 space-y-1">
                        <p>Date: [DD/MM/YYYY] | Amount: £[X] | Source: [Salary/Sale/Gift/etc]</p>
                        <p>Evidence: [Document type and reference number]</p>
                      </div>
                      <p className="mt-4 font-bold">VERIFICATION:</p>
                      <div className="pl-4 space-y-1">
                        <p>[ ] Reviewed by accountant</p>
                        <p>[ ] Reviewed by immigration lawyer</p>
                        <p>[ ] Final check before submission</p>
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
