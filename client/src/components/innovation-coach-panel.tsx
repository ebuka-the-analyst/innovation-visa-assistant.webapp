import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Rocket,
  Target,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  MessageSquare,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Zap,
  Brain,
  ArrowRight,
  Star,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface CoachingInsight {
  type: 'strength' | 'improvement' | 'critical' | 'tip';
  category: 'innovation' | 'scalability' | 'viability' | 'general';
  message: string;
  actionable?: string;
}

interface LiveScore {
  innovation: number;
  scalability: number;
  viability: number;
  overall: number;
  trend: 'up' | 'down' | 'stable';
  insights: CoachingInsight[];
}

interface InnovationCoachPanelProps {
  businessConcept: string;
  industrySlug: string;
  currentSection?: string;
  formData?: Record<string, any>;
  onSuggestionApply?: (field: string, value: string) => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function InnovationCoachPanel({
  businessConcept,
  industrySlug,
  currentSection,
  formData = {},
  onSuggestionApply,
  minimized = false,
  onToggleMinimize
}: InnovationCoachPanelProps) {
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'coach'; message: string }>>([]);

  const debouncedFormData = useDebounce(JSON.stringify(formData), 1500);

  const analyzeScoreMutation = useMutation({
    mutationFn: async (data: { concept: string; industry: string; section?: string; formData: Record<string, any> }) => {
      const res = await apiRequest('POST', '/api/ai/coach/analyze', data);
      return res.json();
    },
    onSuccess: (data: LiveScore) => {
      setLiveScore(prev => {
        if (!prev) return data;
        return {
          ...data,
          trend: data.overall > prev.overall ? 'up' : data.overall < prev.overall ? 'down' : 'stable'
        };
      });
    }
  });

  const enhanceMutation = useMutation({
    mutationFn: async (data: { field: string; currentValue: string; context: string }) => {
      const res = await apiRequest('POST', '/api/ai/coach/enhance', data);
      return res.json();
    },
    onSuccess: (data) => {
      setAiSuggestion(data.suggestion);
    }
  });

  const askCoachMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest('POST', '/api/ai/coach/ask', {
        question,
        context: { businessConcept, industrySlug, currentSection, formData }
      });
      return res.json();
    },
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'coach', message: data.response }]);
    }
  });

  useEffect(() => {
    if (businessConcept && industrySlug) {
      analyzeScoreMutation.mutate({
        concept: businessConcept,
        industry: industrySlug,
        section: currentSection,
        formData: JSON.parse(debouncedFormData)
      });
    }
  }, [debouncedFormData, currentSection]);

  const handleAskCoach = useCallback(() => {
    if (!questionInput.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', message: questionInput }]);
    askCoachMutation.mutate(questionInput);
    setQuestionInput('');
  }, [questionInput, askCoachMutation]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getInsightIcon = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength': return CheckCircle2;
      case 'improvement': return AlertTriangle;
      case 'critical': return Shield;
      case 'tip': return Lightbulb;
    }
  };

  const getInsightColor = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'strength': return 'text-green-500 bg-green-500/10';
      case 'improvement': return 'text-amber-500 bg-amber-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'tip': return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getCategoryIcon = (category: CoachingInsight['category']) => {
    switch (category) {
      case 'innovation': return Lightbulb;
      case 'scalability': return TrendingUp;
      case 'viability': return Rocket;
      default: return Target;
    }
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
        data-testid="coach-panel-minimized"
      >
        <Button
          onClick={onToggleMinimize}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          data-testid="button-expand-coach"
        >
          <div className="relative">
            <Brain className="h-6 w-6" />
            {liveScore && (
              <div className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white",
                getScoreBackground(liveScore.overall)
              )}>
                {Math.round(liveScore.overall / 10)}
              </div>
            )}
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 space-y-4"
      data-testid="coach-panel"
    >
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              Innovation Coach
            </CardTitle>
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleMinimize}
                data-testid="button-minimize-coach"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {liveScore ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Live Score</span>
                  <div className="flex items-center gap-1">
                    <span className={cn("text-lg font-bold", getScoreColor(liveScore.overall))}>
                      {liveScore.overall}
                    </span>
                    <span className="text-muted-foreground text-sm">/100</span>
                    {liveScore.trend === 'up' && (
                      <motion.div
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <ChevronUp className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                    {liveScore.trend === 'down' && (
                      <motion.div
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <ChevronDown className="h-4 w-4 text-red-500" />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      Innovation
                    </span>
                    <span className={getScoreColor(liveScore.innovation)}>{liveScore.innovation}</span>
                  </div>
                  <Progress value={liveScore.innovation} className="h-1.5" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      Scalability
                    </span>
                    <span className={getScoreColor(liveScore.scalability)}>{liveScore.scalability}</span>
                  </div>
                  <Progress value={liveScore.scalability} className="h-1.5" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Rocket className="h-3 w-3 text-green-500" />
                      Viability
                    </span>
                    <span className={getScoreColor(liveScore.viability)}>{liveScore.viability}</span>
                  </div>
                  <Progress value={liveScore.viability} className="h-1.5" />
                </div>
              </div>

              {liveScore.insights.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Live Insights</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {liveScore.insights.slice(0, 4).map((insight, idx) => {
                        const InsightIcon = getInsightIcon(insight.type);
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "p-2 rounded-lg text-xs",
                              getInsightColor(insight.type)
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <InsightIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <div>
                                <p>{insight.message}</p>
                                {insight.actionable && (
                                  <p className="mt-1 opacity-80 italic">{insight.actionable}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="py-6 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Analyzing your concept...
              </p>
            </div>
          )}

          <Separator />

          <Collapsible open={showChat} onOpenChange={setShowChat}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-xs" data-testid="button-toggle-chat">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask Innovation Coach
                </span>
                {showChat ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {chatHistory.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded-lg text-xs",
                        msg.role === 'user' 
                          ? "bg-muted ml-4" 
                          : "bg-primary/10 text-primary mr-4"
                      )}
                    >
                      {msg.message}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about innovation, visa requirements..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="min-h-[60px] text-xs resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskCoach();
                    }
                  }}
                  data-testid="input-coach-question"
                />
              </div>
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={handleAskCoach}
                disabled={!questionInput.trim() || askCoachMutation.isPending}
                data-testid="button-send-question"
              >
                {askCoachMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Ask Coach
                  </>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 flex-shrink-0">
                  <Wand2 className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    AI Enhancement
                  </h4>
                  <p className="text-xs text-muted-foreground">{aiSuggestion}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setAiSuggestion(null)}
                      data-testid="button-dismiss-suggestion"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        if (onSuggestionApply) {
                          onSuggestionApply('current', aiSuggestion);
                        }
                        setAiSuggestion(null);
                      }}
                      data-testid="button-apply-suggestion"
                    >
                      Apply
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                {currentSection === 'innovation' && "Focus on what's genuinely novel - not just 'new to you' but new to the market."}
                {currentSection === 'scalability' && "Show clear metrics for growth potential - UK endorsers want to see numbers."}
                {currentSection === 'viability' && "Demonstrate you've thought through risks and have realistic execution plans."}
                {!currentSection && "Complete each section thoroughly - endorsers review every detail carefully."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}