import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const TAX_ITEMS = [
  {category:"Corporation Tax",items:["CT600 filed within 12 months","Appendices CT600a/600b attached","Corporation tax paid on time"]},
  {category:"VAT (if applicable)",items:["VAT registration threshold checked","Monthly/quarterly VAT returns filed","VAT payments made on time"]},
  {category:"Payroll",items:["PAYE registered with HMRC","Monthly payroll submitted on time","P11D filed for director benefits"]},
  {category:"Personal Tax",items:["Individual self-assessments filed","Capital gains tax paid","Dividend tax returns submitted"]},
  {category:"Record Keeping",items:["Sales invoices retained for 6 years","Purchase invoices and receipts filed","Bank reconciliations completed monthly"]}
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'tax-compliance',
  toolName: 'Tax Compliance Checker',
  agent: 'sterling',
  greeting: "Hello! I'm Sterling, your Financial Analyst. I'll help you ensure your business is fully compliant with UK tax regulations - essential for demonstrating business viability to endorsing bodies. Let's review your tax compliance status together!",
  questions: [
    {
      id: 'company-structure',
      question: "What is your company structure (Limited Company, Sole Trader, Partnership)? When was it incorporated or established?",
      hint: "Your structure affects which tax obligations apply",
      fieldKey: 'company_structure'
    },
    {
      id: 'corporation-tax',
      question: "Have you filed your Corporation Tax return (CT600) within 12 months of your accounting period end? Is your corporation tax paid on time?",
      hint: "Late CT600 filing can result in penalties and interest",
      fieldKey: 'corporation_tax_status'
    },
    {
      id: 'vat-status',
      question: "Is your business VAT registered? If so, are you filing returns monthly or quarterly? Are you using Making Tax Digital (MTD)?",
      hint: "VAT registration is mandatory above £85,000 turnover",
      fieldKey: 'vat_status'
    },
    {
      id: 'payroll-compliance',
      question: "Have you registered for PAYE with HMRC? Are monthly payroll submissions being made on time?",
      hint: "Payroll compliance is critical when employing staff, including directors",
      fieldKey: 'payroll_status'
    },
    {
      id: 'record-keeping',
      question: "How do you maintain your financial records? Are sales invoices, purchase receipts, and bank statements organized and retained for 6 years?",
      hint: "Good record keeping is essential for HMRC audits",
      fieldKey: 'record_keeping'
    },
    {
      id: 'tax-advisor',
      question: "Do you have a qualified UK accountant or tax advisor? What accounting software do you use?",
      hint: "Professional support demonstrates business maturity to endorsers",
      fieldKey: 'tax_advisor'
    }
  ]
};

export default function TaxCompliance() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('tax-compliance-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('tax-compliance-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('tax-compliance-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    setMode('traditional');
  };

  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = TAX_ITEMS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const saveProgress = () => {
    localStorage.setItem('taxComplianceProgress', JSON.stringify(checks));
    localStorage.setItem('taxComplianceDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('taxComplianceProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('taxComplianceDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["Corporation Tax-CT600 filed within 12 months"]) gaps.push("File CT600 corporation tax return urgently");
    if (!checks["Payroll-PAYE registered with HMRC"]) gaps.push("Register for PAYE with HMRC immediately");
    if (!checks["Personal Tax-Individual self-assessments filed"]) gaps.push("Complete all self-assessment tax returns");
    if (complianceScore < 80) gaps.push("Address tax compliance gaps to avoid HMRC penalties");
    if (completedItems < 10) gaps.push("Focus on critical tax obligations first");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"File all outstanding corporation tax returns", priority:"Critical"},
      {week:"Week 2", action:"Complete PAYE registration and submissions", priority:"Critical"},
      {week:"Week 3", action:"Submit personal tax and VAT returns", priority:"High"},
      {week:"Week 4", action:"Organize record keeping and reconciliations", priority:"Medium"}
    ];
  };

  const exportReport = () => {
    const report = `TAX COMPLIANCE REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${complianceScore}%\nItems Complete: ${completedItems}/${totalItems}\n\nSTATUS: ${complianceScore>=80?"COMPLIANT":"REVIEW NEEDED"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax-compliance.txt';
    a.click();
  };

  const getSerializedState = () => {
    return {
      checks,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'tax-compliance_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if ('checks' in payload) setChecks(payload.checks);
        if ('savedDate' in payload) setSavedDate(payload.savedDate);
        if ('tab' in payload) setTab(payload.tab);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      loadProgress();
    }
  }, []);

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold mb-2">Tax Compliance Checker</h1>
              <p className="text-muted-foreground">Corporation tax, VAT, PAYE and personal tax verification</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} />
          ) : (
          <>
          <ToolUtilityBar
            toolId="tax-compliance"
            toolName="Tax Compliance Checker"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExport={exportReport}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

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
                    <span className={`text-xs ${item.priority==="Critical"?"text-red-600":"text-yellow-600"}`}>{item.priority}</span>
                  </div>
                </div>
              ))}</div>
            </Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Compliance Score</TabsTrigger>
              <TabsTrigger value="checklist">Tax Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Tax Compliance</p>
                  <p className="text-xl font-bold mt-2">{complianceScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Items Complete</p>
                  <p className="text-xl font-bold mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-lg font-bold ${complianceScore>=80?"text-green-600":"text-yellow-600"}`}>
                    {complianceScore>=80?"✓ Compliant":"Review"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Audit Risk</p>
                  <p className={`text-sm font-bold ${complianceScore>=80?"text-green-600":"text-red-600"}`}>
                    {complianceScore>=80?"Low":"High"}
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {TAX_ITEMS.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${cat.category}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item}`]:!checks[`${cat.category}-${item}`]})} />
                        <span className="text-sm flex-1">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </div>
    </>
  );
}
