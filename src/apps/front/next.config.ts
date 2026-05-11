import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pmv-ads-2026-1-e4-proj-infra-t3-meupj',
  images: {
    unoptimized: true,
  },
  // Note: Rewrites are not supported in static exports.
  // API calls should use the full URL from NEXT_PUBLIC_API_URL.
};

export default nextConfig;
