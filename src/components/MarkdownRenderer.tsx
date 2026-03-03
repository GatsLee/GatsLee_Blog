"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef } from "react";
import type { Components } from "react-markdown";

// Highlight.js theme (works well in both light and dark)
import "highlight.js/styles/github-dark.css";

// ---- Mermaid diagram block ----
function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    import("mermaid").then((m) => {
      if (cancelled) return;
      m.default.initialize({ startOnLoad: false, theme: "dark" });
      m.default.render(id, code).then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      }).catch(() => {
        if (!cancelled && ref.current) {
          ref.current.textContent = "⚠ Mermaid parse error";
        }
      });
    });
    return () => { cancelled = true; };
  }, [code]);
  return <div ref={ref} className="my-6 overflow-x-auto flex justify-center bg-[#1a1a2e] rounded-lg p-4" />;
}

// ---- YouTube / Vimeo embed helper ----
function getVideoEmbed(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// ---- Custom components ----
const components: Components = {
  // Code block
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const lang = match?.[1];
    const code = String(children).replace(/\n$/, "");

    if (lang === "mermaid") return <MermaidBlock code={code} />;

    // Inline code
    if (!match) {
      return (
        <code
          className="bg-[#1a1a2e] px-1.5 py-0.5 rounded text-[#5ab896] text-[0.85em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Fenced code block — rehype-highlight adds hljs classes
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Pre wrapper for code blocks
  pre({ children }) {
    return (
      <pre className="my-5 rounded-lg overflow-x-auto border border-[#2e2e4a] text-sm">
        {children}
      </pre>
    );
  },

  // Paragraph — detect lone video URL
  p({ children }) {
    const text = typeof children === "string" ? children : "";
    const embed = text ? getVideoEmbed(text.trim()) : null;
    if (embed) {
      return (
        <div className="my-6 aspect-video">
          <iframe
            src={embed}
            className="w-full h-full rounded-lg card-border"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
    return <p className="my-3 leading-7 text-foreground">{children}</p>;
  },

  // Links
  a({ href, children }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
      >
        {children}
      </a>
    );
  },

  // Images
  img({ src, alt }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className="max-w-full h-auto rounded-lg card-border my-4"
      />
    );
  },

  // Headings
  h1({ children }) {
    return <h1 className="text-2xl font-bold text-foreground mt-8 mb-4 tracking-tight" style={{ fontFamily: "Archivo, sans-serif" }}>{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xl font-bold text-foreground mt-6 mb-3 tracking-tight" style={{ fontFamily: "Archivo, sans-serif" }}>{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-lg font-semibold text-foreground mt-5 mb-2" style={{ fontFamily: "Archivo, sans-serif" }}>{children}</h3>;
  },

  // Bold / italic
  strong({ children }) {
    return <strong className="font-bold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-secondary">{children}</em>;
  },

  // Lists
  ul({ children }) {
    return <ul className="my-3 ml-5 space-y-1 list-disc text-foreground">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-3 ml-5 space-y-1 list-decimal text-foreground">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-foreground leading-7">{children}</li>;
  },

  // Blockquote
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-accent pl-4 my-4 italic text-secondary">
        {children}
      </blockquote>
    );
  },

  // Horizontal rule
  hr() {
    return <hr className="border-border my-6" />;
  },

  // Tables (remark-gfm)
  table({ children }) {
    return (
      <div className="overflow-x-auto my-5">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-hover border-b border-border">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-border">{children}</tbody>;
  },
  tr({ children }) {
    return <tr className="hover:bg-hover/50 transition-colors">{children}</tr>;
  },
  th({ children }) {
    return <th className="text-left px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider">{children}</th>;
  },
  td({ children }) {
    return <td className="px-4 py-2 text-foreground">{children}</td>;
  },

  // Task list item (remark-gfm)
  input({ checked }) {
    return (
      <input
        type="checkbox"
        checked={checked ?? false}
        readOnly
        className="mr-2 accent-accent"
      />
    );
  },
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body text-base leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
