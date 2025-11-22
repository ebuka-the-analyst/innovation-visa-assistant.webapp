import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function TeamAssessment() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleAnalyze = () => {
    setResult("Team assessment complete. Your team structure and capabilities have been evaluated.");
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <ToolNavigation />
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Team Assessment</h1>
            <p className="text-lg text-muted-foreground">Evaluate your team structure and capabilities for UK Innovation Visa</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Team Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Team Members & Roles</label>
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Describe your team"
                    className="mt-2"
                    data-testid="input-team-data"
                  />
                </div>
                <Button onClick={handleAnalyze} className="w-full" data-testid="button-analyze">
                  Assess Team
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Assessment Results</h3>
              {result ? (
                <div className="text-sm space-y-2" data-testid="text-results">
                  {result}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Enter team info and click assess</p>
              )}
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Key Assessment Areas</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Team experience and credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Founder instrumentality and commitment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Complementary skills and expertise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>UK Innovation Visa visa compliance</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
