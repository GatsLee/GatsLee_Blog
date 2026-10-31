"use client";

import { useEffect } from "react";

// data-reveal이 붙은 요소를 화면에 들어올 때 한 번 드러낸다 (globals.css "홈·포스트 애니메이션").
// 끝으로 한 번에 건너뛰어도 지나친 요소가 숨은 채 남지 않도록 스크롤 위치로 판단한다
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("reveal-ready");
    let pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.9;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > line) return true;
        el.classList.add("is-revealed");
        return false;
      });
      if (!pending.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    // 숨김 상태가 한 번 그려진 뒤 드러내야 첫 화면 요소도 움직인다
    frame = requestAnimationFrame(() => requestAnimationFrame(check));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
