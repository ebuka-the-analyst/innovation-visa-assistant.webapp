import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function PointsCalculator() {
  const [businessPoints, setBusinessPoints] = useState(0);
  const [englishLevel, setEnglishLevel] = useState("below");
  const [hasSavings, setHasSavings] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const calculate = () => {
    let points = businessPoints;
    if (englishLevel === "b2") points += 10;
    if (hasSavings) points += 10;
    setTotalPoints(points);
  };

  const isApproved = totalPoints >= 70;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">UK Innovation Visa Points Calculator</h1>
            <p className="text-lg text-muted-foreground">Calculate your 70-point score for UK Innovation Visa eligibility</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Point Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Business Criteria Points (0-50)</label>
                  <Input type="number" min="0" max="50" value={businessPoints} onChange={e => setBusinessPoints(parseInt(e.target.value) || 0)} placeholder="0" className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Innovation (0-20) + Viability (0-20) + Scalability (0-10)</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">English Language Proficiency</label>
                  <Select value={englishLevel} onValueChange={setEnglishLevel}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below">Below B2 (0 points)</SelectItem>
                      <SelectItem value="b2">B2 Level or Higher (10 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center gap-3 mt-2">
                    <input type="checkbox" checked={hasSavings} onChange={e => setHasSavings(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm font-medium">Mandatory Savings £1,270 (10 points)</span>
                  </label>
                </div>

                <Button onClick={calculate} className="w-full mt-4">Calculate Points</Button>
              </div>
            </Card>

            <Card className={`p-6 ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold mb-4">Score Result</h3>
              <div className="text-5xl font-bold mb-2">{totalPoints}</div>
              <p className="text-sm mb-4">out of 70 points required</p>
              <div className={`text-sm font-semibold ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
                {isApproved ? '✓ APPROVED' : '✗ MORE POINTS NEEDED'}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Scoring Criteria</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">Business Criteria (50 points)</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Innovation: 0-20 points</li>
                  <li>• Viability: 0-20 points</li>
                  <li>• Scalability: 0-10 points</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Other Requirements</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• English B2 Level: 10 points</li>
                  <li>• Savings £1,270: 10 points</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
