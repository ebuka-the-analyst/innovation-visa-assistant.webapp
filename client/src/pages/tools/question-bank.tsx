import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";

export default function QUESTIONBANK() {
  const [generated, setGenerated] = useState(false);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Question Bank</h1>
            <p className="text-lg text-muted-foreground">Report Generation</p>
          </div>
          <Button onClick={() => setGenerated(!generated)} className="w-full mb-6 bg-primary">Generate Report</Button>
          {generated ? (
            <div className="space-y-4">
              {["Executive Summary", "Analysis"].map((s, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold mb-2">{s}</h3>
                  <p className="text-sm text-muted-foreground">Content</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Click to generate report</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
