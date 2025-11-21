import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { useToast } from "@/hooks/use-toast";

const commonRejectionReasons = [
  "Lack of clear innovation or differentiation",
  "Insufficient market validation",
  "Unrealistic financial projections",
  "Weak founder credentials for the sector",
  "Inadequate job creation plan",
  "Poor team composition or gaps",
  "Insufficient capital demonstration",
  "Unclear scalability strategy",
  "IP concerns or patent issues",
  "Vague go-to-market strategy"
];

export default function RejectionAnalysis() {
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleAnalyze = async () => {
    if (!rejectionReason && selectedReasons.length === 0) {
      toast({
        title: "Error",
        description: "Please describe your rejection reason or select from common reasons",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I received a UK Innovation Visa rejection. ${rejectionReason}. Selected rejection categories: ${selectedReasons.join(", ")}. Please provide: 1) Analysis of why this likely happened, 2) Specific recommendations to address this, 3) Probability of success if I reapply with these changes.`,
          conversationHistory: []
        })
      });

      const data = await response.json();
      setAnalysis(data.response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze rejection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Rejection Analysis</h1>
            <p className="text-lg text-muted-foreground">
              Understand why your application was rejected and plan your reapplication strategy
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reapplication Strategy</h3>
                  <p className="text-sm text-amber-900">
                    Receiving a rejection doesn't mean your business isn't viable. Most successful founders learn from their rejection and significantly improve their application the second time. Our analysis will help you identify exactly what to fix.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="font-semibold text-lg mb-6">Step 1: Select Rejection Reason(s)</h3>
              <div className="space-y-3 mb-6">
                {commonRejectionReasons.map(reason => (
                  <label key={reason} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      data-testid={`checkbox-reason-${reason.replace(/\s+/g, '-').toLowerCase()}`}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="mb-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">Step 2: Describe Your Rejection (Optional)</h3>
                <Textarea
                  placeholder="Describe what the rejection letter said, or any feedback you received..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-rejection-details"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isLoading || (!rejectionReason && selectedReasons.length === 0)}
                className="w-full gap-2 py-6 text-base"
                data-testid="button-analyze-rejection"
              >
                <TrendingUp className="w-5 h-5" />
                {isLoading ? "Analyzing..." : "Analyze & Get Strategy"}
              </Button>
            </Card>

            {analysis && (
              <Card className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <h3 className="font-semibold text-lg">Your Reapplication Strategy</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{analysis}</p>
                </div>

                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold mb-3 text-green-900">Next Steps</h4>
                  <ol className="text-sm space-y-2 text-green-900 list-decimal list-inside">
                    <li>Address each recommendation from the analysis above</li>
                    <li>Gather new evidence and market validation</li>
                    <li>Revise your business plan with specific improvements</li>
                    <li>Book an expert consultation to review changes</li>
                    <li>Reapply with confidence</li>
                  </ol>
                </div>

                <Button className="w-full mt-6 gap-2">
                  Book Expert Review
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
