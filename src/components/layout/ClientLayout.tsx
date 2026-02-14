"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function ClientLayout({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar isAdmin={isAdmin} />
          <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-background z-10">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-12">{children}</div>
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
