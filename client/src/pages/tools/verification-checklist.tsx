import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileCheck } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type DocumentStatus = 'not-started' | 'in-progress' | 'verified';

type Document = {
  id: string;
  name: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  requirement: string;
  status: DocumentStatus;
};

const INITIAL_DOCUMENTS: Document[] = [
  // Passport & Identity Documents
  { id: 'doc-1', name: 'Valid Passport', category: 'Identity', priority: 'Critical', requirement: 'Valid for entire visa duration plus 6 months', status: 'not-started' },
  { id: 'doc-2', name: 'Passport Photo Pages', category: 'Identity', priority: 'Critical', requirement: 'Clear scans of all biographical pages', status: 'not-started' },
  { id: 'doc-3', name: 'Previous Visa Pages', category: 'Identity', priority: 'High', requirement: 'All UK visa stamps and entry/exit stamps', status: 'not-started' },
  { id: 'doc-4', name: 'Birth Certificate', category: 'Identity', priority: 'Medium', requirement: 'Official certified copy with translation if needed', status: 'not-started' },
  { id: 'doc-5', name: 'Marriage Certificate', category: 'Identity', priority: 'Medium', requirement: 'If applicable, certified copy with translation', status: 'not-started' },
  
  // Financial Evidence
  { id: 'doc-6', name: 'Bank Statements (28 days)', category: 'Financial', priority: 'Critical', requirement: 'Showing minimum £1,270 maintenance funds', status: 'not-started' },
  { id: 'doc-7', name: 'Investment Funds Evidence', category: 'Financial', priority: 'Critical', requirement: '£50,000 available for business investment', status: 'not-started' },
  { id: 'doc-8', name: 'Source of Funds Declaration', category: 'Financial', priority: 'Critical', requirement: 'Clear documentation of fund origins', status: 'not-started' },
  { id: 'doc-9', name: 'Bank Reference Letters', category: 'Financial', priority: 'High', requirement: 'Confirming account holder and fund availability', status: 'not-started' },
  { id: 'doc-10', name: 'Financial Institution Certification', category: 'Financial', priority: 'High', requirement: 'Regulated institution confirmation', status: 'not-started' },
  
  // Business Documents
  { id: 'doc-11', name: 'Companies House Certificate', category: 'Business', priority: 'Critical', requirement: 'Certificate of Incorporation for UK company', status: 'not-started' },
  { id: 'doc-12', name: 'Business Plan', category: 'Business', priority: 'Critical', requirement: 'Comprehensive plan approved by endorser', status: 'not-started' },
  { id: 'doc-13', name: 'Shareholding Evidence', category: 'Business', priority: 'Critical', requirement: 'Proof of ownership/equity stake', status: 'not-started' },
  { id: 'doc-14', name: 'Company Accounts', category: 'Business', priority: 'High', requirement: 'Latest filed accounts if established business', status: 'not-started' },
  { id: 'doc-15', name: 'Director Appointment', category: 'Business', priority: 'High', requirement: 'Companies House confirmation of directorship', status: 'not-started' },
  
  // Qualifications & Experience
  { id: 'doc-16', name: 'University Degrees', category: 'Qualifications', priority: 'High', requirement: 'All degree certificates with transcripts', status: 'not-started' },
  { id: 'doc-17', name: 'Professional Certifications', category: 'Qualifications', priority: 'Medium', requirement: 'Relevant industry certifications', status: 'not-started' },
  { id: 'doc-18', name: 'Employment References', category: 'Qualifications', priority: 'High', requirement: 'Previous employer letters on letterhead', status: 'not-started' },
  { id: 'doc-19', name: 'CV/Resume', category: 'Qualifications', priority: 'High', requirement: 'Detailed professional history', status: 'not-started' },
  { id: 'doc-20', name: 'Awards & Recognition', category: 'Qualifications', priority: 'Medium', requirement: 'Industry awards, publications, patents', status: 'not-started' },
  
  // Endorsement Documents
  { id: 'doc-21', name: 'Endorsement Letter', category: 'Endorsement', priority: 'Critical', requirement: 'Signed letter from approved endorsing body', status: 'not-started' },
  { id: 'doc-22', name: 'Endorser Approval Certificate', category: 'Endorsement', priority: 'Critical', requirement: 'UKVI endorser approval documentation', status: 'not-started' },
  { id: 'doc-23', name: 'Business Assessment Report', category: 'Endorsement', priority: 'Critical', requirement: 'Endorser evaluation of business viability', status: 'not-started' },
  { id: 'doc-24', name: 'Innovation Evidence', category: 'Endorsement', priority: 'High', requirement: 'Supporting evidence of genuine innovation', status: 'not-started' },
  { id: 'doc-25', name: 'Scalability Evidence', category: 'Endorsement', priority: 'High', requirement: 'Market potential and growth documentation', status: 'not-started' },
  
  // Address & Residence Proof
  { id: 'doc-26', name: 'UK Address Proof', category: 'Address', priority: 'High', requirement: 'Intended UK residential address', status: 'not-started' },
  { id: 'doc-27', name: 'Tenancy Agreement', category: 'Address', priority: 'High', requirement: 'If renting, signed tenancy contract', status: 'not-started' },
  { id: 'doc-28', name: 'Utility Bills', category: 'Address', priority: 'Medium', requirement: 'Recent bills showing name and UK address', status: 'not-started' },
  { id: 'doc-29', name: 'Property Ownership Deed', category: 'Address', priority: 'Medium', requirement: 'If owning property, title deed documents', status: 'not-started' },
  { id: 'doc-30', name: 'Landlord Reference', category: 'Address', priority: 'Medium', requirement: 'Letter from landlord or estate agent', status: 'not-started' },
];

export default function VerificationChecklist() {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedDate, setSavedDate] = useState('');

  const updateDocumentStatus = (id: string, status: DocumentStatus) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === id ? { ...doc, status } : doc
    ));
  };

  const totalDocs = documents.length;
  const notStarted = documents.filter(d => d.status === 'not-started').length;
  const inProgress = documents.filter(d => d.status === 'in-progress').length;
  const verified = documents.filter(d => d.status === 'verified').length;
  const verificationScore = Math.round((verified / totalDocs) * 100);

  const criticalDocs = documents.filter(d => d.priority === 'Critical');
  const criticalVerified = criticalDocs.filter(d => d.status === 'verified').length;
  const criticalComplete = criticalVerified === criticalDocs.length;

  const readyForSubmission = verificationScore >= 85 && criticalComplete;

  const categoryProgress = ['Identity', 'Financial', 'Business', 'Qualifications', 'Endorsement', 'Address'].map(cat => {
    const catDocs = documents.filter(d => d.category === cat);
    const catVerified = catDocs.filter(d => d.status === 'verified').length;
    return {
      category: cat,
      total: catDocs.length,
      verified: catVerified,
      percentage: Math.round((catVerified / catDocs.length) * 100)
    };
  });

  const statusDistribution = [
    { name: 'Verified', value: verified, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: notStarted, color: '#ef4444' },
  ];

  const weeklyProgress = [
    { week: 'Week 1', verified: Math.min(verified, 8), target: 8 },
    { week: 'Week 2', verified: Math.min(verified, 16), target: 16 },
    { week: 'Week 3', verified: Math.min(verified, 24), target: 24 },
    { week: 'Week 4', verified: Math.min(verified, 30), target: 30 },
  ];

  const getSerializedState = () => {
    return {
      documents,
      activeTab,
      savedDate: new Date().toLocaleString('en-GB')
    };
  };

  const restoreSerializedState = (state: any) => {
    if ('documents' in state) setDocuments(state.documents);
    if ('activeTab' in state) setActiveTab(state.activeTab);
    if ('savedDate' in state) setSavedDate(state.savedDate || '');
  };

  useEffect(() => {
    const handoffKey = 'verification-checklist_handoff';
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
      const saved = localStorage.getItem('verification-checklist-state');
      if (saved) {
        const state = JSON.parse(saved);
        restoreSerializedState(state);
      }
    }
  }, []);

  const handleSave = () => {
    const state = getSerializedState();
    localStorage.setItem('verification-checklist-state', JSON.stringify(state));
    setSavedDate(state.savedDate);
  };

  const handleRestore = () => {
    const saved = localStorage.getItem('verification-checklist-state');
    if (saved) {
      const state = JSON.parse(saved);
      restoreSerializedState(state);
    }
  };

  const getSmartTips = () => {
    const tips = [];
    
    if (notStarted > 20) {
      tips.push("Start with Critical priority documents - these are mandatory for visa approval and take longest to obtain");
    }
    
    if (criticalDocs.filter(d => d.status === 'not-started').length > 0) {
      tips.push("Focus on critical documents first: passport, bank statements, endorsement letter, and business registration are non-negotiable");
    }
    
    const financialDocs = documents.filter(d => d.category === 'Financial');
    const financialComplete = financialDocs.filter(d => d.status === 'verified').length;
    if (financialComplete < financialDocs.length) {
      tips.push("Financial documents require 28-day aging period - start gathering bank statements immediately to avoid delays");
    }
    
    if (documents.find(d => d.id === 'doc-21')?.status !== 'verified') {
      tips.push("Endorsement letter is the cornerstone document - prioritize endorsing body approval before other documents");
    }
    
    const qualDocs = documents.filter(d => d.category === 'Qualifications');
    const qualProgress = qualDocs.filter(d => d.status === 'verified').length;
    if (qualProgress < qualDocs.length / 2) {
      tips.push("Educational certificates may require official translations and notarization - allow 2-3 weeks for international documents");
    }
    
    if (verificationScore < 50) {
      tips.push("Current verification rate suggests 6-8 week timeline to completion - consider professional document service to accelerate");
    }
    
    if (inProgress > 5) {
      tips.push("Multiple in-progress documents detected - focus on completing started items before beginning new ones to maintain momentum");
    }
    
    if (criticalComplete && verificationScore < 85) {
      tips.push("All critical documents verified - excellent! Now focus on high-priority supporting documents to strengthen application");
    }
    
    if (readyForSubmission) {
      tips.push("Outstanding verification rate! Perform final quality check: ensure all documents dated within 3 months, properly certified, and in English");
    }
    
    if (documents.filter(d => d.category === 'Business').some(d => d.status !== 'verified')) {
      tips.push("Business documents must show active trading status - ensure Companies House records updated within last 3 months");
    }
    
    return tips.slice(0, 8);
  };

  const generateActionPlan = () => {
    return [
      { 
        week: "Week 1", 
        action: "Gather all identity documents (passport, birth certificate) and initiate bank statement collection for 28-day aging requirement", 
        priority: "Critical",
        documents: ["Passport", "Bank Statements", "Birth Certificate"]
      },
      { 
        week: "Week 1-2", 
        action: "Submit endorsing body application and secure Companies House incorporation certificate for UK business entity", 
        priority: "Critical",
        documents: ["Endorsement Application", "Companies House Certificate"]
      },
      { 
        week: "Week 2", 
        action: "Obtain source of funds documentation and bank reference letters confirming £50,000 investment availability", 
        priority: "Critical",
        documents: ["Source of Funds", "Bank References", "Investment Evidence"]
      },
      { 
        week: "Week 2-3", 
        action: "Compile qualifications evidence: degrees, certifications, employment references with official translations where needed", 
        priority: "High",
        documents: ["Degrees", "Certifications", "References"]
      },
      { 
        week: "Week 3", 
        action: "Secure UK address documentation: tenancy agreement or property deed, utility bills showing residential address", 
        priority: "High",
        documents: ["Tenancy Agreement", "Utility Bills", "Address Proof"]
      },
      { 
        week: "Week 3-4", 
        action: "Receive endorsement letter from approved body and gather all business plan supporting documentation", 
        priority: "Critical",
        documents: ["Endorsement Letter", "Business Plan", "Innovation Evidence"]
      },
      { 
        week: "Week 4", 
        action: "Complete document verification: ensure all items certified, translated, dated within 3 months, and submission-ready", 
        priority: "Critical",
        documents: ["Final Review", "Certification Check", "Quality Assurance"]
      },
      { 
        week: "Week 4+", 
        action: "Submit complete application with all verified documents and maintain document currency throughout processing period", 
        priority: "Critical",
        documents: ["Application Submission", "Document Monitoring"]
      },
    ];
  };

  const handleExport = () => {
    const report = `UK INNOVATOR FOUNDER VISA - DOCUMENT VERIFICATION CHECKLIST
Generated: ${new Date().toLocaleString('en-GB')}
${'='.repeat(80)}

VERIFICATION SUMMARY
${'-'.repeat(80)}
Total Documents: ${totalDocs}
Verified: ${verified} (${verificationScore}%)
In Progress: ${inProgress}
Not Started: ${notStarted}
Critical Documents: ${criticalVerified}/${criticalDocs.length}
Submission Ready: ${readyForSubmission ? 'YES' : 'NO'}

CATEGORY BREAKDOWN
${'-'.repeat(80)}
${categoryProgress.map(cat => `
${cat.category}: ${cat.verified}/${cat.total} verified (${cat.percentage}%)
`).join('')}

DOCUMENT STATUS DETAILS
${'-'.repeat(80)}
${documents.map(doc => `
[${doc.status.toUpperCase()}] ${doc.name}
  Category: ${doc.category} | Priority: ${doc.priority}
  Requirement: ${doc.requirement}
`).join('')}

CRITICAL DOCUMENTS STATUS
${'-'.repeat(80)}
${criticalDocs.map(doc => `
${doc.status === 'verified' ? '[VERIFIED]' : '[PENDING]'} ${doc.name} - ${doc.status}
  ${doc.requirement}
`).join('')}

SMART RECOMMENDATIONS
${'-'.repeat(80)}
${getSmartTips().map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

4-WEEK ACTION PLAN
${'-'.repeat(80)}
${generateActionPlan().map(item => `
[${item.priority}] ${item.week}
Action: ${item.action}
Documents: ${item.documents.join(', ')}
`).join('')}

HOME OFFICE 2025 REQUIREMENTS - KEY POINTS
${'-'.repeat(80)}
IDENTITY DOCUMENTS:
- Passport must be valid for entire visa duration plus 6 months
- All biographical pages must be scanned clearly
- Previous UK visa stamps must be included

FINANCIAL EVIDENCE:
- Minimum £1,270 maintenance funds shown in bank statements
- Funds must be held continuously for 28 days before application
- £50,000 investment funds must be evidenced and accessible
- Source of funds must be clearly documented
- Regulated financial institution confirmation required

BUSINESS DOCUMENTS:
- UK company must be registered with Companies House
- Business plan must be endorsed by approved body
- Shareholding/directorship must be evidenced
- Company must be active and in good standing

ENDORSEMENT REQUIREMENTS:
- Endorsing body must be UKVI-approved
- Letter must confirm business innovation and viability
- Assessment must verify scalability and growth potential
- All supporting evidence must align with endorsement

QUALIFICATIONS:
- All non-UK degrees require official translation
- Professional certifications strengthen application
- Employment history must be documented
- Industry recognition provides additional support

ADDRESS PROOF:
- UK residential address must be confirmed
- Tenancy agreement or property deed required
- Utility bills must show name and address
- Documentation must be current (within 3 months)

CRITICAL COMPLIANCE NOTES
${'-'.repeat(80)}
- All documents must be dated within 3 months of submission
- Non-English documents require certified translation
- Photocopies must be certified by notary or solicitor
- Digital scans must be high quality and fully legible
- Keep original documents accessible for verification
- Maintain document currency throughout processing (3-6 months)
- Any document changes require immediate UKVI notification
- Missing critical documents result in automatic refusal

SUBMISSION CHECKLIST
${'-'.repeat(80)}
[ ] All critical priority documents verified
[ ] 28-day bank statement aging period complete
[ ] Endorsement letter received and verified
[ ] All documents certified and translated where needed
[ ] Quality check: dates, signatures, clarity verified
[ ] Document currency confirmed (within 3 months)
[ ] Digital copies backed up securely
[ ] Physical copies organized and accessible

${'='.repeat(80)}
Report generated by UK Innovator Founder Visa Assistant
© 2025 innovatorfoundervisaassistant.co.uk

DISCLAIMER: This checklist is for guidance only. Requirements may vary by 
individual circumstances. Consult official Home Office guidance and seek 
professional immigration advice for your specific situation.
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-checklist-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'in-progress': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
      case 'not-started': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'not-started': return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-verification-checklist">Document Verification Checklist</h1>
            <p className="text-lg text-muted-foreground">Complete document verification for UK Innovator Founder Visa application</p>
            {savedDate && (
              <p className="text-sm text-muted-foreground mt-2">Last saved: {savedDate}</p>
            )}
          </div>

          <ToolUtilityBar
            toolId="verification-checklist"
            onSave={handleSave}
            onRestore={handleRestore}
            onExport={handleExport}
            getSerializedState={getSerializedState}
            toolName="Document Verification Checklist"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5" data-testid="tabs-verification">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
              <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
              <TabsTrigger value="tips" data-testid="tab-tips">Smart Tips</TabsTrigger>
              <TabsTrigger value="action" data-testid="tab-action">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className={readyForSubmission ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Verification Score</p>
                      <p className="text-4xl font-bold" data-testid="text-verification-score">{verificationScore}%</p>
                      <Progress value={verificationScore} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-2">{verified}/{totalDocs} documents</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Critical Documents</p>
                      <p className="text-3xl font-bold" data-testid="text-critical-verified">{criticalVerified}/{criticalDocs.length}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {criticalComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-sm">{criticalComplete ? 'Complete' : 'In Progress'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600" data-testid="text-in-progress">{inProgress}</p>
                      <p className="text-xs text-muted-foreground mt-2">Active documents</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={readyForSubmission ? "bg-green-50 dark:bg-green-950 border-green-500" : "bg-orange-50 dark:bg-orange-950 border-orange-500"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Submission Status</p>
                      <p className={`text-2xl font-bold ${readyForSubmission ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} data-testid="text-submission-ready">
                        {readyForSubmission ? 'READY' : 'PENDING'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {readyForSubmission ? 'All verified' : `${totalDocs - verified} remaining`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!criticalComplete && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {criticalDocs.length - criticalVerified} critical documents incomplete. These are mandatory for visa approval - prioritize immediately.
                  </AlertDescription>
                </Alert>
              )}

              {criticalComplete && !readyForSubmission && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Critical documents complete! Continue with supporting documents to reach 85% verification threshold for submission.
                  </AlertDescription>
                </Alert>
              )}

              {readyForSubmission && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Excellent! All critical documents verified and submission threshold met. Perform final quality check before submission.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Category Progress</CardTitle>
                  <CardDescription>Verification status by document category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryProgress.map((cat, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cat.category}</span>
                            <Badge variant="outline" className="text-xs">{cat.verified}/{cat.total}</Badge>
                          </div>
                          <span className="text-sm font-semibold" data-testid={`text-category-progress-${index}`}>{cat.percentage}%</span>
                        </div>
                        <Progress value={cat.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {['Identity', 'Financial', 'Business', 'Qualifications', 'Endorsement', 'Address'].map((category) => {
                const catDocs = documents.filter(d => d.category === category);
                return (
                  <Card key={category}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{category} Documents</CardTitle>
                          <CardDescription>
                            {catDocs.filter(d => d.status === 'verified').length}/{catDocs.length} verified
                          </CardDescription>
                        </div>
                        <Badge variant={catDocs.every(d => d.status === 'verified') ? "default" : "secondary"}>
                          {Math.round((catDocs.filter(d => d.status === 'verified').length / catDocs.length) * 100)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {catDocs.map((doc) => (
                          <Card key={doc.id} className={`p-4 border-l-4 ${
                            doc.priority === 'Critical' ? 'border-l-red-500' :
                            doc.priority === 'High' ? 'border-l-orange-500' :
                            'border-l-blue-500'
                          }`}>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{doc.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {doc.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{doc.requirement}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={getStatusBadgeColor(doc.status)} data-testid={`badge-status-${doc.id}`}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(doc.status)}
                                      {doc.status.replace('-', ' ')}
                                    </span>
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={doc.status === 'not-started' ? 'default' : 'outline'}
                                  onClick={() => updateDocumentStatus(doc.id, 'not-started')}
                                  data-testid={`button-not-started-${doc.id}`}
                                >
                                  Not Started
                                </Button>
                                <Button
                                  size="sm"
                                  variant={doc.status === 'in-progress' ? 'default' : 'outline'}
                                  onClick={() => updateDocumentStatus(doc.id, 'in-progress')}
                                  data-testid={`button-in-progress-${doc.id}`}
                                >
                                  In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  variant={doc.status === 'verified' ? 'default' : 'outline'}
                                  onClick={() => updateDocumentStatus(doc.id, 'verified')}
                                  data-testid={`button-verified-${doc.id}`}
                                >
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
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Overall document verification progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {statusDistribution.map((entry, index) => (
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
                    <CardTitle>Weekly Progress Timeline</CardTitle>
                    <CardDescription>Verification targets vs actual progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyProgress}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="verified" fill="#10b981" name="Verified" />
                        <Bar dataKey="target" fill="#3b82f6" name="Target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Completion Rates</CardTitle>
                  <CardDescription>Verification progress across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="verified" fill="#10b981" name="Verified" />
                      <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Home Office 2025 Requirements</CardTitle>
                  <CardDescription>Updated document requirements for UK Innovator Founder Visa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Financial Evidence (2025 Update)</p>
                        <p className="text-sm text-muted-foreground">£1,270 maintenance + £50,000 investment must be evidenced with 28-day bank statements from regulated institutions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Endorsement Requirements</p>
                        <p className="text-sm text-muted-foreground">Letter from UKVI-approved endorsing body confirming business innovation, viability, and scalability potential</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Business Documentation</p>
                        <p className="text-sm text-muted-foreground">UK company registration, shareholding evidence, and active trading status from Companies House</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Identity & Qualifications</p>
                        <p className="text-sm text-muted-foreground">Valid passport, educational credentials with translations, and professional experience documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Document Currency</p>
                        <p className="text-sm text-muted-foreground">All documents must be dated within 3 months of application submission and remain valid throughout processing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>Personalized guidance based on your current verification progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getSmartTips().map((tip, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription data-testid={`tip-${index}`}>{tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Recommendations</CardTitle>
                  <CardDescription>Focus areas based on document status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notStarted > 0 && (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Not Started Documents: {notStarted}</p>
                          <p className="text-sm text-muted-foreground">Begin with critical priority items to avoid application delays</p>
                        </div>
                      </div>
                    )}
                    {inProgress > 0 && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">In Progress Documents: {inProgress}</p>
                          <p className="text-sm text-muted-foreground">Complete started documents before beginning new ones</p>
                        </div>
                      </div>
                    )}
                    {verified > 0 && (
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Verified Documents: {verified}</p>
                          <p className="text-sm text-muted-foreground">Excellent progress - maintain document currency throughout application process</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>4-Week Action Plan</CardTitle>
                  <CardDescription>Strategic timeline for complete document verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {generateActionPlan().map((item, index) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary/20 last:border-l-0 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-semibold">{item.week}</Badge>
                            <Badge className={
                              item.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                              item.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            }>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="font-medium" data-testid={`action-${index}`}>{item.action}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="secondary" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Critical Milestones</CardTitle>
                  <CardDescription>Key deadlines and checkpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <span className="font-medium">Day 1: Start bank statement 28-day aging</span>
                      <Badge>Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <span className="font-medium">Week 1: Submit endorsing body application</span>
                      <Badge>Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <span className="font-medium">Week 2: Complete financial documentation</span>
                      <Badge>Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <span className="font-medium">Week 3: Receive endorsement letter</span>
                      <Badge>Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-md">
                      <span className="font-medium">Week 4: Final quality check and submission</span>
                      <Badge>Critical</Badge>
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
