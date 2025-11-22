import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/AuthHeader";
import { ToolNavigation } from "@/components/ToolNavigation";

export default function DUEDILIGENCE() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <ToolNavigation />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Due Diligence</h1>
            <p className="text-lg text-muted-foreground">Advanced Analysis</p>
          </div>
          <Card className="p-6"><h2 className="text-2xl font-bold">Welcome to Due Diligence</h2><p className="text-muted-foreground mt-4">Premium tool for comprehensive analysis</p></Card>
        </div>
      </div>
    </>
  );
}
