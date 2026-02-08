"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import ServerStatusBar from "@/components/home/ServerStatusBar";
import ArchitectureDiagram from "@/components/home/ArchitectureDiagram";
import type { TranslationKey } from "@/lib/i18n";

interface StatusItem {
  label: string;
  value: string;
}

interface StatusGroup {
  labelKey: TranslationKey;
  items: StatusItem[];
}

interface HomeContentProps {
  statusGroups: StatusGroup[];
}

export default function HomeContent({ statusGroups }: HomeContentProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
      {/* Server Status Bar */}
      <ServerStatusBar groups={statusGroups} />

      {/* Architecture Diagram */}
      <ArchitectureDiagram />

      {/* Introduction */}
      <div className="border border-[#2e2e4a] bg-[#22223a]/50 rounded-lg p-6 md:p-8">
        <p className="text-[10px] text-[#5a5a72] font-mono uppercase tracking-widest mb-4">
          {t("home.readme")}
        </p>
        <p className="text-[#b0b0bc] leading-relaxed text-sm md:text-base">
          {t("home.intro")}{" "}
          <Link
            href="/guestlogs"
            className="text-[#d4a054] hover:underline font-mono"
          >
            {t("home.intro.link")}
          </Link>
          {t("home.intro.end")}
        </p>
      </div>
    </div>
  );
}
