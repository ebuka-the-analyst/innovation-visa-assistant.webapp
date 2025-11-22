import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/AuthHeader";
import { useState } from "react";

export default function Tool() {
  const [input, setInput] = useState("");

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">RFE Defence Lab</h1>
          <p className="text-lg text-muted-foreground mb-8">Professional analysis and guidance</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Analysis Input</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Enter Information</label>
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Input data" className="mt-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <h3 className="font-semibold mb-4">Results</h3>
              <p className="text-muted-foreground">Enter data to see analysis</p>
            </Card>
          </div>

          <Card className="p-6 mt-6">
            <h3 className="font-semibold mb-4">Key Insights</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Comprehensive analysis</li>
              <li>✓ Real-time insights</li>
              <li>✓ Expert recommendations</li>
              <li>✓ Documentation ready</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
