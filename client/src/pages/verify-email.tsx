import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");

  useEffect(() => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email address not found. Please sign up again.",
      });
      setLocation("/signup");
    }
  }, [email, setLocation, toast]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await apiRequest({
        url: "/api/auth/verify-code",
        method: "POST",
        data: { email, code },
      });

      toast({
        title: "Email verified!",
        description: "Welcome to VisaPrep AI. Redirecting...",
      });

      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.message || "Verification failed";
      
      if (error.attemptsLeft !== undefined) {
        setAttemptsLeft(error.attemptsLeft);
      }

      toast({
        variant: "destructive",
        title: "Verification failed",
        description: errorMessage,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setIsResending(true);

    try {
      await apiRequest({
        url: "/api/auth/resend-code",
        method: "POST",
        data: { email },
      });

      toast({
        title: "Code sent!",
        description: "A new verification code has been sent to your email.",
      });

      setResendCooldown(120); // 2 minutes cooldown
      setAttemptsLeft(5); // Reset attempts
      setCode(""); // Clear input
    } catch (error: any) {
      const errorMessage = error.message || "Failed to resend code";
      
      // Extract wait time from error message
      const waitMatch = errorMessage.match(/wait (\d+) seconds/);
      if (waitMatch) {
        setResendCooldown(parseInt(waitMatch[1]));
      }

      toast({
        variant: "destructive",
        title: "Failed to resend",
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5 p-4">
      <Card className="w-full max-w-lg" data-testid="card-verify-email">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a 6-digit verification code to<br />
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span>Expires in</span>
              </div>
              <p className="text-lg font-semibold">15 minutes</p>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Attempts left</span>
              </div>
              <p className="text-lg font-semibold">{attemptsLeft}/5</p>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="code" className="text-sm font-medium mb-2 block">
                Enter 6-digit code
              </label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={isVerifying}
                data-testid="input-verification-code"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isVerifying || code.length !== 6}
              data-testid="button-verify"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              data-testid="button-resend-code"
              className="w-full"
            >
              {isResending ? (
                "Sending..."
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Troubleshooting:</strong>
              <br />• Check your spam/junk folder
              <br />• Make sure you entered the correct email address
              <br />• Wait a few minutes for the email to arrive
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Need help?{" "}
            <a 
              href="mailto:support@visaprep.ai" 
              className="text-primary hover:underline"
              data-testid="link-support"
            >
              Contact support
            </a>
          </p>
          <p className="text-sm text-muted-foreground text-center">
            <Link 
              href="/login" 
              className="text-primary hover:underline"
              data-testid="link-back-login"
            >
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
