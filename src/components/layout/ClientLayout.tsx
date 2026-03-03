"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DynamicFavicon from "@/components/layout/DynamicFavicon";

export default function ClientLayout({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isEditorPage = pathname?.startsWith("/write");

  return (
    <ThemeProvider>
      <LanguageProvider>
        <DynamicFavicon />
        <div className="flex h-screen overflow-hidden">
          <Sidebar isAdmin={isAdmin} />
          <main className={`flex-1 flex flex-col h-screen overflow-hidden bg-background ${isEditorPage ? '' : 'relative z-10'}`}>
            <Header />
            <div className={`flex-1 overflow-hidden ${isEditorPage ? '' : 'overflow-y-auto p-6 sm:p-8 md:p-12'}`}>
              {children}
            </div>
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
