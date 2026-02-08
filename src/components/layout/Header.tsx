"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TypingObjective from "./TypingObjective";

export default function Header() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="h-16 border-b border-[#2e2e4a] bg-[#1a1a2e]/95 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-20 gap-3">
      <div className="flex items-center min-w-0 flex-1 ml-8 sm:ml-0">
        <div className="text-xs sm:text-sm text-[#8888a0] font-mono truncate">
          <TypingObjective text={t("header.objective")} />
        </div>
      </div>

      <button
        onClick={() => setLocale(locale === "en" ? "ko" : "en")}
        className="flex items-center gap-1 sm:gap-2 text-xs text-[#5a5a72] hover:text-[#d4a054] transition-colors cursor-pointer font-mono shrink-0"
      >
        <Globe size={14} />
        <span>
          <span className={locale === "ko" ? "text-[#d4a054]" : ""}>KR</span>
          {" / "}
          <span className={locale === "en" ? "text-[#d4a054]" : ""}>EN</span>
        </span>
      </button>
    </header>
  );
}
