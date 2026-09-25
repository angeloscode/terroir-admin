import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Админка живёт на том же домене, что и Astro-сайт: example.com/admin
  basePath: "/admin",
  output: "standalone",
};

export default nextConfig;
