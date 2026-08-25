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
      <div className="relative w-48 h-48">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160" aria-label="Illustrative readiness score">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#005EB8" />
              <stop offset="100%" stopColor="#005EB8" />
            </linearGradient>
          </defs>

          <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted-foreground/20" />
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
            style={{ filter: "url(#glow)", transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Example Score</p>
            <p className="text-xl font-bold text-[#005EB8]">{animatedScore}%</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        {[
          ["Innovation", innovationScore, "bg-[#005EB8]", "text-primary"],
          ["Viability", viabilityScore, "bg-[#eab308]", "text-chart-3"],
          ["Scalability", scalabilityScore, "bg-[#059669]", "text-chart-2"],
        ].map(([label, score, barClass, textClass]) => (
          <div className="space-y-1.5" key={String(label)}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-foreground">{label}</span>
              <span className={`text-xs font-bold ${textClass}`}>{score}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-label={`Illustrative ${label} score`} aria-valuenow={Number(score)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full ${barClass} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Illustrative preparation scores only. They are not endorsement decisions, visa approval probabilities or legal advice.
      </p>
    </div>
  );
}
