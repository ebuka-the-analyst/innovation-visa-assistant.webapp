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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-center pt-8 pb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardHeader className="space-y-1 pt-2">
              <CardTitle className="text-lg font-bold text-center">Check your email</CardTitle>
              <CardDescription className="text-center">
                We've sent a verification link to
              </CardDescription>
              <p className="text-center font-medium text-primary">{registrationSuccess.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to verify your account and start using all features.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                data-testid="button-resend-verification"
              >
                {isResendingVerification ? "Sending..." : "Resend verification email"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Already verified?</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={() => setLocation("/login")}
                data-testid="button-go-to-login"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
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
          <CardTitle className="text-lg font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Get started with your visa application journey</CardDescription>
          {referralCode && referralDiscount && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Gift className="h-4 w-4" />
                <span className="font-medium">Referral Applied!</span>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                  {referralDiscount}% OFF
                </Badge>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                You'll get {referralDiscount}% off your first purchase!
              </p>
            </div>
          )}
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
              className="w-full"
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
    </>
  );
}
