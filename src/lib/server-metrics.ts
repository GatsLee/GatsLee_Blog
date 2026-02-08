import os from "os";
import { execSync } from "child_process";

export interface ServerMetrics {
  cpu: {
    model: string;
    cores: number;
    temperature: number | null;
  };
  memory: {
    total: number;
    used: number;
    percentage: string;
  };
  disk: {
    used: string;
    total: string;
    percentage: string;
  };
  uptime: number;
  containers: { name: string; status: string }[];
  kernel: string;
}

export function getServerMetrics(): ServerMetrics {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  // CPU temperature (Linux only)
  let cpuTemp: number | null = null;
  try {
    const temp = execSync("cat /sys/class/thermal/thermal_zone0/temp", {
      timeout: 2000,
    })
      .toString()
      .trim();
    cpuTemp = parseInt(temp) / 1000;
  } catch {
    // Not on Linux or no sensor
  }

  // Docker containers
  let containers: { name: string; status: string }[] = [];
  try {
    const output = execSync("docker ps --format '{{.Names}}|{{.Status}}'", {
      timeout: 5000,
    })
      .toString()
      .trim();
    if (output) {
      containers = output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [name, status] = line.split("|");
          return { name, status };
        });
    }
  } catch {
    // Docker not available
  }

  // Disk usage
  let disk = { used: "N/A", total: "N/A", percentage: "N/A" };
  try {
    const output = execSync("df -h / | tail -1", { timeout: 2000 })
      .toString()
      .trim();
    const parts = output.split(/\s+/);
    if (parts.length >= 5) {
      disk = { total: parts[1], used: parts[2], percentage: parts[4] };
    }
  } catch {
    // Windows or error
  }

  // Kernel version
  let kernel = "Unknown";
  try {
    kernel = execSync("uname -r", { timeout: 2000 }).toString().trim();
  } catch {
    kernel = `${os.type()} ${os.release()}`;
  }

  return {
    cpu: {
      model: cpus[0]?.model || "Unknown",
      cores: cpus.length,
      temperature: cpuTemp,
    },
    memory: {
      total: totalMem,
      used: usedMem,
      percentage: ((usedMem / totalMem) * 100).toFixed(1),
    },
    disk,
    uptime: os.uptime(),
    containers,
    kernel,
  };
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

export function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
}
