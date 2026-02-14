"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Server, Cpu, HardDrive, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "@/lib/i18n";

interface MetricItem {
  label: string;
  value: string;
  max?: string;
  percentage?: number;
}

interface MetricGroup {
  labelKey: TranslationKey;
  icon: React.ReactNode;
  items: MetricItem[];
}

interface MetricsPanelProps {
  homeServerMetrics: MetricItem[];
  aiMetrics: MetricItem[];
}

function LinearGauge({ percentage, label }: { percentage: number; label: string }) {
  const getColor = (pct: number) => {
    if (pct >= 80) return "bg-red-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-accent";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted font-mono uppercase tracking-wider">{label}</span>
        <span className="text-accent font-mono font-semibold">{percentage}%</span>
      </div>
      <div className="h-1 bg-hover rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TerminalCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-muted text-xs font-mono">waiting</span>
      <span className={`w-1.5 h-3 bg-accent transition-opacity duration-100 ${visible ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

export default function MetricsPanel({ homeServerMetrics, aiMetrics }: MetricsPanelProps) {
  const { t } = useLanguage();

  // Parse RAM usage to get percentage
  const ramMetric = homeServerMetrics.find(m => m.label === "RAM");
  const ramPercentage = ramMetric?.percentage || 0;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 transition-colors space-y-6">
      {/* Home Server Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Server className="text-accent" size={16} strokeWidth={1.5} />
          <h3
            className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {t("status.homeserver")}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {homeServerMetrics.map((item, i) => (
            <div key={i} className="space-y-1">
              <span className="text-[10px] text-muted uppercase tracking-wider font-medium block">
                {item.label}
              </span>
              <span className="text-sm text-foreground font-mono font-semibold block">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* RAM Visual Gauge */}
        {ramPercentage > 0 && (
          <div className="pt-2">
            <LinearGauge percentage={ramPercentage} label="Memory Usage" />
          </div>
        )}
      </div>

      {/* AI Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Cpu className="text-accent" size={16} strokeWidth={1.5} />
          <h3
            className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {t("status.ai")}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {aiMetrics.map((item, i) => (
            <div key={i} className="space-y-1">
              <span className="text-[10px] text-muted uppercase tracking-wider font-medium block">
                {item.label}
              </span>
              <span className="text-sm text-foreground font-mono font-semibold block">
                {item.value === "—" || item.value === "\u2014" ? <TerminalCursor /> : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
