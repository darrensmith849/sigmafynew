import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sigmafy/ai",
    "@sigmafy/auth",
    "@sigmafy/billing",
    "@sigmafy/db",
    "@sigmafy/emails",
    "@sigmafy/stats-gateway",
    "@sigmafy/ui",
  ],
  typedRoutes: true,
};

export default nextConfig;
