import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw, FileCheck, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UploadedFile } from "@/components/FileUploadButton";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'doc-verification',
  toolName: 'Document Verification',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Compliance Expert. I'll help you verify that all your visa application documents meet Home Office requirements. Document verification is critical - incomplete or incorrect documents are a leading cause of visa refusals. Let's ensure everything is in order!",
  questions: [
    {
      id: 'identity-docs',
      question: "Let's start with Identity Documents. Do you have a valid passport with at least 6 months validity beyond your visa period, birth certificate, and previous passports from the last 10 years?",
      hint: "Passport validity is strictly enforced - check expiry dates carefully",
      fieldKey: 'identity_status',
      minLength: 30
    },
    {
      id: 'business-docs',
      question: "For Business Documents, have you obtained your Companies House registration certificate, Articles of Association, and Board Meeting minutes from the last 12 months?",
      hint: "All documents must be current and match your company registration number",
      fieldKey: 'business_status',
      minLength: 30
    },
    {
      id: 'financial-verification',
      question: "Regarding Financial Documents, do you have 28-day bank statements showing £1,270 minimum, annual accounts for the last 3 years, and filed tax returns?",
      hint: "Bank statements must be from a UK regulated bank with your name clearly visible",
      fieldKey: 'financial_status',
      minLength: 30
    },
    {
      id: 'employment-ip',
      question: "What's the status of your Employment Documents (contracts, payroll records) and Intellectual Property documentation (patents, IP assignments, copyrights)?",
      hint: "IP documentation strengthens your innovation claim significantly",
      fieldKey: 'employment_ip_status',
      minLength: 30
    },
    {
      id: 'endorsement-docs',
      question: "Most critically - do you have your Endorsement Letter signed by an approved body, supporting evidence bundle, and verified endorser registration number?",
      hint: "The endorsement letter is mandatory and must reference specific visa criteria",
      fieldKey: 'endorsement_status',
      minLength: 30
    },
    {
      id: 'verification-gaps',
      question: "Are there any documents you're struggling to obtain or verify? What's your main concern about document compliance?",
      hint: "Identifying gaps early allows time to resolve issues before submission",
      fieldKey: 'verification_gaps',
      minLength: 30
    }
  ],
  completionMessage: "Great! I've captured your document verification status. I'm updating your checklist to reflect which documents are verified and which need attention. Switch to the traditional view to see your complete verification dashboard and mark items as complete."
};

const DOC_CATEGORIES = [
  {category:"Identity Documents",critical:true,items:[
    {name:"Valid Passport",req:"Minimum 6 months validity beyond visa period"},
    {name:"Birth Certificate",req:"Original certified copy required"},
    {name:"Previous Passports",req:"All previous passports for last 10 years"}
  ]},
  {category:"Business Documents",critical:true,items:[
    {name:"Companies House Registration",req:"Current certificate of incorporation"},
    {name:"Articles of Association",req:"Original registered at Companies House"},
    {name:"Board Meeting Minutes",req:"Last 12 months of governance records"}
  ]},
  {category:"Financial Documents",critical:true,items:[
    {name:"Bank Statements (28 days)",req:"Personal bank showing 1270 pounds minimum"},
    {name:"Annual Accounts",req:"Last 3 years audited or filed accounts"},
    {name:"Tax Returns",req:"Corporation tax and personal returns filed"}
  ]},
  {category:"Employment Documents",critical:false,items:[
    {name:"Employment Contracts",req:"Signed contracts for all employees"},
    {name:"Payroll Records",req:"P60s and PAYE documentation"},
    {name:"References",req:"Professional references for leadership team"}
  ]},
  {category:"Intellectual Property",critical:false,items:[
    {name:"Patent Applications",req:"Copies of all filed or pending patents"},
    {name:"IP Assignments",req:"Proof of IP ownership or assignments"},
    {name:"Copyright Registrations",req:"Software or design registrations"}
  ]},
  {category:"Endorsement Documents",critical:true,items:[
    {name:"Endorsement Letter",req:"Signed by approved endorser body"},
    {name:"Supporting Evidence Bundle",req:"All evidence mentioned in letter"},
    {name:"Endorser Registration Number",req:"Verified against UKVI register"}
  ]}
];

export default function DocVerification() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('doc-verification-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('doc-verification-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('doc-verification-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newChecks = { ...checks };
    
    if (answers.identity_status?.toLowerCase().includes('yes') || answers.identity_status?.toLowerCase().includes('have')) {
      newChecks["Identity Documents-Valid Passport"] = true;
    }
    
    if (answers.business_status?.toLowerCase().includes('yes') || answers.business_status?.toLowerCase().includes('have')) {
      newChecks["Business Documents-Companies House Registration"] = true;
    }
    
    if (answers.financial_status?.toLowerCase().includes('yes') || answers.financial_status?.toLowerCase().includes('have')) {
      newChecks["Financial Documents-Bank Statements (28 days)"] = true;
    }
    
    if (answers.endorsement_status?.toLowerCase().includes('yes') || answers.endorsement_status?.toLowerCase().includes('have')) {
      newChecks["Endorsement Documents-Endorsement Letter"] = true;
    }
    
    setChecks(newChecks);
    
    const date = new Date().toLocaleDateString();
    localStorage.setItem('docVerificationProgress', JSON.stringify(newChecks));
    localStorage.setItem('docVerificationDate', date);
    setSavedDate(date);
    
    setTab('overview');
    setMode('traditional');
  };

  const totalDocs = DOC_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const completedDocs = Object.values(checks).filter(Boolean).length;
  const verificationScore = Math.round((completedDocs / totalDocs) * 100);

  const criticalItems = DOC_CATEGORIES.filter(c => c.critical).reduce((sum, c) => sum + c.items.length, 0);
  const criticalDone = DOC_CATEGORIES.filter(c => c.critical).reduce((sum, c) => sum + c.items.filter(i => checks[`${c.category}-${i.name}`]).length, 0);
  const submissionReady = completedDocs === totalDocs && criticalDone === criticalItems;

  const saveProgress = () => {
    localStorage.setItem('docVerificationProgress', JSON.stringify(checks));
    localStorage.setItem('docVerificationDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('docVerificationProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('docVerificationDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (criticalDone < criticalItems) gaps.push(`Complete ${criticalItems - criticalDone} critical documents first`);
    if (!checks["Identity Documents-Valid Passport"]) gaps.push("Obtain passport with 6+ months validity");
    if (!checks["Financial Documents-Bank Statements (28 days)"]) gaps.push("Prepare 28-day bank statement showing £1,270");
    if (!checks["Endorsement Documents-Endorsement Letter"]) gaps.push("Secure endorsement letter from approved body");
    if (verificationScore < 80) gaps.push("Aim for 100% document completion before submission");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Collect all identity and passport documents", priority:"Critical"},
      {week:"Week 2", action:"Gather business registration and governance docs", priority:"Critical"},
      {week:"Week 3", action:"Prepare financial statements and bank proofs", priority:"Critical"},
      {week:"Week 4", action:"Finalize endorsement and supporting evidence", priority:"Critical"}
    ];
  };

  const exportReport = () => {
    const report = `DOCUMENT VERIFICATION REPORT\nDate: ${new Date().toLocaleDateString()}\nVerification Score: ${verificationScore}%\nDocuments Complete: ${completedDocs}/${totalDocs}\nCritical Items: ${criticalDone}/${criticalItems}\n\nSTATUS: ${submissionReady?"READY FOR SUBMISSION":"IN PROGRESS"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-verification.txt';
    a.click();
  };

  const handleFileUpload = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
    localStorage.setItem('docVerificationFiles', JSON.stringify([...uploadedFiles, file]));
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updated);
    localStorage.setItem('docVerificationFiles', JSON.stringify(updated));
  };

  const getSerializedState = () => {
    return {
      checks,
      savedDate,
      tab,
      uploadedFiles
    };
  };

  useEffect(() => {
    const handoffKey = 'doc-verification_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if ('checks' in payload) setChecks(payload.checks);
        if ('savedDate' in payload) setSavedDate(payload.savedDate);
        if ('tab' in payload) setTab(payload.tab);
        if ('uploadedFiles' in payload) setUploadedFiles(payload.uploadedFiles);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      loadProgress();
      const savedFiles = localStorage.getItem('docVerificationFiles');
      if (savedFiles) {
        try {
          setUploadedFiles(JSON.parse(savedFiles));
        } catch (err) {
          console.error('Failed to load files:', err);
        }
      }
    }
  }, []);

  const categoryData = DOC_CATEGORIES.map(cat => ({
    category: cat.category.split(" ")[0],
    completed: cat.items.filter(i => checks[`${cat.category}-${i.name}`]).length,
    total: cat.items.length
  }));

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
            <h1 className="text-4xl font-bold">Document Verification</h1>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>
          <p className="text-muted-foreground mb-6">Critical and supporting documents checklist</p>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="doc-verification"
            toolName="Document Verification"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExport={exportReport}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton
              config={fileUploadConfigs.documentVerification}
              onFileSelected={handleFileUpload}
              variant="secondary"
            />
          </div>

          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          {showRecommendations && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <h3 className="font-bold mb-2">Smart Recommendations</h3>
              <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul>
            </Card>
          )}

          {showActionPlan && (
            <Card className="p-4 mb-4 bg-green-50 border-green-200">
              <h3 className="font-bold mb-3">Action Plan Timeline</h3>
              <div className="space-y-2">{generateActionPlan().map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-bold text-sm">{item.week}</span>
                  <div><p className="text-sm">{item.action}</p>
                    <span className="text-xs text-red-600">{item.priority}</span>
                  </div>
                </div>
              ))}</div>
            </Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Verification Status</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
              <TabsTrigger value="analysis">Category Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Verification Score</p>
                  <p className="text-4xl font-bold mt-2">{verificationScore}%</p>
                  <p className="text-xs mt-2">{completedDocs}/{totalDocs} docs</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Critical Items</p>
                  <p className="text-3xl font-bold mt-2">{criticalDone}/{criticalItems}</p>
                  <p className={`text-xs mt-2 ${criticalDone===criticalItems?"text-green-600":"text-red-600"}`}>
                    {criticalDone===criticalItems?"✓ Complete":"⚠ Missing"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Submission Ready</p>
                  <p className={`text-2xl font-bold ${submissionReady?"text-green-600":"text-orange-600"}`}>
                    {submissionReady?"✓ YES":"In Progress"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Compliance Risk</p>
                  <p className={`text-lg font-bold ${submissionReady?"text-green-600":"text-red-600"}`}>
                    {submissionReady?"Low":"High"}
                  </p>
                </Card>
              </div>

              {submissionReady && (
                <Alert className="border-green-200 bg-green-50">
                  <FileCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    All documents verified and ready for submission!
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="docs" className="space-y-4">
              {DOC_CATEGORIES.map((cat, i) => (
                <Card key={i} className={`p-4 border-l-4 ${cat.critical ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{cat.category}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${cat.critical ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {cat.critical ? "Critical":"Supporting"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="border border-gray-200 p-3 rounded hover:bg-gray-50">
                        <label className="flex gap-3">
                          <Checkbox checked={checks[`${cat.category}-${item.name}`]||false}
                            onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item.name}`]:!checks[`${cat.category}-${item.name}`]})} />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.req}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Document Completion by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
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
