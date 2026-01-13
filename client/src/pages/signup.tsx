import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, LogIn, Gift, CheckCircle, Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
import { SEOHead } from "@/components/SEOHead";

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{ email: string } | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralDiscount, setReferralDiscount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Capture referral code from URL and validate it
  useEffect(() => {
    const params = new URLSearchParams(search);
    const refCode = params.get('ref');
    if (refCode) {
      // Validate the referral code
      fetch(`/api/referrals/validate/${refCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setReferralCode(refCode.toUpperCase());
            setReferralDiscount(data.discount);
            // Store in sessionStorage for later use
            sessionStorage.setItem('referralCode', refCode.toUpperCase());
            // Track the visit
            fetch('/api/referrals/track-visit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                code: refCode, 
                source: params.get('utm_source') || 'direct',
                landingPage: window.location.pathname 
              }),
            });
          }
        })
        .catch(() => {});
    } else {
      // Check if we have a stored referral code
      const storedCode = sessionStorage.getItem('referralCode');
      if (storedCode) {
        setReferralCode(storedCode);
        fetch(`/api/referrals/validate/${storedCode}`)
          .then(res => res.json())
          .then(data => {
            if (data.valid) {
              setReferralDiscount(data.discount);
            }
          })
          .catch(() => {});
      }
    }
  }, [search]);

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
        body: JSON.stringify({
          ...formData,
          referralCode: referralCode || sessionStorage.getItem('referralCode'),
        }),
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

      // Clear stored referral code after successful signup
      sessionStorage.removeItem('referralCode');

      // Show success screen with verification instructions
      setRegistrationSuccess({ email: formData.email });
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

  const handleResendVerification = async () => {
    if (!registrationSuccess) return;
    
    setIsResendingVerification(true);
    try {
      const response = await fetch("/api/auth/resend-verification-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registrationSuccess.email }),
      });

      const data = await response.json();

      toast({
        title: data.success ? "Verification email sent" : "Unable to send",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <>
        <SEOHead
          title="Verify Your Email | UK Innovator Founder Visa Assistant"
          description="Please verify your email to complete your registration."
          path="/signup"
        />
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 overflow-hidden">
          <Card className="w-full max-w-sm mx-2">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardHeader className="py-1 px-4">
              <CardTitle className="text-sm font-bold text-center">Check your email</CardTitle>
              <CardDescription className="text-center text-xs">
                Verification link sent to:
              </CardDescription>
              <p className="text-center font-medium text-primary text-xs">{registrationSuccess.email}</p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 px-4">
              <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground">
                Click the link in email to verify. Check spam if not found.
              </div>
              
              <Button
                variant="outline"
                className="w-full h-8"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                data-testid="button-resend-verification"
              >
                {isResendingVerification ? "Sending..." : "Resend email"}
              </Button>
              
              <Button
                className="w-full h-8"
                size="sm"
                onClick={() => setLocation("/login")}
                data-testid="button-go-to-login"
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Sign Up | UK Innovator Founder Visa Assistant"
        description="Create your free account and start your UK Innovator Founder Visa application journey. Access 100+ professional-level tools, business plan generator, and expert guidance."
        path="/signup"
      />
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 overflow-hidden">
        <Card className="w-full max-w-sm mx-2">
        <div className="flex justify-center pt-2 pb-1">
          <div className="isolate z-[9999] mix-blend-normal bg-transparent">
            <div className="logo-container overflow-hidden">
              <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-8 w-auto logo-light object-contain !mix-blend-normal !filter-none !opacity-100" />
              <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-8 w-auto logo-dark object-contain !mix-blend-normal !filter-none !opacity-100" />
            </div>
          </div>
        </div>
        <CardHeader className="py-1 px-4">
          <CardTitle className="text-sm font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center text-xs">Start your visa journey</CardDescription>
          {referralCode && referralDiscount && (
            <div className="mt-1 p-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
              <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                <Gift className="h-3 w-3" />
                <span className="font-medium">Referral: {referralDiscount}% OFF</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0 px-4">
          <form onSubmit={handleEmailSignup} className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <Label htmlFor="firstName" className="text-xs">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-8 text-sm"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-8 text-sm"
                  data-testid="input-last-name"
                />
              </div>
            </div>
            
            <div className="space-y-0.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-8 text-sm"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="password" className="text-xs">Password (min 6 chars)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="h-8 text-sm"
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-8"
              size="sm"
              disabled={isLoading}
              data-testid="button-signup"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground text-[10px]">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-8"
            size="sm"
            onClick={handleGoogleSignup}
            data-testid="button-google-signup"
          >
            <LogIn className="mr-1.5 h-3.5 w-3.5" />
            Sign up with Google
          </Button>
        </CardContent>
        <div className="px-4 pb-2 pt-1 text-center">
          <p className="text-xs text-muted-foreground">
            Have an account? <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">Sign in</Link>
            {" · "}
            <Link href="/" className="text-primary hover:underline" data-testid="link-home">Home</Link>
          </p>
        </div>
      </Card>
    </div>
    </>
  );
}
