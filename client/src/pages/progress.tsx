import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/hooks/useAuth";
import { 
  CheckCircle2, Circle, Clock, Target, TrendingUp, 
  FileText, Calculator, Users, Shield, Rocket,
  AlertTriangle, ArrowRight, Calendar, Award
} from "lucide-react";
import { Link } from "wouter";

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
    color: "#ffa536",
    steps: [
      { id: "questionnaire", name: "Complete Questionnaire", description: "Tell us about your business idea", toolPath: "/questionnaire", storageKey: "questionnaire-autosave", required: true },
      { id: "innovation-score", name: "Check Innovation Score", description: "Assess your innovation criteria", toolPath: "/tools/innovation-score", storageKey: "innovation-score-state", required: true },
      { id: "eligibility", name: "Verify Eligibility", description: "Confirm you meet requirements", toolPath: "/tools/eligibility-checker", storageKey: "eligibility-checker-state", required: true },
    ]
  },
  {
    id: "business-planning",
    name: "Business Planning",
    description: "Create your visa-compliant business plan",
    icon: Calculator,
    color: "#11b6e9",
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

function getStepStatus(storageKey?: string): "completed" | "in-progress" | "not-started" {
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

function getPhaseProgress(phase: JourneyPhase): number {
  const completedSteps = phase.steps.filter(
    step => getStepStatus(step.storageKey) === "completed"
  ).length;
  return Math.round((completedSteps / phase.steps.length) * 100);
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [activePhase, setActivePhase] = useState("preparation");

  const overallProgress = Math.round(
    JOURNEY_PHASES.reduce((acc, phase) => acc + getPhaseProgress(phase), 0) / JOURNEY_PHASES.length
  );

  const completedSteps = JOURNEY_PHASES.flatMap(p => p.steps).filter(
    s => getStepStatus(s.storageKey) === "completed"
  ).length;

  const totalSteps = JOURNEY_PHASES.flatMap(p => p.steps).length;

  const nextStep = JOURNEY_PHASES.flatMap(p => p.steps).find(
    s => getStepStatus(s.storageKey) !== "completed"
  );

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-progress">
            Your Visa Journey
          </h1>
          <p className="text-muted-foreground">
            Track your progress through the UK Innovator Founder Visa application process
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#ffa536]/10 to-[#11b6e9]/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2" data-testid="text-overall-progress">
                {overallProgress}%
              </div>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Steps Completed</span>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold" data-testid="text-completed-steps">
                {completedSteps}/{totalSteps}
              </div>
              <p className="text-xs text-muted-foreground mt-1">tasks finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Phase</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-lg font-bold" data-testid="text-current-phase">
                {JOURNEY_PHASES.find(p => getPhaseProgress(p) < 100)?.name || "Complete!"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Readiness</span>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-lg font-bold" data-testid="text-readiness">
                {overallProgress >= 80 ? "Ready" : overallProgress >= 50 ? "Almost" : "Building"}
              </div>
              <Badge 
                variant={overallProgress >= 80 ? "default" : "secondary"}
                className="mt-1"
              >
                {overallProgress >= 80 ? "Application Ready" : "Keep Going"}
              </Badge>
            </CardContent>
          </Card>
        </div>

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
                      const status = getStepStatus(step.storageKey);
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
