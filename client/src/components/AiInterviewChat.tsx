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
  Pause,
  Play,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Trophy,
  Crown,
  Rocket,
  Target,
  Shield,
  BarChart3,
  Users,
  FileText,
  Sparkles
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
  gradientFrom: string;
  gradientTo: string;
  criterion: string;
  personality: string;
  greeting: string;
  icon: typeof Lightbulb;
}

const AGENTS: Record<string, AgentPersona> = {
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Innovation Specialist',
    avatar: novaAvatar,
    primaryColor: '#41B6E6',
    gradientFrom: '#41B6E6',
    gradientTo: '#0072CE',
    criterion: 'innovation',
    personality: 'Creative, enthusiastic, forward-thinking',
    greeting: "Hi! I'm Nova, your Innovation Specialist. I'll help you articulate what makes your business truly innovative. Let's explore your unique value proposition together!",
    icon: Lightbulb
  },
  sterling: {
    id: 'sterling',
    name: 'Sterling',
    title: 'Financial Analyst',
    avatar: sterlingAvatar,
    primaryColor: '#eab308',
    gradientFrom: '#eab308',
    gradientTo: '#ca8a04',
    criterion: 'viability',
    personality: 'Analytical, precise, business-focused',
    greeting: "Hello! I'm Sterling, your Financial Analyst. I'll help you build a compelling financial case that demonstrates your business viability. Let's dive into the numbers!",
    icon: TrendingUp
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    title: 'Growth Strategist',
    avatar: atlasAvatar,
    primaryColor: '#059669',
    gradientFrom: '#059669',
    gradientTo: '#047857',
    criterion: 'scalability',
    personality: 'Strategic, ambitious, growth-oriented',
    greeting: "Welcome! I'm Atlas, your Growth Strategist. I'll help you map out a scalable growth strategy that shows real potential for expansion. Let's plan your path to success!",
    icon: BarChart3
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    title: 'Compliance Expert',
    avatar: sageAvatar,
    primaryColor: '#005EB8',
    gradientFrom: '#005EB8',
    gradientTo: '#003087',
    criterion: 'compliance',
    personality: 'Thorough, knowledgeable, detail-oriented',
    greeting: "Greetings! I'm Sage, your Compliance Expert. I'll ensure your application meets all regulatory requirements and endorser expectations. Let's make your case bulletproof!",
    icon: Shield
  }
};

const ACHIEVEMENT_ICONS: Record<string, typeof Rocket> = {
  rocket: Rocket,
  flame: Flame,
  zap: Zap,
  star: Star,
  award: Award,
  users: Users,
  trophy: Trophy,
  lightbulb: Lightbulb,
  'trending-up': TrendingUp,
  'bar-chart': BarChart3,
  shield: Shield,
  crown: Crown,
  clock: Clock,
  'file-text': FileText,
  'check-circle': CheckCircle2
};

const SESSION_STORAGE_KEY = 'ai-interview-session';
const MESSAGES_STORAGE_KEY = 'ai-interview-messages';
const ANSWERED_IDS_STORAGE_KEY = 'ai-interview-answered-ids';

const saveToLocalStorage = (session: InterviewSession | null, messages: Message[], answeredIds: string[]) => {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    if (messages.length > 0) {
      const serializableMessages = messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }));
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(serializableMessages));
    }
    if (answeredIds.length > 0) {
      localStorage.setItem(ANSWERED_IDS_STORAGE_KEY, JSON.stringify(answeredIds));
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

const loadFromLocalStorage = (): { session: InterviewSession | null; messages: Message[]; answeredIds: string[] } => {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    const messagesStr = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const answeredIdsStr = localStorage.getItem(ANSWERED_IDS_STORAGE_KEY);
    
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    const messages = messagesStr 
      ? JSON.parse(messagesStr).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      : [];
    const answeredIds = answeredIdsStr ? JSON.parse(answeredIdsStr) : [];
    
    return { session, messages, answeredIds };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return { session: null, messages: [], answeredIds: [] };
  }
};

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    localStorage.removeItem(ANSWERED_IDS_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }
};

interface Message {
  id: string;
  role: 'agent' | 'user' | 'system';
  agent?: string;
  content: string;
  timestamp: Date;
  questionId?: string;
  qualityScore?: number;
  feedback?: string;
  isTyping?: boolean;
  questionData?: {
    category: string;
    subcategory: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
    points: number;
  };
}

interface Level {
  level: number;
  title: string;
  minXP: number;
  color: string;
  progress: number;
  nextLevelXP: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
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
  complianceScore?: number;
  overallReadiness: number;
  approvalProbability: number;
  currentStreak: number;
  longestStreak?: number;
  totalXP: number;
  level?: Level;
  achievements?: string[];
  detailedAnswerCount?: number;
}

interface QuestionResponse {
  question: string;
  questionId: string;
  questionData?: {
    category: string;
    subcategory: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
    points: number;
    tips?: string[];
  };
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
  earnedXP: number;
  bonusXP: number;
  improvementSuggestions: string[];
  milestone: Achievement | null;
  newAchievements: Achievement[];
  leveledUp: boolean;
  newLevel: Level | null;
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
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<Level | null>(null);
  const [earnedXPAnimation, setEarnedXPAnimation] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentAgent = session?.currentAgent || 'nova';
  const agent = AGENTS[currentAgent];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-GB';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
      
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !voiceEnabled) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = synthRef.current.getVoices();
    const britishVoice = voices.find(voice => 
      voice.lang.includes('en-GB') || voice.name.includes('British')
    );
    if (britishVoice) {
      utterance.voice = britishVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleVoice = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

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
        
        if (voiceEnabled) {
          speak(data.agent?.greeting || AGENTS.nova.greeting);
        }
        
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
      const saved = loadFromLocalStorage();
      if (saved.session && saved.messages.length > 0) {
        setSession(saved.session);
        setMessages(saved.messages);
        setAnsweredQuestionIds(saved.answeredIds);
        setIsInitialized(true);
        onSessionUpdate?.(saved.session);
      } else {
        initializeSession();
      }
    }
  }, []);
  
  useEffect(() => {
    if (session && messages.length > 0 && !messages.some(m => m.isTyping)) {
      saveToLocalStorage(session, messages, answeredQuestionIds);
    }
  }, [session, messages, answeredQuestionIds]);

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
        answeredQuestions: activeSession.totalQuestionsAnswered,
        answeredQuestionIds
      });
      
      const data: QuestionResponse = await res.json();
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const questionMessage: Message = {
        id: `q-${Date.now()}`,
        role: 'agent',
        agent: activeSession.currentAgent || 'nova',
        content: data.question,
        timestamp: new Date(),
        questionId: data.questionId,
        questionData: data.questionData
      };
      setMessages(prev => [...prev, questionMessage]);
      
      if (voiceEnabled) {
        speak(data.question);
      }
      
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
        tier,
        currentStreak: session?.currentStreak || 0,
        totalXP: session?.totalXP || 0,
        totalQuestionsAnswered: session?.totalQuestionsAnswered || 0,
        achievements: session?.achievements || [],
        detailedAnswerCount: session?.detailedAnswerCount || 0
      });
      
      const data: AnswerResponse = await res.json();
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      if (lastQuestion?.questionId) {
        setAnsweredQuestionIds(prev => [...prev, lastQuestion.questionId!]);
      }
      
      if (data.feedback) {
        setLastScoreChange(data.scoreChange || 0);
        setShowFeedback(true);
        
        if (data.earnedXP) {
          setEarnedXPAnimation(data.earnedXP);
          setTimeout(() => setEarnedXPAnimation(null), 2000);
        }
        
        const feedbackMessage: Message = {
          id: `f-${Date.now()}`,
          role: 'agent',
          agent: currentAgent,
          content: data.feedback,
          timestamp: new Date(),
          qualityScore: data.qualityScore
        };
        setMessages(prev => [...prev, feedbackMessage]);
        
        if (voiceEnabled) {
          speak(data.feedback);
        }
        
        setTimeout(() => setShowFeedback(false), 3000);
      }
      
      if (data.session) {
        setSession(data.session);
        onSessionUpdate?.(data.session);
      }
      
      if (data.leveledUp && data.newLevel) {
        setShowLevelUp(data.newLevel);
        setTimeout(() => setShowLevelUp(null), 4000);
      }
      
      if (data.newAchievements && data.newAchievements.length > 0) {
        data.newAchievements.forEach((achievement, index) => {
          setTimeout(() => {
            setShowAchievement(achievement);
            setTimeout(() => setShowAchievement(null), 3000);
          }, index * 3500);
        });
      }
      
      setTimeout(() => {
        if (data.switchAgent && data.nextAgent) {
          switchToAgent(data.nextAgent);
        } else {
          askNextQuestion();
        }
      }, 2500);
      
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
      role: 'system',
      content: `Switching to ${newAgent.name} - ${newAgent.title}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, transitionMessage]);
    
    setTimeout(() => {
      const greetingMessage: Message = {
        id: `g-${Date.now()}`,
        role: 'agent',
        agent: newAgentId,
        content: `Great progress on innovation! Now let's focus on ${newAgent.criterion}. ${newAgent.greeting}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, greetingMessage]);
      
      if (voiceEnabled) {
        speak(greetingMessage.content);
      }
      
      if (session) {
        const updatedSession = { ...session, currentAgent: newAgentId };
        setSession(updatedSession);
        onSessionUpdate?.(updatedSession);
      }
      
      setTimeout(() => askNextQuestion(), 2000);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const progressPercent = session 
    ? (session.totalQuestionsAnswered / session.totalQuestions) * 100 
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Preparing Your AI Interview</h3>
        <p className="text-muted-foreground">Setting up your personalized interview session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-xl shadow-amber-500/20">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="p-3 rounded-full bg-amber-500/30"
                >
                  {ACHIEVEMENT_ICONS[showAchievement.icon] && 
                    (() => {
                      const Icon = ACHIEVEMENT_ICONS[showAchievement.icon];
                      return <Icon className="h-8 w-8 text-amber-400" />;
                    })()
                  }
                </motion.div>
                <div>
                  <p className="text-sm text-amber-400 font-medium">Achievement Unlocked!</p>
                  <h4 className="text-lg font-bold text-foreground">{showAchievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{showAchievement.description}</p>
                  <Badge className="mt-2 bg-amber-500/30 text-amber-300">+{showAchievement.xp} XP</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
          >
            <Card className="p-8 text-center bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <Crown className="h-16 w-16 mx-auto text-primary mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Level Up!</h3>
              <p className="text-4xl font-black mb-2" style={{ color: showLevelUp.color }}>
                Level {showLevelUp.level}
              </p>
              <p className="text-xl font-semibold text-muted-foreground">{showLevelUp.title}</p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 bg-primary rounded-full mt-4"
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 p-4"
        style={{ 
          borderImage: `linear-gradient(to right, ${agent?.gradientFrom}, ${agent?.gradientTo}) 1`
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <motion.div
              key={agent?.id}
              initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <Avatar 
                className="h-14 w-14 ring-2 ring-offset-2 ring-offset-background" 
                style={{ '--tw-ring-color': agent?.primaryColor } as React.CSSProperties}
              >
                <AvatarImage src={agent?.avatar} alt={agent?.name} />
                <AvatarFallback>{agent?.name?.[0]}</AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-1 -right-1 p-1 rounded-full"
                style={{ background: `linear-gradient(135deg, ${agent?.gradientFrom}, ${agent?.gradientTo})` }}
              >
                {agent?.icon && <agent.icon className="h-3 w-3 text-white" />}
              </motion.div>
            </motion.div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {agent?.name}
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: agent?.primaryColor, 
                    color: agent?.primaryColor,
                    background: `${agent?.primaryColor}10`
                  }}
                >
                  {agent?.title}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground capitalize">{agent?.criterion} Assessment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {session?.level && session.level.level && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <Target className="h-4 w-4" style={{ color: session.level.color || '#94a3b8' }} />
                <span className="text-sm font-medium">Lv.{session.level.level}</span>
                <span className="text-xs text-muted-foreground">{session.level.title || 'Newcomer'}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-amber-500">{session?.totalXP || 0}</span>
              <AnimatePresence>
                {earnedXPAnimation && (
                  <motion.span
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-sm font-bold text-green-500"
                  >
                    +{earnedXPAnimation}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-500">{session?.currentStreak || 0}</span>
            </div>
            
            {speechSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className="h-9 w-9"
                data-testid="button-toggle-voice"
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="icon"
              onClick={togglePause}
              className="h-9 w-9"
              data-testid="button-pause-interview"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Your Progress
            </span>
            <span className="font-medium text-emerald-600">{progressPercent.toFixed(1)}% Complete</span>
          </div>
          <div className="relative">
            <Progress value={progressPercent} className="h-2.5" />
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full opacity-30"
              style={{ 
                background: `linear-gradient(90deg, ${agent?.gradientFrom}, ${agent?.gradientTo})`,
                width: `${progressPercent}%`
              }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring" }}
              className={`flex ${message.role === 'user' ? 'justify-end' : message.role === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {message.role === 'system' && (
                <Badge variant="outline" className="text-xs py-1 px-3">
                  {message.content}
                </Badge>
              )}
              
              {message.role === 'agent' && (
                <div className="flex gap-3 max-w-[85%]">
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-1" style={{ '--tw-ring-color': AGENTS[message.agent || 'nova']?.primaryColor } as React.CSSProperties}>
                    <AvatarImage src={AGENTS[message.agent || 'nova']?.avatar} />
                    <AvatarFallback>{AGENTS[message.agent || 'nova']?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {message.isTyping ? (
                      <Card className="p-3 bg-muted/50 backdrop-blur-sm">
                        <div className="flex gap-1.5">
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: AGENTS[message.agent || 'nova']?.primaryColor }}
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: AGENTS[message.agent || 'nova']?.primaryColor }}
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: AGENTS[message.agent || 'nova']?.primaryColor }}
                          />
                        </div>
                      </Card>
                    ) : (
                      <Card 
                        className="p-4 bg-muted/50 backdrop-blur-sm border-l-4"
                        style={{ borderLeftColor: AGENTS[message.agent || 'nova']?.primaryColor }}
                      >
                        {message.questionData && message.questionData.difficulty && (
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge className={`text-xs ${getDifficultyColor(message.questionData.difficulty)}`}>
                              {message.questionData.difficulty}
                            </Badge>
                            {message.questionData.category && (
                              <Badge variant="outline" className="text-xs">
                                {message.questionData.category}
                              </Badge>
                            )}
                            {message.questionData.points && (
                              <Badge variant="outline" className="text-xs">
                                +{message.questionData.points} pts
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.qualityScore !== undefined && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Answer Quality</span>
                                  <span className="text-xs font-medium">{message.qualityScore}%</span>
                                </div>
                                <Progress 
                                  value={message.qualityScore} 
                                  className="h-1.5"
                                />
                              </div>
                              <Badge 
                                variant={message.qualityScore >= 80 ? "default" : message.qualityScore >= 60 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {message.qualityScore >= 90 ? (
                                  <><Star className="h-3 w-3 mr-1" /> Excellent</>
                                ) : message.qualityScore >= 80 ? (
                                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Great</>
                                ) : message.qualityScore >= 60 ? (
                                  <><TrendingUp className="h-3 w-3 mr-1" /> Good</>
                                ) : (
                                  <><AlertCircle className="h-3 w-3 mr-1" /> Improve</>
                                )}
                              </Badge>
                            </div>
                          </motion.div>
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
                  <Card 
                    className="p-4 text-primary-foreground"
                    style={{ 
                      background: `linear-gradient(135deg, ${agent?.gradientFrom}, ${agent?.gradientTo})`
                    }}
                  >
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
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20"
          >
            <Badge 
              variant={lastScoreChange > 0 ? "default" : "destructive"}
              className="text-lg px-5 py-2.5 shadow-lg"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {lastScoreChange > 0 ? '+' : ''}{lastScoreChange}% Readiness
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="border-t bg-background/95 backdrop-blur-sm p-4">
        {isPaused ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <Pause className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">Interview paused. Your progress is saved.</p>
            <Button onClick={togglePause} data-testid="button-resume-interview">
              <Play className="h-4 w-4 mr-2" /> Resume Interview
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer here... (Press Enter to send)"
                  className="min-h-[90px] resize-none pr-12"
                  disabled={isProcessing}
                  data-testid="input-interview-answer"
                />
                {speechSupported && (
                  <Button
                    variant={isListening ? "default" : "ghost"}
                    size="icon"
                    onClick={toggleListening}
                    className={`absolute bottom-2 right-2 h-8 w-8 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    disabled={isProcessing}
                    data-testid="button-voice-input"
                  >
                    {isListening ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                        <MicOff className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isProcessing}
                  className="flex-1 px-6"
                  style={{ 
                    background: inputValue.trim() ? `linear-gradient(135deg, ${agent?.gradientFrom}, ${agent?.gradientTo})` : undefined 
                  }}
                  data-testid="button-send-answer"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setInputValue('')}
                  disabled={!inputValue}
                  size="sm"
                  data-testid="button-clear-input"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Tip: Include specific numbers, dates, and examples for higher scores</span>
              </div>
              <div className="flex items-center gap-4">
                {speechSupported && (
                  <span className="flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    Voice {voiceEnabled ? 'On' : 'Off'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Auto-saves
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
