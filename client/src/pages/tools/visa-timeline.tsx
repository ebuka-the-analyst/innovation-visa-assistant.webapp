import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function VISATIMELINE() {
  const [items, setItems] = useState({ i1: false, i2: true, i3: false, i4: true });
  const completed = Object.values(items).filter(Boolean).length;
  const pct = (completed / 4) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Visa Timeline</h1>
            <p className="text-lg text-muted-foreground">Real-Time Tracking & Performance</p>
          </div>
          <Card className="p-6 mb-6">
            <div className="w-full bg-gray-200 h-4 rounded-full">
              <div style={{ width: `${pct}%` }} className="bg-primary h-4 rounded-full transition-all" />
            </div>
          </Card>
          <div className="space-y-2">
            {Object.entries(items).map(([k, v]) => (
              <label key={k} className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer">
                <Checkbox checked={v} onCheckedChange={e => setItems({ ...items, [k]: !!e })} />
                <span>Item {k}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
