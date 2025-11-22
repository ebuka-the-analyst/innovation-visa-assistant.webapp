import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, AlertTriangle, TrendingUp, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const REGULATORY_CHANGES = [
  {topic:"Immigration Rules",item:"Points-Based System refinements",date:"Apr 2024",impact:"High",status:"In Effect"},
  {topic:"Employment",item:"National Minimum Wage increase to 11.44 pounds",date:"Apr 2024",impact:"High",status:"In Effect"},
  {topic:"Tax",item:"Corporation tax rate change",date:"Apr 2023",impact:"High",status:"In Effect"},
  {topic:"Data Protection",item:"GDPR enforcement increase by ICO",date:"Ongoing",impact:"High",status:"Active"},
  {topic:"Company Law",item:"Large company reporting requirements",date:"Jan 2024",impact:"Medium",status:"In Effect"}
];

export default function RegulatoryTracker() {
  const [tracked, setTracked] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const monitoring = Object.values(tracked).filter(Boolean).length;

  const saveProgress = () => {
    localStorage.setItem('regulatoryTrackerProgress', JSON.stringify(tracked));
    localStorage.setItem('regulatoryTrackerDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('regulatoryTrackerProgress');
    if (saved) {
      setTracked(JSON.parse(saved));
      const date = localStorage.getItem('regulatoryTrackerDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (monitoring < 3) gaps.push("Review and track at least 3 regulatory changes");
    if (!tracked["Points-Based System refinements"]) gaps.push("Review points system changes - impacts visa eligibility");
    if (!tracked["National Minimum Wage increase to 11.44 pounds"]) gaps.push("Update payroll for minimum wage increase");
    if (!tracked["GDPR enforcement increase by ICO"]) gaps.push("Review GDPR compliance - enforcement increased");
    if (monitoring === REGULATORY_CHANGES.length) gaps.push("All changes tracked - stay updated quarterly");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1", action:"Review immigration rule changes and assess impact", priority:"Critical"},
      {week:"Week 2", action:"Update payroll for minimum wage requirements", priority:"High"},
      {week:"Week 3", action:"Review GDPR compliance against new guidance", priority:"High"},
      {week:"Week 4", action:"Set up quarterly regulatory review process", priority:"Medium"}
    ];
  };

  const exportReport = () => {
    const report = `REGULATORY TRACKER REPORT\nDate: ${new Date().toLocaleDateString()}\nChanges Tracked: ${monitoring}/${REGULATORY_CHANGES.length}\nHigh Impact Changes: ${REGULATORY_CHANGES.filter(c=>c.impact==="High").length}\n\nSTATUS: ${monitoring>=3?"MONITORING":"REVIEW NEEDED"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regulatory-tracker.txt';
    a.click();
  };

  const getSerializedState = () => {
    return {
      tracked,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'regulatory-tracker_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if (payload.tracked) setTracked(payload.tracked);
        if (payload.savedDate) setSavedDate(payload.savedDate);
        if (payload.tab) setTab(payload.tab);
        localStorage.removeItem(handoffKey);
      } catch (err) {
        console.error('Failed to restore handoff data:', err);
      }
    } else {
      loadProgress();
    }
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Regulatory Tracker</h1>
          <p className="text-muted-foreground mb-6">Monitor UK regulatory changes affecting visa applications</p>

          <ToolUtilityBar
            toolId="regulatory-tracker"
            toolName="Regulatory Tracker"
            onSave={saveProgress}
            onRestore={loadProgress}
            onExport={exportReport}
            onSmartTips={() => setShowRecommendations(!showRecommendations)}
            onActionPlan={() => setShowActionPlan(!showActionPlan)}
            getSerializedState={getSerializedState}
          />

          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          {showRecommendations && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <h3 className="font-bold mb-2">Smart Recommendations</h3>
              <ul className="space-y-1">{getRecommendations().map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul>
            </Card>
          )}

          {showActionPlan && (
            <Card className="p-4 mb-4 bg-green-50 border-green-200">
              <h3 className="font-bold mb-3">Action Plan Timeline</h3>
              <div className="space-y-2">{generateActionPlan().map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-bold text-sm">{item.week}</span>
                  <div><p className="text-sm">{item.action}</p>
                    <span className={`text-xs ${item.priority==="Critical"?"text-red-600":"text-yellow-600"}`}>{item.priority}</span>
                  </div>
                </div>
              ))}</div>
            </Card>
          )}

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
                  <p className="text-xs mt-2">of {REGULATORY_CHANGES.length} key changes</p>
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
              {REGULATORY_CHANGES.map((change, i) => (
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
                    <Checkbox checked={tracked[`${change.item}`]||false}
                      onCheckedChange={() => setTracked({...tracked,[`${change.item}`]:!tracked[`${change.item}`]})} />
                    <span className="text-xs">Mark as reviewed and addressed</span>
                  </label>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
