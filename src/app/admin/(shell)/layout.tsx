import type { Metadata } from "next";
import { getStreak } from "@/lib/streak";
import { getResumePdfs } from "@/lib/resume";
import AdminSidebar from "@/components/admin/shell/AdminSidebar";
import AdminToolbar from "@/components/admin/shell/AdminToolbar";
import { ToastProvider } from "@/components/admin/ui/Toast";

export const metadata: Metadata = { title: "어드민", robots: { index: false, follow: false } };

// 어드민 공통 틀: 사이드바 + 상단 도구 (인증은 middleware가 막는다)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [streak, resume] = await Promise.all([getStreak(12).catch(() => null), getResumePdfs()]);
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar streak={streak} resume={resume} />
        <div className="flex min-w-0 flex-1 flex-col bg-surface">
          <AdminToolbar />
          <main className="flex-1 px-8 pb-8 pt-7">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
