import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sigmafy/auth",
    "@sigmafy/db",
    "@sigmafy/stats-gateway",
    "@sigmafy/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
