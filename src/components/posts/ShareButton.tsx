"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors cursor-pointer active:scale-95"
      aria-label={t.post.share ?? "Share"}
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Share2 size={14} strokeWidth={1.5} />}
      <span>{copied ? (t.post.copied ?? "Copied!") : (t.post.share ?? "Share")}</span>
    </button>
  );
}
