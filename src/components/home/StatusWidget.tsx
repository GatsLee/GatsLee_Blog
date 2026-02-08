import { ReactNode } from "react";

interface StatusWidgetProps {
  title: string;
  value: string;
  sub: string;
  icon: ReactNode;
}

export default function StatusWidget({
  title,
  value,
  sub,
  icon,
}: StatusWidgetProps) {
  return (
    <div className="bg-black border border-gray-800 p-5 hover:border-white transition-colors group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity text-white">
        {icon}
      </div>
      <p className="text-[10px] text-gray-500 font-mono mb-1">{title}</p>
      <p className="text-2xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
        {value}
      </p>
      <p className="text-[10px] text-gray-600 font-mono">{sub}</p>
    </div>
  );
}
