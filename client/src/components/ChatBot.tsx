import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, AlertCircle, Globe } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Page context configuration
const PAGE_CONTEXTS = {
  global: {
    title: "Global Visa Assistant",
    greeting: "Welcome! I'm your Global Visa Assistant. I can help you explore visa options for 16 countries. Which destination are you interested in?",
    disclaimer: "AI-powered guidance. Always verify with official immigration sources.",
    placeholder: "Ask about visa options for any country...",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
  },
  uk: {
    title: "UK Visa AI Assistant",
    greeting: "Hi! I'm your UK Innovator Founder Visa assistant. Ask me about visa requirements, endorsers, or business planning.",
    disclaimer: "Trained on GOV.UK guidance (Nov 2025). Always verify with official sources.",
    placeholder: "Ask about visa requirements...",
    gradient: "linear-gradient(135deg, #0D2C4A 0%, #41B6E6 100%)",
  }
};

function getPageContext(pathname: string) {
  // Only /v2 uses global context - everything else (including "/") uses UK context
  if (pathname === "/v2") {
    return PAGE_CONTEXTS.global;
  }
  return PAGE_CONTEXTS.uk;
}

export default function ChatBot() {
  const [location] = useLocation();
  const pageContext = getPageContext(location);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check sessionStorage - start half open unless user dismissed in this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('chatbot_dismissed') === 'true';
    }
    return false;
  });
  const [currentContext, setCurrentContext] = useState(location);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: pageContext.greeting
    }
  ]);
  
  // Reset messages when navigating to a different page context
  useEffect(() => {
    const newContext = getPageContext(location);
    const oldContext = getPageContext(currentContext);
    
    if (newContext.title !== oldContext.title) {
      setMessages([{ role: "assistant", content: newContext.greeting }]);
      setCurrentContext(location);
    }
  }, [location, currentContext]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const isGlobalPage = location === "/" || location === "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
          pageContext: isGlobalPage ? "global" : "uk"
        })
      });

      const data = await response.json() as { response?: string; error?: string };
      
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response || "No response received" }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Error: ${data.error}` 
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please check your connection and try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button - With dismiss option */}
      <div 
        className="fixed z-[60] transition-all duration-300 bottom-4 right-4 sm:bottom-6 sm:right-6"
      >
        {/* Container with chat icon and dismiss X - pill shape when not dismissed */}
        <div className={`flex items-center gap-0.5 transition-all duration-300 ${
          isDismissed ? "scale-50 opacity-60 hover:opacity-100 hover:scale-75" : "opacity-50 hover:opacity-100"
        }`}>
          {/* Dismiss X button - attached to the left */}
          {!isDismissed && !isOpen && (
            <button
              onClick={() => {
                setIsDismissed(true);
                sessionStorage.setItem('chatbot_dismissed', 'true');
              }}
              className="w-5 h-6 bg-red-500 hover:bg-red-600 rounded-l-full flex items-center justify-center text-white transition-colors shadow-sm"
              data-testid="button-dismiss-chat"
              aria-label="Minimize chat button"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          
          {/* Main chat button */}
          <button
            onClick={() => {
              // Always open the chat directly when clicked (whether dismissed or not)
              setIsOpen(true);
              setIsDismissed(false);
            }}
            className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-white ${
              isDismissed 
                ? "w-8 h-8 rounded-full" 
                : "w-[37px] h-[35px] hover:scale-105"
            }`}
            style={{
              background: "#005EB8",
            }}
            data-testid="button-chatbot-toggle"
            aria-label={isDismissed ? "Restore chat button" : isOpen ? "Close chat" : "Open AI Assistant"}
          >
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop for click-outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[58] bg-transparent"
          onClick={() => setIsOpen(false)}
          data-testid="chatbot-backdrop"
        />
      )}

      {/* Chat Window - Fully responsive */}
      {isOpen && (
        <div
          className="fixed z-[59] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-border overflow-hidden bg-background
            inset-0 sm:inset-auto
            sm:bottom-20 sm:right-4 md:bottom-24 md:right-6
            sm:w-[340px] md:w-[400px] lg:w-[440px]
            sm:h-[480px] md:h-[540px] lg:h-[580px]
            sm:max-h-[calc(100vh-120px)]"
          data-testid="chatbot-window"
        >
          {/* Disclaimer Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-3 py-2 flex-shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-200 leading-tight">
                <strong>Disclaimer:</strong> {pageContext.disclaimer}
              </p>
            </div>
          </div>

          {/* Header */}
          <div 
            className="px-3 py-3 sm:px-4 sm:py-4 text-white flex-shrink-0"
            style={{ background: pageContext.gradient }}
          >
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate flex items-center gap-2">
                {location === "/v2" && <Globe className="w-4 h-4" />}
                {pageContext.title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0"
                data-testid="button-close-chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-background"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`chat-message-${msg.role}-${idx}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[85%] sm:max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-muted text-muted-foreground rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <Input
                placeholder={pageContext.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                data-testid="input-chat-message"
                className="flex-1 text-sm h-9 sm:h-10"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                data-testid="button-chat-send"
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                style={{ 
                  background: input.trim() ? "linear-gradient(135deg, #005EB8 0%, #41B6E6 100%)" : undefined
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
