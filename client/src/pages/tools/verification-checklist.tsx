import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, CheckCircle2, AlertTriangle, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const VERIFICATION_ITEMS = [
  {section:"Application Completeness",critical:true,items:["All form sections completed","No blank mandatory fields","Consistent information across forms","References included where required","Signature/declaration signed"]},
  {section:"Financial Verification",critical:true,items:["Bank statements show 1270 plus for 28 days","Funds in personal name","No suspicious large deposits","Transaction history reasonable","Source of funds documented"]},
  {section:"Business Verification",critical:true,items:["Companies House records current","Company in good standing","Annual accounts filed","Director details current","Registered office address verified"]},
  {section:"Identity Verification",critical:true,items:["Passport valid and legible","Passport covers visa duration","Name consistent across documents","Date of birth consistent","Identification documents certified"]},
  {section:"Endorsement Verification",critical:true,items:["Endorsement letter signed","Endorser approved by UKVI","Endorsement period covers visa duration","All supporting evidence attached","Reference numbers match UKVI records"]}
];

export default function VerificationChecklist() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = VERIFICATION_ITEMS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const criticalItems = VERIFICATION_ITEMS.filter(s => s.critical).reduce((sum, s) => sum + s.items.length, 0);
  const criticalDone = VERIFICATION_ITEMS.filter(s => s.critical).reduce((sum, s) => sum + s.items.filter(i => checks[`${s.section}-${i}`]).length, 0);
  const readinessScore = Math.round((completedItems / totalItems) * 100);
  const readyToSubmit = criticalDone === criticalItems && readinessScore >= 80;

  const saveProgress = () => {
    localStorage.setItem('verificationChecklistProgress', JSON.stringify(checks));
    localStorage.setItem('verificationChecklistDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('verificationChecklistProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('verificationChecklistDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (criticalDone < criticalItems) gaps.push(`Complete ${criticalItems - criticalDone} critical items immediately`);
    if (!checks["Financial Verification-Bank statements show 1270 plus for 28 days"]) gaps.push("Obtain 28-day bank statement showing £1,270 minimum");
    if (!checks["Endorsement Verification-Endorsement letter signed"]) gaps.push("Secure signed endorsement letter from approved body");
    if (readinessScore < 80) gaps.push("Target 80%+ completion before submission");
    if (readyToSubmit) gaps.push("All verified - ready to submit application!");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Complete all form sections and signatures", priority:"Critical"},
      {week:"Week 2", action:"Gather financial documents and 28-day statements", priority:"Critical"},
      {week:"Week 3", action:"Verify business and identity documentation", priority:"Critical"},
      {week:"Week 4", action:"Final endorsement verification and submission", priority:"Critical"}
    ];
  };

  const exportReport = () => {
    const report = `VERIFICATION CHECKLIST REPORT\nDate: ${new Date().toLocaleDateString()}\nReadiness Score: ${readinessScore}%\nCritical Items: ${criticalDone}/${criticalItems}\nTotal Items: ${completedItems}/${totalItems}\n\nSTATUS: ${readyToSubmit?"READY FOR SUBMISSION":"PENDING"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verification-checklist.txt';
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
    const handoffKey = 'verification-checklist_handoff';
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
          <h1 className="text-4xl font-bold mb-2">Complete Verification Checklist</h1>
          <p className="text-muted-foreground mb-6">Final verification before submission</p>

          <ToolUtilityBar
            toolId="verification-checklist"
            toolName="Complete Verification Checklist"
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
                    <span className="text-xs text-red-600">{item.priority}</span>
                  </div>
                </div>
              ))}</div>
            </Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Submission Ready</TabsTrigger>
              <TabsTrigger value="verification">Final Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Verification Complete</p>
                  <p className="text-4xl font-bold mt-2">{readinessScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Critical Items</p>
                  <p className="text-3xl font-bold mt-2">{criticalDone}/{criticalItems}</p>
                  <p className={`text-xs mt-2 ${criticalDone === criticalItems ? "text-green-600":"text-red-600"}`}>
                    {criticalDone === criticalItems ? "✓ All done":"⚠ Missing"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Submission Status</p>
                  <p className={`text-2xl font-bold ${readyToSubmit ? "text-green-600":"text-orange-600"}`}>
                    {readyToSubmit ? "✓ READY" : "PENDING"}
                  </p>
                </Card>
                <Card className={`p-4 ${readyToSubmit ? "bg-green-50":"bg-orange-50"}`}>
                  <p className="text-xs text-muted-foreground">Risk Assessment</p>
                  <p className={`text-lg font-bold ${readyToSubmit ? "text-green-600":"text-orange-600"}`}>
                    {readyToSubmit ? "LOW" : "MODERATE"}
                  </p>
                </Card>
              </div>

              {readyToSubmit ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Application complete and ready for submission. All critical items verified.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {criticalDone < criticalItems ? `${criticalItems - criticalDone} critical items incomplete.` : `Increase overall readiness to 80 percent before submission.`}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {VERIFICATION_ITEMS.map((section, i) => (
                <Card key={i} className={`p-4 border-l-4 ${section.critical ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{section.section}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${section.critical ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                      {section.critical ? "Critical":"Supporting"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${section.section}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${section.section}-${item}`]:!checks[`${section.section}-${item}`]})} />
                        <span className="text-sm flex-1">{item}</span>
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
