"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import TopNav from "@/components/layout/TopNav";
import Footer, { type FooterProject } from "@/components/layout/Footer";
import DynamicFavicon from "@/components/layout/DynamicFavicon";
import ChatWidget from "@/components/home/ChatWidget";

export default function ClientLayout({
  children,
  isAdmin,
  footerProjects,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  footerProjects: FooterProject[];
}) {
  const pathname = usePathname();
  const isEditorPage = pathname?.startsWith("/write");
  // 이력서 페이지는 PDF 원본이라 위에 아무것도 띄우지 않는다
  const isResumePage = pathname === "/resume";
  const showChatWidget = !isEditorPage && !isResumePage;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <DynamicFavicon />
        <div className="min-h-screen flex flex-col">
          <TopNav isAdmin={isAdmin} />
          <main className="flex-1">{children}</main>
          {!isEditorPage && <Footer projects={footerProjects} />}
          {showChatWidget && <ChatWidget initialMessage="" defaultOpen={false} />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
