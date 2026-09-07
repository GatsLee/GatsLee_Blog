/**
 * Single source of truth for post categories and their routes.
 *
 * Previously each of rag.ts / write / write-edit / BuildProgress / sitemap / feed
 * kept its own ROUTE_MAP, and they had drifted apart (one mapped "blueprint" to a
 * /blueprint route that never existed). Import from here instead.
 */

export const CATEGORIES = ["journal", "product", "agent", "build", "case"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ROUTE: Record<Category, string> = {
  journal: "/insights",
  product: "/products",
  agent: "/products",
  build: "/insights",
  case: "/cases",
};

/** Human labels for admin/editor dropdowns. */
export const CATEGORY_LABEL: Record<Category, { ko: string; en: string }> = {
  journal: { ko: "저널", en: "Journal" },
  product: { ko: "프로덕트", en: "Product" },
  agent: { ko: "에이전트", en: "Agent" },
  build: { ko: "빌드 로그", en: "Build Log" },
  case: { ko: "케이스 스터디", en: "Case Study" },
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** Full path to a post's detail page. Unknown categories fall back to /insights. */
export function routeFor(category: string, slug: string): string {
  const base = isCategory(category) ? CATEGORY_ROUTE[category] : "/insights";
  return `${base}/${slug}`;
}
