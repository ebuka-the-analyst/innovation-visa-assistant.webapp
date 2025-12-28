import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Sparkles, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_STORAGE_KEY = "site_feedback_state_v2";
const TIME_THRESHOLD_MINUTES = 10;
const MAX_SHOWS_PER_WEEK = 3;
const MIN_DAYS_BETWEEN_SHOWS = 2;

interface FeedbackState {
  sessionStartTime: number;
  showHistory: number[];
  lastDismissedTime: number | null;
  submitted: boolean;
}

export function SiteFeedbackPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [location] = useLocation();
  
  const { data: user } = useQuery<{ id: string; email: string } | null>({
    queryKey: ["/api/auth/user"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      rating: number; 
      comment: string; 
      pageUrl: string; 
      timeSpentMinutes: number;
      browserInfo: string;
      screenSize: string;
      referrer: string;
    }) => {
      return apiRequest("POST", "/api/feedback/site", data);
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
        const parsed = JSON.parse(saved);
        if (parsed.sessionStartTime && Array.isArray(parsed.showHistory)) {
          return parsed;
        }
      }
    } catch (e) {}
    const initialState: FeedbackState = { 
      sessionStartTime: Date.now(), 
      showHistory: [],
      lastDismissedTime: null,
      submitted: false 
    };
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(initialState));
    } catch (e) {}
    return initialState;
  }, []);

  const saveFeedbackState = useCallback((state: FeedbackState) => {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, []);

  const cleanOldShowHistory = useCallback((showHistory: number[]): number[] => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return showHistory.filter(timestamp => timestamp > oneWeekAgo);
  }, []);

  const canShowFeedback = useCallback((): boolean => {
    const state = getFeedbackState();
    
    if (state.submitted) {
      return false;
    }

    const recentShows = cleanOldShowHistory(state.showHistory);
    
    if (recentShows.length >= MAX_SHOWS_PER_WEEK) {
      return false;
    }

    if (recentShows.length > 0) {
      const lastShow = Math.max(...recentShows);
      const daysSinceLastShow = (Date.now() - lastShow) / (24 * 60 * 60 * 1000);
      if (daysSinceLastShow < MIN_DAYS_BETWEEN_SHOWS) {
        return false;
      }
    }

    if (state.lastDismissedTime) {
      const hoursSinceDismiss = (Date.now() - state.lastDismissedTime) / (60 * 60 * 1000);
      if (hoursSinceDismiss < 24) {
        return false;
      }
    }

    return true;
  }, [getFeedbackState, cleanOldShowHistory]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const isDashboard = location === '/dashboard' || location.startsWith('/dashboard');
    if (!isDashboard) {
      return;
    }

    if (!canShowFeedback()) {
      return;
    }

    const state = getFeedbackState();

    const checkTime = () => {
      if (!canShowFeedback()) return;
      
      const currentState = getFeedbackState();
      const elapsed = Date.now() - currentState.sessionStartTime;
      const minutesElapsed = elapsed / (1000 * 60);
      
      if (minutesElapsed >= TIME_THRESHOLD_MINUTES) {
        const updatedHistory = cleanOldShowHistory(currentState.showHistory);
        updatedHistory.push(Date.now());
        saveFeedbackState({ 
          ...currentState, 
          showHistory: updatedHistory 
        });
        setIsOpen(true);
      }
    };

    const interval = setInterval(checkTime, 30000);
    
    setTimeout(checkTime, 1000);

    return () => clearInterval(interval);
  }, [user, location, getFeedbackState, canShowFeedback, cleanOldShowHistory, saveFeedbackState]);

  const handleDismiss = () => {
    const state = getFeedbackState();
    saveFeedbackState({ 
      ...state, 
      lastDismissedTime: Date.now(),
      sessionStartTime: Date.now()
    });
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
    const timeSpent = Math.round((Date.now() - state.sessionStartTime) / (1000 * 60));
    
    const browserInfo = `${navigator.userAgent}`;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    const referrer = document.referrer || "direct";

    submitMutation.mutate({
      rating,
      comment: comment.trim(),
      pageUrl: window.location.pathname,
      timeSpentMinutes: timeSpent,
      browserInfo,
      screenSize,
      referrer,
    });
  };

  if (!user) {
    return null;
  }

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
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[#005EB8] to-[#41B6E6] flex items-center justify-center">
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
                      ? "fill-[#005EB8] text-[#005EB8]"
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
              className="resize-none min-h-[80px] bg-muted/50 border-muted-foreground/20 focus:border-[#005EB8]/50"
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
              className="flex-1 bg-gradient-to-r from-[#005EB8] to-[#41B6E6] hover:opacity-90"
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
