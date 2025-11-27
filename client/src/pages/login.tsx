import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
import { SEOHead } from "@/components/SEOHead";

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (!isLoading && isAuthenticated) {
      if (user?.isAdmin) {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Unable to sign in",
          description: data.message || "Please check your email and password and try again",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in",
      });

      // Trigger onboarding tour for new users who haven't completed it
      if (data.user && !data.user.hasCompletedOnboarding) {
        localStorage.setItem('trigger-onboarding-tour', 'true');
      }

      // Redirect admin users to admin dashboard
      if (data.user?.isAdmin) {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      // Network or other error
      toast({
        title: "Connection error",
        description: "Unable to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Sign In | UK Innovator Founder Visa Assistant"
        description="Sign in to your UK Innovator Founder Visa Assistant account. Continue working on your business plan, innovation assessment, and visa application tools."
        path="/login"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
        <Card className="w-full max-w-md">
        <div className="flex justify-center pt-8 pb-4">
          <div className="isolate z-[9999] mix-blend-normal bg-transparent">
            <div className="logo-container overflow-hidden">
              <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-32 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" />
              <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-32 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" />
            </div>
          </div>
        </div>
        <CardHeader className="space-y-1 pt-4">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            data-testid="button-google-login"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </CardContent>
        <div className="px-6 pb-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
              data-testid="link-signup"
            >
              Create account
            </Link>
          </p>
          <p className="text-sm text-muted-foreground text-center">
            <Link
              href="/"
              className="text-primary hover:underline"
              data-testid="link-home"
            >
              Back to home
            </Link>
          </p>
        </div>
      </Card>
    </div>
    </>
  );
}
