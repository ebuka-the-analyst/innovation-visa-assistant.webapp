import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, AlertTriangle, Building2, FileText, Banknote, Shield, Users, Calendar } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'company-formation',
  toolName: 'Company Formation Guide',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. Forming a UK company correctly is essential for your Innovator Founder Visa. A properly structured limited company with all compliance requirements met demonstrates you're ready to do business in the UK. Let's get you registered!",
  questions: [
    {
      id: 'company-type-choice',
      question: "What type of company structure are you considering? Explain why this structure fits your business.",
      hint: "Ltd is most common for visa applicants - it offers liability protection and is preferred by endorsers",
      fieldKey: 'company_type_choice',
      minLength: 80
    },
    {
      id: 'company-name',
      question: "What company name have you chosen or are considering? Have you checked availability on Companies House?",
      hint: "Name must be unique and not contain restricted words. Consider .co.uk domain availability too.",
      fieldKey: 'company_name_info',
      minLength: 40
    },
    {
      id: 'registered-office',
      question: "Where will your registered office address be? This must be a UK address.",
      hint: "Can be your home, serviced office, or registered agent. All official mail goes here.",
      fieldKey: 'registered_office_info',
      minLength: 50
    },
    {
      id: 'directors-shareholders',
      question: "Who will be the directors and shareholders? Describe the ownership structure.",
      hint: "You must be a director. Include any co-founders, investors, or ESOP details.",
      fieldKey: 'directors_shareholders_info',
      minLength: 80
    },
    {
      id: 'share-capital',
      question: "What will be your initial share capital and share structure?",
      hint: "Most startups start with £100-1000 in £1 ordinary shares. Consider future investment rounds.",
      fieldKey: 'share_capital_info',
      minLength: 60
    },
    {
      id: 'compliance-plan',
      question: "How will you handle ongoing compliance? Describe your plan for accounts, tax, and filings.",
      hint: "Annual accounts, confirmation statement, Corporation Tax, VAT registration, payroll",
      fieldKey: 'compliance_plan_info',
      minLength: 100
    }
  ],
  completionMessage: "Excellent preparation! You've covered all the key aspects of UK company formation. This thorough planning will ensure smooth registration and demonstrate compliance readiness to endorsers. I'm now updating your formation checklist."
};

type CompanyType = 'ltd' | 'llp' | 'plc' | 'sole-trader' | 'partnership' | '';

interface FormationStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  category: 'legal' | 'financial' | 'operational' | 'compliance';
  priority: 'critical' | 'high' | 'medium';
  estimatedDays: number;
}

const COMPANY_TYPES = [
  {
    id: 'ltd' as CompanyType,
    name: 'Private Limited Company (Ltd)',
    description: 'Most common structure for UK businesses. Limited liability protection for shareholders.',
    minDirectors: 1,
    minShareholders: 1,
    liability: 'Limited',
    taxRate: '19-25% Corporation Tax',
    setup: '£12-50 registration fee'
  },
  {
    id: 'llp' as CompanyType,
    name: 'Limited Liability Partnership (LLP)',
    description: 'Hybrid structure combining partnership flexibility with limited liability.',
    minDirectors: 2,
    minShareholders: 2,
    liability: 'Limited',
    taxRate: 'Partners pay Income Tax',
    setup: '£40 registration fee'
  },
  {
    id: 'plc' as CompanyType,
    name: 'Public Limited Company (PLC)',
    description: 'Can offer shares to the public. Requires minimum £50,000 share capital.',
    minDirectors: 2,
    minShareholders: 1,
    liability: 'Limited',
    taxRate: '19-25% Corporation Tax',
    setup: '£40 + £50k min capital'
  },
  {
    id: 'sole-trader' as CompanyType,
    name: 'Sole Trader',
    description: 'Simplest structure. You are the business. Full personal liability.',
    minDirectors: 1,
    minShareholders: 1,
    liability: 'Unlimited',
    taxRate: 'Income Tax on profits',
    setup: 'Free registration with HMRC'
  },
  {
    id: 'partnership' as CompanyType,
    name: 'Partnership',
    description: 'Two or more people share business responsibilities, profits, and liabilities.',
    minDirectors: 2,
    minShareholders: 2,
    liability: 'Unlimited',
    taxRate: 'Partners pay Income Tax',
    setup: 'Free registration with HMRC'
  },
];

const INITIAL_STEPS: FormationStep[] = [
  {
    id: 'company-type',
    name: 'Choose Company Type',
    description: 'Select appropriate legal structure for your business',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'company-name',
    name: 'Check and Reserve Company Name',
    description: 'Verify name availability on Companies House and reserve it',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'registered-office',
    name: 'Confirm Registered Office Address',
    description: 'Provide UK address for official correspondence',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'directors-shareholders',
    name: 'Appoint Directors and Shareholders',
    description: 'Identify and document company officers and shareholders',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 2
  },
  {
    id: 'memorandum',
    name: 'Prepare Memorandum of Association',
    description: 'Document stating intention to form company',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'articles',
    name: 'Draft Articles of Association',
    description: 'Define company rules and governance structure',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 2
  },
  {
    id: 'companies-house',
    name: 'Register with Companies House',
    description: 'Submit IN01 form and supporting documents online',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'certificate',
    name: 'Receive Certificate of Incorporation',
    description: 'Official confirmation of company registration',
    completed: false,
    category: 'legal',
    priority: 'critical',
    estimatedDays: 3
  },
  {
    id: 'corporation-tax',
    name: 'Register for Corporation Tax (HMRC)',
    description: 'Must register within 3 months of starting business',
    completed: false,
    category: 'compliance',
    priority: 'critical',
    estimatedDays: 1
  },
  {
    id: 'business-bank',
    name: 'Open Business Bank Account',
    description: 'Separate business and personal finances',
    completed: false,
    category: 'financial',
    priority: 'high',
    estimatedDays: 5
  },
  {
    id: 'accounting-system',
    name: 'Setup Accounting System',
    description: 'Implement bookkeeping software and processes',
    completed: false,
    category: 'financial',
    priority: 'high',
    estimatedDays: 3
  },
  {
    id: 'vat-registration',
    name: 'Register for VAT (if applicable)',
    description: 'Required if turnover exceeds £90,000 per year',
    completed: false,
    category: 'compliance',
    priority: 'medium',
    estimatedDays: 2
  },
  {
    id: 'paye-payroll',
    name: 'Register for PAYE (if hiring employees)',
    description: 'Setup payroll system for employee taxes',
    completed: false,
    category: 'compliance',
    priority: 'high',
    estimatedDays: 2
  },
  {
    id: 'insurance',
    name: 'Obtain Business Insurance',
    description: 'Employers liability (mandatory if hiring), professional indemnity, etc.',
    completed: false,
    category: 'compliance',
    priority: 'high',
    estimatedDays: 3
  },
  {
    id: 'licenses',
    name: 'Apply for Industry-Specific Licenses',
    description: 'Obtain any required permits or certifications',
    completed: false,
    category: 'compliance',
    priority: 'medium',
    estimatedDays: 7
  },
  {
    id: 'data-protection',
    name: 'Register with ICO (if processing data)',
    description: 'Data Protection registration if handling personal data',
    completed: false,
    category: 'compliance',
    priority: 'medium',
    estimatedDays: 1
  },
];

export default function CompanyFormation() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('company-formation-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [companyType, setCompanyType] = useState<CompanyType>('');
  const [steps, setSteps] = useState<FormationStep[]>(INITIAL_STEPS);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');
  const [showSmartTips, setShowSmartTips] = useState(false);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('company-formation-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  const criticalCompleted = steps.filter(s => s.priority === 'critical' && s.completed).length;
  const criticalTotal = steps.filter(s => s.priority === 'critical').length;

  const toggleStep = (stepId: string) => {
    setSteps(steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    ));
  };

  const getSerializedState = () => {
    return {
      companyType,
      steps,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('companyType' in state) setCompanyType(state.companyType);
    if ('steps' in state) setSteps(state.steps);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('company-formation-mode', mode);
  }, [mode]);

  useEffect(() => {
    const handoffKey = 'company-formation_handoff';
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
      const saved = localStorage.getItem('company-formation-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleAiComplete = (answers: Record<string, any>) => {
    if (answers.company_type_choice) {
      if (answers.company_type_choice.toLowerCase().includes('ltd') || answers.company_type_choice.toLowerCase().includes('limited')) {
        setCompanyType('ltd');
      } else if (answers.company_type_choice.toLowerCase().includes('llp')) {
        setCompanyType('llp');
      } else if (answers.company_type_choice.toLowerCase().includes('plc')) {
        setCompanyType('plc');
      }
    }
    if (answers.company_name_info) {
      setSteps(prev => prev.map(s => 
        s.id === 'company-name' ? { ...s, completed: true } : s
      ));
    }
    if (answers.registered_office_info) {
      setSteps(prev => prev.map(s => 
        s.id === 'registered-office' ? { ...s, completed: true } : s
      ));
    }
    if (answers.directors_shareholders_info) {
      setSteps(prev => prev.map(s => 
        s.id === 'directors-shareholders' ? { ...s, completed: true } : s
      ));
    }
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('company-formation-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('company-formation-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (!companyType) {
      tips.push("Start by selecting your company type - this determines your legal structure, tax obligations, and liability protection");
    }
    
    if (companyType === 'ltd') {
      tips.push("Limited companies offer liability protection and are preferred for innovation visa applications as they demonstrate professional business structure");
    }
    
    if (companyType === 'sole-trader' || companyType === 'partnership') {
      tips.push("Consider forming a Limited Company instead - it provides better liability protection and is more attractive to investors and endorsing bodies");
    }
    
    if (completedSteps < 8) {
      tips.push("Complete Companies House registration first - this is required before you can open a business bank account or register for Corporation Tax");
    }
    
    if (!steps.find(s => s.id === 'business-bank')?.completed && steps.find(s => s.id === 'companies-house')?.completed) {
      tips.push("Open your business bank account immediately after incorporation - banks require your Certificate of Incorporation and can take 1-2 weeks");
    }
    
    if (!steps.find(s => s.id === 'corporation-tax')?.completed && steps.find(s => s.id === 'companies-house')?.completed) {
      tips.push("You must register for Corporation Tax within 3 months of starting business activity - failure results in automatic penalties");
    }
    
    if (steps.find(s => s.id === 'paye-payroll')?.completed) {
      tips.push("Ensure you have employers liability insurance - it is legally required if you have any employees and costs around £100-300 annually");
    }
    
    if (progressPercentage >= 80) {
      tips.push("Excellent progress - ensure all documentation is organized and stored securely for future audits and visa applications");
    }
    
    if (!steps.find(s => s.id === 'accounting-system')?.completed) {
      tips.push("Setup accounting software early (Xero, QuickBooks, FreeAgent) - proper financial records from day one are crucial for tax compliance and visa evidence");
    }
    
    tips.push("Keep copies of all formation documents - Certificate of Incorporation, Articles of Association, and Memorandum are needed for visa applications");
    
    tips.push("Consider using a registered office service if working from home - it provides a professional business address and privacy protection");

    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Choose company type, check name availability, prepare director/shareholder details, draft Memorandum and Articles of Association", 
        priority: "Critical",
        steps: ["company-type", "company-name", "directors-shareholders", "memorandum", "articles"]
      },
      { 
        week: "Week 1-2", 
        action: "Submit IN01 to Companies House, receive Certificate of Incorporation, apply for business bank account", 
        priority: "Critical",
        steps: ["companies-house", "certificate", "business-bank"]
      },
      { 
        week: "Week 2-3", 
        action: "Register for Corporation Tax with HMRC, setup accounting system, obtain business insurance", 
        priority: "Critical",
        steps: ["corporation-tax", "accounting-system", "insurance"]
      },
      { 
        week: "Week 3-4", 
        action: "Register for VAT (if applicable), setup PAYE for employees, apply for industry licenses, register with ICO if needed", 
        priority: "High",
        steps: ["vat-registration", "paye-payroll", "licenses", "data-protection"]
      },
    ];
  };

  const handleExport = () => {
    const selectedType = COMPANY_TYPES.find(t => t.id === companyType);
    const report = `UK COMPANY FORMATION TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(70)}

COMPANY DETAILS
${'-'.repeat(70)}
Company Type: ${selectedType?.name || 'Not selected'}
${selectedType ? `Description: ${selectedType.description}` : ''}
${selectedType ? `Minimum Directors: ${selectedType.minDirectors}` : ''}
${selectedType ? `Minimum Shareholders: ${selectedType.minShareholders}` : ''}
${selectedType ? `Liability: ${selectedType.liability}` : ''}
${selectedType ? `Tax Treatment: ${selectedType.taxRate}` : ''}
${selectedType ? `Setup Cost: ${selectedType.setup}` : ''}

FORMATION PROGRESS
${'-'.repeat(70)}
Overall Progress: ${progressPercentage}%
Completed Steps: ${completedSteps}/${totalSteps}
Critical Steps Completed: ${criticalCompleted}/${criticalTotal}
Status: ${progressPercentage >= 100 ? 'COMPLETE' : progressPercentage >= 70 ? 'NEARLY COMPLETE' : progressPercentage >= 40 ? 'IN PROGRESS' : 'EARLY STAGE'}

FORMATION CHECKLIST
${'-'.repeat(70)}
${steps.map((step, i) => `
${i + 1}. [${step.completed ? 'X' : ' '}] ${step.name}
   ${step.description}
   Category: ${step.category.toUpperCase()} | Priority: ${step.priority.toUpperCase()}
   Estimated Time: ${step.estimatedDays} ${step.estimatedDays === 1 ? 'day' : 'days'}
   Status: ${step.completed ? 'COMPLETED' : 'PENDING'}
`).join('')}

PROGRESS BY CATEGORY
${'-'.repeat(70)}
Legal: ${steps.filter(s => s.category === 'legal' && s.completed).length}/${steps.filter(s => s.category === 'legal').length} completed
Financial: ${steps.filter(s => s.category === 'financial' && s.completed).length}/${steps.filter(s => s.category === 'financial').length} completed
Compliance: ${steps.filter(s => s.category === 'compliance' && s.completed).length}/${steps.filter(s => s.category === 'compliance').length} completed
Operational: ${steps.filter(s => s.category === 'operational' && s.completed).length}/${steps.filter(s => s.category === 'operational').length} completed

SMART RECOMMENDATIONS
${'-'.repeat(70)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(70)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}:
${item.action}
Steps: ${item.steps.map(id => steps.find(s => s.id === id)?.name).join(', ')}
`).join('\n')}

GOV.UK COMPANIES HOUSE REQUIREMENTS 2025
${'-'.repeat(70)}
1. Registration Fee: £12 (online same-day) or £40 (postal 8-10 days)
2. Required Information:
   - Company name (must be unique and not restricted)
   - Registered office address (UK address)
   - At least one director (16+ years old)
   - At least one shareholder
   - Details of shares and shareholders
   - Statement of capital
   - People with significant control (PSC)
   - Memorandum and Articles of Association

3. Compliance Requirements:
   - Annual Confirmation Statement (within 14 days of anniversary)
   - Annual accounts filing (9 months after year-end for private companies)
   - Notify changes within 14 days (directors, address, shares)
   - Maintain statutory registers

4. Key Deadlines:
   - Corporation Tax registration: within 3 months of start
   - PAYE registration: before first payday if hiring
   - VAT registration: if turnover exceeds £90,000
   - Annual accounts: 9 months after year-end

IMPORTANT NOTES
${'-'.repeat(70)}
- Certificate of Incorporation required for UK Innovation Visa applications
- Maintain proper accounting records from day one
- Keep all formation documents for visa evidence
- Consider professional company formation service for complex structures
- Ensure compliance with ongoing filing requirements
- Directors have legal responsibilities - understand duties before accepting role

${'='.repeat(70)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-formation-tracker-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categoryData = [
    {
      name: 'Legal',
      total: steps.filter(s => s.category === 'legal').length,
      completed: steps.filter(s => s.category === 'legal' && s.completed).length,
      color: '#3b82f6'
    },
    {
      name: 'Financial',
      total: steps.filter(s => s.category === 'financial').length,
      completed: steps.filter(s => s.category === 'financial' && s.completed).length,
      color: '#10b981'
    },
    {
      name: 'Compliance',
      total: steps.filter(s => s.category === 'compliance').length,
      completed: steps.filter(s => s.category === 'compliance' && s.completed).length,
      color: '#f59e0b'
    },
    {
      name: 'Operational',
      total: steps.filter(s => s.category === 'operational').length,
      completed: steps.filter(s => s.category === 'operational' && s.completed).length,
      color: '#8b5cf6'
    },
  ];

  const completionData = [
    { name: 'Completed', value: completedSteps, color: '#10b981' },
    { name: 'Pending', value: totalSteps - completedSteps, color: '#ef4444' },
  ];

  const timelineData = steps.slice(0, 8).map((step, index) => ({
    name: step.name.substring(0, 15) + '...',
    progress: step.completed ? 100 : 0,
    day: index + 1
  }));

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="heading-company-formation">Company Formation Guide</h1>
              <p className="text-lg text-muted-foreground">Complete UK company registration and setup tracker</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide 
              config={AI_TOOL_CONFIG} 
              onComplete={handleAiComplete}
              onSwitchToTraditional={() => setMode('traditional')}
              userTier={userTier}
            />
          ) : (
          <>
          <ToolUtilityBar
            toolId="company-formation"
            toolName="Company Formation Guide"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            onSmartTips={() => setShowSmartTips(!showSmartTips)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {showSmartTips && (
            <Card className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Smart Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getSmartTips().map((tip, i) => (
                    <li key={i} className="text-sm flex gap-2" data-testid={`text-smart-tip-${i}`}>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {showActionPlan && (
            <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  4-Week Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateActionPlan().map((item, i) => (
                    <div key={i} className="border-l-4 border-green-500 pl-4" data-testid={`action-plan-week-${i}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{item.week}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.priority === 'Critical' 
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                        }`}>{item.priority}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-company-formation">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="type" data-testid="tab-type">Company Type</TabsTrigger>
              <TabsTrigger value="steps" data-testid="tab-steps">Formation Steps</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                      <p className="text-3xl font-bold" data-testid="text-progress-percentage">{progressPercentage}%</p>
                      <Progress value={progressPercentage} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Completed Steps</p>
                      <p className="text-3xl font-bold" data-testid="text-completed-steps">{completedSteps}/{totalSteps}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{Math.round((completedSteps / totalSteps) * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Critical Steps</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-critical-steps">{criticalCompleted}/{criticalTotal}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {criticalCompleted === criticalTotal ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm">{criticalCompleted === criticalTotal ? 'Complete' : 'Pending'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Company Type</p>
                      <p className="text-lg font-bold" data-testid="text-selected-company-type">
                        {companyType ? COMPANY_TYPES.find(t => t.id === companyType)?.name.split('(')[1]?.replace(')', '') || 'Selected' : 'Not Set'}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {companyType ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!companyType && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a company type to begin the formation process. Visit the Company Type tab to review options.
                  </AlertDescription>
                </Alert>
              )}

              {companyType && criticalCompleted < criticalTotal && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have {criticalTotal - criticalCompleted} critical steps remaining. These must be completed for proper company formation.
                  </AlertDescription>
                </Alert>
              )}

              {progressPercentage === 100 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Congratulations! You have completed all formation steps. Ensure all documentation is organized for your visa application.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Formation Timeline (First 8 Steps)</CardTitle>
                  <CardDescription>Track progress through critical formation stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#3b82f6">
                        {timelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="type" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Company Type</CardTitle>
                  <CardDescription>Choose the legal structure that best suits your business needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={companyType} onValueChange={(value) => setCompanyType(value as CompanyType)}>
                    <div className="space-y-4">
                      {COMPANY_TYPES.map((type) => (
                        <Card key={type.id} className={`p-4 cursor-pointer transition-all hover-elevate ${
                          companyType === type.id ? 'border-primary border-2' : ''
                        }`} onClick={() => setCompanyType(type.id)} data-testid={`card-company-type-${type.id}`}>
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={type.id} id={type.id} className="mt-1" data-testid={`radio-company-type-${type.id}`} />
                            <div className="flex-1">
                              <Label htmlFor={type.id} className="text-lg font-bold cursor-pointer">{type.name}</Label>
                              <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                              <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm">
                                <div>
                                  <span className="font-semibold">Directors:</span> {type.minDirectors}+
                                </div>
                                <div>
                                  <span className="font-semibold">Liability:</span> {type.liability}
                                </div>
                                <div>
                                  <span className="font-semibold">Tax:</span> {type.taxRate}
                                </div>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="font-semibold">Setup Cost:</span> {type.setup}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {companyType === 'ltd' && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent choice. Limited companies are the most common structure for UK Innovation Visa applications due to limited liability protection and professional credibility.
                  </AlertDescription>
                </Alert>
              )}

              {(companyType === 'sole-trader' || companyType === 'partnership') && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Note: This structure provides unlimited liability. For innovation visa applications, endorsing bodies typically prefer limited companies which demonstrate more substantial business operations.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="steps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Formation Checklist</CardTitle>
                  <CardDescription>Complete all steps to properly establish your UK company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <Card key={step.id} className={`p-4 border-l-4 ${
                        step.priority === 'critical' ? 'border-l-red-500' : 
                        step.priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500'
                      }`} data-testid={`card-formation-step-${step.id}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={step.id}
                            checked={step.completed}
                            onCheckedChange={() => toggleStep(step.id)}
                            className="mt-1"
                            data-testid={`checkbox-step-${step.id}`}
                          />
                          <div className="flex-1">
                            <Label htmlFor={step.id} className="text-base font-semibold cursor-pointer">
                              {index + 1}. {step.name}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className={`px-2 py-0.5 rounded ${
                                step.category === 'legal' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                                step.category === 'financial' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                step.category === 'compliance' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                              }`}>
                                {step.category.toUpperCase()}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${
                                step.priority === 'critical' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                                step.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}>
                                {step.priority.toUpperCase()}
                              </span>
                              <span className="text-muted-foreground">
                                Est. {step.estimatedDays} {step.estimatedDays === 1 ? 'day' : 'days'}
                              </span>
                            </div>
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
                    <CardTitle>Completion Status</CardTitle>
                    <CardDescription>Overall formation progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={completionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progress by Category</CardTitle>
                    <CardDescription>Steps completed in each category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#10b981" name="Completed" />
                        <Bar dataKey="total" fill="#ef4444" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed progress by formation category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categoryData.map((cat) => (
                      <Card key={cat.name} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{cat.name}</h4>
                          <span className="text-sm text-muted-foreground">{cat.completed}/{cat.total}</span>
                        </div>
                        <Progress value={(cat.completed / cat.total) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round((cat.completed / cat.total) * 100)}% complete
                        </p>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    GOV.UK Companies House Requirements 2025
                  </CardTitle>
                  <CardDescription>Official requirements for UK company registration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Registration Fees</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Online (same-day):</strong> £12 - Company registered within 24 hours</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Postal:</strong> £40 - Processing takes 8-10 working days</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Same-day service:</strong> £100 - Company registered same working day (if submitted before 3pm)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Required Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Company Name:</strong> Must be unique, not identical to existing companies, and not contain restricted words</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Registered Office:</strong> UK address for official correspondence (cannot be PO Box)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Directors:</strong> At least one director aged 16 or over (natural person)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Shareholders:</strong> At least one shareholder (can be same person as director)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Share Capital:</strong> Statement of capital and initial shareholdings</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>PSC Register:</strong> People with Significant Control (25%+ ownership or voting rights)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Memorandum:</strong> Document signed by initial shareholders agreeing to form company</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Articles of Association:</strong> Rules for running the company</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Ongoing Compliance Requirements</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Confirmation Statement:</strong> Annual filing within 14 days of review date (£13 online, £40 postal)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Annual Accounts:</strong> File within 9 months of financial year-end (private companies)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Change Notifications:</strong> Report changes to directors, address, shares within 14 days</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Statutory Registers:</strong> Maintain registers of directors, shareholders, PSCs, secretaries</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Key Tax Deadlines</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Corporation Tax Registration:</strong> Within 3 months of starting business activity</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>PAYE Registration:</strong> Before first employee payday</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>VAT Registration:</strong> If annual turnover exceeds £90,000 (2025 threshold)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p><strong>Corporation Tax Payment:</strong> 9 months and 1 day after accounting period end</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                      <strong>For UK Innovation Visa Applicants:</strong> Your Certificate of Incorporation is a critical document for your visa application. Ensure you form a limited company (Ltd or PLC) as this demonstrates substantial business operations to endorsing bodies.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                  <CardDescription>Helpful links and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold">Companies House</p>
                      <p className="text-muted-foreground">Register and manage your company</p>
                      <p className="text-blue-600 dark:text-blue-400">www.gov.uk/government/organisations/companies-house</p>
                    </div>
                    <div>
                      <p className="font-semibold">HMRC Business Taxes</p>
                      <p className="text-muted-foreground">Register for Corporation Tax, VAT, PAYE</p>
                      <p className="text-blue-600 dark:text-blue-400">www.gov.uk/business-tax</p>
                    </div>
                    <div>
                      <p className="font-semibold">Intellectual Property Office</p>
                      <p className="text-muted-foreground">Protect trademarks and patents</p>
                      <p className="text-blue-600 dark:text-blue-400">www.gov.uk/government/organisations/intellectual-property-office</p>
                    </div>
                    <div>
                      <p className="font-semibold">Information Commissioner's Office</p>
                      <p className="text-muted-foreground">Data protection registration</p>
                      <p className="text-blue-600 dark:text-blue-400">ico.org.uk</p>
                    </div>
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
