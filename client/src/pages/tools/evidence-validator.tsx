import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Download, Save, Lightbulb, Calendar, RefreshCw } from "lucide-react";

const EVIDENCE_TYPES = [
  {category:"Innovation Evidence",items:["Patent Application","Technical Architecture","IP Assignments","Competitive Analysis"]},
  {category:"Viability Evidence",items:["Customer Validation","Revenue Model","Market Research","Financial Projections"]},
  {category:"Scalability Evidence",items:["Growth Plan","Team Recruitment Plan","Infrastructure Plan","Geographic Expansion"]},
  {category:"Team Evidence",items:["Founder CVs","Team Skills Matrix","Advisory Board","References"]}
];

export default function EvidenceValidator() {
  const [qualityRatings, setQualityRatings] = useState<any>({});
  const [tab, setTab] = useState("overview");
  const [savedDate, setSavedDate] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);

  const totalItems = EVIDENCE_TYPES.reduce((sum, c) => sum + c.items.length, 0);
  const providedItems = Object.keys(qualityRatings).filter(k => qualityRatings[k] > 0).length;
  const avgQuality = providedItems > 0 ? Math.round(Object.values(qualityRatings).reduce((sum: number, v: any) => sum + v, 0) / providedItems * 100 / 5) : 0;

  const saveProgress = () => {
    localStorage.setItem('evidenceValidatorProgress', JSON.stringify(qualityRatings));
    localStorage.setItem('evidenceValidatorDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('evidenceValidatorProgress');
    if (saved) {
      setQualityRatings(JSON.parse(saved));
      const date = localStorage.getItem('evidenceValidatorDate');
      setSavedDate(date || '');
    }
  };

  const getRecommendations = () => {
    const gaps = [];
    if (providedItems < 10) gaps.push("Provide at least 10 evidence types for strong case");
    if (avgQuality < 60) gaps.push("Improve evidence quality - aim for 4-5 stars each");
    if (!qualityRatings["Innovation Evidence-Patent Application"] || qualityRatings["Innovation Evidence-Patent Application"] < 4) 
      gaps.push("Strengthen patent application documentation");
    if (!qualityRatings["Viability Evidence-Customer Validation"] || qualityRatings["Viability Evidence-Customer Validation"] < 4)
      gaps.push("Add more customer validation evidence");
    if (avgQuality >= 80) gaps.push("Excellent quality - ready for submission");
    return gaps.slice(0, 5);
  };

  const generateActionPlan = () => {
    return [
      {week:"Week 1-2", action:"Collect innovation evidence and IP documentation", priority:"Critical"},
      {week:"Week 3-4", action:"Gather market validation and customer testimonials", priority:"Critical"},
      {week:"Week 5-6", action:"Document team credentials and advisory board", priority:"High"},
      {week:"Week 7-8", action:"Finalize growth plans and financial models", priority:"High"}
    ];
  };

  const exportReport = () => {
    const report = `EVIDENCE VALIDATOR REPORT\nDate: ${new Date().toLocaleDateString()}\nAverage Quality: ${avgQuality}%\nEvidence Provided: ${providedItems}/${totalItems}\nStrength: ${avgQuality>=80?"Strong":avgQuality>=60?"Fair":"Weak"}`;
    const blob = new Blob([report], {type: 'text/plain'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evidence-validation.txt';
    a.click();
  };

  const getSerializedState = () => {
    return {
      qualityRatings,
      savedDate,
      tab
    };
  };

  useEffect(() => {
    const handoffKey = 'evidence-validator_handoff';
    const handoffData = localStorage.getItem(handoffKey);
    
    if (handoffData) {
      try {
        const payload = JSON.parse(handoffData);
        if (payload.qualityRatings) setQualityRatings(payload.qualityRatings);
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
          <h1 className="text-4xl font-bold mb-2">Evidence Validator</h1>
          <p className="text-muted-foreground mb-6">Comprehensive evidence quality assessment</p>

          <ToolUtilityBar
            toolId="evidence-validator"
            toolName="Evidence Validator"
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
              <TabsTrigger value="overview">Quality Score</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs text-muted-foreground">Average Quality</p>
                  <p className="text-4xl font-bold mt-2">{avgQuality}%</p>
                  <p className="text-xs mt-2">{providedItems}/{totalItems} types</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Evidence Strength</p>
                  <p className={`text-2xl font-bold ${avgQuality>=80?"text-green-600":avgQuality>=60?"text-yellow-600":"text-red-600"}`}>
                    {avgQuality>=80?"Strong":avgQuality>=60?"Fair":"Weak"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Visa Impact</p>
                  <p className={`text-sm font-bold ${avgQuality>=80?"text-green-600":"text-orange-600"}`}>
                    {avgQuality>=80?"Highly likely":"Review first"}
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {EVIDENCE_TYPES.map((cat, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-3">
                    {cat.items.map((item, j) => (
                      <div key={j} className="border border-gray-200 p-3 rounded">
                        <p className="font-semibold text-sm mb-2">{item}</p>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map(stars => (
                            <button key={stars} onClick={() => setQualityRatings({...qualityRatings,[`${cat.category}-${item}`]:stars})}
                              className={`text-lg ${qualityRatings[`${cat.category}-${item}`] >= stars ? "text-yellow-500":"text-gray-300"}`}>★</button>
                          ))}
                        </div>
                      </div>
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
