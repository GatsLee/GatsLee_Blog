"use client";

import { useEffect, useRef, useState } from "react";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type DiagramType = "full" | "blog" | "gatsai" | "infrastructure";

const DIAGRAM_DEFINITIONS: Record<DiagramType, string> = {
  full: `graph LR
    classDef default fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#d4d4dc
    classDef external fill:#1a1a2e,stroke:#8888a0,stroke-width:2px,color:#d4d4dc
    classDef gateway fill:#3d2e1a,stroke:#d4a054,stroke-width:2px,color:#d4d4dc
    classDef app fill:#1a2e2a,stroke:#5ab896,stroke-width:2px,color:#d4d4dc
    classDef agent fill:#2e1a3d,stroke:#a078c8,stroke-width:2px,color:#d4d4dc
    classDef ai_engine fill:#1a1a3d,stroke:#7878b8,stroke-width:2px,color:#d4d4dc
    classDef infra fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#b0b0bc

    User((User / Internet)):::external

    subgraph Home_Server ["🏠 Home Server (Main Host)"]
        direction TB

        subgraph Service_Layer ["Service & Logic Layer"]
            direction LR
            NPM[/"Nginx Proxy<br/>Manager"/]:::gateway

            subgraph Apps ["Web Services"]
                direction TB
                BlogApp["Tech Blog"]:::app
                Portfolio["Portfolio"]:::app
            end

            GatsAI["🤖 Gats AI Agent<br/>(Orchestrator)"]:::agent
        end

        subgraph Infra_Layer ["Infrastructure (Docker Containers)"]
            direction LR
            Portainer["Portainer"]:::infra
            Prometheus["Prometheus"]:::infra
            Grafana["Grafana"]:::infra
            NodeExp["Node-Exporter"]:::infra
        end
    end

    subgraph Mac_Studio ["🍎 Mac Studio (AI Brain)"]
        direction TB
        LLM_Engine["LLM Inference Engine<br/>(vLLM / Qwen 2.5)"]:::ai_engine
        AI_Workflow["AI Workflow & Ops"]:::ai_engine
    end

    style Home_Server fill:#22223a,stroke:#3a3a52,color:#d4d4dc
    style Mac_Studio fill:#22223a,stroke:#7878b8,color:#d4d4dc
    style Service_Layer fill:transparent,stroke:none,color:#d4d4dc
    style Infra_Layer fill:#2a2a42,stroke:#3a3a52,stroke-dasharray: 5 5,color:#b0b0bc
    style Apps fill:transparent,stroke:none,color:#d4d4dc

    User ==> NPM
    User <== "Direct API" ==> GatsAI

    NPM --> BlogApp
    NPM --> Portfolio

    BlogApp <--> GatsAI
    Portfolio <--> GatsAI

    GatsAI <== "Inference API" ==> LLM_Engine

    NodeExp -.-> Prometheus
    Prometheus -.-> Grafana

    linkStyle default stroke:#6a6a8a,stroke-width:2px,fill:none`,

  blog: `graph TB
    classDef default fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#d4d4dc
    classDef external fill:#1a1a2e,stroke:#8888a0,stroke-width:2px,color:#d4d4dc
    classDef gateway fill:#3d2e1a,stroke:#d4a054,stroke-width:2px,color:#d4d4dc
    classDef app fill:#1a2e2a,stroke:#5ab896,stroke-width:2px,color:#d4d4dc
    classDef db fill:#1a2e3d,stroke:#5a9ab8,stroke-width:2px,color:#d4d4dc

    User((User)):::external

    subgraph Blog_Stack ["📝 Tech Blog Architecture"]
        direction TB

        NPM[/"Nginx Proxy Manager<br/>(Reverse Proxy)"/]:::gateway

        subgraph Frontend ["Frontend Layer"]
            NextJS["Next.js 16<br/>(App Router)"]:::app
            React["React 19<br/>(Server Components)"]:::app
        end

        subgraph Backend ["Backend Layer"]
            API["API Routes<br/>(REST)"]:::app
            Auth["JWT Auth<br/>(jose)"]:::app
        end

        subgraph Data ["Data Layer"]
            Prisma["Prisma ORM"]:::db
            SQLite["SQLite<br/>(blog.db)"]:::db
        end
    end

    User --> NPM
    NPM --> NextJS
    NextJS --> React
    NextJS --> API
    API --> Auth
    API --> Prisma
    Prisma --> SQLite

    style Blog_Stack fill:#22223a,stroke:#3a3a52,color:#d4d4dc
    style Frontend fill:transparent,stroke:#3a3a52,stroke-dasharray: 3 3,color:#d4d4dc
    style Backend fill:transparent,stroke:#3a3a52,stroke-dasharray: 3 3,color:#d4d4dc
    style Data fill:transparent,stroke:#3a3a52,stroke-dasharray: 3 3,color:#d4d4dc

    linkStyle default stroke:#6a6a8a,stroke-width:2px,fill:none`,

  gatsai: `graph LR
    classDef default fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#d4d4dc
    classDef external fill:#1a1a2e,stroke:#8888a0,stroke-width:2px,color:#d4d4dc
    classDef agent fill:#2e1a3d,stroke:#a078c8,stroke-width:2px,color:#d4d4dc
    classDef ai fill:#1a1a3d,stroke:#7878b8,stroke-width:2px,color:#d4d4dc
    classDef tool fill:#3d2e1a,stroke:#d4a054,stroke-width:2px,color:#d4d4dc

    User((User / API)):::external

    subgraph AI_System ["🤖 Gats AI Agent System"]
        direction TB

        subgraph Orchestration ["Agent Orchestration"]
            GatsAI["Gats AI<br/>(Main Agent)"]:::agent
            TaskQueue["Task Queue<br/>(Async)"]:::agent
        end

        subgraph LLM_Layer ["LLM Backend"]
            direction LR
            vLLM["vLLM Server<br/>(Mac Studio)"]:::ai
            Qwen["Qwen 2.5<br/>(7B/14B)"]:::ai
        end

        subgraph Tools ["Agent Tools"]
            direction LR
            WebScraper["Web Scraper"]:::tool
            CodeGen["Code Generator"]:::tool
            FileOps["File Operations"]:::tool
        end
    end

    User <--> GatsAI
    GatsAI --> TaskQueue
    GatsAI <--> vLLM
    vLLM --> Qwen
    GatsAI --> WebScraper
    GatsAI --> CodeGen
    GatsAI --> FileOps

    style AI_System fill:#22223a,stroke:#3a3a52,color:#d4d4dc
    style Orchestration fill:transparent,stroke:none,color:#d4d4dc
    style LLM_Layer fill:#2a2a42,stroke:#7878b8,stroke-dasharray: 3 3,color:#d4d4dc
    style Tools fill:transparent,stroke:none,color:#d4d4dc

    linkStyle default stroke:#6a6a8a,stroke-width:2px,fill:none`,

  infrastructure: `graph TB
    classDef default fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#d4d4dc
    classDef infra fill:#2a2a42,stroke:#4a4a6a,stroke-width:1px,color:#b0b0bc
    classDef monitor fill:#1a3d2a,stroke:#5ab896,stroke-width:2px,color:#d4d4dc
    classDef ai_engine fill:#1a1a3d,stroke:#7878b8,stroke-width:2px,color:#d4d4dc

    subgraph Home_Server ["🏠 Home Server Infrastructure"]
        direction TB

        subgraph Container_Layer ["Docker Containers"]
            direction LR
            Portainer["Portainer<br/>(Management)"]:::infra
            Prometheus["Prometheus<br/>(Metrics)"]:::monitor
            Grafana["Grafana<br/>(Visualization)"]:::monitor
            NodeExp["Node-Exporter<br/>(Host Metrics)"]:::monitor
        end

        Storage["Storage Layer<br/>(Volumes & Bind Mounts)"]:::infra
        Network["Docker Networks<br/>(Bridge & Host)"]:::infra
    end

    subgraph Mac_Studio ["🍎 Mac Studio (AI Infrastructure)"]
        direction TB
        LLM["LLM Inference Engine<br/>(vLLM / Qwen 2.5)"]:::ai_engine
        Workflow["AI Workflow Engine<br/>(Automation)"]:::ai_engine
    end

    NodeExp --> Prometheus
    Prometheus --> Grafana
    Container_Layer --> Storage
    Container_Layer --> Network

    Home_Server <--> Mac_Studio

    style Home_Server fill:#22223a,stroke:#3a3a52,color:#d4d4dc
    style Mac_Studio fill:#22223a,stroke:#7878b8,color:#d4d4dc
    style Container_Layer fill:transparent,stroke:#3a3a52,stroke-dasharray: 5 5,color:#b0b0bc

    linkStyle default stroke:#6a6a8a,stroke-width:2px,fill:none`
};

// Edge indices that should have streaming animation for each diagram type
const ACTIVE_EDGE_INDICES: Record<DiagramType, number[]> = {
  full: [0, 2, 3, 7, 8],
  blog: [0, 1, 2, 3],
  gatsai: [0, 1, 2],
  infrastructure: [0, 1]
};

function addStreamingClasses(svgString: string, diagramType: DiagramType): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "text/html");
  const edgeGroups = doc.querySelectorAll(".edgePaths > g");
  const activeIndices = ACTIVE_EDGE_INDICES[diagramType];
  edgeGroups.forEach((group, index) => {
    if (activeIndices.includes(index)) {
      const path = group.querySelector("path");
      if (path) {
        path.classList.add("streaming-edge");
      }
    }
  });
  const svgEl = doc.querySelector("svg");
  return svgEl ? svgEl.outerHTML : svgString;
}

export default function ArchitectureDiagram() {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType>("full");
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mermaidRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function renderDiagram() {
      try {
        setIsLoaded(false);

        if (!mermaidRef.current) {
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              primaryColor: "#2a2a42",
              primaryTextColor: "#d4d4dc",
              primaryBorderColor: "#3a3a52",
              lineColor: "#6a6a8a",
              secondaryColor: "#22223a",
              tertiaryColor: "#1a1a2e",
              background: "#1a1a2e",
              mainBkg: "#2a2a42",
              nodeBorder: "#3a3a52",
              clusterBkg: "#22223a",
              clusterBorder: "#3a3a52",
              titleColor: "#d4d4dc",
              edgeLabelBackground: "#22223a",
            },
            flowchart: {
              htmlLabels: true,
              curve: "basis",
              useMaxWidth: true,
            },
          });
          mermaidRef.current = mermaid;
        }

        const diagramId = `arch-diagram-${selectedDiagram}`;
        const { svg } = await mermaidRef.current.render(
          diagramId,
          DIAGRAM_DEFINITIONS[selectedDiagram]
        );
        const animatedSvg = addStreamingClasses(svg, selectedDiagram);
        setSvgContent(animatedSvg);
        setIsLoaded(true);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setIsLoaded(true);
      }
    }

    renderDiagram();
  }, [selectedDiagram]);

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
    { type: "blog", label: "Tech Blog" },
    { type: "gatsai", label: "Gats AI" },
    { type: "infrastructure", label: "Infrastructure" },
  ];

  return (
    <div className="mermaid-container bg-[#22223a] border border-[#2e2e4a] rounded-lg p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#d4d4dc] flex items-center">
          <Network className="mr-2 text-[#d4a054]" size={18} />
          SYSTEM ARCHITECTURE
        </h3>
        <span className="text-[10px] font-mono text-[#5a5a72] uppercase tracking-wider">
          Infrastructure Map
        </span>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Toggle Buttons */}
        <div className="flex gap-2 flex-wrap">
          {diagrams.map((diagram) => (
            <button
              key={diagram.type}
              onClick={() => setSelectedDiagram(diagram.type)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded cursor-pointer ${
                selectedDiagram === diagram.type
                  ? "bg-[#d4a054] text-[#1a1a2e] font-bold"
                  : "bg-[#2e2e4a] text-[#8888a0] hover:bg-[#3a3a5a] hover:text-[#d4d4dc]"
              }`}
            >
              {diagram.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-[#2e2e4a] text-[#8888a0] hover:bg-[#3a3a5a] hover:text-[#d4d4dc] transition-colors rounded cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-[#2e2e4a] text-[#8888a0] hover:bg-[#3a3a5a] hover:text-[#d4d4dc] transition-colors rounded cursor-pointer"
            title="Reset View"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-[#2e2e4a] text-[#8888a0] hover:bg-[#3a3a5a] hover:text-[#d4d4dc] transition-colors rounded cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {!isLoaded && (
        <div className="h-64 flex items-center justify-center text-[#5a5a72] font-mono text-sm animate-pulse">
          Rendering architecture diagram...
        </div>
      )}

      {svgContent ? (
        <div
          ref={containerRef}
          className="w-full overflow-hidden relative"
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
        </div>
      ) : (
        isLoaded && (
          <div className="h-32 flex items-center justify-center text-[#5a5a72] font-mono text-sm">
            Failed to render diagram.
          </div>
        )
      )}

      <div className="mt-4 text-[10px] text-[#5a5a72] font-mono text-center">
        Click and drag to pan • Use zoom controls to adjust view • Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}
