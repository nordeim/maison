import type { Config } from "tailwindcss";
import { maisonBase } from "@maison/tailwind-config/base";

// Tailwind v4 is CSS-first — most config lives in globals.css @theme.
// This file only declares content paths (scanned for class names).
const config: Omit<Config, "theme"> & { content: Config["content"] } = {
  ...maisonBase,
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./next-env.d.ts",
  ],
};

export default config;
