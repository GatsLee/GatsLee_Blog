"use client";

import { Target, Activity, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MissionControlProps {
  progress?: number; // 0-100
  status?: "running" | "deploying" | "idle";
  targetDate?: Date;
}

export default function MissionControl({
  progress = 45,
  status = "running",
  targetDate
}: MissionControlProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (targetDate) {
      const diff = targetDate.getTime() - new Date().getTime();
      setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  }, [targetDate]);

  const statusConfig = {
    running: {
      label: "RUNNING",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30"
    },
    deploying: {
      label: "DEPLOYING",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    },
    idle: {
      label: "IDLE",
      color: "text-muted",
      bgColor: "bg-muted/10",
      borderColor: "border-muted/30"
    }
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="bg-surface card-border rounded-lg p-6 transition-colors">
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="text-accent" size={20} strokeWidth={1.5} />
          <h3
            className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            MISSION CONTROL
          </h3>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${currentStatus.borderColor} ${currentStatus.bgColor}`}>
          <Activity className={currentStatus.color} size={12} strokeWidth={2} />
          <span
            className={`text-[10px] font-mono font-semibold ${currentStatus.color} tracking-wider`}
          >
            [{currentStatus.label}]
          </span>
        </div>
      </div>

      {/* Objective */}
      <p className="text-foreground text-base leading-relaxed mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        build **Life OS** to maximize my creativity and productivity.
      </p>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted font-mono">PROGRESS</span>
          <span className="text-accent font-mono font-semibold">{progress}%</span>
        </div>
        <div className="h-2 bg-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* D-Day Counter */}
        {daysRemaining !== null && (
          <div className="flex items-center gap-2 pt-2">
            <CheckCircle2 className="text-muted" size={14} strokeWidth={1.5} />
            <span className="text-xs text-muted font-mono">
              D-{daysRemaining > 0 ? daysRemaining : 'DAY'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
