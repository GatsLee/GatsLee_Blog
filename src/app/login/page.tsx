"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/write");
        router.refresh();
      } else {
        setError(t("login.denied"));
      }
    } catch {
      setError(t("error.connection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 animate-fadeIn">
      <div className="bg-[#22223a] border border-[#2e2e4a] rounded-lg p-8">
        <div className="flex items-center text-[#d4d4dc] mb-8">
          <Terminal className="mr-2" size={20} />
          <h1 className="text-lg font-bold tracking-wider">
            {t("login.title")}
          </h1>
        </div>

        <div className="text-xs text-[#8888a0] font-mono mb-6 border-b border-[#2e2e4a] pb-4">
          {t("login.command")}
          <br />
          {t("login.desc")}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
              {t("login.username")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#d4d4dc] focus:border-[#d4a054] focus:outline-none transition-colors placeholder-[#3a3a52] font-mono"
              placeholder="root"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
              {t("login.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#d4d4dc] focus:border-[#d4a054] focus:outline-none transition-colors placeholder-[#3a3a52] font-mono"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[#e05555] text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4a054] hover:bg-[#c49544] text-[#1a1a2e] font-bold py-3 text-sm transition-colors uppercase tracking-wider rounded disabled:opacity-50"
          >
            {loading ? t("login.loading") : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
