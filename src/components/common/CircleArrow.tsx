import { ArrowUpRight } from "lucide-react";

// HM/원형화살표링크의 모양. 행 전체가 링크일 때 안에 넣는 표시용이라 링크가 아니다 (부모에 group 필요)
export default function CircleArrow({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-brand text-white transition-[filter,box-shadow] duration-300 group-hover:brightness-110 group-hover:shadow-[0_6px_16px_rgba(49,92,244,0.3)]"
    >
      <ArrowUpRight size={Math.round(size * 0.45)} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  );
}
