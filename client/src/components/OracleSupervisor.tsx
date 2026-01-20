import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Brain,
  Lightbulb, 
  TrendingUp,
  BarChart3,
  Shield,
  Sparkles,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  Users,
  Zap,
  Target,
  Crown,
  MessageSquare,
  RotateCcw,
  Activity,
  Cpu,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import novaAvatar from "@assets/generated_images/nova_innovation_ai_avatar.webp";
import sterlingAvatar from "@assets/generated_images/sterling_financial_ai_avatar.webp";
import atlasAvatar from "@assets/generated_images/atlas_growth_ai_avatar.webp";
import sageAvatar from "@assets/generated_images/sage_compliance_ai_avatar.webp";

export type AgentType = 'oracle' | 'nova' | 'sterling' | 'atlas' | 'sage';

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
  expertise: string[];
  icon: typeof Brain;
  position: { angle: number };
}

const ORACLE_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='oracleGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffa536'/%3E%3Cstop offset='50%25' style='stop-color:%2311b6e9'/%3E%3Cstop offset='100%25' style='stop-color:%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='45' fill='url(%23oracleGrad)'/%3E%3Cpath d='M50 20 L65 40 L85 40 L70 55 L75 75 L50 65 L25 75 L30 55 L15 40 L35 40 Z' fill='white' opacity='0.9'/%3E%3Ccircle cx='50' cy='50' r='15' fill='white'/%3E%3Ccircle cx='50' cy='50' r='8' fill='url(%23oracleGrad)'/%3E%3C/svg%3E";

export const AGENTS: Record<AgentType, AgentPersona> = {
  oracle: {
    id: 'oracle',
    name: 'ORACLE',
    title: 'Master AI Supervisor',
    avatar: ORACLE_AVATAR,
    primaryColor: '#d946ef',
    gradientFrom: '#d946ef',
    gradientTo: '#8b5cf6',
    criterion: 'orchestration',
    personality: 'Omniscient, strategic, synthesizing',
    expertise: ['Multi-agent coordination', 'Strategic synthesis', 'Visa optimization', 'Cross-domain analysis'],
    icon: Brain,
    position: { angle: 0 }
  },
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
    expertise: ['Innovation assessment', 'Unique value proposition', 'Technology novelty', 'Disruption potential'],
    icon: Lightbulb,
    position: { angle: 0 }
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
    expertise: ['Financial projections', 'Revenue modeling', 'Funding strategy', 'Unit economics'],
    icon: TrendingUp,
    position: { angle: 90 }
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
    expertise: ['Market expansion', 'Scaling strategy', 'Job creation', 'UK economic impact'],
    icon: BarChart3,
    position: { angle: 180 }
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
    expertise: ['UK visa regulations', 'Home Office requirements', 'Endorser criteria', 'Legal compliance'],
    icon: Shield,
    position: { angle: 270 }
  }
};

interface Message {
  id: string;
  role: 'oracle' | 'agent' | 'user' | 'system';
  content: string;
  timestamp: Date;
  agentId?: AgentType;
  agentName?: string;
  thinking?: boolean;
  delegatedTo?: AgentType[];
  recommendations?: AgentRecommendation[];
}

interface AgentRecommendation {
  agentId: AgentType;
  analysis: string;
  score: number | null;
  suggestions: string[];
  isDirectAnswer?: boolean;
}

interface OracleTask {
  id: string;
  type: 'analyze' | 'generate' | 'review' | 'optimize';
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAgents: AgentType[];
  results?: Record<AgentType, string>;
}

interface OracleSupervisorProps {
  onComplete?: (results: any) => void;
  initialContext?: string;
  mode?: 'autopilot' | 'guided' | 'consultation';
}

function NeuralHub({ isProcessing, activeAgents }: { isProcessing: boolean; activeAgents: AgentType[] }) {
  return (
    <div className="relative">
      <motion.div
        className="w-32 h-32 md:w-40 md:h-40 rounded-full relative mx-auto"
        animate={{
          scale: isProcessing ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isProcessing ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-purple-500/30 backdrop-blur-xl border border-white/20" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-lg" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md flex items-center justify-center border border-white/10">
          <div className="text-center">
            <Brain className="w-10 h-10 md:w-12 md:h-12 mx-auto text-primary" />
            <span className="text-xs font-bold mt-1 block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ORACLE</span>
          </div>
        </div>
        {isProcessing && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" />
        )}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="url(#neuralGradient)"
            strokeWidth="2"
            strokeDasharray="8 4"
            className="animate-[spin_20s_linear_infinite]"
          />
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#005EB8" />
              <stop offset="50%" stopColor="#41B6E6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

function AgentOrbit({ agent, isActive, onClick, index }: { 
  agent: AgentPersona; 
  isActive: boolean; 
  onClick: () => void;
  index: number;
}) {
  const Icon = agent.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`
        relative cursor-pointer group
        transition-all duration-300 ease-out
        ${isActive ? 'scale-110 z-10' : 'hover:scale-105'}
      `}
    >
      <div 
        className={`
          relative p-4 md:p-5 rounded-2xl backdrop-blur-xl
          bg-gradient-to-br from-white/10 to-white/5
          border transition-all duration-300
          ${isActive 
            ? 'border-2 shadow-lg' 
            : 'border-white/10 hover:border-white/20'
          }
        `}
        style={{
          borderColor: isActive ? agent.primaryColor : undefined,
          boxShadow: isActive ? `0 0 30px ${agent.primaryColor}40` : undefined
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div 
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-background transition-all duration-300"
            style={{ 
              ringColor: isActive ? agent.primaryColor : 'transparent',
            }}
          >
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-full h-full object-cover"
            />
            {isActive && (
              <div 
                className="absolute inset-0 animate-pulse opacity-30"
                style={{ backgroundColor: agent.primaryColor }}
              />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="font-bold text-sm md:text-base" style={{ color: agent.primaryColor }}>
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground">{agent.title}</p>
          </div>
          
          {isActive && (
            <Badge 
              className="text-xs animate-pulse"
              style={{ backgroundColor: agent.primaryColor }}
            >
              <Activity className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <Icon className="w-3 h-3" style={{ color: agent.primaryColor }} />
            <span className="text-xs capitalize">{agent.criterion}</span>
          </div>
        </div>
        
        {isActive && (
          <motion.div
            className="absolute -inset-px rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${agent.primaryColor}20, transparent)`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

function NeuralConnections({ activeAgents }: { activeAgents: AgentType[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#005EB8" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#41B6E6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export function OracleSupervisor({ onComplete, initialContext, mode = 'consultation' }: OracleSupervisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentType[]>([]);
  const [currentTask, setCurrentTask] = useState<OracleTask | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(() => `oracle-${Date.now()}`);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  
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
    const greetingMessage: Message = {
      id: 'greeting',
      role: 'oracle',
      agentId: 'oracle',
      agentName: 'ORACLE',
      content: `Welcome to the ORACLE Command Center - your AI-powered visa intelligence hub.

I coordinate four specialized AI agents, each an expert in their domain:

• **Nova** - Innovation & Technology Assessment
• **Sterling** - Financial Viability & Projections
• **Atlas** - Growth Strategy & Scalability
• **Sage** - Compliance & UK Regulations

${mode === 'autopilot' ? 
  "**Autopilot Mode Active**: Tell me about your business, and I'll orchestrate all agents to build your complete visa application." :
  mode === 'guided' ? 
  "**Guided Mode**: I'll walk you through each step, consulting specialists as needed." :
  "**Consultation Mode**: Ask me anything about your UK visa application."}

What would you like to explore today?`,
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  }, [mode]);

  const delegateToAgents = async (query: string, agents: AgentType[]): Promise<AgentRecommendation[]> => {
    const recommendations: AgentRecommendation[] = [];
    
    for (const agentId of agents) {
      if (agentId === 'oracle') continue;
      
      const agent = AGENTS[agentId];
      try {
        const response = await apiRequest("POST", "/api/ai/oracle-delegate", {
          query,
          agentId,
          agentExpertise: agent.expertise,
          agentPersonality: agent.personality,
          criterion: agent.criterion
        });
        
        const data = await response.json();
        recommendations.push({
          agentId,
          analysis: data.analysis || `${agent.name} analyzed your query regarding ${agent.criterion}.`,
          score: data.score ?? null, // Allow null for direct answers
          suggestions: data.suggestions || [],
          isDirectAnswer: data.isDirectAnswer || false
        } as AgentRecommendation);
      } catch (error) {
        recommendations.push({
          agentId,
          analysis: `${agent.name} is analyzing your ${agent.criterion} aspects...`,
          score: 75,
          suggestions: [`Focus on ${agent.criterion} criteria for endorser approval.`]
        });
      }
    }
    
    return recommendations;
  };

  const synthesizeRecommendations = (recommendations: AgentRecommendation[]): string => {
    // Check if all recommendations are direct answers (no scores)
    const allDirectAnswers = recommendations.every(r => r.score === null || (r as any).isDirectAnswer);
    
    if (allDirectAnswers) {
      // For direct Q&A, just combine the answers without scores
      let synthesis = `## ORACLE Response\n\n`;
      
      for (const rec of recommendations) {
        const agent = AGENTS[rec.agentId];
        synthesis += `**${agent.name}** (${agent.criterion}):\n`;
        synthesis += `${rec.analysis}\n\n`;
      }
      
      synthesis += `\n*Ask me anything else about your UK Innovator Founder Visa!*`;
      return synthesis;
    }
    
    // For assessments, show scores and recommendations
    const validScores = recommendations.filter(r => r.score !== null);
    const avgScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, r) => sum + (r.score || 0), 0) / validScores.length)
      : 0;
    
    let synthesis = `## ORACLE Intelligence Report\n\n`;
    synthesis += `**Visa Readiness Score: ${avgScore}/100**\n\n`;
    
    synthesis += `### Agent Analysis:\n\n`;
    
    for (const rec of recommendations) {
      const agent = AGENTS[rec.agentId];
      if (rec.score !== null) {
        synthesis += `**${agent.name}** (${agent.criterion.toUpperCase()}): ${rec.score}/100\n`;
      } else {
        synthesis += `**${agent.name}** (${agent.criterion.toUpperCase()}):\n`;
      }
      synthesis += `${rec.analysis}\n\n`;
    }
    
    if (recommendations.some(r => r.suggestions && r.suggestions.length > 0)) {
      synthesis += `### Key Recommendations:\n`;
      recommendations.forEach(rec => {
        rec.suggestions?.forEach(s => {
          synthesis += `• ${s}\n`;
        });
      });
    }
    
    synthesis += `\n### Strategic Next Steps:\n`;
    if (avgScore >= 80) {
      synthesis += `Excellent readiness. Proceed to endorser submission with confidence.`;
    } else if (avgScore >= 60) {
      synthesis += `Good foundation. Address highlighted areas before submission.`;
    } else {
      synthesis += `Focus on lowest-scoring areas first for maximum impact.`;
    }
    
    return synthesis;
  };

  const determineRelevantAgents = (query: string): AgentType[] => {
    const queryLower = query.toLowerCase();
    const agents: AgentType[] = [];
    
    if (queryLower.includes('innovat') || queryLower.includes('technology') || 
        queryLower.includes('unique') || queryLower.includes('novel') || queryLower.includes('disrupt')) {
      agents.push('nova');
    }
    
    if (queryLower.includes('financ') || queryLower.includes('revenue') || 
        queryLower.includes('funding') || queryLower.includes('profit') || queryLower.includes('cost')) {
      agents.push('sterling');
    }
    
    if (queryLower.includes('growth') || queryLower.includes('scale') || 
        queryLower.includes('market') || queryLower.includes('expand') || queryLower.includes('job')) {
      agents.push('atlas');
    }
    
    if (queryLower.includes('visa') || queryLower.includes('compliance') || 
        queryLower.includes('home office') || queryLower.includes('endors') || queryLower.includes('legal')) {
      agents.push('sage');
    }
    
    if (agents.length === 0 || queryLower.includes('all') || queryLower.includes('complete') || 
        queryLower.includes('full') || queryLower.includes('everything')) {
      return ['nova', 'sterling', 'atlas', 'sage'];
    }
    
    return agents;
  };

  const handleSubmit = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsProcessing(true);
    
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      role: 'oracle',
      agentId: 'oracle',
      agentName: 'ORACLE',
      content: "Analyzing request and routing to specialist agents...",
      timestamp: new Date(),
      thinking: true
    };
    setMessages(prev => [...prev, thinkingMessage]);
    
    const relevantAgents = determineRelevantAgents(userInput);
    setActiveAgents(relevantAgents);
    
    for (let i = 0; i < relevantAgents.length; i++) {
      const agent = AGENTS[relevantAgents[i]];
      const agentThinking: Message = {
        id: `agent-thinking-${agent.id}-${Date.now()}`,
        role: 'agent',
        agentId: agent.id,
        agentName: agent.name,
        content: `${agent.name} processing ${agent.criterion} analysis...`,
        timestamp: new Date(),
        thinking: true
      };
      setMessages(prev => [...prev, agentThinking]);
      setOverallProgress(((i + 1) / relevantAgents.length) * 50);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      const recommendations = await delegateToAgents(userInput, relevantAgents);
      setOverallProgress(80);
      
      setMessages(prev => prev.filter(m => !m.thinking));
      
      for (const rec of recommendations) {
        const agent = AGENTS[rec.agentId];
        
        // Format content based on whether this is a direct answer or an assessment
        let messageContent: string;
        if (rec.isDirectAnswer || rec.score === null) {
          // Direct answer format - no score, just the analysis
          messageContent = `**${agent.name}'s Response**\n\n${rec.analysis}`;
        } else {
          // Assessment format with score and suggestions
          messageContent = `**${agent.name}'s Analysis** (Score: ${rec.score}/100)\n\n${rec.analysis}`;
          if (rec.suggestions && rec.suggestions.length > 0) {
            messageContent += `\n\n**Suggestions:**\n${rec.suggestions.map(s => `• ${s}`).join('\n')}`;
          }
        }
        
        const agentResponse: Message = {
          id: `agent-response-${rec.agentId}-${Date.now()}`,
          role: 'agent',
          agentId: rec.agentId,
          agentName: agent.name,
          content: messageContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentResponse]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      const synthesis = synthesizeRecommendations(recommendations);
      const oracleResponse: Message = {
        id: `oracle-synthesis-${Date.now()}`,
        role: 'oracle',
        agentId: 'oracle',
        agentName: 'ORACLE',
        content: synthesis,
        timestamp: new Date(),
        recommendations
      };
      setMessages(prev => [...prev, oracleResponse]);
      setOverallProgress(100);
      
    } catch (error) {
      setMessages(prev => prev.filter(m => !m.thinking));
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'oracle',
        agentId: 'oracle',
        agentName: 'ORACLE',
        content: "I encountered an issue while coordinating the agents. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
    setActiveAgents([]);
    setTimeout(() => setOverallProgress(0), 2000);
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

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
  };

  const resetConversation = () => {
    setMessages([]);
    setUserInput("");
    setIsProcessing(false);
    setActiveAgents([]);
    setCurrentTask(null);
    setOverallProgress(0);
    
    const greetingMessage: Message = {
      id: 'greeting-reset',
      role: 'oracle',
      agentId: 'oracle',
      agentName: 'ORACLE',
      content: "Session reset. How can I assist with your UK Innovator Founder Visa?",
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  };

  const getAgentAvatar = (agentId?: AgentType) => {
    if (!agentId) return ORACLE_AVATAR;
    return AGENTS[agentId]?.avatar || ORACLE_AVATAR;
  };

  const getAgentColor = (agentId?: AgentType) => {
    if (!agentId) return '#d946ef';
    return AGENTS[agentId]?.primaryColor || '#d946ef';
  };

  const agentList = Object.values(AGENTS).filter(a => a.id !== 'oracle');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="relative container max-w-7xl mx-auto px-4 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Neural Command Center</span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-2xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary via-secondary to-purple-500 bg-clip-text text-transparent">
                ORACLE
              </span>
              {" "}AI Supervisor
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Intelligent multi-agent system coordinating your UK Innovator Founder Visa journey
            </p>
          </motion.div>
          
          <div className="relative mb-8">
            <NeuralConnections activeAgents={activeAgents} />
            
            <div className="flex flex-col items-center gap-8">
              <NeuralHub isProcessing={isProcessing} activeAgents={activeAgents} />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
                {agentList.map((agent, index) => (
                  <AgentOrbit
                    key={agent.id}
                    agent={agent}
                    isActive={activeAgents.includes(agent.id)}
                    onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    index={index}
                  />
                ))}
              </div>
            </div>
            
            {activeAgents.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 max-w-md mx-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Processing Query</span>
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </motion.div>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="backdrop-blur-xl bg-card/80 border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Intelligence Console</h3>
                    <p className="text-xs text-muted-foreground">Multi-agent communication channel</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={resetConversation}
                  className="gap-2"
                  data-testid="button-reset-oracle"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {message.role !== 'user' && (
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-offset-2 ring-offset-background" style={{ ringColor: getAgentColor(message.agentId) }}>
                            <AvatarImage src={getAgentAvatar(message.agentId)} alt={message.agentName || 'Agent'} />
                            <AvatarFallback style={{ backgroundColor: getAgentColor(message.agentId) }}>
                              {message.agentName?.[0] || 'O'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          {message.role !== 'user' && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold" style={{ color: getAgentColor(message.agentId) }}>
                                {message.agentName}
                              </span>
                              {message.thinking && (
                                <Badge variant="outline" className="text-xs animate-pulse">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Processing
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className={`p-3 rounded-2xl ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : message.role === 'oracle'
                              ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-tl-sm'
                              : 'bg-muted/50 border border-white/10 rounded-tl-sm'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">
                              {message.content.split('\n').map((line, i) => {
                                if (line.startsWith('## ')) {
                                  return <h3 key={i} className="font-bold text-base mt-2 mb-1">{line.replace('## ', '')}</h3>;
                                }
                                if (line.startsWith('### ')) {
                                  return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.replace('### ', '')}</h4>;
                                }
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
                                }
                                if (line.startsWith('• ')) {
                                  return <p key={i} className="ml-2">{line}</p>;
                                }
                                return line ? <p key={i}>{line}</p> : <br key={i} />;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-white/10 bg-muted/30">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant={isListening ? "default" : "outline"}
                    onClick={toggleVoice}
                    className={`shrink-0 ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
                    data-testid="button-voice-oracle"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
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
                    placeholder="Ask ORACLE anything about your UK Innovator Founder Visa..."
                    className="flex-1 min-h-[44px] max-h-32 resize-none bg-background/50"
                    disabled={isProcessing}
                    data-testid="input-oracle-message"
                  />
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || isProcessing}
                    className="self-end shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    data-testid="button-send-oracle"
                  >
                    {isProcessing ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover-elevate transition-all hover:border-primary"
                    onClick={() => setUserInput("Analyze my complete visa application readiness")}
                    data-testid="badge-quick-action-analyze"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Full Analysis
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover-elevate transition-all hover:border-orange-500"
                    onClick={() => setUserInput("What are my innovation strengths and weaknesses?")}
                    data-testid="badge-quick-action-innovation"
                  >
                    <Lightbulb className="h-3 w-3 mr-1 text-orange-500" />
                    Innovation
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover-elevate transition-all hover:border-cyan-500"
                    onClick={() => setUserInput("Review my financial projections and viability")}
                    data-testid="badge-quick-action-financial"
                  >
                    <TrendingUp className="h-3 w-3 mr-1 text-cyan-500" />
                    Financial
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover-elevate transition-all hover:border-purple-500"
                    onClick={() => setUserInput("Check my compliance with UK visa requirements")}
                    data-testid="badge-quick-action-compliance"
                  >
                    <Shield className="h-3 w-3 mr-1 text-purple-500" />
                    Compliance
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OracleSupervisor;
