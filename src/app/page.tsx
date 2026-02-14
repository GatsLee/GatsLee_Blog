import BootSequence from "@/components/home/BootSequence";
import HomeContent from "@/components/home/HomeContent";
import { getServerMetrics, formatUptime, formatBytes } from "@/lib/server-metrics";

export default function HomePage() {
  let metrics;
  try {
    metrics = getServerMetrics();
  } catch {
    metrics = null;
  }

  // Calculate RAM percentage
  const ramPercentage = metrics
    ? Math.round((metrics.memory.used / metrics.memory.total) * 100)
    : 0;

  const homeServerMetrics = [
    { label: "UPTIME", value: metrics ? formatUptime(metrics.uptime) : "N/A" },
    { label: "CONTAINERS", value: metrics ? `${metrics.containers.length} active` : "N/A" },
    {
      label: "RAM",
      value: metrics
        ? `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`
        : "N/A",
      percentage: ramPercentage,
    },
  ];

  const aiMetrics = [
    { label: "TOKEN IN", value: "\u2014" },
    { label: "TOKEN OUT", value: "\u2014" },
    { label: "TOKEN/S", value: "\u2014" },
    { label: "MODEL", value: "\u2014" },
  ];

  return (
    <BootSequence>
      <HomeContent
        homeServerMetrics={homeServerMetrics}
        aiMetrics={aiMetrics}
      />
    </BootSequence>
  );
}
