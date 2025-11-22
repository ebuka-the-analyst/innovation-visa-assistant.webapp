import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function IncomeCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [monthlyBurn, setMonthlyBurn] = useState(30000);
  const [initialCapital, setInitialCapital] = useState(500000);

  const monthlyProfit = monthlyRevenue - monthlyBurn;
  const runway = monthlyBurn > 0 ? Math.floor(initialCapital / monthlyBurn) : 999;
  const isPositive = monthlyProfit > 0;
  const breakEvenMonths = isPositive ? 0 : (monthlyBurn > monthlyRevenue ? Math.ceil(initialCapital / (monthlyBurn - monthlyRevenue)) : 999);

  const projectionData = Array.from({ length: 13 }, (_, month) => {
    const capital = Math.max(0, initialCapital - (monthlyBurn * month) + (monthlyRevenue * month));
    return {
      month: month === 0 ? "Now" : `M${month}`,
      capital,
      revenue: monthlyRevenue * month,
    };
  });

  const viabilityScore = isPositive ? "High" : runway > 12 ? "Medium" : "Low";
  const viabilityColor = isPositive ? "text-green-600" : runway > 12 ? "text-yellow-600" : "text-red-600";

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Income & Viability Analyzer</h1>
            <p className="text-lg text-muted-foreground">Analyze your business runway and viability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Financial Inputs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Monthly Revenue (£)</label>
                  <Input 
                    type="number" 
                    value={monthlyRevenue} 
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Burn Rate (£)</label>
                  <Input 
                    type="number" 
                    value={monthlyBurn} 
                    onChange={(e) => setMonthlyBurn(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Initial Capital (£)</label>
                  <Input 
                    type="number" 
                    value={initialCapital} 
                    onChange={(e) => setInitialCapital(Number(e.target.value))} 
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Cashflow</p>
                  <p className={`text-2xl font-bold mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    £{monthlyProfit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Runway (months)</p>
                  <p className="text-2xl font-bold mt-1">{runway > 999 ? "∞" : runway}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Viability</p>
                  <p className={`text-lg font-bold mt-1 ${viabilityColor}`}>{viabilityScore}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Break-Even Point</p>
                  <p className="font-semibold">{isPositive ? "Now" : `${breakEvenMonths} months`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Profit/Loss</p>
                  <p className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    £{monthlyProfit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capital Efficiency</p>
                  <p className="font-semibold">{((monthlyRevenue / initialCapital) * 100).toFixed(1)}% monthly</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-6">12-Month Projection</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="capital" stroke="#ffa536" name="Capital Remaining" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  );
}
