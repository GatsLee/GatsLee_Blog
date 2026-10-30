import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// AI 챗봇 하위 화면 머리: 뒤로 · 경로 · 제목 · 설명 · 오른쪽 동작
export default function SubPageHeader({ parent, title, desc, children }: { parent: { href: string; label: string }; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-1.5 text-[13px]">
          <Link href={parent.href} className="flex items-center gap-1 text-secondary hover:text-foreground">
            <ChevronLeft size={14} /> {parent.label}
          </Link>
          <span className="text-muted">/</span>
          <span className="font-bold text-foreground">{title}</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-8 text-foreground">{title}</h1>
        <p className="mt-1 text-[13px] text-secondary">{desc}</p>
      </div>
      {children}
    </div>
  );
}
