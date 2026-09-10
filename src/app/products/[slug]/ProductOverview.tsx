import { ExternalLink, Github, Globe } from "lucide-react";
import ProductBackLink from "./ProductBackLink";
import {
  STAGE_LABEL,
  TYPE_LABEL,
  periodText,
  roleText,
  type ProductLink,
  type ProductStage,
  type ProductType,
} from "@/lib/product";

/** 메타 4칸. 값이 없는 칸은 아예 빼지 않고 자리를 남긴다 — 4칸 격자가 무너지면 읽기 어렵다. */
function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="editorial-label text-brand mb-2">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value || "—"}</p>
    </div>
  );
}

function LinkButton({ link, primary }: { link: ProductLink; primary: boolean }) {
  const isGithub = /github/i.test(link.label) || /github\.com/i.test(link.url);
  const Icon = isGithub ? Github : /demo|live|site|app|사이트/i.test(link.label) ? Globe : ExternalLink;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-md transition-colors ${
        primary
          ? "bg-foreground text-background hover:opacity-85"
          : "card-border text-foreground hover:bg-hover"
      }`}
    >
      <Icon size={15} />
      {link.label}
    </a>
  );
}

export default function ProductOverview({
  name,
  tagline,
  type,
  stage,
  stamp,
  periodStart,
  periodEnd,
  ongoing,
  roles,
  headcount,
  useCase,
  audience,
  coverImage,
  links,
}: {
  name: string;
  tagline: string;
  type: ProductType;
  stage: ProductStage;
  stamp: string;
  periodStart: string;
  periodEnd: string;
  ongoing: boolean;
  roles: string[];
  headcount: number;
  useCase: string;
  audience: string;
  coverImage: string;
  links: ProductLink[];
}) {
  return (
    <section className="mb-20">
      <ProductBackLink />

      <div className="flex items-center gap-3 mt-8 mb-4">
        <span className="editorial-label text-brand">{STAGE_LABEL[stage]}</span>
        {stamp && (
          <span className="editorial-label text-brand border border-brand rounded px-2 py-1 text-[10px]">
            {stamp}
          </span>
        )}
      </div>

      <h1
        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {name}
      </h1>
      {tagline && <p className="text-base text-secondary leading-relaxed max-w-2xl">{tagline}</p>}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-8">
          {links.map((link, i) => (
            <LinkButton key={`${link.url}-${i}`} link={link} primary={i === links.length - 1} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mt-12 pt-10 border-t border-border">
        <MetaCell label="기간" value={periodText(periodStart, periodEnd, ongoing)} />
        <MetaCell label="역할" value={roleText(roles, headcount)} />
        <MetaCell label="유형" value={useCase || TYPE_LABEL[type]} />
        <MetaCell label="타겟" value={audience} />
      </div>

      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage}
          alt={name}
          className="w-full rounded-lg card-border mt-12"
          loading="lazy"
        />
      )}
    </section>
  );
}
