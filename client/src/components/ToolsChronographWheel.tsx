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
  const visibleCount = 6; // Show 6 tools at a time

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-4 h-4" /> : <Icons.Zap className="w-4 h-4" />;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentIndex((prev) => (prev + 1) % tools.length);
      setRotation((prev) => prev + 60); // 360/6 for 6 visible tools
    } else {
      setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
      setRotation((prev) => prev - 60);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
    setRotation((prev) => prev + 60);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    setRotation((prev) => prev - 60);
  };

  // Get visible tools - 6 centered around the current index
  const getVisibleTools = () => {
    const visible = [];
    const start = Math.floor(visibleCount / 2);
    for (let i = -start; i < visibleCount - start; i++) {
      visible.push({
        tool: tools[(currentIndex + i + tools.length) % tools.length],
        index: (currentIndex + i + tools.length) % tools.length,
      });
    }
    return visible;
  };

  const visibleTools = getVisibleTools();
  const anglePerTool = 360 / visibleCount;

  return (
    <div
      className="fixed bottom-8 left-8 z-40"
      data-testid="chronograph-wheel-container"
      style={{ scale: "0.50", transformOrigin: "bottom left" }}
    >
      {/* Outer metal bezel effect */}
      <div className="w-72 h-72 rounded-full border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-2xl relative p-4 flex items-center justify-center overflow-hidden">
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

        {/* Radial tools display */}
        <div
          ref={wheelRef}
          className="absolute w-full h-full flex items-center justify-center"
          onWheel={handleWheel}
          style={{
            pointerEvents: "auto",
          }}
        >
          {/* Tools arranged radially */}
          {visibleTools.map((item, idx) => {
            const angle = (idx * anglePerTool - 90) * (Math.PI / 180);
            const radius = 90;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const isCenter = idx === Math.floor(visibleCount / 2);

            return (
              <div
                key={`${item.index}`}
                className={`absolute flex items-center gap-1 px-2 py-1 rounded transition-all cursor-pointer ${
                  isCenter
                    ? "bg-primary/40 border-l-2 border-l-primary font-semibold text-xs z-20"
                    : "opacity-50 text-xs z-10"
                }`}
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  width: "100px",
                }}
                data-testid={`tool-radial-${item.index}`}
              >
                <div className="text-primary flex-shrink-0">
                  <GetIconComponent name={item.tool.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="leading-tight truncate text-xs whitespace-nowrap">
                    {item.tool.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center mask/window overlay */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary/50 pointer-events-none"
          style={{
            width: "130px",
            height: "40px",
            borderRadius: "8px",
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

      {/* Navigation buttons */}
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
        <p className="text-xs font-semibold text-primary">
          {tools[currentIndex].name}
        </p>
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
