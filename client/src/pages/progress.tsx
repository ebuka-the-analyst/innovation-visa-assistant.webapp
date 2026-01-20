import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle2, Circle, Clock, Target, TrendingUp, 
  FileText, Calculator, Users, Shield, Rocket,
  AlertTriangle, ArrowRight, Calendar, Award, Star, Trophy, Zap, Sparkles,
  Eye, Download, Trash2
} from "lucide-react";
import { Link } from "wouter";

interface BusinessPlan {
  id: string;
  status: string;
  businessName?: string;
  industry?: string;
  pdfUrl?: string;
  tier?: string;
  createdAt?: string;
}

interface JourneyPhase {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  steps: JourneyStep[];
  color: string;
}

interface JourneyStep {
  id: string;
  name: string;
  description: string;
  toolPath?: string;
  storageKey?: string;
  required: boolean;
}

const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: "preparation",
    name: "Preparation",
    description: "Gather requirements and assess eligibility",
    icon: FileText,
    color: "#005EB8",
    steps: [
      { id: "questionnaire", name: "Generate Business Plan", description: "Tell us about your business idea", toolPath: "/questionnaire", storageKey: "questionnaire-autosave", required: true },
      { id: "innovation-score", name: "Check Innovation Score", description: "Assess your innovation criteria", toolPath: "/tools/innovation-score", storageKey: "innovation-score-state", required: true },
      { id: "eligibility", name: "Verify Eligibility", description: "Confirm you meet requirements", toolPath: "/tools/eligibility-validator", storageKey: "eligibility-validator-state", required: true },
    ]
  },
  {
    id: "business-planning",
    name: "Business Planning",
    description: "Create your visa-compliant business plan",
    icon: Calculator,
    color: "#41B6E6",
    steps: [
      { id: "business-plan", name: "Generate Business Plan", description: "Create comprehensive business plan", toolPath: "/tools/business-plan", storageKey: "business-plan-state", required: true },
      { id: "financial-projections", name: "Financial Projections", description: "5-year financial forecasts", toolPath: "/tools/financial-projections", storageKey: "financialProjectionsProgress", required: true },
      { id: "market-research", name: "Market Research", description: "UK market analysis", toolPath: "/tools/market-research", storageKey: "market-research-state", required: false },
    ]
  },
  {
    id: "endorsement",
    name: "Endorsement Prep",
    description: "Prepare for endorser interviews",
    icon: Users,
    color: "#4caf50",
    steps: [
      { id: "endorser-comparison", name: "Compare Endorsers", description: "Find the right endorsing body", toolPath: "/endorser-comparison", storageKey: "endorser-comparison-state", required: true },
      { id: "pitch-coach", name: "Practice Pitch", description: "AI-powered interview prep", toolPath: "/tools/pitch-coach", storageKey: "pitch-coach-state", required: true },
      { id: "interview-prep", name: "Interview Preparation", description: "Common questions and answers", toolPath: "/interview-prep", storageKey: "interview-prep-state", required: false },
    ]
  },
  {
    id: "documentation",
    name: "Documentation",
    description: "Prepare and organize documents",
    icon: Shield,
    color: "#9c27b0",
    steps: [
      { id: "document-organizer", name: "Organize Documents", description: "Document checklist and tracker", toolPath: "/document-organizer", storageKey: "document-organizer-state", required: true },
      { id: "cover-letter", name: "Cover Letter", description: "Personal statement builder", toolPath: "/tools/cover-letter-builder", storageKey: "cover-letter-state", required: false },
      { id: "evidence-prep", name: "Evidence Preparation", description: "Supporting evidence guide", toolPath: "/tools/evidence-builder", storageKey: "evidence-builder-state", required: false },
    ]
  },
  {
    id: "submission",
    name: "Final Submission",
    description: "Review and submit your application",
    icon: Rocket,
    color: "#f44336",
    steps: [
      { id: "final-review", name: "Final Review", description: "Complete application review", toolPath: "/tools/application-review", storageKey: "application-review-state", required: true },
      { id: "compliance-check", name: "Compliance Check", description: "Ensure all requirements met", toolPath: "/tools/compliance-checker", storageKey: "compliance-checker-state", required: true },
    ]
  },
];

function getStepStatusFromStorage(storageKey?: string): "completed" | "in-progress" | "not-started" {
  if (!storageKey) return "not-started";
  const saved = localStorage.getItem(storageKey);
  if (!saved) return "not-started";
  try {
    const data = JSON.parse(saved);
    if (data.completed || data.overallCompletion >= 80) return "completed";
    return "in-progress";
  } catch {
    return "in-progress";
  }
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activePhase, setActivePhase] = useState("preparation");

  // Fetch business plans from database to check completion status
  const { data: businessPlans = [] } = useQuery<BusinessPlan[]>({
    queryKey: ['/api/business-plans'],
    enabled: !!user,
  });

  // Filter completed plans with PDF URLs for display
  const completedPlansWithPdf = businessPlans.filter(plan => plan.status === 'completed' && plan.pdfUrl);

  // Delete business plan mutation
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
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  // Check if user has any completed business plans
  const hasCompletedBusinessPlan = businessPlans.some(plan => plan.status === 'completed');
  const hasProcessingBusinessPlan = businessPlans.some(plan => plan.status === 'processing' || plan.status === 'pending');

  // Enhanced step status that checks both localStorage AND database
  const getStepStatus = (step: JourneyStep): "completed" | "in-progress" | "not-started" => {
    // Special handling for questionnaire/business plan - check database
    if (step.id === 'questionnaire' || step.id === 'business-plan') {
      if (hasCompletedBusinessPlan) return "completed";
      if (hasProcessingBusinessPlan) return "in-progress";
    }
    
    // Check localStorage for other steps
    return getStepStatusFromStorage(step.storageKey);
  };

  const getPhaseProgress = (phase: JourneyPhase): number => {
    const completedSteps = phase.steps.filter(
      step => getStepStatus(step) === "completed"
    ).length;
    return Math.round((completedSteps / phase.steps.length) * 100);
  };

  const overallProgress = Math.round(
    JOURNEY_PHASES.reduce((acc, phase) => acc + getPhaseProgress(phase), 0) / JOURNEY_PHASES.length
  );

  const completedSteps = JOURNEY_PHASES.flatMap(p => p.steps).filter(
    s => getStepStatus(s) === "completed"
  ).length;

  const totalSteps = JOURNEY_PHASES.flatMap(p => p.steps).length;

  const nextStep = JOURNEY_PHASES.flatMap(p => p.steps).find(
    s => getStepStatus(s) !== "completed"
  );

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" data-testid="heading-progress">
            Your Visa Journey
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress through the UK Innovator Founder Visa application process
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-[#005EB8]/10 to-[#41B6E6]/10">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Overall Progress</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xl font-bold mb-1" data-testid="text-overall-progress">
                {overallProgress}%
              </div>
              <Progress value={overallProgress} className="h-1.5" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Steps Completed</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold" data-testid="text-completed-steps">
                {completedSteps}/{totalSteps}
              </div>
              <p className="text-xs text-muted-foreground">tasks finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Current Phase</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-base font-bold" data-testid="text-current-phase">
                {JOURNEY_PHASES.find(p => getPhaseProgress(p) < 100)?.name || "Complete!"}
              </div>
              <p className="text-xs text-muted-foreground">in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Readiness</span>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-base font-bold" data-testid="text-readiness">
                {overallProgress >= 80 ? "Ready" : overallProgress >= 50 ? "Almost" : "Building"}
              </div>
              <Badge 
                variant={overallProgress >= 80 ? "default" : "secondary"}
                className="text-xs"
              >
                {overallProgress >= 80 ? "Application Ready" : "Keep Going"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div data-testid="achievement-first-step" className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${completedSteps >= 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-muted bg-muted/30 opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedSteps >= 1 ? 'bg-amber-400' : 'bg-muted'}`}>
                  <Star className={`w-6 h-6 ${completedSteps >= 1 ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm font-medium text-center">First Step</span>
                <span className="text-xs text-muted-foreground">Complete 1 task</span>
              </div>
              <div data-testid="achievement-fast-starter" className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${completedSteps >= 5 ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-muted bg-muted/30 opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedSteps >= 5 ? 'bg-blue-500' : 'bg-muted'}`}>
                  <Zap className={`w-6 h-6 ${completedSteps >= 5 ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm font-medium text-center">Fast Starter</span>
                <span className="text-xs text-muted-foreground">Complete 5 tasks</span>
              </div>
              <div data-testid="achievement-halfway" className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${overallProgress >= 50 ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20' : 'border-muted bg-muted/30 opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${overallProgress >= 50 ? 'bg-purple-500' : 'bg-muted'}`}>
                  <Target className={`w-6 h-6 ${overallProgress >= 50 ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm font-medium text-center">Halfway There</span>
                <span className="text-xs text-muted-foreground">50% complete</span>
              </div>
              <div data-testid="achievement-visa-ready" className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${overallProgress >= 100 ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-muted bg-muted/30 opacity-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${overallProgress >= 100 ? 'bg-green-500' : 'bg-muted'}`}>
                  <Trophy className={`w-6 h-6 ${overallProgress >= 100 ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm font-medium text-center">Visa Ready</span>
                <span className="text-xs text-muted-foreground">100% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Generated Business Plans Section */}
        {completedPlansWithPdf.length > 0 && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Business Plans
                <Badge className="bg-primary/10 text-primary">{completedPlansWithPdf.length}</Badge>
              </CardTitle>
              <CardDescription>
                Generated business plans ready for download and review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedPlansWithPdf.map((plan) => {
                  const getPdfUrl = () => {
                    if (!plan.pdfUrl) return '';
                    return plan.pdfUrl.startsWith('http') ? plan.pdfUrl : `${window.location.origin}${plan.pdfUrl}`;
                  };
                  const fullPdfUrl = getPdfUrl();
                  
                  return (
                    <div
                      key={plan.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors"
                      data-testid={`progress-plan-${plan.id}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium truncate">{plan.businessName || 'Business Plan'}</h4>
                          {plan.tier && <Badge variant="outline" className="capitalize text-xs">{plan.tier}</Badge>}
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Ready
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {plan.industry && <span>{plan.industry}</span>}
                          {plan.createdAt && (
                            <>
                              <span>•</span>
                              <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(fullPdfUrl, '_blank')}
                          data-testid={`button-view-progress-plan-${plan.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon"
                          onClick={() => window.open(fullPdfUrl, '_blank')}
                          data-testid={`button-download-progress-plan-${plan.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${plan.businessName || 'this plan'}"? This cannot be undone.`)) {
                              deletePlanMutation.mutate(plan.id);
                            }
                          }}
                          disabled={deletePlanMutation.isPending}
                          data-testid={`button-delete-progress-plan-${plan.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {nextStep && (
          <Alert className="mb-8 border-primary/50 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Next Step: </span>
                {nextStep.name} - {nextStep.description}
              </div>
              {nextStep.toolPath && (
                <Button size="sm" asChild>
                  <Link href={nextStep.toolPath} data-testid="link-next-step">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-6">
          <TabsList className="grid grid-cols-5 h-auto gap-2">
            {JOURNEY_PHASES.map((phase) => {
              const progress = getPhaseProgress(phase);
              const Icon = phase.icon;
              return (
                <TabsTrigger 
                  key={phase.id} 
                  value={phase.id}
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary/10"
                  data-testid={`tab-phase-${phase.id}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${phase.color}20` }}
                  >
                    {progress === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className="w-4 h-4" style={{ color: phase.color }} />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{phase.name}</span>
                  <span className="text-[10px] text-muted-foreground">{progress}%</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {JOURNEY_PHASES.map((phase) => (
            <TabsContent key={phase.id} value={phase.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${phase.color}20` }}
                    >
                      <phase.icon className="w-5 h-5" style={{ color: phase.color }} />
                    </div>
                    <div>
                      <CardTitle>{phase.name}</CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </div>
                  </div>
                  <Progress value={getPhaseProgress(phase)} className="mt-4 h-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phase.steps.map((step, index) => {
                      const status = getStepStatus(step);
                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            status === "completed" 
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
                              : status === "in-progress"
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                                : "bg-muted/30 border-muted"
                          }`}
                          data-testid={`step-${step.id}`}
                        >
                          <div className="flex-shrink-0">
                            {status === "completed" ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : status === "in-progress" ? (
                              <Clock className="w-6 h-6 text-blue-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{step.name}</h4>
                              {step.required && (
                                <Badge variant="outline" className="text-[10px]">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          {step.toolPath && (
                            <Button 
                              variant={status === "completed" ? "outline" : "default"}
                              size="sm"
                              asChild
                            >
                              <Link href={step.toolPath} data-testid={`link-step-${step.id}`}>
                                {status === "completed" ? "Review" : status === "in-progress" ? "Continue" : "Start"}
                              </Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {JOURNEY_PHASES.map((phase, index) => (
                <div key={phase.id} className="text-center">
                  <div 
                    className="w-full h-2 rounded-full mb-2"
                    style={{ backgroundColor: `${phase.color}40` }}
                  >
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${getPhaseProgress(phase)}%`,
                        backgroundColor: phase.color 
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium">{phase.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Week {index * 2 + 1}-{index * 2 + 2}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Recommended timeline: 8-10 weeks for complete visa application preparation
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
