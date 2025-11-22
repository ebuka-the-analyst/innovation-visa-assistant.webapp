import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BlackNovemberBanner() {
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
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-slate-900 to-black border-b border-orange-500/30 shadow-2xl">
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 blur-3xl rounded-full animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary blur-3xl rounded-full animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Branding */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg md:text-2xl font-black text-white tracking-tighter">
                    BLACK NOVEMBER
                  </h3>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                    50% OFF
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-300">
                  Limited-time offer on all premium tools and bundles
                </p>
              </div>
            </div>

            {/* Center - Countdown */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-black/50 rounded-lg border border-orange-500/20">
              <div className="text-center">
                <div className="text-2xl font-black text-orange-500 min-w-[3rem]">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-400 font-medium">DAYS</div>
              </div>
              <div className="text-orange-500 font-black">:</div>
              <div className="text-center">
                <div className="text-2xl font-black text-orange-500 min-w-[3rem]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-400 font-medium">HRS</div>
              </div>
              <div className="text-orange-500 font-black">:</div>
              <div className="text-center">
                <div className="text-2xl font-black text-orange-500 min-w-[3rem]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-400 font-medium">MIN</div>
              </div>
              <div className="text-orange-500 font-black">:</div>
              <div className="text-center">
                <div className="text-2xl font-black text-orange-500 min-w-[3rem]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-gray-400 font-medium">SEC</div>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm md:text-base px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                data-testid="button-black-november-cta"
              >
                Claim Deal
              </Button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                data-testid="button-close-black-november"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Mobile Countdown */}
          <div className="lg:hidden flex items-center justify-between gap-2 mt-3 px-3 py-2 bg-black/50 rounded-lg border border-orange-500/20">
            <div className="text-center flex-1">
              <div className="text-lg font-black text-orange-500">{String(timeLeft.days).padStart(2, "0")}</div>
              <div className="text-xs text-gray-400">Days</div>
            </div>
            <div className="text-orange-500 font-black">:</div>
            <div className="text-center flex-1">
              <div className="text-lg font-black text-orange-500">{String(timeLeft.hours).padStart(2, "0")}</div>
              <div className="text-xs text-gray-400">Hrs</div>
            </div>
            <div className="text-orange-500 font-black">:</div>
            <div className="text-center flex-1">
              <div className="text-lg font-black text-orange-500">{String(timeLeft.minutes).padStart(2, "0")}</div>
              <div className="text-xs text-gray-400">Min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
