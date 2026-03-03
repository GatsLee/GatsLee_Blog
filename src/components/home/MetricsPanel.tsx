"use client";

import { Server } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

function useCountUp(target: number, duration = 800, decimals = 0) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}

function CountUpDisplay({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const animated = useCountUp(value, 800, decimals);
  return <>{animated}{suffix}</>;
}


interface ServerStatus {
  cpu: { model: string; cores: number; temperature: number | null };
  memory: { total: number; used: number; percentage: string };
  disk: { used: string; total: string; percentage: string };
  uptime: number;
  containers: { name: string; status: string }[];
  kernel: string;
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function formatBytes(b: number) {
  const gb = b / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(b / (1024 ** 2)).toFixed(0)}MB`;
}

function AnimatedGauge({ percentage }: { percentage: number }) {
  const animatedPct = useCountUp(percentage, 800);
  const color = percentage >= 80 ? "bg-red-500" : percentage >= 60 ? "bg-amber-500" : "bg-accent";
  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-2 bg-hover rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${animatedPct}%` }} />
      </div>
      <span className="text-[10px] text-muted font-mono block text-right">{animatedPct}%</span>
    </div>
  );
}


export default function MetricsPanel() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ServerStatus | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 8000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const ramPct = status ? Math.round((status.memory.used / status.memory.total) * 100) : 0;
  const diskPct = status ? parseInt(status.disk.percentage) || 0 : 0;

  const serverMetrics = status
    ? [
        { label: "UPTIME",     value: formatUptime(status.uptime) },
        { label: "CONTAINERS", value: `${status.containers.length} active`, countTarget: status.containers.length },
        { label: "RAM",        value: `${formatBytes(status.memory.used)} / ${formatBytes(status.memory.total)}`, gauge: ramPct },
        { label: "DISK",       value: `${status.disk.used} / ${status.disk.total}`, gauge: diskPct },
        ...(status.cpu.temperature !== null
          ? [{ label: "CPU TEMP", value: "", temperature: status.cpu.temperature }]
          : []),
        { label: "KERNEL",     value: status.kernel },
      ] as { label: string; value: string; gauge?: number; temperature?: number; countTarget?: number }[]
    : null;

  return (
    <div className="bg-surface card-border rounded-lg p-6 transition-colors h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <Server className="text-accent" size={16} strokeWidth={1.5} />
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted font-semibold" style={{ fontFamily: "Archivo, sans-serif" }}>
              {t.metrics.homeServer}
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            live
          </span>
        </div>

        {!serverMetrics ? (
          <div className="text-muted text-xs animate-pulse font-mono">connecting...</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {serverMetrics.map((item, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[10px] text-muted uppercase tracking-wider font-medium block">{item.label}</span>
                <span className="text-sm text-foreground font-mono font-semibold block">
                  {item.temperature !== undefined ? (
                    <CountUpDisplay value={item.temperature} decimals={1} suffix="°C" />
                  ) : item.countTarget !== undefined ? (
                    <><CountUpDisplay value={item.countTarget} /> {item.value.replace(/^\d+\s*/, "")}</>
                  ) : (
                    item.value
                  )}
                </span>
                {item.gauge !== undefined && item.gauge > 0 && (
                  <AnimatedGauge percentage={item.gauge} />
                )}
                {item.temperature !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.temperature >= 80 ? 'bg-red-500' : item.temperature >= 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <span className="text-[9px] text-muted font-mono">
                      {item.temperature < 60 ? 'normal' : item.temperature < 80 ? 'warm' : 'hot'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
