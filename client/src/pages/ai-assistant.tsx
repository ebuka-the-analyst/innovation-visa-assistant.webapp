import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, MessageCircle, AlertCircle, Trash2, Sparkles, HelpCircle, 
  FileText, Calculator, Users, Shield, Loader2, CheckCircle, 
  XCircle, Settings, CreditCard, TrendingUp, User, Lock, Activity
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionResult?: {
    success: boolean;
    message: string;
    data?: any;
  };
  pendingConfirmation?: {
    id: string;
    actionType: string;
    message: string;
    warningLevel: string;
  };
}

const STORAGE_KEY = 'ai-assistant-messages';

const SUGGESTED_PROMPTS = [
  { icon: HelpCircle, text: "What are the eligibility requirements?", category: "Eligibility" },
  { icon: Calculator, text: "How much does the visa application cost?", category: "Fees" },
  { icon: FileText, text: "What documents do I need to prepare?", category: "Documents" },
  { icon: Users, text: "Can my family apply with me?", category: "Dependants" },
  { icon: Shield, text: "What are the personal savings requirements?", category: "Finance" },
  { icon: Sparkles, text: "How do I demonstrate innovation?", category: "Innovation" },
];

const ACCOUNT_PROMPTS = [
  { icon: TrendingUp, text: "What's my visa application progress?", category: "Progress" },
  { icon: CreditCard, text: "What's my current subscription tier?", category: "Account" },
  { icon: Activity, text: "What tools have I used the most?", category: "Analytics" },
  { icon: Settings, text: "What should I work on next?", category: "Guidance" },
];

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: 'Hello! I\'m the Innovator Founder Visa Assistant, trained on official GOV.UK Innovator Founder visa guidance (November 2025).\n\nI can help you with:\n- Eligibility, requirements, fees, and documentation\n- **Your account**: Check progress, subscription, tool usage\n- **Personalized guidance**: Next steps and recommendations\n\nWhat would you like to know?',
  timestamp: new Date(),
};

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error('Failed to load messages:', e);
  }
  return [INITIAL_MESSAGE];
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
}

function formatActionResult(result: any): string {
  if (!result?.data) return result?.message || '';
  
  const data = result.data;
  let formatted = result.message + '\n\n';
  
  if (data.progress !== undefined) {
    formatted += `**Overall Progress**: ${data.progress}%\n`;
    if (data.completedSteps && data.totalSteps) {
      formatted += `**Completed Steps**: ${data.completedSteps}/${data.totalSteps}\n`;
    }
  }
  
  if (data.tier) {
    formatted += `**Current Tier**: ${data.tier}\n`;
    if (data.toolsAvailable !== undefined) {
      formatted += `**Tools Available**: ${data.toolsAvailable}\n`;
    }
  }
  
  if (data.topTools) {
    formatted += '\n**Most Used Tools**:\n';
    data.topTools.forEach((tool: any, idx: number) => {
      formatted += `${idx + 1}. ${tool.toolId} (${tool.count} uses)\n`;
    });
  }
  
  if (data.recommendations) {
    formatted += '\n**Recommendations**:\n';
    data.recommendations.forEach((rec: any, idx: number) => {
      formatted += `${idx + 1}. ${rec.title}\n`;
    });
  }
  
  return formatted;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<Message['pendingConfirmation'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  interface ChatResponse {
    response: string;
    provider: string;
    actionExecuted?: string;
    actionResult?: {
      success: boolean;
      message: string;
      data?: any;
    };
    pendingConfirmation?: {
      id: string;
      actionType: string;
      message: string;
      warningLevel: string;
    };
  }

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      const res = await apiRequest('POST', '/api/chat', { 
        message: userMessage,
        conversationHistory 
      });
      return res.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actionResult: data.actionResult,
        pendingConfirmation: data.pendingConfirmation,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (data.pendingConfirmation) {
        setPendingConfirmation(data.pendingConfirmation);
      }
      
      if (data.actionExecuted) {
        toast({
          title: 'Action Completed',
          description: data.actionResult?.success 
            ? `Successfully executed: ${data.actionExecuted}`
            : `Action failed: ${data.actionResult?.message}`,
          variant: data.actionResult?.success ? 'default' : 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (confirmationId: string) => {
      const res = await apiRequest('POST', '/api/ai/confirm-action', { confirmationId });
      return res.json();
    },
    onSuccess: (data) => {
      setPendingConfirmation(null);
      const resultMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.success 
          ? `Action completed successfully: ${data.message}`
          : `Action failed: ${data.message}`,
        timestamp: new Date(),
        actionResult: data,
      };
      setMessages((prev) => [...prev, resultMessage]);
      toast({
        title: data.success ? 'Action Completed' : 'Action Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (confirmationId: string) => {
      const res = await apiRequest('POST', '/api/ai/cancel-action', { confirmationId });
      return res.json();
    },
    onSuccess: () => {
      setPendingConfirmation(null);
      const cancelMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Action cancelled. Is there anything else I can help you with?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, cancelMessage]);
      toast({
        title: 'Action Cancelled',
        description: 'The action has been cancelled.',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (chatMutation.isPending) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(prompt);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    toast({
      title: 'Chat Cleared',
      description: 'Your conversation history has been cleared.',
    });
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 py-8">
      <div className="responsive-container max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-xl font-bold" data-testid="text-page-title">Innovator Founder Visa Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Official GOV.UK Guidance (November 2025)
                  {isAuthenticated && <Badge variant="outline" className="ml-2">Action-Enabled</Badge>}
                </p>
              </div>
            </div>
            {messages.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearChat}
                data-testid="button-clear-chat"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6 border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  {isAuthenticated ? 'Expert AI with Account Actions' : '100% Accurate Official Guidance'}
                </p>
                <p className="text-green-600 dark:text-green-400">
                  {isAuthenticated 
                    ? 'I can check your progress, subscription, analytics, and help with account actions. All actions are logged for security.'
                    : 'Trained on GOV.UK official documents, Home Office guidance v9.0, and endorsing bodies instructions. Current as of November 2025.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[550px] md:h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground border border-border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.includes('**')) {
                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={idx}>
                            {parts.map((part, partIdx) => 
                              part.startsWith('**') 
                                ? <strong key={partIdx}>{part.replace(/\*\*/g, '')}</strong>
                                : part
                            )}
                          </p>
                        );
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>
                  
                  {message.actionResult && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      message.actionResult.success 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      <div className="flex items-center gap-1">
                        {message.actionResult.success 
                          ? <CheckCircle className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />
                        }
                        <span className="font-medium">
                          {message.actionResult.success ? 'Action Completed' : 'Action Failed'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {showSuggestions && !chatMutation.isPending && (
              <div className="pt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Visa Questions:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border bg-background hover-elevate text-left text-sm transition-all"
                        data-testid={`button-suggestion-${idx}`}
                      >
                        <prompt.icon className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="flex-1">{prompt.text}</span>
                        <Badge variant="secondary" className="text-xs">{prompt.category}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Account:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ACCOUNT_PROMPTS.map((prompt, idx) => (
                        <button
                          key={`account-${idx}`}
                          onClick={() => handleSuggestedPrompt(prompt.text)}
                          className="flex items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5 hover-elevate text-left text-sm transition-all"
                          data-testid={`button-account-suggestion-${idx}`}
                        >
                          <prompt.icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="flex-1">{prompt.text}</span>
                          <Badge variant="default" className="text-xs">{prompt.category}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-3 rounded-lg border border-border flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 bg-muted/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={isAuthenticated 
                  ? "Ask about visa, your progress, subscription, or account actions..."
                  : "Ask about eligibility, fees, requirements, team applications..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={chatMutation.isPending || !input.trim()}
                data-testid="button-send-message"
                size="icon"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>

        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("What is the English language requirement?")}>
              English Language
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("How long can I stay in the UK?")}>
              Duration
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("When can I apply for settlement?")}>
              Settlement
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("Can I switch from another visa?")}>
              Switching
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("What happens if my visa is refused?")}>
              Refusal
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("How do I extend my visa?")}>
              Extension
            </Badge>
            {isAuthenticated && (
              <>
                <Badge variant="default" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("What's my overall progress?")}>
                  My Progress
                </Badge>
                <Badge variant="default" className="cursor-pointer hover-elevate" onClick={() => handleSuggestedPrompt("Give me personalized recommendations")}>
                  My Recommendations
                </Badge>
              </>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This assistant provides guidance based on official sources. For official decisions, always consult GOV.UK or contact the Home Office directly.
            {isAuthenticated && ' All account actions are logged and can be reviewed in your account settings.'}
          </p>
        </div>
      </div>

      <AlertDialog open={!!pendingConfirmation} onOpenChange={() => setPendingConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingConfirmation?.warningLevel === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Lock className="h-5 w-5 text-amber-500" />
              )}
              Confirmation Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {pendingConfirmation?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => pendingConfirmation && cancelMutation.mutate(pendingConfirmation.id)}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-action"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingConfirmation && confirmMutation.mutate(pendingConfirmation.id)}
              disabled={confirmMutation.isPending}
              className={pendingConfirmation?.warningLevel === 'critical' ? 'bg-destructive hover:bg-destructive/90' : ''}
              data-testid="button-confirm-action"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
