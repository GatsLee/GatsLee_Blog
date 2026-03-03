"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import TypingObjective from "./TypingObjective";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-background flex items-center justify-between px-6 md:px-12 shrink-0 z-20 transition-colors duration-300">
      <div className="flex items-center min-w-0 flex-1 pl-12 md:pl-0">
        {/* Desktop version - full text */}
        <div className="hidden sm:flex items-baseline gap-2">
          <h2 className="text-lg md:text-xl text-foreground font-semibold tracking-tight whitespace-nowrap">
            {t.header.currentObjective}
          </h2>
          <div className="text-sm md:text-base text-foreground font-medium tracking-tight">
            <TypingObjective text={t.header.objectiveText} />
          </div>
        </div>

        {/* Mobile version - shortened */}
        <div className="flex sm:hidden items-baseline gap-2">
          <h2 className="text-base text-foreground font-semibold tracking-tight whitespace-nowrap">
            {t.header.currentObjective}
          </h2>
          <div className="text-sm text-foreground font-medium tracking-tight">
            <TypingObjective text={t.header.objectiveTextShort} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        {mounted && (
          <button
            onClick={() => setLocale(locale === "en" ? "ko" : "en")}
            className="flex items-center justify-center w-9 h-9 rounded text-muted hover:text-accent hover:bg-hover transition-all cursor-pointer font-semibold text-sm"
            aria-label={locale === "en" ? "Switch to Korean" : "Switch to English"}
            title={locale === "en" ? "Switch to Korean" : "Switch to English"}
          >
            {locale === "en" ? "E" : "한"}
          </button>
        )}

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded text-muted hover:text-accent hover:bg-hover transition-all cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={18} strokeWidth={1.5} />
            ) : (
              <Sun size={18} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
