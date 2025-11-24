import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

export function AuthHeader() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.clear();
      // Redirect to Replit Auth logout if provided, otherwise go to login
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setLocation("/login");
      }
    },
  });

  if (!user) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-3'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'gap-3' : 'gap-6'}`}>
            <Link href="/">
              <div className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-auth-logo">
                <div className="logo-container overflow-hidden flex items-center">
                  <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className={`w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100 transition-all duration-300 ${isScrolled ? 'h-8 md:h-10' : 'h-16 md:h-18'}`} />
                  <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className={`w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100 transition-all duration-300 ${isScrolled ? 'h-8 md:h-10' : 'h-16 md:h-18'}`} />
                </div>
              </div>
            </Link>
            <nav className={`hidden md:flex transition-all duration-300 ${isScrolled ? 'gap-2' : 'gap-4'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-nav-dashboard"
              >
                <Home className={`mr-1 transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Dashboard
              </Button>
            </nav>
          </div>
          <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'gap-2' : 'gap-4'}`}>
            <div className={`hidden sm:block text-muted-foreground transition-all duration-300 ${isScrolled ? 'text-xs' : 'text-sm'}`}>
              {user.displayName || user.email}
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className={`mr-1 transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
