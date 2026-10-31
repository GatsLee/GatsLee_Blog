import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // 캐릭터 일러스트는 90으로 압축한다 (나머지 기본 75)
  images: { qualities: [75, 90] },
};

export default nextConfig;
