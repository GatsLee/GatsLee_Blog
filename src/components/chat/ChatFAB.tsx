"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";

interface ChatFABProps {
  onClick: () => void;
  locale: string;
}

const ChatFAB = forwardRef<HTMLButtonElement, ChatFABProps>(({ onClick, locale }, ref) => {
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 z-50 shadow-lg cursor-pointer flex items-center bg-foreground text-background h-12 sm:h-11 rounded-full px-5 hover:opacity-95 transition-opacity"
      aria-label={locale === "ko" ? "Gats 채팅 열기" : "Open Gats chat"}
      aria-expanded={false}
    >
      <span className="editorial-label text-[10px] tracking-[0.18em]">ASK GATS</span>
    </motion.button>
  );
});

ChatFAB.displayName = "ChatFAB";

export default ChatFAB;
