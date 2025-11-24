import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
import ThemeToggle from "@/components/ThemeToggle";

export function AuthHeader() {
  const [, setLocation] = useLocation();

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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-auth-logo">
                <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-18 w-auto logo-light" />
                <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-18 w-auto logo-dark" />
              </div>
            </Link>
            <nav className="hidden md:flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-nav-dashboard"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-muted-foreground">
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
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
