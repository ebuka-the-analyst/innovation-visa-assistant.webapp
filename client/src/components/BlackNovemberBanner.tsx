import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BlackNovemberBanner() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Black Friday 2025: November 28
    const blackFridayDate = new Date("2025-11-28T23:59:59").getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = blackFridayDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / 1000 / 60) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-black via-slate-900 to-black border-b border-orange-500/30 shadow-2xl">
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500 blur-3xl rounded-full animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary blur-3xl rounded-full animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-3 md:px-6 py-3 md:py-4">
          {/* Top row - Title and CTA */}
          <div className="flex items-start justify-between gap-3 md:gap-4">
            {/* Left side - Branding */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-xl font-black text-white tracking-tighter whitespace-nowrap">
                    BLACK NOVEMBER
                  </h3>
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                    50% OFF
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Limited-time offer on all premium tools
                </p>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => setLocation("/pricing")}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap h-auto"
                data-testid="button-black-november-cta"
              >
                Claim
              </Button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                data-testid="button-close-black-november"
              >
                <X className="w-4 md:w-5 h-4 md:h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Bottom row - Countdown (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-1 mt-2 px-3 py-2 bg-black/30 rounded-lg border border-orange-500/20 w-fit mx-auto">
            <div className="text-center">
              <div className="text-base md:text-lg font-black text-orange-500 min-w-[2rem]">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400">DAYS</div>
            </div>
            <div className="text-orange-500 font-black text-sm">:</div>
            <div className="text-center">
              <div className="text-base md:text-lg font-black text-orange-500 min-w-[2rem]">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400">HRS</div>
            </div>
            <div className="text-orange-500 font-black text-sm">:</div>
            <div className="text-center">
              <div className="text-base md:text-lg font-black text-orange-500 min-w-[2rem]">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400">MIN</div>
            </div>
            <div className="text-orange-500 font-black text-sm">:</div>
            <div className="text-center">
              <div className="text-base md:text-lg font-black text-orange-500 min-w-[2rem]">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400">SEC</div>
            </div>
          </div>

          {/* Mobile Countdown */}
          <div className="md:hidden flex items-center justify-center gap-1 mt-2 px-2 py-1.5 bg-black/30 rounded-lg border border-orange-500/20 text-xs">
            <span className="font-black text-orange-500">{timeLeft.days}d</span>
            <span className="text-orange-500">•</span>
            <span className="font-black text-orange-500">{timeLeft.hours}h</span>
            <span className="text-orange-500">•</span>
            <span className="font-black text-orange-500">{timeLeft.minutes}m</span>
            <span className="text-orange-500">•</span>
            <span className="font-black text-orange-500">{timeLeft.seconds}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
