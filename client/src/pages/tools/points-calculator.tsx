import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PointsCalculator() {
  const [businessScore, setBusinessScore] = useState(0);
  const [englishScore, setEnglishScore] = useState(0);
  const [financialScore, setFinancialScore] = useState(0);
  const totalScore = businessScore + englishScore + financialScore;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Points Scoring Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Calculate your 70-point requirement: 50 business + 10 English + 10 financial
          </p>
        </div>

        {/* Score Display */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Business Criteria</p>
              <p className="text-2xl font-bold text-blue-600">{businessScore}/50</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">English Level B2</p>
              <p className="text-2xl font-bold text-green-600">{englishScore}/10</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financial Requirement</p>
              <p className="text-2xl font-bold text-orange-600">{financialScore}/10</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className={`text-2xl font-bold ${totalScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                {totalScore}/70
              </p>
            </div>
          </div>
        </Card>

        {/* Business Criteria (50 points) */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Business Criteria (0-50 points)</h2>
          <div className="space-y-4">
            <div>
              <Label>Innovation Score (0-20): Original, genuine business plan meeting market need?</Label>
              <Input
                type="range"
                min="0"
                max="20"
                value={Math.min(businessScore, 20)}
                onChange={(e) => setBusinessScore(Math.min(20, parseInt(e.target.value)) + (businessScore > 20 ? businessScore - 20 : 0))}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">{Math.min(businessScore, 20)} points</p>
            </div>

            <div>
              <Label>Viability Score (0-15): Realistic and achievable business plan?</Label>
              <Input
                type="range"
                min="0"
                max="15"
                value={Math.max(0, Math.min(businessScore - 20, 15))}
                onChange={(e) => setBusinessScore(Math.min(20, businessScore) + Math.min(15, parseInt(e.target.value)))}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">{Math.max(0, Math.min(businessScore - 20, 15))} points</p>
            </div>

            <div>
              <Label>Scalability Score (0-15): Evidence of job creation and market expansion?</Label>
              <Input
                type="range"
                min="0"
                max="15"
                value={Math.max(0, businessScore - 35)}
                onChange={(e) => setBusinessScore(Math.min(20, businessScore) + Math.min(15, businessScore - 20 >= 0 ? businessScore - 20 : 0) + parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">{Math.max(0, businessScore - 35)} points</p>
            </div>
          </div>
        </Card>

        {/* English Language (10 points) */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">English Language (0-10 points)</h2>
          <div className="space-y-2 text-sm">
            <p>Score 10 if: GCSE/A-Level/UK degree taught in English/ IEL TS 7.0+ / equivalent</p>
            <Button
              onClick={() => setEnglishScore(englishScore === 10 ? 0 : 10)}
              variant={englishScore === 10 ? "default" : "outline"}
              className="w-full"
            >
              {englishScore === 10 ? "✓ English B2 Qualified (10 pts)" : "Not Qualified (0 pts)"}
            </Button>
          </div>
        </Card>

        {/* Financial (10 points) */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Financial Requirement (0-10 points)</h2>
          <div className="space-y-2 text-sm">
            <p>Score 10 if: Personal savings £1,270 for 28 consecutive days + appropriate funding</p>
            <Button
              onClick={() => setFinancialScore(financialScore === 10 ? 0 : 10)}
              variant={financialScore === 10 ? "default" : "outline"}
              className="w-full"
            >
              {financialScore === 10 ? "✓ Financial Requirement Met (10 pts)" : "Not Met (0 pts)"}
            </Button>
          </div>
        </Card>

        {/* Result */}
        <Card className={`p-6 ${totalScore >= 70 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <h2 className="text-xl font-bold mb-2">Result</h2>
          <p className={`text-lg font-semibold ${totalScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
            {totalScore >= 70 
              ? `✓ You meet the 70-point requirement (${totalScore} points)` 
              : `✗ You need ${70 - totalScore} more points to meet the 70-point requirement`}
          </p>
        </Card>
      </div>
    </div>
  );
}
