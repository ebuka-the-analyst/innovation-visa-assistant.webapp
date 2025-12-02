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
  Clock, Star, Zap, Award, ArrowRight
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  targetSelector?: string;
  targetPage?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean;
  tips?: string[];
  keyboardShortcut?: string;
  estimatedTime?: string;
  category?: 'navigation' | 'tools' | 'features' | 'settings';
}

const COMPREHENSIVE_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Visa Success Journey",
    description: "Congratulations on activating your plan! This comprehensive tour will guide you through all the powerful features designed to help you achieve UK Innovator Founder Visa approval. Let's explore everything you have access to.",
    icon: Sparkles,
    position: 'center',
    tips: [
      "This tour only appears once after plan activation",
      "You can navigate using keyboard arrows",
      "Press ESC anytime to skip the tour"
    ],
    estimatedTime: "3-5 minutes",
    category: 'navigation'
  },
  {
    id: "dashboard-overview",
    title: "Your Command Center: Dashboard",
    description: "The Dashboard is your central hub for managing your entire visa application journey. Here you'll find quick insights, your business plans, recent activity, and personalized recommendations based on your progress.",
    icon: LayoutDashboard,
    targetPage: "/dashboard",
    targetSelector: "[data-testid='dashboard-insights']",
    position: 'bottom',
    highlight: true,
    tips: [
      "Dashboard updates in real-time as you use tools",
      "Quick stats show your visa readiness score",
      "Access your most recent work with one click"
    ],
    category: 'navigation'
  },
  {
    id: "business-plans",
    title: "Business Plan Management",
    description: "Your business plans are the foundation of your visa application. Create, edit, and export professional-grade business plans that meet endorsing body requirements. Each plan includes comprehensive sections covering innovation, viability, and scalability.",
    icon: Briefcase,
    targetPage: "/dashboard",
    targetSelector: "[data-testid='section-business-plans']",
    position: 'top',
    highlight: true,
    tips: [
      "Export plans as professional Word documents",
      "Auto-save ensures you never lose progress",
      "Plans can generate 50-80+ page reports"
    ],
    category: 'features'
  },
  {
    id: "tools-hub",
    title: "100+ Professional Tools Hub",
    description: "Access over 100 specialized tools organized by category: Compliance, Documentation, Business, Financial, Growth, Innovation, Team, and Defense. Each tool provides expert-level analysis and guidance specific to UK visa requirements.",
    icon: FileText,
    targetPage: "/tools-hub",
    targetSelector: "[data-testid='heading-tools-hub']",
    position: 'bottom',
    highlight: true,
    tips: [
      "Tools are organized by visa journey stage",
      "Use filters to find specific tools quickly",
      "Green checkmarks show tools you can access"
    ],
    category: 'tools'
  },
  {
    id: "tool-categories",
    title: "Tool Categories Explained",
    description: "• Compliance: Visa rules, regulations, eligibility checks\n• Documentation: Document preparation, evidence gathering\n• Business: Planning, strategy, market analysis\n• Financial: Projections, funding, viability modeling\n• Growth: Scaling, expansion, milestone planning\n• Innovation: IP protection, tech strategy, differentiation\n• Team: Hiring plans, advisory board, expertise\n• Defense: Interview prep, appeal strategies, RFE response",
    icon: Target,
    targetPage: "/tools-hub",
    targetSelector: "[data-testid='select-category']",
    position: 'right',
    highlight: true,
    tips: [
      "Each category targets specific visa criteria",
      "Tools within categories complement each other",
      "Complete all categories for comprehensive coverage"
    ],
    category: 'tools'
  },
  {
    id: "innovation-score",
    title: "Innovation Score Calculator",
    description: "This critical tool evaluates your business against the visa's innovation criteria. Get a detailed score breakdown showing exactly how your innovation measures up to endorsing body expectations, with specific improvement recommendations.",
    icon: Calculator,
    targetPage: "/tools/innovation-score",
    position: 'center',
    tips: [
      "Aim for 80+ score for strong applications",
      "Review each criterion for improvement areas",
      "Re-calculate as your business evolves"
    ],
    category: 'tools'
  },
  {
    id: "pitch-coach",
    title: "AI Pitch Practice Coach",
    description: "Prepare for your endorser interview with our AI-powered pitch coach. Practice answering real interview questions, receive instant feedback on your responses, and build confidence for the actual meeting. Covers all common endorser questions.",
    icon: Users,
    targetPage: "/tools/pitch-coach",
    position: 'center',
    tips: [
      "Practice until you can answer confidently",
      "Focus on questions about your innovation",
      "Record and review your practice sessions"
    ],
    category: 'tools'
  },
  {
    id: "financial-projections",
    title: "Financial Projections Tool",
    description: "Create compelling 36-month financial projections that demonstrate business viability. Generate realistic revenue forecasts, cash flow statements, and funding requirements that endorsers expect to see in successful applications.",
    icon: TrendingUp,
    targetPage: "/tools/financial-projections",
    position: 'center',
    tips: [
      "Be realistic - endorsers spot inflated projections",
      "Include multiple revenue scenarios",
      "Show clear path to profitability"
    ],
    category: 'tools'
  },
  {
    id: "auto-save",
    title: "Auto-Save & Progress Tracking",
    description: "All your work automatically saves every few seconds. Your progress is stored securely and syncs across devices. Never worry about losing your work - whether you close the browser or switch devices, your data is safe.",
    icon: Clock,
    position: 'center',
    tips: [
      "Look for 'Saved' indicator in tools",
      "Progress restores automatically on return",
      "Export data anytime for backup"
    ],
    category: 'features'
  },
  {
    id: "tier-access",
    title: "Your Tier Benefits",
    description: "Based on your subscription tier, you have access to a specific set of tools. Free tier provides essential basics, while higher tiers unlock comprehensive, advanced, and full access levels. Locked tools show an upgrade prompt with clear tier requirements.",
    icon: Crown,
    position: 'center',
    tips: [
      "Green icon = tool accessible",
      "Orange lock = upgrade required",
      "Upgrade anytime to unlock more tools"
    ],
    category: 'features'
  },
  {
    id: "word-export",
    title: "Professional Report Export",
    description: "Export your work as beautifully formatted Word documents ready for submission. Reports maintain professional styling, include all relevant sections, and can generate comprehensive 50-80+ page documents suitable for endorsing bodies.",
    icon: FileText,
    position: 'center',
    tips: [
      "Word format allows easy editing",
      "Includes professional headers/footers",
      "Suitable for direct submission"
    ],
    category: 'features'
  },
  {
    id: "compliance-check",
    title: "Compliance Verification",
    description: "Our compliance tools continuously check your application against current UK Innovator Founder visa requirements. Get real-time alerts about missing information, potential issues, and specific actions needed to strengthen your application.",
    icon: Shield,
    position: 'center',
    tips: [
      "Requirements updated to April 2023 rules",
      "No fixed minimum investment requirement",
      "Focus on innovation and scalability criteria"
    ],
    category: 'tools'
  },
  {
    id: "support",
    title: "Support & Help",
    description: "Need assistance? Access our comprehensive FAQ, detailed guides, and support system. Submit tickets for personalized help, browse common questions, or explore the ultimate visa guide for in-depth information about the application process.",
    icon: HelpCircle,
    targetPage: "/faq",
    position: 'center',
    tips: [
      "FAQ covers most common questions",
      "Ultimate Guide: 3,000+ word resource",
      "Support tickets answered within 24-48 hours"
    ],
    category: 'features'
  },
  {
    id: "keyboard-shortcuts",
    title: "Pro Tips: Keyboard Navigation",
    description: "Navigate efficiently using keyboard shortcuts:\n• Arrow keys: Move between steps\n• ESC: Close tour/modals\n• Tab: Navigate form fields\n• Enter: Submit/confirm actions\n\nMaster these for faster workflow!",
    icon: Keyboard,
    position: 'center',
    keyboardShortcut: "ESC to exit",
    tips: [
      "Keyboard shortcuts work throughout the app",
      "Tab through forms for quick completion",
      "Use Enter to submit most forms"
    ],
    category: 'settings'
  },
  {
    id: "next-steps",
    title: "Your Recommended Next Steps",
    description: "To maximize your visa success:\n1. Complete your Innovation Score assessment\n2. Generate your business plan sections\n3. Practice pitch questions (aim for 10+ sessions)\n4. Review compliance checklist\n5. Export and review your documents\n\nYou're now ready to begin your journey to approval!",
    icon: Rocket,
    position: 'center',
    tips: [
      "Start with Innovation Score Calculator",
      "Complete one section per day for steady progress",
      "Aim to finish preparation 2 weeks before deadline"
    ],
    category: 'navigation'
  },
  {
    id: "complete",
    title: "Tour Complete - Let's Get Started!",
    description: "Congratulations! You've completed the welcome tour and are now ready to begin your visa application journey. Your dashboard is waiting with personalized recommendations. Remember: consistent progress leads to success. We're here to help you every step of the way!",
    icon: Award,
    targetPage: "/dashboard",
    position: 'center',
    tips: [
      "This tour won't appear again",
      "Access help anytime via FAQ",
      "We're rooting for your success!"
    ],
    category: 'navigation'
  },
];

interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  isActive: boolean;
}

function SpotlightOverlay({ targetRect, isActive }: SpotlightOverlayProps) {
  if (!isActive || !targetRect) {
    return (
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-500" />
    );
  }

  const padding = 12;
  const left = targetRect.left - padding;
  const top = targetRect.top - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={left}
              y={top}
              width={width}
              height={height}
              rx="8"
              ry="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.35)"
          mask="url(#spotlight-mask)"
          className="transition-all duration-500"
        />
      </svg>
      <div
        className="absolute border-2 border-primary rounded-lg animate-pulse pointer-events-none"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}

interface SpotlightTourProps {
  onComplete: () => void;
  onSkip?: () => void;
  isOpen: boolean;
}

// Local storage key for step persistence
const STEP_STORAGE_KEY = 'spotlight-tour-current-step';

export function SpotlightTour({ onComplete, onSkip, isOpen }: SpotlightTourProps) {
  // Load initial step from localStorage to persist across navigation
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem(STEP_STORAGE_KEY);
      return saved ? Math.min(parseInt(saved, 10), COMPREHENSIVE_TOUR_STEPS.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [isVisible, setIsVisible] = useState(isOpen);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  const completeMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/onboarding/complete'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Clean up localStorage on completion
      try {
        localStorage.removeItem(STEP_STORAGE_KEY);
        localStorage.removeItem('spotlight-tour-active');
      } catch {
        // Ignore
      }
    }
  });

  // Persist current step to localStorage
  useEffect(() => {
    if (isVisible) {
      try {
        localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
        localStorage.setItem('spotlight-tour-active', 'true');
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const findAndHighlightElement = useCallback(() => {
    const step = COMPREHENSIVE_TOUR_STEPS[currentStep];
    if (step.targetSelector && step.highlight) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;

    const step = COMPREHENSIVE_TOUR_STEPS[currentStep];
    
    if (step.targetPage) {
      const currentPath = window.location.pathname;
      if (currentPath !== step.targetPage) {
        setLocation(step.targetPage);
        setTimeout(findAndHighlightElement, 500);
        return;
      }
    }

    findAndHighlightElement();
    
    const handleResize = () => findAndHighlightElement();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep, isVisible, setLocation, findAndHighlightElement]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleComplete();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const step = COMPREHENSIVE_TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / COMPREHENSIVE_TOUR_STEPS.length) * 100;
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < COMPREHENSIVE_TOUR_STEPS.length - 1) {
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
    completeMutation.mutate();
    setIsVisible(false);
    // Clean up localStorage
    try {
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem('spotlight-tour-active');
    } catch {
      // Ignore
    }
    onComplete();
  };

  const handleSkip = () => {
    // Do NOT call completeMutation - let user see the tour again next time
    setIsVisible(false);
    // Clean up localStorage but don't mark as completed
    try {
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem('spotlight-tour-active');
    } catch {
      // Ignore
    }
    // Call onSkip if provided, otherwise fall back to onComplete
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const getPositionClasses = () => {
    if (!targetRect || step.position === 'center') {
      return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }

    const padding = 20;
    let classes = 'fixed ';

    switch (step.position) {
      case 'top':
        classes += `left-1/2 -translate-x-1/2`;
        break;
      case 'bottom':
        classes += `left-1/2 -translate-x-1/2`;
        break;
      case 'left':
        classes += `top-1/2 -translate-y-1/2`;
        break;
      case 'right':
        classes += `top-1/2 -translate-y-1/2`;
        break;
      default:
        classes += 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }

    return classes;
  };

  const getPositionStyles = (): React.CSSProperties => {
    if (!targetRect || step.position === 'center') {
      return {};
    }

    const padding = 20;
    const cardWidth = 450;
    const cardHeight = 400;

    switch (step.position) {
      case 'top':
        return { top: `${Math.max(padding, targetRect.top - cardHeight - padding)}px` };
      case 'bottom':
        return { top: `${targetRect.bottom + padding}px` };
      case 'left':
        return { left: `${Math.max(padding, targetRect.left - cardWidth - padding)}px` };
      case 'right':
        return { left: `${Math.min(window.innerWidth - cardWidth - padding, targetRect.right + padding)}px` };
      default:
        return {};
    }
  };

  const categoryColors = {
    navigation: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    tools: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    features: 'bg-green-500/10 text-green-600 dark:text-green-400',
    settings: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} isActive={!!step.highlight && !!targetRect} />
      
      <div 
        ref={cardRef}
        className="fixed z-50 w-[90vw] max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '85vh',
        }}
      >
        <Card className="shadow-2xl border-2 flex flex-col" style={{ maxHeight: '85vh' }}>
          <div className="bg-gradient-to-r from-[#ffa536] to-[#11b6e9] p-0.5 flex-shrink-0">
            <div className="bg-background p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffa536] to-[#11b6e9] flex items-center justify-center shadow-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        Step {currentStep + 1}/{COMPREHENSIVE_TOUR_STEPS.length}
                      </p>
                      {step.category && (
                        <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${categoryColors[step.category]}`}>
                          {step.category}
                        </Badge>
                      )}
                    </div>
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

              <Progress value={progress} className="h-1 mb-3" />
            </div>
          </div>

          <CardContent className="p-4 pt-0 overflow-y-auto flex-1">
            <p className="text-muted-foreground mb-3 leading-relaxed text-sm whitespace-pre-line">
              {step.description}
            </p>

            {step.tips && step.tips.length > 0 && (
              <div className="bg-primary/5 rounded-lg p-2.5 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">Pro Tips</span>
                </div>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.estimatedTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated time: {step.estimatedTime}</span>
              </div>
            )}

            {step.keyboardShortcut && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Keyboard className="w-3.5 h-3.5" />
                <span>{step.keyboardShortcut}</span>
              </div>
            )}

            <div className="flex items-center gap-1 mb-4 flex-wrap">
              {COMPREHENSIVE_TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`transition-all rounded-full ${
                    index === currentStep 
                      ? "w-4 h-1.5 bg-primary" 
                      : index < currentStep 
                        ? "w-1.5 h-1.5 bg-primary/50 hover:bg-primary/70" 
                        : "w-1.5 h-1.5 bg-muted hover:bg-muted-foreground/30"
                  }`}
                  data-testid={`button-spotlight-step-${index}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
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
                {currentStep < COMPREHENSIVE_TOUR_STEPS.length - 1 && (
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip}
                    size="sm"
                    data-testid="button-spotlight-skip"
                  >
                    Skip Tour
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  size="sm"
                  className="bg-gradient-to-r from-[#ffa536] to-[#11b6e9] text-white hover:opacity-90"
                  data-testid="button-spotlight-next"
                >
                  {currentStep === COMPREHENSIVE_TOUR_STEPS.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Start Using App
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Use arrow keys to navigate • ESC to skip
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Persistent tour step storage key
const TOUR_STEP_KEY = 'spotlight-tour-step';
const TOUR_ACTIVE_KEY = 'spotlight-tour-active';

export function useSpotlightTour() {
  // Load initial state from localStorage for persistence across navigation
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

  // Persist tour active state to localStorage
  useEffect(() => {
    try {
      if (showTour) {
        localStorage.setItem(TOUR_ACTIVE_KEY, 'true');
      } else {
        localStorage.removeItem(TOUR_ACTIVE_KEY);
        localStorage.removeItem(TOUR_STEP_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [showTour]);

  useEffect(() => {
    if (isLoading) return;
    
    if (onboardingStatus) {
      // Tour shows for ANY tier (including free) if:
      // 1. Tour has NOT been completed yet
      // 2. AND trigger has been explicitly set (via subscription flow)
      const hasNotCompletedTour = !onboardingStatus.hasCompletedOnboarding;
      
      // Show tour if explicitly triggered AND hasn't completed
      if (shouldTrigger && hasNotCompletedTour) {
        setTimeout(() => setShowTour(true), 500);
      }
      
      // Also check if tour was in progress (user navigated away and came back)
      const tourWasActive = localStorage.getItem(TOUR_ACTIVE_KEY) === 'true';
      if (tourWasActive && hasNotCompletedTour) {
        setShowTour(true);
      }
    }
  }, [onboardingStatus, isLoading, shouldTrigger]);

  const triggerTour = useCallback(() => {
    // Trigger tour for any tier if user hasn't completed it
    if (onboardingStatus && !onboardingStatus.hasCompletedOnboarding) {
      setShouldTrigger(true);
      setTimeout(() => setShowTour(true), 500);
    }
  }, [onboardingStatus]);

  const closeTour = useCallback(() => {
    setShowTour(false);
    setShouldTrigger(false);
    // Clean up localStorage
    try {
      localStorage.removeItem(TOUR_ACTIVE_KEY);
      localStorage.removeItem(TOUR_STEP_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return { 
    showTour, 
    setShowTour, 
    triggerTour,
    closeTour,
    hasCompletedOnboarding: onboardingStatus?.hasCompletedOnboarding ?? true,
    hasPaidPlan: onboardingStatus?.subscriptionTier !== 'free',
    isLoading
  };
}

// Helper to get/set persistent step
export function getTourStep(): number {
  try {
    const step = localStorage.getItem(TOUR_STEP_KEY);
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
}

export function setTourStep(step: number): void {
  try {
    localStorage.setItem(TOUR_STEP_KEY, step.toString());
  } catch {
    // Ignore
  }
}

export default SpotlightTour;
