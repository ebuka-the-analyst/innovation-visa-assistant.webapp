import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Compass, ExternalLink, Globe2, HelpCircle, Mail, Route, Search, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import CountryPublicNav from "@/components/CountryPublicNav";
import { Button } from "@/components/ui/button";
import { COUNTRY_CODES, COUNTRY_PUBLIC_DATA, isCountryCode, type CountryCode } from "@/lib/country-public-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/lib/global-destination-i18n";

export type CountryMenuSection = "countries" | "how-it-works" | "about" | "contact";

const sectionCopy = {
  en:{
    all:"All countries",current:"Current destination",choose:"Choose another destination",
    countriesTitle:(n:string)=>`Countries from your ${n} hub`,
    countriesBody:(n:string)=>`You are currently exploring ${n}. Switch destination at any time and continue with that country's own visa catalogue and country-specific pages.`,
    howTitle:(n:string)=>`How Visa Assistant works for ${n}`,
    howBody:(n:string)=>`Use the ${n} hub to discover routes, compare the route descriptions and move into dedicated preparation tools as they become available.`,
    aboutTitle:(n:string)=>`About the ${n} Visa Assistant hub`,
    contactTitle:(n:string)=>`Contact and support for ${n}`,
    contactBody:(n:string)=>`Use the on-page feedback and chat controls for Visa Assistant platform questions about the ${n} catalogue. For official immigration decisions or current legal requirements, use the official authority below.`,
    routes:"Browse visa routes",official:"Official immigration source",open:"Open country hub",
    step1:"Choose the destination",step1d:(n:string)=>`Start in the ${n} country hub so the catalogue, sources and preparation context stay country-specific.`,
    step2:"Choose a visa route",step2d:(n:string)=>`Browse the available ${n} routes by category and review the published route descriptions.`,
    step3:"Prepare when an assistant is live",step3d:"Live routes open a dedicated preparation assistant. Coming-soon routes remain browseable without pretending the tool is already available.",
    scope:"What this hub is for",scopeD:(n:string)=>`The ${n} hub organises route discovery and preparation around information relevant to ${n}. It is not a government service and does not make immigration decisions.`,
    source:"Source discipline",sourceD:(a:string)=>`Catalogue information is anchored to official material from ${a}. Requirements can change, so users should verify the latest official rules before applying.`,
    platform:"Platform boundary",platformD:"Visa Assistant provides preparation and organisation tools. It does not replace a regulated adviser, an official authority or a decision-maker.",
    support:"Visa Assistant support",supportD:"For product feedback, navigation issues or catalogue problems, use the feedback/chat controls already available on this page.",
    authority:"Official authority",authorityD:(a:string)=>`For immigration rules, applications and official decisions, use ${a}.`
  },
  ja:{
    all:"すべての国",current:"現在の目的地",choose:"別の目的地を選択",
    countriesTitle:(n:string)=>`${n}ハブから国を選ぶ`,
    countriesBody:(n:string)=>`現在は${n}を閲覧しています。いつでも別の目的地に切り替え、その国専用のビザ一覧と案内ページを利用できます。`,
    howTitle:(n:string)=>`${n}でのVisa Assistantの使い方`,
    howBody:(n:string)=>`${n}ハブでルートを探し、説明を比較し、利用可能になった専用準備ツールへ進めます。`,
    aboutTitle:(n:string)=>`${n} Visa Assistantハブについて`,
    contactTitle:(n:string)=>`${n}の連絡先とサポート`,
    contactBody:(n:string)=>`${n}カタログに関するVisa Assistantの質問はページ上のフィードバック／チャットをご利用ください。公式要件や判断については下記の公的機関を確認してください。`,
    routes:"ビザルートを見る",official:"公式移民情報",open:"国別ハブを開く",
    step1:"目的地を選ぶ",step1d:(n:string)=>`${n}の国別ハブから開始し、カタログ・情報源・準備内容を国別に保ちます。`,
    step2:"ビザルートを選ぶ",step2d:(n:string)=>`${n}の利用可能なルートをカテゴリ別に閲覧し、公表された説明を確認します。`,
    step3:"アシスタントが公開されたら準備",step3d:"公開済みルートは専用準備アシスタントを開きます。準備中のルートも閲覧できます。",
    scope:"このハブの目的",scopeD:(n:string)=>`${n}に関連するルート検索と準備情報を整理します。政府サービスではなく、移民判断は行いません。`,
    source:"情報源",sourceD:(a:string)=>`カタログは${a}の公式情報を基礎にしています。要件は変更されるため、申請前に最新の公式規則を確認してください。`,
    platform:"プラットフォームの範囲",platformD:"Visa Assistantは準備と整理を支援します。規制対象の専門家、公的機関、意思決定者の代わりではありません。",
    support:"Visa Assistantサポート",supportD:"製品のフィードバック、ナビゲーション、カタログの問題は、このページのフィードバック／チャット機能をご利用ください。",
    authority:"公的機関",authorityD:(a:string)=>`移民規則、申請、公式判断については${a}をご利用ください。`
  }
} as const;

export default function CountryMenuPage({code,section}:{code:string;section:CountryMenuSection}) {
  const [,setLocation]=useLocation();
  const {language}=useLanguage();
  if(!isCountryCode(code)) return null;
  const country=COUNTRY_PUBLIC_DATA[code];
  const copy=(sectionCopy as any)[language]||sectionCopy.en;
  const displayName=localizeCountryName(language,code,country.name);

  const title =
    section==="countries" ? copy.countriesTitle(displayName) :
    section==="how-it-works" ? copy.howTitle(displayName) :
    section==="about" ? copy.aboutTitle(displayName) :
    copy.contactTitle(displayName);

  const body =
    section==="countries" ? copy.countriesBody(displayName) :
    section==="how-it-works" ? copy.howBody(displayName) :
    section==="about" ? country.summary :
    copy.contactBody(displayName);

  return <div className="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900 dark:from-[#090b18] dark:via-[#0b1020] dark:to-[#090b18] dark:text-white">
    <CountryPublicNav code={code as CountryCode} active={section}/>
    <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-4 -ml-3 gap-2" onClick={()=>setLocation(`/${code}`)}><ArrowLeft className="h-4 w-4"/>{displayName}</Button>

      <section className="relative overflow-hidden rounded-[30px] border border-blue-100 shadow-[0_18px_55px_rgba(31,96,170,.10)] dark:border-white/10">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`url("${country.heroImage}")`}}/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07172f]/96 via-[#0b1933]/90 to-[#0b1933]/45"/>
        <div className="relative max-w-4xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mb-5 flex items-center gap-3">
            <img src={`https://flagcdn.com/w160/${country.flag}.png`} alt={country.name} className="h-9 w-12 rounded-md object-cover shadow"/>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur">{displayName}</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-100">{body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#086cf2] hover:bg-[#075fd4]" onClick={()=>setLocation(`/${code}`)}>{copy.routes}<ArrowRight className="ml-2 h-4 w-4"/></Button>
            <a href={country.officialUrl} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">{copy.official}<ExternalLink className="ml-2 h-4 w-4"/></Button></a>
          </div>
        </div>
      </section>

      {section==="countries"&&<section className="mt-8">
        <div className="mb-4"><p className="text-sm font-semibold uppercase tracking-[.16em] text-[#086cf2]">{copy.current}</p><h2 className="mt-1 text-2xl font-black">{copy.choose}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COUNTRY_CODES.map(item=>{
            const d=COUNTRY_PUBLIC_DATA[item];
            const name=localizeCountryName(language,item,d.name);
            const selected=item===code;
            return <button key={item} onClick={()=>setLocation(`/${item}/countries`)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected?"border-[#086cf2] bg-blue-50 ring-2 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/10":"border-blue-100 bg-white dark:border-white/10 dark:bg-white/[.035]"}`}>
              <img src={`https://flagcdn.com/w160/${d.flag}.png`} alt="" className="h-8 w-11 rounded-md object-cover"/>
              <div className="min-w-0"><p className="truncate font-bold">{name}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selected?copy.current:copy.open}</p></div>
            </button>;
          })}
        </div>
      </section>}

      {section==="how-it-works"&&<section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [Compass,copy.step1,copy.step1d(displayName)],
          [Search,copy.step2,copy.step2d(displayName)],
          [CheckCircle2,copy.step3,copy.step3d],
        ].map(([Icon,title,desc])=>{const C=Icon as typeof Compass;return <article key={String(title)} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><C className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(desc)}</p></article>})}
      </section>}

      {section==="about"&&<section className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          [Globe2,copy.scope,copy.scopeD(displayName)],
          [ShieldCheck,copy.source,copy.sourceD(country.authority)],
          [Route,copy.platform,copy.platformD],
        ].map(([Icon,title,desc])=>{const C=Icon as typeof Globe2;return <article key={String(title)} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><C className="h-6 w-6 text-[#086cf2]"/><h2 className="mt-4 text-xl font-black">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(desc)}</p></article>})}
      </section>}

      {section==="contact"&&<section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><HelpCircle className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{copy.support}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.supportD}</p></article>
        <article className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/[.035]"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#086cf2] dark:bg-blue-500/10"><Building2 className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-black">{copy.authority}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.authorityD(country.authority)}</p><a href={country.officialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#086cf2] hover:underline">{country.authority}<ExternalLink className="h-4 w-4"/></a></article>
      </section>}
    </main>
  </div>;
}
