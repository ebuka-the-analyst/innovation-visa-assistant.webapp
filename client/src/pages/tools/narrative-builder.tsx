import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function NARRATIVEBUILDER() {
  const [data, setData] = useState({ f1: "", f2: "", f3: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-2xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Narrative Builder</h1>
            <p className="text-muted-foreground">Collect and organize information</p>
          </div>
          
          {!submitted ? (
            <div>
              <Card className="p-6 mb-4">
                <label className="block mb-4">
                  <p className="font-semibold mb-2">Field 1</p>
                  <Input value={data.f1} onChange={e => setData({ ...data, f1: e.target.value })} placeholder="Enter information" />
                </label>
                <label className="block mb-4">
                  <p className="font-semibold mb-2">Field 2</p>
                  <Input value={data.f2} onChange={e => setData({ ...data, f2: e.target.value })} placeholder="Enter information" />
                </label>
                <label>
                  <p className="font-semibold mb-2">Notes</p>
                  <Textarea value={data.f3} onChange={e => setData({ ...data, f3: e.target.value })} placeholder="Additional notes" className="h-20" />
                </label>
              </Card>
              <Button onClick={() => setSubmitted(true)} className="w-full bg-primary">Submit & Save</Button>
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-green-700 font-semibold mb-3">✓ Information saved successfully</p>
              <Button onClick={() => setSubmitted(false)} className="w-full">Add More</Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
