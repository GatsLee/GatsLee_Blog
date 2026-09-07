"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef, useState, useMemo, isValidElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Highlight.js theme (works well in both light and dark)
import "highlight.js/styles/github-dark.css";

// ---- Mermaid diagram block ----
function MermaidBlock({ code, theme }: { code: string; theme: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    import("mermaid").then((m) => {
      if (cancelled) return;
      m.default.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default" });
      m.default.render(id, code).then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      }).catch(() => {
        if (!cancelled && ref.current) {
          ref.current.textContent = "⚠ Mermaid parse error";
        }
      });
    });
    return () => { cancelled = true; };
  }, [code, theme]);
  return <div ref={ref} className="my-6 overflow-x-auto flex justify-center bg-surface rounded-lg p-4 card-border" />;
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

// ---- Copy button for code blocks ----
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono text-muted hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded hover:bg-hover"
      aria-label="Copy code"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ---- Generate slug from text for heading IDs ----
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ---- Extract text content from React children ----
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node) && node.props) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

// ---- Build custom components (theme-aware) ----
function buildComponents(theme: string): Components {
  return {
  // Code block
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const lang = match?.[1];
    const code = String(children).replace(/\n$/, "");

    if (lang === "mermaid") return <MermaidBlock code={code} theme={theme} />;

    // Inline code
    if (!match) {
      return (
        <code
          className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded text-[0.85em] font-mono"
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

  // Pre wrapper for code blocks — with language label + copy button
  pre({ children }) {
    // Extract language from child <code> className
    let lang = "";
    if (isValidElement(children)) {
      const cls = (children.props as { className?: string }).className ?? "";
      const m = /language-(\w+)/.exec(cls);
      if (m) lang = m[1];
    }
    const codeText = extractText(children);

    return (
      <div className="relative my-5 rounded-lg border border-border overflow-hidden">
        {/* Header bar with language label + copy */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-hover/50 border-b border-border">
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            {lang || "code"}
          </span>
          <CopyButton code={codeText} />
        </div>
        <pre className="overflow-x-auto text-sm p-0 m-0">
          {children}
        </pre>
      </div>
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
    return <p className="my-3 leading-7 text-foreground max-w-prose">{children}</p>;
  },

  // Links
  a({ href, children }) {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-accent underline underline-offset-2 decoration-1 hover:decoration-2 hover:text-accent/80 transition-all"
      >
        {children}
        {isExternal && (
          <ArrowUpRight size={11} className="inline ml-0.5 -translate-y-px" />
        )}
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
        sizes="(max-width: 768px) 100vw, 65ch"
        className="max-w-full h-auto rounded-lg card-border my-4"
      />
    );
  },

  // Headings — with id for TOC anchoring
  h1({ children }) {
    const id = slugify(extractText(children));
    return <h1 id={id} className="text-2xl font-bold text-foreground mt-8 mb-4 tracking-tight scroll-mt-24 font-heading">{children}</h1>;
  },
  h2({ children }) {
    const id = slugify(extractText(children));
    return <h2 id={id} className="text-xl font-bold text-foreground mt-6 mb-3 tracking-tight scroll-mt-24 font-heading">{children}</h2>;
  },
  h3({ children }) {
    const id = slugify(extractText(children));
    return <h3 id={id} className="text-lg font-semibold text-foreground mt-5 mb-2 scroll-mt-24 font-heading">{children}</h3>;
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
    return <ul className="my-3 ml-5 space-y-1 list-disc text-foreground max-w-prose">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-3 ml-5 space-y-1 list-decimal text-foreground max-w-prose">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-foreground leading-7">{children}</li>;
  },

  // Blockquote
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-accent pl-4 my-4 italic text-secondary max-w-prose">
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
      <div className="relative overflow-x-auto my-5 group/tbl">
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
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const components = useMemo(() => buildComponents(theme), [theme]);

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
