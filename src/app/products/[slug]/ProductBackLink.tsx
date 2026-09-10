"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ProductBackLink() {
  return (
    <Link
      href="/products"
      className="text-muted hover:text-brand text-sm inline-flex items-center transition-all hover:-translate-x-1 duration-200 cursor-pointer"
    >
      <ChevronLeft size={16} strokeWidth={1.5} className="mr-1" />
      프로덕트
    </Link>
  );
}
