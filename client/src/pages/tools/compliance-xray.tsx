import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEEP_ANALYSIS_AREAS = [
  {
    area:"Business Model & Revenue",
    depth:"Strategic",
    items:[
      {name:"Revenue Model Clarity",detail:"Is revenue generation mechanism clear and validated?",guidance:"Define: subscriptions, licensing, commission, marketplace, hybrid models"},
      {name:"Unit Economics",detail:"Can you calculate profit per customer/transaction?",guidance:"Calculate: CAC, LTV, gross margin, payback period"},
      {name:"Market Sizing",detail:"Quantified TAM/SAM/SOM with sources?",guidance:"Use: Gartner, IDC, government stats, primary research"}
    ]
  },
  {
    area:"Innovation & IP",
    depth:"Strategic",
    items:[
      {name:"Technical Differentiation",detail:"What technology gives competitive advantage?",guidance:"Document: patents pending, novel algorithms, proprietary data"},
      {name:"Barrier to Entry",detail:"Why can't competitors easily replicate?",guidance:"Identify: scale, network effects, regulatory, switching costs"},
      {name:"IP Protection",detail:"Is IP defensible and protected?",guidance:"Consider: patents, trademarks, trade secrets, NDAs"}
    ]
  },
  {
    area:"Team & Execution",
    depth:"Operational",
    items:[
      {name:"Founder-Market Fit",detail:"Does team have relevant domain expertise?",guidance:"Check: prior exits, industry experience, technical skills, startup experience"},
      {name:"Execution Capability",detail:"Can team build and scale this?",guidance:"Evidence: previous successfully launched products, team track record"},
      {name:"Advisory Network",detail:"Access to domain experts and strategic advisors?",guidance:"Advisors from: industry, finance, technology, government relations"}
    ]
  },
  {
    area:"Market & Competition",
    depth:"Strategic",
    items:[
      {name:"Market Timing",detail:"Is market ready for this solution now?",guidance:"Validate: customer interviews, purchase intent surveys, pilot data"},
      {name:"Competitive Landscape",detail:"Who are direct and indirect competitors?",guidance:"Map: feature comparison, pricing, market share, positioning"},
      {name:"Customer Pain Point",detail:"Is problem significant and urgent?",guidance:"Evidence: interview notes, willingness to pay, problem validation"}
    ]
  },
  {
    area:"Growth Trajectory",
    depth:"Operational",
    items:[
      {name:"User Acquisition Strategy",detail:"How will you acquire first 10,000 customers?",guidance:"Channels: organic, paid, partnerships, virality metrics, CAC analysis"},
      {name:"Retention & Engagement",detail:"How do you keep users coming back?",guidance:"Metrics: daily active users, churn rate, engagement loops, monetization"},
      {name:"International Expansion",detail:"How does model scale to other geographies?",guidance:"Plan: localization, regulatory compliance, market entry strategy"}
    ]
  }
];

const riskSeverityChart = [
  {month:"Month 1",marketRisk:75,executionRisk:70,fundingRisk:60},
  {month:"Month 3",marketRisk:65,executionRisk:60,fundingRisk:50},
  {month:"Month 6",marketRisk:55,executionRisk:45,fundingRisk:40},
  {month:"Month 12",marketRisk:40,executionRisk:30,fundingRisk:25}
];

export default function ComplianceXRay() {
  const [checks, setChecks] = useState<any>({});
  const [expanded, setExpanded] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = DEEP_ANALYSIS_AREAS.reduce((sum, a) => sum + a.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const analysisScore = Math.round((completedItems / totalItems) * 100);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compliance X-Ray</h1>
          <p className="text-muted-foreground mb-6">Deep analysis uncovering hidden compliance & business viability risks</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Analysis Score</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="risks">Risk Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Analysis Depth</p>
                  <p className="text-4xl font-bold mt-2">{analysisScore}%</p>
                  <p className="text-xs mt-2">{completedItems}/{totalItems} areas analyzed</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Strategic Strength</p>
                  <p className="text-3xl font-bold mt-2">{analysisScore>=70?"Strong":analysisScore>=50?"Moderate":"Weak"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold mt-2 ${100-analysisScore>40?"text-red-600":100-analysisScore>20?"text-yellow-600":"text-green-600"}`}>
                    {100-analysisScore>40?"High":100-analysisScore>20?"Medium":"Low"}
                  </p>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {DEEP_ANALYSIS_AREAS.map((area, i) => {
                  const areaItems = area.items.filter(item => checks[`${area.area}-${item.name}`]).length;
                  const areaScore = Math.round((areaItems / area.items.length) * 100);
                  return (
                    <Card key={i} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-sm">{area.area}</p>
                        <p className="text-lg font-bold text-primary">{areaScore}%</p>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div style={{width:`${areaScore}%`}} className="bg-primary h-2 rounded-full"/>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{areaItems}/{area.items.length} items</p>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {DEEP_ANALYSIS_AREAS.map((area, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold">{area.area}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{area.depth}</span>
                  </div>
                  <div className="space-y-3">
                    {area.items.map((item, j) => (
                      <div key={j} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex gap-2 mb-2">
                          <Checkbox 
                            checked={checks[`${area.area}-${item.name}`]||false}
                            onCheckedChange={() => setChecks({...checks,[`${area.area}-${item.name}`]:!checks[`${area.area}-${item.name}`]})}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setExpanded({...expanded,[`${area.area}-${j}`]:!expanded[`${area.area}-${j}`]})}
                          className="text-xs text-primary hover:underline"
                        >
                          {expanded[`${area.area}-${j}`]?"Hide":"Show"} deep dive
                        </button>
                        {expanded[`${area.area}-${j}`] && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            {item.guidance}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Risk Evolution Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskSeverityChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="marketRisk" stroke="#ef4444" name="Market Risk" />
                    <Line type="monotone" dataKey="executionRisk" stroke="#f59e0b" name="Execution Risk" />
                    <Line type="monotone" dataKey="fundingRisk" stroke="#3b82f6" name="Funding Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Risk levels decrease as you validate market assumptions and prove execution capability. Prioritize early customer validation and pilot programs.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Deep X-Ray Report
          </Button>
        </div>
      </div>
    </>
  );
}
