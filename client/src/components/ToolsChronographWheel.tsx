import { useState, useRef } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsChronographWheel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const tools = ALL_TOOLS;
  const itemHeight = 10.8; // Height of each tool item (to display 6 at a time)

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-5 h-5" /> : <Icons.Zap className="w-5 h-5" />;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentIndex((prev) => (prev + 1) % tools.length);
      setRotation((prev) => prev + 6.12); // 360/88 * 1.5 for smooth rotation
    } else {
      setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
      setRotation((prev) => prev - 6.12);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
    setRotation((prev) => prev + 6.12);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    setRotation((prev) => prev - 6.12);
  };

  const getToolAtPosition = (offset: number) => {
    return tools[(currentIndex + offset + tools.length) % tools.length];
  };

  // Visible positions: -2, -1, 0 (center), 1, 2
  const visiblePositions = [-2, -1, 0, 1, 2];

  return (
    <div
      className="fixed bottom-8 left-8 z-40"
      data-testid="chronograph-wheel-container"
      style={{ scale: "0.50", transformOrigin: "bottom left" }}
    >
      {/* Outer metal bezel effect */}
      <div className="w-72 h-72 rounded-full border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-2xl relative p-4 flex items-center justify-center">
        {/* Animated Circular text "Tools Hub" around the edge */}
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 288 288"
          style={{
            pointerEvents: "none",
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <defs>
            <path
              id="circlePath"
              d="M 144, 144 m -110, 0 a 110,110 0 1,1 220,0 a 110,110 0 1,1 -220,0"
              fill="none"
            />
          </defs>
          <text
            fontSize="24"
            fontWeight="bold"
            fill="#0D2C4A"
            opacity="0.8"
            letterSpacing="10"
          >
            <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
              TOOLS HUB
            </textPath>
          </text>
        </svg>
        {/* Inner chrome cover with cutout */}
        <div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(200,200,200,0.2))",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          }}
        />

        {/* Flywheel scrollable area with mask */}
        <div
          ref={wheelRef}
          className="relative w-64 h-64 overflow-hidden rounded-full"
          onWheel={handleWheel}
          style={{
            mask: "radial-gradient(circle, transparent 0%, transparent 25%, black 40%, black 80%, transparent 95%)",
            WebkitMask: "radial-gradient(circle, transparent 0%, transparent 25%, black 40%, black 80%, transparent 95%)",
          }}
        >
          {/* Tool items container - scrolls vertically */}
          <div
            className="w-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${-currentIndex * itemHeight + 2 * itemHeight}px)`,
            }}
          >
            {/* Create extended list for looping - 5 visible at a time */}
            {[...Array(3)].map((_, loopIdx) =>
              tools.map((tool, idx) => {
                const globalIdx = loopIdx * tools.length + idx;
                const isCenter = idx === currentIndex % tools.length;
                const relativePos = (idx - currentIndex + tools.length) % tools.length;

                return (
                  <div
                    key={`${loopIdx}-${idx}`}
                    className={`h-3 px-3 flex items-center gap-2 transition-all cursor-pointer ${
                      isCenter
                        ? "bg-primary/40 border-l-4 border-l-primary font-semibold text-xs"
                        : "opacity-50 text-xs hover:opacity-75"
                    }`}
                    onClick={() => {
                      if (isCenter) {
                        // Tool is clickable when centered
                      }
                    }}
                    data-testid={`tool-${globalIdx}`}
                  >
                    <div className="text-primary flex-shrink-0">
                      <GetIconComponent name={tool.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="leading-tight truncate text-xs">{tool.name}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center indicator line (highlight the selected item) */}
        <div
          className="absolute left-0 right-0 h-2 border-y-2 border-primary/50 pointer-events-none"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />

        {/* Stainless steel cover effect */}
        <div
          className="absolute w-60 h-60 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(200,200,200,0.1))",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2) inset",
          }}
        />
      </div>

      {/* Navigation buttons outside the bezel */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 flex gap-2 mt-80 pointer-events-auto"
        style={{ top: "100%" }}
      >
        <button
          onClick={handlePrev}
          className="p-2 rounded-full bg-primary/15 hover:bg-primary/25 transition-colors border border-primary/30"
          data-testid="button-prev-tool"
          title="Previous"
        >
          <ChevronUp className="w-4 h-4 text-primary" />
        </button>

        <div className="flex items-center justify-center text-xs text-muted-foreground font-medium w-12">
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
      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-6 w-64 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 text-center pointer-events-none">
        <p className="text-xs font-semibold text-primary">{getToolAtPosition(0).name}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {getToolAtPosition(0).description}
        </p>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-primary/15 text-primary rounded">
            {getToolAtPosition(0).tier?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
