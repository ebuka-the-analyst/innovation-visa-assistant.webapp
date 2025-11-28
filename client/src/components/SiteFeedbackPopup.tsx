import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Sparkles, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_STORAGE_KEY = "site_feedback_state";
const TIME_THRESHOLD_MINUTES = 10;

interface FeedbackState {
  startTime: number;
  dismissed: boolean;
  submitted: boolean;
}

export function SiteFeedbackPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  
  const { data: user } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string; pageUrl: string; timeSpentMinutes: number }) => {
      return apiRequest("/api/feedback/site", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      const state = getFeedbackState();
      saveFeedbackState({ ...state, submitted: true });
      setIsOpen(false);
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    },
  });

  const getFeedbackState = useCallback((): FeedbackState => {
    try {
      const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return { startTime: Date.now(), dismissed: false, submitted: false };
  }, []);

  const saveFeedbackState = useCallback((state: FeedbackState) => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const state = getFeedbackState();
    
    if (!state.startTime) {
      saveFeedbackState({ startTime: Date.now(), dismissed: false, submitted: false });
    }
    
    if (state.dismissed || state.submitted) {
      return;
    }

    const checkTime = () => {
      const currentState = getFeedbackState();
      if (currentState.dismissed || currentState.submitted) return;
      
      const elapsed = Date.now() - currentState.startTime;
      const minutesElapsed = elapsed / (1000 * 60);
      
      if (minutesElapsed >= TIME_THRESHOLD_MINUTES) {
        setIsOpen(true);
      }
    };

    const interval = setInterval(checkTime, 30000);
    checkTime();

    return () => clearInterval(interval);
  }, [getFeedbackState, saveFeedbackState]);

  const handleDismiss = () => {
    const state = getFeedbackState();
    saveFeedbackState({ ...state, dismissed: true });
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    const state = getFeedbackState();
    const timeSpent = Math.round((Date.now() - state.startTime) / (1000 * 60));

    submitMutation.mutate({
      rating,
      comment: comment.trim(),
      pageUrl: window.location.pathname,
      timeSpentMinutes: timeSpent,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-background via-background to-muted/30 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
          data-testid="button-feedback-close"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[#ffa536] to-[#11b6e9] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            How's your experience so far?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
                data-testid={`button-rating-${star}`}
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-[#ffa536] text-[#ffa536]"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="What would make this better? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none min-h-[80px] bg-muted/50 border-muted-foreground/20 focus:border-[#ffa536]/50"
              data-testid="input-feedback-comment"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="flex-1"
              data-testid="button-feedback-skip"
            >
              Not now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex-1 bg-gradient-to-r from-[#ffa536] to-[#11b6e9] hover:opacity-90"
              data-testid="button-feedback-submit"
            >
              {submitMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
