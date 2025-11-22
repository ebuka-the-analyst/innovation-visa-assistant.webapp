import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Download, AlertTriangle, TrendingUp } from "lucide-react";

const REGULATORY_CHANGES_2024 = [
  {topic:"Immigration Rules",item:"Points-Based System refinements",date:"Apr 2024",impact:"High",status:"In Effect"},
  {topic:"Employment",item:"National Minimum Wage increase to £11.44",date:"Apr 2024",impact:"High",status:"In Effect"},
  {topic:"Tax",item:"Corporation tax rate change",date:"Apr 2023",impact:"High",status:"In Effect"},
  {topic:"Data Protection",item:"GDPR enforcement increase by ICO",date:"Ongoing",impact:"High",status:"Active"},
  {topic:"Company Law",item:"Large company reporting requirements",date:"Jan 2024",impact:"Medium",status:"In Effect"}
];

export default function RegulatoryTracker() {
  const [tracked, setTracked] = useState<any>({});
  const [tab, setTab] = useState("overview");

  const monitoring = Object.values(tracked).filter(Boolean).length;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Regulatory Tracker</h1>
          <p className="text-muted-foreground mb-6">Monitor UK regulatory changes affecting visa applications and compliance</p>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Tracking Status</TabsTrigger>
              <TabsTrigger value="changes">Recent Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Changes Tracked</p>
                  <p className="text-4xl font-bold mt-2">{monitoring}</p>
                  <p className="text-xs mt-2">of {REGULATORY_CHANGES_2024.length} key changes</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">High Impact</p>
                  <p className="text-3xl font-bold mt-2 text-red-600">5</p>
                  <p className="text-xs mt-2">Require action</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-bold mt-2">Nov 22, 2024</p>
                </Card>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Subscribe to regulatory updates. Changes can affect visa eligibility and compliance requirements.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              {REGULATORY_CHANGES_2024.map((change, i) => (
                <Card key={i} className={`p-4 border-l-4 ${change.impact === "High" ? "border-l-red-500":"border-l-blue-500"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold">{change.item}</p>
                      <p className="text-xs text-muted-foreground">Category: {change.topic}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${change.impact === "High" ? "bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>
                        {change.impact} Impact
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{change.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Effective: {change.date}</p>
                  <label className="flex gap-2">
                    <Checkbox 
                      checked={tracked[`${change.item}`]||false}
                      onCheckedChange={() => setTracked({...tracked,[`${change.item}`]:!tracked[`${change.item}`]})}
                    />
                    <span className="text-xs">Mark as reviewed and addressed</span>
                  </label>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Button className="w-full mt-4 gap-2 bg-primary">
            <Download className="w-4 h-4" />
            Export Regulatory Status Report
          </Button>
        </div>
      </div>
    </>
  );
}
