import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return [
      { source: "/generate", destination: "/internal/generate", permanent: false },
      { source: "/designs", destination: "/internal/designs", permanent: false },
      { source: "/design/:id", destination: "/internal/design/:id", permanent: false },
    ];
  },
};

export default nextConfig;
