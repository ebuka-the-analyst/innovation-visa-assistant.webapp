import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FINANCIALMODELING() {
  const [inputs, setInputs] = useState({ v1: 10000, v2: 15 });
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const months = 12;
    const projections = Array.from({ length: months }, (_, i) => {
      const m = i + 1;
      const val = inputs.v1 * Math.pow(1 + inputs.v2 / 100, m);
      return { month: m, value: Math.round(val), cumulative: Math.round(val * 1.2) };
    });
    const final = projections[months - 1].value;
    const growth = ((final - inputs.v1) / inputs.v1 * 100).toFixed(1);
    setResults({
      final,
      growth,
      projections,
      factors: [{ c: "Primary", v: 65 }, { c: "Secondary", v: 25 }, { c: "Tertiary", v: 10 }],
      scenarios: [{ s: "Best", v: final * 1.3, p: 25 }, { s: "Base", v: final, p: 50 }, { s: "Worst", v: final * 0.7, p: 25 }]
    });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-7xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Financial Modeling</h1>
            <p className="text-lg text-muted-foreground">Strategic Financial Forecasting</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Input type="number" placeholder="Value 1" value={inputs.v1} onChange={e => setInputs({ ...inputs, v1: parseInt(e.target.value) || 0 })} />
            <Input type="number" placeholder="Growth %" value={inputs.v2} onChange={e => setInputs({ ...inputs, v2: parseFloat(e.target.value) || 0 })} />
          </div>
          <Button onClick={calculate} className="w-full mb-6">Generate Analysis</Button>
          {results && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                  <h3 className="text-sm font-medium">Final Value</h3>
                  <p className="text-3xl font-bold mt-2">£{results.final.toLocaleString()}</p>
                </Card>
                <Card className="p-6 bg-blue-50">
                  <h3 className="text-sm font-medium">Growth</h3>
                  <p className="text-3xl font-bold mt-2">{results.growth}%</p>
                </Card>
                <Card className="p-6 bg-green-50">
                  <h3 className="text-sm font-medium">Monthly Avg</h3>
                  <p className="text-3xl font-bold mt-2">£{Math.round(results.final / 12).toLocaleString()}</p>
                </Card>
                <Card className="p-6 bg-orange-50">
                  <h3 className="text-sm font-medium">Risk Level</h3>
                  <p className="text-3xl font-bold mt-2">Medium</p>
                </Card>
              </div>
              <Card className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.projections.slice(0, 12)}>
                    <CartesianGrid />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ffa536" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
