import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Download, Clock, CheckCircle, AlertCircle, TrendingUp, Target, Zap, Award } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import ChatBot from "@/components/ChatBot";
import type { BusinessPlan } from "@shared/schema";
import { format } from "date-fns";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Calculate approval probability based on plan completeness and tier
function calculateApprovalProbability(plan: BusinessPlan): number {
  if (plan.status !== 'completed') return 0;
  
  let score = 0;
  
  // Base score by tier
  if (plan.tier === 'enterprise') score += 40;
  else if (plan.tier === 'premium') score += 30;
  else score += 20;
  
  // Completeness checks (each worth points)
  if (plan.founderEducation && plan.founderEducation.length > 50) score += 5;
  if (plan.founderWorkHistory && plan.founderWorkHistory.length > 100) score += 5;
  if (plan.customerInterviews && plan.customerInterviews.length > 100) score += 10;
  if (plan.lettersOfIntent && plan.lettersOfIntent.length > 50) score += 10;
  if (plan.patentStatus && plan.patentStatus.length > 20) score += 5;
  if (plan.funding >= 50000) score += 10;
  if (plan.lifetimeValue > 0 && plan.customerAcquisitionCost > 0) {
    const ratio = plan.lifetimeValue / plan.customerAcquisitionCost;
    if (ratio >= 3) score += 10;
  }
  if (plan.complianceBudget >= 50000) score += 5;
  if (plan.jobCreation >= 5) score += 5;
  
  return Math.min(95, Math.max(65, score)); // Cap between 65-95%
}

// Calculate completeness percentage
function calculateCompleteness(plan: BusinessPlan): number {
  const fields = [
    plan.businessName,
    plan.industry,
    plan.problem,
    plan.uniqueness,
    plan.techStack,
    plan.dataArchitecture,
    plan.aiMethodology,
    plan.complianceDesign,
    plan.patentStatus,
    plan.founderEducation,
    plan.founderWorkHistory,
    plan.founderAchievements,
    plan.relevantProjects,
    plan.monthlyProjections,
    plan.fundingSources,
    plan.detailedCosts,
    plan.revenue,
    plan.competitors,
    plan.competitiveDifferentiation,
    plan.customerInterviews,
    plan.willingnessToPay,
    plan.marketSize,
    plan.regulatoryRequirements,
    plan.complianceTimeline,
    plan.hiringPlan,
    plan.specificRegions,
    plan.expansion,
    plan.vision,
    plan.targetEndorser,
    plan.contactPointsStrategy,
    plan.experience,
  ];
  
  const filledFields = fields.filter(f => f && f.toString().length > 10).length;
  return Math.round((filledFields / fields.length) * 100);
}

// Calculate Innovation Visa Radar data
function calculateRadarData(plan: BusinessPlan) {
  // Innovation score (0-100)
  let innovationScore = 0;
  if (plan.uniqueness && plan.uniqueness.length > 100) innovationScore += 25;
  if (plan.techStack && plan.techStack.length > 50) innovationScore += 20;
  if (plan.aiMethodology && plan.aiMethodology.length > 100) innovationScore += 20;
  if (plan.patentStatus && plan.patentStatus.includes('filed')) innovationScore += 20;
  if (plan.competitiveDifferentiation && plan.competitiveDifferentiation.length > 100) innovationScore += 15;
  
  // Viability score (0-100)
  let viabilityScore = 0;
  if (plan.funding >= 50000) viabilityScore += 20;
  if (plan.revenue && plan.revenue.length > 100) viabilityScore += 20;
  if (plan.customerInterviews && plan.customerInterviews.length > 100) viabilityScore += 20;
  if (plan.lifetimeValue > 0 && plan.customerAcquisitionCost > 0) {
    const ratio = plan.lifetimeValue / plan.customerAcquisitionCost;
    if (ratio >= 3) viabilityScore += 20;
  }
  if (plan.founderWorkHistory && plan.founderWorkHistory.length > 100) viabilityScore += 20;
  
  // Scalability score (0-100)
  let scalabilityScore = 0;
  if (plan.jobCreation >= 5) scalabilityScore += 25;
  if (plan.hiringPlan && plan.hiringPlan.length > 100) scalabilityScore += 20;
  if (plan.expansion && plan.expansion.length > 100) scalabilityScore += 20;
  if (plan.specificRegions && plan.specificRegions.length > 30) scalabilityScore += 15;
  if (plan.vision && plan.vision.length > 100) scalabilityScore += 20;
  
  return [
    { criterion: 'Innovation', score: innovationScore, fullMark: 100 },
    { criterion: 'Viability', score: viabilityScore, fullMark: 100 },
    { criterion: 'Scalability', score: scalabilityScore, fullMark: 100 },
  ];
}

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

  const completedPlan = businessPlans?.find(p => p.status === 'completed');
  const radarData = completedPlan ? calculateRadarData(completedPlan) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <AuthHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Track your UK Innovation Visa applications</p>
          </div>
          <Button 
            size="lg"
            onClick={() => setLocation("/pricing")}
            data-testid="button-create-plan"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Plan
          </Button>
        </div>

        {plansLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : businessPlans && businessPlans.length > 0 ? (
          <div className="space-y-8">
            {/* Insights Cards - Only show if there's a completed plan */}
            {completedPlan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card data-testid="card-insight-approval">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approval Probability</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-3">
                      {calculateApprovalProbability(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on {completedPlan.tier} tier completeness
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-completeness">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completeness Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {calculateCompleteness(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      All critical fields answered
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-time-saved">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">
                      {completedPlan.tier === 'enterprise' ? '120+' : completedPlan.tier === 'premium' ? '80+' : '40+'} hrs
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      vs traditional consultant
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Innovation Visa Radar Chart - Only show if there's a completed plan */}
            {completedPlan && radarData && (
              <Card data-testid="card-visa-radar">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Innovation Visa Strength Indicator</CardTitle>
                  </div>
                  <CardDescription>
                    Your business plan performance across the three core UK Innovation Visa criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="criterion" 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    {radarData.map((item) => (
                      <div key={item.criterion} className="space-y-1">
                        <p className="text-sm font-medium">{item.criterion}</p>
                        <p className="text-2xl font-bold text-primary">{item.score}/100</p>
                        <p className="text-xs text-muted-foreground">
                          {item.score >= 80 ? 'Excellent' : item.score >= 60 ? 'Good' : item.score >= 40 ? 'Fair' : 'Needs Work'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Plans List */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Business Plans</h3>
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
                        <>
                          <Button 
                            variant="default" 
                            className="flex-1"
                            onClick={() => window.open(plan.pdfUrl!, '_blank')}
                            data-testid={`button-download-${plan.id}`}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              localStorage.setItem('lastPlanId', plan.id);
                              setLocation(`/diagnostics?planId=${plan.id}`);
                            }}
                            data-testid={`button-diagnostics-${plan.id}`}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Diagnostics
                          </Button>
                        </>
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
            </div>
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
              onClick={() => setLocation("/pricing")}
              data-testid="button-create-first-plan"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Plan
            </Button>
          </Card>
        )}
      </main>
      
      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  );
}
