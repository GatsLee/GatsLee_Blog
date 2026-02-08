"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export default function NetworkGraph() {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    setBars(Array.from({ length: 40 }, () => Math.random() * 80 + 20));

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((h) => {
          const delta = (Math.random() - 0.5) * 20;
          return Math.max(10, Math.min(100, h + delta));
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black border border-gray-800 p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Activity className="mr-2 text-green-500" size={18} /> NETWORK TRAFFIC
        </h3>
        <span className="text-xs font-mono text-green-500 animate-pulse">
          LIVE MONITORING
        </span>
      </div>

      <div className="flex items-end justify-between h-32 gap-1 opacity-80">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-full bg-gray-800 hover:bg-green-500 transition-colors duration-300"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs font-mono text-gray-500">
        <span>IN: 42.5 MB/s</span>
        <span>OUT: 12.1 MB/s</span>
      </div>
    </div>
  );
}
