import { useState } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsFlywheel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Show 3 tools at a time (compact)
  const displayCount = 3;
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

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-3 h-3" /> : <Icons.Zap className="w-3 h-3" />;
  };

  const visibleTools = getVisibleTools();

  return (
    <div
      className="fixed bottom-8 left-8 w-64 rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm shadow-lg hover-elevate transition-all z-40"
      onWheel={handleWheel}
      data-testid="flywheel-container"
    >
      {/* Header - Compact */}
      <div className="text-center border-b border-primary/20 py-2 px-3">
        <h3 className="font-bold text-xs text-primary">88 Tools</h3>
      </div>

      {/* Tools List - Compact */}
      <div className="py-2 px-2 space-y-1 max-h-48 overflow-hidden">
        {visibleTools.map((tool, idx) => (
          <div
            key={`${tool.id}-${idx}`}
            className={`px-2 py-1.5 rounded text-left transition-all cursor-pointer ${
              idx === 0
                ? "bg-primary/20 border-l-2 border-l-primary font-semibold text-xs"
                : "bg-muted/20 text-xs opacity-65 hover:opacity-80"
            }`}
            data-testid={`flywheel-tool-${idx}`}
          >
            <div className="flex items-center gap-1.5">
              <div className="text-primary flex-shrink-0">
                <GetIconComponent name={tool.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs leading-tight truncate">{tool.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation - Compact */}
      <div className="border-t border-primary/20 px-2 py-1.5 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-1 rounded hover:bg-primary/15 transition-colors"
          data-testid="button-prev-tool"
          title="Previous"
        >
          <ChevronUp className="w-3 h-3 text-primary" />
        </button>

        <div className="text-xs text-muted-foreground font-medium">
          <span className="text-primary">{currentIndex + 1}</span>/{tools.length}
        </div>

        <button
          onClick={handleNext}
          className="p-1 rounded hover:bg-primary/15 transition-colors"
          data-testid="button-next-tool"
          title="Next"
        >
          <ChevronDown className="w-3 h-3 text-primary" />
        </button>
      </div>
    </div>
  );
}
