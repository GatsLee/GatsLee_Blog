import type { ProductEvidence } from "@/lib/product";

/**
 * 문제 섹션. 서술 문단 + 근거 카드.
 * 근거 카드는 비어 있을 수 있다 — 인용문 없이 수치만 있는 경우(에이전트)가 정상이다.
 */
export default function ProductProblem({
  body,
  evidence,
}: {
  body: string;
  evidence: ProductEvidence;
}) {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const numbers = evidence.numbers ?? [];
  const hasEvidence = Boolean(evidence.quote || evidence.note || numbers.length);

  if (paragraphs.length === 0 && !hasEvidence) return null;

  return (
    <section className="mb-20">
      <p className="editorial-label text-brand mb-3">PROBLEM</p>
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        문제
      </h2>

      <div className="space-y-4 max-w-2xl">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] text-foreground leading-[1.8]">
            {p}
          </p>
        ))}
      </div>

      {hasEvidence && (
        <div className="mt-10 bg-surface card-border rounded-lg p-7 max-w-2xl">
          {evidence.label && <p className="editorial-label text-brand mb-4 text-[10px]">{evidence.label}</p>}

          {evidence.quote && (
            <div className="flex gap-4">
              <span className="w-[2px] shrink-0 bg-brand rounded-full" aria-hidden />
              <div>
                <p className="text-[15px] text-foreground leading-relaxed">{evidence.quote}</p>
                {evidence.source && <p className="text-xs text-muted mt-2">{evidence.source}</p>}
              </div>
            </div>
          )}

          {numbers.length > 0 && (
            <div className={`flex flex-wrap gap-x-12 gap-y-5 ${evidence.quote ? "mt-7" : ""}`}>
              {numbers.map((n, i) => (
                <div key={i}>
                  <p
                    className="text-2xl font-bold text-foreground tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {n.value}
                  </p>
                  <p className="text-xs text-muted mt-1">{n.label}</p>
                </div>
              ))}
            </div>
          )}

          {evidence.note && (
            <p className="text-sm text-secondary mt-6 pt-5 border-t border-border">{evidence.note}</p>
          )}
        </div>
      )}
    </section>
  );
}
