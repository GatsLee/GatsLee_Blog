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
      className="fixed bottom-6 right-6 z-50 flex h-12 cursor-pointer items-center rounded-full bg-brand px-5 text-white shadow-[0_8px_24px_rgba(49,92,244,0.3)] transition-opacity hover:opacity-95 sm:h-11"
      aria-label={locale === "ko" ? "Gats 채팅 열기" : "Open Gats chat"}
      aria-expanded={false}
    >
      <span className="editorial-label text-[10px] tracking-[0.18em]">ASK GATS</span>
    </motion.button>
  );
});

ChatFAB.displayName = "ChatFAB";

export default ChatFAB;
