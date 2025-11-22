import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function EligibilityValidator() {
  const [scores, setScores] = useState({innovation:0,viability:0,growth:0});
  const [dependents, setDependents] = useState(0);
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");

  const businessScore = (scores.innovation + scores.viability + scores.growth);
  const totalScore = Math.min(businessScore, 50) + 20;
  const eligible = totalScore >= 70;
  const financialReq = 1270 + (dependents * 200);

  const saveProgress = () => {
    localStorage.setItem('eligibilityData', JSON.stringify({scores, dependents}));
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('eligibilityData');
    if (saved) {
      const data = JSON.parse(saved);
      setScores(data.scores);
      setDependents(data.dependents);
    }
  };

  useEffect(() => { loadProgress(); }, []);

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
          <p className="text-muted-foreground mb-6">Precise visa eligibility calculation</p>

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={saveProgress} className="gap-2" variant="outline"><Save className="w-4 h-4" /> Save</Button>
            <Button className="gap-2" variant="outline"><Lightbulb className="w-4 h-4" /> Tips</Button>
            <Button className="gap-2" variant="outline"><Calendar className="w-4 h-4" /> Plan</Button>
            <Button className="gap-2" variant="outline"><Download className="w-4 h-4" /> Export</Button>
            <Button onClick={loadProgress} className="gap-2" variant="outline"><RefreshCw className="w-4 h-4" /> Restore</Button>
          </div>

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Score</TabsTrigger>
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
                  <p className="text-xs text-muted-foreground">English Plus Financial</p>
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
            </TabsContent>

            <TabsContent value="calculator" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">Score Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Innovation Score (0-16.67)</label>
                    <Input type="number" min="0" max="16.67" step="0.1" value={scores.innovation}
                      onChange={(e) => setScores({...scores,innovation:parseFloat(e.target.value)||0})} className="max-w-xs" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Viability Score (0-16.67)</label>
                    <Input type="number" min="0" max="16.67" step="0.1" value={scores.viability}
                      onChange={(e) => setScores({...scores,viability:parseFloat(e.target.value)||0})} className="max-w-xs" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Growth Potential Score (0-16.67)</label>
                    <Input type="number" min="0" max="16.67" step="0.1" value={scores.growth}
                      onChange={(e) => setScores({...scores,growth:parseFloat(e.target.value)||0})} className="max-w-xs" />
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
                    <Input type="number" min="0" value={dependents}
                      onChange={(e) => setDependents(parseInt(e.target.value)||0)} className="max-w-xs mt-2" />
                  </div>
                  <div className="p-3 border-l-4 border-primary bg-gray-50 rounded">
                    <p className="font-semibold text-sm">Total Personal Funds Required</p>
                    <p className="text-2xl font-bold text-primary mt-2">£{financialReq.toLocaleString()}</p>
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
