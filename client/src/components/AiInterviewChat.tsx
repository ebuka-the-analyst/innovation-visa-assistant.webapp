import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Lightbulb, 
  TrendingUp,
  Pause,
  Play,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import novaAvatar from "@assets/generated_images/nova_innovation_ai_avatar.png";
import sterlingAvatar from "@assets/generated_images/sterling_financial_ai_avatar.png";
import atlasAvatar from "@assets/generated_images/atlas_growth_ai_avatar.png";
import sageAvatar from "@assets/generated_images/sage_compliance_ai_avatar.png";

interface AgentPersona {
  id: 'nova' | 'sterling' | 'atlas' | 'sage';
  name: string;
  title: string;
  avatar: string;
  primaryColor: string;
  criterion: string;
  personality: string;
  greeting: string;
}

const AGENTS: Record<string, AgentPersona> = {
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Innovation Specialist',
    avatar: novaAvatar,
    primaryColor: '#ffa536',
    criterion: 'innovation',
    personality: 'Creative, enthusiastic, forward-thinking',
    greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you articulate what makes your business truly innovative. Let's explore your unique value proposition together!"
  },
  sterling: {
    id: 'sterling',
    name: 'Sterling',
    title: 'Financial Analyst',
    avatar: sterlingAvatar,
    primaryColor: '#11b6e9',
    criterion: 'viability',
    personality: 'Analytical, precise, business-focused',
    greeting: "Hello! I'm Sterling, your Financial Analyst. I'll help you build a compelling financial case that demonstrates your business viability. Let's dive into the numbers!"
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    title: 'Growth Strategist',
    avatar: atlasAvatar,
    primaryColor: '#22c55e',
    criterion: 'scalability',
    personality: 'Strategic, ambitious, growth-oriented',
    greeting: "Welcome! I'm Atlas, your Growth Strategist. I'll help you map out a scalable growth strategy that shows real potential for expansion. Let's plan your path to success!"
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    title: 'Compliance Expert',
    avatar: sageAvatar,
    primaryColor: '#8b5cf6',
    criterion: 'compliance',
    personality: 'Thorough, knowledgeable, detail-oriented',
    greeting: "Greetings! I'm Sage, your Compliance Expert. I'll ensure your application meets all regulatory requirements and endorser expectations. Let's make your case bulletproof!"
  }
};

interface Message {
  id: string;
  role: 'agent' | 'user';
  agent?: string;
  content: string;
  timestamp: Date;
  questionId?: string;
  qualityScore?: number;
  feedback?: string;
  isTyping?: boolean;
}

interface InterviewSession {
  id: string;
  currentAgent: string;
  currentSection: number;
  totalQuestionsAnswered: number;
  totalQuestions: number;
  innovationScore: number;
  viabilityScore: number;
  scalabilityScore: number;
  overallReadiness: number;
  approvalProbability: number;
  currentStreak: number;
  totalXP: number;
}

interface QuestionResponse {
  question: string;
  questionId: string;
  section: number;
  switchAgent: boolean;
  nextAgent: string;
  session: InterviewSession;
}

interface AnswerResponse {
  success: boolean;
  qualityScore: number;
  feedback: string;
  scoreChange: number;
  improvementSuggestions: string[];
  milestone: { title: string; xp: number; icon: string } | null;
  switchAgent?: boolean;
  nextAgent?: string;
  session: InterviewSession;
}

interface AiInterviewChatProps {
  tier: string;
  onSessionUpdate?: (session: InterviewSession) => void;
}

export default function AiInterviewChat({ tier, onSessionUpdate }: AiInterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentAgent = session?.currentAgent || 'nova';
  const agent = AGENTS[currentAgent];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const res = await apiRequest('POST', '/api/ai-interview/start', { tier });
      const data = await res.json();
      
      if (data.session) {
        setSession(data.session);
        onSessionUpdate?.(data.session);
        
        const greeting: Message = {
          id: 'greeting',
          role: 'agent',
          agent: data.agent?.id || 'nova',
          content: data.agent?.greeting || AGENTS.nova.greeting,
          timestamp: new Date()
        };
        setMessages([greeting]);
        setIsInitialized(true);
        
        setTimeout(() => {
          askNextQuestion(data.session);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to start interview session:', err);
      setError('Failed to start interview. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      initializeSession();
    }
  }, []);

  const askNextQuestion = async (currentSession?: InterviewSession) => {
    const activeSession = currentSession || session;
    if (!activeSession) {
      setError('No active session. Please restart the interview.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    const typingMessage: Message = {
      id: 'typing',
      role: 'agent',
      agent: activeSession.currentAgent || 'nova',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const res = await apiRequest('POST', '/api/ai-interview/next-question', {
        sessionId: activeSession.id,
        tier,
        currentAgent: activeSession.currentAgent || 'nova',
        answeredQuestions: messages.filter(m => m.role === 'user').length
      });
      
      const data: QuestionResponse = await res.json();
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const questionMessage: Message = {
        id: `q-${Date.now()}`,
        role: 'agent',
        agent: activeSession.currentAgent || 'nova',
        content: data.question,
        timestamp: new Date(),
        questionId: data.questionId
      };
      setMessages(prev => [...prev, questionMessage]);
      
      if (data.session) {
        setSession(data.session);
        onSessionUpdate?.(data.session);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      console.error('Error getting next question:', err);
      setError('Failed to get next question. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || isPaused) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    const typingMessage: Message = {
      id: 'typing',
      role: 'agent',
      agent: currentAgent,
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const lastQuestion = [...messages].reverse().find(m => m.role === 'agent' && m.questionId);
      
      const res = await apiRequest('POST', '/api/ai-interview/submit-answer', {
        sessionId: session?.id,
        questionId: lastQuestion?.questionId,
        answer: userMessage.content,
        tier
      });
      
      const data: AnswerResponse = await res.json();
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      if (data.feedback) {
        setLastScoreChange(data.scoreChange || 0);
        setShowFeedback(true);
        
        const feedbackMessage: Message = {
          id: `f-${Date.now()}`,
          role: 'agent',
          agent: currentAgent,
          content: data.feedback,
          timestamp: new Date(),
          qualityScore: data.qualityScore
        };
        setMessages(prev => [...prev, feedbackMessage]);
        
        setTimeout(() => setShowFeedback(false), 3000);
      }
      
      if (data.session) {
        setSession(data.session);
        onSessionUpdate?.(data.session);
      }
      
      if (data.milestone) {
        showMilestoneNotification(data.milestone);
      }
      
      setTimeout(() => {
        if (data.switchAgent && data.nextAgent) {
          switchToAgent(data.nextAgent);
        } else {
          askNextQuestion();
        }
      }, 2000);
      
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      console.error('Error submitting answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const switchToAgent = (newAgentId: string) => {
    const newAgent = AGENTS[newAgentId];
    if (!newAgent) return;
    
    const transitionMessage: Message = {
      id: `t-${Date.now()}`,
      role: 'agent',
      agent: newAgentId,
      content: `Great progress! Now let's talk about ${newAgent.criterion}. ${newAgent.greeting}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, transitionMessage]);
    
    if (session) {
      setSession({ ...session, currentAgent: newAgentId });
    }
    
    setTimeout(() => askNextQuestion(), 2000);
  };

  const showMilestoneNotification = (milestone: { title: string; xp: number }) => {
    console.log('Milestone achieved:', milestone);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const progressPercent = session 
    ? (session.totalQuestionsAnswered / session.totalQuestions) * 100 
    : 0;

  if (error && !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Start Interview</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={initializeSession} data-testid="button-retry-interview">
          Try Again
        </Button>
      </div>
    );
  }

  if (!isInitialized && isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-4"
        >
          <Zap className="h-12 w-12 text-primary" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Preparing Your Interview</h3>
        <p className="text-muted-foreground">Setting up your AI interview session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <motion.div
              key={agent?.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-12 w-12 ring-2" style={{ '--tw-ring-color': agent?.primaryColor } as React.CSSProperties}>
                <AvatarImage src={agent?.avatar} alt={agent?.name} />
                <AvatarFallback>{agent?.name?.[0]}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {agent?.name}
                <Badge variant="outline" className="text-xs" style={{ borderColor: agent?.primaryColor, color: agent?.primaryColor }}>
                  {agent?.title}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">{agent?.criterion} assessment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{session?.totalXP || 0} XP</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-medium">{session?.currentStreak || 0} streak</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              data-testid="button-pause-interview"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress: {session?.totalQuestionsAnswered || 0} / {session?.totalQuestions || 475} questions</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'agent' && (
                <div className="flex gap-3 max-w-[85%]">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={AGENTS[message.agent || 'nova']?.avatar} />
                    <AvatarFallback>{AGENTS[message.agent || 'nova']?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    {message.isTyping ? (
                      <Card className="p-3 bg-muted">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-2 h-2 bg-muted-foreground rounded-full"
                          />
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-4 bg-muted">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.qualityScore !== undefined && (
                          <div className="mt-2 pt-2 border-t flex items-center gap-2">
                            <Badge 
                              variant={message.qualityScore >= 80 ? "default" : message.qualityScore >= 60 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {message.qualityScore >= 80 ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Excellent</>
                              ) : message.qualityScore >= 60 ? (
                                <><TrendingUp className="h-3 w-3 mr-1" /> Good</>
                              ) : (
                                <><AlertCircle className="h-3 w-3 mr-1" /> Can improve</>
                              )}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Quality: {message.qualityScore}%
                            </span>
                          </div>
                        )}
                      </Card>
                    )}
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
              
              {message.role === 'user' && (
                <div className="max-w-[75%]">
                  <Card className="p-4 bg-primary text-primary-foreground">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  <span className="text-xs text-muted-foreground mt-1 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <AnimatePresence>
        {showFeedback && lastScoreChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
          >
            <Badge 
              variant={lastScoreChange > 0 ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {lastScoreChange > 0 ? '+' : ''}{lastScoreChange} Readiness Score
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="border-t bg-background p-4">
        {isPaused ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">Interview paused. Your progress is saved.</p>
            <Button onClick={togglePause} data-testid="button-resume-interview">
              <Play className="h-4 w-4 mr-2" /> Resume Interview
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here... (Press Enter to send)"
              className="min-h-[80px] resize-none"
              disabled={isProcessing}
              data-testid="input-interview-answer"
            />
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isProcessing}
                className="flex-1"
                data-testid="button-send-answer"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setInputValue('')}
                disabled={!inputValue}
                data-testid="button-clear-input"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Tip: Provide specific examples and numbers for higher scores</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Session auto-saves every 30 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
