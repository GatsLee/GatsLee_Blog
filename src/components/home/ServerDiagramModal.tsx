"use client";

import { X } from "lucide-react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ── Shared node data ───────────────────────────────────────────────────────
const SERVICES = {
  internet:      { label: "Internet",            desc: "Public Traffic"          },
  npm:           { label: "NGINX Proxy Manager", desc: "Reverse Proxy · Gateway" },
  blog:          { label: "Blog",                desc: "Next.js · Prisma SQLite" },
  ollama:        { label: "Ollama",              desc: "GPU · LLM Inference"     },
  n8n:           { label: "n8n",                 desc: "Workflow Automation"      },
  mariadb:       { label: "MariaDB",             desc: "Shared Database"         },
  nodeExporter:  { label: "Node Exporter",       desc: "Host Metrics"            },
  prometheus:    { label: "Prometheus",           desc: "Metrics Collection"      },
  grafana:       { label: "Grafana",             desc: "Dashboard"               },
  portainer:     { label: "Portainer",           desc: "Container Management"    },
};

const LEGEND = [
  { label: "proxy-net",     color: "border-blue-500/40 bg-blue-500/10 text-blue-500"    },
  { label: "blog-internal", color: "border-green-500/40 bg-green-500/10 text-green-500" },
  { label: "infra-net",     color: "border-amber-500/40 bg-amber-500/10 text-amber-500" },
];

// ── Mobile: CSS tree layout ────────────────────────────────────────────────
function MobileCard({
  label, desc, highlight = false,
}: { label: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${highlight ? "border-foreground/50 bg-foreground/5" : "border-border bg-background"}`}>
      <p className="font-mono text-xs font-semibold text-foreground leading-tight">{label}</p>
      <p className="text-[10px] text-muted mt-0.5 leading-tight">{desc}</p>
    </div>
  );
}

function Arrow({ dir = "down" }: { dir?: "down" | "right" }) {
  return (
    <span className={`text-muted text-xs font-light flex ${dir === "right" ? "items-center" : "justify-center"}`}>
      {dir === "right" ? "→" : "↓"}
    </span>
  );
}

function MobileDiagram() {
  const s = SERVICES;
  return (
    <div className="p-4 space-y-2 overflow-y-auto max-h-[55vh]">
      {/* Gateway */}
      <MobileCard {...s.internet} />
      <Arrow />
      <MobileCard {...s.npm} highlight />
      <Arrow />

      {/* Blog + n8n side by side */}
      <div className="grid grid-cols-2 gap-2">
        <MobileCard {...s.blog} />
        <MobileCard {...s.n8n} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Arrow />
        <Arrow />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MobileCard {...s.ollama} />
        <MobileCard {...s.mariadb} />
      </div>

      {/* Monitoring */}
      <div className="pt-3 mt-1 border-t border-border">
        <p className="editorial-label text-muted text-[9px] mb-2">MONITORING</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex-1 min-w-0"><MobileCard {...s.nodeExporter} /></div>
          <Arrow dir="right" />
          <div className="flex-1 min-w-0"><MobileCard {...s.prometheus} /></div>
          <Arrow dir="right" />
          <div className="flex-1 min-w-0"><MobileCard {...s.grafana} /></div>
        </div>
      </div>

      {/* Management */}
      <div className="pt-3 border-t border-border">
        <p className="editorial-label text-muted text-[9px] mb-2">MANAGEMENT</p>
        <div className="w-1/2"><MobileCard {...s.portainer} /></div>
      </div>
    </div>
  );
}

// ── Desktop: ReactFlow diagram ─────────────────────────────────────────────
function ServiceNode({ data }: { data: { label: string; desc: string } }) {
  const handle = { opacity: 0, pointerEvents: "none" as const, width: 8, height: 8 };
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5 min-w-[118px] text-center shadow-sm">
      <Handle id="top"    type="target" position={Position.Top}    style={handle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handle} />
      <Handle id="left"   type="target" position={Position.Left}   style={handle} />
      <Handle id="right"  type="source" position={Position.Right}  style={handle} />
      <p className="font-mono text-[11px] font-semibold text-foreground leading-tight">{data.label}</p>
      <p className="text-[9px] text-muted mt-0.5 leading-tight">{data.desc}</p>
    </div>
  );
}

const nodeTypes: NodeTypes = { service: ServiceNode };

const NODES = [
  { id: "internet",      type: "service", position: { x: 250, y: 0   }, data: SERVICES.internet      },
  { id: "npm",           type: "service", position: { x: 205, y: 100 }, data: SERVICES.npm           },
  { id: "blog",          type: "service", position: { x: 55,  y: 215 }, data: SERVICES.blog          },
  { id: "ollama",        type: "service", position: { x: 55,  y: 325 }, data: SERVICES.ollama        },
  { id: "n8n",           type: "service", position: { x: 440, y: 215 }, data: SERVICES.n8n           },
  { id: "mariadb",       type: "service", position: { x: 440, y: 325 }, data: SERVICES.mariadb       },
  { id: "node-exporter", type: "service", position: { x: 0,   y: 435 }, data: SERVICES.nodeExporter  },
  { id: "prometheus",    type: "service", position: { x: 180, y: 435 }, data: SERVICES.prometheus    },
  { id: "grafana",       type: "service", position: { x: 350, y: 435 }, data: SERVICES.grafana       },
  { id: "portainer",     type: "service", position: { x: 505, y: 435 }, data: SERVICES.portainer     },
];

const EDGE_STYLE = { stroke: "var(--color-border)", strokeWidth: 1.5 };

const EDGES = [
  { id: "e1", source: "internet",      target: "npm",        type: "smoothstep", style: EDGE_STYLE },
  { id: "e2", source: "npm",           target: "blog",       type: "smoothstep", style: EDGE_STYLE },
  { id: "e3", source: "npm",           target: "n8n",        type: "smoothstep", style: EDGE_STYLE },
  { id: "e4", source: "blog",          target: "ollama",     type: "smoothstep", style: EDGE_STYLE },
  { id: "e5", source: "n8n",           target: "mariadb",    type: "smoothstep", style: EDGE_STYLE },
  { id: "e6", source: "node-exporter", target: "prometheus", type: "smoothstep", style: EDGE_STYLE, sourceHandle: "right", targetHandle: "left" },
  { id: "e7", source: "prometheus",    target: "grafana",    type: "smoothstep", style: EDGE_STYLE, sourceHandle: "right", targetHandle: "left" },
];

function DesktopDiagram() {
  return (
    <div className="border border-border rounded-xl overflow-hidden" style={{ height: 540 }}>
      <ReactFlow
        nodes={NODES}
        edges={EDGES}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
      </ReactFlow>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface Props { onClose: () => void }

export default function ServerDiagramModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-3xl mx-4 border border-border rounded-2xl p-5 md:p-8 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--color-background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div>
            <span className="editorial-label text-muted block mb-1">INFRASTRUCTURE</span>
            <h3 className="font-heading text-lg md:text-2xl font-extrabold tracking-tight">
              Home Server Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer shrink-0 ml-4"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-secondary leading-relaxed font-light mb-4 md:mb-6">
          Ubuntu 기반 자가호스팅 서버. Docker Compose로 3개의 독립 네트워크를 운영하며,
          NGINX Proxy Manager가 공개 HTTPS 트래픽을 처리한다.
          Ollama가 NVIDIA GPU를 통해 로컬 LLM 추론을 담당한다.
        </p>

        {/* Mobile diagram */}
        <div className="md:hidden border border-border rounded-xl overflow-hidden">
          <MobileDiagram />
        </div>

        {/* Desktop diagram */}
        <div className="hidden md:block">
          <DesktopDiagram />
        </div>

        {/* Network legend */}
        <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
          {LEGEND.map(({ label, color }) => (
            <span key={label} className={`editorial-label text-[10px] px-2 py-1 rounded-md border ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
