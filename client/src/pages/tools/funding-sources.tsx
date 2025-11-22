import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FUNDINGSOURCES() {
  const [initial, setInitial] = useState(50000);
  const [monthly, setMonthly] = useState(15000);
  const [growth, setGrowth] = useState(5);

  const projections = Array.from({ length: 12 }, (_, i) => ({
    m: i + 1,
    cash: initial - monthly * (i + 1),
    revenue: i * growth * 1000
  }));
  
  const finalCash = initial - monthly * 12;
  const runway = Math.round(initial / monthly);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Funding Sources</h1>
            <p className="text-muted-foreground">Financial modeling and cash flow analysis</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-semibold">Initial Capital (£)</label>
              <Input type="number" value={initial} onChange={e => setInitial(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-semibold">Monthly Burn (£)</label>
              <Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-semibold">Growth (%)</label>
              <Input type="number" value={growth} onChange={e => setGrowth(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Runway</p>
              <p className="text-2xl font-bold mt-2">{runway} months</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Year-End Cash</p>
              <p className="text-2xl font-bold mt-2">£{finalCash.toLocaleString()}</p>
            </Card>
            <Card className={`p-4 ${finalCash > 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`text-lg font-bold mt-2 ${finalCash > 0 ? "text-green-700" : "text-red-700"}`}>
                {finalCash > 0 ? "Viable" : "At Risk"}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projections}>
                <CartesianGrid />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cash" stroke="#ffa536" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  );
}
