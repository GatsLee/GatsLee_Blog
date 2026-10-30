"use client";

import { createContext, useContext, useState } from "react";
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 헤더에서 언어 전환을 뺐으므로(D3) 브라우저 언어나 예전 저장값과 상관없이 한국어로 시작한다
  const [locale, setLocaleState] = useState<Locale>("ko");

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
