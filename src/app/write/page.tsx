"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("devlog");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content }),
      });

      if (res.ok) {
        const post = await res.json();
        router.push(`/devlogs/${post.slug}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || t("write.error"));
      }
    } catch {
      setError(t("error.connection"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn w-full">
      <h2 className="text-xl text-[#d4d4dc] mb-8 font-bold flex items-center tracking-tight">
        <Save className="mr-2" size={20} /> {t("write.title")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#22223a] border border-[#2e2e4a] rounded-lg p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
              {t("write.filename")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#d4d4dc] focus:border-[#d4a054] focus:outline-none transition-colors placeholder-[#3a3a52]"
              placeholder="e.g. protocol_v1.log"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
              {t("write.category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-[#2e2e4a] rounded p-3 text-[#d4d4dc] focus:border-[#d4a054] focus:outline-none transition-colors"
            >
              <option value="devlog">{t("write.devlog")}</option>
              <option value="troubleshooting">{t("write.troubleshooting")}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#8888a0] mb-2 font-mono uppercase">
            {t("write.content")}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 bg-[#1a1a2e] border border-[#2e2e4a] rounded p-4 text-[#b0b0bc] focus:border-[#d4a054] focus:outline-none transition-colors font-mono leading-relaxed placeholder-[#3a3a52]"
            placeholder="Begin writing protocol..."
          />
        </div>

        {error && (
          <p className="text-[#e05555] text-xs font-mono">{error}</p>
        )}

        <div className="flex justify-end pt-4 border-t border-[#2e2e4a]">
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="bg-[#d4a054] hover:bg-[#c49544] text-[#1a1a2e] font-bold py-3 px-8 text-sm transition-colors flex items-center uppercase tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} className="mr-2" />{" "}
            {saving ? t("write.saving") : t("write.commit")}
          </button>
        </div>
      </form>
    </div>
  );
}
