import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImg from "@assets/BhenMedia_1763690019470.png";
import ThemeToggle from "./ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { useState as useStateDisclaimer } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useStateDisclaimer(false);
  const [location, setLocation] = useLocation();

  const handleNavigation = (sectionId: string) => {
    setMobileMenuOpen(false);
    
    // If on home page, scroll to section
    if (location === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On other pages, navigate to home with anchor
      setLocation(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
      {/* Disclaimer Bar */}
      {!disclaimerDismissed && (
        <div className="w-full bg-black/90 text-white text-xs py-2.5 flex items-center justify-center gap-4 border-b border-border/40">
          <span>
            <strong>UK-Innovation Visa Assistant Disclaimer:</strong> Trained on GOV.UK guidance. Always verify with official sources.
          </span>
          <button
            onClick={() => setDisclaimerDismissed(true)}
            className="text-white hover:opacity-75 transition-opacity flex-shrink-0"
            data-testid="button-dismiss-disclaimer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      
      <nav className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between border-b border-border/40">
        {/* Logo */}
        <Link href="/">
          <div className="flex flex-col items-start cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-logo">
            <img src={logoImg} alt="BhenMedia" className="h-14 w-48" />
            <div className="relative -mt-1">
              <p className="text-xs font-bold bg-gradient-to-r from-primary via-chart-3 to-primary bg-clip-text text-transparent whitespace-nowrap">
                UK's #1 Innovation Visa Partner
              </p>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-chart-3 to-primary rounded-full" />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-all-features">
            All Features
          </Link>
          <Link href="/tools-hub" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-tools-hub">
            Tools
          </Link>
          <button
            onClick={() => handleNavigation('pricing')}
            className="text-sm font-medium hover:text-primary transition-colors"
            data-testid="button-nav-pricing"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavigation('faq')}
            className="text-sm font-medium hover:text-primary transition-colors"
            data-testid="button-nav-faq"
          >
            FAQ
          </button>
        </div>

        {/* CTA Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" data-testid="button-header-signin">
              Sign In
            </Button>
          </Link>
          <Link href="/pricing">
            <Button data-testid="button-header-cta">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <button
              onClick={() => handleNavigation('features')}
              className="text-left py-2 hover:text-primary transition-colors"
              data-testid="button-mobile-nav-features"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation('pricing')}
              className="text-left py-2 hover:text-primary transition-colors"
              data-testid="button-mobile-nav-pricing"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavigation('faq')}
              className="text-left py-2 hover:text-primary transition-colors"
              data-testid="button-mobile-nav-faq"
            >
              FAQ
            </button>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
