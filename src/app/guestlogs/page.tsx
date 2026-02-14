"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MessageSquare, User } from "lucide-react";

interface GuestEntry {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

export default function GuestLogsPage() {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Load saved name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("guestbook-name");
    if (savedName) {
      setName(savedName);
      setNameSet(true);
    }
  }, []);

  // Fetch entries
  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [entries]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const trimmed = input.trim().slice(0, 20);
    setName(trimmed);
    setNameSet(true);
    localStorage.setItem("guestbook-name", trimmed);
    setInput("");
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");

    if (input.trim().startsWith("/name ")) {
      const newName = input.trim().slice(6).slice(0, 20);
      if (newName) {
        setName(newName);
        localStorage.setItem("guestbook-name", newName);
        setInput("");
        return;
      }
    }

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: name, message: input }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error || t("guest.ratelimit.error"));
        return;
      }

      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [...prev, entry]);
        setInput("");
      }
    } catch {
      setError(t("guest.connection.error"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="mb-12">
        <h1
          className="text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight"
          style={{ fontFamily: 'Archivo, sans-serif' }}
        >
          Guest Book
        </h1>
        <p className="text-muted text-sm">
          {nameSet ? `Signed in as ${name}` : "Set your name to leave a message"} • Type "/name [newname]" to change your name
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col bg-surface border border-border rounded overflow-hidden">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6"
        >
          {/* Welcome Message */}
          <div className="border-l-2 border-accent pl-6 py-4 bg-hover/50">
            <p className="text-xs uppercase tracking-wider text-muted mb-2 font-medium">
              Welcome
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              {t("guest.welcome")}
            </p>
            <p className="text-xs text-muted mt-2">
              {t("guest.ratelimit")}
            </p>
          </div>

          {/* Guest Entries */}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group border-l-2 border-transparent hover:border-accent pl-6 py-3 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-hover text-muted">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-foreground text-sm">
                      {entry.author}
                    </span>
                    <time className="text-xs text-muted">
                      {new Date(entry.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
              </div>
              <p className="text-secondary leading-relaxed pl-10">
                {entry.message}
              </p>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-12 text-muted">
              <MessageSquare size={48} strokeWidth={1} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">No messages yet. Be the first to leave a note!</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!nameSet ? (
            <form onSubmit={handleNameSubmit} className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {t("guest.nameprompt")}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={20}
                  className="flex-1 px-4 py-3 bg-surface border border-border rounded text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Your name"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-foreground text-background font-medium rounded hover:bg-primary transition-all cursor-pointer"
                >
                  Set Name
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMessageSubmit} className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User size={16} strokeWidth={1.5} />
                {name}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-surface border border-border rounded text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Leave a message..."
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent text-white font-medium rounded hover:bg-accent/90 transition-all cursor-pointer"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
