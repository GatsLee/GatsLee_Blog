"use client";

import { useState, useEffect } from "react";
import { Globe, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Prevent SSR issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 border-b border-border bg-background flex items-center justify-between px-6 md:px-12 shrink-0 z-20 transition-colors duration-300">
      <div className="flex items-center min-w-0 flex-1">
        <h1 className="text-sm md:text-base text-foreground font-medium tracking-tight">
          {t("header.objective")}
        </h1>
      </div>

      <div className="flex items-center gap-4">
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

        {/* Language Toggle */}
        <button
          onClick={() => setLocale(locale === "en" ? "ko" : "en")}
          className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors cursor-pointer shrink-0"
          aria-label="Switch language"
        >
          <Globe size={16} strokeWidth={1.5} />
          <span className="font-medium">
            <span className={locale === "ko" ? "text-accent" : ""}>KR</span>
            <span className="mx-1 text-border">/</span>
            <span className={locale === "en" ? "text-accent" : ""}>EN</span>
          </span>
        </button>
      </div>
    </header>
  );
}
