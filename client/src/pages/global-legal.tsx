import { Link, useLocation } from "wouter";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import VisaAssistantBrand from "@/components/VisaAssistantBrand";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

type LegalKind = "privacy" | "terms";

const copy = {
  en: {
    back: "Back to Visa Assistant Global",
    privacyTitle: "Privacy & Data Protection",
    privacyIntro: "This page explains how Visa Assistant Global handles information when you browse country hubs, use platform features or interact with the service.",
    termsTitle: "Terms of Use",
    termsIntro: "These terms explain the basis on which Visa Assistant Global provides country discovery, route information and AI-assisted preparation features.",
    updated: "Last updated: 19 September 2026",
    privacySections: [
      ["Information we process", "We may process account details you provide, technical information needed to operate the service, messages or form content you choose to submit, and usage information used to maintain and improve the platform."],
      ["How information is used", "Information is used to provide requested platform functionality, maintain security, support users, improve reliability and operate features such as saved account workflows where available."],
      ["Country and route context", "Visa Assistant Global uses the country and page you are viewing to keep route discovery and AI-assisted guidance relevant to that destination. Country context does not itself determine an immigration outcome."],
      ["AI-assisted features", "Content submitted to AI-assisted features may be processed to generate the response or output you request. AI-generated material can contain errors and should be reviewed before use."],
      ["Your choices", "You can choose whether to create an account, which information to submit and which country or route tools to use. Where account controls are available, use them to review or update your information."],
      ["Platform boundary", "Visa Assistant Global is not a government immigration service and does not make visa, residence or endorsement decisions. Current requirements should be verified with the relevant official authority."],
    ],
    termsSections: [
      ["Using the platform", "Visa Assistant Global provides country discovery, route catalogues and AI-assisted preparation features. You are responsible for checking whether information is current and appropriate for your circumstances."],
      ["No immigration decision", "The platform does not make immigration, visa, residence or endorsement decisions and does not guarantee any outcome."],
      ["Official information", "Immigration rules, fees, eligibility criteria and processing arrangements can change. Time-sensitive requirements should be verified with the relevant official government or immigration authority."],
      ["AI-generated content", "AI-assisted outputs are preparation material for human review. They may be incomplete or inaccurate and should not be treated as regulated immigration or legal advice."],
      ["Acceptable use", "Do not misuse the service, interfere with its operation, attempt unauthorised access, upload harmful material or use the platform for unlawful activity."],
      ["Country-specific tools", "Some country routes are available for browsing before dedicated preparation tools launch. A route shown in the catalogue does not mean a dedicated assistant is already available."],
    ],
    privacy: "Privacy",
    terms: "Terms",
  },
  ja: { back:"Visa Assistant Globalに戻る", privacyTitle:"プライバシーとデータ保護", privacyIntro:"Visa Assistant Globalで国別ハブや機能を利用する際の情報の取扱いについて説明します。", termsTitle:"利用規約", termsIntro:"Visa Assistant Globalの国別検索、ルート情報、AI支援機能の利用条件です。", updated:"最終更新：2026年9月19日", privacy:"プライバシー", terms:"利用規約" },
  zh: { back:"返回 Visa Assistant Global", privacyTitle:"隐私与数据保护", privacyIntro:"本页面说明您浏览国家页面、使用平台功能或与服务互动时，Visa Assistant Global 如何处理信息。", termsTitle:"使用条款", termsIntro:"本条款说明 Visa Assistant Global 提供国家探索、签证路线信息和 AI 辅助准备功能的使用基础。", updated:"最后更新：2026年9月19日", privacy:"隐私", terms:"条款" },
} as const;

function fallbackSections(kind: LegalKind) {
  return kind === "privacy" ? copy.en.privacySections : copy.en.termsSections;
}

export function GlobalLegalPage({ kind }: { kind: LegalKind }) {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const lang = (copy as any)[language] || copy.en;
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? lang.privacyTitle : lang.termsTitle;
  const intro = isPrivacy ? lang.privacyIntro : lang.termsIntro;
  const sections = lang[isPrivacy ? "privacySections" : "termsSections"] || fallbackSections(kind);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 text-slate-900 dark:from-[#090b18] dark:via-[#0b1020] dark:to-[#090b18] dark:text-white">
      <SEOHead
        title={`${title} | Visa Assistant Global`}
        description={intro}
        canonical={`https://visaassistant.global/${kind}`}
      />

      <header className="sticky top-0 z-40 border-b border-blue-100/70 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0e1d]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <VisaAssistantBrand compact logoHref="/" />
          <div className="flex items-center gap-1.5">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="outline" className="rounded-xl" onClick={() => setLocation("/login")}>Sign In</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#086cf2] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {lang.back}
        </Link>

        <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_18px_55px_rgba(31,96,170,.10)] dark:border-white/10 dark:bg-white/[.035]">
          <div className="border-b border-blue-100 bg-gradient-to-r from-[#07172f] to-[#0d3763] px-6 py-9 text-white dark:border-white/10 sm:px-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              {isPrivacy ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">{intro}</p>
            <p className="mt-3 text-xs text-slate-300">{lang.updated}</p>
          </div>

          <div className="grid gap-4 p-5 sm:p-7">
            {sections.map(([heading, body]: [string, string], index: number) => (
              <Card key={heading} className="border-blue-100 p-5 shadow-none dark:border-white/10 dark:bg-white/[.025]">
                <h2 className="text-lg font-bold">{index + 1}. {heading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-100 bg-white/70 px-4 py-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-2">
          <Link href="/">{new Date().getFullYear()} Visa Assistant Global</Link>
          <Link href="/privacy" className={isPrivacy ? "font-bold text-[#086cf2]" : "hover:text-[#086cf2]"}>{lang.privacy}</Link>
          <Link href="/terms" className={!isPrivacy ? "font-bold text-[#086cf2]" : "hover:text-[#086cf2]"}>{lang.terms}</Link>
        </div>
      </footer>
    </div>
  );
}

export function GlobalPrivacyPage() {
  return <GlobalLegalPage kind="privacy" />;
}

export function GlobalTermsPage() {
  return <GlobalLegalPage kind="terms" />;
}
