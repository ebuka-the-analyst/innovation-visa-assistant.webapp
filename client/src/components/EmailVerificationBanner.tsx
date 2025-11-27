import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-verification");
      return response.json();
    },
    onSuccess: (data) => {
      setEmailSent(true);
      toast({
        title: "Verification email sent",
        description: `We've sent a new verification link to ${email}. Please check your inbox.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later or contact support.",
        variant: "destructive",
      });
    },
  });

  if (dismissed) return null;

  return (
    <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30" data-testid="alert-email-verification">
      <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">Verify your email address</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Please verify <strong>{email}</strong> to unlock all features and secure your account.
          </p>
          <div className="flex gap-2">
            {emailSent ? (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Email sent!
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-300"
                data-testid="button-resend-verification"
              >
                {resendMutation.isPending ? (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="mr-1 h-3 w-3" />
                )}
                Resend email
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDismissed(true);
                  onDismiss();
                }}
                className="text-amber-600 hover:bg-amber-100 dark:text-amber-400"
                data-testid="button-dismiss-verification"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
