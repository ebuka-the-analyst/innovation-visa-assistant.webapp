import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mic, MicOff, Sparkles, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FieldEnhancerProps {
  fieldName: string;
  fieldLabel: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  context?: Record<string, string>;
  "data-testid"?: string;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function FieldEnhancer({
  fieldName,
  fieldLabel,
  value,
  onChange,
  placeholder,
  className,
  context,
  "data-testid": testId,
}: FieldEnhancerProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [wordCountInput, setWordCountInput] = useState("100");
  const [wordCountOpen, setWordCountOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const interimRef = useRef<string>("");
  const baseValueRef = useRef<string>("");

  const speechSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    baseValueRef.current = value;
    interimRef.current = "";

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += t;
          interimRef.current = "";
        } else {
          interimChunk = t;
        }
      }
      if (finalChunk) {
        baseValueRef.current = (baseValueRef.current.trim() + " " + finalChunk.trim()).trim();
        interimRef.current = interimChunk;
      } else {
        interimRef.current = interimChunk;
      }
      const display = interimRef.current
        ? (baseValueRef.current.trim() + " " + interimRef.current).trim()
        : baseValueRef.current;
      onChange(display);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast({ title: "Listening…", description: "Speak now. Click Stop when done." });
  }, [value, onChange, toast]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const handleEnhance = async () => {
    if (!value.trim()) {
      toast({ title: "Nothing to enhance", description: "Write something first, then click Enhance.", variant: "destructive" });
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/ai/questionnaire-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "enhance", fieldLabel, fieldName, currentText: value, context }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange(data.result);
      toast({ title: "Enhanced!", description: "Your response has been improved for the visa application." });
    } catch {
      toast({ title: "Enhancement failed", description: "Please try again shortly.", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddWords = async () => {
    const wc = Math.min(Math.max(parseInt(wordCountInput) || 100, 50), 500);
    if (!value.trim()) {
      toast({ title: "Nothing to expand", description: "Write something first.", variant: "destructive" });
      return;
    }
    setWordCountOpen(false);
    setIsExpanding(true);
    try {
      const res = await fetch("/api/ai/questionnaire-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mode: "expand", fieldLabel, fieldName, currentText: value, wordCount: wc, context }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onChange(data.result);
      toast({ title: `~${wc} words added`, description: "Your response has been expanded." });
    } catch {
      toast({ title: "Expansion failed", description: "Please try again shortly.", variant: "destructive" });
    } finally {
      setIsExpanding(false);
    }
  };

  const busy = isEnhancing || isExpanding;

  return (
    <div className="space-y-2">
      <Textarea
        id={fieldName}
        placeholder={placeholder ?? "Enter detailed response..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className ?? "min-h-[150px]"}
        data-testid={testId}
      />
      <div className="flex flex-wrap items-center gap-2">
        {speechSupported && (
          <Button
            type="button"
            size="sm"
            variant={isListening ? "destructive" : "outline"}
            onClick={isListening ? stopListening : startListening}
            disabled={busy}
            data-testid={`btn-mic-${fieldName}`}
            className="gap-1.5 text-xs"
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                Speak
              </>
            )}
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleEnhance}
          disabled={busy}
          data-testid={`btn-enhance-${fieldName}`}
          className="gap-1.5 text-xs"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Enhancing…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Enhance with AI
            </>
          )}
        </Button>

        <Popover open={wordCountOpen} onOpenChange={setWordCountOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              data-testid={`btn-addwords-${fieldName}`}
              className="gap-1.5 text-xs"
            >
              {isExpanding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add more words
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4" align="start">
            <div className="space-y-3">
              <p className="text-sm font-semibold">How many words to add?</p>
              <p className="text-xs text-muted-foreground">
                AI expands your response while staying true to your specific content and voice.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={50}
                  max={500}
                  step={25}
                  value={wordCountInput}
                  onChange={(e) => setWordCountInput(e.target.value)}
                  className="w-20 text-sm"
                  data-testid={`input-wordcount-${fieldName}`}
                />
                <span className="text-xs text-muted-foreground">words</span>
              </div>
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={handleAddWords}
                data-testid={`btn-confirm-addwords-${fieldName}`}
              >
                Add Words
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
