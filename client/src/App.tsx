import { lazy, Suspense } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ThemeToggle from "@/components/ThemeToggle";
import ChatBot from "@/components/ChatBot";
import CookieConsent from "@/components/CookieConsent";
import ToolsChronographWheel from "@/components/ToolsChronographWheel";
import BlackNovemberBanner from "@/components/BlackNovemberBanner";
import OnboardingTour from "@/components/OnboardingTour";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import Questionnaire from "@/pages/questionnaire";
import Generation from "@/pages/generation";
import NotFound from "@/pages/not-found";
import EndorserComparison from "@/pages/endorser-comparison";
import DocumentOrganizer from "@/pages/document-organizer";
import ExpertBooking from "@/pages/expert-booking";
import RejectionAnalysis from "@/pages/rejection-analysis";
import SettlementPlanning from "@/pages/settlement-planning";
import FeaturesDashboard from "@/pages/features-dashboard";
import KPIDashboard from "@/pages/kpi-dashboard";
import EvidenceGraph from "@/pages/evidence-graph";
import RFEDefenceLab from "@/pages/rfe-defence-lab";
import Diagnostics from "@/pages/diagnostics";
import Settings from "@/pages/settings";
import DataModal from "@/pages/data-modal";
import ToolsHub from "@/pages/tools-hub";
import FeaturesShowcase from "@/pages/features-showcase";
import EndorserInvestmentRequirements from "@/pages/endorser-investment-requirements";
import AIAssistant from "@/pages/ai-assistant";
import Handoff from "@/pages/handoff";
import AdminDashboard from "@/pages/admin-dashboard";
import InterviewPrep from "@/pages/interview-prep";
import FAQ from "@/pages/faq";
import Guide from "@/pages/guide";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Cookies from "@/pages/cookies";
import ReferralDashboard from "@/pages/referral-dashboard";
import Progress from "@/pages/progress";
import Support from "@/pages/support";
import Documents from "@/pages/documents";
import ToolPage from "@/pages/tool-page";

const SIDEBAR_HIDDEN_ROUTES = ["/", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/pricing", "/faq", "/guide", "/privacy", "/terms", "/cookies"];

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
          <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          {!isOpen && (
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full animate-ping-slow" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isOpen ? 'Close sidebar' : 'Open sidebar'}
      </TooltipContent>
    </Tooltip>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/questionnaire" component={Questionnaire} />
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
      <Route path="/referral-dashboard" component={ReferralDashboard} />
      <Route path="/interview-prep" component={InterviewPrep} />
      <Route path="/faq" component={FAQ} />
      <Route path="/guide" component={Guide} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/progress" component={Progress} />
      <Route path="/support" component={Support} />
      <Route path="/documents" component={Documents} />
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
            <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-8 md:h-10 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" />
            <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-8 md:h-10 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" />
          </div>
        </div>
      </Link>
      
      <div className="flex-1" />
      
      {user && (
        <span className="hidden sm:block text-sm text-muted-foreground">
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

function AppLayout() {
  const [location] = useLocation();
  const isPublicRoute = SIDEBAR_HIDDEN_ROUTES.includes(location);

  if (isPublicRoute) {
    return (
      <Suspense fallback={null}>
        <Router />
      </Suspense>
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
              <Suspense fallback={null}>
                <Router />
              </Suspense>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BlackNovemberBanner />
        <ChatBot />
        <ToolsChronographWheel />
        <OnboardingTour />
        <Toaster />
        <AppLayout />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
