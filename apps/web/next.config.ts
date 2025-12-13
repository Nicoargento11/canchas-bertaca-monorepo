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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
