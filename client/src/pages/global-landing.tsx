import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Bot,
  ChevronRight,
  FileText,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import globeImage from "@assets/unnamed_(1)_1769196836272.png";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import VisaAssistantBrand from "@/components/VisaAssistantBrand";
import { useLanguage } from "@/contexts/LanguageContext";

interface Country {
  code: string;
  name: string;
  flagCode: string;
  visaTypes: string[];
  routeCount: number;
}

function CountryFlag({ code, className = "" }: { code: string; className?: string }) {
  const countryCodeMap: Record<string, string> = {
    uk: "gb",
    us: "us",
    ca: "ca",
    au: "au",
    de: "de",
    fr: "fr",
    nl: "nl",
    sg: "sg",
    ae: "ae",
    nz: "nz",
    jp: "jp",
    ie: "ie",
    pt: "pt",
    es: "es",
    se: "se",
    ch: "ch",
  };

  const flagCode = countryCodeMap[code] || code;

  return (
    <img
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      srcSet={`https://flagcdn.com/w160/${flagCode}.png 2x`}
      alt={code.toUpperCase()}
      className={`h-6 w-8 rounded object-cover shadow-sm ${className}`}
    />
  );
}

const countries: Country[] = [
  { code: "uk", routeCount: 42, name: "United Kingdom", flagCode: "uk", visaTypes: ["Innovator Founder", "Global Talent", "Skilled Worker"] },
  { code: "us", routeCount: 25, name: "United States", flagCode: "us", visaTypes: ["EB-1", "EB-2 NIW", "O-1", "E-2"] },
  { code: "ca", routeCount: 18, name: "Canada", flagCode: "ca", visaTypes: ["Start-up Visa", "Express Entry", "Provincial Nominee"] },
  { code: "au", routeCount: 20, name: "Australia", flagCode: "au", visaTypes: ["Global Talent", "Business Innovation", "Skilled Independent"] },
  { code: "de", routeCount: 15, name: "Germany", flagCode: "de", visaTypes: ["EU Blue Card", "Self-Employment", "Freelance"] },
  { code: "fr", routeCount: 16, name: "France", flagCode: "fr", visaTypes: ["French Tech Visa", "Talent Passport", "Entrepreneur"] },
  { code: "nl", routeCount: 14, name: "Netherlands", flagCode: "nl", visaTypes: ["Startup Visa", "Self-Employment", "Highly Skilled Migrant"] },
  { code: "sg", routeCount: 13, name: "Singapore", flagCode: "sg", visaTypes: ["EntrePass", "Tech.Pass", "Employment Pass"] },
  { code: "ae", routeCount: 14, name: "United Arab Emirates", flagCode: "ae", visaTypes: ["Golden Visa", "Green Visa", "Freelancer Visa"] },
  { code: "nz", routeCount: 17, name: "New Zealand", flagCode: "nz", visaTypes: ["Entrepreneur Work Visa", "Investor Visa", "Global Impact Visa"] },
  { code: "jp", routeCount: 16, name: "Japan", flagCode: "jp", visaTypes: ["Startup Visa", "Business Manager", "Highly Skilled Professional"] },
  { code: "ie", routeCount: 15, name: "Ireland", flagCode: "ie", visaTypes: ["Start-up Entrepreneur", "Immigrant Investor"] },
  { code: "pt", routeCount: 14, name: "Portugal", flagCode: "pt", visaTypes: ["Golden Visa", "D7 Visa", "Tech Visa"] },
  { code: "es", routeCount: 16, name: "Spain", flagCode: "es", visaTypes: ["Entrepreneur Visa", "Digital Nomad Visa", "Golden Visa"] },
  { code: "se", routeCount: 14, name: "Sweden", flagCode: "se", visaTypes: ["Self-Employment Permit", "Work Permit"] },
  { code: "ch", routeCount: 15, name: "Switzerland", flagCode: "ch", visaTypes: ["Self-Employment Permit", "L Permit", "B Permit"] },
];

export default function GlobalLanding() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsZooming(true);
    sessionStorage.setItem("navigating_from_global", country.code);

    setTimeout(() => setIsFadingOut(true), 1200);
    setTimeout(() => setLocation(`/${country.code}`), 1800);
  };

  useEffect(() => {
    const container = document.getElementById("starfield");
    if (!container) return;

    container.innerHTML = "";
    for (let i = 0; i < 150; i += 1) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.width = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      container.appendChild(star);
    }
  }, []);

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-y-auto bg-gradient-to-b from-sky-100 to-blue-50 text-gray-900 dark:from-[#0a0a1a] dark:to-[#0a0a1a] dark:text-white md:h-screen md:overflow-hidden">
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
        @keyframes zoom-in { 0% { transform: scale(1) rotateY(0); } 50% { transform: scale(2) rotateY(180deg); } 100% { transform: scale(50) rotateY(360deg); opacity: 0; } }
        @keyframes earth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(0,94,184,.3); } 50% { box-shadow: 0 0 30px rgba(0,94,184,.5), 0 0 45px rgba(0,94,184,.2); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in .4s ease-out forwards; }
        .star { position: absolute; background: white; border-radius: 999px; animation: twinkle 3s infinite; }
        :not(.dark) .star { display: none; }
        .globe-container { perspective: 1000px; }
        .globe { border-radius: 999px; box-shadow: inset -20px -20px 40px rgba(0,0,0,.3), 0 0 30px rgba(0,94,184,.3), 0 0 60px rgba(0,94,184,.15); animation: pulse-glow 4s ease-in-out infinite; }
        .globe img { animation: earth-spin 45s linear infinite; transform-origin: center; }
        .globe.zooming img { animation: none; }
        .dark .globe { box-shadow: inset -20px -20px 40px rgba(0,0,0,.5), 0 0 30px rgba(0,94,184,.3), 0 0 60px rgba(0,94,184,.15); }
        .globe.zooming { animation: zoom-in 1.5s ease-in forwards; }
        .country-card { backdrop-filter: blur(10px); background: rgba(255,255,255,.8); border: 1px solid rgba(0,94,184,.2); transition: all .2s ease; }
        .dark .country-card { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
        .country-card:hover { border-color: rgba(0,94,184,.45); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,94,184,.08); }
        .gradient-text { background: linear-gradient(135deg,#005EB8 0%,#41B6E6 50%,#00A499 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-panel { backdrop-filter: blur(20px); background: rgba(255,255,255,.8); border: 1px solid rgba(0,94,184,.1); }
        .dark .glass-panel { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.08); }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(0,0,0,.05); }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,94,184,.3); border-radius: 2px; }
      `}</style>

      <div id="starfield" className="pointer-events-none fixed inset-0" />

      <div className={`relative z-10 flex min-h-[100svh] flex-col transition-opacity duration-500 md:h-full md:min-h-0 ${isZooming ? "opacity-0" : "opacity-100"}`}>
        <header className="glass-panel flex-shrink-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2">
            <VisaAssistantBrand compact />

            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="hidden border-emerald-500/30 bg-emerald-500/20 py-0.5 text-xs text-emerald-500 dark:text-emerald-400 sm:inline-flex">
                <Sparkles className="mr-1 h-3 w-3" />
                {t.globalLanding.aiPowered}
              </Badge>
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-[#005EB8]/50 px-3 text-[#005EB8]"
                onClick={() => setLocation("/login")}
                data-testid="button-global-login"
              >
                {t.globalLanding.signIn}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-visible md:flex-row md:overflow-hidden">
          <div className="flex flex-none flex-col items-center justify-center px-5 pb-7 pt-8 md:flex-1 md:px-4 md:py-2 lg:px-8">
            <div className="mb-4 max-w-xl text-center md:mb-2">
              <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl md:mb-1 md:text-2xl lg:text-3xl xl:text-4xl">
                <span className="gradient-text">{t.globalLanding.headline}</span>
                <br />
                <span className="text-gray-900 dark:text-white">{t.globalLanding.subHeadline}</span>
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-xs md:leading-normal lg:text-sm">{t.globalLanding.description}</p>
            </div>

            <div ref={globeRef} className="globe-container relative mb-6 mt-2 md:mb-1 md:mt-0">
              <div className={`globe h-36 w-36 overflow-hidden sm:h-40 sm:w-40 md:h-32 md:w-32 lg:h-40 lg:w-40 xl:h-48 xl:w-48 ${isZooming ? "zooming" : ""}`}>
                <img src={globeImage} alt="Earth globe" className="h-full w-full object-cover" draggable={false} />
              </div>
            </div>

            <div className="mb-5 grid w-full max-w-sm grid-cols-2 gap-x-3 gap-y-2.5 md:mb-2 md:flex md:max-w-none md:flex-wrap md:justify-center md:gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 md:text-[10px]"><Bot className="h-3.5 w-3.5 flex-shrink-0 text-[#41B6E6] md:h-3 md:w-3" /><span>{t.globalLanding.multiAgentAI}</span></div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 md:text-[10px]"><FileText className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400 md:h-3 md:w-3" /><span>{t.globalLanding.documentGeneration}</span></div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 md:text-[10px]"><Shield className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400 md:h-3 md:w-3" /><span>{t.globalLanding.complianceVerified}</span></div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 md:text-[10px]"><Users className="h-3.5 w-3.5 flex-shrink-0 text-purple-400 md:h-3 md:w-3" /><span>{t.globalLanding.approvedApplicants}</span></div>
            </div>

            <div className="relative w-full max-w-sm md:max-w-xs">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 md:left-3" />
              <Input
                placeholder={t.globalLanding.searchPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-full border-gray-300 bg-white/80 pl-11 text-base text-gray-900 placeholder:text-gray-500 focus:border-[#005EB8] focus:ring-[#005EB8] dark:border-white/10 dark:bg-white/5 dark:text-white md:h-auto md:py-1.5 md:pl-9 md:text-sm"
                data-testid="input-country-search"
              />
            </div>
          </div>

          <aside className="glass-panel mx-3 mb-4 flex min-h-[32rem] w-auto flex-col overflow-hidden rounded-2xl md:mx-0 md:mb-0 md:min-h-0 md:w-72 md:rounded-l-2xl md:rounded-r-none lg:w-80 xl:w-96">
            <div className="flex-shrink-0 p-4 pb-3 md:p-3 md:pb-2">
              <h2 className="text-lg font-semibold md:text-sm">{t.globalLanding.selectDestination}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 md:text-xs">{t.globalLanding.chooseCountry}</p>
            </div>

            <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 pb-2 md:space-y-1.5 md:pb-0">
              {filteredCountries.map((country) => (
                <Card
                  key={country.code}
                  className="country-card cursor-pointer p-3 md:p-2"
                  onClick={() => handleCountrySelect(country)}
                  data-testid={`card-country-${country.code}`}
                >
                  <div className="flex items-center gap-3 md:gap-2">
                    <CountryFlag code={country.flagCode} className="h-7 w-10 md:h-6 md:w-8" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white md:text-xs">{country.name}</span>
                        
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 md:mt-0.5 md:gap-0.5">
                        {country.visaTypes.slice(0, 2).map((visa) => (
                          <span key={visa} className="rounded bg-gray-200/80 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-400 md:px-1 md:text-[9px]">{visa}</span>
                        ))}
                        {country.routeCount > 2 && <span className="rounded bg-gray-200/80 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-white/10 dark:text-gray-400 md:px-1 md:text-[9px]">+{country.routeCount - 2}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#005EB8] md:h-4 md:w-4" />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex-shrink-0 border-t border-white/10 p-3 md:p-2">
              <p className="text-center text-xs text-gray-500 md:text-[10px]">{t.globalLanding.moreLaunching}</p>
            </div>
          </aside>
        </main>

        <footer className="glass-panel flex-shrink-0 py-2 md:py-1.5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 text-center sm:flex-row sm:gap-4 text-[10px] text-gray-500 md:text-xs">
            <p>2026 {t.globalLanding.footerText}</p>
            <div className="flex items-center gap-1 md:gap-3">
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-gray-500 md:px-2 md:text-xs" data-testid="link-privacy">{t.globalLanding.privacy}</Button>
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-gray-500 md:px-2 md:text-xs" data-testid="link-terms">{t.globalLanding.terms}</Button>
            </div>
          </div>
        </footer>
      </div>

      {isZooming && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-out ${isFadingOut ? "bg-[#0a0a1a] opacity-100" : "animate-fade-in bg-sky-100 dark:bg-[#0a0a1a]"}`}>
          <div className={`text-center transition-all duration-500 ease-out ${isFadingOut ? "-translate-y-5 scale-110 opacity-0" : "scale-100 opacity-100"}`}>
            <div className="globe-container">
              <div className={`globe zooming h-48 w-48 overflow-hidden transition-transform duration-500 lg:h-64 lg:w-64 ${isFadingOut ? "scale-150" : "scale-100"}`}>
                <img src={globeImage} alt="Earth globe" className="h-full w-full object-cover" />
              </div>
            </div>
            <p className={`mt-6 text-lg font-semibold text-gray-900 transition-opacity duration-300 dark:text-white ${isFadingOut ? "opacity-0" : "animate-pulse"}`}>
              Traveling to {selectedCountry?.name}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
