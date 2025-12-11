import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "www.thiings.co", 
      "images.unsplash.com", 
      "c0.wallpaperflare.com",
      "limitless-clownfish-302.convex.cloud", // Add your Convex domain
    ],
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
      {
        protocol: "https",
        hostname: "*.convex.cloud", // This covers all Convex deployments
      },
    ],
  },
};

export default nextConfig;