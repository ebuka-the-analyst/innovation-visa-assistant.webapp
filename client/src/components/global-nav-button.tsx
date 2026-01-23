import { useState } from "react";
import { useLocation } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import globeImage from "@assets/unnamed_(1)_1769196836272.png";

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
            className="fixed top-1 left-1 z-[200] soft-pulse w-4 h-4 rounded-full overflow-hidden cursor-pointer hover:scale-150 transition-transform"
            data-testid="button-global-nav"
          >
            <img src={globeImage} alt="World Map" className="w-full h-full object-cover" />
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
