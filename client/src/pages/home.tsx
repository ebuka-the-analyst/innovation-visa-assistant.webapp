import { useEffect } from "react";
import Header from "@/components/Header";
import NewsTicker from "@/components/NewsTicker";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PlatformPillars from "@/components/PlatformPillars";
import AIAgents from "@/components/AIAgents";
import AI2040Showcase from "@/components/AI2040Showcase";
import CompetitorFeatures from "@/components/CompetitorFeatures";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LawyerCTA from "@/components/LawyerCTA";
import FAQSection from "@/components/FAQSection";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, softwareApplicationSchema, visaFAQSchema, websiteSchema } from "@/lib/seo-schemas";
import { GlobalNavButton } from "@/components/global-nav-button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.getElementById("innovator-founder-home");
    if (!root || language === "en") return;

    const controller = new AbortController();
    let disposed = false;

    const shouldSkip = (element: Element | null) =>
      !element ||
      ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(element.tagName) ||
      Boolean(element.closest("[data-no-auto-translate]"));

    const translationCache = new Map<string, string>();

    const translateTexts = async (texts: string[]) => {
      const unique = Array.from(new Set(texts.map(text => text.trim()).filter(Boolean)));
      const translated = new Map<string, string>();

      const uncached = unique.filter(text => !translationCache.has(text));
      for (let i = 0; i < uncached.length; i += 60) {
        const chunk = uncached.slice(i, i + 60);
        try {
          const response = await fetch(`/api/translate?lang=${encodeURIComponent(language)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts: chunk }),
            signal: controller.signal,
          });
          if (!response.ok) continue;
          const data = await response.json();
          const translations = Array.isArray(data.translations) ? data.translations : [];
          chunk.forEach((source, index) => {
            translationCache.set(source, translations[index] || source);
          });
        } catch {
          if (controller.signal.aborted) break;
        }
      }

      unique.forEach(source => translated.set(source, translationCache.get(source) || source));
      return translated;
    };

    const translateContainer = async (container: Node) => {
      if (disposed) return;

      const textNodes: Text[] = [];
      const attributes: Array<{ element: HTMLElement; name: "placeholder" | "title" | "aria-label"; source: string }> = [];

      const collectElementAttributes = (element: HTMLElement) => {
        if (shouldSkip(element)) return;
        (["placeholder", "title", "aria-label"] as const).forEach(name => {
          const value = element.getAttribute(name);
          if (value?.trim()) attributes.push({ element, name, source: value.trim() });
        });
      };

      if (container.nodeType === Node.TEXT_NODE) {
        const text = container as Text;
        if (!shouldSkip(text.parentElement) && text.data.trim()) textNodes.push(text);
      } else if (container.nodeType === Node.ELEMENT_NODE) {
        const element = container as HTMLElement;
        if (shouldSkip(element)) return;
        collectElementAttributes(element);
        element.querySelectorAll<HTMLElement>("*").forEach(collectElementAttributes);

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = node as Text;
          if (!shouldSkip(text.parentElement) && text.data.trim()) textNodes.push(text);
        }
      }

      const sources = [
        ...textNodes.map(node => node.data.trim()),
        ...attributes.map(item => item.source),
      ];
      const translations = await translateTexts(sources);
      if (disposed || controller.signal.aborted) return;

      textNodes.forEach(node => {
        if (!node.isConnected) return;
        const source = node.data.trim();
        const translated = translations.get(source);
        if (!translated || translated === source) return;
        const leading = node.data.match(/^\s*/)?.[0] || "";
        const trailing = node.data.match(/\s*$/)?.[0] || "";
        node.data = `${leading}${translated}${trailing}`;
      });

      attributes.forEach(({ element, name, source }) => {
        if (!element.isConnected) return;
        const translated = translations.get(source);
        if (translated) element.setAttribute(name, translated);
      });
    };

    void translateContainer(root);

    const observer = new MutationObserver(mutations => {
      const added: Node[] = [];
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => added.push(node)));
      added.forEach(node => void translateContainer(node));
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
      controller.abort();
    };
  }, [language]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      softwareApplicationSchema,
      websiteSchema,
      visaFAQSchema
    ]
  };

  return (
    <div id="innovator-founder-home" key={language} className="min-h-screen">
      <GlobalNavButton />
      <SEOHead
        title="UK Innovator Founder Visa Assistant — Business Planning & Preparation Tools"
        description="AI-assisted business planning, eligibility preparation, document organisation and official GOV.UK update tracking for UK Innovator Founder applicants. The platform does not provide legal advice or guarantee endorsement or visa outcomes."
        canonical="https://innovatorfoundervisaassistant.co.uk/"
        keywords="UK Innovator Founder Visa, Innovator Founder Visa, UK business visa, visa for entrepreneurs UK, innovator founder visa requirements, UK visa application preparation, business plan for visa, endorsement preparation"
        schema={combinedSchema}
      />
      <Header />
      <NewsTicker />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <PlatformPillars />
        <AIAgents />
        <AI2040Showcase />
        <CompetitorFeatures />
        <StatsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <TestimonialsSection />
        <LawyerCTA />
        <div id="faq">
          <FAQSection />
        </div>
      </main>
      <Disclaimer />
      <Footer />
    </div>
  );
}
