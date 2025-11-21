import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatBot from "@/components/ChatBot";
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
import InterviewPrep from "@/pages/interview-prep";
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
      <Route path="/interview-prep" component={InterviewPrep} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatBot />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
