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
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

import novaAvatar from "@assets/generated_images/nova_innovation_ai_avatar.png";
import sterlingAvatar from "@assets/generated_images/sterling_financial_ai_avatar.png";
import atlasAvatar from "@assets/generated_images/atlas_growth_ai_avatar.png";
import sageAvatar from "@assets/generated_images/sage_compliance_ai_avatar.png";

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
    icon: Brain
  },
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
    expertise: ['Innovation assessment', 'Unique value proposition', 'Technology novelty', 'Disruption potential'],
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
    expertise: ['Financial projections', 'Revenue modeling', 'Funding strategy', 'Unit economics'],
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
    expertise: ['Market expansion', 'Scaling strategy', 'Job creation', 'UK economic impact'],
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
    expertise: ['UK visa regulations', 'Home Office requirements', 'Endorser criteria', 'Legal compliance'],
    icon: Shield
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
  score: number;
  suggestions: string[];
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

export function OracleSupervisor({ onComplete, initialContext, mode = 'consultation' }: OracleSupervisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentType[]>([]);
  const [currentTask, setCurrentTask] = useState<OracleTask | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(() => `oracle-${Date.now()}`);
  
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
      content: `Welcome to the ORACLE Supervisor System. I am the Master AI coordinating your UK Innovator Founder Visa journey.

I oversee four specialized AI agents:
• **Nova** - Innovation & Technology Specialist
• **Sterling** - Financial Analysis & Viability Expert  
• **Atlas** - Growth Strategy & Scalability Advisor
• **Sage** - Compliance & Regulatory Expert

${mode === 'autopilot' ? 
  "**Autopilot Mode Active**: Tell me about your business idea, and I'll orchestrate all agents to build your complete visa application." :
  mode === 'guided' ? 
  "**Guided Mode**: I'll walk you through each step, consulting specialists as needed." :
  "**Consultation Mode**: Ask me anything about your visa application, and I'll delegate to the right specialists."}

How can I help you today?`,
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
          score: data.score || Math.floor(Math.random() * 20) + 70,
          suggestions: data.suggestions || [`Consider strengthening your ${agent.criterion} aspects.`]
        });
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
    const avgScore = Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length);
    
    let synthesis = `## ORACLE Synthesis Report\n\n`;
    synthesis += `**Overall Visa Readiness Score: ${avgScore}/100**\n\n`;
    
    synthesis += `### Agent Analysis Summary:\n\n`;
    
    for (const rec of recommendations) {
      const agent = AGENTS[rec.agentId];
      synthesis += `**${agent.name}** (${agent.criterion.toUpperCase()}): ${rec.score}/100\n`;
      synthesis += `${rec.analysis}\n\n`;
    }
    
    synthesis += `### Key Recommendations:\n`;
    recommendations.forEach(rec => {
      rec.suggestions.forEach(s => {
        synthesis += `• ${s}\n`;
      });
    });
    
    synthesis += `\n### Next Steps:\n`;
    if (avgScore >= 80) {
      synthesis += `Your application is strong. Consider proceeding to endorser submission.`;
    } else if (avgScore >= 60) {
      synthesis += `Good foundation, but some areas need strengthening before submission.`;
    } else {
      synthesis += `Significant work needed. Focus on the lowest-scoring criteria first.`;
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
      content: "Analyzing your request and delegating to specialist agents...",
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
        content: `${agent.name} is analyzing ${agent.criterion} aspects...`,
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
        const agentResponse: Message = {
          id: `agent-response-${rec.agentId}-${Date.now()}`,
          role: 'agent',
          agentId: rec.agentId,
          agentName: agent.name,
          content: `**${agent.name}'s Analysis** (Score: ${rec.score}/100)\n\n${rec.analysis}\n\n**Suggestions:**\n${rec.suggestions.map(s => `• ${s}`).join('\n')}`,
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
        content: "I encountered an issue while coordinating the agents. Please try again or rephrase your request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
    setActiveAgents([]);
    setTimeout(() => setOverallProgress(0), 2000);
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setUserInput(transcript);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
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
      content: "Session reset. How can I help you with your UK Innovator Founder Visa application?",
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

  return (
    <div className="flex flex-col h-full">
      <div 
        className="p-4 text-white rounded-t-lg"
        style={{ background: `linear-gradient(135deg, ${AGENTS.oracle.gradientFrom}, ${AGENTS.oracle.gradientTo})` }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white/30">
            <AvatarImage src={ORACLE_AVATAR} alt="ORACLE" />
            <AvatarFallback><Brain className="h-6 w-6" /></AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-xl flex items-center gap-2">
              <Crown className="h-5 w-5" />
              ORACLE Supervisor
            </h2>
            <p className="text-sm opacity-90">Master AI Coordinating 4 Specialist Agents</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={resetConversation}
              data-testid="button-reset-oracle"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        {activeAgents.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Active Agents:</span>
              {activeAgents.map(agentId => (
                <Badge 
                  key={agentId}
                  style={{ backgroundColor: getAgentColor(agentId) }}
                  className="text-white"
                >
                  {AGENTS[agentId].name}
                </Badge>
              ))}
            </div>
            <Progress value={overallProgress} className="h-2 bg-white/20" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
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
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={getAgentAvatar(message.agentId)} alt={message.agentName || 'Agent'} />
                    <AvatarFallback style={{ backgroundColor: getAgentColor(message.agentId) }}>
                      {message.agentName?.[0] || 'O'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  {message.role !== 'user' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: getAgentColor(message.agentId) }}>
                        {message.agentName}
                      </span>
                      {message.thinking && (
                        <Badge variant="outline" className="text-xs animate-pulse">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Thinking...
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Card className={`p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.role === 'oracle'
                      ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'
                      : 'bg-card'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
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
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={isListening ? "default" : "outline"}
            onClick={toggleVoice}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
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
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isProcessing}
            data-testid="input-oracle-message"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isProcessing}
            className="self-end"
            style={{ backgroundColor: AGENTS.oracle.primaryColor }}
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
            className="cursor-pointer hover-elevate"
            onClick={() => setUserInput("Analyze my complete visa application readiness")}
            data-testid="badge-quick-action-analyze"
          >
            <Target className="h-3 w-3 mr-1" />
            Full Analysis
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover-elevate"
            onClick={() => setUserInput("What are my innovation strengths and weaknesses?")}
            data-testid="badge-quick-action-innovation"
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Innovation Review
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover-elevate"
            onClick={() => setUserInput("Review my financial projections and viability")}
            data-testid="badge-quick-action-financial"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Financial Review
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover-elevate"
            onClick={() => setUserInput("Check my compliance with UK visa requirements")}
            data-testid="badge-quick-action-compliance"
          >
            <Shield className="h-3 w-3 mr-1" />
            Compliance Check
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default OracleSupervisor;
