import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Figma, FileText, Github } from "lucide-react";
import { prisma } from "@/lib/db";
import { routeFor } from "@/lib/categories";
import { getSession } from "@/lib/auth";
import {
  FEATURE_SECTION,
  TYPE_LABEL,
  parseEvidence,
  parseFeatures,
  parseDetail,
  parseLinks,
  parseStrings,
  periodText,
  productType,
  type ProductLink,
} from "@/lib/product";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeroGallery from "./HeroGallery";
import ProjectComments from "./ProjectComments";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, tagline: true, problemBody: true, published: true } });
  if (!product || !product.published) return {};
  const description = product.tagline || product.problemBody.slice(0, 160).replace(/\n/g, " ");
  return { title: product.name, description, openGraph: { title: product.name, description, type: "article" } };
}

// 디자인은 GitHub · Figma · Notion 아이콘 버튼 최대 3개
function linkIcon(link: ProductLink) {
  const s = `${link.label} ${link.url}`;
  if (/github/i.test(s)) return Github;
  if (/figma/i.test(s)) return Figma;
  if (/notion/i.test(s)) return FileText;
  return ExternalLink;
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-[28px] font-bold leading-[42px] text-foreground">
      {children}
    </h2>
  );
}

// IA_PD_002 프로젝트 상세
export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true, locale: "ko" },
        orderBy: { createdAt: "desc" },
        select: { title: true, slug: true, category: true },
      },
    },
  });
  // 비공개 프로젝트는 관리자 미리보기에서만 연다
  if (!product || (!product.published && !(await getSession()))) notFound();

  const type = productType(product.type);
  const summary = parseStrings(product.summary);
  const features = parseFeatures(product.features);
  const evidence = parseEvidence(product.evidence);
  const links = parseLinks(product.links).slice(0, 3);
  const detail = parseDetail(product.detail);
  const images = detail.gallery?.length ? detail.gallery : [product.coverImage, ...features.flatMap((f) => f.shots ?? [])].filter(Boolean);
  const problem = { summary: detail.problem?.summary ?? "", body: detail.problem?.body || product.problemBody };
  const hypothesis = detail.hypothesis ?? {};
  const decisions = detail.decisions ?? [];
  const audiences = detail.audiences?.length ? detail.audiences : product.audience ? [{ who: "", gain: product.audience }] : [];
  const label = [TYPE_LABEL[type], product.useCase].filter(Boolean).join(" · ");
  const period = periodText(product.periodStart, product.periodEnd, product.ongoing);
  const hasProblem = Boolean(problem.summary || problem.body || hypothesis.summary || evidence.quote || evidence.numbers?.length);
  const hasFeatures = features.length > 0 || Boolean(product.flowEmbedUrl);

  const toc = [
    hasProblem && { id: "problem", label: "문제와 가설" },
    hasFeatures && { id: "features", label: "핵심 기능(화면)" },
    decisions.length > 0 && { id: "decisions", label: "핵심 결정" },
    product.posts.length > 0 && { id: "posts", label: "관련 글" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="mx-auto max-w-[1184px] px-6 pb-20">
      <section className="flex flex-col gap-7 pb-12 pt-14">
        <div className="flex min-h-11 items-center justify-between gap-4">
          <Breadcrumb items={[{ label: "프로젝트", href: "/products" }, { label: product.name }]} />
          {links.length > 0 && (
            <div className="flex gap-3">
              {links.map((link) => {
                const Icon = linkIcon(link);
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground hover:bg-brand-soft"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <HeroGallery images={images} alt={`${product.name} 화면`} />

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-sm font-medium leading-[22px] text-brand">
              {label}
              {product.stamp && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold">{product.stamp}</span>}
            </p>
            <h1 className="whitespace-pre-line text-[32px] font-bold leading-[46px] text-foreground md:text-[40px] md:leading-[58px]">
              {detail.headline || product.tagline || product.name}
            </h1>
            {(detail.intro || summary.length > 0) && <p className="whitespace-pre-line text-lg leading-[30px] text-secondary">{detail.intro || summary.join(" ")}</p>}
            {period && <p className="text-sm text-secondary">기간 {period}</p>}
          </div>
          {audiences.length > 0 && (
            <aside className="flex flex-col gap-4 self-start rounded-xl bg-surface p-6 lg:w-[376px]">
              <p className="text-[21px] font-bold leading-8 text-foreground">주요 사용자</p>
              {audiences.map((a, i) => (
                <div key={i} className={`flex flex-col gap-3 ${i > 0 ? "border-t border-border pt-4" : ""}`}>
                  {a.who && <p className="text-sm font-medium text-brand">{a.who}</p>}
                  <p className="whitespace-pre-line text-sm leading-[23px] text-foreground">{a.gain}</p>
                </div>
              ))}
            </aside>
          )}
        </div>
      </section>

      <div className="flex gap-12">
        {toc.length > 1 && (
          <nav aria-label="목차" className="sticky top-24 hidden w-[176px] shrink-0 flex-col gap-5 self-start xl:flex">
            <p className="text-sm font-bold text-foreground">목차</p>
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`} className="text-sm text-secondary hover:text-brand">
                {t.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex min-w-0 max-w-[960px] flex-1 flex-col gap-16">
          {hasProblem && (
            <section className="flex flex-col gap-6">
              <SectionTitle id="problem">문제와 가설</SectionTitle>
              {(problem.summary || problem.body) && (
                <div className="max-w-[720px] rounded-xl bg-surface p-6">
                  <p className="text-sm font-medium leading-[22px] text-brand">문제 정의</p>
                  {problem.summary && <p className="mt-3 text-[21px] font-bold leading-8 text-foreground">{problem.summary}</p>}
                  {problem.body && <p className={`${problem.summary ? "mt-2 text-secondary" : "mt-3 text-foreground"} whitespace-pre-line text-base leading-[26px]`}>{problem.body}</p>}
                </div>
              )}
              {hypothesis.summary && (
                <div className="max-w-[720px] rounded-xl bg-surface p-6">
                  <p className="text-sm font-medium leading-[22px] text-brand">가설</p>
                  <p className="mt-3 text-[21px] font-bold leading-8 text-foreground">{hypothesis.summary}</p>
                  {hypothesis.body && <p className="mt-2 whitespace-pre-line text-base leading-[26px] text-secondary">{hypothesis.body}</p>}
                  {hypothesis.metrics && hypothesis.metrics.length > 0 && (
                    <p className="mt-4 text-sm text-secondary">확인할 지표 · {hypothesis.metrics.join(" / ")}</p>
                  )}
                </div>
              )}
              {(evidence.quote || evidence.numbers?.length) && (
                <div className="max-w-[720px] rounded-xl bg-surface p-6">
                  <p className="text-sm font-medium leading-[22px] text-brand">{evidence.label || "근거"}</p>
                  {evidence.quote && <p className="mt-3 text-[21px] font-bold leading-8 text-foreground">{evidence.quote}</p>}
                  {evidence.source && <p className="mt-2 text-sm text-secondary">{evidence.source}</p>}
                  {evidence.numbers && evidence.numbers.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-8">
                      {evidence.numbers.map((n) => (
                        <div key={n.label}>
                          <p className="text-[28px] font-bold text-brand">{n.value}</p>
                          <p className="text-sm text-secondary">{n.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {evidence.note && <p className="mt-4 text-sm text-secondary">{evidence.note}</p>}
                </div>
              )}
            </section>
          )}

          {hasFeatures && (
            <section className="flex flex-col gap-10">
              <SectionTitle id="features">핵심 기능(화면)</SectionTitle>
              {features.map((f, i) => (
                <div key={f.label} className="relative flex max-w-[720px] flex-col gap-3">
                  <p className="text-[21px] font-bold leading-8 text-foreground">
                    {f.label}
                    {f.sub && <sup className="ml-0.5 text-xs text-brand">{i + 1})</sup>}
                  </p>
                  {/* 각주는 넓은 화면에서 오른쪽 여백, 좁으면 제목 아래 */}
                  {f.sub && (
                    <p className="text-sm leading-[22px] text-secondary 2xl:absolute 2xl:left-[calc(100%+40px)] 2xl:top-1 2xl:w-[200px]">
                      <span className="mr-1 text-brand">{i + 1})</span>
                      {f.sub}
                    </p>
                  )}
                  {f.body && <p className="whitespace-pre-line text-base leading-[26px] text-secondary">{f.body}</p>}
                  {f.shots?.map((src) => (
                    <div key={src} className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface">
                      <Image src={src} alt={f.label} fill sizes="720px" className="object-cover" />
                    </div>
                  ))}
                </div>
              ))}
              {product.flowEmbedUrl && FEATURE_SECTION[type] && (
                <iframe
                  src={product.flowEmbedUrl}
                  title={`${product.name} 서비스 흐름`}
                  className="aspect-video w-full max-w-[720px] rounded-xl border border-border"
                  allowFullScreen
                />
              )}
            </section>
          )}

          {decisions.length > 0 && (
            <section className="flex max-w-[720px] flex-col gap-6">
              <SectionTitle id="decisions">핵심 결정</SectionTitle>
              {decisions.map((x) => (
                <div key={x.title} className="flex flex-col gap-4 rounded-xl border border-border p-6">
                  <p className="text-[21px] font-bold leading-8 text-foreground">{x.title}</p>
                  {x.body && <p className="whitespace-pre-line text-base leading-[26px] text-secondary">{x.body}</p>}
                  {(x.why || x.so) && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {x.why && (
                        <div>
                          <p className="text-sm font-medium text-brand">왜?</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-[22px] text-foreground">{x.why}</p>
                        </div>
                      )}
                      {x.so && (
                        <div>
                          <p className="text-sm font-medium text-secondary">그래서?</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-[22px] text-secondary">{x.so}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {product.posts.length > 0 && (
            <section className="flex max-w-[720px] flex-col gap-4">
              <SectionTitle id="posts">관련 글</SectionTitle>
              <ul>
                {product.posts.map((p) => (
                  <li key={p.slug} className="border-t border-border">
                    <Link href={routeFor(p.category, p.slug)} className="flex items-center justify-between gap-4 py-4 text-lg font-bold text-foreground hover:text-brand">
                      {p.title}
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="max-w-[720px]">
            <ProjectComments productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
