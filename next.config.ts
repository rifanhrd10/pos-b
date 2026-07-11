import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Temporarily disabled to test Server Actions
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/wilayah/:path*",
        destination: "https://wilayah.id/api/:path*",
      },
    ];
  },
};

export default nextConfig;
