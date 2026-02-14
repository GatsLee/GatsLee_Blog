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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {groups.map((group, gi) => (
        <div key={gi} className="border-l-2 border-[#09090B] pl-6 py-2">
          <div className="space-y-4">
            <h3
              className="text-xs uppercase tracking-[0.2em] text-[#71717A] font-semibold mb-6"
              style={{ fontFamily: 'Archivo, sans-serif' }}
            >
              {t(group.labelKey)}
            </h3>
            <div className="space-y-3">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <span className="text-xs text-[#71717A] uppercase tracking-wider font-medium min-w-[120px]">
                    {item.label}
                  </span>
                  <span className="text-sm text-[#09090B] font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
