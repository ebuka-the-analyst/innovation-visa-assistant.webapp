import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Gauge, DollarSign, HelpCircle } from "lucide-react";
import { useLocation, Link } from "wouter";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
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
            <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-14 w-auto logo-light scale-110" />
            <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-14 w-auto logo-dark scale-110" />
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
