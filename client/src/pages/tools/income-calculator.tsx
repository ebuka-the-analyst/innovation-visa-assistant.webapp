import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function IncomeCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyBurn, setMonthlyBurn] = useState(0);
  const [capital, setCapital] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);

  const calculate = () => {
    const runway = monthlyBurn > 0 ? Math.round(capital / monthlyBurn) : 0;
    const monthlyProfit = monthlyRevenue - monthlyBurn;
    const breakEven = monthlyBurn > 0 ? Math.ceil(monthlyBurn / (monthlyRevenue || 1)) : 0;
    
    let viability = "Low";
    if (monthlyProfit > 0) viability = "High";
    else if (runway > 12) viability = "Medium";

    const forecast = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      cumulative: capital + (monthlyProfit * (i + 1)),
    })).filter(d => d.cumulative >= 0);

    setAnalysis({ runway, monthlyProfit, breakEven, viability, forecast });
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Income & Viability Analyzer</h1>
            <p className="text-lg text-muted-foreground">Analyze business runway, cashflow, and viability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Financial Inputs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Monthly Revenue Projection (£)</label>
                  <Input type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(parseInt(e.target.value) || 0)} placeholder="0" className="mt-2" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Monthly Burn Rate (£)</label>
                  <Input type="number" value={monthlyBurn} onChange={e => setMonthlyBurn(parseInt(e.target.value) || 0)} placeholder="0" className="mt-2" />
                </div>

                <div>
                  <label className="text-sm font-medium">Current Capital (£)</label>
                  <Input type="number" value={capital} onChange={e => setCapital(parseInt(e.target.value) || 0)} placeholder="0" className="mt-2" />
                </div>

                <Button onClick={calculate} className="w-full mt-4">Analyze Viability</Button>
              </div>
            </Card>

            <Card className={`p-6 ${analysis?.viability === 'High' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <h3 className="font-semibold mb-4">Viability Score</h3>
              {analysis && (
                <div className="space-y-3">
                  <div className={`text-3xl font-bold ${analysis.viability === 'High' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {analysis.viability}
                  </div>
                  <div className="text-sm space-y-2">
                    <div><strong>Runway:</strong> {analysis.runway} months</div>
                    <div><strong>Monthly P&L:</strong> £{analysis.monthlyProfit.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {analysis?.forecast && analysis.forecast.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="font-semibold mb-4">12-Month Projection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysis.forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Balance (£)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="cumulative" stroke="#ffa536" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
