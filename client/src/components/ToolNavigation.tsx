import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Gauge, DollarSign, HelpCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import logoImg from "@assets/BhenMedia_1763690019470.png";
import { useState } from "react";
import PricingModal from "./PricingModal";
import FAQModal from "./FAQModal";

export function ToolNavigation() {
  const [location, setLocation] = useLocation();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const isOnToolPage = location.startsWith("/tools/");

  return (
    <div className="mb-8">
      {/* Header with Logo and Branding */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-nav-logo">
            <img src={logoImg} alt="BhenMedia" className="h-8 w-auto" />
            <div className="flex flex-col items-start">
              <p className="text-xs font-bold bg-gradient-to-r from-primary via-chart-3 to-primary bg-clip-text text-transparent whitespace-nowrap">
                UK's #1 Visa AI Assistant
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {isOnToolPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/tools-hub")}
            className="gap-2 hover:bg-primary/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Tools</span>
            <span className="sm:hidden">Back</span>
          </Button>
        )}
        <Button
          variant={location === "/" ? "default" : "outline"}
          size="sm"
          onClick={() => setLocation("/")}
          className="gap-2"
          data-testid="button-home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <Button
          variant={location === "/tools-hub" ? "default" : "outline"}
          size="sm"
          onClick={() => setLocation("/tools-hub")}
          className="gap-2"
          data-testid="button-tools-hub"
        >
          <Gauge className="w-4 h-4" />
          <span className="hidden sm:inline">Tools Hub</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPricingOpen(true)}
          className="gap-2"
          data-testid="button-nav-pricing"
        >
          <DollarSign className="w-4 h-4" />
          <span className="hidden sm:inline">Pricing</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFaqOpen(true)}
          className="gap-2"
          data-testid="button-nav-faq"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">FAQ</span>
        </Button>
      </div>

      {/* Modals */}
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
      <FAQModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
    </div>
  );
}
