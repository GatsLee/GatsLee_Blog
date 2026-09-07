"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface GuestEntry {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

function timeAgo(date: string, locale: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === "ko" ? "방금 전" : "just now";
  if (mins < 60) return locale === "ko" ? `${mins}분 전` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "ko" ? `${hours}시간 전` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return locale === "ko" ? `${days}일 전` : `${days}d ago`;
  return new Date(date).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" });
}

export default function ConnectPage() {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [newEntryId, setNewEntryId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useLanguage();

  useEffect(() => {
    const savedName = localStorage.getItem("guestbook-name");
    if (savedName) setName(savedName);
  }, []);

  useEffect(() => {
    fetch("/api/guestbook").then((r) => r.json()).then(setEntries).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().slice(0, 20);
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;
    setError("");

    // Save name
    localStorage.setItem("guestbook-name", trimmedName);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: trimmedName, message: trimmedMessage }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error || "Rate limit exceeded.");
        return;
      }

      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [...prev, entry]);
        setMessage("");
        setNewEntryId(entry.id);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setTimeout(() => setNewEntryId(null), 600);
      }
    } catch {
      setError("CONNECTION ERROR");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 animate-fadeIn">
      {/* Toast */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="bg-foreground text-background px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
          <Check size={16} />
          {t.connect.messageSent}
        </div>
      </div>

      {/* Header */}
      <section className="mb-10">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground font-extrabold tracking-tight mb-3">
          {t.connect.title}
        </h1>
        <p className="text-secondary text-base leading-relaxed max-w-xl font-light">
          {t.connect.heroText}
        </p>
      </section>

      {/* Guestbook */}
      <section className="border border-border overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="overflow-y-auto p-6 md:p-8 space-y-0 divide-y divide-border" style={{ height: "60vh", minHeight: "400px", maxHeight: "600px" }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`py-5 first:pt-0 last:pb-0 transition-all duration-300 ${entry.id === newEntryId ? "animate-slideIn" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar initial */}
                <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-foreground">{entry.author.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-heading text-sm font-bold text-foreground">{entry.author}</span>
                    <time className="text-[11px] text-muted font-mono">{timeAgo(entry.createdAt, locale)}</time>
                  </div>
                  <p className="text-secondary text-sm leading-relaxed">{entry.message}</p>
                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted">
              <MessageSquare size={40} strokeWidth={1} className="mb-3 opacity-20" />
              <p className="text-sm">{t.connect.empty}</p>
            </div>
          )}
        </div>

        {/* Input — name + message inline */}
        <div className="border-t border-border bg-surface p-4">
          {error && (
            <div className="mb-3 px-3 py-2 border border-red-500/30 text-sm text-red-500 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-24 sm:w-32 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors"
              placeholder={t.connect.namePlaceholder}
              autoComplete="name"
            />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors"
              placeholder={t.connect.placeholder}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!name.trim() || !message.trim()}
              className="p-2.5 bg-foreground text-background rounded-lg hover:opacity-80 disabled:opacity-30 transition-opacity cursor-pointer"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
