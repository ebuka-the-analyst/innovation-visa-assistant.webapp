import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

const ITEMS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
  cat: i % 2 === 0 ? "Critical" : "High",
  pen: i % 2 === 0 ? "Rejection" : "RFE"
}));

export default function DOCVERIFICATION() {
  const [checks, setChecks] = useState<any>({});
  const total = ITEMS.length;
  const completed = Object.values(checks).filter(Boolean).length;
  const pct = (completed / total) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Doc Verification</h1>
            <p className="text-lg text-muted-foreground">Professional Compliance Framework</p>
          </div>
          <Card className="p-6 mb-6">
            <div className="flex justify-between mb-2">
              <span>Compliance</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div style={{ width: `${pct}%` }} className="bg-primary h-3 rounded-full transition-all" />
            </div>
          </Card>
          <div className="space-y-2">
            {ITEMS.map(item => (
              <Card key={item.id} className={`p-4 border-l-4 ${item.cat === "Critical" ? "border-l-red-500 bg-red-50" : "border-l-orange-500 bg-orange-50"}`}>
                <label className="flex gap-3">
                  <Checkbox checked={checks[item.id] || false} onCheckedChange={e => setChecks({ ...checks, [item.id]: !!e })} />
                  <div className="flex-1">
                    <span>{item.label}</span>
                    <p className="text-xs mt-1">{item.cat} - {item.pen}</p>
                  </div>
                </label>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
