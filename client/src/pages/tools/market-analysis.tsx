import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function MarketAnalysis() {
  const [tam, setTam] = useState(0);
  const [penetration, setPenetration] = useState(0.5);
  const [analysis, setAnalysis] = useState<any>(null);

  const calculate = () => {
    const sam = tam * (penetration / 100);
    const som = sam * 0.01;
    
    setAnalysis({
      tam: tam.toLocaleString(),
      sam: sam.toLocaleString(),
      som: som.toLocaleString(),
      data: [
        { name: 'TAM', value: tam },
        { name: 'SAM', value: sam },
        { name: 'SOM', value: som },
      ]
    });
  };

  const COLORS = ['#11b6e9', '#ffa536', '#FFD700'];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Market Analysis Report</h1>
            <p className="text-lg text-muted-foreground">Calculate TAM/SAM/SOM market sizing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Market Inputs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Addressable Market (TAM) - £</label>
                  <Input type="number" value={tam} onChange={e => setTam(parseInt(e.target.value) || 0)} placeholder="1000000" className="mt-2" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Market Penetration (%)</label>
                  <Input type="number" value={penetration} onChange={e => setPenetration(parseFloat(e.target.value) || 0)} min="0" max="100" step="0.1" placeholder="0.5" className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Conservative estimate for new entrants</p>
                </div>

                <Button onClick={calculate} className="w-full mt-4">Analyze Market</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Sizing</h3>
              {analysis && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">TAM (Total)</p>
                    <p className="text-lg font-bold">£{analysis.tam}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SAM (Addressable)</p>
                    <p className="text-lg font-bold">£{analysis.sam}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SOM (Obtainable)</p>
                    <p className="text-lg font-bold">£{analysis.som}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {analysis && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Visualization</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analysis.data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: £${value.toLocaleString()}`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {analysis.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
