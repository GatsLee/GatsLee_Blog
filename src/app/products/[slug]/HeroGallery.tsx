"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

// IA_PD_002 대표 시각 자료 16:9. 여러 장이면 좌우로 넘긴다
export default function HeroGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);
  const btn = "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-brand";
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface">
        <Image src={images[index]} alt={alt} fill sizes="1184px" className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button type="button" aria-label="이전 이미지" onClick={() => go(-1)} className={`${btn} left-4`}>
              <ArrowLeft size={20} />
            </button>
            <button type="button" aria-label="다음 이미지" onClick={() => go(1)} className={`${btn} right-4`}>
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2.5 py-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번째 이미지`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-brand" : "bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
