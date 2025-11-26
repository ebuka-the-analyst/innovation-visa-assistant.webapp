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
import { CheckCircle2, XCircle, AlertTriangle, FileText, Calendar, TrendingUp, Upload, FileCheck } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type DocumentStatus = 'not-started' | 'in-progress' | 'verified';

type EvidenceDocument = {
  id: string;
  category: string;
  name: string;
  status: DocumentStatus;
  uploadDate: string;
  priority: 'Critical' | 'High' | 'Medium';
  endorserRequirement: string;
};

const INITIAL_DOCUMENTS: EvidenceDocument[] = [
  // Business Documents
  { id: 'bus-1', category: 'Business Documents', name: 'Business Plan', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Comprehensive 20-30 page business plan with market analysis' },
  { id: 'bus-2', category: 'Business Documents', name: 'Companies House Certificate', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Valid UK company registration certificate' },
  { id: 'bus-3', category: 'Business Documents', name: 'Articles of Association', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Company constitutional documents' },
  { id: 'bus-4', category: 'Business Documents', name: 'Shareholder Agreement', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'If multiple founders, clear equity split documentation' },
  { id: 'bus-5', category: 'Business Documents', name: 'Intellectual Property Registration', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Patents, trademarks, or copyright registrations' },

  // Financial Records
  { id: 'fin-1', category: 'Financial Records', name: 'Bank Statements (3-6 months)', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Showing available investment funds appropriate for your business plan' },
  { id: 'fin-2', category: 'Financial Records', name: 'Source of Funds Declaration', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Clear documentation of fund origins' },
  { id: 'fin-3', category: 'Financial Records', name: 'Financial Projections (3 years)', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Detailed revenue, cost, and cash flow forecasts' },
  { id: 'fin-4', category: 'Financial Records', name: 'Investment Agreements', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'If funded, term sheets and investment contracts' },
  { id: 'fin-5', category: 'Financial Records', name: 'Tax Returns (if applicable)', status: 'not-started', uploadDate: '', priority: 'Medium', endorserRequirement: 'For existing businesses, previous tax filings' },

  // Innovation Evidence
  { id: 'inn-1', category: 'Innovation Evidence', name: 'Technology Documentation', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Technical architecture, algorithms, or novel approaches' },
  { id: 'inn-2', category: 'Innovation Evidence', name: 'Product Screenshots/Demo', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Visual proof of working prototype or MVP' },
  { id: 'inn-3', category: 'Innovation Evidence', name: 'R&D Documentation', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Research process, iterations, and development timeline' },
  { id: 'inn-4', category: 'Innovation Evidence', name: 'Innovation Comparison Matrix', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'How your solution differs from existing market options' },
  { id: 'inn-5', category: 'Innovation Evidence', name: 'Technical Whitepaper', status: 'not-started', uploadDate: '', priority: 'Medium', endorserRequirement: 'For deep tech, detailed technical documentation' },

  // Market Validation
  { id: 'mrk-1', category: 'Market Validation', name: 'Market Research Report', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'TAM/SAM/SOM analysis with credible sources' },
  { id: 'mrk-2', category: 'Market Validation', name: 'Customer Interview Transcripts', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Minimum 20-30 customer discovery interviews' },
  { id: 'mrk-3', category: 'Market Validation', name: 'Survey Results', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Quantitative validation with 50+ responses' },
  { id: 'mrk-4', category: 'Market Validation', name: 'Competitor Analysis', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Detailed comparison with 5-10 competitors' },
  { id: 'mrk-5', category: 'Market Validation', name: 'Letters of Intent', status: 'not-started', uploadDate: '', priority: 'Medium', endorserRequirement: 'Pre-orders or customer commitments' },

  // Traction Metrics
  { id: 'trc-1', category: 'Traction Metrics', name: 'User Analytics Dashboard', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Active users, retention, engagement metrics' },
  { id: 'trc-2', category: 'Traction Metrics', name: 'Revenue Evidence', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Sales records, invoices, or payment platform screenshots' },
  { id: 'trc-3', category: 'Traction Metrics', name: 'Growth Trajectory Charts', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Visual representation of user/revenue growth over time' },
  { id: 'trc-4', category: 'Traction Metrics', name: 'Customer Testimonials', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Written endorsements from satisfied customers' },
  { id: 'trc-5', category: 'Traction Metrics', name: 'Media Coverage', status: 'not-started', uploadDate: '', priority: 'Medium', endorserRequirement: 'Press mentions, awards, or recognition' },

  // Team Credentials
  { id: 'tem-1', category: 'Team Credentials', name: 'Founder CVs', status: 'not-started', uploadDate: '', priority: 'Critical', endorserRequirement: 'Detailed professional background for all founders' },
  { id: 'tem-2', category: 'Team Credentials', name: 'Education Certificates', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Degrees, certifications relevant to the business' },
  { id: 'tem-3', category: 'Team Credentials', name: 'LinkedIn Profiles', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Professional online presence with recommendations' },
  { id: 'tem-4', category: 'Team Credentials', name: 'Advisor Bios', status: 'not-started', uploadDate: '', priority: 'High', endorserRequirement: 'Credentials of advisory board members' },
  { id: 'tem-5', category: 'Team Credentials', name: 'Previous Startup Experience', status: 'not-started', uploadDate: '', priority: 'Medium', endorserRequirement: 'Evidence of prior entrepreneurial ventures' },
];

export default function EvidenceCollection() {
  const [documents, setDocuments] = useState<EvidenceDocument[]>(INITIAL_DOCUMENTS);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [savedDate, setSavedDate] = useState('');

  const totalDocuments = documents.length;
  const notStarted = documents.filter(d => d.status === 'not-started').length;
  const inProgress = documents.filter(d => d.status === 'in-progress').length;
  const verified = documents.filter(d => d.status === 'verified').length;
  const completionScore = Math.round((verified / totalDocuments) * 100);

  const criticalDocs = documents.filter(d => d.priority === 'Critical');
  const criticalVerified = criticalDocs.filter(d => d.status === 'verified').length;
  const criticalScore = Math.round((criticalVerified / criticalDocs.length) * 100);

  const updateDocumentStatus = (id: string, status: DocumentStatus) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id === id) {
        return {
          ...doc,
          status,
          uploadDate: status === 'verified' && !doc.uploadDate ? new Date().toLocaleDateString('en-GB') : doc.uploadDate
        };
      }
      return doc;
    }));
  };

  const categoryData = ['Business Documents', 'Financial Records', 'Innovation Evidence', 'Market Validation', 'Traction Metrics', 'Team Credentials'].map(category => {
    const categoryDocs = documents.filter(d => d.category === category);
    const categoryVerified = categoryDocs.filter(d => d.status === 'verified').length;
    return {
      name: category.replace(' ', '\n'),
      verified: categoryVerified,
      total: categoryDocs.length,
      percentage: Math.round((categoryVerified / categoryDocs.length) * 100),
      color: category === 'Business Documents' ? '#3b82f6' :
             category === 'Financial Records' ? '#10b981' :
             category === 'Innovation Evidence' ? '#8b5cf6' :
             category === 'Market Validation' ? '#f59e0b' :
             category === 'Traction Metrics' ? '#ec4899' : '#6b7280'
    };
  });

  const pieData = [
    { name: 'Verified', value: verified, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: notStarted, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const timelineData = [
    { week: 'Week 1', verified: Math.min(verified, 8), target: 8 },
    { week: 'Week 2', verified: Math.min(verified, 16), target: 16 },
    { week: 'Week 3', verified: Math.min(verified, 24), target: 24 },
    { week: 'Week 4', verified: Math.min(verified, 30), target: 30 },
  ];

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
    const handoffKey = 'evidence-collection_handoff';
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
      const saved = localStorage.getItem('evidence-collection-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('evidence-collection-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('evidence-collection-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (criticalScore < 100) {
      tips.push("Focus on completing all Critical priority documents first - these are mandatory for endorser review and visa application");
    }
    
    if (verified < 15) {
      tips.push("Aim to verify at least 50% of all documents before endorser submission to demonstrate thorough preparation");
    }
    
    const innovationDocs = documents.filter(d => d.category === 'Innovation Evidence');
    const innovationVerified = innovationDocs.filter(d => d.status === 'verified').length;
    if (innovationVerified < 3) {
      tips.push("Innovation Evidence is the cornerstone of your application - prioritize technical documentation, product demos, and R&D records");
    }
    
    const tractionDocs = documents.filter(d => d.category === 'Traction Metrics');
    const tractionVerified = tractionDocs.filter(d => d.status === 'verified').length;
    if (tractionVerified < 2) {
      tips.push("Traction Metrics prove market validation - collect analytics, revenue data, and customer testimonials early");
    }
    
    if (uploadedFiles.length < 10) {
      tips.push("Upload supporting files directly to this tool for centralized evidence management and easier handoff to advisors");
    }
    
    const marketDocs = documents.filter(d => d.category === 'Market Validation');
    const marketVerified = marketDocs.filter(d => d.status === 'verified').length;
    if (marketVerified < 3) {
      tips.push("Market Validation documents (customer interviews, surveys) should be comprehensive - aim for 20-30 interviews and 50+ survey responses");
    }
    
    const financialDocs = documents.filter(d => d.category === 'Financial Records');
    const financialVerified = financialDocs.filter(d => d.status === 'verified').length;
    if (financialVerified < 3) {
      tips.push("Financial Records must show clear fund availability appropriate for your plan - ensure bank statements, source of funds, and projections are complete");
    }
    
    if (completionScore >= 80) {
      tips.push("Excellent progress - review all documents for quality, accuracy, and consistency before final submission");
    }
    
    return tips.slice(0, 6);
  };

  const generateActionPlan = () => {
    return [
      {
        week: "Week 1",
        action: "Gather all Business Documents - Companies House certificate, business plan, IP registrations, shareholder agreements",
        priority: "Critical"
      },
      {
        week: "Week 1",
        action: "Compile Financial Records - bank statements (3-6 months), source of funds declaration, investment agreements, financial projections",
        priority: "Critical"
      },
      {
        week: "Week 1-2",
        action: "Document Innovation Evidence - technical architecture, product demos, R&D timeline, innovation comparison matrix",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Collect Market Validation - customer interview transcripts, survey results, market research reports, competitor analysis",
        priority: "Critical"
      },
      {
        week: "Week 2",
        action: "Assemble Traction Metrics - user analytics, revenue evidence, growth charts, customer testimonials, media coverage",
        priority: "High"
      },
      {
        week: "Week 2-3",
        action: "Prepare Team Credentials - founder CVs, education certificates, LinkedIn profiles, advisor bios, previous startup experience",
        priority: "High"
      },
      {
        week: "Week 3",
        action: "Review all Critical priority documents for completeness, accuracy, and consistency with business narrative",
        priority: "Critical"
      },
      {
        week: "Week 3",
        action: "Organize documents by category with clear file naming convention (e.g., 'FIN-001-Bank-Statements-2024.pdf')",
        priority: "High"
      },
      {
        week: "Week 3-4",
        action: "Create comprehensive evidence index document listing all materials with descriptions and relevance to visa criteria",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Have immigration advisor or mentor review complete evidence package for gaps or weaknesses",
        priority: "Critical"
      },
      {
        week: "Week 4",
        action: "Prepare digital backup of all documents in cloud storage with organized folder structure",
        priority: "High"
      },
      {
        week: "Week 4",
        action: "Final quality check - ensure all documents are current (dated within last 3-6 months where applicable)",
        priority: "Medium"
      }
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - EVIDENCE COLLECTION TRACKER
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

COLLECTION SUMMARY
${'-'.repeat(80)}
Total Documents: ${totalDocuments}
Verified: ${verified} (${completionScore}%)
In Progress: ${inProgress}
Not Started: ${notStarted}
Critical Documents Score: ${criticalScore}%
Uploaded Files: ${uploadedFiles.length}

STATUS: ${completionScore >= 80 ? 'READY FOR SUBMISSION' : completionScore >= 50 ? 'GOOD PROGRESS' : 'MORE WORK NEEDED'}

DOCUMENT CHECKLIST BY CATEGORY
${'-'.repeat(80)}

${categoryData.map(cat => `
${cat.name.replace('\n', ' ')}
${'─'.repeat(40)}
Progress: ${cat.verified}/${cat.total} (${cat.percentage}%)
${documents.filter(d => d.category === cat.name.replace('\n', ' ')).map(doc => `
  [${doc.status === 'verified' ? '✓' : doc.status === 'in-progress' ? '◐' : '○'}] ${doc.name}
  Priority: ${doc.priority}
  Status: ${doc.status}
  ${doc.uploadDate ? `Uploaded: ${doc.uploadDate}` : 'Not uploaded'}
  Requirement: ${doc.endorserRequirement}
`).join('')}`).join('\n')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `[${item.priority}] ${item.week}: ${item.action}`).join('\n')}

ENDORSER EVIDENCE REQUIREMENTS
${'-'.repeat(80)}
Business Documents:
- UK company registration (Companies House certificate required)
- Comprehensive business plan (20-30 pages minimum)
- IP protection evidence (patents, trademarks if applicable)

Financial Records:
- Appropriate investment funds for your business plan
- Clear source of funds documentation
- 3-year financial projections with realistic assumptions

Innovation Evidence:
- Technical differentiation from existing solutions
- Working prototype or MVP demonstration
- R&D documentation showing development process

Market Validation:
- Customer discovery evidence (20-30 interviews minimum)
- Quantitative survey data (50+ responses)
- Market sizing with credible third-party sources

Traction Metrics:
- Active users, retention, engagement data
- Revenue evidence (if applicable)
- Customer testimonials and letters of support

Team Credentials:
- Founder background relevant to business domain
- Education and professional qualifications
- Advisory board with industry expertise

QUALITY CHECKLIST
${'-'.repeat(80)}
□ All Critical priority documents verified
□ Bank statements dated within last 3 months
□ Financial projections include detailed assumptions
□ Innovation evidence shows clear market differentiation
□ Customer validation includes direct quotes and data
□ Traction metrics verified with screenshots or exports
□ All documents professionally formatted and error-free
□ Evidence index document created for easy navigation
□ Digital backup prepared in organized cloud storage
□ Immigration advisor reviewed complete package

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-collection-report-${Date.now()}.txt`;
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
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-evidence-collection">Evidence Collection Tracker</h1>
            <p className="text-lg text-muted-foreground">Comprehensive evidence organization for visa application</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="evidence-collection"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Evidence Collection Tracker"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-evidence-collection">
              <TabsTrigger value="tracker" data-testid="tab-tracker">Tracker</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
              <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="tracker" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Status</CardTitle>
                  <CardDescription>Track your evidence collection progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className={completionScore >= 80 ? "border-green-500" : "border-orange-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Completion</p>
                          <p className="text-3xl font-bold" data-testid="text-completion-score">{completionScore}%</p>
                          <Progress value={completionScore} className="mt-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={criticalScore === 100 ? "border-green-500" : "border-red-500"}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Critical Docs</p>
                          <p className="text-3xl font-bold text-red-600" data-testid="text-critical-score">{criticalScore}%</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {criticalScore === 100 ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-xs">{criticalVerified}/{criticalDocs.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Verified</p>
                          <p className="text-3xl font-bold text-green-600" data-testid="text-verified-count">{verified}</p>
                          <p className="text-xs text-muted-foreground mt-1">of {totalDocuments}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Uploaded Files</p>
                          <p className="text-3xl font-bold text-primary" data-testid="text-uploaded-files">{uploadedFiles.length}</p>
                          <FileUploadButton
                            config={fileUploadConfigs.evidenceCollection}
                            onFileSelected={handleFileUpload}
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {completionScore < 50 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have verified only {verified} of {totalDocuments} documents. Focus on Critical priority items first.
                      </AlertDescription>
                    </Alert>
                  )}

                  {criticalScore < 100 && completionScore >= 50 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You still have {criticalDocs.length - criticalVerified} Critical documents pending. These are mandatory for submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {completionScore >= 80 && criticalScore === 100 && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Excellent progress! Your evidence package is nearly complete. Review for quality and consistency before submission.
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadedFiles.length > 0 && (
                    <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
                  )}

                  <div className="space-y-6">
                    {categoryData.map(cat => {
                      const categoryDocs = documents.filter(d => d.category === cat.name.replace('\n', ' '));
                      return (
                        <Card key={cat.name}>
                          <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <CardTitle className="text-lg">{cat.name.replace('\n', ' ')}</CardTitle>
                                <CardDescription>{cat.verified}/{cat.total} verified ({cat.percentage}%)</CardDescription>
                              </div>
                              <Progress value={cat.percentage} className="w-32" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {categoryDocs.map(doc => (
                                <Card key={doc.id} className={`p-4 border-l-4 ${
                                  doc.priority === 'Critical' ? 'border-l-red-500' : 
                                  doc.priority === 'High' ? 'border-l-orange-500' : 
                                  'border-l-blue-500'
                                }`}>
                                  <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-semibold text-sm" data-testid={`text-doc-name-${doc.id}`}>{doc.name}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          doc.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                                          doc.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                                          'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                        }`}>
                                          {doc.priority}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2">{doc.endorserRequirement}</p>
                                      {doc.uploadDate && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          <span>Uploaded: {doc.uploadDate}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button
                                        variant={doc.status === 'not-started' ? 'outline' : 'ghost'}
                                        size="sm"
                                        onClick={() => updateDocumentStatus(doc.id, 'not-started')}
                                        data-testid={`button-status-not-started-${doc.id}`}
                                        className="text-xs"
                                      >
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not Started
                                      </Button>
                                      <Button
                                        variant={doc.status === 'in-progress' ? 'outline' : 'ghost'}
                                        size="sm"
                                        onClick={() => updateDocumentStatus(doc.id, 'in-progress')}
                                        data-testid={`button-status-in-progress-${doc.id}`}
                                        className="text-xs"
                                      >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        In Progress
                                      </Button>
                                      <Button
                                        variant={doc.status === 'verified' ? 'outline' : 'ghost'}
                                        size="sm"
                                        onClick={() => updateDocumentStatus(doc.id, 'verified')}
                                        data-testid={`button-status-verified-${doc.id}`}
                                        className="text-xs"
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verified
                                      </Button>
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
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Overall document status breakdown</CardDescription>
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
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Start verifying documents to see distribution</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Completion</CardTitle>
                    <CardDescription>Progress by evidence category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" name="Completion %">
                          {categoryData.map((entry, index) => (
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
                  <CardTitle>Collection Timeline</CardTitle>
                  <CardDescription>4-week target vs actual progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} name="Target" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={2} name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Breakdown</CardTitle>
                  <CardDescription>Document completion by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Critical', 'High', 'Medium'].map(priority => {
                      const priorityDocs = documents.filter(d => d.priority === priority);
                      const priorityVerified = priorityDocs.filter(d => d.status === 'verified').length;
                      const percentage = Math.round((priorityVerified / priorityDocs.length) * 100);
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{priority} Priority</span>
                            <span className="text-sm text-muted-foreground">{priorityVerified}/{priorityDocs.length} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
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
                  <CardDescription>AI-powered insights based on your current progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex items-start gap-3">
                          <span className="font-bold text-primary flex-shrink-0">{index + 1}.</span>
                          <span>{tip}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Practices</CardTitle>
                  <CardDescription>Professional evidence collection guidelines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Consistent File Naming</p>
                        <p className="text-sm text-muted-foreground">Use format: CATEGORY-NUMBER-DESCRIPTION-DATE (e.g., FIN-001-Bank-Statements-2024-11.pdf)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Document Recency</p>
                        <p className="text-sm text-muted-foreground">Bank statements and financial docs should be dated within last 3 months of application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Professional Formatting</p>
                        <p className="text-sm text-muted-foreground">All documents should be PDF format, clearly scanned or typed, with no handwritten annotations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Evidence Index</p>
                        <p className="text-sm text-muted-foreground">Create master document listing all evidence with descriptions and how each supports visa criteria</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Backup Strategy</p>
                        <p className="text-sm text-muted-foreground">Maintain copies in cloud storage (Google Drive, Dropbox) with organized folder structure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Expert Review</p>
                        <p className="text-sm text-muted-foreground">Have immigration advisor review complete package before endorser submission</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    4-Week Action Plan
                  </CardTitle>
                  <CardDescription>Structured timeline for complete evidence collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateActionPlan().map((item, index) => (
                      <Card key={index} className={`p-4 border-l-4 ${
                        item.priority === 'Critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                        item.priority === 'High' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-950' :
                        'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className="font-bold text-sm">{item.week}</span>
                            <span className={`block text-xs mt-1 ${
                              item.priority === 'Critical' ? 'text-red-600 dark:text-red-400' :
                              item.priority === 'High' ? 'text-orange-600 dark:text-orange-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-sm flex-1">{item.action}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Milestone Checklist</CardTitle>
                  <CardDescription>Key milestones to track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {criticalScore >= 50 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">50% of Critical documents verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {criticalScore === 100 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">All Critical documents verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {completionScore >= 50 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">50% of all documents verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {uploadedFiles.length >= 10 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">10+ files uploaded to platform</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {completionScore >= 80 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">80% overall completion (submission ready)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {completionScore === 100 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                      <span className="text-sm">100% completion (all documents verified)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endorser Evidence Requirements</CardTitle>
                  <CardDescription>What endorsing bodies expect to see in your application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Business Documents
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">UK Company Registration</p>
                            <p className="text-sm text-muted-foreground">Valid Companies House certificate showing UK incorporation (required for all applicants)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Comprehensive Business Plan</p>
                            <p className="text-sm text-muted-foreground">20-30 page document covering market opportunity, business model, competitive advantage, financials, and growth strategy</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Intellectual Property Protection</p>
                            <p className="text-sm text-muted-foreground">Patents, trademarks, or copyright registrations demonstrating IP strategy (if applicable to your innovation)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Financial Records
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Available Business Funds</p>
                            <p className="text-sm text-muted-foreground">Bank statements (3-6 months) showing investment funds appropriate for your business plan</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Source of Funds Documentation</p>
                            <p className="text-sm text-muted-foreground">Clear evidence of where funds originated (employment, investment, sale of assets, etc.)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">3-Year Financial Projections</p>
                            <p className="text-sm text-muted-foreground">Detailed revenue, costs, and cash flow forecasts with realistic assumptions and justifications</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Innovation Evidence
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Technical Differentiation</p>
                            <p className="text-sm text-muted-foreground">Documentation showing how your solution is technically different from existing market options</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Working Prototype or MVP</p>
                            <p className="text-sm text-muted-foreground">Screenshots, demo videos, or live access to functional product demonstrating innovation</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">R&D Development Process</p>
                            <p className="text-sm text-muted-foreground">Timeline showing product iterations, user feedback incorporation, and continuous improvement</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Market Validation
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Customer Discovery Evidence</p>
                            <p className="text-sm text-muted-foreground">Transcripts or summaries from 20-30 customer interviews demonstrating problem validation</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Quantitative Survey Data</p>
                            <p className="text-sm text-muted-foreground">Survey results from 50+ target customers validating problem, solution, and willingness to pay</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Market Sizing with Sources</p>
                            <p className="text-sm text-muted-foreground">TAM/SAM/SOM calculations backed by credible third-party research (Gartner, Forrester, industry reports)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Traction Metrics
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">User Growth and Engagement</p>
                            <p className="text-sm text-muted-foreground">Analytics showing active users, retention rates, engagement metrics (screenshots from Google Analytics, Mixpanel, etc.)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Revenue Evidence</p>
                            <p className="text-sm text-muted-foreground">Sales records, invoices, or payment platform data proving market traction (if applicable)</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Customer Testimonials</p>
                            <p className="text-sm text-muted-foreground">Written endorsements from satisfied customers with specific outcomes and benefits achieved</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Team Credentials
                      </h3>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Founder Background</p>
                            <p className="text-sm text-muted-foreground">CVs showing relevant education, work experience, and domain expertise for all founders</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Education and Qualifications</p>
                            <p className="text-sm text-muted-foreground">Degree certificates, professional certifications, or specialized training relevant to the business</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Advisory Board Expertise</p>
                            <p className="text-sm text-muted-foreground">Bios of advisors demonstrating industry experience, relevant networks, and credibility</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Standards</CardTitle>
                  <CardDescription>Endorser expectations for evidence quality and presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Documentation Completeness:</span> All validation activities must have complete records that can be independently reviewed - no vague claims without supporting evidence.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Third-Party Verification:</span> Where possible, include verification from credible external sources (bank letters, customer testimonials, research citations).
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Recency Requirements:</span> Financial documents must be dated within 3 months of application; market research within 6-12 months.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Professional Presentation:</span> All documents should be PDF format, clearly formatted, with no handwritten notes or poor quality scans.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Narrative Consistency:</span> Evidence across all categories should tell a coherent story about your business innovation and market opportunity.
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <FileCheck className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-semibold">Expert Review:</span> Have an immigration advisor or experienced mentor review your complete evidence package before endorser submission.
                      </AlertDescription>
                    </Alert>
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
