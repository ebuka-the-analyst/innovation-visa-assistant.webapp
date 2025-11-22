import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DIMENSIONS = [
  { id: "originality", label: "Originality & Genuineness", max: 20 },
  { id: "market", label: "Market Need Validation", max: 20 },
  { id: "technology", label: "Technology & Feasibility", max: 20 },
  { id: "competitive", label: "Competitive Advantage", max: 20 },
  { id: "ip", label: "IP Protection & Strategy", max: 20 },
];

export default function InnovationScore() {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [analysis, setAnalysis] = useState<any>(null);

  const calculate = () => {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const average = totalScore / DIMENSIONS.length;

    const data = DIMENSIONS.map(d => ({
      name: d.label.split(' ')[0],
      score: scores[d.id] || 0,
      max: d.max
    }));

    setAnalysis({
      totalScore,
      average,
      data,
      assessment: average >= 15 ? "Highly Innovative" : average >= 10 ? "Moderately Innovative" : "Needs Development"
    });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Innovation Score Calculator</h1>
            <p className="text-lg text-muted-foreground">5-dimension assessment of your innovation (0-20 each, max 100)</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Rate Each Dimension (0-20)</h3>
              <div className="space-y-4">
                {DIMENSIONS.map(dim => (
                  <div key={dim.id}>
                    <label className="text-sm font-medium">{dim.label}</label>
                    <Input type="number" min="0" max="20" value={scores[dim.id] || 0} onChange={e => setScores({...scores, [dim.id]: parseInt(e.target.value) || 0})} className="mt-2" />
                  </div>
                ))}
                <Button onClick={calculate} className="w-full mt-4">Calculate Score</Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Innovation Assessment</h3>
              {analysis && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className="text-3xl font-bold">{analysis.totalScore}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{analysis.average.toFixed(1)}/20</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className={`text-sm font-semibold ${analysis.average >= 15 ? 'text-green-600' : analysis.average >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {analysis.assessment}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {analysis?.data && (
            <Card className="p-6 mb-8">
              <h3 className="font-semibold mb-4">Dimension Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#ffa536" name="Your Score" />
                  <Bar dataKey="max" fill="#11b6e9" name="Maximum" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Improvement Suggestions</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Focus on dimensions where you scored below 15</li>
              <li>• Develop IP protection strategy for competitive advantage</li>
              <li>• Validate market need through customer research</li>
              <li>• Demonstrate technical feasibility with prototypes or MVP</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
