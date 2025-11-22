import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { ToolUtilityBar } from "@/components/ToolUtilityBar";
import { FileUploadButton } from "@/components/FileUploadButton";
import { FileList } from "@/components/FileList";
import { fileUploadConfigs } from "@/lib/fileUploadConfigs";
import { useState, useEffect } from "react";
import { Download, MapPin, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const MARKET_PHASES = [
  { phase: "Phase 1: Research", duration: "Months 1-3", activities: "Market analysis, competitor review, customer interviews" },
  { phase: "Phase 2: Preparation", duration: "Months 4-6", activities: "Product adaptation, partnerships, regulatory compliance" },
  { phase: "Phase 3: Launch", duration: "Months 7-9", activities: "Marketing campaign, sales team setup, go-to-market" },
  { phase: "Phase 4: Scale", duration: "Months 10-12", activities: "Growth acceleration, market expansion, optimization" }
];

export default function MarketEntryPlan() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedDate, setSavedDate] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [marketSize, setMarketSize] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [strategy, setStrategy] = useState("");
  const [plan, setPlan] = useState("");

  const saveProgress = () => {
    localStorage.setItem('marketEntryPlanFiles', JSON.stringify(uploadedFiles));
    localStorage.setItem('marketEntryPlanData', JSON.stringify({ targetMarket, marketSize, competitors, strategy }));
    localStorage.setItem('marketEntryPlanDate', new Date().toLocaleDateString());
    setSavedDate(new Date().toLocaleDateString());
  };

  const generatePlan = () => {
    const content = `MARKET ENTRY PLAN\n\nTarget Market: ${targetMarket}\n\nMarket Size: ${marketSize}\n\nCompetitive Landscape:\n${competitors}\n\nEntry Strategy:\n${strategy}\n\nImplementation Timeline:\n${MARKET_PHASES.map(p => `${p.phase} (${p.duration}): ${p.activities}`).join('\n')}`;
    setPlan(content);
  };

  const handleFileUpload = (file: any) => setUploadedFiles(prev => [...prev, file]);
  const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const exportPlan = () => {
    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-entry-plan-${targetMarket}.txt`;
    a.click();
  };

  const getSerializedState = () => ({ uploadedFiles, targetMarket, marketSize, competitors, strategy, plan, savedDate });

  useEffect(() => {
    const s = localStorage.getItem('marketEntryPlanData');
    if (s) {
      const data = JSON.parse(s);
      setTargetMarket(data.targetMarket || "");
      setMarketSize(data.marketSize || "");
      setCompetitors(data.competitors || "");
      setStrategy(data.strategy || "");
    }
    const f = localStorage.getItem('marketEntryPlanFiles');
    if (f) setUploadedFiles(JSON.parse(f));
  }, []);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <ToolNavigation />
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Market Entry Plan</h1>
          <p className="text-muted-foreground mb-6">Develop your go-to-market strategy for new markets</p>

          <ToolUtilityBar
            toolId="market-entry-plan"
            toolName="Market Entry Plan"
            onSave={saveProgress}
            onExport={exportPlan}
            getSerializedState={getSerializedState}
          />

          <div className="mb-4">
            <FileUploadButton config={fileUploadConfigs.documentOrganizer} onFileSelected={handleFileUpload} variant="secondary" />
          </div>
          <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
          {savedDate && <Alert className="mb-4"><AlertDescription>Last saved: {savedDate}</AlertDescription></Alert>}

          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4 flex gap-2"><MapPin className="w-5 h-5" />Market Strategy</h3>
            <div className="space-y-4">
              <Input value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Target Market/Region (e.g., UK, EU, APAC)" />
              <div>
                <label className="text-sm font-medium">Market Size & Opportunity</label>
                <Textarea value={marketSize} onChange={(e) => setMarketSize(e.target.value)} placeholder="Total addressable market, growth potential" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Competitive Analysis</label>
                <Textarea value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Key competitors and your differentiation" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Entry Strategy</label>
                <Textarea value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Your go-to-market approach and tactics" rows={3} />
              </div>
              <Button onClick={generatePlan} className="w-full gap-2 bg-secondary">
                <TrendingUp className="w-4 h-4" />
                Generate Market Plan
              </Button>
            </div>
          </Card>

          <h3 className="font-bold mb-4">Implementation Timeline</h3>
          <div className="space-y-3 mb-6">
            {MARKET_PHASES.map((p, i) => (
              <Card key={i} className="p-4">
                <p className="font-bold">{p.phase}</p>
                <p className="text-sm text-muted-foreground">{p.duration} | {p.activities}</p>
              </Card>
            ))}
          </div>

          {plan && <Card className="p-6 mb-6 bg-blue-50"><p className="text-sm whitespace-pre-wrap">{plan}</p></Card>}

          <Button className="w-full gap-2 bg-primary" onClick={exportPlan} data-testid="button-export-market-plan">
            <Download className="w-4 h-4" />
            Export Market Entry Plan
          </Button>
        </div>
      </div>
    </>
  );
}
