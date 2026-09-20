import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, AlertCircle, Globe } from "lucide-react";
import { COUNTRY_PUBLIC_DATA, isCountryCode, type CountryCode } from "@/lib/country-public-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/lib/global-destination-i18n";
import { getCatalogueChatbotCopy, getGlobalChatbotCopy, getUkChatbotCopy } from "@/lib/chatbot-i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type PageContextKey = "global" | "uk" | "catalogue";

type CountryPageContext = {
  code: CountryCode;
  name: string;
  authority: string;
  section: string;
  sectionLabel: string;
};

const OVERLAY_EVENT = "visaassistant:overlay-open";

const COUNTRY_PATH_RE = /^\/(uk|us|ca|au|de|fr|nl|sg|ae|nz|jp|ie|pt|es|se|ch)(?:\/|$)/;

function getCountryPageContext(pathname: string): CountryPageContext | null {
  const path = pathname || "/";
  const match = path.match(COUNTRY_PATH_RE);
  if (!match || !isCountryCode(match[1])) return null;

  const code = match[1];
  const data = COUNTRY_PUBLIC_DATA[code];
  const remainder = path.slice(code.length + 1).replace(/^\//, "").split(/[?#]/)[0];
  const section = remainder || "visa-routes";
  const sectionLabel =
    section === "contact"
      ? "contact and support"
      : section === "about"
        ? "about"
        : section === "how-it-works"
          ? "how it works"
          : section === "countries"
            ? "countries"
            : "visa routes";

  return {
    code,
    name: data.name,
    authority: data.authority,
    section,
    sectionLabel,
  };
}

function getPageContextKey(pathname: string): PageContextKey {
  const path = pathname || "/";
  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";

  const isInnovatorHost =
    hostname === "innovatorfoundervisaassistant.co.uk" ||
    hostname === "www.innovatorfoundervisaassistant.co.uk";

  if (
    isInnovatorHost ||
    path.startsWith("/uk/innovatorfoundervisaassistant")
  ) {
    return "uk";
  }

  const isGlobalHost =
    hostname === "visaassistant.global" ||
    hostname === "www.visaassistant.global";

  if (path === "/v2" || (isGlobalHost && (path === "/" || path === ""))) {
    return "global";
  }

  // Every country page and country subpage must stay country-aware.
  // Previously only exact routes such as /us matched, so /us/contact,
  // /us/about and /us/how-it-works incorrectly fell through to the UK assistant.
  if (isGlobalHost && COUNTRY_PATH_RE.test(path)) {
    return "catalogue";
  }

  return "uk";
}

export default function ChatBot() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const contextKey = getPageContextKey(location);
  const countryContext = getCountryPageContext(location);
  const displayCountryName = countryContext
    ? localizeCountryName(language, countryContext.code, countryContext.name)
    : "";
  const pageContext =
    contextKey === "catalogue" && countryContext
      ? getCatalogueChatbotCopy(
          language,
          displayCountryName,
          countryContext.authority,
          countryContext.section,
        )
      : contextKey === "global"
        ? getGlobalChatbotCopy(language)
        : getUkChatbotCopy(language);
  const contextIdentity =
    contextKey === "catalogue" && countryContext
      ? `catalogue:${countryContext.code}:${countryContext.section}:${language}`
      : `${contextKey}:${language}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("chatbot_dismissed") === "true";
    }
    return false;
  });
  const [currentContextIdentity, setCurrentContextIdentity] =
    useState<string>(contextIdentity);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: pageContext.greeting,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOverlayOpen = (event: Event) => {
      const source = (event as CustomEvent<string>).detail;
      if (source && source !== "chat") {
        setIsOpen(false);
      }
    };

    window.addEventListener(OVERLAY_EVENT, handleOverlayOpen);
    return () => window.removeEventListener(OVERLAY_EVENT, handleOverlayOpen);
  }, []);

  useEffect(() => {
    if (contextIdentity !== currentContextIdentity) {
      setMessages([{ role: "assistant", content: pageContext.greeting }]);
      setInput("");
      setCurrentContextIdentity(contextIdentity);
    }
  }, [contextIdentity, currentContextIdentity, pageContext.greeting]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const openChat = () => {
    window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: "chat" }));
    setIsOpen(true);
    setIsDismissed(false);
  };

  const handleSendMessage = async (suggestedMessage?: string) => {
    const userMessage = (suggestedMessage ?? input).trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-12),
          pageContext: contextKey,
          pagePath: location,
          pageCountry: countryContext?.code,
          pageCountryName: countryContext?.name,
          pageAuthority: countryContext?.authority,
          pageSection: countryContext?.section,
          language,
          pageUrl:
            typeof window !== "undefined" ? window.location.href : location,
        }),
      });

      const data = (await response.json()) as {
        response?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "The assistant is temporarily unavailable");
      }

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || "No response received" },
        ]);
      } else {
        throw new Error(data.error || "No response received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: pageContext.error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed z-[60] transition-all duration-300 bottom-4 right-4 sm:bottom-6 sm:right-6">
        <div
          className={`flex items-center gap-0.5 transition-all duration-300 ${
            isDismissed
              ? "scale-50 opacity-60 hover:opacity-100 hover:scale-75"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          {!isDismissed && !isOpen && (
            <button
              onClick={() => {
                setIsDismissed(true);
                sessionStorage.setItem("chatbot_dismissed", "true");
              }}
              className="w-5 h-6 bg-red-500 hover:bg-red-600 rounded-l-full flex items-center justify-center text-white transition-colors shadow-sm"
              data-testid="button-dismiss-chat"
              aria-label={pageContext.minimize}
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => {
              if (isOpen) {
                setIsOpen(false);
              } else {
                openChat();
              }
            }}
            className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-white ${
              isDismissed
                ? "w-8 h-8 rounded-full"
                : "w-[37px] h-[35px] hover:scale-105"
            }`}
            style={{ background: "#005EB8" }}
            data-testid="button-chatbot-toggle"
            aria-label={
              isDismissed
                ? pageContext.restore
                : isOpen
                  ? pageContext.close
                  : pageContext.open
            }
          >
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[58] bg-transparent"
          onClick={() => setIsOpen(false)}
          data-testid="chatbot-backdrop"
        />
      )}

      {isOpen && (
        <div
          className="fixed z-[59] flex flex-col rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-border overflow-hidden bg-background
            inset-0 sm:inset-auto
            sm:bottom-20 sm:right-4 md:bottom-24 md:right-6
            sm:w-[340px] md:w-[390px] lg:w-[420px]
            sm:h-[470px] md:h-[520px] lg:h-[560px]
            sm:max-h-[calc(100vh-120px)]"
          data-testid="chatbot-window"
        >
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-3 py-2 flex-shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-amber-800 dark:text-amber-200 leading-tight">
                <strong>{pageContext.important}</strong> {pageContext.disclaimer}
              </p>
            </div>
          </div>

          <div
            className="px-3 py-3 sm:px-4 sm:py-4 text-white flex-shrink-0"
            style={{ background: pageContext.gradient }}
          >
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate flex items-center gap-2">
                {(contextKey === "global" || contextKey === "catalogue") && <Globe className="w-4 h-4" />}
                {pageContext.title}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0"
                data-testid="button-close-chat"
                aria-label={pageContext.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-background"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
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

            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {pageContext.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-muted text-muted-foreground rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
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
                  background: input.trim()
                    ? "linear-gradient(135deg, #005EB8 0%, #41B6E6 100%)"
                    : undefined,
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
