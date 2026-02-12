"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type ToastType = "success" | "error" | "info" | null;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({
    type: null,
    message: "",
  });
  const router = useRouter();
  const { t } = useLanguage();

  // Check if user is already logged in and redirect immediately
  useEffect(() => {
    const checkAuth = () => {
      // Check for auth-token cookie
      const cookies = document.cookie.split(';');
      const authToken = cookies.find(cookie => cookie.trim().startsWith('auth-token='));

      if (authToken) {
        // Immediately redirect to home instead of showing modal
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: null, message: "" });
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[CLIENT] Login form submitted");
    setError("");
    setLoading(true);

    try {
      console.log("[CLIENT] Sending login request to /api/auth/login");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("[CLIENT] Response status:", res.status);
      const data = await res.json();
      console.log("[CLIENT] Response data:", data);

      if (res.ok) {
        console.log("[CLIENT] Login successful!");
        showToast("success", "Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      } else {
        const errorMessage = data.error || t("login.denied");
        console.log("[CLIENT] Login failed:", errorMessage);
        setError(errorMessage);
        showToast("error", errorMessage);
      }
    } catch (err) {
      console.error("[CLIENT] Login error:", err);
      const errorMessage = t("error.connection");
      setError(errorMessage);
      showToast("error", errorMessage);
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
              placeholder="admin"
              autoFocus
              required
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
              required
            />
          </div>

          {error && (
            <p className="text-[#e05555] text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4a054] hover:bg-[#c49544] text-[#1a1a2e] font-bold py-3 text-sm transition-colors uppercase tracking-wider rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? t("login.loading") : t("login.submit")}
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      {toast.type && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slideInRight ${
            toast.type === "success"
              ? "bg-[#1a2e2a] border-[#5ab896] text-[#5ab896]"
              : "bg-[#2e1a1a] border-[#e05555] text-[#e05555]"
          }`}
          style={{
            animation: "slideInRight 0.3s ease-out",
            zIndex: 9999,
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span className="text-sm font-mono">{toast.message}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
