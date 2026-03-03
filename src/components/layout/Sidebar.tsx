"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Monitor,
  Package,
  BookOpen,
  Map,
  MessageCircle,
  Save,
  Settings,
  X,
  ChevronLeft,
  Menu,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import VisitorCount from "@/components/home/VisitorCount";

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  // Reset mobile state when crossing the md breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        setIsMobileOpen(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const navItems = [
    { href: "/", icon: Monitor, label: t.nav.home },
    { href: "/products", icon: Package, label: t.nav.products },
    { href: "/insights", icon: BookOpen, label: t.nav.insights },
    { href: "/blueprint", icon: Map, label: t.nav.blueprint },
    { href: "/connect", icon: MessageCircle, label: t.nav.connect },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-6 left-6 z-40 md:hidden text-muted hover:text-foreground cursor-pointer"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <ChevronLeft size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      <aside
        className={`
          ${isMobileOpen ? "w-full translate-x-0" : "w-0 -translate-x-full"}
          ${isCollapsed ? "md:w-20" : "md:w-72"}
          md:translate-x-0
          bg-surface border-r border-border flex flex-col
          transition-all duration-300 ease-out overflow-hidden
          relative z-20 shrink-0 h-screen
        `}
      >
        {/* Header */}
        <div
          className={`${isCollapsed ? "p-4" : "px-8 py-8"} flex items-center justify-between`}
        >
          <Link
            href="/"
            className={`flex items-center text-foreground font-semibold tracking-tight text-xl ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {!isCollapsed && (
              <>
                <Image src={pawnSrc} alt="Pawn" width={28} height={28} className="object-contain" />
                <span className="whitespace-nowrap">GATS LAB</span>
              </>
            )}
            {isCollapsed && (
              <Image src={pawnSrc} alt="Pawn" width={32} height={32} className="object-contain" />
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-muted hover:text-foreground hidden md:block cursor-pointer"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
          )}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-muted hover:text-foreground md:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Separator */}
        <div className={`${isCollapsed ? "mx-3" : "mx-6"} border-t border-border`} />

        {/* Navigation */}
        <div className={`${isCollapsed ? "px-3 py-3" : "px-6 py-6"} flex-1 overflow-y-auto`}>
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full hidden md:flex items-center justify-center mb-6 text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Expand sidebar"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => { setIsMobileOpen(false); setIsCollapsed(true); }}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-all duration-200 rounded cursor-pointer relative overflow-hidden ${
                    active
                      ? "bg-hover text-foreground"
                      : "text-muted hover:text-foreground hover:bg-hover"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-accent rounded-r" />
                  )}
                  <span className={`${isCollapsed ? "" : "mr-3"} shrink-0`}>
                    <item.icon size={18} strokeWidth={1.5} className={active ? "text-accent" : ""} />
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className={`${isCollapsed ? "mt-8 pt-8" : "mt-12 pt-8"} space-y-1`}>
              <Link
                href="/write"
                title={isCollapsed ? t.nav.write : undefined}
                onClick={() => { setIsMobileOpen(false); setIsCollapsed(true); }}
                className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-colors rounded cursor-pointer ${
                  pathname === "/write" ? "text-accent" : "text-muted hover:text-foreground hover:bg-hover"
                }`}
              >
                <Save size={16} strokeWidth={1.5} className={`shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t.nav.write}</span>}
              </Link>
              <Link
                href="/admin"
                title={isCollapsed ? t.nav.admin : undefined}
                onClick={() => { setIsMobileOpen(false); setIsCollapsed(true); }}
                className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-colors rounded cursor-pointer ${
                  pathname === "/admin" ? "text-accent" : "text-muted hover:text-foreground hover:bg-hover"
                }`}
              >
                <Settings size={16} strokeWidth={1.5} className={`shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t.nav.admin}</span>}
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`${isCollapsed ? "p-3" : "p-6"} bg-surface space-y-3`}
        >
          {/* Social buttons */}
          <div className={`flex ${isCollapsed ? "flex-col items-center" : ""} gap-2`}>
            <SocialButton icon={<Github size={18} strokeWidth={1.5} />} href="https://github.com/GatsLee" label="GitHub" />
            <SocialButton icon={<Linkedin size={18} strokeWidth={1.5} />} href="https://www.linkedin.com/in/joon-yeol-lee-567421281/" label="LinkedIn" />
            <SocialButton icon={<Mail size={18} strokeWidth={1.5} />} href="mailto:naanthonylee@gmail.com" label="Email" />
          </div>

          {/* Visitor Count — only when expanded */}
          {!isCollapsed && (
            <VisitorCount />
          )}
        </div>
      </aside>
    </>
  );
}

function SocialButton({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 rounded text-muted hover:text-accent transition-colors duration-200 cursor-pointer"
      title={label}
    >
      {icon}
    </a>
  );
}
