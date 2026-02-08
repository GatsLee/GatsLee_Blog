"use client";

import { useState, useEffect } from "react";

interface TypingObjectiveProps {
  text: string;
}

export default function TypingObjective({ text }: TypingObjectiveProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) {
      // Wait 20 seconds before restarting
      const resetTimer = setTimeout(() => {
        setDisplayedText("");
        setIsTyping(true);
      }, 20000);

      return () => clearTimeout(resetTimer);
    }

    // Typing animation
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 50); // 50ms per character for smooth typing

      return () => clearTimeout(timer);
    } else {
      // Typing complete, wait before resetting
      setIsTyping(false);
    }
  }, [displayedText, isTyping, text]);

  return (
    <span>
      {displayedText}
      {isTyping && displayedText.length < text.length && (
        <span className="animate-blink">|</span>
      )}
    </span>
  );
}
