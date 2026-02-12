"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";
import {
  Server,
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
        className="fixed top-4 left-4 z-40 md:hidden text-[#8888a0] hover:text-[#d4d4dc]"
        title={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
          ${isMobileOpen ? "w-full translate-x-0" : "w-0 -translate-x-full"}
          ${isCollapsed ? "md:w-16" : "md:w-72"}
          md:translate-x-0
          bg-[#1a1a2e] border-r border-[#2e2e4a] flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          relative z-20 shrink-0 h-screen
        `}
      >
        {/* Header */}
        <div
          className={`${isCollapsed ? "px-3 py-3" : "px-6 py-3"} border-b border-[#2e2e4a] flex items-center justify-between`}
        >
          <Link
            href="/"
            className={`flex items-center text-[#d4d4dc] font-bold tracking-widest text-lg ${isCollapsed ? "justify-center w-full" : "space-x-2"}`}
          >
            <Server size={20} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.title")}</span>}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-[#5a5a72] hover:text-[#d4d4dc] hidden md:block"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-[#5a5a72] hover:text-[#d4d4dc] md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* System Status */}
        <div className={`${isCollapsed ? "px-2 py-4" : "p-6"} flex-1 overflow-y-auto`}>
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full hidden md:flex items-center justify-center mb-4 text-[#5a5a72] hover:text-[#d4d4dc] transition-colors"
            >
              <Menu size={16} />
            </button>
          )}

          <div className="mb-8">
            {!isCollapsed && (
              <p className="text-xs text-[#5a5a72] font-mono mb-2">
                {t("sidebar.session")}
              </p>
            )}
            <div
              className={`flex items-center text-[#d4a054] text-xs font-mono ${isCollapsed ? "justify-center" : ""}`}
            >
              <span className="w-2 h-2 bg-[#d4a054] rounded-full animate-pulse shrink-0" />
              {!isCollapsed && <span className="ml-2">{t("sidebar.online")}</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium transition-all duration-200 border-l-2 rounded-r-lg group ${
                    active
                      ? "bg-[#d4a054]/10 text-[#d4d4dc] border-[#d4a054]"
                      : "text-[#8888a0] hover:text-[#d4d4dc] hover:bg-white/5 border-transparent hover:border-[#5a5a72]"
                  }`}
                >
                  <span
                    className={`${isCollapsed ? "" : "mr-3"} transition-transform duration-300 shrink-0 ${
                      active ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    <item.icon size={18} />
                  </span>
                  {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="mt-8 pt-8 border-t border-[#2e2e4a] space-y-3">
              <Link
                href="/write"
                title={isCollapsed ? t("sidebar.admin") : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center" : ""} text-xs transition-colors ${
                  pathname === "/write"
                    ? "text-[#d4d4dc]"
                    : "text-[#5a5a72] hover:text-[#8888a0]"
                }`}
              >
                <Save size={12} className={`shrink-0 ${isCollapsed ? "" : "mr-2"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.admin")}</span>}
              </Link>
              <Link
                href="/admin"
                title={isCollapsed ? t("sidebar.adminDashboard") : undefined}
                className={`flex items-center ${isCollapsed ? "justify-center" : ""} text-xs transition-colors ${
                  pathname === "/admin"
                    ? "text-[#d4d4dc]"
                    : "text-[#5a5a72] hover:text-[#8888a0]"
                }`}
              >
                <Settings size={12} className={`shrink-0 ${isCollapsed ? "" : "mr-2"}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.adminDashboard")}</span>}
              </Link>
            </div>
          )}
        </div>

        {/* Social Footer */}
        <div
          className={`${isCollapsed ? "px-2 py-4" : "p-6"} border-t border-[#2e2e4a] bg-[#1a1a2e]`}
        >
          {!isCollapsed && (
            <p className="text-[10px] text-[#5a5a72] mb-3 font-mono uppercase tracking-widest">
              {t("sidebar.connect")}
            </p>
          )}
          <div className={`flex ${isCollapsed ? "flex-col items-center" : ""} gap-2`}>
            <SocialButton icon={<Github size={18} />} href="https://github.com/GatsLee" label="GitHub" />
            <SocialButton icon={<Linkedin size={18} />} href="https://www.linkedin.com/in/joon-yeol-lee-567421281/" label="LinkedIn" />
            <SocialButton icon={<Mail size={18} />} href="mailto:naanthonylee@gmail.com" label="Email" />
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
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#2e2e4a] text-[#8888a0] hover:text-[#d4a054] hover:border-[#d4a054] hover:bg-[#d4a054]/10 transition-all duration-200"
      title={label}
    >
      {icon}
    </a>
  );
}
