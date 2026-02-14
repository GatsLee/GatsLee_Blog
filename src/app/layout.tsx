import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import ClientLayout from "@/components/layout/ClientLayout";
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <ClientLayout isAdmin={isAdmin}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
