"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { Source } from "./chatTypes";

interface SourceCardProps {
  source: Source;
  index: number;
}

export default function SourceCard({ source, index }: SourceCardProps) {
  const router = useRouter();
  const num = String(index + 1).padStart(2, "0");

  return (
    <button
      onClick={() => router.push(source.route)}
      className="group flex items-center gap-2.5 w-full text-left py-1 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <span className="editorial-label text-[9px] text-muted shrink-0 w-5">{num}</span>
      <span className="text-[12px] text-foreground truncate flex-1 group-hover:underline underline-offset-2">
        {source.title}
      </span>
      <ArrowUpRight
        size={11}
        strokeWidth={1.5}
        className="text-muted shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
      />
    </button>
  );
}
