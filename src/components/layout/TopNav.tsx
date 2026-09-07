"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X, Save, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function TopNav({ isAdmin }: { isAdmin: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Ordered by what a hiring reader needs first. Guestbook lives in the footer —
  // it isn't a hiring surface.
  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/cases", label: t.nav.cases },
    { href: "/resume", label: t.nav.resume },
    { href: "/products", label: t.nav.products },
    { href: "/insights", label: t.nav.insights },
    { href: "/about", label: t.nav.about },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border tonal-transition" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="flex justify-between items-center px-6 md:px-12 py-5 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono font-bold text-sm tracking-tight text-foreground"
          >
            <Image src={pawnSrc} alt="GATS LAB" width={20} height={20} className="object-contain" />
            <span>GATS_LAB</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 lg:gap-9">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`editorial-label transition-colors ${
                  isActive(item.href)
                    ? "text-foreground border-b border-foreground pb-0.5"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  href="/write"
                  className={`editorial-label transition-colors ${
                    pathname?.startsWith("/write")
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Save size={14} strokeWidth={1.5} />
                </Link>
                <Link
                  href="/admin"
                  className={`editorial-label transition-colors ${
                    pathname === "/admin"
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Settings size={14} strokeWidth={1.5} />
                </Link>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-6">
            {/* Language Toggle */}
            {mounted && (
              <button
                onClick={() => setLocale(locale === "en" ? "ko" : "en")}
                className="editorial-label text-foreground hover:opacity-60 transition-opacity cursor-pointer"
                aria-label={locale === "en" ? "Switch to Korean" : "Switch to English"}
              >
                {locale === "en" ? "EN" : "KO"}
              </button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="text-foreground hover:opacity-60 transition-opacity cursor-pointer"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon size={16} strokeWidth={1.5} />
                ) : (
                  <Sun size={16} strokeWidth={1.5} />
                )}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-foreground hover:opacity-60 transition-opacity cursor-pointer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-10 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading text-3xl font-bold tracking-tight transition-colors ${
                isActive(item.href) ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <div className="flex gap-8 mt-4">
              <Link href="/write" className="editorial-label text-muted hover:text-foreground transition-colors">
                Write
              </Link>
              <Link href="/admin" className="editorial-label text-muted hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
