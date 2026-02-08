import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { LanguageProvider } from "@/context/LanguageContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gats Lab - Home Server Devlog",
  description:
    "홈서버 구축과 AI 에이전트 개발 기록. Building autonomous 24/7 AI workforce.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let isAdmin = false;
  if (token) {
    const payload = await verifyToken(token);
    isAdmin = payload?.role === "admin";
  }

  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#1a1a2e] text-[#d4d4dc] font-sans antialiased">
        <LanguageProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar isAdmin={isAdmin} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#1a1a2e] z-10">
              <Header />
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">{children}</div>
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
