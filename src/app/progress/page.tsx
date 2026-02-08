"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface ProgressItem {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  sortOrder: number;
}

const CATEGORY_ORDER = ["hardware", "software", "network", "ai"];

const categoryKeyMap: Record<string, TranslationKey> = {
  hardware: "progress.category.hardware",
  software: "progress.category.software",
  network: "progress.category.network",
  ai: "progress.category.ai",
};

export default function ProgressPage() {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => {
    const catItems = items.filter((item) => item.category === cat);
    const completed = catItems.filter((item) => item.completed).length;
    const total = catItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { category: cat, items: catItems, completed, total, percentage };
  }).filter((g) => g.total > 0);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl text-[#d4d4dc] font-bold flex items-center tracking-tight">
          <TrendingUp className="mr-2" size={20} /> {t("progress.title")}
        </h2>
        <span className="text-xs font-mono text-[#8888a0]">
          {t("progress.subtitle")}
        </span>
      </div>

      {loading ? (
        <div className="text-[#8888a0] font-mono text-sm animate-pulse p-8 text-center">
          Loading...
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg p-12 text-center">
          <p className="text-[#5a5a72] font-mono text-sm">No progress items yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div
              key={group.category}
              className="bg-[#22223a] border border-[#2e2e4a] rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-6 py-4 border-b border-[#2e2e4a] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#d4d4dc] uppercase tracking-wider">
                  {t(categoryKeyMap[group.category])}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d4a054] rounded-full transition-all duration-500"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#8888a0]">
                    {group.percentage}% {t("progress.complete")}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#2e2e4a]/50">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-6 py-3 hover:bg-[#1a1a2e] transition-colors"
                  >
                    <span
                      className={`text-sm font-mono mt-0.5 shrink-0 ${
                        item.completed ? "text-[#d4a054]" : "text-[#5a5a72]"
                      }`}
                    >
                      {item.completed ? "[x]" : "[ ]"}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${
                          item.completed
                            ? "text-[#8888a0] line-through"
                            : "text-[#d4d4dc]"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-[#5a5a72] mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
