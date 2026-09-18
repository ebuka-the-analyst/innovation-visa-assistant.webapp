import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ContextualDocumentNotice } from "@/components/ContextualDocumentNotice";
import ThemeToggle from "@/components/ThemeToggle";
import { VoicePermissionProvider } from "@/contexts/VoicePermissionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LogOut, Loader2, LayoutDashboard, Wrench, FileText, HelpCircle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initActivityTracking, trackRouteChange } from "@/lib/activityTracker";
import { useInitGA, useAnalytics, useUserIdentification, useScrollTracking } from "@/hooks/use-analytics";
import { ToolEntitlementGuard } from "@/components/ToolEntitlementGuard";
import { INNOVATOR_FOUNDER_BASE_PATH, innovatorFounderPath, isInnovatorFounderPath } from "@/lib/innovator-founder-routes";

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
const UkVisaRoutes = lazy(() => import("@/pages/uk-visa-routes"));
const CountryVisaRoutes = lazy(() => import("@/pages/country-visa-routes"));
const UsVisaRoutes = () => <CountryVisaRoutes code="us" />;
const CaVisaRoutes = () => <CountryVisaRoutes code="ca" />;
const AuVisaRoutes = () => <CountryVisaRoutes code="au" />;
const DeVisaRoutes = () => <CountryVisaRoutes code="de" />;
const FrVisaRoutes = () => <CountryVisaRoutes code="fr" />;
const NlVisaRoutes = () => <CountryVisaRoutes code="nl" />;
const SgVisaRoutes = () => <CountryVisaRoutes code="sg" />;
const AeVisaRoutes = () => <CountryVisaRoutes code="ae" />;
const NzVisaRoutes = () => <CountryVisaRoutes code="nz" />;
const JpVisaRoutes = () => <CountryVisaRoutes code="jp" />;
const IeVisaRoutes = () => <CountryVisaRoutes code="ie" />;
const PtVisaRoutes = () => <CountryVisaRoutes code="pt" />;
const EsVisaRoutes = () => <CountryVisaRoutes code="es" />;
const SeVisaRoutes = () => <CountryVisaRoutes code="se" />;
const ChVisaRoutes = () => <CountryVisaRoutes code="ch" />;

// Public pages (marketing/auth)
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const MaintenancePage = lazy(() => import("@/pages/maintenance"));
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
const ExpertJoin = lazy(() => import("@/pages/expert-join"));

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
const BlogDashboard = lazy(() => import("@/pages/admin/BlogDashboard"));
const SeoStrategy = lazy(() => import("@/pages/admin/SeoStrategy"));
const AdminAIProviders = lazy(() => import("@/pages/admin/AIProviders"));
const AdminExpertNetwork = lazy(() => import("@/pages/admin/ExpertNetwork"));
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

const INNOVATOR_FOUNDER_PATH = INNOVATOR_FOUNDER_BASE_PATH;
const VISA_ASSISTANT_GLOBAL_HOSTS = new Set(["visaassistant.global", "www.visaassistant.global"]);

function isVisaAssistantGlobalHost() {
  return typeof window !== "undefined" && VISA_ASSISTANT_GLOBAL_HOSTS.has(window.location.hostname.toLowerCase());
}

const INNOVATOR_FOUNDER_PUBLIC_SUBROUTES = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/checkout",
  "/faq",
  "/guide",
  "/privacy",
  "/terms",
  "/cookies",
  "/features",
  "/about",
  "/endorsing-bodies",
  "/eligibility",
  "/business-plan-template",
  "/guide/ultimate-uk-innovator-founder-visa-guide",
  "/blog",
  "/join-expert-network",
  "/ai-transparency",
  "/testing-validation",
];

const SIDEBAR_HIDDEN_ROUTES = ["/", "/uk", "/us", "/ca", "/au", "/de", "/fr", "/nl", "/sg", "/ae", "/nz", "/jp", "/ie", "/pt", "/es", "/se", "/ch", INNOVATOR_FOUNDER_PATH, "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/pricing", "/checkout", "/faq", "/guide", "/privacy", "/terms", "/cookies", "/features", "/about", "/endorsing-bodies", "/eligibility", "/business-plan-template", "/guide/ultimate-uk-innovator-founder-visa-guide", "/blog", "/join-expert-network", ...INNOVATOR_FOUNDER_PUBLIC_SUBROUTES.map(innovatorFounderPath)];
const SIDEBAR_HIDDEN_PREFIXES = ["/blog/", `${INNOVATOR_FOUNDER_PATH}/blog/`];
const CUSTOM_LAYOUT_ROUTES = ["/admin", "/admin-dashboard", "/admin/ai-providers", "/admin/expert-network"];
const OPEN_ACCESS_DASHBOARD_ROUTES = ["/expert-booking", innovatorFounderPath("/expert-booking")];
const PUBLIC_APP_SHELL_ROUTES = ["/ai-transparency"];

const INNOVATOR_FOUNDER_CANONICAL_ROOTS = new Set([
  "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password",
  "/dashboard", "/pricing", "/checkout", "/questionnaire", "/theme-selection",
  "/adaptive-intake", "/generation", "/endorser-comparison", "/document-organizer",
  "/expert-booking", "/join-expert-network", "/rejection-analysis", "/settlement-planning",
  "/features-dashboard", "/kpi-dashboard", "/evidence-graph", "/rfe-defence-lab",
  "/diagnostics", "/settings", "/data-manager", "/tools-hub", "/features",
  "/endorser-investment", "/ai-assistant", "/handoff", "/oracle-supervisor",
  "/founder-autopilot", "/neural-twin", "/voice-builder", "/regulatory-copilot",
  "/economic-impact", "/knowledge-graph", "/referral-dashboard", "/premium-features",
  "/achievements", "/template-library", "/document-review", "/success-stories", "/partner-dashboard",
  "/calendar", "/news", "/interview-prep", "/traction-evidence", "/founder-portfolio",
  "/endorser-cover-letter", "/commercial-validation", "/oisc-compliance",
  "/market-data-verifier", "/mvp-demo-guide", "/financial-resilience", "/visa-prefill",
  "/ai-transparency", "/testing-validation", "/compliance-dashboard", "/faq", "/guide",
  "/privacy", "/terms", "/cookies", "/progress", "/support", "/documents", "/about",
  "/endorsing-bodies", "/eligibility", "/business-plan-template", "/blog"
]);

function shouldStayInInnovatorFounderScope(path: string): boolean {
  if (INNOVATOR_FOUNDER_CANONICAL_ROOTS.has(path)) return true;
  return (
    path.startsWith("/tools/") ||
    path.startsWith("/blog/") ||
    path.startsWith("/guide/")
  );
}

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

interface MaintenanceStatus {
  active: boolean;
  adminBypass: boolean;
  message: string;
  scheduledEnd: string | null;
}

function MaintenanceBoundary({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery<MaintenanceStatus>({
    queryKey: ["/api/maintenance/status"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance/status", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Maintenance status is unavailable");
      return response.json();
    },
    staleTime: 2_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  const adminSignInRequested =
    window.location.pathname === "/login" &&
    new URLSearchParams(window.location.search).get("maintenance-admin") === "1";

  if (isLoading) return <PageLoadingSkeleton />;

  if (data?.active && !data.adminBypass && !adminSignInRequested) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <MaintenancePage
          message={data.message}
          scheduledEnd={data.scheduledEnd}
        />
      </Suspense>
    );
  }

  return <>{children}</>;
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

function entitlementRoute(toolId: string, Component: React.ComponentType) {
  return function EntitlementRoute() {
    return (
      <ToolEntitlementGuard toolId={toolId}>
        <Component />
      </ToolEntitlementGuard>
    );
  };
}

const EntitledEndorserComparison = entitlementRoute("endorser-comparison", EndorserComparison);
const EntitledDocumentOrganizer = entitlementRoute("doc-organizer", DocumentOrganizer);
const EntitledRejectionAnalysis = entitlementRoute("rejection-analysis", RejectionAnalysis);
const EntitledSettlementPlanning = entitlementRoute("settlement-planning", SettlementPlanning);
const EntitledKPIDashboard = entitlementRoute("kpi-dashboard", KPIDashboard);
const EntitledRFEDefenceLab = entitlementRoute("rfe-defense", RFEDefenceLab);
const EntitledOracleSupervisor = entitlementRoute("oracle-supervisor", OracleSupervisor);
const EntitledFounderAutopilot = entitlementRoute("founder-autopilot", FounderAutopilot);
const EntitledNeuralTwin = entitlementRoute("neural-twin", NeuralTwin);
const EntitledVoiceBuilder = entitlementRoute("voice-builder", VoiceBuilder);
const EntitledRegulatoryCopilot = entitlementRoute("regulatory-copilot", RegulatoryCopilot);
const EntitledEconomicImpact = entitlementRoute("economic-impact", EconomicImpact);
const EntitledKnowledgeGraph = entitlementRoute("knowledge-graph", KnowledgeGraph);
const EntitledInterviewPrep = entitlementRoute("interview-prep", InterviewPrep);
const EntitledTractionEvidence = entitlementRoute("traction-evidence", TractionEvidence);
const EntitledFounderPortfolio = entitlementRoute("founder-portfolio", FounderPortfolio);
const EntitledEndorserCoverLetter = entitlementRoute("endorser-cover-letter", EndorserCoverLetter);
const EntitledCommercialValidation = entitlementRoute("commercial-validation", CommercialValidation);
const EntitledOISCCompliance = entitlementRoute("oisc-compliance", OISCCompliance);
const EntitledMarketDataVerifier = entitlementRoute("market-data-verifier", MarketDataVerifier);
const EntitledMVPDemoGuide = entitlementRoute("mvp-demo-guide", MVPDemoGuide);
const EntitledFinancialResilience = entitlementRoute("financial-resilience", FinancialResilience);

const navTabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tools", href: "/tools-hub", icon: Wrench },
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Support", href: "/support", icon: HelpCircle },
];

function HeaderNavTabs() {
  const [location] = useLocation();
  const scoped = isInnovatorFounderPath(location);
  
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navTabs.map((tab) => {
        const href = scoped ? innovatorFounderPath(tab.href) : tab.href;
        const isActive = location === href || (tab.href !== "/dashboard" && location.startsWith(href));
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={href}>
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

function RootLanding() {
  return isVisaAssistantGlobalHost() ? <GlobalLanding /> : <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootLanding} />
      <Route path="/v2" component={GlobalLanding} />
      <Route path="/uk" component={UkVisaRoutes} />
      <Route path="/us" component={UsVisaRoutes} />
      <Route path="/ca" component={CaVisaRoutes} />
      <Route path="/au" component={AuVisaRoutes} />
      <Route path="/de" component={DeVisaRoutes} />
      <Route path="/fr" component={FrVisaRoutes} />
      <Route path="/nl" component={NlVisaRoutes} />
      <Route path="/sg" component={SgVisaRoutes} />
      <Route path="/ae" component={AeVisaRoutes} />
      <Route path="/nz" component={NzVisaRoutes} />
      <Route path="/jp" component={JpVisaRoutes} />
      <Route path="/ie" component={IeVisaRoutes} />
      <Route path="/pt" component={PtVisaRoutes} />
      <Route path="/es" component={EsVisaRoutes} />
      <Route path="/se" component={SeVisaRoutes} />
      <Route path="/ch" component={ChVisaRoutes} />
      <Route path={INNOVATOR_FOUNDER_PATH} component={Home} />
      <Route path={innovatorFounderPath("/login")} component={Login} />
      <Route path={innovatorFounderPath("/signup")} component={Signup} />
      <Route path={innovatorFounderPath("/verify-email")} component={VerifyEmail} />
      <Route path={innovatorFounderPath("/forgot-password")} component={ForgotPassword} />
      <Route path={innovatorFounderPath("/reset-password")} component={ResetPassword} />
      <Route path={innovatorFounderPath("/dashboard")} component={Dashboard} />
      <Route path={innovatorFounderPath("/pricing")} component={Pricing} />
      <Route path={innovatorFounderPath("/checkout")} component={Checkout} />
      <Route path={innovatorFounderPath("/questionnaire")} component={Questionnaire} />
      <Route path={innovatorFounderPath("/theme-selection")} component={ThemeSelection} />
      <Route path={innovatorFounderPath("/adaptive-intake")} component={AdaptiveIntake} />
      <Route path={innovatorFounderPath("/generation")} component={Generation} />
      <Route path={innovatorFounderPath("/endorser-comparison")} component={EntitledEndorserComparison} />
      <Route path={innovatorFounderPath("/document-organizer")} component={EntitledDocumentOrganizer} />
      <Route path={innovatorFounderPath("/expert-booking")} component={ExpertBooking} />
      <Route path={innovatorFounderPath("/join-expert-network")} component={ExpertJoin} />
      <Route path={innovatorFounderPath("/rejection-analysis")} component={EntitledRejectionAnalysis} />
      <Route path={innovatorFounderPath("/settlement-planning")} component={EntitledSettlementPlanning} />
      <Route path={innovatorFounderPath("/features-dashboard")} component={FeaturesDashboard} />
      <Route path={innovatorFounderPath("/kpi-dashboard")} component={EntitledKPIDashboard} />
      <Route path={innovatorFounderPath("/evidence-graph")} component={EvidenceGraph} />
      <Route path={innovatorFounderPath("/rfe-defence-lab")} component={EntitledRFEDefenceLab} />
      <Route path={innovatorFounderPath("/diagnostics")} component={Diagnostics} />
      <Route path={innovatorFounderPath("/settings")} component={Settings} />
      <Route path={innovatorFounderPath("/data-manager")} component={DataModal} />
      <Route path={innovatorFounderPath("/tools-hub")} component={ToolsHub} />
      <Route path={innovatorFounderPath("/tools/:toolId")} component={ToolPage} />
      <Route path={innovatorFounderPath("/features")} component={FeaturesShowcase} />
      <Route path={innovatorFounderPath("/endorser-investment")} component={EndorserInvestmentRequirements} />
      <Route path={innovatorFounderPath("/ai-assistant")} component={AIAssistant} />
      <Route path={innovatorFounderPath("/handoff")} component={Handoff} />
      <Route path={innovatorFounderPath("/partner-dashboard")} component={PartnerDashboard} />
      <Route path={innovatorFounderPath("/oracle-supervisor")} component={EntitledOracleSupervisor} />
      <Route path={innovatorFounderPath("/founder-autopilot")} component={EntitledFounderAutopilot} />
      <Route path={innovatorFounderPath("/neural-twin")} component={EntitledNeuralTwin} />
      <Route path={innovatorFounderPath("/voice-builder")} component={EntitledVoiceBuilder} />
      <Route path={innovatorFounderPath("/regulatory-copilot")} component={EntitledRegulatoryCopilot} />
      <Route path={innovatorFounderPath("/economic-impact")} component={EntitledEconomicImpact} />
      <Route path={innovatorFounderPath("/knowledge-graph")} component={EntitledKnowledgeGraph} />
      <Route path={innovatorFounderPath("/referral-dashboard")} component={ReferralDashboard} />
      <Route path={innovatorFounderPath("/premium-features")} component={PremiumFeatures} />
      <Route path={innovatorFounderPath("/achievements")} component={Achievements} />
      <Route path={innovatorFounderPath("/template-library")} component={TemplateLibrary} />
      <Route path={innovatorFounderPath("/document-review")} component={DocumentReviewPage} />
      <Route path={innovatorFounderPath("/success-stories")} component={SuccessStories} />
      <Route path={innovatorFounderPath("/calendar")} component={CalendarSync} />
      <Route path={innovatorFounderPath("/news")} component={News} />
      <Route path={innovatorFounderPath("/interview-prep")} component={EntitledInterviewPrep} />
      <Route path={innovatorFounderPath("/traction-evidence")} component={EntitledTractionEvidence} />
      <Route path={innovatorFounderPath("/founder-portfolio")} component={EntitledFounderPortfolio} />
      <Route path={innovatorFounderPath("/endorser-cover-letter")} component={EntitledEndorserCoverLetter} />
      <Route path={innovatorFounderPath("/commercial-validation")} component={EntitledCommercialValidation} />
      <Route path={innovatorFounderPath("/oisc-compliance")} component={EntitledOISCCompliance} />
      <Route path={innovatorFounderPath("/market-data-verifier")} component={EntitledMarketDataVerifier} />
      <Route path={innovatorFounderPath("/mvp-demo-guide")} component={EntitledMVPDemoGuide} />
      <Route path={innovatorFounderPath("/financial-resilience")} component={EntitledFinancialResilience} />
      <Route path={innovatorFounderPath("/visa-prefill")} component={VisaPrefillDashboard} />
      <Route path={innovatorFounderPath("/ai-transparency")} component={AITransparency} />
      <Route path={innovatorFounderPath("/testing-validation")} component={TestingValidation} />
      <Route path={innovatorFounderPath("/compliance-dashboard")} component={ComplianceDashboard} />
      <Route path={innovatorFounderPath("/faq")} component={FAQ} />
      <Route path={innovatorFounderPath("/guide")} component={Guide} />
      <Route path={innovatorFounderPath("/privacy")} component={Privacy} />
      <Route path={innovatorFounderPath("/terms")} component={Terms} />
      <Route path={innovatorFounderPath("/cookies")} component={Cookies} />
      <Route path={innovatorFounderPath("/progress")} component={Progress} />
      <Route path={innovatorFounderPath("/support")} component={Support} />
      <Route path={innovatorFounderPath("/documents")} component={Documents} />
      <Route path={innovatorFounderPath("/guide/ultimate-uk-innovator-founder-visa-guide")} component={UltimateGuide} />
      <Route path={innovatorFounderPath("/about")} component={AboutPage} />
      <Route path={innovatorFounderPath("/endorsing-bodies")} component={EndorsingBodiesPage} />
      <Route path={innovatorFounderPath("/eligibility")} component={EligibilityPage} />
      <Route path={innovatorFounderPath("/business-plan-template")} component={BusinessPlanTemplatePage} />
      <Route path={innovatorFounderPath("/blog")} component={BlogPage} />
      <Route path={innovatorFounderPath("/blog/:slug")} component={BlogPostPage} />
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
      <Route path="/endorser-comparison" component={EntitledEndorserComparison} />
      <Route path="/document-organizer" component={EntitledDocumentOrganizer} />
      <Route path="/expert-booking" component={ExpertBooking} />
      <Route path="/join-expert-network" component={ExpertJoin} />
      <Route path="/rejection-analysis" component={EntitledRejectionAnalysis} />
      <Route path="/settlement-planning" component={EntitledSettlementPlanning} />
      <Route path="/features-dashboard" component={FeaturesDashboard} />
      <Route path="/kpi-dashboard" component={EntitledKPIDashboard} />
      <Route path="/evidence-graph" component={EvidenceGraph} />
      <Route path="/rfe-defence-lab" component={EntitledRFEDefenceLab} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/settings" component={Settings} />
      <Route path="/data-manager" component={DataModal} />
      <Route path="/tools-hub" component={ToolsHub} />
      <Route path="/tools/:toolId" component={ToolPage} />
      <Route path="/features" component={FeaturesShowcase} />
      <Route path="/endorser-investment" component={EndorserInvestmentRequirements} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/handoff" component={Handoff} />
      <Route path="/admin/ai-providers" component={AdminAIProviders} />
      <Route path="/admin/expert-network" component={AdminExpertNetwork} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/blog" component={BlogDashboard} />
      <Route path="/admin/seo-strategy" component={SeoStrategy} />
      <Route path="/partner-dashboard" component={PartnerDashboard} />
      <Route path="/oracle-supervisor" component={EntitledOracleSupervisor} />
      <Route path="/founder-autopilot" component={EntitledFounderAutopilot} />
      <Route path="/neural-twin" component={EntitledNeuralTwin} />
      <Route path="/voice-builder" component={EntitledVoiceBuilder} />
      <Route path="/regulatory-copilot" component={EntitledRegulatoryCopilot} />
      <Route path="/economic-impact" component={EntitledEconomicImpact} />
      <Route path="/knowledge-graph" component={EntitledKnowledgeGraph} />
      <Route path="/referral-dashboard" component={ReferralDashboard} />
      <Route path="/premium-features" component={PremiumFeatures} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/template-library" component={TemplateLibrary} />
      <Route path="/document-review" component={DocumentReviewPage} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/calendar" component={CalendarSync} />
      <Route path="/news" component={News} />
      <Route path="/interview-prep" component={EntitledInterviewPrep} />
      <Route path="/traction-evidence" component={EntitledTractionEvidence} />
      <Route path="/founder-portfolio" component={EntitledFounderPortfolio} />
      <Route path="/endorser-cover-letter" component={EntitledEndorserCoverLetter} />
      <Route path="/commercial-validation" component={EntitledCommercialValidation} />
      <Route path="/oisc-compliance" component={EntitledOISCCompliance} />
      <Route path="/market-data-verifier" component={EntitledMarketDataVerifier} />
      <Route path="/mvp-demo-guide" component={EntitledMVPDemoGuide} />
      <Route path="/financial-resilience" component={EntitledFinancialResilience} />
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
      <Route path="/guide/ultimate-uk-innovator-founder-visa-guide" component={UltimateGuide} />
      <Route path="/about" component={AboutPage} />
      <Route path="/endorsing-bodies" component={EndorsingBodiesPage} />
      <Route path="/eligibility" component={EligibilityPage} />
      <Route path="/business-plan-template" component={BusinessPlanTemplatePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UnifiedHeader({ demoMode = false }: { demoMode?: boolean }) {
  const [location, setLocation] = useLocation();
  const scoped = isInnovatorFounderPath(location);
  const routeFor = (path: string) => scoped ? innovatorFounderPath(path) : path;
  
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string; firstName?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
    enabled: !demoMode,
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
        setLocation(routeFor("/login"));
      }
    },
  });

  return (
    <header className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <AnimatedSidebarTrigger />
      <Link href={routeFor("/")}>
        <div className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-header-logo">
          <div className="logo-container overflow-hidden flex items-center">
            <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-8 md:h-10 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
            <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" width="143" height="40" className="h-8 md:h-10 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" loading="lazy" />
          </div>
        </div>
      </Link>
      {!demoMode && (
        <>
          <div className="h-6 w-px bg-border mx-1 hidden md:block" />
          <HeaderNavTabs />
        </>
      )}
      <div className="flex-1" />
      {!demoMode && user && (
        <span className="hidden lg:block text-sm text-muted-foreground">
          {user.firstName || user.displayName || user.email}
        </span>
      )}
      {!demoMode && user && <NotificationBell />}
      <ThemeToggle />
      {demoMode ? (
        <Link href={routeFor("/login")}>
          <Button size="sm" data-testid="button-header-signin">Sign In</Button>
        </Link>
      ) : user ? (
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
      ) : null}
      {!demoMode && !user && (
        <Link href={routeFor("/login?redirect=%2Fexpert-booking")}>
          <Button variant="outline" size="sm" data-testid="button-header-signin">Sign in</Button>
        </Link>
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
  const [location, setLocation] = useLocation();
  const scoped = isInnovatorFounderPath(location);
  const hadCanonicalScope =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("ifva-canonical-scope") === "1";

  useEffect(() => {
    if (typeof window === "undefined" || !isVisaAssistantGlobalHost()) return;

    if (scoped) {
      window.sessionStorage.setItem("ifva-canonical-scope", "1");
      return;
    }

    if (hadCanonicalScope && shouldStayInInnovatorFounderScope(location)) {
      setLocation(innovatorFounderPath(location), { replace: true } as any);
    }
  }, [location, scoped, hadCanonicalScope, setLocation]);

  const redirectingToCanonicalScope =
    isVisaAssistantGlobalHost() &&
    hadCanonicalScope &&
    !scoped &&
    shouldStayInInnovatorFounderScope(location);
  const { data: shellUser } = useQuery<{ id: string }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  const isPublicRoute = SIDEBAR_HIDDEN_ROUTES.includes(location) || 
    SIDEBAR_HIDDEN_PREFIXES.some(prefix => location.startsWith(prefix));
  const isCustomLayoutRoute = CUSTOM_LAYOUT_ROUTES.includes(location);
  const isOpenAccessDashboardRoute = OPEN_ACCESS_DASHBOARD_ROUTES.includes(location);
  const isPublicAppShellRoute = PUBLIC_APP_SHELL_ROUTES.includes(location);
  const { data: publicShellUser, isLoading: publicShellAuthLoading } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useActivityTracker();

  if (redirectingToCanonicalScope) {
    return <PageLoadingSkeleton />;
  }

  if (isPublicAppShellRoute) {
    if (publicShellAuthLoading) {
      return <PageLoadingSkeleton />;
    }

    const demoMode = !publicShellUser;

    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar demoMode={demoMode} />
          <div className="flex flex-col flex-1 w-full">
            <UnifiedHeader demoMode={demoMode} />
            <main className="flex-1 overflow-auto">
              {!demoMode && <ContextualDocumentNotice />}
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Router />
              </Suspense>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isOpenAccessDashboardRoute) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar publicMode={!shellUser} />
          <div className="flex flex-col flex-1 w-full min-w-0">
            <UnifiedHeader />
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<PageLoadingSkeleton />}>
                <Router />
              </Suspense>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isPublicRoute) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Router />
      </Suspense>
    );
  }

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
              <ContextualDocumentNotice />
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

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useInitGA();
  useAnalytics();
  useScrollTracking();
  return <>{children}</>;
}

function CountryWidgets() {
  const [location] = useLocation();
  const isGlobalLanding = location === "/v2" || (location === "/" && isVisaAssistantGlobalHost());
  
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
        <LanguageProvider>
          <AnalyticsProvider>
            <VoicePermissionProvider>
              <TooltipProvider>
                <MaintenanceBoundary>
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
                </MaintenanceBoundary>
              </TooltipProvider>
            </VoicePermissionProvider>
          </AnalyticsProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;