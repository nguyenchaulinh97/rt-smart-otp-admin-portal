import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Monorepo: trỏ root Turbopack về package này để tránh cảnh báo multi lockfile */
const packageDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: packageDir,
  },
};

export default nextConfig;
