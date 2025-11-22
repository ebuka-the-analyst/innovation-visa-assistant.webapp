import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function FundingChecker() {
  const [applicantType, setApplicantType] = useState("individual");
  const [funding, setFunding] = useState(0);
  const [cofounders, setCofounders] = useState(0);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    let minRequired = 0;
    let isAppropriate = false;

    if (applicantType === "individual") {
      isAppropriate = funding > 0;
      minRequired = 0;
    } else {
      minRequired = 50000 * (cofounders + 1);
      isAppropriate = funding >= minRequired;
    }

    setResult({ minRequired, actual: funding, isAppropriate, cofounders });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Funding Appropriateness Checker</h1>
            <p className="text-lg text-muted-foreground">Verify your funding is appropriate for UK Innovation Visa requirements</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Funding Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Applicant Type</label>
                  <Select value={applicantType} onValueChange={setApplicantType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Founder</SelectItem>
                      <SelectItem value="team">Team (Co-founders)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {applicantType === "team" && (
                  <div>
                    <label className="text-sm font-medium">Number of Co-founders (excluding you)</label>
                    <Input type="number" value={cofounders} onChange={e => setCofounders(parseInt(e.target.value) || 0)} min="0" className="mt-2" />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Total Available Funding (£)</label>
                  <Input type="number" value={funding} onChange={e => setFunding(parseInt(e.target.value) || 0)} placeholder="50000" className="mt-2" />
                </div>

                <Button onClick={calculate} className="w-full mt-4">Check Appropriateness</Button>
              </div>
            </Card>

            <Card className={`p-6 ${result?.isAppropriate ? 'bg-green-50' : result ? 'bg-red-50' : ''}`}>
              <h3 className="font-semibold mb-4">Requirement</h3>
              {result && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum Required</p>
                    <p className="text-2xl font-bold">£{result.minRequired ? result.minRequired.toLocaleString() : "Any amount"}</p>
                  </div>
                  <div className={`text-sm font-semibold ${result.isAppropriate ? 'text-green-600' : 'text-red-600'}`}>
                    {result.isAppropriate ? '✓ APPROPRIATE' : '✗ INSUFFICIENT'}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
