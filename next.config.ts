import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["www.thiings.co", "images.unsplash.com", "c0.wallpaperflare.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.thiings.co",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "c0.wallpaperflare.com",
      },
    ],
  },
};

export default nextConfig;
