import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertTriangle, Shield, FileText, Users, Scale, Building2, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ComplianceArea = {
  id: string;
  category: string;
  name: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  legalReference: string;
};

const COMPLIANCE_ITEMS: ComplianceArea[] = [
  {
    id: 'emp-contract-1',
    category: 'Employment Contracts',
    name: 'Written contract within 2 months of employment start',
    description: 'Statement of employment particulars required under Employment Rights Act 1996',
    priority: 'Critical',
    legalReference: 'Employment Rights Act 1996 s.1'
  },
  {
    id: 'emp-contract-2',
    category: 'Employment Contracts',
    name: 'Job title and duties clearly specified',
    description: 'Essential terms including role, responsibilities, and reporting structure',
    priority: 'High',
    legalReference: 'Employment Rights Act 1996'
  },
  {
    id: 'emp-contract-3',
    category: 'Employment Contracts',
    name: 'Salary, pay frequency, and calculation method stated',
    description: 'Full pay details including base salary, frequency, and calculation methodology',
    priority: 'Critical',
    legalReference: 'Employment Rights Act 1996 s.1(4)(d)'
  },
  {
    id: 'emp-contract-4',
    category: 'Employment Contracts',
    name: 'Working hours and rest breaks documented',
    description: 'Normal working hours and entitlement to rest breaks under Working Time Regulations',
    priority: 'High',
    legalReference: 'Working Time Regulations 1998'
  },
  {
    id: 'emp-contract-5',
    category: 'Employment Contracts',
    name: 'Holiday entitlement specified (minimum 5.6 weeks)',
    description: 'Statutory minimum 28 days (5.6 weeks) including bank holidays',
    priority: 'Critical',
    legalReference: 'Working Time Regulations 1998 reg.13'
  },
  {
    id: 'paye-1',
    category: 'PAYE & Tax Compliance',
    name: 'PAYE scheme registered with HMRC',
    description: 'Mandatory registration before first payday if employing staff',
    priority: 'Critical',
    legalReference: 'Income Tax (PAYE) Regulations 2003'
  },
  {
    id: 'paye-2',
    category: 'PAYE & Tax Compliance',
    name: 'Real Time Information (RTI) submissions on or before payday',
    description: 'Full Payment Submission (FPS) filed each payday via RTI',
    priority: 'Critical',
    legalReference: 'PAYE Regulations 2003 reg.67B'
  },
  {
    id: 'paye-3',
    category: 'PAYE & Tax Compliance',
    name: 'P60s issued to employees by 31 May annually',
    description: 'End of year summary of pay and deductions for previous tax year',
    priority: 'High',
    legalReference: 'Income Tax (PAYE) Regulations 2003 reg.67'
  },
  {
    id: 'paye-4',
    category: 'PAYE & Tax Compliance',
    name: 'P11D filed for benefits in kind by 6 July',
    description: 'Expenses and benefits declaration for directors and employees earning £8,500+',
    priority: 'High',
    legalReference: 'Income Tax (PAYE) Regulations 2003 reg.85'
  },
  {
    id: 'paye-5',
    category: 'PAYE & Tax Compliance',
    name: 'Payroll records maintained for minimum 3 years',
    description: 'Complete records of pay, deductions, and submissions retained',
    priority: 'Critical',
    legalReference: 'Income Tax (PAYE) Regulations 2003 reg.97'
  },
  {
    id: 'pension-1',
    category: 'Workplace Pensions',
    name: 'Auto-enrolment staging date completed',
    description: 'Eligible employees auto-enrolled into qualifying workplace pension scheme',
    priority: 'Critical',
    legalReference: 'Pensions Act 2008'
  },
  {
    id: 'pension-2',
    category: 'Workplace Pensions',
    name: 'Minimum employer contribution paid (3% from April 2019)',
    description: 'Minimum 3% employer contribution on qualifying earnings',
    priority: 'Critical',
    legalReference: 'Pensions Act 2008 s.5'
  },
  {
    id: 'pension-3',
    category: 'Workplace Pensions',
    name: 'Re-enrolment completed every 3 years',
    description: 'Employees who opted out re-assessed and re-enrolled',
    priority: 'High',
    legalReference: 'Employers Duties (Implementation) Regulations 2010'
  },
  {
    id: 'pension-4',
    category: 'Workplace Pensions',
    name: 'Declaration of compliance submitted to TPR',
    description: 'Confirmation submitted to The Pensions Regulator within 5 months',
    priority: 'Critical',
    legalReference: 'Pensions Act 2008'
  },
  {
    id: 'rtw-1',
    category: 'Right to Work',
    name: 'Right to work checks completed before employment starts',
    description: 'Document verification for all employees before first day',
    priority: 'Critical',
    legalReference: 'Immigration, Asylum and Nationality Act 2006'
  },
  {
    id: 'rtw-2',
    category: 'Right to Work',
    name: 'Acceptable documents verified and copies retained',
    description: 'Original documents checked, certified copies stored securely',
    priority: 'Critical',
    legalReference: 'Immigration Rules 2024'
  },
  {
    id: 'rtw-3',
    category: 'Right to Work',
    name: 'Follow-up checks conducted for time-limited permissions',
    description: 'Re-verification before visa/permission expiry for temporary workers',
    priority: 'Critical',
    legalReference: 'Immigration, Asylum and Nationality Act 2006'
  },
  {
    id: 'rtw-4',
    category: 'Right to Work',
    name: 'Sponsorship licence maintained (if applicable)',
    description: 'Valid sponsor licence for Skilled Worker or other sponsored routes',
    priority: 'High',
    legalReference: 'Immigration Rules Appendix Skilled Worker'
  },
  {
    id: 'nmw-1',
    category: 'National Minimum Wage',
    name: 'National Minimum Wage rates applied correctly',
    description: 'Correct age-based NMW rates: 21+ £11.44, 18-20 £8.60, Under 18 £6.40, Apprentice £6.40 (2025)',
    priority: 'Critical',
    legalReference: 'National Minimum Wage Act 1998'
  },
  {
    id: 'nmw-2',
    category: 'National Minimum Wage',
    name: 'Deductions do not reduce pay below NMW',
    description: 'No salary sacrifice, uniform costs, or other deductions causing NMW breach',
    priority: 'Critical',
    legalReference: 'National Minimum Wage Regulations 2015 reg.13'
  },
  {
    id: 'nmw-3',
    category: 'National Minimum Wage',
    name: 'NMW records retained for 3 years',
    description: 'Evidence of pay calculations and working time kept',
    priority: 'High',
    legalReference: 'National Minimum Wage Regulations 2015 reg.59'
  },
  {
    id: 'health-1',
    category: 'Health & Safety',
    name: 'Health & safety policy in place (if 5+ employees)',
    description: 'Written H&S policy required for employers with 5 or more employees',
    priority: 'Critical',
    legalReference: 'Health and Safety at Work Act 1974 s.2(3)'
  },
  {
    id: 'health-2',
    category: 'Health & Safety',
    name: 'Risk assessments completed and reviewed annually',
    description: 'Workplace hazards identified and control measures documented',
    priority: 'Critical',
    legalReference: 'Management of Health and Safety at Work Regulations 1999'
  },
  {
    id: 'health-3',
    category: 'Health & Safety',
    name: 'Accident book maintained and RIDDOR compliance',
    description: 'Accidents recorded, serious injuries/diseases reported to HSE within required timeframes',
    priority: 'High',
    legalReference: 'RIDDOR 2013'
  },
  {
    id: 'health-4',
    category: 'Health & Safety',
    name: 'Display screen equipment (DSE) assessments completed',
    description: 'Workstation assessments for computer users, adjustments made',
    priority: 'Medium',
    legalReference: 'Health and Safety (Display Screen Equipment) Regulations 1992'
  },
  {
    id: 'health-5',
    category: 'Health & Safety',
    name: 'Employers Liability Insurance in place (minimum £5m)',
    description: 'Compulsory insurance covering employee injury or illness claims',
    priority: 'Critical',
    legalReference: 'Employers Liability (Compulsory Insurance) Act 1969'
  },
  {
    id: 'equality-1',
    category: 'Equality & Discrimination',
    name: 'Equal pay audits completed (if 250+ employees)',
    description: 'Gender pay gap reporting and equal pay compliance verification',
    priority: 'High',
    legalReference: 'Equality Act 2010 (Gender Pay Gap) Regulations 2017'
  },
  {
    id: 'equality-2',
    category: 'Equality & Discrimination',
    name: 'Protected characteristics not used in recruitment/employment decisions',
    description: 'No discrimination based on age, disability, race, religion, sex, etc.',
    priority: 'Critical',
    legalReference: 'Equality Act 2010'
  },
  {
    id: 'equality-3',
    category: 'Equality & Discrimination',
    name: 'Reasonable adjustments made for disabled employees',
    description: 'Workplace modifications and support provided where needed',
    priority: 'Critical',
    legalReference: 'Equality Act 2010 s.20'
  },
  {
    id: 'data-1',
    category: 'Data Protection',
    name: 'Employee data processed lawfully under UK GDPR',
    description: 'Lawful basis established, privacy notices provided, rights respected',
    priority: 'Critical',
    legalReference: 'UK GDPR 2018'
  },
  {
    id: 'data-2',
    category: 'Data Protection',
    name: 'Data retention policy implemented',
    description: 'Employee records retained only as long as necessary, securely disposed',
    priority: 'High',
    legalReference: 'UK GDPR Art.5(1)(e)'
  },
  {
    id: 'hours-1',
    category: 'Working Time Regulations',
    name: 'Maximum 48-hour working week enforced (unless opt-out signed)',
    description: 'Average working time over 17-week period does not exceed 48 hours',
    priority: 'Critical',
    legalReference: 'Working Time Regulations 1998 reg.4'
  },
  {
    id: 'hours-2',
    category: 'Working Time Regulations',
    name: 'Daily rest of 11 consecutive hours provided',
    description: 'Minimum 11-hour rest period between working days',
    priority: 'High',
    legalReference: 'Working Time Regulations 1998 reg.10'
  },
  {
    id: 'hours-3',
    category: 'Working Time Regulations',
    name: 'Weekly rest of 24 hours provided',
    description: 'Uninterrupted 24-hour rest period each week (or 48 hours per fortnight)',
    priority: 'High',
    legalReference: 'Working Time Regulations 1998 reg.11'
  },
  {
    id: 'hours-4',
    category: 'Working Time Regulations',
    name: 'Rest breaks of 20 minutes for 6+ hour shifts',
    description: 'Uninterrupted break away from workstation for shifts exceeding 6 hours',
    priority: 'Medium',
    legalReference: 'Working Time Regulations 1998 reg.12'
  }
];

export default function HRCompliance() {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const totalItems = COMPLIANCE_ITEMS.length;
  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const complianceScore = Math.round((completedCount / totalItems) * 100);

  const criticalItems = COMPLIANCE_ITEMS.filter(item => item.priority === 'Critical');
  const criticalCompleted = criticalItems.filter(item => completedItems[item.id]).length;
  const criticalScore = Math.round((criticalCompleted / criticalItems.length) * 100);

  const highItems = COMPLIANCE_ITEMS.filter(item => item.priority === 'High');
  const highCompleted = highItems.filter(item => completedItems[item.id]).length;

  const mediumItems = COMPLIANCE_ITEMS.filter(item => item.priority === 'Medium');
  const mediumCompleted = mediumItems.filter(item => completedItems[item.id]).length;

  const getSerializedState = () => {
    return {
      completedItems,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('completedItems' in state) setCompletedItems(state.completedItems);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'hr-compliance_handoff';
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
      const saved = localStorage.getItem('hr-compliance-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('hr-compliance-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('hr-compliance-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const toggleItem = (id: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalScore < 100) {
      tips.push('Critical compliance items missing - these carry penalties up to unlimited fines and potential director disqualification under UK employment law 2025');
    }
    
    if (!completedItems['rtw-1']) {
      tips.push('Right to work checks are mandatory before employment starts - civil penalty up to £20,000 per illegal worker (2025 rates) with no statutory excuse');
    }
    
    if (!completedItems['paye-1']) {
      tips.push('Register for PAYE before first payday to avoid automatic penalties from HMRC - late registration incurs fixed penalty notices escalating daily');
    }
    
    if (!completedItems['pension-1'] || !completedItems['pension-2']) {
      tips.push('Auto-enrolment non-compliance: The Pensions Regulator can issue penalty notices of £400 fixed plus £50-£10,000 per day for persistent breaches');
    }
    
    if (!completedItems['nmw-1']) {
      tips.push('NMW underpayment: HMRC can issue penalties of 200% of arrears (capped at £20,000 per worker) plus naming and shaming on public register');
    }
    
    if (!completedItems['health-5']) {
      tips.push('Employers Liability Insurance is compulsory - operating without minimum £5m cover is a criminal offence with fines up to £2,500 per day');
    }
    
    if (!completedItems['equality-2']) {
      tips.push('Discrimination claims at employment tribunal have no cap on compensation - ensure robust equal opportunities practices and protected characteristics training');
    }
    
    if (complianceScore >= 80 && complianceScore < 100) {
      tips.push('Strong compliance foundation established - focus on remaining gaps to achieve 100% and demonstrate best practice to UK Innovator Founder visa endorsing bodies');
    }
    
    if (complianceScore === 100) {
      tips.push('Excellent HR compliance - maintain up-to-date records and review annually as UK employment law evolves (next major changes expected April 2026)');
    }

    if (!completedItems['data-1']) {
      tips.push('UK GDPR breaches can result in fines up to £17.5m or 4% of global annual turnover - ensure lawful basis, privacy notices, and employee data rights compliance');
    }

    if (!completedItems['emp-contract-1']) {
      tips.push('Written employment contracts required within 2 months of start - missing contracts expose you to tribunal claims and demonstrate weak operational governance to endorsers');
    }

    if (!completedItems['health-2']) {
      tips.push('Risk assessments are legal requirement under Management of Health and Safety at Work Regulations 1999 - missing assessments can result in enforcement notices and prosecution');
    }

    if (criticalCompleted >= criticalItems.length * 0.5 && criticalCompleted < criticalItems.length) {
      tips.push('Over 50% of critical items complete - prioritize remaining critical compliance gaps before high/medium priority items to minimize legal exposure');
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Complete right to work checks for all employees - verify original documents, retain certified copies with date of check and checker signature", 
        priority: "Critical" 
      },
      { 
        week: "Week 1", 
        action: "Register for PAYE with HMRC if not already done - you will need company UTR, directors' details, and first payday date", 
        priority: "Critical" 
      },
      { 
        week: "Week 1-2", 
        action: "Issue written employment contracts to all employees within 2 months of start date - must include all statutory particulars per Employment Rights Act 1996", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Set up auto-enrolment workplace pension scheme - select qualifying provider (NEST, Peoples Pension, etc.) and communicate duties to eligible employees", 
        priority: "Critical" 
      },
      { 
        week: "Week 2", 
        action: "Verify all employees paid at least National Minimum Wage for their age band - check salary sacrifice and deductions do not breach NMW thresholds", 
        priority: "Critical" 
      },
      { 
        week: "Week 2-3", 
        action: "Arrange Employers Liability Insurance (minimum £5m cover) and display certificate at workplace - obtain quotes from AXA, Aviva, or specialist brokers", 
        priority: "Critical" 
      },
      { 
        week: "Week 3", 
        action: "Draft and implement written health & safety policy if 5+ employees - conduct comprehensive workplace risk assessments covering all activities", 
        priority: "Critical" 
      },
      { 
        week: "Week 3", 
        action: "Implement UK GDPR compliant employee data processing - establish lawful basis, issue privacy notices, document retention policy, appoint DPO if required", 
        priority: "High" 
      },
      { 
        week: "Week 3-4", 
        action: "Establish payroll record-keeping system - maintain 3-year retention for pay, deductions, RTI submissions, P60s, P11Ds, and pension contributions", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Review working time compliance - enforce 48-hour maximum week or obtain written opt-out agreements, ensure 11-hour daily and 24-hour weekly rest periods", 
        priority: "High" 
      },
      { 
        week: "Week 4", 
        action: "Audit equality and discrimination policies - ensure protected characteristics (age, disability, race, religion, sex, etc.) not used in employment decisions", 
        priority: "High" 
      },
      { 
        week: "Ongoing", 
        action: "Submit Real Time Information (RTI) Full Payment Submission on or before each payday, file P60s by 31 May, P11Ds by 6 July annually to avoid penalties", 
        priority: "Critical" 
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - HR COMPLIANCE TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

COMPLIANCE SUMMARY
${'-'.repeat(80)}
Overall Compliance Score: ${complianceScore}%
Items Completed: ${completedCount}/${totalItems}
Critical Items Completed: ${criticalCompleted}/${criticalItems.length} (${criticalScore}%)
High Priority Items Completed: ${highCompleted}/${highItems.length}
Medium Priority Items Completed: ${mediumCompleted}/${mediumItems.length}
Status: ${complianceScore >= 90 ? 'EXCELLENT - ENDORSER READY' : complianceScore >= 75 ? 'GOOD - MINOR GAPS' : complianceScore >= 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL GAPS - URGENT ACTION REQUIRED'}

COMPLIANCE STATUS BY CATEGORY
${'-'.repeat(80)}
${Array.from(new Set(COMPLIANCE_ITEMS.map(item => item.category))).map(category => {
  const categoryItems = COMPLIANCE_ITEMS.filter(item => item.category === category);
  const categoryCompleted = categoryItems.filter(item => completedItems[item.id]).length;
  const categoryScore = Math.round((categoryCompleted / categoryItems.length) * 100);
  return `${category}: ${categoryCompleted}/${categoryItems.length} (${categoryScore}%)`;
}).join('\n')}

DETAILED COMPLIANCE CHECKLIST
${'-'.repeat(80)}
${COMPLIANCE_ITEMS.map(item => `
[${completedItems[item.id] ? 'X' : ' '}] ${item.name}
    Category: ${item.category}
    Priority: ${item.priority}
    Legal Reference: ${item.legalReference}
    Description: ${item.description}
`).join('')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

KEY UK EMPLOYMENT LAW COMPLIANCE NOTES (2025)
${'-'.repeat(80)}
National Minimum Wage Rates (April 2025):
- Age 21+: £11.44 per hour
- Age 18-20: £8.60 per hour  
- Under 18: £6.40 per hour
- Apprentice: £6.40 per hour

Critical Statutory Deadlines:
- RTI (FPS): On or before each payday
- P60: Issue by 31 May annually
- P11D: File by 6 July annually
- Auto-enrolment re-enrolment: Every 3 years from staging date
- Gender pay gap reporting: 4 April annually (if 250+ employees)
- Risk assessments: Review annually or when significant changes occur

Penalty Examples (2025 Rates):
- Illegal working: Up to £20,000 per worker (civil penalty)
- NMW underpayment: 200% of arrears (max £20,000 per worker) + public naming
- Auto-enrolment breach: £400 fixed + £50-£10,000 daily escalating penalties
- No Employers Liability Insurance: £2,500 per day (criminal offence)
- GDPR breach: Up to £17.5m or 4% of global turnover (whichever higher)
- Health & Safety breach: Unlimited fine + up to 2 years imprisonment for directors

ENDORSING BODY CONSIDERATIONS
${'-'.repeat(80)}
HR compliance demonstrates operational maturity and legal readiness to UK Innovator
Founder visa endorsing bodies (Home Office approved):
- Proper employment contracts show professional business operations and governance
- PAYE and pension compliance prove robust financial systems in place
- Right to work checks demonstrate immigration compliance awareness (critical for visa holder)
- Health & Safety policies show duty of care and risk management capability
- Equality policies demonstrate fair employment practices and inclusive culture
- Full compliance strengthens credibility of business plan team scaling projections
- Missing HR compliance can trigger endorser concerns about operational readiness

LEGAL FRAMEWORK SUMMARY
${'-'.repeat(80)}
Primary Legislation:
- Employment Rights Act 1996 (contracts, dismissal, redundancy)
- Working Time Regulations 1998 (hours, breaks, holidays)
- National Minimum Wage Act 1998 (wage floors)
- Equality Act 2010 (discrimination, protected characteristics)
- Health and Safety at Work Act 1974 (employer duties)
- Immigration, Asylum and Nationality Act 2006 (right to work)
- Pensions Act 2008 (auto-enrolment)
- UK GDPR 2018 (data protection)

Regulatory Bodies:
- HMRC (PAYE, NMW enforcement)
- The Pensions Regulator (auto-enrolment compliance)
- Health and Safety Executive (workplace safety)
- Information Commissioners Office (data protection)
- Employment Tribunal Service (disputes and claims)
- Home Office (immigration compliance)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This tool provides guidance on UK employment law compliance requirements
as of 2025. It does not constitute legal advice. Consult qualified employment law
solicitor or HR professional for specific compliance matters.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-compliance-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(COMPLIANCE_ITEMS.map(item => item.category)));
  
  const categoryData = categories.map(category => {
    const categoryItems = COMPLIANCE_ITEMS.filter(item => item.category === category);
    const categoryCompleted = categoryItems.filter(item => completedItems[item.id]).length;
    return {
      name: category.length > 20 ? category.substring(0, 18) + '...' : category,
      fullName: category,
      total: categoryItems.length,
      completed: categoryCompleted,
      pending: categoryItems.length - categoryCompleted,
    };
  });

  const priorityData = [
    {
      name: 'Critical',
      total: criticalItems.length,
      completed: criticalCompleted,
      pending: criticalItems.length - criticalCompleted,
      color: '#ef4444'
    },
    {
      name: 'High',
      total: highItems.length,
      completed: highCompleted,
      pending: highItems.length - highCompleted,
      color: '#f59e0b'
    },
    {
      name: 'Medium',
      total: mediumItems.length,
      completed: mediumCompleted,
      pending: mediumItems.length - mediumCompleted,
      color: '#3b82f6'
    }
  ];

  const overallPieData = [
    { name: 'Compliant', value: completedCount, color: '#10b981' },
    { name: 'Non-Compliant', value: totalItems - completedCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const categoryPieData = categoryData.map((cat, idx) => ({
    name: cat.name,
    value: cat.completed,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'][idx % 8]
  })).filter(item => item.value > 0);

  const riskSeverityData = priorityData.map(p => ({
    priority: p.name,
    compliant: p.completed,
    nonCompliant: p.pending
  }));

  const COLORS = {
    compliant: '#10b981',
    nonCompliant: '#ef4444',
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6'
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-hr-compliance">HR Compliance Tracker</h1>
            <p className="text-lg text-muted-foreground">UK Employment Law 2025 - Track PAYE/NI, contracts, right to work, policies compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-saved-date">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="hr-compliance"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="HR Compliance Tracker"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-hr-compliance">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="tracker" data-testid="tab-tracker">Compliance Tracker</TabsTrigger>
              <TabsTrigger value="risk" data-testid="tab-risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={complianceScore >= 90 ? "border-green-500" : complianceScore >= 75 ? "border-blue-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Overall Compliance</p>
                      <p className="text-3xl font-bold" data-testid="text-compliance-score">{complianceScore}%</p>
                      <Progress value={complianceScore} className="mt-2" data-testid="progress-compliance" />
                      <p className="text-xs text-muted-foreground mt-2">{completedCount}/{totalItems} items</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={criticalScore === 100 ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Critical Items</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-critical-score">{criticalScore}%</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {criticalScore === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-critical-complete" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" data-testid="icon-critical-incomplete" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{criticalCompleted}/{criticalItems.length} complete</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">High Priority</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-high-count">{highCompleted}/{highItems.length}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round((highCompleted / highItems.length) * 100)}% complete
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Medium Priority</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-medium-count">{mediumCompleted}/{mediumItems.length}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round((mediumCompleted / mediumItems.length) * 100)}% complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {criticalScore < 100 && (
                <Alert variant="destructive" data-testid="alert-critical-missing">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Critical compliance gaps detected. These items carry severe penalties including unlimited fines, criminal prosecution, and potential director disqualification. Address immediately.
                  </AlertDescription>
                </Alert>
              )}

              {criticalScore === 100 && complianceScore < 100 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-critical-complete">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    All critical items complete. Focus on high and medium priority items to achieve full compliance and demonstrate best practice to endorsing bodies.
                  </AlertDescription>
                </Alert>
              )}

              {complianceScore === 100 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-full-compliance">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent! Full UK employment law compliance achieved. Your HR practices meet all 2025 requirements and demonstrate operational maturity to visa endorsers.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Compliance Status</CardTitle>
                    <CardDescription>Compliant vs non-compliant items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overallPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={overallPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {overallPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance by Category</CardTitle>
                    <CardDescription>Completed items per compliance area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {categoryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Complete items to see distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>UK Employment Law Framework 2025</CardTitle>
                  <CardDescription>Key compliance areas for Innovator Founder visa holders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Employment Contracts</p>
                        <p className="text-sm text-muted-foreground">Written particulars within 2 months, statutory terms, clear duties</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">PAYE & Tax Compliance</p>
                        <p className="text-sm text-muted-foreground">HMRC registration, RTI submissions, P60/P11D filing, 3-year records</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Workplace Pensions</p>
                        <p className="text-sm text-muted-foreground">Auto-enrolment, 3% employer contribution, TPR compliance, re-enrolment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Right to Work</p>
                        <p className="text-sm text-muted-foreground">Pre-employment checks, document verification, follow-up checks, civil penalty protection</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Health & Safety</p>
                        <p className="text-sm text-muted-foreground">Written policy (5+ staff), risk assessments, RIDDOR, Employers Liability Insurance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">National Minimum Wage</p>
                        <p className="text-sm text-muted-foreground">Age-based rates, deduction limits, 3-year records, enforcement compliance</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracker" className="space-y-4">
              {categories.map(category => {
                const categoryItems = COMPLIANCE_ITEMS.filter(item => item.category === category);
                const categoryCompleted = categoryItems.filter(item => completedItems[item.id]).length;
                const categoryProgress = Math.round((categoryCompleted / categoryItems.length) * 100);

                return (
                  <Card key={category}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <CardDescription>{categoryCompleted}/{categoryItems.length} items complete ({categoryProgress}%)</CardDescription>
                        </div>
                        <Progress value={categoryProgress} className="w-32" data-testid={`progress-${category.toLowerCase().replace(/\s+/g, '-')}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            item.priority === 'Critical' ? 'border-l-red-500' :
                            item.priority === 'High' ? 'border-l-orange-500' :
                            'border-l-blue-500'
                          } bg-card hover-elevate`}
                          data-testid={`item-${item.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={item.id}
                              checked={completedItems[item.id] || false}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-1"
                              data-testid={`checkbox-${item.id}`}
                            />
                            <div className="flex-1">
                              <Label htmlFor={item.id} className="cursor-pointer">
                                <p className="font-semibold mb-1">{item.name}</p>
                                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className={`px-2 py-1 rounded ${
                                    item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                                    item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  }`} data-testid={`badge-priority-${item.id}`}>
                                    {item.priority} Priority
                                  </span>
                                  <span className="px-2 py-1 rounded bg-muted text-muted-foreground" data-testid={`badge-legal-${item.id}`}>
                                    {item.legalReference}
                                  </span>
                                </div>
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="risk" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Severity Analysis</CardTitle>
                  <CardDescription>Compliance vs non-compliance by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={riskSeverityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="priority" className="text-sm" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="compliant" fill={COLORS.compliant} name="Compliant" />
                      <Bar dataKey="nonCompliant" fill={COLORS.nonCompliant} name="Non-Compliant" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-red-500">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Critical Risk Items</CardTitle>
                    <CardDescription>{criticalItems.length - criticalCompleted} items non-compliant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {criticalItems.filter(item => !completedItems[item.id]).slice(0, 5).map(item => (
                        <div key={item.id} className="p-3 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800" data-testid={`risk-critical-${item.id}`}>
                          <p className="font-medium text-sm text-red-900 dark:text-red-100">{item.name}</p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">{item.category}</p>
                        </div>
                      ))}
                      {criticalItems.filter(item => !completedItems[item.id]).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">All critical items compliant</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-500">
                  <CardHeader>
                    <CardTitle className="text-orange-600 dark:text-orange-400">High Risk Items</CardTitle>
                    <CardDescription>{highItems.length - highCompleted} items non-compliant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {highItems.filter(item => !completedItems[item.id]).slice(0, 5).map(item => (
                        <div key={item.id} className="p-3 rounded bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800" data-testid={`risk-high-${item.id}`}>
                          <p className="font-medium text-sm text-orange-900 dark:text-orange-100">{item.name}</p>
                          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">{item.category}</p>
                        </div>
                      ))}
                      {highItems.filter(item => !completedItems[item.id]).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">All high items compliant</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500">
                  <CardHeader>
                    <CardTitle className="text-blue-600 dark:text-blue-400">Medium Risk Items</CardTitle>
                    <CardDescription>{mediumItems.length - mediumCompleted} items non-compliant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mediumItems.filter(item => !completedItems[item.id]).slice(0, 5).map(item => (
                        <div key={item.id} className="p-3 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" data-testid={`risk-medium-${item.id}`}>
                          <p className="font-medium text-sm text-blue-900 dark:text-blue-100">{item.name}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{item.category}</p>
                        </div>
                      ))}
                      {mediumItems.filter(item => !completedItems[item.id]).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">All medium items compliant</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Penalty Framework 2025</CardTitle>
                  <CardDescription>Financial and legal consequences of non-compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-2">Illegal Working</p>
                      <p className="text-sm text-red-700 dark:text-red-300">Civil penalty up to £20,000 per illegal worker. No statutory excuse if right to work checks not completed correctly.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                      <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">National Minimum Wage Breach</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">HMRC penalty of 200% of arrears (capped £20,000 per worker) plus public naming on government register.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Pension Auto-Enrolment</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">TPR fixed penalty £400, escalating £50-£10,000 per day for persistent non-compliance.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
                      <p className="font-semibold text-violet-900 dark:text-violet-100 mb-2">UK GDPR Breach</p>
                      <p className="text-sm text-violet-700 dark:text-violet-300">ICO fine up to £17.5m or 4% of global annual turnover, whichever is higher.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800">
                      <p className="font-semibold text-rose-900 dark:text-rose-100 mb-2">Health & Safety Breach</p>
                      <p className="text-sm text-rose-700 dark:text-rose-300">Unlimited fine, up to 2 years imprisonment for directors, enforcement notices, prohibition orders.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Compliance Recommendations</CardTitle>
                  <CardDescription>Context-aware guidance based on your compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 hover-elevate"
                        data-testid={`tip-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white dark:text-black flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-sm text-blue-900 dark:text-blue-100 flex-1">{tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endorsing Body Perspective</CardTitle>
                  <CardDescription>How HR compliance impacts your UK Innovator Founder visa application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      UK Innovator Founder visa endorsing bodies assess operational readiness and legal compliance as part of their evaluation. Strong HR compliance demonstrates mature business operations.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Proper employment contracts show professional governance and clear organizational structure</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>PAYE and pension compliance prove robust financial systems and tax compliance awareness</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Right to work checks demonstrate immigration compliance understanding (critical for visa holders)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Health & safety policies show duty of care and risk management capability</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Full compliance strengthens credibility of business plan team scaling projections</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week HR Compliance Action Plan</CardTitle>
                  <CardDescription>Structured roadmap to achieve full UK employment law compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          item.priority === 'Critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                          item.priority === 'High' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950' :
                          'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                        }`}
                        data-testid={`action-${index}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.priority === 'Critical' ? 'bg-red-600 text-white' :
                              item.priority === 'High' ? 'bg-orange-600 text-white' :
                              'bg-blue-600 text-white'
                            }`} data-testid={`badge-action-priority-${index}`}>
                              {item.priority}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold mb-1 text-sm">{item.week}</p>
                            <p className="text-sm">{item.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Implementation Resources</CardTitle>
                  <CardDescription>Key resources for implementing HR compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded bg-muted">
                      <p className="font-semibold mb-1">HMRC PAYE Registration</p>
                      <p className="text-muted-foreground">Register online via HMRC Business Tax Account - requires company UTR and Government Gateway account</p>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <p className="font-semibold mb-1">Workplace Pension Providers</p>
                      <p className="text-muted-foreground">NEST, The Peoples Pension, NOW Pensions, Smart Pension - compare fees and features</p>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <p className="font-semibold mb-1">Employers Liability Insurance</p>
                      <p className="text-muted-foreground">AXA, Aviva, Hiscox, Simply Business - minimum £5m cover required by law</p>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <p className="font-semibold mb-1">Right to Work Guidance</p>
                      <p className="text-muted-foreground">Home Office Employer Checking Service - verify acceptable documents and follow prescribed checking process</p>
                    </div>
                    <div className="p-3 rounded bg-muted">
                      <p className="font-semibold mb-1">Professional Support</p>
                      <p className="text-muted-foreground">Consider engaging CIPP qualified payroll bureau, CIPD certified HR consultant, or employment law solicitor</p>
                    </div>
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
