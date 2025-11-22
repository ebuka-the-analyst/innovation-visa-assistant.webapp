import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PointsCalculator() {
  const [innovationScore, setInnovationScore] = useState(50);
  const [viabilityScore, setViabilityScore] = useState(50);
  const [scalabilityScore, setScalabilityScore] = useState(50);
  const [englishLevel, setEnglishLevel] = useState("B2");
  const [fundingProof, setFundingProof] = useState(true);

  const businessPoints = Math.min(50, (innovationScore + viabilityScore + scalabilityScore) / 3);
  const englishPoints = englishLevel === "B2" || englishLevel === "C1" || englishLevel === "C2" ? 10 : 0;
  const financialPoints = fundingProof ? 10 : 0;
  const totalPoints = businessPoints + englishPoints + financialPoints;
  const passThreshold = 70;
  const status = totalPoints >= passThreshold ? "✓ PASS" : "✗ FAIL";
  const statusColor = totalPoints >= passThreshold ? "text-green-600" : "text-red-600";

  const data = [
    { category: "Business", points: businessPoints, max: 50 },
    { category: "English", points: englishPoints, max: 10 },
    { category: "Financial", points: financialPoints, max: 10 },
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">70-Point Scoring System</h1>
            <p className="text-lg text-muted-foreground">Calculate your UK Innovation Visa points</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold text-muted-foreground mb-4">Business Criteria (50 pts)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Innovation Score</label>
                  <Input type="range" min="0" max="100" value={innovationScore} onChange={(e) => setInnovationScore(Number(e.target.value))} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">{innovationScore}/100</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Viability Score</label>
                  <Input type="range" min="0" max="100" value={viabilityScore} onChange={(e) => setViabilityScore(Number(e.target.value))} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">{viabilityScore}/100</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Scalability Score</label>
                  <Input type="range" min="0" max="100" value={scalabilityScore} onChange={(e) => setScalabilityScore(Number(e.target.value))} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">{scalabilityScore}/100</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-muted-foreground mb-4">English Language (10 pts)</h3>
              <div className="space-y-3">
                {["B2", "C1", "C2"].map((level) => (
                  <label key={level} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/50">
                    <input type="radio" name="english" value={level} checked={englishLevel === level} onChange={(e) => setEnglishLevel(e.target.value)} />
                    <span className="text-sm">{level} ({level === "B2" ? "GCSE/IELTS 7.0" : level === "C1" ? "IELTS 8.0" : "IELTS 9.0"})</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-muted-foreground mb-4">Financial Requirement (10 pts)</h3>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-accent/50">
                <input type="checkbox" checked={fundingProof} onChange={(e) => setFundingProof(e.target.checked)} />
                <span className="text-sm">£1,270 for 28 consecutive days</span>
              </label>
              <p className="text-xs text-muted-foreground mt-4">Points: {financialPoints}</p>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Points Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis max={50} />
                <Tooltip formatter={(value) => `${value} pts`} />
                <Legend />
                <Bar dataKey="points" fill="#ffa536" name="Your Points" />
                <Bar dataKey="max" fill="#e0e0e0" name="Maximum" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">TOTAL SCORE</p>
                <p className="text-5xl font-bold">{Math.round(totalPoints)}</p>
                <p className="text-sm text-muted-foreground mt-2">out of 70 required</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className={`text-4xl font-bold ${statusColor}`}>{status}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalPoints >= passThreshold 
                    ? "✓ You meet the minimum points requirement" 
                    : `Need ${passThreshold - Math.round(totalPoints)} more points`}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
