import { useState } from "react";
import { useLocation } from "wouter";
import { Globe2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GlobalNavButton() {
  const [, setLocation] = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setLocation("/");
  };

  return (
    <>
      <style>{`
        @keyframes blink-bright {
          0%, 100% { 
            opacity: 0.85;
            box-shadow: 0 0 6px rgba(234, 179, 8, 0.4), 0 0 12px rgba(234, 179, 8, 0.2);
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 12px rgba(234, 179, 8, 0.7), 0 0 20px rgba(234, 179, 8, 0.4), 0 0 30px rgba(234, 179, 8, 0.2);
          }
        }
        .blink-bright {
          animation: blink-bright 1.5s ease-in-out infinite;
        }
      `}</style>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="fixed top-1.5 left-1.5 z-[200] blink-bright w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border border-yellow-300 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform shadow-md"
            data-testid="button-global-nav"
          >
            <Globe2 className="h-3 w-3 text-white drop-shadow-sm" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-[#0a0a1a] text-white border-yellow-500/50 max-w-[200px]"
        >
          <p className="text-xs">
            Click to return to the <span className="text-yellow-400 font-semibold">World Map</span> and explore all countries
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
