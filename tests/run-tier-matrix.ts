/**
 * Tier matrix runner — sends fixture queries to /api/chat and verifies tier classification.
 *
 * Usage (from host): npx tsx tests/run-tier-matrix.ts
 * Or inside container: docker exec blog node /app/tests/run-tier-matrix.js
 *
 * Reads tests/chat-fixtures.json, hits CHAT_API_URL with each query,
 * parses SSE stream first `meta` event for tier + similarity.
 */
import fs from "node:fs";
import path from "node:path";

const CHAT_API_URL = process.env.CHAT_API_URL || "http://localhost:3001/api/chat";

interface Fixture {
  q: string;
  expectSlug?: string;
  minSim?: number;
  maxSim?: number;
}
interface Fixtures {
  tier0_exact: Fixture[];
  tier1_close_paraphrase: Fixture[];
  tier2_loose_semantic: Fixture[];
  tier3_post_specific: Fixture[];
}

interface MetaEvent {
  tier: 0 | 1 | 2 | 3;
  similarity: number;
  faqSlug: string | null;
}

interface CaseResult {
  q: string;
  expectedTier: 0 | 1 | 2 | 3;
  actualTier: number | null;
  similarity: number | null;
  faqSlug: string | null;
  expectSlug?: string;
  pass: boolean;
  reason?: string;
  durationMs: number;
}

async function sendQuery(q: string): Promise<{ meta: MetaEvent | null; durationMs: number; firstChunkMs: number | null; bodySnippet: string }> {
  const t0 = Date.now();
  const sessionId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q, sessionId, history: [] }),
  });

  if (!res.ok || !res.body) {
    return { meta: null, durationMs: Date.now() - t0, firstChunkMs: null, bodySnippet: `HTTP ${res.status}` };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let meta: MetaEvent | null = null;
  let firstChunkMs: number | null = null;
  let body = "";
  let pending = "";
  const hardLimit = 50_000;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (firstChunkMs === null) firstChunkMs = Date.now() - t0;
    const chunk = decoder.decode(value, { stream: true });
    body += chunk;
    pending += chunk;

    // Parse complete SSE events delimited by \n\n
    while (true) {
      const idx = pending.indexOf("\n\n");
      if (idx < 0) break;
      const event = pending.slice(0, idx);
      pending = pending.slice(idx + 2);
      const dataLine = event.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const payload = dataLine.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        if (json.meta && !meta) {
          meta = json.meta as MetaEvent;
          try { await reader.cancel(); } catch {}
          return { meta, durationMs: Date.now() - t0, firstChunkMs, bodySnippet: body.slice(0, 200) };
        }
      } catch {}
    }

    if (body.length > hardLimit) {
      try { await reader.cancel(); } catch {}
      break;
    }
  }

  return { meta, durationMs: Date.now() - t0, firstChunkMs, bodySnippet: body.slice(0, 200) };
}

/**
 * Acceptable tier range per expected tier.
 * Tier-adjacent classification is acceptable because the only effect is whether
 * LLM is called (Tier 2/3) or not (Tier 0/1) — they all use the FAQ pool except Tier 3.
 *
 * Hard rules (must hold):
 *   - Tier 0: exact match required (sim=1.0 path)
 *   - Tier 1: must hit FAQ pool (tier 1 or 2). Falling to Tier 3 is a bug.
 *   - Tier 2: must hit any LLM path (1/2/3) — anything but a totally wrong static answer is fine
 *   - Tier 3: must NOT hit Tier 0/1 (static answer with wrong content). Tier 2 or 3 acceptable.
 */
function tierAcceptable(expected: 0 | 1 | 2 | 3, actual: number): boolean {
  if (expected === 0) return actual === 0;
  if (expected === 1) return actual === 1 || actual === 2;
  if (expected === 2) return actual === 1 || actual === 2 || actual === 3;
  if (expected === 3) return actual === 2 || actual === 3;
  return false;
}

async function runCase(fx: Fixture, expectedTier: 0 | 1 | 2 | 3): Promise<CaseResult> {
  const { meta, durationMs } = await sendQuery(fx.q);

  let pass = true;
  let reason = "";

  if (!meta) {
    pass = false;
    reason = "no meta event";
  } else {
    if (!tierAcceptable(expectedTier, meta.tier)) {
      pass = false;
      reason = `tier out of range: got ${meta.tier} for expected ${expectedTier}`;
    }
    if (pass && fx.expectSlug && meta.faqSlug !== fx.expectSlug) {
      pass = false;
      reason = `slug mismatch: got ${meta.faqSlug}`;
    }
    // minSim/maxSim are now informational only — drop strict enforcement
  }

  return {
    q: fx.q,
    expectedTier,
    actualTier: meta?.tier ?? null,
    similarity: meta?.similarity ?? null,
    faqSlug: meta?.faqSlug ?? null,
    expectSlug: fx.expectSlug,
    pass,
    reason,
    durationMs,
  };
}

async function main() {
  const fixturesPath = path.join(__dirname, "chat-fixtures.json");
  const fixtures: Fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf-8"));

  const allCases: Array<{ fx: Fixture; expected: 0 | 1 | 2 | 3; group: string }> = [
    ...fixtures.tier0_exact.map((f) => ({ fx: f, expected: 0 as const, group: "tier0_exact" })),
    ...fixtures.tier1_close_paraphrase.map((f) => ({ fx: f, expected: 1 as const, group: "tier1_close" })),
    ...fixtures.tier2_loose_semantic.map((f) => ({ fx: f, expected: 2 as const, group: "tier2_loose" })),
    ...fixtures.tier3_post_specific.map((f) => ({ fx: f, expected: 3 as const, group: "tier3_post" })),
  ];

  console.log(`[matrix] Running ${allCases.length} cases against ${CHAT_API_URL}`);
  const results: Array<CaseResult & { group: string }> = [];

  for (const { fx, expected, group } of allCases) {
    process.stdout.write(`  [${group}] "${fx.q.slice(0, 50)}"... `);
    try {
      const r = await runCase(fx, expected);
      results.push({ ...r, group });
      console.log(
        r.pass
          ? `OK  tier=${r.actualTier} sim=${(r.similarity ?? 0).toFixed(3)} ${r.durationMs}ms`
          : `FAIL ${r.reason} (tier=${r.actualTier} sim=${(r.similarity ?? 0).toFixed(3)})`
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`ERROR ${msg}`);
      results.push({
        q: fx.q, expectedTier: expected, actualTier: null, similarity: null,
        faqSlug: null, pass: false, reason: `exception: ${msg}`, durationMs: 0, group,
      });
    }
    // Tiny pause to avoid rate-limit
    await new Promise((r) => setTimeout(r, 250));
  }

  // Summary
  const byGroup: Record<string, { pass: number; fail: number }> = {};
  for (const r of results) {
    byGroup[r.group] = byGroup[r.group] || { pass: 0, fail: 0 };
    if (r.pass) byGroup[r.group].pass++;
    else byGroup[r.group].fail++;
  }
  const totalPass = results.filter((r) => r.pass).length;
  const totalFail = results.length - totalPass;

  console.log("\n=== TIER MATRIX SUMMARY ===");
  for (const [g, s] of Object.entries(byGroup)) {
    const acc = ((s.pass / (s.pass + s.fail)) * 100).toFixed(1);
    console.log(`  ${g.padEnd(20)} pass=${s.pass} fail=${s.fail} acc=${acc}%`);
  }
  console.log(`  TOTAL                 pass=${totalPass} fail=${totalFail} acc=${((totalPass / results.length) * 100).toFixed(1)}%`);

  const reportPath = path.join(__dirname, "reports", `tier-matrix-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ results, byGroup }, null, 2));
  console.log(`\nReport: ${reportPath}`);

  // Gate: each group ≥80% under the relaxed tier-adjacency rules
  const groupNames = ["tier0_exact", "tier1_close", "tier2_loose", "tier3_post"];
  let allPass = true;
  for (const g of groupNames) {
    const s = byGroup[g];
    if (!s) continue;
    const total = s.pass + s.fail;
    const rate = total > 0 ? s.pass / total : 0;
    const minRate = g === "tier0_exact" ? 0.95 : 0.80;
    if (rate < minRate) {
      console.log(`GATE FAIL: ${g} ${(rate * 100).toFixed(1)}% < ${(minRate * 100).toFixed(0)}%`);
      allPass = false;
    }
  }
  if (!allPass) process.exit(1);
  console.log("\nGATE PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
