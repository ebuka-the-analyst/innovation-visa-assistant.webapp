import { useRef, useState } from "react";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export default function ToolsChronographWheel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedToolIdx, setSelectedToolIdx] = useState(0);
  const tools = ALL_TOOLS;
  const selectedTool = tools[selectedToolIdx];

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-8 h-8" /> : <Icons.Zap className="w-8 h-8" />;
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
      style={{ scale: "0.35", transformOrigin: "bottom left" }}
    >
      {/* Outer metal bezel effect */}
      <div className="rounded-2xl border-4 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-2xl relative flex flex-col" style={{ height: "800px", width: "600px" }}>
        
        {/* Static Header Section */}
        <div className="relative z-20 px-6 pt-4 pb-3 border-b border-gray-300 bg-gradient-to-b from-gray-50 to-transparent">
          <h3 className="text-2xl font-black text-black">100+ TOOLS HUB</h3>
          <p className="text-xs text-gray-600 mt-1">Application Requirement Checks</p>
        </div>

        {/* Main Container with Featured Tool in Center */}
        <div className="flex-1 relative overflow-hidden">
          {/* Scrollable tool list background */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-3"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 165, 54, 0.5) rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="space-y-2">
              {tools.map((tool, idx) => (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolIdx(idx)}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-gray-300"
                  data-testid={`tool-${idx}`}
                >
                  {/* Number */}
                  <div className="text-xs font-bold text-gray-500 w-8 flex-shrink-0 pt-0.5">
                    {String(idx + 1).padStart(3, "0")}
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
                  <div className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded border ${tierColors[tool.tier as keyof typeof tierColors]}`}>
                    {tool.tier.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fade masks - top and bottom */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: "120px",
              background: "linear-gradient(to bottom, rgba(240,244,248,0.95) 0%, rgba(240,244,248,0.3) 100%)",
              backdropFilter: "blur(3px)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: "120px",
              background: "linear-gradient(to top, rgba(240,244,248,0.95) 0%, rgba(240,244,248,0.3) 100%)",
              backdropFilter: "blur(3px)",
            }}
          />

          {/* Featured Tool Box - Centered Behind */}
          <div className="absolute inset-0 flex items-center justify-center px-4 z-5">
            <div 
              className="p-6 bg-white border-2 border-gray-300 rounded-lg w-full cursor-pointer hover:shadow-lg transition-shadow" 
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
              onClick={() => {}}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-semibold mb-2">
                    {String(selectedToolIdx + 1).padStart(3, "0")}
                  </p>
                  <h2 className="text-2xl font-black text-black leading-tight mb-3">
                    {selectedTool.name.toUpperCase()}
                  </h2>
                  <p className="text-sm text-black font-semibold">
                    {selectedTool.description.toUpperCase()}
                  </p>
                </div>
                <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center bg-gray-50 text-gray-600">
                  <GetIconComponent name={selectedTool.icon} />
                </div>
              </div>
            </div>
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
    </div>
  );
}
