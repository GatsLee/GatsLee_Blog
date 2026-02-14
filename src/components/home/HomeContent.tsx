"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import MetricsPanel from "@/components/home/MetricsPanel";
import BuildProgressTimeline from "@/components/home/BuildProgressTimeline";

interface MetricItem {
  label: string;
  value: string;
  percentage?: number;
}

interface HomeContentProps {
  homeServerMetrics: MetricItem[];
  aiMetrics: MetricItem[];
}

export default function HomeContent({ homeServerMetrics, aiMetrics }: HomeContentProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-8">
      {/* Top Section - Introduction + Metrics (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Introduction */}
        <section className="bg-surface border border-border rounded-lg p-6 transition-colors h-full">
          <p
            className="text-xs text-muted uppercase tracking-[0.2em] mb-4 font-semibold"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {t("home.readme")}
          </p>
          <p className="text-foreground leading-relaxed text-sm">
            {t("home.intro")}{" "}
            <Link
              href="/guestlogs"
              className="text-accent hover:underline font-medium"
            >
              {t("home.intro.link")}
            </Link>
            {t("home.intro.end")}
          </p>
        </section>

        {/* Right - Metrics Panel */}
        <section className="h-full">
          <MetricsPanel
            homeServerMetrics={homeServerMetrics}
            aiMetrics={aiMetrics}
          />
        </section>
      </div>

      {/* Bottom Section - Build Progress Timeline (full width) */}
      <section>
        <BuildProgressTimeline />
      </section>
    </div>
  );
}
