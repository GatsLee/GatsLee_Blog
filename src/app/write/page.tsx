"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NotionEditor from "@/components/editor/NotionEditor";

export default function WritePage() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (data: { title: string; category: string; content: string }) => {
    if (!data.title.trim() || !data.content.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          content: data.content
        }),
      });

      if (res.ok) {
        const post = await res.json();
        router.push(`/devlogs/${post.slug}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  return <NotionEditor onSave={handleSave} saving={saving} />;
}
