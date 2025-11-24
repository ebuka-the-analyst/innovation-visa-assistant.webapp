import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="w-full max-w-md" data-testid="card-success">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-success-title">Check Your Email</CardTitle>
            <CardDescription data-testid="text-success-description">
              If an account exists with that email, we've sent password reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                <strong>What's next?</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset link (expires in 1 hour)</li>
                <li>Create a new password</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive an email? Check your spam folder or try again.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button variant="default" className="w-full" data-testid="button-back-to-login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md" data-testid="card-forgot-password">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-forgot-password-title">Reset Your Password</CardTitle>
          <CardDescription data-testid="text-forgot-password-description">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                data-testid="input-email"
              />
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-muted-foreground">
                <strong>Security Notice:</strong> The reset link will expire in 1 hour for your security.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full relative overflow-visible" 
              disabled={isSubmitting}
              data-testid="button-send-reset-link"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
              {!isSubmitting && (
                <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping-slow" />
              )}
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="outline" type="button" className="w-full" data-testid="button-back-to-login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
