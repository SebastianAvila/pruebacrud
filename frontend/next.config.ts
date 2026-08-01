import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Al proyecto hay dos lockfiles (raíz del repo y frontend/), así que
     Next no detecta correctamente el root del app con Turbopack. */
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
