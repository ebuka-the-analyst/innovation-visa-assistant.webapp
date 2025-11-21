import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SavingsValidator() {
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [hasPartner, setHasPartner] = useState(false);
  const [numChildren, setNumChildren] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  const PERSONAL_SAVINGS = 1270;
  const PARTNER_SAVINGS = 285;
  const FIRST_CHILD = 315;
  const ADDITIONAL_CHILD = 200;

  const requiredTotal = PERSONAL_SAVINGS + (hasPartner ? PARTNER_SAVINGS : 0) + (numChildren > 0 ? FIRST_CHILD : 0) + (numChildren > 1 ? (numChildren - 1) * ADDITIONAL_CHILD : 0);
  const meetsRequirement = savingsAmount >= requiredTotal && consecutiveDays >= 28;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Personal Savings Validator</h1>
          <p className="text-muted-foreground mt-2">
            Verify you have the mandatory personal savings for 28 consecutive days
          </p>
        </div>

        {/* Breakdown */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <h2 className="font-bold mb-4">Required Personal Savings Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Main applicant (28-day requirement):</span>
              <span className="font-bold">£{PERSONAL_SAVINGS.toLocaleString()}</span>
            </div>
            {hasPartner && (
              <div className="flex justify-between">
                <span>Partner (additional):</span>
                <span className="font-bold">£{PARTNER_SAVINGS.toLocaleString()}</span>
              </div>
            )}
            {numChildren > 0 && (
              <div className="flex justify-between">
                <span>First dependent child:</span>
                <span className="font-bold">£{FIRST_CHILD.toLocaleString()}</span>
              </div>
            )}
            {numChildren > 1 && (
              <div className="flex justify-between">
                <span>Each additional child ({numChildren - 1}):</span>
                <span className="font-bold">£{((numChildren - 1) * ADDITIONAL_CHILD).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Required:</span>
              <span>£{requiredTotal.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Input Form */}
        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="savings">Total Savings Amount (£)</Label>
            <Input
              id="savings"
              type="number"
              placeholder="Enter total savings"
              value={savingsAmount}
              onChange={(e) => setSavingsAmount(parseInt(e.target.value) || 0)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="days">Consecutive Days in Bank Account</Label>
            <Input
              id="days"
              type="number"
              placeholder="0"
              value={consecutiveDays}
              onChange={(e) => setConsecutiveDays(Math.min(28, parseInt(e.target.value) || 0))}
              min="0"
              max="28"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum requirement: 28 consecutive days</p>
          </div>

          <div className="space-y-2">
            <Label>Dependants</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setHasPartner(!hasPartner)}
                variant={hasPartner ? "default" : "outline"}
                className="flex-1"
              >
                {hasPartner ? "✓ Has Partner" : "No Partner"}
              </Button>
            </div>
            <div>
              <Label className="text-sm">Number of Dependent Children</Label>
              <Input
                type="number"
                min="0"
                value={numChildren}
                onChange={(e) => setNumChildren(Math.max(0, parseInt(e.target.value) || 0))}
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Result */}
        <Card className={`p-6 ${meetsRequirement ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <h2 className="text-xl font-bold mb-4">Savings Validation Result</h2>
          <div className="space-y-2">
            <p className={`font-semibold ${meetsRequirement ? 'text-green-600' : 'text-red-600'}`}>
              {meetsRequirement ? "✓ REQUIREMENT MET" : "✗ REQUIREMENT NOT MET"}
            </p>
            <p className="text-sm">
              Your savings: <span className="font-bold">£{savingsAmount.toLocaleString()}</span>
              {savingsAmount < requiredTotal && (
                <span className="text-red-600 ml-2">({requiredTotal - savingsAmount} short)</span>
              )}
            </p>
            <p className="text-sm">
              Consecutive days: <span className="font-bold">{consecutiveDays}/28 days</span>
              {consecutiveDays < 28 && (
                <span className="text-red-600 ml-2">({28 - consecutiveDays} days needed)</span>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
