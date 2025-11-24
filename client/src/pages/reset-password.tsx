import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      toast({
        title: "Invalid Link",
        description: "No reset token found",
        variant: "destructive",
      });
      setIsVerifying(false);
      return;
    }

    setToken(tokenParam);
    verifyToken(tokenParam);
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token/${tokenToVerify}`);
      const data = await response.json();

      if (data.valid) {
        setIsTokenValid(true);
      } else {
        toast({
          title: "Invalid or Expired Link",
          description: data.message || "This reset link is invalid or has expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify reset token",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your password has been reset successfully",
        });
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
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

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="w-full max-w-md" data-testid="card-verifying">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="w-full max-w-md" data-testid="card-invalid-token">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-invalid-title">Invalid or Expired Link</CardTitle>
            <CardDescription data-testid="text-invalid-description">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Reset links expire after 1 hour for security. Please request a new password reset link.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/forgot-password" className="w-full">
              <Button variant="default" className="w-full" data-testid="button-request-new-link">
                Request New Link
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full" data-testid="button-back-to-login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Card className="w-full max-w-md" data-testid="card-success">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-success-title">Password Reset Successfully!</CardTitle>
            <CardDescription data-testid="text-success-description">
              Your password has been updated. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="default" data-testid="button-go-to-login">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md" data-testid="card-reset-password">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-reset-password-title">Create New Password</CardTitle>
          <CardDescription data-testid="text-reset-password-description">
            Enter a strong new password for your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  data-testid="input-new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  data-testid="input-confirm-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                <strong>Password Requirements:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>At least 8 characters long</li>
                <li>Include a mix of letters, numbers, and symbols</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              data-testid="button-reset-password"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
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
