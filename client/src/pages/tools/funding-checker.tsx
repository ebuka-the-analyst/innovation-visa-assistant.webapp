import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function FundingChecker() {
  const [applicationType, setApplicationType] = useState("individual");
  const [funding, setFunding] = useState(50000);
  const [coFounders, setCoFounders] = useState(1);

  const isTeam = applicationType === "team";
  const minimumPerFounder = 50000;
  const totalRequired = isTeam ? minimumPerFounder * (coFounders + 1) : 0;
  const isAppropriate = !isTeam || funding >= totalRequired;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Funding Appropriateness Checker</h1>
            <p className="text-lg text-muted-foreground">Verify your funding meets UK Innovation Visa requirements</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Application Type</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-accent/50">
                  <input type="radio" name="type" value="individual" checked={applicationType === "individual"} onChange={(e) => setApplicationType(e.target.value)} />
                  <div>
                    <p className="text-sm font-medium">Individual Applicant</p>
                    <p className="text-xs text-muted-foreground">No fixed minimum - must be appropriate</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-accent/50">
                  <input type="radio" name="type" value="team" checked={applicationType === "team"} onChange={(e) => setApplicationType(e.target.value)} />
                  <div>
                    <p className="text-sm font-medium">Team (Co-Founders)</p>
                    <p className="text-xs text-muted-foreground">£50k per founder required</p>
                  </div>
                </label>
              </div>
            </Card>

            <Card className={`p-6 ${isAppropriate ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start gap-3">
                {isAppropriate ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h3 className={`font-bold text-lg ${isAppropriate ? "text-green-600" : "text-red-600"}`}>
                    {isAppropriate ? "✓ APPROPRIATE" : "✗ INSUFFICIENT"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {applicationType === "individual" 
                      ? "Funding amount must be justified for your business plan"
                      : isAppropriate
                        ? "Your funding meets requirements"
                        : `Need £${(totalRequired - funding).toLocaleString()} more`}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {isTeam && (
            <Card className="p-6 mb-8">
              <h3 className="font-semibold mb-4">Team Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Funding (£)</label>
                  <Input 
                    type="number" 
                    value={funding} 
                    onChange={(e) => setFunding(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Additional Co-Founders</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={coFounders} 
                    onChange={(e) => setCoFounders(Number(e.target.value))} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Total founders: {coFounders + 1}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Your Funding</p>
                <p className="text-3xl font-bold mt-2">£{funding.toLocaleString()}</p>
              </div>
              {isTeam && (
                <div>
                  <p className="text-sm text-muted-foreground">Required ({coFounders + 1} founders)</p>
                  <p className="text-3xl font-bold mt-2">£{totalRequired.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Requirements</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Individual applicants:</strong> No fixed minimum - must demonstrate "appropriate" funding for your business plan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Team applicants:</strong> £50,000 per co-founder is required</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Funds must be legitimate and properly documented</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Separate endorsement applications may be required for team members</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
