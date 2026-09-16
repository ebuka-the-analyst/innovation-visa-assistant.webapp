import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ThemeToggle from "@/components/ThemeToggle";
import VisaAssistantBrand from "@/components/VisaAssistantBrand";

export function AuthHeader() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.clear();
      if (data?.redirectUrl) window.location.href = data.redirectUrl;
      else setLocation("/login");
    },
  });

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? "py-1.5" : "py-3"}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center transition-all duration-300 ${isScrolled ? "gap-3" : "gap-6"}`}>
            <Link href="/">
              <div className="isolate z-[9999] cursor-pointer bg-transparent transition-opacity hover:opacity-85" data-testid="button-auth-logo">
                <VisaAssistantBrand routeFlag="🇬🇧" routeLabel="UK Innovator Founder" compact={isScrolled} />
              </div>
            </Link>
            <nav className={`hidden transition-all duration-300 md:flex ${isScrolled ? "gap-2" : "gap-4"}`}>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} data-testid="button-nav-dashboard">
                <Home className={`mr-1 transition-all duration-300 ${isScrolled ? "h-3 w-3" : "h-4 w-4"}`} />
                Dashboard
              </Button>
            </nav>
          </div>

          <div className={`flex items-center transition-all duration-300 ${isScrolled ? "gap-2" : "gap-4"}`}>
            <div className={`hidden text-muted-foreground transition-all duration-300 sm:block ${isScrolled ? "text-xs" : "text-sm"}`}>{user.displayName || user.email}</div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} data-testid="button-logout">
              <LogOut className={`mr-1 transition-all duration-300 ${isScrolled ? "h-3 w-3" : "h-4 w-4"}`} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
