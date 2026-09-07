"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, ChevronDown } from "lucide-react";

interface SkillItem {
  name: string;
  desc: string;
  link: string;
}

interface SkillCategory {
  name: string;
  items: SkillItem[];
}

interface ProjectItem {
  name: string;
  desc: string;
  highlights: string[];
  tags: string[];
  link: string;
}

interface AgentItem {
  name: string;
  summary: string;
  detail: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface JourneyItem {
  num: string;
  title: string;
  desc: string;
  sub: string;
}

interface AboutData {
  heroLabel: string;
  slogan: string;
  sloganSub: string;
  journey: JourneyItem[];
  skills: { title: string; categories: SkillCategory[] };
  projects: { title: string; items: ProjectItem[] };
  agents: { title: string; subtitle: string; items: AgentItem[] };
  stats: { title: string; items: StatItem[] };
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-surface cursor-pointer">
        <span className="font-heading text-sm font-bold">{title}</span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
}

function Input({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="editorial-label text-muted block mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground rounded focus:border-foreground outline-none" />
      )}
    </div>
  );
}

const DEFAULT_DATA: AboutData = {
  heroLabel: "",
  slogan: "",
  sloganSub: "",
  journey: [],
  skills: { title: "", categories: [] },
  projects: { title: "", items: [] },
  agents: { title: "", subtitle: "", items: [] },
  stats: { title: "", items: [] },
};

export default function AboutEditorTab() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");
  const [data, setData] = useState<AboutData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = async (loc: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/about?locale=${loc}`);
      const json = await res.json();
      if (json.data) {
        setData({ ...DEFAULT_DATA, ...json.data });
      } else {
        setData(DEFAULT_DATA);
      }
    } catch {
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(locale); }, [locale]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const update = (path: string, value: any) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  if (loading) return <div className="text-muted text-sm py-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["ko", "en"] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-3 py-1.5 text-xs font-mono border cursor-pointer ${locale === loc ? "border-foreground text-foreground" : "border-border text-muted"}`}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-mono disabled:opacity-50 cursor-pointer"
        >
          <Save size={14} />
          {saved ? "Saved!" : saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Hero */}
      <Section title="Hero">
        <Input label="Label" value={data.heroLabel} onChange={(v) => update("heroLabel", v)} />
        <Input label="Slogan (줄바꿈: \\n)" value={data.slogan} onChange={(v) => update("slogan", v)} />
        <Input label="Sub text" value={data.sloganSub} onChange={(v) => update("sloganSub", v)} />
      </Section>

      {/* Journey */}
      <Section title="Journey">
        {data.journey.map((item, i) => (
          <div key={i} className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="editorial-label text-muted">#{item.num}</span>
              <button onClick={() => update("journey", data.journey.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
            </div>
            <Input label="Title" value={item.title} onChange={(v) => { const j = [...data.journey]; j[i] = { ...j[i], title: v }; update("journey", j); }} />
            <Input label="Description" value={item.desc} onChange={(v) => { const j = [...data.journey]; j[i] = { ...j[i], desc: v }; update("journey", j); }} />
            <Input label="Sub (keywords)" value={item.sub} onChange={(v) => { const j = [...data.journey]; j[i] = { ...j[i], sub: v }; update("journey", j); }} />
          </div>
        ))}
        <button onClick={() => update("journey", [...data.journey, { num: String(data.journey.length + 1).padStart(2, "0"), title: "", desc: "", sub: "" }])} className="flex items-center gap-1 text-sm text-muted hover:text-foreground cursor-pointer">
          <Plus size={14} /> Add Journey
        </button>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <Input label="Section Title" value={data.skills.title} onChange={(v) => update("skills.title", v)} />
        {data.skills.categories.map((cat, ci) => (
          <div key={ci} className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Input label="Category" value={cat.name} onChange={(v) => {
                const cats = [...data.skills.categories];
                cats[ci] = { ...cats[ci], name: v };
                update("skills.categories", cats);
              }} />
              <button onClick={() => update("skills.categories", data.skills.categories.filter((_, j) => j !== ci))} className="text-muted hover:text-red-500 cursor-pointer ml-2"><Trash2 size={14} /></button>
            </div>
            {cat.items.map((skill, si) => (
              <div key={si} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input value={skill.name} onChange={(e) => {
                    const cats = JSON.parse(JSON.stringify(data.skills.categories));
                    cats[ci].items[si].name = e.target.value;
                    update("skills.categories", cats);
                  }} placeholder="Skill name" className="w-full bg-background border border-border px-2 py-1 text-xs text-foreground rounded outline-none" />
                  <input value={skill.desc} onChange={(e) => {
                    const cats = JSON.parse(JSON.stringify(data.skills.categories));
                    cats[ci].items[si].desc = e.target.value;
                    update("skills.categories", cats);
                  }} placeholder="Description" className="w-full bg-background border border-border px-2 py-1 text-xs text-muted rounded outline-none" />
                  <input value={skill.link} onChange={(e) => {
                    const cats = JSON.parse(JSON.stringify(data.skills.categories));
                    cats[ci].items[si].link = e.target.value;
                    update("skills.categories", cats);
                  }} placeholder="Link (optional)" className="w-full bg-background border border-border px-2 py-1 text-xs text-muted rounded outline-none" />
                </div>
                <button onClick={() => {
                  const cats = JSON.parse(JSON.stringify(data.skills.categories));
                  cats[ci].items.splice(si, 1);
                  update("skills.categories", cats);
                }} className="text-muted hover:text-red-500 cursor-pointer mt-1"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => {
              const cats = JSON.parse(JSON.stringify(data.skills.categories));
              cats[ci].items.push({ name: "", desc: "", link: "" });
              update("skills.categories", cats);
            }} className="text-xs text-muted hover:text-foreground cursor-pointer flex items-center gap-1"><Plus size={12} /> Add Skill</button>
          </div>
        ))}
        <button onClick={() => update("skills.categories", [...data.skills.categories, { name: "", items: [] }])} className="flex items-center gap-1 text-sm text-muted hover:text-foreground cursor-pointer">
          <Plus size={14} /> Add Category
        </button>
      </Section>

      {/* Projects */}
      <Section title="Projects">
        <Input label="Section Title" value={data.projects.title} onChange={(v) => update("projects.title", v)} />
        {data.projects.items.map((proj, i) => (
          <div key={i} className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="editorial-label text-muted">Project {i + 1}</span>
              <button onClick={() => update("projects.items", data.projects.items.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
            </div>
            <Input label="Name" value={proj.name} onChange={(v) => { const p = JSON.parse(JSON.stringify(data.projects.items)); p[i].name = v; update("projects.items", p); }} />
            <Input label="Description" value={proj.desc} onChange={(v) => { const p = JSON.parse(JSON.stringify(data.projects.items)); p[i].desc = v; update("projects.items", p); }} />
            <Input label="Link" value={proj.link} onChange={(v) => { const p = JSON.parse(JSON.stringify(data.projects.items)); p[i].link = v; update("projects.items", p); }} />
            <Input label="Highlights (comma-separated)" value={proj.highlights.join(", ")} onChange={(v) => { const p = JSON.parse(JSON.stringify(data.projects.items)); p[i].highlights = v.split(",").map((s: string) => s.trim()).filter(Boolean); update("projects.items", p); }} />
            <Input label="Tags (comma-separated)" value={proj.tags.join(", ")} onChange={(v) => { const p = JSON.parse(JSON.stringify(data.projects.items)); p[i].tags = v.split(",").map((s: string) => s.trim()).filter(Boolean); update("projects.items", p); }} />
          </div>
        ))}
        <button onClick={() => update("projects.items", [...data.projects.items, { name: "", desc: "", highlights: [], tags: [], link: "" }])} className="flex items-center gap-1 text-sm text-muted hover:text-foreground cursor-pointer">
          <Plus size={14} /> Add Project
        </button>
      </Section>

      {/* Agents */}
      <Section title="Agents">
        <Input label="Section Title" value={data.agents.title} onChange={(v) => update("agents.title", v)} />
        <Input label="Subtitle" value={data.agents.subtitle} onChange={(v) => update("agents.subtitle", v)} />
        {data.agents.items.map((agent, i) => (
          <div key={i} className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="editorial-label text-muted">Agent {i + 1}</span>
              <button onClick={() => update("agents.items", data.agents.items.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
            </div>
            <Input label="Name" value={agent.name} onChange={(v) => { const a = JSON.parse(JSON.stringify(data.agents.items)); a[i].name = v; update("agents.items", a); }} />
            <Input label="Summary" value={agent.summary} onChange={(v) => { const a = JSON.parse(JSON.stringify(data.agents.items)); a[i].summary = v; update("agents.items", a); }} />
            <Input label="Detail" value={agent.detail} onChange={(v) => { const a = JSON.parse(JSON.stringify(data.agents.items)); a[i].detail = v; update("agents.items", a); }} multiline />
          </div>
        ))}
        <button onClick={() => update("agents.items", [...data.agents.items, { name: "", summary: "", detail: "" }])} className="flex items-center gap-1 text-sm text-muted hover:text-foreground cursor-pointer">
          <Plus size={14} /> Add Agent
        </button>
      </Section>

      {/* Stats */}
      <Section title="Stats">
        <Input label="Section Title" value={data.stats.title} onChange={(v) => update("stats.title", v)} />
        {data.stats.items.map((stat, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={stat.value} onChange={(e) => { const s = [...data.stats.items]; s[i] = { ...s[i], value: e.target.value }; update("stats.items", s); }} placeholder="Value" className="w-24 bg-background border border-border px-2 py-1 text-sm text-foreground rounded outline-none" />
            <input value={stat.label} onChange={(e) => { const s = [...data.stats.items]; s[i] = { ...s[i], label: e.target.value }; update("stats.items", s); }} placeholder="Label" className="flex-1 bg-background border border-border px-2 py-1 text-sm text-foreground rounded outline-none" />
            <button onClick={() => update("stats.items", data.stats.items.filter((_, j) => j !== i))} className="text-muted hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={() => update("stats.items", [...data.stats.items, { value: "", label: "" }])} className="flex items-center gap-1 text-sm text-muted hover:text-foreground cursor-pointer">
          <Plus size={14} /> Add Stat
        </button>
      </Section>
    </div>
  );
}
