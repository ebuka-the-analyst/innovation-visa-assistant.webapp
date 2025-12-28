import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  X, ChevronRight, ChevronLeft, Sparkles, FileText, 
  Calculator, Users, Target, CheckCircle2, Rocket, 
  LayoutDashboard, Settings, Crown, Briefcase, 
  TrendingUp, Shield, HelpCircle, Keyboard,
  Clock, Star, Zap, Award, ArrowRight, Wrench,
  GraduationCap, Lightbulb, PiggyBank, UserPlus
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  targetSelector?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'bottom-center';
  tips?: string[];
}

// Page-specific tour configurations
const PAGE_TOURS: Record<string, TourStep[]> = {
  '/dashboard': [
    {
      id: "dashboard-welcome",
      title: "Welcome to Your Dashboard",
      description: "This is your command center for your visa journey. Here you'll find your progress, business plans, and quick access to all tools.",
      icon: LayoutDashboard,
      position: 'center',
      tips: [
        "Check your visa readiness score here",
        "Access recent tools and activities",
        "Create and manage business plans"
      ]
    },
    {
      id: "dashboard-plans",
      title: "Your Business Plans",
      description: "Create and manage your business plans here. Each plan can be exported as a professional Word document for your visa application.",
      icon: Briefcase,
      targetSelector: "[data-testid='section-business-plans']",
      position: 'top-right',
      tips: [
        "Click 'Create New Plan' to start",
        "Plans auto-save as you work",
        "Export generates 50-80+ page documents"
      ]
    },
    {
      id: "dashboard-insights",
      title: "Quick Insights",
      description: "View your application progress, upcoming tasks, and personalized recommendations based on your visa journey stage.",
      icon: TrendingUp,
      targetSelector: "[data-testid='dashboard-insights']",
      position: 'bottom-left',
      tips: [
        "Progress updates in real-time",
        "Complete recommended tasks for best results"
      ]
    }
  ],
  '/tools-hub': [
    {
      id: "tools-welcome",
      title: "Welcome to the Tools Hub",
      description: "Access 100+ specialized tools to prepare your visa application. Each tool is designed to help you meet specific endorsing body requirements.",
      icon: Wrench,
      position: 'center',
      tips: [
        "Tools are organized by category",
        "Green icons = accessible tools",
        "Complete all categories for best preparation"
      ]
    },
    {
      id: "tools-categories",
      title: "Tool Categories",
      description: "Filter tools by category: Compliance, Documentation, Business, Financial, Growth, Innovation, Team, and Defense. Each targets specific visa criteria.",
      icon: Target,
      targetSelector: "[data-testid='select-category']",
      position: 'top-left',
      tips: [
        "Start with Compliance tools",
        "Use Financial tools for projections",
        "Defense tools help with interview prep"
      ]
    },
    {
      id: "tools-search",
      title: "Find Tools Quickly",
      description: "Use the search bar to find specific tools by name or keyword. You can also filter by your tier access level.",
      icon: Target,
      targetSelector: "[data-testid='input-search-tools']",
      position: 'top-right',
      tips: [
        "Search by tool name or topic",
        "Filter by accessibility"
      ]
    }
  ],
  '/pricing': [
    {
      id: "pricing-welcome",
      title: "Choose Your Plan",
      description: "Select the plan that best fits your needs. Higher tiers unlock more specialized tools and features for comprehensive visa preparation.",
      icon: Crown,
      position: 'center',
      tips: [
        "Free tier includes essential tools",
        "Premium unlocks comprehensive features",
        "Enterprise provides full access"
      ]
    },
    {
      id: "pricing-compare",
      title: "Compare Features",
      description: "Each tier includes different levels of access to tools, exports, and AI features. Compare to find your best fit.",
      icon: CheckCircle2,
      position: 'bottom-center',
      tips: [
        "All tiers include auto-save",
        "Higher tiers unlock more AI features",
        "Upgrade anytime as needed"
      ]
    }
  ],
  '/questionnaire': [
    {
      id: "questionnaire-welcome",
      title: "Create Your Business Plan",
      description: "Answer questions about your business to generate a comprehensive, visa-ready business plan. Take your time - progress saves automatically.",
      icon: GraduationCap,
      position: 'center',
      tips: [
        "Be detailed in your answers",
        "Progress saves automatically",
        "You can edit later"
      ]
    },
    {
      id: "questionnaire-sections",
      title: "Complete All Sections",
      description: "Work through each section: Business Overview, Innovation, Market Analysis, Financial Projections, and more. Each strengthens your application.",
      icon: FileText,
      position: 'top-right',
      tips: [
        "Complete sections in order",
        "Green checkmarks show completion",
        "Export when finished"
      ]
    }
  ],
  '/tools/innovation-score': [
    {
      id: "innovation-welcome",
      title: "Innovation Score Calculator",
      description: "Evaluate your business against the visa's innovation criteria. Get a detailed breakdown showing how your innovation measures up.",
      icon: Lightbulb,
      position: 'center',
      tips: [
        "Aim for 80+ score",
        "Review each criterion carefully",
        "Use recommendations to improve"
      ]
    }
  ],
  '/tools/financial-projections': [
    {
      id: "financial-welcome",
      title: "Financial Projections Tool",
      description: "Create compelling 36-month financial projections. Generate realistic forecasts that endorsers expect to see.",
      icon: PiggyBank,
      position: 'center',
      tips: [
        "Be realistic with numbers",
        "Include multiple scenarios",
        "Show path to profitability"
      ]
    }
  ],
  '/tools/pitch-coach': [
    {
      id: "pitch-welcome",
      title: "AI Pitch Practice Coach",
      description: "Practice answering endorser interview questions with our AI coach. Get instant feedback and build confidence.",
      icon: Users,
      position: 'center',
      tips: [
        "Practice until confident",
        "Focus on innovation questions",
        "Review feedback carefully"
      ]
    }
  ],
  '/faq': [
    {
      id: "faq-welcome",
      title: "Frequently Asked Questions",
      description: "Find answers to common questions about the visa process, our tools, and your subscription.",
      icon: HelpCircle,
      position: 'top-center',
      tips: [
        "Use search to find specific topics",
        "Contact support for personalized help"
      ]
    }
  ]
};

// Default tour for pages without specific configuration
const DEFAULT_TOUR: TourStep[] = [
  {
    id: "default-welcome",
    title: "Welcome!",
    description: "Explore this page to discover features that will help with your visa application. Use the navigation to access different sections.",
    icon: Sparkles,
    position: 'center',
    tips: [
      "Navigate using the sidebar",
      "Access tools from the Tools Hub",
      "Your progress saves automatically"
    ]
  }
];

interface SpotlightOverlayProps {
  isActive: boolean;
}

function SpotlightOverlay({ isActive }: SpotlightOverlayProps) {
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" />
  );
}

interface SpotlightTourProps {
  onComplete: () => void;
  onSkip?: () => void;
  isOpen: boolean;
}

const TOURED_PAGES_KEY = 'spotlight-toured-pages';

// Helper to track which pages have been toured
function getTouredPages(): string[] {
  try {
    const stored = localStorage.getItem(TOURED_PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markPageToured(page: string): void {
  try {
    const toured = getTouredPages();
    if (!toured.includes(page)) {
      toured.push(page);
      localStorage.setItem(TOURED_PAGES_KEY, JSON.stringify(toured));
    }
  } catch {
    // Ignore
  }
}

function hasPageBeenToured(page: string): boolean {
  return getTouredPages().includes(page);
}

export function SpotlightTour({ onComplete, onSkip, isOpen }: SpotlightTourProps) {
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get tour steps for current page
  const currentPageTour = PAGE_TOURS[location] || DEFAULT_TOUR;
  const step = currentPageTour[currentStep] || currentPageTour[0];
  const progress = ((currentStep + 1) / currentPageTour.length) * 100;
  const Icon = step?.icon || Sparkles;

  // Reset step when page changes
  useEffect(() => {
    setCurrentStep(0);
  }, [location]);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep, currentPageTour.length]);

  if (!isVisible || !step) return null;

  const handleNext = () => {
    if (currentStep < currentPageTour.length - 1) {
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
    // Mark this page as toured (per-page tracking, not global)
    markPageToured(location);
    setIsVisible(false);
    try {
      localStorage.removeItem('spotlight-tour-active');
    } catch {
      // Ignore
    }
    onComplete();
  };

  const handleSkip = () => {
    // Close the tour without marking page as toured
    setIsVisible(false);
    try {
      localStorage.removeItem('spotlight-tour-active');
    } catch {
      // Ignore
    }
    // Notify parent: use onSkip if provided, otherwise onComplete to sync state
    if (onSkip) {
      onSkip();
    } else {
      // Must call onComplete to sync parent state (isOpen flag)
      onComplete();
    }
  };

  // Get position styles based on step configuration
  const getPositionStyles = (): React.CSSProperties => {
    const padding = 24;
    const cardWidth = 380;
    
    switch (step.position) {
      case 'top-left':
        return { top: `${padding}px`, left: `${padding}px` };
      case 'top-right':
        return { top: `${padding}px`, right: `${padding}px` };
      case 'top-center':
        return { top: `${padding}px`, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-left':
        return { bottom: `${padding}px`, left: `${padding}px` };
      case 'bottom-right':
        return { bottom: `${padding}px`, right: `${padding}px` };
      case 'bottom-center':
        return { bottom: `${padding}px`, left: '50%', transform: 'translateX(-50%)' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <>
      <SpotlightOverlay isActive={true} />
      
      <div 
        ref={cardRef}
        className="fixed z-50 w-[90vw] max-w-[380px] animate-in fade-in zoom-in-95 duration-300"
        style={getPositionStyles()}
      >
        <Card className="shadow-2xl border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-[#005EB8] to-[#41B6E6] p-0.5">
            <div className="bg-background p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#005EB8] to-[#41B6E6] flex items-center justify-center shadow-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {currentPageTour.length > 1 ? `${currentStep + 1} of ${currentPageTour.length}` : 'Quick Tip'}
                    </p>
                    <h2 className="text-base font-bold leading-tight">{step.title}</h2>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0 h-8 w-8"
                  data-testid="button-close-spotlight-tour"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {currentPageTour.length > 1 && (
                <Progress value={progress} className="h-1 mb-3" />
              )}
            </div>
          </div>

          <CardContent className="p-4 pt-3">
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {step.description}
            </p>

            {step.tips && step.tips.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Quick Tips</span>
                </div>
                <ul className="space-y-1.5">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentPageTour.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {currentPageTour.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`transition-all rounded-full ${
                      index === currentStep 
                        ? "w-5 h-1.5 bg-primary" 
                        : index < currentStep 
                          ? "w-1.5 h-1.5 bg-primary/50 hover:bg-primary/70" 
                          : "w-1.5 h-1.5 bg-muted hover:bg-muted-foreground/30"
                    }`}
                    data-testid={`button-spotlight-step-${index}`}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              {currentPageTour.length > 1 ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    size="sm"
                    data-testid="button-spotlight-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={handleSkip}
                      size="sm"
                      data-testid="button-spotlight-skip"
                    >
                      Skip
                    </Button>
                    <Button 
                      onClick={handleNext}
                      size="sm"
                      className="bg-gradient-to-r from-[#005EB8] to-[#41B6E6] text-white hover:opacity-90"
                      data-testid="button-spotlight-next"
                    >
                      {currentStep === currentPageTour.length - 1 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Got it
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={handleSkip}
                  size="sm"
                  className="w-full bg-gradient-to-r from-[#005EB8] to-[#41B6E6] text-white hover:opacity-90"
                  data-testid="button-spotlight-dismiss"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Got it
                </Button>
              )}
            </div>

            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Press ESC to dismiss
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Persistent tour step storage key
const TOUR_ACTIVE_KEY = 'spotlight-tour-active';

export function useSpotlightTour() {
  const [location] = useLocation();
  const [showTour, setShowTour] = useState(() => {
    try {
      return localStorage.getItem(TOUR_ACTIVE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [shouldTrigger, setShouldTrigger] = useState(false);

  const { data: onboardingStatus, isLoading } = useQuery<{
    hasCompletedOnboarding: boolean;
    subscriptionStatus: string;
    subscriptionTier: string;
  }>({
    queryKey: ['/api/onboarding/status'],
    retry: false,
    staleTime: 0,
  });

  // Check if current page has been toured
  const currentPageToured = hasPageBeenToured(location);

  useEffect(() => {
    try {
      if (showTour) {
        localStorage.setItem(TOUR_ACTIVE_KEY, 'true');
      } else {
        localStorage.removeItem(TOUR_ACTIVE_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [showTour]);

  useEffect(() => {
    if (isLoading) return;
    
    // Show tour if triggered and current page hasn't been toured
    if (shouldTrigger && !currentPageToured) {
      setTimeout(() => setShowTour(true), 500);
    }
    
    // Resume tour if it was active
    const tourWasActive = localStorage.getItem(TOUR_ACTIVE_KEY) === 'true';
    if (tourWasActive && !currentPageToured) {
      setShowTour(true);
    }
  }, [onboardingStatus, isLoading, shouldTrigger, currentPageToured]);

  const triggerTour = useCallback(() => {
    // Trigger tour if current page hasn't been toured
    if (!currentPageToured) {
      setShouldTrigger(true);
      setTimeout(() => setShowTour(true), 500);
    }
  }, [currentPageToured]);

  const closeTour = useCallback(() => {
    setShowTour(false);
    setShouldTrigger(false);
    try {
      localStorage.removeItem(TOUR_ACTIVE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return { 
    showTour, 
    setShowTour, 
    triggerTour,
    closeTour,
    currentPageToured,
    hasCompletedOnboarding: onboardingStatus?.hasCompletedOnboarding ?? true,
    hasPaidPlan: onboardingStatus?.subscriptionTier !== 'free',
    isLoading
  };
}

// Export helper for external use
export { hasPageBeenToured, markPageToured, getTouredPages };

export default SpotlightTour;
