import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw, Zap } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BUSINESS_ANALYSIS_CATEGORIES = [
  {name:"Company Health",items:["Financial runway 18+ months","Burn rate sustainable","Revenue or strong PMF signals"]},
  {name:"Product-Market Fit",items:["Customer retention 80%+","Net Promoter Score 50+","Revenue or usage growth 200% YoY"]},
  {name:"Team Capability",items:["Founder business experience","Technical co-founder present","Key hires hired/committed"]},
  {name:"Market Timing",items:["Market inflection point reached","Early mover advantage clear","Regulatory environment favorable"]},
  {name:"IP & Defensibility",items:["Patent protection strategy","Moat documentation complete","Competitive advantages clear"]}
];

export default function DeepXRay() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = BUSINESS_ANALYSIS_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const businessScore = Math.round((completedItems / totalItems) * 100);
  const vsApprovedAvg = businessScore - 70;

  const saveProgress = () => {
    localStorage.setItem('deepXRayProgress', JSON.stringify(checks));
    localStorage.setItem('deepXRayDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('deepXRayProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('deepXRayDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (!checks["Company Health-Financial runway 18+ months"]) gaps.push("Secure 18+ month runway before application");
    if (!checks["Product-Market Fit-Customer retention 80%+"]) gaps.push("Improve customer retention to 80%+");
    if (!checks["Team Capability-Founder business experience"]) gaps.push("Document founder track record and achievements");
    if (businessScore < 70) gaps.push("Target 70%+ score to match approved average");
    if (completedItems < 10) gaps.push("Complete at least 10 business criteria items");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1-2", action:"Secure financial runway and validate burn rate", priority:"Critical"},
      {week:"Week 3-4", action:"Document team backgrounds and key hires", priority:"Critical"},
      {week:"Week 5-6", action:"Complete IP protection strategy", priority:"High"},
      {week:"Week 7-8", action:"Finalize market timing validation", priority:"Medium"}
    ];
  };

  const exportReport = () => {
    const report = `DEEP X-RAY BUSINESS ANALYSIS\nDate: ${new Date().toLocaleDateString()}\nBusiness Score: ${businessScore}%\nItems Complete: ${completedItems}/${totalItems}\nvs Approved Avg: ${vsApprovedAvg>0?"+":""}${vsApprovedAvg}%\n\nSTATUS: ${businessScore>=70?"STRONG":"DEVELOPING"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deep-xray-analysis.txt';
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
    const handoffKey = 'deep-xray_handoff';
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

  const benchmarkData = [
    {name:"Your Company",x:businessScore,y:completedItems,fill:"#ef4444"},
    {name:"Avg Approved",x:70,y:16,fill:"#22c55e"},
    {name:"Avg Rejected",x:35,y:8,fill:"#6b7280"}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Deep X-Ray</h1>
          <p className="text-muted-foreground mb-6">Complete business health analysis and benchmarking</p>

          <ToolUtilityBar
            toolId="deep-xray"
            toolName="Deep X-Ray"
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Business Score</TabsTrigger>
              <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Business Score</p>
                  <p className="text-4xl font-bold mt-2">{businessScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems} complete</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className={`text-2xl font-bold ${businessScore>=70?"text-green-600":"text-orange-600"}`}>
                    {businessScore>=70?"Strong":"Developing"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">vs Approved Avg</p>
                  <p className={`text-2xl font-bold ${vsApprovedAvg>0?"text-green-600":"text-red-600"}`}>
                    {vsApprovedAvg>0?"+":""}{vsApprovedAvg}%
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Approval Likelihood</p>
                  <p className="text-2xl font-bold text-primary">{Math.max(20, businessScore)}%</p>
                </Card>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Strong business fundamentals significantly improve visa approval odds. Target 70%+ score.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {BUSINESS_ANALYSIS_CATEGORIES.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.name}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox checked={checks[`${cat.name}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.name}-${item}`]:!checks[`${cat.name}-${item}`]})} />
                        <span className="text-sm flex-1">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="benchmark" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Performance Benchmarking</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{top:20,right:20,bottom:20,left:20}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Score %" unit="%" />
                    <YAxis dataKey="y" name="Items Complete" />
                    <Tooltip cursor={{strokeDasharray:"3 3"}} formatter={(value)=>value} />
                    <Legend />
                    <Scatter name="Your Company" data={[benchmarkData[0]]} fill={benchmarkData[0].fill} />
                    <Scatter name="Avg Approved" data={[benchmarkData[1]]} fill={benchmarkData[1].fill} />
                    <Scatter name="Avg Rejected" data={[benchmarkData[2]]} fill={benchmarkData[2].fill} />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold mb-3">Competitive Position</h3>
                <div className="space-y-2">
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <p className="text-sm font-semibold">Approved Applications</p>
                    <p className="text-xs">Average score: 70%, 16 criteria met</p>
                  </div>
                  <div className="p-3 border-l-4 border-red-500 bg-red-50">
                    <p className="text-sm font-semibold">Rejected Applications</p>
                    <p className="text-xs">Average score: 35%, 8 criteria met</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
