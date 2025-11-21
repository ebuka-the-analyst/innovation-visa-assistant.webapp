import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the UK-Innovation Visa Assistant. I can help you with UK Innovation Visa strategy, business plan advice, and answers to all your visa questions. What would you like to know?"
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
      console.log("Sending chat message:", userMessage);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        })
      });

      console.log("Chat response status:", response.status);
      const data = await response.json() as { response?: string; error?: string };
      console.log("Chat response data:", data);
      
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
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center text-white group hover-elevate"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          background: "linear-gradient(135deg, #ffa536 0%, #11b6e9 100%)",
          animation: isOpen ? "none" : "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
        }}
        data-testid="button-chatbot-toggle"
        title="AI Assistant"
      >
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="flex flex-col rounded-2xl shadow-2xl border border-border overflow-hidden"
          style={{
            position: "fixed",
            bottom: "112px",
            right: "24px",
            zIndex: 9999,
            width: "380px",
            height: "580px",
            background: "white"
          }}
        >
          {/* Disclaimer Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b-2 border-amber-300 dark:border-amber-700 px-3 py-2.5 flex-shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-100">
                <strong>Disclaimer:</strong> Trained on official GOV.UK guidance (November 2025). Always verify with official sources or contact Home Office directly.
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="p-4 text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #0D2C4A 0%, #11b6e9 100%)" }}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">UK-Innovation Visa Assistant</h3>
                <p className="text-xs opacity-90">Official GOV.UK guidance</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:opacity-75 transition-opacity"
                data-testid="button-close-chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`chat-message-${msg.role}-${idx}`}
              >
                <div
                  className="px-3 py-2 rounded-lg text-sm max-w-xs"
                  style={msg.role === "user" ? {
                    background: "#ffa536",
                    color: "white",
                    borderBottomRightRadius: "4px"
                  } : {
                    background: "#f0f0f0",
                    color: "#333",
                    borderBottomLeftRadius: "4px"
                  }}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 border-b-l-4" style={{ borderBottomLeftRadius: "4px" }}>
                  <Loader className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about visa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
                data-testid="input-chat-message"
                className="text-sm"
                style={{ flex: 1 }}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                data-testid="button-chat-send"
                style={{ 
                  background: "#ffa536",
                  color: "white",
                  width: "36px",
                  height: "36px"
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
