import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Download, Clock, CheckCircle, AlertCircle, TrendingUp, Target, Zap, Award, Eye, EyeOff, RefreshCw, MessageCircle, Calculator, BookOpen, Users, ArrowRight, Sparkles, Settings, Shield, Gift, Crown, Trash2, Calendar, Building2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import ChatBot from "@/components/ChatBot";
import { MyWorkSection } from "@/components/MyWorkSection";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import type { BusinessPlan } from "@shared/schema";
import { format } from "date-fns";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState, useEffect } from "react";

// Local storage key for hidden demo plans
const HIDDEN_DEMO_PLANS_KEY = "hiddenDemoPlans";

// Helper to manage hidden demo plans
function useHiddenDemoPlans() {
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_DEMO_PLANS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const hidePlan = (planId: string) => {
    const newHidden = [...hiddenIds, planId];
    setHiddenIds(newHidden);
    localStorage.setItem(HIDDEN_DEMO_PLANS_KEY, JSON.stringify(newHidden));
  };

  const showPlan = (planId: string) => {
    const newHidden = hiddenIds.filter(id => id !== planId);
    setHiddenIds(newHidden);
    localStorage.setItem(HIDDEN_DEMO_PLANS_KEY, JSON.stringify(newHidden));
  };

  const showAllPlans = () => {
    setHiddenIds([]);
    localStorage.removeItem(HIDDEN_DEMO_PLANS_KEY);
  };

  return { hiddenIds, hidePlan, showPlan, showAllPlans };
}

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

// Calculate Innovator Founder Visa Radar data
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
  const { hiddenIds, hidePlan, showPlan, showAllPlans } = useHiddenDemoPlans();
  const [redirecting, setRedirecting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/business-plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Delete failed");
      }
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/plans"] });
      toast({ title: "Business plan deleted successfully" });
      setSelectedPlanId(null);
      setPlanToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      setPlanToDelete(null);
    },
  });

  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = useQuery<{ 
    id: string; 
    email: string; 
    displayName?: string; 
    subscriptionTier?: string;
    subscriptionStatus?: string;
    isEmailVerified?: boolean;
  }>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 30000,
  });

  const { data: businessPlans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useQuery<BusinessPlan[]>({
    queryKey: ['/api/dashboard/plans'],
    enabled: !!user,
    staleTime: 30000,
  });

  // Fetch user's redeemed promo codes
  const { data: redemptionsData } = useQuery<{
    redemptions: Array<{
      id: string;
      promoCodeId: string;
      appliedAt: string;
      createdAt: string;
      promoCode: {
        code: string;
        name: string;
        description?: string;
        grantsTier?: string;
        grantsCredits?: number;
        discountType?: string;
        discountValue?: number;
      } | null;
    }>;
  }>({
    queryKey: ['/api/promos/my-redemptions'],
    enabled: !!user,
    staleTime: 60000,
  });

  // Handle redirect to login when not authenticated
  useEffect(() => {
    if (!userLoading && !user && !redirecting) {
      setRedirecting(true);
      setLocation("/login");
    }
  }, [userLoading, user, redirecting, setLocation]);


  // Filter out hidden demo plans
  const displayPlans = businessPlans?.filter(plan => {
    if (plan.isDemoData && hiddenIds.includes(plan.id)) {
      return false;
    }
    return true;
  });

  // Count demo plans and hidden demo plans
  const demoPlansCount = businessPlans?.filter(p => p.isDemoData).length || 0;
  const hiddenDemoPlansCount = businessPlans?.filter(p => p.isDemoData && hiddenIds.includes(p.id)).length || 0;
  const hasUserPlans = businessPlans?.some(p => !p.isDemoData) || false;

  // Show loading state
  if (userLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{redirecting ? 'Redirecting to login...' : 'Loading your dashboard...'}</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (userError || (!user && !userLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Please log in again to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/login")} data-testid="button-login-redirect">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Generating</Badge>;
      case 'paid':
        return <Badge className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-100"><Clock className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const completedPlan = displayPlans?.find(p => p.status === 'completed');
  const radarData = completedPlan ? calculateRadarData(completedPlan) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">

      {/* Demo Plans Info Banner */}
      {demoPlansCount > 0 && !hasUserPlans && (
        <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border-b border-primary/20 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Demo Plans Available:</span> {demoPlansCount} sample business plan{demoPlansCount > 1 ? 's' : ''} showing what 100% completion looks like. Create your own plan to get started!
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="responsive-container py-8">
        {/* Email Verification Banner - show if user hasn't verified email */}
        {user && !user.isEmailVerified && user.email && (
          <EmailVerificationBanner 
            email={user.email} 
            onDismiss={() => {}} 
          />
        )}

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
            </h2>
            <p className="text-sm text-muted-foreground">Track your UK Innovator Founder Visa applications</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {hiddenDemoPlansCount > 0 && (
              <Button
                variant="outline"
                onClick={showAllPlans}
                data-testid="button-show-hidden-demos"
              >
                <Eye className="h-4 w-4 mr-2" />
                Show {hiddenDemoPlansCount} Hidden Demo Plan{hiddenDemoPlansCount > 1 ? 's' : ''}
              </Button>
            )}
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                // Users with unlocked tiers go directly to questionnaire
                const tier = user?.subscriptionTier;
                const paidTiers = ['basic', 'premium', 'enterprise', 'ultimate'];
                if (tier && paidTiers.includes(tier)) {
                  setLocation(`/questionnaire?tier=${tier}`);
                } else {
                  setLocation("/pricing");
                }
              }}
              data-testid="button-create-plan"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {plansLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
        ) : plansError ? (
          <Card className="text-center p-8 md:p-12">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load plans</h3>
            <p className="text-muted-foreground mb-6">
              There was an error loading your business plans. Please try again.
            </p>
            <Button onClick={() => refetchPlans()} data-testid="button-retry-plans">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </Card>
        ) : displayPlans && displayPlans.length > 0 ? (
          <div className="space-y-6 md:space-y-8">
            {/* Insights Cards - Only show if there's a completed plan */}
            {completedPlan && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card data-testid="card-insight-approval">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Approval Probability</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl font-bold text-chart-3">
                      {calculateApprovalProbability(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on {completedPlan.tier} tier
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-completeness">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Completeness Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl font-bold text-primary">
                      {calculateCompleteness(completedPlan)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All critical fields answered
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-insight-time-saved">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
                    <CardTitle className="text-xs font-medium">Time Saved</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl font-bold text-orange-500">
                      {completedPlan.tier === 'enterprise' ? '120+' : completedPlan.tier === 'premium' ? '80+' : '40+'} hrs
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs traditional consultant
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Innovator Founder Visa Radar Chart - Only show if there's a completed plan */}
            {completedPlan && radarData && (
              <Card data-testid="card-visa-radar">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Innovator Founder Visa Strength Indicator</CardTitle>
                  </div>
                  <CardDescription>
                    Your business plan performance across the three core UK Innovator Founder Visa criteria
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
                        <p className="text-lg font-bold text-primary">{item.score}/100</p>
                        <p className="text-xs text-muted-foreground">
                          {item.score >= 80 ? 'Excellent' : item.score >= 60 ? 'Good' : item.score >= 40 ? 'Fair' : 'Needs Work'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Panel */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Quick Actions</CardTitle>
                </div>
                <CardDescription>Jump to key features to strengthen your visa application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover-elevate"
                    onClick={() => setLocation('/tools-hub')}
                    data-testid="button-quick-tools"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">109 Tools</span>
                    <span className="text-xs text-muted-foreground">Access All</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover-elevate"
                    onClick={() => setLocation('/ai-assistant')}
                    data-testid="button-quick-assistant"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">AI Assistant</span>
                    <span className="text-xs text-muted-foreground">Ask Questions</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover-elevate"
                    onClick={() => setLocation('/template-library')}
                    data-testid="button-quick-templates"
                  >
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">Templates</span>
                    <span className="text-xs text-muted-foreground">60+ Premium</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover-elevate"
                    onClick={() => setLocation('/progress')}
                    data-testid="button-quick-progress"
                  >
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-xs text-muted-foreground">Track Journey</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Redeemed Promo Codes Section */}
            {redemptionsData?.redemptions && redemptionsData.redemptions.length > 0 && (
              <Card data-testid="card-redeemed-promos">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <CardTitle>Your Redeemed Codes</CardTitle>
                  </div>
                  <CardDescription>Promo codes you've applied to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {redemptionsData.redemptions.map((redemption) => (
                      <div 
                        key={redemption.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border/50"
                        data-testid={`redemption-${redemption.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {redemption.promoCode?.grantsTier ? (
                              <Crown className="h-5 w-5 text-primary" />
                            ) : (
                              <Gift className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{redemption.promoCode?.name || redemption.promoCode?.code}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: <span className="font-mono">{redemption.promoCode?.code}</span>
                              {redemption.promoCode?.grantsTier && (
                                <Badge className="ml-2 capitalize">
                                  {redemption.promoCode.grantsTier} Tier Unlocked
                                </Badge>
                              )}
                              {redemption.promoCode?.grantsCredits && redemption.promoCode.grantsCredits > 0 && (
                                <span className="ml-2 text-green-600">+{redemption.promoCode.grantsCredits} credits</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(redemption.createdAt), 'MMM d, yyyy')}
                          </span>
                          {redemption.promoCode?.grantsTier && (
                            <Button
                              size="sm"
                              onClick={() => setLocation(`/questionnaire?tier=${redemption.promoCode?.grantsTier}`)}
                              data-testid={`button-generate-plan-${redemption.id}`}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Generate Plan
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Saved Work Section */}
            <MyWorkSection />

            {/* Business Plans List - 50/50 Layout */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Your Business Plans</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Plan Cards */}
                <div className="space-y-4">
                  {displayPlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <Card 
                        key={plan.id} 
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover-elevate'}`}
                        onClick={() => setSelectedPlanId(plan.id)}
                        data-testid={`card-plan-${plan.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">{plan.businessName}</CardTitle>
                              <CardDescription className="text-xs truncate">{plan.industry}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(plan.status)}
                              {plan.isDemoData && (
                                <Badge variant="outline" className="text-xs">Demo</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              <span className="capitalize">{plan.tier}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {plan.currentGenerationStage && plan.status === 'generating' && (
                            <div className="mt-2 p-2 bg-accent/20 rounded text-xs">
                              <p className="text-muted-foreground">{plan.currentGenerationStage}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="pt-0 flex gap-2 flex-wrap">
                          {plan.status === 'completed' && plan.pdfUrl && (
                            <>
                              <Button 
                                size="sm"
                                variant="default"
                                onClick={(e) => { e.stopPropagation(); window.open(plan.pdfUrl!, '_blank'); }}
                                data-testid={`button-download-${plan.id}`}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  localStorage.setItem('lastPlanId', plan.id);
                                  setLocation(`/diagnostics?planId=${plan.id}`);
                                }}
                                data-testid={`button-diagnostics-${plan.id}`}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Diagnostics
                              </Button>
                            </>
                          )}
                          {plan.status === 'pending' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); setLocation(`/questionnaire?tier=${plan.tier}`); }}
                              data-testid={`button-continue-${plan.id}`}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Continue
                            </Button>
                          )}
                          {plan.status === 'generating' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); setLocation(`/generation?plan_id=${plan.id}`); }}
                              data-testid={`button-view-progress-${plan.id}`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              View Progress
                            </Button>
                          )}
                          {!plan.isDemoData && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlanToDelete({ id: plan.id, name: plan.businessName || 'Untitled Plan' });
                              }}
                              data-testid={`button-delete-${plan.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          {plan.isDemoData && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (hiddenIds.includes(plan.id)) {
                                  showPlan(plan.id);
                                } else {
                                  hidePlan(plan.id);
                                }
                              }}
                              data-testid={`button-toggle-visibility-${plan.id}`}
                            >
                              {hiddenIds.includes(plan.id) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Right Side - Plan Details */}
                <div className="lg:sticky lg:top-4 h-fit">
                  {selectedPlanId && displayPlans.find(p => p.id === selectedPlanId) ? (() => {
                    const selectedPlan = displayPlans.find(p => p.id === selectedPlanId)!;
                    const radarData = calculateRadarData(selectedPlan);
                    const approvalProb = calculateApprovalProbability(selectedPlan);
                    return (
                      <Card className="border-2 border-primary/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{selectedPlan.businessName}</CardTitle>
                              <CardDescription>{selectedPlan.industry}</CardDescription>
                            </div>
                            {getStatusBadge(selectedPlan.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Plan Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Tier:</span>
                              <span className="font-medium capitalize">{selectedPlan.tier}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Created:</span>
                              <span className="font-medium">{format(new Date(selectedPlan.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Industry:</span>
                              <span className="font-medium">{selectedPlan.industry}</span>
                            </div>
                          </div>

                          {/* Approval Probability */}
                          {selectedPlan.status === 'completed' && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Approval Probability</span>
                                <span className="text-lg font-bold text-primary">{approvalProb}%</span>
                              </div>
                              <Progress value={approvalProb} className="h-2" />
                            </div>
                          )}

                          {/* Radar Chart */}
                          {selectedPlan.status === 'completed' && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Visa Strength Indicator</h4>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart data={radarData}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                    <Radar name="Score" dataKey="score" stroke="#005EB8" fill="#005EB8" fillOpacity={0.5} />
                                    <Tooltip />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                {radarData.map((item: { criterion: string; score: number; fullMark: number }) => (
                                  <div key={item.criterion} className="p-2 bg-muted/30 rounded">
                                    <div className="text-xs text-muted-foreground">{item.criterion}</div>
                                    <div className="text-sm font-bold text-primary">{item.score}/100</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            {selectedPlan.status === 'completed' && selectedPlan.pdfUrl && (
                              <Button 
                                className="flex-1"
                                onClick={() => window.open(selectedPlan.pdfUrl!, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                            )}
                            {!selectedPlan.isDemoData && (
                              <Button
                                variant="outline"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                                onClick={() => setPlanToDelete({ id: selectedPlan.id, name: selectedPlan.businessName || 'Untitled Plan' })}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })() : (
                    <Card className="border-2 border-dashed border-muted">
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">Select a business plan to view details</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Business Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone and all associated data will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => planToDelete && deletePlanMutation.mutate(planToDelete.id)}
                    disabled={deletePlanMutation.isPending}
                  >
                    {deletePlanMutation.isPending ? "Deleting..." : "Delete Plan"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Card className="text-center p-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No business plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered business plan for your UK Innovator Founder Visa application
            </p>
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                // Users with unlocked tiers go directly to questionnaire
                const tier = user?.subscriptionTier;
                const paidTiers = ['basic', 'premium', 'enterprise', 'ultimate'];
                if (tier && paidTiers.includes(tier)) {
                  setLocation(`/questionnaire?tier=${tier}`);
                } else {
                  setLocation("/pricing");
                }
              }}
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
