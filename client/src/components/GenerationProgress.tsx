import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import novaAvatar from "@assets/generated_images/Nova_innovation_agent_avatar_e5dc5701.png";
import sterlingAvatar from "@assets/generated_images/Sterling_financial_agent_avatar_4fce3650.png";
import atlasAvatar from "@assets/generated_images/Atlas_growth_agent_avatar_a0808a5e.png";
import sageAvatar from "@assets/generated_images/Sage_compliance_agent_avatar_9dabb0a2.png";

const stages = [
  { id: 1, name: "Analyzing your business model", agent: "Nova", avatar: novaAvatar, duration: 2000 },
  { id: 2, name: "Generating market analysis", agent: "Nova", avatar: novaAvatar, duration: 2000 },
  { id: 3, name: "Creating financial projections", agent: "Sterling", avatar: sterlingAvatar, duration: 2000 },
  { id: 4, name: "Crafting scalability plan", agent: "Atlas", avatar: atlasAvatar, duration: 2000 },
  { id: 5, name: "Ensuring compliance", agent: "Sage", avatar: sageAvatar, duration: 1500 },
  { id: 6, name: "Finalizing document", agent: "Sage", avatar: sageAvatar, duration: 1500 },
];

export default function GenerationProgress() {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    // Simulate progress
    let totalDuration = 0;
    stages.forEach((stage, index) => {
      totalDuration += stage.duration;
      setTimeout(() => {
        setCurrentStage(index);
        setProgress(((index + 1) / stages.length) * 100);
      }, totalDuration - stage.duration);
    });
  }, []);

  const currentStageData = stages[currentStage];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 relative overflow-hidden">
      {/* Animated particles background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Main progress card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-12 shadow-2xl">
          {/* Circular progress with agent avatar */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative w-64 h-64 mb-8">
              {/* SVG circular progress */}
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#11b6e9" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Agent avatar in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-chart-3 p-1 animate-pulse">
                    <div className="w-full h-full rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img 
                        src={currentStageData.avatar} 
                        alt={currentStageData.agent}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-4xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Current task description */}
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2 min-h-[32px]">
                {currentStageData.name}
                <span className="animate-pulse">...</span>
              </p>
              <p className="text-muted-foreground">
                {currentStageData.agent} is working on your plan
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2 mb-8" />

          {/* Time estimate */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Estimated time remaining: {Math.ceil((stages.length - currentStage) * 2 / 60)} minute{Math.ceil((stages.length - currentStage) * 2 / 60) !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Stage indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStage ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
