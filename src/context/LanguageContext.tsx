"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Locale, type TranslationKeys } from "@/i18n/translations";

interface LanguageContextValue {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ko",
  t: translations.ko,
  setLocale: () => {},
});

function detectLocale(): Locale {
  // 1. Check localStorage preference
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("locale");
    if (saved === "ko" || saved === "en") return saved;

    // 2. Check browser language
    const lang = navigator.language || "";
    if (lang.startsWith("ko")) return "ko";
  }
  // 3. Default to English for non-Korean browsers
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
