"use client";

import { useRouter } from "next/navigation";
import type { Source } from "./chatTypes";

interface SourceCardProps {
  source: Source;
  index: number;
}

// 답변 아래 "참고한 글" 칩
export default function SourceCard({ source }: SourceCardProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(source.route)}
      className="w-full truncate rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs font-medium text-brand hover:border-brand"
    >
      {source.title}
    </button>
  );
}
