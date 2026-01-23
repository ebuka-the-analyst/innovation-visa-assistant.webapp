import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ThemeToggle from "@/components/ThemeToggle";
import { VoicePermissionProvider } from "@/contexts/VoicePermissionContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LogOut, Loader2, LayoutDashboard, Wrench, FileText, HelpCircle } from "lucide-react";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initActivityTracking, trackRouteChange } from "@/lib/activityTracker";
import { useInitGA, useAnalytics, useUserIdentification, useScrollTracking } from "@/hooks/use-analytics";

// Lazy load ChatBot, FloatingFeedback and other heavy components
const ChatBot = lazy(() => import("@/components/ChatBot"));
const FloatingFeedback = lazy(() => import("@/components/FloatingFeedback"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));
const ToolsChronographWheel = lazy(() => import("@/components/ToolsChronographWheel"));
// Black November banner removed - promotion ended
const SiteFeedbackPopup = lazy(() => import("@/components/SiteFeedbackPopup").then(m => ({ default: m.SiteFeedbackPopup })));

// ============ LAZY LOADED PAGES ============
// Global landing page
const GlobalLanding = lazy(() => import("@/pages/global-landing"));

// Public pages (marketing/auth)
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Checkout = lazy(() => import("@/pages/checkout"));
const FAQ = lazy(() => import("@/pages/faq"));
const Guide = lazy(() => import("@/pages/guide"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Cookies = lazy(() => import("@/pages/cookies"));
const FeaturesShowcase = lazy(() => import("@/pages/features-showcase"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Core authenticated pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Questionnaire = lazy(() => import("@/pages/questionnaire"));
const Generation = lazy(() => import("@/pages/generation"));
const Settings = lazy(() => import("@/pages/settings"));
const Progress = lazy(() => import("@/pages/progress"));
const Support = lazy(() => import("@/pages/support"));
const Documents = lazy(() => import("@/pages/documents"));

// Tools and resources
const ToolsHub = lazy(() => import("@/pages/tools-hub"));
const ToolPage = lazy(() => import("@/pages/tool-page"));
const EndorserComparison = lazy(() => import("@/pages/endorser-comparison"));
const EndorserInvestmentRequirements = lazy(() => import("@/pages/endorser-investment-requirements"));
const DocumentOrganizer = lazy(() => import("@/pages/document-organizer"));
const ExpertBooking = lazy(() => import("@/pages/expert-booking"));

// Analysis and diagnostics
const RejectionAnalysis = lazy(() => import("@/pages/rejection-analysis"));
const Diagnostics = lazy(() => import("@/pages/diagnostics"));
const EvidenceGraph = lazy(() => import("@/pages/evidence-graph"));
const RFEDefenceLab = lazy(() => import("@/pages/rfe-defence-lab"));

// Strategy and planning
const SettlementPlanning = lazy(() => import("@/pages/settlement-planning"));
const InterviewPrep = lazy(() => import("@/pages/interview-prep"));
const AIAssistant = lazy(() => import("@/pages/ai-assistant"));
const Handoff = lazy(() => import("@/pages/handoff"));
const AdaptiveIntake = lazy(() => import("@/pages/adaptive-intake"));
const ThemeSelection = lazy(() => import("@/pages/theme-selection"));

// Evidence and Endorser Preparation
const TractionEvidence = lazy(() => import("@/pages/traction-evidence"));
const FounderPortfolio = lazy(() => import("@/pages/founder-portfolio"));
const EndorserCoverLetter = lazy(() => import("@/pages/endorser-cover-letter"));
const CommercialValidation = lazy(() => import("@/pages/commercial-validation"));
const OISCCompliance = lazy(() => import("@/pages/oisc-compliance"));
const MarketDataVerifier = lazy(() => import("@/pages/market-data-verifier"));
const MVPDemoGuide = lazy(() => import("@/pages/mvp-demo-guide"));
const FinancialResilience = lazy(() => import("@/pages/financial-resilience"));

// Dashboards and analytics
const FeaturesDashboard = lazy(() => import("@/pages/features-dashboard"));
const KPIDashboard = lazy(() => import("@/pages/kpi-dashboard"));
const DataModal = lazy(() => import("@/pages/data-modal"));
const ReferralDashboard = lazy(() => import("@/pages/referral-dashboard"));
const PremiumFeatures = lazy(() => import("@/pages/premium-features"));
const Achievements = lazy(() => import("@/pages/achievements"));
const TemplateLibrary = lazy(() => import("@/pages/template-library"));
const DocumentReviewPage = lazy(() => import("@/pages/document-review"));
const SuccessStories = lazy(() => import("@/pages/success-stories"));
const CalendarSync = lazy(() => import("@/pages/calendar-sync"));
const News = lazy(() => import("@/pages/news"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const PartnerDashboard = lazy(() => import("@/pages/partner-dashboard"));

// OMNI - Advanced AI Features
const OracleSupervisor = lazy(() => import("@/pages/oracle-supervisor"));
const FounderAutopilot = lazy(() => import("@/pages/founder-autopilot"));
const NeuralTwin = lazy(() => import("@/pages/neural-twin"));
const VoiceBuilder = lazy(() => import("@/pages/voice-builder"));
const RegulatoryCopilot = lazy(() => import("@/pages/regulatory-copilot"));
const EconomicImpact = lazy(() => import("@/pages/economic-impact"));
const KnowledgeGraph = lazy(() => import("@/pages/knowledge-graph"));

// Visa Application Prefill
const VisaPrefillDashboard = lazy(() => import("@/pages/visa-prefill-dashboard"));

// Legal & Compliance Pages
const AITransparency = lazy(() => import("@/pages/ai-transparency"));
const TestingValidation = lazy(() => import("@/pages/testing-validation"));
const ComplianceDashboard = lazy(() => import("@/pages/compliance-dashboard"));

// SEO Landing Pages
const UltimateGuide = lazy(() => import("@/pages/seo/ultimate-guide"));
const AboutPage = lazy(() => import("@/pages/seo/about"));
const EndorsingBodiesPage = lazy(() => import("@/pages/seo/endorsing-bodies"));
const EligibilityPage = lazy(() => import("@/pages/seo/eligibility"));
const BusinessPlanTemplatePage = lazy(() => import("@/pages/seo/business-plan-template"));

// Blog
const BlogPage = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));

const SIDEBAR_HIDDEN_ROUTES = ["/", "/uk", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/pricing", "/checkout", "/faq", "/guide", "/privacy", "/terms", "/cookies", "/features", "/about", "/endorsing-bodies", "/eligibility", "/business-plan-template", "/guide/ultimate-uk-innovator-founder-visa-guide", "/blog"];
const SIDEBAR_HIDDEN_PREFIXES = ["/blog/"];
const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard"];

// Optimized loading skeleton
function PageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AnimatedSidebarTrigger() {
  const { state, toggleSidebar } = useSidebar();
  const isOpen = state === "expanded";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          data-testid="button-sidebar-toggle"
          className="-ml-1 md:-ml-2 h-8 md:h-9 w-8 md:w-9 flex items-center justify-center group relative overflow-visible"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-5 h-5 transition-transform duration-200" />
          )}
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isOpen ? 'Close sidebar' : 'Open sidebar'}
      </TooltipContent>
    </Tooltip>
  );
}

const navTabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tools", href: "/tools-hub", icon: Wrench },
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Support", href: "/support", icon: HelpCircle },
];

function HeaderNavTabs() {
  const [location] = useLocation();
  
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navTabs.map((tab) => {
        const isActive = location === tab.href || (tab.href !== "/dashboard" && location.startsWith(tab.href));
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={`gap-1.5 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
              data-testid={`nav-tab-${tab.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={GlobalLanding} />
      <Route path="/uk" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/questionnaire" component={Questionnaire} />
      <Route path="/theme-selection" component={ThemeSelection} />
      <Route path="/adaptive-intake" component={AdaptiveIntake} />
      <Route path="/generation" component={Generation} />
      <Route path="/endorser-comparison" component={EndorserComparison} />
      <Route path="/document-organizer" component={DocumentOrganizer} />
      <Route path="/expert-booking" component={ExpertBooking} />
      <Route path="/rejection-analysis" component={RejectionAnalysis} />
      <Route path="/settlement-planning" component={SettlementPlanning} />
      <Route path="/features-dashboard" component={FeaturesDashboard} />
      <Route path="/kpi-dashboard" component={KPIDashboard} />
      <Route path="/evidence-graph" component={EvidenceGraph} />
      <Route path="/rfe-defence-lab" component={RFEDefenceLab} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/settings" component={Settings} />
      <Route path="/data-manager" component={DataModal} />
      <Route path="/tools-hub" component={ToolsHub} />
      <Route path="/tools/:toolId" component={ToolPage} />
      <Route path="/features" component={FeaturesShowcase} />
      <Route path="/endorser-investment" component={EndorserInvestmentRequirements} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/handoff" component={Handoff} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/partner-dashboard" component={PartnerDashboard} />
      
      {/* OMNI Routes */}
      <Route path="/oracle-supervisor" component={OracleSupervisor} />
      <Route path="/founder-autopilot" component={FounderAutopilot} />
      <Route path="/neural-twin" component={NeuralTwin} />
      <Route path="/voice-builder" component={VoiceBuilder} />
      <Route path="/regulatory-copilot" component={RegulatoryCopilot} />
      <Route path="/economic-impact" component={EconomicImpact} />
      <Route path="/knowledge-graph" component={KnowledgeGraph} />
      <Route path="/referral-dashboard" component={ReferralDashboard} />
      <Route path="/premium-features" component={PremiumFeatures} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/template-library" component={TemplateLibrary} />
      <Route path="/document-review" component={DocumentReviewPage} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/calendar" component={CalendarSync} />
      <Route path="/news" component={News} />
      <Route path="/interview-prep" component={InterviewPrep} />
      <Route path="/traction-evidence" component={TractionEvidence} />
      <Route path="/founder-portfolio" component={FounderPortfolio} />
      <Route path="/endorser-cover-letter" component={EndorserCoverLetter} />
      <Route path="/commercial-validation" component={CommercialValidation} />
      <Route path="/oisc-compliance" component={OISCCompliance} />
      <Route path="/market-data-verifier" component={MarketDataVerifier} />
      <Route path="/mvp-demo-guide" component={MVPDemoGuide} />
      <Route path="/financial-resilience" component={FinancialResilience} />
      <Route path="/visa-prefill" component={VisaPrefillDashboard} />
      <Route path="/ai-transparency" component={AITransparency} />
      <Route path="/testing-validation" component={TestingValidation} />
      <Route path="/compliance-dashboard" component={ComplianceDashboard} />
      <Route path="/faq" component={FAQ} />
      <Route path="/guide" component={Guide} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/progress" component={Progress} />
      <Route path="/support" component={Support} />
      <Route path="/documents" component={Documents} />
      
      {/* SEO Landing Pages */}
      <Route path="/guide/ultimate-uk-innovator-founder-visa-guide" component={UltimateGuide} />
      <Route path="/about" component={AboutPage} />
      <Route path="/endorsing-bodies" component={EndorsingBodiesPage} />
      <Route path="/eligibility" component={EligibilityPage} />
      <Route path="/business-plan-template" component={BusinessPlanTemplatePage} />
      
      {/* Blog */}
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function UnifiedHeader() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string; firstName?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.clear();
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setLocation("/login");
      }
    },
  });

  return (
    <header className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <AnimatedSidebarTrigger />
      
      <Link href="/">
        <div className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-header-logo">
          <div className="logo-container overflow-hidden flex items-center">
            <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-8 md:h-10 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
            <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-8 md:h-10 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
          </div>
        </div>
      </Link>
      
      <div className="h-6 w-px bg-border mx-1 hidden md:block" />
      
      <HeaderNavTabs />
      
      <div className="flex-1" />
      
      {user && (
        <span className="hidden lg:block text-sm text-muted-foreground">
          {user.firstName || user.displayName || user.email}
        </span>
      )}
      
      <ThemeToggle />
      
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-header-logout"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      )}
    </header>
  );
}

function useActivityTracker() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);
  const { data: user } = useQuery<{ id: string }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (user?.id) {
      initActivityTracking();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && location !== prevLocationRef.current) {
      trackRouteChange(location, document.title);
      prevLocationRef.current = location;
    }
  }, [location, user?.id]);
}

function AppLayout() {
  const [location] = useLocation();
  const isPublicRoute = SIDEBAR_HIDDEN_ROUTES.includes(location) || 
    SIDEBAR_HIDDEN_PREFIXES.some(prefix => location.startsWith(prefix));
  const isCustomLayoutRoute = CUSTOM_LAYOUT_ROUTES.includes(location);

  useActivityTracker();

  if (isPublicRoute) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Router />
      </Suspense>
    );
  }

  // Admin pages have their own sidebar layout
  if (isCustomLayoutRoute) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Router />
        </Suspense>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 w-full">
            <UnifiedHeader />
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Router />
              </Suspense>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

// Google Analytics + Page Tracking component
function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useInitGA(); // Initialize Google Analytics on app load
  useAnalytics(); // Track page views on route changes
  useScrollTracking(); // Track scroll depth for engagement metrics
  return <>{children}</>;
}

// Wrapper to conditionally show country-specific widgets (not on global landing)
function CountryWidgets() {
  const [location] = useLocation();
  // Only show ToolsChronographWheel on country pages, not on global landing
  // ChatBot shows everywhere
  const isGlobalLanding = location === "/";
  
  return (
    <Suspense fallback={null}>
      <ChatBot />
      {!isGlobalLanding && <ToolsChronographWheel />}
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AnalyticsProvider>
          <VoicePermissionProvider>
            <TooltipProvider>
              <CountryWidgets />
              <Suspense fallback={null}>
                <FloatingFeedback />
                <SiteFeedbackPopup />
              </Suspense>
              <Toaster />
              <AppLayout />
              <Suspense fallback={null}>
                <CookieConsent />
              </Suspense>
            </TooltipProvider>
          </VoicePermissionProvider>
        </AnalyticsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
