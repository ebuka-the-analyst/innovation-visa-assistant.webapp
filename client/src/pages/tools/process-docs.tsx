import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { CheckCircle2, XCircle, AlertTriangle, FileText, TrendingUp, Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "process-docs",
  toolName: "Process Documentation",
  agent: "nova",
  greeting: "Hello! I'm Nova, your innovation strategist. Let's document your operational processes to demonstrate business maturity and operational excellence for your UK Innovator Founder visa application.",
  questions: [
    {
      id: "coreOps",
      question: "Describe your core operational processes - how do you deliver value to customers?",
      hint: "Include customer onboarding, order fulfillment, quality control workflows",
      fieldKey: "coreOperations",
      minLength: 120
    },
    {
      id: "finance",
      question: "What financial management processes do you have in place?",
      hint: "Include invoicing, expense approval, financial reporting procedures",
      fieldKey: "financialProcesses",
      minLength: 100
    },
    {
      id: "hr",
      question: "Describe your HR and compliance processes for managing employees.",
      hint: "Include recruitment, onboarding, performance reviews, compliance procedures",
      fieldKey: "hrProcesses",
      minLength: 100
    },
    {
      id: "product",
      question: "How do you manage product development and quality assurance?",
      hint: "Include requirements documentation, code review, testing, deployment",
      fieldKey: "productDev",
      minLength: 100
    },
    {
      id: "customer",
      question: "What customer service and support processes do you have?",
      hint: "Include support escalation, complaint resolution, feedback collection",
      fieldKey: "customerService",
      minLength: 80
    },
    {
      id: "maturity",
      question: "How mature are your processes? Are they documented, standardized, or measured?",
      hint: "Describe documentation level, standardization, and measurement practices",
      fieldKey: "processMaturity",
      minLength: 80
    }
  ],
  completionMessage: "Excellent! Your process documentation has been captured. This demonstrates the operational maturity endorsers look for in viable UK businesses."
};

type MaturityLevel = 'ad-hoc' | 'documented' | 'standardized' | 'managed' | 'optimized';
type ProcessStatus = 'not-started' | 'in-progress' | 'documented' | 'verified';

type ProcessDocument = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ProcessStatus;
  maturityLevel: MaturityLevel;
  completeness: number;
  lastUpdated: string;
  owner: string;
  criticalForVisa: boolean;
};

const INITIAL_PROCESSES: ProcessDocument[] = [
  // Core Operations
  { id: 'ops-1', name: 'Customer Onboarding Process', category: 'Core Operations', description: 'End-to-end customer acquisition and setup workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'ops-2', name: 'Order Fulfillment SOP', category: 'Core Operations', description: 'Standard operating procedure for order processing and delivery', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'ops-3', name: 'Quality Control Workflow', category: 'Core Operations', description: 'Quality assurance and testing procedures', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'ops-4', name: 'Inventory Management', category: 'Core Operations', description: 'Stock tracking and replenishment processes', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'ops-5', name: 'Vendor Management', category: 'Core Operations', description: 'Supplier onboarding, evaluation, and relationship management', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },

  // Customer Service
  { id: 'cs-1', name: 'Customer Support Escalation', category: 'Customer Service', description: 'Tiered support and escalation workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'cs-2', name: 'Complaint Resolution Process', category: 'Customer Service', description: 'Handling and resolving customer complaints', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'cs-3', name: 'Customer Feedback Loop', category: 'Customer Service', description: 'Collecting, analyzing, and acting on customer feedback', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'cs-4', name: 'Service Level Agreement (SLA) Monitoring', category: 'Customer Service', description: 'Tracking and reporting on SLA compliance', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },

  // Financial Management
  { id: 'fin-1', name: 'Invoicing and Payment Collection', category: 'Financial Management', description: 'Billing, invoicing, and accounts receivable process', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'fin-2', name: 'Expense Approval Workflow', category: 'Financial Management', description: 'Multi-level expense authorization process', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'fin-3', name: 'Financial Reporting Process', category: 'Financial Management', description: 'Monthly, quarterly, and annual financial close procedures', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'fin-4', name: 'Budget Planning and Tracking', category: 'Financial Management', description: 'Annual budgeting and variance analysis', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'fin-5', name: 'Audit and Compliance Procedures', category: 'Financial Management', description: 'Internal controls and external audit processes', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },

  // HR & Compliance
  { id: 'hr-1', name: 'Employee Onboarding', category: 'HR & Compliance', description: 'New hire orientation and integration process', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'hr-2', name: 'Performance Review Process', category: 'HR & Compliance', description: 'Annual and quarterly performance evaluation workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'hr-3', name: 'Leave Management', category: 'HR & Compliance', description: 'Holiday, sick leave, and absence tracking', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'hr-4', name: 'Recruitment and Hiring', category: 'HR & Compliance', description: 'Candidate sourcing, screening, interviewing, and offer process', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'hr-5', name: 'Health and Safety Compliance', category: 'HR & Compliance', description: 'Workplace safety protocols and incident reporting', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },

  // Product Development
  { id: 'pd-1', name: 'Product Requirements Documentation', category: 'Product Development', description: 'PRD creation and approval workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'pd-2', name: 'Sprint Planning Process', category: 'Product Development', description: 'Agile sprint planning and retrospective procedures', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'pd-3', name: 'Code Review and Deployment', category: 'Product Development', description: 'Code quality gates and production deployment workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'pd-4', name: 'Bug Triage and Resolution', category: 'Product Development', description: 'Issue prioritization and fix workflow', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'pd-5', name: 'Product Launch Checklist', category: 'Product Development', description: 'Pre-launch validation and go-live process', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },

  // Quality Assurance
  { id: 'qa-1', name: 'Testing Strategy and Execution', category: 'Quality Assurance', description: 'Test planning, execution, and defect management', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'qa-2', name: 'Continuous Integration/Deployment', category: 'Quality Assurance', description: 'Automated build, test, and deployment pipeline', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
  { id: 'qa-3', name: 'Incident Response Process', category: 'Quality Assurance', description: 'Production incident detection, triage, and resolution', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: true },
  { id: 'qa-4', name: 'Documentation Review and Update', category: 'Quality Assurance', description: 'Regular review and maintenance of all process documentation', status: 'not-started', maturityLevel: 'ad-hoc', completeness: 0, lastUpdated: '', owner: '', criticalForVisa: false },
];

const MATURITY_LEVELS = {
  'ad-hoc': { label: 'Ad-hoc', score: 1, color: '#ef4444', description: 'Processes are unpredictable, reactive, and poorly controlled' },
  'documented': { label: 'Documented', score: 2, color: '#f59e0b', description: 'Processes are characterized but inconsistently performed' },
  'standardized': { label: 'Standardized', score: 3, color: '#3b82f6', description: 'Processes are well-defined and proactively managed' },
  'managed': { label: 'Managed', score: 4, color: '#8b5cf6', description: 'Processes are measured and controlled using metrics' },
  'optimized': { label: 'Optimized', score: 5, color: '#10b981', description: 'Continuous improvement based on quantitative feedback' },
};

export default function ProcessDocs() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('process-docs-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('process-docs-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  const [processes, setProcesses] = useState<ProcessDocument[]>(INITIAL_PROCESSES);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [savedDate, setSavedDate] = useState('');

  const totalProcesses = processes.length;
  const documentedProcesses = processes.filter(p => p.status === 'documented' || p.status === 'verified').length;
  const verifiedProcesses = processes.filter(p => p.status === 'verified').length;
  const criticalProcesses = processes.filter(p => p.criticalForVisa);
  const criticalDocumented = criticalProcesses.filter(p => p.status === 'documented' || p.status === 'verified').length;

  const avgCompleteness = Math.round(processes.reduce((sum, p) => sum + p.completeness, 0) / totalProcesses);
  const avgMaturityScore = processes.reduce((sum, p) => sum + MATURITY_LEVELS[p.maturityLevel].score, 0) / totalProcesses;
  const overallMaturity = avgMaturityScore >= 4.5 ? 'optimized' : avgMaturityScore >= 3.5 ? 'managed' : avgMaturityScore >= 2.5 ? 'standardized' : avgMaturityScore >= 1.5 ? 'documented' : 'ad-hoc';

  const documentationScore = Math.round((documentedProcesses / totalProcesses) * 100);
  const criticalScore = criticalProcesses.length > 0 ? Math.round((criticalDocumented / criticalProcesses.length) * 100) : 100;
  const maturityScore = Math.round((avgMaturityScore / 5) * 100);

  const updateProcess = (id: string, field: keyof ProcessDocument, value: any) => {
    setProcesses(procs => procs.map(proc => {
      if (proc.id === id) {
        return {
          ...proc,
          [field]: value,
          lastUpdated: field === 'status' || field === 'maturityLevel' || field === 'completeness' ? new Date().toLocaleDateString('en-GB') : proc.lastUpdated
        };
      }
      return proc;
    }));
  };

  const addCustomProcess = () => {
    const newId = `custom-${Date.now()}`;
    setProcesses([...processes, {
      id: newId,
      name: 'New Process',
      category: 'Core Operations',
      description: '',
      status: 'not-started',
      maturityLevel: 'ad-hoc',
      completeness: 0,
      lastUpdated: '',
      owner: '',
      criticalForVisa: false
    }]);
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const categoryData = ['Core Operations', 'Customer Service', 'Financial Management', 'HR & Compliance', 'Product Development', 'Quality Assurance'].map(category => {
    const categoryProcs = processes.filter(p => p.category === category);
    const categoryDocumented = categoryProcs.filter(p => p.status === 'documented' || p.status === 'verified').length;
    return {
      name: category.replace(' ', '\n'),
      documented: categoryDocumented,
      total: categoryProcs.length,
      percentage: categoryProcs.length > 0 ? Math.round((categoryDocumented / categoryProcs.length) * 100) : 0,
      color: category === 'Core Operations' ? '#3b82f6' :
             category === 'Customer Service' ? '#10b981' :
             category === 'Financial Management' ? '#8b5cf6' :
             category === 'HR & Compliance' ? '#f59e0b' :
             category === 'Product Development' ? '#ec4899' : '#6b7280'
    };
  });

  const coveragePieData = categoryData.filter(c => c.documented > 0).map(c => ({
    name: c.name.replace('\n', ' '),
    value: c.documented,
    color: c.color
  }));

  const maturityDistribution = Object.entries(MATURITY_LEVELS).map(([key, value]) => ({
    level: value.label,
    count: processes.filter(p => p.maturityLevel === key).length,
    color: value.color,
    score: value.score
  })).filter(item => item.count > 0).sort((a, b) => a.score - b.score);

  const statusData = [
    { name: 'Not Started', value: processes.filter(p => p.status === 'not-started').length, color: '#ef4444' },
    { name: 'In Progress', value: processes.filter(p => p.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Documented', value: processes.filter(p => p.status === 'documented').length, color: '#3b82f6' },
    { name: 'Verified', value: processes.filter(p => p.status === 'verified').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  const handleFileUpload = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getSerializedState = () => {
    return {
      processes,
      uploadedFiles,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('processes' in state) setProcesses(state.processes);
    if ('uploadedFiles' in state) setUploadedFiles(state.uploadedFiles);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    localStorage.setItem('process-docs-mode', mode);
  }, [mode]);

  useEffect(() => {
    const handoffKey = 'process-docs_handoff';
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
      const saved = localStorage.getItem('process-docs-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newProcesses = [...processes];
    const updateProcessByCategory = (category: string, description: string) => {
      const proc = newProcesses.find(p => p.category === category && p.status === 'not-started');
      if (proc) {
        proc.description = description;
        proc.status = 'in-progress';
        proc.lastUpdated = new Date().toLocaleDateString('en-GB');
      }
    };
    if (answers.coreOperations) updateProcessByCategory('Core Operations', answers.coreOperations);
    if (answers.financialProcesses) updateProcessByCategory('Financial Management', answers.financialProcesses);
    if (answers.hrProcesses) updateProcessByCategory('HR & Compliance', answers.hrProcesses);
    if (answers.productDev) updateProcessByCategory('Product Development', answers.productDev);
    if (answers.customerService) updateProcessByCategory('Customer Service', answers.customerService);
    setProcesses(newProcesses);
    setMode('traditional');
  };

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('process-docs-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('process-docs-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalScore < 80) {
      tips.push("Focus on documenting Critical for Visa processes first - these demonstrate operational readiness to endorsing bodies and Home Office reviewers");
    }
    
    if (maturityScore < 60) {
      tips.push("Aim for at least Standardized maturity level across all processes - this shows business scalability and professional management");
    }
    
    if (documentationScore < 50) {
      tips.push("Document at least 50% of all processes before endorser submission - comprehensive process documentation is evidence of operational capability");
    }
    
    const opsProcesses = processes.filter(p => p.category === 'Core Operations');
    const opsDocumented = opsProcesses.filter(p => p.status === 'documented' || p.status === 'verified').length;
    if (opsDocumented < opsProcesses.length * 0.8) {
      tips.push("Core Operations processes are critical for visa approval - document customer onboarding, order fulfillment, and quality control workflows first");
    }
    
    const finProcesses = processes.filter(p => p.category === 'Financial Management');
    const finDocumented = finProcesses.filter(p => p.status === 'documented' || p.status === 'verified').length;
    if (finDocumented < finProcesses.length * 0.7) {
      tips.push("Financial Management processes demonstrate business viability - document invoicing, expense approval, and financial reporting procedures");
    }
    
    if (uploadedFiles.length < 5) {
      tips.push("Upload process flowcharts, SOPs, and procedure documents as supporting evidence - visual documentation strengthens your operational readiness case");
    }
    
    if (avgMaturityScore >= 4) {
      tips.push("Excellent maturity level - ensure you can demonstrate metrics tracking and continuous improvement initiatives to endorsers");
    }
    
    const unownedProcesses = processes.filter(p => !p.owner && (p.status === 'documented' || p.status === 'verified'));
    if (unownedProcesses.length > 3) {
      tips.push("Assign process owners to all documented procedures - this demonstrates clear accountability and management structure");
    }
    
    if (documentationScore >= 80 && maturityScore >= 70) {
      tips.push("Strong process documentation foundation - prepare to explain how these processes support your job creation and innovation claims");
    }
    
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Document all Critical for Visa processes - customer onboarding, order fulfillment, quality control, financial reporting, and employee onboarding",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Create process flowcharts using tools like Lucidchart, Miro, or Microsoft Visio for visual representation of workflows",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Assign process owners and document current maturity level for each core business process",
        priority: "High"
      },
      {
        week: "Week 2",
        action: "Write Standard Operating Procedures (SOPs) for all Core Operations and Financial Management processes with step-by-step instructions",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Document HR & Compliance processes - recruitment, onboarding, performance review, and health & safety procedures",
        priority: "Critical"
      },
      {
        week: "Week 2-3",
        action: "Review and standardize all documented processes - ensure consistency in format, terminology, and level of detail",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Create process metrics and KPIs showing how you measure and track operational performance",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Document Product Development and Quality Assurance processes - PRD workflow, code review, testing, and deployment procedures",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Collect evidence of process implementation - screenshots, templates, examples, training materials, and process execution logs",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Create comprehensive process documentation index with categories, owners, last update dates, and maturity levels",
        priority: "Medium"
      },
      {
        week: "Week 4",
        action: "Have external reviewer (advisor, consultant, or mentor) validate process documentation completeness and quality",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Prepare operational readiness narrative explaining how documented processes demonstrate scalability, job creation potential, and business viability",
        priority: "Critical"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - PROCESS DOCUMENTATION TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

PROCESS MATURITY SUMMARY
${'-'.repeat(80)}
Total Processes: ${totalProcesses}
Documented Processes: ${documentedProcesses} (${documentationScore}%)
Verified Processes: ${verifiedProcesses}
Critical for Visa: ${criticalProcesses.length} (${criticalDocumented} documented - ${criticalScore}%)
Average Completeness: ${avgCompleteness}%
Average Maturity Score: ${avgMaturityScore.toFixed(2)}/5.0
Overall Maturity Level: ${MATURITY_LEVELS[overallMaturity].label}
Maturity Score: ${maturityScore}%
Uploaded Supporting Files: ${uploadedFiles.length}

STATUS: ${documentationScore >= 80 && criticalScore >= 90 ? 'VISA-READY' : documentationScore >= 50 ? 'GOOD PROGRESS' : 'MORE WORK NEEDED'}

PROCESS DOCUMENTATION BY CATEGORY
${'-'.repeat(80)}

${categoryData.map(cat => `
${cat.name.replace('\n', ' ')}
${'─'.repeat(40)}
Progress: ${cat.documented}/${cat.total} (${cat.percentage}%)
${processes.filter(p => p.category === cat.name.replace('\n', ' ')).map(proc => `
  [${proc.status === 'verified' ? '✓✓' : proc.status === 'documented' ? '✓' : proc.status === 'in-progress' ? '◐' : '○'}] ${proc.name}
  Status: ${proc.status} | Maturity: ${MATURITY_LEVELS[proc.maturityLevel].label} (${MATURITY_LEVELS[proc.maturityLevel].score}/5)
  Completeness: ${proc.completeness}%${proc.criticalForVisa ? ' [CRITICAL FOR VISA]' : ''}
  Owner: ${proc.owner || 'Unassigned'}${proc.lastUpdated ? ` | Last Updated: ${proc.lastUpdated}` : ''}
  ${proc.description ? `Description: ${proc.description}` : ''}
`).join('')}`).join('\n')}

MATURITY LEVEL DISTRIBUTION
${'-'.repeat(80)}
${maturityDistribution.map(item => `${item.level} (${item.score}/5): ${item.count} processes`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

PROCESS MATURITY MODEL REFERENCE (CMMI-based)
${'-'.repeat(80)}
Level 1 - Ad-hoc (Score: 1/5):
- Processes are unpredictable, reactive, and poorly controlled
- Success depends on individual heroics
- No documentation or standardization

Level 2 - Documented (Score: 2/5):
- Processes are characterized but inconsistently performed
- Basic documentation exists but not always followed
- Some repeatability within teams

Level 3 - Standardized (Score: 3/5):
- Processes are well-defined and proactively managed
- Organization-wide standards exist
- Processes are described in standards, procedures, tools

Level 4 - Managed (Score: 4/5):
- Processes are measured and controlled using metrics
- Quantitative objectives for quality and performance
- Process performance is predictable

Level 5 - Optimized (Score: 5/5):
- Continuous improvement based on quantitative feedback
- Innovative technologies and practices adopted
- Focus on continuous process improvement

VISA OPERATIONAL READINESS REQUIREMENTS
${'-'.repeat(80)}
Critical Process Categories:
□ Core Operations - Customer onboarding, order fulfillment, quality control
□ Financial Management - Invoicing, expense approval, financial reporting, audit procedures
□ HR & Compliance - Employee onboarding, recruitment, health and safety
□ Product Development - Requirements documentation, code review, product launch
□ Quality Assurance - Testing strategy, incident response

Documentation Standards:
□ Each process has clear step-by-step written procedures
□ Process flowcharts visualize workflows
□ Process owners assigned with clear accountability
□ Metrics and KPIs defined for process measurement
□ Evidence of process execution (templates, examples, logs)
□ Regular review and update schedule established

Maturity Expectations:
□ At least 80% of critical processes at Standardized level or higher
□ Overall average maturity score of 3.0/5.0 or above
□ All Core Operations and Financial Management at Documented minimum
□ Clear roadmap for process improvement to Managed/Optimized levels

Endorser Evidence Package:
□ Process documentation index with all procedures catalogued
□ Process flowcharts and visual workflow diagrams
□ SOP templates and actual execution examples
□ Process metrics dashboard showing operational performance
□ Process improvement initiatives and continuous improvement evidence
□ Team training materials for documented processes

SUPPORTING DOCUMENTATION CHECKLIST
${'-'.repeat(80)}
${uploadedFiles.length > 0 ? uploadedFiles.map(file => `✓ ${file.name} (${file.category || 'Uncategorized'})`).join('\n') : 'No files uploaded yet'}

NEXT STEPS FOR VISA APPLICATION
${'-'.repeat(80)}
1. Complete documentation of all Critical for Visa processes (Target: 100%)
2. Achieve minimum Standardized maturity level for core business processes
3. Create comprehensive process metrics dashboard showing KPIs and performance
4. Gather visual evidence (flowcharts, screenshots, examples) for all documented processes
5. Prepare operational readiness narrative explaining how processes support business plan
6. Have immigration advisor or mentor review process documentation completeness
7. Create process improvement roadmap showing path to Managed/Optimized maturity
8. Document team training and process adoption evidence
9. Compile process documentation evidence package for endorser submission
10. Maintain process documentation as living documents with regular updates

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-documentation-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold mb-2" data-testid="heading-process-docs">Process Documentation Tracker</h1>
              <p className="text-lg text-muted-foreground">Document business processes and demonstrate operational readiness for visa application</p>
              {savedDate && (
                <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
              )}
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          <ToolUtilityBar
            toolId="process-docs"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Process Documentation Tracker"
          />

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-process-docs">
              <TabsTrigger value="tracker" data-testid="tab-tracker">Tracker</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
              <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="tracker" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Process Maturity Overview</CardTitle>
                  <CardDescription>Track documentation completeness and operational readiness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={documentationScore >= 80 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Documentation</p>
                          <p className="text-xl font-bold" data-testid="text-documentation-score">{documentationScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{documentedProcesses}/{totalProcesses} processes</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalScore >= 90 ? "border-green-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Score</p>
                          <p className="text-xl font-bold text-primary" data-testid="text-critical-score">{criticalScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{criticalDocumented}/{criticalProcesses.length} critical</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={maturityScore >= 60 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Maturity</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-maturity-score">{maturityScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{MATURITY_LEVELS[overallMaturity].label}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completeness</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-completeness">{avgCompleteness}%</p>
                          <Progress value={avgCompleteness} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {criticalScore < 90 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {criticalProcesses.length - criticalDocumented} critical processes remain undocumented. These are essential for demonstrating operational readiness to endorsing bodies.
                      </AlertDescription>
                    </Alert>
                  )}

                  {documentationScore >= 50 && criticalScore < 90 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Good overall progress, but focus on completing critical processes first. Endorsers prioritize core operational capabilities.
                      </AlertDescription>
                    </Alert>
                  )}

                  {documentationScore >= 80 && criticalScore >= 90 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent documentation coverage! Your process maturity demonstrates operational readiness for visa approval.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Process Documentation Library</h3>
                    <div className="flex gap-2">
                      <FileUploadButton 
                        config={fileUploadConfigs.documentOrganizer} 
                        onFileSelected={handleFileUpload}
                        variant="outline"
                        size="sm"
                        data-testid="button-upload-process-doc"
                      />
                      <Button onClick={addCustomProcess} size="sm" data-testid="button-add-process">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Process
                      </Button>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mb-4">
                      <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
                    </div>
                  )}

                  <div className="space-y-3">
                    {processes.map((proc) => (
                      <Card key={proc.id} className={proc.criticalForVisa ? "border-l-4 border-l-primary" : ""}>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-12 gap-3 items-start">
                            <div className="md:col-span-3">
                              <Label htmlFor={`proc-name-${proc.id}`} className="text-xs">Process Name</Label>
                              <Input
                                id={`proc-name-${proc.id}`}
                                value={proc.name}
                                onChange={(e) => updateProcess(proc.id, 'name', e.target.value)}
                                className="h-8 text-sm"
                                data-testid={`input-process-name-${proc.id}`}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor={`proc-category-${proc.id}`} className="text-xs">Category</Label>
                              <select
                                id={`proc-category-${proc.id}`}
                                value={proc.category}
                                onChange={(e) => updateProcess(proc.id, 'category', e.target.value)}
                                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                                data-testid={`select-category-${proc.id}`}
                              >
                                <option value="Core Operations">Core Operations</option>
                                <option value="Customer Service">Customer Service</option>
                                <option value="Financial Management">Financial Management</option>
                                <option value="HR & Compliance">HR & Compliance</option>
                                <option value="Product Development">Product Development</option>
                                <option value="Quality Assurance">Quality Assurance</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor={`proc-status-${proc.id}`} className="text-xs">Status</Label>
                              <select
                                id={`proc-status-${proc.id}`}
                                value={proc.status}
                                onChange={(e) => updateProcess(proc.id, 'status', e.target.value as ProcessStatus)}
                                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                                data-testid={`select-status-${proc.id}`}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="documented">Documented</option>
                                <option value="verified">Verified</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor={`proc-maturity-${proc.id}`} className="text-xs">Maturity Level</Label>
                              <select
                                id={`proc-maturity-${proc.id}`}
                                value={proc.maturityLevel}
                                onChange={(e) => updateProcess(proc.id, 'maturityLevel', e.target.value as MaturityLevel)}
                                className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                                data-testid={`select-maturity-${proc.id}`}
                              >
                                <option value="ad-hoc">Ad-hoc (1)</option>
                                <option value="documented">Documented (2)</option>
                                <option value="standardized">Standardized (3)</option>
                                <option value="managed">Managed (4)</option>
                                <option value="optimized">Optimized (5)</option>
                              </select>
                            </div>

                            <div className="md:col-span-1">
                              <Label htmlFor={`proc-completeness-${proc.id}`} className="text-xs">%</Label>
                              <Input
                                id={`proc-completeness-${proc.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={proc.completeness}
                                onChange={(e) => updateProcess(proc.id, 'completeness', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="h-8 text-sm"
                                data-testid={`input-completeness-${proc.id}`}
                              />
                            </div>

                            <div className="md:col-span-1">
                              <Label className="text-xs">Critical</Label>
                              <div className="flex items-center h-8">
                                <input
                                  type="checkbox"
                                  checked={proc.criticalForVisa}
                                  onChange={(e) => updateProcess(proc.id, 'criticalForVisa', e.target.checked)}
                                  className="h-4 w-4"
                                  data-testid={`checkbox-critical-${proc.id}`}
                                />
                              </div>
                            </div>

                            <div className="md:col-span-1 flex items-end justify-end">
                              {proc.id.startsWith('custom-') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeProcess(proc.id)}
                                  className="h-8 w-8"
                                  data-testid={`button-remove-${proc.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="md:col-span-6">
                              <Label htmlFor={`proc-owner-${proc.id}`} className="text-xs">Process Owner</Label>
                              <Input
                                id={`proc-owner-${proc.id}`}
                                value={proc.owner}
                                onChange={(e) => updateProcess(proc.id, 'owner', e.target.value)}
                                placeholder="Name or role"
                                className="h-8 text-sm"
                                data-testid={`input-owner-${proc.id}`}
                              />
                            </div>

                            <div className="md:col-span-6">
                              <Label htmlFor={`proc-description-${proc.id}`} className="text-xs">Description</Label>
                              <Textarea
                                id={`proc-description-${proc.id}`}
                                value={proc.description}
                                onChange={(e) => updateProcess(proc.id, 'description', e.target.value)}
                                placeholder="Brief description of the process"
                                className="h-8 min-h-8 text-sm resize-none"
                                rows={1}
                                data-testid={`textarea-description-${proc.id}`}
                              />
                            </div>
                          </div>

                          {proc.lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-2">Last updated: {proc.lastUpdated}</p>
                          )}
                        </CardContent>
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
                    <CardTitle>Process Coverage by Category</CardTitle>
                    <CardDescription>Distribution of documented processes across business areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {coveragePieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={coveragePieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {coveragePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Document processes to see coverage distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maturity Level Distribution</CardTitle>
                    <CardDescription>Process maturity across the organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {maturityDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={maturityDistribution} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="level" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="count" name="Processes">
                            {maturityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Document processes to see maturity distribution</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Status</CardTitle>
                    <CardDescription>Current state of process documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Track process status to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Completion Progress</CardTitle>
                    <CardDescription>Documentation progress by business category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value} processes`} />
                        <Bar dataKey="documented" name="Documented" fill="#10b981" />
                        <Bar dataKey="total" name="Total" fill="#cbd5e1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Process Maturity Model (CMMI-based)</CardTitle>
                  <CardDescription>Understanding maturity levels for visa readiness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(MATURITY_LEVELS).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: value.color }}
                        />
                        <div>
                          <p className="font-medium">{value.label} (Score: {value.score}/5)</p>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Tips for Process Documentation</CardTitle>
                  <CardDescription>AI-powered recommendations based on your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Process Documentation Best Practices</CardTitle>
                  <CardDescription>Industry standards for operational excellence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Use Visual Flowcharts</p>
                        <p className="text-sm text-muted-foreground">Create process flow diagrams using Lucidchart, Miro, or Microsoft Visio - visual documentation is more compelling than text-only SOPs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Assign Clear Ownership</p>
                        <p className="text-sm text-muted-foreground">Every process should have a designated owner responsible for maintenance and execution - demonstrates management structure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Include Metrics and KPIs</p>
                        <p className="text-sm text-muted-foreground">Document how you measure process performance - shows data-driven management and operational maturity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Provide Real Examples</p>
                        <p className="text-sm text-muted-foreground">Include templates, screenshots, and actual execution evidence - makes documentation credible and implementable</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Regular Review Schedule</p>
                        <p className="text-sm text-muted-foreground">Set quarterly or bi-annual process review dates - demonstrates continuous improvement and living documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Version Control</p>
                        <p className="text-sm text-muted-foreground">Track document versions and change history - shows process evolution and professional documentation management</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Process Documentation Action Plan</CardTitle>
                  <CardDescription>Prioritized roadmap to achieve visa-ready operational readiness</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={item.priority === 'Critical' ? 'border-l-4 border-l-destructive' : item.priority === 'High' ? 'border-l-4 border-l-orange-500' : ''}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                              item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                              item.priority === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-600' :
                              'bg-blue-100 dark:bg-blue-950 text-blue-600'
                            }`}>
                              {item.priority}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm mb-1">{item.week}</p>
                              <p className="text-sm text-muted-foreground">{item.action}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline Milestones</CardTitle>
                  <CardDescription>Key checkpoints for process documentation completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Week 1 Checkpoint</p>
                        <p className="text-sm text-muted-foreground">All critical processes identified and documented at basic level</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Week 2 Checkpoint</p>
                        <p className="text-sm text-muted-foreground">SOPs written for Core Operations and Financial Management</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Week 3 Checkpoint</p>
                        <p className="text-sm text-muted-foreground">All processes at Standardized maturity level minimum, metrics defined</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Week 4 Completion</p>
                        <p className="text-sm text-muted-foreground">Complete evidence package ready for endorser review</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visa Operational Readiness Requirements</CardTitle>
                  <CardDescription>Process documentation standards for endorsing body approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Critical Process Categories</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.category === 'Core Operations' && (p.status === 'documented' || p.status === 'verified')).length >= 3 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">Core Operations</p>
                            <p className="text-sm text-muted-foreground">Customer onboarding, order fulfillment, quality control - minimum 3 processes documented</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.category === 'Financial Management' && (p.status === 'documented' || p.status === 'verified')).length >= 3 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">Financial Management</p>
                            <p className="text-sm text-muted-foreground">Invoicing, expense approval, financial reporting, audit procedures - minimum 3 processes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.category === 'HR & Compliance' && (p.status === 'documented' || p.status === 'verified')).length >= 2 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">HR & Compliance</p>
                            <p className="text-sm text-muted-foreground">Employee onboarding, recruitment, health and safety - minimum 2 processes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.category === 'Product Development' && (p.status === 'documented' || p.status === 'verified')).length >= 2 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">Product Development</p>
                            <p className="text-sm text-muted-foreground">Requirements documentation, code review, product launch - minimum 2 processes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.category === 'Quality Assurance' && (p.status === 'documented' || p.status === 'verified')).length >= 1 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">Quality Assurance</p>
                            <p className="text-sm text-muted-foreground">Testing strategy, incident response - minimum 1 process</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Documentation Standards</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            documentedProcesses >= totalProcesses * 0.5 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">Each process has clear step-by-step written procedures</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            uploadedFiles.length >= 5 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">Process flowcharts visualize workflows (minimum 5 uploaded)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => p.owner && (p.status === 'documented' || p.status === 'verified')).length >= documentedProcesses * 0.8 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">Process owners assigned with clear accountability (80% of documented processes)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-sm">Metrics and KPIs defined for process measurement</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-sm">Evidence of process execution (templates, examples, logs)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-sm">Regular review and update schedule established</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Maturity Expectations</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            (criticalProcesses.filter(p => MATURITY_LEVELS[p.maturityLevel].score >= 3).length / criticalProcesses.length) >= 0.8 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">At least 80% of critical processes at Standardized level or higher</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            avgMaturityScore >= 3.0 ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">Overall average maturity score of 3.0/5.0 or above (currently {avgMaturityScore.toFixed(1)}/5.0)</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            processes.filter(p => (p.category === 'Core Operations' || p.category === 'Financial Management') && MATURITY_LEVELS[p.maturityLevel].score >= 2).length === processes.filter(p => p.category === 'Core Operations' || p.category === 'Financial Management').length ? 'text-green-500' : 'text-muted-foreground'
                          }`} />
                          <p className="text-sm">All Core Operations and Financial Management at Documented minimum</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-sm">Clear roadmap for process improvement to Managed/Optimized levels</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Endorser Evidence Package</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">Process documentation index with all procedures catalogued</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">Process flowcharts and visual workflow diagrams</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">SOP templates and actual execution examples</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">Process metrics dashboard showing operational performance</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">Process improvement initiatives and continuous improvement evidence</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                          <p className="text-sm">Team training materials for documented processes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Process Documentation Matters for Visa Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Comprehensive process documentation demonstrates to endorsing bodies and Home Office reviewers that your business has:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Operational Capability:</strong> Clear processes show you can execute your business plan systematically</li>
                      <li><strong>Scalability Potential:</strong> Documented procedures enable growth beyond founder-dependent operations</li>
                      <li><strong>Job Creation Readiness:</strong> Standardized processes support hiring and onboarding new team members</li>
                      <li><strong>Business Viability:</strong> Professional operations management indicates sustainable business model</li>
                      <li><strong>Risk Management:</strong> Quality assurance and compliance processes show responsible business governance</li>
                      <li><strong>Investment Worthiness:</strong> Mature processes make your business more attractive to investors and partners</li>
                    </ul>
                    <p className="pt-4">
                      Endorsers evaluate whether your business can realistically achieve the growth projections in your business plan. 
                      Process documentation is tangible evidence that you have thought through operational details beyond the initial concept phase.
                    </p>
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
