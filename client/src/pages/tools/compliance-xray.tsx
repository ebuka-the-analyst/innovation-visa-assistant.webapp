import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

const ITEMS = [
  { id: "1", name: "Business Registration", cat: "Legal", pen: "Critical" },
  { id: "2", name: "Tax Registration", cat: "Tax", pen: "High" },
  { id: "3", name: "Bank Account", cat: "Financial", pen: "High" },
  { id: "4", name: "IP Rights", cat: "IP", pen: "High" },
  { id: "5", name: "Evidence Pack", cat: "Documents", pen: "Critical" },
  { id: "6", name: "Market Research", cat: "Strategy", pen: "Medium" },
  { id: "7", name: "Financial Statements", cat: "Financial", pen: "Critical" },
  { id: "8", name: "Team Structure", cat: "Organization", pen: "Medium" }
];

export default function COMPLIANCEXRAY() {
  const [checks, setChecks] = useState<any>({});
  const done = Object.keys(checks).filter(k => checks[k]).length;
  const pct = (done / ITEMS.length) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Compliance Xray</h1>
            <p className="text-muted-foreground">Track compliance requirements step by step</p>
          </div>
          
          <Card className="p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Completion</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div style={{ width: `${pct}%` }} className="bg-primary h-3 rounded-full transition-all" />
            </div>
          </Card>

          <div className="space-y-2">
            {ITEMS.map(i => (
              <Card key={i.id} className="p-3">
                <label className="flex gap-3 cursor-pointer">
                  <Checkbox checked={checks[i.id] || false} onCheckedChange={() => setChecks({ ...checks, [i.id]: !checks[i.id] })} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.cat} • {i.pen}</p>
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
