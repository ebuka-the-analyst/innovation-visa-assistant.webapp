import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import FeatureNavigation from "@/components/FeatureNavigation";

export default function KPIDashboard() {
  const visaHealthScore = 87;
  const kpis = [
    { label: "Revenue Progress", value: "£180K", target: "£250K", status: "on-track", trend: "+12%" },
    { label: "Job Creation", value: "3 hires", target: "5 by year-end", status: "on-track", trend: "+1" },
    { label: "Customer Traction", value: "47 users", target: "100", status: "behind", trend: "-5%" },
    { label: "Product Innovation", value: "MVP + 3 features", target: "MVP + 5", status: "on-track", trend: "On schedule" }
  ];

  return (
    <div className="min-h-screen">
      <AuthHeader />
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <FeatureNavigation currentPage="questionnaire" />
          <div className="mb-12">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">REAL-TIME KPI TRACKING</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-3">Visa Compliance Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Monitor your business performance against visa commitments. Real-time KPI tracking ensures you stay aligned with endorser expectations and spot issues early.
            </p>
          </div>

          <div className="mb-8 p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Visa Health Score</p>
                <h2 className="text-5xl font-bold text-green-600">{visaHealthScore}/100</h2>
                <p className="text-sm text-muted-foreground mt-2">Excellent compliance trajectory</p>
              </div>
              <BarChart3 className="w-24 h-24 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{kpi.label}</h3>
                    {kpi.status === "on-track" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <p className="text-sm text-muted-foreground">Target: {kpi.target}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">{kpi.trend}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-8">
              <h3 className="font-semibold text-lg mb-6">Compliance Check Points</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Innovation Criteria Met</p>
                    <p className="text-sm text-green-800">Your technology demonstrates clear differentiation from competitors</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Viability Criteria Met</p>
                    <p className="text-sm text-green-800">Financial projections are realistic and market-validated</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Scalability - Trending Below Target</p>
                    <p className="text-sm text-amber-800">You need 2 more job commitments by Q4 2025 to stay on track. Consider expanding your team plan.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="metrics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics">
                <Card className="p-8">
                  <p className="text-muted-foreground">Connect your analytics, CRM, and payment platforms to auto-populate real metrics. Your business data becomes your evidence.</p>
                  <Button className="mt-4">Connect Data Sources</Button>
                </Card>
              </TabsContent>

              <TabsContent value="forecast">
                <Card className="p-8">
                  <p className="text-muted-foreground">AI-powered projections compare your trajectory against similar ventures. Early warnings if you're diverging from plan.</p>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <Card className="p-8">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Next Review: December 15, 2025</p>
                    <p className="text-sm text-muted-foreground">Days until job creation target review: 87 days</p>
                    <Button variant="outline" className="w-full">Set Reminder</Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
