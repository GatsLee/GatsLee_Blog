"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

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

  const promptUser = nameSet ? name : "guest";

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-fadeIn">
      <div className="bg-[#22223a]/30 border border-[#2e2e4a] rounded-lg p-3 flex items-center justify-between mb-4">
        <span className="text-xs text-[#8888a0] font-mono flex items-center">
          <span className="w-2 h-2 bg-[#d4a054] rounded-full mr-2 animate-pulse" />
          {promptUser}@gats-lab:~ {t("guest.interactive")}
        </span>
        {nameSet && (
          <span className="text-[10px] text-[#5a5a72] font-mono">
            {t("guest.namechange")}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 bg-[#1a1a2e] border border-[#2e2e4a] rounded-lg p-6 font-mono text-sm overflow-y-auto min-h-[500px] flex flex-col"
      >
        <div className="space-y-4 mb-6 flex-1">
          <div className="text-[#8888a0] mb-8 text-xs border-b border-[#2e2e4a] pb-4">
            {t("guest.system")}
            <br />
            Last login: {new Date().toDateString()} from unknown IP
            <br />
            {t("guest.welcome")}
            <br />
            <span className="text-[#5a5a72]">
              {t("guest.ratelimit")}
            </span>
          </div>

          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group mb-4 pl-2 border-l-2 border-transparent hover:border-[#3a3a52] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline mb-1">
                <span className="font-bold text-[#d4a054] mr-3 shrink-0 text-xs">
                  [{entry.author}]:
                </span>
                <span className="text-[#b0b0bc] font-light">
                  {entry.message}
                </span>
              </div>
              <div className="text-[10px] text-[#5a5a72] hidden group-hover:block">
                timestamp:{" "}
                {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                  hour12: false,
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-[#e05555] text-xs font-mono mb-2 px-2">
            ERROR: {error}
          </div>
        )}

        {!nameSet ? (
          <form
            onSubmit={handleNameSubmit}
            className="mt-4 border-t border-[#2e2e4a] pt-4 bg-[#1a1a2e] sticky bottom-0"
          >
            <div className="text-[#8888a0] text-xs mb-2">
              {t("guest.nameprompt")}
            </div>
            <div className="flex items-center">
              <span className="text-[#d4a054] font-bold mr-3 whitespace-nowrap">
                set_name:
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={20}
                className="flex-1 bg-transparent border-none outline-none text-[#d4d4dc] placeholder-[#3a3a52] focus:ring-0 font-light caret-[#d4a054]"
                placeholder="your_name"
                autoFocus
              />
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleMessageSubmit}
            className="flex items-center mt-4 border-t border-[#2e2e4a] pt-4 bg-[#1a1a2e] sticky bottom-0"
          >
            <span className="text-[#d4a054] font-bold mr-3 whitespace-nowrap animate-pulse">
              {name}@gats-lab:~$
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#d4d4dc] placeholder-[#3a3a52] focus:ring-0 font-light caret-[#d4a054]"
              placeholder="echo 'Hello World'"
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
}
