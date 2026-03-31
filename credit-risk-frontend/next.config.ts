// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const renderApiUrl = process.env.RENDER_API_URL;

    if (!renderApiUrl) {
      console.warn(
        "[next.config] RENDER_API_URL is not set — /backend/* rewrites disabled"
      );
      return [];
    }

    console.log(`[next.config] Proxying /backend/* → ${renderApiUrl}`);

    return [
      {
        source:      "/backend/:path*",
        destination: `${renderApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;