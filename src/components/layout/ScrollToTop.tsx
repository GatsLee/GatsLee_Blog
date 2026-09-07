"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-content")?.querySelector("[class*='overflow-y-auto']") as HTMLElement | null;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setVisible(scrollContainer.scrollTop > 300);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("main-content")?.querySelector("[class*='overflow-y-auto']") as HTMLElement | null;
    scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-surface card-border shadow-lg text-muted hover:text-accent hover:border-accent transition-all cursor-pointer active:scale-95"
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} strokeWidth={2} />
    </button>
  );
}
