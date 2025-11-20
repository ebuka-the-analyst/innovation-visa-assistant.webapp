import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import type { BusinessPlan } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: businessPlans, isLoading: plansLoading } = useQuery<BusinessPlan[]>({
    queryKey: ['/api/dashboard/plans'],
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Generating</Badge>;
      case 'paid':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <AuthHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Business Plans</h2>
            <p className="text-muted-foreground">Manage and track your UK Innovation Visa applications</p>
          </div>
          <Button 
            size="lg"
            onClick={() => setLocation("/questionnaire")}
            data-testid="button-create-plan"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businessPlans && businessPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessPlans.map((plan) => (
              <Card key={plan.id} className="hover-elevate" data-testid={`card-plan-${plan.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{plan.businessName}</CardTitle>
                    {getStatusBadge(plan.status)}
                  </div>
                  <CardDescription>{plan.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier:</span>
                      <span className="font-medium capitalize">{plan.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {plan.currentGenerationStage && plan.status === 'generating' && (
                      <div className="mt-3 p-2 bg-accent/20 rounded text-xs">
                        <p className="text-muted-foreground">{plan.currentGenerationStage}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {plan.status === 'completed' && plan.pdfUrl && (
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => window.open(plan.pdfUrl!, '_blank')}
                      data-testid={`button-download-${plan.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {plan.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setLocation(`/questionnaire?tier=${plan.tier}`)}
                      data-testid={`button-continue-${plan.id}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  )}
                  {plan.status === 'generating' && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setLocation(`/generation?plan_id=${plan.id}`)}
                      data-testid={`button-view-progress-${plan.id}`}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No business plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered business plan for your UK Innovation Visa application
            </p>
            <Button 
              size="lg"
              onClick={() => setLocation("/questionnaire")}
              data-testid="button-create-first-plan"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Plan
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
