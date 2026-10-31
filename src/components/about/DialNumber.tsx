"use client";

import { useEffect, useRef, useState } from "react";

const DIGITS = "0123456789";

// 숫자를 다이얼처럼 굴려서 보여준다. 화면에 들어오면 자릿수마다 0부터 한 바퀴 돌고 제자리에 멈춘다.
// 숫자가 아닌 글자(공백, km, :)는 그대로 둔다
export default function DialNumber({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [spun, setSpun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpun(true);
      return;
    }
    // 한 번에 건너뛰어 지나친 숫자도 돌도록 교차 여부 대신 스크롤 위치로 판단한다 (RevealOnScroll과 같은 방식)
    let frame = 0;
    const check = () => {
      frame = 0;
      if (el.getBoundingClientRect().top > window.innerHeight * 0.85) return;
      setSpun(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  let digitIndex = 0;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {[...value].map((ch, i) => {
          if (!DIGITS.includes(ch)) return <span key={i} className="whitespace-pre">{ch}</span>;
          const n = Number(ch);
          const order = digitIndex++;
          // 두 바퀴짜리 띠에서 두 번째 바퀴의 숫자에 멈춰야 한 바퀴 돈 것처럼 보인다
          return (
            <span key={i} className="inline-block h-[1lh] overflow-hidden">
              <span
                className="flex flex-col"
                style={{
                  transform: `translateY(${spun ? -(10 + n) : 0}lh)`,
                  transition: `transform 1.6s cubic-bezier(0.22, 1, 0.36, 1) ${order * 120}ms`,
                }}
              >
                {[...DIGITS, ...DIGITS].map((d, j) => (
                  <span key={j} className="h-[1lh] text-center tabular-nums">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
