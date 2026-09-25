import type { NextConfig } from "next";

// Сховище Supabase, звідки беруться завантажені з кабінету фото.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Оптимізовані фото зберігаються в кеші місяць, а не кілька годин.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      ...(supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : []),
      new URL('https://kpnl145.kyiv.ua/**'),
    ],
  },
};

export default nextConfig;
