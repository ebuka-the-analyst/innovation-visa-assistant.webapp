import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, AlertTriangle, CheckCircle2, Save, Share2, Lightbulb, Calendar, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const ITEMS = [
  {id:"1",name:"Company Structure Audit",cat:"Legal",pen:"Critical"},
  {id:"2",name:"Ownership & Equity Verification",cat:"Legal",pen:"High"},
  {id:"3",name:"Director & Board Compliance",cat:"Legal",pen:"Critical"},
  {id:"4",name:"Shareholder Records",cat:"Legal",pen:"High"},
  {id:"5",name:"Annual Accounts (3 years)",cat:"Financial",pen:"Critical"},
  {id:"6",name:"Tax Returns Filed",cat:"Tax",pen:"Critical"},
  {id:"7",name:"Payroll & PAYE Compliance",cat:"HR",pen:"High"},
  {id:"8",name:"Employee Records Complete",cat:"HR",pen:"High"}
];

export default function ComplianceChecker() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const done = Object.values(checks).filter(Boolean).length;
  const score = Math.round((done/8)*100);

  const saveProgress = () => {
    localStorage.setItem('complianceCheckerProgress', JSON.stringify(checks));
    localStorage.setItem('complianceCheckerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('complianceCheckerProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('complianceCheckerDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["1"]) gaps.push("Verify Companies House registration immediately");
    if (!checks["5"]) gaps.push("File latest 3 years of annual accounts");
    if (!checks["6"]) gaps.push("Ensure all tax returns submitted on time");
    if (done < 5) gaps.push("Complete at least 5 critical items before submission");
    if (score < 80) gaps.push("Target 100% compliance - address all gaps");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Legal audit - verify company registration", priority:"Critical"},
      {week:"Week 2", action:"Financial review - file accounts if missing", priority:"Critical"},
      {week:"Week 3", action:"HR documentation - collect all records", priority:"High"},
      {week:"Week 4", action:"Final verification and review", priority:"Medium"}
    ];
  };

  const exportReport = () => {
    const report = `COMPLIANCE CHECKER REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${score}%\nItems Completed: ${done}/8\n\nSTATUS: ${score>=80?"COMPLIANT":"REVIEW NEEDED"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-audit.txt';
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
    const handoffKey = 'compliance-checker_handoff';
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

  const chartData = [
    {name:"Compliant",value:done,fill:"#22c55e"},
    {name:"Pending",value:8-done,fill:"#ef4444"}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compliance Checker</h1>
          <p className="text-muted-foreground mb-6">Full compliance audit</p>

          <ToolUtilityBar
            toolId="compliance-checker"
            toolName="Compliance Checker"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExport={exportReport}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          {showRecommendations && (
            <Card className="p-4 mb-4 bg-blue-50"><h3 className="font-bold mb-2">Smart Recommendations</h3>
              <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul></Card>
          )}

          {showActionPlan && (
            <Card className="p-4 mb-4 bg-green-50"><h3 className="font-bold mb-3">Action Plan</h3>
              <div className="space-y-2">{generateActionPlan().map((item, i) => (
                <div key={i} className="flex gap-3"><span className="font-bold text-sm">{item.week}</span>
                  <div><p className="text-sm">{item.action}</p><span className="text-xs text-red-600">{item.priority}</span></div></div>
              ))}</div></Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-3xl font-bold mt-2">{score}%</p>
                </Card>
                <Card className="p-4"><p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-3xl font-bold mt-2">{done}/8</p></Card>
                <Card className="p-4"><p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-lg font-bold mt-2">{score>=80?"✓ Compliant":"✗ Review"}</p></Card>
              </div>

              <Card className="p-4">
                <h3 className="font-bold mb-4">Compliance Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                      {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-2">
              {ITEMS.map(i => (
                <Card key={i.id} className={`p-3 border-l-4 ${i.pen==="Critical"?"border-l-red-500":"border-l-blue-500"}`}>
                  <label className="flex gap-3">
                    <Checkbox checked={checks[i.id]||false} onCheckedChange={()=>setChecks({...checks,[i.id]:!checks[i.id]})} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.cat} • {i.pen}</p>
                    </div>
                  </label>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
