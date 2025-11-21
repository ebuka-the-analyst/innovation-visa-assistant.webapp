import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Application-requirements() {
  const [data, setData] = useState("");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Application Requirements Checker</h1>
          <p className="text-muted-foreground mt-2">Verify all required documents</p>
        </div>

        <Card className="p-6 space-y-6">
          <h2 className="font-bold text-lg">Tool Information</h2>
          <div>
            <Label htmlFor="input">Enter your details</Label>
            <Textarea
              id="input"
              placeholder="Enter information..."
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-2 min-h-32"
            />
          </div>
          <Button className="w-full">Generate Report</Button>
        </Card>

        <Card className="p-6 bg-blue-50 dark:bg-blue-950/30">
          <h2 className="font-bold mb-4">Result</h2>
          <p className="text-sm text-muted-foreground">
            Enter your details above and click Generate Report to create your personalized output.
          </p>
        </Card>
      </div>
    </div>
  );
}
