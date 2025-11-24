import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoImg from "@assets/generated_images/professional_visa_assistant_logo_design.png";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show user-friendly error message
        const authMethod = result.authMethod;
        
        toast({
          title: authMethod === "google" ? "Please use Google to sign in" : "Email already registered",
          description: result.message || "This email is already in use",
          variant: "destructive",
        });

        // Auto-redirect to login if they should use Google
        if (authMethod === "google") {
          setTimeout(() => {
            setLocation("/login");
          }, 3000);
        }
        
        setIsLoading(false);
        return;
      }

      toast({
        title: "Account created!",
        description: result.message || "Please check your email to verify your account",
      });

      // Don't auto-redirect - user needs to verify email first
      // They can still access dashboard but features may be limited
    } catch (error: any) {
      toast({
        title: "Connection error",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-center pt-8 pb-4">
          <img 
            src={logoImg} 
            alt="UK Innovator Founder Visa Assistant" 
            className="h-24 w-auto"
          />
        </div>
        <CardHeader className="space-y-1 pt-4">
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Get started with your visa application journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignup} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  data-testid="input-last-name"
                />
              </div>
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                data-testid="input-password"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full relative overflow-visible"
              disabled={isLoading}
              data-testid="button-signup"
            >
              {isLoading ? (
                "Creating account..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </>
              )}
              {!isLoading && (
                <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping-slow" />
              )}
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
            onClick={handleGoogleSignup}
            data-testid="button-google-signup"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
        </CardContent>
        <div className="px-6 pb-6 flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
              data-testid="link-login"
            >
              Sign in
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
  );
}
