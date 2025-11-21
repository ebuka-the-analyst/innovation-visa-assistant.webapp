import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function IncomeCalculator() {
  const [initialCapital, setInitialCapital] = useState(50000);
  const [monthlyBurn, setMonthlyBurn] = useState(5000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const netMonthly = monthlyRevenue - monthlyBurn;
  const runway = monthlyBurn > 0 ? Math.floor(initialCapital / monthlyBurn) : 999;
  const breakEvenMonths = monthlyBurn > 0 && monthlyRevenue > 0 ? Math.ceil(initialCapital / (monthlyRevenue - monthlyBurn)) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Income & Viability Analyzer</h1>
          <p className="text-muted-foreground mt-2">
            Model your startup runway, profitability, and business sustainability
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="capital">Initial Capital/Funding (£)</Label>
            <Input
              id="capital"
              type="number"
              placeholder="50000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseInt(e.target.value) || 0)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="burn">Monthly Burn Rate/Operating Cost (£)</Label>
            <Input
              id="burn"
              type="number"
              placeholder="5000"
              value={monthlyBurn}
              onChange={(e) => setMonthlyBurn(parseInt(e.target.value) || 0)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Total monthly expenses including salaries, rent, etc.</p>
          </div>

          <div>
            <Label htmlFor="revenue">Projected Monthly Revenue (£)</Label>
            <Input
              id="revenue"
              type="number"
              placeholder="0"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(parseInt(e.target.value) || 0)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Expected monthly income once operations begin</p>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Monthly Cashflow</p>
            <p className={`text-2xl font-bold mt-2 ${netMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              £{netMonthly.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Revenue - Burn Rate</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Runway (months)</p>
            <p className="text-2xl font-bold mt-2">{runway}</p>
            <p className="text-xs text-muted-foreground mt-1">Months until capital depleted</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Break-Even Point</p>
            <p className="text-2xl font-bold mt-2">
              {breakEvenMonths && monthlyRevenue > monthlyBurn ? `${breakEvenMonths}m` : monthlyRevenue <= monthlyBurn ? 'Never' : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Months to profitability</p>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Financial Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting capital:</span>
              <span className="font-bold">£{initialCapital.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly expenses:</span>
              <span className="font-bold">£{monthlyBurn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly revenue:</span>
              <span className="font-bold">£{monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Net monthly:</span>
              <span className={netMonthly >= 0 ? 'text-green-600' : 'text-red-600'}>
                {netMonthly >= 0 ? '+' : '-'}£{Math.abs(netMonthly).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Viability Assessment */}
        <Card className={`p-6 ${runway >= 24 && monthlyRevenue > monthlyBurn ? 'bg-green-50 dark:bg-green-950/30' : runway >= 12 ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <h2 className="font-bold mb-4">Viability Assessment</h2>
          <div className="space-y-2 text-sm">
            {runway >= 24 && monthlyRevenue > monthlyBurn ? (
              <>
                <p className="font-semibold text-green-600">✓ Strong viability indicators</p>
                <p className="text-muted-foreground">Your business has {runway} months runway and positive monthly cashflow</p>
              </>
            ) : runway >= 12 ? (
              <>
                <p className="font-semibold text-yellow-600">⚠ Moderate viability</p>
                <p className="text-muted-foreground">You have {runway} months runway but need to reach revenue targets soon</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-red-600">✗ Viability concerns</p>
                <p className="text-muted-foreground">With only {runway} months runway, you need immediate revenue and/or cost reduction</p>
              </>
            )}
          </div>
        </Card>

        {/* Endorser Guidance */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <p className="font-semibold mb-2">What Endorsers Look For:</p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Realistic revenue projections backed by market research</li>
            <li>Clear path to profitability within 24-36 months</li>
            <li>Cost structure appropriate to business stage</li>
            <li>Evidence of customer acquisition strategy</li>
            <li>Contingency plans for revenue shortfalls</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
