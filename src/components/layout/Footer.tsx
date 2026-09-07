"use client";

import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import VisitorCount from "@/components/home/VisitorCount";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-12">
        {/* Single row: GATS_LAB + dream + icons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="font-mono font-bold text-sm tracking-tight text-foreground">GATS_LAB</span>
            <div className="flex items-center gap-3">
              <a href="https://github.com/GatsLee" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">
                <Github size={16} strokeWidth={1.5} />
              </a>
              <a href="https://www.linkedin.com/in/joon-yeol-lee-567421281/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">
                <Linkedin size={16} strokeWidth={1.5} />
              </a>
              <a href="mailto:naanthonylee@gmail.com" className="text-muted hover:text-foreground transition-colors">
                <Mail size={16} strokeWidth={1.5} />
              </a>
            </div>
            <div className="ml-4">
              <VisitorCount />
            </div>
          </div>

          {/* Moved out of the top nav — the guestbook isn't a hiring surface. */}
          <Link
            href="/connect"
            className="editorial-label text-muted hover:text-foreground transition-colors"
          >
            {t.nav.connect}
          </Link>
        </div>

        <p className="text-sm leading-relaxed text-secondary font-light max-w-lg mb-4">
          {t.footer?.dream || "AI로 문제를 정의하고, 시스템을 설계하고, 에이전트로 해결하는 세상을 만들고 싶습니다. 혼자서도 팀만큼의 임팩트를 내는 것이 목표입니다."}
        </p>

        <p className="editorial-label text-muted">
          &copy; {new Date().getFullYear()} Gats Lee. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
