import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Оптимізовані фото зберігаються в кеші місяць, а не кілька годин.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      new URL('https://kpnl145.kyiv.ua/**'),
    ],
  },
};

export default nextConfig;
