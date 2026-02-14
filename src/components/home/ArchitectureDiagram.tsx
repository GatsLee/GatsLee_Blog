"use client";

import { useEffect, useRef, useState } from "react";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type DiagramType = "full" | "blog" | "gatsai" | "infrastructure";

// Theme-aware diagram definitions will be generated dynamically
const getDiagramDefinition = (type: DiagramType, isDark: boolean): string => {
  const colors = isDark ? {
    bg: '#18181B',
    surface: '#27272A',
    border: '#3F3F46',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    accent: '#3B82F6',
    node: '#27272A',
    nodeBorder: '#3F3F46',
  } : {
    bg: '#FFFFFF',
    surface: '#F4F4F5',
    border: '#E4E4E7',
    text: '#09090B',
    textMuted: '#71717A',
    accent: '#2563EB',
    node: '#FFFFFF',
    nodeBorder: '#E4E4E7',
  };

  const classDefBase = `
classDef default fill:${colors.node},stroke:${colors.nodeBorder},stroke-width:1.5px,color:${colors.text}
classDef external fill:${colors.surface},stroke:${colors.accent},stroke-width:2px,color:${colors.text}
classDef gateway fill:${colors.node},stroke:${colors.accent},stroke-width:2px,color:${colors.text}
classDef app fill:${colors.node},stroke:${colors.nodeBorder},stroke-width:1.5px,color:${colors.text}
classDef agent fill:${colors.node},stroke:${colors.accent},stroke-width:2px,color:${colors.text}
classDef ai_engine fill:${colors.surface},stroke:${colors.accent},stroke-width:2px,color:${colors.text}
classDef infra fill:${colors.node},stroke:${colors.nodeBorder},stroke-width:1px,color:${colors.textMuted}
classDef db fill:${colors.node},stroke:${colors.nodeBorder},stroke-width:1.5px,color:${colors.text}
classDef monitor fill:${colors.node},stroke:${colors.accent},stroke-width:1.5px,color:${colors.text}
classDef tool fill:${colors.node},stroke:${colors.nodeBorder},stroke-width:1.5px,color:${colors.text}`;

  const diagrams: Record<DiagramType, string> = {
    full: `graph LR
  User((User)):::external

  subgraph Home_Server ["Home Server"]
    NPM[/"Nginx Proxy Manager"/]:::gateway
    BlogApp["Blog"]:::app
    Portfolio["Portfolio"]:::app
    GatsAI["Gats AI Agent"]:::agent

    Portainer["Portainer"]:::infra
    Prometheus["Prometheus"]:::infra
    Grafana["Grafana"]:::infra
  end

  subgraph Mac_Studio ["Mac Studio"]
    LLM_Engine["LLM Engine (vLLM)"]:::ai_engine
  end

  User ==> NPM
  NPM --> BlogApp
  NPM --> Portfolio
  BlogApp <--> GatsAI
  GatsAI <== "API" ==> LLM_Engine

  Prometheus -.-> Grafana

${classDefBase}`,

    blog: `graph TB
  User((User)):::external

  subgraph Blog_Stack ["Blog Architecture"]
    NPM[/"Nginx Proxy Manager"/]:::gateway
    NextJS["Next.js 16"]:::app
    API["API Routes"]:::app
    Prisma["Prisma ORM"]:::db
    SQLite["SQLite"]:::db
  end

  User --> NPM
  NPM --> NextJS
  NextJS --> API
  API --> Prisma
  Prisma --> SQLite

${classDefBase}`,

    gatsai: `graph LR
  User((User)):::external

  subgraph AI_System ["Gats AI System"]
    GatsAI["Gats AI Agent"]:::agent
    TaskQueue["Task Queue"]:::agent

    vLLM["vLLM Server"]:::ai_engine
    Qwen["Qwen 2.5"]:::ai_engine

    WebScraper["Web Scraper"]:::tool
    CodeGen["Code Generator"]:::tool
  end

  User <--> GatsAI
  GatsAI --> TaskQueue
  GatsAI <--> vLLM
  vLLM --> Qwen
  GatsAI --> WebScraper
  GatsAI --> CodeGen

${classDefBase}`,

    infrastructure: `graph TB
  subgraph Home_Server ["Home Server"]
    Portainer["Portainer"]:::infra
    Prometheus["Prometheus"]:::monitor
    Grafana["Grafana"]:::monitor
    NodeExp["Node Exporter"]:::monitor

    Storage["Storage Volumes"]:::infra
    Network["Docker Networks"]:::infra
  end

  subgraph Mac_Studio ["Mac Studio"]
    LLM["LLM Engine"]:::ai_engine
    Workflow["AI Workflow"]:::ai_engine
  end

  NodeExp --> Prometheus
  Prometheus --> Grafana
  Home_Server <--> Mac_Studio

${classDefBase}`
  };

  return diagrams[type];
};

export default function ArchitectureDiagram() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>("full");
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mermaidRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent SSR rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function renderDiagram() {
      try {
        setIsLoaded(false);

        if (!mermaidRef.current) {
          const mermaid = (await import("mermaid")).default;
          mermaidRef.current = mermaid;
        }

        const isDark = theme === 'dark';
        const colors = isDark ? {
          primaryColor: '#27272A',
          primaryTextColor: '#FAFAFA',
          primaryBorderColor: '#3F3F46',
          lineColor: '#71717A',
          background: '#18181B',
        } : {
          primaryColor: '#FFFFFF',
          primaryTextColor: '#09090B',
          primaryBorderColor: '#E4E4E7',
          lineColor: '#71717A',
          background: '#FAFAFA',
        };

        mermaidRef.current.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: colors,
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            useMaxWidth: true,
          },
        });

        const diagramId = `arch-diagram-${selectedDiagram}-${theme}`;
        const definition = getDiagramDefinition(selectedDiagram, isDark);
        const { svg } = await mermaidRef.current.render(diagramId, definition);

        setSvgContent(svg);
        setIsLoaded(true);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setIsLoaded(true);
      }
    }

    renderDiagram();
  }, [selectedDiagram, theme, mounted]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const diagrams: { type: DiagramType; label: string }[] = [
    { type: "full", label: "Full System" },
    { type: "blog", label: "Blog" },
    { type: "gatsai", label: "AI Agent" },
    { type: "infrastructure", label: "Infrastructure" },
  ];

  if (!mounted) {
    return (
      <div className="bg-surface border border-border rounded p-6 animate-pulse">
        <div className="h-6 bg-hover rounded w-48 mb-8"></div>
        <div className="h-96 bg-hover rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded p-6 relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3
          className="text-lg font-semibold text-foreground flex items-center tracking-tight"
          style={{ fontFamily: 'Archivo, sans-serif' }}
        >
          <Network className="mr-3 text-accent" size={20} strokeWidth={1.5} />
          System Architecture
        </h3>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        {/* Diagram Selector */}
        <div className="flex gap-2">
          {diagrams.map((diagram) => (
            <button
              key={diagram.type}
              onClick={() => setSelectedDiagram(diagram.type)}
              className={`px-4 py-2 text-sm font-medium transition-all rounded cursor-pointer ${
                selectedDiagram === diagram.type
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground hover:bg-hover"
              }`}
            >
              {diagram.label}
            </button>
          ))}
        </div>

      </div>

      {/* Diagram Display */}
      {!isLoaded && (
        <div className="h-96 flex items-center justify-center">
          <div className="space-y-3 w-full max-w-md animate-pulse">
            <div className="h-3 bg-hover rounded"></div>
            <div className="h-3 bg-hover rounded w-5/6"></div>
            <div className="h-3 bg-hover rounded w-4/6"></div>
          </div>
        </div>
      )}

      {svgContent && isLoaded && (
        <div
          ref={containerRef}
          className="w-full overflow-hidden relative bg-background/50 rounded border border-border"
          style={{ cursor: isDragging ? "grabbing" : "grab", height: "500px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />

          {/* Floating Zoom Controls - Bottom Right Corner */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border hover:border-accent text-muted hover:text-accent transition-all rounded-lg shadow-lg cursor-pointer"
              aria-label="Zoom in"
              title="Zoom In"
            >
              <ZoomIn size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border hover:border-accent text-muted hover:text-accent transition-all rounded-lg shadow-lg cursor-pointer"
              aria-label="Reset view"
              title="Reset View"
            >
              <Maximize2 size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border hover:border-accent text-muted hover:text-accent transition-all rounded-lg shadow-lg cursor-pointer"
              aria-label="Zoom out"
              title="Zoom Out"
            >
              <ZoomOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-xs text-muted text-center">
        Click and drag to pan • Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}
