"use client";

import { useState, useEffect } from "react";

const bootLines = [
  { text: "> Initializing system...", delay: 0 },
  { text: "> Connecting to home server...", delay: 300 },
  { text: "> Loading AI modules...", delay: 600 },
  { text: "> Mounting dashboard...", delay: 900 },
  { text: "> System ready.", delay: 1200, accent: true },
];

export default function BootSequence({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    // Skip loading animation if already loaded this session
    if (typeof window !== "undefined" && sessionStorage.getItem("loaded")) {
      setLoaded(true);
      return;
    }

    // Show boot lines progressively
    bootLines.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });

    // Transition to content after boot completes
    const timer = setTimeout(() => {
      setLoaded(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("loaded", "1");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (loaded) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="space-y-2 font-mono text-sm">
        {bootLines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`transition-opacity duration-200 ${
              line.accent ? "text-accent font-semibold" : "text-muted"
            }`}
          >
            {line.text}
            {i === visibleLines - 1 && !line.accent && (
              <span className="animate-pulse ml-1">_</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
