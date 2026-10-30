import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// RECENT PROJECTS · 최근에 만든 프로젝트 · 전체 보기 (홈 섹션 머리)
export default function SectionHead({ label, title, href, linkLabel }: { label: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="mono-label">{label}</p>
        <h2 className="mt-1 text-[28px] font-bold leading-[42px] text-foreground">{title}</h2>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-[15px] text-brand hover:underline">
        {linkLabel} <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
