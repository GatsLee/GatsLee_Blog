import Link from "next/link";
import { ArrowRight, Bot, Globe, Smartphone } from "lucide-react";
import type { ProductType } from "@/lib/product";

const TYPE_ICON = { app: Smartphone, web: Globe, agent: Bot } satisfies Record<ProductType, unknown>;

// HM/프로젝트카드
export default function ProjectCard({
  slug,
  name,
  type,
  headline,
  detail,
  revealDelay,
}: {
  slug: string;
  name: string;
  type: ProductType;
  headline: string;
  detail: string;
  revealDelay?: number;
}) {
  const Icon = TYPE_ICON[type];
  return (
    <Link
      href={`/products/${slug}`}
      data-reveal={revealDelay !== undefined ? "" : undefined}
      style={revealDelay !== undefined ? ({ "--d": `${revealDelay}ms` } as React.CSSProperties) : undefined}
      className="lift-card group flex flex-col gap-3 rounded-xl border border-border bg-background p-6"
    >
      <span className="flex items-center gap-3">
        <Icon size={24} strokeWidth={1.8} className="text-brand" />
        <span className="text-2xl font-bold leading-9 text-foreground">{name}</span>
      </span>
      <span className="line-clamp-2 text-lg font-medium leading-7 text-foreground">{headline}</span>
      {detail && <span className="line-clamp-2 text-sm leading-6 text-secondary">{detail}</span>}
      <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[13px] text-brand">
        프로젝트 살펴보기 <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
