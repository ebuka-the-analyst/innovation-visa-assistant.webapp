import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  const totalItems = HR_ITEMS.reduce((sum, a) => sum + a.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

  const saveProgress = () => {
    localStorage.setItem('hrComplianceProgress', JSON.stringify(checks));
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('hrComplianceProgress');
    if (saved) setChecks(JSON.parse(saved));
  };

  useEffect(() => { loadProgress(); }, []);

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

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button onClick={saveProgress} className="gap-2" variant="outline"><Save className="w-4 h-4" /> Save</Button>
            <Button className="gap-2" variant="outline"><Lightbulb className="w-4 h-4" /> Tips</Button>
            <Button className="gap-2" variant="outline"><Calendar className="w-4 h-4" /> Plan</Button>
            <Button className="gap-2" variant="outline"><Download className="w-4 h-4" /> Export</Button>
            <Button onClick={loadProgress} className="gap-2" variant="outline"><RefreshCw className="w-4 h-4" /> Restore</Button>
          </div>

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

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
