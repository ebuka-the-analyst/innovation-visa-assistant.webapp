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
        @keyframes blink-glow {
          0%, 100% { 
            opacity: 0.7;
            box-shadow: 0 0 4px rgba(0, 94, 184, 0.3);
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 8px rgba(0, 94, 184, 0.6), 0 0 12px rgba(65, 182, 230, 0.4);
          }
        }
        .blink-globe {
          animation: blink-glow 2s ease-in-out infinite;
        }
      `}</style>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="fixed top-2 left-2 z-[100] blink-globe w-6 h-6 rounded-full bg-[#0a0a1a] border border-[#005EB8]/50 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            data-testid="button-global-nav"
          >
            <Globe2 className="h-3.5 w-3.5 text-[#41B6E6]" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-[#0a0a1a] text-white border-[#005EB8]/50 max-w-[200px]"
        >
          <p className="text-xs">
            Click to return to the <span className="text-[#41B6E6] font-semibold">World Map</span> and explore all countries
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
