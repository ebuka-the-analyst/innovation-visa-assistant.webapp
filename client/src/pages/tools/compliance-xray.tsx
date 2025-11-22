import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

const BUSINESS_CATEGORIES = [
  {
    name:"Business Model & Revenue",
    items:[
      {name:"Clear revenue streams",detail:"Multiple revenue sources identified and projectable"},
      {name:"Unit economics validated",detail:"Cost per customer and lifetime value calculated"},
      {name:"Pricing strategy defensible",detail:"Pricing justified by market research"}
    ]
  },
  {
    name:"Innovation & IP",
    items:[
      {name:"IP portfolio documented",detail:"Patents, trademarks, or proprietary tech identified"},
      {name:"Prior art review completed",detail:"Competitive advantage proven through research"},
      {name:"Technology roadmap clear",detail:"Product evolution planned for 24+ months"}
    ]
  },
  {
    name:"Team & Execution",
    items:[
      {name:"Founding team track record",detail:"Previous exits or relevant experience proven"},
      {name:"Key hires identified",detail:"Critical roles and candidates documented"},
      {name:"Organizational structure defined",detail:"Clear reporting lines and accountability"}
    ]
  },
  {
    name:"Market & Competition",
    items:[
      {name:"Market size calculated",detail:"TAM/SAM/SOM quantified with sources"},
      {name:"Competitive landscape mapped",detail:"Direct and indirect competitors analyzed"},
      {name:"Market timing validated",detail:"Entry conditions favorable with evidence"}
    ]
  },
  {
    name:"Growth Trajectory",
    items:[
      {name:"User acquisition plan",detail:"Customer channels and costs modeled"},
      {name:"Retention metrics defined",detail:"Churn rate and expansion revenue planned"},
      {name:"Geographic expansion roadmap",detail:"Market priority and entry strategy clear"}
    ]
  }
];

export default function ComplianceXRay() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");

  const totalItems = BUSINESS_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const analysisScore = Math.round((completedItems / totalItems) * 100);
  const strategicStrength = analysisScore >= 80 ? "Strong" : analysisScore >= 60 ? "Moderate" : "Developing";

  const saveProgress = () => {
    localStorage.setItem('complianceXRayProgress', JSON.stringify(checks));
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('complianceXRayProgress');
    if (saved) setChecks(JSON.parse(saved));
  };

  const getRecommendations = () => {
    const gaps = [];
    if (completedItems < 8) gaps.push("Complete market research on all categories");
    if (!checks["Business Model & Revenue-Clear revenue streams"]) gaps.push("Define multiple revenue stream options");
    if (!checks["Innovation & IP-IP portfolio documented"]) gaps.push("Document all IP and competitive advantages");
    if (!checks["Team & Execution-Founding team track record"]) gaps.push("Highlight founder experience and achievements");
    if (analysisScore < 70) gaps.push("Deepen analysis across all business categories");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1-2", action:"Complete market sizing (TAM/SAM/SOM)", priority:"Critical"},
      {week:"Week 3-4", action:"Document team backgrounds and achievements", priority:"Critical"},
      {week:"Week 5-6", action:"Finalize IP portfolio and competitive analysis", priority:"High"},
      {week:"Week 7-8", action:"Build financial model with growth projections", priority:"High"}
    ];
  };

  const exportReport = () => {
    const report = `COMPLIANCE X-RAY ANALYSIS REPORT\nDate: ${new Date().toLocaleDateString()}\nAnalysis Score: ${analysisScore}%\nStrategic Strength: ${strategicStrength}\nItems Completed: ${completedItems}/${totalItems}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-xray-analysis.txt';
    a.click();
  };

  useEffect(() => { loadProgress(); }, []);

  const riskTimelineData = [
    {month:"M1",marketRisk:85,executionRisk:75,fundingRisk:80},
    {month:"M3",marketRisk:70,executionRisk:65,fundingRisk:72},
    {month:"M6",marketRisk:55,executionRisk:50,fundingRisk:60},
    {month:"M9",marketRisk:40,executionRisk:35,fundingRisk:45},
    {month:"M12",marketRisk:25,executionRisk:20,fundingRisk:30}
  ];

  const categoryScores = BUSINESS_CATEGORIES.map(cat => ({
    category: cat.name.split(" ")[0],
    value: Math.round((cat.items.filter(i => checks[`${cat.name}-${i.name}`]).length / cat.items.length) * 100)
  }));

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compliance X-Ray</h1>
          <p className="text-muted-foreground mb-6">Deep compliance analysis with business scoring</p>

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={saveProgress} className="gap-2" variant="outline"><Save className="w-4 h-4" /> Save</Button>
            <Button className="gap-2" variant="outline"><Lightbulb className="w-4 h-4" /> Tips</Button>
            <Button className="gap-2" variant="outline"><Calendar className="w-4 h-4" /> Plan</Button>
            <Button onClick={exportReport} className="gap-2" variant="outline"><Download className="w-4 h-4" /> Export</Button>
            <Button onClick={loadProgress} className="gap-2" variant="outline"><RefreshCw className="w-4 h-4" /> Restore</Button>
          </div>

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Analysis Score</TabsTrigger>
              <TabsTrigger value="details">Deep Dive</TabsTrigger>
              <TabsTrigger value="timeline">Risk Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Analysis Score</p>
                  <p className="text-4xl font-bold mt-2">{analysisScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems} complete</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Strategic Strength</p>
                  <p className={`text-2xl font-bold ${analysisScore>=80?"text-green-600":analysisScore>=60?"text-yellow-600":"text-orange-600"}`}>
                    {strategicStrength}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${analysisScore>=80?"text-green-600":"text-red-600"}`}>
                    {analysisScore>=80?"Low":"High"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className="text-2xl font-bold">{analysisScore>=70?"Ready":"Developing"}</p>
                </Card>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Complete all 15 business analysis items to achieve strong visa application support.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {BUSINESS_CATEGORIES.map((cat, i) => (
                <Card key={i} className="p-4 border-l-4 border-primary">
                  <h3 className="font-bold mb-3">{cat.name}</h3>
                  <div className="space-y-3">
                    {cat.items.map((item, j) => (
                      <div key={j} className="border border-gray-200 p-3 rounded hover:bg-gray-50">
                        <label className="flex gap-3">
                          <Checkbox checked={checks[`${cat.name}-${item.name}`]||false}
                            onCheckedChange={() => setChecks({...checks,[`${cat.name}-${item.name}`]:!checks[`${cat.name}-${item.name}`]})} />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Risk Mitigation Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="marketRisk" stroke="#ef4444" strokeWidth={2} name="Market Risk" />
                    <Line type="monotone" dataKey="executionRisk" stroke="#f59e0b" strokeWidth={2} name="Execution Risk" />
                    <Line type="monotone" dataKey="fundingRisk" stroke="#8b5cf6" strokeWidth={2} name="Funding Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold mb-3">Risk Mitigation Strategy</h3>
                <div className="space-y-2">
                  <div className="p-2 border-l-4 border-red-500 bg-red-50"><p className="text-sm font-semibold">Market Risk</p>
                    <p className="text-xs">Validate product-market fit with 20+ customer interviews</p></div>
                  <div className="p-2 border-l-4 border-orange-500 bg-orange-50"><p className="text-sm font-semibold">Execution Risk</p>
                    <p className="text-xs">Hire experienced CTOs and ops leads with proven track records</p></div>
                  <div className="p-2 border-l-4 border-purple-500 bg-purple-50"><p className="text-sm font-semibold">Funding Risk</p>
                    <p className="text-xs">Build 18-month runway; secure bridge financing options</p></div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
