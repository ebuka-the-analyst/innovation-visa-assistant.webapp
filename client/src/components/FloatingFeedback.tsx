import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageSquareWarning,
  X,
  Send,
  Loader2,
  Bug,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  CheckCircle2,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackCopy, type FeedbackCopy } from "@/lib/feedback-i18n";

type FeedbackType = "bug" | "suggestion" | "question" | "praise" | "other";

interface FeedbackOption {
  type: FeedbackType;
  label: string;
  icon: typeof Bug;
  color: string;
}

interface FeedbackContext {
  label: string;
  shortLabel: string;
  helper: string;
}

const OVERLAY_EVENT = "visaassistant:overlay-open";

function feedbackOptions(copy: FeedbackCopy): FeedbackOption[] {
  return [
    { type: "bug", label: copy.reportBug, icon: Bug, color: "#ef4444" },
    { type: "suggestion", label: copy.suggestion, icon: Lightbulb, color: "#005EB8" },
    { type: "question", label: copy.platformQuestion, icon: HelpCircle, color: "#41B6E6" },
    { type: "praise", label: copy.rateUs, icon: ThumbsUp, color: "#22c55e" },
  ];
}

function getFeedbackContext(pathname: string, copy: FeedbackCopy): FeedbackContext {
  const path = pathname || "/";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

  const isInnovatorHost =
    hostname === "innovatorfoundervisaassistant.co.uk" ||
    hostname === "www.innovatorfoundervisaassistant.co.uk";

  if (
    isInnovatorHost ||
    path.startsWith("/uk/innovatorfoundervisaassistant")
  ) {
    return {
      label: copy.innovatorLabel,
      shortLabel: copy.innovatorShort,
      helper: copy.innovatorHelper,
    };
  }

  const isGlobalHost =
    hostname === "visaassistant.global" ||
    hostname === "www.visaassistant.global";

  if (path === "/v2" || (isGlobalHost && (path === "/" || path === ""))) {
    return {
      label: copy.globalLabel,
      shortLabel: copy.globalShort,
      helper: copy.globalHelper,
    };
  }

  return {
    label: copy.platformLabel,
    shortLabel: copy.platformShort,
    helper: copy.platformHelper,
  };
}

export default function FloatingFeedback() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const copy = getFeedbackCopy(language);
  const options = feedbackOptions(copy);
  const starLabels = ["", copy.poor, copy.fair, copy.good, copy.great, copy.excellent];
  const feedbackContext = getFeedbackContext(location, copy);

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("feedback_dismissed") === "true";
    }
    return false;
  });
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery<{
    id: string;
    email: string;
    firstName?: string;
  } | null>({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    const handleOverlayOpen = (event: Event) => {
      const source = (event as CustomEvent<string>).detail;
      if (source && source !== "feedback") {
        setIsOpen(false);
      }
    };

    window.addEventListener(OVERLAY_EVENT, handleOverlayOpen);
    return () => window.removeEventListener(OVERLAY_EVENT, handleOverlayOpen);
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: {
      type: FeedbackType;
      subject: string;
      message: string;
      email: string;
      rating?: number;
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
        title: copy.feedbackReceived,
        description: copy.thanksImprove,
      });
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
      }, 2000);
    },
    onError: () => {
      toast({
        title: copy.failedSubmit,
        description: copy.tryLater,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFeedbackType(null);
    setSubject("");
    setMessage("");
    setEmail("");
    setRating(0);
    setHoveredRating(0);
    setSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  };

  const openFeedback = () => {
    window.dispatchEvent(
      new CustomEvent(OVERLAY_EVENT, { detail: "feedback" }),
    );
    setIsOpen(true);
    setIsDismissed(false);
  };

  const handleSubmit = () => {
    if (!feedbackType) {
      toast({
        title: copy.selectType,
        variant: "destructive",
      });
      return;
    }
    if (!message.trim()) {
      toast({ title: copy.enterMessage, variant: "destructive" });
      return;
    }
    if (!user && !email.trim()) {
      toast({ title: copy.enterEmail, variant: "destructive" });
      return;
    }

    const optionLabel =
      options.find((option) => option.type === feedbackType)?.label ||
      copy.sendFeedback;
    const smartSubject =
      subject.trim() ||
      `[${feedbackContext.shortLabel}] ${optionLabel}: ${message
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 70)}`;

    const browserContext = [
      navigator.userAgent,
      `lang=${navigator.language || "unknown"}`,
      `tz=${Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"}`,
    ].join(" | ");

    submitMutation.mutate({
      type: feedbackType,
      subject: smartSubject,
      message: message.trim(),
      email: user?.email || email.trim(),
      rating: rating > 0 ? rating : undefined,
      pageUrl: window.location.href,
      userId: user?.id,
      browserInfo: browserContext,
      screenSize: `${window.innerWidth}x${window.innerHeight} viewport / ${window.screen.width}x${window.screen.height} screen`,
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

      {createPortal(
        <div className="fixed left-4 bottom-4 z-[9999]">
          <div
            className={`flex items-center gap-0.5 transition-all duration-300 ${
              isDismissed
                ? "scale-50 opacity-60 hover:opacity-100 hover:scale-75"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            <button
              onClick={() => {
                if (isOpen) {
                  handleClose();
                } else {
                  openFeedback();
                }
              }}
              className={`rounded-lg shadow-lg hover-elevate transition-all duration-300 flex flex-col items-center justify-center text-white ${
                isDismissed ? "w-8 h-8 rounded-full" : "w-[37px] h-[35px]"
              }`}
              style={{ background: "#005EB8" }}
              data-testid="button-feedback-toggle"
              aria-label={
                isDismissed
                  ? copy.restoreFeedback
                  : isOpen
                    ? copy.closeFeedback
                    : copy.sendFeedback
              }
            >
              {isOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <MessageSquareWarning className="w-4 h-4" />
              )}
            </button>

            {!isDismissed && !isOpen && (
              <button
                onClick={() => {
                  setIsDismissed(true);
                  sessionStorage.setItem("feedback_dismissed", "true");
                }}
                className="w-5 h-6 bg-red-500 hover:bg-red-600 rounded-r-full flex items-center justify-center text-white transition-colors shadow-sm"
                data-testid="button-dismiss-feedback"
                aria-label={copy.minimizeFeedback}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[9997] bg-transparent"
          onClick={() => setIsOpen(false)}
          data-testid="feedback-backdrop"
        />
      )}

      {isOpen && (
        <div
          className="fixed z-[9998] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-border overflow-hidden bg-background
            inset-0 sm:inset-auto
            sm:left-4 sm:bottom-16
            sm:w-[340px] md:w-[380px]
            sm:h-auto sm:max-h-[65vh]"
          data-testid="feedback-window"
          data-no-auto-translate
        >
          <div
            className="p-4 flex-shrink-0 flex items-start justify-between gap-3"
            style={{
              background: "linear-gradient(135deg, #41B6E6 0%, #005EB8 100%)",
            }}
          >
            <div className="flex items-start gap-2 min-w-0">
              <MessageSquareWarning className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{copy.sendFeedback}</h3>
                <p className="text-white/80 text-xs truncate">
                  {feedbackContext.label}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              data-testid="button-feedback-close"
              aria-label={copy.closeFeedback}
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
                <h4 className="font-semibold text-lg mb-2">{copy.thankYou}</h4>
                <p className="text-muted-foreground text-sm">
                  {copy.feedbackHelps}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <p className="text-xs font-medium text-foreground">
                    {copy.currentArea} {feedbackContext.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {feedbackContext.helper}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {copy.whatType}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((option) => {
                      const Icon = option.icon;
                      const isSelected = feedbackType === option.type;
                      return (
                        <button
                          key={option.type}
                          onClick={() => setFeedbackType(option.type)}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 text-xs font-medium ${
                            isSelected
                              ? "border-current bg-muted"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                          style={{
                            color: isSelected ? option.color : undefined,
                          }}
                          data-testid={`button-feedback-type-${option.type}`}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: option.color }}
                          />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {feedbackType === "question" && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-3 py-2 text-xs text-blue-900 dark:text-blue-100">
                    {copy.questionHint}
                  </div>
                )}

                {feedbackType && (
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      {copy.rateExperience}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({copy.optional})
                      </span>
                    </Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const display = hoveredRating || rating;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setRating(star === rating ? 0 : star)
                            }
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-0.5 transition-transform hover:scale-110"
                            data-testid={`button-rating-${star}`}
                            aria-label={copy.rateAria(star)}
                          >
                            <Star
                              className="w-6 h-6 transition-colors"
                              style={{
                                fill:
                                  star <= display ? "#f59e0b" : "transparent",
                                color:
                                  star <= display ? "#f59e0b" : "#9ca3af",
                              }}
                            />
                          </button>
                        );
                      })}
                      {(hoveredRating || rating) > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {starLabels[hoveredRating || rating]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="feedback-subject"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {copy.subject}{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="feedback-subject"
                    placeholder={copy.subjectPlaceholder}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-muted/50"
                    data-testid="input-feedback-subject"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="feedback-message"
                    className="text-sm font-medium mb-1.5 block"
                  >
                    {copy.yourMessage} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="feedback-message"
                    placeholder={
                      feedbackType === "bug"
                        ? copy.bugPlaceholder
                        : feedbackType === "suggestion"
                          ? copy.suggestionPlaceholder
                          : feedbackType === "question"
                            ? copy.questionPlaceholder
                            : feedbackType === "praise"
                              ? copy.praisePlaceholder
                              : copy.genericPlaceholder
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none min-h-[100px] bg-muted/50"
                    data-testid="input-feedback-message"
                  />
                </div>

                {!user && (
                  <div>
                    <Label
                      htmlFor="feedback-email"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      {copy.yourEmail} <span className="text-destructive">*</span>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {copy.followUp}
                    </p>
                  </div>
                )}

                {user && (
                  <p className="text-xs text-muted-foreground">
                    {copy.submittingAs}{" "}
                    <span className="font-medium">{user.email}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <div className="p-4 border-t flex-shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={
                  submitMutation.isPending ||
                  !feedbackType ||
                  !message.trim() ||
                  (!user && !email.trim())
                }
                className="w-full bg-gradient-to-r from-[#41B6E6] to-[#005EB8] hover:opacity-90"
                data-testid="button-feedback-send"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {copy.sending}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {copy.sendFeedback}
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
