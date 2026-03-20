import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Monorepo: trỏ root Turbopack về package này để tránh cảnh báo multi lockfile */
const packageDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: packageDir,
  },

  /**
   * Rewrite /api/v1/* → backend thật.
   * Dùng khi NEXT_PUBLIC_AUTH_API_BASE_URL rỗng (relative path) để tránh CORS.
   * Nếu NEXT_PUBLIC_AUTH_API_BASE_URL đã có origin thì browser gọi thẳng, rewrite không ảnh hưởng.
   */
  async rewrites() {
    const upstream = process.env.AUTH_UPSTREAM_BASE?.trim();
    if (!upstream) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${upstream.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
