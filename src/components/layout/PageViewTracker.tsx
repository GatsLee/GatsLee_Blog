"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 공개 화면 조회 기록. 대시보드 조회 추이가 이 값을 쓴다
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
