import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import FeatureNavigation from "@/components/FeatureNavigation";
import { useState, useEffect } from "react";

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
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("rfe-action-plan");
    if (saved) {
      try {
        setActionPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse action plan from localStorage");
      }
    }
  }, []);

  const isInActionPlan = actionPlan.includes(selectedRisk.risk);

  const addToActionPlan = () => {
    if (isInActionPlan) {
      const updated = actionPlan.filter(r => r !== selectedRisk.risk);
      setActionPlan(updated);
      localStorage.setItem("rfe-action-plan", JSON.stringify(updated));
      toast({
        title: "Removed from Action Plan",
        description: "The mitigation strategy has been removed from your action plan.",
      });
    } else {
      const updated = [...actionPlan, selectedRisk.risk];
      setActionPlan(updated);
      localStorage.setItem("rfe-action-plan", JSON.stringify(updated));
      toast({
        title: "Added to Action Plan",
        description: "The mitigation strategy has been added to your action plan.",
      });
    }
  };

  return (
    <div className="min-h-screen">
      
      <div className="responsive-container py-16">
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
            <div className="p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-100 mb-1">High-Risk Issues</p>
              <p className="text-3xl font-bold text-red-600">2</p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100 mb-1">Medium-Risk Issues</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">2</p>
            </div>
            <div className="p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-100 mb-1">Mitigated Issues</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">1</p>
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
                          risk.status === "completed" ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100" :
                          risk.status === "in-progress" ? "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100" :
                          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                    selectedRisk.likelihood === "HIGH" ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100" : "bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100"
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
                  <Button 
                    className="w-full gap-2"
                    variant={isInActionPlan ? "outline" : "default"}
                    onClick={addToActionPlan}
                    data-testid="button-add-to-action-plan"
                  >
                    {isInActionPlan ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added to Action Plan
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Add to Action Plan
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-8 mt-8 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Mock Refusal Rehearsal</h3>
                <p className="text-sm text-amber-900 dark:text-amber-100 mb-4">
                  Ready for adversarial interview prep? We'll simulate a critical endorser panel and test your responses to tough questions.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Mock Interview Starting",
                      description: "Launching adversarial interview simulation...",
                    });
                    window.location.href = "/interview-prep";
                  }}
                  data-testid="button-start-mock-interview"
                >
                  Start Mock Interview
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
