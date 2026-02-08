"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface StatusItem {
  label: string;
  value: string;
}

interface StatusGroup {
  labelKey: TranslationKey;
  items: StatusItem[];
}

interface ServerStatusBarProps {
  groups: StatusGroup[];
}

export default function ServerStatusBar({ groups }: ServerStatusBarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      {groups.map((group, gi) => (
        <div key={gi} className="border border-[#2e2e4a] bg-[#22223a]/80 rounded-lg px-4 py-3 font-mono text-xs">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <span className="flex items-center gap-2 text-[#d4a054] shrink-0">
              <span className="w-2 h-2 bg-[#d4a054] rounded-full animate-pulse" />
              {t(group.labelKey)}
            </span>
            {group.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className="text-[#5a5a72]">{item.label}:</span>
                <span className="text-[#d4d4dc]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
