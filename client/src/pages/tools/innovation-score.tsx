import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

export default function InnovationScore() {
  const [scores, setScores] = useState({
    originality: 15,
    marketNeed: 14,
    technology: 16,
    advantage: 13,
    ip: 12,
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const data = [
    { name: "Originality", value: scores.originality },
    { name: "Market Need", value: scores.marketNeed },
    { name: "Technology", value: scores.technology },
    { name: "Advantage", value: scores.advantage },
    { name: "IP Strategy", value: scores.ip },
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Innovation Score Calculator</h1>
            <p className="text-lg text-muted-foreground">5-dimension innovation assessment (0-100)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Dimensions</h3>
              <div className="space-y-4">
                {Object.entries(scores).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <Input type="range" min="0" max="20" value={value} onChange={(e) => setScores({...scores, [key]: Number(e.target.value)})} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">{value}/20</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">TOTAL SCORE</p>
                <p className="text-5xl font-bold mt-2">{total}</p>
                <p className="text-sm text-muted-foreground mt-4">out of 100</p>
              </div>
              <ResponsiveContainer width="100%" height={250} className="mt-4">
                <RadarChart data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 20]} />
                  <Radar name="Score" dataKey="value" stroke="#ffa536" fill="#ffa536" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
