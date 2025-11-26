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
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import novaAvatar from "@assets/generated_images/nova_innovation_ai_avatar.png";
import sterlingAvatar from "@assets/generated_images/sterling_financial_ai_avatar.png";
import atlasAvatar from "@assets/generated_images/atlas_growth_ai_avatar.png";
import sageAvatar from "@assets/generated_images/sage_compliance_ai_avatar.png";

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
    primaryColor: '#ffa536',
    gradientFrom: '#ffa536',
    gradientTo: '#ff7b00',
    criterion: 'innovation',
    personality: 'Creative, enthusiastic, forward-thinking',
    icon: Lightbulb
  },
  sterling: {
    id: 'sterling',
    name: 'Sterling',
    title: 'Financial Analyst',
    avatar: sterlingAvatar,
    primaryColor: '#11b6e9',
    gradientFrom: '#11b6e9',
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

interface AiToolGuideProps {
  config: ToolConfig;
  onComplete: (answers: Record<string, any>) => void;
  onSwitchToTraditional?: () => void;
  className?: string;
}

export function AiToolGuide({ config, onComplete, onSwitchToTraditional, className }: AiToolGuideProps) {
  const agent = AGENTS[config.agent];
  const storageKey = `ai-tool-guide-${config.toolId}`;
  
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

  useEffect(() => {
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
  }, [config.toolId]);

  useEffect(() => {
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
  }, [messages, currentQuestionIndex, answers, xp, streak, isComplete, storageKey]);

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

  return (
    <Card className={`overflow-hidden ${className}`}>
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
            <span>{currentQuestionIndex}/{config.questions.length}</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
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
}

export function AiTraditionalToggle({
  mode,
  onModeChange,
  aiLabel = "AI-Guided",
  traditionalLabel = "Traditional Form",
  className
}: {
  mode: 'ai' | 'traditional';
  onModeChange: (mode: 'ai' | 'traditional') => void;
  aiLabel?: string;
  traditionalLabel?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 p-1 bg-muted rounded-lg ${className}`}>
      <button
        onClick={() => onModeChange('ai')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'ai' 
            ? 'bg-gradient-to-r from-[#ffa536] to-[#11b6e9] text-white shadow-md' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="button-mode-ai"
      >
        <MessageSquare className="h-4 w-4" />
        {aiLabel}
        <Badge variant="secondary" className="ml-1 text-xs bg-white/20">Recommended</Badge>
      </button>
      <button
        onClick={() => onModeChange('traditional')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'traditional' 
            ? 'bg-background text-foreground shadow-md' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="button-mode-traditional"
      >
        <FileText className="h-4 w-4" />
        {traditionalLabel}
      </button>
    </div>
  );
}
