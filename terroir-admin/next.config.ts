import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Админка живёт на том же домене, что и Astro-сайт: example.com/admin
  basePath: "/admin",
  output: "standalone",
  experimental: {
    serverActions: {
      // фото вина до 5 МБ + накладные расходы multipart (по умолчанию лимит 1 МБ)
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
