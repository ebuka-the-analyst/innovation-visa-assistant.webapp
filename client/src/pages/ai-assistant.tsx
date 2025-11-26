import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, AlertCircle, Trash2, Sparkles, HelpCircle, FileText, Calculator, Users, Shield, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: 'Hello! I\'m the Innovator Founder Visa Assistant, trained on official GOV.UK Innovator Founder visa guidance (November 2025). I can help you with eligibility, requirements, fees, documentation, team applications, settlement planning, and more. What would you like to know?',
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

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const res = await apiRequest('POST', '/api/chat', { message: userMessage });
      return res.json() as Promise<{ response: string }>;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">Innovator Founder Visa Assistant</h1>
                <p className="text-sm text-muted-foreground">Official GOV.UK Guidance (November 2025)</p>
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

        {/* Alert */}
        <Card className="mb-6 border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-700 dark:text-green-300">100% Accurate Official Guidance</p>
                <p className="text-green-600 dark:text-green-400">Trained on GOV.UK official documents, Home Office guidance v9.0, and endorsing bodies instructions. Current as of November 2025.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Container */}
        <Card className="flex flex-col h-[550px] md:h-[600px]">
          {/* Messages */}
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Suggested Prompts */}
            {showSuggestions && !chatMutation.isPending && (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Try asking about:
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
            )}

            {/* Loading indicator */}
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

          {/* Input */}
          <div className="border-t p-4 bg-muted/30">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about eligibility, fees, requirements, team applications..."
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

        {/* Quick Topics */}
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
          </div>
          
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This assistant provides guidance based on official sources. For official decisions, always consult GOV.UK or contact the Home Office directly.
          </p>
        </div>
      </div>
    </div>
  );
}
