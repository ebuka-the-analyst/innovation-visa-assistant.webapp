import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { AiToolGuide, AiTraditionalToggle, type ToolConfig } from "@/components/AiToolGuide";
import { useTierAccess } from "@/hooks/useTierAccess";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, AlertTriangle, TrendingUp, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const AI_TOOL_CONFIG: ToolConfig = {
  toolId: "regulatory-tracker",
  toolName: "Regulatory Tracker",
  agent: "atlas",
  greeting: "Hello! I'm Atlas, your growth strategist. Let's track the key regulatory changes affecting your UK business and visa application to ensure full compliance.",
  questions: [
    {
      id: "industry",
      question: "What industry or sector does your business operate in?",
      hint: "Different industries have different regulatory requirements",
      fieldKey: "industrySector",
      minLength: 50
    },
    {
      id: "dataHandling",
      question: "How does your business handle personal data and what GDPR compliance measures do you have?",
      hint: "ICO enforcement is increasing - data protection is critical",
      fieldKey: "gdprCompliance",
      minLength: 80
    },
    {
      id: "employment",
      question: "Describe your employment plans and awareness of UK employment regulations.",
      hint: "Minimum wage and employment rights are frequently audited",
      fieldKey: "employmentCompliance",
      minLength: 80
    },
    {
      id: "tax",
      question: "What UK tax obligations are you prepared for?",
      hint: "Tax awareness demonstrates business viability",
      fieldKey: "taxAwareness",
      minLength: 60
    },
    {
      id: "immigration",
      question: "How are you tracking immigration rule changes that affect your visa?",
      hint: "Points-based system rules change frequently",
      fieldKey: "immigrationTracking",
      minLength: 60
    },
    {
      id: "compliance",
      question: "What ongoing compliance monitoring system will you implement?",
      hint: "Demonstrating a compliance system shows business maturity",
      fieldKey: "complianceSystem",
      minLength: 80
    }
  ],
  completionMessage: "Your regulatory awareness has been documented. Staying on top of compliance is essential for visa success."
};

const REGULATORY_CHANGES = [
  {topic:"Immigration Rules",item:"Points-Based System refinements",date:"Nov 2025",impact:"High",status:"In Effect"},
  {topic:"Employment",item:"National Minimum Wage increase to £11.44/hour",date:"Apr 2025",impact:"High",status:"In Effect"},
  {topic:"Tax",item:"Corporation tax rate 25% for large profits",date:"Apr 2025",impact:"High",status:"In Effect"},
  {topic:"Data Protection",item:"GDPR enforcement increase by ICO",date:"Ongoing",impact:"High",status:"Active"},
  {topic:"Company Law",item:"Company reporting requirements update",date:"Nov 2025",impact:"Medium",status:"In Effect"}
];

export default function RegulatoryTracker() {
  const { userTier } = useTierAccess();
  
  // Free users default to traditional mode, paid users can use AI mode
  const isPaidUser = userTier !== 'free';
  const [mode, setMode] = useState<'ai' | 'traditional'>(() => {
    const saved = localStorage.getItem('regulatory-tracker-mode');
    // Free users always start in traditional mode
    return (saved === 'ai' && isPaidUser) ? 'ai' : 'traditional';
  });

  // Force traditional mode for free users and clear localStorage
  useEffect(() => {
    if (!isPaidUser && mode === 'ai') {
      setMode('traditional');
      localStorage.setItem('regulatory-tracker-mode', 'traditional');
    }
  }, [isPaidUser, mode]);

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
    localStorage.setItem('regulatory-tracker-mode', mode);
  }, [mode]);

  const handleAiComplete = (answers: Record<string, string>) => {
    const newTracked = { ...tracked };
    if (answers.industrySector?.length > 50) {
      newTracked["Company Law"] = true;
    }
    if (answers.gdprCompliance?.length > 80) {
      newTracked["GDPR enforcement increase by ICO"] = true;
    }
    if (answers.employmentCompliance?.length > 80) {
      newTracked["National Minimum Wage increase to 11.44 pounds"] = true;
    }
    if (answers.taxAwareness?.length > 60) {
      newTracked["Corporation tax rate change"] = true;
    }
    if (answers.immigrationTracking?.length > 60) {
      newTracked["Points-Based System refinements"] = true;
    }
    setTracked(newTracked);
    setMode('traditional');
  };

  useEffect(() => {
    const handoffKey = 'regulatory-tracker_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if ('tracked' in payload) setTracked(payload.tracked);
        if ('savedDate' in payload) setSavedDate(payload.savedDate);
        if ('tab' in payload) setTab(payload.tab);
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
      
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold" data-testid="heading-regulatory-tracker">Regulatory Tracker</h1>
              <p className="text-muted-foreground">Monitor UK regulatory changes affecting visa applications</p>
            </div>
            <AiTraditionalToggle mode={mode} onModeChange={setMode} userTier={userTier} />
          </div>

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

          {mode === 'ai' ? (
            <AiToolGuide config={AI_TOOL_CONFIG} onComplete={handleAiComplete} userTier={userTier} />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
