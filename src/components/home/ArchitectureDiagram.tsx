"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "lucide-react";

const DIAGRAM_DEFINITION = `graph LR
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

    linkStyle default stroke:#6a6a8a,stroke-width:2px,fill:none`;

// Edge indices that should have streaming animation
// 0: User→NPM, 2: NPM→Blog, 3: NPM→Portfolio, 7: NodeExp→Prometheus, 8: Prometheus→Grafana
const ACTIVE_EDGE_INDICES = [0, 2, 3, 7, 8];

function addStreamingClasses(svgString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "text/html");
  const edgeGroups = doc.querySelectorAll(".edgePaths > g");
  edgeGroups.forEach((group, index) => {
    if (ACTIVE_EDGE_INDICES.includes(index)) {
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
  const hasRendered = useRef(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;

    async function renderDiagram() {
      try {
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

        const { svg } = await mermaid.render(
          "arch-diagram",
          DIAGRAM_DEFINITION
        );
        const animatedSvg = addStreamingClasses(svg);
        setSvgContent(animatedSvg);
        setIsLoaded(true);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setIsLoaded(true);
      }
    }

    renderDiagram();
  }, []);

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

      {!isLoaded && (
        <div className="h-64 flex items-center justify-center text-[#5a5a72] font-mono text-sm animate-pulse">
          Rendering architecture diagram...
        </div>
      )}

      {svgContent ? (
        <div
          className="w-full overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        isLoaded && (
          <div className="h-32 flex items-center justify-center text-[#5a5a72] font-mono text-sm">
            Failed to render diagram.
          </div>
        )
      )}
    </div>
  );
}
