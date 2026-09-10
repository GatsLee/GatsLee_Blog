import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  STAGE_LABEL,
  TYPE_LABEL,
  parseStrings,
  productStage,
  productType,
  type ProductType,
} from "@/lib/product";

const TYPES: ProductType[] = ["app", "web", "agent"];

function isType(value: string | undefined): value is ProductType {
  return value === "app" || value === "web" || value === "agent";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const active = isType(type) ? type : null;

  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const counts = TYPES.map((t) => ({
    type: t,
    count: products.filter((p) => productType(p.type) === t).length,
  }));
  const shown = active ? products.filter((p) => productType(p.type) === active) : products;

  const chips: { key: ProductType | null; label: string; count: number }[] = [
    { key: null, label: "전체", count: products.length },
    ...counts.map((c) => ({ key: c.type, label: TYPE_LABEL[c.type], count: c.count })),
  ];

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto px-6 py-16">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home size={14} strokeWidth={1.5} />
          <span>홈</span>
        </Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span className="text-foreground font-medium">프로덕트</span>
      </div>

      <h1
        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        프로덕트
      </h1>
      <p className="text-sm text-muted">
        {products.length}개 · {counts.map((c) => `${TYPE_LABEL[c.type]} ${c.count}`).join(" · ")}
      </p>

      <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-border">
        {chips.map((chip) => {
          const on = chip.key === active;
          return (
            <Link
              key={chip.label}
              href={chip.key ? `/products?type=${chip.key}` : "/products"}
              className={`editorial-label px-3 py-2 rounded-md border transition-colors ${
                on
                  ? "bg-foreground text-background border-foreground"
                  : "card-border text-muted hover:text-foreground"
              }`}
            >
              {chip.label} <span className="ml-1 opacity-60">{chip.count}</span>
            </Link>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="py-24 text-center text-muted">아직 등록된 프로덕트가 없습니다.</p>
      ) : (
        <div className="mt-16 space-y-20">
          {shown.map((product) => {
            const summary = parseStrings(product.summary);
            const stack = parseStrings(product.stack);
            return (
              <article key={product.id}>
                {product.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-full rounded-lg card-border mb-6"
                    loading="lazy"
                  />
                )}

                <div className="flex items-center gap-3 mb-3">
                  <span className="editorial-label text-brand">
                    {STAGE_LABEL[productStage(product.stage)]}
                  </span>
                  {product.stamp && (
                    <span className="editorial-label text-brand border border-brand rounded px-2 py-1 text-[10px]">
                      {product.stamp}
                    </span>
                  )}
                </div>

                <h2
                  className="text-2xl font-bold text-foreground tracking-tight mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {product.name}
                </h2>
                {product.tagline && (
                  <p className="text-sm text-secondary leading-relaxed">{product.tagline}</p>
                )}

                {summary.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {summary.map((line, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                        <span className="text-muted shrink-0" aria-hidden>
                          —
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {stack.map((item) => (
                      <span
                        key={item}
                        className="text-xs font-mono text-muted bg-surface card-border rounded px-2 py-1"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-brand hover:gap-3 transition-all"
                >
                  자세히 보기 <span aria-hidden>→</span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
