import { useState, useEffect } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsFlywheel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Show 5 tools at a time
  const displayCount = 5;
  const tools = ALL_TOOLS;

  const getVisibleTools = () => {
    const visible = [];
    for (let i = 0; i < displayCount; i++) {
      visible.push(tools[(currentIndex + i) % tools.length]);
    }
    return visible;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scroll down
      setCurrentIndex((prev) => (prev + 1) % tools.length);
    } else {
      // Scroll up
      setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tools.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tools.length) % tools.length);
  };

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-4 h-4" /> : <Icons.Zap className="w-4 h-4" />;
  };

  const visibleTools = getVisibleTools();

  return (
    <div
      className="fixed bottom-8 left-8 w-80 rounded-full border-2 border-primary/30 bg-background/95 backdrop-blur-sm shadow-2xl hover-elevate transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={handleWheel}
      data-testid="flywheel-container"
    >
      {/* Header */}
      <div className="text-center border-b border-primary/20 py-3">
        <h3 className="font-bold text-sm text-primary">88 Tools Hub</h3>
        <p className="text-xs text-muted-foreground">Scroll to explore</p>
      </div>

      {/* Tools List */}
      <div className="py-4 px-3 space-y-2 max-h-64 overflow-hidden">
        {visibleTools.map((tool, idx) => (
          <div
            key={`${tool.id}-${idx}`}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer hover:bg-primary/10 ${
              idx === 0
                ? "bg-primary/15 border-primary/40 font-semibold text-sm"
                : "bg-muted/30 border-transparent text-xs opacity-60"
            }`}
            data-testid={`flywheel-tool-${idx}`}
          >
            <div className="flex items-start gap-2">
              <div className="text-primary flex-shrink-0 mt-0.5">
                <GetIconComponent name={tool.icon} />
              </div>
              <div className="flex-1">
                <p className="font-medium leading-tight">{tool.name}</p>
                <p className="text-xs opacity-70 mt-0.5">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="border-t border-primary/20 px-3 py-2 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          data-testid="button-prev-tool"
          title="Previous (Scroll Up)"
        >
          <ChevronUp className="w-4 h-4 text-primary" />
        </button>

        <div className="text-xs text-muted-foreground font-medium">
          <span className="text-primary">{currentIndex + 1}</span> / {tools.length}
        </div>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          data-testid="button-next-tool"
          title="Next (Scroll Down)"
        >
          <ChevronDown className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Tier Badge */}
      <div className="border-t border-primary/20 px-3 py-2 text-center text-xs">
        <span className="inline-block px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
          {visibleTools[0]?.tier?.toUpperCase() || "TOOL"}
        </span>
      </div>
    </div>
  );
}
