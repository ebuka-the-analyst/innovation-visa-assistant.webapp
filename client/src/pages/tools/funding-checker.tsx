import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FundingChecker() {
  const [applicantType, setApplicantType] = useState<"individual" | "team">("individual");
  const [fundingAmount, setFundingAmount] = useState(0);
  const [numberOfCoFounders, setNumberOfCoFounders] = useState(1);

  const TEAM_INDIVIDUAL_MINIMUM = 50000;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Funding Appropriateness Checker</h1>
          <p className="text-muted-foreground mt-2">
            Determine if your funding is appropriate for your business plan (November 2025 rules)
          </p>
        </div>

        {/* Applicant Type */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">1. Are you applying as an individual or a team?</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setApplicantType("individual")}
              variant={applicantType === "individual" ? "default" : "outline"}
              className="flex-1"
            >
              Individual Founder
            </Button>
            <Button
              onClick={() => setApplicantType("team")}
              variant={applicantType === "team" ? "default" : "outline"}
              className="flex-1"
            >
              Team/Co-Founders
            </Button>
          </div>
        </Card>

        {/* Individual Requirements */}
        {applicantType === "individual" && (
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 space-y-6">
            <div>
              <h2 className="font-bold mb-4">Individual Applicant - Funding Requirements</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">✓ NO fixed minimum investment required</p>
                  <p className="text-muted-foreground">
                    Unlike the old Innovator visa, there is NO £50,000 fixed minimum for individual applicants.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Funding must be "Appropriate":</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Sufficient for your specific business plan</li>
                    <li>Legitimate and verifiable sources</li>
                    <li>Demonstrates genuine commitment</li>
                    <li>Endorser will assess appropriateness</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="individual-funding">Enter your planned funding amount (£)</Label>
              <Input
                id="individual-funding"
                type="number"
                placeholder="e.g. 25000"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
            </div>

            <Card className="p-4 bg-white dark:bg-slate-900">
              <p className="text-sm font-semibold">Assessment:</p>
              <p className="text-muted-foreground mt-1">
                Your planned funding of <span className="font-bold">£{fundingAmount.toLocaleString()}</span> will be assessed by the endorsing body as appropriate if it:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Aligns with your business stage and capital needs</li>
                <li>Has legitimate, verifiable sources</li>
                <li>Is sufficient for your 3-year business plan</li>
                <li>No concerns over money laundering/origin</li>
              </ul>
            </Card>
          </Card>
        )}

        {/* Team Requirements */}
        {applicantType === "team" && (
          <Card className="p-6 bg-purple-50 dark:bg-purple-950/30 space-y-6">
            <div>
              <h2 className="font-bold mb-4">Team Applicants - Funding Requirements</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">✓ EACH co-founder must independently have £50,000</p>
                  <p className="text-muted-foreground">
                    For new team businesses, each member must individually meet the £50,000 threshold.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Key Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Separate endorsement for each co-founder (not linked)</li>
                    <li>Each person needs own £50,000</li>
                    <li>Each scores independently on 70-point scale</li>
                    <li>Minimum 2 contact point meetings per person</li>
                    <li>Total team funding = £50k × number of co-founders</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="co-founders">Number of co-founders</Label>
                <Input
                  id="co-founders"
                  type="number"
                  min="2"
                  value={numberOfCoFounders}
                  onChange={(e) => setNumberOfCoFounders(Math.max(2, parseInt(e.target.value) || 2))}
                  className="mt-2"
                />
              </div>

              <Card className="p-4 bg-white dark:bg-slate-900">
                <p className="text-sm font-semibold">Team Funding Summary:</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Co-founders:</span>
                    <span className="font-bold">{numberOfCoFounders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required per person:</span>
                    <span className="font-bold">£{TEAM_INDIVIDUAL_MINIMUM.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-bold">
                    <span>Total team funding required:</span>
                    <span>£{(numberOfCoFounders * TEAM_INDIVIDUAL_MINIMUM).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {/* Personal Savings Note */}
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/30">
          <p className="font-semibold mb-2">⚠ Important: Personal Savings Separate</p>
          <p className="text-sm text-muted-foreground">
            The funding requirements above are separate from the mandatory personal savings of £1,270 for 28 consecutive days.
          </p>
        </Card>
      </div>
    </div>
  );
}
