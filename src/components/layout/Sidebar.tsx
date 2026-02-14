"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";
import {
  HardDrive,
  FileText,
  AlertCircle,
  Terminal,
  Save,
  Settings,
  X,
  ChevronLeft,
  Menu,
  TrendingUp,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

const navItems: { href: string; icon: typeof HardDrive; labelKey: TranslationKey }[] = [
  { href: "/", icon: HardDrive, labelKey: "nav.home" },
  { href: "/progress", icon: TrendingUp, labelKey: "nav.progress" },
  { href: "/devlogs", icon: FileText, labelKey: "nav.devlogs" },
  { href: "/troubleshooting", icon: AlertCircle, labelKey: "nav.troubleshooting" },
  { href: "/guestlogs", icon: Terminal, labelKey: "nav.guestlogs" },
];

export default function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

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
          className={`${isCollapsed ? "px-4 py-6" : "px-8 py-6"} border-b border-border flex items-center justify-between`}
        >
          <Link
            href="/"
            className={`flex items-center text-foreground font-semibold tracking-tight text-xl ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}
            style={{ fontFamily: 'Archivo, sans-serif' }}
          >
            {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.title")}</span>}
            {isCollapsed && <span className="text-2xl">G</span>}
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

        {/* Navigation */}
        <div className={`${isCollapsed ? "px-3 py-8" : "px-6 py-8"} flex-1 overflow-y-auto`}>
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
              const active = pathname === item.href;
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-all duration-200 rounded cursor-pointer ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground hover:bg-hover"
                  }`}
                >
                  <span
                    className={`${isCollapsed ? "" : "mr-3"} shrink-0`}
                  >
                    <item.icon size={18} strokeWidth={1.5} />
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className={`${isCollapsed ? "mt-8 pt-8" : "mt-12 pt-8"} border-t border-border space-y-1`}>
              <Link
                href="/write"
                title={isCollapsed ? t("sidebar.admin") : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-colors rounded cursor-pointer ${
                  pathname === "/write"
                    ? "text-accent"
                    : "text-muted hover:text-foreground hover:bg-hover"
                }`}
              >
                <Save size={16} strokeWidth={1.5} className={`shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.admin")}</span>}
              </Link>
              <Link
                href="/admin"
                title={isCollapsed ? t("sidebar.adminDashboard") : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-3 text-sm font-medium transition-colors rounded cursor-pointer ${
                  pathname === "/admin"
                    ? "text-accent"
                    : "text-muted hover:text-foreground hover:bg-hover"
                }`}
              >
                <Settings size={16} strokeWidth={1.5} className={`shrink-0 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.adminDashboard")}</span>}
              </Link>
            </div>
          )}
        </div>

        {/* Social Footer */}
        <div
          className={`${isCollapsed ? "px-3 py-6" : "px-6 py-6"} border-t border-border bg-surface`}
        >
          {!isCollapsed && (
            <p className="text-xs text-muted mb-4 font-medium uppercase tracking-wider">
              {t("sidebar.connect")}
            </p>
          )}
          <div className={`flex ${isCollapsed ? "flex-col items-center" : ""} gap-2`}>
            <SocialButton icon={<Github size={18} strokeWidth={1.5} />} href="https://github.com/GatsLee" label="GitHub" />
            <SocialButton icon={<Linkedin size={18} strokeWidth={1.5} />} href="https://www.linkedin.com/in/joon-yeol-lee-567421281/" label="LinkedIn" />
            <SocialButton icon={<Mail size={18} strokeWidth={1.5} />} href="mailto:naanthonylee@gmail.com" label="Email" />
          </div>
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
      className="flex items-center justify-center w-10 h-10 rounded border border-border text-muted hover:text-accent hover:border-accent hover:bg-hover transition-all duration-200 cursor-pointer"
      title={label}
    >
      {icon}
    </a>
  );
}
