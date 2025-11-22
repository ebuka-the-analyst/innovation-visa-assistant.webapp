import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function RiskAnalysis() {
  const [risks, setRisks] = useState<Array<{id: string; description: string; likelihood: number; impact: number; mitigation: string}>>([]);
  const [description, setDescription] = useState("");
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);
  const [mitigation, setMitigation] = useState("");

  const addRisk = () => {
    if (description.trim()) {
      setRisks([...risks, {
        id: Date.now().toString(),
        description,
        likelihood,
        impact,
        mitigation
      }]);
      setDescription("");
      setLikelihood(3);
      setImpact(3);
      setMitigation("");
    }
  };

  const deleteRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return { level: "HIGH", color: "bg-red-50", textColor: "text-red-600" };
    if (score >= 9) return { level: "MEDIUM", color: "bg-yellow-50", textColor: "text-yellow-600" };
    return { level: "LOW", color: "bg-green-50", textColor: "text-green-600" };
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Risk Analysis & Mitigation</h1>
            <p className="text-lg text-muted-foreground">Build and manage business risk inventory</p>
          </div>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Add New Risk</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Risk Description</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Market adoption slower than projected" className="mt-2" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Likelihood (1-5)</label>
                  <input type="range" min="1" max="5" value={likelihood} onChange={e => setLikelihood(parseInt(e.target.value))} className="w-full mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{likelihood}/5</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Impact (1-5)</label>
                  <input type="range" min="1" max="5" value={impact} onChange={e => setImpact(parseInt(e.target.value))} className="w-full mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{impact}/5</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Mitigation Strategy</label>
                <Textarea value={mitigation} onChange={e => setMitigation(e.target.value)} placeholder="How will you mitigate this risk?" className="mt-2" />
              </div>

              <Button onClick={addRisk} className="w-full">Add Risk to Inventory</Button>
            </div>
          </Card>

          <div className="space-y-3">
            {risks.map(risk => {
              const riskLevel = getRiskLevel(risk.likelihood, risk.impact);
              return (
                <Card key={risk.id} className={`p-4 ${riskLevel.color}`}>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{risk.description}</p>
                      <p className={`text-sm font-semibold mt-1 ${riskLevel.textColor}`}>{riskLevel.level} RISK (Score: {risk.likelihood * risk.impact}/25)</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteRisk(risk.id)}>Delete</Button>
                  </div>
                  <p className="text-sm mt-2"><strong>Mitigation:</strong> {risk.mitigation}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
