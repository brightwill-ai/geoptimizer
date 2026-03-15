import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Skip TS check during `next build` — already done in CI before deploy
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
