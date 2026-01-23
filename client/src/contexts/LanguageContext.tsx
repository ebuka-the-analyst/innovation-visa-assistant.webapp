import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LanguageCode, Translations, getTranslation } from "@/lib/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "visa_assistant_language";

const RTL_LANGUAGES: LanguageCode[] = ["ar"];

function applyLanguageSettings(lang: LanguageCode) {
  // Set HTML dir attribute for RTL/LTR
  document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  // Set HTML lang attribute
  document.documentElement.lang = lang;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && ["en", "es", "fr", "de", "zh", "ar", "pt", "ja"].includes(stored)) {
        return stored as LanguageCode;
      }
    }
    return "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    applyLanguageSettings(lang);
  };

  useEffect(() => {
    // Apply language settings on initial load
    applyLanguageSettings(language);
  }, [language]);

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
