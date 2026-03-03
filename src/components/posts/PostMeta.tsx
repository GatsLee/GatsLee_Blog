"use client";

import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";

interface PostMetaProps {
  date: string;
  category: string;
}

export function PostBackLink() {
  return (
    <Link
      href="/insights"
      className="mb-8 text-muted hover:text-accent text-sm flex items-center transition-all hover:-translate-x-1 duration-200 inline-flex cursor-pointer"
    >
      <ChevronLeft size={16} strokeWidth={1.5} className="mr-1" /> CD ..
    </Link>
  );
}

export function PostMetaInfo({ date, category }: PostMetaProps) {
  return (
    <div className="flex items-center text-xs text-muted space-x-4 tracking-wide">
      <span className="flex items-center gap-1.5">
        <Calendar size={12} strokeWidth={1.5} />
        {date}
      </span>
      <span className="text-border-strong">•</span>
      <span className="flex items-center gap-1.5">
        <Tag size={12} strokeWidth={1.5} />
        {category}
      </span>
    </div>
  );
}
