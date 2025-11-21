import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import FeatureNavigation from "@/components/FeatureNavigation";

const claims = [
  {
    claim: "Clear market demand for our product",
    status: "strong",
    evidence: ["Customer interviews (5 companies)", "Market research report", "Pre-sales commitments"],
    supportScore: 95
  },
  {
    claim: "Significant technological differentiation",
    status: "moderate",
    evidence: ["GitHub private repository", "Patent filing (pending)"],
    supportScore: 72,
    gap: "Need technical whitepaper + comparison analysis"
  },
  {
    claim: "Realistic path to profitability in 24 months",
    status: "weak",
    evidence: ["Financial model"],
    supportScore: 45,
    gap: "Need: pilot revenue data, LOIs from customers, detailed unit economics"
  },
  {
    claim: "Will create 5+ jobs by Year 3",
    status: "strong",
    evidence: ["Hiring roadmap", "UK SOC job codes", "Salary benchmarking"],
    supportScore: 88
  }
];

export default function EvidenceGraph() {
  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <FeatureNavigation currentPage="document-organizer" />
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">EVIDENCE GRAPH</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Claim-to-Proof Evidence Mapping</h1>
            <p className="text-lg text-muted-foreground">
              Every claim in your business plan mapped to supporting evidence. Spot gaps and strengthen weak points before submission.
            </p>
          </div>

          <div className="space-y-6">
            {claims.map((item, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {item.status === "strong" && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {item.status === "moderate" && (
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  {item.status === "weak" && (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.claim}</h3>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Evidence Support Score</span>
                        <span className="text-sm font-bold text-primary">{item.supportScore}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            item.supportScore >= 80
                              ? "bg-green-600"
                              : item.supportScore >= 50
                              ? "bg-amber-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${item.supportScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold mb-2">Supporting Evidence</p>
                    <div className="flex flex-wrap gap-2">
                      {item.evidence.map((ev, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                          ✓ {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                  {item.gap && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-900"><strong>Gap:</strong> {item.gap}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 mt-8 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-4">Overall Evidence Health</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your application has <strong>strong</strong> evidence for 50% of claims, <strong>moderate</strong> for 25%, and <strong>weak</strong> for 25%.
              </p>
              <p className="text-sm font-semibold">Next Step: Strengthen the weak claims by gathering additional evidence:</p>
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                <li>Run a pilot with a paying customer to prove viability</li>
                <li>Create detailed unit economics breakdown</li>
                <li>Obtain customer testimonials and LOIs</li>
              </ul>
              <Button className="mt-4">Create Action Plan</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
