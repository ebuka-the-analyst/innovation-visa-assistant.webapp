import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";

export default function MarketAnalysis() {
  const [tam, setTam] = useState(1000000000);
  const [marketShare, setMarketShare] = useState(0.5);
  const [pricePerUnit, setPricePerUnit] = useState(100);

  const sam = tam * (marketShare / 100);
  const som = sam * 0.01;
  const yearOneRevenue = som * pricePerUnit;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Market Analysis Report</h1>
            <p className="text-lg text-muted-foreground">TAM/SAM/SOM market sizing analysis</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Inputs</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">TAM (£)</label>
                  <Input type="number" value={tam} onChange={(e) => setTam(Number(e.target.value))} className="mt-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Market Share (%)</label>
                  <Input type="number" value={marketShare} onChange={(e) => setMarketShare(Number(e.target.value))} className="mt-2" />
                </div>
                <div>
                  <label className="text-sm font-medium">Price Per Unit (£)</label>
                  <Input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} className="mt-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Market Sizing</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">TAM (Total)</p>
                  <p className="text-xl font-bold">£{tam.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SAM (Serviceable)</p>
                  <p className="text-xl font-bold">£{Math.round(sam).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SOM (Serviceable Obtainable)</p>
                  <p className="text-xl font-bold">£{Math.round(som).toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Year 1 Revenue Potential</p>
                  <p className="text-2xl font-bold text-primary">£{Math.round(yearOneRevenue).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Analysis Framework</h3>
            <div className="space-y-4 text-sm">
              <div><strong>TAM:</strong> Total market opportunity worldwide</div>
              <div><strong>SAM:</strong> Portion addressable by your solution</div>
              <div><strong>SOM:</strong> Realistically achievable with your strategy</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
