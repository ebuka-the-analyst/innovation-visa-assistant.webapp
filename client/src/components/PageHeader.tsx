import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, Menu } from "lucide-react";
import { useState } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export default function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Questionnaire", href: "/questionnaire" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Features", href: "/features-dashboard" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-gradient-to-r from-primary/10 via-accent/5 to-chart-3/10 border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <Link href="/">
              <a className="font-serif text-2xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                VisaPrep AI
              </a>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover-elevate"
                    data-testid={`button-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <nav className="md:hidden space-y-2 pb-4 flex flex-col">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMenuOpen(false)}
                    data-testid={`button-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-muted/30 border-b border-border sticky top-16 z-20">
          <div className="container mx-auto px-4 md:px-6 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/">
                <a className="hover:text-primary transition-colors flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </a>
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>
                      <a className="hover:text-primary transition-colors">{crumb.label}</a>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-8 border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      </div>
    </>
  );
}
