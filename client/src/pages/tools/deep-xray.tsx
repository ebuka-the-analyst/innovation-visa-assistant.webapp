import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEEP_ANALYSIS = [
  {category:"Company Health",items:["3-year revenue growth",">30% YoY growth demonstrated","Unit economics positive","Customer LTV > 3x CAC","Gross margin >60%"]},
  {category:"Product-Market Fit",items:["<5% monthly churn","NPS score >50",">40% feature adoption","Organic referral rate >20%","Customer satisfaction >4.5/5"]},
  {category:"Team Capability",items:["Founder has 5+ years domain experience","CTO has shipped 2+ products","CFO has raised $5M+","Avg team tenure >2 years","Team from top tech/finance"]},
  {category:"Market Timing",items:["TAM growing >30% annually","Category adoption inflection point","Regulatory tailwinds emerging","Competitor funding declining","Customer urgency validated"]},
  {category:"IP & Defensibility",items:["Patent pending or filed","Technology 3+ years ahead","Network effects emerging","High switching costs","Data moat developing"]}
];

const visaScatterData = [
  {innovationScore:85,scalabilityScore:90,viabilityScore:88,name:"Your Company"},
  {innovationScore:72,scalabilityScore:68,viabilityScore:75,name:"Avg Approved",opacity:0.5},
  {innovationScore:45,scalabilityScore:52,viabilityScore:48,name:"Avg Rejected",opacity:0.3}
];

export default function DeepXRay() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");
  
  const totalItems = DEEP_ANALYSIS.reduce((sum, c) => sum + c.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const businessScore = Math.round((completedItems / totalItems) * 100);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Deep X-Ray</h1>
          <p className="text-muted-foreground mb-6">Complete business analysis - benchmark against approved applications</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Score</TabsTrigger>
              <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Business Analysis</p>
                  <p className="text-3xl font-bold mt-2">{businessScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Items Complete</p>
                  <p className="text-3xl font-bold mt-2">{completedItems}/{totalItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className={`text-2xl font-bold ${businessScore>=80?"text-green-600":"text-yellow-600"}`}>
                    {businessScore>=80?"Strong":"Moderate"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">vs. Approved Avg</p>
                  <p className={`text-xl font-bold ${businessScore>75?"text-green-600":"text-orange-600"}`}>
                    {businessScore>75?"+15%":"-12%"}
                  </p>
                </Card>
              </div>

              <Card className="p-4">
                <p className="font-semibold mb-2">Business Score Breakdown</p>
                <div className="space-y-1">
                  {DEEP_ANALYSIS.map((cat, i) => {
                    const catDone = cat.items.filter(item => checks[`${cat.category}-${item}`]).length;
                    return (
                      <div key={i} className="flex justify-between">
                        <span className="text-sm">{cat.category}</span>
                        <span className="font-bold">{Math.round((catDone/cat.items.length)*100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {DEEP_ANALYSIS.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={checks[`${cat.category}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${cat.category}-${item}`]:!checks[`${cat.category}-${item}`]})}
                        />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="benchmark" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Positioning vs Approved Applications</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{top:20,right:20,bottom:20,left:20}}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="innovationScore" name="Innovation" />
                    <YAxis type="number" dataKey="scalabilityScore" name="Scalability" />
                    <Tooltip cursor={{strokeDasharray:"3 3"}} />
                    <Legend />
                    <Scatter name="Your Company" data={visaScatterData.slice(0,1)} fill="#ffa536" />
                    <Scatter name="Avg Approved" data={visaScatterData.slice(1,2)} fill="#22c55e" shape="cross" />
                    <Scatter name="Avg Rejected" data={visaScatterData.slice(2,3)} fill="#ef4444" shape="square" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Card>

              {businessScore >= 80 && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    ✓ Your business metrics are competitive with approved applications. Strong visa application candidate.
                  </AlertDescription>
                </Alert>
              )}
              {businessScore < 80 && businessScore >= 60 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Several key metrics need improvement. Work on these before submission.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Business Deep X-Ray
          </Button>
        </div>
      </div>
    </>
  );
}
