import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import FeatureNavigation from "@/components/FeatureNavigation";
import { useState } from "react";

const risks = [
  {
    risk: "Unproven market demand - no paying customers yet",
    likelihood: "HIGH",
    mitigation: "Secure 3 pilot agreements with LOIs before submission",
    status: "pending"
  },
  {
    risk: "Financial projections appear aggressive vs. comparable ventures",
    likelihood: "MEDIUM",
    mitigation: "Benchmark against 5 similar ventures, adjust Year 1 revenue down by 30%",
    status: "in-progress"
  },
  {
    risk: "Unclear competitive advantage vs. established players",
    likelihood: "HIGH",
    mitigation: "Create differentiation matrix, highlight 3 unique features competitors lack",
    status: "pending"
  },
  {
    risk: "Job creation plan lacks detail on UK salary / contract types",
    likelihood: "MEDIUM",
    mitigation: "Map roles to UK SOC codes, specify full-time contracts, provide salary research",
    status: "completed"
  }
];

export default function RFEDefenceLab() {
  const [selectedRisk, setSelectedRisk] = useState(risks[0]);

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <FeatureNavigation currentPage="rejection-analysis" />
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">RFE DEFENCE LAB</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Refusal Defence & Risk Mitigation</h1>
            <p className="text-lg text-muted-foreground">
              Predict likely grounds for refusal. Practice responding to criticism and build a proactive risk mitigation plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 mb-1">High-Risk Issues</p>
              <p className="text-3xl font-bold text-red-600">2</p>
            </div>
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 mb-1">Medium-Risk Issues</p>
              <p className="text-3xl font-bold text-amber-600">2</p>
            </div>
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900 mb-1">Mitigated Issues</p>
              <p className="text-3xl font-bold text-green-600">1</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {risks.map((risk, idx) => (
                <Card
                  key={idx}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedRisk === risk ? "border-primary bg-primary/5" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedRisk(risk)}
                >
                  <div className="flex items-start gap-3">
                    {risk.likelihood === "HIGH" && (
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    {risk.likelihood === "MEDIUM" && (
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{risk.risk}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          risk.status === "completed" ? "bg-green-100 text-green-900" :
                          risk.status === "in-progress" ? "bg-amber-100 text-amber-900" :
                          "bg-gray-100 text-gray-900"
                        }`}>
                          {risk.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="p-8 h-full">
                <div className="mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    selectedRisk.likelihood === "HIGH" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"
                  }`}>
                    {selectedRisk.likelihood} RISK
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-4">{selectedRisk.risk}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Mitigation Strategy</p>
                    <p className="text-sm text-muted-foreground">{selectedRisk.mitigation}</p>
                  </div>
                  <Button className="w-full gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Add to Action Plan
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-8 mt-8 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Mock Refusal Rehearsal</h3>
                <p className="text-sm text-amber-900 mb-4">
                  Ready for adversarial interview prep? We'll simulate a critical endorser panel and test your responses to tough questions.
                </p>
                <Button variant="outline">Start Mock Interview</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
