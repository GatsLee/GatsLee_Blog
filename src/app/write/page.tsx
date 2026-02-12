"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Calendar, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Import markdown editor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("devlog");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();
  const { t } = useLanguage();

  // Set current date on mount
  useEffect(() => {
    const now = new Date();
    const formatted = now.toISOString().split('T')[0] + ' ' +
                      now.toTimeString().split(' ')[0];
    setCurrentDate(formatted);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages((prev) => [...prev, base64]);
        // Insert markdown image syntax at cursor
        const imageMarkdown = `\n![${file.name}](${base64})\n`;
        setContent((prev) => prev + imageMarkdown);
      };
      reader.readAsDataURL(file);
    });
  };

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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl text-[#d4d4dc] font-bold flex items-center tracking-tight">
          <Save className="mr-2" size={20} /> {t("write.title")}
        </h2>
        <div className="flex items-center gap-2 text-[#8888a0] text-xs font-mono">
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>
      </div>

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
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs text-[#8888a0] font-mono uppercase">
              {t("write.content")} - Markdown Editor
            </label>
            {/* Image Upload - Show for devlog and progress categories */}
            {(category === "devlog" || category === "progress") && (
              <label className="flex items-center gap-1 text-xs text-[#8888a0] hover:text-[#d4a054] cursor-pointer transition-colors">
                <ImageIcon size={14} />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* WYSIWYG Markdown Editor */}
          <div data-color-mode="dark">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={400}
              preview="live"
              hideToolbar={false}
              enableScroll={true}
              visibleDragbar={false}
              style={{
                backgroundColor: "#1a1a2e",
                border: "1px solid #2e2e4a",
                borderRadius: "0.5rem",
              }}
            />
          </div>
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
