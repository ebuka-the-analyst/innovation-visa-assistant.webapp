import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DIMS = [
  { n: "Innovation", desc: "Originality and genuineness" },
  { n: "Market Need", desc: "Addresses real market problem" },
  { n: "Technology", desc: "Feasible and realistic approach" },
  { n: "Scalability", desc: "Ability to grow and scale" },
  { n: "IP/Advantage", desc: "Competitive moat and IP" }
];

export default function PMFVALIDATOR() {
  const [scores, setScores] = useState({ d0: 12, d1: 14, d2: 13, d3: 11, d4: 10 });
  const total = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
  const data = DIMS.map((d, i) => ({ name: d.n.substring(0, 6), score: scores[`d${i}` as keyof typeof scores] }));

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Pmf Validator</h1>
            <p className="text-muted-foreground">Multi-dimensional assessment scoring</p>
          </div>
          
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold">Total Score: {total}/100</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Level: {total > 75 ? "Excellent" : total > 60 ? "Strong" : total > 40 ? "Moderate" : "Developing"}
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 20]} />
                <Bar dataKey="score" fill="#ffa536" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="space-y-3">
            {DIMS.map((d, i) => (
              <Card key={i} className="p-4">
                <p className="font-semibold text-sm mb-2">{d.n}</p>
                <p className="text-xs text-muted-foreground mb-2">{d.desc}</p>
                <Slider min={0} max={20} step={1} value={[scores[`d${i}` as keyof typeof scores]]} onValueChange={(v) => setScores({ ...scores, [`d${i}`]: v[0] })} className="mb-2" />
                <p className="text-xs font-bold">{scores[`d${i}` as keyof typeof scores]}/20</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
