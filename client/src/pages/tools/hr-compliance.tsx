import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const HR_REQUIREMENTS = [
  {area:"Employment Contracts",items:["Written contract for each employee","Clear terms and conditions","Salary and benefits specified","Notice periods defined","Confidentiality clauses included"]},
  {area:"Payroll & Tax",items:["PAYE registered with HMRC","Monthly payroll submissions","P11D filed for directors","Pension contributions recorded","Income tax deductions correct"]},
  {area:"Health & Safety",items:["H&S policy (if 5+ employees)","Risk assessment completed","Accident reporting procedure","Emergency evacuation plan","H&S training records kept"]},
  {area:"Working Hours",items:["Maximum 48 hours per week enforced","Rest breaks provided","Holiday records maintained","Overtime arrangements documented","Working time directive compliant"]},
  {area:"Minimum Wage",items:["National Minimum Wage verified","£10.42+ for 21+ years (April 2024)","Apprentice minimum £6.40","Junior minimum £8.60","Records maintained for 3 years"]}
];

export default function HRCompliance() {
  const [checks, setChecks] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const totalItems = HR_REQUIREMENTS.reduce((sum, a) => sum + a.items.length, 0);
  const completedItems = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((completedItems / totalItems) * 100);

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
          <p className="text-muted-foreground mb-6">UK employment law & HR compliance verification</p>

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
                    {complianceScore>=80?"✓ Compliant":"⚠ Review Needed"}
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

              {complianceScore < 80 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    HR compliance gaps detected. Address these immediately to avoid Employment Tribunal claims and penalties.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              {HR_REQUIREMENTS.map((area, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{area.area}</h3>
                  <div className="space-y-2">
                    {area.items.map((item, j) => (
                      <label key={j} className="flex gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={checks[`${area.area}-${item}`]||false}
                          onCheckedChange={() => setChecks({...checks,[`${area.area}-${item}`]:!checks[`${area.area}-${item}`]})}
                        />
                        <span className="text-sm flex-1">{item}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export HR Compliance Report
          </Button>
        </div>
      </div>
    </>
  );
}
