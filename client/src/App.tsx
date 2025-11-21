import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ChatBot from "@/components/ChatBot";
import CookieConsent from "@/components/CookieConsent";
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
import AdvisorPrep from "@/pages/tools/advisor-prep";
import AdvisorsFinder from "@/pages/tools/advisors-finder";
import AdvisoryBoard from "@/pages/tools/advisory-board";
import AppealStrategy from "@/pages/tools/appeal-strategy";
import ApplicationRequirements from "@/pages/tools/application-requirements";
import Breakeven from "@/pages/tools/breakeven";
import BudgetCost from "@/pages/tools/budget-cost";
import BusinessModelValidator from "@/pages/tools/business-model-validator";
import CacCalculator from "@/pages/tools/cac-calculator";
import CompetitorBench from "@/pages/tools/competitor-bench";
import ComplianceChecker from "@/pages/tools/compliance-checker";
import ContingencyPlan from "@/pages/tools/contingency-plan";
import CustomerResearch from "@/pages/tools/customer-research";
import DataSecurity from "@/pages/tools/data-security";
import DocOrganizer from "@/pages/tools/doc-organizer";
import DocVerification from "@/pages/tools/doc-verification";
import DueDiligence from "@/pages/tools/due-diligence";
import EndorsementReadiness from "@/pages/tools/endorsement-readiness";
import EvidenceCollection from "@/pages/tools/evidence-collection";
import EvidenceValidator from "@/pages/tools/evidence-validator";
import ExecSummary from "@/pages/tools/exec-summary";
import FaqGenerator from "@/pages/tools/faq-generator";
import FeeEstimator from "@/pages/tools/fee-estimator";
import FinancialModeling from "@/pages/tools/financial-modeling";
import FinancialProjections from "@/pages/tools/financial-projections";
import FundingChecker from "@/pages/tools/funding-checker";
import FundingSources from "@/pages/tools/funding-sources";
import FundingStrategy from "@/pages/tools/funding-strategy";
import GeographicExpansion from "@/pages/tools/geographic-expansion";
import GrowthMetrics from "@/pages/tools/growth-metrics";
import GrowthStrategy from "@/pages/tools/growth-strategy";
import GtmPlan from "@/pages/tools/gtm-plan";
import HiringPlan from "@/pages/tools/hiring-plan";
import HrCompliance from "@/pages/tools/hr-compliance";
import IncomeCalculator from "@/pages/tools/income-calculator";
import InnovationScore from "@/pages/tools/innovation-score";
import InnovationValidation from "@/pages/tools/innovation-validation";
import InterviewPrep from "@/pages/tools/interview-prep";
import IpAudit from "@/pages/tools/ip-audit";
import IpRoadmap from "@/pages/tools/ip-roadmap";
import IpStrategy from "@/pages/tools/ip-strategy";
import JurisdictionChecker from "@/pages/tools/jurisdiction-checker";
import KpiDashboard from "@/pages/tools/kpi-dashboard";
import LawyerFinder from "@/pages/tools/lawyer-finder";
import LegalCompliance from "@/pages/tools/legal-compliance";
import LegalTemplates from "@/pages/tools/legal-templates";
import MarketAnalysis from "@/pages/tools/market-analysis";
import MarketGap from "@/pages/tools/market-gap";
import MarketResearch from "@/pages/tools/market-research";
import MarketSize from "@/pages/tools/market-size";
import MilestonesTracker from "@/pages/tools/milestones-tracker";
import NarrativeBuilder from "@/pages/tools/narrative-builder";
import OperationsPlan from "@/pages/tools/operations-plan";
import OrgChart from "@/pages/tools/org-chart";
import OrgDesigner from "@/pages/tools/org-designer";
import PerformanceBench from "@/pages/tools/performance-bench";
import PitchCoach from "@/pages/tools/pitch-coach";
import PitchDeck from "@/pages/tools/pitch-deck";
import PmfValidator from "@/pages/tools/pmf-validator";
import PointsCalculator from "@/pages/tools/points-calculator";
import ProcessDocs from "@/pages/tools/process-docs";
import QuestionBank from "@/pages/tools/question-bank";
import RebuttalLetter from "@/pages/tools/rebuttal-letter";
import RegulatoryTracker from "@/pages/tools/regulatory-tracker";
import RfeQa from "@/pages/tools/rfe-qa";
import RiskAnalysis from "@/pages/tools/risk-analysis";
import RoadmapBuilder from "@/pages/tools/roadmap-builder";
import SavingsValidator from "@/pages/tools/savings-validator";
import ScalabilityRoadmap from "@/pages/tools/scalability-roadmap";
import ScenarioPlanner from "@/pages/tools/scenario-planner";
import SensitivityAnalysis from "@/pages/tools/sensitivity-analysis";
import SettlementGuide from "@/pages/tools/settlement-guide";
import SuccessMetrics from "@/pages/tools/success-metrics";
import SuccessPredictor from "@/pages/tools/success-predictor";
import SupplyChain from "@/pages/tools/supply-chain";
import TalentStrategy from "@/pages/tools/talent-strategy";
import TeamAssessment from "@/pages/tools/team-assessment";
import TeamRoles from "@/pages/tools/team-roles";
import TeamScaling from "@/pages/tools/team-scaling";
import TestingPlan from "@/pages/tools/testing-plan";
import VisaTimeline from "@/pages/tools/visa-timeline";
import VisaTracker from "@/pages/tools/visa-tracker";

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
      <Route path="/tools/advisor-prep" component={AdvisorPrep} />
      <Route path="/tools/advisors-finder" component={AdvisorsFinder} />
      <Route path="/tools/advisory-board" component={AdvisoryBoard} />
      <Route path="/tools/appeal-strategy" component={AppealStrategy} />
      <Route path="/tools/application-requirements" component={ApplicationRequirements} />
      <Route path="/tools/breakeven" component={Breakeven} />
      <Route path="/tools/budget-cost" component={BudgetCost} />
      <Route path="/tools/business-model-validator" component={BusinessModelValidator} />
      <Route path="/tools/cac-calculator" component={CacCalculator} />
      <Route path="/tools/competitor-bench" component={CompetitorBench} />
      <Route path="/tools/compliance-checker" component={ComplianceChecker} />
      <Route path="/tools/contingency-plan" component={ContingencyPlan} />
      <Route path="/tools/customer-research" component={CustomerResearch} />
      <Route path="/tools/data-security" component={DataSecurity} />
      <Route path="/tools/doc-organizer" component={DocOrganizer} />
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
      <Route path="/tools/sensitivity-analysis" component={SensitivityAnalysis} />
      <Route path="/tools/settlement-guide" component={SettlementGuide} />
      <Route path="/tools/success-metrics" component={SuccessMetrics} />
      <Route path="/tools/success-predictor" component={SuccessPredictor} />
      <Route path="/tools/supply-chain" component={SupplyChain} />
      <Route path="/tools/talent-strategy" component={TalentStrategy} />
      <Route path="/tools/team-assessment" component={TeamAssessment} />
      <Route path="/tools/team-roles" component={TeamRoles} />
      <Route path="/tools/team-scaling" component={TeamScaling} />
      <Route path="/tools/testing-plan" component={TestingPlan} />
      <Route path="/tools/visa-timeline" component={VisaTimeline} />
      <Route path="/tools/visa-tracker" component={VisaTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const showSidebar = !SIDEBAR_HIDDEN_ROUTES.includes(location);

  if (!showSidebar) {
    return <Router />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full">
          <header className="flex items-center gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="-ml-2" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatBot />
        <Toaster />
        <AppLayout />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
