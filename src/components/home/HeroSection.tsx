"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  return (
    <section className="relative bg-surface card-border rounded-lg overflow-hidden">
      {/* Background image */}
      <Image
        src="/Basement_Server_Pixelized_Image.png"
        alt=""
        fill
        className="object-cover object-[center_70%]"
        priority
      />
      {/* Gradient overlay: opaque left → transparent right */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === "dark"
            ? "linear-gradient(to right, rgba(9,9,11,1) 0%, rgba(9,9,11,0.95) 50%, rgba(9,9,11,0.6) 75%, rgba(9,9,11,0) 100%)"
            : "linear-gradient(to right, rgba(250,250,250,1) 0%, rgba(250,250,250,0.95) 50%, rgba(250,250,250,0.6) 75%, rgba(250,250,250,0) 100%)",
        }}
      />
      {/* Content */}
      <div className="relative z-10 p-8 flex items-center gap-6">
        <div className="shrink-0">
          <Image
            src={pawnSrc}
            alt="GATS LAB"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-secondary font-medium">{t.home.greeting}</p>
          <h1
            className="text-lg md:text-xl font-semibold text-foreground tracking-tight whitespace-pre-line"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            {t.home.slogan}
          </h1>
          <p className="text-xs text-secondary">{t.home.sloganSub}</p>
        </div>
      </div>
    </section>
  );
}
