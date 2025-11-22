import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, CheckCircle2, Info, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const CRITERIA = [
  {id:"1",category:"Innovation (16.7 points)",items:[
    {name:"Tech-driven innovation",details:"New tech solving real market problem",guides:["Patent pending or filed","Prior art search completed","Competitive advantage documented"]},
    {name:"Scalability demonstrated",details:"Clear path to growth",guides:["3-year growth projections","Market expansion plan","Resource requirements identified"]},
    {name:"Proof of concept",details:"MVP or working prototype exists",guides:["Working demo available","User testing completed","Revenue validation if applicable"]}
  ]},
  {id:"2",category:"Business Viability (16.7 points)",items:[
    {name:"Market validation",details:"Target market identified and researched",guides:["TAM/SAM/SOM calculated","Customer interviews documented","Market trends analysis"]},
    {name:"Business model clarity",details:"Revenue streams defined",guides:["Financial projections 3 years","Unit economics calculated","Customer acquisition cost (CAC) defined"]},
    {name:"Competitive positioning",details:"Clear differentiation",guides:["Competitor benchmarking done","Unique selling points identified","Barriers to entry documented"]}
  ]},
  {id:"3",category:"Business Potential (16.7 points)",items:[
    {name:"Growth trajectory",details:"Achievable business milestones",guides:["Quarterly targets set","KPI definitions clear","Success metrics defined"]},
    {name:"Recruitment capability",details:"Can hire skilled people",guides:["Salary benchmarks researched","Job descriptions prepared","Recruitment timeline planned"]},
    {name:"Investment readiness",details:"Can raise additional funding",guides:["Funding requirements calculated","Use of funds documented","Investor pitch prepared"]}
  ]}
];

const FINANCIAL_REQS = [
  {type:"Application Fee",amount:"£1,274",description:"Standard visa application fee"},
  {type:"Endorsement Fee",amount:"£1,000",description:"Endorser body processing fee"},
  {type:"Health Surcharge",amount:"£1,035",description:"Annual health and care levy"},
  {type:"Savings Requirement",amount:"£1,270",description:"28 consecutive days minimum"},
  {type:"Dependents Support",amount:"£285+",description:"Partner £285, children £200-315 each"}
];

export default function AppReqChecker() {
  const [checks, setChecks] = useState<any>({});
  const [expanded, setExpanded] = useState<any>({});
  const [tab, setTab] = useState("overview");
  
  const criteriaDone = CRITERIA.reduce((sum, cat) => sum + cat.items.filter(i => checks[`${cat.id}-${i.name}`]).length, 0);
  const criteriaTotal = CRITERIA.reduce((sum, cat) => sum + cat.items.length, 0);
  const criteriaScore = Math.round((criteriaDone / criteriaTotal) * 50);
  const totalScore = criteriaScore + 20; // 50 for business + 20 for English/Financial

  const chartData = [
    {name:"Innovation",value:checks["1-Tech-driven innovation"]?16.7:0},
    {name:"Business Viability",value:checks["2-Market validation"]?16.7:0},
    {name:"Business Potential",value:checks["3-Growth trajectory"]?16.7:0},
    {name:"English",value:20},
    {name:"Financial",value:20}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Application Requirements Checker</h1>
          <p className="text-muted-foreground mb-6">PhD-level assessment of your 70-point application readiness</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="criteria">Criteria</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Total Score</p>
                  <p className="text-4xl font-bold mt-2">{totalScore}%</p>
                  <p className="text-xs mt-2">{totalScore>=70?"✓ Ready":totalScore>=50?"⚠ In Progress":"✗ Work needed"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Business Criteria</p>
                  <p className="text-3xl font-bold mt-2">{criteriaScore}%</p>
                  <p className="text-xs text-blue-600 mt-2">{criteriaDone}/{criteriaTotal} complete</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">English Level</p>
                  <p className="text-3xl font-bold mt-2">20%</p>
                  <p className="text-xs mt-2">B2 minimum required</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Financial Proof</p>
                  <p className="text-3xl font-bold mt-2">20%</p>
                  <p className="text-xs mt-2">£1,270 for 28 days</p>
                </Card>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  You need 50 points from business criteria (Innovation + Viability + Potential), 10 for English (B2), and 10 for financial requirements (£1,270 for 28 days).
                </AlertDescription>
              </Alert>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Points Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ffa536" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              {CRITERIA.map(cat => (
                <Card key={cat.id} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-3">
                    {cat.items.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-4 pb-3">
                        <div className="flex gap-2 mb-2">
                          <Checkbox 
                            checked={checks[`${cat.id}-${item.name}`]||false}
                            onCheckedChange={() => setChecks({...checks,[`${cat.id}-${item.name}`]:!checks[`${cat.id}-${item.name}`]})}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.details}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setExpanded({...expanded,[`${cat.id}-${idx}`]:!expanded[`${cat.id}-${idx}`]})}
                          className="text-xs text-primary hover:underline"
                        >
                          {expanded[`${cat.id}-${idx}`]?"Hide":"Show"} requirements
                        </button>
                        {expanded[`${cat.id}-${idx}`] && (
                          <div className="mt-2 bg-blue-50 p-2 rounded text-xs space-y-1">
                            {item.guides.map((g, gi) => <div key={gi}>✓ {g}</div>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Financial Requirements Breakdown</h3>
                <div className="space-y-2">
                  {FINANCIAL_REQS.map((req, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold text-sm">{req.type}</p>
                        <p className="text-xs text-muted-foreground">{req.description}</p>
                      </div>
                      <p className="font-bold text-primary">{req.amount}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded border border-primary">
                  <p className="text-sm font-semibold">Total Estimated Cost: £4,864+</p>
                </div>
              </Card>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  Bank statement must show £1,270 available for 28 consecutive days immediately before application submission.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-3">Readiness Assessment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border-b">
                    <span>Business Innovation Score</span>
                    <span className="font-bold">{checks["1-Tech-driven innovation"]?"16.7":"0"}/16.7</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <span>Market Viability Score</span>
                    <span className="font-bold">{checks["2-Market validation"]?"16.7":"0"}/16.7</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <span>Growth Potential Score</span>
                    <span className="font-bold">{checks["3-Growth trajectory"]?"16.7":"0"}/16.7</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span className="font-semibold">TOTAL BUSINESS CRITERIA</span>
                    <span className="font-bold text-primary">{criteriaScore}/50</span>
                  </div>
                </div>
              </Card>

              {totalScore < 70 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {totalScore < 50 ? "Significant work needed. Focus on business criteria development." : "Nearly ready. Complete remaining business criteria items."}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Complete Assessment
          </Button>
        </div>
      </div>
    </>
  );
}
