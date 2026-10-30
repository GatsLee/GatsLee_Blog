"use client";

import { useState } from "react";
import type { DebugRank } from "@/lib/rag";

const RESULT: Record<DebugRank["result"], { label: string; tone: string }> = {
  used: { label: "사용", tone: "bg-[#e6f7ee] text-success" },
  "same-post": { label: "제외 · 같은 글 2개 초과", tone: "bg-[#eef0f3] text-secondary" },
  full: { label: "제외 · 5개 다 참", tone: "bg-[#eef0f3] text-secondary" },
};

// 검색 테스트 (IA_AD_00403 · 0040302 빈 결과)
export default function SearchTest() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<DebugRank[] | null>(null);
  const [error, setError] = useState("");

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/rag/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) {
      setResults(null);
      setError(data?.error ?? "검색하지 못했어요.");
      return;
    }
    setResults(data.results);
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6">
      <div>
        <h2 className="text-[17px] font-bold text-foreground">검색 테스트</h2>
        <p className="mt-1 text-xs text-secondary">질문을 넣으면 어떤 청크가 몇 위로 뽑히고, 왜 빠졌는지 보여줍니다. 모델은 부르지 않습니다.</p>
      </div>
      <form onSubmit={run} className="flex flex-col gap-2">
        <label htmlFor="rag-q" className="text-[13px] font-bold text-foreground">
          질문
        </label>
        <div className="flex gap-2">
          <input
            id="rag-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 블로그는 어떤 서버에서 돌아가나요?"
            className="h-11 min-w-0 flex-1 rounded-[10px] border border-border bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-brand"
          />
          <button type="submit" disabled={busy || !query.trim()} className="h-11 rounded-[10px] bg-brand px-5 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "검색 중…" : "검색"}
          </button>
        </div>
      </form>
      {error && <p className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-danger">{error}</p>}
      {results && results.length === 0 && <p className="py-6 text-center text-sm text-secondary">맞는 청크가 없어요. 색인 상태를 먼저 확인해 주세요.</p>}
      {results && results.length > 0 && (
        <table className="w-full table-fixed text-left text-[13px]">
          <thead className="bg-surface-2 text-xs text-secondary">
            <tr>
              <th className="w-[56px] px-3 py-3 font-medium">순위</th>
              <th className="px-3 py-3 font-medium">글 · 청크</th>
              <th className="w-[80px] px-3 py-3 font-medium">의미 순위</th>
              <th className="w-[88px] px-3 py-3 font-medium">키워드 순위</th>
              <th className="w-[88px] px-3 py-3 font-medium">합친 점수</th>
              <th className="w-[180px] px-3 py-3 font-medium">결과</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.chunkId} className="border-t border-border">
                <td className="px-3 py-3 text-secondary">{i + 1}</td>
                <td className="truncate px-3 py-3 text-foreground">
                  {r.postTitle} · #{r.chunkIndex}
                </td>
                <td className="px-3 py-3 text-secondary">{r.vectorRank ?? "—"}</td>
                <td className="px-3 py-3 text-secondary">{r.bm25Rank ?? "—"}</td>
                <td className="px-3 py-3 text-secondary">{r.score.toFixed(4)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${RESULT[r.result].tone}`}>{RESULT[r.result].label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
