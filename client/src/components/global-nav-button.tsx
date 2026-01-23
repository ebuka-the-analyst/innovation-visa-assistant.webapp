import { useState } from "react";
import { useLocation } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import worldIcon from "@assets/worldIcon_1769203295221.png";
import globeImage from "@assets/unnamed_(1)_1769196836272.png";

export function GlobalNavButton() {
  const [, setLocation] = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleClick = () => {
    setShowTooltip(false);
    setIsZooming(true);
    
    // Start fade-out before navigation
    setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);
    
    // Navigate after animation
    setTimeout(() => {
      setLocation("/");
    }, 1800);
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
        
        @keyframes zoom-out-reverse {
          0% { transform: scale(50) rotateY(360deg); opacity: 0; }
          50% { transform: scale(2) rotateY(180deg); opacity: 1; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        
        .globe-zoom-reverse {
          animation: zoom-out-reverse 1.5s ease-out forwards;
        }
        
        @keyframes fade-in-overlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-fade-in-overlay {
          animation: fade-in-overlay 0.3s ease-out forwards;
        }
      `}</style>
      
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="fixed top-[2px] left-0.5 z-[200] soft-pulse w-4 h-4 flex items-center justify-center cursor-pointer hover:scale-150 transition-transform rounded-full overflow-hidden opacity-50 hover:opacity-100"
            data-testid="button-global-nav"
          >
            <img src={worldIcon} alt="World Map" className="w-4 h-4 object-cover" />
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
      
      {isZooming && (
        <div 
          className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-500 ease-out animate-fade-in-overlay ${
            isFadingOut ? "bg-sky-100 dark:bg-[#0a0a1a]" : "bg-[#0a0a1a]"
          }`}
        >
          <div className={`text-center transition-all duration-500 ease-out ${
            isFadingOut ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}>
            <div className="perspective-1000">
              <div className="globe-zoom-reverse w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden mx-auto shadow-2xl">
                <img 
                  src={globeImage} 
                  alt="Earth Globe" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className={`mt-6 text-lg font-semibold text-white transition-opacity duration-300 ${
              isFadingOut ? "opacity-0" : "animate-pulse"
            }`}>
              Returning to World Map...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
