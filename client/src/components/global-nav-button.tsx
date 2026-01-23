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
        @keyframes soft-pulse {
          0%, 100% { 
            opacity: 0.7;
          }
          50% { 
            opacity: 1;
          }
        }
        .soft-pulse {
          animation: soft-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="fixed top-0.5 left-0.5 z-[200] soft-pulse w-4 h-4 rounded-full bg-[#0a1628] flex items-center justify-center cursor-pointer hover:scale-150 transition-transform"
            data-testid="button-global-nav"
          >
            <Globe2 className="w-2.5 h-2.5 text-[#41B6E6]" />
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
