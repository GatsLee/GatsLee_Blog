import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-3 text-[13px] leading-[21px] text-secondary" aria-label="경로">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && <ArrowRight size={14} className="text-brand" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
