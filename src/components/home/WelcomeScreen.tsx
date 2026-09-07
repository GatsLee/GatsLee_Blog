"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface WelcomeScreenProps {
  onSubmit: (message: string) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [input, setInput] = useState("");
  const { theme } = useTheme();
  const { t } = useLanguage();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  const suggestions = t.home.suggestions;

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-12">
        <Image
          src={pawnSrc}
          alt="GATS LAB"
          width={40}
          height={40}
          className="mb-6"
        />
        <h1 className="text-center">
          <span className="block text-base md:text-lg text-secondary font-extralight tracking-[0.2em] uppercase mb-4">Welcome to</span>
          <span className="block font-heading text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-[-0.03em] text-foreground">
            Gats Lab
          </span>
        </h1>
      </div>

      {/* Suggestion chips — horizontal scroll on mobile, wrap on desktop */}
      <div className="flex gap-3 mb-12 max-w-2xl overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory sm:snap-none">
        {suggestions.map((s: { text: string }, i: number) => (
          <button
            key={i}
            onClick={() => onSubmit(s.text)}
            className="border border-border text-sm text-secondary hover:text-foreground hover:border-foreground px-4 py-[7px] rounded-[10px] transition-colors cursor-pointer font-light shrink-0 snap-center sm:shrink sm:snap-align-none"
          >
            {s.text}
          </button>
        ))}
      </div>

      {/* Input field */}
      <div className="w-full max-w-2xl">
        <div className="relative flex items-center border border-border rounded-2xl overflow-hidden focus-within:border-foreground transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t.home.chatPlaceholder}
            className="flex-1 bg-transparent px-5 py-4 text-base text-foreground placeholder:text-muted outline-none font-light"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="mr-3 p-2 rounded-full bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
