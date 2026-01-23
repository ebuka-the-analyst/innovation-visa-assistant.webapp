import { useEffect, useState } from "react";
import { Globe2, Plane } from "lucide-react";

interface CountryLoadingProps {
  countryName: string;
  countryCode: string;
  onComplete: () => void;
}

function CountryFlag({ code }: { code: string }) {
  const flagColors: Record<string, { bg: string; text: string }> = {
    uk: { bg: "bg-[#012169]", text: "text-white" },
    us: { bg: "bg-[#3C3B6E]", text: "text-white" },
    ca: { bg: "bg-[#FF0000]", text: "text-white" },
    au: { bg: "bg-[#00008B]", text: "text-white" },
  };
  
  const colors = flagColors[code] || { bg: "bg-gray-600", text: "text-white" };
  
  return (
    <div className={`w-16 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${colors.bg} ${colors.text} shadow-lg`}>
      {code.toUpperCase()}
    </div>
  );
}

export function CountryLoading({ countryName, countryCode, onComplete }: CountryLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#0a0a1a] via-[#0f1a2a] to-[#0a0a1a] flex items-center justify-center">
      <style>{`
        @keyframes fly-plane {
          0% { transform: translateX(-100px) translateY(10px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(100px) translateY(-10px); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 94, 184, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 94, 184, 0.6), 0 0 60px rgba(65, 182, 230, 0.3); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fly-plane {
          animation: fly-plane 2s ease-in-out infinite;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>

      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-[#005EB8]/20 flex items-center justify-center mx-auto pulse-glow">
            <Globe2 className="w-12 h-12 text-[#41B6E6]" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Plane className="w-6 h-6 text-white fly-plane" />
          </div>
        </div>

        <div className="fade-in-up mb-6">
          <CountryFlag code={countryCode} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 fade-in-up" style={{ animationDelay: "0.2s" }}>
          Welcome to <span className="text-[#41B6E6]">{countryName}</span>
        </h1>
        
        <p className="text-gray-400 mb-8 fade-in-up" style={{ animationDelay: "0.4s" }}>
          Preparing your visa assistant...
        </p>

        <div className="w-64 mx-auto fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#005EB8] to-[#41B6E6] transition-all duration-100 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{progress}% loaded</p>
        </div>
      </div>
    </div>
  );
}
