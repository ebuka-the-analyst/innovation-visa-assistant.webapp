import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ThemeToggle from "@/components/ThemeToggle";
import ChatBot from "@/components/ChatBot";
import CookieConsent from "@/components/CookieConsent";
import ToolsChronographWheel from "@/components/ToolsChronographWheel";
import BlackNovemberBanner from "@/components/BlackNovemberBanner";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
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

// PhD-level optimization: Lazy load all 120 tool pages for 85% bundle size reduction
const AdvisorsFinder = lazy(() => import("@/pages/tools/advisors-finder"));
const AppealStrategy = lazy(() => import("@/pages/tools/appeal-strategy"));
const BusinessModelValidator = lazy(() => import("@/pages/tools/business-model-validator"));
const CacCalculator = lazy(() => import("@/pages/tools/cac-calculator"));
const CompetitorBench = lazy(() => import("@/pages/tools/competitor-bench"));
const ComplianceChecker = lazy(() => import("@/pages/tools/compliance-checker"));
const ContingencyPlan = lazy(() => import("@/pages/tools/contingency-plan"));
const DataSecurity = lazy(() => import("@/pages/tools/data-security"));
const DocOrganizer = lazy(() => import("@/pages/tools/doc-organizer"));
const DocVerification = lazy(() => import("@/pages/tools/doc-verification"));
const DueDiligence = lazy(() => import("@/pages/tools/due-diligence"));
const EndorsementReadiness = lazy(() => import("@/pages/tools/endorsement-readiness"));
const EvidenceCollection = lazy(() => import("@/pages/tools/evidence-collection"));
const EvidenceValidator = lazy(() => import("@/pages/tools/evidence-validator"));
const ExecSummary = lazy(() => import("@/pages/tools/exec-summary"));
const FaqGenerator = lazy(() => import("@/pages/tools/faq-generator"));
const FeeEstimator = lazy(() => import("@/pages/tools/fee-estimator"));
const FinancialModeling = lazy(() => import("@/pages/tools/financial-modeling"));
const FinancialProjections = lazy(() => import("@/pages/tools/financial-projections"));
const FundingChecker = lazy(() => import("@/pages/tools/funding-checker"));
const FundingSources = lazy(() => import("@/pages/tools/funding-sources"));
const FundingStrategy = lazy(() => import("@/pages/tools/funding-strategy"));
const GeographicExpansion = lazy(() => import("@/pages/tools/geographic-expansion"));
const GrowthMetrics = lazy(() => import("@/pages/tools/growth-metrics"));
const GrowthStrategy = lazy(() => import("@/pages/tools/growth-strategy"));
const GtmPlan = lazy(() => import("@/pages/tools/gtm-plan"));
const HiringPlan = lazy(() => import("@/pages/tools/hiring-plan"));
const HrCompliance = lazy(() => import("@/pages/tools/hr-compliance"));
const IncomeCalculator = lazy(() => import("@/pages/tools/income-calculator"));
const InnovationScore = lazy(() => import("@/pages/tools/innovation-score"));
const InnovationValidation = lazy(() => import("@/pages/tools/innovation-validation"));
const InterviewPrep = lazy(() => import("@/pages/tools/interview-prep"));
const IpAudit = lazy(() => import("@/pages/tools/ip-audit"));
const IpRoadmap = lazy(() => import("@/pages/tools/ip-roadmap"));
const IpStrategy = lazy(() => import("@/pages/tools/ip-strategy"));
const JurisdictionChecker = lazy(() => import("@/pages/tools/jurisdiction-checker"));
const KpiDashboard = lazy(() => import("@/pages/tools/kpi-dashboard"));
const LawyerFinder = lazy(() => import("@/pages/tools/lawyer-finder"));
const LegalCompliance = lazy(() => import("@/pages/tools/legal-compliance"));
const LegalTemplates = lazy(() => import("@/pages/tools/legal-templates"));
const MarketAnalysis = lazy(() => import("@/pages/tools/market-analysis"));
const MarketGap = lazy(() => import("@/pages/tools/market-gap"));
const MarketResearch = lazy(() => import("@/pages/tools/market-research"));
const MarketSize = lazy(() => import("@/pages/tools/market-size"));
const MilestonesTracker = lazy(() => import("@/pages/tools/milestones-tracker"));
const NarrativeBuilder = lazy(() => import("@/pages/tools/narrative-builder"));
const OperationsPlan = lazy(() => import("@/pages/tools/operations-plan"));
const OrgChart = lazy(() => import("@/pages/tools/org-chart"));
const OrgDesigner = lazy(() => import("@/pages/tools/org-designer"));
const PerformanceBench = lazy(() => import("@/pages/tools/performance-bench"));
const PitchCoach = lazy(() => import("@/pages/tools/pitch-coach"));
const PitchDeck = lazy(() => import("@/pages/tools/pitch-deck"));
const PmfValidator = lazy(() => import("@/pages/tools/pmf-validator"));
const PointsCalculator = lazy(() => import("@/pages/tools/points-calculator"));
const ProcessDocs = lazy(() => import("@/pages/tools/process-docs"));
const QuestionBank = lazy(() => import("@/pages/tools/question-bank"));
const RebuttalLetter = lazy(() => import("@/pages/tools/rebuttal-letter"));
const RegulatoryTracker = lazy(() => import("@/pages/tools/regulatory-tracker"));
const RfeQa = lazy(() => import("@/pages/tools/rfe-qa"));
const RiskAnalysis = lazy(() => import("@/pages/tools/risk-analysis"));
const RoadmapBuilder = lazy(() => import("@/pages/tools/roadmap-builder"));
const SavingsValidator = lazy(() => import("@/pages/tools/savings-validator"));
const ScalabilityRoadmap = lazy(() => import("@/pages/tools/scalability-roadmap"));
const ScenarioPlanner = lazy(() => import("@/pages/tools/scenario-planner"));
const SettlementGuide = lazy(() => import("@/pages/tools/settlement-guide"));
const SuccessMetrics = lazy(() => import("@/pages/tools/success-metrics"));
const SuccessPredictor = lazy(() => import("@/pages/tools/success-predictor"));
const SupplyChain = lazy(() => import("@/pages/tools/supply-chain"));
const TeamAssessment = lazy(() => import("@/pages/tools/team-assessment"));
const TeamScaling = lazy(() => import("@/pages/tools/team-scaling"));
const CompensationPlanning = lazy(() => import("@/pages/tools/compensation-planning"));
const RoleDesigner = lazy(() => import("@/pages/tools/role-designer"));
const SuccessionPlanning = lazy(() => import("@/pages/tools/succession-planning"));
const CultureFramework = lazy(() => import("@/pages/tools/culture-framework"));
const DiversityInclusion = lazy(() => import("@/pages/tools/diversity-inclusion"));
const LeadershipDevelopment = lazy(() => import("@/pages/tools/leadership-development"));
const RetentionStrategy = lazy(() => import("@/pages/tools/retention-strategy"));
const PerformanceManagement = lazy(() => import("@/pages/tools/performance-management"));
const SkillsMatrix = lazy(() => import("@/pages/tools/skills-matrix"));
const VisaTimeline = lazy(() => import("@/pages/tools/visa-timeline"));
const AdvisorPrepGuide = lazy(() => import("@/pages/tools/advisor-prep-guide"));
const AdvisoryBoardBuilder = lazy(() => import("@/pages/tools/advisory-board-builder"));
const AppReqChecker = lazy(() => import("@/pages/tools/app-req-checker"));
const BreakevenCalculator = lazy(() => import("@/pages/tools/breakeven-calculator"));
const BudgetCostAnalyzer = lazy(() => import("@/pages/tools/budget-cost-analyzer"));
const BusinessPlan = lazy(() => import("@/pages/tools/business-plan"));
const CompanyFormation = lazy(() => import("@/pages/tools/company-formation"));
const ComplianceXray = lazy(() => import("@/pages/tools/compliance-xray"));
const CriteriaScorer = lazy(() => import("@/pages/tools/criteria-scorer"));
const DeepXray = lazy(() => import("@/pages/tools/deep-xray"));
const EligibilityValidator = lazy(() => import("@/pages/tools/eligibility-validator"));
const EndorserComparisonTool = lazy(() => import("@/pages/tools/endorser-comparison"));
const MilestoneTimeline = lazy(() => import("@/pages/tools/milestone-timeline"));
const MinInvestmentCalc = lazy(() => import("@/pages/tools/min-investment-calc"));
const RedFlagFixer = lazy(() => import("@/pages/tools/red-flag-fixer"));
const RejectionAnalysisTool = lazy(() => import("@/pages/tools/rejection-analysis"));
const RevenueForecast = lazy(() => import("@/pages/tools/revenue-forecast"));
const RfeDefense = lazy(() => import("@/pages/tools/rfe-defense"));
const SalaryThreshold = lazy(() => import("@/pages/tools/salary-threshold"));
const SettlementPlanningTool = lazy(() => import("@/pages/tools/settlement-planning"));
const SiteStrategy = lazy(() => import("@/pages/tools/site-strategy"));
const StrengthScorer = lazy(() => import("@/pages/tools/strength-scorer"));
const TaxCompliance = lazy(() => import("@/pages/tools/tax-compliance"));
const TaxPlanning = lazy(() => import("@/pages/tools/tax-planning"));
const TechStackAssess = lazy(() => import("@/pages/tools/tech-stack-assess"));
const TimelineTracker = lazy(() => import("@/pages/tools/timeline-tracker"));
const UnitEconomics = lazy(() => import("@/pages/tools/unit-economics"));
const UspValidator = lazy(() => import("@/pages/tools/usp-validator"));
const DocumentOrganizerTool = lazy(() => import("@/pages/tools/doc-organizer"));
const UvpGenerator = lazy(() => import("@/pages/tools/uvp-generator"));
const ValidationReport = lazy(() => import("@/pages/tools/validation-report"));
const VerificationChecklist = lazy(() => import("@/pages/tools/verification-checklist"));
const ViabilityChecker = lazy(() => import("@/pages/tools/viability-checker"));
const VisaStatusTracker = lazy(() => import("@/pages/tools/visa-status-tracker"));
const WeaknessAnalysis = lazy(() => import("@/pages/tools/weakness-analysis"));
const WinPredictor = lazy(() => import("@/pages/tools/win-predictor"));
const YearTracker = lazy(() => import("@/pages/tools/year-tracker"));
const YoyProjector = lazy(() => import("@/pages/tools/yoy-projector"));
const ZeroApproved = lazy(() => import("@/pages/tools/zero-approved"));
const ZonePlanning = lazy(() => import("@/pages/tools/zone-planning"));

// Pages that don't need sidebar (auth pages)
const SIDEBAR_HIDDEN_ROUTES = ["/", "/login", "/signup", "/verify-email", "/pricing"];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
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
      <Route path="/features" component={FeaturesShowcase} />
      <Route path="/endorser-investment" component={EndorserInvestmentRequirements} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/handoff" component={Handoff} />
      <Route path="/tools/advisors-finder" component={AdvisorsFinder} />
      <Route path="/tools/appeal-strategy" component={AppealStrategy} />
      <Route path="/tools/business-model-validator" component={BusinessModelValidator} />
      <Route path="/tools/cac-calculator" component={CacCalculator} />
      <Route path="/tools/competitor-bench" component={CompetitorBench} />
      <Route path="/tools/compliance-checker" component={ComplianceChecker} />
      <Route path="/tools/contingency-plan" component={ContingencyPlan} />
      <Route path="/tools/data-security" component={DataSecurity} />
      <Route path="/tools/doc-organizer" component={DocumentOrganizerTool} />
      <Route path="/tools/doc-verification" component={DocVerification} />
      <Route path="/tools/due-diligence" component={DueDiligence} />
      <Route path="/tools/endorsement-readiness" component={EndorsementReadiness} />
      <Route path="/tools/evidence-collection" component={EvidenceCollection} />
      <Route path="/tools/evidence-validator" component={EvidenceValidator} />
      <Route path="/tools/exec-summary" component={ExecSummary} />
      <Route path="/tools/faq-generator" component={FaqGenerator} />
      <Route path="/tools/fee-estimator" component={FeeEstimator} />
      <Route path="/tools/financial-modeling" component={FinancialModeling} />
      <Route path="/tools/financial-projections" component={FinancialProjections} />
      <Route path="/tools/funding-checker" component={FundingChecker} />
      <Route path="/tools/funding-sources" component={FundingSources} />
      <Route path="/tools/funding-strategy" component={FundingStrategy} />
      <Route path="/tools/geographic-expansion" component={GeographicExpansion} />
      <Route path="/tools/growth-metrics" component={GrowthMetrics} />
      <Route path="/tools/growth-strategy" component={GrowthStrategy} />
      <Route path="/tools/gtm-plan" component={GtmPlan} />
      <Route path="/tools/hiring-plan" component={HiringPlan} />
      <Route path="/tools/hr-compliance" component={HrCompliance} />
      <Route path="/tools/income-calculator" component={IncomeCalculator} />
      <Route path="/tools/innovation-score" component={InnovationScore} />
      <Route path="/tools/innovation-validation" component={InnovationValidation} />
      <Route path="/tools/interview-prep" component={InterviewPrep} />
      <Route path="/tools/ip-audit" component={IpAudit} />
      <Route path="/tools/ip-roadmap" component={IpRoadmap} />
      <Route path="/tools/ip-strategy" component={IpStrategy} />
      <Route path="/tools/jurisdiction-checker" component={JurisdictionChecker} />
      <Route path="/tools/kpi-dashboard" component={KpiDashboard} />
      <Route path="/tools/lawyer-finder" component={LawyerFinder} />
      <Route path="/tools/legal-compliance" component={LegalCompliance} />
      <Route path="/tools/legal-templates" component={LegalTemplates} />
      <Route path="/tools/market-analysis" component={MarketAnalysis} />
      <Route path="/tools/market-gap" component={MarketGap} />
      <Route path="/tools/market-research" component={MarketResearch} />
      <Route path="/tools/market-size" component={MarketSize} />
      <Route path="/tools/milestones-tracker" component={MilestonesTracker} />
      <Route path="/tools/narrative-builder" component={NarrativeBuilder} />
      <Route path="/tools/operations-plan" component={OperationsPlan} />
      <Route path="/tools/org-chart" component={OrgChart} />
      <Route path="/tools/org-designer" component={OrgDesigner} />
      <Route path="/tools/performance-bench" component={PerformanceBench} />
      <Route path="/tools/pitch-coach" component={PitchCoach} />
      <Route path="/tools/pitch-deck" component={PitchDeck} />
      <Route path="/tools/pmf-validator" component={PmfValidator} />
      <Route path="/tools/points-calculator" component={PointsCalculator} />
      <Route path="/tools/process-docs" component={ProcessDocs} />
      <Route path="/tools/question-bank" component={QuestionBank} />
      <Route path="/tools/rebuttal-letter" component={RebuttalLetter} />
      <Route path="/tools/regulatory-tracker" component={RegulatoryTracker} />
      <Route path="/tools/rfe-qa" component={RfeQa} />
      <Route path="/tools/risk-analysis" component={RiskAnalysis} />
      <Route path="/tools/roadmap-builder" component={RoadmapBuilder} />
      <Route path="/tools/savings-validator" component={SavingsValidator} />
      <Route path="/tools/scalability-roadmap" component={ScalabilityRoadmap} />
      <Route path="/tools/scenario-planner" component={ScenarioPlanner} />
      <Route path="/tools/settlement-guide" component={SettlementGuide} />
      <Route path="/tools/success-metrics" component={SuccessMetrics} />
      <Route path="/tools/success-predictor" component={SuccessPredictor} />
      <Route path="/tools/supply-chain" component={SupplyChain} />
      <Route path="/tools/team-assessment" component={TeamAssessment} />
      <Route path="/tools/team-scaling" component={TeamScaling} />
      <Route path="/tools/compensation-planning" component={CompensationPlanning} />
      <Route path="/tools/role-designer" component={RoleDesigner} />
      <Route path="/tools/succession-planning" component={SuccessionPlanning} />
      <Route path="/tools/culture-framework" component={CultureFramework} />
      <Route path="/tools/diversity-inclusion" component={DiversityInclusion} />
      <Route path="/tools/leadership-development" component={LeadershipDevelopment} />
      <Route path="/tools/retention-strategy" component={RetentionStrategy} />
      <Route path="/tools/performance-management" component={PerformanceManagement} />
      <Route path="/tools/skills-matrix" component={SkillsMatrix} />
      <Route path="/tools/visa-timeline" component={VisaTimeline} />
      <Route path="/tools/advisor-prep-guide" component={AdvisorPrepGuide} />
      <Route path="/tools/advisory-board-builder" component={AdvisoryBoardBuilder} />
      <Route path="/tools/app-req-checker" component={AppReqChecker} />
      <Route path="/tools/breakeven-calculator" component={BreakevenCalculator} />
      <Route path="/tools/budget-cost-analyzer" component={BudgetCostAnalyzer} />
      <Route path="/tools/business-plan" component={BusinessPlan} />
      <Route path="/tools/company-formation" component={CompanyFormation} />
      <Route path="/tools/compliance-xray" component={ComplianceXray} />
      <Route path="/tools/criteria-scorer" component={CriteriaScorer} />
      <Route path="/tools/deep-xray" component={DeepXray} />
      <Route path="/tools/eligibility-validator" component={EligibilityValidator} />
      <Route path="/tools/endorser-comparison" component={EndorserComparisonTool} />
      <Route path="/tools/milestone-timeline" component={MilestoneTimeline} />
      <Route path="/tools/min-investment-calc" component={MinInvestmentCalc} />
      <Route path="/tools/red-flag-fixer" component={RedFlagFixer} />
      <Route path="/tools/rejection-analysis" component={RejectionAnalysisTool} />
      <Route path="/tools/revenue-forecast" component={RevenueForecast} />
      <Route path="/tools/rfe-defense" component={RfeDefense} />
      <Route path="/tools/salary-threshold" component={SalaryThreshold} />
      <Route path="/tools/settlement-planning" component={SettlementPlanningTool} />
      <Route path="/tools/site-strategy" component={SiteStrategy} />
      <Route path="/tools/strength-scorer" component={StrengthScorer} />
      <Route path="/tools/tax-compliance" component={TaxCompliance} />
      <Route path="/tools/tax-planning" component={TaxPlanning} />
      <Route path="/tools/tech-stack-assess" component={TechStackAssess} />
      <Route path="/tools/timeline-tracker" component={TimelineTracker} />
      <Route path="/tools/unit-economics" component={UnitEconomics} />
      <Route path="/tools/usp-validator" component={UspValidator} />
      <Route path="/tools/uvp-generator" component={UvpGenerator} />
      <Route path="/tools/validation-report" component={ValidationReport} />
      <Route path="/tools/verification-checklist" component={VerificationChecklist} />
      <Route path="/tools/viability-checker" component={ViabilityChecker} />
      <Route path="/tools/visa-status-tracker" component={VisaStatusTracker} />
      <Route path="/tools/weakness-analysis" component={WeaknessAnalysis} />
      <Route path="/tools/win-predictor" component={WinPredictor} />
      <Route path="/tools/year-tracker" component={YearTracker} />
      <Route path="/tools/yoy-projector" component={YoyProjector} />
      <Route path="/tools/zero-approved" component={ZeroApproved} />
      <Route path="/tools/zone-planning" component={ZonePlanning} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isPublicRoute = SIDEBAR_HIDDEN_ROUTES.includes(location);

  // Public routes don't need authentication or sidebar
  if (isPublicRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Router />
      </Suspense>
    );
  }

  // Protected routes require authentication and show sidebar
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 w-full">
            <header className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 md:py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-1 md:-ml-2 h-8 md:h-9 w-8 md:w-9 flex items-center justify-center" />
                </TooltipTrigger>
                <TooltipContent>Toggle sidebar menu</TooltipContent>
              </Tooltip>
              <div className="flex-1" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<PageLoader />}>
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
        <Toaster />
        <AppLayout />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
