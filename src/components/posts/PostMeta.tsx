"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PostMetaProps {
  date: string;
  category: string;
}

export function PostBackLink() {
  const { t } = useLanguage();
  return (
    <Link
      href="/devlogs"
      className="mb-8 text-[#8888a0] hover:text-[#d4a054] text-xs font-mono flex items-center transition-colors hover:-translate-x-1 duration-200 inline-flex"
    >
      <ChevronLeft size={14} className="mr-1" /> {t("post.back")}
    </Link>
  );
}

export function PostMetaInfo({ date, category }: PostMetaProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center text-xs text-[#8888a0] space-x-6 font-mono uppercase tracking-wider">
      <span>{t("post.date")}{date}</span>
      <span>{t("post.category")}{category}</span>
      <span>Auth: root</span>
      <span>Perm: r--r--r--</span>
    </div>
  );
}
