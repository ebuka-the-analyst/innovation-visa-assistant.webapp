import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function VIABILITYCHECKER() {
  const [scores, setScores] = useState({ d1: 12, d2: 15, d3: 14, d4: 13, d5: 11 });
  const total = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
  const pct = (total / 100) * 100;
  const data = Object.entries(scores).map(([k, v]) => ({ d: k, s: v }));

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Viability Checker</h1>
            <p className="text-lg text-muted-foreground">Advanced Assessment</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold text-muted-foreground">Score</h3>
              <p className="text-5xl font-bold">{total}/100</p>
              <p className="text-lg font-semibold mt-2">{pct > 80 ? "Excellent" : pct > 60 ? "Strong" : "Moderate"}%</p>
            </Card>
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid />
                  <XAxis dataKey="d" />
                  <YAxis domain={[0, 20]} />
                  <Bar dataKey="s" fill="#ffa536" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
