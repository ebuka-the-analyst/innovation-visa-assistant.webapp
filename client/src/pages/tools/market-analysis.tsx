import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MarketAnalysis() {
  const [marketData, setMarketData] = useState({
    market_size: 0,
    target_segment: "",
    growth_rate: 0,
    competitors: "",
    competitive_advantage: "",
    market_timing: "",
  });

  const tam = marketData.market_size;
  const targetPercentage = 0.5; // Assume targeting 0.5% market
  const sam = tam * (targetPercentage / 100);
  const som = sam * 0.1; // Serviceable Obtainable Market

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Market Analysis Report Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive market analysis for your Innovation Visa application
          </p>
        </div>

        {/* Market Sizing */}
        <Card className="p-6 space-y-6">
          <h2 className="font-bold text-lg">Market Sizing (TAM/SAM/SOM)</h2>
          
          <div>
            <Label htmlFor="market-size">Total Addressable Market (TAM) - £ Global market size</Label>
            <Input
              id="market-size"
              type="number"
              placeholder="e.g., 50000000 for £50M"
              value={marketData.market_size}
              onChange={(e) => setMarketData({...marketData, market_size: parseInt(e.target.value) || 0})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Total global market opportunity</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span>TAM (Total):</span>
              <span className="font-bold">£{tam.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SAM (Serviceable - 0.5%):</span>
              <span className="font-bold">£{sam.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SOM (Obtainable - 10%):</span>
              <span className="font-bold">£{som.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Market Characteristics */}
        <Card className="p-6 space-y-6">
          <h2 className="font-bold text-lg">Market Characteristics</h2>

          <div>
            <Label htmlFor="target-segment">Target Customer Segment</Label>
            <Textarea
              id="target-segment"
              placeholder="e.g., Mid-market B2B SaaS companies, enterprise healthcare providers..."
              value={marketData.target_segment}
              onChange={(e) => setMarketData({...marketData, target_segment: e.target.value})}
              className="mt-2 min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="growth-rate">Market Growth Rate (%)</Label>
            <Input
              id="growth-rate"
              type="number"
              placeholder="e.g., 25 for 25% CAGR"
              value={marketData.growth_rate}
              onChange={(e) => setMarketData({...marketData, growth_rate: parseInt(e.target.value) || 0})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Compound Annual Growth Rate (CAGR)</p>
          </div>

          <div>
            <Label htmlFor="competitors">Key Competitors</Label>
            <Textarea
              id="competitors"
              placeholder="List main competitors and their market share..."
              value={marketData.competitors}
              onChange={(e) => setMarketData({...marketData, competitors: e.target.value})}
              className="mt-2 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="competitive-advantage">Your Competitive Advantage</Label>
            <Textarea
              id="competitive-advantage"
              placeholder="What differentiates your solution? Technology, team, go-to-market, IP..."
              value={marketData.competitive_advantage}
              onChange={(e) => setMarketData({...marketData, competitive_advantage: e.target.value})}
              className="mt-2 min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="market-timing">Market Timing & Trends</Label>
            <Textarea
              id="market-timing"
              placeholder="Why now? What macro trends, regulatory changes, or technology shifts support your entry?"
              value={marketData.market_timing}
              onChange={(e) => setMarketData({...marketData, market_timing: e.target.value})}
              className="mt-2 min-h-20"
            />
          </div>
        </Card>

        {/* Analysis Output */}
        <Card className="p-6 bg-green-50 dark:bg-green-950/30 space-y-4">
          <h2 className="font-bold text-lg">Market Analysis Summary</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Market Opportunity:</strong> The {marketData.target_segment || "[Target Segment]"} represents a £{tam.toLocaleString()} TAM growing at {marketData.growth_rate}% annually.
            </p>
            <p>
              <strong>Competitive Landscape:</strong> {marketData.competitors || "[Competitors not specified]"}
            </p>
            <p>
              <strong>Differentiation:</strong> {marketData.competitive_advantage || "[Competitive advantage not specified]"}
            </p>
            <p>
              <strong>Strategic Timing:</strong> {marketData.market_timing || "[Market timing not specified]"}
            </p>
          </div>
        </Card>

        {/* Endorser Perspective */}
        <Card className="p-6">
          <p className="font-semibold mb-2">What Endorsers Look For:</p>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Clear market validation (not just theoretical)</li>
            <li>Realistic market sizing with data sources</li>
            <li>Evidence of market need (customer interviews, surveys)</li>
            <li>Strong understanding of competitive landscape</li>
            <li>Defensible competitive advantage</li>
            <li>Supportive macro trends and market timing</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
