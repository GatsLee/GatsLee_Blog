/**
 * Post(category: product|agent) → Product 이관.
 *
 * 프로덕트를 Post의 카테고리 값으로 다루던 구조를 독립 엔티티로 옮긴다.
 * 값이 없는 필드는 빈 채로 둔다 — 관리자 화면에서 채우는 것이 전제다.
 *
 * 두 번 돌려도 안전하다(slug upsert). 실행: npx tsx scripts/migrate-products.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** slug → 프로덕트 타입. 데이터에 타입 칸이 없어서 여기서 정한다. */
const TYPE: Record<string, "app" | "web" | "agent"> = {
  a41: "web",
  calyx: "app",
  bookear: "app",
  "aiops-agent": "agent",
  "blog-agent": "agent",
  "orchestrator-agent": "agent",
};

/** tags 첫 원소로 쓰이던 상태 토큰 → stage/stamp */
const STAGE: Record<string, { stage: string; stamp: string }> = {
  planning: { stage: "planning", stamp: "기획 중" },
  developing: { stage: "building", stamp: "개발 중" },
  deployed: { stage: "operating", stamp: "배포됨" },
};

/** 포스트를 프로덕트에 묶을 때 쓰는 태그. 소문자 비교. */
const POST_TAG: Record<string, string[]> = {
  a41: ["a41"],
  calyx: ["calyx"],
  bookear: ["bookear"],
  "aiops-agent": ["aiops"],
  "blog-agent": ["blog agent"],
  "orchestrator-agent": ["orchestrator"],
};

const parseJson = <T,>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

async function main() {
  const sources = await prisma.post.findMany({
    where: { category: { in: ["product", "agent"] } },
    orderBy: { id: "asc" },
  });

  const created: string[] = [];
  for (const [i, p] of sources.entries()) {
    const tags = parseJson<string[]>(p.tags, []);
    const statusToken = tags.find((t) => t.toLowerCase() in STAGE)?.toLowerCase();
    const { stage, stamp } = STAGE[statusToken ?? ""] ?? { stage: "planning", stamp: "" };
    // 상태 토큰은 stage로 갔으니 스택 칩에서는 뺀다
    const stack = tags.filter((t) => !(t.toLowerCase() in STAGE));

    const data = {
      name: p.title,
      tagline: p.description ?? "",
      type: TYPE[p.slug] ?? "app",
      stage,
      stamp,
      audience: p.targetAudience ?? "",
      problemBody: p.purpose ?? "",
      // 기대 효과는 목록 카드의 요점 한 줄로 옮긴다. 없는 값은 만들지 않는다.
      summary: JSON.stringify(p.expectedEffect ? [p.expectedEffect] : []),
      stack: JSON.stringify(stack),
      links: p.externalLinks ?? "[]",
      coverImage: p.coverImage ?? "",
      published: true,
      sortOrder: i,
    };

    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...data },
      update: data,
    });
    created.push(p.slug);
  }

  // 남은 포스트를 태그로 프로덕트에 붙인다. 안 걸리는 것은 관리자에서 손으로 붙인다.
  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  const posts = await prisma.post.findMany({
    where: { category: { in: ["journal", "build"] } },
    select: { id: true, tags: true, title: true },
  });

  let linked = 0;
  for (const post of posts) {
    const tags = parseJson<string[]>(post.tags, []).map((t) => t.toLowerCase());
    const hit = products.find((prod) =>
      (POST_TAG[prod.slug] ?? []).some((needle) => tags.some((t) => t.includes(needle)))
    );
    if (!hit) continue;
    await prisma.post.update({ where: { id: post.id }, data: { productId: hit.id } });
    linked++;
  }

  // 원본 포스트는 지우지 않고 내린다. PostChunk가 postId로 걸려 있어 지우면 RAG 검색이 조용히 깨진다.
  const hidden = await prisma.post.updateMany({
    where: { category: { in: ["product", "agent"] } },
    data: { published: false },
  });

  console.log(JSON.stringify({ products: created, linkedPosts: linked, hiddenPosts: hidden.count }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
