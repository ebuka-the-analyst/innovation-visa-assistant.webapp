import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";

export default function InnovationValidation() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Innovation Validation</h1>
            <p className="text-lg text-muted-foreground">PhD-Level Strategic Analysis</p>
          </div>
          <Card className="p-8"><h2 className="text-2xl font-bold mb-4">Innovation Validation</h2><p className="text-muted-foreground mb-6">Premium tool with comprehensive analysis.</p><div className="grid md:grid-cols-3 gap-4 mb-6"><Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10"><h3 className="font-semibold">Analysis</h3></Card><Card className="p-4 bg-blue-50"><h3 className="font-semibold">Insights</h3></Card><Card className="p-4 bg-green-50"><h3 className="font-semibold">Expertise</h3></Card></div><Button className="w-full">Get Started</Button></Card>
        </div>
      </div>
    </>
  );
}
