import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sigmafy/ai", "@sigmafy/auth", "@sigmafy/db", "@sigmafy/ui"],
  typedRoutes: true,
};

export default nextConfig;
