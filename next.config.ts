import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // Allow serving images from the public directory
    unoptimized: true
  }
};

export default nextConfig;
