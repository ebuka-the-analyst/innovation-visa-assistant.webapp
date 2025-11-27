import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Clock, Shield, FileText, Briefcase, Scale, BookOpen } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'due-diligence',
  toolName: 'Due Diligence Checklist',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Due diligence is the foundation of a successful visa application. Endorsing bodies will conduct thorough checks on your business - let me help you prepare by walking through the key compliance areas!",
  questions: [
    {
      id: 'legal-status',
      question: "Let's start with Legal Compliance. Is your company registered with Companies House, are your Articles of Association verified, and are all director appointments confirmed?",
      hint: "Include your company registration number if available",
      fieldKey: 'legal_compliance_status',
      minLength: 30
    },
    {
      id: 'financial-records',
      question: "For Financial Records, do you have filed annual accounts, current management accounts, verified bank statements, and documented funding sources?",
      hint: "Endorsers require evidence of £50k+ investment availability",
      fieldKey: 'financial_records_status',
      minLength: 30
    },
    {
      id: 'ip-protection',
      question: "What Intellectual Property protections have you secured? Have you completed an IP audit, filed any patents, registered trademarks, or documented copyright ownership?",
      hint: "IP protection demonstrates innovation credibility to endorsers",
      fieldKey: 'ip_protection_status',
      minLength: 30
    },
    {
      id: 'company-structure',
      question: "Describe your Company Structure documentation. Do you have an up-to-date cap table, PSC register, registered office confirmation, and standardized employee contracts?",
      hint: "UK employment law compliant contracts are essential",
      fieldKey: 'company_structure_status',
      minLength: 30
    },
    {
      id: 'tax-compliance',
      question: "For Tax Compliance, have you filed corporation tax returns, completed VAT registration (if applicable), and set up PAYE? Are there any outstanding tax liabilities?",
      hint: "Outstanding tax issues significantly impact visa approval",
      fieldKey: 'tax_compliance_status',
      minLength: 30
    },
    {
      id: 'contracts-agreements',
      question: "What's the status of your Contracts & Agreements? Do you have reviewed customer contracts, verified supplier agreements, active insurance policies, and lease agreements?",
      hint: "Professional indemnity insurance is highly recommended",
      fieldKey: 'contracts_status',
      minLength: 30
    }
  ],
  completionMessage: "Excellent! I've assessed your due diligence readiness. Your responses will be reflected in the checklist with appropriate priorities. Switch to the traditional view to mark individual items as complete and track your progress toward 100% compliance."
};

type ChecklistItem = {
  id: string;
  name: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  completed: boolean;
  ukRequirement: string;
};

const CHECKLIST_ITEMS: Omit<ChecklistItem, 'completed'>[] = [
  // Legal Compliance
  { id: 'legal-1', name: 'Company registration with Companies House', category: 'Legal Compliance', priority: 'Critical', ukRequirement: 'Valid UK company registration number and certificate' },
  { id: 'legal-2', name: 'Articles of Association verified', category: 'Legal Compliance', priority: 'Critical', ukRequirement: 'Current articles filed with Companies House' },
  { id: 'legal-3', name: 'Director appointments confirmed', category: 'Legal Compliance', priority: 'Critical', ukRequirement: 'All directors registered, PSC register updated' },
  { id: 'legal-4', name: 'Shareholders agreement reviewed', category: 'Legal Compliance', priority: 'High', ukRequirement: 'Clear equity structure and voting rights' },
  { id: 'legal-5', name: 'Trading licenses obtained', category: 'Legal Compliance', priority: 'High', ukRequirement: 'Industry-specific licenses if required (FCA, CQC, etc.)' },
  { id: 'legal-6', name: 'Data protection registration', category: 'Legal Compliance', priority: 'High', ukRequirement: 'ICO registration if processing personal data' },
  
  // Financial Records
  { id: 'financial-1', name: 'Latest annual accounts filed', category: 'Financial Records', priority: 'Critical', ukRequirement: 'Last 2-3 years filed with Companies House' },
  { id: 'financial-2', name: 'Management accounts current', category: 'Financial Records', priority: 'Critical', ukRequirement: 'Up-to-date P&L, balance sheet, cash flow' },
  { id: 'financial-3', name: 'Bank statements verified', category: 'Financial Records', priority: 'Critical', ukRequirement: 'Last 6 months from UK regulated bank' },
  { id: 'financial-4', name: 'Funding source documentation', category: 'Financial Records', priority: 'Critical', ukRequirement: 'Evidence of £50k+ investment availability' },
  { id: 'financial-5', name: 'Financial projections prepared', category: 'Financial Records', priority: 'High', ukRequirement: '3-year forecasts with assumptions' },
  { id: 'financial-6', name: 'Audit trail for major transactions', category: 'Financial Records', priority: 'High', ukRequirement: 'Invoices, receipts, contracts for significant expenses' },
  
  // IP Protection
  { id: 'ip-1', name: 'Intellectual property audit completed', category: 'IP Protection', priority: 'High', ukRequirement: 'Identification of all IP assets' },
  { id: 'ip-2', name: 'Patent applications filed (if applicable)', category: 'IP Protection', priority: 'High', ukRequirement: 'UK IPO or international patents' },
  { id: 'ip-3', name: 'Trademark registrations secured', category: 'IP Protection', priority: 'Medium', ukRequirement: 'Brand protection in relevant classes' },
  { id: 'ip-4', name: 'Copyright ownership confirmed', category: 'IP Protection', priority: 'High', ukRequirement: 'Assignment agreements for all created works' },
  { id: 'ip-5', name: 'Trade secrets protection documented', category: 'IP Protection', priority: 'Medium', ukRequirement: 'NDAs, confidentiality procedures in place' },
  
  // Company Structure
  { id: 'structure-1', name: 'Ownership structure documented', category: 'Company Structure', priority: 'Critical', ukRequirement: 'Cap table showing all equity holders' },
  { id: 'structure-2', name: 'PSC register up to date', category: 'Company Structure', priority: 'Critical', ukRequirement: 'Persons with Significant Control declared' },
  { id: 'structure-3', name: 'Registered office address confirmed', category: 'Company Structure', priority: 'High', ukRequirement: 'Valid UK business address (not PO Box)' },
  { id: 'structure-4', name: 'Employee contracts standardized', category: 'Company Structure', priority: 'High', ukRequirement: 'UK employment law compliant contracts' },
  { id: 'structure-5', name: 'Advisory board formalized', category: 'Company Structure', priority: 'Medium', ukRequirement: 'Letters of engagement for advisors' },
  
  // Tax Compliance
  { id: 'tax-1', name: 'Corporation tax returns filed', category: 'Tax Compliance', priority: 'Critical', ukRequirement: 'All returns submitted to HMRC on time' },
  { id: 'tax-2', name: 'VAT registration completed (if applicable)', category: 'Tax Compliance', priority: 'Critical', ukRequirement: 'VAT number obtained if turnover >£90k' },
  { id: 'tax-3', name: 'PAYE system operational', category: 'Tax Compliance', priority: 'Critical', ukRequirement: 'Payroll registered with HMRC' },
  { id: 'tax-4', name: 'Tax clearances obtained', category: 'Tax Compliance', priority: 'High', ukRequirement: 'No outstanding tax liabilities' },
  { id: 'tax-5', name: 'R&D tax credit claims prepared', category: 'Tax Compliance', priority: 'Medium', ukRequirement: 'Claims for qualifying innovation activities' },
  
  // Contracts & Agreements
  { id: 'contracts-1', name: 'Customer contracts reviewed', category: 'Contracts & Agreements', priority: 'High', ukRequirement: 'Standard terms and conditions compliant' },
  { id: 'contracts-2', name: 'Supplier agreements verified', category: 'Contracts & Agreements', priority: 'High', ukRequirement: 'Key supplier relationships documented' },
  { id: 'contracts-3', name: 'Partnership agreements formalized', category: 'Contracts & Agreements', priority: 'Medium', ukRequirement: 'MoUs or formal partnership contracts' },
  { id: 'contracts-4', name: 'Lease or premises agreements', category: 'Contracts & Agreements', priority: 'High', ukRequirement: 'Office space tenancy agreement' },
  { id: 'contracts-5', name: 'Insurance policies active', category: 'Contracts & Agreements', priority: 'High', ukRequirement: 'Professional indemnity, public liability coverage' },
];

export default function DueDiligence() {
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('due-diligence-mode');
    return (saved === 'traditional') ? 'traditional' : 'ai';
  });
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    CHECKLIST_ITEMS.map(item => ({ ...item, completed: false }))
  );
  const [activeTab, setActiveTab] = useState('checklist');
  const [savedDate, setSavedDate] = useState('');
  const [showSmartTips, setShowSmartTips] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  useEffect(() => {
    localStorage.setItem('due-diligence-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const updatedChecklist = [...checklist];
    
    const checkAndUpdate = (categoryName: string, answerKey: string) => {
      const answer = answers[answerKey]?.toLowerCase() || '';
      if (answer.includes('yes') || answer.includes('have') || answer.includes('complete')) {
        updatedChecklist.forEach(item => {
          if (item.category === categoryName && item.priority === 'Critical') {
            item.completed = true;
          }
        });
      }
    };
    
    checkAndUpdate('Legal Compliance', 'legal_compliance_status');
    checkAndUpdate('Financial Records', 'financial_records_status');
    checkAndUpdate('IP Protection', 'ip_protection_status');
    checkAndUpdate('Company Structure', 'company_structure_status');
    checkAndUpdate('Tax Compliance', 'tax_compliance_status');
    checkAndUpdate('Contracts & Agreements', 'contracts_status');
    
    setChecklist(updatedChecklist);
    
    const date = new Date().toLocaleString('en-GB');
    localStorage.setItem('due-diligence-state', JSON.stringify({
      checklist: updatedChecklist,
      activeTab: 'checklist',
      savedDate: date
    }));
    setSavedDate(date);
    
    setActiveTab('checklist');
    setMode('traditional');
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const overallScore = Math.round((completedItems / totalItems) * 100);

  const criticalCompleted = checklist.filter(i => i.priority === 'Critical' && i.completed).length;
  const criticalTotal = checklist.filter(i => i.priority === 'Critical').length;
  const criticalScore = Math.round((criticalCompleted / criticalTotal) * 100);

  const categoryScores = ['Legal Compliance', 'Financial Records', 'IP Protection', 'Company Structure', 'Tax Compliance', 'Contracts & Agreements'].map(cat => {
    const categoryItems = checklist.filter(i => i.category === cat);
    const completed = categoryItems.filter(i => i.completed).length;
    const total = categoryItems.length;
    return {
      category: cat.replace(' & ', '\n& ').replace(' ', '\n'),
      score: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  });

  const milestoneData = [
    { week: 'Week 1', target: 25, actual: Math.min(overallScore, 25) },
    { week: 'Week 2', target: 50, actual: Math.min(overallScore, 50) },
    { week: 'Week 3', target: 75, actual: Math.min(overallScore, 75) },
    { week: 'Week 4', target: 100, actual: overallScore },
  ];

  const getSerializedState = () => {
    return {
      checklist,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('checklist' in state) setChecklist(state.checklist);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'due-diligence_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        restoreSerializedState(payload);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      const saved = localStorage.getItem('due-diligence-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('due-diligence-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('due-diligence-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalScore < 100) {
      tips.push("Critical items must be 100% complete for visa approval - prioritize legal compliance and financial records");
    }
    
    if (checklist.filter(i => i.category === 'Financial Records' && !i.completed).length > 0) {
      tips.push("Financial transparency is paramount - endorsing bodies will scrutinize every transaction and funding source");
    }
    
    if (checklist.filter(i => i.category === 'Legal Compliance' && !i.completed).length > 0) {
      tips.push("Legal compliance gaps can lead to immediate rejection - verify all Companies House filings are current");
    }
    
    if (checklist.filter(i => i.category === 'Tax Compliance' && !i.completed).length > 0) {
      tips.push("HMRC compliance is non-negotiable - any outstanding tax issues will delay or prevent visa approval");
    }
    
    if (checklist.filter(i => i.category === 'IP Protection' && !i.completed).length > 0) {
      tips.push("IP protection demonstrates innovation credibility - file patents or trademarks to strengthen your application");
    }
    
    if (overallScore < 80) {
      tips.push("Target 90%+ completion before submitting visa application to maximize approval chances");
    }
    
    if (overallScore >= 90) {
      tips.push("Strong due diligence position - ensure all documentation is organized chronologically and cross-referenced");
    }
    
    tips.push("Maintain updated copies of all documents in both digital and physical formats for endorsing body interviews");
    
    tips.push("UK legal requirements change frequently - verify all compliance items against current UKVI guidance before submission");
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Complete all Critical priority items - Companies House verification, financial records, tax filings", priority: "Critical" },
      { week: "Week 1-2", action: "Gather and organize documentation for all completed checklist items with clear audit trail", priority: "Critical" },
      { week: "Week 2", action: "Address all High priority items - IP protection, contracts review, insurance verification", priority: "High" },
      { week: "Week 2-3", action: "Engage UK accountant to verify financial records and tax compliance meet HMRC standards", priority: "Critical" },
      { week: "Week 3", action: "Complete Medium priority items - advisory board formalization, partnership agreements", priority: "Medium" },
      { week: "Week 3-4", action: "Conduct full legal review with UK solicitor specializing in immigration business requirements", priority: "High" },
      { week: "Week 4", action: "Prepare comprehensive due diligence report with all supporting documentation indexed", priority: "Critical" },
      { week: "Week 4", action: "Final verification - ensure all documents dated within 3 months of application submission", priority: "Critical" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - DUE DILIGENCE CHECKLIST
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

COMPLIANCE SUMMARY
${'-'.repeat(80)}
Overall Completion: ${completedItems}/${totalItems} (${overallScore}%)
Critical Items: ${criticalCompleted}/${criticalTotal} (${criticalScore}%)
Status: ${overallScore >= 90 ? 'READY FOR SUBMISSION' : overallScore >= 70 ? 'REVIEW NEEDED' : 'NOT READY'}

CATEGORY BREAKDOWN
${'-'.repeat(80)}
${categoryScores.map(cat => `${cat.category.replace('\n', ' ')}: ${cat.completed}/${cat.total} (${cat.score}%)`).join('\n')}

DETAILED CHECKLIST
${'-'.repeat(80)}
${['Legal Compliance', 'Financial Records', 'IP Protection', 'Company Structure', 'Tax Compliance', 'Contracts & Agreements'].map(category => `
${category.toUpperCase()}
${checklist.filter(i => i.category === category).map(item => `
${item.completed ? '[X]' : '[ ]'} ${item.name}
    Priority: ${item.priority}
    UK Requirement: ${item.ukRequirement}
`).join('')}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK LEGAL & REGULATORY NOTES
${'-'.repeat(80)}
- All companies must be registered with Companies House (www.gov.uk/government/organisations/companies-house)
- Financial records must comply with UK GAAP or IFRS accounting standards
- Tax compliance verified through HMRC systems (www.gov.uk/government/organisations/hm-revenue-customs)
- Data protection under UK GDPR requires ICO registration (ico.org.uk)
- Employment contracts must meet UK Employment Rights Act 1996 requirements
- IP protection through UK IPO (www.gov.uk/government/organisations/intellectual-property-office)
- Professional indemnity insurance recommended minimum £1M coverage
- Endorsing bodies may request additional documentation beyond this checklist
- All documents must be in English or accompanied by certified translations
- Keep original documents - photocopies may be rejected during verification

CRITICAL DEADLINES
${'-'.repeat(80)}
- Annual accounts filing: Within 9 months of year-end
- Corporation tax return: 12 months after accounting period
- Confirmation statement: At least once every 12 months
- VAT returns: Quarterly (if registered)
- PAYE submissions: Monthly or quarterly depending on size

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This checklist provides general guidance only. Consult with qualified UK immigration 
solicitors and accountants for advice specific to your circumstances. Requirements may vary by 
endorsing body and individual circumstances.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due-diligence-report-${Date.now()}.txt`;
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
            <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
              <h1 className="text-4xl font-bold" data-testid="heading-due-diligence">Due Diligence Checklist</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} />
            </div>
            <p className="text-lg text-muted-foreground">Comprehensive visa application compliance audit</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
            )}
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="due-diligence"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={() => setShowSmartTips(!showSmartTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
            toolName="Due Diligence Checklist"
          />

          {showSmartTips && (
            <Card className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getSmartTips().map((tip, i) => (
                    <li key={i} className="text-sm flex gap-2" data-testid={`tip-${i}`}>
                      <span className="font-bold">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {showActionPlan && (
            <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  4-Week Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateActionPlan().map((item, i) => (
                    <div key={i} className="flex gap-3" data-testid={`action-${i}`}>
                      <span className="font-bold text-sm min-w-24">{item.week}</span>
                      <div className="flex-1">
                        <p className="text-sm">{item.action}</p>
                        <span className={`text-xs font-semibold ${
                          item.priority === 'Critical' ? 'text-red-600 dark:text-red-400' : 
                          item.priority === 'High' ? 'text-orange-600 dark:text-orange-400' : 
                          'text-blue-600 dark:text-blue-400'
                        }`}>{item.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" data-testid="tabs-due-diligence">
              <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
              <TabsTrigger value="compliance" data-testid="tab-compliance">UK Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Due Diligence Status</CardTitle>
                  <CardDescription>Complete all critical items before visa application submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className={overallScore >= 90 ? "border-green-500" : overallScore >= 70 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                          <p className="text-3xl font-bold" data-testid="text-overall-score">{overallScore}%</p>
                          <p className="text-sm mt-2">{completedItems}/{totalItems} items</p>
                          <Progress value={overallScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalScore === 100 ? "border-green-500" : "border-red-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Items</p>
                          <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-critical-score">{criticalScore}%</p>
                          <p className="text-sm mt-2">{criticalCompleted}/{criticalTotal} complete</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {criticalScore === 100 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Readiness Status</p>
                          <p className="text-lg font-bold mt-2" data-testid="text-readiness-status">
                            {overallScore >= 90 ? 'Ready' : overallScore >= 70 ? 'Review Needed' : 'Not Ready'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {overallScore >= 90 ? 'Application ready for submission' : 
                             overallScore >= 70 ? 'Address gaps before submission' : 
                             'Significant work required'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {criticalScore < 100 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        All critical items must be completed before visa submission. Missing critical documentation will result in automatic rejection.
                      </AlertDescription>
                    </Alert>
                  )}

                  {criticalScore === 100 && overallScore < 90 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Critical items complete, but aim for 90%+ overall completion to maximize approval chances.
                      </AlertDescription>
                    </Alert>
                  )}

                  {overallScore >= 90 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent preparation! Your due diligence documentation appears comprehensive. Schedule final legal review before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-6">
                    {['Legal Compliance', 'Financial Records', 'IP Protection', 'Company Structure', 'Tax Compliance', 'Contracts & Agreements'].map((category, catIndex) => {
                      const categoryItems = checklist.filter(i => i.category === category);
                      const categoryCompleted = categoryItems.filter(i => i.completed).length;
                      const categoryProgress = Math.round((categoryCompleted / categoryItems.length) * 100);
                      
                      const icons = {
                        'Legal Compliance': Scale,
                        'Financial Records': FileText,
                        'IP Protection': Shield,
                        'Company Structure': Briefcase,
                        'Tax Compliance': BookOpen,
                        'Contracts & Agreements': FileText
                      };
                      
                      const Icon = icons[category as keyof typeof icons];
                      
                      return (
                        <Card key={category}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {category}
                              </CardTitle>
                              <div className="text-sm text-muted-foreground">
                                {categoryCompleted}/{categoryItems.length} ({categoryProgress}%)
                              </div>
                            </div>
                            <Progress value={categoryProgress} className="mt-2" />
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {categoryItems.map((item, itemIndex) => (
                                <div 
                                  key={item.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                                    item.priority === 'Critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 
                                    item.priority === 'High' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20' : 
                                    'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                  }`}
                                  data-testid={`checklist-item-${item.id}`}
                                >
                                  <Checkbox
                                    id={item.id}
                                    checked={item.completed}
                                    onCheckedChange={() => toggleItem(item.id)}
                                    className="mt-1"
                                    data-testid={`checkbox-${item.id}`}
                                  />
                                  <div className="flex-1">
                                    <label 
                                      htmlFor={item.id}
                                      className="font-medium text-sm cursor-pointer block"
                                    >
                                      {item.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      UK Requirement: {item.ukRequirement}
                                    </p>
                                    <span className={`text-xs font-semibold mt-1 inline-block ${
                                      item.priority === 'Critical' ? 'text-red-600 dark:text-red-400' : 
                                      item.priority === 'High' ? 'text-orange-600 dark:text-orange-400' : 
                                      'text-blue-600 dark:text-blue-400'
                                    }`}>
                                      {item.priority} Priority
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Completion Analysis</CardTitle>
                  <CardDescription>Progress by compliance category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryScores} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="category" width={120} />
                      <Tooltip 
                        formatter={(value: number) => `${value}%`}
                        labelFormatter={(label) => label.replace('\n', ' ')}
                      />
                      <Legend />
                      <Bar dataKey="score" fill="#3b82f6" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                    <CardDescription>Items by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Critical', 'High', 'Medium'].map(priority => {
                        const items = checklist.filter(i => i.priority === priority);
                        const completed = items.filter(i => i.completed).length;
                        const percentage = Math.round((completed / items.length) * 100);
                        
                        return (
                          <div key={priority}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{priority}</span>
                              <span className="text-sm text-muted-foreground">{completed}/{items.length}</span>
                            </div>
                            <Progress value={percentage} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Completion Summary</CardTitle>
                    <CardDescription>Overall statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Items</span>
                        <span className="font-bold" data-testid="stat-total-items">{totalItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <span className="font-bold text-green-600" data-testid="stat-completed">{completedItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Remaining</span>
                        <span className="font-bold text-orange-600" data-testid="stat-remaining">{totalItems - completedItems}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Categories</span>
                        <span className="font-bold">6</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm font-semibold">Overall Score</span>
                        <span className="font-bold text-xl text-primary">{overallScore}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Completion Timeline</CardTitle>
                  <CardDescription>Target vs actual progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={milestoneData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#94a3b8" 
                        strokeWidth={2}
                        name="Target"
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Actual Progress"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3">Milestone Targets</h4>
                    <div className="space-y-2">
                      {milestoneData.map((milestone, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{milestone.week}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">Target: {milestone.target}%</span>
                            <span className={milestone.actual >= milestone.target ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                              Actual: {milestone.actual}%
                            </span>
                            {milestone.actual >= milestone.target && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Deadlines</CardTitle>
                  <CardDescription>UK regulatory filing requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded">
                      <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Annual Accounts</p>
                        <p className="text-xs text-muted-foreground">Within 9 months of year-end (Companies House)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 rounded">
                      <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Corporation Tax Return</p>
                        <p className="text-xs text-muted-foreground">12 months after accounting period (HMRC)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Confirmation Statement</p>
                        <p className="text-xs text-muted-foreground">At least once every 12 months (Companies House)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded">
                      <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">VAT Returns</p>
                        <p className="text-xs text-muted-foreground">Quarterly if registered (HMRC)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">PAYE Submissions</p>
                        <p className="text-xs text-muted-foreground">Monthly or quarterly (HMRC)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>UK Legal & Regulatory Framework</CardTitle>
                  <CardDescription>Essential compliance requirements for Innovator Founder Visa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Companies House Requirements
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Company registration with unique registration number (www.gov.uk/government/organisations/companies-house)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Current Articles of Association on file</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>PSC (Persons with Significant Control) register maintained and filed</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Annual confirmation statements submitted on time</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        HMRC Tax Compliance
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Corporation Tax registration and timely filing (www.gov.uk/government/organisations/hm-revenue-customs)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>VAT registration if turnover exceeds £90,000 threshold</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>PAYE system operational for employee payroll</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>No outstanding tax liabilities or penalties</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Data Protection & Privacy
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>ICO registration if processing personal data (ico.org.uk)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>UK GDPR compliance policies and procedures</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Privacy policy and cookie consent mechanisms</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Intellectual Property
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Patent applications through UK IPO (www.gov.uk/government/organisations/intellectual-property-office)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Trademark registration in relevant classes</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Copyright ownership documentation and assignment agreements</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Employment Law
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Employment contracts compliant with Employment Rights Act 1996</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Workplace policies (health & safety, anti-discrimination)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Right to work checks for all employees</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Financial Standards
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Accounting standards: UK GAAP or IFRS compliance</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Annual accounts audited if required (public interest entities, large companies)</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Management accounts prepared regularly (monthly/quarterly)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>All documents must be in English or accompanied by certified translations</li>
                    <li>Original documents should be kept - photocopies may be rejected during verification</li>
                    <li>Endorsing bodies may request additional documentation beyond this standard checklist</li>
                    <li>Requirements vary by endorsing body - verify specific requirements with your chosen endorser</li>
                    <li>Legal and regulatory requirements are subject to change - always verify current requirements</li>
                    <li>Professional advice from UK immigration solicitors and accountants is strongly recommended</li>
                    <li>Allow 4-6 weeks minimum for comprehensive due diligence completion</li>
                    <li>Documents should be dated within 3 months of application submission where possible</li>
                  </ul>
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
