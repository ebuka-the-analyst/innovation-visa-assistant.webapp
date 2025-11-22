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
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const HR_ITEMS = [
  {area:"Employment Contracts",items:["Written contract for each employee","Clear terms and conditions","Salary and benefits specified"]},
  {area:"Payroll & Tax",items:["PAYE registered with HMRC","Monthly payroll submissions","P11D filed for directors"]},
  {area:"Health & Safety",items:["H&S policy (if 5+ employees)","Risk assessment completed","Accident reporting procedure"]},
  {area:"Working Hours",items:["Maximum 48 hours per week enforced","Rest breaks provided","Holiday records maintained"]},
  {area:"Minimum Wage",items:["National Minimum Wage verified","Income tax deductions correct","Records maintained for 3 years"]}
];

export default function HRCompliance() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = HR_ITEMS.reduce((sum, a) => sum + a.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const saveProgress = () => {
    localStorage.setItem('hrComplianceProgress', JSON.stringify(checks));
    localStorage.setItem('hrComplianceDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('hrComplianceProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('hrComplianceDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["Employment Contracts-Written contract for each employee"]) gaps.push("Issue written contracts to all employees immediately");
    if (!checks["Payroll & Tax-PAYE registered with HMRC"]) gaps.push("Register for PAYE with HMRC");
    if (!checks["Minimum Wage-National Minimum Wage verified"]) gaps.push("Verify all wages meet National Minimum Wage");
    if (complianceScore < 80) gaps.push("Complete all HR compliance items to avoid penalties");
    if (completedItems < 10) gaps.push("Address critical employment law requirements first");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Audit all employment contracts and issue missing ones", priority:"Critical"},
      {week:"Week 2", action:"Register for PAYE and file outstanding submissions", priority:"Critical"},
      {week:"Week 3", action:"Complete H&S policy and risk assessments", priority:"High"},
      {week:"Week 4", action:"Verify wage compliance and maintain records", priority:"High"}
    ];
  };

  const exportReport = () => {
    const report = `HR COMPLIANCE REPORT\nDate: ${new Date().toLocaleDateString()}\nCompliance Score: ${complianceScore}%\nItems Complete: ${completedItems}/${totalItems}\n\nSTATUS: ${complianceScore>=80?"COMPLIANT":"REVIEW NEEDED"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hr-compliance.txt';
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
    const handoffKey = 'hr-compliance_handoff';
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
    {name:"Compliant",value:completedItems,fill:"#22c55e"},
    {name:"Pending",value:totalItems-completedItems,fill:"#ef4444"}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">HR Compliance Checklist</h1>
          <p className="text-muted-foreground mb-6">UK employment law verification</p>

          <ToolUtilityBar
            toolId="hr-compliance"
            toolName="HR Compliance Checklist"
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
              <TabsTrigger value="overview">Compliance Status</TabsTrigger>
              <TabsTrigger value="checklist">Detailed Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">HR Compliance</p>
                  <p className="text-4xl font-bold mt-2">{complianceScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems} items</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-2xl font-bold ${complianceScore>=80?"text-green-600":"text-yellow-600"}`}>
                    {complianceScore>=80?"✓ Compliant":"⚠ Review"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Penalty Risk</p>
                  <p className={`text-sm font-bold ${complianceScore>=80?"text-green-600":"text-red-600"}`}>
                    {complianceScore>=80?"Low":"High"}
                  </p>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-bold mb-4">Compliance Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({name,value})=>`${name}: ${value}`} outerRadius={80} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {HR_ITEMS.map((area, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{area.area}</h3>
                  <div className="space-y-2">
                    {area.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${area.area}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${area.area}-${item}`]:!checks[`${area.area}-${item}`]})} />
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
