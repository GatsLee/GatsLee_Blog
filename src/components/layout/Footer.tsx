"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TOPICS } from "@/lib/topics";
import TopicIcon from "@/components/common/TopicIcon";

export type FooterProject = { name: string; slug: string };

function openChat() {
  window.dispatchEvent(new Event("gats:open-chat"));
}

export default function Footer({ projects }: { projects: FooterProject[] }) {
  return (
    <footer className="w-full">
      <div className="checker-boundary" aria-hidden />
      <div className="bg-brand-soft">
        <div className="mx-auto flex max-w-[1184px] flex-col gap-4 px-6 pb-10 pt-4">
          <div className="flex flex-col gap-12 md:flex-row md:items-center md:gap-20">
            <div className="md:w-[440px]">
              <Image src="/images/avatar.png" alt="" width={125} height={125} className="-ml-2" />
              <p className="mt-1 text-[32px] font-bold leading-tight text-foreground">Gats Blog</p>
              <p className="mt-3 text-[15px] text-foreground">사용자의 관점에서 서비스를 기획하는 이준열입니다.</p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
              <div className="flex flex-col gap-2.5">
                <p className="mono-label">Topics</p>
                {TOPICS.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/insights?topic=${t.slug}`}
                    className="flex items-center gap-3 py-0.5 text-[15px] font-medium text-foreground hover:text-brand"
                  >
                    <span className="text-brand">
                      <TopicIcon slug={t.slug} />
                    </span>
                    {t.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-[18px]">
                <p className="mono-label">Projects</p>
                {projects.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="text-[15px] text-foreground hover:text-brand">
                    {p.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-[18px]">
                <p className="mono-label">More</p>
                <Link href="/insights" className="text-[15px] text-foreground hover:text-brand">
                  글 전체 보기
                </Link>
                <a
                  href="/resume"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[15px] text-foreground hover:text-brand"
                >
                  이력서 <ArrowUpRight size={14} className="text-brand" />
                </a>
                <button type="button" onClick={openChat} className="text-left text-[15px] text-foreground hover:text-brand">
                  AI에게 질문하기
                </button>
              </div>
            </div>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-secondary">
            © {new Date().getFullYear()} Gats Lee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
