"use client";

import { GitCommit, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { GitCommit as GitCommitData } from "@/lib/github";

interface BuildProgressProps {
  commits: GitCommitData[];
  repoName: string;
  pinnedTitle?: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BuildProgress({ commits, repoName, pinnedTitle }: BuildProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-surface card-border rounded-lg p-6 transition-colors h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <GitCommit className="text-accent" size={16} strokeWidth={1.5} />
          <h3
            className="text-xs uppercase tracking-[0.2em] text-muted font-semibold"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            {t.home.buildProgress}
          </h3>
        </div>
        {repoName && (
          <a
            href={`https://github.com/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted hover:text-accent transition-colors font-mono"
          >
            {repoName.split("/")[1]}
            <ExternalLink size={10} strokeWidth={1.5} />
          </a>
        )}
      </div>

      {pinnedTitle && (
        <p className="text-xs text-secondary mb-3 truncate">{pinnedTitle}</p>
      )}

      {/* Commit list */}
      <div className="space-y-2 overflow-y-auto max-h-52">
        {commits.length === 0 ? (
          <p className="text-xs text-muted font-mono">
            {repoName ? "No commits found." : "No project pinned yet."}
          </p>
        ) : (
          commits.map((c) => (
            <a
              key={c.sha}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 py-1.5 group"
            >
              <span className="text-[10px] font-mono text-accent shrink-0 mt-0.5 group-hover:underline">
                {c.sha}
              </span>
              <span className="text-xs text-foreground font-mono truncate flex-1 group-hover:text-accent transition-colors">
                {c.message}
              </span>
              <span className="text-[10px] text-muted font-mono shrink-0">
                {relativeTime(c.date)}
              </span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
