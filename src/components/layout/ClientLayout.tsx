"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import TopNav from "@/components/layout/TopNav";
import Footer, { type FooterProject } from "@/components/layout/Footer";
import DynamicFavicon from "@/components/layout/DynamicFavicon";
import PageViewTracker from "@/components/layout/PageViewTracker";
import ChatWidget from "@/components/home/ChatWidget";

// 어드민·글 작성·로그인은 공개 헤더·푸터·챗봇 없이 자기 틀을 쓴다
const ADMIN_PREFIXES = ["/admin", "/write", "/login"];

export default function ClientLayout({
  children,
  isAdmin,
  footerProjects,
  resumeUrl,
  chatVisible,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  footerProjects: FooterProject[];
  resumeUrl: string;
  chatVisible: boolean;
}) {
  const pathname = usePathname() ?? "";
  const isAdminArea = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  // 이력서 페이지는 PDF 원본이라 위에 아무것도 띄우지 않는다
  const isResumePage = pathname === "/resume";

  return (
    <ThemeProvider>
      <LanguageProvider>
        <DynamicFavicon />
        {isAdminArea ? (
          children
        ) : (
          <div className="flex min-h-screen flex-col">
            <PageViewTracker />
            <TopNav isAdmin={isAdmin} resumeUrl={resumeUrl} />
            <main className="flex-1">{children}</main>
            <Footer projects={footerProjects} resumeUrl={resumeUrl} chatVisible={chatVisible} />
            {!isResumePage && chatVisible && <ChatWidget initialMessage="" defaultOpen={false} />}
          </div>
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}
