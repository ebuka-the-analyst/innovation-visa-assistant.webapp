import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const LEGAL_ITEMS = [
  {category:"Company Formation",items:["Incorporated at Companies House","Memorandum & Articles of Association","Company registration certificate"]},
  {category:"Shareholding",items:["Shares properly allotted","Share certificates issued","Shareholder agreements in place"]},
  {category:"Board Governance",items:["Board meetings held regularly","Minutes documented","Decisions properly authorized"]},
  {category:"Regulatory Filings",items:["Annual accounts filed","Confirmation statement filed annually","Tax returns submitted on time"]},
  {category:"Contracts",items:["Customer contracts documented","Supplier agreements in place","Employee contracts executed"]}
];

export default function LegalCompliance() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = LEGAL_ITEMS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

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

  const exportReport = () => {
    const report = `LEGAL COMPLIANCE REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${complianceScore}%\nItems Complete: ${completedItems}/${totalItems}\n\nSTATUS: ${complianceScore===100?"FULLY COMPLIANT":"IN PROGRESS"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-compliance.txt';
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
    const handoffKey = 'legal-compliance_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if (payload.checks) setChecks(payload.checks);
        if (payload.savedDate) setSavedDate(payload.savedDate);
        if (payload.tab) setTab(payload.tab);
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
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Legal Compliance Checker</h1>
          <p className="text-muted-foreground mb-6">UK company law requirements validation</p>

          <ToolUtilityBar
            toolId="legal-compliance"
            toolName="Legal Compliance Checker"
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
        </div>
      </div>
    </>
  );
}
