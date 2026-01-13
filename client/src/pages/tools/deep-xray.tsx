import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";


import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw, Zap, Target, TrendingUp } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: 'deep-xray',
  toolName: 'Deep X-Ray Business Analysis',
  agent: 'nova',
  greeting: "Hello! I'm Nova, your Innovation Catalyst. I'll help you conduct a deep analysis of your business health and readiness. This comprehensive assessment covers the key areas that determine visa approval likelihood. Let's analyze your business fundamentals!",
  questions: [
    {
      id: 'financial-runway',
      question: "What's your financial runway? Do you have 18+ months of funding secured?",
      hint: "Endorsing bodies want to see financial stability - include funding sources and burn rate",
      fieldKey: 'financialRunway',
      minLength: 40
    },
    {
      id: 'product-market-fit',
      question: "Describe your product-market fit evidence. What metrics prove customers want your product?",
      hint: "Customer retention, NPS scores, revenue growth, usage patterns",
      fieldKey: 'productMarketFit',
      minLength: 60
    },
    {
      id: 'team-capability',
      question: "What's your founding team's track record? Include relevant experience and key achievements.",
      hint: "Previous exits, domain expertise, technical capabilities, advisory board",
      fieldKey: 'teamCapability',
      minLength: 60
    },
    {
      id: 'market-timing',
      question: "Why is now the right time for your business? What market conditions favor you?",
      hint: "Market inflection points, regulatory changes, technology shifts, pandemic effects",
      fieldKey: 'marketTiming',
      minLength: 50
    },
    {
      id: 'ip-defensibility',
      question: "What makes your business defensible? Describe your IP, moats, and competitive advantages.",
      hint: "Patents, proprietary technology, network effects, switching costs, brand",
      fieldKey: 'ipDefensibility',
      minLength: 50
    },
    {
      id: 'growth-evidence',
      question: "What evidence of growth do you have? Share key metrics showing traction.",
      hint: "MRR growth, user growth, customer acquisition trends, expansion revenue",
      fieldKey: 'growthEvidence',
      minLength: 50
    }
  ],
  completionMessage: "Excellent! You've completed a comprehensive business health assessment. I've identified your strengths and areas for improvement. This analysis helps you understand how your business compares to successful visa applications."
};

const BUSINESS_ANALYSIS_CATEGORIES = [
  {name:"Company Health",items:["Financial runway 18+ months","Burn rate sustainable","Revenue or strong PMF signals"]},
  {name:"Product-Market Fit",items:["Customer retention 80%+","Net Promoter Score 50+","Revenue or usage growth 200% YoY"]},
  {name:"Team Capability",items:["Founder business experience","Technical co-founder present","Key hires hired/committed"]},
  {name:"Market Timing",items:["Market inflection point reached","Early mover advantage clear","Regulatory environment favorable"]},
  {name:"IP & Defensibility",items:["Patent protection strategy","Moat documentation complete","Competitive advantages clear"]}
];

export default function DeepXRay() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('deep-xray-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('deep-xray-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

  useEffect(() => {
    localStorage.setItem('deep-xray-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, any>) => {
    const newChecks: any = { ...checks };
    
    if (answers.financialRunway && answers.financialRunway.length > 30) {
      if (answers.financialRunway.toLowerCase().includes('18') || 
          answers.financialRunway.toLowerCase().includes('secure')) {
        newChecks["Company Health-Financial runway 18+ months"] = true;
      }
      newChecks["Company Health-Burn rate sustainable"] = true;
    }
    
    if (answers.productMarketFit && answers.productMarketFit.length > 40) {
      if (answers.productMarketFit.toLowerCase().includes('retention') ||
          answers.productMarketFit.toLowerCase().includes('80')) {
        newChecks["Product-Market Fit-Customer retention 80%+"] = true;
      }
      if (answers.productMarketFit.toLowerCase().includes('growth')) {
        newChecks["Product-Market Fit-Revenue or usage growth 200% YoY"] = true;
      }
    }
    
    if (answers.teamCapability && answers.teamCapability.length > 40) {
      newChecks["Team Capability-Founder business experience"] = true;
      if (answers.teamCapability.toLowerCase().includes('technical') ||
          answers.teamCapability.toLowerCase().includes('cto') ||
          answers.teamCapability.toLowerCase().includes('engineer')) {
        newChecks["Team Capability-Technical co-founder present"] = true;
      }
    }
    
    if (answers.marketTiming && answers.marketTiming.length > 40) {
      newChecks["Market Timing-Market inflection point reached"] = true;
    }
    
    if (answers.ipDefensibility && answers.ipDefensibility.length > 40) {
      if (answers.ipDefensibility.toLowerCase().includes('patent')) {
        newChecks["IP & Defensibility-Patent protection strategy"] = true;
      }
      newChecks["IP & Defensibility-Competitive advantages clear"] = true;
    }
    
    setChecks(newChecks);
    setMode('traditional');
  };

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

  const benchmarkData = [
    {name:"Your Company",x:businessScore,y:completedItems,fill:"#ef4444"},
    {name:"Avg Approved",x:70,y:16,fill:"#22c55e"},
    {name:"Avg Rejected",x:35,y:8,fill:"#6b7280"}
  ];

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold mb-2">Deep X-Ray</h1>
              <p className="text-muted-foreground">Complete business health analysis and benchmarking</p>
            </div>
            <AiTraditionalToggle
              mode={mode}
              onModeChange={setMode}
              aiLabel="AI-Guided"
              traditionalLabel="Traditional Form"
              userTier={userTier}
            />
          </div>

          {mode === 'ai' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <AiToolGuide
                config={AI_TOOL_CONFIG}
                onComplete={handleAiComplete}
                onSwitchToTraditional={() => setMode('traditional')}
                userTier={userTier}
              />
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Business Health Categories</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>This deep analysis evaluates five critical business areas:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Company Health:</strong> Financial stability and sustainability</li>
                      <li><strong>Product-Market Fit:</strong> Customer validation and retention</li>
                      <li><strong>Team Capability:</strong> Founder experience and key hires</li>
                      <li><strong>Market Timing:</strong> Right conditions for your business</li>
                      <li><strong>IP & Defensibility:</strong> Competitive moats and protection</li>
                    </ul>
                  </div>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Business Score</span>
                    </div>
                    <p className="text-lg font-bold">{businessScore}%</p>
                    <p className="text-xs text-muted-foreground">{completedItems}/{totalItems} complete</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">vs Approved</span>
                    </div>
                    <p className={`text-lg font-bold ${vsApprovedAvg >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {vsApprovedAvg > 0 ? '+' : ''}{vsApprovedAvg}%
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold mb-2">Smart Recommendations</h3>
                  <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul>
                </Card>
              )}

              {showActionPlan && (
                <Card className="p-4 mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
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
                      <p className="text-xl font-bold mt-2">{businessScore}%</p>
                      <p className="text-xs mt-2">{completedItems}/{totalItems} complete</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">Readiness</p>
                      <p className={`text-lg font-bold ${businessScore>=70?"text-green-600":"text-orange-600"}`}>
                        {businessScore>=70?"Strong":"Developing"}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">vs Approved Avg</p>
                      <p className={`text-lg font-bold ${vsApprovedAvg>0?"text-green-600":"text-red-600"}`}>
                        {vsApprovedAvg>0?"+":""}{vsApprovedAvg}%
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">Approval Likelihood</p>
                      <p className="text-lg font-bold text-primary">{Math.max(20, businessScore)}%</p>
                    </Card>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
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
                          <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
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
                      <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                        <p className="text-sm font-semibold">Approved Applications</p>
                        <p className="text-xs">Average score: 70%, 16 criteria met</p>
                      </div>
                      <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                        <p className="text-sm font-semibold">Rejected Applications</p>
                        <p className="text-xs">Average score: 35%, 8 criteria met</p>
                      </div>
                    </div>
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
