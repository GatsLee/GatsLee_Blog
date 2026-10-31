import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// 홈 섹션 머리: 체스 기물 아이콘(또는 영문 라벨) · 제목 · 원형 화살표 링크 (HM/원형화살표링크)
export default function SectionHead({
  label,
  icon,
  title,
  href,
  linkLabel,
}: {
  label?: string;
  icon?: React.ReactNode;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      {icon ? (
        <h2 className="flex items-center gap-2 text-[28px] font-bold leading-[42px] text-foreground">
          <span className="text-brand">{icon}</span>
          {title}
        </h2>
      ) : (
        <div>
          {label && <p className="mono-label">{label}</p>}
          <h2 className="mt-1 text-[28px] font-bold leading-[42px] text-foreground">{title}</h2>
        </div>
      )}
      <Link
        href={href}
        aria-label={linkLabel}
        title={linkLabel}
        className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-[filter,box-shadow] duration-300 hover:brightness-110 hover:shadow-[0_6px_16px_rgba(49,92,244,0.3)]"
      >
        <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
