import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "x1gj7r8c-3000.brs.devtunnels.ms",
        "localhost:3000",
        "https://canchas-bertaca-monorepo-web.vercel.app",
      ],
    },
  },
  /* config options here */
};

export default nextConfig;
