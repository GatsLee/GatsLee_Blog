"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import TopNav from "@/components/layout/TopNav";
import Footer from "@/components/layout/Footer";
import DynamicFavicon from "@/components/layout/DynamicFavicon";
import ChatWidget from "@/components/home/ChatWidget";

export default function ClientLayout({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isEditorPage = pathname?.startsWith("/write");
  const isHomePage = pathname === "/";
  const isConnectPage = pathname === "/connect";
  // The resume page is the PDF source — nothing floating over it.
  const isResumePage = pathname === "/resume";
  const showChatWidget = !isEditorPage && !isHomePage && !isConnectPage && !isResumePage;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <DynamicFavicon />
        <div className="min-h-screen flex flex-col">
          <TopNav isAdmin={isAdmin} />
          <main className={`flex-1 ${isEditorPage ? "pt-[72px]" : "pt-[72px]"}`}>
            <div className={isEditorPage ? "" : ""}>
              {children}
            </div>
          </main>
          {!isEditorPage && <Footer />}
          {showChatWidget && <ChatWidget initialMessage="" defaultOpen={false} />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
