"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 140;
const ERASE_MS = 80;
const HOLD_MS = 1800;

// 히어로 명제의 "유저"·"User"를 번갈아 타이핑한다. 뒤에 브랜드색 글로우를 깐다 (IA_HM_001 요소_글로우_사용자)
export default function TypingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(words[0].length);
  const [erasing, setErasing] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const word = words[index];
    let delay = erasing ? ERASE_MS : TYPE_MS;
    if (!erasing && length === word.length) delay = HOLD_MS;
    const t = setTimeout(() => {
      if (!erasing && length === word.length) setErasing(true);
      else if (erasing && length === 0) {
        setErasing(false);
        setIndex((i) => (i + 1) % words.length);
      } else setLength((l) => l + (erasing ? -1 : 1));
    }, delay);
    return () => clearTimeout(t);
  }, [index, length, erasing, reduced, words]);

  const text = reduced ? words[0] : words[index].slice(0, length);

  return (
    // 가장 긴 단어 폭만큼 자리를 잡아 두어 "User"를 칠 때 뒤 글자가 밀리지 않게 한다
    <span className="relative inline-grid text-white">
      {/* 글자를 지우는 동안에도 글로우 크기는 유지한다 */}
      <span aria-hidden className="absolute -left-[0.12em] -right-[0.12em] inset-y-[0.04em] -z-10 min-w-[2.3em] rounded-full bg-brand/60 blur-[18px]" />
      {words.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1">
          {w}
        </span>
      ))}
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden className="col-start-1 row-start-1">
        {text}
      </span>
    </span>
  );
}
