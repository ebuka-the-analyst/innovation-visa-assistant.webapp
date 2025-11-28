import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { CheckCircle2, XCircle, AlertTriangle, FileText, FolderOpen, Calendar, TrendingUp, Clock } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'doc-organizer',
  toolName: 'Document Organizer',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you organize your visa application documents systematically. A well-organized document portfolio is crucial for endorsing body review and Home Office submission. Let me guide you through assessing your document readiness!",
  questions: [
    {
      id: 'doc-priorities',
      question: "Let's start by understanding your current document status. Which document categories have you started preparing: Business Documents, Financial Records, Innovation Evidence, Market Validation, Team Credentials, or Legal Documents?",
      hint: "List all categories you've begun work on, even if partially complete",
      fieldKey: 'document_categories',
      minLength: 20
    },
    {
      id: 'business-plan-status',
      question: "What's the current status of your Business Plan? This is the most critical document. Have you drafted it, and does it include Executive Summary, Market Analysis, Financial Projections, and Team Bios?",
      hint: "Be specific about which sections are complete and which need work",
      fieldKey: 'business_plan_status',
      minLength: 50
    },
    {
      id: 'financial-docs',
      question: "For Financial Records, do you have bank statements covering the last 6 months, source of funds documentation, and 3-year financial projections?",
      hint: "These are heavily scrutinized - mention if statements are from UK regulated banks",
      fieldKey: 'financial_docs_status',
      minLength: 40
    },
    {
      id: 'innovation-evidence',
      question: "What innovation evidence have you gathered? Do you have technical documentation, product demos/screenshots, R&D records, or any patent/IP filings?",
      hint: "Include any prototypes, architecture diagrams, or unique technology evidence",
      fieldKey: 'innovation_evidence_status',
      minLength: 40
    },
    {
      id: 'market-validation',
      question: "Describe your market validation documents. Do you have customer interview transcripts, market research reports, or letters of intent from potential customers?",
      hint: "Home Office looks for evidence of genuine market demand",
      fieldKey: 'market_validation_status',
      minLength: 40
    },
    {
      id: 'team-legal-docs',
      question: "What's the status of Team Credentials (CVs, certificates) and Legal Documents (passport, endorsement letter, Companies House registration)?",
      hint: "Endorsement letter is mandatory - mention if you've applied to an endorsing body",
      fieldKey: 'team_legal_status',
      minLength: 40
    },
    {
      id: 'deadline-concerns',
      question: "What's your target visa application date, and which documents are you most concerned about completing on time?",
      hint: "Understanding your timeline helps prioritize document preparation",
      fieldKey: 'deadline_concerns',
      minLength: 30
    }
  ],
  completionMessage: "Excellent work! I now have a comprehensive understanding of your document organization status. I'm setting up your document tracker with the appropriate priorities and deadlines based on your inputs. You can review and adjust the details in the traditional form view."
};

type DocumentStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';
type DocumentPriority = 'Critical' | 'High' | 'Medium' | 'Low';

type DocumentItem = {
  id: string;
  category: string;
  name: string;
  status: DocumentStatus;
  version: number;
  deadline: string;
  uploadDate: string;
  priority: DocumentPriority;
  checklist: string[];
  checklistCompleted: number;
  homeOfficeRequirement: string;
};

const INITIAL_DOCUMENTS: DocumentItem[] = [
  // Business Documents
  { 
    id: 'bus-1', 
    category: 'Business Documents', 
    name: 'Business Plan', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Executive Summary', 'Market Analysis', 'Financial Projections', 'Team Bios'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Comprehensive business plan demonstrating innovation, scalability, and growth potential. Must include market analysis, competitive landscape, and 3-year financial projections.'
  },
  { 
    id: 'bus-2', 
    category: 'Business Documents', 
    name: 'Companies House Certificate', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Certificate of Incorporation', 'Company Number Verified', 'Current Address Confirmed'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Valid UK company registration certificate showing active status. Company must be less than 3 years old for Innovator Founder visa.'
  },
  { 
    id: 'bus-3', 
    category: 'Business Documents', 
    name: 'Articles of Association', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['Signed Articles', 'Share Structure Defined', 'Director Powers Listed'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Company constitutional documents outlining governance, share structure, and director powers.'
  },
  { 
    id: 'bus-4', 
    category: 'Business Documents', 
    name: 'Shareholder Agreement', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['All Founders Signed', 'Equity Split Documented', 'Vesting Schedule Included'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'If multiple founders, clear documentation of equity distribution and founder agreements.'
  },

  // Financial Records
  { 
    id: 'fin-1', 
    category: 'Financial Records', 
    name: 'Bank Statements (6 months)', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['6 Months Consecutive', 'Shows Funds Available', 'Bank Letterhead Present', 'Certified Copies'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Bank statements showing available funds appropriate for your business plan. Must be dated within 3 months of application and show continuous availability.'
  },
  { 
    id: 'fin-2', 
    category: 'Financial Records', 
    name: 'Source of Funds Declaration', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Origin Explained', 'Supporting Evidence Attached', 'Accountant Certified'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Clear documentation explaining the origin of all investment funds (salary, sale of assets, inheritance, investment, etc.).'
  },
  { 
    id: 'fin-3', 
    category: 'Financial Records', 
    name: 'Financial Projections (3 years)', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Revenue Forecast', 'Cost Breakdown', 'Cash Flow Statement', 'Break-even Analysis'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Detailed 3-year financial projections with realistic assumptions, including revenue forecasts, cost breakdown, and cash flow analysis.'
  },

  // Innovation Evidence
  { 
    id: 'inn-1', 
    category: 'Innovation Evidence', 
    name: 'Technical Documentation', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Architecture Diagrams', 'Technology Stack', 'Innovation Points', 'Patents/IP'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Technical documentation demonstrating innovative approach, novel technology, or significant improvement over existing solutions.'
  },
  { 
    id: 'inn-2', 
    category: 'Innovation Evidence', 
    name: 'Product Screenshots/Demo', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Product Screenshots', 'Demo Video', 'User Interface', 'Key Features Highlighted'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Visual proof of working prototype or MVP, demonstrating product functionality and user interface.'
  },
  { 
    id: 'inn-3', 
    category: 'Innovation Evidence', 
    name: 'R&D Documentation', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['Development Timeline', 'Iterations Documented', 'Research Process', 'Test Results'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Research and development process documentation showing iterative development, testing, and refinement.'
  },

  // Market Validation
  { 
    id: 'mrk-1', 
    category: 'Market Validation', 
    name: 'Market Research Report', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['TAM/SAM/SOM Analysis', 'Credible Sources', 'Market Trends', 'Growth Projections'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Comprehensive market research with TAM/SAM/SOM analysis using credible third-party sources and industry reports.'
  },
  { 
    id: 'mrk-2', 
    category: 'Market Validation', 
    name: 'Customer Interview Transcripts', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['20+ Interviews', 'Interview Notes', 'Key Insights', 'Pain Points Identified'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Customer discovery evidence with minimum 20-30 interviews, documenting customer pain points and product-market fit validation.'
  },
  { 
    id: 'mrk-3', 
    category: 'Market Validation', 
    name: 'Letters of Intent/Pre-orders', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['Signed LOIs', 'Customer Commitments', 'Revenue Potential', 'Contact Details'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Pre-orders, letters of intent, or customer commitments demonstrating market demand for the product/service.'
  },

  // Team Credentials
  { 
    id: 'tem-1', 
    category: 'Team Credentials', 
    name: 'Founder CVs/Resumes', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['All Founders', 'Relevant Experience', 'Education Background', 'Skills Match Business'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Detailed CVs for all founders showing relevant professional background, education, and skills matching the business domain.'
  },
  { 
    id: 'tem-2', 
    category: 'Team Credentials', 
    name: 'Education Certificates', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['Degree Certificates', 'Professional Certifications', 'Verified Copies', 'English Translations'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Education certificates and professional qualifications relevant to the business venture.'
  },
  { 
    id: 'tem-3', 
    category: 'Team Credentials', 
    name: 'Advisor Letters of Support', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Medium',
    checklist: ['Advisor Bios', 'Support Letters', 'Industry Expertise', 'Commitment Level'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Letters of support from industry advisors or mentors, demonstrating credible backing and guidance.'
  },

  // Legal Documents
  { 
    id: 'leg-1', 
    category: 'Legal Documents', 
    name: 'Passport/ID Documents', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Valid Passport', 'Certified Copies', 'English Translation', 'Biometric Photo'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Valid passport and identification documents. Passport must be valid for entire visa period.'
  },
  { 
    id: 'leg-2', 
    category: 'Legal Documents', 
    name: 'Endorsement Letter', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'Critical',
    checklist: ['Endorsing Body Letter', 'Reference Number', 'Valid Date Range', 'Criteria Satisfied'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'Endorsement letter from approved endorsing body confirming business meets innovation, viability, and scalability criteria.'
  },
  { 
    id: 'leg-3', 
    category: 'Legal Documents', 
    name: 'Tuberculosis Test Certificate', 
    status: 'not-started', 
    version: 1, 
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    uploadDate: '', 
    priority: 'High',
    checklist: ['Approved Clinic', 'Test Within 6 Months', 'Certificate Number', 'Clear Result'],
    checklistCompleted: 0,
    homeOfficeRequirement: 'TB test certificate from approved testing facility (required for applicants from listed countries). Must be within 6 months of application.'
  },
];

export default function DocOrganizer() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('doc-organizer-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('organizer');
  const [savedDate, setSavedDate] = useState('');

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('doc-organizer-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('doc-organizer-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const updatedDocs = [...documents];
    
    if (answers.business_plan_status) {
      const businessPlanDoc = updatedDocs.find(d => d.id === 'bus-1');
      if (businessPlanDoc) {
        businessPlanDoc.status = answers.business_plan_status.toLowerCase().includes('complete') ? 'completed' : 'in-progress';
      }
    }
    
    if (answers.financial_docs_status) {
      const financialDocs = updatedDocs.filter(d => d.category === 'Financial Records');
      financialDocs.forEach(doc => {
        if (answers.financial_docs_status.toLowerCase().includes('bank statement')) {
          if (doc.id === 'fin-1') doc.status = 'in-progress';
        }
      });
    }
    
    if (answers.innovation_evidence_status) {
      const innovationDocs = updatedDocs.filter(d => d.category === 'Innovation Evidence');
      innovationDocs.forEach(doc => {
        doc.status = 'in-progress';
      });
    }
    
    if (answers.market_validation_status) {
      const marketDocs = updatedDocs.filter(d => d.category === 'Market Validation');
      marketDocs.forEach(doc => {
        doc.status = 'in-progress';
      });
    }
    
    setDocuments(updatedDocs);
    
    const date = new Date().toLocaleString('en-GB');
    localStorage.setItem('doc-organizer-state', JSON.stringify({
      documents: updatedDocs,
      uploadedFiles,
      activeTab: 'organizer',
      savedDate: date
    }));
    setSavedDate(date);
    
    setActiveTab('organizer');
    setMode('traditional');
  };

  const totalDocuments = documents.length;
  const notStarted = documents.filter(d => d.status === 'not-started').length;
  const inProgress = documents.filter(d => d.status === 'in-progress').length;
  const completed = documents.filter(d => d.status === 'completed').length;
  const overdue = documents.filter(d => {
    if (d.status === 'completed') return false;
    return new Date(d.deadline) < new Date();
  }).length;

  const organizationScore = Math.round((completed / totalDocuments) * 100);

  const criticalDocs = documents.filter(d => d.priority === 'Critical');
  const criticalCompleted = criticalDocs.filter(d => d.status === 'completed').length;
  const criticalScore = Math.round((criticalCompleted / criticalDocs.length) * 100);

  const updateDocument = (id: string, field: keyof DocumentItem, value: any) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === id) {
        return { ...doc, [field]: value };
      }
      return doc;
    }));
  };

  const incrementVersion = (id: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === id) {
        return { ...doc, version: doc.version + 1 };
      }
      return doc;
    }));
  };

  const toggleChecklistItem = (docId: string, itemIndex: number) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === docId) {
        const newCompleted = doc.checklistCompleted === itemIndex + 1 ? itemIndex : itemIndex + 1;
        return { ...doc, checklistCompleted: newCompleted };
      }
      return doc;
    }));
  };

  const categoryData = ['Business Documents', 'Financial Records', 'Innovation Evidence', 'Market Validation', 'Team Credentials', 'Legal Documents'].map(category => {
    const categoryDocs = documents.filter(d => d.category === category);
    const categoryCompleted = categoryDocs.filter(d => d.status === 'completed').length;
    return {
      name: category.replace(' ', '\n'),
      completed: categoryCompleted,
      total: categoryDocs.length,
      percentage: Math.round((categoryCompleted / categoryDocs.length) * 100),
      color: category === 'Business Documents' ? '#3b82f6' :
             category === 'Financial Records' ? '#10b981' :
             category === 'Innovation Evidence' ? '#8b5cf6' :
             category === 'Market Validation' ? '#f59e0b' :
             category === 'Team Credentials' ? '#ec4899' : '#6b7280'
    };
  });

  const pieData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: notStarted, color: '#ef4444' },
    { name: 'Overdue', value: overdue, color: '#dc2626' },
  ].filter(item => item.value > 0);

  const deadlineData = documents
    .filter(d => d.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 10)
    .map(doc => {
      const daysUntil = Math.ceil((new Date(doc.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      return {
        name: doc.name.length > 20 ? doc.name.substring(0, 18) + '...' : doc.name,
        days: daysUntil,
        priority: doc.priority,
        color: daysUntil < 0 ? '#dc2626' : daysUntil < 7 ? '#f59e0b' : '#10b981'
      };
    });

  const handleFileUpload = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getSerializedState = () => {
    return {
      documents,
      uploadedFiles,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('documents' in state) setDocuments(state.documents);
    if ('uploadedFiles' in state) setUploadedFiles(state.uploadedFiles);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'doc-organizer_handoff';
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
      const saved = localStorage.getItem('doc-organizer-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('doc-organizer-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('doc-organizer-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalScore < 100) {
      tips.push("Focus on completing all Critical priority documents first - these are mandatory for visa application and cannot be substituted.");
    }
    
    if (overdue > 0) {
      tips.push(`You have ${overdue} overdue document${overdue > 1 ? 's' : ''}. Prioritize these immediately to avoid application delays.`);
    }
    
    if (organizationScore < 30) {
      tips.push("Create a daily document preparation routine. Aim to complete at least 2-3 documents per week to maintain steady progress.");
    }
    
    const versioningNeeded = documents.filter(d => d.status === 'in-progress' && d.version === 1).length;
    if (versioningNeeded > 3) {
      tips.push("Track document versions carefully. Update version numbers when making significant changes to maintain clear audit trail.");
    }
    
    const checklistIncomplete = documents.filter(d => d.checklistCompleted < d.checklist.length).length;
    if (checklistIncomplete > 10) {
      tips.push("Use checklists to ensure each document meets all Home Office requirements. Complete checklist items before marking documents as finished.");
    }
    
    const financialDocs = documents.filter(d => d.category === 'Financial Records');
    const financialCompleted = financialDocs.filter(d => d.status === 'completed').length;
    if (financialCompleted < 2) {
      tips.push("Financial documentation is heavily scrutinized. Ensure all financial records are current (within 3 months) and clearly show fund availability.");
    }
    
    const endorsementDoc = documents.find(d => d.id === 'leg-2');
    if (endorsementDoc && endorsementDoc.status === 'not-started') {
      tips.push("Endorsement letter is the most critical document. Ensure you have approval from endorsing body before submitting visa application.");
    }
    
    if (uploadedFiles.length < 5) {
      tips.push("Upload supporting files directly to this organizer for centralized management. This makes handoff to advisors or legal representatives much easier.");
    }
    
    if (organizationScore >= 80) {
      tips.push("Excellent progress! Review all completed documents for accuracy, consistency, and alignment with your business narrative before final submission.");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Gather all identity documents - passport, biometric photo, TB certificate (if applicable). Ensure passport is valid for entire visa period.",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Collect UK company registration documents - Companies House certificate, Articles of Association, shareholder agreements.",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Assemble complete financial documentation - bank statements (6 months), source of funds declaration, financial projections with detailed assumptions.",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Prepare innovation evidence package - technical documentation, product demos, R&D timeline, patent/IP registrations.",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Compile market validation materials - customer interviews, market research reports, letters of intent, pre-orders.",
        priority: "Critical"
      },
      {
        week: "Week 2-3",
        action: "Organize team credentials - founder CVs, education certificates, advisor letters, LinkedIn profiles with recommendations.",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Complete business plan with all required sections - executive summary, market analysis, competitive landscape, financial projections, team bios.",
        priority: "Critical"
      },
      {
        week: "Week 3",
        action: "Create document checklist for each category ensuring all Home Office requirements are met. Verify version numbers and dates.",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Review all documents for consistency - dates should align, financials should match across documents, narrative should be coherent.",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Obtain endorsement letter from approved endorsing body. Ensure all criteria (innovation, viability, scalability) are confirmed.",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Organize documents into clear folder structure with naming convention: CATEGORY-PRIORITY-DOCUMENTNAME-VERSION-DATE.pdf",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Have immigration advisor or solicitor review complete document package for completeness, accuracy, and compliance.",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Create master index document listing all materials with descriptions, versions, dates, and relevance to visa criteria.",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Prepare digital backup in cloud storage (Google Drive, Dropbox) with organized folder structure and shared access for advisors.",
        priority: "Medium"
      },
      {
        week: "Ongoing",
        action: "Update documents as business evolves. Maintain version control and ensure all changes are documented with date stamps.",
        priority: "Medium"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - DOCUMENT ORGANIZER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

ORGANIZATION SUMMARY
${'-'.repeat(80)}
Total Documents: ${totalDocuments}
Completed: ${completed} (${organizationScore}%)
In Progress: ${inProgress}
Not Started: ${notStarted}
Overdue: ${overdue}
Critical Documents Score: ${criticalScore}%
Uploaded Files: ${uploadedFiles.length}

STATUS: ${organizationScore >= 80 ? 'READY FOR SUBMISSION' : organizationScore >= 50 ? 'GOOD PROGRESS' : 'MORE WORK NEEDED'}

DOCUMENT CHECKLIST BY CATEGORY
${'-'.repeat(80)}

${categoryData.map(cat => `
${cat.name.replace('\n', ' ')}
${'─'.repeat(40)}
Progress: ${cat.completed}/${cat.total} (${cat.percentage}%)
${documents.filter(d => d.category === cat.name.replace('\n', ' ')).map(doc => `
  [${doc.status === 'completed' ? 'COMPLETE' : doc.status === 'in-progress' ? 'IN PROGRESS' : doc.status === 'overdue' ? 'OVERDUE' : 'NOT STARTED'}] ${doc.name}
  Priority: ${doc.priority}
  Version: v${doc.version}
  Deadline: ${doc.deadline}
  ${doc.uploadDate ? `Uploaded: ${doc.uploadDate}` : 'Not uploaded'}
  Checklist: ${doc.checklistCompleted}/${doc.checklist.length} items completed
  
  Home Office Requirement:
  ${doc.homeOfficeRequirement}
  
  Checklist Items:
  ${doc.checklist.map((item, i) => `  ${i < doc.checklistCompleted ? '[X]' : '[ ]'} ${item}`).join('\n  ')}
`).join('')}`).join('\n')}

DEADLINE OVERVIEW
${'-'.repeat(80)}
${deadlineData.map(item => `${item.name}: ${item.days < 0 ? 'OVERDUE by ' + Math.abs(item.days) : item.days} day${Math.abs(item.days) !== 1 ? 's' : ''} (${item.priority})`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

HOME OFFICE SUBMISSION REQUIREMENTS
${'-'.repeat(80)}
General Requirements:
- All documents must be in English or accompanied by certified translations
- Bank statements must be dated within 3 months of application
- Financial evidence must show continuous availability of funds
- All certificates and official documents should be certified copies
- Digital submissions must be clear, legible PDF files
- File naming convention: CATEGORY-DOCUMENTNAME-VERSION-DATE.pdf

Document Organization Best Practices:
1. Create master folder with subfolders for each category
2. Use consistent naming convention across all files
3. Maintain version history for all updated documents
4. Include document index/manifest for easy navigation
5. Keep digital and physical copies in sync
6. Store backup copies in secure cloud storage
7. Share access with advisors/legal representatives

Critical Document Checklist:
□ Valid passport (covering entire visa period)
□ UK company registration (less than 3 years old)
□ Business plan (20-30 pages, comprehensive)
□ Financial evidence (appropriate for plan, verified)
□ Source of funds declaration
□ Innovation evidence (technical docs, demos, IP)
□ Market validation (customer interviews, research)
□ Team credentials (CVs, education, experience)
□ Endorsement letter (from approved body)
□ TB certificate (if applicable)

Quality Checklist:
□ All Critical priority documents completed
□ All documents dated within last 3 months (where applicable)
□ Version numbers tracked and documented
□ Checklists completed for each document
□ Narrative consistency across all materials
□ Financial figures aligned across documents
□ No spelling or grammatical errors
□ Professional formatting throughout
□ Digital backup prepared in cloud
□ Immigration advisor reviewed package

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doc-organizer-report-${Date.now()}.txt`;
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
              <h1 className="text-4xl font-bold" data-testid="heading-doc-organizer">Document Organizer</h1>
              <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
            </div>
            <p className="text-lg text-muted-foreground">Comprehensive document management for visa application</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="doc-organizer"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Document Organizer"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-doc-organizer">
              <TabsTrigger value="organizer" data-testid="tab-organizer">Organizer</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
              <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="organizer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Status</CardTitle>
                  <CardDescription>Track your document preparation progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={organizationScore >= 80 ? "border-green-500" : organizationScore >= 50 ? "border-orange-500" : "border-destructive"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Organization Score</p>
                          <p className="text-3xl font-bold" data-testid="text-organization-score">{organizationScore}%</p>
                          <Progress value={organizationScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalScore >= 100 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Docs</p>
                          <p className="text-3xl font-bold text-orange-600" data-testid="text-critical-score">{criticalScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">{criticalCompleted}/{criticalDocs.length}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={overdue > 0 ? "border-destructive" : "border-green-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Overdue</p>
                          <p className="text-3xl font-bold text-destructive" data-testid="text-overdue-count">{overdue}</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {overdue > 0 ? (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Uploaded Files</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-uploaded-count">{uploadedFiles.length}</p>
                          <p className="text-xs text-muted-foreground mt-1">of {totalDocuments}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {organizationScore < 30 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your document organization is below 30%. Create a daily preparation routine to avoid application delays.
                      </AlertDescription>
                    </Alert>
                  )}

                  {overdue > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have {overdue} overdue document{overdue > 1 ? 's' : ''}. Prioritize these immediately to prevent submission delays.
                      </AlertDescription>
                    </Alert>
                  )}

                  {organizationScore >= 80 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent progress! Review all documents for consistency before final submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="mb-4">
                    <FileUploadButton
                      config={fileUploadConfigs.documentOrganizer}
                      onFileSelected={handleFileUpload}
                      variant="secondary"
                    />
                  </div>

                  <FileList files={uploadedFiles} onRemove={handleRemoveFile} />

                  <div className="space-y-4 mt-6">
                    {['Business Documents', 'Financial Records', 'Innovation Evidence', 'Market Validation', 'Team Credentials', 'Legal Documents'].map(category => {
                      const categoryDocs = documents.filter(d => d.category === category);
                      return (
                        <Card key={category}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{category}</CardTitle>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {categoryDocs.filter(d => d.status === 'completed').length}/{categoryDocs.length}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {categoryDocs.map(doc => (
                                <Card key={doc.id} className="p-4 hover-elevate">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold">{doc.name}</h4>
                                          <span className={`text-xs px-2 py-0.5 rounded ${
                                            doc.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                                            doc.priority === 'High' ? 'bg-orange-500/10 text-orange-600' :
                                            doc.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                            'bg-gray-500/10 text-gray-600'
                                          }`}>
                                            {doc.priority}
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{doc.homeOfficeRequirement}</p>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            <span>Version: v{doc.version}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Due: {new Date(doc.deadline).toLocaleDateString('en-GB')}</span>
                                          </div>
                                        </div>

                                        <div className="mt-3">
                                          <p className="text-xs font-medium mb-1">Checklist ({doc.checklistCompleted}/{doc.checklist.length})</p>
                                          <div className="space-y-1">
                                            {doc.checklist.map((item, idx) => (
                                              <label key={idx} className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={idx < doc.checklistCompleted}
                                                  onChange={() => toggleChecklistItem(doc.id, idx)}
                                                  className="h-3 w-3"
                                                  data-testid={`checkbox-checklist-${doc.id}-${idx}`}
                                                />
                                                <span className={idx < doc.checklistCompleted ? 'line-through text-muted-foreground' : ''}>
                                                  {item}
                                                </span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <select
                                          value={doc.status}
                                          onChange={(e) => updateDocument(doc.id, 'status', e.target.value)}
                                          className={`w-32 text-xs rounded-md border px-2 py-1 ${
                                            doc.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-600' :
                                            doc.status === 'in-progress' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600' :
                                            doc.status === 'overdue' ? 'border-destructive bg-destructive/10 text-destructive' :
                                            'border-input bg-background'
                                          }`}
                                          data-testid={`select-status-${doc.id}`}
                                        >
                                          <option value="not-started">Not Started</option>
                                          <option value="in-progress">In Progress</option>
                                          <option value="completed">Completed</option>
                                        </select>

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => incrementVersion(doc.id)}
                                          className="w-32 text-xs"
                                          data-testid={`button-increment-version-${doc.id}`}
                                        >
                                          + Version
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
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
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Completion</CardTitle>
                    <CardDescription>Document completion by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="completed"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name.replace('\n', ' ')}: ${entry.completed}/${entry.total}`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Overall Progress</CardTitle>
                    <CardDescription>Document status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Days remaining for pending documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {deadlineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={deadlineData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" label={{ value: 'Days Until Deadline', position: 'insideBottom', offset: -5 }} />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip />
                        <Bar dataKey="days" fill="#3b82f6">
                          {deadlineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">All documents completed or no deadlines set</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Progress Detail</CardTitle>
                  <CardDescription>Completion percentage by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map(cat => (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{cat.name.replace('\n', ' ')}</span>
                          <span className="text-sm text-muted-foreground">{cat.completed}/{cat.total} ({cat.percentage}%)</span>
                        </div>
                        <Progress value={cat.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>AI-powered tips based on your current progress</CardDescription>
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
                  <CardTitle>Document Quality Checklist</CardTitle>
                  <CardDescription>Ensure all documents meet Home Office standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'All documents in English or with certified translations',
                      'Bank statements dated within 3 months of application',
                      'All financial figures consistent across documents',
                      'Professional formatting with no spelling errors',
                      'Clear file naming convention used throughout',
                      'Version numbers tracked for all updated documents',
                      'Digital backup prepared in cloud storage',
                      'Physical copies available for critical documents',
                      'Immigration advisor reviewed complete package',
                      'All checklists completed for each document'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{item}</p>
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
                  <CardDescription>Prioritized timeline for document organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={
                        item.priority === 'Critical' ? 'border-destructive' :
                        item.priority === 'High' ? 'border-orange-500' :
                        'border-input'
                      }>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className={`px-3 py-1 rounded text-sm font-medium ${
                                item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                                item.priority === 'High' ? 'bg-orange-500/10 text-orange-600' :
                                'bg-yellow-500/10 text-yellow-600'
                              }`}>
                                {item.week}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  item.priority === 'Critical' ? 'bg-destructive/10 text-destructive' :
                                  item.priority === 'High' ? 'bg-orange-500/10 text-orange-600' :
                                  'bg-yellow-500/10 text-yellow-600'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                              <p className="text-sm">{item.action}</p>
                            </div>
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Home Office Submission Requirements</CardTitle>
                  <CardDescription>Official requirements for UK Innovator Founder Visa application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">General Requirements</h3>
                      <div className="space-y-2 text-sm">
                        <p>All documents must meet the following criteria:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Submitted in English or accompanied by certified translations</li>
                          <li>Bank statements dated within 3 months of application</li>
                          <li>Official documents must be certified copies</li>
                          <li>Digital submissions in clear, legible PDF format</li>
                          <li>Consistent file naming convention used throughout</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Critical Document List</h3>
                      <div className="space-y-3">
                        {documents.filter(d => d.priority === 'Critical').map(doc => (
                          <div key={doc.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{doc.homeOfficeRequirement}</p>
                            </div>
                            {doc.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Document Organization Best Practices</h3>
                      <div className="space-y-2 text-sm">
                        <p>Follow these guidelines for optimal document management:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                          <li>Create master folder with category subfolders</li>
                          <li>Use naming convention: CATEGORY-PRIORITY-NAME-VERSION-DATE.pdf</li>
                          <li>Maintain version history for all updated documents</li>
                          <li>Include document index/manifest for easy navigation</li>
                          <li>Keep digital and physical copies synchronized</li>
                          <li>Store backup in secure cloud storage</li>
                          <li>Share access with advisors and legal representatives</li>
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Financial Evidence Requirements</h3>
                      <div className="space-y-2 text-sm">
                        <p>Financial documentation must demonstrate:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Investment funds appropriate for your business plan</li>
                          <li>Funds held in regulated financial institution</li>
                          <li>Clear source of funds documentation</li>
                          <li>Continuous availability throughout application period</li>
                          <li>Freely transferable to UK without restrictions</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Timeline Recommendations</h3>
                      <div className="space-y-2 text-sm">
                        <p>Recommended timeline for document preparation:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Week 1: Identity and company registration documents</li>
                          <li>Week 2: Financial records and innovation evidence</li>
                          <li>Week 3: Market validation and team credentials</li>
                          <li>Week 4: Final review, endorsement letter, and quality check</li>
                        </ul>
                      </div>
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
