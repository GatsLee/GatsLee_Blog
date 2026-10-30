"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChessPawn } from "lucide-react";

// IA_AD_006 로그인 · IA_AD_00601 로그인 실패
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(res.status === 429 ? "로그인 시도가 너무 많아요. 잠시 뒤 다시 시도해 주세요." : "아이디 또는 비밀번호가 맞지 않아요.");
    } catch {
      setError("서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const field = `h-11 w-full rounded-[10px] border bg-background px-3.5 text-sm text-foreground outline-none focus:border-brand ${
    error ? "border-danger" : "border-border"
  }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-[420px] flex-col gap-5 rounded-3xl border border-border bg-background px-9 py-10">
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand text-white">
            <ChessPawn size={18} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-foreground">GATS BLOG</span>
            <span className="block text-[10px] font-medium tracking-wide text-secondary">ADMIN</span>
          </span>
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-8 text-foreground">관리자 로그인</h1>
          <p className="mt-1 text-[13px] text-secondary">글과 프로젝트, 챗봇을 관리합니다.</p>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-foreground">아이디</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-foreground">비밀번호</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={field} />
          {error && (
            <span role="alert" className="text-xs text-danger">
              {error}
            </span>
          )}
        </label>
        <button type="submit" disabled={loading} className="h-11 rounded-[10px] bg-brand text-sm font-bold text-white disabled:opacity-60">
          {loading ? "확인 중…" : "로그인"}
        </button>
        <Link href="/" className="text-center text-[13px] font-medium text-secondary hover:text-foreground">
          블로그로 돌아가기
        </Link>
      </form>
    </main>
  );
}
