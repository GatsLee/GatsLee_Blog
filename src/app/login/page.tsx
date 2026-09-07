"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type ToastType = "success" | "error" | null;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: null, message: "" });
  const router = useRouter();
  const { theme } = useTheme();
  const pawnSrc = theme === "dark" ? "/white_pawn.ico" : "/black_pawn.ico";

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const authToken = cookies.find((c) => c.trim().startsWith("auth-token="));
    if (authToken) router.push("/");
  }, [router]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: null, message: "" }), 3000);
  };

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
      const data = await res.json();

      if (res.ok) {
        showToast("success", "Login successful!");
        setTimeout(() => { router.push("/"); router.refresh(); }, 1000);
      } else {
        const msg = data.error || "Invalid credentials";
        setError(msg);
        showToast("error", msg);
      }
    } catch {
      setError("Connection error");
      showToast("error", "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image src={pawnSrc} alt="GATS LAB" width={32} height={32} className="mb-4" />
          <span className="font-mono font-bold text-sm tracking-tight text-foreground">GATS_LAB</span>
        </div>

        {/* Form */}
        <div className="border border-border p-8">
          <h1 className="editorial-label text-muted mb-6 text-center">Admin Authentication</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="editorial-label text-muted block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground font-mono focus:border-foreground outline-none transition-colors placeholder:text-muted"
                placeholder="admin"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="editorial-label text-muted block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground font-mono focus:border-foreground outline-none transition-colors placeholder:text-muted"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-3 text-sm font-mono uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </form>
        </div>

        {/* Toast */}
        {toast.type && (
          <div
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 border shadow-lg z-50 animate-fadeIn ${
              toast.type === "success"
                ? "border-green-500 text-green-500 bg-background"
                : "border-red-500 text-red-500 bg-background"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-sm font-mono">{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
