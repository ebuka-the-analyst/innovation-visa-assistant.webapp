import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  X, ChevronRight, ChevronLeft, Sparkles, FileText, 
  Calculator, Users, Target, CheckCircle2, Rocket
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  highlight?: string;
  action?: {
    label: string;
    href: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Visa Journey",
    description: "The UK Innovator Founder Visa Assistant guides you through every step of your visa application with 109 PhD-level tools designed for success.",
    icon: Sparkles,
  },
  {
    id: "tools",
    title: "Explore 109 Expert Tools",
    description: "Access comprehensive tools across Compliance, Documentation, Business Planning, Financial Modeling, and more. Start with the Business Plan Generator - it's free!",
    icon: FileText,
    action: { label: "Browse Tools", href: "/tools-hub" }
  },
  {
    id: "innovation",
    title: "Calculate Your Innovation Score",
    description: "See how your business measures up against visa requirements. Our Innovation Score Calculator analyzes your idea against official criteria.",
    icon: Calculator,
    action: { label: "Check Score", href: "/tools/innovation-score" }
  },
  {
    id: "pitch",
    title: "Practice Your Endorser Pitch",
    description: "AI-powered coaching helps you prepare for endorser interviews. Practice common questions and get instant feedback.",
    icon: Users,
    action: { label: "Start Practicing", href: "/tools/pitch-coach" }
  },
  {
    id: "progress",
    title: "Track Your Progress",
    description: "Monitor your visa readiness with our journey tracker. See what you've completed and what's next on your path to success.",
    icon: Target,
    action: { label: "View Progress", href: "/progress" }
  },
  {
    id: "complete",
    title: "You're Ready to Begin!",
    description: "Start your visa journey today. Remember, all your progress auto-saves so you can pick up right where you left off.",
    icon: Rocket,
    action: { label: "Go to Dashboard", href: "/dashboard" }
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function OnboardingTour({ onComplete, isOpen }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsVisible(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg mx-4 shadow-2xl border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-[#ffa536] to-[#11b6e9] p-1">
          <div className="bg-background p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#ffa536] to-[#11b6e9] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </p>
                  <h2 className="text-xl font-bold">{step.title}</h2>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-close-tour"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <Progress value={progress} className="h-1 mb-6" />

            <CardContent className="p-0">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {step.action && (
                <a 
                  href={step.action.href}
                  className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
                  data-testid={`link-tour-action-${step.id}`}
                >
                  {step.action.label}
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}

              <div className="flex items-center gap-2 mb-6">
                {TOUR_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? "w-6 bg-primary" 
                        : index < currentStep 
                          ? "bg-primary/50" 
                          : "bg-muted"
                    }`}
                    data-testid={`button-tour-step-${index}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  data-testid="button-tour-prev"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep < TOUR_STEPS.length - 1 && (
                    <Button 
                      variant="ghost" 
                      onClick={handleSkip}
                      data-testid="button-tour-skip"
                    >
                      Skip Tour
                    </Button>
                  )}
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#ffa536] to-[#11b6e9] text-white"
                    data-testid="button-tour-next"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding-completed");
    if (!completed) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem("onboarding-completed");
    setShowTour(true);
  };

  return { showTour, setShowTour, resetOnboarding };
}

// Default export wrapper component with auto-show functionality
export default function OnboardingTourWrapper() {
  const { showTour, setShowTour } = useOnboarding();
  
  return (
    <OnboardingTour 
      isOpen={showTour} 
      onComplete={() => setShowTour(false)} 
    />
  );
}
