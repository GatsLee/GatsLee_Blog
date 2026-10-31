"use client";

import { useState } from "react";
import { COUNTRY_PATHS, LAND_PATH, MAP_HEIGHT, MAP_WIDTH, PIN_POINTS } from "./worldMap";

type Place = keyof typeof COUNTRY_PATHS;

// 다녀온 곳과 해. 툴팁 방향은 가까운 뉴욕·캐나다, 스위스·이탈리아가 겹치지 않도록 나눈다
const TRIPS: { key: Place; label: string; years: string; below?: boolean }[] = [
  { key: "usa", label: "뉴욕", years: "2022", below: true },
  { key: "canada", label: "캐나다", years: "2022" },
  { key: "japan", label: "일본", years: "2023 · 2025" },
  { key: "switzerland", label: "스위스", years: "2024" },
  { key: "italy", label: "이탈리아", years: "2024", below: true },
  { key: "mongolia", label: "몽골", years: "2017" },
];

// 소개 > 여행 블록 지도. 핀이나 나라에 마우스를 올리면(모바일은 탭) 언제 갔는지 보여준다
export default function TravelMap() {
  const [active, setActive] = useState<Place | null>(null);

  return (
    <div className="relative w-full" onMouseLeave={() => setActive(null)}>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="block h-auto w-full" role="img" aria-label="다녀온 6개국을 표시한 세계 지도">
        <path d={LAND_PATH} className="fill-brand/15" />
        {TRIPS.map((t) => (
          <path
            key={t.key}
            d={COUNTRY_PATHS[t.key]}
            onMouseEnter={() => setActive(t.key)}
            className={`transition-[fill] duration-300 ${active === t.key ? "fill-brand/70" : "fill-brand/35"}`}
          />
        ))}
      </svg>

      {TRIPS.map((t, i) => {
        const [x, y] = PIN_POINTS[t.key];
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            aria-label={`${t.label} ${t.years}`}
            onMouseEnter={() => setActive(t.key)}
            onFocus={() => setActive(t.key)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(on ? null : t.key)}
            style={{ left: `${(x / MAP_WIDTH) * 100}%`, top: `${(y / MAP_HEIGHT) * 100}%`, "--d": `${300 + i * 90}ms` } as React.CSSProperties}
            className={`map-pin absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${on ? "z-20" : "z-10"}`}
          >
            <span aria-hidden className="map-pin-ring absolute h-3 w-3 rounded-full bg-brand" />
            <span aria-hidden className={`relative h-3 w-3 rounded-full border-2 border-white bg-brand shadow transition-transform duration-300 ${on ? "scale-125" : ""}`} />
            <span
              aria-hidden
              className={`pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg transition-[opacity,transform] duration-200 ${
                t.below ? "top-full mt-1" : "bottom-full mb-1"
              } ${on ? "opacity-100" : `opacity-0 ${t.below ? "-translate-y-1" : "translate-y-1"}`}`}
            >
              <span className="font-bold">{t.label}</span>
              <span className="opacity-70">{t.years}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
