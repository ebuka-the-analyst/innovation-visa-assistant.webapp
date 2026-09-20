import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInnovatorFounderStaticTranslation } from "@/lib/innovator-founder-static-i18n";
import { INNOVATOR_FOUNDER_BASE_PATH, isInnovatorFounderPath } from "@/lib/innovator-founder-routes";
import { isKnownUiString } from "@/lib/generated-ui-string-allowlist";

const GLOBAL_HOSTS = new Set(["visaassistant.global", "www.visaassistant.global"]);

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);

function scopedSuffix(location: string): string | null {
  if (isInnovatorFounderPath(location)) {
    const suffix = location.slice(INNOVATOR_FOUNDER_BASE_PATH.length);
    return suffix || "";
  }

  // The dedicated Innovator Founder domain can still serve legacy unprefixed
  // routes. Do not apply this translator to visaassistant.global discovery pages.
  if (typeof window !== "undefined" && !GLOBAL_HOSTS.has(window.location.hostname.toLowerCase())) {
    return location;
  }

  return null;
}

type TextRecord = { node: Text; source: string; translated: string };
type AttributeRecord = {
  element: HTMLElement;
  name: "placeholder" | "title" | "aria-label";
  source: string;
  translated: string;
};

export default function InnovatorFounderTranslationLayer() {
  const { language } = useLanguage();
  const [location] = useLocation();

  useEffect(() => {
    const suffix = scopedSuffix(location);
    if (suffix === null || language === "en" || typeof document === "undefined") return;

    const controller = new AbortController();
    let disposed = false;
    let applying = false;
    const textRecords: TextRecord[] = [];
    const attributeRecords: AttributeRecord[] = [];

    const cacheKey = `visaassistant:innovator-founder-ui:${language}:v2`;
    let persistentCache: Record<string, string> = {};
    try {
      const raw = window.localStorage.getItem(cacheKey);
      persistentCache = raw ? JSON.parse(raw) : {};
    } catch {
      persistentCache = {};
    }

    const memoryCache = new Map<string, string>(Object.entries(persistentCache));
    const allowNetworkFallback = true;

    const shouldSkip = (element: Element | null) =>
      !element ||
      SKIP_TAGS.has(element.tagName) ||
      Boolean(
        element.closest(
          "[data-no-auto-translate],[data-user-content],[data-generated-content],[contenteditable='true']",
        ),
      );

    const persist = () => {
      try {
        const entries = Array.from(memoryCache.entries());
        // Keep the newest practical working set bounded so localStorage cannot
        // grow without limit on long-lived accounts.
        const bounded = entries.slice(Math.max(0, entries.length - 5000));
        window.localStorage.setItem(cacheKey, JSON.stringify(Object.fromEntries(bounded)));
      } catch {
        // Translation remains functional when storage is unavailable.
      }
    };

    const translateTexts = async (sources: string[]) => {
      const unique = Array.from(
        new Set(
          sources
            .map(value => value.trim())
            .filter(value => value && value.length <= 1200),
        ),
      );

      for (const source of unique) {
        const staticValue = getInnovatorFounderStaticTranslation(language, source);
        if (staticValue !== source) memoryCache.set(source, staticValue);
      }

      if (allowNetworkFallback) {
        const missing = unique.filter(source => !memoryCache.has(source) && isKnownUiString(source));

        for (let i = 0; i < missing.length; i += 50) {
          if (disposed || controller.signal.aborted) break;
          const chunk = missing.slice(i, i + 50);

          try {
            const response = await fetch(
              `/api/translate?lang=${encodeURIComponent(language)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: chunk }),
                signal: controller.signal,
              },
            );

            if (!response.ok) continue;
            const payload = await response.json();
            const values = Array.isArray(payload.translations) ? payload.translations : [];
            if (values.length !== chunk.length) continue;

            chunk.forEach((source, index) => {
              const value = String(values[index] || "").trim();
              if (value && value !== source) memoryCache.set(source, value);
            });
            persist();
          } catch {
            if (controller.signal.aborted) break;
          }
        }
      }

      return new Map(unique.map(source => [source, memoryCache.get(source) || source]));
    };

    const translateContainer = async (container: Node) => {
      if (disposed || applying) return;

      const textNodes: Text[] = [];
      const attributes: Array<{
        element: HTMLElement;
        name: "placeholder" | "title" | "aria-label";
        source: string;
      }> = [];

      const collectAttributes = (element: HTMLElement) => {
        if (shouldSkip(element)) return;
        (["placeholder", "title", "aria-label"] as const).forEach(name => {
          const value = element.getAttribute(name)?.trim();
          if (value) attributes.push({ element, name, source: value });
        });
      };

      if (container.nodeType === Node.TEXT_NODE) {
        const node = container as Text;
        if (!shouldSkip(node.parentElement) && node.data.trim()) textNodes.push(node);
      } else if (container.nodeType === Node.ELEMENT_NODE) {
        const element = container as HTMLElement;
        if (shouldSkip(element)) return;
        collectAttributes(element);
        element.querySelectorAll<HTMLElement>("*").forEach(collectAttributes);

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let current: Node | null;
        while ((current = walker.nextNode())) {
          const node = current as Text;
          if (!shouldSkip(node.parentElement) && node.data.trim()) textNodes.push(node);
        }
      }

      const sources = [
        ...textNodes.map(node => node.data.trim()),
        ...attributes.map(item => item.source),
      ];
      if (!sources.length) return;

      const translations = await translateTexts(sources);
      if (disposed || controller.signal.aborted) return;

      applying = true;
      try {
        textNodes.forEach(node => {
          if (!node.isConnected) return;
          const source = node.data.trim();
          const translated = translations.get(source);
          if (!translated || translated === source) return;
          const leading = node.data.match(/^\s*/)?.[0] || "";
          const trailing = node.data.match(/\s*$/)?.[0] || "";
          node.data = `${leading}${translated}${trailing}`;
          textRecords.push({ node, source, translated });
        });

        attributes.forEach(({ element, name, source }) => {
          if (!element.isConnected) return;
          const translated = translations.get(source);
          if (!translated || translated === source) return;
          element.setAttribute(name, translated);
          attributeRecords.push({ element, name, source, translated });
        });
      } finally {
        applying = false;
      }
    };

    void translateContainer(document.body);

    const observer = new MutationObserver(mutations => {
      if (disposed || applying) return;
      const targets: Node[] = [];
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          targets.push(mutation.target);
          continue;
        }
        mutation.addedNodes.forEach(node => targets.push(node));
      }
      targets.forEach(node => void translateContainer(node));
    });

    // React often reuses an existing text node and changes only its character
    // data when async catalogue/pricing data arrives or when a user switches a
    // carousel/tab. Watching characterData keeps those deeper dynamic surfaces
    // in the selected language as well.
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
      controller.abort();

      // Restore English source copy before another language effect starts.
      // Only restore nodes that still contain the translation we applied, so
      // React/user updates made afterwards are never overwritten.
      for (const record of textRecords) {
        if (!record.node.isConnected) continue;
        if (record.node.data.trim() !== record.translated) continue;
        const leading = record.node.data.match(/^\s*/)?.[0] || "";
        const trailing = record.node.data.match(/\s*$/)?.[0] || "";
        record.node.data = `${leading}${record.source}${trailing}`;
      }

      for (const record of attributeRecords) {
        if (!record.element.isConnected) continue;
        if (record.element.getAttribute(record.name)?.trim() !== record.translated) continue;
        record.element.setAttribute(record.name, record.source);
      }
    };
  }, [language, location]);

  return null;
}
