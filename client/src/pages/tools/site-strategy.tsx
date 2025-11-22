import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function SITESTRATEGY() {
  const [sections, setSections] = useState({ a: "", b: "", c: "" });
  const [done, setDone] = useState(false);
  const complete = Object.values(sections).filter((s: string) => s.length > 50).length;
  const pct = (complete / 3) * 100;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Site Strategy</h1>
            <p className="text-lg text-muted-foreground">PhD-Level Strategic Planning</p>
          </div>
          <Card className="p-6 mb-6">
            <div className="flex justify-between mb-2">
              <span>Completion</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div style={{ width: `${pct}%` }} className="bg-primary h-2 rounded-full" />
            </div>
          </Card>
          {[{ k: "a", t: "Foundation" }, { k: "b", t: "Strategy" }, { k: "c", t: "Metrics" }].map(s => (
            <Card key={s.k} className="p-4 mb-3">
              <label className="font-semibold mb-2 block">{s.t}</label>
              <Textarea value={sections[s.k as keyof typeof sections]} onChange={e => setSections({ ...sections, [s.k]: e.target.value })} className="h-20" />
            </Card>
          ))}
          <Button onClick={() => setDone(!done)} className="w-full bg-primary">Export Plan</Button>
          {done && <Card className="p-4 mt-4 bg-green-50"><p className="text-green-700 font-semibold">✓ Plan Ready</p></Card>}
        </div>
      </div>
    </>
  );
}
