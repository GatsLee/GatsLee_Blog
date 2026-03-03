"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface VisitorStats {
  total: number;
  today: number;
}

export default function VisitorCount() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    // Deduplicate per browser per calendar day
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const key = `visited_${today}`;

    if (!localStorage.getItem(key)) {
      fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: window.location.pathname }),
      })
        .then(() => localStorage.setItem(key, "1"))
        .catch(() => {});
    }

    // Fetch current counts
    fetch("/api/visitors")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <Users size={12} strokeWidth={1.5} className="shrink-0" />
      {stats ? (
        <div className="flex gap-2 font-mono">
          <span>
            <span className="uppercase tracking-wider">{t.home.todayVisitors} </span>
            <span className="text-foreground font-semibold">{stats.today.toLocaleString()}</span>
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="uppercase tracking-wider">{t.home.totalVisitors} </span>
            <span className="text-foreground font-semibold">{stats.total.toLocaleString()}</span>
          </span>
        </div>
      ) : (
        <span className="animate-pulse font-mono">—</span>
      )}
    </div>
  );
}
