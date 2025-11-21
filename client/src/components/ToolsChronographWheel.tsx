import { useState, useRef } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsChronographWheel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const tools = ALL_TOOLS;

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-4 h-4" /> : <Icons.Zap className="w-4 h-4" />;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentIndex((prev) => (prev + 1) % tools.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
  };

  return (
    <div
      className="fixed bottom-8 left-8 z-40"
      data-testid="chronograph-wheel-container"
      style={{ scale: "0.50", transformOrigin: "bottom left" }}
    >
      {/* Outer metal bezel effect */}
      <div className="w-72 h-80 rounded-2xl border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-2xl relative p-4 flex flex-col items-center justify-center">
        
        {/* TOOLS HUB text on bezel edge using SVG */}
        <svg
          className="absolute w-full h-full top-0 left-0"
          viewBox="0 0 288 320"
          style={{ pointerEvents: "none" }}
        >
          <text
            x="144"
            y="28"
            fontSize="16"
            fontWeight="bold"
            fill="#0D2C4A"
            opacity="0.6"
            textAnchor="middle"
            letterSpacing="3"
          >
            TOOLS HUB
          </text>
        </svg>

        {/* Inner chrome cover overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(200,200,200,0.2))",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          }}
        />

        {/* Scrollable container with overflow hidden */}
        <div
          ref={wheelRef}
          className="relative w-full flex-1 overflow-hidden flex flex-col items-center justify-center"
          onWheel={handleWheel}
          style={{
            height: "220px",
            perspective: "1000px",
            marginTop: "8px",
          }}
        >
          {/* Tool items - vertical scroll with mask effect */}
          <div
            className="flex flex-col items-center gap-2 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${-currentIndex * 48}px)`,
            }}
          >
            {/* Render 3 cycles of tools for infinite scroll effect */}
            {[...Array(3)].map((_, cycle) =>
              tools.map((tool, idx) => {
                const globalIdx = cycle * tools.length + idx;
                const isCenter = idx === currentIndex % tools.length;
                const positionFromCenter = Math.abs(idx - (currentIndex % tools.length));
                
                // Calculate opacity and scale based on position
                let opacity = 0;
                let scale = 0.7;
                
                if (isCenter) {
                  opacity = 1;
                  scale = 1;
                } else if (positionFromCenter === 1) {
                  opacity = 0.5;
                  scale = 0.85;
                } else if (positionFromCenter === 2) {
                  opacity = 0.25;
                  scale = 0.75;
                } else {
                  opacity = 0;
                  scale = 0.6;
                }

                return (
                  <div
                    key={`${cycle}-${idx}`}
                    className="transition-all duration-300"
                    style={{
                      opacity,
                      transform: `scale(${scale})`,
                      height: "48px",
                      pointerEvents: isCenter ? "auto" : "none",
                    }}
                    data-testid={`tool-${globalIdx}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap border-2 transition-all ${
                        isCenter
                          ? "bg-primary/30 border-primary font-semibold text-sm"
                          : "bg-muted/10 border-transparent text-xs"
                      }`}
                      style={{
                        minWidth: "140px",
                      }}
                    >
                      <div className="text-primary flex-shrink-0">
                        <GetIconComponent name={tool.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="leading-tight truncate">{tool.name}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Center highlight box overlay */}
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary/60 pointer-events-none rounded-lg"
            style={{
              width: "180px",
              height: "52px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.1) inset",
            }}
          />

          {/* Fade mask - hide content outside center box */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(255,255,255,0.3) 30%, 
                rgba(255,255,255,0) 50%, 
                rgba(255,255,255,0.3) 70%, 
                transparent 100%)`,
              maskImage: `radial-gradient(ellipse 100px 60px at center, transparent 0%, black 100%)`,
              WebkitMaskImage: `radial-gradient(ellipse 100px 60px at center, transparent 0%, black 100%)`,
            }}
          />
        </div>

        {/* Stainless steel cover effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(200,200,200,0.1))",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2) inset",
          }}
        />
      </div>

      {/* Navigation buttons */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto"
        style={{ top: "100%", marginTop: "20px" }}
      >
        <button
          onClick={handlePrev}
          className="p-2 rounded-full bg-primary/15 hover:bg-primary/25 transition-colors border border-primary/30"
          data-testid="button-prev-tool"
          title="Previous"
        >
          <ChevronUp className="w-4 h-4 text-primary" />
        </button>

        <div className="flex items-center justify-center text-xs text-muted-foreground font-medium w-14">
          <span className="text-primary">{currentIndex + 1}</span>
          <span className="text-muted-foreground">/{tools.length}</span>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-full bg-primary/15 hover:bg-primary/25 transition-colors border border-primary/30"
          data-testid="button-next-tool"
          title="Next"
        >
          <ChevronDown className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Tool info card below */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-16 w-56 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 text-center pointer-events-none">
        <p className="text-xs font-semibold text-primary">{tools[currentIndex].name}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {tools[currentIndex].description}
        </p>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-primary/15 text-primary rounded">
            {tools[currentIndex].tier?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
