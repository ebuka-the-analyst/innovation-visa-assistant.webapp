import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoImg from "@assets/BhenMedia_1763690019470.png";
import ThemeToggle from "@/components/ThemeToggle";

export function AuthHeader() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  if (!user) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex flex-col items-start cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-auth-logo">
                <img src={logoImg} alt="BhenMedia" className="h-12 w-44" />
                <div className="relative -mt-1">
                  <p className="text-xs font-bold bg-gradient-to-r from-primary via-chart-3 to-primary bg-clip-text text-transparent whitespace-nowrap">
                    UK's #1 Innovation Visa Partner
                  </p>
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-chart-3 to-primary rounded-full" />
                </div>
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
