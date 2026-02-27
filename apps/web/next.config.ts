import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace TypeScript packages
  transpilePackages: ["@odin/db", "@odin/config", "@odin/types"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              // Allow cap.dsd.dev iframes for show-and-tell wall (Session 7)
              "frame-src https://cap.dsd.dev",
              "connect-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
