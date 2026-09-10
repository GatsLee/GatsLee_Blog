/**
 * Single source of truth for post categories and their routes.
 *
 * Previously each of rag.ts / write / write-edit / sitemap / feed kept its own
 * ROUTE_MAP, and they had drifted apart. Import from here instead.
 *
 * 2026-09-10: 프로덕트가 Post의 카테고리 값에서 독립 엔티티(`Product`)로 나갔고,
 * 케이스 스터디는 글이 0건이라 IA에서 뺐다. 남은 것은 포스트 두 종류뿐이다.
 */

export const CATEGORIES = ["journal", "build"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ROUTE: Record<Category, string> = {
  journal: "/insights",
  build: "/insights",
};

/** Human labels for admin/editor dropdowns. */
export const CATEGORY_LABEL: Record<Category, { ko: string; en: string }> = {
  journal: { ko: "저널", en: "Journal" },
  build: { ko: "빌드 로그", en: "Build Log" },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** Full path to a post's detail page. Unknown categories fall back to /insights. */
export function routeFor(category: string, slug: string): string {
  const base = isCategory(category) ? CATEGORY_ROUTE[category] : "/insights";
  return `${base}/${slug}`;
}
