import { useRef } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsChronographWheel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tools = ALL_TOOLS;

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-3 h-3" /> : <Icons.Zap className="w-3 h-3" />;
  };

  const tierColors = {
    free: "bg-green-50 border-green-200 text-green-700",
    basic: "bg-blue-50 border-blue-200 text-blue-700",
    premium: "bg-purple-50 border-purple-200 text-purple-700",
    enterprise: "bg-red-50 border-red-200 text-red-700",
    ultimate: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  return (
    <div
      className="fixed bottom-8 left-8 z-40"
      data-testid="chronograph-wheel-container"
      style={{ scale: "0.40", transformOrigin: "bottom left" }}
    >
      {/* Outer metal bezel effect */}
      <div className="rounded-2xl border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-2xl relative flex flex-col" style={{ height: "700px", width: "520px" }}>
        
        {/* Static Header Section */}
        <div className="flex flex-col items-center justify-center pt-3 pb-2 px-4 border-b border-gray-300 bg-gradient-to-b from-gray-50 to-transparent">
          <h3 className="text-sm font-black text-black text-center">104 TOOLS HUB</h3>
          <p className="text-xs text-gray-600 text-center mt-0.5">All Application Requirements</p>
        </div>

        {/* First Tool Highlight Box */}
        <div className="mx-3 mt-2 p-3 bg-primary/10 border-2 border-primary rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-xs font-black text-primary">001</div>
            <div className="flex-1">
              <p className="text-sm font-black text-black">{tools[0]?.name || "Loading..."}</p>
              <p className="text-xs text-gray-600 mt-0.5">{tools[0]?.description || ""}</p>
            </div>
          </div>
        </div>

        {/* Inner chrome cover overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(200,200,200,0.2))",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          }}
        />

        {/* Scrollable list of ALL tools */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 165, 54, 0.5) rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="space-y-1">
            {tools.map((tool, idx) => (
              <div
                key={tool.id}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                data-testid={`tool-${idx}`}
              >
                {/* Number */}
                <div className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">
                  {String(idx + 1).padStart(3, "0")}
                </div>

                {/* Icon */}
                <div className="text-primary flex-shrink-0 mt-0.5">
                  <GetIconComponent name={tool.icon} />
                </div>

                {/* Tool info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">
                    {tool.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {tool.description}
                  </p>
                </div>

                {/* Tier badge */}
                <div className={`flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border ${tierColors[tool.tier as keyof typeof tierColors]}`}>
                  {tool.tier.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Counter at bottom */}
          <div className="sticky bottom-0 mt-2 pt-2 border-t border-gray-300 bg-white/80 text-center">
            <p className="text-xs font-bold text-black">
              Total: {tools.length} Tools
            </p>
          </div>
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

      {/* Legend below */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 w-full flex justify-center gap-6 text-xs pointer-events-none">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-200"></span>
          <span className="text-gray-700">FREE</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-200"></span>
          <span className="text-gray-700">BASIC</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-purple-100 border border-purple-200"></span>
          <span className="text-gray-700">PREMIUM</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200"></span>
          <span className="text-gray-700">ENTERPRISE</span>
        </div>
      </div>
    </div>
  );
}
