import { useLocation } from "wouter";
import VisaAssistantBrand from "@/components/VisaAssistantBrand";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCatalogueText } from "@/lib/catalogue-i18n";
import type { CountryCode } from "@/lib/country-public-data";

type ActiveMenu = "countries" | "routes" | "how-it-works" | "about" | "contact";

const menuCopy = {
  en:{countries:"Countries",routes:"Visa Routes",how:"How it works",about:"About",contact:"Contact"},
  es:{countries:"Países",routes:"Rutas de visado",how:"Cómo funciona",about:"Acerca de",contact:"Contacto"},
  fr:{countries:"Pays",routes:"Voies de visa",how:"Comment ça marche",about:"À propos",contact:"Contact"},
  de:{countries:"Länder",routes:"Visumrouten",how:"So funktioniert es",about:"Über uns",contact:"Kontakt"},
  zh:{countries:"国家",routes:"签证路线",how:"使用方式",about:"关于",contact:"联系"},
  ar:{countries:"الدول",routes:"مسارات التأشيرة",how:"كيف يعمل",about:"حول",contact:"اتصل بنا"},
  pt:{countries:"Países",routes:"Rotas de visto",how:"Como funciona",about:"Sobre",contact:"Contacto"},
  ja:{countries:"国",routes:"ビザルート",how:"利用方法",about:"概要",contact:"お問い合わせ"},
} as const;

export default function CountryPublicNav({code,active}:{code:CountryCode;active:ActiveMenu}) {
  const [,setLocation]=useLocation();
  const {language}=useLanguage();
  const tx=getCatalogueText(language);
  const copy=menuCopy[language]||menuCopy.en;
  const items=[
    {id:"countries" as const,label:copy.countries,href:`/${code}/countries`},
    {id:"routes" as const,label:copy.routes,href:`/${code}`},
    {id:"how-it-works" as const,label:copy.how,href:`/${code}/how-it-works`},
    {id:"about" as const,label:copy.about,href:`/${code}/about`},
    {id:"contact" as const,label:copy.contact,href:`/${code}/contact`},
  ];

  return <header className="sticky top-0 z-40 border-b border-blue-100/70 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0e1d]/95">
    <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
      <VisaAssistantBrand compact logoHref="/" />
      <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex dark:text-slate-200" aria-label="Country navigation">
        {items.map(item=><button
          key={item.id}
          onClick={()=>setLocation(item.href)}
          className={`relative py-2 transition hover:text-blue-600 ${active===item.id?"text-[#086cf2] dark:text-[#41B6E6]":""}`}
        >
          {item.label}
          {active===item.id&&<span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#086cf2]"/>}
        </button>)}
      </nav>
      <div className="flex items-center gap-1.5">
        <LanguageSelector/>
        <ThemeToggle/>
        <Button className="rounded-xl bg-[#086cf2] px-5 shadow-sm hover:bg-[#075fd4]" onClick={()=>setLocation("/login")}>{tx.signIn}</Button>
      </div>
    </div>
  </header>;
}
