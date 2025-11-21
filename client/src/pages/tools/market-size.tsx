import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function MarketSize() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Professional Tool</h1>
          <p className="text-muted-foreground mt-2">UK-Innovation Visa Assistant Tool</p>
        </div>
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Tool Features</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ Professional analysis</li>
            <li>✓ Real-time updates</li>
            <li>✓ Comprehensive guidance</li>
            <li>✓ Export capabilities</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
