import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, BriefcaseBusiness, ChevronRight, ExternalLink, GraduationCap, Heart, Lock, Search, Sparkles, Users, Plane, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import VisaAssistantBrand from "@/components/VisaAssistantBrand";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCatalogueText } from "@/lib/catalogue-i18n";
import { getStaticUkCatalogueTranslation, hasCompleteStaticUkCatalogue } from "@/lib/uk-catalogue-static-translations";

const INNOVATOR_FOUNDER_PATH = "/uk/innovatorfoundervisaassistant";

type VisaRoute = { name: string; description: string; status?: "live"; href?: string; officialUrl?: string };
type RouteGroup = { title: string; description: string; icon: typeof BriefcaseBusiness; routes: VisaRoute[] };

const groups: RouteGroup[] = [
  {
    title: "Business & Talent",
    description: "Routes for founders, recognised talent and high-potential professionals.",
    icon: Sparkles,
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

export default function UkVisaRoutes() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const tx = getCatalogueText(language);
  const [query, setQuery] = useState("");
  const [translatedCatalogue, setTranslatedCatalogue] = useState<Record<string, string>>({});
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.map(group => ({ ...group, routes: group.routes.filter(route => `${route.name} ${route.description}`.toLowerCase().includes(q)) })).filter(group => group.routes.length);
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



  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900 dark:from-[#090b18] dark:via-[#0b1020] dark:to-[#090b18] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#090b18]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <VisaAssistantBrand compact />
          <div className="flex items-center gap-1.5"><LanguageSelector /><ThemeToggle /><Button variant="outline" size="sm" onClick={() => setLocation("/login")}>{tx.signIn}</Button></div>
        </div>
      </header>

      <main id="uk-catalogue-main" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-4 -ml-3 gap-2" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4" />{tx.allCountries}</Button>
        <section className="mb-8 rounded-3xl border border-blue-100 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[.04] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-3"><img src="https://flagcdn.com/w160/gb.png" alt="United Kingdom" className="h-10 w-14 rounded-md object-cover shadow" /><Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">United Kingdom · {tx.live}</Badge></div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tx.visaRoutes("UK")}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{tx.exploreUK}</p>
              <p className="mt-2 text-xs text-slate-500">{tx.checkedUK}</p>
            </div>
            <div className="w-full lg:max-w-sm"><div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder={tx.searchRoutes(total, "UK")} className="h-12 rounded-2xl pl-12" /></div></div>
          </div>
        </section>

        <div className="space-y-8">
          {filtered.map(group => {
            const Icon = group.icon;
            return <section key={group.title}>
              <div className="mb-3 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2 text-[#005EB8] dark:bg-blue-500/10"><Icon className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold">{getStaticUkCatalogueTranslation(language, group.title) || translatedCatalogue[group.title] || group.title}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{getStaticUkCatalogueTranslation(language, group.description) || translatedCatalogue[group.description] || group.description}</p></div></div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.routes.map(route => <Card key={route.name} className={`flex min-h-40 flex-col justify-between rounded-2xl p-5 transition ${route.status === "live" ? "border-emerald-400/70 bg-emerald-50/50 shadow-sm dark:bg-emerald-500/5" : "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/[.03]"}`}>
                  <div><div className="mb-2 flex items-start justify-between gap-3"><h3 className="font-semibold leading-5">{getStaticUkCatalogueTranslation(language, route.name) || translatedCatalogue[route.name] || route.name}</h3>{route.status === "live" ? <Badge className="bg-emerald-600 text-white">{tx.available}</Badge> : <Badge variant="secondary" className="gap-1 whitespace-nowrap"><Lock className="h-3 w-3" />{tx.comingSoon}</Badge>}</div><p className="text-sm leading-5 text-slate-600 dark:text-slate-400">{getStaticUkCatalogueTranslation(language, route.description) || translatedCatalogue[route.description] || route.description}</p></div>
                  <div className="mt-5 flex items-center justify-between gap-2">{route.status === "live" && route.href ? <Button className="gap-1.5 bg-[#005EB8]" onClick={() => setLocation(route.href!)}>{tx.openAssistant} <ChevronRight className="h-4 w-4" /></Button> : <span className="text-xs text-slate-400">{tx.assistantDevelopment}</span>}{route.officialUrl && <a href={route.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#005EB8] hover:underline">{tx.official} <ExternalLink className="h-3 w-3" /></a>}</div>
                </Card>)}
              </div>
            </section>;
          })}
        </div>
        {filtered.length === 0 && <div className="py-20 text-center text-slate-500">{tx.noRoutes(query, "UK")}</div>}
      </main>
    </div>
  );
}
