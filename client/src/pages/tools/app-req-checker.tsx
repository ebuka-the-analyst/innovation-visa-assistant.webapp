import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, AlertTriangle, CheckCircle2, Info, TrendingUp, Save, Share2, Lightbulb, Calendar, RefreshCw } from "lucide-react";
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
  const [savedDate, setSavedDate] = useState<string>("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  
  const criteriaDone = CRITERIA.reduce((sum, cat) => sum + cat.items.filter(i => checks[`${cat.id}-${i.name}`]).length, 0);
  const criteriaTotal = CRITERIA.reduce((sum, cat) => sum + cat.items.length, 0);
  const criteriaScore = Math.round((criteriaDone / criteriaTotal) * 50);
  const totalScore = criteriaScore + 20;

  const chartData = [
    {name:"Innovation",value:checks["1-Tech-driven innovation"]?16.7:0},
    {name:"Business Viability",value:checks["2-Market validation"]?16.7:0},
    {name:"Business Potential",value:checks["3-Growth trajectory"]?16.7:0},
    {name:"English",value:20},
    {name:"Financial",value:20}
  ];

  // Function 1: Save Progress to localStorage
  const saveProgress = () => {
    localStorage.setItem('appReqCheckerProgress', JSON.stringify(checks));
    localStorage.setItem('appReqCheckerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  // Function 2: Load Progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem('appReqCheckerProgress');
    if (saved) {
      setChecks(JSON.parse(saved));
      const date = localStorage.getItem('appReqCheckerDate');
      setSavedDate(date || '');
    }
  };

  // Function 3: Generate Smart Recommendations
  const getRecommendations = () => {
    const gaps = [];
    if (!checks["1-Tech-driven innovation"]) gaps.push("Develop patent or IP strategy - critical for scoring");
    if (!checks["2-Market validation"]) gaps.push("Conduct customer interviews to validate market demand");
    if (!checks["3-Growth trajectory"]) gaps.push("Create 3-year business plan with measurable milestones");
    if (criteriaDone < 5) gaps.push("Complete at least 5 criteria items before submission");
    if (totalScore < 50) gaps.push("Target minimum 50 points - focus on business criteria first");
    return gaps.slice(0, 5);
  };

  // Function 4: Generate Action Plan with Timeline
  const generateActionPlan = () => {
    const plan = [
      {week:"Week 1-2", action:"Complete Tech Innovation documentation", priority:"Critical"},
      {week:"Week 3-4", action:"Conduct 5+ customer interviews", priority:"High"},
      {week:"Week 5-6", action:"Finalize business plan and financial projections", priority:"High"},
      {week:"Week 7-8", action:"Prepare all supporting documents", priority:"Medium"},
      {week:"Week 9", action:"Final review and submission", priority:"Critical"}
    ];
    return plan;
  };

  // Function 5: Export Assessment Report
  const exportReport = () => {
    const report = `
APPLICATION REQUIREMENTS ASSESSMENT
Date: ${new Date().toLocaleDateString()}
Score: ${totalScore}/70

BUSINESS CRITERIA: ${criteriaScore}/50
- Innovation: ${checks["1-Tech-driven innovation"]?"✓":"✗"}
- Viability: ${checks["2-Market validation"]?"✓":"✗"}
- Potential: ${checks["3-Growth trajectory"]?"✓":"✗"}

ENGLISH & FINANCIAL: 20/20
- English Level: B2+ Required ✓
- Financial: £1,270 for 28 days ✓

STATUS: ${totalScore>=70?"READY FOR SUBMISSION":"NEEDS DEVELOPMENT"}
    `;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-requirements-assessment.txt';
    a.click();
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Application Requirements Checker</h1>
          <p className="text-muted-foreground mb-6">PhD-level assessment of your 70-point application readiness</p>

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={saveProgress} className="gap-2" variant="outline">
              <Save className="w-4 h-4" /> Save Progress
            </Button>
            <Button onClick={() => setShowRecommendations(!showRecommendations)} className="gap-2" variant="outline">
              <Lightbulb className="w-4 h-4" /> Smart Tips
            </Button>
            <Button onClick={() => setShowActionPlan(!showActionPlan)} className="gap-2" variant="outline">
              <Calendar className="w-4 h-4" /> Action Plan
            </Button>
            <Button onClick={exportReport} className="gap-2" variant="outline">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={loadProgress} className="gap-2" variant="outline">
              <RefreshCw className="w-4 h-4" /> Restore
            </Button>
          </div>

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          {showRecommendations && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <h3 className="font-bold mb-2">Smart Recommendations</h3>
              <ul className="space-y-1">
                {getRecommendations().map((rec, i) => <li key={i} className="text-sm">• {rec}</li>)}
              </ul>
            </Card>
          )}

          {showActionPlan && (
            <Card className="p-4 mb-4 bg-green-50 border-green-200">
              <h3 className="font-bold mb-3">Action Plan Timeline</h3>
              <div className="space-y-2">
                {generateActionPlan().map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-bold text-sm">{item.week}</span>
                    <div>
                      <p className="text-sm">{item.action}</p>
                      <span className={`text-xs px-1 ${item.priority==="Critical"?"text-red-600":"text-yellow-600"}`}>{item.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
                  You need 50 points from business criteria, 10 for English (B2), and 10 for financial requirements.
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
                  Bank statement must show £1,270 available for 28 consecutive days.
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
