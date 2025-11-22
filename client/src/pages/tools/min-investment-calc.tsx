import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";
import { useState } from "react";
import { Download } from "lucide-react";

export default function MININVESTMENTCALC() {
  const [generated, setGenerated] = useState(false);

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-3xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Min Investment Calc</h1>
            <p className="text-muted-foreground">Generate professional reports</p>
          </div>
          
          {!generated ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Ready to generate your comprehensive report</p>
              <Button onClick={() => setGenerated(true)} size="lg" className="bg-primary">Generate Report</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {["Executive Summary", "Key Findings", "Recommendations", "Supporting Data"].map((section, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-bold mb-2">{section}</h3>
                  <p className="text-sm text-muted-foreground">Professional {section.toLowerCase()} content</p>
                </Card>
              ))}
              <Button className="w-full gap-2" size="lg"><Download className="w-4 h-4" />Download PDF</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
