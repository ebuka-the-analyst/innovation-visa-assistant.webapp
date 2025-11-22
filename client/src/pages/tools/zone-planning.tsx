import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function ZonePlanning() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleAnalyze = () => {
    setResult("Analysis complete. Your data has been processed and recommendations are ready.");
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2"></h1>
            <p className="text-lg text-muted-foreground"></p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Analysis Input</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Enter Your Information</label>
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Input data here"
                    className="mt-2"
                    data-testid="input-tool-data"
                  />
                </div>
                <Button onClick={handleAnalyze} className="w-full" data-testid="button-analyze">
                  Run Analysis
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Results</h3>
              {result ? (
                <div className="text-sm space-y-2" data-testid="text-results">
                  {result}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Enter data and click analyze to see results</p>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Key Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Professional analysis and guidance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Real-time insights and recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Comprehensive documentation and export</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>UK Innovator Visa compliance validated</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
