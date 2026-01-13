import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquareWarning, X, Send, Loader2, Bug, Lightbulb, HelpCircle, ThumbsUp, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type FeedbackType = "bug" | "suggestion" | "question" | "praise" | "other";

interface FeedbackOption {
  type: FeedbackType;
  label: string;
  icon: typeof Bug;
  color: string;
}

const feedbackOptions: FeedbackOption[] = [
  { type: "bug", label: "Report a Bug", icon: Bug, color: "#ef4444" },
  { type: "suggestion", label: "Suggestion", icon: Lightbulb, color: "#005EB8" },
  { type: "question", label: "Question", icon: HelpCircle, color: "#41B6E6" },
  { type: "praise", label: "Praise", icon: ThumbsUp, color: "#22c55e" },
];

export default function FloatingFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery<{ id: string; email: string; firstName?: string } | null>({
    queryKey: ["/api/auth/user"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      type: FeedbackType;
      subject: string;
      message: string;
      email: string;
      pageUrl: string;
      userId?: string;
      browserInfo: string;
      screenSize: string;
    }) => {
      return apiRequest("POST", "/api/feedback/floating", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Feedback Received!",
        description: "Thank you for helping us improve.",
      });
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Failed to submit",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFeedbackType(null);
    setSubject("");
    setMessage("");
    setEmail("");
    setSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = () => {
    if (!feedbackType) {
      toast({ title: "Please select a feedback type", variant: "destructive" });
      return;
    }
    if (!message.trim()) {
      toast({ title: "Please enter your message", variant: "destructive" });
      return;
    }
    if (!user && !email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    submitMutation.mutate({
      type: feedbackType,
      subject: subject.trim() || `${feedbackOptions.find(o => o.type === feedbackType)?.label}`,
      message: message.trim(),
      email: user?.email || email.trim(),
      pageUrl: window.location.pathname,
      userId: user?.id,
      browserInfo: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
    });
  };

  return (
    <>
      <style>{`
        @keyframes feedback-pulse {
          0%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 15px rgba(17, 182, 233, 0.4);
          }
          50% { 
            opacity: 0.9; 
            box-shadow: 0 0 25px rgba(255, 165, 54, 0.5);
          }
        }
      `}</style>

      {/* Small compact button matching 100+ Tools style - bottom left */}
      <div className="fixed left-4 bottom-4 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-lg bg-primary shadow-lg hover-elevate transition-all duration-300 flex items-center justify-center gap-1 w-[72px] h-[44px]"
          data-testid="button-feedback-toggle"
          aria-label={isOpen ? "Close feedback" : "Send feedback"}
        >
          <div className="flex flex-col items-center">
            <MessageSquareWarning className="w-4 h-4 text-white" />
            <span className="text-[10px] font-bold text-white">Feedback</span>
          </div>
        </button>
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shadow-sm"
            data-testid="button-feedback-close"
          >
            <X className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed z-[9998] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-border overflow-hidden bg-background
            inset-0 sm:inset-auto
            sm:left-4 sm:bottom-16
            sm:w-[340px] md:w-[380px]
            sm:h-auto sm:max-h-[60vh]"
          data-testid="feedback-window"
        >
          <div 
            className="p-4 flex-shrink-0 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #41B6E6 0%, #005EB8 100%)" }}
          >
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Send Feedback</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors sm:hidden"
              data-testid="button-feedback-close-mobile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Thank You!</h4>
                <p className="text-muted-foreground text-sm">Your feedback helps us improve the platform.</p>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">What type of feedback?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = feedbackType === option.type;
                      return (
                        <button
                          key={option.type}
                          onClick={() => setFeedbackType(option.type)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 text-xs font-medium
                            ${isSelected 
                              ? "border-current bg-muted" 
                              : "border-border hover:border-muted-foreground/50"
                            }`}
                          style={{ color: isSelected ? option.color : undefined }}
                          data-testid={`button-feedback-type-${option.type}`}
                        >
                          <Icon className="w-5 h-5" style={{ color: option.color }} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback-subject" className="text-sm font-medium mb-1.5 block">
                    Subject (optional)
                  </Label>
                  <Input
                    id="feedback-subject"
                    placeholder="Brief summary..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-muted/50"
                    data-testid="input-feedback-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback-message" className="text-sm font-medium mb-1.5 block">
                    Your Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="feedback-message"
                    placeholder={
                      feedbackType === "bug" 
                        ? "Describe the issue, what you expected, and what happened instead..."
                        : feedbackType === "suggestion"
                        ? "Share your idea for improvement..."
                        : feedbackType === "question"
                        ? "What would you like to know?"
                        : "Tell us more..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none min-h-[100px] bg-muted/50"
                    data-testid="input-feedback-message"
                  />
                </div>

                {!user && (
                  <div>
                    <Label htmlFor="feedback-email" className="text-sm font-medium mb-1.5 block">
                      Your Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="feedback-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/50"
                      data-testid="input-feedback-email"
                    />
                    <p className="text-xs text-muted-foreground mt-1">So we can follow up if needed</p>
                  </div>
                )}

                {user && (
                  <p className="text-xs text-muted-foreground">
                    Submitting as <span className="font-medium">{user.email}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <div className="p-4 border-t flex-shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !feedbackType || !message.trim()}
                className="w-full bg-gradient-to-r from-[#41B6E6] to-[#005EB8] hover:opacity-90"
                data-testid="button-feedback-send"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
