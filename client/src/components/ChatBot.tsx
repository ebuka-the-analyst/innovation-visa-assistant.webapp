import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your UK Innovator Founder Visa assistant. Ask me about visa requirements, endorsers, or business planning."
    }
  ]);
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
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
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1; 
            box-shadow: 0 0 20px rgba(255, 165, 54, 0.5);
          }
          50% { 
            opacity: 0.85; 
            box-shadow: 0 0 30px rgba(17, 182, 233, 0.6);
          }
        }
      `}</style>

      {/* Floating Chat Button - Responsive positioning */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center text-white z-[9999]"
        style={{
          background: "linear-gradient(135deg, #ffa536 0%, #11b6e9 100%)",
          animation: isOpen ? "none" : "pulse-glow 2s ease-in-out infinite"
        }}
        data-testid="button-chatbot-toggle"
        aria-label={isOpen ? "Close chat" : "Open AI Assistant"}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      {/* Chat Window - Fully responsive */}
      {isOpen && (
        <div
          className="fixed z-[9998] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-border overflow-hidden bg-background
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
                <strong>Disclaimer:</strong> Trained on GOV.UK guidance (Nov 2025). Always verify with official sources.
              </p>
            </div>
          </div>

          {/* Header */}
          <div 
            className="px-3 py-3 sm:px-4 sm:py-4 text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0D2C4A 0%, #11b6e9 100%)" }}
          >
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">
                UK Visa AI Assistant
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
                placeholder="Ask about visa requirements..."
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
                  background: input.trim() ? "linear-gradient(135deg, #ffa536 0%, #11b6e9 100%)" : undefined
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
