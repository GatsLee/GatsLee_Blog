import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.gatslee.com"),
  title: {
    default: "Gats Lab",
    template: "%s | Gats Lab",
  },
  description:
    "문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM. 케이스 스터디, AI 에이전트, 홈서버 운영 기록.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Gats Lab",
    title: "Gats Lab",
    description: "문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM. 케이스 스터디, AI 에이전트, 홈서버 운영 기록.",
  },
  twitter: {
    card: "summary",
    title: "Gats Lab",
    description: "문제를 숫자로 정의하고 시스템으로 해결하는 Technical PM. 케이스 스터디, AI 에이전트, 홈서버 운영 기록.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      "application/rss+xml": "https://blog.gatslee.com/feed.xml",
    },
  },
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JF8CSSH3GV" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-JF8CSSH3GV');`,
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WBQ4GB6B');`,
          }}
        />
        {/* Theme init */}
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WBQ4GB6B"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ClientLayout isAdmin={isAdmin}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
