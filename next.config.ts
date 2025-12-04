import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  
  // Compress output
  compress: true,
  
  // Production optimizations
  reactStrictMode: true,
  // Note: swcMinify is default in Next.js 13+, removed
};

export default nextConfig;
