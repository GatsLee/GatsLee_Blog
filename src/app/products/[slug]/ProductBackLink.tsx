"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ProductBackLink() {
  return (
    <Link
      href="/products"
      className="mb-8 text-muted hover:text-accent text-sm flex items-center transition-all hover:-translate-x-1 duration-200 inline-flex cursor-pointer"
    >
      <ChevronLeft size={16} strokeWidth={1.5} className="mr-1" /> CD ..
    </Link>
  );
}
