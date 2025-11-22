import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

const SECTIONS = [
  { id: "1", title: "Executive Summary", hint: "2-3 sentences overview" },
  { id: "2", title: "Strategic Goals", hint: "3-5 key objectives" },
  { id: "3", title: "Key Activities", hint: "Top priorities next 3 months" },
  { id: "4", title: "Success Metrics", hint: "How will you measure success" }
];

export default function ADVISORYBOARDBUILDER() {
  const [content, setContent] = useState<any>({});
  const filled = Object.values(content).filter((v: any) => v?.length > 20).length;

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Advisory Board Builder</h1>
            <p className="text-muted-foreground">Build comprehensive strategy document</p>
          </div>
          
          <Card className="p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-bold">Sections Completed</span>
              <span>{filled}/{SECTIONS.length}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div style={{ width: `${(filled / SECTIONS.length) * 100}%` }} className="bg-primary h-2 rounded-full" />
            </div>
          </Card>

          {SECTIONS.map(s => (
            <Card key={s.id} className="p-4 mb-3">
              <label className="block">
                <span className="font-semibold text-sm mb-1 block">{s.title}</span>
                <span className="text-xs text-muted-foreground mb-2 block">{s.hint}</span>
                <Textarea value={content[s.id] || ""} onChange={e => setContent({ ...content, [s.id]: e.target.value })} placeholder="Enter text..." className="min-h-24" />
              </label>
            </Card>
          ))}
          
          <Button className="w-full bg-primary">Export Strategy</Button>
        </div>
      </div>
    </>
  );
}
