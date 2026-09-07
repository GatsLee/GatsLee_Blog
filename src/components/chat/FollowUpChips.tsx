"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { detectCategory, FOLLOW_UPS, type Message } from "./chatTypes";

interface FollowUpChipsProps {
  messages: Message[];
  isStreaming: boolean;
  locale: "ko" | "en";
  onPick: (text: string) => void;
}

export default function FollowUpChips({ messages, isStreaming, locale, onPick }: FollowUpChipsProps) {
  if (isStreaming || messages.length === 0) return null;
  const lastAssistant = messages[messages.length - 1];
  if (lastAssistant?.role !== "assistant" || lastAssistant.error || !lastAssistant.content) return null;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return null;

  const category = detectCategory(lastUser.content);
  const followUps = FOLLOW_UPS[locale]?.[category] || FOLLOW_UPS[locale]?.default || [];
  if (followUps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1.5 pl-3 mt-1"
    >
      <span className="editorial-label text-[9px] text-muted flex items-center gap-1">
        <Sparkles size={10} strokeWidth={1.5} />
        {locale === "ko" ? "다음 질문" : "FOLLOW UP"}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {followUps.map((text, i) => (
          <button
            key={i}
            onClick={() => onPick(text)}
            className="text-[12px] border border-border rounded-full px-3 py-1.5 hover:border-foreground hover:bg-hover transition-all cursor-pointer text-secondary hover:text-foreground"
          >
            {text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
