import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://kpnl145.kyiv.ua/**'),
    ],
  },
};

export default nextConfig;
