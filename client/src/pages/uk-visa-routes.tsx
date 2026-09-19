import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, Award, Baby, BarChart3, BookOpen, BriefcaseBusiness,
  Building2, Camera, ChevronRight, Church, Compass, ExternalLink, FileText,
  Globe2, GraduationCap, Handshake, Heart, House, Languages, Leaf, Lightbulb,
  MapPin, Palette, Plane, Repeat2, Rocket, Route, Scale, School, Search,
  ShieldCheck, Stethoscope, Trophy, Users, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCatalogueText } from "@/lib/catalogue-i18n";
import { getStaticUkCatalogueTranslation, hasCompleteStaticUkCatalogue } from "@/lib/uk-catalogue-static-translations";
import CountryPublicNav from "@/components/CountryPublicNav";
import globeImage from "@assets/unnamed_(1)_1769196836272.png";

const INNOVATOR_FOUNDER_PATH = "/uk/innovatorfoundervisaassistant";
const WESTMINSTER_IMAGE = "https://images.unsplash.com/photo-1755453468328-9b5f7ed16408?auto=format&fit=crop&q=84&w=2200";

type VisaRoute = { name: string; description: string; status?: "live"; href?: string; officialUrl?: string };
type RouteGroup = { title: string; description: string; icon: LucideIcon; routes: VisaRoute[] };

const groups: RouteGroup[] = [
  {
    title: "Business & Talent",
    description: "Routes for founders, recognised talent and high-potential professionals.",
    icon: Users,
    routes: [
      { name: "Innovator Founder", description: "Build and grow an innovative, viable and scalable UK business.", status: "live", href: INNOVATOR_FOUNDER_PATH, officialUrl: "https://www.gov.uk/innovator-founder-visa" },
      { name: "Global Talent", description: "For leaders or potential leaders in qualifying fields.", officialUrl: "https://www.gov.uk/global-talent" },
      { name: "High Potential Individual (HPI)", description: "For recent graduates of eligible leading global universities.", officialUrl: "https://www.gov.uk/high-potential-individual-visa" },
    ],
  },
  {
    title: "Work",
    description: "Sponsored, unsponsored and temporary routes for working in the UK.",
    icon: BriefcaseBusiness,
    routes: [
      { name: "Skilled Worker", description: "For eligible jobs with an approved UK employer.", officialUrl: "https://www.gov.uk/skilled-worker-visa" },
      { name: "Health and Care Worker", description: "For eligible health and adult social care professionals.", officialUrl: "https://www.gov.uk/health-care-worker-visa" },
      { name: "Scale-up Worker", description: "For eligible jobs at qualifying fast-growing UK businesses.", officialUrl: "https://www.gov.uk/scale-up-worker-visa" },
      { name: "Graduate", description: "For eligible graduates who completed a course in the UK.", officialUrl: "https://www.gov.uk/graduate-visa" },
      { name: "Youth Mobility Scheme", description: "For eligible young people from participating countries and territories.", officialUrl: "https://www.gov.uk/youth-mobility" },
      { name: "India Young Professionals Scheme", description: "For eligible Indian citizens aged 18 to 30 selected in the ballot.", officialUrl: "https://www.gov.uk/india-young-professionals-scheme-visa" },
      { name: "UK Ancestry", description: "For eligible Commonwealth citizens with a qualifying UK-born grandparent.", officialUrl: "https://www.gov.uk/ancestry-visa" },
      { name: "International Sportsperson", description: "For elite sportspeople and qualified coaches.", officialUrl: "https://www.gov.uk/sportsperson-visa" },
      { name: "Minister of Religion", description: "For eligible faith-community roles sponsored in the UK.", officialUrl: "https://www.gov.uk/minister-of-religion-visa" },
      { name: "Senior or Specialist Worker (GBM)", description: "Temporary assignment to a linked UK business.", officialUrl: "https://www.gov.uk/senior-specialist-worker-visa" },
      { name: "Graduate Trainee (GBM)", description: "UK placement as part of an eligible graduate training programme.", officialUrl: "https://www.gov.uk/graduate-trainee-visa" },
      { name: "UK Expansion Worker (GBM)", description: "For workers establishing a UK branch of an overseas business.", officialUrl: "https://www.gov.uk/uk-expansion-worker-visa" },
      { name: "Service Supplier (GBM)", description: "For eligible contractual service assignments in the UK.", officialUrl: "https://www.gov.uk/service-supplier-visa" },
      { name: "Secondment Worker (GBM)", description: "For eligible secondments connected to high-value contracts.", officialUrl: "https://www.gov.uk/secondment-worker-visa" },
      { name: "Seasonal Worker", description: "Temporary work in eligible seasonal sectors.", officialUrl: "https://www.gov.uk/seasonal-worker-visa" },
      { name: "Government Authorised Exchange", description: "Temporary work experience, training, research or fellowship schemes.", officialUrl: "https://www.gov.uk/government-authorised-exchange" },
      { name: "Creative Worker", description: "Temporary work in eligible creative industries.", officialUrl: "https://www.gov.uk/creative-worker-visa" },
      { name: "Religious Worker", description: "Temporary religious work in the UK.", officialUrl: "https://www.gov.uk/religious-worker-visa" },
      { name: "Charity Worker", description: "Temporary unpaid voluntary work for a UK charity.", officialUrl: "https://www.gov.uk/charity-worker-visa" },
      { name: "International Agreement", description: "Work covered by international law or treaty arrangements.", officialUrl: "https://www.gov.uk/international-agreement-worker-visa" },
      { name: "Overseas Domestic Worker", description: "For eligible domestic workers accompanying an employer to the UK.", officialUrl: "https://www.gov.uk/overseas-domestic-worker-visa" },
      { name: "Representative of an Overseas Business", description: "For eligible representatives covered by the remaining route provisions.", officialUrl: "https://www.gov.uk/representative-overseas-business" },
    ],
  },
  {
    title: "Study",
    description: "Routes for higher education, independent schools and short English courses.",
    icon: GraduationCap,
    routes: [
      { name: "Student", description: "For eligible further or higher education courses with a licensed sponsor.", officialUrl: "https://www.gov.uk/student-visa" },
      { name: "Child Student", description: "For children aged 4 to 17 studying at an independent school.", officialUrl: "https://www.gov.uk/child-study-visa" },
      { name: "Short-term Study", description: "For eligible English language courses lasting 6 to 11 months.", officialUrl: "https://www.gov.uk/study-visit-visa" },
    ],
  },
  {
    title: "Family",
    description: "Routes for partners, children, parents and other qualifying family circumstances.",
    icon: Heart,
    routes: [
      { name: "Partner or Spouse", description: "Join or remain with an eligible partner or spouse in the UK.", officialUrl: "https://www.gov.uk/uk-family-visa/partner-spouse" },
      { name: "Fiancé, Fiancée or Proposed Civil Partner", description: "Come to the UK to marry or form a civil partnership and meet the family route requirements.", officialUrl: "https://www.gov.uk/uk-family-visa/partner-spouse" },
      { name: "Child", description: "Eligible children joining or staying with family in the UK.", officialUrl: "https://www.gov.uk/uk-family-visa/child" },
      { name: "Parent", description: "For eligible parents joining or remaining with a child in the UK.", officialUrl: "https://www.gov.uk/uk-family-visa/parent" },
      { name: "Adult Dependent Relative", description: "For qualifying relatives who need long-term personal care.", officialUrl: "https://www.gov.uk/uk-family-visa/adult-dependent-relative" },
      { name: "EU Settlement Scheme Family Permit", description: "For qualifying family members under the EU Settlement Scheme.", officialUrl: "https://www.gov.uk/family-permit" },
    ],
  },
  {
    title: "Visit & Transit",
    description: "Short stays, marriage visits and transit through the UK.",
    icon: Plane,
    routes: [
      { name: "Standard Visitor", description: "Tourism, family visits, eligible business activities and other permitted short stays.", officialUrl: "https://www.gov.uk/standard-visitor" },
      { name: "Marriage Visitor", description: "Come to the UK to marry or form a civil partnership without settling.", officialUrl: "https://www.gov.uk/marriage-visa" },
      { name: "Transit Visa", description: "For eligible travellers passing through the UK on the way elsewhere.", officialUrl: "https://www.gov.uk/transit-visa" },
      { name: "Electronic Travel Authorisation (ETA)", description: "Travel permission for eligible visitors who do not need a visa.", officialUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta" },
    ],
  },
  {
    title: "Other UK Routes",
    description: "Additional routes and status pathways listed by UK Visas and Immigration.",
    icon: Building2,
    routes: [
      { name: "British National (Overseas)", description: "The BNO route for eligible British National (Overseas) citizens and family members.", officialUrl: "https://www.gov.uk/british-national-overseas-bno-visa" },
      { name: "Frontier Worker Permit", description: "For eligible cross-border workers protected by the Withdrawal Agreement.", officialUrl: "https://www.gov.uk/frontier-worker-permit" },
      { name: "EU Settlement Scheme", description: "Settled or pre-settled status for eligible EU, EEA and Swiss citizens and family members.", officialUrl: "https://www.gov.uk/settled-status-eu-citizens-families" },
      { name: "Ukraine Schemes", description: "Current immigration routes and extensions for eligible Ukrainians and their families.", officialUrl: "https://www.gov.uk/guidance/apply-for-a-visa-under-the-ukraine-sponsorship-scheme" },
    ],
  },
];

const routeIcon: Record<string, LucideIcon> = {
  "Innovator Founder": Lightbulb,
  "Global Talent": Award,
  "High Potential Individual (HPI)": GraduationCap,
  "Skilled Worker": Wrench,
  "Health and Care Worker": Stethoscope,
  "Scale-up Worker": Rocket,
  "Graduate": GraduationCap,
  "Youth Mobility Scheme": Plane,
  "India Young Professionals Scheme": BriefcaseBusiness,
  "UK Ancestry": Globe2,
  "International Sportsperson": Trophy,
  "Minister of Religion": Church,
  "Senior or Specialist Worker (GBM)": BriefcaseBusiness,
  "Graduate Trainee (GBM)": GraduationCap,
  "UK Expansion Worker (GBM)": Building2,
  "Service Supplier (GBM)": Handshake,
  "Secondment Worker (GBM)": Repeat2,
  "Seasonal Worker": Leaf,
  "Government Authorised Exchange": Repeat2,
  "Creative Worker": Palette,
  "Religious Worker": Church,
  "Charity Worker": Heart,
  "International Agreement": Scale,
  "Overseas Domestic Worker": House,
  "Representative of an Overseas Business": Building2,
  "Student": BookOpen,
  "Child Student": School,
  "Short-term Study": Languages,
  "Partner or Spouse": Heart,
  "Fiancé, Fiancée or Proposed Civil Partner": Heart,
  "Child": Baby,
  "Parent": Users,
  "Adult Dependent Relative": Users,
  "EU Settlement Scheme Family Permit": Users,
  "Standard Visitor": Camera,
  "Marriage Visitor": Heart,
  "Transit Visa": Route,
  "Electronic Travel Authorisation (ETA)": Plane,
  "British National (Overseas)": Globe2,
  "Frontier Worker Permit": Repeat2,
  "EU Settlement Scheme": House,
  "Ukraine Schemes": ShieldCheck,
};

const uiCopy = {
  en: { search:"Search", viewAll:"View all", showLess:"Show less", countries:"Countries", routes:"Visa routes", guides:"Guides", about:"About", explore:"Explore", exploreText:"Find the right route for your goals", prepare:"Prepare", prepareText:"Get clear, up-to-date guidance", move:"Move forward", moveText:"Turn your ambitions into reality" },
  es: { search:"Buscar", viewAll:"Ver todo", showLess:"Ver menos", countries:"Países", routes:"Rutas de visado", guides:"Guías", about:"Acerca de", explore:"Explorar", exploreText:"Encuentra la ruta adecuada para tus objetivos", prepare:"Prepárate", prepareText:"Obtén orientación clara y actualizada", move:"Avanza", moveText:"Convierte tus ambiciones en realidad" },
  fr: { search:"Rechercher", viewAll:"Tout voir", showLess:"Voir moins", countries:"Pays", routes:"Voies de visa", guides:"Guides", about:"À propos", explore:"Explorer", exploreText:"Trouvez la voie adaptée à vos objectifs", prepare:"Préparer", prepareText:"Obtenez des conseils clairs et à jour", move:"Avancer", moveText:"Transformez vos ambitions en réalité" },
  de: { search:"Suchen", viewAll:"Alle anzeigen", showLess:"Weniger anzeigen", countries:"Länder", routes:"Visumrouten", guides:"Leitfäden", about:"Über uns", explore:"Entdecken", exploreText:"Finden Sie die passende Route für Ihre Ziele", prepare:"Vorbereiten", prepareText:"Klare und aktuelle Orientierung erhalten", move:"Weiterkommen", moveText:"Machen Sie Ihre Ziele zur Realität" },
  zh: { search:"搜索", viewAll:"查看全部", showLess:"收起", countries:"国家", routes:"签证路线", guides:"指南", about:"关于", explore:"探索", exploreText:"找到适合您目标的路线", prepare:"准备", prepareText:"获取清晰、最新的指导", move:"向前迈进", moveText:"把您的目标变成现实" },
  ar: { search:"بحث", viewAll:"عرض الكل", showLess:"عرض أقل", countries:"الدول", routes:"مسارات التأشيرة", guides:"الأدلة", about:"حول", explore:"استكشف", exploreText:"اعثر على المسار المناسب لأهدافك", prepare:"استعد", prepareText:"احصل على إرشادات واضحة وحديثة", move:"تقدم", moveText:"حوّل طموحاتك إلى واقع" },
  pt: { search:"Pesquisar", viewAll:"Ver tudo", showLess:"Ver menos", countries:"Países", routes:"Rotas de visto", guides:"Guias", about:"Sobre", explore:"Explorar", exploreText:"Encontre a rota certa para os seus objetivos", prepare:"Preparar", prepareText:"Obtenha orientação clara e atualizada", move:"Avançar", moveText:"Transforme as suas ambições em realidade" },
  ja: { search:"検索", viewAll:"すべて表示", showLess:"折りたたむ", countries:"国", routes:"ビザルート", guides:"ガイド", about:"概要", explore:"探す", exploreText:"目標に合ったルートを見つける", prepare:"準備", prepareText:"明確で最新の案内を確認", move:"前へ進む", moveText:"目標を現実に変える" },
} as const;

export default function UkVisaRoutes() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const tx = getCatalogueText(language);
  const copy = uiCopy[language] || uiCopy.en;
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [translatedCatalogue, setTranslatedCatalogue] = useState<Record<string, string>>({});
  const [travelTarget, setTravelTarget] = useState<VisaRoute | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(group => ({ ...group, routes: group.routes.filter(route => `${route.name} ${route.description}`.toLowerCase().includes(q)) }))
      .filter(group => group.routes.length);
  }, [query]);

  const total = groups.reduce((sum, group) => sum + group.routes.length, 0);

  useEffect(() => {
    if (language === "en" || hasCompleteStaticUkCatalogue(language)) {
      setTranslatedCatalogue({});
      return;
    }
    const controller = new AbortController();
    const texts = Array.from(new Set([
      ...groups.flatMap(group => [group.title, group.description]),
      ...groups.flatMap(group => group.routes.flatMap(route => [route.name, route.description])),
    ]));
    void fetch(`/api/translate?lang=${encodeURIComponent(language)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
      signal: controller.signal,
    }).then(async res => {
      if (!res.ok) throw new Error("Translation request failed");
      const data = await res.json();
      const translations = Array.isArray(data.translations) ? data.translations : [];
      if (!controller.signal.aborted && translations.length === texts.length) {
        setTranslatedCatalogue(Object.fromEntries(texts.map((text, index) => [text, translations[index] || text])));
      }
    }).catch(() => {
      if (!controller.signal.aborted) setTranslatedCatalogue({});
    });
    return () => controller.abort();
  }, [language]);

  const t = (text: string) => getStaticUkCatalogueTranslation(language, text) || translatedCatalogue[text] || text;
  const scrollToRoutes = () => document.getElementById("visa-routes")?.scrollIntoView({ behavior: "smooth" });

  const openLiveRoute = (route: VisaRoute) => {
    if (route.status !== "live" || !route.href || travelTarget) return;
    setTravelTarget(route);
    sessionStorage.removeItem("navigating_from_global");
    window.setTimeout(() => setLocation(route.href!), 1500);
  };

  return (
    <div className="min-h-[100svh] bg-[#f7fbff] text-[#07183b] dark:bg-[#080b18] dark:text-white">
      <style>{`
        @keyframes visa-route-travel-zoom {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(30); opacity: 0; }
        }
        @keyframes visa-route-globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes visa-route-pulse-glow {
          0%, 100% { box-shadow: inset -20px -20px 40px rgba(0,0,0,.3), 0 0 15px rgba(0,94,184,.3), 0 0 60px rgba(0,94,184,.15); }
          50% { box-shadow: inset -20px -20px 40px rgba(0,0,0,.3), 0 0 30px rgba(0,94,184,.5), 0 0 60px rgba(0,94,184,.2); }
        }
        .visa-route-travel-globe {
          position: relative;
          border-radius: 999px;
          animation: visa-route-pulse-glow 4s ease-in-out infinite, visa-route-travel-zoom 1.5s ease-in forwards;
        }
        .visa-route-travel-earth {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 999px;
          animation: visa-route-globe-spin 60s linear infinite;
          transform-origin: 50% 50%;
        }
        .visa-route-travel-globe .visa-route-travel-earth {
          animation: none;
        }
        .visa-route-earth-shading {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow: inset 22px 0 30px rgba(0,0,0,.18), inset -22px 0 32px rgba(0,0,0,.28), inset 0 8px 16px rgba(255,255,255,.08);
        }
      `}</style>
      <CountryPublicNav code="uk" active="routes" />

      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-3 -ml-3 gap-2 text-slate-700 dark:text-slate-200" onClick={() => setLocation("/")}>
          <ArrowLeft className="h-4 w-4" /> {tx.allCountries}
        </Button>

        <section className="relative mb-7 overflow-hidden rounded-[30px] border border-blue-100 bg-[#dff2ff] shadow-[0_18px_55px_rgba(31,96,170,.10)] dark:border-white/10 dark:bg-[#11182b]">
          <div
            className="absolute inset-0 bg-no-repeat opacity-95 dark:opacity-45"
            style={{ backgroundImage: `url("${WESTMINSTER_IMAGE}")`, backgroundSize: "auto 88%", backgroundPosition: "right center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#eaf7ff] via-[#eaf7ff]/95 to-[#eaf7ff]/15 dark:from-[#10182b] dark:via-[#10182b]/95 dark:to-[#10182b]/20" />

          <div className="relative grid gap-4 p-4 md:p-5 lg:h-[290px] lg:grid-cols-[minmax(0,1.25fr)_300px] lg:p-5">
            <div className="flex max-w-3xl flex-col justify-center">
              <div className="mb-2 flex items-center gap-3">
                <img src="https://flagcdn.com/w160/gb.png" alt="United Kingdom" className="h-8 w-11 rounded-md object-cover shadow-sm" />
                <Badge className="rounded-full border border-emerald-300/70 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-none hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  United Kingdom · {tx.live}
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-[-0.035em] text-[#07183b] sm:text-4xl lg:text-[42px] dark:text-white">{tx.visaRoutes("UK")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-600 sm:text-base dark:text-slate-200">{tx.exploreUK}</p>
              <p className="mt-1.5 max-w-2xl text-xs leading-4 text-slate-500 dark:text-slate-300">{tx.checkedUK}</p>

              <div className="mt-3 flex max-w-3xl gap-2 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-lg shadow-blue-900/5 dark:border-white/10 dark:bg-[#11182b]/95">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") scrollToRoutes(); }}
                    placeholder={tx.searchRoutes(total, "UK")}
                    className="h-10 border-0 bg-transparent pl-11 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button onClick={scrollToRoutes} className="h-10 rounded-xl bg-[#086cf2] px-5 text-sm font-semibold hover:bg-[#075fd4]">
                  {copy.search} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="hidden self-center rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl shadow-blue-900/10 backdrop-blur md:block dark:border-white/10 dark:bg-[#10182b]/90">
              <div className="space-y-2.5">
                {[
                  [Compass, copy.explore, copy.exploreText],
                  [FileText, copy.prepare, copy.prepareText],
                  [BarChart3, copy.move, copy.moveText],
                ].map(([Icon, title, desc]) => {
                  const C = Icon as LucideIcon;
                  return <div key={String(title)} className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><C className="h-4 w-4" /></div>
                    <div><p className="text-sm font-bold text-[#07183b] dark:text-white">{String(title)}</p><p className="mt-0.5 text-xs leading-4 text-slate-500 dark:text-slate-300">{String(desc)}</p></div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </section>

        <div id="visa-routes" className="space-y-7 scroll-mt-24">
          {filtered.map(group => {
            const GroupIcon = group.icon;
            const expanded = Boolean(expandedGroups[group.title]);
            const routesToShow = query.trim() || expanded ? group.routes : group.routes.slice(0, 3);
            return (
              <section key={group.title}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-white/10">
                      <GroupIcon className="h-6 w-6 text-black dark:text-white" strokeWidth={2.3} />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t(group.title)}</h2>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t(group.description)}</p>
                    </div>
                  </div>
                  {!query.trim() && group.routes.length > 3 && (
                    <button
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [group.title]: !expanded }))}
                      className="hidden items-center gap-1.5 pb-1 text-sm font-semibold text-[#086cf2] transition hover:text-[#075fd4] sm:inline-flex"
                    >
                      {expanded ? copy.showLess : copy.viewAll} <ChevronRight className={`h-4 w-4 transition ${expanded ? "rotate-90" : ""}`} />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {routesToShow.map(route => {
                    const Icon = routeIcon[route.name] || BriefcaseBusiness;
                    const isLive = route.status === "live";
                    return (
                      <article
                        key={route.name}
                        className={`group relative flex min-h-[148px] items-stretch gap-4 rounded-2xl border bg-white p-4 shadow-[0_8px_30px_rgba(15,56,110,.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(15,56,110,.10)] dark:bg-white/[.035] ${
                          isLive ? "border-emerald-200 dark:border-emerald-500/30" : "border-blue-100 dark:border-white/10"
                        }`}
                      >
                        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isLive ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-blue-50 dark:bg-white/10"}`}>
                          <Icon className="h-8 w-8 text-black dark:text-white" strokeWidth={2.1} />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="pr-2 text-[17px] font-extrabold leading-5 text-[#07183b] dark:text-white">{t(route.name)}</h3>
                            {isLive
                              ? <Badge className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300">{tx.available}</Badge>
                              : <Badge className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-white shadow-sm hover:bg-red-500">{tx.comingSoon}</Badge>}
                          </div>

                          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{t(route.description)}</p>

                          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                            {route.officialUrl ? (
                              <a
                                href={route.officialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#086cf2] hover:underline"
                              >
                                {tx.official} <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            ) : <span />}
                            <button
                              aria-label={isLive ? tx.openAssistant : tx.comingSoon}
                              title={isLive ? tx.openAssistant : tx.comingSoon}
                              disabled={!isLive || Boolean(travelTarget)}
                              onClick={() => openLiveRoute(route)}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${isLive ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 animate-pulse hover:bg-emerald-600" : "cursor-not-allowed bg-slate-50 text-slate-400 opacity-70 dark:bg-white/10 dark:text-slate-500"}`}
                            >
                              <ArrowRight className={`h-4 w-4 ${isLive ? "transition-transform duration-500 group-hover:translate-x-1" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {!query.trim() && group.routes.length > 3 && (
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [group.title]: !expanded }))}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#086cf2] sm:hidden"
                  >
                    {expanded ? copy.showLess : copy.viewAll} <ChevronRight className={`h-4 w-4 transition ${expanded ? "rotate-90" : ""}`} />
                  </button>
                )}
              </section>
            );
          })}
        </div>

        {filtered.length === 0 && <div className="py-20 text-center text-slate-500">{tx.noRoutes(query, "UK")}</div>}
      </main>

      {travelTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-sky-100 dark:bg-[#0a0a1a]" aria-live="polite">
          <div className="h-48 w-48 rounded-full sm:h-56 sm:w-56 lg:h-64 lg:w-64">
            <div className="visa-route-travel-globe h-full w-full overflow-hidden">
              <img src={globeImage} alt="" className="visa-route-travel-earth" draggable={false} />
              <div className="visa-route-earth-shading" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
