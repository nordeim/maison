/**
 * Maison — ESLint v9 Flat Config Entry Point (apps/web)
 *
 * Consumes the shared Maison ESLint config directly (flat config), not via
 * the legacy FlatCompat shim. The shared config is exported as a flat-config
 * array from tooling/eslint/index.js (TypeScript strict, React 19, Next.js 16,
 * Tailwind CSS v4, Import order). Mirrors the Stillwater reference pattern.
 */

import sharedConfig from "@maison/eslint-config";

export default [
  ...sharedConfig,

  {
    ignores: [".next/**", "node_modules/**", "dist/**", ".turbo/**"],
  },
];
