import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Risk {
  id: string;
  category: string;
  description: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
}

export default function RiskAnalysis() {
  const [risks, setRisks] = useState<Risk[]>([
    {
      id: "1",
      category: "Market",
      description: "Slower market adoption than expected",
      likelihood: 3,
      impact: 4,
      mitigation: "Diversify customer segments, accelerate marketing",
    },
    {
      id: "2",
      category: "Competition",
      description: "Competitor enters market with similar offering",
      likelihood: 4,
      impact: 3,
      mitigation: "Build IP moat, strengthen customer relationships, innovate continuously",
    },
    {
      id: "3",
      category: "Regulatory",
      description: "Regulatory changes affecting business model",
      likelihood: 2,
      impact: 5,
      mitigation: "Monitor regulatory landscape, build compliance into product, engage with regulators",
    },
  ]);

  const addRisk = () => {
    setRisks([
      ...risks,
      {
        id: Math.random().toString(),
        category: "",
        description: "",
        likelihood: 3,
        impact: 3,
        mitigation: "",
      },
    ]);
  };

  const updateRisk = (id: string, field: string, value: any) => {
    setRisks(risks.map(r => r.id === id ? {...r, [field]: value} : r));
  };

  const calculateScore = (likelihood: number, impact: number) => likelihood * impact;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Risk Analysis & Mitigation</h1>
          <p className="text-muted-foreground mt-2">
            Identify and mitigate risks to strengthen your application
          </p>
        </div>

        {/* Risk Matrix */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Risk Matrix</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200">
              <p className="font-bold text-red-600 text-sm">High Risk (13-25)</p>
              <p className="text-xs text-muted-foreground">Requires immediate mitigation</p>
            </Card>
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200">
              <p className="font-bold text-yellow-600 text-sm">Medium Risk (6-12)</p>
              <p className="text-xs text-muted-foreground">Proactive mitigation needed</p>
            </Card>
            <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200">
              <p className="font-bold text-green-600 text-sm">Low Risk (1-5)</p>
              <p className="text-xs text-muted-foreground">Monitor and manage</p>
            </Card>
          </div>
        </Card>

        {/* Risk Inventory */}
        <div className="space-y-4">
          {risks.map((risk) => {
            const score = calculateScore(risk.likelihood, risk.impact);
            const riskLevel = score >= 13 ? "high" : score >= 6 ? "medium" : "low";
            const bgColor = riskLevel === "high" ? "bg-red-50 dark:bg-red-950/30" : riskLevel === "medium" ? "bg-yellow-50 dark:bg-yellow-950/30" : "bg-green-50 dark:bg-green-950/30";

            return (
              <Card key={risk.id} className={`p-6 ${bgColor}`}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm">Risk Category</Label>
                    <Input
                      value={risk.category}
                      onChange={(e) => updateRisk(risk.id, "category", e.target.value)}
                      placeholder="e.g., Market, Competition, Regulatory"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Risk Score: {score} ({riskLevel.toUpperCase()})</Label>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Likelihood: {risk.likelihood} × Impact: {risk.impact}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm">Likelihood (1-5)</Label>
                    <Input
                      type="range"
                      min="1"
                      max="5"
                      value={risk.likelihood}
                      onChange={(e) => updateRisk(risk.id, "likelihood", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Impact (1-5)</Label>
                    <Input
                      type="range"
                      min="1"
                      max="5"
                      value={risk.impact}
                      onChange={(e) => updateRisk(risk.id, "impact", parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-sm">Risk Description</Label>
                  <Textarea
                    value={risk.description}
                    onChange={(e) => updateRisk(risk.id, "description", e.target.value)}
                    className="mt-1 min-h-12"
                  />
                </div>

                <div>
                  <Label className="text-sm">Mitigation Strategy</Label>
                  <Textarea
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(risk.id, "mitigation", e.target.value)}
                    className="mt-1 min-h-12"
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add Risk Button */}
        <Card className="p-4">
          <button
            onClick={addRisk}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Add Risk
          </button>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <h2 className="font-bold mb-4">Risk Summary</h2>
          <div className="space-y-2 text-sm">
            <p>Total risks identified: <span className="font-bold">{risks.length}</span></p>
            <p>High risk items: <span className="font-bold text-red-600">{risks.filter(r => calculateScore(r.likelihood, r.impact) >= 13).length}</span></p>
            <p>Medium risk items: <span className="font-bold text-yellow-600">{risks.filter(r => calculateScore(r.likelihood, r.impact) >= 6 && calculateScore(r.likelihood, r.impact) < 13).length}</span></p>
            <p>Low risk items: <span className="font-bold text-green-600">{risks.filter(r => calculateScore(r.likelihood, r.impact) < 6).length}</span></p>
          </div>
        </Card>

        {/* Endorser Guidance */}
        <Card className="p-6">
          <p className="font-semibold mb-2">What Endorsers Look For:</p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Awareness of key business risks</li>
            <li>Thoughtful, realistic mitigation strategies</li>
            <li>Evidence of contingency planning</li>
            <li>Understanding of market and competitive dynamics</li>
            <li>Ability to adapt and pivot when needed</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
