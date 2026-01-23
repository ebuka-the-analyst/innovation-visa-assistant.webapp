import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  Lock, 
  Unlock, 
  Globe2, 
  Sparkles, 
  Star,
  Shield,
  Users,
  FileText,
  Bot,
  ChevronRight
} from "lucide-react";
import globeImage from "@assets/unnamed_(1)_1769196836272.png";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

interface Country {
  code: string;
  name: string;
  flagCode: string;
  visaTypes: string[];
  isUnlocked: boolean;
  comingSoon?: boolean;
}

function CountryFlag({ code, className = "" }: { code: string; className?: string }) {
  const flagColors: Record<string, { bg: string; text: string }> = {
    uk: { bg: "bg-[#012169]", text: "text-white" },
    us: { bg: "bg-[#3C3B6E]", text: "text-white" },
    ca: { bg: "bg-[#FF0000]", text: "text-white" },
    au: { bg: "bg-[#00008B]", text: "text-white" },
    de: { bg: "bg-[#000000]", text: "text-[#FFCC00]" },
    fr: { bg: "bg-[#0055A4]", text: "text-white" },
    nl: { bg: "bg-[#AE1C28]", text: "text-white" },
    sg: { bg: "bg-[#ED2939]", text: "text-white" },
    ae: { bg: "bg-[#00732F]", text: "text-white" },
    nz: { bg: "bg-[#00247D]", text: "text-white" },
    jp: { bg: "bg-white", text: "text-[#BC002D]" },
    ie: { bg: "bg-[#169B62]", text: "text-white" },
    pt: { bg: "bg-[#006600]", text: "text-[#FF0000]" },
    es: { bg: "bg-[#AA151B]", text: "text-[#F1BF00]" },
    se: { bg: "bg-[#006AA7]", text: "text-[#FECC00]" },
    ch: { bg: "bg-[#FF0000]", text: "text-white" },
  };
  
  const colors = flagColors[code] || { bg: "bg-gray-600", text: "text-white" };
  
  return (
    <div className={`w-7 h-5 rounded flex items-center justify-center text-[10px] font-bold ${colors.bg} ${colors.text} ${className}`}>
      {code.toUpperCase()}
    </div>
  );
}

const countries: Country[] = [
  { code: "uk", name: "United Kingdom", flagCode: "uk", visaTypes: ["Innovator Founder", "Global Talent", "Skilled Worker"], isUnlocked: true },
  { code: "us", name: "United States", flagCode: "us", visaTypes: ["EB-1", "EB-2 NIW", "O-1", "E-2"], isUnlocked: false, comingSoon: true },
  { code: "ca", name: "Canada", flagCode: "ca", visaTypes: ["Start-up Visa", "Express Entry", "Provincial Nominee"], isUnlocked: false },
  { code: "au", name: "Australia", flagCode: "au", visaTypes: ["Global Talent", "Business Innovation", "Skilled Independent"], isUnlocked: false },
  { code: "de", name: "Germany", flagCode: "de", visaTypes: ["EU Blue Card", "Self-Employment", "Freelance"], isUnlocked: false },
  { code: "fr", name: "France", flagCode: "fr", visaTypes: ["French Tech Visa", "Talent Passport", "Entrepreneur"], isUnlocked: false },
  { code: "nl", name: "Netherlands", flagCode: "nl", visaTypes: ["Startup Visa", "Self-Employment", "Highly Skilled Migrant"], isUnlocked: false },
  { code: "sg", name: "Singapore", flagCode: "sg", visaTypes: ["EntrePass", "Tech.Pass", "Employment Pass"], isUnlocked: false },
  { code: "ae", name: "United Arab Emirates", flagCode: "ae", visaTypes: ["Golden Visa", "Green Visa", "Freelancer Visa"], isUnlocked: false },
  { code: "nz", name: "New Zealand", flagCode: "nz", visaTypes: ["Entrepreneur Work Visa", "Investor Visa", "Global Impact Visa"], isUnlocked: false },
  { code: "jp", name: "Japan", flagCode: "jp", visaTypes: ["Startup Visa", "Business Manager", "Highly Skilled Professional"], isUnlocked: false },
  { code: "ie", name: "Ireland", flagCode: "ie", visaTypes: ["Start-up Entrepreneur", "Immigrant Investor"], isUnlocked: false },
  { code: "pt", name: "Portugal", flagCode: "pt", visaTypes: ["Golden Visa", "D7 Visa", "Tech Visa"], isUnlocked: false },
  { code: "es", name: "Spain", flagCode: "es", visaTypes: ["Entrepreneur Visa", "Digital Nomad Visa", "Golden Visa"], isUnlocked: false },
  { code: "se", name: "Sweden", flagCode: "se", visaTypes: ["Self-Employment Permit", "Work Permit"], isUnlocked: false },
  { code: "ch", name: "Switzerland", flagCode: "ch", visaTypes: ["Self-Employment Permit", "L Permit", "B Permit"], isUnlocked: false },
];

export default function GlobalLanding() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    if (!country.isUnlocked) return;
    
    setSelectedCountry(country);
    setIsZooming(true);
    
    sessionStorage.setItem("navigating_from_global", country.code);
    
    setTimeout(() => {
      setLocation(`/${country.code}`);
    }, 1500);
  };

  useEffect(() => {
    const createStars = () => {
      const container = document.getElementById('starfield');
      if (!container) return;
      
      container.innerHTML = '';
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        container.appendChild(star);
      }
    };
    
    createStars();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-sky-100 to-blue-50 dark:bg-[#0a0a1a] dark:from-[#0a0a1a] dark:to-[#0a0a1a] text-gray-900 dark:text-white overflow-hidden relative flex flex-col">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes zoom-in {
          0% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(2) rotateY(180deg); }
          100% { transform: scale(50) rotateY(360deg); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 94, 184, 0.3); }
          50% { box-shadow: 0 0 30px rgba(0, 94, 184, 0.5), 0 0 45px rgba(0, 94, 184, 0.2); }
        }
        
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }
        
        .dark .star {
          display: block;
        }
        
        :not(.dark) .star {
          display: none;
        }
        
        .globe-container {
          perspective: 1000px;
          animation: float 6s ease-in-out infinite;
        }
        
        .globe {
          border-radius: 50%;
          box-shadow: 
            inset -20px -20px 40px rgba(0,0,0,0.3),
            0 0 30px rgba(0, 94, 184, 0.3),
            0 0 60px rgba(0, 94, 184, 0.15);
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        .dark .globe {
          box-shadow: 
            inset -20px -20px 40px rgba(0,0,0,0.5),
            0 0 30px rgba(0, 94, 184, 0.3),
            0 0 60px rgba(0, 94, 184, 0.15);
        }
        
        .globe.zooming {
          animation: zoom-in 1.5s ease-in forwards;
        }
        
        .country-card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 94, 184, 0.2);
          transition: all 0.2s ease;
        }
        
        .dark .country-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .country-card.unlocked:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(0, 94, 184, 0.5);
        }
        
        .dark .country-card.unlocked:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .country-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #005EB8 0%, #41B6E6 50%, #00A499 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-panel {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 94, 184, 0.1);
        }
        
        .dark .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0,94,184,0.3);
          border-radius: 2px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
        }
      `}</style>

      <div id="starfield" className="fixed inset-0 pointer-events-none" />

      <div className={`relative z-10 flex flex-col h-full transition-opacity duration-500 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
        <header className="flex-shrink-0 glass-panel">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="h-6 w-6 text-[#005EB8]" />
              <div>
                <h1 className="text-base font-bold leading-tight">Visa Assistant</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">.global</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <LanguageSelector />
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#005EB8]/50 text-[#005EB8]"
                onClick={() => setLocation("/login")}
                data-testid="button-global-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-8 py-2">
            <div className="text-center mb-1 lg:mb-2 max-w-xl">
              <Badge className="mb-1 bg-[#005EB8]/20 text-[#41B6E6] border-[#005EB8]/30 text-[10px] py-0.5">
                <Globe2 className="h-2.5 w-2.5 mr-1" />
                World's First Global AI Visa Platform
              </Badge>
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1">
                <span className="gradient-text">Your Gateway to</span>
                <br />
                <span className="text-gray-900 dark:text-white">Global Opportunities</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm">
                AI-powered visa assistance for entrepreneurs, innovators, and skilled professionals. 
                Select your destination country to begin.
              </p>
            </div>

            <div 
              ref={globeRef}
              className="globe-container relative mb-1"
            >
              <div 
                className={`globe w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full overflow-hidden ${isZooming ? 'zooming' : ''}`}
              >
                <img 
                  src={globeImage} 
                  alt="Earth Globe" 
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-[10px] py-0.5">
                  <Star className="h-2.5 w-2.5 mr-1 text-yellow-400" />
                  16 Countries | 1 Live | 15 Coming Soon
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <Bot className="h-3 w-3 text-[#41B6E6]" />
                <span>Multi-Agent AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <FileText className="h-3 w-3 text-emerald-400" />
                <span>Document Generation</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <Shield className="h-3 w-3 text-yellow-400" />
                <span>Compliance Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400">
                <Users className="h-3 w-3 text-purple-400" />
                <span>500+ Approved</span>
              </div>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-1.5 text-sm bg-white/80 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 rounded-full focus:border-[#005EB8] focus:ring-[#005EB8]"
                data-testid="input-country-search"
              />
            </div>
          </div>

          <div className="w-72 lg:w-80 xl:w-96 glass-panel rounded-l-2xl flex flex-col overflow-hidden">
            <div className="p-3 pb-2 flex-shrink-0">
              <h3 className="text-sm font-semibold">Select Destination</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Choose where you want to immigrate</p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1.5 scrollbar-thin">
              {filteredCountries.map((country) => (
                <Card
                  key={country.code}
                  className={`country-card p-2 cursor-pointer ${country.isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => handleCountrySelect(country)}
                  data-testid={`card-country-${country.code}`}
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag code={country.flagCode} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{country.name}</span>
                        {country.isUnlocked ? (
                          <Unlock className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {country.visaTypes.slice(0, 2).map((visa, i) => (
                          <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                            {visa}
                          </span>
                        ))}
                        {country.visaTypes.length > 2 && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                            +{country.visaTypes.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    {country.isUnlocked ? (
                      <ChevronRight className="h-4 w-4 text-[#005EB8]" />
                    ) : country.comingSoon ? (
                      <Badge className="text-[7px] bg-amber-500/20 text-amber-400 border-amber-500/30 px-1 py-0">
                        NEXT
                      </Badge>
                    ) : (
                      <Badge className="text-[7px] bg-gray-500/20 text-gray-400 border-gray-500/30 px-1 py-0">
                        SOON
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="p-2 border-t border-white/10 flex-shrink-0">
              <p className="text-[10px] text-gray-500 text-center">
                More countries launching in 2026
              </p>
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 glass-panel py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-500">
            <p>2026 Visa Assistant Global</p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-gray-500 text-xs h-6 px-2" data-testid="link-privacy">Privacy</Button>
              <Button variant="ghost" size="sm" className="text-gray-500 text-xs h-6 px-2" data-testid="link-terms">Terms</Button>
            </div>
          </div>
        </footer>
      </div>

      {isZooming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-100 dark:bg-[#0a0a1a]">
          <div className="text-center">
            <div className="globe-container">
              <div className="globe zooming w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden">
                <img 
                  src={globeImage} 
                  alt="Earth Globe" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-900 dark:text-white animate-pulse">
              Traveling to {selectedCountry?.name}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
