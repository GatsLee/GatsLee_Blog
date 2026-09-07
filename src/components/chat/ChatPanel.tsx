"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import BottomSheet from "./BottomSheet";

interface ChatPanelProps {
  onClose: () => void;
  children: ReactNode;
  ariaLabel: string;
}

export default function ChatPanel({ onClose, children, ariaLabel }: ChatPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Lock body scroll while open (covers both mobile sheet and desktop modal)
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add("chat-open");
    } else {
      document.body.classList.remove("chat-open");
    }
    return () => document.body.classList.remove("chat-open");
  }, [isMobile]);

  if (isMobile) {
    return (
      <div role="dialog" aria-label={ariaLabel}>
        <BottomSheet onClose={onClose}>{children}</BottomSheet>
      </div>
    );
  }

  return <DesktopModal ariaLabel={ariaLabel}>{children}</DesktopModal>;
}

function DesktopModal({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-[60] bottom-6 right-6 w-[480px] h-[640px] flex flex-col border border-border-strong shadow-2xl overflow-hidden rounded-2xl"
      style={{ backgroundColor: "var(--color-background)" }}
      role="dialog"
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}
