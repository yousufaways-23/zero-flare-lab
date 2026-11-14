import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Cloudflare Workers deployment: no sharp/native image pipeline at the edge —
  // all imagery is pre-sized static media, served via Workers Static Assets.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
