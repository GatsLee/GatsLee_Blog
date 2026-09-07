"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ServerStatus {
  cpu: { model: string; cores: number; temperature: number | null };
  memory: { total: number; used: number; percentage: string };
  disk: { used: string; total: string; percentage: string };
  gpu: { name: string; vramUsed: number; vramTotal: number } | null;
  uptime: number;
  containers: { name: string; status: string }[];
  kernel: string;
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  if (d > 0) return `${d}d ${String(h).padStart(2, "0")}h`;
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

function formatBytes(b: number) {
  const gb = b / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(b / (1024 ** 2)).toFixed(0)}MB`;
}

function ProgressBar({ label, value, max, unit }: { label: string; value: string; max: string; unit?: string; }) {
  const [animated, setAnimated] = useState(false);
  const parseVal = (v: string) => parseFloat(v.replace(/[^0-9.]/g, ""));
  const numVal = parseVal(value);
  const numMax = parseVal(max);
  const pct = numMax > 0 ? Math.min((numVal / numMax) * 100, 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="editorial-label text-muted">{label}</span>
        <span className="font-mono text-xs text-foreground">{value} / {max}{unit ? ` ${unit}` : ""}</span>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            backgroundColor: pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "var(--color-foreground)",
          }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted mt-0.5 block">{pct.toFixed(0)}%</span>
    </div>
  );
}

function CpuTempIndicator({ temp }: { temp: number }) {
  // normal: < 60, warning: 60-80, danger: > 80
  const level = temp > 80 ? "danger" : temp > 60 ? "warning" : "normal";
  const colors = {
    normal: { dot: "bg-green-500", label: "Normal", text: "text-green-600" },
    warning: { dot: "bg-amber-500", label: "Warm", text: "text-amber-600" },
    danger: { dot: "bg-red-500 animate-pulse", label: "Hot", text: "text-red-600" },
  };
  const cfg = colors[level];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-2">
        <span className="editorial-label text-muted">CPU TEMP</span>
        <span className="font-mono text-sm text-foreground font-medium">{temp.toFixed(1)}°C</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <span className={`font-mono text-[10px] font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
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

  if (!status) {
    return (
      <div className="flex items-center gap-3">
        <span className="editorial-label text-muted">{t.metrics.homeServer}</span>
        <span className="editorial-label text-muted animate-pulse">connecting...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="editorial-label font-bold text-foreground">{t.metrics.homeServer}</span>
        <span className="flex items-center gap-1.5 editorial-label text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          live
        </span>
      </div>

      {/* UPTIME */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="editorial-label text-muted">UPTIME</span>
        <span className="font-mono text-sm text-foreground font-medium">{formatUptime(status.uptime)}</span>
      </div>

      {/* CPU TEMP */}
      {status.cpu.temperature !== null && (
        <div className="mb-4">
          <CpuTempIndicator temp={status.cpu.temperature} />
        </div>
      )}

      {/* CONTAINERS */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="editorial-label text-muted">CONTAINERS</span>
        <span className="font-mono text-sm text-foreground font-medium">{status.containers.length} active</span>
      </div>

      {/* RAM */}
      <div className="mb-4">
        <ProgressBar
          label="RAM"
          value={formatBytes(status.memory.used)}
          max={formatBytes(status.memory.total)}
        />
      </div>

      {/* DISK */}
      <div className="mb-4">
        <ProgressBar
          label="DISK"
          value={status.disk.used}
          max={status.disk.total}
        />
      </div>

      {/* VRAM */}
      {status.gpu && (
        <div>
          <ProgressBar
            label="VRAM"
            value={`${(status.gpu.vramUsed / 1024).toFixed(1)}GB`}
            max={`${(status.gpu.vramTotal / 1024).toFixed(1)}GB`}
          />
        </div>
      )}
    </div>
  );
}
