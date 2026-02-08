"use client";

import { useState } from "react";
import { ChevronDown, Activity } from "lucide-react";

interface SystemStatsProps {
  children: React.ReactNode;
  summaryLine: string;
}

export default function SystemStats({ children, summaryLine }: SystemStatsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-800 bg-black">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Activity size={14} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            System Metrics
          </span>
          {!expanded && (
            <span className="text-xs font-mono text-gray-600 hidden sm:inline">
              {summaryLine}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
