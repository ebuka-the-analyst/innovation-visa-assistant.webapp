import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";

export default function RiskAnalysis() {
  const [risks, setRisks] = useState([
    { id: 1, description: "Market adoption", likelihood: 3, impact: 4, mitigation: "Early customer validation" }
  ]);

  const addRisk = () => {
    setRisks([...risks, { id: Date.now(), description: "", likelihood: 1, impact: 1, mitigation: "" }]);
  };

  const updateRisk = (id: number, field: string, value: any) => {
    setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return { level: "High", color: "text-red-600" };
    if (score >= 8) return { level: "Medium", color: "text-yellow-600" };
    return { level: "Low", color: "text-green-600" };
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Risk Analysis & Mitigation</h1>
            <p className="text-lg text-muted-foreground">Identify and mitigate business risks</p>
          </div>

          <div className="space-y-4">
            {risks.map((risk) => {
              const riskLevel = getRiskLevel(risk.likelihood, risk.impact);
              return (
                <Card key={risk.id} className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium">Risk Description</label>
                      <Input value={risk.description} onChange={(e) => updateRisk(risk.id, "description", e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Likelihood (1-5)</label>
                      <Input type="number" min="1" max="5" value={risk.likelihood} onChange={(e) => updateRisk(risk.id, "likelihood", Number(e.target.value))} className="mt-2" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Impact (1-5)</label>
                      <Input type="number" min="1" max="5" value={risk.impact} onChange={(e) => updateRisk(risk.id, "impact", Number(e.target.value))} className="mt-2" />
                    </div>
                    <div className="flex items-end">
                      <div className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Mitigation Strategy</label>
                    <Input value={risk.mitigation} onChange={(e) => updateRisk(risk.id, "mitigation", e.target.value)} className="mt-2" placeholder="How will you mitigate this risk?" />
                  </div>
                </Card>
              );
            })}
          </div>

          <Button onClick={addRisk} className="mt-6 w-full">Add Risk</Button>
        </div>
      </div>
    </>
  );
}
