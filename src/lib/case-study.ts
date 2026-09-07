/**
 * Case study "beats" — the 6-part structure every PM/PO portfolio converges on:
 *
 *   01 context → 02 problem (framed by a metric) → 03 hypothesis (with a
 *   pre-declared success criterion) → 04 decisions & tradeoffs (incl. what was
 *   NOT built) → 05 outcome in numbers → 06 reflection (incl. failed experiments)
 *
 * Stored as a JSON string on Post.caseBeats so the shape can evolve without a
 * migration. Bump `version` if the shape changes incompatibly.
 */

export interface Metric {
  label: string;
  before: string;
  after: string;
  delta: string;
  source: string;
}

export interface Decision {
  title: string;
  options: string;
  chose: string;
  because: string;
  tradeoff: string;
}

/** The differentiator. A case study without this is a brag. */
export interface NotBuilt {
  item: string;
  why: string;
}

export interface RiceRow {
  item: string;
  r: string;
  i: string;
  c: string;
  e: string;
  score: string;
}

export type Verdict = "met" | "partial" | "missed" | "";

export interface CaseBeats {
  version: 1;

  context: {
    product: string;
    period: string;
    team: string;
    myRole: string;
    iOwned: string[];
  };

  problem: {
    statement: string;
    metrics: Metric[];
    evidence: string;
  };

  hypothesis: {
    statement: string;
    successCriteria: Metric[];
    /** When the criteria were declared — before the outcome was known. */
    declaredOn: string;
  };

  decisions: {
    prdExcerpt: string;
    wireframes: string[];
    framework: "RICE" | "ICE" | "none";
    priorities: RiceRow[];
    decisions: Decision[];
    stakeholderConflict: { who: string; tension: string; resolution: string };
    notBuilt: NotBuilt[];
  };

  outcome: {
    metrics: Metric[];
    proxyNote: string;
    verdictVsCriteria: Verdict;
  };

  reflection: {
    learned: string;
    failedExperiments: string;
    nextTime: string;
  };
}

export const BEAT_KEYS = [
  "context",
  "problem",
  "hypothesis",
  "decisions",
  "outcome",
  "reflection",
] as const;

export type BeatKey = (typeof BEAT_KEYS)[number];

export const BEAT_LABEL: Record<BeatKey, { ko: string; en: string }> = {
  context: { ko: "맥락", en: "Context" },
  problem: { ko: "문제", en: "Problem" },
  hypothesis: { ko: "가설", en: "Hypothesis" },
  decisions: { ko: "의사결정", en: "Decisions" },
  outcome: { ko: "결과", en: "Outcome" },
  reflection: { ko: "회고", en: "Reflection" },
};

export const VERDICT_LABEL: Record<Exclude<Verdict, "">, { ko: string; en: string }> = {
  met: { ko: "기준 충족", en: "Criteria met" },
  partial: { ko: "부분 충족", en: "Partially met" },
  missed: { ko: "미달", en: "Missed" },
};

export function emptyMetric(): Metric {
  return { label: "", before: "", after: "", delta: "", source: "" };
}

export function emptyBeats(): CaseBeats {
  return {
    version: 1,
    context: { product: "", period: "", team: "", myRole: "", iOwned: [] },
    problem: { statement: "", metrics: [emptyMetric()], evidence: "" },
    hypothesis: { statement: "", successCriteria: [emptyMetric()], declaredOn: "" },
    decisions: {
      prdExcerpt: "",
      wireframes: [],
      framework: "none",
      priorities: [],
      decisions: [],
      stakeholderConflict: { who: "", tension: "", resolution: "" },
      notBuilt: [],
    },
    outcome: { metrics: [emptyMetric()], proxyNote: "", verdictVsCriteria: "" },
    reflection: { learned: "", failedExperiments: "", nextTime: "" },
  };
}

/** Tolerant parse — old/partial blobs get filled in with empty defaults. */
export function parseBeats(raw: string | null | undefined): CaseBeats | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const base = emptyBeats();
    return {
      ...base,
      ...parsed,
      context: { ...base.context, ...(parsed.context ?? {}) },
      problem: { ...base.problem, ...(parsed.problem ?? {}) },
      hypothesis: { ...base.hypothesis, ...(parsed.hypothesis ?? {}) },
      decisions: {
        ...base.decisions,
        ...(parsed.decisions ?? {}),
        stakeholderConflict: {
          ...base.decisions.stakeholderConflict,
          ...(parsed.decisions?.stakeholderConflict ?? {}),
        },
      },
      outcome: { ...base.outcome, ...(parsed.outcome ?? {}) },
      reflection: { ...base.reflection, ...(parsed.reflection ?? {}) },
    };
  } catch {
    return null;
  }
}

const hasMetric = (ms: Metric[]) =>
  ms.some((m) => m.label.trim() !== "" && (m.after.trim() !== "" || m.delta.trim() !== ""));

/** Which beats are filled in. Drives the editor's completeness meter. */
export function beatCompleteness(b: CaseBeats): {
  filled: number;
  total: number;
  missing: BeatKey[];
} {
  const done: Record<BeatKey, boolean> = {
    context: b.context.product.trim() !== "" && b.context.myRole.trim() !== "",
    problem: b.problem.statement.trim() !== "" && hasMetric(b.problem.metrics),
    hypothesis:
      b.hypothesis.statement.trim() !== "" && hasMetric(b.hypothesis.successCriteria),
    decisions: b.decisions.notBuilt.some((n) => n.item.trim() !== ""),
    outcome: hasMetric(b.outcome.metrics) && b.outcome.verdictVsCriteria !== "",
    reflection:
      b.reflection.learned.trim() !== "" && b.reflection.failedExperiments.trim() !== "",
  };
  const missing = BEAT_KEYS.filter((k) => !done[k]);
  return { filled: BEAT_KEYS.length - missing.length, total: BEAT_KEYS.length, missing };
}

/**
 * The one hard gate. Everything else is a soft warning — this blocks the save.
 * A case study with no "what I chose not to build" is a brag, not a case study.
 */
export function canCommit(b: CaseBeats): { ok: boolean; reason?: string } {
  if (!b.decisions.notBuilt.some((n) => n.item.trim() !== "")) {
    return {
      ok: false,
      reason:
        "'만들지 않기로 한 것'이 비어 있습니다. 이게 없으면 케이스 스터디가 아니라 자랑입니다.",
    };
  }
  return { ok: true };
}

const metricLines = (ms: Metric[]) =>
  ms
    .filter((m) => m.label.trim() !== "")
    .map(
      (m) =>
        `- ${m.label}: ${m.before || "?"} → ${m.after || "?"}${
          m.delta ? ` (${m.delta})` : ""
        }${m.source ? ` [출처: ${m.source}]` : ""}`
    )
    .join("\n");

/**
 * RAG bridge. The chunker only ever sees Post.content, so beats stored as JSON
 * would be invisible to the chatbot. Flatten them to markdown at index time.
 */
export function beatsToMarkdown(b: CaseBeats): string {
  const s: string[] = [];

  s.push("## 맥락 (Context)");
  s.push(
    [
      b.context.product && `제품: ${b.context.product}`,
      b.context.period && `기간: ${b.context.period}`,
      b.context.team && `팀 구성: ${b.context.team}`,
      b.context.myRole && `내 역할: ${b.context.myRole}`,
    ]
      .filter(Boolean)
      .join("\n")
  );
  if (b.context.iOwned.length) {
    s.push("내가 소유한 것:\n" + b.context.iOwned.map((x) => `- ${x}`).join("\n"));
  }

  s.push("## 문제 (Problem)");
  if (b.problem.statement) s.push(b.problem.statement);
  const pm = metricLines(b.problem.metrics);
  if (pm) s.push("문제 지표:\n" + pm);
  if (b.problem.evidence) s.push(`근거: ${b.problem.evidence}`);

  s.push("## 가설 (Hypothesis)");
  if (b.hypothesis.statement) s.push(b.hypothesis.statement);
  const hc = metricLines(b.hypothesis.successCriteria);
  if (hc) {
    s.push(
      `사전 선언한 성공 기준${
        b.hypothesis.declaredOn ? ` (${b.hypothesis.declaredOn} 선언)` : ""
      }:\n${hc}`
    );
  }

  s.push("## 의사결정과 트레이드오프 (Decisions)");
  for (const d of b.decisions.decisions) {
    if (!d.title.trim()) continue;
    s.push(
      [
        `### ${d.title}`,
        d.options && `검토한 선택지: ${d.options}`,
        d.chose && `선택: ${d.chose}`,
        d.because && `이유: ${d.because}`,
        d.tradeoff && `트레이드오프: ${d.tradeoff}`,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
  if (b.decisions.prdExcerpt) s.push(`PRD 발췌:\n${b.decisions.prdExcerpt}`);
  if (b.decisions.framework !== "none" && b.decisions.priorities.length) {
    s.push(
      `우선순위 (${b.decisions.framework}):\n` +
        b.decisions.priorities
          .filter((p) => p.item.trim())
          .map((p) => `- ${p.item}: R=${p.r} I=${p.i} C=${p.c} E=${p.e} → ${p.score}`)
          .join("\n")
    );
  }
  const sc = b.decisions.stakeholderConflict;
  if (sc.who || sc.tension || sc.resolution) {
    s.push(
      `이해관계자 충돌:\n- 대상: ${sc.who}\n- 갈등: ${sc.tension}\n- 해결: ${sc.resolution}`
    );
  }
  const nb = b.decisions.notBuilt.filter((n) => n.item.trim());
  if (nb.length) {
    s.push(
      "만들지 않기로 한 것:\n" + nb.map((n) => `- ${n.item} — 이유: ${n.why}`).join("\n")
    );
  }

  s.push("## 결과 (Outcome)");
  const om = metricLines(b.outcome.metrics);
  if (om) s.push(om);
  if (b.outcome.proxyNote) s.push(`지표 주석: ${b.outcome.proxyNote}`);
  if (b.outcome.verdictVsCriteria) {
    s.push(`사전 기준 대비 판정: ${VERDICT_LABEL[b.outcome.verdictVsCriteria].ko}`);
  }

  s.push("## 회고 (Reflection)");
  if (b.reflection.learned) s.push(`배운 것: ${b.reflection.learned}`);
  if (b.reflection.failedExperiments) {
    s.push(`실패한 실험: ${b.reflection.failedExperiments}`);
  }
  if (b.reflection.nextTime) s.push(`다음엔: ${b.reflection.nextTime}`);

  return s.filter((x) => x && x.trim()).join("\n\n");
}

/** Headline metric for list cards and the TL;DR strip — first outcome metric with a delta. */
export function headlineMetric(b: CaseBeats): Metric | null {
  return (
    b.outcome.metrics.find((m) => m.label.trim() && m.delta.trim()) ??
    b.outcome.metrics.find((m) => m.label.trim()) ??
    b.problem.metrics.find((m) => m.label.trim()) ??
    null
  );
}
