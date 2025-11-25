import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Shield, Scale, Users, Building, Briefcase } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type LegalTemplate = {
  id: string;
  name: string;
  category: 'Employment' | 'Governance' | 'IP' | 'Commercial' | 'Data Protection' | 'Compliance';
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
  ukLegalReference: string;
  pages: number;
  completed: boolean;
};

const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: 'emp-1',
    name: 'Employment Contract Template',
    category: 'Employment',
    description: 'Written statement of employment particulars compliant with Employment Rights Act 1996',
    priority: 'Critical',
    ukLegalReference: 'Employment Rights Act 1996 s.1',
    pages: 8,
    completed: false
  },
  {
    id: 'emp-2',
    name: 'Offer Letter Template',
    category: 'Employment',
    description: 'Formal job offer including key terms, start date, salary, and conditions',
    priority: 'High',
    ukLegalReference: 'Employment Rights Act 1996',
    pages: 3,
    completed: false
  },
  {
    id: 'emp-3',
    name: 'Confidentiality & NDA Agreement',
    category: 'Employment',
    description: 'Employee confidentiality and non-disclosure obligations during and post-employment',
    priority: 'Critical',
    ukLegalReference: 'Common law duty of confidentiality',
    pages: 4,
    completed: false
  },
  {
    id: 'emp-4',
    name: 'Termination Letter Template',
    category: 'Employment',
    description: 'Lawful termination notices compliant with statutory notice periods',
    priority: 'Medium',
    ukLegalReference: 'Employment Rights Act 1996 s.86',
    pages: 2,
    completed: false
  },
  {
    id: 'emp-5',
    name: 'Disciplinary & Grievance Procedures',
    category: 'Employment',
    description: 'ACAS Code compliant procedures for handling workplace disputes and misconduct',
    priority: 'High',
    ukLegalReference: 'Employment Act 2008, ACAS Code of Practice',
    pages: 6,
    completed: false
  },
  {
    id: 'gov-1',
    name: 'Articles of Association',
    category: 'Governance',
    description: 'Company constitutional document defining governance, share rights, and director powers',
    priority: 'Critical',
    ukLegalReference: 'Companies Act 2006 s.18',
    pages: 12,
    completed: false
  },
  {
    id: 'gov-2',
    name: 'Shareholders Agreement',
    category: 'Governance',
    description: 'Rights, obligations, and restrictions among company shareholders',
    priority: 'Critical',
    ukLegalReference: 'Companies Act 2006',
    pages: 15,
    completed: false
  },
  {
    id: 'gov-3',
    name: 'Founder Agreement',
    category: 'Governance',
    description: 'Equity split, vesting schedules, IP assignment, and founder responsibilities',
    priority: 'Critical',
    ukLegalReference: 'Contract law',
    pages: 10,
    completed: false
  },
  {
    id: 'gov-4',
    name: 'Board Meeting Minutes Template',
    category: 'Governance',
    description: 'Record of board decisions and resolutions for statutory compliance',
    priority: 'High',
    ukLegalReference: 'Companies Act 2006 s.248',
    pages: 3,
    completed: false
  },
  {
    id: 'gov-5',
    name: 'Directors Service Agreement',
    category: 'Governance',
    description: 'Terms of appointment for executive directors including remuneration and duties',
    priority: 'High',
    ukLegalReference: 'Companies Act 2006 s.188',
    pages: 8,
    completed: false
  },
  {
    id: 'ip-1',
    name: 'IP Assignment Agreement',
    category: 'IP',
    description: 'Transfer of intellectual property rights from founders/employees to company',
    priority: 'Critical',
    ukLegalReference: 'Patents Act 1977, Copyright Designs and Patents Act 1988',
    pages: 6,
    completed: false
  },
  {
    id: 'ip-2',
    name: 'Software Licence Agreement',
    category: 'IP',
    description: 'Terms for licensing proprietary software to customers or partners',
    priority: 'High',
    ukLegalReference: 'Contract law, Copyright Designs and Patents Act 1988',
    pages: 8,
    completed: false
  },
  {
    id: 'ip-3',
    name: 'Trade Secret Protection Policy',
    category: 'IP',
    description: 'Internal policy for identifying and protecting trade secrets and confidential information',
    priority: 'High',
    ukLegalReference: 'Trade Secrets (Enforcement, etc.) Regulations 2018',
    pages: 5,
    completed: false
  },
  {
    id: 'ip-4',
    name: 'Trademark Licence Agreement',
    category: 'IP',
    description: 'Terms for licensing company trademarks to third parties with quality control',
    priority: 'Medium',
    ukLegalReference: 'Trade Marks Act 1994',
    pages: 7,
    completed: false
  },
  {
    id: 'com-1',
    name: 'Standard Customer Contract',
    category: 'Commercial',
    description: 'B2B or B2C terms governing product/service provision, payment, and liability',
    priority: 'Critical',
    ukLegalReference: 'Contract law, Consumer Rights Act 2015',
    pages: 12,
    completed: false
  },
  {
    id: 'com-2',
    name: 'Service Level Agreement (SLA)',
    category: 'Commercial',
    description: 'Performance standards, uptime guarantees, and remedies for service failures',
    priority: 'High',
    ukLegalReference: 'Contract law',
    pages: 7,
    completed: false
  },
  {
    id: 'com-3',
    name: 'Supplier Agreement',
    category: 'Commercial',
    description: 'Terms with suppliers covering delivery, quality, pricing, and liability',
    priority: 'High',
    ukLegalReference: 'Contract law, Sale of Goods Act 1979',
    pages: 9,
    completed: false
  },
  {
    id: 'com-4',
    name: 'Advisor Agreement',
    category: 'Commercial',
    description: 'Terms for engaging business advisors including equity, fees, and confidentiality',
    priority: 'High',
    ukLegalReference: 'Contract law',
    pages: 6,
    completed: false
  },
  {
    id: 'com-5',
    name: 'Partnership Agreement',
    category: 'Commercial',
    description: 'Joint venture or strategic partnership terms, revenue sharing, and exit provisions',
    priority: 'Medium',
    ukLegalReference: 'Contract law, Partnership Act 1890',
    pages: 10,
    completed: false
  },
  {
    id: 'com-6',
    name: 'Reseller Agreement',
    category: 'Commercial',
    description: 'Terms for third parties to resell your products or services with territorial rights',
    priority: 'Medium',
    ukLegalReference: 'Contract law, Competition Act 1998',
    pages: 11,
    completed: false
  },
  {
    id: 'data-1',
    name: 'Privacy Policy',
    category: 'Data Protection',
    description: 'UK GDPR compliant privacy notice for website/app users detailing data processing',
    priority: 'Critical',
    ukLegalReference: 'UK GDPR 2018, Data Protection Act 2018',
    pages: 8,
    completed: false
  },
  {
    id: 'data-2',
    name: 'Data Processing Agreement (DPA)',
    category: 'Data Protection',
    description: 'GDPR-compliant terms for processors handling personal data on your behalf',
    priority: 'Critical',
    ukLegalReference: 'UK GDPR Art.28',
    pages: 12,
    completed: false
  },
  {
    id: 'data-3',
    name: 'Data Breach Response Plan',
    category: 'Data Protection',
    description: 'Procedure for detecting, reporting, and managing personal data breaches',
    priority: 'High',
    ukLegalReference: 'UK GDPR Art.33-34',
    pages: 6,
    completed: false
  },
  {
    id: 'data-4',
    name: 'Data Subject Access Request (DSAR) Template',
    category: 'Data Protection',
    description: 'Process and forms for handling individual rights requests under GDPR',
    priority: 'High',
    ukLegalReference: 'UK GDPR Art.15',
    pages: 4,
    completed: false
  },
  {
    id: 'data-5',
    name: 'Data Retention Policy',
    category: 'Data Protection',
    description: 'Schedule for how long different data types are retained and deletion procedures',
    priority: 'High',
    ukLegalReference: 'UK GDPR Art.5(1)(e)',
    pages: 5,
    completed: false
  },
  {
    id: 'comp-1',
    name: 'Terms of Service',
    category: 'Compliance',
    description: 'User terms for website/app covering acceptable use, liability, and dispute resolution',
    priority: 'Critical',
    ukLegalReference: 'Contract law, Consumer Rights Act 2015',
    pages: 10,
    completed: false
  },
  {
    id: 'comp-2',
    name: 'Cookie Policy',
    category: 'Compliance',
    description: 'PECR-compliant disclosure of cookie usage and consent mechanism',
    priority: 'Critical',
    ukLegalReference: 'PECR 2003, UK GDPR',
    pages: 4,
    completed: false
  },
  {
    id: 'comp-3',
    name: 'Anti-Bribery & Corruption Policy',
    category: 'Compliance',
    description: 'Internal policy prohibiting bribery and ensuring Bribery Act 2010 compliance',
    priority: 'High',
    ukLegalReference: 'Bribery Act 2010',
    pages: 5,
    completed: false
  },
  {
    id: 'comp-4',
    name: 'Whistleblowing Policy',
    category: 'Compliance',
    description: 'Protected disclosure procedure for employees to report wrongdoing',
    priority: 'Medium',
    ukLegalReference: 'Employment Rights Act 1996 Part IVA',
    pages: 4,
    completed: false
  },
  {
    id: 'comp-5',
    name: 'Health & Safety Policy',
    category: 'Compliance',
    description: 'Written H&S policy required for employers with 5+ employees',
    priority: 'High',
    ukLegalReference: 'Health and Safety at Work Act 1974 s.2(3)',
    pages: 6,
    completed: false
  },
  {
    id: 'comp-6',
    name: 'Acceptable Use Policy',
    category: 'Compliance',
    description: 'Rules governing employee use of company IT systems and internet access',
    priority: 'Medium',
    ukLegalReference: 'Computer Misuse Act 1990',
    pages: 5,
    completed: false
  }
];

export default function LegalTemplates() {
  const [templates, setTemplates] = useState<LegalTemplate[]>(LEGAL_TEMPLATES);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const totalTemplates = templates.length;
  const completedTemplates = templates.filter(t => t.completed).length;
  const legalReadinessScore = Math.round((completedTemplates / totalTemplates) * 100);

  const criticalTemplates = templates.filter(t => t.priority === 'Critical');
  const criticalCompleted = criticalTemplates.filter(t => t.completed).length;
  const criticalScore = Math.round((criticalCompleted / criticalTemplates.length) * 100);

  const highTemplates = templates.filter(t => t.priority === 'High');
  const highCompleted = highTemplates.filter(t => t.completed).length;

  const mediumTemplates = templates.filter(t => t.priority === 'Medium');
  const mediumCompleted = mediumTemplates.filter(t => t.completed).length;

  const categoryData = [
    { name: 'Employment', value: templates.filter(t => t.category === 'Employment').length, color: '#3b82f6' },
    { name: 'Governance', value: templates.filter(t => t.category === 'Governance').length, color: '#8b5cf6' },
    { name: 'IP', value: templates.filter(t => t.category === 'IP').length, color: '#10b981' },
    { name: 'Commercial', value: templates.filter(t => t.category === 'Commercial').length, color: '#f59e0b' },
    { name: 'Data Protection', value: templates.filter(t => t.category === 'Data Protection').length, color: '#ec4899' },
    { name: 'Compliance', value: templates.filter(t => t.category === 'Compliance').length, color: '#6366f1' },
  ];

  const completionData = [
    { status: 'Completed', count: completedTemplates, color: '#10b981' },
    { status: 'Pending', count: totalTemplates - completedTemplates, color: '#ef4444' },
  ];

  const priorityData = [
    { 
      priority: 'Critical', 
      completed: criticalCompleted,
      pending: criticalTemplates.length - criticalCompleted,
      total: criticalTemplates.length,
      color: '#ef4444'
    },
    { 
      priority: 'High',
      completed: highCompleted,
      pending: highTemplates.length - highCompleted,
      total: highTemplates.length,
      color: '#f59e0b'
    },
    { 
      priority: 'Medium',
      completed: mediumCompleted,
      pending: mediumTemplates.length - mediumCompleted,
      total: mediumTemplates.length,
      color: '#3b82f6'
    },
  ];

  const categoryCompletionData = categoryData.map(cat => {
    const categoryTemplates = templates.filter(t => t.category === cat.name);
    const completed = categoryTemplates.filter(t => t.completed).length;
    return {
      category: cat.name,
      completed,
      pending: categoryTemplates.length - completed,
      total: categoryTemplates.length
    };
  });

  const getSerializedState = () => {
    return {
      templates,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('templates' in state) setTemplates(state.templates);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'legal-templates_handoff';
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
      const saved = localStorage.getItem('legal-templates-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('legal-templates-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('legal-templates-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];

    if (criticalScore < 100) {
      tips.push('Critical legal documents missing - prioritize Employment Contracts, Articles of Association, Shareholders Agreement, IP Assignment, Privacy Policy, DPA, Terms of Service, and Cookie Policy before endorsement application');
    }

    if (!templates.find(t => t.id === 'emp-1')?.completed) {
      tips.push('Employment contracts required within 2 months of hire under Employment Rights Act 1996 - failure risks tribunal claims and penalties up to £5,000 per employee');
    }

    if (!templates.find(t => t.id === 'gov-1')?.completed && !templates.find(t => t.id === 'gov-2')?.completed) {
      tips.push('Articles of Association and Shareholders Agreement are critical for investor confidence and endorsing body approval - demonstrates professional corporate governance');
    }

    if (!templates.find(t => t.id === 'ip-1')?.completed) {
      tips.push('IP Assignment Agreement essential to prove company owns its intellectual property - critical for Innovator Founder visa endorsement. Without this, endorsing bodies will question IP ownership');
    }

    if (!templates.find(t => t.id === 'data-1')?.completed || !templates.find(t => t.id === 'data-2')?.completed) {
      tips.push('UK GDPR compliance mandatory - Privacy Policy and DPA required if processing personal data. ICO fines up to £17.5m or 4% of global turnover for serious breaches');
    }

    if (!templates.find(t => t.id === 'comp-1')?.completed || !templates.find(t => t.id === 'comp-2')?.completed) {
      tips.push('Terms of Service and Cookie Policy legally required for any UK website/app - absence risks regulatory action and undermines credibility with endorsing bodies');
    }

    if (legalReadinessScore < 50) {
      tips.push('Less than 50% legal documentation complete - significant risk to visa application and business operations. Immediate legal counsel recommended to address critical gaps');
    }

    if (legalReadinessScore >= 75 && criticalScore === 100) {
      tips.push('Strong legal foundation established - ensure all documents reviewed by qualified UK solicitor before endorsement application to catch jurisdiction-specific issues and ensure enforceability');
    }

    if (!templates.find(t => t.id === 'com-1')?.completed) {
      tips.push('Standard Customer Contract protects revenue, defines liability, and demonstrates commercial maturity to endorsing bodies - essential for proving business viability');
    }

    if (templates.filter(t => t.category === 'Employment' && t.completed).length === 0) {
      tips.push('No employment documentation in place - if hiring staff, immediate exposure to employment tribunal claims, HMRC penalties, and failure to comply with Working Time Regulations');
    }

    if (!templates.find(t => t.id === 'gov-3')?.completed) {
      tips.push('Founder Agreement prevents future disputes over equity, IP ownership, and responsibilities - critical for multi-founder startups seeking endorsement');
    }

    if (templates.filter(t => t.category === 'Data Protection' && t.completed).length < 3) {
      tips.push('Incomplete data protection framework - UK GDPR requires comprehensive policies, procedures, and agreements. Data breaches without proper procedures risk massive ICO fines');
    }

    if (completedTemplates > 0 && legalReadinessScore < 100) {
      tips.push('Consider legal document review insurance (Professional Indemnity) - protects against claims arising from inadequate documentation or advice. Many endorsing bodies expect this');
    }

    return tips.slice(0, 10);
  };

  const generateActionPlan = () => {
    return [
      { week: "Week 1", action: "Engage UK corporate solicitor specializing in startup law and immigration - obtain quotes and confirm expertise in Innovator Founder visa documentation requirements", priority: "Critical" },
      { week: "Week 1", action: "Draft and finalize Articles of Association and Shareholders Agreement - required for Companies House filing and endorsing body review", priority: "Critical" },
      { week: "Week 1-2", action: "Prepare IP Assignment Agreements for all founders and employees - sign and date before endorsement application with witnessed signatures", priority: "Critical" },
      { week: "Week 2", action: "Draft UK GDPR-compliant Privacy Policy and Cookie Policy - publish on website before processing any personal data", priority: "Critical" },
      { week: "Week 2", action: "Create employment contract templates compliant with Employment Rights Act 1996 - include all statutory particulars (minimum 10 essential terms)", priority: "Critical" },
      { week: "Week 2", action: "Prepare Data Processing Agreements for any third-party processors (hosting, analytics, CRM, payment processors)", priority: "Critical" },
      { week: "Week 2-3", action: "Draft standard customer Terms of Service tailored to your business model - ensure Consumer Rights Act 2015 compliance for B2C transactions", priority: "High" },
      { week: "Week 3", action: "Prepare Service Level Agreement defining performance commitments, uptime guarantees, and remedies for customer-facing services", priority: "High" },
      { week: "Week 3", action: "Create advisor and consultant agreements with equity/fee terms, confidentiality clauses, and IP assignment provisions", priority: "High" },
      { week: "Week 3-4", action: "Draft supplier agreements covering delivery, quality standards, pricing, and liability limitations for critical vendors", priority: "High" },
      { week: "Week 3-4", action: "Implement internal compliance policies: Anti-Bribery, Whistleblowing, Health & Safety (if 5+ employees), Acceptable Use Policy", priority: "High" },
      { week: "Week 4", action: "Create Founder Agreement defining equity split, vesting schedules, and founder responsibilities (if multiple founders)", priority: "High" },
      { week: "Week 4", action: "Prepare Data Retention Policy and Data Breach Response Plan - essential for UK GDPR compliance and ICO audit readiness", priority: "High" },
      { week: "Week 4", action: "Organize all legal documentation in secure repository with version control, signature tracking, and backup procedures", priority: "High" },
      { week: "Week 4", action: "Obtain Professional Indemnity Insurance and Employers Liability Insurance (if employing staff) - retain certificates for endorsement evidence", priority: "Medium" },
      { week: "Ongoing", action: "Schedule annual legal compliance review - employment law, GDPR, corporate governance, and commercial contracts require regular updates", priority: "High" },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - LEGAL TEMPLATES & COMPLIANCE REPORT
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

LEGAL READINESS SUMMARY
${'-'.repeat(80)}
Overall Legal Readiness Score: ${legalReadinessScore}%
Templates Completed: ${completedTemplates}/${totalTemplates}
Critical Templates Completed: ${criticalCompleted}/${criticalTemplates.length} (${criticalScore}%)
High Priority Completed: ${highCompleted}/${highTemplates.length}
Medium Priority Completed: ${mediumCompleted}/${mediumTemplates.length}
Status: ${legalReadinessScore >= 90 ? 'EXCELLENT' : legalReadinessScore >= 75 ? 'GOOD' : legalReadinessScore >= 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL GAPS'}

COMPLETION BY CATEGORY
${'-'.repeat(80)}
${categoryCompletionData.map(cat => {
  const percentage = Math.round((cat.completed / cat.total) * 100);
  return `${cat.category}: ${cat.completed}/${cat.total} (${percentage}%)`;
}).join('\n')}

COMPLETION BY PRIORITY
${'-'.repeat(80)}
${priorityData.map(p => {
  const percentage = Math.round((p.completed / p.total) * 100);
  return `${p.priority}: ${p.completed}/${p.total} (${percentage}%)`;
}).join('\n')}

DETAILED TEMPLATE STATUS
${'-'.repeat(80)}
${templates.map(template => `
[${template.completed ? 'X' : ' '}] ${template.name}
    Category: ${template.category}
    Priority: ${template.priority}
    UK Legal Reference: ${template.ukLegalReference}
    Description: ${template.description}
    Pages: ${template.pages}
`).join('')}

CRITICAL TEMPLATES (MUST HAVE)
${'-'.repeat(80)}
${criticalTemplates.map(t => `${t.completed ? '[X]' : '[ ]'} ${t.name} - ${t.ukLegalReference}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

UK LEGAL COMPLIANCE NOTES (2025)
${'-'.repeat(80)}

EMPLOYMENT LAW:
- Written employment contracts required within 2 months (Employment Rights Act 1996 s.1)
- Statutory notice periods: 1 week after 1 month service, 2 weeks after 2 years
- Holiday entitlement: minimum 5.6 weeks (28 days) including bank holidays
- National Minimum Wage 2025: 21+ £11.44/hour, 18-20 £8.60/hour
- Failure to provide contracts: employment tribunal claims, up to £5,000 compensation per employee
- Disciplinary procedures must follow ACAS Code - failure increases compensation by up to 25%

CORPORATE GOVERNANCE:
- Articles of Association required for all companies (Companies Act 2006 s.18)
- Shareholders Agreement governs shareholder relations (not filed at Companies House)
- Board meeting minutes must record all decisions (Companies Act 2006 s.248)
- Annual confirmation statement and accounts filing deadlines strictly enforced
- Director service agreements require shareholder approval if over 2 years (s.188)
- Late filing penalties: £150-£1,500 depending on delay, director disqualification possible

INTELLECTUAL PROPERTY:
- IP created by employees belongs to employer by default (Copyright Designs and Patents Act 1988)
- Founders must assign pre-incorporation IP to company - critical for endorsement
- Trade secrets protected under Trade Secrets Regulations 2018 - requires confidentiality measures
- Software licensing terms define permitted use, restrictions, and liability
- Trademark licences require quality control provisions to maintain registration validity

DATA PROTECTION (UK GDPR 2018):
- Privacy Policy required if processing personal data (Art.13-14)
- Data Processing Agreements mandatory for third-party processors (Art.28)
- Data breach notification: 72 hours to ICO for high-risk breaches (Art.33)
- Maximum penalties: £17.5m or 4% of global annual turnover (whichever is higher)
- Individual rights: access, rectification, erasure, portability, objection (Art.15-21)
- Data Retention Policy required - only keep data as long as necessary (Art.5)
- Annual GDPR compliance review recommended - regulations evolving constantly

CONSUMER & COMMERCIAL LAW:
- Terms of Service govern customer relationships - must be fair and transparent
- Consumer Rights Act 2015 protects B2C transactions - unfair terms are unenforceable
- Service Level Agreements define performance standards, remedies, and credits
- Supplier agreements manage supply chain risks, quality standards, and liability
- Partnership agreements require clear revenue sharing, governance, and exit terms
- Reseller agreements must comply with Competition Act 1998 (no anti-competitive clauses)

COMPLIANCE REQUIREMENTS:
- Cookie consent required under PECR 2003 before non-essential cookies placed
- Anti-Bribery Act 2010: corporate criminal offence if fail to prevent bribery (unlimited fine)
- Health & Safety policy required if 5+ employees (Health and Safety at Work Act 1974)
- Whistleblowing protections: Employment Rights Act 1996 Part IVA (protected disclosures)
- Acceptable Use Policy governs employee IT usage - Computer Misuse Act 1990 liability

ENDORSING BODY CONSIDERATIONS:
${'-'.repeat(80)}
Legal documentation demonstrates business maturity and professionalism:
- Articles of Association and Shareholders Agreement prove proper corporate structure
- IP Assignment Agreements confirm company owns its intellectual property
- Employment contracts show ability to scale team in line with business plan
- Privacy Policy and Terms of Service demonstrate regulatory compliance awareness
- Customer contracts validate revenue projections and commercial traction
- Complete legal framework strengthens credibility of endorsement application
- Professional Indemnity Insurance shows risk management maturity
- Annual legal compliance reviews demonstrate ongoing governance commitment

RECOMMENDED NEXT STEPS:
${'-'.repeat(80)}
1. Engage qualified UK corporate/commercial solicitor to review all documentation
2. Ensure all documents signed, dated, and stored securely with version control
3. Review and update annually as business evolves and laws change
4. File statutory documents with Companies House within required timeframes
5. Maintain insurance: Professional Indemnity, Public Liability, Employers Liability
6. Consider IP protection: trademarks, patents, design registration where appropriate
7. Schedule GDPR compliance audit with data protection specialist
8. Create legal document repository with access controls and backup procedures
9. Train staff on legal compliance obligations (GDPR, confidentiality, IP, etc.)
10. Engage employment law specialist if hiring staff - compliance critical

STATUTORY DEADLINES & PENALTIES:
${'-'.repeat(80)}
- Employment contracts: Within 2 months of start date (£5,000 tribunal award)
- Companies House confirmation statement: Within 14 days of due date (£150-£1,500 fine)
- Annual accounts filing: Within 9 months of year-end (£150-£7,500 fine + director disqualification)
- PAYE/NI payments: By 22nd of each month (penalties and interest)
- VAT returns (if registered): Quarterly deadlines (surcharges and interest)
- Data breach notification: Within 72 hours to ICO (£17.5m or 4% turnover fine)
- DSAR responses: Within 1 month of request (complaints to ICO)

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This report is for informational purposes only and does not constitute 
legal advice. Always consult a qualified UK solicitor for specific legal guidance.
All statutory references and penalty amounts are current as of 2025 but may change.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-templates-compliance-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-legal-templates">Legal Templates</h1>
            <p className="text-lg text-muted-foreground">Professional legal documents for UK Innovator Founder visa compliance</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-saved">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="legal-templates"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Legal Templates"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-legal-templates">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="library" data-testid="tab-library">Templates</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className={legalReadinessScore >= 90 ? "border-green-500" : legalReadinessScore >= 50 ? "border-orange-500" : "border-destructive"} data-testid="card-readiness-score">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Legal Readiness Score</p>
                      <p className="text-3xl font-bold" data-testid="text-readiness-score">{legalReadinessScore}%</p>
                      <Progress value={legalReadinessScore} className="mt-2" data-testid="progress-readiness" />
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {legalReadinessScore >= 90 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-excellent" />
                        ) : legalReadinessScore >= 50 ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" data-testid="icon-warning" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" data-testid="icon-critical" />
                        )}
                        <span className="text-sm" data-testid="text-status">
                          {legalReadinessScore >= 90 ? 'Excellent' : legalReadinessScore >= 50 ? 'Good Progress' : 'Needs Work'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-completed-count">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Completed Templates</p>
                      <p className="text-3xl font-bold text-green-600" data-testid="text-completed-count">{completedTemplates}/{totalTemplates}</p>
                      <p className="text-sm text-muted-foreground mt-2" data-testid="text-remaining-count">
                        {totalTemplates - completedTemplates} remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={criticalScore === 100 ? "border-green-500" : "border-destructive"} data-testid="card-critical-score">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Critical Documents</p>
                      <p className="text-3xl font-bold" data-testid="text-critical-score">{criticalScore}%</p>
                      <p className="text-sm text-muted-foreground mt-2" data-testid="text-critical-count">
                        {criticalCompleted}/{criticalTemplates.length} completed
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {criticalScore === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" data-testid="icon-critical-complete" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" data-testid="icon-critical-incomplete" />
                        )}
                        <span className="text-sm" data-testid="text-critical-status">{criticalScore === 100 ? 'Complete' : 'Incomplete'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {legalReadinessScore < 90 && (
                <Alert variant="destructive" data-testid="alert-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription data-testid="text-alert-message">
                    {criticalScore < 100 
                      ? `Critical legal documents missing. Complete all ${criticalTemplates.length - criticalCompleted} critical templates before endorsement application.`
                      : `${totalTemplates - completedTemplates} templates remaining. Focus on high-priority documents to strengthen legal compliance.`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {legalReadinessScore >= 90 && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-success">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400" data-testid="text-success-message">
                    Excellent legal readiness! Ensure all documents reviewed by UK solicitor before endorsement application.
                  </AlertDescription>
                </Alert>
              )}

              <Card data-testid="card-compliance-requirements">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    UK Legal Compliance Requirements
                  </CardTitle>
                  <CardDescription>Essential legal documentation for Innovator Founder visa endorsement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3" data-testid="requirement-governance">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Corporate Governance</p>
                        <p className="text-sm text-muted-foreground">Articles of Association, Shareholders Agreement, and proper board structure demonstrate professional business operations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="requirement-ip">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Intellectual Property Protection</p>
                        <p className="text-sm text-muted-foreground">IP Assignment Agreements prove company owns its innovation - critical for endorsing body approval</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="requirement-employment">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Employment Compliance</p>
                        <p className="text-sm text-muted-foreground">Contracts, offer letters, and confidentiality agreements required under Employment Rights Act 1996</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="requirement-data-protection">
                      <Building className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Data Protection & Privacy</p>
                        <p className="text-sm text-muted-foreground">UK GDPR compliance mandatory - Privacy Policy, DPA, and breach procedures required if processing personal data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="requirement-commercial">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Commercial Contracts</p>
                        <p className="text-sm text-muted-foreground">Customer contracts, supplier agreements, and partnership terms validate business operations and revenue projections</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              {categories.map(category => {
                const categoryTemplates = templates.filter(t => t.category === category);
                const categoryCompleted = categoryTemplates.filter(t => t.completed).length;
                const categoryProgress = Math.round((categoryCompleted / categoryTemplates.length) * 100);

                return (
                  <Card key={category} data-testid={`card-category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{category}</CardTitle>
                          <CardDescription data-testid={`text-category-progress-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {categoryCompleted}/{categoryTemplates.length} completed ({categoryProgress}%)
                          </CardDescription>
                        </div>
                        <Progress value={categoryProgress} className="w-32" data-testid={`progress-category-${category.toLowerCase().replace(/\s+/g, '-')}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryTemplates.map(template => (
                          <Card key={template.id} className="p-4 hover-elevate" data-testid={`card-template-${template.id}`}>
                            <div className="flex items-start gap-4">
                              <Checkbox
                                id={template.id}
                                checked={template.completed}
                                onCheckedChange={() => toggleTemplate(template.id)}
                                data-testid={`checkbox-template-${template.id}`}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={template.id}
                                  className="font-bold cursor-pointer"
                                  data-testid={`label-template-${template.id}`}
                                >
                                  {template.name}
                                  {template.priority === 'Critical' && (
                                    <span className="ml-2 text-xs text-destructive font-normal" data-testid={`badge-critical-${template.id}`}>CRITICAL</span>
                                  )}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`text-description-${template.id}`}>{template.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span data-testid={`text-reference-${template.id}`}>{template.ukLegalReference}</span>
                                  <span data-testid={`text-pages-${template.id}`}>{template.pages} pages</span>
                                  <span className="text-primary" data-testid={`text-priority-${template.id}`}>{template.priority} Priority</span>
                                </div>
                              </div>
                              {template.completed && (
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" data-testid={`icon-completed-${template.id}`} />
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-chart-category">
                  <CardHeader>
                    <CardTitle>Templates by Category</CardTitle>
                    <CardDescription>Distribution of legal documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card data-testid="card-chart-completion">
                  <CardHeader>
                    <CardTitle>Completion Status</CardTitle>
                    <CardDescription>Overall progress tracker</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={completionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="status" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {completionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-chart-priority">
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Template completion by urgency level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={priorityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="priority" type="category" width={80} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="pending" stackId="a" fill="#ef4444" name="Pending" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-chart-category-completion">
                <CardHeader>
                  <CardTitle>Category Completion Analysis</CardTitle>
                  <CardDescription>Progress by legal category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="category" className="text-xs" angle={-15} textAnchor="end" height={80} />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" fill="#ef4444" name="Pending" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-priority-breakdown">
                <CardHeader>
                  <CardTitle>Priority Breakdown</CardTitle>
                  <CardDescription>Templates by urgency level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Critical', 'High', 'Medium'].map(priority => {
                      const priorityTemplates = templates.filter(t => t.priority === priority);
                      const priorityCompleted = priorityTemplates.filter(t => t.completed).length;
                      const priorityProgress = Math.round((priorityCompleted / priorityTemplates.length) * 100);

                      return (
                        <div key={priority} data-testid={`priority-item-${priority.toLowerCase()}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{priority} Priority</span>
                            <span className="text-sm text-muted-foreground" data-testid={`text-priority-stats-${priority.toLowerCase()}`}>
                              {priorityCompleted}/{priorityTemplates.length} ({priorityProgress}%)
                            </span>
                          </div>
                          <Progress value={priorityProgress} data-testid={`progress-priority-${priority.toLowerCase()}`} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card data-testid="card-smart-tips">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>AI-powered legal compliance guidance based on your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index} data-testid={`alert-tip-${index}`}>
                        <AlertDescription className="text-sm" data-testid={`text-tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-deadlines">
                <CardHeader>
                  <CardTitle>UK Legal Compliance Deadlines 2025</CardTitle>
                  <CardDescription>Critical statutory requirements and timeframes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2" data-testid="deadline-employment-contracts">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Employment Contracts: Within 2 months of start date</p>
                        <p className="text-muted-foreground">Employment Rights Act 1996 s.1 - failure risks tribunal claims up to £5,000 per employee</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2" data-testid="deadline-companies-house">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Companies House Confirmation Statement: Within 14 days of due date</p>
                        <p className="text-muted-foreground">Late filing penalties: £150-£1,500 depending on delay, director disqualification possible</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2" data-testid="deadline-data-breach">
                      <div className="w-2 h-2 bg-orange-50 dark:bg-orange-9500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">UK GDPR Data Breach Notification: Within 72 hours to ICO</p>
                        <p className="text-muted-foreground">High-risk breaches must also notify affected individuals without undue delay - max penalty £17.5m or 4% turnover</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2" data-testid="deadline-dsar">
                      <div className="w-2 h-2 bg-orange-50 dark:bg-orange-9500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">DSAR Response: Within 1 month of receipt</p>
                        <p className="text-muted-foreground">Data Subject Access Requests under UK GDPR Art.15 - extendable by 2 months if complex</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2" data-testid="deadline-annual-accounts">
                      <div className="w-2 h-2 bg-orange-50 dark:bg-orange-9500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">Annual Accounts Filing: Within 9 months of year-end</p>
                        <p className="text-muted-foreground">Companies House penalties: £150-£7,500 depending on delay, director disqualification for persistent offenders</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2" data-testid="deadline-paye">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium">PAYE/NI Payments: By 22nd of each month</p>
                        <p className="text-muted-foreground">Automatic penalties and interest for late payment - affects credit rating and HMRC relationship</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-insurance-requirements">
                <CardHeader>
                  <CardTitle>Insurance Requirements</CardTitle>
                  <CardDescription>Statutory and recommended business insurance for visa applicants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Employers Liability Insurance (Required if employing staff)</p>
                        <p className="text-muted-foreground">Minimum £5m coverage - criminal offence to employ without it (£2,500 daily fine)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Professional Indemnity Insurance (Highly Recommended)</p>
                        <p className="text-muted-foreground">Protects against claims arising from professional advice or services - strengthens endorsement application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Public Liability Insurance (Recommended)</p>
                        <p className="text-muted-foreground">Covers injury or property damage to third parties - expected by most commercial landlords and clients</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card data-testid="card-action-plan">
                <CardHeader>
                  <CardTitle>4-Week Legal Documentation Action Plan</CardTitle>
                  <CardDescription>Prioritized timeline for completing legal compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className="p-4" data-testid={`card-action-item-${index}`}>
                        <div className="flex items-start gap-3">
                          <div className={`px-3 py-1 rounded text-xs font-bold text-white flex-shrink-0 ${
                            item.priority === 'Critical' ? 'bg-destructive' :
                            item.priority === 'High' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`} data-testid={`badge-priority-${index}`}>
                            {item.priority}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm mb-1" data-testid={`text-week-${index}`}>{item.week}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-action-${index}`}>{item.action}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-next-steps">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Recommended actions to strengthen legal position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3" data-testid="next-step-solicitor">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Engage UK Corporate Solicitor</p>
                        <p className="text-sm text-muted-foreground">Have all documents reviewed by qualified lawyer specializing in startup law and immigration before endorsement application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="next-step-repository">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Organize Document Repository</p>
                        <p className="text-sm text-muted-foreground">Maintain secure storage with version control, electronic signatures, dates, and automated backup procedures</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="next-step-review">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Schedule Annual Review</p>
                        <p className="text-sm text-muted-foreground">Update templates as business evolves and legislation changes - UK employment and GDPR laws evolve constantly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="next-step-signing">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Implement Document Signing Process</p>
                        <p className="text-sm text-muted-foreground">Use electronic signature platform (DocuSign, Adobe Sign) for audit trail and compliance evidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="next-step-insurance">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Obtain Business Insurance</p>
                        <p className="text-sm text-muted-foreground">Secure Professional Indemnity, Public Liability, and Employers Liability (if hiring) - demonstrates risk management maturity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3" data-testid="next-step-training">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Staff Legal Training</p>
                        <p className="text-sm text-muted-foreground">Train team on GDPR, confidentiality, IP protection, and whistleblowing procedures - reduces compliance risk significantly</p>
                      </div>
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
