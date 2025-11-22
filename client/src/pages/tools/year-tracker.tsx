import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/AuthHeader";

export default function Year Progress Tracker() {
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Year Progress Tracker</h1>
            <p className="text-lg text-muted-foreground">Track yearly progress</p>
          </div>

          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Get Started</h2>
              <p className="text-muted-foreground mb-4">
                This tool helps you with comprehensive analysis and planning for your UK Innovation Visa application.
              </p>
              <Button className="w-full" data-testid="button-start-tool">
                Begin Analysis
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Professional analysis and guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Real-time insights and recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Comprehensive documentation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>Export and sharing capabilities</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
