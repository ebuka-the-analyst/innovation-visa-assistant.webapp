import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();

  // Check if user is logged in
  const { data: user, isLoading: authLoading } = useQuery<{ id: string; email: string; isAdmin?: boolean }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const isAuthenticated = !!user;

  // Logout — clear UI instantly, fire server call in background
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    // Wipe auth state immediately so the UI responds at once
    queryClient.setQueryData(['/api/auth/user'], null);
    queryClient.clear();
    setLocation('/');
    // Destroy server session in background (non-blocking)
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  };
  const logoutMutation = { mutate: handleLogout, isPending: loggingOut };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Hysteresis: different thresholds for scrolling down vs up
          // This prevents rapid toggling when scrolling slowly around the threshold
          if (!isScrolled && currentScrollY > 50) {
            setIsScrolled(true);
          } else if (isScrolled && currentScrollY < 20) {
            setIsScrolled(false);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

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
        <div className="w-full text-sm py-2 px-3 flex items-center justify-between md:justify-center gap-2 md:gap-4 border-b border-red-700/40" style={{ backgroundColor: '#DC2626' }}>
          <span className="line-clamp-2 md:line-clamp-1 text-white">
            <strong>UK Innovator Founder Visa Assistant Disclaimer:</strong> Trained on GOV.UK guidance. This doesn't substitute legal advice. Always verify with official sources.{' '}
            <a href="/ai-transparency" className="underline hover:opacity-80">Learn more</a>
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
      
      <nav className={`container mx-auto px-3 md:px-6 flex items-center justify-between border-b border-border/40 transition-[height] duration-200 ease-out will-change-[height] ${isScrolled ? 'h-14 md:h-16' : 'h-20 md:h-24'}`}>
        {/* Logo */}
        <Link href="/">
          <div className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-logo">
            <div className="logo-container overflow-hidden flex items-center">
              <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" width="200" height="56" fetchPriority="high" className={`w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100 transition-[height] duration-200 ease-out ${isScrolled ? 'h-12 md:h-14' : 'h-14 md:h-18'}`} />
              <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" width="200" height="56" fetchPriority="high" className={`w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100 transition-[height] duration-200 ease-out ${isScrolled ? 'h-12 md:h-14' : 'h-14 md:h-18'}`} />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'gap-4' : 'gap-8'}`}>
          <Link href="/features" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`} data-testid="link-all-features">
            All Features
          </Link>
          <Link href="/tools-hub" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`} data-testid="link-tools-hub">
            Tools
          </Link>
          <Link href="/blog" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`} data-testid="link-blog">
            Blog
          </Link>
          <button
            onClick={() => handleNavigation('pricing')}
            className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            data-testid="button-nav-pricing"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavigation('faq')}
            className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            data-testid="button-nav-faq"
          >
            FAQ
          </button>
        </div>

        {/* CTA Buttons & Theme Toggle */}
        <div className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'gap-1' : 'gap-2'}`}>
          <LanguageSelector />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size={isScrolled ? "sm" : "default"} data-testid="button-header-dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size={isScrolled ? "sm" : "default"} 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-header-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size={isScrolled ? "sm" : "default"} data-testid="button-header-signin">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size={isScrolled ? "sm" : "default"} data-testid="button-header-cta">
                  Get Started
                </Button>
              </Link>
            </>
          )}
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
            <Link href="/blog" className="block py-2 hover:text-primary transition-colors" data-testid="link-mobile-blog">
              Blog
            </Link>
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
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground">Dark Mode</span>
              </div>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-signin">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full" data-testid="button-mobile-cta">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
