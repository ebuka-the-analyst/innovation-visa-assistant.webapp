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
import { useWordExport } from "@/hooks/useWordExport";
import { useToast } from "@/hooks/use-toast";

const LEGAL_ITEMS = [
  {category:"Company Formation",items:["Incorporated at Companies House","Memorandum & Articles of Association","Company registration certificate"]},
  {category:"Shareholding",items:["Shares properly allotted","Share certificates issued","Shareholder agreements in place"]},
  {category:"Board Governance",items:["Board meetings held regularly","Minutes documented","Decisions properly authorized"]},
  {category:"Regulatory Filings",items:["Annual accounts filed","Confirmation statement filed annually","Tax returns submitted on time"]},
  {category:"Contracts",items:["Customer contracts documented","Supplier agreements in place","Employee contracts executed"]}
];

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'legal-compliance',
  toolName: 'Legal Compliance Checker',
  agent: 'sage',
  greeting: "Hello! I'm Sage, your Legal & Compliance Specialist. Legal compliance is essential for your Innovator Founder visa - endorsers verify your business operates within UK law. Let me guide you through the key requirements. Ready?",
  questions: [
    {
      id: 'company-registered',
      question: "Is your company registered at Companies House? What is your company registration number?",
      hint: "If not yet registered, you'll need to do this before visa application",
      fieldKey: 'companyRegistered',
      required: true
    },
    {
      id: 'articles-status',
      question: "Do you have your Memorandum & Articles of Association in place? Have they been reviewed by a lawyer?",
      hint: "These define how your company is governed - critical for investor confidence",
      fieldKey: 'articlesStatus'
    },
    {
      id: 'shareholding-structure',
      question: "Describe your current shareholding structure. Are share certificates issued and shareholder agreements signed?",
      hint: "Clear ownership documentation is essential for visa and funding",
      fieldKey: 'shareholdingStructure'
    },
    {
      id: 'board-meetings',
      question: "How often does your board meet? Are meetings minuted and decisions properly authorized?",
      hint: "Regular documented governance demonstrates viability",
      fieldKey: 'boardMeetings'
    },
    {
      id: 'regulatory-filings',
      question: "Are all statutory filings up to date? (Annual accounts, confirmation statement, tax returns)",
      hint: "Outstanding filings can delay or prevent visa approval",
      fieldKey: 'regulatoryFilings'
    },
    {
      id: 'contract-status',
      question: "Do you have written contracts for customers, suppliers, and employees?",
      hint: "Documented commercial relationships support business viability",
      fieldKey: 'contractStatus'
    }
  ],
  completionMessage: "Thank you! I've captured your compliance status. I'm now populating the checklist with your responses. Review each item and check off what's complete."
};

export default function LegalCompliance() {
  const { generateWord } = useWordExport();
  const { toast } = useToast();
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('legal-compliance-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('legal-compliance-mode', 'traditional');
    }
  }, [isPaidUser, mode]);
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = LEGAL_ITEMS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  useEffect(() => {
    localStorage.setItem('legal-compliance-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newChecks: Record<string, boolean> = { ...checks };
    if (answers.companyRegistered?.toLowerCase().includes('yes')) {
      newChecks['Company Formation-Incorporated at Companies House'] = true;
      newChecks['Company Formation-Company registration certificate'] = true;
    }
    if (answers.articlesStatus?.toLowerCase().includes('yes')) {
      newChecks['Company Formation-Memorandum & Articles of Association'] = true;
    }
    if (answers.shareholdingStructure?.toLowerCase().includes('yes') || answers.shareholdingStructure?.toLowerCase().includes('issued')) {
      newChecks['Shareholding-Shares properly allotted'] = true;
      newChecks['Shareholding-Share certificates issued'] = true;
    }
    if (answers.boardMeetings?.toLowerCase().includes('regular') || answers.boardMeetings?.toLowerCase().includes('yes')) {
      newChecks['Board Governance-Board meetings held regularly'] = true;
      newChecks['Board Governance-Minutes documented'] = true;
    }
    if (answers.regulatoryFilings?.toLowerCase().includes('yes') || answers.regulatoryFilings?.toLowerCase().includes('up to date')) {
      newChecks['Regulatory Filings-Annual accounts filed'] = true;
      newChecks['Regulatory Filings-Confirmation statement filed annually'] = true;
      newChecks['Regulatory Filings-Tax returns submitted on time'] = true;
    }
    if (answers.contractStatus?.toLowerCase().includes('yes')) {
      newChecks['Contracts-Customer contracts documented'] = true;
      newChecks['Contracts-Supplier agreements in place'] = true;
      newChecks['Contracts-Employee contracts executed'] = true;
    }
    setChecks(newChecks);
    setMode('traditional');
  };

  const saveProgress = () => {
    localStorage.setItem('legalComplianceProgress', JSON.stringify(checks));
    localStorage.setItem('legalComplianceDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('legalComplianceProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('legalComplianceDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["Company Formation-Incorporated at Companies House"]) gaps.push("Verify Companies House registration status");
    if (!checks["Regulatory Filings-Annual accounts filed"]) gaps.push("File annual accounts immediately - avoid penalties");
    if (!checks["Board Governance-Minutes documented"]) gaps.push("Document all board meetings and decisions");
    if (complianceScore < 100) gaps.push("Complete all legal requirements for visa compliance");
    if (completedItems < 10) gaps.push("Address critical company law items first");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Verify company formation and registration", priority:"Critical"},
      {week:"Week 2", action:"File outstanding accounts and confirmations", priority:"Critical"},
      {week:"Week 3", action:"Document board governance and shareholding", priority:"High"},
      {week:"Week 4", action:"Review and execute missing contracts", priority:"Medium"}
    ];
  };

  const handleExportPdf = () => {
    const report = `LEGAL COMPLIANCE REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${complianceScore}%\nItems Complete: ${completedItems}/${totalItems}\n\nSTATUS: ${complianceScore===100?"FULLY COMPLIANT":"IN PROGRESS"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-compliance.txt';
    a.click();
  };

  const handleExportWord = async () => {
    await generateWord({
      title: "Legal Compliance Report",
      subtitle: "UK Company Law Requirements Validation",
      filename: "legal-compliance-report",
      sections: [
        { type: 'score', score: { value: complianceScore, max: 100, label: 'Compliance Score' } },
        { type: 'heading', level: 1, content: 'Compliance Summary' },
        { type: 'paragraph', content: `Items Complete: ${completedItems}/${totalItems}` },
        { type: 'paragraph', content: `Status: ${complianceScore === 100 ? "FULLY COMPLIANT" : "IN PROGRESS"}` },
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Checklist Details' },
        ...LEGAL_ITEMS.map(cat => [
          { type: 'heading' as const, level: 2 as const, content: cat.category },
          { type: 'list' as const, items: cat.items.map(item => `${checks[`${cat.category}-${item}`] ? '✓' : '○'} ${item}`) }
        ]).flat(),
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Recommendations' },
        { type: 'list', items: getRecommendations() },
        { type: 'divider' },
        { type: 'heading', level: 1, content: 'Action Plan' },
        { type: 'table', tableData: {
          headers: ['Week', 'Action', 'Priority'],
          rows: generateActionPlan().map(item => [item.week, item.action, item.priority])
        }}
      ],
      metadata: {
        subject: 'Legal Compliance Report',
        author: 'UK Innovator Founder Visa Assistant',
        keywords: ['legal compliance', 'UK company law', 'visa requirements']
      }
    });
    toast({
      title: "Word Document Exported Successfully",
      description: "Your document has been downloaded as a Word document (.docx).",
    });
  };

  const getSerializedState = () => {
    return {
      checks,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'legal-compliance_handoff';
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Legal Compliance Checker</h1>
              <p className="text-muted-foreground">UK company law requirements validation</p>
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
            toolId="legal-compliance"
            toolName="Legal Compliance Checker"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExportPdf={handleExportPdf}
            onExportWord={handleExportWord}
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
              <TabsTrigger value="overview">Status</TabsTrigger>
              <TabsTrigger value="details">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Legal Compliance</p>
                  <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Items Checked</p>
                  <p className="text-3xl font-bold mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-2xl font-bold ${complianceScore===100?"text-green-600":"text-orange-600"}`}>
                    {complianceScore===100?"✓ Complete":"In Progress"}
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {LEGAL_ITEMS.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${cat.category}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item}`]:!checks[`${cat.category}-${item}`]})} />
                        <span className="text-sm">{item}</span>
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
