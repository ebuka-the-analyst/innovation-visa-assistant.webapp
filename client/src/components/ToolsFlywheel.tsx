import { useState } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsFlywheel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed left-4 top-1/2 -translate-y-1/2 rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm shadow-lg hover-elevate transition-all flex items-center gap-1.5 px-2.5 py-1.5 z-40"
        data-testid="flywheel-toggle"
      >
        <Icons.Wrench className="w-3 h-3 text-primary" />
        <span className="text-xs font-bold text-primary">100+ Tools</span>
      </button>
    );
  }

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 w-56 rounded-lg border border-primary/30 bg-background/95 backdrop-blur-sm shadow-lg hover-elevate transition-all z-40"
      onWheel={handleWheel}
      data-testid="flywheel-container"
    >
      {/* Header - Compact with close button */}
      <div className="flex items-center justify-between border-b border-primary/20 py-1.5 px-2.5">
        <div className="flex items-center gap-1.5">
          <Icons.Wrench className="w-3 h-3 text-primary" />
          <h3 className="font-bold text-xs text-primary">100+ Tools</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-0.5 rounded hover:bg-primary/15 transition-colors"
          data-testid="button-collapse-tools"
        >
          <Icons.X className="w-3 h-3 text-muted-foreground" />
        </button>
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
