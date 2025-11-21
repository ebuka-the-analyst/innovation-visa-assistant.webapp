import { useEffect, useState } from "react";

interface ReadinessScoreWidgetProps {
  overallScore?: number;
  innovationScore?: number;
  viabilityScore?: number;
  scalabilityScore?: number;
}

export default function ReadinessScoreWidget({
  overallScore = 78,
  innovationScore = 82,
  viabilityScore = 75,
  scalabilityScore = 76,
}: ReadinessScoreWidgetProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress <= overallScore) {
        setAnimatedScore(progress);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [overallScore]);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
          {/* Glow effect */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffa536" />
              <stop offset="100%" stopColor="#11b6e9" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted-foreground/20"
          />

          {/* Animated progress track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-75"
            style={{
              filter: "url(#glow)",
              transform: "rotate(-90deg)",
              transformOrigin: "80px 80px",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Readiness
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
              {animatedScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div className="w-full space-y-4">
        {/* Innovation */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Innovation</span>
            <span className="text-xs font-bold text-primary">{innovationScore}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
              style={{ width: `${innovationScore}%` }}
            />
          </div>
        </div>

        {/* Viability */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Viability</span>
            <span className="text-xs font-bold text-chart-3">{viabilityScore}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-chart-3 to-chart-3/60 rounded-full transition-all duration-1000"
              style={{ width: `${viabilityScore}%` }}
            />
          </div>
        </div>

        {/* Scalability */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Scalability</span>
            <span className="text-xs font-bold text-chart-2">{scalabilityScore}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-chart-2 to-chart-2/60 rounded-full transition-all duration-1000"
              style={{ width: `${scalabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Your readiness score updates as you complete the assessment
      </p>
    </div>
  );
}
