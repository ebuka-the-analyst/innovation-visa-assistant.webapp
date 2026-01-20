import { useState, useEffect, useRef, useCallback } from "react";
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
  Award,
  Zap,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  BarChart3,
  Shield,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  FileText,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import novaAvatar from "@assets/generated_images/nova_innovation_ai_avatar.webp";
import sterlingAvatar from "@assets/generated_images/sterling_financial_ai_avatar.webp";
import atlasAvatar from "@assets/generated_images/atlas_growth_ai_avatar.webp";
import sageAvatar from "@assets/generated_images/sage_compliance_ai_avatar.webp";

export type AgentType = 'nova' | 'sterling' | 'atlas' | 'sage';

interface AgentPersona {
  id: AgentType;
  name: string;
  title: string;
  avatar: string;
  primaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  criterion: string;
  personality: string;
  icon: typeof Lightbulb;
}

const AGENTS: Record<AgentType, AgentPersona> = {
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Innovation Specialist',
    avatar: novaAvatar,
    primaryColor: '#005EB8',
    gradientFrom: '#005EB8',
    gradientTo: '#003087',
    criterion: 'innovation',
    personality: 'Creative, enthusiastic, forward-thinking',
    icon: Lightbulb
  },
  sterling: {
    id: 'sterling',
    name: 'Sterling',
    title: 'Financial Analyst',
    avatar: sterlingAvatar,
    primaryColor: '#41B6E6',
    gradientFrom: '#41B6E6',
    gradientTo: '#0891b2',
    criterion: 'viability',
    personality: 'Analytical, precise, business-focused',
    icon: TrendingUp
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    title: 'Growth Strategist',
    avatar: atlasAvatar,
    primaryColor: '#22c55e',
    gradientFrom: '#22c55e',
    gradientTo: '#16a34a',
    criterion: 'scalability',
    personality: 'Strategic, ambitious, growth-oriented',
    icon: BarChart3
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    title: 'Compliance Expert',
    avatar: sageAvatar,
    primaryColor: '#8b5cf6',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
    criterion: 'compliance',
    personality: 'Thorough, knowledgeable, detail-oriented',
    icon: Shield
  }
};

export interface ToolQuestion {
  id: string;
  question: string;
  hint?: string;
  fieldKey: string;
  fieldType?: 'text' | 'number' | 'select';
  options?: string[];
  minLength?: number;
  required?: boolean;
}

export interface ToolConfig {
  toolId: string;
  toolName: string;
  agent: AgentType;
  greeting: string;
  questions: ToolQuestion[];
  completionMessage?: string;
}

interface Message {
  id: string;
  role: 'agent' | 'user' | 'system';
  content: string;
  timestamp: Date;
  questionId?: string;
  qualityScore?: number;
  feedback?: string;
  isTyping?: boolean;
}

interface SidePanelProps {
  answers: Record<string, any>;
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  xp: number;
  streak: number;
  agent: AgentPersona;
  config: ToolConfig;
}

interface AiToolGuideProps {
  config: ToolConfig;
  onComplete: (answers: Record<string, any>) => void;
  onSwitchToTraditional?: () => void;
  sidePanel?: (props: SidePanelProps) => React.ReactNode;
  sidePanelWidth?: 'narrow' | 'default' | 'wide';
  className?: string;
  userTier?: string;
}

function DefaultSidePanel({ answers, progress, currentQuestionIndex, totalQuestions, xp, streak, agent, config }: SidePanelProps) {
  const answeredCount = Object.keys(answers).length;
  const avgQualityScore = answeredCount > 0 
    ? Math.round(Object.values(answers).reduce((sum: number, ans: any) => {
        const len = String(ans || '').length;
        return sum + Math.min(100, 40 + (len >= 50 ? 10 : 0) + (len >= 100 ? 10 : 0) + (len >= 200 ? 10 : 0));
      }, 0) / answeredCount)
    : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Your Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium text-emerald-600">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold" style={{ color: agent.primaryColor }}>{xp}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold" style={{ color: agent.primaryColor }}>{streak}x</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
      </Card>

      {answeredCount > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Response Quality
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={agent.primaryColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251}
                  strokeDashoffset={251 - (251 * avgQualityScore) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{avgQualityScore}%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {avgQualityScore >= 80 ? 'Excellent detail!' : avgQualityScore >= 60 ? 'Good progress' : 'Add more detail'}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Tips for Better Answers
        </h3>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Use specific numbers and data where possible</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Include real examples from your business</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Reference evidence you can provide to endorsers</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Explain "why" not just "what"</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

export { DefaultSidePanel };
export type { SidePanelProps };

export function AiToolGuide({ config, onComplete, onSwitchToTraditional, sidePanel, sidePanelWidth = 'default', className, userTier = 'free' }: AiToolGuideProps) {
  const agent = AGENTS[config.agent];
  const storageKey = `ai-tool-guide-${config.toolId}`;
  const isPaidUser = userTier !== 'free';
  
  // All hooks must be called unconditionally to satisfy React's rules of hooks
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clear stored AI session and reset state for free users
  useEffect(() => {
    if (!isPaidUser) {
      // Clear localStorage
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
      // Reset all AI state to prevent data leaks from prior sessions
      setMessages([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setUserInput("");
      setIsTyping(false);
      setXp(0);
      setStreak(0);
      setIsComplete(false);
      setIsListening(false);
    }
  }, [isPaidUser, storageKey]);

  useEffect(() => {
    // Skip initialization for free users
    if (!isPaidUser) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.messages) setMessages(state.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (state.currentQuestionIndex !== undefined) setCurrentQuestionIndex(state.currentQuestionIndex);
        if (state.answers) setAnswers(state.answers);
        if (state.xp) setXp(state.xp);
        if (state.streak) setStreak(state.streak);
        if (state.isComplete) setIsComplete(state.isComplete);
        return;
      }
    } catch (e) {}
    
    const greetingMessage: Message = {
      id: 'greeting',
      role: 'agent',
      content: config.greeting,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
    
    setTimeout(() => {
      askQuestion(0);
    }, 1500);
  }, [config.toolId, isPaidUser]);

  useEffect(() => {
    // Skip localStorage persistence for free users
    if (!isPaidUser) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        messages: messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        currentQuestionIndex,
        answers,
        xp,
        streak,
        isComplete
      }));
    } catch (e) {}
  }, [messages, currentQuestionIndex, answers, xp, streak, isComplete, storageKey, isPaidUser]);
  
  // RENDER GATE: Show upgrade prompt for free users after hooks have run
  if (!isPaidUser) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#005EB8] to-[#41B6E6] text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI-Guided Mode</h3>
            <p className="text-sm text-muted-foreground">Premium feature - upgrade to access</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get personalised guidance from our AI agents who specialise in UK Innovator Founder Visa requirements. 
          Upgrade to unlock this feature.
        </p>
        <div className="flex gap-3">
          <a href="/pricing">
            <Button variant="destructive">
              <Lock className="h-4 w-4 mr-2" />
              Upgrade to Unlock
            </Button>
          </a>
          {onSwitchToTraditional && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onSwitchToTraditional}>
              Use Traditional Form
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const askQuestion = (index: number) => {
    if (index >= config.questions.length) {
      completeInterview();
      return;
    }
    
    const question = config.questions[index];
    setIsTyping(true);
    
    setTimeout(() => {
      const questionMessage: Message = {
        id: `q-${question.id}`,
        role: 'agent',
        content: question.question + (question.hint ? `\n\n💡 *Hint: ${question.hint}*` : ''),
        timestamp: new Date(),
        questionId: question.id
      };
      
      setMessages(prev => [...prev, questionMessage]);
      setIsTyping(false);
    }, 800);
  };

  const calculateQualityScore = (answer: string, question: ToolQuestion): number => {
    let score = 40;
    
    if (answer.length >= 50) score += 10;
    if (answer.length >= 100) score += 10;
    if (answer.length >= 200) score += 10;
    
    const keywords = ['because', 'specifically', 'for example', 'such as', 'including', 'therefore', 'evidence', 'data', 'measured', 'validated'];
    keywords.forEach(kw => {
      if (answer.toLowerCase().includes(kw)) score += 3;
    });
    
    if (/\d+/.test(answer)) score += 5;
    if (/£\d/.test(answer) || /\$\d/.test(answer)) score += 8;
    
    return Math.min(100, score);
  };

  const generateFeedback = async (answer: string, question: ToolQuestion): Promise<string> => {
    try {
      const response = await apiRequest('POST', '/api/ai/tool-feedback', {
        toolId: config.toolId,
        question: question.question,
        answer,
        agentPersonality: agent.personality
      }) as { feedback?: string };
      
      if (response && response.feedback) {
        return response.feedback;
      }
    } catch (e) {}
    
    const qualityScore = calculateQualityScore(answer, question);
    if (qualityScore >= 80) {
      return "Excellent response! This level of detail will strengthen your application.";
    } else if (qualityScore >= 60) {
      return "Good answer. Consider adding more specific examples or data to make it even stronger.";
    } else {
      return "This is a start. Try to be more specific with measurable details, examples, or evidence.";
    }
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isTyping) return;
    
    const currentQuestion = config.questions[currentQuestionIndex];
    const answer = userInput.trim();
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: answer,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);
    
    const qualityScore = calculateQualityScore(answer, currentQuestion);
    const feedback = await generateFeedback(answer, currentQuestion);
    
    const earnedXp = Math.round(qualityScore * 0.5);
    setXp(prev => prev + earnedXp);
    setStreak(prev => qualityScore >= 60 ? prev + 1 : 0);
    
    setAnswers(prev => ({ ...prev, [currentQuestion.fieldKey]: answer }));
    
    setTimeout(() => {
      const feedbackMessage: Message = {
        id: `feedback-${Date.now()}`,
        role: 'agent',
        content: feedback,
        timestamp: new Date(),
        qualityScore,
        feedback: `+${earnedXp} XP`
      };
      
      setMessages(prev => [...prev, feedbackMessage]);
      setIsTyping(false);
      
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      setTimeout(() => {
        askQuestion(nextIndex);
      }, 1000);
    }, 1200);
  };

  const completeInterview = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      const completionMessage: Message = {
        id: 'completion',
        role: 'agent',
        content: config.completionMessage || `Fantastic work! You've completed all questions for ${config.toolName}. I'm now populating your responses into the form. Review and refine as needed!`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
      setIsTyping(false);
      setIsComplete(true);
      
      onComplete(answers);
    }, 800);
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setMessages([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setXp(0);
    setStreak(0);
    setIsComplete(false);
    
    const greetingMessage: Message = {
      id: 'greeting',
      role: 'agent',
      content: config.greeting,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
    
    setTimeout(() => {
      askQuestion(0);
    }, 1500);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-GB';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  const progress = Math.round((currentQuestionIndex / config.questions.length) * 100);
  
  const sidePanelProps: SidePanelProps = {
    answers,
    progress,
    currentQuestionIndex,
    totalQuestions: config.questions.length,
    xp,
    streak,
    agent,
    config
  };

  const panelWidthClass = sidePanelWidth === 'narrow' ? 'lg:w-[35%]' : sidePanelWidth === 'wide' ? 'lg:w-[50%]' : 'lg:w-[40%]';
  const chatWidthClass = sidePanelWidth === 'narrow' ? 'lg:w-[65%]' : sidePanelWidth === 'wide' ? 'lg:w-[50%]' : 'lg:w-[60%]';

  const chatContent = (
    <Card className="overflow-hidden flex-1">
      <div 
        className="p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${agent.gradientFrom}, ${agent.gradientTo})` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{agent.name}</h3>
              <p className="text-sm opacity-90">{agent.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">{xp} XP</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold">{streak}x</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 bg-white/30" />
        </div>
      </div>
      
      <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/30">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                {message.role === 'agent' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">{agent.name}</span>
                  </div>
                )}
                
                <div 
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-card border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.qualityScore !== undefined && (
                    <div className="mt-2 pt-2 border-t border-current/10 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {message.feedback}
                      </Badge>
                      <span className="text-xs opacity-70">
                        Quality: {message.qualityScore}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 bg-card border rounded-2xl px-4 py-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-background">
        {!isComplete ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type your answer..."
                className="min-h-[80px] resize-none"
                disabled={isTyping}
                data-testid="input-ai-response"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoiceInput}
                  className={isListening ? 'text-red-500' : ''}
                  data-testid="button-voice-input"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {onSwitchToTraditional && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSwitchToTraditional}
                    className="text-muted-foreground"
                    data-testid="button-switch-traditional"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Switch to Form
                  </Button>
                )}
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={!userInput.trim() || isTyping}
                style={{ backgroundColor: agent.primaryColor }}
                data-testid="button-send"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-500 py-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">All questions completed!</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
                data-testid="button-restart"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              {onSwitchToTraditional && (
                <Button
                  onClick={onSwitchToTraditional}
                  className="flex-1"
                  style={{ backgroundColor: agent.primaryColor }}
                  data-testid="button-view-form"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View & Edit Form
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      <div className={`w-full ${chatWidthClass}`}>
        {chatContent}
      </div>
      <div className={`w-full ${panelWidthClass}`}>
        {sidePanel ? sidePanel(sidePanelProps) : <DefaultSidePanel {...sidePanelProps} />}
      </div>
    </div>
  );
}

interface AiTraditionalToggleProps {
  mode: 'ai' | 'traditional';
  onModeChange: (mode: 'ai' | 'traditional') => void;
  aiLabel?: string;
  traditionalLabel?: string;
  className?: string;
  userTier?: string;
}

export function AiTraditionalToggle({
  mode,
  onModeChange,
  aiLabel = "AI-Guided",
  traditionalLabel = "Traditional Form",
  className,
  userTier = "free"
}: AiTraditionalToggleProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const isPaidUser = userTier !== "free";
  
  const handleAiClick = () => {
    if (isPaidUser) {
      onModeChange('ai');
    } else {
      setShowUpgradePrompt(true);
    }
  };
  
  return (
    <>
      <div className={`flex items-center gap-2 p-1 bg-muted rounded-lg ${className}`}>
        <button
          onClick={handleAiClick}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'ai' && isPaidUser
              ? 'bg-gradient-to-r from-[#005EB8] to-[#41B6E6] text-white shadow-md' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          data-testid="button-mode-ai"
        >
          <MessageSquare className="h-4 w-4" />
          {aiLabel}
          {isPaidUser ? (
            <Badge variant="secondary" className="ml-1 text-xs bg-white/20">Recommended</Badge>
          ) : (
            <Badge variant="secondary" className="ml-1 text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400">Premium</Badge>
          )}
        </button>
        <button
          onClick={() => onModeChange('traditional')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'traditional' || !isPaidUser
              ? 'bg-background text-foreground shadow-md' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          data-testid="button-mode-traditional"
        >
          <FileText className="h-4 w-4" />
          {traditionalLabel}
        </button>
      </div>
      
      <AnimatePresence>
        {showUpgradePrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradePrompt(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <Card className="p-6 shadow-xl border overflow-hidden">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#005EB8] to-[#41B6E6] text-white shadow-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Unlock AI-Guided Experience</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get personalised guidance from our specialised AI agents who understand UK visa requirements.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>4 expert AI agents: Nova, Sterling, Atlas & Sage</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Real-time feedback on your answers</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Context-aware tips for each question</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>XP rewards & gamified progress tracking</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mb-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      Available from <span className="font-semibold text-primary">Basic Plan (£15/mo)</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowUpgradePrompt(false);
                        window.location.href = '/pricing';
                      }}
                      className="flex-1 bg-gradient-to-r from-[#005EB8] to-[#41B6E6] hover:opacity-90"
                      data-testid="button-upgrade-ai"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                    <Button
                      onClick={() => setShowUpgradePrompt(false)}
                      variant="outline"
                      data-testid="button-continue-free"
                    >
                      Use Traditional Form
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
