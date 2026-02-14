"use client";

import { useState, useEffect } from "react";

export default function BootSequence({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Skip loading animation if already loaded this session
    if (typeof window !== "undefined" && sessionStorage.getItem("loaded")) {
      setLoaded(true);
      return;
    }

    // Minimal delay for smooth transition
    const timer = setTimeout(() => {
      setLoaded(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("loaded", "1");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (loaded) {
    return <>{children}</>;
  }

  // Swiss minimalist skeleton loader
  return (
    <div className="max-w-7xl mx-auto space-y-16 md:space-y-24 animate-pulse">
      {/* Skeleton for status bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-l-2 border-border pl-6 py-2 space-y-4">
          <div className="h-3 bg-hover rounded w-24"></div>
          <div className="space-y-3">
            <div className="h-2 bg-hover rounded w-32"></div>
            <div className="h-2 bg-hover rounded w-28"></div>
            <div className="h-2 bg-hover rounded w-36"></div>
          </div>
        </div>
        <div className="border-l-2 border-border pl-6 py-2 space-y-4">
          <div className="h-3 bg-hover rounded w-20"></div>
          <div className="space-y-3">
            <div className="h-2 bg-hover rounded w-28"></div>
            <div className="h-2 bg-hover rounded w-32"></div>
            <div className="h-2 bg-hover rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Skeleton for diagram */}
      <div className="space-y-6">
        <div className="h-6 bg-hover rounded w-48"></div>
        <div className="h-64 bg-hover rounded"></div>
      </div>

      {/* Skeleton for intro text */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3 space-y-4">
          <div className="h-3 bg-hover rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-4 bg-hover rounded"></div>
            <div className="h-4 bg-hover rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
