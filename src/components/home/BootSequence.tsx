"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

const bootLineKeys: { textKey: TranslationKey; status?: string; color: string }[] = [
  { textKey: "boot.init", color: "text-[#5a5a72]" },
  { textKey: "boot.modules", status: "DONE", color: "text-[#8888a0]" },
  { textKey: "boot.mount", status: "MOUNTED", color: "text-[#8888a0]" },
  { textKey: "boot.ui", status: "READY", color: "text-[#8888a0]" },
];

export default function BootSequence({
  children,
}: {
  children: React.ReactNode;
}) {
  const [booted, setBooted] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("booted")) {
      setBooted(true);
      return;
    }

    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= bootLineKeys.length) {
          clearInterval(interval);
          setTimeout(() => {
            setBooted(true);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("booted", "1");
            }
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  if (booted) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] bg-[#1a1a2e] text-[#d4d4dc] font-mono flex flex-col justify-end pb-20">
      <div className="space-y-1 animate-pulse">
        {bootLineKeys.slice(0, visibleLines).map((line, i) => (
          <p key={i} className={line.color}>
            {t(line.textKey)}{" "}
            {line.status && (
              <span className="text-[#d4a054]">{line.status}</span>
            )}
          </p>
        ))}
        {visibleLines >= bootLineKeys.length && (
          <>
            <br />
            <p className="text-[#d4d4dc] text-lg font-bold">
              {t("boot.welcome")}
            </p>
            <span className="inline-block w-3 h-5 bg-[#d4a054] animate-bounce ml-1" />
          </>
        )}
      </div>
    </div>
  );
}
