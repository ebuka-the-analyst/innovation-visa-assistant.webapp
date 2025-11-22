import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ELIGIBILITY_CRITERIA = [
  {name:"Business Innovation Score",points:0,maxPoints:16.67,description:"Company demonstrates genuine innovation"},
  {name:"Business Viability Score",points:0,maxPoints:16.67,description:"Business model is viable and sustainable"},
  {name:"Growth Potential Score",points:0,maxPoints:16.67,description:"Clear growth and scalability plan"},
  {name:"English Language (B2+)",points:10,maxPoints:10,description:"GCSE/A-Level/IELTS 7.0 or UK degree"},
  {name:"Financial Requirements",points:10,maxPoints:10,description:"£1,270 available for 28 consecutive days"}
];

export default function EligibilityValidator() {
  const [scores, setScores] = useState({innovation:0,viability:0,growth:0});
  const [dependents, setDependents] = useState(0);
  const [tab, setTab] = useState("overview");

  const businessScore = (scores.innovation + scores.viability + scores.growth);
  const totalScore = Math.min(businessScore, 50) + 20; // Cap at 50 for business + 20 for English/Financial
  const eligible = totalScore >= 70;

  const financialReq = 1270 + (dependents * 200);
  
  const chartData = [
    {name:"Innovation",value:scores.innovation},
    {name:"Viability",value:scores.viability},
    {name:"Growth",value:scores.growth},
    {name:"English",value:10},
    {name:"Financial",value:10}
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Eligibility Validator</h1>
          <p className="text-muted-foreground mb-6">Precise visa eligibility calculation based on 70-point system</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Eligibility Score</TabsTrigger>
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Total Points</p>
                  <p className="text-4xl font-bold mt-2">{Math.round(totalScore)}/70</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Business Criteria</p>
                  <p className="text-3xl font-bold mt-2">{Math.round(Math.min(businessScore,50))}/50</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">English + Financial</p>
                  <p className="text-3xl font-bold mt-2">20/20</p>
                </Card>
                <Card className={`p-4 ${eligible ? "bg-green-50":"bg-red-50"}`}>
                  <p className="text-xs text-muted-foreground">Eligible?</p>
                  <p className={`text-2xl font-bold mt-2 ${eligible ? "text-green-600":"text-red-600"}`}>
                    {eligible ? "✓ YES" : "✗ NO"}
                  </p>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="font-bold mb-4">Points Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ffa536" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {eligible ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    ✓ You meet the 70-point requirement for Innovation Visa eligibility.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    You need {70 - Math.round(totalScore)} more points to be eligible. Focus on increasing business criteria scores.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Score Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Innovation Score (0-16.67)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="16.67" 
                      step="0.1"
                      value={scores.innovation}
                      onChange={(e) => setScores({...scores,innovation:parseFloat(e.target.value)||0})}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Assess: tech differentiation, novelty, IP</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Viability Score (0-16.67)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="16.67" 
                      step="0.1"
                      value={scores.viability}
                      onChange={(e) => setScores({...scores,viability:parseFloat(e.target.value)||0})}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Assess: market validation, revenue model, unit economics</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Growth Potential Score (0-16.67)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="16.67" 
                      step="0.1"
                      value={scores.growth}
                      onChange={(e) => setScores({...scores,growth:parseFloat(e.target.value)||0})}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Assess: scalability, team capability, market size</p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="font-semibold">Total: {Math.round(totalScore)}/70 points</p>
                    <p className={`text-sm mt-1 ${eligible ? "text-green-600":"text-red-600"}`}>
                      {eligible ? "✓ Eligible for application" : `⚠ Need ${70 - Math.round(totalScore)} more points`}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Financial Requirements</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="font-semibold text-sm">Dependents</p>
                    <Input 
                      type="number" 
                      min="0" 
                      value={dependents}
                      onChange={(e) => setDependents(parseInt(e.target.value)||0)}
                      className="max-w-xs mt-2"
                    />
                  </div>

                  <div className="p-3 border-l-4 border-primary bg-gray-50 rounded">
                    <p className="font-semibold text-sm">Total Personal Funds Required</p>
                    <p className="text-2xl font-bold text-primary mt-2">£{financialReq.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Must be available for 28 consecutive days</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 mt-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">Personal savings</p>
                      <p className="font-bold">£1,270</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">Per dependent</p>
                      <p className="font-bold">£200 x {dependents}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold mb-3">Other Requirements</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Valid passport (must cover visa period)</li>
                  <li>✓ Proof of B2 English (GCSE, A-Level, IELTS 7.0+, or UK degree)</li>
                  <li>✓ Endorser letter from approved body</li>
                  <li>✓ Bank statements showing savings (last 28 days)</li>
                  <li>✓ Proof of identity and residence</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Eligibility Assessment
          </Button>
        </div>
      </div>
    </>
  );
}
