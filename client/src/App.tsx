import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
