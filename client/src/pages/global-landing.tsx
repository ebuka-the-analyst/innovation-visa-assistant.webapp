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
  Globe2,
  Lock,
  Search,
  Shield,
  Sparkles,
  Star,
  Unlock,
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
  isUnlocked: boolean;
  comingSoon?: boolean;
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
  const [isFadingOut, setIsFadingOut] = useState(false);
  const globeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCountrySelect = (country: Country) => {
    if (!country.isUnlocked) return;

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
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50 text-gray-900 dark:from-[#0a0a1a] dark:to-[#0a0a1a] dark:text-white">
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
        @keyframes zoom-in { 0% { transform: scale(1) rotateY(0); } 50% { transform: scale(2) rotateY(180deg); } 100% { transform: scale(50) rotateY(360deg); opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(0,94,184,.3); } 50% { box-shadow: 0 0 30px rgba(0,94,184,.5), 0 0 45px rgba(0,94,184,.2); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in .4s ease-out forwards; }
        .star { position: absolute; background: white; border-radius: 999px; animation: twinkle 3s infinite; }
        :not(.dark) .star { display: none; }
        .globe-container { perspective: 1000px; animation: float 6s ease-in-out infinite; }
        .globe { border-radius: 999px; box-shadow: inset -20px -20px 40px rgba(0,0,0,.3), 0 0 30px rgba(0,94,184,.3), 0 0 60px rgba(0,94,184,.15); animation: pulse-glow 4s ease-in-out infinite; }
        .dark .globe { box-shadow: inset -20px -20px 40px rgba(0,0,0,.5), 0 0 30px rgba(0,94,184,.3), 0 0 60px rgba(0,94,184,.15); }
        .globe.zooming { animation: zoom-in 1.5s ease-in forwards; }
        .country-card { backdrop-filter: blur(10px); background: rgba(255,255,255,.8); border: 1px solid rgba(0,94,184,.2); transition: all .2s ease; }
        .dark .country-card { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
        .country-card.unlocked { background: rgba(5,150,105,.1); border: 2px solid rgba(5,150,105,.5); }
        .dark .country-card.unlocked { background: rgba(5,150,105,.15); border-color: rgba(5,150,105,.6); }
        .country-card.unlocked:hover { background: rgba(5,150,105,.2); border-color: rgba(5,150,105,.7); }
        .country-card.locked { opacity: .5; cursor: not-allowed; }
        .gradient-text { background: linear-gradient(135deg,#005EB8 0%,#41B6E6 50%,#00A499 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-panel { backdrop-filter: blur(20px); background: rgba(255,255,255,.8); border: 1px solid rgba(0,94,184,.1); }
        .dark .glass-panel { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.08); }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(0,0,0,.05); }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,94,184,.3); border-radius: 2px; }
      `}</style>

      <div id="starfield" className="pointer-events-none fixed inset-0" />

      <div className={`relative z-10 flex h-full flex-col transition-opacity duration-500 ${isZooming ? "opacity-0" : "opacity-100"}`}>
        <header className="glass-panel flex-shrink-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2">
            <VisaAssistantBrand compact />

            <div className="flex items-center gap-2">
              <Badge className="border-emerald-500/30 bg-emerald-500/20 py-0.5 text-xs text-emerald-500 dark:text-emerald-400">
                <Sparkles className="mr-1 h-3 w-3" />
                {t.globalLanding.aiPowered}
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
                {t.globalLanding.signIn}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-2 lg:px-8">
            <div className="mb-1 max-w-xl text-center lg:mb-2">
              <Badge className="mb-1 border-[#005EB8]/30 bg-[#005EB8]/20 py-0.5 text-[10px] text-[#41B6E6]">
                <Globe2 className="mr-1 h-2.5 w-2.5" />
                {t.globalLanding.badge}
              </Badge>
              <h1 className="mb-1 text-xl font-bold sm:text-2xl lg:text-3xl xl:text-4xl">
                <span className="gradient-text">{t.globalLanding.headline}</span>
                <br />
                <span className="text-gray-900 dark:text-white">{t.globalLanding.subHeadline}</span>
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 lg:text-sm">{t.globalLanding.description}</p>
            </div>

            <div ref={globeRef} className="globe-container relative mb-1">
              <div className={`globe h-28 w-28 overflow-hidden sm:h-32 sm:w-32 lg:h-40 lg:w-40 xl:h-48 xl:w-48 ${isZooming ? "zooming" : ""}`}>
                <img src={globeImage} alt="Earth globe" className="h-full w-full object-cover" draggable={false} />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Badge variant="outline" className="border-white/20 bg-black/50 py-0.5 text-[10px] text-white">
                  <Star className="mr-1 h-2.5 w-2.5 text-yellow-400" />
                  {t.globalLanding.countriesCount} | 1 {t.globalLanding.live} | 15 {t.globalLanding.comingSoon}
                </Badge>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400"><Bot className="h-3 w-3 text-[#41B6E6]" /><span>{t.globalLanding.multiAgentAI}</span></div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400"><FileText className="h-3 w-3 text-emerald-400" /><span>{t.globalLanding.documentGeneration}</span></div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400"><Shield className="h-3 w-3 text-yellow-400" /><span>{t.globalLanding.complianceVerified}</span></div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400"><Users className="h-3 w-3 text-purple-400" /><span>{t.globalLanding.approvedApplicants}</span></div>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder={t.globalLanding.searchPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="rounded-full border-gray-300 bg-white/80 py-1.5 pl-9 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#005EB8] focus:ring-[#005EB8] dark:border-white/10 dark:bg-white/5 dark:text-white"
                data-testid="input-country-search"
              />
            </div>
          </div>

          <aside className="glass-panel flex w-72 flex-col overflow-hidden rounded-l-2xl lg:w-80 xl:w-96">
            <div className="flex-shrink-0 p-3 pb-2">
              <h2 className="text-sm font-semibold">{t.globalLanding.selectDestination}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t.globalLanding.chooseCountry}</p>
            </div>

            <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-3">
              {filteredCountries.map((country) => (
                <Card
                  key={country.code}
                  className={`country-card cursor-pointer p-2 ${country.isUnlocked ? "unlocked" : "locked"}`}
                  onClick={() => handleCountrySelect(country)}
                  data-testid={`card-country-${country.code}`}
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag code={country.flagCode} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-gray-900 dark:text-white">{country.name}</span>
                        {country.isUnlocked ? <Unlock className="h-3 w-3 flex-shrink-0 text-emerald-400" /> : <Lock className="h-3 w-3 flex-shrink-0 text-gray-500" />}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        {country.visaTypes.slice(0, 2).map((visa) => (
                          <span key={visa} className="rounded bg-gray-200/80 px-1 py-0.5 text-[9px] text-gray-600 dark:bg-white/10 dark:text-gray-400">{visa}</span>
                        ))}
                        {country.visaTypes.length > 2 && <span className="rounded bg-gray-200/80 px-1 py-0.5 text-[9px] text-gray-600 dark:bg-white/10 dark:text-gray-400">+{country.visaTypes.length - 2}</span>}
                      </div>
                    </div>
                    {country.isUnlocked ? (
                      <ChevronRight className="h-4 w-4 text-[#005EB8]" />
                    ) : country.comingSoon ? (
                      <Badge className="border-amber-500/30 bg-amber-500/20 px-1 py-0 text-[7px] text-amber-400">{t.globalLanding.next}</Badge>
                    ) : (
                      <Badge className="border-gray-500/30 bg-gray-500/20 px-1 py-0 text-[7px] text-gray-400">{t.globalLanding.soon}</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex-shrink-0 border-t border-white/10 p-2">
              <p className="text-center text-[10px] text-gray-500">{t.globalLanding.moreLaunching}</p>
            </div>
          </aside>
        </main>

        <footer className="glass-panel flex-shrink-0 py-1.5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-gray-500">
            <p>2026 {t.globalLanding.footerText}</p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" data-testid="link-privacy">{t.globalLanding.privacy}</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" data-testid="link-terms">{t.globalLanding.terms}</Button>
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
