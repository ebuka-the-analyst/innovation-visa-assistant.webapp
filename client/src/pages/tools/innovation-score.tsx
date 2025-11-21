import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InnovationScore() {
  const [scores, setScores] = useState({
    originality: 0,
    market_need: 0,
    technology: 0,
    competitive_advantage: 0,
    ip_protection: 0,
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const average = total / 5;
  const maxScore = 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Innovation Score Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Assess your innovation score against Innovator Founder Visa criteria (0-20 points available)
          </p>
        </div>

        {/* Innovation Dimensions */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="originality">
              1. Originality & Genuineness (0-20)
              <span className="float-right font-bold">{scores.originality}/20</span>
            </Label>
            <Input
              id="originality"
              type="range"
              min="0"
              max="20"
              value={scores.originality}
              onChange={(e) => setScores({...scores, originality: parseInt(e.target.value)})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score high: First-mover, novel technology, unique approach. Score low: Me-too product
            </p>
          </div>

          <div>
            <Label htmlFor="market-need">
              2. Market Need Validation (0-20)
              <span className="float-right font-bold">{scores.market_need}/20</span>
            </Label>
            <Input
              id="market-need"
              type="range"
              min="0"
              max="20"
              value={scores.market_need}
              onChange={(e) => setScores({...scores, market_need: parseInt(e.target.value)})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score high: Customer interviews, surveys, existing traction. Score low: Unvalidated hypothesis
            </p>
          </div>

          <div>
            <Label htmlFor="technology">
              3. Technology & Feasibility (0-20)
              <span className="float-right font-bold">{scores.technology}/20</span>
            </Label>
            <Input
              id="technology"
              type="range"
              min="0"
              max="20"
              value={scores.technology}
              onChange={(e) => setScores({...scores, technology: parseInt(e.target.value)})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score high: Robust, scalable tech; AI/ML; cutting-edge. Score low: Simple off-the-shelf solution
            </p>
          </div>

          <div>
            <Label htmlFor="competitive-advantage">
              4. Competitive Advantage (0-20)
              <span className="float-right font-bold">{scores.competitive_advantage}/20</span>
            </Label>
            <Input
              id="competitive-advantage"
              type="range"
              min="0"
              max="20"
              value={scores.competitive_advantage}
              onChange={(e) => setScores({...scores, competitive_advantage: parseInt(e.target.value)})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score high: Sustainable moat (IP, network effects, cost). Score low: Easily copied or matched
            </p>
          </div>

          <div>
            <Label htmlFor="ip-protection">
              5. IP Protection & Strategy (0-20)
              <span className="float-right font-bold">{scores.ip_protection}/20</span>
            </Label>
            <Input
              id="ip-protection"
              type="range"
              min="0"
              max="20"
              value={scores.ip_protection}
              onChange={(e) => setScores({...scores, ip_protection: parseInt(e.target.value)})}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score high: Patents, trade secrets, copyright; IP roadmap. Score low: No IP protection
            </p>
          </div>
        </div>

        {/* Innovation Score Card */}
        <Card className={`p-6 ${average >= 16 ? 'bg-green-50 dark:bg-green-950/30' : average >= 12 ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <h2 className="font-bold text-lg mb-4">Innovation Score Assessment</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Overall Score:</span>
              <span className="font-bold text-lg">{average.toFixed(1)}/20</span>
            </div>
            <div className="flex justify-between">
              <span>Total Points:</span>
              <span className="font-bold">{total}/100</span>
            </div>
            <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded">
              {average >= 16 ? (
                <p className="font-semibold text-green-600">✓ Strong Innovation Score - Meets endorser expectations</p>
              ) : average >= 12 ? (
                <p className="font-semibold text-yellow-600">⚠ Moderate Innovation Score - Needs strengthening</p>
              ) : (
                <p className="font-semibold text-red-600">✗ Low Innovation Score - Significant concerns</p>
              )}
            </div>
          </div>
        </Card>

        {/* Improvement Suggestions */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">How to Improve Your Innovation Score</h2>
          <div className="space-y-3 text-sm">
            {scores.originality < 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                <p className="font-semibold">Improve Originality:</p>
                <p>Strengthen your unique value prop, document first-mover advantages, showcase novel IP</p>
              </div>
            )}
            {scores.market_need < 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                <p className="font-semibold">Validate Market Need:</p>
                <p>Conduct customer interviews, gather testimonials, show traction metrics, validate TAM/SAM</p>
              </div>
            )}
            {scores.technology < 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                <p className="font-semibold">Strengthen Technology:</p>
                <p>Document technical architecture, highlight R&D, plan for AI/ML integration, show scalability</p>
              </div>
            )}
            {scores.competitive_advantage < 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                <p className="font-semibold">Build Competitive Moat:</p>
                <p>Create defensibility through network effects, build switching costs, expand IP portfolio</p>
              </div>
            )}
            {scores.ip_protection < 15 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                <p className="font-semibold">Develop IP Strategy:</p>
                <p>File patents for key inventions, protect trade secrets, document IP ownership, show roadmap</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
