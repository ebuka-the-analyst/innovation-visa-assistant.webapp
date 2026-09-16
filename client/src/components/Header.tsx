import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import VisaAssistantBrand from "./VisaAssistantBrand";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<{ id: string; email: string; isAdmin?: boolean }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const isAuthenticated = !!user;
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.clear();
    setLocation("/");
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
  };

  const logoutMutation = { mutate: handleLogout, isPending: loggingOut };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (!isScrolled && currentScrollY > 50) setIsScrolled(true);
        if (isScrolled && currentScrollY < 20) setIsScrolled(false);
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  const handleNavigation = (sectionId: string) => {
    setMobileMenuOpen(false);
    const isUkLanding = location === "/" || location === "/uk" || location === "/uk/innovatorfoundervisaassistant";

    if (isUkLanding) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setLocation(`/uk#${sectionId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
      {!disclaimerDismissed && (
        <div
          className="relative w-full border-b border-red-700/40 px-3 py-2.5 sm:px-4"
          style={{ backgroundColor: "#DC2626" }}
          role="note"
          aria-label="Important platform information"
        >
          <div className="mx-auto max-w-7xl px-7 text-center text-xs leading-5 text-white sm:px-10 sm:text-sm">
            <strong>Important:</strong> This is an AI-assisted preparation platform, not a regulated immigration adviser or decision-maker. Supported tools may reference official GOV.UK information, but requirements can change and should be checked before use.{" "}
            <a href="/ai-transparency" className="underline underline-offset-2 hover:opacity-80">Learn more</a>
          </div>
          <button
            onClick={() => setDisclaimerDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white transition-colors hover:bg-white/10"
            data-testid="button-dismiss-disclaimer"
            aria-label="Dismiss information notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className={`container mx-auto flex items-center justify-between border-b border-border/40 px-3 transition-[height] duration-200 ease-out md:px-6 ${isScrolled ? "h-14 md:h-16" : "h-20 md:h-24"}`}>
        <Link href="/">
          <div className="isolate z-[9999] cursor-pointer bg-transparent transition-opacity hover:opacity-85" data-testid="button-logo">
            <VisaAssistantBrand routeFlag="🇬🇧" routeLabel="UK Innovator Founder" compact={isScrolled} />
          </div>
        </Link>

        <div className={`hidden items-center transition-all duration-300 md:flex ${isScrolled ? "gap-4" : "gap-8"}`}>
          <Link href="/features" className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-xs" : "text-sm"}`} data-testid="link-all-features">All Features</Link>
          <Link href="/tools-hub" className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-xs" : "text-sm"}`} data-testid="link-tools-hub">Tools</Link>
          <Link href="/blog" className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-xs" : "text-sm"}`} data-testid="link-blog">Blog</Link>
          <button onClick={() => handleNavigation("pricing")} className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-xs" : "text-sm"}`} data-testid="button-nav-pricing">Pricing</button>
          <button onClick={() => handleNavigation("faq")} className={`font-medium transition-colors hover:text-primary ${isScrolled ? "text-xs" : "text-sm"}`} data-testid="button-nav-faq">FAQ</button>
        </div>

        <div className={`hidden items-center transition-all duration-300 md:flex ${isScrolled ? "gap-1" : "gap-2"}`}>
          <LanguageSelector />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size={isScrolled ? "sm" : "default"} data-testid="button-header-dashboard"><LayoutDashboard className="mr-1 h-4 w-4" />Dashboard</Button>
              </Link>
              <Button variant="outline" size={isScrolled ? "sm" : "default"} onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} data-testid="button-header-logout"><LogOut className="mr-1 h-4 w-4" />Log Out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size={isScrolled ? "sm" : "default"} data-testid="button-header-signin">Sign In</Button></Link>
              <Link href="/pricing"><Button size={isScrolled ? "sm" : "default"} data-testid="button-header-cta">Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu" aria-label="Toggle navigation menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <button onClick={() => handleNavigation("features")} className="py-2 text-left transition-colors hover:text-primary" data-testid="button-mobile-nav-features">Features</button>
            <Link href="/blog" className="block py-2 transition-colors hover:text-primary" data-testid="link-mobile-blog">Blog</Link>
            <button onClick={() => handleNavigation("pricing")} className="py-2 text-left transition-colors hover:text-primary" data-testid="button-mobile-nav-pricing">Pricing</button>
            <button onClick={() => handleNavigation("faq")} className="py-2 text-left transition-colors hover:text-primary" data-testid="button-mobile-nav-faq">FAQ</button>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2"><ThemeToggle /><span className="text-sm text-muted-foreground">Dark Mode</span></div>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="w-full"><Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Button></Link>
                  <Button variant="outline" className="w-full justify-start" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} data-testid="button-mobile-logout"><LogOut className="mr-2 h-4 w-4" />Log Out</Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full"><Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-signin">Sign In</Button></Link>
                  <Link href="/pricing" className="w-full"><Button className="w-full" data-testid="button-mobile-cta">Get Started</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
