import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Get token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification link. Please check your email.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const result = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            setLocation("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Unable to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, setLocation]);

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for a new verification link",
        });
      } else {
        toast({
          title: "Failed to send email",
          description: result.message || "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <Card className="w-full max-w-md" data-testid="card-verify-email">
        <CardHeader className="space-y-1 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" data-testid="icon-loading" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying your email</CardTitle>
              <CardDescription>Please wait while we verify your account...</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" data-testid="icon-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-destructive" data-testid="icon-error" />
              </div>
              <CardTitle className="text-2xl font-bold">Verification failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Redirecting you to your dashboard in 3 seconds...
              </p>
              <Button
                className="w-full"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-dashboard"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
                data-testid="button-resend"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/login")}
                data-testid="button-login"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Need help?{" "}
            <a 
              href="mailto:support@innovatorfoundervisaassistant.co.uk" 
              className="text-primary hover:underline"
              data-testid="link-support"
            >
              Contact support
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
